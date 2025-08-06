import os
import json
import logging
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from auto_learning_system import AutoLearningSystem

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# 파일 업로드 설정
UPLOAD_FOLDER = 'backend/uploads'
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif',
    'mp4', 'avi', 'mov', 'mp3', 'wav', 'aac'
}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB

# 자동 학습 시스템 초기화
auto_learning_system = AutoLearningSystem()

def allowed_file(filename):
    """허용된 파일 확장자 확인"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/analyze-and-learn', methods=['POST'])
def analyze_and_learn():
    """파일 업로드 및 자동 학습"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': '파일이 없습니다.'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '파일이 선택되지 않았습니다.'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': '지원하지 않는 파일 형식입니다.'
            }), 400
        
        # 프로젝트 ID와 채팅 ID 가져오기
        project_id = request.form.get('projectId', '')
        chat_id = request.form.get('chatId', '')
        
        # 파일 저장
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # 디렉토리가 없으면 생성
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        file.save(file_path)
        
        # 자동 학습 시스템에 전달
        result = auto_learning_system.process_uploaded_file(
            file_path, project_id, chat_id
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'file_id': result['file_id'],
                'message': result['message'],
                'file_path': file_path,
                'project_id': project_id,
                'chat_id': chat_id
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
            
    except Exception as e:
        logger.error(f"파일 업로드 및 학습 실패: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/learning-progress/<int:file_id>', methods=['GET'])
def get_learning_progress(file_id):
    """학습 진행 상황 조회"""
    try:
        progress = auto_learning_system.get_learning_progress(file_id)
        return jsonify({
            'success': True,
            'file_id': file_id,
            'progress': progress
        })
    except Exception as e:
        logger.error(f"학습 진행 상황 조회 실패: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/knowledge-base-summary', methods=['GET'])
def get_knowledge_base_summary():
    """지식 베이스 요약 조회"""
    try:
        summary = auto_learning_system.get_knowledge_base_summary()
        return jsonify({
            'success': True,
            'summary': summary
        })
    except Exception as e:
        logger.error(f"지식 베이스 요약 조회 실패: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/uploaded-files', methods=['GET'])
def get_uploaded_files():
    """업로드된 파일 목록 조회"""
    try:
        project_id = request.args.get('project_id')
        chat_id = request.args.get('chat_id')
        
        # 데이터베이스에서 파일 목록 조회
        conn = auto_learning_system.db_path
        import sqlite3
        conn = sqlite3.connect(conn)
        cursor = conn.cursor()
        
        if project_id and chat_id:
            cursor.execute("""
                SELECT id, file_name, file_type, file_size, upload_time,
                       processing_status, analysis_complete, learning_complete
                FROM uploaded_files 
                WHERE project_id = ? AND chat_id = ?
                ORDER BY upload_time DESC
            """, (project_id, chat_id))
        elif project_id:
            cursor.execute("""
                SELECT id, file_name, file_type, file_size, upload_time,
                       processing_status, analysis_complete, learning_complete
                FROM uploaded_files 
                WHERE project_id = ?
                ORDER BY upload_time DESC
            """, (project_id,))
        else:
            cursor.execute("""
                SELECT id, file_name, file_type, file_size, upload_time,
                       processing_status, analysis_complete, learning_complete
                FROM uploaded_files 
                ORDER BY upload_time DESC
            """)
        
        files = []
        for row in cursor.fetchall():
            files.append({
                'id': row[0],
                'file_name': row[1],
                'file_type': row[2],
                'file_size': row[3],
                'upload_time': row[4],
                'processing_status': row[5],
                'analysis_complete': bool(row[6]),
                'learning_complete': bool(row[7])
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'files': files
        })
        
    except Exception as e:
        logger.error(f"업로드된 파일 목록 조회 실패: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analysis-results/<int:file_id>', methods=['GET'])
def get_analysis_results(file_id):
    """파일 분석 결과 조회"""
    try:
        # 데이터베이스에서 분석 결과 조회
        conn = sqlite3.connect(auto_learning_system.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT analysis_type, result_data, confidence, processing_time
            FROM analysis_results 
            WHERE file_id = ?
            ORDER BY created_time DESC
        """, (file_id,))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                'analysis_type': row[0],
                'result_data': json.loads(row[1]) if row[1] else {},
                'confidence': row[2],
                'processing_time': row[3]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'file_id': file_id,
            'results': results
        })
        
    except Exception as e:
        logger.error(f"분석 결과 조회 실패: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/knowledge-base/<int:file_id>', methods=['GET'])
def get_knowledge_base(file_id):
    """지식 베이스 조회"""
    try:
        # 데이터베이스에서 지식 베이스 조회
        conn = sqlite3.connect(auto_learning_system.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT content_type, content, keywords, topics, sentiment, confidence
            FROM knowledge_base 
            WHERE file_id = ?
            ORDER BY created_time DESC
        """, (file_id,))
        
        knowledge_items = []
        for row in cursor.fetchall():
            knowledge_items.append({
                'content_type': row[0],
                'content': row[1],
                'keywords': json.loads(row[2]) if row[2] else [],
                'topics': json.loads(row[3]) if row[3] else [],
                'sentiment': row[4],
                'confidence': row[5]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'file_id': file_id,
            'knowledge_items': knowledge_items
        })
        
    except Exception as e:
        logger.error(f"지식 베이스 조회 실패: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ai-models', methods=['GET'])
def get_ai_models():
    """AI 모델 목록 조회"""
    try:
        # 데이터베이스에서 AI 모델 조회
        conn = sqlite3.connect(auto_learning_system.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT model_name, model_type, accuracy, training_data_count, last_updated
            FROM ai_models 
            WHERE is_active = 1
            ORDER BY last_updated DESC
        """)
        
        models = []
        for row in cursor.fetchall():
            models.append({
                'model_name': row[0],
                'model_type': row[1],
                'accuracy': row[2],
                'training_data_count': row[3],
                'last_updated': row[4]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'models': models
        })
        
    except Exception as e:
        logger.error(f"AI 모델 목록 조회 실패: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/deep-learning-models', methods=['GET'])
def get_deep_learning_models():
    """딥러닝 모델 목록 조회"""
    try:
        # 데이터베이스에서 딥러닝 모델 조회
        conn = sqlite3.connect(auto_learning_system.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT model_name, model_type, architecture, training_metrics, validation_metrics
            FROM deep_learning_models 
            WHERE is_active = 1
            ORDER BY created_time DESC
        """)
        
        models = []
        for row in cursor.fetchall():
            models.append({
                'model_name': row[0],
                'model_type': row[1],
                'architecture': row[2],
                'training_metrics': json.loads(row[3]) if row[3] else {},
                'validation_metrics': json.loads(row[4]) if row[4] else {}
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'models': models
        })
        
    except Exception as e:
        logger.error(f"딥러닝 모델 목록 조회 실패: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # 업로드 디렉토리 생성
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    app.run(debug=True, host='0.0.0.0', port=5001)
