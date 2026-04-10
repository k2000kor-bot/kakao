"""
SSE `/chat/stream` 등: 라운드별 `out_metadata`를 누적할 때 빈 값은 덮어쓰지 않음.
(다중 질문·폴백 라운드에서 앞선 task_plan/trace 등이 사라지는 것 방지)
"""

from __future__ import annotations

from typing import Any, Dict


def merge_round_into_aggregated_stream_metadata(
    aggregated: Dict[str, Any], round_meta: Dict[str, Any]
) -> None:
    """round_meta의 의미 있는 키만 aggregated에 반영(in-place)."""
    for k, v in round_meta.items():
        if v is None:
            continue
        if isinstance(v, str) and not v.strip():
            continue
        if isinstance(v, (list, dict)) and len(v) == 0:
            continue
        aggregated[k] = v
