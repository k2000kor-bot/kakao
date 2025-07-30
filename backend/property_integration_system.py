import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
import logging
import sqlite3
from pathlib import Path
import re
import hashlib
from bs4 import BeautifulSoup
import time

from redevelopment_ai_specialist import RedevelopmentAISpecialist
from personalized_investment_advisor import PersonalizedInvestmentAdvisor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PropertyListing:
    """부동산 매물 정보"""
    listing_id: str
    title: str
    address: str
    property_type: str  # 아파트, 오피스텔, 빌라, 단독주택
    transaction_type: str  # 매매, 전세, 월세
    price: float  # 억원
    deposit: float  # 보증금 (전세/월세)
    monthly_rent: float  # 월세
    area_pyeong: float  # 평수
    area_sqm: float  # 제곱미터
    floor: str  # 층수
    building_year: int  # 건축년도
    description: str
    images: List[str]
    contact_info: str
    listing_date: datetime
    source: str  # 매물 출처 (네이버, 직방 등)
    url: str
    coordinates: Optional[Dict[str, float]]  # 위도, 경도
    ai_analysis: Optional[Dict[str, Any]] = None


@dataclass
class PropertyAlert:
    """매물 알림"""
    alert_id: str
    user_id: str
    criteria: Dict[str, Any]
    is_active: bool
    created_at: datetime
    last_checked: datetime
    matches_found: int


class PropertyIntegrationSystem:
    """부동산 매물 통합 시스템"""
    
    def __init__(self, db_path: str = "property_listings.db"):
        self.db_path = db_path
        self.session: Optional[aiohttp.ClientSession] = None
        
        # AI 분석 시스템들
        self.ai_specialist = RedevelopmentAISpecialist()
        self.investment_advisor = PersonalizedInvestmentAdvisor()
        
        # 매물 포털 설정
        self.portals = self._initialize_portals()
        
        # 데이터베이스 초기화
        self.init_database()
        
        # 알림 콜백 함수들
        self.alert_callbacks: List[Callable] = []
        
    def _initialize_portals(self) -> Dict[str, Dict[str, Any]]:
        """부동산 포털 설정 초기화"""
        return {
            "naver": {
                "base_url": "https://land.naver.com",
                "search_endpoint": "/api/search",
                "enabled": True,
                "rate_limit": 1.0  # 초당 요청 제한
            },
            "zigbang": {
                "base_url": "https://apis.zigbang.com",
                "search_endpoint": "/v3/items",
                "enabled": True,
                "rate_limit": 2.0
            },
            "dabang": {
                "base_url": "https://www.dabangapp.com",
                "search_endpoint": "/api/search",
                "enabled": True,
                "rate_limit": 1.5
            }
        }
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 매물 정보 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS property_listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                listing_id TEXT UNIQUE,
                title TEXT,
                address TEXT,
                property_type TEXT,
                transaction_type TEXT,
                price REAL,
                deposit REAL,
                monthly_rent REAL,
                area_pyeong REAL,
                area_sqm REAL,
                floor TEXT,
                building_year INTEGER,
                description TEXT,
                images TEXT,
                contact_info TEXT,
                listing_date TEXT,
                source TEXT,
                url TEXT,
                coordinates TEXT,
                ai_analysis TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        
        # 매물 알림 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS property_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id TEXT UNIQUE,
                user_id TEXT,
                criteria TEXT,
                is_active BOOLEAN,
                created_at TEXT,
                last_checked TEXT,
                matches_found INTEGER
            )
        ''')
        
        # 매물 관심 목록 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS property_favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                listing_id TEXT,
                added_at TEXT,
                notes TEXT,
                UNIQUE(user_id, listing_id)
            )
        ''')
        
        # 가격 변동 이력 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                listing_id TEXT,
                price REAL,
                deposit REAL,
                monthly_rent REAL,
                recorded_at TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        
    async def start_session(self):
        """HTTP 세션 시작"""
        if not self.session:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            self.session = aiohttp.ClientSession(headers=headers)
            
    async def close_session(self):
        """HTTP 세션 종료"""
        if self.session:
            await self.session.close()
            self.session = None
            
    async def search_properties(self, search_criteria: Dict[str, Any]) -> List[PropertyListing]:
        """매물 검색"""
        if not self.session:
            await self.start_session()
            
        all_properties = []
        
        for portal_name, portal_config in self.portals.items():
            if not portal_config["enabled"]:
                continue
                
            try:
                logger.info(f"{portal_name}에서 매물 검색 시작")
                properties = await self._search_portal(portal_name, search_criteria)
                
                # AI 자동 분석 수행
                for prop in properties:
                    prop.ai_analysis = await self._analyze_property(prop)
                    
                all_properties.extend(properties)
                
                # 레이트 리밋 준수
                await asyncio.sleep(portal_config["rate_limit"])
                
            except Exception as e:
                logger.error(f"{portal_name} 검색 실패: {e}")
                continue
                
        # 중복 제거 (주소 기준)
        unique_properties = self._remove_duplicates(all_properties)
        
        # 데이터베이스에 저장
        await self._save_properties(unique_properties)
        
        return unique_properties
        
    async def _search_portal(self, portal_name: str, criteria: Dict[str, Any]) -> List[PropertyListing]:
        """개별 포털에서 매물 검색"""
        
        if portal_name == "naver":
            return await self._search_naver(criteria)
        elif portal_name == "zigbang":
            return await self._search_zigbang(criteria)
        elif portal_name == "dabang":
            return await self._search_dabang(criteria)
        else:
            return []
            
    async def _search_naver(self, criteria: Dict[str, Any]) -> List[PropertyListing]:
        """네이버 부동산 검색 (실제 구현시 API 또는 크롤링)"""
        # 실제 구현시에는 네이버 부동산 API 사용
        # 여기서는 샘플 데이터 반환
        
        sample_properties = []
        
        for i in range(3):  # 샘플 3개
            listing = PropertyListing(
                listing_id=f"naver_{datetime.now().strftime('%Y%m%d')}_{i:03d}",
                title=f"강남구 압구정동 아파트 {i+1}",
                address=f"서울시 강남구 압구정동 {100+i}번지",
                property_type="아파트",
                transaction_type="매매",
                price=15.0 + i * 0.5,
                deposit=0,
                monthly_rent=0,
                area_pyeong=84.2,
                area_sqm=278.5,
                floor=f"{i+5}층",
                building_year=2005 + i,
                description=f"깨끗하고 좋은 아파트입니다. 남향, 역세권 도보 5분",
                images=[f"https://example.com/image_{i}.jpg"],
                contact_info="010-1234-5678",
                listing_date=datetime.now() - timedelta(days=i),
                source="naver",
                url=f"https://land.naver.com/article/{i}",
                coordinates={"lat": 37.5273, "lng": 127.0384}
            )
            sample_properties.append(listing)
            
        return sample_properties
        
    async def _search_zigbang(self, criteria: Dict[str, Any]) -> List[PropertyListing]:
        """직방 검색"""
        # 실제 직방 API 연동 로직
        return []
        
    async def _search_dabang(self, criteria: Dict[str, Any]) -> List[PropertyListing]:
        """다방 검색"""
        # 실제 다방 API 연동 로직
        return []
        
    def _remove_duplicates(self, properties: List[PropertyListing]) -> List[PropertyListing]:
        """중복 매물 제거"""
        seen_addresses = set()
        unique_properties = []
        
        for prop in properties:
            # 주소 정규화
            normalized_address = re.sub(r'\s+', '', prop.address.lower())
            address_hash = hashlib.md5(normalized_address.encode()).hexdigest()
            
            if address_hash not in seen_addresses:
                seen_addresses.add(address_hash)
                unique_properties.append(prop)
                
        return unique_properties
        
    async def _analyze_property(self, property_listing: PropertyListing) -> Dict[str, Any]:
        """매물 AI 자동 분석"""
        try:
            # 부동산 데이터 변환
            property_data = {
                "location": property_listing.address,
                "type": property_listing.property_type,
                "age": datetime.now().year - property_listing.building_year,
                "size": property_listing.area_pyeong,
                "price": property_listing.price
            }
            
            # AI 전방위 분석 수행
            holistic_analysis = self.ai_specialist.holistic_market_analysis(property_data)
            
            # 분석 결과 요약
            analysis_summary = {
                "overall_score": holistic_analysis["holistic_assessment"]["holistic_score"],
                "grade": holistic_analysis["holistic_assessment"]["grade"],
                "investment_recommendation": holistic_analysis["holistic_assessment"]["rating"],
                "market_timing": holistic_analysis["market_timing"]["timing_assessment"],
                "key_advantages": holistic_analysis["holistic_assessment"]["competitive_advantages"],
                "sentiment_score": holistic_analysis["market_sentiment"]["sentiment_score"],
                "risk_level": "낮음",  # 리스크 매트릭스에서 추출
                "analysis_date": datetime.now().isoformat()
            }
            
            return analysis_summary
            
        except Exception as e:
            logger.error(f"매물 분석 실패: {e}")
            return {"error": str(e), "analysis_date": datetime.now().isoformat()}
            
    async def _save_properties(self, properties: List[PropertyListing]):
        """매물 정보 데이터베이스 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for prop in properties:
            try:
                # 기존 매물 확인
                cursor.execute(
                    "SELECT id, price, deposit, monthly_rent FROM property_listings WHERE listing_id = ?",
                    (prop.listing_id,)
                )
                existing = cursor.fetchone()
                
                current_time = datetime.now().isoformat()
                
                if existing:
                    # 가격 변동 확인
                    old_price, old_deposit, old_rent = existing[1], existing[2], existing[3]
                    if (old_price != prop.price or 
                        old_deposit != prop.deposit or 
                        old_rent != prop.monthly_rent):
                        
                        # 가격 변동 이력 저장
                        cursor.execute('''
                            INSERT INTO price_history 
                            (listing_id, price, deposit, monthly_rent, recorded_at)
                            VALUES (?, ?, ?, ?, ?)
                        ''', (prop.listing_id, prop.price, prop.deposit, 
                              prop.monthly_rent, current_time))
                    
                    # 매물 정보 업데이트
                    cursor.execute('''
                        UPDATE property_listings SET
                        title=?, address=?, property_type=?, transaction_type=?,
                        price=?, deposit=?, monthly_rent=?, area_pyeong=?, area_sqm=?,
                        floor=?, building_year=?, description=?, images=?, contact_info=?,
                        listing_date=?, source=?, url=?, coordinates=?, ai_analysis=?,
                        updated_at=?
                        WHERE listing_id=?
                    ''', (
                        prop.title, prop.address, prop.property_type, prop.transaction_type,
                        prop.price, prop.deposit, prop.monthly_rent, prop.area_pyeong, prop.area_sqm,
                        prop.floor, prop.building_year, prop.description, 
                        json.dumps(prop.images), prop.contact_info,
                        prop.listing_date.isoformat(), prop.source, prop.url,
                        json.dumps(prop.coordinates) if prop.coordinates else None,
                        json.dumps(prop.ai_analysis) if prop.ai_analysis else None,
                        current_time, prop.listing_id
                    ))
                else:
                    # 새 매물 저장
                    cursor.execute('''
                        INSERT INTO property_listings 
                        (listing_id, title, address, property_type, transaction_type,
                         price, deposit, monthly_rent, area_pyeong, area_sqm,
                         floor, building_year, description, images, contact_info,
                         listing_date, source, url, coordinates, ai_analysis,
                         created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        prop.listing_id, prop.title, prop.address, prop.property_type, prop.transaction_type,
                        prop.price, prop.deposit, prop.monthly_rent, prop.area_pyeong, prop.area_sqm,
                        prop.floor, prop.building_year, prop.description,
                        json.dumps(prop.images), prop.contact_info,
                        prop.listing_date.isoformat(), prop.source, prop.url,
                        json.dumps(prop.coordinates) if prop.coordinates else None,
                        json.dumps(prop.ai_analysis) if prop.ai_analysis else None,
                        current_time, current_time
                    ))
                    
            except Exception as e:
                logger.error(f"매물 저장 실패 {prop.listing_id}: {e}")
                continue
                
        conn.commit()
        conn.close()
        
    def create_property_alert(self, user_id: str, criteria: Dict[str, Any]) -> str:
        """매물 알림 생성"""
        alert_id = f"alert_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO property_alerts 
            (alert_id, user_id, criteria, is_active, created_at, last_checked, matches_found)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert_id, user_id, json.dumps(criteria), True,
            datetime.now().isoformat(), datetime.now().isoformat(), 0
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"매물 알림 생성: {alert_id}")
        return alert_id
        
    async def check_alerts(self):
        """매물 알림 확인"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 활성 알림 조회
        cursor.execute('''
            SELECT alert_id, user_id, criteria 
            FROM property_alerts 
            WHERE is_active = 1
        ''')
        
        active_alerts = cursor.fetchall()
        
        for alert_id, user_id, criteria_json in active_alerts:
            criteria = json.loads(criteria_json)
            
            # 조건에 맞는 새 매물 검색
            matching_properties = await self._find_matching_properties(criteria)
            
            if matching_properties:
                # 알림 발송
                await self._send_alert_notification(user_id, alert_id, matching_properties)
                
                # 알림 체크 시간 업데이트
                cursor.execute('''
                    UPDATE property_alerts 
                    SET last_checked = ?, matches_found = matches_found + ?
                    WHERE alert_id = ?
                ''', (datetime.now().isoformat(), len(matching_properties), alert_id))
                
        conn.commit()
        conn.close()
        
    async def _find_matching_properties(self, criteria: Dict[str, Any]) -> List[PropertyListing]:
        """조건에 맞는 매물 검색"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # SQL 쿼리 구성
        query = "SELECT * FROM property_listings WHERE 1=1"
        params = []
        
        # 지역 조건
        if "regions" in criteria:
            region_conditions = " OR ".join(["address LIKE ?" for _ in criteria["regions"]])
            query += f" AND ({region_conditions})"
            params.extend([f"%{region}%" for region in criteria["regions"]])
            
        # 가격 범위
        if "min_price" in criteria:
            query += " AND price >= ?"
            params.append(criteria["min_price"])
        if "max_price" in criteria:
            query += " AND price <= ?"
            params.append(criteria["max_price"])
            
        # 거래 유형
        if "transaction_type" in criteria:
            query += " AND transaction_type = ?"
            params.append(criteria["transaction_type"])
            
        # 면적 범위
        if "min_area" in criteria:
            query += " AND area_pyeong >= ?"
            params.append(criteria["min_area"])
        if "max_area" in criteria:
            query += " AND area_pyeong <= ?"
            params.append(criteria["max_area"])
            
        # 최근 등록된 매물만 (24시간 이내)
        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        query += " AND created_at >= ?"
        params.append(yesterday)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        # PropertyListing 객체로 변환
        properties = []
        columns = [desc[0] for desc in cursor.description]
        
        for row in rows:
            data = dict(zip(columns, row))
            prop = PropertyListing(
                listing_id=data["listing_id"],
                title=data["title"],
                address=data["address"],
                property_type=data["property_type"],
                transaction_type=data["transaction_type"],
                price=data["price"],
                deposit=data["deposit"] or 0,
                monthly_rent=data["monthly_rent"] or 0,
                area_pyeong=data["area_pyeong"],
                area_sqm=data["area_sqm"],
                floor=data["floor"],
                building_year=data["building_year"],
                description=data["description"],
                images=json.loads(data["images"]) if data["images"] else [],
                contact_info=data["contact_info"],
                listing_date=datetime.fromisoformat(data["listing_date"]),
                source=data["source"],
                url=data["url"],
                coordinates=json.loads(data["coordinates"]) if data["coordinates"] else None,
                ai_analysis=json.loads(data["ai_analysis"]) if data["ai_analysis"] else None
            )
            properties.append(prop)
            
        conn.close()
        return properties
        
    async def _send_alert_notification(self, user_id: str, alert_id: str, 
                                     properties: List[PropertyListing]):
        """알림 발송"""
        notification = {
            "user_id": user_id,
            "alert_id": alert_id,
            "type": "property_alert",
            "title": f"새로운 매물 {len(properties)}건이 등록되었습니다",
            "properties": [
                {
                    "title": prop.title,
                    "address": prop.address,
                    "price": prop.price,
                    "area": prop.area_pyeong,
                    "url": prop.url,
                    "ai_score": prop.ai_analysis.get("overall_score", 0) if prop.ai_analysis else 0
                }
                for prop in properties
            ],
            "timestamp": datetime.now().isoformat()
        }
        
        # 콜백 함수들 실행
        for callback in self.alert_callbacks:
            try:
                await callback(notification)
            except Exception as e:
                logger.error(f"알림 콜백 실행 실패: {e}")
                
        logger.info(f"알림 발송 완료: {user_id}, {len(properties)}건")
        
    def add_alert_callback(self, callback: Callable):
        """알림 콜백 함수 추가"""
        self.alert_callbacks.append(callback)
        
    def add_to_favorites(self, user_id: str, listing_id: str, notes: str = ""):
        """관심 매물 추가"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO property_favorites (user_id, listing_id, added_at, notes)
                VALUES (?, ?, ?, ?)
            ''', (user_id, listing_id, datetime.now().isoformat(), notes))
            
            conn.commit()
            logger.info(f"관심 매물 추가: {user_id} -> {listing_id}")
            
        except sqlite3.IntegrityError:
            logger.warning(f"이미 관심 매물로 등록됨: {listing_id}")
        except Exception as e:
            logger.error(f"관심 매물 추가 실패: {e}")
        finally:
            conn.close()
            
    def get_favorites(self, user_id: str) -> List[Dict[str, Any]]:
        """사용자 관심 매물 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT p.*, f.added_at, f.notes
            FROM property_listings p
            JOIN property_favorites f ON p.listing_id = f.listing_id
            WHERE f.user_id = ?
            ORDER BY f.added_at DESC
        ''', (user_id,))
        
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        favorites = []
        for row in rows:
            data = dict(zip(columns, row))
            data["ai_analysis"] = json.loads(data["ai_analysis"]) if data["ai_analysis"] else None
            favorites.append(data)
            
        conn.close()
        return favorites
        
    def get_price_trends(self, listing_id: str) -> List[Dict[str, Any]]:
        """매물 가격 변동 이력 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT price, deposit, monthly_rent, recorded_at
            FROM price_history
            WHERE listing_id = ?
            ORDER BY recorded_at ASC
        ''', (listing_id,))
        
        history = []
        for row in cursor.fetchall():
            history.append({
                "price": row[0],
                "deposit": row[1],
                "monthly_rent": row[2],
                "recorded_at": row[3]
            })
            
        conn.close()
        return history
        
    async def get_market_insights(self, region: str = None) -> Dict[str, Any]:
        """시장 인사이트 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 최근 30일 매물 통계
        thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
        
        if region:
            cursor.execute('''
                SELECT COUNT(*) as total_listings,
                       AVG(price) as avg_price,
                       MIN(price) as min_price,
                       MAX(price) as max_price,
                       AVG(area_pyeong) as avg_area
                FROM property_listings 
                WHERE address LIKE ? AND created_at >= ?
            ''', (f"%{region}%", thirty_days_ago))
        else:
            cursor.execute('''
                SELECT COUNT(*) as total_listings,
                       AVG(price) as avg_price,
                       MIN(price) as min_price,
                       MAX(price) as max_price,
                       AVG(area_pyeong) as avg_area
                FROM property_listings 
                WHERE created_at >= ?
            ''', (thirty_days_ago,))
            
        stats = cursor.fetchone()
        
        # AI 분석 점수 분포
        cursor.execute('''
            SELECT ai_analysis
            FROM property_listings 
            WHERE ai_analysis IS NOT NULL AND created_at >= ?
        ''', (thirty_days_ago,))
        
        ai_scores = []
        for row in cursor.fetchall():
            try:
                analysis = json.loads(row[0])
                if "overall_score" in analysis:
                    ai_scores.append(analysis["overall_score"])
            except:
                continue
                
        conn.close()
        
        insights = {
            "region": region or "전체",
            "period": "최근 30일",
            "statistics": {
                "total_listings": stats[0] or 0,
                "avg_price": round(stats[1] or 0, 2),
                "min_price": stats[2] or 0,
                "max_price": stats[3] or 0,
                "avg_area": round(stats[4] or 0, 1)
            },
            "ai_analysis": {
                "total_analyzed": len(ai_scores),
                "avg_score": round(sum(ai_scores) / len(ai_scores), 2) if ai_scores else 0,
                "score_distribution": {
                    "excellent": len([s for s in ai_scores if s >= 8]),
                    "good": len([s for s in ai_scores if 6 <= s < 8]),
                    "average": len([s for s in ai_scores if 4 <= s < 6]),
                    "poor": len([s for s in ai_scores if s < 4])
                }
            },
            "generated_at": datetime.now().isoformat()
        }
        
        return insights
        
    async def run_continuous_monitoring(self):
        """지속적 매물 모니터링"""
        logger.info("매물 모니터링 시작")
        
        while True:
            try:
                # 1. 알림 확인
                await self.check_alerts()
                
                # 2. 주요 지역 매물 업데이트
                key_regions = ["강남구", "서초구", "송파구", "강동구", "마포구"]
                
                for region in key_regions:
                    search_criteria = {
                        "regions": [region],
                        "transaction_type": "매매",
                        "min_price": 5.0,
                        "max_price": 50.0
                    }
                    
                    await self.search_properties(search_criteria)
                    await asyncio.sleep(30)  # 30초 간격
                    
                logger.info("매물 모니터링 사이클 완료")
                
                # 1시간 대기 (테스트용으로 10분)
                await asyncio.sleep(600)
                
            except Exception as e:
                logger.error(f"모니터링 오류: {e}")
                await asyncio.sleep(300)  # 5분 후 재시도


# 사용 예시
if __name__ == "__main__":
    async def sample_alert_callback(notification):
        """샘플 알림 콜백"""
        print(f"🔔 알림: {notification['title']}")
        for prop in notification['properties']:
            print(f"  - {prop['title']}: {prop['price']}억원 (AI점수: {prop['ai_score']})")
            
    async def main():
        # 매물 통합 시스템 초기화
        system = PropertyIntegrationSystem()
        
        # 알림 콜백 등록
        system.add_alert_callback(sample_alert_callback)
        
        # 매물 검색 테스트
        search_criteria = {
            "regions": ["강남구"],
            "transaction_type": "매매",
            "min_price": 10.0,
            "max_price": 20.0,
            "min_area": 80,
            "max_area": 100
        }
        
        properties = await system.search_properties(search_criteria)
        print(f"검색된 매물: {len(properties)}건")
        
        for prop in properties:
            print(f"- {prop.title}: {prop.price}억원")
            if prop.ai_analysis:
                print(f"  AI 점수: {prop.ai_analysis.get('overall_score', 0)}")
                print(f"  등급: {prop.ai_analysis.get('grade', 'N/A')}")
                
        # 매물 알림 생성
        alert_id = system.create_property_alert("user_001", search_criteria)
        print(f"알림 생성: {alert_id}")
        
        # 시장 인사이트 조회
        insights = await system.get_market_insights("강남구")
        print(f"\n=== 강남구 시장 인사이트 ===")
        print(f"매물 수: {insights['statistics']['total_listings']}건")
        print(f"평균 가격: {insights['statistics']['avg_price']}억원")
        print(f"AI 분석 완료: {insights['ai_analysis']['total_analyzed']}건")
        
        await system.close_session()
        
    asyncio.run(main()) 