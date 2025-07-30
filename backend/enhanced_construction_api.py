from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import json
import uvicorn
from datetime import datetime

# 고도화된 메시지 생성 모듈 import
from advanced_message_generator import (
    AdvancedMessageGenerator, MessageType, MessageTone, MessageContext, GeneratedMessage
)
from message_personalization_engine import (
    MessagePersonalizationEngine, PersonaStyle, MessagePersonalization
)
from intelligent_context_analyzer import (
    IntelligentContextAnalyzer, ContextAnalysisResult, DecisionContext
)
from construction_company_analyzer import ConstructionCompanyAnalyzer

app = FastAPI(title="Enhanced Construction Company Selection API", version="2.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 인스턴스
message_generator = AdvancedMessageGenerator()
personalization_engine = MessagePersonalizationEngine()
context_analyzer = IntelligentContextAnalyzer()
construction_analyzer = ConstructionCompanyAnalyzer()

# 요청 모델 정의
class EnhancedAnalysisRequest(BaseModel):
    companies: List[str]
    criteria: Dict[str, float]
    project_type: str
    timeline: str
    priority_weights: Dict[str, float]
    risk_tolerance: str
    stakeholders: List[str]
    communication_preferences: Dict[str, Any]
    context_metadata: Dict[str, Any]


class MessageGenerationRequest(BaseModel):
    message_type: str  # MessageType enum value
    target_audience: str
    urgency_level: str
    context_data: Dict[str, Any]
    personalization_preferences: Optional[Dict[str, Any]] = None
    generate_variants: bool = False
    variant_count: int = 3


class PersonalizationRequest(BaseModel):
    base_message: str
    recipient_profile: Dict[str, Any]
    communication_history: Optional[List[Dict]] = None
    context_adaptation: Optional[Dict[str, Any]] = None


# 응답 모델
class EnhancedMessageResponse(BaseModel):
    message_id: str
    message_type: str
    tone: str
    title: str
    content: str
    key_points: List[str]
    recommendations: List[str]
    next_actions: List[str]
    confidence_score: float
    context_analysis: Dict[str, Any]
    personalization_applied: bool
    generation_metadata: Dict[str, Any]


@app.get("/")
async def root():
    return {
        "message": "Enhanced Construction Company Selection API",
        "version": "2.0.0",
        "features": [
            "Advanced Message Generation",
            "Intelligent Context Analysis",
            "Message Personalization",
            "Multi-variant Generation"
        ]
    }


@app.post("/api/enhanced/upload_comparison_data")
async def enhanced_upload_comparison_data(
    file: UploadFile = File(...),
    project_type: str = "대형_인프라",
    context_metadata: str = "{}"
):
    """고도화된 비교집 데이터 업로드"""
    try:
        # 파일 내용 읽기
        content = await file.read()
        
        try:
            raw_data = json.loads(content)
        except json.JSONDecodeError:
            # 텍스트 파일인 경우 간단한 파싱 시도
            raw_data = {"raw_text": content.decode('utf-8')}
        
        # 컨텍스트 메타데이터 파싱
        try:
            context_meta = json.loads(context_metadata)
        except json.JSONDecodeError:
            context_meta = {}
        
        # 데이터 처리
        processed_companies = construction_analyzer.process_comparison_data(raw_data)
        
        # 컨텍스트 분석
        input_data = {
            "project_type": project_type,
            "project_description": f"{project_type} 프로젝트",
            "companies_data": processed_companies,
            **context_meta
        }
        
        context_analysis = context_analyzer.analyze_comprehensive_context(
            input_data=input_data,
            project_metadata=context_meta
        )
        
        # 메모리에 저장
        construction_analyzer.comparison_database = processed_companies
        construction_analyzer.context_cache = context_analysis
        
        return {
            "status": "success",
            "message": f"{len(processed_companies)}개 시공사 데이터 처리 완료",
            "companies": list(processed_companies.keys()),
            "processed_data": {
                company_id: {
                    "name": data.company_name,
                    "evaluation_scores": data.evaluation_scores,
                    "strengths": data.strengths,
                    "weaknesses": data.weaknesses,
                    "risk_factors": data.risk_factors
                }
                for company_id, data in processed_companies.items()
            },
            "context_analysis_summary": {
                "project_scope": context_analysis.decision_context.project_scope,
                "timeline_pressure": context_analysis.decision_context.timeline_pressure,
                "stakeholder_complexity": context_analysis.decision_context.stakeholder_complexity,
                "confidence_score": context_analysis.confidence_score
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 처리 중 오류 발생: {str(e)}")


@app.post("/api/enhanced/analyze_companies")
async def enhanced_analyze_companies(request: EnhancedAnalysisRequest):
    """고도화된 시공사 분석"""
    try:
        # 기본 분석 수행
        companies = request.companies
        criteria = request.criteria
        
        # 컨텍스트 생성
        context = MessageContext(
            project_type=request.project_type,
            current_phase="시공사 선정",
            stakeholders=request.stakeholders,
            priority_factors=request.priority_weights,
            decision_timeline=request.timeline,
            risk_tolerance=request.risk_tolerance,
            previous_decisions=[],
            market_conditions=request.context_metadata.get("market_conditions", {})
        )
        
        # 의사결정 논리 생성
        decision_logic = construction_analyzer.generate_decision_logic(companies, criteria)
        
        # 컨텍스트 분석
        context_analysis = context_analyzer.analyze_comprehensive_context(
            input_data={
                "project_type": request.project_type,
                "stakeholders": request.stakeholders,
                "timeline_requirements": request.timeline,
                "priority_weights": request.priority_weights,
                "risk_tolerance": request.risk_tolerance,
                **request.context_metadata
            }
        )
        
        # 의사결정 이력에 저장
        construction_analyzer.decision_history.append({
            "decision_logic": decision_logic,
            "context": context,
            "context_analysis": context_analysis,
            "timestamp": datetime.now()
        })
        
        return {
            "status": "success",
            "analysis_result": decision_logic,
            "context_analysis": {
                "decision_context": {
                    "project_scope": context_analysis.decision_context.project_scope,
                    "timeline_pressure": context_analysis.decision_context.timeline_pressure,
                    "stakeholder_complexity": context_analysis.decision_context.stakeholder_complexity,
                    "financial_sensitivity": context_analysis.decision_context.financial_sensitivity
                },
                "adaptation_recommendations": context_analysis.adaptation_recommendations,
                "confidence_score": context_analysis.confidence_score
            },
            "criteria_applied": {
                "project_type": request.project_type,
                "timeline": request.timeline,
                "priority_weights": request.priority_weights,
                "risk_tolerance": request.risk_tolerance
            },
            "companies_analyzed": len(companies)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"분석 중 오류 발생: {str(e)}")


@app.post("/api/enhanced/generate_message", response_model=EnhancedMessageResponse)
async def enhanced_generate_message(request: MessageGenerationRequest):
    """고도화된 메시지 생성"""
    try:
        # MessageType 변환
        message_type_mapping = {
            "analysis_summary": MessageType.ANALYSIS_SUMMARY,
            "recommendation": MessageType.RECOMMENDATION,
            "risk_warning": MessageType.RISK_WARNING,
            "comparison": MessageType.COMPARISON,
            "decision_support": MessageType.DECISION_SUPPORT,
            "technical_explanation": MessageType.TECHNICAL_EXPLANATION,
            "financial_analysis": MessageType.FINANCIAL_ANALYSIS
        }
        
        message_type = message_type_mapping.get(request.message_type, MessageType.RECOMMENDATION)
        
        # 컨텍스트 구성
        context_data = request.context_data
        context = MessageContext(
            project_type=context_data.get("project_type", "대형_인프라"),
            current_phase=context_data.get("current_phase", "시공사 선정"),
            stakeholders=context_data.get("stakeholders", ["실무진"]),
            priority_factors=context_data.get("priority_factors", {}),
            decision_timeline=context_data.get("timeline", "2주"),
            risk_tolerance=context_data.get("risk_tolerance", "보수적"),
            previous_decisions=context_data.get("previous_decisions", []),
            market_conditions=context_data.get("market_conditions", {})
        )
        
        # 메시지 생성
        if request.generate_variants:
            # 다중 변형 생성
            variants = message_generator.generate_multiple_variants(
                message_type=message_type,
                context=context,
                data=context_data,
                variant_count=request.variant_count
            )
            generated_message = variants[0]  # 첫 번째 변형을 기본으로 사용
        else:
            # 단일 메시지 생성
            generated_message = message_generator.generate_advanced_message(
                message_type=message_type,
                context=context,
                data=context_data,
                target_audience=request.target_audience,
                urgency_level=request.urgency_level
            )
        
        # 개인화 적용 (요청된 경우)
        personalized_content = generated_message.content
        personalization_applied = False
        
        if request.personalization_preferences:
            try:
                # 수신자 스타일 분석 또는 사용
                if "recipient_messages" in request.personalization_preferences:
                    recipient_style = personalization_engine.analyze_recipient_style(
                        request.personalization_preferences["recipient_messages"]
                    )
                else:
                    # 기본 페르소나 사용
                    persona_name = request.personalization_preferences.get(
                        "persona", "progressive_manager"
                    )
                    recipient_style = personalization_engine.persona_templates.get(
                        persona_name,
                        personalization_engine.persona_templates["progressive_manager"]
                    )
                
                # 메시지 개인화
                personalized_content = personalization_engine.personalize_message(
                    base_message=generated_message.content,
                    recipient_style=recipient_style,
                    context=request.personalization_preferences.get("context", {})
                )
                personalization_applied = True
                
            except Exception as e:
                print(f"개인화 처리 중 오류: {e}")
                # 개인화 실패 시 원본 메시지 사용
        
        # 컨텍스트 분석 수행 (가능한 경우)
        context_analysis_summary = {}
        try:
            if hasattr(construction_analyzer, 'context_cache') and construction_analyzer.context_cache:
                context_analysis = construction_analyzer.context_cache
                context_analysis_summary = {
                    "timeline_pressure": context_analysis.decision_context.timeline_pressure,
                    "stakeholder_complexity": context_analysis.decision_context.stakeholder_complexity,
                    "adaptation_recommendations": context_analysis.adaptation_recommendations[:3],
                    "confidence_score": context_analysis.confidence_score
                }
        except Exception as e:
            print(f"컨텍스트 분석 요약 중 오류: {e}")
        
        return EnhancedMessageResponse(
            message_id=generated_message.message_id,
            message_type=generated_message.message_type.value,
            tone=generated_message.tone.value,
            title=generated_message.title,
            content=personalized_content,
            key_points=generated_message.key_points,
            recommendations=generated_message.recommendations,
            next_actions=generated_message.next_actions,
            confidence_score=generated_message.confidence_score,
            context_analysis=context_analysis_summary,
            personalization_applied=personalization_applied,
            generation_metadata={
                "generation_timestamp": generated_message.timestamp.isoformat(),
                "logic_structure": generated_message.logic_structure,
                "target_audience": request.target_audience,
                "urgency_level": request.urgency_level,
                "variants_generated": request.variant_count if request.generate_variants else 1
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메시지 생성 중 오류 발생: {str(e)}")


@app.post("/api/enhanced/personalize_message")
async def personalize_message(request: PersonalizationRequest):
    """메시지 개인화"""
    try:
        # 수신자 프로필에서 스타일 추출 또는 생성
        if "message_history" in request.recipient_profile:
            recipient_style = personalization_engine.analyze_recipient_style(
                request.recipient_profile["message_history"]
            )
        else:
            # 프로필 정보를 기반으로 스타일 생성
            recipient_style = PersonaStyle(
                formality_level=request.recipient_profile.get("formality_level", 0.6),
                directness=request.recipient_profile.get("directness", 0.5),
                detail_preference=request.recipient_profile.get("detail_preference", 0.5),
                emotion_expression=request.recipient_profile.get("emotion_expression", 0.3),
                logic_pattern=request.recipient_profile.get("logic_pattern", "analytical"),
                vocabulary_level=request.recipient_profile.get("vocabulary_level", "professional"),
                communication_style=request.recipient_profile.get("communication_style", "collaborative"),
                decision_approach=request.recipient_profile.get("decision_approach", "data_driven")
            )
        
        # 메시지 개인화 수행
        personalized_message = personalization_engine.personalize_message(
            base_message=request.base_message,
            recipient_style=recipient_style,
            context=request.context_adaptation
        )
        
        return {
            "status": "success",
            "original_message": request.base_message,
            "personalized_message": personalized_message,
            "recipient_style_analysis": {
                "formality_level": recipient_style.formality_level,
                "directness": recipient_style.directness,
                "detail_preference": recipient_style.detail_preference,
                "emotion_expression": recipient_style.emotion_expression,
                "logic_pattern": recipient_style.logic_pattern,
                "vocabulary_level": recipient_style.vocabulary_level,
                "communication_style": recipient_style.communication_style
            },
            "personalization_metadata": {
                "processing_timestamp": datetime.now().isoformat(),
                "context_adaptation_applied": bool(request.context_adaptation),
                "communication_history_used": bool(request.communication_history)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"개인화 처리 중 오류 발생: {str(e)}")


@app.get("/api/enhanced/context_insights/{project_id}")
async def get_context_insights(project_id: str):
    """컨텍스트 인사이트 조회"""
    try:
        insights = context_analyzer.get_context_insights(project_id)
        return {
            "status": "success",
            "project_id": project_id,
            "insights": insights,
            "retrieved_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"인사이트 조회 중 오류 발생: {str(e)}")


@app.get("/api/enhanced/message_templates")
async def get_message_templates():
    """메시지 템플릿 조회"""
    try:
        templates = {
            "message_types": [member.value for member in MessageType],
            "tone_options": [member.value for member in MessageTone],
            "target_audiences": ["임원진", "실무진", "기술진", "외부전문가"],
            "urgency_levels": ["긴급", "일반", "신중"],
            "personalization_personas": list(personalization_engine.persona_templates.keys())
        }
        
        return {
            "status": "success",
            "templates": templates,
            "description": "사용 가능한 메시지 템플릿 및 옵션 목록"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"템플릿 조회 중 오류 발생: {str(e)}")


@app.post("/api/enhanced/bulk_message_generation")
async def bulk_message_generation(
    background_tasks: BackgroundTasks,
    message_configs: List[MessageGenerationRequest]
):
    """대량 메시지 생성"""
    try:
        # 백그라운드 작업으로 처리
        task_id = f"bulk_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # 간단한 동기 처리 (실제로는 Celery 등 사용 권장)
        results = []
        for config in message_configs:
            try:
                # 개별 메시지 생성 로직 (앞서 구현한 것과 동일)
                message_type_mapping = {
                    "analysis_summary": MessageType.ANALYSIS_SUMMARY,
                    "recommendation": MessageType.RECOMMENDATION,
                    "risk_warning": MessageType.RISK_WARNING,
                    "comparison": MessageType.COMPARISON,
                    "decision_support": MessageType.DECISION_SUPPORT
                }
                
                message_type = message_type_mapping.get(config.message_type, MessageType.RECOMMENDATION)
                
                context = MessageContext(
                    project_type=config.context_data.get("project_type", "대형_인프라"),
                    current_phase="시공사 선정",
                    stakeholders=config.context_data.get("stakeholders", ["실무진"]),
                    priority_factors=config.context_data.get("priority_factors", {}),
                    decision_timeline=config.context_data.get("timeline", "2주"),
                    risk_tolerance=config.context_data.get("risk_tolerance", "보수적"),
                    previous_decisions=[],
                    market_conditions={}
                )
                
                generated_message = message_generator.generate_advanced_message(
                    message_type=message_type,
                    context=context,
                    data=config.context_data,
                    target_audience=config.target_audience,
                    urgency_level=config.urgency_level
                )
                
                results.append({
                    "message_id": generated_message.message_id,
                    "title": generated_message.title,
                    "content": generated_message.content,
                    "status": "success"
                })
                
            except Exception as e:
                results.append({
                    "message_id": f"error_{len(results)}",
                    "status": "error",
                    "error": str(e)
                })
        
        return {
            "status": "success",
            "task_id": task_id,
            "total_requests": len(message_configs),
            "successful_generations": len([r for r in results if r["status"] == "success"]),
            "failed_generations": len([r for r in results if r["status"] == "error"]),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"대량 생성 처리 중 오류 발생: {str(e)}")


@app.get("/api/enhanced/system_status")
async def get_system_status():
    """시스템 상태 조회"""
    try:
        status = {
            "api_version": "2.0.0",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "message_generator": "operational",
                "personalization_engine": "operational",
                "context_analyzer": "operational",
                "construction_analyzer": "operational"
            },
            "statistics": {
                "total_analyses": len(construction_analyzer.decision_history),
                "context_cache_size": len(context_analyzer.context_history),
                "personalization_history": len(personalization_engine.personalization_history)
            },
            "capabilities": [
                "Advanced Message Generation",
                "Intelligent Context Analysis",
                "Message Personalization",
                "Multi-variant Generation",
                "Bulk Processing",
                "Real-time Analysis"
            ]
        }
        
        return {
            "status": "operational",
            "system_status": status
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


if __name__ == "__main__":
    print("🚀 Enhanced Construction Company Selection API 시작")
    print("📊 고도화된 메시지 생성 시스템 활성화")
    print("🎯 지능형 컨텍스트 분석 준비 완료")
    print("👤 메시지 개인화 엔진 가동")
    print("=" * 50)
    
    uvicorn.run(
        "enhanced_construction_api:app",
        host="0.0.0.0",
        port=8002,
        reload=True
    ) 