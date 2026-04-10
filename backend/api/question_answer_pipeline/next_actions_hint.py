# 파이프라인 완료 후 사용자가 이어가기 좋은 행동 제안 (경량 휴리스틱)
# @see docs/architecture/GENSPARK_REPO_IMPLEMENTATION_ORDER.md 단계 4

from __future__ import annotations

from typing import Any, Dict, List, Optional


def suggest_next_actions(
    route_decision: Any,
    query: str,
    *,
    verification_pass: bool = True,
    evidence_coverage: float = 0.0,
    korean_genre: Optional[str] = None,
) -> List[str]:
    """task_type·도메인·검증·한국어 장르에 따른 후속 액션 문자열 목록."""
    task = (getattr(route_decision, "task_type", None) or "generate").strip()
    domains = getattr(route_decision, "domain", None) or []
    if not isinstance(domains, list):
        domains = []
    q = (query or "").strip()

    if not q:
        return [
            "구체적인 질문이나 요청을 한두 문장으로 입력해 보기",
            "프로젝트에 참고 파일을 올린 뒤 같은 주제로 질문해 보기",
        ]

    actions: List[str] = []

    if task == "fact_check":
        actions.append("동일 주제로 반대 관점·재반박 문단을 요청해 보기")
        actions.append("출처 링크·문서명을 구체적으로 달라고 요청해 보기")
    elif task == "summarize":
        actions.append("요약을 카톡/공지/보고서 형식으로 다시 써 달라고 요청해 보기")
        actions.append("핵심만 3불릿으로 압축해 달라고 요청해 보기")
    elif task == "compare":
        actions.append("표 형식으로만 다시 정리해 달라고 요청해 보기")
        actions.append("의사결정 기준(가중치)을 정해 추천을 물어보기")
    elif task == "how_to":
        actions.append("실행 체크리스트 형태로 바꿔 달라고 요청해 보기")
        actions.append("초보자용·전문가용 두 버전을 비교해 달라고 요청해 보기")
    elif task == "planning":
        actions.append("일정·마일스톤을 표로 정리해 달라고 요청해 보기")
        actions.append("예산·리소스 가정을 밝히고 민감도(낙관/비관) 시나리오를 요청해 보기")
        actions.append("이해관계자별 커뮤니케이션 포인트만 따로 정리해 달라고 요청해 보기")
    else:
        actions.append("이번 답을 바탕으로 실행 계획(일정·담당) 초안을 요청해 보기")
        actions.append("빠진 전제나 리스크를 짚어 달라고 요청해 보기")

    if "law" in domains or korean_genre in ("legal_memo", "administrative"):
        actions.append("실제 법률 자문이 필요한지, 검토 포인트만 정리해 달라고 요청해 보기")
    if "real_estate" in domains:
        actions.append("입주민·조합원에게 보낼 안내 문안으로 다듬어 달라고 요청해 보기")
    if "dev" in domains:
        actions.append("API·엔드포인트·에러 처리 예시를 코드 블록으로만 정리해 달라고 요청해 보기")

    if not verification_pass or evidence_coverage < 0.35:
        actions.append("프로젝트에 참고 파일을 올린 뒤 같은 질문을 다시 물어보기")

    if korean_genre == "kakao_message":
        actions.append("톤을 더 부드럽게/더 단호하게 조정해 달라고 요청해 보기")

    # 중복 제거·순서 유지
    seen = set()
    out: List[str] = []
    for a in actions:
        if a not in seen:
            seen.add(a)
            out.append(a)
        if len(out) >= 5:
            break

    if len(q) > 300 and len(out) < 5:
        out.append("질문을 한 문장으로 쪼개서 단계별로 다시 질문해 보기")

    return out[:5]
