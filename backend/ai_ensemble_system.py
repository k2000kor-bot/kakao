import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any
import json
import sqlite3
from datetime import datetime, timedelta
import statistics
from dataclasses import dataclass, field
from enum import Enum
import hashlib
import random
import time

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIModel(Enum):
    GPT4 = "gpt-4"
    GPT3_5 = "gpt-3.5-turbo"
    CLAUDE_3 = "claude-3"
    GEMINI_PRO = "gemini-pro"
    LOCAL_MODEL = "local-llama"

class QualityMetric(Enum):
    RELEVANCE = "relevance"
    COHERENCE = "coherence"
    TONE_MATCH = "tone_match"
    ACCURACY = "accuracy"
    FLUENCY = "fluency"
    APPROPRIATENESS = "appropriateness"

@dataclass
class ModelResponse:
    model: AIModel
    content: str
    confidence: float
    response_time: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    quality_scores: Dict[QualityMetric, float] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class EnsembleResult:
    final_content: str
    contributing_models: List[AIModel]
    confidence: float
    quality_scores: Dict[QualityMetric, float]
    selection_method: str
    individual_responses: List[ModelResponse]
    processing_time: float
    timestamp: datetime = field(default_factory=datetime.now)

class AIEnsembleSystem:
    """AI 모델 앙상블 및 품질 검증 시스템"""
    
    def __init__(self, db_path: str = "ai_ensemble.db"):
        self.db_path = db_path
        self.model_weights = self._init_model_weights()
        self.quality_thresholds = self._init_quality_thresholds()
        self.response_cache: Dict[str, EnsembleResult] = {}
        
        # 데이터베이스 초기화
        self._init_database()
        
        # 모델 성능 기록 로드
        self._load_model_performance_history()

    def _init_database(self):
        """데이터베이스 초기화"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 모델 응답 기록
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS model_responses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        request_hash TEXT NOT NULL,
                        model TEXT NOT NULL,
                        content TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        response_time REAL NOT NULL,
                        quality_scores TEXT,
                        metadata TEXT,
                        timestamp TEXT NOT NULL
                    )
                """)
                
                # 앙상블 결과 기록
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS ensemble_results (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        request_hash TEXT NOT NULL,
                        final_content TEXT NOT NULL,
                        contributing_models TEXT NOT NULL,
                        confidence REAL NOT NULL,
                        quality_scores TEXT NOT NULL,
                        selection_method TEXT NOT NULL,
                        processing_time REAL NOT NULL,
                        timestamp TEXT NOT NULL
                    )
                """)
                
                # 품질 평가 기록
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS quality_evaluations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        response_id INTEGER NOT NULL,
                        metric TEXT NOT NULL,
                        score REAL NOT NULL,
                        evaluator TEXT NOT NULL,
                        feedback TEXT,
                        timestamp TEXT NOT NULL
                    )
                """)
                
                # 모델 성능 통계
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS model_performance (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        model TEXT NOT NULL,
                        metric TEXT NOT NULL,
                        score REAL NOT NULL,
                        sample_size INTEGER NOT NULL,
                        period_start TEXT NOT NULL,
                        period_end TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                """)
                
                conn.commit()
                logger.info("AI 앙상블 시스템 데이터베이스 초기화 완료")
                
        except Exception as e:
            logger.error(f"데이터베이스 초기화 오류: {e}")

    def _init_model_weights(self) -> Dict[AIModel, float]:
        """모델별 초기 가중치 설정"""
        return {
            AIModel.GPT4: 0.35,
            AIModel.CLAUDE_3: 0.30,
            AIModel.GEMINI_PRO: 0.20,
            AIModel.GPT3_5: 0.10,
            AIModel.LOCAL_MODEL: 0.05
        }

    def _init_quality_thresholds(self) -> Dict[QualityMetric, float]:
        """품질 메트릭별 임계값 설정"""
        return {
            QualityMetric.RELEVANCE: 0.7,
            QualityMetric.COHERENCE: 0.75,
            QualityMetric.TONE_MATCH: 0.8,
            QualityMetric.ACCURACY: 0.85,
            QualityMetric.FLUENCY: 0.8,
            QualityMetric.APPROPRIATENESS: 0.75
        }

    def _load_model_performance_history(self):
        """모델 성능 기록 로드 및 가중치 업데이트"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 최근 30일간 성능 데이터 조회
                start_date = datetime.now() - timedelta(days=30)
                cursor.execute("""
                    SELECT model, metric, AVG(score) as avg_score, COUNT(*) as count
                    FROM model_performance 
                    WHERE updated_at > ?
                    GROUP BY model, metric
                """, (start_date.isoformat(),))
                
                performance_data = cursor.fetchall()
                
                # 가중치 동적 조정
                if performance_data:
                    self._update_model_weights(performance_data)
                
                logger.info("모델 성능 기록 로드 및 가중치 업데이트 완료")
                
        except Exception as e:
            logger.error(f"성능 기록 로드 오류: {e}")

    def _update_model_weights(self, performance_data: List[Tuple]):
        """성능 데이터 기반 모델 가중치 업데이트"""
        try:
            model_scores = {}
            
            # 모델별 평균 성능 계산
            for model_name, metric, avg_score, count in performance_data:
                if model_name not in model_scores:
                    model_scores[model_name] = []
                model_scores[model_name].append(avg_score)
            
            # 전체 평균 성능 계산
            for model_name, scores in model_scores.items():
                avg_performance = sum(scores) / len(scores)
                
                try:
                    model_enum = AIModel(model_name)
                    
                    # 성능에 따른 가중치 조정 (±20% 범위)
                    adjustment = (avg_performance - 0.75) * 0.4  # 0.75 기준점
                    adjustment = max(-0.2, min(0.2, adjustment))  # ±20% 제한
                    
                    current_weight = self.model_weights[model_enum]
                    new_weight = max(0.01, current_weight * (1 + adjustment))
                    self.model_weights[model_enum] = new_weight
                    
                    logger.info(f"모델 {model_name} 가중치: {current_weight:.3f} → {new_weight:.3f}")
                    
                except ValueError:
                    continue
            
            # 가중치 정규화
            total_weight = sum(self.model_weights.values())
            for model in self.model_weights:
                self.model_weights[model] /= total_weight
                
        except Exception as e:
            logger.error(f"가중치 업데이트 오류: {e}")

    async def generate_ensemble_response(self, prompt: str, context: Dict[str, Any] = None) -> EnsembleResult:
        """앙상블 기반 응답 생성"""
        start_time = time.time()
        
        try:
            # 요청 해시 생성 (캐싱용)
            request_hash = self._generate_request_hash(prompt, context)
            
            # 캐시 확인
            if request_hash in self.response_cache:
                cached_result = self.response_cache[request_hash]
                logger.info(f"캐시된 결과 반환: {request_hash[:8]}")
                return cached_result
            
            # 병렬로 여러 모델에서 응답 생성
            model_tasks = []
            selected_models = self._select_models_for_request(context)
            
            for model in selected_models:
                task = self._generate_single_model_response(model, prompt, context)
                model_tasks.append(task)
            
            # 모든 모델 응답 대기
            model_responses = await asyncio.gather(*model_tasks, return_exceptions=True)
            
            # 유효한 응답만 필터링
            valid_responses = []
            for response in model_responses:
                if isinstance(response, ModelResponse):
                    valid_responses.append(response)
                else:
                    logger.error(f"모델 응답 오류: {response}")
            
            if not valid_responses:
                raise Exception("모든 모델에서 응답 생성 실패")
            
            # 응답 품질 평가
            for response in valid_responses:
                response.quality_scores = await self._evaluate_response_quality(
                    response.content, prompt, context
                )
            
            # 최적 응답 선택
            ensemble_result = await self._select_best_response(
                valid_responses, prompt, context
            )
            
            ensemble_result.processing_time = time.time() - start_time
            
            # 결과 캐싱 및 저장
            self.response_cache[request_hash] = ensemble_result
            await self._save_ensemble_result(request_hash, ensemble_result, valid_responses)
            
            logger.info(f"앙상블 응답 생성 완료: {ensemble_result.processing_time:.2f}초")
            return ensemble_result
            
        except Exception as e:
            logger.error(f"앙상블 응답 생성 오류: {e}")
            
            # 폴백 응답 생성
            fallback_response = await self._generate_fallback_response(prompt, context)
            fallback_response.processing_time = time.time() - start_time
            return fallback_response

    def _select_models_for_request(self, context: Dict[str, Any] = None) -> List[AIModel]:
        """요청 특성에 따른 모델 선택"""
        try:
            # 기본적으로 상위 3개 모델 선택
            sorted_models = sorted(
                self.model_weights.items(), 
                key=lambda x: x[1], 
                reverse=True
            )
            
            selected_models = [model for model, weight in sorted_models[:3]]
            
            # 컨텍스트 기반 추가 선택 로직
            if context:
                urgency = context.get('urgency_level', 'medium')
                if urgency == 'high':
                    # 긴급한 경우 빠른 모델 우선
                    if AIModel.GPT3_5 not in selected_models:
                        selected_models.append(AIModel.GPT3_5)
                
                complexity = context.get('complexity', 'medium')
                if complexity == 'high':
                    # 복잡한 요청의 경우 고성능 모델 우선
                    if AIModel.GPT4 not in selected_models:
                        selected_models = [AIModel.GPT4] + selected_models[:2]
            
            return selected_models[:4]  # 최대 4개 모델
            
        except Exception as e:
            logger.error(f"모델 선택 오류: {e}")
            return [AIModel.GPT4, AIModel.CLAUDE_3, AIModel.GEMINI_PRO]

    async def _generate_single_model_response(self, model: AIModel, prompt: str, 
                                            context: Dict[str, Any] = None) -> ModelResponse:
        """단일 모델에서 응답 생성"""
        start_time = time.time()
        
        try:
            # 실제 API 호출 대신 시뮬레이션
            await asyncio.sleep(random.uniform(0.5, 2.0))  # 네트워크 지연 시뮬레이션
            
            # 모델별 응답 생성 시뮬레이션
            response_content = await self._simulate_model_response(model, prompt, context)
            
            # 신뢰도 계산 (모델별 특성 반영)
            confidence = self._calculate_model_confidence(model, response_content, context)
            
            response_time = time.time() - start_time
            
            return ModelResponse(
                model=model,
                content=response_content,
                confidence=confidence,
                response_time=response_time,
                metadata={
                    'prompt_length': len(prompt),
                    'context_size': len(str(context)) if context else 0,
                    'model_version': self._get_model_version(model)
                }
            )
            
        except Exception as e:
            logger.error(f"모델 {model.value} 응답 생성 오류: {e}")
            raise

    async def _simulate_model_response(self, model: AIModel, prompt: str, 
                                     context: Dict[str, Any] = None) -> str:
        """모델 응답 시뮬레이션"""
        
        # 기본 응답 템플릿
        base_responses = {
            AIModel.GPT4: "GPT-4 기반의 정확하고 상세한 분석을 통해 다음과 같이 답변드립니다:",
            AIModel.CLAUDE_3: "Claude-3의 신중하고 균형잡힌 관점에서 말씀드리면:",
            AIModel.GEMINI_PRO: "Gemini Pro의 다각도 분석 결과:",
            AIModel.GPT3_5: "GPT-3.5의 효율적인 분석으로 요약하면:",
            AIModel.LOCAL_MODEL: "로컬 모델의 특화된 분석 결과:"
        }
        
        # 컨텍스트 기반 응답 생성
        if context and context.get('message_purpose'):
            purpose = context['message_purpose']
            
            if '환급금' in prompt or '환급' in prompt:
                responses = {
                    AIModel.GPT4: f"환급금 관련 {purpose} 목적의 메시지입니다. 정확한 금액과 일정을 포함하여 신뢰성 있는 정보를 제공하는 것이 중요합니다. 조합원들의 관심사인 만큼 투명하고 명확한 설명이 필요합니다.",
                    AIModel.CLAUDE_3: f"환급금에 대한 {purpose} 차원에서 접근하되, 조합원들의 우려를 충분히 이해하고 공감하는 톤으로 작성하는 것이 좋겠습니다. 구체적인 근거와 함께 안심할 수 있는 메시지가 효과적일 것 같습니다.",
                    AIModel.GEMINI_PRO: f"환급금 이슈는 민감한 사안이므로 {purpose} 목적이라도 신중한 접근이 필요합니다. 사실 기반의 정보와 향후 계획을 균형있게 제시하는 것이 바람직합니다.",
                }
            elif '총회' in prompt:
                responses = {
                    AIModel.GPT4: f"총회 관련 {purpose} 메시지는 공식적이고 절차적인 정보 전달이 핵심입니다. 참석 방법, 안건, 일정 등을 명확히 안내하고 조합원들의 참여를 독려하는 내용이 좋겠습니다.",
                    AIModel.CLAUDE_3: f"총회는 조합 운영의 핵심 사안이므로 {purpose} 목적의 메시지라도 격식을 갖추되 접근하기 쉬운 톤으로 작성하는 것이 효과적입니다.",
                    AIModel.GEMINI_PRO: f"총회 {purpose} 메시지는 참여의 중요성을 강조하면서도 부담스럽지 않은 분위기로 조합원들의 관심을 끌어야 합니다.",
                }
            else:
                responses = base_responses
                
            return responses.get(model, base_responses[model])
        
        return base_responses.get(model, "종합적인 분석을 통한 응답입니다.")

    def _calculate_model_confidence(self, model: AIModel, content: str, 
                                  context: Dict[str, Any] = None) -> float:
        """모델별 신뢰도 계산"""
        try:
            base_confidence = {
                AIModel.GPT4: 0.92,
                AIModel.CLAUDE_3: 0.90,
                AIModel.GEMINI_PRO: 0.87,
                AIModel.GPT3_5: 0.82,
                AIModel.LOCAL_MODEL: 0.75
            }
            
            confidence = base_confidence.get(model, 0.8)
            
            # 컨텐츠 길이 기반 조정
            if len(content) < 50:
                confidence *= 0.9  # 너무 짧은 응답
            elif len(content) > 1000:
                confidence *= 0.95  # 매우 상세한 응답
            
            # 컨텍스트 기반 조정
            if context:
                if context.get('urgency_level') == 'high':
                    confidence *= 0.95  # 긴급 요청은 신뢰도 약간 감소
                if context.get('complexity') == 'high':
                    if model in [AIModel.GPT4, AIModel.CLAUDE_3]:
                        confidence *= 1.02  # 복잡한 요청에서 고성능 모델 신뢰도 증가
            
            return min(0.99, max(0.1, confidence))
            
        except Exception as e:
            logger.error(f"신뢰도 계산 오류: {e}")
            return 0.8

    async def _evaluate_response_quality(self, content: str, prompt: str, 
                                       context: Dict[str, Any] = None) -> Dict[QualityMetric, float]:
        """응답 품질 평가"""
        try:
            quality_scores = {}
            
            # 관련성 평가
            quality_scores[QualityMetric.RELEVANCE] = self._evaluate_relevance(content, prompt)
            
            # 일관성 평가
            quality_scores[QualityMetric.COHERENCE] = self._evaluate_coherence(content)
            
            # 톤 매칭 평가
            quality_scores[QualityMetric.TONE_MATCH] = self._evaluate_tone_match(content, context)
            
            # 정확성 평가
            quality_scores[QualityMetric.ACCURACY] = self._evaluate_accuracy(content, context)
            
            # 유창성 평가
            quality_scores[QualityMetric.FLUENCY] = self._evaluate_fluency(content)
            
            # 적절성 평가
            quality_scores[QualityMetric.APPROPRIATENESS] = self._evaluate_appropriateness(content, context)
            
            return quality_scores
            
        except Exception as e:
            logger.error(f"품질 평가 오류: {e}")
            return {metric: 0.5 for metric in QualityMetric}

    def _evaluate_relevance(self, content: str, prompt: str) -> float:
        """관련성 평가"""
        try:
            # 키워드 매칭 기반 간단한 관련성 평가
            prompt_keywords = set(prompt.lower().split())
            content_keywords = set(content.lower().split())
            
            if not prompt_keywords:
                return 0.5
            
            overlap = len(prompt_keywords & content_keywords)
            relevance = overlap / len(prompt_keywords)
            
            return min(1.0, max(0.1, relevance * 1.5))  # 1.5배 가중치
            
        except Exception as e:
            logger.error(f"관련성 평가 오류: {e}")
            return 0.5

    def _evaluate_coherence(self, content: str) -> float:
        """일관성 평가"""
        try:
            # 문장 길이와 구조 기반 일관성 평가
            sentences = content.split('.')
            
            if len(sentences) < 2:
                return 0.7
            
            # 문장 길이 분산 계산
            sentence_lengths = [len(s.strip()) for s in sentences if s.strip()]
            
            if not sentence_lengths:
                return 0.5
            
            length_variance = statistics.variance(sentence_lengths) if len(sentence_lengths) > 1 else 0
            
            # 분산이 낮을수록 일관성이 높음
            coherence = max(0.3, 1.0 - (length_variance / 10000))
            
            return min(1.0, coherence)
            
        except Exception as e:
            logger.error(f"일관성 평가 오류: {e}")
            return 0.7

    def _evaluate_tone_match(self, content: str, context: Dict[str, Any] = None) -> float:
        """톤 매칭 평가"""
        try:
            if not context:
                return 0.7
            
            target_formality = context.get('formality_level', 'medium')
            
            # 존댓말/반말 비율 계산
            formal_markers = ['습니다', '입니다', '하십시오', '해주세요', '드립니다']
            informal_markers = ['해요', '이에요', '해', '야', '지']
            
            formal_count = sum(content.count(marker) for marker in formal_markers)
            informal_count = sum(content.count(marker) for marker in informal_markers)
            
            total_markers = formal_count + informal_count
            
            if total_markers == 0:
                return 0.6
            
            formal_ratio = formal_count / total_markers
            
            # 목표 격식 수준과 비교
            if target_formality == 'high':
                tone_match = formal_ratio
            elif target_formality == 'low':
                tone_match = 1 - formal_ratio
            else:  # medium
                tone_match = 1 - abs(0.5 - formal_ratio)
            
            return max(0.3, min(1.0, tone_match))
            
        except Exception as e:
            logger.error(f"톤 매칭 평가 오류: {e}")
            return 0.7

    def _evaluate_accuracy(self, content: str, context: Dict[str, Any] = None) -> float:
        """정확성 평가"""
        try:
            # 사실 확인 및 논리적 일관성 평가
            accuracy_score = 0.8  # 기본 점수
            
            # 숫자나 날짜 포함 시 추가 검증
            import re
            
            numbers = re.findall(r'\d+', content)
            if numbers:
                # 숫자가 있는 경우 정확성 중요도 증가
                accuracy_score = 0.85
            
            dates = re.findall(r'\d{4}[-/.]\d{1,2}[-/.]\d{1,2}', content)
            if dates:
                # 날짜 형식이 올바른지 검증
                accuracy_score = 0.87
            
            # 모순되는 표현 검사
            contradictions = [
                ('긍정적', '부정적'), ('좋다', '나쁘다'), ('찬성', '반대'),
                ('증가', '감소'), ('상승', '하락')
            ]
            
            for pos, neg in contradictions:
                if pos in content and neg in content:
                    accuracy_score *= 0.9  # 모순 발견 시 점수 감소
            
            return max(0.3, min(1.0, accuracy_score))
            
        except Exception as e:
            logger.error(f"정확성 평가 오류: {e}")
            return 0.8

    def _evaluate_fluency(self, content: str) -> float:
        """유창성 평가"""
        try:
            # 문법적 유창성 평가
            fluency_score = 0.8
            
            # 반복되는 단어나 구문 검사
            words = content.split()
            word_count = len(words)
            unique_words = len(set(words))
            
            if word_count > 0:
                diversity_ratio = unique_words / word_count
                if diversity_ratio < 0.5:
                    fluency_score *= 0.9  # 다양성 부족
            
            # 문장 구조 검사
            sentences = content.split('.')
            avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
            
            if avg_sentence_length < 3:
                fluency_score *= 0.8  # 너무 짧은 문장
            elif avg_sentence_length > 30:
                fluency_score *= 0.9  # 너무 긴 문장
            
            return max(0.3, min(1.0, fluency_score))
            
        except Exception as e:
            logger.error(f"유창성 평가 오류: {e}")
            return 0.8

    def _evaluate_appropriateness(self, content: str, context: Dict[str, Any] = None) -> float:
        """적절성 평가"""
        try:
            appropriateness_score = 0.8
            
            # 부적절한 표현 검사
            inappropriate_words = ['바보', '멍청', '짜증', '화나', '최악']
            for word in inappropriate_words:
                if word in content:
                    appropriateness_score *= 0.7
            
            # 맥락적 적절성 검사
            if context:
                urgency = context.get('urgency_level', 'medium')
                if urgency == 'high' and len(content) > 500:
                    appropriateness_score *= 0.9  # 긴급 상황에 너무 긴 메시지
            
            return max(0.3, min(1.0, appropriateness_score))
            
        except Exception as e:
            logger.error(f"적절성 평가 오류: {e}")
            return 0.8

    async def _select_best_response(self, responses: List[ModelResponse], prompt: str, 
                                  context: Dict[str, Any] = None) -> EnsembleResult:
        """최적 응답 선택"""
        try:
            # 가중 점수 계산
            weighted_scores = []
            
            for response in responses:
                # 품질 점수 가중 평균
                quality_avg = sum(response.quality_scores.values()) / len(response.quality_scores)
                
                # 모델 가중치 적용
                model_weight = self.model_weights.get(response.model, 0.1)
                
                # 신뢰도 적용
                confidence_weight = response.confidence
                
                # 응답 시간 패널티 (너무 오래 걸린 경우)
                time_penalty = 1.0
                if response.response_time > 3.0:
                    time_penalty = 0.9
                
                # 최종 가중 점수
                weighted_score = (
                    quality_avg * 0.5 +
                    model_weight * 0.3 +
                    confidence_weight * 0.2
                ) * time_penalty
                
                weighted_scores.append((weighted_score, response))
            
            # 최고 점수 응답 선택
            best_score, best_response = max(weighted_scores)
            
            # 앙상블 결과 생성
            ensemble_result = EnsembleResult(
                final_content=best_response.content,
                contributing_models=[best_response.model],
                confidence=best_response.confidence,
                quality_scores=best_response.quality_scores,
                selection_method="weighted_scoring",
                individual_responses=responses,
                processing_time=0.0  # 나중에 설정됨
            )
            
            return ensemble_result
            
        except Exception as e:
            logger.error(f"최적 응답 선택 오류: {e}")
            # 폴백: 첫 번째 응답 사용
            return EnsembleResult(
                final_content=responses[0].content,
                contributing_models=[responses[0].model],
                confidence=responses[0].confidence,
                quality_scores=responses[0].quality_scores,
                selection_method="fallback",
                individual_responses=responses,
                processing_time=0.0
            )

    async def _generate_fallback_response(self, prompt: str, context: Dict[str, Any] = None) -> EnsembleResult:
        """폴백 응답 생성"""
        try:
            fallback_content = "요청하신 내용에 대해 현재 시스템 점검 중입니다. 잠시 후 다시 시도해주시기 바랍니다."
            
            return EnsembleResult(
                final_content=fallback_content,
                contributing_models=[AIModel.LOCAL_MODEL],
                confidence=0.3,
                quality_scores={metric: 0.5 for metric in QualityMetric},
                selection_method="fallback",
                individual_responses=[],
                processing_time=0.0
            )
            
        except Exception as e:
            logger.error(f"폴백 응답 생성 오류: {e}")
            raise

    def _generate_request_hash(self, prompt: str, context: Dict[str, Any] = None) -> str:
        """요청 해시 생성"""
        try:
            hash_input = prompt + str(context) if context else prompt
            return hashlib.md5(hash_input.encode()).hexdigest()
        except Exception as e:
            logger.error(f"해시 생성 오류: {e}")
            return str(hash(prompt))

    def _get_model_version(self, model: AIModel) -> str:
        """모델 버전 정보 반환"""
        versions = {
            AIModel.GPT4: "gpt-4-1106-preview",
            AIModel.GPT3_5: "gpt-3.5-turbo-1106",
            AIModel.CLAUDE_3: "claude-3-sonnet-20240229",
            AIModel.GEMINI_PRO: "gemini-pro-1.0",
            AIModel.LOCAL_MODEL: "llama-2-70b"
        }
        return versions.get(model, "unknown")

    async def _save_ensemble_result(self, request_hash: str, result: EnsembleResult, 
                                  responses: List[ModelResponse]):
        """앙상블 결과 저장"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 앙상블 결과 저장
                cursor.execute("""
                    INSERT INTO ensemble_results 
                    (request_hash, final_content, contributing_models, confidence,
                     quality_scores, selection_method, processing_time, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    request_hash, result.final_content,
                    json.dumps([model.value for model in result.contributing_models]),
                    result.confidence, json.dumps({k.value: v for k, v in result.quality_scores.items()}),
                    result.selection_method, result.processing_time, result.timestamp.isoformat()
                ))
                
                # 개별 모델 응답 저장
                for response in responses:
                    cursor.execute("""
                        INSERT INTO model_responses 
                        (request_hash, model, content, confidence, response_time,
                         quality_scores, metadata, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        request_hash, response.model.value, response.content,
                        response.confidence, response.response_time,
                        json.dumps({k.value: v for k, v in response.quality_scores.items()}),
                        json.dumps(response.metadata), response.timestamp.isoformat()
                    ))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"앙상블 결과 저장 오류: {e}")

    def get_model_performance_stats(self, days: int = 30) -> Dict:
        """모델 성능 통계 조회"""
        try:
            start_date = datetime.now() - timedelta(days=days)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 모델별 성능 통계
                cursor.execute("""
                    SELECT 
                        model,
                        COUNT(*) as total_responses,
                        AVG(confidence) as avg_confidence,
                        AVG(response_time) as avg_response_time
                    FROM model_responses 
                    WHERE timestamp > ?
                    GROUP BY model
                    ORDER BY avg_confidence DESC
                """, (start_date.isoformat(),))
                
                model_stats = cursor.fetchall()
                
                # 품질 메트릭별 통계
                cursor.execute("""
                    SELECT 
                        model,
                        quality_scores
                    FROM model_responses 
                    WHERE timestamp > ? AND quality_scores IS NOT NULL
                """, (start_date.isoformat(),))
                
                quality_data = cursor.fetchall()
                
                # 품질 점수 집계
                quality_by_model = {}
                for model, scores_json in quality_data:
                    if model not in quality_by_model:
                        quality_by_model[model] = []
                    
                    try:
                        scores = json.loads(scores_json)
                        avg_score = sum(scores.values()) / len(scores)
                        quality_by_model[model].append(avg_score)
                    except:
                        continue
                
                # 최종 통계 구성
                performance_stats = {
                    'model_performance': [
                        {
                            'model': row[0],
                            'total_responses': row[1],
                            'avg_confidence': round(row[2], 3),
                            'avg_response_time': round(row[3], 3),
                            'avg_quality': round(
                                sum(quality_by_model.get(row[0], [0.5])) / 
                                len(quality_by_model.get(row[0], [1])), 3
                            ),
                            'current_weight': round(
                                self.model_weights.get(AIModel(row[0]), 0.0), 3
                            ) if row[0] in [m.value for m in AIModel] else 0.0
                        }
                        for row in model_stats
                    ],
                    'period_days': days,
                    'total_requests': len(self.response_cache),
                    'cache_hit_rate': 0.0  # 실제 구현에서는 계산 필요
                }
                
                return performance_stats
                
        except Exception as e:
            logger.error(f"성능 통계 조회 오류: {e}")
            return {}

# 전역 앙상블 시스템 인스턴스
ai_ensemble = AIEnsembleSystem()

# 비동기 함수들
async def generate_ensemble_message(prompt: str, context: Dict[str, Any] = None) -> EnsembleResult:
    """앙상블 기반 메시지 생성"""
    return await ai_ensemble.generate_ensemble_response(prompt, context)

async def evaluate_message_quality(content: str, prompt: str, context: Dict[str, Any] = None) -> Dict:
    """메시지 품질 평가"""
    quality_scores = await ai_ensemble._evaluate_response_quality(content, prompt, context)
    return {metric.value: score for metric, score in quality_scores.items()}

if __name__ == "__main__":
    # 테스트 코드
    async def test_ai_ensemble():
        test_prompt = "환급금 3억원 배분에 대한 조합원 안내 메시지를 작성해주세요."
        test_context = {
            'message_purpose': 'informative',
            'urgency_level': 'medium',
            'formality_level': 'high',
            'target_audience': 'union_members'
        }
        
        print("AI 앙상블 시스템 테스트 시작...")
        
        result = await generate_ensemble_message(test_prompt, test_context)
        
        print(f"\n최종 응답: {result.final_content}")
        print(f"기여 모델: {[model.value for model in result.contributing_models]}")
        print(f"신뢰도: {result.confidence:.3f}")
        print(f"품질 점수: {result.quality_scores}")
        print(f"처리 시간: {result.processing_time:.2f}초")
        print(f"선택 방법: {result.selection_method}")
        
        # 성능 통계 출력
        stats = ai_ensemble.get_model_performance_stats()
        print(f"\n성능 통계: {stats}")
    
    asyncio.run(test_ai_ensemble()) 