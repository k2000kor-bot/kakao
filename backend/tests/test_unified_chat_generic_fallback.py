"""unified_chat_api — 일반 템플릿 폴백 시 LLM 경로 유지"""

from api.conversation_graph_chat_hint import is_generic_chat_fallback, is_low_quality_chat_response
from api.unified_chat_api import _context_has_user_question


def test_context_has_user_question_from_primary():
    assert _context_has_user_question({"user_question_primary": "  안녕?  "})
    assert _context_has_user_question({"original_user_message": "질문"})
    assert not _context_has_user_question({})
    assert not _context_has_user_question({"user_question_primary": "   "})


def test_low_quality_detects_general_template():
    tpl = "# General\n\n> general은(는) 소프트웨어 개발에서 중요한 개념입니다."
    assert is_low_quality_chat_response(tpl)
    assert not is_low_quality_chat_response("성수4지구는 서울 성동구 재개발 구역으로…")

