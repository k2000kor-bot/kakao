"""블루프린트·next_actions 휴리스틱 단위 테스트."""

from api.question_answer_pipeline.answer_blueprint import (
    BLUEPRINT_TRIGGER_MIN_LEN,
    build_answer_blueprint_markdown,
    wants_blueprint_first,
)
from api.question_answer_pipeline.next_actions_hint import suggest_next_actions
from api.question_answer_pipeline.schemas import RouteDecision


def _rd(task="generate", schema="narrative"):
    return RouteDecision(
        task_type=task,
        domain=["general"],
        grounding_required="none",
        sources=["internal_rag"],
        risk_level="low",
        answer_schema=schema,
        stop_conditions=[],
    )


def test_wants_blueprint_expert():
    assert wants_blueprint_first({"answer_mode": "expert"}, "짧음") is True


def test_wants_blueprint_long_query():
    q = "가" * BLUEPRINT_TRIGGER_MIN_LEN
    assert wants_blueprint_first({}, q) is True


def test_wants_blueprint_response_style():
    assert wants_blueprint_first({"response_style": "comprehensive"}, "x") is True


def test_build_blueprint_contains_task():
    md = build_answer_blueprint_markdown(_rd("fact_check", "narrative"), "질문", {})
    assert "fact_check" in md
    assert "블루프린트" in md


def test_suggest_next_actions_empty_query():
    na = suggest_next_actions(_rd("generate"), "")
    assert len(na) >= 1
    assert all("질문" in a or "입력" in a or "프로젝트" in a for a in na)


def test_suggest_next_actions_fact_check():
    na = suggest_next_actions(_rd("fact_check"), "이게 맞나요?")
    assert any("반대" in a or "출처" in a for a in na)


def test_suggest_next_actions_kakao_genre():
    na = suggest_next_actions(
        _rd("generate"),
        "안녕",
        korean_genre="kakao_message",
    )
    assert any("톤" in a for a in na)


def test_suggest_next_actions_dev_domain():
    na = suggest_next_actions(
        RouteDecision(
            task_type="generate",
            domain=["dev"],
            grounding_required="none",
            sources=["internal_rag"],
            risk_level="low",
            answer_schema="narrative",
            stop_conditions=[],
        ),
        "API 설계",
    )
    assert any("코드" in a or "엔드포인트" in a for a in na)
