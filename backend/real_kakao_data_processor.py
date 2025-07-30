import os
import json
import sqlite3
from datetime import datetime
from typing import List, Dict, Any
import re

class RealKakaoDataProcessor:
    def __init__(self, chat_rooms_path: str = "../chat_rooms"):
        self.chat_rooms_path = chat_rooms_path
        self.db_path = "real_kakao_chat.db"
        self.init_database()
    
    def init_database(self):
        """데이터베이스 초기화"""
        print(f"데이터베이스 초기화 시작: {self.db_path}")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        print("채팅방 테이블 생성 중...")
        # 채팅방 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_rooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_name TEXT NOT NULL,
                participant_count INTEGER,
                save_date TEXT,
                file_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        print("메시지 테이블 생성 중...")
        # 메시지 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER,
                sender TEXT,
                content TEXT,
                timestamp TEXT,
                date TEXT,
                time TEXT,
                is_deleted BOOLEAN DEFAULT FALSE,
                has_media BOOLEAN DEFAULT FALSE,
                media_path TEXT,
                FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        print("참여자 테이블 생성 중...")
        # 참여자 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER,
                name TEXT,
                message_count INTEGER DEFAULT 0,
                FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        print("데이터베이스 초기화 완료!")
        
        # 테이블 생성 확인
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"생성된 테이블: {[table[0] for table in tables]}")
        conn.close()
    
    def scan_chat_rooms(self) -> List[Dict[str, Any]]:
        """채팅방 폴더 스캔"""
        rooms = []
        
        if not os.path.exists(self.chat_rooms_path):
            return rooms
        
        for folder_name in os.listdir(self.chat_rooms_path):
            folder_path = os.path.join(self.chat_rooms_path, folder_name)
            if os.path.isdir(folder_path):
                # .txt 파일 찾기
                txt_files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]
                if txt_files:
                    txt_file = txt_files[0]
                    file_path = os.path.join(folder_path, txt_file)
                    
                    # 파일 크기 확인
                    file_size = os.path.getsize(file_path)
                    
                    rooms.append({
                        'name': folder_name,
                        'file_path': file_path,
                        'size': file_size,
                        'has_media': os.path.exists(os.path.join(folder_path, '미디어')),
                        'has_images': os.path.exists(os.path.join(folder_path, '이미지')),
                        'has_documents': os.path.exists(os.path.join(folder_path, '문서'))
                    })
        
        return rooms
    
    def parse_kakao_chat_file(self, file_path: str) -> Dict[str, Any]:
        """카카오톡 채팅 파일 파싱"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(file_path, 'r', encoding='cp949') as f:
                content = f.read()
        
        # 전체 텍스트에서 메시지 패턴 찾기
        room_name = ""
        save_date = ""
        participants = set()
        messages = []
        
        # 채팅방 이름과 저장 날짜 추출
        room_match = re.search(r'([^님]+)님과 카카오톡 대화', content)
        if room_match:
            room_name = room_match.group(1).strip()
            print(f"채팅방 이름: {room_name}")
        
        save_date_match = re.search(r'저장한 날짜 : ([^\\n]+)', content)
        if save_date_match:
            save_date = save_date_match.group(1).strip()
            print(f"저장 날짜: {save_date}")
        
        # 메시지 패턴 찾기 (전체 텍스트에서)
        # 날짜/시간/보낸사람 패턴으로 메시지 시작점 찾기
        message_start_pattern = r'(\d{4}년 \d{1,2}월 \d{1,2}일) (오전|오후) (\d{1,2}:\d{2}), ([^:]+) : '
        
        # 메시지 시작점들을 찾기
        message_starts = list(re.finditer(message_start_pattern, content))
        
        for i, match in enumerate(message_starts):
            date, ampm, time, sender = match.groups()
            
            # 현재 메시지의 시작 위치
            start_pos = match.end()
            
            # 다음 메시지의 시작 위치 (마지막 메시지면 파일 끝까지)
            if i + 1 < len(message_starts):
                end_pos = message_starts[i + 1].start()
            else:
                end_pos = len(content)
            
            # 메시지 내용 추출 (시작 위치부터 다음 메시지 시작 전까지)
            message_content = content[start_pos:end_pos].strip()
            
            # 참여자 추가
            participants.add(sender)
            
            # 메시지 객체 생성
            message = {
                'sender': sender,
                'content': message_content,
                'date': date,
                'time': f"{ampm} {time}",
                'timestamp': f"{date} {ampm} {time}",
                'is_deleted': '삭제된 메시지' in message_content,
                'has_media': False
            }
            
            messages.append(message)
            
            # 처음 몇 개 메시지 디버깅 출력
            if len(messages) <= 5:
                print(f"메시지 파싱: {sender} - {message_content[:50]}...")
        
        print(f"총 메시지 수: {len(messages)}")
        print(f"참여자 수: {len(participants)}")
        
        return {
            'room_name': room_name,
            'save_date': save_date,
            'participants': list(participants),
            'messages': messages,
            'participant_count': len(participants)
        }
    
    def save_to_database(self, chat_data: Dict[str, Any], file_path: str):
        """데이터베이스에 저장 (날짜/시간 기준 중복 방지)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # 1. 파일 경로 중복 체크
            cursor.execute('SELECT id FROM chat_rooms WHERE file_path = ?', (file_path,))
            existing_room = cursor.fetchone()
            
            if existing_room:
                print(f"이미 저장된 파일입니다: {file_path}")
                conn.close()
                return existing_room[0]
            
            # 2. 날짜/시간 기준 중복 체크 (동일 날짜 시간에 올라온 대화는 하나만)
            from datetime import datetime
            
            # 파일의 수정 시간 가져오기
            import os
            file_mtime = os.path.getmtime(file_path)
            file_datetime = datetime.fromtimestamp(file_mtime)
            file_date = file_datetime.strftime('%Y-%m-%d')
            file_time = file_datetime.strftime('%H:%M:%S')
            
            # 같은 채팅방 이름과 같은 날짜에 저장된 것 확인
            cursor.execute('''
                SELECT id, save_date, file_path FROM chat_rooms 
                WHERE room_name = ? AND save_date = ?
            ''', (chat_data['room_name'], file_date))
            existing_rooms = cursor.fetchall()
            
            if existing_rooms:
                # 같은 날짜에 저장된 채팅방이 있으면 시간 비교
                for existing_room_id, existing_save_date, existing_file_path in existing_rooms:
                    # 기존 파일의 수정 시간 확인
                    if os.path.exists(existing_file_path):
                        existing_mtime = os.path.getmtime(existing_file_path)
                        existing_datetime = datetime.fromtimestamp(existing_mtime)
                        existing_time = existing_datetime.strftime('%H:%M:%S')
                        
                        # 같은 시간대(±5분)에 업로드된 경우 중복으로 처리
                        time_diff = abs((file_datetime - existing_datetime).total_seconds())
                        if time_diff <= 300:  # 5분 = 300초
                            print(f"동일 시간대에 업로드된 채팅방입니다: {chat_data['room_name']}")
                            print(f"기존 파일: {existing_file_path} ({existing_time})")
                            print(f"새 파일: {file_path} ({file_time})")
                            conn.close()
                            return existing_room_id
                
                # 시간이 다르면 내용 비교 후 업데이트
                existing_room_id = existing_rooms[0][0]  # 첫 번째 기존 채팅방 사용
                
                # 기존 메시지 개수 조회
                cursor.execute('SELECT COUNT(*) FROM messages WHERE room_id = ?', (existing_room_id,))
                existing_message_count = cursor.fetchone()[0]
                
                # 새로운 메시지 개수
                new_message_count = len(chat_data['messages'])
                
                # 메시지 개수가 다르면 업데이트
                if existing_message_count != new_message_count:
                    print(f"채팅방 내용이 변경되었습니다: {chat_data['room_name']}")
                    print(f"기존 메시지: {existing_message_count}개, 새로운 메시지: {new_message_count}개")
                    
                    # 기존 메시지 삭제
                    cursor.execute('DELETE FROM messages WHERE room_id = ?', (existing_room_id,))
                    cursor.execute('DELETE FROM participants WHERE room_id = ?', (existing_room_id,))
                    
                    # 새로운 참여자 저장
                    for participant in chat_data['participants']:
                        cursor.execute('''
                            INSERT INTO participants (room_id, name)
                            VALUES (?, ?)
                        ''', (existing_room_id, participant))
                    
                    # 새로운 메시지 저장
                    for message in chat_data['messages']:
                        cursor.execute('''
                            INSERT INTO messages (room_id, sender, content, timestamp, date, time, is_deleted, has_media)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (existing_room_id, message['sender'], message['content'], 
                              message['timestamp'], message['date'], message['time'],
                              message['is_deleted'], message['has_media']))
                    
                    # 파일 경로 업데이트
                    cursor.execute('''
                        UPDATE chat_rooms 
                        SET file_path = ?, participant_count = ?
                        WHERE id = ?
                    ''', (file_path, chat_data['participant_count'], existing_room_id))
                    
                    conn.commit()
                    print(f"채팅방 내용 업데이트 완료: {chat_data['room_name']} (ID: {existing_room_id})")
                    return existing_room_id
                else:
                    # 메시지 개수가 같으면 내용 해시 비교
                    import hashlib
                    
                    # 기존 메시지 해시 계산
                    cursor.execute('''
                        SELECT sender, content, timestamp, date, time 
                        FROM messages WHERE room_id = ? 
                        ORDER BY timestamp ASC
                    ''', (existing_room_id,))
                    existing_messages = cursor.fetchall()
                    
                    existing_hash = hashlib.md5(str(existing_messages).encode()).hexdigest()
                    
                    # 새로운 메시지 해시 계산
                    new_messages = [(msg['sender'], msg['content'], msg['timestamp'], 
                                   msg['date'], msg['time']) for msg in chat_data['messages']]
                    new_hash = hashlib.md5(str(new_messages).encode()).hexdigest()
                    
                    if existing_hash != new_hash:
                        print(f"채팅방 내용이 변경되었습니다: {chat_data['room_name']}")
                        print(f"기존 해시: {existing_hash[:8]}..., 새로운 해시: {new_hash[:8]}...")
                        
                        # 기존 메시지 삭제
                        cursor.execute('DELETE FROM messages WHERE room_id = ?', (existing_room_id,))
                        cursor.execute('DELETE FROM participants WHERE room_id = ?', (existing_room_id,))
                        
                        # 새로운 참여자 저장
                        for participant in chat_data['participants']:
                            cursor.execute('''
                                INSERT INTO participants (room_id, name)
                                VALUES (?, ?)
                            ''', (existing_room_id, participant))
                        
                        # 새로운 메시지 저장
                        for message in chat_data['messages']:
                            cursor.execute('''
                                INSERT INTO messages (room_id, sender, content, timestamp, date, time, is_deleted, has_media)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            ''', (existing_room_id, message['sender'], message['content'], 
                                  message['timestamp'], message['date'], message['time'],
                                  message['is_deleted'], message['has_media']))
                        
                        # 파일 경로 업데이트
                        cursor.execute('''
                            UPDATE chat_rooms 
                            SET file_path = ?, participant_count = ?
                            WHERE id = ?
                        ''', (file_path, chat_data['participant_count'], existing_room_id))
                        
                        conn.commit()
                        print(f"채팅방 내용 업데이트 완료: {chat_data['room_name']} (ID: {existing_room_id})")
                        return existing_room_id
                    else:
                        print(f"동일한 내용의 채팅방입니다: {chat_data['room_name']}")
                        conn.close()
                        return existing_room_id
            
            # 3. 완전히 새로운 채팅방 저장
            cursor.execute('''
                INSERT INTO chat_rooms (room_name, participant_count, save_date, file_path)
                VALUES (?, ?, ?, ?)
            ''', (chat_data['room_name'], chat_data['participant_count'], 
                  file_date, file_path))
            
            room_id = cursor.lastrowid
            
            # 참여자 저장
            for participant in chat_data['participants']:
                cursor.execute('''
                    INSERT INTO participants (room_id, name)
                    VALUES (?, ?)
                ''', (room_id, participant))
            
            # 메시지 저장
            for message in chat_data['messages']:
                cursor.execute('''
                    INSERT INTO messages (room_id, sender, content, timestamp, date, time, is_deleted, has_media)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (room_id, message['sender'], message['content'], 
                      message['timestamp'], message['date'], message['time'],
                      message['is_deleted'], message['has_media']))
            
            conn.commit()
            print(f"새로운 채팅방 저장 완료: {chat_data['room_name']} (ID: {room_id})")
            return room_id
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def get_chat_room(self, room_id: int) -> Dict[str, Any]:
        """채팅방 정보 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 채팅방 정보
        cursor.execute('''
            SELECT id, room_name, participant_count, save_date, file_path
            FROM chat_rooms WHERE id = ?
        ''', (room_id,))
        
        room_data = cursor.fetchone()
        if not room_data:
            conn.close()
            return None
        
        room = {
            'id': room_data[0],
            'room_name': room_data[1],
            'participant_count': room_data[2],
            'save_date': room_data[3],
            'file_path': room_data[4]
        }
        
        # 참여자 정보
        cursor.execute('''
            SELECT name, message_count
            FROM participants WHERE room_id = ?
        ''', (room_id,))
        
        participants = [{'name': row[0], 'message_count': row[1]} for row in cursor.fetchall()]
        room['participants'] = participants
        
        # 메시지 개수
        cursor.execute('''
            SELECT COUNT(*) FROM messages WHERE room_id = ?
        ''', (room_id,))
        
        room['message_count'] = cursor.fetchone()[0]
        
        conn.close()
        return room
    
    def get_messages(self, room_id: int, limit: int = 1000000, offset: int = 0) -> List[Dict[str, Any]]:
        """메시지 조회 (교육 목적으로 제한 완전 해제)"""
        print(f"get_messages 호출: room_id={room_id}, limit={limit}, offset={offset}")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 먼저 해당 채팅방의 메시지 개수 확인
        cursor.execute('SELECT COUNT(*) FROM messages WHERE room_id = ?', (room_id,))
        total_messages = cursor.fetchone()[0]
        print(f"채팅방 {room_id}의 총 메시지 개수: {total_messages}개")
        
        if total_messages == 0:
            print(f"채팅방 {room_id}에 메시지가 없습니다.")
            conn.close()
            return []
        
        cursor.execute('''
            SELECT id, sender, content, timestamp, date, time, is_deleted, has_media
            FROM messages 
            WHERE room_id = ?
            ORDER BY timestamp ASC
            LIMIT ? OFFSET ?
        ''', (room_id, limit, offset))
        
        messages = []
        for row in cursor.fetchall():
            messages.append({
                'id': row[0],
                'sender': row[1],
                'content': row[2],
                'timestamp': row[3],
                'date': row[4],
                'time': row[5],
                'is_deleted': bool(row[6]),
                'has_media': bool(row[7])
            })
        
        print(f"실제 조회된 메시지 개수: {len(messages)}개")
        conn.close()
        return messages
    
    def get_db_connection(self):
        """데이터베이스 연결 반환"""
        return sqlite3.connect(self.db_path)
    
    def get_all_chat_rooms(self) -> List[Dict[str, Any]]:
        """모든 채팅방 목록 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, room_name, participant_count, save_date
            FROM chat_rooms
            ORDER BY created_at DESC
        ''')
        
        rooms = []
        for row in cursor.fetchall():
            # 메시지 개수 조회
            cursor.execute('SELECT COUNT(*) FROM messages WHERE room_id = ?', (row[0],))
            message_count = cursor.fetchone()[0]
            
            rooms.append({
                'id': row[0],
                'room_name': row[1],
                'participant_count': row[2],
                'save_date': row[3],
                'message_count': message_count
            })
        
        conn.close()
        return rooms
    
    def process_all_chat_files(self):
        """모든 채팅 파일 처리"""
        rooms = self.scan_chat_rooms()
        
        for room in rooms:
            try:
                print(f"처리 중: {room['name']}")
                chat_data = self.parse_kakao_chat_file(room['file_path'])
                room_id = self.save_to_database(chat_data, room['file_path'])
                print(f"완료: {room['name']} (ID: {room_id}, 메시지: {len(chat_data['messages'])}개)")
            except Exception as e:
                print(f"오류: {room['name']} - {str(e)}")
    
    def process_single_file(self, file_path: str) -> int:
        """단일 파일 처리 (새로운 파일 업로드용)"""
        print(f"새로운 파일 처리 중: {file_path}")
        try:
            chat_data = self.parse_kakao_chat_file(file_path)
            room_id = self.save_to_database(chat_data, file_path)
            print(f"새로운 채팅방 처리 완료: {chat_data['room_name']} (ID: {room_id})")
            return room_id
        except Exception as e:
            print(f"파일 처리 오류: {file_path} - {str(e)}")
            raise e

if __name__ == "__main__":
    processor = RealKakaoDataProcessor()
    processor.process_all_chat_files() 