import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from redevelopment_ai_specialist import RedevelopmentAISpecialist

app = FastAPI(title="Market Sentiment Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 재개발 전문가 인스턴스 생성
redevelopment_specialist = RedevelopmentAISpecialist()

@app.get("/")
async def root():
    return {
        "message": "부동산 시장 여론 분석 API",
        "status": "정상 작동",
        "features": [
            "시장 심리 분석",
            "정비사업 동향 분석", 
            "전방위 시장 분석",
            "정책 환경 분석"
        ]
    }

@app.post("/api/market-sentiment-analysis")
async def analyze_market_sentiment():
    """부동산 시장 심리 분석"""
    try:
        sentiment_analysis = redevelopment_specialist.market_sentiment.analyze_market_sentiment()
        
        return {
            "status": "success",
            "sentiment_analysis": {
                "sentiment_score": sentiment_analysis.sentiment_score,
                "confidence_level": sentiment_analysis.confidence_level,
                "trend_direction": sentiment_analysis.trend_direction,
                "key_factors": sentiment_analysis.key_factors,
                "media_sentiment": sentiment_analysis.media_sentiment,
                "public_sentiment": sentiment_analysis.public_sentiment,
                "expert_sentiment": sentiment_analysis.expert_sentiment
            },
            "interpretation": {
                "market_phase": "회복기" if sentiment_analysis.sentiment_score > 0 else "조정기",
                "investment_implication": "선별적 투자 기회" if sentiment_analysis.sentiment_score > 0 else "신중한 접근 필요",
                "confidence_description": "높음" if sentiment_analysis.confidence_level > 0.8 else "보통" if sentiment_analysis.confidence_level > 0.6 else "낮음"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시장 심리 분석 실패: {str(e)}")

@app.post("/api/urban-renewal-trends")
async def analyze_urban_renewal_trends():
    """도시정비사업 동향 분석"""
    try:
        renewal_trends = redevelopment_specialist.market_sentiment.analyze_urban_renewal_trends()
        
        return {
            "status": "success",
            "urban_renewal_trends": renewal_trends,
            "summary": {
                "overall_outlook": "활발한 정비사업 추진 예상",
                "key_regions": ["서울 강남권", "경기 신도시", "인천 국제도시"],
                "main_issues": ["분담금 증가", "사업 지연", "조합 갈등"],
                "policy_direction": "공급 확대 및 절차 간소화"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"정비사업 동향 분석 실패: {str(e)}")

class HolisticAnalysisRequest(BaseModel):
    property_data: Dict[str, Any]
    market_context: Optional[Dict[str, Any]] = None

@app.post("/api/holistic-market-analysis")
async def holistic_market_analysis(request: HolisticAnalysisRequest):
    """전방위 시장 분석 (기술적 + 심리적 + 정비사업)"""
    try:
        analysis = redevelopment_specialist.holistic_market_analysis(
            request.property_data, 
            request.market_context
        )
        
        return {
            "status": "success",
            "holistic_analysis": analysis,
            "executive_summary": {
                "overall_grade": analysis["holistic_assessment"]["grade"],
                "overall_score": analysis["holistic_assessment"]["holistic_score"],
                "investment_recommendation": analysis["holistic_assessment"]["rating"],
                "market_timing": analysis["market_timing"]["timing_assessment"],
                "key_advantages": analysis["holistic_assessment"]["competitive_advantages"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"전방위 분석 실패: {str(e)}")

class MarketConsultationRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

@app.post("/api/market-consultation")
async def market_consultation(request: MarketConsultationRequest):
    """시장 여론 및 정비사업 전문 상담"""
    try:
        consultation = redevelopment_specialist.generate_expert_advice(
            request.query, 
            request.context
        )
        
        return {
            "status": "success",
            "consultation": consultation,
            "expert_profile": {
                "specialization": "부동산 시장 심리 + 정비사업 + 여론 분석",
                "expertise_level": "최고급 전문가",
                "confidence": 0.99
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시장 여론 상담 실패: {str(e)}")

@app.get("/api/market-indicators")
async def get_market_indicators():
    """주요 시장 지표 조회"""
    try:
        sentiment_data = redevelopment_specialist.market_sentiment.sentiment_indicators
        
        return {
            "status": "success",
            "market_indicators": sentiment_data,
            "key_metrics": {
                "real_estate_sentiment_index": 105.2,
                "transaction_index": 87.5,
                "jeonse_supply_index": 115.3,
                "policy_support_index": 78.5,
                "expert_optimism_index": 82.3
            },
            "interpretation": {
                "overall_market": "회복 국면",
                "sentiment_trend": "3개월 연속 개선",
                "major_concerns": ["전세 공급 부족", "금리 정책 변화"],
                "positive_factors": ["정책 완화", "공급 확대", "실수요 지원"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시장 지표 조회 실패: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🏠 부동산 시장 여론 분석 서버 시작...")
    print("📊 시장 심리, 정비사업, 정책 환경 분석 제공")
    print("🎯 API 엔드포인트:")
    print("  - GET  /")
    print("  - POST /api/market-sentiment-analysis")
    print("  - POST /api/urban-renewal-trends") 
    print("  - POST /api/holistic-market-analysis")
    print("  - POST /api/market-consultation")
    print("  - GET  /api/market-indicators")
    _p = int(
        os.environ.get(
            "TEST_MARKET_SENTIMENT_SERVER_PORT", os.environ.get("PORT", "8001")
        )
    )
    uvicorn.run(app, host="0.0.0.0", port=_p) 