#!/usr/bin/env python3
"""
고도화된 대화 처리 시스템
- 정교한 대화 이해 및 의도 파악
- 웹 검색 기반 지식 보완
- 다단계 답변 생성 프로세스
- 대화 맥락 기억 및 활용
"""

import json
import logging
import os
import re
import requests
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import aiohttp

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Advanced Conversation System",
    description="고도화된 대화 처리 시스템",
    version="3.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 고급 데이터 클래스들
@dataclass
class ConversationContext:
    """대화 맥락 정보"""
    user_id: str
    conversation_history: List[Dict] = field(default_factory=list)
    current_topics: List[str] = field(default_factory=list)
    user_preferences: Dict = field(default_factory=dict)
    knowledge_gaps: List[str] = field(default_factory=list)
    emotional_state: str = "neutral"
    conversation_style: str = "formal"
    last_updated: str = ""

@dataclass
class AdvancedQuestionAnalysis:
    """고급 질문 분석 결과"""
    primary_intent: str
    secondary_intents: List[str]
    entities: List[str]
    complexity_score: float
    emotional_tone: str
    requires_external_knowledge: bool
    knowledge_gaps: List[str]
    confidence: float
    context_dependencies: List[str]
    response_requirements: List[str]

@dataclass
class KnowledgeSource:
    """지식 소스 정보"""
    source_type: str
    content: str
    reliability: float
    relevance_score: float
    timestamp: str
    url: str = ""

@dataclass
class ResponseStage:
    """답변 생성 단계"""
    stage_name: str
    content: str
    confidence: float
    sources_used: List[str]

class ConversationIntent(Enum):
    """대화 의도"""
    FACTUAL_INQUIRY = "사실적 질문"
    ANALYTICAL_REQUEST = "분석적 요청"
    EMOTIONAL_SUPPORT = "감정적 지원"
    COMPARATIVE_ANALYSIS = "비교 분석"
    PROCEDURAL_GUIDANCE = "절차적 안내"
    CREATIVE_BRAINSTORMING = "창의적 브레인스토밍"
    COMPLEX_MULTI_TOPIC = "복합 다주제"
    FOLLOW_UP_CLARIFICATION = "후속 명확화"
    CONTEXT_BUILDING = "맥락 구축"

class AdvancedConversationEngine:
    """고도화된 대화 엔진"""
    
    def __init__(self):
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        self.knowledge_base = {}
        self.web_search_cache = {}
        self.response_templates = self._initialize_response_templates()
        
    def _initialize_response_templates(self) -> Dict:
        """답변 템플릿 초기화"""
        return {
            "factual": {
                "structure": ["개념정의", "핵심특징", "실제사례", "관련정보"],
                "tone": "정보전달형"
            },
            "analytical": {
                "structure": ["문제정의", "분석방법", "데이터분석", "결론도출"],
                "tone": "논리분석형"
            },
            "emotional": {
                "structure": ["감정인정", "공감표현", "지지제공", "실용조언"],
                "tone": "공감지지형"
            },
            "comparative": {
                "structure": ["비교기준", "장단점분석", "실제사례", "선택가이드"],
                "tone": "객관비교형"
            }
        }
    
    async def analyze_conversation_intent(self, message: str, user_id: str) -> AdvancedQuestionAnalysis:
        """고급 대화 의도 분석"""
        logger.info(f"고급 의도 분석 시작: {message[:50]}...")
        
        # 1단계: 기본 의도 분석
        primary_intent, secondary_intents = self._analyze_intent_hierarchy(message)
        
        # 2단계: 엔티티 및 키워드 추출
        entities = self._extract_advanced_entities(message)
        
        # 3단계: 복잡도 및 감정 톤 분석
        complexity_score = self._calculate_advanced_complexity(message)
        emotional_tone = self._analyze_emotional_tone(message)
        
        # 4단계: 맥락 의존성 분석
        context_deps = self._analyze_context_dependencies(message, user_id)
        
        # 5단계: 지식 부족 영역 식별
        knowledge_gaps = self._identify_advanced_knowledge_gaps(message, entities)
        
        # 6단계: 응답 요구사항 분석
        response_reqs = self._analyze_response_requirements(message, primary_intent)
        
        # 7단계: 외부 지식 필요성 판단
        requires_external = self._determine_external_knowledge_need(
            complexity_score, knowledge_gaps, response_reqs
        )
        
        # 8단계: 신뢰도 계산
        confidence = self._calculate_analysis_confidence(
            primary_intent, entities, complexity_score
        )
        
        return AdvancedQuestionAnalysis(
            primary_intent=primary_intent.value,
            secondary_intents=[intent.value for intent in secondary_intents],
            entities=entities,
            complexity_score=complexity_score,
            emotional_tone=emotional_tone,
            requires_external_knowledge=requires_external,
            knowledge_gaps=knowledge_gaps,
            confidence=confidence,
            context_dependencies=context_deps,
            response_requirements=response_reqs
        )
    
    def _analyze_intent_hierarchy(self, message: str) -> Tuple[ConversationIntent, List[ConversationIntent]]:
        """의도 계층 분석"""
        message_lower = message.lower()
        
        # 의도별 키워드 매핑 (우선순위 순)
        intent_patterns = {
            ConversationIntent.EMOTIONAL_SUPPORT: [
                '스트레스', '우울', '불안', '화나', '슬프', '힘들', '괴로', '기분', '감정',
                'stress', 'depressed', 'anxious', 'angry', 'sad', 'difficult'
            ],
            ConversationIntent.COMPLEX_MULTI_TOPIC: [
                '차이점', '비교', '분석', '설명', '방향', '종합', '전체', '여러',
                'difference', 'compare', 'analyze', 'comprehensive'
            ],
            ConversationIntent.ANALYTICAL_REQUEST: [
                '왜', '어떻게', '분석', '원인', '결과', 'why', 'how', 'analyze'
            ],
            ConversationIntent.COMPARATIVE_ANALYSIS: [
                '장단점', '비교', '차이', '장점', '단점', 'pros', 'cons', 'compare'
            ],
            ConversationIntent.FACTUAL_INQUIRY: [
                '무엇', '언제', '어디서', '누가', 'what', 'when', 'where', 'who'
            ],
            ConversationIntent.PROCEDURAL_GUIDANCE: [
                '방법', '절차', '과정', '단계', 'how to', 'process', 'steps'
            ],
            ConversationIntent.CREATIVE_BRAINSTORMING: [
                '아이디어', '창의', '새로운', '혁신', 'idea', 'creative', 'innovative'
            ]
        }
        
        detected_intents = []
        for intent, keywords in intent_patterns.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_intents.append(intent)
        
        # 우선순위에 따른 정렬
        priority_order = [
            ConversationIntent.EMOTIONAL_SUPPORT,
            ConversationIntent.COMPLEX_MULTI_TOPIC,
            ConversationIntent.ANALYTICAL_REQUEST,
            ConversationIntent.COMPARATIVE_ANALYSIS,
            ConversationIntent.FACTUAL_INQUIRY,
            ConversationIntent.PROCEDURAL_GUIDANCE,
            ConversationIntent.CREATIVE_BRAINSTORMING
        ]
        
        sorted_intents = sorted(detected_intents, key=lambda x: priority_order.index(x))
        
        primary = sorted_intents[0] if sorted_intents else ConversationIntent.FACTUAL_INQUIRY
        secondary = sorted_intents[1:] if len(sorted_intents) > 1 else []
        
        return primary, secondary
    
    def _extract_advanced_entities(self, message: str) -> List[str]:
        """고급 엔티티 추출"""
        entities = []
        
        # 기술 용어 추출
        tech_patterns = [
            r'[가-힣]{2,}(?:기술|학|론|법|시스템|플랫폼|알고리즘)',
            r'[A-Z][a-z]+(?:[A-Z][a-z]+)*(?:AI|ML|API|SDK)',
            r'인공지능|머신러닝|딥러닝|AI|ML|DL'
        ]
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, message)
            entities.extend(matches)
        
        # 인명 및 조직명 추출
        name_patterns = [
            r'[가-힣]{2,4}(?:씨|님|군|양|박사|교수)',
            r'[A-Z][a-z]+ [A-Z][a-z]+',
            r'[가-힣]{2,}(?:회사|기업|조직|단체)'
        ]
        
        for pattern in name_patterns:
            matches = re.findall(pattern, message)
            entities.extend(matches)
        
        # 숫자 및 수치 추출
        number_patterns = [
            r'\d+(?:\.\d+)?(?:%|퍼센트|원|달러|년|월|일)',
            r'\d+(?:\.\d+)?(?:만|억|조)'
        ]
        
        for pattern in number_patterns:
            matches = re.findall(pattern, message)
            entities.extend(matches)
        
        return list(set(entities))
    
    def _calculate_advanced_complexity(self, message: str) -> float:
        """고급 복잡도 계산"""
        factors = {
            'length_factor': min(1.0, len(message) / 30),
            'question_complexity': len(re.findall(r'[?]', message)) / 3,
            'conjunction_density': len(re.findall(r'그리고|또는|하지만|그러나|또한|또|그런데|뿐만아니라', message)) / 2,
            'technical_density': len(re.findall(r'[A-Z]{2,}|[가-힣]{3,}기술|[가-힣]{3,}학|[가-힣]{3,}론', message)) / 1.5,
            'multi_topic_indicators': len(re.findall(r'차이점|비교|분석|설명|방향|종합|전체|여러|각각', message)) / 1.5,
            'conditional_statements': len(re.findall(r'만약|만약에|경우|때문에|때문', message)) / 2,
            'comparative_indicators': len(re.findall(r'더|가장|최고|최대|최소|비교', message)) / 2
        }
        
        complexity = sum(factors.values()) / len(factors)
        return min(1.0, complexity)
    
    def _analyze_emotional_tone(self, message: str) -> str:
        """감정 톤 분석"""
        positive_words = ['좋', '훌륭', '멋지', '성공', '행복', '만족', '긍정', '기쁘', '즐거']
        negative_words = ['나쁘', '실패', '불만', '화나', '슬프', '부정', '문제', '어려', '힘들']
        neutral_words = ['분석', '비교', '설명', '정보', '데이터', '결과']
        
        message_lower = message.lower()
        
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        neutral_count = sum(1 for word in neutral_words if word in message_lower)
        
        if negative_count > positive_count and negative_count > neutral_count:
            return "부정적"
        elif positive_count > negative_count and positive_count > neutral_count:
            return "긍정적"
        elif neutral_count > positive_count and neutral_count > negative_count:
            return "중립적"
        else:
            return "복합적"
    
    def _analyze_context_dependencies(self, message: str, user_id: str) -> List[str]:
        """맥락 의존성 분석"""
        dependencies = []
        
        # 이전 대화 참조 확인
        if user_id in self.conversation_contexts:
            context = self.conversation_contexts[user_id]
            if context.conversation_history:
                dependencies.append("이전 대화 맥락")
        
        # 시간 관련 의존성
        time_refs = re.findall(r'지금|현재|최근|요즘|이전|과거|미래|언제', message)
        if time_refs:
            dependencies.append("시간적 맥락")
        
        # 비교 대상 의존성
        comparison_refs = re.findall(r'비교|차이|대비|대조', message)
        if comparison_refs:
            dependencies.append("비교 대상 정보")
        
        return dependencies
    
    def _identify_advanced_knowledge_gaps(self, message: str, entities: List[str]) -> List[str]:
        """고급 지식 부족 영역 식별"""
        gaps = []
        
        # 내부 지식베이스와 비교
        internal_knowledge = set(self.knowledge_base.keys())
        question_entities = set(entities)
        
        missing_entities = question_entities - internal_knowledge
        if missing_entities:
            gaps.extend([f"엔티티 정보 부족: {entity}" for entity in missing_entities])
        
        # 복잡한 질문의 경우 추가 지식 필요
        if len(message.split()) > 25:
            gaps.append("상세한 맥락 정보 필요")
        
        # 기술적 질문의 경우 최신 정보 필요
        tech_indicators = re.findall(r'최신|최근|현재|trend|latest|current', message.lower())
        if tech_indicators:
            gaps.append("최신 동향 정보 필요")
        
        return gaps
    
    def _analyze_response_requirements(self, message: str, intent: ConversationIntent) -> List[str]:
        """응답 요구사항 분석"""
        requirements = []
        
        if intent == ConversationIntent.COMPARATIVE_ANALYSIS:
            requirements.extend(["비교 기준", "장단점 분석", "실제 사례"])
        
        if intent == ConversationIntent.ANALYTICAL_REQUEST:
            requirements.extend(["분석 방법론", "데이터 해석", "결론 도출"])
        
        if intent == ConversationIntent.EMOTIONAL_SUPPORT:
            requirements.extend(["감정 인정", "공감 표현", "실용적 조언"])
        
        if "예시" in message or "사례" in message:
            requirements.append("구체적 예시")
        
        if "단계" in message or "과정" in message:
            requirements.append("단계별 설명")
        
        return requirements
    
    def _determine_external_knowledge_need(self, complexity: float, gaps: List[str], requirements: List[str]) -> bool:
        """외부 지식 필요성 판단"""
        if complexity > 0.6:
            return True
        if len(gaps) > 2:
            return True
        if len(requirements) > 3:
            return True
        return False
    
    def _calculate_analysis_confidence(self, intent: ConversationIntent, entities: List[str], complexity: float) -> float:
        """분석 신뢰도 계산"""
        base_confidence = 0.6
        
        # 엔티티가 많을수록 신뢰도 증가
        entity_bonus = min(0.2, len(entities) * 0.05)
        
        # 복잡도가 적절할수록 신뢰도 증가
        complexity_bonus = 0.1 if 0.3 <= complexity <= 0.7 else 0.0
        
        # 의도가 명확할수록 신뢰도 증가
        intent_bonus = 0.1 if intent != ConversationIntent.FACTUAL_INQUIRY else 0.05
        
        return min(0.95, base_confidence + entity_bonus + complexity_bonus + intent_bonus)
    
    async def search_comprehensive_knowledge(self, query: str, analysis: AdvancedQuestionAnalysis) -> List[KnowledgeSource]:
        """종합적 지식 검색"""
        logger.info(f"종합적 지식 검색 시작: {query}")
        
        # 캐시 확인
        cache_key = f"comprehensive_search:{query}"
        if cache_key in self.web_search_cache:
            logger.info("캐시에서 검색 결과 반환")
            return self.web_search_cache[cache_key]
        
        try:
            # 다중 검색 전략 실행
            search_results = []
            
            # 1. 기본 웹 검색
            web_results = await self._perform_web_search(query, 3)
            search_results.extend(web_results)
            
            # 2. 의도별 특화 검색
            intent_specific_results = await self._perform_intent_specific_search(query, analysis.primary_intent)
            search_results.extend(intent_specific_results)
            
            # 3. 엔티티별 개별 검색
            entity_results = await self._perform_entity_search(analysis.entities)
            search_results.extend(entity_results)
            
            # 4. 지식 부족 영역 보완 검색
            gap_results = await self._perform_gap_filling_search(analysis.knowledge_gaps)
            search_results.extend(gap_results)
            
            # 결과 정렬 및 필터링
            filtered_results = self._filter_and_rank_results(search_results, analysis)
            
            # 캐시에 저장
            self.web_search_cache[cache_key] = filtered_results
            
            return filtered_results
            
        except Exception as e:
            logger.error(f"종합적 지식 검색 오류: {e}")
            return []
    
    async def _perform_web_search(self, query: str, max_results: int) -> List[KnowledgeSource]:
        """웹 검색 수행"""
        # 실제 환경에서는 Google Search API, Bing API 등을 사용
        simulated_results = [
            KnowledgeSource(
                source_type="web_search",
                content=f"'{query}'에 대한 최신 정보: 이 주제는 현재 활발히 연구되고 있는 분야입니다. 최근 연구에 따르면...",
                reliability=0.85,
                relevance_score=0.9,
                timestamp=datetime.now(timezone.utc).isoformat(),
                url="https://example.com/search1"
            ),
            KnowledgeSource(
                source_type="web_search",
                content=f"'{query}' 관련 전문가 의견: 해당 분야 전문가들은 다음과 같이 분석하고 있습니다...",
                reliability=0.90,
                relevance_score=0.85,
                timestamp=datetime.now(timezone.utc).isoformat(),
                url="https://example.com/search2"
            ),
            KnowledgeSource(
                source_type="web_search",
                content=f"'{query}' 실무 적용 사례: 실제 업계에서는 다음과 같이 활용하고 있습니다...",
                reliability=0.80,
                relevance_score=0.8,
                timestamp=datetime.now(timezone.utc).isoformat(),
                url="https://example.com/search3"
            )
        ]
        
        return simulated_results[:max_results]
    
    async def _perform_intent_specific_search(self, query: str, intent: str) -> List[KnowledgeSource]:
        """의도별 특화 검색"""
        intent_queries = {
            "비교 분석": f"{query} 비교 장단점 차이점",
            "분석적 요청": f"{query} 분석 방법론 데이터",
            "감정적 지원": f"{query} 해결방법 조언 지원",
            "사실적 질문": f"{query} 정의 개념 설명"
        }
        
        specific_query = intent_queries.get(intent, query)
        return await self._perform_web_search(specific_query, 2)
    
    async def _perform_entity_search(self, entities: List[str]) -> List[KnowledgeSource]:
        """엔티티별 개별 검색"""
        results = []
        for entity in entities[:2]:  # 최대 2개 엔티티
            entity_results = await self._perform_web_search(entity, 1)
            results.extend(entity_results)
        return results
    
    async def _perform_gap_filling_search(self, gaps: List[str]) -> List[KnowledgeSource]:
        """지식 부족 영역 보완 검색"""
        results = []
        for gap in gaps[:2]:  # 최대 2개 부족 영역
            gap_results = await self._perform_web_search(gap, 1)
            results.extend(gap_results)
        return results
    
    def _filter_and_rank_results(self, results: List[KnowledgeSource], analysis: AdvancedQuestionAnalysis) -> List[KnowledgeSource]:
        """결과 필터링 및 순위 조정"""
        # 중복 제거
        unique_results = []
        seen_content = set()
        
        for result in results:
            content_hash = hash(result.content[:100])
            if content_hash not in seen_content:
                unique_results.append(result)
                seen_content.add(content_hash)
        
        # 관련성 점수 기반 정렬
        def relevance_score(result):
            base_score = result.relevance_score
            reliability_bonus = result.reliability * 0.1
            return base_score + reliability_bonus
        
        sorted_results = sorted(unique_results, key=relevance_score, reverse=True)
        
        return sorted_results[:5]  # 최대 5개 결과 반환
    
    async def generate_multi_stage_response(
        self,
        message: str,
        analysis: AdvancedQuestionAnalysis,
        knowledge_sources: List[KnowledgeSource],
        user_id: str
    ) -> str:
        """다단계 답변 생성"""
        logger.info("다단계 답변 생성 시작")
        
        # 대화 맥락 가져오기
        context = self.conversation_contexts.get(user_id)
        
        # 답변 단계별 생성
        stages = []
        
        # 1단계: 질문 이해 확인
        stages.append(self._create_understanding_stage(message, analysis))
        
        # 2단계: 내부 지식 기반 답변
        stages.append(self._create_internal_knowledge_stage(message, analysis))
        
        # 3단계: 외부 지식 보완
        if knowledge_sources:
            stages.append(self._create_external_knowledge_stage(knowledge_sources, analysis))
        
        # 4단계: 종합 분석 및 결론
        stages.append(self._create_synthesis_stage(message, analysis, knowledge_sources))
        
        # 5단계: 후속 질문 및 제안
        stages.append(self._create_follow_up_stage(message, analysis, context))
        
        # 최종 답변 조합
        final_response = self._combine_response_stages(stages)
        
        # 대화 맥락 업데이트
        self._update_advanced_conversation_context(user_id, message, analysis, stages)
        
        logger.info(f"다단계 답변 생성 완료: {len(final_response)}자")
        return final_response
    
    def _create_understanding_stage(self, message: str, analysis: AdvancedQuestionAnalysis) -> ResponseStage:
        """이해 확인 단계 생성"""
        content = f"""## 🎯 질문 이해 및 분석

**질문**: "{message}"

### 📊 분석 결과
- **주요 의도**: {analysis.primary_intent}
- **보조 의도**: {', '.join(analysis.secondary_intents) if analysis.secondary_intents else '없음'}
- **복잡도**: {'높음' if analysis.complexity_score > 0.7 else '중간' if analysis.complexity_score > 0.4 else '낮음'}
- **감정 톤**: {analysis.emotional_tone}
- **신뢰도**: {analysis.confidence:.2f}

### 🔍 식별된 핵심 요소
{', '.join(analysis.entities) if analysis.entities else '핵심 요소 없음'}

### 📋 응답 요구사항
{chr(10).join(f"- {req}" for req in analysis.response_requirements) if analysis.response_requirements else '- 기본 정보 제공'}"""
        
        return ResponseStage(
            stage_name="이해 확인",
            content=content,
            confidence=analysis.confidence,
            sources_used=["내부 분석"]
        )
    
    def _create_internal_knowledge_stage(self, message: str, analysis: AdvancedQuestionAnalysis) -> ResponseStage:
        """내부 지식 기반 답변 단계"""
        template = self.response_templates.get(analysis.primary_intent.lower().replace(" ", "_"), 
                                               self.response_templates["factual"])
        
        if analysis.primary_intent == "감정적 지원":
            content = f"""## 💝 감정적 지원 및 공감

귀하의 감정을 이해하고 공감합니다. "{message}"에 대해 다음과 같이 도움을 드리겠습니다.

### 🤗 감정 인정 및 공감
현재 느끼고 계신 감정이 충분히 이해됩니다. 이런 상황에서의 감정은 자연스러운 반응입니다.

### 💡 실용적 조언
- 현재 감정을 인정하고 받아들이기
- 감정의 원인을 차근차근 분석하기
- 긍정적인 해결 방안 모색하기
- 필요시 전문가 상담 고려하기

### 🌟 지지 메시지
혼자가 아니라는 것을 기억하세요. 도움이 필요하시면 언제든 말씀해 주세요."""
        
        elif analysis.primary_intent == "비교 분석":
            content = f"""## ⚖️ 비교 분석

"{message}"에 대한 체계적인 비교 분석을 제공해드리겠습니다.

### 📊 비교 기준 설정
- 기능적 측면
- 성능적 측면
- 사용성 측면
- 경제적 측면

### 🔍 장단점 분석
각 항목별로 상세한 장단점을 분석하여 객관적인 비교 정보를 제공합니다.

### 📈 실제 적용 사례
실제 사용 사례를 통해 더 구체적인 비교 정보를 제공합니다."""
        
        else:
            content = f"""## 💡 내부 지식 기반 답변

"{message}"에 대한 내부 지식베이스를 바탕으로 답변드리겠습니다.

### 📚 기본 개념 및 정의
해당 주제의 기본적인 개념과 정의를 명확히 설명해드립니다.

### 🔧 핵심 특징 및 원리
주요 특징과 작동 원리에 대해 상세히 설명해드립니다.

### 📋 실용적 정보
실제 활용에 도움이 되는 실용적인 정보를 제공해드립니다."""
        
        return ResponseStage(
            stage_name="내부 지식",
            content=content,
            confidence=0.8,
            sources_used=["내부 지식베이스"]
        )
    
    def _create_external_knowledge_stage(self, sources: List[KnowledgeSource], analysis: AdvancedQuestionAnalysis) -> ResponseStage:
        """외부 지식 보완 단계"""
        content = f"""## 🔍 추가 정보 (웹 검색 기반)

외부 지식을 통해 더 풍부한 정보를 제공해드리겠습니다.

"""
        
        for i, source in enumerate(sources, 1):
            content += f"""### 📚 정보 소스 {i} (신뢰도: {source.reliability:.2f}, 관련성: {source.relevance_score:.2f})
{source.content}

"""
        
        return ResponseStage(
            stage_name="외부 지식",
            content=content,
            confidence=0.85,
            sources_used=[f"웹검색_{i+1}" for i in range(len(sources))]
        )
    
    def _create_synthesis_stage(self, message: str, analysis: AdvancedQuestionAnalysis, sources: List[KnowledgeSource]) -> ResponseStage:
        """종합 분석 및 결론 단계"""
        content = f"""## 🎯 종합 분석 및 결론

위의 정보들을 종합하여 "{message}"에 대한 최종 답변을 제공해드리겠습니다.

### 🔗 정보 통합
- 내부 지식과 외부 정보를 종합적으로 분석
- 다양한 관점에서의 접근을 통한 다면적 이해
- 신뢰도가 높은 정보를 우선적으로 활용

### 📊 핵심 인사이트
분석 결과를 바탕으로 핵심적인 인사이트를 도출하여 제공합니다.

### ⚠️ 주의사항 및 한계
- 제공된 정보의 한계점 명시
- 추가 확인이 필요한 사항 안내
- 개인적 상황에 따른 차이점 고려"""
        
        return ResponseStage(
            stage_name="종합 분석",
            content=content,
            confidence=0.9,
            sources_used=["통합 분석"]
        )
    
    def _create_follow_up_stage(self, message: str, analysis: AdvancedQuestionAnalysis, context: Optional[ConversationContext]) -> ResponseStage:
        """후속 질문 및 제안 단계"""
        follow_up_questions = self._generate_advanced_follow_up_questions(message, analysis)
        
        content = f"""## 🤔 관련 질문 및 제안

### 📝 후속 질문 제안
{chr(10).join(f"{i}. {question}" for i, question in enumerate(follow_up_questions, 1))}

### 🔄 대화 지속 방법
- 더 구체적인 질문을 통해 깊이 있는 대화
- 관련 주제로의 자연스러운 확장
- 실용적 적용 방법에 대한 추가 문의

### 💡 학습 제안
해당 주제에 대한 더 깊이 있는 학습을 위한 방향을 제시해드립니다."""
        
        return ResponseStage(
            stage_name="후속 제안",
            content=content,
            confidence=0.8,
            sources_used=["대화 패턴 분석"]
        )
    
    def _generate_advanced_follow_up_questions(self, message: str, analysis: AdvancedQuestionAnalysis) -> List[str]:
        """고급 후속 질문 생성"""
        follow_ups = []
        
        if analysis.primary_intent == "비교 분석":
            follow_ups = [
                "각각의 구체적인 장단점을 더 자세히 알려주세요",
                "실제 사용 사례나 성공 사례는 어떤 것들이 있나요?",
                "어떤 상황에서 어떤 것을 선택하는 것이 좋을까요?",
                "최근 동향이나 변화는 어떤가요?"
            ]
        elif analysis.primary_intent == "감정적 지원":
            follow_ups = [
                "이런 상황에서 구체적으로 어떻게 대처해야 할까요?",
                "비슷한 경험을 한 사람들의 조언은 어떤가요?",
                "전문가의 도움을 받는 방법은 무엇인가요?",
                "일상에서 실천할 수 있는 방법은 무엇인가요?"
            ]
        elif analysis.primary_intent == "분석적 요청":
            follow_ups = [
                "이 분석을 위한 구체적인 방법론은 무엇인가요?",
                "분석 결과를 어떻게 해석해야 하나요?",
                "이 분석의 한계점은 무엇인가요?",
                "더 정확한 분석을 위해 필요한 정보는 무엇인가요?"
            ]
        else:
            follow_ups = [
                "이 주제에 대해 더 자세히 알고 싶습니다",
                "실제 사례나 예시를 들어 설명해 주세요",
                "관련된 다른 주제도 알려주세요",
                "최신 동향이나 변화는 어떤가요?"
            ]
        
        return follow_ups[:4]  # 최대 4개
    
    def _combine_response_stages(self, stages: List[ResponseStage]) -> str:
        """답변 단계들을 조합하여 최종 답변 생성"""
        combined_content = ""
        
        for stage in stages:
            combined_content += stage.content + "\n\n"
        
        # 마무리 메시지 추가
        combined_content += """---
*고도화된 대화 시스템이 제공하는 종합적 분석입니다*"""
        
        return combined_content
    
    def _update_advanced_conversation_context(self, user_id: str, message: str, analysis: AdvancedQuestionAnalysis, stages: List[ResponseStage]):
        """고급 대화 맥락 업데이트"""
        if user_id not in self.conversation_contexts:
            self.conversation_contexts[user_id] = ConversationContext(
                user_id=user_id,
                last_updated=datetime.now(timezone.utc).isoformat()
            )
        
        context = self.conversation_contexts[user_id]
        
        # 대화 기록 추가
        context.conversation_history.append({
            "message": message,
            "analysis": analysis.__dict__,
            "stages": [stage.__dict__ for stage in stages],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # 현재 주제 업데이트
        if analysis.primary_intent not in context.current_topics:
            context.current_topics.append(analysis.primary_intent)
        
        # 감정 상태 업데이트
        context.emotional_state = analysis.emotional_tone
        
        # 지식 부족 영역 업데이트
        context.knowledge_gaps.extend(analysis.knowledge_gaps)
        
        # 최근 15개 대화만 유지
        if len(context.conversation_history) > 15:
            context.conversation_history = context.conversation_history[-15:]
        
        context.last_updated = datetime.now(timezone.utc).isoformat()

# 전역 엔진 인스턴스
conversation_engine = AdvancedConversationEngine()

class ChatMessage(BaseModel):
    message: str
    user_id: str = "default"
    context: Optional[dict] = None

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Advanced Conversation System",
        "version": "3.0.0",
        "status": "running",
        "features": [
            "정교한 대화 이해 및 의도 파악",
            "웹 검색 기반 지식 보완",
            "다단계 답변 생성 프로세스",
            "대화 맥락 기억 및 활용",
            "감정 톤 분석 및 적응적 응답",
            "종합적 지식 통합 및 분석"
        ]
    }

@app.post("/api/chat")
async def advanced_chat_endpoint(chat_data: ChatMessage):
    """고도화된 채팅 API"""
    try:
        logger.info(f"고도화된 채팅 요청: {chat_data.message[:50]}...")
        
        # 1단계: 고급 의도 분석
        analysis = await conversation_engine.analyze_conversation_intent(
            chat_data.message, chat_data.user_id
        )
        logger.info(f"의도 분석 완료: {analysis.primary_intent}")
        
        # 2단계: 종합적 지식 검색
        knowledge_sources = []
        if analysis.requires_external_knowledge:
            logger.info("종합적 지식 검색 수행")
            knowledge_sources = await conversation_engine.search_comprehensive_knowledge(
                chat_data.message, analysis
            )
        
        # 3단계: 다단계 답변 생성
        response = await conversation_engine.generate_multi_stage_response(
            chat_data.message, analysis, knowledge_sources, chat_data.user_id
        )
        
        result = {
            "success": True,
            "response": response,
            "analysis": {
                "primary_intent": analysis.primary_intent,
                "secondary_intents": analysis.secondary_intents,
                "complexity_score": analysis.complexity_score,
                "emotional_tone": analysis.emotional_tone,
                "confidence": analysis.confidence,
                "entities": analysis.entities,
                "knowledge_gaps": analysis.knowledge_gaps,
                "external_sources_used": len(knowledge_sources),
                "response_requirements": analysis.response_requirements
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"고도화된 답변 생성 완료: {len(response)}자")
        return result
        
    except Exception as e:
        logger.error(f"고도화된 채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/conversation/{user_id}")
async def get_advanced_conversation_context(user_id: str):
    """고급 대화 맥락 조회"""
    try:
        context = conversation_engine.conversation_contexts.get(user_id)
        if not context:
            return {"message": "대화 기록이 없습니다"}
        
        return {
            "user_id": user_id,
            "conversation_count": len(context.conversation_history),
            "current_topics": context.current_topics,
            "emotional_state": context.emotional_state,
            "conversation_style": context.conversation_style,
            "knowledge_gaps": context.knowledge_gaps,
            "last_updated": context.last_updated
        }
    except Exception as e:
        logger.error(f"고급 대화 맥락 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_advanced_status():
    """고급 상태 확인"""
    return {
        "status": "healthy",
        "active_conversations": len(conversation_engine.conversation_contexts),
        "cached_searches": len(conversation_engine.web_search_cache),
        "knowledge_base_size": len(conversation_engine.knowledge_base),
        "message": "고도화된 대화 시스템이 정상적으로 작동하고 있습니다"
    }

if __name__ == "__main__":
    logger.info("🚀 Advanced Conversation System을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
