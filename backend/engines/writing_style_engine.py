"""
CORBU.AI Writing Style Engine - 어투, 말투, 글쓰기 종류별 특성 엔진
"""
import re
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class WritingStyle(Enum):
    """글쓰기 스타일"""
    FORMAL = "formal"  # 격식체
    INFORMAL = "informal"  # 비격식체
    ACADEMIC = "academic"  # 학술적
    BUSINESS = "business"  # 비즈니스
    CREATIVE = "creative"  # 창작적
    TECHNICAL = "technical"  # 기술적
    CONVERSATIONAL = "conversational"  # 대화체
    NARRATIVE = "narrative"  # 서술체
    PERSUASIVE = "persuasive"  # 설득적
    DESCRIPTIVE = "descriptive"  # 설명적

class Tone(Enum):
    """어조/말투"""
    POLITE = "polite"  # 정중한
    CASUAL = "casual"  # 캐주얼한
    FRIENDLY = "friendly"  # 친근한
    PROFESSIONAL = "professional"  # 전문적인
    AUTHORITATIVE = "authoritative"  # 권위적인
    ENCOURAGING = "encouraging"  # 격려하는
    CRITICAL = "critical"  # 비판적인
    NEUTRAL = "neutral"  # 중립적인
    ENTHUSIASTIC = "enthusiastic"  # 열정적인
    SYMPATHETIC = "sympathetic"  # 공감적인

class Audience(Enum):
    """대상 독자"""
    GENERAL = "general"  # 일반인
    EXPERT = "expert"  # 전문가
    STUDENT = "student"  # 학생
    CHILD = "child"  # 어린이
    ELDERLY = "elderly"  # 어르신
    COLLEAGUE = "colleague"  # 동료
    CUSTOMER = "customer"  # 고객
    BOSS = "boss"  # 상사
    SUBORDINATE = "subordinate"  # 부하직원

@dataclass
class WritingStyleProfile:
    """글쓰기 스타일 프로필"""
    style: WritingStyle
    tone: Tone
    audience: Audience
    formality_level: int  # 1-5 (1: 매우 비격식, 5: 매우 격식)
    complexity_level: int  # 1-5 (1: 매우 단순, 5: 매우 복잡)
    emotional_tone: str  # 감정적 톤
    sentence_structure: str  # 문장 구조 특성
    vocabulary_level: str  # 어휘 수준
    cultural_context: str  # 문화적 맥락

class WritingStyleEngine:
    """글쓰기 스타일 엔진"""
    
    def __init__(self):
        self.style_patterns = self._initialize_style_patterns()
        self.tone_patterns = self._initialize_tone_patterns()
        self.audience_patterns = self._initialize_audience_patterns()
        self.formality_indicators = self._initialize_formality_indicators()
        self.sentence_structures = self._initialize_sentence_structures()
        self.vocabulary_levels = self._initialize_vocabulary_levels()
        
    def _initialize_style_patterns(self) -> Dict[str, List[str]]:
        """스타일 패턴 초기화"""
        return {
            "formal": [
                "입니다", "습니다", "입니다", "습니다", "입니다", "습니다",
                "하시겠습니까", "하시겠습니까", "하시겠습니까", "하시겠습니까",
                "드리겠습니다", "드리겠습니다", "드리겠습니다", "드리겠습니다"
            ],
            "informal": [
                "야", "어", "지", "네", "다", "해", "해요", "해요", "해요",
                "그래", "맞아", "좋아", "싫어", "몰라", "모르겠어"
            ],
            "academic": [
                "연구에 따르면", "분석 결과", "실험을 통해", "이론적으로",
                "가설을 설정하고", "방법론을 통해", "결론적으로", "따라서"
            ],
            "business": [
                "비즈니스", "전략", "목표", "성과", "효율성", "수익성",
                "고객 만족", "시장 점유율", "경쟁 우위", "ROI"
            ],
            "creative": [
                "상상해보세요", "마치", "마치", "마치", "마치", "마치",
                "꿈같이", "신비롭게", "아름답게", "환상적으로"
            ],
            "technical": [
                "알고리즘", "데이터베이스", "API", "프로토콜", "아키텍처",
                "성능", "최적화", "버그", "디버깅", "테스트"
            ]
        }
    
    def _initialize_tone_patterns(self) -> Dict[str, List[str]]:
        """어조 패턴 초기화"""
        return {
            "polite": [
                "부탁드립니다", "감사합니다", "죄송합니다", "실례합니다",
                "괜찮으시다면", "혹시", "만약", "가능하시다면"
            ],
            "casual": [
                "그냥", "그래", "어때", "뭐야", "진짜", "정말", "완전",
                "대박", "쩐다", "개쩐다", "미쳤다"
            ],
            "friendly": [
                "안녕하세요", "반가워요", "좋은 하루", "즐거운", "기쁜",
                "행복한", "웃음", "미소", "친구", "동료"
            ],
            "professional": [
                "전문적으로", "체계적으로", "효율적으로", "전략적으로",
                "분석적으로", "객관적으로", "논리적으로", "실용적으로"
            ],
            "authoritative": [
                "확실히", "분명히", "명백히", "당연히", "필연적으로",
                "절대적으로", "완전히", "전적으로", "무조건"
            ],
            "encouraging": [
                "화이팅", "힘내세요", "잘할 수 있어요", "포기하지 마세요",
                "노력하세요", "도전하세요", "성공하세요", "응원합니다"
            ],
            "critical": [
                "문제가 있습니다", "개선이 필요합니다", "비효율적입니다",
                "잘못되었습니다", "부적절합니다", "문제점", "단점"
            ],
            "enthusiastic": [
                "와", "우와", "대단해", "멋져", "훌륭해", "완벽해",
                "최고야", "최고다", "최고예요", "최고입니다"
            ]
        }
    
    def _initialize_audience_patterns(self) -> Dict[str, List[str]]:
        """대상 독자 패턴 초기화"""
        return {
            "general": [
                "쉽게 설명하면", "간단히 말하면", "일반적으로", "보통",
                "대부분의 경우", "일반인도 이해할 수 있도록"
            ],
            "expert": [
                "전문가로서", "기술적으로", "이론적으로", "방법론적으로",
                "고급", "심화", "전문", "특화"
            ],
            "student": [
                "학습", "공부", "배우다", "이해하다", "알아가다",
                "기초", "기본", "원리", "개념"
            ],
            "child": [
                "귀여운", "예쁜", "좋은", "재미있는", "신기한",
                "놀라운", "멋진", "훌륭한", "대단한"
            ],
            "elderly": [
                "존경하는", "고맙습니다", "감사합니다", "부탁드립니다",
                "잘 부탁드립니다", "도와주세요", "가르쳐주세요"
            ]
        }
    
    def _initialize_formality_indicators(self) -> Dict[int, List[str]]:
        """격식도 지표 초기화"""
        return {
            1: ["야", "어", "지", "네", "다", "해", "그래", "맞아"],
            2: ["해요", "예요", "아요", "어요", "고 싶어요", "할 수 있어요"],
            3: ["합니다", "입니다", "습니다", "하겠습니다", "드리겠습니다"],
            4: ["하시겠습니까", "하시겠습니까", "하시겠습니까", "하시겠습니까"],
            5: ["하시겠습니까", "하시겠습니까", "하시겠습니까", "하시겠습니까"]
        }
    
    def _initialize_sentence_structures(self) -> Dict[str, List[str]]:
        """문장 구조 초기화"""
        return {
            "simple": ["주어 + 서술어", "명사 + 동사", "간단한 문장"],
            "compound": ["주어 + 서술어 + 접속사 + 주어 + 서술어", "복합문"],
            "complex": ["주절 + 종속절", "관계절", "조건절", "양보절"],
            "compound_complex": ["복합문 + 종속절", "다중 복합문"]
        }
    
    def _initialize_vocabulary_levels(self) -> Dict[str, List[str]]:
        """어휘 수준 초기화"""
        return {
            "basic": ["기본", "일반", "흔한", "쉬운", "간단한"],
            "intermediate": ["중급", "보통", "일반적", "표준", "평균"],
            "advanced": ["고급", "전문", "복잡", "정교", "정밀"],
            "expert": ["전문가", "고도", "최고급", "최첨단", "최신"]
        }
    
    async def analyze_writing_style(self, text: str, context: Dict[str, Any] = None) -> WritingStyleProfile:
        """글쓰기 스타일 분석"""
        try:
            # 스타일 감지
            detected_style = self._detect_writing_style(text)
            
            # 어조 감지
            detected_tone = self._detect_tone(text)
            
            # 대상 독자 감지
            detected_audience = self._detect_audience(text, context)
            
            # 격식도 계산
            formality_level = self._calculate_formality_level(text)
            
            # 복잡도 계산
            complexity_level = self._calculate_complexity_level(text)
            
            # 감정적 톤 분석
            emotional_tone = self._analyze_emotional_tone(text)
            
            # 문장 구조 분석
            sentence_structure = self._analyze_sentence_structure(text)
            
            # 어휘 수준 분석
            vocabulary_level = self._analyze_vocabulary_level(text)
            
            # 문화적 맥락 분석
            cultural_context = self._analyze_cultural_context(text)
            
            return WritingStyleProfile(
                style=detected_style,
                tone=detected_tone,
                audience=detected_audience,
                formality_level=formality_level,
                complexity_level=complexity_level,
                emotional_tone=emotional_tone,
                sentence_structure=sentence_structure,
                vocabulary_level=vocabulary_level,
                cultural_context=cultural_context
            )
            
        except Exception as e:
            logger.error(f"글쓰기 스타일 분석 중 오류: {e}")
            return self._create_fallback_profile()
    
    def _detect_writing_style(self, text: str) -> WritingStyle:
        """글쓰기 스타일 감지"""
        text_lower = text.lower()
        
        for style, patterns in self.style_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    return WritingStyle(style)
        
        # 기본값: 대화체
        return WritingStyle.CONVERSATIONAL
    
    def _detect_tone(self, text: str) -> Tone:
        """어조 감지"""
        text_lower = text.lower()
        
        for tone, patterns in self.tone_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    return Tone(tone)
        
        # 기본값: 중립적
        return Tone.NEUTRAL
    
    def _detect_audience(self, text: str, context: Dict[str, Any] = None) -> Audience:
        """대상 독자 감지"""
        if context and "audience" in context:
            return Audience(context["audience"])
        
        text_lower = text.lower()
        
        for audience, patterns in self.audience_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    return Audience(audience)
        
        # 기본값: 일반인
        return Audience.GENERAL
    
    def _calculate_formality_level(self, text: str) -> int:
        """격식도 계산 (1-5)"""
        formality_score = 0
        total_indicators = 0
        
        for level, indicators in self.formality_indicators.items():
            for indicator in indicators:
                if indicator in text:
                    formality_score += level
                    total_indicators += 1
        
        if total_indicators == 0:
            return 3  # 기본값
        
        return min(max(round(formality_score / total_indicators), 1), 5)
    
    def _calculate_complexity_level(self, text: str) -> int:
        """복잡도 계산 (1-5)"""
        sentences = re.split(r'[.!?]', text)
        words = text.split()
        
        if not sentences or not words:
            return 3
        
        # 문장 길이 복잡도
        avg_sentence_length = len(words) / len(sentences)
        length_complexity = min(avg_sentence_length / 10, 1.0)
        
        # 어휘 복잡도
        unique_words = len(set(words))
        vocabulary_complexity = min(unique_words / len(words), 1.0)
        
        # 구두점 복잡도
        punctuation_count = len(re.findall(r'[,;:()]', text))
        punctuation_complexity = min(punctuation_count / len(words), 1.0)
        
        # 전체 복잡도
        overall_complexity = (length_complexity + vocabulary_complexity + punctuation_complexity) / 3
        
        return min(max(round(overall_complexity * 5), 1), 5)
    
    def _analyze_emotional_tone(self, text: str) -> str:
        """감정적 톤 분석"""
        positive_words = ["좋다", "좋은", "훌륭하다", "멋지다", "완벽하다", "대단하다"]
        negative_words = ["나쁘다", "안좋다", "실망", "화나다", "슬프다", "짜증"]
        neutral_words = ["일반적", "보통", "평범", "중간", "적당"]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        neutral_count = sum(1 for word in neutral_words if word in text_lower)
        
        if positive_count > negative_count and positive_count > neutral_count:
            return "긍정적"
        elif negative_count > positive_count and negative_count > neutral_count:
            return "부정적"
        else:
            return "중립적"
    
    def _analyze_sentence_structure(self, text: str) -> str:
        """문장 구조 분석"""
        sentences = re.split(r'[.!?]', text)
        
        if not sentences:
            return "simple"
        
        complex_sentences = 0
        for sentence in sentences:
            if len(sentence.split()) > 20:  # 긴 문장
                complex_sentences += 1
        
        complexity_ratio = complex_sentences / len(sentences)
        
        if complexity_ratio > 0.7:
            return "complex"
        elif complexity_ratio > 0.3:
            return "compound"
        else:
            return "simple"
    
    def _analyze_vocabulary_level(self, text: str) -> str:
        """어휘 수준 분석"""
        words = text.split()
        if not words:
            return "basic"
        
        # 전문 용어 비율 계산
        technical_terms = len([word for word in words if len(word) > 6])
        technical_ratio = technical_terms / len(words)
        
        if technical_ratio > 0.3:
            return "expert"
        elif technical_ratio > 0.2:
            return "advanced"
        elif technical_ratio > 0.1:
            return "intermediate"
        else:
            return "basic"
    
    def _analyze_cultural_context(self, text: str) -> str:
        """문화적 맥락 분석"""
        korean_cultural_terms = ["한국", "우리나라", "전통", "문화", "예의", "정", "한"]
        western_cultural_terms = ["미국", "서양", "개인주의", "자유", "민주주의"]
        
        korean_count = sum(1 for term in korean_cultural_terms if term in text)
        western_count = sum(1 for term in western_cultural_terms if term in text)
        
        if korean_count > western_count:
            return "한국적"
        elif western_count > korean_count:
            return "서양적"
        else:
            return "보편적"
    
    def _create_fallback_profile(self) -> WritingStyleProfile:
        """기본 프로필 생성"""
        return WritingStyleProfile(
            style=WritingStyle.CONVERSATIONAL,
            tone=Tone.NEUTRAL,
            audience=Audience.GENERAL,
            formality_level=3,
            complexity_level=3,
            emotional_tone="중립적",
            sentence_structure="simple",
            vocabulary_level="intermediate",
            cultural_context="보편적"
        )
    
    async def adapt_text_to_style(self, text: str, target_profile: WritingStyleProfile) -> str:
        """텍스트를 목표 스타일에 맞게 적응"""
        try:
            adapted_text = text
            
            # 격식도 조정
            adapted_text = self._adjust_formality(adapted_text, target_profile.formality_level)
            
            # 어조 조정
            adapted_text = self._adjust_tone(adapted_text, target_profile.tone)
            
            # 어휘 수준 조정
            adapted_text = self._adjust_vocabulary(adapted_text, target_profile.vocabulary_level)
            
            # 문장 구조 조정
            adapted_text = self._adjust_sentence_structure(adapted_text, target_profile.sentence_structure)
            
            return adapted_text
            
        except Exception as e:
            logger.error(f"텍스트 스타일 적응 중 오류: {e}")
            return text
    
    def _adjust_formality(self, text: str, target_level: int) -> str:
        """격식도 조정"""
        if target_level == 1:  # 매우 비격식
            text = text.replace("습니다", "어")
            text = text.replace("입니다", "야")
            text = text.replace("하겠습니다", "할게")
        elif target_level == 2:  # 비격식
            text = text.replace("습니다", "어요")
            text = text.replace("입니다", "예요")
            text = text.replace("하겠습니다", "할게요")
        elif target_level == 4:  # 격식
            text = text.replace("어요", "습니다")
            text = text.replace("예요", "입니다")
            text = text.replace("할게요", "하겠습니다")
        elif target_level == 5:  # 매우 격식
            text = text.replace("어요", "습니다")
            text = text.replace("예요", "입니다")
            text = text.replace("할게요", "하시겠습니까")
        
        return text
    
    def _adjust_tone(self, text: str, target_tone: Tone) -> str:
        """어조 조정"""
        if target_tone == Tone.POLITE:
            text = "부탁드립니다. " + text
        elif target_tone == Tone.FRIENDLY:
            text = "안녕하세요! " + text
        elif target_tone == Tone.PROFESSIONAL:
            text = "전문적으로 말씀드리면, " + text
        elif target_tone == Tone.ENCOURAGING:
            text = "화이팅! " + text
        
        return text
    
    def _adjust_vocabulary(self, text: str, target_level: str) -> str:
        """어휘 수준 조정"""
        if target_level == "basic":
            # 복잡한 단어를 간단한 단어로 변경
            replacements = {
                "분석": "살펴보기",
                "구현": "만들기",
                "최적화": "좋게 만들기",
                "효율성": "효율"
            }
        elif target_level == "expert":
            # 간단한 단어를 전문 용어로 변경
            replacements = {
                "살펴보기": "분석",
                "만들기": "구현",
                "좋게 만들기": "최적화",
                "효율": "효율성"
            }
        else:
            replacements = {}
        
        for simple, complex in replacements.items():
            text = text.replace(simple, complex)
        
        return text
    
    def _adjust_sentence_structure(self, text: str, target_structure: str) -> str:
        """문장 구조 조정"""
        if target_structure == "simple":
            # 복잡한 문장을 단순한 문장으로 분리
            sentences = re.split(r'[.!?]', text)
            simple_sentences = []
            for sentence in sentences:
                if len(sentence.split()) > 15:
                    # 긴 문장을 두 개로 분리
                    words = sentence.split()
                    mid_point = len(words) // 2
                    simple_sentences.append(" ".join(words[:mid_point]) + ".")
                    simple_sentences.append(" ".join(words[mid_point:]) + ".")
                else:
                    simple_sentences.append(sentence + ".")
            text = " ".join(simple_sentences)
        elif target_structure == "complex":
            # 단순한 문장을 복잡한 문장으로 결합
            sentences = re.split(r'[.!?]', text)
            if len(sentences) > 1:
                text = sentences[0] + "이며, " + sentences[1] + "."
        
        return text
    
    async def generate_style_guide(self, profile: WritingStyleProfile) -> str:
        """스타일 가이드 생성"""
        try:
            guide_parts = []
            
            guide_parts.append("## 📝 글쓰기 스타일 가이드")
            guide_parts.append("")
            
            # 기본 정보
            guide_parts.append("### 🎯 기본 정보")
            guide_parts.append(f"- **스타일**: {profile.style.value}")
            guide_parts.append(f"- **어조**: {profile.tone.value}")
            guide_parts.append(f"- **대상 독자**: {profile.audience.value}")
            guide_parts.append(f"- **격식도**: {profile.formality_level}/5")
            guide_parts.append(f"- **복잡도**: {profile.complexity_level}/5")
            guide_parts.append("")
            
            # 상세 분석
            guide_parts.append("### 📊 상세 분석")
            guide_parts.append(f"- **감정적 톤**: {profile.emotional_tone}")
            guide_parts.append(f"- **문장 구조**: {profile.sentence_structure}")
            guide_parts.append(f"- **어휘 수준**: {profile.vocabulary_level}")
            guide_parts.append(f"- **문화적 맥락**: {profile.cultural_context}")
            guide_parts.append("")
            
            # 스타일별 특징
            guide_parts.append("### ✨ 스타일별 특징")
            
            if profile.style == WritingStyle.FORMAL:
                guide_parts.append("- 격식체 사용 (습니다, 입니다)")
                guide_parts.append("- 정중한 어조 유지")
                guide_parts.append("- 객관적 표현 선호")
            elif profile.style == WritingStyle.INFORMAL:
                guide_parts.append("- 비격식체 사용 (어, 야)")
                guide_parts.append("- 친근한 어조")
                guide_parts.append("- 주관적 표현 포함")
            elif profile.style == WritingStyle.ACADEMIC:
                guide_parts.append("- 학술적 용어 사용")
                guide_parts.append("- 논리적 구조 강조")
                guide_parts.append("- 객관적 근거 제시")
            elif profile.style == WritingStyle.BUSINESS:
                guide_parts.append("- 비즈니스 용어 사용")
                guide_parts.append("- 효율성 강조")
                guide_parts.append("- 결과 중심 표현")
            
            guide_parts.append("")
            
            # 어조별 특징
            guide_parts.append("### 🎭 어조별 특징")
            
            if profile.tone == Tone.POLITE:
                guide_parts.append("- 정중한 표현 사용")
                guide_parts.append("- 부탁드립니다, 감사합니다 등")
                guide_parts.append("- 존댓말 일관성 유지")
            elif profile.tone == Tone.FRIENDLY:
                guide_parts.append("- 친근한 표현 사용")
                guide_parts.append("- 웃음, 기쁨 등 긍정적 표현")
                guide_parts.append("- 대화체 선호")
            elif profile.tone == Tone.PROFESSIONAL:
                guide_parts.append("- 전문적 표현 사용")
                guide_parts.append("- 객관적 분석 강조")
                guide_parts.append("- 데이터 기반 설명")
            
            guide_parts.append("")
            
            # 개선 제안
            guide_parts.append("### 💡 개선 제안")
            
            if profile.formality_level < 3:
                guide_parts.append("- 더 격식적인 표현 사용을 고려하세요")
            elif profile.formality_level > 4:
                guide_parts.append("- 좀 더 친근한 표현을 사용해보세요")
            
            if profile.complexity_level < 3:
                guide_parts.append("- 문장을 더 복잡하게 구성해보세요")
            elif profile.complexity_level > 4:
                guide_parts.append("- 문장을 더 단순하게 만들어보세요")
            
            if profile.vocabulary_level == "basic":
                guide_parts.append("- 더 전문적인 어휘를 사용해보세요")
            elif profile.vocabulary_level == "expert":
                guide_parts.append("- 더 이해하기 쉬운 어휘를 사용해보세요")
            
            guide_parts.append("")
            guide_parts.append("---")
            guide_parts.append("*CORBU.AI Writing Style Engine이 제공하는 스타일 분석입니다*")
            
            return "\n".join(guide_parts)
            
        except Exception as e:
            logger.error(f"스타일 가이드 생성 중 오류: {e}")
            return f"## 오류 발생\n스타일 가이드 생성 중 오류가 발생했습니다: {str(e)}"
    
    async def get_writing_statistics(self) -> Dict[str, Any]:
        """글쓰기 스타일 통계"""
        return {
            "supported_styles": [style.value for style in WritingStyle],
            "supported_tones": [tone.value for tone in Tone],
            "supported_audiences": [audience.value for audience in Audience],
            "formality_levels": list(range(1, 6)),
            "complexity_levels": list(range(1, 6)),
            "sentence_structures": list(self.sentence_structures.keys()),
            "vocabulary_levels": list(self.vocabulary_levels.keys()),
            "engine_status": "active"
        }
