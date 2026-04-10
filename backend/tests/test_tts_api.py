"""
Qwen3-TTS 프록시 API 테스트
"""

from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

try:
    from main_server import app
    APP_AVAILABLE = True
except ImportError:
    APP_AVAILABLE = False


@pytest.fixture
def client():
    if not APP_AVAILABLE:
        pytest.skip("main_server를 import할 수 없습니다")
    return TestClient(app)


@pytest.mark.api
@pytest.mark.skipif(not APP_AVAILABLE, reason="main_server를 사용할 수 없습니다")
class TestTtsApi:
    """TTS API 테스트"""

    def test_tts_config_without_base_url(self, client):
        """QWEN_TTS_BASE_URL 미설정 시 /api/tts/config는 available: false 또는 true 반환"""
        response = client.get("/api/tts/config")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert "available" in data
        assert "base_url_configured" in data

    def test_tts_speech_without_base_url_returns_200_or_503(self, client):
        """QWEN_TTS_BASE_URL 미설정 시 POST /api/tts/speech는 gTTS 폴백(200) 또는 503"""
        response = client.post(
            "/api/tts/speech",
            json={"input": "안녕하세요"},
        )
        assert response.status_code in (200, 502, 503)
        if response.status_code == 200:
            assert (response.headers.get("content-type") or "").startswith("audio/")
            assert len(response.content) > 0
        else:
            data = response.json()
            assert "detail" in data or "error" in data

    def test_tts_voices_without_base_url_returns_503(self, client):
        """QWEN_TTS_BASE_URL 미설정 시 GET /api/tts/voices는 503"""
        response = client.get("/api/tts/voices")
        assert response.status_code in (502, 503)
        data = response.json()
        assert "detail" in data or "error" in data

    def test_tts_speech_validation(self, client):
        """POST /api/tts/speech - input 누락 시 422"""
        response = client.post("/api/tts/speech", json={})
        assert response.status_code == 422

    def test_tts_situations(self, client):
        """GET /api/tts/situations - 상황별 성우 목소리 프리셋 목록 반환"""
        response = client.get("/api/tts/situations")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        situations = data.get("situations")
        assert isinstance(situations, list)
        assert len(situations) > 0
        for item in situations:
            assert "id" in item
            assert "label" in item

    def test_script_style_analyze_validation(self, client):
        """POST /api/tts/script-style/analyze - sample_script 누락 시 422"""
        response = client.post(
            "/api/tts/script-style/analyze",
            json={},
        )
        assert response.status_code == 422

    def test_script_style_generate_validation(self, client):
        """POST /api/tts/script-style/generate - sample_script 또는 topic 누락 시 422"""
        response = client.post(
            "/api/tts/script-style/generate",
            json={"sample_script": "샘플", "topic_or_outline": ""},
        )
        assert response.status_code == 422
        response2 = client.post(
            "/api/tts/script-style/generate",
            json={"sample_script": "", "topic_or_outline": "주제"},
        )
        assert response2.status_code == 422

    def test_script_style_extract_document_txt(self, client):
        """POST /api/tts/script-style/extract-document - txt 파일 업로드 시 텍스트 추출 및 suggested_document_hint"""
        content = "샘플 대본 텍스트입니다."
        files = {"file": ("sample.txt", content.encode("utf-8"), "text/plain")}
        response = client.post("/api/tts/script-style/extract-document", files=files)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert data.get("text") == content
        assert "suggested_document_hint" in data

    def test_script_style_extract_document_tone_down_filename(self, client):
        """파일명에 톤다운이 포함되면 suggested_document_hint가 tone_down"""
        content = "보도자료 내용"
        files = {"file": ("톤다운안_수정본.txt", content.encode("utf-8"), "text/plain")}
        response = client.post("/api/tts/script-style/extract-document", files=files)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert data.get("text") == content
        assert data.get("suggested_document_hint") == "tone_down"

    def test_script_style_extract_document_empty_file_returns_400(self, client):
        """POST /api/tts/script-style/extract-document - 빈 파일 업로드 시 400"""
        files = {"file": ("empty.txt", b"", "text/plain")}
        response = client.post("/api/tts/script-style/extract-document", files=files)
        assert response.status_code == 400
        data = response.json()
        msg = data.get("detail") or data.get("error") or ""
        assert "빈" in msg

    def test_script_style_extract_document_unsupported_extension_returns_400(self, client):
        """POST /api/tts/script-style/extract-document - 지원하지 않는 확장자(.pdf 등) 시 400"""
        files = {"file": ("doc.pdf", b"dummy content", "application/pdf")}
        response = client.post("/api/tts/script-style/extract-document", files=files)
        assert response.status_code == 400
        data = response.json()
        msg = data.get("detail") or data.get("error") or ""
        assert "docx" in msg or "txt" in msg
