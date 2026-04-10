from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
import werkzeug

# 프로젝트 루트 경로 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from real_kakao_data_processor import RealKakaoDataProcessor

app = Flask(__name__)
CORS(app)

# 데이터 프로세서 초기화
processor = RealKakaoDataProcessor()

@app.route('/api/chat-rooms', methods=['GET'])
def get_chat_rooms():
    """모든 대화방 목록 조회"""
    try:
        rooms = processor.get_all_chat_rooms()
        return jsonify({
            'success': True,
            'data': rooms,
            'count': len(rooms)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/chat-rooms/<int:room_id>', methods=['GET'])
def get_chat_room(room_id):
    """특정 대화방 정보 조회"""
    try:
        room = processor.get_chat_room(room_id)
        if not room:
            return jsonify({
                'success': False,
                'error': '대화방을 찾을 수 없습니다.'
            }), 404
        
        return jsonify({
            'success': True,
            'data': room
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/chat-rooms/<int:room_id>/messages', methods=['GET'])
def get_messages(room_id):
    """대화방 메시지 조회 (교육 목적으로 제한 완전 해제)"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 1000000))  # 제한을 1000000으로 증가
        offset = (page - 1) * limit
        
        print(f"메시지 조회 요청: room_id={room_id}, page={page}, limit={limit}, offset={offset}")
        
        messages = processor.get_messages(room_id, limit, offset)
        print(f"조회된 메시지 개수: {len(messages)}개")
        
        # 전체 메시지 개수 조회
        conn = processor.get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM messages WHERE room_id = ?', (room_id,))
        total_count = cursor.fetchone()[0]
        conn.close()
        
        print(f"총 메시지 개수: {total_count}개")
        
        # 교육 목적으로 추가 정보 제공
        return jsonify({
            'success': True,
            'data': {
                'messages': messages,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total_count,
                    'has_next': offset + limit < total_count,
                    'has_prev': page > 1
                },
                'educational_info': {
                    'total_messages': total_count,
                    'current_batch': len(messages),
                    'processing_time': '즉시',
                    'data_source': '카카오톡 대화 대응',
                    'learning_enabled': True
                }
            }
        })
    except Exception as e:
        print(f"메시지 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/process-chat-files', methods=['POST'])
def process_chat_files():
    """대화 파일 처리"""
    try:
        processor.process_all_chat_files()
        return jsonify({
            'success': True,
            'message': '대화 파일 처리가 완료되었습니다.'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/upload-chat-file', methods=['POST'])
def upload_chat_file():
    """새로운 대화 파일 업로드 (중복 방지)"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': '파일이 업로드되지 않았습니다.'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '파일이 선택되지 않았습니다.'
            }), 400
        
        # 파일 확장자 확인
        if not file.filename.endswith('.txt'):
            return jsonify({
                'success': False,
                'error': '카카오톡 대화 파일(.txt)만 업로드 가능합니다.'
            }), 400
        
        # 업로드 디렉토리 생성
        upload_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # 파일 저장
        filename = werkzeug.utils.secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)
        
        # 파일 처리 (날짜/시간 기준 중복 방지 포함)
        room_id = processor.process_single_file(file_path)
        
        # 처리 결과에 따른 메시지 결정
        conn = processor.get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT room_name, participant_count, save_date FROM chat_rooms WHERE id = ?', (room_id,))
        room_info = cursor.fetchone()
        conn.close()
        
        if room_info:
            room_name, participant_count, save_date = room_info
            message = f"파일이 성공적으로 처리되었습니다.\n대화방: {room_name}\n참여자: {participant_count}명\n저장 날짜: {save_date}"
        else:
            message = "파일이 성공적으로 업로드되고 처리되었습니다."
        
        return jsonify({
            'success': True,
            'message': message,
            'data': {
                'room_id': room_id,
                'filename': filename,
                'file_path': file_path,
                'room_name': room_info[0] if room_info else None,
                'participant_count': room_info[1] if room_info else None,
                'save_date': room_info[2] if room_info else None
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/scan-chat-rooms', methods=['GET'])
def scan_chat_rooms():
    """대화방 폴더 스캔"""
    try:
        rooms = processor.scan_chat_rooms()
        return jsonify({
            'success': True,
            'data': rooms,
            'count': len(rooms)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """헬스 체크"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'message': 'Real Kakao API Server is running'
    })

if __name__ == '__main__':
    print("🚀 Real Kakao API Server 시작 중...")
    print("📁 대화방 폴더 스캔 중...")
    
    # 초기 스캔
    rooms = processor.scan_chat_rooms()
    print(f"📋 발견된 대화방: {len(rooms)}개")
    
    for room in rooms:
        print(f"  - {room['name']} ({room['size']} bytes)")
    
    _p = int(os.environ.get("REAL_KAKAO_API_PORT", os.environ.get("PORT", "8003")))
    print(f"🌐 API 서버 시작: http://localhost:{_p}")
    app.run(host='0.0.0.0', port=_p, debug=True) 