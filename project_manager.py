"""
CORBU AI Project Manager - 고급 프로젝트 관리 시스템
"""
import os
import json
import asyncio
import shutil
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Union
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class ProjectManager:
    """고급 프로젝트 관리자"""
    
    def __init__(self, base_path: str = "/Users/aD/kakao-frontend/projects"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(exist_ok=True)
        self.current_project = None
        self.projects_metadata = {}
        self.load_projects_metadata()
    
    def load_projects_metadata(self):
        """프로젝트 메타데이터 로드"""
        metadata_file = self.base_path / "projects_metadata.json"
        if metadata_file.exists():
            try:
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    self.projects_metadata = json.load(f)
            except Exception as e:
                logger.error(f"프로젝트 메타데이터 로드 실패: {e}")
                self.projects_metadata = {}
    
    def save_projects_metadata(self):
        """프로젝트 메타데이터 저장"""
        metadata_file = self.base_path / "projects_metadata.json"
        try:
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(self.projects_metadata, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"프로젝트 메타데이터 저장 실패: {e}")
    
    async def create_project(self, project_name: str, description: str = "", project_type: str = "general") -> Dict[str, Any]:
        """새 프로젝트 생성"""
        try:
            # 프로젝트 ID 생성
            project_id = f"proj_{int(datetime.now().timestamp())}"
            project_path = self.base_path / project_id
            
            # 프로젝트 디렉토리 생성
            project_path.mkdir(exist_ok=True)
            
            # 프로젝트 구조 생성
            subdirs = ["data", "models", "results", "docs", "scripts", "uploads"]
            for subdir in subdirs:
                (project_path / subdir).mkdir(exist_ok=True)
            
            # 프로젝트 설정 파일 생성
            project_config = {
                "id": project_id,
                "name": project_name,
                "description": description,
                "type": project_type,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "status": "active",
                "files": [],
                "models": [],
                "collaborators": [],
                "settings": {
                    "auto_save": True,
                    "version_control": True,
                    "backup_enabled": True
                }
            }
            
            config_file = project_path / "project_config.json"
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(project_config, f, ensure_ascii=False, indent=2)
            
            # 메타데이터에 추가
            self.projects_metadata[project_id] = {
                "name": project_name,
                "description": description,
                "type": project_type,
                "created_at": project_config["created_at"],
                "updated_at": project_config["updated_at"],
                "status": "active",
                "path": str(project_path)
            }
            
            self.save_projects_metadata()
            
            return {
                "success": True,
                "project_id": project_id,
                "project_name": project_name,
                "path": str(project_path),
                "message": f"프로젝트 '{project_name}'이 성공적으로 생성되었습니다."
            }
            
        except Exception as e:
            logger.error(f"프로젝트 생성 실패: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "프로젝트 생성에 실패했습니다."
            }
    
    async def list_projects(self) -> Dict[str, Any]:
        """프로젝트 목록 조회"""
        try:
            projects_list = []
            for project_id, metadata in self.projects_metadata.items():
                project_path = Path(metadata["path"])
                if project_path.exists():
                    # 파일 개수 계산
                    file_count = sum(1 for _ in project_path.rglob("*") if _.is_file())
                    
                    projects_list.append({
                        "id": project_id,
                        "name": metadata["name"],
                        "description": metadata["description"],
                        "type": metadata["type"],
                        "created_at": metadata["created_at"],
                        "updated_at": metadata["updated_at"],
                        "status": metadata["status"],
                        "file_count": file_count,
                        "path": metadata["path"]
                    })
            
            return {
                "success": True,
                "projects": projects_list,
                "total_count": len(projects_list)
            }
            
        except Exception as e:
            logger.error(f"프로젝트 목록 조회 실패: {e}")
            return {
                "success": False,
                "error": str(e),
                "projects": []
            }
    
    async def open_project(self, project_id: str) -> Dict[str, Any]:
        """프로젝트 열기"""
        try:
            if project_id not in self.projects_metadata:
                return {
                    "success": False,
                    "error": "프로젝트를 찾을 수 없습니다.",
                    "message": f"프로젝트 ID '{project_id}'가 존재하지 않습니다."
                }
            
            project_path = Path(self.projects_metadata[project_id]["path"])
            if not project_path.exists():
                return {
                    "success": False,
                    "error": "프로젝트 디렉토리가 존재하지 않습니다.",
                    "message": "프로젝트 파일이 삭제되었거나 이동되었습니다."
                }
            
            # 프로젝트 설정 로드
            config_file = project_path / "project_config.json"
            if config_file.exists():
                with open(config_file, 'r', encoding='utf-8') as f:
                    project_config = json.load(f)
            else:
                project_config = self.projects_metadata[project_id]
            
            self.current_project = project_id
            
            return {
                "success": True,
                "project": project_config,
                "message": f"프로젝트 '{project_config['name']}'이 열렸습니다."
            }
            
        except Exception as e:
            logger.error(f"프로젝트 열기 실패: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "프로젝트 열기에 실패했습니다."
            }
    
    async def upload_file(self, project_id: str, file_data: bytes, filename: str, file_type: str = "data") -> Dict[str, Any]:
        """파일 업로드"""
        try:
            if project_id not in self.projects_metadata:
                return {
                    "success": False,
                    "error": "프로젝트를 찾을 수 없습니다."
                }
            
            project_path = Path(self.projects_metadata[project_id]["path"])
            upload_dir = project_path / "uploads"
            upload_dir.mkdir(exist_ok=True)
            
            # 파일 저장
            file_path = upload_dir / filename
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            # 파일 정보 생성
            file_info = {
                "filename": filename,
                "file_type": file_type,
                "size": len(file_data),
                "uploaded_at": datetime.now(timezone.utc).isoformat(),
                "path": str(file_path),
                "status": "uploaded"
            }
            
            # 프로젝트 설정에 파일 정보 추가
            config_file = project_path / "project_config.json"
            if config_file.exists():
                with open(config_file, 'r', encoding='utf-8') as f:
                    project_config = json.load(f)
                
                project_config["files"].append(file_info)
                project_config["updated_at"] = datetime.now(timezone.utc).isoformat()
                
                with open(config_file, 'w', encoding='utf-8') as f:
                    json.dump(project_config, f, ensure_ascii=False, indent=2)
            
            return {
                "success": True,
                "file_info": file_info,
                "message": f"파일 '{filename}'이 성공적으로 업로드되었습니다."
            }
            
        except Exception as e:
            logger.error(f"파일 업로드 실패: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "파일 업로드에 실패했습니다."
            }
    
    async def analyze_file(self, project_id: str, filename: str) -> Dict[str, Any]:
        """파일 분석"""
        try:
            if project_id not in self.projects_metadata:
                return {
                    "success": False,
                    "error": "프로젝트를 찾을 수 없습니다."
                }
            
            project_path = Path(self.projects_metadata[project_id]["path"])
            file_path = project_path / "uploads" / filename
            
            if not file_path.exists():
                return {
                    "success": False,
                    "error": "파일을 찾을 수 없습니다."
                }
            
            # 파일 타입에 따른 분석
            file_extension = file_path.suffix.lower()
            
            if file_extension in ['.txt', '.md', '.py', '.js', '.ts', '.json']:
                return await self._analyze_text_file(file_path)
            elif file_extension in ['.csv', '.xlsx', '.xls']:
                return await self._analyze_data_file(file_path)
            elif file_extension in ['.jpg', '.jpeg', '.png', '.gif']:
                return await self._analyze_image_file(file_path)
            else:
                return await self._analyze_generic_file(file_path)
                
        except Exception as e:
            logger.error(f"파일 분석 실패: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "파일 분석에 실패했습니다."
            }
    
    async def _analyze_text_file(self, file_path: Path) -> Dict[str, Any]:
        """텍스트 파일 분석"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.split('\n')
            words = content.split()
            
            return {
                "success": True,
                "file_type": "text",
                "analysis": {
                    "character_count": len(content),
                    "line_count": len(lines),
                    "word_count": len(words),
                    "avg_line_length": sum(len(line) for line in lines) / len(lines) if lines else 0,
                    "file_size": file_path.stat().st_size,
                    "encoding": "utf-8"
                },
                "message": "텍스트 파일 분석이 완료되었습니다."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "텍스트 파일 분석에 실패했습니다."
            }
    
    async def _analyze_data_file(self, file_path: Path) -> Dict[str, Any]:
        """데이터 파일 분석"""
        try:
            import pandas as pd
            
            if file_path.suffix == '.csv':
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
            
            return {
                "success": True,
                "file_type": "data",
                "analysis": {
                    "rows": len(df),
                    "columns": len(df.columns),
                    "column_names": df.columns.tolist(),
                    "data_types": df.dtypes.to_dict(),
                    "missing_values": df.isnull().sum().to_dict(),
                    "file_size": file_path.stat().st_size
                },
                "message": "데이터 파일 분석이 완료되었습니다."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "데이터 파일 분석에 실패했습니다."
            }
    
    async def _analyze_image_file(self, file_path: Path) -> Dict[str, Any]:
        """이미지 파일 분석"""
        try:
            from PIL import Image
            
            with Image.open(file_path) as img:
                return {
                    "success": True,
                    "file_type": "image",
                    "analysis": {
                        "width": img.width,
                        "height": img.height,
                        "mode": img.mode,
                        "format": img.format,
                        "file_size": file_path.stat().st_size,
                        "aspect_ratio": img.width / img.height
                    },
                    "message": "이미지 파일 분석이 완료되었습니다."
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "이미지 파일 분석에 실패했습니다."
            }
    
    async def _analyze_generic_file(self, file_path: Path) -> Dict[str, Any]:
        """일반 파일 분석"""
        try:
            stat = file_path.stat()
            
            return {
                "success": True,
                "file_type": "generic",
                "analysis": {
                    "file_size": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "extension": file_path.suffix
                },
                "message": "파일 분석이 완료되었습니다."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "파일 분석에 실패했습니다."
            }
    
    async def delete_project(self, project_id: str) -> Dict[str, Any]:
        """프로젝트 삭제"""
        try:
            if project_id not in self.projects_metadata:
                return {
                    "success": False,
                    "error": "프로젝트를 찾을 수 없습니다."
                }
            
            project_path = Path(self.projects_metadata[project_id]["path"])
            
            # 프로젝트 디렉토리 삭제
            if project_path.exists():
                shutil.rmtree(project_path)
            
            # 메타데이터에서 제거
            del self.projects_metadata[project_id]
            self.save_projects_metadata()
            
            return {
                "success": True,
                "message": f"프로젝트 '{project_id}'이 삭제되었습니다."
            }
            
        except Exception as e:
            logger.error(f"프로젝트 삭제 실패: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "프로젝트 삭제에 실패했습니다."
            }
    
    async def get_project_status(self) -> Dict[str, Any]:
        """프로젝트 관리자 상태 확인"""
        return {
            "base_path": str(self.base_path),
            "current_project": self.current_project,
            "total_projects": len(self.projects_metadata),
            "projects": list(self.projects_metadata.keys()),
            "status": "active"
        }
