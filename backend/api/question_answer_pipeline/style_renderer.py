# Style Renderer: 내용(사실)은 그대로 두고 문장만 스타일 적용 (STYLE_SYSTEM_ARCHITECTURE.md)
# facts → logic → argument 순서 확정 후, 마지막에만 스타일 적용. 사실 변경 금지.

import json
import logging
from typing import Any, Dict, Optional

from .style_schemas import StyleProfile

logger = logging.getLogger(__name__)


def _build_style_instruction(profile: StyleProfile) -> str:
    """StyleProfile → LLM용 지시문 (사실 변경 금지 강조)."""
    parts = [
        "다음 답변의 **사실·숫자·결론·논리 구조는 일절 바꾸지 마세요.** 문장만 아래 스타일로 다시 써 주세요.",
        "",
        "적용할 스타일:",
        f"- 화자: {profile.persona}",
        f"- 톤: {profile.tone}",
        f"- 논리 전개: {profile.reasoning_pattern}",
        f"- 문장 리듬: {profile.sentence_rhythm}",
        f"- 시점: {profile.perspective}",
        f"- 설득 방식: {profile.persuasion}",
    ]
    if profile.rhetoric:
        parts.append(f"- 수사/장치: {', '.join(profile.rhetoric)} (적절히 활용)")
    parts.extend([
        "",
        "금지: 새 사실 추가, 숫자/날짜 변경, 결론 바꾸기, 근거 생략 또는 과장.",
    ])
    return "\n".join(parts)


def render(content_draft: str, style_profile: StyleProfile, context_pack: Optional[Dict[str, Any]] = None) -> str:
    """
    스타일 렌더링: content_draft(이미 확정된 내용)에만 스타일 적용.
    사실/논리는 변경하지 않음. 실패 시 원문 그대로 반환.
    """
    if not content_draft or not content_draft.strip():
        return content_draft or ""

    context_pack = context_pack or {}
    instruction = _build_style_instruction(style_profile)
    mri = (context_pack.get("_multi_request_instruction") or "").strip()
    multi_hint = ""
    if mri:
        multi_hint = (
            "\n\n[다중 질문·요구] 문장만 바꿀 때 항목을 합치거나 누락하지 마세요.\n"
            + mri[:1600]
        )
    prompt = (
        instruction
        + multi_hint
        + "\n\n---\n\n아래 내용을 위 스타일로 문장만 바꿔 주세요. 내용은 동일하게 유지합니다.\n\n"
        + content_draft[:8000]
    )

    try:
        from api.unified_chat_api import generate_chat_response
        import asyncio

        try:
            styled = asyncio.run(generate_chat_response(prompt, "enhanced", context_pack))
        except RuntimeError:
            loop = asyncio.get_event_loop()
            styled = loop.run_until_complete(generate_chat_response(prompt, "enhanced", context_pack))
        if styled and len(styled.strip()) > 20:
            logger.info("style_renderer applied: style=%s", style_profile.style)
            return styled.strip()
    except Exception as e:
        logger.warning("style_renderer 미적용(원문 반환): %s", e)
    return content_draft


def extract_style_request_from_query(query: str) -> Optional[str]:
    """
    쿼리에서 "유시민 스타일로", "기자처럼 써줘" 등 스타일 지시 추출.
    """
    if not query or not query.strip():
        return None
    q = query.strip()
    import re
    # "유시민 스타일로", "유시민처럼", "기자 스타일로 써줘" 등
    m = re.search(
        r"(유시민|기자|평론가|블로거|분석가|손석희|김어준)\s*(스타일)?\s*(로|처럼)?\s*(써\s*줘|작성|써\s*달라)?",
        q,
        re.IGNORECASE,
    )
    if m:
        return m.group(1).strip()
    m = re.search(r"(.+?)\s*스타일\s*(로)?\s*(써|작성)", q)
    if m:
        return m.group(1).strip()
    return None
