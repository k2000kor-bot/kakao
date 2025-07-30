#!/usr/bin/env python3
"""
데이터베이스 상태 확인 스크립트
"""

import sqlite3
import os

def check_database():
    """데이터베이스 상태 확인"""
    db_path = os.path.join(os.path.dirname(__file__), 'real_kakao_chat.db')
    
    if not os.path.exists(db_path):
        print("❌ 데이터베이스 파일이 존재하지 않습니다.")
        return
    
    print(f"📊 데이터베이스 파일: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 테이블 목록 확인
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"\n📋 테이블 목록:")
    for table in tables:
        print(f"  - {table[0]}")
    
    # 채팅방 개수 확인
    cursor.execute("SELECT COUNT(*) FROM chat_rooms")
    room_count = cursor.fetchone()[0]
    print(f"\n🏠 채팅방 개수: {room_count}개")
    
    if room_count > 0:
        # 채팅방 목록
        cursor.execute("SELECT id, room_name, participant_count, save_date FROM chat_rooms")
        rooms = cursor.fetchall()
        print(f"\n📱 채팅방 목록:")
        for room in rooms:
            room_id, room_name, participant_count, save_date = room
            print(f"  - ID: {room_id}, 이름: {room_name}, 참여자: {participant_count}명, 날짜: {save_date}")
            
            # 각 채팅방의 메시지 개수 확인
            cursor.execute("SELECT COUNT(*) FROM messages WHERE room_id = ?", (room_id,))
            message_count = cursor.fetchone()[0]
            print(f"    💬 메시지 개수: {message_count}개")
            
            if message_count > 0:
                # 첫 번째 메시지 샘플
                cursor.execute("""
                    SELECT sender, content, date, time 
                    FROM messages 
                    WHERE room_id = ? 
                    ORDER BY timestamp ASC 
                    LIMIT 1
                """, (room_id,))
                sample = cursor.fetchone()
                if sample:
                    sender, content, date, time = sample
                    print(f"    📝 첫 번째 메시지: {sender} ({date} {time}) - {content[:50]}...")
    
    # 전체 메시지 개수
    cursor.execute("SELECT COUNT(*) FROM messages")
    total_messages = cursor.fetchone()[0]
    print(f"\n💬 전체 메시지 개수: {total_messages}개")
    
    # 참여자 개수
    cursor.execute("SELECT COUNT(*) FROM participants")
    total_participants = cursor.fetchone()[0]
    print(f"👥 전체 참여자 개수: {total_participants}개")
    
    conn.close()
    
    if total_messages == 0:
        print("\n⚠️  데이터베이스에 메시지가 없습니다!")
        print("카카오톡 파일을 업로드해주세요.")
    else:
        print(f"\n✅ 데이터베이스에 {total_messages}개 메시지가 저장되어 있습니다.")

if __name__ == "__main__":
    check_database() 