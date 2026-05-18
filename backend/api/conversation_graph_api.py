"""
대화 관계도 REST API — FastAPI (main_server 마운트)
"""
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Request

from api.conversation_graph import get_relationship_graph, list_uploads, save_upload

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["conversation-graph"])


@router.post("/conversations/upload")
async def api_conversations_upload(request: Request):
    """multipart(file) 또는 JSON { text, name, filename } 업로드."""
    try:
        content_type = (request.headers.get("content-type") or "").lower()
        if "application/json" in content_type:
            data = await request.json()
            content = (data.get("text") or "").strip()
            if not content:
                return {
                    "success": False,
                    "error": "파일 또는 text(대화 내용)이 필요합니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            display_name = data.get("name") or "대화"
            filename = data.get("filename") or "pasted.txt"
        else:
            form = await request.form()
            upload = form.get("file")
            if upload is None or not getattr(upload, "filename", None):
                return {
                    "success": False,
                    "error": "파일 또는 text(대화 내용)이 필요합니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            raw = await upload.read()
            content = raw.decode("utf-8", errors="replace") if isinstance(raw, bytes) else str(raw)
            display_name = form.get("name") or upload.filename
            filename = upload.filename
        result = save_upload(name=str(display_name), filename=str(filename), content=content)
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.exception("대화 업로드 실패")
        return {
            "success": False,
            "error": f"저장 실패: {e}",
            "timestamp": datetime.now().isoformat(),
        }


@router.get("/conversations")
async def api_conversations_list():
    try:
        items = list_uploads()
        return {
            "success": True,
            "data": items,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.exception("대화 목록 조회 실패")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }


@router.get("/conversations/{upload_id}/relationship-graph")
async def api_relationship_graph(
    upload_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    analysis_mode: Optional[str] = None,
):
    _ = analysis_mode  # 프론트 호환; 현재 standard/ai_enhanced 동일 그래프
    try:
        graph = get_relationship_graph(
            upload_id,
            start_date=(start_date or "").strip() or None,
            end_date=(end_date or "").strip() or None,
        )
        if graph.get("error"):
            return {
                "success": False,
                "error": graph["error"],
                "timestamp": datetime.now().isoformat(),
            }
        return {
            "success": True,
            "data": graph,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.exception("대화 관계도 조회 실패")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }
