#!/usr/bin/env python3
"""
하이브리드 AI 엔진
- 로컬 노트북 LLM과 클라우드 AI 모델 통합
- 지능형 모델 선택 및 로드 밸런싱
- 실시간 성능 모니터링 및 최적화
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import statistics

# 선택적 import
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    print("⚠️ numpy 패키지가 없습니다. 수치 계산이 제한됩니다.")

try:
    from notebook_llm_integration import NotebookLLMIntegration, ProcessingMode, LLMResponse
    NOTEBOOK_LLM_AVAILABLE = True
except ImportError as e:
    NOTEBOOK_LLM_AVAILABLE = False
    print(f"⚠️ notebook_llm_integration 모듈 로드 실패: {e}")

try:
    from next_generation_ai_engine import NextGenerationAIEngine
    CLOUD_AI_AVAILABLE = True
except ImportError as e:
    CLOUD_AI_AVAILABLE = False
    print(f"⚠️ next_generation_ai_engine 모듈 로드 실패: {e}")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RequestType(Enum):
    """요청 타입"""
    CHAT = "chat"
    ANALYSIS = "analysis"
    CREATIVE = "creative"
    TECHNICAL = "technical"
    KOREAN = "korean"
    FAST = "fast"

class QualityLevel(Enum):
    """품질 수준"""
    DRAFT = "draft"
    STANDARD = "standard"
    HIGH = "high"
    PREMIUM = "premium"

@dataclass
class HybridRequest:
    """하이브리드 요청 구조"""
    prompt: str
    request_type: RequestType
    quality_level: QualityLevel
    context: Optional[Dict[str, Any]] = None
    user_preferences: Optional[Dict[str, Any]] = None
    constraints: Optional[List[str]] = None
    timeout: float = 30.0

@dataclass
class ModelPerformance:
    """모델 성능 정보"""
    model_name: str
    avg_response_time: float
    success_rate: float
    quality_score: float
    cost_per_request: float
    last_used: datetime
    usage_count: int

@dataclass
class HybridResponse:
    """하이브리드 응답 구조"""
    content: str
    primary_model: str
    fallback_models: List[str]
    processing_time: float
    quality_score: float
    confidence: float
    mode_used: str  # ProcessingMode 대신 문자열 사용
    metadata: Dict[str, Any]
    timestamp: datetime

class HybridAIEngine:
    """하이브리드 AI 엔진"""
    
    def __init__(self):
        # 노트북 LLM 초기화
        if NOTEBOOK_LLM_AVAILABLE:
            self.notebook_llm = NotebookLLMIntegration()
        else:
            self.notebook_llm = None
            logger.warning("노트북 LLM을 사용할 수 없습니다.")
        
        # 클라우드 AI 초기화
        if CLOUD_AI_AVAILABLE:
            self.cloud_ai = NextGenerationAIEngine()
        else:
            self.cloud_ai = None
            logger.warning("클라우드 AI를 사용할 수 없습니다.")
        
        # 모델 성능 추적
        self.model_performance = {}
        self.request_history = []
        self.performance_window = 100  # 최근 100개 요청 기준
        
        # 로드 밸런싱 설정
        self.load_balancing_config = {
            'local_weight': 0.7,  # 로컬 모델 선호도
            'cloud_weight': 0.3,  # 클라우드 모델 선호도
            'quality_threshold': 0.8,  # 품질 임계값
            'response_time_threshold': 5.0  # 응답 시간 임계값 (초)
        }
        
        # 모델별 특성 매핑
        self.model_capabilities = {
            'local_llama': {
                'strengths': ['general_chat', 'fast_response', 'privacy'],
                'weaknesses': ['complex_analysis', 'korean_nuance'],
                'quality_range': (0.7, 0.9),
                'speed_range': (0.5, 2.0)
            },
            'local_kullm': {
                'strengths': ['korean_chat', 'cultural_context', 'privacy'],
                'weaknesses': ['technical_analysis', 'english'],
                'quality_range': (0.8, 0.95),
                'speed_range': (1.0, 3.0)
            },
            'cloud_gpt4': {
                'strengths': ['complex_analysis', 'creative_writing', 'accuracy'],
                'weaknesses': ['privacy', 'cost', 'latency'],
                'quality_range': (0.9, 0.98),
                'speed_range': (2.0, 8.0)
            },
            'cloud_claude': {
                'strengths': ['reasoning', 'safety', 'long_context'],
                'weaknesses': ['privacy', 'cost', 'availability'],
                'quality_range': (0.85, 0.95),
                'speed_range': (1.5, 6.0)
            }
        }
        
        self._initialize_performance_tracking()
    
    def _initialize_performance_tracking(self):
        """성능 추적 초기화"""
        for model_name in self.model_capabilities.keys():
            self.model_performance[model_name] = ModelPerformance(
                model_name=model_name,
                avg_response_time=2.0,
                success_rate=0.95,
                quality_score=0.85,
                cost_per_request=0.01,
                last_used=datetime.now(),
                usage_count=0
            )
    
    async def process_request(self, request: HybridRequest) -> HybridResponse:
        """하이브리드 요청 처리"""
        start_time = time.time()
        
        try:
            # 1. 요청 분석 및 모델 선택
            selected_models = self._select_optimal_models(request)
            
            # 2. 주 모델로 응답 생성
            primary_response = await self._generate_primary_response(request, selected_models[0])
            
            # 3. 품질 검증 및 필요시 폴백
            if self._needs_fallback(primary_response, request):
                fallback_response = await self._generate_fallback_response(request, selected_models[1:])
                if fallback_response and fallback_response.quality_score > primary_response.confidence:
                    primary_response = fallback_response
            
            # 4. 응답 후처리 및 품질 향상
            enhanced_response = await self._enhance_response(primary_response, request)
            
            # 5. 성능 메트릭 업데이트
            processing_time = time.time() - start_time
            self._update_performance_metrics(selected_models[0], processing_time, enhanced_response.quality_score)
            
            return HybridResponse(
                content=enhanced_response.content,
                primary_model=enhanced_response.model_used,
                fallback_models=selected_models[1:],
                processing_time=processing_time,
                quality_score=enhanced_response.confidence,
                confidence=enhanced_response.confidence,
                mode_used=enhanced_response.mode.value if hasattr(enhanced_response.mode, 'value') else str(enhanced_response.mode),
                metadata=enhanced_response.metadata,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"하이브리드 요청 처리 실패: {e}")
            return await self._emergency_fallback(request, start_time)
    
    def _select_optimal_models(self, request: HybridRequest) -> List[str]:
        """최적 모델 선택"""
        candidates = []
        
        # 요청 타입별 모델 필터링
        if request.request_type == RequestType.KOREAN:
            candidates = ['local_kullm', 'cloud_gpt4', 'local_llama']
        elif request.request_type == RequestType.ANALYSIS:
            candidates = ['cloud_gpt4', 'cloud_claude', 'local_llama']
        elif request.request_type == RequestType.FAST:
            candidates = ['local_llama', 'cloud_gpt4', 'local_kullm']
        elif request.request_type == RequestType.CREATIVE:
            candidates = ['cloud_gpt4', 'cloud_claude', 'local_llama']
        else:
            candidates = ['local_llama', 'local_kullm', 'cloud_gpt4', 'cloud_claude']
        
        # 성능 기반 정렬
        scored_models = []
        for model in candidates:
            if model in self.model_performance:
                perf = self.model_performance[model]
                score = self._calculate_model_score(model, request, perf)
                scored_models.append((model, score))
        
        # 점수순 정렬
        scored_models.sort(key=lambda x: x[1], reverse=True)
        return [model for model, score in scored_models]
    
    def _calculate_model_score(self, model_name: str, request: HybridRequest, performance: ModelPerformance) -> float:
        """모델 점수 계산"""
        base_score = 0.0
        
        # 성능 점수 (40%)
        perf_score = (performance.success_rate * 0.4 + 
                     (1.0 / max(performance.avg_response_time, 0.1)) * 0.3 +
                     performance.quality_score * 0.3)
        base_score += perf_score * 0.4
        
        # 요청 타입 적합성 (30%)
        capabilities = self.model_capabilities.get(model_name, {})
        strengths = capabilities.get('strengths', [])
        
        type_score = 0.0
        if request.request_type.value in strengths:
            type_score = 1.0
        elif any(strength in request.request_type.value for strength in strengths):
            type_score = 0.7
        else:
            type_score = 0.3
        
        base_score += type_score * 0.3
        
        # 품질 수준 적합성 (20%)
        quality_range = capabilities.get('quality_range', (0.7, 0.9))
        if request.quality_level == QualityLevel.PREMIUM:
            quality_score = 1.0 if quality_range[1] >= 0.95 else 0.5
        elif request.quality_level == QualityLevel.HIGH:
            quality_score = 1.0 if quality_range[1] >= 0.9 else 0.7
        else:
            quality_score = 1.0
        
        base_score += quality_score * 0.2
        
        # 비용 효율성 (10%)
        cost_score = 1.0 / max(performance.cost_per_request, 0.001)
        base_score += min(cost_score * 0.1, 0.1)
        
        return base_score
    
    async def _generate_primary_response(self, request: HybridRequest, model_name: str):
        """주 모델로 응답 생성"""
        if model_name.startswith('local_') and self.notebook_llm:
            # 로컬 모델 사용
            actual_model = self._get_actual_model_name(model_name)
            return await self.notebook_llm.generate_response(
                prompt=request.prompt,
                context=request.context,
                preferred_model=actual_model,
                force_mode=ProcessingMode.LOCAL_ONLY
            )
        elif self.notebook_llm:
            # 클라우드 모델 사용
            return await self.notebook_llm.generate_response(
                prompt=request.prompt,
                context=request.context,
                force_mode=ProcessingMode.CLOUD_ONLY
            )
        else:
            # 폴백 응답
            # 폴백 응답을 위한 간단한 구조체
            class SimpleResponse:
                def __init__(self):
                    self.content = "죄송합니다. AI 서비스를 사용할 수 없습니다."
                    self.model_used = "fallback"
                    self.processing_time = 0.1
                    self.confidence = 0.5
                    self.tokens_used = 10
                    self.mode = "local_only"
                    self.metadata = {'error': 'no_ai_available'}
                    self.timestamp = datetime.now()
            
            return SimpleResponse()
    
    async def _generate_fallback_response(self, request: HybridRequest, fallback_models: List[str]):
        """폴백 응답 생성"""
        for model_name in fallback_models:
            try:
                response = await self._generate_primary_response(request, model_name)
                if response.confidence > 0.7:  # 최소 품질 기준
                    return response
            except Exception as e:
                logger.warning(f"폴백 모델 {model_name} 실패: {e}")
                continue
        return None
    
    def _needs_fallback(self, response, request: HybridRequest) -> bool:
        """폴백 필요성 판단"""
        # 품질 기준 미달
        if response.confidence < 0.7:
            return True
        
        # 응답 시간 초과
        if response.processing_time > request.timeout:
            return True
        
        # 품질 수준 요구사항 미달
        if request.quality_level == QualityLevel.PREMIUM and response.confidence < 0.9:
            return True
        
        return False
    
    async def _enhance_response(self, response, request: HybridRequest):
        """응답 후처리 및 품질 향상"""
        enhanced_content = response.content
        
        # 한국어 응답 최적화
        if request.request_type == RequestType.KOREAN:
            enhanced_content = self._optimize_korean_response(enhanced_content)
        
        # 품질 수준에 따른 후처리
        if request.quality_level in [QualityLevel.HIGH, QualityLevel.PREMIUM]:
            enhanced_content = self._enhance_response_quality(enhanced_content, request)
        
        # 메타데이터 업데이트
        enhanced_metadata = response.metadata.copy()
        enhanced_metadata.update({
            'enhanced': True,
            'original_confidence': response.confidence,
            'enhancement_applied': True
        })
        
        # 향상된 응답을 위한 간단한 구조체
        class EnhancedResponse:
            def __init__(self, original_response, enhanced_content, enhanced_metadata):
                self.content = enhanced_content
                self.model_used = original_response.model_used
                self.processing_time = original_response.processing_time
                self.confidence = min(original_response.confidence + 0.05, 1.0)
                self.tokens_used = original_response.tokens_used
                self.mode = original_response.mode
                self.metadata = enhanced_metadata
                self.timestamp = original_response.timestamp
        
        return EnhancedResponse(response, enhanced_content, enhanced_metadata)
    
    def _optimize_korean_response(self, content: str) -> str:
        """한국어 응답 최적화"""
        # 기본적인 한국어 최적화
        optimizations = [
            ('입니다.', '입니다.'),
            ('습니다.', '습니다.'),
            ('어요.', '어요.'),
            ('아요.', '아요.'),
        ]
        
        for old, new in optimizations:
            content = content.replace(old, new)
        
        return content
    
    def _enhance_response_quality(self, content: str, request: HybridRequest) -> str:
        """응답 품질 향상"""
        # 구조화된 응답 추가
        if request.request_type == RequestType.ANALYSIS:
            if not content.startswith('##'):
                content = f"## 분석 결과\n\n{content}"
        
        # 요약 추가
        if len(content) > 500 and request.quality_level == QualityLevel.PREMIUM:
            content += f"\n\n---\n**요약**: {content[:100]}..."
        
        return content
    
    def _get_actual_model_name(self, model_name: str) -> str:
        """실제 모델 이름 변환"""
        mapping = {
            'local_llama': 'llama3.1:8b',
            'local_kullm': 'kullm:12.8b',
            'local_qwen': 'qwen2.5:7b',
            'local_gemma': 'gemma2:9b'
        }
        return mapping.get(model_name, 'llama3.1:8b')
    
    def _update_performance_metrics(self, model_name: str, processing_time: float, quality_score: float):
        """성능 메트릭 업데이트"""
        if model_name in self.model_performance:
            perf = self.model_performance[model_name]
            
            # 이동 평균으로 업데이트
            alpha = 0.1  # 학습률
            perf.avg_response_time = (1 - alpha) * perf.avg_response_time + alpha * processing_time
            perf.quality_score = (1 - alpha) * perf.quality_score + alpha * quality_score
            perf.usage_count += 1
            perf.last_used = datetime.now()
            
            # 성공률 업데이트 (품질 기준)
            if quality_score > 0.7:
                perf.success_rate = (1 - alpha) * perf.success_rate + alpha * 1.0
            else:
                perf.success_rate = (1 - alpha) * perf.success_rate + alpha * 0.0
    
    async def _emergency_fallback(self, request: HybridRequest, start_time: float) -> HybridResponse:
        """긴급 폴백 응답"""
        fallback_content = f"""죄송합니다. 현재 AI 서비스에 일시적인 문제가 발생했습니다.

요청: {request.prompt[:100]}...

다음 중 하나를 시도해보세요:
1. 잠시 후 다시 시도
2. 요청을 더 간단하게 표현
3. 다른 질문을 해보세요

문제가 지속되면 관리자에게 문의해주세요."""
        
        return HybridResponse(
            content=fallback_content,
            primary_model="emergency_fallback",
            fallback_models=[],
            processing_time=time.time() - start_time,
            quality_score=0.5,
            confidence=0.5,
            mode_used="local_only",
            metadata={'emergency_fallback': True},
            timestamp=datetime.now()
        )
    
    def get_system_analytics(self) -> Dict[str, Any]:
        """시스템 분석 정보"""
        total_requests = sum(perf.usage_count for perf in self.model_performance.values())
        
        analytics = {
            'total_requests': total_requests,
            'model_performance': {
                name: {
                    'avg_response_time': perf.avg_response_time,
                    'success_rate': perf.success_rate,
                    'quality_score': perf.quality_score,
                    'usage_count': perf.usage_count,
                    'last_used': perf.last_used.isoformat()
                }
                for name, perf in self.model_performance.items()
            },
            'load_balancing_config': self.load_balancing_config,
            'dependencies': {
                'notebook_llm_available': NOTEBOOK_LLM_AVAILABLE,
                'cloud_ai_available': CLOUD_AI_AVAILABLE,
                'numpy_available': NUMPY_AVAILABLE
            }
        }
        
        # 노트북 LLM 상태 (사용 가능한 경우에만)
        if self.notebook_llm:
            try:
                analytics['notebook_llm_status'] = self.notebook_llm.get_system_status()
            except Exception as e:
                analytics['notebook_llm_status'] = {'error': str(e)}
        else:
            analytics['notebook_llm_status'] = {'error': 'notebook_llm not available'}
        
        return analytics
    
    def update_load_balancing_config(self, config: Dict[str, Any]):
        """로드 밸런싱 설정 업데이트"""
        self.load_balancing_config.update(config)
        logger.info(f"로드 밸런싱 설정 업데이트: {config}")

# 전역 인스턴스
hybrid_ai_engine = HybridAIEngine()
