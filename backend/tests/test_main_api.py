"""
main.py Flask API 테스트
"""

import io
import pytest
import json
import sys
from pathlib import Path

# backend 경로 추가
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

try:
    from api.main import app
    APP_AVAILABLE = True
except ImportError:
    APP_AVAILABLE = False


@pytest.fixture
def client():
    """테스트 클라이언트 생성"""
    if not APP_AVAILABLE:
        pytest.skip("main.py를 import할 수 없습니다")
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestIntegratedAPI:
    """통합 API 테스트"""

    def test_health_check(self, client):
        """헬스 체크 테스트: 응답 구조 및 data.status, data.service 검증"""
        response = client.get("/api/integrated/health")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        assert "timestamp" in data
        payload = data["data"]
        assert "status" in payload
        assert payload["status"] == "healthy"
        assert "service" in payload
        assert "CORBU" in payload["service"]

    def test_get_status(self, client):
        """시스템 상태 조회 테스트: 응답 구조 및 data 검증"""
        response = client.get("/api/integrated/status")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        assert "timestamp" in data
        assert isinstance(data["data"], dict)

    def test_get_metrics(self, client):
        """성능 메트릭 조회 테스트: 응답 구조 및 data.metrics 검증"""
        response = client.get("/api/integrated/metrics")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        assert "metrics" in data["data"]
        assert isinstance(data["data"]["metrics"], (list, dict))

    def test_get_analytics(self, client):
        """분석 대시보드 데이터 조회 테스트: 응답 구조 검증"""
        response = client.get("/api/integrated/analytics")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        assert "timestamp" in data
        assert isinstance(data["data"], dict)

    def test_get_logs(self, client):
        """시스템 로그 조회 테스트: 응답 구조 및 data.logs, data.total_count 검증"""
        response = client.get("/api/integrated/logs")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        assert "logs" in data["data"]
        assert "total_count" in data["data"]
        assert isinstance(data["data"]["logs"], list)
        assert isinstance(data["data"]["total_count"], int)

    def test_get_logs_pagination(self, client):
        """시스템 로그 페이지네이션: limit, offset 쿼리 검증"""
        r = client.get("/api/integrated/logs?limit=2&offset=1")
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d["success"] is True
        assert len(d["data"]["logs"]) <= 2
        assert d["data"]["total_count"] >= 0

    def test_get_dashboard(self, client):
        """대시보드 일괄 조회: health, status, metrics, analytics_summary, recent_logs 검증"""
        response = client.get("/api/integrated/dashboard")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        payload = data["data"]
        assert "health" in payload
        assert "status" in payload
        assert "metrics" in payload
        assert "analytics_summary" in payload
        assert "recent_logs" in payload
        assert payload["health"].get("status") == "healthy"
        assert isinstance(payload["recent_logs"], list)

    def test_dashboard_logs_limit_param(self, client):
        """대시보드 logs_limit 쿼리: recent_logs 개수 제한 검증"""
        r = client.get("/api/integrated/dashboard?logs_limit=3")
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d["success"] is True
        assert len(d["data"]["recent_logs"]) <= 3

    def test_logs_limit_clamp(self, client):
        """로그 limit 최대 100 클램프: limit=200 요청 시 최대 100개 반환"""
        r = client.get("/api/integrated/logs?limit=200&offset=0")
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d["success"] is True
        assert len(d["data"]["logs"]) <= 100

    def test_response_includes_request_id(self, client):
        """성공 응답 본문에 request_id 포함 (헤더 X-Request-Id와 동일 값)."""
        r = client.get("/api/integrated/health")
        assert r.status_code == 200
        d = json.loads(r.data)
        assert d["success"] is True
        assert "request_id" in d
        if r.headers.get("X-Request-Id"):
            assert d["request_id"] == r.headers.get("X-Request-Id")


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestAnalyzeAPI:
    """메시지 분석 API 테스트"""

    def test_analyze_message_success(self, client):
        """메시지 분석 성공 테스트 (200, Content-Type application/json)"""
        payload = {"message": "안녕하세요! 좋은 하루네요!"}
        response = client.post(
            "/api/integrated/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_analyze_message_missing_field(self, client):
        """필수 필드 누락 테스트 (400, Content-Type application/json)"""
        payload = {}
        response = client.post(
            "/api/integrated/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_analyze_message_empty_message(self, client):
        """빈 메시지 테스트 (400, Content-Type application/json)"""
        payload = {"message": ""}
        response = client.post(
            "/api/integrated/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestCreativeAPI:
    """창작 콘텐츠 API 테스트"""

    def test_generate_story(self, client):
        """스토리 생성 테스트 (200, Content-Type application/json)"""
        payload = {"genre": "romance", "theme": "사랑", "length": "short"}
        response = client.post(
            "/api/integrated/creative/story",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_generate_poem(self, client):
        """시 생성 테스트 (200, Content-Type application/json)"""
        payload = {"type": "lyric", "theme": "사랑"}
        response = client.post(
            "/api/integrated/creative/poem",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_analyze_writing(self, client):
        """글쓰기 분석 테스트 (200, Content-Type application/json)"""
        payload = {"text": "이것은 테스트 텍스트입니다."}
        response = client.post(
            "/api/integrated/creative/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_analyze_writing_missing_field(self, client):
        """글쓰기 분석 필수 필드 누락 테스트 (400, Content-Type application/json)"""
        payload = {}
        response = client.post(
            "/api/integrated/creative/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestRootEndpoints:
    """루트·favicon 엔드포인트 테스트"""

    def test_root_returns_200_and_service_info(self, client):
        """GET / → 200, service/version/message 포함, Content-Type application/json"""
        response = client.get("/")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "data" in data
        assert "CORBU" in (data["data"].get("service") or "")
        assert "version" in data["data"]
        assert "message" in data["data"]

    def test_favicon_returns_204(self, client):
        """GET /favicon.ico → 204 No Content"""
        response = client.get("/favicon.ico")
        assert response.status_code == 204


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestHealthAPI:
    """헬스 체크 API (/api/health) 테스트"""

    def test_api_health_returns_200(self, client):
        """GET /api/health → 200, status/version/uptime_seconds, Content-Type application/json"""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        d = data["data"]
        assert d.get("status") == "healthy"
        assert "version" in d
        assert "uptime_seconds" in d
        assert isinstance(d["uptime_seconds"], (int, float))

    def test_api_health_response_headers(self, client):
        """GET /api/health 응답에 X-Request-Id, X-Response-Time-Ms 헤더 포함"""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert "X-Request-Id" in response.headers
        assert "X-Response-Time-Ms" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        try:
            int(response.headers["X-Response-Time-Ms"])
        except ValueError:
            pytest.fail("X-Response-Time-Ms must be numeric")

    def test_api_status_returns_200_and_tts_projects_uptime(self, client):
        """GET /api/status → 200, data에 tts·projects·uptime_seconds 포함 (프론트 useApiStatus용), Content-Type application/json"""
        response = client.get("/api/status")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "data" in data
        d = data["data"]
        assert "tts" in d and isinstance(d["tts"], dict)
        assert "speech" in d["tts"]
        assert "projects" in d
        assert "uptime_seconds" in d
        assert isinstance(d["uptime_seconds"], (int, float))

    def test_api_status_response_headers(self, client):
        """GET /api/status 응답에 X-Request-Id, X-Response-Time-Ms 헤더 포함"""
        response = client.get("/api/status")
        assert response.status_code == 200
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers
        try:
            int(response.headers["X-Response-Time-Ms"])
        except ValueError:
            pytest.fail("X-Response-Time-Ms must be numeric")


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestApiDocs:
    """API 문서 엔드포인트 (/api, /api/openapi.json, /api/docs) 테스트"""

    def test_api_index_includes_docs_links(self, client):
        """GET /api → 200, data에 docs·openapi_json 링크 포함, Content-Type application/json"""
        response = client.get("/api")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "data" in data
        assert data["data"].get("docs") == "/api/docs"
        assert data["data"].get("openapi_json") == "/api/openapi.json"
        assert "endpoints" in data["data"]
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers

    def test_openapi_json_returns_200_and_spec(self, client):
        """GET /api/openapi.json → 200, openapi 3.0 스펙, Content-Type application/json"""
        response = client.get("/api/openapi.json")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("openapi", "").startswith("3.0")
        assert "info" in data and data["info"].get("title")
        assert "paths" in data
        assert "/api/health" in data["paths"]
        assert "/api/tts/script-style/analyze" in data["paths"]
        assert "/api/tts/situations" in data["paths"]
        assert "/api/projects/{project_id}" in data["paths"]
        project_id_path = data["paths"]["/api/projects/{project_id}"]
        assert "get" in project_id_path and "put" in project_id_path and "delete" in project_id_path
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers

    def test_docs_returns_html(self, client):
        """GET /api/docs → 200, HTML (Swagger UI)"""
        response = client.get("/api/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("Content-Type", "")
        body = response.data.decode("utf-8")
        assert "swagger-ui" in body or "SwaggerUIBundle" in body
        assert "/api/openapi.json" in body


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestProjectsAPI:
    """프로젝트 API (GET/POST /api/projects, GET/PUT/DELETE /api/projects/<id>) 검증 테스트"""

    def test_projects_list_returns_200_or_503(self, client):
        """GET /api/projects → 200(목록) 또는 503(API 미사용 가능), Content-Type application/json"""
        response = client.get("/api/projects")
        assert response.status_code in [200, 503]
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert "success" in data
        if response.status_code == 200:
            assert data.get("success") is True
            assert "data" in data
            payload = data["data"]
            assert "data" in payload
            assert "count" in payload
            assert isinstance(payload["data"], list)
            assert isinstance(payload["count"], int)
            assert "X-Request-Id" in response.headers
            assert response.headers["X-Request-Id"].strip() != ""
            assert "X-Response-Time-Ms" in response.headers
        else:
            assert data.get("success") is False
            assert "error" in data or "detail" in data

    def test_projects_create_returns_200_or_503(self, client):
        """POST /api/projects → 200(생성됨) 또는 503(API 미사용 가능), Content-Type application/json"""
        response = client.post(
            "/api/projects",
            data=json.dumps({"name": "E2E 테스트 프로젝트"}),
            content_type="application/json",
        )
        assert response.status_code in [200, 503]
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert "success" in data
        if response.status_code == 200:
            assert data.get("success") is True
            assert "data" in data
            payload = data["data"]
            assert "data" in payload
            proj = payload["data"]
            assert "id" in proj and "name" in proj
        else:
            assert data.get("success") is False
            assert "error" in data or "detail" in data

    def test_projects_get_nonexistent_returns_404_or_503(self, client):
        """GET /api/projects/<없는 id> → 404(찾을 수 없음) 또는 503(API 미사용), Content-Type application/json"""
        response = client.get("/api/projects/nonexistent-project-id-99999")
        assert response.status_code in [404, 503]
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False
        assert "error" in data or "detail" in data

    def test_projects_delete_nonexistent_returns_404_or_503(self, client):
        """DELETE /api/projects/<없는 id> → 404(찾을 수 없음) 또는 503(API 미사용), Content-Type application/json"""
        response = client.delete("/api/projects/nonexistent-project-id-99999")
        assert response.status_code in [404, 503]
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False
        assert "error" in data or "detail" in data

    def test_projects_put_nonexistent_returns_404_or_503(self, client):
        """PUT /api/projects/<없는 id> → 404(찾을 수 없음) 또는 503(API 미사용), Content-Type application/json"""
        response = client.put(
            "/api/projects/nonexistent-project-id-99999",
            data=json.dumps({"name": "업데이트 이름"}),
            content_type="application/json",
        )
        assert response.status_code in [404, 503]
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False
        assert "error" in data or "detail" in data

    def test_project_files_upload_no_file_returns_400(self, client):
        """POST /api/projects/<id>/files (파일 없음) → 400, Content-Type application/json"""
        response = client.post(
            "/api/projects/some-project-id/files",
            data={},
            content_type="multipart/form-data",
        )
        assert response.status_code in [400, 404, 503]
        if response.status_code == 400:
            data = json.loads(response.data)
            assert data.get("success") is False
            assert "error" in data or "detail" in data

    def test_project_files_upload_nonexistent_returns_404_or_503(self, client):
        """POST /api/projects/<없는 id>/files (파일 있음) → 404 또는 503"""
        from io import BytesIO

        data = {"file": (BytesIO(b"test content"), "doc.pdf")}
        response = client.post(
            "/api/projects/nonexistent-project-id-99999/files",
            data=data,
        )
        assert response.status_code in [404, 503]
        assert "application/json" in response.headers.get("Content-Type", "")
        resp = json.loads(response.data)
        assert resp.get("success") is False

    def test_project_files_upload_success_returns_200_with_file_entry(self, client):
        """POST /api/projects/<id>/files (프로젝트 존재, 파일 있음) → 200, data.file 메타데이터 반환"""
        from io import BytesIO

        create_resp = client.post(
            "/api/projects",
            data=json.dumps({"name": "파일 업로드 테스트 프로젝트"}),
            content_type="application/json",
        )
        if create_resp.status_code != 200:
            pytest.skip("프로젝트 API 사용 불가(503) 또는 생성 실패")
        create_data = json.loads(create_resp.data)
        proj = create_data.get("data", {}).get("data") or create_data.get("data")
        if not proj or "id" not in proj:
            pytest.skip("프로젝트 생성 응답에 id 없음")
        project_id = proj["id"]
        data = {"file": (BytesIO(b"test file content"), "sample.pdf")}
        response = client.post(f"/api/projects/{project_id}/files", data=data)
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        resp = json.loads(response.data)
        assert resp.get("success") is True
        assert "data" in resp
        # file은 data.file 또는 data.data.file에 위치할 수 있음
        inner = resp["data"]
        f = inner.get("file") or (inner.get("data") or {}).get("file")
        assert f is not None, "응답에 file 필드 없음"
        assert "id" in f and "name" in f and "type" in f and "size" in f and "uploadedAt" in f
        assert f["name"] == "sample.pdf"
        assert f["type"] == "document"
        assert f["size"] == len(b"test file content")


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestTtsConfigAPI:
    """TTS 설정·보이스·상황 API (GET /api/tts/config, /api/tts/voices, /api/tts/situations) 검증 테스트"""

    def test_tts_config_returns_200_and_available(self, client):
        """GET /api/tts/config → 200, available·base_url_configured·message 포함, Content-Type application/json"""
        response = client.get("/api/tts/config")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "data" in data
        d = data["data"]
        assert "available" in d
        assert "base_url_configured" in d
        assert "message" in d
        assert isinstance(d["available"], bool)
        assert isinstance(d["base_url_configured"], bool)
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers

    def test_tts_voices_returns_200_and_voices_list(self, client):
        """GET /api/tts/voices → 200, data.voices 배열 포함 (TTS 미설정 시 빈 배열), Content-Type application/json"""
        response = client.get("/api/tts/voices")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "data" in data
        d = data["data"]
        assert "voices" in d
        assert isinstance(d["voices"], list)
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers

    def test_tts_situations_returns_200_and_situations_list(self, client):
        """GET /api/tts/situations → 200, data.situations 배열 포함 (id·label·instructions_preview), Content-Type application/json"""
        response = client.get("/api/tts/situations")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "data" in data
        d = data["data"]
        assert "situations" in d
        assert isinstance(d["situations"], list)
        assert len(d["situations"]) >= 1
        first = d["situations"][0]
        assert "id" in first and "label" in first
        situation_ids = [s.get("id") for s in d["situations"] if s.get("id")]
        assert "default" in situation_ids or "narration" in situation_ids
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestIntentAPI:
    """의도·키워드 분석 API (/api/intent/analyze) 테스트"""

    def test_intent_analyze_greeting(self, client):
        """인사 메시지 → intent type greeting (200, Content-Type application/json)"""
        payload = {"message": "안녕하세요"}
        response = client.post(
            "/api/intent/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        assert "intent" in data["data"]
        assert data["data"]["intent"]["type"] == "greeting"
        assert "confidence" in data["data"]["intent"]
        assert "keywords" in data["data"]

    def test_intent_analyze_gratitude(self, client):
        """감사 메시지 → intent type gratitude"""
        payload = {"message": "감사합니다"}
        response = client.post(
            "/api/intent/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["intent"]["type"] == "gratitude"

    def test_intent_analyze_question(self, client):
        """질문형 메시지 → intent type question"""
        payload = {"message": "질문이 있습니다. 어떻게 하면 될까요?"}
        response = client.post(
            "/api/intent/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert data["data"]["intent"]["type"] == "question"

    def test_intent_analyze_returns_keywords(self, client):
        """응답에 keywords 배열 포함"""
        payload = {"message": "Python 프로그래밍 배우고 싶어요"}
        response = client.post(
            "/api/intent/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        keywords = data["data"].get("keywords", [])
        assert isinstance(keywords, list)
        assert len(keywords) <= 10

    def test_intent_analyze_empty_message_400(self, client):
        """빈 메시지 → 400, Content-Type application/json"""
        payload = {"message": ""}
        response = client.post(
            "/api/intent/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_intent_analyze_missing_message_400(self, client):
        """message 필드 누락 → 400, Content-Type application/json"""
        payload = {}
        response = client.post(
            "/api/intent/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_intent_analyze_message_too_long_400(self, client):
        """메시지가 최대 길이 초과 → 400 (10,000자 초과), Content-Type application/json"""
        payload = {"message": "가" * 10_001}
        response = client.post(
            "/api/intent/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_intent_analyze_400_includes_trace_headers(self, client):
        """POST /api/intent/analyze 400 응답에도 X-Request-Id, X-Response-Time-Ms 포함"""
        response = client.post(
            "/api/intent/analyze",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestChatAPI:
    """대화 API (/api/chat) 검증 테스트"""

    def test_chat_success(self, client):
        """정상 대화 요청 → 200, response 필드, Content-Type application/json"""
        payload = {"message": "안녕하세요", "quality": "enhanced"}
        response = client.post(
            "/api/chat",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert "response" in data or "message" in data or "content" in data
        assert "timestamp" in data or "data" in data

    def test_chat_response_headers(self, client):
        """POST /api/chat 200 응답에 X-Request-Id, X-Response-Time-Ms 헤더 포함"""
        payload = {"message": "헤더 테스트"}
        response = client.post(
            "/api/chat",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers
        try:
            int(response.headers["X-Response-Time-Ms"])
        except ValueError:
            pytest.fail("X-Response-Time-Ms must be numeric")

    def test_chat_400_includes_trace_headers(self, client):
        """POST /api/chat 400 응답에도 X-Request-Id, X-Response-Time-Ms 포함 (추적용)"""
        payload = {"message": ""}
        response = client.post(
            "/api/chat",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers

    def test_chat_empty_message_400(self, client):
        """빈 메시지 → 400, Content-Type application/json"""
        payload = {"message": "", "quality": "enhanced"}
        response = client.post(
            "/api/chat",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_chat_message_too_long_400(self, client):
        """메시지 10,001자 초과 → 400, Content-Type application/json"""
        payload = {"message": "가" * 10001, "quality": "enhanced"}
        response = client.post(
            "/api/chat",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_chat_missing_message_400(self, client):
        """message 필드 누락 → 400, Content-Type application/json"""
        payload = {"quality": "enhanced"}
        response = client.post(
            "/api/chat",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data["success"] is False


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestPredictionsAPI:
    """예측 API (/api/integrated/analytics/predictions) 테스트"""

    def test_predictions_returns_horizon_days(self, client):
        """POST predictions → 200, prediction_data에 horizon_days 포함, Content-Type application/json"""
        payload = {
            "prediction_type": "user_satisfaction",
            "prediction_horizon": "7d",
        }
        response = client.post(
            "/api/integrated/analytics/predictions",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "data" in data
        pred = data["data"]
        assert "prediction" in pred
        assert "horizon_days" in pred["prediction"]
        assert pred["prediction"]["horizon_days"] == 7

    def test_predictions_30d_default(self, client):
        """prediction_horizon 생략 시 30d(30일) 기본값, Content-Type application/json"""
        payload = {"prediction_type": "system_load"}
        response = client.post(
            "/api/integrated/analytics/predictions",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert data["data"]["prediction"]["horizon_days"] == 30


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestInsightsAPI:
    """인사이트 생성 API 테스트"""

    def test_insights_post_success(self, client):
        """인사이트 생성 성공: insight_type, focus_area, insights 구조 검증, Content-Type application/json"""
        payload = {"insight_type": "performance", "focus_area": "all"}
        response = client.post(
            "/api/integrated/analytics/insights",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "data" in data
        payload_data = data["data"]
        assert "insight_type" in payload_data
        assert payload_data["insight_type"] == "performance"
        assert "focus_area" in payload_data
        assert "insights" in payload_data
        assert isinstance(payload_data["insights"], list)
        assert "total_insights" in payload_data
        assert "generated_at" in payload_data

    def test_insights_default_params(self, client):
        """insight_type만 전달 시 focus_area 기본값(all), Content-Type application/json"""
        response = client.post(
            "/api/integrated/analytics/insights",
            data=json.dumps({"insight_type": "user"}),
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert data["data"]["insight_type"] == "user"
        assert data["data"]["focus_area"] == "all"
        response2 = client.post(
            "/api/integrated/analytics/insights",
            data=json.dumps({"focus_area": "chat"}),
            content_type="application/json",
        )
        assert response2.status_code == 200
        data2 = json.loads(response2.data)
        assert data2["data"]["insight_type"] == "general"
        assert data2["data"]["focus_area"] == "chat"
        assert isinstance(data2["data"]["insights"], list)


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestErrorHandling:
    """에러 처리 테스트"""

    def test_invalid_json(self, client):
        """잘못된 JSON 요청 테스트 (400/500, Content-Type 및 추적 헤더)"""
        response = client.post(
            "/api/integrated/analyze",
            data="invalid json",
            content_type="application/json",
        )
        assert response.status_code in [400, 500]
        assert "application/json" in response.headers.get("Content-Type", "")
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data
        assert "timestamp" in data

    def test_error_response_format(self, client):
        """에러 응답 형식 테스트 (400, Content-Type application/json)"""
        payload = {}
        response = client.post(
            "/api/integrated/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert "success" in data
        assert "error" in data
        assert "message" in data
        assert "timestamp" in data
        assert data["success"] is False

    def test_request_entity_too_large_413(self, client):
        """요청 본문이 MAX_CONTENT_LENGTH 초과 시 413 및 JSON 응답"""
        import api.main as main_module
        original = main_module.app.config.get("MAX_CONTENT_LENGTH")
        try:
            main_module.app.config["MAX_CONTENT_LENGTH"] = 5
            response = client.post(
                "/api/chat",
                data=json.dumps({"message": "123456"}),
                content_type="application/json",
            )
            assert response.status_code == 413
            assert "application/json" in response.headers.get("Content-Type", "")
            assert "X-Request-Id" in response.headers
            assert response.headers["X-Request-Id"].strip() != ""
            assert "X-Response-Time-Ms" in response.headers
            data = json.loads(response.data)
            assert data.get("success") is False
            assert "error" in data
            assert "요청 본문" in data.get("error", "") or "너무 큽니다" in data.get("error", "")
        finally:
            main_module.app.config["MAX_CONTENT_LENGTH"] = original


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestTtsScriptStyleAPI:
    """TTS script-style API (Flask main.py) 검증 테스트"""

    def test_script_style_analyze_missing_sample_script_400(self, client):
        """POST /api/tts/script-style/analyze - sample_script 누락 시 400, Content-Type 및 추적 헤더"""
        response = client.post(
            "/api/tts/script-style/analyze",
            data=json.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"].strip() != ""
        assert "X-Response-Time-Ms" in response.headers
        data = json.loads(response.data)
        assert data.get("success") is False
        assert "error" in data or "detail" in data

    def test_script_style_analyze_empty_sample_script_400(self, client):
        """POST /api/tts/script-style/analyze - sample_script 빈 문자열 시 400, Content-Type application/json"""
        response = client.post(
            "/api/tts/script-style/analyze",
            data=json.dumps({"sample_script": ""}),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False

    def test_script_style_generate_missing_topic_400(self, client):
        """POST /api/tts/script-style/generate - topic_or_outline 누락 시 400, Content-Type application/json"""
        response = client.post(
            "/api/tts/script-style/generate",
            data=json.dumps({"sample_script": "참조 대본"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False

    def test_script_style_generate_empty_topic_400(self, client):
        """POST /api/tts/script-style/generate - topic_or_outline 빈 문자열 시 400, Content-Type application/json"""
        response = client.post(
            "/api/tts/script-style/generate",
            data=json.dumps({"sample_script": "참조", "topic_or_outline": ""}),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False

    def test_script_style_generate_missing_sample_script_400(self, client):
        """POST /api/tts/script-style/generate - sample_script 누락 시 400, Content-Type application/json"""
        response = client.post(
            "/api/tts/script-style/generate",
            data=json.dumps({"topic_or_outline": "주제"}),
            content_type="application/json",
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False

    def test_script_style_analyze_valid_returns_200_or_500(self, client):
        """POST /api/tts/script-style/analyze - 유효한 요청 시 200(성공) 또는 500(엔진 오류)"""
        response = client.post(
            "/api/tts/script-style/analyze",
            data=json.dumps({"sample_script": "테스트 대본입니다. 톤과 스타일을 분석해 주세요."}),
            content_type="application/json",
        )
        assert response.status_code in [200, 500]
        data = json.loads(response.data)
        if response.status_code == 200:
            assert data.get("success") is True
            assert "style_summary" in data
            assert "key_traits" in data
        else:
            assert data.get("success") is False
            assert "error" in data or "detail" in data

    def test_script_style_generate_valid_returns_200_or_500(self, client):
        """POST /api/tts/script-style/generate - 유효한 요청 시 200(성공) 또는 500(엔진 오류)"""
        response = client.post(
            "/api/tts/script-style/generate",
            data=json.dumps({
                "sample_script": "참조 대본입니다.",
                "topic_or_outline": "신제품 발표 오프닝 멘트",
            }),
            content_type="application/json",
        )
        assert response.status_code in [200, 500]
        data = json.loads(response.data)
        if response.status_code == 200:
            assert data.get("success") is True
            assert "generated_script" in data
        else:
            assert data.get("success") is False
            assert "error" in data or "detail" in data

    def test_script_style_extract_document_no_file_400(self, client):
        """POST /api/tts/script-style/extract-document - 파일 없이 요청 시 400, Content-Type application/json"""
        response = client.post("/api/tts/script-style/extract-document")
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False
        assert "error" in data or "detail" in data

    def test_script_style_extract_document_txt_success(self, client):
        """POST /api/tts/script-style/extract-document - txt 파일 업로드 시 200, text·suggested_document_hint, Content-Type application/json"""
        content = b"Sample script text for TTS.\n\nSecond paragraph."
        response = client.post(
            "/api/tts/script-style/extract-document",
            data={"file": (io.BytesIO(content), "sample.txt")},
        )
        assert response.status_code == 200
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is True
        assert "text" in data
        assert "Sample script text" in data["text"] or "sample script" in data["text"].lower()
        assert "suggested_document_hint" in data

    def test_script_style_extract_document_empty_file_400(self, client):
        """POST /api/tts/script-style/extract-document - 빈 파일 업로드 시 400, Content-Type application/json"""
        response = client.post(
            "/api/tts/script-style/extract-document",
            data={"file": (io.BytesIO(b""), "empty.txt")},
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False
        assert "error" in data or "detail" in data

    def test_script_style_extract_document_unsupported_extension_400(self, client):
        """POST /api/tts/script-style/extract-document - 지원하지 않는 확장자(.pdf 등) 시 400, Content-Type application/json"""
        response = client.post(
            "/api/tts/script-style/extract-document",
            data={"file": (io.BytesIO(b"dummy pdf content"), "doc.pdf")},
        )
        assert response.status_code == 400
        assert "application/json" in response.headers.get("Content-Type", "")
        data = json.loads(response.data)
        assert data.get("success") is False
        assert "error" in data or "detail" in data
        body = (data.get("error") or "") + (data.get("detail") or "")
        assert ".docx" in body or ".txt" in body or "지원" in body
