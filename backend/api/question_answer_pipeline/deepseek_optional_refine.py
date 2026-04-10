# Q→A 파이프라인 최종문에 대한 선택적 DeepSeek Chat 다듬기 (옵트인)
# - context.pipeline_deepseek_refine + deepseek_review_layer_hints 일 때만
# - DEEPSEEK_API_KEY 없으면 조용히 스킵 (비용·의존성 없음)
# @see docs/architecture/GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md §8.2

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
DEEPSEEK_REFINE_MODEL = os.getenv("DEEPSEEK_REFINE_MODEL", os.getenv("DEEPSEEK_MODEL", "deepseek-chat"))


DEFAULT_FORMATTER_SYSTEM = (
    "너의 역할은 초안을 더 구조적이고 일관되게 정리하는 것이다. "
    "새로운 주장·수치·날짜를 추가하지 말고, 문장과 형식만 다듬어라. "
    "출력은 다듬은 본문만 반환하고, 메타 설명을 붙이지 마라."
)


def _truthy(v: Any) -> bool:
    if v is True or v == 1:
        return True
    if isinstance(v, str) and v.strip().lower() in ("1", "true", "yes", "on"):
        return True
    return False


def wants_deepseek_pipeline_refine(context_pack: Dict[str, Any]) -> bool:
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
    if not (DEEPSEEK_API_KEY or "").strip():
        return False
    env_on = os.getenv("PIPELINE_DEEPSEEK_REFINE", "").lower() in ("1", "true", "yes")
    return env_on or _truthy(context_pack.get("pipeline_deepseek_refine"))


def deepseek_chat_refine_sync(
    draft: str,
    context_pack: Dict[str, Any],
    *,
    max_input_chars: int = 12000,
    max_tokens: int = 4096,
    timeout_sec: float = 90.0,
) -> Tuple[str, Dict[str, Any]]:
    """
    동기 HTTP로 DeepSeek Chat 호출. 실패 시 (원문, {skipped: reason}).
    성공 시 (정제본, {model, tokens?}).
    """
    meta: Dict[str, Any] = {"refine_attempted": True}
    try:
        from llm_internal_security import is_deepseek_cloud_blocked

        if is_deepseek_cloud_blocked():
            meta["skipped"] = "internal_security_cloud_blocked"
            return draft, meta
    except ImportError:
        pass
    if not DEEPSEEK_API_KEY.strip():
        meta["skipped"] = "no_deepseek_api_key"
        return draft, meta

    sys_content = DEFAULT_FORMATTER_SYSTEM
    fmt = context_pack.get("deepseek_chat_formatter_prompt")
    if isinstance(fmt, str) and fmt.strip():
        sys_content = fmt.strip()[:6000]

    kli = (context_pack.get("korean_layer_instruction") or "").strip()
    user_parts = [
        "아래 초안만 정리하라. 새 사실·날짜·수치를 추가하지 말 것. 출력은 본문만.",
    ]
    critique = context_pack.get("deepseek_critique_for_refine")
    if isinstance(critique, dict) and critique:
        try:
            snippet = json.dumps(critique, ensure_ascii=False)[:4500]
        except (TypeError, ValueError):
            snippet = str(critique)[:4500]
        user_parts.append(
            "[선택적 검토 JSON — 논리 보강·누락 보완만 반영, 새 사실·수치·날짜 추가 금지]\n"
            + snippet
        )
    if kli:
        user_parts.append("[한국어 이해·출력 계층]\n" + kli[:2000])
    mlh = context_pack.get("multilayer_style_hint")
    if mlh and isinstance(mlh, (dict, list)):
        try:
            user_parts.append(
                "[다층 스타일 힌트]\n" + json.dumps(mlh, ensure_ascii=False)[:1200]
            )
        except (TypeError, ValueError):
            pass
    mri = (context_pack.get("_multi_request_instruction") or "").strip()
    if mri:
        user_parts.append(
            "[다중 질문·요구] 정리 후에도 아래 항목이 빠지거나 합쳐지지 않도록 구조를 유지하라.\n"
            + mri[:2000]
        )
    user_parts.append("---\n[초안]\n" + (draft or "")[:max_input_chars])
    body_text = "\n\n".join(user_parts)

    payload = {
        "model": DEEPSEEK_REFINE_MODEL,
        "messages": [
            {"role": "system", "content": sys_content},
            {"role": "user", "content": body_text},
        ],
        "temperature": 0.25,
        "max_tokens": max_tokens,
    }

    url = f"{DEEPSEEK_BASE_URL}/chat/completions"
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {DEEPSEEK_API_KEY.strip()}",
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
            return draft, meta
        content = (choices[0].get("message") or {}).get("content") or ""
        content = (content or "").strip()
        if len(content) < 20:
            meta["error"] = "short_refine_output"
            return draft, meta
        usage = parsed.get("usage") or {}
        meta["model"] = parsed.get("model") or DEEPSEEK_REFINE_MODEL
        meta["tokens"] = usage.get("total_tokens")
        meta["refine_applied"] = True
        logger.info("[DeepSeek refine] applied model=%s len_in=%d len_out=%d", meta["model"], len(draft), len(content))
        return content, meta
    except urllib.error.HTTPError as e:
        logger.warning("[DeepSeek refine] HTTP %s: %s", e.code, e.reason)
        meta["error"] = f"http_{e.code}"
        return draft, meta
    except Exception as e:
        logger.warning("[DeepSeek refine] failed: %s", e)
        meta["error"] = str(e)[:200]
        return draft, meta


def maybe_refine_final_answer(
    final_text: str,
    context_pack: Dict[str, Any],
) -> Tuple[str, Optional[Dict[str, Any]]]:
    """옵트인이면 정제 시도, 아니면 (원문, None)."""
    if not wants_deepseek_pipeline_refine(context_pack):
        return final_text, None
    refined, meta = deepseek_chat_refine_sync(final_text, context_pack)
    return refined, meta
