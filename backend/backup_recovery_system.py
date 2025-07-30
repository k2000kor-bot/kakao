import asyncio
import logging
import sqlite3
import shutil
import os
import json
import gzip
import hashlib
import schedule
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import tarfile
from pathlib import Path

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BackupType(Enum):
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"

class BackupStatus(Enum):
    SUCCESS = "success"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"
    SCHEDULED = "scheduled"

@dataclass
class BackupRecord:
    id: str
    backup_type: BackupType
    file_path: str
    file_size: int
    file_hash: str
    status: BackupStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retention_days: int = 30
    metadata: Dict[str, Any] = None

class BackupRecoverySystem:
    """데이터 백업 및 복구 시스템"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or self._get_default_config()
        self.backup_root = Path(self.config['backup_directory'])
        self.backup_root.mkdir(parents=True, exist_ok=True)
        
        # 백업 스케줄러
        self.scheduler_running = False
        self.scheduler_thread = None
        
        # 백업 데이터베이스
        self.backup_db_path = self.backup_root / "backup_metadata.db"
        self._init_backup_database()
        
        # 백업 대상 파일들
        self.backup_targets = self._init_backup_targets()

    def _get_default_config(self) -> Dict[str, Any]:
        """기본 설정"""
        return {
            'backup_directory': 'backups',
            'max_backup_age_days': 30,
            'full_backup_schedule': '0 2 * * 0',  # 매주 일요일 오전 2시
            'incremental_backup_schedule': '0 2 * * 1-6',  # 월~토 오전 2시
            'compression_enabled': True,
            'encryption_enabled': False,
            'max_parallel_backups': 3,
            'backup_retention_policy': {
                'daily': 7,
                'weekly': 4,
                'monthly': 12
            }
        }

    def _init_backup_database(self):
        """백업 메타데이터 데이터베이스 초기화"""
        try:
            with sqlite3.connect(self.backup_db_path) as conn:
                cursor = conn.cursor()
                
                # 백업 기록 테이블
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS backup_records (
                        id TEXT PRIMARY KEY,
                        backup_type TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        file_size INTEGER NOT NULL,
                        file_hash TEXT NOT NULL,
                        status TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        completed_at TEXT,
                        error_message TEXT,
                        retention_days INTEGER DEFAULT 30,
                        metadata TEXT
                    )
                """)
                
                # 백업 스케줄 테이블
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS backup_schedules (
                        id TEXT PRIMARY KEY,
                        backup_type TEXT NOT NULL,
                        cron_expression TEXT NOT NULL,
                        enabled BOOLEAN DEFAULT 1,
                        last_run TEXT,
                        next_run TEXT,
                        created_at TEXT NOT NULL
                    )
                """)
                
                # 복구 기록 테이블
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS recovery_records (
                        id TEXT PRIMARY KEY,
                        backup_id TEXT NOT NULL,
                        target_path TEXT NOT NULL,
                        status TEXT NOT NULL,
                        started_at TEXT NOT NULL,
                        completed_at TEXT,
                        error_message TEXT,
                        recovered_files_count INTEGER DEFAULT 0,
                        FOREIGN KEY (backup_id) REFERENCES backup_records (id)
                    )
                """)
                
                conn.commit()
                logger.info("백업 시스템 데이터베이스 초기화 완료")
                
        except Exception as e:
            logger.error(f"백업 데이터베이스 초기화 오류: {e}")

    def _init_backup_targets(self) -> List[Dict[str, Any]]:
        """백업 대상 파일 목록 초기화"""
        targets = [
            {
                'name': 'main_database',
                'path': 'advanced_message_system.db',
                'backup_type': BackupType.FULL,
                'priority': 1,
                'compression': True
            },
            {
                'name': 'conversation_summaries',
                'path': 'conversation_summaries.db',
                'backup_type': BackupType.INCREMENTAL,
                'priority': 2,
                'compression': True
            },
            {
                'name': 'translation_cache',
                'path': 'multilingual.db',
                'backup_type': BackupType.INCREMENTAL,
                'priority': 2,
                'compression': True
            },
            {
                'name': 'ai_ensemble_data',
                'path': 'ai_ensemble.db',
                'backup_type': BackupType.INCREMENTAL,
                'priority': 2,
                'compression': True
            },
            {
                'name': 'scheduler_data',
                'path': 'scheduler.db',
                'backup_type': BackupType.INCREMENTAL,
                'priority': 3,
                'compression': True
            },
            {
                'name': 'websocket_logs',
                'path': '../logs/',
                'backup_type': BackupType.DIFFERENTIAL,
                'priority': 4,
                'compression': True
            },
            {
                'name': 'media_storage',
                'path': 'media_storage/',
                'backup_type': BackupType.FULL,
                'priority': 3,
                'compression': False  # 이미지/영상은 압축 효과 적음
            }
        ]
        
        return targets

    async def create_backup(self, backup_type: BackupType = BackupType.FULL, 
                          targets: Optional[List[str]] = None) -> Dict[str, Any]:
        """백업 생성"""
        backup_id = self._generate_backup_id()
        backup_start_time = datetime.now()
        
        try:
            logger.info(f"백업 시작: {backup_id} ({backup_type.value})")
            
            # 백업 디렉토리 생성
            backup_dir = self._create_backup_directory(backup_id, backup_type)
            
            # 백업 대상 선택
            selected_targets = self._select_backup_targets(backup_type, targets)
            
            # 백업 기록 초기화
            backup_records = []
            
            # 병렬 백업 실행
            tasks = []
            semaphore = asyncio.Semaphore(self.config['max_parallel_backups'])
            
            for target in selected_targets:
                task = self._backup_single_target(semaphore, backup_id, target, backup_dir)
                tasks.append(task)
            
            backup_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 결과 처리
            successful_backups = 0
            failed_backups = 0
            total_size = 0
            
            for i, result in enumerate(backup_results):
                if isinstance(result, Exception):
                    logger.error(f"백업 실패 ({selected_targets[i]['name']}): {result}")
                    failed_backups += 1
                else:
                    backup_records.append(result)
                    successful_backups += 1
                    total_size += result.file_size
            
            # 백업 완료 처리
            backup_status = BackupStatus.SUCCESS if failed_backups == 0 else BackupStatus.FAILED
            backup_end_time = datetime.now()
            
            # 백업 메타데이터 생성
            backup_metadata = {
                'backup_id': backup_id,
                'backup_type': backup_type.value,
                'total_files': len(selected_targets),
                'successful_backups': successful_backups,
                'failed_backups': failed_backups,
                'total_size_bytes': total_size,
                'duration_seconds': (backup_end_time - backup_start_time).total_seconds(),
                'backup_directory': str(backup_dir),
                'created_at': backup_start_time.isoformat(),
                'completed_at': backup_end_time.isoformat()
            }
            
            # 메타데이터 파일 저장
            metadata_file = backup_dir / 'backup_metadata.json'
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(backup_metadata, f, ensure_ascii=False, indent=2)
            
            # 데이터베이스에 기록 저장
            for record in backup_records:
                await self._save_backup_record(record)
            
            # 오래된 백업 정리
            await self._cleanup_old_backups()
            
            logger.info(f"백업 완료: {backup_id} - 성공: {successful_backups}, 실패: {failed_backups}")
            
            return {
                'success': backup_status == BackupStatus.SUCCESS,
                'backup_id': backup_id,
                'metadata': backup_metadata,
                'records': [asdict(record) for record in backup_records]
            }
            
        except Exception as e:
            logger.error(f"백업 생성 오류: {e}")
            return {
                'success': False,
                'backup_id': backup_id,
                'error': str(e)
            }

    async def _backup_single_target(self, semaphore: asyncio.Semaphore, 
                                   backup_id: str, target: Dict[str, Any], 
                                   backup_dir: Path) -> BackupRecord:
        """단일 대상 백업"""
        async with semaphore:
            start_time = datetime.now()
            
            try:
                source_path = Path(target['path'])
                
                # 소스 파일/디렉토리 존재 확인
                if not source_path.exists():
                    raise FileNotFoundError(f"백업 대상을 찾을 수 없습니다: {source_path}")
                
                # 백업 파일명 생성
                backup_filename = f"{target['name']}_{backup_id}"
                if target.get('compression', True):
                    backup_filename += '.tar.gz'
                else:
                    backup_filename += '.tar'
                
                backup_file_path = backup_dir / backup_filename
                
                # 백업 실행
                if source_path.is_file():
                    file_size = await self._backup_single_file(
                        source_path, backup_file_path, target.get('compression', True)
                    )
                else:
                    file_size = await self._backup_directory(
                        source_path, backup_file_path, target.get('compression', True)
                    )
                
                # 파일 해시 계산
                file_hash = await self._calculate_file_hash(backup_file_path)
                
                # 백업 기록 생성
                record = BackupRecord(
                    id=f"{backup_id}_{target['name']}",
                    backup_type=target.get('backup_type', BackupType.FULL),
                    file_path=str(backup_file_path),
                    file_size=file_size,
                    file_hash=file_hash,
                    status=BackupStatus.SUCCESS,
                    created_at=start_time,
                    completed_at=datetime.now(),
                    metadata={
                        'source_path': str(source_path),
                        'target_name': target['name'],
                        'compression_enabled': target.get('compression', True),
                        'priority': target.get('priority', 5)
                    }
                )
                
                logger.info(f"백업 완료: {target['name']} ({file_size} bytes)")
                return record
                
            except Exception as e:
                logger.error(f"백업 실패 ({target['name']}): {e}")
                
                # 실패 기록 생성
                record = BackupRecord(
                    id=f"{backup_id}_{target['name']}",
                    backup_type=target.get('backup_type', BackupType.FULL),
                    file_path="",
                    file_size=0,
                    file_hash="",
                    status=BackupStatus.FAILED,
                    created_at=start_time,
                    completed_at=datetime.now(),
                    error_message=str(e),
                    metadata={'target_name': target['name']}
                )
                
                return record

    async def _backup_single_file(self, source_path: Path, backup_path: Path, 
                                 compress: bool = True) -> int:
        """단일 파일 백업"""
        try:
            if compress:
                with tarfile.open(backup_path, 'w:gz') as tar:
                    tar.add(source_path, arcname=source_path.name)
            else:
                with tarfile.open(backup_path, 'w') as tar:
                    tar.add(source_path, arcname=source_path.name)
            
            return backup_path.stat().st_size
            
        except Exception as e:
            logger.error(f"파일 백업 오류: {e}")
            raise

    async def _backup_directory(self, source_path: Path, backup_path: Path, 
                               compress: bool = True) -> int:
        """디렉토리 백업"""
        try:
            mode = 'w:gz' if compress else 'w'
            with tarfile.open(backup_path, mode) as tar:
                tar.add(source_path, arcname=source_path.name)
            
            return backup_path.stat().st_size
            
        except Exception as e:
            logger.error(f"디렉토리 백업 오류: {e}")
            raise

    async def _calculate_file_hash(self, file_path: Path) -> str:
        """파일 해시 계산"""
        try:
            hash_md5 = hashlib.md5()
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
            
        except Exception as e:
            logger.error(f"해시 계산 오류: {e}")
            return ""

    def _generate_backup_id(self) -> str:
        """백업 ID 생성"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"backup_{timestamp}"

    def _create_backup_directory(self, backup_id: str, backup_type: BackupType) -> Path:
        """백업 디렉토리 생성"""
        backup_dir = self.backup_root / backup_type.value / backup_id
        backup_dir.mkdir(parents=True, exist_ok=True)
        return backup_dir

    def _select_backup_targets(self, backup_type: BackupType, 
                              targets: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """백업 대상 선택"""
        if targets:
            # 지정된 대상만 백업
            selected = [t for t in self.backup_targets if t['name'] in targets]
        else:
            # 백업 타입에 따른 자동 선택
            if backup_type == BackupType.FULL:
                selected = self.backup_targets
            elif backup_type == BackupType.INCREMENTAL:
                selected = [t for t in self.backup_targets 
                           if t.get('backup_type') in [BackupType.INCREMENTAL, BackupType.FULL]]
            else:  # DIFFERENTIAL
                selected = [t for t in self.backup_targets 
                           if t.get('backup_type') == BackupType.DIFFERENTIAL]
        
        # 우선순위 순으로 정렬
        selected.sort(key=lambda x: x.get('priority', 5))
        return selected

    async def _save_backup_record(self, record: BackupRecord):
        """백업 기록 저장"""
        try:
            with sqlite3.connect(self.backup_db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO backup_records 
                    (id, backup_type, file_path, file_size, file_hash, status,
                     created_at, completed_at, error_message, retention_days, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    record.id, record.backup_type.value, record.file_path,
                    record.file_size, record.file_hash, record.status.value,
                    record.created_at.isoformat(),
                    record.completed_at.isoformat() if record.completed_at else None,
                    record.error_message, record.retention_days,
                    json.dumps(record.metadata) if record.metadata else None
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"백업 기록 저장 오류: {e}")

    async def restore_backup(self, backup_id: str, target_path: str = None) -> Dict[str, Any]:
        """백업 복구"""
        recovery_id = f"recovery_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        try:
            logger.info(f"백업 복구 시작: {backup_id}")
            
            # 백업 기록 조회
            backup_records = await self._get_backup_records(backup_id)
            
            if not backup_records:
                raise ValueError(f"백업을 찾을 수 없습니다: {backup_id}")
            
            # 복구 대상 경로 설정
            if target_path is None:
                target_path = f"restored_{backup_id}"
            
            target_dir = Path(target_path)
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # 복구 실행
            recovered_files = 0
            failed_files = 0
            
            for record in backup_records:
                if record['status'] != BackupStatus.SUCCESS.value:
                    continue
                
                try:
                    backup_file = Path(record['file_path'])
                    
                    if backup_file.exists():
                        # tar 파일 추출
                        with tarfile.open(backup_file, 'r:*') as tar:
                            tar.extractall(target_dir)
                        
                        recovered_files += 1
                        logger.info(f"복구 완료: {record['id']}")
                    else:
                        logger.warning(f"백업 파일을 찾을 수 없습니다: {backup_file}")
                        failed_files += 1
                        
                except Exception as e:
                    logger.error(f"복구 실패 ({record['id']}): {e}")
                    failed_files += 1
            
            # 복구 기록 저장
            await self._save_recovery_record(
                recovery_id, backup_id, str(target_dir), 
                BackupStatus.SUCCESS if failed_files == 0 else BackupStatus.FAILED,
                recovered_files
            )
            
            result = {
                'success': failed_files == 0,
                'recovery_id': recovery_id,
                'target_path': str(target_dir),
                'recovered_files': recovered_files,
                'failed_files': failed_files,
                'backup_records': backup_records
            }
            
            logger.info(f"복구 완료: {recovery_id} - 성공: {recovered_files}, 실패: {failed_files}")
            return result
            
        except Exception as e:
            logger.error(f"백업 복구 오류: {e}")
            
            # 실패 기록 저장
            await self._save_recovery_record(
                recovery_id, backup_id, target_path or "",
                BackupStatus.FAILED, 0, str(e)
            )
            
            return {
                'success': False,
                'recovery_id': recovery_id,
                'error': str(e)
            }

    async def _get_backup_records(self, backup_id: str) -> List[Dict[str, Any]]:
        """백업 기록 조회"""
        try:
            with sqlite3.connect(self.backup_db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT * FROM backup_records 
                    WHERE id LIKE ? OR id = ?
                    ORDER BY created_at
                """, (f"{backup_id}_%", backup_id))
                
                columns = [desc[0] for desc in cursor.description]
                records = []
                
                for row in cursor.fetchall():
                    record = dict(zip(columns, row))
                    if record['metadata']:
                        record['metadata'] = json.loads(record['metadata'])
                    records.append(record)
                
                return records
                
        except Exception as e:
            logger.error(f"백업 기록 조회 오류: {e}")
            return []

    async def _save_recovery_record(self, recovery_id: str, backup_id: str, 
                                  target_path: str, status: BackupStatus,
                                  recovered_files: int, error_message: str = None):
        """복구 기록 저장"""
        try:
            with sqlite3.connect(self.backup_db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO recovery_records 
                    (id, backup_id, target_path, status, started_at, completed_at,
                     error_message, recovered_files_count)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    recovery_id, backup_id, target_path, status.value,
                    datetime.now().isoformat(), datetime.now().isoformat(),
                    error_message, recovered_files
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"복구 기록 저장 오류: {e}")

    async def _cleanup_old_backups(self):
        """오래된 백업 정리"""
        try:
            retention_days = self.config['max_backup_age_days']
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            
            with sqlite3.connect(self.backup_db_path) as conn:
                cursor = conn.cursor()
                
                # 오래된 백업 기록 조회
                cursor.execute("""
                    SELECT file_path FROM backup_records 
                    WHERE created_at < ? AND status = 'success'
                """, (cutoff_date.isoformat(),))
                
                old_backups = cursor.fetchall()
                
                # 파일 삭제
                deleted_count = 0
                for (file_path,) in old_backups:
                    try:
                        backup_file = Path(file_path)
                        if backup_file.exists():
                            backup_file.unlink()
                            deleted_count += 1
                    except Exception as e:
                        logger.error(f"백업 파일 삭제 오류 ({file_path}): {e}")
                
                # 데이터베이스 기록 삭제
                cursor.execute("""
                    DELETE FROM backup_records 
                    WHERE created_at < ?
                """, (cutoff_date.isoformat(),))
                
                conn.commit()
                
                if deleted_count > 0:
                    logger.info(f"오래된 백업 {deleted_count}개 정리 완료")
                
        except Exception as e:
            logger.error(f"백업 정리 오류: {e}")

    def start_scheduled_backups(self):
        """스케줄된 백업 시작"""
        if not self.scheduler_running:
            self.scheduler_running = True
            
            # 스케줄 설정
            schedule.every().sunday.at("02:00").do(
                lambda: asyncio.create_task(self.create_backup(BackupType.FULL))
            )
            
            schedule.every().monday.at("02:00").do(
                lambda: asyncio.create_task(self.create_backup(BackupType.INCREMENTAL))
            )
            schedule.every().tuesday.at("02:00").do(
                lambda: asyncio.create_task(self.create_backup(BackupType.INCREMENTAL))
            )
            schedule.every().wednesday.at("02:00").do(
                lambda: asyncio.create_task(self.create_backup(BackupType.INCREMENTAL))
            )
            schedule.every().thursday.at("02:00").do(
                lambda: asyncio.create_task(self.create_backup(BackupType.INCREMENTAL))
            )
            schedule.every().friday.at("02:00").do(
                lambda: asyncio.create_task(self.create_backup(BackupType.INCREMENTAL))
            )
            schedule.every().saturday.at("02:00").do(
                lambda: asyncio.create_task(self.create_backup(BackupType.INCREMENTAL))
            )
            
            # 스케줄러 스레드 시작
            self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
            self.scheduler_thread.start()
            
            logger.info("백업 스케줄러 시작됨")

    def stop_scheduled_backups(self):
        """스케줄된 백업 중지"""
        self.scheduler_running = False
        schedule.clear()
        
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        
        logger.info("백업 스케줄러 중지됨")

    def _run_scheduler(self):
        """스케줄러 실행"""
        while self.scheduler_running:
            schedule.run_pending()
            time.sleep(60)  # 1분마다 체크

    def get_backup_statistics(self, days: int = 30) -> Dict[str, Any]:
        """백업 통계 조회"""
        try:
            start_date = datetime.now() - timedelta(days=days)
            
            with sqlite3.connect(self.backup_db_path) as conn:
                cursor = conn.cursor()
                
                # 전체 백업 통계
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_backups,
                        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_backups,
                        SUM(file_size) as total_size,
                        AVG(file_size) as avg_size
                    FROM backup_records 
                    WHERE created_at > ?
                """, (start_date.isoformat(),))
                
                stats = cursor.fetchone()
                
                # 백업 타입별 통계
                cursor.execute("""
                    SELECT 
                        backup_type,
                        COUNT(*) as count,
                        SUM(file_size) as total_size,
                        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful
                    FROM backup_records 
                    WHERE created_at > ?
                    GROUP BY backup_type
                """, (start_date.isoformat(),))
                
                type_stats = cursor.fetchall()
                
                # 최근 백업 목록
                cursor.execute("""
                    SELECT id, backup_type, status, created_at, file_size
                    FROM backup_records 
                    WHERE created_at > ?
                    ORDER BY created_at DESC
                    LIMIT 10
                """, (start_date.isoformat(),))
                
                recent_backups = cursor.fetchall()
                
                return {
                    'period_days': days,
                    'total_backups': stats[0] or 0,
                    'successful_backups': stats[1] or 0,
                    'success_rate': round((stats[1] or 0) / max(stats[0] or 1, 1) * 100, 2),
                    'total_size_gb': round((stats[2] or 0) / (1024**3), 2),
                    'average_size_mb': round((stats[3] or 0) / (1024**2), 2),
                    'type_statistics': [
                        {
                            'type': row[0],
                            'count': row[1],
                            'size_gb': round(row[2] / (1024**3), 2),
                            'success_rate': round(row[3] / row[1] * 100, 2)
                        }
                        for row in type_stats
                    ],
                    'recent_backups': [
                        {
                            'id': row[0],
                            'type': row[1],
                            'status': row[2],
                            'created_at': row[3],
                            'size_mb': round(row[4] / (1024**2), 2)
                        }
                        for row in recent_backups
                    ]
                }
                
        except Exception as e:
            logger.error(f"백업 통계 조회 오류: {e}")
            return {}

# 전역 백업 시스템 인스턴스
backup_system = BackupRecoverySystem()

# 비동기 함수들
async def create_system_backup(backup_type: str = "full") -> Dict[str, Any]:
    """시스템 백업 생성"""
    backup_type_enum = BackupType(backup_type.lower())
    return await backup_system.create_backup(backup_type_enum)

async def restore_system_backup(backup_id: str, target_path: str = None) -> Dict[str, Any]:
    """시스템 백업 복구"""
    return await backup_system.restore_backup(backup_id, target_path)

def start_backup_scheduler():
    """백업 스케줄러 시작"""
    backup_system.start_scheduled_backups()

def stop_backup_scheduler():
    """백업 스케줄러 중지"""
    backup_system.stop_scheduled_backups()

if __name__ == "__main__":
    # 테스트 코드
    async def test_backup_system():
        print("백업 시스템 테스트 시작...")
        
        # 전체 백업 생성
        backup_result = await create_system_backup("full")
        print(f"백업 결과: {backup_result}")
        
        if backup_result['success']:
            backup_id = backup_result['backup_id']
            
            # 백업 복구 테스트
            recovery_result = await restore_system_backup(backup_id, "test_restore")
            print(f"복구 결과: {recovery_result}")
        
        # 백업 통계 조회
        stats = backup_system.get_backup_statistics()
        print(f"백업 통계: {stats}")
    
    asyncio.run(test_backup_system()) 