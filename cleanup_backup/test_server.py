from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import os
import json
import uuid
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# 프로젝트 데이터 저장소 (실제 환경에서는 데이터베이스 사용)
projects_db = {}
project_files_db = {}

@app.route('/')
def home():
    """modern_chat_interface.html 파일을 서빙"""
    return send_from_directory(os.getcwd(), 'modern_chat_interface.html')

@app.route('/api/health')
def health():
    return jsonify({
        "service": "CORBU.AI Test Server",
        "status": "healthy",
        "version": "2.0.0"
    })

# 프로젝트 관련 API
@app.route('/api/projects', methods=['GET'])
def get_projects():
    """프로젝트 목록 조회"""
    try:
        projects = []
        for project_id, project_data in projects_db.items():
            projects.append({
                'id': project_id,
                'name': project_data['name'],
                'description': project_data.get('description', ''),
                'created_at': project_data['created_at'],
                'updated_at': project_data['updated_at'],
                'file_count': len(project_files_db.get(project_id, [])),
                'guidelines_count': len(project_data.get('guidelines', []))
            })
        
        return jsonify({
            'success': True,
            'projects': projects,
            'total_count': len(projects)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects', methods=['POST'])
def create_project():
    """새 프로젝트 생성"""
    try:
        data = request.get_json()
        project_name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        
        if not project_name:
            return jsonify({'success': False, 'error': '프로젝트 이름이 필요합니다.'}), 400
        
        # 중복 이름 확인
        for project_data in projects_db.values():
            if project_data['name'] == project_name:
                return jsonify({'success': False, 'error': '이미 존재하는 프로젝트 이름입니다.'}), 400
        
        project_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        projects_db[project_id] = {
            'id': project_id,
            'name': project_name,
            'description': description,
            'created_at': now,
            'updated_at': now,
            'guidelines': []
        }
        
        project_files_db[project_id] = []
        
        return jsonify({
            'success': True,
            'project': {
                'id': project_id,
                'name': project_name,
                'description': description,
                'created_at': now,
                'updated_at': now,
                'file_count': 0,
                'guidelines_count': 0
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """특정 프로젝트 조회"""
    try:
        if project_id not in projects_db:
            return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        project_data = projects_db[project_id]
        files = project_files_db.get(project_id, [])
        
        return jsonify({
            'success': True,
            'project': {
                'id': project_id,
                'name': project_data['name'],
                'description': project_data.get('description', ''),
                'created_at': project_data['created_at'],
                'updated_at': project_data['updated_at'],
                'guidelines': project_data.get('guidelines', []),
                'files': files
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>/files', methods=['POST'])
def upload_project_file():
    """프로젝트에 파일 업로드"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': '파일이 제공되지 않았습니다.'}), 400
        
        file = request.files['file']
        project_id = request.form.get('project_id')
        
        if not project_id or project_id not in projects_db:
            return jsonify({'success': False, 'error': '유효하지 않은 프로젝트 ID입니다.'}), 400
        
        if file.filename == '':
            return jsonify({'success': False, 'error': '파일이 선택되지 않았습니다.'}), 400
        
        # 파일 내용 읽기
        try:
            content = file.read().decode('utf-8', errors='ignore')
        except Exception as e:
            return jsonify({'success': False, 'error': f'파일 읽기 오류: {str(e)}'}), 400
        
        file_id = str(uuid.uuid4())
        file_data = {
            'id': file_id,
            'name': file.filename,
            'size': len(content),
            'content': content,
            'uploaded_at': datetime.now().isoformat(),
            'type': file.filename.split('.')[-1].lower() if '.' in file.filename else 'unknown'
        }
        
        project_files_db[project_id].append(file_data)
        
        # 프로젝트 업데이트 시간 갱신
        projects_db[project_id]['updated_at'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'file': file_data,
            'message': f'파일 "{file.filename}"이 프로젝트에 추가되었습니다.'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>/guidelines', methods=['POST'])
def add_guideline():
    """프로젝트에 지침 추가"""
    try:
        data = request.get_json()
        guideline_text = data.get('guideline', '').strip()
        
        if not guideline_text:
            return jsonify({'success': False, 'error': '지침 내용이 필요합니다.'}), 400
        
        if project_id not in projects_db:
            return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        guideline_id = str(uuid.uuid4())
        guideline_data = {
            'id': guideline_id,
            'text': guideline_text,
            'created_at': datetime.now().isoformat()
        }
        
        projects_db[project_id]['guidelines'].append(guideline_data)
        projects_db[project_id]['updated_at'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'guideline': guideline_data,
            'message': '지침이 추가되었습니다.'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/projects/<project_id>/guidelines/<guideline_id>', methods=['DELETE'])
def delete_guideline(project_id, guideline_id):
    """프로젝트 지침 삭제"""
    try:
        if project_id not in projects_db:
            return jsonify({'success': False, 'error': '프로젝트를 찾을 수 없습니다.'}), 404
        
        guidelines = projects_db[project_id]['guidelines']
        for i, guideline in enumerate(guidelines):
            if guideline['id'] == guideline_id:
                del guidelines[i]
                projects_db[project_id]['updated_at'] = datetime.now().isoformat()
                return jsonify({
                    'success': True,
                    'message': '지침이 삭제되었습니다.'
                })
        
        return jsonify({'success': False, 'error': '지침을 찾을 수 없습니다.'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 테스트 서버를 시작합니다...")
    app.run(host='0.0.0.0', port=3000, debug=True)