"""
main.py Flask API 테스트
"""

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
        """헬스 체크 테스트"""
        response = client.get("/api/integrated/health")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data
        assert "timestamp" in data

    def test_get_status(self, client):
        """시스템 상태 조회 테스트"""
        response = client.get("/api/integrated/status")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_get_metrics(self, client):
        """성능 메트릭 조회 테스트"""
        response = client.get("/api/integrated/metrics")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_get_analytics(self, client):
        """분석 대시보드 데이터 조회 테스트"""
        response = client.get("/api/integrated/analytics")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_get_logs(self, client):
        """시스템 로그 조회 테스트"""
        response = client.get("/api/integrated/logs")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestAnalyzeAPI:
    """메시지 분석 API 테스트"""

    def test_analyze_message_success(self, client):
        """메시지 분석 성공 테스트"""
        payload = {"message": "안녕하세요! 좋은 하루네요!"}
        response = client.post(
            "/api/integrated/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_analyze_message_missing_field(self, client):
        """필수 필드 누락 테스트"""
        payload = {}
        response = client.post(
            "/api/integrated/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data

    def test_analyze_message_empty_message(self, client):
        """빈 메시지 테스트"""
        payload = {"message": ""}
        response = client.post(
            "/api/integrated/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestCreativeAPI:
    """창작 콘텐츠 API 테스트"""

    def test_generate_story(self, client):
        """스토리 생성 테스트"""
        payload = {"genre": "romance", "theme": "사랑", "length": "short"}
        response = client.post(
            "/api/integrated/creative/story",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_generate_poem(self, client):
        """시 생성 테스트"""
        payload = {"type": "lyric", "theme": "사랑"}
        response = client.post(
            "/api/integrated/creative/poem",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_analyze_writing(self, client):
        """글쓰기 분석 테스트"""
        payload = {"text": "이것은 테스트 텍스트입니다."}
        response = client.post(
            "/api/integrated/creative/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["success"] is True
        assert "data" in data

    def test_analyze_writing_missing_field(self, client):
        """글쓰기 분석 필수 필드 누락 테스트"""
        payload = {}
        response = client.post(
            "/api/integrated/creative/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data["success"] is False


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main.py를 사용할 수 없습니다")
class TestErrorHandling:
    """에러 처리 테스트"""

    def test_invalid_json(self, client):
        """잘못된 JSON 요청 테스트"""
        response = client.post(
            "/api/integrated/analyze",
            data="invalid json",
            content_type="application/json",
        )
        assert response.status_code in [400, 500]
        data = json.loads(response.data)
        assert data["success"] is False
        assert "error" in data
        assert "timestamp" in data

    def test_error_response_format(self, client):
        """에러 응답 형식 테스트"""
        payload = {}
        response = client.post(
            "/api/integrated/analyze",
            data=json.dumps(payload),
            content_type="application/json",
        )
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "success" in data
        assert "error" in data
        assert "message" in data
        assert "timestamp" in data
        assert data["success"] is False
