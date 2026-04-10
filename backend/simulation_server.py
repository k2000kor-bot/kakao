#!/usr/bin/env python3
"""
시뮬레이션 전용 서버
메시지 시뮬레이션, 영향 예측 기능만 포함
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
    title="시뮬레이션 서버",
    description="메시지 시뮬레이션 전용 API 서버",
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
def init_simulation_database():
    """시뮬레이션용 데이터베이스 초기화"""
    conn = sqlite3.connect('simulation_system.db')
    cursor = conn.cursor()
    
    # 시뮬레이션 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS simulation_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            simulation_id TEXT UNIQUE NOT NULL,
            original_message TEXT NOT NULL,
            generated_message TEXT NOT NULL,
            strategy TEXT NOT NULL,
            steps TEXT,
            total_probability REAL,
            total_impact REAL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 시뮬레이션 단계 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS simulation_steps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            simulation_id TEXT NOT NULL,
            step_number INTEGER NOT NULL,
            action TEXT NOT NULL,
            expected_response TEXT,
            probability REAL,
            impact REAL,
            strategy TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 영향 예측 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS impact_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT NOT NULL,
            predicted_impact REAL,
            confidence REAL,
            factors TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# 요청 모델
class SimulationRequest(BaseModel):
    target_message: Dict[str, str]
    tone: str
    message_format: str
    intent: str
    strategy: Optional[str] = "공감 전략"
    simulation_steps: Optional[int] = 3

class ImpactPredictionRequest(BaseModel):
    message: str
    target_audience: str
    context: str

# 응답 모델
class SimulationStep(BaseModel):
    step: int
    action: str
    expected_response: str
    probability: float
    impact: float
    strategy: str

class SimulationResult(BaseModel):
    simulation_id: str
    original_message: str
    generated_message: str
    steps: List[SimulationStep]
    total_probability: float
    total_impact: float
    strategy: str
    created_at: str

class ImpactPrediction(BaseModel):
    predicted_impact: float
    confidence: float
    factors: List[str]
    recommendations: List[str]

# 시뮬레이션 전략
SIMULATION_STRATEGIES = {
    '공감 전략': {
        'steps': [
            '공감 표현으로 시작',
            '상황 공유',
            '해결책 제시',
            '지지 표현'
        ],
        'probabilities': [0.9, 0.8, 0.7, 0.6],
        'impacts': [60, 70, 80, 75]
    },
    '논리 설득': {
        'steps': [
            '사실 제시',
            '데이터 분석',
            '논리적 결론',
            '행동 촉구'
        ],
        'probabilities': [0.8, 0.7, 0.6, 0.5],
        'impacts': [70, 80, 85, 90]
    },
    '감정 호소': {
        'steps': [
            '감정적 공감',
            '공동체 의식 강조',
            '미래 비전 제시',
            '함께 노력 강조'
        ],
        'probabilities': [0.7, 0.6, 0.5, 0.4],
        'impacts': [65, 75, 85, 80]
    },
    '권위 인용': {
        'steps': [
            '전문가 의견 인용',
            '신뢰성 강조',
            '검증된 방법 제시',
            '실행 권고'
        ],
        'probabilities': [0.9, 0.8, 0.7, 0.6],
        'impacts': [80, 85, 90, 85]
    },
    '사회적 증명': {
        'steps': [
            '다른 사람들의 의견 제시',
            '성공 사례 공유',
            '일반적 동의 강조',
            '참여 권유'
        ],
        'probabilities': [0.8, 0.7, 0.6, 0.5],
        'impacts': [75, 80, 85, 80]
    }
}

# 시뮬레이션 실행
def run_simulation(request: SimulationRequest) -> SimulationResult:
    """메시지 시뮬레이션 실행"""
    strategy = request.strategy
    strategy_config = SIMULATION_STRATEGIES.get(strategy, SIMULATION_STRATEGIES['공감 전략'])
    
    # 시뮬레이션 ID 생성
    simulation_id = f"sim_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}"
    
    # 메시지 생성 (간단한 템플릿)
    message_templates = {
        '공감 전략': "말씀하신 {intent}에 대해 충분히 이해합니다. 함께 해결책을 찾아보시죠.",
        '논리 설득': "{intent}에 대한 객관적 데이터를 바탕으로 설명드리겠습니다.",
        '감정 호소': "우리 모두의 미래를 위해 {intent}에 집중해야 합니다.",
        '권위 인용': "전문가들의 의견에 따르면 {intent}가 중요하다고 합니다.",
        '사회적 증명': "다른 분들도 {intent}에 동의하고 있습니다."
    }
    
    generated_message = message_templates.get(strategy, message_templates['공감 전략']).format(
        intent=request.intent
    )
    
    # 시뮬레이션 단계 생성
    steps = []
    total_probability = 1.0
    total_impact = 0.0
    
    for i, (step_action, base_prob, base_impact) in enumerate(zip(
        strategy_config['steps'],
        strategy_config['probabilities'],
        strategy_config['impacts']
    )):
        # 확률과 영향력에 랜덤 요소 추가
        probability = max(0.1, min(1.0, base_prob + random.uniform(-0.1, 0.1)))
        impact = max(10, min(100, base_impact + random.uniform(-10, 10)))
        
        # 예상 응답 생성
        expected_responses = [
            "네, 맞습니다.",
            "좋은 제안이네요.",
            "그렇게 하면 좋겠어요.",
            "동의합니다.",
            "함께 노력해보죠."
        ]
        expected_response = random.choice(expected_responses)
        
        step = SimulationStep(
            step=i + 1,
            action=step_action,
            expected_response=expected_response,
            probability=probability,
            impact=impact,
            strategy=strategy
        )
        
        steps.append(step)
        total_probability *= probability
        total_impact += impact
    
    # 평균 영향력 계산
    total_impact = total_impact / len(steps)
    
    # target_message가 딕셔너리인지 문자열인지 확인
    if isinstance(request.target_message, dict):
        original_message = request.target_message.get('content', '')
    else:
        original_message = str(request.target_message)
    
    return SimulationResult(
        simulation_id=simulation_id,
        original_message=original_message,
        generated_message=generated_message,
        steps=steps,
        total_probability=total_probability,
        total_impact=total_impact,
        strategy=strategy,
        created_at=datetime.now().isoformat()
    )

# 영향 예측
def predict_impact(request: ImpactPredictionRequest) -> ImpactPrediction:
    """메시지의 영향력 예측"""
    # 기본 영향력 점수
    base_impact = 50.0
    
    # 메시지 길이에 따른 조정
    message_length = len(request.message)
    if message_length > 100:
        base_impact += 10
    elif message_length < 20:
        base_impact -= 10
    
    # 감정적 키워드 분석
    positive_keywords = ['좋은', '감사', '행복', '만족', '성공', '희망']
    negative_keywords = ['나쁜', '실패', '실망', '걱정', '불안', '화가']
    
    positive_count = sum(1 for keyword in positive_keywords if keyword in request.message)
    negative_count = sum(1 for keyword in negative_keywords if keyword in request.message)
    
    if positive_count > negative_count:
        base_impact += 15
    elif negative_count > positive_count:
        base_impact -= 15
    
    # 대상에 따른 조정
    audience_factors = {
        '일반': 0,
        '전문가': 10,
        '관리자': 15,
        '동료': 5,
        '고객': 20
    }
    base_impact += audience_factors.get(request.target_audience, 0)
    
    # 컨텍스트에 따른 조정
    context_factors = {
        '긴급': 20,
        '일반': 0,
        '중요': 15,
        '개인적': 10,
        '업무적': 5
    }
    base_impact += context_factors.get(request.context, 0)
    
    # 최종 점수 조정
    final_impact = max(0, min(100, base_impact + random.uniform(-10, 10)))
    confidence = 0.7 + random.uniform(0, 0.2)
    
    # 영향 요인
    factors = []
    if positive_count > negative_count:
        factors.append("긍정적 키워드 사용")
    if message_length > 50:
        factors.append("적절한 메시지 길이")
    if request.target_audience in ['관리자', '고객']:
        factors.append("적절한 대상 설정")
    
    # 추천사항
    recommendations = []
    if final_impact < 50:
        recommendations.append("더 구체적인 내용 추가 필요")
    if confidence < 0.8:
        recommendations.append("더 명확한 메시지 구성 필요")
    if negative_count > positive_count:
        recommendations.append("긍정적 표현으로 전환 권장")
    
    return ImpactPrediction(
        predicted_impact=final_impact,
        confidence=confidence,
        factors=factors,
        recommendations=recommendations
    )

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "시뮬레이션 서버",
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
            "메시지 시뮬레이션",
            "영향력 예측",
            "단계별 분석",
            "확률 계산",
            "전략별 시뮬레이션"
        ]
    }

@app.post("/api/simulate-response")
async def simulate_response_endpoint(request: SimulationRequest):
    """메시지 시뮬레이션 API"""
    try:
        simulation_result = run_simulation(request)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('simulation_system.db')
        cursor = conn.cursor()
        
        # 시뮬레이션 결과 저장
        cursor.execute('''
            INSERT INTO simulation_results 
            (simulation_id, original_message, generated_message, strategy, 
             steps, total_probability, total_impact, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            simulation_result.simulation_id,
            simulation_result.original_message,
            simulation_result.generated_message,
            simulation_result.strategy,
            json.dumps([step.dict() for step in simulation_result.steps]),
            simulation_result.total_probability,
            simulation_result.total_impact,
            simulation_result.created_at
        ))
        
        # 시뮬레이션 단계 저장
        for step in simulation_result.steps:
            cursor.execute('''
                INSERT INTO simulation_steps 
                (simulation_id, step_number, action, expected_response, 
                 probability, impact, strategy, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                simulation_result.simulation_id,
                step.step,
                step.action,
                step.expected_response,
                step.probability,
                step.impact,
                step.strategy,
                simulation_result.created_at
            ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "simulation": simulation_result.dict()
        }
        
    except Exception as e:
        logger.error(f"시뮬레이션 오류: {e}")
        raise HTTPException(status_code=500, detail=f"시뮬레이션 실패: {str(e)}")

@app.post("/api/predict-impact")
async def predict_impact_endpoint(request: ImpactPredictionRequest):
    """영향력 예측 API"""
    try:
        prediction = predict_impact(request)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('simulation_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO impact_predictions 
            (message_id, predicted_impact, confidence, factors, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            prediction.predicted_impact,
            prediction.confidence,
            ','.join(prediction.factors),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "prediction": prediction.dict()
        }
        
    except Exception as e:
        logger.error(f"영향력 예측 오류: {e}")
        raise HTTPException(status_code=500, detail=f"영향력 예측 실패: {str(e)}")

@app.get("/api/simulation-history")
async def get_simulation_history():
    """시뮬레이션 히스토리 조회"""
    try:
        conn = sqlite3.connect('simulation_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT simulation_id, original_message, generated_message, 
                   strategy, total_probability, total_impact, created_at
            FROM simulation_results 
            ORDER BY created_at DESC 
            LIMIT 20
        ''')
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'simulation_id': row[0],
                'original_message': row[1],
                'generated_message': row[2],
                'strategy': row[3],
                'total_probability': row[4],
                'total_impact': row[5],
                'created_at': row[6]
            })
        
        conn.close()
        
        return {
            "success": True,
            "history": history
        }
        
    except Exception as e:
        logger.error(f"시뮬레이션 히스토리 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "history": []
        }

# 서버 시작
if __name__ == "__main__":
    _sim = int(
        os.environ.get("SIMULATION_SERVER_PORT", os.environ.get("PORT", "8009"))
    )
    print("🚀 시뮬레이션 서버 시작")
    print("=" * 50)
    print(f"📍 서버 주소: http://localhost:{_sim}")
    print(f"📖 API 문서: http://localhost:{_sim}/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/simulate-response - 메시지 시뮬레이션")
    print("   POST /api/predict-impact - 영향력 예측")
    print("   GET /api/simulation-history - 시뮬레이션 히스토리")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_simulation_database()
        print("✅ 시뮬레이션 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn

        uvicorn.run(app, host="0.0.0.0", port=_sim, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 