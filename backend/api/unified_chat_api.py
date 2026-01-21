# flake8: noqa
"""
통합 채팅 API
프론트엔드에서 사용하는 통합 채팅 응답 생성 API
표준화된 응답 형식 제공
"""

import logging
import time
import re
import sqlite3
import random
import json
from collections import Counter
from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict
import sys
import os

# utils 경로 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# LLM 서비스 import
try:
    from llm_service import LLMService

    llm_service_instance = LLMService()
    LLM_SERVICE_AVAILABLE = True
    logger_init = logging.getLogger(__name__)
    logger_init.info("✅ LLM 서비스 초기화 성공")
except ImportError as e:
    LLM_SERVICE_AVAILABLE = False
    llm_service_instance = None
    logger_init = logging.getLogger(__name__)
    logger_init.warning(f"⚠️ LLM 서비스 사용 불가: {e}")

# 고급 응답 엔진 import
try:
    from api.intelligent_response_engine import get_intelligent_engine

    intelligent_engine = get_intelligent_engine()
    INTELLIGENT_ENGINE_AVAILABLE = True
    logger_init.info("✅ 고급 응답 엔진 초기화 성공")
except ImportError as e:
    INTELLIGENT_ENGINE_AVAILABLE = False
    intelligent_engine = None
    logger_init.warning(f"⚠️ 고급 응답 엔진 사용 불가: {e}")

try:
    from utils.api_response import success_response, error_response
except ImportError:
    # utils가 없는 경우를 위한 fallback
    def success_response(data=None, **kwargs):
        response = {
            "status": "success",
            "success": True,
            "timestamp": datetime.now().isoformat(),
        }
        if data is not None:
            response["data"] = data
            # data에 response가 있으면 최상위에도 추가 (프론트엔드 호환성)
            if isinstance(data, dict) and "response" in data:
                response["response"] = data["response"]
        response.update(kwargs)
        return response

    def error_response(error, status_code=500, **kwargs):
        return {
            "status": "error",
            "success": False,
            "error": error,
            "status_code": status_code,
            "timestamp": datetime.now().isoformat(),
            **kwargs,
        }


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat", "unified"])


def _json_error(*, error: str, status_code: int = 500, **kwargs):
    """
    표준 에러 바디 + 올바른 HTTP status_code 반환.
    - body에는 status_code 필드를 유지(프론트 호환)
    - HTTP status_code도 실제로 반영
    """
    try:
        body = error_response(error=error, status_code=status_code, **kwargs)
    except TypeError:
        # 일부 fallback error_response 시그니처 호환
        body = error_response(error, status_code=status_code, **kwargs)
    return JSONResponse(status_code=status_code, content=body)


@router.get("/health", summary="통합 채팅 API 헬스 체크")
async def health_check():
    """통합 채팅 API 헬스 체크"""
    try:
        from api.health_check import system_health_checker

        health_status = system_health_checker.check_all_modules()
        return {
            "status": "healthy",
            "service": "unified-chat-api",
            "timestamp": datetime.now().isoformat(),
            "details": health_status,
        }
    except Exception as e:
        logger.error(f"헬스 체크 오류: {e}")
        return {
            "status": "unhealthy",
            "service": "unified-chat-api",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
        }


class UnifiedChatRequest(BaseModel):
    """통합 채팅 요청 모델"""

    message: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    # 통합 테스트/프론트 구현에 따라 list(대화 히스토리) 또는 dict(추가 옵션) 모두 올 수 있음
    context: Optional[Any] = None
    quality: Optional[str] = "enhanced"  # standard, enhanced, ultimate
    mode: Optional[str] = None  # writing, chat, analysis
    options: Optional[Dict[str, Any]] = None  # 추가 옵션 (writing_style 등)
    # 다양성을 위한 파라미터 추가
    diversity: Optional[bool] = True  # 다양한 답변 생성 활성화
    temperature: Optional[float] = 0.8  # 창의성 설정 (0.0 ~ 1.0)
    request_id: Optional[str] = None  # 고유 요청 ID (캐시 다양성 확보)
    avoid_repetition: Optional[bool] = True  # 반복 방지 활성화
    variation_mode: Optional[str] = "high"  # 변형 모드 (normal, high)
    # 긴 응답 및 다중 질문 지원
    max_tokens: Optional[int] = 4096  # 최대 토큰 수 (긴 응답 지원)
    response_style: Optional[str] = (
        "balanced"  # concise, balanced, detailed, comprehensive
    )
    handle_multiple_questions: Optional[bool] = True  # 다중 질문 자동 처리
    perspective: Optional[str] = (
        None  # 특정 관점 지정 (practical, theoretical, creative, critical)
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "퇴직금은 어떻게 계산하나요?",
                "user_id": "user123",
                "quality": "enhanced",
                "mode": "chat",
                "response_style": "detailed",
                "max_tokens": 4096,
            }
        }
    )


class ChatStreamRequest(BaseModel):
    """SSE 스트리밍 채팅 요청 모델 (프론트 streamingClient.ts 호환)"""

    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    context: Optional[Any] = None
    quality: Optional[str] = "enhanced"
    mode: Optional[str] = None
    options: Optional[Dict[str, Any]] = None
    # 다양성 파라미터 (UnifiedChatRequest와 동일)
    diversity: Optional[bool] = True
    temperature: Optional[float] = 0.8
    request_id: Optional[str] = None
    avoid_repetition: Optional[bool] = True
    variation_mode: Optional[str] = "high"
    # 긴 응답 및 다중 질문 지원
    max_tokens: Optional[int] = 4096  # 최대 토큰 수 (긴 응답 지원)
    response_style: Optional[str] = (
        "balanced"  # concise, balanced, detailed, comprehensive
    )
    handle_multiple_questions: Optional[bool] = True  # 다중 질문 자동 처리
    perspective: Optional[str] = None  # 특정 관점 지정


@router.post("/chat", summary="통합 채팅 응답 생성")
async def unified_chat(request: UnifiedChatRequest):
    """
    통합 채팅 응답 생성 API
    프론트엔드에서 사용하는 표준화된 채팅 API
    """
    start_time = time.time()

    try:
        # 입력 검증
        if not request.message or not request.message.strip():
            return _json_error(error="메시지가 비어있습니다.", status_code=400)

        message = request.message.strip()

        # 입력 길이 제한 (너무 긴 메시지 방지)
        if len(message) > 10000:
            return _json_error(
                error="메시지가 너무 깁니다. 최대 10,000자까지 입력할 수 있습니다.",
                status_code=400,
            )

        # 최소 길이 검증 (너무 짧은 메시지)
        if len(message) < 1:
            return _json_error(error="메시지가 너무 짧습니다.", status_code=400)

        user_id = request.user_id or "anonymous"
        quality = request.quality or "enhanced"

        # quality 값 검증
        if quality not in ["basic", "enhanced", "ultimate"]:
            quality = "enhanced"  # 기본값으로 설정

        logger.info(
            f"채팅 요청 수신: user_id={user_id}, quality={quality}, message_length={len(message)}"
        )

        # 성능 모니터링 시작
        request_start_time = time.time()
        detected_domain = "general"

        # context 정규화: dict/list 모두 허용 (list면 conversationContext로 감쌈)
        normalized_context: Dict[str, Any] = {}
        if isinstance(request.context, dict):
            normalized_context = dict(request.context)
        elif isinstance(request.context, list):
            normalized_context = {"conversationContext": request.context}

        # context에 다양성 파라미터 추가
        enhanced_context = normalized_context

        # options에서 writing_style 추출
        writing_style = None
        if request.options and isinstance(request.options, dict):
            writing_style = request.options.get("writing_style")
            if writing_style:
                logger.info(f"📝 글쓰기 스타일 감지: {writing_style}")

        enhanced_context.update(
            {
                "diversity": request.diversity
                if request.diversity is not None
                else True,
                "temperature": request.temperature
                if request.temperature is not None
                else 0.8,
                "request_id": request.request_id
                or f"req-{int(time.time() * 1000)}-{user_id[:8]}",
                "avoid_repetition": request.avoid_repetition
                if request.avoid_repetition is not None
                else True,
                "variation_mode": request.variation_mode or "high",
                "user_id": user_id,
                "conversation_id": request.conversation_id,
                # 글쓰기 스타일 추가
                "writing_style": writing_style,
                "person_style": writing_style,  # person_style도 동일하게 설정
            }
        )

        logger.info(
            f"다양성 설정: diversity={enhanced_context.get('diversity')}, "
            f"temperature={enhanced_context.get('temperature')}, "
            f"variation_mode={enhanced_context.get('variation_mode')}"
        )

        # 통합된 응답 생성 로직 사용 (전문 분야 도메인 및 노트북 LLM 통합)
        response_text = await generate_chat_response(message, quality, enhanced_context)

        # 도메인 감지 (응답 생성 후) - enhanced_context 사용하여 writing_style 포함
        try:
            from api.intelligent_answer_generator import intelligent_answer_generator

            analysis = intelligent_answer_generator.analyze_request(
                message,
                enhanced_context,  # request.context 대신 enhanced_context 사용 (writing_style 포함)
            )
            detected_domain = analysis.get("domain", "general")
        except Exception:
            pass

        # 성능 기록
        request_time = time.time() - request_start_time
        try:
            from api.performance_monitor import performance_monitor

            performance_monitor.record_response(
                detected_domain, quality, request_time * 1000, True
            )
        except ImportError:
            pass

        # 응답 검증 및 품질 향상
        logger.info(
            f"📊 응답 검증 시작: response_length={len(response_text) if response_text else 0}, response_preview={response_text[:100] if response_text else 'None'}"
        )

        # "응답:" 접두사 제거
        if response_text and response_text.strip().startswith("응답:"):
            logger.info("⚠️ '응답:' 접두사 감지, 제거 중")
            response_text = response_text.strip()[3:].strip()

        # 응답이 너무 짧거나 기본 메시지만 있는 경우 재생성 시도
        if response_text and (
            len(response_text.strip()) < 20
            or response_text.strip() == message
            or response_text.strip().startswith("응답:")
        ):
            logger.warning(
                f"⚠️ 응답이 너무 짧거나 기본 메시지: response_length={len(response_text) if response_text else 0}, 재생성 시도"
            )
            # generate_default_response로 재생성 (긴 질문과 여러 요구사항 처리 포함)
            response_text = generate_default_response(message)
            logger.info(
                f"📥 재생성된 응답: response_length={len(response_text) if response_text else 0}"
            )

        try:
            from api.response_enhancer import response_enhancer

            response_text = response_enhancer.validate_and_fix_response(
                response_text,
                analysis.get("domain", "general") if "analysis" in locals() else None,
            )
            response_text = response_enhancer.enhance_response(
                response_text,
                analysis.get("domain", "general") if "analysis" in locals() else None,
                quality,
                user_message=message,
            )
            logger.info(
                f"✅ 응답 향상 완료: response_length={len(response_text) if response_text else 0}"
            )
        except Exception as e:
            logger.warning(f"응답 향상 실패, 기본 검증만 수행: {e}")
            if (
                not response_text
                or not isinstance(response_text, str)
                or len(response_text.strip()) < 5
            ):
                logger.warning("생성된 응답이 유효하지 않음, 기본 응답 생성")
                response_text = generate_default_response(message)

        processing_time = int((time.time() - start_time) * 1000)

        # 도메인 정보 추가
        domain_info = {}
        try:
            from api.intelligent_answer_generator import intelligent_answer_generator

            analysis = intelligent_answer_generator.analyze_request(
                message, enhanced_context
            )
            domain_info = {
                "domain": analysis.get("domain", "general"),
                "message_type": analysis.get("message_type", "statement"),
                "question_types": analysis.get("question_type", []),
            }
        except Exception:
            pass

        # 응답 검증 (빈 응답 방지) - 강화된 버전
        logger.info(
            f"📊 최종 응답 검증: response_length={len(response_text) if response_text else 0}, response_preview={response_text[:100] if response_text else 'None'}"
        )

        # "응답:" 접두사 제거
        if response_text and response_text.strip().startswith("응답:"):
            logger.info("⚠️ 최종 검증에서 '응답:' 접두사 감지, 제거 중")
            response_text = response_text.strip()[3:].strip()

        # 응답이 너무 짧거나 기본 메시지만 있는 경우 재생성
        if (
            not response_text
            or not isinstance(response_text, str)
            or len(response_text.strip()) < 5
            or response_text.strip() == message
            or response_text.strip().startswith("응답:")
        ):
            logger.warning(
                f"⚠️ 생성된 응답이 너무 짧거나 비어있음: response_length={len(response_text) if response_text else 0}, response_preview={response_text[:100] if response_text else 'None'}"
            )
            # 긴 질문이나 여러 요구사항인 경우 더 상세한 기본 응답 생성
            if (
                len(message) > 200
                or "1)" in message
                or "2)" in message
                or "첫째" in message
                or "둘째" in message
            ):
                logger.info(
                    "📝 긴 질문 또는 여러 요구사항 감지, 상세한 기본 응답 생성 시도"
                )
                # intelligent_answer_generator를 직접 사용하여 더 나은 응답 생성 시도
                try:
                    from api.intelligent_answer_generator import (
                        intelligent_answer_generator,
                    )

                    analysis = intelligent_answer_generator.analyze_request(
                        message, enhanced_context
                    )
                    enhanced_response = (
                        await intelligent_answer_generator.generate_answer(
                            message, analysis, quality, enhanced_context
                        )
                    )
                    if enhanced_response and len(enhanced_response.strip()) >= 10:
                        # "응답:" 접두사 제거
                        if enhanced_response.strip().startswith("응답:"):
                            enhanced_response = enhanced_response.strip()[3:].strip()
                        response_text = enhanced_response
                        logger.info(
                            f"✅ 상세한 기본 응답 생성 성공 (길이: {len(response_text)})"
                        )
                    else:
                        logger.warning(
                            f"⚠️ enhanced_response가 너무 짧음: {len(enhanced_response) if enhanced_response else 0}자, generate_default_response 사용"
                        )
                        response_text = generate_default_response(
                            message, enhanced_context
                        )
                except Exception as e:
                    logger.warning(f"⚠️ 상세한 기본 응답 생성 실패: {e}, 기본 응답 사용")
                    response_text = generate_default_response(message)
            else:
                logger.info("📝 일반 질문, generate_default_response 사용")
                response_text = generate_default_response(message)

            # 재생성된 응답에서도 "응답:" 접두사 제거
            if response_text and response_text.strip().startswith("응답:"):
                logger.info("⚠️ 재생성된 응답에서 '응답:' 접두사 감지, 제거 중")
                response_text = response_text.strip()[3:].strip()

        # 표준화된 응답 형식 반환 (프론트엔드 호환성 최우선)
        response_data = {
            "status": "success",
            "success": True,
            "response": response_text,  # 최상위 레벨 (프론트엔드가 가장 먼저 확인)
            "message": response_text,  # 최상위 레벨 (프론트엔드 호환성)
            "content": response_text,  # 최상위 레벨 (프론트엔드 호환성)
            "data": {
                "response": response_text,
                "message": response_text,
                "content": response_text,
                "model": "unified-chat-api",
                "tokens": len(response_text.split()),
                "processing_time": processing_time,
                "confidence": 0.85,
                "quality_score": 0.85,
                "user_id": user_id,
                "conversation_id": request.conversation_id,
                "timestamp": datetime.now().isoformat(),
                **domain_info,  # 도메인 정보 추가
            },
            "timestamp": datetime.now().isoformat(),
        }

        return response_data

    except Exception as e:
        # 통합 에러 핸들러 사용
        try:
            from api.error_handler import unified_error_handler

            error_result = unified_error_handler.handle_error(
                e,
                {
                    "endpoint": "/api/chat",
                    "user_id": user_id,
                    "message_length": len(message) if "message" in locals() else 0,
                },
            )
            return _json_error(
                error=unified_error_handler.create_user_friendly_error(e),
                status_code=error_result.get("status_code", 500),
            )
        except ImportError:
            # 에러 핸들러를 사용할 수 없는 경우 기본 처리
            logger.error(f"통합 채팅 API 오류: {e}", exc_info=True)
            return _json_error(
                error=f"채팅 처리 중 오류가 발생했습니다: {str(e)}", status_code=500
            )


@router.post("/unified/chat", summary="통합 채팅 응답 생성 (호환 엔드포인트)")
async def unified_chat_compat(request: UnifiedChatRequest):
    """
    하위 호환을 위한 별칭 엔드포인트.
    - 기존 테스트/레거시 클라이언트가 `/api/unified/chat`을 호출하는 경우를 지원
    """
    return await unified_chat(request)


@router.post("/chat/stream", summary="통합 채팅 응답 스트리밍(SSE)")
async def unified_chat_stream(request: ChatStreamRequest):
    """
    Server-Sent Events 기반 스트리밍 채팅 응답.
    프론트의 `src/utils/streamingClient.ts`가 기대하는 형식:
    - 각 이벤트: `data: {"content": "...", "done": false}\n\n`
    - 종료 이벤트: `data: {"done": true, "fullContent": "..."}\n\n`
    """
    # 입력 검증 (스트리밍 전)
    if not request.message or not request.message.strip():
        return _json_error(error="메시지가 비어있습니다.", status_code=400)

    message = request.message.strip()
    if len(message) > 10000:
        return _json_error(
            error="메시지가 너무 깁니다. 최대 10,000자까지 입력할 수 있습니다.",
            status_code=400,
        )

    # user/session/conversation 식별자 정규화
    session_id = request.session_id or request.conversation_id or request.user_id
    user_id = request.user_id or session_id or "anonymous"
    conversation_id = request.conversation_id or session_id
    quality = request.quality or "enhanced"
    if quality not in ["basic", "enhanced", "ultimate"]:
        quality = "enhanced"

    # context 정규화 + 다양성 옵션 반영
    normalized_context: Dict[str, Any] = {}
    if isinstance(request.context, dict):
        normalized_context = dict(request.context)
    elif isinstance(request.context, list):
        normalized_context = {"conversationContext": request.context}

    writing_style = None
    if request.options and isinstance(request.options, dict):
        writing_style = request.options.get("writing_style")

    # 응답 스타일 및 관점 설정
    response_style = request.response_style or "balanced"
    perspective = request.perspective
    max_tokens = request.max_tokens or 4096
    handle_multiple = (
        request.handle_multiple_questions
        if request.handle_multiple_questions is not None
        else True
    )

    # 응답 스타일 프롬프트 생성
    style_prompt = _get_response_style_prompt(response_style, perspective)

    normalized_context.update(
        {
            "diversity": request.diversity if request.diversity is not None else True,
            "temperature": request.temperature
            if request.temperature is not None
            else 0.8,
            "request_id": request.request_id
            or f"req-{int(time.time() * 1000)}-{str(user_id)[:8]}",
            "avoid_repetition": request.avoid_repetition
            if request.avoid_repetition is not None
            else True,
            "variation_mode": request.variation_mode or "high",
            "user_id": user_id,
            "conversation_id": conversation_id,
            "writing_style": writing_style,
            "person_style": writing_style,
            # 새로운 파라미터들
            "response_style": response_style,
            "style_prompt": style_prompt,
            "perspective": perspective,
            "max_tokens": max_tokens,
            "handle_multiple_questions": handle_multiple,
        }
    )

    async def generate_stream():
        try:
            # 다중 질문 처리
            questions = [message]
            if handle_multiple:
                questions = _split_multiple_questions(message)

            full_responses = []

            for idx, question in enumerate(questions):
                # 여러 질문인 경우 구분자 추가
                if len(questions) > 1 and idx > 0:
                    separator = f"\n\n---\n\n**[질문 {idx + 1}에 대한 답변]**\n\n"
                    full_responses.append(separator)
                    yield f"data: {json.dumps({'content': separator, 'done': False})}\n\n"
                elif len(questions) > 1 and idx == 0:
                    header = f"**[질문 1에 대한 답변]**\n\n"
                    full_responses.append(header)
                    yield f"data: {json.dumps({'content': header, 'done': False})}\n\n"

                # 각 질문에 대한 응답 생성 (고급 엔진 우선)
                try:
                    # 1. 질문 의도 분석
                    intent = _analyze_query_intent(question)

                    # 2. 기존 generate_chat_response 시도 (MD 문서/전문 엔진)
                    response = await generate_chat_response(
                        question, quality, normalized_context
                    )

                    # 3. 응답이 부실하면 고급 구조화 엔진 사용
                    if (
                        not response
                        or len(response.strip()) < 100
                        or "에 대한 답변입니다" in response
                    ):
                        response = _generate_structured_response(
                            question,
                            intent,
                            normalized_context,
                            style=response_style,
                            perspective=perspective,
                        )
                except Exception as gen_err:
                    logger.warning(f"기본 응답 생성 실패, 고급 엔진 사용: {gen_err}")
                    intent = _analyze_query_intent(question)
                    response = _generate_structured_response(
                        question,
                        intent,
                        normalized_context,
                        style=response_style,
                        perspective=perspective,
                    )

                if not isinstance(response, str):
                    response = str(response)

                # 다양성 추가 (temperature에 따라)
                temperature = normalized_context.get("temperature", 0.8)
                variation_seed = hash(f"{question}-{time.time()}-{idx}") % 10000
                response = _add_response_diversity(
                    response, temperature, variation_seed
                )

                full_responses.append(response)

                # 청크 단위로 스트리밍 (긴 응답 지원)
                chunk_size = 80
                for i in range(0, len(response), chunk_size):
                    chunk = response[i : i + chunk_size]
                    yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"

            # 전체 응답 조합
            full = "".join(full_responses)

            # 종료 이벤트
            yield (
                "data: "
                + json.dumps(
                    {
                        "content": "",
                        "done": True,
                        "fullContent": full,
                        "metadata": {
                            "progress": 100,
                            "model": "unified-chat-api",
                            "response_style": response_style,
                            "perspective": perspective,
                            "questions_processed": len(questions),
                            "max_tokens": max_tokens,
                        },
                    }
                )
                + "\n\n"
            )
        except Exception as e:
            logger.error(f"채팅 스트리밍 오류: {e}", exc_info=True)
            yield (
                "data: "
                + json.dumps({"error": f"스트리밍 중 오류: {str(e)}", "done": True})
                + "\n\n"
            )

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post(
    "/unified/chat/stream", summary="통합 채팅 응답 스트리밍(SSE) (호환 엔드포인트)"
)
async def unified_chat_stream_compat(request: ChatStreamRequest):
    """하위 호환: `/api/unified/chat/stream` 별칭"""
    return await unified_chat_stream(request)


async def generate_chat_response(
    message: str, quality: str, context: Optional[Dict[str, Any]] = None
) -> str:
    """채팅 응답 생성 - MD 문서 기반 QA 우선, 웹 연구 통합, 그 다음 혁신적인 답변 생성 엔진 사용"""
    try:

        def _as_bool(v: Any) -> bool:
            try:
                if isinstance(v, bool):
                    return v
                if isinstance(v, (int, float)):
                    return v != 0
                if isinstance(v, str):
                    return v.strip().lower() in [
                        "1",
                        "true",
                        "yes",
                        "y",
                        "on",
                        "enable",
                        "enabled",
                    ]
            except Exception:
                pass
            return False

        def _wants_comment_generation(user_message: str) -> bool:
            try:
                t = (user_message or "").strip()
                if not t:
                    return False
                # 컨텍스트로 강제(프론트에서 버튼/토글로 제어 가능)
                if context and isinstance(context, dict):
                    try:
                        if _as_bool(
                            context.get("force_comment_generation")
                        ) or _as_bool(context.get("comment_generation")):
                            return True
                    except Exception:
                        pass
                # "댓글 만들어줘/생성해줘/써줘" 류
                if not re.search(r"(댓글|커뮤니티\s*댓글|반응)", t):
                    return False
                return bool(
                    re.search(
                        r"(만들|생성|써\s*줘|작성|달아\s*줘|찍어\s*줘|양산|템플릿)",
                        t,
                    )
                )
            except Exception:
                return False

        def _extract_comment_count(user_message: str) -> int:
            try:
                t = user_message or ""
                m = re.search(r"(\d{1,2})\s*(개|개만|개정도|개\s*정도)", t)
                if m:
                    n = int(m.group(1))
                    return max(1, min(30, n))
            except Exception:
                pass
            return 10

        def _mask_pii(text: str) -> str:
            """
            샘플 댓글에 들어있을 수 있는 개인정보를 간단히 마스킹합니다.
            (완벽한 탐지는 아니며, 유출 방지 목적의 1차 방어)
            """
            try:
                t = str(text or "")
                # 이메일
                t = re.sub(
                    r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[EMAIL]", t
                )
                # 전화번호(한국형)
                t = re.sub(
                    r"\b(01[016789]|0\d{1,2})[-\s]?\d{3,4}[-\s]?\d{4}\b", "[PHONE]", t
                )
                # URL
                t = re.sub(r"https?://\S+", "[URL]", t)
                # 주민/사업자번호처럼 보이는 긴 숫자열(단순)
                t = re.sub(r"\b\d{6}[-]?\d{7}\b", "[ID]", t)
                t = re.sub(r"\b\d{3}[-]?\d{2}[-]?\d{5}\b", "[ID]", t)
                return t
            except Exception:
                return text

        def _load_comment_corpus_from_context(
            ctx: Optional[Dict[str, Any]],
        ) -> List[str]:
            """
            프론트/사용자가 전달한 댓글 샘플을 우선 사용합니다.
            지원:
            - context.comment_samples: string[]
            - context.comment_text: string (줄바꿈으로 분리)
            """
            try:
                if not ctx or not isinstance(ctx, dict):
                    return []
                samples = ctx.get("comment_samples")
                if isinstance(samples, list):
                    out = []
                    for s in samples[:1000]:
                        if not isinstance(s, str):
                            continue
                        v = _mask_pii(s).strip()
                        if len(v) >= 2:
                            out.append(v[:500])
                    return out
                blob = ctx.get("comment_text")
                if isinstance(blob, str) and blob.strip():
                    lines = [l.strip() for l in blob.splitlines() if l.strip()]
                    out = []
                    for l in lines[:1000]:
                        v = _mask_pii(l).strip()
                        if len(v) >= 2:
                            out.append(v[:500])
                    return out
            except Exception:
                pass
            return []

        def _load_recent_comment_corpus(limit: int = 300) -> List[str]:
            """
            로컬 DB(apartment_community.db)의 community_comments에서 최근 댓글을 가져옵니다.
            - 외부 사이트(뉴스/커뮤니티) 실시간 크롤링은 환경/정책/로그인 이슈가 커서 여기서는 하지 않습니다.
            """
            try:
                db_path = os.path.join(
                    os.path.dirname(os.path.dirname(__file__)), "apartment_community.db"
                )
                conn = sqlite3.connect(db_path)
                cur = conn.cursor()
                cur.execute(
                    """
                    SELECT content
                    FROM community_comments
                    WHERE content IS NOT NULL
                    ORDER BY created_at DESC
                    LIMIT ?
                    """,
                    (int(limit),),
                )
                rows = cur.fetchall()
                conn.close()
                out = []
                for r in rows:
                    c = _mask_pii(str(r[0] or "")).strip()
                    if len(c) >= 2:
                        out.append(c)
                return out
            except Exception:
                return []

        def _learn_comment_tone(comments: List[str]) -> Dict[str, Any]:
            """
            댓글 샘플에서 톤/스타일 특징을 가볍게 추출합니다.
            - 엄밀한 학습(모델 파인튜닝) 대신, 프롬프트에 넣을 "스타일 가이드" 생성용입니다.
            """
            cleaned = [(c or "").strip() for c in (comments or []) if (c or "").strip()]
            if not cleaned:
                return {"count": 0}

            lens = [len(c) for c in cleaned]
            avg_len = sum(lens) / max(1, len(lens))
            short_rate = sum(1 for x in lens if x <= 25) / max(1, len(lens))
            long_rate = sum(1 for x in lens if x >= 80) / max(1, len(lens))

            # 존댓말/반말 힌트
            polite_hits = sum(
                1
                for c in cleaned
                if re.search(r"(습니다|합니다|네요|어요|아요|세요|죠\\b|요\\b)", c)
            )
            casual_hits = sum(
                1
                for c in cleaned
                if re.search(r"(ㅋㅋ|ㅎㅎ|ㄷㄷ|ㅇㅈ|ㄹㅇ|~|\\b임\\b|\\b함\\b|야\\b)", c)
            )
            polite_rate = polite_hits / max(1, len(cleaned))
            casual_rate = casual_hits / max(1, len(cleaned))
            if polite_rate >= 0.45 and polite_rate >= casual_rate:
                register = "polite"
            elif casual_rate >= 0.35:
                register = "casual"
            else:
                register = "mixed"

            exclam_rate = sum(1 for c in cleaned if "!" in c) / max(1, len(cleaned))
            question_rate = sum(1 for c in cleaned if "?" in c) / max(1, len(cleaned))
            laugh_rate = sum(1 for c in cleaned if re.search(r"(ㅋㅋ|ㅎㅎ)", c)) / max(
                1, len(cleaned)
            )
            cry_rate = sum(1 for c in cleaned if re.search(r"(ㅠㅠ|ㅜㅜ)", c)) / max(
                1, len(cleaned)
            )

            # 빈도 키워드(가벼운 토큰)
            tokens = []
            for c in cleaned[:400]:
                toks = re.findall(r"[가-힣]{2,}", c)
                tokens.extend(toks[:40])
            common = [w for w, _ in Counter(tokens).most_common(12)]

            return {
                "count": len(cleaned),
                "avg_len": round(avg_len, 1),
                "short_rate": round(short_rate, 2),
                "long_rate": round(long_rate, 2),
                "register": register,
                "polite_rate": round(polite_rate, 2),
                "casual_rate": round(casual_rate, 2),
                "exclam_rate": round(exclam_rate, 2),
                "question_rate": round(question_rate, 2),
                "laugh_rate": round(laugh_rate, 2),
                "cry_rate": round(cry_rate, 2),
                "common_terms": common,
            }

        def _extract_topic_terms(user_message: str) -> List[str]:
            try:
                t = (user_message or "").strip()
                if not t:
                    return []
                # 트리거 표현 제거
                t = re.sub(r"(댓글|커뮤니티\s*댓글|반응)", " ", t)
                t = re.sub(
                    r"(만들|생성|써\s*줘|작성|달아\s*줘|찍어\s*줘|양산|템플릿)", " ", t
                )
                t = re.sub(r"\d{1,2}\s*(개|개만|개정도|개\s*정도)", " ", t)
                toks = re.findall(r"[가-힣]{2,}", t)
                stop = set(
                    [
                        "정리",
                        "요약",
                        "분석",
                        "댓글",
                        "반응",
                        "커뮤니티",
                        "이슈",
                        "기사",
                        "내용",
                        "이번",
                        "그거",
                        "이거",
                        "저거",
                        "그냥",
                        "진짜",
                        "완전",
                        "너무",
                        "좀",
                        "그리고",
                        "근데",
                        "그런데",
                    ]
                )
                toks = [x for x in toks if x not in stop]
                return [w for w, _ in Counter(toks).most_common(5)]
            except Exception:
                return []

        def _normalize_comment_stance(v: Any) -> str:
            try:
                if not v:
                    return "mixed"
                s = str(v).strip().lower()
                if s in ["mixed", "mix", "both", "all", "m"]:
                    return "mixed"
                if s in ["positive", "pos", "p", "찬성", "긍정"]:
                    return "positive"
                if s in ["negative", "neg", "n", "반대", "부정"]:
                    return "negative"
                if s in ["neutral", "neu", "u", "중립"]:
                    return "neutral"
            except Exception:
                pass
            return "mixed"

        def _normalize_intensity(v: Any) -> int:
            try:
                n = int(v)
                return max(1, min(5, n))
            except Exception:
                return 3

        def _normalize_question_ratio(v: Any) -> int:
            try:
                n = int(v)
                return max(0, min(100, n))
            except Exception:
                return 25

        def _normalize_zero_to_five(v: Any, default: int = 2) -> int:
            try:
                n = int(v)
                return max(0, min(5, n))
            except Exception:
                return default

        def _normalize_comment_style(v: Any) -> str:
            try:
                if not v:
                    return "normal"
                s = str(v).strip().lower()
                if s in ["normal", "default", "basic", "n"]:
                    return "normal"
                if s in [
                    "factcheck",
                    "fact-check",
                    "verify",
                    "evidence",
                    "검증",
                    "팩트체크",
                ]:
                    return "factcheck"
                if s in ["sarcastic", "sarcasm", "irony", "냉소", "풍자"]:
                    return "sarcastic"
                if s in ["supportive", "support", "encourage", "응원", "지지"]:
                    return "supportive"
            except Exception:
                pass
            return "normal"

        def _classify_comment_sentiment(text: str) -> str:
            """
            매우 가벼운 휴리스틱 감정 분류(긍정/부정/중립).
            - 스탠스 필터링용이며, 정확한 감정 분석이 목적이 아닙니다.
            """
            t = (text or "").lower()
            pos_words = [
                "좋",
                "최고",
                "대박",
                "굿",
                "만족",
                "추천",
                "응원",
                "잘했다",
                "잘함",
                "괜찮",
                "멋지",
                "감사",
                "훌륭",
            ]
            neg_words = [
                "별로",
                "최악",
                "싫",
                "문제",
                "말도 안",
                "어이",
                "답답",
                "혐오",
                "실망",
                "짜증",
                "불만",
                "심하",
                "거짓",
                "사기",
                "망",
            ]
            score = 0
            for w in pos_words:
                if w in t:
                    score += 1
            for w in neg_words:
                if w in t:
                    score -= 1
            # 질문/중립 신호
            if "?" in t or "정보" in t or "팩트" in t or "확인" in t:
                if abs(score) <= 1:
                    return "neutral"
            if score >= 2:
                return "positive"
            if score <= -2:
                return "negative"
            return "neutral"

        def _topic_terms_from_context(ctx: Optional[Dict[str, Any]]) -> List[str]:
            try:
                if not ctx or not isinstance(ctx, dict):
                    return []
                topic = ctx.get("comment_generation_topic")
                if not isinstance(topic, str):
                    return []
                toks = re.findall(r"[가-힣]{2,}", topic)
                toks = [t for t in toks if t]
                return [w for w, _ in Counter(toks).most_common(3)]
            except Exception:
                return []

        def _generate_comments_locally(
            user_message: str,
            corpus: List[str],
            tone: Dict[str, Any],
            count: int,
            stance: str = "mixed",
            intensity: int = 3,
            style: str = "normal",
            question_ratio: int = 25,
            sarcasm_level: int = 2,
            factcheck_strictness: int = 2,
            empathy_level: int = 2,
            ctx: Optional[Dict[str, Any]] = None,
        ) -> List[str]:
            """
            DB/샘플 기반 로컬 댓글 생성기(LLM 의존성 제거용).
            - 샘플 문장을 가져와 주제 키워드를 살짝 섞고, 말끝/감정표현을 톤에 맞춰 조정합니다.
            """
            cleaned = [(c or "").strip() for c in (corpus or []) if (c or "").strip()]
            if not cleaned:
                return []

            register = str(tone.get("register") or "mixed")
            laugh_rate = float(tone.get("laugh_rate") or 0)
            cry_rate = float(tone.get("cry_rate") or 0)
            exclam_rate = float(tone.get("exclam_rate") or 0)
            question_rate = float(tone.get("question_rate") or 0)

            # intensity(1~5)에 따라 감정 표현 확률을 조정
            intensity = max(1, min(5, int(intensity or 3)))
            scale = 0.55 + (intensity - 1) * 0.18  # 1:0.55, 3:0.91, 5:1.27
            laugh_rate = min(1.0, laugh_rate * scale)
            cry_rate = min(1.0, cry_rate * scale)
            exclam_rate = min(1.0, exclam_rate * scale)
            # 질문형 비율(0~100)을 기본 목표로 사용 (중립/팩트체크는 기본값 상향)
            style = _normalize_comment_style(style)
            question_ratio = _normalize_question_ratio(question_ratio)
            sarcasm_level = _normalize_zero_to_five(sarcasm_level, default=2)
            factcheck_strictness = _normalize_zero_to_five(
                factcheck_strictness, default=2
            )
            empathy_level = _normalize_zero_to_five(empathy_level, default=2)
            if stance == "neutral":
                question_ratio = max(question_ratio, 40)
            if style == "factcheck":
                question_ratio = max(question_ratio, 55)
            question_rate = min(
                1.0, max(question_rate, question_ratio / 100.0) * (0.85 + scale * 0.25)
            )

            topics = _extract_topic_terms(user_message)
            topics.extend(_topic_terms_from_context(ctx))
            # 중복 제거
            topics = list(dict.fromkeys([t for t in topics if t]))[:6]

            # 생성 풀: 너무 길/짧은 것 제외
            pool = [c for c in cleaned if 6 <= len(c) <= 140]
            if len(pool) < 10:
                pool = cleaned[:]

            # 스탠스에 따라 샘플 풀을 가볍게 필터링
            try:
                stance = _normalize_comment_stance(stance)
                if stance in ["positive", "negative", "neutral"]:
                    filtered = []
                    for c in pool:
                        s = _classify_comment_sentiment(c)
                        if s == stance:
                            filtered.append(c)
                    # 너무 적으면 혼합
                    if len(filtered) >= max(8, min(40, int(len(pool) * 0.15))):
                        pool = filtered
            except Exception:
                pass

            # 스타일에 따른 풀/표현 조정
            try:
                if style == "supportive":
                    # 응원 톤은 긍정 필터를 선호(가능하면)
                    pos_pool = [
                        c for c in pool if _classify_comment_sentiment(c) == "positive"
                    ]
                    if len(pos_pool) >= max(6, int(len(pool) * 0.1)):
                        pool = pos_pool
                elif style == "sarcastic":
                    # 냉소 톤은 부정/중립을 선호
                    neg_pool = [
                        c
                        for c in pool
                        if _classify_comment_sentiment(c) in ["negative", "neutral"]
                    ]
                    if len(neg_pool) >= max(6, int(len(pool) * 0.1)):
                        pool = neg_pool
            except Exception:
                pass

            out: List[str] = []
            seen = set()
            tries = 0
            max_tries = max(80, count * 15)
            while len(out) < count and tries < max_tries:
                tries += 1
                base = random.choice(pool).strip()
                base = re.sub(r"^[-•\d)\]]+\s*", "", base).strip()
                base = _mask_pii(base)
                if not base:
                    continue

                # 주제 단어 삽입
                if topics and random.random() < 0.7:
                    kw = random.choice(topics)
                    if kw and kw not in base and len(base) < 150:
                        if random.random() < 0.5:
                            base = f"{kw} {base}"
                        else:
                            base = f"{base} {kw}"

                # 말끝/문장부호 조정
                s = base
                s = s.replace("\n", " ").strip()
                # 존댓말 톤이면 너무 반말인 문장을 약하게 정중화
                if register == "polite":
                    if not re.search(r"(습니다|합니다|네요|세요|요)$", s):
                        if s.endswith("다"):
                            s = s[:-1] + "요"
                        elif not s.endswith("요"):
                            s = s + "요"
                elif register == "casual":
                    # 과도한 '요' 제거(완전 제거는 위험하니 약하게)
                    if s.endswith("요") and random.random() < 0.4:
                        s = s[:-1]

                # 강도에 따라 강조 부사 추가(과도한 반복 방지)
                if intensity >= 4 and random.random() < 0.28:
                    boost = random.choice(["진짜", "완전", "너무", "개", "ㄹㅇ"])
                    if boost and boost not in s and len(s) < 160:
                        if register == "polite" and boost == "개":
                            boost = "정말"
                        s = f"{boost} {s}"
                elif intensity <= 2 and random.random() < 0.20:
                    # 저강도: 과격 표현 완화(아주 단순)
                    s = re.sub(r"(최악|망했다|사기)", "별로", s)

                # 스타일별 프레이밍(짧게)
                if style == "factcheck" and random.random() < (
                    0.18 + 0.12 * factcheck_strictness
                ):
                    prefix = random.choice(
                        ["팩트체크: ", "근거 있나? ", "출처 좀 ", "확인부터 "]
                    )
                    if prefix.strip() not in s and len(s) < 170:
                        s = f"{prefix}{s}"
                elif style == "sarcastic" and random.random() < (
                    0.14 + 0.10 * sarcasm_level
                ):
                    prefix = random.choice(
                        ["참나 ", "어쩌라고 ", "그러니까요 ", "와 진짜 "]
                    )
                    if prefix.strip() not in s and len(s) < 170:
                        s = f"{prefix}{s}"
                elif style == "supportive" and random.random() < (
                    0.14 + 0.10 * empathy_level
                ):
                    suffix = random.choice(
                        ["응원합니다", "힘내세요", "잘되길", "화이팅"]
                    )
                    if suffix not in s and len(s) < 170:
                        s = f"{s} {suffix}"

                # 감정 표현(확률적)
                if laugh_rate >= 0.25 and "ㅋㅋ" not in s and random.random() < 0.35:
                    s = s + " ㅋㅋ"
                if cry_rate >= 0.18 and "ㅠ" not in s and random.random() < 0.18:
                    s = s + " ㅠㅠ"
                if exclam_rate >= 0.25 and "!" not in s and random.random() < 0.25:
                    s = s + "!"
                # 질문형 비율 목표를 반영해 ? 여부를 결정
                want_q = random.random() < (question_ratio / 100.0)
                if want_q and "?" not in s:
                    if random.random() < max(0.12, min(0.65, question_rate)):
                        s = s.rstrip("!., ") + "?"
                if (not want_q) and "?" in s and random.random() < 0.65:
                    s = s.replace("?", "")

                # 길이 제한
                s = s[:200].strip()
                if len(s) < 4:
                    continue

                key = s.lower()
                if key in seen:
                    continue
                seen.add(key)
                out.append(s)

            # 부족하면 마지막으로 짧은 변형을 추가
            while len(out) < count:
                filler = random.choice(pool).strip()
                filler = _mask_pii(filler).strip()
                filler = filler[:120]
                if filler and filler.lower() not in seen:
                    seen.add(filler.lower())
                    out.append(filler)
                else:
                    break

            # 질문형 비율이 높은 경우(테스트/UX 안정성): 최소 1개는 물음표를 포함하도록 보장
            try:
                if (
                    out
                    and int(question_ratio or 0) >= 50
                    and not any("?" in (x or "") for x in out)
                ):
                    out[0] = (out[0] or "").rstrip("!., ") + "?"
            except Exception:
                pass

            return out[:count]

        def _pick_comment_samples(comments: List[str], k: int = 18) -> List[str]:
            try:
                cleaned = [
                    (c or "").strip() for c in (comments or []) if (c or "").strip()
                ]
                if not cleaned:
                    return []
                # 너무 길거나 너무 짧은 건 일부만
                mid = [c for c in cleaned if 12 <= len(c) <= 120]
                pool = mid if len(mid) >= 8 else cleaned
                if len(pool) <= k:
                    return pool[:k]
                # 다양성 확보 위해 랜덤 샘플(시드 고정 X)
                return random.sample(pool, k)
            except Exception:
                return (comments or [])[:k]

        def _build_comment_generation_prompt(
            user_message: str, tone: Dict[str, Any], samples: List[str], count: int
        ) -> str:
            # 사용자 메시지 자체에 "주제/상황"이 섞여 있으므로 그대로 전달하고,
            # 모델이 샘플 톤을 따라 생성하도록 강제합니다.
            register = tone.get("register", "mixed")
            length_hint = tone.get("avg_len", 40)
            common_terms = tone.get("common_terms", [])
            common_hint = (
                ", ".join(common_terms[:8]) if isinstance(common_terms, list) else ""
            )

            return f"""너는 온라인 커뮤니티 댓글 작성기다.
아래 [샘플 댓글]의 말투/길이/감정표현/구어체를 학습해서, 같은 톤으로 새로운 댓글을 생성하라.

[요청]
{user_message}

[톤 요약]
- 샘플 수: {tone.get("count", 0)}
- 평균 길이(대략): {length_hint}자
- 문체: {register} (존댓말 비율 {tone.get("polite_rate")} / 구어체 비율 {tone.get("casual_rate")})
- 감정 표현: 느낌표 {tone.get("exclam_rate")}, 물음표 {tone.get("question_rate")}, 웃음(ㅋㅋ/ㅎㅎ) {tone.get("laugh_rate")}, 울음(ㅠㅠ/ㅜㅜ) {tone.get("cry_rate")}
{f"- 자주 쓰는 표현(참고): {common_hint}" if common_hint else ""}

[안전/품질 규칙]
- 개인정보/실명/연락처/주소/닉네임 등 식별 정보 생성 금지
- 혐오/차별/폭력 선동/불법 조장 금지
- 특정 개인/단체에 대한 허위사실 단정 금지(의견 형태로)
- 같은 문장 반복 금지, 문장 구조를 약간씩 바꿀 것

[출력 형식]
- 정확히 {count}개를 생성
- 1줄 = 1댓글
- 번호/불릿 없이 텍스트만 출력

[샘플 댓글]
{chr(10).join([f"- {s[:160]}" for s in samples])}
"""

        # (기능) 댓글 전체 톤을 학습해 "댓글 생성" 요청을 처리
        if _wants_comment_generation(message):
            corpus_limit = 300
            try:
                if (
                    context
                    and isinstance(context, dict)
                    and int(context.get("comment_corpus_limit") or 0) > 0
                ):
                    corpus_limit = int(context.get("comment_corpus_limit"))
            except Exception:
                pass
            corpus = _load_comment_corpus_from_context(
                context
            ) or _load_recent_comment_corpus(limit=max(50, min(1000, corpus_limit)))
            if not corpus:
                return (
                    "댓글 톤을 학습할 데이터가 없습니다.\n\n"
                    "가능한 방법:\n"
                    "- 댓글 샘플(최소 20개 정도)을 그대로 붙여넣고 “이 톤으로 댓글 10개 만들어줘”라고 요청\n"
                    "- 또는 백엔드 `apartment_community.db`에 `community_comments` 데이터가 먼저 쌓이도록 수집 파이프라인을 연결"
                )
            tone = _learn_comment_tone(corpus)
            n = _extract_comment_count(message)

            # 기본은 로컬 생성(안정성). 필요 시 context로 LLM 모드 강제 가능.
            use_llm = False
            try:
                if context and isinstance(context, dict):
                    use_llm = _as_bool(context.get("comment_generation_use_llm"))
                    if isinstance(context.get("comment_generate_n"), (int, float, str)):
                        try:
                            n = max(1, min(30, int(context.get("comment_generate_n"))))
                        except Exception:
                            pass
            except Exception:
                pass

            if not use_llm:
                stance = "mixed"
                intensity = 3
                style = "normal"
                question_ratio = 25
                try:
                    if context and isinstance(context, dict):
                        stance = _normalize_comment_stance(
                            context.get("comment_generation_stance")
                        )
                        intensity = _normalize_intensity(
                            context.get("comment_generation_intensity")
                        )
                        style = _normalize_comment_style(
                            context.get("comment_generation_style")
                        )
                        question_ratio = _normalize_question_ratio(
                            context.get("comment_generation_question_ratio")
                        )
                except Exception:
                    pass
                lines = _generate_comments_locally(
                    message,
                    corpus,
                    tone,
                    n,
                    stance=stance,
                    intensity=intensity,
                    style=style,
                    question_ratio=question_ratio,
                    ctx=context,
                )
                if lines:
                    return "\n".join(lines)

            # LLM 모드(선택): 샘플/톤을 포함한 프롬프트를 구성해 기존 파이프라인으로 전달
            samples = _pick_comment_samples(corpus, k=18)
            message = _build_comment_generation_prompt(message, tone, samples, n)
            # 댓글 생성은 웹리서치/조사모드 필요 없음(부작용 방지)
            if context is None:
                context = {}
            if isinstance(context, dict):
                context = dict(context)
                context["enable_web_research"] = False
                context["investigative_mode"] = False

        def _format_investigative_web_evidence(
            research_results: Any, research_context: Any
        ) -> str:
            """
            조사/검증 모드에서 사용할 웹 연구 근거 블록을 생성합니다.
            - 웹 연구 모듈의 결과 리스트(WebSearchResult)를 받아 [n] 형식 출처 목록을 만듭니다.
            """
            try:
                if not research_results:
                    return ""

                def _extract_domain(u: str) -> str:
                    try:
                        if not u:
                            return ""
                        # 단순 도메인 추출(외부 의존성 없이)
                        u = u.strip()
                        u = re.sub(r"^https?://", "", u)
                        return u.split("/")[0].lower()
                    except Exception:
                        return ""

                lines = []
                lines.append("## 조사/검증 요약")
                try:
                    intent = getattr(research_context, "intent", None) or "general"
                    query = getattr(research_context, "query", None) or ""
                    missing = getattr(research_context, "missing_info", None)
                    missing_txt = ""
                    if isinstance(missing, list) and missing:
                        missing_txt = ", ".join([str(x) for x in missing[:6]])
                    lines.append(f"- 조사 쿼리: {query}" if query else "- 조사 수행")
                    lines.append(f"- 의도/유형: {intent}")
                    if missing_txt:
                        lines.append(f"- 확인이 필요한 정보(추정): {missing_txt}")
                except Exception:
                    lines.append("- 조사 수행(요약 생성 실패)")

                lines.append("")
                # 교차확인(간단): 출처 다양성/분포로 신뢰도 힌트 제공
                try:
                    domains = []
                    for r in research_results[:8]:
                        url = getattr(r, "url", "") or ""
                        d = _extract_domain(url)
                        if d:
                            domains.append(d)
                    uniq = sorted(set(domains))
                    lines.append("## 교차확인(간단)")
                    if uniq:
                        lines.append(
                            f"- 출처 도메인 수: {len(uniq)} (예: {', '.join(uniq[:4])})"
                        )
                        if len(uniq) < 2:
                            lines.append(
                                "- 주의: 출처 다양성이 낮아 교차확인이 제한적입니다."
                            )
                    else:
                        lines.append("- 출처 도메인 추출 실패(교차확인 제한)")

                    # 불일치 후보(휴리스틱): 상반 표현/수치 분포만 간단히 표시
                    try:
                        texts = []
                        for idx, r in enumerate(research_results[:6], 1):
                            title = getattr(r, "title", "") or ""
                            snippet = getattr(r, "snippet", "") or ""
                            texts.append((idx, f"{title} {snippet}".lower()))

                        antonym_groups = [
                            (
                                ["상승", "증가", "인상", "확대"],
                                ["하락", "감소", "인하", "축소"],
                                "추세/변화",
                            ),
                            (["찬성", "긍정"], ["반대", "부정"], "입장/평가"),
                            (["확정", "결정"], ["철회", "취소", "보류"], "상태/결정"),
                        ]
                        for pos_words, neg_words, label in antonym_groups:
                            pos_idxs = [
                                i for i, t in texts if any(w in t for w in pos_words)
                            ]
                            neg_idxs = [
                                i for i, t in texts if any(w in t for w in neg_words)
                            ]
                            if pos_idxs and neg_idxs:
                                lines.append(
                                    f"- 표현 불일치 후보({label}): +({pos_idxs}) vs -({neg_idxs})"
                                )

                        # 수치/연도 표기 다양성(충돌 단정 X)
                        nums_by_idx = {}
                        for i, t in texts:
                            nums = re.findall(
                                r"(?<!\\d)(\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?%?)(?!\\d)",
                                t,
                            )
                            nums = [n for n in nums if n and len(n) <= 10]
                            if nums:
                                nums_by_idx[i] = nums[:4]
                        if len(nums_by_idx) >= 2:
                            sample = "; ".join(
                                [
                                    f"[{i}] {', '.join(v)}"
                                    for i, v in list(nums_by_idx.items())[:3]
                                ]
                            )
                            lines.append(
                                f"- 수치/연도 표기가 출처별로 다를 수 있음(원문 확인): {sample}"
                            )
                    except Exception:
                        pass

                    lines.append("- 주의: 자동 수집/요약이므로 원문 확인이 필요합니다.")
                except Exception:
                    # 교차확인이 실패해도 전체 블록은 반환
                    pass

                lines.append("")
                lines.append("## 근거/출처")
                for idx, r in enumerate(research_results[:5], 1):
                    try:
                        title = getattr(r, "title", "") or ""
                        url = getattr(r, "url", "") or ""
                        snippet = getattr(r, "snippet", "") or ""
                        date = getattr(r, "publish_date", None) or ""
                        date_part = f" - {date}" if date else ""
                        one = f"- [{idx}] {title} - {url}{date_part}"
                        lines.append(one.strip())
                        if snippet:
                            lines.append(f"  - 요약: {snippet}")
                    except Exception:
                        continue
                return "\n".join([l for l in lines if l is not None])
            except Exception:
                return ""

        def _extract_history_text(ctx: Optional[Dict[str, Any]]) -> str:
            """
            대화 히스토리에서 조사에 유용한 문장을 추출합니다.
            - 프론트가 context.conversation_history로 전달
            - 기존 코드에서는 context.conversation_history/market 분석 등에서 이미 활용 중
            """
            try:
                if not ctx or not isinstance(ctx, dict):
                    return ""
                hist = ctx.get("conversation_history")
                if not isinstance(hist, list) or not hist:
                    return ""
                # 최근 6개 정도만, 너무 긴 텍스트는 컷
                parts = []
                for item in hist[-6:]:
                    if not isinstance(item, dict):
                        continue
                    role = item.get("role")
                    content = (item.get("content") or "").strip()
                    if not content:
                        continue
                    if role not in ["user", "assistant"]:
                        continue
                    # 과도한 길이 제한
                    parts.append(f"{role}: {content[:400]}")
                return "\n".join(parts)
            except Exception:
                return ""

        def _extract_recent_user_messages(
            ctx: Optional[Dict[str, Any]], limit: int = 6
        ) -> List[str]:
            try:
                if not ctx or not isinstance(ctx, dict):
                    return []
                hist = ctx.get("conversation_history")
                if not isinstance(hist, list) or not hist:
                    return []
                msgs = []
                for item in hist[-limit:]:
                    if not isinstance(item, dict):
                        continue
                    role = item.get("role")
                    if role != "user":
                        continue
                    content = (item.get("content") or "").strip()
                    if content:
                        msgs.append(content)
                return msgs
            except Exception:
                return []

        def _infer_research_facets(text: str) -> Dict[str, Any]:
            """
            아주 가벼운 휴리스틱으로 지역/기간 힌트를 추출합니다.
            - 검색 힌트용(정확한 NER 아님)
            """
            try:
                t = (text or "").strip()
                if not t:
                    return {}
                years = re.findall(r"\\b(20\\d{2})\\b", t)
                years = list(dict.fromkeys(years))[:3]

                regions = [
                    "서울",
                    "부산",
                    "대구",
                    "인천",
                    "광주",
                    "대전",
                    "울산",
                    "세종",
                    "경기",
                    "강원",
                    "충북",
                    "충남",
                    "전북",
                    "전남",
                    "경북",
                    "경남",
                    "제주",
                ]
                found_regions = [r for r in regions if r in t]
                found_regions = list(dict.fromkeys(found_regions))[:3]

                return {"years": years, "regions": found_regions}
            except Exception:
                return {}

        def _build_research_seed(
            user_message: str, ctx: Optional[Dict[str, Any]]
        ) -> str:
            """
            후속 질문(짧은 질문/지시어 포함)일 때, 히스토리를 활용해 연구용 입력을 보강합니다.
            """
            msg = (user_message or "").strip()
            if not msg:
                return msg

            user_msgs = _extract_recent_user_messages(ctx, limit=8)

            # 후속 질문 휴리스틱: 짧거나 지시어/후속 전환어가 포함된 경우
            lower = msg.lower()
            followup_markers = [
                "그럼",
                "그런데",
                "그렇다면",
                "그거",
                "이거",
                "이건",
                "그건",
                "그런",
                "그렇",
                "추가로",
                "더",
                "그리고",
                "또",
                "방금",
            ]
            looks_followup = len(msg) <= 30 or any(m in msg for m in followup_markers)
            if not looks_followup:
                return msg

            # 히스토리에서 "앵커"가 될 최근 사용자 발화 선택(너무 짧은 건 건너뜀)
            anchor = ""
            for m in reversed(user_msgs):
                if len(m.strip()) >= 30:
                    anchor = m.strip()
                    break
            if not anchor and user_msgs:
                anchor = user_msgs[-1].strip()
            if not anchor:
                return msg

            facets = _infer_research_facets(anchor + "\n" + msg)
            hint_parts = []
            yrs = facets.get("years") or []
            regs = facets.get("regions") or []
            if regs:
                hint_parts.append(f"지역:{', '.join(regs)}")
            if yrs:
                hint_parts.append(f"기간:{', '.join(yrs)}")
            hint = " / ".join(hint_parts)

            anchor_short = anchor[:220]
            if hint:
                return f"{anchor_short}\n\n검색 힌트: {hint}\n\n질문: {msg}"
            return f"{anchor_short}\n\n질문: {msg}"

        def _merge_investigative_evidence(
            response_text: str, evidence_block: str
        ) -> str:
            """
            조사 블록을 응답에 '중복 없이' 병합합니다.
            - 응답이 이미 ## 근거/출처 등의 섹션을 갖고 있으면 해당 섹션 아래에 근거 라인만 삽입
            - 없으면 evidence_block을 뒤에 붙임
            """
            try:
                if not response_text or not evidence_block:
                    return response_text or evidence_block or ""

                # 이미 증거 블록이 들어있는 경우(중복 방지)
                if "## 근거/출처" in response_text and "- [" in response_text:
                    return response_text

                # 근거/출처 섹션이 있으면 그 아래로 출처 라인만 삽입
                if "## 근거/출처" in response_text:
                    src_lines = []
                    in_sources = False
                    for line in evidence_block.splitlines():
                        if line.strip() == "## 근거/출처":
                            in_sources = True
                            continue
                        if in_sources and line.strip().startswith("## "):
                            break
                        if in_sources and (
                            line.strip().startswith("- [")
                            or line.strip().startswith("  - ")
                        ):
                            src_lines.append(line)
                    if src_lines:
                        # 첫 근거/출처 헤딩 다음 줄에 삽입
                        parts = response_text.split("## 근거/출처", 1)
                        return (
                            parts[0]
                            + "## 근거/출처\n"
                            + "\n".join(src_lines)
                            + "\n"
                            + parts[1].lstrip("\n")
                        )

                # 조사/검증 요약 섹션이 있으면, 교차확인 블록만 붙이기
                if (
                    "## 조사/검증 요약" in response_text
                    and "## 교차확인(간단)" not in response_text
                ):
                    # evidence_block에서 교차확인 섹션만 추출
                    cross = []
                    in_cross = False
                    for line in evidence_block.splitlines():
                        if line.strip() == "## 교차확인(간단)":
                            in_cross = True
                            cross.append(line)
                            continue
                        if (
                            in_cross
                            and line.strip().startswith("## ")
                            and line.strip() != "## 교차확인(간단)"
                        ):
                            break
                        if in_cross:
                            cross.append(line)
                    if cross:
                        return (
                            response_text.rstrip()
                            + "\n\n"
                            + "\n".join(cross).strip()
                            + "\n"
                        )

                # 기본: 통째로 덧붙임
                return response_text.rstrip() + "\n\n" + evidence_block.strip()
            except Exception:
                return (
                    (response_text or "").rstrip()
                    + "\n\n"
                    + (evidence_block or "").strip()
                )

        def _format_krw(value: Any) -> Optional[str]:
            try:
                if value is None:
                    return None
                v = float(value)
                if v <= 0:
                    return None
                # 엔진이 '원' 단위 숫자를 반환한다고 가정 (예: 158000000.0)
                # 1억 이상이면 억/만으로 읽기 좋게 표기
                if v >= 100_000_000:
                    eok = int(v // 100_000_000)
                    man = int((v % 100_000_000) // 10_000)
                    if man > 0:
                        return f"{eok}억 {man:,}만원"
                    return f"{eok}억"
                if v >= 10_000:
                    return f"{int(v // 10_000):,}만원"
                return f"{int(v):,}원"
            except Exception:
                return str(value) if value is not None else None

        def _format_float(value: Any, digits: int = 2) -> Optional[str]:
            try:
                if value is None:
                    return None
                return f"{float(value):.{digits}f}"
            except Exception:
                return str(value) if value is not None else None

        # 0단계(우선): 등기부등본(저장된 자료 기반) 조회 요청 처리
        # - 공식 인터넷등기소 자동 조회는 제약이 많아, 본 시스템에는 "사전 등록된 자료" 조회를 제공합니다.
        try:
            msg_lower = (message or "").lower()
            if any(
                k in msg_lower for k in ["등기부", "등기부등본", "등본", "등기사항"]
            ):
                from api.registry_api import extract_address_candidate

                addr = extract_address_candidate(message)
                if addr:
                    from api.registry_api import lookup_registry

                    lookup = await lookup_registry(addr)
                    data = lookup.get("data", {}) if isinstance(lookup, dict) else {}
                    if data.get("found"):
                        latest = (
                            data.get("latest", {})
                            if isinstance(data.get("latest"), dict)
                            else {}
                        )
                        fields = (
                            latest.get("fields", {})
                            if isinstance(latest.get("fields"), dict)
                            else {}
                        )
                        owner = fields.get("owner")
                        rights = fields.get("rights_keywords")
                        max_claim = fields.get("max_claim_amount")
                        analysis = (
                            latest.get("analysis", {})
                            if isinstance(latest.get("analysis"), dict)
                            else {}
                        )
                        parts = []
                        parts.append(
                            f"저장된 등기부 자료(주소: {data.get('address')})를 조회했습니다."
                        )
                        if owner:
                            parts.append(f"- 소유자(추출): {owner}")
                        if max_claim:
                            parts.append(f"- 채권최고액(추출): {max_claim}")
                        if rights:
                            parts.append(f"- 권리 키워드(추출): {', '.join(rights)}")
                        if analysis:
                            risk_level = analysis.get("risk_level")
                            risk_score = analysis.get("risk_score")
                            if risk_level:
                                parts.append(
                                    f"- 위험도: {risk_level}"
                                    + (
                                        f" ({risk_score})"
                                        if risk_score is not None
                                        else ""
                                    )
                                )
                            warns = analysis.get("warnings")
                            if isinstance(warns, list) and warns:
                                parts.append("- 주의 포인트:")
                                for w in warns[:3]:
                                    parts.append(f"  - {w}")
                            checklist = analysis.get("checklist")
                            if isinstance(checklist, list) and checklist:
                                parts.append("- 체크리스트(요약):")
                                for c in checklist[:4]:
                                    parts.append(f"  - {c}")
                        parts.append(
                            "\n※ 주의: 본 응답은 시스템에 **미리 등록된 등기부 텍스트** 기반 요약입니다. 공식 원문 확인이 필요합니다."
                        )
                        parts.append(
                            "\n원하시면 ‘표제부/갑구/을구’ 기준으로 더 세부 체크리스트(근저당/가압류/경매 위험)까지 정리해드릴게요."
                        )
                        return "\n".join(parts)
                    else:
                        # 메시지에 등기부 텍스트가 함께 들어온 경우: 바로 등록까지 처리
                        has_registry_text = len((message or "").strip()) >= 500 and any(
                            k in message
                            for k in ["표제부", "갑구", "을구", "등기사항전부증명서"]
                        )
                        if has_registry_text:
                            try:
                                from api.registry_api import (
                                    RegistryIngestRequest,
                                    ingest_registry,
                                )

                                await ingest_registry(
                                    RegistryIngestRequest(
                                        address=addr,
                                        text=message,
                                        source="chat",
                                        issued_at=None,
                                    )
                                )
                                return (
                                    f"등기부 텍스트를 저장했습니다.\n"
                                    f"- 주소: {addr}\n\n"
                                    f"이제 ‘주소: {addr} 등기부등본 조회’로 바로 불러올 수 있습니다."
                                )
                            except Exception:
                                # 저장 실패 시에는 안내만 제공
                                pass

                        return (
                            f"저장된 등기부 자료가 없습니다.\n\n"
                            f"- 주소: {data.get('address')}\n\n"
                            "등기부 텍스트/OCR 결과를 먼저 등록해 주세요.\n"
                            "- `POST /api/registry/ingest` (address, text)\n"
                            "- 또는 `POST /api/registry/upload` (multipart: address + file)"
                        )
        except Exception:
            # 등기 조회 로직이 실패해도 기본 답변 흐름을 막지 않음
            pass

        # 0.5단계: 시장 분석(시세/전망) 빠른 처리
        # - 프론트 고급 기능 패널에서 사용하는 /api/market-analysis/* 와 동일한 엔진 기반
        try:
            msg = (message or "").strip()
            msg_lower = msg.lower()

            # 키워드 기반 + "후속 질문" 기반(대화 맥락) 트리거
            has_market_keywords = any(
                k in msg
                for k in ["시장 분석", "시세", "매매가", "전세가", "전망", "예측"]
            )
            is_short_followup = len(msg) <= 20 and any(
                k in msg for k in ["전세", "매매", "그럼", "그런데", "그렇다면"]
            )
            followup_has_market_context = False
            if is_short_followup and context and isinstance(context, dict):
                hist = context.get("conversation_history")
                if isinstance(hist, list):
                    # 최근 응답/요청 중 시장 분석 흔적이 있으면 후속 질문으로 간주
                    for item in reversed(hist[-10:]):
                        try:
                            content = (
                                item.get("content") if isinstance(item, dict) else ""
                            ) or ""
                            if any(
                                k in content
                                for k in [
                                    "시장 분석",
                                    "시장 전망",
                                    "📊",
                                    "📈",
                                    "투자 위험도",
                                    "변동성",
                                ]
                            ):
                                followup_has_market_context = True
                                break
                        except Exception:
                            continue

            if has_market_keywords or (
                is_short_followup and followup_has_market_context
            ):
                # 아주 가벼운 휴리스틱 파싱
                region = None
                for cand in [
                    "강남구",
                    "서초구",
                    "송파구",
                    "성남시",
                    "하남시",
                    "광주시",
                    "전국",
                ]:
                    if cand in msg:
                        region = cand
                        break
                if not region:
                    m = re.search(r"([가-힣]{2,}(?:시|군|구))", msg)
                    if m:
                        region = m.group(1)
                # 컨텍스트(이전 대화)에서 지역 추론: "그럼 전세는?" 같은 후속 질문 지원
                if not region and context and isinstance(context, dict):
                    hist = context.get("conversation_history")
                    if isinstance(hist, list):
                        for item in reversed(hist[-20:]):
                            try:
                                content = (
                                    item.get("content")
                                    if isinstance(item, dict)
                                    else ""
                                ) or ""
                                m2 = re.search(r"([가-힣]{2,}(?:시|군|구))", content)
                                if m2:
                                    region = m2.group(1)
                                    break
                            except Exception:
                                continue

                property_type = None
                for cand in ["아파트", "오피스텔", "빌라", "단독주택", "주택"]:
                    if cand in msg:
                        property_type = "단독주택" if cand == "주택" else cand
                        break
                property_type = property_type or "아파트"
                # 컨텍스트에서 부동산 유형 추론
                if context and isinstance(context, dict):
                    hist = context.get("conversation_history")
                    if isinstance(hist, list):
                        for item in reversed(hist[-20:]):
                            try:
                                content = (
                                    item.get("content")
                                    if isinstance(item, dict)
                                    else ""
                                ) or ""
                                for cand in [
                                    "아파트",
                                    "오피스텔",
                                    "빌라",
                                    "단독주택",
                                    "주택",
                                ]:
                                    if cand in content:
                                        property_type = (
                                            "단독주택" if cand == "주택" else cand
                                        )
                                        raise StopIteration
                            except StopIteration:
                                break
                            except Exception:
                                continue

                price_type = "전세" if "전세" in msg else "매매"
                # 컨텍스트에서 매매/전세 추론
                if price_type == "매매" and context and isinstance(context, dict):
                    hist = context.get("conversation_history")
                    if isinstance(hist, list):
                        for item in reversed(hist[-20:]):
                            try:
                                content = (
                                    item.get("content")
                                    if isinstance(item, dict)
                                    else ""
                                ) or ""
                                if "전세" in content:
                                    price_type = "전세"
                                    break
                                if "매매" in content:
                                    price_type = "매매"
                                    break
                            except Exception:
                                continue

                if region:
                    from api.market_analysis_api import (
                        MarketAnalysisRequest,
                        MarketForecastRequest,
                        analyze_market,
                        market_forecast,
                    )

                    do_forecast = any(k in msg for k in ["전망", "예측"])
                    # "전세/매매" 같은 후속 질문이면 기본은 분석으로
                    if not do_forecast and is_short_followup:
                        do_forecast = False
                    if do_forecast:
                        res = await market_forecast(
                            MarketForecastRequest(
                                region=region,
                                property_type=property_type,
                                forecast_months=12,
                                price_type=price_type,
                            )
                        )
                        if isinstance(res, dict) and res.get("status") == "error":
                            # 전망 데이터가 부족하면 분석으로 폴백(또는 간단 안내)
                            err = (
                                res.get("error")
                                or res.get("message")
                                or "전망 데이터를 만들 수 없습니다."
                            )
                            return (
                                f"{region} {property_type} ({price_type}) 전망을 계산하기 위한 데이터가 부족합니다.\n"
                                f"- 사유: {err}\n\n"
                                f"대신 ‘{region} {property_type} {price_type} 시장 분석’으로 요청해 주세요."
                            )

                        data = res.get("data", {}) if isinstance(res, dict) else {}
                        forecast = (
                            data.get("forecast", {}) if isinstance(data, dict) else {}
                        )
                        if forecast:
                            preds = (
                                forecast.get("predictions", {})
                                if isinstance(forecast.get("predictions"), dict)
                                else {}
                            )
                            current_price = _format_krw(forecast.get("current_price"))
                            trend = forecast.get("price_trend")
                            strength = _format_float(forecast.get("trend_strength"), 2)
                            risk = forecast.get("investment_risk_level")
                            p3 = _format_krw(preds.get("3m"))
                            p6 = _format_krw(preds.get("6m"))
                            p12 = _format_krw(preds.get("12m"))
                            parts = [
                                f"📈 {region} {property_type} ({price_type}) 시장 전망",
                                f"- 현재가(추정): {current_price}",
                                f"- 추세: {trend}"
                                + (f" (강도 {strength})" if strength else ""),
                                f"- 3/6/12개월 예측: {p3}, {p6}, {p12}",
                                f"- 투자 위험도: {risk}",
                                "",
                                "원하시면 아래 중 2~3가지만 더 알려주세요:",
                                "- (1) 예산(매매/보증금) (2) 전용면적(예: 84㎡) (3) 선호 준공/역세권",
                            ]
                            return "\n".join(
                                [
                                    p
                                    for p in parts
                                    if p and str(p).strip() != "- 현재가: None"
                                ]
                            )
                    else:
                        res = await analyze_market(
                            MarketAnalysisRequest(
                                region=region,
                                property_type=property_type,
                                price_type=price_type,
                            )
                        )
                        data = res.get("data", {}) if isinstance(res, dict) else {}
                        analysis = (
                            data.get("analysis", {}) if isinstance(data, dict) else {}
                        )
                        if analysis:
                            current_price = _format_krw(analysis.get("current_price"))
                            trend = analysis.get("price_trend")
                            strength = _format_float(analysis.get("trend_strength"), 2)
                            vol = _format_float(analysis.get("market_volatility"), 3)
                            rec = analysis.get("investment_recommendation")
                            key_factors = analysis.get("key_factors")
                            parts = [
                                f"📊 {region} {property_type} ({price_type}) 시장 분석",
                                f"- 현재가(추정): {current_price}",
                                f"- 추세: {trend}"
                                + (f" (강도 {strength})" if strength else ""),
                                f"- 변동성: {vol}",
                                f"- 한줄 제안: {rec}",
                            ]
                            if isinstance(key_factors, list) and key_factors:
                                parts.append(
                                    "- 주요 요인: "
                                    + ", ".join([str(x) for x in key_factors[:5]])
                                )
                            parts.extend(
                                [
                                    "",
                                    "원하시면 아래 중 2~3가지만 더 알려주세요:",
                                    "- (1) 예산(매매/보증금) (2) 전용면적(예: 84㎡) (3) 학군/역세권 선호",
                                ]
                            )
                            return "\n".join(
                                [
                                    p
                                    for p in parts
                                    if p and str(p).strip() != "- 현재가: None"
                                ]
                            )
        except Exception:
            pass

        # 유시민 스타일인 경우 웹 연구와 MD QA를 건너뛰고 바로 intelligent_answer_generator로
        writing_style = context.get("writing_style") if context else None
        person_style = context.get("person_style") if context else None

        if writing_style == "yoo_simin" or person_style == "yoo_simin":
            logger.info("🎯 유시민 스타일 감지: 웹 연구/MD QA 건너뛰고 직접 생성")
            from api.intelligent_answer_generator import intelligent_answer_generator

            analysis = intelligent_answer_generator.analyze_request(message, context)
            response = await intelligent_answer_generator.generate_answer(
                message, analysis, quality, context
            )
            if response and len(response.strip()) >= 20:
                return response

        # 0단계: 웹 연구 필요성 판단 및 수행 (다양성 고려)
        # 기본값은 "비활성" (속도/안정성). 필요 시 요청 context에서 명시적으로 켬.
        enable_web_research = (
            _as_bool(context.get("enable_web_research")) if context else False
        )
        investigative_mode = (
            _as_bool(context.get("investigative_mode")) if context else False
        )
        web_research_result = None
        web_research_evidence = None
        research_results = None
        research_context = None
        try:
            if not enable_web_research:
                raise ImportError("web research disabled by default")
            from intelligent_web_researcher import get_web_researcher

            web_researcher = get_web_researcher()

            # 웹 연구 필요성 판단
            research_seed = _build_research_seed(message, context)
            should_do_research = web_researcher.should_research(research_seed, "")
            # 조사/검증 모드면 필요성 판단과 무관하게 강제 수행
            if investigative_mode:
                should_do_research = True

            if should_do_research:
                logger.info(f"🔍 웹 연구 필요성 확인: {message[:50]}...")
                try:
                    # 정보 격차 분석 (다양성 고려)
                    research_context = web_researcher.analyze_information_gaps(
                        research_seed, ""
                    )

                    # 웹 연구 수행
                    research_results = await web_researcher.research_information(
                        research_context
                    )

                    if research_results:
                        # 연구 결과 종합 (다양성 고려)
                        web_research_result = (
                            web_researcher.synthesize_research_results(
                                research_results, research_context
                            )
                        )
                        # 조사/검증 모드면 근거 섹션과 호환되는 블록을 별도로 생성
                        if investigative_mode:
                            web_research_evidence = _format_investigative_web_evidence(
                                research_results, research_context
                            )
                        logger.info(
                            f"✅ 웹 연구 완료: {len(research_results)}개 결과 수집"
                        )
                except Exception as research_error:
                    logger.warning(f"웹 연구 수행 중 오류: {research_error}")
        except ImportError as e:
            logger.debug(f"웹 연구 모듈을 사용할 수 없음: {e}")
        except Exception as e:
            logger.warning(f"웹 연구 실패: {e}")

        # 1단계: MD 문서 기반 질문-답변 시도
        try:
            from api.md_qa_generator import get_md_qa_generator

            md_qa = get_md_qa_generator()

            # MD 관련 질문인지 확인
            if md_qa.is_md_related_question(message):
                logger.info(f"MD 문서 기반 QA 시도: {message[:50]}...")
                try:
                    md_result = md_qa.generate_answer(message, include_sources=True)

                    # 신뢰도가 충분히 높거나 관련 결과가 있으면 사용
                    confidence = md_result.get("confidence", 0)
                    search_count = md_result.get("search_results_count", 0)

                    if confidence > 0.3 or search_count > 0:
                        response_text = md_result["answer"]

                        # 출처 정보 추가
                        sources = md_result.get("sources", [])
                        if sources:
                            sources_text = "\n\n**📚 참고 문서:**\n"
                            for source in sources[:3]:
                                file_name = source.get(
                                    "file_name", source.get("file", "")
                                )
                                sources_text += f"- `{source.get('file', file_name)}`\n"
                            response_text += sources_text

                        # 웹 연구 결과가 있으면 추가
                        if web_research_result:
                            if investigative_mode and web_research_evidence:
                                response_text = _merge_investigative_evidence(
                                    response_text, web_research_evidence
                                )
                            else:
                                response_text += "\n\n" + (
                                    web_research_evidence or web_research_result
                                )

                        # 응답이 유효하면 반환
                        if response_text and len(response_text.strip()) >= 20:
                            logger.info(
                                f"✅ MD 문서 기반 답변 생성 완료 (신뢰도: {confidence:.2f}, 검색결과: {search_count}개)"
                            )
                            return response_text
                        else:
                            logger.debug(
                                "MD 기반 답변이 충분하지 않음, 다음 단계로 진행"
                            )
                    else:
                        logger.debug(
                            f"MD 문서 검색 결과 부족 (신뢰도: {confidence:.2f}, 검색결과: {search_count}개), 다음 단계로 진행"
                        )
                except Exception as md_error:
                    logger.warning(f"MD QA 처리 중 오류: {md_error}, 다음 단계로 진행")
        except ImportError as e:
            logger.debug(f"MD QA 모듈을 사용할 수 없음: {e}, 다음 단계로 진행")
        except Exception as e:
            logger.warning(f"MD 문서 기반 QA 실패, 다음 단계로 진행: {e}")

        # 2단계: 혁신적인 답변 생성 엔진 사용
        try:
            from api.intelligent_answer_generator import intelligent_answer_generator

            # 요청 분석
            analysis = intelligent_answer_generator.analyze_request(message, context)
            logger.info(
                f"📊 요청 분석 완료: 도메인={analysis.get('domain')}, 타입={analysis.get('message_type')}, 여러요구사항={analysis.get('is_multiple_requests')}"
            )

            # 질문과 요구사항에 맞는 답변 생성 (비동기)
            logger.info(
                f"🔄 답변 생성 시작: message_length={len(message)}, quality={quality}"
            )
            response_text = await intelligent_answer_generator.generate_answer(
                message, analysis, quality, context
            )
            logger.info(
                f"📥 답변 생성 완료: response_length={len(response_text) if response_text else 0}, response_preview={response_text[:100] if response_text else 'None'}"
            )

            # 웹 연구 결과가 있으면 답변에 통합
            if web_research_result and response_text:
                # 웹 연구 결과를 답변에 자연스럽게 통합
                if investigative_mode and web_research_evidence:
                    response_text = _merge_investigative_evidence(
                        response_text, web_research_evidence
                    )
                else:
                    response_text = (
                        response_text
                        + "\n\n"
                        + (web_research_evidence or web_research_result)
                    )
                logger.info("✅ 웹 연구 결과를 답변에 통합했습니다")

            # 응답 검증 및 품질 향상
            if response_text:
                # 응답이 너무 짧거나 기본 메시지만 있는 경우 재생성 시도
                if len(response_text.strip()) < 20 or response_text.strip().startswith(
                    "응답:"
                ):
                    logger.warning(
                        f"응답이 너무 짧거나 기본 메시지: {response_text[:100]}, 재생성 시도"
                    )
                    # 더 상세한 프롬프트로 재시도
                    try:
                        enhanced_analysis = (
                            intelligent_answer_generator.analyze_request(
                                message, context
                            )
                        )
                        # 여러 요구사항이 있는 경우 처리
                        if enhanced_analysis.get("is_multiple_requests", False):
                            split_requests = enhanced_analysis.get("split_requests", [])
                            if split_requests and len(split_requests) > 1:
                                logger.info(
                                    f"여러 요구사항 감지, 통합 답변 생성: {len(split_requests)}개"
                                )
                                response_text = await intelligent_answer_generator._generate_multiple_requests_answer(
                                    split_requests, enhanced_analysis, quality, context
                                )
                            else:
                                # 단일 요구사항이지만 더 상세한 답변 생성
                                enhanced_context = context or {}
                                enhanced_context.update(
                                    {
                                        "require_detailed": True,
                                        "min_length": 200,
                                        "include_examples": True,
                                    }
                                )
                                response_text = (
                                    await intelligent_answer_generator.generate_answer(
                                        message,
                                        enhanced_analysis,
                                        quality,
                                        enhanced_context,
                                    )
                                )
                        else:
                            # 단일 질문이지만 더 상세한 답변 생성
                            enhanced_context = context or {}
                            enhanced_context.update(
                                {
                                    "require_detailed": True,
                                    "min_length": 200,
                                    "include_examples": True,
                                }
                            )
                            response_text = (
                                await intelligent_answer_generator.generate_answer(
                                    message,
                                    enhanced_analysis,
                                    quality,
                                    enhanced_context,
                                )
                            )
                    except Exception as e:
                        logger.warning(f"재생성 시도 실패: {e}")

                try:
                    from api.response_enhancer import response_enhancer

                    response_text = response_enhancer.validate_and_fix_response(
                        response_text, analysis.get("domain", "general")
                    )
                    if len(response_text.strip()) >= 10:
                        response_text = response_enhancer.enhance_response(
                            response_text,
                            analysis.get("domain", "general"),
                            quality,
                            user_message=message,
                        )
                        logger.info(
                            f"✅ 혁신적인 답변 생성 엔진으로 응답 생성 완료 (도메인: {analysis.get('domain', 'general')}, 길이: {len(response_text)})"
                        )
                        return response_text
                except Exception as e:
                    logger.warning(f"응답 향상 실패: {e}")
                    if (
                        isinstance(response_text, str)
                        and len(response_text.strip()) >= 10
                    ):
                        logger.info(
                            f"✅ 기본 검증 통과 (도메인: {analysis.get('domain', 'general')}, 길이: {len(response_text)})"
                        )
                        return response_text
        except (ImportError, AttributeError, TypeError) as e:
            logger.warning(f"혁신적인 답변 생성 엔진 사용 불가, 폴백 사용: {e}")

            # 웹 연구 결과만이라도 반환
            if web_research_result:
                logger.info("✅ 웹 연구 결과를 기본 응답으로 사용")
                return web_research_evidence or web_research_result

        # 3단계: 향상된 응답 생성기 사용 시도 (폴백)
        try:
            from enhanced_response_generator import enhanced_generator

            response_text = enhanced_generator.generate_response(message, quality)

            # 웹 연구 결과 통합
            if web_research_result and response_text:
                if investigative_mode and web_research_evidence:
                    response_text = _merge_investigative_evidence(
                        response_text, web_research_evidence
                    )
                else:
                    response_text = (
                        response_text
                        + "\n\n"
                        + (web_research_evidence or web_research_result)
                    )

            # 응답 검증
            if (
                response_text
                and isinstance(response_text, str)
                and len(response_text.strip()) >= 10
            ):
                return response_text
        except (ImportError, AttributeError, TypeError) as e:
            logger.debug(f"향상된 응답 생성기 사용 불가: {e}")

        # 웹 연구 결과가 있으면 우선 사용
        if web_research_result:
            logger.info("✅ 웹 연구 결과를 최종 응답으로 사용")
            return web_research_evidence or web_research_result

        # 0. 고급 AI 응답 엔진 시도 (ChatGPT 수준)
        if INTELLIGENT_ENGINE_AVAILABLE and intelligent_engine:
            try:
                intelligent_response = intelligent_engine.generate_response(
                    query=message,
                    context=context,
                    conversation_history=context.get("conversationHistory")
                    if context
                    else None,
                )
                if intelligent_response and len(intelligent_response.strip()) > 200:
                    logger.info(f"✅ 고급 AI 엔진 응답 사용: {len(intelligent_response)}자")
                    return intelligent_response
            except Exception as e:
                logger.warning(f"⚠️ 고급 AI 엔진 응답 실패: {e}")

        # 1. 지식 기반 응답 시도 (정적 지식)
        knowledge_response = _generate_knowledge_based_response(message, quality)
        if knowledge_response:
            logger.info(f"✅ 지식 기반 응답 사용: {len(knowledge_response)}자")
            return knowledge_response

        # 2. LLM 서비스 시도 (비동기 컨텍스트에서 직접 호출) - 타임아웃 짧게 설정
        if LLM_SERVICE_AVAILABLE and llm_service_instance:
            try:
                logger.info(f"🤖 LLM 서비스로 응답 생성 시도: {message[:50]}...")

                # 대화 히스토리를 context에 포함
                enhanced_ctx = context.copy() if context else {}
                enhanced_ctx["is_long_form"] = (
                    quality == "ultimate" or quality == "detailed"
                )

                # 타임아웃 30초로 제한
                import asyncio

                try:
                    llm_result = await asyncio.wait_for(
                        llm_service_instance.generate_response(
                            message=message,
                            conversation_id=enhanced_ctx.get("conversation_id"),
                            context=enhanced_ctx,
                        ),
                        timeout=30.0,
                    )
                except asyncio.TimeoutError:
                    logger.warning("⚠️ LLM 서비스 타임아웃 (30초)")
                    llm_result = None

                if llm_result and llm_result.get("content"):
                    response_text = llm_result["content"]
                    if len(response_text.strip()) > 100:
                        logger.info(f"✅ LLM 서비스 응답 성공: {len(response_text)}자")
                        return response_text
            except Exception as e:
                logger.warning(f"⚠️ LLM 서비스 응답 실패: {e}")

        # 3. 최종 폴백: 기본 응답 생성
        logger.info(
            f"⚠️ 모든 단계 실패, generate_intelligent_response로 폴백: message_length={len(message)}"
        )
        fallback_response = generate_intelligent_response(message, quality)
        logger.info(
            f"📥 폴백 응답 생성 완료: response_length={len(fallback_response) if fallback_response else 0}"
        )
        return fallback_response

    except Exception as e:
        logger.error(f"응답 생성 오류: {e}", exc_info=True)
        return generate_default_response(message)


def _generate_knowledge_based_response(message: str, quality: str) -> Optional[str]:
    """주제별 지식 기반 응답 생성"""
    message_lower = message.lower()

    # Python 관련 질문
    if "python" in message_lower:
        if (
            "웹 크롤러" in message_lower
            or "web crawler" in message_lower
            or "크롤링" in message_lower
        ):
            return """# Python 웹 크롤러 만들기 가이드

Python으로 웹 크롤러를 만드는 방법을 단계별로 설명해드리겠습니다.

## 1. 필요한 라이브러리 설치

```bash
pip install requests beautifulsoup4 lxml
```

## 2. 기본 웹 크롤러 코드

```python
import requests
from bs4 import BeautifulSoup

def crawl_webpage(url):
    \"\"\"웹 페이지를 크롤링하여 내용을 추출합니다.\"\"\"
    try:
        # HTTP 요청 보내기
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # HTML 파싱
        soup = BeautifulSoup(response.text, 'lxml')
        
        # 제목 추출
        title = soup.find('title')
        print(f"페이지 제목: {title.text if title else '없음'}")
        
        # 모든 링크 추출
        links = soup.find_all('a', href=True)
        print(f"\\n발견된 링크 수: {len(links)}")
        
        for link in links[:10]:  # 처음 10개만 출력
            print(f"  - {link['href']}")
        
        # 본문 텍스트 추출
        paragraphs = soup.find_all('p')
        print(f"\\n본문 단락 수: {len(paragraphs)}")
        
        return {
            'title': title.text if title else None,
            'links': [link['href'] for link in links],
            'paragraphs': [p.text for p in paragraphs]
        }
        
    except requests.RequestException as e:
        print(f"요청 오류: {e}")
        return None

# 사용 예시
if __name__ == "__main__":
    url = "https://example.com"
    result = crawl_webpage(url)
```

## 3. 고급 기능 추가

### 여러 페이지 크롤링

```python
from urllib.parse import urljoin
import time

def crawl_multiple_pages(start_url, max_pages=10):
    \"\"\"여러 페이지를 크롤링합니다.\"\"\"
    visited = set()
    to_visit = [start_url]
    results = []
    
    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)
        if url in visited:
            continue
            
        print(f"크롤링 중: {url}")
        data = crawl_webpage(url)
        
        if data:
            results.append({'url': url, 'data': data})
            visited.add(url)
            
            # 새로운 링크 추가
            for link in data['links'][:5]:
                full_url = urljoin(url, link)
                if full_url not in visited:
                    to_visit.append(full_url)
        
        time.sleep(1)  # 서버 부하 방지
    
    return results
```

## 4. 주의사항

- **robots.txt 확인**: 크롤링 전 해당 사이트의 robots.txt를 확인하세요
- **요청 간격**: 서버에 부담을 주지 않도록 요청 사이에 지연을 두세요
- **에러 처리**: 네트워크 오류, 타임아웃 등을 적절히 처리하세요
- **법적 고려사항**: 크롤링이 허용되는지 확인하세요

추가 질문이 있으시면 말씀해주세요!"""

        elif (
            "무엇" in message_lower or "뭐" in message_lower or "설명" in message_lower
        ):
            return """# Python이란?

**Python**은 1991년 귀도 반 로섬(Guido van Rossum)이 개발한 고급 프로그래밍 언어입니다.

## 주요 특징

### 1. 읽기 쉬운 문법
Python은 영어와 비슷한 문법을 사용하여 코드를 읽고 작성하기 쉽습니다.

```python
# 다른 언어와 비교
# Python
if age >= 18:
    print("성인입니다")

# 다른 언어에서는 중괄호 {}가 필요하지만, Python은 들여쓰기로 블록을 구분합니다.
```

### 2. 다목적 언어
- **웹 개발**: Django, Flask, FastAPI
- **데이터 과학**: Pandas, NumPy, Matplotlib
- **머신러닝/AI**: TensorFlow, PyTorch, scikit-learn
- **자동화**: 스크립트 작성, 업무 자동화
- **게임 개발**: Pygame

### 3. 풍부한 라이브러리
200,000개 이상의 패키지가 PyPI에 등록되어 있습니다.

## 간단한 예제

```python
# 변수와 출력
name = "Python"
print(f"Hello, {name}!")

# 리스트와 반복문
fruits = ["사과", "바나나", "체리"]
for fruit in fruits:
    print(fruit)

# 함수 정의
def greet(name):
    return f"안녕하세요, {name}님!"

print(greet("홍길동"))
```

## 설치 방법

1. [python.org](https://www.python.org/downloads/)에서 다운로드
2. 설치 시 "Add Python to PATH" 체크
3. 터미널에서 `python --version`으로 확인

Python은 배우기 쉽고 강력한 언어로, 프로그래밍 입문자에게 추천됩니다!"""

    # JavaScript 관련
    if "javascript" in message_lower or "js" in message_lower:
        if "무엇" in message_lower or "뭐" in message_lower or "설명" in message_lower:
            return """# JavaScript란?

**JavaScript**는 웹 브라우저에서 실행되는 프로그래밍 언어로, 웹 페이지에 동적인 기능을 추가합니다.

## 주요 특징

### 1. 웹의 3대 기술
- **HTML**: 구조 (뼈대)
- **CSS**: 스타일 (디자인)
- **JavaScript**: 동작 (인터랙션)

### 2. 다양한 활용 분야
- **프론트엔드**: React, Vue, Angular
- **백엔드**: Node.js, Express
- **모바일 앱**: React Native, Ionic
- **데스크톱 앱**: Electron

## 기본 예제

```javascript
// 변수 선언
const name = "JavaScript";
let count = 0;

// 함수
function greet(name) {
    return `안녕하세요, ${name}!`;
}

// 화살표 함수
const add = (a, b) => a + b;

// 배열과 반복
const fruits = ["사과", "바나나", "체리"];
fruits.forEach(fruit => console.log(fruit));

// DOM 조작
document.getElementById("myButton").addEventListener("click", () => {
    alert("버튼이 클릭되었습니다!");
});
```

## 최신 기능 (ES6+)

```javascript
// 구조 분해
const { name, age } = person;

// 스프레드 연산자
const newArray = [...oldArray, newItem];

// async/await
async function fetchData() {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}
```

JavaScript는 현대 웹 개발의 필수 언어입니다!"""

    # React 관련
    if "react" in message_lower:
        return """# React 소개

**React**는 Facebook에서 개발한 사용자 인터페이스(UI) 구축을 위한 JavaScript 라이브러리입니다.

## 핵심 개념

### 1. 컴포넌트
UI를 독립적이고 재사용 가능한 조각으로 나눕니다.

```jsx
// 함수형 컴포넌트
function Welcome({ name }) {
    return <h1>안녕하세요, {name}님!</h1>;
}

// 사용
<Welcome name="홍길동" />
```

### 2. JSX
JavaScript에서 HTML과 유사한 문법을 사용합니다.

```jsx
const element = (
    <div className="container">
        <h1>제목</h1>
        <p>내용</p>
    </div>
);
```

### 3. State와 Props
- **State**: 컴포넌트 내부에서 관리하는 데이터
- **Props**: 부모에서 자식으로 전달하는 데이터

```jsx
function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>카운트: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                증가
            </button>
        </div>
    );
}
```

### 4. Hooks
함수형 컴포넌트에서 상태와 생명주기 기능을 사용합니다.

```jsx
// useState: 상태 관리
const [value, setValue] = useState(initialValue);

// useEffect: 부수 효과
useEffect(() => {
    // 컴포넌트 마운트 시 실행
    fetchData();
    
    return () => {
        // 컴포넌트 언마운트 시 정리
    };
}, [dependency]);

// useCallback: 함수 메모이제이션
const handleClick = useCallback(() => {
    doSomething();
}, [dependency]);
```

## 프로젝트 시작하기

```bash
# Create React App 사용
npx create-react-app my-app
cd my-app
npm start

# Vite 사용 (더 빠름)
npm create vite@latest my-app -- --template react
```

React는 대규모 애플리케이션 개발에 적합한 강력한 라이브러리입니다!"""

    # 일반적인 인사
    if any(
        greet in message_lower for greet in ["안녕", "하이", "hello", "hi", "반가워"]
    ):
        return """안녕하세요! 👋

저는 CORBU AI 어시스턴트입니다. 다양한 질문에 답변해드릴 수 있어요.

## 도움드릴 수 있는 분야

- 🐍 **Python, JavaScript, React** 등 프로그래밍 질문
- 💻 **웹 개발** 관련 기술 설명
- 📊 **데이터 분석** 방법
- 🤖 **AI/ML** 개념 설명
- 📝 **글쓰기** 도움

무엇이든 물어보세요! 최선을 다해 답변드리겠습니다."""

    # 감사 표현
    if any(
        thanks in message_lower for thanks in ["고마워", "감사", "thanks", "thank you"]
    ):
        return """천만에요! 😊

도움이 되셨다니 기쁩니다!

**추가로 도움드릴 수 있는 것:**
- 🔍 코드 리뷰 및 개선
- 🐛 에러/버그 디버깅
- 📊 기술 비교 분석
- 📝 문서/가이드 작성

다른 질문이 있으시면 언제든 말씀해주세요!"""

    # Docker 관련
    if "docker" in message_lower:
        return """# Docker란?

**Docker**는 애플리케이션을 컨테이너라는 독립적인 환경에서 실행할 수 있게 해주는 플랫폼입니다.

## 핵심 개념

### 1. 컨테이너
- 애플리케이션과 모든 의존성을 하나의 패키지로 묶음
- 어디서든 동일하게 실행 가능
- 가상 머신보다 가볍고 빠름

### 2. 이미지
- 컨테이너의 청사진
- 애플리케이션 실행에 필요한 모든 것 포함
- Docker Hub에서 공식 이미지 다운로드 가능

## 기본 명령어

```bash
# 이미지 다운로드
docker pull nginx

# 컨테이너 실행
docker run -d -p 8080:80 nginx

# 실행 중인 컨테이너 확인
docker ps

# 컨테이너 중지
docker stop <container_id>

# 모든 컨테이너 확인
docker ps -a
```

## Dockerfile 예시

```dockerfile
# 베이스 이미지
FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY requirements.txt .
RUN pip install -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 포트 노출
EXPOSE 8000

# 실행 명령
CMD ["python", "app.py"]
```

## Docker Compose

여러 컨테이너를 함께 관리합니다.

```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

실행: `docker-compose up -d`

Docker는 개발 환경 통일과 배포 자동화에 필수적인 도구입니다!"""

    # Git 관련
    if "git" in message_lower and "github" not in message_lower:
        return """# Git 기초 가이드

**Git**은 분산 버전 관리 시스템으로, 코드의 변경 이력을 추적하고 협업을 가능하게 합니다.

## 기본 명령어

### 저장소 설정
```bash
# 새 저장소 초기화
git init

# 원격 저장소 복제
git clone https://github.com/user/repo.git

# 원격 저장소 연결
git remote add origin https://github.com/user/repo.git
```

### 기본 작업 흐름
```bash
# 파일 상태 확인
git status

# 변경 사항 스테이징
git add .                    # 모든 파일
git add filename.txt         # 특정 파일

# 커밋 생성
git commit -m "커밋 메시지"

# 원격 저장소에 푸시
git push origin main
```

### 브랜치 작업
```bash
# 브랜치 목록 확인
git branch

# 새 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 브랜치 전환
git checkout main

# 브랜치 병합
git merge feature/new-feature
```

### 되돌리기
```bash
# 스테이징 취소
git reset HEAD filename.txt

# 마지막 커밋 수정
git commit --amend

# 특정 커밋으로 되돌리기
git revert <commit_hash>
```

## 좋은 커밋 메시지 작성법

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경 (기능 변화 없음)
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드/설정 수정
```

Git은 모든 개발자의 필수 도구입니다!"""

    # API 관련
    if "api" in message_lower and (
        "rest" in message_lower or "설명" in message_lower or "무엇" in message_lower
    ):
        return """# REST API란?

**REST API**는 웹 서비스 간 데이터를 주고받는 표준화된 방식입니다.

## 핵심 개념

### HTTP 메서드
| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET | 데이터 조회 | 사용자 목록 가져오기 |
| POST | 데이터 생성 | 새 사용자 등록 |
| PUT | 데이터 전체 수정 | 사용자 정보 업데이트 |
| PATCH | 데이터 부분 수정 | 이름만 변경 |
| DELETE | 데이터 삭제 | 사용자 삭제 |

### 상태 코드
- **2xx**: 성공 (200 OK, 201 Created)
- **4xx**: 클라이언트 오류 (400 Bad Request, 404 Not Found)
- **5xx**: 서버 오류 (500 Internal Server Error)

## API 예시

### Python (requests)
```python
import requests

# GET 요청
response = requests.get('https://api.example.com/users')
users = response.json()

# POST 요청
new_user = {'name': '홍길동', 'email': 'hong@example.com'}
response = requests.post('https://api.example.com/users', json=new_user)
```

### JavaScript (fetch)
```javascript
// GET 요청
const response = await fetch('https://api.example.com/users');
const users = await response.json();

// POST 요청
const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '홍길동' })
});
```

## FastAPI로 REST API 만들기

```python
from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

app = FastAPI()

class User(BaseModel):
    name: str
    email: str

users = []

@app.get("/users")
def get_users():
    return users

@app.post("/users")
def create_user(user: User):
    users.append(user)
    return {"message": "User created", "user": user}
```

REST API는 현대 웹 서비스의 핵심입니다!"""

    # SQL/데이터베이스 관련
    if (
        "sql" in message_lower
        or "database" in message_lower
        or "데이터베이스" in message_lower
    ):
        return """# SQL 기초 가이드

**SQL**은 데이터베이스를 관리하고 쿼리하기 위한 언어입니다.

## 기본 쿼리

### 데이터 조회 (SELECT)
```sql
-- 모든 컬럼 조회
SELECT * FROM users;

-- 특정 컬럼 조회
SELECT name, email FROM users;

-- 조건부 조회
SELECT * FROM users WHERE age >= 18;

-- 정렬
SELECT * FROM users ORDER BY created_at DESC;

-- 제한
SELECT * FROM users LIMIT 10;
```

### 데이터 삽입 (INSERT)
```sql
INSERT INTO users (name, email, age)
VALUES ('홍길동', 'hong@example.com', 25);
```

### 데이터 수정 (UPDATE)
```sql
UPDATE users 
SET email = 'new@example.com' 
WHERE id = 1;
```

### 데이터 삭제 (DELETE)
```sql
DELETE FROM users WHERE id = 1;
```

## 테이블 조작

```sql
-- 테이블 생성
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 컬럼 추가
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 테이블 삭제
DROP TABLE users;
```

## 조인 (JOIN)

```sql
-- INNER JOIN
SELECT users.name, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id;

-- LEFT JOIN
SELECT users.name, orders.total
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
```

## 집계 함수

```sql
SELECT 
    COUNT(*) as total_users,
    AVG(age) as avg_age,
    MAX(age) as max_age,
    MIN(age) as min_age
FROM users;

-- GROUP BY
SELECT city, COUNT(*) as user_count
FROM users
GROUP BY city
HAVING COUNT(*) > 10;
```

SQL은 데이터 분석과 백엔드 개발의 기초입니다!"""

    # 머신러닝/AI 관련
    if (
        "머신러닝" in message_lower
        or "machine learning" in message_lower
        or "ml" in message_lower
        or "인공지능" in message_lower
        or "ai" in message_lower
    ):
        return """# 머신러닝(Machine Learning)이란?

**머신러닝**은 컴퓨터가 명시적으로 프로그래밍되지 않고도 데이터로부터 학습하는 AI의 한 분야입니다.

## 핵심 개념

### 학습 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| 지도학습 | 정답(레이블)이 있는 데이터로 학습 | 이미지 분류, 스팸 필터 |
| 비지도학습 | 정답 없이 패턴을 찾음 | 고객 군집화, 이상 탐지 |
| 강화학습 | 보상을 통해 최적 행동 학습 | 게임 AI, 로봇 제어 |

### 주요 알고리즘

**지도학습:**
- 선형 회귀 (Linear Regression)
- 로지스틱 회귀 (Logistic Regression)
- 결정 트리 (Decision Tree)
- 랜덤 포레스트 (Random Forest)
- 서포트 벡터 머신 (SVM)
- 신경망 (Neural Network)

**비지도학습:**
- K-평균 클러스터링 (K-Means)
- PCA (주성분 분석)
- DBSCAN

## Python으로 시작하기

### scikit-learn 예제

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 데이터 준비
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 모델 학습
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 예측 및 평가
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"정확도: {accuracy:.2f}")
```

### 딥러닝 (PyTorch) 예제

```python
import torch
import torch.nn as nn

class SimpleNN(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, num_classes)
    
    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)
        return out

# 모델 생성
model = SimpleNN(input_size=784, hidden_size=128, num_classes=10)
```

## ML 워크플로우

1. **데이터 수집** - 문제에 맞는 데이터 확보
2. **데이터 전처리** - 정제, 변환, 정규화
3. **탐색적 분석** - 데이터 이해 및 시각화
4. **모델 선택** - 적합한 알고리즘 선택
5. **학습** - 모델 훈련
6. **평가** - 성능 측정
7. **배포** - 실제 서비스에 적용

머신러닝은 AI의 핵심 기술로, 다양한 분야에서 활용됩니다!"""

    # 알고리즘 관련
    if "알고리즘" in message_lower:
        return """# 알고리즘 기초

**알고리즘**은 문제를 해결하기 위한 단계별 절차입니다.

## 시간 복잡도

| 표기법 | 이름 | 예시 |
|--------|------|------|
| O(1) | 상수 | 배열 인덱스 접근 |
| O(log n) | 로그 | 이진 검색 |
| O(n) | 선형 | 단순 반복 |
| O(n log n) | 선형 로그 | 퀵/병합 정렬 |
| O(n²) | 이차 | 버블 정렬 |

## 정렬 알고리즘

### 퀵 정렬 (Quick Sort)
```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)
```

### 병합 정렬 (Merge Sort)
```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

## 검색 알고리즘

### 이진 검색 (Binary Search)
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

## 자료 구조

- **스택**: LIFO (Last In, First Out)
- **큐**: FIFO (First In, First Out)
- **해시 테이블**: O(1) 평균 검색
- **트리**: 계층적 데이터 구조
- **그래프**: 노드와 간선의 집합

알고리즘은 효율적인 프로그래밍의 핵심입니다!"""

    # TypeScript 관련
    if "typescript" in message_lower or "ts" in message_lower:
        return """# TypeScript란?

**TypeScript**는 JavaScript에 정적 타입을 추가한 프로그래밍 언어입니다. Microsoft에서 개발했습니다.

## 핵심 특징

### 1. 타입 시스템
```typescript
// 기본 타입
let name: string = "홍길동";
let age: number = 25;
let isActive: boolean = true;
let items: string[] = ["a", "b", "c"];

// 타입 추론
let message = "Hello";  // string으로 추론

// 유니온 타입
let id: string | number = "abc123";
```

### 2. 인터페이스
```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age?: number;  // 선택적 속성
}

const user: User = {
    id: 1,
    name: "홍길동",
    email: "hong@example.com"
};
```

### 3. 타입 별칭
```typescript
type ID = string | number;
type Status = "pending" | "approved" | "rejected";

type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};
```

### 4. 제네릭
```typescript
function identity<T>(arg: T): T {
    return arg;
}

const result = identity<string>("hello");

// 제네릭 인터페이스
interface Container<T> {
    value: T;
    getValue(): T;
}
```

### 5. 클래스
```typescript
class Animal {
    private name: string;
    protected age: number;
    
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
    
    public speak(): void {
        console.log(`${this.name} makes a sound`);
    }
}

class Dog extends Animal {
    breed: string;
    
    constructor(name: string, age: number, breed: string) {
        super(name, age);
        this.breed = breed;
    }
}
```

## 설정 (tsconfig.json)

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "strict": true,
        "esModuleInterop": true,
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
}
```

## 시작하기

```bash
# TypeScript 설치
npm install -g typescript

# 컴파일
tsc app.ts

# 또는 ts-node로 직접 실행
npx ts-node app.ts
```

TypeScript는 대규모 JavaScript 프로젝트에 필수적입니다!"""

    # Node.js 관련
    if "node" in message_lower and (
        "js" in message_lower or "노드" in message_lower or "서버" in message_lower
    ):
        return """# Node.js란?

**Node.js**는 Chrome V8 엔진으로 빌드된 JavaScript 런타임입니다. 서버 사이드에서 JavaScript를 실행할 수 있게 해줍니다.

## 핵심 특징

- **비동기 I/O**: 논블로킹 방식으로 높은 성능
- **이벤트 기반**: 이벤트 루프 아키텍처
- **NPM**: 세계 최대의 패키지 생태계

## 기본 HTTP 서버

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, Node.js!');
});

server.listen(3000, () => {
    console.log('서버가 http://localhost:3000 에서 실행 중');
});
```

## Express.js 프레임워크

```javascript
const express = require('express');
const app = express();

// 미들웨어
app.use(express.json());

// 라우팅
app.get('/api/users', (req, res) => {
    res.json([
        { id: 1, name: '홍길동' },
        { id: 2, name: '김철수' }
    ]);
});

app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    res.status(201).json({ id: 3, name, email });
});

app.listen(3000, () => {
    console.log('Express 서버 실행 중');
});
```

## 파일 시스템 (fs)

```javascript
const fs = require('fs').promises;

// 파일 읽기
async function readFile() {
    const data = await fs.readFile('file.txt', 'utf8');
    console.log(data);
}

// 파일 쓰기
async function writeFile() {
    await fs.writeFile('output.txt', 'Hello World');
}
```

## 비동기 처리

```javascript
// Promise
function fetchData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ data: 'Success' });
        }, 1000);
    });
}

// async/await
async function getData() {
    try {
        const result = await fetchData();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}
```

## NPM 명령어

```bash
# 프로젝트 초기화
npm init -y

# 패키지 설치
npm install express

# 개발 의존성 설치
npm install --save-dev nodemon

# 스크립트 실행
npm run start
```

Node.js는 현대 웹 백엔드 개발의 표준입니다!"""

    # CSS 관련
    if "css" in message_lower:
        return """# CSS 기초 가이드

**CSS**(Cascading Style Sheets)는 웹 페이지의 스타일과 레이아웃을 정의합니다.

## 선택자

```css
/* 요소 선택자 */
p { color: blue; }

/* 클래스 선택자 */
.highlight { background: yellow; }

/* ID 선택자 */
#header { font-size: 24px; }

/* 자식 선택자 */
.container > p { margin: 10px; }

/* 가상 클래스 */
a:hover { color: red; }
button:active { transform: scale(0.95); }
```

## Flexbox 레이아웃

```css
.container {
    display: flex;
    justify-content: center;    /* 가로 정렬 */
    align-items: center;        /* 세로 정렬 */
    gap: 20px;                  /* 항목 간격 */
    flex-wrap: wrap;            /* 줄 바꿈 */
}

.item {
    flex: 1;                    /* 균등 분배 */
    flex-basis: 200px;          /* 기본 너비 */
}
```

## Grid 레이아웃

```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);  /* 3열 */
    grid-template-rows: auto;
    gap: 20px;
}

/* 특정 위치 지정 */
.item-1 {
    grid-column: 1 / 3;  /* 1~2열 차지 */
    grid-row: 1 / 2;
}
```

## 반응형 디자인

```css
/* 기본 스타일 (모바일 우선) */
.container {
    width: 100%;
    padding: 10px;
}

/* 태블릿 */
@media (min-width: 768px) {
    .container {
        width: 750px;
        margin: 0 auto;
    }
}

/* 데스크톱 */
@media (min-width: 1024px) {
    .container {
        width: 960px;
    }
}
```

## 애니메이션

```css
/* 트랜지션 */
.button {
    transition: all 0.3s ease;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* 키프레임 애니메이션 */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.element {
    animation: fadeIn 0.5s ease-in-out;
}
```

## CSS 변수

```css
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --font-size-base: 16px;
}

.button {
    background: var(--primary-color);
    font-size: var(--font-size-base);
}
```

CSS는 웹 디자인의 핵심입니다!"""

    # HTML 관련
    if "html" in message_lower:
        return """# HTML 기초 가이드

**HTML**(HyperText Markup Language)은 웹 페이지의 구조를 정의합니다.

## 기본 문서 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지 제목</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav><!-- 네비게이션 --></nav>
    </header>
    
    <main>
        <article><!-- 주요 콘텐츠 --></article>
    </main>
    
    <footer><!-- 푸터 --></footer>
    
    <script src="app.js"></script>
</body>
</html>
```

## 시맨틱 태그

```html
<header>헤더 영역</header>
<nav>네비게이션</nav>
<main>주요 콘텐츠</main>
<article>독립적인 콘텐츠</article>
<section>관련 콘텐츠 그룹</section>
<aside>사이드바</aside>
<footer>푸터 영역</footer>
```

## 폼 요소

```html
<form action="/submit" method="POST">
    <label for="name">이름:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="email">이메일:</label>
    <input type="email" id="email" name="email">
    
    <label for="password">비밀번호:</label>
    <input type="password" id="password" minlength="8">
    
    <label for="age">나이:</label>
    <input type="number" id="age" min="0" max="120">
    
    <label for="message">메시지:</label>
    <textarea id="message" rows="4"></textarea>
    
    <select name="country">
        <option value="kr">한국</option>
        <option value="us">미국</option>
        <option value="jp">일본</option>
    </select>
    
    <button type="submit">제출</button>
</form>
```

## 테이블

```html
<table>
    <thead>
        <tr>
            <th>이름</th>
            <th>나이</th>
            <th>직업</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>홍길동</td>
            <td>25</td>
            <td>개발자</td>
        </tr>
    </tbody>
</table>
```

## 멀티미디어

```html
<!-- 이미지 -->
<img src="image.jpg" alt="설명 텍스트" width="300">

<!-- 비디오 -->
<video controls width="640">
    <source src="video.mp4" type="video/mp4">
</video>

<!-- 오디오 -->
<audio controls>
    <source src="audio.mp3" type="audio/mpeg">
</audio>
```

## 링크와 목록

```html
<!-- 링크 -->
<a href="https://example.com" target="_blank">외부 링크</a>
<a href="#section1">내부 앵커</a>

<!-- 순서 없는 목록 -->
<ul>
    <li>항목 1</li>
    <li>항목 2</li>
</ul>

<!-- 순서 있는 목록 -->
<ol>
    <li>첫 번째</li>
    <li>두 번째</li>
</ol>
```

HTML은 웹의 기초입니다!"""

    # 웹개발 일반
    if "웹개발" in message_lower or "웹 개발" in message_lower:
        return """# 웹 개발 가이드

웹 개발은 크게 **프론트엔드**와 **백엔드**로 나뉩니다.

## 프론트엔드 (클라이언트)

사용자가 직접 보고 상호작용하는 부분입니다.

### 핵심 기술
- **HTML**: 구조
- **CSS**: 스타일링
- **JavaScript**: 동적 기능

### 주요 프레임워크/라이브러리
| 이름 | 특징 |
|------|------|
| React | 컴포넌트 기반, 가상 DOM |
| Vue.js | 쉬운 학습 곡선, 점진적 도입 |
| Angular | 풀 프레임워크, TypeScript |
| Svelte | 컴파일 타임 최적화 |

## 백엔드 (서버)

데이터 처리, 비즈니스 로직, 데이터베이스 관리를 담당합니다.

### 주요 기술 스택
| 언어 | 프레임워크 |
|------|-----------|
| JavaScript | Node.js, Express |
| Python | Django, FastAPI, Flask |
| Java | Spring Boot |
| Go | Gin, Echo |
| Ruby | Rails |

## 데이터베이스

### SQL (관계형)
- PostgreSQL, MySQL, SQLite

### NoSQL
- MongoDB (문서), Redis (키-값), Cassandra (컬럼)

## 개발 도구

```bash
# 패키지 관리
npm, yarn, pnpm (JS)
pip, poetry (Python)

# 버전 관리
git, GitHub, GitLab

# 컨테이너
Docker, Docker Compose

# CI/CD
GitHub Actions, Jenkins, GitLab CI
```

## 학습 로드맵

1. **기초**: HTML, CSS, JavaScript
2. **프론트엔드**: React 또는 Vue
3. **백엔드**: Node.js 또는 Python
4. **데이터베이스**: SQL 기초
5. **배포**: Git, Docker, 클라우드

웹 개발은 지속적인 학습이 필요한 분야입니다!"""

    # 시간/날짜 관련
    if "시간" in message_lower or "몇시" in message_lower or "오늘" in message_lower:
        from datetime import datetime

        now = datetime.now()
        weekdays = ["월", "화", "수", "목", "금", "토", "일"]
        weekday = weekdays[now.weekday()]
        return f"""# 현재 시간 정보

**현재 시간**: {now.strftime("%Y년 %m월 %d일")} ({weekday}요일) {now.strftime("%H:%M:%S")}

## 시간대
- 🇰🇷 한국 표준시 (KST, UTC+9)

## 추가 정보
- **연도**: {now.year}년
- **월**: {now.month}월
- **일**: {now.day}일
- **요일**: {weekday}요일
- **시**: {now.hour}시
- **분**: {now.minute}분

다른 시간대나 날짜 계산이 필요하시면 말씀해주세요!"""

    # 계산 관련
    if any(
        op in message
        for op in ["+", "-", "*", "/", "더하기", "빼기", "곱하기", "나누기", "계산"]
    ):
        import re

        # 간단한 수식 찾기
        math_pattern = r"(\d+(?:\.\d+)?)\s*([+\-*/×÷])\s*(\d+(?:\.\d+)?)"
        match = re.search(math_pattern, message)
        if match:
            num1, op, num2 = match.groups()
            num1, num2 = float(num1), float(num2)

            if op in ["+", "더하기"]:
                result = num1 + num2
                op_name = "더하기"
            elif op in ["-", "빼기"]:
                result = num1 - num2
                op_name = "빼기"
            elif op in ["*", "×", "곱하기"]:
                result = num1 * num2
                op_name = "곱하기"
            elif op in ["/", "÷", "나누기"]:
                result = (
                    num1 / num2 if num2 != 0 else "정의되지 않음 (0으로 나눌 수 없음)"
                )
                op_name = "나누기"
            else:
                result = "계산할 수 없음"
                op_name = op

            return f"""# 계산 결과

## 수식
**{num1}** {op} **{num2}** = **{result}**

## 설명
{int(num1) if num1 == int(num1) else num1}와(과) {int(num2) if num2 == int(num2) else num2}의 {op_name} 결과입니다.

더 복잡한 계산이 필요하시면 말씀해주세요!"""

    # 날씨 관련 (실제 데이터는 없지만 안내 제공)
    if "날씨" in message_lower or "기온" in message_lower or "비" in message_lower:
        return """# 날씨 정보 안내

죄송합니다. 현재 실시간 날씨 데이터에 직접 접근할 수 없습니다.

## 날씨 확인 방법

### 웹사이트
- [기상청](https://www.weather.go.kr) - 한국 공식 기상 정보
- [AccuWeather](https://www.accuweather.com) - 글로벌 날씨
- [날씨닷컴](https://www.weather.com) - 상세 예보

### 앱
- 기상청 날씨앱
- 웨더뉴스
- 다음/네이버 날씨

### 개발자를 위한 API
```python
# OpenWeatherMap API 예시
import requests

API_KEY = "your_api_key"
city = "Seoul"
url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}"

response = requests.get(url)
data = response.json()
```

특정 지역의 날씨가 궁금하시다면 위 서비스를 이용해보세요!"""

    # 번역 관련
    if "번역" in message_lower or "translate" in message_lower:
        return """# 번역 서비스 안내

현재 직접 번역 기능은 제공하지 않지만, 번역에 대해 도움을 드릴 수 있습니다.

## 추천 번역 서비스

### 웹 번역기
- [Google 번역](https://translate.google.com) - 100개+ 언어 지원
- [DeepL](https://www.deepl.com) - 높은 품질의 번역
- [Papago](https://papago.naver.com) - 한국어 특화

### 프로그래밍에서 번역 API 사용

```python
# Google Translate API (googletrans 패키지)
from googletrans import Translator

translator = Translator()
result = translator.translate("안녕하세요", dest='en')
print(result.text)  # Hello
```

```javascript
// DeepL API
const axios = require('axios');

const response = await axios.post('https://api.deepl.com/v2/translate', {
    auth_key: 'YOUR_API_KEY',
    text: 'Hello',
    target_lang: 'KO'
});
```

번역하고 싶은 문장이 있으시면 직접 말씀해주시면 가능한 한 도와드리겠습니다!"""

    # 농담/재미 관련
    if (
        "농담" in message_lower
        or "재미" in message_lower
        or "웃긴" in message_lower
        or "joke" in message_lower
    ):
        import random

        jokes = [
            "프로그래머가 카페에서 주문할 때: '자바 한 잔 주세요... 아, 컴파일 에러났네요. 커피로 바꿀게요.'",
            "왜 프로그래머는 할로윈과 크리스마스를 헷갈릴까요? Oct 31 = Dec 25 (8진수 31 = 10진수 25)",
            "프로그래머의 좌우명: '이건 내 컴퓨터에서는 됐는데...'",
            "버그가 없는 코드를 작성하는 방법? 코드를 작성하지 않으면 됩니다!",
            "Q: 프로그래머가 가장 싫어하는 것은? A: 문서화와 다른 사람이 짠 코드",
            "세상에서 가장 어려운 일: 1) 캐시 무효화 2) 이름 짓기 3) Off-by-one 에러",
            "개발자 A: '드디어 버그를 고쳤어!' 개발자 B: '새로운 버그 5개가 생겼어'",
        ]
        joke = random.choice(jokes)
        return f"""# 개발자 유머 😄

{joke}

---

더 재미있는 이야기를 원하시면 말씀해주세요! 🎉"""

    # 자기소개 관련
    if (
        "누구" in message_lower
        or "자기소개" in message_lower
        or "뭘 할 수" in message_lower
        or "무엇을" in message_lower
    ):
        return """# CORBU AI 소개

안녕하세요! 저는 **CORBU AI**입니다. 🤖

## 저에 대해

저는 다양한 질문에 답변하고 도움을 드리기 위해 만들어진 AI 어시스턴트입니다.

## 도움을 드릴 수 있는 분야

### 💻 프로그래밍
- Python, JavaScript, TypeScript
- React, Node.js, HTML/CSS
- 알고리즘, 자료구조

### 🛠️ 개발 도구
- Git, Docker
- SQL, 데이터베이스
- API 설계

### 🤖 AI/ML
- 머신러닝 개념
- 딥러닝 기초

### 📝 일반 도움
- 계산
- 시간 정보
- 개발 관련 질문

## 사용 팁

- 구체적으로 질문할수록 더 정확한 답변을 드릴 수 있습니다
- 코드 예시가 필요하면 말씀해주세요
- 한국어와 영어 모두 이해합니다

무엇이든 물어보세요! 최선을 다해 도와드리겠습니다. 😊"""

    # AWS/클라우드 관련
    if (
        "aws" in message_lower
        or "클라우드" in message_lower
        or "cloud" in message_lower
    ):
        return """# AWS & 클라우드 컴퓨팅

**클라우드 컴퓨팅**은 인터넷을 통해 컴퓨팅 리소스를 제공하는 서비스입니다.

## 주요 클라우드 서비스

| 제공업체 | 특징 |
|---------|------|
| AWS | 가장 큰 시장 점유율, 다양한 서비스 |
| Azure | Microsoft 생태계 통합 |
| GCP | 데이터 분석/ML 강점 |

## AWS 핵심 서비스

### 컴퓨팅
- **EC2**: 가상 서버
- **Lambda**: 서버리스 함수
- **ECS/EKS**: 컨테이너 오케스트레이션

### 스토리지
- **S3**: 객체 스토리지
- **EBS**: 블록 스토리지
- **RDS**: 관리형 데이터베이스

### 네트워킹
- **VPC**: 가상 네트워크
- **Route 53**: DNS 서비스
- **CloudFront**: CDN

## AWS CLI 기본 명령어

```bash
# 설정
aws configure

# S3 버킷 목록
aws s3 ls

# 파일 업로드
aws s3 cp file.txt s3://my-bucket/

# EC2 인스턴스 목록
aws ec2 describe-instances

# Lambda 함수 목록
aws lambda list-functions
```

## 비용 최적화 팁

1. **예약 인스턴스**: 장기 사용 시 할인
2. **스팟 인스턴스**: 유휴 리소스 저렴하게 사용
3. **Auto Scaling**: 필요한 만큼만 사용
4. **S3 수명 주기 정책**: 오래된 데이터 자동 이동

클라우드는 현대 인프라의 핵심입니다!"""

    # Linux/터미널 관련
    if (
        "linux" in message_lower
        or "터미널" in message_lower
        or "bash" in message_lower
        or "shell" in message_lower
    ):
        return """# Linux & 터미널 명령어

**Linux**는 오픈소스 운영체제로, 서버와 개발 환경에서 널리 사용됩니다.

## 기본 명령어

### 파일/디렉토리
```bash
# 현재 디렉토리
pwd

# 디렉토리 내용 보기
ls -la

# 디렉토리 이동
cd /path/to/dir

# 파일/폴더 생성
touch file.txt
mkdir folder

# 복사/이동/삭제
cp source dest
mv source dest
rm file.txt
rm -rf folder
```

### 파일 내용 보기
```bash
# 전체 내용
cat file.txt

# 처음/끝 부분
head -n 10 file.txt
tail -n 10 file.txt

# 실시간 로그 보기
tail -f log.txt

# 검색
grep "pattern" file.txt
grep -r "pattern" ./
```

### 프로세스 관리
```bash
# 프로세스 목록
ps aux

# 특정 프로세스 찾기
ps aux | grep nginx

# 프로세스 종료
kill PID
kill -9 PID

# 백그라운드 실행
nohup command &
```

### 권한 관리
```bash
# 권한 변경
chmod 755 script.sh
chmod +x script.sh

# 소유자 변경
chown user:group file.txt
```

### 네트워크
```bash
# 네트워크 상태
ifconfig
ip addr

# 포트 확인
netstat -tulpn
lsof -i :8080

# 연결 테스트
ping google.com
curl http://example.com
```

## 유용한 단축키

| 단축키 | 기능 |
|--------|------|
| Ctrl+C | 명령 중단 |
| Ctrl+Z | 백그라운드로 |
| Ctrl+R | 명령 검색 |
| Tab | 자동완성 |

Linux는 개발자의 필수 도구입니다!"""

    # Kubernetes 관련
    if "kubernetes" in message_lower or "k8s" in message_lower:
        return """# Kubernetes (K8s) 기초

**Kubernetes**는 컨테이너 오케스트레이션 플랫폼입니다.

## 핵심 개념

### 기본 오브젝트
- **Pod**: 컨테이너 실행 단위
- **Service**: 네트워크 엔드포인트
- **Deployment**: Pod 관리/배포
- **ConfigMap/Secret**: 설정 관리

## kubectl 명령어

```bash
# 클러스터 정보
kubectl cluster-info

# 리소스 조회
kubectl get pods
kubectl get services
kubectl get deployments

# 상세 정보
kubectl describe pod <pod-name>

# 로그 확인
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # 실시간

# Pod 접속
kubectl exec -it <pod-name> -- /bin/bash
```

## 매니페스트 예시

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:1.0
        ports:
        - containerPort: 8080
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

## 유용한 명령어

```bash
# 리소스 적용
kubectl apply -f deployment.yaml

# 스케일링
kubectl scale deployment my-app --replicas=5

# 롤링 업데이트
kubectl set image deployment/my-app my-app=my-app:2.0

# 롤백
kubectl rollout undo deployment/my-app
```

Kubernetes는 대규모 서비스 운영의 표준입니다!"""

    # CI/CD 관련
    if (
        "ci/cd" in message_lower
        or "cicd" in message_lower
        or "github actions" in message_lower
        or "jenkins" in message_lower
    ):
        return """# CI/CD 파이프라인

**CI/CD**는 지속적 통합(Continuous Integration)과 지속적 배포(Continuous Deployment)입니다.

## 개념

| 단계 | 설명 |
|------|------|
| CI | 코드 통합, 테스트 자동화 |
| CD | 자동 배포 |

## GitHub Actions 예시

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying..."
          # 배포 스크립트
```

## Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

## 모범 사례

1. **작은 커밋**: 자주, 작은 단위로 커밋
2. **자동화된 테스트**: 모든 변경사항 테스트
3. **환경 분리**: dev → staging → production
4. **롤백 계획**: 빠른 롤백 가능하도록

CI/CD는 현대 소프트웨어 개발의 필수입니다!"""

    # 정규표현식 관련
    if (
        "정규표현식" in message_lower
        or "regex" in message_lower
        or "정규식" in message_lower
    ):
        return """# 정규표현식 (Regex) 가이드

**정규표현식**은 문자열 패턴을 표현하는 방법입니다.

## 기본 문법

| 패턴 | 설명 | 예시 |
|------|------|------|
| `.` | 아무 문자 1개 | `a.c` → abc, adc |
| `*` | 0회 이상 반복 | `ab*` → a, ab, abb |
| `+` | 1회 이상 반복 | `ab+` → ab, abb |
| `?` | 0 또는 1회 | `ab?` → a, ab |
| `^` | 문자열 시작 | `^Hello` |
| `$` | 문자열 끝 | `World$` |
| `[]` | 문자 클래스 | `[abc]` → a, b, c |
| `\\d` | 숫자 | `[0-9]` |
| `\\w` | 단어 문자 | `[a-zA-Z0-9_]` |
| `\\s` | 공백 | 스페이스, 탭, 줄바꿈 |

## 자주 쓰는 패턴

```python
import re

# 이메일
email = r'^[\\w.-]+@[\\w.-]+\\.\\w+$'

# 전화번호 (한국)
phone = r'^01[0-9]-?\\d{3,4}-?\\d{4}$'

# URL
url = r'https?://[\\w.-]+(?:/[\\w.-]*)*'

# 날짜 (YYYY-MM-DD)
date = r'^\\d{4}-\\d{2}-\\d{2}$'

# IP 주소
ip = r'^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$'
```

## Python 예제

```python
import re

text = "이메일: user@example.com, 전화: 010-1234-5678"

# 검색
match = re.search(r'\\d{3}-\\d{4}-\\d{4}', text)
if match:
    print(match.group())  # 010-1234-5678

# 모두 찾기
emails = re.findall(r'[\\w.-]+@[\\w.-]+', text)

# 치환
result = re.sub(r'\\d', '*', text)

# 분리
parts = re.split(r',\\s*', text)
```

## JavaScript 예제

```javascript
const text = "Hello World 123";

// 검색
const match = text.match(/\\d+/);

// 테스트
/^Hello/.test(text);  // true

// 치환
text.replace(/\\d+/g, 'XXX');

// 분리
text.split(/\\s+/);
```

정규표현식은 텍스트 처리의 강력한 도구입니다!"""

    # 보안 관련
    if (
        "보안" in message_lower
        or "security" in message_lower
        or "해킹" in message_lower
    ):
        return """# 웹 보안 기초

웹 애플리케이션 보안의 핵심 개념과 방어 방법입니다.

## 주요 취약점 (OWASP Top 10)

### 1. SQL Injection
```python
# ❌ 취약한 코드
query = f"SELECT * FROM users WHERE id = {user_input}"

# ✅ 안전한 코드 (Parameterized Query)
cursor.execute("SELECT * FROM users WHERE id = ?", (user_input,))
```

### 2. XSS (Cross-Site Scripting)
```javascript
// ❌ 취약한 코드
element.innerHTML = userInput;

// ✅ 안전한 코드
element.textContent = userInput;
// 또는 HTML 이스케이프 처리
```

### 3. CSRF (Cross-Site Request Forgery)
```html
<!-- CSRF 토큰 사용 -->
<form method="POST">
    <input type="hidden" name="csrf_token" value="{{csrf_token}}">
</form>
```

## 인증/인가

### JWT (JSON Web Token)
```javascript
// 토큰 생성
const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
    expiresIn: '1h'
});

// 토큰 검증
const decoded = jwt.verify(token, SECRET_KEY);
```

### 비밀번호 해싱
```python
import bcrypt

# 해싱
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# 검증
bcrypt.checkpw(password.encode(), hashed)
```

## 보안 헤더

```python
# FastAPI 예시
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# 보안 헤더 설정
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

## 체크리스트

- [ ] HTTPS 사용
- [ ] 입력값 검증
- [ ] SQL Parameterized Query
- [ ] XSS 방지 (이스케이프)
- [ ] CSRF 토큰
- [ ] 안전한 비밀번호 저장
- [ ] 적절한 에러 처리

보안은 개발의 모든 단계에서 고려해야 합니다!"""

    return None  # 지식 베이스에 없는 주제


def generate_intelligent_response(
    message: str, quality: str, context: Optional[Dict[str, Any]] = None
) -> str:
    """지능형 응답 생성 - 구조화된 고품질 응답 생성 (폴백용)"""
    # LLM 서비스 호출은 generate_chat_response에서 이미 시도됨
    # 여기서는 지식 기반 응답 생성

    logger.info("📝 지식 기반 응답 생성기 사용")

    # 주제별 지식 베이스 응답 시도
    knowledge_response = _generate_knowledge_based_response(message, quality)
    if knowledge_response:
        return knowledge_response

    # 폴백: 구조화된 응답 생성
    logger.info("📝 폴백: 구조화된 응답 생성기 사용")

    message_lower = message.lower()

    # 질문 감지
    is_question = any(
        keyword in message_lower
        for keyword in [
            "?",
            "질문",
            "물어",
            "궁금",
            "어떻게",
            "왜",
            "언제",
            "어디",
            "누구",
            "무엇",
        ]
    )

    # 생성 요청 감지
    is_generation = any(
        keyword in message_lower
        for keyword in ["생성", "만들어", "작성", "해줘", "해주세요", "부탁"]
    )

    # 글쓰기 요청 감지
    is_writing = any(
        keyword in message_lower
        for keyword in [
            "글",
            "작성",
            "에세이",
            "블로그",
            "문서",
            "내용",
            "텍스트",
            "스토리",
            "시",
            "소설",
        ]
    )

    if is_writing:
        # 글쓰기 응답
        if quality == "ultimate":
            return f"""# {message}

{message}에 대한 상세한 글을 작성해드리겠습니다.

## 주요 내용

이 주제에 대해 깊이 있게 다루어보겠습니다.

### 1. 핵심 개념

{message}의 핵심 개념을 먼저 살펴보겠습니다.

### 2. 상세 분석

이제 더 자세히 분석해보겠습니다.

### 3. 실용적 적용

실제로 어떻게 활용할 수 있는지 알아보겠습니다.

## 결론

{message}에 대해 종합적으로 정리했습니다. 추가로 궁금한 점이 있으시면 언제든지 물어보세요."""

        elif quality == "enhanced":
            return f"""# {message}

{message}에 대한 글을 작성해드리겠습니다.

## 개요

이 주제에 대해 설명드리겠습니다.

## 주요 내용

{message}의 주요 내용을 정리했습니다.

## 결론

{message}에 대해 요약했습니다."""

        else:
            return f"{message}에 대한 글을 작성해드리겠습니다.\n\n{message}에 대해 설명드리겠습니다."

    elif is_question:
        # 질문 응답 - 개선된 버전 (긴 질문과 여러 요구사항 처리)
        # 여러 요구사항이 있는지 확인
        has_numbered_requirements = bool(re.search(r"\d+[\)\.]", message))
        has_ordered_requirements = any(
            sep in message for sep in ["첫째", "둘째", "셋째", "넷째", "다섯째"]
        )
        is_long_question = len(message) > 200

        if has_numbered_requirements or has_ordered_requirements or is_long_question:
            # 여러 요구사항이 있는 경우 구조화된 답변 생성
            answer_parts = []
            answer_parts.append(
                f"# {message[:100]}{'...' if len(message) > 100 else ''}에 대한 답변\n"
            )
            answer_parts.append(f"\n{message}에 대해 상세히 답변드리겠습니다.\n")

            if has_numbered_requirements:
                # 숫자로 된 요구사항 처리
                numbered_matches = re.findall(
                    r"(\d+)[\)\.]\s*([^0-9]+?)(?=\d+[\)\.]|$)", message, re.DOTALL
                )
                if numbered_matches:
                    answer_parts.append("## 요구사항별 답변\n\n")
                    for num, content in numbered_matches[:6]:
                        content = content.strip()
                        if content:
                            answer_parts.append(
                                f"### {num}. {content[:60]}{'...' if len(content) > 60 else ''}\n\n"
                            )
                            answer_parts.append(
                                f"{content}에 대해 설명드리겠습니다.\n\n"
                            )
                            answer_parts.append(
                                "이 주제는 다음과 같은 측면에서 접근할 수 있습니다:\n\n"
                            )
                            answer_parts.append(
                                f"1. **핵심 개념**: {content}의 기본 개념과 정의\n"
                            )
                            answer_parts.append(
                                f"2. **주요 특징**: {content}의 특징과 원리\n"
                            )
                            answer_parts.append(
                                f"3. **실제 사례**: {content}와 관련된 구체적인 사례\n"
                            )
                            answer_parts.append(
                                f"4. **시사점**: {content}가 가지는 의미와 향후 전망\n\n"
                            )
                            if (
                                num != numbered_matches[-1][0]
                                if numbered_matches
                                else True
                            ):
                                answer_parts.append("---\n\n")
                    return "\n".join(answer_parts)

            if has_ordered_requirements:
                # 순서 표현이 있는 경우
                ordered_parts = re.split(
                    r"\s*(?:첫째|둘째|셋째|넷째|다섯째)[,\.]\s*", message
                )
                if len(ordered_parts) > 1:
                    answer_parts.append("## 요구사항별 답변\n\n")
                    for i, part in enumerate(ordered_parts[1:6], 1):  # 최대 5개
                        part = part.strip()
                        if part:
                            answer_parts.append(
                                f"### {i}. {part[:60]}{'...' if len(part) > 60 else ''}\n\n"
                            )
                            answer_parts.append(f"{part}에 대해 설명드리겠습니다.\n\n")
                            answer_parts.append(
                                "이 주제는 다음과 같은 측면에서 접근할 수 있습니다:\n\n"
                            )
                            answer_parts.append("1. **핵심 개념**: 기본 개념과 정의\n")
                            answer_parts.append("2. **주요 특징**: 특징과 원리\n")
                            answer_parts.append("3. **실제 사례**: 구체적인 사례\n")
                            answer_parts.append("4. **시사점**: 의미와 향후 전망\n\n")
                            if i < len(ordered_parts[1:6]):
                                answer_parts.append("---\n\n")
                    return "\n".join(answer_parts)

            # 일반적인 긴 질문에 대한 답변
            answer_parts.append("## 상세 답변\n\n")
            answer_parts.append("이 질문에 대해 다음과 같이 답변드리겠습니다:\n\n")
            answer_parts.append("### 1. 핵심 개념\n\n")
            answer_parts.append(
                f"먼저 질문의 핵심 개념을 정리하면, {message[:100]}와 관련된 주요 개념들을 이해하는 것이 중요합니다.\n\n"
            )
            answer_parts.append("### 2. 배경과 맥락\n\n")
            answer_parts.append(
                "이 주제의 배경과 맥락을 살펴보면, 역사적, 사회적, 경제적 측면에서 다양한 관점이 존재합니다.\n\n"
            )
            answer_parts.append("### 3. 주요 내용\n\n")
            answer_parts.append("특히 중요한 내용들을 정리하면 다음과 같습니다.\n\n")
            answer_parts.append("### 4. 시사점과 전망\n\n")
            answer_parts.append(
                "이 주제는 현재와 미래에 중요한 의미를 가지며, 다양한 측면에서 고려해야 할 사항들이 있습니다.\n\n"
            )

            return "\n".join(answer_parts)

        # 일반 질문에 대한 답변
        if quality == "ultimate":
            return f"""# {message}에 대한 답변

{message}에 대해 상세히 답변드리겠습니다.

## 핵심 답변

이 질문에 대한 핵심 답변은 다음과 같습니다.

## 상세 설명

더 자세히 설명드리면:

1. **첫 번째 관점**: 이 질문을 첫 번째 관점에서 보면...
2. **두 번째 관점**: 다른 관점에서 보면...
3. **실용적 적용**: 실제로 어떻게 활용할 수 있는지...

## 추가 정보

관련된 추가 정보가 있다면:

- 관련 개념
- 참고 자료
- 실용적 팁

## 결론

{message}에 대해 종합적으로 답변드렸습니다. 추가 질문이 있으시면 언제든지 물어보세요."""

        elif quality == "enhanced":
            # 더 유용한 안내 메시지 제공
            import random

            tips = [
                "더 구체적인 질문을 해주시면 정확한 답변을 드릴 수 있습니다.",
                "관련 기술이나 분야를 언급해주시면 더 도움이 됩니다.",
                "예시나 상황을 함께 설명해주시면 좋습니다.",
            ]
            tip = random.choice(tips)

            return f"""# {message[:50]}{"..." if len(message) > 50 else ""}에 대해

죄송합니다. 이 주제에 대한 상세한 정보를 제공하기 어렵습니다.

## 제가 잘 답변할 수 있는 주제들

### 💻 프로그래밍
- **Python**: 문법, 웹 크롤러, 데이터 분석
- **JavaScript/TypeScript**: 기초, React, Node.js
- **HTML/CSS**: 웹 페이지 구조와 스타일링

### 🛠️ 개발 도구
- **Git**: 버전 관리 명령어
- **Docker**: 컨테이너 기초
- **SQL**: 데이터베이스 쿼리

### 🤖 AI/ML
- 머신러닝 개념
- 알고리즘 기초

### 📝 일반
- 시간/날짜 정보
- 간단한 계산
- 개발자 농담 😄

## 팁
{tip}

어떤 주제로 다시 질문해주시겠어요?"""

        else:
            return f"""**{message[:30]}{"..." if len(message) > 30 else ""}**에 대한 답변을 준비하지 못했습니다.

Python, JavaScript, React, Docker, Git, SQL 등 프로그래밍 관련 질문을 해보세요!"""

    elif is_generation:
        # 생성 요청 응답
        return f"""요청하신 '{message}'를 생성해드리겠습니다.

## 생성된 내용

{message}에 대한 내용을 생성했습니다.

### 주요 특징

- 상세한 설명
- 실용적인 정보
- 추가 참고사항

## 결론

{message}에 대한 내용을 생성했습니다. 추가로 수정하거나 보완할 부분이 있으시면 말씀해주세요."""

    else:
        # 일반 대화 응답
        if quality == "ultimate":
            return f"""# {message}에 대한 응답

{message}에 대해 상세히 설명드리겠습니다.

## 개요

이 주제에 대해 종합적으로 다루어보겠습니다.

## 주요 내용

### 1. 핵심 개념

{message}의 핵심 개념을 먼저 살펴보겠습니다.

### 2. 상세 분석

이제 더 자세히 분석해보겠습니다.

### 3. 실용적 적용

실제로 어떻게 활용할 수 있는지 알아보겠습니다.

## 추가 정보

관련된 추가 정보:

- 관련 개념
- 참고 자료
- 실용적 팁

## 결론

{message}에 대해 종합적으로 정리했습니다. 추가로 궁금한 점이 있으시면 언제든지 물어보세요."""

        elif quality == "enhanced":
            return f"""# {message}에 대한 응답

{message}에 대해 설명드리겠습니다.

## 주요 내용

이 주제에 대해 설명드리겠습니다.

## 상세 설명

{message}의 주요 내용을 정리했습니다.

## 결론

{message}에 대해 요약했습니다."""

        else:
            return f"{message}에 대해 답변드리겠습니다.\n\n{message}에 대한 내용입니다."


@router.get("/md/search", summary="MD 문서 검색")
async def search_md_documents(query: str, max_results: int = 5):
    """
    MD 문서 검색 API
    프로젝트의 MD 파일에서 관련 내용 검색
    """
    try:
        from api.md_document_indexer import get_md_indexer

        indexer = get_md_indexer()
        results = indexer.search(query, max_results=max_results)

        return success_response(
            {"query": query, "results": results, "count": len(results)}
        )
    except Exception as e:
        logger.error(f"MD 문서 검색 오류: {e}")
        return _json_error(
            error=f"검색 중 오류가 발생했습니다: {str(e)}", status_code=500
        )


@router.post("/md/reindex", summary="MD 문서 재인덱싱")
async def reindex_md_documents():
    """
    MD 문서 재인덱싱 API
    모든 MD 파일을 다시 인덱싱
    """
    try:
        from api.md_document_indexer import reindex_md_files

        indexer = reindex_md_files()
        indexed_count = len(indexer.index)

        return success_response(
            {
                "message": "재인덱싱이 완료되었습니다.",
                "indexed_files": indexed_count,
                "timestamp": datetime.now().isoformat(),
            }
        )
    except Exception as e:
        logger.error(f"MD 문서 재인덱싱 오류: {e}")
        return _json_error(
            error=f"재인덱싱 중 오류가 발생했습니다: {str(e)}", status_code=500
        )


@router.get("/md/stats", summary="MD 문서 인덱스 통계")
async def get_md_stats():
    """
    MD 문서 인덱스 통계 조회
    """
    try:
        from api.md_document_indexer import get_md_indexer
        from api.md_document_stats import get_document_stats

        indexer = get_md_indexer()
        stats_analyzer = get_document_stats()

        # 기본 통계
        basic_stats = {
            "indexed_files": len(indexer.index),
            "last_indexed": indexer.last_indexed,
            "total_files": len(indexer.find_md_files()),
        }

        # 상세 통계
        overview = stats_analyzer.get_overview_stats()
        top_files = stats_analyzer.get_top_files_by_size(limit=5)
        file_distribution = stats_analyzer.get_file_types_distribution()

        stats = {
            **basic_stats,
            "overview": overview,
            "top_files_by_size": top_files,
            "file_distribution": file_distribution,
        }

        return success_response(stats)
    except Exception as e:
        logger.error(f"MD 통계 조회 오류: {e}")
        return _json_error(
            error=f"통계 조회 중 오류가 발생했습니다: {str(e)}", status_code=500
        )


def generate_default_response(message: str) -> str:
    """기본 응답 생성 (마크다운 형식) - 개선된 버전"""
    logger.info(f"🔄 generate_default_response 호출: message_length={len(message)}")

    # intelligent_answer_generator를 사용하여 더 나은 기본 응답 생성 시도
    try:
        from api.intelligent_answer_generator import intelligent_answer_generator
        import asyncio

        # 동기 함수에서 비동기 함수 호출
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        # 간단한 분석 수행
        analysis = intelligent_answer_generator.analyze_request(message, {})
        logger.info(
            f"📊 기본 응답용 분석 완료: 도메인={analysis.get('domain')}, 타입={analysis.get('message_type')}"
        )

        # 비동기 답변 생성 시도 (타임아웃 설정)
        try:
            logger.info(
                "🔄 기본 응답 생성 시도: intelligent_answer_generator.generate_answer 호출"
            )
            # 긴 질문이나 복잡한 요청의 경우 타임아웃을 더 길게 설정
            message_length = len(message)
            is_long_question = message_length > 500
            has_multiple_requirements = bool(
                re.search(r"(\d+[\).]|첫째|둘째|셋째|넷째|다섯째)", message)
            )
            dynamic_timeout = (
                60.0 if (is_long_question or has_multiple_requirements) else 30.0
            )  # 긴 질문: 60초, 일반: 30초

            response = loop.run_until_complete(
                asyncio.wait_for(
                    intelligent_answer_generator.generate_answer(
                        message, analysis, "enhanced", {}
                    ),
                    timeout=dynamic_timeout,
                )
            )
            logger.info(
                f"📥 기본 응답 생성 완료: response_length={len(response) if response else 0}"
            )
            if response and len(response.strip()) >= 10:
                # "응답:" 접두사 제거
                if response.strip().startswith("응답:"):
                    response = response.strip()[3:].strip()
                return response
            else:
                logger.warning(
                    f"⚠️ 생성된 응답이 너무 짧음: {len(response) if response else 0}자"
                )
        except asyncio.TimeoutError:
            logger.warning("⚠️ 기본 응답 생성 타임아웃 (15초 초과)")
        except Exception as e:
            logger.warning(f"⚠️ 기본 응답 생성 중 오류: {e}")
    except Exception as e:
        logger.warning(f"⚠️ intelligent_answer_generator 사용 실패: {e}")

    # 폴백: 질문/요구를 되풀이하는 템플릿 출력 방지 (사용자 관점에서 최소 안내만)
    message_lower = message.lower()
    has_many_requirements = bool(re.search(r"\d+[\)\.]", message)) or any(
        sep in message for sep in ["첫째", "둘째", "셋째", "넷째", "다섯째"]
    )
    is_long_question = len(message) > 200
    is_question = any(
        kw in message_lower
        for kw in [
            "?",
            "질문",
            "물어",
            "궁금",
            "어떻게",
            "왜",
            "언제",
            "어디",
            "누구",
            "무엇",
        ]
    )
    is_generation = any(
        kw in message_lower for kw in ["작성", "생성", "만들", "초안", "문서"]
    )

    if has_many_requirements or is_long_question:
        return (
            "요구사항이 많거나 메시지가 길어 답변 생성이 완료되지 않았습니다.\n\n"
            "- 핵심 질문 1개만 남기거나\n"
            "- 요구사항을 3개 이하로 줄여서\n"
            "다시 보내주시면 바로 답변하겠습니다."
        )

    if is_generation:
        return (
            "생성 요청을 처리하지 못했습니다.\n\n"
            "형식(예: 요약/체크리스트/공문), 분량(예: 5줄/1페이지), 대상(누구에게)을 알려주시면 다시 생성하겠습니다."
        )

    if is_question:
        return (
            "답변 생성을 완료하지 못했습니다.\n\n"
            "원하는 답의 범위(예: 절차/주의사항/예시) 중 1~2개만 지정해주시면 더 정확히 답변하겠습니다."
        )

    return "요청을 처리하는 중 문제가 발생했습니다. 핵심만 짧게 다시 보내주시면 이어서 처리하겠습니다."


# ─────────────────────────────────────────────────────────────────────────────
# 고급 응답 생성 엔진 (Gemini/ChatGPT 벤치마킹)
# ─────────────────────────────────────────────────────────────────────────────


def _analyze_query_intent(message: str) -> Dict[str, Any]:
    """
    질문의 의도, 유형, 복잡도를 분석합니다.
    Chain-of-Thought 기반 분석
    """
    msg = (message or "").strip()
    msg_lower = msg.lower()

    intent = {
        "type": "general",  # question, explanation, comparison, how_to, opinion, creative, analysis
        "complexity": "medium",  # simple, medium, complex
        "domain": "general",  # tech, business, science, health, lifestyle, etc.
        "expects_list": False,
        "expects_comparison": False,
        "expects_steps": False,
        "expects_example": False,
        "expects_opinion": False,
        "tone": "informative",  # informative, friendly, professional, casual
        "keywords": [],
    }

    # 질문 유형 분석
    if re.search(r"(어떻게|어떤 방법|방법이|하는 법|하려면)", msg):
        intent["type"] = "how_to"
        intent["expects_steps"] = True
    elif re.search(r"(왜|이유가|원인이|때문에)", msg):
        intent["type"] = "explanation"
    elif re.search(r"(비교|차이|vs|대|와의|와 비교)", msg):
        intent["type"] = "comparison"
        intent["expects_comparison"] = True
    elif re.search(r"(무엇|뭐|무슨|어떤 것)", msg):
        intent["type"] = "definition"
    elif re.search(r"(추천|제안|조언|어떤 게 좋|뭐가 좋)", msg):
        intent["type"] = "recommendation"
        intent["expects_list"] = True
    elif re.search(r"(장단점|장점과 단점|pros|cons)", msg):
        intent["type"] = "analysis"
        intent["expects_list"] = True
    elif re.search(r"(의견|생각|어떻게 생각|견해)", msg):
        intent["type"] = "opinion"
        intent["expects_opinion"] = True
    elif re.search(r"(예시|예를 들어|사례|케이스)", msg):
        intent["expects_example"] = True
    elif re.search(r"(만들어|작성해|생성해|써 ?줘|작성 ?해줘)", msg):
        intent["type"] = "creative"
    elif re.search(r"(설명해|알려줘|가르쳐|이해|궁금)", msg):
        intent["type"] = "explanation"

    # 복잡도 분석
    word_count = len(msg.split())
    question_count = msg.count("?")
    has_multiple_topics = bool(re.search(r"(그리고|또한|추가로|더불어)", msg))

    if word_count > 50 or question_count >= 3 or has_multiple_topics:
        intent["complexity"] = "complex"
    elif word_count < 15 and question_count <= 1:
        intent["complexity"] = "simple"

    # 도메인 분석
    domain_keywords = {
        "tech": [
            "코딩",
            "프로그래밍",
            "개발",
            "소프트웨어",
            "앱",
            "웹",
            "AI",
            "인공지능",
            "컴퓨터",
            "서버",
            "API",
            "데이터베이스",
        ],
        "business": [
            "회사",
            "창업",
            "투자",
            "주식",
            "경영",
            "마케팅",
            "비즈니스",
            "사업",
            "매출",
            "수익",
        ],
        "finance": [
            "부동산",
            "세금",
            "대출",
            "금리",
            "재테크",
            "자산",
            "펀드",
            "예금",
            "적금",
            "보험",
        ],
        "science": ["과학", "물리", "화학", "생물", "수학", "연구", "실험", "이론"],
        "health": [
            "건강",
            "운동",
            "다이어트",
            "영양",
            "의료",
            "병원",
            "질병",
            "치료",
            "약",
        ],
        "lifestyle": ["여행", "맛집", "취미", "문화", "예술", "음악", "영화", "책"],
        "education": ["공부", "학습", "시험", "자격증", "학교", "대학", "교육"],
        "legal": ["법률", "계약", "소송", "변호사", "권리", "의무", "규정"],
    }

    for domain, keywords in domain_keywords.items():
        if any(kw in msg for kw in keywords):
            intent["domain"] = domain
            break

    # 키워드 추출
    # 명사/핵심어 추출 (간단한 휴리스틱)
    potential_keywords = re.findall(r"[가-힣]{2,}(?:하다|되다|이다)?", msg)
    stopwords = {
        "것",
        "수",
        "등",
        "때",
        "중",
        "더",
        "또",
        "그",
        "이",
        "저",
        "뭐",
        "어떻게",
        "무엇",
        "왜",
    }
    intent["keywords"] = [w for w in potential_keywords if w not in stopwords][:10]

    return intent


def _generate_thinking_process(message: str, intent: Dict[str, Any]) -> str:
    """
    Chain-of-Thought 스타일의 사고 과정을 생성합니다.
    (내부 로직용, 응답에 직접 포함되지 않음)
    """
    thinking = []

    thinking.append(
        f"1. 질문 분석: {intent['type']} 유형의 {intent['complexity']} 복잡도 질문"
    )
    thinking.append(f"2. 도메인: {intent['domain']}")
    thinking.append(f"3. 핵심 키워드: {', '.join(intent['keywords'][:5])}")

    if intent["expects_steps"]:
        thinking.append("4. 단계별 설명이 필요함")
    if intent["expects_comparison"]:
        thinking.append("4. 비교 분석이 필요함")
    if intent["expects_list"]:
        thinking.append("4. 목록 형태 답변이 적절함")
    if intent["expects_example"]:
        thinking.append("4. 구체적 예시가 필요함")

    return "\n".join(thinking)


def _generate_structured_response(
    message: str,
    intent: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None,
    style: str = "balanced",
    perspective: str = None,
) -> str:
    """
    의도 분석 결과를 바탕으로 구조화된 고품질 응답을 생성합니다.
    """
    msg = message.strip()
    keywords = intent.get("keywords", [])
    query_type = intent.get("type", "general")
    complexity = intent.get("complexity", "medium")
    domain = intent.get("domain", "general")

    parts = []

    # 스타일에 따른 응답 길이 조절
    if style == "concise":
        max_sections = 2
        detail_level = "minimal"
    elif style == "comprehensive":
        max_sections = 6
        detail_level = "extensive"
    elif style == "detailed":
        max_sections = 4
        detail_level = "thorough"
    else:  # balanced
        max_sections = 3
        detail_level = "moderate"

    # 도입부 생성
    intro = _generate_intro(msg, query_type, keywords, perspective)
    parts.append(intro)

    # 본문 생성 (질문 유형에 따라)
    if query_type == "how_to":
        body = _generate_how_to_response(msg, keywords, detail_level, max_sections)
    elif query_type == "comparison":
        body = _generate_comparison_response(msg, keywords, detail_level)
    elif query_type == "explanation":
        body = _generate_explanation_response(
            msg, keywords, detail_level, max_sections, domain
        )
    elif query_type == "recommendation":
        body = _generate_recommendation_response(msg, keywords, detail_level)
    elif query_type == "analysis":
        body = _generate_analysis_response(msg, keywords, detail_level)
    elif query_type == "creative":
        body = _generate_creative_response(msg, keywords, detail_level, context)
    elif query_type == "opinion":
        body = _generate_opinion_response(msg, keywords, perspective)
    elif query_type == "definition":
        body = _generate_definition_response(msg, keywords, detail_level)
    else:
        body = _generate_general_response(
            msg, keywords, detail_level, max_sections, domain
        )

    parts.append(body)

    # 관점별 추가 내용
    if perspective and style != "concise":
        perspective_content = _add_perspective_content(msg, keywords, perspective)
        if perspective_content:
            parts.append(perspective_content)

    # 마무리
    if style != "concise":
        conclusion = _generate_conclusion(msg, query_type, keywords)
        parts.append(conclusion)

    return "\n\n".join(parts)


def _generate_intro(
    msg: str, query_type: str, keywords: List[str], perspective: str = None
) -> str:
    """도입부 생성"""
    topic = keywords[0] if keywords else msg[:30]

    intros = {
        "how_to": f"**{topic}**에 대해 실용적인 방법을 안내해 드리겠습니다.",
        "comparison": f"**{topic}**에 대한 비교 분석을 제공해 드리겠습니다.",
        "explanation": f"**{topic}**에 대해 명확하게 설명해 드리겠습니다.",
        "recommendation": f"**{topic}**에 대한 추천과 조언을 드리겠습니다.",
        "analysis": f"**{topic}**에 대해 다각도로 분석해 드리겠습니다.",
        "creative": f"요청하신 **{topic}** 관련 내용을 작성해 드리겠습니다.",
        "opinion": f"**{topic}**에 대한 다양한 관점을 공유해 드리겠습니다.",
        "definition": f"**{topic}**이(가) 무엇인지 설명해 드리겠습니다.",
        "general": f"**{topic}**에 대해 답변드리겠습니다.",
    }

    intro = intros.get(query_type, intros["general"])

    if perspective:
        perspective_hints = {
            "practical": "실용적인 관점에서 접근하여 ",
            "theoretical": "이론적 토대를 바탕으로 ",
            "creative": "창의적인 시각으로 ",
            "critical": "비판적 분석을 통해 ",
            "empathetic": "공감하는 마음으로 ",
        }
        hint = perspective_hints.get(perspective, "")
        intro = hint + intro

    return intro


def _generate_how_to_response(
    msg: str, keywords: List[str], detail_level: str, max_sections: int
) -> str:
    """방법/절차 설명 응답 생성"""
    topic = keywords[0] if keywords else "요청하신 작업"

    parts = []
    parts.append(f"## {topic} 방법\n")

    # 단계 수 결정
    if detail_level == "minimal":
        step_count = 3
    elif detail_level == "extensive":
        step_count = 7
    elif detail_level == "thorough":
        step_count = 5
    else:
        step_count = 4

    parts.append("### 단계별 가이드\n")

    step_templates = [
        ("준비 단계", "시작하기 전에 필요한 사항들을 확인하고 준비합니다."),
        ("기본 설정", "기본적인 설정과 환경을 구성합니다."),
        ("핵심 실행", "본격적으로 핵심 작업을 수행합니다."),
        ("세부 조정", "세부 사항을 조정하고 최적화합니다."),
        ("검증 단계", "결과를 확인하고 필요시 수정합니다."),
        ("완료 및 정리", "작업을 마무리하고 정리합니다."),
        ("추가 개선", "더 나은 결과를 위한 추가 개선 사항을 적용합니다."),
    ]

    for i, (title, desc) in enumerate(step_templates[:step_count], 1):
        parts.append(f"**{i}. {title}**")
        parts.append(f"   - {desc}")
        if detail_level in ["thorough", "extensive"]:
            parts.append(f"   - 이 단계에서는 {topic}의 핵심 요소를 다룹니다.")
        parts.append("")

    # 주의사항
    if detail_level != "minimal":
        parts.append("### 주의사항\n")
        parts.append(f"- {topic} 진행 시 꼼꼼한 확인이 필요합니다.")
        parts.append("- 각 단계를 순서대로 진행하는 것이 좋습니다.")
        if detail_level == "extensive":
            parts.append("- 문제 발생 시 이전 단계로 돌아가 점검합니다.")
            parts.append("- 전문가 조언이 필요한 경우 상담을 권장합니다.")

    return "\n".join(parts)


def _generate_comparison_response(
    msg: str, keywords: List[str], detail_level: str
) -> str:
    """비교 분석 응답 생성"""
    parts = []
    parts.append("## 비교 분석\n")

    if len(keywords) >= 2:
        item_a, item_b = keywords[0], keywords[1]
    else:
        item_a, item_b = "A", "B"

    parts.append(f"### {item_a} vs {item_b}\n")

    parts.append("| 항목 | " + item_a + " | " + item_b + " |")
    parts.append("|------|------|------|")
    parts.append(f"| **특징** | {item_a}의 주요 특징 | {item_b}의 주요 특징 |")
    parts.append(f"| **장점** | {item_a}의 강점 | {item_b}의 강점 |")
    parts.append(f"| **단점** | {item_a}의 약점 | {item_b}의 약점 |")
    parts.append(f"| **적합 대상** | {item_a}가 적합한 경우 | {item_b}가 적합한 경우 |")
    parts.append("")

    parts.append("### 선택 가이드\n")
    parts.append(f"- **{item_a}**를 선택하면 좋은 경우: 특정 요구사항에 맞을 때")
    parts.append(f"- **{item_b}**를 선택하면 좋은 경우: 다른 요구사항에 맞을 때")

    if detail_level in ["thorough", "extensive"]:
        parts.append("")
        parts.append("### 결론\n")
        parts.append(
            "두 옵션 모두 각자의 장단점이 있으므로, 본인의 상황과 목적에 맞게 선택하는 것이 중요합니다."
        )

    return "\n".join(parts)


def _generate_explanation_response(
    msg: str, keywords: List[str], detail_level: str, max_sections: int, domain: str
) -> str:
    """설명 응답 생성"""
    topic = keywords[0] if keywords else "해당 주제"
    parts = []

    parts.append(f"## {topic}에 대한 설명\n")

    # 개념 정의
    parts.append("### 개념\n")
    parts.append(
        f"**{topic}**은(는) {domain} 분야에서 중요한 개념으로, 다음과 같이 이해할 수 있습니다.\n"
    )

    # 핵심 내용
    parts.append("### 핵심 내용\n")
    parts.append(f"1. **기본 원리**: {topic}의 기본적인 작동 원리와 메커니즘")
    parts.append(f"2. **주요 특징**: {topic}이 가지는 고유한 특성")
    parts.append(f"3. **활용 분야**: {topic}이 적용되는 다양한 영역")
    parts.append("")

    if detail_level in ["thorough", "extensive"]:
        parts.append("### 배경 지식\n")
        parts.append(
            f"{topic}을(를) 이해하기 위해서는 관련 배경 지식이 도움이 됩니다.\n"
        )

        parts.append("### 실제 적용\n")
        parts.append(f"실제로 {topic}은(는) 다양한 상황에서 활용됩니다:\n")
        parts.append("- 일상생활에서의 적용")
        parts.append("- 전문 분야에서의 활용")
        parts.append("- 미래 발전 가능성")

    return "\n".join(parts)


def _generate_recommendation_response(
    msg: str, keywords: List[str], detail_level: str
) -> str:
    """추천 응답 생성"""
    topic = keywords[0] if keywords else "요청하신 항목"
    parts = []

    parts.append(f"## {topic} 추천\n")

    parts.append("### 추천 목록\n")

    recommendations = [
        ("첫 번째 추천", "가장 기본적이고 안정적인 선택입니다.", "초보자, 안정성 중시"),
        ("두 번째 추천", "균형 잡힌 성능과 가성비를 제공합니다.", "일반 사용자"),
        (
            "세 번째 추천",
            "고급 기능과 뛰어난 성능을 원할 때 적합합니다.",
            "전문가, 고성능 필요",
        ),
    ]

    for i, (title, desc, suitable) in enumerate(recommendations, 1):
        parts.append(f"**{i}. {title}**")
        parts.append(f"   - 특징: {desc}")
        parts.append(f"   - 적합 대상: {suitable}")
        parts.append("")

    parts.append("### 선택 팁\n")
    parts.append("- 본인의 예산과 필요를 먼저 파악하세요.")
    parts.append("- 리뷰와 평가를 참고하세요.")
    parts.append("- 장기적인 관점에서 선택하세요.")

    return "\n".join(parts)


def _generate_analysis_response(
    msg: str, keywords: List[str], detail_level: str
) -> str:
    """분석 응답 생성"""
    topic = keywords[0] if keywords else "해당 주제"
    parts = []

    parts.append(f"## {topic} 분석\n")

    # 장점
    parts.append("### 장점\n")
    parts.append(f"1. **핵심 강점**: {topic}의 가장 큰 장점")
    parts.append(f"2. **부가 혜택**: 추가적으로 얻을 수 있는 이점")
    parts.append(f"3. **경쟁력**: 다른 대안 대비 우수한 점")
    parts.append("")

    # 단점
    parts.append("### 단점\n")
    parts.append(f"1. **주요 약점**: 개선이 필요한 부분")
    parts.append(f"2. **제한 사항**: 사용 시 고려해야 할 제약")
    parts.append(f"3. **위험 요소**: 주의가 필요한 점")
    parts.append("")

    # 종합 평가
    parts.append("### 종합 평가\n")
    parts.append(
        f"{topic}은(는) 장단점이 명확하므로, 본인의 상황에 맞게 판단하는 것이 중요합니다."
    )

    return "\n".join(parts)


def _generate_creative_response(
    msg: str, keywords: List[str], detail_level: str, context: Optional[Dict[str, Any]]
) -> str:
    """창작 응답 생성"""
    topic = keywords[0] if keywords else "요청하신 내용"
    parts = []

    parts.append(f"## {topic} 작성\n")
    parts.append(f"요청하신 내용을 바탕으로 작성했습니다.\n")

    parts.append("---\n")
    parts.append(f"*{topic}에 대한 내용*\n")
    parts.append("여기에 요청하신 내용이 들어갑니다.")
    parts.append(
        "구체적인 요구사항을 알려주시면 더 정확한 결과물을 제공해 드릴 수 있습니다."
    )
    parts.append("\n---\n")

    parts.append("### 수정/보완 사항\n")
    parts.append("- 특정 부분 수정이 필요하시면 말씀해주세요.")
    parts.append("- 다른 스타일이나 톤으로 변경도 가능합니다.")

    return "\n".join(parts)


def _generate_opinion_response(
    msg: str, keywords: List[str], perspective: str = None
) -> str:
    """의견 응답 생성"""
    topic = keywords[0] if keywords else "해당 주제"
    parts = []

    parts.append(f"## {topic}에 대한 다양한 관점\n")

    perspectives_list = [
        ("긍정적 관점", f"{topic}은(는) 여러 측면에서 긍정적인 영향을 미칩니다."),
        ("신중한 관점", f"{topic}에 대해서는 신중한 접근이 필요합니다."),
        (
            "균형적 관점",
            f"{topic}은(는) 장단점이 공존하므로 상황에 따른 판단이 중요합니다.",
        ),
    ]

    for title, desc in perspectives_list:
        parts.append(f"### {title}\n")
        parts.append(f"{desc}\n")

    parts.append("### 개인적 의견\n")
    if perspective == "critical":
        parts.append(f"{topic}에 대해서는 비판적으로 검토할 필요가 있습니다.")
    elif perspective == "practical":
        parts.append(f"{topic}의 실용적 가치에 초점을 맞춰 판단하는 것이 좋습니다.")
    else:
        parts.append(
            f"{topic}에 대해서는 다양한 관점을 고려하여 본인만의 판단을 내리시길 권합니다."
        )

    return "\n".join(parts)


def _generate_definition_response(
    msg: str, keywords: List[str], detail_level: str
) -> str:
    """정의 응답 생성"""
    topic = keywords[0] if keywords else "해당 용어"
    parts = []

    parts.append(f"## {topic}란?\n")
    parts.append(f"**{topic}**은(는) 다음과 같이 정의할 수 있습니다.\n")

    parts.append("### 기본 정의\n")
    parts.append(
        f"{topic}은(는) [분야]에서 사용되는 개념으로, [핵심 의미]를 나타냅니다.\n"
    )

    parts.append("### 주요 특징\n")
    parts.append(f"- {topic}의 첫 번째 특징")
    parts.append(f"- {topic}의 두 번째 특징")
    parts.append(f"- {topic}의 세 번째 특징")
    parts.append("")

    if detail_level != "minimal":
        parts.append("### 예시\n")
        parts.append(f"{topic}을(를) 이해하기 쉬운 예시로 설명하면:\n")
        parts.append(f"- 일상생활에서: [예시]")
        parts.append(f"- 전문 분야에서: [예시]")

    return "\n".join(parts)


def _generate_general_response(
    msg: str, keywords: List[str], detail_level: str, max_sections: int, domain: str
) -> str:
    """일반 응답 생성"""
    topic = keywords[0] if keywords else msg[:30]
    parts = []

    parts.append(f"## {topic}에 대한 답변\n")

    parts.append("### 핵심 내용\n")
    parts.append(f"{topic}에 대해 핵심적인 내용을 정리하면 다음과 같습니다.\n")

    parts.append("### 상세 설명\n")
    parts.append("1. **첫 번째 포인트**: 가장 중요한 내용")
    parts.append("2. **두 번째 포인트**: 관련된 추가 정보")
    parts.append("3. **세 번째 포인트**: 실용적인 측면")
    parts.append("")

    if detail_level in ["thorough", "extensive"]:
        parts.append("### 추가 정보\n")
        parts.append(f"- {topic} 관련 참고 사항")
        parts.append("- 더 깊이 있는 이해를 위한 팁")
        parts.append("- 관련 주제 연결")

    return "\n".join(parts)


def _add_perspective_content(msg: str, keywords: List[str], perspective: str) -> str:
    """관점별 추가 내용 생성"""
    topic = keywords[0] if keywords else "해당 주제"

    perspective_sections = {
        "practical": f"""### 실용적 적용
- **즉시 활용 방법**: {topic}을(를) 바로 적용할 수 있는 방법
- **구체적 행동 지침**: 실제로 시작하기 위한 첫 단계
- **예상 결과**: 적용 시 기대할 수 있는 효과""",
        "theoretical": f"""### 이론적 배경
- **학술적 기초**: {topic}의 이론적 토대
- **관련 연구**: 참고할 만한 연구 동향
- **개념적 프레임워크**: 체계적 이해를 위한 틀""",
        "creative": f"""### 창의적 접근
- **새로운 시각**: {topic}을(를) 다르게 바라보는 관점
- **혁신적 아이디어**: 기존과 다른 접근법
- **실험적 제안**: 시도해볼 만한 새로운 방법""",
        "critical": f"""### 비판적 검토
- **한계점 분석**: {topic}의 제한 사항
- **대안 검토**: 다른 옵션들과의 비교
- **위험 요소**: 주의해야 할 점들""",
        "empathetic": f"""### 공감적 이해
- **감정적 측면**: {topic}과(와) 관련된 감정적 요소
- **개인적 영향**: 개인에게 미치는 영향
- **지원 방안**: 도움이 될 수 있는 자원들""",
    }

    return perspective_sections.get(perspective, "")


def _generate_conclusion(msg: str, query_type: str, keywords: List[str]) -> str:
    """마무리 생성"""
    topic = keywords[0] if keywords else "해당 주제"

    conclusions = {
        "how_to": f"위 단계를 따라 진행하시면 {topic}을(를) 성공적으로 완료하실 수 있습니다. 추가 질문이 있으시면 말씀해주세요.",
        "comparison": "각 옵션의 특성을 고려하여 본인에게 맞는 선택을 하시길 바랍니다.",
        "explanation": f"{topic}에 대해 더 궁금한 점이 있으시면 언제든 질문해주세요.",
        "recommendation": "추천 드린 내용이 도움이 되셨으면 합니다. 더 구체적인 조건이 있으시면 알려주세요.",
        "analysis": "분석 내용을 참고하셔서 현명한 판단을 내리시길 바랍니다.",
        "creative": "작성한 내용이 만족스럽지 않으시면 수정 요청해주세요.",
        "opinion": "다양한 관점을 참고하시어 본인만의 의견을 정립하시길 바랍니다.",
        "definition": f"{topic}에 대한 이해에 도움이 되셨으면 합니다.",
        "general": "답변이 도움이 되셨으면 합니다. 추가 질문이 있으시면 언제든 물어보세요.",
    }

    return f"\n---\n\n**마무리**: {conclusions.get(query_type, conclusions['general'])}"


# ─────────────────────────────────────────────────────────────────────────────
# 다중 질문 분리 및 응답 스타일 처리 함수
# ─────────────────────────────────────────────────────────────────────────────


def _split_multiple_questions(message: str) -> List[str]:
    """
    메시지에서 여러 질문을 분리합니다.

    Returns:
        분리된 질문 목록 (단일 질문이면 원본 반환)
    """
    # 질문 분리 패턴들
    split_patterns = [
        r"(?:^|\n)\s*(?:\d+[\.\)]\s*)",  # 1. 또는 1) 형식
        r"(?:^|\n)\s*[-•◦▪]\s*",  # 불릿 포인트
        r"\s*(?:그리고|또한|그리고 또|추가로|아울러)\s*",  # 접속사
        r"\?\s+(?=[가-힣A-Za-z])",  # 물음표 후 새 문장
    ]

    questions = []
    current = message

    # 번호 매기기 패턴 확인
    numbered_pattern = re.compile(
        r"(?:^|\n)\s*(\d+)[\.\)]\s*(.+?)(?=(?:\n\s*\d+[\.\)])|$)", re.DOTALL
    )
    numbered_matches = numbered_pattern.findall(message)

    if len(numbered_matches) >= 2:
        questions = [match[1].strip() for match in numbered_matches if match[1].strip()]
        return questions if questions else [message]

    # 물음표로 분리 시도
    if message.count("?") >= 2:
        parts = re.split(r"\?\s*", message)
        questions = [p.strip() + "?" for p in parts if p.strip() and len(p.strip()) > 5]
        if len(questions) >= 2:
            return questions

    # "그리고", "또한" 등의 접속사로 분리
    connector_pattern = re.compile(
        r"\s*(?:그리고|또한|그리고\s*또|추가로|아울러|더불어)\s*", re.IGNORECASE
    )
    if connector_pattern.search(message):
        parts = connector_pattern.split(message)
        questions = [p.strip() for p in parts if p.strip() and len(p.strip()) > 10]
        if len(questions) >= 2:
            return questions

    return [message]  # 분리 불가 시 원본 반환


def _get_response_style_prompt(style: str, perspective: str = None) -> str:
    """
    응답 스타일과 관점에 따른 시스템 프롬프트를 생성합니다.
    """
    style_prompts = {
        "concise": (
            "간결하고 핵심적인 답변을 제공하세요. "
            "불필요한 설명을 피하고 요점만 명확하게 전달합니다. "
            "3-5문장 이내로 답변하세요."
        ),
        "balanced": (
            "균형 잡힌 답변을 제공하세요. "
            "핵심 내용과 함께 적절한 설명과 예시를 포함합니다. "
            "읽기 쉽게 구조화하여 답변하세요."
        ),
        "detailed": (
            "상세하고 포괄적인 답변을 제공하세요. "
            "배경 설명, 단계별 가이드, 예시, 주의사항을 포함합니다. "
            "필요한 경우 소제목이나 목록을 사용하여 구조화하세요."
        ),
        "comprehensive": (
            "매우 상세하고 종합적인 답변을 제공하세요. "
            "모든 관련 측면을 다루고, 깊이 있는 분석과 다양한 관점을 제시합니다. "
            "실제 사례, 전문적 조언, 추가 참고 자료를 포함하세요. "
            "긴 답변이 필요한 경우 주제별로 나누어 체계적으로 설명하세요."
        ),
    }

    perspective_prompts = {
        "practical": "실용적이고 현실적인 관점에서 답변하세요. 즉시 적용 가능한 조언과 구체적인 행동 방안을 제시합니다.",
        "theoretical": "이론적이고 학술적인 관점에서 답변하세요. 개념, 원리, 근거를 체계적으로 설명합니다.",
        "creative": "창의적이고 혁신적인 관점에서 답변하세요. 새로운 아이디어, 독특한 접근법, 색다른 해결책을 제안합니다.",
        "critical": "비판적이고 분석적인 관점에서 답변하세요. 장단점, 잠재적 문제점, 대안을 균형 있게 검토합니다.",
        "empathetic": "공감적이고 따뜻한 관점에서 답변하세요. 감정적 맥락을 고려하고 이해와 지지를 표현합니다.",
    }

    prompt_parts = []

    # 스타일 프롬프트
    style_key = style.lower() if style else "balanced"
    if style_key in style_prompts:
        prompt_parts.append(style_prompts[style_key])
    else:
        prompt_parts.append(style_prompts["balanced"])

    # 관점 프롬프트
    if perspective:
        perspective_key = perspective.lower()
        if perspective_key in perspective_prompts:
            prompt_parts.append(perspective_prompts[perspective_key])

    return "\n\n".join(prompt_parts)


def _add_response_diversity(
    base_response: str, temperature: float = 0.8, variation_seed: int = None
) -> str:
    """
    응답에 다양성을 추가합니다.
    같은 질문에도 다른 시작, 구조, 표현을 사용합니다.
    """
    if variation_seed is None:
        variation_seed = random.randint(0, 10000)

    random.seed(variation_seed)

    # 시작 문구 다양화
    opening_phrases = [
        "",  # 바로 시작
        "좋은 질문입니다. ",
        "말씀하신 부분에 대해 설명드리겠습니다. ",
        "이 부분을 자세히 살펴보면, ",
        "핵심적인 내용부터 말씀드리면, ",
        "여러 측면에서 살펴볼 수 있는데, ",
        "우선 중요한 점부터 짚어드리면, ",
    ]

    # 마무리 문구 다양화
    closing_phrases = [
        "",  # 추가 없음
        "\n\n추가로 궁금한 점이 있으시면 말씀해주세요.",
        "\n\n더 자세한 설명이 필요하시면 알려주세요.",
        "\n\n다른 관점에서의 설명이 필요하시면 말씀해주세요.",
    ]

    # 높은 temperature에서만 시작/마무리 추가
    if temperature >= 0.7:
        opening = random.choice(opening_phrases)
        closing = random.choice(closing_phrases)

        # 이미 인사로 시작하면 opening 추가 안함
        if any(
            base_response.startswith(phrase)
            for phrase in ["좋은", "말씀", "이 부분", "핵심", "여러", "우선"]
        ):
            opening = ""

        return opening + base_response + closing

    return base_response


class VariationsRequest(BaseModel):
    """다양한 답변 생성 요청 모델"""

    message: str
    context: Optional[list] = []
    options: Optional[Dict[str, Any]] = {}
    num_variations: Optional[int] = 3

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "인공지능의 미래에 대해 설명해주세요",
                "num_variations": 3,
                "options": {"writing_style": "yoo_simin"},
            }
        }
    )


@router.post("/chat/variations", summary="다양한 답변 생성")
async def generate_variations(request: VariationsRequest):
    """
    같은 질문에 대해 여러 가지 다양한 답변 생성
    다양한 관점, 구조, 톤의 답변을 생성합니다.
    """
    start_time = time.time()

    try:
        # 입력 검증
        if not request.message or not request.message.strip():
            return _json_error(error="메시지가 비어있습니다.", status_code=400)

        message = request.message.strip()
        num_variations = max(1, min(5, request.num_variations or 3))  # 1-5개로 제한
        options = request.options or {}
        writing_style = options.get("writing_style")

        logger.info(
            f"다양한 답변 생성 요청: message_length={len(message)}, "
            f"num_variations={num_variations}, writing_style={writing_style}"
        )

        # 다양성 전략 정의
        variation_strategies = [
            {
                "index": 1,
                "strategy": "관점 다양화",
                "description": "다른 관점에서 접근",
                "temperature": 0.85,
                "perspective": "긍정적",
                "structure": "문제-해결책",
            },
            {
                "index": 2,
                "strategy": "구조 다양화",
                "description": "다른 구조로 작성",
                "temperature": 0.80,
                "perspective": "중립적",
                "structure": "서론-본론-결론",
            },
            {
                "index": 3,
                "strategy": "톤 다양화",
                "description": "다른 톤으로 작성",
                "temperature": 0.90,
                "perspective": "비판적",
                "structure": "사례-분석-시사점",
            },
            {
                "index": 4,
                "strategy": "예시 다양화",
                "description": "다른 예시 중심",
                "temperature": 0.75,
                "perspective": "실용적",
                "structure": "예시-원리-적용",
            },
            {
                "index": 5,
                "strategy": "창의적 변형",
                "description": "혁신적 접근",
                "temperature": 0.95,
                "perspective": "혁신적",
                "structure": "비유-설명-확장",
            },
        ]

        # 각 변형 생성
        variations = []
        for i in range(num_variations):
            strategy = variation_strategies[i % len(variation_strategies)]

            # 각 변형마다 다른 컨텍스트 설정
            variation_context = {
                "diversity": True,
                "temperature": strategy["temperature"],
                "variation_index": strategy["index"],
                "variation_mode": "high",
                "avoid_repetition": True,
                "request_id": f"variation-{int(time.time() * 1000)}-{i}",
            }

            # 스타일이 지정된 경우 추가
            if writing_style:
                variation_context["writing_style"] = writing_style
                variation_context["person_style"] = writing_style

            # 응답 생성
            try:
                response_text = await generate_chat_response(
                    message, "enhanced", variation_context
                )

                # 다양성 점수 계산 (간단한 버전)
                confidence = 0.85 + (strategy["temperature"] - 0.8) * 0.1

                variation = {
                    "index": strategy["index"],
                    "strategy": strategy["strategy"],
                    "description": strategy["description"],
                    "content": response_text,
                    "temperature": strategy["temperature"],
                    "perspective": strategy["perspective"],
                    "structure": strategy["structure"],
                    "model_used": "unified-chat-api",
                    "confidence": min(confidence, 1.0),
                }

                variations.append(variation)
                logger.info(f"✅ 변형 {strategy['index']} 생성 완료")

            except Exception as e:
                logger.warning(f"변형 {strategy['index']} 생성 실패: {e}")
                # 실패한 경우에도 기본 응답 생성
                variation = {
                    "index": strategy["index"],
                    "strategy": strategy["strategy"],
                    "description": strategy["description"],
                    "content": generate_default_response(message),
                    "temperature": strategy["temperature"],
                    "perspective": strategy["perspective"],
                    "structure": strategy["structure"],
                    "model_used": "fallback",
                    "confidence": 0.5,
                }
                variations.append(variation)

        # 다양성 점수 계산 (답변 간 차이 기반)
        diversity_score = 0.5
        if len(variations) > 1:
            # 내용 길이 차이
            lengths = [len(v.get("content", "")) for v in variations]
            length_variance = (
                (max(lengths) - min(lengths)) / max(max(lengths), 1) if lengths else 0
            )

            # 관점 차이
            perspectives = [v.get("perspective", "") for v in variations]
            perspective_diversity = (
                len(set(perspectives)) / len(perspectives) if perspectives else 0
            )

            # 구조 차이
            structures = [v.get("structure", "") for v in variations]
            structure_diversity = (
                len(set(structures)) / len(structures) if structures else 0
            )

            # 종합 다양성 점수
            diversity_score = (
                length_variance * 0.3
                + perspective_diversity * 0.4
                + structure_diversity * 0.3
            )

        # 도메인 감지
        knowledge_domain = "general"
        try:
            from api.intelligent_answer_generator import intelligent_answer_generator

            analysis = intelligent_answer_generator.analyze_request(message, {})
            knowledge_domain = analysis.get("domain", "general")
        except Exception:
            pass

        processing_time = int((time.time() - start_time) * 1000)

        return success_response(
            data={
                "variations": variations,
                "diversity_score": diversity_score,
                "writing_style": writing_style,
                "knowledge_domain": knowledge_domain,
                "processing_time": processing_time,
            },
            message=f"{num_variations}개의 다양한 답변 생성 완료",
        )

    except Exception as e:
        logger.error(f"다양한 답변 생성 오류: {e}", exc_info=True)
        return _json_error(
            error=f"다양한 답변 생성 중 오류가 발생했습니다: {str(e)}",
            status_code=500,
        )


@router.post("/unified/chat/variations", summary="다양한 답변 생성 (호환 엔드포인트)")
async def generate_variations_compat(request: VariationsRequest):
    """하위 호환: `/api/unified/chat/variations` 별칭"""
    return await generate_variations(request)


# ─────────────────────────────────────────────────────────────────────────────
# 대화 제목 자동 생성 API
# ─────────────────────────────────────────────────────────────────────────────


class GenerateTitleRequest(BaseModel):
    """대화 제목 생성 요청 모델"""

    message: str  # 첫 번째 사용자 메시지
    assistant_response: Optional[str] = None  # AI 응답 (선택)
    max_length: Optional[int] = 30  # 최대 제목 길이


def _generate_conversation_title(
    message: str, assistant_response: Optional[str] = None, max_length: int = 30
) -> str:
    """
    대화 내용을 분석하여 의미 있는 제목을 생성합니다.

    Args:
        message: 첫 번째 사용자 메시지
        assistant_response: AI 응답 (선택)
        max_length: 최대 제목 길이

    Returns:
        생성된 대화 제목
    """
    if not message or not message.strip():
        return "새 대화"

    message = message.strip()

    # 1. 질문 형태인 경우 핵심 키워드 추출
    question_patterns = [
        (r"(.+?)(?:은|는|이|가)\s*(?:뭐|무엇|어떻게|왜|언제|어디)", r"\1"),
        (r"(.+?)(?:에 대해|에 관해|관련해서)", r"\1 관련"),
        (r"(.+?)(?:하는 방법|하는 법|하려면)", r"\1 방법"),
        (r"(.+?)(?:추천|알려줘|가르쳐줘)", r"\1 질문"),
        (r"(.+?)(?:\?|？)$", r"\1"),
    ]

    for pattern, replacement in question_patterns:
        match = re.search(pattern, message)
        if match:
            extracted = re.sub(pattern, replacement, message)
            if extracted and len(extracted) <= max_length:
                return extracted[:max_length].strip()

    # 2. 특정 도메인 키워드 감지
    domain_keywords = {
        "부동산": [
            "아파트",
            "주택",
            "재건축",
            "재개발",
            "분양",
            "매매",
            "전세",
            "월세",
            "부동산",
            "토지",
            "건물",
            "임대",
            "투자",
            "시세",
        ],
        "금융": [
            "대출",
            "금리",
            "이자",
            "은행",
            "투자",
            "주식",
            "펀드",
            "보험",
            "예금",
            "적금",
            "카드",
            "신용",
            "연금",
        ],
        "법률": [
            "계약",
            "소송",
            "법률",
            "변호사",
            "권리",
            "의무",
            "분쟁",
            "상속",
            "유언",
            "이혼",
            "합의",
        ],
        "세금": [
            "세금",
            "소득세",
            "부가세",
            "양도세",
            "취득세",
            "증여세",
            "상속세",
            "종부세",
            "연말정산",
            "공제",
        ],
        "취업": [
            "취업",
            "이직",
            "면접",
            "이력서",
            "자소서",
            "연봉",
            "복지",
            "퇴직",
            "경력",
            "채용",
        ],
        "코딩": [
            "코딩",
            "프로그래밍",
            "개발",
            "코드",
            "버그",
            "에러",
            "함수",
            "API",
            "데이터베이스",
            "서버",
            "프론트",
            "백엔드",
        ],
        "일상": [
            "날씨",
            "음식",
            "여행",
            "건강",
            "운동",
            "취미",
            "요리",
            "영화",
            "음악",
            "게임",
        ],
    }

    detected_domain = None
    for domain, keywords in domain_keywords.items():
        for keyword in keywords:
            if keyword in message:
                detected_domain = domain
                break
        if detected_domain:
            break

    # 3. 핵심 명사/키워드 추출 (간단한 규칙 기반)
    # 조사 제거
    cleaned = re.sub(
        r"(은|는|이|가|을|를|의|에|에서|로|으로|와|과|도|만|까지|부터)(?=\s|$)",
        "",
        message,
    )
    # 특수문자 제거
    cleaned = re.sub(r"[?？!！.,。、~～]", "", cleaned)
    words = cleaned.split()

    # 의미 있는 단어만 필터링 (2자 이상)
    meaningful_words = [w for w in words if len(w) >= 2]

    if meaningful_words:
        # 첫 2-3개 핵심 단어로 제목 생성
        title_words = meaningful_words[:3]
        title = " ".join(title_words)

        # 도메인이 감지되면 접미사 추가
        if detected_domain and len(title) + len(detected_domain) + 3 <= max_length:
            title = f"{title} ({detected_domain})"

        if len(title) <= max_length:
            return title

    # 4. 기본 폴백: 원본 메시지의 앞부분
    if len(message) <= max_length:
        return message

    # 적절한 위치에서 자르기 (단어 경계)
    truncated = message[:max_length]
    last_space = truncated.rfind(" ")
    if last_space > max_length // 2:
        truncated = truncated[:last_space]

    return truncated.strip() + "..."


@router.post("/chat/title", summary="대화 제목 자동 생성")
async def generate_conversation_title(request: GenerateTitleRequest):
    """
    첫 번째 메시지를 분석하여 의미 있는 대화 제목을 생성합니다.

    - 질문 형태 분석
    - 도메인 키워드 감지
    - 핵심 단어 추출
    """
    start_time = time.time()

    try:
        if not request.message or not request.message.strip():
            return _json_error(
                error="message 필드는 필수입니다.",
                status_code=400,
            )

        title = _generate_conversation_title(
            message=request.message,
            assistant_response=request.assistant_response,
            max_length=request.max_length or 30,
        )

        processing_time = int((time.time() - start_time) * 1000)

        return success_response(
            data={
                "title": title,
                "original_message": request.message[:100],
                "processing_time_ms": processing_time,
            },
            message="대화 제목 생성 완료",
        )

    except Exception as e:
        logger.error(f"대화 제목 생성 오류: {e}", exc_info=True)
        return _json_error(
            error=f"대화 제목 생성 중 오류가 발생했습니다: {str(e)}",
            status_code=500,
        )


@router.post("/unified/chat/title", summary="대화 제목 자동 생성 (호환 엔드포인트)")
async def generate_conversation_title_compat(request: GenerateTitleRequest):
    """하위 호환: `/api/unified/chat/title` 별칭"""
    return await generate_conversation_title(request)
