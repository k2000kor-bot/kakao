#!/usr/bin/env python3
"""
카카오 AI 메시지 생성 시스템 데모 서버
- 정치인 스타일 메시지 생성
- 개인 성향 기반 메시지 생성  
- 고도화된 대화 분석
- 통합 테스트 API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn
import logging

# 시스템 모듈들
from political_style_generator import PoliticalStyleGenerator
from ai_message_generator import AIMessageGenerator
from enhanced_conversation_summarizer import EnhancedConversationSummarizer
from chat_conversation_analyzer import ChatConversationAnalyzer
from advanced_korean_ai_analyzer import AdvancedKoreanAIAnalyzer

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="카카오 AI 메시지 생성 시스템 데모",
    description="정치인 스타일, 개인 성향, 고도화 분석을 통합한 AI 메시지 생성 시스템",
    version="6.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 변수들
analyzer = None
ai_analyzer = None
generator = None
summarizer = None


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 시스템 초기화"""
    global analyzer, ai_analyzer, generator, summarizer
    
    logger.info("🚀 카카오 AI 메시지 시스템 초기화 시작...")
    
    try:
        # 1. 기본 분석 시스템
        analyzer = ChatConversationAnalyzer()
        logger.info("✅ 기본 대화 분석 시스템 초기화 완료")
        
        # 2. AI 고급 분석 시스템
        ai_analyzer = AdvancedKoreanAIAnalyzer(analyzer)
        logger.info("✅ AI 고급 분석 시스템 초기화 완료")
        
        # 3. 메시지 생성 시스템 (정치인 스타일 포함)
        generator = AIMessageGenerator(analyzer, ai_analyzer)
        logger.info("✅ AI 메시지 생성 시스템 초기화 완료")
        
        # 4. 고도화된 요약 시스템
        summarizer = EnhancedConversationSummarizer(analyzer, ai_analyzer, generator)
        logger.info("✅ 고도화된 요약 시스템 초기화 완료")
        
        logger.info("🏆 **전체 시스템 초기화 성공!**")
        
    except Exception as e:
        logger.error(f"❌ 시스템 초기화 실패: {e}")
        raise


@app.get("/")
async def root():
    """루트 엔드포인트 - 시스템 상태 확인"""
    return {
        "service": "카카오 AI 메시지 생성 시스템 데모",
        "version": "6.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "정치인 스타일 메시지 생성 (6명)",
            "개인 성향 기반 메시지 생성",
            "혼합 스타일 메시지 생성",
            "고도화된 대화 분석",
            "품질 검증 및 가이드라인 준수",
            "한국어 최적화"
        ],
        "endpoints": {
            "demo": "/demo/all-styles",
            "political_style": "/demo/political-style",
            "personal_style": "/demo/personal-style",
            "hybrid_style": "/demo/hybrid-style",
            "analysis": "/demo/analysis",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """시스템 건강 상태 확인"""
    try:
        # 시스템 구성 요소 확인
        guidelines_count = len(generator._load_project_guidelines()) if generator else 0
        templates_count = len(generator.korean_message_templates) if generator else 0
        political_styles_count = len(generator.get_available_political_styles()) if generator else 0
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "analyzer": analyzer is not None,
                "ai_analyzer": ai_analyzer is not None,
                "generator": generator is not None,
                "summarizer": summarizer is not None
            },
            "configuration": {
                "guidelines": guidelines_count,
                "templates": templates_count,
                "political_styles": political_styles_count
            }
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@app.post("/demo/all-styles")
async def demo_all_political_styles(request: dict = None):
    """모든 정치인 스타일 데모"""
    try:
        topic = request.get("topic", "시공사 선정") if request else "시공사 선정"
        
        styles = ["유시민", "정준희", "진중권", "박형준", "정원책", "이철희"]
        results = {}
        
        for style in styles:
            try:
                message = generator.generate_political_style_message(
                    politician_style=style,
                    target_topic=topic,
                    message_intent="의견형"
                )
                
                results[style] = {
                    "content": message.content,
                    "confidence_score": message.confidence_score,
                    "authenticity_score": message.authenticity_score,
                    "style_elements": message.style_elements_used
                }
                
            except Exception as style_error:
                results[style] = {"error": str(style_error)}
        
        return {
            "success": True,
            "demo_type": "all_political_styles",
            "topic": topic,
            "results": results,
            "summary": {
                "total_styles": len(styles),
                "successful": len([r for r in results.values() if "error" not in r]),
                "failed": len([r for r in results.values() if "error" in r])
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데모 실행 실패: {str(e)}")


@app.post("/demo/political-style")
async def demo_political_style(request: dict):
    """특정 정치인 스타일 데모"""
    try:
        politician_style = request.get("politician_style", "유시민")
        topic = request.get("topic", "분담금")
        intent = request.get("intent", "의견형")
        
        message = generator.generate_political_style_message(
            politician_style=politician_style,
            target_topic=topic,
            message_intent=intent
        )
        
        return {
            "success": True,
            "demo_type": "political_style",
            "input": {
                "politician_style": politician_style,
                "topic": topic,
                "intent": intent
            },
            "result": {
                "message_id": message.message_id,
                "content": message.content,
                "confidence_score": message.confidence_score,
                "authenticity_score": message.authenticity_score,
                "style_elements_used": message.style_elements_used
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"정치인 스타일 데모 실패: {str(e)}")


@app.post("/demo/hybrid-style")
async def demo_hybrid_style(request: dict):
    """혼합 스타일 데모"""
    try:
        person_name = request.get("person_name", "김조합원")
        politician_style = request.get("politician_style", "박형준")
        topic = request.get("topic", "투명성")
        intent = request.get("intent", "제안형")
        blend_ratio = request.get("blend_ratio", 0.7)
        
        # 개인 프로필 생성 (데모용)
        personal_message = generator.generate_contextual_message(
            person_name=person_name,
            target_topic=topic,
            message_intent=intent
        )
        
        # 정치인 스타일 메시지
        political_message = generator.generate_political_style_message(
            politician_style=politician_style,
            target_topic=topic,
            message_intent=intent
        )
        
        # 혼합 메시지
        hybrid_message = generator.generate_hybrid_message(
            person_name=person_name,
            politician_style=politician_style,
            target_topic=topic,
            message_intent=intent,
            blend_ratio=blend_ratio
        )
        
        return {
            "success": True,
            "demo_type": "hybrid_style",
            "input": {
                "person_name": person_name,
                "politician_style": politician_style,
                "topic": topic,
                "blend_ratio": blend_ratio
            },
            "comparison": {
                "personal_only": personal_message.generated_content,
                "political_only": political_message.content,
                "hybrid_result": hybrid_message.generated_content
            },
            "hybrid_metrics": {
                "confidence_score": hybrid_message.confidence_score,
                "korean_authenticity": hybrid_message.korean_authenticity_score,
                "quality_metrics": hybrid_message.quality_metrics
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"혼합 스타일 데모 실패: {str(e)}")


@app.post("/demo/style-recommendation")
async def demo_style_recommendation(request: dict):
    """정치인 스타일 추천 데모"""
    try:
        person_name = request.get("person_name", "이조합원")
        topic = request.get("topic", "시공사 선정")
        
        recommendation = generator.recommend_political_style(
            person_name=person_name,
            target_topic=topic
        )
        
        return {
            "success": True,
            "demo_type": "style_recommendation",
            "input": {
                "person_name": person_name,
                "topic": topic
            },
            "recommendation_result": recommendation,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"스타일 추천 데모 실패: {str(e)}")


@app.get("/demo/available-features")
async def demo_available_features():
    """사용 가능한 기능 목록"""
    try:
        political_styles = generator.get_available_political_styles()
        guidelines = generator._load_project_guidelines()
        
        return {
            "success": True,
            "available_features": {
                "political_styles": [
                    {
                        "name": style["name"],
                        "description": style["communication_style"],
                        "expertise": style["expertise_areas"]
                    }
                    for style in political_styles
                ],
                "message_intents": [
                    "의견형", "제안형", "우려형", "지지형", "질문형"
                ],
                "topics": [
                    "시공사 선정", "분담금", "총회 운영", "투명성", "법률 절차"
                ],
                "guidelines": {
                    "communication_principles": guidelines["communication_principles"],
                    "prohibited_elements": guidelines["prohibited_elements"],
                    "required_elements": guidelines["required_elements"]
                }
            },
            "system_capabilities": [
                "6명 정치인 스타일 메시지 생성",
                "개인 성향 기반 메시지 생성",
                "혼합 스타일 메시지 생성",
                "스타일 분석 및 추천",
                "품질 검증 및 신뢰도 측정",
                "한국어 자연성 보장",
                "가이드라인 준수 확인"
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"기능 목록 조회 실패: {str(e)}")


if __name__ == "__main__":
    print("🚀 카카오 AI 메시지 생성 시스템 데모 서버 시작")
    print("=" * 60)
    print("📍 서버 주소: http://localhost:8002")
    print("📖 API 문서: http://localhost:8002/docs")
    print("🎯 데모 페이지: http://localhost:8002/")
    print("")
    print("🎭 주요 데모 엔드포인트:")
    print("   POST /demo/all-styles - 모든 정치인 스타일 데모")
    print("   POST /demo/political-style - 특정 정치인 스타일 데모")
    print("   POST /demo/hybrid-style - 혼합 스타일 데모")
    print("   POST /demo/style-recommendation - 스타일 추천 데모")
    print("   GET /demo/available-features - 사용 가능한 기능 목록")
    print("")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8002,
        log_level="info"
    ) 