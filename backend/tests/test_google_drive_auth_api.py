"""Google Drive OAuth API 테스트."""

from pathlib import Path
import sys
from unittest import mock

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
class TestGoogleDriveAuthApi:
    def test_get_drive_status_ok(self, client, monkeypatch):
        monkeypatch.delenv("GOOGLE_CLIENT_ID", raising=False)
        monkeypatch.delenv("GOOGLE_CLIENT_SECRET", raising=False)
        r = client.get("/api/auth/google/drive")
        assert r.status_code == 200
        body = r.json()
        assert body.get("success") is True
        data = body.get("data") or {}
        assert data.get("implementation") == "oauth_code_exchange"
        assert data.get("oauth_configured") is False
        assert data.get("environment", {}).get("GOOGLE_CLIENT_ID") is False
        assert data.get("environment", {}).get("GOOGLE_CLIENT_SECRET") is False
        spa = data.get("spa") or {}
        assert spa.get("oauth_callback_path") == "/oauth/google/drive/callback"
        react_env = spa.get("react_env") or {}
        assert react_env.get("oauth_client_id") == "REACT_APP_GOOGLE_OAUTH_CLIENT_ID"
        assert react_env.get("picker_api_key") == "REACT_APP_GOOGLE_API_KEY"

    def test_get_drive_status_configured_flags(self, client, monkeypatch):
        monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com")
        monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "test-secret")
        r = client.get("/api/auth/google/drive")
        assert r.status_code == 200
        data = r.json().get("data") or {}
        assert data.get("oauth_configured") is True
        assert "test-secret" not in r.text and "test-client" not in r.text
        assert (data.get("spa") or {}).get("oauth_callback_path") == "/oauth/google/drive/callback"

    def test_post_oauth_token_requires_credentials(self, client, monkeypatch):
        monkeypatch.delenv("GOOGLE_CLIENT_ID", raising=False)
        monkeypatch.delenv("GOOGLE_CLIENT_SECRET", raising=False)
        r = client.post(
            "/api/auth/google/drive/oauth/token",
            json={"code": "abc", "redirect_uri": "http://localhost/callback"},
        )
        assert r.status_code == 400
        body = r.json()
        assert body.get("success") is False

    def test_post_oauth_token_validation_empty_body(self, client, monkeypatch):
        monkeypatch.setenv("GOOGLE_CLIENT_ID", "id.apps.googleusercontent.com")
        monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "secret")
        r = client.post("/api/auth/google/drive/oauth/token", json={})
        assert r.status_code == 422

    @mock.patch("api.google_drive_auth_api.requests.post")
    def test_post_oauth_token_google_success(self, mock_post, client, monkeypatch):
        monkeypatch.setenv("GOOGLE_CLIENT_ID", "cid.apps.googleusercontent.com")
        monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "csecret")
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.content = b'{"access_token":"t1","token_type":"Bearer","expires_in":3600}'
        mock_resp.json = lambda: {"access_token": "t1", "token_type": "Bearer", "expires_in": 3600}
        mock_post.return_value = mock_resp

        r = client.post(
            "/api/auth/google/drive/oauth/token",
            json={
                "code": "auth-code-xyz",
                "redirect_uri": "http://127.0.0.1:3000/oauth/google/drive/callback",
            },
        )
        assert r.status_code == 200
        body = r.json()
        assert body.get("success") is True
        assert body.get("data", {}).get("access_token") == "t1"
        mock_post.assert_called_once()
        assert mock_post.call_args[0][0] == "https://oauth2.googleapis.com/token"

    @mock.patch("api.google_drive_auth_api.requests.post")
    def test_post_oauth_token_google_error(self, mock_post, client, monkeypatch):
        monkeypatch.setenv("GOOGLE_CLIENT_ID", "cid.apps.googleusercontent.com")
        monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "csecret")
        mock_resp = mock.Mock()
        mock_resp.status_code = 400
        mock_resp.content = b'{"error":"invalid_grant","error_description":"expired"}'
        mock_resp.json = lambda: {"error": "invalid_grant", "error_description": "expired"}
        mock_resp.text = "bad"
        mock_post.return_value = mock_resp

        r = client.post(
            "/api/auth/google/drive/oauth/token",
            json={
                "code": "bad",
                "redirect_uri": "http://localhost:3000/oauth/google/drive/callback",
            },
        )
        assert r.status_code == 502
        assert r.json().get("success") is False

    def test_post_oauth_token_rejects_redirect_uri_wrong_path(self, client, monkeypatch):
        monkeypatch.setenv("GOOGLE_CLIENT_ID", "id.apps.googleusercontent.com")
        monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "secret")
        r = client.post(
            "/api/auth/google/drive/oauth/token",
            json={"code": "any", "redirect_uri": "http://localhost:3000/oauth/wrong/callback"},
        )
        assert r.status_code == 400
        body = r.json()
        assert body.get("success") is False
        err = body.get("error") or ""
        assert isinstance(err, str)
        assert "SPA" in err or "콜백" in err or "path" in err.lower()

    def test_post_fetch_pdf_text_bad_filename(self, client):
        r = client.post(
            "/api/auth/google/drive/files/fetch-pdf-text",
            json={"access_token": "t", "file_id": "id", "filename_hint": "readme.txt"},
        )
        assert r.status_code == 400

    @mock.patch("api.project_session_api._extract_text_from_upload")
    @mock.patch("api.google_drive_auth_api.requests.get")
    def test_post_fetch_pdf_text_success(self, mock_get, mock_extract, client):
        mock_get.return_value = mock.Mock(status_code=200, content=b"%PDF-1.4 fake")
        mock_extract.return_value = ("MyPdf", "line1\nline2")

        r = client.post(
            "/api/auth/google/drive/files/fetch-pdf-text",
            json={"access_token": "ya29.x", "file_id": "filePDF1", "filename_hint": "doc.pdf"},
        )
        assert r.status_code == 200
        body = r.json()
        assert body.get("success") is True
        data = body.get("data") or {}
        assert data.get("title") == "MyPdf"
        assert data.get("content") == "line1\nline2"
        assert data.get("file_id") == "filePDF1"
        mock_get.assert_called_once()
        assert "filePDF1" in mock_get.call_args[0][0]
        assert mock_get.call_args[1].get("params", {}).get("alt") == "media"

    @mock.patch("api.google_drive_auth_api.requests.get")
    def test_post_fetch_pdf_text_drive_error(self, mock_get, client):
        mock_get.return_value = mock.Mock(
            status_code=403,
            text="err",
            json=lambda: {"error": {"message": "No"}},
        )

        r = client.post(
            "/api/auth/google/drive/files/fetch-pdf-text",
            json={"access_token": "t", "file_id": "x"},
        )
        assert r.status_code == 502

    def test_post_export_text_invalid_mime(self, client):
        r = client.post(
            "/api/auth/google/drive/files/export-text",
            json={
                "access_token": "tok",
                "file_id": "abc123",
                "export_mime_type": "application/pdf",
            },
        )
        assert r.status_code == 400

    @mock.patch("api.google_drive_auth_api.requests.get")
    def test_post_export_text_success(self, mock_get, client):
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.text = "Hello from Doc"
        mock_get.return_value = mock_resp

        r = client.post(
            "/api/auth/google/drive/files/export-text",
            json={"access_token": "ya29.x", "file_id": "fileXYZ"},
        )
        assert r.status_code == 200
        body = r.json()
        assert body.get("success") is True
        data = body.get("data") or {}
        assert data.get("content") == "Hello from Doc"
        assert data.get("file_id") == "fileXYZ"
        assert data.get("export_mime_type") == "text/plain"
        assert data.get("char_count") == len("Hello from Doc")
        mock_get.assert_called_once()
        called_url = mock_get.call_args[0][0]
        assert "fileXYZ" in called_url
        assert mock_get.call_args[1].get("params", {}).get("mimeType") == "text/plain"

    @mock.patch("api.google_drive_auth_api.requests.get")
    def test_post_export_text_drive_error(self, mock_get, client):
        mock_resp = mock.Mock()
        mock_resp.status_code = 403
        mock_resp.text = "nope"
        mock_resp.json = lambda: {"error": {"message": "Export not allowed"}}
        mock_get.return_value = mock_resp

        r = client.post(
            "/api/auth/google/drive/files/export-text",
            json={"access_token": "ya29.x", "file_id": "bad", "export_mime_type": "text/csv"},
        )
        assert r.status_code == 502
        assert r.json().get("success") is False

    def test_post_list_importable_invalid_folder_id(self, client):
        r = client.post(
            "/api/auth/google/drive/files/list-importable-in-folder",
            json={"access_token": "tok", "folder_id": "bad id!"},
        )
        assert r.status_code == 400

    @mock.patch("api.google_drive_auth_api.requests.get")
    def test_post_list_importable_success(self, mock_get, client):
        mock_resp = mock.Mock()
        mock_resp.status_code = 200
        mock_resp.json = lambda: {
            "files": [
                {"id": "d1", "name": "A", "mimeType": "application/vnd.google-apps.document"},
                {"id": "skip", "name": "Sub", "mimeType": "application/vnd.google-apps.folder"},
                {"id": "p1", "name": "B.pdf", "mimeType": "application/pdf"},
            ],
            "nextPageToken": None,
        }
        mock_get.return_value = mock_resp

        r = client.post(
            "/api/auth/google/drive/files/list-importable-in-folder",
            json={"access_token": "ya29.x", "folder_id": "folderABC123"},
        )
        assert r.status_code == 200
        body = r.json()
        assert body.get("success") is True
        data = body.get("data") or {}
        assert data.get("file_ids") == ["d1", "p1"]
        assert data.get("truncated") is False
        mock_get.assert_called_once()
        call_kw = mock_get.call_args[1]
        assert "folderABC123" in (call_kw.get("params") or {}).get("q", "")

    @mock.patch("api.google_drive_auth_api.requests.get")
    def test_post_list_importable_drive_error(self, mock_get, client):
        mock_resp = mock.Mock()
        mock_resp.status_code = 403
        mock_resp.text = "no"
        mock_resp.json = lambda: {"error": {"message": "Forbidden"}}
        mock_get.return_value = mock_resp

        r = client.post(
            "/api/auth/google/drive/files/list-importable-in-folder",
            json={"access_token": "ya29.x", "folder_id": "folderXYZ"},
        )
        assert r.status_code == 502

    def test_post_list_importable_max_depth_invalid(self, client):
        r = client.post(
            "/api/auth/google/drive/files/list-importable-in-folder",
            json={"access_token": "tok", "folder_id": "folderABC123", "max_folder_depth": 0},
        )
        assert r.status_code == 422

    @mock.patch("api.google_drive_auth_api.requests.get")
    def test_post_list_importable_depth2_two_folders(self, mock_get, client):
        root_resp = mock.Mock()
        root_resp.status_code = 200
        root_resp.json = lambda: {
            "files": [
                {"id": "d1", "name": "Doc", "mimeType": "application/vnd.google-apps.document"},
                {"id": "subf", "name": "Inner", "mimeType": "application/vnd.google-apps.folder"},
            ],
            "nextPageToken": None,
        }
        inner_resp = mock.Mock()
        inner_resp.status_code = 200
        inner_resp.json = lambda: {
            "files": [{"id": "p9", "name": "X.pdf", "mimeType": "application/pdf"}],
            "nextPageToken": None,
        }
        mock_get.side_effect = [root_resp, inner_resp]

        r = client.post(
            "/api/auth/google/drive/files/list-importable-in-folder",
            json={"access_token": "ya29.x", "folder_id": "rootFold", "max_folder_depth": 2},
        )
        assert r.status_code == 200
        body = r.json()
        assert body.get("success") is True
        data = body.get("data") or {}
        assert data.get("file_ids") == ["d1", "p9"]
        assert data.get("max_folder_depth") == 2
        assert mock_get.call_count == 2
