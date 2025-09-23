# backend/api/automation_api.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import random
import time
import logging
import asyncio
from enum import Enum

router = APIRouter()
logger = logging.getLogger(__name__)

class WorkflowStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    COMPLETED = "completed"

class TriggerType(str, Enum):
    SCHEDULE = "schedule"
    EVENT = "event"
    MANUAL = "manual"
    CONDITION = "condition"

class ActionType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    API_CALL = "api_call"
    DATA_PROCESSING = "data_processing"
    SYSTEM_OPTIMIZATION = "system_optimization"
    BACKUP = "backup"
    REPORT_GENERATION = "report_generation"
    ALERT = "alert"

class WorkflowTrigger(BaseModel):
    type: TriggerType
    schedule: Optional[str] = None  # cron expression
    condition: Optional[Dict[str, Any]] = None
    event_type: Optional[str] = None

class WorkflowAction(BaseModel):
    type: ActionType
    config: Dict[str, Any]
    timeout: int = 300  # seconds

class WorkflowDefinition(BaseModel):
    id: str
    name: str
    description: str
    status: WorkflowStatus
    trigger: WorkflowTrigger
    actions: List[WorkflowAction]
    created_at: datetime
    updated_at: datetime
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    run_count: int = 0
    success_count: int = 0
    error_count: int = 0

class WorkflowExecution(BaseModel):
    id: str
    workflow_id: str
    status: WorkflowStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    actions_completed: List[str] = []
    actions_failed: List[str] = []
    error_message: Optional[str] = None
    execution_time: Optional[float] = None

# 워크플로우 저장소 (실제 환경에서는 데이터베이스 사용)
workflows: Dict[str, WorkflowDefinition] = {}
executions: Dict[str, WorkflowExecution] = {}

# 기본 워크플로우 생성
def create_default_workflows():
    """기본 워크플로우들을 생성합니다."""
    
    # 시스템 백업 워크플로우
    backup_workflow = WorkflowDefinition(
        id="backup_daily",
        name="일일 시스템 백업",
        description="매일 새벽 2시에 시스템 백업을 수행합니다.",
        status=WorkflowStatus.ACTIVE,
        trigger=WorkflowTrigger(
            type=TriggerType.SCHEDULE,
            schedule="0 2 * * *"  # 매일 새벽 2시
        ),
        actions=[
            WorkflowAction(
                type=ActionType.BACKUP,
                config={
                    "backup_type": "full",
                    "retention_days": 30,
                    "compression": True
                }
            ),
            WorkflowAction(
                type=ActionType.EMAIL,
                config={
                    "to": "admin@company.com",
                    "subject": "일일 백업 완료",
                    "template": "backup_completion"
                }
            )
        ],
        created_at=datetime.now(),
        updated_at=datetime.now(),
        next_run=datetime.now() + timedelta(hours=1)
    )
    
    # 성능 모니터링 워크플로우
    monitoring_workflow = WorkflowDefinition(
        id="performance_monitoring",
        name="성능 모니터링",
        description="시스템 성능을 실시간으로 모니터링하고 임계값 초과 시 알림을 발송합니다.",
        status=WorkflowStatus.ACTIVE,
        trigger=WorkflowTrigger(
            type=TriggerType.CONDITION,
            condition={
                "metric": "cpu_usage",
                "operator": ">",
                "threshold": 80
            }
        ),
        actions=[
            WorkflowAction(
                type=ActionType.ALERT,
                config={
                    "severity": "warning",
                    "channels": ["email", "slack"],
                    "message": "CPU 사용률이 80%를 초과했습니다."
                }
            ),
            WorkflowAction(
                type=ActionType.SYSTEM_OPTIMIZATION,
                config={
                    "optimization_type": "auto_scale",
                    "target_metric": "cpu_usage"
                }
            )
        ],
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    # 리포트 생성 워크플로우
    report_workflow = WorkflowDefinition(
        id="weekly_report",
        name="주간 리포트 생성",
        description="매주 월요일 오전 9시에 주간 리포트를 생성하고 배포합니다.",
        status=WorkflowStatus.ACTIVE,
        trigger=WorkflowTrigger(
            type=TriggerType.SCHEDULE,
            schedule="0 9 * * 1"  # 매주 월요일 오전 9시
        ),
        actions=[
            WorkflowAction(
                type=ActionType.REPORT_GENERATION,
                config={
                    "report_type": "weekly_summary",
                    "include_metrics": ["performance", "usage", "errors"],
                    "format": "pdf"
                }
            ),
            WorkflowAction(
                type=ActionType.EMAIL,
                config={
                    "to": "stakeholders@company.com",
                    "subject": "주간 시스템 리포트",
                    "template": "weekly_report"
                }
            )
        ],
        created_at=datetime.now(),
        updated_at=datetime.now(),
        next_run=datetime.now() + timedelta(days=1)
    )
    
    workflows["backup_daily"] = backup_workflow
    workflows["performance_monitoring"] = monitoring_workflow
    workflows["weekly_report"] = report_workflow

# 기본 워크플로우 초기화
create_default_workflows()

@router.get("/automation/workflows")
async def get_workflows():
    """모든 워크플로우 조회"""
    try:
        return {
            "success": True,
            "data": {
                "workflows": list(workflows.values()),
                "total_count": len(workflows),
                "active_count": len([w for w in workflows.values() if w.status == WorkflowStatus.ACTIVE])
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get workflows error: {e}")
        raise HTTPException(status_code=500, detail="워크플로우 조회 실패")

@router.get("/automation/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    """특정 워크플로우 조회"""
    try:
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": workflows[workflow_id],
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get workflow error: {e}")
        raise HTTPException(status_code=500, detail="워크플로우 조회 실패")

@router.post("/automation/workflows")
async def create_workflow(workflow: WorkflowDefinition):
    """새 워크플로우 생성"""
    try:
        workflow.created_at = datetime.now()
        workflow.updated_at = datetime.now()
        workflows[workflow.id] = workflow
        
        return {
            "success": True,
            "data": workflow,
            "message": "워크플로우가 성공적으로 생성되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Create workflow error: {e}")
        raise HTTPException(status_code=500, detail="워크플로우 생성 실패")

@router.put("/automation/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, workflow_update: Dict[str, Any]):
    """워크플로우 업데이트"""
    try:
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
        
        workflow = workflows[workflow_id]
        for key, value in workflow_update.items():
            if hasattr(workflow, key):
                setattr(workflow, key, value)
        
        workflow.updated_at = datetime.now()
        workflows[workflow_id] = workflow
        
        return {
            "success": True,
            "data": workflow,
            "message": "워크플로우가 성공적으로 업데이트되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update workflow error: {e}")
        raise HTTPException(status_code=500, detail="워크플로우 업데이트 실패")

@router.delete("/automation/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """워크플로우 삭제"""
    try:
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
        
        del workflows[workflow_id]
        
        return {
            "success": True,
            "message": "워크플로우가 성공적으로 삭제되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete workflow error: {e}")
        raise HTTPException(status_code=500, detail="워크플로우 삭제 실패")

@router.post("/automation/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, background_tasks: BackgroundTasks):
    """워크플로우 수동 실행"""
    try:
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
        
        workflow = workflows[workflow_id]
        execution_id = f"exec_{int(time.time())}_{workflow_id}"
        
        # 실행 기록 생성
        execution = WorkflowExecution(
            id=execution_id,
            workflow_id=workflow_id,
            status=WorkflowStatus.RUNNING,
            started_at=datetime.now()
        )
        executions[execution_id] = execution
        
        # 백그라운드에서 워크플로우 실행
        background_tasks.add_task(run_workflow, workflow, execution_id)
        
        return {
            "success": True,
            "data": {
                "execution_id": execution_id,
                "status": "started",
                "message": "워크플로우 실행이 시작되었습니다"
            },
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Execute workflow error: {e}")
        raise HTTPException(status_code=500, detail="워크플로우 실행 실패")

async def run_workflow(workflow: WorkflowDefinition, execution_id: str):
    """워크플로우 실행 로직"""
    try:
        execution = executions[execution_id]
        start_time = time.time()
        
        logger.info(f"워크플로우 실행 시작: {workflow.name} (ID: {execution_id})")
        
        # 각 액션 실행
        for action in workflow.actions:
            try:
                await execute_action(action)
                execution.actions_completed.append(action.type)
                logger.info(f"액션 완료: {action.type}")
            except Exception as e:
                execution.actions_failed.append(action.type)
                logger.error(f"액션 실패: {action.type} - {str(e)}")
        
        # 실행 완료
        execution.status = WorkflowStatus.COMPLETED
        execution.completed_at = datetime.now()
        execution.execution_time = time.time() - start_time
        
        # 워크플로우 통계 업데이트
        workflow.run_count += 1
        if execution.status == WorkflowStatus.COMPLETED:
            workflow.success_count += 1
        else:
            workflow.error_count += 1
        workflow.last_run = datetime.now()
        
        logger.info(f"워크플로우 실행 완료: {workflow.name} (실행 시간: {execution.execution_time:.2f}초)")
        
    except Exception as e:
        execution.status = WorkflowStatus.ERROR
        execution.error_message = str(e)
        execution.completed_at = datetime.now()
        logger.error(f"워크플로우 실행 오류: {str(e)}")

async def execute_action(action: WorkflowAction):
    """개별 액션 실행"""
    # 실제 환경에서는 각 액션 타입에 맞는 로직 구현
    await asyncio.sleep(random.uniform(0.5, 2.0))  # 시뮬레이션
    
    if action.type == ActionType.BACKUP:
        logger.info(f"백업 실행: {action.config}")
    elif action.type == ActionType.EMAIL:
        logger.info(f"이메일 발송: {action.config}")
    elif action.type == ActionType.ALERT:
        logger.info(f"알림 발송: {action.config}")
    elif action.type == ActionType.REPORT_GENERATION:
        logger.info(f"리포트 생성: {action.config}")
    elif action.type == ActionType.SYSTEM_OPTIMIZATION:
        logger.info(f"시스템 최적화: {action.config}")
    else:
        logger.info(f"액션 실행: {action.type}")

@router.get("/automation/executions")
async def get_executions(workflow_id: Optional[str] = None, limit: int = 50):
    """실행 기록 조회"""
    try:
        filtered_executions = list(executions.values())
        
        if workflow_id:
            filtered_executions = [e for e in filtered_executions if e.workflow_id == workflow_id]
        
        # 최신 순으로 정렬하고 제한
        filtered_executions.sort(key=lambda x: x.started_at, reverse=True)
        filtered_executions = filtered_executions[:limit]
        
        return {
            "success": True,
            "data": {
                "executions": filtered_executions,
                "total_count": len(filtered_executions)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get executions error: {e}")
        raise HTTPException(status_code=500, detail="실행 기록 조회 실패")

@router.get("/automation/executions/{execution_id}")
async def get_execution(execution_id: str):
    """특정 실행 기록 조회"""
    try:
        if execution_id not in executions:
            raise HTTPException(status_code=404, detail="실행 기록을 찾을 수 없습니다")
        
        return {
            "success": True,
            "data": executions[execution_id],
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get execution error: {e}")
        raise HTTPException(status_code=500, detail="실행 기록 조회 실패")

@router.get("/automation/status")
async def get_automation_status():
    """자동화 시스템 상태 조회"""
    try:
        active_workflows = [w for w in workflows.values() if w.status == WorkflowStatus.ACTIVE]
        running_executions = [e for e in executions.values() if e.status == WorkflowStatus.RUNNING]
        
        status = {
            "total_workflows": len(workflows),
            "active_workflows": len(active_workflows),
            "running_executions": len(running_executions),
            "total_executions": len(executions),
            "success_rate": 0,
            "system_health": "healthy"
        }
        
        if executions:
            successful_executions = len([e for e in executions.values() if e.status == WorkflowStatus.COMPLETED])
            status["success_rate"] = round((successful_executions / len(executions)) * 100, 2)
        
        return {
            "success": True,
            "data": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get automation status error: {e}")
        raise HTTPException(status_code=500, detail="자동화 상태 조회 실패")

@router.post("/automation/workflows/{workflow_id}/pause")
async def pause_workflow(workflow_id: str):
    """워크플로우 일시정지"""
    try:
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
        
        workflow = workflows[workflow_id]
        workflow.status = WorkflowStatus.PAUSED
        workflow.updated_at = datetime.now()
        
        return {
            "success": True,
            "message": "워크플로우가 일시정지되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pause workflow error: {e}")
        raise HTTPException(status_code=500, detail="워크플로우 일시정지 실패")

@router.post("/automation/workflows/{workflow_id}/resume")
async def resume_workflow(workflow_id: str):
    """워크플로우 재개"""
    try:
        if workflow_id not in workflows:
            raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
        
        workflow = workflows[workflow_id]
        workflow.status = WorkflowStatus.ACTIVE
        workflow.updated_at = datetime.now()
        
        return {
            "success": True,
            "message": "워크플로우가 재개되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume workflow error: {e}")
        raise HTTPException(status_code=500, detail="워크플로우 재개 실패")
