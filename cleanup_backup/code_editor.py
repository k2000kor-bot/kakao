#!/usr/bin/env python3
"""
고급 코드 편집 및 관리 시스템
긴 코드를 효율적으로 편집, 수정, 관리할 수 있는 도구
"""

import os
import json
import re
import shutil
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import difflib

class AdvancedCodeEditor:
    def __init__(self, project_root: str = "/Users/aD/kakao-frontend"):
        self.project_root = project_root
        self.backup_dir = os.path.join(project_root, "code_backups")
        self.config_file = os.path.join(project_root, "code_editor_config.json")
        self.ensure_backup_dir()
        self.load_config()
    
    def ensure_backup_dir(self):
        """백업 디렉토리 생성"""
        if not os.path.exists(self.backup_dir):
            os.makedirs(self.backup_dir)
    
    def load_config(self):
        """설정 파일 로드"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
        else:
            self.config = {
                "auto_backup": True,
                "max_backups": 10,
                "backup_interval": 300,  # 5분
                "excluded_files": [".git", "node_modules", "__pycache__"],
                "watched_files": ["src/App.tsx", "src/App.js", "app.py"]
            }
            self.save_config()
    
    def save_config(self):
        """설정 파일 저장"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
    
    def create_backup(self, file_path: str) -> str:
        """파일 백업 생성"""
        if not os.path.exists(file_path):
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.basename(file_path)
        backup_filename = f"{filename}_{timestamp}.backup"
        backup_path = os.path.join(self.backup_dir, backup_filename)
        
        shutil.copy2(file_path, backup_path)
        return backup_path
    
    def smart_replace(self, file_path: str, old_content: str, new_content: str, 
                     context_lines: int = 3) -> Dict:
        """
        스마트 교체 기능 - 컨텍스트를 고려한 안전한 교체
        """
        if not os.path.exists(file_path):
            return {"success": False, "error": "파일이 존재하지 않습니다"}
        
        # 백업 생성
        backup_path = self.create_backup(file_path)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 정확한 매치 찾기
            if old_content in content:
                new_file_content = content.replace(old_content, new_content)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_file_content)
                
                return {
                    "success": True,
                    "backup_path": backup_path,
                    "changes": 1,
                    "message": "교체가 성공적으로 완료되었습니다"
                }
            else:
                # 부분 매치 찾기
                lines = content.split('\n')
                old_lines = old_content.split('\n')
                
                for i in range(len(lines) - len(old_lines) + 1):
                    if lines[i:i+len(old_lines)] == old_lines:
                        lines[i:i+len(old_lines)] = new_content.split('\n')
                        new_file_content = '\n'.join(lines)
                        
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_file_content)
                        
                        return {
                            "success": True,
                            "backup_path": backup_path,
                            "changes": 1,
                            "message": f"라인 {i+1}부터 교체가 완료되었습니다"
                        }
                
                return {
                    "success": False,
                    "error": "매치되는 내용을 찾을 수 없습니다",
                    "suggestions": self.find_similar_content(content, old_content)
                }
        
        except Exception as e:
            # 백업에서 복원
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, file_path)
            
            return {
                "success": False,
                "error": f"교체 중 오류 발생: {str(e)}",
                "restored_from_backup": True
            }
    
    def find_similar_content(self, content: str, target: str) -> List[str]:
        """유사한 내용 찾기"""
        lines = content.split('\n')
        target_lines = target.split('\n')
        
        suggestions = []
        for i in range(len(lines) - len(target_lines) + 1):
            similarity = difflib.SequenceMatcher(None, lines[i:i+len(target_lines)], target_lines).ratio()
            if similarity > 0.7:
                suggestions.append({
                    "line_start": i + 1,
                    "similarity": similarity,
                    "content": '\n'.join(lines[i:i+len(target_lines)])
                })
        
        return suggestions[:5]  # 상위 5개만 반환
    
    def multi_edit(self, file_path: str, edits: List[Dict]) -> Dict:
        """
        다중 편집 기능 - 여러 변경사항을 한 번에 적용
        """
        if not os.path.exists(file_path):
            return {"success": False, "error": "파일이 존재하지 않습니다"}
        
        backup_path = self.create_backup(file_path)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            results = []
            for edit in edits:
                edit_type = edit.get('type', 'replace')
                
                if edit_type == 'replace':
                    result = self.smart_replace(file_path, edit['old'], edit['new'])
                    results.append(result)
                elif edit_type == 'insert':
                    # 특정 위치에 내용 삽입
                    insert_pos = edit.get('position', 0)
                    content = content[:insert_pos] + edit['content'] + content[insert_pos:]
                elif edit_type == 'delete':
                    # 특정 내용 삭제
                    content = content.replace(edit['content'], '')
            
            # 모든 편집이 성공한 경우에만 파일 저장
            if all(result.get('success', False) for result in results):
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                return {
                    "success": True,
                    "backup_path": backup_path,
                    "results": results,
                    "message": f"{len(edits)}개의 편집이 완료되었습니다"
                }
            else:
                return {
                    "success": False,
                    "error": "일부 편집이 실패했습니다",
                    "results": results
                }
        
        except Exception as e:
            # 백업에서 복원
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, file_path)
            
            return {
                "success": False,
                "error": f"편집 중 오류 발생: {str(e)}",
                "restored_from_backup": True
            }
    
    def analyze_file_structure(self, file_path: str) -> Dict:
        """파일 구조 분석"""
        if not os.path.exists(file_path):
            return {"error": "파일이 존재하지 않습니다"}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        analysis = {
            "file_size": len(content),
            "line_count": len(content.split('\n')),
            "functions": [],
            "classes": [],
            "imports": [],
            "complexity_score": 0
        }
        
        lines = content.split('\n')
        
        # 함수 찾기
        for i, line in enumerate(lines):
            if re.match(r'^\s*function\s+\w+', line) or re.match(r'^\s*const\s+\w+\s*=\s*\(', line):
                analysis["functions"].append({
                    "line": i + 1,
                    "name": re.search(r'(\w+)', line).group(1) if re.search(r'(\w+)', line) else "unknown"
                })
        
        # 클래스 찾기
        for i, line in enumerate(lines):
            if re.match(r'^\s*class\s+\w+', line):
                analysis["classes"].append({
                    "line": i + 1,
                    "name": re.search(r'class\s+(\w+)', line).group(1)
                })
        
        # import 찾기
        for i, line in enumerate(lines):
            if line.strip().startswith('import '):
                analysis["imports"].append({
                    "line": i + 1,
                    "statement": line.strip()
                })
        
        # 복잡도 점수 계산
        analysis["complexity_score"] = len(analysis["functions"]) + len(analysis["classes"]) * 2
        
        return analysis
    
    def generate_code_template(self, template_type: str, **kwargs) -> str:
        """코드 템플릿 생성"""
        templates = {
            "react_component": """
import React, {{ useState, useEffect }} from 'react';

const {component_name} = () => {{
  const [state, setState] = useState(null);
  
  useEffect(() => {{
    // 초기화 로직
  }}, []);
  
  return (
    <div className="{component_name.lower()}">
      <h1>{component_name}</h1>
      {/* 컴포넌트 내용 */}
    </div>
  );
}};

export default {component_name};
""",
            "react_hook": """
import {{ useState, useEffect }} from 'react';

const use{hook_name} = () => {{
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {{
    // 훅 로직
  }}, []);
  
  return {{ data, loading, error }};
}};

export default use{hook_name};
""",
            "api_endpoint": """
@app.route('/api/{endpoint_name}', methods=['POST'])
def {endpoint_name}():
    try:
        data = request.get_json()
        
        # 엔드포인트 로직
        
        return jsonify({{
            'success': True,
            'data': result
        }})
    except Exception as e:
        logger.error(f"{endpoint_name} 오류: {{e}}")
        return jsonify({{
            'success': False,
            'error': str(e)
        }}), 500
"""
        }
        
        template = templates.get(template_type, "")
        return template.format(**kwargs)
    
    def restore_from_backup(self, file_path: str, backup_filename: str) -> Dict:
        """백업에서 복원"""
        backup_path = os.path.join(self.backup_dir, backup_filename)
        
        if not os.path.exists(backup_path):
            return {"success": False, "error": "백업 파일이 존재하지 않습니다"}
        
        try:
            shutil.copy2(backup_path, file_path)
            return {
                "success": True,
                "message": f"{backup_filename}에서 복원되었습니다"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"복원 중 오류 발생: {str(e)}"
            }
    
    def list_backups(self, file_path: str = None) -> List[Dict]:
        """백업 목록 조회"""
        backups = []
        
        for filename in os.listdir(self.backup_dir):
            if filename.endswith('.backup'):
                backup_path = os.path.join(self.backup_dir, filename)
                stat = os.stat(backup_path)
                
                backups.append({
                    "filename": filename,
                    "size": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_ctime).strftime("%Y-%m-%d %H:%M:%S"),
                    "path": backup_path
                })
        
        # 생성 시간순으로 정렬
        backups.sort(key=lambda x: x["created"], reverse=True)
        
        if file_path:
            filename = os.path.basename(file_path)
            backups = [b for b in backups if b["filename"].startswith(filename)]
        
        return backups

# 사용 예시
if __name__ == "__main__":
    editor = AdvancedCodeEditor()
    
    # 파일 구조 분석
    analysis = editor.analyze_file_structure("src/App.tsx")
    print("파일 분석 결과:")
    print(json.dumps(analysis, indent=2, ensure_ascii=False))
    
    # 백업 목록 조회
    backups = editor.list_backups("src/App.tsx")
    print(f"\n백업 파일 {len(backups)}개:")
    for backup in backups[:5]:
        print(f"- {backup['filename']} ({backup['created']})")
