"""llm_service — _user_question_instruction 프롬프트 주입"""

from llm_service import LLMService


def test_enhance_with_knowledge_includes_user_question_instruction():
    svc = LLMService()
    ctx = {
        "_user_question_instruction": (
            "[사용자 질문 — 아래 문장에 직접 답하세요.]\n성수4지구 분위기 파악"
        ),
    }
    enhanced, _ = svc._enhance_with_knowledge("성수4지구 관련 분위기를 파악해줘", ctx)
    assert "성수4지구 분위기 파악" in enhanced
    assert "직접 답하세요" in enhanced
