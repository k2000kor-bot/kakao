"""생성 시나리오 마크다운·Verifier 다중요청 휴리스틱."""

from unittest.mock import patch

from api.question_answer_pipeline.generation_scenario import build_generation_scenario_markdown
from api.question_answer_pipeline.schemas import (
    Claim,
    ClaimGraph,
    EvidenceBundle,
    EvidenceItem,
    RetrievalSpec,
    RouteDecision,
    SubQuestion,
    VerificationReport,
)
from api.question_answer_pipeline.verifier import verify


def _rd():
    return RouteDecision(
        task_type="generate",
        domain=["dev"],
        grounding_required="preferred",
        sources=["internal_rag"],
        risk_level="low",
        answer_schema="narrative",
        stop_conditions=[],
    )


def test_build_generation_scenario_includes_task_and_subquestions():
    spec = RetrievalSpec(
        subquestions=[
            SubQuestion(
                id="sq1",
                question="첫 번째 하위 질문?",
                source_plan=[{"type": "internal_rag", "query": "q1"}],
            )
        ]
    )
    cp = {"answer_mode": "expert", "response_style": "comprehensive"}
    md = build_generation_scenario_markdown("메인 질문", _rd(), spec, cp)
    assert "task_type" in md
    assert "expert" in md
    assert "sq1" in md
    assert "첫 번째 하위" in md


def test_build_generation_scenario_multi_request_section():
    spec = RetrievalSpec(subquestions=[])
    cp = {
        "multi_request_mode": True,
        "multi_request_items": ["항목 알파 설명", "항목 베타 설명"],
    }
    md = build_generation_scenario_markdown("q", _rd(), spec, cp)
    assert "다중 요청" in md
    assert "항목 알파" in md


def test_verify_flags_missing_multi_request_item():
    bundle = EvidenceBundle(items=[], coverage=0.5, confidence=0.5)
    graph = ClaimGraph(
        claims=[
            Claim(claim_id="c1", statement="일반적인 답변만 있습니다.", supporting=[]),
        ]
    )
    cp = {
        "multi_request_mode": True,
        "multi_request_items": ["반드시 포함할 고유키워드엑스와이제트"],
    }
    r = verify(
        "일반적인 답변만 있습니다.",
        graph,
        bundle,
        grounding_required="preferred",
        context_pack=cp,
    )
    assert r.pass_ is False
    assert any("다중 요청" in i for i in r.issues)


def test_verify_flags_weak_followup_subquestion():
    bundle = EvidenceBundle(items=[], coverage=0.5, confidence=0.5)
    graph = ClaimGraph(
        claims=[
            Claim(claim_id="c1", statement="짧은 일반 답변입니다.", supporting=[]),
        ]
    )
    cp = {
        "_task_plan_for_response": {
            "subquestions": [
                {"id": "sq1", "question_preview": "메인 질문 텍스트"},
                {
                    "id": "sq2",
                    "question_preview": (
                        "[보완 관점] 위 질의에 답할 때 빠질 수 있는 전제·예외·리스크를 짚기 위한 맥락: 부동산 계약"
                    ),
                },
            ]
        }
    }
    r = verify(
        "짧은 일반 답변입니다.",
        graph,
        bundle,
        grounding_required="preferred",
        context_pack=cp,
    )
    assert any("보조 하위 질문" in i for i in r.issues)


def test_verify_passes_when_followup_lexicon_in_draft():
    bundle = EvidenceBundle(items=[], coverage=0.5, confidence=0.5)
    draft = (
        "전제와 예외를 구분하고, 부동산 계약에서 빠질 수 있는 리스크도 함께 짚어보면 다음과 같습니다."
    )
    graph = ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement=draft,
                supporting=[],
            ),
        ]
    )
    cp = {
        "_task_plan_for_response": {
            "subquestions": [
                {"id": "sq1", "question_preview": "메인"},
                {
                    "id": "sq2",
                    "question_preview": (
                        "[보완 관점] 위 질의에 답할 때 빠질 수 있는 전제·예외·리스크를 짚기 위한 맥락: 부동산"
                    ),
                },
            ]
        }
    }
    r = verify(
        draft,
        graph,
        bundle,
        grounding_required="preferred",
        context_pack=cp,
    )
    assert not any("보조 하위 질문" in i for i in r.issues)


def test_verify_passes_when_multi_request_words_in_draft():
    bundle = EvidenceBundle(items=[], coverage=0.5, confidence=0.5)
    graph = ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement="고유키워드엑스와이제트에 대해 설명합니다.",
                supporting=[],
            ),
        ]
    )
    cp = {
        "multi_request_mode": True,
        "multi_request_items": ["고유키워드엑스와이제트 설명 요청"],
    }
    r = verify(
        "고유키워드엑스와이제트에 대해 설명합니다.",
        graph,
        bundle,
        grounding_required="preferred",
        context_pack=cp,
    )
    assert not any("다중 요청" in i for i in r.issues)


def _pipeline_mock_bundle():
    return EvidenceBundle(
        items=[
            EvidenceItem(
                evidence_id="e1",
                type="rag_chunk",
                source_ref={},
                content="근거 본문입니다.",
            )
        ],
        coverage=0.55,
        confidence=0.8,
    )


def _pipeline_mock_graph():
    return ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement="근거 본문입니다.",
                supporting=["e1"],
            )
        ]
    )


def _run_pipeline_with_stubs(context, write_hook=None):
    def write_draft_fn(*args, context_pack=None, **_k):
        cp = context_pack if context_pack is not None else (args[4] if len(args) >= 5 else None)
        if write_hook is not None:
            write_hook(cp)
        return "근거 본문입니다."

    def verify_fn(*_a, **_k):
        return VerificationReport(
            pass_=True, issues=[], fix_actions=[], korean_style_notes=[]
        )

    with patch(
        "api.question_answer_pipeline.orchestrator.route",
        lambda *_a, **_k: _rd(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.wants_blueprint_first",
        lambda *_a, **_k: False,
    ), patch(
        "api.question_answer_pipeline.orchestrator.retrieve",
        lambda *_a, **_k: _pipeline_mock_bundle(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.synthesize",
        lambda *_a, **_k: _pipeline_mock_graph(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.write_draft",
        write_draft_fn,
    ), patch(
        "api.question_answer_pipeline.orchestrator.verify",
        verify_fn,
    ), patch(
        "api.question_answer_pipeline.orchestrator.resolve_style_profile",
        lambda *_a, **_k: None,
    ), patch(
        "api.question_answer_pipeline.orchestrator.score_korean_output",
        lambda *_a, **_k: {},
    ), patch(
        "api.question_answer_pipeline.orchestrator.maybe_critique_final_answer",
        lambda *_a, **_k: (None, None),
    ), patch(
        "api.question_answer_pipeline.orchestrator.maybe_refine_final_answer",
        lambda *_a, **_k: (None, {}),
    ), patch(
        "api.question_answer_pipeline.orchestrator.suggest_next_actions",
        lambda *_a, **_k: [],
    ):
        from api.question_answer_pipeline.orchestrator import run_pipeline

        return run_pipeline("옵트인 시나리오 테스트", context)


def test_run_pipeline_includes_generation_scenario_when_opt_in():
    out = _run_pipeline_with_stubs({"include_generation_scenario_in_response": True})
    assert out.get("success") is True
    gs = out.get("generation_scenario")
    assert isinstance(gs, str)
    assert "답변 생성 시나리오" in gs
    assert "옵트인 시나리오 테스트" in gs


def test_run_pipeline_omits_generation_scenario_without_opt_in():
    out = _run_pipeline_with_stubs({})
    assert out.get("success") is True
    assert out.get("generation_scenario") is None


def test_run_pipeline_appends_client_generation_scenario_for_writer():
    captured = {}

    def hook(cp):
        if cp is not None:
            captured["md"] = cp.get("_generation_scenario_markdown") or ""

    _run_pipeline_with_stubs(
        {"client_generation_scenario": "고유클라이언트힌트줄"},
        write_hook=hook,
    )
    md = captured.get("md", "")
    assert "답변 생성 시나리오" in md
    assert "클라이언트 추가 시나리오" in md
    assert "고유클라이언트힌트줄" in md
