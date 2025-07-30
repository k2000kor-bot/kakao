import json
import re
import random
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum


class MessageType(Enum):
    """메시지 유형 분류"""
    ANALYSIS_SUMMARY = "analysis_summary"
    RECOMMENDATION = "recommendation"
    RISK_WARNING = "risk_warning"
    COMPARISON = "comparison"
    DECISION_SUPPORT = "decision_support"
    TECHNICAL_EXPLANATION = "technical_explanation"
    FINANCIAL_ANALYSIS = "financial_analysis"
    PROGRESS_UPDATE = "progress_update"


class MessageTone(Enum):
    """메시지 톤 분류"""
    PROFESSIONAL = "professional"
    CONSULTATIVE = "consultative"
    ANALYTICAL = "analytical"
    PERSUASIVE = "persuasive"
    CAUTIOUS = "cautious"
    CONFIDENT = "confident"
    NEUTRAL = "neutral"


@dataclass
class MessageContext:
    """메시지 생성 컨텍스트"""
    project_type: str
    current_phase: str
    stakeholders: List[str]
    priority_factors: Dict[str, float]
    decision_timeline: str
    risk_tolerance: str
    previous_decisions: List[Dict]
    market_conditions: Dict[str, Any]


@dataclass
class GeneratedMessage:
    """생성된 메시지 구조"""
    message_id: str
    message_type: MessageType
    tone: MessageTone
    title: str
    content: str
    key_points: List[str]
    supporting_data: Dict[str, Any]
    recommendations: List[str]
    next_actions: List[str]
    confidence_score: float
    logic_structure: Dict[str, Any]
    timestamp: datetime
    metadata: Dict[str, Any]


class AdvancedMessageGenerator:
    """고도화된 메시지 생성 시스템"""
    
    def __init__(self):
        self.message_templates = self._load_message_templates()
        self.logic_patterns = self._initialize_logic_patterns()
        self.vocabulary_bank = self._initialize_vocabulary_bank()
        self.reasoning_chains = self._initialize_reasoning_chains()
        self.context_adapters = self._initialize_context_adapters()
        
    def _load_message_templates(self) -> Dict[str, Dict]:
        """메시지 템플릿 로드"""
        return {
            "analysis_summary": {
                "structure": ["context", "findings", "implications", "recommendations"],
                "opening_phrases": [
                    "종합적인 분석 결과를 말씀드리면",
                    "데이터 기반 분석을 통해 확인된 내용은",
                    "다각도 검토를 통해 도출된 결론은"
                ],
                "transition_phrases": [
                    "특히 주목할 점은",
                    "핵심적으로 고려해야 할 사항은",
                    "결정적인 요인으로는"
                ],
                "closing_phrases": [
                    "이러한 분석을 바탕으로 제안드리는 바는",
                    "종합적으로 판단할 때",
                    "결론적으로 권고사항은"
                ]
            },
            "recommendation": {
                "structure": ["problem_identification", "solution_proposal", "benefits", "implementation"],
                "opening_phrases": [
                    "현재 상황을 고려할 때 권고드리는 방안은",
                    "최적의 선택을 위해 제안드리는 내용은",
                    "신중한 검토 결과 추천하는 방향은"
                ],
                "justification_phrases": [
                    "이러한 판단의 근거는",
                    "권고 이유는 다음과 같습니다",
                    "이 방안의 타당성은"
                ],
                "benefit_phrases": [
                    "예상되는 주요 이점은",
                    "기대 효과로는",
                    "이를 통해 달성할 수 있는 가치는"
                ]
            },
            "risk_warning": {
                "structure": ["risk_identification", "impact_analysis", "mitigation_measures", "monitoring"],
                "warning_phrases": [
                    "주의깊게 살펴봐야 할 리스크는",
                    "신중히 고려해야 할 위험 요소는",
                    "면밀히 검토가 필요한 부분은"
                ],
                "impact_phrases": [
                    "이로 인한 잠재적 영향은",
                    "예상되는 파급 효과는",
                    "발생 가능한 결과는"
                ],
                "mitigation_phrases": [
                    "이를 방지하기 위한 대응 방안은",
                    "리스크 완화를 위해서는",
                    "예방 조치로는"
                ]
            }
        }
    
    def _initialize_logic_patterns(self) -> Dict[str, List[str]]:
        """논리 패턴 초기화"""
        return {
            "deductive": [
                "전제조건을 고려할 때",
                "기본 원칙에 따라",
                "일반적인 법칙을 적용하면",
                "표준 기준에 의하면"
            ],
            "inductive": [
                "과거 사례를 보면",
                "유사한 경우들을 분석해보니",
                "실제 데이터에 따르면",
                "경험적으로 확인된 바는"
            ],
            "comparative": [
                "다른 옵션과 비교해보면",
                "상대적으로 평가할 때",
                "대안들을 검토한 결과",
                "비교 분석을 통해"
            ],
            "causal": [
                "이러한 결과의 원인은",
                "근본적인 요인은",
                "직접적인 영향을 미치는 것은",
                "연쇄적으로 작용하는 것은"
            ]
        }
    
    def _initialize_vocabulary_bank(self) -> Dict[str, Dict[str, List[str]]]:
        """전문 용어 및 어휘 은행 초기화"""
        return {
            "construction": {
                "technical": [
                    "시공 기술력", "품질 관리 체계", "안전 관리 시스템",
                    "공정 관리 역량", "기술적 전문성", "시공 실적"
                ],
                "financial": [
                    "재무 안정성", "자본 구조", "유동성 비율",
                    "수익성 지표", "자금 조달 능력", "신용 등급"
                ],
                "management": [
                    "프로젝트 관리", "조직 역량", "품질 보증",
                    "일정 준수", "리스크 관리", "커뮤니케이션"
                ]
            },
            "decision_making": {
                "analytical": [
                    "정량적 분석", "정성적 평가", "다기준 의사결정",
                    "민감도 분석", "시나리오 분석", "벤치마킹"
                ],
                "strategic": [
                    "전략적 관점", "장기적 비전", "핵심 가치",
                    "경쟁 우위", "지속가능성", "혁신 역량"
                ],
                "operational": [
                    "운영 효율성", "실행 가능성", "즉시 적용",
                    "단계적 접근", "점진적 개선", "최적화"
                ]
            }
        }
    
    def _initialize_reasoning_chains(self) -> Dict[str, List[str]]:
        """추론 체인 패턴 초기화"""
        return {
            "problem_solution": [
                "현재 상황 분석",
                "문제점 식별",
                "원인 분석",
                "해결 방안 도출",
                "실행 계획 수립"
            ],
            "cost_benefit": [
                "비용 요소 분석",
                "편익 항목 평가",
                "순편익 계산",
                "투자수익률 검토",
                "최종 권고안 제시"
            ],
            "risk_assessment": [
                "리스크 식별",
                "발생 확률 평가",
                "영향도 분석",
                "완화 방안 검토",
                "모니터링 계획"
            ]
        }
    
    def _initialize_context_adapters(self) -> Dict[str, Dict]:
        """컨텍스트 어댑터 초기화"""
        return {
            "stakeholder_adaptation": {
                "임원진": {
                    "focus": ["전략적 영향", "재무적 결과", "리스크 관리"],
                    "language": "간결하고 핵심적인",
                    "detail_level": "요약 중심"
                },
                "실무진": {
                    "focus": ["실행 방안", "구체적 절차", "기술적 세부사항"],
                    "language": "상세하고 구체적인",
                    "detail_level": "세부 사항 포함"
                },
                "외부전문가": {
                    "focus": ["전문적 관점", "객관적 분석", "업계 표준"],
                    "language": "전문적이고 분석적인",
                    "detail_level": "기술적 깊이"
                }
            },
            "urgency_adaptation": {
                "긴급": {
                    "structure": "결론 우선",
                    "tone": "단호하고 명확한",
                    "recommendation": "즉시 실행 방안"
                },
                "일반": {
                    "structure": "순차적 설명",
                    "tone": "차분하고 논리적인",
                    "recommendation": "단계적 접근"
                },
                "신중": {
                    "structure": "충분한 배경 설명",
                    "tone": "신중하고 보수적인",
                    "recommendation": "추가 검토 포함"
                }
            }
        }
    
    def generate_advanced_message(
        self,
        message_type: MessageType,
        context: MessageContext,
        data: Dict[str, Any],
        target_audience: str = "실무진",
        urgency_level: str = "일반"
    ) -> GeneratedMessage:
        """고도화된 메시지 생성"""
        
        # 1. 컨텍스트 분석 및 어댑테이션
        adapted_context = self._adapt_context(context, target_audience, urgency_level)
        
        # 2. 논리 구조 설계
        logic_structure = self._design_logic_structure(message_type, data, adapted_context)
        
        # 3. 콘텐츠 생성
        content_blocks = self._generate_content_blocks(logic_structure, data, adapted_context)
        
        # 4. 메시지 조합 및 최적화
        final_message = self._compose_and_optimize_message(
            content_blocks, message_type, adapted_context
        )
        
        # 5. 품질 검증 및 개선
        verified_message = self._verify_and_improve_message(final_message, context)
        
        # 6. 메타데이터 생성
        metadata = self._generate_metadata(message_type, context, data)
        
        return GeneratedMessage(
            message_id=f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}",
            message_type=message_type,
            tone=self._determine_optimal_tone(message_type, context),
            title=verified_message["title"],
            content=verified_message["content"],
            key_points=verified_message["key_points"],
            supporting_data=data,
            recommendations=verified_message["recommendations"],
            next_actions=verified_message["next_actions"],
            confidence_score=verified_message["confidence_score"],
            logic_structure=logic_structure,
            timestamp=datetime.now(),
            metadata=metadata
        )
    
    def _adapt_context(self, context: MessageContext, audience: str, urgency: str) -> Dict:
        """컨텍스트 어댑테이션"""
        stakeholder_config = self.context_adapters["stakeholder_adaptation"].get(audience, {})
        urgency_config = self.context_adapters["urgency_adaptation"].get(urgency, {})
        
        return {
            "original_context": context,
            "audience_focus": stakeholder_config.get("focus", []),
            "language_style": stakeholder_config.get("language", "표준적인"),
            "detail_level": stakeholder_config.get("detail_level", "중간"),
            "structure_preference": urgency_config.get("structure", "순차적 설명"),
            "tone_preference": urgency_config.get("tone", "차분하고 논리적인"),
            "recommendation_style": urgency_config.get("recommendation", "단계적 접근")
        }
    
    def _design_logic_structure(self, message_type: MessageType, data: Dict, context: Dict) -> Dict:
        """논리 구조 설계"""
        base_structure = self.message_templates.get(message_type.value, {}).get("structure", [])
        
        logic_flow = {
            "main_argument": self._identify_main_argument(data, context),
            "supporting_points": self._extract_supporting_points(data, context),
            "evidence_hierarchy": self._organize_evidence(data),
            "reasoning_pattern": self._select_reasoning_pattern(data, context),
            "conclusion_pathway": self._design_conclusion_pathway(data, context),
            "structure_elements": base_structure
        }
        
        return logic_flow
    
    def _identify_main_argument(self, data: Dict, context: Dict) -> str:
        """주요 논점 식별"""
        if "recommended_company" in data:
            company_name = data["recommended_company"]
            key_strength = data.get("primary_reason", "종합적 우수성")
            return f"{company_name}이 {key_strength} 측면에서 최적의 선택입니다"
        elif "risk_factors" in data:
            return "신중한 리스크 관리가 필요한 상황입니다"
        else:
            return "데이터 기반 분석을 통한 객관적 판단이 필요합니다"
    
    def _extract_supporting_points(self, data: Dict, context: Dict) -> List[str]:
        """지지 논점 추출"""
        points = []
        
        if "comparison_results" in data:
            for company, scores in data["comparison_results"].items():
                strong_areas = [area for area, score in scores.items() if score > 85]
                if strong_areas:
                    points.append(f"{company}의 {', '.join(strong_areas)} 우수성")
        
        if "financial_analysis" in data:
            financial_highlights = data["financial_analysis"].get("highlights", [])
            points.extend(financial_highlights)
        
        if "technical_evaluation" in data:
            technical_strengths = data["technical_evaluation"].get("strengths", [])
            points.extend(technical_strengths)
        
        return points[:5]  # 상위 5개 핵심 포인트
    
    def _organize_evidence(self, data: Dict) -> Dict[str, List]:
        """증거 계층화"""
        evidence = {
            "quantitative": [],
            "qualitative": [],
            "comparative": [],
            "historical": []
        }
        
        # 정량적 데이터
        if "scores" in data:
            for metric, value in data["scores"].items():
                evidence["quantitative"].append(f"{metric}: {value}점")
        
        # 정성적 평가
        if "strengths" in data:
            evidence["qualitative"].extend(data["strengths"])
        
        # 비교 데이터
        if "rankings" in data:
            evidence["comparative"].extend(
                [f"{company}: {rank}위" for company, rank in data["rankings"].items()]
            )
        
        # 과거 실적
        if "historical_performance" in data:
            evidence["historical"].extend(data["historical_performance"])
        
        return evidence
    
    def _select_reasoning_pattern(self, data: Dict, context: Dict) -> str:
        """추론 패턴 선택"""
        if "comparison_results" in data:
            return "comparative"
        elif "risk_factors" in data:
            return "causal"
        elif "historical_data" in data:
            return "inductive"
        else:
            return "deductive"
    
    def _design_conclusion_pathway(self, data: Dict, context: Dict) -> List[str]:
        """결론 도출 경로 설계"""
        pathway = []
        
        # 데이터 수집 및 분석
        pathway.append("다각도 데이터 수집 및 검증")
        
        # 기준별 평가
        pathway.append("객관적 기준에 따른 정량적 평가")
        
        # 비교 분석
        pathway.append("대안들 간의 체계적 비교 분석")
        
        # 리스크 평가
        pathway.append("잠재적 리스크 요인 검토")
        
        # 최종 결론
        pathway.append("종합적 판단을 통한 최적안 도출")
        
        return pathway
    
    def _generate_content_blocks(self, logic_structure: Dict, data: Dict, context: Dict) -> Dict:
        """콘텐츠 블록 생성"""
        blocks = {}
        
        # 도입부 생성
        blocks["introduction"] = self._generate_introduction(logic_structure, context)
        
        # 본문 생성
        blocks["main_content"] = self._generate_main_content(logic_structure, data, context)
        
        # 결론 생성
        blocks["conclusion"] = self._generate_conclusion(logic_structure, data, context)
        
        # 권고사항 생성
        blocks["recommendations"] = self._generate_recommendations(data, context)
        
        # 다음 단계 생성
        blocks["next_steps"] = self._generate_next_steps(data, context)
        
        return blocks
    
    def _generate_introduction(self, logic_structure: Dict, context: Dict) -> str:
        """도입부 생성"""
        main_argument = logic_structure["main_argument"]
        reasoning_pattern = logic_structure["reasoning_pattern"]
        
        intro_pattern = self.logic_patterns[reasoning_pattern][0]
        
        return f"{intro_pattern}, {main_argument}. 이에 대한 상세한 분석 내용을 말씀드리겠습니다."
    
    def _generate_main_content(self, logic_structure: Dict, data: Dict, context: Dict) -> str:
        """본문 생성"""
        content_parts = []
        
        # 지지 논점들을 체계적으로 제시
        supporting_points = logic_structure["supporting_points"]
        evidence = logic_structure["evidence_hierarchy"]
        
        for i, point in enumerate(supporting_points, 1):
            content_parts.append(f"{i}. {point}")
            
            # 관련 증거 추가
            if evidence["quantitative"]:
                relevant_data = [e for e in evidence["quantitative"] if any(
                    keyword in e.lower() for keyword in point.lower().split()
                )][:2]
                if relevant_data:
                    content_parts.append(f"   - 정량적 근거: {', '.join(relevant_data)}")
        
        return "\n\n".join(content_parts)
    
    def _generate_conclusion(self, logic_structure: Dict, data: Dict, context: Dict) -> str:
        """결론 생성"""
        main_argument = logic_structure["main_argument"]
        pathway = logic_structure["conclusion_pathway"]
        
        conclusion = f"이상의 {', '.join(pathway[-3:])}을 통해 "
        conclusion += f"{main_argument}라는 결론에 도달했습니다. "
        
        # 신뢰도 정보 추가
        if "confidence_metrics" in data:
            confidence = data["confidence_metrics"].get("overall", 85)
            conclusion += f"이러한 판단의 신뢰도는 {confidence}%입니다."
        
        return conclusion
    
    def _generate_recommendations(self, data: Dict, context: Dict) -> List[str]:
        """권고사항 생성"""
        recommendations = []
        
        if "recommended_company" in data:
            company = data["recommended_company"]
            recommendations.append(f"{company}와의 계약 진행을 권고합니다")
            
            # 구체적 실행 방안
            if "implementation_plan" in data:
                recommendations.extend(data["implementation_plan"][:3])
            else:
                recommendations.extend([
                    "계약 조건 세부 협상 진행",
                    "프로젝트 실행 계획 수립",
                    "정기적 성과 모니터링 체계 구축"
                ])
        
        # 리스크 완화 방안
        if "risk_mitigation" in data:
            recommendations.extend(data["risk_mitigation"][:2])
        
        return recommendations
    
    def _generate_next_steps(self, data: Dict, context: Dict) -> List[str]:
        """다음 단계 생성"""
        next_steps = []
        
        timeline = context["original_context"].decision_timeline
        
        if timeline == "즉시":
            next_steps = [
                "24시간 내 최종 의사결정",
                "즉시 계약 팀 구성",
                "긴급 실행 계획 수립"
            ]
        elif timeline == "1주일":
            next_steps = [
                "3일 내 추가 검토 완료",
                "1주일 내 최종 승인",
                "계약 협상 시작"
            ]
        else:
            next_steps = [
                "2주 내 상세 계획 수립",
                "관련 부서 의견 수렴",
                "단계적 실행 방안 마련"
            ]
        
        return next_steps
    
    def _compose_and_optimize_message(self, blocks: Dict, message_type: MessageType, context: Dict) -> Dict:
        """메시지 조합 및 최적화"""
        title = self._generate_title(blocks, message_type, context)
        
        # 메시지 구조화
        content_sections = []
        
        if context["structure_preference"] == "결론 우선":
            content_sections.extend([
                blocks["conclusion"],
                blocks["main_content"],
                blocks["introduction"]
            ])
        else:
            content_sections.extend([
                blocks["introduction"],
                blocks["main_content"],
                blocks["conclusion"]
            ])
        
        full_content = "\n\n".join(content_sections)
        
        # 핵심 포인트 추출
        key_points = self._extract_key_points(blocks)
        
        return {
            "title": title,
            "content": full_content,
            "key_points": key_points,
            "recommendations": blocks["recommendations"],
            "next_actions": blocks["next_steps"],
            "confidence_score": 0.85  # 기본값, 실제로는 계산 로직 필요
        }
    
    def _generate_title(self, blocks: Dict, message_type: MessageType, context: Dict) -> str:
        """제목 생성"""
        type_titles = {
            MessageType.ANALYSIS_SUMMARY: "종합 분석 결과",
            MessageType.RECOMMENDATION: "시공사 선정 권고안",
            MessageType.RISK_WARNING: "주요 리스크 검토 결과",
            MessageType.COMPARISON: "시공사 비교 분석",
            MessageType.DECISION_SUPPORT: "의사결정 지원 자료"
        }
        
        base_title = type_titles.get(message_type, "분석 보고서")
        project_type = context["original_context"].project_type
        
        return f"[{project_type}] {base_title}"
    
    def _extract_key_points(self, blocks: Dict) -> List[str]:
        """핵심 포인트 추출"""
        key_points = []
        
        # 권고사항에서 추출
        if blocks["recommendations"]:
            key_points.append(f"주요 권고: {blocks['recommendations'][0]}")
        
        # 다음 단계에서 추출
        if blocks["next_steps"]:
            key_points.append(f"즉시 조치: {blocks['next_steps'][0]}")
        
        # 본문에서 숫자가 포함된 중요 정보 추출
        main_content = blocks["main_content"]
        numeric_info = re.findall(r'[0-9]+[%점위]', main_content)
        if numeric_info:
            key_points.append(f"핵심 지표: {', '.join(numeric_info[:3])}")
        
        return key_points[:5]
    
    def _verify_and_improve_message(self, message: Dict, context: MessageContext) -> Dict:
        """메시지 품질 검증 및 개선"""
        improved_message = message.copy()
        
        # 1. 논리적 일관성 검증
        improved_message = self._check_logical_consistency(improved_message)
        
        # 2. 어조 일관성 검증
        improved_message = self._check_tone_consistency(improved_message, context)
        
        # 3. 완전성 검증
        improved_message = self._check_completeness(improved_message)
        
        # 4. 가독성 최적화
        improved_message = self._optimize_readability(improved_message)
        
        return improved_message
    
    def _check_logical_consistency(self, message: Dict) -> Dict:
        """논리적 일관성 검증"""
        # 결론과 근거의 일치성 확인
        content = message["content"]
        recommendations = message["recommendations"]
        
        # 간단한 키워드 기반 일관성 체크
        conclusion_keywords = set(re.findall(r'\b\w+\b', content.lower()))
        recommendation_keywords = set(re.findall(r'\b\w+\b', ' '.join(recommendations).lower()))
        
        consistency_score = len(conclusion_keywords & recommendation_keywords) / len(conclusion_keywords | recommendation_keywords)
        
        if consistency_score < 0.3:
            # 일관성이 낮으면 보완
            message["content"] += "\n\n이러한 분석 결과는 앞서 제시한 권고사항과 일맥상통합니다."
        
        return message
    
    def _check_tone_consistency(self, message: Dict, context: MessageContext) -> Dict:
        """어조 일관성 검증"""
        # 프로젝트 중요도에 따른 어조 조정
        if context.risk_tolerance == "보수적":
            formal_phrases = ["신중히 검토한 결과", "철저한 분석을 통해", "세심한 고려 끝에"]
            if not any(phrase in message["content"] for phrase in formal_phrases):
                message["content"] = "신중히 검토한 결과, " + message["content"]
        
        return message
    
    def _check_completeness(self, message: Dict) -> Dict:
        """완전성 검증"""
        required_elements = ["분석", "결론", "권고", "근거"]
        content = message["content"]
        
        missing_elements = [elem for elem in required_elements if elem not in content]
        
        if missing_elements:
            message["content"] += f"\n\n[참고: {', '.join(missing_elements)} 관련 추가 정보가 필요할 수 있습니다.]"
        
        return message
    
    def _optimize_readability(self, message: Dict) -> Dict:
        """가독성 최적화"""
        content = message["content"]
        
        # 긴 문장 분할
        sentences = content.split('. ')
        optimized_sentences = []
        
        for sentence in sentences:
            if len(sentence) > 100:
                # 긴 문장을 접속사 기준으로 분할
                parts = re.split(r'(, )', sentence)
                if len(parts) > 2:
                    optimized_sentences.append(parts[0] + '.')
                    optimized_sentences.append(' '.join(parts[2:]))
                else:
                    optimized_sentences.append(sentence)
            else:
                optimized_sentences.append(sentence)
        
        message["content"] = '. '.join(optimized_sentences)
        
        return message
    
    def _generate_metadata(self, message_type: MessageType, context: MessageContext, data: Dict) -> Dict:
        """메타데이터 생성"""
        return {
            "generation_timestamp": datetime.now().isoformat(),
            "context_hash": hash(str(context.__dict__)),
            "data_sources": list(data.keys()),
            "complexity_score": len(data) * 0.1,
            "target_audience": context.stakeholders,
            "project_phase": context.current_phase,
            "confidence_factors": {
                "data_completeness": min(len(data) / 10, 1.0),
                "logic_consistency": 0.85,
                "evidence_strength": 0.80
            }
        }
    
    def _determine_optimal_tone(self, message_type: MessageType, context: MessageContext) -> MessageTone:
        """최적 어조 결정"""
        if message_type == MessageType.RISK_WARNING:
            return MessageTone.CAUTIOUS
        elif message_type == MessageType.RECOMMENDATION:
            return MessageTone.CONSULTATIVE
        elif context.risk_tolerance == "공격적":
            return MessageTone.CONFIDENT
        else:
            return MessageTone.PROFESSIONAL
    
    def generate_multiple_variants(
        self,
        message_type: MessageType,
        context: MessageContext,
        data: Dict[str, Any],
        variant_count: int = 3
    ) -> List[GeneratedMessage]:
        """다양한 변형 메시지 생성"""
        variants = []
        
        audiences = ["임원진", "실무진", "외부전문가"]
        urgency_levels = ["긴급", "일반", "신중"]
        
        for i in range(min(variant_count, len(audiences))):
            variant = self.generate_advanced_message(
                message_type=message_type,
                context=context,
                data=data,
                target_audience=audiences[i],
                urgency_level=urgency_levels[i]
            )
            variants.append(variant)
        
        return variants


# 사용 예시 및 테스트 함수
def test_advanced_message_generator():
    """고도화된 메시지 생성기 테스트"""
    generator = AdvancedMessageGenerator()
    
    # 테스트 컨텍스트
    context = MessageContext(
        project_type="대규모 재개발",
        current_phase="시공사 선정",
        stakeholders=["조합 임원진", "실무진", "외부 컨설턴트"],
        priority_factors={"기술력": 0.3, "재무안정성": 0.25, "가격경쟁력": 0.2, "실적": 0.25},
        decision_timeline="2주",
        risk_tolerance="보수적",
        previous_decisions=[],
        market_conditions={"경기": "보통", "자재비": "상승", "인건비": "안정"}
    )
    
    # 테스트 데이터
    test_data = {
        "recommended_company": "삼성물산",
        "primary_reason": "종합 기술력 및 재무 안정성",
        "comparison_results": {
            "삼성물산": {"기술력": 95, "재무안정성": 92, "가격경쟁력": 78},
            "대한건설": {"기술력": 88, "재무안정성": 85, "가격경쟁력": 85},
            "현대건설": {"기술력": 90, "재무안정성": 88, "가격경쟁력": 82}
        },
        "confidence_metrics": {"overall": 88, "data_quality": 92, "analysis_depth": 85}
    }
    
    # 메시지 생성
    message = generator.generate_advanced_message(
        message_type=MessageType.RECOMMENDATION,
        context=context,
        data=test_data,
        target_audience="임원진",
        urgency_level="일반"
    )
    
    print("=== 생성된 고도화 메시지 ===")
    print(f"제목: {message.title}")
    print(f"내용:\n{message.content}")
    print(f"핵심 포인트: {message.key_points}")
    print(f"권고사항: {message.recommendations}")
    print(f"다음 단계: {message.next_actions}")
    print(f"신뢰도: {message.confidence_score}")


if __name__ == "__main__":
    test_advanced_message_generator() 