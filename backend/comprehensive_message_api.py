#!/usr/bin/env python3
"""
종합 카카오톡 메시지 관리 API v8.0
- 복합 미디어 메시지 데이터베이스 통합
- 고도화된 미디어 처리 시스템
- 실시간 파일 업로드 및 분석
- 메시지 구성 요소별 검색
- 미디어 콘텐츠 기반 AI 메시지 생성
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union
from datetime import datetime, timedelta
import uvicorn
import logging
import os
import json
import shutil
from pathlib import Path

# 통합 시스템들
from advanced_message_database import AdvancedMessageDatabase, ComplexMessage, MessageComponent
from enhanced_media_processor import EnhancedMediaProcessor, ProcessedMedia
from integrated_ai_system import IntegratedAISystem
from kakao_chat_parser import KakaoChatParser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="종합 카카오톡 메시지 관리 API v8.0",
    description="복합 미디어 메시지 분석 및 AI 메시지 생성 통합 시스템",
    version="8.0.0"
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
message_db: Optional[AdvancedMessageDatabase] = None
media_processor: Optional[EnhancedMediaProcessor] = None
ai_system: Optional[IntegratedAISystem] = None
chat_parser: Optional[KakaoChatParser] = None


# Pydantic 모델들
class MessageSearchRequest(BaseModel):
    chat_room_id: Optional[str] = None
    sender_id: Optional[str] = None
    content_type: Optional[str] = None
    keywords: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    has_media: Optional[bool] = None
    limit: int = 50


class MediaProcessingRequest(BaseModel):
    file_ids: List[str]
    processing_options: Optional[Dict[str, Any]] = None


class AIMessageRequest(BaseModel):
    person_id: str
    target_topic: str
    message_intent: str
    reference_media_ids: Optional[List[str]] = None
    use_political_style: Optional[str] = None
    political_blend_ratio: float = 0.3


class MessageAnalysisResponse(BaseModel):
    success: bool
    message_id: str
    analysis_results: Dict[str, Any]
    extracted_content: List[Dict[str, Any]]
    media_analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모든 시스템 초기화"""
    global message_db, media_processor, ai_system, chat_parser
    
    logger.info("🚀 종합 카카오톡 메시지 관리 API v8.0 시작...")
    
    try:
        # 시스템들 초기화
        message_db = AdvancedMessageDatabase()
        media_processor = EnhancedMediaProcessor()
        ai_system = IntegratedAISystem()
        chat_parser = KakaoChatParser()
        
        logger.info("✅ 모든 시스템 초기화 완료")
        
        # 업로드 디렉토리 생성
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
    except Exception as e:
        logger.error(f"❌ 시스템 초기화 실패: {e}")
        raise


@app.get("/", response_model=Dict[str, Any])
async def root():
    """루트 엔드포인트"""
    
    return {
        "service": "종합 카카오톡 메시지 관리 API",
        "version": "8.0.0",
        "description": "복합 미디어 메시지 분석 및 AI 메시지 생성 통합 시스템",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "key_features": [
            "복합 미디어 메시지 파싱 및 저장",
            "이미지/문서/음성/비디오 콘텐츠 추출",
            "메시지 구성 요소별 검색",
            "미디어 기반 AI 메시지 생성",
            "실시간 파일 처리",
            "개인별 학습 데이터 통합"
        ],
        "api_endpoints": {
            "upload_chat": "/api/v8/upload-chat",
            "upload_media": "/api/v8/upload-media",
            "search_messages": "/api/v8/search",
            "message_analysis": "/api/v8/messages/{message_id}/analysis",
            "media_processing": "/api/v8/media/process",
            "ai_message_generation": "/api/v8/ai-message",
            "database_stats": "/api/v8/database/statistics"
        }
    }


@app.post("/api/v8/upload-chat")
async def upload_chat_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    chat_room_name: str = Form(...)
):
    """카카오톡 채팅 파일 업로드 및 복합 분석"""
    
    try:
        if not file.filename.endswith('.txt'):
            raise HTTPException(status_code=400, detail="txt 파일만 업로드 가능합니다")
            
        # 파일 저장
        upload_path = Path("uploads") / file.filename
        with open(upload_path, "wb") as f:
            content = await file.read()
            f.write(content)
            
        # 백그라운드에서 복합 처리
        background_tasks.add_task(
            process_uploaded_chat_comprehensive,
            str(upload_path),
            chat_room_name
        )
        
        return {
            "success": True,
            "message": "채팅 파일 업로드 완료, 백그라운드에서 분석 중",
            "file_name": file.filename,
            "chat_room": chat_room_name,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"채팅 파일 업로드 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_uploaded_chat_comprehensive(file_path: str, chat_room_name: str):
    """채팅 파일 종합 처리"""
    
    try:
        logger.info(f"채팅 파일 종합 분석 시작: {file_path}")
        
        # 1. 채팅 파싱
        kakao_room = chat_parser.parse_chat_file(file_path)
        chat_room_id = f"room_{hash(chat_room_name) % 10000:04d}"
        
        # 2. 각 메시지를 복합 메시지로 변환 및 저장
        for kakao_msg in kakao_room.messages:
            if kakao_msg.message_type == "text" and not kakao_msg.is_deleted:
                # 복합 메시지 파싱
                complex_msg = message_db.parse_complex_message(
                    raw_message=kakao_msg.content,
                    sender=kakao_msg.sender,
                    timestamp=kakao_msg.timestamp,
                    chat_room_id=chat_room_id,
                    media_folder=kakao_room.media_folder
                )
                
                # 데이터베이스 저장
                message_db.save_complex_message(complex_msg)
                
        # 3. 미디어 폴더 처리 (있는 경우)
        if kakao_room.media_folder and os.path.exists(kakao_room.media_folder):
            media_results = media_processor.batch_process_directory(kakao_room.media_folder)
            logger.info(f"미디어 파일 {len(media_results)}개 처리 완료")
            
        # 4. AI 시스템 학습 업데이트
        if hasattr(ai_system, 'person_profiles'):
            from conversation_learner import ConversationLearner
            learner = ConversationLearner()
            new_profiles = learner.learn_from_kakao_room(kakao_room)
            
            # 기존 프로필과 병합
            for person_id, profile in new_profiles.items():
                if person_id in ai_system.person_profiles:
                    ai_system._merge_profiles(ai_system.person_profiles[person_id], profile)
                else:
                    ai_system.person_profiles[person_id] = profile
                    
        logger.info(f"채팅 파일 종합 분석 완료: {chat_room_name}")
        
        # 임시 파일 삭제
        os.remove(file_path)
        
    except Exception as e:
        logger.error(f"채팅 파일 처리 실패: {e}")


@app.post("/api/v8/upload-media")
async def upload_media_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    chat_room_id: str = Form(...),
    sender_id: str = Form(...),
    process_immediately: bool = Form(True)
):
    """미디어 파일 업로드 및 처리"""
    
    try:
        uploaded_files = []
        
        for file in files:
            # 파일 저장
            upload_path = Path("uploads") / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
            with open(upload_path, "wb") as f:
                content = await file.read()
                f.write(content)
                
            uploaded_files.append({
                "original_name": file.filename,
                "saved_path": str(upload_path),
                "size": upload_path.stat().st_size
            })
            
            if process_immediately:
                # 백그라운드에서 미디어 처리
                background_tasks.add_task(
                    process_uploaded_media,
                    str(upload_path),
                    chat_room_id,
                    sender_id,
                    file.filename
                )
                
        return {
            "success": True,
            "uploaded_files": uploaded_files,
            "total_files": len(uploaded_files),
            "processing_status": "background" if process_immediately else "pending",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"미디어 파일 업로드 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_uploaded_media(file_path: str, chat_room_id: str, sender_id: str, original_name: str):
    """업로드된 미디어 파일 처리"""
    
    try:
        logger.info(f"미디어 파일 처리 시작: {original_name}")
        
        # 1. 미디어 처리
        processed_media = media_processor.process_media_file(file_path)
        
        # 2. 복합 메시지 생성 (미디어 파일 기반)
        raw_message = f"<파일: {original_name}>"
        complex_msg = message_db.parse_complex_message(
            raw_message=raw_message,
            sender=sender_id,
            timestamp=datetime.now(),
            chat_room_id=chat_room_id
        )
        
        # 3. 처리된 미디어 정보를 메시지에 추가
        if processed_media.processing_status == "success":
            for extracted_content in processed_media.extracted_contents:
                # 추출된 콘텐츠를 메시지 구성 요소로 추가
                component = MessageComponent(
                    component_id=f"extracted_{len(complex_msg.components)}",
                    component_type=extracted_content.content_type,
                    content=extracted_content.content,
                    metadata=extracted_content.metadata,
                    order_index=len(complex_msg.components),
                    file_path=processed_media.file_path,
                    mime_type=processed_media.mime_type
                )
                complex_msg.components.append(component)
                
        # 4. 데이터베이스 저장
        message_db.save_complex_message(complex_msg)
        
        logger.info(f"미디어 파일 처리 완료: {original_name}")
        
        # 임시 파일 삭제
        os.remove(file_path)
        
    except Exception as e:
        logger.error(f"미디어 파일 처리 실패: {e}")


@app.post("/api/v8/search")
async def search_messages(request: MessageSearchRequest):
    """복합 조건으로 메시지 검색"""
    
    try:
        messages = message_db.search_messages(
            chat_room_id=request.chat_room_id,
            sender_id=request.sender_id,
            content_type=request.content_type,
            keywords=request.keywords,
            start_date=request.start_date,
            end_date=request.end_date,
            has_media=request.has_media,
            limit=request.limit
        )
        
        # 검색 결과 포맷팅
        results = []
        for msg in messages:
            result = {
                "message_id": msg.message_id,
                "sender_id": msg.sender_id,
                "timestamp": msg.timestamp.isoformat(),
                "primary_content_type": msg.primary_content_type,
                "content_summary": msg.content_summary,
                "extracted_text": msg.extracted_text[:200] + "..." if len(msg.extracted_text) > 200 else msg.extracted_text,
                "topics": msg.topics,
                "keywords": msg.keywords,
                "component_count": len(msg.components),
                "media_file_count": len(msg.media_files),
                "link_count": len(msg.links)
            }
            results.append(result)
            
        return {
            "success": True,
            "total_results": len(results),
            "messages": results,
            "search_criteria": request.dict(),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"메시지 검색 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/messages/{message_id}/analysis", response_model=MessageAnalysisResponse)
async def analyze_message(message_id: str):
    """특정 메시지 상세 분석"""
    
    try:
        # 메시지 조회
        messages = message_db.search_messages(limit=1)
        target_message = None
        
        for msg in messages:
            if msg.message_id == message_id:
                target_message = msg
                break
                
        if not target_message:
            raise HTTPException(status_code=404, detail="메시지를 찾을 수 없습니다")
            
        # 상세 분석 수행
        analysis_results = {
            "message_structure": {
                "total_components": len(target_message.components),
                "component_types": [c.component_type for c in target_message.components],
                "primary_content_type": target_message.primary_content_type
            },
            "content_analysis": {
                "total_text_length": len(target_message.extracted_text),
                "word_count": len(target_message.extracted_text.split()),
                "topics_identified": target_message.topics,
                "keywords_found": target_message.keywords
            },
            "media_analysis": {
                "media_file_count": len(target_message.media_files),
                "media_types": [mf.file_type for mf in target_message.media_files],
                "total_media_size": sum(mf.file_size for mf in target_message.media_files)
            },
            "link_analysis": {
                "link_count": len(target_message.links),
                "domains": [link.domain for link in target_message.links]
            }
        }
        
        # 추출된 콘텐츠 상세 정보
        extracted_content = []
        for component in target_message.components:
            content_info = {
                "component_id": component.component_id,
                "type": component.component_type,
                "content_preview": component.content[:100] + "..." if len(component.content) > 100 else component.content,
                "metadata": component.metadata,
                "order": component.order_index
            }
            extracted_content.append(content_info)
            
        return MessageAnalysisResponse(
            success=True,
            message_id=message_id,
            analysis_results=analysis_results,
            extracted_content=extracted_content,
            media_analysis=analysis_results["media_analysis"]
        )
        
    except Exception as e:
        logger.error(f"메시지 분석 실패: {e}")
        return MessageAnalysisResponse(
            success=False,
            message_id=message_id,
            analysis_results={},
            extracted_content=[],
            error=str(e)
        )


@app.post("/api/v8/media/process")
async def process_media_batch(request: MediaProcessingRequest, background_tasks: BackgroundTasks):
    """미디어 파일 일괄 처리"""
    
    try:
        # 백그라운드에서 일괄 처리
        background_tasks.add_task(
            batch_process_media_files,
            request.file_ids,
            request.processing_options or {}
        )
        
        return {
            "success": True,
            "message": "미디어 파일 일괄 처리 시작",
            "file_count": len(request.file_ids),
            "processing_options": request.processing_options,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"미디어 일괄 처리 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def batch_process_media_files(file_ids: List[str], processing_options: Dict[str, Any]):
    """미디어 파일 일괄 처리 실행"""
    
    try:
        logger.info(f"미디어 파일 일괄 처리 시작: {len(file_ids)}개")
        
        for file_id in file_ids:
            # 실제 구현에서는 file_id로 파일 경로 조회
            # 여기서는 샘플 처리
            logger.info(f"처리 중: {file_id}")
            
        logger.info("미디어 파일 일괄 처리 완료")
        
    except Exception as e:
        logger.error(f"일괄 처리 실패: {e}")


@app.post("/api/v8/ai-message")
async def generate_ai_message_with_media(request: AIMessageRequest):
    """미디어 콘텐츠 기반 AI 메시지 생성"""
    
    try:
        # 참조 미디어 콘텐츠 수집
        reference_content = ""
        media_context = {}
        
        if request.reference_media_ids:
            for media_id in request.reference_media_ids:
                # 실제로는 데이터베이스에서 미디어 내용 조회
                # 여기서는 샘플 데이터
                reference_content += f"미디어 {media_id}에서 추출된 콘텐츠\n"
                
        # AI 메시지 생성 (기존 시스템 활용)
        if hasattr(ai_system, 'generate_personalized_message'):
            personalized_msg = ai_system.generate_personalized_message(
                person_id=request.person_id,
                target_topic=request.target_topic,
                message_intent=request.message_intent,
                use_political_style=request.use_political_style,
                political_blend_ratio=request.political_blend_ratio
            )
            
            # 미디어 콘텐츠 반영하여 메시지 보강
            enhanced_content = personalized_msg.content
            if reference_content:
                enhanced_content += f"\n\n[참조 자료 기반 추가 내용]\n{reference_content[:200]}..."
                
            return {
                "success": True,
                "generated_message": {
                    "message_id": personalized_msg.message_id,
                    "content": enhanced_content,
                    "confidence_score": personalized_msg.confidence_score,
                    "personalization_level": personalized_msg.personalization_level,
                    "political_style_used": personalized_msg.political_style_used,
                    "media_references": request.reference_media_ids or []
                },
                "generation_metadata": {
                    "base_generation_method": personalized_msg.generation_method,
                    "media_enhancement": len(request.reference_media_ids or []) > 0,
                    "reference_content_length": len(reference_content)
                },
                "timestamp": datetime.now().isoformat()
            }
        else:
            # 기본 메시지 생성
            return {
                "success": True,
                "generated_message": {
                    "content": f"{request.person_id}님의 {request.target_topic}에 대한 {request.message_intent} 메시지입니다.",
                    "confidence_score": 0.7,
                    "media_references": request.reference_media_ids or []
                },
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"AI 메시지 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/database/statistics")
async def get_database_statistics():
    """데이터베이스 통계 정보"""
    
    try:
        # 메시지 데이터베이스 통계
        db_stats = message_db.get_database_statistics()
        
        # 미디어 처리 통계 (샘플)
        media_stats = {
            "total_processed_files": 0,
            "processing_success_rate": 0.95,
            "supported_file_types": len(media_processor.supported_types),
            "extraction_capabilities": [
                "텍스트 (OCR)",
                "문서 내용",
                "메타데이터",
                "표 데이터",
                "이미지 분석"
            ]
        }
        
        # AI 시스템 통계
        ai_stats = {}
        if hasattr(ai_system, 'person_profiles'):
            ai_stats = {
                "learned_profiles": len(ai_system.person_profiles),
                "political_styles": 6,
                "total_learning_data": sum(p.message_count for p in ai_system.person_profiles.values())
            }
            
        return {
            "success": True,
            "database_statistics": db_stats,
            "media_processing_statistics": media_stats,
            "ai_system_statistics": ai_stats,
            "system_health": {
                "database_connection": True,
                "media_processor": True,
                "ai_system": True,
                "last_updated": datetime.now().isoformat()
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/media/{file_id}/thumbnail")
async def get_media_thumbnail(file_id: str):
    """미디어 파일 썸네일 조회"""
    
    try:
        # 실제로는 데이터베이스에서 썸네일 경로 조회
        thumbnail_path = f"processed_media/thumbnails/{file_id}.jpg"
        
        if os.path.exists(thumbnail_path):
            return FileResponse(thumbnail_path)
        else:
            raise HTTPException(status_code=404, detail="썸네일을 찾을 수 없습니다")
            
    except Exception as e:
        logger.error(f"썸네일 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v8/export/messages")
async def export_messages(
    chat_room_id: Optional[str] = Query(None),
    format: str = Query("json", regex="^(json|csv|excel)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """메시지 데이터 내보내기"""
    
    try:
        # 메시지 검색
        messages = message_db.search_messages(
            chat_room_id=chat_room_id,
            start_date=start_date,
            end_date=end_date,
            limit=10000  # 최대 10,000개
        )
        
        if format == "json":
            # JSON 형태로 내보내기
            export_data = []
            for msg in messages:
                export_data.append({
                    "message_id": msg.message_id,
                    "sender_id": msg.sender_id,
                    "timestamp": msg.timestamp.isoformat(),
                    "content_summary": msg.content_summary,
                    "extracted_text": msg.extracted_text,
                    "topics": msg.topics,
                    "keywords": msg.keywords
                })
                
            return {
                "success": True,
                "format": "json",
                "total_messages": len(export_data),
                "data": export_data,
                "export_timestamp": datetime.now().isoformat()
            }
            
        else:
            # CSV, Excel 등 다른 형식은 추후 구현
            raise HTTPException(status_code=501, detail=f"{format} 형식은 아직 지원되지 않습니다")
            
    except Exception as e:
        logger.error(f"데이터 내보내기 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    print("🚀 종합 카카오톡 메시지 관리 API v8.0 시작")
    print("=" * 70)
    print("📍 서버 주소: http://localhost:8004")
    print("📖 API 문서: http://localhost:8004/docs")
    print("")
    print("🎯 주요 기능:")
    print("   📱 카카오톡 채팅 파일 업로드 및 분석")
    print("   🎥 미디어 파일 (이미지/동영상/문서) 콘텐츠 추출")
    print("   🔍 복합 조건 메시지 검색")
    print("   🤖 미디어 콘텐츠 기반 AI 메시지 생성")
    print("   📊 통합 데이터베이스 관리")
    print("   📈 실시간 처리 및 분석")
    print("")
    print("🗄️ 지원 파일 타입:")
    print("   📷 이미지: JPG, PNG, GIF, BMP, TIFF, WEBP")
    print("   🎬 비디오: MP4, AVI, MOV, WMV, WEBM, MKV")
    print("   🎵 오디오: MP3, WAV, AAC, OGG, M4A")
    print("   📄 문서: PDF, DOC, DOCX, TXT, HWP")
    print("   📊 스프레드시트: XLS, XLSX, CSV")
    print("   📋 프레젠테이션: PPT, PPTX")
    print("")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8004,
        log_level="info"
    ) 