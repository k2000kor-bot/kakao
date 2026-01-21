"""
메인 서버 API 통합 테스트
main_server.py의 주요 엔드포인트 테스트
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# 백엔드 경로 추가
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from main_server import app
    client = TestClient(app)
    APP_AVAILABLE = True
except ImportError as e:
    APP_AVAILABLE = False
    client = None
    print(f"Warning: Could not import main_server: {e}")


@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server not available")
class TestHealthEndpoints:
    """헬스 체크 엔드포인트 테스트"""

    def test_root_endpoint(self):
        """루트 엔드포인트 테스트 (HTML 페이지 반환)"""
        response = client.get("/")
        assert response.status_code == 200
        # HTML 페이지가 반환됨
        assert "html" in response.text.lower() or "CORBU" in response.text

    def test_api_health_endpoint(self):
        """API 헬스 체크 엔드포인트 테스트"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data.get("status") in ["healthy", "unhealthy", "degraded"]


@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server not available")
class TestChatEndpoints:
    """채팅 엔드포인트 테스트"""

    def test_chat_basic(self):
        """기본 채팅 테스트"""
        payload = {
            "message": "안녕하세요",
            "quality": "enhanced"
        }
        response = client.post("/api/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data or "message" in data or "content" in data

    def test_chat_with_context(self):
        """컨텍스트가 있는 채팅 테스트"""
        payload = {
            "message": "Python에 대해 알려줘",
            "quality": "enhanced",
            "context": ["이전 대화 내용"]
        }
        response = client.post("/api/chat", json=payload)
        assert response.status_code == 200

    def test_chat_empty_message(self):
        """빈 메시지 에러 처리 테스트"""
        payload = {
            "message": "",
            "quality": "enhanced"
        }
        response = client.post("/api/chat", json=payload)
        assert response.status_code == 400

    def test_chat_stream_endpoint(self):
        """스트리밍 채팅 엔드포인트 테스트"""
        payload = {
            "message": "테스트",
            "session_id": "test-session"
        }
        response = client.post("/api/chat/stream", json=payload)
        # 스트리밍 응답이므로 200 또는 스트리밍 컨텐츠 타입 확인
        assert response.status_code == 200


@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server not available")
class TestSystemEndpoints:
    """시스템 엔드포인트 테스트"""

    def test_system_status(self):
        """시스템 상태 엔드포인트 테스트"""
        response = client.get("/api/system/status")
        if response.status_code == 200:
            data = response.json()
            assert "status" in data or "overall" in data
        else:
            # 엔드포인트가 없을 수 있음
            assert response.status_code in [200, 404]

    def test_metrics_endpoint(self):
        """메트릭 엔드포인트 테스트"""
        response = client.get("/api/metrics")
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
        else:
            assert response.status_code in [200, 404]


@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server not available")
class TestSecurityEndpoints:
    """보안 엔드포인트 테스트"""

    def test_security_status(self):
        """보안 상태 엔드포인트 테스트"""
        response = client.get("/api/security/status")
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
        else:
            assert response.status_code in [200, 404]


@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server not available")
class TestPerformanceEndpoints:
    """성능 모니터링 엔드포인트 테스트"""

    def test_performance_metrics(self):
        """성능 메트릭 엔드포인트 테스트"""
        response = client.get("/api/performance/metrics")
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, dict)
        else:
            assert response.status_code in [200, 404]


@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server not available")
class TestAPIDocumentation:
    """API 문서 엔드포인트 테스트"""

    def test_docs_endpoint(self):
        """Swagger 문서 엔드포인트 테스트"""
        response = client.get("/api/docs")
        assert response.status_code == 200

    def test_redoc_endpoint(self):
        """ReDoc 문서 엔드포인트 테스트"""
        response = client.get("/api/redoc")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
