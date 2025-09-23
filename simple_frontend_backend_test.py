import logging
from typing import Dict, Optional, Any
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
    title="Simple Frontend Backend Test",
    description="프론트엔드와 백엔드 연결 테스트",
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

class AdvancedAIEngine:
    """고급 AI 엔진 - 유시민 스타일 통합"""

    def __init__(self):
        self.conversation_history = []
        self.user_profiles = {}
        self.knowledge_base = self._initialize_knowledge_base()
        logger.info("고급 AI 엔진 초기화 완료")

    def _initialize_knowledge_base(self) -> Dict:
        """지식 베이스 초기화"""
        return {
            "정치": {
                "keywords": ["정치", "정부", "국회", "선거", "정책", "민주주의", "시민"],
                "perspectives": [
                    "정치는 권력의 문제가 아니라 시민들이 어떻게 함께 살아갈 것인가의 문제입니다.",
                    "진정한 민주주의는 시민들이 적극적으로 참여하고 서로의 의견을 존중하는 것입니다.",
                    "정치인은 시민을 위해 일해야 하고, 시민은 정치에 적극적으로 참여해야 합니다."
                ],
                "solutions": [
                    "시민 참여를 통한 정치 개혁",
                    "투명하고 책임감 있는 정치 문화 조성",
                    "장기적 비전을 가진 정책 수립"
                ]
            },
            "경제": {
                "keywords": ["경제", "경기", "시장", "투자", "GDP", "인플레이션", "부동산"],
                "perspectives": [
                    "경제는 숫자의 문제가 아니라 사람의 문제입니다.",
                    "GDP가 높아도 사람들이 행복하지 않다면 그 경제는 실패한 것입니다.",
                    "경제를 사람 중심으로 생각해야 합니다."
                ],
                "solutions": [
                    "포용적 성장을 통한 경제 발전",
                    "지속 가능한 경제 모델 구축",
                    "소득 불평등 해소를 위한 정책"
                ]
            },
            "교육": {
                "keywords": ["교육", "학습", "학교", "대학", "지식", "성장", "인재"],
                "perspectives": [
                    "교육의 본질은 지식을 전달하는 것이 아니라 사람을 사람답게 만드는 것입니다.",
                    "현재 우리 교육은 이 본질을 놓치고 있는 것 같습니다.",
                    "미래를 위한 교육으로 바꿔야 합니다."
                ],
                "solutions": [
                    "창의적 사고를 기르는 교육 시스템",
                    "개인의 잠재력을 최대한 발휘할 수 있는 환경 조성",
                    "평생 학습 사회 구축"
                ]
            },
            "사회": {
                "keywords": ["사회", "문화", "복지", "불평등", "다양성", "공동체"],
                "perspectives": [
                    "사회의 변화는 하루아침에 일어나지 않습니다.",
                    "작은 변화들이 쌓여서 큰 변화를 만들어내는 것입니다.",
                    "모두가 함께 성장할 수 있는 사회를 만들어야 합니다."
                ],
                "solutions": [
                    "사회적 약자를 배려하는 정책",
                    "다양성을 존중하는 사회 문화",
                    "공동체 의식 강화"
                ]
            },
            "기술": {
                "keywords": ["기술", "AI", "인공지능", "디지털", "혁신", "스마트"],
                "perspectives": [
                    "기술은 인간을 위한 도구여야 합니다.",
                    "현재 우리는 기술에 지배당하고 있습니다.",
                    "기술을 올바르게 사용하는 방법을 배워야 합니다."
                ],
                "solutions": [
                    "인간 중심의 기술 발전",
                    "디지털 격차 해소",
                    "윤리적 기술 사용 가이드라인"
                ]
            }
        }

    def _analyze_question(self, message: str) -> Dict:
        """질문 분석"""
        message_lower = message.lower()

        # 주제 감지
        detected_topics = []
        for topic, data in self.knowledge_base.items():
            if any(keyword in message_lower for keyword in data["keywords"]):
                detected_topics.append(topic)

        # 질문 유형 분석
        question_types = {
            "what": ["무엇", "what", "어떤"],
            "why": ["왜", "why", "이유", "원인"],
            "how": ["어떻게", "how", "방법", "과정"],
            "when": ["언제", "when", "시기"],
            "where": ["어디서", "where", "장소"],
            "who": ["누가", "who", "누구"]
        }

        detected_types = []
        for q_type, keywords in question_types.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_types.append(q_type)

        return {
            "topics": detected_topics,
            "question_types": detected_types,
            "complexity": len(detected_topics) + len(detected_types),
            "primary_topic": detected_topics[0] if detected_topics else "일반"
        }

    def _generate_yoo_style_response(self, message: str, analysis: Dict) -> str:
        """유시민 스타일 응답 생성"""
        primary_topic = analysis["primary_topic"]

        if primary_topic in self.knowledge_base:
            topic_data = self.knowledge_base[primary_topic]

            # 유시민 스타일 시작
            opening = "그런데 말이죠, 여러분이 제기하신 질문에 대해 말씀드리겠습니다."

            # 핵심 관점
            perspectives = topic_data["perspectives"]
            main_perspective = perspectives[0] if perspectives else ""

            # 해결 방안
            solutions = topic_data["solutions"]

            # 유시민 스타일 본문 구성
            response = f"""{opening}

## 🧠 심층 분석

{main_perspective}

여기서 중요한 것은 단순히 문제를 인식하는 것만으로는 충분하지 않다는 점입니다.

## 💡 핵심 통찰

{primary_topic}에 대해 체계적으로 접근해보면, 다음과 같은 관점들이 중요합니다:

1. **근본적 이해**: {primary_topic}의 본질을 파악하는 것이 우선입니다.
2. **다각도 분석**: 여러 관점에서 접근하여 종합적인 이해를 제공합니다.
3. **실용적 해결**: 이론과 실무를 결합한 구체적인 방안을 제시합니다.

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

            response += f"""

## 🌟 결론

그래서 제가 말씀드리고 싶은 것은, {primary_topic}에 대한 우리의 이해는 이런 다양한 관점들을 종합할 때 더욱 풍부해집니다.

그런데 여러분은 어떻게 생각하시나요? 이런 관점들이 {primary_topic}에 대한 여러분의 이해에 어떤 도움이 되었는지 궁금합니다.

함께 생각하고 토론하는 과정에서 우리는 더 나은 답을 찾아갈 수 있을 것입니다.

---
*유시민 스타일로 학습한 고급 AI 시스템이 제공하는 종합적 분석*"""

            return response

        else:
            # 일반 주제에 대한 응답
            return self._generate_general_response(message, analysis)

    def _generate_general_response(self, message: str, analysis: Dict) -> str:
        """일반 주제에 대한 응답"""
        return f"""그런데 말이죠, 여러분이 제기하신 질문에 대해 말씀드리겠습니다.

## 🧠 심층 분석

"{message}"에 대해 다각도로 분석해보겠습니다.

## 💡 핵심 통찰

1. **문제의 본질**: {message}의 핵심을 파악하기 위해 근본적인 접근이 필요합니다.
2. **다양한 관점**: 여러 관점에서 접근하여 종합적인 이해를 제공합니다.
3. **실용적 해결책**: 이론과 실무를 결합한 구체적인 방안을 제시합니다.

## 🔍 상세 분석

{message}에 대한 분석을 통해 다음과 같은 인사이트를 제공합니다:

- **구조적 분석**: 문제의 구조와 패턴을 파악
- **역사적 맥락**: 과거의 경험과 현재의 상황을 연결
- **미래적 전망**: 변화하는 환경에 대한 대응 방안

## 🎯 구체적 제안

1. **단기적 접근**: 즉시 실행 가능한 구체적 방안
2. **중기적 전략**: 체계적이고 지속 가능한 전략
3. **장기적 비전**: 미래 지향적인 비전과 목표

## 🌟 결론

{message}에 대한 종합적 분석을 통해 귀하에게 최적의 답변을 제공했습니다.

이러한 접근 방식은 단순한 답변이 아닌, 깊이 있는 통찰과 실용적인 해결책을 제공합니다.

---
*고급 AI 시스템이 제공하는 지능형 서비스*"""

    async def generate_response(self, message: str, user_id: str) -> str:
        """고급 응답 생성"""
        logger.info(f"고급 응답 생성 시작: {message[:30]}...")

        # 질문 분석
        analysis = self._analyze_question(message)

        # 유시민 스타일 응답 생성
        response = self._generate_yoo_style_response(message, analysis)

        # 사용자 프로필 업데이트
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                "conversation_count": 0,
                "topics": [],
                "preferences": {}
            }

        self.user_profiles[user_id]["conversation_count"] += 1
        self.user_profiles[user_id]["topics"].extend(analysis["topics"])

        # 대화 히스토리 저장
        self.conversation_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "message": message,
            "response": response,
            "analysis": analysis
        })

        logger.info(f"고급 응답 생성 완료: {len(response)}자")
        return response

    def get_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        return {
            "status": "healthy",
            "conversation_count": len(self.conversation_history),
            "last_conversation": self.conversation_history[-1] if self.conversation_history else None,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# AI 엔진 인스턴스
ai_engine = AdvancedAIEngine()

@app.get("/")
async def root():
    return {
        "message": "Simple Frontend Backend Test",
        "version": "1.0.0",
        "status": "running",
        "conversation_count": len(ai_engine.conversation_history),
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "conversation_count": len(ai_engine.conversation_history)
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

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    """대시보드 HTML"""
    html_content = """
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI 대시보드</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 1200px;
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
            .chat-container {
                padding: 30px;
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
            .status {
                text-align: center;
                padding: 20px;
                background: #f0f0f0;
                border-radius: 10px;
                margin-top: 20px;
            }
            .loading {
                display: none;
                text-align: center;
                padding: 20px;
                color: #667eea;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 AI 대시보드</h1>
                <p>고급 AI 시스템과 대화하세요</p>
            </div>
            <div class="chat-container">
                <div class="chat-input">
                    <input type="text" id="messageInput" placeholder="질문을 입력하세요..." onkeypress="handleKeyPress(event)">
                    <button onclick="sendMessage()">전송</button>
                </div>
                <div class="loading" id="loading">
                    AI가 답변을 생성하고 있습니다...
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="message ai">
                        <div class="message-content">안녕하세요! 고급 AI 시스템입니다. 어떤 질문이든 자유롭게 물어보세요. 🚀</div>
                    </div>
                </div>
                <div class="status" id="status">
                    시스템 상태: 정상 | 대화 수: 0
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
                            user_id: 'web_user'
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
                const status = document.getElementById('status');
                status.textContent = `시스템 상태: 정상 | 대화 수: ${conversationCount}`;
            }

            // 페이지 로드 시 상태 업데이트
            updateStatus();
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    logger.info("🚀 Simple Frontend Backend Test 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    logger.info("🎯 대시보드: http://localhost:8000/dashboard")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False, log_level="info")
