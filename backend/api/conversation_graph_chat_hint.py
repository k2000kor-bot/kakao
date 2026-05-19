"""
대화 관계도 답변 생성 — 프론트 context(conversation_graph_*) → LLM 프리픽스.
unified_chat_api.generate_chat_response / llm_service._enhance_with_knowledge 공통.
"""

from typing import Any, Dict, Optional


def _coerce_str(value: Any, max_len: int = 0) -> str:
    if not isinstance(value, str):
        return ""
    t = value.strip()
    if max_len > 0 and len(t) > max_len:
        return t[:max_len] + "\n…(이하 생략)"
    return t


def attach_conversation_graph_instruction(ctx: Optional[Dict[str, Any]]) -> None:
    """
    관계도 답변·생성 요청이면 ctx['_conversation_graph_instruction']을 채움.
    이미 있으면 덮어쓰지 않음.
    """
    if not ctx or not isinstance(ctx, dict):
        return
    if ctx.get("_conversation_graph_instruction"):
        return

    is_graph = ctx.get("conversation_graph_analysis") is True
    intent = _coerce_str(ctx.get("input_intent_hint"))
    if not is_graph and intent not in (
        "conversation_graph_create",
        "conversation_graph_answer",
    ):
        return

    lines = [
        "[대화 관계도 답변 — 반드시 준수]",
        "- 일반 채팅 안내나 '더 구체적으로 말씀해 주세요'류 응답은 금지합니다.",
        "- 아래 스냅샷·요약·원문·지시만 근거로 한국어 보고서를 작성하세요.",
        "- 관계도 생성 요청이면: (1) 한 줄 요약 (2) 참여자 표 (3) 연결 표 (4) Mermaid flowchart TB (5) 갈등·시공사 반응(데이터 있을 때만).",
        "- 수치·스냅샷·근거 발언에 없는 참여자·연결은 추가하지 마세요.",
        "- [다중 요청], [혁신적 답변·글쓰기 품질], [답변 다양성], [가이드라인] 등 시스템 태그·빈 불릿(• .)을 본문에 출력하지 마세요.",
    ]

    title = _coerce_str(ctx.get("conversation_graph_title"))
    period = _coerce_str(ctx.get("conversation_graph_period"))
    if title:
        lines.append(f"- 대화 제목: {title}")
    if period:
        lines.append(f"- 기간: {period}")

    quality = _coerce_str(ctx.get("answer_quality_instruction"))
    if quality:
        lines.append(f"- 품질 지시: {quality}")

    summary = _coerce_str(ctx.get("conversation_graph_summary"), 4000)
    if summary:
        lines.append("\n[관계도 AI 요약]\n" + summary)

    snapshot = _coerce_str(ctx.get("conversation_graph_snapshot"), 8000)
    if snapshot:
        lines.append("\n[관계도 스냅샷 — 참여자·연결·근거]\n" + snapshot)

    narrative = _coerce_str(ctx.get("conversation_graph_narrative"), 4000)
    if narrative:
        lines.append("\n[관계도 내러티브]\n" + narrative)

    raw = _coerce_str(ctx.get("conversation_graph_raw_conversation"), 12000)
    if raw and not snapshot:
        lines.append("\n[대화 원문 — 관계도 추출용]\n" + raw)

    selected = _coerce_str(ctx.get("conversation_graph_selected_participant"), 2000)
    if selected:
        lines.append("\n[선택 참여자]\n" + selected)

    if not snapshot and not raw and not summary:
        lines.append(
            "\n※ 관계도 데이터가 비어 있습니다. "
            "가능한 범위에서 안내하되, 허구의 참여자·연결은 만들지 마세요."
        )

    ctx["_conversation_graph_instruction"] = "\n".join(lines)[:24000]
