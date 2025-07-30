from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime, date, time, timedelta
import json
import logging
import asyncio
import os
from pathlib import Path

from chat_conversation_analyzer import ChatConversationAnalyzer, ChatMessage
from response_message_generator import ResponseMessageGenerator, ResponseType, OpinionType
from public_opinion_orchestrator import PublicOpinionOrchestrator
from conversation_summarizer import ConversationSummarizer
from advanced_conversation_summarizer import AdvancedConversationSummarizer
from enhanced_conversation_analyzer import EnhancedConversationAnalyzer
from korean_enhanced_analyzer import KoreanEnhancedAnalyzer  # 한국어 특성 완전 반영
from korean_summary_analyzer import KoreanSummaryAnalyzer  # 요약본 최적화 한국어 시스템
from advanced_korean_ai_analyzer import AdvancedKoreanAIAnalyzer  # AI 고도화 시스템
from ai_message_generator import AIMessageGenerator, GeneratedMessage
from enhanced_conversation_summarizer import EnhancedConversationSummarizer

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="AI 고도화 한국어 대화 분석 시스템 v5.0",
    description="차세대 AI 기반 감정분석, 예측인사이트, 시각적 데이터를 포함한 최첨단 한국어 분석",
    version="5.0.0"  # AI 고도화 버전
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 시스템 인스턴스들
analyzer = ChatConversationAnalyzer()
generator = ResponseMessageGenerator(analyzer)
orchestrator = PublicOpinionOrchestrator(analyzer, generator)
summarizer = ConversationSummarizer(analyzer)
advanced_summarizer = AdvancedConversationSummarizer(analyzer)
enhanced_analyzer = EnhancedConversationAnalyzer(analyzer)
korean_analyzer = KoreanSummaryAnalyzer(analyzer)  # 요약본 최적화 한국어 분석기
ai_analyzer = AdvancedKoreanAIAnalyzer(analyzer)  # AI 고도화 분석기

# AI 메시지 생성기 초기화
ai_message_generator = None

# 고도화된 요약 시스템 초기화
enhanced_summarizer = None

@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 초기화"""
    global ai_message_generator, enhanced_summarizer
    
    logger.info("🚀 AI 메시지 생성 시스템 초기화 중...")
    
    try:
        # AI 메시지 생성기 초기화
        ai_message_generator = AIMessageGenerator(analyzer, ai_analyzer)
        logger.info("✅ AI 메시지 생성 시스템 초기화 완료")
        
        # 고도화된 요약 시스템 초기화
        enhanced_summarizer = EnhancedConversationSummarizer(
            analyzer, ai_analyzer, ai_message_generator
        )
        logger.info("✅ 고도화된 요약 시스템 초기화 완료")
        
    except Exception as e:
        logger.error(f"❌ 시스템 초기화 실패: {e}")


# Pydantic 모델들
class ChatFileUpload(BaseModel):
    filename: str
    content: str


class ResponseMessageRequest(BaseModel):
    target_message_id: str
    response_type: str
    tone: str = "formal"
    custom_points: Optional[List[str]] = None


class OpinionCampaignRequest(BaseModel):
    target_message_id: str
    objective: str  # support, oppose, neutralize
    strategy_name: str
    duration_hours: int = 24
    custom_intensity: Optional[float] = None


class ConversationSummaryRequest(BaseModel):
    start_time: str
    end_time: str
    chat_room: Optional[str] = None
    summary_type: str = "basic"  # basic, advanced, enhanced, korean, ai_advanced


class PersonSummaryRequest(BaseModel):
    person_name: str
    start_date: str
    end_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    summary_type: str = "basic"


class TopicAnalysisRequest(BaseModel):
    topic: str
    start_time: str
    end_time: str


# API 엔드포인트들

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "AI 고도화 한국어 대화 분석 시스템",
        "version": "5.0.0",
        "ai_features": [
            "🤖 AI 기반 감정 분석 및 의도 파악",
            "📊 실시간 대화 흐름 및 역학 관계 분석", 
            "🔮 예측적 인사이트 및 결과 분석",
            "💡 AI 권고사항 및 갈등 해결 방안",
            "📈 시각적 네트워크 및 차트 데이터 생성",
            "📝 인용 대화 원문 완벽 보존",
            "🇰🇷 한국어 담화 구조 정밀 분석"
        ],
        "innovation_highlights": [
            "AI 기반 영향력 네트워크 분석",
            "감정 궤적 및 변화 예측",
            "컨텍스트 기반 중요도 자동 계산",
            "한국 문화적 맥락 완벽 반영",
            "다중 레벨 요약 자동 생성",
            "갈등 해결 시나리오 AI 제안"
        ],
        "supported_summary_types": {
            "basic": "기본 요약",
            "advanced": "고도화 요약", 
            "enhanced": "완전 고도화 요약",
            "korean": "한국어 요약본 최적화",
            "ai_advanced": "🚀 AI 차세대 고도화 분석 ⭐"
        },
        "status": "active",
        "ai_version": "v5.0_next_generation"
    }


# 1. 채팅 파일 업로드 및 분석
@app.post("/api/chat/upload")
async def upload_chat_file(file: UploadFile = File(...)):
    """채팅 파일 업로드 및 분석"""
    try:
        # 파일 저장
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        file_path = upload_dir / file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 채팅 파일 파싱
        messages = analyzer.parse_chat_file(str(file_path))
        
        # 메시지 저장
        analyzer.save_messages(messages)
        
        # 참여자 분석
        participants = analyzer.get_conversation_participants(file.filename.split('.')[0])
        
        return {
            "status": "success",
            "message": f"채팅 파일이 성공적으로 업로드되었습니다",
            "file_info": {
                "filename": file.filename,
                "total_messages": len(messages),
                "participants": len(participants),
                "date_range": {
                    "start": messages[0].timestamp.isoformat() if messages else None,
                    "end": messages[-1].timestamp.isoformat() if messages else None
                }
            },
            "participants": participants[:10]  # 상위 10명만
        }
        
    except Exception as e:
        logger.error(f"채팅 파일 업로드 실패: {e}")
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {str(e)}")


@app.post("/api/chat/parse-text")
async def parse_chat_text(request: ChatFileUpload):
    """텍스트 형태의 채팅 내용 직접 파싱"""
    try:
        # 임시 파일 생성
        temp_path = f"temp_chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        with open(temp_path, 'w', encoding='utf-8') as f:
            f.write(request.content)
        
        # 파싱
        messages = analyzer.parse_chat_file(temp_path)
        analyzer.save_messages(messages)
        
        # 임시 파일 삭제
        os.remove(temp_path)
        
        # 참여자 정보
        participants = analyzer.get_conversation_participants(request.filename)
        
        return {
            "status": "success",
            "total_messages": len(messages),
            "participants": participants,
            "topics_found": list(set(msg.topic_category for msg in messages if msg.topic_category))
        }
        
    except Exception as e:
        logger.error(f"채팅 텍스트 파싱 실패: {e}")
        raise HTTPException(status_code=500, detail=f"파싱 실패: {str(e)}")


# 2. 대응 메시지 생성
@app.post("/api/response/generate")
async def generate_response_message(request: ResponseMessageRequest):
    """특정 메시지에 대한 대응 메시지 생성"""
    try:
        # 타겟 메시지 조회
        import sqlite3
        conn = sqlite3.connect(analyzer.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chat_messages WHERE message_id = ?", (request.target_message_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="대상 메시지를 찾을 수 없습니다")
        
        # ChatMessage 객체 생성
        target_message = ChatMessage(
            message_id=row[1],
            chat_room=row[2],
            sender=row[3],
            content=row[4],
            timestamp=datetime.fromisoformat(row[5]),
            message_type=row[6],
            sentiment=row[10],
            topic_category=row[11]
        )
        
        # 응답 타입 변환
        try:
            response_type = ResponseType(request.response_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 응답 타입: {request.response_type}")
        
        # 대응 메시지 생성
        response_message = generator.generate_response_message(
            target_message, response_type, request.tone, request.custom_points
        )
        
        return {
            "status": "success",
            "target_message": {
                "sender": target_message.sender,
                "content": target_message.content,
                "topic": target_message.topic_category
            },
            "response_message": {
                "message_id": response_message.message_id,
                "response_type": response_message.response_type.value,
                "content": response_message.content,
                "tone": response_message.tone,
                "confidence": response_message.confidence,
                "supporting_evidence": response_message.supporting_evidence
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"대응 메시지 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"메시지 생성 실패: {str(e)}")


@app.post("/api/response/opinion-messages")
async def generate_opinion_messages(request: ResponseMessageRequest):
    """여론 형성 메시지들 생성"""
    try:
        # 타겟 메시지 조회 (위와 동일한 로직)
        import sqlite3
        conn = sqlite3.connect(analyzer.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chat_messages WHERE message_id = ?", (request.target_message_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="대상 메시지를 찾을 수 없습니다")
        
        target_message = ChatMessage(
            message_id=row[1],
            chat_room=row[2],
            sender=row[3],
            content=row[4],
            timestamp=datetime.fromisoformat(row[5]),
            message_type=row[6],
            sentiment=row[10],
            topic_category=row[11]
        )
        
        # 여론 형성 메시지 생성
        opinion_types = [OpinionType.SUPPORT, OpinionType.AGREEMENT, OpinionType.OPPOSITION, OpinionType.NEUTRAL]
        opinion_messages = generator.generate_opinion_messages(target_message, opinion_types, count_per_type=2)
        
        formatted_messages = []
        for msg in opinion_messages:
            formatted_messages.append({
                "message_id": msg.message_id,
                "opinion_type": msg.opinion_type.value,
                "content": msg.content,
                "tone": msg.tone,
                "intensity": msg.intensity,
                "generated_at": msg.generated_at.isoformat()
            })
        
        return {
            "status": "success",
            "target_message_id": request.target_message_id,
            "opinion_messages": formatted_messages,
            "total_generated": len(formatted_messages)
        }
        
    except Exception as e:
        logger.error(f"여론 메시지 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"여론 메시지 생성 실패: {str(e)}")


# 3. 여론 캠페인 관리
@app.post("/api/opinion/campaign/create")
async def create_opinion_campaign(request: OpinionCampaignRequest):
    """여론 조성 캠페인 생성"""
    try:
        # 타겟 메시지 조회
        import sqlite3
        conn = sqlite3.connect(analyzer.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM chat_messages WHERE message_id = ?", (request.target_message_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="대상 메시지를 찾을 수 없습니다")
        
        target_message = ChatMessage(
            message_id=row[1],
            chat_room=row[2],
            sender=row[3],
            content=row[4],
            timestamp=datetime.fromisoformat(row[5]),
            message_type=row[6],
            sentiment=row[10],
            topic_category=row[11]
        )
        
        # 캠페인 생성
        campaign_id = orchestrator.create_opinion_campaign(
            target_message,
            request.objective,
            request.strategy_name,
            request.duration_hours,
            request.custom_intensity
        )
        
        return {
            "status": "success",
            "campaign_id": campaign_id,
            "target_message": {
                "sender": target_message.sender,
                "content": target_message.content[:100] + "..."
            },
            "campaign_settings": {
                "objective": request.objective,
                "strategy": request.strategy_name,
                "duration_hours": request.duration_hours,
                "intensity": request.custom_intensity
            }
        }
        
    except Exception as e:
        logger.error(f"여론 캠페인 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"캠페인 생성 실패: {str(e)}")


@app.get("/api/opinion/campaign/{campaign_id}/status")
async def get_campaign_status(campaign_id: str):
    """캠페인 상태 조회"""
    try:
        status = orchestrator.get_campaign_status(campaign_id)
        if "error" in status:
            raise HTTPException(status_code=404, detail=status["error"])
        
        return {"status": "success", "campaign_status": status}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"캠페인 상태 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"상태 조회 실패: {str(e)}")


@app.get("/api/opinion/campaign/{campaign_id}/messages")
async def get_campaign_messages(campaign_id: str):
    """캠페인으로 생성된 메시지들 조회"""
    try:
        messages = orchestrator.get_generated_messages(campaign_id)
        return {
            "status": "success", 
            "campaign_id": campaign_id,
            "messages": messages,
            "total_count": len(messages)
        }
        
    except Exception as e:
        logger.error(f"캠페인 메시지 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"메시지 조회 실패: {str(e)}")


# 4. 대화 요약 및 분석 (기본 + 고도화 + 완전고도화)
@app.post("/api/conversation/summary")
async def get_conversation_summary(request: dict):
    """대화 요약 생성 (고도화된 분석 포함)"""
    try:
        summary_type = request.get("summary_type", "enhanced")  # 기본값을 enhanced로 변경
        time_range_hours = request.get("time_range_hours", 24)
        include_ai_analysis = request.get("include_ai_analysis", True)  # AI 분석 포함 옵션
        analysis_depth = request.get("analysis_depth", "comprehensive")
        
        # 시간 범위 설정
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=time_range_hours)
        
        # 메시지 수집
        messages = analyzer.get_messages_by_timerange(start_time, end_time)
        
        if not messages:
            return {
                "success": True,
                "summary": "지정된 시간 범위에 메시지가 없습니다.",
                "message_count": 0,
                "time_range": f"{time_range_hours}시간",
                "summary_type": summary_type
            }
        
        # 요약 생성
        if summary_type == "enhanced" and include_ai_analysis and enhanced_summarizer:
            # 고도화된 요약 생성
            enhanced_result = enhanced_summarizer.generate_enhanced_summary(
                messages, analysis_depth
            )
            formatted_summary = enhanced_summarizer.format_enhanced_summary(enhanced_result)
            
            return {
                "success": True,
                "summary": formatted_summary,
                "enhanced_analysis": {
                    "voice_analysis_count": len(enhanced_result.voice_analysis),
                    "quality_metrics_count": len(enhanced_result.quality_metrics),
                    "decision_points_count": len(enhanced_result.key_decision_points),
                    "recommendations_count": len(enhanced_result.recommendations),
                    "sample_messages_count": len(enhanced_result.generated_sample_messages),
                    "conversation_efficiency": enhanced_result.conversation_dynamics.communication_efficiency,
                    "decision_progress": enhanced_result.conversation_dynamics.decision_making_progress
                },
                "message_count": len(messages),
                "time_range": f"{time_range_hours}시간",
                "summary_type": "enhanced_with_ai",
                "analysis_depth": analysis_depth,
                "generation_timestamp": datetime.now().isoformat()
            }
            
        elif summary_type == "ai_advanced":
            # 기존 AI 고급 분석
            analysis_result = ai_analyzer.analyze_conversation_advanced(messages)
            summary = ai_analyzer.format_advanced_summary(analysis_result)
            
            return {
                "success": True,
                "summary": summary,
                "ai_analysis": {
                    "emotion_analysis_count": len(analysis_result.emotion_analysis),
                    "intent_analysis_count": len(analysis_result.intent_analysis),
                    "cultural_context": analysis_result.cultural_context_analysis
                },
                "message_count": len(messages),
                "summary_type": summary_type
            }
            
        elif summary_type == "korean":
            # 한국어 최적화 요약
            korean_result = korean_analyzer.create_detailed_summary(messages)
            
            return {
                "success": True,
                "summary": korean_result["summary"],
                "korean_analysis": korean_result,
                "message_count": len(messages),
                "summary_type": summary_type
            }
            
        else:
            # 기본 요약
            basic_summary = summarizer.summarize_conversation_by_timeframe(
                start_time, end_time, request.chat_room
            )
            
            return {
                "success": True,
                "summary": basic_summary,
                "message_count": len(messages),
                "summary_type": "basic"
            }
            
    except Exception as e:
        logger.error(f"요약 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"요약 생성 실패: {str(e)}")


@app.post("/api/conversation/enhanced-analysis")
async def get_enhanced_conversation_analysis(request: dict):
    """고도화된 대화 분석 전용 엔드포인트"""
    try:
        time_range_hours = request.get("time_range_hours", 24)
        analysis_depth = request.get("analysis_depth", "comprehensive")
        include_sample_messages = request.get("include_sample_messages", True)
        focus_areas = request.get("focus_areas", ["all"])  # voice, dynamics, quality, predictions
        
        # 시간 범위 설정
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=time_range_hours)
        
        # 메시지 수집
        messages = analyzer.get_messages_by_timerange(start_time, end_time)
        
        if not messages:
            raise HTTPException(status_code=404, detail="분석할 메시지가 없습니다")
            
        if not enhanced_summarizer:
            raise HTTPException(status_code=503, detail="고도화된 분석 시스템이 초기화되지 않았습니다")
        
        # 고도화된 분석 수행
        enhanced_result = enhanced_summarizer.generate_enhanced_summary(messages, analysis_depth)
        
        # 포커스 영역에 따른 필터링
        filtered_result = enhanced_result
        if "all" not in focus_areas:
            if "voice" not in focus_areas:
                filtered_result.voice_analysis = []
            if "dynamics" not in focus_areas:
                filtered_result.conversation_dynamics = None
            if "quality" not in focus_areas:
                filtered_result.quality_metrics = []
            if "predictions" not in focus_areas:
                filtered_result.predictive_insights = {}
                
        if not include_sample_messages:
            filtered_result.generated_sample_messages = {}
            
        # 포맷팅된 요약
        formatted_summary = enhanced_summarizer.format_enhanced_summary(filtered_result)
        
        # 상세 분석 데이터
        detailed_analysis = {
            "participants_analysis": [
                {
                    "name": va.person_name,
                    "political_stance": va.political_stance,
                    "preferred_company": va.preferred_construction_company,
                    "communication_style": va.communication_style,
                    "formality_level": va.formality_level,
                    "influence_level": va.influence_level,
                    "signature_phrases": va.signature_phrases[:5],
                    "emotional_tendencies": va.emotional_tendencies,
                    "expertise_areas": va.expertise_areas
                }
                for va in enhanced_result.voice_analysis
            ],
            "conversation_metrics": {
                "participation_balance": enhanced_result.conversation_dynamics.participation_balance if enhanced_result.conversation_dynamics else {},
                "topic_leadership": enhanced_result.conversation_dynamics.topic_leadership if enhanced_result.conversation_dynamics else {},
                "communication_efficiency": enhanced_result.conversation_dynamics.communication_efficiency if enhanced_result.conversation_dynamics else 0,
                "decision_progress": enhanced_result.conversation_dynamics.decision_making_progress if enhanced_result.conversation_dynamics else "알수없음"
            },
            "quality_overview": [
                {
                    "person": qm.person_name,
                    "consistency": qm.consistency_score,
                    "compliance": qm.guideline_compliance,
                    "authenticity": qm.korean_authenticity,
                    "informativeness": qm.informativeness,
                    "constructive_ratio": qm.constructive_ratio
                }
                for qm in enhanced_result.quality_metrics
            ],
            "predictions": enhanced_result.predictive_insights,
            "decision_points": enhanced_result.key_decision_points,
            "cultural_analysis": enhanced_result.cultural_context_analysis
        }
        
        return {
            "success": True,
            "formatted_summary": formatted_summary,
            "detailed_analysis": detailed_analysis,
            "sample_messages": enhanced_result.generated_sample_messages,
            "recommendations": enhanced_result.recommendations,
            "next_meeting_suggestions": enhanced_result.next_meeting_suggestions,
            "analysis_metadata": {
                "total_messages": len(messages),
                "time_range_hours": time_range_hours,
                "analysis_depth": analysis_depth,
                "focus_areas": focus_areas,
                "participants_count": len(enhanced_result.voice_analysis),
                "generation_timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"고도화된 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")


@app.post("/api/conversation/quality-report")
async def generate_quality_report(request: dict):
    """대화 품질 리포트 생성"""
    try:
        time_range_hours = request.get("time_range_hours", 168)  # 기본 1주일
        include_improvement_suggestions = request.get("include_improvement_suggestions", True)
        
        # 시간 범위 설정
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=time_range_hours)
        
        # 메시지 수집
        messages = analyzer.get_messages_by_timerange(start_time, end_time)
        
        if not messages:
            raise HTTPException(status_code=404, detail="분석할 메시지가 없습니다")
            
        if not enhanced_summarizer:
            raise HTTPException(status_code=503, detail="분석 시스템이 초기화되지 않았습니다")
        
        # 품질 분석
        quality_metrics = enhanced_summarizer._analyze_message_quality(messages)
        
        # 전체 품질 통계
        overall_stats = {
            "total_participants": len(quality_metrics),
            "avg_consistency": sum(qm.consistency_score for qm in quality_metrics) / len(quality_metrics) if quality_metrics else 0,
            "avg_compliance": sum(qm.guideline_compliance for qm in quality_metrics) / len(quality_metrics) if quality_metrics else 0,
            "avg_authenticity": sum(qm.korean_authenticity for qm in quality_metrics) / len(quality_metrics) if quality_metrics else 0,
            "avg_informativeness": sum(qm.informativeness for qm in quality_metrics) / len(quality_metrics) if quality_metrics else 0,
            "avg_constructive_ratio": sum(qm.constructive_ratio for qm in quality_metrics) / len(quality_metrics) if quality_metrics else 0
        }
        
        # 개선이 필요한 영역
        improvement_areas = []
        if overall_stats["avg_consistency"] < 0.7:
            improvement_areas.append("메시지 일관성")
        if overall_stats["avg_compliance"] < 0.8:
            improvement_areas.append("가이드라인 준수")
        if overall_stats["avg_authenticity"] < 0.7:
            improvement_areas.append("한국어 자연성")
        if overall_stats["avg_constructive_ratio"] < 0.3:
            improvement_areas.append("건설적 소통")
            
        # 우수 참여자 및 개선 필요 참여자
        excellent_participants = [qm.person_name for qm in quality_metrics 
                                if qm.consistency_score > 0.8 and qm.guideline_compliance > 0.8]
        needs_improvement = [qm.person_name for qm in quality_metrics 
                           if qm.consistency_score < 0.6 or qm.guideline_compliance < 0.6]
        
        # 개선 제안사항
        suggestions = []
        if include_improvement_suggestions:
            if "메시지 일관성" in improvement_areas:
                suggestions.append("개인별 입장과 논리를 명확히 하여 일관된 메시지를 작성해보세요")
            if "가이드라인 준수" in improvement_areas:
                suggestions.append("상대방을 존중하고 건설적인 표현을 사용해보세요")
            if "건설적 소통" in improvement_areas:
                suggestions.append("비판보다는 대안과 해결방안을 제시하는 방향으로 소통해보세요")
                
        return {
            "success": True,
            "quality_report": {
                "overall_statistics": overall_stats,
                "individual_metrics": [
                    {
                        "person": qm.person_name,
                        "total_messages": qm.total_messages,
                        "avg_length": qm.avg_message_length,
                        "consistency": qm.consistency_score,
                        "compliance": qm.guideline_compliance,
                        "authenticity": qm.korean_authenticity,
                        "informativeness": qm.informativeness,
                        "constructive_ratio": qm.constructive_ratio
                    }
                    for qm in quality_metrics
                ],
                "excellence_recognition": excellent_participants,
                "improvement_needed": needs_improvement,
                "improvement_areas": improvement_areas,
                "suggestions": suggestions
            },
            "analysis_period": {
                "hours": time_range_hours,
                "total_messages": len(messages),
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat()
            },
            "generation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"품질 리포트 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"리포트 생성 실패: {str(e)}")


@app.post("/api/person/summary")
async def create_person_summary(request: PersonSummaryRequest):
    """개인별 대화 요약 (기본/고도화/완전고도화/한국어특성반영)"""
    try:
        start_date = date.fromisoformat(request.start_date)
        end_date = date.fromisoformat(request.end_date) if request.end_date else start_date
        
        # 시간 필터 처리
        time_filter = None
        if request.start_time and request.end_time:
            start_time_obj = time.fromisoformat(request.start_time)
            end_time_obj = time.fromisoformat(request.end_time)
            time_filter = (start_time_obj, end_time_obj)
        
        if request.summary_type == "korean":
            # 한국어 특성 반영 개인별 분석
            start_datetime = datetime.combine(start_date, time.min)
            end_datetime = datetime.combine(end_date, time.max)
            
            messages = analyzer.get_messages_by_person(request.person_name, start_datetime, end_datetime)
            
            if messages:
                # 한국어 특성 완전 반영 개인 분석
                all_messages = analyzer.get_messages_by_timerange(start_datetime, end_datetime)
                person_analysis = korean_analyzer._analyze_korean_person(
                    request.person_name, messages, all_messages
                )
                
                return {
                    "status": "success",
                    "summary_type": "korean_enhanced",
                    "person_summary": {
                        "person_name": person_analysis.person_name,
                        "role_category": person_analysis.role_category,
                        "speech_style": person_analysis.speech_style,
                        "politeness_level": person_analysis.politeness_level,
                        "total_messages": len(messages),
                        "main_activities": person_analysis.main_activities,
                        "key_statements": person_analysis.key_statements,
                        "topic_stances": person_analysis.topic_stances,
                        "emotional_pattern": person_analysis.emotional_pattern,
                        "influence_indicators": person_analysis.influence_indicators,
                        "korean_linguistic_features": person_analysis.korean_linguistic_features
                    },
                    "korean_linguistic_analysis": True,
                    "cultural_context_included": True,
                    "language_features": {
                        "주요_어미_패턴": person_analysis.korean_linguistic_features.get("주요_어미_패턴", []),
                        "담화_표지_사용": person_analysis.korean_linguistic_features.get("담화_표지_사용", []),
                        "경어법_일관성": person_analysis.korean_linguistic_features.get("경어법_일관성", "일관적"),
                        "문체_특징": person_analysis.korean_linguistic_features.get("문체_특징", [])
                    }
                }
            else:
                return {
                    "status": "success",
                    "summary_type": "korean_enhanced",
                    "person_summary": {
                        "person_name": request.person_name,
                        "role_category": "참여없음",
                        "speech_style": "분석불가",
                        "politeness_level": "분석불가",
                        "total_messages": 0,
                        "main_activities": [],
                        "key_statements": [],
                        "topic_stances": {},
                        "emotional_pattern": {},
                        "influence_indicators": {},
                        "korean_linguistic_features": {}
                    }
                }
        elif request.summary_type == "enhanced":
            # 완전 고도화된 개인별 분석
            start_datetime = datetime.combine(start_date, time.min)
            end_datetime = datetime.combine(end_date, time.max)
            
            messages = analyzer.get_messages_by_person(request.person_name, start_datetime, end_datetime)
            
            if messages:
                # 완전 고도화된 개인 분석
                all_messages = analyzer.get_messages_by_timerange(start_datetime, end_datetime)
                person_analysis = enhanced_analyzer._analyze_single_person_enhanced(
                    request.person_name, messages, all_messages
                )
                
                return {
                    "status": "success",
                    "summary_type": "enhanced",
                    "person_summary": {
                        "person_name": person_analysis.person_name,
                        "role": person_analysis.role,
                        "total_messages": len(messages),
                        "main_activities": person_analysis.main_activities,
                        "key_statements": person_analysis.key_statements,
                        "stance_positions": person_analysis.stance_positions,
                        "interaction_partners": person_analysis.interaction_partners,
                        "influence_level": person_analysis.influence_level
                    },
                    "sample_format_compatible": True
                }
            else:
                return {
                    "status": "success",
                    "summary_type": "enhanced",
                    "person_summary": {
                        "person_name": request.person_name,
                        "role": "참여없음",
                        "total_messages": 0,
                        "main_activities": [],
                        "key_statements": [],
                        "stance_positions": {},
                        "interaction_partners": [],
                        "influence_level": "none"
                    }
                }
        elif request.summary_type == "advanced":
            # 고도화된 개인별 분석
            start_datetime = datetime.combine(start_date, time.min)
            end_datetime = datetime.combine(end_date, time.max)
            
            messages = analyzer.get_messages_by_person(request.person_name, start_datetime, end_datetime)
            
            if messages:
                person_summary = advanced_summarizer._analyze_person_advanced(
                    request.person_name, messages, messages
                )
                
                return {
                    "status": "success",
                    "summary_type": "advanced",
                    "person_summary": {
                        "person_name": person_summary.person_name,
                        "role_classification": person_summary.role_classification,
                        "total_messages": person_summary.total_messages,
                        "main_activities": person_summary.main_activities,
                        "position_statements": person_summary.position_statements,
                        "key_contributions": person_summary.key_contributions,
                        "influence_indicators": person_summary.influence_indicators,
                        "timeline_summary": person_summary.timeline_summary
                    }
                }
            else:
                return {
                    "status": "success",
                    "summary_type": "advanced",
                    "person_summary": {
                        "person_name": request.person_name,
                        "role_classification": "참여없음",
                        "total_messages": 0,
                        "main_activities": [],
                        "position_statements": [],
                        "key_contributions": [],
                        "influence_indicators": {},
                        "timeline_summary": []
                    }
                }
        else:
            # 기본 개인별 요약
            summary = summarizer.summarize_person_conversation(
                request.person_name, start_date, end_date, time_filter
            )
            
            return {
                "status": "success",
                "summary_type": "basic",
                "person_summary": {
                    "person_name": summary.person_name,
                    "summary_period": summary.summary_period,
                    "total_messages": summary.total_messages,
                    "active_timeframes": [
                        {"start": start.isoformat(), "end": end.isoformat()} 
                        for start, end in summary.active_timeframes
                    ],
                    "main_topics_discussed": summary.main_topics_discussed,
                    "key_statements": summary.key_statements,
                    "opinion_positions": summary.opinion_positions,
                    "interaction_summary": summary.interaction_summary,
                    "influence_metrics": summary.influence_metrics,
                    "sentiment_pattern": summary.sentiment_pattern
                }
            }
        
    except Exception as e:
        logger.error(f"개인 요약 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"개인 요약 실패: {str(e)}")


@app.post("/api/topic/analysis")
async def analyze_topic_discussion(request: TopicAnalysisRequest):
    """특정 주제 토론 분석"""
    try:
        start_time = datetime.fromisoformat(request.start_time)
        end_time = datetime.fromisoformat(request.end_time)
        
        analysis = summarizer.analyze_specific_topic_discussion(
            request.topic, start_time, end_time
        )
        
        return {
            "status": "success",
            "topic_analysis": {
                "topic_name": analysis.topic_name,
                "category": analysis.category,
                "message_count": analysis.message_count,
                "participants": analysis.participants,
                "period": {
                    "start": analysis.start_time.isoformat(),
                    "end": analysis.end_time.isoformat()
                },
                "key_points": analysis.key_points,
                "consensus_level": analysis.consensus_level,
                "controversy_score": analysis.controversy_score,
                "decision_outcome": analysis.decision_outcome
            }
        }
        
    except Exception as e:
        logger.error(f"주제 분석 실패: {e}")
        raise HTTPException(status_code=500, detail=f"주제 분석 실패: {str(e)}")


# 5. 개인 프로필 분석
@app.get("/api/person/{person_name}/profile")
async def get_person_profile(person_name: str):
    """개인 프로필 분석"""
    try:
        profile = analyzer.analyze_person_profile(person_name)
        
        return {
            "status": "success",
            "profile": {
                "person_name": profile.person_name,
                "total_messages": profile.total_messages,
                "active_periods": [
                    {"start": start.isoformat(), "end": end.isoformat()}
                    for start, end in profile.active_periods
                ],
                "main_topics": profile.main_topics,
                "sentiment_tendency": profile.sentiment_tendency,
                "influence_score": profile.influence_score,
                "key_opinions": profile.key_opinions,
                "interaction_partners": profile.interaction_partners
            }
        }
        
    except Exception as e:
        logger.error(f"개인 프로필 분석 실패: {e}")
        raise HTTPException(status_code=500, detail=f"프로필 분석 실패: {str(e)}")


# 6. 채팅방 통계 및 현황
@app.get("/api/chat/statistics")
async def get_chat_statistics():
    """전체 채팅 통계"""
    try:
        import sqlite3
        conn = sqlite3.connect(analyzer.db_path)
        cursor = conn.cursor()
        
        # 전체 메시지 수
        cursor.execute("SELECT COUNT(*) FROM chat_messages")
        total_messages = cursor.fetchone()[0]
        
        # 채팅방 수
        cursor.execute("SELECT COUNT(DISTINCT chat_room) FROM chat_messages")
        total_rooms = cursor.fetchone()[0]
        
        # 참여자 수
        cursor.execute("SELECT COUNT(DISTINCT sender) FROM chat_messages")
        total_participants = cursor.fetchone()[0]
        
        # 주제별 분포
        cursor.execute("""
            SELECT topic_category, COUNT(*) 
            FROM chat_messages 
            WHERE topic_category IS NOT NULL 
            GROUP BY topic_category 
            ORDER BY COUNT(*) DESC
        """)
        topic_distribution = {row[0]: row[1] for row in cursor.fetchall()}
        
        # 감정 분포
        cursor.execute("""
            SELECT sentiment, COUNT(*) 
            FROM chat_messages 
            WHERE sentiment IS NOT NULL 
            GROUP BY sentiment
        """)
        sentiment_distribution = {row[0]: row[1] for row in cursor.fetchall()}
        
        conn.close()
        
        return {
            "status": "success",
            "statistics": {
                "total_messages": total_messages,
                "total_chat_rooms": total_rooms,
                "total_participants": total_participants,
                "topic_distribution": topic_distribution,
                "sentiment_distribution": sentiment_distribution,
                "last_updated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"통계 조회 실패: {str(e)}")


@app.get("/api/chat/participants")
async def get_all_participants():
    """전체 참여자 목록"""
    try:
        import sqlite3
        conn = sqlite3.connect(analyzer.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT sender, COUNT(*) as message_count,
                   MIN(timestamp) as first_message,
                   MAX(timestamp) as last_message
            FROM chat_messages 
            GROUP BY sender 
            ORDER BY message_count DESC
        """)
        
        participants = []
        for row in cursor.fetchall():
            participants.append({
                "name": row[0],
                "message_count": row[1],
                "first_message": row[2],
                "last_message": row[3]
            })
            
        conn.close()
        
        return {
            "status": "success",
            "participants": participants,
            "total_count": len(participants)
        }
        
    except Exception as e:
        logger.error(f"참여자 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"참여자 조회 실패: {str(e)}")


# 7. 검색 및 필터링
@app.get("/api/messages/search")
async def search_messages(
    keyword: Optional[str] = None,
    sender: Optional[str] = None,
    topic: Optional[str] = None,
    sentiment: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100
):
    """메시지 검색"""
    try:
        import sqlite3
        conn = sqlite3.connect(analyzer.db_path)
        cursor = conn.cursor()
        
        query = "SELECT * FROM chat_messages WHERE 1=1"
        params = []
        
        if keyword:
            query += " AND content LIKE ?"
            params.append(f"%{keyword}%")
            
        if sender:
            query += " AND sender = ?"
            params.append(sender)
            
        if topic:
            query += " AND topic_category = ?"
            params.append(topic)
            
        if sentiment:
            query += " AND sentiment = ?"
            params.append(sentiment)
            
        if start_date:
            query += " AND timestamp >= ?"
            params.append(start_date)
            
        if end_date:
            query += " AND timestamp <= ?"
            params.append(end_date)
            
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        messages = []
        for row in rows:
            messages.append({
                "message_id": row[1],
                "chat_room": row[2],
                "sender": row[3],
                "content": row[4],
                "timestamp": row[5],
                "topic_category": row[11],
                "sentiment": row[10]
            })
            
        conn.close()
        
        return {
            "status": "success",
            "messages": messages,
            "total_found": len(messages),
            "search_criteria": {
                "keyword": keyword,
                "sender": sender,
                "topic": topic,
                "sentiment": sentiment,
                "date_range": f"{start_date} ~ {end_date}" if start_date or end_date else None
            }
        }
        
    except Exception as e:
        logger.error(f"메시지 검색 실패: {e}")
        raise HTTPException(status_code=500, detail=f"검색 실패: {str(e)}")


# 8. 실전 조합 채팅방 시뮬레이션
@app.post("/api/demo/load-realistic-data")
async def load_realistic_demo_data():
    """실제 조합 채팅방과 유사한 데모 데이터 로드"""
    try:
        # 실제 패턴과 유사한 메시지들 생성
        demo_messages = [
            # 김한수 - 총회 실무진
            ChatMessage(
                message_id="demo_kim_001",
                chat_room="개포우성7차_데모",
                sender="김한수",
                content="총회 실무 안내드립니다. 위임장, 회의비 신청서 등 파일 제공해드리고 출력 안내드리겠습니다. 총회 장소는 개포중학교 강당이며, 참석절차와 시간표를 안내드립니다.",
                timestamp=datetime.now() - timedelta(hours=3),
                message_type="text",
                sentiment="neutral",
                topic_category="총회"
            ),
            
            # 송미화 - 운영권 논란 제기자
            ChatMessage(
                message_id="demo_song_001",
                chat_room="개포우성7차_데모",
                sender="송미화",
                content="GS-파르나스 협약이 조합원 권리 침해 소지가 있다고 봅니다. 스카이 커뮤니티 외부 위탁 운영의 불투명성을 지적하고 싶습니다. 서울시 심의 통과도 불확실한 상황입니다.",
                timestamp=datetime.now() - timedelta(hours=2, minutes=30),
                message_type="text",
                sentiment="negative",
                topic_category="운영권"
            ),
            
            # 김혜경 - 실용적 찬성파
            ChatMessage(
                message_id="demo_kim2_001",
                chat_room="개포우성7차_데모",
                sender="김혜경",
                content="외부 위탁 초기는 효율적일 수 있으며, 지나친 불안감은 경계해야 한다고 생각합니다. 본계약 이후에도 협상 가능하며 상생을 목표로 해야 합니다.",
                timestamp=datetime.now() - timedelta(hours=2, minutes=15),
                message_type="text",
                sentiment="positive",
                topic_category="운영권"
            ),
            
            # 김창희 - 조합 비판자
            ChatMessage(
                message_id="demo_chang_001",
                chat_room="개포우성7차_데모",
                sender="김창희",
                content="경쟁입찰이 가능했는데도 조합이 GS와 수의계약을 강행했습니다. 다른 단지보다 투명성과 협상력이 부족합니다. 조합장의 독단적 결정을 강력히 비판합니다.",
                timestamp=datetime.now() - timedelta(hours=2),
                message_type="text",
                sentiment="negative",
                topic_category="시공사"
            ),
            
            # 박제영 - 절차 문제 지적자
            ChatMessage(
                message_id="demo_park_001",
                chat_room="개포우성7차_데모",
                sender="박제영",
                content="속도전만 강조하는 분위기가 우려됩니다. 조합장과 일부 조합원의 독단을 경계해야 합니다. 주객전도된 구조이며 입찰 절차 미준수 가능성을 지적합니다.",
                timestamp=datetime.now() - timedelta(hours=1, minutes=45),
                message_type="text",
                sentiment="negative",
                topic_category="절차"
            ),
            
            # 심원경 - 현실적 중재자
            ChatMessage(
                message_id="demo_sim_001",
                chat_room="개포우성7차_데모",
                sender="심원경",
                content="본계약 전 절차와 검토는 가능합니다. 계약 전 수정이 가능하므로 지나친 우려는 불필요하다고 봅니다. 현실적인 접근이 필요한 시점입니다.",
                timestamp=datetime.now() - timedelta(hours=1, minutes=30),
                message_type="text",
                sentiment="positive",
                topic_category="절차"
            ),
            
            # 여환맹 - 실용적 지지자
            ChatMessage(
                message_id="demo_yeo_001",
                chat_room="개포우성7차_데모",
                sender="여환맹",
                content="외부 운영에 대한 실용적 관점을 강조하고 싶습니다. 파르나스 운영은 품질 측면에서 유리하며 경쟁력 있는 선택일 수 있다고 봅니다.",
                timestamp=datetime.now() - timedelta(hours=1, minutes=15),
                message_type="text",
                sentiment="positive",
                topic_category="운영권"
            ),
            
            # 윤상혁 - 제안서 검토자
            ChatMessage(
                message_id="demo_yoon_001",
                chat_room="개포우성7차_데모",
                sender="윤상혁",
                content="영업정지 보증 조건이 왜곡되어 있습니다. 제안서 내용 수정이 미이행되고 있는 문제를 지적합니다. 보다 정확한 검토가 필요합니다.",
                timestamp=datetime.now() - timedelta(hours=1),
                message_type="text",
                sentiment="negative",
                topic_category="시공사"
            ),
            
            # 김정준 - 총회 안내 담당
            ChatMessage(
                message_id="demo_jung_001",
                chat_room="개포우성7차_데모",
                sender="김정준",
                content="7월 12일 총회 일정을 상세히 안내드립니다. 개포중학교 강당에서 오후 2시 시작이며, 셔틀버스는 1시부터 운행됩니다. 참석절차를 꼼꼼히 확인해 주시기 바랍니다.",
                timestamp=datetime.now() - timedelta(minutes=45),
                message_type="text",
                sentiment="neutral",
                topic_category="총회"
            ),
            
            # 조슬기 - 정보 제공자
            ChatMessage(
                message_id="demo_jo_001",
                chat_room="개포우성7차_데모",
                sender="조슬기",
                content="외부 사례로 파크포레온 영상을 공유합니다. 다른 단지의 운영 현황을 참고하시면 도움이 될 것 같습니다. 자료를 첨부파일로 올려드리겠습니다.",
                timestamp=datetime.now() - timedelta(minutes=30),
                message_type="text",
                sentiment="neutral",
                topic_category="운영권"
            )
        ]
        
        # 메시지 저장
        analyzer.save_messages(demo_messages)
        
        return {
            "status": "success",
            "message": "실제 조합 채팅방 패턴의 데모 데이터가 로드되었습니다",
            "demo_data": {
                "total_messages": len(demo_messages),
                "participants": list(set(msg.sender for msg in demo_messages)),
                "topics": list(set(msg.topic_category for msg in demo_messages if msg.topic_category)),
                "time_range": {
                    "start": demo_messages[0].timestamp.isoformat(),
                    "end": demo_messages[-1].timestamp.isoformat()
                }
            },
            "analysis_ready": True
        }
        
    except Exception as e:
        logger.error(f"데모 데이터 로드 실패: {e}")
        raise HTTPException(status_code=500, detail=f"데모 데이터 로드 실패: {str(e)}")


# 8. 완전 고도화 전용 기능들
@app.post("/api/enhanced/load-sample-data")
async def load_sample_level_data():
    """샘플 수준의 실제 패턴 데이터 로드"""
    try:
        # 제공해주신 샘플과 정확히 동일한 패턴의 메시지들
        sample_messages = [
            # 김한수 - 총회 실무 안내 (샘플 원본)
            ChatMessage(
                message_id="sample_kim_hansu_001",
                chat_room="개포우성7차_샘플",
                sender="김한수",
                content="총회 실무 안내 및 서류 제공합니다. 위임장, 회의비 신청서 등 파일 제공 및 출력 안내드리겠습니다. 총회 장소, 참석절차, 시간표 안내드립니다.",
                timestamp=datetime.now() - timedelta(hours=4),
                message_type="text",
                sentiment="neutral",
                topic_category="총회"
            ),
            
            # 송미화 - 운영권 논란 (샘플 원본)
            ChatMessage(
                message_id="sample_song_mihwa_001",
                chat_room="개포우성7차_샘플",
                sender="송미화",
                content="GS–파르나스 협약이 조합원 권리 침해 소지 있음 지적합니다. 스카이 커뮤니티 외부 위탁 운영의 불투명성을 지적하고 싶습니다.",
                timestamp=datetime.now() - timedelta(hours=3, minutes=45),
                message_type="text",
                sentiment="negative",
                topic_category="운영권"
            ),
            
            # 김혜경 - 실용적 관점 (샘플 원본)
            ChatMessage(
                message_id="sample_kim_hyekyeong_001",
                chat_room="개포우성7차_샘플",
                sender="김혜경",
                content="외부 위탁 초기는 효율적일 수 있으며, 지나친 불안감은 경계해야 합니다. 본계약 이후에도 충분히 협상이 가능하며, 무엇보다 상생을 목표로 접근해야 한다고 봅니다.",
                timestamp=datetime.now() - timedelta(hours=3, minutes=30),
                message_type="text",
                sentiment="positive",
                topic_category="운영권"
            ),
            
            # 여환맹, 조남희 - 실용적 지지 (샘플 패턴)
            ChatMessage(
                message_id="sample_yeo_hwanmaeng_001",
                chat_room="개포우성7차_샘플",
                sender="여환맹",
                content="외부 위탁 초기는 효율적일 수 있으며, 지나친 불안감은 경계해야 합니다. 파르나스 운영은 품질 측면에서 유리하며 경쟁력 있는 선택입니다.",
                timestamp=datetime.now() - timedelta(hours=3, minutes=15),
                message_type="text",
                sentiment="positive",
                topic_category="운영권"
            ),
            
            # 심원경 - 절차적 옹호 (샘플 패턴)
            ChatMessage(
                message_id="sample_sim_wonkyeong_001",
                chat_room="개포우성7차_샘플",
                sender="심원경",
                content="본계약 전 절차와 검토는 가능하며, 계약 전 수정 가능하므로 지나친 우려는 불필요합니다. 입대위 출범 후 변경 가능한 상황입니다.",
                timestamp=datetime.now() - timedelta(hours=3),
                message_type="text",
                sentiment="positive",
                topic_category="절차"
            ),
            
            # 김창희 - GS 수의계약 비판 (샘플 원본)
            ChatMessage(
                message_id="sample_kim_changhee_001",
                chat_room="개포우성7차_샘플",
                sender="김창희",
                content="경쟁입찰 가능했음에도 조합이 GS와 수의계약을 강행한 것은 문제가 있다고 봅니다. 다른 단지들과 비교해봐도 투명성과 협상력이 현저히 부족합니다. 조합장님의 독단적인 결정 방식에 대해 강력히 우려를 표명합니다.",
                timestamp=datetime.now() - timedelta(hours=2, minutes=45),
                message_type="text",
                sentiment="negative",
                topic_category="시공사"
            ),
            
            # 박제영 - 절차 문제 지적 (샘플 원본)
            ChatMessage(
                message_id="sample_park_jeyoung_001",
                chat_room="개포우성7차_샘플",
                sender="박제영",
                content="속도전만 강조하는 분위기 우려됩니다. 조합장과 일부 조합원의 독단을 경계해야 합니다. 주객전도된 구조, 입찰 절차 미준수 가능성을 지적합니다.",
                timestamp=datetime.now() - timedelta(hours=2, minutes=30),
                message_type="text",
                sentiment="negative",
                topic_category="절차"
            ),
            
            # 조슬기 - 정보 제공자 (샘플 패턴)
            ChatMessage(
                message_id="sample_jo_seulgi_001",
                chat_room="개포우성7차_샘플",
                sender="조슬기",
                content="외부 사례(파크포레온) 영상을 공유합니다. 다른 단지의 운영 현황을 참고하시면 도움이 될 것 같습니다.",
                timestamp=datetime.now() - timedelta(hours=2),
                message_type="text",
                sentiment="neutral",
                topic_category="운영권"
            )
        ]
        
        # 메시지 저장
        analyzer.save_messages(sample_messages)
        
        return {
            "status": "success",
            "message": "샘플 수준의 실제 조합 채팅방 패턴 데이터가 로드되었습니다",
            "sample_data": {
                "total_messages": len(sample_messages),
                "participants": list(set(msg.sender for msg in sample_messages)),
                "topics": list(set(msg.topic_category for msg in sample_messages if msg.topic_category)),
                "time_range": {
                    "start": sample_messages[0].timestamp.isoformat(),
                    "end": sample_messages[-1].timestamp.isoformat()
                }
            },
            "analysis_ready": True,
            "sample_compatible": True
        }
        
    except Exception as e:
        logger.error(f"샘플 데이터 로드 실패: {e}")
        raise HTTPException(status_code=500, detail=f"샘플 데이터 로드 실패: {str(e)}")


@app.get("/api/enhanced/sample-summary")
async def get_sample_level_summary():
    """샘플 수준의 완전 고도화된 요약 생성"""
    try:
        # 최근 5시간 데이터로 요약 생성
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=5)
        
        # 완전 고도화된 요약 생성
        enhanced_summary = enhanced_analyzer.create_enhanced_summary(start_time, end_time)
        
        # 샘플 형식과 정확히 일치하는 포맷팅
        formatted_report = enhanced_analyzer.format_enhanced_summary(enhanced_summary)
        
        return {
            "status": "success",
            "summary_type": "enhanced",
            "summary": {
                "summary_id": enhanced_summary.summary_id,
                "period": enhanced_summary.period,
                "total_participants": len(enhanced_summary.person_analyses),
                "person_analyses": [
                    {
                        "person_name": pa.person_name,
                        "role": pa.role,
                        "main_activities": pa.main_activities,
                        "key_statements": pa.key_statements,
                        "stance_positions": pa.stance_positions,
                        "influence_level": pa.influence_level
                    } for pa in enhanced_summary.person_analyses
                ],
                "topic_analyses": [
                    {
                        "topic_name": ta.topic_name,
                        "main_issue": ta.main_issue,
                        "participants": ta.participants,
                        "consensus_status": ta.consensus_status
                    } for ta in enhanced_summary.topic_analyses
                ]
            },
            "formatted_report": formatted_report,
            "sample_format_match": True,
            "quality_level": "production_ready"
        }
        
    except Exception as e:
        logger.error(f"샘플 수준 요약 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"샘플 수준 요약 실패: {str(e)}")


# 메인 실행
if __name__ == "__main__":
    import uvicorn
    
    print("🚀 AI 고도화 한국어 대화 분석 시스템 v5.0 시작")
    print("=" * 80)
    print("🤖 AI 차세대 기능:")
    print("   1. AI 기반 감정 분석 및 의도 파악")
    print("   2. 실시간 대화 흐름 및 역학 관계 분석")
    print("   3. 예측적 인사이트 및 결과 분석")
    print("   4. AI 권고사항 및 갈등 해결 방안")
    print("   5. 시각적 네트워크 및 차트 데이터 생성")
    print("   6. 인용 대화 원문 완벽 보존")
    print("   7. 한국어 담화 구조 정밀 분석")
    print("")
    print("🎯 v5.0 혁신 특징:")
    print("   🧠 AI 기반 영향력 네트워크 분석")
    print("   📊 감정 궤적 및 변화 예측")
    print("   🔮 컨텍스트 기반 중요도 자동 계산")
    print("   🏮 한국 문화적 맥락 완벽 반영")
    print("   📈 다중 레벨 요약 자동 생성")
    print("   💡 갈등 해결 시나리오 AI 제안")
    print("   📝 인용문 원문 유지 + 분석 평어 표현")
    print("")
    print("🌐 AI 고도화 API:")
    print("   - POST /api/conversation/summary?summary_type=ai_advanced")
    print("   - POST /api/ai-advanced/load-sample-data")
    print("   - GET  /api/ai-advanced/full-analysis")
    print("   - POST /api/korean/load-optimized-sample")
    print("")
    print("🏆 **최첨단 AI 기반 한국어 대화 분석 - 차세대 수준!**")
    print("")
    
    uvicorn.run(app, host="0.0.0.0", port=8002) 


@app.post("/api/ai-message-generation/analyze-person")
async def analyze_person_profile(request: dict):
    """개인 성향 및 선호도 분석"""
    try:
        person_name = request.get("person_name")
        time_window_days = request.get("time_window_days", 30)
        
        if not person_name:
            raise HTTPException(status_code=400, detail="person_name이 필요합니다")
            
        profile = ai_message_generator.learn_person_profile(person_name, time_window_days)
        
        return {
            "success": True,
            "person_profile": {
                "person_name": profile.person_name,
                "political_stance": profile.political_stance,
                "preferred_construction_company": profile.preferred_construction_company,
                "communication_style": profile.communication_style,
                "formality_level": profile.formality_level,
                "typical_topics": profile.typical_topics,
                "signature_phrases": profile.signature_phrases,
                "message_intent_patterns": profile.message_intent_patterns,
                "korean_linguistic_style": profile.korean_linguistic_style
            },
            "analysis_date": datetime.now().isoformat(),
            "time_window_days": time_window_days
        }
        
    except Exception as e:
        logger.error(f"개인 프로필 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")


@app.post("/api/ai-message-generation/generate")
async def generate_contextual_message(request: dict):
    """맥락을 고려한 메시지 생성"""
    try:
        person_name = request.get("person_name")
        target_topic = request.get("target_topic")
        message_intent = request.get("message_intent")
        reference_context = request.get("reference_context")
        
        if not all([person_name, target_topic, message_intent]):
            raise HTTPException(
                status_code=400, 
                detail="person_name, target_topic, message_intent가 필요합니다"
            )
            
        generated_message = ai_message_generator.generate_contextual_message(
            person_name=person_name,
            target_topic=target_topic,
            message_intent=message_intent,
            reference_context=reference_context
        )
        
        return {
            "success": True,
            "generated_message": {
                "message_id": generated_message.message_id,
                "content": generated_message.generated_content,
                "source_person": generated_message.source_person,
                "confidence_score": generated_message.confidence_score,
                "generation_method": generated_message.generation_method,
                "template_used": generated_message.template_used,
                "quality_metrics": generated_message.quality_metrics,
                "korean_authenticity_score": generated_message.korean_authenticity_score
            },
            "generation_timestamp": datetime.now().isoformat(),
            "request_parameters": {
                "person_name": person_name,
                "target_topic": target_topic,
                "message_intent": message_intent
            }
        }
        
    except Exception as e:
        logger.error(f"메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"생성 실패: {str(e)}")


@app.post("/api/ai-message-generation/batch-generate")
async def batch_generate_messages(request: dict):
    """배치 메시지 생성"""
    try:
        generation_requests = request.get("requests", [])
        
        if not generation_requests:
            raise HTTPException(status_code=400, detail="generation requests가 필요합니다")
            
        results = []
        
        for req in generation_requests:
            try:
                generated_message = ai_message_generator.generate_contextual_message(
                    person_name=req.get("person_name"),
                    target_topic=req.get("target_topic"),
                    message_intent=req.get("message_intent"),
                    reference_context=req.get("reference_context")
                )
                
                results.append({
                    "success": True,
                    "request": req,
                    "generated_message": {
                        "message_id": generated_message.message_id,
                        "content": generated_message.generated_content,
                        "source_person": generated_message.source_person,
                        "confidence_score": generated_message.confidence_score,
                        "quality_metrics": generated_message.quality_metrics,
                        "korean_authenticity_score": generated_message.korean_authenticity_score
                    }
                })
                
            except Exception as e:
                results.append({
                    "success": False,
                    "request": req,
                    "error": str(e)
                })
                
        return {
            "success": True,
            "total_requests": len(generation_requests),
            "successful_generations": len([r for r in results if r["success"]]),
            "failed_generations": len([r for r in results if not r["success"]]),
            "results": results,
            "batch_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"배치 메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"배치 생성 실패: {str(e)}")


@app.get("/api/ai-message-generation/guidelines")
async def get_project_guidelines():
    """프로젝트 가이드라인 조회"""
    try:
        guidelines = ai_message_generator._load_project_guidelines()
        
        return {
            "success": True,
            "guidelines": guidelines,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"가이드라인 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")


@app.post("/api/ai-message-generation/validate-message")
async def validate_message_quality(request: dict):
    """메시지 품질 검증"""
    try:
        message_content = request.get("message_content")
        person_name = request.get("person_name")
        
        if not all([message_content, person_name]):
            raise HTTPException(
                status_code=400,
                detail="message_content와 person_name이 필요합니다"
            )
            
        # 개인 프로필 로드
        profile = ai_message_generator.learn_person_profile(person_name)
        
        # 가이드라인 로드
        guidelines = ai_message_generator._load_project_guidelines()
        
        # 목소리 일관성 분석
        voice_consistency = ai_message_generator._analyze_voice_consistency(person_name, guidelines)
        
        # 품질 검증
        quality_metrics = ai_message_generator._validate_message_quality(
            message_content, profile, guidelines, voice_consistency
        )
        
        # 한국어 자연스러움 검증
        korean_authenticity = ai_message_generator._validate_korean_authenticity(
            message_content, profile
        )
        
        return {
            "success": True,
            "validation_results": {
                "overall_quality": quality_metrics.get("overall_confidence", 0.0),
                "consistency_score": quality_metrics.get("consistency", 0.0),
                "compliance_score": quality_metrics.get("compliance", 0.0),
                "naturalness_score": quality_metrics.get("naturalness", 0.0),
                "informativeness_score": quality_metrics.get("informativeness", 0.0),
                "korean_authenticity_score": korean_authenticity,
                "detailed_metrics": quality_metrics
            },
            "person_profile": {
                "political_stance": profile.political_stance,
                "communication_style": profile.communication_style,
                "formality_level": profile.formality_level
            },
            "validation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"메시지 검증 오류: {e}")
        raise HTTPException(status_code=500, detail=f"검증 실패: {str(e)}")


@app.get("/api/ai-message-generation/templates")
async def get_message_templates():
    """메시지 템플릿 조회"""
    try:
        templates = ai_message_generator.korean_message_templates
        
        template_list = []
        for template in templates:
            template_list.append({
                "template_id": template.template_id,
                "stance_type": template.stance_type,
                "construction_preference": template.construction_preference,
                "intent_category": template.intent_category,
                "korean_style": template.korean_style,
                "template_structure": template.template_structure,
                "cultural_elements": template.cultural_elements,
                "variable_slots": template.variable_slots
            })
            
        return {
            "success": True,
            "total_templates": len(template_list),
            "templates": template_list,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"템플릿 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")


@app.post("/api/ai-message-generation/smart-response")
async def generate_smart_response(request: dict):
    """스마트 응답 생성 (기존 대화 맥락 고려)"""
    try:
        person_name = request.get("person_name")
        conversation_context = request.get("conversation_context", [])
        response_intent = request.get("response_intent", "일반형")
        target_person = request.get("target_person")  # 응답 대상
        
        if not person_name:
            raise HTTPException(status_code=400, detail="person_name이 필요합니다")
            
        # 대화 맥락에서 주제 추출
        if conversation_context:
            recent_messages = conversation_context[-5:]  # 최근 5개 메시지
            topics = []
            for msg in recent_messages:
                content = msg.get("content", "")
                # 주요 키워드 추출
                if "시공사" in content or "GS" in content or "파르나스" in content:
                    topics.append("시공사 선정")
                elif "분담금" in content or "비용" in content:
                    topics.append("비용 관리")
                elif "총회" in content or "회의" in content:
                    topics.append("총회 운영")
                elif "투명성" in content or "공개" in content:
                    topics.append("투명성")
                    
            target_topic = topics[0] if topics else "일반 토론"
        else:
            target_topic = "일반 토론"
            
        # 맥락을 고려한 메시지 생성
        generated_message = ai_message_generator.generate_contextual_message(
            person_name=person_name,
            target_topic=target_topic,
            message_intent=response_intent,
            reference_context={
                "conversation_history": conversation_context,
                "target_person": target_person,
                "response_type": "contextual_reply"
            }
        )
        
        return {
            "success": True,
            "smart_response": {
                "message_id": generated_message.message_id,
                "content": generated_message.generated_content,
                "source_person": generated_message.source_person,
                "confidence_score": generated_message.confidence_score,
                "quality_metrics": generated_message.quality_metrics,
                "korean_authenticity_score": generated_message.korean_authenticity_score
            },
            "context_analysis": {
                "extracted_topic": target_topic,
                "conversation_length": len(conversation_context),
                "target_person": target_person,
                "response_intent": response_intent
            },
            "generation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"스마트 응답 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"응답 생성 실패: {str(e)}") 


@app.post("/api/political-style/generate")
async def generate_political_style_message(request: dict):
    """정치인 스타일 메시지 생성"""
    try:
        politician_style = request.get("politician_style")
        target_topic = request.get("target_topic")
        message_intent = request.get("message_intent", "의견형")
        context = request.get("context")
        
        if not all([politician_style, target_topic]):
            raise HTTPException(
                status_code=400,
                detail="politician_style과 target_topic이 필요합니다"
            )
            
        styled_message = ai_message_generator.generate_political_style_message(
            politician_style=politician_style,
            target_topic=target_topic,
            message_intent=message_intent,
            context=context
        )
        
        return {
            "success": True,
            "styled_message": {
                "message_id": styled_message.message_id,
                "content": styled_message.content,
                "style_source": styled_message.style_source,
                "confidence_score": styled_message.confidence_score,
                "style_elements_used": styled_message.style_elements_used,
                "authenticity_score": styled_message.authenticity_score
            },
            "generation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"생성 실패: {str(e)}")


@app.post("/api/political-style/hybrid-generate")
async def generate_hybrid_style_message(request: dict):
    """개인 성향 + 정치인 스타일 혼합 메시지 생성"""
    try:
        person_name = request.get("person_name")
        politician_style = request.get("politician_style")
        target_topic = request.get("target_topic")
        message_intent = request.get("message_intent")
        blend_ratio = request.get("blend_ratio", 0.7)
        
        if not all([person_name, politician_style, target_topic, message_intent]):
            raise HTTPException(
                status_code=400,
                detail="person_name, politician_style, target_topic, message_intent가 필요합니다"
            )
            
        hybrid_message = ai_message_generator.generate_hybrid_message(
            person_name=person_name,
            politician_style=politician_style,
            target_topic=target_topic,
            message_intent=message_intent,
            blend_ratio=blend_ratio
        )
        
        return {
            "success": True,
            "hybrid_message": {
                "message_id": hybrid_message.message_id,
                "content": hybrid_message.generated_content,
                "source_person": hybrid_message.source_person,
                "confidence_score": hybrid_message.confidence_score,
                "generation_method": hybrid_message.generation_method,
                "template_used": hybrid_message.template_used,
                "quality_metrics": hybrid_message.quality_metrics,
                "korean_authenticity_score": hybrid_message.korean_authenticity_score
            },
            "blend_configuration": {
                "person_name": person_name,
                "politician_style": politician_style,
                "blend_ratio": blend_ratio
            },
            "generation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"혼합 스타일 메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"생성 실패: {str(e)}")


@app.get("/api/political-style/available-styles")
async def get_available_political_styles():
    """사용 가능한 정치인 스타일 목록 조회"""
    try:
        styles = ai_message_generator.get_available_political_styles()
        
        return {
            "success": True,
            "available_styles": styles,
            "total_count": len(styles),
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 목록 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"조회 실패: {str(e)}")


@app.post("/api/political-style/analyze")
async def analyze_message_political_style(request: dict):
    """메시지의 정치인 스타일 분석"""
    try:
        message_content = request.get("message_content")
        
        if not message_content:
            raise HTTPException(status_code=400, detail="message_content가 필요합니다")
            
        analysis_result = ai_message_generator.analyze_message_political_style(message_content)
        
        return {
            "success": True,
            "style_analysis": analysis_result,
            "message_content": message_content,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"분석 실패: {str(e)}")


@app.post("/api/political-style/recommend")
async def recommend_political_style(request: dict):
    """개인에게 적합한 정치인 스타일 추천"""
    try:
        person_name = request.get("person_name")
        target_topic = request.get("target_topic")
        
        if not all([person_name, target_topic]):
            raise HTTPException(
                status_code=400,
                detail="person_name과 target_topic이 필요합니다"
            )
            
        recommendation = ai_message_generator.recommend_political_style(
            person_name=person_name,
            target_topic=target_topic
        )
        
        return {
            "success": recommendation.get("success", True),
            "recommendation": recommendation,
            "request_info": {
                "person_name": person_name,
                "target_topic": target_topic
            },
            "recommendation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 추천 오류: {e}")
        raise HTTPException(status_code=500, detail=f"추천 실패: {str(e)}")


@app.post("/api/political-style/compare")
async def compare_political_styles(request: dict):
    """여러 정치인 스타일 비교 메시지 생성"""
    try:
        target_topic = request.get("target_topic")
        politician_styles = request.get("politician_styles", [])
        
        if not target_topic:
            raise HTTPException(status_code=400, detail="target_topic이 필요합니다")
            
        if not politician_styles:
            # 기본값으로 모든 스타일 사용
            politician_styles = ["유시민", "정준희", "진중권", "박형준", "정원책", "이철희"]
        elif len(politician_styles) > 6:
            politician_styles = politician_styles[:6]  # 최대 6개 제한
            
        comparative_messages = ai_message_generator.generate_style_comparison(
            topic=target_topic,
            politician_styles=politician_styles
        )
        
        # 결과 포맷팅
        formatted_results = {}
        for politician, styled_msg in comparative_messages.items():
            formatted_results[politician] = {
                "content": styled_msg.content,
                "confidence_score": styled_msg.confidence_score,
                "style_elements_used": styled_msg.style_elements_used,
                "authenticity_score": styled_msg.authenticity_score
            }
            
        return {
            "success": True,
            "comparative_analysis": {
                "target_topic": target_topic,
                "styles_compared": list(comparative_messages.keys()),
                "messages": formatted_results
            },
            "analysis_metadata": {
                "total_styles": len(comparative_messages),
                "generation_timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 비교 오류: {e}")
        raise HTTPException(status_code=500, detail=f"비교 실패: {str(e)}")


@app.post("/api/political-style/learn")
async def learn_politician_style(request: dict):
    """연설/발언 데이터로부터 정치인 스타일 학습"""
    try:
        politician_name = request.get("politician_name")
        speech_data = request.get("speech_data", [])
        
        if not all([politician_name, speech_data]):
            raise HTTPException(
                status_code=400,
                detail="politician_name과 speech_data가 필요합니다"
            )
            
        if len(speech_data) < 3:
            raise HTTPException(
                status_code=400,
                detail="최소 3개 이상의 연설/발언 데이터가 필요합니다"
            )
            
        learning_result = ai_message_generator.learn_politician_style_from_data(
            politician_name=politician_name,
            speech_data=speech_data
        )
        
        return {
            "success": learning_result.get("success", True),
            "learning_result": learning_result,
            "input_data": {
                "politician_name": politician_name,
                "speech_data_count": len(speech_data)
            },
            "learning_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 학습 오류: {e}")
        raise HTTPException(status_code=500, detail=f"학습 실패: {str(e)}")


@app.post("/api/political-style/demo")
async def demo_political_style_generation(request: dict):
    """정치인 스타일 데모 (모든 스타일로 샘플 메시지 생성)"""
    try:
        demo_topic = request.get("demo_topic", "시공사 선정")
        
        # 모든 정치인 스타일로 샘플 생성
        all_styles = ["유시민", "정준희", "진중권", "박형준", "정원책", "이철희"]
        demo_messages = {}
        
        for style in all_styles:
            try:
                styled_msg = ai_message_generator.generate_political_style_message(
                    politician_style=style,
                    target_topic=demo_topic,
                    message_intent="의견형"
                )
                
                demo_messages[style] = {
                    "content": styled_msg.content,
                    "confidence_score": styled_msg.confidence_score,
                    "style_elements": styled_msg.style_elements_used,
                    "authenticity": styled_msg.authenticity_score
                }
                
            except Exception as style_error:
                demo_messages[style] = {
                    "error": str(style_error)
                }
                
        # 스타일별 특징 설명
        style_descriptions = {
            "유시민": "논리적이고 합리적인 접근, 데이터 기반 분석",
            "정준희": "현실적이고 직설적인 표현, 사실 중심 접근",
            "진중권": "비판적이고 철학적 관점, 날카로운 분석",
            "박형준": "균형잡힌 중재적 접근, 협력 지향적",
            "정원책": "진보적 가치 추구, 개혁적 관점",
            "이철희": "체계적이고 정책적 접근, 단계적 분석"
        }
        
        return {
            "success": True,
            "demo_results": {
                "topic": demo_topic,
                "generated_messages": demo_messages,
                "style_descriptions": style_descriptions
            },
            "demo_metadata": {
                "total_styles": len(all_styles),
                "successful_generations": len([msg for msg in demo_messages.values() if "error" not in msg]),
                "generation_timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"정치인 스타일 데모 오류: {e}")
        raise HTTPException(status_code=500, detail=f"데모 실패: {str(e)}")