#!/usr/bin/env python3
"""
통합 분석 API 서버
카카오톡 성향분석, 시공사 편향 분석, 여론 분석을 통합 제공
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import json
import asyncio
from datetime import datetime
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="CORBU AI 통합 분석 API",
    description="카카오톡 성향분석, 시공사 편향 분석, 여론 분석 통합 서버",
    version="2.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청 모델들
class AnalysisRequest(BaseModel):
    content: str
    room_id: str
    analysis_type: Optional[str] = "integrated"
    participants: Optional[List[str]] = []
    date_range: Optional[Dict[str, str]] = None

class ConstructionBiasRequest(BaseModel):
    room_id: str
    start_date: str
    end_date: str
    companies: Optional[List[str]] = []

class TendencyAnalysisRequest(BaseModel):
    content: str
    room_id: str
    target_participants: Optional[List[str]] = []
    analysis_period: Optional[str] = "all"

# 응답 모델들
class AnalysisResult(BaseModel):
    success: bool
    analysis_type: str
    timestamp: str
    results: Dict[str, Any]
    confidence_score: float
    recommendations: List[str]

# 기본 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "CORBU AI 통합 분석 API",
        "version": "2.0.0",
        "status": "운영중",
        "features": [
            "카카오톡 성향 분석",
            "시공사 편향 분석", 
            "여론 동향 분석",
            "통합 인사이트 생성"
        ]
    }

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "integrated_analysis_api"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "server": "integrated_analysis",
        "port": 8006,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    return {
        "status": "online",
        "server": "integrated_analysis",
        "port": 8006,
        "active_analyses": 0,
        "total_analyses_today": 0
    }

# 통합 분석 엔드포인트
@app.post("/api/v1/integrated-analysis")
async def run_integrated_analysis(request: AnalysisRequest) -> AnalysisResult:
    """통합 분석 실행"""
    try:
        logger.info(f"통합 분석 시작 - 방: {request.room_id}")
        
        # 시뮬레이션된 통합 분석 결과
        analysis_results = {
            "kakao_tendency": await analyze_kakao_tendency(request),
            "construction_bias": await analyze_construction_bias(request),
            "opinion_trend": await analyze_opinion_trend(request),
            "cross_analysis": await perform_cross_analysis(request)
        }
        
        # 신뢰도 점수 계산
        confidence_score = calculate_confidence_score(analysis_results)
        
        # 권장사항 생성
        recommendations = generate_recommendations(analysis_results)
        
        return AnalysisResult(
            success=True,
            analysis_type="integrated",
            timestamp=datetime.now().isoformat(),
            results=analysis_results,
            confidence_score=confidence_score,
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"통합 분석 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"통합 분석 실패: {str(e)}")

# 카카오톡 성향 분석
@app.post("/api/v1/kakao-tendency")
async def analyze_kakao_tendency_endpoint(request: TendencyAnalysisRequest):
    """카카오톡 성향 분석"""
    try:
        logger.info(f"카카오톡 성향 분석 시작 - 방: {request.room_id}")
        
        result = await analyze_kakao_tendency(request)
        
        return {
            "success": True,
            "analysis_type": "kakao_tendency",
            "timestamp": datetime.now().isoformat(),
            "results": result
        }
        
    except Exception as e:
        logger.error(f"카카오톡 성향 분석 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"성향 분석 실패: {str(e)}")

# 시공사 편향 분석
@app.post("/api/v1/construction-bias")
async def analyze_construction_bias_endpoint(request: ConstructionBiasRequest):
    """시공사 편향 분석"""
    try:
        logger.info(f"시공사 편향 분석 시작 - 방: {request.room_id}")
        
        result = await analyze_construction_bias(request)
        
        return {
            "success": True,
            "analysis_type": "construction_bias",
            "timestamp": datetime.now().isoformat(),
            "results": result
        }
        
    except Exception as e:
        logger.error(f"시공사 편향 분석 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"편향 분석 실패: {str(e)}")

# 여론 동향 분석
@app.post("/api/v1/opinion-trend")
async def analyze_opinion_trend_endpoint(request: AnalysisRequest):
    """여론 동향 분석"""
    try:
        logger.info(f"여론 동향 분석 시작 - 방: {request.room_id}")
        
        result = await analyze_opinion_trend(request)
        
        return {
            "success": True,
            "analysis_type": "opinion_trend", 
            "timestamp": datetime.now().isoformat(),
            "results": result
        }
        
    except Exception as e:
        logger.error(f"여론 동향 분석 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"여론 분석 실패: {str(e)}")

# 실시간 분석 상태
@app.get("/api/v1/analysis-status/{room_id}")
async def get_analysis_status(room_id: str):
    """실시간 분석 상태 조회"""
    return {
        "room_id": room_id,
        "status": "active",
        "last_analysis": datetime.now().isoformat(),
        "total_messages": 1247,
        "analyzed_messages": 1247,
        "analysis_progress": 100.0
    }

# 분석 이력
@app.get("/api/v1/analysis-history/{room_id}")
async def get_analysis_history(room_id: str):
    """분석 이력 조회"""
    return {
        "room_id": room_id,
        "history": [
            {
                "timestamp": "2025-01-12T10:30:00",
                "type": "integrated",
                "confidence": 0.89,
                "key_insights": ["전반적으로 긍정적 여론", "특정 시공사에 대한 편향 발견"]
            },
            {
                "timestamp": "2025-01-12T09:15:00", 
                "type": "tendency",
                "confidence": 0.92,
                "key_insights": ["참여자별 성향 분석 완료", "주요 의견 리더 식별"]
            }
        ]
    }

# 분석 함수들 (시뮬레이션)
async def analyze_kakao_tendency(request) -> Dict[str, Any]:
    """카카오톡 성향 분석 시뮬레이션"""
    await asyncio.sleep(0.5)  # 실제 분석 시뮬레이션
    
    return {
        "participants_analysis": {
            "total_participants": 15,
            "active_participants": 12,
            "tendency_distribution": {
                "positive": 40.5,
                "neutral": 35.2, 
                "negative": 24.3
            },
            "key_participants": [
                {"name": "참여자A", "tendency": "positive", "influence_score": 8.7},
                {"name": "참여자B", "tendency": "neutral", "influence_score": 7.2},
                {"name": "참여자C", "tendency": "negative", "influence_score": 6.8}
            ]
        },
        "message_patterns": {
            "total_messages": 1247,
            "question_ratio": 23.4,
            "opinion_ratio": 45.6,
            "fact_sharing_ratio": 31.0
        },
        "communication_style": {
            "formal_ratio": 35.8,
            "informal_ratio": 64.2,
            "emoji_usage": 28.5
        }
    }

async def analyze_construction_bias(request) -> Dict[str, Any]:
    """시공사 편향 분석 시뮬레이션"""
    await asyncio.sleep(0.7)
    
    return {
        "overall_bias": {
            "bias_score": 6.3,
            "bias_direction": "slightly_positive",
            "confidence": 0.87
        },
        "company_analysis": {
            "mentioned_companies": ["A건설", "B건설", "C건설"],
            "bias_scores": {
                "A건설": {"score": 7.2, "mentions": 45, "sentiment": "positive"},
                "B건설": {"score": 5.1, "mentions": 28, "sentiment": "neutral"},
                "C건설": {"score": 3.8, "mentions": 12, "sentiment": "negative"}
            }
        },
        "promotional_content": {
            "detected_promotions": 8,
            "promotional_ratio": 15.2,
            "common_themes": ["품질 강조", "가격 경쟁력", "완공 사례"]
        },
        "opposition_analysis": {
            "opposition_messages": 5,
            "common_concerns": ["공사 기간", "품질 우려", "가격 문제"]
        }
    }

async def analyze_opinion_trend(request) -> Dict[str, Any]:
    """여론 동향 분석 시뮬레이션"""
    await asyncio.sleep(0.6)
    
    return {
        "trend_overview": {
            "overall_sentiment": "positive",
            "sentiment_score": 6.8,
            "trend_direction": "improving"
        },
        "timeline_analysis": {
            "periods": [
                {"period": "week1", "sentiment": 5.2, "key_events": ["첫 회의"]},
                {"period": "week2", "sentiment": 6.1, "key_events": ["설명회"]},
                {"period": "week3", "sentiment": 6.8, "key_events": ["질의응답"]},
                {"period": "current", "sentiment": 7.1, "key_events": ["합의 진행"]}
            ]
        },
        "influential_factors": [
            {"factor": "가격 투명성", "impact": 8.5, "type": "positive"},
            {"factor": "공사 일정", "impact": 6.2, "type": "neutral"},
            {"factor": "품질 보증", "impact": 7.8, "type": "positive"}
        ]
    }

async def perform_cross_analysis(request) -> Dict[str, Any]:
    """교차 분석 시뮬레이션"""
    await asyncio.sleep(0.4)
    
    return {
        "correlation_analysis": {
            "tendency_bias_correlation": 0.73,
            "participant_influence_correlation": 0.82
        },
        "key_insights": [
            "긍정적 성향을 가진 참여자들이 특정 업체를 선호하는 경향",
            "영향력 있는 참여자의 의견이 전체 여론에 큰 영향",
            "시간이 지날수록 합의점을 찾아가는 패턴"
        ],
        "risk_factors": [
            {"factor": "정보 편향", "level": "medium", "probability": 0.35},
            {"factor": "집단 사고", "level": "low", "probability": 0.18}
        ]
    }

def calculate_confidence_score(analysis_results: Dict[str, Any]) -> float:
    """신뢰도 점수 계산"""
    # 각 분석 결과의 신뢰도를 종합하여 계산
    scores = []
    
    if "kakao_tendency" in analysis_results:
        scores.append(0.89)
    if "construction_bias" in analysis_results:
        scores.append(0.87)
    if "opinion_trend" in analysis_results:
        scores.append(0.91)
    if "cross_analysis" in analysis_results:
        scores.append(0.85)
    
    return sum(scores) / len(scores) if scores else 0.0

def generate_recommendations(analysis_results: Dict[str, Any]) -> List[str]:
    """권장사항 생성"""
    recommendations = []
    
    # 성향 분석 기반 권장사항
    if "kakao_tendency" in analysis_results:
        recommendations.append("참여자별 맞춤형 커뮤니케이션 전략 수립 권장")
        recommendations.append("부정적 성향 참여자들과의 개별 대화 필요")
    
    # 편향 분석 기반 권장사항 
    if "construction_bias" in analysis_results:
        recommendations.append("편향되지 않은 객관적 정보 제공 필요")
        recommendations.append("다양한 업체 옵션에 대한 균형잡힌 설명 권장")
    
    # 여론 분석 기반 권장사항
    if "opinion_trend" in analysis_results:
        recommendations.append("현재 긍정적 분위기를 유지하는 방향으로 진행")
        recommendations.append("우려사항에 대한 적극적 해명 및 대응 필요")
    
    return recommendations

# 서버 시작
if __name__ == "__main__":
    print("🚀 CORBU AI 통합 분석 API 서버 시작")
    print("=" * 60)
    print("📍 서버 주소: http://localhost:8006")
    print("📖 API 문서: http://localhost:8006/docs")
    print("🎯 주요 기능:")
    print("   🔍 통합 분석: POST /api/v1/integrated-analysis")
    print("   📊 성향 분석: POST /api/v1/kakao-tendency")
    print("   🏗️ 편향 분석: POST /api/v1/construction-bias")
    print("   📈 여론 분석: POST /api/v1/opinion-trend")
    print("   📋 분석 상태: GET /api/v1/analysis-status/{room_id}")
    print("   📚 분석 이력: GET /api/v1/analysis-history/{room_id}")
    print("")
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8006, log_level="info")
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc()
