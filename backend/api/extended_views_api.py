"""
도구 뷰용 Summary API — Search·Templates·Team·Learn·Workspace·Community·Billing
API.md §예정, src/views/README.md §목데이터→실 API 연동 로드맵
Workspace·Templates·Search는 프로젝트 데이터 기반 실 데이터. Team·Learn·Community·Billing은 목데이터(추후 교체 가능).
"""
import logging
from datetime import datetime

from fastapi import APIRouter

from api.project_session_api import load_all_projects

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["extended-views"])

# 기본 카테고리 (프로젝트 태그 없을 때 사용)
DEFAULT_TEMPLATE_CATEGORIES = ["도시정비·재개발", "일반 업무", "회의·문서"]


@router.get("/search/summary")
async def get_search_summary():
    """검색 뷰 요약 — SearchView. 프로젝트명을 최근 검색 제안으로 포함."""
    recent_queries: list[str] = []
    try:
        projects = load_all_projects()
        for p in projects[:5]:  # 최대 5개
            name = (p.get("name") or "").strip()
            if name:
                recent_queries.append(name)
    except Exception as e:
        logger.warning("검색 요약 프로젝트 로드 실패: %s", e)
    return {
        "success": True,
        "data": {
            "searchTarget": "대화·프로젝트·문서",
            "recentQueries": recent_queries,
        },
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/templates/summary")
async def get_templates_summary():
    """템플릿 뷰 요약 — TemplatesView. 프로젝트 태그 기반 카테고리 보강."""
    categories = set(DEFAULT_TEMPLATE_CATEGORIES)
    try:
        projects = load_all_projects()
        for p in projects:
            for tag in (p.get("tags") or []):
                if tag and isinstance(tag, str):
                    categories.add(tag.strip())
    except Exception as e:
        logger.warning("템플릿 요약 프로젝트 로드 실패(기본값 사용): %s", e)
    return {
        "success": True,
        "data": {
            "categories": sorted(categories),
            "favoritesCount": 0,
        },
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/team/summary")
async def get_team_summary():
    """팀 뷰 요약 — TeamView"""
    return {
        "success": True,
        "data": {
            "memberCount": 1,
            "role": "관리자",
        },
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/learn/summary")
async def get_learn_summary():
    """학습 뷰 요약 — LearnView"""
    return {
        "success": True,
        "data": {
            "progressPercent": 0,
            "completedCourses": 0,
        },
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/workspace/summary")
async def get_workspace_summary():
    """워크스페이스 뷰 요약 — WorkspaceView. 프로젝트 데이터 기반 실 데이터."""
    workspace_count = 0
    current_name = "기본"
    try:
        projects = load_all_projects()
        workspace_count = len(projects)
        if projects:
            # 최근 수정순 첫 프로젝트를 현재 워크스페이스로
            by_updated = sorted(
                projects,
                key=lambda p: p.get("updatedAt") or p.get("createdAt") or "",
                reverse=True,
            )
            current_name = by_updated[0].get("name") or "기본"
    except Exception as e:
        logger.warning("워크스페이스 요약 프로젝트 로드 실패(기본값 사용): %s", e)
    return {
        "success": True,
        "data": {
            "workspaceCount": max(workspace_count, 1) if workspace_count > 0 else 1,
            "currentName": current_name,
        },
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/community/summary")
async def get_community_summary():
    """커뮤니티 뷰 요약 — CommunityView"""
    return {
        "success": True,
        "data": {
            "topicCount": 0,
            "recentPostLabel": "—",
        },
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/billing/summary")
async def get_billing_summary():
    """구독 뷰 요약 — BillingView"""
    return {
        "success": True,
        "data": {
            "currentPlan": "무료",
            "nextBillingDate": None,
        },
        "timestamp": datetime.now().isoformat(),
    }
