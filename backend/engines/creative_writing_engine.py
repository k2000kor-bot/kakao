"""
창작 글쓰기 및 창의적 기능 엔진
Creative Writing and Creative Features Engine
"""

import json
import time
import random
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import re
import math

class WritingGenre(Enum):
    """글쓰기 장르"""
    FICTION = "fiction"
    NON_FICTION = "non_fiction"
    POETRY = "poetry"
    DRAMA = "drama"
    ESSAY = "essay"
    BLOG = "blog"
    ARTICLE = "article"
    REVIEW = "review"
    DIARY = "diary"
    LETTER = "letter"
    SCRIPT = "script"
    MANUAL = "manual"
    REPORT = "report"
    PROPOSAL = "proposal"
    PRESENTATION = "presentation"

class WritingStyle(Enum):
    """글쓰기 스타일"""
    FORMAL = "formal"
    INFORMAL = "informal"
    ACADEMIC = "academic"
    CREATIVE = "creative"
    TECHNICAL = "technical"
    CONVERSATIONAL = "conversational"
    PERSUASIVE = "persuasive"
    NARRATIVE = "narrative"
    DESCRIPTIVE = "descriptive"
    ARGUMENTATIVE = "argumentative"
    EXPOSITORY = "expository"
    HUMOROUS = "humorous"
    DRAMATIC = "dramatic"
    ROMANTIC = "romantic"
    MYSTERIOUS = "mysterious"

class CreativeTechnique(Enum):
    """창의적 기법"""
    METAPHOR = "metaphor"
    SIMILE = "simile"
    PERSONIFICATION = "personification"
    ALLITERATION = "alliteration"
    RHYME = "rhyme"
    RHYTHM = "rhythm"
    IMAGERY = "imagery"
    SYMBOLISM = "symbolism"
    IRONY = "irony"
    FORESHADOWING = "foreshadowing"
    FLASHBACK = "flashback"
    STREAM_OF_CONSCIOUSNESS = "stream_of_consciousness"
    DIALOGUE = "dialogue"
    MONOLOGUE = "monologue"
    NARRATIVE_VOICE = "narrative_voice"

@dataclass
class WritingPrompt:
    """글쓰기 프롬프트"""
    prompt_id: str
    title: str
    description: str
    genre: WritingGenre
    style: WritingStyle
    techniques: List[CreativeTechnique]
    difficulty: int  # 1-5
    estimated_time: int  # 분
    keywords: List[str]
    constraints: List[str]
    inspiration: str

@dataclass
class CreativeContent:
    """창의적 콘텐츠"""
    content_id: str
    title: str
    content: str
    genre: WritingGenre
    style: WritingStyle
    techniques_used: List[CreativeTechnique]
    word_count: int
    character_count: int
    readability_score: float
    creativity_score: float
    emotional_tone: str
    target_audience: str
    created_at: datetime

class CreativeWritingEngine:
    """창작 글쓰기 엔진"""
    
    def __init__(self):
        self.writing_prompts = self._initialize_writing_prompts()
        self.creative_techniques = self._initialize_creative_techniques()
        self.genre_templates = self._initialize_genre_templates()
        self.style_guides = self._initialize_style_guides()
        self.korean_creative_expressions = self._initialize_korean_creative_expressions()
        
    def _initialize_writing_prompts(self) -> List[WritingPrompt]:
        """글쓰기 프롬프트 초기화"""
        return [
            WritingPrompt(
                prompt_id="prompt_001",
                title="시간을 되돌릴 수 있다면",
                description="과거의 한 순간을 다시 경험할 수 있다면 어떤 순간을 선택하시겠습니까? 그 순간의 감정과 경험을 생생하게 묘사해보세요.",
                genre=WritingGenre.ESSAY,
                style=WritingStyle.NARRATIVE,
                techniques=[CreativeTechnique.IMAGERY, CreativeTechnique.FLASHBACK, CreativeTechnique.DIALOGUE],
                difficulty=3,
                estimated_time=30,
                keywords=["시간", "과거", "추억", "감정", "경험"],
                constraints=["500자 이상", "구체적인 장면 묘사"],
                inspiration="인생의 중요한 순간들을 되돌아보며 깊이 있는 성찰을 해보세요."
            ),
            WritingPrompt(
                prompt_id="prompt_002",
                title="무声의 도시",
                description="모든 소리가 사라진 도시에서 일어나는 이야기를 써보세요. 소리 없이 살아가는 사람들의 모습과 그들의 감정을 상상해보세요.",
                genre=WritingGenre.FICTION,
                style=WritingStyle.CREATIVE,
                techniques=[CreativeTechnique.IMAGERY, CreativeTechnique.SYMBOLISM, CreativeTechnique.METAPHOR],
                difficulty=4,
                estimated_time=45,
                keywords=["소리", "도시", "침묵", "감각", "상상"],
                constraints=["1000자 이상", "감각적 묘사 중심"],
                inspiration="소리의 부재가 만들어내는 독특한 세계를 상상해보세요."
            ),
            WritingPrompt(
                prompt_id="prompt_003",
                title="AI와의 대화",
                description="인공지능과 나눈 대화를 바탕으로 한 에세이를 써보세요. 기술과 인간성의 경계에서 느끼는 감정과 생각을 표현해보세요.",
                genre=WritingGenre.ESSAY,
                style=WritingStyle.REFLECTIVE,
                techniques=[CreativeTechnique.DIALOGUE, CreativeTechnique.IRONY, CreativeTechnique.SYMBOLISM],
                difficulty=3,
                estimated_time=40,
                keywords=["AI", "인공지능", "대화", "기술", "인간성"],
                constraints=["800자 이상", "철학적 성찰 포함"],
                inspiration="현대 기술과 인간의 관계에 대해 깊이 생각해보세요."
            ),
            WritingPrompt(
                prompt_id="prompt_004",
                title="마지막 편지",
                description="소중한 사람에게 쓸 마지막 편지를 상상해보세요. 전하고 싶은 모든 말과 감정을 담아보세요.",
                genre=WritingGenre.LETTER,
                style=WritingStyle.EMOTIONAL,
                techniques=[CreativeTechnique.MONOLOGUE, CreativeTechnique.IMAGERY, CreativeTechnique.SYMBOLISM],
                difficulty=4,
                estimated_time=35,
                keywords=["편지", "마지막", "사랑", "감사", "이별"],
                constraints=["600자 이상", "진정성 있는 감정 표현"],
                inspiration="진정한 마음을 전하는 방법에 대해 생각해보세요."
            ),
            WritingPrompt(
                prompt_id="prompt_005",
                title="꿈의 해석",
                description="최근 꾼 꿈을 바탕으로 한 창작 소설을 써보세요. 꿈의 상징과 의미를 현실적인 이야기로 풀어내보세요.",
                genre=WritingGenre.FICTION,
                style=WritingStyle.SURREAL,
                techniques=[CreativeTechnique.SYMBOLISM, CreativeTechnique.IMAGERY, CreativeTechnique.FORESHADOWING],
                difficulty=5,
                estimated_time=60,
                keywords=["꿈", "상징", "현실", "무의식", "이야기"],
                constraints=["1500자 이상", "상징적 의미 포함"],
                inspiration="꿈과 현실의 경계를 넘나드는 이야기를 만들어보세요."
            )
        ]
    
    def _initialize_creative_techniques(self) -> Dict[CreativeTechnique, Dict[str, Any]]:
        """창의적 기법 초기화"""
        return {
            CreativeTechnique.METAPHOR: {
                "description": "은유법 - 직접적인 비교 없이 간접적으로 표현",
                "examples": ["시간은 금이다", "인생은 여행이다", "마음은 바다다"],
                "korean_examples": ["시간은 흐르는 강물", "인생은 무대", "마음은 하늘"],
                "usage_tips": ["구체적이고 생생한 이미지 사용", "독창적인 연결점 찾기", "감정적 공감대 형성"]
            },
            CreativeTechnique.SIMILE: {
                "description": "직유법 - '~같이', '~처럼'을 사용한 직접적 비교",
                "examples": ["눈처럼 하얗다", "바람처럼 빠르다", "꽃처럼 아름답다"],
                "korean_examples": ["눈처럼 하얗다", "바람처럼 빠르다", "꽃처럼 아름답다"],
                "usage_tips": ["친숙한 이미지 사용", "감각적 표현 활용", "과도한 사용 피하기"]
            },
            CreativeTechnique.PERSONIFICATION: {
                "description": "의인법 - 사물이나 추상적 개념을 사람처럼 표현",
                "examples": ["바람이 속삭인다", "꽃이 웃는다", "시간이 흘러간다"],
                "korean_examples": ["바람이 속삭인다", "꽃이 웃는다", "시간이 흘러간다"],
                "usage_tips": ["생동감 있는 표현", "감정적 연결점 만들기", "과도한 사용 피하기"]
            },
            CreativeTechnique.ALLITERATION: {
                "description": "두운법 - 같은 소리로 시작하는 단어들을 나열",
                "examples": ["빠르고 빠른 바람", "깊고 깊은 밤", "높고 높은 산"],
                "korean_examples": ["빠르고 빠른 바람", "깊고 깊은 밤", "높고 높은 산"],
                "usage_tips": ["리듬감 있는 표현", "기억하기 쉬운 문장", "과도한 사용 피하기"]
            },
            CreativeTechnique.RHYME: {
                "description": "운율법 - 비슷한 소리로 끝나는 단어들 사용",
                "examples": ["꽃과 밤", "바람과 감", "하늘과 물"],
                "korean_examples": ["꽃과 밤", "바람과 감", "하늘과 물"],
                "usage_tips": ["자연스러운 운율", "강조하고 싶은 부분에 사용", "과도한 사용 피하기"]
            },
            CreativeTechnique.IMAGERY: {
                "description": "이미지법 - 감각적이고 생생한 묘사",
                "examples": ["따뜻한 햇살", "시원한 바람", "달콤한 향기"],
                "korean_examples": ["따뜻한 햇살", "시원한 바람", "달콤한 향기"],
                "usage_tips": ["오감을 활용한 묘사", "구체적이고 생생한 표현", "독자의 상상력 자극"]
            },
            CreativeTechnique.SYMBOLISM: {
                "description": "상징법 - 구체적인 사물로 추상적인 개념 표현",
                "examples": ["빨간 장미 = 사랑", "흰 비둘기 = 평화", "검은 까마귀 = 불길"],
                "korean_examples": ["빨간 장미 = 사랑", "흰 비둘기 = 평화", "검은 까마귀 = 불길"],
                "usage_tips": ["일관된 상징 사용", "독자가 이해할 수 있는 상징", "깊이 있는 의미 전달"]
            },
            CreativeTechnique.IRONY: {
                "description": "반어법 - 말의 뜻과 반대되는 의미로 표현",
                "examples": ["정말 좋은 날이네", "완벽한 실패작이야", "훌륭한 아이디어구나"],
                "korean_examples": ["정말 좋은 날이네", "완벽한 실패작이야", "훌륭한 아이디어구나"],
                "usage_tips": ["독자가 이해할 수 있는 반어", "과도한 사용 피하기", "적절한 상황에서 사용"]
            },
            CreativeTechnique.FORESHADOWING: {
                "description": "복선법 - 앞으로 일어날 일을 미리 암시",
                "examples": ["어둠이 깊어지고 있었다", "바람이 불기 시작했다", "새벽이 다가오고 있었다"],
                "korean_examples": ["어둠이 깊어지고 있었다", "바람이 불기 시작했다", "새벽이 다가오고 있었다"],
                "usage_tips": ["자연스러운 암시", "과도한 노출 피하기", "독자의 관심 유발"]
            },
            CreativeTechnique.FLASHBACK: {
                "description": "회상법 - 과거의 사건을 현재에 되돌아가서 서술",
                "examples": ["그때를 생각하면", "옛날에는", "과거의 기억이"],
                "korean_examples": ["그때를 생각하면", "옛날에는", "과거의 기억이"],
                "usage_tips": ["명확한 시간 전환", "과거와 현재의 연결", "독자의 이해도 고려"]
            }
        }
    
    def _initialize_genre_templates(self) -> Dict[WritingGenre, Dict[str, Any]]:
        """장르별 템플릿 초기화"""
        return {
            WritingGenre.FICTION: {
                "structure": ["도입", "전개", "위기", "절정", "결말"],
                "elements": ["인물", "배경", "갈등", "주제", "플롯"],
                "style_guide": "생동감 있는 묘사와 대화 중심",
                "korean_characteristics": "한국적 정서와 문화적 배경 반영"
            },
            WritingGenre.ESSAY: {
                "structure": ["서론", "본론", "결론"],
                "elements": ["논제", "논증", "근거", "반박", "결론"],
                "style_guide": "논리적이고 체계적인 서술",
                "korean_characteristics": "한국적 사고방식과 가치관 반영"
            },
            WritingGenre.POETRY: {
                "structure": ["연", "행", "운율", "리듬"],
                "elements": ["이미지", "상징", "은유", "운율", "리듬"],
                "style_guide": "감정적이고 시적인 표현",
                "korean_characteristics": "한국 시의 전통과 현대적 감각 결합"
            },
            WritingGenre.DRAMA: {
                "structure": ["1막", "2막", "3막", "에필로그"],
                "elements": ["인물", "대사", "행동", "갈등", "주제"],
                "style_guide": "대화와 행동 중심의 서술",
                "korean_characteristics": "한국적 갈등과 정서 표현"
            },
            WritingGenre.BLOG: {
                "structure": ["제목", "도입", "본문", "결론", "태그"],
                "elements": ["개인적 경험", "의견", "정보", "감정", "상호작용"],
                "style_guide": "친근하고 개인적인 톤",
                "korean_characteristics": "한국 독자와의 공감대 형성"
            }
        }
    
    def _initialize_style_guides(self) -> Dict[WritingStyle, Dict[str, Any]]:
        """스타일 가이드 초기화"""
        return {
            WritingStyle.FORMAL: {
                "characteristics": ["정중한 어조", "객관적 서술", "격식 있는 표현"],
                "korean_characteristics": ["존댓말 사용", "격식 있는 문체", "객관적 서술"],
                "usage": "공식 문서, 학술 논문, 비즈니스 문서"
            },
            WritingStyle.INFORMAL: {
                "characteristics": ["친근한 어조", "주관적 서술", "일상적 표현"],
                "korean_characteristics": ["반말 사용", "친근한 문체", "개인적 서술"],
                "usage": "개인 블로그, 일기, 친구와의 대화"
            },
            WritingStyle.CREATIVE: {
                "characteristics": ["창의적 표현", "감정적 서술", "예술적 묘사"],
                "korean_characteristics": ["시적 표현", "감정적 서술", "예술적 묘사"],
                "usage": "소설, 시, 창작 에세이"
            },
            WritingStyle.TECHNICAL: {
                "characteristics": ["정확한 용어", "논리적 서술", "구체적 설명"],
                "korean_characteristics": ["전문 용어 사용", "논리적 서술", "구체적 설명"],
                "usage": "기술 문서, 매뉴얼, 보고서"
            },
            WritingStyle.CONVERSATIONAL: {
                "characteristics": ["대화체", "자연스러운 표현", "상호작용"],
                "korean_characteristics": ["대화체 문장", "자연스러운 표현", "상호작용"],
                "usage": "인터뷰, 대화록, 토크쇼"
            }
        }
    
    def _initialize_korean_creative_expressions(self) -> Dict[str, List[str]]:
        """한국어 창의적 표현 초기화"""
        return {
            "korean_metaphors": [
                "시간은 흐르는 강물",
                "인생은 무대",
                "마음은 하늘",
                "사랑은 꽃",
                "희망은 별"
            ],
            "korean_similes": [
                "눈처럼 하얗다",
                "바람처럼 빠르다",
                "꽃처럼 아름답다",
                "물처럼 맑다",
                "불처럼 뜨겁다"
            ],
            "korean_personifications": [
                "바람이 속삭인다",
                "꽃이 웃는다",
                "시간이 흘러간다",
                "달이 웃는다",
                "별이 반짝인다"
            ],
            "korean_alliterations": [
                "빠르고 빠른 바람",
                "깊고 깊은 밤",
                "높고 높은 산",
                "넓고 넓은 바다",
                "밝고 밝은 햇살"
            ],
            "korean_rhymes": [
                "꽃과 밤",
                "바람과 감",
                "하늘과 물",
                "사랑과 방",
                "꿈과 음"
            ]
        }
    
    def generate_writing_prompt(self, genre: Optional[WritingGenre] = None, 
                              style: Optional[WritingStyle] = None, 
                              difficulty: Optional[int] = None) -> WritingPrompt:
        """글쓰기 프롬프트 생성"""
        available_prompts = self.writing_prompts
        
        # 장르 필터링
        if genre:
            available_prompts = [p for p in available_prompts if p.genre == genre]
        
        # 스타일 필터링
        if style:
            available_prompts = [p for p in available_prompts if p.style == style]
        
        # 난이도 필터링
        if difficulty:
            available_prompts = [p for p in available_prompts if p.difficulty == difficulty]
        
        if not available_prompts:
            # 기본 프롬프트 반환
            return self.writing_prompts[0]
        
        return random.choice(available_prompts)
    
    def analyze_writing_style(self, text: str) -> Dict[str, Any]:
        """글쓰기 스타일 분석"""
        analysis = {
            "genre": self._detect_genre(text),
            "style": self._detect_style(text),
            "techniques_used": self._detect_creative_techniques(text),
            "korean_characteristics": self._analyze_korean_characteristics(text),
            "readability_score": self._calculate_readability_score(text),
            "creativity_score": self._calculate_creativity_score(text),
            "emotional_tone": self._detect_emotional_tone(text),
            "target_audience": self._detect_target_audience(text),
            "improvement_suggestions": []
        }
        
        # 개선 제안 생성
        analysis["improvement_suggestions"] = self._generate_improvement_suggestions(analysis)
        
        return analysis
    
    def _detect_genre(self, text: str) -> WritingGenre:
        """장르 감지"""
        # 소설 특징
        if any(keyword in text for keyword in ["그는", "그녀는", "인물", "등장인물", "주인공"]):
            return WritingGenre.FICTION
        
        # 에세이 특징
        if any(keyword in text for keyword in ["생각해보니", "이런", "그런", "개인적으로", "의견"]):
            return WritingGenre.ESSAY
        
        # 시 특징
        if any(keyword in text for keyword in ["연", "행", "운율", "리듬", "시적"]):
            return WritingGenre.POETRY
        
        # 드라마 특징
        if any(keyword in text for keyword in ["대사", "행동", "무대", "배우", "연기"]):
            return WritingGenre.DRAMA
        
        # 블로그 특징
        if any(keyword in text for keyword in ["오늘", "어제", "최근", "개인", "경험"]):
            return WritingGenre.BLOG
        
        return WritingGenre.ESSAY  # 기본값
    
    def _detect_style(self, text: str) -> WritingStyle:
        """스타일 감지"""
        # 격식체 특징
        if any(keyword in text for keyword in ["습니다", "입니다", "하겠습니다", "드리겠습니다"]):
            return WritingStyle.FORMAL
        
        # 반말체 특징
        if any(keyword in text for keyword in ["어", "야", "지", "다", "해"]):
            return WritingStyle.INFORMAL
        
        # 창의적 특징
        if any(keyword in text for keyword in ["은유", "상징", "이미지", "시적", "예술적"]):
            return WritingStyle.CREATIVE
        
        # 기술적 특징
        if any(keyword in text for keyword in ["데이터", "분석", "결과", "연구", "실험"]):
            return WritingStyle.TECHNICAL
        
        # 대화체 특징
        if any(keyword in text for keyword in ["라고", "하고", "대화", "말씀", "이야기"]):
            return WritingStyle.CONVERSATIONAL
        
        return WritingStyle.INFORMAL  # 기본값
    
    def _detect_creative_techniques(self, text: str) -> List[CreativeTechnique]:
        """창의적 기법 감지"""
        techniques = []
        
        # 은유법 감지
        if any(keyword in text for keyword in ["은", "는", "이", "가", "을", "를"]):
            techniques.append(CreativeTechnique.METAPHOR)
        
        # 직유법 감지
        if any(keyword in text for keyword in ["같이", "처럼", "만큼", "비해"]):
            techniques.append(CreativeTechnique.SIMILE)
        
        # 의인법 감지
        if any(keyword in text for keyword in ["속삭인다", "웃는다", "흘러간다", "반짝인다"]):
            techniques.append(CreativeTechnique.PERSONIFICATION)
        
        # 이미지법 감지
        if any(keyword in text for keyword in ["따뜻한", "시원한", "달콤한", "향기", "색깔"]):
            techniques.append(CreativeTechnique.IMAGERY)
        
        # 상징법 감지
        if any(keyword in text for keyword in ["빨간", "흰", "검은", "상징", "의미"]):
            techniques.append(CreativeTechnique.SYMBOLISM)
        
        return techniques
    
    def _analyze_korean_characteristics(self, text: str) -> Dict[str, Any]:
        """한국어 특징 분석"""
        characteristics = {
            "honorific_usage": "none",
            "formality_level": "neutral",
            "emotional_expression": "neutral",
            "cultural_elements": [],
            "dialect_usage": "none"
        }
        
        # 존댓말 사용 분석
        if any(keyword in text for keyword in ["님", "께서", "께서는", "께서도"]):
            characteristics["honorific_usage"] = "respectful"
        elif any(keyword in text for keyword in ["제가", "저는", "저희가"]):
            characteristics["honorific_usage"] = "humble"
        
        # 격식 수준 분석
        if any(keyword in text for keyword in ["습니다", "입니다", "하겠습니다"]):
            characteristics["formality_level"] = "formal"
        elif any(keyword in text for keyword in ["어", "야", "지", "다", "해"]):
            characteristics["formality_level"] = "informal"
        
        # 감정 표현 분석
        if any(keyword in text for keyword in ["정말", "너무", "완전", "진짜", "엄청"]):
            characteristics["emotional_expression"] = "intense"
        elif any(keyword in text for keyword in ["조금", "약간", "살짝", "좀"]):
            characteristics["emotional_expression"] = "soft"
        
        # 문화적 요소 분석
        cultural_elements = []
        if any(keyword in text for keyword in ["한국", "우리나라", "전통", "문화"]):
            cultural_elements.append("전통문화")
        if any(keyword in text for keyword in ["가족", "부모", "형제", "자매"]):
            cultural_elements.append("가족중심")
        if any(keyword in text for keyword in ["정", "인정", "정서", "마음"]):
            cultural_elements.append("정서중심")
        
        characteristics["cultural_elements"] = cultural_elements
        
        return characteristics
    
    def _calculate_readability_score(self, text: str) -> float:
        """가독성 점수 계산"""
        words = text.split()
        sentences = re.split(r'[.!?]', text)
        
        if not words or not sentences:
            return 0.0
        
        # 평균 문장 길이
        avg_sentence_length = len(words) / len(sentences)
        
        # 평균 단어 길이
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # 가독성 점수 (낮을수록 읽기 쉬움)
        readability = (avg_sentence_length * 0.4) + (avg_word_length * 0.6)
        return max(0.0, min(1.0, 1.0 - (readability / 20)))
    
    def _calculate_creativity_score(self, text: str) -> float:
        """창의성 점수 계산"""
        creativity_score = 0.0
        
        # 창의적 기법 사용 점수
        techniques_used = self._detect_creative_techniques(text)
        creativity_score += len(techniques_used) * 0.2
        
        # 독창적인 표현 점수
        unique_words = len(set(text.split()))
        total_words = len(text.split())
        if total_words > 0:
            creativity_score += (unique_words / total_words) * 0.3
        
        # 감정적 표현 점수
        emotional_words = ["기쁨", "슬픔", "화", "사랑", "미움", "희망", "절망", "행복", "불행"]
        emotional_count = sum(1 for word in emotional_words if word in text)
        creativity_score += (emotional_count / max(total_words, 1)) * 0.2
        
        # 상상력 점수
        imaginative_words = ["상상", "꿈", "환상", "기적", "마법", "신비", "신기"]
        imaginative_count = sum(1 for word in imaginative_words if word in text)
        creativity_score += (imaginative_count / max(total_words, 1)) * 0.3
        
        return min(creativity_score, 1.0)
    
    def _detect_emotional_tone(self, text: str) -> str:
        """감정 톤 감지"""
        positive_words = ["기쁨", "행복", "좋아", "만족", "성취", "성공", "희망", "즐거워", "신나", "웃음"]
        negative_words = ["슬퍼", "우울", "속상", "눈물", "아픔", "힘들어", "지쳐", "절망", "화나", "짜증"]
        neutral_words = ["괜찮아", "보통", "그냥", "평범", "일반적", "보통"]
        
        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)
        neutral_count = sum(1 for word in neutral_words if word in text)
        
        if positive_count > negative_count and positive_count > neutral_count:
            return "positive"
        elif negative_count > positive_count and negative_count > neutral_count:
            return "negative"
        else:
            return "neutral"
    
    def _detect_target_audience(self, text: str) -> str:
        """대상 독자 감지"""
        # 전문가 대상
        if any(keyword in text for keyword in ["전문가", "연구자", "학자", "전문", "기술", "분석"]):
            return "전문가"
        
        # 일반인 대상
        if any(keyword in text for keyword in ["일반", "보통", "평범", "일상", "생활"]):
            return "일반인"
        
        # 청소년 대상
        if any(keyword in text for keyword in ["청소년", "학생", "학교", "공부", "친구"]):
            return "청소년"
        
        # 어린이 대상
        if any(keyword in text for keyword in ["어린이", "아이", "동화", "이야기", "재미"]):
            return "어린이"
        
        return "일반인"  # 기본값
    
    def _generate_improvement_suggestions(self, analysis: Dict[str, Any]) -> List[str]:
        """개선 제안 생성"""
        suggestions = []
        
        # 가독성 개선 제안
        if analysis["readability_score"] < 0.5:
            suggestions.append("문장을 더 짧고 명확하게 작성해보세요.")
            suggestions.append("복잡한 단어를 더 간단한 단어로 바꿔보세요.")
        
        # 창의성 개선 제안
        if analysis["creativity_score"] < 0.5:
            suggestions.append("은유법이나 직유법을 사용해보세요.")
            suggestions.append("감각적 묘사를 추가해보세요.")
            suggestions.append("독창적인 표현을 시도해보세요.")
        
        # 감정 표현 개선 제안
        if analysis["emotional_tone"] == "neutral":
            suggestions.append("감정적 표현을 추가해보세요.")
            suggestions.append("독자의 감정에 호소하는 문장을 써보세요.")
        
        # 창의적 기법 개선 제안
        if len(analysis["techniques_used"]) < 2:
            suggestions.append("다양한 창의적 기법을 사용해보세요.")
            suggestions.append("은유, 직유, 의인법 등을 활용해보세요.")
        
        return suggestions
    
    def generate_creative_content(self, prompt: WritingPrompt, user_input: str = "") -> CreativeContent:
        """창의적 콘텐츠 생성"""
        # 프롬프트 기반 콘텐츠 생성
        content = self._generate_content_from_prompt(prompt, user_input)
        
        # 콘텐츠 분석
        analysis = self.analyze_writing_style(content)
        
        # 창의적 콘텐츠 객체 생성
        creative_content = CreativeContent(
            content_id=f"content_{int(time.time())}",
            title=prompt.title,
            content=content,
            genre=prompt.genre,
            style=prompt.style,
            techniques_used=analysis["techniques_used"],
            word_count=len(content.split()),
            character_count=len(content),
            readability_score=analysis["readability_score"],
            creativity_score=analysis["creativity_score"],
            emotional_tone=analysis["emotional_tone"],
            target_audience=analysis["target_audience"],
            created_at=datetime.now()
        )
        
        return creative_content
    
    def _generate_content_from_prompt(self, prompt: WritingPrompt, user_input: str) -> str:
        """프롬프트 기반 콘텐츠 생성"""
        # 기본 템플릿
        template = f"""
# {prompt.title}

{prompt.description}

## 시작하기

{prompt.inspiration}

## 제약사항
{', '.join(prompt.constraints)}

## 사용할 기법
{', '.join([technique.value for technique in prompt.techniques])}

---

## 나의 글쓰기

{user_input if user_input else "여기에 글을 써보세요..."}
"""
        
        return template.strip()
    
    def get_creative_techniques_guide(self) -> Dict[CreativeTechnique, Dict[str, Any]]:
        """창의적 기법 가이드 반환"""
        return self.creative_techniques
    
    def get_genre_templates(self) -> Dict[WritingGenre, Dict[str, Any]]:
        """장르별 템플릿 반환"""
        return self.genre_templates
    
    def get_style_guides(self) -> Dict[WritingStyle, Dict[str, Any]]:
        """스타일 가이드 반환"""
        return self.style_guides
    
    def get_korean_creative_expressions(self) -> Dict[str, List[str]]:
        """한국어 창의적 표현 반환"""
        return self.korean_creative_expressions
