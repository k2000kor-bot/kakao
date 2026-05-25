"""workspace_intent_router — 프로젝트 대화 중 project_create 억제"""

from api.workspace_intent_router import (
    WorkspaceIntent,
    detect_workspace_intent,
    route_to_tool,
)


def test_route_to_tool_suppresses_project_create_when_project_id_in_context() -> None:
    wi = WorkspaceIntent(
        intent="project_create",
        confidence=0.75,
        slots={"project_name": "성수4지구"},
        suggested_tool="project_create",
    )
    assert route_to_tool(wi, {"projectId": "proj-existing"}) is None


def test_route_to_tool_allows_project_create_without_active_project() -> None:
    wi = WorkspaceIntent(
        intent="project_create",
        confidence=0.75,
        slots={"project_name": "성수4지구"},
        suggested_tool="project_create",
    )
    route = route_to_tool(wi, {})
    assert route is not None
    assert route.get("tool") == "project_create"


def test_loose_project_mention_does_not_trigger_project_create() -> None:
    wi = detect_workspace_intent(
        "이 프로젝트 지침에 맞춰 보고서를 생성해 주세요.",
        context={"projectId": "proj-1"},
    )
    assert wi.intent != "project_create" or route_to_tool(wi, {"projectId": "proj-1"}) is None
