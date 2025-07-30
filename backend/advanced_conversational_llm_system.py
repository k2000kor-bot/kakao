"""
고급 대화형 LLM 통합 시스템
- 다중 LLM 모델 통합 (GPT-4, Claude-3, Gemini Pro, 한국어 특화 모델)
- 실시간 대화 처리 및 컨텍스트 관리
- 개인화된 응답 생성
- 대화 흐름 분석 및 최적화
- 멀티턴 대화 메모리 관리
"""

import json
import time
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict
from enum import Enum
import openai
import anthropic
import google.generativeai as genai
import numpy as np
import sqlite3
import re
from konlpy.tag import Okt, Mecab, Hannanum
import kss
import soynlp
from soynlp.tokenizer import LTokenizer
from sentence_transformers import SentenceTransformer
import faiss
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import spacy
from textstat import flesch_reading_ease
import emoji

# 대화 모드
class ConversationMode(Enum):
    CASUAL = "casual"
    FORMAL = "formal"
    CREATIVE = "creative"
    ANALYTICAL = "analytical"
    EMPATHETIC = "empathetic"
    INSTRUCTIONAL = "instructional"

# LLM 모델 타입
class LLMModelType(Enum):
    GPT4 = "gpt-4"
    GPT35_TURBO = "gpt-3.5-turbo"
    CLAUDE3_OPUS = "claude-3-opus"
    CLAUDE3_SONNET = "claude-3-sonnet"
    GEMINI_PRO = "gemini-pro"
    KOREAN_LLM = "korean-llm"
    LOCAL_LLM = "local-llm"

# 응답 품질
class ResponseQuality(Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    AVERAGE = "average"
    POOR = "poor"
    UNACCEPTABLE = "unacceptable"

@dataclass
class ConversationContext:
    """대화 컨텍스트"""
    conversation_id: str
    user_id: str
    session_start: datetime
    last_interaction: datetime
    message_count: int
    context_window: List[Dict[str, Any]] = field(default_factory=list)
    user_profile: Dict[str, Any] = field(default_factory=dict)
    conversation_mode: ConversationMode = ConversationMode.CASUAL
    active_topics: List[str] = field(default_factory=list)
    emotional_state: Dict[str, float] = field(default_factory=dict)
    language_preference: str = "ko"
    formality_level: float = 0.5
    
    def add_message(self, role: str, content: str, metadata: Dict[str, Any] = None):
        """메시지 추가"""
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        self.context_window.append(message)
        self.message_count += 1
        self.last_interaction = datetime.now()
        
        # 컨텍스트 윈도우 크기 제한 (최근 50개 메시지)
        if len(self.context_window) > 50:
            self.context_window = self.context_window[-50:]

@dataclass
class LLMResponse:
    """LLM 응답"""
    model_type: LLMModelType
    content: str
    confidence: float
    response_time: float
    token_count: int
    quality_score: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class ConversationAnalysis:
    """대화 분석 결과"""
    sentiment_score: float
    emotion_distribution: Dict[str, float]
    complexity_score: float
    topic_coherence: float
    engagement_level: float
    formality_level: float
    linguistic_features: Dict[str, Any]
    suggested_response_style: ConversationMode

class KoreanNLPProcessor:
    """한국어 NLP 전용 처리기"""
    
    def __init__(self):
        self.okt = Okt()
        try:
            self.mecab = Mecab()
        except:
            self.mecab = None
            logging.warning("Mecab not available, using Okt only")
        
        self.hannanum = Hannanum()
        
        # 한국어 감정 사전
        self.emotion_dict = {
            '기쁨': ['기쁘다', '행복하다', '즐겁다', '신나다', '좋다', '최고다', '완벽하다'],
            '슬픔': ['슬프다', '우울하다', '안타깝다', '서럽다', '눈물', '울다'],
            '화남': ['화나다', '짜증나다', '분노하다', '열받다', '빡치다', '무화다'],
            '두려움': ['무섭다', '두렵다', '걱정되다', '불안하다', '떨다'],
            '놀라움': ['놀라다', '깜짝', '헉', '와', '대박', '어머'],
            '혐오': ['싫다', '역겹다', '짜증', '골치', '별로다']
        }
        
        # 존댓말/반말 패턴
        self.formality_patterns = {
            'formal': [r'습니다$', r'입니다$', r'였습니다$', r'하십시오$', r'세요$', r'께서'],
            'informal': [r'야$', r'해$', r'다$', r'지$', r'어$', r'너$']
        }
    
    def analyze_korean_text(self, text: str) -> Dict[str, Any]:
        """한국어 텍스트 종합 분석"""
        try:
            analysis = {
                'morphological': self._morphological_analysis(text),
                'sentiment': self._korean_sentiment_analysis(text),
                'formality': self._formality_analysis(text),
                'complexity': self._complexity_analysis(text),
                'topics': self._topic_extraction(text),
                'entities': self._korean_ner(text),
                'readability': self._readability_analysis(text)
            }
            
            return analysis
            
        except Exception as e:
            logging.error(f"한국어 텍스트 분석 오류: {e}")
            return {}
    
    def _morphological_analysis(self, text: str) -> Dict[str, Any]:
        """형태소 분석"""
        try:
            # Okt 분석
            okt_pos = self.okt.pos(text)
            okt_nouns = self.okt.nouns(text)
            
            # Mecab 분석 (가능한 경우)
            mecab_pos = []
            if self.mecab:
                try:
                    mecab_pos = self.mecab.pos(text)
                except:
                    pass
            
            # 품사별 통계
            pos_count = {}
            for word, pos in okt_pos:
                pos_count[pos] = pos_count.get(pos, 0) + 1
            
            return {
                'okt_pos': okt_pos,
                'mecab_pos': mecab_pos,
                'nouns': okt_nouns,
                'pos_distribution': pos_count,
                'word_count': len(okt_pos),
                'unique_words': len(set([word for word, pos in okt_pos]))
            }
            
        except Exception as e:
            logging.error(f"형태소 분석 오류: {e}")
            return {}
    
    def _korean_sentiment_analysis(self, text: str) -> Dict[str, float]:
        """한국어 감정 분석"""
        try:
            emotion_scores = {}
            
            for emotion, keywords in self.emotion_dict.items():
                score = 0
                for keyword in keywords:
                    if keyword in text:
                        score += 1
                
                emotion_scores[emotion] = score / len(keywords) if keywords else 0
            
            # 전체적인 감정 극성
            positive_emotions = ['기쁨']
            negative_emotions = ['슬픔', '화남', '두려움', '혐오']
            
            positive_score = sum(emotion_scores[e] for e in positive_emotions)
            negative_score = sum(emotion_scores[e] for e in negative_emotions)
            
            overall_sentiment = (positive_score - negative_score) / (positive_score + negative_score + 1)
            
            emotion_scores['overall_sentiment'] = overall_sentiment
            emotion_scores['sentiment_intensity'] = positive_score + negative_score
            
            return emotion_scores
            
        except Exception as e:
            logging.error(f"한국어 감정 분석 오류: {e}")
            return {}
    
    def _formality_analysis(self, text: str) -> Dict[str, Any]:
        """격식/비격식 분석"""
        try:
            formal_count = 0
            informal_count = 0
            
            for pattern in self.formality_patterns['formal']:
                formal_count += len(re.findall(pattern, text))
            
            for pattern in self.formality_patterns['informal']:
                informal_count += len(re.findall(pattern, text))
            
            total_patterns = formal_count + informal_count
            
            if total_patterns > 0:
                formality_score = formal_count / total_patterns
            else:
                formality_score = 0.5  # 중립
            
            return {
                'formality_score': formality_score,
                'formal_patterns': formal_count,
                'informal_patterns': informal_count,
                'style': 'formal' if formality_score > 0.6 else 'informal' if formality_score < 0.4 else 'neutral'
            }
            
        except Exception as e:
            logging.error(f"격식성 분석 오류: {e}")
            return {}
    
    def _complexity_analysis(self, text: str) -> Dict[str, Any]:
        """텍스트 복잡도 분석"""
        try:
            sentences = kss.split_sentences(text)
            words = self.okt.morphs(text)
            
            # 문장 길이 통계
            sentence_lengths = [len(sentence.split()) for sentence in sentences]
            avg_sentence_length = np.mean(sentence_lengths) if sentence_lengths else 0
            
            # 어휘 다양성
            unique_words = len(set(words))
            total_words = len(words)
            lexical_diversity = unique_words / total_words if total_words > 0 else 0
            
            # 복잡도 점수 (0-1)
            complexity_score = min(1.0, (avg_sentence_length / 20 + lexical_diversity) / 2)
            
            return {
                'sentence_count': len(sentences),
                'avg_sentence_length': avg_sentence_length,
                'lexical_diversity': lexical_diversity,
                'complexity_score': complexity_score,
                'total_words': total_words,
                'unique_words': unique_words
            }
            
        except Exception as e:
            logging.error(f"복잡도 분석 오류: {e}")
            return {}
    
    def _topic_extraction(self, text: str) -> List[str]:
        """주제 추출"""
        try:
            nouns = self.okt.nouns(text)
            
            # 명사 빈도 계산
            noun_freq = {}
            for noun in nouns:
                if len(noun) > 1:  # 한 글자 명사 제외
                    noun_freq[noun] = noun_freq.get(noun, 0) + 1
            
            # 빈도 순으로 정렬하여 상위 주제 반환
            topics = sorted(noun_freq.items(), key=lambda x: x[1], reverse=True)
            return [topic for topic, freq in topics[:10]]
            
        except Exception as e:
            logging.error(f"주제 추출 오류: {e}")
            return []
    
    def _korean_ner(self, text: str) -> Dict[str, List[str]]:
        """한국어 개체명 인식 (간소화)"""
        try:
            # 간단한 패턴 기반 NER
            entities = {
                'PERSON': [],
                'LOCATION': [],
                'ORGANIZATION': [],
                'DATE': [],
                'TIME': []
            }
            
            # 인명 패턴 (성 + 이름)
            person_pattern = r'[김이박최정강조윤장임한오서신권황안송류전고문양손배조백허유남심노정하곽성차주우구신임전민진어금란의'
            person_matches = re.findall(f'{person_pattern}[가-힣]{{1,3}}', text)
            entities['PERSON'] = person_matches
            
            # 날짜 패턴
            date_patterns = [
                r'\d{4}년\s*\d{1,2}월\s*\d{1,2}일',
                r'\d{1,2}월\s*\d{1,2}일',
                r'\d{4}-\d{1,2}-\d{1,2}'
            ]
            
            for pattern in date_patterns:
                entities['DATE'].extend(re.findall(pattern, text))
            
            # 시간 패턴
            time_patterns = [
                r'\d{1,2}시\s*\d{1,2}분',
                r'\d{1,2}:\d{1,2}',
                r'오전|오후\s*\d{1,2}시'
            ]
            
            for pattern in time_patterns:
                entities['TIME'].extend(re.findall(pattern, text))
            
            return entities
            
        except Exception as e:
            logging.error(f"한국어 NER 오류: {e}")
            return {}
    
    def _readability_analysis(self, text: str) -> Dict[str, float]:
        """가독성 분석"""
        try:
            sentences = kss.split_sentences(text)
            words = self.okt.morphs(text)
            
            # 평균 문장 길이
            avg_sentence_length = len(words) / len(sentences) if sentences else 0
            
            # 한국어 가독성 점수 (간소화)
            readability_score = max(0, min(100, 100 - (avg_sentence_length - 10) * 5))
            
            return {
                'readability_score': readability_score,
                'avg_sentence_length': avg_sentence_length,
                'level': 'easy' if readability_score > 70 else 'medium' if readability_score > 40 else 'hard'
            }
            
        except Exception as e:
            logging.error(f"가독성 분석 오류: {e}")
            return {}

class AdvancedLLMManager:
    """고급 LLM 관리자"""
    
    def __init__(self):
        self.models = {}
        self.embeddings_model = None
        self.korean_nlp = KoreanNLPProcessor()
        self.response_cache = {}
        self.model_performance = {}
        
        # 초기화
        self._initialize_models()
        self._initialize_embeddings()
    
    def _initialize_models(self):
        """모델 초기화"""
        try:
            # OpenAI GPT 모델
            self.models[LLMModelType.GPT4] = {
                'client': openai,
                'model_name': 'gpt-4',
                'max_tokens': 8192,
                'temperature': 0.7
            }
            
            self.models[LLMModelType.GPT35_TURBO] = {
                'client': openai,
                'model_name': 'gpt-3.5-turbo',
                'max_tokens': 4096,
                'temperature': 0.7
            }
            
            # Anthropic Claude
            try:
                claude_client = anthropic.Anthropic()
                self.models[LLMModelType.CLAUDE3_OPUS] = {
                    'client': claude_client,
                    'model_name': 'claude-3-opus-20240229',
                    'max_tokens': 4096,
                    'temperature': 0.7
                }
                
                self.models[LLMModelType.CLAUDE3_SONNET] = {
                    'client': claude_client,
                    'model_name': 'claude-3-sonnet-20240229',
                    'max_tokens': 4096,
                    'temperature': 0.7
                }
            except Exception as e:
                logging.warning(f"Claude 모델 초기화 실패: {e}")
            
            # Google Gemini
            try:
                self.models[LLMModelType.GEMINI_PRO] = {
                    'client': genai,
                    'model_name': 'gemini-pro',
                    'max_tokens': 4096,
                    'temperature': 0.7
                }
            except Exception as e:
                logging.warning(f"Gemini 모델 초기화 실패: {e}")
            
            logging.info(f"LLM 모델 초기화 완료: {len(self.models)}개 모델")
            
        except Exception as e:
            logging.error(f"LLM 모델 초기화 오류: {e}")
    
    def _initialize_embeddings(self):
        """임베딩 모델 초기화"""
        try:
            # 다국어 임베딩 모델
            self.embeddings_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            logging.info("임베딩 모델 초기화 완료")
            
        except Exception as e:
            logging.error(f"임베딩 모델 초기화 오류: {e}")
    
    async def generate_response(self, 
                               prompt: str, 
                               context: ConversationContext,
                               model_type: LLMModelType = LLMModelType.GPT4,
                               **kwargs) -> LLMResponse:
        """응답 생성"""
        start_time = time.time()
        
        try:
            # 캐시 확인
            cache_key = f"{model_type.value}:{hash(prompt)}:{context.conversation_mode.value}"
            if cache_key in self.response_cache:
                cached_response = self.response_cache[cache_key]
                logging.info("캐시된 응답 사용")
                return cached_response
            
            # 모델별 응답 생성
            if model_type in [LLMModelType.GPT4, LLMModelType.GPT35_TURBO]:
                response = await self._generate_openai_response(prompt, context, model_type, **kwargs)
            elif model_type in [LLMModelType.CLAUDE3_OPUS, LLMModelType.CLAUDE3_SONNET]:
                response = await self._generate_claude_response(prompt, context, model_type, **kwargs)
            elif model_type == LLMModelType.GEMINI_PRO:
                response = await self._generate_gemini_response(prompt, context, **kwargs)
            else:
                raise ValueError(f"지원하지 않는 모델: {model_type}")
            
            # 응답 시간 기록
            response_time = time.time() - start_time
            response.response_time = response_time
            
            # 성능 메트릭 업데이트
            self._update_model_performance(model_type, response)
            
            # 캐시 저장 (최근 100개)
            if len(self.response_cache) >= 100:
                oldest_key = next(iter(self.response_cache))
                del self.response_cache[oldest_key]
            
            self.response_cache[cache_key] = response
            
            return response
            
        except Exception as e:
            logging.error(f"응답 생성 오류: {e}")
            return LLMResponse(
                model_type=model_type,
                content="죄송합니다. 응답을 생성하는데 문제가 발생했습니다.",
                confidence=0.0,
                response_time=time.time() - start_time,
                token_count=0,
                quality_score=0.0
            )
    
    async def _generate_openai_response(self, 
                                      prompt: str, 
                                      context: ConversationContext,
                                      model_type: LLMModelType,
                                      **kwargs) -> LLMResponse:
        """OpenAI 응답 생성"""
        try:
            model_config = self.models[model_type]
            
            # 대화 히스토리 구성
            messages = []
            
            # 시스템 메시지
            system_message = self._create_system_message(context)
            messages.append({"role": "system", "content": system_message})
            
            # 컨텍스트 메시지 추가
            for msg in context.context_window[-10:]:  # 최근 10개 메시지
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            # 현재 프롬프트
            messages.append({"role": "user", "content": prompt})
            
            # API 호출
            response = await openai.ChatCompletion.acreate(
                model=model_config['model_name'],
                messages=messages,
                max_tokens=kwargs.get('max_tokens', model_config['max_tokens']),
                temperature=kwargs.get('temperature', model_config['temperature']),
                top_p=kwargs.get('top_p', 1.0),
                frequency_penalty=kwargs.get('frequency_penalty', 0.0),
                presence_penalty=kwargs.get('presence_penalty', 0.0)
            )
            
            content = response.choices[0].message.content
            token_count = response.usage.total_tokens
            
            # 품질 평가
            quality_score = await self._evaluate_response_quality(content, prompt, context)
            
            return LLMResponse(
                model_type=model_type,
                content=content,
                confidence=0.9,  # OpenAI는 신뢰도를 직접 제공하지 않음
                response_time=0.0,  # 나중에 설정
                token_count=token_count,
                quality_score=quality_score,
                metadata={
                    'finish_reason': response.choices[0].finish_reason,
                    'model': response.model
                }
            )
            
        except Exception as e:
            logging.error(f"OpenAI 응답 생성 오류: {e}")
            raise e
    
    async def _generate_claude_response(self, 
                                      prompt: str, 
                                      context: ConversationContext,
                                      model_type: LLMModelType,
                                      **kwargs) -> LLMResponse:
        """Claude 응답 생성"""
        try:
            model_config = self.models[model_type]
            client = model_config['client']
            
            # 대화 히스토리 구성
            messages = []
            for msg in context.context_window[-10:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            messages.append({"role": "user", "content": prompt})
            
            # 시스템 메시지
            system_message = self._create_system_message(context)
            
            # API 호출
            response = await client.messages.create(
                model=model_config['model_name'],
                max_tokens=kwargs.get('max_tokens', model_config['max_tokens']),
                temperature=kwargs.get('temperature', model_config['temperature']),
                system=system_message,
                messages=messages
            )
            
            content = response.content[0].text
            token_count = response.usage.input_tokens + response.usage.output_tokens
            
            # 품질 평가
            quality_score = await self._evaluate_response_quality(content, prompt, context)
            
            return LLMResponse(
                model_type=model_type,
                content=content,
                confidence=0.9,
                response_time=0.0,
                token_count=token_count,
                quality_score=quality_score,
                metadata={
                    'stop_reason': response.stop_reason,
                    'model': response.model
                }
            )
            
        except Exception as e:
            logging.error(f"Claude 응답 생성 오류: {e}")
            raise e
    
    async def _generate_gemini_response(self, 
                                      prompt: str, 
                                      context: ConversationContext,
                                      **kwargs) -> LLMResponse:
        """Gemini 응답 생성"""
        try:
            model_config = self.models[LLMModelType.GEMINI_PRO]
            
            # 모델 설정
            generation_config = genai.GenerationConfig(
                temperature=kwargs.get('temperature', model_config['temperature']),
                top_p=kwargs.get('top_p', 0.95),
                top_k=kwargs.get('top_k', 64),
                max_output_tokens=kwargs.get('max_tokens', model_config['max_tokens'])
            )
            
            model = genai.GenerativeModel(
                model_name=model_config['model_name'],
                generation_config=generation_config
            )
            
            # 대화 히스토리 구성
            chat = model.start_chat(history=[])
            
            # 컨텍스트 추가
            for msg in context.context_window[-5:]:  # 최근 5개 메시지
                if msg["role"] == "user":
                    chat.send_message(msg["content"])
            
            # 응답 생성
            response = chat.send_message(prompt)
            content = response.text
            
            # 토큰 수 추정 (Gemini는 정확한 토큰 수를 제공하지 않음)
            token_count = len(content.split()) * 1.3  # 추정값
            
            # 품질 평가
            quality_score = await self._evaluate_response_quality(content, prompt, context)
            
            return LLMResponse(
                model_type=LLMModelType.GEMINI_PRO,
                content=content,
                confidence=0.85,
                response_time=0.0,
                token_count=int(token_count),
                quality_score=quality_score,
                metadata={
                    'model': model_config['model_name']
                }
            )
            
        except Exception as e:
            logging.error(f"Gemini 응답 생성 오류: {e}")
            raise e
    
    def _create_system_message(self, context: ConversationContext) -> str:
        """시스템 메시지 생성"""
        try:
            # 기본 시스템 메시지
            base_message = "당신은 도움이 되고 친근한 AI 어시스턴트입니다. "
            
            # 대화 모드에 따른 스타일 조정
            mode_instructions = {
                ConversationMode.CASUAL: "편안하고 친근한 톤으로 대화해주세요.",
                ConversationMode.FORMAL: "정중하고 격식있는 톤으로 대화해주세요.",
                ConversationMode.CREATIVE: "창의적이고 상상력이 풍부한 답변을 제공해주세요.",
                ConversationMode.ANALYTICAL: "논리적이고 분석적인 접근으로 답변해주세요.",
                ConversationMode.EMPATHETIC: "공감하고 이해하는 톤으로 대화해주세요.",
                ConversationMode.INSTRUCTIONAL: "명확하고 교육적인 방식으로 설명해주세요."
            }
            
            mode_instruction = mode_instructions.get(context.conversation_mode, "")
            
            # 격식성 조정
            if context.formality_level > 0.7:
                formality_instruction = " 존댓말을 사용해주세요."
            elif context.formality_level < 0.3:
                formality_instruction = " 친근한 반말로 대화해주세요."
            else:
                formality_instruction = " 적절한 높임말을 사용해주세요."
            
            # 사용자 프로필 고려
            profile_instruction = ""
            if context.user_profile:
                interests = context.user_profile.get('interests', [])
                if interests:
                    profile_instruction = f" 사용자의 관심사({', '.join(interests)})를 고려해주세요."
            
            # 현재 토픽 고려
            topic_instruction = ""
            if context.active_topics:
                topic_instruction = f" 현재 대화 주제: {', '.join(context.active_topics)}"
            
            return f"{base_message}{mode_instruction}{formality_instruction}{profile_instruction}{topic_instruction}"
            
        except Exception as e:
            logging.error(f"시스템 메시지 생성 오류: {e}")
            return "당신은 도움이 되는 AI 어시스턴트입니다."
    
    async def _evaluate_response_quality(self, 
                                       response: str, 
                                       prompt: str, 
                                       context: ConversationContext) -> float:
        """응답 품질 평가"""
        try:
            quality_scores = []
            
            # 1. 한국어 분석
            korean_analysis = self.korean_nlp.analyze_korean_text(response)
            
            # 복잡도 점수
            complexity = korean_analysis.get('complexity', {})
            complexity_score = complexity.get('complexity_score', 0.5)
            quality_scores.append(min(1.0, complexity_score * 2))  # 적절한 복잡도
            
            # 2. 길이 적절성
            response_length = len(response)
            if 50 <= response_length <= 1000:
                length_score = 1.0
            elif response_length < 50:
                length_score = response_length / 50
            else:
                length_score = max(0.5, 1000 / response_length)
            
            quality_scores.append(length_score)
            
            # 3. 감정 적절성
            sentiment = korean_analysis.get('sentiment', {})
            emotion_appropriateness = 1.0 - abs(sentiment.get('overall_sentiment', 0))
            quality_scores.append(emotion_appropriateness)
            
            # 4. 격식성 일치도
            formality = korean_analysis.get('formality', {})
            formality_score = formality.get('formality_score', 0.5)
            expected_formality = context.formality_level
            formality_match = 1.0 - abs(formality_score - expected_formality)
            quality_scores.append(formality_match)
            
            # 5. 주제 관련성
            response_topics = korean_analysis.get('topics', [])
            context_topics = context.active_topics
            
            if context_topics and response_topics:
                topic_overlap = len(set(response_topics) & set(context_topics))
                topic_relevance = topic_overlap / len(context_topics)
            else:
                topic_relevance = 0.7  # 기본값
            
            quality_scores.append(topic_relevance)
            
            # 6. 가독성
            readability = korean_analysis.get('readability', {})
            readability_score = readability.get('readability_score', 70) / 100
            quality_scores.append(readability_score)
            
            # 전체 품질 점수 계산
            overall_quality = np.mean(quality_scores)
            
            return min(1.0, max(0.0, overall_quality))
            
        except Exception as e:
            logging.error(f"응답 품질 평가 오류: {e}")
            return 0.7  # 기본값
    
    def _update_model_performance(self, model_type: LLMModelType, response: LLMResponse):
        """모델 성능 업데이트"""
        try:
            if model_type not in self.model_performance:
                self.model_performance[model_type] = {
                    'total_requests': 0,
                    'total_response_time': 0.0,
                    'total_quality_score': 0.0,
                    'total_tokens': 0
                }
            
            perf = self.model_performance[model_type]
            perf['total_requests'] += 1
            perf['total_response_time'] += response.response_time
            perf['total_quality_score'] += response.quality_score
            perf['total_tokens'] += response.token_count
            
        except Exception as e:
            logging.error(f"모델 성능 업데이트 오류: {e}")
    
    def get_model_performance_stats(self) -> Dict[str, Dict[str, float]]:
        """모델 성능 통계"""
        try:
            stats = {}
            
            for model_type, perf in self.model_performance.items():
                if perf['total_requests'] > 0:
                    stats[model_type.value] = {
                        'avg_response_time': perf['total_response_time'] / perf['total_requests'],
                        'avg_quality_score': perf['total_quality_score'] / perf['total_requests'],
                        'avg_tokens_per_request': perf['total_tokens'] / perf['total_requests'],
                        'total_requests': perf['total_requests']
                    }
            
            return stats
            
        except Exception as e:
            logging.error(f"모델 성능 통계 오류: {e}")
            return {}

class ConversationManager:
    """대화 관리자"""
    
    def __init__(self, db_path: str = "conversation_llm.db"):
        self.db_path = db_path
        self.llm_manager = AdvancedLLMManager()
        self.active_conversations: Dict[str, ConversationContext] = {}
        self.conversation_analyzer = ConversationAnalyzer()
        
        # 데이터베이스 초기화
        self.init_database()
    
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 대화 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                conversation_id TEXT PRIMARY KEY,
                user_id TEXT,
                session_start TEXT,
                last_interaction TEXT,
                message_count INTEGER,
                conversation_mode TEXT,
                language_preference TEXT,
                formality_level REAL,
                user_profile TEXT
            )
        """)
        
        # 메시지 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                message_id TEXT PRIMARY KEY,
                conversation_id TEXT,
                role TEXT,
                content TEXT,
                timestamp TEXT,
                model_type TEXT,
                response_time REAL,
                quality_score REAL,
                metadata TEXT,
                FOREIGN KEY (conversation_id) REFERENCES conversations (conversation_id)
            )
        """)
        
        # 대화 분석 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversation_analysis (
                analysis_id TEXT PRIMARY KEY,
                conversation_id TEXT,
                analysis_timestamp TEXT,
                sentiment_score REAL,
                complexity_score REAL,
                engagement_level REAL,
                topic_coherence REAL,
                analysis_data TEXT,
                FOREIGN KEY (conversation_id) REFERENCES conversations (conversation_id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    async def start_conversation(self, user_id: str, 
                               conversation_mode: ConversationMode = ConversationMode.CASUAL,
                               user_profile: Dict[str, Any] = None) -> str:
        """대화 시작"""
        try:
            conversation_id = str(uuid.uuid4())
            
            context = ConversationContext(
                conversation_id=conversation_id,
                user_id=user_id,
                session_start=datetime.now(),
                last_interaction=datetime.now(),
                message_count=0,
                conversation_mode=conversation_mode,
                user_profile=user_profile or {},
                language_preference="ko"
            )
            
            self.active_conversations[conversation_id] = context
            
            # 데이터베이스에 저장
            await self._save_conversation_to_db(context)
            
            logging.info(f"새 대화 시작: {conversation_id}")
            
            return conversation_id
            
        except Exception as e:
            logging.error(f"대화 시작 오류: {e}")
            raise e
    
    async def send_message(self, 
                          conversation_id: str, 
                          message: str,
                          model_type: LLMModelType = LLMModelType.GPT4,
                          **kwargs) -> Dict[str, Any]:
        """메시지 전송 및 응답 생성"""
        try:
            # 대화 컨텍스트 확인
            if conversation_id not in self.active_conversations:
                # 데이터베이스에서 로드 시도
                context = await self._load_conversation_from_db(conversation_id)
                if not context:
                    raise ValueError("존재하지 않는 대화입니다")
                self.active_conversations[conversation_id] = context
            
            context = self.active_conversations[conversation_id]
            
            # 사용자 메시지 추가
            context.add_message("user", message)
            
            # 메시지 분석
            message_analysis = self.llm_manager.korean_nlp.analyze_korean_text(message)
            
            # 컨텍스트 업데이트
            await self._update_context_from_analysis(context, message_analysis)
            
            # LLM 응답 생성
            llm_response = await self.llm_manager.generate_response(
                message, context, model_type, **kwargs
            )
            
            # 어시스턴트 응답 추가
            context.add_message("assistant", llm_response.content, {
                "model_type": llm_response.model_type.value,
                "quality_score": llm_response.quality_score,
                "response_time": llm_response.response_time
            })
            
            # 데이터베이스에 메시지 저장
            await self._save_message_to_db(
                conversation_id, "user", message, None, message_analysis
            )
            await self._save_message_to_db(
                conversation_id, "assistant", llm_response.content, llm_response, {}
            )
            
            # 대화 분석
            conversation_analysis = await self.conversation_analyzer.analyze_conversation(context)
            
            return {
                "conversation_id": conversation_id,
                "user_message": message,
                "assistant_response": llm_response.content,
                "response_metadata": {
                    "model_type": llm_response.model_type.value,
                    "confidence": llm_response.confidence,
                    "quality_score": llm_response.quality_score,
                    "response_time": llm_response.response_time,
                    "token_count": llm_response.token_count
                },
                "conversation_analysis": asdict(conversation_analysis),
                "context_updated": {
                    "active_topics": context.active_topics,
                    "emotional_state": context.emotional_state,
                    "formality_level": context.formality_level
                }
            }
            
        except Exception as e:
            logging.error(f"메시지 전송 오류: {e}")
            return {
                "error": str(e),
                "conversation_id": conversation_id
            }
    
    async def _update_context_from_analysis(self, 
                                          context: ConversationContext, 
                                          analysis: Dict[str, Any]):
        """분석 결과로 컨텍스트 업데이트"""
        try:
            # 주제 업데이트
            topics = analysis.get('topics', [])
            for topic in topics[:3]:  # 상위 3개 주제
                if topic not in context.active_topics:
                    context.active_topics.append(topic)
            
            # 최근 5개 주제만 유지
            context.active_topics = context.active_topics[-5:]
            
            # 감정 상태 업데이트
            sentiment = analysis.get('sentiment', {})
            for emotion, score in sentiment.items():
                if emotion != 'overall_sentiment':
                    context.emotional_state[emotion] = score
            
            # 격식성 수준 업데이트
            formality = analysis.get('formality', {})
            formality_score = formality.get('formality_score', context.formality_level)
            
            # 지수 이동 평균으로 부드럽게 업데이트
            alpha = 0.3
            context.formality_level = (1 - alpha) * context.formality_level + alpha * formality_score
            
        except Exception as e:
            logging.error(f"컨텍스트 업데이트 오류: {e}")
    
    async def _save_conversation_to_db(self, context: ConversationContext):
        """대화를 데이터베이스에 저장"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO conversations 
                (conversation_id, user_id, session_start, last_interaction, 
                 message_count, conversation_mode, language_preference, 
                 formality_level, user_profile)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                context.conversation_id,
                context.user_id,
                context.session_start.isoformat(),
                context.last_interaction.isoformat(),
                context.message_count,
                context.conversation_mode.value,
                context.language_preference,
                context.formality_level,
                json.dumps(context.user_profile)
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logging.error(f"대화 저장 오류: {e}")
    
    async def _save_message_to_db(self, 
                                conversation_id: str, 
                                role: str, 
                                content: str,
                                llm_response: Optional[LLMResponse] = None,
                                analysis: Dict[str, Any] = None):
        """메시지를 데이터베이스에 저장"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            message_id = str(uuid.uuid4())
            
            cursor.execute("""
                INSERT INTO messages 
                (message_id, conversation_id, role, content, timestamp,
                 model_type, response_time, quality_score, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                message_id,
                conversation_id,
                role,
                content,
                datetime.now().isoformat(),
                llm_response.model_type.value if llm_response else None,
                llm_response.response_time if llm_response else None,
                llm_response.quality_score if llm_response else None,
                json.dumps({
                    "analysis": analysis,
                    "llm_metadata": llm_response.metadata if llm_response else {}
                })
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logging.error(f"메시지 저장 오류: {e}")
    
    async def _load_conversation_from_db(self, conversation_id: str) -> Optional[ConversationContext]:
        """데이터베이스에서 대화 로드"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 대화 정보 조회
            cursor.execute("""
                SELECT user_id, session_start, last_interaction, message_count,
                       conversation_mode, language_preference, formality_level, user_profile
                FROM conversations WHERE conversation_id = ?
            """, (conversation_id,))
            
            conv_data = cursor.fetchone()
            if not conv_data:
                return None
            
            # 컨텍스트 복원
            context = ConversationContext(
                conversation_id=conversation_id,
                user_id=conv_data[0],
                session_start=datetime.fromisoformat(conv_data[1]),
                last_interaction=datetime.fromisoformat(conv_data[2]),
                message_count=conv_data[3],
                conversation_mode=ConversationMode(conv_data[4]),
                language_preference=conv_data[5],
                formality_level=conv_data[6],
                user_profile=json.loads(conv_data[7])
            )
            
            # 최근 메시지 로드
            cursor.execute("""
                SELECT role, content, timestamp, metadata
                FROM messages 
                WHERE conversation_id = ?
                ORDER BY timestamp DESC
                LIMIT 20
            """, (conversation_id,))
            
            messages = cursor.fetchall()
            for msg in reversed(messages):  # 시간 순으로 정렬
                metadata = json.loads(msg[3]) if msg[3] else {}
                context.context_window.append({
                    "role": msg[0],
                    "content": msg[1],
                    "timestamp": msg[2],
                    "metadata": metadata
                })
            
            conn.close()
            
            return context
            
        except Exception as e:
            logging.error(f"대화 로드 오류: {e}")
            return None
    
    async def get_conversation_history(self, 
                                     conversation_id: str, 
                                     limit: int = 50) -> List[Dict[str, Any]]:
        """대화 기록 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT role, content, timestamp, model_type, response_time, 
                       quality_score, metadata
                FROM messages 
                WHERE conversation_id = ?
                ORDER BY timestamp ASC
                LIMIT ?
            """, (conversation_id, limit))
            
            messages = []
            for row in cursor.fetchall():
                message = {
                    "role": row[0],
                    "content": row[1],
                    "timestamp": row[2],
                    "model_type": row[3],
                    "response_time": row[4],
                    "quality_score": row[5],
                    "metadata": json.loads(row[6]) if row[6] else {}
                }
                messages.append(message)
            
            conn.close()
            
            return messages
            
        except Exception as e:
            logging.error(f"대화 기록 조회 오류: {e}")
            return []
    
    async def get_conversation_statistics(self) -> Dict[str, Any]:
        """대화 통계"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 전체 대화 수
            cursor.execute("SELECT COUNT(*) FROM conversations")
            total_conversations = cursor.fetchone()[0]
            
            # 전체 메시지 수
            cursor.execute("SELECT COUNT(*) FROM messages")
            total_messages = cursor.fetchone()[0]
            
            # 평균 응답 시간
            cursor.execute("""
                SELECT AVG(response_time) FROM messages 
                WHERE response_time IS NOT NULL
            """)
            avg_response_time = cursor.fetchone()[0] or 0
            
            # 평균 품질 점수
            cursor.execute("""
                SELECT AVG(quality_score) FROM messages 
                WHERE quality_score IS NOT NULL
            """)
            avg_quality_score = cursor.fetchone()[0] or 0
            
            # 모델별 사용 통계
            cursor.execute("""
                SELECT model_type, COUNT(*), AVG(response_time), AVG(quality_score)
                FROM messages 
                WHERE model_type IS NOT NULL
                GROUP BY model_type
            """)
            
            model_stats = {}
            for row in cursor.fetchall():
                model_stats[row[0]] = {
                    "usage_count": row[1],
                    "avg_response_time": row[2] or 0,
                    "avg_quality_score": row[3] or 0
                }
            
            conn.close()
            
            return {
                "total_conversations": total_conversations,
                "total_messages": total_messages,
                "avg_response_time": avg_response_time,
                "avg_quality_score": avg_quality_score,
                "model_statistics": model_stats,
                "active_conversations": len(self.active_conversations)
            }
            
        except Exception as e:
            logging.error(f"대화 통계 조회 오류: {e}")
            return {}

class ConversationAnalyzer:
    """대화 분석기"""
    
    def __init__(self):
        self.korean_nlp = KoreanNLPProcessor()
    
    async def analyze_conversation(self, context: ConversationContext) -> ConversationAnalysis:
        """대화 종합 분석"""
        try:
            if not context.context_window:
                return ConversationAnalysis(
                    sentiment_score=0.0,
                    emotion_distribution={},
                    complexity_score=0.0,
                    topic_coherence=0.0,
                    engagement_level=0.0,
                    formality_level=0.0,
                    linguistic_features={},
                    suggested_response_style=ConversationMode.CASUAL
                )
            
            # 최근 메시지들만 분석
            recent_messages = context.context_window[-10:]
            
            # 전체 텍스트 결합
            all_text = " ".join([msg["content"] for msg in recent_messages])
            
            # 한국어 분석
            korean_analysis = self.korean_nlp.analyze_korean_text(all_text)
            
            # 감정 분석
            sentiment = korean_analysis.get('sentiment', {})
            sentiment_score = sentiment.get('overall_sentiment', 0.0)
            emotion_distribution = {k: v for k, v in sentiment.items() if k != 'overall_sentiment'}
            
            # 복잡도 분석
            complexity = korean_analysis.get('complexity', {})
            complexity_score = complexity.get('complexity_score', 0.0)
            
            # 주제 일관성
            topics = korean_analysis.get('topics', [])
            topic_coherence = self._calculate_topic_coherence(recent_messages, topics)
            
            # 참여도 분석
            engagement_level = self._calculate_engagement_level(recent_messages)
            
            # 격식성 분석
            formality = korean_analysis.get('formality', {})
            formality_level = formality.get('formality_score', 0.5)
            
            # 언어적 특성
            linguistic_features = {
                'readability': korean_analysis.get('readability', {}),
                'morphological': korean_analysis.get('morphological', {}),
                'entities': korean_analysis.get('entities', {})
            }
            
            # 추천 응답 스타일
            suggested_style = self._suggest_response_style(
                sentiment_score, complexity_score, formality_level, engagement_level
            )
            
            return ConversationAnalysis(
                sentiment_score=sentiment_score,
                emotion_distribution=emotion_distribution,
                complexity_score=complexity_score,
                topic_coherence=topic_coherence,
                engagement_level=engagement_level,
                formality_level=formality_level,
                linguistic_features=linguistic_features,
                suggested_response_style=suggested_style
            )
            
        except Exception as e:
            logging.error(f"대화 분석 오류: {e}")
            return ConversationAnalysis(
                sentiment_score=0.0,
                emotion_distribution={},
                complexity_score=0.0,
                topic_coherence=0.0,
                engagement_level=0.0,
                formality_level=0.0,
                linguistic_features={},
                suggested_response_style=ConversationMode.CASUAL
            )
    
    def _calculate_topic_coherence(self, messages: List[Dict[str, Any]], topics: List[str]) -> float:
        """주제 일관성 계산"""
        try:
            if len(messages) < 2:
                return 1.0
            
            # 각 메시지의 주제 추출
            message_topics = []
            for msg in messages:
                msg_topics = self.korean_nlp._topic_extraction(msg["content"])
                message_topics.append(set(msg_topics[:5]))  # 상위 5개 주제
            
            # 인접한 메시지 간 주제 중복도
            coherence_scores = []
            for i in range(len(message_topics) - 1):
                topics1 = message_topics[i]
                topics2 = message_topics[i + 1]
                
                if not topics1 or not topics2:
                    coherence_scores.append(0.5)
                else:
                    overlap = len(topics1 & topics2)
                    union = len(topics1 | topics2)
                    coherence = overlap / union if union > 0 else 0
                    coherence_scores.append(coherence)
            
            return np.mean(coherence_scores) if coherence_scores else 0.0
            
        except Exception as e:
            logging.error(f"주제 일관성 계산 오류: {e}")
            return 0.0
    
    def _calculate_engagement_level(self, messages: List[Dict[str, Any]]) -> float:
        """참여도 계산"""
        try:
            if not messages:
                return 0.0
            
            # 메시지 길이 변화
            lengths = [len(msg["content"]) for msg in messages]
            avg_length = np.mean(lengths)
            
            # 응답 시간 간격 (시뮬레이션)
            # 실제로는 메시지 간 시간 간격을 계산
            
            # 감정 표현 빈도
            emotion_keywords = ['!', '?', '^^', 'ㅋㅋ', 'ㅎㅎ', '와', '헉', '대박']
            emotion_count = sum(
                sum(keyword in msg["content"] for keyword in emotion_keywords)
                for msg in messages
            )
            
            # 이모티콘 사용
            emoji_count = sum(
                len([char for char in msg["content"] if emoji.is_emoji(char)])
                for msg in messages
            )
            
            # 종합 참여도 점수
            length_score = min(1.0, avg_length / 100)  # 100자 기준
            emotion_score = min(1.0, emotion_count / len(messages))
            emoji_score = min(1.0, emoji_count / len(messages))
            
            engagement = (length_score + emotion_score + emoji_score) / 3
            
            return engagement
            
        except Exception as e:
            logging.error(f"참여도 계산 오류: {e}")
            return 0.5
    
    def _suggest_response_style(self, 
                              sentiment: float, 
                              complexity: float, 
                              formality: float, 
                              engagement: float) -> ConversationMode:
        """응답 스타일 추천"""
        try:
            # 감정이 부정적이면 공감적 응답
            if sentiment < -0.3:
                return ConversationMode.EMPATHETIC
            
            # 높은 격식성
            if formality > 0.7:
                return ConversationMode.FORMAL
            
            # 높은 복잡도
            if complexity > 0.7:
                return ConversationMode.ANALYTICAL
            
            # 낮은 참여도
            if engagement < 0.3:
                return ConversationMode.CREATIVE
            
            # 높은 참여도 + 긍정적 감정
            if engagement > 0.7 and sentiment > 0.3:
                return ConversationMode.CASUAL
            
            # 기본값
            return ConversationMode.CASUAL
            
        except Exception as e:
            logging.error(f"응답 스타일 추천 오류: {e}")
            return ConversationMode.CASUAL

# FastAPI 통합
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

class StartConversationRequest(BaseModel):
    user_id: str
    conversation_mode: str = "casual"
    user_profile: Optional[Dict[str, Any]] = None

class SendMessageRequest(BaseModel):
    conversation_id: str
    message: str
    model_type: str = "gpt-4"
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None

class UpdateContextRequest(BaseModel):
    conversation_id: str
    conversation_mode: Optional[str] = None
    formality_level: Optional[float] = None
    active_topics: Optional[List[str]] = None

# 글로벌 매니저
conversation_manager = None

async def get_conversation_manager():
    global conversation_manager
    if conversation_manager is None:
        conversation_manager = ConversationManager()
    return conversation_manager

def create_conversational_llm_app() -> FastAPI:
    app = FastAPI(title="Advanced Conversational LLM System", version="1.0.0")
    
    @app.post("/conversations/start")
    async def start_conversation(request: StartConversationRequest):
        """대화 시작"""
        manager = await get_conversation_manager()
        
        try:
            conversation_mode = ConversationMode(request.conversation_mode)
        except ValueError:
            raise HTTPException(status_code=400, detail="잘못된 대화 모드")
        
        conversation_id = await manager.start_conversation(
            request.user_id, conversation_mode, request.user_profile
        )
        
        return {
            "conversation_id": conversation_id,
            "user_id": request.user_id,
            "conversation_mode": conversation_mode.value,
            "message": "대화가 시작되었습니다!"
        }
    
    @app.post("/conversations/message")
    async def send_message(request: SendMessageRequest):
        """메시지 전송"""
        manager = await get_conversation_manager()
        
        try:
            model_type = LLMModelType(request.model_type)
        except ValueError:
            raise HTTPException(status_code=400, detail="지원하지 않는 모델 타입")
        
        kwargs = {}
        if request.temperature is not None:
            kwargs['temperature'] = request.temperature
        if request.max_tokens is not None:
            kwargs['max_tokens'] = request.max_tokens
        
        result = await manager.send_message(
            request.conversation_id, request.message, model_type, **kwargs
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    
    @app.get("/conversations/{conversation_id}/history")
    async def get_conversation_history(conversation_id: str, limit: int = 50):
        """대화 기록 조회"""
        manager = await get_conversation_manager()
        history = await manager.get_conversation_history(conversation_id, limit)
        
        return {
            "conversation_id": conversation_id,
            "history": history,
            "message_count": len(history)
        }
    
    @app.put("/conversations/{conversation_id}/context")
    async def update_conversation_context(conversation_id: str, request: UpdateContextRequest):
        """대화 컨텍스트 업데이트"""
        manager = await get_conversation_manager()
        
        if conversation_id not in manager.active_conversations:
            raise HTTPException(status_code=404, detail="대화를 찾을 수 없습니다")
        
        context = manager.active_conversations[conversation_id]
        
        if request.conversation_mode:
            try:
                context.conversation_mode = ConversationMode(request.conversation_mode)
            except ValueError:
                raise HTTPException(status_code=400, detail="잘못된 대화 모드")
        
        if request.formality_level is not None:
            context.formality_level = max(0.0, min(1.0, request.formality_level))
        
        if request.active_topics is not None:
            context.active_topics = request.active_topics
        
        return {
            "conversation_id": conversation_id,
            "updated_context": {
                "conversation_mode": context.conversation_mode.value,
                "formality_level": context.formality_level,
                "active_topics": context.active_topics
            }
        }
    
    @app.get("/conversations/statistics")
    async def get_conversation_statistics():
        """대화 통계"""
        manager = await get_conversation_manager()
        return await manager.get_conversation_statistics()
    
    @app.get("/models/performance")
    async def get_model_performance():
        """모델 성능 통계"""
        manager = await get_conversation_manager()
        return manager.llm_manager.get_model_performance_stats()
    
    @app.websocket("/ws/{conversation_id}")
    async def websocket_conversation(websocket: WebSocket, conversation_id: str):
        """웹소켓 실시간 대화"""
        await websocket.accept()
        manager = await get_conversation_manager()
        
        try:
            while True:
                # 메시지 수신
                message_data = await websocket.receive_json()
                
                message = message_data.get("message", "")
                model_type = LLMModelType(message_data.get("model_type", "gpt-4"))
                
                # 응답 생성
                result = await manager.send_message(conversation_id, message, model_type)
                
                # 응답 전송
                await websocket.send_json(result)
                
        except WebSocketDisconnect:
            logging.info(f"웹소켓 연결 종료: {conversation_id}")
        except Exception as e:
            logging.error(f"웹소켓 오류: {e}")
            await websocket.send_json({"error": str(e)})
    
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
    
    app = create_conversational_llm_app()
    
    # 한국어 NLP 라이브러리 다운로드 (처음 실행 시)
    try:
        import nltk
        nltk.download('vader_lexicon', quiet=True)
    except:
        pass
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8006,
        log_level="info"
    ) 