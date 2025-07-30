import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
import logging
import sqlite3
from pathlib import Path
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import websockets
from fastapi import WebSocket
import uuid
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class NotificationChannel:
    """알림 채널"""
    channel_id: str
    user_id: str
    channel_type: str  # push, email, sms, websocket
    endpoint: str  # 푸시 토큰, 이메일 주소, 전화번호, 웹소켓 ID
    is_active: bool
    preferences: Dict[str, Any]
    created_at: datetime


@dataclass
class Notification:
    """알림 메시지"""
    notification_id: str
    user_id: str
    title: str
    message: str
    notification_type: str  # property_alert, price_change, market_update, ai_analysis
    data: Dict[str, Any]
    channels: List[str]  # 발송할 채널들
    priority: str  # high, medium, low
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    status: str  # pending, sent, failed


@dataclass
class MobileAppUser:
    """모바일 앱 사용자"""
    user_id: str
    device_id: str
    device_type: str  # ios, android
    app_version: str
    push_token: str
    last_active: datetime
    notification_settings: Dict[str, bool]


class MobileNotificationService:
    """모바일 알림 서비스"""
    
    def __init__(self, db_path: str = "notifications.db"):
        self.db_path = db_path
        self.active_websockets: Dict[str, WebSocket] = {}
        self.notification_queue: List[Notification] = []
        
        # 외부 서비스 설정
        self.push_services = self._initialize_push_services()
        self.email_config = self._initialize_email_config()
        self.sms_config = self._initialize_sms_config()
        
        # 데이터베이스 초기화
        self.init_database()
        
        # 템플릿 시스템
        self.templates = self._initialize_templates()
        
    def _initialize_push_services(self) -> Dict[str, Dict[str, Any]]:
        """푸시 서비스 설정"""
        return {
            "fcm": {
                "server_key": "YOUR_FCM_SERVER_KEY",
                "url": "https://fcm.googleapis.com/fcm/send",
                "enabled": True
            },
            "apns": {
                "key_file": "path/to/apns.p8",
                "key_id": "YOUR_KEY_ID",
                "team_id": "YOUR_TEAM_ID",
                "bundle_id": "com.yourapp.realestateai",
                "enabled": True
            }
        }
        
    def _initialize_email_config(self) -> Dict[str, str]:
        """이메일 설정"""
        return {
            "smtp_server": "smtp.gmail.com",
            "smtp_port": "587",
            "username": "your_email@gmail.com",
            "password": "your_app_password",
            "from_name": "부동산 AI 플랫폼"
        }
        
    def _initialize_sms_config(self) -> Dict[str, str]:
        """SMS 설정"""
        return {
            "api_key": "YOUR_SMS_API_KEY",
            "sender": "1588-1234",
            "url": "https://api.sms.provider.com/send"
        }
        
    def _initialize_templates(self) -> Dict[str, Dict[str, str]]:
        """알림 템플릿"""
        return {
            "property_alert": {
                "title": "🏠 새로운 매물 알림",
                "email_subject": "[부동산AI] 관심 조건에 맞는 새 매물이 등록되었습니다",
                "push_body": "{count}건의 새로운 매물이 등록되었습니다",
                "email_template": """
                <h2>🏠 새로운 매물 알림</h2>
                <p>안녕하세요, <strong>{user_name}</strong>님!</p>
                <p>설정하신 조건에 맞는 새로운 매물이 등록되었습니다.</p>
                
                <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
                    <h3>{property_title}</h3>
                    <p><strong>주소:</strong> {address}</p>
                    <p><strong>가격:</strong> {price}억원</p>
                    <p><strong>면적:</strong> {area}평</p>
                    <p><strong>AI 분석 점수:</strong> {ai_score}/10</p>
                    <p><strong>투자 등급:</strong> {grade}</p>
                </div>
                
                <p><a href="{property_url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">매물 상세보기</a></p>
                """
            },
            "price_change": {
                "title": "💰 가격 변동 알림",
                "email_subject": "[부동산AI] 관심 매물의 가격이 변동되었습니다",
                "push_body": "{property_title}의 가격이 {change_type}했습니다",
                "email_template": """
                <h2>💰 가격 변동 알림</h2>
                <p>관심 매물의 가격이 변동되었습니다.</p>
                
                <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
                    <h3>{property_title}</h3>
                    <p><strong>이전 가격:</strong> {old_price}억원</p>
                    <p><strong>현재 가격:</strong> {new_price}억원</p>
                    <p><strong>변동:</strong> <span style="color: {change_color};">{price_change}억원 ({change_rate}%)</span></p>
                </div>
                """
            },
            "market_update": {
                "title": "📊 시장 동향 업데이트",
                "email_subject": "[부동산AI] 이번 주 시장 동향 리포트",
                "push_body": "이번 주 시장 심리 지수: {sentiment_score}점",
                "email_template": """
                <h2>📊 주간 시장 동향 리포트</h2>
                
                <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h3>🎯 시장 심리 분석</h3>
                    <p><strong>심리 점수:</strong> {sentiment_score}/100</p>
                    <p><strong>트렌드:</strong> {trend_direction}</p>
                    <p><strong>투자 환경:</strong> {market_phase}</p>
                </div>
                
                <div style="background: #e7f3ff; padding: 20px; margin: 20px 0; border-radius: 5px;">
                    <h3>🏗️ 정비사업 현황</h3>
                    <p><strong>진행 중인 사업:</strong> {ongoing_projects}%</p>
                    <p><strong>신규 승인:</strong> {new_approvals}건</p>
                </div>
                """
            },
            "ai_analysis": {
                "title": "🤖 AI 분석 완료",
                "email_subject": "[부동산AI] 매물 AI 분석 결과",
                "push_body": "{property_title} AI 분석 완료 - {grade}등급",
                "email_template": """
                <h2>🤖 AI 분석 결과</h2>
                
                <div style="text-align: center; background: #f0f8ff; padding: 30px; margin: 20px 0; border-radius: 10px;">
                    <h1 style="color: #007bff; margin: 0;">{grade}</h1>
                    <p style="font-size: 18px; margin: 10px 0;"><strong>{ai_score}/10점</strong></p>
                    <p>{investment_recommendation}</p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px;">
                    <h3>📈 투자 분석</h3>
                    <p><strong>예상 수익률:</strong> {expected_return}%</p>
                    <p><strong>위험도:</strong> {risk_level}</p>
                    <p><strong>시장 타이밍:</strong> {market_timing}</p>
                </div>
                """
            }
        }
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 알림 채널 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_channels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                channel_id TEXT UNIQUE,
                user_id TEXT,
                channel_type TEXT,
                endpoint TEXT,
                is_active BOOLEAN,
                preferences TEXT,
                created_at TEXT
            )
        ''')
        
        # 알림 이력 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                notification_id TEXT UNIQUE,
                user_id TEXT,
                title TEXT,
                message TEXT,
                notification_type TEXT,
                data TEXT,
                channels TEXT,
                priority TEXT,
                scheduled_at TEXT,
                sent_at TEXT,
                status TEXT,
                created_at TEXT
            )
        ''')
        
        # 모바일 앱 사용자 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mobile_app_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE,
                device_id TEXT,
                device_type TEXT,
                app_version TEXT,
                push_token TEXT,
                last_active TEXT,
                notification_settings TEXT,
                created_at TEXT,
                updated_at TEXT
            )
        ''')
        
        # 알림 통계 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                notification_type TEXT,
                channel_type TEXT,
                sent_count INTEGER,
                success_count INTEGER,
                failure_count INTEGER,
                open_count INTEGER,
                click_count INTEGER
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def register_mobile_user(self, user_data: Dict[str, Any]) -> str:
        """모바일 앱 사용자 등록"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        current_time = datetime.now().isoformat()
        
        # 기존 사용자 확인
        cursor.execute("SELECT user_id FROM mobile_app_users WHERE user_id = ?", (user_data["user_id"],))
        existing = cursor.fetchone()
        
        if existing:
            # 업데이트
            cursor.execute('''
                UPDATE mobile_app_users SET
                device_id = ?, device_type = ?, app_version = ?,
                push_token = ?, last_active = ?, notification_settings = ?,
                updated_at = ?
                WHERE user_id = ?
            ''', (
                user_data["device_id"], user_data["device_type"], user_data["app_version"],
                user_data["push_token"], current_time,
                json.dumps(user_data.get("notification_settings", {})),
                current_time, user_data["user_id"]
            ))
        else:
            # 신규 등록
            cursor.execute('''
                INSERT INTO mobile_app_users 
                (user_id, device_id, device_type, app_version, push_token,
                 last_active, notification_settings, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data["user_id"], user_data["device_id"], user_data["device_type"],
                user_data["app_version"], user_data["push_token"], current_time,
                json.dumps(user_data.get("notification_settings", {})),
                current_time, current_time
            ))
            
        conn.commit()
        conn.close()
        
        logger.info(f"모바일 사용자 등록/업데이트: {user_data['user_id']}")
        return user_data["user_id"]
        
    def add_notification_channel(self, user_id: str, channel_type: str, 
                               endpoint: str, preferences: Dict[str, Any] = None) -> str:
        """알림 채널 추가"""
        channel_id = f"{channel_type}_{user_id}_{uuid.uuid4().hex[:8]}"
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO notification_channels 
            (channel_id, user_id, channel_type, endpoint, is_active, preferences, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            channel_id, user_id, channel_type, endpoint, True,
            json.dumps(preferences or {}), datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f"알림 채널 추가: {channel_id} ({channel_type})")
        return channel_id
        
    async def send_notification(self, notification: Notification):
        """알림 발송"""
        # 알림 이력에 저장
        self._save_notification_to_history(notification)
        
        # 사용자의 활성 채널 조회
        channels = self._get_user_channels(notification.user_id)
        
        success_count = 0
        total_count = 0
        
        for channel in channels:
            if not channel["is_active"]:
                continue
                
            total_count += 1
            
            try:
                if channel["channel_type"] == "push":
                    await self._send_push_notification(notification, channel)
                elif channel["channel_type"] == "email":
                    await self._send_email_notification(notification, channel)
                elif channel["channel_type"] == "sms":
                    await self._send_sms_notification(notification, channel)
                elif channel["channel_type"] == "websocket":
                    await self._send_websocket_notification(notification, channel)
                    
                success_count += 1
                
            except Exception as e:
                logger.error(f"알림 발송 실패 ({channel['channel_type']}): {e}")
                
        # 발송 완료 상태 업데이트
        status = "sent" if success_count > 0 else "failed"
        self._update_notification_status(notification.notification_id, status)
        
        # 통계 업데이트
        self._update_notification_stats(notification, success_count, total_count - success_count)
        
        logger.info(f"알림 발송 완료: {notification.notification_id} ({success_count}/{total_count})")
        
    def _save_notification_to_history(self, notification: Notification):
        """알림 이력 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO notification_history 
            (notification_id, user_id, title, message, notification_type,
             data, channels, priority, scheduled_at, sent_at, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            notification.notification_id, notification.user_id, notification.title,
            notification.message, notification.notification_type,
            json.dumps(notification.data), json.dumps(notification.channels),
            notification.priority, 
            notification.scheduled_at.isoformat() if notification.scheduled_at else None,
            notification.sent_at.isoformat() if notification.sent_at else None,
            notification.status, datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
    def _get_user_channels(self, user_id: str) -> List[Dict[str, Any]]:
        """사용자 알림 채널 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT channel_id, channel_type, endpoint, preferences
            FROM notification_channels 
            WHERE user_id = ? AND is_active = 1
        ''', (user_id,))
        
        channels = []
        for row in cursor.fetchall():
            channels.append({
                "channel_id": row[0],
                "channel_type": row[1],
                "endpoint": row[2],
                "preferences": json.loads(row[3]) if row[3] else {},
                "is_active": True
            })
            
        conn.close()
        return channels
        
    async def _send_push_notification(self, notification: Notification, channel: Dict[str, Any]):
        """푸시 알림 발송"""
        push_token = channel["endpoint"]
        
        # FCM 푸시 발송
        if self.push_services["fcm"]["enabled"]:
            await self._send_fcm_push(notification, push_token)
            
    async def _send_fcm_push(self, notification: Notification, token: str):
        """FCM 푸시 알림 발송"""
        fcm_config = self.push_services["fcm"]
        
        payload = {
            "to": token,
            "notification": {
                "title": notification.title,
                "body": notification.message,
                "icon": "ic_notification",
                "sound": "default"
            },
            "data": {
                "notification_id": notification.notification_id,
                "type": notification.notification_type,
                "data": json.dumps(notification.data)
            }
        }
        
        headers = {
            "Authorization": f"key={fcm_config['server_key']}",
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(fcm_config["url"], 
                                  json=payload, headers=headers) as response:
                if response.status == 200:
                    logger.info(f"FCM 푸시 발송 성공: {notification.notification_id}")
                else:
                    raise Exception(f"FCM 오류: {response.status}")
                    
    async def _send_email_notification(self, notification: Notification, channel: Dict[str, Any]):
        """이메일 알림 발송"""
        email_address = channel["endpoint"]
        template = self.templates.get(notification.notification_type, {})
        
        # 이메일 내용 생성
        subject = template.get("email_subject", notification.title)
        html_body = template.get("email_template", notification.message)
        
        # 템플릿 변수 치환
        if notification.data:
            subject = subject.format(**notification.data)
            html_body = html_body.format(**notification.data)
            
        # 이메일 발송
        await self._send_email(email_address, subject, html_body)
        
    async def _send_email(self, to_email: str, subject: str, html_body: str):
        """이메일 발송"""
        config = self.email_config
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{config['from_name']} <{config['username']}>"
        msg['To'] = to_email
        
        html_part = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(html_part)
        
        # SMTP 발송 (실제 구현시 비동기 라이브러리 사용)
        try:
            server = smtplib.SMTP(config["smtp_server"], int(config["smtp_port"]))
            server.starttls()
            server.login(config["username"], config["password"])
            server.send_message(msg)
            server.quit()
            
            logger.info(f"이메일 발송 성공: {to_email}")
            
        except Exception as e:
            logger.error(f"이메일 발송 실패: {e}")
            raise
            
    async def _send_sms_notification(self, notification: Notification, channel: Dict[str, Any]):
        """SMS 알림 발송"""
        phone_number = channel["endpoint"]
        message = f"{notification.title}\n{notification.message}"
        
        # SMS API 호출
        sms_config = self.sms_config
        
        payload = {
            "to": phone_number,
            "from": sms_config["sender"],
            "text": message[:90]  # SMS 길이 제한
        }
        
        headers = {
            "Authorization": f"Bearer {sms_config['api_key']}",
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(sms_config["url"], 
                                  json=payload, headers=headers) as response:
                if response.status == 200:
                    logger.info(f"SMS 발송 성공: {phone_number}")
                else:
                    raise Exception(f"SMS 오류: {response.status}")
                    
    async def _send_websocket_notification(self, notification: Notification, channel: Dict[str, Any]):
        """웹소켓 실시간 알림 발송"""
        websocket_id = channel["endpoint"]
        
        if websocket_id in self.active_websockets:
            websocket = self.active_websockets[websocket_id]
            
            message = {
                "type": "notification",
                "notification_id": notification.notification_id,
                "title": notification.title,
                "message": notification.message,
                "notification_type": notification.notification_type,
                "data": notification.data,
                "timestamp": datetime.now().isoformat()
            }
            
            try:
                await websocket.send_text(json.dumps(message))
                logger.info(f"웹소켓 알림 발송: {websocket_id}")
            except Exception as e:
                logger.error(f"웹소켓 발송 실패: {e}")
                # 비활성 웹소켓 제거
                del self.active_websockets[websocket_id]
                
    def _update_notification_status(self, notification_id: str, status: str):
        """알림 상태 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE notification_history 
            SET status = ?, sent_at = ?
            WHERE notification_id = ?
        ''', (status, datetime.now().isoformat(), notification_id))
        
        conn.commit()
        conn.close()
        
    def _update_notification_stats(self, notification: Notification, 
                                 success_count: int, failure_count: int):
        """알림 통계 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        today = datetime.now().date().isoformat()
        
        for channel_type in ["push", "email", "sms", "websocket"]:
            cursor.execute('''
                INSERT OR REPLACE INTO notification_stats 
                (date, notification_type, channel_type, sent_count, success_count, failure_count, open_count, click_count)
                VALUES (?, ?, ?, 
                        COALESCE((SELECT sent_count FROM notification_stats WHERE date = ? AND notification_type = ? AND channel_type = ?), 0) + 1,
                        COALESCE((SELECT success_count FROM notification_stats WHERE date = ? AND notification_type = ? AND channel_type = ?), 0) + ?,
                        COALESCE((SELECT failure_count FROM notification_stats WHERE date = ? AND notification_type = ? AND channel_type = ?), 0) + ?,
                        COALESCE((SELECT open_count FROM notification_stats WHERE date = ? AND notification_type = ? AND channel_type = ?), 0),
                        COALESCE((SELECT click_count FROM notification_stats WHERE date = ? AND notification_type = ? AND channel_type = ?), 0))
            ''', (
                today, notification.notification_type, channel_type,
                today, notification.notification_type, channel_type,
                today, notification.notification_type, channel_type, success_count if channel_type == "push" else 0,
                today, notification.notification_type, channel_type, failure_count if channel_type == "push" else 0,
                today, notification.notification_type, channel_type,
                today, notification.notification_type, channel_type
            ))
            
        conn.commit()
        conn.close()
        
    async def connect_websocket(self, websocket: WebSocket, user_id: str) -> str:
        """웹소켓 연결"""
        websocket_id = f"ws_{user_id}_{uuid.uuid4().hex[:8]}"
        self.active_websockets[websocket_id] = websocket
        
        # 웹소켓 채널 등록
        self.add_notification_channel(user_id, "websocket", websocket_id)
        
        logger.info(f"웹소켓 연결: {websocket_id}")
        return websocket_id
        
    def disconnect_websocket(self, websocket_id: str):
        """웹소켓 연결 해제"""
        if websocket_id in self.active_websockets:
            del self.active_websockets[websocket_id]
            logger.info(f"웹소켓 연결 해제: {websocket_id}")
            
    def create_property_alert_notification(self, user_id: str, 
                                         properties: List[Dict[str, Any]]) -> Notification:
        """매물 알림 생성"""
        notification_id = f"prop_alert_{uuid.uuid4().hex}"
        
        property_data = properties[0] if properties else {}
        
        notification = Notification(
            notification_id=notification_id,
            user_id=user_id,
            title="🏠 새로운 매물 알림",
            message=f"{len(properties)}건의 새로운 매물이 등록되었습니다",
            notification_type="property_alert",
            data={
                "user_name": "사용자",  # 실제로는 사용자 정보에서 가져옴
                "count": len(properties),
                "property_title": property_data.get("title", ""),
                "address": property_data.get("address", ""),
                "price": property_data.get("price", 0),
                "area": property_data.get("area", 0),
                "ai_score": property_data.get("ai_score", 0),
                "grade": property_data.get("grade", ""),
                "property_url": property_data.get("url", ""),
                "properties": properties
            },
            channels=["push", "email"],
            priority="high",
            scheduled_at=None,
            sent_at=None,
            status="pending"
        )
        
        return notification
        
    def create_market_update_notification(self, user_id: str, 
                                        market_data: Dict[str, Any]) -> Notification:
        """시장 업데이트 알림 생성"""
        notification_id = f"market_update_{uuid.uuid4().hex}"
        
        notification = Notification(
            notification_id=notification_id,
            user_id=user_id,
            title="📊 시장 동향 업데이트",
            message=f"이번 주 시장 심리 지수: {market_data.get('sentiment_score', 0)}점",
            notification_type="market_update",
            data=market_data,
            channels=["push", "email"],
            priority="medium",
            scheduled_at=None,
            sent_at=None,
            status="pending"
        )
        
        return notification
        
    async def send_bulk_notifications(self, notifications: List[Notification]):
        """대량 알림 발송"""
        logger.info(f"대량 알림 발송 시작: {len(notifications)}건")
        
        # 병렬 처리로 성능 향상
        tasks = []
        for notification in notifications:
            task = asyncio.create_task(self.send_notification(notification))
            tasks.append(task)
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        success_count = sum(1 for result in results if not isinstance(result, Exception))
        
        logger.info(f"대량 알림 발송 완료: {success_count}/{len(notifications)}건 성공")
        
    def get_notification_stats(self, days: int = 7) -> Dict[str, Any]:
        """알림 통계 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).date().isoformat()
        
        # 전체 통계
        cursor.execute('''
            SELECT 
                SUM(sent_count) as total_sent,
                SUM(success_count) as total_success,
                SUM(failure_count) as total_failure,
                SUM(open_count) as total_open,
                SUM(click_count) as total_click
            FROM notification_stats 
            WHERE date >= ?
        ''', (start_date,))
        
        total_stats = cursor.fetchone()
        
        # 채널별 통계
        cursor.execute('''
            SELECT 
                channel_type,
                SUM(sent_count) as sent,
                SUM(success_count) as success,
                SUM(failure_count) as failure
            FROM notification_stats 
            WHERE date >= ?
            GROUP BY channel_type
        ''', (start_date,))
        
        channel_stats = {}
        for row in cursor.fetchall():
            channel_stats[row[0]] = {
                "sent": row[1],
                "success": row[2],
                "failure": row[3],
                "success_rate": (row[2] / row[1] * 100) if row[1] > 0 else 0
            }
            
        # 알림 유형별 통계
        cursor.execute('''
            SELECT 
                notification_type,
                SUM(sent_count) as sent,
                SUM(success_count) as success
            FROM notification_stats 
            WHERE date >= ?
            GROUP BY notification_type
        ''', (start_date,))
        
        type_stats = {}
        for row in cursor.fetchall():
            type_stats[row[0]] = {
                "sent": row[1],
                "success": row[2]
            }
            
        conn.close()
        
        return {
            "period": f"최근 {days}일",
            "total": {
                "sent": total_stats[0] or 0,
                "success": total_stats[1] or 0,
                "failure": total_stats[2] or 0,
                "open": total_stats[3] or 0,
                "click": total_stats[4] or 0,
                "success_rate": (total_stats[1] / total_stats[0] * 100) if total_stats[0] else 0
            },
            "by_channel": channel_stats,
            "by_type": type_stats,
            "generated_at": datetime.now().isoformat()
        }


# 사용 예시
if __name__ == "__main__":
    async def main():
        # 알림 서비스 초기화
        notification_service = MobileNotificationService()
        
        # 모바일 사용자 등록
        user_data = {
            "user_id": "user_001",
            "device_id": "device_123",
            "device_type": "android",
            "app_version": "1.0.0",
            "push_token": "fcm_token_123",
            "notification_settings": {
                "property_alerts": True,
                "market_updates": True,
                "price_changes": True
            }
        }
        
        notification_service.register_mobile_user(user_data)
        
        # 이메일 채널 추가
        notification_service.add_notification_channel(
            "user_001", "email", "user@example.com"
        )
        
        # 매물 알림 생성 및 발송
        properties = [
            {
                "title": "강남구 압구정동 아파트",
                "address": "서울시 강남구 압구정동",
                "price": 15.5,
                "area": 84,
                "ai_score": 8.5,
                "grade": "A급",
                "url": "https://example.com/property/123"
            }
        ]
        
        property_notification = notification_service.create_property_alert_notification(
            "user_001", properties
        )
        
        await notification_service.send_notification(property_notification)
        
        # 시장 업데이트 알림
        market_data = {
            "sentiment_score": 75.2,
            "trend_direction": "상승",
            "market_phase": "회복기",
            "ongoing_projects": 68.6,
            "new_approvals": 15
        }
        
        market_notification = notification_service.create_market_update_notification(
            "user_001", market_data
        )
        
        await notification_service.send_notification(market_notification)
        
        # 알림 통계 조회
        stats = notification_service.get_notification_stats(7)
        print("=== 알림 통계 ===")
        print(f"총 발송: {stats['total']['sent']}건")
        print(f"성공률: {stats['total']['success_rate']:.1f}%")
        print(f"채널별 통계: {stats['by_channel']}")
        
    asyncio.run(main()) 