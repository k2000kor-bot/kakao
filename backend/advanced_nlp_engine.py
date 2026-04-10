#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
최상급 성능 고급 NLP 엔진
Advanced NLP Engine with State-of-the-Art Performance
"""

import json
import logging
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import re
import hashlib
from collections import defaultdict
import threading
import queue

# 고급 NLP 라이브러리 (실제 설치 필요)
try:
    import torch
    from transformers import (
        AutoTokenizer, AutoModel, 
        BertTokenizer, BertModel,
        GPT2Tokenizer, GPT2LMHeadModel,
        pipeline, TextClassificationPipeline
    )
    from sentence_transformers import SentenceTransformer, util
    import spacy
    from textblob import TextBlob
    import nltk
    from nltk.tokenize import word_tokenize, sent_tokenize
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    from nltk.tag import pos_tag
    from nltk.chunk import ne_chunk
    NLP_AVAILABLE = True
except ImportError:
    NLP_AVAILABLE = False
    logging.warning("고급 NLP 라이브러리가 설치되지 않았습니다. 기본 모드로 실행됩니다.")

logger = logging.getLogger(__name__)

@dataclass
class NLPAnalysisResult:
    """NLP 분석 결과"""
    tokens: List[str]
    entities: List[Dict[str, Any]]
    sentiment: Dict[str, float]
    keywords: List[Dict[str, Any]]
    topics: List[Dict[str, Any]]
    intent: Dict[str, float]
    context: Dict[str, Any]
    embeddings: Optional[np.ndarray] = None
    confidence: float = 0.0

@dataclass
class AdvancedSemanticAnalysis:
    """고급 의미 분석 결과"""
    surface_meaning: str
    contextual_meaning: str
    implicit_meaning: str
    emotional_tone: Dict[str, float]
    user_intent: Dict[str, float]
    confidence_score: float
    related_concepts: List[Dict[str, Any]]
    suggested_questions: List[str]
    semantic_similarity: Dict[str, float]
    discourse_analysis: Dict[str, Any]

class AdvancedNLPEngine:
    """최상급 성능 고급 NLP 엔진"""
    
    def __init__(self, use_gpu: bool = True):
        if NLP_AVAILABLE:
            self.use_gpu = use_gpu and torch.cuda.is_available()
            self.device = torch.device('cuda' if self.use_gpu else 'cpu')
        else:
            self.use_gpu = False
            self.device = 'cpu'
        
        # 모델 초기화
        self.models = {}
        self.tokenizers = {}
        self.pipelines = {}
        
        # 분석 큐
        self.analysis_queue = queue.Queue()
        self.result_cache = {}
        
        # 스레드 풀
        self.thread_pool = []
        self.max_workers = 4
        
        # 초기화
        self._initialize_models()
        self._start_worker_threads()
        
        logger.info(f"고급 NLP 엔진 초기화 완료 (Device: {self.device})")
    
    def _initialize_models(self):
        """고급 NLP 모델들 초기화"""
        if not NLP_AVAILABLE:
            logger.warning("NLP 라이브러리 없음 - 기본 모드로 실행")
            return
        
        try:
            # 1. BERT 모델 (의미 이해 및 임베딩)
            logger.info("BERT 모델 로딩 중...")
            self.models['bert'] = BertModel.from_pretrained('bert-base-multilingual-cased')
            self.tokenizers['bert'] = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
            self.models['bert'].to(self.device)
            
            # 2. GPT-2 모델 (텍스트 생성 및 완성)
            logger.info("GPT-2 모델 로딩 중...")
            self.models['gpt2'] = GPT2LMHeadModel.from_pretrained('gpt2')
            self.tokenizers['gpt2'] = GPT2Tokenizer.from_pretrained('gpt2')
            self.models['gpt2'].to(self.device)
            
            # 3. Sentence Transformers (문장 임베딩)
            logger.info("Sentence Transformers 로딩 중...")
            self.models['sentence_transformer'] = SentenceTransformer('all-MiniLM-L6-v2')
            if self.use_gpu:
                self.models['sentence_transformer'].to(self.device)
            
            # 4. 감정 분석 파이프라인
            logger.info("감정 분석 파이프라인 로딩 중...")
            self.pipelines['sentiment'] = pipeline(
                'sentiment-analysis',
                model='nlptown/bert-base-multilingual-uncased-sentiment',
                device=0 if self.use_gpu else -1
            )
            
            # 5. 텍스트 분류 파이프라인
            logger.info("텍스트 분류 파이프라인 로딩 중...")
            self.pipelines['text_classification'] = pipeline(
                'text-classification',
                model='facebook/bart-large-mnli',
                device=0 if self.use_gpu else -1
            )
            
            # 6. 개체명 인식 파이프라인
            logger.info("개체명 인식 파이프라인 로딩 중...")
            self.pipelines['ner'] = pipeline(
                'ner',
                model='dslim/bert-base-NER',
                device=0 if self.use_gpu else -1
            )
            
            # 7. 질문-답변 파이프라인
            logger.info("질문-답변 파이프라인 로딩 중...")
            self.pipelines['qa'] = pipeline(
                'question-answering',
                model='deepset/roberta-base-squad2',
                device=0 if self.use_gpu else -1
            )
            
            # 8. 한국어 특화 모델
            logger.info("한국어 특화 모델 로딩 중...")
            self.models['korean_bert'] = AutoModel.from_pretrained('klue/bert-base')
            self.tokenizers['korean_bert'] = AutoTokenizer.from_pretrained('klue/bert-base')
            self.models['korean_bert'].to(self.device)
            
            # 9. Spacy 한국어 모델 (가능한 경우)
            try:
                self.models['spacy'] = spacy.load('ko_core_news_sm')
            except:
                logger.info("Spacy 한국어 모델을 찾을 수 없습니다. 영어 모델을 사용합니다.")
                try:
                    self.models['spacy'] = spacy.load('en_core_web_sm')
                except:
                    logger.warning("Spacy 모델을 로드할 수 없습니다.")
            
            # 10. NLTK 데이터 다운로드
            try:
                nltk.download('punkt', quiet=True)
                nltk.download('stopwords', quiet=True)
                nltk.download('wordnet', quiet=True)
                nltk.download('averaged_perceptron_tagger', quiet=True)
                nltk.download('maxent_ne_chunker', quiet=True)
                nltk.download('words', quiet=True)
            except:
                logger.warning("NLTK 데이터 다운로드 실패")
            
            logger.info("모든 고급 NLP 모델 로딩 완료!")
            
        except Exception as e:
            logger.error(f"NLP 모델 초기화 실패: {e}")
            raise
    
    def _start_worker_threads(self):
        """워커 스레드 시작"""
        for i in range(self.max_workers):
            thread = threading.Thread(target=self._worker, daemon=True)
            thread.start()
            self.thread_pool.append(thread)
    
    def _worker(self):
        """워커 스레드 함수"""
        while True:
            try:
                task = self.analysis_queue.get(timeout=1)
                if task is None:
                    break
                
                task_id, text, analysis_type = task
                result = self._perform_analysis(text, analysis_type)
                self.result_cache[task_id] = result
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"워커 스레드 오류: {e}")
    
    def advanced_semantic_analysis(self, text: str, context: Dict[str, Any] = None) -> AdvancedSemanticAnalysis:
        """고급 의미 분석"""
        if not NLP_AVAILABLE:
            return self._basic_semantic_analysis(text, context)
        
        try:
            # 1. 기본 NLP 분석
            nlp_result = self._perform_nlp_analysis(text)
            
            # 2. 고급 의미 분석
            surface_meaning = self._extract_surface_meaning(text, nlp_result)
            contextual_meaning = self._analyze_contextual_meaning(text, context, nlp_result)
            implicit_meaning = self._detect_implicit_content(text, context, nlp_result)
            
            # 3. 감정 분석
            emotional_tone = self._analyze_emotional_tone(text, nlp_result)
            
            # 4. 의도 분석
            user_intent = self._analyze_user_intent(text, context, nlp_result)
            
            # 5. 신뢰도 계산
            confidence_score = self._calculate_confidence(text, nlp_result)
            
            # 6. 관련 개념 추출
            related_concepts = self._extract_related_concepts(text, nlp_result)
            
            # 7. 제안 질문 생성
            suggested_questions = self._generate_suggested_questions(text, context, nlp_result)
            
            # 8. 의미적 유사도 분석
            semantic_similarity = self._analyze_semantic_similarity(text, context)
            
            # 9. 담화 분석
            discourse_analysis = self._analyze_discourse(text, context)
            
            return AdvancedSemanticAnalysis(
                surface_meaning=surface_meaning,
                contextual_meaning=contextual_meaning,
                implicit_meaning=implicit_meaning,
                emotional_tone=emotional_tone,
                user_intent=user_intent,
                confidence_score=confidence_score,
                related_concepts=related_concepts,
                suggested_questions=suggested_questions,
                semantic_similarity=semantic_similarity,
                discourse_analysis=discourse_analysis
            )
            
        except Exception as e:
            logger.error(f"고급 의미 분석 실패: {e}")
            return self._basic_semantic_analysis(text, context)
    
    def _perform_nlp_analysis(self, text: str) -> NLPAnalysisResult:
        """기본 NLP 분석 수행"""
        try:
            # 토큰화
            tokens = self._tokenize_text(text)
            
            # 개체명 인식
            entities = self._extract_entities(text)
            
            # 감정 분석
            sentiment = self._analyze_sentiment(text)
            
            # 키워드 추출
            keywords = self._extract_keywords(text, tokens)
            
            # 토픽 분석
            topics = self._analyze_topics(text)
            
            # 의도 분석
            intent = self._analyze_intent(text)
            
            # 컨텍스트 분석
            context = self._analyze_context(text)
            
            # 임베딩 생성
            embeddings = self._generate_embeddings(text)
            
            # 신뢰도 계산
            confidence = self._calculate_nlp_confidence(text, tokens, entities)
            
            return NLPAnalysisResult(
                tokens=tokens,
                entities=entities,
                sentiment=sentiment,
                keywords=keywords,
                topics=topics,
                intent=intent,
                context=context,
                embeddings=embeddings,
                confidence=confidence
            )
            
        except Exception as e:
            logger.error(f"NLP 분석 실패: {e}")
            return self._create_basic_nlp_result(text)
    
    def _tokenize_text(self, text: str) -> List[str]:
        """고급 토큰화"""
        try:
            # BERT 토크나이저 사용
            tokens = self.tokenizers['bert'].tokenize(text)
            return tokens
        except:
            # 기본 토큰화
            return word_tokenize(text)
    
    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """개체명 인식"""
        try:
            if 'ner' in self.pipelines:
                entities = self.pipelines['ner'](text)
                return [
                    {
                        'text': entity['word'],
                        'type': entity['entity_group'],
                        'confidence': entity['score'],
                        'start': entity['start'],
                        'end': entity['end']
                    }
                    for entity in entities
                ]
        except Exception as e:
            logger.error(f"개체명 인식 실패: {e}")
        
        # 기본 개체명 인식
        try:
            if 'spacy' in self.models:
                doc = self.models['spacy'](text)
                return [
                    {
                        'text': ent.text,
                        'type': ent.label_,
                        'confidence': 0.8,
                        'start': ent.start_char,
                        'end': ent.end_char
                    }
                    for ent in doc.ents
                ]
        except:
            pass
        
        return []
    
    def _analyze_sentiment(self, text: str) -> Dict[str, float]:
        """고급 감정 분석"""
        try:
            if 'sentiment' in self.pipelines:
                result = self.pipelines['sentiment'](text)
                return {
                    'positive': result[0]['score'] if result[0]['label'] == 'POSITIVE' else 1 - result[0]['score'],
                    'negative': result[0]['score'] if result[0]['label'] == 'NEGATIVE' else 1 - result[0]['score'],
                    'neutral': result[0]['score'] if result[0]['label'] == 'NEUTRAL' else 1 - result[0]['score'],
                    'overall': result[0]['score']
                }
        except Exception as e:
            logger.error(f"감정 분석 실패: {e}")
        
        # TextBlob 감정 분석
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            
            return {
                'positive': max(0, polarity),
                'negative': max(0, -polarity),
                'neutral': 1 - abs(polarity),
                'subjectivity': subjectivity,
                'overall': polarity
            }
        except:
            return {'positive': 0.5, 'negative': 0.5, 'neutral': 0.0, 'overall': 0.0}
    
    def _extract_keywords(self, text: str, tokens: List[str]) -> List[Dict[str, Any]]:
        """키워드 추출"""
        try:
            # TF-IDF 기반 키워드 추출
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.feature_extraction.text import CountVectorizer
            
            # 불용어 제거
            stop_words = set(stopwords.words('english'))
            filtered_tokens = [token for token in tokens if token.lower() not in stop_words]
            
            # TF-IDF 계산
            vectorizer = TfidfVectorizer(max_features=20, stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([text])
            feature_names = vectorizer.get_feature_names_out()
            
            keywords = []
            for i, feature in enumerate(feature_names):
                score = tfidf_matrix[0, i]
                if score > 0.1:  # 임계값
                    keywords.append({
                        'word': feature,
                        'score': float(score),
                        'frequency': filtered_tokens.count(feature)
                    })
            
            # 점수별 정렬
            keywords.sort(key=lambda x: x['score'], reverse=True)
            return keywords[:10]  # 상위 10개
            
        except Exception as e:
            logger.error(f"키워드 추출 실패: {e}")
            return []
    
    def _analyze_topics(self, text: str) -> List[Dict[str, Any]]:
        """토픽 분석"""
        try:
            # LDA 토픽 모델링 (간단한 버전)
            from sklearn.decomposition import LatentDirichletAllocation
            from sklearn.feature_extraction.text import CountVectorizer
            
            vectorizer = CountVectorizer(max_features=100, stop_words='english')
            doc_term_matrix = vectorizer.fit_transform([text])
            
            lda = LatentDirichletAllocation(n_components=3, random_state=42)
            lda.fit(doc_term_matrix)
            
            feature_names = vectorizer.get_feature_names_out()
            topics = []
            
            for topic_idx, topic in enumerate(lda.components_):
                top_words = [feature_names[i] for i in topic.argsort()[-5:]]
                topics.append({
                    'topic_id': topic_idx,
                    'words': top_words,
                    'weights': topic.tolist()
                })
            
            return topics
            
        except Exception as e:
            logger.error(f"토픽 분석 실패: {e}")
            return []
    
    def _analyze_intent(self, text: str) -> Dict[str, float]:
        """의도 분석"""
        intent_patterns = {
            'question': ['어떻게', '왜', '언제', '어디서', '무엇을', '누가', '?'],
            'request': ['해주세요', '부탁드립니다', '요청합니다', '원합니다'],
            'analysis': ['분석', '평가', '검토', '검토해주세요'],
            'information': ['알려주세요', '정보', '설명', '이해'],
            'opinion': ['생각', '의견', '관점', '어떻게 생각하시나요'],
            'comparison': ['비교', '차이', '어떤 것이', '더 나은'],
            'prediction': ['예상', '전망', '미래', '앞으로'],
            'solution': ['해결', '방안', '대책', '방법']
        }
        
        intent_scores = {}
        text_lower = text.lower()
        
        for intent, patterns in intent_patterns.items():
            score = 0
            for pattern in patterns:
                if pattern in text_lower:
                    score += 1
            intent_scores[intent] = min(score / len(patterns), 1.0)
        
        # 정규화
        total_score = sum(intent_scores.values())
        if total_score > 0:
            intent_scores = {k: v/total_score for k, v in intent_scores.items()}
        
        return intent_scores
    
    def _analyze_context(self, text: str) -> Dict[str, Any]:
        """컨텍스트 분석"""
        context = {
            'domain': self._detect_domain(text),
            'formality': self._detect_formality(text),
            'complexity': self._analyze_complexity(text),
            'length': len(text),
            'language': self._detect_language(text)
        }
        return context
    
    def _detect_domain(self, text: str) -> str:
        """도메인 감지"""
        domains = {
            'real_estate': ['부동산', '재개발', '투자', '시세', '아파트', '매매'],
            'policy': ['정책', '법규', '규정', '정부', '승인', '허가'],
            'community': ['주민', '지역사회', '소통', '갈등', '참여'],
            'finance': ['투자', '수익률', '경제', '재정', '비용'],
            'technical': ['기술', '공법', '설계', '시공', '품질']
        }
        
        text_lower = text.lower()
        domain_scores = {}
        
        for domain, keywords in domains.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            domain_scores[domain] = score
        
        if domain_scores:
            return max(domain_scores, key=domain_scores.get)
        return 'general'
    
    def _detect_formality(self, text: str) -> str:
        """격식 수준 감지"""
        formal_indicators = ['입니다', '습니다', '하겠습니다', '부탁드립니다']
        informal_indicators = ['야', '어', '해', '해줘', '좋아']
        
        formal_count = sum(1 for indicator in formal_indicators if indicator in text)
        informal_count = sum(1 for indicator in informal_indicators if indicator in text)
        
        if formal_count > informal_count:
            return 'formal'
        elif informal_count > formal_count:
            return 'informal'
        else:
            return 'neutral'
    
    def _analyze_complexity(self, text: str) -> Dict[str, float]:
        """텍스트 복잡도 분석"""
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        unique_words = len(set(words))
        lexical_diversity = unique_words / len(words) if words else 0
        
        return {
            'avg_sentence_length': avg_sentence_length,
            'lexical_diversity': lexical_diversity,
            'complexity_score': (avg_sentence_length * 0.5 + lexical_diversity * 0.5)
        }
    
    def _detect_language(self, text: str) -> str:
        """언어 감지"""
        korean_chars = len([c for c in text if '\u3131' <= c <= '\u318E' or '\uAC00' <= c <= '\uD7A3'])
        english_chars = len([c for c in text if c.isalpha() and ord(c) < 128])
        
        if korean_chars > english_chars:
            return 'korean'
        elif english_chars > korean_chars:
            return 'english'
        else:
            return 'mixed'
    
    def _generate_embeddings(self, text: str) -> np.ndarray:
        """임베딩 생성"""
        try:
            if 'sentence_transformer' in self.models:
                embeddings = self.models['sentence_transformer'].encode(text)
                return embeddings
        except Exception as e:
            logger.error(f"임베딩 생성 실패: {e}")
        
        return np.zeros(384)  # 기본 임베딩 크기
    
    def _calculate_nlp_confidence(self, text: str, tokens: List[str], entities: List[Dict]) -> float:
        """NLP 분석 신뢰도 계산"""
        confidence = 0.5  # 기본값
        
        # 텍스트 길이에 따른 조정
        if len(text) > 50:
            confidence += 0.1
        
        # 토큰 수에 따른 조정
        if len(tokens) > 10:
            confidence += 0.1
        
        # 개체명 인식 결과에 따른 조정
        if entities:
            confidence += 0.1
        
        # 언어 감지에 따른 조정
        language = self._detect_language(text)
        if language in ['korean', 'english']:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def _extract_surface_meaning(self, text: str, nlp_result: NLPAnalysisResult) -> str:
        """표면적 의미 추출"""
        keywords = [kw['word'] for kw in nlp_result.keywords[:5]]
        entities = [ent['text'] for ent in nlp_result.entities[:3]]
        
        surface_info = []
        if keywords:
            surface_info.append(f"주요 키워드: {', '.join(keywords)}")
        if entities:
            surface_info.append(f"주요 개체: {', '.join(entities)}")
        
        return " | ".join(surface_info) if surface_info else "기본 텍스트 분석"
    
    def _analyze_contextual_meaning(self, text: str, context: Dict[str, Any], nlp_result: NLPAnalysisResult) -> str:
        """맥락적 의미 분석"""
        contextual_info = []
        
        # 도메인 정보
        if nlp_result.context.get('domain') != 'general':
            contextual_info.append(f"도메인: {nlp_result.context['domain']}")
        
        # 의도 정보
        top_intent = max(nlp_result.intent.items(), key=lambda x: x[1])
        if top_intent[1] > 0.3:
            contextual_info.append(f"주요 의도: {top_intent[0]}")
        
        # 감정 정보
        sentiment = nlp_result.sentiment
        if sentiment.get('overall', 0) != 0:
            contextual_info.append(f"감정 톤: {'긍정' if sentiment['overall'] > 0 else '부정' if sentiment['overall'] < 0 else '중립'}")
        
        return " | ".join(contextual_info) if contextual_info else "맥락 분석 결과"
    
    def _detect_implicit_content(self, text: str, context: Dict[str, Any], nlp_result: NLPAnalysisResult) -> str:
        """암시적 내용 감지"""
        implicit_elements = []
        
        # 의도 분석에서 암시적 요소 추출
        intent = nlp_result.intent
        if intent.get('question', 0) > 0.5:
            implicit_elements.append('정보 요구')
        if intent.get('request', 0) > 0.5:
            implicit_elements.append('행동 요구')
        if intent.get('analysis', 0) > 0.5:
            implicit_elements.append('분석 요구')
        
        # 감정 분석에서 암시적 요소 추출
        sentiment = nlp_result.sentiment
        if sentiment.get('negative', 0) > 0.6:
            implicit_elements.append('우려/불안')
        if sentiment.get('positive', 0) > 0.6:
            implicit_elements.append('기대/관심')
        
        return " | ".join(implicit_elements) if implicit_elements else "암시적 요소 없음"
    
    def _analyze_emotional_tone(self, text: str, nlp_result: NLPAnalysisResult) -> Dict[str, float]:
        """감정적 톤 분석"""
        return nlp_result.sentiment
    
    def _analyze_user_intent(self, text: str, context: Dict[str, Any], nlp_result: NLPAnalysisResult) -> Dict[str, float]:
        """사용자 의도 분석"""
        return nlp_result.intent
    
    def _calculate_confidence(self, text: str, nlp_result: NLPAnalysisResult) -> float:
        """신뢰도 계산"""
        base_confidence = nlp_result.confidence
        
        # 추가 신뢰도 요소들
        if len(text) > 100:
            base_confidence += 0.1
        if nlp_result.entities:
            base_confidence += 0.1
        if nlp_result.keywords:
            base_confidence += 0.1
        
        return min(base_confidence, 1.0)
    
    def _extract_related_concepts(self, text: str, nlp_result: NLPAnalysisResult) -> List[Dict[str, Any]]:
        """관련 개념 추출"""
        concepts = []
        
        # 키워드 기반 관련 개념
        for keyword in nlp_result.keywords[:5]:
            concepts.append({
                'concept': keyword['word'],
                'type': 'keyword',
                'relevance': keyword['score'],
                'source': 'tfidf'
            })
        
        # 개체명 기반 관련 개념
        for entity in nlp_result.entities[:3]:
            concepts.append({
                'concept': entity['text'],
                'type': entity['type'],
                'relevance': entity['confidence'],
                'source': 'ner'
            })
        
        # 도메인별 관련 개념
        domain = nlp_result.context.get('domain', 'general')
        domain_concepts = self._get_domain_concepts(domain)
        for concept in domain_concepts[:3]:
            concepts.append({
                'concept': concept,
                'type': 'domain',
                'relevance': 0.8,
                'source': 'domain_knowledge'
            })
        
        return concepts
    
    def _get_domain_concepts(self, domain: str) -> List[str]:
        """도메인별 관련 개념"""
        domain_concepts = {
            'real_estate': ['부동산', '재개발', '투자', '시세', '아파트', '매매', '임대', '개발'],
            'policy': ['정책', '법규', '규정', '정부', '승인', '허가', '행정', '제도'],
            'community': ['주민', '지역사회', '소통', '갈등', '참여', '협의', '공청회'],
            'finance': ['투자', '수익률', '경제', '재정', '비용', '예산', '자금'],
            'technical': ['기술', '공법', '설계', '시공', '품질', '안전', '환경']
        }
        return domain_concepts.get(domain, [])
    
    def _generate_suggested_questions(self, text: str, context: Dict[str, Any], nlp_result: NLPAnalysisResult) -> List[str]:
        """제안 질문 생성"""
        suggestions = []
        
        # 의도 기반 질문 제안
        intent = nlp_result.intent
        if intent.get('analysis', 0) > 0.3:
            suggestions.append("이 분석 결과의 구체적인 시사점은 무엇인가요?")
            suggestions.append("이 분석을 바탕으로 한 실행 방안은 무엇인가요?")
        
        if intent.get('question', 0) > 0.3:
            suggestions.append("이 질문과 관련된 추가 정보가 필요하신가요?")
            suggestions.append("이 질문의 배경이나 맥락을 더 자세히 설명해주실 수 있나요?")
        
        # 도메인 기반 질문 제안
        domain = nlp_result.context.get('domain', 'general')
        domain_questions = self._get_domain_questions(domain)
        suggestions.extend(domain_questions[:2])
        
        return suggestions
    
    def _get_domain_questions(self, domain: str) -> List[str]:
        """도메인별 제안 질문"""
        domain_questions = {
            'real_estate': [
                "이 프로젝트의 투자 수익률은 어떻게 예상되나요?",
                "시장 상황 변화에 따른 리스크는 무엇인가요?",
                "경쟁 프로젝트와 비교했을 때의 장단점은?"
            ],
            'policy': [
                "정책 변경 가능성과 그 영향은 어떻게 되나요?",
                "규제 완화나 강화에 따른 영향은?",
                "정부 지원 정책의 활용 방안은?"
            ],
            'community': [
                "주민들의 반응과 소통 전략은 어떻게 되나요?",
                "지역사회 갈등 해결 방안은 무엇인가요?",
                "주민 참여 방안과 그 효과는?"
            ],
            'finance': [
                "자금 조달 방안과 비용 구조는 어떻게 되나요?",
                "투자 위험 요소와 대응 방안은?",
                "수익성 개선 방안은 무엇인가요?"
            ],
            'technical': [
                "기술적 난이도와 해결 방안은 어떻게 되나요?",
                "품질 관리 방안과 안전 대책은?",
                "환경 영향 최소화 방안은?"
            ]
        }
        return domain_questions.get(domain, [])
    
    def _analyze_semantic_similarity(self, text: str, context: Dict[str, Any]) -> Dict[str, float]:
        """의미적 유사도 분석"""
        try:
            if 'sentence_transformer' in self.models:
                # 텍스트 임베딩 생성
                text_embedding = self.models['sentence_transformer'].encode(text)
                
                # 컨텍스트의 다른 텍스트들과 유사도 계산
                similarities = {}
                if context and 'previous_texts' in context:
                    for i, prev_text in enumerate(context['previous_texts'][-3:]):  # 최근 3개
                        prev_embedding = self.models['sentence_transformer'].encode(prev_text)
                        similarity = util.pytorch_cos_sim(text_embedding, prev_embedding)[0][0].item()
                        similarities[f'previous_{i+1}'] = similarity
                
                return similarities
        except Exception as e:
            logger.error(f"의미적 유사도 분석 실패: {e}")
        
        return {}
    
    def _analyze_discourse(self, text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """담화 분석"""
        discourse = {
            'coherence': self._analyze_coherence(text),
            'connectivity': self._analyze_connectivity(text),
            'structure': self._analyze_structure(text)
        }
        return discourse
    
    def _analyze_coherence(self, text: str) -> float:
        """일관성 분석"""
        sentences = sent_tokenize(text)
        if len(sentences) < 2:
            return 1.0
        
        try:
            # 문장 간 의미적 유사도 계산
            embeddings = self.models['sentence_transformer'].encode(sentences)
            similarities = []
            
            for i in range(len(embeddings) - 1):
                similarity = util.pytorch_cos_sim(embeddings[i], embeddings[i+1])[0][0].item()
                similarities.append(similarity)
            
            return np.mean(similarities) if similarities else 0.5
        except:
            return 0.5
    
    def _analyze_connectivity(self, text: str) -> Dict[str, Any]:
        """연결성 분석"""
        connectivity_indicators = {
            'conjunctions': ['그리고', '또는', '하지만', '그러나', '따라서', '그래서'],
            'transitions': ['또한', '더욱이', '반면에', '결과적으로', '요약하면'],
            'references': ['이것', '그것', '저것', '이러한', '그러한']
        }
        
        connectivity = {}
        text_lower = text.lower()
        
        for category, indicators in connectivity_indicators.items():
            count = sum(1 for indicator in indicators if indicator in text_lower)
            connectivity[category] = count
        
        return connectivity
    
    def _analyze_structure(self, text: str) -> Dict[str, Any]:
        """구조 분석"""
        sentences = sent_tokenize(text)
        words = word_tokenize(text)
        
        structure = {
            'sentence_count': len(sentences),
            'word_count': len(words),
            'avg_sentence_length': len(words) / len(sentences) if sentences else 0,
            'complexity': self._analyze_complexity(text)
        }
        
        return structure
    
    def _basic_semantic_analysis(self, text: str, context: Dict[str, Any] = None) -> AdvancedSemanticAnalysis:
        """기본 의미 분석 (NLP 라이브러리 없을 때)"""
        return AdvancedSemanticAnalysis(
            surface_meaning=f"기본 텍스트 분석: {text[:50]}...",
            contextual_meaning="기본 맥락 분석",
            implicit_meaning="기본 암시적 분석",
            emotional_tone={'positive': 0.5, 'negative': 0.5, 'neutral': 0.0},
            user_intent={'general': 1.0},
            confidence_score=0.5,
            related_concepts=[],
            suggested_questions=[],
            semantic_similarity={},
            discourse_analysis={}
        )
    
    def _create_basic_nlp_result(self, text: str) -> NLPAnalysisResult:
        """기본 NLP 결과 생성"""
        return NLPAnalysisResult(
            tokens=text.split(),
            entities=[],
            sentiment={'positive': 0.5, 'negative': 0.5, 'neutral': 0.0},
            keywords=[],
            topics=[],
            intent={'general': 1.0},
            context={'domain': 'general', 'formality': 'neutral'},
            embeddings=None,
            confidence=0.5
        )
    
    def _perform_analysis(self, text: str, analysis_type: str) -> Any:
        """분석 수행 (워커 스레드용)"""
        if analysis_type == 'semantic':
            return self.advanced_semantic_analysis(text)
        elif analysis_type == 'nlp':
            return self._perform_nlp_analysis(text)
        else:
            return None

# 사용 예시
if __name__ == "__main__":
    # 고급 NLP 엔진 초기화
    nlp_engine = AdvancedNLPEngine(use_gpu=True)
    
    # 테스트 텍스트
    test_text = "샘플 재개발 프로젝트의 투자 가치를 분석해주세요. 주민들의 반응도 함께 고려해서 종합적으로 평가해주시면 감사하겠습니다."
    
    # 고급 의미 분석 실행
    result = nlp_engine.advanced_semantic_analysis(test_text)
    
    print("고급 NLP 분석 완료!")
    print(f"표면적 의미: {result.surface_meaning}")
    print(f"맥락적 의미: {result.contextual_meaning}")
    print(f"감정 톤: {result.emotional_tone}")
    print(f"사용자 의도: {result.user_intent}")
    print(f"신뢰도: {result.confidence_score}")
