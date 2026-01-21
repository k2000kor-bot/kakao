# flake8: noqa
"""
시스템 헬스 체크 모듈
모든 시스템 구성 요소의 상태를 확인
"""

import logging
import os
from datetime import datetime
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class SystemHealthChecker:
    """시스템 헬스 체크 클래스"""

    def __init__(self):
        self.last_check_time: Optional[datetime] = None
        self.cached_status: Dict[str, Any] = {}

    def check_all_modules(self) -> Dict[str, Any]:
        """모든 모듈 상태 확인"""
        self.last_check_time = datetime.now()

        status = {
            "overall": "healthy",
            "timestamp": self.last_check_time.isoformat(),
            "modules": {}
        }

        # 각 모듈 체크
        modules_to_check = [
            ("database", self._check_database),
            ("ai_engine", self._check_ai_engine),
            ("llm_service", self._check_llm_service),
            ("performance_api", self._check_performance_api),
            ("security_api", self._check_security_api),
        ]

        unhealthy_count = 0
        for module_name, check_func in modules_to_check:
            try:
                module_status = check_func()
                status["modules"][module_name] = module_status
                if module_status.get("status") != "healthy":
                    unhealthy_count += 1
            except Exception as e:
                status["modules"][module_name] = {
                    "status": "error",
                    "error": str(e)
                }
                unhealthy_count += 1

        # 전체 상태 결정
        if unhealthy_count == 0:
            status["overall"] = "healthy"
        elif unhealthy_count < len(modules_to_check) / 2:
            status["overall"] = "degraded"
        else:
            status["overall"] = "unhealthy"

        self.cached_status = status
        return status

    def _check_database(self) -> Dict[str, Any]:
        """데이터베이스 상태 확인"""
        db_files = [
            "ai_engine.db",
            "performance_monitor.db",
            "security_monitor.db",
            "system_monitor.db",
            "user_experience.db"
        ]

        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        existing_dbs = []

        for db_file in db_files:
            db_path = os.path.join(backend_dir, db_file)
            if os.path.exists(db_path):
                existing_dbs.append(db_file)

        return {
            "status": "healthy" if existing_dbs else "degraded",
            "available_databases": existing_dbs,
            "total_databases": len(existing_dbs)
        }

    def _check_ai_engine(self) -> Dict[str, Any]:
        """AI 엔진 상태 확인"""
        try:
            from api.ai_engine_api import router as _ai_router  # noqa: F401
            return {
                "status": "healthy",
                "engine_available": True
            }
        except ImportError:
            return {
                "status": "degraded",
                "engine_available": False,
                "note": "AI Engine not loaded"
            }

    def _check_llm_service(self) -> Dict[str, Any]:
        """LLM 서비스 상태 확인"""
        try:
            from llm_service import LLMService as _LLM  # noqa: F401
            return {
                "status": "healthy",
                "llm_available": True
            }
        except ImportError:
            return {
                "status": "degraded",
                "llm_available": False,
                "note": "LLM Service not available"
            }

    def _check_performance_api(self) -> Dict[str, Any]:
        """성능 API 상태 확인"""
        try:
            from api.performance_api import router as _perf_router  # noqa: F401
            return {
                "status": "healthy",
                "api_available": True
            }
        except ImportError:
            return {
                "status": "degraded",
                "api_available": False
            }

    def _check_security_api(self) -> Dict[str, Any]:
        """보안 API 상태 확인"""
        try:
            from api.security_api import router as _sec_router  # noqa: F401
            return {
                "status": "healthy",
                "api_available": True
            }
        except ImportError:
            return {
                "status": "degraded",
                "api_available": False
            }

    def get_quick_status(self) -> str:
        """빠른 상태 확인 (healthy/degraded/unhealthy)"""
        if self.cached_status:
            return self.cached_status.get("overall", "unknown")
        return "unknown"


# 싱글톤 인스턴스
system_health_checker = SystemHealthChecker()
