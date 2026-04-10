"""라우터: context answer_mode / response_style → grounding 보강."""

from api.question_answer_pipeline.router import route


def test_expert_mode_bumps_grounding_from_none():
    rd = route("짧은 질문", {"answer_mode": "expert"})
    assert rd.grounding_required == "preferred"


def test_guided_mode_bumps_grounding():
    rd = route("x", {"answer_mode": "guided"})
    assert rd.grounding_required == "preferred"


def test_response_style_detailed_bumps_grounding():
    rd = route("hi", {"response_style": "detailed"})
    assert rd.grounding_required == "preferred"


def test_response_style_comprehensive_bumps_grounding():
    rd = route("hi", {"response_style": "comprehensive"})
    assert rd.grounding_required == "preferred"


def test_preserves_required_when_query_has_grounding_keywords():
    rd = route("법령 근거를 알려줘", {"answer_mode": "fast"})
    assert rd.grounding_required == "required"


def test_fast_answer_mode_does_not_downgrade_required():
    rd = route("최신 수치 확인", {"answer_mode": "fast"})
    assert rd.grounding_required == "required"
