#!/usr/bin/env python3
"""
카카오톡 사용자 및 대화방 식별 시스템
KakaoTalk User and Chatroom Identification System
"""

import sqlite3
import json
import hashlib
import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class KakaoUser:
    """카카오톡 사용자 정보"""
    user_id: str
    nickname: str
    profile_image_url: Optional[str] = None
    phone_number_hash: Optional[str] = None
    is_me: bool = False
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    nickname_history: List[str] = None
    total_messages: int = 0

@dataclass
class KakaoChatRoom:
    """카카오톡 대화방 정보"""
    chat_id: str
    room_name: str
    room_type: str  # 'direct', 'group', 'openchat'
    participant_count: int
    participants: List[str]  # user_id 목록
    created_at: Optional[str] = None
    last_activity: Optional[str] = None
    message_count: int = 0
    room_hash: Optional[str] = None  # 참여자 기반 해시

@dataclass
class ChatRoomMember:
    """대화방 참여자 정보"""
    chat_id: str
    user_id: str
    nickname_in_room: str
    join_date: Optional[str] = None
    leave_date: Optional[str] = None
    role: str = "member"  # member, admin, owner
    is_active: bool = True

class KakaoIdentifier:
    """카카오톡 식별 시스템"""
    
    def __init__(self, db_path: str = "kakao_identity.db"):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """식별 데이터베이스 초기화"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 사용자 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS kakao_users (
                    user_id TEXT PRIMARY KEY,
                    nickname TEXT NOT NULL,
                    profile_image_url TEXT,
                    phone_number_hash TEXT,
                    is_me BOOLEAN DEFAULT FALSE,
                    first_seen TIMESTAMP,
                    last_seen TIMESTAMP,
                    total_messages INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 닉네임 변경 이력 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS nickname_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    old_nickname TEXT,
                    new_nickname TEXT,
                    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES kakao_users (user_id)
                )
            """)
            
            # 대화방 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS kakao_chatrooms (
                    chat_id TEXT PRIMARY KEY,
                    room_name TEXT NOT NULL,
                    room_type TEXT NOT NULL,
                    participant_count INTEGER,
                    room_hash TEXT UNIQUE,
                    created_at TIMESTAMP,
                    last_activity TIMESTAMP,
                    message_count INTEGER DEFAULT 0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 대화방 참여자 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chatroom_members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chat_id TEXT,
                    user_id TEXT,
                    nickname_in_room TEXT,
                    join_date TIMESTAMP,
                    leave_date TIMESTAMP,
                    role TEXT DEFAULT 'member',
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (chat_id) REFERENCES kakao_chatrooms (chat_id),
                    FOREIGN KEY (user_id) REFERENCES kakao_users (user_id),
                    UNIQUE(chat_id, user_id)
                )
            """)
            
            # 메시지 식별 매핑 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS message_mappings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    original_message_id TEXT,
                    normalized_chat_id TEXT,
                    normalized_user_id TEXT,
                    sender_nickname TEXT,
                    room_context TEXT,
                    timestamp INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()

    def extract_and_identify_from_kakao_db(self, kakao_db_path: str) -> Dict[str, Any]:
        """카카오톡 DB에서 사용자 및 대화방 정보 추출"""
        result = {
            "users": [],
            "chatrooms": [],
            "relationships": [],
            "statistics": {}
        }
        
        try:
            with sqlite3.connect(kakao_db_path) as conn:
                # 사용자 정보 추출
                users = self._extract_users(conn)
                result["users"] = users
                
                # 대화방 정보 추출
                chatrooms = self._extract_chatrooms(conn)
                result["chatrooms"] = chatrooms
                
                # 관계 정보 추출
                relationships = self._extract_relationships(conn)
                result["relationships"] = relationships
                
                # 통계 정보
                result["statistics"] = self._calculate_statistics(conn)
                
                # 식별 정보 저장
                self._store_identification_data(users, chatrooms, relationships)
                
        except Exception as e:
            print(f"카카오톡 DB 추출 오류: {e}")
            
        return result

    def _extract_users(self, conn: sqlite3.Connection) -> List[KakaoUser]:
        """사용자 정보 추출"""
        users = []
        cursor = conn.cursor()
        
        try:
            # 프로필 테이블에서 사용자 기본 정보 추출
            cursor.execute("""
                SELECT 
                    user_id,
                    nickname,
                    profile_image_url,
                    phone_number,
                    is_user
                FROM open_profile
            """)
            
            profile_data = cursor.fetchall()
            
            # 각 사용자별 메시지 통계 및 활동 정보
            for row in profile_data:
                user_id, nickname, profile_img, phone, is_me = row
                
                # 해당 사용자의 메시지 통계
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_messages,
                        MIN(created_at) as first_seen,
                        MAX(created_at) as last_seen
                    FROM chat_logs 
                    WHERE user_id = ?
                """, (user_id,))
                
                stats = cursor.fetchone()
                total_msg, first_seen, last_seen = stats if stats else (0, None, None)
                
                # 닉네임 변경 이력 추출
                cursor.execute("""
                    SELECT DISTINCT nickname 
                    FROM chat_logs 
                    WHERE user_id = ? 
                    ORDER BY created_at
                """, (user_id,))
                
                nickname_history = [n[0] for n in cursor.fetchall() if n[0]]
                
                user = KakaoUser(
                    user_id=str(user_id),
                    nickname=nickname or "Unknown",
                    profile_image_url=profile_img,
                    phone_number_hash=self._hash_phone(phone) if phone else None,
                    is_me=bool(is_me),
                    first_seen=first_seen,
                    last_seen=last_seen,
                    nickname_history=nickname_history,
                    total_messages=total_msg or 0
                )
                users.append(user)
                
        except Exception as e:
            print(f"사용자 추출 오류: {e}")
            
        return users

    def _extract_chatrooms(self, conn: sqlite3.Connection) -> List[KakaoChatRoom]:
        """대화방 정보 추출"""
        chatrooms = []
        cursor = conn.cursor()
        
        try:
            # 대화방 기본 정보
            cursor.execute("""
                SELECT 
                    id as chat_id,
                    nickname as room_name,
                    type as room_type,
                    member_count,
                    members
                FROM open_chat_link
            """)
            
            for row in cursor.fetchall():
                chat_id, room_name, room_type, member_count, members = row
                
                # 대화방 타입 변환
                room_type_str = {
                    1: "direct",
                    2: "group", 
                    3: "openchat"
                }.get(room_type, "unknown")
                
                # 참여자 목록 파싱
                participants = self._parse_participants(members)
                
                # 대화방 활동 통계
                cursor.execute("""
                    SELECT 
                        COUNT(*) as message_count,
                        MIN(created_at) as first_message,
                        MAX(created_at) as last_activity
                    FROM chat_logs 
                    WHERE chat_id = ?
                """, (chat_id,))
                
                stats = cursor.fetchone()
                msg_count, created_at, last_activity = stats if stats else (0, None, None)
                
                # 참여자 기반 해시 생성
                room_hash = self._generate_room_hash(participants)
                
                chatroom = KakaoChatRoom(
                    chat_id=str(chat_id),
                    room_name=room_name or f"Chat_{chat_id}",
                    room_type=room_type_str,
                    participant_count=member_count or len(participants),
                    participants=participants,
                    created_at=created_at,
                    last_activity=last_activity,
                    message_count=msg_count or 0,
                    room_hash=room_hash
                )
                chatrooms.append(chatroom)
                
        except Exception as e:
            print(f"대화방 추출 오류: {e}")
            
        return chatrooms

    def _extract_relationships(self, conn: sqlite3.Connection) -> List[ChatRoomMember]:
        """대화방-사용자 관계 추출"""
        relationships = []
        cursor = conn.cursor()
        
        try:
            # 각 메시지에서 사용자-대화방 관계 추출
            cursor.execute("""
                SELECT DISTINCT
                    chat_id,
                    user_id,
                    nickname,
                    MIN(created_at) as join_date,
                    MAX(created_at) as last_seen
                FROM chat_logs
                WHERE user_id IS NOT NULL 
                AND chat_id IS NOT NULL
                GROUP BY chat_id, user_id
            """)
            
            for row in cursor.fetchall():
                chat_id, user_id, nickname, join_date, last_seen = row
                
                member = ChatRoomMember(
                    chat_id=str(chat_id),
                    user_id=str(user_id),
                    nickname_in_room=nickname or "Unknown",
                    join_date=join_date,
                    leave_date=None,  # 퇴장은 별도 로직으로 판단
                    role="member",
                    is_active=True
                )
                relationships.append(member)
                
        except Exception as e:
            print(f"관계 추출 오류: {e}")
            
        return relationships

    def _calculate_statistics(self, conn: sqlite3.Connection) -> Dict[str, Any]:
        """통계 정보 계산"""
        stats = {}
        cursor = conn.cursor()
        
        try:
            # 전체 통계
            cursor.execute("SELECT COUNT(*) FROM chat_logs")
            stats["total_messages"] = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(DISTINCT user_id) FROM chat_logs")
            stats["total_users"] = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(DISTINCT chat_id) FROM chat_logs")
            stats["total_chatrooms"] = cursor.fetchone()[0]
            
            # 대화방 타입별 통계
            cursor.execute("""
                SELECT type, COUNT(*) 
                FROM open_chat_link 
                GROUP BY type
            """)
            stats["chatroom_by_type"] = dict(cursor.fetchall())
            
            # 활성 사용자 (최근 7일)
            cursor.execute("""
                SELECT COUNT(DISTINCT user_id) 
                FROM chat_logs 
                WHERE created_at > datetime('now', '-7 days')
            """)
            stats["active_users_7d"] = cursor.fetchone()[0]
            
        except Exception as e:
            print(f"통계 계산 오류: {e}")
            
        return stats

    def _store_identification_data(self, users: List[KakaoUser], 
                                 chatrooms: List[KakaoChatRoom], 
                                 relationships: List[ChatRoomMember]):
        """식별 정보를 로컬 DB에 저장"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 사용자 정보 저장
            for user in users:
                cursor.execute("""
                    INSERT OR REPLACE INTO kakao_users 
                    (user_id, nickname, profile_image_url, phone_number_hash, 
                     is_me, first_seen, last_seen, total_messages, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    user.user_id, user.nickname, user.profile_image_url,
                    user.phone_number_hash, user.is_me, user.first_seen,
                    user.last_seen, user.total_messages
                ))
                
                # 닉네임 이력 저장
                if user.nickname_history:
                    for i, nickname in enumerate(user.nickname_history[:-1]):
                        if i + 1 < len(user.nickname_history):
                            cursor.execute("""
                                INSERT OR IGNORE INTO nickname_history 
                                (user_id, old_nickname, new_nickname)
                                VALUES (?, ?, ?)
                            """, (user.user_id, nickname, user.nickname_history[i + 1]))
            
            # 대화방 정보 저장
            for room in chatrooms:
                cursor.execute("""
                    INSERT OR REPLACE INTO kakao_chatrooms 
                    (chat_id, room_name, room_type, participant_count, 
                     room_hash, created_at, last_activity, message_count, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    room.chat_id, room.room_name, room.room_type,
                    room.participant_count, room.room_hash, room.created_at,
                    room.last_activity, room.message_count
                ))
            
            # 관계 정보 저장
            for rel in relationships:
                cursor.execute("""
                    INSERT OR REPLACE INTO chatroom_members 
                    (chat_id, user_id, nickname_in_room, join_date, 
                     leave_date, role, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    rel.chat_id, rel.user_id, rel.nickname_in_room,
                    rel.join_date, rel.leave_date, rel.role, rel.is_active
                ))
            
            conn.commit()

    def identify_message_context(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """메시지의 컨텍스트 식별"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 사용자 정보 조회
            cursor.execute("""
                SELECT nickname, is_me, total_messages 
                FROM kakao_users 
                WHERE user_id = ?
            """, (message_data.get("sender_id"),))
            
            user_info = cursor.fetchone()
            
            # 대화방 정보 조회
            cursor.execute("""
                SELECT room_name, room_type, participant_count 
                FROM kakao_chatrooms 
                WHERE chat_id = ?
            """, (message_data.get("chat_room_id"),))
            
            room_info = cursor.fetchone()
            
            # 대화방 참여자 조회
            cursor.execute("""
                SELECT u.nickname, cm.nickname_in_room, cm.role
                FROM chatroom_members cm
                JOIN kakao_users u ON cm.user_id = u.user_id
                WHERE cm.chat_id = ? AND cm.is_active = TRUE
            """, (message_data.get("chat_room_id"),))
            
            participants = cursor.fetchall()
            
            return {
                "message_id": message_data.get("message_id"),
                "sender": {
                    "user_id": message_data.get("sender_id"),
                    "nickname": user_info[0] if user_info else "Unknown",
                    "is_me": user_info[1] if user_info else False,
                    "total_messages": user_info[2] if user_info else 0
                },
                "chatroom": {
                    "chat_id": message_data.get("chat_room_id"),
                    "room_name": room_info[0] if room_info else "Unknown",
                    "room_type": room_info[1] if room_info else "unknown",
                    "participant_count": room_info[2] if room_info else 0
                },
                "participants": [
                    {
                        "nickname": p[0],
                        "nickname_in_room": p[1],
                        "role": p[2]
                    } for p in participants
                ],
                "context_hash": self._generate_context_hash(message_data, user_info, room_info)
            }

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """사용자 ID로 사용자 정보 조회"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT user_id, nickname, profile_image_url, is_me, 
                       first_seen, last_seen, total_messages
                FROM kakao_users 
                WHERE user_id = ?
            """, (user_id,))
            
            result = cursor.fetchone()
            if result:
                return {
                    "user_id": result[0],
                    "nickname": result[1],
                    "profile_image_url": result[2],
                    "is_me": bool(result[3]),
                    "first_seen": result[4],
                    "last_seen": result[5],
                    "total_messages": result[6]
                }
            return None

    def get_chatroom_by_id(self, chat_id: str) -> Optional[Dict[str, Any]]:
        """대화방 ID로 대화방 정보 조회"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT chat_id, room_name, room_type, participant_count,
                       created_at, last_activity, message_count
                FROM kakao_chatrooms 
                WHERE chat_id = ?
            """, (chat_id,))
            
            result = cursor.fetchone()
            if result:
                # 참여자 정보도 함께 조회
                cursor.execute("""
                    SELECT u.nickname, cm.nickname_in_room, cm.role, cm.is_active
                    FROM chatroom_members cm
                    JOIN kakao_users u ON cm.user_id = u.user_id
                    WHERE cm.chat_id = ?
                """, (chat_id,))
                
                participants = cursor.fetchall()
                
                return {
                    "chat_id": result[0],
                    "room_name": result[1],
                    "room_type": result[2],
                    "participant_count": result[3],
                    "created_at": result[4],
                    "last_activity": result[5],
                    "message_count": result[6],
                    "participants": [
                        {
                            "nickname": p[0],
                            "nickname_in_room": p[1],
                            "role": p[2],
                            "is_active": bool(p[3])
                        } for p in participants
                    ]
                }
            return None

    def find_similar_chatrooms(self, participants: List[str]) -> List[Dict[str, Any]]:
        """참여자 목록을 기반으로 유사한 대화방 찾기"""
        room_hash = self._generate_room_hash(participants)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT chat_id, room_name, room_type, participant_count
                FROM kakao_chatrooms 
                WHERE room_hash = ?
            """, (room_hash,))
            
            results = cursor.fetchall()
            return [
                {
                    "chat_id": r[0],
                    "room_name": r[1],
                    "room_type": r[2],
                    "participant_count": r[3],
                    "similarity": 1.0  # 완전 일치
                } for r in results
            ]

    def _hash_phone(self, phone_number: str) -> str:
        """전화번호 해시 생성"""
        if not phone_number:
            return None
        return hashlib.sha256(phone_number.encode()).hexdigest()[:16]

    def _parse_participants(self, members_str: str) -> List[str]:
        """참여자 문자열 파싱"""
        if not members_str:
            return []
        
        try:
            # JSON 형태인 경우
            if members_str.startswith('[') or members_str.startswith('{'):
                data = json.loads(members_str)
                if isinstance(data, list):
                    return [str(member) for member in data]
                elif isinstance(data, dict):
                    return list(data.keys())
            
            # 콤마 구분인 경우
            return [member.strip() for member in members_str.split(',') if member.strip()]
        except:
            return []

    def _generate_room_hash(self, participants: List[str]) -> str:
        """참여자 기반 대화방 해시 생성"""
        if not participants:
            return ""
        
        # 정렬하여 순서에 상관없이 동일한 해시 생성
        sorted_participants = sorted(participants)
        participants_str = ",".join(sorted_participants)
        return hashlib.md5(participants_str.encode()).hexdigest()

    def _generate_context_hash(self, message_data: Dict[str, Any], 
                             user_info: Tuple, room_info: Tuple) -> str:
        """메시지 컨텍스트 해시 생성"""
        context_str = f"{message_data.get('chat_room_id')}_{message_data.get('sender_id')}"
        if user_info:
            context_str += f"_{user_info[0]}"
        if room_info:
            context_str += f"_{room_info[1]}"
        
        return hashlib.md5(context_str.encode()).hexdigest()[:12]

    def get_identification_summary(self) -> Dict[str, Any]:
        """식별 시스템 요약 정보"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 사용자 통계
            cursor.execute("SELECT COUNT(*) FROM kakao_users")
            total_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM kakao_users WHERE is_me = TRUE")
            me_users = cursor.fetchone()[0]
            
            # 대화방 통계
            cursor.execute("SELECT COUNT(*) FROM kakao_chatrooms")
            total_rooms = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT room_type, COUNT(*) 
                FROM kakao_chatrooms 
                GROUP BY room_type
            """)
            room_types = dict(cursor.fetchall())
            
            # 관계 통계
            cursor.execute("SELECT COUNT(*) FROM chatroom_members WHERE is_active = TRUE")
            active_relationships = cursor.fetchone()[0]
            
            return {
                "users": {
                    "total": total_users,
                    "me_accounts": me_users,
                    "others": total_users - me_users
                },
                "chatrooms": {
                    "total": total_rooms,
                    "by_type": room_types
                },
                "relationships": {
                    "active_memberships": active_relationships
                },
                "last_updated": datetime.datetime.now().isoformat()
            }

if __name__ == "__main__":
    # 테스트 실행
    identifier = KakaoIdentifier()
    
    # 루팅폰에서 추출한 카카오톡 DB 분석
    kakao_db_path = "/path/to/KakaoTalk.db"  # 실제 경로로 변경 필요
    
    print("🔍 카카오톡 사용자/대화방 식별 시스템 시작...")
    
    # result = identifier.extract_and_identify_from_kakao_db(kakao_db_path)
    # print(f"✅ 식별 완료: 사용자 {len(result['users'])}명, 대화방 {len(result['chatrooms'])}개")
    
    summary = identifier.get_identification_summary()
    print("📊 식별 시스템 현재 상태:")
    print(json.dumps(summary, indent=2, ensure_ascii=False)) 