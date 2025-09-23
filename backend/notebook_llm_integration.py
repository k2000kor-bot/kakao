#!/usr/bin/env python3
"""
노트북 LLM 통합 시스템
- Ollama 기반 로컬 LLM 지원
- 하이브리드 AI 엔진 (로컬 + 클라우드)
- 한국어 특화 모델 지원
- 메모리 효율적 모델 관리
"""

import asyncio
import json
import logging
import time
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import os

# 선택적 import (패키지가 없어도 작동하도록)
try:
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False
    print("⚠️ aiohttp 패키지가 없습니다. 비동기 기능이 제한됩니다.")

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("⚠️ psutil 패키지가 없습니다. 시스템 모니터링이 제한됩니다.")

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    print("⚠️ numpy 패키지가 없습니다. 수치 계산이 제한됩니다.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMModelType(Enum):
    """지원되는 LLM 모델 타입"""
    OLLAMA_LLAMA = "llama3.1:8b"
    OLLAMA_QWEN = "qwen2.5:7b"
    OLLAMA_GEMMA = "gemma2:9b"
    OLLAMA_KULLM = "kullm:12.8b"
    OLLAMA_POLYGLOT = "polyglot-ko:12.8b"
    CLOUD_GPT4 = "gpt-4o"
    CLOUD_CLAUDE = "claude-3.5-sonnet"
    CLOUD_GEMINI = "gemini-pro"

class ProcessingMode(Enum):
    """처리 모드"""
    LOCAL_ONLY = "local_only"
    CLOUD_ONLY = "cloud_only"
    HYBRID = "hybrid"
    AUTO = "auto"

@dataclass
class LLMResponse:
    """LLM 응답 구조"""
    content: str
    model_used: str
    processing_time: float
    confidence: float
    tokens_used: int
    mode: ProcessingMode
    metadata: Dict[str, Any]
    timestamp: datetime

@dataclass
class ModelInfo:
    """모델 정보"""
    name: str
    size: str
    memory_usage: int
    is_loaded: bool
    last_used: Optional[datetime]
    performance_score: float

class NotebookLLMIntegration:
    """노트북 LLM 통합 시스템"""
    
    def __init__(self):
        self.ollama_base_url = "http://localhost:11434"
        self.available_models = {}
        self.model_cache = {}
        self.performance_metrics = {
            'total_requests': 0,
            'local_requests': 0,
            'cloud_requests': 0,
            'average_response_time': 0.0,
            'success_rate': 0.0
        }
        self.memory_threshold = 0.8  # 80% 메모리 사용률 제한
        self.current_mode = ProcessingMode.AUTO
        
        # 모델 우선순위 설정
        self.model_priority = {
            'korean_chat': [LLMModelType.OLLAMA_KULLM, LLMModelType.OLLAMA_POLYGLOT, LLMModelType.CLOUD_GPT4],
            'general_chat': [LLMModelType.OLLAMA_LLAMA, LLMModelType.OLLAMA_QWEN, LLMModelType.CLOUD_CLAUDE],
            'analysis': [LLMModelType.OLLAMA_GEMMA, LLMModelType.CLOUD_GPT4, LLMModelType.CLOUD_GEMINI],
            'fast_response': [LLMModelType.OLLAMA_LLAMA, LLMModelType.CLOUD_GEMINI]
        }
        
        self._initialize_ollama()
    
    def _initialize_ollama(self):
        """Ollama 초기화 및 모델 확인"""
        try:
            # Ollama 서비스 상태 확인
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                for model in models:
                    model_name = model['name']
                    self.available_models[model_name] = ModelInfo(
                        name=model_name,
                        size=model.get('size', 'Unknown'),
                        memory_usage=0,
                        is_loaded=False,
                        last_used=None,
                        performance_score=0.8
                    )
                logger.info(f"✅ Ollama 초기화 완료: {len(models)}개 모델 발견")
            else:
                logger.warning("⚠️ Ollama 서비스가 실행되지 않음")
        except Exception as e:
            logger.warning(f"⚠️ Ollama 초기화 실패: {e}")
    
    async def generate_response(
        self, 
        prompt: str, 
        context: Optional[Dict] = None,
        preferred_model: Optional[str] = None,
        force_mode: Optional[ProcessingMode] = None
    ) -> LLMResponse:
        """응답 생성 (하이브리드 모드)"""
        start_time = time.time()
        
        try:
            # 처리 모드 결정
            mode = force_mode or self._determine_processing_mode(prompt, context)
            
            # 모델 선택
            model = preferred_model or self._select_optimal_model(prompt, context, mode)
            
            # 응답 생성
            if mode in [ProcessingMode.LOCAL_ONLY, ProcessingMode.HYBRID]:
                response = await self._generate_local_response(prompt, model, context)
            else:
                response = await self._generate_cloud_response(prompt, model, context)
            
            # 성능 메트릭 업데이트
            processing_time = time.time() - start_time
            self._update_metrics(mode, processing_time, True)
            
            return LLMResponse(
                content=response['content'],
                model_used=model,
                processing_time=processing_time,
                confidence=response.get('confidence', 0.8),
                tokens_used=response.get('tokens', 100),
                mode=mode,
                metadata=response.get('metadata', {}),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"응답 생성 실패: {e}")
            # 폴백 처리
            return await self._fallback_response(prompt, start_time)
    
    def _determine_processing_mode(self, prompt: str, context: Optional[Dict]) -> ProcessingMode:
        """처리 모드 결정"""
        if self.current_mode != ProcessingMode.AUTO:
            return self.current_mode
        
        # 메모리 사용률 확인 (psutil이 있는 경우에만)
        if PSUTIL_AVAILABLE:
            try:
                memory_usage = psutil.virtual_memory().percent / 100
                if memory_usage > self.memory_threshold:
                    logger.info("메모리 사용률 높음, 클라우드 모드로 전환")
                    return ProcessingMode.CLOUD_ONLY
            except Exception as e:
                logger.warning(f"메모리 사용률 확인 실패: {e}")
        
        # 프롬프트 복잡도 분석
        complexity = self._analyze_prompt_complexity(prompt)
        if complexity > 0.8:  # 복잡한 요청
            return ProcessingMode.HYBRID
        elif complexity < 0.3:  # 간단한 요청
            return ProcessingMode.LOCAL_ONLY
        
        return ProcessingMode.HYBRID
    
    def _select_optimal_model(self, prompt: str, context: Optional[Dict], mode: ProcessingMode) -> str:
        """최적 모델 선택"""
        # 한국어 감지
        if self._is_korean_text(prompt):
            return self.model_priority['korean_chat'][0].value
        
        # 요청 타입 분석
        if context and context.get('type') == 'analysis':
            return self.model_priority['analysis'][0].value
        elif context and context.get('type') == 'fast':
            return self.model_priority['fast_response'][0].value
        
        return self.model_priority['general_chat'][0].value
    
    async def _generate_local_response(self, prompt: str, model: str, context: Optional[Dict]) -> Dict:
        """로컬 모델로 응답 생성"""
        try:
            # Ollama API 호출
            payload = {
                "model": model,
                "prompt": self._enhance_prompt(prompt, context),
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 2048
                }
            }
            
            if AIOHTTP_AVAILABLE:
                # 비동기 HTTP 클라이언트 사용
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{self.ollama_base_url}/api/generate",
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            return {
                                'content': result.get('response', ''),
                                'confidence': 0.9,
                                'tokens': len(result.get('response', '').split()),
                                'metadata': {'model_info': model}
                            }
                        else:
                            raise Exception(f"Ollama API 오류: {response.status}")
            else:
                # 동기 HTTP 클라이언트 사용 (fallback)
                response = requests.post(
                    f"{self.ollama_base_url}/api/generate",
                    json=payload,
                    timeout=30
                )
                if response.status_code == 200:
                    result = response.json()
                    return {
                        'content': result.get('response', ''),
                        'confidence': 0.9,
                        'tokens': len(result.get('response', '').split()),
                        'metadata': {'model_info': model}
                    }
                else:
                    raise Exception(f"Ollama API 오류: {response.status_code}")
        
        except Exception as e:
            logger.error(f"로컬 모델 응답 생성 실패: {e}")
            raise
    
    async def _generate_cloud_response(self, prompt: str, model: str, context: Optional[Dict]) -> Dict:
        """클라우드 모델로 응답 생성"""
        # 기존 클라우드 AI 엔진 사용
        from next_generation_ai_engine import NextGenerationAIEngine
        
        try:
            ai_engine = NextGenerationAIEngine()
            response = await ai_engine.generate_ensemble_response(
                user_context=context or {},
                message_intent=prompt,
                target_audience="user",
                complexity="moderate",
                personalization="advanced"
            )
            
            return {
                'content': response.content,
                'confidence': response.confidence_score,
                'tokens': response.token_usage,
                'metadata': {'model_info': model, 'cloud': True}
            }
        except Exception as e:
            logger.error(f"클라우드 모델 응답 생성 실패: {e}")
            raise
    
    def _enhance_prompt(self, prompt: str, context: Optional[Dict]) -> str:
        """프롬프트 향상"""
        enhanced_prompt = f"""당신은 CORBU.AI의 지능형 어시스턴트입니다.

사용자 요청: {prompt}

"""
        
        if context:
            if context.get('project_type'):
                enhanced_prompt += f"프로젝트 유형: {context['project_type']}\n"
            if context.get('user_preferences'):
                enhanced_prompt += f"사용자 선호도: {context['user_preferences']}\n"
        
        enhanced_prompt += """
다음 지침을 따라 응답해주세요:
1. 정확하고 유용한 정보 제공
2. 한국어로 자연스럽게 응답
3. 구체적이고 실행 가능한 조언 제공
4. 필요시 예시나 단계별 설명 포함

응답:"""
        
        return enhanced_prompt
    
    def _analyze_prompt_complexity(self, prompt: str) -> float:
        """프롬프트 복잡도 분석"""
        complexity_score = 0.0
        
        # 길이 기반 복잡도
        if len(prompt) > 500:
            complexity_score += 0.3
        elif len(prompt) > 200:
            complexity_score += 0.2
        
        # 키워드 기반 복잡도
        complex_keywords = ['분석', '비교', '설계', '최적화', '전략', '계획', '연구']
        for keyword in complex_keywords:
            if keyword in prompt:
                complexity_score += 0.1
        
        # 질문 개수
        question_count = prompt.count('?')
        complexity_score += min(question_count * 0.1, 0.3)
        
        return min(complexity_score, 1.0)
    
    def _is_korean_text(self, text: str) -> bool:
        """한국어 텍스트 감지"""
        korean_chars = sum(1 for char in text if '\uac00' <= char <= '\ud7af')
        return korean_chars > len(text) * 0.3
    
    async def _fallback_response(self, prompt: str, start_time: float) -> LLMResponse:
        """폴백 응답"""
        fallback_content = f"""죄송합니다. 현재 AI 서비스에 일시적인 문제가 발생했습니다.

요청하신 내용: {prompt[:100]}...

다음 중 하나를 시도해보세요:
1. 잠시 후 다시 시도
2. 요청을 더 간단하게 표현
3. 다른 질문을 해보세요

문제가 지속되면 관리자에게 문의해주세요."""
        
        return LLMResponse(
            content=fallback_content,
            model_used="fallback",
            processing_time=time.time() - start_time,
            confidence=0.5,
            tokens_used=50,
            mode=ProcessingMode.LOCAL_ONLY,
            metadata={'fallback': True},
            timestamp=datetime.now()
        )
    
    def _update_metrics(self, mode: ProcessingMode, processing_time: float, success: bool):
        """성능 메트릭 업데이트"""
        self.performance_metrics['total_requests'] += 1
        
        if mode in [ProcessingMode.LOCAL_ONLY, ProcessingMode.HYBRID]:
            self.performance_metrics['local_requests'] += 1
        else:
            self.performance_metrics['cloud_requests'] += 1
        
        # 평균 응답 시간 업데이트
        total_requests = self.performance_metrics['total_requests']
        current_avg = self.performance_metrics['average_response_time']
        self.performance_metrics['average_response_time'] = (
            (current_avg * (total_requests - 1) + processing_time) / total_requests
        )
        
        # 성공률 업데이트
        if success:
            successful_requests = self.performance_metrics.get('successful_requests', 0) + 1
            self.performance_metrics['successful_requests'] = successful_requests
        
        self.performance_metrics['success_rate'] = (
            self.performance_metrics.get('successful_requests', 0) / total_requests
        )
    
    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        status = {
            'ollama_available': len(self.available_models) > 0,
            'available_models': list(self.available_models.keys()),
            'current_mode': self.current_mode.value,
            'performance_metrics': self.performance_metrics,
            'model_cache_size': len(self.model_cache),
            'dependencies': {
                'aiohttp': AIOHTTP_AVAILABLE,
                'psutil': PSUTIL_AVAILABLE,
                'numpy': NUMPY_AVAILABLE
            }
        }
        
        # 메모리 정보 (psutil이 있는 경우에만)
        if PSUTIL_AVAILABLE:
            try:
                memory_info = psutil.virtual_memory()
                status['memory_usage'] = {
                    'total': memory_info.total,
                    'available': memory_info.available,
                    'percent': memory_info.percent
                }
            except Exception as e:
                status['memory_usage'] = {'error': str(e)}
        else:
            status['memory_usage'] = {'error': 'psutil not available'}
        
        return status
    
    def set_processing_mode(self, mode: ProcessingMode):
        """처리 모드 설정"""
        self.current_mode = mode
        logger.info(f"처리 모드 변경: {mode.value}")
    
    async def preload_models(self, model_names: List[str]):
        """모델 사전 로드"""
        for model_name in model_names:
            if model_name in self.available_models:
                try:
                    # 모델 로드 요청
                    payload = {"name": model_name}
                    
                    if AIOHTTP_AVAILABLE:
                        async with aiohttp.ClientSession() as session:
                            async with session.post(
                                f"{self.ollama_base_url}/api/generate",
                                json=payload,
                                timeout=aiohttp.ClientTimeout(total=60)
                            ) as response:
                                if response.status == 200:
                                    self.available_models[model_name].is_loaded = True
                                    logger.info(f"모델 사전 로드 완료: {model_name}")
                    else:
                        # 동기 HTTP 클라이언트 사용
                        response = requests.post(
                            f"{self.ollama_base_url}/api/generate",
                            json=payload,
                            timeout=60
                        )
                        if response.status_code == 200:
                            self.available_models[model_name].is_loaded = True
                            logger.info(f"모델 사전 로드 완료: {model_name}")
                except Exception as e:
                    logger.error(f"모델 사전 로드 실패 {model_name}: {e}")

# 전역 인스턴스
notebook_llm = NotebookLLMIntegration()
