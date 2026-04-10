# -*- coding: utf-8 -*-
"""
AI Workspace 의도 감지 및 기능 라우팅.

- 좌측 4개 영역(검색/새대화, 프로젝트, 최근 대화, 사용자)에서
  "요청 시 생성되는 기능"을 프롬프트로 실행하기 위한 의도 분류.
- 패턴/정규식 기반 (필요 시 LLM 분류로 확장).
- 연동: unified_chat_api.generate_chat_response() 진입 시 호출 가능.
"""

import re
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

# 의도별 최소 신뢰도 — 이 이상이면 도구 라우팅 후보
DEFAULT_CONFIDENCE_THRESHOLD = 0.65


@dataclass
class WorkspaceIntent:
    """워크스페이스 인텐트 결과"""
    intent: str
    confidence: float
    slots: Dict[str, Any] = field(default_factory=dict)
    raw_message: str = ""
    suggested_tool: Optional[str] = None  # 호출할 API/도구 식별자


# 패턴: (의도, 정규식 또는 키워드 리스트, 슬롯 추출용)
# 슬롯은 나중에 엔티티 추출(지역명, 프로젝트명 등)로 확장 가능
WORKSPACE_INTENT_PATTERNS: List[Tuple[str, Any, List[str], Optional[str]]] = [
    # (intent, pattern_or_keywords, slot_names, suggested_tool)
    (
        "conversation_search",
        [
            r"(?:대화|대화).*찾아",
            r"검색.*(?:대화|대화)",
            r"관련\s*대화\s*찾아",
            r"(?:지난|최근).*대화\s*검색",
            r"대화\s*검색",
        ],
        ["query"],
        "conversation_search",
    ),
    (
        "project_create",
        [
            r"(?:프로젝트|분석).*만들어",
            r"생성.*(?:프로젝트)",
            r".*지구\s*(?:분석\s*)?프로젝트\s*만들어",
            r"새\s*프로젝트\s*(?:만들|생성)",
            r"프로젝트\s*생성",
        ],
        ["project_name", "topic"],
        "project_create",
    ),
    (
        "file_upload",
        [
            r"(?:이\s*)?프로젝트에\s*(?:기사|자료|파일)\s*추가",
            r"(?:파일|자료|문서)\s*(?:올려|추가|넣어)",
            r"자료\s*추가",
        ],
        ["project_id"],
        "project_add_source",
    ),
    (
        "report_generate",
        [
            r"(?:이\s*)?대화\s*기반\s*보고서",
            r"보고서\s*만들어",
            r"요약\s*보고서",
            r"(?:대화|대화).*보고서",
        ],
        ["conversation_id"],
        "report_generate",
    ),
    (
        "conversation_summary",
        [
            r"(?:최근|이)\s*(?:상대원|성수|.*구역).*대화\s*요약",
            r"(?:대화|대화).*요약",
            r"요약\s*(?:해\s*줘|해주세요)",
        ],
        ["query", "scope"],
        "conversation_summary",
    ),
    (
        "data_export",
        [
            r"내\s*(?:대화|대화)\s*데이터\s*다운로드",
            r"(?:대화|데이터)\s*(?:내보내기|export|다운로드)",
            r"대화\s*export",
        ],
        [],
        "data_export",
    ),
    (
        "new_conversation",
        [
            r"이\s*주제로\s*새\s*(?:분석|대화)\s*시작",
            r"새로\s*시작",
            r"새\s*대화\s*시작",
        ],
        [],
        "new_conversation",
    ),
]


def _normalize(text: str) -> str:
    if not text:
        return ""
    t = " ".join(text.split()).strip()
    return t


def _match_patterns(message: str) -> Optional[Tuple[str, float, Dict[str, Any], Optional[str]]]:
    """메시지에 대해 첫 번째로 매칭된 (intent, confidence, slots, suggested_tool) 반환."""
    normalized = _normalize(message)
    if not normalized:
        return None
    lower = normalized.lower()

    for intent, patterns, slot_names, suggested_tool in WORKSPACE_INTENT_PATTERNS:
        for p in patterns:
            if isinstance(p, str):
                if re.search(p, normalized, re.IGNORECASE | re.DOTALL):
                    # 슬롯은 간단히 메시지 일부 추출 (추후 NER/엔티티로 확장)
                    slots: Dict[str, Any] = {}
                    if "query" in slot_names:
                        slots["query"] = normalized
                    if "project_name" in slot_names or "topic" in slot_names:
                        # "OO 분석 프로젝트 만들어줘" → topic/project_name
                        m = re.search(r"(.+?)\s*(?:분석\s*)?(?:프로젝트|만들어)", normalized)
                        if m:
                            slots["project_name"] = slots["topic"] = m.group(1).strip()
                    if "conversation_id" in slot_names:
                        slots["conversation_id"] = None  # context에서 채움
                    return (intent, 0.75, slots, suggested_tool)
    return None


def detect_workspace_intent(
    message: str,
    context: Optional[Dict[str, Any]] = None,
    confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
) -> WorkspaceIntent:
    """
    사용자 메시지에 대한 워크스페이스 의도를 감지합니다.

    Returns:
        WorkspaceIntent: intent, confidence, slots, suggested_tool.
        confidence >= confidence_threshold 이면 도구 라우팅 후보.
    """
    context = context or {}
    normalized = _normalize(message)
    if not normalized:
        return WorkspaceIntent(
            intent="general_chat",
            confidence=0.0,
            raw_message=message,
            suggested_tool=None,
        )

    match = _match_patterns(normalized)
    if match:
        intent, conf, slots, tool = match
        # context에서 project_id, conversation_id 보강
        if context.get("project_id"):
            slots.setdefault("project_id", context["project_id"])
        if context.get("conversation_id"):
            slots.setdefault("conversation_id", context["conversation_id"])
        return WorkspaceIntent(
            intent=intent,
            confidence=conf,
            slots=slots,
            raw_message=message,
            suggested_tool=tool,
        )

    return WorkspaceIntent(
        intent="general_chat",
        confidence=0.0,
        slots={},
        raw_message=message,
        suggested_tool=None,
    )


def route_to_tool(intent_result: WorkspaceIntent) -> Optional[Dict[str, Any]]:
    """
    WorkspaceIntent를 기반으로 호출할 도구/API 정보를 반환합니다.

    Returns:
        {"tool": "project_create", "params": {...}} 형태 또는 None.
    """
    if intent_result.confidence < DEFAULT_CONFIDENCE_THRESHOLD or not intent_result.suggested_tool:
        return None
    return {
        "tool": intent_result.suggested_tool,
        "intent": intent_result.intent,
        "params": dict(intent_result.slots),
    }
