# Verifier: draft_answer + claim_graph + evidence_bundle -> verification_report (Step G)
# "근거 없는 핵심 주장 금지" 강제. Attribution, Faithfulness 간단 검사.

import re
import logging
from typing import Any, Dict, FrozenSet, List, Optional, Set

from .schemas import ClaimGraph, EvidenceBundle, VerificationReport
from .korean_style_checks import collect_korean_style_notes

logger = logging.getLogger(__name__)

# planner 보조 서브질문(sq2+) 미리보기에 자주 등장하는 형식어(오탐 완화)
_SUBQ_BOILERPLATE_WORDS = frozenset(
    {
        "위",
        "질의",
        "질문",
        "답할",
        "때",
        "수",
        "있는",
        "것",
        "등",
        "및",
        "또는",
        "위한",
        "한다",
        "하는",
        "할",
        "보완",
        "관점",
        "맥락",
    }
)


def _draft_covers_token_words(
    draft_lower: str,
    text: str,
    *,
    min_word_len: int,
    coverage_ratio: float,
    skip_words: Optional[FrozenSet[str]] = None,
) -> bool:
    """text에서 뽑은 토큰이 초안에 충분히 등장하는지."""
    words = [w for w in re.findall(r"[\w가-힣]+", text.lower()) if len(w) >= min_word_len]
    if skip_words:
        words = [w for w in words if w not in skip_words]
    if not words:
        return True
    need = max(1, int(len(words) * coverage_ratio + 0.999))  # ceil(ratio * n)

    def _token_hit(token: str) -> bool:
        if token in draft_lower:
            return True
        # 한글 활용형 완화: 3글자 이상 토큰만 앞 2글자 접두로 어절 매칭(2글자는 오탐 많아 제외)
        if len(token) >= 3 and re.search(r"[가-힣]", token):
            prefix = token[:2]
            if prefix in draft_lower:
                for chunk in re.findall(r"[가-힣]{2,}", draft_lower):
                    if chunk.startswith(prefix):
                        return True
        return False

    hit = sum(1 for w in words if _token_hit(w))
    return hit >= need


def _multi_request_items_undercovered(draft_answer: str, items: List[Any]) -> List[str]:
    """다중 요청 항목이 초안에 충분히 반영됐는지 느슨한 단어 매칭으로 점검."""
    miss: List[str] = []
    d = (draft_answer or "").lower()
    d_compact = re.sub(r"\s+", "", d)
    for raw in items[:15]:
        if not isinstance(raw, str):
            continue
        t = raw.strip()
        if len(t) < 4:
            continue
        words = [w for w in re.findall(r"[\w가-힣]+", t.lower()) if len(w) >= 2]
        if not words:
            head = re.sub(r"\s+", "", t.lower())[:24]
            if head and head not in d_compact:
                miss.append(t[:80])
            continue
        if not _draft_covers_token_words(d, t, min_word_len=2, coverage_ratio=0.6):
            miss.append(t[:80])
    return miss


def _followup_subquestions_undercovered(draft_answer: str, context_pack: Dict[str, Any]) -> List[str]:
    """sq1(본질의) 이후 보조 하위 질문이 초안에 반영됐는지 점검."""
    miss: List[str] = []
    tp = context_pack.get("_task_plan_for_response") or {}
    subs = tp.get("subquestions") or []
    if not isinstance(subs, list) or len(subs) <= 1:
        return miss
    d = (draft_answer or "").lower()
    for sq in subs[1:12]:
        if not isinstance(sq, dict):
            continue
        prev = (sq.get("question_preview") or "").strip()
        if len(prev) < 16:
            continue
        if not _draft_covers_token_words(
            d,
            prev,
            min_word_len=2,
            coverage_ratio=0.55,
            skip_words=_SUBQ_BOILERPLATE_WORDS,
        ):
            miss.append(prev[:72])
    return miss


def verify(
    draft_answer: str,
    claim_graph: ClaimGraph,
    evidence_bundle: EvidenceBundle,
    grounding_required: str = "preferred",
    context_pack: Optional[Dict[str, Any]] = None,
) -> VerificationReport:
    """
    Verifier 계약: draft_answer, claim_graph, evidence_bundle -> verification_report.
    MVP: (1) draft에 claim 문장이 포함되어 있는지, (2) 근거 없는 새 핵심 주장 탐지(간단 휴리스틱).
    """
    issues: List[str] = []
    fix_actions: List[str] = []

    # claim 문장/핵심이 draft에 반영되었는지
    claim_statements: Set[str] = set()
    for c in claim_graph.claims:
        if c.claim_id == "c0" and not c.supporting:
            continue
        # 정규화: 공백/줄바꿈 제거 후 앞 50자
        key = re.sub(r"\s+", " ", c.statement.strip())[:50]
        claim_statements.add(key)

    draft_norm = re.sub(r"\s+", " ", (draft_answer or "").strip())
    for key in claim_statements:
        if key not in draft_norm and key[:30] not in draft_norm:
            issues.append(f"근거 주장이 답변에 반영되지 않음: {key[:40]}...")

    # 근거 없는 숫자/날짜 패턴이 draft에 많이 있으면 경고 (휴리스틱)
    if grounding_required == "required":
        ev_content = " ".join(e.content for e in evidence_bundle.items)
        # evidence에 없는 숫자 패턴이 draft에만 있으면 잠재 환각
        numbers_in_draft = set(re.findall(r"\d{1,3}[.,]\d+|\d{4}년|\d+월|\d+일", draft_answer))
        numbers_in_ev = set(re.findall(r"\d{1,3}[.,]\d+|\d{4}년|\d+월|\d+일", ev_content))
        only_in_draft = numbers_in_draft - numbers_in_ev
        if len(only_in_draft) > 2:
            issues.append("답변에만 있는 수치/날짜가 많음. 근거에 없는 수치는 불확실 표기 권장.")
            fix_actions.append("불확실한 수치에는 '확인 필요' 또는 출처 표기")

        # 근거 커버리지가 낮을 때 단정적 한국어 표현 → 환각·과신 완화 힌트
        if evidence_bundle.coverage < 0.45:
            absolutes_ko = (
                "반드시 ",
                "무조건 ",
                "절대 ",
                "항상 ",
                "틀림없이 ",
                "확실히 ",
            )
            if any(p in draft_answer for p in absolutes_ko):
                issues.append(
                    "자료 근거가 부족한데 단정적 표현이 있습니다. '~로 보입니다', '일반적으로' 등으로 완곡하게 다듬는 것을 권장합니다."
                )
                fix_actions.append("근거 범위 밖 단정 표현 완화 또는 출처 명시")

            # 동일 조건: 영어 단정·절대 표현 (다국어 답변·혼용 대비)
            draft_lower = (draft_answer or "").lower()
            absolutes_en = (
                " absolutely ",
                " always ",
                " never ",
                "definitely ",
                " guaranteed",
                "without doubt",
                "beyond doubt",
                "it must be",
                " no doubt ",
            )
            if any(p in draft_lower for p in absolutes_en):
                issues.append(
                    "Evidence is thin but the draft uses strong absolute wording in English. "
                    "Prefer hedging (e.g. 'likely', 'often', 'may') or cite sources."
                )
                fix_actions.append("Soften absolute English claims or add citations")

    korean_notes: List[str] = []
    if context_pack and context_pack.get("korean_understanding"):
        knotes, kstrict = collect_korean_style_notes(draft_answer, context_pack)
        korean_notes = knotes
        issues.extend(kstrict)

    if context_pack and context_pack.get("multi_request_mode"):
        mitems = context_pack.get("multi_request_items")
        if isinstance(mitems, list) and mitems:
            uncovered = _multi_request_items_undercovered(draft_answer, mitems)
            for u in uncovered[:8]:
                issues.append(f"다중 요청 항목이 답변에서 약하게 보입니다: {u}")

    if context_pack:
        sq_miss = _followup_subquestions_undercovered(draft_answer, context_pack)
        for u in sq_miss[:5]:
            issues.append(f"보조 하위 질문(전제·리스크 등)이 답변에서 약하게 보입니다: {u}")

    pass_ = len(issues) == 0
    if not pass_:
        fix_actions.append("Writer 재작성(근거 범위 내) 또는 자료 부족으로 안전 종료")

    report = VerificationReport(
        pass_=pass_,
        issues=issues,
        fix_actions=fix_actions,
        korean_style_notes=korean_notes,
    )
    logger.info("verification_report: pass=%s, issues=%d", pass_, len(issues))
    return report
