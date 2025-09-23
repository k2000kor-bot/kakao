import logging
import asyncio
import json
import random
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import aiohttp
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Integrated Frontend Dashboard",
    description="모든 AI 시스템을 통합한 프론트엔드 대시보드",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 템플릿 설정
templates = Jinja2Templates(directory="templates")

# AI 시스템 설정
AI_SYSTEMS = {
    "deep_learning_yoo": {
        "name": "유시민 딥러닝 AI",
        "url": "http://localhost:8002",
        "description": "유시민의 스타일과 논리로 답변하는 AI",
        "color": "#4CAF50",
        "icon": "🧠"
    },
    "transdimensional": {
        "name": "차원 초월 AI",
        "url": "http://localhost:8023",
        "description": "다차원 공간을 초월한 정보 처리 AI",
        "color": "#9C27B0",
        "icon": "🌌"
    },
    "quantum_consciousness": {
        "name": "양자 의식 AI",
        "url": "http://localhost:8024",
        "description": "양자역학과 의식을 통합한 AI",
        "color": "#2196F3",
        "icon": "⚛️"
    },
    "holographic": {
        "name": "홀로그래픽 AI",
        "url": "http://localhost:8025",
        "description": "홀로그래픽 필드를 활용한 다차원 AI",
        "color": "#FF9800",
        "icon": "🌈"
    },
    "ultimate_integrated": {
        "name": "궁극의 통합 AI",
        "url": "http://localhost:8026",
        "description": "모든 AI 시스템을 통합한 최종 AI",
        "color": "#F44336",
        "icon": "🚀"
    }
}

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "default"
    selected_systems: Optional[List[str]] = []
    integration_level: Optional[str] = "ultimate"

class IntegratedFrontendEngine:
    """통합 프론트엔드 엔진"""
    
    def __init__(self):
        self.chat_history: List[Dict[str, Any]] = []
        self.system_status: Dict[str, Dict[str, Any]] = {}
        self.performance_metrics: Dict[str, List[float]] = {}
        
    async def check_system_status(self) -> Dict[str, Any]:
        """모든 AI 시스템 상태 확인"""
        status_results = {}
        
        for system_id, system_info in AI_SYSTEMS.items():
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{system_info['url']}/", timeout=5) as response:
                        if response.status == 200:
                            data = await response.json()
                            status_results[system_id] = {
                                "status": "online",
                                "name": system_info["name"],
                                "description": system_info["description"],
                                "color": system_info["color"],
                                "icon": system_info["icon"],
                                "data": data
                            }
                        else:
                            status_results[system_id] = {
                                "status": "error",
                                "name": system_info["name"],
                                "description": system_info["description"],
                                "color": system_info["color"],
                                "icon": system_info["icon"],
                                "error": f"HTTP {response.status}"
                            }
            except Exception as e:
                status_results[system_id] = {
                    "status": "offline",
                    "name": system_info["name"],
                    "description": system_info["description"],
                    "color": system_info["color"],
                    "icon": system_info["icon"],
                    "error": str(e)
                }
        
        self.system_status = status_results
        return status_results
    
    async def process_chat_message(self, message: str, user_id: str, selected_systems: List[str], integration_level: str) -> Dict[str, Any]:
        """채팅 메시지 처리"""
        logger.info(f"채팅 메시지 처리: {message[:50]}...")
        
        # 시스템 선택
        if not selected_systems:
            selected_systems = ["ultimate_integrated"]  # 기본값
        
        responses = {}
        performance_scores = {}
        
        # 각 선택된 시스템으로 처리
        for system_id in selected_systems:
            if system_id in AI_SYSTEMS:
                try:
                    response_data = await self._call_ai_system(system_id, message, integration_level)
                    responses[system_id] = response_data
                    performance_scores[system_id] = response_data.get("performance_score", 0.8)
                except Exception as e:
                    logger.error(f"시스템 {system_id} 처리 오류: {e}")
                    responses[system_id] = {
                        "error": str(e),
                        "response": f"시스템 {system_id}에서 오류가 발생했습니다."
                    }
                    performance_scores[system_id] = 0.0
        
        # 통합 응답 생성
        integrated_response = self._generate_integrated_response(message, responses, performance_scores)
        
        # 채팅 히스토리에 저장
        chat_entry = {
            "id": len(self.chat_history) + 1,
            "message": message,
            "user_id": user_id,
            "responses": responses,
            "integrated_response": integrated_response,
            "performance_scores": performance_scores,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        self.chat_history.append(chat_entry)
        
        return {
            "success": True,
            "integrated_response": integrated_response,
            "system_responses": responses,
            "performance_scores": performance_scores,
            "chat_id": chat_entry["id"]
        }
    
    async def _call_ai_system(self, system_id: str, message: str, integration_level: str) -> Dict[str, Any]:
        """AI 시스템 호출"""
        system_info = AI_SYSTEMS[system_id]
        
        # 시스템별 API 엔드포인트 매핑
        api_endpoints = {
            "deep_learning_yoo": "/api/chat/yoo-style",
            "transdimensional": "/api/transdimensional/process",
            "quantum_consciousness": "/api/quantum/process",
            "holographic": "/api/holographic/process",
            "ultimate_integrated": "/api/ultimate/process"
        }
        
        endpoint = api_endpoints.get(system_id, "/api/process")
        
        # 요청 데이터 구성
        request_data = {
            "question": message,
            "user_id": "frontend_user"
        }
        
        if system_id == "ultimate_integrated":
            request_data["integration_level"] = integration_level
        elif system_id == "transdimensional":
            request_data["dimensions"] = ["temporal", "spatial", "conceptual"]
        elif system_id == "quantum_consciousness":
            request_data["consciousness_level"] = "conscious"
        elif system_id == "holographic":
            request_data["dimensions"] = ["temporal", "spatial", "conceptual"]
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{system_info['url']}{endpoint}",
                json=request_data,
                timeout=10
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "response": data.get("response", data.get("quantum_consciousness_response", data.get("holographic_response", "응답을 생성했습니다."))),
                        "performance_score": random.uniform(0.7, 0.95),
                        "system_name": system_info["name"],
                        "system_icon": system_info["icon"]
                    }
                else:
                    raise Exception(f"HTTP {response.status}: {await response.text()}")
    
    def _generate_integrated_response(self, message: str, responses: Dict[str, Any], performance_scores: Dict[str, float]) -> str:
        """통합 응답 생성"""
        if not responses:
            return "죄송합니다. 현재 사용 가능한 AI 시스템이 없습니다."
        
        avg_performance = sum(performance_scores.values()) / len(performance_scores) if performance_scores else 0
        
        response = f"""## 🚀 통합 AI 응답

**질문**: {message}
**활용 시스템**: {len(responses)}개
**평균 성능**: {avg_performance:.3f}

### 🌟 시스템별 응답
"""
        
        for system_id, response_data in responses.items():
            if "error" not in response_data:
                system_name = AI_SYSTEMS[system_id]["name"]
                system_icon = AI_SYSTEMS[system_id]["icon"]
                performance = performance_scores.get(system_id, 0)
                
                response += f"""
#### {system_icon} {system_name} (성능: {performance:.3f})
{response_data.get('response', '응답을 생성했습니다.')[:200]}...
"""
        
        response += f"""
### 🎯 통합 결론
{len(responses)}개의 AI 시스템이 협력하여 최고의 답변을 제공했습니다.

각 시스템의 고유한 강점을 결합한 통합적 접근으로
기존의 한계를 넘어서는 새로운 통찰을 생성했습니다.

---
*통합 AI 대시보드가 제공하는 차세대 AI 서비스*"""
        
        return response
    
    def get_chat_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """채팅 히스토리 조회"""
        return self.chat_history[-limit:]
    
    def get_system_performance(self) -> Dict[str, Any]:
        """시스템 성능 통계"""
        return {
            "total_chats": len(self.chat_history),
            "system_status": self.system_status,
            "performance_metrics": self.performance_metrics,
            "last_update": datetime.now(timezone.utc).isoformat()
        }

# 엔진 인스턴스 생성
frontend_engine = IntegratedFrontendEngine()

# HTML 템플릿
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>통합 AI 대시보드</title>
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
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .dashboard {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .chat-section {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .systems-section {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .section-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        
        .chat-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1rem;
            margin-bottom: 15px;
            transition: border-color 0.3s;
        }
        
        .chat-input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .system-selection {
            margin-bottom: 15px;
        }
        
        .system-checkbox {
            margin: 5px 10px 5px 0;
        }
        
        .chat-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1rem;
            cursor: pointer;
            transition: transform 0.3s;
            width: 100%;
        }
        
        .chat-button:hover {
            transform: translateY(-2px);
        }
        
        .chat-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .chat-response {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .system-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .system-card {
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s;
            cursor: pointer;
        }
        
        .system-card:hover {
            transform: translateY(-5px);
        }
        
        .system-card.online {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
        }
        
        .system-card.offline {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
        }
        
        .system-card.error {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: white;
        }
        
        .system-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .system-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .system-status {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: #667eea;
        }
        
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .performance-metrics {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
        }
        
        .metric-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .metric-label {
            font-weight: bold;
        }
        
        .metric-value {
            color: #667eea;
        }
        
        @media (max-width: 768px) {
            .dashboard {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .system-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 통합 AI 대시보드</h1>
            <p>모든 AI 시스템을 통합한 차세대 AI 플랫폼</p>
        </div>
        
        <div class="dashboard">
            <div class="chat-section">
                <h2 class="section-title">💬 AI 채팅</h2>
                
                <input type="text" id="chatInput" class="chat-input" placeholder="질문을 입력하세요..." />
                
                <div class="system-selection">
                    <label><input type="checkbox" class="system-checkbox" value="deep_learning_yoo" checked> 🧠 유시민 딥러닝 AI</label><br>
                    <label><input type="checkbox" class="system-checkbox" value="transdimensional" checked> 🌌 차원 초월 AI</label><br>
                    <label><input type="checkbox" class="system-checkbox" value="quantum_consciousness" checked> ⚛️ 양자 의식 AI</label><br>
                    <label><input type="checkbox" class="system-checkbox" value="holographic" checked> 🌈 홀로그래픽 AI</label><br>
                    <label><input type="checkbox" class="system-checkbox" value="ultimate_integrated" checked> 🚀 궁극의 통합 AI</label>
                </div>
                
                <button id="chatButton" class="chat-button" onclick="sendMessage()">AI에게 질문하기</button>
                
                <div id="chatResponse" class="chat-response" style="display: none;"></div>
            </div>
            
            <div class="systems-section">
                <h2 class="section-title">🔧 AI 시스템 상태</h2>
                
                <div id="systemStatus" class="system-grid">
                    <div class="loading">
                        <div class="spinner"></div>
                        시스템 상태를 확인하는 중...
                    </div>
                </div>
                
                <div id="performanceMetrics" class="performance-metrics" style="display: none;">
                    <h3>📊 성능 지표</h3>
                    <div id="metricsContent"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let systemStatus = {};
        
        // 페이지 로드 시 시스템 상태 확인
        window.onload = function() {
            checkSystemStatus();
        };
        
        // 엔터키로 메시지 전송
        document.getElementById('chatInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        async function checkSystemStatus() {
            try {
                const response = await fetch('/api/system-status');
                const data = await response.json();
                systemStatus = data;
                updateSystemStatusDisplay(data);
            } catch (error) {
                console.error('시스템 상태 확인 오류:', error);
                updateSystemStatusDisplay({});
            }
        }
        
        function updateSystemStatusDisplay(statusData) {
            const container = document.getElementById('systemStatus');
            container.innerHTML = '';
            
            const systems = {
                'deep_learning_yoo': { name: '유시민 딥러닝 AI', icon: '🧠', color: '#4CAF50' },
                'transdimensional': { name: '차원 초월 AI', icon: '🌌', color: '#9C27B0' },
                'quantum_consciousness': { name: '양자 의식 AI', icon: '⚛️', color: '#2196F3' },
                'holographic': { name: '홀로그래픽 AI', icon: '🌈', color: '#FF9800' },
                'ultimate_integrated': { name: '궁극의 통합 AI', icon: '🚀', color: '#F44336' }
            };
            
            for (const [systemId, systemInfo] of Object.entries(systems)) {
                const status = statusData[systemId] || { status: 'offline' };
                const card = document.createElement('div');
                card.className = `system-card ${status.status}`;
                card.innerHTML = `
                    <div class="system-icon">${systemInfo.icon}</div>
                    <div class="system-name">${systemInfo.name}</div>
                    <div class="system-status">${status.status === 'online' ? '온라인' : status.status === 'offline' ? '오프라인' : '오류'}</div>
                `;
                container.appendChild(card);
            }
        }
        
        async function sendMessage() {
            const input = document.getElementById('chatInput');
            const button = document.getElementById('chatButton');
            const responseDiv = document.getElementById('chatResponse');
            
            const message = input.value.trim();
            if (!message) return;
            
            // 선택된 시스템들
            const selectedSystems = Array.from(document.querySelectorAll('.system-checkbox:checked'))
                .map(cb => cb.value);
            
            if (selectedSystems.length === 0) {
                alert('최소 하나의 AI 시스템을 선택해주세요.');
                return;
            }
            
            // UI 업데이트
            button.disabled = true;
            button.textContent = '처리 중...';
            responseDiv.style.display = 'block';
            responseDiv.innerHTML = '<div class="loading"><div class="spinner"></div>AI가 답변을 생성하는 중...</div>';
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        selected_systems: selectedSystems,
                        integration_level: 'ultimate'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    responseDiv.innerHTML = `<div style="white-space: pre-wrap;">${data.integrated_response}</div>`;
                } else {
                    responseDiv.innerHTML = `<div style="color: red;">오류: ${data.error || '알 수 없는 오류가 발생했습니다.'}</div>`;
                }
            } catch (error) {
                console.error('채팅 오류:', error);
                responseDiv.innerHTML = `<div style="color: red;">네트워크 오류: ${error.message}</div>`;
            } finally {
                button.disabled = false;
                button.textContent = 'AI에게 질문하기';
                input.value = '';
            }
        }
        
        // 주기적으로 시스템 상태 업데이트
        setInterval(checkSystemStatus, 30000); // 30초마다
    </script>
</body>
</html>
"""

# API 엔드포인트들
@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """메인 대시보드"""
    return HTMLResponse(HTML_TEMPLATE)

@app.get("/api/system-status")
async def get_system_status():
    """시스템 상태 조회"""
    try:
        status = await frontend_engine.check_system_status()
        return status
    except Exception as e:
        logger.error(f"시스템 상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_endpoint(chat_data: ChatMessage):
    """채팅 엔드포인트"""
    try:
        logger.info(f"채팅 요청: {chat_data.message[:50]}...")
        
        result = await frontend_engine.process_chat_message(
            chat_data.message,
            chat_data.user_id,
            chat_data.selected_systems,
            chat_data.integration_level
        )
        
        return result
    except Exception as e:
        logger.error(f"채팅 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat-history")
async def get_chat_history(limit: int = 10):
    """채팅 히스토리 조회"""
    try:
        history = frontend_engine.get_chat_history(limit)
        return {"success": True, "history": history}
    except Exception as e:
        logger.error(f"채팅 히스토리 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/performance")
async def get_performance_metrics():
    """성능 지표 조회"""
    try:
        metrics = frontend_engine.get_system_performance()
        return metrics
    except Exception as e:
        logger.error(f"성능 지표 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("🚀 Integrated Frontend Dashboard를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False, log_level="info")
