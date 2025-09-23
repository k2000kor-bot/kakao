#!/usr/bin/env python3
"""
지능형 응답 생성 및 구조화 시스템
Intelligent Response Generator and Structuring System

Features:
- 문맥 기반 응답 생성
- 개인화된 응답 스타일
- 다층적 응답 구조화
- 동적 콘텐츠 생성
- 응답 품질 최적화
- 실시간 적응형 조정
"""

import json
import time
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
import re
import random
from collections import defaultdict

logger = logging.getLogger(__name__)

class ResponseStyle(Enum):
    """응답 스타일"""
    FORMAL = "formal"
    FRIENDLY = "friendly"
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    ACADEMIC = "academic"
    CONVERSATIONAL = "conversational"

class ResponseLength(Enum):
    """응답 길이"""
    CONCISE = "concise"      # 간결 (1-2 문단)
    MEDIUM = "medium"        # 중간 (3-4 문단)
    DETAILED = "detailed"    # 상세 (5+ 문단)
    COMPREHENSIVE = "comprehensive"  # 포괄적 (매우 상세)

class ResponseStructure(Enum):
    """응답 구조"""
    LINEAR = "linear"        # 선형적
    HIERARCHICAL = "hierarchical"  # 계층적
    COMPARATIVE = "comparative"    # 비교적
    PROBLEM_SOLUTION = "problem_solution"  # 문제-해결
    STEP_BY_STEP = "step_by_step"  # 단계별
    NARRATIVE = "narrative"  # 서술적

@dataclass
class ResponseTemplate:
    """응답 템플릿"""
    id: str
    name: str
    structure: ResponseStructure
    style: ResponseStyle
    length: ResponseLength
    template: str
    variables: List[str]
    conditions: Dict[str, Any]
    usage_count: int
    success_rate: float

@dataclass
class ResponseComponent:
    """응답 컴포넌트"""
    type: str
    content: str
    priority: int
    metadata: Dict[str, Any]
    dependencies: List[str]

@dataclass
class GeneratedResponse:
    """생성된 응답"""
    content: str
    structure: ResponseStructure
    style: ResponseStyle
    length: ResponseLength
    components: List[ResponseComponent]
    metadata: Dict[str, Any]
    quality_score: float
    personalization_level: float
    context_relevance: float

class IntelligentResponseGenerator:
    """지능형 응답 생성기"""
    
    def __init__(self):
        self.response_templates = {}
        self.style_patterns = {}
        self.structure_patterns = {}
        self.quality_metrics = {}
        self.adaptation_history = {}
        
        # 템플릿 초기화
        self._initialize_templates()
        
        # 패턴 초기화
        self._initialize_patterns()
        
        print("✅ 지능형 응답 생성기 초기화 완료")
    
    def _initialize_templates(self):
        """응답 템플릿 초기화"""
        templates = [
            {
                'id': 'formal_explanation',
                'name': '정식 설명',
                'structure': ResponseStructure.LINEAR,
                'style': ResponseStyle.FORMAL,
                'length': ResponseLength.DETAILED,
                'template': """
## {topic}

### 개요
{topic}에 대해 설명드리겠습니다.

### 주요 내용
{main_content}

### 상세 설명
{detailed_content}

### 결론
{conclusion}

### 추가 정보
{additional_info}
                """,
                'variables': ['topic', 'main_content', 'detailed_content', 'conclusion', 'additional_info'],
                'conditions': {'intent': 'question', 'complexity': 'high'},
                'usage_count': 0,
                'success_rate': 0.0
            },
            {
                'id': 'friendly_guide',
                'name': '친근한 가이드',
                'structure': ResponseStructure.STEP_BY_STEP,
                'style': ResponseStyle.FRIENDLY,
                'length': ResponseLength.MEDIUM,
                'template': """
안녕하세요! 😊

{topic}에 대해 궁금하시군요! 차근차근 설명해드릴게요.

## 🚀 단계별 가이드

### 1단계: {step1}
{step1_content}

### 2단계: {step2}
{step2_content}

### 3단계: {step3}
{step3_content}

## 💡 팁
{tips}

더 궁금한 점이 있으시면 언제든지 물어보세요! 😄
                """,
                'variables': ['topic', 'step1', 'step1_content', 'step2', 'step2_content', 'step3', 'step3_content', 'tips'],
                'conditions': {'intent': 'request', 'emotion': 'positive'},
                'usage_count': 0,
                'success_rate': 0.0
            },
            {
                'id': 'professional_analysis',
                'name': '전문적 분석',
                'structure': ResponseStructure.HIERARCHICAL,
                'style': ResponseStyle.PROFESSIONAL,
                'length': ResponseLength.COMPREHENSIVE,
                'template': """
# {topic} 분석 보고서

## 실행 요약
{executive_summary}

## 배경 및 목적
{background}

## 분석 방법론
{methodology}

## 주요 발견사항
{findings}

### 1. {finding1_title}
{finding1_content}

### 2. {finding2_title}
{finding2_content}

### 3. {finding3_title}
{finding3_content}

## 결론 및 권장사항
{conclusions}

## 부록
{appendix}
                """,
                'variables': ['topic', 'executive_summary', 'background', 'methodology', 'findings', 
                             'finding1_title', 'finding1_content', 'finding2_title', 'finding2_content',
                             'finding3_title', 'finding3_content', 'conclusions', 'appendix'],
                'conditions': {'intent': 'analysis', 'complexity': 'very_high'},
                'usage_count': 0,
                'success_rate': 0.0
            },
            {
                'id': 'casual_conversation',
                'name': '캐주얼 대화',
                'structure': ResponseStructure.NARRATIVE,
                'style': ResponseStyle.CASUAL,
                'length': ResponseLength.CONCISE,
                'template': """
{topic}에 대해 말씀하시는군요! 

{main_response}

{additional_thoughts}

혹시 {related_question}도 궁금하시나요?
                """,
                'variables': ['topic', 'main_response', 'additional_thoughts', 'related_question'],
                'conditions': {'intent': 'conversation', 'emotion': 'neutral'},
                'usage_count': 0,
                'success_rate': 0.0
            }
        ]
        
        for template_data in templates:
            template = ResponseTemplate(**template_data)
            self.response_templates[template.id] = template
    
    def _initialize_patterns(self):
        """패턴 초기화"""
        # 스타일 패턴
        self.style_patterns = {
            ResponseStyle.FORMAL: {
                'greetings': ['안녕하세요', '반갑습니다'],
                'transitions': ['따라서', '그러므로', '결론적으로'],
                'conclusions': ['감사합니다', '도움이 되었기를 바랍니다'],
                'tone': 'professional'
            },
            ResponseStyle.FRIENDLY: {
                'greetings': ['안녕하세요! 😊', '반가워요!'],
                'transitions': ['그리고', '또한', '그런데'],
                'conclusions': ['더 궁금한 게 있으면 언제든 물어보세요!', '도움이 되었나요?'],
                'tone': 'warm'
            },
            ResponseStyle.PROFESSIONAL: {
                'greetings': ['안녕하세요', '반갑습니다'],
                'transitions': ['또한', '더불어', '추가로'],
                'conclusions': ['추가 문의사항이 있으시면 연락주세요', '감사합니다'],
                'tone': 'authoritative'
            },
            ResponseStyle.CASUAL: {
                'greetings': ['안녕!', '어때?'],
                'transitions': ['그리고', '그런데', '아니면'],
                'conclusions': ['궁금한 거 더 있으면 말해!', '어때?'],
                'tone': 'relaxed'
            }
        }
        
        # 구조 패턴
        self.structure_patterns = {
            ResponseStructure.LINEAR: {
                'flow': ['introduction', 'main_content', 'conclusion'],
                'connectors': ['먼저', '다음으로', '마지막으로']
            },
            ResponseStructure.HIERARCHICAL: {
                'flow': ['overview', 'main_points', 'sub_points', 'summary'],
                'connectors': ['주요하게는', '세부적으로는', '요약하면']
            },
            ResponseStructure.STEP_BY_STEP: {
                'flow': ['step1', 'step2', 'step3', 'tips'],
                'connectors': ['첫 번째로', '두 번째로', '세 번째로', '마지막으로']
            },
            ResponseStructure.COMPARATIVE: {
                'flow': ['option1', 'option2', 'comparison', 'recommendation'],
                'connectors': ['한편', '반면에', '비교해보면', '결론적으로']
            }
        }
    
    def generate_response(
        self,
        user_message: str,
        context: Dict[str, Any],
        user_profile: Dict[str, Any],
        knowledge_base: List[Dict[str, Any]] = None
    ) -> GeneratedResponse:
        """지능형 응답 생성"""
        try:
            # 1. 응답 전략 결정
            strategy = self._determine_response_strategy(user_message, context, user_profile)
            
            # 2. 템플릿 선택
            template = self._select_template(strategy)
            
            # 3. 콘텐츠 생성
            content_components = self._generate_content_components(
                user_message, context, user_profile, knowledge_base, strategy
            )
            
            # 4. 응답 구조화
            structured_response = self._structure_response(template, content_components, strategy)
            
            # 5. 개인화 적용
            personalized_response = self._apply_personalization(structured_response, user_profile)
            
            # 6. 품질 최적화
            optimized_response = self._optimize_response_quality(personalized_response, strategy)
            
            # 7. 메타데이터 생성
            metadata = self._generate_metadata(strategy, template, content_components)
            
            # 8. 품질 점수 계산
            quality_score = self._calculate_quality_score(optimized_response, strategy)
            
            return GeneratedResponse(
                content=optimized_response['content'],
                structure=optimized_response['structure'],
                style=optimized_response['style'],
                length=optimized_response['length'],
                components=optimized_response['components'],
                metadata=metadata,
                quality_score=quality_score,
                personalization_level=optimized_response['personalization_level'],
                context_relevance=optimized_response['context_relevance']
            )
            
        except Exception as e:
            logger.error(f"응답 생성 실패: {e}")
            return self._generate_fallback_response(user_message)
    
    def _determine_response_strategy(
        self, 
        user_message: str, 
        context: Dict[str, Any], 
        user_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """응답 전략 결정"""
        strategy = {
            'intent': context.get('intent', 'unknown'),
            'emotion': context.get('emotion', 'neutral'),
            'complexity': self._assess_complexity(user_message),
            'user_expertise': user_profile.get('expertise_level', 'beginner'),
            'preferred_style': user_profile.get('communication_style', 'formal'),
            'context_strength': context.get('context_strength', 0.0),
            'topic': context.get('current_topic', 'general')
        }
        
        # 전략 조정
        if strategy['emotion'] == 'frustrated':
            strategy['preferred_style'] = 'friendly'
            strategy['length'] = 'concise'
        elif strategy['complexity'] == 'very_high':
            strategy['length'] = 'detailed'
            strategy['structure'] = 'hierarchical'
        elif strategy['user_expertise'] == 'advanced':
            strategy['style'] = 'professional'
            strategy['length'] = 'comprehensive'
        
        return strategy
    
    def _assess_complexity(self, message: str) -> str:
        """복잡도 평가"""
        word_count = len(message.split())
        
        if word_count <= 20:
            return 'simple'
        elif word_count <= 50:
            return 'medium'
        elif word_count <= 100:
            return 'high'
        else:
            return 'very_high'
    
    def _select_template(self, strategy: Dict[str, Any]) -> ResponseTemplate:
        """템플릿 선택"""
        # 전략에 맞는 템플릿 필터링
        suitable_templates = []
        
        for template in self.response_templates.values():
            if self._template_matches_strategy(template, strategy):
                suitable_templates.append(template)
        
        if not suitable_templates:
            # 기본 템플릿 사용
            return self.response_templates['formal_explanation']
        
        # 성공률과 사용 횟수를 고려한 선택
        best_template = max(suitable_templates, key=lambda t: t.success_rate * 0.7 + (1 - t.usage_count / 1000) * 0.3)
        
        # 사용 횟수 증가
        best_template.usage_count += 1
        
        return best_template
    
    def _template_matches_strategy(self, template: ResponseTemplate, strategy: Dict[str, Any]) -> bool:
        """템플릿이 전략과 일치하는지 확인"""
        conditions = template.conditions
        
        # 의도 매칭
        if 'intent' in conditions and conditions['intent'] != strategy['intent']:
            return False
        
        # 복잡도 매칭
        if 'complexity' in conditions and conditions['complexity'] != strategy['complexity']:
            return False
        
        return True
    
    def _generate_content_components(
        self,
        user_message: str,
        context: Dict[str, Any],
        user_profile: Dict[str, Any],
        knowledge_base: List[Dict[str, Any]],
        strategy: Dict[str, Any]
    ) -> List[ResponseComponent]:
        """콘텐츠 컴포넌트 생성"""
        components = []
        
        # 1. 주제 컴포넌트
        topic_component = ResponseComponent(
            type='topic',
            content=self._extract_topic(user_message),
            priority=1,
            metadata={'source': 'user_message'},
            dependencies=[]
        )
        components.append(topic_component)
        
        # 2. 주요 내용 컴포넌트
        main_content = self._generate_main_content(user_message, knowledge_base, strategy)
        main_component = ResponseComponent(
            type='main_content',
            content=main_content,
            priority=2,
            metadata={'source': 'knowledge_base', 'strategy': strategy},
            dependencies=['topic']
        )
        components.append(main_component)
        
        # 3. 상세 설명 컴포넌트
        if strategy['complexity'] in ['high', 'very_high']:
            detailed_content = self._generate_detailed_content(main_content, knowledge_base)
            detailed_component = ResponseComponent(
                type='detailed_content',
                content=detailed_content,
                priority=3,
                metadata={'source': 'knowledge_base', 'complexity': strategy['complexity']},
                dependencies=['main_content']
            )
            components.append(detailed_component)
        
        # 4. 예시 컴포넌트
        if strategy['user_expertise'] in ['beginner', 'intermediate']:
            examples = self._generate_examples(main_content, strategy)
            example_component = ResponseComponent(
                type='examples',
                content=examples,
                priority=4,
                metadata={'target_level': strategy['user_expertise']},
                dependencies=['main_content']
            )
            components.append(example_component)
        
        # 5. 팁 컴포넌트
        tips = self._generate_tips(main_content, strategy)
        tips_component = ResponseComponent(
            type='tips',
            content=tips,
            priority=5,
            metadata={'strategy': strategy},
            dependencies=['main_content']
        )
        components.append(tips_component)
        
        return components
    
    def _extract_topic(self, message: str) -> str:
        """주제 추출"""
        # 간단한 주제 추출 로직
        words = message.split()
        
        # 질문어 제거
        question_words = ['무엇', '어떻게', '왜', '언제', '어디', '누가', '어떤']
        filtered_words = [word for word in words if word not in question_words]
        
        # 가장 중요한 단어 선택
        if filtered_words:
            return filtered_words[0]
        
        return '일반'
    
    def _generate_main_content(
        self, 
        user_message: str, 
        knowledge_base: List[Dict[str, Any]], 
        strategy: Dict[str, Any]
    ) -> str:
        """주요 내용 생성"""
        # 지식 베이스에서 관련 정보 검색
        relevant_knowledge = self._search_relevant_knowledge(user_message, knowledge_base)
        
        if relevant_knowledge:
            # 지식 베이스 기반 내용 생성
            return self._synthesize_knowledge_content(relevant_knowledge, strategy)
        else:
            # 일반적인 내용 생성
            return self._generate_generic_content(user_message, strategy)
    
    def _search_relevant_knowledge(
        self, 
        message: str, 
        knowledge_base: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """관련 지식 검색"""
        if not knowledge_base:
            return []
        
        relevant = []
        message_words = set(message.lower().split())
        
        for knowledge in knowledge_base:
            knowledge_text = knowledge.get('content', '').lower()
            knowledge_words = set(knowledge_text.split())
            
            # 단어 겹침 계산
            overlap = len(message_words.intersection(knowledge_words))
            if overlap > 0:
                relevance_score = overlap / len(message_words)
                knowledge['relevance_score'] = relevance_score
                relevant.append(knowledge)
        
        # 관련도 순으로 정렬
        relevant.sort(key=lambda x: x['relevance_score'], reverse=True)
        return relevant[:3]  # 상위 3개
    
    def _synthesize_knowledge_content(
        self, 
        knowledge_list: List[Dict[str, Any]], 
        strategy: Dict[str, Any]
    ) -> str:
        """지식 통합 내용 생성"""
        if not knowledge_list:
            return "관련 정보를 찾을 수 없습니다."
        
        # 가장 관련성 높은 지식 사용
        main_knowledge = knowledge_list[0]
        content = main_knowledge.get('content', '')
        
        # 추가 지식 통합
        if len(knowledge_list) > 1:
            additional_info = []
            for knowledge in knowledge_list[1:]:
                additional_info.append(knowledge.get('content', ''))
            
            if additional_info:
                content += f"\n\n추가로, {additional_info[0]}"
        
        return content
    
    def _generate_generic_content(self, message: str, strategy: Dict[str, Any]) -> str:
        """일반적인 내용 생성"""
        topic = self._extract_topic(message)
        
        # 주제별 기본 내용
        generic_responses = {
            '프로그래밍': f"{topic}에 대해 설명드리겠습니다. 프로그래밍은 컴퓨터에게 수행할 작업을 지시하는 과정입니다.",
            '비즈니스': f"{topic}에 대해 말씀드리겠습니다. 비즈니스는 조직의 목표를 달성하기 위한 활동입니다.",
            '교육': f"{topic}에 대해 알려드리겠습니다. 교육은 지식과 기술을 전달하는 중요한 과정입니다.",
            '기술': f"{topic}에 대해 설명드리겠습니다. 기술은 문제를 해결하고 삶을 개선하는 도구입니다."
        }
        
        return generic_responses.get(topic, f"{topic}에 대해 설명드리겠습니다.")
    
    def _generate_detailed_content(self, main_content: str, knowledge_base: List[Dict[str, Any]]) -> str:
        """상세 내용 생성"""
        # 주요 내용을 기반으로 상세 설명 생성
        detailed_parts = []
        
        # 주요 내용 분석
        if '프로그래밍' in main_content:
            detailed_parts.append("프로그래밍의 핵심 요소로는 알고리즘, 자료구조, 디자인 패턴 등이 있습니다.")
            detailed_parts.append("효과적인 프로그래밍을 위해서는 문제 분석, 설계, 구현, 테스트의 단계를 거쳐야 합니다.")
        
        if '비즈니스' in main_content:
            detailed_parts.append("비즈니스 성공을 위해서는 시장 분석, 고객 이해, 경쟁력 강화가 중요합니다.")
            detailed_parts.append("지속적인 혁신과 고객 만족을 통한 성장이 핵심입니다.")
        
        return " ".join(detailed_parts)
    
    def _generate_examples(self, main_content: str, strategy: Dict[str, Any]) -> str:
        """예시 생성"""
        examples = []
        
        if '프로그래밍' in main_content:
            examples.append("예를 들어, 간단한 계산기 프로그램을 만든다면 사용자 입력을 받고, 계산을 수행한 후 결과를 출력하는 과정을 거칩니다.")
        
        if '비즈니스' in main_content:
            examples.append("예를 들어, 새로운 제품을 출시할 때는 시장 조사, 제품 개발, 마케팅 전략 수립의 과정을 거칩니다.")
        
        return " ".join(examples)
    
    def _generate_tips(self, main_content: str, strategy: Dict[str, Any]) -> str:
        """팁 생성"""
        tips = []
        
        if strategy['user_expertise'] == 'beginner':
            tips.append("초보자라면 기본부터 차근차근 학습하는 것이 중요합니다.")
            tips.append("실습을 통해 이론을 적용해보세요.")
        
        if strategy['complexity'] in ['high', 'very_high']:
            tips.append("복잡한 내용은 단계별로 나누어 학습하세요.")
            tips.append("필요시 전문가의 도움을 받는 것도 좋습니다.")
        
        return " ".join(tips)
    
    def _structure_response(
        self, 
        template: ResponseTemplate, 
        components: List[ResponseComponent], 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """응답 구조화"""
        # 컴포넌트를 우선순위 순으로 정렬
        sorted_components = sorted(components, key=lambda x: x.priority)
        
        # 템플릿 변수 매핑
        template_vars = {}
        for component in sorted_components:
            if component.type == 'topic':
                template_vars['topic'] = component.content
            elif component.type == 'main_content':
                template_vars['main_content'] = component.content
            elif component.type == 'detailed_content':
                template_vars['detailed_content'] = component.content
            elif component.type == 'examples':
                template_vars['tips'] = component.content
        
            # 템플릿 적용
            try:
                # 누락된 변수에 대한 기본값 설정
                missing_vars = {
                    'topic': self._extract_topic(message),
                    'main_content': main_content,
                    'detailed_content': detailed_content if 'detailed_content' in template_vars else '추가적인 상세 정보입니다.',
                    'conclusion': '도움이 되었기를 바랍니다.',
                    'additional_info': '추가 문의사항이 있으시면 언제든지 말씀해주세요.',
                    'step1': '1단계',
                    'step1_content': '첫 번째 단계 내용',
                    'step2': '2단계', 
                    'step2_content': '두 번째 단계 내용',
                    'step3': '3단계',
                    'step3_content': '세 번째 단계 내용',
                    'tips': '유용한 팁들',
                    'executive_summary': '실행 요약',
                    'background': '배경 정보',
                    'methodology': '분석 방법론',
                    'findings': '주요 발견사항',
                    'finding1_title': '발견사항 1',
                    'finding1_content': '첫 번째 발견사항',
                    'finding2_title': '발견사항 2', 
                    'finding2_content': '두 번째 발견사항',
                    'finding3_title': '발견사항 3',
                    'finding3_content': '세 번째 발견사항',
                    'conclusions': '결론',
                    'appendix': '부록',
                    'main_response': main_content,
                    'additional_thoughts': '추가적인 생각들',
                    'related_question': '관련 질문'
                }
                
                for var in template.variables:
                    if var not in template_vars:
                        template_vars[var] = missing_vars.get(var, f'{var} 내용')
                
                content = template.template.format(**template_vars)
            except Exception as e:
                print(f"템플릿 적용 오류: {e}")
                content = f"템플릿 적용 중 오류가 발생했습니다: {str(e)}"
        
        return {
            'content': content,
            'structure': template.structure,
            'style': template.style,
            'length': template.length,
            'components': sorted_components,
            'personalization_level': 0.0,  # 나중에 계산
            'context_relevance': 0.0  # 나중에 계산
        }
    
    def _apply_personalization(
        self, 
        structured_response: Dict[str, Any], 
        user_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """개인화 적용"""
        content = structured_response['content']
        style = structured_response['style']
        
        # 사용자 선호도에 따른 스타일 조정
        preferred_style = user_profile.get('communication_style', 'formal')
        if preferred_style != style.value:
            content = self._adjust_style(content, preferred_style)
            structured_response['style'] = ResponseStyle(preferred_style)
        
        # 사용자 전문성 수준에 따른 내용 조정
        expertise_level = user_profile.get('expertise_level', 'beginner')
        if expertise_level == 'advanced':
            content = self._add_advanced_content(content)
        elif expertise_level == 'beginner':
            content = self._simplify_content(content)
        
        structured_response['content'] = content
        structured_response['personalization_level'] = 0.8  # 개인화 수준
        
        return structured_response
    
    def _adjust_style(self, content: str, target_style: str) -> str:
        """스타일 조정"""
        style_patterns = self.style_patterns.get(ResponseStyle(target_style), {})
        
        # 인사말 조정
        if 'greetings' in style_patterns:
            greeting = style_patterns['greetings'][0]
            content = content.replace('안녕하세요', greeting)
        
        # 결론 조정
        if 'conclusions' in style_patterns:
            conclusion = style_patterns['conclusions'][0]
            content = content.replace('감사합니다', conclusion)
        
        return content
    
    def _add_advanced_content(self, content: str) -> str:
        """고급 내용 추가"""
        # 전문적인 용어나 상세한 설명 추가
        advanced_additions = [
            "\n\n## 전문가 관점\n",
            "이 분야의 전문가들은 다음과 같은 추가 고려사항을 제시합니다:",
            "- 심층 분석이 필요한 부분",
            "- 고급 기법과 모범 사례",
            "- 최신 트렌드와 발전 방향"
        ]
        
        return content + "".join(advanced_additions)
    
    def _simplify_content(self, content: str) -> str:
        """내용 단순화"""
        # 복잡한 용어를 간단한 용어로 변경
        simplifications = {
            '알고리즘': '문제 해결 방법',
            '자료구조': '데이터 저장 방식',
            '디자인 패턴': '프로그래밍 설계 방법',
            '아키텍처': '전체 구조'
        }
        
        for complex_term, simple_term in simplifications.items():
            content = content.replace(complex_term, simple_term)
        
        return content
    
    def _optimize_response_quality(
        self, 
        personalized_response: Dict[str, Any], 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """응답 품질 최적화"""
        content = personalized_response['content']
        
        # 1. 가독성 개선
        content = self._improve_readability(content)
        
        # 2. 일관성 검사
        content = self._ensure_consistency(content)
        
        # 3. 완성도 검사
        content = self._ensure_completeness(content, strategy)
        
        personalized_response['content'] = content
        personalized_response['context_relevance'] = self._calculate_context_relevance(content, strategy)
        
        return personalized_response
    
    def _improve_readability(self, content: str) -> str:
        """가독성 개선"""
        # 문장 길이 조정
        sentences = content.split('. ')
        improved_sentences = []
        
        for sentence in sentences:
            if len(sentence.split()) > 25:  # 너무 긴 문장 분할
                words = sentence.split()
                mid_point = len(words) // 2
                part1 = ' '.join(words[:mid_point])
                part2 = ' '.join(words[mid_point:])
                improved_sentences.extend([part1, part2])
            else:
                improved_sentences.append(sentence)
        
        return '. '.join(improved_sentences)
    
    def _ensure_consistency(self, content: str) -> str:
        """일관성 보장"""
        # 용어 통일
        term_mappings = {
            '프로그래밍': '프로그래밍',
            '코딩': '프로그래밍',
            '개발': '프로그래밍'
        }
        
        for old_term, new_term in term_mappings.items():
            content = content.replace(old_term, new_term)
        
        return content
    
    def _ensure_completeness(self, content: str, strategy: Dict[str, Any]) -> str:
        """완성도 보장"""
        # 필수 요소 확인
        if strategy['intent'] == 'question' and '?' not in content:
            content += " 추가로 궁금한 점이 있으시면 언제든지 물어보세요."
        
        if strategy['emotion'] == 'frustrated' and '도움' not in content:
            content += " 더 도움이 필요하시면 말씀해주세요."
        
        return content
    
    def _calculate_context_relevance(self, content: str, strategy: Dict[str, Any]) -> float:
        """문맥 관련성 계산"""
        relevance = 0.5  # 기본값
        
        # 주제 관련성
        topic = strategy.get('topic', '')
        if topic in content:
            relevance += 0.2
        
        # 의도 관련성
        intent = strategy.get('intent', '')
        if intent == 'question' and '?' in content:
            relevance += 0.1
        elif intent == 'request' and ('해주세요' in content or '도와' in content):
            relevance += 0.1
        
        # 감정 관련성
        emotion = strategy.get('emotion', '')
        if emotion == 'positive' and ('좋다' in content or '훌륭' in content):
            relevance += 0.1
        elif emotion == 'frustrated' and ('도움' in content or '해결' in content):
            relevance += 0.1
        
        return min(relevance, 1.0)
    
    def _generate_metadata(
        self, 
        strategy: Dict[str, Any], 
        template: ResponseTemplate, 
        components: List[ResponseComponent]
    ) -> Dict[str, Any]:
        """메타데이터 생성"""
        return {
            'generation_time': datetime.now().isoformat(),
            'strategy': strategy,
            'template_used': template.id,
            'component_count': len(components),
            'processing_steps': [
                'strategy_determination',
                'template_selection',
                'content_generation',
                'structuring',
                'personalization',
                'quality_optimization'
            ],
            'adaptation_applied': True
        }
    
    def _calculate_quality_score(self, response: Dict[str, Any], strategy: Dict[str, Any]) -> float:
        """품질 점수 계산"""
        score = 0.0
        
        # 기본 점수
        score += 0.3
        
        # 개인화 점수
        score += response['personalization_level'] * 0.2
        
        # 문맥 관련성 점수
        score += response['context_relevance'] * 0.2
        
        # 완성도 점수
        content = response['content']
        if len(content) > 100:  # 충분한 길이
            score += 0.1
        if '.' in content:  # 문장 구조
            score += 0.1
        if '?' in content or '!' in content:  # 상호작용 요소
            score += 0.1
        
        return min(score, 1.0)
    
    def _generate_fallback_response(self, user_message: str) -> GeneratedResponse:
        """폴백 응답 생성"""
        return GeneratedResponse(
            content=f"죄송합니다. '{user_message}'에 대한 응답을 생성하는 중에 문제가 발생했습니다. 다시 시도해주세요.",
            structure=ResponseStructure.LINEAR,
            style=ResponseStyle.FORMAL,
            length=ResponseLength.CONCISE,
            components=[],
            metadata={'fallback': True, 'error': 'generation_failed'},
            quality_score=0.3,
            personalization_level=0.0,
            context_relevance=0.5
        )
    
    def update_template_success_rate(self, template_id: str, success: bool):
        """템플릿 성공률 업데이트"""
        if template_id in self.response_templates:
            template = self.response_templates[template_id]
            
            # 성공률 업데이트 (지수 이동 평균)
            alpha = 0.1
            if success:
                template.success_rate = template.success_rate * (1 - alpha) + alpha
            else:
                template.success_rate = template.success_rate * (1 - alpha)
    
    def get_system_stats(self) -> Dict[str, Any]:
        """시스템 통계"""
        return {
            'total_templates': len(self.response_templates),
            'template_usage': {t.id: t.usage_count for t in self.response_templates.values()},
            'average_success_rate': sum(t.success_rate for t in self.response_templates.values()) / len(self.response_templates),
            'style_patterns': len(self.style_patterns),
            'structure_patterns': len(self.structure_patterns),
            'last_updated': datetime.now().isoformat()
        }

# 전역 인스턴스
intelligent_response_generator = IntelligentResponseGenerator()
