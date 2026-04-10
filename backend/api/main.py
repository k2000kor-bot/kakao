#!/usr/bin/env python3
"""
CORBU.AI 간단한 통합 API 서버 v1.0
- 의존성 문제를 해결한 간단한 버전
- 핵심 기능만 포함
- Flask 기반으로 기존 app.py와 통합
"""

import asyncio
import base64
import logging
import os
import tempfile
import time
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from functools import wraps
from werkzeug.exceptions import RequestEntityTooLarge

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("simple_integrated_api.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

# Flask 앱 생성
app = Flask(__name__)
CORS(app)

# 설정
app.config["SECRET_KEY"] = "corbu-ai-integrated-secret-key-2024"
# 요청 본문 최대 크기 (16MB). 초과 시 413 반환
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
APP_START_TIME = time.time()
INTENT_ANALYZE_MAX_MESSAGE_LENGTH = 10_000
CHAT_MAX_MESSAGE_LENGTH = 10_000


@app.errorhandler(RequestEntityTooLarge)
def handle_request_entity_too_large(_e):
    """요청 본문이 MAX_CONTENT_LENGTH 초과 시 413 JSON 응답."""
    return (
        jsonify({
            "success": False,
            "error": "요청 본문이 너무 큽니다.",
            "detail": "최대 16MB까지 허용됩니다.",
            "timestamp": datetime.now().isoformat(),
        }),
        413,
    )


# 유틸리티 함수
def validate_message_length(
    message: str,
    max_length: int,
    field_name: str = "메시지",
) -> Optional[Tuple[Response, int]]:
    """메시지 길이 검증. 초과 시 (error_response, 400) 반환, 아니면 None."""
    if not message or not message.strip():
        return create_error_response(f"{field_name}가 비어있습니다.", 400)
    if len(message) > max_length:
        return create_error_response(
            f"{field_name}가 너무 깁니다. 최대 {max_length}자까지 허용됩니다.",
            400,
        )
    return None


def create_error_response(
    error: str, status_code: int = 500, message: Optional[str] = None
) -> Tuple[Response, int]:
    """표준화된 에러 응답 생성. 요청 추적용 request_id 포함 (헤더 X-Request-Id와 동일)."""
    error_data = {
        "success": False,
        "error": error,
        "message": message or error,
        "timestamp": datetime.now().isoformat(),
    }
    rid = getattr(request, "request_id", None)
    if rid is not None:
        error_data["request_id"] = rid
    return (
        jsonify(error_data),
        status_code,
    )


def create_success_response(
    data: Dict[str, Any], status_code: int = 200
) -> Tuple[Response, int]:
    """표준화된 성공 응답 생성. 요청 추적용 request_id 포함 (헤더 X-Request-Id와 동일)."""
    body = {
        "success": True,
        "data": data,
        "timestamp": datetime.now().isoformat(),
    }
    rid = getattr(request, "request_id", None)
    if rid is not None:
        body["request_id"] = rid
    return (
        jsonify(body),
        status_code,
    )


def attach_context_ui_modes_to_payload(
    context: Optional[Dict[str, Any]], payload: Dict[str, Any]
) -> None:
    """요청 context의 answer_mode/response_style을 payload 최상위 및 payload['data']에 에코 (in-place)."""
    if not context or not isinstance(payload, dict):
        return
    for key in ("answer_mode", "response_style"):
        raw = context.get(key)
        if isinstance(raw, str) and raw.strip():
            s = raw.strip()
            payload[key] = s
            inner = payload.get("data")
            if isinstance(inner, dict):
                inner[key] = s


def validate_json_request(required_fields: List[str] = None):
    """JSON 요청 검증 데코레이터"""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                data = request.get_json()
                if not data:
                    return create_error_response("요청 본문이 필요합니다.", 400)

                if required_fields:
                    missing_fields = [
                        field for field in required_fields if field not in data
                    ]
                    if missing_fields:
                        return create_error_response(
                            f"필수 필드가 누락되었습니다: {', '.join(missing_fields)}",
                            400,
                        )

                return func(*args, **kwargs)
            except RequestEntityTooLarge:
                raise
            except Exception as e:
                logger.error(f"요청 검증 오류: {e}", exc_info=True)
                return create_error_response(f"요청 검증 실패: {str(e)}", 400)

        return wrapper

    return decorator


def monitor_performance(func):
    """성능 모니터링 데코레이터"""

    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            response_time = time.time() - start_time

            # 성능 로깅
            logger.info(f"API {func.__name__} 실행 시간: {response_time:.3f}초")

            # 응답 시간이 너무 길면 경고
            if response_time > 5.0:
                logger.warning(
                    f"⚠️ {func.__name__} 응답 시간이 느립니다: {response_time:.3f}초"
                )

            return result
        except Exception as e:
            response_time = time.time() - start_time
            logger.error(
                f"❌ {func.__name__} 실행 실패 (소요 시간: {response_time:.3f}초): {e}",
                exc_info=True,
            )
            raise

    return wrapper


@app.before_request
def before_request_log():
    """요청 전 로깅: method, path, request_id (디버깅·추적용)."""
    import uuid
    request_id = getattr(request, "request_id", None) or str(uuid.uuid4())[:8]
    setattr(request, "request_id", request_id)
    request.start_time = time.time()
    logger.debug("요청 시작 %s %s [%s]", request.method, request.path, request_id)


@app.after_request
def after_request_headers(response):
    """응답 헤더 추가: X-Request-Id, X-Response-Time (모니터링·추적용)."""
    request_id = getattr(request, "request_id", None)
    if request_id:
        response.headers["X-Request-Id"] = request_id
    start = getattr(request, "start_time", None)
    if start is not None:
        elapsed = round((time.time() - start) * 1000)
        response.headers["X-Response-Time-Ms"] = str(elapsed)
    return response


class SimpleIntegratedAI:
    """간단한 통합 AI 엔진

    메시지 분석, 감정 분석, 의도 분석, 응답 생성 기능을 제공합니다.
    """

    def __init__(self) -> None:
        """AI 엔진 초기화"""
        self.conversation_history: List[Dict[str, Any]] = []
        self.analysis_cache: Dict[str, Any] = {}
        self.system_metrics: Dict[str, Any] = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_response_time": 0.0,
            "last_updated": datetime.now().isoformat(),
        }
        # Intelligent Response Engine 초기화 (선택적 사용)
        self.intelligent_engine = None
        try:
            from api.intelligent_response_engine import get_intelligent_engine

            self.intelligent_engine = get_intelligent_engine()
            logger.info("✅ Intelligent Response Engine 로드 성공")
        except Exception as e:
            logger.warning(f"⚠️ Intelligent Response Engine 로드 실패: {e}")

    def analyze_message(
        self, message: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """메시지 종합 분석. context(질문·요구 등)를 반영해 결과물 생성.

        Args:
            message: 분석할 메시지 텍스트
            context: 프론트 전달 컨텍스트 (parsed_input, answer_quality_instruction 등)

        Returns:
            분석 결과 딕셔너리 (success, response, analysis, timestamp)
        """
        try:
            start_time = time.time()
            context = context if isinstance(context, dict) else {}

            # 대화 파일 첨부 시: 첨부 내용 + 사용자 질문/요구를 하나의 메시지로 합쳐서 생성답변에 반영
            effective_message = message
            if context.get("conversation_file_content"):
                file_content = context.get("conversation_file_content") or ""
                effective_message = (
                    "[첨부된 대화 내용]\n"
                    + file_content
                    + "\n\n[사용자 질문 및 요구]\n"
                    + (message or "")
                )

            # 프로젝트(노트북) 선택 시: 노트북 소스 컨텍스트 로드 → 딥시크 등 LLM이 노트북 LLM처럼 소스 기반 답변
            project_id = context.get("project_id") or context.get("projectId")
            if project_id:
                try:
                    from api.project_session_api import load_project_notebook_context_filtered

                    source_ids = context.get("source_ids")
                    if source_ids is not None and not isinstance(source_ids, list):
                        source_ids = None
                    project_context_text = load_project_notebook_context_filtered(
                        project_id, source_ids=source_ids
                    )
                    if project_context_text and project_context_text.strip():
                        parts = [project_context_text.strip()]
                        bylaws = context.get("bylaws_base_knowledge")
                        if isinstance(bylaws, str) and bylaws.strip():
                            parts.append(bylaws.strip())
                        context["projectKnowledge"] = "\n\n".join(parts)
                        logger.info(
                            "프로젝트 노트북 컨텍스트 적용(노트북 LLM 스타일): project_id=%s, source_ids=%s",
                            project_id,
                            len(source_ids) if source_ids else "전체",
                        )
                    project_instructions = context.get("project_instructions")
                    if isinstance(project_instructions, str) and project_instructions.strip():
                        existing = (context.get("projectKnowledge") or "").strip()
                        context["projectKnowledge"] = (
                            (existing + "\n\n프로젝트 지침:\n" + project_instructions.strip())
                            if existing
                            else ("프로젝트 지침:\n" + project_instructions.strip())
                        )
                except Exception as e:
                    logger.warning("프로젝트 노트북 컨텍스트 로드 실패(무시하고 진행): %s", e)

            # 감정 분석 (원본 메시지 기준)
            emotion_analysis = self._analyze_emotion(message)

            # 키워드 추출
            keywords = self._extract_keywords(message)

            # 의도 분석
            intent = self._analyze_intent(message)

            # 응답 생성: 질문·답변 시 항상 딥시크 등 LLM에 연결해 답변 생성 (프로젝트 있으면 노트북 소스 반영)
            response = None
            try:
                from api.unified_chat_api import generate_chat_response

                def _run_generate():
                    try:
                        return asyncio.run(
                            generate_chat_response(effective_message, "enhanced", context)
                        )
                    except RuntimeError as e:
                        if "running event loop" in str(e):
                            loop = asyncio.get_event_loop()
                            return loop.run_until_complete(
                                generate_chat_response(effective_message, "enhanced", context)
                            )
                        raise

                response = _run_generate()
                if response and len((response or "").strip()) > 0:
                    logger.info(
                        "딥시크(노트북 LLM) 경로로 응답 생성: %d자%s",
                        len(response.strip()),
                        f", project_id={project_id}" if project_id else "",
                    )
            except Exception as e:
                logger.warning("딥시크(노트북 LLM) 경로 실패, 기본 엔진 사용: %s", e)

            # Intelligent Response Engine 시도 (딥시크 경로가 없거나 실패한 경우)
            if not response and self.intelligent_engine:
                try:
                    intelligent_response = self.intelligent_engine.generate_response(
                        query=effective_message,
                        context=context,
                        conversation_history=self.conversation_history[-5:]
                        if self.conversation_history
                        else None,
                    )
                    if intelligent_response and len(intelligent_response.strip()) > 100:
                        response = intelligent_response
                        logger.info(
                            f"✅ Intelligent Response Engine 사용: {len(response)}자"
                        )
                except Exception as e:
                    logger.warning(
                        f"⚠️ Intelligent Response Engine 실패, 기본 엔진 사용: {e}"
                    )

            # 질문·요구가 있으면 결과물 형식으로 생성 (context.parsed_input 또는 메시지 구조 감지)
            # 1) 질문·요구 전용 프롬프트로 LLM 재시도 → 2) 실패 시 템플릿 결과물 반환
            if not response and self._has_question_requirements(message, context):
                prompt_for_question = self._build_question_requirement_prompt(effective_message, context)
                if prompt_for_question:
                    try:
                        from api.unified_chat_api import generate_chat_response

                        def _run_q():
                            try:
                                return asyncio.run(
                                    generate_chat_response(prompt_for_question, "enhanced", context)
                                )
                            except RuntimeError as ex:
                                if "running event loop" in str(ex):
                                    loop = asyncio.get_event_loop()
                                    return loop.run_until_complete(
                                        generate_chat_response(prompt_for_question, "enhanced", context)
                                    )
                                raise

                        response = _run_q()
                        if response and len((response or "").strip()) > 0:
                            logger.info("질문·요구 전용 프롬프트로 LLM 응답 생성: %d자", len(response.strip()))
                    except Exception as e:
                        logger.warning("질문·요구 LLM 재시도 실패, 템플릿 결과물 사용: %s", e)
                if not response:
                    response = self._generate_result_from_question_requirements(
                        effective_message, context, emotion_analysis, intent
                    )

            # 기본 응답 생성 (Intelligent Engine이 실패하거나 없는 경우)
            if not response:
                response = self._generate_response(
                    effective_message, emotion_analysis, intent
                )

            # 성능 메트릭 업데이트
            response_time = time.time() - start_time
            self._update_metrics(response_time, True)

            return {
                "success": True,
                "response": response,
                "analysis": {
                    "emotion": emotion_analysis,
                    "keywords": keywords,
                    "intent": intent,
                    "response_time": response_time,
                },
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"메시지 분석 오류: {e}")
            self._update_metrics(0, False)
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }

    def _analyze_emotion(self, text: str) -> Dict[str, Any]:
        """고급 감정 분석

        Args:
            text: 분석할 텍스트

        Returns:
            감정 분석 결과 (sentiment, confidence)
        """
        # 확장된 감정 단어 사전
        positive_words = [
            "좋다",
            "훌륭하다",
            "멋지다",
            "성공",
            "행복",
            "만족",
            "긍정",
            "좋아",
            "사랑",
            "감사",
            "고마워",
            "완벽",
            "최고",
            "대단",
            "훌륭",
            "멋져",
            "좋아해",
            "사랑해",
            "기쁘",
            "즐거",
            "신나",
            "만족",
            "성취",
            "성공",
            "완료",
            "완성",
            "달성",
        ]

        negative_words = [
            "나쁘다",
            "실패",
            "불만",
            "화나다",
            "슬프다",
            "부정",
            "문제",
            "싫어",
            "미워",
            "힘들",
            "어렵",
            "스트레스",
            "피곤",
            "지쳐",
            "우울",
            "짜증",
            "화나",
            "속상",
            "실망",
            "좌절",
            "절망",
            "우울",
            "슬퍼",
            "아파",
            "아픔",
            "고통",
            "괴로",
        ]

        # 강도 표현 단어
        intensity_words = {
            "매우": 2.0,
            "정말": 2.0,
            "너무": 2.0,
            "완전": 2.0,
            "진짜": 1.5,
            "조금": 0.5,
            "약간": 0.5,
            "좀": 0.5,
            "살짝": 0.3,
        }

        text_lower = text.lower()

        # 긍정/부정 단어 카운트 (강도 고려)
        positive_score = 0
        negative_score = 0

        for word in positive_words:
            if word in text_lower:
                # 강도 단어 확인
                intensity = 1.0
                for intensity_word, multiplier in intensity_words.items():
                    if intensity_word in text_lower:
                        intensity = multiplier
                        break
                positive_score += intensity

        for word in negative_words:
            if word in text_lower:
                # 강도 단어 확인
                intensity = 1.0
                for intensity_word, multiplier in intensity_words.items():
                    if intensity_word in text_lower:
                        intensity = multiplier
                        break
                negative_score += intensity

        # 감정 결정
        total_words = len(text.split())
        positive_ratio = positive_score / max(total_words, 1)
        negative_ratio = negative_score / max(total_words, 1)

        if positive_ratio > negative_ratio and positive_ratio > 0.1:
            sentiment = "긍정"
            confidence = min(0.95, 0.6 + positive_ratio * 2)
        elif negative_ratio > positive_ratio and negative_ratio > 0.1:
            sentiment = "부정"
            confidence = min(0.95, 0.6 + negative_ratio * 2)
        else:
            sentiment = "중립"
            confidence = 0.5

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "positive_score": positive_ratio,
            "negative_score": negative_ratio,
        }

    def _extract_keywords(self, text: str) -> List[str]:
        """키워드 추출

        Args:
            text: 키워드를 추출할 텍스트

        Returns:
            추출된 키워드 리스트 (최대 10개)
        """
        # 간단한 키워드 추출 (실제로는 더 정교한 NLP 라이브러리 사용)
        words = text.split()
        # 2글자 이상의 단어만 키워드로 간주
        keywords = [word for word in words if len(word) >= 2]
        return keywords[:10]  # 상위 10개만 반환

    def _analyze_intent(self, text: str) -> Dict[str, Any]:
        """고급 의도 분석

        Args:
            text: 의도를 분석할 텍스트

        Returns:
            의도 분석 결과 (type, confidence)
        """
        text_lower = text.lower()

        # 의도별 키워드 패턴
        intent_patterns = {
            "question": {
                "keywords": [
                    "질문",
                    "물어",
                    "궁금",
                    "?",
                    "어떻게",
                    "왜",
                    "언제",
                    "어디",
                    "누구",
                    "무엇",
                ],
                "patterns": [
                    "어떻게",
                    "왜",
                    "언제",
                    "어디서",
                    "누가",
                    "무엇을",
                    "어느",
                    "몇",
                ],
            },
            "request": {
                "keywords": [
                    "요청",
                    "부탁",
                    "해줘",
                    "도와",
                    "도움",
                    "부탁해",
                    "해주세요",
                    "해주시면",
                ],
                "patterns": ["해줘", "해주세요", "도와줘", "부탁해", "해주시면"],
            },
            "gratitude": {
                "keywords": [
                    "감사",
                    "고마워",
                    "감사해",
                    "고맙",
                    "감사합니다",
                    "고마워요",
                    "감사드려",
                ],
                "patterns": ["감사", "고마워", "고맙", "감사드려", "감사합니다"],
            },
            "greeting": {
                "keywords": [
                    "안녕",
                    "인사",
                    "하이",
                    "헬로",
                    "안녕하세요",
                    "안녕히",
                    "반가워",
                ],
                "patterns": ["안녕", "하이", "헬로", "반가워"],
            },
            "complaint": {
                "keywords": [
                    "불만",
                    "문제",
                    "화나",
                    "짜증",
                    "실망",
                    "불만족",
                    "문제가",
                ],
                "patterns": ["문제가", "불만", "화나", "짜증", "실망"],
            },
            "compliment": {
                "keywords": ["칭찬", "좋다", "훌륭", "멋져", "최고", "대단", "완벽"],
                "patterns": ["좋다", "훌륭", "멋져", "최고", "대단"],
            },
        }

        # 각 의도별 점수 계산
        intent_scores = {}
        for intent_type, patterns in intent_patterns.items():
            score = 0

            # 키워드 매칭
            for keyword in patterns["keywords"]:
                if keyword in text_lower:
                    score += 1

            # 패턴 매칭 (더 높은 가중치)
            for pattern in patterns["patterns"]:
                if pattern in text_lower:
                    score += 2

            intent_scores[intent_type] = score

        # 가장 높은 점수의 의도 선택
        if intent_scores:
            best_intent = max(intent_scores, key=intent_scores.get)
            max_score = intent_scores[best_intent]

            if max_score > 0:
                confidence = min(0.95, 0.5 + max_score * 0.1)
                return {"type": best_intent, "confidence": confidence}

        # 기본값
        return {"type": "general", "confidence": 0.5}

    def analyze_intent_only(self, message: str) -> Dict[str, Any]:
        """의도·키워드만 분석 (API용). 메시지 분석 없이 intent + keywords만 반환.
        공유 모듈 api.intent_analysis 사용 (FastAPI와 동일 로직).
        """
        try:
            from api.intent_analysis import analyze_intent_only as shared_analyze
            return shared_analyze(message)
        except ImportError:
            intent = self._analyze_intent(message)
            keywords = self._extract_keywords(message)
            return {"intent": intent, "keywords": keywords}

    def _has_question_requirements(
        self, message: str, context: Dict[str, Any]
    ) -> bool:
        """질문·요구가 포함된 입력인지 여부 (결과물 생성 대상)."""
        parsed = context.get("parsed_input")
        if isinstance(parsed, dict) and (
            parsed.get("question") or parsed.get("requirements")
        ):
            return True
        msg_lower = (message or "").lower().strip()
        if len(msg_lower) < 15:
            return False
        if "질문" in message and "요구" in message:
            return True
        if "질문:" in message or "요구사항:" in message or "요구:" in message:
            return True
        # 질문·요구 표현 확대: 알려줘, 설명해줘, 써줘, 작성해줘 등
        question_requirement_keywords = [
            "알려줘", "알려주세요", "설명해줘", "설명해주세요",
            "써줘", "쓰여줘", "작성해줘", "작성해주세요", "만들어줘",
            "?", "궁금", "뭐야", "무엇", "어떻게", "왜"
        ]
        if any(kw in msg_lower for kw in question_requirement_keywords):
            return True
        return False

    def _build_question_requirement_prompt(
        self, message: str, context: Dict[str, Any]
    ) -> Optional[str]:
        """질문·요구가 있을 때 LLM에 넘길 명시적 프롬프트 문자열. 없으면 None."""
        parsed = context.get("parsed_input") or {}
        if not isinstance(parsed, dict):
            return None
        question = parsed.get("question") if isinstance(parsed.get("question"), str) else None
        requirements = parsed.get("requirements") if isinstance(parsed.get("requirements"), str) else None
        if not question and not requirements:
            return None
        parts = [
            "다음 질문에 대해 구체적으로 답변하고, 요구사항이 있으면 반영한 결과물을 작성해 주세요.",
            "",
            "사용자 메시지:",
            (message or "").strip() or "(없음)",
        ]
        if question:
            parts.extend(["", "질문:", question.strip()])
        if requirements:
            parts.extend(["", "요구사항:", requirements.strip()])
        return "\n".join(parts)

    def _generate_result_from_question_requirements(
        self,
        message: str,
        context: Dict[str, Any],
        emotion: Dict[str, Any],
        intent: Dict[str, Any],
    ) -> str:
        """질문·요구가 있을 때 결과물 형식으로 답변 생성 (LLM 실패 시 템플릿)."""
        parsed = context.get("parsed_input") or {}
        question = (
            parsed.get("question")
            if isinstance(parsed.get("question"), str)
            else None
        )
        requirements = (
            parsed.get("requirements")
            if isinstance(parsed.get("requirements"), str)
            else None
        )
        quality_instruction = context.get("answer_quality_instruction") or (
            "답변은 질문의 핵심에 맞게 정확히 하고, 요구한 형식·길이를 반영합니다. "
            "글 생성 시에는 서론·본론·결론과 논리적 흐름, 가독성을 갖춥니다."
        )

        lines = ["## 질문에 대한 답변", ""]
        if question:
            lines.append(f"**질문:** {question.strip()}")
            lines.append("")
        intro_phrases = [
            "입력하신 질문을 반영하여 답변을 정리했습니다. 핵심 요약을 먼저 드리고, 필요한 경우 근거와 실행 가능한 다음 단계를 포함했습니다.",
            "질문 내용을 바탕으로 결과물을 구성했습니다. 요약·근거·다음 단계 순으로 정리했습니다.",
            "요청하신 질문과 요구를 반영해 결과를 정리했습니다. 핵심 요약과 실행 항목을 포함했습니다.",
        ]
        lines.append(random.choice(intro_phrases))
        lines.append("")
        lines.append("- **요약:** 질문의 핵심에 대한 답변을 3줄 이내로 제시합니다.")
        lines.append("- **근거:** 출처나 근거가 있으면 명시합니다.")
        lines.append("- **다음 단계:** 실행 가능한 액션 1개 이상을 제안합니다.")
        lines.append("")

        if requirements:
            lines.append("## 요구사항 반영")
            lines.append("")
            lines.append(f"**요구사항:** {requirements.strip()}")
            lines.append("")
            req_phrases = [
                "위 요구사항(결과물 형식, 필수 포함 항목, 톤/길이 등)에 맞춰 생성 결과를 구성했습니다.",
                "요구사항에 따라 결과물 형식과 필수 항목을 반영했습니다.",
                "입력하신 요구사항을 반영해 결과물을 구성했습니다.",
            ]
            lines.append(random.choice(req_phrases))
            lines.append("")

        if quality_instruction:
            lines.append("---")
            lines.append("")
            lines.append(quality_instruction)
            lines.append("")

        closing_phrases = [
            "추가로 구체적인 내용이 필요하시면 질문과 요구사항을 더 적어 주시면 됩니다.",
            "더 세부적인 결과가 필요하시면 질문과 요구를 추가로 입력해 주세요.",
            "다른 형식이나 항목이 필요하시면 요구사항을 보완해 주시면 반영하겠습니다.",
        ]
        lines.append(random.choice(closing_phrases))
        return "\n".join(lines)

    def _generate_response(
        self, message: str, emotion: Dict[str, Any], intent: Dict[str, Any]
    ) -> str:
        """고급 응답 생성

        Args:
            message: 원본 메시지
            emotion: 감정 분석 결과
            intent: 의도 분석 결과

        Returns:
            생성된 응답 텍스트
        """
        # 의도별 응답 템플릿 (감정별로 구분)
        response_templates = {
            "greeting": {
                "긍정": [
                    "안녕하세요! 기분이 좋으시네요! CORBU.AI가 더욱 기쁘게 도와드리겠습니다! 😊",
                    "반갑습니다! 좋은 하루 보내고 계시는군요! 무엇을 도와드릴까요? ✨",
                    "안녕하세요! 긍정적인 에너지가 느껴지네요! 기꺼이 도와드리겠습니다! 🌟",
                ],
                "부정": [
                    "안녕하세요... 힘든 하루이신 것 같네요. CORBU.AI가 도와드릴게요. 😔",
                    "반갑습니다. 마음이 무겁으시군요. 제가 도와드릴 수 있는 것이 있다면 말씀해주세요. 🤗",
                    "안녕하세요. 어려운 시간이시군요. 함께 해결해보아요. 💪",
                ],
                "중립": [
                    "안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?",
                    "반갑습니다! 어떤 도움이 필요하신가요?",
                    "안녕하세요! 기쁘게 도와드리겠습니다.",
                    "안녕하세요. 질문이나 요청이 있으시면 편하게 말씀해 주세요.",
                    "반가워요. 궁금한 점이나 하고 싶은 말이 있으면 알려 주세요.",
                ],
            },
            "question": {
                "긍정": [
                    "정말 좋은 질문이네요! 기쁘게 자세히 설명해드리겠습니다! 😊",
                    "훌륭한 질문입니다! 꼼꼼히 답변드릴게요! ✨",
                    "좋은 호기심이시네요! 도움이 되도록 설명드리겠습니다! 🌟",
                ],
                "부정": [
                    "궁금한 점이 있으시군요. 차근차근 설명해드릴게요. 😔",
                    "질문해주셔서 감사합니다. 이해하기 쉽게 답변드리겠습니다. 🤗",
                    "궁금한 것이 있으시군요. 도와드릴게요! 💪",
                ],
                "중립": [
                    "좋은 질문이네요! 자세히 설명해드리겠습니다.",
                    "궁금한 점이 있으시군요. 도와드릴게요!",
                    "질문해주셔서 감사합니다. 답변드리겠습니다.",
                    "그 질문에 대해 정리해서 답변드릴게요.",
                    "알려주신 내용을 바탕으로 설명드리겠습니다.",
                    "핵심만 짚어서 답변드리겠습니다.",
                ],
            },
            "request": {
                "긍정": [
                    "네! 기쁘게 도와드리겠습니다! 무엇이든 말씀해주세요! 😊",
                    "물론이죠! 즐겁게 도와드릴게요! ✨",
                    "당연히 도와드리겠습니다! 기꺼이! 🌟",
                ],
                "부정": [
                    "네, 도와드리겠습니다. 힘든 일이 있으시군요. 😔",
                    "물론이죠! 함께 해결해보아요. 🤗",
                    "도움이 필요하시군요. 제가 있으니 걱정 마세요! 💪",
                ],
                "중립": [
                    "네, 도와드리겠습니다!",
                    "물론이죠! 기꺼이 도와드릴게요.",
                    "도움이 필요하시군요. 무엇을 도와드릴까요?",
                ],
            },
            "gratitude": {
                "긍정": [
                    "천만에요! 도움이 되었다니 정말 기쁩니다! 😊",
                    "별말씀을요! 더 도움이 되었다니 행복해요! ✨",
                    "감사합니다! 언제든지 기꺼이 도와드릴게요! 🌟",
                ],
                "부정": [
                    "천만에요... 도움이 되었다니 다행입니다. 😔",
                    "별말씀을요. 조금이라도 도움이 되었다니 기뻐요. 🤗",
                    "감사합니다. 더 도움이 필요하시면 언제든지 말씀해주세요. 💪",
                ],
                "중립": [
                    "천만에요! 도움이 되었다니 기쁩니다.",
                    "별말씀을요! 언제든지 도와드릴게요.",
                    "감사합니다! 더 도움이 필요하시면 말씀해주세요.",
                ],
            },
            "complaint": {
                "긍정": [
                    "아, 문제가 있으셨군요! 빠르게 해결해드리겠습니다! 😊",
                    "불편을 드려서 죄송해요! 바로 처리해드릴게요! ✨",
                    "문제를 말씀해주셔서 감사해요! 개선하겠습니다! 🌟",
                ],
                "부정": [
                    "정말 죄송합니다... 문제를 해결해드리겠습니다. 😔",
                    "불편을 드려서 정말 죄송해요. 바로 처리하겠습니다. 🤗",
                    "문제가 있으셨군요. 함께 해결해보아요. 💪",
                ],
                "중립": [
                    "문제가 있으셨군요. 해결해드리겠습니다.",
                    "불편을 드려서 죄송합니다. 바로 처리하겠습니다.",
                    "문제를 말씀해주셔서 감사합니다. 개선하겠습니다.",
                ],
            },
            "compliment": {
                "긍정": [
                    "정말 감사합니다! 더욱 열심히 하겠습니다! 😊",
                    "칭찬해주셔서 정말 기뻐요! 더 좋은 서비스를 제공하겠습니다! ✨",
                    "고마워요! 정말 힘이 나네요! 계속 노력하겠습니다! 🌟",
                ],
                "부정": [
                    "감사합니다... 조금이라도 도움이 되었다니 다행이에요. 😔",
                    "칭찬해주셔서 감사해요. 더 노력하겠습니다. 🤗",
                    "고마워요. 더 좋은 서비스를 위해 노력하겠습니다. 💪",
                ],
                "중립": [
                    "감사합니다! 더 노력하겠습니다.",
                    "칭찬해주셔서 기뻐요! 더 좋은 서비스를 제공하겠습니다.",
                    "고마워요! 계속 노력하겠습니다.",
                ],
            },
            "general": {
                "긍정": [
                    "정말 흥미로운 말씀이네요! 더 자세히 알려주세요! 😊",
                    "좋은 이야기입니다! 계속 들어보고 싶어요! ✨",
                    "재미있는 주제네요! 더 이야기해주세요! 🌟",
                ],
                "부정": [
                    "그렇군요... 더 이야기해주세요. 😔",
                    "흥미로운 관점이네요. 더 자세히 들려주세요. 🤗",
                    "그런 이야기군요. 계속 들어보고 싶어요. 💪",
                ],
                "중립": [
                    "흥미로운 말씀이네요! 더 자세히 알려주세요.",
                    "그렇군요! 더 이야기해주세요.",
                    "좋은 이야기입니다! 계속 들어보고 싶어요.",
                    "말씀해 주신 내용을 반영해서 답변드릴게요.",
                    "요청하신 관점에서 정리해 보겠습니다.",
                    "여러 각도로 생각해 본 뒤 답변드리겠습니다.",
                    "도움이 되도록 핵심만 짚어서 말씀드릴게요.",
                ],
            },
        }

        intent_type = intent.get("type", "general")
        emotion_sentiment = emotion.get("sentiment", "중립")

        # 의도와 감정에 맞는 응답 선택
        if (
            intent_type in response_templates
            and emotion_sentiment in response_templates[intent_type]
        ):
            responses = response_templates[intent_type][emotion_sentiment]
        else:
            responses = response_templates["general"]["중립"]

        # 랜덤하게 응답 선택
        import random

        return random.choice(responses)

    def _update_metrics(self, response_time: float, success: bool) -> None:
        """성능 메트릭 업데이트

        Args:
            response_time: 응답 시간 (초)
            success: 요청 성공 여부
        """
        self.system_metrics["total_requests"] += 1
        if success:
            self.system_metrics["successful_requests"] += 1
        else:
            self.system_metrics["failed_requests"] += 1

        # 평균 응답 시간 업데이트
        total_successful = self.system_metrics["successful_requests"]
        if total_successful > 0:
            current_avg = self.system_metrics["average_response_time"]
            new_avg = (
                (current_avg * (total_successful - 1)) + response_time
            ) / total_successful
            self.system_metrics["average_response_time"] = new_avg

        self.system_metrics["last_updated"] = datetime.now().isoformat()

    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 조회

        Returns:
            시스템 상태 정보 (metrics, health 등)
        """
        return {
            "status": "healthy",
            "version": "1.0.0",
            "metrics": self.system_metrics,
            "timestamp": datetime.now().isoformat(),
        }


# AI 엔진 인스턴스 생성
ai_engine = SimpleIntegratedAI()


@app.route("/", methods=["GET"])
def root():
    """루트 경로: 서비스 정보 및 API 문서 링크 반환."""
    return create_success_response({
        "service": "CORBU.AI 통합 API",
        "version": "1.0.0",
        "docs": "/api/integrated/health",
        "message": "API 사용: GET /api/integrated/health, POST /api/chat, POST /api/intent/analyze 등",
    })


@app.route("/favicon.ico", methods=["GET"])
def favicon():
    """favicon 요청 시 204 No Content 반환 (404 방지)."""
    return "", 204


# API 엔드포인트들
@app.route("/api/integrated/analyze", methods=["POST"])
@validate_json_request(required_fields=["message"])
@monitor_performance
def analyze_message():
    """통합 메시지 분석"""
    try:
        data = request.get_json()
        message = data.get("message", "").strip()

        if not message:
            return create_error_response("메시지가 비어있습니다.", 400)

        result = ai_engine.analyze_message(message)
        if result.get("success"):
            return create_success_response(result)
        else:
            return create_error_response(result.get("error", "분석 실패"), 500)

    except Exception as e:
        logger.error(f"통합 분석 API 오류: {e}", exc_info=True)
        return create_error_response(f"서버 오류: {str(e)}", 500)


@app.route("/api/intent/analyze", methods=["POST"])
@validate_json_request(required_fields=["message"])
@monitor_performance
def intent_analyze():
    """의도·키워드 분석 전용 API. 메시지의 의도(type, confidence)와 키워드 리스트 반환."""
    try:
        data = request.get_json()
        message = (data.get("message") or "").strip()
        err = validate_message_length(
            message, INTENT_ANALYZE_MAX_MESSAGE_LENGTH, "메시지"
        )
        if err:
            return err
        result = ai_engine.analyze_intent_only(message)
        return create_success_response(result)
    except Exception as e:
        logger.error(f"의도 분석 API 오류: {e}", exc_info=True)
        return create_error_response(f"서버 오류: {str(e)}", 500)


@app.route("/api/status", methods=["GET"])
def api_status():
    """기능별 사용 가능 여부 (프론트 UI·배너용)."""
    tts_base = os.environ.get("QWEN_TTS_BASE_URL", "").rstrip("/")
    tts_configured = bool(tts_base)
    try:
        psa = _project_api()
        projects_available = psa is not None
    except Exception:
        projects_available = False
    return create_success_response({
        "ok": True,
        "tts": {
            "speech": tts_configured,
            "speech_from_source": False,
            "speech_from_project": False,
            "message": "Qwen3-TTS 사용 가능" if tts_configured else "QWEN_TTS_BASE_URL 설정 후 TTS 사용 가능",
        },
        "projects": projects_available,
        "uptime_seconds": round(time.time() - APP_START_TIME, 2),
    })


@app.route("/api", methods=["GET"])
def api_index():
    """API 진입점. 사용 가능한 주요 엔드포인트 안내."""
    return create_success_response({
        "service": "CORBU.AI 통합 API",
        "version": "1.0",
        "endpoints": {
            "health": "/api/health",
            "status": "/api/status",
            "chat": "/api/chat",
            "projects": "/api/projects",
            "real_estate_transactions": "/api/real-estate/transactions",
            "real_estate_registry_changes": "/api/real-estate/registry-changes",
            "tts_config": "/api/tts/config",
            "tts_speech": "/api/tts/speech",
            "tts_script_style_extract": "/api/tts/script-style/extract-document",
            "tts_script_style_analyze": "/api/tts/script-style/analyze",
            "tts_script_style_generate": "/api/tts/script-style/generate",
        },
        "docs": "/api/docs",
        "openapi_json": "/api/openapi.json",
    })


def _get_openapi_spec() -> Dict[str, Any]:
    """OpenAPI 3.0 스펙 (문서화용)."""
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "CORBU.AI 통합 API",
            "version": "1.0",
            "description": "헬스·상태·대화·프로젝트·TTS·script-style API",
        },
        "servers": [{"url": "/", "description": "현재 호스트"}],
        "paths": {
            "/api/health": {
                "get": {
                    "summary": "헬스 체크",
                    "responses": {"200": {"description": "healthy, uptime_seconds"}},
                }
            },
            "/api/status": {
                "get": {
                    "summary": "기능 상태",
                    "responses": {"200": {"description": "tts_speech, projects, uptime_seconds"}},
                }
            },
            "/api/chat": {
                "post": {
                    "summary": "대화",
                    "requestBody": {"content": {"application/json": {"schema": {"type": "object", "properties": {"message": {"type": "string"}}}}}},
                    "responses": {"200": {"description": "응답 메시지"}},
                }
            },
            "/api/projects": {
                "get": {"summary": "프로젝트 목록", "responses": {"200": {"description": "프로젝트 배열"}}},
                "post": {"summary": "프로젝트 생성", "responses": {"200": {"description": "생성된 프로젝트"}}},
            },
            "/api/projects/{project_id}": {
                "get": {"summary": "프로젝트 조회", "responses": {"200": {"description": "프로젝트 객체"}, "404": {"description": "찾을 수 없음"}}},
                "put": {"summary": "프로젝트 수정", "requestBody": {"content": {"application/json": {"schema": {"type": "object", "properties": {"name": {"type": "string"}, "description": {"type": "string"}}}}}}, "responses": {"200": {"description": "수정된 프로젝트"}, "404": {"description": "찾을 수 없음"}}},
                "delete": {"summary": "프로젝트 삭제", "responses": {"200": {"description": "삭제 완료"}, "404": {"description": "찾을 수 없음"}}},
            },
            "/api/real-estate/transactions": {
                "get": {
                    "summary": "부동산 실거래 정보 조회",
                    "parameters": [
                        {"name": "sido", "in": "query", "schema": {"type": "string"}},
                        {"name": "sigungu", "in": "query", "schema": {"type": "string"}},
                        {"name": "dong", "in": "query", "schema": {"type": "string"}},
                        {"name": "startDate", "in": "query", "schema": {"type": "string"}},
                        {"name": "endDate", "in": "query", "schema": {"type": "string"}},
                    ],
                    "responses": {"200": {"description": "transactions 배열 (RealEstateDataPanel 연동)"}},
                }
            },
            "/api/real-estate/registry-changes": {
                "get": {
                    "summary": "부동산 등기 변경 정보 조회",
                    "parameters": [
                        {"name": "sido", "in": "query", "schema": {"type": "string"}},
                        {"name": "sigungu", "in": "query", "schema": {"type": "string"}},
                        {"name": "dong", "in": "query", "schema": {"type": "string"}},
                        {"name": "changeType", "in": "query", "schema": {"type": "string"}},
                        {"name": "startDate", "in": "query", "schema": {"type": "string"}},
                        {"name": "endDate", "in": "query", "schema": {"type": "string"}},
                    ],
                    "responses": {"200": {"description": "changes 배열 (RealEstateDataPanel 연동)"}},
                }
            },
            "/api/tts/config": {"get": {"summary": "TTS 설정", "responses": {"200": {"description": "voices, base_url 등"}}}},
            "/api/tts/speech": {
                "post": {
                    "summary": "TTS 음성 생성",
                    "requestBody": {"content": {"application/json": {"schema": {"type": "object", "properties": {"text": {"type": "string"}, "voice_id": {"type": "string"}}}}}},
                    "responses": {"200": {"description": "오디오 바이너리 또는 base64"}},
                }
            },
            "/api/tts/script-style/extract-document": {
                "post": {
                    "summary": "문서에서 텍스트 추출 (docx/txt)",
                    "requestBody": {"content": {"multipart/form-data": {"schema": {"type": "object", "properties": {"file": {"type": "string", "format": "binary"}}}}}},
                    "responses": {"200": {"description": "text, suggested_document_hint"}},
                }
            },
            "/api/tts/script-style/analyze": {
                "post": {
                    "summary": "대본 스타일 분석",
                    "requestBody": {"content": {"application/json": {"schema": {"type": "object", "required": ["sample_script"], "properties": {"sample_script": {"type": "string"}}}}}},
                    "responses": {"200": {"description": "style_summary, key_traits"}},
                }
            },
            "/api/tts/script-style/generate": {
                "post": {
                    "summary": "스타일 유지 대본 생성",
                    "requestBody": {"content": {"application/json": {"schema": {"type": "object", "required": ["sample_script", "topic_or_outline"], "properties": {"sample_script": {"type": "string"}, "topic_or_outline": {"type": "string"}}}}}},
                    "responses": {"200": {"description": "generated_script"}},
                }
            },
            "/api/tts/situations": {
                "get": {
                    "summary": "TTS 상황별 프리셋 (나레이션·뉴스·드라마 대사 등)",
                    "responses": {"200": {"description": "situations 배열 (id, label, instructions_preview)"}},
                }
            },
        },
    }


@app.route("/api/openapi.json", methods=["GET"])
def api_openapi_json():
    """OpenAPI 3.0 스펙 JSON (Swagger UI 등에서 사용)."""
    return jsonify(_get_openapi_spec())


@app.route("/api/docs", methods=["GET"])
def api_docs():
    """Swagger UI 문서 페이지 (OpenAPI 스펙 로드)."""
    html = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>CORBU.AI API 문서</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "/api/openapi.json",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>"""
    return Response(html, mimetype="text/html")


@app.route("/api/health", methods=["GET"])
@monitor_performance
def api_health():
    """간단 헬스 체크 (로드밸런서·모니터링용). status, version, uptime_seconds 반환."""
    uptime_seconds = round(time.time() - APP_START_TIME, 2)
    return create_success_response(
        {
            "status": "healthy",
            "service": "CORBU.AI 통합 API",
            "version": "1.0",
            "uptime_seconds": uptime_seconds,
        }
    )


# ---------- 대화 업로드 및 대화 관계도 ----------
@app.route("/api/conversations/upload", methods=["POST"])
def api_conversations_upload():
    """대화 내용 업로드. 파일(file) 또는 본문(text)으로 전달. 업로드 후 대화 관계도 데이터 생성 가능."""
    try:
        from api.conversation_graph import save_upload
    except ImportError:
        return create_error_response("대화 업로드 모듈을 불러올 수 없습니다.", 503)
    f = request.files.get("file")
    if f and f.filename:
        try:
            raw = f.read()
            if isinstance(raw, bytes):
                content = raw.decode("utf-8", errors="replace")
            else:
                content = str(raw)
        except Exception as e:
            return create_error_response(f"파일 읽기 실패: {e}", 400)
        name = request.form.get("name") or f.filename
        filename = f.filename
    else:
        data = request.get_json(silent=True) or {}
        content = data.get("text") or request.form.get("text") or ""
        if not content.strip():
            return create_error_response("파일 또는 text(대화 내용)이 필요합니다.", 400)
        name = data.get("name") or request.form.get("name") or "대화"
        filename = data.get("filename") or "pasted.txt"
    try:
        result = save_upload(name=name, filename=filename, content=content)
        return create_success_response({"data": result})
    except Exception as e:
        logger.exception("대화 업로드 실패")
        return create_error_response(f"저장 실패: {e}", 500)


@app.route("/api/conversations", methods=["GET"])
def api_conversations_list():
    """업로드된 대화 목록 (id, name, filename, uploaded_at, message_count)."""
    try:
        from api.conversation_graph import list_uploads
    except ImportError:
        return create_error_response("대화 모듈을 불러올 수 없습니다.", 503)
    try:
        items = list_uploads()
        return create_success_response({"data": items})
    except Exception as e:
        logger.exception("대화 목록 조회 실패")
        return create_error_response(str(e), 500)


@app.route("/api/conversations/<upload_id>/relationship-graph", methods=["GET"])
def api_conversations_relationship_graph(upload_id):
    """대화 관계도: 노드(참여자), 엣지(연속 발화 흐름). 쿼리: start_date, end_date (ISO 날짜, 선택)."""
    try:
        from api.conversation_graph import get_relationship_graph
    except ImportError:
        return create_error_response("대화 관계도 모듈을 불러올 수 없습니다.", 503)
    start_date = request.args.get("start_date", "").strip() or None
    end_date = request.args.get("end_date", "").strip() or None
    try:
        graph = get_relationship_graph(upload_id, start_date=start_date, end_date=end_date)
        if graph.get("error"):
            return create_error_response(graph["error"], 404)
        return create_success_response({"data": graph})
    except Exception as e:
        logger.exception("대화 관계도 조회 실패")
        return create_error_response(str(e), 500)


@app.route("/api/real-estate/transactions", methods=["GET"])
def api_real_estate_transactions():
    """부동산 실거래 정보 조회 (NotebookLLM RealEstateDataPanel 연동).
    실제 국토교통부 API 연동 전 샘플 데이터 반환."""
    try:
        sido = request.args.get("sido", "").strip()
        sigungu = request.args.get("sigungu", "").strip()
        dong = request.args.get("dong", "").strip()
        transaction_type = request.args.get("transactionType", "").strip()
        property_type = request.args.get("propertyType", "").strip()
        # 데모용 샘플 데이터 (형식: RealEstateTransaction)
        base = [
            {
                "id": "api-1",
                "transactionType": "매매",
                "propertyType": "아파트",
                "address": {"sido": "서울특별시", "sigungu": "강남구", "dong": "역삼동", "jibun": "123-45"},
                "price": {"amount": 125000, "unit": "만원"},
                "area": {"exclusive": 84.5, "public": 12.3},
                "transactionDate": "2024-12-15",
                "floor": {"current": 12, "total": 25},
                "buildYear": 2015,
            },
            {
                "id": "api-2",
                "transactionType": "전세",
                "propertyType": "아파트",
                "address": {"sido": "서울특별시", "sigungu": "서초구", "dong": "반포동", "jibun": "78-12"},
                "price": {"amount": 85000, "unit": "만원"},
                "area": {"exclusive": 102.3, "public": 18.2},
                "transactionDate": "2024-12-10",
                "floor": {"current": 8, "total": 20},
                "buildYear": 2010,
            },
            {
                "id": "api-3",
                "transactionType": "매매",
                "propertyType": "오피스텔",
                "address": {"sido": "서울특별시", "sigungu": "송파구", "dong": "잠실동", "jibun": "200-1"},
                "price": {"amount": 52000, "unit": "만원"},
                "area": {"exclusive": 45.2, "public": 8.1},
                "transactionDate": "2024-12-08",
                "floor": {"current": 15, "total": 30},
                "buildYear": 2018,
            },
            {
                "id": "api-4",
                "transactionType": "월세",
                "propertyType": "아파트",
                "address": {"sido": "서울특별시", "sigungu": "마포구", "dong": "연남동", "jibun": "567-8"},
                "price": {"amount": 5000, "unit": "만원"},
                "area": {"exclusive": 59.8, "public": 10.5},
                "transactionDate": "2024-12-05",
                "floor": {"current": 5, "total": 12},
                "buildYear": 2005,
            },
            {
                "id": "api-5",
                "transactionType": "매매",
                "propertyType": "아파트",
                "address": {"sido": "서울특별시", "sigungu": "강남구", "dong": "삼성동", "jibun": "88-22"},
                "price": {"amount": 198000, "unit": "만원"},
                "area": {"exclusive": 132.1, "public": 22.4},
                "transactionDate": "2024-12-01",
                "floor": {"current": 18, "total": 28},
                "buildYear": 2012,
            },
        ]
        # 지역·거래유형·매물유형 필터
        filtered = base
        if sido:
            filtered = [t for t in filtered if (t["address"].get("sido") or "").find(sido) >= 0]
        if sigungu:
            filtered = [t for t in filtered if (t["address"].get("sigungu") or "").find(sigungu) >= 0]
        if dong:
            filtered = [t for t in filtered if (t["address"].get("dong") or "").find(dong) >= 0]
        if transaction_type:
            filtered = [t for t in filtered if t.get("transactionType") == transaction_type]
        if property_type:
            filtered = [t for t in filtered if t.get("propertyType") == property_type]
        return create_success_response({"transactions": filtered})
    except Exception as e:
        logger.error("실거래 API 오류: %s", e, exc_info=True)
        return create_error_response("실거래 정보 조회 실패", 500)


@app.route("/api/real-estate/registry-changes", methods=["GET"])
def api_real_estate_registry_changes():
    """부동산 등기 변경 정보 조회 (NotebookLLM RealEstateDataPanel 연동).
    실제 등기소 API 연동 전 샘플 데이터 반환."""
    try:
        sido = request.args.get("sido", "").strip()
        sigungu = request.args.get("sigungu", "").strip()
        dong = request.args.get("dong", "").strip()
        change_type = request.args.get("changeType", "").strip()
        base = [
            {
                "id": "reg-1",
                "changeType": "소유권이전",
                "propertyAddress": {"sido": "서울특별시", "sigungu": "강남구", "dong": "역삼동", "jibun": "123-45"},
                "changeDate": "2024-12-15",
                "previousOwner": {"name": "김○○", "share": "1/1"},
                "newOwner": {"name": "이○○", "share": "1/1"},
            },
            {
                "id": "reg-2",
                "changeType": "저당권설정",
                "propertyAddress": {"sido": "서울특별시", "sigungu": "서초구", "dong": "반포동", "jibun": "78-12"},
                "changeDate": "2024-12-10",
                "mortgageInfo": {"creditor": "○○은행", "amount": 500000000, "maturityDate": "2034-12-31"},
            },
            {
                "id": "reg-3",
                "changeType": "전세권설정",
                "propertyAddress": {"sido": "서울특별시", "sigungu": "송파구", "dong": "잠실동", "jibun": "200-1"},
                "changeDate": "2024-12-08",
                "leaseInfo": {"lessee": "박○○", "deposit": 300000000, "period": "2024.12~2026.12"},
            },
        ]
        filtered = base
        if sido:
            filtered = [c for c in filtered if (c["propertyAddress"].get("sido") or "").find(sido) >= 0]
        if sigungu:
            filtered = [c for c in filtered if (c["propertyAddress"].get("sigungu") or "").find(sigungu) >= 0]
        if dong:
            filtered = [c for c in filtered if (c["propertyAddress"].get("dong") or "").find(dong) >= 0]
        if change_type:
            filtered = [c for c in filtered if c.get("changeType") == change_type]
        return create_success_response({"changes": filtered})
    except Exception as e:
        logger.error("등기 변경 API 오류: %s", e, exc_info=True)
        return create_error_response("등기 변경 정보 조회 실패", 500)


# ----- 프로젝트·노트북 LLM·TTS API (프론트 연동) -----
def _project_api():
    """프로젝트/노트북 API 모듈 (lazy import)."""
    try:
        from api import project_session_api
        return project_session_api
    except Exception as e:
        logger.warning("project_session_api 미로드: %s", e)
        return None


@app.route("/api/projects", methods=["GET"])
def api_projects_list():
    """모든 프로젝트 조회 (노트북 LLM·사이드바)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    try:
        projects = psa.load_all_projects()
        for p in projects:
            p["source_count"] = psa.get_project_source_count(p.get("id", ""))
        return create_success_response({"data": projects, "count": len(projects)})
    except Exception as e:
        logger.error("프로젝트 목록 조회 오류: %s", e, exc_info=True)
        return create_error_response("프로젝트 목록 조회 실패", 500)


@app.route("/api/projects", methods=["POST"])
@validate_json_request()
def api_projects_create():
    """새 프로젝트 생성 (노트북 LLM 학습용)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    try:
        data = request.get_json() or {}
        name = (data.get("name") or "").strip() or "새 프로젝트"
        description = (data.get("description") or "").strip()
        tags = data.get("tags") or []
        initial_guidelines = data.get("initial_guidelines") or []
        project_id = f"proj_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(name) % 10000:04d}"
        now = datetime.now().isoformat()
        project_data = {
            "id": project_id,
            "name": name,
            "description": description,
            "tags": tags,
            "initial_guidelines": initial_guidelines,
            "status": "active",
            "messageCount": 0,
            "userId": "default",
            "createdAt": now,
            "updatedAt": now,
            "settings": {"aiModel": "chat", "temperature": 0.8, "maxTokens": 4096},
        }
        if psa.save_project(project_data):
            psa.save_project_notebook_context(
                project_id=project_id, name=name, description=description,
                tags=tags, initial_guidelines=initial_guidelines,
            )
            return create_success_response({"data": project_data})
        return create_error_response("프로젝트 저장 실패", 500)
    except Exception as e:
        logger.error("프로젝트 생성 오류: %s", e, exc_info=True)
        return create_error_response("프로젝트 생성 실패", 500)


@app.route("/api/projects/<project_id>", methods=["GET"])
def api_project_get(project_id):
    """특정 프로젝트 조회."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    project_data = psa.load_project(project_id)
    if not project_data:
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    return create_success_response({"data": project_data})


@app.route("/api/projects/<project_id>", methods=["PUT"])
@validate_json_request()
def api_project_update(project_id):
    """프로젝트 업데이트."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    project_data = psa.load_project(project_id)
    if not project_data:
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    updates = request.get_json() or {}
    project_data.update(updates)
    project_data["updatedAt"] = datetime.now().isoformat()
    if psa.save_project(project_data):
        if any(k in updates for k in ("name", "description", "tags", "initial_guidelines")):
            psa.save_project_notebook_context(
                project_id=project_id,
                name=project_data.get("name", ""),
                description=project_data.get("description", ""),
                tags=project_data.get("tags"),
                initial_guidelines=project_data.get("initial_guidelines"),
            )
        return create_success_response({"data": project_data})
    return create_error_response("프로젝트 저장 실패", 500)


def _infer_file_type(filename):
    """파일 확장자로 타입 추론 (document|image|code|other)."""
    ext = (filename or "").split(".")[-1].lower() if "." in (filename or "") else ""
    if ext in ("pdf", "doc", "docx", "txt", "md", "xlsx", "xls", "ppt", "pptx"):
        return "document"
    if ext in ("png", "jpg", "jpeg", "gif", "webp", "svg"):
        return "image"
    if ext in ("js", "ts", "tsx", "jsx", "py", "json", "html", "css", "scss"):
        return "code"
    return "other"


@app.route("/api/projects/<project_id>/files", methods=["POST"])
def api_project_files_upload(project_id):
    """프로젝트 참고 파일 업로드 (메타데이터만 저장, 바이너리는 저장하지 않음)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    project_data = psa.load_project(project_id)
    if not project_data:
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    f = request.files.get("file")
    if not f or f.filename in (None, ""):
        return create_error_response("파일이 없거나 파일명이 없습니다.", 400)
    try:
        f.seek(0, 2)
        size = f.tell()
        f.seek(0)
    except (OSError, AttributeError):
        size = 0
    file_id = str(uuid.uuid4())
    name = f.filename or "unnamed"
    file_type = _infer_file_type(name)
    now = datetime.now().isoformat()
    entry = {
        "id": file_id,
        "name": name,
        "type": file_type,
        "size": size,
        "uploadedAt": now,
    }
    files = project_data.get("files")
    if not isinstance(files, list):
        files = []
    files = list(files) + [entry]
    project_data["files"] = files
    project_data["updatedAt"] = now
    if psa.save_project(project_data):
        return create_success_response({"data": {"file": entry}})
    return create_error_response("프로젝트 저장 실패", 500)


@app.route("/api/projects/<project_id>", methods=["DELETE"])
def api_project_delete(project_id):
    """프로젝트 삭제."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    try:
        pf = psa.get_project_file(project_id)
        if not pf.exists():
            return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
        pf.unlink()
        kf = psa.get_project_knowledge_file(project_id)
        if kf.exists():
            try:
                kf.unlink()
            except OSError:
                pass
        return create_success_response({"deleted": project_id})
    except Exception as e:
        logger.error("프로젝트 삭제 오류: %s", e, exc_info=True)
        return create_error_response("프로젝트 삭제 실패", 500)


@app.route("/api/projects/<project_id>/notebook-context", methods=["GET"])
def api_notebook_context(project_id):
    """노트북 LLM 컨텍스트·소스 개수 조회."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    data = psa.load_project_notebook_data(project_id)
    if data is None:
        return create_success_response({
            "data": {"context": "", "has_context": False, "source_count": 0}
        })
    context_text = data.get("context_text") or ""
    source_count = psa.get_project_source_count(project_id)
    sources = data.get("sources")
    return create_success_response({
        "data": {
            "context": context_text,
            "has_context": bool(context_text.strip()),
            "source_count": source_count,
            "sources": sources if isinstance(sources, list) else None,
        }
    })


@app.route("/api/projects/<project_id>/notebook-sources", methods=["GET"])
def api_notebook_sources_list(project_id):
    """노트북 소스 목록 (일반 소스 + 보이스 소스)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    data = psa.load_project_notebook_data(project_id)
    if not data:
        return create_success_response({"data": [], "count": 0})
    sources = list(data.get("sources") or [])
    voice_sources = list(data.get("voice_sources") or [])
    return create_success_response({"data": sources + voice_sources, "count": len(sources) + len(voice_sources)})


@app.route("/api/projects/<project_id>/notebook-sources", methods=["POST"])
@validate_json_request()
def api_notebook_sources_add(project_id):
    """노트북 소스 추가 (제목·내용·타입)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    data = request.get_json() or {}
    title = (data.get("title") or "제목 없음").strip()
    content = (data.get("content") or "").strip()
    stype = (data.get("type") or "text").strip().lower()
    new_source = psa.add_project_notebook_source(project_id, title=title, content=content, source_type=stype)
    if not new_source:
        return create_error_response("소스 추가 실패", 500)
    return create_success_response({
        "data": {"source": new_source, "source_count": psa.get_project_source_count(project_id)}
    })


@app.route("/api/projects/<project_id>/notebook-sources/<source_id>", methods=["DELETE"])
def api_notebook_sources_delete(project_id, source_id):
    """노트북 소스 삭제."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    ok = psa.delete_project_notebook_source(project_id, source_id)
    if not ok:
        return create_error_response("소스 삭제 실패 또는 소스 없음", 404)
    return create_success_response({"data": {"source_count": psa.get_project_source_count(project_id)}})


@app.route("/api/projects/<project_id>/sessions", methods=["GET"])
def api_projects_sessions(project_id):
    """프로젝트 세션 목록 (CORBU.AI 대화·사이드바)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    try:
        sessions = psa.load_all_sessions(project_id)
        return create_success_response({"data": sessions, "count": len(sessions)})
    except Exception as e:
        logger.error("세션 목록 조회 오류: %s", e, exc_info=True)
        return create_error_response("세션 목록 조회 실패", 500)


@app.route("/api/projects/<project_id>/voice-sources", methods=["GET"])
def api_voice_sources_list(project_id):
    """프로젝트 보이스 소스 목록 (목소리 생성·노트북 LLM)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    sources = psa.get_project_voice_sources(project_id)
    return create_success_response({"success": True, "data": sources, "count": len(sources)})


@app.route("/api/projects/<project_id>/voice-sources", methods=["POST"])
@validate_json_request()
def api_voice_sources_add(project_id):
    """프로젝트에 보이스 소스(YouTube/TikTok URL) 추가."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    data = request.get_json() or {}
    url = (data.get("url") or "").strip()
    ref_text = (data.get("ref_text") or "").strip() or None
    name = (data.get("name") or "").strip() or None
    reference_url = (data.get("reference_url") or "").strip() or None
    start_seconds = data.get("start_seconds")
    end_seconds = data.get("end_seconds")
    if start_seconds is not None:
        try:
            start_seconds = float(start_seconds)
        except (TypeError, ValueError):
            start_seconds = None
    if end_seconds is not None:
        try:
            end_seconds = float(end_seconds)
        except (TypeError, ValueError):
            end_seconds = None
    if not url:
        return create_error_response("url이 필요합니다.", 400)
    new_source = psa.add_project_voice_source(
        project_id, url, ref_text,
        name=name, reference_url=reference_url,
        start_seconds=start_seconds, end_seconds=end_seconds,
    )
    if not new_source:
        return create_error_response("보이스 소스 추가 실패", 500)
    return create_success_response({"success": True, "data": new_source})


@app.route("/api/projects/<project_id>/voice-sources/<source_id>", methods=["DELETE"])
def api_voice_sources_delete(project_id, source_id):
    """프로젝트 보이스 소스 삭제."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    ok = psa.delete_project_voice_source(project_id, source_id)
    if not ok:
        return create_error_response("보이스 소스 삭제 실패 또는 소스 없음", 404)
    return create_success_response({"success": True, "data": {"deleted": source_id}})


@app.route("/api/projects/<project_id>/notebook-studio/generate", methods=["POST"])
@validate_json_request()
def api_notebook_studio_generate(project_id):
    """노트북 스튜디오 출력 생성 (보고서/퀴즈/요약 등)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    data = request.get_json() or {}
    out_type = (data.get("type") or "summary").strip().lower()
    context = psa.load_project_notebook_context(project_id) or ""
    content = f"# {out_type}\n\n(프로젝트 컨텍스트 기반 생성)\n\n{context}" if context else f"# {out_type}\n\n(소스를 추가한 뒤 다시 시도해 주세요.)"
    try:
        entry = psa.append_project_studio_output(project_id, out_type, content)
        return create_success_response({"success": True, "data": entry})
    except Exception as e:
        logger.error("스튜디오 생성 오류: %s", e, exc_info=True)
        return create_error_response("스튜디오 생성 실패", 500)


@app.route("/api/projects/<project_id>/notebook-studio/outputs", methods=["GET"])
def api_notebook_studio_outputs_list(project_id):
    """노트북 스튜디오 출력 목록."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    outputs = psa.load_project_studio_outputs(project_id)
    return create_success_response({"success": True, "data": outputs, "count": len(outputs)})


@app.route("/api/projects/<project_id>/notebook-studio/outputs/<output_id>", methods=["GET"])
def api_notebook_studio_output(project_id, output_id):
    """노트북 스튜디오 출력 단건 조회."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    outputs = psa.load_project_studio_outputs(project_id)
    for o in outputs:
        if o.get("id") == output_id:
            return create_success_response({"success": True, "data": o})
    return create_error_response("출력을 찾을 수 없습니다.", 404)


@app.route("/api/projects/<project_id>/notebook-suggested-questions", methods=["GET"])
def api_notebook_suggested_questions(project_id):
    """노트북 LLM 추천 질문 (프로젝트 컨텍스트 기반)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    context = psa.load_project_notebook_context(project_id) or ""
    questions = [
        "이 프로젝트의 핵심 내용을 요약해 주세요.",
        "주요 개념이나 키워드를 알려주세요.",
        "이 자료를 바탕으로 질문할 만한 것을 제안해 주세요.",
    ]
    if len(context) > 200:
        questions.append("위 내용에서 가장 중요한 부분을 짧게 정리해 주세요.")
    return create_success_response({"success": True, "data": questions})


@app.route("/api/projects/<project_id>/notebook-sources/from-url", methods=["POST"])
@validate_json_request()
def api_notebook_sources_from_url(project_id):
    """URL에서 본문 추출 후 노트북 소스로 추가."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    data = request.get_json() or {}
    url = (data.get("url") or "").strip()
    if not url:
        return create_error_response("url이 필요합니다.", 400)
    try:
        fetch_fn = getattr(psa, "_fetch_url_and_extract_text", None)
        if not fetch_fn:
            return create_error_response("URL 소스 추가 기능을 사용할 수 없습니다.", 503)
        title, content = fetch_fn(url)
        new_source = psa.add_project_notebook_source(project_id, title, content, "text")
        if not new_source:
            return create_error_response("소스 추가 실패", 500)
        return create_success_response({"success": True, "data": {"source": new_source, "source_count": psa.get_project_source_count(project_id)}})
    except Exception as e:
        logger.warning("from-url 소스 추가 오류: %s", e)
        return create_error_response("URL에서 텍스트 추출 또는 소스 추가 실패: " + str(e), 500)


@app.route("/api/projects/<project_id>/notebook-sources/from-youtube-url", methods=["POST"])
@validate_json_request()
def api_notebook_sources_from_youtube_url(project_id):
    """YouTube 영상 URL 하나를 자막 추출해 노트북 지식 소스로 추가."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    data = request.get_json() or {}
    url = (data.get("url") or "").strip()
    if not url:
        return create_error_response("url이 필요합니다.", 400)
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    try:
        extract_id = getattr(psa, "_extract_youtube_video_id", None)
        transcript_fn = getattr(psa, "_get_youtube_transcript", None)
        title_fn = getattr(psa, "_get_youtube_video_title", None)
        if not extract_id or not transcript_fn:
            return create_error_response("YouTube 소스 추가 기능을 사용할 수 없습니다.", 503)
        video_id = extract_id(url)
        if not video_id:
            return create_error_response("유효한 YouTube URL이 아닙니다. youtube.com/watch?v=... 또는 youtu.be/... 형식으로 입력해주세요.", 400)
        content = transcript_fn(video_id)
        if not (content or "").strip():
            return create_error_response("해당 영상에서 자막을 추출할 수 없습니다. 자막이 있는 영상인지 확인하거나, pip install youtube-transcript-api", 400)
        title = title_fn(video_id) if title_fn else f"YouTube 영상 ({video_id})"
        new_source = psa.add_project_notebook_source(project_id, title, content.strip(), "youtube")
        if not new_source:
            return create_error_response("소스 추가 실패", 500)
        return create_success_response({"success": True, "data": {"source": new_source, "source_count": psa.get_project_source_count(project_id)}})
    except Exception as e:
        logger.warning("from-youtube-url 소스 추가 오류: %s", e)
        return create_error_response("YouTube 자막 추출 또는 소스 추가 실패: " + str(e), 500)


@app.route("/api/projects/<project_id>/notebook-sources/from-youtube-search", methods=["POST"])
@validate_json_request()
def api_notebook_sources_from_youtube_search(project_id):
    """YouTube 검색 후 첫 영상 자막을 노트북 소스로 추가 (선택)."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    data = request.get_json() or {}
    query = (data.get("query") or "").strip()
    if not query:
        return create_error_response("query가 필요합니다.", 400)
    try:
        search_fn = getattr(psa, "_youtube_search_videos", None)
        transcript_fn = getattr(psa, "_get_youtube_transcript", None)
        if not search_fn:
            return create_success_response({"success": True, "data": {"sources": [], "message": "YouTube 검색 미지원"}})
        videos = search_fn(query, max_videos=3)
        added = []
        for v in videos[:1]:
            vid = v.get("id") or (v.get("url") or "").split("watch?v=")[-1].split("&")[0]
            if not vid:
                continue
            content = transcript_fn(vid) if transcript_fn else ""
            title = v.get("title", "YouTube")[:200]
            if content:
                src = psa.add_project_notebook_source(project_id, title, content, "text")
                if src:
                    added.append(src)
        return create_success_response({"success": True, "data": {"sources": added, "source_count": psa.get_project_source_count(project_id)}})
    except Exception as e:
        logger.warning("from-youtube-search 오류: %s", e)
        return create_error_response("YouTube 검색 또는 소스 추가 실패: " + str(e), 500)


@app.route("/api/projects/<project_id>/notebook-sources/from-file", methods=["POST"])
def api_notebook_sources_from_file(project_id):
    """업로드 파일(PDF·워드·TXT·이미지)에서 텍스트 추출 후 노트북 소스(학습 자료)로 추가."""
    psa = _project_api()
    if not psa:
        return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
    if not psa.load_project(project_id):
        return create_error_response("프로젝트를 찾을 수 없습니다.", 404)
    f = request.files.get("file")
    if not f or not f.filename:
        return create_error_response("file 업로드가 필요합니다.", 400)
    try:
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix="_" + (f.filename or "file")) as tmp:
            f.save(tmp.name)
            path = __import__("pathlib").Path(tmp.name)
        try:
            extract_fn = getattr(psa, "_extract_text_from_upload", None)
            if not extract_fn:
                return create_error_response("파일 소스 추가 기능을 사용할 수 없습니다.", 503)
            title, content = extract_fn(path, f.filename or "file")
            stype = "pdf" if (f.filename or "").lower().endswith(".pdf") else ("doc" if (f.filename or "").lower().endswith((".docx", ".doc")) else "text")
            new_source = psa.add_project_notebook_source(project_id, title, content, stype)
            if not new_source:
                return create_error_response("소스 추가 실패", 500)
            return create_success_response({"success": True, "data": {"source": new_source, "source_count": psa.get_project_source_count(project_id)}})
        finally:
            try:
                path.unlink(missing_ok=True)
            except Exception:
                pass
    except ValueError as e:
        return create_error_response(str(e), 400)
    except Exception as e:
        logger.warning("from-file 소스 추가 오류: %s", e)
        return create_error_response("파일 처리 또는 소스 추가 실패: " + str(e), 500)


# TTS (목소리 생성) API — 설정·보이스 목록·음성 생성
@app.route("/api/tts/config", methods=["GET"])
def api_tts_config():
    """TTS 사용 가능 여부 및 설정."""
    base_url = os.environ.get("QWEN_TTS_BASE_URL", "").rstrip("/")
    available = bool(base_url)
    return create_success_response({
        "success": True,
        "available": available,
        "base_url_configured": available,
        "message": "Qwen3-TTS 사용 가능" if available else "QWEN_TTS_BASE_URL를 설정해 주세요.",
    })


@app.route("/api/tts/voices", methods=["GET"])
def api_tts_voices():
    """TTS 보이스 목록 (Qwen TTS 서버에서 조회, 실패 시 빈 목록)."""
    try:
        import requests as req
        base = os.environ.get("QWEN_TTS_BASE_URL", "").rstrip("/")
        if not base:
            return create_success_response({"success": True, "voices": [], "message": "TTS 미설정"})
        r = req.get(f"{base}/v1/audio/voices", timeout=10)
        if r.status_code != 200:
            return create_success_response({"success": True, "voices": [], "message": r.text[:200]})
        data = r.json()
        voices = data if isinstance(data, list) else data.get("data", data)
        return create_success_response({"success": True, "voices": voices or []})
    except Exception as e:
        logger.warning("TTS voices 조회 오류: %s", e)
        return create_success_response({"success": True, "voices": [], "message": str(e)})


def _extract_text_from_docx_bytes(data: bytes) -> str:
    """docx 파일 바이트에서 텍스트 추출. python-docx 미설치 시 ValueError."""
    try:
        import docx as docx_module  # type: ignore
    except ImportError as e:
        logger.warning("python-docx 미설치: %s", e)
        raise ValueError(
            "docx 파일 추출을 위해 python-docx가 필요합니다. pip install python-docx 를 실행해 주세요."
        ) from e
    try:
        import io
        doc = docx_module.Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs if p.text).strip()
    except Exception as e:
        logger.warning("docx 텍스트 추출 실패: %s", e)
        return ""


def _suggest_document_hint_from_filename(filename: str) -> str:
    """파일명 기반 문서 유형 힌트 (톤다운·기업 등)."""
    if not filename:
        return ""
    f = filename.lower()
    if "톤다운" in filename or "보도" in filename or "tone" in f or "press" in f:
        return "tone_down"
    if "기업" in filename or "pr" in f or "corporate" in f:
        return "corporate"
    return ""


def _extract_dialogue_only(text: str) -> str:
    """대본에서 대화(말하는 부분)만 추출. 지문·괄호 안 설명 제거, '이름: 대사'는 대사만 반환 (목소리 생성용)."""
    import re
    lines = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        # 괄호만 있는 줄(지문, 연출) 제거: (울며), (한숨), [장면], 등
        if (line.startswith("(") and line.endswith(")")) or (line.startswith("[") and line.endswith("]")):
            continue
        if re.match(r"^[(\[]", line) and re.search(r"[)\]]\s*$", line):
            continue
        # "캐릭터명: 대사" 형식이면 대사 부분만 (목소리로 읽을 텍스트)
        if ":" in line:
            idx = line.find(":")
            after = line[idx + 1:].strip()
            if after:
                lines.append(after)
            continue
        lines.append(line)
    result = "\n".join(lines).strip()
    return result if result else text


@app.route("/api/tts/script-style/extract-document", methods=["POST"])
def api_tts_script_style_extract_document():
    """워드(docx) 또는 텍스트 파일에서 대본 텍스트 추출 (샘플 대본·음성 생성용). 대화만 추출한 dialogue_only 반환."""
    f = request.files.get("file")
    if not f or not f.filename:
        return jsonify({"success": False, "error": "파일이 없습니다.", "detail": "파일이 없습니다."}), 400
    ext = (f.filename or "").rsplit(".", 1)[-1].lower()
    try:
        raw = f.read()
        if not raw:
            return jsonify({"success": False, "error": "빈 파일입니다.", "detail": "빈 파일입니다."}), 400
        if ext == "docx":
            try:
                text = _extract_text_from_docx_bytes(raw)
            except ValueError as e:
                return jsonify({"success": False, "error": str(e), "detail": str(e)}), 503
        elif ext == "txt":
            text = raw.decode("utf-8", errors="replace").strip()
        else:
            return jsonify({"success": False, "error": "지원 형식: .docx, .txt", "detail": "지원 형식: .docx, .txt"}), 400
        if not text:
            return jsonify({"success": False, "error": "추출된 텍스트가 없습니다.", "detail": "추출된 텍스트가 없습니다."}), 400
        suggested = _suggest_document_hint_from_filename(f.filename or "")
        dialogue_only = _extract_dialogue_only(text)
        return jsonify({
            "success": True,
            "text": text,
            "dialogue_only": dialogue_only,
            "suggested_document_hint": suggested,
        })
    except Exception as e:
        logger.exception("문서 추출 실패: %s", e)
        return jsonify({"success": False, "error": f"문서 추출 실패: {e}", "detail": str(e)}), 500


def _script_style_hint_instruction(hint: str, for_analyze: bool) -> str:
    """문서 유형 힌트에 따른 분석/생성 지시문."""
    if not hint:
        return ""
    if hint == "tone_down":
        if for_analyze:
            return (
                "이 문서는 톤다운안·보도자료일 수 있으므로, 격식·중립·신중한 표현, "
                "과장 완화·객관적 서술을 특히 분석해 주세요. "
            )
        return "톤다운·보도 스타일이므로 과장 없이 중립·신중·격식체를 유지해 주세요. "
    if hint == "corporate":
        if for_analyze:
            return (
                "이 문서는 기업·PR·보도 자료일 수 있으므로, 정중함·객관성·숫자·사실 전달 방식을 특히 분석해 주세요. "
            )
        return "기업·PR 스타일이므로 정중·객관·사실 위주로 유지해 주세요. "
    return ""


@app.route("/api/tts/script-style/analyze", methods=["POST"])
def api_tts_script_style_analyze():
    """샘플 대본의 톤·스타일·어투·말투 분석. JSON: sample_script, document_hint?, source_filename?"""
    data = request.get_json() or {}
    sample = (data.get("sample_script") or "").strip()
    if not sample:
        return jsonify({"success": False, "error": "sample_script가 비어 있습니다.", "detail": "sample_script가 비어 있습니다."}), 400
    hint = (data.get("document_hint") or "").strip() or None
    filename_note = f" (원본 파일명: {data.get('source_filename')})" if (data.get("source_filename") or "").strip() else ""
    try:
        hint_instruction = _script_style_hint_instruction(hint or "", True)
        prompt = (
            "다음 대본의 톤(tone), 스타일(문체), 어투(격식/비격식), 말투(감정·리듬·호흡)를 분석해 주세요. "
            + hint_instruction
            + "한국어로 요약과 핵심 특성을 짧게 나열해 주세요. 불릿 포인트로 정리해도 됩니다."
            + filename_note
            + "\n\n대본:\n"
            + sample
        )
        result = ai_engine.analyze_message(prompt)
        if not result.get("success"):
            return jsonify({"success": False, "error": "스타일 분석 실패", "detail": result.get("message", "분석 실패")}), 500
        summary = (result.get("response") or "").strip()
        lines = [ln.strip() for ln in summary.split("\n") if ln.strip()][:10]
        key_traits = lines if len(lines) > 1 else [summary[:500]] if summary else []
        return jsonify({"success": True, "style_summary": summary, "key_traits": key_traits})
    except Exception as e:
        logger.exception("스타일 분석 실패: %s", e)
        return jsonify({"success": False, "error": f"스타일 분석 실패: {e}", "detail": str(e)}), 500


@app.route("/api/tts/script-style/generate", methods=["POST"])
def api_tts_script_style_generate():
    """샘플 스타일을 유지한 채 주제/개요에 맞는 새 대본 생성. JSON: sample_script, topic_or_outline, document_hint?, source_filename?"""
    data = request.get_json() or {}
    sample = (data.get("sample_script") or "").strip()
    topic = (data.get("topic_or_outline") or "").strip()
    if not sample:
        return jsonify({"success": False, "error": "sample_script가 비어 있습니다.", "detail": "sample_script가 비어 있습니다."}), 400
    if not topic:
        return jsonify({"success": False, "error": "topic_or_outline가 비어 있습니다.", "detail": "topic_or_outline가 비어 있습니다."}), 400
    hint = (data.get("document_hint") or "").strip() or None
    try:
        hint_instruction = _script_style_hint_instruction(hint or "", False)
        prompt = (
            "아래 '참조 대본'의 톤, 스타일, 어투, 말투를 그대로 살려서 "
            "'생성할 주제/개요'에 맞는 새 대본만 작성해 주세요. "
            + hint_instruction
            + "설명이나 부가 문구 없이 대본 본문만 출력해 주세요.\n\n"
            "참조 대본:\n"
            + sample
            + "\n\n생성할 주제/개요:\n"
            + (topic[:2000] if len(topic) > 2000 else topic)
        )
        result = ai_engine.analyze_message(prompt)
        if not result.get("success"):
            return jsonify({"success": False, "error": "대본 생성 실패", "detail": result.get("message", "생성 실패")}), 500
        generated = (result.get("response") or "").strip()
        return jsonify({"success": True, "generated_script": generated})
    except Exception as e:
        logger.exception("스타일 대본 생성 실패: %s", e)
        return jsonify({"success": False, "error": f"대본 생성 실패: {e}", "detail": str(e)}), 500


@app.route("/api/tts/situations", methods=["GET"])
def api_tts_situations():
    """TTS 상황별 성우 목소리 프리셋 (UI 선택용)."""
    situations = [
        {"id": "default", "label": "기본", "instructions_preview": ""},
        {"id": "narration", "label": "나레이션", "instructions_preview": "차분한 나레이션 톤으로"},
        {"id": "news", "label": "뉴스/앵커", "instructions_preview": "뉴스 앵커처럼"},
        {"id": "drama_dialogue", "label": "드라마 대사", "instructions_preview": "드라마 대사처럼 연기"},
        {"id": "movie_dialogue", "label": "영화 대사", "instructions_preview": "영화 대사처럼"},
    ]
    return create_success_response({"success": True, "situations": situations})


def _tts_base_url():
    """TTS 서버 URL. 없으면 None."""
    base = os.environ.get("QWEN_TTS_BASE_URL", "").rstrip("/")
    return base if base else None


def _tts_content_type(fmt):
    m = {"wav": "audio/wav", "mp3": "audio/mpeg", "flac": "audio/flac", "pcm": "audio/basic", "aac": "audio/aac", "opus": "audio/opus"}
    return m.get((fmt or "mp3").lower(), "audio/mpeg")


def _tts_is_media_url(url: str) -> bool:
    """YouTube/TikTok 등 지원 URL 여부."""
    u = (url or "").strip().lower()
    return bool(
        "youtube.com" in u or "youtu.be" in u or "tiktok.com" in u or "vm.tiktok.com" in u
    )


def _tts_download_audio_from_url(url: str, max_seconds: int = 10) -> Tuple[bytes, str]:
    """
    URL에서 오디오 추출. YouTube/TikTok은 yt-dlp 사용, 그 외는 HTTP GET.
    반환: (bytes, mime) 예: (wav_bytes, "audio/wav"). yt-dlp 미설치 시 YT/TikTok에서 실패.
    """
    url = (url or "").strip()
    if not url:
        raise ValueError("URL이 비어 있습니다.")
    if _tts_is_media_url(url):
        try:
            import yt_dlp
        except ImportError:
            raise RuntimeError(
                "영상에서 음성 추출을 위해 yt-dlp가 필요합니다. pip install yt-dlp"
            )
        out_dir = tempfile.mkdtemp()
        out_path = os.path.join(out_dir, "audio.%(ext)s")
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": out_path,
            "quiet": True,
            "no_warnings": True,
            "postprocessors": [
                {"key": "FFmpegExtractAudio", "preferredcodec": "wav", "preferredquality": None}
            ],
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
        except Exception as e:
            try:
                for f in os.listdir(out_dir):
                    os.unlink(os.path.join(out_dir, f))
                os.rmdir(out_dir)
            except OSError:
                pass
            raise RuntimeError(f"영상 다운로드 실패: {e!s}") from e
        wav_candidates = [os.path.join(out_dir, f) for f in os.listdir(out_dir) if f.endswith(".wav")]
        if not wav_candidates:
            for f in os.listdir(out_dir):
                if f.startswith("audio."):
                    wav_candidates = [os.path.join(out_dir, f)]
                    break
        if not wav_candidates:
            try:
                for f in os.listdir(out_dir):
                    os.unlink(os.path.join(out_dir, f))
                os.rmdir(out_dir)
            except OSError:
                pass
            raise RuntimeError("오디오 추출 결과 없음")
        wav_file = wav_candidates[0]
        try:
            with open(wav_file, "rb") as f:
                raw = f.read()
        finally:
            try:
                for f in os.listdir(out_dir):
                    os.unlink(os.path.join(out_dir, f))
                os.rmdir(out_dir)
            except OSError:
                pass
        return raw, "audio/wav"
    # 직접 HTTP URL: GET으로 다운로드
    try:
        import requests as req
        r = req.get(url, timeout=60, stream=True)
        r.raise_for_status()
        raw = r.content
        ctype = (r.headers.get("Content-Type") or "audio/wav").split(";")[0].strip().lower()
        if "audio/" not in ctype:
            ctype = "audio/wav"
        return raw, ctype
    except Exception as e:
        raise RuntimeError(f"URL 다운로드 실패: {e!s}") from e


def _tts_proxy_speech_sync(payload: Dict[str, Any], base: str) -> Tuple[bytes, str]:
    """Qwen3-TTS 서버에 /v1/audio/speech 동기 POST 후 (bytes, content_type) 반환."""
    import requests as req
    url = f"{base}/v1/audio/speech"
    r = req.post(url, json=payload, timeout=300)
    if r.status_code != 200:
        raise RuntimeError(f"TTS 서버 오류: {r.status_code} - {(r.text or '')[:200]}")
    fmt = payload.get("response_format", "mp3")
    return r.content, _tts_content_type(fmt)


def _tts_fallback_gtts(text: str, lang: str = "ko") -> Tuple[bytes, str]:
    """Qwen 미설정 시 gTTS로 mp3 생성. (bytes, mimetype) 반환."""
    import io
    try:
        from gtts import gTTS
    except ImportError as e:
        raise ValueError(
            "TTS 서버가 설정되지 않았습니다. QWEN_TTS_BASE_URL를 설정하거나 "
            "폴백 음성 사용을 위해 pip install gtts 를 실행해 주세요."
        ) from e
    text = (text or "").strip()
    if not text:
        raise ValueError("합성할 텍스트가 비어 있습니다.")
    # gTTS 장문 제한 완화를 위해 최대 길이 제한 (약 5000자)
    if len(text) > 5000:
        text = text[:5000]
    buf = io.BytesIO()
    tts = gTTS(text=text, lang=lang)
    tts.write_to_fp(buf)
    return buf.getvalue(), "audio/mpeg"


@app.route("/api/tts/speech", methods=["POST"])
def api_tts_speech():
    """TTS 음성 생성 (Qwen3-TTS 프록시). 미설정 시 gTTS 폴백."""
    data = request.get_json() or {}
    if not data.get("input"):
        return create_error_response("input(합성할 텍스트)이 필요합니다.", 400)
    base = _tts_base_url()
    if base:
        try:
            import requests as req
            url = f"{base}/v1/audio/speech"
            r = req.post(url, json=data, timeout=300)
            if r.status_code != 200:
                return create_error_response(
                    f"TTS 서버 오류: {r.status_code} - {(r.text or '')[:200]}", 502
                )
            fmt = (data.get("response_format") or "mp3").lower()
            return Response(r.content, mimetype=_tts_content_type(fmt))
        except Exception as e:
            logger.exception("TTS speech 오류: %s", e)
            return create_error_response(f"TTS 처리 중 오류: {e!s}", 502)
    # Qwen 미설정 → gTTS 폴백 (설치 시)
    try:
        body, mimetype = _tts_fallback_gtts(data.get("input"), lang="ko")
        return Response(body, mimetype=mimetype)
    except ValueError as e:
        return create_error_response(str(e), 503)
    except Exception as e:
        logger.exception("TTS gTTS 폴백 오류: %s", e)
        return create_error_response(f"음성 생성 실패: {e!s}", 502)


@app.route("/api/tts/speech-from-source", methods=["POST"])
def api_tts_speech_from_source():
    """URL에서 목소리 학습 후 TTS. QWEN_TTS_BASE_URL 필요. YouTube/TikTok은 yt-dlp 필요."""
    base = _tts_base_url()
    if not base:
        return create_error_response("QWEN_TTS_BASE_URL를 설정해 주세요. speech-from-source는 TTS 서버 설정 후 사용 가능합니다.", 503)
    try:
        data = request.get_json() or {}
        source_url = (data.get("source_url") or "").strip()
        text = (data.get("input") or "").strip()
        if not source_url or not text:
            return create_error_response("source_url과 input(텍스트)이 필요합니다.", 400)
        if _tts_is_media_url(source_url):
            try:
                import yt_dlp  # noqa: F401
            except ImportError:
                return create_error_response(
                    "영상에서 음성 추출을 위해 yt-dlp가 필요합니다. pip install yt-dlp",
                    501,
                )
        max_sec = int(data.get("max_ref_seconds") or 10)
        max_sec = min(60, max(1, max_sec))
        audio_bytes, mime = _tts_download_audio_from_url(source_url, max_seconds=max_sec)
        ref_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        ref_audio_data_url = f"data:{mime};base64,{ref_b64}"
        response_format = (data.get("response_format") or "mp3").lower()
        payload = {
            "input": text,
            "task_type": "Base",
            "ref_audio": ref_audio_data_url,
            "response_format": response_format,
            "max_new_tokens": 4096,
            "quality_preset": "voice_clone_max",
            "enhance_ref_audio": data.get("enhance_ref_audio", True),
            "naturalness_mode": data.get("naturalness_mode") or "natural",
            "speed": float(data.get("speed") or 1.0),
        }
        body, content_type = _tts_proxy_speech_sync(payload, base)
        return Response(body, mimetype=content_type)
    except ValueError as e:
        return create_error_response(str(e), 400)
    except RuntimeError as e:
        msg = str(e)
        if "yt-dlp" in msg or "yt_dlp" in msg:
            return create_error_response(msg, 501)
        return create_error_response(msg, 502)
    except Exception as e:
        logger.exception("TTS speech-from-source 오류: %s", e)
        return create_error_response(f"TTS 처리 중 오류: {e!s}", 502)


@app.route("/api/tts/speech-from-project", methods=["POST"])
def api_tts_speech_from_project():
    """프로젝트 보이스 소스로 TTS. QWEN_TTS_BASE_URL 및 프로젝트 보이스 소스 필요."""
    base = _tts_base_url()
    if not base:
        return create_error_response("QWEN_TTS_BASE_URL를 설정해 주세요. speech-from-project는 TTS 서버 설정 후 사용 가능합니다.", 503)
    try:
        data = request.get_json() or {}
        project_id = (data.get("project_id") or "").strip()
        text = (data.get("input") or "").strip()
        if not project_id or not text:
            return create_error_response("project_id와 input(텍스트)이 필요합니다.", 400)
        psa = _project_api()
        if not psa:
            return create_error_response("프로젝트 API를 사용할 수 없습니다.", 503)
        sources = psa.get_project_voice_sources(project_id)
        if not sources:
            return create_error_response("이 프로젝트에 보이스 소스가 없습니다. YouTube/TikTok URL을 보이스 소스로 추가해 주세요.", 400)
        voice_id = (data.get("voice_source_id") or "").strip()
        chosen = next((s for s in sources if s.get("id") == voice_id), sources[0])
        source_url = (chosen.get("url") or "").strip()
        if not source_url:
            return create_error_response("선택한 보이스 소스에 URL이 없습니다.", 400)
        if _tts_is_media_url(source_url):
            try:
                import yt_dlp  # noqa: F401
            except ImportError:
                return create_error_response(
                    "영상에서 음성 추출을 위해 yt-dlp가 필요합니다. pip install yt-dlp",
                    501,
                )
        max_sec = int(data.get("max_ref_seconds") or 10)
        max_sec = min(60, max(1, max_sec))
        audio_bytes, mime = _tts_download_audio_from_url(source_url, max_seconds=max_sec)
        ref_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        ref_audio_data_url = f"data:{mime};base64,{ref_b64}"
        response_format = (data.get("response_format") or "mp3").lower()
        payload = {
            "input": text,
            "task_type": "Base",
            "ref_audio": ref_audio_data_url,
            "response_format": response_format,
            "max_new_tokens": 4096,
            "quality_preset": "voice_clone_max",
            "enhance_ref_audio": data.get("enhance_ref_audio", True),
            "naturalness_mode": data.get("naturalness_mode") or "natural",
            "speed": float(data.get("speed") or 1.0),
        }
        ref_text = (chosen.get("ref_text") or "").strip() or (data.get("ref_text_override") or "").strip()
        if ref_text:
            payload["ref_text"] = ref_text
        body, content_type = _tts_proxy_speech_sync(payload, base)
        return Response(body, mimetype=content_type)
    except ValueError as e:
        return create_error_response(str(e), 400)
    except RuntimeError as e:
        msg = str(e)
        if "yt-dlp" in msg or "yt_dlp" in msg:
            return create_error_response(msg, 501)
        return create_error_response(msg, 502)
    except Exception as e:
        logger.exception("TTS speech-from-project 오류: %s", e)
        return create_error_response(f"TTS 처리 중 오류: {e!s}", 502)


@app.route("/api/chat/title", methods=["POST"])
@monitor_performance
def chat_title_endpoint():
    """대화 제목 자동 생성 (프론트 ChatGPTInterface 호환). message 또는 assistant_response 기반 짧은 제목 반환."""
    try:
        data = request.get_json() or {}
        message = (data.get("message") or "").strip()
        assistant_response = (data.get("assistant_response") or "").strip()
        max_length = min(50, max(10, data.get("max_length", 30)))

        if message:
            title = message[:max_length].strip()
        elif assistant_response:
            title = assistant_response[:max_length].strip()
        else:
            title = "새 대화"

        return create_success_response({"title": title})
    except Exception as e:
        logger.warning(f"제목 생성 오류: {e}")
        return create_success_response({"title": "새 대화"})


@app.route("/api/chat", methods=["POST"])
@validate_json_request(required_fields=["message"])
@monitor_performance
def chat_endpoint():
    """대화 응답 생성 API (프론트엔드 호환성)

    프론트엔드에서 사용하는 표준화된 대화 API 엔드포인트입니다.
    SimpleIntegratedAI 엔진을 사용하여 메시지를 분석하고 응답을 생성합니다.

    Args (요청 본문):
        message (str): 사용자 메시지 (필수, 최대 10,000자)
        user_id (str, optional): 사용자 ID (기본값: "anonymous")
        quality (str, optional): 응답 품질 ("basic", "enhanced", "ultimate", 기본값: "enhanced")
        conversation_id (str, optional): 대화 ID
        context (dict, optional): 추가 컨텍스트 정보

    Returns:
        JSON 응답:
        - success (bool): 성공 여부
        - response (str): 생성된 응답 텍스트
        - data (dict): 상세 정보 (model, tokens, processing_time, confidence 등)
        - timestamp (str): 응답 생성 시간

    Raises:
        400: 메시지가 비어있거나 너무 길거나 짧은 경우
        500: 서버 오류 또는 응답 생성 실패

    Example:
        POST /api/chat
        {
            "message": "안녕하세요",
            "user_id": "user123",
            "quality": "enhanced"
        }
    """
    try:
        data = request.get_json()
        message = data.get("message", "").strip()
        user_id = data.get("user_id", "anonymous")
        quality = data.get("quality", "enhanced")
        conversation_id = data.get("conversation_id")
        # 질문·요구 등 프론트 context를 백엔드에서 사용해 결과물 생성
        context = data.get("context") if isinstance(data.get("context"), dict) else {}

        # 입력 검증
        err = validate_message_length(message, CHAT_MAX_MESSAGE_LENGTH, "메시지")
        if err:
            return err

        # quality 값 검증
        if quality not in ["basic", "enhanced", "ultimate"]:
            quality = "enhanced"  # 기본값으로 설정
            logger.warning(f"잘못된 quality 값, 기본값(enhanced)으로 설정: {quality}")

        logger.info(
            f"대화 요청 수신: user_id={user_id}, quality={quality}, message_length={len(message)}"
        )

        # 라우팅·근거·검증 중심 파이프라인 — use_pipeline_v2 또는 agentic_pipeline
        # docs/QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md · pipeline_gate (basic/fast → 생략)
        _run_pl = bool(context.get("use_pipeline_v2") or context.get("agentic_pipeline"))
        try:
            from api.question_answer_pipeline.pipeline_gate import (
                should_skip_qa_pipeline_for_speed,
            )

            if should_skip_qa_pipeline_for_speed(quality=quality, context=context):
                _run_pl = False
        except Exception:
            if (quality or "").strip().lower() == "basic":
                _run_pl = False

        if _run_pl:
            try:
                from api.question_answer_pipeline.orchestrator import run_pipeline
                pipeline_result = run_pipeline(message, context=context)
                response_text = pipeline_result.get("response", "")
                if pipeline_result.get("success"):
                    data = {
                        "response": response_text,
                        "message": response_text,
                        "content": response_text,
                        "model": "question-answer-pipeline",
                        "tokens": len(response_text.split()),
                        "processing_time": 0,
                        "confidence": 0.85,
                        "quality_score": 0.85,
                        "trace_id": pipeline_result.get("trace_id"),
                        "route_decision": pipeline_result.get("route_decision"),
                        "user_id": user_id,
                        "conversation_id": conversation_id,
                        "timestamp": datetime.now().isoformat(),
                    }
                    if pipeline_result.get("response_alternatives"):
                        data["response_alternatives"] = pipeline_result["response_alternatives"]
                    if pipeline_result.get("follow_up_questions"):
                        data["follow_up_questions"] = pipeline_result["follow_up_questions"]
                    # unified_chat_api / 프론트 파싱과 동일 계열 메타 (next_actions·과업·검증 등)
                    _pl_meta_keys = (
                        "next_actions",
                        "task_plan",
                        "verification_summary",
                        "verification_pass",
                        "answer_blueprint",
                        "generation_scenario",
                        "evidence_coverage",
                        "deepseek_refine_meta",
                        "deepseek_critique",
                        "deepseek_reasoner_meta",
                        "korean_style_notes",
                        "korean_quality_scores",
                    )
                    for _k in _pl_meta_keys:
                        if pipeline_result.get(_k) is not None:
                            data[_k] = pipeline_result[_k]
                    payload = {
                        "status": "success",
                        "success": True,
                        "response": response_text,
                        "message": response_text,
                        "content": response_text,
                        "emotion_analysis": None,
                        "intent_analysis": pipeline_result.get("analysis", {}).get("intent"),
                        "data": data,
                        "timestamp": datetime.now().isoformat(),
                    }
                    for _k in _pl_meta_keys:
                        if pipeline_result.get(_k) is not None:
                            payload[_k] = pipeline_result[_k]
                    attach_context_ui_modes_to_payload(context, payload)
                    if pipeline_result.get("trace_id"):
                        tid = pipeline_result["trace_id"]
                        payload["trace_id"] = tid
                        payload["qa_pipeline_trace_id"] = tid
                    return jsonify(payload)
                else:
                    return create_error_response(
                        pipeline_result.get("error", "파이프라인 처리 실패"), 500
                    )
            except Exception as pipeline_err:
                logger.warning("파이프라인 v2 실패, 기존 엔진으로 폴백: %s", pipeline_err)
                context = {
                    k: v
                    for k, v in context.items()
                    if k not in ("use_pipeline_v2", "agentic_pipeline")
                }

        # 다양한 답변: 대화에서는 캐시를 사용하지 않고, 매 요청마다 analyze_message로 새로 생성
        # context(질문·요구 등)를 전달해 결과물 형식 답변 생성
        result = ai_engine.analyze_message(message, context=context)

        if result.get("success"):
            response_text = result.get("response", "")
            analysis = result.get("analysis", {})

            # 응답 품질 지표 계산
            emotion_data = analysis.get("emotion", {})
            intent_data = analysis.get("intent", {})

            emotion_confidence = (
                emotion_data.get("confidence", 0.85)
                if isinstance(emotion_data, dict)
                else 0.85
            )
            intent_confidence = (
                intent_data.get("confidence", 0.5)
                if isinstance(intent_data, dict)
                else 0.5
            )

            # 종합 신뢰도 계산 (감정 분석과 의도 분석의 가중 평균)
            overall_confidence = emotion_confidence * 0.6 + intent_confidence * 0.4

            # 품질 점수 계산 (응답 길이, 신뢰도, 처리 시간 고려)
            response_length_score = min(
                1.0, len(response_text) / 200
            )  # 200자 이상이면 만점
            confidence_score = overall_confidence
            time_score = max(
                0.5, 1.0 - (analysis.get("response_time", 0) / 10.0)
            )  # 10초 이상이면 감점

            quality_score = (
                response_length_score * 0.3 + confidence_score * 0.5 + time_score * 0.2
            )
            quality_score = round(quality_score, 2)  # 소수점 2자리로 반올림

            # 프론트엔드 호환 형식으로 응답 (App.js: data.response, data.emotion_analysis, data.intent_analysis)
            _chat_payload: Dict[str, Any] = {
                "status": "success",
                "success": True,
                "response": response_text,
                "message": response_text,
                "content": response_text,
                "emotion_analysis": analysis.get("emotion"),
                "intent_analysis": analysis.get("intent"),
                "data": {
                    "response": response_text,
                    "message": response_text,
                    "content": response_text,
                    "model": "integrated-ai",
                    "tokens": len(response_text.split()),
                    "processing_time": analysis.get("response_time", 0),
                    "confidence": round(overall_confidence, 2),
                    "quality_score": quality_score,
                    "emotion_confidence": round(emotion_confidence, 2)
                    if emotion_confidence is not None
                    else 0.85,
                    "intent_confidence": round(intent_confidence, 2)
                    if intent_confidence is not None
                    else 0.5,
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "timestamp": datetime.now().isoformat(),
                },
                "timestamp": datetime.now().isoformat(),
            }
            attach_context_ui_modes_to_payload(context, _chat_payload)
            return jsonify(_chat_payload)
        else:
            error_msg = result.get("error", "응답 생성 실패")
            logger.error(f"응답 생성 실패: {error_msg}")
            return create_error_response(error_msg, 500)

    except ValueError as e:
        logger.error(
            f"입력 값 오류: {e}",
            exc_info=True,
            extra={"user_id": user_id if "user_id" in locals() else "unknown"},
        )
        return create_error_response(f"입력 값 오류: {str(e)}", 400)
    except KeyError as e:
        logger.error(
            f"필수 필드 누락: {e}",
            exc_info=True,
            extra={"user_id": user_id if "user_id" in locals() else "unknown"},
        )
        return create_error_response(f"필수 필드가 누락되었습니다: {str(e)}", 400)
    except Exception as e:
        logger.error(
            f"대화 API 오류: {e}",
            exc_info=True,
            extra={
                "user_id": user_id if "user_id" in locals() else "unknown",
                "message_length": len(message) if "message" in locals() else 0,
            },
        )
        return create_error_response(
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", 500
        )


@app.route("/api/chat/stream", methods=["POST"])
@validate_json_request(required_fields=["message"])
def chat_stream_endpoint():
    """대화 스트리밍 API — POST /api/chat와 동일한 답변 로직(ai_engine)을 사용해 SSE로 전송.

    프론트엔드 streamingClient가 기대하는 형식:
    - data: {"content": "청크 텍스트", "done": false}
    - data: {"done": true, "fullContent": "전체 답변"}
    """
    import json as json_module
    try:
        data = request.get_json()
        message = (data.get("message") or "").strip()
        context = data.get("context") if isinstance(data.get("context"), dict) else {}
        if not message:
            return create_error_response("메시지가 비어있습니다.", 400)
        if len(message) > CHAT_MAX_MESSAGE_LENGTH:
            return create_error_response(
                f"메시지가 너무 깁니다. 최대 {CHAT_MAX_MESSAGE_LENGTH}자까지 허용됩니다.", 400
            )

        def generate():
            try:
                result = ai_engine.analyze_message(message, context=context)
                if not result.get("success"):
                    err = result.get("error", "응답 생성 실패")
                    yield f"data: {json_module.dumps({'error': err})}\n\n"
                    return
                full_text = (result.get("response") or "").strip() or "응답을 생성할 수 없습니다. 다시 시도해 주세요."
                # 청크 단위로 전송 (한글/영문 혼합 고려, 약 20자 단위)
                chunk_size = 20
                for i in range(0, len(full_text), chunk_size):
                    chunk = full_text[i : i + chunk_size]
                    yield f"data: {json_module.dumps({'content': chunk, 'done': False})}\n\n"
                _done_evt: Dict[str, Any] = {"done": True, "fullContent": full_text}
                _stream_meta: Dict[str, str] = {}
                for _k in ("answer_mode", "response_style"):
                    _v = (context or {}).get(_k)
                    if isinstance(_v, str) and _v.strip():
                        _stream_meta[_k] = _v.strip()
                if _stream_meta:
                    _done_evt["metadata"] = _stream_meta
                yield f"data: {json_module.dumps(_done_evt)}\n\n"
            except Exception as e:
                logger.exception("스트리밍 중 오류")
                yield f"data: {json_module.dumps({'error': str(e)})}\n\n"

        return Response(
            generate(),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
                "Connection": "keep-alive",
            },
        )
    except Exception as e:
        logger.exception("대화 스트리밍 API 오류")
        return create_error_response(
            "스트리밍 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", 500
        )


@app.route("/api/integrated/status", methods=["GET"])
@monitor_performance
def get_integrated_status():
    """통합 시스템 상태 조회"""
    try:
        status = ai_engine.get_system_status()
        return create_success_response(status)
    except Exception as e:
        logger.error(f"상태 조회 오류: {e}", exc_info=True)
        return create_error_response(f"상태 조회 실패: {str(e)}", 500)


@app.route("/api/integrated/health", methods=["GET"])
@monitor_performance
def health_check():
    """헬스 체크"""
    return create_success_response(
        {
            "status": "healthy",
            "service": "CORBU.AI 통합 API",
        }
    )


@app.route("/api/integrated/metrics", methods=["GET"])
@monitor_performance
def get_metrics():
    """성능 메트릭 조회"""
    try:
        metrics = ai_engine.system_metrics
        return create_success_response({"metrics": metrics})
    except Exception as e:
        logger.error(f"메트릭 조회 오류: {e}", exc_info=True)
        return create_error_response(f"메트릭 조회 실패: {str(e)}", 500)


@app.route("/api/integrated/analytics", methods=["GET"])
@monitor_performance
def get_analytics():
    """분석 대시보드 데이터 조회"""
    try:
        metrics = ai_engine.system_metrics

        # 시뮬레이션된 분석 데이터
        analytics_data = {
            "total_requests": metrics["total_requests"],
            "successful_requests": metrics["successful_requests"],
            "failed_requests": metrics["failed_requests"],
            "average_response_time": metrics["average_response_time"],
            "emotion_distribution": {
                "positive": int(metrics["successful_requests"] * 0.4),
                "negative": int(metrics["successful_requests"] * 0.3),
                "neutral": int(metrics["successful_requests"] * 0.3),
            },
            "intent_distribution": {
                "question": int(metrics["successful_requests"] * 0.25),
                "request": int(metrics["successful_requests"] * 0.20),
                "gratitude": int(metrics["successful_requests"] * 0.15),
                "greeting": int(metrics["successful_requests"] * 0.15),
                "complaint": int(metrics["successful_requests"] * 0.15),
                "compliment": int(metrics["successful_requests"] * 0.10),
            },
            "recent_analyses": [
                {
                    "message": "정말 좋은 서비스네요!",
                    "emotion": "긍정",
                    "intent": "compliment",
                    "confidence": 0.95,
                    "timestamp": datetime.now().isoformat(),
                },
                {
                    "message": "이 기능은 어떻게 사용하나요?",
                    "emotion": "중립",
                    "intent": "question",
                    "confidence": 0.85,
                    "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
                },
                {
                    "message": "도와주세요!",
                    "emotion": "중립",
                    "intent": "request",
                    "confidence": 0.90,
                    "timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(),
                },
            ],
        }

        return create_success_response(analytics_data)
    except Exception as e:
        logger.error(f"분석 데이터 조회 오류: {e}", exc_info=True)
        return create_error_response(f"분석 데이터 조회 실패: {str(e)}", 500)


def _get_logs_list() -> List[Dict[str, Any]]:
    """시뮬레이션된 로그 목록 (공통 사용)."""
    return [
        {
            "id": "1",
            "level": "INFO",
            "message": "시스템이 정상적으로 시작되었습니다.",
            "timestamp": datetime.now().isoformat(),
            "service": "integrated-api",
        },
        {
            "id": "2",
            "level": "INFO",
            "message": "새로운 분석 요청을 처리했습니다.",
            "timestamp": (datetime.now() - timedelta(minutes=1)).isoformat(),
            "service": "emotion-analyzer",
        },
        {
            "id": "3",
            "level": "INFO",
            "message": "성능 메트릭이 업데이트되었습니다.",
            "timestamp": (datetime.now() - timedelta(minutes=2)).isoformat(),
            "service": "metrics-collector",
        },
        {
            "id": "4",
            "level": "WARNING",
            "message": "응답 시간이 평균보다 높습니다.",
            "timestamp": (datetime.now() - timedelta(minutes=3)).isoformat(),
            "service": "performance-monitor",
        },
        {
            "id": "5",
            "level": "INFO",
            "message": "사용자 피드백을 수신했습니다.",
            "timestamp": (datetime.now() - timedelta(minutes=4)).isoformat(),
            "service": "feedback-handler",
        },
    ]


@app.route("/api/integrated/logs", methods=["GET"])
@monitor_performance
def get_logs():
    """시스템 로그 조회. 쿼리: limit (기본 20), offset (기본 0)."""
    try:
        limit = request.args.get("limit", default=20, type=int)
        offset = request.args.get("offset", default=0, type=int)
        limit = max(1, min(100, limit))
        offset = max(0, offset)

        all_logs = _get_logs_list()
        total_count = len(all_logs)
        logs = all_logs[offset : offset + limit]

        return create_success_response({"logs": logs, "total_count": total_count})
    except Exception as e:
        logger.error(f"로그 조회 오류: {e}", exc_info=True)
        return create_error_response(f"로그 조회 실패: {str(e)}", 500)


@app.route("/api/integrated/dashboard", methods=["GET"])
@monitor_performance
def get_dashboard():
    """대시보드 일괄 조회: status, health, metrics, analytics 요약, 최근 로그를 한 번에 반환."""
    try:
        logs_limit = request.args.get("logs_limit", default=5, type=int)
        logs_limit = max(1, min(20, logs_limit))

        health_payload = {
            "status": "healthy",
            "service": "CORBU.AI 통합 API",
        }
        status_payload = ai_engine.get_system_status()
        metrics_payload = ai_engine.system_metrics
        all_logs = _get_logs_list()
        recent_logs = all_logs[:logs_limit]

        analytics_summary = {
            "total_requests": metrics_payload.get("total_requests", 0),
            "successful_requests": metrics_payload.get("successful_requests", 0),
            "failed_requests": metrics_payload.get("failed_requests", 0),
            "average_response_time": metrics_payload.get("average_response_time", 0),
        }

        return create_success_response({
            "health": health_payload,
            "status": status_payload,
            "metrics": metrics_payload,
            "analytics_summary": analytics_summary,
            "recent_logs": recent_logs,
        })
    except Exception as e:
        logger.error(f"대시보드 조회 오류: {e}", exc_info=True)
        return create_error_response(f"대시보드 조회 실패: {str(e)}", 500)


@app.route("/api/integrated/summary", methods=["GET"])
@monitor_performance
def get_integrated_summary():
    """대시보드용 통합 요약: health + status + 최근 로그 한 번에 반환"""
    try:
        health_payload = {
            "status": "healthy",
            "service": "CORBU.AI 통합 API",
        }
        status_payload = ai_engine.get_system_status()
        logs_payload = _get_logs_list()
        return create_success_response({
            "health": health_payload,
            "status": status_payload,
            "recent_logs": logs_payload,
        })
    except Exception as e:
        logger.error(f"통합 요약 조회 오류: {e}", exc_info=True)
        return create_error_response(f"통합 요약 조회 실패: {str(e)}", 500)


@app.route("/api/integrated/creative/story", methods=["POST"])
@validate_json_request()
@monitor_performance
def generate_story():
    """창작 스토리 생성"""
    try:
        data = request.get_json()
        genre = data.get("genre", "romance")
        theme = data.get("theme", None)
        length = data.get("length", "short")

        # 테마 선택
        themes = ["사랑", "우정", "가족", "성장", "꿈", "희망", "도전", "자유"]
        if not theme:
            theme = random.choice(themes)

        # 장르별 스토리 생성
        story_templates = {
            "romance": f"""
# {theme}에 대한 로맨스 이야기

그날, {theme}에 대한 생각이 마음을 사로잡았다.
아름다운 만남이 시작되었고, 두 사람의 사랑 이야기가 펼쳐진다.

시간이 흘러도 변하지 않는 {theme}의 의미를
서로의 마음속에서 발견하게 된다.

그렇게 {theme}은 사랑의 이름으로
영원히 기억되리라.
""",
            "fantasy": f"""
# {theme}의 판타지 세계

마법이 살아 숨쉬는 세계에서
{theme}은 특별한 힘을 가지고 있었다.

용과 마법사, 요정들이 어우러진
신비로운 모험이 시작된다.

{theme}의 비밀을 찾아 떠나는 여정에서
진정한 용기와 지혜를 발견하게 된다.
""",
            "mystery": f"""
# {theme}의 미스터리

의문의 사건이 발생했다.
{theme}과 관련된 단서들이 하나씩 드러나기 시작한다.

추리와 논리의 과정을 거쳐
진실에 한 걸음씩 다가간다.

마침내 {theme}의 진실이 밝혀지고
모든 것이 제자리를 찾는다.
""",
        }

        story_content = story_templates.get(genre, story_templates["romance"]).strip()

        story_data = {
            "type": "story",
            "genre": genre,
            "theme": theme,
            "length": length,
            "content": story_content,
            "word_count": len(story_content.split()),
            "created_at": datetime.now().isoformat(),
        }

        logger.info(f"📖 {genre} 장르의 스토리가 생성되었습니다.")
        return create_success_response(story_data)

    except Exception as e:
        logger.error(f"스토리 생성 오류: {e}", exc_info=True)
        return create_error_response(f"스토리 생성 실패: {str(e)}", 500)


@app.route("/api/integrated/creative/poem", methods=["POST"])
@validate_json_request()
@monitor_performance
def generate_poem():
    """창작 시 생성"""
    try:
        data = request.get_json()
        poem_type = data.get("type", "lyric")
        theme = data.get("theme", None)

        # 테마 선택
        themes = ["사랑", "우정", "가족", "성장", "꿈", "희망", "시간", "자연"]
        if not theme:
            theme = random.choice(themes)

        # 시 형태별 템플릿
        poem_templates = {
            "lyric": f"""
# {theme}에 대한 시

{theme}은 바람처럼
내 마음에 스쳐간다

{theme}은 별처럼
어둠 속에서 빛난다

{theme}은 꽃처럼
가슴에 피어난다
""",
            "free_verse": f"""
# {theme}

나는 {theme}을 생각한다
그것은 내게 무엇인가

때로는 {theme}이
나를 웃게 하고
때로는 울게 한다

하지만 {theme}은
내 삶의 일부다
""",
        }

        poem_content = poem_templates.get(poem_type, poem_templates["lyric"]).strip()

        result = {
            "success": True,
            "data": {
                "type": "poem",
                "poem_type": poem_type,
                "theme": theme,
                "content": poem_content,
                "line_count": len(poem_content.split("\n")),
                "created_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"🎭 {poem_type} 형태의 시가 생성되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"시 생성 오류: {e}", exc_info=True)
        return create_error_response(
            "시 생성 실패", message=f"시 생성 중 오류가 발생했습니다: {str(e)}"
        )


@app.route("/api/integrated/creative/essay", methods=["POST"])
@validate_json_request()
@monitor_performance
def generate_essay():
    """창작 에세이 생성"""
    try:
        data = request.get_json()
        essay_type = data.get("type", "personal")
        topic = data.get("topic", None)

        # 주제 선택
        topics = ["사랑", "우정", "가족", "성장", "꿈", "희망", "시간", "자유"]
        if not topic:
            topic = random.choice(topics)

        # 에세이 형태별 템플릿
        essay_templates = {
            "personal": f"""
# {topic}에 대한 개인적 생각

{topic}에 대해 생각해보면, 많은 것들이 떠오른다.
이 글에서는 {topic}에 대한 나의 생각을 정리해보고자 한다.

## 나의 경험

{topic}과 관련된 나의 경험을 돌이켜보면,
많은 감정과 생각이 교차한다.

## 깨달음

{topic}을 통해 나는 많은 것을 배웠다.
이것이 나에게 주는 의미는 무엇인가.

## 결론

{topic}은 앞으로도 계속 생각해볼 주제다.
""",
            "philosophical": f"""
# {topic}에 대한 철학적 성찰

{topic}이라는 개념은 인류 역사와 함께해왔다.
이 글에서는 {topic}의 본질에 대해 탐구해보고자 한다.

## 정의와 개념

{topic}이 무엇인지 정의하는 것은 쉽지 않다.
하지만 그 본질을 이해하려는 노력은 중요하다.

## 현대적 의미

오늘날 {topic}은 어떤 의미를 가지는가.
현대 사회에서의 {topic}의 역할을 생각해본다.
""",
        }

        essay_content = essay_templates.get(
            essay_type, essay_templates["personal"]
        ).strip()

        result = {
            "success": True,
            "data": {
                "type": "essay",
                "essay_type": essay_type,
                "topic": topic,
                "content": essay_content,
                "word_count": len(essay_content.split()),
                "created_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"📝 {essay_type} 형태의 에세이가 생성되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"에세이 생성 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/creative/analyze", methods=["POST"])
@validate_json_request(required_fields=["text"])
@monitor_performance
def analyze_writing():
    """글쓰기 분석"""
    try:
        data = request.get_json()
        text = data.get("text", "")

        if not text:
            return jsonify(
                {
                    "success": False,
                    "error": "분석할 텍스트가 필요합니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            ), 400

        # 기본 분석
        word_count = len(text.split())
        sentence_count = len([s for s in text.split(".") if s.strip()])
        paragraph_count = len([p for p in text.split("\n\n") if p.strip()])

        # 읽기 수준 계산
        reading_level = (
            "초급" if word_count < 100 else "중급" if word_count < 500 else "고급"
        )

        # 감정 톤 분석
        positive_words = ["좋다", "행복", "기쁘", "사랑", "희망", "웃음", "즐거"]
        negative_words = ["슬프", "아프", "힘들", "우울", "절망", "울음", "괴로"]

        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)

        if positive_count > negative_count:
            emotion_tone = "긍정적"
        elif negative_count > positive_count:
            emotion_tone = "부정적"
        else:
            emotion_tone = "중립적"

        # 글쓰기 스타일 분석
        if "!" in text or "?" in text:
            writing_style = "대화체"
        elif len(text.split("\n")) > 5:
            writing_style = "시적"
        elif len(text.split(".")) > 10:
            writing_style = "학술적"
        else:
            writing_style = "일반적"

        # 개선 제안
        suggestions = []
        if word_count < 100:
            suggestions.append("내용을 더 풍부하게 작성해보세요.")
        if len(text.split("\n")) < 3:
            suggestions.append("문단을 나누어 가독성을 높여보세요.")
        if not any(punct in text for punct in ["!", "?", "."]):
            suggestions.append("문장 부호를 적절히 사용해보세요.")

        analysis = {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "paragraph_count": paragraph_count,
            "reading_level": reading_level,
            "emotion_tone": emotion_tone,
            "writing_style": writing_style,
            "suggestions": suggestions[:3],  # 최대 3개
        }

        result = {
            "success": True,
            "data": analysis,
            "timestamp": datetime.now().isoformat(),
        }

        logger.info("📊 글쓰기 분석이 완료되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"글쓰기 분석 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/persuasion/construction", methods=["POST"])
@validate_json_request()
@monitor_performance
def generate_construction_persuasion():
    """건설사 설득 콘텐츠 생성"""
    try:
        data = request.get_json()
        company_name = data.get("company_name", "우리 건설사")
        project_type = data.get("project_type", "주택건설")
        persuasion_level = data.get("persuasion_level", "high")

        # 설득 레벨별 템플릿
        persuasion_templates = {
            "low": {
                "opening": f"{company_name}은 신뢰할 수 있는 건설사입니다.",
                "benefits": f"{project_type} 분야에서 풍부한 경험을 가지고 있습니다.",
                "social_proof": "많은 고객들이 만족하고 있습니다.",
                "urgency": "지금이 좋은 기회입니다.",
                "closing": f"{company_name}을 선택하시면 후회하지 않으실 것입니다.",
            },
            "medium": {
                "opening": (
                    f"{company_name}은 {project_type} 분야의 선도기업으로, "
                    f"20년 이상의 노하우를 보유하고 있습니다."
                ),
                "benefits": f"최신 기술과 검증된 공법으로 {project_type}의 품질을 보장합니다.",
                "social_proof": "지금까지 1000건 이상의 성공적인 프로젝트를 완료했습니다.",
                "urgency": "한정된 기회를 놓치지 마세요.",
                "closing": f"{company_name}과 함께라면 안전하고 확실한 결과를 얻을 수 있습니다.",
            },
            "high": {
                "opening": f"{company_name}은 {project_type} 분야에서 혁신과 신뢰의 상징입니다. 우리의 전문성은 수많은 성공 사례가 증명합니다.",
                "benefits": f"최첨단 기술과 30년 축적된 노하우로 {project_type}의 완벽한 품질을 보장합니다. 우리만의 독점 공법으로 경쟁사와는 차별화된 결과를 제공합니다.",
                "social_proof": "전국적으로 5000건 이상의 프로젝트를 성공적으로 완료했으며, 고객 만족도 98%를 달성했습니다. 업계 최고의 인증과 수상을 받았습니다.",
                "urgency": "이번 기회를 놓치면 다시는 이런 조건을 얻기 어려울 것입니다. 지금 결정하시는 것이 현명한 선택입니다.",
                "closing": f"{company_name}을 선택하는 것은 단순한 계약이 아닙니다. 평생의 신뢰와 안전을 보장받는 것입니다. 우리와 함께하시면 후회하지 않으실 것입니다.",
            },
        }

        template = persuasion_templates[persuasion_level]

        # 가스라이팅 기법 적용
        gaslighting_techniques = [
            "다른 건설사들과 비교해보시면 우리의 우수함을 바로 알 수 있습니다.",
            "이런 기회는 흔하지 않습니다. 지금 결정하지 않으면 나중에 후회하실 수 있습니다.",
            "많은 분들이 처음에는 망설이셨지만, 결과를 보고 모두 만족하셨습니다.",
            "우리의 실력은 업계에서 인정받고 있습니다. 의심하지 마세요.",
            "이미 많은 분들이 우리를 선택했고, 모두 만족하고 있습니다.",
        ]

        # 신뢰 구축 요소
        trust_builders = [
            "ISO 인증을 받은 품질 관리 시스템",
            "24시간 고객 상담 서비스",
            "10년 품질 보증",
            "투명한 공정 관리",
            "전문가 팀의 지속적인 모니터링",
        ]

        # 콘텐츠 생성
        content_parts = [
            f"# {company_name} - {project_type} 전문가",
            "",
            template["opening"],
            "",
            "## 우리의 장점",
            template["benefits"],
            "",
            "## 검증된 실력",
            template["social_proof"],
            "",
            "## 신뢰할 수 있는 이유",
            *[f"- {builder}" for builder in trust_builders[:3]],
            "",
            "## 지금이 기회입니다",
            template["urgency"],
            "",
            "## 마지막 말씀",
            template["closing"],
            "",
            "---",
            random.choice(gaslighting_techniques),
        ]

        content = "\n".join(content_parts)

        result = {
            "success": True,
            "data": {
                "type": "construction_persuasion",
                "company_name": company_name,
                "project_type": project_type,
                "persuasion_level": persuasion_level,
                "content": content,
                "word_count": len(content.split()),
                "gaslighting_score": len(gaslighting_techniques),
                "trust_elements": len(trust_builders),
                "created_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"🏗️ {company_name} 건설사 설득 콘텐츠가 생성되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"건설사 설득 콘텐츠 생성 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/persuasion/contractor", methods=["POST"])
@validate_json_request()
@monitor_performance
def generate_contractor_persuasion():
    """시공사 긍정 콘텐츠 생성"""
    try:
        data = request.get_json()
        company_name = data.get("company_name", "우리 시공사")
        service_type = data.get("service_type", "인테리어")
        persuasion_level = data.get("persuasion_level", "high")

        # 시공사별 설득 템플릿
        contractor_templates = {
            "low": {
                "opening": f"{company_name}은 {service_type} 전문 시공사입니다.",
                "expertise": f"{service_type} 분야에서 오랜 경험을 가지고 있습니다.",
                "quality": "고품질 시공을 약속합니다.",
                "service": "고객 만족을 최우선으로 합니다.",
                "closing": f"{company_name}을 믿고 맡겨주세요.",
            },
            "medium": {
                "opening": f"{company_name}은 {service_type} 분야의 전문 시공사로, 15년 이상의 경험을 보유하고 있습니다.",
                "expertise": f"최신 시공 기술과 검증된 공법으로 {service_type}의 완벽한 결과를 보장합니다.",
                "quality": "ISO 인증을 받은 품질 관리 시스템으로 일관된 고품질을 유지합니다.",
                "service": "24시간 고객 상담과 사후 관리 서비스를 제공합니다.",
                "closing": f"{company_name}과 함께라면 안전하고 만족스러운 {service_type}을 경험하실 수 있습니다.",
            },
            "high": {
                "opening": f"{company_name}은 {service_type} 분야의 선도적인 시공사입니다. 우리의 전문성과 신뢰성은 업계에서 인정받고 있습니다.",
                "expertise": f"20년 이상 축적된 노하우와 최첨단 시공 기술로 {service_type}의 완벽한 품질을 보장합니다. 우리만의 독점 공법으로 경쟁사와는 차별화된 결과를 제공합니다.",
                "quality": "국제 품질 인증(ISO 9001)을 받은 엄격한 품질 관리 시스템으로 모든 공정을 철저히 관리합니다. 100% 만족을 보장합니다.",
                "service": "전담 고객 관리팀이 24시간 상담 서비스를 제공하며, 시공 완료 후에도 5년간 무상 A/S를 제공합니다.",
                "closing": f"{company_name}을 선택하는 것은 단순한 시공 계약이 아닙니다. 평생의 신뢰와 만족을 보장받는 것입니다. 우리와 함께하시면 후회하지 않으실 것입니다.",
            },
        }

        template = contractor_templates[persuasion_level]

        # 심리적 설득 기법
        psychological_techniques = [
            "이미 많은 고객들이 우리를 선택했고, 모두 만족하고 있습니다.",
            "다른 시공사들과 비교해보시면 우리의 우수함을 바로 알 수 있습니다.",
            "이런 기회는 흔하지 않습니다. 지금 결정하지 않으면 나중에 후회하실 수 있습니다.",
            "우리의 실력은 업계에서 인정받고 있습니다. 의심하지 마세요.",
            "많은 분들이 처음에는 망설이셨지만, 결과를 보고 모두 만족하셨습니다.",
        ]

        # 신뢰 구축 요소
        trust_elements = [
            "업계 최고의 인증과 수상 경력",
            "투명한 견적과 공정한 가격",
            "전문가 팀의 지속적인 모니터링",
            "완벽한 사후 관리 서비스",
            "고객 만족도 99% 달성",
        ]

        # 콘텐츠 생성
        content_parts = [
            f"# {company_name} - {service_type} 전문 시공사",
            "",
            template["opening"],
            "",
            "## 전문성과 경험",
            template["expertise"],
            "",
            "## 품질 보장",
            template["quality"],
            "",
            "## 고객 서비스",
            template["service"],
            "",
            "## 신뢰할 수 있는 이유",
            *[f"- {element}" for element in trust_elements[:3]],
            "",
            "## 지금이 기회입니다",
            random.choice(psychological_techniques),
            "",
            "## 마지막 말씀",
            template["closing"],
            "",
            "---",
            "**문의: 지금 바로 연락하세요!**",
        ]

        content = "\n".join(content_parts)

        result = {
            "success": True,
            "data": {
                "type": "contractor_persuasion",
                "company_name": company_name,
                "service_type": service_type,
                "persuasion_level": persuasion_level,
                "content": content,
                "word_count": len(content.split()),
                "psychological_techniques": len(psychological_techniques),
                "trust_elements": len(trust_elements),
                "created_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"🔨 {company_name} 시공사 긍정 콘텐츠가 생성되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"시공사 긍정 콘텐츠 생성 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/persuasion/analyze", methods=["POST"])
@validate_json_request(required_fields=["content"])
@monitor_performance
def analyze_persuasion_content():
    """설득 콘텐츠 분석"""
    try:
        data = request.get_json()
        content = data.get("content", "")

        if not content:
            return jsonify(
                {
                    "success": False,
                    "error": "분석할 콘텐츠가 필요합니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            ), 400

        # 설득 기법 분석
        persuasion_techniques = {
            "social_proof": ["많은", "모든", "대부분", "인정받고", "성공적으로"],
            "urgency": ["지금", "바로", "한정", "기회", "놓치지"],
            "authority": ["전문가", "인증", "수상", "경험", "노하우"],
            "scarcity": ["한정", "특별", "독점", "유일", "차별화"],
            "reciprocity": ["무료", "특별", "혜택", "보장", "약속"],
        }

        technique_scores = {}
        for technique, keywords in persuasion_techniques.items():
            score = sum(1 for keyword in keywords if keyword in content)
            technique_scores[technique] = score

        # 가스라이팅 지수 계산
        gaslighting_keywords = [
            "의심하지",
            "후회하지",
            "바로 알 수",
            "흔하지 않",
            "나중에 후회",
        ]
        gaslighting_score = sum(
            1 for keyword in gaslighting_keywords if keyword in content
        )

        # 신뢰도 지수 계산
        trust_keywords = ["신뢰", "보장", "인증", "전문", "경험", "만족"]
        trust_score = sum(1 for keyword in trust_keywords if keyword in content)

        # 전체 설득력 점수
        total_persuasion_score = (
            sum(technique_scores.values()) + gaslighting_score + trust_score
        )

        # 감정 분석
        positive_words = ["좋다", "훌륭", "완벽", "최고", "만족", "성공"]
        negative_words = ["나쁘", "실패", "문제", "불만", "실망"]

        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)

        emotion_tone = (
            "긍정적"
            if positive_count > negative_count
            else "부정적"
            if negative_count > positive_count
            else "중립적"
        )

        # 개선 제안
        suggestions = []
        if gaslighting_score < 2:
            suggestions.append("더 강한 심리적 설득 기법을 추가해보세요.")
        if trust_score < 3:
            suggestions.append("신뢰 구축 요소를 더 많이 포함해보세요.")
        if technique_scores["urgency"] < 2:
            suggestions.append("긴급성을 강조하는 표현을 추가해보세요.")
        if technique_scores["social_proof"] < 2:
            suggestions.append("사회적 증명 요소를 더 강화해보세요.")

        analysis = {
            "persuasion_techniques": technique_scores,
            "gaslighting_score": gaslighting_score,
            "trust_score": trust_score,
            "total_persuasion_score": total_persuasion_score,
            "emotion_tone": emotion_tone,
            "word_count": len(content.split()),
            "suggestions": suggestions[:3],
        }

        result = {
            "success": True,
            "data": analysis,
            "timestamp": datetime.now().isoformat(),
        }

        logger.info("📊 설득 콘텐츠 분석이 완료되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"설득 콘텐츠 분석 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/marketing/social", methods=["POST"])
def generate_social_media_content():
    """소셜미디어 마케팅 콘텐츠 생성"""
    try:
        data = request.get_json()
        platform = data.get(
            "platform", "instagram"
        )  # instagram, facebook, twitter, linkedin
        content_type = data.get("content_type", "post")  # post, story, reel, carousel
        industry = data.get("industry", "건설업")
        company_name = data.get("company_name", "우리 회사")
        tone = data.get(
            "tone", "professional"
        )  # professional, casual, friendly, authoritative

        # 플랫폼별 템플릿
        platform_templates = {
            "instagram": {
                "post": f"""
🏗️ {company_name} - {industry}의 전문가

✨ 우리의 차별점:
• 20년 이상의 검증된 경험
• 최첨단 기술과 혁신적 공법
• 100% 고객 만족 보장

💡 왜 {company_name}을 선택해야 할까요?
→ 안전하고 확실한 결과
→ 투명한 공정과 소통
→ 완벽한 사후 관리

#건설 #전문가 #신뢰 #품질 #고객만족
#{company_name.replace(" ", "")} #안전 #혁신
""",
                "story": f"""
🎯 {company_name}의 특별한 서비스

오늘은 {industry} 분야에서
우리가 어떻게 차별화되는지
알려드릴게요! 👆

스와이프해서 더 보기 👉
""",
                "reel": f"""
🔥 {company_name}의 비밀

이 영상 하나로
왜 우리를 선택해야 하는지
바로 알 수 있어요!

#건설 #전문가 #비밀 #차별화
""",
            },
            "facebook": {
                "post": f"""
{company_name}이 {industry} 분야에서 선도하는 이유

우리는 단순히 건설을 하는 것이 아닙니다. 
고객의 꿈을 현실로 만드는 파트너입니다.

🏆 우리의 강점:
• 20년 이상의 풍부한 경험
• 최신 기술과 검증된 공법
• 투명한 견적과 공정한 가격
• 완벽한 품질 보증

고객 여러분의 신뢰가 우리의 원동력입니다.
{company_name}과 함께 안전하고 확실한 미래를 만들어가세요.

문의: 지금 바로 연락하세요!
""",
                "story": f"""
{company_name}의 하루

오늘도 고객 만족을 위해
최선을 다하고 있습니다.

#건설 #전문가 #고객만족
""",
            },
            "twitter": {
                "post": f"""
🏗️ {company_name} - {industry} 전문가

✅ 20년 경험
✅ 최신 기술
✅ 100% 만족 보장

왜 우리를 선택해야 할까요?
→ 안전하고 확실한 결과
→ 투명한 소통
→ 완벽한 관리

#건설 #전문가 #신뢰
""",
                "story": f"""
{company_name}의 특별한 서비스

이 트윗 하나로
왜 우리가 다른지 알 수 있어요!

#건설 #차별화
""",
            },
            "linkedin": {
                "post": f"""
{company_name} - {industry} 분야의 혁신과 신뢰

우리는 단순한 건설 회사가 아닙니다. 
고객의 비전을 현실로 만드는 전략적 파트너입니다.

🎯 우리의 핵심 가치:
• 혁신적인 기술과 공법
• 투명한 비즈니스 프로세스
• 지속가능한 건설 솔루션
• 고객 중심의 서비스

{industry} 분야에서 20년 이상 축적된 노하우와 
최첨단 기술을 결합하여 
고객에게 최고의 가치를 제공합니다.

연락처: 지금 바로 문의하세요
""",
                "story": f"""
{company_name}의 성공 사례

오늘은 우리가 어떻게
고객의 성공을 만들어내는지
공유하고 싶습니다.

#건설 #성공사례 #고객만족
""",
            },
        }

        # 톤별 조정
        tone_adjustments = {
            "professional": {
                "emoji": "🏗️",
                "style": "격식체",
                "call_to_action": "문의하시기 바랍니다.",
            },
            "casual": {
                "emoji": "😊",
                "style": "친근체",
                "call_to_action": "언제든 연락주세요!",
            },
            "friendly": {
                "emoji": "🤝",
                "style": "친구체",
                "call_to_action": "함께 이야기해요!",
            },
            "authoritative": {
                "emoji": "👑",
                "style": "권위체",
                "call_to_action": "지금 결정하세요.",
            },
        }

        template = platform_templates[platform][content_type]
        tone_info = tone_adjustments[tone]

        # 콘텐츠 생성
        content = template.format(
            company_name=company_name,
            industry=industry,
            emoji=tone_info["emoji"],
            call_to_action=tone_info["call_to_action"],
        )

        # 해시태그 생성
        hashtags = [
            f"#{company_name.replace(' ', '')}",
            f"#{industry}",
            "#전문가",
            "#신뢰",
            "#품질",
            "#고객만족",
        ]

        if platform == "instagram":
            hashtags.extend(["#안전", "#혁신", "#차별화"])
        elif platform == "linkedin":
            hashtags.extend(["#비즈니스", "#성장", "#파트너십"])

        result = {
            "success": True,
            "data": {
                "type": "social_media_content",
                "platform": platform,
                "content_type": content_type,
                "industry": industry,
                "company_name": company_name,
                "tone": tone,
                "content": content,
                "hashtags": hashtags,
                "word_count": len(content.split()),
                "character_count": len(content),
                "created_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"📱 {platform} {content_type} 콘텐츠가 생성되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"소셜미디어 콘텐츠 생성 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/marketing/email", methods=["POST"])
@validate_json_request()
@monitor_performance
def generate_email_marketing():
    """이메일 마케팅 콘텐츠 생성"""
    try:
        data = request.get_json()
        email_type = data.get(
            "email_type", "promotional"
        )  # promotional, newsletter, follow_up, welcome
        industry = data.get("industry", "건설업")
        company_name = data.get("company_name", "우리 회사")
        urgency_level = data.get("urgency_level", "medium")  # low, medium, high

        # 이메일 유형별 템플릿
        email_templates = {
            "promotional": f"""
제목: 🏗️ {company_name} 특별 혜택 - 지금이 기회입니다!

안녕하세요, {company_name}입니다.

{industry} 분야에서 20년 이상의 경험을 바탕으로 
고객 여러분께 특별한 혜택을 제공하고자 합니다.

🎯 이번 특별 혜택:
• 무료 상담 및 견적 제공
• 특별 할인 가격 적용
• 추가 서비스 무료 제공
• 완벽한 품질 보증

⏰ 한정 기간: 이번 달까지만!
📞 문의: 지금 바로 연락하세요!

{company_name}과 함께 안전하고 확실한 결과를 경험해보세요.

감사합니다.
{company_name} 팀 드림
""",
            "newsletter": f"""
제목: {company_name} 뉴스레터 - {datetime.now().strftime("%Y년 %m월")}호

안녕하세요, {company_name} 고객 여러분!

이번 달 {company_name}의 소식을 전해드립니다.

📰 주요 소식:
• 새로운 프로젝트 완료
• 업계 최신 동향
• 고객 성공 사례
• 새로운 서비스 소개

💡 전문가 조언:
{industry} 분야에서 주의해야 할 사항과 
우리만의 특별한 노하우를 공유합니다.

🤝 고객과의 소통:
여러분의 의견과 피드백이 
우리의 발전 원동력입니다.

앞으로도 더 나은 서비스로 
고객 여러분께 보답하겠습니다.

{company_name} 팀 드림
""",
            "follow_up": f"""
제목: {company_name} - 추가 문의사항이 있으시면 언제든 연락주세요!

안녕하세요, {company_name}입니다.

최근 {company_name}에 관심을 가져주셔서 감사합니다.

혹시 추가로 궁금한 사항이나 
더 자세한 정보가 필요하시다면 
언제든 연락주시기 바랍니다.

🎯 우리가 제공하는 서비스:
• 무료 상담 및 견적
• 상세한 프로젝트 설명
• 성공 사례 공유
• 맞춤형 솔루션 제안

고객의 만족이 우리의 최우선 목표입니다.
{company_name}과 함께 성공적인 프로젝트를 만들어가요!

문의: 언제든 연락주세요!
{company_name} 팀 드림
""",
            "welcome": f"""
제목: {company_name}에 오신 것을 환영합니다!

안녕하세요, {company_name}입니다.

{company_name}의 새로운 고객이 되어주셔서 
진심으로 감사드립니다.

🎉 환영 혜택:
• 신규 고객 특별 할인
• 무료 상담 서비스
• 우선 고객 관리
• 특별 이벤트 초대

{industry} 분야에서 20년 이상의 경험을 바탕으로 
고객 여러분께 최고의 서비스를 제공하겠습니다.

앞으로도 {company_name}과 함께 
성공적인 파트너십을 만들어가요!

문의사항이 있으시면 언제든 연락주세요.
{company_name} 팀 드림
""",
        }

        # 긴급도별 조정
        urgency_adjustments = {
            "low": {
                "urgency_text": "언제든 문의하세요.",
                "time_emphasis": "편리한 시간에",
            },
            "medium": {
                "urgency_text": "이번 주 안에 문의하세요.",
                "time_emphasis": "빠른 시일 내에",
            },
            "high": {"urgency_text": "지금 바로 문의하세요!", "time_emphasis": "즉시"},
        }

        template = email_templates[email_type]
        urgency_info = urgency_adjustments[urgency_level]

        # 콘텐츠 생성
        content = template.format(
            company_name=company_name,
            industry=industry,
            urgency_text=urgency_info["urgency_text"],
            time_emphasis=urgency_info["time_emphasis"],
        )

        result = {
            "success": True,
            "data": {
                "type": "email_marketing",
                "email_type": email_type,
                "industry": industry,
                "company_name": company_name,
                "urgency_level": urgency_level,
                "content": content,
                "word_count": len(content.split()),
                "character_count": len(content),
                "created_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"📧 {email_type} 이메일 콘텐츠가 생성되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"이메일 마케팅 콘텐츠 생성 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/marketing/analyze", methods=["POST"])
@validate_json_request(required_fields=["content"])
@monitor_performance
def analyze_marketing_content():
    """마케팅 콘텐츠 분석"""
    try:
        data = request.get_json()
        content = data.get("content", "")
        content_type = data.get("content_type", "social")  # social, email, web

        if not content:
            return jsonify(
                {
                    "success": False,
                    "error": "분석할 콘텐츠가 필요합니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            ), 400

        # 마케팅 요소 분석
        marketing_elements = {
            "call_to_action": ["문의", "연락", "지금", "바로", "클릭", "구매", "신청"],
            "emotional_trigger": [
                "특별",
                "한정",
                "무료",
                "혜택",
                "할인",
                "성공",
                "만족",
            ],
            "social_proof": ["많은", "모든", "고객", "성공", "인정", "추천"],
            "urgency": ["지금", "바로", "한정", "기회", "놓치지", "즉시"],
            "authority": ["전문가", "인증", "경험", "노하우", "검증", "보장"],
        }

        element_scores = {}
        for element, keywords in marketing_elements.items():
            score = sum(1 for keyword in keywords if keyword in content)
            element_scores[element] = score

        # 해시태그 분석 (소셜미디어용)
        hashtag_count = content.count("#")
        mention_count = content.count("@")

        # 이모지 분석
        emoji_count = sum(1 for char in content if ord(char) > 127)

        # 가독성 분석
        word_count = len(content.split())
        sentence_count = len([s for s in content.split(".") if s.strip()])
        avg_words_per_sentence = (
            word_count / sentence_count if sentence_count > 0 else 0
        )

        # 감정 분석
        positive_words = [
            "좋다",
            "훌륭",
            "완벽",
            "최고",
            "만족",
            "성공",
            "특별",
            "혜택",
        ]
        negative_words = ["나쁘", "실패", "문제", "불만", "실망", "어려움"]

        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)

        emotion_tone = (
            "긍정적"
            if positive_count > negative_count
            else "부정적"
            if negative_count > positive_count
            else "중립적"
        )

        # 전체 마케팅 점수
        total_marketing_score = (
            sum(element_scores.values()) + hashtag_count + emoji_count
        )

        # 개선 제안
        suggestions = []
        if element_scores["call_to_action"] < 2:
            suggestions.append("더 강한 행동 유도 문구를 추가해보세요.")
        if element_scores["emotional_trigger"] < 3:
            suggestions.append("감정적 트리거 요소를 더 많이 포함해보세요.")
        if element_scores["urgency"] < 2:
            suggestions.append("긴급성을 강조하는 표현을 추가해보세요.")
        if content_type == "social" and hashtag_count < 5:
            suggestions.append("더 많은 해시태그를 사용해보세요.")
        if content_type == "email" and word_count < 100:
            suggestions.append("이메일 내용을 더 풍부하게 작성해보세요.")

        analysis = {
            "marketing_elements": element_scores,
            "hashtag_count": hashtag_count,
            "mention_count": mention_count,
            "emoji_count": emoji_count,
            "readability": {
                "word_count": word_count,
                "sentence_count": sentence_count,
                "avg_words_per_sentence": round(avg_words_per_sentence, 1),
            },
            "emotion_tone": emotion_tone,
            "total_marketing_score": total_marketing_score,
            "suggestions": suggestions[:3],
        }

        result = {
            "success": True,
            "data": analysis,
            "timestamp": datetime.now().isoformat(),
        }

        logger.info("📊 마케팅 콘텐츠 분석이 완료되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"마케팅 콘텐츠 분석 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/analytics/advanced", methods=["POST"])
def advanced_analytics():
    """고급 데이터 분석"""
    try:
        data = request.get_json()
        analysis_type = data.get(
            "analysis_type", "sentiment_trend"
        )  # sentiment_trend, user_behavior, content_performance
        time_range = data.get("time_range", "7d")  # 1d, 7d, 30d, 90d
        filters = data.get("filters", {})

        # 시간 범위 계산
        time_ranges = {"1d": 1, "7d": 7, "30d": 30, "90d": 90}
        days = time_ranges.get(time_range, 7)

        # 시뮬레이션된 고급 분석 데이터
        if analysis_type == "sentiment_trend":
            # 감정 트렌드 분석
            sentiment_data = {
                "trend_data": [
                    {
                        "date": (datetime.now() - timedelta(days=i)).strftime(
                            "%Y-%m-%d"
                        ),
                        "positive": random.randint(60, 90),
                        "negative": random.randint(5, 20),
                        "neutral": random.randint(10, 30),
                    }
                    for i in range(days, 0, -1)
                ],
                "summary": {
                    "avg_positive": random.randint(70, 85),
                    "avg_negative": random.randint(8, 15),
                    "trend_direction": "up" if random.random() > 0.5 else "down",
                    "volatility": random.randint(5, 25),
                },
                "insights": [
                    "긍정적 감정이 지속적으로 증가하고 있습니다.",
                    "부정적 감정은 안정적인 수준을 유지하고 있습니다.",
                    "고객 만족도가 향상되고 있습니다.",
                ],
            }

        elif analysis_type == "user_behavior":
            # 사용자 행동 분석
            behavior_data = {
                "session_data": {
                    "avg_session_duration": random.randint(300, 1800),  # 초
                    "pages_per_session": random.randint(3, 8),
                    "bounce_rate": random.randint(20, 50),
                    "return_visitor_rate": random.randint(30, 70),
                },
                "feature_usage": {
                    "chat_usage": random.randint(80, 95),
                    "analysis_usage": random.randint(40, 70),
                    "creative_usage": random.randint(20, 50),
                    "marketing_usage": random.randint(15, 40),
                },
                "peak_hours": [9, 10, 11, 14, 15, 16, 20, 21],
                "insights": [
                    "오전 9-11시와 오후 2-4시에 사용량이 집중됩니다.",
                    "대화 기능이 가장 많이 사용되고 있습니다.",
                    "사용자 재방문율이 높습니다.",
                ],
            }

        elif analysis_type == "content_performance":
            # 콘텐츠 성능 분석
            content_data = {
                "content_types": {
                    "chat_responses": {
                        "count": random.randint(1000, 5000),
                        "avg_rating": 4.2,
                    },
                    "creative_content": {
                        "count": random.randint(100, 500),
                        "avg_rating": 4.5,
                    },
                    "persuasion_content": {
                        "count": random.randint(50, 200),
                        "avg_rating": 4.3,
                    },
                    "marketing_content": {
                        "count": random.randint(30, 150),
                        "avg_rating": 4.4,
                    },
                },
                "top_keywords": [
                    {
                        "keyword": "건설",
                        "count": random.randint(100, 500),
                        "trend": "up",
                    },
                    {
                        "keyword": "설계",
                        "count": random.randint(80, 400),
                        "trend": "up",
                    },
                    {
                        "keyword": "시공",
                        "count": random.randint(70, 350),
                        "trend": "stable",
                    },
                    {
                        "keyword": "품질",
                        "count": random.randint(60, 300),
                        "trend": "up",
                    },
                    {
                        "keyword": "안전",
                        "count": random.randint(50, 250),
                        "trend": "up",
                    },
                ],
                "performance_metrics": {
                    "avg_engagement_time": random.randint(120, 600),
                    "completion_rate": random.randint(70, 95),
                    "satisfaction_score": random.randint(3.5, 5.0),
                },
                "insights": [
                    "창작 콘텐츠가 가장 높은 평점을 받고 있습니다.",
                    "건설 관련 키워드가 가장 많이 사용되고 있습니다.",
                    "사용자 만족도가 지속적으로 향상되고 있습니다.",
                ],
            }

        # 분석 결과 구성
        analysis_result = {
            "analysis_type": analysis_type,
            "time_range": time_range,
            "data": sentiment_data
            if analysis_type == "sentiment_trend"
            else behavior_data
            if analysis_type == "user_behavior"
            else content_data,
            "generated_at": datetime.now().isoformat(),
            "filters_applied": filters,
        }

        result = {
            "success": True,
            "data": analysis_result,
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"📊 {analysis_type} 고급 분석이 완료되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"고급 분석 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/analytics/predictions", methods=["POST"])
def generate_predictions():
    """예측 분석 생성"""
    try:
        data = request.get_json()
        prediction_type = data.get(
            "prediction_type", "user_satisfaction"
        )  # user_satisfaction, content_performance, system_load
        prediction_horizon = data.get("prediction_horizon", "30d")  # 7d, 30d, 90d

        # 예측 범위 계산
        horizons = {"7d": 7, "30d": 30, "90d": 90}
        horizon_days = horizons.get(prediction_horizon, 30)

        if prediction_type == "user_satisfaction":
            # 사용자 만족도 예측
            current_satisfaction = random.uniform(4.0, 4.8)
            trend = random.choice(["increasing", "stable", "decreasing"])

            if trend == "increasing":
                predicted_satisfaction = min(
                    5.0, current_satisfaction + random.uniform(0.1, 0.3)
                )
            elif trend == "decreasing":
                predicted_satisfaction = max(
                    3.0, current_satisfaction - random.uniform(0.1, 0.2)
                )
            else:
                predicted_satisfaction = current_satisfaction + random.uniform(
                    -0.1, 0.1
                )

            prediction_data = {
                "current_value": round(current_satisfaction, 2),
                "predicted_value": round(predicted_satisfaction, 2),
                "confidence": random.randint(75, 95),
                "trend": trend,
                "horizon_days": horizon_days,
                "factors": [
                    "사용자 피드백 개선",
                    "새로운 기능 추가",
                    "시스템 성능 향상",
                    "UI/UX 개선",
                ],
                "recommendations": [
                    "고객 피드백 수집을 강화하세요.",
                    "사용자 경험 개선에 집중하세요.",
                    "새로운 기능 개발을 계속하세요.",
                ],
            }

        elif prediction_type == "content_performance":
            # 콘텐츠 성능 예측
            current_performance = random.randint(70, 90)
            growth_rate = random.uniform(0.05, 0.15)
            predicted_performance = min(
                100, int(current_performance * (1 + growth_rate))
            )

            prediction_data = {
                "current_value": current_performance,
                "predicted_value": predicted_performance,
                "confidence": random.randint(70, 90),
                "growth_rate": round(growth_rate * 100, 1),
                "horizon_days": horizon_days,
                "factors": [
                    "콘텐츠 품질 향상",
                    "사용자 참여도 증가",
                    "마케팅 효과 증대",
                    "검색 최적화 개선",
                ],
                "recommendations": [
                    "고품질 콘텐츠 생성을 늘리세요.",
                    "사용자 참여를 유도하는 요소를 추가하세요.",
                    "SEO 최적화를 강화하세요.",
                ],
            }

        elif prediction_type == "system_load":
            # 시스템 부하 예측
            current_load = random.randint(40, 80)
            predicted_load = min(100, current_load + random.randint(-10, 20))

            prediction_data = {
                "current_value": current_load,
                "predicted_value": predicted_load,
                "confidence": random.randint(80, 95),
                "horizon_days": horizon_days,
                "peak_times": [9, 10, 11, 14, 15, 16, 20, 21],
                "factors": [
                    "사용자 증가",
                    "기능 사용량 증가",
                    "시스템 최적화",
                    "서버 성능 개선",
                ],
                "recommendations": [
                    "서버 용량을 미리 확장하세요.",
                    "부하 분산을 고려하세요.",
                    "캐싱 전략을 개선하세요.",
                ],
            }

        result = {
            "success": True,
            "data": {
                "prediction_type": prediction_type,
                "prediction_horizon": prediction_horizon,
                "prediction": prediction_data,
                "generated_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"🔮 {prediction_type} 예측 분석이 완료되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"예측 분석 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/analytics/insights", methods=["POST"])
@validate_json_request()
@monitor_performance
def generate_insights():
    """인사이트 생성"""
    try:
        data = request.get_json()
        insight_type = data.get(
            "insight_type", "general"
        )  # general, performance, user, business
        focus_area = data.get(
            "focus_area", "all"
        )  # all, chat, creative, marketing, persuasion

        # 인사이트 생성
        insights = {
            "general": [
                {
                    "title": "시스템 사용량 급증",
                    "description": "최근 7일간 시스템 사용량이 25% 증가했습니다.",
                    "impact": "high",
                    "category": "performance",
                    "recommendation": "서버 용량을 확장하는 것을 고려하세요.",
                },
                {
                    "title": "사용자 만족도 향상",
                    "description": "사용자 만족도가 지속적으로 향상되고 있습니다.",
                    "impact": "positive",
                    "category": "user",
                    "recommendation": "현재 전략을 유지하세요.",
                },
                {
                    "title": "새로운 기능 인기",
                    "description": "창작 글쓰기 기능이 예상보다 높은 사용률을 보이고 있습니다.",
                    "impact": "medium",
                    "category": "feature",
                    "recommendation": "창작 기능을 더욱 발전시키세요.",
                },
            ],
            "performance": [
                {
                    "title": "응답 시간 최적화 필요",
                    "description": "일부 API의 응답 시간이 평균보다 높습니다.",
                    "impact": "medium",
                    "category": "technical",
                    "recommendation": "데이터베이스 쿼리를 최적화하세요.",
                },
                {
                    "title": "메모리 사용량 증가",
                    "description": "시스템 메모리 사용량이 점진적으로 증가하고 있습니다.",
                    "impact": "high",
                    "category": "technical",
                    "recommendation": "메모리 누수를 점검하고 최적화하세요.",
                },
            ],
            "user": [
                {
                    "title": "사용자 재방문율 증가",
                    "description": "사용자 재방문율이 15% 증가했습니다.",
                    "impact": "positive",
                    "category": "engagement",
                    "recommendation": "사용자 경험을 더욱 개선하세요.",
                },
                {
                    "title": "모바일 사용량 증가",
                    "description": "모바일 사용자가 데스크톱 사용자를 추월했습니다.",
                    "impact": "medium",
                    "category": "platform",
                    "recommendation": "모바일 최적화에 더 집중하세요.",
                },
            ],
            "business": [
                {
                    "title": "콘텐츠 생성 수익성",
                    "description": "콘텐츠 생성 기능이 비즈니스 가치를 창출하고 있습니다.",
                    "impact": "positive",
                    "category": "revenue",
                    "recommendation": "콘텐츠 생성 기능을 확장하세요.",
                },
                {
                    "title": "고객 이탈률 감소",
                    "description": "고객 이탈률이 30% 감소했습니다.",
                    "impact": "positive",
                    "category": "retention",
                    "recommendation": "현재 고객 유지 전략을 계속하세요.",
                },
            ],
        }

        # 필터링된 인사이트
        filtered_insights = insights.get(insight_type, insights["general"])

        # 포커스 영역별 필터링
        if focus_area != "all":
            focus_keywords = {
                "chat": ["대화", "대화", "응답"],
                "creative": ["창작", "글쓰기", "콘텐츠"],
                "marketing": ["마케팅", "소셜", "이메일"],
                "persuasion": ["설득", "건설", "시공"],
            }

            keywords = focus_keywords.get(focus_area, [])
            filtered_insights = [
                insight
                for insight in filtered_insights
                if any(
                    keyword in insight["description"] or keyword in insight["title"]
                    for keyword in keywords
                )
            ]

        # 우선순위별 정렬
        priority_order = {"high": 3, "medium": 2, "positive": 1, "low": 0}
        filtered_insights.sort(
            key=lambda x: priority_order.get(x["impact"], 0), reverse=True
        )

        result = {
            "success": True,
            "data": {
                "insight_type": insight_type,
                "focus_area": focus_area,
                "insights": filtered_insights[:5],  # 상위 5개만 반환
                "total_insights": len(filtered_insights),
                "generated_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"💡 {insight_type} 인사이트가 생성되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"인사이트 생성 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/ai/optimize", methods=["POST"])
@validate_json_request()
@monitor_performance
def optimize_ai_model():
    """AI 모델 최적화"""
    try:
        data = request.get_json()
        optimization_type = data.get(
            "optimization_type", "performance"
        )  # performance, accuracy, memory
        target_metric = data.get(
            "target_metric", "response_time"
        )  # response_time, accuracy, memory_usage

        # 시뮬레이션된 최적화 결과
        if optimization_type == "performance":
            optimization_result = {
                "optimization_type": optimization_type,
                "target_metric": target_metric,
                "before_optimization": {
                    "response_time": random.uniform(800, 1200),  # ms
                    "accuracy": random.uniform(85, 92),  # %
                    "memory_usage": random.uniform(512, 1024),  # MB
                },
                "after_optimization": {
                    "response_time": random.uniform(300, 600),  # ms
                    "accuracy": random.uniform(88, 95),  # %
                    "memory_usage": random.uniform(256, 512),  # MB
                },
                "improvements": {
                    "response_time_improvement": random.randint(30, 60),  # %
                    "accuracy_improvement": random.randint(3, 8),  # %
                    "memory_reduction": random.randint(20, 50),  # %
                },
                "optimization_techniques": [
                    "모델 양자화 적용",
                    "불필요한 레이어 제거",
                    "배치 크기 최적화",
                    "캐싱 전략 개선",
                    "병렬 처리 강화",
                ],
                "recommendations": [
                    "정기적인 모델 재훈련을 고려하세요.",
                    "하드웨어 가속을 활용하세요.",
                    "모델 버전 관리를 체계화하세요.",
                ],
            }

        elif optimization_type == "accuracy":
            optimization_result = {
                "optimization_type": optimization_type,
                "target_metric": target_metric,
                "before_optimization": {
                    "accuracy": random.uniform(80, 88),  # %
                    "precision": random.uniform(75, 85),  # %
                    "recall": random.uniform(70, 80),  # %
                    "f1_score": random.uniform(72, 82),  # %
                },
                "after_optimization": {
                    "accuracy": random.uniform(88, 95),  # %
                    "precision": random.uniform(85, 92),  # %
                    "recall": random.uniform(80, 90),  # %
                    "f1_score": random.uniform(82, 91),  # %
                },
                "improvements": {
                    "accuracy_improvement": random.randint(5, 12),  # %
                    "precision_improvement": random.randint(8, 15),  # %
                    "recall_improvement": random.randint(10, 18),  # %
                    "f1_improvement": random.randint(8, 16),  # %
                },
                "optimization_techniques": [
                    "데이터 증강 적용",
                    "앙상블 모델 구축",
                    "하이퍼파라미터 튜닝",
                    "교차 검증 강화",
                    "특성 엔지니어링 개선",
                ],
                "recommendations": [
                    "더 많은 고품질 데이터를 수집하세요.",
                    "도메인 특화 전처리를 적용하세요.",
                    "정기적인 모델 평가를 수행하세요.",
                ],
            }

        elif optimization_type == "memory":
            optimization_result = {
                "optimization_type": optimization_type,
                "target_metric": target_metric,
                "before_optimization": {
                    "memory_usage": random.uniform(1024, 2048),  # MB
                    "model_size": random.uniform(500, 1000),  # MB
                    "inference_memory": random.uniform(200, 400),  # MB
                },
                "after_optimization": {
                    "memory_usage": random.uniform(256, 512),  # MB
                    "model_size": random.uniform(100, 300),  # MB
                    "inference_memory": random.uniform(50, 150),  # MB
                },
                "improvements": {
                    "memory_reduction": random.randint(60, 80),  # %
                    "model_size_reduction": random.randint(70, 85),  # %
                    "inference_memory_reduction": random.randint(65, 80),  # %
                },
                "optimization_techniques": [
                    "모델 압축 적용",
                    "가중치 양자화",
                    "지식 증류 활용",
                    "프루닝 기법 적용",
                    "동적 로딩 구현",
                ],
                "recommendations": [
                    "모바일 환경을 고려한 경량화를 진행하세요.",
                    "메모리 사용량을 지속적으로 모니터링하세요.",
                    "필요에 따라 모델을 분할하여 로드하세요.",
                ],
            }

        result = {
            "success": True,
            "data": optimization_result,
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"⚡ {optimization_type} AI 모델 최적화가 완료되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"AI 모델 최적화 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/ai/benchmark", methods=["POST"])
@validate_json_request()
@monitor_performance
def benchmark_ai_models():
    """AI 모델 벤치마크"""
    try:
        data = request.get_json()
        benchmark_type = data.get(
            "benchmark_type", "comprehensive"
        )  # comprehensive, speed, accuracy, memory
        test_data_size = data.get("test_data_size", "medium")  # small, medium, large

        # 벤치마크 결과 생성
        models = ["GPT-3.5", "GPT-4", "Claude-3", "PaLM-2", "Custom-Model"]

        benchmark_results = []
        for model in models:
            # 각 모델별 성능 지표 시뮬레이션
            if model == "GPT-4":
                performance = {
                    "model_name": model,
                    "response_time": random.uniform(200, 400),
                    "accuracy": random.uniform(92, 96),
                    "memory_usage": random.uniform(800, 1200),
                    "throughput": random.uniform(50, 80),
                    "cost_per_request": random.uniform(0.02, 0.05),
                    "reliability": random.uniform(95, 99),
                }
            elif model == "GPT-3.5":
                performance = {
                    "model_name": model,
                    "response_time": random.uniform(300, 600),
                    "accuracy": random.uniform(85, 90),
                    "memory_usage": random.uniform(400, 600),
                    "throughput": random.uniform(80, 120),
                    "cost_per_request": random.uniform(0.01, 0.02),
                    "reliability": random.uniform(90, 95),
                }
            elif model == "Claude-3":
                performance = {
                    "model_name": model,
                    "response_time": random.uniform(250, 450),
                    "accuracy": random.uniform(88, 93),
                    "memory_usage": random.uniform(600, 900),
                    "throughput": random.uniform(60, 90),
                    "cost_per_request": random.uniform(0.015, 0.03),
                    "reliability": random.uniform(92, 97),
                }
            elif model == "PaLM-2":
                performance = {
                    "model_name": model,
                    "response_time": random.uniform(400, 700),
                    "accuracy": random.uniform(82, 88),
                    "memory_usage": random.uniform(500, 800),
                    "throughput": random.uniform(70, 100),
                    "cost_per_request": random.uniform(0.008, 0.015),
                    "reliability": random.uniform(88, 93),
                }
            else:  # Custom-Model
                performance = {
                    "model_name": model,
                    "response_time": random.uniform(100, 300),
                    "accuracy": random.uniform(80, 87),
                    "memory_usage": random.uniform(200, 400),
                    "throughput": random.uniform(100, 150),
                    "cost_per_request": random.uniform(0.005, 0.01),
                    "reliability": random.uniform(85, 90),
                }

            benchmark_results.append(performance)

        # 성능 순위 계산
        if benchmark_type == "comprehensive":
            # 종합 점수 계산 (가중 평균)
            for result in benchmark_results:
                score = (
                    (100 - result["response_time"] / 10)
                    * 0.2  # 응답 시간 (낮을수록 좋음)
                    + result["accuracy"] * 0.3  # 정확도
                    + (100 - result["memory_usage"] / 20)
                    * 0.15  # 메모리 사용량 (낮을수록 좋음)
                    + result["throughput"] * 0.15  # 처리량
                    + (100 - result["cost_per_request"] * 1000)
                    * 0.1  # 비용 (낮을수록 좋음)
                    + result["reliability"] * 0.1  # 신뢰성
                )
                result["comprehensive_score"] = round(score, 2)

            # 종합 점수 기준으로 정렬
            benchmark_results.sort(key=lambda x: x["comprehensive_score"], reverse=True)

        # 벤치마크 요약
        summary = {
            "best_model": benchmark_results[0]["model_name"],
            "best_score": benchmark_results[0].get("comprehensive_score", 0),
            "total_models_tested": len(benchmark_results),
            "test_duration": random.randint(300, 600),  # 초
            "test_data_size": test_data_size,
            "recommendations": [
                f"{benchmark_results[0]['model_name']}이 종합적으로 가장 우수한 성능을 보입니다.",
                "비용 효율성을 고려한다면 Custom-Model을 추천합니다.",
                "최고 정확도가 필요하다면 GPT-4를 사용하세요.",
                "빠른 응답이 중요하다면 Custom-Model을 고려하세요.",
            ],
        }

        result = {
            "success": True,
            "data": {
                "benchmark_type": benchmark_type,
                "test_data_size": test_data_size,
                "results": benchmark_results,
                "summary": summary,
                "generated_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"🏆 {benchmark_type} AI 모델 벤치마크가 완료되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"AI 모델 벤치마크 오류: {e}")
        return jsonify(
            {"success": False, "error": str(e), "timestamp": datetime.now().isoformat()}
        ), 500


@app.route("/api/integrated/ai/feedback", methods=["POST"])
@validate_json_request(required_fields=["feedback_type"])
@monitor_performance
def process_ai_feedback():
    """AI 피드백 처리 및 학습"""
    try:
        data = request.get_json()
        feedback_type = data.get(
            "feedback_type", "user_rating"
        )  # user_rating, correction, suggestion
        content = data.get("content", "")
        rating = data.get("rating", 0)  # 1-5
        correction = data.get("correction", "")
        context = data.get("context", {})

        # 피드백 처리 로직
        feedback_analysis = {
            "feedback_type": feedback_type,
            "content_length": len(content),
            "rating": rating,
            "has_correction": bool(correction),
            "context_info": context,
            "processed_at": datetime.now().isoformat(),
        }

        # 피드백 기반 개선 제안
        improvements = []

        if feedback_type == "user_rating":
            if rating >= 4:
                improvements.append("현재 성능이 우수합니다. 현재 전략을 유지하세요.")
            elif rating >= 3:
                improvements.append(
                    "성능 개선의 여지가 있습니다. 응답 품질을 높여보세요."
                )
            else:
                improvements.append("즉시 개선이 필요합니다. 모델 재훈련을 고려하세요.")

        if correction:
            improvements.append("사용자 수정사항을 학습 데이터에 반영하세요.")
            improvements.append("유사한 패턴의 오류를 방지하는 로직을 추가하세요.")

        # 학습 데이터 업데이트 시뮬레이션
        learning_update = {
            "new_training_samples": random.randint(10, 50),
            "model_accuracy_improvement": random.uniform(0.1, 2.0),
            "response_quality_score": random.uniform(0.5, 1.5),
            "user_satisfaction_trend": "improving" if rating >= 3 else "declining",
        }

        # 피드백 통계 업데이트
        feedback_stats = {
            "total_feedback_count": random.randint(1000, 5000),
            "average_rating": random.uniform(3.5, 4.5),
            "positive_feedback_rate": random.uniform(70, 90),
            "improvement_suggestions_count": random.randint(50, 200),
        }

        result = {
            "success": True,
            "data": {
                "feedback_analysis": feedback_analysis,
                "improvements": improvements,
                "learning_update": learning_update,
                "feedback_stats": feedback_stats,
                "processed_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

        logger.info(f"📝 {feedback_type} 피드백이 처리되었습니다.")
        return jsonify(result)

    except Exception as e:
        logger.error(f"AI 피드백 처리 오류: {e}", exc_info=True)
        return create_error_response(
            "AI 피드백 처리 실패",
            message=f"피드백 처리 중 오류가 발생했습니다: {str(e)}",
        )


if __name__ == "__main__":
    _api_port = int(
        os.environ.get(
            "BACKEND_PORT",
            os.environ.get("API_PORT", os.environ.get("PORT", "5002")),
        )
    )
    logger.info("🚀 CORBU.AI 간단한 통합 API 서버를 시작합니다...")
    logger.info(f"📍 API 서버: http://localhost:{_api_port} (프론트엔드는 PORT=3000, docs/PORTS.md 참고)")
    logger.info(f"🔗 헬스: http://localhost:{_api_port}/api/integrated/health")

    app.run(host="0.0.0.0", port=_api_port, debug=True, threaded=True)
