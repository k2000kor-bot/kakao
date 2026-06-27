"""conversation_graph_chat_hint — 관계도 context → LLM 지시문"""

from api.conversation_graph_chat_hint import (
    attach_conversation_graph_instruction,
    build_structured_graph_answer_fallback,
    is_generic_chat_fallback,
    is_sparse_graph_llm_answer,
    should_use_graph_fallback_for_llm,
)


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


def test_includes_revision_issues() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "conversation_graph_revision_issues": ["Mermaid 누락", "참여자 표 없음"],
    }
    attach_conversation_graph_instruction(ctx)
    text = ctx.get("_conversation_graph_instruction", "")
    assert "자동 검증" in text
    assert "Mermaid 누락" in text


def test_does_not_overwrite_existing() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "_conversation_graph_instruction": "custom",
    }
    attach_conversation_graph_instruction(ctx)
    assert ctx["_conversation_graph_instruction"] == "custom"


def test_is_generic_chat_fallback() -> None:
    assert is_generic_chat_fallback("좋은 질문이네요! 더 정확한 답변을 위해")
    assert not is_generic_chat_fallback("## 참여자 표\n\n| A |")


def test_outline_phase_omits_structured_block() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "conversation_graph_two_pass_phase": "outline",
        "conversation_graph_omit_structured_in_instruction": True,
        "conversation_graph_structured_sections": "## 참여자 표",
    }
    attach_conversation_graph_instruction(ctx)
    text = ctx.get("_conversation_graph_instruction", "")
    assert "1차 개요" in text
    assert "## 참여자 표" not in text


def test_includes_answer_outline_in_report_phase() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "conversation_graph_answer_outline": "## 해석\n\n개요",
        "conversation_graph_structured_sections": "## 참여자 표",
    }
    attach_conversation_graph_instruction(ctx)
    text = ctx.get("_conversation_graph_instruction", "")
    assert "1차 개요" in text
    assert "개요" in text
    assert "## 참여자 표" in text


def test_includes_structured_sections_block() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "conversation_graph_structured_sections": (
            "## 참여자 표\n| A | 동조 | 1 |\n```mermaid\nflowchart TB\n```"
        ),
    }
    attach_conversation_graph_instruction(ctx)
    text = ctx.get("_conversation_graph_instruction", "")
    assert "구조화 데이터 블록" in text
    assert "수정·삭제 금지" in text
    assert "## 참여자 표" in text
    assert "flowchart" in text


def test_includes_answer_history() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "conversation_graph_answer_history": "[이전 질문 1]\nQ\n\n[이전 답변 1]\nA",
    }
    attach_conversation_graph_instruction(ctx)
    text = ctx.get("_conversation_graph_instruction", "")
    assert "이전 질문·답변" in text
    assert "[이전 질문 1]" in text


def test_build_structured_graph_answer_fallback_from_snapshot() -> None:
    ctx = {
        "conversation_graph_analysis": True,
        "conversation_graph_snapshot": (
            "참여자: 알파(동조, 1발화), 베타(반대, 1발화)\n연결: 알파→베타 동조"
        ),
    }
    text = build_structured_graph_answer_fallback(ctx)
    assert text
    assert "알파" in text
    assert "베타" in text
    assert "mermaid" in text.lower()
    assert "flowchart" in text.lower()
    assert "해석" in text
    assert "실행 제안" in text


def test_is_sparse_graph_llm_answer() -> None:
    assert is_sparse_graph_llm_answer("짧은 답변")
    assert is_sparse_graph_llm_answer("- 불릿1\n- 불릿2\n- 불릿3\n- 불릿4")
    rich = "\n".join(
        [
            "## 한 줄 요약",
            "알파와 베타의 관계를 정리했습니다.",
            "## 해석",
            "동조 축이 강합니다. " * 20,
            "## 실행 제안",
            "1. 중재자 역할을 명확히 합니다. " * 10,
        ]
    )
    assert not is_sparse_graph_llm_answer(rich)


def test_should_use_graph_fallback_respects_structured_sections() -> None:
    sparse = "## 요약\n\n짧음."
    ctx = {"conversation_graph_structured_sections": "## 참여자 표"}
    assert not should_use_graph_fallback_for_llm(sparse, ctx)
    assert should_use_graph_fallback_for_llm(sparse, {})
