"""creative_generation — 후속 질문 줄 휴리스틱 (연산자 우선순위 버그 회귀 방지)."""

from api.question_answer_pipeline.creative_generation import is_follow_up_question_line_candidate


def test_rejects_too_short():
    assert is_follow_up_question_line_candidate("네") is False
    assert is_follow_up_question_line_candidate("12345") is False


def test_question_mark_accepted():
    assert is_follow_up_question_line_candidate("비용은 얼마인가요?") is True


def test_korean_question_particle():
    assert is_follow_up_question_line_candidate("일정이 어떻게 될까") is True


def test_wh_words():
    assert is_follow_up_question_line_candidate("무엇을 우선해야 하나") is True
    assert is_follow_up_question_line_candidate("어떻게 진행하면 될지 알려줘") is True


def test_long_line_without_marker():
    assert (
        is_follow_up_question_line_candidate(
            "이 항목은 충분히 긴 설명 문장으로 후보로 포함될 수 있음"
        )
        is True
    )
