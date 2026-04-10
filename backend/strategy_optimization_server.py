#!/usr/bin/env python3
"""
전략 최적화 전용 서버
메시지 전략 최적화, 성과 분석 기능만 포함
"""

import os
import json
import random
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import sqlite3

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="전략 최적화 서버",
    description="메시지 전략 최적화 전용 API 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 초기화
def init_strategy_database():
    """전략 최적화용 데이터베이스 초기화"""
    conn = sqlite3.connect('strategy_system.db')
    cursor = conn.cursor()
    
    # 전략 성과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strategy_performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            strategy_name TEXT NOT NULL,
            success_rate REAL,
            average_impact REAL,
            usage_count INTEGER,
            last_used TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 전략 최적화 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS strategy_optimizations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_strategy TEXT NOT NULL,
            optimized_strategy TEXT NOT NULL,
            improvement_score REAL,
            optimization_factors TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # A/B 테스트 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ab_test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_name TEXT NOT NULL,
            strategy_a TEXT NOT NULL,
            strategy_b TEXT NOT NULL,
            winner TEXT,
            confidence_level REAL,
            sample_size INTEGER,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 기본 전략 성과 데이터 삽입
    default_performances = [
        ('공감 전략', 0.85, 75.0, 150, datetime.now().isoformat()),
        ('논리 설득', 0.80, 80.0, 120, datetime.now().isoformat()),
        ('감정 호소', 0.75, 70.0, 100, datetime.now().isoformat()),
        ('권위 인용', 0.90, 85.0, 80, datetime.now().isoformat()),
        ('사회적 증명', 0.82, 78.0, 90, datetime.now().isoformat())
    ]
    
    for performance in default_performances:
        cursor.execute('''
            INSERT OR IGNORE INTO strategy_performance 
            (strategy_name, success_rate, average_impact, usage_count, last_used, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (*performance, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

# 요청 모델
class StrategyOptimizationRequest(BaseModel):
    original_strategy: str
    context_type: str
    target_audience: str
    desired_outcome: str
    constraints: Optional[List[str]] = []

class ABTestRequest(BaseModel):
    test_name: str
    strategy_a: str
    strategy_b: str
    context_type: str
    sample_size: int = 100

class PerformanceAnalysisRequest(BaseModel):
    strategy_name: str
    time_period: str  # "week", "month", "year"
    metrics: List[str]  # ["success_rate", "impact", "usage"]

# 응답 모델
class StrategyOptimization(BaseModel):
    original_strategy: str
    optimized_strategy: str
    improvement_score: float
    optimization_factors: List[str]
    recommendations: List[str]
    expected_improvement: float

class ABTestResult(BaseModel):
    test_name: str
    strategy_a: str
    strategy_b: str
    winner: str
    confidence_level: float
    sample_size: int
    detailed_results: Dict[str, Any]

class PerformanceAnalysis(BaseModel):
    strategy_name: str
    success_rate: float
    average_impact: float
    usage_count: int
    trend_analysis: str
    recommendations: List[str]

# 전략 최적화 함수
def optimize_strategy(request: StrategyOptimizationRequest) -> StrategyOptimization:
    """전략 최적화"""
    # 기본 최적화 규칙
    optimization_rules = {
        '공감 전략': {
            '건설': '전문적 공감 전략',
            '투자': '데이터 기반 공감 전략',
            '갈등': '중재적 공감 전략'
        },
        '논리 설득': {
            '건설': '기술적 논리 설득',
            '투자': '경제적 논리 설득',
            '갈등': '객관적 논리 설득'
        },
        '감정 호소': {
            '건설': '공동체 감정 호소',
            '투자': '미래 지향 감정 호소',
            '갈등': '화해 지향 감정 호소'
        }
    }
    
    # 최적화된 전략 생성
    optimized_strategy = optimization_rules.get(
        request.original_strategy, 
        {}
    ).get(request.context_type, f"최적화된 {request.original_strategy}")
    
    # 개선 점수 계산
    base_improvement = 0.1
    context_bonus = {
        '건설': 0.05,
        '투자': 0.08,
        '갈등': 0.12
    }
    improvement_score = base_improvement + context_bonus.get(request.context_type, 0.05)
    
    # 최적화 요인
    optimization_factors = [
        f"{request.context_type} 상황에 맞는 조정",
        f"{request.target_audience} 대상 최적화",
        f"{request.desired_outcome} 목표 달성 강화"
    ]
    
    # 추천사항
    recommendations = [
        f"{request.context_type} 상황에서 {optimized_strategy} 사용 권장",
        f"{request.target_audience}에게 맞춤형 메시지 구성",
        "성과 측정을 통한 지속적 개선"
    ]
    
    # 예상 개선도
    expected_improvement = improvement_score * 100
    
    return StrategyOptimization(
        original_strategy=request.original_strategy,
        optimized_strategy=optimized_strategy,
        improvement_score=improvement_score,
        optimization_factors=optimization_factors,
        recommendations=recommendations,
        expected_improvement=expected_improvement
    )

# A/B 테스트 시뮬레이션
def run_ab_test(request: ABTestRequest) -> ABTestResult:
    """A/B 테스트 실행"""
    # 시뮬레이션 결과 생성
    strategy_a_score = 0.75 + random.uniform(-0.1, 0.1)
    strategy_b_score = 0.78 + random.uniform(-0.1, 0.1)
    
    winner = "strategy_a" if strategy_a_score > strategy_b_score else "strategy_b"
    confidence_level = min(0.95, max(0.6, abs(strategy_a_score - strategy_b_score) * 2))
    
    detailed_results = {
        "strategy_a": {
            "success_rate": strategy_a_score,
            "impact_score": 70 + random.uniform(-10, 10),
            "engagement_rate": 0.65 + random.uniform(-0.1, 0.1)
        },
        "strategy_b": {
            "success_rate": strategy_b_score,
            "impact_score": 75 + random.uniform(-10, 10),
            "engagement_rate": 0.70 + random.uniform(-0.1, 0.1)
        }
    }
    
    return ABTestResult(
        test_name=request.test_name,
        strategy_a=request.strategy_a,
        strategy_b=request.strategy_b,
        winner=winner,
        confidence_level=confidence_level,
        sample_size=request.sample_size,
        detailed_results=detailed_results
    )

# 성과 분석
def analyze_performance(request: PerformanceAnalysisRequest) -> PerformanceAnalysis:
    """전략 성과 분석"""
    # 시뮬레이션 데이터
    base_success_rate = 0.80
    base_impact = 75.0
    base_usage = 100
    
    # 시간에 따른 변화 시뮬레이션
    time_multipliers = {
        "week": 1.0,
        "month": 1.05,
        "year": 1.15
    }
    
    multiplier = time_multipliers.get(request.time_period, 1.0)
    
    success_rate = min(1.0, base_success_rate * multiplier + random.uniform(-0.05, 0.05))
    average_impact = base_impact * multiplier + random.uniform(-5, 5)
    usage_count = int(base_usage * multiplier)
    
    # 트렌드 분석
    if success_rate > 0.85:
        trend_analysis = "강한 상승세"
    elif success_rate > 0.80:
        trend_analysis = "안정적 성장"
    else:
        trend_analysis = "개선 필요"
    
    # 추천사항
    recommendations = []
    if success_rate < 0.80:
        recommendations.append("전략 개선이 필요합니다")
    if average_impact < 70:
        recommendations.append("영향력 향상을 위한 조정이 필요합니다")
    if usage_count < 50:
        recommendations.append("사용 빈도를 높이는 것이 좋겠습니다")
    
    return PerformanceAnalysis(
        strategy_name=request.strategy_name,
        success_rate=success_rate,
        average_impact=average_impact,
        usage_count=usage_count,
        trend_analysis=trend_analysis,
        recommendations=recommendations
    )

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "전략 최적화 서버",
        "version": "1.0.0",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "전략 최적화",
            "A/B 테스트",
            "성과 분석",
            "트렌드 분석",
            "개선 추천"
        ]
    }

@app.post("/api/optimize-strategy")
async def optimize_strategy_endpoint(request: StrategyOptimizationRequest):
    """전략 최적화 API"""
    try:
        optimization = optimize_strategy(request)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('strategy_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO strategy_optimizations 
            (original_strategy, optimized_strategy, improvement_score, 
             optimization_factors, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            optimization.original_strategy,
            optimization.optimized_strategy,
            optimization.improvement_score,
            ','.join(optimization.optimization_factors),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "optimization": optimization.dict()
        }
        
    except Exception as e:
        logger.error(f"전략 최적화 오류: {e}")
        raise HTTPException(status_code=500, detail=f"전략 최적화 실패: {str(e)}")

@app.post("/api/run-ab-test")
async def run_ab_test_endpoint(request: ABTestRequest):
    """A/B 테스트 실행 API"""
    try:
        result = run_ab_test(request)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('strategy_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO ab_test_results 
            (test_name, strategy_a, strategy_b, winner, confidence_level, 
             sample_size, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            result.test_name,
            result.strategy_a,
            result.strategy_b,
            result.winner,
            result.confidence_level,
            result.sample_size,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "result": result.dict()
        }
        
    except Exception as e:
        logger.error(f"A/B 테스트 오류: {e}")
        raise HTTPException(status_code=500, detail=f"A/B 테스트 실패: {str(e)}")

@app.post("/api/analyze-performance")
async def analyze_performance_endpoint(request: PerformanceAnalysisRequest):
    """성과 분석 API"""
    try:
        analysis = analyze_performance(request)
        
        return {
            "success": True,
            "analysis": analysis.dict()
        }
        
    except Exception as e:
        logger.error(f"성과 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"성과 분석 실패: {str(e)}")

@app.get("/api/strategy-performance")
async def get_strategy_performance():
    """전략 성과 목록 조회"""
    try:
        conn = sqlite3.connect('strategy_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT strategy_name, success_rate, average_impact, usage_count, last_used
            FROM strategy_performance 
            ORDER BY success_rate DESC
        ''')
        
        performances = []
        for row in cursor.fetchall():
            performances.append({
                'strategy_name': row[0],
                'success_rate': row[1],
                'average_impact': row[2],
                'usage_count': row[3],
                'last_used': row[4]
            })
        
        conn.close()
        
        return {
            "success": True,
            "performances": performances
        }
        
    except Exception as e:
        logger.error(f"전략 성과 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "performances": []
        }

@app.get("/api/optimization-history")
async def get_optimization_history():
    """최적화 히스토리 조회"""
    try:
        conn = sqlite3.connect('strategy_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT original_strategy, optimized_strategy, improvement_score, 
                   optimization_factors, created_at
            FROM strategy_optimizations 
            ORDER BY created_at DESC 
            LIMIT 20
        ''')
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'original_strategy': row[0],
                'optimized_strategy': row[1],
                'improvement_score': row[2],
                'optimization_factors': row[3].split(',') if row[3] else [],
                'created_at': row[4]
            })
        
        conn.close()
        
        return {
            "success": True,
            "history": history
        }
        
    except Exception as e:
        logger.error(f"최적화 히스토리 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "history": []
        }

# 서버 시작
if __name__ == "__main__":
    _p = int(
        os.environ.get(
            "STRATEGY_OPTIMIZATION_SERVER_PORT", os.environ.get("PORT", "8009")
        )
    )
    print("🚀 전략 최적화 서버 시작")
    print("=" * 50)
    print(f"📍 서버 주소: http://localhost:{_p}")
    print(f"📖 API 문서: http://localhost:{_p}/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/optimize-strategy - 전략 최적화")
    print("   POST /api/run-ab-test - A/B 테스트")
    print("   POST /api/analyze-performance - 성과 분석")
    print("   GET /api/strategy-performance - 전략 성과")
    print("   GET /api/optimization-history - 최적화 히스토리")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_strategy_database()
        print("✅ 전략 최적화 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=_p, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 