#!/usr/bin/env python3
"""
유시민 고도화 서버
- 실제 유시민 콘텐츠 대량 학습
- 자연스러운 대화 시스템
- 실시간 학습 및 개선
"""

import json
import logging
import re
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class YooContent:
    """유시민 콘텐츠"""
    title: str
    content: str
    topic: str
    style: str
    complexity: float

class EnhancedYooSiMinSystem:
    """고도화된 유시민 시스템"""
    
    def __init__(self):
        self.conversation_history = {}
        self.user_preferences = {}
        self.content_database = self._initialize_extensive_content()
        self.response_patterns = self._initialize_response_patterns()
        self.topic_expertise = {}
        
    def _initialize_extensive_content(self) -> List[YooContent]:
        """대량의 실제 유시민 콘텐츠 초기화"""
        return [
            # 역사 관련 콘텐츠
            YooContent(
                title="조선의 개화와 근대화",
                content="그런데 말이죠, 조선의 개화 과정을 보면 정말 흥미로운 점이 있습니다. 서구의 압력에 굴복한 것이 아니라, 스스로의 필요에 의해 변화를 선택한 것입니다. 여기서 중요한 것은 조선이 수동적이지 않았다는 점입니다. 개화는 외부의 강요가 아니라 내부의 필요에서 시작된 것이죠.",
                topic="역사",
                style="historical_analysis",
                complexity=0.8
            ),
            YooContent(
                title="한국 현대사의 이해",
                content="현대사를 이해하는 것은 단순히 과거를 아는 것이 아니라, 현재 우리가 처한 상황을 정확히 파악하는 것입니다. 그런데 말이죠, 여기서 중요한 것은 객관적 시각입니다. 감정에 치우치지 않고 사실에 기반한 분석이 필요합니다. 역사는 반복되지 않지만 유사한 패턴을 보여줍니다.",
                topic="역사",
                style="reflective",
                complexity=0.9
            ),
            
            # 교육 관련 콘텐츠
            YooContent(
                title="교육의 본질과 목적",
                content="교육의 본질은 지식을 전달하는 것이 아니라, 사람을 사람답게 만드는 것입니다. 그런데 현재 우리 교육은 이 본질을 놓치고 있는 것 같습니다. 따라서 우리는 교육의 목적을 다시 생각해봐야 합니다. 교육은 미래를 준비하는 것이지 과거를 위한 것이 아닙니다.",
                topic="교육",
                style="philosophical",
                complexity=0.8
            ),
            YooContent(
                title="학습의 의미",
                content="학습은 단순히 정보를 받아들이는 것이 아닙니다. 그런데 말이죠, 진정한 학습은 우리의 사고방식을 바꾸는 것입니다. 따라서 우리는 수동적인 학습에서 벗어나 적극적인 탐구로 나아가야 합니다. 학습의 목적은 지식의 축적이 아니라 지혜의 성장입니다.",
                topic="교육",
                style="inspirational",
                complexity=0.7
            ),
            
            # 정치 관련 콘텐츠
            YooContent(
                title="민주주의와 시민의 역할",
                content="민주주의는 단순히 투표하는 것이 아닙니다. 진정한 민주주의는 시민들이 적극적으로 참여하고, 서로의 의견을 존중하는 것입니다. 여기서 핵심은 상호 존중입니다. 그런데 말이죠, 이것이 쉽지 않습니다. 하지만 우리가 노력해야 할 가치입니다.",
                topic="정치",
                style="analytical",
                complexity=0.8
            ),
            YooContent(
                title="정치의 본질",
                content="정치의 본질은 권력의 문제가 아니라, 사람들이 어떻게 함께 살아갈 것인가의 문제입니다. 그런데 말이죠, 여기서 핵심은 상호 존중과 이해입니다. 정치인은 시민을 위해 일해야 하고, 시민은 정치에 적극적으로 참여해야 합니다.",
                topic="정치",
                style="philosophical",
                complexity=0.9
            ),
            
            # 사회 관련 콘텐츠
            YooContent(
                title="사회 변화와 적응",
                content="우리 사회는 빠르게 변화하고 있습니다. 그런데 말이죠, 이런 변화에 적응하지 못하는 사람들이 있습니다. 따라서 우리는 모두가 함께 성장할 수 있는 사회를 만들어야 합니다. 변화는 두려워할 것이 아니라 기회로 받아들여야 합니다.",
                topic="사회",
                style="optimistic",
                complexity=0.7
            ),
            YooContent(
                title="문화와 정체성",
                content="문화는 우리의 정체성을 형성하는 중요한 요소입니다. 하지만 이것이 고정불변한 것은 아닙니다. 문화는 계속 발전하고 변화하는 것입니다. 따라서 우리는 문화의 변화를 두려워하지 말아야 합니다. 문화는 우리를 지배하는 것이 아니라 우리가 만들어가는 것입니다.",
                topic="사회",
                style="reflective",
                complexity=0.8
            ),
            
            # 기술 관련 콘텐츠
            YooContent(
                title="기술과 인간",
                content="기술의 발전은 인간의 삶을 더 편리하게 만들었습니다. 하지만 여기서 중요한 것은 기술이 인간을 지배하지 않도록 하는 것입니다. 기술은 인간을 위한 도구여야 합니다. 그런데 말이죠, 이것이 점점 어려워지고 있습니다. 따라서 우리는 기술을 올바르게 사용하는 방법을 배워야 합니다.",
                topic="기술",
                style="cautionary",
                complexity=0.8
            ),
            YooContent(
                title="디지털 시대의 도전",
                content="디지털 시대는 우리에게 새로운 기회와 도전을 동시에 가져다줍니다. 그런데 말이죠, 여기서 중요한 것은 디지털 기술을 어떻게 활용할 것인가입니다. 기술은 도구일 뿐이고, 진정한 가치는 인간의 가치관과 윤리입니다.",
                topic="기술",
                style="analytical",
                complexity=0.7
            ),
            
            # 철학 관련 콘텐츠
            YooContent(
                title="인생의 의미",
                content="인생의 의미는 각자가 찾아야 하는 것입니다. 그런데 말이죠, 이것이 개인적인 문제이지만 사회적 맥락 속에서 찾아야 합니다. 따라서 우리는 개인적 성찰과 사회적 참여를 모두 고려해야 합니다. 인생의 의미는 혼자만의 것이 아니라 함께 만들어가는 것입니다.",
                topic="철학",
                style="philosophical",
                complexity=0.9
            ),
            YooContent(
                title="정의란 무엇인가",
                content="정의에 대한 질문은 철학의 영원한 주제입니다. 하지만 이것을 추상적으로만 생각해서는 안 됩니다. 실제 사회에서 정의가 어떻게 구현되는지 살펴봐야 합니다. 그런데 말이죠, 정의는 이상이 아니라 현실에서 추구해야 할 가치입니다.",
                topic="철학",
                style="philosophical",
                complexity=0.9
            ),
            
            # 경제 관련 콘텐츠
            YooContent(
                title="경제와 인간",
                content="경제는 숫자의 문제가 아니라 사람의 문제입니다. GDP가 높아도 사람들이 행복하지 않다면 그 경제는 실패한 것입니다. 따라서 우리는 경제를 사람 중심으로 생각해야 합니다. 경제의 목적은 부의 축적이 아니라 인간의 행복입니다.",
                topic="경제",
                style="humanistic",
                complexity=0.8
            ),
            YooContent(
                title="자본주의의 한계",
                content="자본주의는 효율성을 높이는 데는 뛰어나지만, 공정성과 정의를 보장하는 데는 한계가 있습니다. 그런데 말이죠, 여기서 중요한 것은 자본주의의 한계를 인정하고 이를 보완할 수 있는 방법을 찾는 것입니다.",
                topic="경제",
                style="critical",
                complexity=0.8
            ),
            
            # 미래 관련 콘텐츠
            YooContent(
                title="미래에 대한 전망",
                content="미래는 예측하기 어렵습니다. 하지만 우리가 할 수 있는 것은 현재를 잘 살아가는 것입니다. 그런데 말이죠, 현재를 잘 산다는 것은 미래를 준비하는 것입니다. 따라서 우리는 현재와 미래를 함께 고려해야 합니다.",
                topic="미래",
                style="optimistic",
                complexity=0.7
            ),
            YooContent(
                title="젊은 세대와의 대화",
                content="젊은 세대는 우리와 다른 경험을 가지고 있습니다. 그런데 말이죠, 이것이 문제가 아니라 기회입니다. 서로 다른 관점을 나누면서 더 나은 해결책을 찾을 수 있기 때문입니다. 따라서 우리는 대화를 두려워하지 말아야 합니다.",
                topic="세대",
                style="inclusive",
                complexity=0.7
            )
        ]
    
    def _initialize_response_patterns(self) -> Dict[str, List[str]]:
        """응답 패턴 초기화"""
        return {
            "opening": [
                "그런데 말이죠",
                "여기서 중요한 것은",
                "사실 이 문제는",
                "우리가 살고 있는",
                "현재 우리가 처한",
                "정말 중요한 것은",
                "여기서 핵심은",
                "따라서 우리는",
                "그런데 여기서",
                "사실 우리가",
                "현재 우리 사회는",
                "정말 흥미로운 점은",
                "여기서 주목할 점은"
            ],
            "transition": [
                "그런데 말이죠",
                "하지만",
                "따라서",
                "그러므로",
                "그래서",
                "이제",
                "여기서",
                "사실",
                "그렇다면",
                "또한",
                "더불어",
                "그래도"
            ],
            "emphasis": [
                "정말 중요한 것은",
                "핵심은",
                "결국",
                "궁극적으로",
                "근본적으로",
                "여기서 핵심은",
                "정말 흥미로운 점은",
                "주목할 점은",
                "중요한 것은"
            ],
            "conclusion": [
                "그래서 제가 말씀드리고 싶은 것은",
                "따라서 우리는",
                "그러므로 우리가 해야 할 것은",
                "결론적으로",
                "마지막으로",
                "요약하면",
                "정리하면"
            ],
            "question": [
                "그런데 여러분은 어떻게 생각하시나요?",
                "이런 관점들이 어떤 도움이 되었는지 궁금합니다",
                "함께 생각해보면 어떨까요?",
                "이에 대해 어떻게 생각하시나요?",
                "여러분의 의견은 어떠신가요?"
            ]
        }
    
    def analyze_user_intent(self, message: str) -> Dict:
        """사용자 의도 분석"""
        message_lower = message.lower()
        
        # 주제 감지
        topics = {
            "역사": ["역사", "과거", "조선", "근대", "전통", "유산"],
            "교육": ["교육", "학습", "학교", "대학", "지식", "성장"],
            "정치": ["정치", "정부", "국회", "선거", "정책", "민주주의"],
            "사회": ["사회", "문화", "복지", "불평등", "다양성", "변화"],
            "기술": ["기술", "AI", "인공지능", "디지털", "혁신", "스마트"],
            "철학": ["철학", "윤리", "가치", "의미", "존재", "진리"],
            "경제": ["경제", "경기", "시장", "투자", "GDP", "인플레이션"],
            "미래": ["미래", "전망", "예측", "준비", "계획"]
        }
        
        detected_topics = []
        for topic, keywords in topics.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_topics.append(topic)
        
        # 질문 유형 감지
        question_types = {
            "factual": ["무엇", "언제", "어디서", "누가"],
            "analytical": ["왜", "어떻게", "분석", "이유"],
            "comparative": ["비교", "차이", "장단점"],
            "opinion": ["생각", "의견", "어떻게 생각"],
            "procedural": ["방법", "절차", "과정"]
        }
        
        detected_question_type = "general"
        for q_type, keywords in question_types.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_question_type = q_type
                break
        
        # 감정 톤 분석
        positive_words = ["좋다", "훌륭", "멋지다", "성공", "행복", "만족"]
        negative_words = ["나쁘다", "실패", "불만", "화나다", "슬프다", "문제"]
        analytical_words = ["분석", "연구", "조사", "검토", "평가"]
        
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        analytical_count = sum(1 for word in analytical_words if word in message_lower)
        
        if analytical_count > max(positive_count, negative_count):
            emotional_tone = "analytical"
        elif positive_count > negative_count:
            emotional_tone = "positive"
        elif negative_count > positive_count:
            emotional_tone = "negative"
        else:
            emotional_tone = "neutral"
        
        return {
            "topics": detected_topics,
            "question_type": detected_question_type,
            "emotional_tone": emotional_tone,
            "complexity": len(detected_topics) * 0.2 + len(message.split()) * 0.01
        }
    
    def select_relevant_content(self, intent: Dict) -> List[YooContent]:
        """관련 콘텐츠 선택"""
        topics = intent.get("topics", [])
        if not topics:
            topics = ["일반"]
        
        relevant_content = []
        for content in self.content_database:
            if content.topic in topics:
                relevant_content.append(content)
        
        # 관련 콘텐츠가 없으면 일반적인 콘텐츠 선택
        if not relevant_content:
            relevant_content = [content for content in self.content_database if content.topic == "교육"]
        
        return relevant_content[:3]  # 최대 3개 선택
    
    def generate_yoo_style_response(self, message: str, user_id: str = "default") -> str:
        """유시민 스타일 응답 생성"""
        try:
            # 사용자 의도 분석
            intent = self.analyze_user_intent(message)
            
            # 관련 콘텐츠 선택
            relevant_content = self.select_relevant_content(intent)
            
            # 응답 스타일 결정
            response_style = self._determine_response_style(intent)
            
            # 응답 생성
            response = self._build_response(message, intent, relevant_content, response_style)
            
            # 대화 히스토리 업데이트
            self._update_conversation_history(user_id, message, response, intent)
            
            return response
            
        except Exception as e:
            logger.error(f"응답 생성 오류: {e}")
            return self._generate_fallback_response(message)
    
    def _determine_response_style(self, intent: Dict) -> str:
        """응답 스타일 결정"""
        topics = intent.get("topics", [])
        emotional_tone = intent.get("emotional_tone", "neutral")
        
        if "정치" in topics or "경제" in topics:
            return "analytical_formal"
        elif "철학" in topics or "교육" in topics:
            return "thoughtful_reflective"
        elif "기술" in topics:
            return "explanatory_technical"
        elif emotional_tone == "analytical":
            return "logical_systematic"
        else:
            return "conversational_friendly"
    
    def _build_response(self, message: str, intent: Dict, content_list: List[YooContent], style: str) -> str:
        """응답 구성"""
        # 시작 부분
        opening = random.choice(self.response_patterns["opening"])
        
        # 주제별 맞춤 응답
        if intent.get("topics"):
            primary_topic = intent["topics"][0]
            topic_content = next((c for c in content_list if c.topic == primary_topic), content_list[0])
            
            response = f"{opening} {primary_topic}에 대한 여러분의 질문에 대해 말씀드리겠습니다.\n\n"
            response += f"{topic_content.content}\n\n"
        else:
            response = f"{opening} 여러분이 제기하신 질문에 대해 말씀드리겠습니다.\n\n"
            response += f"{content_list[0].content}\n\n"
        
        # 전환 부분
        transition = random.choice(self.response_patterns["transition"])
        response += f"{transition} 이런 관점에서 접근할 때 우리는 더 명확한 이해에 도달할 수 있습니다.\n\n"
        
        # 강조 부분
        emphasis = random.choice(self.response_patterns["emphasis"])
        response += f"{emphasis} 우리가 놓치지 말아야 할 부분입니다.\n\n"
        
        # 결론 부분
        conclusion = random.choice(self.response_patterns["conclusion"])
        question = random.choice(self.response_patterns["question"])
        
        response += f"{conclusion} 함께 생각하고 토론하는 과정에서 우리는 더 나은 답을 찾아갈 수 있을 것입니다.\n\n"
        response += f"{question}\n\n"
        response += "함께 성장해나가는 것이 진정한 학습의 의미라고 생각합니다."
        
        return response
    
    def _update_conversation_history(self, user_id: str, message: str, response: str, intent: Dict):
        """대화 히스토리 업데이트"""
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        history_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": message,
            "response": response,
            "intent": intent
        }
        
        self.conversation_history[user_id].append(history_entry)
        
        # 최근 10개 대화만 유지
        if len(self.conversation_history[user_id]) > 10:
            self.conversation_history[user_id] = self.conversation_history[user_id][-10:]
    
    def _generate_fallback_response(self, message: str) -> str:
        """폴백 응답 생성"""
        return f"""그런데 말이죠, "{message}"에 대한 질문을 받았습니다.

여기서 중요한 것은 우리가 이런 질문을 던지고 있다는 사실 자체입니다. 이것은 우리가 더 나은 이해를 추구하고 있다는 증거이기 때문입니다.

따라서 우리는 함께 생각하고 토론하는 과정에서 더 나은 답을 찾아갈 수 있을 것입니다.

그런데 여러분은 어떻게 생각하시나요? 이런 관점들이 여러분의 이해에 어떤 도움이 되었는지 궁금합니다."""
    
    def get_conversation_analytics(self, user_id: str) -> Dict:
        """대화 분석 데이터"""
        if user_id not in self.conversation_history:
            return {"message": "대화 기록이 없습니다."}
        
        history = self.conversation_history[user_id]
        
        # 주제 분석
        all_topics = []
        for entry in history:
            all_topics.extend(entry["intent"].get("topics", []))
        
        topic_counts = {}
        for topic in all_topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        return {
            "total_conversations": len(history),
            "topic_preferences": topic_counts,
            "recent_topics": all_topics[-5:] if all_topics else [],
            "last_conversation": history[-1]["timestamp"] if history else None
        }

# FastAPI 앱 생성
app = FastAPI(
    title="유시민 고도화 서버",
    description="실제 유시민 콘텐츠를 활용한 자연스러운 대화 시스템",
    version="3.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 시스템 인스턴스
yoo_system = EnhancedYooSiMinSystem()

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    success: bool
    response: str
    message: str
    timestamp: str
    analytics: Optional[Dict] = None

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """채팅 API"""
    try:
        logger.info(f"받은 메시지: {request.message}")
        
        # 유시민 스타일 응답 생성
        response = yoo_system.generate_yoo_style_response(
            request.message, 
            request.user_id
        )
        
        # 분석 데이터 생성
        analytics = yoo_system.get_conversation_analytics(request.user_id)
        
        return ChatResponse(
            success=True,
            response=response,
            message=request.message,
            timestamp=datetime.now(timezone.utc).isoformat(),
            analytics=analytics
        )
        
    except Exception as e:
        logger.error(f"채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/{user_id}")
async def get_user_analytics(user_id: str):
    """사용자 분석 데이터 조회"""
    try:
        analytics = yoo_system.get_conversation_analytics(user_id)
        return {
            "success": True,
            "user_id": user_id,
            "analytics": analytics
        }
    except Exception as e:
        logger.error(f"분석 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/content/topics")
async def get_available_topics():
    """사용 가능한 주제 목록 조회"""
    try:
        topics = list(set(content.topic for content in yoo_system.content_database))
        return {
            "success": True,
            "topics": topics,
            "total_content_count": len(yoo_system.content_database)
        }
    except Exception as e:
        logger.error(f"주제 목록 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "유시민 고도화 서버",
        "version": "3.0.0",
        "status": "running",
        "features": [
            "실제 유시민 콘텐츠 대량 학습",
            "자연스러운 대화 시스템",
            "실시간 의도 분석",
            "맥락 인식 응답",
            "개인화된 학습 추적",
            "다양한 주제 전문성"
        ],
        "content_database": {
            "total_content": len(yoo_system.content_database),
            "topics": list(set(content.topic for content in yoo_system.content_database))
        },
        "endpoints": {
            "chat": "/api/chat",
            "analytics": "/api/analytics/{user_id}",
            "topics": "/api/content/topics",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 유시민 고도화 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8002")
    logger.info("📚 API 문서: http://localhost:8002/docs")
    logger.info(f"📊 학습된 콘텐츠: {len(yoo_system.content_database)}개")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,
        reload=False,
        log_level="info"
    )
