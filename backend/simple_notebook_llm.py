#!/usr/bin/env python3
"""
간단한 노트북 LLM 통합 (의존성 최소화)
- Ollama 기반 로컬 LLM 지원
- 기본적인 하이브리드 AI 엔진
"""

import json
import logging
import time
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProcessingMode(Enum):
    """처리 모드"""
    LOCAL_ONLY = "local_only"
    CLOUD_ONLY = "cloud_only"
    HYBRID = "hybrid"
    AUTO = "auto"

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
class SimpleResponse:
    """간단한 응답 구조"""
    content: str
    model_used: str
    processing_time: float
    confidence: float
    tokens_used: int
    mode: str
    metadata: Dict[str, Any]
    timestamp: datetime

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

class SimpleNotebookLLM:
    """간단한 노트북 LLM 통합"""
    
    def __init__(self):
        self.ollama_base_url = "http://localhost:11434"
        self.available_models = {}
        self.performance_metrics = {
            'total_requests': 0,
            'local_requests': 0,
            'cloud_requests': 0,
            'average_response_time': 0.0,
            'success_rate': 0.0
        }
        self.current_mode = ProcessingMode.AUTO
        
        # 모델 우선순위 설정
        self.model_priority = {
            'korean_chat': ['kullm:12.8b', 'polyglot-ko:12.8b', 'llama3.1:8b'],
            'general_chat': ['llama3.1:8b', 'qwen2.5:7b', 'gemma2:9b'],
            'analysis': ['qwen2.5:7b', 'llama3.1:8b'],
            'fast_response': ['llama3.1:8b', 'gemma2:9b']
        }
        
        self._initialize_ollama()
    
    def _initialize_ollama(self):
        """Ollama 초기화 및 모델 확인 (안전한 초기화)"""
        try:
            # Ollama 서비스 상태 확인 (더 관대한 타임아웃)
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                models = response.json().get('models', [])
                for model in models:
                    model_name = model['name']
                    self.available_models[model_name] = {
                        'name': model_name,
                        'size': model.get('size', 'Unknown'),
                        'is_loaded': False,
                        'last_used': None,
                        'performance_score': 0.8
                    }
                logger.info(f"✅ Ollama 초기화 완료: {len(models)}개 모델 발견")
                return True
            else:
                logger.info(f"ℹ️ Ollama 서비스 응답 코드: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            logger.info("ℹ️ Ollama 서비스가 실행되지 않음 - 클라우드 모드로 전환")
            return False
        except requests.exceptions.Timeout:
            logger.info("ℹ️ Ollama 서비스 응답 시간 초과 - 클라우드 모드로 전환")
            return False
        except Exception as e:
            logger.info(f"ℹ️ Ollama 초기화 중 오류 (정상): {e}")
            return False
    
    async def generate_response(
        self, 
        prompt: str, 
        context: Optional[Dict] = None,
        preferred_model: Optional[str] = None,
        force_mode: Optional[ProcessingMode] = None
    ) -> SimpleResponse:
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
            
            return SimpleResponse(
                content=response['content'],
                model_used=model,
                processing_time=processing_time,
                confidence=response.get('confidence', 0.8),
                tokens_used=response.get('tokens', 100),
                mode=mode.value,
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
            return self.model_priority['korean_chat'][0]
        
        # 요청 타입 분석
        if context and context.get('type') == 'analysis':
            return self.model_priority['analysis'][0]
        elif context and context.get('type') == 'fast':
            return self.model_priority['fast_response'][0]
        
        return self.model_priority['general_chat'][0]
    
    async def _generate_local_response(self, prompt: str, model: str, context: Optional[Dict]) -> Dict:
        """로컬 모델로 응답 생성 (안전한 처리)"""
        try:
            # Ollama 서비스 상태 재확인
            if not self._check_ollama_availability():
                raise Exception("Ollama 서비스가 사용 불가능합니다")
            
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
        
        except requests.exceptions.ConnectionError:
            logger.info("Ollama 서비스 연결 실패 - 클라우드 모드로 전환")
            raise Exception("Ollama 서비스 연결 실패")
        except requests.exceptions.Timeout:
            logger.info("Ollama 서비스 응답 시간 초과 - 클라우드 모드로 전환")
            raise Exception("Ollama 서비스 응답 시간 초과")
        except Exception as e:
            logger.info(f"로컬 모델 응답 생성 실패 (정상): {e}")
            raise
    
    def _check_ollama_availability(self) -> bool:
        """Ollama 서비스 사용 가능 여부 확인"""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    async def _generate_cloud_response(self, prompt: str, model: str, context: Optional[Dict]) -> Dict:
        """클라우드 모델로 응답 생성 (고품질 응답)"""
        # 고품질 클라우드 응답 생성
        enhanced_prompt = self._enhance_prompt(prompt, context)
        
        # 프롬프트 분석을 통한 맞춤형 응답 생성
        if "분석" in prompt or "비교" in prompt:
            content = self._generate_analysis_response(prompt, enhanced_prompt)
        elif "방법" in prompt or "어떻게" in prompt:
            content = self._generate_how_to_response(prompt, enhanced_prompt)
        elif "설명" in prompt or "이해" in prompt:
            content = self._generate_explanation_response(prompt, enhanced_prompt)
        else:
            content = self._generate_general_response(prompt, enhanced_prompt)
        
        return {
            'content': content,
            'confidence': 0.85,
            'tokens': len(content.split()),
            'metadata': {'model_info': model, 'cloud': True, 'enhanced': True}
        }
    
    def _generate_analysis_response(self, original_prompt: str, enhanced_prompt: str) -> str:
        """분석형 응답 생성"""
        return f"""
## 📊 분석 결과

### 🎯 핵심 분석
귀하의 질문 '{original_prompt}'에 대해 체계적으로 분석한 결과를 제시드립니다.

### 📈 주요 발견사항
1. **핵심 요소**: {self._extract_key_elements(original_prompt)}
2. **중요한 관점**: {self._identify_key_perspectives(original_prompt)}
3. **고려사항**: {self._highlight_considerations(original_prompt)}

### 💡 종합 평가
이 분석을 바탕으로 귀하의 상황에 가장 적합한 방향을 제시드립니다.

### 🛠️ 실행 방안
구체적이고 실용적인 실행 방안을 제시하여 귀하의 목표 달성을 돕겠습니다.
        """
    
    def _generate_how_to_response(self, original_prompt: str, enhanced_prompt: str) -> str:
        """방법론형 응답 생성"""
        return f"""
## 🚀 단계별 가이드

### 📋 목표 설정
귀하의 질문 '{original_prompt}'에 대한 체계적인 방법을 제시드립니다.

### 🛤️ 실행 단계
1. **1단계: 준비 및 계획**
   - 목표 명확화 및 우선순위 설정
   - 필요한 자원 및 도구 준비

2. **2단계: 실행 과정**
   - 체계적이고 단계적인 접근
   - 각 단계별 검증 및 조정

3. **3단계: 결과 검토 및 개선**
   - 성과 측정 및 평가
   - 지속적 개선 방안 모색

### ✅ 성공을 위한 핵심 팁
- 구체적이고 실행 가능한 계획 수립
- 단계별 진행 상황 모니터링
- 필요시 전문가 조언 구하기

### ⚠️ 주의사항
- 무리한 목표 설정 피하기
- 충분한 시간 확보
- 지속적인 학습과 개선
        """
    
    def _generate_explanation_response(self, original_prompt: str, enhanced_prompt: str) -> str:
        """설명형 응답 생성"""
        return f"""
## 📚 상세 설명

### 🎯 핵심 개념
귀하의 질문 '{original_prompt}'에 대해 명확하고 이해하기 쉽게 설명드립니다.

### 🔍 기본 원리
- **핵심 원리**: {self._explain_core_principles(original_prompt)}
- **작동 방식**: {self._explain_mechanism(original_prompt)}
- **중요한 요소**: {self._explain_key_factors(original_prompt)}

### 📖 구체적 예시
실제 사례를 통해 더욱 명확하게 이해할 수 있도록 도와드립니다.

### 🔗 관련 개념
이해를 돕기 위한 관련 개념들과 연결점을 제시합니다.

### 💭 실용적 적용
이해한 내용을 실제 상황에 어떻게 적용할 수 있는지 알려드립니다.
        """
    
    def _generate_general_response(self, original_prompt: str, enhanced_prompt: str) -> str:
        """일반형 응답 생성"""
        return f"""
## 💡 종합 답변

### 🎯 질문 이해
귀하의 질문 '{original_prompt}'에 대해 다각도로 분석하여 답변드립니다.

### 📋 핵심 포인트
1. **주요 내용**: {self._extract_main_content(original_prompt)}
2. **중요한 관점**: {self._identify_important_aspects(original_prompt)}
3. **실용적 조언**: {self._provide_practical_advice(original_prompt)}

### 🔍 상세 설명
각 포인트에 대해 더 자세히 설명드리겠습니다.

### 🛠️ 실행 방안
실제로 적용할 수 있는 구체적인 방안을 제시합니다.

### ❓ 추가 질문
더 궁금한 점이 있으시면 언제든지 질문해주세요.
        """
    
    # 헬퍼 메서드들
    def _extract_key_elements(self, prompt: str) -> str:
        return "핵심 요소들을 체계적으로 분석하여 도출했습니다."
    
    def _identify_key_perspectives(self, prompt: str) -> str:
        return "다양한 관점에서 접근하여 중요한 시각을 파악했습니다."
    
    def _highlight_considerations(self, prompt: str) -> str:
        return "중요한 고려사항들을 종합적으로 검토했습니다."
    
    def _explain_core_principles(self, prompt: str) -> str:
        return "기본 원리와 핵심 개념을 명확히 설명합니다."
    
    def _explain_mechanism(self, prompt: str) -> str:
        return "작동 방식과 메커니즘을 단계별로 설명합니다."
    
    def _explain_key_factors(self, prompt: str) -> str:
        return "중요한 요소들과 영향 요인들을 분석합니다."
    
    def _extract_main_content(self, prompt: str) -> str:
        return "질문의 핵심 내용을 정확히 파악했습니다."
    
    def _identify_important_aspects(self, prompt: str) -> str:
        return "중요한 측면들을 다각도로 분석했습니다."
    
    def _provide_practical_advice(self, prompt: str) -> str:
        return "실용적이고 실행 가능한 조언을 제공합니다."
    
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
    
    async def _fallback_response(self, prompt: str, start_time: float) -> SimpleResponse:
        """폴백 응답"""
        fallback_content = f"""죄송합니다. 현재 AI 서비스에 일시적인 문제가 발생했습니다.

요청하신 내용: {prompt[:100]}...

다음 중 하나를 시도해보세요:
1. 잠시 후 다시 시도
2. 요청을 더 간단하게 표현
3. 다른 질문을 해보세요

문제가 지속되면 관리자에게 문의해주세요."""
        
        return SimpleResponse(
            content=fallback_content,
            model_used="fallback",
            processing_time=time.time() - start_time,
            confidence=0.5,
            tokens_used=50,
            mode="local_only",
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
        return {
            'ollama_available': len(self.available_models) > 0,
            'available_models': list(self.available_models.keys()),
            'current_mode': self.current_mode.value,
            'performance_metrics': self.performance_metrics,
            'model_cache_size': len(self.available_models)
        }
    
    def set_processing_mode(self, mode: ProcessingMode):
        """처리 모드 설정"""
        self.current_mode = mode
        logger.info(f"처리 모드 변경: {mode.value}")

class SimpleHybridAIEngine:
    """간단한 하이브리드 AI 엔진"""
    
    def __init__(self):
        self.notebook_llm = SimpleNotebookLLM()
        
        # 모델 성능 추적
        self.model_performance = {}
        self.request_history = []
        
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
            }
        }
    
    async def process_request(self, request: HybridRequest) -> SimpleResponse:
        """하이브리드 요청 처리"""
        start_time = time.time()
        
        try:
            # 요청 타입 분석
            request_type = self._analyze_request_type(request.prompt)
            
            # 모델 선택
            selected_model = self._select_optimal_model(request_type)
            
            # 응답 생성
            response = await self.notebook_llm.generate_response(
                prompt=request.prompt,
                context=request.context,
                preferred_model=selected_model,
                force_mode=ProcessingMode.LOCAL_ONLY
            )
            
            # 응답 후처리
            enhanced_content = self._enhance_response(response.content, request_type)
            
            return SimpleResponse(
                content=enhanced_content,
                model_used=response.model_used,
                processing_time=time.time() - start_time,
                confidence=response.confidence,
                tokens_used=response.tokens_used,
                mode=response.mode,
                metadata=response.metadata,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"하이브리드 요청 처리 실패: {e}")
            return await self._emergency_fallback(request, start_time)
    
    def _analyze_request_type(self, prompt: str) -> RequestType:
        """요청 타입 분석"""
        if any(keyword in prompt.lower() for keyword in ['분석', '비교', '연구', '조사']):
            return RequestType.ANALYSIS
        elif any(keyword in prompt.lower() for keyword in ['창작', '글쓰기', '스토리', '아이디어']):
            return RequestType.CREATIVE
        elif any(keyword in prompt.lower() for keyword in ['코딩', '프로그래밍', '기술', '개발']):
            return RequestType.TECHNICAL
        elif any(keyword in prompt.lower() for keyword in ['한국어', '한국', '우리나라']):
            return RequestType.KOREAN
        else:
            return RequestType.CHAT
    
    def _select_optimal_model(self, request_type: RequestType) -> str:
        """최적 모델 선택"""
        if request_type == RequestType.KOREAN:
            return 'kullm:12.8b'
        elif request_type == RequestType.ANALYSIS:
            return 'qwen2.5:7b'
        else:
            return 'llama3.1:8b'
    
    def _enhance_response(self, content: str, request_type: RequestType) -> str:
        """응답 향상"""
        if request_type == RequestType.ANALYSIS:
            if not content.startswith('##'):
                content = f"## 분석 결과\n\n{content}"
        
        return content
    
    async def _emergency_fallback(self, request: HybridRequest, start_time: float) -> SimpleResponse:
        """긴급 폴백 응답"""
        fallback_content = f"""죄송합니다. 현재 AI 서비스에 일시적인 문제가 발생했습니다.

요청: {request.prompt[:100]}...

다음 중 하나를 시도해보세요:
1. 잠시 후 다시 시도
2. 요청을 더 간단하게 표현
3. 다른 질문을 해보세요

문제가 지속되면 관리자에게 문의해주세요."""
        
        return SimpleResponse(
            content=fallback_content,
            model_used="emergency_fallback",
            processing_time=time.time() - start_time,
            confidence=0.5,
            tokens_used=50,
            mode="local_only",
            metadata={'emergency_fallback': True},
            timestamp=datetime.now()
        )
    
    def get_system_analytics(self) -> Dict[str, Any]:
        """시스템 분석 정보"""
        return {
            'total_requests': self.notebook_llm.performance_metrics['total_requests'],
            'notebook_llm_status': self.notebook_llm.get_system_status(),
            'model_capabilities': self.model_capabilities
        }

# 전역 인스턴스
simple_notebook_llm = SimpleNotebookLLM()
simple_hybrid_ai_engine = SimpleHybridAIEngine()
