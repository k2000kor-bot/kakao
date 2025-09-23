"""
CORBU AI Advanced Intelligence Engine - 고급 AI 지능 엔진
"""
import re
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import random

logger = logging.getLogger(__name__)

class IntelligenceType(Enum):
    """지능 유형"""
    ANALYTICAL = "analytical"  # 분석적
    CREATIVE = "creative"  # 창의적
    EMOTIONAL = "emotional"  # 감정적
    LOGICAL = "logical"  # 논리적
    INTUITIVE = "intuitive"  # 직관적
    CRITICAL = "critical"  # 비판적
    STRATEGIC = "strategic"  # 전략적
    EMPATHETIC = "empathetic"  # 공감적

class ContextType(Enum):
    """맥락 유형"""
    CONVERSATIONAL = "conversational"  # 대화적
    ACADEMIC = "academic"  # 학술적
    PROFESSIONAL = "professional"  # 전문적
    PERSONAL = "personal"  # 개인적
    CREATIVE = "creative"  # 창작적
    TECHNICAL = "technical"  # 기술적
    EMOTIONAL = "emotional"  # 감정적
    PROBLEM_SOLVING = "problem_solving"  # 문제해결

@dataclass
class IntelligenceAnalysis:
    """지능 분석 결과"""
    text: str
    intelligence_types: List[IntelligenceType]
    context_type: ContextType
    complexity_score: float
    creativity_score: float
    emotional_intelligence: float
    logical_consistency: float
    strategic_thinking: float
    empathy_level: float
    insights: List[str]
    recommendations: List[str]

class AdvancedAIIntelligence:
    """고급 AI 지능 엔진"""
    
    def __init__(self):
        self.intelligence_patterns = self._initialize_intelligence_patterns()
        self.context_patterns = self._initialize_context_patterns()
        self.creative_templates = self._initialize_creative_templates()
        self.emotional_indicators = self._initialize_emotional_indicators()
        self.learning_memory = {}
        
    def _initialize_intelligence_patterns(self) -> Dict[str, List[str]]:
        """지능 패턴 초기화"""
        return {
            "analytical": [
                "분석", "조사", "연구", "검토", "평가", "측정", "계산", "통계",
                "데이터", "수치", "비율", "비교", "대조", "관계", "연관성"
            ],
            "creative": [
                "창의", "혁신", "독창", "새로운", "발상", "아이디어", "상상",
                "예술", "디자인", "작품", "창작", "표현", "예술적", "창의적"
            ],
            "emotional": [
                "감정", "기분", "느낌", "마음", "심정", "감동", "기쁨", "슬픔",
                "사랑", "미움", "행복", "우울", "불안", "걱정", "희망", "절망"
            ],
            "logical": [
                "논리", "이유", "근거", "증명", "추론", "결론", "전제", "가정",
                "따라서", "그러므로", "왜냐하면", "때문에", "그래서", "그러나"
            ],
            "intuitive": [
                "직감", "느낌", "예감", "예시", "본능", "무의식", "자연스럽게",
                "어떻게든", "어쩐지", "뭔가", "이상하게", "묘하게"
            ],
            "critical": [
                "비판", "문제", "단점", "한계", "부족", "개선", "지적", "반대",
                "의문", "의심", "회의", "회의적", "의문스러운"
            ],
            "strategic": [
                "전략", "계획", "목표", "방향", "접근", "방법", "수단", "도구",
                "자원", "효율", "최적화", "성과", "결과", "성공"
            ],
            "empathetic": [
                "이해", "공감", "동정", "위로", "격려", "지지", "도움", "배려",
                "관심", "신경", "걱정", "돌봄", "보살핌", "보호"
            ]
        }
    
    def _initialize_context_patterns(self) -> Dict[str, List[str]]:
        """맥락 패턴 초기화"""
        return {
            "conversational": [
                "안녕", "어떻게", "뭐해", "어때", "그래", "맞아", "정말", "진짜"
            ],
            "academic": [
                "연구", "논문", "학술", "이론", "가설", "실험", "조사", "분석",
                "결론", "논의", "참고문헌", "인용", "방법론"
            ],
            "professional": [
                "업무", "회사", "직장", "프로젝트", "성과", "목표", "계획",
                "보고서", "회의", "협업", "팀", "관리", "리더십"
            ],
            "personal": [
                "나", "내", "저", "제", "개인", "사생활", "가족", "친구",
                "연인", "관계", "인생", "꿈", "희망", "고민"
            ],
            "creative": [
                "창작", "작품", "예술", "디자인", "아이디어", "상상", "표현",
                "스토리", "이야기", "소설", "시", "음악", "그림"
            ],
            "technical": [
                "기술", "프로그래밍", "코딩", "개발", "시스템", "알고리즘",
                "데이터베이스", "네트워크", "보안", "최적화", "성능"
            ],
            "emotional": [
                "감정", "기분", "마음", "심정", "느낌", "감동", "기쁨", "슬픔",
                "사랑", "미움", "행복", "우울", "불안", "걱정"
            ],
            "problem_solving": [
                "문제", "해결", "방법", "해결책", "대안", "선택", "결정",
                "고민", "어려움", "도전", "장애물", "위기", "위험"
            ]
        }
    
    def _initialize_creative_templates(self) -> Dict[str, List[str]]:
        """창작 템플릿 초기화"""
        return {
            "story_starters": [
                "옛날 옛적에", "한 번은", "어느 날", "갑자기", "문득",
                "어느 순간", "그때", "그날", "어느 날 밤", "어느 날 아침"
            ],
            "character_descriptions": [
                "신비로운", "매력적인", "독특한", "특별한", "뛰어난",
                "용감한", "지혜로운", "친근한", "따뜻한", "강인한"
            ],
            "emotional_expressions": [
                "가슴이 뭉클해지는", "눈물이 나는", "웃음이 나는", "감동적인",
                "아름다운", "슬픈", "기쁜", "행복한", "희망적인", "따뜻한"
            ],
            "plot_elements": [
                "예상치 못한", "놀라운", "신비로운", "기적적인", "마법 같은",
                "환상적인", "꿈같은", "현실적인", "진실한", "솔직한"
            ]
        }
    
    def _initialize_emotional_indicators(self) -> Dict[str, List[str]]:
        """감정 지표 초기화"""
        return {
            "joy": ["기쁨", "행복", "즐거움", "웃음", "미소", "환희", "기쁘다", "행복하다"],
            "sadness": ["슬픔", "우울", "눈물", "아픔", "고통", "슬프다", "우울하다", "아프다"],
            "anger": ["화", "분노", "짜증", "성", "격분", "화나다", "짜증나다", "성나다"],
            "fear": ["두려움", "공포", "불안", "걱정", "무서움", "두렵다", "무섭다", "걱정된다"],
            "love": ["사랑", "애정", "호감", "좋아", "사랑하다", "좋아하다", "애정"],
            "surprise": ["놀람", "깜짝", "의외", "놀랍다", "깜짝", "의외다"],
            "disgust": ["혐오", "싫음", "역겨움", "혐오스럽다", "싫다", "역겹다"],
            "trust": ["신뢰", "믿음", "신뢰하다", "믿다", "신뢰할 수 있다"]
        }
    
    async def analyze_intelligence(self, text: str, user_id: str = "default") -> IntelligenceAnalysis:
        """지능 분석"""
        try:
            # 지능 유형 분석
            intelligence_types = self._analyze_intelligence_types(text)
            
            # 맥락 유형 분석
            context_type = self._analyze_context_type(text)
            
            # 복잡도 점수 계산
            complexity_score = self._calculate_complexity_score(text)
            
            # 창의성 점수 계산
            creativity_score = self._calculate_creativity_score(text)
            
            # 감정 지능 계산
            emotional_intelligence = self._calculate_emotional_intelligence(text)
            
            # 논리적 일관성 계산
            logical_consistency = self._calculate_logical_consistency(text)
            
            # 전략적 사고 계산
            strategic_thinking = self._calculate_strategic_thinking(text)
            
            # 공감 수준 계산
            empathy_level = self._calculate_empathy_level(text)
            
            # 인사이트 생성
            insights = self._generate_insights(text, intelligence_types, context_type)
            
            # 권장사항 생성
            recommendations = self._generate_recommendations(intelligence_types, context_type)
            
            return IntelligenceAnalysis(
                text=text,
                intelligence_types=intelligence_types,
                context_type=context_type,
                complexity_score=complexity_score,
                creativity_score=creativity_score,
                emotional_intelligence=emotional_intelligence,
                logical_consistency=logical_consistency,
                strategic_thinking=strategic_thinking,
                empathy_level=empathy_level,
                insights=insights,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"지능 분석 중 오류: {e}")
            return self._create_fallback_analysis(text)
    
    def _analyze_intelligence_types(self, text: str) -> List[IntelligenceType]:
        """지능 유형 분석"""
        detected_types = []
        
        for intelligence_type, patterns in self.intelligence_patterns.items():
            for pattern in patterns:
                if pattern in text:
                    detected_types.append(IntelligenceType(intelligence_type))
                    break
        
        return detected_types if detected_types else [IntelligenceType.ANALYTICAL]
    
    def _analyze_context_type(self, text: str) -> ContextType:
        """맥락 유형 분석"""
        context_scores = {}
        
        for context_type, patterns in self.context_patterns.items():
            score = sum(1 for pattern in patterns if pattern in text)
            context_scores[context_type] = score
        
        if not context_scores or max(context_scores.values()) == 0:
            return ContextType.CONVERSATIONAL
        
        return ContextType(max(context_scores, key=context_scores.get))
    
    def _calculate_complexity_score(self, text: str) -> float:
        """복잡도 점수 계산"""
        words = text.split()
        sentences = re.split(r'[.!?]', text)
        
        if not words or not sentences:
            return 0.0
        
        # 문장 복잡도
        avg_sentence_length = len(words) / len(sentences)
        sentence_complexity = min(avg_sentence_length / 20, 1.0)
        
        # 어휘 다양성
        unique_words = len(set(words))
        vocabulary_diversity = min(unique_words / len(words), 1.0)
        
        # 구문 복잡도
        complex_structures = len(re.findall(r'[,;:()]', text))
        syntax_complexity = min(complex_structures / len(words), 1.0)
        
        return (sentence_complexity + vocabulary_diversity + syntax_complexity) / 3
    
    def _calculate_creativity_score(self, text: str) -> float:
        """창의성 점수 계산"""
        creative_indicators = 0
        total_words = len(text.split())
        
        if total_words == 0:
            return 0.0
        
        # 창의적 단어 사용
        for templates in self.creative_templates.values():
            for template in templates:
                if template in text:
                    creative_indicators += 1
        
        # 비유법 사용
        metaphors = len(re.findall(r'같은|처럼|마치|인듯', text))
        creative_indicators += metaphors
        
        # 질문 사용
        questions = text.count('?')
        creative_indicators += questions * 0.5
        
        return min(creative_indicators / total_words * 10, 1.0)
    
    def _calculate_emotional_intelligence(self, text: str) -> float:
        """감정 지능 계산"""
        emotional_indicators = 0
        total_words = len(text.split())
        
        if total_words == 0:
            return 0.0
        
        # 감정 표현 사용
        for emotions in self.emotional_indicators.values():
            for emotion in emotions:
                if emotion in text:
                    emotional_indicators += 1
        
        # 감정적 연결어 사용
        emotional_connectors = len(re.findall(r'그래서|그러나|하지만|그런데|그럼에도', text))
        emotional_indicators += emotional_connectors
        
        return min(emotional_indicators / total_words * 5, 1.0)
    
    def _calculate_logical_consistency(self, text: str) -> float:
        """논리적 일관성 계산"""
        logical_indicators = 0
        total_words = len(text.split())
        
        if total_words == 0:
            return 0.0
        
        # 논리적 연결어 사용
        logical_connectors = len(re.findall(r'따라서|그러므로|왜냐하면|때문에|그래서|그러나|하지만', text))
        logical_indicators += logical_connectors
        
        # 조건문 사용
        conditionals = len(re.findall(r'만약|만일|만약에|만일', text))
        logical_indicators += conditionals
        
        # 비교문 사용
        comparisons = len(re.findall(r'비교|대비|대조|상대적|절대적', text))
        logical_indicators += comparisons
        
        return min(logical_indicators / total_words * 3, 1.0)
    
    def _calculate_strategic_thinking(self, text: str) -> float:
        """전략적 사고 계산"""
        strategic_indicators = 0
        total_words = len(text.split())
        
        if total_words == 0:
            return 0.0
        
        # 전략적 키워드 사용
        strategic_keywords = ['전략', '계획', '목표', '방향', '접근', '방법', '수단', '효율', '최적화']
        for keyword in strategic_keywords:
            if keyword in text:
                strategic_indicators += 1
        
        # 미래 지향적 표현
        future_expressions = len(re.findall(r'될|할|될 것|할 것|예정|계획', text))
        strategic_indicators += future_expressions * 0.5
        
        return min(strategic_indicators / total_words * 5, 1.0)
    
    def _calculate_empathy_level(self, text: str) -> float:
        """공감 수준 계산"""
        empathy_indicators = 0
        total_words = len(text.split())
        
        if total_words == 0:
            return 0.0
        
        # 공감 표현 사용
        empathy_expressions = ['이해', '공감', '동정', '위로', '격려', '지지', '도움', '배려']
        for expression in empathy_expressions:
            if expression in text:
                empathy_indicators += 1
        
        # 질문 사용 (관심 표현)
        questions = text.count('?')
        empathy_indicators += questions * 0.3
        
        # 감정 표현 사용
        emotional_words = len(re.findall(r'감정|기분|느낌|마음|심정', text))
        empathy_indicators += emotional_words
        
        return min(empathy_indicators / total_words * 4, 1.0)
    
    def _generate_insights(self, text: str, intelligence_types: List[IntelligenceType], context_type: ContextType) -> List[str]:
        """인사이트 생성"""
        insights = []
        
        # 지능 유형별 인사이트
        if IntelligenceType.ANALYTICAL in intelligence_types:
            insights.append("분석적 사고가 뛰어나며 체계적인 접근을 선호합니다.")
        
        if IntelligenceType.CREATIVE in intelligence_types:
            insights.append("창의적 사고가 발달되어 있으며 독창적인 아이디어를 제시합니다.")
        
        if IntelligenceType.EMOTIONAL in intelligence_types:
            insights.append("감정적 지능이 높아 타인의 감정을 잘 이해합니다.")
        
        if IntelligenceType.LOGICAL in intelligence_types:
            insights.append("논리적 사고가 뛰어나며 일관성 있는 추론을 합니다.")
        
        if IntelligenceType.STRATEGIC in intelligence_types:
            insights.append("전략적 사고가 발달되어 장기적 관점에서 접근합니다.")
        
        if IntelligenceType.EMPATHETIC in intelligence_types:
            insights.append("공감 능력이 뛰어나며 타인을 배려하는 마음이 있습니다.")
        
        # 맥락별 인사이트
        if context_type == ContextType.ACADEMIC:
            insights.append("학술적 맥락에서 전문적인 지식을 활용합니다.")
        elif context_type == ContextType.CREATIVE:
            insights.append("창작적 맥락에서 예술적 감각을 발휘합니다.")
        elif context_type == ContextType.EMOTIONAL:
            insights.append("감정적 맥락에서 깊이 있는 공감을 표현합니다.")
        
        return insights
    
    def _generate_recommendations(self, intelligence_types: List[IntelligenceType], context_type: ContextType) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        # 지능 유형별 권장사항
        if IntelligenceType.ANALYTICAL not in intelligence_types:
            recommendations.append("데이터와 사실을 기반으로 한 분석적 사고를 연습해보세요.")
        
        if IntelligenceType.CREATIVE not in intelligence_types:
            recommendations.append("창의적 사고를 위해 다양한 관점에서 접근해보세요.")
        
        if IntelligenceType.EMOTIONAL not in intelligence_types:
            recommendations.append("감정적 지능 향상을 위해 타인의 감정을 이해하려 노력해보세요.")
        
        if IntelligenceType.LOGICAL not in intelligence_types:
            recommendations.append("논리적 사고를 위해 근거와 증거를 제시하는 연습을 해보세요.")
        
        if IntelligenceType.STRATEGIC not in intelligence_types:
            recommendations.append("전략적 사고를 위해 장기적 목표와 계획을 세워보세요.")
        
        if IntelligenceType.EMPATHETIC not in intelligence_types:
            recommendations.append("공감 능력 향상을 위해 타인의 입장에서 생각해보세요.")
        
        return recommendations
    
    def _create_fallback_analysis(self, text: str) -> IntelligenceAnalysis:
        """기본 분석 결과 생성"""
        return IntelligenceAnalysis(
            text=text,
            intelligence_types=[IntelligenceType.ANALYTICAL],
            context_type=ContextType.CONVERSATIONAL,
            complexity_score=0.5,
            creativity_score=0.5,
            emotional_intelligence=0.5,
            logical_consistency=0.5,
            strategic_thinking=0.5,
            empathy_level=0.5,
            insights=["기본적인 분석이 완료되었습니다."],
            recommendations=["더 구체적인 분석을 위해 추가 정보를 제공해주세요."]
        )
    
    async def generate_creative_content(self, prompt: str, content_type: str = "story") -> str:
        """창작 콘텐츠 생성"""
        try:
            if content_type == "story":
                return self._generate_story(prompt)
            elif content_type == "poem":
                return self._generate_poem(prompt)
            elif content_type == "dialogue":
                return self._generate_dialogue(prompt)
            else:
                return self._generate_general_creative(prompt)
                
        except Exception as e:
            logger.error(f"창작 콘텐츠 생성 중 오류: {e}")
            return f"창작 콘텐츠 생성 중 오류가 발생했습니다: {str(e)}"
    
    def _generate_story(self, prompt: str) -> str:
        """스토리 생성"""
        starter = random.choice(self.creative_templates["story_starters"])
        character = random.choice(self.creative_templates["character_descriptions"])
        emotion = random.choice(self.creative_templates["emotional_expressions"])
        plot = random.choice(self.creative_templates["plot_elements"])
        
        story = f"""{starter} {character} 사람이 있었습니다. 
        
그 사람은 {emotion} 이야기를 가지고 있었는데, 그것은 {plot} 사건이었습니다.

{prompt}에 대한 이야기였습니다.

그 이야기는 사람들에게 깊은 인상을 남겼고, 많은 사람들이 그 이야기를 기억하게 되었습니다.

그렇게 {character} 사람의 이야기는 전설이 되었습니다."""
        
        return story
    
    def _generate_poem(self, prompt: str) -> str:
        """시 생성"""
        poem = f"""'{prompt}'에 대한 시

{random.choice(self.creative_templates["emotional_expressions"])} 순간
{random.choice(self.creative_templates["plot_elements"])} 이야기
{random.choice(self.creative_templates["character_descriptions"])} 마음

{prompt}의 의미
깊이 새겨지는
{random.choice(self.creative_templates["emotional_expressions"])} 기억

그렇게 우리는
{random.choice(self.creative_templates["plot_elements"])} 순간을
{random.choice(self.creative_templates["character_descriptions"])} 마음으로
기억합니다."""
        
        return poem
    
    def _generate_dialogue(self, prompt: str) -> str:
        """대화 생성"""
        dialogue = f"""'{prompt}'에 대한 대화

A: {prompt}에 대해 어떻게 생각하세요?

B: {random.choice(self.creative_templates["emotional_expressions"])} 것 같아요. 

A: 그렇다면 어떤 {random.choice(self.creative_templates["plot_elements"])} 방법이 있을까요?

B: {random.choice(self.creative_templates["character_descriptions"])} 접근이 필요할 것 같아요.

A: {random.choice(self.creative_templates["emotional_expressions"])} 결과를 기대해볼 수 있겠네요.

B: 네, {prompt}에 대한 {random.choice(self.creative_templates["plot_elements"])} 해결책을 찾아보겠습니다."""
        
        return dialogue
    
    def _generate_general_creative(self, prompt: str) -> str:
        """일반 창작 콘텐츠 생성"""
        creative_content = f"""'{prompt}'에 대한 창작 콘텐츠

{random.choice(self.creative_templates["story_starters"])} {random.choice(self.creative_templates["character_descriptions"])} 아이디어가 떠올랐습니다.

그 아이디어는 {random.choice(self.creative_templates["emotional_expressions"])} 영감을 주었고, {random.choice(self.creative_templates["plot_elements"])} 방향으로 발전해나갔습니다.

{prompt}에 대한 {random.choice(self.creative_templates["character_descriptions"])} 접근이었습니다.

그렇게 {random.choice(self.creative_templates["emotional_expressions"])} 결과물이 탄생했습니다."""
        
        return creative_content
    
    async def generate_intelligence_report(self, analysis: IntelligenceAnalysis) -> str:
        """지능 분석 보고서 생성"""
        try:
            report_parts = []
            
            report_parts.append("## 🧠 고급 지능 분석 보고서")
            report_parts.append("")
            
            # 기본 정보
            report_parts.append("### 📊 분석 결과")
            report_parts.append(f"**입력 텍스트**: \"{analysis.text[:100]}{'...' if len(analysis.text) > 100 else ''}\"")
            report_parts.append(f"**맥락 유형**: {analysis.context_type.value}")
            report_parts.append("")
            
            # 지능 유형
            report_parts.append("### 🎯 지능 유형")
            for intelligence_type in analysis.intelligence_types:
                report_parts.append(f"- **{intelligence_type.value}**: {self._get_intelligence_description(intelligence_type)}")
            report_parts.append("")
            
            # 점수 분석
            report_parts.append("### 📈 점수 분석")
            report_parts.append(f"- **복잡도**: {analysis.complexity_score:.3f}/1.0")
            report_parts.append(f"- **창의성**: {analysis.creativity_score:.3f}/1.0")
            report_parts.append(f"- **감정 지능**: {analysis.emotional_intelligence:.3f}/1.0")
            report_parts.append(f"- **논리적 일관성**: {analysis.logical_consistency:.3f}/1.0")
            report_parts.append(f"- **전략적 사고**: {analysis.strategic_thinking:.3f}/1.0")
            report_parts.append(f"- **공감 수준**: {analysis.empathy_level:.3f}/1.0")
            report_parts.append("")
            
            # 인사이트
            if analysis.insights:
                report_parts.append("### 💡 인사이트")
                for insight in analysis.insights:
                    report_parts.append(f"- {insight}")
                report_parts.append("")
            
            # 권장사항
            if analysis.recommendations:
                report_parts.append("### 🎯 권장사항")
                for recommendation in analysis.recommendations:
                    report_parts.append(f"- {recommendation}")
                report_parts.append("")
            
            report_parts.append("---")
            report_parts.append("*CORBU AI Advanced Intelligence Engine이 제공하는 분석입니다*")
            
            return "\n".join(report_parts)
            
        except Exception as e:
            logger.error(f"지능 분석 보고서 생성 중 오류: {e}")
            return f"## 오류 발생\n지능 분석 보고서 생성 중 오류가 발생했습니다: {str(e)}"
    
    def _get_intelligence_description(self, intelligence_type: IntelligenceType) -> str:
        """지능 유형 설명"""
        descriptions = {
            IntelligenceType.ANALYTICAL: "체계적이고 논리적인 분석을 선호합니다",
            IntelligenceType.CREATIVE: "독창적이고 혁신적인 아이디어를 제시합니다",
            IntelligenceType.EMOTIONAL: "감정적 지능이 높아 타인의 감정을 잘 이해합니다",
            IntelligenceType.LOGICAL: "논리적 사고가 뛰어나며 일관성 있는 추론을 합니다",
            IntelligenceType.INTUITIVE: "직감적이고 본능적인 판단을 합니다",
            IntelligenceType.CRITICAL: "비판적 사고를 통해 문제를 분석합니다",
            IntelligenceType.STRATEGIC: "전략적 사고로 장기적 관점에서 접근합니다",
            IntelligenceType.EMPATHETIC: "공감 능력이 뛰어나며 타인을 배려합니다"
        }
        return descriptions.get(intelligence_type, "기본적인 지능 유형입니다")
    
    async def get_intelligence_statistics(self) -> Dict[str, Any]:
        """지능 분석 통계"""
        return {
            "supported_intelligence_types": [t.value for t in IntelligenceType],
            "supported_context_types": [t.value for t in ContextType],
            "creative_templates": sum(len(templates) for templates in self.creative_templates.values()),
            "emotional_indicators": sum(len(indicators) for indicators in self.emotional_indicators.values()),
            "engine_status": "active"
        }
