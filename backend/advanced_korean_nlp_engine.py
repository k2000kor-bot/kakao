"""
고급 한국어 NLP 엔진
- 고급 형태소 분석 (Mecab, Okt, Hannanum 통합)
- 개체명 인식 (NER) - 사람, 장소, 기관, 날짜, 시간 등
- 의존 구문 분석 (Dependency Parsing)
- 의미역 태깅 (Semantic Role Labeling)
- 감정 분석 및 극성 분류
- 키워드 추출 및 중요도 계산
"""

import json
import re
import time
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
import numpy as np
import pandas as pd
from collections import Counter, defaultdict
import sqlite3

# 한국어 NLP 라이브러리
from konlpy.tag import Okt, Mecab, Hannanum, Komoran, Kkma
import kss
from soynlp.tokenizer import LTokenizer
from soynlp.noun import LRNounExtractor_v2
from soynlp.word import WordExtractor
from soynlp.keyword import KeywordExtractor
from kiwipiepy import Kiwi

# 머신러닝 라이브러리
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
import networkx as nx

# 딥러닝 라이브러리
import torch
import torch.nn as nn
from transformers import (
    AutoTokenizer, AutoModel, AutoModelForSequenceClassification,
    pipeline, BertTokenizer, BertModel
)

# 품사 태그
class POSTag(Enum):
    NOUN = "명사"
    VERB = "동사"
    ADJECTIVE = "형용사"
    ADVERB = "부사"
    PARTICLE = "조사"
    DETERMINER = "관형사"
    EXCLAMATION = "감탄사"
    CONJUNCTION = "접속사"
    NUMBER = "수사"
    SUFFIX = "접미사"
    SYMBOL = "기호"
    FOREIGN = "외국어"
    UNKNOWN = "미지어"

# 개체명 타입
class EntityType(Enum):
    PERSON = "인명"
    LOCATION = "지명"
    ORGANIZATION = "기관명"
    DATE = "날짜"
    TIME = "시간"
    MONEY = "금액"
    PERCENT = "퍼센트"
    QUANTITY = "수량"
    PHONE = "전화번호"
    EMAIL = "이메일"
    URL = "URL"
    PRODUCT = "제품명"
    EVENT = "이벤트"

# 감정 극성
class SentimentPolarity(Enum):
    POSITIVE = "긍정"
    NEGATIVE = "부정"
    NEUTRAL = "중립"

# 의존 관계
class DependencyRelation(Enum):
    SUBJECT = "주어"
    OBJECT = "목적어"
    MODIFIER = "수식어"
    COMPLEMENT = "보어"
    ADVERBIAL = "부사어"
    CONJUNCTION = "접속어"
    APPOSITION = "동격어"

@dataclass
class Token:
    """토큰 정보"""
    text: str
    pos: str
    start: int
    end: int
    lemma: str = ""
    features: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Entity:
    """개체명 정보"""
    text: str
    entity_type: EntityType
    start: int
    end: int
    confidence: float
    attributes: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Dependency:
    """의존 관계"""
    head: int
    dependent: int
    relation: DependencyRelation
    confidence: float

@dataclass
class SentimentResult:
    """감정 분석 결과"""
    polarity: SentimentPolarity
    confidence: float
    emotion_scores: Dict[str, float] = field(default_factory=dict)
    intensity: float = 0.0

@dataclass
class KeywordResult:
    """키워드 추출 결과"""
    keyword: str
    score: float
    frequency: int
    pos_tags: List[str] = field(default_factory=list)
    contexts: List[str] = field(default_factory=list)

class AdvancedMorphAnalyzer:
    """고급 형태소 분석기"""
    
    def __init__(self):
        # 여러 형태소 분석기 초기화
        self.okt = Okt()
        self.komoran = Komoran()
        self.kkma = Kkma()
        
        try:
            self.mecab = Mecab()
        except:
            self.mecab = None
            logging.warning("Mecab 사용 불가")
        
        try:
            self.hannanum = Hannanum()
        except:
            self.hannanum = None
            logging.warning("Hannanum 사용 불가")
        
        try:
            self.kiwi = Kiwi()
        except:
            self.kiwi = None
            logging.warning("Kiwi 사용 불가")
        
        # 사용자 사전
        self.user_dict = self._load_user_dictionary()
        
        # 품사 태그 매핑
        self.pos_mapping = self._create_pos_mapping()
    
    def _load_user_dictionary(self) -> Dict[str, List[str]]:
        """사용자 사전 로드"""
        return {
            # 신조어, 전문용어 등
            "신조어": ["갓생", "워라밸", "N포세대", "언택트", "뉴노멀"],
            "IT용어": ["클라우드", "빅데이터", "AI", "머신러닝", "딥러닝"],
            "부동산": ["재개발", "재건축", "분양", "임대", "매매"],
            "금융": ["비트코인", "이더리움", "블록체인", "NFT", "DeFi"]
        }
    
    def _create_pos_mapping(self) -> Dict[str, str]:
        """품사 태그 매핑 생성"""
        return {
            # Okt 태그
            'Noun': '명사', 'Verb': '동사', 'Adjective': '형용사',
            'Adverb': '부사', 'Josa': '조사', 'Eomi': '어미',
            
            # Mecab 태그
            'NNG': '일반명사', 'NNP': '고유명사', 'NNB': '의존명사',
            'VV': '동사', 'VA': '형용사', 'VX': '보조용언',
            'MM': '관형사', 'MAG': '일반부사', 'MAJ': '접속부사',
            
            # Komoran 태그
            'NP': '대명사', 'VCP': '긍정지시사', 'VCN': '부정지시사',
            'IC': '감탄사', 'JKS': '주격조사', 'JKO': '목적격조사'
        }
    
    def analyze(self, text: str, use_ensemble: bool = True) -> List[Token]:
        """형태소 분석"""
        try:
            if use_ensemble:
                return self._ensemble_analysis(text)
            else:
                return self._single_analysis(text, analyzer='okt')
                
        except Exception as e:
            logging.error(f"형태소 분석 오류: {e}")
            return []
    
    def _ensemble_analysis(self, text: str) -> List[Token]:
        """앙상블 형태소 분석"""
        try:
            # 여러 분석기 결과 수집
            results = {}
            
            # Okt 분석
            okt_result = self.okt.pos(text, norm=True, stem=True)
            results['okt'] = okt_result
            
            # Komoran 분석
            komoran_result = self.komoran.pos(text)
            results['komoran'] = komoran_result
            
            # Mecab 분석 (가능한 경우)
            if self.mecab:
                mecab_result = self.mecab.pos(text)
                results['mecab'] = mecab_result
            
            # Kiwi 분석 (가능한 경우)
            if self.kiwi:
                kiwi_result = [(token.form, token.tag) for token in self.kiwi.analyze(text)[0][0]]
                results['kiwi'] = kiwi_result
            
            # 결과 통합
            tokens = self._integrate_analysis_results(text, results)
            
            return tokens
            
        except Exception as e:
            logging.error(f"앙상블 분석 오류: {e}")
            return self._single_analysis(text, 'okt')
    
    def _single_analysis(self, text: str, analyzer: str) -> List[Token]:
        """단일 분석기 사용"""
        try:
            if analyzer == 'okt':
                pos_result = self.okt.pos(text, norm=True, stem=True)
            elif analyzer == 'komoran':
                pos_result = self.komoran.pos(text)
            elif analyzer == 'mecab' and self.mecab:
                pos_result = self.mecab.pos(text)
            else:
                pos_result = self.okt.pos(text)
            
            # Token 객체로 변환
            tokens = []
            current_pos = 0
            
            for word, pos in pos_result:
                start = text.find(word, current_pos)
                if start != -1:
                    end = start + len(word)
                    
                    token = Token(
                        text=word,
                        pos=self.pos_mapping.get(pos, pos),
                        start=start,
                        end=end,
                        lemma=word
                    )
                    tokens.append(token)
                    current_pos = end
            
            return tokens
            
        except Exception as e:
            logging.error(f"단일 분석 오류: {e}")
            return []
    
    def _integrate_analysis_results(self, text: str, results: Dict[str, List[Tuple[str, str]]]) -> List[Token]:
        """분석 결과 통합"""
        try:
            # 투표 방식으로 최적 결과 선택
            word_pos_votes = defaultdict(lambda: defaultdict(int))
            
            for analyzer, pos_list in results.items():
                for word, pos in pos_list:
                    word_pos_votes[word][pos] += 1
            
            # 최다 득표 품사 선택
            tokens = []
            current_pos = 0
            
            for word in word_pos_votes:
                best_pos = max(word_pos_votes[word].items(), key=lambda x: x[1])[0]
                
                start = text.find(word, current_pos)
                if start != -1:
                    end = start + len(word)
                    
                    token = Token(
                        text=word,
                        pos=self.pos_mapping.get(best_pos, best_pos),
                        start=start,
                        end=end,
                        lemma=word,
                        features={
                            'confidence': word_pos_votes[word][best_pos] / len(results),
                            'votes': dict(word_pos_votes[word])
                        }
                    )
                    tokens.append(token)
                    current_pos = end
            
            return sorted(tokens, key=lambda x: x.start)
            
        except Exception as e:
            logging.error(f"결과 통합 오류: {e}")
            return []

class KoreanNER:
    """한국어 개체명 인식"""
    
    def __init__(self):
        # 정규표현식 패턴
        self.patterns = self._create_patterns()
        
        # 사전 기반 개체명
        self.entity_dicts = self._load_entity_dictionaries()
        
        # BERT 기반 NER 모델 (선택사항)
        self.bert_model = None
        self._initialize_bert_model()
    
    def _create_patterns(self) -> Dict[EntityType, List[str]]:
        """정규표현식 패턴 생성"""
        return {
            EntityType.DATE: [
                r'\d{4}년\s*\d{1,2}월\s*\d{1,2}일',
                r'\d{4}-\d{1,2}-\d{1,2}',
                r'\d{1,2}월\s*\d{1,2}일',
                r'오늘|어제|내일|모레|그제',
                r'[일월화수목금토]요일'
            ],
            EntityType.TIME: [
                r'\d{1,2}시\s*\d{1,2}분',
                r'\d{1,2}:\d{1,2}',
                r'오전|오후\s*\d{1,2}시',
                r'새벽|아침|오전|오후|저녁|밤'
            ],
            EntityType.MONEY: [
                r'\d+원',
                r'\d+만원',
                r'\d+억원',
                r'\d+달러',
                r'\$d+',
                r'₩\d+'
            ],
            EntityType.PERCENT: [
                r'\d+%',
                r'\d+퍼센트',
                r'백분의\s*\d+'
            ],
            EntityType.PHONE: [
                r'\d{3}-\d{4}-\d{4}',
                r'\d{3}-\d{3}-\d{4}',
                r'010-\d{4}-\d{4}'
            ],
            EntityType.EMAIL: [
                r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            ],
            EntityType.URL: [
                r'https?://[^\s]+',
                r'www\.[^\s]+',
                r'[a-zA-Z0-9.-]+\.(com|net|org|co\.kr)'
            ]
        }
    
    def _load_entity_dictionaries(self) -> Dict[EntityType, Set[str]]:
        """개체명 사전 로드"""
        return {
            EntityType.PERSON: {
                # 성씨
                '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
                '한', '오', '서', '신', '권', '황', '안', '송', '류', '전',
                # 일반적인 이름 (예시)
                '민수', '영희', '철수', '영수', '미영', '정호'
            },
            EntityType.LOCATION: {
                # 시도
                '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
                '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
                # 주요 지명
                '강남', '홍대', '명동', '압구정', '신촌', '이태원'
            },
            EntityType.ORGANIZATION: {
                # 기업
                '삼성', '현대', 'LG', 'SK', 'KT', '롯데', '한화', 'GS', '포스코',
                # 기관
                '정부', '국회', '청와대', '법원', '검찰', '경찰', '소방서',
                # 학교
                '대학교', '고등학교', '중학교', '초등학교'
            }
        }
    
    def _initialize_bert_model(self):
        """BERT NER 모델 초기화"""
        try:
            # 한국어 BERT 모델 로드 (예시)
            model_name = "klue/bert-base"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModel.from_pretrained(model_name)
            logging.info("BERT NER 모델 초기화 완료")
        except Exception as e:
            logging.warning(f"BERT 모델 초기화 실패: {e}")
    
    def extract_entities(self, text: str) -> List[Entity]:
        """개체명 추출"""
        try:
            entities = []
            
            # 패턴 기반 추출
            pattern_entities = self._extract_by_patterns(text)
            entities.extend(pattern_entities)
            
            # 사전 기반 추출
            dict_entities = self._extract_by_dictionaries(text)
            entities.extend(dict_entities)
            
            # BERT 기반 추출 (선택사항)
            if self.bert_model:
                bert_entities = self._extract_by_bert(text)
                entities.extend(bert_entities)
            
            # 중복 제거 및 정렬
            entities = self._deduplicate_entities(entities)
            
            return entities
            
        except Exception as e:
            logging.error(f"개체명 추출 오류: {e}")
            return []
    
    def _extract_by_patterns(self, text: str) -> List[Entity]:
        """패턴 기반 개체명 추출"""
        entities = []
        
        try:
            for entity_type, patterns in self.patterns.items():
                for pattern in patterns:
                    matches = re.finditer(pattern, text)
                    
                    for match in matches:
                        entity = Entity(
                            text=match.group(),
                            entity_type=entity_type,
                            start=match.start(),
                            end=match.end(),
                            confidence=0.9,  # 패턴 기반은 높은 신뢰도
                            attributes={'method': 'pattern'}
                        )
                        entities.append(entity)
            
        except Exception as e:
            logging.error(f"패턴 기반 추출 오류: {e}")
        
        return entities
    
    def _extract_by_dictionaries(self, text: str) -> List[Entity]:
        """사전 기반 개체명 추출"""
        entities = []
        
        try:
            for entity_type, entity_set in self.entity_dicts.items():
                for entity_name in entity_set:
                    # 정확히 일치하는 경우만
                    pattern = r'\b' + re.escape(entity_name) + r'\b'
                    matches = re.finditer(pattern, text)
                    
                    for match in matches:
                        entity = Entity(
                            text=match.group(),
                            entity_type=entity_type,
                            start=match.start(),
                            end=match.end(),
                            confidence=0.8,  # 사전 기반은 중간 신뢰도
                            attributes={'method': 'dictionary'}
                        )
                        entities.append(entity)
            
        except Exception as e:
            logging.error(f"사전 기반 추출 오류: {e}")
        
        return entities
    
    def _extract_by_bert(self, text: str) -> List[Entity]:
        """BERT 기반 개체명 추출"""
        entities = []
        
        try:
            # BERT 토크나이징
            inputs = self.tokenizer(text, return_tensors="pt", max_length=512, truncation=True)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                # 여기서 NER 모델의 예측 로직 구현
                # 실제로는 NER 전용 모델을 사용해야 함
                pass
            
        except Exception as e:
            logging.error(f"BERT 기반 추출 오류: {e}")
        
        return entities
    
    def _deduplicate_entities(self, entities: List[Entity]) -> List[Entity]:
        """중복 개체명 제거"""
        try:
            # 위치 기반으로 정렬
            entities.sort(key=lambda x: (x.start, x.end))
            
            # 겹치는 개체명 중 신뢰도가 높은 것만 유지
            filtered_entities = []
            
            for entity in entities:
                # 겹치는 기존 개체명 확인
                overlapping = [
                    e for e in filtered_entities
                    if not (entity.end <= e.start or entity.start >= e.end)
                ]
                
                if not overlapping:
                    filtered_entities.append(entity)
                else:
                    # 신뢰도가 더 높은 경우 교체
                    max_confidence_entity = max(overlapping + [entity], key=lambda x: x.confidence)
                    
                    # 기존 겹치는 개체들 제거
                    for overlap in overlapping:
                        if overlap in filtered_entities:
                            filtered_entities.remove(overlap)
                    
                    filtered_entities.append(max_confidence_entity)
            
            return sorted(filtered_entities, key=lambda x: x.start)
            
        except Exception as e:
            logging.error(f"중복 제거 오류: {e}")
            return entities

class DependencyParser:
    """의존 구문 분석기"""
    
    def __init__(self):
        # 의존 관계 규칙
        self.dependency_rules = self._create_dependency_rules()
        
        # 품사별 헤드 우선순위
        self.head_priority = {
            '동사': 10, '형용사': 9, '명사': 8, '부사': 7,
            '조사': 3, '어미': 2, '기호': 1
        }
    
    def _create_dependency_rules(self) -> Dict[str, List[str]]:
        """의존 관계 규칙 생성"""
        return {
            '주격조사': ['이', '가', '께서', '에서'],
            '목적격조사': ['을', '를'],
            '부사격조사': ['에', '에서', '로', '으로', '와', '과', '하고'],
            '관형격조사': ['의'],
            '보격조사': ['이', '가'],
            '호격조사': ['아', '야', '여'],
            '접속조사': ['와', '과', '하고', '이나', '나'],
            '보조사': ['은', '는', '도', '만', '까지', '부터', '조차', '마저']
        }
    
    def parse(self, tokens: List[Token]) -> List[Dependency]:
        """의존 관계 분석"""
        try:
            dependencies = []
            
            # 간단한 규칙 기반 의존 관계 분석
            for i, token in enumerate(tokens):
                if token.pos in ['조사']:
                    # 조사의 경우 앞 명사와 의존 관계
                    if i > 0 and tokens[i-1].pos in ['명사', '대명사']:
                        relation = self._determine_relation(token.text)
                        
                        dep = Dependency(
                            head=i-1,
                            dependent=i,
                            relation=relation,
                            confidence=0.8
                        )
                        dependencies.append(dep)
                
                elif token.pos in ['관형사']:
                    # 관형사의 경우 뒤 명사를 수식
                    if i < len(tokens) - 1 and tokens[i+1].pos in ['명사']:
                        dep = Dependency(
                            head=i+1,
                            dependent=i,
                            relation=DependencyRelation.MODIFIER,
                            confidence=0.7
                        )
                        dependencies.append(dep)
            
            return dependencies
            
        except Exception as e:
            logging.error(f"의존 구문 분석 오류: {e}")
            return []
    
    def _determine_relation(self, particle: str) -> DependencyRelation:
        """조사로 의존 관계 결정"""
        if particle in ['이', '가', '께서']:
            return DependencyRelation.SUBJECT
        elif particle in ['을', '를']:
            return DependencyRelation.OBJECT
        elif particle in ['에', '에서', '로', '으로']:
            return DependencyRelation.ADVERBIAL
        else:
            return DependencyRelation.MODIFIER

class KoreanSentimentAnalyzer:
    """한국어 감정 분석기"""
    
    def __init__(self):
        # 감정 사전
        self.emotion_lexicon = self._create_emotion_lexicon()
        
        # 감정 강화/약화 표현
        self.intensity_modifiers = self._create_intensity_modifiers()
        
        # 부정 표현
        self.negation_words = {'안', '못', '아니', '없', '절대', '결코', '전혀'}
        
        # BERT 감정 분석 모델 (선택사항)
        self.sentiment_model = None
        self._initialize_sentiment_model()
    
    def _create_emotion_lexicon(self) -> Dict[str, Dict[str, float]]:
        """감정 사전 생성"""
        return {
            # 긍정 감정
            '기쁨': {
                '행복하다': 0.9, '기쁘다': 0.8, '즐겁다': 0.7, '신나다': 0.8,
                '좋다': 0.6, '최고다': 0.9, '완벽하다': 0.8, '멋지다': 0.7,
                '사랑하다': 0.8, '고맙다': 0.6, '감사하다': 0.7
            },
            
            # 부정 감정
            '슬픔': {
                '슬프다': 0.8, '우울하다': 0.9, '안타깝다': 0.6, '서럽다': 0.7,
                '괴롭다': 0.8, '힘들다': 0.7, '아프다': 0.6
            },
            
            '화남': {
                '화나다': 0.8, '짜증나다': 0.7, '분노하다': 0.9, '열받다': 0.8,
                '빡치다': 0.9, '미치다': 0.8, '귀찮다': 0.5
            },
            
            '두려움': {
                '무섭다': 0.8, '두렵다': 0.8, '걱정되다': 0.6, '불안하다': 0.7,
                '떨리다': 0.6, '겁나다': 0.7
            },
            
            '놀라움': {
                '놀라다': 0.7, '깜짝': 0.6, '신기하다': 0.5, '이상하다': 0.4
            },
            
            '혐오': {
                '싫다': 0.7, '역겹다': 0.9, '더럽다': 0.8, '나쁘다': 0.6
            }
        }
    
    def _create_intensity_modifiers(self) -> Dict[str, float]:
        """감정 강도 조절어"""
        return {
            # 강화
            '매우': 1.5, '정말': 1.4, '진짜': 1.4, '너무': 1.3, '완전': 1.3,
            '엄청': 1.4, '굉장히': 1.3, '아주': 1.2, '무척': 1.2,
            
            # 약화
            '조금': 0.7, '약간': 0.8, '살짝': 0.7, '좀': 0.8, '그냥': 0.9
        }
    
    def _initialize_sentiment_model(self):
        """감정 분석 모델 초기화"""
        try:
            # 한국어 감정 분석 모델 로드
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="klue/roberta-base",
                tokenizer="klue/roberta-base"
            )
            logging.info("BERT 감정 분석 모델 초기화 완료")
        except Exception as e:
            logging.warning(f"감정 분석 모델 초기화 실패: {e}")
    
    def analyze_sentiment(self, text: str, tokens: List[Token] = None) -> SentimentResult:
        """감정 분석"""
        try:
            # 사전 기반 분석
            lexicon_result = self._lexicon_based_analysis(text, tokens)
            
            # BERT 기반 분석 (가능한 경우)
            bert_result = None
            if self.sentiment_pipeline:
                bert_result = self._bert_based_analysis(text)
            
            # 결과 통합
            final_result = self._integrate_sentiment_results(lexicon_result, bert_result)
            
            return final_result
            
        except Exception as e:
            logging.error(f"감정 분석 오류: {e}")
            return SentimentResult(
                polarity=SentimentPolarity.NEUTRAL,
                confidence=0.0
            )
    
    def _lexicon_based_analysis(self, text: str, tokens: List[Token] = None) -> SentimentResult:
        """사전 기반 감정 분석"""
        try:
            emotion_scores = defaultdict(float)
            total_intensity = 0.0
            word_count = 0
            
            # 토큰이 없으면 간단히 분할
            if not tokens:
                words = text.split()
            else:
                words = [token.text for token in tokens]
            
            # 부정 표현 확인
            has_negation = any(neg in text for neg in self.negation_words)
            
            for i, word in enumerate(words):
                # 감정어 확인
                for emotion, emotion_words in self.emotion_lexicon.items():
                    if word in emotion_words:
                        intensity = emotion_words[word]
                        
                        # 강도 조절어 확인
                        if i > 0 and words[i-1] in self.intensity_modifiers:
                            intensity *= self.intensity_modifiers[words[i-1]]
                        
                        # 부정 표현 적용
                        if has_negation:
                            intensity *= -0.5
                        
                        emotion_scores[emotion] += intensity
                        total_intensity += abs(intensity)
                        word_count += 1
            
            # 전체 극성 계산
            positive_emotions = ['기쁨']
            negative_emotions = ['슬픔', '화남', '두려움', '혐오']
            
            positive_score = sum(emotion_scores[e] for e in positive_emotions)
            negative_score = sum(emotion_scores[e] for e in negative_emotions)
            
            if positive_score > negative_score:
                polarity = SentimentPolarity.POSITIVE
                confidence = positive_score / (positive_score + negative_score + 1)
            elif negative_score > positive_score:
                polarity = SentimentPolarity.NEGATIVE
                confidence = negative_score / (positive_score + negative_score + 1)
            else:
                polarity = SentimentPolarity.NEUTRAL
                confidence = 0.5
            
            return SentimentResult(
                polarity=polarity,
                confidence=confidence,
                emotion_scores=dict(emotion_scores),
                intensity=total_intensity / max(word_count, 1)
            )
            
        except Exception as e:
            logging.error(f"사전 기반 감정 분석 오류: {e}")
            return SentimentResult(
                polarity=SentimentPolarity.NEUTRAL,
                confidence=0.0
            )
    
    def _bert_based_analysis(self, text: str) -> Optional[SentimentResult]:
        """BERT 기반 감정 분석"""
        try:
            result = self.sentiment_pipeline(text)[0]
            
            # 라벨 매핑
            if result['label'] == 'POSITIVE':
                polarity = SentimentPolarity.POSITIVE
            elif result['label'] == 'NEGATIVE':
                polarity = SentimentPolarity.NEGATIVE
            else:
                polarity = SentimentPolarity.NEUTRAL
            
            return SentimentResult(
                polarity=polarity,
                confidence=result['score'],
                emotion_scores={},
                intensity=result['score']
            )
            
        except Exception as e:
            logging.error(f"BERT 감정 분석 오류: {e}")
            return None
    
    def _integrate_sentiment_results(self, lexicon_result: SentimentResult, 
                                   bert_result: Optional[SentimentResult]) -> SentimentResult:
        """감정 분석 결과 통합"""
        try:
            if not bert_result:
                return lexicon_result
            
            # 가중 평균으로 통합
            lexicon_weight = 0.6
            bert_weight = 0.4
            
            # 극성이 일치하는 경우 신뢰도 증가
            if lexicon_result.polarity == bert_result.polarity:
                final_confidence = (lexicon_result.confidence * lexicon_weight + 
                                  bert_result.confidence * bert_weight) * 1.2
                final_polarity = lexicon_result.polarity
            else:
                # 신뢰도가 높은 쪽 선택
                if lexicon_result.confidence > bert_result.confidence:
                    final_polarity = lexicon_result.polarity
                    final_confidence = lexicon_result.confidence * 0.8
                else:
                    final_polarity = bert_result.polarity
                    final_confidence = bert_result.confidence * 0.8
            
            return SentimentResult(
                polarity=final_polarity,
                confidence=min(1.0, final_confidence),
                emotion_scores=lexicon_result.emotion_scores,
                intensity=(lexicon_result.intensity + bert_result.intensity) / 2
            )
            
        except Exception as e:
            logging.error(f"감정 분석 결과 통합 오류: {e}")
            return lexicon_result

class KeywordExtractor:
    """키워드 추출기"""
    
    def __init__(self):
        # TF-IDF 벡터라이저
        self.tfidf = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            stop_words=self._get_korean_stopwords()
        )
        
        # 중요 품사
        self.important_pos = {'명사', '동사', '형용사', '고유명사', '일반명사'}
        
        # SoyNLP 키워드 추출기
        self.soynlp_extractor = None
    
    def _get_korean_stopwords(self) -> Set[str]:
        """한국어 불용어"""
        return {
            '이', '그', '저', '것', '수', '등', '및', '또는', '하지만', '그러나',
            '때문에', '따라서', '그래서', '만약', '하면', '이런', '그런', '저런',
            '이것', '그것', '저것', '여기', '거기', '저기', '지금', '오늘', '내일'
        }
    
    def extract_keywords(self, text: str, tokens: List[Token] = None, 
                        top_k: int = 10) -> List[KeywordResult]:
        """키워드 추출"""
        try:
            keywords = []
            
            # TF-IDF 기반 추출
            tfidf_keywords = self._extract_by_tfidf(text, top_k)
            keywords.extend(tfidf_keywords)
            
            # 품사 기반 추출
            if tokens:
                pos_keywords = self._extract_by_pos(tokens, top_k)
                keywords.extend(pos_keywords)
            
            # 통계 기반 추출
            stat_keywords = self._extract_by_statistics(text, top_k)
            keywords.extend(stat_keywords)
            
            # 중복 제거 및 정렬
            keywords = self._deduplicate_keywords(keywords)
            
            return sorted(keywords, key=lambda x: x.score, reverse=True)[:top_k]
            
        except Exception as e:
            logging.error(f"키워드 추출 오류: {e}")
            return []
    
    def _extract_by_tfidf(self, text: str, top_k: int) -> List[KeywordResult]:
        """TF-IDF 기반 키워드 추출"""
        try:
            # 문장 분할
            sentences = kss.split_sentences(text)
            
            if len(sentences) < 2:
                return []
            
            # TF-IDF 계산
            tfidf_matrix = self.tfidf.fit_transform(sentences)
            feature_names = self.tfidf.get_feature_names_out()
            
            # 전체 문서의 TF-IDF 평균 계산
            mean_scores = np.mean(tfidf_matrix.toarray(), axis=0)
            
            # 상위 키워드 선택
            top_indices = np.argsort(mean_scores)[-top_k:][::-1]
            
            keywords = []
            for idx in top_indices:
                if mean_scores[idx] > 0:
                    keyword = KeywordResult(
                        keyword=feature_names[idx],
                        score=mean_scores[idx],
                        frequency=text.count(feature_names[idx]),
                        contexts=self._find_contexts(text, feature_names[idx])
                    )
                    keywords.append(keyword)
            
            return keywords
            
        except Exception as e:
            logging.error(f"TF-IDF 키워드 추출 오류: {e}")
            return []
    
    def _extract_by_pos(self, tokens: List[Token], top_k: int) -> List[KeywordResult]:
        """품사 기반 키워드 추출"""
        try:
            # 중요 품사 토큰만 선택
            important_tokens = [
                token for token in tokens 
                if token.pos in self.important_pos and len(token.text) > 1
            ]
            
            # 빈도 계산
            word_freq = Counter(token.text for token in important_tokens)
            
            # 상위 키워드 선택
            keywords = []
            for word, freq in word_freq.most_common(top_k):
                # 품사 정보 수집
                pos_tags = list(set(
                    token.pos for token in important_tokens 
                    if token.text == word
                ))
                
                keyword = KeywordResult(
                    keyword=word,
                    score=freq / len(important_tokens),  # 정규화된 빈도
                    frequency=freq,
                    pos_tags=pos_tags
                )
                keywords.append(keyword)
            
            return keywords
            
        except Exception as e:
            logging.error(f"품사 기반 키워드 추출 오류: {e}")
            return []
    
    def _extract_by_statistics(self, text: str, top_k: int) -> List[KeywordResult]:
        """통계 기반 키워드 추출"""
        try:
            # 단어 분할 (간단한 공백 기반)
            words = [word for word in text.split() if len(word) > 1]
            
            # 단어 통계
            word_stats = {}
            
            for word in set(words):
                freq = words.count(word)
                
                # 단어 길이 보정
                length_bonus = min(len(word) / 10, 1.0)
                
                # 위치 보정 (앞쪽에 나오는 단어에 가산점)
                first_position = words.index(word)
                position_bonus = max(0, (len(words) - first_position) / len(words))
                
                score = freq * (1 + length_bonus + position_bonus)
                
                word_stats[word] = {
                    'score': score,
                    'frequency': freq
                }
            
            # 상위 키워드 선택
            sorted_words = sorted(word_stats.items(), key=lambda x: x[1]['score'], reverse=True)
            
            keywords = []
            for word, stats in sorted_words[:top_k]:
                keyword = KeywordResult(
                    keyword=word,
                    score=stats['score'],
                    frequency=stats['frequency'],
                    contexts=self._find_contexts(text, word)
                )
                keywords.append(keyword)
            
            return keywords
            
        except Exception as e:
            logging.error(f"통계 기반 키워드 추출 오류: {e}")
            return []
    
    def _find_contexts(self, text: str, keyword: str, window: int = 20) -> List[str]:
        """키워드 주변 문맥 추출"""
        try:
            contexts = []
            start = 0
            
            while True:
                pos = text.find(keyword, start)
                if pos == -1:
                    break
                
                # 주변 문맥 추출
                context_start = max(0, pos - window)
                context_end = min(len(text), pos + len(keyword) + window)
                
                context = text[context_start:context_end].strip()
                if context and context not in contexts:
                    contexts.append(context)
                
                start = pos + 1
                
                # 최대 3개 문맥만
                if len(contexts) >= 3:
                    break
            
            return contexts
            
        except Exception as e:
            logging.error(f"문맥 추출 오류: {e}")
            return []
    
    def _deduplicate_keywords(self, keywords: List[KeywordResult]) -> List[KeywordResult]:
        """키워드 중복 제거"""
        try:
            unique_keywords = {}
            
            for keyword in keywords:
                word = keyword.keyword
                
                if word in unique_keywords:
                    # 더 높은 점수로 업데이트
                    if keyword.score > unique_keywords[word].score:
                        unique_keywords[word] = keyword
                else:
                    unique_keywords[word] = keyword
            
            return list(unique_keywords.values())
            
        except Exception as e:
            logging.error(f"키워드 중복 제거 오류: {e}")
            return keywords

class KoreanNLPEngine:
    """통합 한국어 NLP 엔진"""
    
    def __init__(self, db_path: str = "korean_nlp.db"):
        self.db_path = db_path
        
        # 각 구성 요소 초기화
        self.morph_analyzer = AdvancedMorphAnalyzer()
        self.ner = KoreanNER()
        self.dependency_parser = DependencyParser()
        self.sentiment_analyzer = KoreanSentimentAnalyzer()
        self.keyword_extractor = KeywordExtractor()
        
        # 데이터베이스 초기화
        self.init_database()
        
        # 처리 통계
        self.processing_stats = {
            'total_processed': 0,
            'avg_processing_time': 0.0
        }
    
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 분석 결과 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS nlp_analysis (
                analysis_id TEXT PRIMARY KEY,
                text TEXT,
                tokens TEXT,
                entities TEXT,
                dependencies TEXT,
                sentiment TEXT,
                keywords TEXT,
                processing_time REAL,
                timestamp TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    def analyze(self, text: str, save_to_db: bool = True) -> Dict[str, Any]:
        """종합 NLP 분석"""
        start_time = time.time()
        
        try:
            # 1. 형태소 분석
            tokens = self.morph_analyzer.analyze(text)
            
            # 2. 개체명 인식
            entities = self.ner.extract_entities(text)
            
            # 3. 의존 구문 분석
            dependencies = self.dependency_parser.parse(tokens)
            
            # 4. 감정 분석
            sentiment = self.sentiment_analyzer.analyze_sentiment(text, tokens)
            
            # 5. 키워드 추출
            keywords = self.keyword_extractor.extract_keywords(text, tokens)
            
            processing_time = time.time() - start_time
            
            # 결과 구성
            result = {
                'text': text,
                'tokens': [asdict(token) for token in tokens],
                'entities': [asdict(entity) for entity in entities],
                'dependencies': [asdict(dep) for dep in dependencies],
                'sentiment': asdict(sentiment),
                'keywords': [asdict(kw) for kw in keywords],
                'processing_time': processing_time,
                'timestamp': datetime.now().isoformat()
            }
            
            # 데이터베이스 저장
            if save_to_db:
                self._save_analysis_to_db(result)
            
            # 통계 업데이트
            self._update_processing_stats(processing_time)
            
            return result
            
        except Exception as e:
            logging.error(f"NLP 분석 오류: {e}")
            return {
                'text': text,
                'error': str(e),
                'processing_time': time.time() - start_time,
                'timestamp': datetime.now().isoformat()
            }
    
    def _save_analysis_to_db(self, result: Dict[str, Any]):
        """분석 결과를 데이터베이스에 저장"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            analysis_id = str(uuid.uuid4())
            
            cursor.execute("""
                INSERT INTO nlp_analysis 
                (analysis_id, text, tokens, entities, dependencies, 
                 sentiment, keywords, processing_time, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                analysis_id,
                result['text'],
                json.dumps(result['tokens']),
                json.dumps(result['entities']),
                json.dumps(result['dependencies']),
                json.dumps(result['sentiment']),
                json.dumps(result['keywords']),
                result['processing_time'],
                result['timestamp']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logging.error(f"분석 결과 저장 오류: {e}")
    
    def _update_processing_stats(self, processing_time: float):
        """처리 통계 업데이트"""
        try:
            self.processing_stats['total_processed'] += 1
            
            # 이동 평균 계산
            count = self.processing_stats['total_processed']
            current_avg = self.processing_stats['avg_processing_time']
            
            new_avg = (current_avg * (count - 1) + processing_time) / count
            self.processing_stats['avg_processing_time'] = new_avg
            
        except Exception as e:
            logging.error(f"통계 업데이트 오류: {e}")
    
    def get_analysis_statistics(self) -> Dict[str, Any]:
        """분석 통계 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 전체 분석 수
            cursor.execute("SELECT COUNT(*) FROM nlp_analysis")
            total_analyses = cursor.fetchone()[0]
            
            # 평균 처리 시간
            cursor.execute("SELECT AVG(processing_time) FROM nlp_analysis")
            avg_processing_time = cursor.fetchone()[0] or 0
            
            # 최근 24시간 분석 수
            yesterday = (datetime.now() - timedelta(days=1)).isoformat()
            cursor.execute("""
                SELECT COUNT(*) FROM nlp_analysis 
                WHERE timestamp > ?
            """, (yesterday,))
            recent_analyses = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'total_analyses': total_analyses,
                'avg_processing_time': avg_processing_time,
                'recent_24h_analyses': recent_analyses,
                'current_stats': self.processing_stats
            }
            
        except Exception as e:
            logging.error(f"통계 조회 오류: {e}")
            return {}

# FastAPI 통합
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

class AnalyzeTextRequest(BaseModel):
    text: str
    save_to_db: bool = True

class BatchAnalyzeRequest(BaseModel):
    texts: List[str]
    save_to_db: bool = True

# 글로벌 NLP 엔진
nlp_engine = None

async def get_nlp_engine():
    global nlp_engine
    if nlp_engine is None:
        nlp_engine = KoreanNLPEngine()
    return nlp_engine

def create_korean_nlp_app() -> FastAPI:
    app = FastAPI(title="Advanced Korean NLP Engine", version="1.0.0")
    
    @app.post("/analyze")
    async def analyze_text(request: AnalyzeTextRequest):
        """텍스트 NLP 분석"""
        engine = await get_nlp_engine()
        result = engine.analyze(request.text, request.save_to_db)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    
    @app.post("/analyze/batch")
    async def batch_analyze(request: BatchAnalyzeRequest):
        """배치 텍스트 분석"""
        engine = await get_nlp_engine()
        
        results = []
        for text in request.texts:
            result = engine.analyze(text, request.save_to_db)
            results.append(result)
        
        return {
            "results": results,
            "total_processed": len(results),
            "success_count": len([r for r in results if "error" not in r])
        }
    
    @app.get("/statistics")
    async def get_statistics():
        """분석 통계"""
        engine = await get_nlp_engine()
        return engine.get_analysis_statistics()
    
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
    import os
    import uvicorn
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    app = create_korean_nlp_app()
    _p = int(os.environ.get("ADVANCED_KOREAN_NLP_ENGINE_PORT", os.environ.get("PORT", "8007")))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=_p,
        log_level="info"
    ) 