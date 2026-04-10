# -*- coding: utf-8 -*-
"""
AI Workspace 도구 실행기.

_workspace_tool_route가 설정된 경우 해당 API를 호출하고 결과를 반환.
연동: unified_chat_api.generate_chat_response() 내부에서 호출.
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


async def execute_workspace_tool(
    route: Dict[str, Any],
    context: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    """
    route = { "tool": "project_create", "intent": "...", "params": {...} }
    성공 시 { "success": True, "tool": "...", "data": {...}, "message": "사용자에게 보여줄 문구" }
    실패 시 { "success": False, "tool": "...", "error": "...", "message": "..." }
    """
    if not route or not isinstance(route, dict):
        return None
    tool = route.get("tool")
    params = route.get("params") or {}
    context = context or {}

    if tool == "project_create":
        return await _execute_project_create(params, context)
    if tool == "new_conversation":
        return _execute_new_conversation(params, context)
    # 나머지 도구는 추후 연동 (conversation_search, report_generate, data_export 등)
    if tool in ("conversation_search", "report_generate", "conversation_summary", "data_export", "project_add_source"):
        return _stub_tool_result(tool, params)
    return None


async def _execute_project_create(params: Dict[str, Any], context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """프로젝트 생성 API 호출."""
    name = (params.get("project_name") or params.get("topic") or "").strip()
    if not name:
        name = "새 프로젝트"
    try:
        from api.project_session_api import create_project, ProjectCreate

        body = ProjectCreate(name=name, description="", tags=[])
        result = await create_project(body)
        if result and result.get("success") and result.get("data"):
            data = result["data"]
            project_id = data.get("id", "")
            project_name = data.get("name", name)
            return {
                "success": True,
                "tool": "project_create",
                "data": {
                    "project_id": project_id,
                    "name": project_name,
                    "description": data.get("description", ""),
                },
                "message": f"프로젝트 '{project_name}'이(가) 생성되었습니다. 사이드바에서 선택해 대화를 이어가세요.",
            }
        return {
            "success": False,
            "tool": "project_create",
            "error": "create_project returned no data",
            "message": "프로젝트 생성에 실패했습니다. 다시 시도해 주세요.",
        }
    except Exception as e:
        logger.warning("workspace tool project_create failed: %s", e)
        return {
            "success": False,
            "tool": "project_create",
            "error": str(e),
            "message": "프로젝트 생성 중 오류가 발생했습니다. 다시 시도해 주세요.",
        }


def _execute_new_conversation(params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """새 대화 시작은 프론트에서 처리; 백엔드는 안내만 반환."""
    return {
        "success": True,
        "tool": "new_conversation",
        "data": {},
        "message": "새 대화를 시작하려면 상단 '새대화' 버튼을 누르거나 Ctrl+N을 사용하세요.",
    }


def _stub_tool_result(tool: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """아직 미구현 도구: 안내 메시지 반환."""
    stub_messages = {
        "conversation_search": "대화 검색 기능은 준비 중입니다. 상단 검색창에서 키워드로 필터링해 보세요.",
        "report_generate": "대화 기반 보고서 생성 기능은 준비 중입니다.",
        "conversation_summary": "대화 요약 기능은 준비 중입니다.",
        "data_export": "데이터 내보내기 기능은 준비 중입니다. 설정에서 이용 가능할 예정입니다.",
        "project_add_source": "이 프로젝트에 자료를 추가하려면 프로젝트 설정의 소스 탭을 이용해 주세요.",
    }
    return {
        "success": False,
        "tool": tool,
        "data": {},
        "message": stub_messages.get(tool, "해당 기능은 준비 중입니다."),
    }
