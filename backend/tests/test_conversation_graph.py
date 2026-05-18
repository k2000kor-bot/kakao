"""conversation_graph 파싱·저장·관계도 API"""
import os
import tempfile

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.conversation_graph import (
    classify_stance,
    get_relationship_graph,
    list_uploads,
    parse_messages,
    save_upload,
)
from api.conversation_graph_api import router

app = FastAPI()
app.include_router(router)


@pytest.fixture
def temp_db(monkeypatch):
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    monkeypatch.setenv("CONVERSATION_GRAPH_DB", path)
    yield path
    try:
        os.remove(path)
    except OSError:
        pass


@pytest.fixture
def client(temp_db):
    return TestClient(app)


def test_classify_stance():
    assert classify_stance("재개발 찬성합니다") == "동조"
    assert classify_stance("저는 반대합니다") == "반대"
    assert classify_stance("안녕하세요") == "중립"


def test_parse_kakao_line_and_graph(temp_db):
    content = """2026-05-11 10:00:00, 알파 : 찬성합니다
2026-05-11 10:01:00, 베타 : 반대합니다"""
    msgs = parse_messages(content)
    assert len(msgs) == 2
    saved = save_upload(name="t", filename="t.txt", content=content)
    graph = get_relationship_graph(saved["upload_id"])
    assert len(graph["nodes"]) == 2
    assert graph["nodes"][0]["dominant_stance"] in ("동조", "반대", "중립")
    assert len(graph["edges"]) >= 1
    assert graph["meta"]["message_count"] == 2
    assert graph["meta"]["participant_count"] == 2
    assert isinstance(graph["evidence"], list)


def test_api_upload_list_graph(client, temp_db):
    content = """Date,User,Message
2026-05-13 10:00:00,알파,찬성해요
2026-05-13 10:01:00,베타,반대해요"""
    r = client.post(
        "/api/conversations/upload",
        json={"text": content, "name": "e2e", "filename": "c.csv"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    upload_id = body["data"]["upload_id"]

    r2 = client.get("/api/conversations")
    assert r2.json()["success"] is True
    assert any(item["id"] == upload_id for item in r2.json()["data"])

    r3 = client.get(f"/api/conversations/{upload_id}/relationship-graph")
    assert r3.json()["success"] is True
    data = r3.json()["data"]
    assert data["upload_id"] == upload_id
    assert len(data["nodes"]) == 2


def test_list_uploads_empty(temp_db):
    assert list_uploads() == []


def test_parse_kakao_txt_export(temp_db):
    content = """홍길동 님과 카카오톡 대화
저장한 날짜 : 2025년 6월 24일 오전 9:22

2025년 6월 24일 오전 9:22
2025년 6월 24일 오전 9:22, 홍길동 : 찬성합니다
2025년 6월 24일 오전 9:23, 김철수 : 반대합니다
2025년 6월 24일 오전 9:25, 김철수 : 사진
2025년 6월 24일 오전 9:26, 홍길동 : 삭제된 메시지입니다."""
    msgs = parse_messages(content)
    assert len(msgs) == 2
    assert {m.user for m in msgs} == {"홍길동", "김철수"}
    saved = save_upload(name="txt", filename="k.txt", content=content)
    graph = get_relationship_graph(saved["upload_id"])
    assert len(graph["nodes"]) == 2


def test_parse_korean_csv_four_columns(temp_db):
    content = """날짜,시간,유저,메시지
2026. 3. 2.,오전 10:30,알파,찬성합니다
2026. 3. 2.,오전 10:31,베타,반대합니다"""
    msgs = parse_messages(content)
    assert len(msgs) == 2
    assert msgs[0].stance == "동조"
    saved = save_upload(name="ko", filename="k.csv", content=content)
    graph = get_relationship_graph(saved["upload_id"])
    assert len(graph["nodes"]) == 2
    assert graph["edges"][0]["edge_type"] == "대립"
