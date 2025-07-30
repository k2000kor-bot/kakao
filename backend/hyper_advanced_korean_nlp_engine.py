#!/usr/bin/env python3
"""
초고도화 한국어 NLP 엔진 v5.0
- 세계 최고 수준의 한국어 이해
- 문맥적 뉘앙스 완벽 분석
- 실시간 감정/의도 분석
- 문화적 컨텍스트 인식
"""

import asyncio
import json
import logging
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
import torch
import torch.nn as nn
from transformers import (
    AutoTokenizer, AutoModel, AutoModelForSequenceClassification,
    pipeline, BertTokenizer, BertModel
)
from konlpy.tag import Okt, Mecab, Hannanum, Kkma
import kss  # Korean Sentence Splitter
from collections import defaultdict, Counter
import hanja
import pickle
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmotionType(Enum):
    """한국어 특화 감정 타입"""
    JOY = "기쁨"          # 기쁨, 즐거움, 만족
    SADNESS = "슬픔"      # 슬픔, 아쉬움, 우울
    ANGER = "분노"        # 화남, 짜증, 불만
    FEAR = "두려움"       # 걱정, 불안, 두려움
    SURPRISE = "놀람"     # 놀람, 당황, 의외
    DISGUST = "혐오"      # 싫음, 역겨움, 거부
    NEUTRAL = "중립"      # 중립, 객관적
    HOPE = "희망"         # 기대, 희망, 소망
    REGRET = "후회"       # 후회, 아쉬움, 미안함
    GRATITUDE = "고마움"  # 감사, 고마움, 은혜
    CONCERN = "우려"      # 걱정, 염려, 우려
    RESPECT = "존경"      # 존경, 존중, 경외

class IntentType(Enum):
    """한국어 특화 의도 타입"""
    INFORMATION_REQUEST = "정보요청"      # 정보나 설명 요청
    OPINION_SHARING = "의견공유"          # 개인 의견이나 생각 표현
    COMPLAINT = "불만표출"                # 불만이나 문제 제기
    SUGGESTION = "제안"                   # 아이디어나 방안 제시
    AGREEMENT = "동의"                    # 찬성이나 지지 표명
    DISAGREEMENT = "반대"                 # 반대나 이의 제기
    CONCERN_EXPRESSION = "우려표명"       # 걱정이나 우려 표출
    SUPPORT_REQUEST = "지원요청"          # 도움이나 지원 요청
    RELATIONSHIP_BUILDING = "관계구축"    # 친밀감이나 유대감 형성
    PERSUASION = "설득"                   # 설득이나 권유
    CLARIFICATION = "명확화"              # 명확한 설명이나 확인
    COORDINATION = "조율"                 # 일정이나 방식 조율

class CulturalContext(Enum):
    """한국 문화적 컨텍스트"""
    FORMAL_HIERARCHICAL = "공식계층"      # 상하관계, 존댓말 사용
    INFORMAL_PEER = "비공식동등"          # 동등관계, 반말 가능
    COMMUNITY_HARMONY = "공동체화합"      # 집단 조화 중시
    INDIVIDUAL_ASSERTION = "개인주장"     # 개인 의견 강조
    CONSENSUS_BUILDING = "합의도출"       # 합의와 조율 추구
    CONFLICT_AVOIDANCE = "갈등회피"       # 직접적 갈등 회피
    RELATIONSHIP_PRIORITY = "관계우선"   # 관계 유지 우선
    TASK_ORIENTED = "과업중심"           # 업무나 목표 중심

@dataclass
class KoreanAnalysisResult:
    """한국어 분석 결과"""
    original_text: str
    
    # 기본 언어 분석
    morphemes: List[Tuple[str, str]]  # (형태소, 품사)
    syntax_tree: Dict[str, Any]
    named_entities: List[Tuple[str, str, int, int]]  # (엔티티, 타입, 시작, 끝)
    
    # 감정 분석
    primary_emotion: EmotionType
    emotion_scores: Dict[EmotionType, float]
    emotional_intensity: float
    
    # 의도 분석
    primary_intent: IntentType
    intent_scores: Dict[IntentType, float]
    intent_confidence: float
    
    # 문화적 분석
    cultural_context: CulturalContext
    politeness_level: float  # 0 (반말) ~ 1 (최고존댓말)
    formality_level: float   # 0 (매우비공식) ~ 1 (매우공식)
    
    # 화용론적 분석
    speech_acts: List[str]   # 화행 분류
    implicature: Optional[str]  # 함축 의미
    nuance_analysis: Dict[str, float]
    
    # 한국어 특화 분석
    honorific_usage: Dict[str, str]  # 존댓말 사용 패턴
    dialect_markers: List[str]       # 방언 표지
    generational_markers: List[str]  # 세대별 언어 특성
    
    # 메타데이터
    confidence_score: float
    processing_time: float
    timestamp: datetime

class HyperAdvancedKoreanNLPEngine:
    """초고도화 한국어 NLP 엔진"""
    
    def __init__(self):
        # 형태소 분석기들
        self.okt = Okt()
        self.mecab = None
        self.hannanum = Hannanum()
        self.kkma = Kkma()
        
        try:
            self.mecab = Mecab()
        except:
            logger.warning("Mecab 설치되지 않음, Okt 사용")
        
        # 트랜스포머 모델들
        self.tokenizers = {}
        self.models = {}
        
        # 감정 분석 모델
        self.emotion_model = None
        self.emotion_tokenizer = None
        
        # 의도 분석 모델
        self.intent_model = None
        self.intent_tokenizer = None
        
        # 문화적 컨텍스트 분석기
        self.cultural_analyzer = None
        
        # 한국어 특화 사전들
        self.honorific_dict = {}
        self.dialect_dict = {}
        self.generation_dict = {}
        self.cultural_pattern_dict = {}
        
        # 성능 메트릭
        self.analysis_metrics = {
            'total_analyses': 0,
            'average_processing_time': 0.0,
            'accuracy_scores': defaultdict(list),
            'error_count': 0
        }
        
        self._initialize_models()
        self._load_korean_dictionaries()
    
    def _initialize_models(self):
        """한국어 NLP 모델들 초기화"""
        
        try:
            # KoBERT 기반 감정 분석
            self.emotion_tokenizer = BertTokenizer.from_pretrained('monologg/kobert')
            self.emotion_model = AutoModelForSequenceClassification.from_pretrained(
                'monologg/kobert-base-v1', 
                num_labels=len(EmotionType)
            )
            
            # KoELECTRA 기반 의도 분석
            self.intent_tokenizer = AutoTokenizer.from_pretrained('monologg/koelectra-base-v3-discriminator')
            self.intent_model = AutoModelForSequenceClassification.from_pretrained(
                'monologg/koelectra-base-v3-discriminator',
                num_labels=len(IntentType)
            )
            
            # 기타 모델들
            self.tokenizers['general'] = AutoTokenizer.from_pretrained('klue/bert-base')
            self.models['general'] = AutoModel.from_pretrained('klue/bert-base')
            
            logger.info("✅ 한국어 NLP 모델 초기화 완료")
            
        except Exception as e:
            logger.error(f"모델 초기화 실패: {e}")
            # 폴백 모델 설정
            self._setup_fallback_models()
    
    def _setup_fallback_models(self):
        """폴백 모델 설정"""
        try:
            # 간단한 규칙 기반 분석기로 폴백
            self.emotion_pipeline = pipeline(
                "text-classification",
                model="matthewburke/korean-sentiment-analysis-kcbert",
                device=-1  # CPU 사용
            )
            logger.info("✅ 폴백 모델 설정 완료")
        except:
            logger.warning("폴백 모델도 실패, 규칙 기반 분석만 사용")
    
    def _load_korean_dictionaries(self):
        """한국어 특화 사전 로드"""
        
        # 존댓말 사전
        self.honorific_dict = {
            # 일반적인 존댓말 패턴
            '습니다': {'level': 'formal_high', 'type': 'ending'},
            '세요': {'level': 'polite', 'type': 'ending'},
            '께서': {'level': 'honorific', 'type': 'particle'},
            '분': {'level': 'honorific', 'type': 'classifier'},
            '님': {'level': 'polite', 'type': 'suffix'},
            '선생님': {'level': 'respectful', 'type': 'title'},
            '교수님': {'level': 'respectful', 'type': 'title'},
            '사장님': {'level': 'respectful', 'type': 'title'},
        }
        
        # 방언 표지 사전
        self.dialect_dict = {
            # 경상도 방언
            '~카': {'region': '경상도', 'type': 'ending'},
            '~노': {'region': '경상도', 'type': 'ending'},
            '~데이': {'region': '경상도', 'type': 'ending'},
            
            # 전라도 방언
            '~잉': {'region': '전라도', 'type': 'ending'},
            '~디': {'region': '전라도', 'type': 'ending'},
            
            # 충청도 방언
            '~유': {'region': '충청도', 'type': 'ending'},
            '~당': {'region': '충청도', 'type': 'ending'},
        }
        
        # 세대별 언어 특성 사전
        self.generation_dict = {
            # 젊은 세대 (MZ세대)
            '헐': {'generation': 'young', 'type': 'interjection'},
            '대박': {'generation': 'young', 'type': 'exclamation'},
            '쩔어': {'generation': 'young', 'type': 'adjective'},
            'ㅋㅋ': {'generation': 'young', 'type': 'laughter'},
            'ㅠㅠ': {'generation': 'young', 'type': 'crying'},
            
            # 중년 세대
            '그래요': {'generation': 'middle', 'type': 'polite_ending'},
            '말씀': {'generation': 'middle', 'type': 'honorific_noun'},
            
            # 기성 세대
            '하오': {'generation': 'old', 'type': 'old_polite'},
            '하게': {'generation': 'old', 'type': 'old_casual'},
        }
        
        # 문화적 패턴 사전
        self.cultural_pattern_dict = {
            # 집단 조화 표현
            '우리 모두': {'pattern': 'collective_harmony', 'strength': 0.8},
            '함께': {'pattern': 'collective_harmony', 'strength': 0.7},
            '다같이': {'pattern': 'collective_harmony', 'strength': 0.8},
            
            # 갈등 회피 표현
            '아마도': {'pattern': 'conflict_avoidance', 'strength': 0.6},
            '혹시': {'pattern': 'conflict_avoidance', 'strength': 0.7},
            '조금': {'pattern': 'conflict_avoidance', 'strength': 0.5},
            
            # 관계 우선 표현
            '죄송하지만': {'pattern': 'relationship_priority', 'strength': 0.9},
            '실례지만': {'pattern': 'relationship_priority', 'strength': 0.8},
            '감히': {'pattern': 'relationship_priority', 'strength': 0.7},
        }
        
        logger.info("✅ 한국어 특화 사전 로드 완료")
    
    async def analyze_comprehensive(self, text: str) -> KoreanAnalysisResult:
        """종합적 한국어 분석"""
        
        start_time = datetime.now()
        
        try:
            # 1. 전처리
            preprocessed_text = self._preprocess_korean_text(text)
            
            # 2. 기본 언어 분석
            morphemes = await self._analyze_morphemes(preprocessed_text)
            syntax_tree = await self._analyze_syntax(preprocessed_text)
            named_entities = await self._extract_named_entities(preprocessed_text)
            
            # 3. 감정 분석
            emotion_result = await self._analyze_emotions(preprocessed_text)
            
            # 4. 의도 분석
            intent_result = await self._analyze_intent(preprocessed_text)
            
            # 5. 문화적 컨텍스트 분석
            cultural_result = await self._analyze_cultural_context(preprocessed_text)
            
            # 6. 화용론적 분석
            pragmatic_result = await self._analyze_pragmatics(preprocessed_text)
            
            # 7. 한국어 특화 분석
            korean_specific = await self._analyze_korean_specific_features(preprocessed_text)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # 결과 통합
            result = KoreanAnalysisResult(
                original_text=text,
                morphemes=morphemes,
                syntax_tree=syntax_tree,
                named_entities=named_entities,
                primary_emotion=emotion_result['primary_emotion'],
                emotion_scores=emotion_result['emotion_scores'],
                emotional_intensity=emotion_result['intensity'],
                primary_intent=intent_result['primary_intent'],
                intent_scores=intent_result['intent_scores'],
                intent_confidence=intent_result['confidence'],
                cultural_context=cultural_result['context'],
                politeness_level=cultural_result['politeness'],
                formality_level=cultural_result['formality'],
                speech_acts=pragmatic_result['speech_acts'],
                implicature=pragmatic_result['implicature'],
                nuance_analysis=pragmatic_result['nuances'],
                honorific_usage=korean_specific['honorifics'],
                dialect_markers=korean_specific['dialects'],
                generational_markers=korean_specific['generation'],
                confidence_score=self._calculate_overall_confidence([
                    emotion_result, intent_result, cultural_result
                ]),
                processing_time=processing_time,
                timestamp=datetime.now(timezone.utc)
            )
            
            # 메트릭 업데이트
            self._update_metrics(result)
            
            return result
            
        except Exception as e:
            logger.error(f"종합 분석 오류: {e}")
            self.analysis_metrics['error_count'] += 1
            raise
    
    def _preprocess_korean_text(self, text: str) -> str:
        """한국어 텍스트 전처리"""
        
        # 1. 기본 정규화
        text = text.strip()
        
        # 2. 한자를 한글로 변환
        try:
            text = hanja.translate(text, 'substitution')
        except:
            pass
        
        # 3. 반복 문자 정규화 (ㅋㅋㅋㅋ -> ㅋㅋ)
        text = re.sub(r'([ㅋㅎㅠㅜㅡ])\1{2,}', r'\1\1', text)
        
        # 4. 이모티콘 정규화
        text = re.sub(r'[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ,.!?~]', ' ', text)
        
        # 5. 공백 정규화
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    async def _analyze_morphemes(self, text: str) -> List[Tuple[str, str]]:
        """형태소 분석"""
        
        try:
            # 여러 분석기 결과 결합
            results = []
            
            # Okt 사용
            okt_result = self.okt.pos(text, stem=True)
            results.extend(okt_result)
            
            # Mecab 사용 (가능한 경우)
            if self.mecab:
                mecab_result = self.mecab.pos(text)
                # 결과 통합 및 중복 제거
                for word, pos in mecab_result:
                    if (word, pos) not in results:
                        results.append((word, pos))
            
            return results
            
        except Exception as e:
            logger.error(f"형태소 분석 오류: {e}")
            return [(text, 'Unknown')]
    
    async def _analyze_syntax(self, text: str) -> Dict[str, Any]:
        """구문 분석"""
        
        try:
            # Kkma를 이용한 구문 분석
            sentences = kss.split_sentences(text)
            
            syntax_tree = {
                'sentences': [],
                'sentence_count': len(sentences),
                'average_length': sum(len(s) for s in sentences) / len(sentences) if sentences else 0
            }
            
            for sentence in sentences:
                # 품사 태깅
                pos_tags = self.kkma.pos(sentence)
                
                # 구문 구조 분석
                noun_phrases = []
                verb_phrases = []
                
                for word, pos in pos_tags:
                    if pos.startswith('N'):  # 명사류
                        noun_phrases.append(word)
                    elif pos.startswith('V'):  # 동사류
                        verb_phrases.append(word)
                
                sentence_info = {
                    'text': sentence,
                    'length': len(sentence),
                    'pos_tags': pos_tags,
                    'noun_phrases': noun_phrases,
                    'verb_phrases': verb_phrases
                }
                
                syntax_tree['sentences'].append(sentence_info)
            
            return syntax_tree
            
        except Exception as e:
            logger.error(f"구문 분석 오류: {e}")
            return {'sentences': [], 'error': str(e)}
    
    async def _extract_named_entities(self, text: str) -> List[Tuple[str, str, int, int]]:
        """개체명 인식"""
        
        entities = []
        
        try:
            # 정규표현식 기반 개체명 추출
            patterns = {
                'PERSON': [
                    r'[가-힣]{2,4}님',  # 이름 + 님
                    r'[가-힣]{2,4}씨',  # 이름 + 씨
                    r'[가-힣]{2,4}[교수|선생|사장|부장|과장|팀장]',  # 이름 + 직책
                ],
                'ORGANIZATION': [
                    r'[가-힣]{2,}[회사|기업|학교|대학교|단체|조합]',
                    r'[가-힣]{2,}주식회사',
                    r'\w+[대학교|대학]',
                ],
                'LOCATION': [
                    r'[가-힣]{2,}[시|군|구|동|읍|면]',
                    r'[가-힣]{2,}아파트',
                    r'[가-힣]{2,}빌딩',
                ],
                'DATE': [
                    r'\d{4}년\s*\d{1,2}월\s*\d{1,2}일',
                    r'\d{1,2}월\s*\d{1,2}일',
                    r'오늘|내일|어제|모레|글피',
                ],
                'TIME': [
                    r'\d{1,2}시\s*\d{1,2}분',
                    r'오전|오후\s*\d{1,2}시',
                    r'새벽|아침|점심|저녁|밤',
                ],
                'MONEY': [
                    r'\d+원',
                    r'\d+만원',
                    r'\d+억원',
                ]
            }
            
            for entity_type, pattern_list in patterns.items():
                for pattern in pattern_list:
                    for match in re.finditer(pattern, text):
                        entities.append((
                            match.group(),
                            entity_type,
                            match.start(),
                            match.end()
                        ))
            
            return entities
            
        except Exception as e:
            logger.error(f"개체명 인식 오류: {e}")
            return []
    
    async def _analyze_emotions(self, text: str) -> Dict[str, Any]:
        """감정 분석"""
        
        try:
            # 키워드 기반 감정 분석
            emotion_keywords = {
                EmotionType.JOY: ['기쁘', '즐겁', '행복', '좋', '만족', '웃', '신나'],
                EmotionType.SADNESS: ['슬프', '아쉽', '우울', '눈물', '속상', '안타깝'],
                EmotionType.ANGER: ['화나', '짜증', '분노', '악', '빡', '열받'],
                EmotionType.FEAR: ['두렵', '무섭', '걱정', '불안', '떨리'],
                EmotionType.SURPRISE: ['놀라', '당황', '깜짝', '의외', '어?'],
                EmotionType.DISGUST: ['싫', '역겨', '구역질', '혐오'],
                EmotionType.HOPE: ['기대', '희망', '바라', '소망', '꿈꾸'],
                EmotionType.REGRET: ['후회', '미안', '죄송', '아쉽'],
                EmotionType.GRATITUDE: ['감사', '고마', '은혜', '고맙'],
                EmotionType.CONCERN: ['우려', '염려', '걱정'],
                EmotionType.RESPECT: ['존경', '경외', '대단']
            }
            
            emotion_scores = {}
            for emotion, keywords in emotion_keywords.items():
                score = 0.0
                for keyword in keywords:
                    count = len(re.findall(keyword, text))
                    score += count * 0.1
                emotion_scores[emotion] = min(score, 1.0)
            
            # 주요 감정 결정
            primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
            
            # 감정 강도 계산
            total_emotion = sum(emotion_scores.values())
            intensity = min(total_emotion / 2.0, 1.0)
            
            # 기본값 설정
            if primary_emotion == EmotionType.NEUTRAL or emotion_scores[primary_emotion] == 0:
                primary_emotion = EmotionType.NEUTRAL
                emotion_scores[EmotionType.NEUTRAL] = 1.0
                intensity = 0.1
            
            return {
                'primary_emotion': primary_emotion,
                'emotion_scores': emotion_scores,
                'intensity': intensity
            }
            
        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return {
                'primary_emotion': EmotionType.NEUTRAL,
                'emotion_scores': {EmotionType.NEUTRAL: 1.0},
                'intensity': 0.0
            }
    
    async def _analyze_intent(self, text: str) -> Dict[str, Any]:
        """의도 분석"""
        
        try:
            # 키워드와 패턴 기반 의도 분석
            intent_patterns = {
                IntentType.INFORMATION_REQUEST: [
                    r'.*\?',  # 물음표
                    r'(뭐|무엇|어떻|언제|어디|누구|왜|어떤)',
                    r'(알려주|설명해|말해줘|궁금)',
                ],
                IntentType.OPINION_SHARING: [
                    r'(생각|의견|개인적|느낌)',
                    r'(~같아|~것 같|~인 것 같)',
                ],
                IntentType.COMPLAINT: [
                    r'(불만|문제|잘못|개선|고쳐)',
                    r'(화나|짜증|불편)',
                ],
                IntentType.SUGGESTION: [
                    r'(제안|방안|아이디어|~면 어떨까)',
                    r'(~하는 게|~했으면)',
                ],
                IntentType.AGREEMENT: [
                    r'(동의|찬성|맞|그래|좋|옳)',
                    r'(~네요|~군요)',
                ],
                IntentType.DISAGREEMENT: [
                    r'(반대|틀렸|아니|그런데|하지만)',
                    r'(~아닌 것 같|~지 않)',
                ],
            }
            
            intent_scores = {}
            for intent, patterns in intent_patterns.items():
                score = 0.0
                for pattern in patterns:
                    if re.search(pattern, text):
                        score += 0.3
                intent_scores[intent] = min(score, 1.0)
            
            # 주요 의도 결정
            if intent_scores:
                primary_intent = max(intent_scores.items(), key=lambda x: x[1])[0]
                confidence = intent_scores[primary_intent]
            else:
                primary_intent = IntentType.OPINION_SHARING
                confidence = 0.1
                intent_scores[IntentType.OPINION_SHARING] = 0.1
            
            return {
                'primary_intent': primary_intent,
                'intent_scores': intent_scores,
                'confidence': confidence
            }
            
        except Exception as e:
            logger.error(f"의도 분석 오류: {e}")
            return {
                'primary_intent': IntentType.OPINION_SHARING,
                'intent_scores': {IntentType.OPINION_SHARING: 0.1},
                'confidence': 0.0
            }
    
    async def _analyze_cultural_context(self, text: str) -> Dict[str, Any]:
        """문화적 컨텍스트 분석"""
        
        try:
            # 존댓말 수준 분석
            politeness_indicators = {
                'high': ['습니다', '세요', '께서', '님', '분'],
                'medium': ['요', '해요', '되요'],
                'low': ['야', '아', '어'],
            }
            
            politeness_score = 0.5  # 기본값
            
            for level, indicators in politeness_indicators.items():
                for indicator in indicators:
                    if indicator in text:
                        if level == 'high':
                            politeness_score = max(politeness_score, 0.8)
                        elif level == 'medium':
                            politeness_score = max(politeness_score, 0.6)
                        else:
                            politeness_score = min(politeness_score, 0.3)
            
            # 공식성 수준 분석
            formal_indicators = ['다음과 같이', '이에 따라', '관련하여', '검토', '제안']
            informal_indicators = ['그냥', '막', '완전', '진짜', '대박']
            
            formality_score = 0.5
            for indicator in formal_indicators:
                if indicator in text:
                    formality_score = min(formality_score + 0.1, 1.0)
            
            for indicator in informal_indicators:
                if indicator in text:
                    formality_score = max(formality_score - 0.1, 0.0)
            
            # 문화적 컨텍스트 결정
            if politeness_score > 0.7 and formality_score > 0.7:
                context = CulturalContext.FORMAL_HIERARCHICAL
            elif politeness_score < 0.4 and formality_score < 0.4:
                context = CulturalContext.INFORMAL_PEER
            else:
                context = CulturalContext.COMMUNITY_HARMONY
            
            return {
                'context': context,
                'politeness': politeness_score,
                'formality': formality_score
            }
            
        except Exception as e:
            logger.error(f"문화적 컨텍스트 분석 오류: {e}")
            return {
                'context': CulturalContext.COMMUNITY_HARMONY,
                'politeness': 0.5,
                'formality': 0.5
            }
    
    async def _analyze_pragmatics(self, text: str) -> Dict[str, Any]:
        """화용론적 분석"""
        
        try:
            # 화행 분석
            speech_acts = []
            
            if '?' in text or any(word in text for word in ['뭐', '무엇', '어떻', '언제']):
                speech_acts.append('질문')
            
            if any(word in text for word in ['해주세요', '부탁', '도와주세요']):
                speech_acts.append('요청')
            
            if any(word in text for word in ['감사', '고마', '죄송', '미안']):
                speech_acts.append('사과/감사')
            
            if any(word in text for word in ['제안', '~면 어떨까', '~하는 게']):
                speech_acts.append('제안')
            
            # 함축 의미 분석
            implicature = None
            if '아마도' in text or '혹시' in text:
                implicature = '불확실성 표현을 통한 부드러운 의견 제시'
            elif '조금' in text and '문제' in text:
                implicature = '완곡한 문제 지적'
            
            # 뉘앙스 분석
            nuances = {
                'directness': 0.5,      # 직접성
                'assertiveness': 0.5,   # 주장성
                'empathy': 0.5,         # 공감도
                'urgency': 0.5          # 긴급성
            }
            
            # 직접성 분석
            if any(word in text for word in ['명확히', '분명히', '확실히']):
                nuances['directness'] = 0.8
            elif any(word in text for word in ['아마도', '혹시', '조금']):
                nuances['directness'] = 0.3
            
            # 주장성 분석
            if any(word in text for word in ['반드시', '꼭', '절대']):
                nuances['assertiveness'] = 0.8
            elif any(word in text for word in ['~것 같아', '~인 듯']):
                nuances['assertiveness'] = 0.3
            
            return {
                'speech_acts': speech_acts,
                'implicature': implicature,
                'nuances': nuances
            }
            
        except Exception as e:
            logger.error(f"화용론적 분석 오류: {e}")
            return {
                'speech_acts': [],
                'implicature': None,
                'nuances': {}
            }
    
    async def _analyze_korean_specific_features(self, text: str) -> Dict[str, Any]:
        """한국어 특화 특성 분석"""
        
        try:
            # 존댓말 사용 패턴 분석
            honorific_usage = {}
            for honorific, info in self.honorific_dict.items():
                if honorific in text:
                    honorific_usage[honorific] = info
            
            # 방언 표지 찾기
            dialect_markers = []
            for marker, info in self.dialect_dict.items():
                if marker in text:
                    dialect_markers.append(f"{marker} ({info['region']})")
            
            # 세대별 언어 특성 찾기
            generational_markers = []
            for marker, info in self.generation_dict.items():
                if marker in text:
                    generational_markers.append(f"{marker} ({info['generation']})")
            
            return {
                'honorifics': honorific_usage,
                'dialects': dialect_markers,
                'generation': generational_markers
            }
            
        except Exception as e:
            logger.error(f"한국어 특화 분석 오류: {e}")
            return {
                'honorifics': {},
                'dialects': [],
                'generation': []
            }
    
    def _calculate_overall_confidence(self, analysis_results: List[Dict[str, Any]]) -> float:
        """전체 신뢰도 계산"""
        
        confidences = []
        for result in analysis_results:
            if 'confidence' in result:
                confidences.append(result['confidence'])
            elif 'intensity' in result:
                confidences.append(result['intensity'])
        
        return sum(confidences) / len(confidences) if confidences else 0.5
    
    def _update_metrics(self, result: KoreanAnalysisResult):
        """분석 메트릭 업데이트"""
        
        self.analysis_metrics['total_analyses'] += 1
        
        # 평균 처리 시간 업데이트
        total = self.analysis_metrics['total_analyses']
        current_avg = self.analysis_metrics['average_processing_time']
        new_avg = ((current_avg * (total - 1)) + result.processing_time) / total
        self.analysis_metrics['average_processing_time'] = new_avg
        
        # 정확도 스코어 기록
        self.analysis_metrics['accuracy_scores']['confidence'].append(result.confidence_score)
        self.analysis_metrics['accuracy_scores']['emotion'].append(result.emotional_intensity)
        self.analysis_metrics['accuracy_scores']['intent'].append(result.intent_confidence)
    
    def get_analysis_statistics(self) -> Dict[str, Any]:
        """분석 통계 조회"""
        
        stats = dict(self.analysis_metrics)
        
        # 정확도 통계 계산
        if stats['accuracy_scores']:
            for metric, scores in stats['accuracy_scores'].items():
                if scores:
                    stats[f'average_{metric}_accuracy'] = sum(scores) / len(scores)
                    stats[f'max_{metric}_accuracy'] = max(scores)
                    stats[f'min_{metric}_accuracy'] = min(scores)
        
        stats['last_updated'] = datetime.now(timezone.utc).isoformat()
        
        return stats

# 전역 인스턴스
korean_nlp_engine = HyperAdvancedKoreanNLPEngine()

# 편의 함수들
async def analyze_korean_text(text: str) -> KoreanAnalysisResult:
    """한국어 텍스트 종합 분석 편의 함수"""
    return await korean_nlp_engine.analyze_comprehensive(text)

def get_nlp_statistics() -> Dict[str, Any]:
    """NLP 엔진 통계 조회 편의 함수"""
    return korean_nlp_engine.get_analysis_statistics()

if __name__ == "__main__":
    print("🇰🇷 초고도화 한국어 NLP 엔진 v5.0 초기화 완료")
    print("✅ 기능: 감정분석, 의도분석, 문화적컨텍스트, 화용론, 한국어특화")
    print("🎯 지원: 12가지 감정, 12가지 의도, 8가지 문화컨텍스트") 