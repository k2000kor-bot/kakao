"""
정치인 스타일 메시지 생성 API
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

# 라우터 생성
political_router = APIRouter(prefix="/api/v7/political-style", tags=["정치인 스타일"])

# 요청/응답 모델
class PoliticalStyleRequest(BaseModel):
    target_topic: str
    political_style: str = "유시민"
    message_intent: str = "설명"
    context_messages: Optional[List[Dict[str, Any]]] = None

class HybridPoliticalRequest(BaseModel):
    person_id: str
    target_topic: str
    political_style: str = "유시민"
    message_intent: str = "설명"
    political_blend_ratio: float = 0.3
    context_messages: Optional[List[Dict[str, Any]]] = None

class StyleRecommendationRequest(BaseModel):
    person_id: str
    target_topic: str

class StyleAnalysisRequest(BaseModel):
    message: str

class StyleComparisonRequest(BaseModel):
    target_topic: str
    political_styles: List[str] = ["유시민", "윤석열", "이재명"]
    message_intent: str = "설명"

# 전역 변수로 통합 시스템 참조
integrated_system = None

def set_integrated_system(system):
    """통합 시스템 설정"""
    global integrated_system
    integrated_system = system

@political_router.post("/generate")
async def generate_political_style_message(request: PoliticalStyleRequest):
    """정치인 스타일 메시지 생성"""
    
    try:
        if not integrated_system:
            raise HTTPException(status_code=500, detail="통합 시스템이 초기화되지 않았습니다")
        
        # 정치인 스타일 메시지 생성
        result = integrated_system.generate_political_style_message(
            target_topic=request.target_topic,
            political_style=request.political_style,
            message_intent=request.message_intent,
            context_messages=request.context_messages or []
        )
        
        return {
            "success": True,
            "message": result,
            "political_style_used": request.political_style,
            "generation_metadata": {
                "target_topic": request.target_topic,
                "message_intent": request.message_intent,
                "context_messages_count": len(request.context_messages or [])
            }
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 메시지 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@political_router.get("/available-styles")
async def get_available_political_styles():
    """사용 가능한 정치인 스타일 목록 조회"""
    
    try:
        if not integrated_system:
            raise HTTPException(status_code=500, detail="통합 시스템이 초기화되지 않았습니다")
        
        styles = integrated_system.political_generator.get_available_styles()
        
        return {
            "success": True,
            "available_styles": styles,
            "total_count": len(styles)
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@political_router.post("/recommend")
async def recommend_political_style(request: StyleRecommendationRequest):
    """개인별 정치인 스타일 추천"""
    
    try:
        if not integrated_system:
            raise HTTPException(status_code=500, detail="통합 시스템이 초기화되지 않았습니다")
        
        # 정치인 스타일 추천
        recommendation = integrated_system.recommend_political_style_for_person(
            person_id=request.person_id,
            target_topic=request.target_topic
        )
        
        return {
            "success": True,
            "recommendation": recommendation
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 추천 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@political_router.post("/hybrid-generate")
async def generate_hybrid_political_message(request: HybridPoliticalRequest):
    """개인 프로필과 정치인 스타일을 결합한 하이브리드 메시지 생성"""
    
    try:
        if not integrated_system:
            raise HTTPException(status_code=500, detail="통합 시스템이 초기화되지 않았습니다")
        
        # 하이브리드 메시지 생성
        result = integrated_system.generate_hybrid_message(
            person_id=request.person_id,
            target_topic=request.target_topic,
            political_style=request.political_style,
            message_intent=request.message_intent,
            political_blend_ratio=request.political_blend_ratio,
            context_messages=request.context_messages or []
        )
        
        return {
            "success": True,
            "message": result,
            "generation_metadata": {
                "person_id": request.person_id,
                "political_style": request.political_style,
                "blend_ratio": request.political_blend_ratio,
                "message_intent": request.message_intent
            }
        }
        
    except Exception as e:
        logger.error(f"하이브리드 메시지 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@political_router.post("/analyze")
async def analyze_message_political_style(request: StyleAnalysisRequest):
    """메시지의 정치인 스타일 분석"""
    
    try:
        if not integrated_system:
            raise HTTPException(status_code=500, detail="통합 시스템이 초기화되지 않았습니다")
        
        # 정치인 스타일 분석
        analysis_result = integrated_system.political_generator.analyze_political_style(request.message)
        
        return {
            "success": True,
            "analysis": analysis_result
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 분석 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@political_router.post("/compare")
async def compare_political_styles(request: StyleComparisonRequest):
    """여러 정치인 스타일로 동일한 주제에 대한 메시지 비교"""
    
    try:
        if not integrated_system:
            raise HTTPException(status_code=500, detail="통합 시스템이 초기화되지 않았습니다")
        
        # 여러 정치인 스타일로 메시지 생성
        comparison_results = []
        
        for style in request.political_styles:
            try:
                result = integrated_system.generate_political_style_message(
                    target_topic=request.target_topic,
                    political_style=style,
                    message_intent=request.message_intent
                )
                comparison_results.append({
                    "political_style": style,
                    "message": result,
                    "success": True
                })
            except Exception as e:
                comparison_results.append({
                    "political_style": style,
                    "message": None,
                    "success": False,
                    "error": str(e)
                })
        
        return {
            "success": True,
            "target_topic": request.target_topic,
            "message_intent": request.message_intent,
            "comparison_results": comparison_results
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 비교 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@political_router.post("/demo")
async def demo_political_style_generation():
    """정치인 스타일 메시지 생성 데모"""
    
    try:
        if not integrated_system:
            raise HTTPException(status_code=500, detail="통합 시스템이 초기화되지 않았습니다")
        
        # 데모용 주제들
        demo_topics = [
            "부동산 정책",
            "교육 개혁",
            "경제 활성화",
            "복지 정책",
            "외교 정책"
        ]
        
        # 데모용 정치인 스타일들
        demo_styles = ["유시민", "윤석열", "이재명", "안철수", "심상정"]
        
        demo_results = []
        
        for topic in demo_topics[:2]:  # 처음 2개 주제만
            for style in demo_styles[:3]:  # 처음 3개 스타일만
                try:
                    result = integrated_system.generate_political_style_message(
                        target_topic=topic,
                        political_style=style,
                        message_intent="설명"
                    )
                    demo_results.append({
                        "topic": topic,
                        "political_style": style,
                        "message": result,
                        "success": True
                    })
                except Exception as e:
                    demo_results.append({
                        "topic": topic,
                        "political_style": style,
                        "message": None,
                        "success": False,
                        "error": str(e)
                    })
        
        return {
            "success": True,
            "demo_type": "political_style_generation",
            "total_generated": len([r for r in demo_results if r["success"]]),
            "demo_results": demo_results
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 데모 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 