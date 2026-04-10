"""
intelligent_answer_generator - 통합 대화 API용 답변 생성 어댑터

unified_chat_api, md_qa_generator 등에서 사용하는 공통 인터페이스를 제공하며,
intelligent_response_engine에 위임합니다.
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

_engine = None


def _get_engine():
    """IntelligentResponseEngine 인스턴스 반환"""
    global _engine
    if _engine is None:
        try:
            from api.intelligent_response_engine import get_intelligent_engine
            _engine = get_intelligent_engine()
        except ImportError as e:
            logger.warning(f"intelligent_response_engine 사용 불가: {e}")
            return None
    return _engine


def analyze_request(message: str, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    요청 분석 - 도메인, 메시지 타입, 복합 요구사항 여부 반환.
    unified_chat_api, md_qa_generator 등에서 호출.
    """
    engine = _get_engine()
    if not engine:
        return {
            "domain": "general",
            "message_type": "statement",
            "is_multiple_requests": False,
            "split_requests": [message] if message else [],
            "question_type": [],
        }

    try:
        analysis = engine._analyze_query(message)
        sub_queries = engine._split_compound_query(message)

        is_multiple = len(sub_queries) > 1 and len(sub_queries) <= 6
        split_requests = sub_queries if is_multiple else [message]

        return {
            "domain": getattr(analysis.topic_category, "value", "general") if analysis else "general",
            "message_type": getattr(analysis.intent, "value", "statement") if analysis else "statement",
            "is_multiple_requests": is_multiple,
            "split_requests": split_requests,
            "question_type": analysis.key_topics if analysis else [],
            "_raw_analysis": analysis,
        }
    except Exception as e:
        logger.warning(f"요청 분석 오류: {e}")
        return {
            "domain": "general",
            "message_type": "statement",
            "is_multiple_requests": False,
            "split_requests": [message] if message else [],
            "question_type": [],
        }


async def generate_answer(
    message: str,
    analysis: Dict[str, Any],
    quality: str,
    context: Optional[Dict[str, Any]],
) -> str:
    """
    비동기 답변 생성. intelligent_response_engine.generate_response (동기)를
    스레드 풀에서 실행하여 async 인터페이스 제공.
    """
    engine = _get_engine()
    if not engine:
        return _fallback_response(message)

    try:
        hist = None
        if context:
            hist = context.get("conversation_history") or context.get("conversationHistory")
        if not isinstance(hist, list):
            hist = None

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: engine.generate_response(
                query=message,
                context=context,
                conversation_history=hist,
            ),
        )
        if response and isinstance(response, str) and len(response.strip()) >= 5:
            return response.strip()
    except Exception as e:
        logger.warning(f"답변 생성 오류: {e}")

    return _fallback_response(message)


async def _generate_multiple_requests_answer(
    split_requests: List[str],
    analysis: Dict[str, Any],
    quality: str,
    context: Optional[Dict[str, Any]],
) -> str:
    """
    복합 요구사항에 대한 통합 답변 생성.
    각 split_request별로 답변 생성 후 논리적으로 결합.
    """
    if not split_requests:
        return _fallback_response("")

    if len(split_requests) == 1:
        return await generate_answer(split_requests[0], analysis, quality, context)

    parts = []
    for i, req in enumerate(split_requests, 1):
        part = await generate_answer(req, analysis, quality, context)
        if part and len(part.strip()) >= 10:
            if len(split_requests) > 1:
                parts.append(f"**{i}.** {part}")
            else:
                parts.append(part)

    if not parts:
        return await generate_answer(
            " ".join(split_requests),
            analysis,
            quality,
            context,
        )

    return "\n\n".join(parts)


def _fallback_response(message: str) -> str:
    """엔진 미사용 시 기본 응답"""
    if not message or not message.strip():
        return "질문이 비어 있습니다. 구체적으로 질문해 주시면 도움을 드리겠습니다."
    return f"죄송합니다. '{message}'에 대한 답변을 생성하는 데 일시적인 문제가 있었습니다. 잠시 후 다시 시도해 주세요."


class IntelligentAnswerGeneratorAdapter:
    """
    unified_chat_api 등에서 intelligent_answer_generator.analyze_request,
    intelligent_answer_generator.generate_answer 형태로 호출하기 위한
    모듈 레벨 함수들을 모아둔 네임스페이스.
    """
    analyze_request = staticmethod(analyze_request)
    generate_answer = staticmethod(generate_answer)
    _generate_multiple_requests_answer = staticmethod(_generate_multiple_requests_answer)


intelligent_answer_generator = IntelligentAnswerGeneratorAdapter()
