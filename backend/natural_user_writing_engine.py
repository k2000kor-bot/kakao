#!/usr/bin/env python3
"""
자연스러운 유저 글쓰기 엔진 - 실제 유저가 작성한 글처럼
Natural User Writing Engine - Like Real User Generated Content

Features:
- 실제 유저 글 스타일 모방
- 자연스러운 문법과 어투
- 웹 검색 기반 실시간 학습
- 일반인 눈높이 맞춤 콘텐츠
- 댓글/포럼 스타일 지원
"""

import time
import json
import logging
import random
import re
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import queue

logger = logging.getLogger(__name__)

class UserLevel(Enum):
    """사용자 수준"""
    BEGINNER = "beginner"           # 초보자
    INTERMEDIATE = "intermediate"   # 중급자
    ADVANCED = "advanced"           # 고급자
    EXPERT = "expert"               # 전문가

class WritingTone(Enum):
    """글쓰기 톤"""
    CASUAL = "casual"               # 캐주얼
    FRIENDLY = "friendly"           # 친근함
    PROFESSIONAL = "professional"   # 전문적
    HUMOROUS = "humorous"           # 유머러스
    SERIOUS = "serious"             # 진지함
    ENTHUSIASTIC = "enthusiastic"   # 열정적

class ContentType(Enum):
    """콘텐츠 타입"""
    POST = "post"                   # 게시글
    COMMENT = "comment"             # 댓글
    REVIEW = "review"               # 리뷰
    GUIDE = "guide"                 # 가이드
    OPINION = "opinion"             # 의견
    EXPERIENCE = "experience"       # 경험담

@dataclass
class UserProfile:
    """사용자 프로필"""
    level: UserLevel
    tone: WritingTone
    interests: List[str]
    writing_style: str
    common_phrases: List[str]
    vocabulary_level: str
    age_group: str
    region: str

@dataclass
class WebSearchResult:
    """웹 검색 결과"""
    title: str
    content: str
    source: str
    url: str
    relevance_score: float
    user_rating: float
    comment_count: int
    timestamp: datetime

@dataclass
class NaturalContent:
    """자연스러운 콘텐츠"""
    content: str
    user_level: UserLevel
    tone: WritingTone
    content_type: ContentType
    word_count: int
    readability_score: float
    naturalness_score: float
    engagement_score: float
    metadata: Dict[str, Any]

class NaturalUserWritingEngine:
    """자연스러운 유저 글쓰기 엔진"""
    
    def __init__(self):
        self.user_profiles = self._initialize_user_profiles()
        self.natural_patterns = self._initialize_natural_patterns()
        self.web_search_cache = {}
        self.content_templates = self._initialize_content_templates()
        self.vocabulary_levels = self._initialize_vocabulary_levels()
        self.regional_expressions = self._initialize_regional_expressions()
        
        print("✅ 자연스러운 유저 글쓰기 엔진 초기화 완료")
    
    def _initialize_user_profiles(self) -> Dict[str, UserProfile]:
        """사용자 프로필 초기화"""
        return {
            "beginner": UserProfile(
                level=UserLevel.BEGINNER,
                tone=WritingTone.CASUAL,
                interests=["일상", "취미", "기초"],
                writing_style="간단하고 직관적",
                common_phrases=["정말", "진짜", "완전", "너무", "엄청"],
                vocabulary_level="basic",
                age_group="20-30",
                region="seoul"
            ),
            "intermediate": UserProfile(
                level=UserLevel.INTERMEDIATE,
                tone=WritingTone.FRIENDLY,
                interests=["학습", "개발", "비즈니스"],
                writing_style="균형잡힌 설명",
                common_phrases=["확실히", "분명히", "아마도", "아마", "혹시"],
                vocabulary_level="intermediate",
                age_group="25-35",
                region="seoul"
            ),
            "advanced": UserProfile(
                level=UserLevel.ADVANCED,
                tone=WritingTone.PROFESSIONAL,
                interests=["전문분야", "리더십", "전략"],
                writing_style="체계적이고 논리적",
                common_phrases=["따라서", "그러므로", "결론적으로", "요약하면"],
                vocabulary_level="advanced",
                age_group="30-45",
                region="seoul"
            ),
            "expert": UserProfile(
                level=UserLevel.EXPERT,
                tone=WritingTone.PROFESSIONAL,
                interests=["연구", "혁신", "전문성"],
                writing_style="정확하고 전문적",
                common_phrases=["분석 결과", "연구에 따르면", "전문가 의견"],
                vocabulary_level="expert",
                age_group="35+",
                region="seoul"
            )
        }
    
    def _initialize_natural_patterns(self) -> Dict[str, List[str]]:
        """자연스러운 패턴 초기화"""
        return {
            "greetings": [
                "안녕하세요!",
                "안녕하세요~",
                "안녕하세요^^",
                "안녕하세요!",
                "안녕하세요.",
                "안녕하세요",
                "안녕하세요~~"
            ],
            "transitions": [
                "그런데",
                "그리고",
                "또한",
                "또",
                "그래서",
                "그러니까",
                "그러면",
                "그런데",
                "아니면",
                "하지만",
                "그러나",
                "그럼에도"
            ],
            "emphasis": [
                "정말",
                "진짜",
                "완전",
                "너무",
                "엄청",
                "정말로",
                "진심으로",
                "확실히",
                "분명히",
                "아마도",
                "아마",
                "혹시"
            ],
            "conclusions": [
                "이상입니다!",
                "이상이에요!",
                "이상입니다^^",
                "이상이에요~",
                "이상입니다.",
                "이상이에요.",
                "이상입니다",
                "이상이에요",
                "감사합니다!",
                "감사해요!",
                "감사합니다^^",
                "감사해요~"
            ],
            "questions": [
                "어떻게 생각하세요?",
                "어떻게 생각하시나요?",
                "어떠신가요?",
                "어떠세요?",
                "어떤가요?",
                "어떠신지요?",
                "어떠신지 궁금해요",
                "어떠신지 궁금합니다"
            ],
            "agreement": [
                "맞아요!",
                "맞습니다!",
                "정말 그래요!",
                "정말 그렇습니다!",
                "완전 동감해요!",
                "완전 동감합니다!",
                "저도 그렇게 생각해요!",
                "저도 그렇게 생각합니다!"
            ],
            "disagreement": [
                "음... 좀 다를 것 같아요",
                "음... 좀 다를 것 같습니다",
                "저는 좀 다르게 생각해요",
                "저는 좀 다르게 생각합니다",
                "아니면 다른 방법도 있을 것 같은데요",
                "아니면 다른 방법도 있을 것 같은데요"
            ]
        }
    
    def _initialize_content_templates(self) -> Dict[str, Dict]:
        """콘텐츠 템플릿 초기화"""
        return {
            "post": {
                "structure": [
                    "인사말",
                    "주제 소개",
                    "본문 내용",
                    "개인 의견",
                    "마무리"
                ],
                "tone": "friendly",
                "length": "medium"
            },
            "comment": {
                "structure": [
                    "간단한 반응",
                    "의견 제시",
                    "마무리"
                ],
                "tone": "casual",
                "length": "short"
            },
            "review": {
                "structure": [
                    "경험 소개",
                    "상세 리뷰",
                    "장단점",
                    "추천 여부"
                ],
                "tone": "honest",
                "length": "medium"
            },
            "guide": {
                "structure": [
                    "목적 설명",
                    "단계별 설명",
                    "주의사항",
                    "마무리"
                ],
                "tone": "helpful",
                "length": "long"
            },
            "opinion": {
                "structure": [
                    "주장 제시",
                    "근거 설명",
                    "반박 고려",
                    "결론"
                ],
                "tone": "persuasive",
                "length": "medium"
            },
            "experience": {
                "structure": [
                    "상황 설명",
                    "경험 과정",
                    "느낀 점",
                    "조언"
                ],
                "tone": "personal",
                "length": "medium"
            }
        }
    
    def _initialize_vocabulary_levels(self) -> Dict[str, List[str]]:
        """어휘 수준 초기화"""
        return {
            "basic": [
                "좋다", "나쁘다", "크다", "작다", "많다", "적다",
                "빠르다", "느리다", "쉽다", "어렵다", "재미있다", "지루하다"
            ],
            "intermediate": [
                "효과적", "효율적", "적절한", "적합한", "유용한", "필요한",
                "중요한", "필수적인", "기본적인", "핵심적인", "주요한", "대표적인"
            ],
            "advanced": [
                "체계적", "논리적", "합리적", "객관적", "주관적", "전문적",
                "구체적", "추상적", "실용적", "이론적", "실증적", "경험적"
            ],
            "expert": [
                "분석적", "종합적", "포괄적", "심층적", "근본적", "본질적",
                "혁신적", "창의적", "독창적", "독특한", "특별한", "특수한"
            ]
        }
    
    def _initialize_regional_expressions(self) -> Dict[str, List[str]]:
        """지역별 표현 초기화"""
        return {
            "seoul": [
                "~네요", "~어요", "~에요", "~죠", "~지요", "~거든요"
            ],
            "busan": [
                "~다이", "~이야", "~야", "~거라", "~거든"
            ],
            "jeju": [
                "~우다", "~우꽈", "~우게", "~우소"
            ],
            "general": [
                "~네요", "~어요", "~에요", "~죠", "~지요"
            ]
        }
    
    def generate_natural_content(self,
                                topic: str,
                                user_level: UserLevel = UserLevel.INTERMEDIATE,
                                content_type: ContentType = ContentType.POST,
                                tone: WritingTone = WritingTone.FRIENDLY,
                                word_count_target: int = 300,
                                include_web_search: bool = True,
                                region: str = "seoul") -> NaturalContent:
        """자연스러운 콘텐츠 생성"""
        
        try:
            print(f"🖊️ 자연스러운 콘텐츠 생성 시작: {topic[:30]}...")
            
            # 1. 웹 검색으로 관련 정보 수집
            web_results = []
            if include_web_search:
                web_results = self._search_web_content(topic)
            
            # 2. 사용자 프로필 가져오기
            user_profile = self.user_profiles[user_level.value]
            
            # 3. 콘텐츠 템플릿 선택
            template = self.content_templates[content_type.value]
            
            # 4. 자연스러운 콘텐츠 생성
            content = self._generate_natural_text(
                topic, user_profile, template, web_results, tone, region
            )
            
            # 5. 단어 수 조정
            content = self._adjust_word_count(content, word_count_target)
            
            # 6. 자연스러움 점수 계산
            naturalness_score = self._calculate_naturalness_score(content, user_profile)
            readability_score = self._calculate_readability_score(content)
            engagement_score = self._calculate_engagement_score(content)
            
            result = NaturalContent(
                content=content,
                user_level=user_level,
                tone=tone,
                content_type=content_type,
                word_count=len(content.split()),
                readability_score=readability_score,
                naturalness_score=naturalness_score,
                engagement_score=engagement_score,
                metadata={
                    "web_sources": len(web_results),
                    "template_used": content_type.value,
                    "region": region,
                    "generation_time": datetime.now().isoformat()
                }
            )
            
            print(f"✅ 자연스러운 콘텐츠 생성 완료: {result.word_count}단어, 자연스러움 {naturalness_score:.2f}")
            
            return result
            
        except Exception as e:
            logger.error(f"자연스러운 콘텐츠 생성 오류: {e}")
            return self._create_fallback_content(topic, str(e))
    
    def _search_web_content(self, topic: str) -> List[WebSearchResult]:
        """웹 콘텐츠 검색"""
        # 캐시 확인
        if topic in self.web_search_cache:
            return self.web_search_cache[topic]
        
        # 실제로는 웹 검색 API 사용
        # 여기서는 시뮬레이션
        web_results = [
            WebSearchResult(
                title=f"{topic}에 대한 일반적인 정보",
                content=f"{topic}에 대해 많은 사람들이 관심을 가지고 있습니다. 실제 사용자들의 경험과 의견을 종합해보면...",
                source="네이버 블로그",
                url="https://blog.naver.com/example",
                relevance_score=0.9,
                user_rating=4.2,
                comment_count=15,
                timestamp=datetime.now()
            ),
            WebSearchResult(
                title=f"{topic} 실제 사용 후기",
                content=f"저도 {topic}를 사용해봤는데 정말 좋았어요! 처음에는 어려울 줄 알았는데 생각보다 쉽더라고요.",
                source="다음 카페",
                url="https://cafe.daum.net/example",
                relevance_score=0.8,
                user_rating=4.5,
                comment_count=23,
                timestamp=datetime.now()
            ),
            WebSearchResult(
                title=f"{topic} 완전 정리",
                content=f"{topic}에 대해 궁금한 모든 것을 정리해봤습니다. 도움이 되길 바라요!",
                source="티스토리",
                url="https://example.tistory.com",
                relevance_score=0.7,
                user_rating=4.0,
                comment_count=8,
                timestamp=datetime.now()
            )
        ]
        
        # 캐시에 저장
        self.web_search_cache[topic] = web_results
        
        return web_results
    
    def _generate_natural_text(self,
                              topic: str,
                              user_profile: UserProfile,
                              template: Dict,
                              web_results: List[WebSearchResult],
                              tone: WritingTone,
                              region: str) -> str:
        """자연스러운 텍스트 생성"""
        
        content_parts = []
        
        # 1. 인사말
        greeting = self._generate_greeting(user_profile, tone, region)
        content_parts.append(greeting)
        
        # 2. 주제 소개
        introduction = self._generate_introduction(topic, user_profile, tone, region)
        content_parts.append(introduction)
        
        # 3. 본문 내용
        main_content = self._generate_main_content(topic, user_profile, web_results, tone, region)
        content_parts.append(main_content)
        
        # 4. 개인 의견/경험
        personal_opinion = self._generate_personal_opinion(topic, user_profile, tone, region)
        content_parts.append(personal_opinion)
        
        # 5. 마무리
        conclusion = self._generate_conclusion(user_profile, tone, region)
        content_parts.append(conclusion)
        
        return "\n\n".join(content_parts)
    
    def _generate_greeting(self, user_profile: UserProfile, tone: WritingTone, region: str) -> str:
        """인사말 생성"""
        greetings = self.natural_patterns["greetings"]
        
        if tone == WritingTone.CASUAL:
            return random.choice(greetings[:3])  # 더 캐주얼한 인사
        elif tone == WritingTone.FRIENDLY:
            return random.choice(greetings[1:4])  # 친근한 인사
        elif tone == WritingTone.PROFESSIONAL:
            return random.choice(greetings[4:])  # 더 정중한 인사
        else:
            return random.choice(greetings)
    
    def _generate_introduction(self, topic: str, user_profile: UserProfile, tone: WritingTone, region: str) -> str:
        """주제 소개 생성"""
        if user_profile.level == UserLevel.BEGINNER:
            return f"요즘 {topic}에 대해 궁금한 게 많아서 글을 써봤어요!"
        elif user_profile.level == UserLevel.INTERMEDIATE:
            return f"{topic}에 대해 조사해보면서 알게 된 것들을 정리해봤습니다."
        elif user_profile.level == UserLevel.ADVANCED:
            return f"{topic}에 대한 분석 결과를 공유하고자 합니다."
        else:  # EXPERT
            return f"{topic}에 대한 전문적인 관점을 제시해보겠습니다."
    
    def _generate_main_content(self, topic: str, user_profile: UserProfile, web_results: List[WebSearchResult], tone: WritingTone, region: str) -> str:
        """본문 내용 생성"""
        content_parts = []
        
        # 웹 검색 결과 활용
        if web_results:
            # 첫 번째 결과 활용
            first_result = web_results[0]
            content_parts.append(f"검색해보니 {first_result.source}에서 이런 정보를 찾았어요:")
            content_parts.append(f"'{first_result.content[:100]}...'")
        
        # 사용자 수준에 따른 설명
        if user_profile.level == UserLevel.BEGINNER:
            content_parts.append(f"{topic}는 정말 간단해요! 처음에는 어려워 보일 수 있지만 차근차근 해보면 금방 익숙해질 거예요.")
        elif user_profile.level == UserLevel.INTERMEDIATE:
            content_parts.append(f"{topic}에 대해 좀 더 자세히 알아보면, 여러 가지 방법이 있는 것 같아요.")
        elif user_profile.level == UserLevel.ADVANCED:
            content_parts.append(f"{topic}를 체계적으로 접근해보면, 몇 가지 핵심 요소들이 있습니다.")
        else:  # EXPERT
            content_parts.append(f"{topic}에 대한 심층 분석 결과, 다음과 같은 인사이트를 도출할 수 있습니다.")
        
        # 자연스러운 연결어 추가
        transitions = self.natural_patterns["transitions"]
        if random.random() > 0.5:
            content_parts.append(f"{random.choice(transitions)} 실제로 사용해보면...")
        
        return "\n\n".join(content_parts)
    
    def _generate_personal_opinion(self, topic: str, user_profile: UserProfile, tone: WritingTone, region: str) -> str:
        """개인 의견 생성"""
        if user_profile.level == UserLevel.BEGINNER:
            return f"저는 {topic}를 써보면서 정말 좋다고 생각해요! 다른 분들도 한번 써보시면 어떨까요?"
        elif user_profile.level == UserLevel.INTERMEDIATE:
            return f"개인적으로는 {topic}에 대해 긍정적인 평가를 하고 있습니다. 다만 몇 가지 개선점도 있는 것 같아요."
        elif user_profile.level == UserLevel.ADVANCED:
            return f"제 경험상 {topic}는 효과적인 접근 방법이라고 판단됩니다. 다만 상황에 따라 다른 전략도 고려해볼 만합니다."
        else:  # EXPERT
            return f"전문가 관점에서 {topic}에 대한 평가는 대체로 긍정적입니다. 향후 발전 방향에 대해서도 기대가 큽니다."
    
    def _generate_conclusion(self, user_profile: UserProfile, tone: WritingTone, region: str) -> str:
        """마무리 생성"""
        conclusions = self.natural_patterns["conclusions"]
        questions = self.natural_patterns["questions"]
        
        conclusion_parts = []
        
        # 마무리 인사
        if tone == WritingTone.CASUAL:
            conclusion_parts.append(random.choice(conclusions[:4]))
        elif tone == WritingTone.FRIENDLY:
            conclusion_parts.append(random.choice(conclusions[2:6]))
        else:
            conclusion_parts.append(random.choice(conclusions[4:]))
        
        # 질문 추가 (50% 확률)
        if random.random() > 0.5:
            conclusion_parts.append(random.choice(questions))
        
        return "\n".join(conclusion_parts)
    
    def _adjust_word_count(self, content: str, target: int) -> str:
        """단어 수 조정"""
        current_words = len(content.split())
        
        if current_words < target * 0.7:
            # 내용 확장
            content = self._expand_content(content, target)
        elif current_words > target * 1.3:
            # 내용 압축
            content = self._compress_content(content, target)
        
        return content
    
    def _expand_content(self, content: str, target: int) -> str:
        """내용 확장"""
        # 추가 문장들
        expansions = [
            "정말 도움이 되었어요!",
            "다른 분들도 참고하시면 좋을 것 같아요.",
            "궁금한 점 있으시면 언제든 댓글 남겨주세요!",
            "저도 계속 공부해가면서 더 좋은 정보 공유하겠습니다.",
            "여러분의 의견도 궁금해요!"
        ]
        
        # 랜덤하게 1-2개 추가
        num_additions = random.randint(1, 2)
        selected_expansions = random.sample(expansions, num_additions)
        
        return content + "\n\n" + "\n".join(selected_expansions)
    
    def _compress_content(self, content: str, target: int) -> str:
        """내용 압축"""
        sentences = content.split('.')
        if len(sentences) > 3:
            # 마지막 몇 문장 제거
            sentences = sentences[:-2]
            return '.'.join(sentences) + '.'
        
        return content
    
    def _calculate_naturalness_score(self, content: str, user_profile: UserProfile) -> float:
        """자연스러움 점수 계산"""
        score = 0.5  # 기본 점수
        
        # 자연스러운 표현 사용 여부
        for pattern_type, patterns in self.natural_patterns.items():
            for pattern in patterns:
                if pattern in content:
                    score += 0.1
        
        # 사용자 수준에 맞는 어휘 사용
        vocabulary = self.vocabulary_levels[user_profile.vocabulary_level]
        for word in vocabulary:
            if word in content:
                score += 0.05
        
        # 문장 길이 다양성
        sentences = content.split('.')
        if len(sentences) > 1:
            lengths = [len(s.split()) for s in sentences if s.strip()]
            if lengths:
                length_variance = max(lengths) - min(lengths)
                if length_variance > 5:  # 문장 길이가 다양함
                    score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_readability_score(self, content: str) -> float:
        """가독성 점수 계산"""
        sentences = content.split('.')
        words = content.split()
        
        if not sentences or not words:
            return 0.0
        
        # 평균 문장 길이
        avg_sentence_length = len(words) / len(sentences)
        
        # 평균 단어 길이
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # 가독성 점수 계산 (간단한 공식)
        readability = 1.0 - (avg_sentence_length / 20) - (avg_word_length / 10)
        
        return max(0.0, min(1.0, readability))
    
    def _calculate_engagement_score(self, content: str) -> float:
        """참여도 점수 계산"""
        score = 0.5  # 기본 점수
        
        # 질문 포함 여부
        if '?' in content:
            score += 0.2
        
        # 감정 표현 포함 여부
        emotion_words = ['좋다', '나쁘다', '재미있다', '지루하다', '신기하다', '놀랍다']
        for word in emotion_words:
            if word in content:
                score += 0.1
                break
        
        # 개인적 표현 포함 여부
        personal_words = ['저는', '제가', '저도', '개인적으로', '저희']
        for word in personal_words:
            if word in content:
                score += 0.1
                break
        
        return min(score, 1.0)
    
    def _create_fallback_content(self, topic: str, error: str) -> NaturalContent:
        """폴백 콘텐츠 생성"""
        fallback_text = f"안녕하세요! {topic}에 대해 글을 쓰려고 했는데, 시스템에 문제가 생겼네요. 죄송합니다. 다시 시도해보시거나 다른 방법으로 도움을 받아보세요!"
        
        return NaturalContent(
            content=fallback_text,
            user_level=UserLevel.INTERMEDIATE,
            tone=WritingTone.FRIENDLY,
            content_type=ContentType.POST,
            word_count=len(fallback_text.split()),
            readability_score=0.8,
            naturalness_score=0.7,
            engagement_score=0.6,
            metadata={"error": error, "fallback": True}
        )
    
    def get_system_stats(self) -> Dict[str, Any]:
        """시스템 통계"""
        return {
            "user_profiles": len(self.user_profiles),
            "natural_patterns": sum(len(patterns) for patterns in self.natural_patterns.values()),
            "content_templates": len(self.content_templates),
            "vocabulary_levels": len(self.vocabulary_levels),
            "web_search_cache": len(self.web_search_cache),
            "timestamp": datetime.now().isoformat()
        }

# 전역 인스턴스
natural_user_writing_engine = NaturalUserWritingEngine()
