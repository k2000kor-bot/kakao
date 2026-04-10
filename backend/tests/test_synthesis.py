"""synthesis — 중복 근거 문장 제거."""

from api.question_answer_pipeline.schemas import EvidenceBundle, EvidenceItem
from api.question_answer_pipeline.synthesis import synthesize


def test_dedupes_near_duplicate_evidence_chunks():
    head = "반복되는 노트북 청크 본문입니다. " * 5  # 앞 72자 이상 공통
    bundle = EvidenceBundle(
        items=[
            EvidenceItem(
                evidence_id="e1",
                type="rag_chunk",
                source_ref={},
                content=head + "버전A",
                score=0.9,
            ),
            EvidenceItem(
                evidence_id="e2",
                type="rag_chunk",
                source_ref={},
                content=head + "버전B",
                score=0.85,
            ),
            EvidenceItem(
                evidence_id="e3",
                type="rag_chunk",
                source_ref={},
                content="완전히 다른 근거 내용입니다.",
                score=0.8,
            ),
        ],
        coverage=0.9,
    )
    cg = synthesize(bundle)
    assert len(cg.claims) == 2
    supporting = {c.supporting[0] for c in cg.claims if c.supporting}
    assert "e1" in supporting
    assert "e2" not in supporting
    assert "e3" in supporting


def test_empty_evidence_yields_c0():
    bundle = EvidenceBundle(items=[], coverage=0.0)
    cg = synthesize(bundle)
    assert len(cg.claims) == 1
    assert cg.claims[0].claim_id == "c0"
