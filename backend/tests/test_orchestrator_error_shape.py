"""오케스트레이터 예외 시 반환 계약."""

from api.question_answer_pipeline import orchestrator as orch


def test_pipeline_error_includes_verification_and_task_plan(monkeypatch):
    def boom(*_a, **_k):
        raise RuntimeError("simulated router failure")

    monkeypatch.setattr(orch, "route", boom)
    out = orch.run_pipeline("테스트 질문", {})
    assert out.get("success") is False
    assert out.get("trace_id", "").startswith("trace_")
    vs = out.get("verification_summary")
    assert isinstance(vs, dict)
    assert vs.get("skipped") is True
    assert vs.get("reason") == "pipeline_error"
    tp = out.get("task_plan")
    assert isinstance(tp, dict)
    assert tp.get("pipeline_status") == "error"
    assert "테스트" in (tp.get("user_goal_preview") or "")


def test_pipeline_error_task_plan_echoes_context_ui_modes(monkeypatch):
    def boom(*_a, **_k):
        raise RuntimeError("simulated router failure")

    monkeypatch.setattr(orch, "route", boom)
    out = orch.run_pipeline(
        "질문",
        {"answer_mode": "expert", "response_style": "comprehensive"},
    )
    tp = out.get("task_plan")
    assert isinstance(tp, dict)
    assert tp.get("answer_mode") == "expert"
    assert tp.get("response_style") == "comprehensive"
