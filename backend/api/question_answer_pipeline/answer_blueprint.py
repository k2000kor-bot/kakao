# 규칙 기반 답변 개요(블루프린트) — LLM 없이 expert/장문 요청에 선행 구조 고정
# @see docs/architecture/EARLY_DEVELOPMENT_SEQUENCE.md Phase 2-2

from __future__ import annotations

from typing import Any, Dict, List

BLUEPRINT_TRIGGER_MIN_LEN = 420

_SCHEMA_SECTIONS = {
    "steps": [
        "배경·목적",
        "단계별 절차",
        "주의·전제",
        "참고 근거 위치",
    ],
    "checklist": [
        "검토 범위",
        "확인 항목 목록",
        "완료 기준",
    ],
    "table": [
        "비교 축 정의",
        "항목별 요약",
        "선택 시 고려사항",
    ],
    "narrative": [
        "핵심 결론(1~3문장)",
        "근거·맥락",
        "실행·후속 제안",
        "한계·추가 확인 사항",
    ],
}


def wants_blueprint_first(context_pack: Dict[str, Any], query: str) -> bool:
    """expert 모드·상세 스타일·장문·명시 플래그 시 블루프린트 선행."""
    if context_pack is None:
        return False
    if (context_pack.get("answer_mode") or "").strip().lower() == "expert":
        return True
    rab = context_pack.get("require_answer_blueprint")
    if rab is True or rab == 1:
        return True
    if isinstance(rab, str) and rab.strip().lower() in ("1", "true", "yes", "on"):
        return True
    rs = (context_pack.get("response_style") or "").strip().lower()
    if rs in ("detailed", "comprehensive"):
        return True
    q = (query or "").strip()
    if len(q) >= BLUEPRINT_TRIGGER_MIN_LEN:
        return True
    return False


def build_answer_blueprint_markdown(
    route_decision: Any,
    query: str,
    context_pack: Dict[str, Any],
) -> str:
    """
    라우팅 결과·질의 길이·한국어 장르를 반영한 고정 목차(초안).
    본문 생성 전에 Writer/LLM이 따를 뼈대로 사용.
    """
    schema = getattr(route_decision, "answer_schema", None) or "narrative"
    task = getattr(route_decision, "task_type", None) or "generate"
    sections: List[str] = list(_SCHEMA_SECTIONS.get(schema, _SCHEMA_SECTIONS["narrative"]))

    if task == "planning":
        sections = [
            "배경·목표·범위",
            "이해관계·제약",
            "선택지·비교",
            "권고·근거",
            "실행·일정·리스크",
        ]

    ko = context_pack.get("korean_understanding")
    genre = (ko.get("genre") if isinstance(ko, dict) else None) or ""
    if genre == "kakao_message":
        sections = ["한 줄 요지", "부드러운 말투 유지", "필요 시 한 문장 보완"]
    elif genre in ("legal_memo", "administrative"):
        sections = ["사실관계 요약", "적용 규정·근거", "리스크·주의", "권고·다음 조치"]

    lines = [
        "## 답변 개요 (블루프린트)",
        "",
        f"- **과업 유형**: `{task}`",
        f"- **권장 출력 스키마**: `{schema}`",
        f"- **질의 길이**: {len((query or '').strip())}자",
        "",
        "### 권장 섹션 순서",
    ]
    for i, title in enumerate(sections, 1):
        lines.append(f"{i}. {title}")
    lines.append("")
    lines.append(
        "*위 순서에 맞춰 본문을 구성하세요. 근거에 없는 새 사실은 추가하지 마세요.*"
    )
    return "\n".join(lines)
