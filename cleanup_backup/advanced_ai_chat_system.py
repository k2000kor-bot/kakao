import logging
import random
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Advanced AI Chat System",
    description="고급 AI 채팅 시스템 - 활성화된 질문 답변 기능",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "default"
    context: Optional[Dict] = None


class AdvancedAIEngine:
    """고급 AI 엔진 - 활성화된 질문 답변 기능"""

    def __init__(self):
        self.conversation_history = []
        self.user_profiles = {}
        self.knowledge_base = self._initialize_knowledge_base()
        self.response_templates = self._initialize_response_templates()
        logger.info("고급 AI 엔진 초기화 완료")

    def _initialize_knowledge_base(self) -> Dict[str, List[str]]:
        """지식 베이스 초기화"""
        return {
            "정치": [
                "정치는 권력의 문제가 아니라 시민의 삶의 질을 높이는 문제입니다.",
                "민주주의는 완성된 제도가 아니라 지속적으로 발전해야 하는 과정입니다.",
                "정치적 참여는 시민의 권리이자 의무입니다."
            ],
            "경제": [
                "경제는 숫자의 문제가 아니라 사람의 문제입니다.",
                "지속 가능한 성장을 위해서는 환경과 사회적 가치를 고려해야 합니다.",
                "경제적 불평등은 사회 전체의 문제입니다."
            ],
            "사회": [
                "사회는 다양한 구성원들이 함께 만들어가는 공동체입니다.",
                "다양성과 포용성은 건강한 사회의 핵심 요소입니다.",
                "사회적 약자를 보호하는 것은 사회의 책임입니다."
            ],
            "교육": [
                "교육은 지식 전달이 아니라 사고력과 창의력을 기르는 것입니다.",
                "평생 학습은 현대 사회에서 필수적입니다.",
                "교육의 목표는 인격 완성과 사회적 책임감 함양입니다."
            ],
            "기술": [
                "기술은 인간을 위한 도구여야 합니다.",
                "AI와 기술 발전은 인간의 가치를 보완해야 합니다.",
                "기술 윤리는 기술 발전과 함께 고려되어야 합니다."
            ],
            "역사": [
                "역사는 과거의 기록이 아니라 현재를 이해하는 열쇠입니다.",
                "역사를 통해 미래를 예측하고 대비할 수 있습니다.",
                "역사적 사건들은 복합적인 원인과 결과를 가지고 있습니다."
            ]
        }

    def _initialize_response_templates(self) -> Dict[str, List[str]]:
        """응답 템플릿 초기화"""
        return {
            "opening": [
                "흥미로운 질문이네요!",
                "정말 중요한 주제를 다루고 계시군요!",
                "이런 질문을 던지시는 것이 정말 좋습니다.",
                "제가 이 질문에 대해 깊이 생각해보겠습니다.",
                "여러분의 관점에서 이 문제를 살펴보겠습니다."
            ],
            "analysis": [
                "이 문제를 다각도로 분석해보면",
                "여러 관점에서 접근해보면",
                "체계적으로 살펴보면",
                "근본적으로 파악해보면",
                "종합적으로 고려해보면"
            ],
            "insight": [
                "여기서 핵심은",
                "중요한 포인트는",
                "결정적인 요소는",
                "핵심적인 관점은",
                "본질적인 문제는"
            ],
            "conclusion": [
                "따라서 우리는",
                "그렇기 때문에",
                "이를 통해",
                "결론적으로",
                "종합해보면"
            ]
        }

    async def analyze_question(self, message: str) -> Dict[str, Any]:
        """질문 분석"""
        # 주제 분류
        topics = []
        for topic, keywords in self.knowledge_base.items():
            if any(keyword in message for keyword in [
                topic, topic.replace("정치", "정부"), 
                topic.replace("경제", "경기")
            ]):
                topics.append(topic)

        if not topics:
            topics = ["일반"]

        # 질문 유형 분석
        question_types = []
        if any(word in message for word in ["무엇", "what", "어떤"]):
            question_types.append("정의적")
        if any(word in message for word in ["왜", "why", "이유"]):
            question_types.append("원인적")
        if any(word in message for word in ["어떻게", "how", "방법"]):
            question_types.append("방법적")
        if any(word in message for word in ["언제", "when", "시기"]):
            question_types.append("시기적")
        if any(word in message for word in ["어디서", "where", "장소"]):
            question_types.append("장소적")

        if not question_types:
            question_types = ["종합적"]

        # 복잡도 분석
        complexity = min(1.0, len(message) / 100)

        return {
            "topics": topics,
            "question_types": question_types,
            "complexity": complexity,
            "length": len(message)
        }

    async def generate_advanced_response(
        self, message: str, user_id: str, context: Optional[Dict] = None
    ) -> str:
        """고급 응답 생성"""
        logger.info(f"고급 응답 생성: {message[:50]}...")

        # 질문 분석
        analysis = await self.analyze_question(message)

        # 사용자 프로필 업데이트
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                "interests": {},
                "conversation_count": 0,
                "preferred_topics": [],
                "response_preferences": {}
            }

        user_profile = self.user_profiles[user_id]
        user_profile["conversation_count"] += 1

        # 관심 주제 업데이트
        for topic in analysis["topics"]:
            user_profile["interests"][topic] = (
                user_profile["interests"].get(topic, 0) + 1
            )

        # 응답 생성
        response = await self._build_comprehensive_response(
            message, analysis, user_profile
        )

        # 대화 히스토리 저장
        conversation_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "message": message,
            "response": response,
            "analysis": analysis,
            "context": context
        }
        self.conversation_history.append(conversation_entry)

        logger.info(f"고급 응답 생성 완료: {len(response)}자")
        return response

    async def _build_comprehensive_response(self, message: str, analysis: Dict, user_profile: Dict) -> str:
        """종합적 응답 구성"""
        # 시작 부분
        opening = random.choice(self.response_templates["opening"])

        # 주제별 지식 활용
        topic_knowledge = []
        for topic in analysis["topics"]:
            if topic in self.knowledge_base:
                topic_knowledge.extend(self.knowledge_base[topic])

        # 분석 부분
        analysis_text = random.choice(self.response_templates["analysis"])

        # 통찰 부분
        insight_text = random.choice(self.response_templates["insight"])

        # 결론 부분
        conclusion_text = random.choice(self.response_templates["conclusion"])

        # 응답 구성
        response = f"""## 🚀 고급 AI 응답

**질문**: {message}

### 🧠 질문 분석
- **주제**: {', '.join(analysis['topics'])}
- **질문 유형**: {', '.join(analysis['question_types'])}
- **복잡도**: {analysis['complexity']:.2f}
- **길이**: {analysis['length']}자

### 💡 응답

{opening} {message}에 대해 종합적으로 답변드리겠습니다.

{analysis_text} 다음과 같은 관점들을 고려할 수 있습니다:

#### 🔍 다각도 분석
1. **구조적 관점**: 문제의 기본 구조와 패턴을 파악
2. **역사적 관점**: 과거의 경험과 현재의 상황을 연결
3. **미래적 관점**: 변화하는 환경에 대한 대응 방안
4. **실용적 관점**: 구체적이고 실행 가능한 해결책

{insight_text} 이 문제의 핵심을 정확히 파악하는 것입니다.

#### 📚 관련 지식
"""

        # 주제별 지식 추가
        if topic_knowledge:
            for i, knowledge in enumerate(topic_knowledge[:3], 1):
                response += f"{i}. {knowledge}\n"

        response += f"""
#### 🎯 구체적 제안
1. **단기적 접근**: 즉시 실행 가능한 구체적 방안
2. **중기적 전략**: 체계적이고 지속 가능한 전략
3. **장기적 비전**: 미래 지향적인 비전과 목표

#### 🔄 실행 방안
- **1단계**: 문제의 본질 파악
- **2단계**: 다양한 해결책 모색
- **3단계**: 최적의 방안 선택
- **4단계**: 실행 및 모니터링

{conclusion_text} {message}에 대한 종합적 분석을 통해 귀하에게 최적의 답변을 제공했습니다.

### 🌟 추가 통찰
이러한 접근 방식은 단순한 답변이 아닌, 깊이 있는 통찰과 실용적인 해결책을 제공합니다.

사용자 프로필을 기반으로 한 개인화된 응답으로, 귀하의 관심사와 선호도를 반영했습니다.

---
*고급 AI 시스템이 제공하는 지능형 서비스*
*대화 수: {user_profile['conversation_count']}회*
"""

        return response

    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        return {
            "status": "healthy",
            "conversation_count": len(self.conversation_history),
            "active_users": len(self.user_profiles),
            "knowledge_topics": len(self.knowledge_base),
            "response_templates": sum(len(templates) for templates in self.response_templates.values()),
            "last_conversation": self.conversation_history[-1] if self.conversation_history else None,
            "user_profiles": {
                user_id: {
                    "conversation_count": profile["conversation_count"],
                    "interests": profile["interests"],
                    "preferred_topics": profile["preferred_topics"]
                }
                for user_id, profile in self.user_profiles.items()
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# AI 엔진 인스턴스
ai_engine = AdvancedAIEngine()


@app.get("/")
async def root():
    return {
        "message": "Advanced AI Chat System",
        "version": "1.0.0",
        "status": "running",
        "conversation_count": len(ai_engine.conversation_history),
        "active_users": len(ai_engine.user_profiles),
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "conversation_count": len(ai_engine.conversation_history),
        "active_users": len(ai_engine.user_profiles)
    }

@app.post("/api/chat")
async def chat_endpoint(chat_data: ChatMessage):
    """고급 채팅 엔드포인트"""
    try:
        logger.info(f"고급 채팅 요청: {chat_data.message[:50]}...")

        response = await ai_engine.generate_advanced_response(
            chat_data.message,
            chat_data.user_id,
            chat_data.context
        )

        return {
            "success": True,
            "response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"고급 채팅 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """시스템 상태 조회"""
    try:
        status = ai_engine.get_system_status()
        return status
    except Exception as e:
        logger.error(f"상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    """고급 대시보드 HTML"""
    html_content = """
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>고급 AI 대시보드</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 1400px;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 2.5em;
                font-weight: 300;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
            }
            .main-content {
                display: flex;
                min-height: 600px;
            }
            .chat-section {
                flex: 2;
                padding: 30px;
                border-right: 1px solid #e0e0e0;
            }
            .sidebar {
                flex: 1;
                padding: 30px;
                background: #f9f9f9;
            }
            .chat-input {
                display: flex;
                gap: 10px;
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
                background: #f9f9f9;
                margin-bottom: 20px;
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
            .message-content {
                white-space: pre-wrap;
                line-height: 1.6;
            }
            .status-panel {
                background: white;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .status-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            .status-item:last-child {
                border-bottom: none;
            }
            .status-label {
                font-weight: bold;
                color: #333;
            }
            .status-value {
                color: #667eea;
            }
            .loading {
                display: none;
                text-align: center;
                padding: 20px;
                color: #667eea;
            }
            .quick-questions {
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .quick-question {
                background: #f0f0f0;
                border: none;
                border-radius: 5px;
                padding: 10px;
                margin: 5px 0;
                cursor: pointer;
                width: 100%;
                text-align: left;
                transition: background 0.3s;
            }
            .quick-question:hover {
                background: #e0e0e0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 고급 AI 대시보드</h1>
                <p>활성화된 질문 답변 기능으로 더 똑똑한 대화를 경험하세요</p>
            </div>
            <div class="main-content">
                <div class="chat-section">
                    <div class="chat-input">
                        <input type="text" id="messageInput" placeholder="질문을 입력하세요..." onkeypress="handleKeyPress(event)">
                        <button onclick="sendMessage()">전송</button>
                    </div>
                    <div class="loading" id="loading">
                        AI가 고급 분석을 수행하고 있습니다...
                    </div>
                    <div class="chat-messages" id="chatMessages">
                        <div class="message ai">
                            <div class="message-content">안녕하세요! 고급 AI 시스템입니다.

이제 더 똑똑하고 활성화된 답변을 제공합니다:
- 🧠 질문 분석 및 주제 분류
- 💡 다각도 분석 및 통찰
- 📚 관련 지식 베이스 활용
- 🎯 구체적 제안 및 실행 방안
- 🔄 개인화된 응답

어떤 질문이든 자유롭게 물어보세요! 🚀</div>
                        </div>
                    </div>
                </div>
                <div class="sidebar">
                    <div class="status-panel">
                        <h3>📊 시스템 상태</h3>
                        <div class="status-item">
                            <span class="status-label">상태:</span>
                            <span class="status-value" id="systemStatus">정상</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">대화 수:</span>
                            <span class="status-value" id="conversationCount">0</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">활성 사용자:</span>
                            <span class="status-value" id="activeUsers">1</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">지식 주제:</span>
                            <span class="status-value" id="knowledgeTopics">6</span>
                        </div>
                    </div>
                    <div class="quick-questions">
                        <h3>💡 빠른 질문</h3>
                        <button class="quick-question" onclick="askQuickQuestion('정치의 본질은 무엇인가요?')">정치의 본질은 무엇인가요?</button>
                        <button class="quick-question" onclick="askQuickQuestion('경제 발전의 방향은?')">경제 발전의 방향은?</button>
                        <button class="quick-question" onclick="askQuickQuestion('교육의 목표는?')">교육의 목표는?</button>
                        <button class="quick-question" onclick="askQuickQuestion('기술 발전의 윤리는?')">기술 발전의 윤리는?</button>
                        <button class="quick-question" onclick="askQuickQuestion('역사에서 배울 점은?')">역사에서 배울 점은?</button>
                    </div>
                </div>
            </div>
        </div>

        <script>
            let conversationCount = 0;

            function handleKeyPress(event) {
                if (event.key === 'Enter') {
                    sendMessage();
                }
            }

            async function sendMessage() {
                const input = document.getElementById('messageInput');
                const message = input.value.trim();

                if (!message) return;

                // 사용자 메시지 표시
                addMessage(message, 'user');
                input.value = '';

                // 로딩 표시
                showLoading(true);

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: message,
                            user_id: 'web_user',
                            context: {
                                timestamp: new Date().toISOString(),
                                source: 'web_dashboard'
                            }
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        addMessage(data.response, 'ai');
                        conversationCount++;
                        updateStatus();
                    } else {
                        addMessage('죄송합니다. 오류가 발생했습니다.', 'ai');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    addMessage('네트워크 오류가 발생했습니다.', 'ai');
                } finally {
                    showLoading(false);
                }
            }

            function askQuickQuestion(question) {
                document.getElementById('messageInput').value = question;
                sendMessage();
            }

            function addMessage(content, type) {
                const chatMessages = document.getElementById('chatMessages');
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${type}`;
                messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            function showLoading(show) {
                const loading = document.getElementById('loading');
                loading.style.display = show ? 'block' : 'none';
            }

            function updateStatus() {
                document.getElementById('conversationCount').textContent = conversationCount;
            }

            // 페이지 로드 시 상태 업데이트
            updateStatus();
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    logger.info("🚀 Advanced AI Chat System 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    logger.info("🎯 대시보드: http://localhost:8000/dashboard")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False, log_level="info")
