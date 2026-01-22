"""
프로젝트 및 세션 관리 API
사이드바에서 사용하는 프로젝트/세션 CRUD 기능 제공
"""

import logging
import os
import json
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ConfigDict

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["projects", "sessions"])

# 프로젝트 데이터 디렉토리
PROJECTS_DIR = Path("project_data/projects")
PROJECTS_DIR.mkdir(parents=True, exist_ok=True)


# Pydantic 모델
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = ""
    tags: Optional[List[str]] = []


class ProjectCreate(ProjectBase):
    pass


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


class Session(SessionBase):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "session_123",
                "projectId": "proj_123",
                "name": "새 채팅",
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
    """모든 프로젝트 목록 조회"""
    try:
        projects = load_all_projects()
        return {
            "success": True,
            "data": projects,
            "count": len(projects),
        }
    except Exception as e:
        logger.error(f"프로젝트 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 조회 실패: {str(e)}")


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
            logger.info(f"프로젝트 생성 성공: {project_id}")
            return {
                "success": True,
                "data": project_data,
            }
        else:
            raise HTTPException(status_code=500, detail="프로젝트 저장 실패")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 생성 실패: {str(e)}")


@router.get("/projects/{project_id}", summary="특정 프로젝트 조회")
async def get_project(project_id: str) -> Dict[str, Any]:
    """특정 프로젝트 조회"""
    try:
        project_data = load_project(project_id)
        if not project_data:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

        return {
            "success": True,
            "data": project_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 조회 실패: {str(e)}")


@router.put("/projects/{project_id}", summary="프로젝트 업데이트")
async def update_project(
    project_id: str, updates: Dict[str, Any]
) -> Dict[str, Any]:
    """프로젝트 업데이트"""
    try:
        project_data = load_project(project_id)
        if not project_data:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

        # 업데이트 적용
        project_data.update(updates)
        project_data["updatedAt"] = datetime.now().isoformat()

        if save_project(project_data):
            return {
                "success": True,
                "data": project_data,
            }
        else:
            raise HTTPException(status_code=500, detail="프로젝트 저장 실패")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 업데이트 실패: {str(e)}")


@router.delete("/projects/{project_id}", summary="프로젝트 삭제")
async def delete_project(project_id: str) -> Dict[str, Any]:
    """프로젝트 삭제"""
    try:
        project_file = get_project_file(project_id)
        if not project_file.exists():
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")

        project_file.unlink()
        logger.info(f"프로젝트 삭제 성공: {project_id}")

        return {
            "success": True,
            "message": "프로젝트가 삭제되었습니다",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"프로젝트 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=f"프로젝트 삭제 실패: {str(e)}")


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
