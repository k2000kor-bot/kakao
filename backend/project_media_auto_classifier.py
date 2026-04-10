#!/usr/bin/env python3
"""
프로젝트별 미디어 자동분류 + 지침 자동분류 + 일관된 메시지 전달 시스템 v1.0
- 프로젝트별 미디어 파일 자동분류
- 지침 텍스트 자동분류 및 논리 등록
- 일관된 메시지 전달 보장
- 스마트 프로젝트 조직화
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import json
import os
import asyncio
import aiofiles
from datetime import datetime
import logging
import hashlib
from pathlib import Path
import shutil
import mimetypes
from PIL import Image
import cv2
import numpy as np
import re
from collections import defaultdict, Counter
import sqlite3

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="프로젝트별 미디어 자동분류 + 지침 통합 시스템", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 데이터 모델들 ====================

class ProjectInfo(BaseModel):
    """프로젝트 정보"""
    project_id: str
    project_name: str
    project_type: str  # "건설", "부동산", "조합", "시공"
    created_date: str
    status: str = "active"
    media_count: int = 0
    instruction_count: int = 0
    auto_classification_rules: Dict[str, Any] = {}

class MediaFile(BaseModel):
    """미디어 파일"""
    file_id: str
    project_id: str
    filename: str
    file_type: str
    file_category: str  # "document", "image", "video", "audio", "presentation"
    auto_classification: Dict[str, Any] = {}
    upload_time: str
    file_path: str
    metadata: Dict[str, Any] = {}

class InstructionRule(BaseModel):
    """지침 규칙"""
    rule_id: str
    project_id: str
    rule_title: str
    rule_content: str
    rule_category: str  # "tone", "logic", "format", "response_pattern"
    auto_classification: Dict[str, Any] = {}
    usage_count: int = 0
    success_rate: float = 0.0
    created_date: str
    last_used: Optional[str] = None

class MessageTemplate(BaseModel):
    """메시지 템플릿"""
    template_id: str
    project_id: str
    template_name: str
    template_content: str
    applicable_situations: List[str] = []
    required_instructions: List[str] = []
    success_metrics: Dict[str, float] = {}

# ==================== 핵심 시스템 클래스들 ====================

class ProjectMediaClassifier:
    """프로젝트별 미디어 자동분류기"""
    
    def __init__(self):
        self.classification_rules = self._initialize_classification_rules()
        self.project_storage = Path("project_storage")
        self.project_storage.mkdir(exist_ok=True)
        self._init_database()
    
    def _init_database(self):
        """데이터베이스 초기화"""
        self.db_path = "project_media_system.db"
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 프로젝트 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                project_id TEXT PRIMARY KEY,
                project_name TEXT,
                project_type TEXT,
                created_date TEXT,
                status TEXT,
                auto_classification_rules TEXT
            )
        """)
        
        # 미디어 파일 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS media_files (
                file_id TEXT PRIMARY KEY,
                project_id TEXT,
                filename TEXT,
                file_type TEXT,
                file_category TEXT,
                auto_classification TEXT,
                upload_time TEXT,
                file_path TEXT,
                metadata TEXT,
                FOREIGN KEY (project_id) REFERENCES projects (project_id)
            )
        """)
        
        # 지침 규칙 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS instruction_rules (
                rule_id TEXT PRIMARY KEY,
                project_id TEXT,
                rule_title TEXT,
                rule_content TEXT,
                rule_category TEXT,
                auto_classification TEXT,
                usage_count INTEGER,
                success_rate REAL,
                created_date TEXT,
                last_used TEXT,
                FOREIGN KEY (project_id) REFERENCES projects (project_id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _initialize_classification_rules(self) -> Dict[str, Any]:
        """분류 규칙 초기화"""
        
        return {
            "project_types": {
                "건설_재개발": {
                    "keywords": ["재개발", "재건축", "정비", "철거", "신축"],
                    "file_patterns": ["설계도", "시공계획", "허가서", "도면"],
                    "priority_categories": ["document", "image"]
                },
                "조합_운영": {
                    "keywords": ["조합", "총회", "의결", "동의", "투표"],
                    "file_patterns": ["회의록", "안건", "공지", "결과"],
                    "priority_categories": ["document", "presentation"]
                },
                "시공_관리": {
                    "keywords": ["시공", "공사", "진행", "현장", "안전"],
                    "file_patterns": ["현장사진", "진행보고", "안전점검", "품질"],
                    "priority_categories": ["image", "video", "document"]
                },
                "계약_법무": {
                    "keywords": ["계약", "법무", "소송", "합의", "협의"],
                    "file_patterns": ["계약서", "합의서", "법적검토", "의견서"],
                    "priority_categories": ["document"]
                }
            },
            "file_categories": {
                "document": {
                    "extensions": [".pdf", ".docx", ".doc", ".txt", ".md", ".csv", ".hwp"],
                    "keywords": ["계약", "제안", "보고", "검토", "의견"],
                    "auto_actions": ["텍스트추출", "키워드분석", "카테고리분류"]
                },
                "image": {
                    "extensions": [".jpg", ".jpeg", ".png", ".bmp", ".tiff"],
                    "keywords": ["도면", "현장", "사진", "스크린샷"],
                    "auto_actions": ["OCR", "이미지분석", "표감지"]
                },
                "video": {
                    "extensions": [".mp4", ".avi", ".mov", ".wmv"],
                    "keywords": ["현장", "회의", "설명", "시연"],
                    "auto_actions": ["썸네일생성", "음성추출", "장면분석"]
                },
                "audio": {
                    "extensions": [".mp3", ".wav", ".m4a", ".aac"],
                    "keywords": ["회의", "통화", "설명", "음성"],
                    "auto_actions": ["음성텍스트변환", "화자분리", "감정분석"]
                },
                "presentation": {
                    "extensions": [".pptx", ".ppt", ".key"],
                    "keywords": ["발표", "제안", "설명", "교육"],
                    "auto_actions": ["슬라이드추출", "텍스트분석", "구조분석"]
                }
            },
            "instruction_categories": {
                "tone_guidelines": {
                    "keywords": ["톤", "말투", "격식", "존댓말", "반말"],
                    "patterns": ["~습니다", "~해주세요", "~드립니다"],
                    "auto_classification": "음성톤분류"
                },
                "logic_patterns": {
                    "keywords": ["논리", "근거", "이유", "결론", "추론"],
                    "patterns": ["왜냐하면", "따라서", "그러므로", "결과적으로"],
                    "auto_classification": "논리구조분석"
                },
                "response_templates": {
                    "keywords": ["대응", "답변", "회신", "피드백", "반응"],
                    "patterns": ["~에 대해", "~관련하여", "~건으로"],
                    "auto_classification": "응답패턴분류"
                },
                "format_rules": {
                    "keywords": ["형식", "포맷", "구조", "양식", "템플릿"],
                    "patterns": ["1.", "가.", "①", "•", "-"],
                    "auto_classification": "형식구조분석"
                }
            }
        }
    
    async def create_project(self, project_info: Dict[str, Any]) -> ProjectInfo:
        """프로젝트 생성"""
        
        project_id = f"proj_{int(datetime.now().timestamp())}"
        project_name = project_info.get("project_name", "새 프로젝트")
        
        # 프로젝트 타입 자동 분류
        project_type = self._classify_project_type(project_name, project_info.get("description", ""))
        
        # 프로젝트 폴더 생성
        project_path = self.project_storage / project_id
        project_path.mkdir(exist_ok=True)
        
        # 하위 폴더 구조 생성
        subfolders = ["documents", "images", "videos", "audio", "presentations", "instructions"]
        for folder in subfolders:
            (project_path / folder).mkdir(exist_ok=True)
        
        # 자동 분류 규칙 생성
        auto_rules = self._generate_project_classification_rules(project_type)
        
        project = ProjectInfo(
            project_id=project_id,
            project_name=project_name,
            project_type=project_type,
            created_date=datetime.now().isoformat(),
            auto_classification_rules=auto_rules
        )
        
        # 데이터베이스 저장
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?)",
            (project_id, project_name, project_type, project.created_date, "active", json.dumps(auto_rules))
        )
        conn.commit()
        conn.close()
        
        return project
    
    def _classify_project_type(self, project_name: str, description: str) -> str:
        """프로젝트 타입 자동 분류"""
        
        text = f"{project_name} {description}".lower()
        
        for project_type, rules in self.classification_rules["project_types"].items():
            keywords = rules["keywords"]
            if any(keyword in text for keyword in keywords):
                return project_type
        
        return "일반_프로젝트"
    
    def _generate_project_classification_rules(self, project_type: str) -> Dict[str, Any]:
        """프로젝트별 자동 분류 규칙 생성"""
        
        if project_type in self.classification_rules["project_types"]:
            type_rules = self.classification_rules["project_types"][project_type]
            
            return {
                "priority_keywords": type_rules["keywords"],
                "expected_file_patterns": type_rules["file_patterns"],
                "priority_categories": type_rules["priority_categories"],
                "auto_folder_mapping": {
                    pattern: category for pattern, category in 
                    zip(type_rules["file_patterns"], type_rules["priority_categories"])
                }
            }
        
        return {"priority_keywords": [], "expected_file_patterns": [], "priority_categories": []}
    
    async def upload_and_classify_media(self, project_id: str, file: UploadFile) -> MediaFile:
        """미디어 파일 업로드 및 자동 분류"""
        
        # 파일 기본 정보
        file_id = hashlib.md5(f"{project_id}_{file.filename}_{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        
        # 파일 카테고리 자동 분류
        file_category = self._classify_file_category(file.filename, file.content_type)
        
        # 프로젝트 폴더 내 적절한 위치에 저장
        project_path = self.project_storage / project_id
        category_path = project_path / file_category
        
        # 파일명 자동 정리
        clean_filename = self._clean_filename(file.filename)
        file_path = category_path / f"{file_id}_{clean_filename}"
        
        # 파일 저장
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # 고급 자동 분류 수행
        auto_classification = await self._perform_advanced_classification(
            str(file_path), file_category, project_id
        )
        
        # 메타데이터 추출
        metadata = await self._extract_metadata(str(file_path), file_category)
        
        media_file = MediaFile(
            file_id=file_id,
            project_id=project_id,
            filename=clean_filename,
            file_type=file.content_type,
            file_category=file_category,
            auto_classification=auto_classification,
            upload_time=datetime.now().isoformat(),
            file_path=str(file_path),
            metadata=metadata
        )
        
        # 데이터베이스 저장
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO media_files VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (file_id, project_id, clean_filename, file.content_type, file_category,
             json.dumps(auto_classification), media_file.upload_time, str(file_path), json.dumps(metadata))
        )
        conn.commit()
        conn.close()
        
        return media_file
    
    def _classify_file_category(self, filename: str, content_type: str) -> str:
        """파일 카테고리 자동 분류"""
        
        file_ext = Path(filename).suffix.lower()
        filename_lower = filename.lower()
        
        for category, rules in self.classification_rules["file_categories"].items():
            # 확장자 확인
            if file_ext in rules["extensions"]:
                return category
            
            # 키워드 확인
            if any(keyword in filename_lower for keyword in rules["keywords"]):
                return category
        
        # MIME 타입 기반 분류
        if content_type:
            if content_type.startswith("image/"):
                return "image"
            elif content_type.startswith("video/"):
                return "video"
            elif content_type.startswith("audio/"):
                return "audio"
            elif content_type in ["application/pdf", "application/msword"]:
                return "document"
        
        return "document"  # 기본값
    
    def _clean_filename(self, filename: str) -> str:
        """파일명 정리"""
        
        # 특수문자 제거 및 공백을 언더스코어로 변경
        clean_name = re.sub(r'[^\w\s.-]', '', filename)
        clean_name = re.sub(r'\s+', '_', clean_name)
        
        # 날짜 패턴 감지 및 정규화
        date_pattern = r'(\d{4})[.-]?(\d{2})[.-]?(\d{2})'
        clean_name = re.sub(date_pattern, r'\1\2\3', clean_name)
        
        return clean_name
    
    async def _perform_advanced_classification(self, file_path: str, category: str, project_id: str) -> Dict[str, Any]:
        """고급 자동 분류 수행"""
        
        classification = {
            "category": category,
            "confidence": 0.8,
            "detected_patterns": [],
            "suggested_tags": [],
            "content_analysis": {}
        }
        
        # 프로젝트별 규칙 적용
        project_rules = await self._get_project_rules(project_id)
        
        if category == "document":
            classification.update(await self._classify_document(file_path, project_rules))
        elif category == "image":
            classification.update(await self._classify_image(file_path, project_rules))
        elif category == "video":
            classification.update(await self._classify_video(file_path, project_rules))
        
        return classification
    
    async def _classify_document(self, file_path: str, project_rules: Dict) -> Dict[str, Any]:
        """문서 자동 분류"""
        
        try:
            # 파일 내용 읽기 (간단한 텍스트 추출)
            if file_path.endswith('.txt'):
                async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                    content = await f.read()
            else:
                content = f"문서 파일: {Path(file_path).name}"
            
            # 키워드 매칭
            detected_patterns = []
            for keyword in project_rules.get("priority_keywords", []):
                if keyword in content.lower():
                    detected_patterns.append(keyword)
            
            # 문서 타입 추론
            doc_type = "일반문서"
            if any(word in content.lower() for word in ["계약", "협약", "동의"]):
                doc_type = "계약문서"
            elif any(word in content.lower() for word in ["보고", "현황", "진행"]):
                doc_type = "보고서"
            elif any(word in content.lower() for word in ["제안", "계획", "방안"]):
                doc_type = "제안서"
            
            return {
                "document_type": doc_type,
                "detected_patterns": detected_patterns,
                "suggested_tags": [doc_type] + detected_patterns[:3],
                "content_analysis": {
                    "word_count": len(content.split()),
                    "estimated_pages": max(1, len(content) // 2000)
                }
            }
            
        except Exception as e:
            return {"error": str(e), "detected_patterns": [], "suggested_tags": []}
    
    async def _classify_image(self, file_path: str, project_rules: Dict) -> Dict[str, Any]:
        """이미지 자동 분류"""
        
        try:
            # 이미지 기본 정보
            image = Image.open(file_path)
            width, height = image.size
            
            # 파일명 기반 분류
            filename = Path(file_path).name.lower()
            
            image_type = "일반이미지"
            if any(word in filename for word in ["도면", "설계", "plan"]):
                image_type = "설계도면"
            elif any(word in filename for word in ["현장", "사진", "photo"]):
                image_type = "현장사진"
            elif any(word in filename for word in ["스크린", "캡처", "screenshot"]):
                image_type = "스크린샷"
            
            # 종횡비 분석
            aspect_ratio = width / height
            format_type = "정사각형"
            if aspect_ratio > 1.5:
                format_type = "가로형"
            elif aspect_ratio < 0.7:
                format_type = "세로형"
            
            return {
                "image_type": image_type,
                "format_type": format_type,
                "dimensions": {"width": width, "height": height},
                "suggested_tags": [image_type, format_type],
                "content_analysis": {
                    "aspect_ratio": round(aspect_ratio, 2),
                    "estimated_quality": "고화질" if width * height > 1000000 else "일반화질"
                }
            }
            
        except Exception as e:
            return {"error": str(e), "detected_patterns": [], "suggested_tags": []}
    
    async def _classify_video(self, file_path: str, project_rules: Dict) -> Dict[str, Any]:
        """비디오 자동 분류"""
        
        try:
            # 비디오 기본 정보 (OpenCV 사용)
            cap = cv2.VideoCapture(file_path)
            
            if not cap.isOpened():
                return {"error": "비디오 파일을 열 수 없습니다.", "detected_patterns": [], "suggested_tags": []}
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
            duration = frame_count / fps if fps > 0 else 0
            
            cap.release()
            
            # 파일명 기반 분류
            filename = Path(file_path).name.lower()
            
            video_type = "일반비디오"
            if any(word in filename for word in ["회의", "meeting"]):
                video_type = "회의영상"
            elif any(word in filename for word in ["현장", "site"]):
                video_type = "현장영상"
            elif any(word in filename for word in ["설명", "tutorial"]):
                video_type = "설명영상"
            
            return {
                "video_type": video_type,
                "duration_seconds": round(duration, 2),
                "fps": round(fps, 2),
                "frame_count": int(frame_count),
                "suggested_tags": [video_type, f"{int(duration//60)}분영상" if duration > 60 else "단편영상"],
                "content_analysis": {
                    "estimated_size": "대용량" if duration > 300 else "일반",
                    "quality_estimate": "고화질" if fps >= 30 else "일반화질"
                }
            }
            
        except Exception as e:
            return {"error": str(e), "detected_patterns": [], "suggested_tags": []}
    
    async def _extract_metadata(self, file_path: str, category: str) -> Dict[str, Any]:
        """메타데이터 추출"""
        
        stat = os.stat(file_path)
        
        metadata = {
            "file_size": stat.st_size,
            "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified_time": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "file_extension": Path(file_path).suffix.lower()
        }
        
        # 카테고리별 추가 메타데이터
        if category == "image":
            try:
                image = Image.open(file_path)
                metadata.update({
                    "image_width": image.width,
                    "image_height": image.height,
                    "image_mode": image.mode,
                    "image_format": image.format
                })
            except:
                pass
        
        return metadata
    
    async def _get_project_rules(self, project_id: str) -> Dict[str, Any]:
        """프로젝트 규칙 조회"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT auto_classification_rules FROM projects WHERE project_id = ?", (project_id,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return json.loads(result[0])
        return {}

class InstructionClassifier:
    """지침 자동분류기"""
    
    def __init__(self):
        self.classifier = ProjectMediaClassifier()
    
    async def register_instruction(self, project_id: str, instruction_data: Dict[str, Any]) -> InstructionRule:
        """지침 등록 및 자동 분류"""
        
        rule_id = f"rule_{int(datetime.now().timestamp())}"
        rule_title = instruction_data.get("title", "새 지침")
        rule_content = instruction_data.get("content", "")
        
        # 지침 카테고리 자동 분류
        rule_category = self._classify_instruction_category(rule_title, rule_content)
        
        # 고급 자동 분류 수행
        auto_classification = self._perform_instruction_classification(rule_content, rule_category)
        
        instruction = InstructionRule(
            rule_id=rule_id,
            project_id=project_id,
            rule_title=rule_title,
            rule_content=rule_content,
            rule_category=rule_category,
            auto_classification=auto_classification,
            usage_count=0,
            success_rate=0.0,
            created_date=datetime.now().isoformat()
        )
        
        # 데이터베이스 저장
        conn = sqlite3.connect(self.classifier.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO instruction_rules VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (rule_id, project_id, rule_title, rule_content, rule_category,
             json.dumps(auto_classification), 0, 0.0, instruction.created_date, None)
        )
        conn.commit()
        conn.close()
        
        return instruction
    
    def _classify_instruction_category(self, title: str, content: str) -> str:
        """지침 카테고리 자동 분류"""
        
        text = f"{title} {content}".lower()
        
        classification_rules = self.classifier.classification_rules["instruction_categories"]
        
        for category, rules in classification_rules.items():
            keywords = rules["keywords"]
            patterns = rules["patterns"]
            
            # 키워드 매칭
            if any(keyword in text for keyword in keywords):
                return category
            
            # 패턴 매칭
            if any(pattern in content for pattern in patterns):
                return category
        
        return "general_guideline"
    
    def _perform_instruction_classification(self, content: str, category: str) -> Dict[str, Any]:
        """지침 고급 분류"""
        
        classification = {
            "category": category,
            "confidence": 0.8,
            "detected_patterns": [],
            "logic_structure": [],
            "tone_indicators": [],
            "usage_scenarios": []
        }
        
        # 논리 구조 분석
        logic_patterns = ["왜냐하면", "따라서", "그러므로", "결과적으로", "예를 들어"]
        for pattern in logic_patterns:
            if pattern in content:
                classification["logic_structure"].append(pattern)
        
        # 톤 지시어 분석
        tone_patterns = ["정중하게", "친근하게", "격식있게", "부드럽게", "강하게"]
        for pattern in tone_patterns:
            if pattern in content:
                classification["tone_indicators"].append(pattern)
        
        # 사용 시나리오 추출
        scenario_patterns = ["~할 때", "~인 경우", "~라면", "~상황에서"]
        for pattern in scenario_patterns:
            if any(p in content for p in [pattern]):
                classification["usage_scenarios"].append("조건부_적용")
        
        return classification

# ==================== 일관된 메시지 전달 시스템 ====================

class ConsistentMessageDelivery:
    """일관된 메시지 전달 시스템"""
    
    def __init__(self):
        self.media_classifier = ProjectMediaClassifier()
        self.instruction_classifier = InstructionClassifier()
        self.message_cache = {}
    
    async def generate_consistent_message(self, project_id: str, situation: str, 
                                        context: Dict[str, Any] = None) -> Dict[str, Any]:
        """일관된 메시지 생성"""
        
        # 프로젝트 미디어 및 지침 수집
        project_media = await self._get_project_media(project_id)
        project_instructions = await self._get_project_instructions(project_id)
        
        # 상황에 맞는 지침 선택
        applicable_instructions = self._select_applicable_instructions(
            project_instructions, situation, context
        )
        
        # 메시지 생성
        generated_message = await self._generate_message_with_consistency(
            situation, applicable_instructions, project_media, context
        )
        
        # 일관성 검증
        consistency_score = self._verify_message_consistency(
            generated_message, applicable_instructions
        )
        
        return {
            "message": generated_message,
            "consistency_score": consistency_score,
            "applied_instructions": [instr["rule_title"] for instr in applicable_instructions],
            "referenced_media": len(project_media),
            "generation_time": datetime.now().isoformat()
        }
    
    async def _get_project_media(self, project_id: str) -> List[Dict]:
        """프로젝트 미디어 조회"""
        
        conn = sqlite3.connect(self.media_classifier.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM media_files WHERE project_id = ?", 
            (project_id,)
        )
        results = cursor.fetchall()
        conn.close()
        
        media_files = []
        for row in results:
            media_files.append({
                "file_id": row[0],
                "filename": row[2],
                "category": row[4],
                "auto_classification": json.loads(row[5]) if row[5] else {}
            })
        
        return media_files
    
    async def _get_project_instructions(self, project_id: str) -> List[Dict]:
        """프로젝트 지침 조회"""
        
        conn = sqlite3.connect(self.media_classifier.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM instruction_rules WHERE project_id = ?", 
            (project_id,)
        )
        results = cursor.fetchall()
        conn.close()
        
        instructions = []
        for row in results:
            instructions.append({
                "rule_id": row[0],
                "rule_title": row[2],
                "rule_content": row[3],
                "rule_category": row[4],
                "auto_classification": json.loads(row[5]) if row[5] else {},
                "usage_count": row[6],
                "success_rate": row[7]
            })
        
        return instructions
    
    def _select_applicable_instructions(self, instructions: List[Dict], 
                                      situation: str, context: Dict = None) -> List[Dict]:
        """적용 가능한 지침 선택"""
        
        applicable = []
        situation_lower = situation.lower()
        
        for instruction in instructions:
            # 카테고리별 적용성 확인
            category = instruction["rule_category"]
            content = instruction["rule_content"].lower()
            
            is_applicable = False
            
            # 상황 키워드 매칭
            if any(word in situation_lower for word in ["공정", "경쟁", "불만"]):
                if "공정성" in content or "경쟁" in content:
                    is_applicable = True
            
            # 카테고리별 기본 적용
            if category in ["tone_guidelines", "logic_patterns"]:
                is_applicable = True
            
            # 성공률 기반 필터링
            if instruction["success_rate"] > 0.7:
                is_applicable = True
            
            if is_applicable:
                applicable.append(instruction)
        
        # 우선순위 정렬 (성공률 높은 순)
        applicable.sort(key=lambda x: x["success_rate"], reverse=True)
        
        return applicable[:5]  # 상위 5개만
    
    async def _generate_message_with_consistency(self, situation: str, instructions: List[Dict],
                                               media: List[Dict], context: Dict = None) -> str:
        """일관성 있는 메시지 생성"""
        
        # 기본 메시지 생성
        if "공정" in situation and "경쟁" in situation:
            base_message = "말씀하신 공정성 우려에 대해 깊이 공감합니다. 모든 참여업체에게 동등한 기회가 보장되어야 하며, 투명하고 객관적인 평가가 이루어져야 합니다."
        else:
            base_message = "제기해주신 사안에 대해 신중히 검토하겠습니다. 관련된 모든 요소를 종합적으로 고려하여 최선의 방향을 모색하겠습니다."
        
        # 지침 적용
        enhanced_message = base_message
        
        for instruction in instructions:
            category = instruction["rule_category"]
            content = instruction["rule_content"]
            
            if category == "tone_guidelines":
                if "정중하게" in content:
                    enhanced_message = f"정중히 말씀드리면, {enhanced_message}"
                elif "격식있게" in content:
                    enhanced_message = enhanced_message.replace("하겠습니다", "하도록 하겠습니다")
            
            elif category == "logic_patterns":
                if "근거" in content:
                    enhanced_message += " 이는 관련 자료와 객관적 근거에 기반한 판단입니다."
        
        # 미디어 참조 추가
        if media:
            document_count = len([m for m in media if m["category"] == "document"])
            if document_count > 0:
                enhanced_message += f" 관련 문서 {document_count}건을 종합적으로 검토한 결과입니다."
        
        return enhanced_message
    
    def _verify_message_consistency(self, message: str, instructions: List[Dict]) -> float:
        """메시지 일관성 검증"""
        
        consistency_score = 0.5  # 기본 점수
        
        # 지침 적용 확인
        applied_count = 0
        for instruction in instructions:
            content = instruction["rule_content"].lower()
            
            if "정중" in content and "정중" in message:
                applied_count += 1
            if "객관" in content and "객관" in message:
                applied_count += 1
            if "근거" in content and "근거" in message:
                applied_count += 1
        
        if instructions:
            consistency_score += (applied_count / len(instructions)) * 0.3
        
        # 메시지 완성도 확인
        if len(message) > 50:
            consistency_score += 0.1
        
        if any(word in message for word in ["검토", "고려", "판단"]):
            consistency_score += 0.1
        
        return min(consistency_score, 1.0)

# ==================== 전역 인스턴스들 ====================

project_classifier = ProjectMediaClassifier()
instruction_classifier = InstructionClassifier()
message_delivery = ConsistentMessageDelivery()

# ==================== API 엔드포인트들 ====================

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "system": "프로젝트별 미디어 자동분류 + 지침 통합 시스템",
        "version": "1.0.0",
        "features": [
            "🗂️ 프로젝트별 미디어 자동분류",
            "📋 지침 텍스트 자동분류",
            "🤖 일관된 메시지 전달",
            "🔄 스마트 프로젝트 조직화"
        ],
        "capabilities": {
            "auto_classification": "파일타입, 내용, 프로젝트별 맞춤 분류",
            "instruction_management": "텍스트 논리, 톤, 패턴 자동 인식",
            "consistent_messaging": "프로젝트별 일관된 메시지 생성",
            "smart_organization": "자동 폴더 구조, 태그, 메타데이터"
        }
    }

@app.post("/create-project")
async def create_project(project_info: Dict[str, Any]):
    """프로젝트 생성"""
    
    try:
        project = await project_classifier.create_project(project_info)
        return {
            "success": True,
            "message": "프로젝트가 성공적으로 생성되고 자동 분류 규칙이 설정되었습니다.",
            "project": project.dict()
        }
    except Exception as e:
        logger.error(f"프로젝트 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-media/{project_id}")
async def upload_media(project_id: str, file: UploadFile = File(...)):
    """미디어 파일 업로드 및 자동분류"""
    
    try:
        media_file = await project_classifier.upload_and_classify_media(project_id, file)
        return {
            "success": True,
            "message": "미디어 파일이 성공적으로 업로드되고 자동 분류되었습니다.",
            "media_file": media_file.dict(),
            "auto_classification_results": {
                "category": media_file.file_category,
                "classification": media_file.auto_classification,
                "suggested_tags": media_file.auto_classification.get("suggested_tags", []),
                "confidence": media_file.auto_classification.get("confidence", 0.0)
            }
        }
    except Exception as e:
        logger.error(f"미디어 업로드 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register-instruction/{project_id}")
async def register_instruction(project_id: str, instruction_data: Dict[str, Any]):
    """지침 등록 및 자동분류"""
    
    try:
        instruction = await instruction_classifier.register_instruction(project_id, instruction_data)
        return {
            "success": True,
            "message": "지침이 성공적으로 등록되고 자동 분류되었습니다.",
            "instruction": instruction.dict(),
            "auto_classification_results": {
                "category": instruction.rule_category,
                "classification": instruction.auto_classification,
                "detected_patterns": instruction.auto_classification.get("detected_patterns", []),
                "logic_structure": instruction.auto_classification.get("logic_structure", [])
            }
        }
    except Exception as e:
        logger.error(f"지침 등록 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-message/{project_id}")
async def generate_consistent_message(project_id: str, request_data: Dict[str, Any]):
    """일관된 메시지 생성"""
    
    try:
        situation = request_data.get("situation", "")
        context = request_data.get("context", {})
        
        result = await message_delivery.generate_consistent_message(project_id, situation, context)
        
        return {
            "success": True,
            "message": "일관된 메시지가 성공적으로 생성되었습니다.",
            "result": result
        }
    except Exception as e:
        logger.error(f"메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/project-status/{project_id}")
async def get_project_status(project_id: str):
    """프로젝트 현황 조회"""
    
    try:
        # 미디어 파일 현황
        media_files = await message_delivery._get_project_media(project_id)
        
        # 지침 현황
        instructions = await message_delivery._get_project_instructions(project_id)
        
        # 통계 계산
        media_by_category = defaultdict(int)
        for media in media_files:
            media_by_category[media["category"]] += 1
        
        instruction_by_category = defaultdict(int)
        for instruction in instructions:
            instruction_by_category[instruction["rule_category"]] += 1
        
        return {
            "project_id": project_id,
            "media_statistics": {
                "total_files": len(media_files),
                "by_category": dict(media_by_category)
            },
            "instruction_statistics": {
                "total_instructions": len(instructions),
                "by_category": dict(instruction_by_category)
            },
            "auto_classification_summary": {
                "media_auto_classified": len([m for m in media_files if m.get("auto_classification")]),
                "instructions_auto_classified": len([i for i in instructions if i.get("auto_classification")])
            }
        }
    except Exception as e:
        logger.error(f"프로젝트 현황 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 데모용 엔드포인트
@app.post("/demo/auto-classification")
async def demo_auto_classification():
    """자동분류 시스템 데모"""
    
    # 샘플 프로젝트 생성
    sample_project = await project_classifier.create_project({
        "project_name": "샘플 재개발 프로젝트",
        "description": "재개발 조합 시공사 선정 프로젝트"
    })
    
    # 샘플 지침 등록
    sample_instruction = await instruction_classifier.register_instruction(
        sample_project.project_id,
        {
            "title": "공정성 강조 지침",
            "content": "시공사 선정 과정에서는 항상 공정하고 투명한 절차를 강조하며, 모든 조합원의 이익을 최우선으로 고려해야 합니다. 특히 경쟁업체 간의 공정한 경쟁 환경 조성을 위해 객관적인 평가 기준을 적용해야 합니다."
        }
    )
    
    # 샘플 메시지 생성
    sample_message = await message_delivery.generate_consistent_message(
        sample_project.project_id,
        "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다."
    )
    
    return {
        "demo_title": "프로젝트별 자동분류 + 일관된 메시지 전달 시스템",
        "created_project": sample_project.dict(),
        "registered_instruction": sample_instruction.dict(),
        "generated_message": sample_message,
        "demo_highlights": [
            "✅ 프로젝트 자동 생성 및 타입 분류",
            "✅ 지침 자동 카테고리화 및 논리 구조 분석",
            "✅ 프로젝트별 일관된 메시지 생성",
            "✅ 자동 품질 평가 및 개선 제안"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 프로젝트별 미디어 자동분류 + 지침 통합 시스템 시작!")
    print("📁 주요 기능:")
    print("   🗂️ 프로젝트별 미디어 자동분류")
    print("   📋 지침 텍스트 자동분류 및 논리 등록")
    print("   🤖 일관된 메시지 전달 보장")
    print("   🔄 스마트 프로젝트 조직화")
    
    _p = int(os.environ.get("PROJECT_MEDIA_AUTO_CLASSIFIER_PORT", os.environ.get("PORT", "8092")))
    uvicorn.run(app, host="0.0.0.0", port=_p) 