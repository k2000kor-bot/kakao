"""api.response_enhancer — unified_chat_api 선택 향상 훅."""
import pytest

from api.response_enhancer import ResponseEnhancer, response_enhancer


@pytest.mark.unit
def test_validate_and_fix_response_strips_and_rejects_non_str():
    r = ResponseEnhancer()
    assert r.validate_and_fix_response("  hello  ", "general") == "hello"
    assert r.validate_and_fix_response(None, None) == ""
    assert r.validate_and_fix_response(123, None) == ""  # type: ignore[arg-type]


@pytest.mark.unit
def test_enhance_response_pass_through_and_kwargs():
    r = ResponseEnhancer()
    body = "  answer  "
    out = r.enhance_response(
        body,
        "general",
        "enhanced",
        user_message="질문",
    )
    assert out == "answer"


@pytest.mark.unit
def test_module_singleton_is_response_enhancer_instance():
    assert isinstance(response_enhancer, ResponseEnhancer)
