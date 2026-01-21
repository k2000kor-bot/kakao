import sys
import os

# 백엔드 경로 추가
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient

# 앱 임포트
try:
    from ultimate_media_knowledge_system import app
    APP_AVAILABLE = True
except ImportError as e:
    APP_AVAILABLE = False
    app = None
    print(f"Warning: Could not import ultimate_media_knowledge_system: {e}")

import pytest

if APP_AVAILABLE:
    client = TestClient(app)
else:
    client = None


@pytest.mark.skipif(not APP_AVAILABLE, reason="ultimate_media_knowledge_system not available")
def test_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data.get("status") == "healthy"


@pytest.mark.skipif(not APP_AVAILABLE, reason="ultimate_media_knowledge_system not available")
def test_analyze_media_text_file(tmp_path):
    # 샘플 텍스트 파일 생성
    sample = tmp_path / "sample.txt"
    sample.write_text("이것은 테스트 문서입니다.")

    with open(sample, "rb") as f:
        files = {"file": (sample.name, f, "text/plain")}
        data = {"project_id": "test_project"}
        res = client.post("/api/v1/analyze-media", files=files, data=data)

    assert res.status_code == 200
    data = res.json()
    assert data["file_analysis"]["media_type"] == "document"
    assert "extracted_knowledge" in data


@pytest.mark.skipif(not APP_AVAILABLE, reason="ultimate_media_knowledge_system not available")
def test_knowledge_base_and_learning_history_flow():
    project_id = "test_project"

    # 지식 베이스 조회 (최초는 0)
    kb_res = client.get(f"/api/v1/knowledge-base/{project_id}")
    assert kb_res.status_code == 200
    kb_data = kb_res.json()
    assert kb_data["project_id"] == project_id

    # 학습 히스토리 조회
    hist_res = client.get(f"/api/v1/learning-history/{project_id}")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert hist_data["project_id"] == project_id


@pytest.mark.skipif(not APP_AVAILABLE, reason="ultimate_media_knowledge_system not available")
def test_persuasion_from_text():
    payload = {"text": "설득력 있는 메시지를 만들어줘", "source_type": "text"}
    res = client.post("/api/v1/persuasion", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "persuasive_content" in data
    assert "extracted_knowledge" in data


@pytest.mark.skipif(not APP_AVAILABLE, reason="ultimate_media_knowledge_system not available")
def test_search_knowledge_with_filters():
    params = {
        "project_id": "test_project",
        "q": "문서",
        "min_confidence": 0.0,
        "limit": 5,
        "start": "2000-01-01T00:00:00Z",
        "end": "2100-01-01T00:00:00Z",
        "order": "asc",
    }
    res = client.get("/api/v1/search-knowledge", params=params)
    assert res.status_code == 200
    data = res.json()
    assert data["project_id"] == params["project_id"]
    assert "matches" in data


@pytest.mark.skipif(not APP_AVAILABLE, reason="ultimate_media_knowledge_system not available")
def test_clear_project_knowledge():
    project_id = "test_project"
    res = client.delete(f"/api/v1/knowledge-base/{project_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["project_id"] == project_id
    assert data["status"] == "cleared"


@pytest.mark.skipif(not APP_AVAILABLE, reason="ultimate_media_knowledge_system not available")
def test_export_knowledge_json_and_csv():
    project_id = "test_project"
    # 먼저 검색으로 데이터 경로 동작 확인 (빈이어도 200)
    res_json = client.get(
        f"/api/v1/knowledge-export/{project_id}",
        params={
            "format": "json",
            "q": "문서",
            "start": "2000-01-01T00:00:00Z",
            "end": "2100-01-01T00:00:00Z",
            "order": "asc",
            "limit": 5,
        },
    )
    assert res_json.status_code == 200
    assert res_json.headers.get("content-disposition", "").startswith("attachment;")

    res_csv = client.get(
        f"/api/v1/knowledge-export/{project_id}",
        params={
            "format": "csv",
            "q": "문서",
            "start": "2000-01-01T00:00:00Z",
            "end": "2100-01-01T00:00:00Z",
            "order": "asc",
            "limit": 5,
        },
    )
    assert res_csv.status_code == 200
    assert res_csv.headers.get("content-type", "").startswith("text/csv")
