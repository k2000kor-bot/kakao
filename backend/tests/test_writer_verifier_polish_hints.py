"""Writer LLM 다듬기: 검수 1회 재작성 시 주입되는 피드백이 프롬프트에 포함되는지.

`patch("api.unified_chat_api.generate_chat_response")`는 해당 모듈을 import 하며
FastAPI 등 전체 의존성을 끌어옵니다. pytest를 venv 밖에서 돌릴 때 실패하므로
`sys.modules`에 가짜 `api.unified_chat_api`만 주입합니다.
"""

import sys
import types
from typing import Any, List, Optional, Tuple

from api.question_answer_pipeline.schemas import (
    Claim,
    ClaimGraph,
    EvidenceBundle,
    EvidenceItem,
    RouteDecision,
)
from api.question_answer_pipeline.writer import write_draft


def _minimal_route() -> RouteDecision:
    return RouteDecision(
        task_type="generate",
        domain=[],
        grounding_required="preferred",
        sources=["internal_rag"],
        risk_level="low",
        answer_schema="narrative",
    )


def _minimal_bundle() -> EvidenceBundle:
    ev = EvidenceItem(
        evidence_id="e1",
        type="rag_chunk",
        source_ref={},
        content="2024년 매출은 100억이었다.",
    )
    return EvidenceBundle(items=[ev], coverage=0.5, confidence=0.8)


def _minimal_graph() -> ClaimGraph:
    return ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement="2024년 매출은 100억이었다.",
                supporting=["e1"],
            )
        ]
    )


def _stub_unified_chat_api(
    filler: str,
) -> Tuple[Optional[Any], List[str]]:
    """가짜 api.unified_chat_api를 등록하고, (이전 모듈, prompt 수집 리스트)를 반환."""
    captured: List[str] = []
    mod = types.ModuleType("api.unified_chat_api")

    async def generate_chat_response(prompt: str, _mode: str, _ctx: object) -> str:
        captured.append(prompt)
        return filler * 120

    mod.generate_chat_response = generate_chat_response
    previous = sys.modules.get("api.unified_chat_api")
    sys.modules["api.unified_chat_api"] = mod
    return previous, captured


def _restore_unified_chat_api(previous: Optional[Any]) -> None:
    if previous is not None:
        sys.modules["api.unified_chat_api"] = previous
    else:
        sys.modules.pop("api.unified_chat_api", None)


def test_writer_llm_prompt_includes_verifier_polish_hints(monkeypatch):
    monkeypatch.delenv("PIPELINE_WRITER_SKIP_LLM_POLISH", raising=False)
    ctx = {
        "_verifier_issues_for_polish": "- 테스트 이슈 한 줄",
        "_verifier_fix_actions_for_polish": "- 수정 지시 한 줄",
        "_writer_route_hint": "[라우팅] task=generate",
    }
    prev, prompts = _stub_unified_chat_api("x")
    try:
        out = write_draft(
            _minimal_graph(),
            _minimal_bundle(),
            _minimal_route(),
            "매출 알려줘",
            ctx,
        )
        assert len(out) >= 50
        assert len(prompts) >= 1
        prompt = prompts[0]
        assert "[검수 피드백]" in prompt
        assert "테스트 이슈" in prompt
        assert "수정 지시" in prompt
    finally:
        _restore_unified_chat_api(prev)


def test_writer_without_verifier_hints_has_no_feedback_block(monkeypatch):
    monkeypatch.delenv("PIPELINE_WRITER_SKIP_LLM_POLISH", raising=False)
    ctx = {"_writer_route_hint": "[라우팅] task=generate"}
    prev, prompts = _stub_unified_chat_api("y")
    try:
        write_draft(
            _minimal_graph(),
            _minimal_bundle(),
            _minimal_route(),
            "매출 알려줘",
            ctx,
        )
        assert len(prompts) >= 1
        prompt = prompts[0]
        assert "[검수 피드백]" not in prompt
    finally:
        _restore_unified_chat_api(prev)


def test_writer_llm_prompt_includes_multilayer_style_hint(monkeypatch):
    monkeypatch.delenv("PIPELINE_WRITER_SKIP_LLM_POLISH", raising=False)
    ctx = {
        "_writer_route_hint": "[라우팅] task=generate",
        "multilayer_style_hint": {
            "analysis_depth": "surface",
            "style_signature": {"uniqueness": 0.5, "consistency": 0.6},
        },
    }
    prev, prompts = _stub_unified_chat_api("z")
    try:
        write_draft(
            _minimal_graph(),
            _minimal_bundle(),
            _minimal_route(),
            "매출 알려줘",
            ctx,
        )
        assert len(prompts) >= 1
        prompt = prompts[0]
        assert "[다층 스타일 힌트]" in prompt
        assert "analysis_depth" in prompt
        assert "surface" in prompt
    finally:
        _restore_unified_chat_api(prev)
