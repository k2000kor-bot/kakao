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

    def test_api_health_response_structure(self):
        """GET /api/health 응답에 status, timestamp 또는 success 포함 (main_server/Flask 형식 모두 허용)"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data.get("success") is True or "timestamp" in data or "uptime" in data

    def test_api_chat_llm_status(self):
        """GET /api/chat/llm-status → 200, success·provider·timestamp (또는 error)"""
        response = client.get("/api/chat/llm-status")
        assert response.status_code == 200
        data = response.json()
        assert "timestamp" in data
        assert "provider" in data or "error" in data
        assert data.get("success") is True or "error" in data


@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server not available")
class TestChatEndpoints:
    """대화 엔드포인트 테스트"""

    def test_chat_basic(self):
        """기본 대화 테스트"""
        payload = {
            "message": "안녕하세요",
            "quality": "enhanced"
        }
        response = client.post("/api/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data or "message" in data or "content" in data

    def test_chat_with_context(self):
        """컨텍스트가 있는 대화 테스트"""
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

    def test_chat_missing_message_422(self):
        """필수 필드(message) 누락 → 422"""
        response = client.post("/api/chat", json={})
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_chat_stream_endpoint(self):
        """스트리밍 대화 엔드포인트 테스트"""
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
class TestIntentEndpoints:
    """의도·키워드 분석 API (POST /api/intent/analyze) 테스트"""

    def test_intent_analyze_greeting(self):
        """인사 메시지 → intent type greeting"""
        response = client.post("/api/intent/analyze", json={"message": "안녕하세요"})
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert "data" in data
        assert "intent" in data["data"]
        assert data["data"]["intent"]["type"] == "greeting"
        assert "confidence" in data["data"]["intent"]
        assert "keywords" in data["data"]

    def test_intent_analyze_gratitude(self):
        """감사 메시지 → intent type gratitude"""
        response = client.post("/api/intent/analyze", json={"message": "감사합니다"})
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert data["data"]["intent"]["type"] == "gratitude"

    def test_intent_analyze_empty_message_422(self):
        """빈 메시지 → 422 (Pydantic min_length=1)"""
        response = client.post("/api/intent/analyze", json={"message": ""})
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_intent_analyze_missing_message_422(self):
        """message 필드 누락 → 422"""
        response = client.post("/api/intent/analyze", json={})
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_intent_analyze_returns_keywords(self):
        """응답에 keywords 배열 포함"""
        response = client.post(
            "/api/intent/analyze",
            json={"message": "Python 프로그래밍 배우고 싶어요"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        keywords = data["data"].get("keywords", [])
        assert isinstance(keywords, list)
        assert len(keywords) <= 10


@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server not available")
class TestAnalysisWebResearch:
    """웹 연구 API (POST /api/analysis/web-research) 테스트"""

    def test_web_research_success(self):
        """정상 요청 → 200 + success + result 구조"""
        payload = {
            "question": "테스트 질문입니다",
            "context": {"project_id": "proj-1", "user_id": "user-1"},
        }
        response = client.post("/api/analysis/web-research", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert "result" in data
        result = data["result"]
        assert result.get("original_question") == "테스트 질문입니다"
        assert "research_results" in result
        assert "sources" in result["research_results"]
        assert "conclusion" in result
        assert "confidence_score" in result

    def test_web_research_empty_question_400(self):
        """빈 질문 → 400"""
        response = client.post(
            "/api/analysis/web-research",
            json={"question": "", "context": {}},
        )
        assert response.status_code == 400

    def test_web_research_missing_question_422(self):
        """question 필드 누락 → 422"""
        response = client.post("/api/analysis/web-research", json={"context": {}})
        assert response.status_code == 422


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
