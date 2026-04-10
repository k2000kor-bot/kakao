# 혁신적 생성: 대안 초안, 확장 질문 (INNOVATIVE_GENERATION.md)
# 사실 변경 금지. 동일 내용의 다른 표현·다음 단계 제안만.

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


def is_follow_up_question_line_candidate(line: str) -> bool:
    """
    LLM 출력 한 줄이 후속 질문 후보인지(단위 테스트·휴리스틱 조정용).
    이전 버전은 `and`/`or` 결합 순서 버그로 짧은 줄도 통과할 수 있었음.
    """
    s = (line or "").strip()
    if not s or len(s) <= 5:
        return False
    looks_like_question = (
        "?" in s
        or "까" in s
        or "인가" in s
        or "뭔가" in s
        or "무엇" in s
        or "어떻게" in s
    )
    if looks_like_question:
        return True
    return len(s) > 10


def _call_llm(prompt: str, context_pack: Dict[str, Any], max_tokens: int = 800) -> Optional[str]:
    try:
        from api.unified_chat_api import generate_chat_response
        import asyncio
        try:
            out = asyncio.run(generate_chat_response(prompt, "enhanced", context_pack))
        except RuntimeError:
            loop = asyncio.get_event_loop()
            out = loop.run_until_complete(generate_chat_response(prompt, "enhanced", context_pack))
        return (out or "").strip() or None
    except Exception as e:
        logger.warning("creative_generation LLM 호출 실패: %s", e)
        return None


def generate_alternatives(
    main_response: str,
    context_pack: Optional[Dict[str, Any]] = None,
    max_n: int = 2,
) -> List[str]:
    """
    동일 내용의 다른 표현 1~2개 생성. 사실·숫자·결론 변경 금지.
    """
    if not main_response or not main_response.strip() or max_n < 1:
        return []
    context_pack = context_pack or {}
    prompt = (
        "아래 답변과 **내용이 완전히 동일한** 다른 표현을 %d개만 만들어 주세요. "
        "숫자·사실·결론을 바꾸지 마세요. 문장만 다르게 써 주세요. 각 표현은 한 덩어리로, 번호만 1. 2. 로 구분해 주세요.\n\n"
        "원문:\n%s"
    ) % (max_n, main_response[:4000])
    out = _call_llm(prompt, context_pack, max_tokens=600)
    if not out:
        return []
    alternatives: List[str] = []
    for part in out.replace("1.", "\n1.").replace("2.", "\n2.").split("\n"):
        part = part.strip()
        if part and not part.startswith("원문"):
            alternatives.append(part)
    return alternatives[:max_n]


def generate_follow_up_questions(
    main_response: str,
    query: str,
    context_pack: Optional[Dict[str, Any]] = None,
    max_n: int = 3,
) -> List[str]:
    """
    답변을 바탕으로 다음에 알아보면 좋을 질문 2~3개 제안.
    """
    if not main_response or not main_response.strip() or max_n < 1:
        return []
    context_pack = context_pack or {}
    prompt = (
        "다음 답변을 읽고, 사용자가 **이어서 물어보면 유용한 질문**을 %d개만 제안해 주세요. "
        "질문만 한 줄씩, 번호 없이 나열해 주세요. 답변 내용을 넘어서는 새로운 주제는 피하세요.\n\n"
        "사용자 질문: %s\n\n답변:\n%s"
    ) % (max_n, (query or "")[:500], main_response[:3500])
    out = _call_llm(prompt, context_pack, max_tokens=400)
    if not out:
        return []
    questions: List[str] = []
    for line in out.split("\n"):
        line = line.strip().lstrip("0123456789.-) ")
        if is_follow_up_question_line_candidate(line):
            questions.append(line)
    return questions[:max_n]


def apply_generation_mode(
    claim_graph: Any,
    route_decision: Any,
    mode: str,
    context_pack: Optional[Dict[str, Any]] = None,
) -> str:
    """
    generation_mode에 따라 같은 claim에서 다른 구조로 문단 생성.
    one_liner, three_key_points, action_checklist, counter_argument.
    """
    if not claim_graph or not getattr(claim_graph, "claims", None):
        return ""
    claims = claim_graph.claims
    context_pack = context_pack or {}

    if mode == "one_liner":
        # 핵심 1~2문장만
        parts = [c.statement for c in claims if c.statement and c.claim_id != "c0"][:2]
        if not parts:
            parts = [c.statement for c in claims if c.statement][:1]
        draft = " ".join(parts).replace("\n", " ").strip()[:500]
        if context_pack:
            prompt = "다음 내용을 한 문장으로 요약해 주세요. 사실을 바꾸지 마세요.\n\n" + draft
            one = _call_llm(prompt, context_pack, max_tokens=200)
            if one:
                return one
        return draft

    if mode == "three_key_points":
        lines = ["**세 가지 핵심**", ""]
        for i, c in enumerate(claims[:3], 1):
            if c.statement:
                lines.append(f"{i}. {c.statement}")
        return "\n".join(lines)

    if mode == "action_checklist":
        lines = ["**실행 체크리스트**", ""]
        for c in claims:
            if c.statement and c.claim_id != "c0":
                lines.append(f"- [ ] {c.statement}")
        if len(lines) <= 2:
            for c in claims:
                if c.statement:
                    lines.append(f"- [ ] {c.statement}")
        return "\n".join(lines)

    if mode == "counter_argument":
        lines = ["**정리**", ""]
        for c in claims:
            if c.statement:
                lines.append(c.statement)
        lines.append("")
        lines.append("**참고·대비**")
        lines.append("다만 위 내용은 일부 관점의 정리이므로, 반대 견해나 추가 자료가 있으면 비교 검토하는 것이 좋습니다.")
        return "\n".join(lines)

    return ""
