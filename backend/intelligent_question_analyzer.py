#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
지능형 질문 분석 및 답변 시스템
Intelligent Question Analysis and Response System
"""

import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import re
from collections import defaultdict
import threading
import queue

logger = logging.getLogger(__name__)

@dataclass
class QuestionRequirement:
    """질문 요구사항"""
    requirement_type: str  # 'analysis', 'comparison', 'prediction', 'solution', 'information'
    content: str
    priority: float  # 0.0 ~ 1.0
    context: Dict[str, Any]
    confidence: float

@dataclass
class QuestionContext:
    """질문 컨텍스트"""
    main_topic: str
    subtopics: List[str]
    entities: List[str]
    relationships: List[Dict[str, Any]]
    temporal_context: str  # 'past', 'present', 'future'
    spatial_context: str
    emotional_context: str
    urgency_level: str  # 'low', 'medium', 'high'
    complexity_level: str  # 'simple', 'moderate', 'complex'

@dataclass
class IntelligentResponse:
    """지능형 응답"""
    direct_answer: str
    comprehensive_analysis: str
    multiple_perspectives: List[Dict[str, str]]
    actionable_insights: List[str]
    related_questions: List[str]
    confidence_score: float
    reasoning_process: str
    sources_and_evidence: List[str]
    next_steps: List[str]
    risk_assessment: Dict[str, Any]

class IntelligentQuestionAnalyzer:
    """지능형 질문 분석기"""
    
    def __init__(self):
        self.question_patterns = self._initialize_patterns()
        self.response_templates = self._initialize_templates()
        self.knowledge_base = self._initialize_knowledge_base()
        self.analysis_queue = queue.Queue()
        self.result_cache = {}
        
        # 워커 스레드 시작
        self._start_worker_threads()
        
        logger.info("지능형 질문 분석기 초기화 완료")
    
    def _initialize_patterns(self) -> Dict[str, List[Dict[str, Any]]]:
        """질문 패턴 초기화"""
        return {
            'analysis': [
                {
                    'pattern': r'(분석|평가|검토|검토해주세요|어떻게\s+되나요|어떤\s+상황인가요)',
                    'weight': 0.9,
                    'context': 'analysis_request'
                },
                {
                    'pattern': r'(투자\s+가치|수익률|경제성|비용\s+효과)',
                    'weight': 0.8,
                    'context': 'financial_analysis'
                },
                {
                    'pattern': r'(정책|법규|규정|제도)',
                    'weight': 0.8,
                    'context': 'policy_analysis'
                }
            ],
            'comparison': [
                {
                    'pattern': r'(비교|차이|어떤\s+것이|더\s+나은|vs|versus)',
                    'weight': 0.9,
                    'context': 'comparison_request'
                },
                {
                    'pattern': r'(장단점|장점|단점|우수성|열등성)',
                    'weight': 0.7,
                    'context': 'pros_cons_analysis'
                }
            ],
            'prediction': [
                {
                    'pattern': r'(예상|전망|미래|앞으로|향후|예측)',
                    'weight': 0.9,
                    'context': 'prediction_request'
                },
                {
                    'pattern': r'(가능성|확률|리스크|위험요소)',
                    'weight': 0.8,
                    'context': 'risk_assessment'
                }
            ],
            'solution': [
                {
                    'pattern': r'(해결|방안|대책|방법|어떻게\s+해야|전략)',
                    'weight': 0.9,
                    'context': 'solution_request'
                },
                {
                    'pattern': r'(개선|최적화|효율화|향상)',
                    'weight': 0.8,
                    'context': 'improvement_request'
                }
            ],
            'information': [
                {
                    'pattern': r'(알려주세요|설명|이해|정보|궁금)',
                    'weight': 0.7,
                    'context': 'information_request'
                },
                {
                    'pattern': r'(무엇|어떤|언제|어디서|누가|왜|어떻게)',
                    'weight': 0.6,
                    'context': 'question_word'
                }
            ]
        }
    
    def _initialize_templates(self) -> Dict[str, Dict[str, Any]]:
        """응답 템플릿 초기화"""
        return {
            'comprehensive_analysis': {
                'structure': [
                    '현재 상황 분석',
                    '핵심 이슈 파악',
                    '다각도 검토',
                    '전망 및 제언'
                ],
                'perspectives': [
                    '정책적 관점',
                    '경제적 관점',
                    '사회적 관점',
                    '기술적 관점',
                    '환경적 관점'
                ]
            },
            'comparison_analysis': {
                'structure': [
                    '비교 대상 분석',
                    '공통점과 차이점',
                    '각각의 장단점',
                    '상황별 적합성',
                    '종합 평가'
                ]
            },
            'prediction_analysis': {
                'structure': [
                    '현재 동향 분석',
                    '변화 요인 파악',
                    '시나리오별 전망',
                    '불확실성 요소',
                    '대응 방안'
                ]
            },
            'solution_proposal': {
                'structure': [
                    '문제 정의',
                    '근본 원인 분석',
                    '해결 방안 제시',
                    '실행 계획',
                    '예상 효과'
                ]
            }
        }
    
    def _initialize_knowledge_base(self) -> Dict[str, Any]:
        """지식베이스 초기화"""
        return {
            'gaepo_woosung': {
                'project_info': {
                    'location': '서울특별시 강남구 ○○동',
                    'scale': '대규모 재개발 프로젝트',
                    'status': '추진 중',
                    'key_stakeholders': ['주민', '개발사', '정부', '지자체']
                },
                'key_issues': [
                    '주민 갈등 및 소통',
                    '투자 수익성',
                    '정책 일관성',
                    '환경 영향',
                    '인프라 확충'
                ],
                'expertise_areas': [
                    '부동산 개발',
                    '정책 분석',
                    '사회 갈등 해결',
                    '투자 분석',
                    '환경 평가'
                ]
            },
            'analysis_methods': {
                'financial': ['DCF 분석', '수익률 분석', '리스크 평가', '비용편익분석'],
                'policy': ['정책 일관성 검토', '규제 영향 분석', '정책 효과성 평가'],
                'social': ['주민 의견 분석', '갈등 요인 분석', '소통 전략 수립'],
                'technical': ['기술적 타당성', '환경 영향 평가', '인프라 계획']
            }
        }
    
    def _start_worker_threads(self):
        """워커 스레드 시작"""
        for i in range(3):
            thread = threading.Thread(target=self._worker, daemon=True)
            thread.start()
    
    def _worker(self):
        """워커 스레드 함수"""
        while True:
            try:
                task = self.analysis_queue.get(timeout=1)
                if task is None:
                    break
                
                task_id, question, context = task
                result = self.analyze_question_intelligently(question, context)
                self.result_cache[task_id] = result
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"워커 스레드 오류: {e}")
    
    def analyze_question_intelligently(self, question: str, context: Dict[str, Any] = None) -> IntelligentResponse:
        """지능형 질문 분석 및 응답 생성"""
        logger.info(f"지능형 질문 분석 시작: {question[:50]}...")
        
        # 1. 질문 요구사항 분석
        requirements = self._extract_requirements(question)
        
        # 2. 질문 컨텍스트 분석
        question_context = self._analyze_question_context(question, context)
        
        # 3. 다중 관점 분석
        perspectives = self._analyze_multiple_perspectives(question, requirements, question_context)
        
        # 4. 종합적 답변 생성
        comprehensive_answer = self._generate_comprehensive_answer(question, requirements, perspectives)
        
        # 5. 실행 가능한 인사이트 생성
        actionable_insights = self._generate_actionable_insights(requirements, perspectives)
        
        # 6. 관련 질문 생성
        related_questions = self._generate_related_questions(question, requirements, question_context)
        
        # 7. 신뢰도 계산
        confidence_score = self._calculate_confidence(requirements, question_context)
        
        # 8. 추론 과정 설명
        reasoning_process = self._explain_reasoning_process(requirements, perspectives)
        
        # 9. 근거 및 출처
        sources_evidence = self._identify_sources_evidence(requirements, question_context)
        
        # 10. 다음 단계 제안
        next_steps = self._suggest_next_steps(requirements, actionable_insights)
        
        # 11. 리스크 평가
        risk_assessment = self._assess_risks(requirements, perspectives)
        
        return IntelligentResponse(
            direct_answer=comprehensive_answer['direct'],
            comprehensive_analysis=comprehensive_answer['comprehensive'],
            multiple_perspectives=perspectives,
            actionable_insights=actionable_insights,
            related_questions=related_questions,
            confidence_score=confidence_score,
            reasoning_process=reasoning_process,
            sources_and_evidence=sources_evidence,
            next_steps=next_steps,
            risk_assessment=risk_assessment
        )
    
    def _extract_requirements(self, question: str) -> List[QuestionRequirement]:
        """질문 요구사항 추출"""
        requirements = []
        
        for req_type, patterns in self.question_patterns.items():
            for pattern_info in patterns:
                matches = re.finditer(pattern_info['pattern'], question, re.IGNORECASE)
                for match in matches:
                    requirement = QuestionRequirement(
                        requirement_type=req_type,
                        content=match.group(),
                        priority=pattern_info['weight'],
                        context=pattern_info['context'],
                        confidence=0.8
                    )
                    requirements.append(requirement)
        
        # 우선순위별 정렬
        requirements.sort(key=lambda x: x.priority, reverse=True)
        
        # 중복 제거 및 통합
        unique_requirements = self._merge_requirements(requirements)
        
        return unique_requirements
    
    def _merge_requirements(self, requirements: List[QuestionRequirement]) -> List[QuestionRequirement]:
        """요구사항 통합"""
        merged = {}
        
        for req in requirements:
            key = f"{req.requirement_type}_{req.context}"
            if key in merged:
                # 기존 요구사항과 통합
                existing = merged[key]
                existing.priority = max(existing.priority, req.priority)
                existing.confidence = max(existing.confidence, req.confidence)
            else:
                merged[key] = req
        
        return list(merged.values())
    
    def _analyze_question_context(self, question: str, context: Dict[str, Any] = None) -> QuestionContext:
        """질문 컨텍스트 분석"""
        # 주요 토픽 추출
        main_topic = self._extract_main_topic(question)
        
        # 하위 토픽 추출
        subtopics = self._extract_subtopics(question)
        
        # 개체명 추출
        entities = self._extract_entities(question)
        
        # 관계성 분석
        relationships = self._analyze_relationships(question, entities)
        
        # 시간적 컨텍스트
        temporal_context = self._analyze_temporal_context(question)
        
        # 공간적 컨텍스트
        spatial_context = self._analyze_spatial_context(question)
        
        # 감정적 컨텍스트
        emotional_context = self._analyze_emotional_context(question)
        
        # 긴급도 분석
        urgency_level = self._analyze_urgency(question)
        
        # 복잡도 분석
        complexity_level = self._analyze_complexity(question)
        
        return QuestionContext(
            main_topic=main_topic,
            subtopics=subtopics,
            entities=entities,
            relationships=relationships,
            temporal_context=temporal_context,
            spatial_context=spatial_context,
            emotional_context=emotional_context,
            urgency_level=urgency_level,
            complexity_level=complexity_level
        )
    
    def _extract_main_topic(self, question: str) -> str:
        """주요 토픽 추출"""
        topics = {
            '투자': ['투자', '수익률', '경제성', '비용', '가치'],
            '정책': ['정책', '법규', '규정', '제도', '승인'],
            '주민': ['주민', '지역사회', '소통', '갈등', '참여'],
            '기술': ['기술', '공법', '설계', '시공', '품질'],
            '환경': ['환경', '생태', '녹지', '오염', '지속가능']
        }
        
        for topic, keywords in topics.items():
            if any(keyword in question for keyword in keywords):
                return topic
        
        return '일반'
    
    def _extract_subtopics(self, question: str) -> List[str]:
        """하위 토픽 추출"""
        subtopics = []
        
        # 투자 관련 하위 토픽
        if any(word in question for word in ['투자', '수익률', '경제성']):
            subtopics.extend(['투자 분석', '수익성 평가', '리스크 관리'])
        
        # 정책 관련 하위 토픽
        if any(word in question for word in ['정책', '법규', '규정']):
            subtopics.extend(['정책 검토', '법규 분석', '규제 영향'])
        
        # 주민 관련 하위 토픽
        if any(word in question for word in ['주민', '소통', '갈등']):
            subtopics.extend(['주민 의견', '소통 전략', '갈등 해결'])
        
        return list(set(subtopics))
    
    def _extract_entities(self, question: str) -> List[str]:
        """개체명 추출"""
        entities = []
        
        # 지명
        if '샘플 프로젝트' in question:
            entities.append('샘플 재개발지구')
        if '○○동' in question:
            entities.append('○○동')
        if '강남구' in question:
            entities.append('강남구')
        
        # 프로젝트 관련
        if '재개발' in question:
            entities.append('재개발 프로젝트')
        if '아파트' in question:
            entities.append('아파트')
        if '주택' in question:
            entities.append('주택')
        
        # 주체
        if '주민' in question:
            entities.append('주민')
        if '개발사' in question:
            entities.append('개발사')
        if '정부' in question:
            entities.append('정부')
        
        return entities
    
    def _analyze_relationships(self, question: str, entities: List[str]) -> List[Dict[str, Any]]:
        """관계성 분석"""
        relationships = []
        
        # 주민-개발사 관계
        if '주민' in entities and '개발사' in entities:
            relationships.append({
                'subject': '주민',
                'object': '개발사',
                'relationship': '협의 관계',
                'tension_level': 'high' if '갈등' in question else 'medium'
            })
        
        # 정부-프로젝트 관계
        if '정부' in entities and '재개발 프로젝트' in entities:
            relationships.append({
                'subject': '정부',
                'object': '재개발 프로젝트',
                'relationship': '규제 및 지원',
                'tension_level': 'medium'
            })
        
        return relationships
    
    def _analyze_temporal_context(self, question: str) -> str:
        """시간적 컨텍스트 분석"""
        if any(word in question for word in ['과거', '이전', '지금까지']):
            return 'past'
        elif any(word in question for word in ['현재', '지금', '현재까지']):
            return 'present'
        elif any(word in question for word in ['미래', '앞으로', '향후', '예상']):
            return 'future'
        else:
            return 'present'
    
    def _analyze_spatial_context(self, question: str) -> str:
        """공간적 컨텍스트 분석"""
        if '○○동' in question or '샘플 프로젝트' in question:
            return 'local'
        elif '강남구' in question:
            return 'district'
        elif '서울' in question:
            return 'city'
        else:
            return 'general'
    
    def _analyze_emotional_context(self, question: str) -> str:
        """감정적 컨텍스트 분석"""
        positive_words = ['기대', '희망', '긍정', '좋은', '유리한']
        negative_words = ['우려', '걱정', '부정', '나쁜', '불리한']
        urgent_words = ['급하다', '시급', '즉시', '당장']
        
        if any(word in question for word in urgent_words):
            return 'urgent'
        elif any(word in question for word in negative_words):
            return 'concerned'
        elif any(word in question for word in positive_words):
            return 'positive'
        else:
            return 'neutral'
    
    def _analyze_urgency(self, question: str) -> str:
        """긴급도 분석"""
        urgent_indicators = ['급하다', '시급', '즉시', '당장', '빨리', '서둘러']
        high_urgency = any(indicator in question for indicator in urgent_indicators)
        
        if high_urgency:
            return 'high'
        elif any(word in question for word in ['중요', '필요', '요구']):
            return 'medium'
        else:
            return 'low'
    
    def _analyze_complexity(self, question: str) -> str:
        """복잡도 분석"""
        complex_indicators = ['종합', '다각도', '여러', '복합', '통합']
        simple_indicators = ['간단', '기본', '단순']
        
        if any(indicator in question for indicator in complex_indicators):
            return 'complex'
        elif any(indicator in question for indicator in simple_indicators):
            return 'simple'
        else:
            return 'moderate'
    
    def _analyze_multiple_perspectives(self, question: str, requirements: List[QuestionRequirement], context: QuestionContext) -> List[Dict[str, str]]:
        """다중 관점 분석"""
        perspectives = []
        
        # 정책적 관점
        if any(req.requirement_type in ['analysis', 'information'] for req in requirements):
            perspectives.append({
                'perspective': '정책적 관점',
                'analysis': self._analyze_policy_perspective(question, context),
                'focus': '정책 일관성 및 규제 환경'
            })
        
        # 경제적 관점
        if any(req.requirement_type in ['analysis', 'prediction'] for req in requirements):
            perspectives.append({
                'perspective': '경제적 관점',
                'analysis': self._analyze_economic_perspective(question, context),
                'focus': '투자 수익성 및 경제적 효과'
            })
        
        # 사회적 관점
        if any(req.requirement_type in ['analysis', 'solution'] for req in requirements):
            perspectives.append({
                'perspective': '사회적 관점',
                'analysis': self._analyze_social_perspective(question, context),
                'focus': '주민 복지 및 지역사회 발전'
            })
        
        # 기술적 관점
        if any(req.requirement_type in ['analysis', 'solution'] for req in requirements):
            perspectives.append({
                'perspective': '기술적 관점',
                'analysis': self._analyze_technical_perspective(question, context),
                'focus': '기술적 타당성 및 품질'
            })
        
        # 환경적 관점
        if any(req.requirement_type in ['analysis', 'solution'] for req in requirements):
            perspectives.append({
                'perspective': '환경적 관점',
                'analysis': self._analyze_environmental_perspective(question, context),
                'focus': '환경 영향 및 지속가능성'
            })
        
        return perspectives
    
    def _analyze_policy_perspective(self, question: str, context: QuestionContext) -> str:
        """정책적 관점 분석"""
        analysis = "샘플 재개발 프로젝트의 정책적 관점에서 분석하면, "
        
        if '정책' in question or '법규' in question:
            analysis += "현재 추진 중인 정책들이 일관성을 가지고 있는지 검토가 필요합니다. "
            analysis += "도시 및 주거환경정비법, 건축법, 환경영향평가법 등 관련 법규의 준수 여부를 확인해야 합니다. "
        else:
            analysis += "정책적 안정성과 일관성이 프로젝트 성공의 핵심 요소입니다. "
            analysis += "정부 정책 변화에 따른 리스크를 고려한 대응 방안이 필요합니다."
        
        return analysis
    
    def _analyze_economic_perspective(self, question: str, context: QuestionContext) -> str:
        """경제적 관점 분석"""
        analysis = "경제적 관점에서 샘플 재개발 프로젝트를 분석하면, "
        
        if '투자' in question or '수익률' in question:
            analysis += "투자 수익률과 경제성을 종합적으로 평가해야 합니다. "
            analysis += "개발 비용, 시장 가격 변동, 금리 변화 등을 고려한 민감도 분석이 필요합니다. "
        else:
            analysis += "지역 경제 활성화와 부동산 시장에 미치는 영향을 고려해야 합니다. "
            analysis += "투자자와 주민 모두에게 경제적 이익이 균형있게 분배되는 방안을 모색해야 합니다."
        
        return analysis
    
    def _analyze_social_perspective(self, question: str, context: QuestionContext) -> str:
        """사회적 관점 분석"""
        analysis = "사회적 관점에서 샘플 재개발 프로젝트를 분석하면, "
        
        if '주민' in question or '갈등' in question:
            analysis += "주민들의 의견을 충분히 반영하고 갈등을 최소화하는 것이 중요합니다. "
            analysis += "투명한 소통과 공정한 보상 체계를 통해 주민 신뢰를 확보해야 합니다. "
        else:
            analysis += "지역사회 발전과 주민 복지 향상에 기여하는 방향으로 추진되어야 합니다. "
            analysis += "기존 주민들의 생활권 보호와 새로운 주민들의 정착을 모두 고려해야 합니다."
        
        return analysis
    
    def _analyze_technical_perspective(self, question: str, context: QuestionContext) -> str:
        """기술적 관점 분석"""
        analysis = "기술적 관점에서 샘플 재개발 프로젝트를 분석하면, "
        
        if '기술' in question or '설계' in question:
            analysis += "최신 건축 기술과 친환경 설계를 적용하여 품질을 향상시켜야 합니다. "
            analysis += "내진 설계, 에너지 효율성, 접근성 등을 종합적으로 고려해야 합니다. "
        else:
            analysis += "안전하고 지속가능한 건축물을 건설하는 것이 핵심입니다. "
            analysis += "기술적 타당성과 경제성을 모두 만족하는 최적 설계가 필요합니다."
        
        return analysis
    
    def _analyze_environmental_perspective(self, question: str, context: QuestionContext) -> str:
        """환경적 관점 분석"""
        analysis = "환경적 관점에서 샘플 재개발 프로젝트를 분석하면, "
        
        if '환경' in question or '녹지' in question:
            analysis += "환경 영향을 최소화하고 녹지 공간을 확보하는 것이 중요합니다. "
            analysis += "친환경 건축물 인증과 탄소 중립 목표를 달성해야 합니다. "
        else:
            analysis += "지속가능한 개발 원칙에 따라 환경 친화적으로 추진되어야 합니다. "
            analysis += "기존 생태계 보호와 새로운 환경 조성을 균형있게 고려해야 합니다."
        
        return analysis
    
    def _generate_comprehensive_answer(self, question: str, requirements: List[QuestionRequirement], perspectives: List[Dict[str, str]]) -> Dict[str, str]:
        """종합적 답변 생성"""
        # 직접 답변
        direct_answer = self._generate_direct_answer(question, requirements)
        
        # 종합 분석
        comprehensive_analysis = self._generate_comprehensive_analysis(question, requirements, perspectives)
        
        return {
            'direct': direct_answer,
            'comprehensive': comprehensive_analysis
        }
    
    def _generate_direct_answer(self, question: str, requirements: List[QuestionRequirement]) -> str:
        """직접 답변 생성"""
        if not requirements:
            return "질문을 더 구체적으로 해주시면 정확한 답변을 드릴 수 있습니다."
        
        primary_requirement = requirements[0]
        
        if primary_requirement.requirement_type == 'analysis':
            return "샘플 재개발 프로젝트를 종합적으로 분석한 결과, 정책적 안정성, 경제적 수익성, 사회적 수용성을 모두 고려한 균형잡힌 접근이 필요합니다."
        elif primary_requirement.requirement_type == 'comparison':
            return "비교 분석 결과, 각 방안의 장단점이 명확히 구분되며, 상황과 목적에 따라 최적의 선택이 달라질 수 있습니다."
        elif primary_requirement.requirement_type == 'prediction':
            return "현재 동향과 변수를 종합 분석한 결과, 신중한 전망과 함께 불확실성 요소를 고려한 대응 방안이 필요합니다."
        elif primary_requirement.requirement_type == 'solution':
            return "문제 해결을 위한 구체적인 방안을 제시하며, 단계별 실행 계획과 함께 예상 효과를 분석했습니다."
        else:
            return "요청하신 정보를 종합적으로 정리하여 제공하며, 추가적인 질문이 있으시면 언제든 말씀해 주세요."
    
    def _generate_comprehensive_analysis(self, question: str, requirements: List[QuestionRequirement], perspectives: List[Dict[str, str]]) -> str:
        """종합 분석 생성"""
        analysis = "## 종합 분석\n\n"
        
        # 현재 상황 분석
        analysis += "### 1. 현재 상황 분석\n"
        analysis += "샘플 재개발 프로젝트는 서울 강남구 ○○동 지역의 대규모 재개발 사업으로, "
        analysis += "주민, 개발사, 정부 등 다양한 이해관계자가 참여하는 복합적인 프로젝트입니다.\n\n"
        
        # 핵심 이슈 파악
        analysis += "### 2. 핵심 이슈 파악\n"
        for req in requirements[:3]:  # 상위 3개 요구사항
            if req.requirement_type == 'analysis':
                analysis += "- 종합적 분석 및 평가 필요\n"
            elif req.requirement_type == 'comparison':
                analysis += "- 비교 분석 및 대안 검토 필요\n"
            elif req.requirement_type == 'prediction':
                analysis += "- 미래 전망 및 예측 필요\n"
            elif req.requirement_type == 'solution':
                analysis += "- 문제 해결 방안 필요\n"
        analysis += "\n"
        
        # 다각도 검토
        analysis += "### 3. 다각도 검토\n"
        for perspective in perspectives:
            analysis += f"- **{perspective['perspective']}**: {perspective['analysis']}\n"
        analysis += "\n"
        
        # 전망 및 제언
        analysis += "### 4. 전망 및 제언\n"
        analysis += "성공적인 프로젝트 추진을 위해서는 모든 이해관계자의 참여와 소통이 중요합니다. "
        analysis += "정책적 안정성, 경제적 수익성, 사회적 수용성을 모두 고려한 균형잡힌 접근이 필요하며, "
        analysis += "지속가능한 개발 원칙에 따라 환경 친화적으로 추진되어야 합니다."
        
        return analysis
    
    def _generate_actionable_insights(self, requirements: List[QuestionRequirement], perspectives: List[Dict[str, str]]) -> List[str]:
        """실행 가능한 인사이트 생성"""
        insights = []
        
        for req in requirements:
            if req.requirement_type == 'analysis':
                insights.append("정기적인 종합 분석 보고서 작성하여 프로젝트 진행 상황을 모니터링하세요.")
                insights.append("주요 이해관계자와의 정기 회의를 통해 의견을 수렴하고 소통을 강화하세요.")
            
            elif req.requirement_type == 'comparison':
                insights.append("비교 분석 결과를 바탕으로 최적의 방안을 선택하고 실행 계획을 수립하세요.")
                insights.append("각 대안의 장단점을 명확히 파악하여 리스크를 최소화하세요.")
            
            elif req.requirement_type == 'prediction':
                insights.append("다양한 시나리오를 고려한 대응 방안을 준비하여 불확실성에 대비하세요.")
                insights.append("정기적인 시장 동향 분석을 통해 예측 모델을 업데이트하세요.")
            
            elif req.requirement_type == 'solution':
                insights.append("문제 해결을 위한 구체적인 실행 계획을 수립하고 단계별로 추진하세요.")
                insights.append("해결 방안의 효과를 정기적으로 평가하고 필요시 조정하세요.")
        
        return list(set(insights))  # 중복 제거
    
    def _generate_related_questions(self, question: str, requirements: List[QuestionRequirement], context: QuestionContext) -> List[str]:
        """관련 질문 생성"""
        related_questions = []
        
        for req in requirements:
            if req.requirement_type == 'analysis':
                related_questions.extend([
                    "이 분석 결과의 구체적인 시사점은 무엇인가요?",
                    "분석을 바탕으로 한 실행 방안은 무엇인가요?",
                    "다른 지역의 유사 사례와 비교하면 어떤가요?"
                ])
            
            elif req.requirement_type == 'comparison':
                related_questions.extend([
                    "각 방안의 구체적인 장단점은 무엇인가요?",
                    "어떤 상황에서 어떤 방안이 최적인가요?",
                    "비교 분석의 기준은 무엇인가요?"
                ])
            
            elif req.requirement_type == 'prediction':
                related_questions.extend([
                    "예측의 신뢰도는 어느 정도인가요?",
                    "불확실성 요소는 무엇인가요?",
                    "예측 결과에 따른 대응 방안은 무엇인가요?"
                ])
            
            elif req.requirement_type == 'solution':
                related_questions.extend([
                    "해결 방안의 실행 가능성은 어느 정도인가요?",
                    "예상되는 장애 요소는 무엇인가요?",
                    "해결 방안의 예상 효과는 무엇인가요?"
                ])
        
        return list(set(related_questions))  # 중복 제거
    
    def _calculate_confidence(self, requirements: List[QuestionRequirement], context: QuestionContext) -> float:
        """신뢰도 계산"""
        base_confidence = 0.7
        
        # 요구사항 명확성에 따른 조정
        if requirements:
            avg_priority = sum(req.priority for req in requirements) / len(requirements)
            base_confidence += avg_priority * 0.2
        
        # 컨텍스트 풍부성에 따른 조정
        if context.entities:
            base_confidence += 0.05
        if context.subtopics:
            base_confidence += 0.05
        
        # 복잡도에 따른 조정
        if context.complexity_level == 'complex':
            base_confidence -= 0.1
        elif context.complexity_level == 'simple':
            base_confidence += 0.1
        
        return min(base_confidence, 1.0)
    
    def _explain_reasoning_process(self, requirements: List[QuestionRequirement], perspectives: List[Dict[str, str]]) -> str:
        """추론 과정 설명"""
        reasoning = "## 추론 과정\n\n"
        
        reasoning += "### 1. 질문 분석\n"
        reasoning += f"- 총 {len(requirements)}개의 요구사항을 식별했습니다.\n"
        for i, req in enumerate(requirements, 1):
            reasoning += f"- 요구사항 {i}: {req.requirement_type} ({req.content})\n"
        reasoning += "\n"
        
        reasoning += "### 2. 다중 관점 분석\n"
        reasoning += f"- {len(perspectives)}개의 관점에서 종합적으로 분석했습니다.\n"
        for perspective in perspectives:
            reasoning += f"- {perspective['perspective']}: {perspective['focus']}\n"
        reasoning += "\n"
        
        reasoning += "### 3. 종합 평가\n"
        reasoning += "- 각 관점의 분석 결과를 종합하여 균형잡힌 답변을 생성했습니다.\n"
        reasoning += "- 실행 가능성과 실용성을 고려하여 구체적인 제언을 제시했습니다."
        
        return reasoning
    
    def _identify_sources_evidence(self, requirements: List[QuestionRequirement], context: QuestionContext) -> List[str]:
        """근거 및 출처 식별"""
        sources = []
        
        # 기본 출처
        sources.append("도시 및 주거환경정비법")
        sources.append("건축법")
        sources.append("환경영향평가법")
        
        # 컨텍스트별 추가 출처
        if '투자' in context.main_topic:
            sources.append("부동산 시장 분석 보고서")
            sources.append("투자 수익률 분석 자료")
        
        if '정책' in context.main_topic:
            sources.append("정부 정책 문서")
            sources.append("지자체 추진 계획")
        
        if '주민' in context.main_topic:
            sources.append("주민 의견 조사 결과")
            sources.append("지역사회 갈등 분석 자료")
        
        return sources
    
    def _suggest_next_steps(self, requirements: List[QuestionRequirement], actionable_insights: List[str]) -> List[str]:
        """다음 단계 제안"""
        next_steps = []
        
        for req in requirements:
            if req.requirement_type == 'analysis':
                next_steps.extend([
                    "정기적인 분석 보고서 작성 및 공유",
                    "주요 이해관계자와의 정기 회의 개최",
                    "분석 결과를 바탕으로 한 의사결정 지원"
                ])
            
            elif req.requirement_type == 'comparison':
                next_steps.extend([
                    "비교 분석 결과를 바탕으로 한 최적 방안 선택",
                    "선택된 방안의 상세 실행 계획 수립",
                    "대안 방안의 백업 계획 준비"
                ])
            
            elif req.requirement_type == 'prediction':
                next_steps.extend([
                    "예측 모델의 정기적 업데이트",
                    "다양한 시나리오별 대응 방안 수립",
                    "예측 결과의 모니터링 및 피드백 시스템 구축"
                ])
            
            elif req.requirement_type == 'solution':
                next_steps.extend([
                    "해결 방안의 단계별 실행 계획 수립",
                    "실행 과정의 정기적 모니터링",
                    "효과 평가 및 필요시 방안 조정"
                ])
        
        return list(set(next_steps))  # 중복 제거
    
    def _assess_risks(self, requirements: List[QuestionRequirement], perspectives: List[Dict[str, str]]) -> Dict[str, Any]:
        """리스크 평가"""
        risks = {
            'high_risks': [],
            'medium_risks': [],
            'low_risks': [],
            'mitigation_strategies': []
        }
        
        # 요구사항별 리스크 평가
        for req in requirements:
            if req.requirement_type == 'prediction':
                risks['high_risks'].append("예측 모델의 정확성 부족")
                risks['mitigation_strategies'].append("다양한 시나리오 분석 및 정기적 모델 업데이트")
            
            elif req.requirement_type == 'solution':
                risks['medium_risks'].append("해결 방안의 실행 가능성 불확실")
                risks['mitigation_strategies'].append("단계별 실행 계획 수립 및 정기적 검토")
            
            elif req.requirement_type == 'comparison':
                risks['low_risks'].append("비교 기준의 주관성")
                risks['mitigation_strategies'].append("객관적 지표 활용 및 전문가 검토")
        
        return risks

# 사용 예시
if __name__ == "__main__":
    analyzer = IntelligentQuestionAnalyzer()
    
    test_question = "샘플 재개발 프로젝트의 투자 가치를 분석해주세요. 주민들의 반응도 함께 고려해서 종합적으로 평가해주시면 감사하겠습니다."
    
    result = analyzer.analyze_question_intelligently(test_question)
    
    print("지능형 질문 분석 완료!")
    print(f"직접 답변: {result.direct_answer}")
    print(f"신뢰도: {result.confidence_score}")
    print(f"관점 수: {len(result.multiple_perspectives)}")
