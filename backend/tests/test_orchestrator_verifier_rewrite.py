"""검수 1회 재작성: pipeline_verifier_rewrite 시 write_draft가 2회 호출되는지 스모크."""

import pytest
from unittest.mock import patch

from api.question_answer_pipeline.schemas import (
    Claim,
    ClaimGraph,
    EvidenceBundle,
    EvidenceItem,
    RouteDecision,
    VerificationReport,
)


def _rd():
    return RouteDecision(
        task_type="generate",
        domain=[],
        grounding_required="preferred",
        sources=["internal_rag"],
        risk_level="low",
        answer_schema="narrative",
        stop_conditions=[],
    )


def _bundle():
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


def _graph():
    return ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement="근거 본문입니다.",
                supporting=["e1"],
            )
        ]
    )


def test_verifier_rewrite_calls_write_draft_twice():
    calls = {"write": 0, "verify": 0}

    def write_draft_fn(*_a, **_k):
        calls["write"] += 1
        return f"draft_v{calls['write']}"

    def verify_fn(*_a, **_k):
        calls["verify"] += 1
        if calls["verify"] == 1:
            return VerificationReport(
                pass_=False,
                issues=["테스트 이슈"],
                fix_actions=["다듬기"],
                korean_style_notes=[],
            )
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
        lambda *_a, **_k: _bundle(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.synthesize",
        lambda *_a, **_k: _graph(),
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
        lambda *_a, **_k: ["다음"],
    ):
        from api.question_answer_pipeline.orchestrator import run_pipeline

        out = run_pipeline("테스트 질문", {"pipeline_verifier_rewrite": True})
        assert out.get("success") is True
        assert calls["write"] == 2, "첫 검수 실패 후 Writer 1회 재실행"
        assert calls["verify"] == 2
        vs = out.get("verification_summary") or {}
        assert vs.get("verifier_rewrite_attempted") is True
        assert vs.get("pass") is True


def test_verifier_rewrite_off_single_write_when_verify_fails():
    calls = {"write": 0}

    def write_draft_fn(*_a, **_k):
        calls["write"] += 1
        return "draft"

    with patch(
        "api.question_answer_pipeline.orchestrator.route",
        lambda *_a, **_k: _rd(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.wants_blueprint_first",
        lambda *_a, **_k: False,
    ), patch(
        "api.question_answer_pipeline.orchestrator.retrieve",
        lambda *_a, **_k: _bundle(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.synthesize",
        lambda *_a, **_k: _graph(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.write_draft",
        write_draft_fn,
    ), patch(
        "api.question_answer_pipeline.orchestrator.verify",
        lambda *_a, **_k: VerificationReport(
            pass_=False,
            issues=["항상 실패"],
            fix_actions=[],
            korean_style_notes=[],
        ),
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

        out = run_pipeline("테스트", {})
        assert calls["write"] == 1
        vs = out.get("verification_summary") or {}
        assert vs.get("verifier_rewrite_attempted") is not True


def test_expert_answer_mode_enables_verifier_rewrite_without_flag():
    """answer_mode=expert 이면 PIPELINE_VERIFIER_REWRITE 없이도 1회 재작성 시도."""
    calls = {"write": 0, "verify": 0}

    def write_draft_fn(*_a, **_k):
        calls["write"] += 1
        return f"draft_v{calls['write']}"

    def verify_fn(*_a, **_k):
        calls["verify"] += 1
        if calls["verify"] == 1:
            return VerificationReport(
                pass_=False,
                issues=["expert 품질 점검"],
                fix_actions=["다듬기"],
                korean_style_notes=[],
            )
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
        lambda *_a, **_k: _bundle(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.synthesize",
        lambda *_a, **_k: _graph(),
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

        out = run_pipeline("테스트", {"answer_mode": "expert"})
        assert out.get("success") is True
        assert calls["write"] == 2
        assert calls["verify"] == 2
        vs = out.get("verification_summary") or {}
        assert vs.get("verifier_rewrite_attempted") is True


def test_guided_answer_mode_enables_verifier_rewrite_without_flag():
    calls = {"write": 0, "verify": 0}

    def write_draft_fn(*_a, **_k):
        calls["write"] += 1
        return f"draft_v{calls['write']}"

    def verify_fn(*_a, **_k):
        calls["verify"] += 1
        if calls["verify"] == 1:
            return VerificationReport(
                pass_=False,
                issues=["guided 검수"],
                fix_actions=["다듬기"],
                korean_style_notes=[],
            )
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
        lambda *_a, **_k: _bundle(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.synthesize",
        lambda *_a, **_k: _graph(),
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

        out = run_pipeline("테스트", {"answer_mode": "guided"})
        assert out.get("success") is True
        assert calls["write"] == 2
        vs = out.get("verification_summary") or {}
        assert vs.get("verifier_rewrite_attempted") is True


@pytest.mark.parametrize(
    "ctx",
    [
        {"answer_mode": "expert", "pipeline_verifier_rewrite": False},
        {"answer_mode": "guided", "pipeline_verifier_rewrite": "false"},
    ],
)
def test_pipeline_verifier_rewrite_false_overrides_modes(ctx):
    """명시 False(또는 문자열 false)면 expert·guided보다 재작성 끔."""
    calls = {"write": 0}

    def write_draft_fn(*_a, **_k):
        calls["write"] += 1
        return "draft"

    with patch(
        "api.question_answer_pipeline.orchestrator.route",
        lambda *_a, **_k: _rd(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.wants_blueprint_first",
        lambda *_a, **_k: False,
    ), patch(
        "api.question_answer_pipeline.orchestrator.retrieve",
        lambda *_a, **_k: _bundle(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.synthesize",
        lambda *_a, **_k: _graph(),
    ), patch(
        "api.question_answer_pipeline.orchestrator.write_draft",
        write_draft_fn,
    ), patch(
        "api.question_answer_pipeline.orchestrator.verify",
        lambda *_a, **_k: VerificationReport(
            pass_=False,
            issues=["실패"],
            fix_actions=[],
            korean_style_notes=[],
        ),
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

        out = run_pipeline("테스트", ctx)
        assert calls["write"] == 1
        vs = out.get("verification_summary") or {}
        assert vs.get("verifier_rewrite_attempted") is not True
