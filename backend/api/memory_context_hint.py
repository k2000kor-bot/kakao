"""
프론트 advanced_memory_context → LLM·파이프라인용 짧은 지시문.
unified_chat_api, question_answer_pipeline(orchestrator)에서 공통 사용.
"""

from typing import Any, Dict, Optional


def attach_advanced_memory_instruction(ctx: Optional[Dict[str, Any]]) -> None:
    """
    ctx에 advanced_memory_context(dict)가 있으면 _advanced_memory_instruction 문자열을 채움.
    이미 _advanced_memory_instruction이 있으면 덮어쓰지 않음(상위에서 조합한 경우 보존).
    """
    if not ctx or not isinstance(ctx, dict):
        return
    if ctx.get("_advanced_memory_instruction"):
        return
    raw = ctx.get("advanced_memory_context")
    if not isinstance(raw, dict):
        return
    lines = ["[세션 메모리 힌트 — 참고만 하고, 답변에 메타 설명·불필요한 반복 인용은 피하세요]"]
    tc = raw.get("turn_count")
    if tc is not None:
        lines.append(f"- 로컬 추정 턴 수: {tc}")
    lt = raw.get("last_turn")
    if isinstance(lt, dict):
        if lt.get("current_topic"):
            lines.append(f"- 최근 주제 태그: {lt['current_topic']}")
        uel = lt.get("user_engagement_level")
        if uel:
            lines.append(f"- 참여도(휴리스틱): {uel}")
        cd = lt.get("conversation_depth")
        if cd is not None:
            lines.append(f"- 대화 깊이(휴리스틱): {cd}")
    prof = raw.get("user_profile_hint")
    if isinstance(prof, dict):
        if prof.get("response_length_preference"):
            lines.append(f"- 선호 답변 길이: {prof['response_length_preference']}")
        if prof.get("expertise_level"):
            lines.append(f"- 추정 전문 수준: {prof['expertise_level']}")
        if prof.get("communication_preference"):
            lines.append(f"- 커뮤니케이션 선호: {prof['communication_preference']}")
    lang = raw.get("language")
    if lang:
        lines.append(f"- 선호 언어: {lang}")
    topics = raw.get("preferred_topics")
    if isinstance(topics, list) and topics:
        lines.append("- 자주 다룬 주제: " + ", ".join(str(t) for t in topics[:6]))
    ctx["_advanced_memory_instruction"] = "\n".join(lines)[:1000]
