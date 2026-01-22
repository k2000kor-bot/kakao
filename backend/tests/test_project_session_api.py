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
