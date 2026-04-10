"""pipeline_gate — fast/basic 시 Q→A 파이프라인 생략 판정."""

from api.question_answer_pipeline.pipeline_gate import should_skip_qa_pipeline_for_speed


def test_skip_on_basic_quality():
    assert should_skip_qa_pipeline_for_speed(quality="basic", context={}) is True


def test_no_skip_basic_when_agentic_genspark_style():
    assert (
        should_skip_qa_pipeline_for_speed(
            quality="basic",
            context={"agentic_genspark_style": True},
        )
        is False
    )


def test_skip_basic_genspark_when_fast_path():
    assert (
        should_skip_qa_pipeline_for_speed(
            quality="basic",
            context={
                "agentic_genspark_style": True,
                "qa_pipeline_fast_path": True,
            },
        )
        is True
    )


def test_skip_on_fast_path_flag():
    assert (
        should_skip_qa_pipeline_for_speed(
            quality="ultimate", context={"qa_pipeline_fast_path": True}
        )
        is True
    )


def test_skip_on_answer_mode_fast():
    assert (
        should_skip_qa_pipeline_for_speed(
            quality="enhanced", context={"answer_mode": "fast"}
        )
        is True
    )


def test_force_overrides_skip():
    assert (
        should_skip_qa_pipeline_for_speed(
            quality="basic",
            context={"qa_pipeline_force": True},
        )
        is False
    )


def test_no_skip_default():
    assert should_skip_qa_pipeline_for_speed(quality="enhanced", context={}) is False
