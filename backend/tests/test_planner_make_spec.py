"""planner.make_spec — 보조 서브질문 분기."""

from api.question_answer_pipeline.planner import make_spec, build_task_plan_snapshot
from api.question_answer_pipeline.schemas import RouteDecision


def _rd(task="generate", **kwargs):
    base = dict(
        task_type=task,
        domain=["general"],
        grounding_required="none",
        sources=["internal_rag"],
        risk_level="low",
        answer_schema="narrative",
        stop_conditions=[],
    )
    base.update(kwargs)
    return RouteDecision(**base)


def test_single_subquestion_short_query_generate():
    spec = make_spec(_rd(), {}, "짧음")
    assert len(spec.subquestions) == 1
    assert spec.subquestions[0].id == "sq1"


def test_second_subquestion_for_expert_mode():
    spec = make_spec(_rd(), {"answer_mode": "expert"}, "짧은질문")
    assert len(spec.subquestions) == 2
    assert spec.subquestions[1].id == "sq2"
    assert "보완" in spec.subquestions[1].question


def test_second_subquestion_for_long_query():
    q = "x" * 420
    spec = make_spec(_rd(), {}, q)
    assert len(spec.subquestions) == 2


def test_second_subquestion_for_compare_task():
    spec = make_spec(_rd(task_type="compare"), {}, "a vs b")
    assert len(spec.subquestions) == 2


def test_task_plan_snapshot_includes_context_ui_modes():
    rd = _rd()
    inner = make_spec(rd, {}, "hello")
    snap = build_task_plan_snapshot(
        rd,
        inner,
        "hello",
        {"answer_mode": "expert", "response_style": "detailed"},
    )
    assert snap.get("answer_mode") == "expert"
    assert snap.get("response_style") == "detailed"


def test_minimal_task_plan_includes_context_ui_modes():
    from api.question_answer_pipeline.planner import build_minimal_task_plan

    rd = _rd()
    tp = build_minimal_task_plan(
        rd, "q", "stopped", {"answer_mode": "guided", "response_style": "balanced"}
    )
    assert tp.get("answer_mode") == "guided"
    assert tp.get("response_style") == "balanced"
