"""
Redevelopment Specialized Message Generator
재건축/재개발 특화 메시지 생성기

Features:
- 재건축/재개발 전문 용어 및 상황 인식
- 조합원, 임차인, 업체 간의 맥락적 커뮤니케이션
- 분담금, 시공사, 총회 등 핵심 이슈별 메시지 생성
- 사업 단계별 적절한 톤 조절
"""

import json
import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from collections import defaultdict, Counter

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

@dataclass
class RedevelopmentContext:
    """재건축/재개발 상황 맥락"""
    project_type: str  # 재건축, 재개발, 도시재생
    project_phase: str  # 추진위, 조합설립, 안전진단, 시공사선정, 분양, 착공, 준공
    participants: List[str]  # 조합원, 임차인, 시공사, 컨설팅사 등
    key_issues: List[str]  # 분담금, 총회, 투표, 일정 등
    project_scale: str  # 소규모, 중규모, 대규모
    location_type: str  # 강남권, 강북권, 경기권 등

@dataclass
class RedevelopmentMessage:
    """재건축/재개발 특화 메시지"""
    message_id: str
    content: str
    target_audience: str  # 조합원, 임차인, 업체
    message_purpose: str  # 공지, 의견수렴, 설명, 협의요청
    formality_level: str  # 공식, 비공식, 친근
    urgency_level: str   # 긴급, 중요, 일반
    compliance_checked: bool  # 법적/절차적 적절성 확인
    metadata: Dict[str, Any]

class RedevelopmentKnowledgeBase:
    """재건축/재개발 전문 지식 베이스"""
    
    def __init__(self):
        self.project_phases = self._initialize_project_phases()
        self.stakeholder_roles = self._initialize_stakeholder_roles()
        self.legal_terms = self._initialize_legal_terms()
        self.common_issues = self._initialize_common_issues()
        self.communication_patterns = self._initialize_communication_patterns()
    
    def _initialize_project_phases(self) -> Dict[str, Dict[str, Any]]:
        """사업 단계별 특성"""
        return {
            "추진위": {
                "duration": "6-12개월",
                "key_activities": ["주민설명회", "찬반투표", "추진위원회 구성"],
                "main_concerns": ["사업성", "참여율", "반대의견"],
                "communication_tone": "설득적",
                "typical_messages": ["참여 독려", "설명회 안내", "의견 수렴"]
            },
            "조합설립": {
                "duration": "3-6개월", 
                "key_activities": ["조합설립인가", "임원선출", "규약제정"],
                "main_concerns": ["임원선출", "규약", "조합비"],
                "communication_tone": "공식적",
                "typical_messages": ["총회 소집", "선거 안내", "규약 안내"]
            },
            "안전진단": {
                "duration": "6-12개월",
                "key_activities": ["정밀안전진단", "보강공법검토", "등급판정"],
                "main_concerns": ["진단결과", "보강비용", "일정지연"],
                "communication_tone": "정보전달",
                "typical_messages": ["진단결과 공유", "보강방안 설명", "일정 안내"]
            },
            "시공사선정": {
                "duration": "3-6개월",
                "key_activities": ["시공사공모", "심사", "계약"],
                "main_concerns": ["시공능력", "분담금", "설계변경"],
                "communication_tone": "신중함",
                "typical_messages": ["시공사 소개", "분담금 안내", "계약 설명"]
            },
            "분양": {
                "duration": "6-12개월",
                "key_activities": ["분양가결정", "분양홍보", "계약"],
                "main_concerns": ["분양가", "분양률", "마케팅"],
                "communication_tone": "마케팅",
                "typical_messages": ["분양 안내", "홍보", "계약 독려"]
            },
            "착공": {
                "duration": "24-36개월",
                "key_activities": ["철거", "건설", "진도관리"],
                "main_concerns": ["공사진행", "안전", "일정관리"],
                "communication_tone": "진행상황",
                "typical_messages": ["공사 현황", "안전 안내", "일정 업데이트"]
            }
        }
    
    def _initialize_stakeholder_roles(self) -> Dict[str, Dict[str, Any]]:
        """이해관계자별 역할과 관심사"""
        return {
            "조합원": {
                "primary_interests": ["분담금", "면적", "일정", "품질"],
                "communication_style": "직접적",
                "decision_power": "high",
                "typical_concerns": ["재정부담", "이주일정", "자산가치"]
            },
            "임차인": {
                "primary_interests": ["이주대책", "보상", "재입주"],
                "communication_style": "협의적",
                "decision_power": "low",
                "typical_concerns": ["이사비", "임시거주", "재계약"]
            },
            "조합장": {
                "primary_interests": ["사업성공", "갈등해결", "일정관리"],
                "communication_style": "리더십",
                "decision_power": "high",
                "typical_concerns": ["조합운영", "의사결정", "대외협상"]
            },
            "시공사": {
                "primary_interests": ["수익성", "공사진행", "품질"],
                "communication_style": "전문적",
                "decision_power": "medium",
                "typical_concerns": ["공사일정", "변경사항", "준공"]
            },
            "컨설팅사": {
                "primary_interests": ["프로젝트성공", "전문성", "신뢰"],
                "communication_style": "자문적",
                "decision_power": "advisory",
                "typical_concerns": ["기술검토", "리스크관리", "진행상황"]
            }
        }
    
    def _initialize_legal_terms(self) -> Dict[str, str]:
        """법적/전문 용어 설명"""
        return {
            "정비사업": "노후·불량건축물이 밀집한 지역에서 주거환경을 개선하기 위한 사업",
            "재건축": "정비기반시설은 양호하나 노후·불량건축물이 밀집한 지역에서 주거환경을 개선하기 위한 사업",
            "재개발": "정비기반시설이 열악하고 노후·불량건축물이 밀집한 지역에서 주거환경을 개선하기 위한 사업",
            "분담금": "조합원이 새로 받게 될 주택의 가격에서 기존 주택의 평가액을 뺀 차액",
            "추진위원회": "정비사업을 추진하기 위해 토지등소유자가 구성하는 임의기구",
            "조합설립인가": "시장·군수 등이 조합설립을 허가하는 행정행위",
            "안전진단": "건축물의 구조적 안전성을 종합적으로 평가하는 진단",
            "관리처분계획": "조합원의 종전자산과 새로운 건축물의 권리관계를 정하는 계획"
        }
    
    def _initialize_common_issues(self) -> Dict[str, Dict[str, Any]]:
        """재건축/재개발 주요 이슈별 대응방안"""
        return {
            "분담금": {
                "common_concerns": ["부담 과중", "산정 기준", "납부 방법"],
                "key_factors": ["분양가", "종전자산평가", "면적차이"],
                "communication_tips": ["구체적 계산", "단계별 설명", "납부계획 제시"],
                "risk_factors": ["분양가 상승", "자금 부족", "대출 한도"]
            },
            "시공사선정": {
                "common_concerns": ["시공능력", "브랜드", "경험"],
                "key_factors": ["재무건전성", "시공실적", "설계능력"],
                "communication_tips": ["객관적 평가", "비교 자료", "실적 제시"],
                "risk_factors": ["부실시공", "공사지연", "품질저하"]
            },
            "총회": {
                "common_concerns": ["참석률", "의결사항", "찬반표결"],
                "key_factors": ["법정의결요건", "안건 중요도", "이해관계"],
                "communication_tips": ["사전 설명", "충분한 논의", "투명한 진행"],
                "risk_factors": ["유회", "반대의견", "갈등심화"]
            },
            "일정지연": {
                "common_concerns": ["추가비용", "이주연기", "시장변화"],
                "key_factors": ["인허가", "민원", "외부요인"],
                "communication_tips": ["원인 설명", "대안 제시", "진행상황 공유"],
                "risk_factors": ["비용증가", "조합해체", "사업중단"]
            }
        }
    
    def _initialize_communication_patterns(self) -> Dict[str, Dict[str, List[str]]]:
        """상황별 커뮤니케이션 패턴"""
        return {
            "공지": {
                "formal": [
                    "안녕하세요, {project_name} 조합원 여러분께 {issue}에 대해 안내드립니다.",
                    "{project_name} 조합에서 {issue} 관련하여 다음과 같이 알려드립니다.",
                    "조합원 여러분, {issue}에 대한 중요한 사항을 공지드립니다."
                ],
                "friendly": [
                    "안녕하세요! {issue}에 대해 안내드려요.",
                    "{name}님, {issue} 관련해서 말씀드릴게요.",
                    "조합원 여러분~ {issue} 소식 전해드립니다."
                ]
            },
            "의견수렴": {
                "formal": [
                    "{issue}에 대한 조합원 여러분의 의견을 수렴하고자 합니다.",
                    "{issue} 관련하여 조합원분들의 고견을 듣고 싶습니다.",
                    "{issue}에 대해 다양한 의견을 나누고자 의견수렴을 진행합니다."
                ],
                "friendly": [
                    "{issue}에 대해 어떻게 생각하시나요?",
                    "{name}님 의견이 궁금해요. {issue} 관련해서요.",
                    "{issue}, 함께 의견 나눠볼까요?"
                ]
            },
            "협의요청": {
                "formal": [
                    "{issue}에 대한 협의를 요청드립니다.",
                    "{issue} 관련하여 조합원분들과 협의가 필요합니다.",
                    "{issue}에 대해 함께 논의하고 결정하고자 합니다."
                ],
                "friendly": [
                    "{issue}, 같이 얘기해보면 좋겠어요.",
                    "{name}님과 {issue}에 대해 협의하고 싶습니다.",
                    "{issue} 관련해서 의논해봐요."
                ]
            }
        }

class RedevelopmentMessageGenerator:
    """재건축/재개발 특화 메시지 생성기"""
    
    def __init__(self):
        self.knowledge_base = RedevelopmentKnowledgeBase()
        self.context_analyzer = RedevelopmentContextAnalyzer()
    
    def generate_redevelopment_message(self, 
                                     target_person: str,
                                     message_purpose: str,
                                     context_messages: List[Dict[str, Any]],
                                     redevelopment_context: Optional[RedevelopmentContext] = None) -> RedevelopmentMessage:
        """재건축/재개발 특화 메시지 생성"""
        
        try:
            # 1. 재건축/재개발 맥락 분석
            if not redevelopment_context:
                redevelopment_context = self.context_analyzer.analyze_redevelopment_context(context_messages)
            
            # 2. 대상자 역할 분석
            target_role = self._identify_stakeholder_role(target_person, context_messages)
            
            # 3. 현재 프로젝트 단계 파악
            current_phase = self._identify_project_phase(context_messages, redevelopment_context)
            
            # 4. 주요 이슈 및 관심사 파악
            key_issues = self._extract_key_issues(context_messages)
            
            # 5. 적절한 커뮤니케이션 스타일 결정
            communication_style = self._determine_communication_style(
                target_role, message_purpose, current_phase
            )
            
            # 6. 메시지 생성
            message_content = self._generate_message_content(
                target_person, target_role, message_purpose, 
                key_issues, communication_style, redevelopment_context
            )
            
            # 7. 법적/절차적 적절성 검토
            compliance_check = self._check_compliance(message_content, message_purpose, current_phase)
            
            # 8. 메시지 객체 생성
            message = RedevelopmentMessage(
                message_id=f"rd_msg_{int(datetime.now().timestamp())}",
                content=message_content,
                target_audience=target_role,
                message_purpose=message_purpose,
                formality_level=communication_style['formality'],
                urgency_level=communication_style['urgency'],
                compliance_checked=compliance_check['is_compliant'],
                metadata={
                    'redevelopment_context': asdict(redevelopment_context),
                    'key_issues': key_issues,
                    'project_phase': current_phase,
                    'compliance_notes': compliance_check['notes']
                }
            )
            
            return message
            
        except Exception as e:
            return self._generate_fallback_message(target_person, str(e))
    
    def _identify_stakeholder_role(self, person_name: str, messages: List[Dict[str, Any]]) -> str:
        """이해관계자 역할 식별"""
        
        # 메시지 내용 분석을 통한 역할 추정
        person_messages = [msg for msg in messages if msg.get('sender') == person_name]
        person_content = ' '.join([msg.get('content', '') for msg in person_messages])
        
        role_indicators = {
            "조합장": ["조합장", "회장", "대표", "총회", "의사결정"],
            "조합원": ["분담금", "면적", "평수", "이사", "입주"],
            "임차인": ["임차", "임대", "보상", "이주", "재계약"],
            "시공사": ["시공", "건설", "공사", "품질", "준공"],
            "컨설팅사": ["컨설팅", "자문", "검토", "분석", "제안"]
        }
        
        role_scores = {}
        for role, indicators in role_indicators.items():
            score = sum(1 for indicator in indicators if indicator in person_content)
            role_scores[role] = score
        
        # 가장 높은 점수의 역할 반환, 동점이거나 점수가 없으면 기본값
        if role_scores and max(role_scores.values()) > 0:
            return max(role_scores.items(), key=lambda x: x[1])[0]
        else:
            return "조합원"  # 기본값
    
    def _identify_project_phase(self, messages: List[Dict[str, Any]], 
                               context: RedevelopmentContext) -> str:
        """현재 프로젝트 단계 식별"""
        
        recent_content = ' '.join([
            msg.get('content', '') for msg in messages[-10:]  # 최근 10개 메시지
        ])
        
        phase_indicators = {
            "추진위": ["추진위", "찬반투표", "동의", "참여"],
            "조합설립": ["조합설립", "인가", "임원", "선거", "규약"],
            "안전진단": ["안전진단", "정밀진단", "등급", "보강"],
            "시공사선정": ["시공사", "건설사", "선정", "심사", "계약"],
            "분양": ["분양", "홍보", "계약", "분양가"],
            "착공": ["착공", "철거", "공사", "현장", "진도"]
        }
        
        phase_scores = {}
        for phase, indicators in phase_indicators.items():
            score = sum(1 for indicator in indicators if indicator in recent_content)
            phase_scores[phase] = score
        
        if phase_scores and max(phase_scores.values()) > 0:
            return max(phase_scores.items(), key=lambda x: x[1])[0]
        else:
            return context.project_phase if context.project_phase else "추진위"
    
    def _extract_key_issues(self, messages: List[Dict[str, Any]]) -> List[str]:
        """주요 이슈 추출"""
        
        recent_content = ' '.join([
            msg.get('content', '') for msg in messages[-5:]
        ])
        
        issue_keywords = {
            "분담금": ["분담금", "부담금", "납부", "재정"],
            "시공사": ["시공사", "건설사", "업체", "계약"],
            "총회": ["총회", "회의", "의결", "투표"],
            "일정": ["일정", "계획", "지연", "연기"],
            "분양": ["분양", "분양가", "홍보", "마케팅"],
            "이주": ["이주", "이사", "임시거주", "보상"]
        }
        
        detected_issues = []
        for issue, keywords in issue_keywords.items():
            if any(keyword in recent_content for keyword in keywords):
                detected_issues.append(issue)
        
        return detected_issues[:3]  # 최대 3개 이슈
    
    def _determine_communication_style(self, target_role: str, message_purpose: str, 
                                     current_phase: str) -> Dict[str, str]:
        """커뮤니케이션 스타일 결정"""
        
        role_info = self.knowledge_base.stakeholder_roles.get(target_role, {})
        phase_info = self.knowledge_base.project_phases.get(current_phase, {})
        
        # 공식성 결정
        if target_role in ["조합장", "시공사", "컨설팅사"]:
            formality = "formal"
        elif message_purpose in ["공지", "협의요청"]:
            formality = "formal" 
        else:
            formality = "friendly"
        
        # 긴급성 결정
        urgent_phases = ["시공사선정", "분양"]
        urgent_purposes = ["긴급공지", "투표요청"]
        
        if current_phase in urgent_phases or message_purpose in urgent_purposes:
            urgency = "urgent"
        elif message_purpose in ["의견수렴", "협의요청"]:
            urgency = "important"
        else:
            urgency = "normal"
        
        return {
            "formality": formality,
            "urgency": urgency,
            "tone": phase_info.get("communication_tone", "정보전달")
        }
    
    def _generate_message_content(self, target_person: str, target_role: str,
                                message_purpose: str, key_issues: List[str],
                                communication_style: Dict[str, str],
                                context: RedevelopmentContext) -> str:
        """실제 메시지 내용 생성"""
        
        formality = communication_style['formality']
        patterns = self.knowledge_base.communication_patterns.get(message_purpose, {})
        
        if formality in patterns:
            templates = patterns[formality]
        else:
            templates = patterns.get('formal', ["안녕하세요. {issue}에 대해 말씀드립니다."])
        
        # 템플릿 선택
        import random
        template = random.choice(templates)
        
        # 변수 치환
        project_name = getattr(context, 'project_name', '우리 단지')
        main_issue = key_issues[0] if key_issues else '프로젝트 진행'
        
        content = template.format(
            name=target_person,
            project_name=project_name,
            issue=main_issue
        )
        
        # 상황별 추가 내용
        if key_issues:
            content += self._add_context_specific_content(key_issues, target_role, communication_style)
        
        # 맺음말 추가
        content += self._add_closing_remarks(target_role, formality)
        
        return content
    
    def _add_context_specific_content(self, key_issues: List[str], target_role: str,
                                    communication_style: Dict[str, str]) -> str:
        """상황별 구체적 내용 추가"""
        
        additional_content = ""
        
        for issue in key_issues:
            issue_info = self.knowledge_base.common_issues.get(issue, {})
            tips = issue_info.get('communication_tips', [])
            
            if issue == "분담금" and target_role == "조합원":
                additional_content += "\n\n분담금 관련해서는 개별 상담을 통해 자세히 안내해드리겠습니다."
            elif issue == "시공사" and "선정" in key_issues:
                additional_content += "\n\n시공사 선정 관련 자료는 별도로 배포해드릴 예정입니다."
            elif issue == "총회":
                additional_content += "\n\n총회 참석을 부탁드리며, 사전에 안건 검토 부탁드립니다."
        
        return additional_content
    
    def _add_closing_remarks(self, target_role: str, formality: str) -> str:
        """맺음말 추가"""
        
        if formality == "formal":
            if target_role == "조합원":
                return "\n\n궁금한 사항이 있으시면 언제든 연락 주시기 바랍니다."
            else:
                return "\n\n협조해 주시기 바랍니다."
        else:
            return "\n\n궁금한 것 있으면 언제든 연락주세요!"
    
    def _check_compliance(self, content: str, purpose: str, phase: str) -> Dict[str, Any]:
        """법적/절차적 적절성 검토"""
        
        compliance_issues = []
        
        # 기본적인 준수사항 검토
        sensitive_topics = ["분담금 확정", "시공사 확정", "총회 의결"]
        
        for topic in sensitive_topics:
            if topic in content and purpose != "공지":
                compliance_issues.append(f"{topic}은 공식 공지를 통해서만 전달해야 합니다.")
        
        # 법적 용어 사용 검토
        legal_terms = ["확정", "의결", "승인"]
        for term in legal_terms:
            if term in content and "예정" not in content:
                compliance_issues.append(f"'{term}' 표현은 신중하게 사용해야 합니다.")
        
        return {
            "is_compliant": len(compliance_issues) == 0,
            "notes": compliance_issues
        }
    
    def _generate_fallback_message(self, target_person: str, error: str) -> RedevelopmentMessage:
        """폴백 메시지 생성"""
        
        return RedevelopmentMessage(
            message_id=f"fallback_{int(datetime.now().timestamp())}",
            content=f"안녕하세요 {target_person}님. 재건축 관련하여 연락드립니다. 자세한 내용은 별도로 안내해드리겠습니다.",
            target_audience="조합원",
            message_purpose="일반",
            formality_level="formal",
            urgency_level="normal",
            compliance_checked=True,
            metadata={"fallback": True, "error": error}
        )

class RedevelopmentContextAnalyzer:
    """재건축/재개발 맥락 분석기"""
    
    def analyze_redevelopment_context(self, messages: List[Dict[str, Any]]) -> RedevelopmentContext:
        """대화 메시지로부터 재건축/재개발 맥락 분석"""
        
        all_content = ' '.join([msg.get('content', '') for msg in messages])
        participants = list(set([msg.get('sender', '') for msg in messages if msg.get('sender')]))
        
        # 사업 유형 분석
        project_type = self._analyze_project_type(all_content)
        
        # 사업 단계 분석
        project_phase = self._analyze_project_phase(all_content)
        
        # 핵심 이슈 분석
        key_issues = self._analyze_key_issues(all_content)
        
        # 규모 분석
        project_scale = self._analyze_project_scale(all_content)
        
        # 지역 유형 분석
        location_type = self._analyze_location_type(all_content)
        
        return RedevelopmentContext(
            project_type=project_type,
            project_phase=project_phase,
            participants=participants,
            key_issues=key_issues,
            project_scale=project_scale,
            location_type=location_type
        )
    
    def _analyze_project_type(self, content: str) -> str:
        """사업 유형 분석"""
        if "재건축" in content:
            return "재건축"
        elif "재개발" in content:
            return "재개발"
        elif "도시재생" in content:
            return "도시재생"
        else:
            return "재건축"  # 기본값
    
    def _analyze_project_phase(self, content: str) -> str:
        """현재 사업 단계 분석"""
        phase_keywords = {
            "추진위": ["추진위", "찬반", "동의"],
            "조합설립": ["조합설립", "인가", "임원"],
            "안전진단": ["안전진단", "정밀진단"],
            "시공사선정": ["시공사", "선정", "심사"],
            "분양": ["분양", "분양가"],
            "착공": ["착공", "공사", "철거"]
        }
        
        for phase, keywords in phase_keywords.items():
            if any(keyword in content for keyword in keywords):
                return phase
        
        return "추진위"  # 기본값
    
    def _analyze_key_issues(self, content: str) -> List[str]:
        """핵심 이슈 분석"""
        issues = []
        
        issue_keywords = {
            "분담금": ["분담금", "부담금"],
            "시공사": ["시공사", "건설사"],
            "총회": ["총회", "회의"],
            "일정": ["일정", "지연"],
            "분양": ["분양", "분양가"]
        }
        
        for issue, keywords in issue_keywords.items():
            if any(keyword in content for keyword in keywords):
                issues.append(issue)
        
        return issues
    
    def _analyze_project_scale(self, content: str) -> str:
        """사업 규모 분석"""
        if any(keyword in content for keyword in ["대단지", "대규모", "천호", "수천세대"]):
            return "대규모"
        elif any(keyword in content for keyword in ["중소", "중규모", "백호", "수백세대"]):
            return "중규모"
        else:
            return "소규모"
    
    def _analyze_location_type(self, content: str) -> str:
        """지역 유형 분석"""
        if any(keyword in content for keyword in ["강남", "서초", "송파", "강동"]):
            return "강남권"
        elif any(keyword in content for keyword in ["강북", "도봉", "노원"]):
            return "강북권"
        elif any(keyword in content for keyword in ["경기", "성남", "고양", "수원"]):
            return "경기권"
        else:
            return "기타"

# FastAPI 애플리케이션
app = FastAPI(title="Redevelopment Message Generator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 메시지 생성기
redevelopment_generator = RedevelopmentMessageGenerator()

@app.get("/")
async def root():
    return {"message": "Redevelopment Specialized Message Generator API"}

@app.post("/api/generate-redevelopment-message")
async def generate_redevelopment_message(request_data: Dict[str, Any]):
    """재건축/재개발 특화 메시지 생성"""
    try:
        target_person = request_data['target_person']
        message_purpose = request_data.get('message_purpose', '공지')
        context_messages = request_data.get('context_messages', [])
        
        # 재건축 맥락 정보가 제공된 경우
        rd_context = None
        if 'redevelopment_context' in request_data:
            rd_ctx_data = request_data['redevelopment_context']
            rd_context = RedevelopmentContext(
                project_type=rd_ctx_data.get('project_type', '재건축'),
                project_phase=rd_ctx_data.get('project_phase', '추진위'),
                participants=rd_ctx_data.get('participants', []),
                key_issues=rd_ctx_data.get('key_issues', []),
                project_scale=rd_ctx_data.get('project_scale', '중규모'),
                location_type=rd_ctx_data.get('location_type', '기타')
            )
        
        # 메시지 생성
        generated_message = redevelopment_generator.generate_redevelopment_message(
            target_person=target_person,
            message_purpose=message_purpose,
            context_messages=context_messages,
            redevelopment_context=rd_context
        )
        
        return asdict(generated_message)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze-redevelopment-context")
async def analyze_redevelopment_context(request_data: Dict[str, Any]):
    """재건축/재개발 맥락 분석"""
    try:
        messages = request_data.get('messages', [])
        context = redevelopment_generator.context_analyzer.analyze_redevelopment_context(messages)
        return asdict(context)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/redevelopment-knowledge")
async def get_redevelopment_knowledge():
    """재건축/재개발 전문 지식 조회"""
    return {
        "project_phases": redevelopment_generator.knowledge_base.project_phases,
        "stakeholder_roles": redevelopment_generator.knowledge_base.stakeholder_roles,
        "legal_terms": redevelopment_generator.knowledge_base.legal_terms,
        "common_issues": redevelopment_generator.knowledge_base.common_issues
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8008) 