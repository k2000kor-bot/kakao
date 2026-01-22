#!/usr/bin/env python3
"""
CORBU AI 간단한 통합 API 서버 v1.0
- 의존성 문제를 해결한 간단한 버전
- 핵심 기능만 포함
- Flask 기반으로 기존 app.py와 통합
"""

import logging
import time
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from functools import wraps

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


# 유틸리티 함수
def create_error_response(
    error: str, status_code: int = 500, message: Optional[str] = None
) -> Tuple[Response, int]:
    """표준화된 에러 응답 생성"""
    error_data = {
        "success": False,
        "error": error,
        "message": message or error,
        "timestamp": datetime.now().isoformat(),
    }
    return (
        jsonify(error_data),
        status_code,
    )


def create_success_response(
    data: Dict[str, Any], status_code: int = 200
) -> Tuple[Response, int]:
    """표준화된 성공 응답 생성"""
    return (
        jsonify(
            {
                "success": True,
                "data": data,
                "timestamp": datetime.now().isoformat(),
            }
        ),
        status_code,
    )


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

    def analyze_message(self, message: str) -> dict:
        """메시지 종합 분석"""
        try:
            start_time = time.time()

            # 감정 분석
            emotion_analysis = self._analyze_emotion(message)

            # 키워드 추출
            keywords = self._extract_keywords(message)

            # 의도 분석
            intent = self._analyze_intent(message)

            # 응답 생성
            response = self._generate_response(message, emotion_analysis, intent)

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
                    "안녕하세요! 기분이 좋으시네요! CORBU AI가 더욱 기쁘게 도와드리겠습니다! 😊",
                    "반갑습니다! 좋은 하루 보내고 계시는군요! 무엇을 도와드릴까요? ✨",
                    "안녕하세요! 긍정적인 에너지가 느껴지네요! 기꺼이 도와드리겠습니다! 🌟",
                ],
                "부정": [
                    "안녕하세요... 힘든 하루이신 것 같네요. CORBU AI가 도와드릴게요. 😔",
                    "반갑습니다. 마음이 무겁으시군요. 제가 도와드릴 수 있는 것이 있다면 말씀해주세요. 🤗",
                    "안녕하세요. 어려운 시간이시군요. 함께 해결해보아요. 💪",
                ],
                "중립": [
                    "안녕하세요! CORBU AI입니다. 무엇을 도와드릴까요?",
                    "반갑습니다! 어떤 도움이 필요하신가요?",
                    "안녕하세요! 기쁘게 도와드리겠습니다.",
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
            "service": "CORBU AI 통합 API",
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


@app.route("/api/integrated/logs", methods=["GET"])
@monitor_performance
def get_logs():
    """시스템 로그 조회"""
    try:
        # 시뮬레이션된 로그 데이터
        logs = [
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

        return create_success_response({"logs": logs, "total_count": len(logs)})
    except Exception as e:
        logger.error(f"로그 조회 오류: {e}", exc_info=True)
        return create_error_response(f"로그 조회 실패: {str(e)}", 500)


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
                    "채팅 기능이 가장 많이 사용되고 있습니다.",
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
        days = horizons.get(prediction_horizon, 30)

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
                "chat": ["채팅", "대화", "응답"],
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
    logger.info("🚀 CORBU AI 간단한 통합 API 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:5002")
    logger.info("🔗 기존 백엔드: http://localhost:5001")

    app.run(host="0.0.0.0", port=5002, debug=True, threaded=True)
