# 스타일 사전: "유시민 스타일", "기자 스타일" 등 → StyleProfile JSON
# STYLE_SYSTEM_ARCHITECTURE.md §5, §7

import re
import logging
from typing import Optional

from .style_schemas import StyleProfile

logger = logging.getLogger(__name__)

# 고정 스타일 프로파일 (스타일 사전)
STYLE_DICTIONARY = {
    "yusimin": StyleProfile(
        style="yusimin",
        persona="intellectual_commentator",
        tone="calm_critical",
        reasoning_pattern="step_explanation",
        rhetoric=["rhetorical_question", "analogy"],
        sentence_rhythm="medium_long",
        perspective="reader_engagement",
        persuasion="logic_reflection",
    ),
    "reporter": StyleProfile(
        style="reporter",
        persona="journalist",
        tone="neutral",
        reasoning_pattern="deductive",
        rhetoric=["example", "contrast"],
        sentence_rhythm="short_punch",
        perspective="third_person",
        persuasion="logic",
    ),
    "commentator": StyleProfile(
        style="commentator",
        persona="commentator",
        tone="critical",
        reasoning_pattern="step_explanation",
        rhetoric=["rhetorical_question", "contrast"],
        sentence_rhythm="medium_long",
        perspective="first_person",
        persuasion="logic_reflection",
    ),
    "블로거": StyleProfile(
        style="blogger",
        persona="friendly_blogger",
        tone="warm",
        reasoning_pattern="story_based",
        rhetoric=["example", "analogy"],
        sentence_rhythm="mixed",
        perspective="first_person",
        persuasion="emotion_empathy",
    ),
    "분석가": StyleProfile(
        style="analyst",
        persona="analyst",
        tone="calm",
        reasoning_pattern="deductive",
        rhetoric=["example"],
        sentence_rhythm="long_explanatory",
        perspective="observer",
        persuasion="logic",
    ),
    "default": StyleProfile(
        style="default",
        persona="analyst",
        tone="neutral",
        reasoning_pattern="step_explanation",
        rhetoric=[],
        sentence_rhythm="mixed",
        perspective="first_person",
        persuasion="logic",
    ),
}

# 별칭 → 표준 id
ALIASES = {
    "유시민": "yusimin",
    "유시민 스타일": "yusimin",
    "유시민스타일": "yusimin",
    "기자": "reporter",
    "기자 스타일": "reporter",
    "기자스타일": "reporter",
    "손석희": "reporter",
    "평론가": "commentator",
    "김어준": "commentator",
    "부동산카페": "blogger",
    "카페 스타일": "blogger",
}


def resolve_style_profile(style_request: Optional[str]) -> Optional[StyleProfile]:
    """
    "유시민 스타일로 써줘" 등 요청 문자열 또는 id → StyleProfile.
    없으면 None (스타일 미적용).
    """
    if not style_request or not str(style_request).strip():
        return None
    key = str(style_request).strip().lower()
    key = re.sub(r"\s+", "", key)  # 공백 제거한 키도 검사
    # 별칭 먼저
    for alias, canonical in ALIASES.items():
        if alias.lower() == style_request.strip().lower() or re.sub(r"\s+", "", alias.lower()) == key:
            profile = STYLE_DICTIONARY.get(canonical)
            if isinstance(profile, StyleProfile):
                return profile
    # 직접 id
    profile = STYLE_DICTIONARY.get(style_request.strip().lower())
    if isinstance(profile, StyleProfile):
        return profile
    profile = STYLE_DICTIONARY.get(key)
    return profile if isinstance(profile, StyleProfile) else None
