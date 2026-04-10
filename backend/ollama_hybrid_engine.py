#!/usr/bin/env python3
"""
Ollama 하이브리드 엔진 - Ollama + 내장 AI 완전 통합
Ollama Hybrid Engine - Complete Integration of Ollama + Internal AI

Features:
- Ollama 로컬 모델과 내장 AI 엔진의 완전 통합
- 지능형 모델 선택 및 자동 전환
- 고품질 한국어 응답 생성
- 실시간 성능 모니터링
- 완전한 오프라인 지원
"""

import json
import time
import asyncio
import requests
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import queue
import os

# 내장 AI 엔진 임포트
try:
    from backend.internal_ai_engine import internal_ai_engine, InternalResponse, ResponseType, QualityLevel
    INTERNAL_AI_AVAILABLE = True
except ImportError:
    INTERNAL_AI_AVAILABLE = False
    print("⚠️ 내장 AI 엔진을 사용할 수 없습니다")

logger = logging.getLogger(__name__)

class ProcessingMode(Enum):
    """처리 모드"""
    AUTO = "auto"
    OLLAMA_ONLY = "ollama_only"
    INTERNAL_ONLY = "internal_only"
    HYBRID = "hybrid"
    FALLBACK = "fallback"

class ModelType(Enum):
    """모델 타입"""
    OLLAMA = "ollama"
    INTERNAL = "internal"
    HYBRID = "hybrid"

@dataclass
class OllamaModel:
    """Ollama 모델 정보"""
    name: str
    size: str
    is_loaded: bool
    last_used: Optional[datetime]
    performance_score: float
    response_time: float
    success_rate: float

@dataclass
class HybridResponse:
    """하이브리드 응답"""
    content: str
    model_used: ModelType
    processing_mode: ProcessingMode
    confidence: float
    processing_time: float
    metadata: Dict[str, Any]
    ollama_model: Optional[str]
    internal_enhancement: bool
    suggestions: List[str]
    related_topics: List[str]

class OllamaHybridEngine:
    """Ollama 하이브리드 엔진"""
    
    def __init__(self):
        self.ollama_base_url = os.getenv(
            "OLLAMA_BASE_URL", "http://localhost:11434"
        ).rstrip("/")
        self.available_models = {}
        self.model_performance = {}
        self.response_cache = {}
        self.is_ollama_available = False
        self.internal_engine = None
        self.performance_monitor = {}
        self.request_queue = queue.Queue()
        self.response_queue = queue.Queue()
        
        # 내장 AI 엔진 초기화
        if INTERNAL_AI_AVAILABLE:
            self.internal_engine = internal_ai_engine
            print("✅ 내장 AI 엔진 초기화 완료")
        
        # Ollama 초기화
        self._initialize_ollama()
        
        # 성능 모니터링 시작
        self._start_performance_monitoring()
    
    def _initialize_ollama(self):
        """Ollama 초기화 및 모델 확인"""
        try:
            print("🔍 Ollama 서비스 확인 중...")
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10)
            
            if response.status_code == 200:
                models_data = response.json().get('models', [])
                self.is_ollama_available = True
                
                for model in models_data:
                    model_name = model['name']
                    self.available_models[model_name] = OllamaModel(
                        name=model_name,
                        size=model.get('size', 'Unknown'),
                        is_loaded=False,
                        last_used=None,
                        performance_score=0.8,
                        response_time=0.0,
                        success_rate=1.0
                    )
                
                print(f"✅ Ollama 초기화 완료: {len(models_data)}개 모델 발견")
                print(f"📋 사용 가능한 모델: {list(self.available_models.keys())}")
                
                # 모델 성능 테스트
                self._test_model_performance()
                
            else:
                print(f"⚠️ Ollama 서비스 응답 오류: {response.status_code}")
                self.is_ollama_available = False
                
        except requests.exceptions.ConnectionError:
            print("ℹ️ Ollama 서비스가 실행되지 않음 - 내장 AI 모드로 전환")
            self.is_ollama_available = False
        except requests.exceptions.Timeout:
            print("ℹ️ Ollama 서비스 응답 시간 초과 - 내장 AI 모드로 전환")
            self.is_ollama_available = False
        except Exception as e:
            print(f"ℹ️ Ollama 초기화 중 오류: {e}")
            self.is_ollama_available = False
    
    def _test_model_performance(self):
        """모델 성능 테스트"""
        print("🧪 모델 성능 테스트 시작...")
        
        test_prompts = [
            "안녕하세요",
            "프로그래밍이란 무엇인가요?",
            "한국의 수도는 어디인가요?"
        ]
        
        for model_name in list(self.available_models.keys())[:2]:  # 최대 2개 모델만 테스트
            try:
                print(f"🔍 {model_name} 모델 테스트 중...")
                
                for prompt in test_prompts:
                    start_time = time.time()
                    response = requests.post(
                        f"{self.ollama_base_url}/api/generate",
                        json={
                            "model": model_name,
                            "prompt": prompt,
                            "stream": False,
                            "options": {"temperature": 0.7, "max_tokens": 100}
                        },
                        timeout=15
                    )
                    
                    if response.status_code == 200:
                        response_time = time.time() - start_time
                        self.available_models[model_name].response_time = response_time
                        self.available_models[model_name].success_rate = 1.0
                        print(f"✅ {model_name}: {response_time:.2f}초")
                        break  # 첫 번째 성공하면 테스트 완료
                    else:
                        print(f"❌ {model_name}: 응답 오류 {response.status_code}")
                        
            except Exception as e:
                print(f"❌ {model_name} 테스트 실패: {e}")
                self.available_models[model_name].success_rate = 0.0
    
    def _start_performance_monitoring(self):
        """성능 모니터링 시작"""
        def monitor():
            while True:
                try:
                    # 모델 성능 업데이트
                    self._update_model_performance()
                    time.sleep(30)  # 30초마다 업데이트
                except Exception as e:
                    logger.error(f"성능 모니터링 오류: {e}")
                    time.sleep(60)
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()
        print("📊 성능 모니터링 시작")
    
    def _update_model_performance(self):
        """모델 성능 업데이트"""
        if not self.is_ollama_available:
            return
        
        # Ollama 서비스 상태 확인
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code != 200:
                self.is_ollama_available = False
                print("⚠️ Ollama 서비스 연결 끊김")
        except:
            self.is_ollama_available = False
            print("⚠️ Ollama 서비스 연결 끊김")
    
    def generate_response(
        self, 
        prompt: str, 
        processing_mode: ProcessingMode = ProcessingMode.AUTO,
        context: Dict[str, Any] = None
    ) -> HybridResponse:
        """하이브리드 응답 생성"""
        start_time = time.time()
        
        try:
            # 1. 처리 모드 결정
            actual_mode = self._determine_processing_mode(processing_mode, prompt)
            
            # 2. 모델 선택
            selected_model = self._select_optimal_model(actual_mode, prompt)
            
            # 3. 응답 생성
            if selected_model == ModelType.OLLAMA:
                response = self._generate_ollama_response(prompt, context)
            elif selected_model == ModelType.INTERNAL:
                response = self._generate_internal_response(prompt, context)
            else:  # HYBRID
                response = self._generate_hybrid_response(prompt, context)
            
            # 4. 응답 향상
            enhanced_response = self._enhance_response(response, prompt, context)
            
            # 5. 성능 기록
            processing_time = time.time() - start_time
            self._record_performance(selected_model, processing_time, True)
            
            return enhanced_response
            
        except Exception as e:
            logger.error(f"하이브리드 응답 생성 실패: {e}")
            return self._create_fallback_response(prompt, str(e), start_time)
    
    def _determine_processing_mode(
        self, 
        requested_mode: ProcessingMode, 
        prompt: str
    ) -> ProcessingMode:
        """처리 모드 결정"""
        if requested_mode == ProcessingMode.AUTO:
            # 자동 모드: 상황에 따라 최적 모드 선택
            if not self.is_ollama_available:
                return ProcessingMode.INTERNAL_ONLY
            elif len(prompt) > 500:  # 긴 프롬프트는 하이브리드
                return ProcessingMode.HYBRID
            elif self._is_complex_query(prompt):  # 복잡한 쿼리는 Ollama
                return ProcessingMode.OLLAMA_ONLY
            else:
                return ProcessingMode.HYBRID
        else:
            return requested_mode
    
    def _is_complex_query(self, prompt: str) -> bool:
        """복잡한 쿼리 판단"""
        complex_keywords = [
            '분석', '비교', '설계', '최적화', '전략', '계획', 
            '연구', '개발', '코딩', '프로그래밍', '알고리즘'
        ]
        
        return any(keyword in prompt for keyword in complex_keywords)
    
    def _select_optimal_model(
        self, 
        mode: ProcessingMode, 
        prompt: str
    ) -> ModelType:
        """최적 모델 선택"""
        if mode == ProcessingMode.OLLAMA_ONLY:
            return ModelType.OLLAMA if self.is_ollama_available else ModelType.INTERNAL
        elif mode == ProcessingMode.INTERNAL_ONLY:
            return ModelType.INTERNAL
        elif mode == ProcessingMode.HYBRID:
            if self.is_ollama_available and self.internal_engine:
                return ModelType.HYBRID
            elif self.is_ollama_available:
                return ModelType.OLLAMA
            else:
                return ModelType.INTERNAL
        else:  # FALLBACK
            return ModelType.INTERNAL
    
    def _generate_ollama_response(
        self, 
        prompt: str, 
        context: Dict[str, Any]
    ) -> HybridResponse:
        """Ollama 응답 생성"""
        if not self.is_ollama_available:
            raise Exception("Ollama 서비스가 사용 불가능합니다")
        
        # 최적 모델 선택
        best_model = self._get_best_ollama_model()
        
        try:
            # Ollama API 호출
            payload = {
                "model": best_model,
                "prompt": self._enhance_prompt(prompt, context),
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 2048
                }
            }
            
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result.get('response', '')
                
                # 모델 사용 기록 업데이트
                self.available_models[best_model].last_used = datetime.now()
                
                return HybridResponse(
                    content=content,
                    model_used=ModelType.OLLAMA,
                    processing_mode=ProcessingMode.OLLAMA_ONLY,
                    confidence=0.9,
                    processing_time=0.0,  # 나중에 설정
                    metadata={'ollama_model': best_model, 'tokens': len(content.split())},
                    ollama_model=best_model,
                    internal_enhancement=False,
                    suggestions=[],
                    related_topics=[]
                )
            else:
                raise Exception(f"Ollama API 오류: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Ollama 응답 생성 실패: {e}")
            raise
    
    def _generate_internal_response(
        self, 
        prompt: str, 
        context: Dict[str, Any]
    ) -> HybridResponse:
        """내장 AI 응답 생성"""
        if not self.internal_engine:
            raise Exception("내장 AI 엔진이 사용 불가능합니다")
        
        internal_response = self.internal_engine.generate_response(prompt, context)
        
        return HybridResponse(
            content=internal_response.content,
            model_used=ModelType.INTERNAL,
            processing_mode=ProcessingMode.INTERNAL_ONLY,
            confidence=internal_response.confidence,
            processing_time=internal_response.processing_time,
            metadata=internal_response.metadata,
            ollama_model=None,
            internal_enhancement=True,
            suggestions=internal_response.suggestions,
            related_topics=internal_response.related_topics
        )
    
    def _generate_hybrid_response(
        self, 
        prompt: str, 
        context: Dict[str, Any]
    ) -> HybridResponse:
        """하이브리드 응답 생성"""
        try:
            # 1. Ollama로 기본 응답 생성
            ollama_response = self._generate_ollama_response(prompt, context)
            
            # 2. 내장 AI로 응답 향상
            if self.internal_engine:
                enhanced_content = self._enhance_with_internal_ai(
                    ollama_response.content, prompt, context
                )
                
                return HybridResponse(
                    content=enhanced_content,
                    model_used=ModelType.HYBRID,
                    processing_mode=ProcessingMode.HYBRID,
                    confidence=min(ollama_response.confidence + 0.1, 0.95),
                    processing_time=ollama_response.processing_time,
                    metadata={
                        **ollama_response.metadata,
                        'hybrid_enhancement': True,
                        'ollama_confidence': ollama_response.confidence
                    },
                    ollama_model=ollama_response.ollama_model,
                    internal_enhancement=True,
                    suggestions=ollama_response.suggestions,
                    related_topics=ollama_response.related_topics
                )
            else:
                return ollama_response
                
        except Exception as e:
            logger.error(f"하이브리드 응답 생성 실패, 내장 AI로 전환: {e}")
            return self._generate_internal_response(prompt, context)
    
    def _enhance_with_internal_ai(
        self, 
        ollama_content: str, 
        original_prompt: str, 
        context: Dict[str, Any]
    ) -> str:
        """내장 AI로 Ollama 응답 향상"""
        try:
            # Ollama 응답을 분석하여 향상
            enhancement_prompt = f"""
다음은 Ollama 모델이 생성한 응답입니다:

원본 질문: {original_prompt}
Ollama 응답: {ollama_content}

이 응답을 더욱 상세하고 유용하게 향상시켜주세요:
1. 구조화된 형식으로 정리
2. 구체적인 예시 추가
3. 실용적인 조언 포함
4. 한국어로 자연스럽게 표현
"""
            
            enhanced_response = self.internal_engine.generate_response(enhancement_prompt, context)
            return enhanced_response.content
            
        except Exception as e:
            logger.error(f"내장 AI 향상 실패: {e}")
            return ollama_content
    
    def _enhance_response(
        self, 
        response: HybridResponse, 
        prompt: str, 
        context: Dict[str, Any]
    ) -> HybridResponse:
        """응답 향상"""
        # 후속 제안 생성
        if not response.suggestions:
            response.suggestions = self._generate_suggestions(prompt, response.model_used)
        
        # 관련 주제 생성
        if not response.related_topics:
            response.related_topics = self._generate_related_topics(prompt)
        
        # 메타데이터 업데이트
        response.metadata.update({
            'enhanced_at': datetime.now().isoformat(),
            'prompt_length': len(prompt),
            'response_length': len(response.content)
        })
        
        return response
    
    def _get_best_ollama_model(self) -> str:
        """최적 Ollama 모델 선택"""
        if not self.available_models:
            raise Exception("사용 가능한 Ollama 모델이 없습니다")
        
        # 성능 점수 기반으로 최적 모델 선택
        best_model = max(
            self.available_models.items(),
            key=lambda x: x[1].performance_score
        )[0]
        
        return best_model
    
    def _enhance_prompt(self, prompt: str, context: Dict[str, Any]) -> str:
        """프롬프트 향상"""
        enhanced_prompt = f"""당신은 CORBU.AI의 지능형 어시스턴트입니다.

사용자 질문: {prompt}

다음 지침에 따라 답변해주세요:
1. 정확하고 유용한 정보 제공
2. 구체적인 예시와 설명 포함
3. 실용적인 조언과 팁 제공
4. 한국어로 자연스럽고 친근하게 표현
5. 필요시 단계별 가이드 제공

답변:"""
        
        if context:
            enhanced_prompt += f"\n\n추가 컨텍스트: {json.dumps(context, ensure_ascii=False)}"
        
        return enhanced_prompt
    
    def _generate_suggestions(self, prompt: str, model_used: ModelType) -> List[str]:
        """후속 제안 생성"""
        suggestions = [
            f"'{prompt}'에 대해 더 자세히 알고 싶으신가요?",
            "관련된 다른 주제에 대해서도 알아보고 싶으신가요?",
            "실제 적용 시 예상되는 어려움에 대해 궁금하신가요?"
        ]
        
        if model_used == ModelType.OLLAMA:
            suggestions.append("Ollama 모델의 다른 관점에서도 답변을 받아보시겠어요?")
        elif model_used == ModelType.HYBRID:
            suggestions.append("하이브리드 모드로 더 상세한 분석을 받아보시겠어요?")
        
        return suggestions[:4]
    
    def _generate_related_topics(self, prompt: str) -> List[str]:
        """관련 주제 생성"""
        # 간단한 키워드 기반 관련 주제 생성
        topics = []
        
        if "프로그래밍" in prompt or "코딩" in prompt:
            topics.extend(["알고리즘", "자료구조", "디자인패턴", "테스팅"])
        elif "비즈니스" in prompt or "경영" in prompt:
            topics.extend(["마케팅", "전략기획", "프로젝트관리", "품질관리"])
        elif "기술" in prompt or "AI" in prompt:
            topics.extend(["머신러닝", "딥러닝", "클라우드", "데이터분석"])
        else:
            topics.extend(["학습방법", "실무적용", "최신트렌드", "전문가조언"])
        
        return topics[:5]
    
    def _record_performance(self, model_type: ModelType, processing_time: float, success: bool):
        """성능 기록"""
        if model_type not in self.performance_monitor:
            self.performance_monitor[model_type] = {
                'total_requests': 0,
                'successful_requests': 0,
                'total_time': 0.0,
                'avg_time': 0.0
            }
        
        monitor = self.performance_monitor[model_type]
        monitor['total_requests'] += 1
        monitor['total_time'] += processing_time
        monitor['avg_time'] = monitor['total_time'] / monitor['total_requests']
        
        if success:
            monitor['successful_requests'] += 1
    
    def _create_fallback_response(self, prompt: str, error: str, start_time: float) -> HybridResponse:
        """폴백 응답 생성"""
        return HybridResponse(
            content=f"""
## ⚠️ 응답 생성 중 오류 발생

죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다.

**오류 내용**: {error}

**기본 답변**:
귀하의 질문 '{prompt}'에 대해 답변드리겠습니다. 
현재 시스템에 일시적인 문제가 있어 기본 모드로 응답을 제공합니다.

더 나은 서비스를 위해 지속적으로 개선하고 있습니다.
            """,
            model_used=ModelType.INTERNAL,
            processing_mode=ProcessingMode.FALLBACK,
            confidence=0.5,
            processing_time=time.time() - start_time,
            metadata={"error": error, "fallback": True},
            ollama_model=None,
            internal_enhancement=False,
            suggestions=["다시 시도해보시겠어요?", "다른 방식으로 질문해보시겠어요?"],
            related_topics=["시스템 상태", "오류 해결"]
        )
    
    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 반환"""
        return {
            "ollama_available": self.is_ollama_available,
            "ollama_models": len(self.available_models),
            "internal_ai_available": self.internal_engine is not None,
            "available_models": list(self.available_models.keys()),
            "performance_stats": self.performance_monitor,
            "last_update": datetime.now().isoformat()
        }

# 전역 인스턴스
ollama_hybrid_engine = OllamaHybridEngine()
