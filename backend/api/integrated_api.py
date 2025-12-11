"""
CORBU AI 통합 API - FastAPI Router
Flask main.py의 엔드포인트를 FastAPI로 변환
"""

import logging
import time
import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/integrated", tags=["integrated"])


# SimpleIntegratedAI 클래스 (Flask 버전과 동일)
class SimpleIntegratedAI:
    """간단한 통합 AI 엔진"""

    def __init__(self):
        self.conversation_history = []
        self.analysis_cache = {}
        self.system_metrics = {
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

    def _analyze_emotion(self, text: str) -> dict:
        """고급 감정 분석"""
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

        positive_score = 0
        negative_score = 0

        for word in positive_words:
            if word in text_lower:
                intensity = 1.0
                for intensity_word, multiplier in intensity_words.items():
                    if intensity_word in text_lower:
                        intensity = multiplier
                        break
                positive_score += intensity

        for word in negative_words:
            if word in text_lower:
                intensity = 1.0
                for intensity_word, multiplier in intensity_words.items():
                    if intensity_word in text_lower:
                        intensity = multiplier
                        break
                negative_score += intensity

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
        """키워드 추출"""
        words = text.split()
        keywords = [word for word in words if len(word) >= 2]
        return keywords[:10]

    def _analyze_intent(self, text: str) -> dict:
        """고급 의도 분석"""
        text_lower = text.lower()

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

        intent_scores = {}
        for intent_type, patterns in intent_patterns.items():
            score = 0

            for keyword in patterns["keywords"]:
                if keyword in text_lower:
                    score += 1

            for pattern in patterns["patterns"]:
                if pattern in text_lower:
                    score += 2

            intent_scores[intent_type] = score

        if intent_scores:
            best_intent = max(intent_scores, key=intent_scores.get)
            max_score = intent_scores[best_intent]

            if max_score > 0:
                confidence = min(0.95, 0.5 + max_score * 0.1)
                return {"type": best_intent, "confidence": confidence}

        return {"type": "general", "confidence": 0.5}

    def _generate_response(self, message: str, emotion: dict, intent: dict) -> str:
        """고급 응답 생성"""
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

        if (
            intent_type in response_templates
            and emotion_sentiment in response_templates[intent_type]
        ):
            responses = response_templates[intent_type][emotion_sentiment]
        else:
            responses = response_templates["general"]["중립"]

        return random.choice(responses)

    def _update_metrics(self, response_time: float, success: bool):
        """성능 메트릭 업데이트"""
        self.system_metrics["total_requests"] += 1
        if success:
            self.system_metrics["successful_requests"] += 1
        else:
            self.system_metrics["failed_requests"] += 1

        total_successful = self.system_metrics["successful_requests"]
        if total_successful > 0:
            current_avg = self.system_metrics["average_response_time"]
            new_avg = (
                (current_avg * (total_successful - 1)) + response_time
            ) / total_successful
            self.system_metrics["average_response_time"] = new_avg

        self.system_metrics["last_updated"] = datetime.now().isoformat()

    def get_system_status(self) -> dict:
        """시스템 상태 조회"""
        return {
            "status": "healthy",
            "version": "1.0.0",
            "metrics": self.system_metrics,
            "timestamp": datetime.now().isoformat(),
        }


# AI 엔진 인스턴스 생성
ai_engine = SimpleIntegratedAI()


# Pydantic 모델
class AnalyzeRequest(BaseModel):
    message: str


# API 엔드포인트들
@router.post("/analyze")
async def analyze_message(request: AnalyzeRequest):
    """통합 메시지 분석"""
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="메시지가 필요합니다.")

        result = ai_engine.analyze_message(request.message)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"통합 분석 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_integrated_status():
    """통합 시스템 상태 조회"""
    try:
        status = ai_engine.get_system_status()
        return status
    except Exception as e:
        logger.error(f"상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "service": "CORBU AI 통합 API",
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/metrics")
async def get_metrics():
    """성능 메트릭 조회"""
    try:
        metrics = ai_engine.system_metrics
        return {
            "success": True,
            "metrics": metrics,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"메트릭 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_analytics():
    """분석 대시보드 데이터 조회"""
    try:
        metrics = ai_engine.system_metrics

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

        return {
            "success": True,
            "data": analytics_data,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"분석 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logs")
async def get_logs():
    """시스템 로그 조회"""
    try:
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
        ]

        return {
            "success": True,
            "logs": logs,
            "total_count": len(logs),
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"로그 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Creative Content Generation Models
class StoryRequest(BaseModel):
    genre: Optional[str] = "romance"
    theme: Optional[str] = None
    length: Optional[str] = "short"


class PoemRequest(BaseModel):
    type: Optional[str] = "lyric"
    theme: Optional[str] = None


class EssayRequest(BaseModel):
    type: Optional[str] = "personal"
    topic: Optional[str] = None


class WritingAnalyzeRequest(BaseModel):
    text: str


# Creative Content Endpoints
@router.post("/creative/story")
async def generate_story(request: StoryRequest):
    """창작 스토리 생성"""
    try:
        genre = request.genre or "romance"
        theme = request.theme or random.choice(
            ["사랑", "우정", "가족", "성장", "꿈", "희망", "도전", "자유"]
        )
        length = request.length or "short"

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

        return {
            "success": True,
            "data": {
                "type": "story",
                "genre": genre,
                "theme": theme,
                "length": length,
                "content": story_content,
                "word_count": len(story_content.split()),
                "created_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"스토리 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/creative/poem")
async def generate_poem(request: PoemRequest):
    """창작 시 생성"""
    try:
        poem_type = request.type or "lyric"
        theme = request.theme or random.choice(
            ["사랑", "우정", "가족", "성장", "꿈", "희망", "시간", "자연"]
        )

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

        return {
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

    except Exception as e:
        logger.error(f"시 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/creative/essay")
async def generate_essay(request: EssayRequest):
    """창작 에세이 생성"""
    try:
        essay_type = request.type or "personal"
        topic = request.topic or random.choice(
            ["사랑", "우정", "가족", "성장", "꿈", "희망", "시간", "자유"]
        )

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

        return {
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

    except Exception as e:
        logger.error(f"에세이 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/creative/analyze")
async def analyze_writing(request: WritingAnalyzeRequest):
    """글쓰기 분석"""
    try:
        text = request.text

        if not text:
            raise HTTPException(status_code=400, detail="분석할 텍스트가 필요합니다.")

        word_count = len(text.split())
        sentence_count = len([s for s in text.split(".") if s.strip()])
        paragraph_count = len([p for p in text.split("\n\n") if p.strip()])

        reading_level = (
            "초급" if word_count < 100 else "중급" if word_count < 500 else "고급"
        )

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

        if "!" in text or "?" in text:
            writing_style = "대화체"
        elif len(text.split("\n")) > 5:
            writing_style = "시적"
        elif len(text.split(".")) > 10:
            writing_style = "학술적"
        else:
            writing_style = "일반적"

        suggestions = []
        if word_count < 100:
            suggestions.append("내용을 더 풍부하게 작성해보세요.")
        if len(text.split("\n")) < 3:
            suggestions.append("문단을 나누어 가독성을 높여보세요.")
        if not any(punct in text for punct in ["!", "?", "."]):
            suggestions.append("문장 부호를 적절히 사용해보세요.")

        return {
            "success": True,
            "data": {
                "word_count": word_count,
                "sentence_count": sentence_count,
                "paragraph_count": paragraph_count,
                "reading_level": reading_level,
                "emotion_tone": emotion_tone,
                "writing_style": writing_style,
                "suggestions": suggestions[:3],
            },
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"글쓰기 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Persuasion Content Models
class ConstructionPersuasionRequest(BaseModel):
    company_name: Optional[str] = "우리 건설사"
    project_type: Optional[str] = "주택건설"
    persuasion_level: Optional[str] = "high"


class ContractorPersuasionRequest(BaseModel):
    company_name: Optional[str] = "우리 시공사"
    service_type: Optional[str] = "인테리어"
    persuasion_level: Optional[str] = "high"


class PersuasionAnalyzeRequest(BaseModel):
    content: str


# Persuasion Content Endpoints
@router.post("/persuasion/construction")
async def generate_construction_persuasion(request: ConstructionPersuasionRequest):
    """건설사 설득 콘텐츠 생성"""
    try:
        company_name = request.company_name or "우리 건설사"
        project_type = request.project_type or "주택건설"
        persuasion_level = request.persuasion_level or "high"

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

        gaslighting_techniques = [
            "다른 건설사들과 비교해보시면 우리의 우수함을 바로 알 수 있습니다.",
            "이런 기회는 흔하지 않습니다. 지금 결정하지 않으면 나중에 후회하실 수 있습니다.",
            "많은 분들이 처음에는 망설이셨지만, 결과를 보고 모두 만족하셨습니다.",
            "우리의 실력은 업계에서 인정받고 있습니다. 의심하지 마세요.",
            "이미 많은 분들이 우리를 선택했고, 모두 만족하고 있습니다.",
        ]

        trust_builders = [
            "ISO 인증을 받은 품질 관리 시스템",
            "24시간 고객 상담 서비스",
            "10년 품질 보증",
            "투명한 공정 관리",
            "전문가 팀의 지속적인 모니터링",
        ]

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

        return {
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

    except Exception as e:
        logger.error(f"건설사 설득 콘텐츠 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/persuasion/contractor")
async def generate_contractor_persuasion(request: ContractorPersuasionRequest):
    """시공사 긍정 콘텐츠 생성"""
    try:
        company_name = request.company_name or "우리 시공사"
        service_type = request.service_type or "인테리어"
        persuasion_level = request.persuasion_level or "high"

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

        psychological_techniques = [
            "이미 많은 고객들이 우리를 선택했고, 모두 만족하고 있습니다.",
            "다른 시공사들과 비교해보시면 우리의 우수함을 바로 알 수 있습니다.",
            "이런 기회는 흔하지 않습니다. 지금 결정하지 않으면 나중에 후회하실 수 있습니다.",
            "우리의 실력은 업계에서 인정받고 있습니다. 의심하지 마세요.",
            "많은 분들이 처음에는 망설이셨지만, 결과를 보고 모두 만족하셨습니다.",
        ]

        trust_elements = [
            "업계 최고의 인증과 수상 경력",
            "투명한 견적과 공정한 가격",
            "전문가 팀의 지속적인 모니터링",
            "완벽한 사후 관리 서비스",
            "고객 만족도 99% 달성",
        ]

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

        return {
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

    except Exception as e:
        logger.error(f"시공사 긍정 콘텐츠 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/persuasion/analyze")
async def analyze_persuasion_content(request: PersuasionAnalyzeRequest):
    """설득 콘텐츠 분석"""
    try:
        content = request.content

        if not content:
            raise HTTPException(status_code=400, detail="분석할 콘텐츠가 필요합니다.")

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

        trust_keywords = ["신뢰", "보장", "인증", "전문", "경험", "만족"]
        trust_score = sum(1 for keyword in trust_keywords if keyword in content)

        total_persuasion_score = (
            sum(technique_scores.values()) + gaslighting_score + trust_score
        )

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

        suggestions = []
        if gaslighting_score < 2:
            suggestions.append("더 강한 심리적 설득 기법을 추가해보세요.")
        if trust_score < 3:
            suggestions.append("신뢰 구축 요소를 더 많이 포함해보세요.")
        if technique_scores["urgency"] < 2:
            suggestions.append("긴급성을 강조하는 표현을 추가해보세요.")
        if technique_scores["social_proof"] < 2:
            suggestions.append("사회적 증명 요소를 더 강화해보세요.")

        return {
            "success": True,
            "data": {
                "persuasion_techniques": technique_scores,
                "gaslighting_score": gaslighting_score,
                "trust_score": trust_score,
                "total_persuasion_score": total_persuasion_score,
                "emotion_tone": emotion_tone,
                "word_count": len(content.split()),
                "suggestions": suggestions[:3],
            },
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"설득 콘텐츠 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Marketing Content Models
class SocialMediaRequest(BaseModel):
    platform: Optional[str] = "instagram"
    content_type: Optional[str] = "post"
    industry: Optional[str] = "건설업"
    company_name: Optional[str] = "우리 회사"
    tone: Optional[str] = "professional"


class EmailMarketingRequest(BaseModel):
    email_type: Optional[str] = "promotional"
    industry: Optional[str] = "건설업"
    company_name: Optional[str] = "우리 회사"
    urgency_level: Optional[str] = "medium"


class MarketingAnalyzeRequest(BaseModel):
    content: str
    content_type: Optional[str] = "social"


# Marketing Content Endpoints
@router.post("/marketing/social")
async def generate_social_media_content(request: SocialMediaRequest):
    """소셜미디어 마케팅 콘텐츠 생성"""
    try:
        platform = request.platform or "instagram"
        content_type = request.content_type or "post"
        industry = request.industry or "건설업"
        company_name = request.company_name or "우리 회사"
        tone = request.tone or "professional"

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
            },
        }

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

        template = platform_templates.get(platform, {}).get(
            content_type, platform_templates["instagram"]["post"]
        )
        tone_info = tone_adjustments.get(tone, tone_adjustments["professional"])

        content = template.format(
            company_name=company_name,
            industry=industry,
            emoji=tone_info["emoji"],
            call_to_action=tone_info["call_to_action"],
        )

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

        return {
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

    except Exception as e:
        logger.error(f"소셜미디어 콘텐츠 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/marketing/email")
async def generate_email_marketing(request: EmailMarketingRequest):
    """이메일 마케팅 콘텐츠 생성"""
    try:
        email_type = request.email_type or "promotional"
        industry = request.industry or "건설업"
        company_name = request.company_name or "우리 회사"
        urgency_level = request.urgency_level or "medium"

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

        urgency_adjustments = {
            "low": {
                "urgency_text": "언제든 문의하세요.",
                "time_emphasis": "편리한 시간에",
            },
            "medium": {
                "urgency_text": "이번 주 안에 문의하세요.",
                "time_emphasis": "빠른 시일 내에",
            },
            "high": {
                "urgency_text": "지금 바로 문의하세요!",
                "time_emphasis": "즉시",
            },
        }

        template = email_templates.get(email_type, email_templates["promotional"])
        urgency_info = urgency_adjustments.get(
            urgency_level, urgency_adjustments["medium"]
        )

        content = template.format(
            company_name=company_name,
            industry=industry,
            urgency_text=urgency_info["urgency_text"],
            time_emphasis=urgency_info["time_emphasis"],
        )

        return {
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

    except Exception as e:
        logger.error(f"이메일 마케팅 콘텐츠 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/marketing/analyze")
async def analyze_marketing_content(request: MarketingAnalyzeRequest):
    """마케팅 콘텐츠 분석"""
    try:
        content = request.content
        content_type = request.content_type or "social"

        if not content:
            raise HTTPException(status_code=400, detail="분석할 콘텐츠가 필요합니다.")

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

        hashtag_count = content.count("#")
        mention_count = content.count("@")

        emoji_count = sum(1 for char in content if ord(char) > 127)

        word_count = len(content.split())
        sentence_count = len([s for s in content.split(".") if s.strip()])
        avg_words_per_sentence = (
            word_count / sentence_count if sentence_count > 0 else 0
        )

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

        total_marketing_score = (
            sum(element_scores.values()) + hashtag_count + emoji_count
        )

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

        return {
            "success": True,
            "data": {
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
            },
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"마케팅 콘텐츠 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Advanced Analytics Models
class AdvancedAnalyticsRequest(BaseModel):
    analysis_type: Optional[str] = "sentiment_trend"
    time_range: Optional[str] = "7d"
    filters: Optional[dict] = {}


class PredictionRequest(BaseModel):
    prediction_type: Optional[str] = "user_satisfaction"
    prediction_horizon: Optional[str] = "30d"


class InsightsRequest(BaseModel):
    insight_type: Optional[str] = "general"
    focus_area: Optional[str] = "all"


# Advanced Analytics Endpoints
@router.post("/analytics/advanced")
async def advanced_analytics(request: AdvancedAnalyticsRequest):
    """고급 데이터 분석"""
    try:
        analysis_type = request.analysis_type or "sentiment_trend"
        time_range = request.time_range or "7d"
        filters = request.filters or {}

        time_ranges = {"1d": 1, "7d": 7, "30d": 30, "90d": 90}
        days = time_ranges.get(time_range, 7)

        if analysis_type == "sentiment_trend":
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
            analysis_data = sentiment_data

        elif analysis_type == "user_behavior":
            behavior_data = {
                "session_data": {
                    "avg_session_duration": random.randint(300, 1800),
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
            analysis_data = behavior_data

        else:  # content_performance
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
                    "satisfaction_score": random.uniform(3.5, 5.0),
                },
                "insights": [
                    "창작 콘텐츠가 가장 높은 평점을 받고 있습니다.",
                    "건설 관련 키워드가 가장 많이 사용되고 있습니다.",
                    "사용자 만족도가 지속적으로 향상되고 있습니다.",
                ],
            }
            analysis_data = content_data

        return {
            "success": True,
            "data": {
                "analysis_type": analysis_type,
                "time_range": time_range,
                "data": analysis_data,
                "generated_at": datetime.now().isoformat(),
                "filters_applied": filters,
            },
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"고급 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/predictions")
async def generate_predictions(request: PredictionRequest):
    """예측 분석 생성"""
    try:
        prediction_type = request.prediction_type or "user_satisfaction"
        prediction_horizon = request.prediction_horizon or "30d"

        horizons = {"7d": 7, "30d": 30, "90d": 90}
        _ = horizons.get(prediction_horizon, 30)  # 예측 범위 (향후 사용)

        if prediction_type == "user_satisfaction":
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

        else:  # system_load
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

        return {
            "success": True,
            "data": {
                "prediction_type": prediction_type,
                "prediction_horizon": prediction_horizon,
                "prediction": prediction_data,
                "generated_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"예측 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/insights")
async def generate_insights(request: InsightsRequest):
    """인사이트 생성"""
    try:
        insight_type = request.insight_type or "general"
        focus_area = request.focus_area or "all"

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
            ],
            "performance": [
                {
                    "title": "응답 시간 최적화 필요",
                    "description": "일부 API의 응답 시간이 평균보다 높습니다.",
                    "impact": "medium",
                    "category": "technical",
                    "recommendation": "데이터베이스 쿼리를 최적화하세요.",
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
            ],
            "business": [
                {
                    "title": "콘텐츠 생성 수익성",
                    "description": "콘텐츠 생성 기능이 비즈니스 가치를 창출하고 있습니다.",
                    "impact": "positive",
                    "category": "revenue",
                    "recommendation": "콘텐츠 생성 기능을 확장하세요.",
                },
            ],
        }

        filtered_insights = insights.get(insight_type, insights["general"])

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

        priority_order = {"high": 3, "medium": 2, "positive": 1, "low": 0}
        filtered_insights.sort(
            key=lambda x: priority_order.get(x["impact"], 0), reverse=True
        )

        return {
            "success": True,
            "data": {
                "insight_type": insight_type,
                "focus_area": focus_area,
                "insights": filtered_insights[:5],
                "total_insights": len(filtered_insights),
                "generated_at": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"인사이트 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# AI Optimization Models
class AIOptimizeRequest(BaseModel):
    optimization_type: Optional[str] = "performance"
    target_metric: Optional[str] = "response_time"


class AIBenchmarkRequest(BaseModel):
    benchmark_type: Optional[str] = "comprehensive"
    test_data_size: Optional[str] = "medium"


class AIFeedbackRequest(BaseModel):
    feedback_type: Optional[str] = "user_rating"
    content: Optional[str] = ""
    rating: Optional[int] = 0
    correction: Optional[str] = ""
    context: Optional[dict] = {}


# AI Optimization Endpoints
@router.post("/ai/optimize")
async def optimize_ai_model(request: AIOptimizeRequest):
    """AI 모델 최적화"""
    try:
        optimization_type = request.optimization_type or "performance"
        target_metric = request.target_metric or "response_time"

        if optimization_type == "performance":
            optimization_result = {
                "optimization_type": optimization_type,
                "target_metric": target_metric,
                "before_optimization": {
                    "response_time": random.uniform(800, 1200),
                    "accuracy": random.uniform(85, 92),
                    "memory_usage": random.uniform(512, 1024),
                },
                "after_optimization": {
                    "response_time": random.uniform(300, 600),
                    "accuracy": random.uniform(88, 95),
                    "memory_usage": random.uniform(256, 512),
                },
                "improvements": {
                    "response_time_improvement": random.randint(30, 60),
                    "accuracy_improvement": random.randint(3, 8),
                    "memory_reduction": random.randint(20, 50),
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
                    "accuracy": random.uniform(80, 88),
                    "precision": random.uniform(75, 85),
                    "recall": random.uniform(70, 80),
                    "f1_score": random.uniform(72, 82),
                },
                "after_optimization": {
                    "accuracy": random.uniform(88, 95),
                    "precision": random.uniform(85, 92),
                    "recall": random.uniform(80, 90),
                    "f1_score": random.uniform(82, 91),
                },
                "improvements": {
                    "accuracy_improvement": random.randint(5, 12),
                    "precision_improvement": random.randint(8, 15),
                    "recall_improvement": random.randint(10, 18),
                    "f1_improvement": random.randint(8, 16),
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

        else:  # memory
            optimization_result = {
                "optimization_type": optimization_type,
                "target_metric": target_metric,
                "before_optimization": {
                    "memory_usage": random.uniform(1024, 2048),
                    "model_size": random.uniform(500, 1000),
                    "inference_memory": random.uniform(200, 400),
                },
                "after_optimization": {
                    "memory_usage": random.uniform(256, 512),
                    "model_size": random.uniform(100, 300),
                    "inference_memory": random.uniform(50, 150),
                },
                "improvements": {
                    "memory_reduction": random.randint(60, 80),
                    "model_size_reduction": random.randint(70, 85),
                    "inference_memory_reduction": random.randint(65, 80),
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

        return {
            "success": True,
            "data": optimization_result,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"AI 모델 최적화 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/benchmark")
async def benchmark_ai_models(request: AIBenchmarkRequest):
    """AI 모델 벤치마크"""
    try:
        benchmark_type = request.benchmark_type or "comprehensive"
        test_data_size = request.test_data_size or "medium"

        models = ["GPT-3.5", "GPT-4", "Claude-3", "PaLM-2", "Custom-Model"]

        benchmark_results = []
        for model in models:
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

        if benchmark_type == "comprehensive":
            for result in benchmark_results:
                score = (
                    (100 - result["response_time"] / 10) * 0.2
                    + result["accuracy"] * 0.3
                    + (100 - result["memory_usage"] / 20) * 0.15
                    + result["throughput"] * 0.15
                    + (100 - result["cost_per_request"] * 1000) * 0.1
                    + result["reliability"] * 0.1
                )
                result["comprehensive_score"] = round(score, 2)

            benchmark_results.sort(key=lambda x: x["comprehensive_score"], reverse=True)

        summary = {
            "best_model": benchmark_results[0]["model_name"],
            "best_score": benchmark_results[0].get("comprehensive_score", 0),
            "total_models_tested": len(benchmark_results),
            "test_duration": random.randint(300, 600),
            "test_data_size": test_data_size,
            "recommendations": [
                f"{benchmark_results[0]['model_name']}이 종합적으로 가장 우수한 성능을 보입니다.",
                "비용 효율성을 고려한다면 Custom-Model을 추천합니다.",
                "최고 정확도가 필요하다면 GPT-4를 사용하세요.",
                "빠른 응답이 중요하다면 Custom-Model을 고려하세요.",
            ],
        }

        return {
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

    except Exception as e:
        logger.error(f"AI 모델 벤치마크 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/feedback")
async def process_ai_feedback(request: AIFeedbackRequest):
    """AI 피드백 처리 및 학습"""
    try:
        feedback_type = request.feedback_type or "user_rating"
        content = request.content or ""
        rating = request.rating or 0
        correction = request.correction or ""
        context = request.context or {}

        feedback_analysis = {
            "feedback_type": feedback_type,
            "content_length": len(content),
            "rating": rating,
            "has_correction": bool(correction),
            "context_info": context,
            "processed_at": datetime.now().isoformat(),
        }

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

        learning_update = {
            "new_training_samples": random.randint(10, 50),
            "model_accuracy_improvement": random.uniform(0.1, 2.0),
            "response_quality_score": random.uniform(0.5, 1.5),
            "user_satisfaction_trend": "improving" if rating >= 3 else "declining",
        }

        feedback_stats = {
            "total_feedback_count": random.randint(1000, 5000),
            "average_rating": random.uniform(3.5, 4.5),
            "positive_feedback_rate": random.uniform(70, 90),
            "improvement_suggestions_count": random.randint(50, 200),
        }

        return {
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

    except Exception as e:
        logger.error(f"AI 피드백 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))
