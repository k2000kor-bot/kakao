"""conversation_thread — 다턴 대화를 파이프라인 evidence에 반영."""

from api.question_answer_pipeline.conversation_thread import (
    augment_short_followup_query_for_router,
    build_writer_transcript_coherence_block,
    merge_prior_conversation_turns_into_evidence,
    should_inject_conversation_thread,
)
from api.question_answer_pipeline.planner import task_plan_user_goal_preview
from api.question_answer_pipeline.schemas import EvidenceBundle, EvidenceItem


def _empty_bundle():
    return EvidenceBundle(items=[], coverage=0.0, confidence=0.0)


def test_should_inject_for_agentic_genspark():
    assert should_inject_conversation_thread({"agentic_genspark_style": True}) is True


def test_should_inject_for_reference_agent_id():
    assert (
        should_inject_conversation_thread(
            {"genspark_reference_agent_id": "07875e45-d0b1-41b2-b639-a10904faa6ac"}
        )
        is True
    )


def test_merge_adds_conversation_evidence():
    ctx = {
        "agentic_genspark_style": True,
        "conversation_history": [
            {"role": "user", "content": "A 주제로 개요 짜줘"},
            {"role": "assistant", "content": "한 줄 결론: … 핵심은 X입니다."},
        ],
    }
    b = merge_prior_conversation_turns_into_evidence(_empty_bundle(), ctx, "그다음 Y도 추가해줘")
    assert len(b.items) >= 2
    types = {e.type for e in b.items}
    assert "conversation_turn" in types
    assert any("assistant" in (e.content or "") for e in b.items)


def test_augment_short_followup_prefixes_context():
    ctx = {
        "agentic_genspark_style": True,
        "conversation_history": [
            {"role": "user", "content": "프로젝트 A 개요"},
            {"role": "assistant", "content": "A는 … 요약입니다."},
        ],
    }
    out = augment_short_followup_query_for_router("리스크만", ctx)
    assert out != "리스크만"
    assert "이전 대화" in out
    assert "리스크만" in out


def test_augment_prefixes_long_current_message():
    ctx = {
        "agentic_genspark_style": True,
        "conversation_history": [
            {"role": "user", "content": "u"},
            {"role": "assistant", "content": "a"},
        ],
    }
    long_q = "x" * 200
    out = augment_short_followup_query_for_router(long_q, ctx)
    assert out != long_q
    assert "이전 대화" in out
    assert long_q in out


def test_task_plan_preview_uses_plain_query():
    cp = {"_pipeline_user_query_plain": "짧은 질문"}
    long_q = "[이전 대화 맥락]\n" + "z" * 500 + "\n\n[현재 사용자 메시지]\n짧은 질문"
    assert task_plan_user_goal_preview(long_q, cp) == "짧은 질문"


def test_writer_block_non_empty_when_multiturn():
    ctx = {
        "agentic_genspark_style": True,
        "conversation_history": [
            {"role": "user", "content": "첫 질문"},
            {"role": "assistant", "content": "첫 답변 본문"},
        ],
    }
    block = build_writer_transcript_coherence_block(ctx, "후속 질문")
    assert "다턴" in block
    assert "첫 답변" in block
