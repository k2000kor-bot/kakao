"""
NLP Master Server - Unified Interface
자연어 처리 통합 마스터 서버

Integrates all advanced NLP systems:
1. Conversational LLM System
2. Advanced Korean NLP Engine
3. Semantic Search Engine
4. Real-time Generation Engine
5. Conversation Memory System
6. Natural Language Command System
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict

# FastAPI and async
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Import all NLP systems
from advanced_conversational_llm_system import AdvancedConversationalLLMSystem
from advanced_korean_nlp_engine import AdvancedKoreanNLPEngine
from semantic_search_engine import SemanticSearchEngine
from realtime_generation_engine import RealTimeGenerationEngine
from conversation_memory_system import ConversationMemorySystem
from natural_language_command_system import NaturalLanguageCommandSystem

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SystemStatus:
    """Status of individual NLP systems"""
    name: str
    status: str
    port: int
    health: str
    last_check: datetime
    error_message: Optional[str] = None

@dataclass
class UnifiedRequest:
    """Unified request for all NLP systems"""
    user_id: str
    session_id: str
    content: str
    request_type: str  # conversation, search, generation, command, analysis
    language: str = "ko"
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class UnifiedResponse:
    """Unified response from NLP systems"""
    request_id: str
    success: bool
    response_type: str
    content: str
    confidence: float
    processing_time: float
    system_used: str
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class NLPMasterServer:
    """Master server coordinating all NLP systems"""
    
    def __init__(self):
        self.systems = {}
        self.system_status = {}
        self.active_sessions = {}
        self.request_history = []
        
        # Initialize all NLP systems
        self._initialize_systems()
    
    def _initialize_systems(self):
        """Initialize all NLP systems"""
        try:
            logger.info("Initializing NLP systems...")
            _base = int(os.environ.get("NLP_MASTER_SYSTEM_BASE_PORT", "8001"))
            
            # Conversational LLM System
            self.systems['conversation'] = AdvancedConversationalLLMSystem()
            self.system_status['conversation'] = SystemStatus(
                name="Conversational LLM System",
                status="initializing",
                port=_base + 0,
                health="unknown",
                last_check=datetime.now()
            )
            
            # Korean NLP Engine
            self.systems['nlp'] = AdvancedKoreanNLPEngine()
            self.system_status['nlp'] = SystemStatus(
                name="Korean NLP Engine", 
                status="initializing",
                port=_base + 1,
                health="unknown",
                last_check=datetime.now()
            )
            
            # Semantic Search Engine
            self.systems['search'] = SemanticSearchEngine()
            self.system_status['search'] = SystemStatus(
                name="Semantic Search Engine",
                status="initializing", 
                port=_base + 2,
                health="unknown",
                last_check=datetime.now()
            )
            
            # Real-time Generation Engine
            self.systems['generation'] = RealTimeGenerationEngine()
            self.system_status['generation'] = SystemStatus(
                name="Real-time Generation Engine",
                status="initializing",
                port=_base + 3,
                health="unknown",
                last_check=datetime.now()
            )
            
            # Conversation Memory System
            self.systems['memory'] = ConversationMemorySystem()
            self.system_status['memory'] = SystemStatus(
                name="Conversation Memory System",
                status="initializing",
                port=_base + 4,
                health="unknown", 
                last_check=datetime.now()
            )
            
            # Natural Language Command System
            self.systems['command'] = NaturalLanguageCommandSystem()
            self.system_status['command'] = SystemStatus(
                name="Natural Language Command System",
                status="initializing",
                port=_base + 5,
                health="unknown",
                last_check=datetime.now()
            )
            
            # Update status to ready
            for system_name in self.systems:
                self.system_status[system_name].status = "ready"
                self.system_status[system_name].health = "healthy"
            
            logger.info(f"Successfully initialized {len(self.systems)} NLP systems")
            
        except Exception as e:
            logger.error(f"Error initializing NLP systems: {e}")
            raise
    
    async def process_unified_request(self, request: UnifiedRequest) -> UnifiedResponse:
        """Process unified request across all systems"""
        start_time = datetime.now()
        request_id = f"req_{int(start_time.timestamp())}"
        
        try:
            # Update conversation memory first
            if 'memory' in self.systems:
                context = self.systems['memory'].process_message(
                    request.user_id, 
                    request.session_id, 
                    request.content
                )
                request.metadata['context'] = asdict(context)
            
            # Route request to appropriate system
            if request.request_type == "conversation":
                response = await self._process_conversation(request, request_id)
            elif request.request_type == "search":
                response = await self._process_search(request, request_id)
            elif request.request_type == "generation":
                response = await self._process_generation(request, request_id)
            elif request.request_type == "command":
                response = await self._process_command(request, request_id)
            elif request.request_type == "analysis":
                response = await self._process_analysis(request, request_id)
            else:
                # Default to conversation
                response = await self._process_conversation(request, request_id)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            response.processing_time = processing_time
            
            # Save to history
            self.request_history.append({
                "request_id": request_id,
                "user_id": request.user_id,
                "session_id": request.session_id,
                "request_type": request.request_type,
                "content": request.content,
                "response": response.content,
                "success": response.success,
                "processing_time": processing_time,
                "timestamp": start_time.isoformat()
            })
            
            # Keep only last 1000 requests
            if len(self.request_history) > 1000:
                self.request_history = self.request_history[-1000:]
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing unified request: {e}")
            return UnifiedResponse(
                request_id=request_id,
                success=False,
                response_type="error",
                content=f"요청 처리 중 오류가 발생했습니다: {str(e)}",
                confidence=0.0,
                processing_time=(datetime.now() - start_time).total_seconds(),
                system_used="error"
            )
    
    async def _process_conversation(self, request: UnifiedRequest, request_id: str) -> UnifiedResponse:
        """Process conversation request"""
        try:
            conversation_system = self.systems['conversation']
            
            # Get contextual information
            context_info = {}
            if 'memory' in self.systems:
                context_info = self.systems['memory'].get_contextual_response_info(
                    request.user_id, request.session_id
                )
            
            # Generate response
            llm_response = await conversation_system.generate_response(
                message=request.content,
                user_id=request.user_id,
                session_id=request.session_id,
                context=context_info
            )
            
            return UnifiedResponse(
                request_id=request_id,
                success=True,
                response_type="conversation",
                content=llm_response.response_text,
                confidence=llm_response.confidence,
                processing_time=0.0,  # Will be set by caller
                system_used="conversation",
                metadata={
                    "model_used": llm_response.model_used,
                    "response_metadata": llm_response.metadata
                }
            )
            
        except Exception as e:
            logger.error(f"Error in conversation processing: {e}")
            return UnifiedResponse(
                request_id=request_id,
                success=False,
                response_type="conversation",
                content="대화 처리 중 오류가 발생했습니다.",
                confidence=0.0,
                processing_time=0.0,
                system_used="conversation"
            )
    
    async def _process_search(self, request: UnifiedRequest, request_id: str) -> UnifiedResponse:
        """Process search request"""
        try:
            search_system = self.systems['search']
            
            # Perform semantic search
            search_results = search_system.search(request.content, k=5)
            
            if search_results:
                # Format search results
                result_text = "검색 결과:\n\n"
                for i, result in enumerate(search_results[:3], 1):
                    result_text += f"{i}. {result.document.title}\n"
                    result_text += f"   {result.document.content[:200]}...\n"
                    result_text += f"   (유사도: {result.score:.3f})\n\n"
                
                confidence = search_results[0].score
            else:
                result_text = "검색 결과를 찾을 수 없습니다."
                confidence = 0.0
            
            return UnifiedResponse(
                request_id=request_id,
                success=len(search_results) > 0,
                response_type="search",
                content=result_text,
                confidence=confidence,
                processing_time=0.0,
                system_used="search",
                metadata={"result_count": len(search_results)}
            )
            
        except Exception as e:
            logger.error(f"Error in search processing: {e}")
            return UnifiedResponse(
                request_id=request_id,
                success=False,
                response_type="search",
                content="검색 처리 중 오류가 발생했습니다.",
                confidence=0.0,
                processing_time=0.0,
                system_used="search"
            )
    
    async def _process_generation(self, request: UnifiedRequest, request_id: str) -> UnifiedResponse:
        """Process generation request"""
        try:
            generation_system = self.systems['generation']
            
            # Create generation request
            from realtime_generation_engine import GenerationRequest, GenerationType, GenerationQuality
            
            gen_request = GenerationRequest(
                text=request.content,
                generation_type=GenerationType.CREATIVE_WRITING,
                quality=GenerationQuality.BALANCED,
                language=request.language
            )
            
            # Generate text
            gen_result = await generation_system.generate_text(gen_request)
            
            return UnifiedResponse(
                request_id=request_id,
                success=gen_result.quality_score > 0.3,
                response_type="generation",
                content=gen_result.generated_text,
                confidence=gen_result.quality_score,
                processing_time=0.0,
                system_used="generation",
                metadata={
                    "model_used": gen_result.model_used,
                    "quality_score": gen_result.quality_score
                }
            )
            
        except Exception as e:
            logger.error(f"Error in generation processing: {e}")
            return UnifiedResponse(
                request_id=request_id,
                success=False,
                response_type="generation",
                content="텍스트 생성 중 오류가 발생했습니다.",
                confidence=0.0,
                processing_time=0.0,
                system_used="generation"
            )
    
    async def _process_command(self, request: UnifiedRequest, request_id: str) -> UnifiedResponse:
        """Process command request"""
        try:
            command_system = self.systems['command']
            
            # Process command
            command_result = await command_system.process_text_command(request.content)
            
            return UnifiedResponse(
                request_id=request_id,
                success=command_result.success,
                response_type="command",
                content=command_result.output,
                confidence=0.8 if command_result.success else 0.2,
                processing_time=0.0,
                system_used="command",
                metadata={
                    "execution_result": command_result.result.value,
                    "error_message": command_result.error_message
                }
            )
            
        except Exception as e:
            logger.error(f"Error in command processing: {e}")
            return UnifiedResponse(
                request_id=request_id,
                success=False,
                response_type="command",
                content="명령 처리 중 오류가 발생했습니다.",
                confidence=0.0,
                processing_time=0.0,
                system_used="command"
            )
    
    async def _process_analysis(self, request: UnifiedRequest, request_id: str) -> UnifiedResponse:
        """Process analysis request"""
        try:
            nlp_system = self.systems['nlp']
            
            # Perform NLP analysis
            analysis_result = nlp_system.analyze_text(request.content)
            
            # Format analysis result
            analysis_text = "텍스트 분석 결과:\n\n"
            
            # Basic info
            if 'basic_stats' in analysis_result:
                stats = analysis_result['basic_stats']
                analysis_text += f"• 문장 수: {stats.get('sentence_count', 0)}\n"
                analysis_text += f"• 단어 수: {stats.get('word_count', 0)}\n"
                analysis_text += f"• 문자 수: {stats.get('char_count', 0)}\n\n"
            
            # Sentiment
            if 'sentiment' in analysis_result:
                sentiment = analysis_result['sentiment']
                analysis_text += f"• 감정: {sentiment.get('polarity', 'neutral')} "
                analysis_text += f"(점수: {sentiment.get('score', 0):.3f})\n\n"
            
            # Keywords
            if 'keywords' in analysis_result:
                keywords = analysis_result['keywords'][:5]
                analysis_text += f"• 주요 키워드: {', '.join(keywords)}\n\n"
            
            # Topics
            if 'topics' in analysis_result:
                topics = analysis_result['topics'][:3]
                analysis_text += f"• 주제: {', '.join(topics)}\n"
            
            return UnifiedResponse(
                request_id=request_id,
                success=True,
                response_type="analysis",
                content=analysis_text,
                confidence=0.9,
                processing_time=0.0,
                system_used="nlp",
                metadata=analysis_result
            )
            
        except Exception as e:
            logger.error(f"Error in analysis processing: {e}")
            return UnifiedResponse(
                request_id=request_id,
                success=False,
                response_type="analysis", 
                content="텍스트 분석 중 오류가 발생했습니다.",
                confidence=0.0,
                processing_time=0.0,
                system_used="nlp"
            )
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of all systems"""
        health_status = {
            "overall": "healthy",
            "systems": {},
            "timestamp": datetime.now().isoformat()
        }
        
        unhealthy_systems = 0
        
        for system_name, status in self.system_status.items():
            try:
                # Simple health check - verify system is accessible
                system = self.systems.get(system_name)
                if system:
                    status.health = "healthy"
                    status.status = "running"
                else:
                    status.health = "unhealthy"
                    status.status = "error"
                    unhealthy_systems += 1
                
                status.last_check = datetime.now()
                
                health_status["systems"][system_name] = {
                    "name": status.name,
                    "status": status.status,
                    "health": status.health,
                    "port": status.port,
                    "last_check": status.last_check.isoformat(),
                    "error_message": status.error_message
                }
                
            except Exception as e:
                status.health = "unhealthy"
                status.status = "error"
                status.error_message = str(e)
                unhealthy_systems += 1
                
                health_status["systems"][system_name] = {
                    "name": status.name,
                    "status": "error",
                    "health": "unhealthy",
                    "port": status.port,
                    "last_check": datetime.now().isoformat(),
                    "error_message": str(e)
                }
        
        # Set overall health
        if unhealthy_systems == 0:
            health_status["overall"] = "healthy"
        elif unhealthy_systems < len(self.systems) / 2:
            health_status["overall"] = "degraded" 
        else:
            health_status["overall"] = "unhealthy"
        
        health_status["healthy_systems"] = len(self.systems) - unhealthy_systems
        health_status["total_systems"] = len(self.systems)
        
        return health_status

# FastAPI application
app = FastAPI(
    title="NLP Master Server - Unified Interface",
    description="통합 자연어 처리 시스템",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global master server instance
master_server = NLPMasterServer()

@app.on_event("startup")
async def startup_event():
    """Initialize master server on startup"""
    logger.info("NLP Master Server starting up...")

@app.post("/api/process")
async def process_request(request_data: Dict[str, Any]):
    """Process unified NLP request"""
    try:
        request = UnifiedRequest(
            user_id=request_data['user_id'],
            session_id=request_data['session_id'],
            content=request_data['content'],
            request_type=request_data.get('request_type', 'conversation'),
            language=request_data.get('language', 'ko'),
            metadata=request_data.get('metadata', {})
        )
        
        response = await master_server.process_unified_request(request)
        
        return {
            "request_id": response.request_id,
            "success": response.success,
            "response_type": response.response_type,
            "content": response.content,
            "confidence": response.confidence,
            "processing_time": response.processing_time,
            "system_used": response.system_used,
            "metadata": response.metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Get system health status"""
    try:
        health_status = await master_server.health_check()
        return health_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/systems")
async def get_systems_info():
    """Get information about all NLP systems"""
    try:
        systems_info = {}
        
        for system_name, status in master_server.system_status.items():
            systems_info[system_name] = {
                "name": status.name,
                "status": status.status,
                "health": status.health,
                "port": status.port,
                "last_check": status.last_check.isoformat()
            }
        
        return {
            "systems": systems_info,
            "total_systems": len(systems_info),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_request_history(limit: int = 50):
    """Get request processing history"""
    try:
        history = master_server.request_history[-limit:]
        return {
            "history": history,
            "total": len(history),
            "showing": min(limit, len(history))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/conversation")
async def conversation_endpoint(request_data: Dict[str, Any]):
    """Dedicated conversation endpoint"""
    request_data['request_type'] = 'conversation'
    return await process_request(request_data)

@app.post("/api/search")
async def search_endpoint(request_data: Dict[str, Any]):
    """Dedicated search endpoint"""
    request_data['request_type'] = 'search'
    return await process_request(request_data)

@app.post("/api/generate")
async def generation_endpoint(request_data: Dict[str, Any]):
    """Dedicated generation endpoint"""
    request_data['request_type'] = 'generation'
    return await process_request(request_data)

@app.post("/api/command")
async def command_endpoint(request_data: Dict[str, Any]):
    """Dedicated command endpoint"""
    request_data['request_type'] = 'command'
    return await process_request(request_data)

@app.post("/api/analyze")
async def analysis_endpoint(request_data: Dict[str, Any]):
    """Dedicated analysis endpoint"""
    request_data['request_type'] = 'analysis'
    return await process_request(request_data)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time NLP processing"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get('type') == 'process':
                request = UnifiedRequest(
                    user_id=data['user_id'],
                    session_id=data['session_id'],
                    content=data['content'],
                    request_type=data.get('request_type', 'conversation'),
                    language=data.get('language', 'ko'),
                    metadata=data.get('metadata', {})
                )
                
                response = await master_server.process_unified_request(request)
                
                await websocket.send_json({
                    'type': 'response',
                    'request_id': response.request_id,
                    'success': response.success,
                    'content': response.content,
                    'confidence': response.confidence,
                    'processing_time': response.processing_time,
                    'system_used': response.system_used
                })
            
            elif data.get('type') == 'health_check':
                health_status = await master_server.health_check()
                await websocket.send_json({
                    'type': 'health_status',
                    'status': health_status
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    _nlp = int(
        os.environ.get("NLP_MASTER_SERVER_PORT", os.environ.get("PORT", "8000"))
    )
    uvicorn.run(app, host="0.0.0.0", port=_nlp) 