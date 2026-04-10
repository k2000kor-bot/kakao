"""Verifier 휴리스틱 단위 테스트 (근거·단정 표현)."""

from api.question_answer_pipeline.schemas import Claim, ClaimGraph, EvidenceBundle, EvidenceItem
from api.question_answer_pipeline.verifier import verify


def _bundle(coverage: float, content: str = "내부 문서 요약: 가격은 변동될 수 있음") -> EvidenceBundle:
    return EvidenceBundle(
        items=[
            EvidenceItem(
                evidence_id="e1",
                type="rag_chunk",
                source_ref={"doc": "t"},
                content=content,
            )
        ],
        coverage=coverage,
    )


def test_pass_when_claim_text_in_draft():
    cg = ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement="프로젝트 마감은 4월입니다",
                supporting=["e1"],
            )
        ]
    )
    draft = "프로젝트 마감은 4월입니다. 추가 확인 부탁드립니다."
    rep = verify(draft, cg, _bundle(0.8), "preferred", context_pack=None)
    assert rep.pass_ is True
    assert len(rep.issues) == 0


def test_fail_when_claim_missing_from_draft():
    cg = ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement="원가는 120억으로 추정됩니다",
                supporting=["e1"],
            )
        ]
    )
    draft = "전혀 다른 내용만 서술합니다."
    rep = verify(draft, cg, _bundle(0.9), "preferred", context_pack=None)
    assert rep.pass_ is False
    assert any("반영되지 않음" in i for i in rep.issues)


def test_english_absolute_phrase_flagged_when_grounding_required_and_low_coverage():
    cg = ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement="Q3 results improved",
                supporting=["e1"],
            )
        ]
    )
    draft = "Q3 results improved. This trend will definitely continue next quarter."
    rep = verify(draft, cg, _bundle(0.25), "required", context_pack=None)
    assert rep.pass_ is False
    assert any("English" in i or "absolute" in i.lower() for i in rep.issues)


def test_korean_absolute_phrase_flagged_when_grounding_required_and_low_coverage():
    cg = ClaimGraph(
        claims=[
            Claim(
                claim_id="c1",
                statement="이번 분기 실적은 개선되었습니다",
                supporting=["e1"],
            )
        ]
    )
    draft = "이번 분기 실적은 개선되었습니다. 반드시 다음 분기에도 동일합니다."
    rep = verify(draft, cg, _bundle(0.25), "required", context_pack=None)
    assert rep.pass_ is False
    assert any("단정적" in i for i in rep.issues)
