"""conversation_graph_chat_hint — 관계도 context → LLM 지시문"""

from api.conversation_graph_chat_hint import attach_conversation_graph_instruction


def test_skips_without_graph_flag() -> None:
    ctx: dict = {"message": "hello"}
    attach_conversation_graph_instruction(ctx)
    assert "_conversation_graph_instruction" not in ctx


def test_builds_instruction_from_snapshot() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "input_intent_hint": "conversation_graph_create",
        "conversation_graph_snapshot": "참여자: 알파(3), 베타(2)",
        "answer_quality_instruction": "Mermaid 포함",
    }
    attach_conversation_graph_instruction(ctx)
    text = ctx.get("_conversation_graph_instruction", "")
    assert "대화 관계도" in text
    assert "알파" in text
    assert "Mermaid" in text
    assert "더 구체적으로" in text or "금지" in text


def test_does_not_overwrite_existing() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "_conversation_graph_instruction": "custom",
    }
    attach_conversation_graph_instruction(ctx)
    assert ctx["_conversation_graph_instruction"] == "custom"
