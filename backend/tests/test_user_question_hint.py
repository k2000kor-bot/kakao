from api.user_question_hint import attach_user_question_instruction


def test_attach_user_question_instruction_from_primary():
    ctx = {"user_question_primary": "  파이썬이란?  "}
    attach_user_question_instruction(ctx)
    assert "_user_question_instruction" in ctx
    assert "파이썬이란?" in ctx["_user_question_instruction"]


def test_attach_user_question_instruction_from_original():
    ctx = {"original_user_message": "날씨 알려줘"}
    attach_user_question_instruction(ctx)
    assert "날씨 알려줘" in ctx["_user_question_instruction"]


def test_attach_user_question_instruction_skips_empty():
    ctx = {"user_question_primary": "   "}
    attach_user_question_instruction(ctx)
    assert "_user_question_instruction" not in ctx
