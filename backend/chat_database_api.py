#!/usr/bin/env python3
"""
카카오톡 처리된 데이터베이스 API 서버
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime
import logging
import os

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = "processed_kakao_chat.db"


def get_db_connection():
    """데이터베이스 연결"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/api/chat-rooms', methods=['GET'])
def get_chat_rooms():
    """대화방 목록 조회"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, message_count, participant_count, 
                   media_files_count, start_date, end_date
            FROM chat_rooms
            ORDER BY updated_at DESC
        ''')
        
        rooms = []
        for row in cursor.fetchall():
            rooms.append({
                'id': row['id'],
                'name': row['name'],
                'messageCount': row['message_count'],
                'participantCount': row['participant_count'],
                'mediaFilesCount': row['media_files_count'],
                'startDate': row['start_date'],
                'endDate': row['end_date']
            })
        
        conn.close()
        return jsonify({'success': True, 'data': rooms})
        
    except Exception as e:
        logger.error(f"대화방 목록 조회 실패: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/messages/<chat_room_id>', methods=['GET'])
def get_messages(chat_room_id):
    """특정 대화방의 메시지 조회"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        message_type = request.args.get('type', 'all')
        
        offset = (page - 1) * limit
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 조건부 쿼리
        where_clause = "WHERE chat_room_id = ?"
        params = [chat_room_id]
        
        if message_type != 'all':
            where_clause += " AND message_type = ?"
            params.append(message_type)
        
        # 전체 개수 조회
        cursor.execute(f'''
            SELECT COUNT(*) as total 
            FROM messages 
            {where_clause}
        ''', params)
        
        total = cursor.fetchone()['total']
        
        # 메시지 조회
        cursor.execute(f'''
            SELECT id, sender, content, message_type, timestamp, 
                   line_number, media_files, is_deleted
            FROM messages 
            {where_clause}
            ORDER BY timestamp ASC
            LIMIT ? OFFSET ?
        ''', params + [limit, offset])
        
        messages = []
        for row in cursor.fetchall():
            messages.append({
                'id': row['id'],
                'sender': row['sender'],
                'content': row['content'],
                'messageType': row['message_type'],
                'timestamp': row['timestamp'],
                'lineNumber': row['line_number'],
                'mediaFiles': json.loads(row['media_files']) if row['media_files'] else [],
                'isDeleted': bool(row['is_deleted'])
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'messages': messages,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total,
                    'totalPages': (total + limit - 1) // limit
                }
            }
        })
        
    except Exception as e:
        logger.error(f"메시지 조회 실패: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/participants/<chat_room_id>', methods=['GET'])
def get_participants(chat_room_id):
    """참여자별 통계"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT sender, 
                   COUNT(*) as message_count,
                   COUNT(CASE WHEN message_type = 'image' THEN 1 END) as image_count,
                   COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_count,
                   MIN(timestamp) as first_message,
                   MAX(timestamp) as last_message
            FROM messages 
            WHERE chat_room_id = ?
            GROUP BY sender
            ORDER BY message_count DESC
        ''', [chat_room_id])
        
        participants = []
        for row in cursor.fetchall():
            participants.append({
                'sender': row['sender'],
                'messageCount': row['message_count'],
                'imageCount': row['image_count'],
                'textCount': row['text_count'],
                'firstMessage': row['first_message'],
                'lastMessage': row['last_message']
            })
        
        conn.close()
        return jsonify({'success': True, 'data': participants})
        
    except Exception as e:
        logger.error(f"참여자 통계 조회 실패: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/media-files/<chat_room_id>', methods=['GET'])
def get_media_files(chat_room_id):
    """미디어 파일 목록"""
    try:
        file_type = request.args.get('type', 'all')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        where_clause = "WHERE chat_room_id = ?"
        params = [chat_room_id]
        
        if file_type != 'all':
            where_clause += " AND file_type = ?"
            params.append(file_type)
        
        cursor.execute(f'''
            SELECT id, original_path, classified_path, file_type, 
                   file_size, timestamp
            FROM media_files 
            {where_clause}
            ORDER BY timestamp DESC
        ''', params)
        
        media_files = []
        for row in cursor.fetchall():
            media_files.append({
                'id': row['id'],
                'originalPath': row['original_path'],
                'classifiedPath': row['classified_path'],
                'fileType': row['file_type'],
                'fileSize': row['file_size'],
                'timestamp': row['timestamp']
            })
        
        conn.close()
        return jsonify({'success': True, 'data': media_files})
        
    except Exception as e:
        logger.error(f"미디어 파일 조회 실패: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/search/<chat_room_id>', methods=['GET'])
def search_messages(chat_room_id):
    """메시지 검색"""
    try:
        query = request.args.get('q', '')
        sender = request.args.get('sender', '')
        
        if not query:
            return jsonify({'success': False, 'error': '검색어가 필요합니다'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        where_clause = "WHERE chat_room_id = ? AND content LIKE ?"
        params = [chat_room_id, f'%{query}%']
        
        if sender:
            where_clause += " AND sender = ?"
            params.append(sender)
        
        cursor.execute(f'''
            SELECT id, sender, content, message_type, timestamp, line_number
            FROM messages 
            {where_clause}
            ORDER BY timestamp ASC
            LIMIT 100
        ''', params)
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'id': row['id'],
                'sender': row['sender'],
                'content': row['content'],
                'messageType': row['message_type'],
                'timestamp': row['timestamp'],
                'lineNumber': row['line_number']
            })
        
        conn.close()
        return jsonify({'success': True, 'data': results})
        
    except Exception as e:
        logger.error(f"메시지 검색 실패: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """전체 통계"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 기본 통계
        cursor.execute('SELECT COUNT(*) as total FROM chat_rooms')
        total_rooms = cursor.fetchone()['total']
        
        cursor.execute('SELECT COUNT(*) as total FROM messages')
        total_messages = cursor.fetchone()['total']
        
        cursor.execute('SELECT COUNT(*) as total FROM media_files')
        total_media = cursor.fetchone()['total']
        
        cursor.execute('SELECT COUNT(DISTINCT sender) as total FROM messages')
        total_participants = cursor.fetchone()['total']
        
        # 메시지 타입별 통계
        cursor.execute('''
            SELECT message_type, COUNT(*) as count
            FROM messages
            GROUP BY message_type
        ''')
        message_types = {row['message_type']: row['count'] for row in cursor.fetchall()}
        
        # 미디어 타입별 통계
        cursor.execute('''
            SELECT file_type, COUNT(*) as count
            FROM media_files
            GROUP BY file_type
        ''')
        media_types = {row['file_type']: row['count'] for row in cursor.fetchall()}
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'totalRooms': total_rooms,
                'totalMessages': total_messages,
                'totalMediaFiles': total_media,
                'totalParticipants': total_participants,
                'messageTypes': message_types,
                'mediaTypes': media_types
            }
        })
        
    except Exception as e:
        logger.error(f"통계 조회 실패: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': DB_PATH
    })


if __name__ == '__main__':
    _p = int(os.environ.get("CHAT_DATABASE_API_PORT", os.environ.get("PORT", "8002")))
    logger.info(f"카카오톡 데이터베이스 API 서버 시작 (DB: {DB_PATH}, port={_p})")
    app.run(host='0.0.0.0', port=_p, debug=True) 