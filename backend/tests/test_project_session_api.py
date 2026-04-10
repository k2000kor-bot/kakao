"""
프로젝트/세션 API 테스트
"""

import pytest
import json
import os
from pathlib import Path
from fastapi.testclient import TestClient
import sys

# backend 경로 추가
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

try:
    from main_server import app
    APP_AVAILABLE = True
except ImportError:
    APP_AVAILABLE = False


@pytest.fixture
def client():
    """테스트 클라이언트 생성"""
    if not APP_AVAILABLE:
        pytest.skip("main_server를 import할 수 없습니다")
    return TestClient(app)


@pytest.fixture
def cleanup_test_data():
    """테스트 데이터 정리"""
    yield
    # 테스트 후 정리
    test_project_dir = Path("project_data/projects")
    if test_project_dir.exists():
        for file in test_project_dir.glob("test_*.json"):
            file.unlink()


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server를 사용할 수 없습니다")
class TestProjectAPI:
    """프로젝트 API 테스트"""

    def test_get_projects(self, client):
        """프로젝트 목록 조회 테스트"""
        response = client.get("/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert data["success"] is True
        assert "data" in data
        assert isinstance(data["data"], list)

    def test_get_projects_includes_source_count(self, client, cleanup_test_data):
        """프로젝트 목록 조회 시 각 프로젝트에 source_count가 포함된다 (Google NotebookLM 스타일)."""
        client.post(
            "/api/projects",
            json={"name": "소스수검증", "description": "d", "tags": [], "initial_guidelines": ["가이드"]},
        )
        response = client.get("/api/projects")
        assert response.status_code == 200
        projects = response.json().get("data", [])
        assert isinstance(projects, list)
        for p in projects:
            assert "source_count" in p
            assert isinstance(p["source_count"], int)

    def test_create_project(self, client, cleanup_test_data):
        """프로젝트 생성 테스트"""
        project_data = {
            "name": "테스트 프로젝트",
            "description": "테스트용 프로젝트",
            "tags": ["테스트", "개발"]
        }
        response = client.post("/api/projects", json=project_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert data["data"]["name"] == project_data["name"]
        assert "id" in data["data"]

    def test_get_project(self, client, cleanup_test_data):
        """특정 프로젝트 조회 테스트"""
        # 먼저 프로젝트 생성
        project_data = {
            "name": "조회 테스트 프로젝트",
            "description": "조회 테스트용"
        }
        create_response = client.post("/api/projects", json=project_data)
        assert create_response.status_code == 200
        project_id = create_response.json()["data"]["id"]

        # 프로젝트 조회
        response = client.get(f"/api/projects/{project_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == project_id
        assert data["data"]["name"] == project_data["name"]

    def test_update_project(self, client, cleanup_test_data):
        """프로젝트 업데이트 테스트"""
        # 먼저 프로젝트 생성
        project_data = {
            "name": "업데이트 테스트 프로젝트",
            "description": "원본 설명"
        }
        create_response = client.post("/api/projects", json=project_data)
        project_id = create_response.json()["data"]["id"]

        # 프로젝트 업데이트
        updates = {
            "name": "업데이트된 프로젝트",
            "description": "업데이트된 설명"
        }
        response = client.put(f"/api/projects/{project_id}", json=updates)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == updates["name"]

    def test_delete_project(self, client, cleanup_test_data):
        """프로젝트 삭제 테스트"""
        # 먼저 프로젝트 생성
        project_data = {
            "name": "삭제 테스트 프로젝트",
            "description": "삭제 테스트용"
        }
        create_response = client.post("/api/projects", json=project_data)
        project_id = create_response.json()["data"]["id"]

        # 프로젝트 삭제
        response = client.delete(f"/api/projects/{project_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # 삭제 확인
        get_response = client.get(f"/api/projects/{project_id}")
        assert get_response.status_code == 404

    def test_get_project_analytics(self, client, cleanup_test_data):
        """GET /api/projects/{id}/analytics — 프로젝트별 사용 통계 (세션·메시지·소스 수)"""
        project_data = {"name": "분석 테스트 프로젝트", "description": "분석 테스트용"}
        create_res = client.post("/api/projects", json=project_data)
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]

        res = client.get(f"/api/projects/{project_id}/analytics")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "data" in data
        d = data["data"]
        assert d["project_id"] == project_id
        assert d["project_name"] == project_data["name"]
        assert "session_count" in d
        assert "total_messages" in d
        assert "source_count" in d
        assert isinstance(d["session_count"], int)
        assert isinstance(d["total_messages"], int)
        assert isinstance(d["source_count"], int)

    def test_get_project_analytics_nonexistent_returns_404(self, client):
        """GET /api/projects/없는id/analytics → 404"""
        res = client.get("/api/projects/nonexistent-analytics-999/analytics")
        assert res.status_code == 404


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server를 사용할 수 없습니다")
class TestSessionAPI:
    """세션 API 테스트"""

    @pytest.fixture
    def test_project(self, client, cleanup_test_data):
        """테스트용 프로젝트 생성"""
        project_data = {
            "name": "세션 테스트 프로젝트",
            "description": "세션 테스트용"
        }
        response = client.post("/api/projects", json=project_data)
        return response.json()["data"]

    def test_get_sessions(self, client, test_project, cleanup_test_data):
        """프로젝트의 세션 목록 조회 테스트"""
        response = client.get(f"/api/projects/{test_project['id']}/sessions")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert isinstance(data["data"], list)

    def test_create_session(self, client, test_project, cleanup_test_data):
        """세션 생성 테스트"""
        session_data = {
            "projectId": test_project["id"],
            "name": "테스트 세션"
        }
        response = client.post("/api/sessions", json=session_data)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert data["data"]["name"] == session_data["name"]
        assert data["data"]["projectId"] == test_project["id"]
        assert "id" in data["data"]

    def test_get_session(self, client, test_project, cleanup_test_data):
        """특정 세션 조회 테스트"""
        # 먼저 세션 생성
        session_data = {
            "projectId": test_project["id"],
            "name": "조회 테스트 세션"
        }
        create_response = client.post("/api/sessions", json=session_data)
        session_id = create_response.json()["data"]["id"]

        # 세션 조회
        response = client.get(f"/api/sessions/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == session_id

    def test_update_session(self, client, test_project, cleanup_test_data):
        """세션 업데이트 테스트"""
        # 먼저 세션 생성
        session_data = {
            "projectId": test_project["id"],
            "name": "업데이트 테스트 세션"
        }
        create_response = client.post("/api/sessions", json=session_data)
        session_id = create_response.json()["data"]["id"]

        # 세션 업데이트
        updates = {
            "name": "업데이트된 세션"
        }
        response = client.put(f"/api/sessions/{session_id}", json=updates)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == updates["name"]

    def test_delete_session(self, client, test_project, cleanup_test_data):
        """세션 삭제 테스트"""
        # 먼저 세션 생성
        session_data = {
            "projectId": test_project["id"],
            "name": "삭제 테스트 세션"
        }
        create_response = client.post("/api/sessions", json=session_data)
        session_id = create_response.json()["data"]["id"]

        # 세션 삭제
        response = client.delete(f"/api/sessions/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # 삭제 확인
        get_response = client.get(f"/api/sessions/{session_id}")
        assert get_response.status_code == 404


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server를 사용할 수 없습니다")
class TestProjectSessionIntegration:
    """프로젝트-세션 통합 테스트"""

    def test_project_with_sessions(self, client, cleanup_test_data):
        """프로젝트와 세션 통합 테스트"""
        # 프로젝트 생성
        project_data = {
            "name": "통합 테스트 프로젝트",
            "description": "통합 테스트용"
        }
        project_response = client.post("/api/projects", json=project_data)
        project_id = project_response.json()["data"]["id"]

        # 세션 여러 개 생성
        session_names = ["세션 1", "세션 2", "세션 3"]
        created_sessions = []
        for name in session_names:
            session_data = {
                "projectId": project_id,
                "name": name
            }
            session_response = client.post("/api/sessions", json=session_data)
            created_sessions.append(session_response.json()["data"]["id"])

        # 프로젝트의 세션 목록 확인
        sessions_response = client.get(f"/api/projects/{project_id}/sessions")
        assert sessions_response.status_code == 200
        sessions_data = sessions_response.json()
        assert len(sessions_data["data"]) == len(session_names)

        # 프로젝트 삭제 시 세션도 함께 삭제되는지 확인 (현재는 수동 삭제 필요)
        # 이는 향후 개선 사항으로 남겨둠


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server를 사용할 수 없습니다")
class TestProjectNotebookContext:
    """프로젝트 노트북 LLM 컨텍스트 저장/조회 검증"""

    def test_create_project_with_guidelines_saves_notebook_context(self, client, cleanup_test_data):
        """프로젝트 생성 시 initial_guidelines를 넣으면 notebook-context에 저장되고 조회된다."""
        project_data = {
            "name": "노트북 LLM 검증 프로젝트",
            "description": "이 프로젝트는 재건축 분야만 다룹니다.",
            "tags": ["재건축", "검증"],
            "initial_guidelines": [
                "답변은 항상 존댓말로 작성한다.",
                "재건축 관련 법규만 인용한다.",
            ],
        }
        create_res = client.post("/api/projects", json=project_data)
        assert create_res.status_code == 200
        data = create_res.json()
        assert data.get("success") is True
        project_id = data["data"]["id"]

        # 노트북 컨텍스트 조회
        ctx_res = client.get(f"/api/projects/{project_id}/notebook-context")
        assert ctx_res.status_code == 200
        ctx_data = ctx_res.json()
        assert ctx_data.get("success") is True
        assert ctx_data["data"].get("has_context") is True
        context_text = ctx_data["data"].get("context", "")
        assert "재건축" in context_text
        assert "존댓말" in context_text or "재건축 관련 법규" in context_text
        # Google NotebookLM 스타일 그라운딩 구조 저장 검증
        assert "소스 기반 답변 지침" in context_text or "학습된 소스" in context_text

    def test_notebook_context_empty_when_no_project(self, client):
        """존재하지 않는 프로젝트의 notebook-context는 has_context: false 또는 빈 문자열."""
        ctx_res = client.get("/api/projects/nonexistent-id-12345/notebook-context")
        assert ctx_res.status_code == 200
        ctx_data = ctx_res.json()
        assert ctx_data.get("success") is True
        assert ctx_data["data"].get("has_context") is False or ctx_data["data"].get("context", "") == ""

    def test_chat_with_project_context_returns_200(self, client, cleanup_test_data):
        """프로젝트 생성 후 context.projectId를 넣고 POST /api/chat 호출 시 200 및 응답 본문 존재."""
        project_data = {
            "name": "대화 컨텍스트 검증 프로젝트",
            "description": "이 프로젝트는 대화 시 컨텍스트 검증용입니다.",
            "tags": ["검증"],
            "initial_guidelines": ["답변은 한 문장으로 끝낸다."],
        }
        create_res = client.post("/api/projects", json=project_data)
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]

        chat_res = client.post(
            "/api/chat",
            json={
                "message": "이 프로젝트의 목적이 뭔가요?",
                "quality": "enhanced",
                "context": {"projectId": project_id, "projectName": project_data["name"]},
            },
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert "response" in chat_data or "message" in chat_data or "content" in chat_data or "data" in chat_data
        text = chat_data.get("response") or chat_data.get("message") or chat_data.get("content")
        if not text and isinstance(chat_data.get("data"), dict):
            text = chat_data["data"].get("response") or chat_data["data"].get("message") or chat_data["data"].get("content")
        if not text:
            text = ""
        assert isinstance(text, str) and len(text.strip()) > 0

    def test_update_project_updates_notebook_context(self, client, cleanup_test_data):
        """프로젝트 수정 시 name/description/tags/initial_guidelines 변경하면 notebook-context가 갱신된다."""
        project_data = {
            "name": "수정 전 프로젝트",
            "description": "원본 설명",
            "tags": ["원본"],
            "initial_guidelines": ["원본 가이드라인만 사용한다."],
        }
        create_res = client.post("/api/projects", json=project_data)
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]

        ctx0 = client.get(f"/api/projects/{project_id}/notebook-context").json()
        assert ctx0.get("data", {}).get("has_context") is True
        assert "원본 가이드라인" in (ctx0.get("data") or {}).get("context", "")

        update_res = client.put(
            f"/api/projects/{project_id}",
            json={
                "name": "수정 후 프로젝트",
                "description": "수정된 설명",
                "tags": ["수정됨"],
                "initial_guidelines": ["원본 가이드라인만 사용한다.", "추가된 새 가이드라인 문구."],
            },
        )
        assert update_res.status_code == 200

        ctx1 = client.get(f"/api/projects/{project_id}/notebook-context").json()
        assert ctx1.get("data", {}).get("has_context") is True
        context_text = (ctx1.get("data") or {}).get("context", "")
        assert "추가된 새 가이드라인 문구" in context_text
        assert "수정된 설명" in context_text

    def test_delete_project_removes_notebook_context(self, client, cleanup_test_data):
        """프로젝트 삭제 시 해당 프로젝트의 notebook-context 파일도 함께 삭제된다."""
        project_data = {
            "name": "삭제 시 컨텍스트 제거 검증",
            "description": "삭제 테스트",
            "tags": ["삭제"],
            "initial_guidelines": ["삭제 전 가이드라인"],
        }
        create_res = client.post("/api/projects", json=project_data)
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]

        ctx_before = client.get(f"/api/projects/{project_id}/notebook-context").json()
        assert ctx_before.get("data", {}).get("has_context") is True

        del_res = client.delete(f"/api/projects/{project_id}")
        assert del_res.status_code == 200
        assert del_res.json().get("success") is True

        ctx_after = client.get(f"/api/projects/{project_id}/notebook-context").json()
        assert ctx_after.get("success") is True
        assert ctx_after.get("data", {}).get("has_context") is False

    def test_notebook_context_returns_source_count(self, client, cleanup_test_data):
        """notebook-context 조회 시 Google NotebookLM 스타일로 source_count가 포함된다."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "소스 개수 검증",
                "description": "설명",
                "tags": ["테스트"],
                "initial_guidelines": ["가이드 1"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        ctx_res = client.get(f"/api/projects/{project_id}/notebook-context")
        assert ctx_res.status_code == 200
        data = ctx_res.json().get("data", {})
        assert "source_count" in data
        assert isinstance(data["source_count"], int)
        assert data["source_count"] >= 1

    def test_notebook_studio_generate_returns_content(self, client, cleanup_test_data):
        """POST notebook-studio/generate 시 학습된 소스 기반으로 type별 콘텐츠가 반환된다."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "스튜디오 검증",
                "description": "요약 테스트용 설명입니다.",
                "tags": ["테스트"],
                "initial_guidelines": ["한 줄 가이드라인"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        gen_res = client.post(
            f"/api/projects/{project_id}/notebook-studio/generate",
            json={"type": "summary"},
        )
        assert gen_res.status_code == 200
        body = gen_res.json()
        assert body.get("success") is True
        assert "data" in body
        assert body["data"].get("type") == "summary"
        assert "content" in body["data"]
        assert isinstance(body["data"]["content"], str)

    def test_add_notebook_source_increases_source_count(self, client, cleanup_test_data):
        """POST notebook-sources로 소스 추가 시 source_count가 증가하고 context에 반영된다."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "소스 추가 검증",
                "description": "설명",
                "tags": [],
                "initial_guidelines": ["가이드"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]

        ctx0 = client.get(f"/api/projects/{project_id}/notebook-context").json()
        assert ctx0["data"]["source_count"] == 1

        add_res = client.post(
            f"/api/projects/{project_id}/notebook-sources",
            json={
                "title": "추가 문서",
                "content": "이 내용은 추가 소스에만 있는 고유 문구입니다.",
                "type": "text",
            },
        )
        assert add_res.status_code == 200
        add_data = add_res.json()
        assert add_data.get("success") is True
        assert "data" in add_data
        assert add_data["data"].get("source_count") == 2
        assert "source" in add_data["data"]
        assert add_data["data"]["source"].get("title") == "추가 문서"

        ctx1 = client.get(f"/api/projects/{project_id}/notebook-context").json()
        assert ctx1["data"]["source_count"] == 2
        assert "이 내용은 추가 소스에만 있는 고유 문구입니다." in ctx1["data"].get("context", "")

    def test_delete_notebook_source_decreases_count(self, client, cleanup_test_data):
        """DELETE notebook-sources/{source_id}로 추가 소스 삭제 시 source_count가 줄고 overview는 삭제 불가."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "소스 삭제 검증",
                "description": "설명",
                "tags": [],
                "initial_guidelines": ["가이드"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        add_res = client.post(
            f"/api/projects/{project_id}/notebook-sources",
            json={"title": "삭제할 소스", "content": "내용", "type": "text"},
        )
        assert add_res.status_code == 200
        source_id = add_res.json()["data"]["source"]["id"]

        del_overview = client.delete(
            f"/api/projects/{project_id}/notebook-sources/overview"
        )
        assert del_overview.status_code == 400

        del_res = client.delete(
            f"/api/projects/{project_id}/notebook-sources/{source_id}"
        )
        assert del_res.status_code == 200
        assert del_res.json().get("data", {}).get("source_count") == 1

        ctx = client.get(f"/api/projects/{project_id}/notebook-context").json()
        assert ctx["data"]["source_count"] == 1
        assert "삭제할 소스" not in ctx["data"].get("context", "")

    def test_notebook_studio_outputs_list_after_generate(self, client, cleanup_test_data):
        """스튜디오 생성 후 GET notebook-studio/outputs에 생성 이력이 포함된다."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "스튜디오 이력",
                "description": "이력 테스트",
                "tags": [],
                "initial_guidelines": ["가이드"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        gen_res = client.post(
            f"/api/projects/{project_id}/notebook-studio/generate",
            json={"type": "summary"},
        )
        assert gen_res.status_code == 200
        assert gen_res.json().get("data", {}).get("id") is not None
        list_res = client.get(f"/api/projects/{project_id}/notebook-studio/outputs")
        assert list_res.status_code == 200
        data = list_res.json().get("data", {})
        assert "outputs" in data
        assert data.get("count", 0) >= 1
        assert any(o.get("type") == "summary" for o in data.get("outputs", []))

    def test_notebook_suggested_questions_returns_200(self, client, cleanup_test_data):
        """GET notebook-suggested-questions는 소스가 있는 프로젝트에서 200과 questions 배열을 반환한다."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "추천질문",
                "description": "설명",
                "tags": [],
                "initial_guidelines": ["가이드"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        res = client.get(f"/api/projects/{project_id}/notebook-suggested-questions")
        assert res.status_code == 200
        assert "data" in res.json()
        assert "questions" in res.json()["data"]
        assert isinstance(res.json()["data"]["questions"], list)

    def test_notebook_llm_status_available_when_has_context(self, client, cleanup_test_data):
        """GET projects/{id}/notebook-llm/status는 컨텍스트가 있으면 available=True, models를 반환한다."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "노트북LLM 상태",
                "description": "d",
                "tags": [],
                "initial_guidelines": ["가이드라인"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        res = client.get(f"/api/projects/{project_id}/notebook-llm/status")
        assert res.status_code == 200
        data = res.json()
        assert data.get("success") is True
        assert "data" in data
        assert data["data"].get("available") is True
        assert "models" in data["data"]
        assert "project-notebook" in data["data"]["models"]

    def test_notebook_llm_status_404_for_nonexistent_project(self, client):
        """GET projects/{id}/notebook-llm/status는 존재하지 않는 프로젝트면 404."""
        res = client.get("/api/projects/nonexistent-123/notebook-llm/status")
        assert res.status_code == 404

    def test_notebook_llm_generate_returns_content(self, client, cleanup_test_data):
        """POST projects/{id}/notebook-llm/generate는 prompt에 대해 content를 반환한다."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "노트북LLM 생성",
                "description": "d",
                "tags": [],
                "initial_guidelines": ["재건축 가이드"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        res = client.post(
            f"/api/projects/{project_id}/notebook-llm/generate",
            json={"prompt": "요약해줘", "context": None},
        )
        assert res.status_code == 200
        data = res.json()
        assert data.get("success") is True
        assert "data" in data
        payload = data["data"]
        assert "content" in payload
        assert payload.get("modelUsed") == "project-notebook"
        assert "processingTime" in payload
        assert "timestamp" in payload

    def test_notebook_llm_generate_400_empty_prompt(self, client, cleanup_test_data):
        """POST notebook-llm/generate에 빈 prompt를 보내면 400."""
        create_res = client.post(
            "/api/projects",
            json={"name": "p", "description": "d", "tags": [], "initial_guidelines": ["g"]},
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        res = client.post(
            f"/api/projects/{project_id}/notebook-llm/generate",
            json={"prompt": "   ", "context": None},
        )
        assert res.status_code == 400

    def test_notebook_llm_stream_returns_ndjson(self, client, cleanup_test_data):
        """POST projects/{id}/notebook-llm/stream는 NDJSON 라인 스트림을 반환한다."""
        create_res = client.post(
            "/api/projects",
            json={
                "name": "스트림",
                "description": "d",
                "tags": [],
                "initial_guidelines": ["가이드"],
            },
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        res = client.post(
            f"/api/projects/{project_id}/notebook-llm/stream",
            json={"prompt": "요약", "context": None},
        )
        assert res.status_code == 200
        assert "application/x-ndjson" in res.headers.get("content-type", "")
        text = res.text
        lines = [ln for ln in text.strip().split("\n") if ln.strip()]
        assert len(lines) >= 1
        import json as _json
        last = _json.loads(lines[-1])
        assert last.get("done") is True

    def test_notebook_llm_stream_400_empty_prompt(self, client, cleanup_test_data):
        """POST notebook-llm/stream에 빈 prompt를 보내면 400."""
        create_res = client.post(
            "/api/projects",
            json={"name": "p", "description": "d", "tags": [], "initial_guidelines": ["g"]},
        )
        assert create_res.status_code == 200
        project_id = create_res.json()["data"]["id"]
        res = client.post(
            f"/api/projects/{project_id}/notebook-llm/stream",
            json={"prompt": "   ", "context": None},
        )
        assert res.status_code == 400

    def test_notebook_llm_stream_404_nonexistent_project(self, client):
        """POST notebook-llm/stream는 존재하지 않는 프로젝트면 404."""
        res = client.post(
            "/api/projects/nonexistent-id/notebook-llm/stream",
            json={"prompt": "요약", "context": None},
        )
        assert res.status_code == 404
