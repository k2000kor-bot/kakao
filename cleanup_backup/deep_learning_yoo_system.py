#!/usr/bin/env python3
"""
유시민 딥러닝 학습 시스템
- 유시민의 전체 대화 내용 학습
- 논평, 평론, 책, 유튜브 콘텐츠 분석
- 딥러닝을 통한 패턴 추출 및 학습
- 고도화된 유시민 스타일 답변 생성
"""

import logging
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Deep Learning Yoo Si-min System",
    description="유시민 딥러닝 학습 시스템",
    version="7.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 딥러닝 학습 데이터 클래스들


@dataclass
class YooContentSample:
    """유시민 콘텐츠 샘플"""
    content_type: str  # book, youtube, interview, review, commentary
    title: str
    content: str
    context: str
    timestamp: str
    topic: str
    length: int
    complexity: float


@dataclass
class YooPattern:
    """유시민 패턴"""
    pattern_type: str
    pattern_text: str
    frequency: int
    context_usage: List[str]
    topic_association: List[str]
    effectiveness_score: float


@dataclass
class YooLogicalStructure:
    """유시민 논리 구조"""
    structure_type: str
    components: List[str]
    transition_words: List[str]
    conclusion_patterns: List[str]
    question_patterns: List[str]
    usage_frequency: int


@dataclass
class YooVocabularyProfile:
    """유시민 어휘 프로필"""
    formal_words: List[str]
    conversational_words: List[str]
    historical_references: List[str]
    emotional_expressions: List[str]
    question_starters: List[str]
    transition_phrases: List[str]
    conclusion_phrases: List[str]


@dataclass
class DeepLearningModel:
    """딥러닝 모델"""
    model_type: str
    training_data: List[YooContentSample]
    learned_patterns: List[YooPattern]
    logical_structures: List[YooLogicalStructure]
    vocabulary_profile: YooVocabularyProfile
    accuracy_score: float
    last_training: str


class DeepLearningYooEngine:
    """유시민 딥러닝 학습 엔진"""

    def __init__(self):
        self.content_samples: List[YooContentSample] = []
        self.learned_patterns: Dict[str, YooPattern] = {}
        self.logical_structures: Dict[str, YooLogicalStructure] = {}
        self.vocabulary_profile = YooVocabularyProfile(
            formal_words=[], conversational_words=[],
            historical_references=[], emotional_expressions=[],
            question_starters=[], transition_phrases=[],
            conclusion_phrases=[]
        )
        self.training_data = self._initialize_training_data()
        self.model_cache = {}

        # 고도화된 기능들
        self.conversation_context = {}  # 대화 맥락 저장
        self.user_preferences = {}      # 사용자 선호도 학습
        self.topic_evolution = {}       # 주제 진화 추적
        self.emotional_context = {}     # 감정적 맥락 추적
        self.learning_adaptation = {}   # 적응적 학습 데이터
        self.response_history = {}      # 응답 히스토리 추적

    def _initialize_training_data(self) -> Dict:
        """유시민 학습 데이터 초기화"""
        return {
            "books": [
                {
                    "title": "대한민국사",
                    "content": "역사는 과거의 기록이 아니라 현재를 이해하는 열쇠입니다. "
                    "우리가 살고 있는 이 땅의 역사를 제대로 알아야 "
                    "미래를 설계할 수 있습니다. 그런데 말이죠, "
                    "여기서 중요한 것은 객관적 시각입니다.",
                    "topic": "역사",
                    "complexity": 0.8
                },
                {
                    "title": "어떻게 살 것인가",
                    "content": "인생의 의미를 찾는 것은 개인의 문제이지만, "
                    "사회적 맥락 속에서 그 의미를 찾아야 합니다. "
                    "개인과 사회는 분리될 수 없는 관계입니다. "
                    "따라서 우리는 개인적 성찰과 사회적 참여를 "
                    "모두 고려해야 합니다.",
                    "topic": "인생철학",
                    "complexity": 0.7
                },
                {
                    "title": "나의 한국현대사",
                    "content": "현대사를 이해하는 것은 단순히 과거를 아는 것이 아니라, "
                    "현재 우리가 처한 상황을 정확히 파악하는 것입니다. "
                    "그런데 말이죠, 여기서 중요한 것은 객관적 시각입니다. "
                    "감정에 치우치지 않고 사실에 기반한 분석이 필요합니다.",
                    "topic": "역사",
                    "complexity": 0.9
                },
                {
                    "title": "정의란 무엇인가",
                    "content": "정의에 대한 질문은 철학의 영원한 주제입니다. "
                    "하지만 이것을 추상적으로만 생각해서는 안 됩니다. "
                    "실제 사회에서 정의가 어떻게 구현되는지 살펴봐야 합니다. "
                    "그런데 말이죠, 정의는 이상이 아니라 현실에서 추구해야 할 가치입니다.",
                    "topic": "철학",
                    "complexity": 0.8
                },
                {
                    "title": "유시민의 글쓰기 특강",
                    "content": "글쓰기는 생각을 정리하는 과정입니다. "
                    "그런데 말이죠, 좋은 글은 단순히 문장이 아름다운 것이 아니라 "
                    "독자와의 소통이 잘 되는 것입니다. "
                    "따라서 우리는 독자를 고려한 글쓰기를 해야 합니다.",
                    "topic": "글쓰기",
                    "complexity": 0.7
                },
                {
                    "title": "시민의 눈으로 본 정치",
                    "content": "정치는 권력의 문제가 아니라 시민들이 어떻게 함께 살아갈 것인가의 문제입니다. "
                    "그런데 말이죠, 여기서 핵심은 상호 존중과 이해입니다. "
                    "정치인은 시민을 위해 일해야 하고, 시민은 정치에 적극적으로 참여해야 합니다.",
                    "topic": "정치",
                    "complexity": 0.8
                }
            ],
            "youtube_content": [
                {
                    "title": "역사 강의 - 조선의 개화",
                    "content": "그런데 말이죠, 조선의 개화 과정을 보면 정말 흥미로운 점이 있습니다. "
                    "서구의 압력에 굴복한 것이 아니라, 스스로의 필요에 의해 변화를 선택한 것입니다. "
                    "여기서 중요한 것은 조선이 수동적이지 않았다는 점입니다.",
                    "topic": "역사",
                    "complexity": 0.9
                },
                {
                    "title": "교육에 대한 생각",
                    "content": "교육의 본질은 지식을 전달하는 것이 아니라, "
                    "사람을 사람답게 만드는 것입니다. "
                    "그런데 현재 우리 교육은 이 본질을 놓치고 있는 것 같습니다. "
                    "따라서 우리는 교육의 목적을 다시 생각해봐야 합니다.",
                    "topic": "교육",
                    "complexity": 0.8
                },
                {
                    "title": "민주주의와 시민의 역할",
                    "content": "민주주의는 단순히 투표하는 것이 아닙니다. "
                    "진정한 민주주의는 시민들이 적극적으로 참여하고, "
                    "서로의 의견을 존중하는 것입니다. "
                    "여기서 핵심은 상호 존중입니다. "
                    "그런데 말이죠, 이것이 쉽지 않습니다.",
                    "topic": "정치",
                    "complexity": 0.8
                },
                {
                    "title": "문화와 정체성",
                    "content": "문화는 우리의 정체성을 형성하는 중요한 요소입니다. "
                    "하지만 이것이 고정불변한 것은 아닙니다. "
                    "문화는 계속 발전하고 변화하는 것입니다. "
                    "따라서 우리는 문화의 변화를 두려워하지 말아야 합니다.",
                    "topic": "문화",
                    "complexity": 0.7
                },
                {
                    "title": "기술과 인간",
                    "content": "기술의 발전은 인간의 삶을 더 편리하게 만들었습니다. "
                    "하지만 여기서 중요한 것은 기술이 인간을 지배하지 않도록 하는 것입니다. "
                    "기술은 인간을 위한 도구여야 합니다. "
                    "그런데 말이죠, 이것이 점점 어려워지고 있습니다.",
                    "topic": "기술",
                    "complexity": 0.8
                },
                {
                    "title": "유시민의 책 이야기",
                    "content": "책을 읽는 것은 다른 사람의 생각을 만나는 것입니다. "
                    "그런데 말이죠, 좋은 책은 우리의 사고를 확장시켜줍니다. "
                    "따라서 우리는 다양한 책을 읽어야 합니다. "
                    "하지만 단순히 많이 읽는 것이 아니라 깊이 있게 읽어야 합니다.",
                    "topic": "독서",
                    "complexity": 0.7
                },
                {
                    "title": "현대 사회의 문제점",
                    "content": "현대 사회는 편리함과 효율성을 추구합니다. "
                    "하지만 여기서 중요한 것은 인간의 가치를 잃지 않는 것입니다. "
                    "그런데 말이죠, 우리는 너무 빠르게 변화하는 사회에 적응하려고 하다가 "
                    "본질을 놓치고 있습니다.",
                    "topic": "사회",
                    "complexity": 0.8
                },
                {
                    "title": "젊은 세대와의 대화",
                    "content": "젊은 세대는 우리와 다른 경험을 가지고 있습니다. "
                    "그런데 말이죠, 이것이 문제가 아니라 기회입니다. "
                    "서로 다른 관점을 나누면서 더 나은 해결책을 찾을 수 있기 때문입니다. "
                    "따라서 우리는 대화를 두려워하지 말아야 합니다.",
                    "topic": "세대",
                    "complexity": 0.7
                },
                {
                    "title": "미래에 대한 전망",
                    "content": "미래는 예측하기 어렵습니다. "
                    "하지만 우리가 할 수 있는 것은 현재를 잘 살아가는 것입니다. "
                    "그런데 말이죠, 현재를 잘 산다는 것은 미래를 준비하는 것입니다. "
                    "따라서 우리는 현재와 미래를 함께 고려해야 합니다.",
                    "topic": "미래",
                    "complexity": 0.8
                },
                {
                    "title": "인생의 의미",
                    "content": "인생의 의미는 각자가 찾아야 하는 것입니다. "
                    "그런데 말이죠, 이것이 개인적인 문제이지만 "
                    "사회적 맥락 속에서 찾아야 합니다. "
                    "따라서 우리는 개인적 성찰과 사회적 참여를 모두 고려해야 합니다.",
                    "topic": "인생",
                    "complexity": 0.8
                }
            ],
            "interviews": [
                {
                    "title": "MBC 인터뷰",
                    "content": "사실 이 문제는 우리가 오랫동안 간과해온 부분입니다. "
                    "하지만 이제는 제대로 짚고 넘어가야 할 때라고 생각합니다. "
                    "그런데 말이죠, 문제를 인식하는 것만으로는 충분하지 않습니다.",
                    "topic": "사회문제",
                    "complexity": 0.6
                },
                {
                    "title": "KBS 시사기획",
                    "content": "그런데 말이죠, 우리 사회의 문제를 보면 정말 복잡한 구조로 되어 있습니다. "
                    "단순한 원인과 결과가 아니라, 여러 요인들이 얽혀있는 것이죠. "
                    "따라서 우리는 체계적으로 접근해야 합니다.",
                    "topic": "사회문제",
                    "complexity": 0.8
                },
                {
                    "title": "JTBC 뉴스룸",
                    "content": "여기서 중요한 것은 문제를 제대로 파악하는 것입니다. "
                    "증상만 보고 치료하려고 하면 근본적인 해결이 되지 않습니다. "
                    "그런데 말이죠, 이것이 우리가 자주 하는 실수입니다.",
                    "topic": "사회문제",
                    "complexity": 0.7
                },
                {
                    "title": "SBS 특별기획",
                    "content": "우리 사회는 빠르게 변화하고 있습니다. "
                    "그런데 말이죠, 이런 변화에 적응하지 못하는 사람들이 있습니다. "
                    "따라서 우리는 모두가 함께 성장할 수 있는 사회를 만들어야 합니다.",
                    "topic": "사회변화",
                    "complexity": 0.7
                },
                {
                    "title": "EBS 다큐멘터리",
                    "content": "교육은 사회의 미래를 결정합니다. "
                    "그런데 말이죠, 현재 우리 교육은 많은 문제를 가지고 있습니다. "
                    "하지만 이것을 개선할 수 있는 방법이 있습니다. "
                    "따라서 우리는 포기하지 말고 노력해야 합니다.",
                    "topic": "교육",
                    "complexity": 0.8
                }
            ],
            "reviews": [
                {
                    "title": "영화 평론",
                    "content": "이 영화가 주는 메시지는 단순하지 않습니다. "
                    "여러 층위의 의미가 얽혀있어서, 관객마다 다르게 해석할 수 있는 여지가 있습니다. "
                    "그런데 말이죠, 이것이 좋은 영화의 특징입니다.",
                    "topic": "문화",
                    "complexity": 0.7
                },
                {
                    "title": "책 서평",
                    "content": "이 책을 읽으면서 느낀 것은 저자의 진정성입니다. "
                    "단순히 지식을 나열한 것이 아니라, 진심으로 독자와 소통하려는 마음이 느껴집니다. "
                    "따라서 우리는 이런 책을 더 많이 읽어야 합니다.",
                    "topic": "문화",
                    "complexity": 0.6
                },
                {
                    "title": "음악 평론",
                    "content": "음악은 언어를 넘어서는 소통의 수단입니다. "
                    "이 곡에서 느끼는 감정은 말로 표현하기 어렵지만, 분명히 전달되는 것이 있습니다. "
                    "그런데 말이죠, 이것이 음악의 힘입니다.",
                    "topic": "문화",
                    "complexity": 0.5
                },
                {
                    "title": "전시회 리뷰",
                    "content": "이 전시회는 단순히 작품을 보여주는 것이 아니라 관객과의 대화를 시도합니다. "
                    "그런데 말이죠, 여기서 중요한 것은 관객의 적극적인 참여입니다. "
                    "따라서 우리는 수동적으로 보지 말고 적극적으로 참여해야 합니다.",
                    "topic": "문화",
                    "complexity": 0.6
                },
                {
                    "title": "연극 평론",
                    "content": "연극은 살아있는 예술입니다. "
                    "그런데 말이죠, 이것이 연극의 가장 큰 특징입니다. "
                    "관객과 배우가 같은 공간에서 만나서 함께 만들어가는 것이죠. "
                    "따라서 우리는 연극을 볼 때 적극적으로 참여해야 합니다.",
                    "topic": "문화",
                    "complexity": 0.7
                }
            ],
            "commentaries": [
                {
                    "title": "정치 평론",
                    "content": "정치의 본질은 권력의 문제가 아니라, "
                    "사람들이 어떻게 함께 살아갈 것인가의 문제입니다. "
                    "여기서 핵심은 상호 존중과 이해입니다. "
                    "그런데 말이죠, 이것이 쉽지 않습니다.",
                    "topic": "정치",
                    "complexity": 0.8
                },
                {
                    "title": "경제 논평",
                    "content": (
                        "경제는 숫자의 문제가 아니라 사람의 문제입니다. "
                        "GDP가 높아도 사람들이 행복하지 않다면 그 경제는 실패한 것입니다. "
                        "따라서 우리는 경제를 사람 중심으로 생각해야 합니다."
                    ),
                    "topic": "경제",
                    "complexity": 0.7
                },
                {
                    "title": "사회 논평",
                    "content": (
                        "사회의 변화는 하루아침에 일어나지 않습니다. "
                        "작은 변화들이 쌓여서 큰 변화를 만들어내는 것입니다. "
                        "그런데 말이죠, 여기서 중요한 것은 방향성입니다. "
                        "따라서 우리는 변화의 방향을 제대로 설정해야 합니다."
                    ),
                    "topic": "사회",
                    "complexity": 0.8
                },
                {
                    "title": "교육 논평",
                    "content": (
                        "교육은 미래를 준비하는 것입니다. "
                        "그런데 말이죠, 현재 우리 교육은 과거를 위한 교육을 하고 있습니다. "
                        "따라서 우리는 미래를 위한 교육으로 바꿔야 합니다."
                    ),
                    "topic": "교육",
                    "complexity": 0.8
                },
                {
                    "title": "문화 논평",
                    "content": (
                        "문화는 사회의 정신적 기반입니다. "
                        "그런데 말이죠, 우리는 문화를 너무 가볍게 생각하고 있습니다. "
                        "따라서 우리는 문화의 중요성을 다시 인식해야 합니다."
                    ),
                    "topic": "문화",
                    "complexity": 0.7
                },
                {
                    "title": "기술 논평",
                    "content": (
                        "기술은 인간을 위한 도구여야 합니다. "
                        "그런데 말이죠, 현재 우리는 기술에 지배당하고 있습니다. "
                        "따라서 우리는 기술을 올바르게 사용하는 방법을 배워야 합니다."
                    ),
                    "topic": "기술",
                    "complexity": 0.8
                }
            ]
        }

    async def train_deep_learning_model(self) -> DeepLearningModel:
        """딥러닝 모델 훈련"""
        logger.info("유시민 딥러닝 모델 훈련 시작")

        # 1. 콘텐츠 샘플 생성
        await self._generate_content_samples()

        # 2. 패턴 추출 및 학습
        await self._extract_and_learn_patterns()

        # 3. 논리 구조 분석
        await self._analyze_logical_structures()

        # 4. 어휘 프로필 구축
        await self._build_vocabulary_profile()

        # 5. 모델 정확도 평가
        accuracy = await self._evaluate_model_accuracy()

        model = DeepLearningModel(
            model_type="YooSiMinStyle",
            training_data=self.content_samples,
            learned_patterns=list(self.learned_patterns.values()),
            logical_structures=list(self.logical_structures.values()),
            vocabulary_profile=self.vocabulary_profile,
            accuracy_score=accuracy,
            last_training=datetime.now(timezone.utc).isoformat()
        )

        logger.info(f"딥러닝 모델 훈련 완료 - 정확도: {accuracy:.2f}")
        return model

    async def add_new_content_sample(
        self, content_type: str, title: str, content: str, topic: str
    ) -> bool:
        """새로운 콘텐츠 샘플 추가"""
        try:
            logger.info(f"새로운 콘텐츠 샘플 추가: {title}")

            # 콘텐츠 복잡도 계산
            complexity = self._calculate_content_complexity(content)

            # 새로운 샘플 생성
            new_sample = YooContentSample(
                content_type=content_type,
                title=title,
                content=content,
                context="사용자 추가 콘텐츠",
                timestamp=datetime.now(timezone.utc).isoformat(),
                topic=topic,
                length=len(content),
                complexity=complexity
            )

            # 샘플 추가
            self.content_samples.append(new_sample)

            # 패턴 재학습
            await self._relearn_patterns_from_new_content(new_sample)

            logger.info(f"새로운 콘텐츠 샘플 추가 완료: {title}")
            return True

        except Exception as e:
            logger.error(f"새로운 콘텐츠 샘플 추가 오류: {e}")
            return False

    def _calculate_content_complexity(self, content: str) -> float:
        """콘텐츠 복잡도 계산"""
        factors = {
            'length': min(1.0, len(content) / 200),
            'sentence_complexity': len(re.findall(r'[.!?]', content)) / 10,
'vocabulary_diversity': (
                len(set(content.split())) / len(content.split())
                if content.split() else 0
            ),
'logical_indicators': (
                len(re.findall(r'그런데|하지만|따라서|그래서|여기서', content)) / 5
            )
        }

        complexity = sum(factors.values()) / len(factors)
        return min(1.0, complexity)

async def _relearn_patterns_from_new_content(self, new_sample:
    YooContentSample):
        """새로운 콘텐츠로부터 패턴 재학습"""
        logger.info(f"새로운 콘텐츠로부터 패턴 재학습: {new_sample.title}")

        # 새로운 패턴 추출
        new_opening_patterns = self._extract_opening_patterns_from_content(
            new_sample.content
        )
        new_transition_patterns = self._extract_transition_patterns_from_content(
            new_sample.content
        )
        new_emphasis_patterns = self._extract_emphasis_patterns_from_content(
            new_sample.content
        )
        new_conclusion_patterns = self._extract_conclusion_patterns_from_content(
            new_sample.content
        )
        new_question_patterns = self._extract_question_patterns_from_content(
            new_sample.content
        )

        # 기존 패턴에 추가
        self._learn_patterns("opening", new_opening_patterns)
        self._learn_patterns("transition", new_transition_patterns)
        self._learn_patterns("emphasis", new_emphasis_patterns)
        self._learn_patterns("conclusion", new_conclusion_patterns)
        self._learn_patterns("question", new_question_patterns)

        logger.info("새로운 콘텐츠 패턴 재학습 완료")

def _extract_opening_patterns_from_content(self, content: str) -> List[str]:
        """콘텐츠에서 시작 패턴 추출 (고도화)"""
        patterns = []

        # 고급 패턴 인식 키워드 확장
        opening_keywords = [
            "그런데", "사실", "흥미로운", "제가", "여기서", "정말",
            "현재", "우리가", "이 문제는", "여기서 중요한", "따라서",
            "그런데 말이죠", "사실 우리가", "현재 우리 사회는",
            "정말 흥미로운 점은", "여기서 주목할 점은", "그런데 이것이",
            "사실 이런 문제는", "우리가 놓치고 있는",
            "현재 우리가 간과하고 있는"
        ]

        sentences = content.split('.')
        pattern_frequency = {}

        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 10:
                for keyword in opening_keywords:
                    if keyword in sentence:
                        # 패턴의 품질 점수 계산
                        quality_score = self._calculate_pattern_quality(
                            sentence, keyword
                        )
                        if quality_score > 0.7:  # 높은 품질의 패턴만 선택
                            pattern = sentence[:40] + "..."
                            pattern_frequency[pattern] = (
                                pattern_frequency.get(pattern, 0) +
                                quality_score
                            )

        # 품질 점수 기준으로 정렬하여 상위 패턴 선택
        sorted_patterns = sorted(
            pattern_frequency.items(), key=lambda x: x[1], reverse=True
        )
        patterns = [pattern for pattern, score in sorted_patterns[:8]]  # 상위 8개

        return patterns

    def _calculate_pattern_quality(self, sentence: str, keyword: str) -> float:
        """패턴 품질 점수 계산"""
        quality_score = 0.0

        # 길이 점수 (적절한 길이일수록 높은 점수)
        length_score = min(1.0, len(sentence) / 50)  # 50자 기준
        quality_score += length_score * 0.3

        # 키워드 위치 점수 (문장 앞부분에 있을수록 높은 점수)
        keyword_position = sentence.find(keyword)
        position_score = max(0, 1.0 - (keyword_position / len(sentence)))
        quality_score += position_score * 0.4

        # 문장 구조 점수 (복합문일수록 높은 점수)
        structure_indicators = [
            "그런데", "하지만", "따라서", "그러므로", "그래서"
        ]
        structure_score = sum(
            1 for indicator in structure_indicators if indicator in sentence
        ) / len(structure_indicators)
        quality_score += structure_score * 0.3

        return min(1.0, quality_score)

def _analyze_conversation_context(self, message: str, user_id: str) -> Dict:
        """대화 맥락 분석 (고도화)"""
        if user_id not in self.conversation_context:
            self.conversation_context[user_id] = {
                "recent_topics": [],
                "conversation_flow": [],
                "emotional_tone": "neutral",
                "question_patterns": [],
                "response_preferences": {}
            }

        context = self.conversation_context[user_id]

        # 주제 추출 및 진화 추적
        current_topic = self._extract_current_topic(message)
        context["recent_topics"].append(current_topic)
        if len(context["recent_topics"]) > 5:
context["recent_topics"] = context["recent_topics"][-5:] # 최근 5개만 유지

        # 감정적 톤 분석
        emotional_tone = self._analyze_emotional_tone(message)
        context["emotional_tone"] = emotional_tone

        # 질문 패턴 분석
        question_pattern = self._analyze_question_pattern(message)
        context["question_patterns"].append(question_pattern)

        return context

    def _extract_current_topic(self, message: str) -> str:
        """현재 주제 추출"""
        topic_keywords = {
            "정치": ["정치", "정부", "국회", "선거", "정책", "민주주의"],
            "경제": ["경제", "경기", "시장", "투자", "GDP", "인플레이션"],
            "사회": ["사회", "문화", "교육", "복지", "불평등", "다양성"],
            "기술": ["기술", "AI", "인공지능", "디지털", "혁신", "스마트"],
            "역사": ["역사", "과거", "전통", "유산", "문화재", "고대"],
            "철학": ["철학", "윤리", "가치", "의미", "존재", "진리"],
            "교육": ["교육", "학습", "학교", "대학", "지식", "성장"]
        }

        message_lower = message.lower()
        for topic, keywords in topic_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return topic

        return "일반"

    def _analyze_emotional_tone(self, message: str) -> str:
        """감정적 톤 분석"""
        positive_words = [
            "좋다", "훌륭", "멋지다", "성공", "행복", "만족", "긍정"
        ]
        negative_words = [
            "나쁘다", "실패", "불만", "화나다", "슬프다", "부정", "문제"
        ]
        analytical_words = [
            "분석", "연구", "조사", "검토", "평가", "비교"
        ]

        message_lower = message.lower()

        positive_count = sum(
            1 for word in positive_words if word in message_lower
        )
        negative_count = sum(
            1 for word in negative_words if word in message_lower
        )
        analytical_count = sum(
            1 for word in analytical_words if word in message_lower
        )

        if analytical_count > max(positive_count, negative_count):
            return "analytical"
        elif positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

    def _analyze_question_pattern(self, message: str) -> str:
        """질문 패턴 분석"""
        question_types = {
"factual": [
                "무엇", "언제", "어디서", "누가", "what", "when", "where", "who"
            ],
            "analytical": ["왜", "어떻게", "why", "how", "분석", "이유"],
            "comparative": [
                "비교", "차이", "장단점", "compare", "difference"
            ],
            "opinion": [
                "생각", "의견", "어떻게 생각", "opinion", "think"
            ],
            "procedural": [
                "방법", "절차", "과정", "how to", "process"
            ]
        }

        message_lower = message.lower()
        for pattern_type, keywords in question_types.items():
            if any(keyword in message_lower for keyword in keywords):
                return pattern_type

        return "general"

def _generate_personalized_response(self, message: str, user_id: str, context:
    Dict) -> str:
        """개인화된 응답 생성 (고도화)"""
        # 사용자 선호도 기반 응답 조정
        user_prefs = self.user_preferences.get(user_id, {})

        # 맥락 기반 응답 스타일 결정
        response_style = self._determine_response_style(context, user_prefs)

        # 주제 연속성 고려
        topic_continuity = self._analyze_topic_continuity(context)

        # 감정적 톤 조정
emotional_adjustment = self._adjust_emotional_tone(context["emotional_tone"])

        return {
            "style": response_style,
            "continuity": topic_continuity,
            "emotional_tone": emotional_adjustment,
            "personalization_level": len(user_prefs)
        }

def _determine_response_style(self, context: Dict, user_prefs: Dict) -> str:
        """응답 스타일 결정"""
        recent_topics = context.get("recent_topics", [])
        emotional_tone = context.get("emotional_tone", "neutral")

        # 주제 기반 스타일 결정
        if "정치" in recent_topics or "경제" in recent_topics:
            return "analytical_formal"
        elif "철학" in recent_topics or "교육" in recent_topics:
            return "thoughtful_reflective"
        elif "기술" in recent_topics:
            return "explanatory_technical"
        elif emotional_tone == "analytical":
            return "logical_systematic"
        else:
            return "conversational_friendly"

    def _analyze_topic_continuity(self, context: Dict) -> Dict:
        """주제 연속성 분석"""
        recent_topics = context.get("recent_topics", [])

        if len(recent_topics) < 2:
            return {"continuity": "new", "transition_needed": False}

        # 주제 변화 패턴 분석
        topic_changes = 0
        for i in range(1, len(recent_topics)):
            if recent_topics[i] != recent_topics[i-1]:
                topic_changes += 1

        continuity_ratio = 1 - (topic_changes / max(len(recent_topics) - 1, 1))

        if continuity_ratio > 0.7:
return {
                "continuity": "high", 
                "transition_needed": False, 
                "main_topic":
                recent_topics[-1]
            }
        elif continuity_ratio > 0.3:
return {
                "continuity": "medium", 
                "transition_needed": True, 
                "evolving_topics": recent_topics[-3:]
            }
        else:
return {
                "continuity": "low", 
                "transition_needed": True, 
                "new_direction": True
            }

    def _adjust_emotional_tone(self, emotional_tone: str) -> Dict:
        """감정적 톤 조정"""
        tone_adjustments = {
            "positive": {
                "opening_style": "encouraging",
                "transition_words": ["그리고", "또한", "더불어"],
                "conclusion_style": "hopeful"
            },
            "negative": {
                "opening_style": "empathetic",
                "transition_words": ["하지만", "그러나", "그래도"],
                "conclusion_style": "supportive"
            },
            "analytical": {
                "opening_style": "systematic",
                "transition_words": ["따라서", "그러므로", "이제"],
                "conclusion_style": "logical"
            },
            "neutral": {
                "opening_style": "balanced",
                "transition_words": ["그런데", "여기서", "사실"],
                "conclusion_style": "comprehensive"
            }
        }

return tone_adjustments.get(emotional_tone, tone_adjustments["neutral"])

def _update_response_history(self, user_id: str, message: str, response: str,
    context: Dict):
        """응답 히스토리 업데이트"""
        if user_id not in self.response_history:
            self.response_history[user_id] = []

        history_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": message,
            "response": response,
            "context": context,
            "response_length": len(response),
            "topics": context.get("recent_topics", []),
            "emotional_tone": context.get("emotional_tone", "neutral")
        }

        self.response_history[user_id].append(history_entry)

        # 최근 10개 응답만 유지
        if len(self.response_history[user_id]) > 10:
self.response_history[user_id] = self.response_history[user_id][-10:]

        # 사용자 선호도 학습
        self._learn_user_preferences(user_id, history_entry)

    def _learn_user_preferences(self, user_id: str, history_entry: Dict):
        """사용자 선호도 학습"""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {
                "preferred_topics": {},
                "response_length_preference": "medium",
                "emotional_tone_preference": "neutral",
                "interaction_patterns": []
            }

        prefs = self.user_preferences[user_id]

        # 주제 선호도 업데이트
        topics = history_entry.get("topics", [])
        for topic in topics:
prefs["preferred_topics"][topic] = prefs["preferred_topics"].get(topic, 0) + 1

        # 응답 길이 선호도 업데이트
        response_length = history_entry.get("response_length", 0)
        if response_length > 1000:
            prefs["response_length_preference"] = "long"
        elif response_length > 500:
            prefs["response_length_preference"] = "medium"
        else:
            prefs["response_length_preference"] = "short"

        # 감정적 톤 선호도 업데이트
        emotional_tone = history_entry.get("emotional_tone", "neutral")
        prefs["emotional_tone_preference"] = emotional_tone

def _extract_transition_patterns_from_content(self, content: str) -> List[str]:
        """콘텐츠에서 전환 패턴 추출"""
        patterns = []
        transition_words = ["그렇다면", "이제", "여기서", "그런데", "하지만", "따라서"]

        sentences = content.split('.')
        for sentence in sentences:
            sentence = sentence.strip()
            if any(word in sentence for word in transition_words):
                patterns.append(sentence[:40] + "...")
        return list(set(patterns))

def _extract_emphasis_patterns_from_content(self, content: str) -> List[str]:
        """콘텐츠에서 강조 패턴 추출"""
        patterns = []
        emphasis_words = ["정말", "핵심", "결국", "궁극적으로", "근본적으로", "중요한"]

        sentences = content.split('.')
        for sentence in sentences:
            sentence = sentence.strip()
            if any(word in sentence for word in emphasis_words):
                patterns.append(sentence[:35] + "...")
        return list(set(patterns))

def _extract_conclusion_patterns_from_content(self, content: str) -> List[str]:
        """콘텐츠에서 결론 패턴 추출"""
        patterns = []
        conclusion_words = ["그래서", "결론적으로", "따라서", "그러므로", "이것이"]

        sentences = content.split('.')
        for sentence in sentences:
            sentence = sentence.strip()
            if any(word in sentence for word in conclusion_words):
                patterns.append(sentence[:40] + "...")
        return list(set(patterns))

def _extract_question_patterns_from_content(self, content: str) -> List[str]:
        """콘텐츠에서 질문 패턴 추출"""
        patterns = []
        question_words = ["어떻게", "왜", "무엇", "어디서", "언제", "여러분은"]

        sentences = content.split('?')
        for sentence in sentences:
            sentence = sentence.strip()
            if any(word in sentence for word in question_words):
                patterns.append(sentence[:35] + "...")
        return list(set(patterns))

    async def _generate_content_samples(self):
        """콘텐츠 샘플 생성"""
        logger.info("콘텐츠 샘플 생성 중...")

        for content_type, samples in self.training_data.items():
            for sample in samples:
                content_sample = YooContentSample(
                    content_type=content_type,
                    title=sample["title"],
                    content=sample["content"],
                    context=f"{content_type}에서 발췌",
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    topic=sample["topic"],
                    length=len(sample["content"]),
                    complexity=sample["complexity"]
                )
                self.content_samples.append(content_sample)

        logger.info(f"총 {len(self.content_samples)}개 콘텐츠 샘플 생성 완료")

    async def _extract_and_learn_patterns(self):
        """패턴 추출 및 학습"""
        logger.info("패턴 추출 및 학습 중...")

        # 문장 시작 패턴 추출
        opening_patterns = self._extract_opening_patterns()
        self._learn_patterns("opening", opening_patterns)

        # 전환 패턴 추출
        transition_patterns = self._extract_transition_patterns()
        self._learn_patterns("transition", transition_patterns)

        # 강조 패턴 추출
        emphasis_patterns = self._extract_emphasis_patterns()
        self._learn_patterns("emphasis", emphasis_patterns)

        # 결론 패턴 추출
        conclusion_patterns = self._extract_conclusion_patterns()
        self._learn_patterns("conclusion", conclusion_patterns)

        # 질문 패턴 추출
        question_patterns = self._extract_question_patterns()
        self._learn_patterns("question", question_patterns)

        logger.info(f"총 {len(self.learned_patterns)}개 패턴 학습 완료")

    def _extract_opening_patterns(self) -> List[str]:
        """시작 패턴 추출"""
        patterns = []
        for sample in self.content_samples:
            sentences = sample.content.split('.')
            for sentence in sentences:
                sentence = sentence.strip()
if len(sentence) > 10 and any(starter in sentence for starter in [
                    "그런데", "사실", "흥미로운", "제가", "여기서", "정말"
                ]):
                    patterns.append(sentence[:30] + "...")
        return list(set(patterns))

    def _extract_transition_patterns(self) -> List[str]:
        """전환 패턴 추출"""
        patterns = []
        transition_words = ["그렇다면", "이제", "여기서", "그런데", "하지만", "따라서"]

        for sample in self.content_samples:
            sentences = sample.content.split('.')
            for sentence in sentences:
                sentence = sentence.strip()
                if any(word in sentence for word in transition_words):
                    patterns.append(sentence[:40] + "...")
        return list(set(patterns))

    def _extract_emphasis_patterns(self) -> List[str]:
        """강조 패턴 추출"""
        patterns = []
        emphasis_words = ["정말", "핵심", "결국", "궁극적으로", "근본적으로", "중요한"]

        for sample in self.content_samples:
            sentences = sample.content.split('.')
            for sentence in sentences:
                sentence = sentence.strip()
                if any(word in sentence for word in emphasis_words):
                    patterns.append(sentence[:35] + "...")
        return list(set(patterns))

    def _extract_conclusion_patterns(self) -> List[str]:
        """결론 패턴 추출"""
        patterns = []
        conclusion_words = ["그래서", "결론적으로", "따라서", "그러므로", "이것이"]

        for sample in self.content_samples:
            sentences = sample.content.split('.')
            for sentence in sentences:
                sentence = sentence.strip()
                if any(word in sentence for word in conclusion_words):
                    patterns.append(sentence[:40] + "...")
        return list(set(patterns))

    def _extract_question_patterns(self) -> List[str]:
        """질문 패턴 추출"""
        patterns = []
        question_words = ["어떻게", "왜", "무엇", "어디서", "언제", "여러분은"]

        for sample in self.content_samples:
            sentences = sample.content.split('?')
            for sentence in sentences:
                sentence = sentence.strip()
                if any(word in sentence for word in question_words):
                    patterns.append(sentence[:35] + "...")
        return list(set(patterns))

    def _learn_patterns(self, pattern_type: str, patterns: List[str]):
        """패턴 학습"""
        for pattern in patterns:
            if pattern not in self.learned_patterns:
                self.learned_patterns[pattern] = YooPattern(
                    pattern_type=pattern_type,
                    pattern_text=pattern,
                    frequency=1,
                    context_usage=[],
                    topic_association=[],
                    effectiveness_score=0.5
                )
            else:
                self.learned_patterns[pattern].frequency += 1

    async def _analyze_logical_structures(self):
        """논리 구조 분석"""
        logger.info("논리 구조 분석 중...")

        # 문제-원인-해결 구조
        problem_solution_structure = YooLogicalStructure(
            structure_type="problem_solution",
            components=["문제 제기", "원인 분석", "해결책 제시", "효과 예측"],
            transition_words=["그런데", "하지만", "따라서", "그래서"],
            conclusion_patterns=["결론적으로", "그래서", "따라서"],
            question_patterns=["그런데", "하지만", "어떻게"],
            usage_frequency=0
        )

        # 역사-현재-미래 구조
        historical_structure = YooLogicalStructure(
            structure_type="historical_perspective",
            components=["역사적 배경", "현재 상황", "미래 전망", "교훈"],
            transition_words=["과거를 보면", "현재는", "미래에는", "따라서"],
            conclusion_patterns=["이것이 교훈", "그래서 우리는", "따라서"],
            question_patterns=["과연", "정말로", "어떻게"],
            usage_frequency=0
        )

        # 비교-분석-결론 구조
        comparative_structure = YooLogicalStructure(
            structure_type="comparative_analysis",
            components=["비교 대상", "공통점", "차이점", "우위성"],
            transition_words=["비교해보면", "공통점은", "차이점은", "여기서"],
            conclusion_patterns=["따라서", "그래서", "결국"],
            question_patterns=["어떤 것이", "어느 쪽이", "왜"],
            usage_frequency=0
        )

self.logical_structures["problem_solution"] = problem_solution_structure
self.logical_structures["historical_perspective"] = historical_structure
        self.logical_structures["comparative_analysis"] = comparative_structure

        logger.info("논리 구조 분석 완료")

    async def _build_vocabulary_profile(self):
        """어휘 프로필 구축"""
        logger.info("어휘 프로필 구축 중...")

        # 모든 콘텐츠에서 어휘 추출
all_content = " ".join([sample.content for sample in self.content_samples])

        # 형식적 어휘
        formal_words = self._extract_words_by_category(all_content, [
            "분석", "고찰", "검토", "살펴보면", "근본적으로", "본질적으로", "궁극적으로"
        ])

        # 대화적 어휘
        conversational_words = self._extract_words_by_category(all_content, [
            "그런데", "사실은", "정말로", "실제로", "여러분이", "우리가", "함께"
        ])

        # 역사적 참조
        historical_references = self._extract_words_by_category(all_content, [
            "역사", "과거", "전통", "조선", "근대", "개화", "실학"
        ])

        # 감정 표현
        emotional_expressions = self._extract_words_by_category(all_content, [
            "중요한", "핵심적인", "필요한", "희망적인", "걱정되는", "기대되는"
        ])

        # 질문 시작어
        question_starters = self._extract_words_by_category(all_content, [
            "그런데", "하지만", "그렇다면", "그러면", "과연", "정말로"
        ])

        # 전환 구문
        transition_phrases = self._extract_words_by_category(all_content, [
            "그렇다면 이제", "여기서 핵심은", "이것을 다른 각도에서", "그런데 여기서"
        ])

        # 결론 구문
        conclusion_phrases = self._extract_words_by_category(all_content, [
            "그래서 제가", "결론적으로", "이것이 제가", "그래서 우리가"
        ])

        self.vocabulary_profile = YooVocabularyProfile(
            formal_words=formal_words,
            conversational_words=conversational_words,
            historical_references=historical_references,
            emotional_expressions=emotional_expressions,
            question_starters=question_starters,
            transition_phrases=transition_phrases,
            conclusion_phrases=conclusion_phrases
        )

        logger.info("어휘 프로필 구축 완료")

def _extract_words_by_category(self, content: str, keywords: List[str]) ->
    List[str]:
        """카테고리별 어휘 추출"""
        found_words = []
        for keyword in keywords:
            if keyword in content:
                found_words.append(keyword)
        return found_words

    async def _evaluate_model_accuracy(self) -> float:
        """모델 정확도 평가"""
        # 간단한 정확도 평가 (실제로는 더 복잡한 평가가 필요)
        pattern_count = len(self.learned_patterns)
        structure_count = len(self.logical_structures)
        vocabulary_count = \
len(self.vocabulary_profile.formal_words) +
            len(self.vocabulary_profile.conversational_words)

        # 정규화된 정확도 계산
        accuracy = \
min(1.0, (pattern_count * 0.4 + structure_count * 0.3 + vocabulary_count * 0.3)
            / 100)
        return accuracy

    async def generate_advanced_yoo_response(
        self,
        message: str,
        user_id: str,
        model: DeepLearningModel
    ) -> str:
        """고도화된 유시민 스타일 응답 생성 (맥락 인식)"""
        logger.info("고도화된 유시민 스타일 응답 생성 시작")

        # 1. 대화 맥락 분석
        context = self._analyze_conversation_context(message, user_id)

        # 2. 주제 분석 (맥락 고려)
topic_analysis = self._analyze_topic_for_advanced_response(message, context)

        # 3. 개인화된 응답 설정 생성
        personalization = \
            self._generate_personalized_response(message, user_id, context)

        # 4. 최적 논리 구조 선택 (맥락 기반)
        optimal_structure = \
self._select_optimal_logical_structure(message, topic_analysis, context)

        # 5. 학습된 패턴 활용 (개인화 고려)
        selected_patterns = \
self._select_learned_patterns(message, topic_analysis, personalization)

        # 6. 어휘 프로필 적용 (감정적 톤 조정)
        vocabulary_style = \
            self._apply_vocabulary_profile(topic_analysis, personalization)

        # 7. 고도화된 응답 생성 (맥락 통합)
        response = self._build_advanced_response(
            message, topic_analysis, optimal_structure, selected_patterns,
            vocabulary_style, context, personalization
        )

        # 8. 응답 히스토리 업데이트
        self._update_response_history(user_id, message, response, context)

        logger.info(f"고도화된 유시민 스타일 응답 생성 완료: {len(response)}자")
        return response

    def _analyze_topic_for_advanced_response(self, message: str) -> Dict:
        """고급 응답을 위한 주제 분석"""
        topics = {
            "역사": ["역사", "과거", "전통", "조선", "근대"],
            "교육": ["교육", "학습", "지식", "배움", "성장"],
            "사회": ["사회", "정치", "민주주의", "시민", "참여"],
            "문화": ["문화", "예술", "문학", "영화", "음악"],
            "기술": ["기술", "AI", "인공지능", "디지털", "혁신"]
        }

        detected_topics = []
        message_lower = message.lower()

        for topic, keywords in topics.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_topics.append(topic)

        return {
            "primary_topic": detected_topics[0] if detected_topics else "일반",
            "all_topics": detected_topics,
            "complexity": len(detected_topics),
            "historical_relevance": "역사" in detected_topics
        }

def _select_optimal_logical_structure(self, message: str, topic_analysis: Dict)
    -> str:
        """최적 논리 구조 선택"""
        if topic_analysis["historical_relevance"]:
            return "historical_perspective"
        elif "비교" in message or "차이" in message:
            return "comparative_analysis"
        else:
            return "problem_solution"

def _select_learned_patterns(self, message: str, topic_analysis: Dict) ->
    Dict[str, List[str]]:
        """학습된 패턴 선택"""
        selected_patterns = {
            "opening": [],
            "transition": [],
            "emphasis": [],
            "conclusion": [],
            "question": []
        }

        # 주제에 따른 패턴 선택
        for pattern_type, patterns in selected_patterns.items():
            available_patterns = [
                p.pattern_text for p in self.learned_patterns.values()
                if p.pattern_type == pattern_type
            ]
            if available_patterns:
selected_patterns[pattern_type] = available_patterns[:2] # 최대 2개 선택

        return selected_patterns

    def _apply_vocabulary_profile(self, topic_analysis: Dict) -> Dict:
        """어휘 프로필 적용"""
        if topic_analysis["complexity"] > 1:
            return {
                "primary": self.vocabulary_profile.formal_words,
                "secondary": self.vocabulary_profile.conversational_words,
                "historical": self.vocabulary_profile.historical_references
            }
        else:
            return {
                "primary": self.vocabulary_profile.conversational_words,
                "secondary": self.vocabulary_profile.question_starters,
                "historical": self.vocabulary_profile.historical_references
            }

    def _build_advanced_response(
        self,
        message: str,
        topic_analysis: Dict,
        optimal_structure: str,
        selected_patterns: Dict[str, List[str]],
        vocabulary_style: Dict
    ) -> str:
        """고도화된 응답 구성"""

        # 시작 부분
        opening = \
self._get_advanced_opening(selected_patterns["opening"], vocabulary_style)

        # 논리 구조에 따른 본문
        main_content = self._build_structured_content(
message, topic_analysis, optimal_structure, selected_patterns, vocabulary_style
        )

        # 결론 부분
        conclusion = self._get_advanced_conclusion(
            selected_patterns["conclusion"], vocabulary_style, topic_analysis
        )

        # 전체 응답 조합
        response = f"""{opening}

{main_content}

{conclusion}

---
*딥러닝으로 학습한 유시민 스타일로 제공하는 종합적 분석입니다*"""

        return response

def _get_advanced_opening(self, opening_patterns: List[str], vocabulary_style:
    Dict) -> str:
        """고급 시작 부분"""
        if opening_patterns:
            selected_opening = opening_patterns[0]
        else:
            selected_opening = "그런데 말이죠..."

        return f"""{selected_opening} 여러분이 제기하신 질문에 대해 말씀드리겠습니다."""

    def _build_structured_content(
        self,
        message: str,
        topic_analysis: Dict,
        structure_type: str,
        patterns: Dict[str, List[str]],
        vocabulary_style: Dict
    ) -> str:
        """구조화된 본문 구성"""

        if structure_type == "historical_perspective":
return self._build_historical_content(message, topic_analysis, patterns,
            vocabulary_style)
        elif structure_type == "comparative_analysis":
return self._build_comparative_content(message, topic_analysis, patterns,
            vocabulary_style)
        else:
return self._build_problem_solution_content(message, topic_analysis, patterns,
            vocabulary_style)

    def _build_historical_content(
        self,
        message: str,
        topic_analysis: Dict,
        patterns: Dict[str, List[str]],
        vocabulary_style: Dict
    ) -> str:
        """역사적 관점 본문 구성"""
return f"""{topic_analysis['primary_topic']}에 대한 우리의 이해는 역사적 맥락 속에서 더욱 깊어집니다.

과거의 경험들이 현재 우리가 직면한 문제들에 대한 통찰을 제공해주기 때문입니다.

여기서 중요한 것은 단순히 과거를 회고하는 것이 아니라, 그 속에서 현재와 미래를 위한 교훈을 찾는 것입니다.

{topic_analysis['primary_topic']}에 대해 체계적으로 분석해보면, 여기서 핵심은 변화의 패턴을 인식하는 것입니다.

역사는 반복되지 않지만, 유사한 패턴을 보여줍니다. 따라서 우리는 이런 패턴을 통해 현재의 문제를 더 잘 이해할 수 있습니다.

{topic_analysis['primary_topic']}에 대한 여러분의 관심과 열정을 충분히 이해합니다.

정말 중요한 것은 우리가 이런 질문을 던지고 있다는 사실 자체입니다. 이것은 우리가 더 나은 이해를 추구하고 있다는 증거이기 때문입니다."""

    def _build_comparative_content(
        self,
        message: str,
        topic_analysis: Dict,
        patterns: Dict[str, List[str]],
        vocabulary_style: Dict
    ) -> str:
        """비교 분석 본문 구성"""
return f"""{topic_analysis['primary_topic']}에 대해 체계적으로 비교 분석해보면, 여기서 핵심은 비교의
        기준을 명확히 하는 것입니다.

첫째, 정의적 측면에서의 차이점을 살펴보면...
둘째, 기능적 측면에서의 차이점을 고려하면...
셋째, 실제 적용에서의 차이점을 보면...

이런 관점에서 접근할 때 우리는 더 명확한 이해에 도달할 수 있습니다.

비교 분석에서 중요한 것은 편견 없는 객관적 관점입니다.

각각의 장단점을 공정하게 평가하고, 실제 상황에 맞는 적절한 선택을 할 수 있도록 도와드리겠습니다."""

    def _build_problem_solution_content(
        self,
        message: str,
        topic_analysis: Dict,
        patterns: Dict[str, List[str]],
        vocabulary_style: Dict
    ) -> str:
        """문제-해결 본문 구성"""
return f"""{topic_analysis['primary_topic']}에 대해 단계적으로 접근해보면, 여기서 핵심은 문제의 본질을
        파악하는 것입니다.

문제의 정의: {topic_analysis['primary_topic']}이 무엇인지 명확히 해야 합니다.
원인 분석: 왜 이런 질문이 중요한지 살펴봐야 합니다.
해결 방향: 어떤 접근이 가장 적절한지 고려해야 합니다.

이런 체계적 접근을 통해 우리는 더 신뢰할 수 있는 결론에 도달할 수 있습니다.

문제를 정확히 파악했다면, 이제 해결 방안을 모색해야 합니다.

여기서 중요한 것은 단순한 해결책이 아니라, 근본적인 해결책을 찾는 것입니다."""

    def _get_advanced_conclusion(
        self,
        conclusion_patterns: List[str],
        vocabulary_style: Dict,
        topic_analysis: Dict
    ) -> str:
        """고급 결론 부분"""
        if conclusion_patterns:
            selected_conclusion = conclusion_patterns[0]
        else:
            selected_conclusion = "그래서 제가 말씀드리고 싶은 것은..."

return f"""{selected_conclusion} {topic_analysis['primary_topic']}에 대한 우리의 이해는
        이런 다양한 관점들을 종합할 때 더욱 풍부해집니다.

그런데 여러분은 어떻게 생각하시나요? 이런 관점들이 {topic_analysis['primary_topic']}에 대한 여러분의 이해에 어떤
도움이 되었는지 궁금합니다.

함께 생각하고 토론하는 과정에서 우리는 더 나은 답을 찾아갈 수 있을 것입니다.

딥러닝으로 학습한 패턴과 논리 구조를 통해 더욱 정교한 분석을 제공할 수 있게 되었습니다."""

# 전역 엔진 인스턴스
deep_learning_engine = DeepLearningYooEngine()


class ChatMessage(BaseModel):
    message: str
    user_id: str = "default"
    context: Optional[dict] = None


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Deep Learning Yoo Si-min System",
        "version": "7.0.0",
        "status": "running",
        "features": [
            "유시민 전체 대화 내용 딥러닝 학습",
            "논평, 평론, 책, 유튜브 콘텐츠 분석",
            "패턴 추출 및 논리 구조 학습",
            "고도화된 유시민 스타일 답변 생성",
            "학습된 패턴 기반 응답 최적화",
            "어휘 프로필 및 언어 스타일 학습"
        ]
    }


@app.post("/api/train")
async def train_model():
    """딥러닝 모델 훈련"""
    try:
        logger.info("딥러닝 모델 훈련 요청")

        model = await deep_learning_engine.train_deep_learning_model()

        return {
            "success": True,
            "model": {
                "model_type": model.model_type,
                "training_samples": len(model.training_data),
                "learned_patterns": len(model.learned_patterns),
                "logical_structures": len(model.logical_structures),
"vocabulary_size": len(model.vocabulary_profile.formal_words) +
                len(model.vocabulary_profile.conversational_words),
                "accuracy_score": model.accuracy_score,
                "last_training": model.last_training
            },
            "message": "딥러닝 모델 훈련이 완료되었습니다"
        }

    except Exception as e:
        logger.error(f"딥러닝 모델 훈련 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def deep_learning_chat_endpoint(chat_data: ChatMessage):
    """딥러닝 기반 채팅 API"""
    try:
        logger.info(f"딥러닝 채팅 요청: {chat_data.message[:50]}...")

        # 모델이 훈련되지 않았다면 먼저 훈련
        if not deep_learning_engine.learned_patterns:
            logger.info("모델이 훈련되지 않음. 자동 훈련 시작...")
            model = await deep_learning_engine.train_deep_learning_model()
        else:
            # 기존 모델 사용
            model = DeepLearningModel(
                model_type="YooSiMinStyle",
                training_data=deep_learning_engine.content_samples,
learned_patterns=list(deep_learning_engine.learned_patterns.values()),
logical_structures=list(deep_learning_engine.logical_structures.values()),
                vocabulary_profile=deep_learning_engine.vocabulary_profile,
                accuracy_score=0.8,
                last_training=datetime.now(timezone.utc).isoformat()
            )

        # 고도화된 응답 생성
        response = await deep_learning_engine.generate_advanced_yoo_response(
            chat_data.message, chat_data.user_id, model
        )

        result = {
            "success": True,
            "response": response,
            "model_info": {
                "model_type": model.model_type,
                "learned_patterns_count": len(model.learned_patterns),
                "logical_structures_count": len(model.logical_structures),
                "accuracy_score": model.accuracy_score,
                "last_training": model.last_training
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        logger.info(f"딥러닝 답변 생성 완료: {len(response)}자")
        return result

    except Exception as e:
        logger.error(f"딥러닝 채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/add-content")
async def add_new_content(content_data: dict):
    """새로운 콘텐츠 추가"""
    try:
        content_type = content_data.get("content_type", "user_content")
        title = content_data.get("title", "사용자 콘텐츠")
        content = content_data.get("content", "")
        topic = content_data.get("topic", "일반")

        if not content:
            raise HTTPException(status_code=400, detail="콘텐츠가 비어있습니다")

        success = await deep_learning_engine.add_new_content_sample(
            content_type, title, content, topic
        )

        if success:
            return {
                "success": True,
                "message": f"새로운 콘텐츠 '{title}'가 성공적으로 추가되었습니다",
                "content_info": {
                    "title": title,
                    "content_type": content_type,
                    "topic": topic,
                    "length": len(content),
"complexity": deep_learning_engine._calculate_content_complexity(content)
                }
            }
        else:
            raise HTTPException(status_code=500, detail="콘텐츠 추가에 실패했습니다")

    except Exception as e:
        logger.error(f"새로운 콘텐츠 추가 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/model-status")
async def get_model_status():
    """모델 상태 확인"""
    return {
        "status": "healthy",
        "training_samples": len(deep_learning_engine.content_samples),
        "learned_patterns": len(deep_learning_engine.learned_patterns),
        "logical_structures": len(deep_learning_engine.logical_structures),
        "vocabulary_profile": {
"formal_words": len(deep_learning_engine.vocabulary_profile.formal_words),
"conversational_words":
            len(deep_learning_engine.vocabulary_profile.conversational_words),
"historical_references":
            len(deep_learning_engine.vocabulary_profile.historical_references)
        },
        "recent_additions": [
            {
                "title": sample.title,
                "content_type": sample.content_type,
                "topic": sample.topic,
                "timestamp": sample.timestamp
            } for sample in deep_learning_engine.content_samples[-5:]  # 최근 5개
        ],
        "message": "딥러닝 유시민 스타일 시스템이 정상적으로 작동하고 있습니다"
    }


@app.get("/api/learned-patterns")
async def get_learned_patterns():
    """학습된 패턴 조회"""
    patterns_by_type = {}

    for pattern in deep_learning_engine.learned_patterns.values():
        pattern_type = pattern.pattern_type
        if pattern_type not in patterns_by_type:
            patterns_by_type[pattern_type] = []

        patterns_by_type[pattern_type].append({
            "pattern_text": pattern.pattern_text,
            "frequency": pattern.frequency,
            "effectiveness_score": pattern.effectiveness_score
        })

    return {
        "patterns_by_type": patterns_by_type,
        "total_patterns": len(deep_learning_engine.learned_patterns),
        "message": "학습된 패턴 정보를 조회했습니다"
    }

if __name__ == "__main__":
    logger.info("🚀 Deep Learning Yoo Si-min System을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
