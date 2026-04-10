# -*- coding: utf-8 -*-
"""
질문 유형·검색 스펙·다중 요청을 반영한 생성 시나리오(비 LLM).
Writer/Verifier가 동일한 '전개 순서·검증 포인트'를 공유하도록 한다.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .schemas import RetrievalSpec, RouteDecision


def _truncate(s: str, max_len: int) -> str:
    s = (s or "").strip()
    if len(s) <= max_len:
        return s
    return s[: max_len - 1] + "…"


def build_generation_scenario_markdown(
    normalized_query: str,
    route_decision: RouteDecision,
    retrieval_spec: RetrievalSpec,
    context_pack: Optional[Dict[str, Any]] = None,
) -> str:
    """
    답변 생성 시 따라야 할 단계·검증 포인트를 마크다운으로 정리한다.
    """
    cp = context_pack or {}
    lines: List[str] = []
    lines.append("## 답변 생성 시나리오 (파이프라인)")
    lines.append("")
    lines.append("### 1. 생성 전 확인")
    lines.append("- 사용자 질문의 핵심 의도를 한 문장으로 정리했는가.")
    lines.append("- 아래 '하위 질문'·'다중 요청'이 있으면 각각에 균형 있게 응답했는가.")
    lines.append("- 근거가 부족한 주장은 단정하지 않고 한계를 밝혔는가.")
    lines.append("")
    lines.append("### 2. 전개 순서 (권장)")
    lines.append("1. 짧은 요약 또는 결론(가능할 때)")
    lines.append("2. 하위 질문·요청 항목별로 구분(소제목·번호)")
    lines.append("3. 필요 시 근거·출처 언급(과장 없이)")
    lines.append("4. 한계·추가 확인이 필요한 점(있을 때만)")
    lines.append("")
    nq = _truncate(normalized_query, 400)
    if nq:
        lines.append("### 3. 정규화된 사용자 질문")
        lines.append(nq)
        lines.append("")
    am = (cp.get("answer_mode") or "").strip() or "(미지정)"
    rs = (cp.get("response_style") or "").strip()
    lines.append("### 4. 라우팅·모드")
    lines.append(f"- task_type: `{route_decision.task_type}`")
    lines.append(f"- answer_schema: `{route_decision.answer_schema}`")
    lines.append(f"- answer_mode: `{am}`")
    if rs:
        lines.append(f"- response_style: `{rs}`")
    lines.append(f"- grounding: `{route_decision.grounding_required}`")
    lines.append("")
    subs = retrieval_spec.subquestions if retrieval_spec else []
    if subs:
        lines.append("### 5. 하위 질문 (RetrievalSpec)")
        for i, sq in enumerate(subs[:12], 1):
            q = _truncate(sq.question, 200)
            lines.append(f"{i}. [{sq.id}] {q}")
        lines.append("")
    mrm = cp.get("multi_request_mode")
    items = cp.get("multi_request_items")
    if mrm and isinstance(items, list) and items:
        lines.append("### 6. 다중 요청 모드")
        lines.append("- 각 요청 항목에 대해 답변 본문에서 **누락 없이** 다룰 것.")
        for i, it in enumerate(items[:15], 1):
            if isinstance(it, str) and it.strip():
                lines.append(f"{i}. {_truncate(it.strip(), 120)}")
        lines.append("")
    lines.append("### 7. 검증 포인트 (초안 후 자가 점검)")
    lines.append("- 하위 질문·다중 요청 항목이 본문에 반영되었는가.")
    lines.append("- 수치·날짜·단정은 근거와 함께인가(grounding이 strict/required일 때 특히).")
    lines.append("- 불필요한 메타 설명('질문을 이해했습니다' 등)은 피했는가.")
    lines.append("")
    return "\n".join(lines).strip()
