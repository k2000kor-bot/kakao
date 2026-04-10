#!/usr/bin/env python3
"""
대화형 질문 분석 및 자동 답변 시스템
사용자의 질문을 분석하고 관련 정보를 자동으로 찾아 답변하는 시스템
"""

import asyncio
import re
import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging
from urllib.parse import quote_plus
import sqlite3
import os

logger = logging.getLogger(__name__)

@dataclass
class QuestionAnalysis:
    """질문 분석 결과"""
    original_question: str
    question_type: str  # 'factual', 'analytical', 'comparative', 'predictive', 'opinion'
    keywords: List[str]
    entities: List[str]
    intent: str
    context: Dict[str, Any]
    confidence: float

@dataclass
class AnswerSource:
    """답변 소스 정보"""
    source_id: str
    source_type: str  # 'database', 'web', 'document', 'conversation'
    content: str
    relevance_score: float
    confidence: float
    timestamp: datetime

@dataclass
class ConversationalAnswer:
    """대화형 답변"""
    question: str
    answer: str
    sources: List[AnswerSource]
    confidence: float
    follow_up_questions: List[str]
    related_topics: List[str]
    timestamp: datetime

class ConversationalQASystem:
    """대화형 질문-답변 시스템"""
    
    def __init__(self, db_path: str = "conversational_qa.db"):
        self.db_path = db_path
        self.question_patterns = {
            'factual': [
                r'무엇|뭐|어떤|언제|어디|누가|얼마|몇\s*개|어떻게\s*되|상태|현황',
                r'what|when|where|who|how\s*much|how\s*many|status|current'
            ],
            'analytical': [
                r'분석|검토|평가|검증|조사|연구|탐구|고찰',
                r'analyze|review|evaluate|investigate|study|examine'
            ],
            'comparative': [
                r'비교|대조|차이|유사|같|다른|더|적은|우수|열등',
                r'compare|contrast|difference|similar|same|different|better|worse'
            ],
            'predictive': [
                r'예측|전망|미래|향후|앞으로|예상|추정|가능성',
                r'predict|forecast|future|outlook|estimate|possibility'
            ],
            'opinion': [
                r'의견|생각|견해|판단|평가|느낌|인상|추천',
                r'opinion|think|view|judge|feel|recommend'
            ]
        }
        
        self.entity_patterns = {
            'location': [
                r'강남구|서울|부산|대구|한국',
                r'gangnam|seoul|busan|daegu|korea'
            ],
            'project': [
                r'재개발|개발|프로젝트|사업|계획|정책',
                r'redevelopment|development|project|plan|policy'
            ],
            'financial': [
                r'투자|자금|비용|수익|이익|손실|예산|경제',
                r'investment|fund|cost|profit|loss|budget|economy'
            ],
            'legal': [
                r'법률|규정|조례|허가|승인|절차|법적',
                r'law|regulation|permit|approval|procedure|legal'
            ]
        }
        
        self._init_database()
    
    def _init_database(self):
        """데이터베이스 초기화"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS conversation_history (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        question TEXT NOT NULL,
                        answer TEXT NOT NULL,
                        confidence REAL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        user_id TEXT,
                        session_id TEXT
                    )
                """)
                
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS knowledge_base (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        topic TEXT NOT NULL,
                        content TEXT NOT NULL,
                        source_type TEXT,
                        relevance_score REAL,
                        confidence REAL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS question_patterns (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pattern TEXT NOT NULL,
                        question_type TEXT NOT NULL,
                        confidence REAL DEFAULT 0.8
                    )
                """)
                
                conn.commit()
                logger.info("대화형 QA 시스템 데이터베이스 초기화 완료")
                
        except Exception as e:
            logger.error(f"데이터베이스 초기화 오류: {e}")
    
    def analyze_question(self, question: str, context: Dict[str, Any] = None) -> QuestionAnalysis:
        """질문 분석"""
        question_lower = question.lower()
        
        # 질문 유형 분석
        question_type = self._classify_question_type(question_lower)
        
        # 키워드 추출
        keywords = self._extract_keywords(question)
        
        # 엔티티 추출
        entities = self._extract_entities(question)
        
        # 의도 분석
        intent = self._analyze_intent(question, keywords, entities)
        
        # 신뢰도 계산
        confidence = self._calculate_analysis_confidence(question_type, keywords, entities)
        
        return QuestionAnalysis(
            original_question=question,
            question_type=question_type,
            keywords=keywords,
            entities=entities,
            intent=intent,
            context=context or {},
            confidence=confidence
        )
    
    def _classify_question_type(self, question: str) -> str:
        """질문 유형 분류"""
        scores = {}
        
        for q_type, patterns in self.question_patterns.items():
            score = 0
            for pattern in patterns:
                matches = re.findall(pattern, question, re.IGNORECASE)
                score += len(matches)
            scores[q_type] = score
        
        # 가장 높은 점수의 유형 반환
        if scores:
            return max(scores, key=scores.get)
        return 'factual'  # 기본값
    
    def _extract_keywords(self, question: str) -> List[str]:
        """키워드 추출"""
        # 한국어 키워드 패턴
        korean_patterns = [
            r'강남구|서울|부산|대구',
            r'재개발|개발|프로젝트|사업',
            r'투자|자금|비용|수익|이익',
            r'법률|규정|허가|승인',
            r'현황|상태|진행|완료',
            r'문제|이슈|쟁점|갈등',
            r'해결|방안|대책|정책',
            r'전망|예측|미래|향후'
        ]
        
        keywords = []
        for pattern in korean_patterns:
            matches = re.findall(pattern, question, re.IGNORECASE)
            keywords.extend(matches)
        
        # 영어 키워드도 포함
        english_keywords = [
            'redevelopment', 'development', 'project', 'investment',
            'legal', 'regulation', 'status', 'progress', 'issue',
            'solution', 'policy', 'forecast', 'future'
        ]
        
        for keyword in english_keywords:
            if keyword.lower() in question.lower():
                keywords.append(keyword)
        
        return list(set(keywords))  # 중복 제거
    
    def _extract_entities(self, question: str) -> List[str]:
        """엔티티 추출"""
        entities = []
        
        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, question, re.IGNORECASE)
                entities.extend(matches)
        
        return list(set(entities))  # 중복 제거
    
    def _analyze_intent(self, question: str, keywords: List[str], entities: List[str]) -> str:
        """의도 분석"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['무엇', '뭐', 'what']):
            return 'information_seeking'
        elif any(word in question_lower for word in ['어떻게', 'how']):
            return 'process_inquiry'
        elif any(word in question_lower for word in ['언제', 'when']):
            return 'timeline_inquiry'
        elif any(word in question_lower for word in ['어디', 'where']):
            return 'location_inquiry'
        elif any(word in question_lower for word in ['왜', 'why']):
            return 'reason_inquiry'
        elif any(word in question_lower for word in ['분석', 'analyze']):
            return 'analysis_request'
        elif any(word in question_lower for word in ['비교', 'compare']):
            return 'comparison_request'
        elif any(word in question_lower for word in ['예측', 'predict']):
            return 'prediction_request'
        else:
            return 'general_inquiry'
    
    def _calculate_analysis_confidence(self, question_type: str, keywords: List[str], entities: List[str]) -> float:
        """분석 신뢰도 계산"""
        confidence = 0.5  # 기본값
        
        # 키워드 수에 따른 가중치
        if len(keywords) > 0:
            confidence += min(len(keywords) * 0.1, 0.3)
        
        # 엔티티 수에 따른 가중치
        if len(entities) > 0:
            confidence += min(len(entities) * 0.1, 0.2)
        
        # 질문 유형에 따른 가중치
        type_weights = {
            'factual': 0.1,
            'analytical': 0.2,
            'comparative': 0.15,
            'predictive': 0.1,
            'opinion': 0.05
        }
        confidence += type_weights.get(question_type, 0.0)
        
        return min(confidence, 1.0)
    
    async def find_answer(self, question_analysis: QuestionAnalysis) -> ConversationalAnswer:
        """답변 찾기"""
        sources = []
        
        # 1. 데이터베이스에서 관련 정보 검색
        db_sources = await self._search_database(question_analysis)
        sources.extend(db_sources)
        
        # 2. 웹 검색 (실제 API가 있다면)
        web_sources = await self._search_web(question_analysis)
        sources.extend(web_sources)
        
        # 3. 문서 검색
        doc_sources = await self._search_documents(question_analysis)
        sources.extend(doc_sources)
        
        # 4. 대화 히스토리 검색
        history_sources = await self._search_conversation_history(question_analysis)
        sources.extend(history_sources)
        
        # 5. 답변 생성
        answer = self._generate_answer(question_analysis, sources)
        
        # 6. 후속 질문 생성
        follow_up_questions = self._generate_follow_up_questions(question_analysis, sources)
        
        # 7. 관련 주제 추출
        related_topics = self._extract_related_topics(question_analysis, sources)
        
        # 8. 전체 신뢰도 계산
        confidence = self._calculate_answer_confidence(sources)
        
        return ConversationalAnswer(
            question=question_analysis.original_question,
            answer=answer,
            sources=sources,
            confidence=confidence,
            follow_up_questions=follow_up_questions,
            related_topics=related_topics,
            timestamp=datetime.now()
        )
    
    async def _search_database(self, question_analysis: QuestionAnalysis) -> List[AnswerSource]:
        """데이터베이스 검색"""
        sources = []
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                # 키워드 기반 검색
                for keyword in question_analysis.keywords:
                    cursor = conn.execute("""
                        SELECT id, topic, content, source_type, relevance_score, confidence, created_at
                        FROM knowledge_base
                        WHERE topic LIKE ? OR content LIKE ?
                        ORDER BY relevance_score DESC, confidence DESC
                        LIMIT 5
                    """, (f'%{keyword}%', f'%{keyword}%'))
                    
                    for row in cursor.fetchall():
                        source = AnswerSource(
                            source_id=f"db_{row[0]}",
                            source_type=row[3] or 'database',
                            content=row[2],
                            relevance_score=row[4] or 0.5,
                            confidence=row[5] or 0.7,
                            timestamp=datetime.fromisoformat(row[6])
                        )
                        sources.append(source)
                
        except Exception as e:
            logger.error(f"데이터베이스 검색 오류: {e}")
        
        return sources
    
    async def _search_web(self, question_analysis: QuestionAnalysis) -> List[AnswerSource]:
        """웹 검색 (실제 구현 시 웹 연구 엔진 연동)"""
        # 실제로는 real_web_research_engine을 사용
        return []
    
    async def _search_documents(self, question_analysis: QuestionAnalysis) -> List[AnswerSource]:
        """문서 검색"""
        # 실제로는 문서 분석 시스템과 연동
        return []
    
    async def _search_conversation_history(self, question_analysis: QuestionAnalysis) -> List[AnswerSource]:
        """대화 히스토리 검색"""
        sources = []
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                # 유사한 질문 검색
                for keyword in question_analysis.keywords:
                    cursor = conn.execute("""
                        SELECT id, question, answer, confidence, timestamp
                        FROM conversation_history
                        WHERE question LIKE ? OR answer LIKE ?
                        ORDER BY confidence DESC, timestamp DESC
                        LIMIT 3
                    """, (f'%{keyword}%', f'%{keyword}%'))
                    
                    for row in cursor.fetchall():
                        source = AnswerSource(
                            source_id=f"history_{row[0]}",
                            source_type='conversation',
                            content=f"질문: {row[1]}\n답변: {row[2]}",
                            relevance_score=0.6,
                            confidence=row[3] or 0.5,
                            timestamp=datetime.fromisoformat(row[4])
                        )
                        sources.append(source)
                
        except Exception as e:
            logger.error(f"대화 히스토리 검색 오류: {e}")
        
        return sources
    
    def _generate_answer(self, question_analysis: QuestionAnalysis, sources: List[AnswerSource]) -> str:
        """답변 생성"""
        if not sources:
            return self._generate_default_answer(question_analysis)
        
        # 관련도 순으로 소스 정렬
        sorted_sources = sorted(sources, key=lambda x: x.relevance_score, reverse=True)
        
        # 상위 소스들의 내용을 조합하여 답변 생성
        answer_parts = []
        
        for source in sorted_sources[:3]:  # 상위 3개 소스만 사용
            if source.relevance_score > 0.5:
                answer_parts.append(source.content)
        
        if answer_parts:
            # 간단한 텍스트 조합 (실제로는 더 정교한 NLP 사용)
            combined_answer = " ".join(answer_parts)
            
            # 질문 유형에 따른 답변 포맷팅
            if question_analysis.question_type == 'factual':
                return f"📋 **사실 확인 결과**:\n\n{combined_answer}"
            elif question_analysis.question_type == 'analytical':
                return f"🔍 **분석 결과**:\n\n{combined_answer}"
            elif question_analysis.question_type == 'comparative':
                return f"⚖️ **비교 분석**:\n\n{combined_answer}"
            elif question_analysis.question_type == 'predictive':
                return f"🔮 **전망 분석**:\n\n{combined_answer}"
            else:
                return f"💡 **답변**:\n\n{combined_answer}"
        
        return self._generate_default_answer(question_analysis)
    
    def _generate_default_answer(self, question_analysis: QuestionAnalysis) -> str:
        """기본 답변 생성"""
        question_type = question_analysis.question_type
        
        default_answers = {
            'factual': f"죄송합니다. '{question_analysis.original_question}'에 대한 구체적인 정보를 찾을 수 없습니다. 더 자세한 질문을 해주시거나 다른 키워드로 검색해보세요.",
            'analytical': f"'{question_analysis.original_question}'에 대한 분석을 수행하려면 더 많은 데이터가 필요합니다. 관련 문서나 정보를 추가로 제공해주시면 분석을 도와드릴 수 있습니다.",
            'comparative': f"비교 분석을 위해서는 비교 대상에 대한 정보가 필요합니다. 어떤 것과 비교하고 싶으신지 구체적으로 말씀해주세요.",
            'predictive': f"미래 전망을 예측하기 위해서는 현재 상황에 대한 충분한 정보가 필요합니다. 현재 상황에 대해 더 자세히 알려주세요.",
            'opinion': f"의견을 드리기 위해서는 더 구체적인 맥락이 필요합니다. 어떤 측면에 대한 의견을 원하시는지 구체적으로 말씀해주세요."
        }
        
        return default_answers.get(question_type, "죄송합니다. 질문에 대한 답변을 찾을 수 없습니다.")
    
    def _generate_follow_up_questions(self, question_analysis: QuestionAnalysis, sources: List[AnswerSource]) -> List[str]:
        """후속 질문 생성"""
        follow_ups = []
        
        # 질문 유형에 따른 후속 질문
        if question_analysis.question_type == 'factual':
            follow_ups.extend([
                "이 정보의 출처는 무엇인가요?",
                "언제 업데이트된 정보인가요?",
                "관련된 다른 정보도 있나요?"
            ])
        elif question_analysis.question_type == 'analytical':
            follow_ups.extend([
                "이 분석의 근거는 무엇인가요?",
                "다른 관점에서도 분석해볼 수 있나요?",
                "이 분석의 한계점은 무엇인가요?"
            ])
        elif question_analysis.question_type == 'comparative':
            follow_ups.extend([
                "어떤 기준으로 비교하시겠습니까?",
                "비교 결과의 의미는 무엇인가요?",
                "다른 비교 대상도 고려해볼 수 있나요?"
            ])
        
        # 키워드 기반 후속 질문
        for keyword in question_analysis.keywords:
            if '재개발' in keyword or '정비' in keyword:
                follow_ups.append("해당 사업의 현재 진행 상황은 어떻나요?")
            elif '투자' in keyword:
                follow_ups.append("투자에 따른 위험 요소는 무엇인가요?")
            elif '법률' in keyword:
                follow_ups.append("관련 법규의 주요 내용은 무엇인가요?")
        
        return follow_ups[:5]  # 최대 5개까지만 반환
    
    def _extract_related_topics(self, question_analysis: QuestionAnalysis, sources: List[AnswerSource]) -> List[str]:
        """관련 주제 추출"""
        topics = set()
        
        # 키워드 기반 관련 주제
        for keyword in question_analysis.keywords:
            if '재개발' in keyword or '정비' in keyword:
                topics.update(['투자', '법규', '주민', '환경', '일정'])
            elif '프로젝트' in keyword:
                topics.update(['재개발', '투자', '법규', '정책', '계획'])
            elif '투자' in keyword:
                topics.update(['수익', '위험', '자금', '경제', '분석'])
            elif '법률' in keyword:
                topics.update(['규정', '허가', '절차', '정책', '규제'])
        
        return list(topics)[:10]  # 최대 10개까지만 반환
    
    def _calculate_answer_confidence(self, sources: List[AnswerSource]) -> float:
        """답변 신뢰도 계산"""
        if not sources:
            return 0.0
        
        # 소스들의 평균 신뢰도
        avg_confidence = sum(s.confidence for s in sources) / len(sources)
        
        # 소스 수에 따른 가중치
        source_count_weight = min(len(sources) * 0.1, 0.3)
        
        # 관련도에 따른 가중치
        relevance_weight = sum(s.relevance_score for s in sources) / len(sources) * 0.2
        
        return min(avg_confidence + source_count_weight + relevance_weight, 1.0)
    
    async def save_conversation(self, answer: ConversationalAnswer, user_id: str = None, session_id: str = None):
        """대화 저장"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO conversation_history (question, answer, confidence, user_id, session_id)
                    VALUES (?, ?, ?, ?, ?)
                """, (answer.question, answer.answer, answer.confidence, user_id, session_id))
                conn.commit()
                
        except Exception as e:
            logger.error(f"대화 저장 오류: {e}")
    
    async def add_knowledge(self, topic: str, content: str, source_type: str = 'manual', 
                          relevance_score: float = 0.8, confidence: float = 0.9):
        """지식 베이스에 정보 추가"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO knowledge_base (topic, content, source_type, relevance_score, confidence)
                    VALUES (?, ?, ?, ?, ?)
                """, (topic, content, source_type, relevance_score, confidence))
                conn.commit()
                logger.info(f"지식 베이스에 '{topic}' 추가됨")
                
        except Exception as e:
            logger.error(f"지식 베이스 추가 오류: {e}")

# 전역 인스턴스
conversational_qa_system = ConversationalQASystem()
