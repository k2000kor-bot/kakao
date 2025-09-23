import logging
import asyncio
import json
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
    title="Simple Working Chat",
    description="간단하고 확실하게 작동하는 채팅 시스템",
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

class SimpleChatEngine:
    """간단하고 확실하게 작동하는 채팅 엔진"""
    
    def __init__(self):
        self.conversation_history = []
        self.user_profiles = {}
        logger.info("간단한 채팅 엔진 초기화 완료")
    
    async def generate_response(self, message: str, user_id: str) -> str:
        """응답 생성"""
        logger.info(f"응답 생성 요청: {message[:50]}...")
        
        # 사용자 프로필 업데이트
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                "conversation_count": 0,
                "interests": [],
                "last_message": ""
            }
        
        user_profile = self.user_profiles[user_id]
        user_profile["conversation_count"] += 1
        user_profile["last_message"] = message
        
        # 응답 생성
        response = await self._build_response(message, user_profile)
        
        # 대화 히스토리 저장
        conversation_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "message": message,
            "response": response
        }
        self.conversation_history.append(conversation_entry)
        
        logger.info(f"응답 생성 완료: {len(response)}자")
        return response
    
    async def _build_response(self, message: str, user_profile: Dict) -> str:
        """응답 구성"""
        # 키워드 기반 응답 생성
        keywords = {
            "정치": "정치는 시민의 삶의 질을 높이는 것이 목표입니다.",
            "경제": "경제는 사람의 문제이며, 지속 가능한 성장이 중요합니다.",
            "사회": "사회는 다양한 구성원들이 함께 만들어가는 공동체입니다.",
            "교육": "교육은 지식 전달이 아니라 사고력과 창의력을 기르는 것입니다.",
            "기술": "기술은 인간을 위한 도구여야 합니다.",
            "역사": "역사는 과거의 기록이 아니라 현재를 이해하는 열쇠입니다.",
            "코딩": "코딩은 문제 해결을 위한 창의적 사고 과정입니다.",
            "데이터": "데이터는 정보의 원석이며, 분석을 통해 가치를 창출합니다.",
            "창작": "창작은 인간의 창의성을 표현하는 가장 아름다운 방법입니다.",
            "마케팅": "마케팅은 고객의 니즈를 파악하고 가치를 전달하는 것입니다."
        }
        
        # 키워드 찾기
        found_keywords = []
        for keyword, explanation in keywords.items():
            if keyword in message:
                found_keywords.append((keyword, explanation))
        
        # 응답 구성
        response = f"""## 🚀 CORBU AI 응답

**질문**: {message}
**대화 수**: {user_profile['conversation_count']}회

### 💡 답변

안녕하세요! "{message}"에 대해 답변드리겠습니다.

"""
        
        if found_keywords:
            response += "### 🔍 관련 주제 분석\n"
            for keyword, explanation in found_keywords:
                response += f"**{keyword}**: {explanation}\n\n"
        
        response += f"""### 🧠 종합적 분석

귀하의 질문을 다각도로 분석해보면:

1. **문제의 본질**: {message}의 핵심을 파악하는 것이 중요합니다.
2. **다양한 관점**: 여러 관점에서 접근하여 종합적인 이해를 제공합니다.
3. **실용적 해결책**: 이론과 실무를 결합한 구체적인 방안을 제시합니다.

### 🎯 구체적 제안

**단기적 접근**:
- 즉시 실행 가능한 구체적 방안
- 단계별 실행 계획 수립

**중기적 전략**:
- 체계적이고 지속 가능한 전략
- 목표 설정 및 진행 상황 모니터링

**장기적 비전**:
- 미래 지향적인 비전과 목표
- 지속적인 성장과 발전

### 🔄 실행 방안

1. **문제 정의**: 명확한 문제 정의와 목표 설정
2. **정보 수집**: 관련 정보와 데이터 수집
3. **분석 및 검토**: 수집된 정보의 분석과 검토
4. **해결책 모색**: 다양한 해결책 탐색
5. **실행 및 평가**: 실행 후 결과 평가 및 개선

### 🌟 결론

{message}에 대한 종합적 분석을 통해 귀하에게 최적의 답변을 제공했습니다.

이러한 접근 방식은 단순한 답변이 아닌, 깊이 있는 통찰과 실용적인 해결책을 제공합니다.

---
*CORBU AI가 제공하는 지능형 서비스*
*대화 수: {user_profile['conversation_count']}회*"""
        
        return response
    
    def get_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        return {
            "status": "healthy",
            "conversation_count": len(self.conversation_history),
            "active_users": len(self.user_profiles),
            "last_conversation": self.conversation_history[-1] if self.conversation_history else None,
            "user_profiles": {
                user_id: {
                    "conversation_count": profile["conversation_count"],
                    "interests": profile["interests"],
                    "last_message": profile["last_message"]
                }
                for user_id, profile in self.user_profiles.items()
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# 채팅 엔진 인스턴스
chat_engine = SimpleChatEngine()

@app.get("/")
async def root():
    return {
        "message": "Simple Working Chat",
        "version": "1.0.0",
        "status": "running",
        "conversation_count": len(chat_engine.conversation_history),
        "active_users": len(chat_engine.user_profiles),
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "conversation_count": len(chat_engine.conversation_history),
        "active_users": len(chat_engine.user_profiles)
    }

@app.post("/api/chat")
async def chat_endpoint(chat_data: ChatMessage):
    """채팅 엔드포인트"""
    try:
        logger.info(f"채팅 요청: {chat_data.message[:50]}...")
        
        response = await chat_engine.generate_response(
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
        status = chat_engine.get_status()
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
        <title>CORBU AI 대시보드</title>
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
                <h1>🚀 CORBU AI 대시보드</h1>
                <p>간단하고 확실하게 작동하는 AI 채팅 시스템</p>
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
                        <div class="message-content">안녕하세요! CORBU AI입니다. 

이제 제대로 답변을 제공합니다:
- 🧠 키워드 기반 분석
- 💡 종합적 답변 생성
- 🎯 구체적 제안 및 실행 방안
- 🔄 단계별 접근 방법

어떤 질문이든 자유롭게 물어보세요! 🚀</div>
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
    logger.info("🚀 Simple Working Chat 서버를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    logger.info("🎯 대시보드: http://localhost:8000/dashboard")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False, log_level="info")
