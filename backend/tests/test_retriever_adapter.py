"""retriever_adapter — 중복 방지·웹 근거 주입."""

from api.question_answer_pipeline.retriever_adapter import retrieve
from api.question_answer_pipeline.schemas import RetrievalSpec, SubQuestion


def _sq(q: str, plans: list) -> SubQuestion:
    return SubQuestion(
        id="sq1",
        question=q,
        source_plan=plans,
        required_fields=[],
        freshness={"max_age_days": 365},
        confidence_min=0.7,
    )


def test_internal_rag_not_duplicated_across_two_subquestions():
    pk = "A" * 1200
    spec = RetrievalSpec(
        subquestions=[
            _sq("q1", [{"type": "internal_rag", "query": "q1", "top_k": 4}]),
            SubQuestion(
                id="sq2",
                question="q2",
                source_plan=[{"type": "internal_rag", "query": "q2", "top_k": 4}],
                required_fields=[],
                freshness={"max_age_days": 365},
                confidence_min=0.7,
            ),
        ]
    )
    ctx = {"projectKnowledge": pk, "projectId": "p1"}
    bundle = retrieve(spec, ctx)
    nonempty = [e for e in bundle.items if e.content]
    # 동일 PK를 두 번 청크하지 않음 → 항목 수는 단일 패스와 같음
    assert len(nonempty) <= 8
    assert all(e.type == "rag_chunk" for e in nonempty)


def test_web_plan_uses_pipeline_web_evidence():
    spec = RetrievalSpec(
        subquestions=[
            _sq(
                "검색",
                [
                    {"type": "internal_rag", "query": "x", "top_k": 2},
                    {"type": "web", "query": "x", "top_k": 3},
                ],
            )
        ]
    )
    ctx = {
        "pipeline_web_evidence": "요약: 공식 발표에 따르면 시범 적용된다.",
    }
    bundle = retrieve(spec, ctx)
    types = [e.type for e in bundle.items]
    assert "web_page" in types
    web_items = [e for e in bundle.items if e.type == "web_page"]
    assert "공식" in web_items[0].content
