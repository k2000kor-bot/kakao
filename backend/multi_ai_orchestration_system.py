"""
다중 AI 모델 오케스트레이션 시스템
- 여러 AI 모델 (GPT, Claude, Gemini, etc.) 통합 관리
- 동적 모델 선택 및 로드 밸런싱
- 응답 품질 평가 및 최적화
- 모델 성능 모니터링 및 분석
- 장애 복구 및 백업 모델 전환
"""

import asyncio
import json
import time
import uuid
import statistics
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
import aiohttp
import openai
import anthropic
import google.generativeai as genai
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging
from concurrent.futures import ThreadPoolExecutor
import hashlib

# AI 모델 타입
class ModelType(Enum):
    GPT = "gpt"
    CLAUDE = "claude"
    GEMINI = "gemini"
    HUGGINGFACE = "huggingface"
    LOCAL = "local"

# 요청 타입
class RequestType(Enum):
    CHAT = "chat"
    COMPLETION = "completion"
    EMBEDDING = "embedding"
    CLASSIFICATION = "classification"
    TRANSLATION = "translation"
    SUMMARIZATION = "summarization"

# 모델 상태
class ModelStatus(Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    ERROR = "error"
    MAINTENANCE = "maintenance"

@dataclass
class ModelMetrics:
    """모델 성능 메트릭스"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    total_response_time: float = 0.0
    total_tokens_used: int = 0
    cost_usd: float = 0.0
    quality_scores: List[float] = field(default_factory=list)
    last_request_time: datetime = field(default_factory=datetime.now)
    
    @property
    def success_rate(self) -> float:
        return self.successful_requests / max(self.total_requests, 1)
    
    @property
    def average_response_time(self) -> float:
        return self.total_response_time / max(self.successful_requests, 1)
    
    @property
    def average_quality_score(self) -> float:
        return statistics.mean(self.quality_scores) if self.quality_scores else 0.0
    
    @property
    def tokens_per_request(self) -> float:
        return self.total_tokens_used / max(self.successful_requests, 1)

@dataclass
class AIModelConfig:
    """AI 모델 설정"""
    model_id: str
    model_type: ModelType
    model_name: str
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    max_tokens: int = 4096
    temperature: float = 0.7
    cost_per_token: float = 0.0
    priority: int = 1  # 낮을수록 높은 우선순위
    capabilities: List[RequestType] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AIModel:
    """AI 모델 인스턴스"""
    config: AIModelConfig
    status: ModelStatus = ModelStatus.AVAILABLE
    metrics: ModelMetrics = field(default_factory=ModelMetrics)
    client: Optional[Any] = None
    last_health_check: datetime = field(default_factory=datetime.now)
    
    @property
    def is_healthy(self) -> bool:
        health_threshold = datetime.now() - timedelta(minutes=5)
        return (self.status == ModelStatus.AVAILABLE and 
                self.last_health_check > health_threshold)

class ResponseQualityEvaluator:
    """응답 품질 평가기"""
    
    def __init__(self):
        self.evaluation_models = {}
        self.quality_criteria = {
            "relevance": 0.3,
            "accuracy": 0.3,
            "completeness": 0.2,
            "coherence": 0.2
        }
    
    async def evaluate_response(self, prompt: str, response: str, 
                              context: Optional[str] = None) -> float:
        """응답 품질 평가"""
        try:
            scores = {}
            
            # 관련성 평가
            scores["relevance"] = await self._evaluate_relevance(prompt, response)
            
            # 정확성 평가
            scores["accuracy"] = await self._evaluate_accuracy(response, context)
            
            # 완성도 평가
            scores["completeness"] = await self._evaluate_completeness(prompt, response)
            
            # 일관성 평가
            scores["coherence"] = await self._evaluate_coherence(response)
            
            # 가중 평균 계산
            total_score = sum(
                scores[criterion] * weight 
                for criterion, weight in self.quality_criteria.items()
            )
            
            return min(max(total_score, 0.0), 1.0)
            
        except Exception as e:
            logging.error(f"품질 평가 오류: {e}")
            return 0.5  # 기본값
    
    async def _evaluate_relevance(self, prompt: str, response: str) -> float:
        """관련성 평가"""
        try:
            # 간단한 키워드 기반 관련성 평가
            prompt_words = set(prompt.lower().split())
            response_words = set(response.lower().split())
            
            if not prompt_words:
                return 0.5
            
            common_words = prompt_words.intersection(response_words)
            relevance_score = len(common_words) / len(prompt_words)
            
            return min(relevance_score, 1.0)
            
        except Exception:
            return 0.5
    
    async def _evaluate_accuracy(self, response: str, context: Optional[str]) -> float:
        """정확성 평가"""
        try:
            # 기본적인 정확성 평가 (길이, 구조 등)
            if not response.strip():
                return 0.0
            
            # 응답 길이 평가
            length_score = min(len(response) / 1000, 1.0)
            
            # 문장 구조 평가
            sentences = response.split('.')
            structure_score = min(len(sentences) / 10, 1.0)
            
            return (length_score + structure_score) / 2
            
        except Exception:
            return 0.5
    
    async def _evaluate_completeness(self, prompt: str, response: str) -> float:
        """완성도 평가"""
        try:
            # 질문 유형 분석
            question_indicators = ['what', 'how', 'why', 'when', 'where', 'who']
            prompt_lower = prompt.lower()
            
            question_types = [q for q in question_indicators if q in prompt_lower]
            
            if not question_types:
                return 0.8  # 질문이 아닌 경우
            
            # 응답이 각 질문 유형에 대답하는지 확인
            response_lower = response.lower()
            answered_types = sum(1 for q in question_types if any(
                keyword in response_lower for keyword in [q, f"{q}는", f"{q}은"]
            ))
            
            return answered_types / len(question_types) if question_types else 0.8
            
        except Exception:
            return 0.5
    
    async def _evaluate_coherence(self, response: str) -> float:
        """일관성 평가"""
        try:
            sentences = [s.strip() for s in response.split('.') if s.strip()]
            
            if len(sentences) < 2:
                return 0.8
            
            # 문장 간 연결성 평가 (간단한 버전)
            coherence_indicators = ['그러나', '하지만', '따라서', '그래서', '또한', '그리고']
            
            coherence_count = sum(1 for sentence in sentences 
                                for indicator in coherence_indicators 
                                if indicator in sentence)
            
            coherence_score = min(coherence_count / (len(sentences) - 1), 1.0)
            
            return max(coherence_score, 0.3)  # 최소값 보장
            
        except Exception:
            return 0.5

class ModelSelector:
    """모델 선택기"""
    
    def __init__(self):
        self.selection_strategies = {
            "performance": self._select_by_performance,
            "cost": self._select_by_cost,
            "speed": self._select_by_speed,
            "quality": self._select_by_quality,
            "hybrid": self._select_hybrid
        }
    
    async def select_model(self, models: List[AIModel], request_type: RequestType,
                          strategy: str = "hybrid", **kwargs) -> Optional[AIModel]:
        """최적 모델 선택"""
        try:
            # 요청 타입을 지원하는 모델 필터링
            capable_models = [
                model for model in models 
                if (request_type in model.config.capabilities and 
                    model.is_healthy and 
                    model.status == ModelStatus.AVAILABLE)
            ]
            
            if not capable_models:
                return None
            
            # 선택 전략 적용
            if strategy in self.selection_strategies:
                return await self.selection_strategies[strategy](capable_models, **kwargs)
            else:
                return capable_models[0]  # 기본값
                
        except Exception as e:
            logging.error(f"모델 선택 오류: {e}")
            return None
    
    async def _select_by_performance(self, models: List[AIModel], **kwargs) -> AIModel:
        """성능 기반 선택"""
        return max(models, key=lambda m: m.metrics.success_rate)
    
    async def _select_by_cost(self, models: List[AIModel], **kwargs) -> AIModel:
        """비용 기반 선택"""
        return min(models, key=lambda m: m.config.cost_per_token)
    
    async def _select_by_speed(self, models: List[AIModel], **kwargs) -> AIModel:
        """속도 기반 선택"""
        return min(models, key=lambda m: m.metrics.average_response_time or float('inf'))
    
    async def _select_by_quality(self, models: List[AIModel], **kwargs) -> AIModel:
        """품질 기반 선택"""
        return max(models, key=lambda m: m.metrics.average_quality_score)
    
    async def _select_hybrid(self, models: List[AIModel], **kwargs) -> AIModel:
        """하이브리드 선택 (성능, 비용, 품질 종합)"""
        def score_model(model: AIModel) -> float:
            # 정규화된 점수 계산
            performance_score = model.metrics.success_rate
            quality_score = model.metrics.average_quality_score
            
            # 속도 점수 (역수)
            speed_score = 1.0 / (model.metrics.average_response_time + 1.0)
            
            # 비용 점수 (역수)
            cost_score = 1.0 / (model.config.cost_per_token + 0.001)
            
            # 가중 평균
            total_score = (performance_score * 0.3 + 
                          quality_score * 0.3 + 
                          speed_score * 0.2 + 
                          cost_score * 0.2)
            
            return total_score
        
        return max(models, key=score_model)

class AIModelClient:
    """AI 모델 클라이언트"""
    
    def __init__(self, model: AIModel):
        self.model = model
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """클라이언트 초기화"""
        try:
            if self.model.config.model_type == ModelType.GPT:
                openai.api_key = self.model.config.api_key
                self.client = openai
                
            elif self.model.config.model_type == ModelType.CLAUDE:
                self.client = anthropic.Anthropic(api_key=self.model.config.api_key)
                
            elif self.model.config.model_type == ModelType.GEMINI:
                genai.configure(api_key=self.model.config.api_key)
                self.client = genai.GenerativeModel(self.model.config.model_name)
                
            elif self.model.config.model_type == ModelType.HUGGINGFACE:
                self.client = pipeline(
                    "text-generation",
                    model=self.model.config.model_name,
                    device=0 if torch.cuda.is_available() else -1
                )
                
        except Exception as e:
            logging.error(f"클라이언트 초기화 오류: {e}")
            self.model.status = ModelStatus.ERROR
    
    async def generate_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """응답 생성"""
        start_time = time.time()
        
        try:
            self.model.status = ModelStatus.BUSY
            
            if self.model.config.model_type == ModelType.GPT:
                response = await self._generate_gpt_response(prompt, **kwargs)
            elif self.model.config.model_type == ModelType.CLAUDE:
                response = await self._generate_claude_response(prompt, **kwargs)
            elif self.model.config.model_type == ModelType.GEMINI:
                response = await self._generate_gemini_response(prompt, **kwargs)
            elif self.model.config.model_type == ModelType.HUGGINGFACE:
                response = await self._generate_huggingface_response(prompt, **kwargs)
            else:
                raise ValueError(f"지원하지 않는 모델 타입: {self.model.config.model_type}")
            
            response_time = time.time() - start_time
            
            # 메트릭스 업데이트
            self.model.metrics.total_requests += 1
            self.model.metrics.successful_requests += 1
            self.model.metrics.total_response_time += response_time
            self.model.metrics.last_request_time = datetime.now()
            
            if "tokens_used" in response:
                self.model.metrics.total_tokens_used += response["tokens_used"]
                self.model.metrics.cost_usd += (response["tokens_used"] * 
                                               self.model.config.cost_per_token)
            
            self.model.status = ModelStatus.AVAILABLE
            
            return {
                "success": True,
                "response": response["text"],
                "model_id": self.model.config.model_id,
                "response_time": response_time,
                "tokens_used": response.get("tokens_used", 0),
                "metadata": response.get("metadata", {})
            }
            
        except Exception as e:
            response_time = time.time() - start_time
            
            # 실패 메트릭스 업데이트
            self.model.metrics.total_requests += 1
            self.model.metrics.failed_requests += 1
            self.model.metrics.last_request_time = datetime.now()
            
            self.model.status = ModelStatus.ERROR
            
            logging.error(f"응답 생성 오류 ({self.model.config.model_id}): {e}")
            
            return {
                "success": False,
                "error": str(e),
                "model_id": self.model.config.model_id,
                "response_time": response_time
            }
    
    async def _generate_gpt_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """GPT 응답 생성"""
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.model.config.model_name,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=kwargs.get("max_tokens", self.model.config.max_tokens),
                temperature=kwargs.get("temperature", self.model.config.temperature)
            )
            
            return {
                "text": response.choices[0].message.content,
                "tokens_used": response.usage.total_tokens,
                "metadata": {
                    "model": response.model,
                    "finish_reason": response.choices[0].finish_reason
                }
            }
            
        except Exception as e:
            raise Exception(f"GPT API 오류: {e}")
    
    async def _generate_claude_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Claude 응답 생성"""
        try:
            response = await self.client.messages.create(
                model=self.model.config.model_name,
                max_tokens=kwargs.get("max_tokens", self.model.config.max_tokens),
                messages=[{"role": "user", "content": prompt}]
            )
            
            return {
                "text": response.content[0].text,
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
                "metadata": {
                    "model": response.model,
                    "stop_reason": response.stop_reason
                }
            }
            
        except Exception as e:
            raise Exception(f"Claude API 오류: {e}")
    
    async def _generate_gemini_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Gemini 응답 생성"""
        try:
            response = await self.client.generate_content_async(prompt)
            
            return {
                "text": response.text,
                "tokens_used": len(prompt.split()) + len(response.text.split()),  # 근사치
                "metadata": {
                    "model": self.model.config.model_name,
                    "finish_reason": "completed"
                }
            }
            
        except Exception as e:
            raise Exception(f"Gemini API 오류: {e}")
    
    async def _generate_huggingface_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """HuggingFace 응답 생성"""
        try:
            max_length = kwargs.get("max_tokens", self.model.config.max_tokens)
            
            # 비동기 실행을 위해 ThreadPoolExecutor 사용
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                result = await loop.run_in_executor(
                    executor,
                    lambda: self.client(
                        prompt,
                        max_length=max_length,
                        temperature=kwargs.get("temperature", self.model.config.temperature),
                        do_sample=True,
                        pad_token_id=self.client.tokenizer.eos_token_id
                    )
                )
            
            generated_text = result[0]["generated_text"]
            response_text = generated_text[len(prompt):].strip()
            
            return {
                "text": response_text,
                "tokens_used": len(generated_text.split()),
                "metadata": {
                    "model": self.model.config.model_name,
                    "finish_reason": "completed"
                }
            }
            
        except Exception as e:
            raise Exception(f"HuggingFace 모델 오류: {e}")

class MultiAIOrchestrator:
    """다중 AI 오케스트레이션 시스템"""
    
    def __init__(self):
        self.models: Dict[str, AIModel] = {}
        self.model_clients: Dict[str, AIModelClient] = {}
        self.model_selector = ModelSelector()
        self.quality_evaluator = ResponseQualityEvaluator()
        self.request_cache: Dict[str, Dict[str, Any]] = {}
        self.health_check_interval = 60
        
    async def initialize(self):
        """시스템 초기화"""
        # 기본 모델들 등록
        await self._register_default_models()
        
        # 헬스 체크 태스크 시작
        asyncio.create_task(self.health_check_loop())
        
        logging.info("다중 AI 오케스트레이션 시스템 초기화 완료")
    
    async def _register_default_models(self):
        """기본 모델들 등록"""
        default_models = [
            AIModelConfig(
                model_id="gpt-3.5-turbo",
                model_type=ModelType.GPT,
                model_name="gpt-3.5-turbo",
                cost_per_token=0.000002,
                priority=1,
                capabilities=[RequestType.CHAT, RequestType.COMPLETION, 
                            RequestType.TRANSLATION, RequestType.SUMMARIZATION]
            ),
            AIModelConfig(
                model_id="gpt-4",
                model_type=ModelType.GPT,
                model_name="gpt-4",
                cost_per_token=0.00003,
                priority=2,
                capabilities=[RequestType.CHAT, RequestType.COMPLETION, 
                            RequestType.TRANSLATION, RequestType.SUMMARIZATION]
            ),
            AIModelConfig(
                model_id="claude-3-sonnet",
                model_type=ModelType.CLAUDE,
                model_name="claude-3-sonnet-20240229",
                cost_per_token=0.000015,
                priority=1,
                capabilities=[RequestType.CHAT, RequestType.COMPLETION, 
                            RequestType.TRANSLATION, RequestType.SUMMARIZATION]
            ),
            AIModelConfig(
                model_id="gemini-pro",
                model_type=ModelType.GEMINI,
                model_name="gemini-pro",
                cost_per_token=0.000001,
                priority=3,
                capabilities=[RequestType.CHAT, RequestType.COMPLETION]
            )
        ]
        
        for config in default_models:
            await self.register_model(config)
    
    async def register_model(self, config: AIModelConfig) -> bool:
        """모델 등록"""
        try:
            model = AIModel(config=config)
            client = AIModelClient(model)
            
            self.models[config.model_id] = model
            self.model_clients[config.model_id] = client
            
            logging.info(f"모델 등록됨: {config.model_id}")
            return True
            
        except Exception as e:
            logging.error(f"모델 등록 오류: {e}")
            return False
    
    async def unregister_model(self, model_id: str) -> bool:
        """모델 등록 해제"""
        try:
            if model_id in self.models:
                del self.models[model_id]
            if model_id in self.model_clients:
                del self.model_clients[model_id]
            
            logging.info(f"모델 등록 해제됨: {model_id}")
            return True
            
        except Exception as e:
            logging.error(f"모델 등록 해제 오류: {e}")
            return False
    
    async def generate_response(self, prompt: str, request_type: RequestType = RequestType.CHAT,
                              selection_strategy: str = "hybrid", use_cache: bool = True,
                              evaluate_quality: bool = True, **kwargs) -> Dict[str, Any]:
        """응답 생성"""
        try:
            # 캐시 확인
            cache_key = hashlib.md5(f"{prompt}_{request_type}_{kwargs}".encode()).hexdigest()
            if use_cache and cache_key in self.request_cache:
                cache_data = self.request_cache[cache_key]
                if (datetime.now() - datetime.fromisoformat(cache_data["timestamp"])).seconds < 3600:
                    logging.info("캐시에서 응답 반환")
                    return cache_data["response"]
            
            # 모델 선택
            available_models = list(self.models.values())
            selected_model = await self.model_selector.select_model(
                available_models, request_type, selection_strategy, **kwargs
            )
            
            if not selected_model:
                raise Exception("사용 가능한 모델이 없습니다")
            
            # 응답 생성
            client = self.model_clients[selected_model.config.model_id]
            response = await client.generate_response(prompt, **kwargs)
            
            if not response["success"]:
                # 백업 모델 시도
                backup_model = await self._get_backup_model(selected_model, request_type)
                if backup_model:
                    backup_client = self.model_clients[backup_model.config.model_id]
                    response = await backup_client.generate_response(prompt, **kwargs)
            
            # 품질 평가
            if response["success"] and evaluate_quality:
                quality_score = await self.quality_evaluator.evaluate_response(
                    prompt, response["response"]
                )
                selected_model.metrics.quality_scores.append(quality_score)
                response["quality_score"] = quality_score
            
            # 캐시 저장
            if response["success"] and use_cache:
                self.request_cache[cache_key] = {
                    "response": response,
                    "timestamp": datetime.now().isoformat()
                }
            
            return response
            
        except Exception as e:
            logging.error(f"응답 생성 오류: {e}")
            return {
                "success": False,
                "error": str(e),
                "model_id": None,
                "response_time": 0
            }
    
    async def _get_backup_model(self, failed_model: AIModel, 
                              request_type: RequestType) -> Optional[AIModel]:
        """백업 모델 선택"""
        backup_models = [
            model for model in self.models.values()
            if (model.config.model_id != failed_model.config.model_id and
                request_type in model.config.capabilities and
                model.is_healthy)
        ]
        
        if backup_models:
            return await self.model_selector.select_model(
                backup_models, request_type, "performance"
            )
        
        return None
    
    async def batch_generate(self, prompts: List[str], request_type: RequestType = RequestType.CHAT,
                           max_concurrent: int = 5, **kwargs) -> List[Dict[str, Any]]:
        """배치 응답 생성"""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def generate_single(prompt: str) -> Dict[str, Any]:
            async with semaphore:
                return await self.generate_response(prompt, request_type, **kwargs)
        
        tasks = [generate_single(prompt) for prompt in prompts]
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 예외 처리
        processed_responses = []
        for i, response in enumerate(responses):
            if isinstance(response, Exception):
                processed_responses.append({
                    "success": False,
                    "error": str(response),
                    "prompt_index": i
                })
            else:
                processed_responses.append(response)
        
        return processed_responses
    
    async def health_check_loop(self):
        """주기적 헬스 체크"""
        while True:
            try:
                await asyncio.sleep(self.health_check_interval)
                
                for model_id, model in self.models.items():
                    try:
                        # 간단한 테스트 요청
                        client = self.model_clients[model_id]
                        test_response = await client.generate_response(
                            "테스트", max_tokens=10
                        )
                        
                        if test_response["success"]:
                            model.status = ModelStatus.AVAILABLE
                            model.last_health_check = datetime.now()
                        else:
                            model.status = ModelStatus.ERROR
                            
                    except Exception as e:
                        model.status = ModelStatus.ERROR
                        logging.warning(f"헬스 체크 실패: {model_id} - {e}")
                
            except Exception as e:
                logging.error(f"헬스 체크 루프 오류: {e}")
    
    async def get_models_status(self) -> Dict[str, Any]:
        """모델 상태 조회"""
        status = {}
        
        for model_id, model in self.models.items():
            status[model_id] = {
                "model_type": model.config.model_type.value,
                "model_name": model.config.model_name,
                "status": model.status.value,
                "capabilities": [cap.value for cap in model.config.capabilities],
                "metrics": {
                    "total_requests": model.metrics.total_requests,
                    "success_rate": model.metrics.success_rate,
                    "average_response_time": model.metrics.average_response_time,
                    "average_quality_score": model.metrics.average_quality_score,
                    "total_cost_usd": model.metrics.cost_usd,
                    "tokens_per_request": model.metrics.tokens_per_request
                },
                "last_health_check": model.last_health_check.isoformat(),
                "is_healthy": model.is_healthy
            }
        
        return status
    
    async def get_performance_analytics(self) -> Dict[str, Any]:
        """성능 분석 데이터"""
        analytics = {
            "total_models": len(self.models),
            "healthy_models": len([m for m in self.models.values() if m.is_healthy]),
            "total_requests": sum(m.metrics.total_requests for m in self.models.values()),
            "total_cost": sum(m.metrics.cost_usd for m in self.models.values()),
            "model_comparison": [],
            "request_type_distribution": {},
            "quality_trends": []
        }
        
        # 모델별 비교
        for model_id, model in self.models.items():
            analytics["model_comparison"].append({
                "model_id": model_id,
                "success_rate": model.metrics.success_rate,
                "average_response_time": model.metrics.average_response_time,
                "cost_efficiency": model.metrics.tokens_per_request / max(model.config.cost_per_token, 0.000001),
                "quality_score": model.metrics.average_quality_score
            })
        
        return analytics

# FastAPI 통합
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class GenerateRequest(BaseModel):
    prompt: str
    request_type: str = "chat"
    selection_strategy: str = "hybrid"
    use_cache: bool = True
    evaluate_quality: bool = True
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None

class BatchGenerateRequest(BaseModel):
    prompts: List[str]
    request_type: str = "chat"
    max_concurrent: int = 5
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None

# AI 오케스트레이터 인스턴스
orchestrator = None

async def get_orchestrator():
    global orchestrator
    if orchestrator is None:
        orchestrator = MultiAIOrchestrator()
        await orchestrator.initialize()
    return orchestrator

# API 엔드포인트들
async def create_ai_orchestration_app() -> FastAPI:
    app = FastAPI(title="Multi-AI Orchestration System", version="1.0.0")
    
    @app.post("/generate")
    async def generate_response(request: GenerateRequest):
        """응답 생성"""
        orch = await get_orchestrator()
        
        try:
            request_type = RequestType(request.request_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="잘못된 요청 타입")
        
        kwargs = {}
        if request.max_tokens:
            kwargs["max_tokens"] = request.max_tokens
        if request.temperature:
            kwargs["temperature"] = request.temperature
        
        response = await orch.generate_response(
            request.prompt,
            request_type,
            request.selection_strategy,
            request.use_cache,
            request.evaluate_quality,
            **kwargs
        )
        
        return response
    
    @app.post("/batch-generate")
    async def batch_generate(request: BatchGenerateRequest):
        """배치 응답 생성"""
        orch = await get_orchestrator()
        
        try:
            request_type = RequestType(request.request_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="잘못된 요청 타입")
        
        kwargs = {}
        if request.max_tokens:
            kwargs["max_tokens"] = request.max_tokens
        if request.temperature:
            kwargs["temperature"] = request.temperature
        
        responses = await orch.batch_generate(
            request.prompts,
            request_type,
            request.max_concurrent,
            **kwargs
        )
        
        return {"responses": responses}
    
    @app.get("/models/status")
    async def get_models_status():
        """모델 상태 조회"""
        orch = await get_orchestrator()
        return await orch.get_models_status()
    
    @app.get("/analytics")
    async def get_performance_analytics():
        """성능 분석"""
        orch = await get_orchestrator()
        return await orch.get_performance_analytics()
    
    @app.get("/health")
    async def health_check():
        """헬스 체크"""
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    
    return app

if __name__ == "__main__":
    import uvicorn
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    async def main():
        app = await create_ai_orchestration_app()
        
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=8001,
            log_level="info"
        )
        
        server = uvicorn.Server(config)
        await server.serve()
    
    asyncio.run(main()) 