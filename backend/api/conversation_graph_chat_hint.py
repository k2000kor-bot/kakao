"""
대화 관계도 답변 생성 — 프론트 context(conversation_graph_*) → LLM 프리픽스.
unified_chat_api.generate_chat_response / llm_service._enhance_with_knowledge 공통.
"""

import re
from typing import Any, Dict, List, Optional, Tuple

GENERIC_CHAT_MARKERS = (
    "[다중 요청]",
    "좋은 질문이네요",
    "더 정확한 답변을 위해",
    "구체적으로 말씀해주시면",
    "사용 기술",
    "Python으로 [원하는 기능]",
)


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

    revision = ctx.get("conversation_graph_revision_issues")
    if revision:
        lines.append("\n[이전 초안 자동 검증 이슈 — 반드시 수정]")
        if isinstance(revision, list):
            for item in revision:
                t = _coerce_str(item)
                if t:
                    lines.append(f"- {t}")
        else:
            t = _coerce_str(revision)
            if t:
                lines.append(f"- {t}")

    summary = _coerce_str(ctx.get("conversation_graph_summary"), 4000)
    if summary:
        lines.append("\n[관계도 AI 요약]\n" + summary)

    outline = _coerce_str(ctx.get("conversation_graph_answer_outline"), 4000)
    if outline:
        lines.append("\n[1차 개요 — 2차 보고서에서 확장]\n" + outline)

    two_pass = _coerce_str(ctx.get("conversation_graph_two_pass_phase"))
    if two_pass == "outline":
        lines.append("- 1차 개요 단계: ## 한 줄 요약·해석·갈등·실행 제안만 짧게. 표·Mermaid 금지.")

    structured = _coerce_str(ctx.get("conversation_graph_structured_sections"), 12000)
    if structured and not ctx.get("conversation_graph_omit_structured_in_instruction"):
        lines.append(
            "\n[구조화 데이터 블록 — 표·Mermaid는 시스템 생성, 수정·삭제 금지. 요약·해석·실행 제안만 작성]\n"
            + structured
        )

    snapshot = _coerce_str(ctx.get("conversation_graph_snapshot"), 8000)
    if snapshot:
        lines.append("\n[관계도 스냅샷 — 참여자·연결·근거]\n" + snapshot)

    narrative = _coerce_str(ctx.get("conversation_graph_narrative"), 4000)
    if narrative:
        lines.append("\n[관계도 내러티브]\n" + narrative)

    raw = _coerce_str(ctx.get("conversation_graph_raw_conversation"), 12000)
    if not raw:
        raw = _coerce_str(ctx.get("conversation_file_content"), 12000)
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


def is_generic_chat_fallback(text: str) -> bool:
    """일반 채팅·다중 요청 안내 템플릿 여부."""
    t = (text or "").strip()
    if not t:
        return True
    return any(marker in t for marker in GENERIC_CHAT_MARKERS)


def seal_context_for_conversation_graph_chat(ctx: Dict[str, Any]) -> Dict[str, Any]:
    """관계도 답변 전용 — 다중요청·웹연구 등 일반 채팅 경로 간섭 제거."""
    out = dict(ctx)
    out["multi_request_mode"] = False
    out.pop("multi_request_items", None)
    out.pop("multi_request_adaptation_instruction", None)
    out.pop("_multi_request_instruction", None)
    out["enable_web_research"] = False
    out["prefer_informed_answer"] = True
    attach_conversation_graph_instruction(out)
    return out


def _parse_participants_from_snapshot(snapshot: str) -> List[Tuple[str, str, str]]:
    """스냅샷 한 줄 '참여자: A(동조, 1발화), B(...)' 파싱."""
    participants: List[Tuple[str, str, str]] = []
    m = re.search(r"참여자\s*[:：]\s*(.+)", snapshot, re.IGNORECASE)
    if not m:
        return participants
    chunk = m.group(1).split("\n")[0]
    for part in re.split(r",\s*", chunk):
        part = part.strip()
        if not part:
            continue
        pm = re.match(r"([^(\s]+)\s*\(([^)]+)\)", part)
        if pm:
            name = pm.group(1).strip()
            detail = pm.group(2).strip()
            utter = "1"
            um = re.search(r"(\d+)\s*발화", detail)
            if um:
                utter = um.group(1)
            stance = re.sub(r",?\s*\d+\s*발화", "", detail).strip() or detail
            participants.append((name, stance, utter))
        elif part:
            participants.append((part, "-", "-"))
    return participants


def _parse_edges_from_snapshot(snapshot: str) -> List[Tuple[str, str, str]]:
    """'연결: A→B 동조' 형태 파싱."""
    edges: List[Tuple[str, str, str]] = []
    m = re.search(r"연결\s*[:：]\s*(.+)", snapshot, re.IGNORECASE)
    if not m:
        return edges
    chunk = m.group(1).split("\n")[0]
    for seg in re.split(r",\s*", chunk):
        seg = seg.strip()
        if not seg:
            continue
        em = re.match(r"([^→\s]+)\s*→\s*([^\s]+)\s+(.+)", seg)
        if em:
            edges.append((em.group(1).strip(), em.group(2).strip(), em.group(3).strip()))
        else:
            em2 = re.match(r"([^→\s]+)\s*→\s*(.+)", seg)
            if em2:
                edges.append((em2.group(1).strip(), em2.group(2).strip(), "연결"))
    return edges


def build_structured_graph_answer_fallback(ctx: Dict[str, Any]) -> Optional[str]:
    """
    LLM·일반 채팅 폴백 실패 시 스냅샷·원문만으로 관계도 보고서 초안 생성.
    입력창·API 스모크에서 Mermaid·표가 반드시 포함되도록 합니다.
    """
    snapshot = _coerce_str(ctx.get("conversation_graph_snapshot"), 8000)
    raw = _coerce_str(ctx.get("conversation_graph_raw_conversation"), 12000)
    if not raw:
        raw = _coerce_str(ctx.get("conversation_file_content"), 12000)

    if not snapshot and not raw:
        hint = _coerce_str(ctx.get("conversation_graph_create_hint"))
        if hint:
            return (
                "## 안내\n\n"
                f"{hint}\n\n"
                "카카오톡 대화 **TXT/CSV**를 첨부하거나 `/conversation-graph`에서 대화를 붙여넣은 뒤 "
                "「관계도 만들기」로 다시 요청해 주세요."
            )
        return None

    participants = _parse_participants_from_snapshot(snapshot) if snapshot else []
    edges = _parse_edges_from_snapshot(snapshot) if snapshot else []

    parts: List[str] = [
        "## 한 줄 요약",
        "",
        "제공된 대화·관계도 스냅샷을 바탕으로 참여자 간 동조·반대·발화 흐름을 정리했습니다. "
        "수치·스냅샷에 없는 참여자·연결은 추가하지 않았습니다.",
        "",
        "## 참여자 표",
        "",
        "| 참여자 | 우세 입장·역할 | 발화 수 |",
        "| --- | --- | --- |",
    ]

    if participants:
        for name, stance, utter in participants:
            parts.append(f"| {name} | {stance} | {utter} |")
    else:
        parts.append("| (스냅샷에서 추출 필요) | - | - |")

    parts.extend(["", "## 연결 표", "", "| 출발 | 도착 | 관계 |", "| --- | --- | --- |"])
    if edges:
        for src, dst, rel in edges:
            parts.append(f"| {src} | {dst} | {rel} |")
    else:
        parts.append("| - | - | - |")

    node_ids: Dict[str, str] = {}

    def _node_id(label: str) -> str:
        if label not in node_ids:
            node_ids[label] = f"n{len(node_ids)}"
        return node_ids[label]

    mermaid_lines = ["```mermaid", "flowchart TB"]
    labels = [p[0] for p in participants] if participants else []
    if not labels and edges:
        for s, d, _ in edges:
            if s not in labels:
                labels.append(s)
            if d not in labels:
                labels.append(d)
    for label in labels:
        mermaid_lines.append(f'  {_node_id(label)}["{label}"]')
    if edges:
        for src, dst, rel in edges:
            mermaid_lines.append(f"  {_node_id(src)} -->|{rel}| {_node_id(dst)}")
    elif len(labels) >= 2:
        mermaid_lines.append(f"  {_node_id(labels[0])} --> {_node_id(labels[1])}")
    mermaid_lines.append("```")

    parts.extend(["", "## Mermaid 관계도 (족보형)", ""] + mermaid_lines)
    parts.append("")
    parts.append(
        "*성향·선호는 추정이며, 스냅샷·근거 발언에 없는 내용은 포함하지 않았습니다.*"
    )

    if raw and not snapshot:
        parts.extend(["", "## 참고: 대화 원문 일부", "", raw[:2000] + ("…" if len(raw) > 2000 else "")])

    return "\n".join(parts)
