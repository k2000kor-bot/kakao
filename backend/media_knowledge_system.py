#!/usr/bin/env python3
"""
미디어 지식 시스템
미디어 파일 업로드, 프로젝트별 자동 분류, 지식 베이스 구축, 팝업 관리 기능
"""

import os
import json
import shutil
import hashlib
import mimetypes
import sqlite3
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import re

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn


# FastAPI 앱 생성
app = FastAPI(
    title="미디어 지식 시스템",
    description="미디어 파일 업로드, 프로젝트별 자동 분류, 지식 베이스 구축, 팝업 관리",
    version="6.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 데이터베이스 초기화
def init_media_database():
    """미디어 지식 시스템 데이터베이스 초기화"""
    conn = sqlite3.connect('media_knowledge_system.db')
    cursor = conn.cursor()

    # 프로젝트 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 미디어 파일 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS media_files (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            mime_type TEXT,
            file_hash TEXT,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')

    # 파일 분석 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS file_analysis (
            id TEXT PRIMARY KEY,
            file_id TEXT,
            content_type TEXT,
            extracted_text TEXT,
            keywords TEXT,
            summary TEXT,
            confidence_score REAL,
            analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (file_id) REFERENCES media_files (id)
        )
    ''')

    # 지식 베이스 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS knowledge_base (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            content TEXT NOT NULL,
            source_file_id TEXT,
            knowledge_type TEXT,
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (source_file_id) REFERENCES media_files (id)
        )
    ''')

    # 팝업 관리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS popup_management (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            popup_type TEXT,
            title TEXT,
            content TEXT,
            position_x INTEGER,
            position_y INTEGER,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')

    # 메시지-미디어 연결 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS message_media_links (
            id TEXT PRIMARY KEY,
            message_id TEXT,
            media_file_id TEXT,
            usage_context TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (media_file_id) REFERENCES media_files (id)
        )
    ''')

    conn.commit()
    conn.close()


# 데이터베이스 초기화 실행
init_media_database()


# 데이터 모델
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class MediaUploadResponse(BaseModel):
    file_id: str
    project_id: str
    filename: str
    file_size: int
    mime_type: str
    upload_date: str


class KnowledgeEntry(BaseModel):
    content: str
    knowledge_type: str
    tags: Optional[List[str]] = None


class PopupCreate(BaseModel):
    popup_type: str
    title: str
    content: str
    position_x: Optional[int] = None
    position_y: Optional[int] = None


@dataclass
class MediaFile:
    """미디어 파일 정보"""
    id: str
    project_id: str
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    file_hash: str
    upload_date: datetime


@dataclass
class FileAnalysis:
    """파일 분석 결과"""
    id: str
    file_id: str
    content_type: str
    extracted_text: str
    keywords: List[str]
    summary: str
    confidence_score: float
    analysis_date: datetime


class MediaKnowledgeSystem:
    """미디어 지식 시스템"""

    def __init__(self):
        self.upload_dir = Path("media_storage")
        self.upload_dir.mkdir(exist_ok=True)
        
        # 프로젝트별 하위 디렉토리 생성
        (self.upload_dir / "images").mkdir(exist_ok=True)
        (self.upload_dir / "documents").mkdir(exist_ok=True)
        (self.upload_dir / "videos").mkdir(exist_ok=True)
        (self.upload_dir / "audio").mkdir(exist_ok=True)
        (self.upload_dir / "thumbnails").mkdir(exist_ok=True)

        # 파일 타입별 분류 규칙
        self.file_classifications = {
            "image": ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"],
            "document": ["pdf", "doc", "docx", "txt", "rtf", "odt"],
            "video": ["mp4", "avi", "mov", "wmv", "flv", "webm"],
            "audio": ["mp3", "wav", "flac", "aac", "ogg"],
            "spreadsheet": ["xls", "xlsx", "csv"],
            "presentation": ["ppt", "pptx", "odp"]
        }

        # 프로젝트 카테고리
        self.project_categories = [
            "건설", "부동산", "교육", "의료", "금융", "IT", "마케팅", 
            "법무", "회계", "인사", "운영", "기타"
        ]

    def create_project(self, name: str, description: str = None, category: str = None) -> str:
        """프로젝트 생성"""
        project_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('media_knowledge_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO projects (id, name, description, category)
            VALUES (?, ?, ?, ?)
        ''', (project_id, name, description, category))
        
        conn.commit()
        conn.close()
        
        # 프로젝트별 디렉토리 생성
        project_dir = self.upload_dir / project_id
        project_dir.mkdir(exist_ok=True)
        
        return project_id

    def classify_file_type(self, filename: str) -> str:
        """파일 타입 분류"""
        extension = filename.lower().split('.')[-1]
        
        for file_type, extensions in self.file_classifications.items():
            if extension in extensions:
                return file_type
        
        return "unknown"

    def generate_file_hash(self, file_path: str) -> str:
        """파일 해시 생성"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

    def extract_text_from_file(self, file_path: str, mime_type: str) -> str:
        """파일에서 텍스트 추출 (시뮬레이션)"""
        # 실제 구현에서는 OCR, PDF 파싱 등을 사용
        filename = os.path.basename(file_path)
        
        # 파일 타입별 텍스트 추출 시뮬레이션
        if mime_type.startswith('image/'):
            return f"이미지 파일: {filename} - 시각적 콘텐츠 포함"
        elif mime_type == 'application/pdf':
            return f"PDF 문서: {filename} - 문서 내용 분석됨"
        elif mime_type.startswith('text/'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except:
                return f"텍스트 파일: {filename}"
        else:
            return f"파일: {filename} - 내용 분석됨"

    def analyze_file_content(self, file_path: str, mime_type: str) -> FileAnalysis:
        """파일 내용 분석"""
        analysis_id = str(uuid.uuid4())
        
        # 텍스트 추출
        extracted_text = self.extract_text_from_file(file_path, mime_type)
        
        # 키워드 추출 (시뮬레이션)
        keywords = self._extract_keywords(extracted_text)
        
        # 요약 생성 (시뮬레이션)
        summary = self._generate_summary(extracted_text)
        
        # 신뢰도 점수 계산
        confidence_score = self._calculate_confidence(extracted_text, mime_type)
        
        return FileAnalysis(
            id=analysis_id,
            file_id="",  # 나중에 설정
            content_type=mime_type,
            extracted_text=extracted_text,
            keywords=keywords,
            summary=summary,
            confidence_score=confidence_score,
            analysis_date=datetime.now()
        )

    def _extract_keywords(self, text: str) -> List[str]:
        """키워드 추출 (시뮬레이션)"""
        # 실제 구현에서는 NLP 라이브러리 사용
        common_keywords = [
            "프로젝트", "계획", "분석", "보고서", "데이터", "결과", 
            "시스템", "개발", "설계", "구현", "테스트", "배포"
        ]
        
        found_keywords = []
        for keyword in common_keywords:
            if keyword in text:
                found_keywords.append(keyword)
        
        return found_keywords[:5]  # 최대 5개 키워드

    def _generate_summary(self, text: str) -> str:
        """요약 생성 (시뮬레이션)"""
        if len(text) > 100:
            return text[:100] + "..."
        return text

    def _calculate_confidence(self, text: str, mime_type: str) -> float:
        """신뢰도 점수 계산"""
        base_score = 0.5
        
        # 텍스트 길이에 따른 점수
        if len(text) > 50:
            base_score += 0.2
        
        # 파일 타입에 따른 점수
        if mime_type.startswith('text/') or mime_type == 'application/pdf':
            base_score += 0.3
        
        return min(1.0, base_score)

    def upload_media_file(self, file: UploadFile, project_id: str) -> MediaUploadResponse:
        """미디어 파일 업로드"""
        # 파일 타입 분류
        file_type = self.classify_file_type(file.filename)
        
        # 파일 저장 경로 결정
        if file_type == "image":
            save_dir = self.upload_dir / "images" / project_id
        elif file_type == "document":
            save_dir = self.upload_dir / "documents" / project_id
        elif file_type == "video":
            save_dir = self.upload_dir / "videos" / project_id
        elif file_type == "audio":
            save_dir = self.upload_dir / "audio" / project_id
        else:
            save_dir = self.upload_dir / project_id
        
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # 파일 저장
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        new_filename = f"{file_id}.{file_extension}"
        file_path = save_dir / new_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 파일 정보 저장
        file_size = os.path.getsize(file_path)
        file_hash = self.generate_file_hash(str(file_path))
        
        conn = sqlite3.connect('media_knowledge_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO media_files (id, project_id, filename, original_filename, file_path, file_size, mime_type, file_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (file_id, project_id, new_filename, file.filename, str(file_path), file_size, file.content_type, file_hash))
        
        conn.commit()
        conn.close()
        
        return MediaUploadResponse(
            file_id=file_id,
            project_id=project_id,
            filename=new_filename,
            file_size=file_size,
            mime_type=file.content_type,
            upload_date=datetime.now().isoformat()
        )

    def analyze_and_extract_knowledge(self, file_id: str) -> Dict[str, Any]:
        """파일 분석 및 지식 추출"""
        conn = sqlite3.connect('media_knowledge_system.db')
        cursor = conn.cursor()
        
        # 파일 정보 조회
        cursor.execute('SELECT * FROM media_files WHERE id = ?', (file_id,))
        file_data = cursor.fetchone()
        
        if not file_data:
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다")
        
        # 파일 분석
        analysis = self.analyze_file_content(file_data[4], file_data[6])  # file_path, mime_type
        analysis.file_id = file_id
        
        # 분석 결과 저장
        cursor.execute('''
            INSERT INTO file_analysis (id, file_id, content_type, extracted_text, keywords, summary, confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            analysis.id, analysis.file_id, analysis.content_type,
            analysis.extracted_text, json.dumps(analysis.keywords),
            analysis.summary, analysis.confidence_score
        ))
        
        # 지식 베이스에 추가
        knowledge_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO knowledge_base (id, project_id, content, source_file_id, knowledge_type, tags)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            knowledge_id, file_data[1], analysis.summary, file_id,
            "file_analysis", json.dumps(analysis.keywords)
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "analysis_id": analysis.id,
            "knowledge_id": knowledge_id,
            "extracted_text": analysis.extracted_text,
            "keywords": analysis.keywords,
            "summary": analysis.summary,
            "confidence_score": analysis.confidence_score
        }

    def get_project_files(self, project_id: str) -> List[Dict[str, Any]]:
        """프로젝트 파일 목록 조회"""
        conn = sqlite3.connect('media_knowledge_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT mf.*, fa.summary, fa.confidence_score
            FROM media_files mf
            LEFT JOIN file_analysis fa ON mf.id = fa.file_id
            WHERE mf.project_id = ?
            ORDER BY mf.upload_date DESC
        ''', (project_id,))
        
        files = []
        for row in cursor.fetchall():
            files.append({
                "id": row[0],
                "project_id": row[1],
                "filename": row[2],
                "original_filename": row[3],
                "file_path": row[4],
                "file_size": row[5],
                "mime_type": row[6],
                "upload_date": row[8],
                "summary": row[10] if row[10] else "",
                "confidence_score": row[11] if row[11] else 0.0
            })
        
        conn.close()
        return files

    def create_popup(self, project_id: str, popup_data: PopupCreate) -> str:
        """팝업 생성"""
        popup_id = str(uuid.uuid4())
        
        conn = sqlite3.connect('media_knowledge_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO popup_management (id, project_id, popup_type, title, content, position_x, position_y)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            popup_id, project_id, popup_data.popup_type, popup_data.title,
            popup_data.content, popup_data.position_x, popup_data.position_y
        ))
        
        conn.commit()
        conn.close()
        
        return popup_id

    def get_project_popups(self, project_id: str) -> List[Dict[str, Any]]:
        """프로젝트 팝업 목록 조회"""
        conn = sqlite3.connect('media_knowledge_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM popup_management
            WHERE project_id = ? AND is_active = 1
            ORDER BY created_at DESC
        ''', (project_id,))
        
        popups = []
        for row in cursor.fetchall():
            popups.append({
                "id": row[0],
                "project_id": row[1],
                "popup_type": row[2],
                "title": row[3],
                "content": row[4],
                "position_x": row[5],
                "position_y": row[6],
                "is_active": row[7],
                "created_at": row[8]
            })
        
        conn.close()
        return popups

    def get_knowledge_base(self, project_id: str) -> List[Dict[str, Any]]:
        """프로젝트 지식 베이스 조회"""
        conn = sqlite3.connect('media_knowledge_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT kb.*, mf.original_filename
            FROM knowledge_base kb
            LEFT JOIN media_files mf ON kb.source_file_id = mf.id
            WHERE kb.project_id = ?
            ORDER BY kb.created_at DESC
        ''', (project_id,))
        
        knowledge = []
        for row in cursor.fetchall():
            knowledge.append({
                "id": row[0],
                "project_id": row[1],
                "content": row[2],
                "source_file_id": row[3],
                "knowledge_type": row[4],
                "tags": json.loads(row[5]) if row[5] else [],
                "created_at": row[6],
                "source_filename": row[7] if row[7] else "직접 입력"
            })
        
        conn.close()
        return knowledge


# 전역 인스턴스
media_system = MediaKnowledgeSystem()


# API 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "미디어 지식 시스템",
        "version": "6.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "healthy",
        "services": {
            "media_upload": "running",
            "file_analysis": "running",
            "knowledge_extraction": "running",
            "popup_management": "running",
            "project_classification": "running"
        },
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/projects")
async def create_project(project: ProjectCreate):
    """프로젝트 생성"""
    try:
        project_id = media_system.create_project(
            project.name, project.description, project.category
        )
        return {
            "success": True,
            "project_id": project_id,
            "message": "프로젝트가 성공적으로 생성되었습니다."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"프로젝트 생성 실패: {str(e)}"
        }


@app.post("/api/upload-media")
async def upload_media_file(
    file: UploadFile = File(...),
    project_id: str = Form(...)
):
    """미디어 파일 업로드"""
    try:
        result = media_system.upload_media_file(file, project_id)
        return {
            "success": True,
            "upload_result": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"파일 업로드 실패: {str(e)}"
        }


@app.post("/api/analyze-file/{file_id}")
async def analyze_file(file_id: str):
    """파일 분석 및 지식 추출"""
    try:
        result = media_system.analyze_and_extract_knowledge(file_id)
        return {
            "success": True,
            "analysis_result": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"파일 분석 실패: {str(e)}"
        }


@app.get("/api/projects/{project_id}/files")
async def get_project_files(project_id: str):
    """프로젝트 파일 목록 조회"""
    try:
        files = media_system.get_project_files(project_id)
        return {
            "success": True,
            "files": files
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"파일 목록 조회 실패: {str(e)}"
        }


@app.get("/api/projects/{project_id}/knowledge")
async def get_project_knowledge(project_id: str):
    """프로젝트 지식 베이스 조회"""
    try:
        knowledge = media_system.get_knowledge_base(project_id)
        return {
            "success": True,
            "knowledge": knowledge
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"지식 베이스 조회 실패: {str(e)}"
        }


@app.post("/api/projects/{project_id}/popups")
async def create_popup(project_id: str, popup: PopupCreate):
    """팝업 생성"""
    try:
        popup_id = media_system.create_popup(project_id, popup)
        return {
            "success": True,
            "popup_id": popup_id,
            "message": "팝업이 성공적으로 생성되었습니다."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"팝업 생성 실패: {str(e)}"
        }


@app.get("/api/projects/{project_id}/popups")
async def get_project_popups(project_id: str):
    """프로젝트 팝업 목록 조회"""
    try:
        popups = media_system.get_project_popups(project_id)
        return {
            "success": True,
            "popups": popups
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"팝업 목록 조회 실패: {str(e)}"
        }


@app.get("/api/test")
async def test_endpoint():
    """테스트 엔드포인트"""
    return {
        "message": "미디어 지식 시스템이 정상적으로 작동하고 있습니다!",
        "features": [
            "미디어 파일 업로드",
            "프로젝트별 자동 분류",
            "파일 내용 분석",
            "지식 베이스 구축",
            "팝업 관리 시스템"
        ],
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import os
    _p = int(os.environ.get("MEDIA_KNOWLEDGE_SYSTEM_PORT", os.environ.get("PORT", "8005")))
    print("🚀 미디어 지식 시스템 시작 중...")
    uvicorn.run(
        "media_knowledge_system:app",
        host="0.0.0.0",
        port=_p,
        reload=False,
        log_level="info"
    ) 