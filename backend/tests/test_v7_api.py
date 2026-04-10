"""v7 고급 기능 API 테스트 — AdvancedFeaturesPanel 연동"""

import pytest
from fastapi.testclient import TestClient

from main_server import app

client = TestClient(app)


class TestV7Voice:
    def test_start_voice_recognition(self):
        r = client.post("/api/v7/voice/start-recognition", json={})
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "success"
        assert "session_id" in data

    def test_stop_voice_recognition(self):
        r = client.post("/api/v7/voice/stop-recognition", json={})
        assert r.status_code == 200
        assert r.json().get("status") == "success"

    def test_voice_results(self):
        r = client.get("/api/v7/voice/results")
        assert r.status_code == 200
        assert r.json().get("status") == "success"


class TestV7Image:
    def test_analyze_base64(self):
        r = client.post(
            "/api/v7/image/analyze-base64",
            json={"image_data": "dGVzdA==", "analysis_type": "comprehensive"},
        )
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "success"
        assert "analysis" in data


class TestV7Predict:
    def test_user_activity(self):
        r = client.post(
            "/api/v7/predict/user-activity",
            json={"user_id": "test-user", "time_horizon": "24h"},
        )
        assert r.status_code == 200
        assert r.json().get("status") == "success"

    def test_message_quality(self):
        r = client.post(
            "/api/v7/predict/message-quality",
            json={"message_content": "테스트 메시지"},
        )
        assert r.status_code == 200
        assert r.json().get("status") == "success"

    def test_system_performance(self):
        r = client.post("/api/v7/predict/system-performance", json={})
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "success"
        assert "performance_prediction" in data

    def test_prediction_summary(self):
        r = client.get("/api/v7/predict/summary")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "success"
        assert "summary" in data
