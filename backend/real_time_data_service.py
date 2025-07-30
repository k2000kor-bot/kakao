import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from dataclasses import dataclass
import sqlite3
from pathlib import Path
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class RealTimeProperty:
    """실시간 부동산 데이터"""
    property_id: str
    address: str
    property_type: str  # 아파트, 오피스텔, 주택
    price: float  # 억원
    area: float  # 평
    floor: int
    total_floors: int
    build_year: int
    deal_date: datetime
    deal_type: str  # 매매, 전세, 월세
    source: str  # 데이터 출처


@dataclass
class MarketIndicator:
    """시장 지표"""
    indicator_name: str
    value: float
    previous_value: float
    change_rate: float
    update_time: datetime
    unit: str


class RealTimeDataService:
    """실시간 부동산 데이터 서비스"""
    
    def __init__(self, db_path: str = "real_estate_data.db"):
        self.db_path = db_path
        self.session: Optional[aiohttp.ClientSession] = None
        self.api_keys = self._load_api_keys()
        self.init_database()
        
        # 공공데이터 API 엔드포인트
        self.endpoints = {
            "apt_trade": "http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev",
            "apt_rent": "http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptRent",
            "market_index": "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev"
        }
        
    def _load_api_keys(self) -> Dict[str, str]:
        """API 키 로드 (환경변수 또는 설정파일에서)"""
        return {
            "data_go_kr": "YOUR_DATA_GO_KR_API_KEY",  # 실제 사용시 환경변수로 설정
            "kb_api": "YOUR_KB_API_KEY",
            "korea_appraisal": "YOUR_KOREA_APPRAISAL_KEY"
        }
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 부동산 거래 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS property_deals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                property_id TEXT,
                address TEXT,
                property_type TEXT,
                price REAL,
                area REAL,
                floor INTEGER,
                total_floors INTEGER,
                build_year INTEGER,
                deal_date TEXT,
                deal_type TEXT,
                source TEXT,
                created_at TEXT
            )
        ''')
        
        # 시장 지표 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS market_indicators (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                indicator_name TEXT,
                value REAL,
                previous_value REAL,
                change_rate REAL,
                update_time TEXT,
                unit TEXT
            )
        ''')
        
        # 지역별 시세 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS regional_prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                region_code TEXT,
                region_name TEXT,
                property_type TEXT,
                avg_price REAL,
                price_change_rate REAL,
                transaction_count INTEGER,
                update_date TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        
    async def start_session(self):
        """HTTP 세션 시작"""
        if not self.session:
            self.session = aiohttp.ClientSession()
            
    async def close_session(self):
        """HTTP 세션 종료"""
        if self.session:
            await self.session.close()
            self.session = None
            
    async def fetch_apartment_deals(self, region_code: str, year_month: str) -> List[RealTimeProperty]:
        """아파트 실거래 데이터 수집"""
        if not self.session:
            await self.start_session()
            
        params = {
            "serviceKey": self.api_keys["data_go_kr"],
            "LAWD_CD": region_code,  # 지역코드 (예: 11110 - 종로구)
            "DEAL_YMD": year_month,  # 계약년월 (예: 202401)
            "pageNo": "1",
            "numOfRows": "1000"
        }
        
        try:
            async with self.session.get(self.endpoints["apt_trade"], params=params) as response:
                if response.status == 200:
                    # XML 응답을 파싱하여 처리
                    data = await response.text()
                    return self._parse_apartment_data(data)
                else:
                    logger.error(f"API 요청 실패: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"아파트 거래 데이터 수집 실패: {e}")
            return []
            
    def _parse_apartment_data(self, xml_data: str) -> List[RealTimeProperty]:
        """XML 아파트 데이터 파싱"""
        # 실제 구현시에는 xml.etree.ElementTree 사용
        # 여기서는 샘플 데이터 반환
        sample_properties = []
        
        for i in range(5):  # 샘플 5개
            property_data = RealTimeProperty(
                property_id=f"APT_{datetime.now().strftime('%Y%m%d')}_{i:03d}",
                address=f"서울시 강남구 압구정동 {100+i}번지",
                property_type="아파트",
                price=15.5 + i * 0.5,
                area=84.2,
                floor=i + 3,
                total_floors=15,
                build_year=2000 + i,
                deal_date=datetime.now() - timedelta(days=i),
                deal_type="매매",
                source="국토교통부 실거래가"
            )
            sample_properties.append(property_data)
            
        return sample_properties
        
    async def collect_market_indicators(self) -> List[MarketIndicator]:
        """시장 지표 수집"""
        indicators = []
        
        # KB 부동산 지수
        kb_index = await self._fetch_kb_index()
        if kb_index:
            indicators.append(kb_index)
            
        # 한국감정원 지수
        ka_index = await self._fetch_ka_index()
        if ka_index:
            indicators.append(ka_index)
            
        # 부동산 거래량 지수
        transaction_index = await self._calculate_transaction_index()
        if transaction_index:
            indicators.append(transaction_index)
            
        return indicators
        
    async def _fetch_kb_index(self) -> Optional[MarketIndicator]:
        """KB 부동산 지수 수집"""
        try:
            # 실제 KB API 호출 로직
            # 샘플 데이터 반환
            return MarketIndicator(
                indicator_name="KB주택가격지수",
                value=105.2,
                previous_value=104.1,
                change_rate=1.1,
                update_time=datetime.now(),
                unit="지수"
            )
        except Exception as e:
            logger.error(f"KB 지수 수집 실패: {e}")
            return None
            
    async def _fetch_ka_index(self) -> Optional[MarketIndicator]:
        """한국감정원 지수 수집"""
        try:
            # 실제 한국감정원 API 호출 로직
            # 샘플 데이터 반환
            return MarketIndicator(
                indicator_name="한국감정원 아파트가격지수",
                value=103.8,
                previous_value=103.2,
                change_rate=0.6,
                update_time=datetime.now(),
                unit="지수"
            )
        except Exception as e:
            logger.error(f"한국감정원 지수 수집 실패: {e}")
            return None
            
    async def _calculate_transaction_index(self) -> Optional[MarketIndicator]:
        """거래량 지수 계산"""
        try:
            # 최근 거래 데이터를 기반으로 거래량 지수 계산
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 이번 달 거래량
            current_month = datetime.now().strftime('%Y-%m')
            cursor.execute(
                "SELECT COUNT(*) FROM property_deals WHERE strftime('%Y-%m', deal_date) = ?",
                (current_month,)
            )
            current_count = cursor.fetchone()[0]
            
            # 전월 거래량
            last_month = (datetime.now() - timedelta(days=30)).strftime('%Y-%m')
            cursor.execute(
                "SELECT COUNT(*) FROM property_deals WHERE strftime('%Y-%m', deal_date) = ?",
                (last_month,)
            )
            last_count = cursor.fetchone()[0] or 1
            
            conn.close()
            
            change_rate = ((current_count - last_count) / last_count) * 100
            
            return MarketIndicator(
                indicator_name="거래량지수",
                value=current_count,
                previous_value=last_count,
                change_rate=change_rate,
                update_time=datetime.now(),
                unit="건수"
            )
        except Exception as e:
            logger.error(f"거래량 지수 계산 실패: {e}")
            return None
            
    def save_property_deals(self, properties: List[RealTimeProperty]):
        """부동산 거래 데이터 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for prop in properties:
            cursor.execute('''
                INSERT INTO property_deals 
                (property_id, address, property_type, price, area, floor, total_floors, 
                 build_year, deal_date, deal_type, source, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                prop.property_id, prop.address, prop.property_type, prop.price,
                prop.area, prop.floor, prop.total_floors, prop.build_year,
                prop.deal_date.isoformat(), prop.deal_type, prop.source,
                datetime.now().isoformat()
            ))
            
        conn.commit()
        conn.close()
        
    def save_market_indicators(self, indicators: List[MarketIndicator]):
        """시장 지표 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for indicator in indicators:
            cursor.execute('''
                INSERT INTO market_indicators 
                (indicator_name, value, previous_value, change_rate, update_time, unit)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                indicator.indicator_name, indicator.value, indicator.previous_value,
                indicator.change_rate, indicator.update_time.isoformat(), indicator.unit
            ))
            
        conn.commit()
        conn.close()
        
    async def get_latest_deals(self, region: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """최신 거래 데이터 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if region:
            query = '''
                SELECT * FROM property_deals 
                WHERE address LIKE ? 
                ORDER BY deal_date DESC 
                LIMIT ?
            '''
            cursor.execute(query, (f'%{region}%', limit))
        else:
            query = '''
                SELECT * FROM property_deals 
                ORDER BY deal_date DESC 
                LIMIT ?
            '''
            cursor.execute(query, (limit,))
            
        columns = [description[0] for description in cursor.description]
        deals = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return deals
        
    async def get_market_summary(self) -> Dict[str, Any]:
        """시장 요약 정보"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 최신 지표들
        cursor.execute('''
            SELECT indicator_name, value, change_rate, unit
            FROM market_indicators 
            WHERE update_time >= datetime('now', '-1 day')
            ORDER BY update_time DESC
        ''')
        
        indicators = {}
        for row in cursor.fetchall():
            indicators[row[0]] = {
                "value": row[1],
                "change_rate": row[2],
                "unit": row[3]
            }
            
        # 거래량 통계
        cursor.execute('''
            SELECT COUNT(*) as total_deals,
                   AVG(price) as avg_price,
                   property_type
            FROM property_deals 
            WHERE deal_date >= datetime('now', '-30 days')
            GROUP BY property_type
        ''')
        
        transaction_stats = {}
        for row in cursor.fetchall():
            transaction_stats[row[2]] = {
                "total_deals": row[0],
                "avg_price": row[1]
            }
            
        conn.close()
        
        return {
            "indicators": indicators,
            "transaction_stats": transaction_stats,
            "update_time": datetime.now().isoformat()
        }
        
    async def analyze_price_trends(self, region: str, period_days: int = 30) -> Dict[str, Any]:
        """가격 트렌드 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 기간별 평균 가격 조회
        cursor.execute('''
            SELECT DATE(deal_date) as deal_day,
                   AVG(price) as avg_price,
                   COUNT(*) as deal_count
            FROM property_deals 
            WHERE address LIKE ? 
            AND deal_date >= datetime('now', '-{} days')
            GROUP BY DATE(deal_date)
            ORDER BY deal_day
        '''.format(period_days), (f'%{region}%',))
        
        price_data = []
        for row in cursor.fetchall():
            price_data.append({
                "date": row[0],
                "avg_price": row[1],
                "deal_count": row[2]
            })
            
        # 트렌드 계산
        if len(price_data) >= 2:
            first_price = price_data[0]["avg_price"]
            last_price = price_data[-1]["avg_price"]
            trend_rate = ((last_price - first_price) / first_price) * 100
        else:
            trend_rate = 0
            
        conn.close()
        
        return {
            "region": region,
            "period_days": period_days,
            "price_data": price_data,
            "trend_rate": trend_rate,
            "trend_direction": "상승" if trend_rate > 0 else "하락" if trend_rate < 0 else "보합"
        }
        
    async def run_data_collection(self):
        """주기적 데이터 수집 실행"""
        await self.start_session()
        
        try:
            # 서울 주요 구 코드들
            seoul_districts = [
                "11110",  # 종로구
                "11140",  # 중구
                "11170",  # 용산구
                "11200",  # 성동구
                "11215",  # 광진구
                "11230",  # 동대문구
                "11260",  # 중랑구
                "11290",  # 성북구
                "11305",  # 강북구
                "11320",  # 도봉구
                "11350",  # 노원구
                "11380",  # 은평구
                "11410",  # 서대문구
                "11440",  # 마포구
                "11470",  # 양천구
                "11500",  # 강서구
                "11530",  # 구로구
                "11545",  # 금천구
                "11560",  # 영등포구
                "11590",  # 동작구
                "11620",  # 관악구
                "11650",  # 서초구
                "11680",  # 강남구
                "11710",  # 송파구
                "11740"   # 강동구
            ]
            
            current_month = datetime.now().strftime('%Y%m')
            
            for district_code in seoul_districts[:3]:  # 테스트용으로 3개 구만
                logger.info(f"지역 {district_code} 데이터 수집 시작")
                
                # 아파트 거래 데이터 수집
                properties = await self.fetch_apartment_deals(district_code, current_month)
                if properties:
                    self.save_property_deals(properties)
                    logger.info(f"지역 {district_code}: {len(properties)}건 수집 완료")
                    
                # API 호출 제한 고려하여 잠시 대기
                await asyncio.sleep(1)
                
            # 시장 지표 수집
            indicators = await self.collect_market_indicators()
            if indicators:
                self.save_market_indicators(indicators)
                logger.info(f"시장 지표 {len(indicators)}개 수집 완료")
                
        except Exception as e:
            logger.error(f"데이터 수집 중 오류: {e}")
        finally:
            await self.close_session()


# 백그라운드 데이터 수집 스케줄러
class DataCollectionScheduler:
    """데이터 수집 스케줄러"""
    
    def __init__(self, data_service: RealTimeDataService):
        self.data_service = data_service
        self.running = False
        
    async def start_scheduler(self):
        """스케줄러 시작"""
        self.running = True
        logger.info("데이터 수집 스케줄러 시작")
        
        while self.running:
            try:
                # 매 1시간마다 데이터 수집
                await self.data_service.run_data_collection()
                logger.info("데이터 수집 완료, 1시간 후 재실행")
                
                # 1시간 대기 (테스트용으로 10분으로 단축)
                await asyncio.sleep(600)  # 10분
                
            except Exception as e:
                logger.error(f"스케줄러 오류: {e}")
                await asyncio.sleep(300)  # 5분 후 재시도
                
    def stop_scheduler(self):
        """스케줄러 중지"""
        self.running = False
        logger.info("데이터 수집 스케줄러 중지")


# 사용 예시
if __name__ == "__main__":
    async def main():
        # 데이터 서비스 초기화
        data_service = RealTimeDataService()
        
        # 데이터 수집 실행
        await data_service.run_data_collection()
        
        # 최신 거래 데이터 조회
        deals = await data_service.get_latest_deals("강남", 10)
        print("=== 최신 거래 데이터 ===")
        for deal in deals:
            print(f"{deal['address']}: {deal['price']}억원")
            
        # 시장 요약 정보
        summary = await data_service.get_market_summary()
        print(f"\n=== 시장 요약 ===")
        print(json.dumps(summary, indent=2, ensure_ascii=False))
        
        # 가격 트렌드 분석
        trends = await data_service.analyze_price_trends("강남", 30)
        print(f"\n=== 강남 가격 트렌드 ===")
        print(f"트렌드: {trends['trend_direction']} ({trends['trend_rate']:.2f}%)")
        
    asyncio.run(main()) 