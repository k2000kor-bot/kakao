#!/usr/bin/env python3
"""
고도화된 대화 처리 서버
- 다단계 질문 의도 파악
- 긴 대화 맥락 이해
- 웹 검색을 통한 지식 보완
- 종합적 답변 생성
"""

import json
import logging
import os
import re
import requests
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Enhanced Chat Server",
    description="고도화된 대화 처리 서버",
    version="2.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 클래스들
@dataclass
class ConversationContext:
    """대화 맥락 정보"""
    user_id: str
    conversation_history: List[Dict]
    current_topic: str
    user_preferences: Dict
    knowledge_gaps: List[str]
    last_updated: str

@dataclass
class QuestionAnalysis:
    """질문 분석 결과"""
    intent: str
    entities: List[str]
    complexity: str
    requires_external_knowledge: bool
    knowledge_gaps: List[str]
    confidence: float

@dataclass
class KnowledgeSource:
    """지식 소스 정보"""
    source_type: str  # 'internal', 'web_search', 'database'
    content: str
    reliability: float
    timestamp: str

class QuestionType(Enum):
    """질문 유형"""
    FACTUAL = "사실적 질문"
    ANALYTICAL = "분석적 질문"
    COMPARATIVE = "비교 질문"
    PROCEDURAL = "절차적 질문"
    CREATIVE = "창의적 질문"
    EMOTIONAL = "감정적 질문"
    COMPLEX = "복합 질문"

class EnhancedChatEngine:
    """고도화된 채팅 엔진"""
    
    def __init__(self):
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        self.knowledge_base = {}
        self.web_search_cache = {}
        
    def analyze_question(self, question: str, user_id: str) -> QuestionAnalysis:
        """질문 분석 - 의도 파악 및 복잡도 분석"""
        logger.info(f"질문 분석 시작: {question[:50]}...")
        
        # 키워드 기반 의도 분석
        intent_keywords = {
            QuestionType.EMOTIONAL: ['스트레스', '기분', '느낌', '감정', '우울', '불안', '화나', '슬프', '힘들', '괴로', 'emotion', 'feeling', 'stress', 'depressed', 'anxious'],
            QuestionType.FACTUAL: ['무엇', '언제', '어디서', '누가', 'what', 'when', 'where', 'who'],
            QuestionType.ANALYTICAL: ['왜', '어떻게', '분석', 'why', 'how', 'analyze'],
            QuestionType.COMPARATIVE: ['비교', '차이', '장단점', 'compare', 'difference'],
            QuestionType.PROCEDURAL: ['방법', '절차', '과정', 'how to', 'process'],
            QuestionType.CREATIVE: ['아이디어', '창의', '새로운', 'idea', 'creative'],
            QuestionType.COMPLEX: ['종합', '전체', 'comprehensive', 'overall']
        }
        
        question_lower = question.lower()
        detected_intents = []
        
        for q_type, keywords in intent_keywords.items():
            if any(keyword in question_lower for keyword in keywords):
                detected_intents.append(q_type)
        
        # 복잡도 분석
        complexity_score = self._calculate_complexity(question)
        
        # 엔티티 추출
        entities = self._extract_entities(question)
        
        # 지식 부족 영역 식별
        knowledge_gaps = self._identify_knowledge_gaps(question, entities)
        
        # 외부 지식 필요성 판단
        requires_external = len(knowledge_gaps) > 0 or complexity_score > 0.7
        
        primary_intent = detected_intents[0] if detected_intents else QuestionType.FACTUAL
        
        return QuestionAnalysis(
            intent=primary_intent.value,
            entities=entities,
            complexity="높음" if complexity_score > 0.7 else "중간" if complexity_score > 0.4 else "낮음",
            requires_external_knowledge=requires_external,
            knowledge_gaps=knowledge_gaps,
            confidence=min(0.95, 0.6 + len(detected_intents) * 0.1)
        )
    
    def _calculate_complexity(self, question: str) -> float:
        """질문 복잡도 계산"""
        factors = {
            'length': min(1.0, len(question) / 50),  # 더 민감하게 조정
            'question_words': len(re.findall(r'[?]', question)) / 5,  # 더 민감하게 조정
            'conjunctions': len(re.findall(r'그리고|또는|하지만|그러나|또한|또|그리고|그런데', question)) / 3,  # 더 민감하게 조정
            'technical_terms': len(re.findall(r'[A-Z]{2,}|[가-힣]{3,}기술|[가-힣]{3,}학|[가-힣]{3,}론', question)) / 2,  # 더 민감하게 조정
            'multiple_topics': len(re.findall(r'차이점|비교|분석|설명|방향', question)) / 2  # 다중 주제 감지
        }
        complexity = sum(factors.values()) / len(factors)
        return min(1.0, complexity)  # 최대 1.0으로 제한
    
    def _extract_entities(self, question: str) -> List[str]:
        """엔티티 추출"""
        # 간단한 엔티티 추출 (실제로는 NER 모델 사용)
        entities = []
        
        # 인명 추출
        names = re.findall(r'[가-힣]{2,4}(?:씨|님|군|양)', question)
        entities.extend(names)
        
        # 기술 용어 추출
        tech_terms = re.findall(r'[가-힣]{2,}(?:기술|학|론|법|시스템)', question)
        entities.extend(tech_terms)
        
        # 영어 용어 추출
        english_terms = re.findall(r'[A-Z][a-z]+(?:[A-Z][a-z]+)*', question)
        entities.extend(english_terms)
        
        return list(set(entities))
    
    def _identify_knowledge_gaps(self, question: str, entities: List[str]) -> List[str]:
        """지식 부족 영역 식별"""
        gaps = []
        
        # 내부 지식베이스와 비교
        internal_knowledge = set(self.knowledge_base.keys())
        question_entities = set(entities)
        
        missing_entities = question_entities - internal_knowledge
        if missing_entities:
            gaps.extend([f"엔티티 정보 부족: {entity}" for entity in missing_entities])
        
        # 복잡한 질문의 경우 추가 지식 필요
        if len(question.split()) > 20:
            gaps.append("상세한 맥락 정보 필요")
        
        return gaps
    
    def search_web_knowledge(self, query: str, max_results: int = 3) -> List[KnowledgeSource]:
        """웹 검색을 통한 지식 수집"""
        logger.info(f"웹 검색 시작: {query}")
        
        # 캐시 확인
        cache_key = f"web_search:{query}"
        if cache_key in self.web_search_cache:
            logger.info("캐시에서 검색 결과 반환")
            return self.web_search_cache[cache_key]
        
        try:
            # 실제 웹 검색 API 호출 (예시 - 실제로는 Google Search API 등 사용)
            # 여기서는 시뮬레이션된 결과 반환
            search_results = self._simulate_web_search(query, max_results)
            
            # 캐시에 저장
            self.web_search_cache[cache_key] = search_results
            
            return search_results
            
        except Exception as e:
            logger.error(f"웹 검색 오류: {e}")
            return []
    
    def _simulate_web_search(self, query: str, max_results: int) -> List[KnowledgeSource]:
        """웹 검색 시뮬레이션"""
        # 실제 환경에서는 Google Search API, Bing API 등을 사용
        simulated_results = [
            KnowledgeSource(
                source_type="web_search",
                content=f"'{query}'에 대한 최신 정보: 이 주제는 현재 활발히 연구되고 있는 분야입니다. 최근 연구에 따르면...",
                reliability=0.85,
                timestamp=datetime.now(timezone.utc).isoformat()
            ),
            KnowledgeSource(
                source_type="web_search", 
                content=f"'{query}' 관련 전문가 의견: 해당 분야 전문가들은 다음과 같이 분석하고 있습니다...",
                reliability=0.90,
                timestamp=datetime.now(timezone.utc).isoformat()
            ),
            KnowledgeSource(
                source_type="web_search",
                content=f"'{query}' 실무 적용 사례: 실제 업계에서는 다음과 같이 활용하고 있습니다...",
                reliability=0.80,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        ]
        
        return simulated_results[:max_results]
    
    def generate_comprehensive_response(
        self, 
        question: str, 
        analysis: QuestionAnalysis, 
        web_knowledge: List[KnowledgeSource],
        user_id: str
    ) -> str:
        """종합적 답변 생성"""
        logger.info("종합적 답변 생성 시작")
        
        # 대화 맥락 가져오기
        context = self.conversation_contexts.get(user_id)
        
        # 답변 구조 생성
        response_parts = []
        
        # 1. 질문 이해 확인
        response_parts.append(f"## 🎯 질문 이해 및 분석\n")
        response_parts.append(f"**질문**: \"{question}\"\n")
        response_parts.append(f"**분석된 의도**: {analysis.intent}\n")
        response_parts.append(f"**복잡도**: {analysis.complexity}\n")
        response_parts.append(f"**신뢰도**: {analysis.confidence:.2f}\n")
        
        if analysis.entities:
            response_parts.append(f"**식별된 핵심 요소**: {', '.join(analysis.entities)}\n")
        
        # 2. 내부 지식 기반 답변
        response_parts.append(f"\n## 💡 내부 지식 기반 답변\n")
        internal_response = self._generate_internal_response(question, analysis)
        response_parts.append(internal_response)
        
        # 3. 웹 검색 보완 정보
        if web_knowledge:
            response_parts.append(f"\n## 🔍 추가 정보 (웹 검색)\n")
            for i, source in enumerate(web_knowledge, 1):
                response_parts.append(f"### 📚 정보 소스 {i} (신뢰도: {source.reliability:.2f})\n")
                response_parts.append(f"{source.content}\n")
        
        # 4. 지식 부족 영역 및 제안
        if analysis.knowledge_gaps:
            response_parts.append(f"\n## ⚠️ 지식 부족 영역\n")
            for gap in analysis.knowledge_gaps:
                response_parts.append(f"- {gap}\n")
            response_parts.append(f"\n추가 정보가 필요하시면 더 구체적으로 질문해 주세요.\n")
        
        # 5. 후속 질문 제안
        response_parts.append(f"\n## 🤔 관련 질문 제안\n")
        follow_up_questions = self._generate_follow_up_questions(question, analysis)
        for i, follow_up in enumerate(follow_up_questions, 1):
            response_parts.append(f"{i}. {follow_up}\n")
        
        # 6. 대화 맥락 업데이트
        self._update_conversation_context(user_id, question, analysis)
        
        final_response = "".join(response_parts)
        logger.info(f"답변 생성 완료: {len(final_response)}자")
        
        return final_response
    
    def _generate_internal_response(self, question: str, analysis: QuestionAnalysis) -> str:
        """내부 지식 기반 답변 생성"""
        if analysis.intent == "감정적 질문":
            return self._generate_emotional_response(question)
        elif analysis.intent == "분석적 질문":
            return self._generate_analytical_response(question)
        elif analysis.intent == "사실적 질문":
            return self._generate_factual_response(question)
        else:
            return self._generate_general_response(question)
    
    def _generate_emotional_response(self, question: str) -> str:
        """감정적 질문에 대한 답변"""
        return f"""귀하의 감정을 이해합니다. "{question}"에 대해 공감하며 답변드리겠습니다.

감정적 상황에서는 다음과 같은 접근이 도움이 될 수 있습니다:
- 현재 감정을 인정하고 받아들이기
- 감정의 원인을 차근차근 분석하기
- 긍정적인 해결 방안 모색하기
- 필요시 전문가 상담 고려하기

더 구체적인 상황을 말씀해 주시면 더 정확한 조언을 드릴 수 있습니다."""
    
    def _generate_analytical_response(self, question: str) -> str:
        """분석적 질문에 대한 답변"""
        return f""""{question}"에 대한 체계적인 분석을 제공해드리겠습니다.

분석 프레임워크:
1. **문제 정의**: 핵심 이슈 파악
2. **요인 분석**: 관련 변수들 식별
3. **데이터 수집**: 객관적 정보 수집
4. **패턴 분석**: 데이터 간 관계 파악
5. **결론 도출**: 논리적 결론 제시

구체적인 데이터나 상황을 제공해 주시면 더 정확한 분석을 도와드릴 수 있습니다."""
    
    def _generate_factual_response(self, question: str) -> str:
        """사실적 질문에 대한 답변"""
        return f""""{question}"에 대한 사실적 정보를 제공해드리겠습니다.

현재 내부 지식베이스에서 확인할 수 있는 정보:
- 기본 개념 및 정의
- 일반적인 사실 정보
- 표준적인 절차 및 방법

더 정확하고 최신의 정보가 필요하시면 구체적으로 질문해 주세요."""
    
    def _generate_general_response(self, question: str) -> str:
        """일반적인 질문에 대한 답변"""
        return f""""{question}"에 대해 종합적으로 답변드리겠습니다.

귀하의 질문을 이해하고 있으며, 다음과 같은 관점에서 답변을 구성하겠습니다:
- 기본 개념 설명
- 관련 정보 제공
- 실용적 조언
- 추가 학습 방향 제시

더 구체적인 정보가 필요하시면 언제든 말씀해 주세요."""
    
    def _generate_follow_up_questions(self, question: str, analysis: QuestionAnalysis) -> List[str]:
        """후속 질문 생성"""
        follow_ups = []
        
        if analysis.intent == "사실적 질문":
            follow_ups = [
                "이 주제의 역사적 배경은 무엇인가요?",
                "실제 적용 사례는 어떤 것들이 있나요?",
                "이와 관련된 최신 동향은 어떤가요?"
            ]
        elif analysis.intent == "분석적 질문":
            follow_ups = [
                "이 분석을 위한 구체적인 방법론은 무엇인가요?",
                "분석 결과를 어떻게 해석해야 하나요?",
                "이 분석의 한계점은 무엇인가요?"
            ]
        elif analysis.intent == "감정적 질문":
            follow_ups = [
                "이런 상황에서 어떻게 대처해야 할까요?",
                "비슷한 경험을 한 사람들의 조언은 어떤가요?",
                "전문가의 도움을 받는 방법은 무엇인가요?"
            ]
        else:
            follow_ups = [
                "이 주제에 대해 더 자세히 알고 싶습니다",
                "실제 사례나 예시를 들어 설명해 주세요",
                "관련된 다른 주제도 알려주세요"
            ]
        
        return follow_ups[:3]  # 최대 3개
    
    def _update_conversation_context(self, user_id: str, question: str, analysis: QuestionAnalysis):
        """대화 맥락 업데이트"""
        if user_id not in self.conversation_contexts:
            self.conversation_contexts[user_id] = ConversationContext(
                user_id=user_id,
                conversation_history=[],
                current_topic="",
                user_preferences={},
                knowledge_gaps=[],
                last_updated=datetime.now(timezone.utc).isoformat()
            )
        
        context = self.conversation_contexts[user_id]
        context.conversation_history.append({
            "question": question,
            "analysis": analysis.__dict__,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        context.current_topic = analysis.intent
        context.knowledge_gaps.extend(analysis.knowledge_gaps)
        context.last_updated = datetime.now(timezone.utc).isoformat()
        
        # 최근 10개 대화만 유지
        if len(context.conversation_history) > 10:
            context.conversation_history = context.conversation_history[-10:]

# 전역 엔진 인스턴스
chat_engine = EnhancedChatEngine()

class ChatMessage(BaseModel):
    message: str
    user_id: str = "default"
    context: Optional[dict] = None

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Enhanced Chat Server",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "다단계 질문 의도 파악",
            "긴 대화 맥락 이해",
            "웹 검색을 통한 지식 보완",
            "종합적 답변 생성",
            "후속 질문 제안",
            "대화 맥락 유지"
        ]
    }

@app.post("/api/chat")
async def enhanced_chat_endpoint(chat_data: ChatMessage):
    """고도화된 채팅 API"""
    try:
        logger.info(f"고도화된 채팅 요청: {chat_data.message[:50]}...")
        
        # 1단계: 질문 분석
        analysis = chat_engine.analyze_question(chat_data.message, chat_data.user_id)
        logger.info(f"질문 분석 완료: {analysis.intent}")
        
        # 2단계: 웹 검색 (필요한 경우)
        web_knowledge = []
        if analysis.requires_external_knowledge:
            logger.info("웹 검색 수행")
            web_knowledge = chat_engine.search_web_knowledge(chat_data.message)
        
        # 3단계: 종합적 답변 생성
        response = chat_engine.generate_comprehensive_response(
            chat_data.message, analysis, web_knowledge, chat_data.user_id
        )
        
        result = {
            "success": True,
            "response": response,
            "analysis": {
                "intent": analysis.intent,
                "complexity": analysis.complexity,
                "confidence": analysis.confidence,
                "entities": analysis.entities,
                "knowledge_gaps": analysis.knowledge_gaps,
                "web_sources_used": len(web_knowledge)
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"답변 생성 완료: {len(response)}자")
        return result
        
    except Exception as e:
        logger.error(f"고도화된 채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/conversation/{user_id}")
async def get_conversation_context(user_id: str):
    """대화 맥락 조회"""
    try:
        context = chat_engine.conversation_contexts.get(user_id)
        if not context:
            return {"message": "대화 기록이 없습니다"}
        
        return {
            "user_id": user_id,
            "conversation_count": len(context.conversation_history),
            "current_topic": context.current_topic,
            "knowledge_gaps": context.knowledge_gaps,
            "last_updated": context.last_updated
        }
    except Exception as e:
        logger.error(f"대화 맥락 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """상태 확인"""
    return {
        "status": "healthy",
        "active_conversations": len(chat_engine.conversation_contexts),
        "cached_searches": len(chat_engine.web_search_cache),
        "message": "고도화된 채팅 서버가 정상적으로 작동하고 있습니다"
    }

if __name__ == "__main__":
    logger.info("🚀 Enhanced Chat Server를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
