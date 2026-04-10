"""pipeline_tuning_api — 파이프라인 튜닝·LLM 내부 보안 GET 엔드포인트"""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.pipeline_tuning_api import router

app = FastAPI()
app.include_router(router)


@pytest.fixture
def client():
    return TestClient(app)


def test_get_llm_internal_security(client):
    r = client.get("/api/llm-internal-security")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    assert "airgap" in j
    assert "deepseek_cloud_blocked" in j
    assert "outbound_collection_blocked" in j


def test_get_pipeline_tuning(client):
    r = client.get("/api/pipeline-tuning")
    assert r.status_code == 200
    j = r.json()
    assert j.get("success") is True
    assert isinstance(j.get("config"), dict)
    assert "writable" in j
    assert isinstance(j["writable"], bool)
