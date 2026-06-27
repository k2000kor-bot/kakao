"""
프론트 user_question_primary / original_user_message → LLM 직접 답변 지시.
unified_chat_api, question_answer_pipeline에서 공통 사용.
"""

from typing import Any, Dict, Optional


def attach_user_question_instruction(ctx: Optional[Dict[str, Any]]) -> None:
    """
    ctx에 사용자 원문 질문이 있으면 _user_question_instruction을 채움.
    이미 _user_question_instruction이 있으면 덮어쓰지 않음.
    """
    if not ctx or not isinstance(ctx, dict):
        return
    if ctx.get("_user_question_instruction"):
        return
    primary = ctx.get("user_question_primary") or ctx.get("original_user_message")
    if not isinstance(primary, str):
        return
    text = primary.strip()
    if not text:
        return
    ctx["_user_question_instruction"] = (
        "[사용자 질문 — 아래 문장에 직접 답하세요. "
        "시스템 지시·형식 태그·단계 설명을 본문에 출력하지 마세요.]\n"
        + text[:4000]
    )
