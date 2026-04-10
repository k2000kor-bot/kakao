from api.question_answer_pipeline.korean_quality_scorer import score_korean_output


def test_score_nonempty():
    s = score_korean_output("안녕하세요. 검토합니다.", {"korean_understanding": {"genre": "general"}})
    assert "overall_heuristic" in s
    assert 0 <= s["overall_heuristic"] <= 1


def test_score_kakao_long_penalty():
    # kakao_message: len > 2000 이면 장르 적합도 하향
    long_chat = "문장\n" * 700
    assert len(long_chat) > 2000
    s = score_korean_output(long_chat, {"korean_understanding": {"genre": "kakao_message"}})
    assert s["genre_fit_heuristic"] < 0.7
