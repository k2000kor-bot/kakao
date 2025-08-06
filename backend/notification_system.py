#!/usr/bin/env python3
"""
실시간 알림 시스템
- 파일 업로드 완료 알림
- AI 분석 완료 알림
- 시스템 상태 알림
- 사용자 활동 알림
"""

import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class NotificationType(Enum):
    """알림 타입"""
    FILE_UPLOAD = "file_upload"
    AI_ANALYSIS = "ai_analysis"
    SYSTEM_STATUS = "system_status"
    USER_ACTIVITY = "user_activity"
    ERROR = "error"
    SUCCESS = "success"
    WARNING = "warning"
    INFO = "info"

class NotificationPriority(Enum):
    """알림 우선순위"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class Notification:
    """알림 클래스"""
    def __init__(
        self,
        notification_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        data: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None
    ):
        self.notification_id = notification_id
        self.notification_type = notification_type
        self.title = title
        self.message = message
        self.priority = priority
        self.data = data or {}
        self.user_id = user_id
        self.project_id = project_id
        self.timestamp = datetime.now().isoformat()
        self.read = False
        self.dismissed = False

    def to_dict(self) -> Dict[str, Any]:
        """알림을 딕셔너리로 변환"""
        return {
            "notification_id": self.notification_id,
            "type": self.notification_type.value,
            "title": self.title,
            "message": self.message,
            "priority": self.priority.value,
            "data": self.data,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "timestamp": self.timestamp,
            "read": self.read,
            "dismissed": self.dismissed
        }

    def mark_as_read(self):
        """알림을 읽음으로 표시"""
        self.read = True

    def dismiss(self):
        """알림을 해제"""
        self.dismissed = True

class NotificationManager:
    """알림 관리자"""
    def __init__(self):
        self.notifications: Dict[str, Notification] = {}
        self.subscribers: List[Dict[str, Any]] = []
        self.notification_counter = 0

    def generate_notification_id(self) -> str:
        """알림 ID 생성"""
        self.notification_counter += 1
        return f"notif_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{self.notification_counter}"

    def create_notification(
        self,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        data: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None
    ) -> Notification:
        """알림 생성"""
        notification_id = self.generate_notification_id()
        notification = Notification(
            notification_id=notification_id,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            data=data,
            user_id=user_id,
            project_id=project_id
        )
        
        self.notifications[notification_id] = notification
        logger.info(f"알림 생성: {title} - {message}")
        
        return notification

    def get_notifications(
        self,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """알림 조회"""
        filtered_notifications = []
        
        for notification in self.notifications.values():
            # 사용자 필터
            if user_id and notification.user_id and notification.user_id != user_id:
                continue
            
            # 프로젝트 필터
            if project_id and notification.project_id and notification.project_id != project_id:
                continue
            
            # 읽지 않은 알림만 필터
            if unread_only and notification.read:
                continue
            
            # 해제된 알림 제외
            if notification.dismissed:
                continue
            
            filtered_notifications.append(notification)
        
        # 최신순으로 정렬
        filtered_notifications.sort(key=lambda x: x.timestamp, reverse=True)
        
        return filtered_notifications[:limit]

    def mark_as_read(self, notification_id: str) -> bool:
        """알림을 읽음으로 표시"""
        if notification_id in self.notifications:
            self.notifications[notification_id].mark_as_read()
            return True
        return False

    def dismiss_notification(self, notification_id: str) -> bool:
        """알림 해제"""
        if notification_id in self.notifications:
            self.notifications[notification_id].dismiss()
            return True
        return False

    def get_unread_count(self, user_id: Optional[str] = None) -> int:
        """읽지 않은 알림 개수"""
        unread_notifications = self.get_notifications(
            user_id=user_id,
            unread_only=True
        )
        return len(unread_notifications)

    def clear_old_notifications(self, days: int = 30):
        """오래된 알림 정리"""
        cutoff_date = datetime.now().timestamp() - (days * 24 * 60 * 60)
        to_remove = []
        
        for notification_id, notification in self.notifications.items():
            notification_timestamp = datetime.fromisoformat(notification.timestamp).timestamp()
            if notification_timestamp < cutoff_date:
                to_remove.append(notification_id)
        
        for notification_id in to_remove:
            del self.notifications[notification_id]
        
        logger.info(f"{len(to_remove)}개의 오래된 알림을 정리했습니다.")

    # 특정 알림 타입 생성 메서드들
    def notify_file_upload_complete(
        self,
        file_name: str,
        file_size: int,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None
    ):
        """파일 업로드 완료 알림"""
        title = "파일 업로드 완료"
        message = f"파일 '{file_name}' ({file_size} bytes) 업로드가 완료되었습니다."
        
        return self.create_notification(
            notification_type=NotificationType.FILE_UPLOAD,
            title=title,
            message=message,
            priority=NotificationPriority.NORMAL,
            data={
                "file_name": file_name,
                "file_size": file_size,
                "action": "upload_complete"
            },
            user_id=user_id,
            project_id=project_id
        )

    def notify_ai_analysis_complete(
        self,
        analysis_type: str,
        result_summary: str,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None
    ):
        """AI 분석 완료 알림"""
        title = "AI 분석 완료"
        message = f"{analysis_type} 분석이 완료되었습니다: {result_summary}"
        
        return self.create_notification(
            notification_type=NotificationType.AI_ANALYSIS,
            title=title,
            message=message,
            priority=NotificationPriority.HIGH,
            data={
                "analysis_type": analysis_type,
                "result_summary": result_summary,
                "action": "analysis_complete"
            },
            user_id=user_id,
            project_id=project_id
        )

    def notify_system_status(
        self,
        status: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.NORMAL
    ):
        """시스템 상태 알림"""
        title = f"시스템 상태: {status}"
        
        return self.create_notification(
            notification_type=NotificationType.SYSTEM_STATUS,
            title=title,
            message=message,
            priority=priority,
            data={
                "status": status,
                "action": "system_status"
            }
        )

    def notify_user_activity(
        self,
        activity_type: str,
        description: str,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None
    ):
        """사용자 활동 알림"""
        title = f"사용자 활동: {activity_type}"
        
        return self.create_notification(
            notification_type=NotificationType.USER_ACTIVITY,
            title=title,
            message=description,
            priority=NotificationPriority.LOW,
            data={
                "activity_type": activity_type,
                "action": "user_activity"
            },
            user_id=user_id,
            project_id=project_id
        )

    def notify_error(
        self,
        error_type: str,
        error_message: str,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None
    ):
        """오류 알림"""
        title = f"오류 발생: {error_type}"
        
        return self.create_notification(
            notification_type=NotificationType.ERROR,
            title=title,
            message=error_message,
            priority=NotificationPriority.URGENT,
            data={
                "error_type": error_type,
                "action": "error"
            },
            user_id=user_id,
            project_id=project_id
        )

    def get_notification_statistics(self) -> Dict[str, Any]:
        """알림 통계"""
        total_notifications = len(self.notifications)
        unread_count = self.get_unread_count()
        
        type_counts = {}
        priority_counts = {}
        
        for notification in self.notifications.values():
            # 타입별 카운트
            notification_type = notification.notification_type.value
            type_counts[notification_type] = type_counts.get(notification_type, 0) + 1
            
            # 우선순위별 카운트
            priority = notification.priority.value
            priority_counts[priority] = priority_counts.get(priority, 0) + 1
        
        return {
            "total_notifications": total_notifications,
            "unread_count": unread_count,
            "type_distribution": type_counts,
            "priority_distribution": priority_counts,
            "generated_at": datetime.now().isoformat()
        }

# 싱글톤 인스턴스
notification_manager = NotificationManager() 