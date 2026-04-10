"""extended_views_api 테스트 — 도구 뷰 Summary API"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from api.extended_views_api import router, DEFAULT_TEMPLATE_CATEGORIES
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)


@pytest.fixture
def client():
    return TestClient(app)


def test_get_search_summary(client):
    r = client.get("/api/search/summary")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    data = j.get("data", {})
    assert "searchTarget" in data
    assert "recentQueries" in data


def test_get_templates_summary(client):
    r = client.get("/api/templates/summary")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    data = j.get("data", {})
    assert "categories" in data
    assert "favoritesCount" in data


def test_get_team_summary(client):
    r = client.get("/api/team/summary")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    data = j.get("data", {})
    assert "memberCount" in data
    assert "role" in data


def test_get_learn_summary(client):
    r = client.get("/api/learn/summary")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    data = j.get("data", {})
    assert "progressPercent" in data
    assert "completedCourses" in data


def test_get_workspace_summary(client):
    r = client.get("/api/workspace/summary")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    data = j.get("data", {})
    assert "workspaceCount" in data
    assert "currentName" in data


def test_get_community_summary(client):
    r = client.get("/api/community/summary")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    data = j.get("data", {})
    assert "topicCount" in data
    assert "recentPostLabel" in data


def test_get_billing_summary(client):
    r = client.get("/api/billing/summary")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    data = j.get("data", {})
    assert "currentPlan" in data
    assert "nextBillingDate" in data


@patch("api.extended_views_api.load_all_projects")
def test_workspace_summary_real_data(mock_load, client):
    """WorkspaceView: 프로젝트가 있으면 실 데이터 반환"""
    mock_load.return_value = [
        {"id": "p1", "name": "프로젝트 A", "updatedAt": "2026-01-02", "createdAt": "2026-01-01"},
        {"id": "p2", "name": "프로젝트 B", "updatedAt": "2026-01-03", "createdAt": "2026-01-02"},
    ]
    r = client.get("/api/workspace/summary")
    assert r.status_code == 200
    data = r.json().get("data", {})
    assert data["workspaceCount"] == 2
    assert data["currentName"] == "프로젝트 B"  # 최신 updatedAt 순


@patch("api.extended_views_api.load_all_projects")
def test_search_summary_real_data(mock_load, client):
    """SearchView: 프로젝트가 있으면 프로젝트명을 recentQueries에 포함"""
    mock_load.return_value = [
        {"id": "p1", "name": "프로젝트 A"},
        {"id": "p2", "name": "프로젝트 B"},
    ]
    r = client.get("/api/search/summary")
    assert r.status_code == 200
    data = r.json().get("data", {})
    assert data["searchTarget"] == "대화·프로젝트·문서"
    assert "recentQueries" in data
    assert "프로젝트 A" in data["recentQueries"]
    assert "프로젝트 B" in data["recentQueries"]


@patch("api.extended_views_api.load_all_projects")
def test_templates_summary_real_categories(mock_load, client):
    """TemplatesView: 프로젝트 태그가 있으면 카테고리에 포함"""
    mock_load.return_value = [
        {"tags": ["도시정비", "재건축"]},
        {"tags": ["회의록", "도시정비"]},
    ]
    r = client.get("/api/templates/summary")
    assert r.status_code == 200
    data = r.json().get("data", {})
    assert "categories" in data
    cats = set(data["categories"])
    assert "도시정비" in cats
    assert "재건축" in cats
    assert "회의록" in cats
    for d in DEFAULT_TEMPLATE_CATEGORIES:
        assert d in cats
