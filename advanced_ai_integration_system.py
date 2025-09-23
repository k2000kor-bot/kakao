#!/usr/bin/env python3
"""
고급 AI 통합 시스템
- ChatGPT, Claude, Gemini 등 다중 AI 모델 통합
- 실시간 모델 성능 비교 및 최적화
- 지능형 응답 생성 및 품질 평가
- 자동 학습 및 개선 시스템
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum

import aiohttp
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIModel(Enum):
    """AI 모델 유형"""
    CHATGPT = "chatgpt"
    CLAUDE = "claude"
    GEMINI = "gemini"
    LOCAL_LLM = "local_llm"

class ResponseQuality(Enum):
    """응답 품질"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

@dataclass
class AIProvider:
    """AI 제공자"""
    name: str
    model: AIModel
    api_key: Optional[str]
    base_url: str
    max_tokens: int
    temperature: float
    is_active: bool = True
    response_time: float = 0.0
    success_rate: float = 1.0
    cost_per_token: float = 0.0

@dataclass
class AIResponse:
    """AI 응답"""
    provider: str
    model: str
    response: str
    response_time: float
    quality_score: float
    yoo_relevance: float
    learning_value: float
    timestamp: str
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class LearningInsight:
    """학습 인사이트"""
    insight_id: str
    topic: str
    insight_type: str  # "pattern", "improvement", "optimization"
    description: str
    confidence: float
    actionable_items: List[str]
    created_at: str

class AdvancedAIIntegrationSystem:
    """고급 AI 통합 시스템"""
    
    def __init__(self):
        self.providers = self._initialize_providers()
        self.response_history: List[AIResponse] = []
        self.learning_insights: List[LearningInsight] = []
        self.session = None
        self.performance_metrics = self._initialize_metrics()
        
    def _initialize_providers(self) -> Dict[str, AIProvider]:
        """AI 제공자 초기화"""
        return {
            "openai": AIProvider(
                name="OpenAI",
                model=AIModel.CHATGPT,
                api_key=os.getenv("OPENAI_API_KEY"),
                base_url="https://api.openai.com/v1/chat/completions",
                max_tokens=2000,
                temperature=0.7
            ),
            "anthropic": AIProvider(
                name="Anthropic",
                model=AIModel.CLAUDE,
                api_key=os.getenv("ANTHROPIC_API_KEY"),
                base_url="https://api.anthropic.com/v1/messages",
                max_tokens=2000,
                temperature=0.7
            ),
            "google": AIProvider(
                name="Google",
                model=AIModel.GEMINI,
                api_key=os.getenv("GOOGLE_API_KEY"),
                base_url="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                max_tokens=2000,
                temperature=0.7
            ),
            "local": AIProvider(
                name="Local LLM",
                model=AIModel.LOCAL_LLM,
                api_key=None,
                base_url="http://localhost:11434/api/generate",  # Ollama 기본 주소
                max_tokens=2000,
                temperature=0.7
            )
        }
    
    def _initialize_metrics(self) -> Dict[str, List[float]]:
        """성능 메트릭 초기화"""
        return {
            "response_times": [],
            "quality_scores": [],
            "yoo_relevance_scores": [],
            "learning_values": [],
            "cost_tracking": []
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def generate_optimal_response(
        self, 
        message: str, 
        context: Dict[str, Any] = None,
        preferred_provider: Optional[str] = None
    ) -> AIResponse:
        """최적 응답 생성"""
        try:
            # 활성 제공자 선택
            active_providers = [name for name, provider in self.providers.items() 
                              if provider.is_active and provider.api_key]
            
            if not active_providers:
                # 시뮬레이션 모드
                return await self._generate_simulated_response(message, context)
            
            # 선호 제공자가 있으면 우선 사용
            if preferred_provider and preferred_provider in active_providers:
                selected_provider = preferred_provider
            else:
                # 성능 기반 선택
                selected_provider = self._select_best_provider(active_providers)
            
            # 응답 생성
            response = await self._generate_response_with_provider(
                selected_provider, message, context
            )
            
            # 품질 평가
            response.quality_score = await self._evaluate_response_quality(response)
            response.yoo_relevance = await self._evaluate_yoo_relevance(response)
            response.learning_value = await self._evaluate_learning_value(response)
            
            # 응답 히스토리에 추가
            self.response_history.append(response)
            
            # 성능 메트릭 업데이트
            self._update_performance_metrics(response)
            
            # 학습 인사이트 생성
            await self._generate_learning_insights(response, context)
            
            return response
            
        except Exception as e:
            logger.error(f"최적 응답 생성 오류: {e}")
            return await self._generate_fallback_response(message, context)
    
    async def _generate_response_with_provider(
        self, 
        provider_name: str, 
        message: str, 
        context: Dict[str, Any]
    ) -> AIResponse:
        """특정 제공자로 응답 생성"""
        provider = self.providers[provider_name]
        start_time = time.time()
        
        try:
            if provider.model == AIModel.CHATGPT:
                response_data = await self._call_chatgpt(provider, message, context)
            elif provider.model == AIModel.CLAUDE:
                response_data = await self._call_claude(provider, message, context)
            elif provider.model == AIModel.GEMINI:
                response_data = await self._call_gemini(provider, message, context)
            elif provider.model == AIModel.LOCAL_LLM:
                response_data = await self._call_local_llm(provider, message, context)
            else:
                raise ValueError(f"지원하지 않는 모델: {provider.model}")
            
            response_time = time.time() - start_time
            
            return AIResponse(
                provider=provider_name,
                model=provider.model.value,
                response=response_data.get("content", ""),
                response_time=response_time,
                quality_score=0.0,  # 나중에 평가
                yoo_relevance=0.0,
                learning_value=0.0,
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata=response_data.get("metadata", {})
            )
            
        except Exception as e:
            logger.error(f"{provider_name} 응답 생성 오류: {e}")
            provider.success_rate = max(0.0, provider.success_rate - 0.1)
            raise
    
    async def _call_chatgpt(self, provider: AIProvider, message: str, context: Dict) -> Dict:
        """ChatGPT API 호출"""
        headers = {
            "Authorization": f"Bearer {provider.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-4",
            "messages": [
                {"role": "system", "content": "당신은 유시민의 사상과 스타일을 분석하고 답변하는 전문가입니다."},
                {"role": "user", "content": message}
            ],
            "max_tokens": provider.max_tokens,
            "temperature": provider.temperature
        }
        
        async with self.session.post(provider.base_url, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                return {
                    "content": result["choices"][0]["message"]["content"],
                    "metadata": {
                        "usage": result.get("usage", {}),
                        "model": result.get("model", "gpt-4")
                    }
                }
            else:
                raise Exception(f"ChatGPT API 오류: {response.status}")
    
    async def _call_claude(self, provider: AIProvider, message: str, context: Dict) -> Dict:
        """Claude API 호출"""
        headers = {
            "x-api-key": provider.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        data = {
            "model": "claude-3-sonnet-20240229",
            "max_tokens": provider.max_tokens,
            "messages": [
                {"role": "user", "content": message}
            ]
        }
        
        async with self.session.post(provider.base_url, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                return {
                    "content": result["content"][0]["text"],
                    "metadata": {
                        "usage": result.get("usage", {}),
                        "model": result.get("model", "claude-3-sonnet")
                    }
                }
            else:
                raise Exception(f"Claude API 오류: {response.status}")
    
    async def _call_gemini(self, provider: AIProvider, message: str, context: Dict) -> Dict:
        """Gemini API 호출"""
        url = f"{provider.base_url}?key={provider.api_key}"
        
        data = {
            "contents": [{
                "parts": [{"text": message}]
            }],
            "generationConfig": {
                "maxOutputTokens": provider.max_tokens,
                "temperature": provider.temperature
            }
        }
        
        async with self.session.post(url, json=data) as response:
            if response.status == 200:
                result = await response.json()
                return {
                    "content": result["candidates"][0]["content"]["parts"][0]["text"],
                    "metadata": {
                        "usage": result.get("usageMetadata", {}),
                        "model": "gemini-pro"
                    }
                }
            else:
                raise Exception(f"Gemini API 오류: {response.status}")
    
    async def _call_local_llm(self, provider: AIProvider, message: str, context: Dict) -> Dict:
        """로컬 LLM 호출 (Ollama 등)"""
        data = {
            "model": "llama2",
            "prompt": message,
            "stream": False
        }
        
        async with self.session.post(provider.base_url, json=data) as response:
            if response.status == 200:
                result = await response.json()
                return {
                    "content": result["response"],
                    "metadata": {
                        "model": result.get("model", "llama2"),
                        "done": result.get("done", True)
                    }
                }
            else:
                raise Exception(f"로컬 LLM 오류: {response.status}")
    
    async def _generate_simulated_response(self, message: str, context: Dict) -> AIResponse:
        """시뮬레이션 응답 생성"""
        await asyncio.sleep(1)  # 실제 API 호출 시뮬레이션
        
        simulated_response = f"""
그런데 말이죠, {message}에 대해 말씀드리겠습니다.

여기서 중요한 것은 우리가 이런 질문을 던지고 있다는 사실 자체입니다. 이것은 우리가 더 나은 이해를 추구하고 있다는 증거이기 때문입니다.

따라서 우리는 이런 관점에서 접근해볼 필요가 있습니다.

그런데 말이죠, 이것이 쉽지 않습니다. 하지만 우리가 노력해야 할 가치입니다.

여기서 핵심은 함께 생각하고 토론하는 것입니다.

따라서 우리는 더 나은 이해에 도달할 수 있을 것입니다.

함께 생각해보는 것이 진정한 학습의 의미라고 생각합니다.
"""
        
        return AIResponse(
            provider="simulation",
            model="simulated",
            response=simulated_response,
            response_time=1.0,
            quality_score=0.8,
            yoo_relevance=0.9,
            learning_value=0.7,
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata={"simulation": True}
        )
    
    async def _generate_fallback_response(self, message: str, context: Dict) -> AIResponse:
        """폴백 응답 생성"""
        fallback_response = f"""
안녕하세요! "{message}"에 대해 답변드리겠습니다.

현재 AI 시스템이 일시적으로 사용할 수 없는 상태입니다. 하지만 기본적인 답변을 제공해드리겠습니다.

귀하의 질문에 대한 답변을 제공해드리겠습니다.

현재 시스템은 다음과 같은 기능을 제공합니다:
- **고급 AI 통합**: 여러 AI 모델의 장점을 결합
- **실시간 성능 최적화**: 지속적인 학습과 개선
- **품질 평가**: 응답의 품질과 관련성 자동 평가
- **학습 인사이트**: 사용자 피드백 기반 개선

더 구체적인 도움이 필요하시다면 다시 시도해주세요.

---
*고급 AI 통합 시스템이 제공하는 지능형 서비스입니다*
"""
        
        return AIResponse(
            provider="fallback",
            model="fallback",
            response=fallback_response,
            response_time=0.1,
            quality_score=0.5,
            yoo_relevance=0.3,
            learning_value=0.4,
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata={"fallback": True}
        )
    
    def _select_best_provider(self, active_providers: List[str]) -> str:
        """최적 제공자 선택"""
        best_provider = active_providers[0]
        best_score = 0.0
        
        for provider_name in active_providers:
            provider = self.providers[provider_name]
            
            # 성능 점수 계산 (응답 시간, 성공률, 비용 고려)
            response_time_score = max(0, 1.0 - provider.response_time / 10)  # 10초 기준
            success_rate_score = provider.success_rate
            cost_score = max(0, 1.0 - provider.cost_per_token * 1000)  # 비용 역산
            
            total_score = (response_time_score * 0.4 + 
                          success_rate_score * 0.4 + 
                          cost_score * 0.2)
            
            if total_score > best_score:
                best_score = total_score
                best_provider = provider_name
        
        return best_provider
    
    async def _evaluate_response_quality(self, response: AIResponse) -> float:
        """응답 품질 평가"""
        quality_score = 0.0
        
        # 길이 점수
        length_score = min(1.0, len(response.response) / 500)
        quality_score += length_score * 0.2
        
        # 구조 점수 (문단, 문장 구조)
        paragraphs = response.response.count('\n\n')
        structure_score = min(1.0, paragraphs / 3)
        quality_score += structure_score * 0.2
        
        # 유시민 패턴 점수
        yoo_patterns = ["그런데 말이죠", "여기서 중요한 것은", "따라서", "함께 생각해보면"]
        pattern_count = sum(1 for pattern in yoo_patterns if pattern in response.response)
        pattern_score = min(1.0, pattern_count / len(yoo_patterns))
        quality_score += pattern_score * 0.3
        
        # 응답 시간 점수
        time_score = max(0, 1.0 - response.response_time / 5)  # 5초 기준
        quality_score += time_score * 0.3
        
        return min(quality_score, 1.0)
    
    async def _evaluate_yoo_relevance(self, response: AIResponse) -> float:
        """유시민 관련성 평가"""
        relevance_score = 0.0
        
        # 키워드 기반 점수
        yoo_keywords = ["민주주의", "교육", "사회", "역사", "정치", "시민", "참여", "발전"]
        keyword_count = sum(1 for keyword in yoo_keywords if keyword in response.response)
        relevance_score += min(1.0, keyword_count / len(yoo_keywords)) * 0.4
        
        # 언어 패턴 점수
        yoo_patterns = ["그런데 말이죠", "여기서 중요한 것은", "따라서", "함께 생각해보면"]
        pattern_count = sum(1 for pattern in yoo_patterns if pattern in response.response)
        relevance_score += min(1.0, pattern_count / len(yoo_patterns)) * 0.3
        
        # 토론 유도 점수
        question_count = response.response.count('?')
        discussion_score = min(1.0, question_count / 3)
        relevance_score += discussion_score * 0.3
        
        return min(relevance_score, 1.0)
    
    async def _evaluate_learning_value(self, response: AIResponse) -> float:
        """학습 가치 평가"""
        learning_score = 0.0
        
        # 교육적 키워드 점수
        educational_keywords = ["학습", "이해", "탐구", "분석", "비교", "사고", "논리", "근거"]
        keyword_count = sum(1 for keyword in educational_keywords if keyword in response.response)
        learning_score += min(1.0, keyword_count / len(educational_keywords)) * 0.4
        
        # 구조적 완성도 점수
        has_introduction = "그런데 말이죠" in response.response or "여기서" in response.response
        has_conclusion = "따라서" in response.response or "함께 생각해보면" in response.response
        has_questions = "?" in response.response
        
        structure_score = sum([has_introduction, has_conclusion, has_questions]) / 3
        learning_score += structure_score * 0.3
        
        # 깊이 점수 (문장 길이, 복잡성)
        sentences = response.response.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        depth_score = min(1.0, avg_sentence_length / 20)
        learning_score += depth_score * 0.3
        
        return min(learning_score, 1.0)
    
    def _update_performance_metrics(self, response: AIResponse):
        """성능 메트릭 업데이트"""
        self.performance_metrics["response_times"].append(response.response_time)
        self.performance_metrics["quality_scores"].append(response.quality_score)
        self.performance_metrics["yoo_relevance_scores"].append(response.yoo_relevance)
        self.performance_metrics["learning_values"].append(response.learning_value)
        
        # 최근 100개만 유지
        for key in self.performance_metrics:
            if len(self.performance_metrics[key]) > 100:
                self.performance_metrics[key] = self.performance_metrics[key][-100:]
    
    async def _generate_learning_insights(self, response: AIResponse, context: Dict):
        """학습 인사이트 생성"""
        # 응답 품질 기반 인사이트
        if response.quality_score > 0.8:
            insight = LearningInsight(
                insight_id=f"insight_{int(time.time())}",
                topic="응답 품질",
                insight_type="pattern",
                description=f"{response.provider}에서 고품질 응답 생성 패턴 발견",
                confidence=response.quality_score,
                actionable_items=[
                    f"{response.provider} 모델의 설정 최적화",
                    "고품질 응답 패턴을 다른 모델에 적용"
                ],
                created_at=datetime.now(timezone.utc).isoformat()
            )
            self.learning_insights.append(insight)
        
        # 유시민 관련성 기반 인사이트
        if response.yoo_relevance > 0.8:
            insight = LearningInsight(
                insight_id=f"insight_{int(time.time()) + 1}",
                topic="유시민 스타일",
                insight_type="improvement",
                description=f"{response.provider}에서 높은 유시민 관련성 달성",
                confidence=response.yoo_relevance,
                actionable_items=[
                    f"{response.provider} 모델의 프롬프트 개선",
                    "유시민 스타일 학습 데이터 확장"
                ],
                created_at=datetime.now(timezone.utc).isoformat()
            )
            self.learning_insights.append(insight)
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """성능 요약 조회"""
        summary = {}
        
        for metric_name, values in self.performance_metrics.items():
            if values:
                summary[metric_name] = {
                    "average": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values)
                }
            else:
                summary[metric_name] = {
                    "average": 0,
                    "min": 0,
                    "max": 0,
                    "count": 0
                }
        
        # 제공자별 성능
        provider_performance = {}
        for name, provider in self.providers.items():
            provider_performance[name] = {
                "is_active": provider.is_active,
                "success_rate": provider.success_rate,
                "avg_response_time": provider.response_time,
                "cost_per_token": provider.cost_per_token
            }
        
        summary["provider_performance"] = provider_performance
        summary["total_responses"] = len(self.response_history)
        summary["total_insights"] = len(self.learning_insights)
        
        return summary

# FastAPI 앱 생성
app = FastAPI(
    title="고급 AI 통합 시스템",
    description="다중 AI 모델 통합 및 최적화 시스템",
    version="2.0.0"
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
ai_integration_system = AdvancedAIIntegrationSystem()

class AIRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    preferred_provider: Optional[str] = None

class AIResponseModel(BaseModel):
    success: bool
    response: str
    provider: str
    model: str
    response_time: float
    quality_score: float
    yoo_relevance: float
    learning_value: float
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None

@app.post("/api/ai/generate", response_model=AIResponseModel)
async def generate_ai_response(request: AIRequest):
    """AI 응답 생성"""
    try:
        async with ai_integration_system:
            ai_response = await ai_integration_system.generate_optimal_response(
                request.message,
                request.context,
                request.preferred_provider
            )
            
            return AIResponseModel(
                success=True,
                response=ai_response.response,
                provider=ai_response.provider,
                model=ai_response.model,
                response_time=ai_response.response_time,
                quality_score=ai_response.quality_score,
                yoo_relevance=ai_response.yoo_relevance,
                learning_value=ai_response.learning_value,
                timestamp=ai_response.timestamp,
                metadata=ai_response.metadata
            )
            
    except Exception as e:
        logger.error(f"AI 응답 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/performance")
async def get_ai_performance():
    """AI 성능 분석 조회"""
    try:
        performance_summary = ai_integration_system.get_performance_summary()
        
        return {
            "success": True,
            "performance": performance_summary
        }
    except Exception as e:
        logger.error(f"AI 성능 분석 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/insights")
async def get_learning_insights():
    """학습 인사이트 조회"""
    try:
        insights = [
            {
                "insight_id": insight.insight_id,
                "topic": insight.topic,
                "insight_type": insight.insight_type,
                "description": insight.description,
                "confidence": insight.confidence,
                "actionable_items": insight.actionable_items,
                "created_at": insight.created_at
            }
            for insight in ai_integration_system.learning_insights
        ]
        
        return {
            "success": True,
            "insights": insights,
            "total_count": len(insights)
        }
    except Exception as e:
        logger.error(f"학습 인사이트 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "고급 AI 통합 시스템",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "다중 AI 모델 통합 (ChatGPT, Claude, Gemini, Local LLM)",
            "실시간 성능 비교 및 최적화",
            "지능형 응답 생성 및 품질 평가",
            "자동 학습 및 개선 시스템",
            "비용 효율성 최적화",
            "실시간 성능 모니터링",
            "학습 인사이트 자동 생성",
            "폴백 및 시뮬레이션 모드"
        ],
        "supported_models": {
            "openai": "ChatGPT-4",
            "anthropic": "Claude-3-Sonnet",
            "google": "Gemini-Pro",
            "local": "Local LLM (Ollama)"
        },
        "endpoints": {
            "generate_response": "/api/ai/generate",
            "performance_analysis": "/api/ai/performance",
            "learning_insights": "/api/ai/insights",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 고급 AI 통합 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8006")
    logger.info("📚 API 문서: http://localhost:8006/docs")
    logger.info("🤖 지원 모델:")
    logger.info("   - OpenAI ChatGPT-4")
    logger.info("   - Anthropic Claude-3-Sonnet")
    logger.info("   - Google Gemini-Pro")
    logger.info("   - Local LLM (Ollama)")
    logger.info("⚡ 실시간 성능 최적화 활성화")
    logger.info("🧠 자동 학습 및 개선 시스템 활성화")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8006,
        reload=False,
        log_level="info"
    )
