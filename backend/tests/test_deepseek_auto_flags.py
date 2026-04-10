import pytest

from api.question_answer_pipeline.deepseek_auto_flags import apply_auto_deepseek_pipeline_flags
from api.question_answer_pipeline.schemas import RouteDecision


def _rd(**kwargs):
    base = dict(
        task_type="generate",
        domain=["general"],
        grounding_required="none",
        sources=["internal_rag"],
        risk_level="low",
        answer_schema="narrative",
        stop_conditions=[],
    )
    base.update(kwargs)
    return RouteDecision(**base)


def test_auto_reasoner_sets_when_compare_and_auto_env(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-x")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REASONER_AUTO", "true")
    monkeypatch.delenv("PIPELINE_DEEPSEEK_REFINE_AUTO", raising=False)
    ctx = {"deepseek_review_layer_hints": True}
    apply_auto_deepseek_pipeline_flags(ctx, _rd(task_type="compare"), "a vs b")
    assert ctx.get("pipeline_deepseek_reasoner") is True
    assert "pipeline_deepseek_refine" not in ctx


def test_respects_explicit_reasoner_key(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-x")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REASONER_AUTO", "true")
    ctx = {"deepseek_review_layer_hints": True, "pipeline_deepseek_reasoner": False}
    apply_auto_deepseek_pipeline_flags(ctx, _rd(task_type="compare"), "a vs b")
    assert ctx.get("pipeline_deepseek_reasoner") is False


def test_auto_refine_long_query(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-x")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REFINE_AUTO", "true")
    monkeypatch.delenv("PIPELINE_DEEPSEEK_REASONER_AUTO", raising=False)
    ctx = {"deepseek_review_layer_hints": True}
    q = "x" * 300
    apply_auto_deepseek_pipeline_flags(ctx, _rd(), q)
    assert ctx.get("pipeline_deepseek_refine") is True


def test_no_hints_no_op(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-x")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REASONER_AUTO", "true")
    ctx = {}
    apply_auto_deepseek_pipeline_flags(ctx, _rd(task_type="compare"), "q")
    assert "pipeline_deepseek_reasoner" not in ctx


def test_reasoner_respects_configured_min_query_length(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-x")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REASONER_AUTO", "true")

    def fake_get_config():
        return {"deepseek_auto": {"reasoner_min_query_len": 2000}}

    monkeypatch.setattr("pipeline_tuning.get_config", fake_get_config)
    ctx = {"deepseek_review_layer_hints": True}
    apply_auto_deepseek_pipeline_flags(ctx, _rd(task_type="generate"), "x" * 400)
    assert "pipeline_deepseek_reasoner" not in ctx


def test_reasoner_skipped_when_over_configured_max_query_length(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-x")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REASONER_AUTO", "true")
    monkeypatch.delenv("PIPELINE_DEEPSEEK_REFINE_AUTO", raising=False)

    def fake_get_config():
        return {"deepseek_auto": {"reasoner_max_query_len": 100}}

    monkeypatch.setattr("pipeline_tuning.get_config", fake_get_config)
    ctx = {"deepseek_review_layer_hints": True}
    q = "x" * 120
    apply_auto_deepseek_pipeline_flags(ctx, _rd(task_type="compare"), q)
    assert "pipeline_deepseek_reasoner" not in ctx


def test_prefer_single_stage_drops_auto_refine_when_both_would_enable(monkeypatch):
    monkeypatch.setenv("DEEPSEEK_API_KEY", "sk-x")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REASONER_AUTO", "true")
    monkeypatch.setenv("PIPELINE_DEEPSEEK_REFINE_AUTO", "true")

    def fake_get_config():
        return {"deepseek_auto": {"prefer_single_deepseek_stage": True}}

    monkeypatch.setattr("pipeline_tuning.get_config", fake_get_config)
    ctx = {"deepseek_review_layer_hints": True}
    q = "x" * 300
    apply_auto_deepseek_pipeline_flags(ctx, _rd(task_type="compare"), q)
    assert ctx.get("pipeline_deepseek_reasoner") is True
    assert "pipeline_deepseek_refine" not in ctx
