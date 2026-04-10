import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable
import sqlite3
import json
import schedule
import threading
import time
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import os

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _notification_api_base() -> str:
    """알림 HTTP API 베이스 (advanced_scheduler → notification 등)."""
    explicit = os.environ.get("CORBU_NOTIFICATION_API_BASE", "").strip().rstrip("/")
    if explicit:
        return explicit
    port = os.environ.get("NOTIFICATION_SERVER_PORT", "8004")
    return f"http://localhost:{port}".rstrip("/")


class MessagePriority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

class MessageStatus(Enum):
    SCHEDULED = "scheduled"
    SENT = "sent"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class ScheduledMessage:
    id: str
    content: str
    chat_room: str
    recipient: str
    sender: str
    scheduled_time: datetime
    priority: MessagePriority
    status: MessageStatus
    message_type: str = "text"
    context: Dict = None
    retry_count: int = 0
    max_retries: int = 3
    created_at: datetime = None
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.context is None:
            self.context = {}

class AdvancedScheduler:
    """고급 메시지 스케줄링 시스템"""
    
    def __init__(self, db_path: str = "scheduler.db"):
        self.db_path = db_path
        self.scheduled_messages: Dict[str, ScheduledMessage] = {}
        self.running = False
        self.scheduler_thread = None
        self.message_handlers: Dict[str, Callable] = {}
        
        # 데이터베이스 초기화
        self._init_database()
        
        # 기존 스케줄된 메시지 로드
        self._load_scheduled_messages()
        
        # 기본 메시지 핸들러 등록
        self._register_default_handlers()

    def _init_database(self):
        """데이터베이스 초기화"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS scheduled_messages (
                        id TEXT PRIMARY KEY,
                        content TEXT NOT NULL,
                        chat_room TEXT NOT NULL,
                        recipient TEXT NOT NULL,
                        sender TEXT NOT NULL,
                        scheduled_time TEXT NOT NULL,
                        priority INTEGER NOT NULL,
                        status TEXT NOT NULL,
                        message_type TEXT DEFAULT 'text',
                        context TEXT,
                        retry_count INTEGER DEFAULT 0,
                        max_retries INTEGER DEFAULT 3,
                        created_at TEXT NOT NULL,
                        sent_at TEXT,
                        error_message TEXT
                    )
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS delivery_history (
                        id TEXT PRIMARY KEY,
                        message_id TEXT NOT NULL,
                        attempt_time TEXT NOT NULL,
                        success BOOLEAN NOT NULL,
                        error_message TEXT,
                        response_time_ms INTEGER,
                        FOREIGN KEY (message_id) REFERENCES scheduled_messages (id)
                    )
                """)
                
                conn.commit()
                logger.info("스케줄러 데이터베이스 초기화 완료")
                
        except Exception as e:
            logger.error(f"데이터베이스 초기화 오류: {e}")

    def _load_scheduled_messages(self):
        """기존 스케줄된 메시지 로드"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT * FROM scheduled_messages 
                    WHERE status = 'scheduled' AND scheduled_time > ?
                """, (datetime.now().isoformat(),))
                
                rows = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                
                for row in rows:
                    message_data = dict(zip(columns, row))
                    
                    # 데이터 타입 변환
                    message_data['scheduled_time'] = datetime.fromisoformat(message_data['scheduled_time'])
                    message_data['created_at'] = datetime.fromisoformat(message_data['created_at'])
                    if message_data['sent_at']:
                        message_data['sent_at'] = datetime.fromisoformat(message_data['sent_at'])
                    
                    message_data['priority'] = MessagePriority(message_data['priority'])
                    message_data['status'] = MessageStatus(message_data['status'])
                    
                    if message_data['context']:
                        message_data['context'] = json.loads(message_data['context'])
                    else:
                        message_data['context'] = {}
                    
                    scheduled_message = ScheduledMessage(**message_data)
                    self.scheduled_messages[scheduled_message.id] = scheduled_message
                
                logger.info(f"{len(self.scheduled_messages)}개의 스케줄된 메시지를 로드했습니다")
                
        except Exception as e:
            logger.error(f"스케줄된 메시지 로드 오류: {e}")

    def _register_default_handlers(self):
        """기본 메시지 핸들러 등록"""
        self.register_handler("text", self._send_text_message)
        self.register_handler("notification", self._send_notification)
        self.register_handler("reminder", self._send_reminder)

    def register_handler(self, message_type: str, handler: Callable):
        """메시지 타입별 핸들러 등록"""
        self.message_handlers[message_type] = handler
        logger.info(f"메시지 핸들러 등록: {message_type}")

    def schedule_message(self, content: str, chat_room: str, recipient: str, 
                        sender: str, scheduled_time: datetime, 
                        priority: MessagePriority = MessagePriority.NORMAL,
                        message_type: str = "text", context: Dict = None) -> str:
        """메시지 스케줄링"""
        try:
            message_id = str(uuid.uuid4())
            
            # 과거 시간 체크
            if scheduled_time <= datetime.now():
                raise ValueError("스케줄 시간은 현재 시간보다 미래여야 합니다")
            
            scheduled_message = ScheduledMessage(
                id=message_id,
                content=content,
                chat_room=chat_room,
                recipient=recipient,
                sender=sender,
                scheduled_time=scheduled_time,
                priority=priority,
                status=MessageStatus.SCHEDULED,
                message_type=message_type,
                context=context or {}
            )
            
            # 메모리에 저장
            self.scheduled_messages[message_id] = scheduled_message
            
            # 데이터베이스에 저장
            self._save_message_to_db(scheduled_message)
            
            logger.info(f"메시지 스케줄링 완료: {message_id} - {scheduled_time}")
            return message_id
            
        except Exception as e:
            logger.error(f"메시지 스케줄링 오류: {e}")
            raise

    def _save_message_to_db(self, message: ScheduledMessage):
        """메시지를 데이터베이스에 저장"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO scheduled_messages 
                    (id, content, chat_room, recipient, sender, scheduled_time, 
                     priority, status, message_type, context, retry_count, 
                     max_retries, created_at, sent_at, error_message)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    message.id, message.content, message.chat_room, message.recipient,
                    message.sender, message.scheduled_time.isoformat(), 
                    message.priority.value, message.status.value, message.message_type,
                    json.dumps(message.context), message.retry_count, message.max_retries,
                    message.created_at.isoformat(), 
                    message.sent_at.isoformat() if message.sent_at else None,
                    message.error_message
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"메시지 DB 저장 오류: {e}")

    def cancel_message(self, message_id: str) -> bool:
        """스케줄된 메시지 취소"""
        try:
            if message_id in self.scheduled_messages:
                message = self.scheduled_messages[message_id]
                
                if message.status == MessageStatus.SCHEDULED:
                    message.status = MessageStatus.CANCELLED
                    self._save_message_to_db(message)
                    
                    del self.scheduled_messages[message_id]
                    logger.info(f"메시지 취소 완료: {message_id}")
                    return True
                else:
                    logger.warning(f"이미 처리된 메시지는 취소할 수 없습니다: {message_id}")
                    return False
            else:
                logger.warning(f"메시지를 찾을 수 없습니다: {message_id}")
                return False
                
        except Exception as e:
            logger.error(f"메시지 취소 오류: {e}")
            return False

    def reschedule_message(self, message_id: str, new_time: datetime) -> bool:
        """메시지 재스케줄링"""
        try:
            if message_id in self.scheduled_messages:
                message = self.scheduled_messages[message_id]
                
                if message.status == MessageStatus.SCHEDULED:
                    if new_time <= datetime.now():
                        raise ValueError("새 스케줄 시간은 현재 시간보다 미래여야 합니다")
                    
                    message.scheduled_time = new_time
                    self._save_message_to_db(message)
                    
                    logger.info(f"메시지 재스케줄링 완료: {message_id} - {new_time}")
                    return True
                else:
                    logger.warning(f"이미 처리된 메시지는 재스케줄링할 수 없습니다: {message_id}")
                    return False
            else:
                logger.warning(f"메시지를 찾을 수 없습니다: {message_id}")
                return False
                
        except Exception as e:
            logger.error(f"메시지 재스케줄링 오류: {e}")
            return False

    def start_scheduler(self):
        """스케줄러 시작"""
        if not self.running:
            self.running = True
            self.scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
            self.scheduler_thread.start()
            logger.info("메시지 스케줄러 시작됨")

    def stop_scheduler(self):
        """스케줄러 중지"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("메시지 스케줄러 중지됨")

    def _scheduler_loop(self):
        """스케줄러 메인 루프"""
        while self.running:
            try:
                current_time = datetime.now()
                messages_to_send = []
                
                # 발송할 메시지 찾기
                for message_id, message in list(self.scheduled_messages.items()):
                    if (message.status == MessageStatus.SCHEDULED and 
                        message.scheduled_time <= current_time):
                        messages_to_send.append(message)
                
                # 우선순위별 정렬
                messages_to_send.sort(key=lambda x: x.priority.value, reverse=True)
                
                # 메시지 발송
                for message in messages_to_send:
                    self._send_message(message)
                
                # 1초 대기
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"스케줄러 루프 오류: {e}")
                time.sleep(5)

    def _send_message(self, message: ScheduledMessage):
        """메시지 발송"""
        try:
            start_time = time.time()
            
            # 메시지 타입별 핸들러 호출
            handler = self.message_handlers.get(message.message_type, self._send_text_message)
            success = handler(message)
            
            response_time = int((time.time() - start_time) * 1000)
            
            if success:
                message.status = MessageStatus.SENT
                message.sent_at = datetime.now()
                message.error_message = None
                
                # 메모리에서 제거
                if message.id in self.scheduled_messages:
                    del self.scheduled_messages[message.id]
                
                logger.info(f"메시지 발송 완료: {message.id}")
                
            else:
                # 재시도 로직
                message.retry_count += 1
                if message.retry_count >= message.max_retries:
                    message.status = MessageStatus.FAILED
                    logger.error(f"메시지 발송 실패 (최대 재시도 초과): {message.id}")
                else:
                    # 재시도 스케줄링 (지수 백오프)
                    retry_delay = min(300, 30 * (2 ** message.retry_count))  # 최대 5분
                    message.scheduled_time = datetime.now() + timedelta(seconds=retry_delay)
                    logger.warning(f"메시지 재시도 스케줄링: {message.id} - {retry_delay}초 후")
            
            # 데이터베이스 업데이트
            self._save_message_to_db(message)
            
            # 발송 기록 저장
            self._save_delivery_record(message.id, success, response_time, message.error_message)
            
        except Exception as e:
            logger.error(f"메시지 발송 오류: {e}")
            message.error_message = str(e)
            message.retry_count += 1
            self._save_message_to_db(message)

    def _save_delivery_record(self, message_id: str, success: bool, response_time: int, error_message: str = None):
        """발송 기록 저장"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO delivery_history 
                    (id, message_id, attempt_time, success, error_message, response_time_ms)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    str(uuid.uuid4()), message_id, datetime.now().isoformat(),
                    success, error_message, response_time
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"발송 기록 저장 오류: {e}")

    async def _send_text_message(self, message: ScheduledMessage) -> bool:
        """텍스트 메시지 발송 (기본 핸들러)"""
        try:
            # 실제 메시지 발송 로직 (WebSocket 또는 API 호출)
            # 여기서는 시뮬레이션
            logger.info(f"텍스트 메시지 발송: {message.chat_room} - {message.content}")
            
            # WebSocket 알림 시뮬레이션
            await self._send_websocket_notification({
                'type': 'scheduled_message_sent',
                'message_id': message.id,
                'chat_room': message.chat_room,
                'content': message.content,
                'sent_at': datetime.now().isoformat()
            })
            
            return True
            
        except Exception as e:
            logger.error(f"텍스트 메시지 발송 오류: {e}")
            message.error_message = str(e)
            return False

    async def _send_notification(self, message: ScheduledMessage) -> bool:
        """알림 메시지 발송"""
        try:
            logger.info(f"알림 메시지 발송: {message.chat_room} - {message.content}")
            
            # 알림 시스템으로 메시지 전송
            notification_data = {
                'title': message.context.get('title', '스케줄된 알림'),
                'content': message.content,
                'room_id': message.chat_room,
                'priority': message.priority.name.lower()
            }
            
            # HTTP 요청으로 알림 서버에 전송
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{_notification_api_base()}/api/notifications/room/"
                    + message.chat_room,
                    json=notification_data,
                ) as response:
                    if response.status == 200:
                        return True
                    else:
                        message.error_message = f"알림 서버 응답 오류: {response.status}"
                        return False
            
        except Exception as e:
            logger.error(f"알림 메시지 발송 오류: {e}")
            message.error_message = str(e)
            return False

    async def _send_reminder(self, message: ScheduledMessage) -> bool:
        """리마인더 메시지 발송"""
        try:
            logger.info(f"리마인더 발송: {message.chat_room} - {message.content}")
            
            # 리마인더 특화 로직
            reminder_data = {
                'type': 'reminder',
                'title': f"🔔 {message.context.get('title', '리마인더')}",
                'content': message.content,
                'room_id': message.chat_room,
                'action_required': message.context.get('action_required', False),
                'deadline': message.context.get('deadline')
            }
            
            await self._send_websocket_notification(reminder_data)
            return True
            
        except Exception as e:
            logger.error(f"리마인더 발송 오류: {e}")
            message.error_message = str(e)
            return False

    async def _send_websocket_notification(self, data: Dict):
        """WebSocket을 통한 실시간 알림"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                base = _notification_api_base()
                if "room_id" in data:
                    url = f"{base}/api/notifications/room/{data['room_id']}"
                else:
                    url = f"{base}/api/notifications/broadcast"
                
                async with session.post(url, json=data) as response:
                    if response.status != 200:
                        logger.warning(f"WebSocket 알림 전송 실패: {response.status}")
                        
        except Exception as e:
            logger.error(f"WebSocket 알림 오류: {e}")

    def get_scheduled_messages(self, chat_room: str = None, status: MessageStatus = None) -> List[Dict]:
        """스케줄된 메시지 조회"""
        try:
            messages = []
            
            for message in self.scheduled_messages.values():
                if chat_room and message.chat_room != chat_room:
                    continue
                if status and message.status != status:
                    continue
                
                messages.append({
                    'id': message.id,
                    'content': message.content,
                    'chat_room': message.chat_room,
                    'recipient': message.recipient,
                    'sender': message.sender,
                    'scheduled_time': message.scheduled_time.isoformat(),
                    'priority': message.priority.name,
                    'status': message.status.value,
                    'message_type': message.message_type,
                    'retry_count': message.retry_count,
                    'created_at': message.created_at.isoformat()
                })
            
            # 스케줄 시간순 정렬
            messages.sort(key=lambda x: x['scheduled_time'])
            return messages
            
        except Exception as e:
            logger.error(f"메시지 조회 오류: {e}")
            return []

    def get_delivery_statistics(self, days: int = 7) -> Dict:
        """발송 통계 조회"""
        try:
            start_date = datetime.now() - timedelta(days=days)
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 전체 발송 통계
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_attempts,
                        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
                        AVG(response_time_ms) as avg_response_time
                    FROM delivery_history 
                    WHERE attempt_time > ?
                """, (start_date.isoformat(),))
                
                stats = cursor.fetchone()
                
                # 시간대별 통계
                cursor.execute("""
                    SELECT 
                        strftime('%H', attempt_time) as hour,
                        COUNT(*) as count,
                        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful
                    FROM delivery_history 
                    WHERE attempt_time > ?
                    GROUP BY hour
                    ORDER BY hour
                """, (start_date.isoformat(),))
                
                hourly_stats = cursor.fetchall()
                
                return {
                    'total_attempts': stats[0] or 0,
                    'successful_deliveries': stats[1] or 0,
                    'success_rate': round((stats[1] or 0) / max(stats[0] or 1, 1) * 100, 2),
                    'avg_response_time_ms': round(stats[2] or 0, 2),
                    'hourly_distribution': [
                        {'hour': hour, 'attempts': count, 'success_rate': round(successful/count*100, 2)}
                        for hour, count, successful in hourly_stats
                    ],
                    'period_days': days
                }
                
        except Exception as e:
            logger.error(f"통계 조회 오류: {e}")
            return {}

# 전역 스케줄러 인스턴스
scheduler = AdvancedScheduler()

def start_scheduler():
    """스케줄러 시작"""
    scheduler.start_scheduler()

def stop_scheduler():
    """스케줄러 중지"""
    scheduler.stop_scheduler()

if __name__ == "__main__":
    # 테스트 코드
    scheduler.start_scheduler()
    
    try:
        # 테스트 메시지 스케줄링
        future_time = datetime.now() + timedelta(seconds=10)
        message_id = scheduler.schedule_message(
            content="테스트 스케줄 메시지입니다.",
            chat_room="demo_chat_room",
            recipient="all",
            sender="system",
            scheduled_time=future_time,
            priority=MessagePriority.NORMAL,
            message_type="notification",
            context={'title': '테스트 알림'}
        )
        
        print(f"메시지 스케줄됨: {message_id}")
        
        # 스케줄러 실행 (테스트)
        time.sleep(15)
        
    except KeyboardInterrupt:
        print("스케줄러 중지 중...")
    finally:
        scheduler.stop_scheduler() 