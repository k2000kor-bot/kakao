# Q→A 파이프라인 진입 보조 — 속도·품질 정책 (fast = 직경로 우선)

from __future__ import annotations

from typing import Any, Dict, Optional


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


def should_skip_qa_pipeline_for_speed(
    *, quality: Optional[str], context: Optional[Dict[str, Any]]
) -> bool:
    """
    다단계 파이프라인(run_pipeline) 생략 조건:
    - context.qa_pipeline_fast_path (프론트 간결 모드 등)
    - context.answer_mode == fast
    - quality == basic (단, agentic_genspark_style 이 켜진 요청은 Genspark식 다단계
      과정을 위해 생략하지 않음 — 간결/직경로는 위 fast_path·answer_mode 로만 생략)

    qa_pipeline_force 가 참이면 생략하지 않음(명시적 강제).
    """
    ctx = context if isinstance(context, dict) else {}
    if _truthy(ctx.get("qa_pipeline_force")):
        return False
    if _truthy(ctx.get("qa_pipeline_fast_path")):
        return True
    if str(ctx.get("answer_mode") or "").strip().lower() == "fast":
        return True
    if (quality or "").strip().lower() == "basic":
        if _truthy(ctx.get("agentic_genspark_style")):
            return False
        return True
    return False
