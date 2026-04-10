from api.question_answer_pipeline.korean_style_checks import collect_korean_style_notes


def test_translationese_note():
    notes, strict = collect_korean_style_notes(
        "업무가 진행되어지는 중입니다.",
        {"korean_understanding": {"genre": "general"}},
    )
    assert any("진행되는" in n for n in notes)


def test_polite_mix_strict_for_legal():
    text = "검토합니다. 그리고 빨리 해줘요."
    notes, strict = collect_korean_style_notes(
        text,
        {"korean_understanding": {"genre": "legal_memo", "formality": "formal"}},
    )
    assert strict
