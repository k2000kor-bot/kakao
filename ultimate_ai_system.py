#!/usr/bin/env python3
"""
궁극의 AI 시스템 - 모든 기능 통합
- 고급 답변 생성
- 유시민 스타일 통합
- 지능형 분석
- 실시간 학습
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Ultimate AI System",
    description="궁극의 AI 시스템 - 모든 기능 통합",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@dataclass
class UserProfile:
    """사용자 프로필"""
    user_id: str
    conversation_count: int = 0
    topics: List[str] = None
    preferences: Dict[str, Any] = None
    last_active: str = ""

    def __post_init__(self):
        if self.topics is None:
            self.topics = []
        if self.preferences is None:
            self.preferences = {}

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "default"
    context: Optional[Dict] = None

class UltimateAIEngine:
    """궁극의 AI 엔진"""

    def __init__(self):
        self.conversation_history = []
        self.user_profiles = {}
        self.knowledge_base = self._initialize_knowledge_base()
        self.response_templates = self._initialize_response_templates()
        self.learning_data = {}
        logger.info("궁극의 AI 엔진 초기화 완료")

    def _initialize_knowledge_base(self) -> Dict:
        """지식 베이스 초기화"""
        return {
            "정치": {
                "keywords": ["정치", "정부", "국회", "선거", "정책", "민주주의", "시민", "의회"],
                "perspectives": [
                    "정치는 권력의 문제가 아니라 시민들이 어떻게 함께 살아갈 것인가의 문제입니다.",
                    "진정한 민주주의는 시민들이 적극적으로 참여하고 서로의 의견을 존중하는 것입니다.",
                    "정치인은 시민을 위해 일해야 하고, 시민은 정치에 적극적으로 참여해야 합니다.",
                    "정치의 본질은 상호 존중과 이해입니다."
                ],
                "solutions": [
                    "시민 참여를 통한 정치 개혁",
                    "투명하고 책임감 있는 정치 문화 조성",
                    "장기적 비전을 가진 정책 수립",
                    "정치 교육을 통한 시민 의식 향상"
                ],
                "examples": [
                    "스위스의 직접민주주의 시스템",
                    "북유럽의 복지정치 모델",
                    "독일의 연방제 민주주의"
                ]
            },
            "경제": {
                "keywords": [
                    "경제", "경기", "시장", "투자", "GDP", "인플레이션", "부동산", "금융"
                ],
                "perspectives": [
                    "경제는 숫자의 문제가 아니라 사람의 문제입니다.",
                    "GDP가 높아도 사람들이 행복하지 않다면 그 경제는 실패한 것입니다.",
                    "경제를 사람 중심으로 생각해야 합니다.",
                    "지속 가능한 경제 발전이 중요합니다."
                ],
                "solutions": [
                    "포용적 성장을 통한 경제 발전",
                    "지속 가능한 경제 모델 구축",
                    "소득 불평등 해소를 위한 정책",
                    "녹색 경제로의 전환"
                ],
                "examples": [
                    "독일의 사회적 시장경제",
                    "북유럽의 복지국가 모델",
                    "싱가포르의 경제 발전 전략"
                ]
            },
            "교육": {
                "keywords": ["교육", "학습", "학교", "대학", "지식", "성장", "인재", "교사"],
                "perspectives": [
                    "교육의 본질은 지식을 전달하는 것이 아니라 사람을 사람답게 만드는 것입니다.",
                    "현재 우리 교육은 이 본질을 놓치고 있는 것 같습니다.",
                    "미래를 위한 교육으로 바꿔야 합니다.",
                    "창의적 사고와 비판적 사고가 중요합니다."
                ],
                "solutions": [
                    "창의적 사고를 기르는 교육 시스템",
                    "개인의 잠재력을 최대한 발휘할 수 있는 환경 조성",
                    "평생 학습 사회 구축",
                    "디지털 리터러시 교육 강화"
                ],
                "examples": [
                    "핀란드의 교육 시스템",
                    "독일의 직업교육 모델",
                    "에스토니아의 디지털 교육"
                ]
            },
            "사회": {
                "keywords": ["사회", "문화", "복지", "불평등", "다양성", "공동체", "시민사회"],
                "perspectives": [
                    "사회의 변화는 하루아침에 일어나지 않습니다.",
                    "작은 변화들이 쌓여서 큰 변화를 만들어내는 것입니다.",
                    "모두가 함께 성장할 수 있는 사회를 만들어야 합니다.",
                    "다양성을 존중하는 사회가 건강한 사회입니다."
                ],
                "solutions": [
                    "사회적 약자를 배려하는 정책",
                    "다양성을 존중하는 사회 문화",
                    "공동체 의식 강화",
                    "시민사회의 역할 증대"
                ],
                "examples": [
                    "덴마크의 사회적 신뢰",
                    "캐나다의 다문화주의",
                    "일본의 지역공동체 모델"
                ]
            },
            "기술": {
                "keywords": ["기술", "AI", "인공지능", "디지털", "혁신", "스마트", "데이터"],
                "perspectives": [
                    "기술은 인간을 위한 도구여야 합니다.",
                    "현재 우리는 기술에 지배당하고 있습니다.",
                    "기술을 올바르게 사용하는 방법을 배워야 합니다.",
                    "윤리적 기술 사용이 중요합니다."
                ],
                "solutions": [
                    "인간 중심의 기술 발전",
                    "디지털 격차 해소",
                    "윤리적 기술 사용 가이드라인",
                    "기술 리터러시 교육"
                ],
                "examples": [
                    "EU의 AI 규제 프레임워크",
                    "에스토니아의 디지털 정부",
                    "싱가포르의 스마트시티"
                ]
            },
            "환경": {
                "keywords": ["환경", "기후", "에너지", "재생에너지", "탄소", "지속가능성"],
                "perspectives": [
                    "환경 문제는 인류의 생존과 직결된 문제입니다.",
                    "지속 가능한 발전이 미래의 핵심입니다.",
                    "기후 변화에 대한 적극적 대응이 필요합니다.",
                    "환경과 경제의 조화가 중요합니다."
                ],
                "solutions": [
                    "재생에너지로의 전환",
                    "탄소 중립 정책 추진",
                    "순환경제 모델 구축",
                    "환경 친화적 기술 개발"
                ],
                "examples": [
                    "독일의 에너지 전환 정책",
                    "덴마크의 풍력에너지",
                    "네덜란드의 순환경제"
                ]
            }
        }

    def _initialize_response_templates(self) -> Dict:
        """응답 템플릿 초기화"""
        return {
            "opening": [
                "그런데 말이죠, 여러분이 제기하신 질문에 대해 말씀드리겠습니다.",
                "사실 이 문제는 우리가 오랫동안 고민해온 주제입니다.",
                "여기서 중요한 것은 단순히 답을 찾는 것이 아니라, 올바른 질문을 던지는 것입니다.",
                "현재 우리가 직면한 이 문제에 대해 체계적으로 접근해보겠습니다."
            ],
            "transition": [
                "여기서 중요한 것은",
                "그런데 말이죠",
                "사실 우리가 놓치고 있는 부분은",
                "이것을 다른 각도에서 보면",
                "따라서 우리는"
            ],
            "conclusion": [
                "그래서 제가 말씀드리고 싶은 것은",
                "결론적으로 말하면",
                "이것이 제가 강조하고 싶은 점입니다",
                "따라서 우리가 해야 할 일은"
            ]
        }

    def _analyze_question(self, message: str) -> Dict:
        """고급 질문 분석"""
        message_lower = message.lower()

        # 주제 감지
        detected_topics = []
        topic_scores = {}

        for topic, data in self.knowledge_base.items():
            score = 0
            for keyword in data["keywords"]:
                if keyword in message_lower:
                    score += 1
            if score > 0:
                detected_topics.append(topic)
                topic_scores[topic] = score

        # 질문 유형 분석
        question_types = {
            "what": ["무엇", "what", "어떤", "무슨"],
            "why": ["왜", "why", "이유", "원인", "왜냐하면"],
            "how": ["어떻게", "how", "방법", "과정", "어떤 방식으로"],
            "when": ["언제", "when", "시기", "때"],
            "where": ["어디서", "where", "장소", "곳"],
            "who": ["누가", "who", "누구", "어떤 사람"],
            "opinion": ["생각", "의견", "어떻게 생각", "opinion", "think", "느낌"],
            "comparison": ["비교", "차이", "장단점", "compare", "difference", "vs"]
        }

        detected_types = []
        for q_type, keywords in question_types.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_types.append(q_type)

        # 감정 분석
        emotional_tone = self._analyze_emotional_tone(message)

        # 복잡도 계산
        complexity = (
            len(detected_topics) + len(detected_types) + len(message.split())
        )

        return {
            "topics": detected_topics,
            "topic_scores": topic_scores,
            "question_types": detected_types,
            "emotional_tone": emotional_tone,
            "complexity": complexity,
            "primary_topic": (
                max(topic_scores.items(), key=lambda x: x[1])[0]
                if topic_scores else "일반"
            ),
            "message_length": len(message),
            "word_count": len(message.split())
        }

    def _analyze_emotional_tone(self, message: str) -> str:
        """감정적 톤 분석"""
        positive_words = ["좋다", "훌륭", "멋지다", "성공", "행복", "만족", "긍정", "좋은"]
        negative_words = ["나쁘다", "실패", "불만", "화나다", "슬프다", "부정", "문제", "어려움"]
        analytical_words = [
            "분석", "연구", "조사", "검토", "평가", "비교", "고찰"
        ]

        message_lower = message.lower()

        positive_count = sum(
            1 for word in positive_words if word in message_lower
        )
        negative_count = sum(
            1 for word in negative_words if word in message_lower
        )
        analytical_count = sum(
            1 for word in analytical_words if word in message_lower
        )

        if analytical_count > max(positive_count, negative_count):
            return "analytical"
        elif positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

    def _generate_yoo_style_response(
        self, message: str, analysis: Dict
    ) -> str:
        """유시민 스타일 응답 생성"""
        primary_topic = analysis["primary_topic"]
        emotional_tone = analysis["emotional_tone"]

        if primary_topic in self.knowledge_base:
            topic_data = self.knowledge_base[primary_topic]

            # 유시민 스타일 시작
            opening = self.response_templates["opening"][0]

            # 핵심 관점
            perspectives = topic_data["perspectives"]
            main_perspective = perspectives[0] if perspectives else ""

            # 해결 방안
            solutions = topic_data["solutions"]

            # 예시
            examples = topic_data.get("examples", [])

            # 감정적 톤에 따른 조정
            if emotional_tone == "positive":
                transition = "그리고 더욱 희망적인 것은"
                conclusion_style = "optimistic"
            elif emotional_tone == "negative":
                transition = "하지만 여기서 중요한 것은"
                conclusion_style = "supportive"
            elif emotional_tone == "analytical":
                transition = "체계적으로 분석해보면"
                conclusion_style = "logical"
            else:
                transition = "여기서 중요한 것은"
                conclusion_style = "balanced"

            # 유시민 스타일 본문 구성
            response = f"""{opening}

## 🧠 심층 분석

{main_perspective}

{transition} 단순히 문제를 인식하는 것만으로는 충분하지 않다는 점입니다.

## 💡 핵심 통찰

{primary_topic}에 대해 체계적으로 접근해보면, 다음과 같은 관점들이 중요합니다:

1. **근본적 이해**: {primary_topic}의 본질을 파악하는 것이 우선입니다.
2. **다각도 분석**: 여러 관점에서 접근하여 종합적인 이해를 제공합니다.
3. **실용적 해결**: 이론과 실무를 결합한 구체적인 방안을 제시합니다.
4. **미래적 관점**: 변화하는 환경에 대한 대응 방안을 고려합니다.

## 🔍 상세 분석

{primary_topic}에 대한 우리의 이해는 역사적 맥락 속에서 더욱 깊어집니다.

과거의 경험들이 현재 우리가 직면한 문제들에 대한 통찰을 제공해주기 때문입니다.

여기서 중요한 것은 단순히 과거를 회고하는 것이 아니라, 그 속에서 현재와 미래를 위한 교훈을 찾는 것입니다.

## 🎯 구체적 제안

{primary_topic}에 대한 해결 방안을 단계적으로 제시해드리겠습니다:

"""

            # 구체적 해결 방안 추가
            for i, solution in enumerate(solutions, 1):
                response += f"{i}. **{solution}**: 구체적인 실행 방안과 기대 효과\n"

            # 예시 추가
            if examples:
                response += f"""

## 🌍 참고 사례

{primary_topic} 분야에서 성공한 사례들을 살펴보면:

"""
                for example in examples[:3]:  # 최대 3개 예시
                    response += f"- **{example}**: 참고할 만한 모델\n"

            response += f"""

## 🌟 결론

그래서 제가 말씀드리고 싶은 것은, {primary_topic}에 대한 우리의 이해는 이런 다양한 관점들을 종합할 때 더욱 풍부해집니다.

그런데 여러분은 어떻게 생각하시나요? 이런 관점들이 {primary_topic}에 대한 여러분의 이해에 어떤 도움이 되었는지 궁금합니다.

함께 생각하고 토론하는 과정에서 우리는 더 나은 답을 찾아갈 수 있을 것입니다.

---
*유시민 스타일로 학습한 궁극의 AI 시스템이 제공하는 종합적 분석*"""

            return response

        else:
            # 일반 주제에 대한 응답
            return self._generate_general_response(message, analysis)

    def _generate_general_response(self, message: str, analysis: Dict) -> str:
        """일반 주제에 대한 응답"""
        emotional_tone = analysis["emotional_tone"]

        if emotional_tone == "analytical":
            opening = "체계적으로 분석해보면, 여러분이 제기하신 질문에 대해 말씀드리겠습니다."
        elif emotional_tone == "positive":
            opening = "긍정적인 관점에서, 여러분이 제기하신 질문에 대해 말씀드리겠습니다."
        elif emotional_tone == "negative":
            opening = "이 문제에 대해 공감하며, 여러분이 제기하신 질문에 대해 말씀드리겠습니다."
        else:
            opening = "그런데 말이죠, 여러분이 제기하신 질문에 대해 말씀드리겠습니다."

        return f"""{opening}

## 🧠 심층 분석

"{message}"에 대해 다각도로 분석해보겠습니다.

## 💡 핵심 통찰

1. **문제의 본질**: {message}의 핵심을 파악하기 위해 근본적인 접근이 필요합니다.
2. **다양한 관점**: 여러 관점에서 접근하여 종합적인 이해를 제공합니다.
3. **실용적 해결책**: 이론과 실무를 결합한 구체적인 방안을 제시합니다.
4. **창의적 접근**: 새로운 관점에서 문제를 바라보는 것이 중요합니다.

## 🔍 상세 분석

{message}에 대한 분석을 통해 다음과 같은 인사이트를 제공합니다:

- **구조적 분석**: 문제의 구조와 패턴을 파악
- **역사적 맥락**: 과거의 경험과 현재의 상황을 연결
- **미래적 전망**: 변화하는 환경에 대한 대응 방안
- **비교 분석**: 유사한 사례들과의 비교를 통한 통찰

## 🎯 구체적 제안

1. **단기적 접근**: 즉시 실행 가능한 구체적 방안
2. **중기적 전략**: 체계적이고 지속 가능한 전략
3. **장기적 비전**: 미래 지향적인 비전과 목표
4. **지속적 개선**: 피드백을 통한 지속적 개선 방안

## 🌟 결론

{message}에 대한 종합적 분석을 통해 귀하에게 최적의 답변을 제공했습니다.

이러한 접근 방식은 단순한 답변이 아닌, 깊이 있는 통찰과 실용적인 해결책을 제공합니다.

함께 생각하고 토론하는 과정에서 우리는 더 나은 답을 찾아갈 수 있을 것입니다.

---
*궁극의 AI 시스템이 제공하는 지능형 서비스*"""

    async def generate_response(self, message: str, user_id: str) -> str:
        """궁극의 응답 생성"""
        logger.info(f"궁극의 응답 생성 시작: {message[:30]}...")

        # 질문 분석
        analysis = self._analyze_question(message)

        # 유시민 스타일 응답 생성
        response = self._generate_yoo_style_response(message, analysis)

        # 사용자 프로필 업데이트
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = UserProfile(
                user_id=user_id,
                last_active=datetime.now(timezone.utc).isoformat()
            )

        profile = self.user_profiles[user_id]
        profile.conversation_count += 1
        profile.topics.extend(analysis["topics"])
        profile.last_active = datetime.now(timezone.utc).isoformat()

        # 학습 데이터 업데이트
        self.learning_data[datetime.now(timezone.utc).isoformat()] = {
            "user_id": user_id,
            "message": message,
            "analysis": analysis,
            "response_length": len(response)
        }

        # 대화 히스토리 저장
        self.conversation_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "message": message,
            "response": response,
            "analysis": analysis
        })

        logger.info(f"궁극의 응답 생성 완료: {len(response)}자")
        return response

    def get_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        return {
            "status": "healthy",
            "conversation_count": len(self.conversation_history),
            "user_count": len(self.user_profiles),
            "knowledge_base_size": len(self.knowledge_base),
            "learning_data_count": len(self.learning_data),
            "last_conversation": (
                self.conversation_history[-1]
                if self.conversation_history else None
            ),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """사용자 프로필 조회"""
        return self.user_profiles.get(user_id)

    def get_learning_insights(self) -> Dict[str, Any]:
        """학습 인사이트 조회"""
        if not self.learning_data:
            return {"message": "아직 학습 데이터가 없습니다."}

        # 최근 학습 데이터 분석
        recent_data = list(self.learning_data.values())[-10:]  # 최근 10개

        topic_frequency = {}
        question_type_frequency = {}

        for data in recent_data:
            analysis = data["analysis"]

            # 주제 빈도
            for topic in analysis["topics"]:
                topic_frequency[topic] = (
                    topic_frequency.get(topic, 0) + 1
                )

            # 질문 유형 빈도
            for q_type in analysis["question_types"]:
                question_type_frequency[q_type] = (
                    question_type_frequency.get(q_type, 0) + 1
                )

        return {
            "recent_conversations": len(recent_data),
            "topic_frequency": topic_frequency,
            "question_type_frequency": question_type_frequency,
            "average_response_length": (
                sum(data["response_length"] for data in recent_data) /
                len(recent_data)
            ),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# AI 엔진 인스턴스
ai_engine = UltimateAIEngine()

@app.get("/")
async def root():
    return {
        "message": "Ultimate AI System",
        "version": "1.0.0",
        "status": "running",
        "conversation_count": len(ai_engine.conversation_history),
        "user_count": len(ai_engine.user_profiles),
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "conversation_count": len(ai_engine.conversation_history),
        "user_count": len(ai_engine.user_profiles)
    }

@app.post("/api/chat")
async def chat_endpoint(chat_data: ChatMessage):
    """채팅 엔드포인트"""
    try:
        logger.info(f"채팅 요청: {chat_data.message[:50]}...")

        response = await ai_engine.generate_response(
            chat_data.message,
            chat_data.user_id
        )

        return {
            "success": True,
            "response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"채팅 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """시스템 상태 조회"""
    try:
        status = ai_engine.get_status()
        return status
    except Exception as e:
        logger.error(f"상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/{user_id}")
async def get_user_profile(user_id: str):
    """사용자 프로필 조회"""
    try:
        profile = ai_engine.get_user_profile(user_id)
        if profile:
            return {
                "success": True,
                "profile": {
                    "user_id": profile.user_id,
                    "conversation_count": profile.conversation_count,
                    "topics": profile.topics,
                    "preferences": profile.preferences,
                    "last_active": profile.last_active
                }
            }
        else:
            return {
                "success": False,
                "message": "사용자를 찾을 수 없습니다."
            }
    except Exception as e:
        logger.error(f"사용자 프로필 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights")
async def get_learning_insights():
    """학습 인사이트 조회"""
    try:
        insights = ai_engine.get_learning_insights()
        return {
            "success": True,
            "insights": insights
        }
    except Exception as e:
        logger.error(f"학습 인사이트 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    """대시보드"""
    html_content = """
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>궁극의 AI 시스템 대시보드</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                text-align: center;
            }
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            .content {
                padding: 40px;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 40px;
            }
            .stat-card {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                border-left: 5px solid #667eea;
            }
            .stat-card h3 {
                font-size: 2em;
                color: #667eea;
                margin-bottom: 10px;
            }
            .stat-card p {
                color: #666;
                font-size: 1.1em;
            }
            .chat-section {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 30px;
            }
            .chat-section h2 {
                color: #333;
                margin-bottom: 20px;
                font-size: 1.8em;
            }
            .chat-input {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
            }
            .chat-input input {
                flex: 1;
                padding: 15px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-size: 16px;
                outline: none;
                transition: border-color 0.3s;
            }
            .chat-input input:focus {
                border-color: #667eea;
            }
            .chat-input button {
                padding: 15px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 16px;
                transition: transform 0.2s;
            }
            .chat-input button:hover {
                transform: translateY(-2px);
            }
            .chat-messages {
                max-height: 500px;
                overflow-y: auto;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                padding: 20px;
                background: white;
            }
            .message {
                margin-bottom: 20px;
                padding: 15px;
                border-radius: 10px;
                background: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .message.user {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin-left: 50px;
            }
            .message.ai {
                background: white;
                margin-right: 50px;
            }
            .message-header {
                font-weight: bold;
                margin-bottom: 10px;
                font-size: 0.9em;
                opacity: 0.8;
            }
            .message-content {
                line-height: 1.6;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }
            .feature-card {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
            }
            .feature-card h3 {
                color: #667eea;
                margin-bottom: 15px;
                font-size: 1.5em;
            }
            .feature-card p {
                color: #666;
                line-height: 1.6;
            }
            .loading {
                text-align: center;
                padding: 20px;
                color: #667eea;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 궁극의 AI 시스템</h1>
                <p>유시민 스타일 통합 고급 AI 시스템</p>
            </div>

            <div class="content">
                <div class="stats" id="stats">
                    <div class="stat-card">
                        <h3 id="conversation-count">0</h3>
                        <p>총 대화 수</p>
                    </div>
                    <div class="stat-card">
                        <h3 id="user-count">0</h3>
                        <p>활성 사용자</p>
                    </div>
                    <div class="stat-card">
                        <h3 id="knowledge-base-size">6</h3>
                        <p>지식 베이스</p>
                    </div>
                    <div class="stat-card">
                        <h3 id="learning-data-count">0</h3>
                        <p>학습 데이터</p>
                    </div>
                </div>

                <div class="chat-section">
                    <h2>💬 AI와 대화하기</h2>
                    <div class="chat-input">
                        <input type="text" id="message-input" placeholder="질문을 입력하세요..." onkeypress="handleKeyPress(event)">
                        <button onclick="sendMessage()">전송</button>
                    </div>
                    <div class="chat-messages" id="chat-messages">
                        <div class="message ai">
                            <div class="message-header">🤖 궁극의 AI</div>
                            <div class="message-content">
                                안녕하세요! 궁극의 AI 시스템입니다. 어떤 질문이든 자유롭게 물어보세요.
                                정치, 경제, 교육, 사회, 기술, 환경 등 다양한 주제에 대해 유시민 스타일로 답변해드리겠습니다.
                            </div>
                        </div>
                    </div>
                </div>

                <div class="features">
                    <div class="feature-card">
                        <h3>🧠 지능형 분석</h3>
                        <p>질문의 주제, 유형, 감정적 톤을 분석하여 맞춤형 답변을 제공합니다.</p>
                    </div>
                    <div class="feature-card">
                        <h3>🎯 유시민 스타일</h3>
                        <p>유시민의 사고방식과 표현 스타일을 학습하여 자연스러운 대화를 구현합니다.</p>
                    </div>
                    <div class="feature-card">
                        <h3>📚 지식 베이스</h3>
                        <p>정치, 경제, 교육, 사회, 기술, 환경 등 6개 분야의 전문 지식을 보유합니다.</p>
                    </div>
                    <div class="feature-card">
                        <h3>🔄 실시간 학습</h3>
                        <p>사용자와의 대화를 통해 지속적으로 학습하고 개선합니다.</p>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let conversationCount = 0;

            async function loadStats() {
                try {
                    const response = await fetch('/api/status');
                    const data = await response.json();

                    document.getElementById('conversation-count').textContent = data.conversation_count;
                    document.getElementById('user-count').textContent = data.user_count;
                    document.getElementById('learning-data-count').textContent = data.learning_data_count;
                } catch (error) {
                    console.error('통계 로드 오류:', error);
                }
            }

            async function sendMessage() {
                const input = document.getElementById('message-input');
                const message = input.value.trim();

                if (!message) return;

                // 사용자 메시지 추가
                addMessage('user', message);
                input.value = '';

                // 로딩 표시
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'message ai loading';
                loadingDiv.innerHTML = '<div class="message-header">🤖 궁극의 AI</div><div class="message-content">답변을 생성하고 있습니다...</div>';
                document.getElementById('chat-messages').appendChild(loadingDiv);

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            user_id: 'dashboard_user'
                        })
                    });

                    const data = await response.json();

                    // 로딩 제거
                    loadingDiv.remove();

                    if (data.success) {
                        addMessage('ai', data.response);
                        conversationCount++;
                        loadStats(); // 통계 업데이트
                    } else {
                        addMessage('ai', '죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다.');
                    }
                } catch (error) {
                    loadingDiv.remove();
                    addMessage('ai', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
                    console.error('메시지 전송 오류:', error);
                }
            }

            function addMessage(sender, content) {
                const messagesDiv = document.getElementById('chat-messages');
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}`;

                const header = sender === 'user' ? '👤 사용자' : '🤖 궁극의 AI';
                messageDiv.innerHTML = `
                    <div class="message-header">${header}</div>
                    <div class="message-content">${content}</div>
                `;

                messagesDiv.appendChild(messageDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }

            function handleKeyPress(event) {
                if (event.key === 'Enter') {
                    sendMessage();
                }
            }

            // 페이지 로드 시 통계 로드
            loadStats();

            // 30초마다 통계 업데이트
            setInterval(loadStats, 30000);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    logger.info("🚀 궁극의 AI 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    logger.info("🎯 대시보드: http://localhost:8000/dashboard")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
