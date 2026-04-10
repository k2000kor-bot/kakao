"""Writer — 블루프린트 선행 병합·LLM 다듬기 생략."""

from api.question_answer_pipeline.schemas import (
    Claim,
    ClaimGraph,
    EvidenceBundle,
    EvidenceItem,
    RouteDecision,
)
from api.question_answer_pipeline.writer import write_draft


def _rd(schema="narrative"):
    return RouteDecision(
        task_type="how_to",
        domain=["general"],
        grounding_required="preferred",
        sources=["internal_rag"],
        risk_level="low",
        answer_schema=schema,
        stop_conditions=[],
    )


def _cg(text="단계 하나"):
    return ClaimGraph(
        claims=[
            Claim(claim_id="c1", statement=text, supporting=["e1"]),
        ]
    )


def _eb():
    return EvidenceBundle(
        items=[
            EvidenceItem(
                evidence_id="e1",
                type="rag_chunk",
                source_ref={},
                content="근거 본문",
            )
        ],
        coverage=0.9,
    )


def test_steps_schema_prepends_blueprint():
    ctx = {"_answer_blueprint_markdown": "## 블루프린트\n- 개요"}
    out = write_draft(_cg(), _eb(), _rd(schema="steps"), "q", context_pack=ctx)
    assert "## 블루프린트" in out
    assert "**절차**" in out
    assert out.index("## 블루프린트") < out.index("**절차**")


def test_checklist_prepends_blueprint():
    ctx = {"_answer_blueprint_markdown": "# 목차"}
    out = write_draft(_cg("항목"), _eb(), _rd(schema="checklist"), "q", context_pack=ctx)
    assert "# 목차" in out
    assert "**확인 항목**" in out


def test_table_prepends_blueprint():
    ctx = {"_answer_blueprint_markdown": "> 개요"}
    out = write_draft(_cg("셀"), _eb(), _rd(schema="table"), "q", context_pack=ctx)
    assert "> 개요" in out
    assert "| 항목 |" in out


def test_skip_llm_polish_via_context(monkeypatch):
    """context 플래그 시 LLM 다듬기 분기 전에 반환(unified_chat_api 미로드)."""
    monkeypatch.delenv("PIPELINE_WRITER_SKIP_LLM_POLISH", raising=False)
    ctx = {"pipeline_skip_writer_llm_polish": True}
    out = write_draft(_cg("본문 한 줄"), _eb(), _rd(schema="narrative"), "q", context_pack=ctx)
    assert "본문 한 줄" in out
    assert "**답변**" in out


def test_skip_llm_polish_via_env(monkeypatch):
    monkeypatch.setenv("PIPELINE_WRITER_SKIP_LLM_POLISH", "true")
    out = write_draft(_cg("환경변수 스킵"), _eb(), _rd(), "q", context_pack={})
    assert "**답변**" in out
    assert "환경변수 스킵" in out
