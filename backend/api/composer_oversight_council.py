"""
Composer Oversight Council v2 — 5인 협의회 실행 브리프·task_plan·Writer·Verifier 연동.
"""

from typing import Any, Dict, List, Optional

COUNCIL_UI_PHASES = [
    ("intake", "analyze", "요구 해석"),
    ("strategy", "outline", "전략·구조 기획"),
    ("production", "draft", "본문 생산"),
    ("critique", "crosscheck", "판단·비평"),
    ("integration", "verify", "통합·검증"),
]


def _coerce_str(value: Any, max_len: int = 0) -> str:
    if not isinstance(value, str):
        return ""
    t = value.strip()
    if max_len > 0 and len(t) > max_len:
        return t[:max_len] + "\n…(이하 생략)"
    return t


def is_oversight_council_active(ctx: Optional[Dict[str, Any]]) -> bool:
    if not ctx or not isinstance(ctx, dict):
        return False
    if ctx.get("conversation_graph_analysis") is True:
        return False
    return ctx.get("composer_oversight_council_v2") is True or (
        ctx.get("composer_oversight_enabled") is True
        and bool(_coerce_str(ctx.get("composer_oversight_council_instruction")))
    )


def enrich_task_plan_with_council(
    task_plan: Dict[str, Any],
    ctx: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """프론트·SSE용 task_plan에 Council 단계 메타를 추가합니다."""
    if not is_oversight_council_active(ctx):
        return task_plan
    out = dict(task_plan)
    phases = ctx.get("composer_oversight_council_phases") if ctx else None
    if isinstance(phases, list) and phases:
        out["oversight_council_phases"] = phases
    else:
        out["oversight_council_phases"] = [
            {"id": pid, "pipeline_ui_phase": ui, "label": label}
            for pid, ui, label in COUNCIL_UI_PHASES
        ]
    out["pipeline_oversight_council"] = True
    out["pipeline_status"] = out.get("pipeline_status") or "oversight_council"
    items = ctx.get("composer_oversight_work_items") if ctx else None
    if isinstance(items, list):
        out["oversight_work_item_count"] = len(items)
    return out


def inject_council_writer_brief(ctx: Dict[str, Any]) -> None:
    """Writer LLM 다듬기·초안 생성에 Council 실행 브리프를 주입합니다."""
    if not is_oversight_council_active(ctx):
        return
    brief = _coerce_str(ctx.get("oversight_council_execution_brief"), 8000)
    if not brief:
        brief = _coerce_str(ctx.get("composer_oversight_execution_brief"), 8000)
    council = _coerce_str(ctx.get("composer_oversight_council_instruction"), 12000)
    if not brief and not council:
        return
    block_parts: List[str] = []
    if council:
        block_parts.append("[Oversight Council v2 — 작성·다듬기 시 준수]\n" + council)
    if brief:
        block_parts.append("[Council 실행 브리프]\n" + brief)
    ctx["_oversight_council_writer_brief"] = "\n\n".join(block_parts)[:20000]
    ctx.setdefault("pipeline_verifier_rewrite", True)


def attach_composer_oversight_council_instruction(ctx: Optional[Dict[str, Any]]) -> None:
    """
    Council v2 지시를 `_composer_oversight_instruction`에 통합합니다.
    `composer_oversight_hint.attach_composer_oversight_instruction`보다 먼저/대신 호출 가능.
    """
    if not ctx or not isinstance(ctx, dict):
        return
    if ctx.get("conversation_graph_analysis") is True:
        return
    if ctx.get("_composer_oversight_instruction"):
        return
    if not is_oversight_council_active(ctx):
        return

    council = _coerce_str(ctx.get("composer_oversight_council_instruction"), 16000)
    brief = _coerce_str(ctx.get("composer_oversight_execution_brief"), 8000)
    legacy = _coerce_str(ctx.get("composer_oversight_plan_markdown"), 8000)
    body = council or legacy
    if not body:
        return

    lines = [
        "[Composer Oversight Council v2 — 반드시 준수]",
        body,
    ]
    if brief and brief not in body:
        lines.append("\n[실행 브리프]\n" + brief)

    items = ctx.get("composer_oversight_work_items")
    if isinstance(items, list) and items:
        lines.append("\n[작업 항목]")
        for it in items:
            if isinstance(it, dict):
                idx = it.get("index", "?")
                kind = _coerce_str(it.get("kind")) or "요청"
                summary = _coerce_str(it.get("summary"), 180)
                if summary:
                    lines.append(f"  {idx}. [{kind}] {summary}")

    lines.append(
        "\n- 5단계(Intake→Strategy→Production→Critique→Integration)를 거친 **하나의 완성 답변**으로 제출하세요."
    )
    lines.append(
        "- 일반 채팅 회피(「좋은 질문」「더 구체적으로」)만으로 끝내지 마세요."
    )

    ctx["_composer_oversight_instruction"] = "\n".join(lines)[:24000]
    inject_council_writer_brief(ctx)


def council_verifier_supplement(
    draft_answer: str,
    ctx: Optional[Dict[str, Any]],
) -> List[str]:
    """Verifier 이후 Council 검수표 기반 추가 이슈."""
    issues: List[str] = []
    if not is_oversight_council_active(ctx) or not ctx:
        return issues
    d = (draft_answer or "").strip()
    if len(d) < 120:
        issues.append("Council: 답변이 너무 짧아 항목별 충족·일관성 검증이 어렵습니다.")
    low = d.lower()
    for marker in (
        "좋은 질문이네요",
        "더 정확한 답변을 위해",
        "[다중 요청]",
    ):
        if marker in d:
            issues.append(
                f"Council: 일반 채팅·시스템 태그({marker})가 포함되어 있습니다."
            )
    items = ctx.get("multi_request_items") or ctx.get("composer_oversight_work_items")
    if isinstance(items, list) and len(items) >= 2:
        covered = 0
        for it in items[:12]:
            text = ""
            if isinstance(it, dict):
                text = _coerce_str(it.get("summary"), 80)
            elif isinstance(it, str):
                text = it.strip()[:80]
            if len(text) >= 4 and text[:8] in d:
                covered += 1
        if covered < max(1, len(items) // 2):
            issues.append(
                "Council: 다중 작업 항목 중 절반 이상이 본문에서 식별되지 않습니다."
            )
    if "충족" not in d and "체크" not in d and len(items or []) >= 2:
        issues.append(
            "Council: 말미 충족·일관성 체크(3~5줄)가 없습니다."
        )
    return issues
