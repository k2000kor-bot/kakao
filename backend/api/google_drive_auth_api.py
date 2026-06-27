"""
Google Drive OAuth — 상태 조회 + authorization code 토큰 교환.

`POST /drive/oauth/token` 은 Google `https://oauth2.googleapis.com/token` 으로
authorization_code 를 교환합니다. 응답에 refresh_token 이 포함될 수 있으므로
프로덕션에서는 신뢰할 저장소에만 보관하세요.
"""

from __future__ import annotations

import os
import re
import tempfile
from collections import deque
from pathlib import Path
from typing import Any, Deque, Dict, List, Optional, Tuple
from urllib.parse import quote, urlparse

import requests
from fastapi import APIRouter, HTTPException, status  # type: ignore[import-untyped]
from pydantic import BaseModel, Field  # type: ignore[import-untyped]

GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_DRIVE_V3_FILES = "https://www.googleapis.com/drive/v3/files"

# SPA(CRA) OAuth 팝업 콜백 — 프론트 라우트와 동일해야 함(`src/config/routes.ts`).
SPA_OAUTH_CALLBACK_PATH = "/oauth/google/drive/callback"

# `files.export` — Workspace 전용. 바이너리 미디어는 `alt=media` 경로(별도) 필요.
_DRIVE_EXPORT_MIME_ALLOWLIST = frozenset(
    {
        "text/plain",
        "text/csv",
        "text/tab-separated-values",
    }
)

# Drive `alt=media` 바이너리 상한 (바이트)
_MAX_DRIVE_MEDIA_BYTES = 45 * 1024 * 1024

# `files.list` — 폴더 직계 자식 중 노트북으로 가져올 수 있는 MIME 만
_GOOGLE_DRIVE_NOTEBOOK_IMPORTABLE_MIMES = frozenset(
    {
        "application/vnd.google-apps.document",
        "application/vnd.google-apps.presentation",
        "application/vnd.google-apps.spreadsheet",
        "application/pdf",
    }
)
_MAX_FOLDER_LIST_PAGES = 40
_MAX_FOLDER_LIST_FILES = 500
# BFS 시 `files.list` 를 호출하는 폴더 노드 상한(과도한 Drive 호출 방지)
_MAX_RECURSIVE_FOLDER_LIST_CALLS = 200
_GOOGLE_DRIVE_FOLDER_MIME = "application/vnd.google-apps.folder"
_DRIVE_RESOURCE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{5,512}$")

router = APIRouter(prefix="/api/auth/google", tags=["google-drive"])


def _env_truthy(name: str) -> bool:
    v = os.environ.get(name)
    return bool(v and str(v).strip())


def _strict_drive_resource_id(raw: str, field: str) -> str:
    s = raw.strip()
    if not _DRIVE_RESOURCE_ID_RE.match(s):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field} 형식이 올바르지 않습니다.",
        )
    return s


def _drive_files_list_error_detail(r: requests.Response) -> str:
    try:
        err = r.json()
        return str(
            err.get("error", {}).get("message")
            or err.get("error_description")
            or err.get("error")
            or r.text
            or r.reason
        )[:1200]
    except ValueError:
        return (r.text or r.reason or "Drive files.list 실패")[:1200]


def _list_one_folder_all_children(token: str, parent_folder_id: str) -> Tuple[List[Dict[str, str]], bool]:
    """한 폴더의 직계 자식 전체(id·mime_type·name). `truncated` 는 페이지 상한으로 못 읽은 뒤가 있을 때."""
    rows: List[Dict[str, str]] = []
    truncated = False
    page_token: Optional[str] = None
    pages = 0

    while pages < _MAX_FOLDER_LIST_PAGES:
        pages += 1
        q = f"'{parent_folder_id}' in parents and trashed = false"
        params: Dict[str, Any] = {
            "q": q,
            "fields": "nextPageToken, files(id, name, mimeType)",
            "pageSize": 100,
            "supportsAllDrives": "true",
            "includeItemsFromAllDrives": "true",
        }
        if page_token:
            params["pageToken"] = page_token
        try:
            r = requests.get(
                GOOGLE_DRIVE_V3_FILES,
                params=params,
                headers={"Authorization": f"Bearer {token}"},
                timeout=60,
            )
        except requests.RequestException as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Drive files.list 요청 실패: {exc}",
            ) from exc

        if r.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=_drive_files_list_error_detail(r),
            )

        try:
            payload = r.json() if r.content else {}
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Drive 응답 JSON 파싱에 실패했습니다.",
            ) from None
        if not isinstance(payload, dict):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Drive 응답 형식이 올바르지 않습니다.",
            )

        for f in payload.get("files") or []:
            if not isinstance(f, dict):
                continue
            fid = f.get("id")
            mt = f.get("mimeType")
            if not isinstance(fid, str) or not fid.strip():
                continue
            if not isinstance(mt, str):
                continue
            name = f.get("name")
            rows.append(
                {
                    "id": fid.strip(),
                    "mime_type": mt,
                    "name": name.strip() if isinstance(name, str) else "",
                }
            )

        next_tok = payload.get("nextPageToken")
        page_token = next_tok if isinstance(next_tok, str) and next_tok.strip() else None
        if not page_token:
            break

    if page_token:
        truncated = True
    return rows, truncated


def _dedupe_importable_entries(entries: List[Dict[str, str]]) -> List[Dict[str, str]]:
    seen: set[str] = set()
    out: List[Dict[str, str]] = []
    for e in entries:
        iid = (e.get("id") or "").strip()
        if not iid or iid in seen:
            continue
        seen.add(iid)
        out.append(e)
    return out


def _collect_importable_files_bfs(
    token: str,
    root_folder_id: str,
    max_folder_depth: int,
) -> Tuple[List[Dict[str, str]], bool]:
    """
    `max_folder_depth`=1 → 루트 폴더 직계만.
    그 이상이면 하위 폴더를 BFS 로 내려가며 수집(루트 깊이 0, `depth + 1 < max_folder_depth` 일 때만 하위 폴더 진입).
    """
    collected: List[Dict[str, str]] = []
    truncated = False
    seen_folders: set[str] = {root_folder_id}
    queue: Deque[Tuple[str, int]] = deque([(root_folder_id, 0)])
    folder_calls = 0

    while (
        queue
        and len(collected) < _MAX_FOLDER_LIST_FILES
        and folder_calls < _MAX_RECURSIVE_FOLDER_LIST_CALLS
    ):
        folder_id, depth = queue.popleft()
        folder_calls += 1
        children, sub_truncated = _list_one_folder_all_children(token, folder_id)
        if sub_truncated:
            truncated = True

        for row in children:
            mt = row.get("mime_type", "")
            rid = row.get("id", "")
            if not rid:
                continue
            if mt in _GOOGLE_DRIVE_NOTEBOOK_IMPORTABLE_MIMES:
                collected.append(
                    {
                        "id": rid,
                        "mime_type": mt,
                        "name": row.get("name", ""),
                    }
                )
                if len(collected) >= _MAX_FOLDER_LIST_FILES:
                    truncated = True
                    break
            elif mt == _GOOGLE_DRIVE_FOLDER_MIME and depth + 1 < max_folder_depth:
                if rid not in seen_folders:
                    seen_folders.add(rid)
                    queue.append((rid, depth + 1))

        if len(collected) >= _MAX_FOLDER_LIST_FILES:
            break

    if queue and (len(collected) >= _MAX_FOLDER_LIST_FILES or folder_calls >= _MAX_RECURSIVE_FOLDER_LIST_CALLS):
        truncated = True

    return _dedupe_importable_entries(collected), truncated


def _redirect_uri_spa_callback_path_ok(redirect_uri: str) -> bool:
    """
    인가 요청에 쓴 redirect_uri 의 path 가 SPA OAuth 콜백과 동일한지 검사합니다.
    scheme·host 는 Google Console 등록과 맞추면 되며, 서버는 path 만 고정합니다.
    """
    try:
        raw = (redirect_uri or "").strip()
        if not raw or "://" not in raw:
            return False
        path = urlparse(raw).path or ""
        path_norm = path.rstrip("/") or "/"
        expected = (SPA_OAUTH_CALLBACK_PATH or "").strip().rstrip("/") or "/oauth/google/drive/callback"
        return path_norm == expected
    except Exception:
        return False


class GoogleDriveOAuthTokenRequest(BaseModel):
    """OAuth 2.0 authorization code → access token (Google)."""

    code: str = Field(..., min_length=1, description="Authorization code from Google")
    redirect_uri: str = Field(
        ...,
        min_length=1,
        description="Must match the redirect_uri used in the authorization request",
    )


class GoogleDriveExportTextRequest(BaseModel):
    """
    Google Drive `files.export` — Docs·Sheets 등 Workspace 파일을 텍스트로보내기.

    클라이언트가 이미 보유한 **액세스 토큰**(Drive `drive.readonly` 등 스코프)을 넘깁니다.
    토큰은 응답에 다시 포함하지 않습니다.
    """

    access_token: str = Field(..., min_length=1, description="Bearer access token (Drive API)")
    file_id: str = Field(..., min_length=1, description="Drive file id")
    export_mime_type: str = Field(
        "text/plain",
        description="export mimeType: text/plain (Docs), text/csv (Sheets), text/tab-separated-values",
    )


class GoogleDriveFetchPdfTextRequest(BaseModel):
    """Drive에 저장된 PDF 등 바이너리 파일을 `alt=media`로 받아 텍스트 추출."""

    access_token: str = Field(..., min_length=1, description="Bearer access token (Drive API)")
    file_id: str = Field(..., min_length=1, description="Drive file id")
    filename_hint: str = Field(
        "document.pdf",
        min_length=4,
        description="확장자 힌트(반드시 .pdf). Drive 메타와 다를 수 있음",
    )


class GoogleDriveListImportableInFolderRequest(BaseModel):
    """
    폴더 아래 노트북 소스로 가져올 수 있는 파일을 나열합니다.
    `max_folder_depth`=1 이면 해당 폴더 **직계**만, 2 이상이면 하위 폴더를 BFS 로 더 내려갑니다.
    """

    access_token: str = Field(..., min_length=1, description="Bearer access token (Drive API)")
    folder_id: str = Field(..., min_length=1, description="Drive folder id")
    max_folder_depth: int = Field(
        1,
        ge=1,
        le=8,
        description="1=직계만, 2~8=하위 폴더를 최대 해당 깊이까지 탐색(시작 폴더가 깊이 1)",
    )


def _exchange_authorization_code(code: str, redirect_uri: str) -> Dict[str, Any]:
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "").strip()
    try:
        r = requests.post(
            GOOGLE_OAUTH_TOKEN_URL,
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code.strip(),
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri.strip(),
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=25,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Google 토큰 엔드포인트 요청 실패: {exc}",
        ) from exc

    try:
        payload = r.json() if r.content else {}
    except ValueError:
        payload = {"raw": (r.text or "")[:500]}

    if r.status_code != 200:
        msg = (
            payload.get("error_description")
            or payload.get("error")
            or (r.text or "")[:500]
            or "토큰 교환 실패"
        )
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(msg)[:800])

    return payload if isinstance(payload, dict) else {"data": payload}


@router.get(
    "/drive",
    summary="Google Drive 연동 상태",
    description="클라이언트 ID/시크릿 존재 여부만 알려 줍니다. 값 자체는 노출하지 않습니다.",
)
async def get_google_drive_status() -> Dict[str, Any]:
    has_id = _env_truthy("GOOGLE_CLIENT_ID")
    has_secret = _env_truthy("GOOGLE_CLIENT_SECRET")
    configured = has_id and has_secret
    return {
        "success": True,
        "data": {
            "implementation": "oauth_code_exchange",
            "oauth_configured": configured,
            "environment": {
                "GOOGLE_CLIENT_ID": has_id,
                "GOOGLE_CLIENT_SECRET": has_secret,
            },
            "message": (
                "Google Drive: `GOOGLE_CLIENT_ID`·`GOOGLE_CLIENT_SECRET` 을 설정한 뒤 "
                "`POST /api/auth/google/drive/oauth/token` 으로 authorization code 를 교환할 수 있습니다."
                if configured
                else "Google Drive OAuth: 클라이언트 자격 증명이 없습니다. 환경 변수를 설정하세요."
            ),
            "documentation_repo_path": "docs/NOTEBOOKLM_DRIVE_ROADMAP.md",
            "spa": {
                "oauth_callback_path": SPA_OAUTH_CALLBACK_PATH,
                "react_env": {
                    "oauth_client_id": "REACT_APP_GOOGLE_OAUTH_CLIENT_ID",
                    "picker_api_key": "REACT_APP_GOOGLE_API_KEY",
                    "picker_app_id_optional": "REACT_APP_GOOGLE_PICKER_APP_ID",
                },
            },
        },
    }


@router.post(
    "/drive/oauth/token",
    summary="OAuth authorization code → 액세스 토큰",
    description=(
        "Google OAuth2 token 엔드포인트로 교환합니다. "
        "요청 본문: `code`, `redirect_uri` (인가 요청 시 사용한 값과 동일해야 함)."
    ),
    response_model=None,
)
def post_google_drive_oauth_token(body: GoogleDriveOAuthTokenRequest) -> Dict[str, Any]:
    if not _env_truthy("GOOGLE_CLIENT_ID") or not _env_truthy("GOOGLE_CLIENT_SECRET"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GOOGLE_CLIENT_ID 및 GOOGLE_CLIENT_SECRET 환경 변수가 필요합니다.",
        )
    if not _redirect_uri_spa_callback_path_ok(body.redirect_uri):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "redirect_uri 의 path 는 SPA OAuth 콜백과 같아야 합니다. "
                f"예: `https://<호스트>{SPA_OAUTH_CALLBACK_PATH}` (끝 슬래시는 생략 가능)"
            ),
        )
    token_payload = _exchange_authorization_code(body.code, body.redirect_uri)
    return {"success": True, "data": token_payload}


@router.post(
    "/drive/files/export-text",
    summary="Drive Workspace 파일 → 텍스트(export)",
    description=(
        "Google Drive API v3 `files.export` 호출. Google 문서·스프레드시트 등에 사용. "
        "본문: `access_token`, `file_id`, 선택 `export_mime_type` "
        "(기본 `text/plain`, 시트는 `text/csv` 권장)."
    ),
    response_model=None,
)
def post_drive_export_text(body: GoogleDriveExportTextRequest) -> Dict[str, Any]:
    mime = (body.export_mime_type or "text/plain").strip()
    if mime not in _DRIVE_EXPORT_MIME_ALLOWLIST:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"export_mime_type 은 다음 중 하나여야 합니다: {', '.join(sorted(_DRIVE_EXPORT_MIME_ALLOWLIST))}",
        )
    fid = body.file_id.strip()
    url = f"{GOOGLE_DRIVE_V3_FILES}/{quote(fid, safe='')}/export"
    try:
        r = requests.get(
            url,
            params={"mimeType": mime},
            headers={"Authorization": f"Bearer {body.access_token.strip()}"},
            timeout=90,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Drive export 요청 실패: {exc}",
        ) from exc

    if r.status_code != 200:
        detail: str
        try:
            err = r.json()
            detail = str(
                err.get("error", {}).get("message")
                or err.get("error_description")
                or err.get("error")
                or r.text
                or r.reason
            )[:1200]
        except ValueError:
            detail = (r.text or r.reason or "Drive export 실패")[:1200]
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)

    text = r.text
    return {
        "success": True,
        "data": {
            "file_id": fid,
            "export_mime_type": mime,
            "content": text,
            "char_count": len(text),
        },
    }


@router.post(
    "/drive/files/list-importable-in-folder",
    summary="폴더(하위 선택적) → 가져올 수 있는 파일 ID 목록",
    description=(
        "Drive API v3 `files.list` 로 `folder_id` 아래를 조회합니다. "
        "`max_folder_depth`=1 이면 직계만, 그 이상이면 하위 폴더를 BFS 로 탐색합니다. "
        "Google 문서·슬라이드·시트·PDF 만 반환합니다. 파일은 최대 "
        f"{_MAX_FOLDER_LIST_FILES}개, 폴더 `files.list` 호출은 최대 {_MAX_RECURSIVE_FOLDER_LIST_CALLS}회입니다."
    ),
    response_model=None,
)
def post_drive_list_importable_in_folder(body: GoogleDriveListImportableInFolderRequest) -> Dict[str, Any]:
    token = body.access_token.strip()
    folder_id = _strict_drive_resource_id(body.folder_id, "folder_id")
    depth = int(body.max_folder_depth)
    collected, truncated = _collect_importable_files_bfs(token, folder_id, depth)
    file_ids = [c["id"] for c in collected]
    return {
        "success": True,
        "data": {
            "file_ids": file_ids,
            "files": collected,
            "truncated": truncated,
            "count": len(file_ids),
            "max_folder_depth": depth,
        },
    }


@router.post(
    "/drive/files/fetch-pdf-text",
    summary="Drive PDF 바이너리 → 텍스트(alt=media + PyPDF2)",
    description=(
        "Google Drive API v3 `files.get` + `alt=media` 로 바이너리를 받은 뒤, "
        "프로젝트 노트북과 동일한 `_extract_text_from_upload`(PyPDF2)로 텍스트를 뽑습니다."
    ),
    response_model=None,
)
def post_drive_fetch_pdf_text(body: GoogleDriveFetchPdfTextRequest) -> Dict[str, Any]:
    from api.project_session_api import _extract_text_from_upload

    fname = (body.filename_hint or "document.pdf").strip()
    if not fname.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="filename_hint 는 .pdf 로 끝나야 합니다.",
        )
    fid = body.file_id.strip()
    url = f"{GOOGLE_DRIVE_V3_FILES}/{quote(fid, safe='')}"
    try:
        r = requests.get(
            url,
            params={"alt": "media"},
            headers={"Authorization": f"Bearer {body.access_token.strip()}"},
            timeout=120,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Drive media 요청 실패: {exc}",
        ) from exc

    if r.status_code != 200:
        detail: str
        try:
            err = r.json()
            detail = str(
                err.get("error", {}).get("message")
                or err.get("error_description")
                or err.get("error")
                or r.text
                or r.reason
            )[:1200]
        except ValueError:
            detail = (r.text or r.reason or "Drive media 다운로드 실패")[:1200]
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)

    raw: bytes = r.content or b""
    if len(raw) > _MAX_DRIVE_MEDIA_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"파일 크기는 {_MAX_DRIVE_MEDIA_BYTES // (1024 * 1024)}MB 를 넘을 수 없습니다.",
        )

    tmp_path: Optional[Path] = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(raw)
            tmp_path = Path(tmp.name)
        title, content = _extract_text_from_upload(tmp_path, fname)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc)[:800],
        ) from exc
    finally:
        if tmp_path is not None:
            try:
                tmp_path.unlink(missing_ok=True)  # type: ignore[arg-type]
            except OSError:
                pass

    text = (content or "").strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="PDF에서 추출된 텍스트가 없습니다.",
        )
    return {
        "success": True,
        "data": {
            "file_id": fid,
            "title": (title or fname).strip() or fname,
            "content": text,
            "char_count": len(text),
        },
    }
