#!/usr/bin/env python3
"""
시장 분석 엔진
매매/전세 시세, 정책 변화, 투자 전망 분석
"""

import os
import json
import sqlite3
import logging
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
import yfinance as yf
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MarketData:
    """시장 데이터 클래스"""
    region: str
    property_type: str
    price_type: str  # 매매, 전세
    price: float
    area: float
    date: str
    source: str

@dataclass
class PolicyChange:
    """정책 변화 데이터 클래스"""
    policy_id: str
    title: str
    description: str
    announcement_date: str
    effective_date: str
    impact_type: str  # 긍정적, 부정적, 중립적
    impact_score: float
    affected_regions: List[str]
    affected_property_types: List[str]

@dataclass
class MarketAnalysis:
    """시장 분석 결과"""
    region: str
    property_type: str
    current_price: float
    price_trend: str  # 상승, 하락, 보합
    trend_strength: float
    price_prediction_3m: float
    price_prediction_6m: float
    price_prediction_12m: float
    market_volatility: float
    investment_risk_level: str
    investment_recommendation: str
    key_factors: List[str]
    policy_impacts: List[PolicyChange]

class MarketAnalysisEngine:
    """시장 분석 엔진"""
    
    def __init__(self, db_path: str = "market_analysis.db"):
        self.db_path = db_path
        self.init_database()
        self.load_sample_data()
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 시장 데이터 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                region TEXT,
                property_type TEXT,
                price_type TEXT,
                price REAL,
                area REAL,
                date TEXT,
                source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 정책 변화 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS policy_changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                policy_id TEXT UNIQUE,
                title TEXT,
                description TEXT,
                announcement_date TEXT,
                effective_date TEXT,
                impact_type TEXT,
                impact_score REAL,
                affected_regions TEXT,
                affected_property_types TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 시장 분석 결과 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS market_analysis_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                region TEXT,
                property_type TEXT,
                analysis_date TEXT,
                current_price REAL,
                price_trend TEXT,
                trend_strength REAL,
                price_prediction_3m REAL,
                price_prediction_6m REAL,
                price_prediction_12m REAL,
                market_volatility REAL,
                investment_risk_level TEXT,
                investment_recommendation TEXT,
                key_factors TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def load_sample_data(self):
        """샘플 데이터 로드"""
        # 샘플 시장 데이터
        sample_market_data = [
            # 강남구 아파트 매매 데이터
            {"region": "강남구", "property_type": "아파트", "price_type": "매매", 
             "price": 150000000, "area": 84.5, "date": "2024-01-01", "source": "KB부동산"},
            {"region": "강남구", "property_type": "아파트", "price_type": "매매", 
             "price": 152000000, "area": 84.5, "date": "2024-02-01", "source": "KB부동산"},
            {"region": "강남구", "property_type": "아파트", "price_type": "매매", 
             "price": 148000000, "area": 84.5, "date": "2024-03-01", "source": "KB부동산"},
            {"region": "강남구", "property_type": "아파트", "price_type": "매매", 
             "price": 155000000, "area": 84.5, "date": "2024-04-01", "source": "KB부동산"},
            {"region": "강남구", "property_type": "아파트", "price_type": "매매", 
             "price": 158000000, "area": 84.5, "date": "2024-05-01", "source": "KB부동산"},
            
            # 강남구 아파트 전세 데이터
            {"region": "강남구", "property_type": "아파트", "price_type": "전세", 
             "price": 120000000, "area": 84.5, "date": "2024-01-01", "source": "KB부동산"},
            {"region": "강남구", "property_type": "아파트", "price_type": "전세", 
             "price": 122000000, "area": 84.5, "date": "2024-02-01", "source": "KB부동산"},
            {"region": "강남구", "property_type": "아파트", "price_type": "전세", 
             "price": 118000000, "area": 84.5, "date": "2024-03-01", "source": "KB부동산"},
            {"region": "강남구", "property_type": "아파트", "price_type": "전세", 
             "price": 125000000, "area": 84.5, "date": "2024-04-01", "source": "KB부동산"},
            {"region": "강남구", "property_type": "아파트", "price_type": "전세", 
             "price": 128000000, "area": 84.5, "date": "2024-05-01", "source": "KB부동산"},
            
            # 서초구 아파트 매매 데이터
            {"region": "서초구", "property_type": "아파트", "price_type": "매매", 
             "price": 140000000, "area": 84.5, "date": "2024-01-01", "source": "KB부동산"},
            {"region": "서초구", "property_type": "아파트", "price_type": "매매", 
             "price": 142000000, "area": 84.5, "date": "2024-02-01", "source": "KB부동산"},
            {"region": "서초구", "property_type": "아파트", "price_type": "매매", 
             "price": 138000000, "area": 84.5, "date": "2024-03-01", "source": "KB부동산"},
            {"region": "서초구", "property_type": "아파트", "price_type": "매매", 
             "price": 145000000, "area": 84.5, "date": "2024-04-01", "source": "KB부동산"},
            {"region": "서초구", "property_type": "아파트", "price_type": "매매", 
             "price": 148000000, "area": 84.5, "date": "2024-05-01", "source": "KB부동산"},
        ]
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for data in sample_market_data:
            cursor.execute('''
                INSERT OR REPLACE INTO market_data 
                (region, property_type, price_type, price, area, date, source)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                data["region"],
                data["property_type"],
                data["price_type"],
                data["price"],
                data["area"],
                data["date"],
                data["source"]
            ))
        
        # 샘플 정책 변화 데이터
        sample_policies = [
            {
                "policy_id": "POL001",
                "title": "부동산 투기 억제를 위한 종합대책",
                "description": "다주택자 양도소득세 중과, 전세사기 방지 대책 등",
                "announcement_date": "2024-01-15",
                "effective_date": "2024-02-01",
                "impact_type": "부정적",
                "impact_score": -0.3,
                "affected_regions": ["강남구", "서초구", "송파구"],
                "affected_property_types": ["아파트", "오피스텔"]
            },
            {
                "policy_id": "POL002",
                "title": "신도시 개발 계획 발표",
                "description": "제3신도시 개발로 인한 주택 공급 확대",
                "announcement_date": "2024-03-10",
                "effective_date": "2024-06-01",
                "impact_type": "긍정적",
                "impact_score": 0.2,
                "affected_regions": ["성남시", "하남시", "광주시"],
                "affected_property_types": ["아파트", "단독주택"]
            },
            {
                "policy_id": "POL003",
                "title": "전세사기 피해자 지원 방안",
                "description": "전세사기 피해자에 대한 정부 지원금 지급",
                "announcement_date": "2024-04-20",
                "effective_date": "2024-05-01",
                "impact_type": "긍정적",
                "impact_score": 0.1,
                "affected_regions": ["전국"],
                "affected_property_types": ["아파트", "빌라", "단독주택"]
            }
        ]
        
        for policy in sample_policies:
            cursor.execute('''
                INSERT OR REPLACE INTO policy_changes 
                (policy_id, title, description, announcement_date, effective_date,
                 impact_type, impact_score, affected_regions, affected_property_types)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                policy["policy_id"],
                policy["title"],
                policy["description"],
                policy["announcement_date"],
                policy["effective_date"],
                policy["impact_type"],
                policy["impact_score"],
                json.dumps(policy["affected_regions"]),
                json.dumps(policy["affected_property_types"])
            ))
        
        conn.commit()
        conn.close()
        
    def analyze_market(self, region: str, property_type: str, price_type: str = "매매") -> MarketAnalysis:
        """시장 분석 수행"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 해당 지역/유형의 시장 데이터 조회
        cursor.execute('''
            SELECT price, date FROM market_data 
            WHERE region = ? AND property_type = ? AND price_type = ?
            ORDER BY date ASC
        ''', (region, property_type, price_type))
        
        market_data = cursor.fetchall()
        
        if len(market_data) < 3:
            conn.close()
            raise ValueError(f"분석을 위한 충분한 데이터가 없습니다. (최소 3개 데이터 필요)")
        
        # 가격 데이터 추출
        prices = [data[0] for data in market_data]
        dates = [data[1] for data in market_data]
        
        # 현재 가격
        current_price = prices[-1]
        
        # 가격 트렌드 분석
        price_trend, trend_strength = self._analyze_price_trend(prices)
        
        # 가격 예측
        predictions = self._predict_prices(prices, dates)
        
        # 시장 변동성 계산
        volatility = self._calculate_volatility(prices)
        
        # 투자 위험도 평가
        risk_level = self._assess_investment_risk(volatility, trend_strength, predictions)
        
        # 투자 권장사항 생성
        recommendation = self._generate_investment_recommendation(
            price_trend, trend_strength, risk_level, predictions
        )
        
        # 주요 영향 요인 식별
        key_factors = self._identify_key_factors(region, property_type, price_trend)
        
        # 정책 영향 분석
        policy_impacts = self._analyze_policy_impacts(region, property_type)
        
        conn.close()
        
        return MarketAnalysis(
            region=region,
            property_type=property_type,
            current_price=current_price,
            price_trend=price_trend,
            trend_strength=trend_strength,
            price_prediction_3m=predictions.get("3m", current_price),
            price_prediction_6m=predictions.get("6m", current_price),
            price_prediction_12m=predictions.get("12m", current_price),
            market_volatility=volatility,
            investment_risk_level=risk_level,
            investment_recommendation=recommendation,
            key_factors=key_factors,
            policy_impacts=policy_impacts
        )
    
    def _analyze_price_trend(self, prices: List[float]) -> Tuple[str, float]:
        """가격 트렌드 분석"""
        if len(prices) < 2:
            return "보합", 0.0
        
        # 최근 3개월과 이전 3개월 비교
        recent_prices = prices[-3:] if len(prices) >= 3 else prices[-2:]
        previous_prices = prices[-6:-3] if len(prices) >= 6 else prices[:-3] if len(prices) >= 3 else []
        
        if not previous_prices:
            # 단순 최근 변화율 계산
            change_rate = (prices[-1] - prices[0]) / prices[0]
        else:
            recent_avg = np.mean(recent_prices)
            previous_avg = np.mean(previous_prices)
            change_rate = (recent_avg - previous_avg) / previous_avg
        
        # 트렌드 강도 계산
        trend_strength = abs(change_rate) * 100
        
        # 트렌드 방향 결정
        if change_rate > 0.02:  # 2% 이상 상승
            trend = "상승"
        elif change_rate < -0.02:  # 2% 이상 하락
            trend = "하락"
        else:
            trend = "보합"
        
        return trend, trend_strength
    
    def _predict_prices(self, prices: List[float], dates: List[str]) -> Dict[str, float]:
        """가격 예측"""
        try:
            # 날짜를 숫자로 변환
            date_nums = [(datetime.strptime(date, "%Y-%m-%d") - datetime(2024, 1, 1)).days for date in dates]
            
            # 선형 회귀 모델 학습
            X = np.array(date_nums).reshape(-1, 1)
            y = np.array(prices)
            
            model = LinearRegression()
            model.fit(X, y)
            
            # 예측 날짜 계산
            last_date = datetime.strptime(dates[-1], "%Y-%m-%d")
            
            predictions = {}
            
            # 3개월 후 예측
            future_date_3m = last_date + timedelta(days=90)
            future_num_3m = (future_date_3m - datetime(2024, 1, 1)).days
            predictions["3m"] = model.predict([[future_num_3m]])[0]
            
            # 6개월 후 예측
            future_date_6m = last_date + timedelta(days=180)
            future_num_6m = (future_date_6m - datetime(2024, 1, 1)).days
            predictions["6m"] = model.predict([[future_num_6m]])[0]
            
            # 12개월 후 예측
            future_date_12m = last_date + timedelta(days=365)
            future_num_12m = (future_date_12m - datetime(2024, 1, 1)).days
            predictions["12m"] = model.predict([[future_num_12m]])[0]
            
            return predictions
            
        except Exception as e:
            logger.error(f"가격 예측 오류: {e}")
            # 예측 실패 시 현재 가격 반환
            current_price = prices[-1]
            return {
                "3m": current_price,
                "6m": current_price,
                "12m": current_price
            }
    
    def _calculate_volatility(self, prices: List[float]) -> float:
        """시장 변동성 계산"""
        if len(prices) < 2:
            return 0.0
        
        # 가격 변화율 계산
        returns = []
        for i in range(1, len(prices)):
            returns.append((prices[i] - prices[i-1]) / prices[i-1])
        
        # 변동성 (표준편차)
        volatility = np.std(returns) * 100
        return volatility
    
    def _assess_investment_risk(self, volatility: float, trend_strength: float, 
                               predictions: Dict[str, float]) -> str:
        """투자 위험도 평가"""
        risk_score = 0
        
        # 변동성 기반 위험도
        if volatility > 10:
            risk_score += 3
        elif volatility > 5:
            risk_score += 2
        elif volatility > 2:
            risk_score += 1
        
        # 트렌드 강도 기반 위험도
        if trend_strength > 20:
            risk_score += 2
        elif trend_strength > 10:
            risk_score += 1
        
        # 예측 일관성 기반 위험도
        if len(predictions) >= 2:
            pred_values = list(predictions.values())
            pred_volatility = np.std(pred_values) / np.mean(pred_values) * 100
            if pred_volatility > 15:
                risk_score += 2
            elif pred_volatility > 10:
                risk_score += 1
        
        # 위험도 등급 결정
        if risk_score >= 6:
            return "높음"
        elif risk_score >= 3:
            return "중간"
        else:
            return "낮음"
    
    def _generate_investment_recommendation(self, trend: str, trend_strength: float, 
                                          risk_level: str, predictions: Dict[str, float]) -> str:
        """투자 권장사항 생성"""
        recommendations = []
        
        # 트렌드 기반 권장사항
        if trend == "상승" and trend_strength > 10:
            recommendations.append("상승 추세가 강하므로 매수 고려")
        elif trend == "하락" and trend_strength > 10:
            recommendations.append("하락 추세가 강하므로 매도 고려")
        elif trend == "보합":
            recommendations.append("보합세이므로 신중한 관망 필요")
        
        # 위험도 기반 권장사항
        if risk_level == "높음":
            recommendations.append("높은 변동성으로 인한 신중한 투자 필요")
        elif risk_level == "낮음":
            recommendations.append("안정적인 투자 환경")
        
        # 예측 기반 권장사항
        if predictions:
            pred_3m = predictions.get("3m", 0)
            pred_12m = predictions.get("12m", 0)
            if pred_12m > pred_3m * 1.1:
                recommendations.append("장기적으로 상승 전망")
            elif pred_12m < pred_3m * 0.9:
                recommendations.append("장기적으로 하락 우려")
        
        return " | ".join(recommendations) if recommendations else "시장 상황을 지속적으로 모니터링 필요"
    
    def _identify_key_factors(self, region: str, property_type: str, trend: str) -> List[str]:
        """주요 영향 요인 식별"""
        factors = []
        
        # 지역별 특성
        if region in ["강남구", "서초구", "송파구"]:
            factors.extend(["고급 주거지역", "교통 접근성", "교육 환경"])
        elif region in ["성남시", "하남시", "광주시"]:
            factors.extend(["신도시 개발", "주택 공급 확대", "인프라 구축"])
        
        # 부동산 유형별 특성
        if property_type == "아파트":
            factors.extend(["아파트 공급량", "분양가 상한제", "전세 수요"])
        elif property_type == "오피스텔":
            factors.extend(["상업지역 개발", "임대 수요", "투자 수익률"])
        
        # 트렌드별 요인
        if trend == "상승":
            factors.extend(["수요 증가", "공급 부족", "투자 심리"])
        elif trend == "하락":
            factors.extend(["공급 과다", "수요 감소", "정책 영향"])
        
        return factors[:5]  # 상위 5개 요인만 반환
    
    def _analyze_policy_impacts(self, region: str, property_type: str) -> List[PolicyChange]:
        """정책 영향 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 해당 지역/유형에 영향을 주는 정책 조회
        cursor.execute('''
            SELECT * FROM policy_changes 
            WHERE (affected_regions LIKE ? OR affected_regions LIKE '%전국%')
            AND (affected_property_types LIKE ? OR affected_property_types LIKE '%전체%')
            ORDER BY announcement_date DESC
        ''', (f'%{region}%', f'%{property_type}%'))
        
        policy_data = cursor.fetchall()
        conn.close()
        
        policy_impacts = []
        for policy in policy_data:
            policy_impacts.append(PolicyChange(
                policy_id=policy[1],
                title=policy[2],
                description=policy[3],
                announcement_date=policy[4],
                effective_date=policy[5],
                impact_type=policy[6],
                impact_score=policy[7],
                affected_regions=json.loads(policy[8]),
                affected_property_types=json.loads(policy[9])
            ))
        
        return policy_impacts
    
    def get_regional_comparison(self, property_type: str, price_type: str = "매매") -> Dict[str, Any]:
        """지역별 비교 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 모든 지역의 최신 가격 데이터 조회
        cursor.execute('''
            SELECT region, price, date FROM market_data 
            WHERE property_type = ? AND price_type = ?
            AND date = (SELECT MAX(date) FROM market_data m2 
                       WHERE m2.region = market_data.region 
                       AND m2.property_type = market_data.property_type 
                       AND m2.price_type = market_data.price_type)
            ORDER BY price DESC
        ''', (property_type, price_type))
        
        regional_data = cursor.fetchall()
        conn.close()
        
        if not regional_data:
            return {"message": "지역별 비교 데이터가 없습니다."}
        
        # 지역별 분석 결과 생성
        comparison_results = {}
        for region, price, date in regional_data:
            try:
                analysis = self.analyze_market(region, property_type, price_type)
                comparison_results[region] = {
                    "current_price": price,
                    "price_trend": analysis.price_trend,
                    "trend_strength": analysis.trend_strength,
                    "investment_risk_level": analysis.investment_risk_level,
                    "investment_recommendation": analysis.investment_recommendation
                }
            except Exception as e:
                logger.error(f"지역 {region} 분석 오류: {e}")
                continue
        
        return comparison_results
    
    def get_market_forecast(self, months: int = 12) -> Dict[str, Any]:
        """전체 시장 전망"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 모든 지역/유형의 최신 분석 결과 조회
        cursor.execute('''
            SELECT region, property_type, current_price, price_trend, 
                   trend_strength, price_prediction_3m, price_prediction_6m, 
                   price_prediction_12m, investment_risk_level
            FROM market_analysis_results 
            WHERE analysis_date >= date('now', '-30 days')
            ORDER BY current_price DESC
        ''')
        
        analysis_data = cursor.fetchall()
        conn.close()
        
        if not analysis_data:
            return {"message": "시장 전망 데이터가 없습니다."}
        
        # 전체 시장 트렌드 분석
        trends = [data[3] for data in analysis_data]
        trend_counts = {"상승": 0, "하락": 0, "보합": 0}
        for trend in trends:
            trend_counts[trend] += 1
        
        # 평균 예측 가격 변화율
        avg_prediction_3m = np.mean([data[5] for data in analysis_data])
        avg_prediction_6m = np.mean([data[6] for data in analysis_data])
        avg_prediction_12m = np.mean([data[7] for data in analysis_data])
        
        # 위험도 분포
        risk_levels = [data[8] for data in analysis_data]
        risk_counts = {"높음": 0, "중간": 0, "낮음": 0}
        for risk in risk_levels:
            risk_counts[risk] += 1
        
        return {
            "market_trend_distribution": trend_counts,
            "average_price_prediction_3m": avg_prediction_3m,
            "average_price_prediction_6m": avg_prediction_6m,
            "average_price_prediction_12m": avg_prediction_12m,
            "risk_level_distribution": risk_counts,
            "total_regions_analyzed": len(analysis_data),
            "analysis_period_months": months
        }

# API 서버 통합
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="시장 분석 엔진 API")

class MarketAnalysisRequest(BaseModel):
    region: str
    property_type: str
    price_type: str = "매매"

class RegionalComparisonRequest(BaseModel):
    property_type: str
    price_type: str = "매매"

class MarketForecastRequest(BaseModel):
    months: int = 12

analysis_engine = MarketAnalysisEngine()

@app.post("/analyze-market")
async def analyze_market(request: MarketAnalysisRequest):
    """시장 분석 API"""
    try:
        analysis = analysis_engine.analyze_market(
            request.region, request.property_type, request.price_type
        )
        return analysis.__dict__
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/regional-comparison")
async def regional_comparison(request: RegionalComparisonRequest):
    """지역별 비교 분석 API"""
    try:
        comparison = analysis_engine.get_regional_comparison(
            request.property_type, request.price_type
        )
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/market-forecast")
async def market_forecast(request: MarketForecastRequest):
    """시장 전망 API"""
    try:
        forecast = analysis_engine.get_market_forecast(request.months)
        return forecast
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/regions")
async def get_available_regions():
    """분석 가능한 지역 목록 조회"""
    try:
        conn = sqlite3.connect(analysis_engine.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT region FROM market_data ORDER BY region")
        regions = [row[0] for row in cursor.fetchall()]
        conn.close()
        return {"regions": regions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/property-types")
async def get_property_types():
    """부동산 유형 목록 조회"""
    try:
        conn = sqlite3.connect(analysis_engine.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT property_type FROM market_data ORDER BY property_type")
        property_types = [row[0] for row in cursor.fetchall()]
        conn.close()
        return {"property_types": property_types}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)
