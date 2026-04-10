# 스타일 프로파일 스키마 (STYLE_SYSTEM_ARCHITECTURE.md)
# 7개 핵심 파라미터: persona, tone, reasoning_pattern, rhetoric, sentence_rhythm, perspective, persuasion

from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class StyleProfile:
    """
    스타일은 마지막 렌더링 단계에서만 적용. 사실/논리는 변경하지 않음.
    """
    style: str  # id: yusimin, reporter, default 등
    persona: str  # intellectual_commentator, journalist, blogger, analyst ...
    tone: str  # neutral, calm_critical, sarcastic, warm, aggressive
    reasoning_pattern: str  # step_explanation, deductive, inductive, story_based, dialogue
    rhetoric: List[str] = field(default_factory=list)  # rhetorical_question, analogy, contrast, irony, example
    sentence_rhythm: str = "mixed"  # short_punch, long_explanatory, medium_long, mixed
    perspective: str = "first_person"  # first_person, third_person, reader_engagement, observer
    persuasion: str = "logic"  # logic_reflection, emotion_empathy, problem_raising, refutation

    def to_dict(self) -> Dict[str, Any]:
        return {
            "style": self.style,
            "persona": self.persona,
            "tone": self.tone,
            "reasoning_pattern": self.reasoning_pattern,
            "rhetoric": list(self.rhetoric),
            "sentence_rhythm": self.sentence_rhythm,
            "perspective": self.perspective,
            "persuasion": self.persuasion,
        }

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "StyleProfile":
        return cls(
            style=d.get("style", "default"),
            persona=d.get("persona", "analyst"),
            tone=d.get("tone", "neutral"),
            reasoning_pattern=d.get("reasoning_pattern", "step_explanation"),
            rhetoric=d.get("rhetoric") or [],
            sentence_rhythm=d.get("sentence_rhythm", "mixed"),
            perspective=d.get("perspective", "first_person"),
            persuasion=d.get("persuasion", "logic"),
        )
