# Q→A 파이프라인: DeepSeek Reasoner 비평(JSON) — 옵트인
# - deepseek_review_layer_hints + (PIPELINE_DEEPSEEK_REASONER 또는 context.pipeline_deepseek_reasoner)
# - DEEPSEEK_API_KEY 필수
# @see docs/architecture/GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
DEEPSEEK_REASONER_MODEL = os.getenv("DEEPSEEK_REASONER_MODEL", "deepseek-reasoner")

DEFAULT_REASONER_SYSTEM = (
    "너는 비평가이자 검수자다. 사용자 질문과 모델 초안을 보고 "
    "논리 누락·반론 가능 지점·과도한 단정·실무 공백만 분석한다. "
    "반드시 하나의 JSON 객체만 출력한다. 마크다운 코드펜스를 쓰지 마라. "
    "스키마 키: logic_gaps, missing_sections, risk_points, counterarguments, "
    "overconfident_claims, practical_gaps, follow_up_questions, improvement_actions "
    "(배열 항목은 {priority, action, target_section}), overall_severity (low|medium|high), "
    "summary_for_user (한 줄, 한국어 가능). 빈 배열은 []로 둔다."
)


def _truthy(v: Any) -> bool:
    if v is True or v == 1:
        return True
    if isinstance(v, str) and v.strip().lower() in ("1", "true", "yes", "on"):
        return True
    return False


def wants_deepseek_reasoner_critique(context_pack: Dict[str, Any]) -> bool:
    try:
        from llm_internal_security import is_deepseek_cloud_blocked

        if is_deepseek_cloud_blocked():
            return False
    except ImportError:
        pass
    if not context_pack:
        return False
    if not _truthy(context_pack.get("deepseek_review_layer_hints")):
        return False
    if not (os.getenv("DEEPSEEK_API_KEY", "") or "").strip():
        return False
    env_on = os.getenv("PIPELINE_DEEPSEEK_REASONER", "").lower() in ("1", "true", "yes")
    return env_on or _truthy(context_pack.get("pipeline_deepseek_reasoner"))


def _extract_json_object(text: str) -> Optional[Dict[str, Any]]:
    raw = (text or "").strip()
    if not raw:
        return None
    try:
        out = json.loads(raw)
        return out if isinstance(out, dict) else None
    except json.JSONDecodeError:
        pass
    start = raw.find("{")
    end = raw.rfind("}")
    if start >= 0 and end > start:
        try:
            out = json.loads(raw[start : end + 1])
            return out if isinstance(out, dict) else None
        except json.JSONDecodeError:
            return None
    return None


def deepseek_reasoner_critique_sync(
    draft: str,
    user_query: str,
    context_pack: Dict[str, Any],
    *,
    max_draft_chars: int = 28000,
    max_tokens: int = 4096,
    timeout_sec: float = 120.0,
) -> Tuple[Optional[Dict[str, Any]], Dict[str, Any]]:
    """
    동기 HTTP로 deepseek-reasoner 호출. 실패 시 (None, meta).
    성공 시 (critique dict, meta).
    """
    meta: Dict[str, Any] = {"reasoner_attempted": True}
    try:
        from llm_internal_security import is_deepseek_cloud_blocked

        if is_deepseek_cloud_blocked():
            meta["skipped"] = "internal_security_cloud_blocked"
            return None, meta
    except ImportError:
        pass
    api_key = (os.getenv("DEEPSEEK_API_KEY", "") or "").strip()
    if not api_key:
        meta["skipped"] = "no_deepseek_api_key"
        return None, meta

    sys_content = DEFAULT_REASONER_SYSTEM
    custom = context_pack.get("deepseek_reasoner_system_prompt")
    if isinstance(custom, str) and custom.strip():
        sys_content = custom.strip()[:8000]

    dq = (user_query or "").strip()[:4000]
    dd = (draft or "").strip()[:max_draft_chars]
    mri = (context_pack.get("_multi_request_instruction") or "").strip()
    multi_block = ""
    if mri:
        multi_block = (
            "\n\n---\n[다중 질문·요구 — 초안이 아래 각 항목을 충분히 다루는지 missing_sections·logic_gaps에 반영하라]\n"
            + mri[:2000]
        )
    user_body = (
        "[사용자 질문]\n"
        + dq
        + multi_block
        + "\n\n---\n[초안]\n"
        + dd
        + "\n\n---\n위만 보고 JSON 한 개만 출력하라."
    )

    payload = {
        "model": DEEPSEEK_REASONER_MODEL,
        "messages": [
            {"role": "system", "content": sys_content},
            {"role": "user", "content": user_body},
        ],
        "temperature": 0.2,
        "max_tokens": max_tokens,
    }

    url = f"{DEEPSEEK_BASE_URL}/chat/completions"
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        parsed = json.loads(raw)
        choices = parsed.get("choices") or []
        if not choices:
            meta["error"] = "empty_choices"
            return None, meta
        msg = (choices[0].get("message") or {})
        content = (msg.get("content") or "").strip()
        # 일부 reasoning API는 reasoning_content에 힌트가 있을 수 있음 — content 우선
        if not content and isinstance(msg.get("reasoning_content"), str):
            content = (msg.get("reasoning_content") or "").strip()
        critique = _extract_json_object(content)
        if not critique:
            meta["error"] = "json_parse_failed"
            meta["raw_preview"] = (content or "")[:500]
            return None, meta
        usage = parsed.get("usage") or {}
        meta["model"] = parsed.get("model") or DEEPSEEK_REASONER_MODEL
        meta["tokens"] = usage.get("total_tokens")
        meta["critique_applied"] = True
        sev = critique.get("overall_severity")
        if isinstance(sev, str):
            meta["severity"] = sev
        logger.info(
            "[DeepSeek reasoner] critique ok model=%s keys=%s",
            meta.get("model"),
            list(critique.keys())[:12],
        )
        return critique, meta
    except urllib.error.HTTPError as e:
        logger.warning("[DeepSeek reasoner] HTTP %s: %s", e.code, e.reason)
        meta["error"] = f"http_{e.code}"
        return None, meta
    except Exception as e:
        logger.warning("[DeepSeek reasoner] failed: %s", e)
        meta["error"] = str(e)[:200]
        return None, meta


def maybe_critique_final_answer(
    final_text: str,
    user_query: str,
    context_pack: Dict[str, Any],
) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """옵트인이면 비평 시도. (critique dict or None, meta or None)."""
    if not wants_deepseek_reasoner_critique(context_pack):
        return None, None
    critique, meta = deepseek_reasoner_critique_sync(
        final_text, user_query, context_pack
    )
    if meta.get("critique_applied") and critique:
        return critique, meta
    return None, meta
