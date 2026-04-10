# 한국어 출력 경량 검사 (Verifier 보조) — 규칙 기반, v3 문서 §8 방향
# 실패 처리는 상위에서 pass_와 분리해 korean_style_notes로만 전달 (기본은 품질 힌트).

from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple

# 번역투·중복 어미 등
_TRANSLATIONESE_PATTERNS = [
    (r"진행되어지는", "→ '진행되는' 등 자연스러운 표현 권장"),
    (r"검토가 필요하다고 판단됩니다", "→ '검토가 필요합니다' 등 간결체 권장"),
    (r"대응이 요구되는 바입니다", "→ '대응이 필요합니다' 권장"),
    (r"에 대하여\s", "→ 문맥에 따라 '에 대해' 등 구어체 검토"),
]

# 높임 혼용 힌트 (같은 짧은 답변 안)
_POLITE_STRONG = r"(?:습니다|습니까|하십시오|드립니다|주십시오|합니다|입니다|됩니다)"
_CASUAL_LINE = r"(?:해요|해줘|줘요|예요|이에요|죠\?|야\?|[^요]야[.!\s]|뭐야|그래\?)"


def collect_korean_style_notes(
    draft: str,
    context_pack: Dict[str, Any],
) -> Tuple[List[str], List[str]]:
    """
    Returns:
      notes — 사용자/로그용 힌트 (메타데이터)
      strict_issues — formal 장르에서만 pass_에 반영할 수 있는 경고
    """
    notes: List[str] = []
    strict: List[str] = []
    text = draft or ""
    if not text.strip():
        return notes, strict

    ko = context_pack.get("korean_understanding")
    genre = (ko.get("genre") if isinstance(ko, dict) else None) or ""
    formality = (ko.get("formality") if isinstance(ko, dict) else None) or ""

    for pat, hint in _TRANSLATIONESE_PATTERNS:
        if re.search(pat, text):
            notes.append(f"한국어 자연화: {hint}")

    if len(text) < 8000:
        has_polite = re.search(_POLITE_STRONG, text)
        has_casual = re.search(_CASUAL_LINE, text)
        if has_polite and has_casual:
            msg = "높임체(습니다/드립니다)와 해요체·구어체가 함께 보입니다. 장르에 맞게 통일을 검토하세요."
            notes.append(msg)
            if genre in ("legal_memo", "administrative", "notice", "press_release"):
                strict.append(msg)

    if genre == "kakao_message":
        headers = len(re.findall(r"^#{1,3}\s", text, re.MULTILINE))
        if headers > 4:
            notes.append("카톡체 요청인데 마크다운 제목(##)이 많습니다. 짧은 줄·문단 위주를 검토하세요.")

    if genre == "news_article" and re.search(r"ㅋㅋ|ㅎㅎ|ㅠㅠ", text):
        notes.append("기사체 요청인데 대화 이모티콘 패턴이 있습니다.")

    if formality == "formal" and re.search(r"\b야\b|했어\?|그럼", text):
        notes.append("formality=formal인데 반말 요소가 섞여 있을 수 있습니다.")

    return notes, strict
