"""composer_oversight_hint — 중간 관리형 답변 지시"""

from api.composer_oversight_hint import attach_composer_oversight_instruction


def test_skips_without_flag() -> None:
    ctx: dict = {"message": "hello"}
    attach_composer_oversight_instruction(ctx)
    assert "_composer_oversight_instruction" not in ctx


def test_skips_graph_answer() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "composer_oversight_enabled": True,
        "composer_oversight_plan_markdown": "plan",
    }
    attach_composer_oversight_instruction(ctx)
    assert "_composer_oversight_instruction" not in ctx


def test_builds_instruction_from_plan() -> None:
    ctx = {
        "composer_oversight_enabled": True,
        "composer_oversight_plan_markdown": "기획→판단→검증",
        "composer_oversight_work_items": [
            {"index": 1, "kind": "question", "summary": "요약 질문"},
        ],
        "composer_oversight_has_multiple": True,
    }
    attach_composer_oversight_instruction(ctx)
    text = ctx.get("_composer_oversight_instruction", "")
    assert "기획" in text
    assert "요약 질문" in text
    assert "다중" in text
