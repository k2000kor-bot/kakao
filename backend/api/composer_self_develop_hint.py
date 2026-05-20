"""
컴포저 답변 생성 — 단계별 자가 개발(적극적 품질 향상) LLM 지시.
프론트 composer_self_develop_enabled 시 unified_chat_api·llm_service에서 사용.
"""

from typing import Any, Dict, Optional


def attach_composer_self_develop_instruction(ctx: Optional[Dict[str, Any]]) -> None:
    if not ctx or not isinstance(ctx, dict):
        return
    if not ctx.get("composer_self_develop_enabled"):
        return
    proactive = ctx.get("composer_self_develop_proactive") is True
    if ctx.get("_composer_self_develop_instruction"):
        return

    phase = str(ctx.get("composer_self_develop_phase") or "integrate").strip().lower()
    attempt = ctx.get("composer_self_develop_attempt")
    attempt_s = f" (시도 {attempt})" if attempt is not None else ""

    lessons = ctx.get("composer_self_develop_lessons")
    lesson_block = ""
    if isinstance(lessons, list) and lessons:
        lines = [f"- {str(x).strip()[:300]}" for x in lessons[:10] if str(x).strip()]
        if lines:
            lesson_block = "\n[이전 턴에서 학습한 개선점 — 반영]\n" + "\n".join(lines) + "\n"

    lines = [
        "[답변 생성 자가 개발 — 적극적으로 스스로 발전하며 답하세요]",
        "수동적·최소 답변을 피하고, 사용자 질문에 직접·충실히 답하세요."
        + (" 적극 모드: 부족한 부분을 스스로 발견해 보완한 뒤 제출하세요." if proactive else ""),
        "역할 이름·단계 라벨·체크리스트 메타를 본문에 출력하지 마세요. 완성된 답변만 제시하세요.",
        "",
        "내부 순서(반드시 순차 수행, 각 단계를 건너뛰지 마세요):",
        "1) intake — 사용자 질문·요구·맥락을 한 문장으로 재정의",
        "2) plan — 답변 구조·항목·형식(표/목록/문단) 확정",
        "3) draft — 근거·예시를 포함한 초안",
        "4) critique — 누락·비약·질문 미반영·메타 문구 점검",
        "5) integrate — 하나의 일관된 최종 답변으로 통합",
        "6) evolve — 다음에 더 나은 답을 위해 부족했던 점을 내부적으로만 기록",
        "",
        f"현재 강조 단계: {phase}{attempt_s}",
        lesson_block,
        "출력: 사용자 언어로, 핵심 결론을 먼저, 실행 가능한 다음 단계 1개 이상 포함.",
    ]
    ctx["_composer_self_develop_instruction"] = "\n".join(lines)[:8000]
