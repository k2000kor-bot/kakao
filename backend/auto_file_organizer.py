import json
import shutil
import mimetypes
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AutoFileOrganizer:
    """자동 파일 분류 및 정리 시스템"""
    
    def __init__(self, watch_folder: str = "uploads",
                 organized_folder: str = "processed"):
        self.watch_folder = Path(watch_folder)
        self.organized_folder = Path(organized_folder)
        self.metadata_file = self.organized_folder / "file_metadata.json"
        self.categories = {
            "labor_law": ["노무", "근로", "고용", "임금", "퇴직", "산재", "노동조합"],
            "union_policy": ["조합", "이사회", "총회", "규약", "정관", "의결", "선거"],
            "safety_guidelines": ["안전", "보안", "소방", "대피", "응급", "화재", "사고"],
            "welfare_info": ["복리", "후생", "혜택", "지원", "보조", "장학", "의료"],
            "negotiation_materials": ["협상", "계약", "합의", "조건", "단가", "입찰"],
            "training_materials": ["교육", "연수", "세미나", "워크샵", "강의", "훈련"]
        }
        
        self.file_type_mapping = {
            '.pdf': 'documents',
            '.doc': 'documents', '.docx': 'documents',
            '.xls': 'spreadsheets', '.xlsx': 'spreadsheets',
            '.ppt': 'presentations', '.pptx': 'presentations',
            '.txt': 'text_files', '.md': 'text_files',
            '.jpg': 'images', '.jpeg': 'images', '.png': 'images',
            '.mp4': 'videos', '.avi': 'videos', '.mov': 'videos',
            '.mp3': 'audio', '.wav': 'audio', '.m4a': 'audio'
        }
        
        self.ensure_directories()
        self.load_metadata()
        
    def ensure_directories(self):
        """필요한 디렉토리 생성"""
        self.watch_folder.mkdir(exist_ok=True)
        self.organized_folder.mkdir(exist_ok=True)
        
        for category in self.categories.keys():
            (self.organized_folder / category).mkdir(exist_ok=True)
            
        for file_type in set(self.file_type_mapping.values()):
            (self.organized_folder / file_type).mkdir(exist_ok=True)
            
    def load_metadata(self):
        """메타데이터 파일 로드"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {
                "files": {},
                "statistics": {
                    "total_files": 0,
                    "categories": {cat: 0 for cat in self.categories.keys()},
                    "file_types": {},
                    "last_updated": None
                }
            }
            
    def save_metadata(self):
        """메타데이터 파일 저장"""
        self.metadata["statistics"]["last_updated"] = datetime.now().isoformat()
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)
            
    def calculate_file_hash(self, file_path: Path) -> str:
        """파일 해시 계산"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            logger.error(f"파일 해시 계산 오류: {e}")
            return None
            
    def extract_file_info(self, file_path: Path) -> Dict:
        """파일 정보 추출"""
        try:
            stat = file_path.stat()
            mime_type, _ = mimetypes.guess_type(str(file_path))
            
            return {
                "filename": file_path.name,
                "original_path": str(file_path),
                "size": stat.st_size,
                "created_time": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_time": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "file_extension": file_path.suffix.lower(),
                "mime_type": mime_type,
                "file_hash": self.calculate_file_hash(file_path)
            }
        except Exception as e:
            logger.error(f"파일 정보 추출 오류: {e}")
            return {}
            
    def classify_by_content(self, filename: str, content: str = "") -> str:
        """파일 내용 기반 분류"""
        text_to_analyze = f"{filename} {content}".lower()
        
        scores = {}
        for category, keywords in self.categories.items():
            score = sum(1 for keyword in keywords if keyword in text_to_analyze)
            if score > 0:
                scores[category] = score
                
        if scores:
            return max(scores.keys(), key=lambda k: scores[k])
        return "training_materials"
        
    def organize_file(self, file_path: Path) -> Dict:
        """파일 정리 및 분류"""
        try:
            file_info = self.extract_file_info(file_path)
            if not file_info:
                return {"success": False, "error": "파일 정보 추출 실패"}
                
            # 중복 파일 확인
            file_hash = file_info["file_hash"]
            if file_hash:
                for existing_file in self.metadata["files"].values():
                    if existing_file.get("file_hash") == file_hash:
                        logger.info(f"중복 파일 발견: {file_path.name}")
                        return {
                            "success": False, 
                            "error": "중복 파일", 
                            "duplicate_of": existing_file["filename"]
                        }
                        
            # 분류
            content_category = self.classify_by_content(file_path.name)
            target_dir = self.organized_folder / content_category
            
            # 안전한 파일명 생성
            safe_filename = self.get_safe_filename(file_path.name, target_dir)
            target_path = target_dir / safe_filename
            
            # 파일 이동
            shutil.move(str(file_path), str(target_path))
            
            # 메타데이터 업데이트
            file_id = f"{content_category}_{safe_filename}"
            self.metadata["files"][file_id] = {
                **file_info,
                "new_path": str(target_path),
                "content_category": content_category,
                "organized_time": datetime.now().isoformat(),
                "auto_classified": True
            }
            
            # 통계 업데이트
            self.metadata["statistics"]["total_files"] += 1
            self.metadata["statistics"]["categories"][content_category] += 1
            
            file_ext = file_info["file_extension"]
            if file_ext not in self.metadata["statistics"]["file_types"]:
                self.metadata["statistics"]["file_types"][file_ext] = 0
            self.metadata["statistics"]["file_types"][file_ext] += 1
            
            self.save_metadata()
            
            logger.info(f"파일 정리 완료: {file_path.name} -> {target_path}")
            
            return {
                "success": True,
                "original_path": str(file_path),
                "new_path": str(target_path),
                "category": content_category,
                "metadata": self.metadata["files"][file_id]
            }
            
        except Exception as e:
            logger.error(f"파일 정리 오류: {e}")
            return {"success": False, "error": str(e)}
            
    def get_safe_filename(self, original_name: str, target_dir: Path) -> str:
        """안전한 파일명 생성"""
        base_name = Path(original_name).stem
        extension = Path(original_name).suffix
        counter = 1
        
        new_name = original_name
        while (target_dir / new_name).exists():
            new_name = f"{base_name}_{counter}{extension}"
            counter += 1
            
        return new_name
            
    def process_existing_files(self):
        """기존 파일들 일괄 처리"""
        if not self.watch_folder.exists():
            return []
            
        results = []
        for file_path in self.watch_folder.iterdir():
            if file_path.is_file() and not file_path.name.startswith('.'):
                result = self.organize_file(file_path)
                results.append(result)
                
        return results
        
    def get_statistics(self) -> Dict:
        """통계 정보 반환"""
        return self.metadata["statistics"]
        
    def get_file_list(self, category: Optional[str] = None) -> List[Dict]:
        """파일 목록 반환"""
        files = list(self.metadata["files"].values())
        
        if category:
            files = [f for f in files if f.get("content_category") == category]
            
        return sorted(files, key=lambda x: x.get("organized_time", ""), 
                      reverse=True)


class FileWatcher(FileSystemEventHandler):
    """파일 감시자"""
    
    def __init__(self, organizer: AutoFileOrganizer):
        self.organizer = organizer
        
    def on_created(self, event):
        if not event.is_directory:
            file_path = Path(event.src_path)
            if not file_path.name.startswith('.'):
                logger.info(f"새 파일 감지: {file_path}")
                asyncio.run(self._delayed_process(file_path))
                
    async def _delayed_process(self, file_path: Path):
        """지연된 파일 처리"""
        await asyncio.sleep(2)
        if file_path.exists():
            result = self.organizer.organize_file(file_path)
            if result["success"]:
                logger.info(f"자동 분류 완료: {result['new_path']}")
            else:
                logger.error(f"자동 분류 실패: {result.get('error')}")


def start_file_watcher(watch_folder: str = "uploads"):
    """파일 감시자 시작"""
    organizer = AutoFileOrganizer(watch_folder)
    event_handler = FileWatcher(organizer)
    observer = Observer()
    observer.schedule(event_handler, str(organizer.watch_folder), 
                     recursive=False)
    observer.start()
    
    logger.info(f"파일 감시 시작: {organizer.watch_folder}")
    
    try:
        while True:
            asyncio.run(asyncio.sleep(1))
    except KeyboardInterrupt:
        observer.stop()
        logger.info("파일 감시 중단")
        
    observer.join()
    return organizer


if __name__ == "__main__":
    organizer = AutoFileOrganizer()
    
    print("기존 파일들 처리 중...")
    results = organizer.process_existing_files()
    
    for result in results:
        if result["success"]:
            print(f"✅ {result['original_path']} -> {result['new_path']}")
        else:
            print(f"❌ {result.get('error', '알 수 없는 오류')}")
            
    stats = organizer.get_statistics()
    print(f"\n📊 정리 완료!")
    print(f"총 파일 수: {stats['total_files']}")
    print("카테고리별 분포:")
    for category, count in stats['categories'].items():
        if count > 0:
            print(f"  - {category}: {count}개") 