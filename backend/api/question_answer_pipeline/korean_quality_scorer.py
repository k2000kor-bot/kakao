# 한국어 출력 품질 — 규칙 기반 휴리스틱 점수 (0~1), LLM 없음
# @see docs/architecture/GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md §8.1

from __future__ import annotations

import re
from typing import Any, Dict, List

from .korean_style_checks import collect_korean_style_notes


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def score_korean_output(text: str, context_pack: Dict[str, Any]) -> Dict[str, Any]:
    """
    자연스러움·문체 일관성·장르 적합 힌트를 0~1 스칼라로 근사.
    실제 사용자 평가를 대체하지 않으며, 로그·메타·A/B용.
    """
    t = (text or "").strip()
    if not t:
        return {
            "naturalness_heuristic": 0.0,
            "politeness_consistency": 0.0,
            "genre_fit_heuristic": 0.0,
            "notes": ["빈 응답"],
        }

    notes, strict = collect_korean_style_notes(t, context_pack)
    penalty = len(notes) * 0.08 + len(strict) * 0.12

    # 자연스러움: 번역투·노트 수에 페널티
    natural = _clamp01(1.0 - penalty)
    if re.search(r"[가-힣]{30,}", t) and not re.search(r"진행되어지는|검토가 필요하다고 판단됩니다", t):
        natural = _clamp01(natural + 0.05)

    # 높임 일관성: strict 이슈가 없으면 높게
    polite = _clamp01(1.0 - (0.35 if strict else 0.0) - (0.1 if len(notes) > 2 else 0.0))

    ko = context_pack.get("korean_understanding")
    genre = (ko.get("genre") if isinstance(ko, dict) else None) or ""
    genre_fit = 0.75
    if genre == "kakao_message":
        if len(t) > 2000 or t.count("\n## ") > 3:
            genre_fit = 0.45
        elif len(t) < 800:
            genre_fit = 0.9
    elif genre in ("news_article", "press_release"):
        if re.search(r"ㅋㅋ|ㅎㅎ", t):
            genre_fit = 0.4
        else:
            genre_fit = 0.82
    elif genre in ("legal_memo", "administrative"):
        genre_fit = 0.78 if not strict else 0.5

    overall = _clamp01((natural * 0.4 + polite * 0.35 + genre_fit * 0.25))

    return {
        "naturalness_heuristic": round(natural, 3),
        "politeness_consistency": round(polite, 3),
        "genre_fit_heuristic": round(genre_fit, 3),
        "overall_heuristic": round(overall, 3),
        "notes": notes[:5],
        "strict_flags": len(strict),
    }


def summarize_scores_for_metadata(scores: Dict[str, Any]) -> List[str]:
    """사람이 읽기 쉬운 한 줄 요약."""
    lines = [
        f"종합(휴리스틱): {scores.get('overall_heuristic', 0):.2f}",
        f"자연스러움: {scores.get('naturalness_heuristic', 0):.2f}, "
        f"높임 일관성: {scores.get('politeness_consistency', 0):.2f}, "
        f"장르 적합: {scores.get('genre_fit_heuristic', 0):.2f}",
    ]
    return lines
