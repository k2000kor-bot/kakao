"""
컴포저 중간 관리형 답변 — 질문·요구·글쓰기·다중 요청에 대한
기획(팀장)·판단·검증 역할 지시를 LLM·Q→A 파이프라인에 주입합니다.
"""

from typing import Any, Dict, List, Optional


def _coerce_str(value: Any, max_len: int = 0) -> str:
    if not isinstance(value, str):
        return ""
    t = value.strip()
    if max_len > 0 and len(t) > max_len:
        return t[:max_len] + "\n…(이하 생략)"
    return t


def _format_work_items(items: Any) -> List[str]:
    lines: List[str] = []
    if not isinstance(items, list):
        return lines
    for it in items:
        if isinstance(it, dict):
            idx = it.get("index", len(lines) + 1)
            kind = _coerce_str(it.get("kind")) or "요청"
            summary = _coerce_str(it.get("summary"), 200)
            if summary:
                lines.append(f"  {idx}. [{kind}] {summary}")
        elif isinstance(it, str) and it.strip():
            lines.append(f"  - {it.strip()[:200]}")
    return lines


def attach_composer_oversight_instruction(ctx: Optional[Dict[str, Any]]) -> None:
    """
    composer_oversight_* context가 있으면 ctx['_composer_oversight_instruction']을 채움.
    관계도 전용 답변(conversation_graph_analysis)에는 적용하지 않습니다.
    """
    if not ctx or not isinstance(ctx, dict):
        return
    if ctx.get("conversation_graph_analysis") is True:
        return
    if ctx.get("composer_simple_query") is True:
        return
    if ctx.get("_composer_oversight_instruction"):
        return
    if not ctx.get("composer_oversight_enabled"):
        return

    try:
        from api.composer_oversight_council import attach_composer_oversight_council_instruction

        if ctx.get("composer_oversight_council_v2"):
            attach_composer_oversight_council_instruction(ctx)
            if ctx.get("_composer_oversight_instruction"):
                return
    except ImportError:
        pass

    plan = _coerce_str(ctx.get("composer_oversight_plan_markdown"), 12000)
    inline = _coerce_str(ctx.get("composer_oversight_instruction"), 12000)
    body = plan or inline
    if not body:
        return

    lines = [
        "[중간 관리형 답변 생성 — 반드시 준수]",
        body,
    ]

    items = _format_work_items(ctx.get("composer_oversight_work_items"))
    if items:
        lines.append("\n[작업 항목 요약]")
        lines.extend(items)

    if ctx.get("composer_oversight_has_multiple"):
        lines.append(
            "\n- 다중 질문·요구: 번호 순서대로 빠짐없이 처리하고, "
            "항목 간 용어·논지를 일관되게 유지하세요."
        )

    mri = ctx.get("_multi_request_instruction") or ctx.get("multi_request_items")
    if mri:
        lines.append(
            "\n- 프론트 multi_request 항목과 위 작업 항목을 모두 충족하세요."
        )

    lines.append(
        "\n- 일반 채팅 회피 문구(「좋은 질문」「더 구체적으로」 등)만으로 끝내지 마세요."
    )

    ctx["_composer_oversight_instruction"] = "\n".join(lines)[:24000]
