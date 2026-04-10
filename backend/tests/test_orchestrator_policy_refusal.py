"""오케스트레이터 조기 반환(정책 거절) 시 메타 계약 스모크 테스트."""

from api.question_answer_pipeline.orchestrator import run_pipeline


def test_policy_refusal_includes_verification_summary_and_task_plan():
    # router: RISK_KEYWORDS high → stop_conditions "refuse"
    out = run_pipeline("의료 진단에 대해 처방을 알려줘", {})
    assert out.get("success") is True
    assert "정책" in (out.get("response") or "") or "상세 답변" in (out.get("response") or "")
    vs = out.get("verification_summary")
    assert isinstance(vs, dict)
    assert vs.get("skipped") is True
    assert vs.get("reason") == "policy_refusal"
    tp = out.get("task_plan")
    assert isinstance(tp, dict)
    assert tp.get("pipeline_status") == "refused_policy"


def test_policy_refusal_task_plan_includes_ui_modes_from_context():
    out = run_pipeline(
        "의료 진단에 대해 처방을 알려줘",
        {"answer_mode": "expert", "response_style": "comprehensive"},
    )
    tp = out.get("task_plan")
    assert isinstance(tp, dict)
    assert tp.get("answer_mode") == "expert"
    assert tp.get("response_style") == "comprehensive"
