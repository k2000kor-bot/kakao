from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
import json
import logging
import random
from enum import Enum
import re

from chat_conversation_analyzer import ChatConversationAnalyzer, ChatMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ResponseType(Enum):
    """대응 메시지 유형"""
    PERSUASION = "설득"          # 상대방을 설득하는 메시지
    REBUTTAL = "반박"            # 상대방 주장에 반박하는 메시지
    CRITICISM = "비난"           # 상대방을 비판하는 메시지
    INFORMATION = "정보"         # 정보를 제공하는 메시지
    COMPARISON = "비교"          # 대안을 비교하는 메시지
    CONTRACTOR_SUPPORT = "시공사긍정"    # 특정 시공사를 지지하는 메시지
    CONTRACTOR_CRITICISM = "시공사비판"  # 특정 시공사를 비판하는 메시지
    ERROR_CORRECTION = "오류수정"        # 잘못된 정보를 바로잡는 메시지


class OpinionType(Enum):
    """여론 형성 메시지 유형"""
    SUPPORT = "응호"             # 지지, 응원하는 메시지
    AGREEMENT = "동조"           # 동의, 찬성하는 메시지
    APPROVAL = "찬성"            # 명시적 찬성 표명
    POSITIVE = "긍정"            # 긍정적 반응
    OPPOSITION = "반대"          # 반대 의견
    COUNTER = "반대입장"         # 반대 입장 표명
    NEUTRAL = "중립"             # 중립적 입장
    UNRELATED = "무관"           # 주제와 무관한 대화


@dataclass
class ResponseMessage:
    """대응 메시지"""
    message_id: str
    target_person: str
    target_message_id: str
    response_type: ResponseType
    content: str
    tone: str  # formal, casual, aggressive, friendly
    confidence: float
    supporting_evidence: List[str]
    generated_at: datetime


@dataclass
class OpinionMessage:
    """여론 형성 메시지"""
    message_id: str
    opinion_type: OpinionType
    target_message_id: str
    content: str
    tone: str
    intensity: float  # 강도 (0.0 ~ 1.0)
    generated_at: datetime


class ResponseMessageGenerator:
    """대응 메시지 생성기"""
    
    def __init__(self, analyzer: ChatConversationAnalyzer):
        self.analyzer = analyzer
        
        # 메시지 템플릿들
        self.response_templates = self._initialize_response_templates()
        self.opinion_templates = self._initialize_opinion_templates()
        
        # 시공사 정보
        self.contractor_info = self._initialize_contractor_info()
        
        # 톤별 표현 방식
        self.tone_styles = self._initialize_tone_styles()
        
    def _initialize_response_templates(self) -> Dict[ResponseType, List[str]]:
        """대응 메시지 템플릿 초기화"""
        return {
            ResponseType.PERSUASION: [
                "{person}님, {point}에 대해 다시 한번 생각해보시면 어떨까요? {evidence}를 고려할 때 {conclusion}가 더 합리적인 선택이라고 생각합니다.",
                "{person}님께서 말씀하신 {concern}에 대한 우려는 충분히 이해합니다. 하지만 {counterpoint}를 고려하면 {proposal}이 더 현명한 방향이 아닐까 합니다.",
                "{person}님, {supporting_fact}라는 사실을 보면 {recommendation}을 검토해보시는 것이 좋겠습니다. 조합원들의 이익을 위해서도 신중한 판단이 필요합니다.",
                "존경하는 {person}님, {current_situation}인 현재 상황에서 {alternative}을 고려해보시면 어떨까요? {benefit}라는 장점이 있어 보입니다."
            ],
            ResponseType.REBUTTAL: [
                "{person}님의 의견에 일부 동의하지만, {counterargument}라는 점에서는 다른 견해를 가지고 있습니다. {evidence}를 보면 오히려 {conclusion}가 맞다고 봅니다.",
                "{person}님께서 {original_claim}라고 말씀하셨는데, 실제로는 {corrected_fact}입니다. {supporting_data}를 확인해보시면 명확합니다.",
                "{person}님, {misunderstanding}에 대해서는 다르게 볼 여지가 있습니다. {alternative_view}라는 관점도 고려해야 하지 않을까요?",
                "죄송하지만 {person}님의 {statement}에 대해서는 동의하기 어렵습니다. {reason}이기 때문입니다."
            ],
            ResponseType.CRITICISM: [
                "{person}님의 {behavior}는 조합원들에게 도움이 되지 않습니다. {specific_issue}로 인해 많은 분들이 우려하고 있습니다.",
                "{person}님께서 계속 {problematic_stance}를 고집하시는 것은 사업 진행에 장애가 됩니다. 좀 더 건설적인 자세가 필요합니다.",
                "{person}님의 {action}은 조합의 단합을 해치는 행위입니다. {consequence}를 초래할 수 있어 심각하게 우려됩니다.",
                "{person}님, {criticism_point}에 대해서는 정말 실망스럽습니다. 조합원으로서 책임감을 가져주셨으면 합니다."
            ],
            ResponseType.INFORMATION: [
                "{person}님, {topic}에 대해 정확한 정보를 공유드립니다. {fact1}, {fact2}, {fact3}입니다. 참고하시기 바랍니다.",
                "{person}님께서 문의하신 {question}에 대한 답변입니다. {detailed_answer}이며, 추가 자료는 {source}에서 확인 가능합니다.",
                "{topic}에 대한 최신 정보를 업데이트해드립니다. {update_info}이므로 모든 조합원분들께 알려드립니다.",
                "{person}님, {subject}관련해서 {authority}에서 발표한 공식 자료를 공유합니다. {official_info}입니다."
            ],
            ResponseType.COMPARISON: [
                "{option1}과 {option2}를 비교해보면, {criteria1}에서는 {option1}이 {advantage1}하고, {criteria2}에서는 {option2}가 {advantage2}합니다.",
                "{person}님께서 제안하신 {proposal1}과 기존 {proposal2}를 비교 분석했습니다. {comparison_result}이므로 {recommendation}을 권합니다.",
                "두 가지 대안의 장단점을 정리하면: {option1}은 {pros1} 하지만 {cons1}이고, {option2}는 {pros2} 하지만 {cons2}입니다.",
                "{alternatives}에 대한 객관적 비교 결과, {best_option}이 {reasons}로 인해 가장 적합한 것으로 판단됩니다."
            ],
            ResponseType.CONTRACTOR_SUPPORT: [
                "{contractor}는 {strength1}, {strength2}, {strength3} 등의 강점을 가지고 있어 우리 사업에 최적의 선택이라고 생각합니다.",
                "{contractor}의 {track_record}를 보면 신뢰할 수 있는 파트너입니다. {specific_case}에서도 우수한 성과를 보여주었습니다.",
                "{person}님, {contractor}에 대한 우려를 표하셨지만, {positive_aspect}를 고려하면 좋은 선택이라고 봅니다.",
                "{contractor} 선정을 지지합니다. {technical_capability}, {financial_stability}, {construction_quality} 면에서 검증된 업체입니다."
            ],
            ResponseType.CONTRACTOR_CRITICISM: [
                "{contractor}의 {weakness}는 심각한 문제입니다. {specific_issue}로 인해 다른 현장에서도 문제가 되었습니다.",
                "{person}님께서 {contractor}를 추천하셨지만, {negative_record}를 고려하면 재검토가 필요합니다.",
                "{contractor}는 {problem1}, {problem2} 등의 이슈가 있어 우리 사업에 적합하지 않다고 판단됩니다.",
                "{contractor} 선정에 반대합니다. {risk_factor}라는 위험 요소가 너무 큽니다."
            ],
            ResponseType.ERROR_CORRECTION: [
                "{person}님, {incorrect_info}라고 말씀하셨는데 정확한 정보는 {correct_info}입니다. {source}에서 확인 가능합니다.",
                "{person}님께서 {misstatement}라고 하셨지만, 실제로는 {actual_fact}입니다. 오해를 바로잡기 위해 정정합니다.",
                "{topic}에 대한 잘못된 정보가 유포되고 있습니다. 정확한 사실은 {correction}이므로 참고하시기 바랍니다.",
                "{person}님의 {claim}은 {factual_error}로 인한 오해입니다. {explanation}이므로 이해해주시기 바랍니다."
            ]
        }
        
    def _initialize_opinion_templates(self) -> Dict[OpinionType, List[str]]:
        """여론 형성 메시지 템플릿 초기화"""
        return {
            OpinionType.SUPPORT: [
                "완전 공감합니다! {point}에 대해서는 적극 지지합니다.",
                "맞습니다! {statement}라는 말씀에 100% 동의합니다.",
                "{person}님 의견에 전적으로 찬성합니다. {reason}이기 때문입니다.",
                "저도 {person}님과 같은 생각입니다. {supporting_point}네요.",
                "{person}님 말씀이 정말 옳습니다. {agreement_reason}라고 봅니다."
            ],
            OpinionType.AGREEMENT: [
                "동감합니다. {point}는 정말 중요한 문제네요.",
                "그렇게 생각합니다. {reasoning}이 맞다고 봅니다.",
                "좋은 지적입니다. {issue}에 대해서는 저도 같은 의견입니다.",
                "맞는 말씀입니다. {situation}을 고려하면 당연합니다.",
                "공감가는 말씀입니다. {shared_concern}이 우려되네요."
            ],
            OpinionType.APPROVAL: [
                "찬성표 던집니다! {proposal}가 최선의 선택이라고 봅니다.",
                "적극 찬성합니다. {benefit}를 위해서라도 추진해야 합니다.",
                "저는 찬성합니다. {justification}이므로 지지합니다.",
                "찬성의견 추가합니다. {supporting_reason}네요.",
                "완전 찬성! {positive_aspect}가 너무 좋습니다."
            ],
            OpinionType.POSITIVE: [
                "좋은 의견이네요! {positive_point}가 인상적입니다.",
                "긍정적으로 봅니다. {hopeful_aspect}이 기대됩니다.",
                "괜찮은 방향이라고 생각합니다. {advantage}가 있어 보이네요.",
                "좋은 제안입니다. {merit}라는 장점이 있습니다.",
                "긍정적인 변화가 될 것 같습니다. {benefit}을 기대합니다."
            ],
            OpinionType.OPPOSITION: [
                "반대 의견입니다. {concern}이 걱정됩니다.",
                "다른 생각입니다. {alternative_view}를 고려해봐야 합니다.",
                "반대합니다. {risk}라는 위험이 너무 큽니다.",
                "동의하기 어렵습니다. {problem}이 문제가 될 수 있습니다.",
                "다시 생각해봐야 할 것 같습니다. {issue}가 우려됩니다."
            ],
            OpinionType.COUNTER: [
                "정반대 입장입니다. {counter_argument}라고 봅니다.",
                "완전히 다른 의견입니다. {opposing_view}가 맞다고 생각합니다.",
                "반대 입장을 취합니다. {counter_reason}이기 때문입니다.",
                "정반대로 생각합니다. {alternative_solution}이 더 좋습니다.",
                "반대편에 서겠습니다. {opposition_reason}으로 인해서입니다."
            ],
            OpinionType.NEUTRAL: [
                "중립적으로 봅니다. {both_sides}를 고려해야겠네요.",
                "어느 쪽이든 상관없습니다. {neutral_point}라고 생각합니다.",
                "중간 입장입니다. {balanced_view}가 필요합니다.",
                "양쪽 다 일리가 있네요. {compromise}를 찾아봐야겠습니다.",
                "중립을 지키겠습니다. {objective_view}로 봐야겠어요."
            ],
            OpinionType.UNRELATED: [
                "그런데 {off_topic}는 어떻게 되고 있나요?",
                "이야기가 나온 김에 {different_topic}도 논의해봐야겠네요.",
                "관련해서 {tangent}도 중요한 문제입니다.",
                "다른 얘기지만 {unrelated_concern}도 걱정이네요.",
                "주제와는 다르지만 {side_issue}는 어떻게 보시나요?"
            ]
        }
        
    def _initialize_contractor_info(self) -> Dict[str, Dict[str, Any]]:
        """시공사 정보 초기화"""
        return {
            "현대건설": {
                "strengths": ["뛰어난 시공 품질", "풍부한 재건축 경험", "우수한 브랜드 가치", "안정적인 재무구조"],
                "weaknesses": ["높은 시공비", "까다로운 계약 조건"],
                "cases": ["힐스테이트", "아이파크", "디에이치"],
                "reputation": "최고급",
                "specialty": "초고층 아파트"
            },
            "대우건설": {
                "strengths": ["합리적인 시공비", "신속한 공사 진행", "유연한 협상 자세", "중소규모 사업 특화"],
                "weaknesses": ["상대적으로 낮은 브랜드 인지도", "일부 품질 이슈"],
                "cases": ["푸르지오", "트럼프월드"],
                "reputation": "준고급",
                "specialty": "중소규모 재건축"
            },
            "삼성물산": {
                "strengths": ["혁신적인 기술력", "프리미엄 브랜드", "완벽한 마감", "친환경 건설"],
                "weaknesses": ["매우 높은 시공비", "선별적 사업 참여"],
                "cases": ["래미안", "삼성타워팰리스"],
                "reputation": "초프리미엄",
                "specialty": "프리미엄 아파트"
            },
            "GS건설": {
                "strengths": ["안정적인 시공 품질", "합리적인 가격", "체계적인 사업 관리", "다양한 평형 설계"],
                "weaknesses": ["상대적으로 평범한 브랜드", "디자인 아쉬움"],
                "cases": ["자이", "GS타워"],
                "reputation": "중고급",
                "specialty": "대단지 아파트"
            }
        }
        
    def _initialize_tone_styles(self) -> Dict[str, Dict[str, Any]]:
        """톤별 표현 스타일 초기화"""
        return {
            "formal": {
                "greeting": ["님", "님께서", "존경하는"],
                "ending": ["합니다", "바랍니다", "생각합니다"],
                "conjunctions": ["하지만", "그러나", "또한"],
                "modifiers": ["정중히", "신중히", "객관적으로"]
            },
            "casual": {
                "greeting": ["", "님", ""],
                "ending": ["네요", "어요", "습니다"],
                "conjunctions": ["그런데", "근데", "그리고"],
                "modifiers": ["좀", "정말", "진짜"]
            },
            "aggressive": {
                "greeting": ["", "님은", "님께서는"],
                "ending": ["니다", "습니다", "어야 합니다"],
                "conjunctions": ["하지만", "그러나", "절대로"],
                "modifiers": ["명백히", "확실히", "분명히"]
            },
            "friendly": {
                "greeting": ["님", "님~", ""],
                "ending": ["요", "네요", "죠"],
                "conjunctions": ["그런데", "근데", "그리고"],
                "modifiers": ["정말", "참", "제법"]
            }
        }
        
    def generate_response_message(self, target_message: ChatMessage, 
                                response_type: ResponseType,
                                tone: str = "formal",
                                custom_points: List[str] = None) -> ResponseMessage:
        """대응 메시지 생성"""
        
        # 타겟 메시지 분석
        message_analysis = self._analyze_target_message(target_message)
        
        # 적절한 템플릿 선택
        templates = self.response_templates[response_type]
        template = random.choice(templates)
        
        # 메시지 내용 생성
        content = self._generate_response_content(
            template, target_message, message_analysis, response_type, tone, custom_points
        )
        
        # 지지 근거 생성
        supporting_evidence = self._generate_supporting_evidence(
            target_message, response_type, message_analysis
        )
        
        # 신뢰도 계산
        confidence = self._calculate_response_confidence(
            target_message, response_type, message_analysis
        )
        
        response = ResponseMessage(
            message_id=f"resp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}",
            target_person=target_message.sender,
            target_message_id=target_message.message_id,
            response_type=response_type,
            content=content,
            tone=tone,
            confidence=confidence,
            supporting_evidence=supporting_evidence,
            generated_at=datetime.now()
        )
        
        return response
        
    def generate_opinion_messages(self, target_message: ChatMessage,
                                opinion_types: List[OpinionType],
                                count_per_type: int = 2) -> List[OpinionMessage]:
        """여론 형성 메시지들 생성"""
        
        opinion_messages = []
        
        for opinion_type in opinion_types:
            for i in range(count_per_type):
                # 템플릿 선택
                templates = self.opinion_templates[opinion_type]
                template = random.choice(templates)
                
                # 톤과 강도 결정
                tone = random.choice(["casual", "friendly", "formal"])
                intensity = random.uniform(0.5, 1.0) if opinion_type in [
                    OpinionType.SUPPORT, OpinionType.APPROVAL, OpinionType.OPPOSITION
                ] else random.uniform(0.3, 0.7)
                
                # 메시지 내용 생성
                content = self._generate_opinion_content(
                    template, target_message, opinion_type, tone, intensity
                )
                
                opinion_message = OpinionMessage(
                    message_id=f"opinion_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}_{random.randint(100, 999)}",
                    opinion_type=opinion_type,
                    target_message_id=target_message.message_id,
                    content=content,
                    tone=tone,
                    intensity=intensity,
                    generated_at=datetime.now()
                )
                
                opinion_messages.append(opinion_message)
                
        return opinion_messages
        
    def _analyze_target_message(self, message: ChatMessage) -> Dict[str, Any]:
        """타겟 메시지 분석"""
        analysis = {
            "keywords": [],
            "sentiment": message.sentiment,
            "topic": message.topic_category,
            "length": len(message.content),
            "mentioned_contractors": [],
            "claims": [],
            "factual_statements": [],
            "opinions": [],
            "concerns": [],
            "proposals": []
        }
        
        content = message.content
        
        # 키워드 추출
        for category, keywords in self.analyzer.topic_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    analysis["keywords"].append(keyword)
                    
        # 시공사 언급 확인
        for contractor in self.contractor_info.keys():
            if contractor in content:
                analysis["mentioned_contractors"].append(contractor)
                
        # 주장, 사실, 의견, 우려, 제안 구분 (간단한 패턴 매칭)
        if "라고 생각합니다" in content or "다고 봅니다" in content:
            analysis["opinions"].append(content)
        elif "입니다" in content or "습니다" in content:
            analysis["factual_statements"].append(content)
        elif "우려" in content or "걱정" in content or "문제" in content:
            analysis["concerns"].append(content)
        elif "제안" in content or "추천" in content or "어떨까요" in content:
            analysis["proposals"].append(content)
        else:
            analysis["claims"].append(content)
            
        return analysis
        
    def _generate_response_content(self, template: str, target_message: ChatMessage,
                                 analysis: Dict[str, Any], response_type: ResponseType,
                                 tone: str, custom_points: List[str] = None) -> str:
        """대응 메시지 내용 생성"""
        
        # 템플릿 변수 준비
        variables = {
            "person": target_message.sender
        }
        
        # 응답 유형별 변수 생성
        if response_type == ResponseType.PERSUASION:
            variables.update(self._generate_persuasion_variables(target_message, analysis))
        elif response_type == ResponseType.REBUTTAL:
            variables.update(self._generate_rebuttal_variables(target_message, analysis))
        elif response_type == ResponseType.CRITICISM:
            variables.update(self._generate_criticism_variables(target_message, analysis))
        elif response_type == ResponseType.INFORMATION:
            variables.update(self._generate_information_variables(target_message, analysis))
        elif response_type == ResponseType.COMPARISON:
            variables.update(self._generate_comparison_variables(target_message, analysis))
        elif response_type in [ResponseType.CONTRACTOR_SUPPORT, ResponseType.CONTRACTOR_CRITICISM]:
            variables.update(self._generate_contractor_variables(target_message, analysis, response_type))
        elif response_type == ResponseType.ERROR_CORRECTION:
            variables.update(self._generate_correction_variables(target_message, analysis))
            
        # 커스텀 포인트 추가
        if custom_points:
            variables["custom_point"] = random.choice(custom_points)
            
        # 톤 스타일 적용
        content = self._apply_tone_style(template, variables, tone)
        
        return content
        
    def _generate_persuasion_variables(self, message: ChatMessage, analysis: Dict[str, Any]) -> Dict[str, str]:
        """설득 메시지 변수 생성"""
        return {
            "point": "재개발 사업의 성공적 추진",
            "evidence": "다른 성공 사례들과 전문가 의견",
            "conclusion": "신중한 검토와 합리적 선택",
            "concern": "조합원들의 우려사항",
            "counterpoint": "장기적 관점에서의 이익",
            "proposal": "단계적 추진 방안",
            "supporting_fact": "시장 상황과 정책 동향",
            "recommendation": "전문가 자문을 통한 검토",
            "current_situation": "현재의 부동산 시장 상황",
            "alternative": "다양한 대안책",
            "benefit": "조합원 전체의 이익 증대"
        }
        
    def _generate_rebuttal_variables(self, message: ChatMessage, analysis: Dict[str, Any]) -> Dict[str, str]:
        """반박 메시지 변수 생성"""
        return {
            "counterargument": "다른 관점에서의 접근",
            "evidence": "객관적인 데이터와 사실",
            "conclusion": "보다 정확한 판단",
            "original_claim": message.content[:50] + "...",
            "corrected_fact": "실제 확인된 정보",
            "supporting_data": "공식 자료와 통계",
            "misunderstanding": "일부 오해의 소지",
            "alternative_view": "다른 각도에서의 해석",
            "statement": "해당 주장",
            "reason": "명확한 근거와 사실에 기반"
        }
        
    def _generate_criticism_variables(self, message: ChatMessage, analysis: Dict[str, Any]) -> Dict[str, str]:
        """비난 메시지 변수 생성"""
        return {
            "behavior": "일관성 없는 태도",
            "specific_issue": "조합 운영의 투명성 문제",
            "problematic_stance": "비합리적인 주장",
            "action": "독단적인 결정",
            "consequence": "조합원 간의 갈등 심화",
            "criticism_point": "책임감 부족"
        }
        
    def _generate_information_variables(self, message: ChatMessage, analysis: Dict[str, Any]) -> Dict[str, str]:
        """정보 제공 메시지 변수 생성"""
        topic = analysis.get("topic", "재개발")
        return {
            "topic": topic,
            "fact1": f"{topic} 관련 최신 법령 개정사항",
            "fact2": f"{topic} 진행 일정과 단계",
            "fact3": f"{topic} 예상 효과와 주의사항",
            "question": "문의하신 사항",
            "detailed_answer": "전문가 검토를 통한 정확한 답변",
            "source": "공식 기관 자료",
            "update_info": "최신 진행 상황",
            "subject": topic,
            "authority": "관련 정부 기관",
            "official_info": "공식 발표 내용"
        }
        
    def _generate_comparison_variables(self, message: ChatMessage, analysis: Dict[str, Any]) -> Dict[str, str]:
        """비교 메시지 변수 생성"""
        contractors = analysis.get("mentioned_contractors", ["현대건설", "대우건설"])
        if len(contractors) < 2:
            contractors = ["현대건설", "대우건설"]  # 기본값
            
        return {
            "option1": contractors[0],
            "option2": contractors[1] if len(contractors) > 1 else "GS건설",
            "criteria1": "시공 품질",
            "criteria2": "사업비",
            "advantage1": "우수함",
            "advantage2": "합리적임",
            "proposal1": "A안",
            "proposal2": "B안",
            "comparison_result": "종합적인 검토 결과",
            "recommendation": "신중한 결정",
            "pros1": "높은 품질과 브랜드 가치",
            "cons1": "상대적으로 높은 비용",
            "pros2": "합리적인 비용과 빠른 진행",
            "cons2": "일부 품질상 우려",
            "alternatives": "제시된 대안들",
            "best_option": "최적 선택안",
            "reasons": "종합적인 검토"
        }
        
    def _generate_contractor_variables(self, message: ChatMessage, analysis: Dict[str, Any], response_type: ResponseType) -> Dict[str, str]:
        """시공사 관련 메시지 변수 생성"""
        contractors = analysis.get("mentioned_contractors", ["현대건설"])
        contractor = contractors[0] if contractors else "현대건설"
        
        contractor_data = self.contractor_info.get(contractor, self.contractor_info["현대건설"])
        
        if response_type == ResponseType.CONTRACTOR_SUPPORT:
            return {
                "contractor": contractor,
                "strength1": contractor_data["strengths"][0],
                "strength2": contractor_data["strengths"][1] if len(contractor_data["strengths"]) > 1 else "안정적인 사업 진행",
                "strength3": contractor_data["strengths"][2] if len(contractor_data["strengths"]) > 2 else "우수한 브랜드",
                "track_record": f"{contractor}의 뛰어난 실적",
                "specific_case": contractor_data["cases"][0] if contractor_data["cases"] else "다양한 성공 사례",
                "positive_aspect": contractor_data["specialty"],
                "technical_capability": "검증된 기술력",
                "financial_stability": "안정적인 재무구조",
                "construction_quality": "우수한 시공 품질"
            }
        else:  # CONTRACTOR_CRITICISM
            return {
                "contractor": contractor,
                "weakness": contractor_data["weaknesses"][0] if contractor_data["weaknesses"] else "일부 우려사항",
                "specific_issue": "과거 시공 지연 문제",
                "negative_record": "일부 부정적 사례",
                "problem1": contractor_data["weaknesses"][0] if contractor_data["weaknesses"] else "비용 문제",
                "problem2": contractor_data["weaknesses"][1] if len(contractor_data["weaknesses"]) > 1 else "일정 지연",
                "risk_factor": "예상되는 리스크"
            }
            
    def _generate_correction_variables(self, message: ChatMessage, analysis: Dict[str, Any]) -> Dict[str, str]:
        """오류 수정 메시지 변수 생성"""
        return {
            "incorrect_info": "잘못된 정보",
            "correct_info": "정확한 사실",
            "source": "공식 자료",
            "misstatement": "오해의 소지가 있는 내용",
            "actual_fact": "실제 확인된 사실",
            "topic": analysis.get("topic", "해당 사안"),
            "correction": "정정된 내용",
            "claim": "주장하신 내용",
            "factual_error": "사실과 다른 부분",
            "explanation": "정확한 설명"
        }
        
    def _generate_opinion_content(self, template: str, target_message: ChatMessage,
                                opinion_type: OpinionType, tone: str, intensity: float) -> str:
        """여론 형성 메시지 내용 생성"""
        
        variables = {
            "person": target_message.sender,
            "point": "말씀하신 내용",
            "statement": "의견",
            "reason": "타당한 근거가 있기",
            "supporting_point": "현실적인 대안이",
            "agreement_reason": "합리적인 접근",
            "reasoning": "논리적 판단",
            "issue": "중요한 문제",
            "situation": "현재 상황",
            "shared_concern": "공통된 우려",
            "proposal": "제안사항",
            "benefit": "조합원들의 이익",
            "justification": "충분한 근거가 있기",
            "supporting_reason": "설득력이 있",
            "positive_aspect": "긍정적인 면",
            "positive_point": "건설적인 관점",
            "hopeful_aspect": "희망적인 부분",
            "advantage": "명확한 장점",
            "merit": "분명한 이점",
            "concern": "우려되는 부분",
            "alternative_view": "다른 관점",
            "risk": "잠재적 위험",
            "problem": "예상되는 문제",
            "counter_argument": "반대 논리",
            "opposing_view": "상반된 견해",
            "counter_reason": "반박할 근거가 있기",
            "alternative_solution": "대안",
            "opposition_reason": "반대할 이유",
            "both_sides": "양쪽 입장",
            "neutral_point": "중립적 관점",
            "balanced_view": "균형잡힌 시각",
            "compromise": "절충안",
            "objective_view": "객관적 시각",
            "off_topic": "다른 주제",
            "different_topic": "별개 사안",
            "tangent": "관련 이슈",
            "unrelated_concern": "다른 걱정거리",
            "side_issue": "부수적 문제"
        }
        
        # 강도에 따른 표현 조정
        if intensity > 0.8:
            variables["modifier"] = "정말" if tone == "casual" else "매우"
        elif intensity > 0.6:
            variables["modifier"] = "꽤" if tone == "casual" else "상당히"
        else:
            variables["modifier"] = "어느 정도" if tone == "casual" else "일정 부분"
            
        # 템플릿에 변수 적용
        try:
            content = template.format(**variables)
        except KeyError:
            # 일부 변수가 없는 경우 기본 메시지
            content = template
            for key, value in variables.items():
                content = content.replace(f"{{{key}}}", value)
                
        return content
        
    def _apply_tone_style(self, template: str, variables: Dict[str, str], tone: str) -> str:
        """톤 스타일 적용"""
        style = self.tone_styles.get(tone, self.tone_styles["formal"])
        
        # 변수에 톤 스타일 반영
        styled_variables = variables.copy()
        
        # 존칭 적용
        if "person" in styled_variables:
            greeting = random.choice(style["greeting"])
            styled_variables["person"] = styled_variables["person"] + greeting
            
        # 템플릿에 변수 적용
        try:
            content = template.format(**styled_variables)
        except KeyError:
            content = template
            for key, value in styled_variables.items():
                content = content.replace(f"{{{key}}}", value)
                
        return content
        
    def _generate_supporting_evidence(self, target_message: ChatMessage, 
                                    response_type: ResponseType,
                                    analysis: Dict[str, Any]) -> List[str]:
        """지지 근거 생성"""
        evidence = []
        
        if response_type == ResponseType.INFORMATION:
            evidence = [
                "공식 정부 발표 자료",
                "전문가 의견서",
                "유사 사례 분석 결과",
                "법령 및 규정 근거"
            ]
        elif response_type == ResponseType.COMPARISON:
            evidence = [
                "각 시공사별 시공 실적 비교",
                "비용 대비 효과 분석",
                "기술력 평가 결과",
                "조합원 만족도 조사"
            ]
        elif response_type in [ResponseType.CONTRACTOR_SUPPORT, ResponseType.CONTRACTOR_CRITICISM]:
            contractor = analysis.get("mentioned_contractors", ["현대건설"])[0]
            if response_type == ResponseType.CONTRACTOR_SUPPORT:
                evidence = [
                    f"{contractor}의 우수한 시공 사례",
                    "건설업계 평가 등급",
                    "재무 안정성 지표",
                    "기술력 인증 현황"
                ]
            else:
                evidence = [
                    f"{contractor}의 문제 사례",
                    "업계 내 평판 조사",
                    "과거 분쟁 이력",
                    "리스크 분석 보고서"
                ]
        else:
            evidence = [
                "관련 전문가 의견",
                "객관적 데이터 분석",
                "유사 사례 연구",
                "조합원 의견 수렴 결과"
            ]
            
        return evidence[:3]  # 최대 3개까지
        
    def _calculate_response_confidence(self, target_message: ChatMessage,
                                     response_type: ResponseType,
                                     analysis: Dict[str, Any]) -> float:
        """응답 신뢰도 계산"""
        base_confidence = 0.7
        
        # 메시지 길이에 따른 조정 (더 긴 메시지일수록 분석이 정확)
        length_factor = min(len(target_message.content) / 200, 0.2)
        
        # 키워드 일치도에 따른 조정
        keyword_factor = min(len(analysis["keywords"]) * 0.05, 0.15)
        
        # 응답 유형별 조정
        type_factors = {
            ResponseType.INFORMATION: 0.9,
            ResponseType.COMPARISON: 0.85,
            ResponseType.ERROR_CORRECTION: 0.95,
            ResponseType.CONTRACTOR_SUPPORT: 0.8,
            ResponseType.CONTRACTOR_CRITICISM: 0.75,
            ResponseType.PERSUASION: 0.7,
            ResponseType.REBUTTAL: 0.65,
            ResponseType.CRITICISM: 0.6
        }
        
        type_factor = type_factors.get(response_type, 0.7)
        
        confidence = base_confidence + length_factor + keyword_factor
        confidence = confidence * type_factor
        
        return min(max(confidence, 0.5), 0.95)


# 사용 예시
if __name__ == "__main__":
    from chat_conversation_analyzer import ChatConversationAnalyzer
    
    # 분석기와 생성기 초기화
    analyzer = ChatConversationAnalyzer()
    generator = ResponseMessageGenerator(analyzer)
    
    # 샘플 메시지
    sample_message = ChatMessage(
        message_id="msg_001",
        chat_room="개포우성7차",
        sender="김조합장",
        content="현대건설로 시공사를 결정하는 것에 대해 어떻게 생각하시나요? 분담금이 너무 높아질 것 같아 걱정됩니다.",
        timestamp=datetime.now(),
        message_type="text",
        sentiment="neutral",
        topic_category="시공사"
    )
    
    print("🗣️ 대응 메시지 생성 테스트")
    print("=" * 50)
    
    # 1. 설득 메시지 생성
    persuasion_msg = generator.generate_response_message(
        sample_message, ResponseType.PERSUASION, tone="formal"
    )
    print(f"📢 설득 메시지 ({persuasion_msg.confidence:.1%} 신뢰도):")
    print(f"   {persuasion_msg.content}")
    
    # 2. 정보 제공 메시지 생성
    info_msg = generator.generate_response_message(
        sample_message, ResponseType.INFORMATION, tone="formal"
    )
    print(f"\n📊 정보 제공 ({info_msg.confidence:.1%} 신뢰도):")
    print(f"   {info_msg.content}")
    
    # 3. 시공사 지지 메시지 생성
    support_msg = generator.generate_response_message(
        sample_message, ResponseType.CONTRACTOR_SUPPORT, tone="formal"
    )
    print(f"\n👍 시공사 지지 ({support_msg.confidence:.1%} 신뢰도):")
    print(f"   {support_msg.content}")
    
    # 4. 여론 형성 메시지들 생성
    opinion_types = [OpinionType.SUPPORT, OpinionType.AGREEMENT, OpinionType.OPPOSITION]
    opinion_messages = generator.generate_opinion_messages(
        sample_message, opinion_types, count_per_type=1
    )
    
    print(f"\n🗳️ 여론 형성 메시지들:")
    for msg in opinion_messages:
        print(f"   [{msg.opinion_type.value}] {msg.content}")
        
    print(f"\n✅ 총 {len(opinion_messages)}개의 여론 메시지 생성 완료!") 