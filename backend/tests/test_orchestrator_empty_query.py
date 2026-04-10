"""빈 질문 시 오케스트레이터 메타 계약."""

from api.question_answer_pipeline import orchestrator as orch


def test_empty_query_includes_meta_and_next_actions():
    out = orch.run_pipeline("   ", {})
    assert out.get("success") is False
    assert out.get("error") == "empty_query"
    assert out.get("trace_id", "").startswith("trace_")
    vs = out.get("verification_summary")
    assert isinstance(vs, dict)
    assert vs.get("skipped") is True
    assert vs.get("reason") == "empty_query"
    tp = out.get("task_plan")
    assert isinstance(tp, dict)
    assert tp.get("pipeline_status") == "empty_query"
    na = out.get("next_actions")
    assert isinstance(na, list) and len(na) >= 1
    assert any("입력" in a or "질문" in a for a in na)
    rd = out.get("route_decision")
    assert isinstance(rd, dict)
    assert rd.get("task_type") == "generate"


def test_empty_query_task_plan_includes_ui_modes_when_present_in_context():
    out = orch.run_pipeline("   ", {"answer_mode": "guided", "response_style": "balanced"})
    tp = out.get("task_plan")
    assert isinstance(tp, dict)
    assert tp.get("answer_mode") == "guided"
    assert tp.get("response_style") == "balanced"
