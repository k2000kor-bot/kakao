from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
from collections import defaultdict, Counter
import logging
import re
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PoliticalFigureProfile:
    """정치인 프로필"""
    name: str
    political_stance: str
    communication_style: str
    signature_phrases: List[str]
    argumentation_patterns: List[str]
    vocabulary_preferences: List[str]
    logical_structures: List[str]
    emotional_expressions: List[str]
    cultural_references: List[str]
    expertise_areas: List[str]
    speech_rhythm: str
    formality_level: str


@dataclass
class StyledMessage:
    """스타일 적용된 메시지"""
    message_id: str
    content: str
    style_source: str
    confidence_score: float
    style_elements_used: List[str]
    authenticity_score: float


class PoliticalStyleGenerator:
    """정치인 스타일 메시지 생성기"""
    
    def __init__(self):
        self.political_figures = self._initialize_political_figures()
        
    def _initialize_political_figures(self) -> Dict[str, PoliticalFigureProfile]:
        """정치인들의 언어 스타일 데이터 초기화"""
        
        figures = {}
        
        # 유시민 스타일
        figures["유시민"] = PoliticalFigureProfile(
            name="유시민",
            political_stance="진보적_합리주의",
            communication_style="논리적_설득형",
            signature_phrases=[
                "제가 보기에는",
                "상식적으로 생각해보면",
                "논리적으로 따져보면",
                "합리적인 판단이라면",
                "객관적 사실은",
                "이성적으로 접근하면",
                "데이터를 보면",
                "경험상 말씀드리면"
            ],
            argumentation_patterns=[
                "전제 제시 → 논리적 분석 → 결론 도출",
                "현실 인식 → 문제점 지적 → 대안 제시",
                "상식적 관점 → 합리적 접근 → 실용적 해결책"
            ],
            vocabulary_preferences=[
                "합리적", "논리적", "객관적", "상식적", "실용적",
                "데이터", "근거", "분석", "판단", "접근"
            ],
            logical_structures=[
                "A라는 상황에서 B가 발생했다면, C라는 결과가 나올 수밖에 없다",
                "첫째로... 둘째로... 따라서...",
                "만약 ~라면, ~일 것이다. 그런데 ~이므로, ~해야 한다"
            ],
            emotional_expressions=[
                "안타깝게도", "다행히", "걱정스럽게도", "희망적으로"
            ],
            cultural_references=[
                "역사적 경험", "선진국 사례", "우리나라 현실"
            ],
            expertise_areas=["경제", "정치", "사회정책", "역사"],
            speech_rhythm="차분하고_체계적",
            formality_level="높음"
        )
        
        # 정준희 스타일  
        figures["정준희"] = PoliticalFigureProfile(
            name="정준희",
            political_stance="보수적_현실주의",
            communication_style="날카로운_분석형",
            signature_phrases=[
                "현실을 직시하면",
                "냉정하게 말씀드리면",
                "사실은 이렇습니다",
                "정확히 짚고 넘어가자면",
                "핵심은 바로 이것입니다",
                "분명히 말씀드리면",
                "실상을 보면",
                "정치적 수사를 걷어내고"
            ],
            argumentation_patterns=[
                "현실 진단 → 문제의 본질 → 해결 방향",
                "사실 확인 → 원인 분석 → 대책 마련",
                "현상 관찰 → 구조적 문제 → 시스템 개선"
            ],
            vocabulary_preferences=[
                "현실적", "실질적", "구체적", "명확한", "정확한",
                "핵심", "본질", "실상", "진실", "팩트"
            ],
            logical_structures=[
                "문제의 핵심은 ~이다. 왜냐하면 ~이기 때문이다",
                "~라는 주장이 있지만, 실제로는 ~이다",
                "겉으로는 ~해 보이지만, 속을 들여다보면 ~이다"
            ],
            emotional_expressions=[
                "냉정하게", "솔직하게", "정직하게", "명료하게"
            ],
            cultural_references=[
                "정치 현실", "언론계 경험", "방송 사례"
            ],
            expertise_areas=["정치", "언론", "사회현상", "미디어"],
            speech_rhythm="명료하고_직설적",
            formality_level="보통"
        )
        
        # 진중권 스타일
        figures["진중권"] = PoliticalFigureProfile(
            name="진중권",
            political_stance="비판적_지성인",
            communication_style="신랄한_비판형",
            signature_phrases=[
                "이건 정말 웃기는 일이다",
                "도대체 무슨 생각인지",
                "이런 식으로는 안 된다",
                "말이 안 되는 소리다",
                "상식 이하의 발상이다",
                "지적 수준을 의심케 한다",
                "철학적으로 접근하면",
                "미학적 관점에서"
            ],
            argumentation_patterns=[
                "모순 지적 → 신랄한 비판 → 올바른 방향 제시",
                "현상 분석 → 본질 파악 → 철학적 성찰",
                "문제 제기 → 구조적 비판 → 대안적 사고"
            ],
            vocabulary_preferences=[
                "모순", "허위", "가식", "본질적", "구조적",
                "철학적", "미학적", "지적", "비판적", "성찰"
            ],
            logical_structures=[
                "~라고 하는데, 이는 명백한 모순이다. 왜냐하면 ~이기 때문이다",
                "겉으로는 ~인 척하지만, 실제로는 ~이다",
                "이런 논리라면 ~도 가능하다는 말인가?"
            ],
            emotional_expressions=[
                "신랄하게", "날카롭게", "통렬하게", "비판적으로"
            ],
            cultural_references=[
                "철학사", "예술사", "서구 문화", "인문학적 소양"
            ],
            expertise_areas=["철학", "미학", "문화비평", "정치비판"],
            speech_rhythm="격정적이고_날카로운",
            formality_level="높음"
        )
        
        # 박형준 스타일
        figures["박형준"] = PoliticalFigureProfile(
            name="박형준",
            political_stance="중도보수_실용주의",
            communication_style="온건한_중재형",
            signature_phrases=[
                "균형잡힌 시각에서",
                "양쪽의 입장을 고려하면",
                "건설적인 방향으로",
                "상호 이해를 바탕으로",
                "협력적 접근이 필요하다",
                "통합적 관점에서",
                "미래지향적으로",
                "실용적 해법을 찾아야"
            ],
            argumentation_patterns=[
                "현황 분석 → 다각도 검토 → 균형잡힌 결론",
                "문제 인식 → 상호 이해 → 협력적 해결",
                "갈등 상황 → 중재 방안 → 윈윈 전략"
            ],
            vocabulary_preferences=[
                "균형", "조화", "협력", "상생", "통합",
                "실용적", "미래지향적", "건설적", "합리적"
            ],
            logical_structures=[
                "~라는 의견도 있고, ~라는 입장도 있다. 따라서 ~하는 것이 바람직하다",
                "양쪽 모두 일리가 있으므로, ~하는 방향으로 접근해야",
                "갈등보다는 협력을, 대립보다는 상생을"
            ],
            emotional_expressions=[
                "온건하게", "차분하게", "신중하게", "협력적으로"
            ],
            cultural_references=[
                "국정 경험", "행정 사례", "정책 현장"
            ],
            expertise_areas=["행정", "정책", "지방자치", "국정운영"],
            speech_rhythm="안정적이고_신중한",
            formality_level="높음"
        )
        
        # 정원책 스타일
        figures["정원책"] = PoliticalFigureProfile(
            name="정원책",
            political_stance="진보적_변혁주의",
            communication_style="열정적_개혁형",
            signature_phrases=[
                "변화가 필요합니다",
                "개혁의 시급성",
                "민주주의의 발전을 위해",
                "시민의 힘으로",
                "정의로운 사회를 향해",
                "진보적 가치를 실현하기 위해",
                "사회적 약자를 위한",
                "역사의 진보를 위해"
            ],
            argumentation_patterns=[
                "현실 비판 → 개혁 필요성 → 변화 방향 제시",
                "문제 제기 → 진보적 가치 → 실천 방안",
                "기득권 비판 → 민주적 대안 → 시민 참여"
            ],
            vocabulary_preferences=[
                "진보", "개혁", "변화", "정의", "평등",
                "민주주의", "시민", "참여", "연대", "변혁"
            ],
            logical_structures=[
                "~한 현실을 바꾸기 위해서는 ~해야 한다",
                "진보적 가치에 따르면 ~이다",
                "민주주의 발전을 위해서는 ~가 필요하다"
            ],
            emotional_expressions=[
                "열정적으로", "적극적으로", "진취적으로", "의욕적으로"
            ],
            cultural_references=[
                "민주화 역사", "시민운동", "진보 정당"
            ],
            expertise_areas=["정치개혁", "민주주의", "시민사회", "진보정치"],
            speech_rhythm="역동적이고_열정적",
            formality_level="보통"
        )
        
        # 이철희 스타일
        figures["이철희"] = PoliticalFigureProfile(
            name="이철희",
            political_stance="현실적_진보주의",
            communication_style="치밀한_분석형",
            signature_phrases=[
                "구체적으로 살펴보면",
                "데이터가 보여주는 것은",
                "정책적 관점에서",
                "실현 가능한 방안은",
                "단계적 접근이 필요하다",
                "체계적으로 준비해야",
                "전문적 검토를 통해",
                "실질적 효과를 고려하면"
            ],
            argumentation_patterns=[
                "현황 파악 → 정책 분석 → 실행 방안",
                "문제 진단 → 전문적 검토 → 단계적 해결",
                "데이터 분석 → 정책 설계 → 실현 전략"
            ],
            vocabulary_preferences=[
                "정책적", "체계적", "단계적", "전문적", "실질적",
                "구체적", "실현가능한", "효과적", "합리적"
            ],
            logical_structures=[
                "~라는 문제를 해결하기 위해서는 ~한 정책이 필요하다",
                "데이터를 분석해보면 ~이므로 ~해야 한다",
                "단계적으로 접근하면 ~, ~, ~ 순으로 진행해야"
            ],
            emotional_expressions=[
                "체계적으로", "꼼꼼하게", "신중하게", "전문적으로"
            ],
            cultural_references=[
                "언론계 경험", "정책 현장", "전문가 네트워크"
            ],
            expertise_areas=["언론", "정책", "경제", "사회분석"],
            speech_rhythm="체계적이고_분석적",
            formality_level="높음"
        )
        
        return figures
        
    def generate_styled_message(self, 
                              style_source: str,
                              target_topic: str,
                              message_intent: str,
                              context: Optional[str] = None) -> StyledMessage:
        """특정 정치인 스타일로 메시지 생성"""
        
        if style_source not in self.political_figures:
            raise ValueError(f"지원하지 않는 스타일: {style_source}")
            
        figure = self.political_figures[style_source]
        
        # 스타일에 맞는 메시지 구조 생성
        message_structure = self._create_message_structure(figure, target_topic, message_intent)
        
        # 어휘와 표현 적용
        styled_content = self._apply_vocabulary_style(message_structure, figure)
        
        # 논리 구조 적용
        final_content = self._apply_logical_structure(styled_content, figure)
        
        # 스타일 요소 추출
        style_elements = self._extract_style_elements(final_content, figure)
        
        # 신뢰도 계산
        confidence = self._calculate_style_confidence(final_content, figure)
        authenticity = self._calculate_authenticity_score(final_content, figure)
        
        return StyledMessage(
            message_id=f"styled_{style_source}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            content=final_content,
            style_source=style_source,
            confidence_score=confidence,
            style_elements_used=style_elements,
            authenticity_score=authenticity
        )
        
    def _create_message_structure(self, 
                                figure: PoliticalFigureProfile,
                                topic: str,
                                intent: str) -> str:
        """메시지 기본 구조 생성"""
        
        # 시작 표현 선택
        opening = random.choice(figure.signature_phrases)
        
        # 주제별 맞춤형 내용 생성
        if "시공사" in topic:
            if figure.name == "유시민":
                core_content = "합리적인 선택 기준을 마련해야 합니다. 데이터와 전문성을 바탕으로 객관적 평가가 필요하다고 봅니다."
            elif figure.name == "정준희":
                core_content = "현실을 직시하면 각 업체의 실적과 신뢰도를 명확히 비교 검토해야 합니다. 정치적 수사보다는 팩트에 기반한 판단이 중요합니다."
            elif figure.name == "진중권":
                core_content = "이런 중요한 결정을 감정이나 선입견으로 한다면 그야말로 상식 이하의 발상입니다. 철학적으로 접근하면 진정한 가치가 무엇인지 성찰해야 합니다."
            elif figure.name == "박형준":
                core_content = "균형잡힌 시각에서 각 업체의 장단점을 꼼꼼히 따져보고, 조합원 모두가 납득할 수 있는 건설적 방향으로 접근해야 합니다."
            elif figure.name == "정원책":
                core_content = "조합원의 권익과 민주적 절차를 최우선으로 고려해야 합니다. 투명하고 정의로운 선택 과정이 무엇보다 중요합니다."
            elif figure.name == "이철희":
                core_content = "구체적으로 살펴보면 각 업체의 기술력, 재무상태, 사후관리 체계를 체계적으로 분석해 단계적으로 결정해야 합니다."
                
        elif "분담금" in topic:
            if figure.name == "유시민":
                core_content = "경제적 합리성과 형평성을 동시에 고려한 분담 방식을 모색해야 합니다. 논리적 근거와 데이터를 바탕으로 접근하는 것이 상식적입니다."
            elif figure.name == "정준희":
                core_content = "냉정하게 말씀드리면 각자의 부담 능력과 수혜 정도를 정확히 계산해서 공정한 분담 기준을 마련해야 합니다."
            elif figure.name == "진중권":
                core_content = "돈 문제를 대충 넘어가자는 식의 안이한 접근은 정말 웃기는 일입니다. 미학적 관점에서도 아름다운 것은 공정함입니다."
            elif figure.name == "박형준":
                core_content = "상호 이해를 바탕으로 각자의 상황을 고려한 합리적 분담 방안을 협력적으로 모색해야 합니다."
            elif figure.name == "정원책":
                core_content = "사회적 약자를 위한 배려와 연대의 정신으로 공정하고 민주적인 분담 체계를 만들어가야 합니다."
            elif figure.name == "이철희":
                core_content = "정책적 관점에서 각종 변수를 체계적으로 분석하고, 실현 가능한 분담 방식을 단계적으로 설계해야 합니다."
        else:
            # 일반적인 내용
            core_content = f"{topic}에 대해 신중한 검토와 합리적 접근이 필요합니다."
            
        # 마무리 표현
        if intent == "제안형":
            closing = "이런 방향으로 접근해보시면 어떨까요?"
        elif intent == "우려형":
            closing = "이 점에 대해 깊이 고민해봐야 할 것 같습니다."
        elif intent == "지지형":
            closing = "적극적으로 지지하는 바입니다."
        else:
            closing = "여러분의 의견을 듣고 싶습니다."
            
        return f"{opening} {core_content} {closing}"
        
    def _apply_vocabulary_style(self, content: str, figure: PoliticalFigureProfile) -> str:
        """어휘 스타일 적용"""
        
        styled_content = content
        
        # 선호 어휘로 대체
        vocabulary_replacements = {
            "생각합니다": random.choice(["판단합니다", "봅니다", "여겨집니다"]),
            "중요한": random.choice(figure.vocabulary_preferences[:3]),
            "필요합니다": "필요하다고 " + random.choice(["봅니다", "생각합니다", "판단됩니다"])
        }
        
        for original, replacement in vocabulary_replacements.items():
            if original in styled_content:
                styled_content = styled_content.replace(original, replacement)
                
        # 감정 표현 추가
        if figure.emotional_expressions:
            emotion = random.choice(figure.emotional_expressions)
            if "말씀드리면" in styled_content:
                styled_content = styled_content.replace("말씀드리면", f"{emotion} 말씀드리면")
                
        return styled_content
        
    def _apply_logical_structure(self, content: str, figure: PoliticalFigureProfile) -> str:
        """논리 구조 적용"""
        
        # 논증 패턴에 따른 구조 조정
        if figure.logical_structures:
            pattern = random.choice(figure.logical_structures)
            
            # 조건문 패턴 적용
            if "만약" in pattern and "따라서" not in content:
                content = content + " 따라서 이런 접근이 바람직하다고 생각합니다."
            elif "첫째" in pattern:
                content = "첫째, " + content + " 둘째, 이를 통해 더 나은 결과를 얻을 수 있을 것입니다."
                
        return content
        
    def _extract_style_elements(self, content: str, figure: PoliticalFigureProfile) -> List[str]:
        """사용된 스타일 요소 추출"""
        
        elements_used = []
        
        # 시그니처 표현 확인
        for phrase in figure.signature_phrases:
            if phrase in content:
                elements_used.append(f"시그니처_표현: {phrase}")
                
        # 선호 어휘 확인
        for vocab in figure.vocabulary_preferences:
            if vocab in content:
                elements_used.append(f"선호_어휘: {vocab}")
                
        # 감정 표현 확인
        for emotion in figure.emotional_expressions:
            if emotion in content:
                elements_used.append(f"감정_표현: {emotion}")
                
        return elements_used
        
    def _calculate_style_confidence(self, content: str, figure: PoliticalFigureProfile) -> float:
        """스타일 신뢰도 계산"""
        
        score = 0.0
        total_checks = 0
        
        # 시그니처 표현 포함 여부
        signature_found = any(phrase in content for phrase in figure.signature_phrases)
        if signature_found:
            score += 0.3
        total_checks += 1
        
        # 어휘 선호도 일치
        vocab_matches = sum(1 for vocab in figure.vocabulary_preferences if vocab in content)
        vocab_score = min(vocab_matches / 3, 1.0) * 0.3
        score += vocab_score
        total_checks += 1
        
        # 논리 구조 일치도
        structure_match = any(pattern_key in content 
                            for pattern in figure.logical_structures 
                            for pattern_key in ["따라서", "만약", "첫째"])
        if structure_match:
            score += 0.2
        total_checks += 1
        
        # 격식 수준 일치
        if figure.formality_level == "높음":
            if any(ending in content for ending in ["습니다", "드립니다"]):
                score += 0.2
        total_checks += 1
        
        return score
        
    def _calculate_authenticity_score(self, content: str, figure: PoliticalFigureProfile) -> float:
        """진정성 점수 계산"""
        
        score = 0.5  # 기본점수
        
        # 커뮤니케이션 스타일 일치도
        style_indicators = {
            "논리적_설득형": ["논리적", "합리적", "객관적"],
            "날카로운_분석형": ["현실", "사실", "정확"],
            "신랄한_비판형": ["모순", "비판", "문제"],
            "온건한_중재형": ["균형", "협력", "상생"],
            "열정적_개혁형": ["변화", "개혁", "진보"],
            "치밀한_분석형": ["구체적", "체계적", "분석"]
        }
        
        if figure.communication_style in style_indicators:
            indicators = style_indicators[figure.communication_style]
            if any(indicator in content for indicator in indicators):
                score += 0.3
                
        # 전문 영역 반영도
        expertise_keywords = {
            "경제": ["경제적", "재정", "비용", "효율"],
            "정치": ["정치적", "정책", "제도", "민주"],
            "사회정책": ["사회적", "복지", "공정", "형평"],
            "철학": ["철학적", "본질", "가치", "진리"],
            "언론": ["사실", "진실", "정보", "소통"]
        }
        
        for area in figure.expertise_areas:
            if area in expertise_keywords:
                keywords = expertise_keywords[area]
                if any(keyword in content for keyword in keywords):
                    score += 0.1
                    
        return min(1.0, score)
        
    def analyze_political_style(self, message: str) -> Dict[str, Any]:
        """메시지의 정치인 스타일 분석"""
        
        style_scores = {}
        
        for name, figure in self.political_figures.items():
            score = 0.0
            
            # 시그니처 표현 매칭
            signature_matches = sum(1 for phrase in figure.signature_phrases if phrase in message)
            score += signature_matches * 0.3
            
            # 어휘 선호도 매칭
            vocab_matches = sum(1 for vocab in figure.vocabulary_preferences if vocab in message)
            score += vocab_matches * 0.2
            
            # 감정 표현 매칭
            emotion_matches = sum(1 for emotion in figure.emotional_expressions if emotion in message)
            score += emotion_matches * 0.15
            
            style_scores[name] = score
            
        # 가장 유사한 스타일 찾기
        best_match = max(style_scores, key=style_scores.get) if style_scores else None
        
        return {
            "style_scores": style_scores,
            "best_match": best_match,
            "confidence": style_scores.get(best_match, 0) if best_match else 0,
            "analysis_elements": {
                "signature_phrases_found": [],
                "vocabulary_matches": [],
                "emotional_expressions": []
            }
        }
        
    def get_available_styles(self) -> List[Dict[str, Any]]:
        """사용 가능한 스타일 목록 반환"""
        
        styles = []
        for name, figure in self.political_figures.items():
            styles.append({
                "name": name,
                "political_stance": figure.political_stance,
                "communication_style": figure.communication_style,
                "expertise_areas": figure.expertise_areas,
                "speech_rhythm": figure.speech_rhythm,
                "sample_phrases": figure.signature_phrases[:3]
            })
            
        return styles
        
    def generate_comparative_messages(self, 
                                    topic: str,
                                    styles: List[str]) -> Dict[str, StyledMessage]:
        """여러 스타일로 동일 주제 메시지 생성"""
        
        comparative_messages = {}
        
        for style in styles:
            if style in self.political_figures:
                message = self.generate_styled_message(
                    style_source=style,
                    target_topic=topic,
                    message_intent="의견형"
                )
                comparative_messages[style] = message
                
        return comparative_messages


# 정치인 스타일 학습 데이터 확장
class PoliticalStyleLearner:
    """정치인 스타일 학습 시스템"""
    
    def __init__(self, style_generator: PoliticalStyleGenerator):
        self.style_generator = style_generator
        
    def learn_from_speech_data(self, politician_name: str, speech_texts: List[str]) -> Dict[str, Any]:
        """연설문/발언 데이터로부터 스타일 학습"""
        
        if politician_name not in self.style_generator.political_figures:
            return {"error": "지원하지 않는 정치인입니다"}
            
        # 패턴 분석
        patterns = self._extract_speech_patterns(speech_texts)
        
        # 기존 프로필 업데이트
        figure = self.style_generator.political_figures[politician_name]
        
        # 새로운 시그니처 표현 추가
        new_signatures = patterns.get("frequent_phrases", [])
        for signature in new_signatures:
            if signature not in figure.signature_phrases:
                figure.signature_phrases.append(signature)
                
        # 어휘 선호도 업데이트
        new_vocab = patterns.get("preferred_vocabulary", [])
        for vocab in new_vocab:
            if vocab not in figure.vocabulary_preferences:
                figure.vocabulary_preferences.append(vocab)
                
        return {
            "success": True,
            "learned_patterns": patterns,
            "updated_elements": {
                "new_signatures": len(new_signatures),
                "new_vocabulary": len(new_vocab)
            }
        }
        
    def _extract_speech_patterns(self, texts: List[str]) -> Dict[str, List[str]]:
        """연설 텍스트에서 패턴 추출"""
        
        patterns = {
            "frequent_phrases": [],
            "preferred_vocabulary": [],
            "logical_connectors": [],
            "emotional_expressions": []
        }
        
        # 빈번한 구문 추출
        phrase_counter = Counter()
        for text in texts:
            # 3~6단어 구문 추출
            words = text.split()
            for i in range(len(words) - 2):
                for length in range(3, 7):
                    if i + length <= len(words):
                        phrase = " ".join(words[i:i+length])
                        if len(phrase) > 10:  # 의미있는 길이
                            phrase_counter[phrase] += 1
                            
        # 빈도 상위 구문들
        patterns["frequent_phrases"] = [phrase for phrase, count in phrase_counter.most_common(10) if count >= 2]
        
        # 선호 어휘 추출
        vocabulary_words = []
        for text in texts:
            words = re.findall(r'[가-힣]+', text)
            vocabulary_words.extend([word for word in words if len(word) >= 3])
            
        vocab_counter = Counter(vocabulary_words)
        patterns["preferred_vocabulary"] = [word for word, count in vocab_counter.most_common(15) if count >= 3]
        
        return patterns


# 사용 예시
if __name__ == "__main__":
    print("🎭 정치인 스타일 메시지 생성 시스템")
    print("=" * 50)
    
    generator = PoliticalStyleGenerator()
    
    print("📋 지원하는 정치인 스타일:")
    styles = generator.get_available_styles()
    for style in styles:
        print(f"   • {style['name']}: {style['communication_style']}")
        print(f"     - 전문영역: {', '.join(style['expertise_areas'])}")
        print(f"     - 샘플 표현: {', '.join(style['sample_phrases'])}")
        print()
    
    print("🎯 주요 기능:")
    print("   ✓ 6명 정치인 스타일 메시지 생성")
    print("   ✓ 개인별 고유 어법과 어투 적용")
    print("   ✓ 논리 구조와 어휘 선호도 반영")
    print("   ✓ 스타일 분석 및 신뢰도 측정")
    print("   ✓ 비교 메시지 생성")
    print("   ✓ 연설 데이터 학습 기능")
    print("")
    print("🏆 **정치인 수준의 논리적이고 설득력 있는 메시지!**") 