# backend/api/backup_recovery_api.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import random
import time
import logging
import os
import shutil
import zipfile
import hashlib
from enum import Enum

router = APIRouter()
logger = logging.getLogger(__name__)

class BackupType(str, Enum):
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"
    SELECTIVE = "selective"

class BackupStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class RecoveryStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class BackupJob(BaseModel):
    id: str
    name: str
    description: str
    backup_type: BackupType
    source_paths: List[str]
    destination_path: str
    compression: bool
    encryption: bool
    retention_days: int
    schedule: Optional[str] = None  # cron expression
    status: BackupStatus
    created_at: datetime
    updated_at: datetime
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    run_count: int = 0
    success_count: int = 0
    error_count: int = 0
    total_size: Optional[int] = None
    compressed_size: Optional[int] = None

class BackupRecord(BaseModel):
    id: str
    job_id: str
    backup_type: BackupType
    status: BackupStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    file_count: int = 0
    total_size: int = 0
    compressed_size: Optional[int] = None
    checksum: Optional[str] = None
    error_message: Optional[str] = None
    retention_until: datetime

class RecoveryJob(BaseModel):
    id: str
    backup_id: str
    target_path: str
    status: RecoveryStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    recovered_files: int = 0
    recovered_size: int = 0
    error_message: Optional[str] = None

# 백업 데이터 저장소
backup_jobs: Dict[str, BackupJob] = {}
backup_records: Dict[str, BackupRecord] = {}
recovery_jobs: Dict[str, RecoveryJob] = {}

# 기본 백업 작업 생성
def create_default_backup_jobs():
    """기본 백업 작업들을 생성합니다."""
    
    # 시스템 전체 백업
    system_backup = BackupJob(
        id="system_full_backup",
        name="시스템 전체 백업",
        description="시스템의 모든 중요 데이터를 백업합니다.",
        backup_type=BackupType.FULL,
        source_paths=["/data", "/config", "/logs"],
        destination_path="/backups/system",
        compression=True,
        encryption=True,
        retention_days=30,
        schedule="0 2 * * *",  # 매일 새벽 2시
        status=BackupStatus.PENDING,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        next_run=datetime.now() + timedelta(hours=1)
    )
    
    # 데이터베이스 백업
    db_backup = BackupJob(
        id="database_backup",
        name="데이터베이스 백업",
        description="데이터베이스의 모든 테이블과 데이터를 백업합니다.",
        backup_type=BackupType.FULL,
        source_paths=["/database"],
        destination_path="/backups/database",
        compression=True,
        encryption=True,
        retention_days=90,
        schedule="0 3 * * *",  # 매일 새벽 3시
        status=BackupStatus.PENDING,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        next_run=datetime.now() + timedelta(hours=2)
    )
    
    # 설정 파일 백업
    config_backup = BackupJob(
        id="config_backup",
        name="설정 파일 백업",
        description="시스템 설정 파일들을 백업합니다.",
        backup_type=BackupType.INCREMENTAL,
        source_paths=["/etc", "/config"],
        destination_path="/backups/config",
        compression=True,
        encryption=False,
        retention_days=180,
        schedule="0 4 * * 0",  # 매주 일요일 새벽 4시
        status=BackupStatus.PENDING,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        next_run=datetime.now() + timedelta(days=1)
    )
    
    backup_jobs["system_full_backup"] = system_backup
    backup_jobs["database_backup"] = db_backup
    backup_jobs["config_backup"] = config_backup

# 기본 백업 작업 초기화
create_default_backup_jobs()

@router.get("/backup/jobs")
async def get_backup_jobs():
    """모든 백업 작업 조회"""
    try:
        return {
            "success": True,
            "data": {
                "jobs": list(backup_jobs.values()),
                "total_count": len(backup_jobs),
                "active_count": len([j for j in backup_jobs.values() if j.status == BackupStatus.PENDING])
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get backup jobs error: {e}")
        raise HTTPException(status_code=500, detail="백업 작업 조회 실패")

@router.get("/backup/jobs/{job_id}")
async def get_backup_job(job_id: str):
    """특정 백업 작업 조회"""
    try:
        if job_id not in backup_jobs:
            raise HTTPException(status_code=404, detail="백업 작업을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": backup_jobs[job_id],
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get backup job error: {e}")
        raise HTTPException(status_code=500, detail="백업 작업 조회 실패")

@router.post("/backup/jobs")
async def create_backup_job(job: BackupJob):
    """새 백업 작업 생성"""
    try:
        job.created_at = datetime.now()
        job.updated_at = datetime.now()
        backup_jobs[job.id] = job
        
        return {
            "success": True,
            "data": job,
            "message": "백업 작업이 성공적으로 생성되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Create backup job error: {e}")
        raise HTTPException(status_code=500, detail="백업 작업 생성 실패")

@router.put("/backup/jobs/{job_id}")
async def update_backup_job(job_id: str, job_update: Dict[str, Any]):
    """백업 작업 업데이트"""
    try:
        if job_id not in backup_jobs:
            raise HTTPException(status_code=404, detail="백업 작업을 찾을 수 없습니다")
        
        job = backup_jobs[job_id]
        for key, value in job_update.items():
            if hasattr(job, key):
                setattr(job, key, value)
        
        job.updated_at = datetime.now()
        backup_jobs[job_id] = job
        
        return {
            "success": True,
            "data": job,
            "message": "백업 작업이 성공적으로 업데이트되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update backup job error: {e}")
        raise HTTPException(status_code=500, detail="백업 작업 업데이트 실패")

@router.delete("/backup/jobs/{job_id}")
async def delete_backup_job(job_id: str):
    """백업 작업 삭제"""
    try:
        if job_id not in backup_jobs:
            raise HTTPException(status_code=404, detail="백업 작업을 찾을 수 없습니다")
        
        del backup_jobs[job_id]
        
        return {
            "success": True,
            "message": "백업 작업이 성공적으로 삭제되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete backup job error: {e}")
        raise HTTPException(status_code=500, detail="백업 작업 삭제 실패")

@router.post("/backup/jobs/{job_id}/execute")
async def execute_backup_job(job_id: str, background_tasks: BackgroundTasks):
    """백업 작업 수동 실행"""
    try:
        if job_id not in backup_jobs:
            raise HTTPException(status_code=404, detail="백업 작업을 찾을 수 없습니다")
        
        job = backup_jobs[job_id]
        backup_id = f"backup_{int(time.time())}_{job_id}"
        
        # 백업 기록 생성
        backup_record = BackupRecord(
            id=backup_id,
            job_id=job_id,
            backup_type=job.backup_type,
            status=BackupStatus.RUNNING,
            started_at=datetime.now(),
            retention_until=datetime.now() + timedelta(days=job.retention_days)
        )
        backup_records[backup_id] = backup_record
        
        # 백그라운드에서 백업 실행
        background_tasks.add_task(run_backup, job, backup_record)
        
        return {
            "success": True,
            "data": {
                "backup_id": backup_id,
                "status": "started",
                "message": "백업이 시작되었습니다"
            },
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Execute backup job error: {e}")
        raise HTTPException(status_code=500, detail="백업 실행 실패")

async def run_backup(job: BackupJob, backup_record: BackupRecord):
    """백업 실행 로직"""
    try:
        logger.info(f"백업 시작: {job.name} (ID: {backup_record.id})")
        
        # 시뮬레이션된 백업 프로세스
        await simulate_backup_process(job, backup_record)
        
        # 백업 완료
        backup_record.status = BackupStatus.COMPLETED
        backup_record.completed_at = datetime.now()
        
        # 작업 통계 업데이트
        job.run_count += 1
        job.success_count += 1
        job.last_run = datetime.now()
        
        logger.info(f"백업 완료: {job.name}")
        
    except Exception as e:
        backup_record.status = BackupStatus.FAILED
        backup_record.error_message = str(e)
        backup_record.completed_at = datetime.now()
        
        job.error_count += 1
        logger.error(f"백업 실패: {job.name} - {str(e)}")

async def simulate_backup_process(job: BackupJob, backup_record: BackupRecord):
    """백업 프로세스 시뮬레이션"""
    # 파일 수 시뮬레이션
    file_count = random.randint(100, 1000)
    total_size = random.randint(100 * 1024 * 1024, 10 * 1024 * 1024 * 1024)  # 100MB ~ 10GB
    
    backup_record.file_count = file_count
    backup_record.total_size = total_size
    
    # 압축 시뮬레이션
    if job.compression:
        compressed_size = int(total_size * random.uniform(0.3, 0.7))
        backup_record.compressed_size = compressed_size
    
    # 체크섬 생성
    backup_record.checksum = hashlib.md5(f"{job.id}_{backup_record.started_at}".encode()).hexdigest()
    
    # 백업 시간 시뮬레이션
    await asyncio.sleep(random.uniform(2, 10))

@router.get("/backup/records")
async def get_backup_records(job_id: Optional[str] = None, limit: int = 50):
    """백업 기록 조회"""
    try:
        filtered_records = list(backup_records.values())
        
        if job_id:
            filtered_records = [r for r in filtered_records if r.job_id == job_id]
        
        # 최신 순으로 정렬하고 제한
        filtered_records.sort(key=lambda x: x.started_at, reverse=True)
        filtered_records = filtered_records[:limit]
        
        return {
            "success": True,
            "data": {
                "records": filtered_records,
                "total_count": len(filtered_records)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get backup records error: {e}")
        raise HTTPException(status_code=500, detail="백업 기록 조회 실패")

@router.get("/backup/records/{record_id}")
async def get_backup_record(record_id: str):
    """특정 백업 기록 조회"""
    try:
        if record_id not in backup_records:
            raise HTTPException(status_code=404, detail="백업 기록을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": backup_records[record_id],
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get backup record error: {e}")
        raise HTTPException(status_code=500, detail="백업 기록 조회 실패")

@router.post("/backup/records/{record_id}/recover")
async def recover_backup(record_id: str, target_path: str, background_tasks: BackgroundTasks):
    """백업 복구"""
    try:
        if record_id not in backup_records:
            raise HTTPException(status_code=404, detail="백업 기록을 찾을 수 없습니다")
        
        backup_record = backup_records[record_id]
        if backup_record.status != BackupStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="완료된 백업만 복구할 수 있습니다")
        
        recovery_id = f"recovery_{int(time.time())}_{record_id}"
        
        # 복구 작업 생성
        recovery_job = RecoveryJob(
            id=recovery_id,
            backup_id=record_id,
            target_path=target_path,
            status=RecoveryStatus.RUNNING,
            started_at=datetime.now()
        )
        recovery_jobs[recovery_id] = recovery_job
        
        # 백그라운드에서 복구 실행
        background_tasks.add_task(run_recovery, backup_record, recovery_job)
        
        return {
            "success": True,
            "data": {
                "recovery_id": recovery_id,
                "status": "started",
                "message": "복구가 시작되었습니다"
            },
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recover backup error: {e}")
        raise HTTPException(status_code=500, detail="백업 복구 실패")

async def run_recovery(backup_record: BackupRecord, recovery_job: RecoveryJob):
    """복구 실행 로직"""
    try:
        logger.info(f"복구 시작: {recovery_job.id}")
        
        # 시뮬레이션된 복구 프로세스
        await simulate_recovery_process(backup_record, recovery_job)
        
        # 복구 완료
        recovery_job.status = RecoveryStatus.COMPLETED
        recovery_job.completed_at = datetime.now()
        
        logger.info(f"복구 완료: {recovery_job.id}")
        
    except Exception as e:
        recovery_job.status = RecoveryStatus.FAILED
        recovery_job.error_message = str(e)
        recovery_job.completed_at = datetime.now()
        
        logger.error(f"복구 실패: {recovery_job.id} - {str(e)}")

async def simulate_recovery_process(backup_record: BackupRecord, recovery_job: RecoveryJob):
    """복구 프로세스 시뮬레이션"""
    recovery_job.recovered_files = backup_record.file_count
    recovery_job.recovered_size = backup_record.total_size
    
    # 복구 시간 시뮬레이션
    await asyncio.sleep(random.uniform(1, 5))

@router.get("/backup/recovery-jobs")
async def get_recovery_jobs(limit: int = 50):
    """복구 작업 조회"""
    try:
        recovery_list = list(recovery_jobs.values())
        
        # 최신 순으로 정렬하고 제한
        recovery_list.sort(key=lambda x: x.started_at, reverse=True)
        recovery_list = recovery_list[:limit]
        
        return {
            "success": True,
            "data": {
                "recoveries": recovery_list,
                "total_count": len(recovery_list)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get recovery jobs error: {e}")
        raise HTTPException(status_code=500, detail="복구 작업 조회 실패")

@router.get("/backup/status")
async def get_backup_status():
    """백업 시스템 상태 조회"""
    try:
        total_jobs = len(backup_jobs)
        active_jobs = len([j for j in backup_jobs.values() if j.status == BackupStatus.PENDING])
        running_backups = len([r for r in backup_records.values() if r.status == BackupStatus.RUNNING])
        running_recoveries = len([r for r in recovery_jobs.values() if r.status == RecoveryStatus.RUNNING])
        
        total_records = len(backup_records)
        successful_backups = len([r for r in backup_records.values() if r.status == BackupStatus.COMPLETED])
        failed_backups = len([r for r in backup_records.values() if r.status == BackupStatus.FAILED])
        
        total_size = sum([r.total_size for r in backup_records.values() if r.total_size])
        compressed_size = sum([r.compressed_size for r in backup_records.values() if r.compressed_size])
        
        status = {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "running_backups": running_backups,
            "running_recoveries": running_recoveries,
            "total_records": total_records,
            "successful_backups": successful_backups,
            "failed_backups": failed_backups,
            "success_rate": round((successful_backups / total_records) * 100, 2) if total_records > 0 else 0,
            "total_backup_size": total_size,
            "compressed_size": compressed_size,
            "compression_ratio": round((compressed_size / total_size) * 100, 2) if total_size > 0 else 0,
            "system_health": "healthy" if failed_backups < total_records * 0.1 else "warning"
        }
        
        return {
            "success": True,
            "data": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get backup status error: {e}")
        raise HTTPException(status_code=500, detail="백업 상태 조회 실패")

@router.post("/backup/cleanup")
async def cleanup_old_backups():
    """오래된 백업 정리"""
    try:
        current_time = datetime.now()
        cleaned_count = 0
        
        # 만료된 백업 기록 찾기
        expired_records = [
            record_id for record_id, record in backup_records.items()
            if record.retention_until < current_time
        ]
        
        # 만료된 백업 삭제
        for record_id in expired_records:
            del backup_records[record_id]
            cleaned_count += 1
        
        return {
            "success": True,
            "data": {
                "cleaned_records": cleaned_count,
                "message": f"{cleaned_count}개의 만료된 백업이 정리되었습니다"
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Cleanup old backups error: {e}")
        raise HTTPException(status_code=500, detail="백업 정리 실패")

@router.get("/backup/storage-usage")
async def get_storage_usage():
    """백업 저장소 사용량 조회"""
    try:
        # 시뮬레이션된 저장소 사용량
        total_capacity = 1000 * 1024 * 1024 * 1024  # 1TB
        used_space = random.randint(200, 800) * 1024 * 1024 * 1024  # 200GB ~ 800GB
        available_space = total_capacity - used_space
        
        usage_by_type = {
            "full_backups": random.randint(100, 300) * 1024 * 1024 * 1024,
            "incremental_backups": random.randint(50, 150) * 1024 * 1024 * 1024,
            "differential_backups": random.randint(30, 100) * 1024 * 1024 * 1024,
            "compressed_backups": random.randint(200, 400) * 1024 * 1024 * 1024
        }
        
        return {
            "success": True,
            "data": {
                "total_capacity": total_capacity,
                "used_space": used_space,
                "available_space": available_space,
                "usage_percentage": round((used_space / total_capacity) * 100, 2),
                "usage_by_type": usage_by_type,
                "recommendations": [
                    "저장소 사용량이 80%를 초과했습니다. 오래된 백업을 정리하세요.",
                    "압축 백업의 비율이 높습니다. 압축 설정을 최적화하세요.",
                    "증분 백업의 크기가 증가하고 있습니다. 전체 백업을 고려하세요."
                ] if (used_space / total_capacity) > 0.8 else []
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get storage usage error: {e}")
        raise HTTPException(status_code=500, detail="저장소 사용량 조회 실패")
