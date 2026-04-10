"""
프로젝트 및 세션 관리 API
사이드바에서 사용하는 프로젝트/세션 CRUD 기능 제공
"""

import logging
import os
import json
import re
import tempfile
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple
from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile  # type: ignore[import-untyped]
from fastapi.responses import StreamingResponse  # type: ignore[import-untyped]
from pydantic import BaseModel, ConfigDict, Field, field_validator  # type: ignore[import-untyped]

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["projects", "sessions"])

# 프로젝트 데이터 디렉토리
PROJECTS_DIR = Path("project_data/projects")
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)

# 프로젝트별 노트북 LLM 학습용 컨텍스트 저장 디렉토리
PROJECT_KNOWLEDGE_DIR = Path("project_data/project_knowledge")
PROJECT_KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

# 프로젝트별 스튜디오 생성 이력 저장 디렉토리 (Google NotebookLM 스튜디오 출력 저장)
PROJECT_STUDIO_OUTPUTS_DIR = Path("project_data/project_studio_outputs")
PROJECT_STUDIO_OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)


# Pydantic 모델
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = ""
    tags: Optional[List[str]] = []


class ProjectCreate(ProjectBase):
    """프로젝트 생성 요청 (노트북 LLM 학습용 가이드라인 포함)"""
    initial_guidelines: Optional[List[str]] = None


class Project(ProjectBase):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "proj_123",
                "name": "새 프로젝트",
                "description": "프로젝트 설명",
                "tags": ["태그1", "태그2"],
                "status": "active",
                "messageCount": 0,
                "userId": "user123",
                "createdAt": "2026-01-22T09:00:00",
                "updatedAt": "2026-01-22T09:00:00",
                "settings": {
                    "aiModel": "chat",
                    "temperature": 0.8,
                    "maxTokens": 4096,
                },
            }
        }
    )
    id: str
    status: str = "active"
    messageCount: int = 0
    userId: str = "default"
    createdAt: str
    updatedAt: str
    settings: Dict[str, Any] = {
        "aiModel": "chat",
        "temperature": 0.8,
        "maxTokens": 4096,
    }


class SessionBase(BaseModel):
    projectId: str
    name: str


class SessionCreate(SessionBase):
    pass


class NotebookStudioGenerateRequest(BaseModel):
    """노트북 스튜디오 출력 생성 요청 (Google NotebookLM 스튜디오 스타일)"""
    type: str = Field(
        "summary",
        description="출력 유형: report, study_guide, quiz, summary, flashcards, "
        "video_overview, mindmap, infographic, slides, data_table",
    )


class AddNotebookSourceRequest(BaseModel):
    """노트북 소스 추가 요청 (Google NotebookLM '소스 추가' 스타일)"""
    title: str = Field(..., description="소스 제목")
    content: str = Field(..., description="소스 본문 (텍스트)")
    type: str = Field("text", description="소스 유형: text, url 등")


class AddNotebookSourceFromUrlRequest(BaseModel):
    """URL에서 소스 추가 요청"""
    url: str = Field(..., description="소스로 가져올 웹페이지 URL")


class AddNotebookSourceFromYoutubeUrlRequest(BaseModel):
    """YouTube 영상 URL 하나를 지식 소스로 추가 요청 (자막 추출 → 노트북 소스)"""
    url: str = Field(..., description="YouTube 영상 URL (예: https://www.youtube.com/watch?v=VIDEO_ID)")


class AddNotebookSourceFromYoutubeSearchRequest(BaseModel):
    """특정인/주제 YouTube 검색 후 자막 수집·노트북 소스 추가 요청"""
    query: str = Field(..., description="검색어 (예: 특정인 이름, 주제)")
    max_videos: int = Field(5, ge=1, le=15, description="수집할 영상 수 (1~15)")
    add_first_as_voice_source: bool = Field(
        False,
        description="True면 첫 영상 URL을 프로젝트 보이스 소스로도 등록 (TTS 목소리 학습용)",
    )


class AddVoiceSourceRequest(BaseModel):
    """노트북 LLM 보이스 소스 추가 (YouTube/TikTok URL → 목소리 학습)"""
    url: str = Field(..., description="연결 URL (목소리 학습에 사용할 영상 주소)")
    ref_text: Optional[str] = Field(None, description="참조 대본 (미입력 시 자동 추출 시도)")
    name: Optional[str] = Field(None, description="목소리 ID/이름 (구분용, 예: 홍길동)")
    reference_url: Optional[str] = Field(None, description="심화 학습용 추가 URL (같은 목소리 더 수집 시 품질 향상)")
    start_seconds: Optional[float] = Field(None, ge=0, description="해당 목소리만 쓰기: 구간 시작(초). 여러 화자 중 한 명만 쓸 때")
    end_seconds: Optional[float] = Field(None, ge=0, description="해당 목소리만 쓰기: 구간 끝(초)")


class NotebookLLMGenerateRequest(BaseModel):
    """노트북 LLM 자유 프롬프트 생성 요청 (프로젝트 컨텍스트 기반)"""
    prompt: str = Field(..., description="사용자 프롬프트")
    context: Optional[Dict[str, Any]] = Field(None, description="추가 컨텍스트")


class Session(SessionBase):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "session_123",
                "projectId": "proj_123",
                "name": "새 대화",
                "messages": [],
                "createdAt": "2026-01-22T09:00:00",
                "updatedAt": "2026-01-22T09:00:00",
                "metadata": {
                    "totalTokens": 0,
                    "avgResponseTime": 0,
                },
            }
        }
    )
    id: str
    messages: List[Dict[str, Any]] = []
    createdAt: str
    updatedAt: str
    metadata: Dict[str, Any] = {
        "totalTokens": 0,
        "avgResponseTime": 0,
    }


# 프로젝트 관리 함수
def get_project_file(project_id: str) -> Path:
    """프로젝트 파일 경로 반환"""
    return PROJECTS_DIR / f"{project_id}.json"


def load_project(project_id: str) -> Optional[Dict[str, Any]]:
    """프로젝트 로드"""
    project_file = get_project_file(project_id)
    if not project_file.exists():
        return None
    try:
        with open(project_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"프로젝트 로드 실패: {e}")
        return None


def save_project(project_data: Dict[str, Any]) -> bool:
    """프로젝트 저장"""
    try:
        project_file = get_project_file(project_data["id"])
        with open(project_file, "w", encoding="utf-8") as f:
            json.dump(project_data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f"프로젝트 저장 실패: {e}")
        return False


def _build_project_knowledge_text(
    name: str,
    description: Optional[str] = "",
    tags: Optional[List[str]] = None,
    initial_guidelines: Optional[List[str]] = None,
) -> str:
    """프로젝트 정보를 노트북 LLM용 소스(그라운딩) 텍스트로 생성 (Google NotebookLM 스타일)"""
    parts = [
        "=== 소스 기반 답변 지침 (Grounding Instructions) ===",
        "• 아래 [학습된 소스]는 이 프로젝트에 대해 업로드·학습된 정보입니다.",
        "• 답변은 반드시 이 소스 내용을 우선 근거로 하여 구성하세요.",
        "• 소스에 나온 사실·규칙·가이드라인과 배치되는 내용은 포함하지 마세요.",
        "• 소스에 없는 내용을 보충할 때는 '추정으로, 학습된 정보 밖의 내용입니다' 등으로 구분해 표시하세요.",
        "• 불확실한 부분은 추측임을 명시하세요.",
        "",
        "=== [학습된 소스] 프로젝트 개요 ===",
        "",
        f"[프로젝트 이름] {name}",
        "",
        f"[설명] {description or '(없음)'}",
        "",
    ]
    if tags:
        parts.append(f"[태그] {', '.join(tags)}")
        parts.append("")
    parts.append("=== [학습된 소스] 프로젝트 가이드라인·기준 ===")
    parts.append("")
    if initial_guidelines:
        for i, g in enumerate(initial_guidelines, 1):
            if (g or "").strip():
                parts.append(f"  {i}. {g.strip()}")
        parts.append("")
    else:
        parts.append("  (등록된 가이드라인 없음)")
        parts.append("")
    parts.append("=== 답변 시 준수 사항 ===")
    parts.append(
        "위 [학습된 소스]만을 기준으로 이 프로젝트와 관련된 질문·요구에 맞는 답변을 제공하고, "
        "소스와 맞지 않는 내용은 포함하지 마세요."
    )
    return "\n".join(parts)


def get_project_knowledge_file(project_id: str) -> Path:
    """프로젝트 노트북 컨텍스트 파일 경로"""
    return PROJECT_KNOWLEDGE_DIR / f"{project_id}.json"


def save_project_notebook_context(
    project_id: str,
    name: str,
    description: Optional[str] = "",
    tags: Optional[List[str]] = None,
    initial_guidelines: Optional[List[str]] = None,
) -> bool:
    """프로젝트 생성/수정 시 노트북 LLM 학습용 컨텍스트 저장"""
    try:
        text = _build_project_knowledge_text(
            name=name,
            description=description,
            tags=tags or [],
            initial_guidelines=initial_guidelines or [],
        )
        data = {
            "project_id": project_id,
            "context_text": text,
            "updated_at": datetime.now().isoformat(),
            "sources": [
                {
                    "id": "overview",
                    "type": "overview",
                    "title": name or "프로젝트 개요",
                    "content": (description or "") + "\n" + (
                        "\n".join(initial_guidelines or [])
                    ),
                    "enabled": True,
                }
            ],
        }
        path = get_project_knowledge_file(project_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"프로젝트 노트북 컨텍스트 저장 완료: {project_id}")
        return True
    except Exception as e:
        logger.error(f"프로젝트 노트북 컨텍스트 저장 실패: {e}")
        return False


def load_project_notebook_context(project_id: str) -> Optional[str]:
    """프로젝트 노트북 컨텍스트 텍스트 로드 (없으면 None)"""
    return load_project_notebook_context_filtered(project_id, source_ids=None)


def load_project_notebook_context_filtered(
    project_id: str, source_ids: Optional[List[str]] = None
) -> Optional[str]:
    """프로젝트 노트북 컨텍스트 로드. source_ids가 있으면 해당 소스만 포함.

    - source_ids is None: 전체 컨텍스트 (기존 동작)
    - source_ids == []: 프로젝트 개요만 (학습된 소스 없음)
    - source_ids == [id1, id2...]: 개요 + 해당 소스만
    """
    data = load_project_notebook_data(project_id)
    if not data:
        return None
    project_data = load_project(project_id)
    if not project_data:
        return None
    sources = list(data.get("sources") or [])
    if source_ids is not None:
        id_set = set(source_ids)
        filtered = []
        for s in sources:
            sid = s.get("id")
            if sid == "overview" or s.get("type") == "overview":
                filtered.append(s)
            elif sid in id_set:
                filtered.append(s)
        sources = filtered
    return _rebuild_context_text_from_sources(
        project_id, project_data, sources
    )


def load_project_notebook_data(project_id: str) -> Optional[Dict[str, Any]]:
    """프로젝트 노트북 전체 데이터 로드 (context_text, sources, source_count 등)."""
    path = get_project_knowledge_file(project_id)
    if not path.exists():
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"프로젝트 노트북 데이터 로드 실패: {e}")
        return None


def get_project_source_count(project_id: str) -> int:
    """대화/노트북에서 사용 중인 소스 개수 (Google NotebookLM '소스 N개' 용)."""
    data = load_project_notebook_data(project_id)
    if not data:
        return 0
    sources = data.get("sources")
    if isinstance(sources, list):
        enabled = [s for s in sources if s.get("enabled", True)]
        return len(enabled)
    # 레거시: 프로젝트 개요+가이드라인 1개 소스로 간주
    return 1 if data.get("context_text") else 0


def get_project_voice_sources(project_id: str) -> List[Dict[str, Any]]:
    """노트북 LLM 프로젝트의 보이스 소스 목록 (YouTube/TikTok URL 등)."""
    data = load_project_notebook_data(project_id)
    if not data:
        return []
    voice_sources = data.get("voice_sources")
    return list(voice_sources) if isinstance(voice_sources, list) else []


def add_project_voice_source(
    project_id: str,
    url: str,
    ref_text: Optional[str] = None,
    name: Optional[str] = None,
    reference_url: Optional[str] = None,
    start_seconds: Optional[float] = None,
    end_seconds: Optional[float] = None,
) -> Optional[Dict[str, Any]]:
    """프로젝트에 보이스 소스(YouTube/TikTok URL) 추가. 노트북 LLM 정보·영상 학습용."""
    project_data = load_project(project_id)
    if not project_data:
        return None
    data = load_project_notebook_data(project_id)
    if not data:
        save_project_notebook_context(
            project_id=project_id,
            name=project_data.get("name", ""),
            description=project_data.get("description", ""),
            tags=project_data.get("tags"),
            initial_guidelines=project_data.get("initial_guidelines"),
        )
        data = load_project_notebook_data(project_id)
    if not data:
        return None
    voice_sources = list(data.get("voice_sources") or [])
    new_id = f"voice_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(voice_sources)}"
    new_source = {
        "id": new_id,
        "url": (url or "").strip(),
        "ref_text": (ref_text or "").strip() or None,
        "created_at": datetime.now().isoformat(),
    }
    if name is not None and (name or "").strip():
        new_source["name"] = (name or "").strip()
    if reference_url is not None and (reference_url or "").strip():
        new_source["reference_url"] = (reference_url or "").strip()
    if start_seconds is not None:
        new_source["start_seconds"] = start_seconds
    if end_seconds is not None:
        new_source["end_seconds"] = end_seconds
    voice_sources.append(new_source)
    data["voice_sources"] = voice_sources
    data["updated_at"] = datetime.now().isoformat()
    path = get_project_knowledge_file(project_id)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info("프로젝트 보이스 소스 추가: %s, id=%s", project_id, new_id)
        return new_source
    except Exception as e:
        logger.error("보이스 소스 저장 실패: %s", e)
        return None


def delete_project_voice_source(project_id: str, source_id: str) -> bool:
    """프로젝트 보이스 소스 삭제."""
    data = load_project_notebook_data(project_id)
    if not data:
        return False
    voice_sources = list(data.get("voice_sources") or [])
    new_sources = [s for s in voice_sources if s.get("id") != source_id]
    if len(new_sources) == len(voice_sources):
        return False
    data["voice_sources"] = new_sources
    data["updated_at"] = datetime.now().isoformat()
    path = get_project_knowledge_file(project_id)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error("보이스 소스 삭제 저장 실패: %s", e)
        return False


def get_project_studio_outputs_file(project_id: str) -> Path:
    """프로젝트 스튜디오 출력 이력 파일 경로"""
    return PROJECT_STUDIO_OUTPUTS_DIR / f"{project_id}.json"


def load_project_studio_outputs(project_id: str) -> List[Dict[str, Any]]:
    """프로젝트별 스튜디오 생성 이력 목록 로드"""
    path = get_project_studio_outputs_file(project_id)
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        outputs = data.get("outputs")
        return list(outputs) if isinstance(outputs, list) else []
    except Exception as e:
        logger.warning(f"스튜디오 출력 목록 로드 실패: {e}")
        return []


def _fetch_url_and_extract_text(url: str) -> Tuple[str, str]:
    """URL을 조회해 본문 텍스트와 제목을 추출합니다. (title, content)"""
    try:
        import requests  # type: ignore[import-untyped]
        resp = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0 (compatible; NotebookLM/1.0)"})
        resp.raise_for_status()
        text = resp.text
        if not text:
            return url[:80], ""
        # 제목 추출
        title_match = re.search(r"<title[^>]*>([^<]+)</title>", text, re.I | re.DOTALL)
        title = (title_match.group(1).strip() if title_match else url)[:200]
        # HTML 태그 제거 (간단한 방식)
        body = re.sub(r"<script[^>]*>[\s\S]*?</script>", " ", text, flags=re.I)
        body = re.sub(r"<style[^>]*>[\s\S]*?</style>", " ", body, flags=re.I)
        body = re.sub(r"<[^>]+>", " ", body)
        body = re.sub(r"\s+", " ", body).strip()
        return title, (body[:50000] if body else "")
    except Exception as e:
        logger.warning(f"URL 텍스트 추출 실패 {url}: {e}")
        raise


def _youtube_search_videos(query: str, max_videos: int = 5) -> List[Dict[str, Any]]:
    """YouTube에서 검색어로 영상 목록 조회. 반환: [{"id", "title", "url"}, ...]"""
    try:
        import yt_dlp  # type: ignore[import-untyped]
    except ImportError:
        logger.warning("yt-dlp 미설치: pip install yt-dlp")
        return []
    search_url = f"ytsearch{max_videos}:{query.strip()}"
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,
        "skip_download": True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(search_url, download=False)
        if not info or "entries" not in info:
            return []
        entries = info["entries"] or []
        result = []
        for e in entries[:max_videos]:
            if not e or not isinstance(e, dict):
                continue
            vid = e.get("id")
            if not vid:
                url_raw = e.get("url") or ""
                if "youtube.com/watch?v=" in url_raw:
                    vid = url_raw.split("watch?v=")[-1].split("&")[0].strip()
                elif "youtu.be/" in url_raw:
                    vid = url_raw.split("youtu.be/")[-1].split("?")[0].strip()
                else:
                    continue
            title = (e.get("title") or "").strip() or f"영상 {vid}"
            url = e.get("url") or f"https://www.youtube.com/watch?v={vid}"
            result.append({"id": vid, "title": title, "url": url})
        return result
    except Exception as e:
        logger.warning(f"YouTube 검색 실패: {e}")
        return []


def _extract_youtube_video_id(url: str) -> Optional[str]:
    """YouTube URL에서 video_id 추출. 지원: youtube.com/watch?v=ID, youtu.be/ID."""
    url = (url or "").strip()
    if not url:
        return None
    if "youtube.com/watch?v=" in url:
        return url.split("watch?v=")[-1].split("&")[0].strip()
    if "youtu.be/" in url:
        return url.split("youtu.be/")[-1].split("?")[0].strip()
    return None


def _get_youtube_video_title(video_id: str) -> str:
    """YouTube 영상 제목 조회 (yt-dlp). 실패 시 'YouTube 영상 (video_id)' 반환."""
    try:
        import yt_dlp  # type: ignore[import-untyped]
        ydl_opts = {"quiet": True, "no_warnings": True, "skip_download": True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
        if info and isinstance(info.get("title"), str):
            return (info["title"] or "").strip()[:200] or f"YouTube 영상 ({video_id})"
    except Exception as e:
        logger.debug("영상 제목 조회 실패 %s: %s", video_id, e)
    return f"YouTube 영상 ({video_id})"


def _get_youtube_transcript(video_id: str) -> Optional[str]:
    """YouTube 영상 자막(자동/수동) 텍스트 추출. 실패 시 None."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi  # type: ignore[import-untyped]
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        if not transcript_list:
            return None
        parts = [t.get("text", "").strip() for t in transcript_list if t.get("text")]
        return "\n".join(parts).strip() if parts else None
    except ImportError:
        logger.warning("youtube_transcript_api 미설치: pip install youtube-transcript-api")
        return None
    except Exception as e:
        logger.warning(f"자막 추출 실패 {video_id}: {e}")
        return None


def _extract_text_from_upload(file_path: Path, filename: str) -> Tuple[str, str]:
    """업로드 파일에서 텍스트 추출. (title, content). txt, pdf, docx, doc, 이미지(png/jpg 등) 지원."""
    name = (filename or "file").rsplit(".", 1)[0][:200]
    ext = (filename or "").lower().rsplit(".", 1)[-1] if "." in (filename or "") else ""
    # 텍스트
    if ext == "txt" or not ext:
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return name, f.read()[:100000]
        except Exception as e:
            logger.warning(f"텍스트 파일 읽기 실패: {e}")
            raise ValueError(f"텍스트 파일 읽기 실패: {e}") from e
    # PDF
    if ext == "pdf":
        try:
            import PyPDF2  # type: ignore[import-untyped]
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                parts = []
                for i in range(min(len(reader.pages), 100)):
                    parts.append(reader.pages[i].extract_text() or "")
                return name, ("\n".join(parts))[:100000]
        except ImportError:
            raise ValueError("PDF 추출을 위해 PyPDF2가 필요합니다. pip install PyPDF2 를 실행해 주세요.") from None
        except Exception as e:
            logger.warning(f"PDF 텍스트 추출 실패: {e}")
            raise ValueError(f"PDF 텍스트 추출 실패: {e}") from e
    # 워드(docx, doc)
    if ext in ("docx", "doc"):
        try:
            import docx as docx_module  # type: ignore
        except ImportError:
            raise ValueError("워드 파일 추출을 위해 python-docx가 필요합니다. pip install python-docx 를 실행해 주세요.") from None
        try:
            with open(file_path, "rb") as f:
                doc = docx_module.Document(f)
            text = "\n".join(p.text for p in doc.paragraphs if p.text).strip()
            return name, (text or "(내용 없음)")[:100000]
        except Exception as e:
            logger.warning(f"워드(docx) 텍스트 추출 실패: {e}")
            raise ValueError(f"워드 파일 추출 실패: {e}") from e
    # 이미지: 텍스트 추출 불가 → 플레이스홀더로 소스에 등록 (나중에 vision/OCR 연동 가능)
    if ext in ("png", "jpg", "jpeg", "gif", "webp"):
        placeholder = (
            f"[이미지 파일: {filename}. 시각 내용은 현재 텍스트로 추출되지 않습니다. "
            "이미지 설명이 필요하면 별도로 텍스트로 입력해 주세요.]"
        )
        return name, placeholder
    raise ValueError(
        "지원 형식: .txt, .pdf, .docx, .doc, .png, .jpg, .jpeg, .gif, .webp"
    )


def append_project_studio_output(
    project_id: str,
    output_type: str,
    content: str,
) -> Dict[str, Any]:
    """스튜디오 생성 결과를 프로젝트 이력에 추가"""
    outputs = load_project_studio_outputs(project_id)
    out_id = f"studio_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(outputs)}"
    entry = {
        "id": out_id,
        "type": output_type,
        "content": content or "",
        "created_at": datetime.now().isoformat(),
    }
    outputs.append(entry)
    path = get_project_studio_outputs_file(project_id)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"outputs": outputs}, f, ensure_ascii=False, indent=2)
        return entry
    except Exception as e:
        logger.error(f"스튜디오 출력 저장 실패: {e}")
        raise


def _rebuild_context_text_from_sources(
    project_id: str,
    project_data: Dict[str, Any],
    sources: List[Dict[str, Any]],
) -> str:
    """프로젝트 개요 + 추가 소스 내용으로 context_text 재구성."""
    overview = _build_project_knowledge_text(
        name=project_data.get("name", ""),
        description=project_data.get("description", ""),
        tags=project_data.get("tags"),
        initial_guidelines=project_data.get("initial_guidelines"),
    )
    extra_parts = []
    for s in sources:
        if s.get("id") == "overview" or s.get("type") == "overview":
            continue
        if not s.get("enabled", True):
            continue
        title = s.get("title", "추가 소스")
        content = (s.get("content") or "").strip()
        if content:
            extra_parts.append(f"\n\n=== [학습된 소스] {title} ===\n\n{content}")
    return overview + "".join(extra_parts)


def add_project_notebook_source(
    project_id: str,
    title: str,
    content: str,
    source_type: str = "text",
) -> Optional[Dict[str, Any]]:
    """프로젝트 노트북에 소스 추가 (Google NotebookLM '소스 추가' 스타일). context_text 재구성 후 저장."""
    project_data = load_project(project_id)
    if not project_data:
        return None
    data = load_project_notebook_data(project_id)
    if not data:
        save_project_notebook_context(
            project_id=project_id,
            name=project_data.get("name", ""),
            description=project_data.get("description", ""),
            tags=project_data.get("tags"),
            initial_guidelines=project_data.get("initial_guidelines"),
        )
        data = load_project_notebook_data(project_id)
    if not data:
        return None
    sources = list(data.get("sources") or [])
    new_id = f"source_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(sources)}"
    new_source = {
        "id": new_id,
        "type": source_type or "text",
        "title": (title or "제목 없음").strip(),
        "content": (content or "").strip(),
        "enabled": True,
    }
    sources.append(new_source)
    data["context_text"] = _rebuild_context_text_from_sources(
        project_id, project_data, sources
    )
    data["sources"] = sources
    data["updated_at"] = datetime.now().isoformat()
    path = get_project_knowledge_file(project_id)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"프로젝트 노트북 소스 추가 완료: {project_id}, id={new_id}")
        return new_source
    except Exception as e:
        logger.error(f"노트북 소스 저장 실패: {e}")
        return None


def delete_project_notebook_source(
    project_id: str, source_id: str
) -> bool:
    """프로젝트 노트북에서 소스 제거 (overview는 삭제 불가). context_text 재구성 후 저장."""
    if source_id == "overview":
        return False
    project_data = load_project(project_id)
    if not project_data:
        return False
    data = load_project_notebook_data(project_id)
    if not data:
        return False
    sources = list(data.get("sources") or [])
    new_sources = [s for s in sources if s.get("id") != source_id]
    if len(new_sources) == len(sources):
        return False
    data["context_text"] = _rebuild_context_text_from_sources(
        project_id, project_data, new_sources
    )
    data["sources"] = new_sources
    data["updated_at"] = datetime.now().isoformat()
    path = get_project_knowledge_file(project_id)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"프로젝트 노트북 소스 삭제 완료: {project_id}, id={source_id}")
        return True
    except Exception as e:
        logger.error(f"노트북 소스 삭제 저장 실패: {e}")
        return False


def load_all_projects() -> List[Dict[str, Any]]:
    """모든 프로젝트 로드"""
    projects = []
    if not PROJECTS_DIR.exists():
        return projects

    for project_file in PROJECTS_DIR.glob("*.json"):
        try:
            with open(project_file, "r", encoding="utf-8") as f:
                project_data = json.load(f)
                projects.append(project_data)
        except Exception as e:
            logger.error(f"프로젝트 파일 로드 실패 {project_file}: {e}")
    return projects


# 세션 관리 함수
def get_sessions_dir(project_id: str) -> Path:
    """세션 디렉토리 경로 반환"""
    sessions_dir = PROJECTS_DIR / f"{project_id}_sessions"
    sessions_dir.mkdir(parents=True, exist_ok=True)
    return sessions_dir


def get_session_file(project_id: str, session_id: str) -> Path:
    """세션 파일 경로 반환"""
    return get_sessions_dir(project_id) / f"{session_id}.json"


def load_session(project_id: str, session_id: str) -> Optional[Dict[str, Any]]:
    """세션 로드"""
    session_file = get_session_file(project_id, session_id)
    if not session_file.exists():
        return None
    try:
        with open(session_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"세션 로드 실패: {e}")
        return None


def save_session(session_data: Dict[str, Any]) -> bool:
    """세션 저장"""
    try:
        session_file = get_session_file(
            session_data["projectId"], session_data["id"]
        )
        with open(session_file, "w", encoding="utf-8") as f:
            json.dump(session_data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f"세션 저장 실패: {e}")
        return False


def load_all_sessions(project_id: str) -> List[Dict[str, Any]]:
    """프로젝트의 모든 세션 로드"""
    sessions = []
    sessions_dir = get_sessions_dir(project_id)
    if not sessions_dir.exists():
        return sessions

    for session_file in sessions_dir.glob("*.json"):
        try:
            with open(session_file, "r", encoding="utf-8") as f:
                session_data = json.load(f)
                sessions.append(session_data)
        except Exception as e:
            logger.error(f"세션 파일 로드 실패 {session_file}: {e}")
    return sessions


# 프로젝트 API 엔드포인트
@router.get("/projects", summary="모든 프로젝트 조회")
async def get_projects() -> Dict[str, Any]:
    """모든 프로젝트 목록 조회 (Google NotebookLM 스타일로 소스 개수 포함)"""
    try:
        projects = load_all_projects()
        for p in projects:
            p["source_count"] = get_project_source_count(p.get("id", ""))
        return {
            "success": True,
            "data": projects,
            "count": len(projects),
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"프로젝트 조회 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "프로젝트 조회 실패",
                "message": "프로젝트 목록을 불러오는 중 오류가 발생했습니다.",
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.post("/projects", summary="새 프로젝트 생성")
async def create_project(project: ProjectCreate) -> Dict[str, Any]:
    """새 프로젝트 생성"""
    try:
        project_id = f"proj_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(project.name) % 10000:04d}"
        now = datetime.now().isoformat()

        project_data = {
            "id": project_id,
            "name": project.name,
            "description": project.description or "",
            "tags": project.tags or [],
            "initial_guidelines": project.initial_guidelines or [],
            "status": "active",
            "messageCount": 0,
            "userId": "default",
            "createdAt": now,
            "updatedAt": now,
            "settings": {
                "aiModel": "chat",
                "temperature": 0.8,
                "maxTokens": 4096,
            },
        }

        if save_project(project_data):
            save_project_notebook_context(
                project_id=project_id,
                name=project.name,
                description=project.description or "",
                tags=project.tags,
                initial_guidelines=project.initial_guidelines,
            )
            logger.info(f"프로젝트 생성 성공: {project_id}")
            return {
                "success": True,
                "data": project_data,
                "timestamp": datetime.now().isoformat(),
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "프로젝트 저장 실패",
                    "message": "프로젝트를 저장하는 중 오류가 발생했습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 생성 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "프로젝트 생성 실패",
                "message": f"프로젝트 생성 중 오류가 발생했습니다: {str(e)}",
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.get("/projects/{project_id}", summary="특정 프로젝트 조회")
async def get_project(project_id: str) -> Dict[str, Any]:
    """특정 프로젝트 조회"""
    try:
        project_data = load_project(project_id)
        if not project_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "message": f"ID '{project_id}'에 해당하는 프로젝트가 존재하지 않습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )

        return {
            "success": True,
            "data": project_data,
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 조회 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "프로젝트 조회 실패",
                "message": "프로젝트 정보를 불러오는 중 오류가 발생했습니다.",
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.get(
    "/projects/{project_id}/analytics",
    summary="프로젝트별 사용 통계 (세션 수·메시지 수·소스 수)",
)
async def get_project_analytics(project_id: str) -> Dict[str, Any]:
    """프로젝트별 사용 통계 — 세션 수, 총 메시지 수, 노트북 소스 수. AnalyticsView 프로젝트별 리포팅용."""
    try:
        project_data = load_project(project_id)
        if not project_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "message": f"ID '{project_id}'에 해당하는 프로젝트가 존재하지 않습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        sessions = load_all_sessions(project_id)
        total_messages = sum(
            len(s.get("messages", [])) if isinstance(s.get("messages"), list) else 0
            for s in sessions
        )
        source_count = get_project_source_count(project_id)
        return {
            "success": True,
            "data": {
                "project_id": project_id,
                "project_name": project_data.get("name", ""),
                "session_count": len(sessions),
                "total_messages": total_messages,
                "source_count": source_count,
            },
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 분석 조회 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "프로젝트 분석 조회 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.get(
    "/projects/{project_id}/notebook-context",
    summary="프로젝트 노트북 LLM 컨텍스트 조회",
)
async def get_project_notebook_context(project_id: str) -> Dict[str, Any]:
    """프로젝트 생성 시 저장한 노트북 LLM 학습용 컨텍스트 텍스트를 반환합니다.
    Google NotebookLM 스타일로 소스 개수(source_count)를 함께 반환합니다.
    """
    try:
        data = load_project_notebook_data(project_id)
        if data is None:
            return {
                "success": True,
                "data": {
                    "context": "",
                    "has_context": False,
                    "source_count": 0,
                },
                "timestamp": datetime.now().isoformat(),
            }
        context_text = data.get("context_text") or ""
        source_count = get_project_source_count(project_id)
        sources = data.get("sources")
        return {
            "success": True,
            "data": {
                "context": context_text,
                "has_context": bool(context_text.strip()),
                "source_count": source_count,
                "sources": sources if isinstance(sources, list) else None,
            },
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"프로젝트 노트북 컨텍스트 조회 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "노트북 컨텍스트 조회 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.get(
    "/projects/{project_id}/notebook-llm/status",
    summary="프로젝트 노트북 LLM 상태 (학습된 소스 유무)",
)
async def get_project_notebook_llm_status(project_id: str) -> Dict[str, Any]:
    """프로젝트에 노트북 컨텍스트가 있으면 available=True. 프론트 노트북 LLM 화면 상태 표시용."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "프로젝트를 찾을 수 없습니다", "timestamp": datetime.now().isoformat()},
            )
        context_text = load_project_notebook_context(project_id)
        has_context = bool((context_text or "").strip())
        return {
            "success": True,
            "data": {
                "available": has_context,
                "models": ["project-notebook"] if has_context else [],
            },
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"노트북 LLM 상태 조회 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "상태 조회 실패", "message": str(e), "timestamp": datetime.now().isoformat()},
        )


@router.post(
    "/projects/{project_id}/notebook-llm/generate",
    summary="프로젝트 노트북 LLM 자유 프롬프트 생성",
)
async def generate_project_notebook_llm(project_id: str, body: NotebookLLMGenerateRequest) -> Dict[str, Any]:
    """프로젝트 학습 컨텍스트를 반영해 사용자 프롬프트에 대한 답변을 생성합니다 (NotebookLLM 화면 연동)."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "프로젝트를 찾을 수 없습니다", "timestamp": datetime.now().isoformat()},
            )
        context_text = load_project_notebook_context(project_id)
        if not (context_text or "").strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "학습된 소스 없음",
                    "message": "먼저 프로젝트에 소스를 추가하거나 가이드라인을 설정해 주세요.",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        start = time.time()
        prompt = (body.prompt or "").strip()
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "프롬프트가 비어 있습니다", "timestamp": datetime.now().isoformat()},
            )
        ctx = body.context or {}
        ctx["projectId"] = project_id
        ctx["project_id"] = project_id
        try:
            from api.unified_chat_api import generate_chat_response
            content = await generate_chat_response(prompt, "detailed", ctx)
        except Exception as e:
            logger.warning(f"노트북 LLM 생성 중 LLM 호출 실패: {e}")
            content = f"※ 생성 실패: {e}. 프로젝트 학습 정보는 있으나 답변 생성에 실패했습니다."
        elapsed = time.time() - start
        content_str = content or ""
        return {
            "success": True,
            "data": {
                "content": content_str,
                "modelUsed": "project-notebook",
                "processingTime": round(elapsed, 2),
                "confidence": 0.9,
                "tokensUsed": 0,
                "mode": "project",
                "timestamp": datetime.now().isoformat(),
            },
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"노트북 LLM 생성 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "생성 실패", "message": str(e), "timestamp": datetime.now().isoformat()},
        )


_CHUNK_SIZE = 80


async def _stream_project_notebook_ndjson(project_id: str, prompt: str, context: Optional[Dict[str, Any]]):
    """프로젝트 노트북 LLM 응답을 NDJSON 라인으로 스트리밍 (프론트 notebookLLMStreamingService 호환)."""
    if not load_project(project_id):
        yield json.dumps({"error": "프로젝트를 찾을 수 없습니다"}) + "\n"
        return
    context_text = load_project_notebook_context(project_id)
    if not (context_text or "").strip():
        yield json.dumps({"error": "학습된 소스 없음"}) + "\n"
        return
    ctx = context or {}
    ctx["projectId"] = project_id
    ctx["project_id"] = project_id
    try:
        from api.unified_chat_api import generate_chat_response
        content = await generate_chat_response(prompt, "detailed", ctx)
    except Exception as e:
        logger.warning(f"노트북 LLM 스트리밍 중 LLM 호출 실패: {e}")
        content = f"※ 생성 실패: {e}. 프로젝트 학습 정보는 있으나 답변 생성에 실패했습니다."
    content_str = content or ""
    for i in range(0, len(content_str), _CHUNK_SIZE):
        chunk = content_str[i : i + _CHUNK_SIZE]
        yield json.dumps({"content": chunk, "done": False}) + "\n"
    yield json.dumps({"content": "", "done": True}) + "\n"


@router.post(
    "/projects/{project_id}/notebook-llm/stream",
    summary="프로젝트 노트북 LLM 스트리밍 (NDJSON)",
)
async def stream_project_notebook_llm(project_id: str, body: NotebookLLMGenerateRequest):
    """프로젝트 학습 컨텍스트 기반 답변을 NDJSON 라인으로 스트리밍 (NotebookLLM 스트리밍 모드)."""
    prompt = (body.prompt or "").strip()
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "프롬프트가 비어 있습니다", "timestamp": datetime.now().isoformat()},
        )
    if not load_project(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "프로젝트를 찾을 수 없습니다", "timestamp": datetime.now().isoformat()},
        )
    context_text = load_project_notebook_context(project_id)
    if not (context_text or "").strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "학습된 소스 없음",
                "message": "먼저 프로젝트에 소스를 추가하거나 가이드라인을 설정해 주세요.",
                "timestamp": datetime.now().isoformat(),
            },
        )
    return StreamingResponse(
        _stream_project_notebook_ndjson(project_id, prompt, body.context),
        media_type="application/x-ndjson",
    )


@router.put("/projects/{project_id}", summary="프로젝트 업데이트")
async def update_project(
    project_id: str, updates: Dict[str, Any]
) -> Dict[str, Any]:
    """프로젝트 업데이트"""
    try:
        project_data = load_project(project_id)
        if not project_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "message": f"ID '{project_id}'에 해당하는 프로젝트가 존재하지 않습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )

        # 업데이트 적용
        project_data.update(updates)
        project_data["updatedAt"] = datetime.now().isoformat()

        if save_project(project_data):
            if any(k in updates for k in ("name", "description", "tags", "initial_guidelines")):
                save_project_notebook_context(
                    project_id=project_id,
                    name=project_data.get("name", ""),
                    description=project_data.get("description", ""),
                    tags=project_data.get("tags"),
                    initial_guidelines=project_data.get("initial_guidelines"),
                )
            return {
                "success": True,
                "data": project_data,
                "timestamp": datetime.now().isoformat(),
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "프로젝트 저장 실패",
                    "message": "프로젝트를 저장하는 중 오류가 발생했습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 업데이트 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "프로젝트 업데이트 실패",
                "message": "프로젝트를 업데이트하는 중 오류가 발생했습니다.",
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.delete("/projects/{project_id}", summary="프로젝트 삭제")
async def delete_project(project_id: str) -> Dict[str, Any]:
    """프로젝트 삭제"""
    try:
        project_file = get_project_file(project_id)
        if not project_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "message": f"ID '{project_id}'에 해당하는 프로젝트가 존재하지 않습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )

        project_file.unlink()
        # 노트북 LLM 컨텍스트 파일도 함께 삭제
        knowledge_file = get_project_knowledge_file(project_id)
        if knowledge_file.exists():
            try:
                knowledge_file.unlink()
                logger.info(f"프로젝트 노트북 컨텍스트 삭제: {project_id}")
            except OSError as e:
                logger.warning(f"노트북 컨텍스트 파일 삭제 실패(무시): {e}")
        logger.info(f"프로젝트 삭제 성공: {project_id}")

        return {
            "success": True,
            "message": "프로젝트가 삭제되었습니다",
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 삭제 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "프로젝트 삭제 실패",
                "message": "프로젝트를 삭제하는 중 오류가 발생했습니다.",
                "timestamp": datetime.now().isoformat(),
            }
        )


# 스튜디오 출력 유형별 프롬프트 (Google NotebookLM: 보고서, 학습가이드, 퀴즈 등)
@router.post(
    "/projects/{project_id}/notebook-sources",
    summary="노트북 소스 추가 (Google NotebookLM '소스 추가' 스타일)",
)
async def add_notebook_source(
    project_id: str, body: AddNotebookSourceRequest
) -> Dict[str, Any]:
    """프로젝트에 학습 소스를 추가합니다. 대화/스튜디오 시 반영됩니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "message": f"ID '{project_id}'에 해당하는 프로젝트가 없습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        new_source = add_project_notebook_source(
            project_id=project_id,
            title=body.title,
            content=body.content,
            source_type=(body.type or "text").strip().lower(),
        )
        if not new_source:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "소스 추가 실패",
                    "message": "소스 저장 중 오류가 발생했습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        return {
            "success": True,
            "data": {
                "source": new_source,
                "source_count": get_project_source_count(project_id),
            },
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"노트북 소스 추가 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "소스 추가 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.post(
    "/projects/{project_id}/notebook-sources/from-url",
    summary="URL에서 소스 추가 (웹페이지 텍스트 추출)",
)
async def add_notebook_source_from_url(
    project_id: str, body: AddNotebookSourceFromUrlRequest
) -> Dict[str, Any]:
    """URL을 조회해 본문을 추출한 뒤 노트북 소스로 추가합니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        url = (body.url or "").strip()
        if not url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "url이 비어 있습니다", "timestamp": datetime.now().isoformat()},
            )
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        title, content = _fetch_url_and_extract_text(url)
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "해당 URL에서 추출할 텍스트가 없습니다",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        new_source = add_project_notebook_source(
            project_id=project_id,
            title=title or url[:80],
            content=content,
            source_type="url",
        )
        if not new_source:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "소스 추가 실패",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        return {
            "success": True,
            "data": {
                "source": new_source,
                "source_count": get_project_source_count(project_id),
            },
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"URL 소스 추가 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "URL 소스 추가 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.post(
    "/projects/{project_id}/notebook-sources/from-youtube-url",
    summary="YouTube 영상 URL 하나를 자막 추출해 노트북 지식 소스로 추가",
)
async def add_notebook_source_from_youtube_url(
    project_id: str, body: AddNotebookSourceFromYoutubeUrlRequest
) -> Dict[str, Any]:
    """YouTube 영상 URL을 입력하면 자막(자동/수동)을 추출해 프로젝트 노트북 지식으로 추가합니다. 대화/노트북 LLM이 이 내용을 근거로 답변합니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        url = (body.url or "").strip()
        if not url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "url을 입력해주세요", "timestamp": datetime.now().isoformat()},
            )
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        video_id = _extract_youtube_video_id(url)
        if not video_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "유효한 YouTube URL이 아닙니다. youtube.com/watch?v=... 또는 youtu.be/... 형식으로 입력해주세요.",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        transcript = _get_youtube_transcript(video_id)
        if not (transcript or "").strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "해당 영상에서 자막을 추출할 수 없습니다. 자막이 있는 영상인지 확인하거나, youtube-transcript-api 설치: pip install youtube-transcript-api",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        title = _get_youtube_video_title(video_id)
        new_source = add_project_notebook_source(
            project_id=project_id,
            title=title,
            content=transcript.strip(),
            source_type="youtube",
        )
        if not new_source:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "소스 추가 실패",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        return {
            "success": True,
            "data": {
                "source": new_source,
                "source_count": get_project_source_count(project_id),
            },
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"YouTube URL 소스 추가 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "YouTube 소스 추가 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            },
        )


@router.post(
    "/projects/{project_id}/notebook-sources/from-youtube-search",
    summary="특정인/주제 YouTube 검색 후 자막 수집·노트북 소스 추가 (딥러닝·학습용)",
)
async def add_notebook_sources_from_youtube_search(
    project_id: str, body: AddNotebookSourceFromYoutubeSearchRequest
) -> Dict[str, Any]:
    """YouTube에서 검색어(특정인 이름 등)로 영상을 찾고, 각 영상 자막을 추출해 노트북 소스로 추가합니다. 노트북 LLM이 해당 자료를 학습해 활용합니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        query = (body.query or "").strip()
        if not query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "검색어(query)를 입력해주세요", "timestamp": datetime.now().isoformat()},
            )
        max_videos = min(max(body.max_videos or 5, 1), 15)
        videos = _youtube_search_videos(query, max_videos)
        if not videos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "YouTube 검색 결과가 없거나 yt-dlp를 사용할 수 없습니다. pip install yt-dlp 후 다시 시도해주세요.",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        added_sources = []
        first_video_url = None
        for v in videos:
            video_id = v.get("id") or ""
            title = v.get("title") or f"영상 {video_id}"
            url = v.get("url") or f"https://www.youtube.com/watch?v={video_id}"
            if not video_id:
                continue
            transcript = _get_youtube_transcript(video_id)
            content = (transcript or "").strip()
            if not content:
                logger.info(f"자막 없음 스킵: {title} ({video_id})")
                continue
            new_source = add_project_notebook_source(
                project_id=project_id,
                title=title[:200],
                content=content[:100000],
                source_type="youtube",
            )
            if new_source:
                added_sources.append(new_source)
                if first_video_url is None:
                    first_video_url = url
        if not added_sources:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "자막을 추출할 수 있는 영상이 없습니다. youtube-transcript-api 설치: pip install youtube-transcript-api",
                    "timestamp": datetime.now().isoformat(),
                },
            )
        if body.add_first_as_voice_source and first_video_url:
            add_project_voice_source(project_id=project_id, url=first_video_url, ref_text=None)
        return {
            "success": True,
            "data": {
                "added_count": len(added_sources),
                "sources": added_sources,
                "source_count": get_project_source_count(project_id),
                "first_video_added_as_voice": body.add_first_as_voice_source and bool(first_video_url),
            },
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"YouTube 검색·소스 추가 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "YouTube 검색·소스 추가 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            },
        )


@router.post(
    "/projects/{project_id}/notebook-sources/from-file",
    summary="파일 업로드로 소스 추가 (PDF·워드·텍스트·이미지)",
)
async def add_notebook_source_from_file(
    project_id: str,
    file: UploadFile = File(..., description="PDF, 워드(docx/doc), TXT, 이미지(png/jpg 등)"),
) -> Dict[str, Any]:
    """업로드한 파일에서 텍스트를 추출해 노트북 소스(학습 자료)로 추가합니다. 이미지는 플레이스홀더로 등록됩니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        filename = file.filename or "unnamed"
        suffix = Path(filename).suffix or ".txt"
        content_bytes = await file.read()
        if len(content_bytes) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "파일 크기는 10MB 이하여야 합니다", "timestamp": datetime.now().isoformat()},
            )
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content_bytes)
            tmp_path = Path(tmp.name)
        try:
            title, content = _extract_text_from_upload(tmp_path, filename)
            if not (content or "").strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"error": "파일에서 추출된 텍스트가 없습니다", "timestamp": datetime.now().isoformat()},
                )
            source_type = "pdf" if filename.lower().endswith(".pdf") else ("doc" if filename.lower().endswith((".docx", ".doc")) else "text")
            new_source = add_project_notebook_source(
                project_id=project_id,
                title=title or filename,
                content=content.strip(),
                source_type=source_type,
            )
            if not new_source:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail={"error": "소스 저장 실패", "timestamp": datetime.now().isoformat()},
                )
            return {
                "success": True,
                "data": {
                    "source": new_source,
                    "source_count": get_project_source_count(project_id),
                },
                "timestamp": datetime.now().isoformat(),
            }
        finally:
            try:
                tmp_path.unlink(missing_ok=True)
            except OSError:
                pass
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "timestamp": datetime.now().isoformat()},
        ) from e
    except Exception as e:
        logger.error(f"파일 소스 추가 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "파일 소스 추가 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        ) from e


@router.delete(
    "/projects/{project_id}/notebook-sources/{source_id}",
    summary="노트북 소스 삭제 (프로젝트 개요 제외)",
)
async def delete_notebook_source(
    project_id: str, source_id: str
) -> Dict[str, Any]:
    """추가한 학습 소스를 삭제합니다. 프로젝트 개요(overview)는 삭제할 수 없습니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "message": f"ID '{project_id}'에 해당하는 프로젝트가 없습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        if source_id == "overview":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "프로젝트 개요는 삭제할 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        ok = delete_project_notebook_source(project_id, source_id)
        if not ok:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "소스를 찾을 수 없습니다",
                    "message": f"source_id '{source_id}'가 없거나 이미 삭제되었습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        return {
            "success": True,
            "data": {"source_count": get_project_source_count(project_id)},
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"노트북 소스 삭제 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "소스 삭제 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.get(
    "/projects/{project_id}/voice-sources",
    summary="노트북 LLM 보이스 소스 목록 (YouTube/TikTok URL)",
)
async def get_voice_sources(project_id: str) -> Dict[str, Any]:
    """프로젝트에 등록된 보이스 소스(영상 URL) 목록을 반환합니다. 해당 목소리로 TTS 생성 시 사용."""
    if not load_project(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "프로젝트를 찾을 수 없습니다", "timestamp": datetime.now().isoformat()},
        )
    sources = get_project_voice_sources(project_id)
    return {
        "success": True,
        "data": sources,
        "count": len(sources),
        "timestamp": datetime.now().isoformat(),
    }


@router.post(
    "/projects/{project_id}/voice-sources",
    summary="노트북 LLM 보이스 소스 추가 (YouTube/TikTok URL)",
)
async def add_voice_source(
    project_id: str, body: AddVoiceSourceRequest
) -> Dict[str, Any]:
    """프로젝트에 보이스 소스(YouTube/TikTok URL)를 추가합니다. 영상에서 목소리를 학습해 TTS에 사용."""
    if not load_project(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "프로젝트를 찾을 수 없습니다", "timestamp": datetime.now().isoformat()},
        )
    new_source = add_project_voice_source(
        project_id=project_id,
        url=body.url.strip(),
        ref_text=body.ref_text.strip() if body.ref_text else None,
        name=body.name.strip() if body.name else None,
        reference_url=body.reference_url.strip() if body.reference_url else None,
        start_seconds=body.start_seconds,
        end_seconds=body.end_seconds,
    )
    if not new_source:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "보이스 소스 저장 실패", "timestamp": datetime.now().isoformat()},
        )
    return {
        "success": True,
        "data": {"voice_source": new_source, "voice_sources_count": len(get_project_voice_sources(project_id))},
        "timestamp": datetime.now().isoformat(),
    }


@router.delete(
    "/projects/{project_id}/voice-sources/{source_id}",
    summary="노트북 LLM 보이스 소스 삭제",
)
async def delete_voice_source(
    project_id: str, source_id: str
) -> Dict[str, Any]:
    """프로젝트 보이스 소스를 삭제합니다."""
    if not load_project(project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "프로젝트를 찾을 수 없습니다", "timestamp": datetime.now().isoformat()},
        )
    ok = delete_project_voice_source(project_id, source_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "보이스 소스를 찾을 수 없습니다", "timestamp": datetime.now().isoformat()},
        )
    return {
        "success": True,
        "data": {"voice_sources_count": len(get_project_voice_sources(project_id))},
        "timestamp": datetime.now().isoformat(),
    }


# Google NotebookLM 스튜디오 전체 유형 (AI 오디오·동영상개요·마인드맵·보고서·플래시카드·퀴즈·인포그래픽·슬라이드·데이터표)
NOTEBOOK_STUDIO_PROMPTS = {
    "report": "아래 [학습된 소스]만을 근거로 **보고서** 형식(제목, 요약, 본문 섹션, 결론)으로 정리해 주세요. 소스에 없는 내용은 포함하지 마세요.",
    "study_guide": "아래 [학습된 소스]만을 바탕으로 **학습 가이드**를 만들어 주세요. 핵심 개념, 정리, 확인 질문 순으로 작성해 주세요.",
    "quiz": "아래 [학습된 소스]만을 바탕으로 **퀴즈** 5문항을 만들어 주세요. 각 문항은 문제, 정답, 해설 형식으로 작성해 주세요.",
    "summary": "아래 [학습된 소스]를 요약해 주세요. 핵심만 간단히 정리해 주세요.",
    "flashcards": "아래 [학습된 소스]를 바탕으로 **플래시카드**용 질문-답 5쌍을 만들어 주세요. 각 줄에 'Q: ... / A: ...' 형식으로 작성해 주세요.",
    "video_overview": "아래 [학습된 소스]만을 바탕으로 **동영상 개요**(영상으로 만들 때 나레이션/자막용)를 만들어 주세요. 장면별 제목과 1~2문장 설명, 순서대로 나열해 주세요.",
    "mindmap": "아래 [학습된 소스]만을 바탕으로 **마인드맵** 구조를 텍스트로 만들어 주세요. 대주제 → 중주제 → 소주제를 들여쓰기와 기호로 계층적으로 나열해 주세요.",
    "infographic": "아래 [학습된 소스]만을 바탕으로 **인포그래픽**에 넣을 핵심 포인트 5~7개를 만들어 주세요. 각 항목은 제목 한 줄과 설명 1~2문장으로 요약해 주세요.",
    "slides": "아래 [학습된 소스]만을 바탕으로 **슬라이드** 구성안을 만들어 주세요. 슬라이드 제목과 불릿 3개 이내로, 5~10장 분량으로 나열해 주세요.",
    "data_table": "아래 [학습된 소스]에서 표로 정리할 수 있는 **데이터**를 추출해 주세요. 제목 열과 값 열을 가진 표 형태로 마크다운 테이블로 작성해 주세요. 표가 적합하지 않으면 핵심 항목을 리스트로 정리해 주세요.",
}


@router.post(
    "/projects/{project_id}/notebook-studio/generate",
    summary="노트북 스튜디오 출력 생성 (보고서/학습가이드/퀴즈/요약 등)",
)
async def generate_notebook_studio_output(
    project_id: str, body: NotebookStudioGenerateRequest
) -> Dict[str, Any]:
    """학습된 프로젝트 소스를 바탕으로 보고서·학습 가이드·퀴즈·요약 등을 생성합니다 (Google NotebookLM 스튜디오 스타일)."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "message": f"ID '{project_id}'에 해당하는 프로젝트가 없습니다.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        context_text = load_project_notebook_context(project_id)
        if not (context_text or "").strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "학습된 소스 없음",
                    "message": "먼저 프로젝트 설명·가이드라인을 설정해 주세요.",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        output_type = (body.type or "summary").strip().lower()
        prompt = NOTEBOOK_STUDIO_PROMPTS.get(
            output_type, NOTEBOOK_STUDIO_PROMPTS["summary"]
        )
        context = {"projectId": project_id, "project_id": project_id}
        try:
            from api.unified_chat_api import generate_chat_response
            content = await generate_chat_response(
                prompt, "detailed", context
            )
        except Exception as e:
            logger.warning(f"스튜디오 생성 중 LLM 호출 실패: {e}")
            content = (
                f"※ 생성 실패: {e}. 프로젝트 학습 정보는 있으나 답변 생성에 실패했습니다."
            )
        content_str = content or ""
        # 생성 이력 저장 (Google NotebookLM 스튜디오 출력 저장 영역)
        try:
            saved = append_project_studio_output(
                project_id, output_type, content_str
            )
            return {
                "success": True,
                "data": {
                    "type": output_type,
                    "content": content_str,
                    "id": saved.get("id"),
                    "created_at": saved.get("created_at"),
                },
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as save_err:
            logger.warning(f"스튜디오 이력 저장 실패(응답은 반환): {save_err}")
            return {
                "success": True,
                "data": {"type": output_type, "content": content_str},
                "timestamp": datetime.now().isoformat(),
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"노트북 스튜디오 생성 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "스튜디오 출력 생성 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.get(
    "/projects/{project_id}/notebook-studio/outputs",
    summary="노트북 스튜디오 생성 이력 목록 조회",
)
async def get_notebook_studio_outputs(project_id: str) -> Dict[str, Any]:
    """프로젝트별 스튜디오 생성 이력(목록)을 반환합니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        outputs = load_project_studio_outputs(project_id)
        return {
            "success": True,
            "data": {"outputs": outputs, "count": len(outputs)},
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"스튜디오 출력 목록 조회 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "스튜디오 출력 목록 조회 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.delete(
    "/projects/{project_id}/notebook-studio/outputs/{output_id}",
    summary="노트북 스튜디오 생성 이력 항목 삭제",
)
async def delete_notebook_studio_output(
    project_id: str, output_id: str
) -> Dict[str, Any]:
    """스튜디오 생성 이력 중 한 항목을 삭제합니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        outputs = load_project_studio_outputs(project_id)
        new_outputs = [o for o in outputs if o.get("id") != output_id]
        if len(new_outputs) == len(outputs):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "해당 스튜디오 출력을 찾을 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        path = get_project_studio_outputs_file(project_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"outputs": new_outputs}, f, ensure_ascii=False, indent=2)
        return {
            "success": True,
            "data": {"count": len(new_outputs)},
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"스튜디오 출력 삭제 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "스튜디오 출력 삭제 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


@router.get(
    "/projects/{project_id}/notebook-suggested-questions",
    summary="소스 기반 추천 질문 생성 (대화 웰컴용)",
)
async def get_notebook_suggested_questions(
    project_id: str,
) -> Dict[str, Any]:
    """학습된 소스를 바탕으로 추천 질문 3~5개를 생성해 반환합니다."""
    try:
        if not load_project(project_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "프로젝트를 찾을 수 없습니다",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        context_text = load_project_notebook_context(project_id)
        if not (context_text or "").strip():
            return {
                "success": True,
                "data": {"questions": []},
                "timestamp": datetime.now().isoformat(),
            }
        prompt = (
            "아래 [학습된 소스]를 바탕으로 사용자가 물어볼 만한 추천 질문 3~5개를 "
            "한 줄에 하나씩만 작성해 주세요. 번호나 기호 없이 질문만 한 줄씩 출력하세요.\n\n"
            + (context_text or "")
        )
        context = {"projectId": project_id, "project_id": project_id}
        try:
            from api.unified_chat_api import generate_chat_response
            raw = await generate_chat_response(prompt, "concise", context)
        except Exception as e:
            logger.warning(f"추천 질문 생성 LLM 실패: {e}")
            return {
                "success": True,
                "data": {"questions": []},
                "timestamp": datetime.now().isoformat(),
            }
        lines = [
            line.strip()
            for line in (raw or "").strip().split("\n")
            if line.strip() and not line.strip().startswith(("1.", "2.", "3.", "4.", "5.", "-", "*", "#"))
        ]
        questions = list(lines) if lines else []
        # 번호 제거 (예: "1. 질문" -> "질문")
        questions = [re.sub(r"^\d+[.)]\s*", "", q) for q in questions if q]
        return {
            "success": True,
            "data": {"questions": questions},
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"추천 질문 조회 실패: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "추천 질문 조회 실패",
                "message": str(e),
                "timestamp": datetime.now().isoformat(),
            }
        )


# 세션 API 엔드포인트
@router.get("/projects/{project_id}/sessions", summary="프로젝트의 세션 목록 조회")
async def get_sessions(project_id: str) -> Dict[str, Any]:
    """프로젝트의 모든 세션 조회"""
    try:
        # 프로젝트 존재 확인
        if not load_project(project_id):
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

        sessions = load_all_sessions(project_id)
        return {
            "success": True,
            "data": sessions,
            "count": len(sessions),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"세션 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 조회 실패: {str(e)}")


@router.post("/sessions", summary="새 세션 생성")
async def create_session(session: SessionCreate) -> Dict[str, Any]:
    """새 세션 생성"""
    try:
        # 프로젝트 존재 확인
        if not load_project(session.projectId):
            raise HTTPException(
                status_code=404, detail="프로젝트를 찾을 수 없습니다"
            )

        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(session.name) % 10000:04d}"
        now = datetime.now().isoformat()

        session_data = {
            "id": session_id,
            "projectId": session.projectId,
            "name": session.name,
            "messages": [],
            "createdAt": now,
            "updatedAt": now,
            "metadata": {
                "totalTokens": 0,
                "avgResponseTime": 0,
            },
        }

        if save_session(session_data):
            logger.info(f"세션 생성 성공: {session_id}")
            return {
                "success": True,
                "data": session_data,
            }
        else:
            raise HTTPException(status_code=500, detail="세션 저장 실패")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"세션 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 생성 실패: {str(e)}")


@router.get("/sessions/{session_id}", summary="특정 세션 조회")
async def get_session(session_id: str, project_id: Optional[str] = None) -> Dict[str, Any]:
    """특정 세션 조회"""
    try:
        # project_id가 제공되지 않으면 모든 프로젝트에서 검색
        if project_id:
            session_data = load_session(project_id, session_id)
            if not session_data:
                raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        else:
            # 모든 프로젝트에서 세션 검색
            session_data = None
            for project in load_all_projects():
                session_data = load_session(project["id"], session_id)
                if session_data:
                    break

            if not session_data:
                raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

        return {
            "success": True,
            "data": session_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"세션 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 조회 실패: {str(e)}")


@router.put("/sessions/{session_id}", summary="세션 업데이트")
async def update_session(
    session_id: str, updates: Dict[str, Any], project_id: Optional[str] = None
) -> Dict[str, Any]:
    """세션 업데이트"""
    try:
        # 세션 찾기
        if project_id:
            session_data = load_session(project_id, session_id)
        else:
            session_data = None
            for project in load_all_projects():
                session_data = load_session(project["id"], session_id)
                if session_data:
                    project_id = project["id"]
                    break

        if not session_data:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

        # 업데이트 적용
        session_data.update(updates)
        session_data["updatedAt"] = datetime.now().isoformat()

        if save_session(session_data):
            return {
                "success": True,
                "data": session_data,
            }
        else:
            raise HTTPException(status_code=500, detail="세션 저장 실패")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"세션 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 업데이트 실패: {str(e)}")


@router.delete("/sessions/{session_id}", summary="세션 삭제")
async def delete_session(
    session_id: str, project_id: Optional[str] = None
) -> Dict[str, Any]:
    """세션 삭제"""
    try:
        # 세션 찾기
        if project_id:
            session_file = get_session_file(project_id, session_id)
        else:
            session_file = None
            for project in load_all_projects():
                session_file = get_session_file(project["id"], session_id)
                if session_file.exists():
                    project_id = project["id"]
                    break

        if not session_file or not session_file.exists():
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

        session_file.unlink()
        logger.info(f"세션 삭제 성공: {session_id}")

        return {
            "success": True,
            "message": "세션이 삭제되었습니다",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"세션 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 삭제 실패: {str(e)}")
