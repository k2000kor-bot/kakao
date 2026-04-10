"""한국어 프로필 ↔ Q→A 파이프라인 브리지 단위 테스트."""

from api.question_answer_pipeline.schemas import RouteDecision, RetrievalSpec, SubQuestion
from api.question_answer_pipeline.korean_pipeline_bridge import (
    adjust_route_decision_for_korean,
    adjust_retrieval_spec_for_genre,
)


def _base_route():
    return RouteDecision(
        task_type="generate",
        domain=["general"],
        grounding_required="none",
        sources=["internal_rag"],
        risk_level="low",
        answer_schema="narrative",
        stop_conditions=[],
    )


def test_adjust_route_fact_check_neutral():
    ctx = {
        "korean_understanding": {
            "speech_act": "fact_check_neutral",
            "genre": "general",
        }
    }
    d = adjust_route_decision_for_korean(_base_route(), ctx)
    assert d.task_type == "fact_check"
    assert d.grounding_required == "preferred"


def test_adjust_route_legal_genre_grounds():
    ctx = {
        "korean_understanding": {
            "speech_act": "request",
            "genre": "legal_memo",
        }
    }
    d = adjust_route_decision_for_korean(_base_route(), ctx)
    assert d.grounding_required == "preferred"


def test_adjust_retrieval_kakao_reduces_top_k():
    ctx = {"korean_understanding": {"genre": "kakao_message"}}
    spec = RetrievalSpec(
        subquestions=[
            SubQuestion(
                id="sq1",
                question="test",
                source_plan=[{"type": "internal_rag", "query": "test", "top_k": 8}],
            )
        ]
    )
    new_spec = adjust_retrieval_spec_for_genre(spec, ctx)
    assert new_spec.subquestions[0].source_plan[0]["top_k"] == 4


def test_adjust_retrieval_legal_increases_top_k():
    ctx = {"korean_understanding": {"genre": "legal_memo"}}
    spec = RetrievalSpec(
        subquestions=[
            SubQuestion(
                id="sq1",
                question="test",
                source_plan=[{"type": "internal_rag", "query": "test", "top_k": 8}],
            )
        ]
    )
    new_spec = adjust_retrieval_spec_for_genre(spec, ctx)
    assert new_spec.subquestions[0].source_plan[0]["top_k"] == 10


def test_no_profile_noop():
    d = adjust_route_decision_for_korean(_base_route(), {})
    assert d.task_type == "generate"
    assert d.grounding_required == "none"
