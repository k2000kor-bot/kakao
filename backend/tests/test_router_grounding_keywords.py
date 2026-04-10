"""라우터 — 근거 필수 키워드(한·영)."""

from api.question_answer_pipeline.router import route


def test_korean_verification_keyword_requires_grounding():
    rd = route("이 수치를 검증해 줘", {})
    assert rd.grounding_required == "required"


def test_korean_fact_keyword_requires_grounding():
    rd = route("팩트체크 부탁", {})
    assert rd.grounding_required == "required"


def test_english_fact_check_requires_grounding():
    rd = route("Please fact check this statement", {})
    assert rd.grounding_required == "required"


def test_english_verify_this_requires_grounding():
    rd = route("Can you verify this claim?", {})
    assert rd.grounding_required == "required"


def test_korean_official_source_keyword_requires_grounding():
    rd = route("공식 자료 기준으로 근거를 달아 줘", {})
    assert rd.grounding_required == "required"


def test_english_show_sources_requires_grounding():
    rd = route("Please show sources for this", {})
    assert rd.grounding_required == "required"
