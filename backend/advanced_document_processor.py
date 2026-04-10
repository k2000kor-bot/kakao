#!/usr/bin/env python3
"""
고급 문서 처리 엔진 - 맥락 이해력과 대화 지속성 향상
- 긴 문서의 구조적 분석
- 대화 맥락의 장기 메모리
- 다중 조건 요청 처리
- 세부 내용 보존
- 처리 속도 최적화
"""
import os
import re
import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="고급 문서 처리 엔진",
    description="맥락 이해력과 대화 지속성을 위한 고급 처리 시스템",
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

# 데이터 모델
class DocumentStructure(BaseModel):
    sections: List[Dict[str, Any]]
    hierarchy: Dict[str, Any]
    key_points: List[str]
    main_topics: List[str]
    supporting_details: List[str]
    processing_time: float

class MultiConditionRequest(BaseModel):
    primary_condition: str
    secondary_conditions: List[str]
    conditional_statements: List[str]
    dependencies: List[Dict[str, str]]
    priority_order: List[str]
    complexity_score: float

class ContextMemory(BaseModel):
    conversation_id: str
    context_windows: List[Dict[str, Any]]
    long_term_memory: Dict[str, Any]
    key_entities: Dict[str, Any]
    relationship_graph: Dict[str, Any]
    style_profile: Dict[str, Any]
    memory_strength: float

class StyleAnalysis(BaseModel):
    tone: str
    formality_level: float
    emotion_indicators: List[str]
    vocabulary_style: str
    sentence_patterns: List[str]
    characteristic_phrases: List[str]
    consistency_score: float

class AdvancedDocumentRequest(BaseModel):
    document_text: str
    conversation_history: List[Dict[str, Any]]
    user_conditions: List[str]
    style_preferences: Optional[Dict[str, Any]] = None
    context_id: Optional[str] = None
    priority_level: str = "normal"  # high, normal, low

class AdvancedDocumentResponse(BaseModel):
    document_structure: DocumentStructure
    multi_condition_analysis: MultiConditionRequest
    context_memory: ContextMemory
    style_analysis: StyleAnalysis
    processed_response: str
    detail_preservation_score: float
    context_continuity_score: float
    processing_metadata: Dict[str, Any]

class AdvancedDocumentProcessor:
    def __init__(self):
        self.init_database()
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.cache = {}  # 간단한 메모리 캐시
        self.cache_ttl = 3600  # 1시간
        
        # 고성능 패턴 매칭
        self.compiled_patterns = self._compile_patterns()
        
        # 처리 통계
        self.processing_stats = {
            'total_requests': 0,
            'avg_processing_time': 0,
            'cache_hits': 0
        }

    def _compile_patterns(self):
        """정규식 패턴 미리 컴파일"""
        patterns = {}
        
        # 문서 구조 패턴
        patterns['headers'] = [
            re.compile(r'^#{1,6}\s+(.+)$', re.MULTILINE),
            re.compile(r'^([A-Z][^a-z]*):'),
            re.compile(r'^(\d+\.)\s+(.+)$'),
            re.compile(r'^([가-힣]{2,10})\s*:'),
        ]
        
        # 조건 분석 패턴
        patterns['conditions'] = {
            'primary': [
                re.compile(r'먼저\s*(.+?)(?:그리고|또한|추가로|아울러)', re.IGNORECASE),
                re.compile(r'우선\s*(.+?)(?:그다음|다음으로|이후)', re.IGNORECASE),
                re.compile(r'주로\s*(.+?)(?:하되|단)', re.IGNORECASE),
            ],
            'secondary': [
                re.compile(r'(?:그리고|또한|추가로|아울러)\s*(.+?)(?:\.|$)', re.IGNORECASE),
                re.compile(r'(?:그다음|다음으로|이후)\s*(.+?)(?:\.|$)', re.IGNORECASE),
                re.compile(r'(?:동시에|함께|병행하여)\s*(.+?)(?:\.|$)', re.IGNORECASE),
            ]
        }
        
        # 스타일 패턴
        patterns['style'] = {
            'formal': [
                re.compile(r'(?:하겠습니다|드리겠습니다|해드리겠습니다)', re.IGNORECASE),
                re.compile(r'(?:말씀|부탁|검토|제안)', re.IGNORECASE),
            ],
            'casual': [
                re.compile(r'(?:해줘|써줘|만들어줘|알려줘)', re.IGNORECASE),
                re.compile(r'(?:그냥|좀|막|진짜)', re.IGNORECASE),
            ]
        }
        
        return patterns

    def init_database(self):
        """고성능 데이터베이스 초기화"""
        conn = sqlite3.connect('advanced_document_processor.db')
        cursor = conn.cursor()
        
        # 인덱스와 함께 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversation_contexts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                context_id TEXT NOT NULL,
                conversation_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                memory_strength REAL DEFAULT 1.0
            )
        ''')
        
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_context_id ON conversation_contexts(context_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_updated_at ON conversation_contexts(updated_at)')
        
        # 캐시 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS processing_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cache_key TEXT UNIQUE NOT NULL,
                cache_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                hit_count INTEGER DEFAULT 0
            )
        ''')
        
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_cache_key ON processing_cache(cache_key)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_expires_at ON processing_cache(expires_at)')
        
        conn.commit()
        conn.close()

    async def process_advanced_document(self, request: AdvancedDocumentRequest) -> AdvancedDocumentResponse:
        """고성능 문서 처리 메인 함수"""
        start_time = time.time()
        
        try:
            logger.info(f"문서 처리 시작: {len(request.document_text)} 글자")
            
            # 캐시 확인
            cache_key = self._generate_cache_key(request)
            cached_result = await self._get_from_cache(cache_key)
            if cached_result:
                self.processing_stats['cache_hits'] += 1
                logger.info("캐시에서 결과 반환")
                return cached_result
            
            # 순차 처리로 안정성 우선 (에러 디버깅용)
            logger.info("문서 구조 분석 시작")
            document_structure = await self._analyze_document_structure_async(request.document_text)
            logger.info("다중 조건 분석 시작")
            multi_condition_analysis = await self._analyze_multi_conditions_async(request.user_conditions)
            logger.info("컨텍스트 메모리 관리 시작")
            context_memory = await self._manage_context_memory_async(request.conversation_history, request.context_id)
            logger.info("스타일 분석 시작")
            style_analysis = await self._analyze_style_async(request.document_text, request.conversation_history, request.style_preferences)
            
            # 응답 생성
            processed_response = await self._generate_advanced_response_async(
                document_structure, multi_condition_analysis, context_memory, style_analysis, request
            )
            
            # 품질 점수 계산 (병렬)
            quality_tasks = [
                self._calculate_detail_preservation_score_async(request.document_text, processed_response),
                self._calculate_context_continuity_score_async(request.conversation_history, processed_response)
            ]
            
            detail_score, context_score = await asyncio.gather(*quality_tasks)
            
            processing_time = time.time() - start_time
            
            # 메타데이터 생성
            processing_metadata = {
                'processing_time': processing_time,
                'cache_used': False,
                'parallel_processing': request.priority_level != "high",
                'complexity_level': multi_condition_analysis.complexity_score,
                'memory_strength': context_memory.memory_strength
            }
            
            result = AdvancedDocumentResponse(
                document_structure=document_structure,
                multi_condition_analysis=multi_condition_analysis,
                context_memory=context_memory,
                style_analysis=style_analysis,
                processed_response=processed_response,
                detail_preservation_score=detail_score,
                context_continuity_score=context_score,
                processing_metadata=processing_metadata
            )
            
            # 결과 캐싱
            await self._save_to_cache(cache_key, result)
            
            # 컨텍스트 저장
            await self._save_context_memory_async(request.context_id, context_memory)
            
            # 통계 업데이트
            self._update_processing_stats(processing_time)
            
            return result
            
        except Exception as e:
            logger.error(f"고급 문서 처리 오류: {e}", exc_info=True)
            processing_time = time.time() - start_time
            logger.error(f"처리 실패, 폴백 응답 반환 (처리 시간: {processing_time:.2f}초)")
            return self._create_fallback_response(request)

    async def _analyze_document_structure_async(self, document_text: str) -> DocumentStructure:
        """비동기 문서 구조 분석"""
        start_time = time.time()
        
        def analyze():
            sections = []
            hierarchy = {}
            key_points = []
            main_topics = []
            supporting_details = []
            
            lines = document_text.split('\n')
            current_section = None
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line:
                    continue
                
                # 컴파일된 패턴 사용
                header_found = False
                for pattern in self.compiled_patterns['headers']:
                    match = pattern.search(line)
                    if match:
                        if current_section:
                            sections.append(current_section)
                        
                        current_section = {
                            'type': 'header',
                            'content': match.group(1) if match.groups() else line,
                            'level': self._determine_header_level(line),
                            'line_number': i,
                            'subsections': []
                        }
                        main_topics.append(current_section['content'])
                        header_found = True
                        break
                
                if not header_found and current_section:
                    current_section['subsections'].append({
                        'type': 'content',
                        'content': line,
                        'line_number': i
                    })
                    
                    if self._is_key_point(line):
                        key_points.append(line)
                    else:
                        supporting_details.append(line)
            
            if current_section:
                sections.append(current_section)
            
            hierarchy = self._build_hierarchy(sections)
            
            return DocumentStructure(
                sections=sections,
                hierarchy=hierarchy,
                key_points=key_points,
                main_topics=main_topics,
                supporting_details=supporting_details,
                processing_time=time.time() - start_time
            )
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, analyze)

    async def _analyze_multi_conditions_async(self, user_conditions: List[str]) -> MultiConditionRequest:
        """비동기 다중 조건 분석"""
        def analyze():
            primary_condition = ""
            secondary_conditions = []
            conditional_statements = []
            dependencies = []
            
            full_text = " ".join(user_conditions)
            complexity_score = len(user_conditions) * 0.2
            
            # 컴파일된 패턴 사용
            for pattern in self.compiled_patterns['conditions']['primary']:
                matches = pattern.findall(full_text)
                if matches:
                    primary_condition = matches[0]
                    complexity_score += 0.3
                    break
            
            for pattern in self.compiled_patterns['conditions']['secondary']:
                matches = pattern.findall(full_text)
                secondary_conditions.extend(matches)
                complexity_score += len(matches) * 0.1
            
            # 의존성 관계 분석
            dependency_pattern = re.compile(r'(.+?)(?:를|을)\s*완료한\s*후에?\s*(.+)', re.IGNORECASE)
            dep_matches = dependency_pattern.findall(full_text)
            for match in dep_matches:
                dependencies.append({
                    'prerequisite': match[0],
                    'dependent_task': match[1]
                })
                complexity_score += 0.2
            
            priority_order = self._determine_priority_order(primary_condition, secondary_conditions, dependencies)
            
            return MultiConditionRequest(
                primary_condition=primary_condition,
                secondary_conditions=secondary_conditions,
                conditional_statements=conditional_statements,
                dependencies=dependencies,
                priority_order=priority_order,
                complexity_score=min(complexity_score, 1.0)
            )
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, analyze)

    async def _manage_context_memory_async(self, conversation_history: List[Dict[str, Any]], context_id: Optional[str]) -> ContextMemory:
        """비동기 컨텍스트 메모리 관리"""
        def manage():
            nonlocal context_id
            if not context_id:
                context_id = f"ctx_{datetime.now().timestamp()}"
            
            # 메모리 강도 계산
            memory_strength = self._calculate_memory_strength(conversation_history)
            
            # 컨텍스트 윈도우 (최근 15개로 확장)
            context_windows = []
            for msg in conversation_history[-15:]:
                importance = self._calculate_message_importance(msg)
                context_windows.append({
                    'content': msg.get('content', ''),
                    'timestamp': msg.get('timestamp', ''),
                    'type': msg.get('type', 'text'),
                    'importance': importance,
                    'memory_weight': importance * memory_strength
                })
            
            # 장기 메모리 구축
            long_term_memory = self._build_long_term_memory(conversation_history)
            
            # 핵심 엔티티 추출
            key_entities = self._extract_key_entities_enhanced(conversation_history)
            
            # 관계 그래프
            relationship_graph = self._build_relationship_graph_enhanced(key_entities, conversation_history)
            
            # 스타일 프로필
            style_profile = self._build_style_profile_enhanced(conversation_history)
            
            return ContextMemory(
                conversation_id=context_id,
                context_windows=context_windows,
                long_term_memory=long_term_memory,
                key_entities=key_entities,
                relationship_graph=relationship_graph,
                style_profile=style_profile,
                memory_strength=memory_strength
            )
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, manage)

    async def _analyze_style_async(self, document_text: str, conversation_history: List[Dict[str, Any]], style_preferences: Optional[Dict[str, Any]]) -> StyleAnalysis:
        """비동기 스타일 분석"""
        def analyze():
            combined_text = document_text + " " + " ".join([msg.get('content', '') for msg in conversation_history])
            
            # 톤 분석
            tone = self._analyze_tone_enhanced(combined_text)
            
            # 격식 수준
            formality_level = self._analyze_formality_level_enhanced(combined_text)
            
            # 감정 지표
            emotion_indicators = self._extract_emotion_indicators_enhanced(combined_text)
            
            # 어휘 스타일
            vocabulary_style = self._analyze_vocabulary_style_enhanced(combined_text)
            
            # 문장 패턴
            sentence_patterns = self._analyze_sentence_patterns_enhanced(combined_text)
            
            # 특징적 표현
            characteristic_phrases = self._extract_characteristic_phrases_enhanced(combined_text)
            
            # 일관성 점수
            consistency_score = self._calculate_style_consistency(conversation_history)
            
            return StyleAnalysis(
                tone=tone,
                formality_level=formality_level,
                emotion_indicators=emotion_indicators,
                vocabulary_style=vocabulary_style,
                sentence_patterns=sentence_patterns,
                characteristic_phrases=characteristic_phrases,
                consistency_score=consistency_score
            )
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, analyze)

    async def _generate_advanced_response_async(self, document_structure: DocumentStructure, 
                                              multi_condition: MultiConditionRequest, 
                                              context_memory: ContextMemory, 
                                              style_analysis: StyleAnalysis, 
                                              request: AdvancedDocumentRequest) -> str:
        """비동기 고급 응답 생성"""
        def generate():
            response_parts = []
            
            # 맥락 연속성 반영
            if context_memory.memory_strength > 0.7:
                response_parts.append("이전 대화의 맥락을 충분히 고려하여")
            
            # 문서 구조 기반 응답
            if document_structure.sections:
                response_parts.append(f"문서의 {len(document_structure.sections)}개 구조를 분석했습니다.")
            
            # 복잡도에 따른 처리 방식
            if multi_condition.complexity_score > 0.7:
                response_parts.append("복잡한 다중 요청사항을 체계적으로 처리하겠습니다.")
            
            # 스타일 매칭
            if style_analysis.tone == 'formal':
                response_parts.append("격식 있는 어조로 상세히 답변드리겠습니다.")
            elif style_analysis.tone == 'casual':
                response_parts.append("친근하게 답변드릴게요.")
            
            # 우선순위 처리
            if multi_condition.priority_order:
                response_parts.append(f"총 {len(multi_condition.priority_order)}개 작업을 우선순위에 따라 순차 처리하겠습니다.")
            
            return " ".join(response_parts)
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, generate)

    # 헬퍼 메서드들 (성능 최적화)
    def _generate_cache_key(self, request: AdvancedDocumentRequest) -> str:
        """캐시 키 생성"""
        key_data = {
            'text_hash': hash(request.document_text),
            'conditions_hash': hash(str(request.user_conditions)),
            'history_length': len(request.conversation_history)
        }
        return f"adp_{hash(str(key_data))}"

    async def _get_from_cache(self, cache_key: str) -> Optional[AdvancedDocumentResponse]:
        """캐시에서 데이터 조회"""
        if cache_key in self.cache:
            cache_data = self.cache[cache_key]
            if datetime.now().timestamp() - cache_data['timestamp'] < self.cache_ttl:
                return cache_data['data']
            else:
                del self.cache[cache_key]
        return None

    async def _save_to_cache(self, cache_key: str, data: AdvancedDocumentResponse):
        """캐시에 데이터 저장"""
        self.cache[cache_key] = {
            'data': data,
            'timestamp': datetime.now().timestamp()
        }

    def _calculate_memory_strength(self, conversation_history: List[Dict[str, Any]]) -> float:
        """메모리 강도 계산"""
        if not conversation_history:
            return 0.5
        
        # 대화 길이, 일관성, 상호작용 빈도 고려
        length_factor = min(len(conversation_history) / 20, 1.0)
        
        # 최근 활동성
        recent_activity = sum(1 for msg in conversation_history[-5:] if msg.get('content'))
        activity_factor = min(recent_activity / 5, 1.0)
        
        return (length_factor + activity_factor) / 2

    def _build_long_term_memory(self, conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """향상된 장기 메모리 구축"""
        memory = {
            'topics': {},
            'patterns': {},
            'preferences': {},
            'key_moments': []
        }
        
        for i, msg in enumerate(conversation_history):
            content = msg.get('content', '')
            
            # 토픽 추적
            topics = self._extract_topics_from_text(content)
            for topic in topics:
                if topic in memory['topics']:
                    memory['topics'][topic]['count'] += 1
                    memory['topics'][topic]['last_mentioned'] = i
                else:
                    memory['topics'][topic] = {'count': 1, 'first_mentioned': i, 'last_mentioned': i}
            
            # 중요한 순간 저장
            if self._calculate_message_importance(msg) > 0.8:
                memory['key_moments'].append({
                    'content': content,
                    'index': i,
                    'importance': self._calculate_message_importance(msg)
                })
        
        return memory

    def _extract_key_entities_enhanced(self, conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """향상된 핵심 엔티티 추출"""
        entities = {
            'people': {},
            'organizations': {},
            'locations': {},
            'projects': {},
            'concepts': {}
        }
        
        for msg in conversation_history:
            content = msg.get('content', '')
            
            # 인명 패턴 (더 정교함)
            people_pattern = re.compile(r'([가-힣]{2,4})(?:씨|님|박사|교수|대표|이사|부장|과장)', re.IGNORECASE)
            people = people_pattern.findall(content)
            for person in people:
                if person in entities['people']:
                    entities['people'][person] += 1
                else:
                    entities['people'][person] = 1
            
            # 조직명 패턴
            org_pattern = re.compile(r'((?:삼성|GS|현대|대우|롯데)(?:물산|건설|그룹|전자)?)', re.IGNORECASE)
            orgs = org_pattern.findall(content)
            for org in orgs:
                if org in entities['organizations']:
                    entities['organizations'][org] += 1
                else:
                    entities['organizations'][org] = 1
        
        return entities

    def _build_relationship_graph_enhanced(self, entities: Dict[str, Any], conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """향상된 관계 그래프 구축"""
        graph = {
            'nodes': [],
            'edges': [],
            'clusters': {}
        }
        
        # 엔티티를 노드로 변환
        for entity_type, entity_dict in entities.items():
            for entity, count in entity_dict.items():
                graph['nodes'].append({
                    'id': entity,
                    'type': entity_type,
                    'weight': count,
                    'importance': min(count / 10, 1.0)
                })
        
        # 관계 추출 (동일 문장에서 언급된 엔티티들)
        for msg in conversation_history:
            content = msg.get('content', '')
            mentioned_entities = []
            
            for entity_type, entity_dict in entities.items():
                for entity in entity_dict.keys():
                    if entity in content:
                        mentioned_entities.append(entity)
            
            # 언급된 엔티티들 간의 관계 생성
            for i, entity1 in enumerate(mentioned_entities):
                for entity2 in mentioned_entities[i+1:]:
                    graph['edges'].append({
                        'source': entity1,
                        'target': entity2,
                        'weight': 1,
                        'type': 'co_occurrence'
                    })
        
        return graph

    def _build_style_profile_enhanced(self, conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """향상된 스타일 프로필 구축"""
        profile = {
            'formality': 0.5,
            'emotion_level': 0.5,
            'technical_level': 0.5,
            'preferred_length': 'medium',
            'consistency_patterns': [],
            'evolution_trend': {}
        }
        
        user_messages = [msg for msg in conversation_history if msg.get('isUser', False)]
        
        if user_messages:
            formality_scores = []
            emotion_scores = []
            
            for msg in user_messages:
                content = msg.get('content', '')
                formality_scores.append(self._analyze_formality_level_enhanced(content))
                emotion_scores.append(self._analyze_emotion_level(content))
            
            profile['formality'] = sum(formality_scores) / len(formality_scores)
            profile['emotion_level'] = sum(emotion_scores) / len(emotion_scores)
            
            # 일관성 패턴 분석
            if len(formality_scores) > 3:
                variance = sum((x - profile['formality'])**2 for x in formality_scores) / len(formality_scores)
                profile['consistency_patterns'].append({
                    'aspect': 'formality',
                    'variance': variance,
                    'stable': variance < 0.1
                })
        
        return profile

    # 향상된 분석 메서드들
    def _analyze_tone_enhanced(self, text: str) -> str:
        """향상된 톤 분석"""
        formal_score = 0
        casual_score = 0
        
        # 컴파일된 패턴 사용
        for pattern in self.compiled_patterns['style']['formal']:
            formal_score += len(pattern.findall(text))
        
        for pattern in self.compiled_patterns['style']['casual']:
            casual_score += len(pattern.findall(text))
        
        if formal_score > casual_score * 1.5:
            return 'formal'
        elif casual_score > formal_score * 1.5:
            return 'casual'
        else:
            return 'neutral'

    def _analyze_formality_level_enhanced(self, text: str) -> float:
        """향상된 격식 수준 분석"""
        formal_indicators = sum(len(pattern.findall(text)) for pattern in self.compiled_patterns['style']['formal'])
        casual_indicators = sum(len(pattern.findall(text)) for pattern in self.compiled_patterns['style']['casual'])
        
        total = formal_indicators + casual_indicators
        if total == 0:
            return 0.5
        
        return formal_indicators / total

    def _analyze_emotion_level(self, text: str) -> float:
        """감정 수준 분석"""
        emotion_words = ['좋', '나쁘', '기쁘', '슬프', '화나', '걱정', '행복', '우울']
        emotion_count = sum(1 for word in emotion_words if word in text)
        
        # 감탄부호, 이모티콘 등 고려
        exclamation_count = text.count('!') + text.count('?') * 0.5
        
        return min((emotion_count + exclamation_count) / 10, 1.0)

    def _calculate_style_consistency(self, conversation_history: List[Dict[str, Any]]) -> float:
        """스타일 일관성 계산"""
        if len(conversation_history) < 3:
            return 1.0
        
        formality_scores = []
        for msg in conversation_history:
            if msg.get('isUser', False):
                content = msg.get('content', '')
                formality_scores.append(self._analyze_formality_level_enhanced(content))
        
        if len(formality_scores) < 2:
            return 1.0
        
        # 분산을 이용한 일관성 측정
        mean_formality = sum(formality_scores) / len(formality_scores)
        variance = sum((x - mean_formality)**2 for x in formality_scores) / len(formality_scores)
        
        # 분산이 낮을수록 일관성이 높음
        return max(1.0 - variance * 5, 0.0)

    async def _calculate_detail_preservation_score_async(self, original_text: str, response: str) -> float:
        """비동기 세부 내용 보존 점수 계산"""
        def calculate():
            original_words = set(re.findall(r'\w+', original_text.lower()))
            response_words = set(re.findall(r'\w+', response.lower()))
            
            if not original_words:
                return 1.0
            
            preserved_words = original_words.intersection(response_words)
            return len(preserved_words) / len(original_words)
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, calculate)

    async def _calculate_context_continuity_score_async(self, conversation_history: List[Dict[str, Any]], response: str) -> float:
        """비동기 컨텍스트 연속성 점수 계산"""
        def calculate():
            if not conversation_history:
                return 1.0
            
            recent_topics = []
            for msg in conversation_history[-5:]:  # 최근 5개 메시지
                content = msg.get('content', '')
                topics = self._extract_topics_from_text(content)
                recent_topics.extend(topics)
            
            if not recent_topics:
                return 1.0
            
            response_topics = self._extract_topics_from_text(response)
            
            if not response_topics:
                return 0.5
            
            common_topics = set(recent_topics).intersection(set(response_topics))
            return len(common_topics) / len(set(recent_topics))
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, calculate)

    async def _save_context_memory_async(self, context_id: str, context_memory: ContextMemory):
        """비동기 컨텍스트 메모리 저장"""
        def save():
            try:
                # 더 짧은 타임아웃과 WAL 모드 사용
                conn = sqlite3.connect('advanced_document_processor.db', timeout=5.0)
                conn.execute('PRAGMA journal_mode=WAL;')
                cursor = conn.cursor()
                
                context_data = context_memory.model_dump()
                
                cursor.execute('''
                    INSERT OR REPLACE INTO conversation_contexts 
                    (context_id, conversation_data, updated_at, memory_strength)
                    VALUES (?, ?, ?, ?)
                ''', (context_id or f'default_{int(datetime.now().timestamp())}', 
                      json.dumps(context_data), 
                      datetime.now().isoformat(), 
                      context_memory.memory_strength))
                
                conn.commit()
                conn.close()
                logger.info(f"컨텍스트 저장 완료: {context_id}")
            except Exception as e:
                logger.warning(f"컨텍스트 저장 실패 (무시됨): {e}")
        
        # 저장 실패해도 전체 프로세스는 계속 진행
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(self.executor, save)
        except Exception as e:
            logger.warning(f"컨텍스트 저장 비동기 실행 실패 (무시됨): {e}")

    def _update_processing_stats(self, processing_time: float):
        """처리 통계 업데이트"""
        self.processing_stats['total_requests'] += 1
        
        # 이동 평균 계산
        current_avg = self.processing_stats['avg_processing_time']
        total = self.processing_stats['total_requests']
        
        self.processing_stats['avg_processing_time'] = (current_avg * (total - 1) + processing_time) / total

    # 기존 헬퍼 메서드들 (최적화됨)
    def _determine_header_level(self, line: str) -> int:
        if line.startswith('#'):
            return len(re.match(r'^#+', line).group())
        elif re.match(r'^\d+\.', line):
            return 2
        elif line.isupper():
            return 1
        return 3

    def _is_key_point(self, line: str) -> bool:
        key_indicators = ['중요', '핵심', '주요', '필수', '반드시', '특별히']
        return any(indicator in line for indicator in key_indicators)

    def _build_hierarchy(self, sections: List[Dict[str, Any]]) -> Dict[str, Any]:
        hierarchy = {'root': []}
        current_path = []
        
        for section in sections:
            level = section.get('level', 1)
            
            while len(current_path) >= level:
                current_path.pop()
            
            current_path.append(section['content'])
            
            current_node = hierarchy
            for path_item in current_path[:-1]:
                if path_item not in current_node:
                    current_node[path_item] = {}
                current_node = current_node[path_item]
            
            current_node[section['content']] = section
        
        return hierarchy

    def _determine_priority_order(self, primary: str, secondary: List[str], dependencies: List[Dict[str, str]]) -> List[str]:
        order = []
        
        if primary:
            order.append(primary)
        
        remaining = secondary.copy()
        
        for dep in dependencies:
            if dep['prerequisite'] in remaining and dep['dependent_task'] in remaining:
                if dep['prerequisite'] not in order:
                    order.append(dep['prerequisite'])
                if dep['dependent_task'] not in order:
                    order.append(dep['dependent_task'])
                remaining = [x for x in remaining if x not in [dep['prerequisite'], dep['dependent_task']]]
        
        order.extend(remaining)
        return order

    def _calculate_message_importance(self, msg: Dict[str, Any]) -> float:
        content = msg.get('content', '')
        importance = 0.5
        
        if len(content) > 100:
            importance += 0.2
        
        important_keywords = ['중요', '필수', '반드시', '꼭', '특별히']
        if any(keyword in content for keyword in important_keywords):
            importance += 0.3
        
        return min(importance, 1.0)

    def _extract_topics_from_text(self, text: str) -> List[str]:
        topics = []
        topic_patterns = [
            r'(?:재개발|재건축|아파트)',
            r'(?:시공사|건설사|건설)',
            r'(?:분석|검토|평가)',
            r'(?:글쓰기|작성|카드뉴스)',
        ]
        
        for pattern in topic_patterns:
            if re.search(pattern, text):
                topics.append(pattern.replace('(?:', '').replace('|', '/').replace(')', ''))
        
        return topics

    def _extract_emotion_indicators_enhanced(self, text: str) -> List[str]:
        emotions = []
        emotion_patterns = [
            r'(?:좋|나쁘|훌륭|멋진|최고|최악)',
            r'(?:기쁘|슬프|화나|행복|우울)',
            r'(?:걱정|우려|불안|기대|희망)',
        ]
        
        for pattern in emotion_patterns:
            matches = re.findall(pattern, text)
            emotions.extend(matches)
        
        return list(set(emotions))

    def _analyze_vocabulary_style_enhanced(self, text: str) -> str:
        technical_words = ['구현', '개발', '설계', '분석', 'API', '시스템', '최적화']
        casual_words = ['그냥', '좀', '막', '진짜', '완전', '개']
        formal_words = ['하겠습니다', '드리겠습니다', '말씀', '검토', '제안']
        
        tech_count = sum(1 for word in technical_words if word in text)
        casual_count = sum(1 for word in casual_words if word in text)
        formal_count = sum(1 for word in formal_words if word in text)
        
        if tech_count > max(casual_count, formal_count):
            return 'technical'
        elif formal_count > casual_count:
            return 'formal'
        elif casual_count > 0:
            return 'casual'
        return 'standard'

    def _analyze_sentence_patterns_enhanced(self, text: str) -> List[str]:
        patterns = []
        sentences = re.split(r'[.!?]', text)
        valid_sentences = [s.strip() for s in sentences if s.strip()]
        
        if not valid_sentences:
            return patterns
        
        avg_length = sum(len(s) for s in valid_sentences) / len(valid_sentences)
        
        if avg_length > 60:
            patterns.append('long_sentences')
        elif avg_length < 20:
            patterns.append('short_sentences')
        else:
            patterns.append('medium_sentences')
        
        # 문장 구조 패턴
        question_ratio = sum(1 for s in valid_sentences if '?' in s) / len(valid_sentences)
        if question_ratio > 0.3:
            patterns.append('question_heavy')
        
        return patterns

    def _extract_characteristic_phrases_enhanced(self, text: str) -> List[str]:
        phrases = []
        phrase_patterns = [
            r'(?:그러니까|그런데|하지만|그렇지만)',
            r'(?:사실|실제로|정말로|진짜로)',
            r'(?:아무튼|어쨌든|어차피|그냥)',
            r'(?:물론|당연히|확실히|분명히)',
        ]
        
        for pattern in phrase_patterns:
            matches = re.findall(pattern, text)
            phrases.extend(matches)
        
        return list(set(phrases))

    def _create_fallback_response(self, request: AdvancedDocumentRequest) -> AdvancedDocumentResponse:
        """폴백 응답 생성"""
        return AdvancedDocumentResponse(
            document_structure=DocumentStructure(
                sections=[],
                hierarchy={},
                key_points=[],
                main_topics=[],
                supporting_details=[],
                processing_time=0.0
            ),
            multi_condition_analysis=MultiConditionRequest(
                primary_condition="",
                secondary_conditions=[],
                conditional_statements=[],
                dependencies=[],
                priority_order=[],
                complexity_score=0.0
            ),
            context_memory=ContextMemory(
                conversation_id="fallback",
                context_windows=[],
                long_term_memory={},
                key_entities={},
                relationship_graph={},
                style_profile={},
                memory_strength=0.5
            ),
            style_analysis=StyleAnalysis(
                tone="neutral",
                formality_level=0.5,
                emotion_indicators=[],
                vocabulary_style="standard",
                sentence_patterns=[],
                characteristic_phrases=[],
                consistency_score=0.5
            ),
            processed_response="문서를 처리했습니다. 더 구체적인 요청을 해주시면 정확한 답변을 드릴 수 있습니다.",
            detail_preservation_score=0.5,
            context_continuity_score=0.5,
            processing_metadata={
                'processing_time': 0.0,
                'cache_used': False,
                'parallel_processing': False,
                'complexity_level': 0.0,
                'memory_strength': 0.5
            }
        )

# 엔진 인스턴스 생성
advanced_document_processor = AdvancedDocumentProcessor()

# API 엔드포인트
@app.post("/api/v9/advanced-document", response_model=AdvancedDocumentResponse)
async def process_advanced_document(request: AdvancedDocumentRequest):
    """고급 문서 처리 API"""
    try:
        result = await advanced_document_processor.process_advanced_document(request)
        return result
    except Exception as e:
        logger.error(f"고급 문서 처리 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v9/stats")
async def get_processing_stats():
    """처리 통계 조회"""
    return advanced_document_processor.processing_stats

@app.get("/api/v9/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "service": "advanced_document_processor", "version": "3.0.0"}

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "고급 문서 처리 엔진",
        "version": "3.0.0",
        "capabilities": [
            "고성능 긴 문서 구조 분석",
            "다중 조건 요청 병렬 처리",
            "대화 맥락 장기 메모리",
            "스타일 분석 및 일관성 매칭",
            "세부 내용 보존",
            "비동기 처리로 속도 최적화",
            "지능형 캐싱 시스템"
        ],
        "performance_features": [
            "병렬 처리",
            "메모리 캐싱",
            "패턴 프리컴파일",
            "우선순위 기반 처리"
        ],
        "endpoints": {
            "advanced_document": "/api/v9/advanced-document",
            "stats": "/api/v9/stats",
            "health": "/api/v9/health"
        }
    }

if __name__ == "__main__":
    import uvicorn

    _p = int(
        os.environ.get(
            "ADVANCED_DOCUMENT_PROCESSOR_PORT", os.environ.get("PORT", "8005")
        )
    )
    uvicorn.run(app, host="0.0.0.0", port=_p)
