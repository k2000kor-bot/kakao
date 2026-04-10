# 다턴 대화 맥락을 파이프라인 근거(evidence)에 반영 — Genspark agents 세션처럼 후속 질문이 이전 답을 이어받도록 함

from __future__ import annotations

import hashlib
import logging
from datetime import datetime
from typing import Any, Dict, List

from .schemas import EvidenceBundle, EvidenceItem

logger = logging.getLogger(__name__)

def _hash_content(content: str) -> str:
    return hashlib.sha256((content or "").encode("utf-8")).hexdigest()[:16]


def _truthy(v: Any) -> bool:
    try:
        if isinstance(v, bool):
            return v
        if isinstance(v, (int, float)):
            return v != 0
        if isinstance(v, str):
            return v.strip().lower() in (
                "1",
                "true",
                "yes",
                "y",
                "on",
                "enable",
                "enabled",
            )
    except Exception:
        pass
    return False


def _normalize_history_list(raw: Any) -> List[Dict[str, Any]]:
    if not isinstance(raw, list):
        return []
    out: List[Dict[str, Any]] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = (item.get("content") or "").strip()
        if role not in ("user", "assistant") or not content:
            continue
        out.append({"role": role, "content": content})
    return out


def should_inject_conversation_thread(context_pack: Dict[str, Any]) -> bool:
    """Genspark·에이전트 계약이거나, 실제 다턴(어시스턴트 응답이 이미 있는 경우)일 때만 주입."""
    cp = context_pack or {}
    if _truthy(cp.get("agentic_genspark_style")):
        return True
    if isinstance(cp.get("genspark_reference_agent_id"), str) and (
        cp.get("genspark_reference_agent_id") or ""
    ).strip():
        return True
    hist = _normalize_history_list(
        cp.get("conversation_history") or cp.get("conversationHistory")
    )
    if len(hist) < 2:
        return False
    return any(h["role"] == "assistant" for h in hist[:-1])


def _trim_hist_for_current_message(
    hist: List[Dict[str, Any]], current_user_message: str
) -> List[Dict[str, Any]]:
    """히스토리 마지막이 현재 전송 문장과 같으면 제외(중복 user 턴 방지)."""
    if not hist:
        return hist
    cur = (current_user_message or "").strip()
    last = hist[-1]
    if last["role"] == "user" and cur and last["content"].strip() == cur:
        return hist[:-1]
    return hist


def merge_prior_conversation_turns_into_evidence(
    bundle: EvidenceBundle,
    context_pack: Dict[str, Any],
    current_user_message: str,
) -> EvidenceBundle:
    """
    이전 user/assistant 턴을 evidence_item으로 붙여 synthesize→writer가 맥락을 근거로 사용하게 함.
    """
    if not should_inject_conversation_thread(context_pack):
        return bundle

    hist = _normalize_history_list(
        context_pack.get("conversation_history") or context_pack.get("conversationHistory")
    )
    hist = _trim_hist_for_current_message(hist, current_user_message)
    if not hist:
        return bundle
    if not any(h["role"] == "assistant" for h in hist):
        return bundle

    prior = hist
    existing_hashes = {
        _hash_content((e.content or "").strip())
        for e in (bundle.items or [])
        if (e.content or "").strip()
    }

    new_items: List[EvidenceItem] = list(bundle.items or [])
    base_idx = len(new_items)
    for i, turn in enumerate(prior):
        text = turn["content"]
        th = _hash_content(text)
        if th in existing_hashes:
            continue
        existing_hashes.add(th)
        role = turn["role"]
        ev_id = f"ev_conv_{base_idx + i + 1:03d}"
        new_items.append(
            EvidenceItem(
                evidence_id=ev_id,
                type="conversation_turn",
                source_ref={
                    "origin": "conversation_history",
                    "role": role,
                    "turn_index": i,
                },
                content=f"[이전 대화 — {role}]\n{text}",
                timestamp=datetime.utcnow().isoformat() + "Z",
                score=0.82 if role == "assistant" else 0.78,
                hash=th,
            )
        )

    if len(new_items) == len(bundle.items or []):
        return bundle

    nonempty = len([e for e in new_items if (e.content or "").strip()])
    coverage = nonempty / max(1, len(new_items))
    confidence = sum(e.score for e in new_items) / max(1, len(new_items))
    logger.info(
        "conversation_thread: injected %d prior-turn evidence items (total=%d)",
        len(new_items) - len(bundle.items or []),
        len(new_items),
    )
    return EvidenceBundle(items=new_items, coverage=coverage, confidence=confidence)


def build_writer_transcript_coherence_block(
    context_pack: Dict[str, Any], current_user_message: str
) -> str:
    """Writer LLM 다듬기용 짧은 맥락 블록."""
    if not should_inject_conversation_thread(context_pack):
        return ""
    hist = _normalize_history_list(
        context_pack.get("conversation_history") or context_pack.get("conversationHistory")
    )
    hist = _trim_hist_for_current_message(hist, current_user_message)
    if len(hist) < 2:
        return ""
    lines: List[str] = [
        "[다턴 대화 일관성]",
        "아래는 직전까지의 대화이다. 현재 사용자 메시지에 답할 때 용어·결론·제약을 이어가고 모순을 만들지 마라.",
        "",
    ]
    for turn in hist:
        prefix = "사용자" if turn["role"] == "user" else "어시스턴트"
        lines.append(f"- {prefix}: {turn['content']}")
    return "\n".join(lines).strip()


def augment_short_followup_query_for_router(
    normalized_query: str, context_pack: Dict[str, Any]
) -> str:
    """
    다턴 대화일 때 라우팅·planner·RAG 질의 문자열에 이전 턴 맥락을 접두한다.
    UI용 task_plan.user_goal_preview 는 _pipeline_user_query_plain 으로 분리해 planner에서 쓴다.
    """
    q = (normalized_query or "").strip()
    if not should_inject_conversation_thread(context_pack):
        return q
    hist = _normalize_history_list(
        context_pack.get("conversation_history") or context_pack.get("conversationHistory")
    )
    hist = _trim_hist_for_current_message(hist, q)
    if len(hist) < 1:
        return q
    if not any(h["role"] == "assistant" for h in hist):
        return q
    lines: List[str] = []
    for turn in hist:
        label = "사용자" if turn["role"] == "user" else "어시스턴트"
        lines.append(f"- {label}: {turn['content']}")
    if not lines:
        return q
    block = "\n".join(lines)
    return f"[이전 대화 맥락]\n{block}\n\n[현재 사용자 메시지]\n{q}"
