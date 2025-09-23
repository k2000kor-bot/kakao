#!/usr/bin/env python3
"""
고급 코드 관리 시스템
긴 코드를 효율적으로 관리하고 편집할 수 있는 고급 도구
"""

import os
import json
import re
import shutil
import difflib
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime
import ast
import subprocess

class AdvancedCodeManager:
    def __init__(self, project_root: str = "/Users/aD/kakao-frontend"):
        self.project_root = project_root
        self.backup_dir = os.path.join(project_root, "code_backups")
        self.config_file = os.path.join(project_root, "code_manager_config.json")
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
                "max_backups": 20,
                "backup_interval": 300,
                "excluded_files": [".git", "node_modules", "__pycache__", ".DS_Store"],
                "watched_files": ["src/App.tsx", "src/App.js", "app.py"],
                "code_templates": {
                    "react_component": "react_component_template",
                    "react_hook": "react_hook_template",
                    "api_endpoint": "api_endpoint_template"
                },
                "linting_rules": {
                    "max_line_length": 120,
                    "indent_size": 2,
                    "trailing_whitespace": False
                }
            }
            self.save_config()
    
    def save_config(self):
        """설정 파일 저장"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
    
    def create_backup(self, file_path: str, description: str = "") -> str:
        """파일 백업 생성"""
        if not os.path.exists(file_path):
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.basename(file_path)
        backup_filename = f"{filename}_{timestamp}.backup"
        backup_path = os.path.join(self.backup_dir, backup_filename)
        
        shutil.copy2(file_path, backup_path)
        
        # 백업 메타데이터 저장
        metadata = {
            "original_path": file_path,
            "backup_path": backup_path,
            "timestamp": timestamp,
            "description": description,
            "size": os.path.getsize(file_path)
        }
        
        metadata_file = backup_path + ".meta"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        return backup_path
    
    def smart_code_replace(self, file_path: str, old_code: str, new_code: str, 
                          context_lines: int = 3) -> Dict:
        """
        스마트 코드 교체 - 컨텍스트를 고려한 안전한 교체
        """
        if not os.path.exists(file_path):
            return {"success": False, "error": "파일이 존재하지 않습니다"}
        
        # 백업 생성
        backup_path = self.create_backup(file_path, f"교체 전: {old_code[:50]}...")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 정확한 매치 찾기
            if old_code in content:
                new_content = content.replace(old_code, new_code)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                return {
                    "success": True,
                    "backup_path": backup_path,
                    "changes": 1,
                    "message": "교체가 성공적으로 완료되었습니다",
                    "diff": self.generate_diff(old_code, new_code)
                }
            else:
                # 부분 매치 찾기
                lines = content.split('\n')
                old_lines = old_code.split('\n')
                
                for i in range(len(lines) - len(old_lines) + 1):
                    if lines[i:i+len(old_lines)] == old_lines:
                        lines[i:i+len(old_lines)] = new_code.split('\n')
                        new_content = '\n'.join(lines)
                        
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        
                        return {
                            "success": True,
                            "backup_path": backup_path,
                            "changes": 1,
                            "message": f"라인 {i+1}부터 교체가 완료되었습니다",
                            "diff": self.generate_diff(old_code, new_code)
                        }
                
                return {
                    "success": False,
                    "error": "매치되는 내용을 찾을 수 없습니다",
                    "suggestions": self.find_similar_code(content, old_code)
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
    
    def find_similar_code(self, content: str, target: str) -> List[Dict]:
        """유사한 코드 찾기"""
        lines = content.split('\n')
        target_lines = target.split('\n')
        
        suggestions = []
        for i in range(len(lines) - len(target_lines) + 1):
            similarity = difflib.SequenceMatcher(None, lines[i:i+len(target_lines)], target_lines).ratio()
            if similarity > 0.7:
                suggestions.append({
                    "line_start": i + 1,
                    "similarity": similarity,
                    "content": '\n'.join(lines[i:i+len(target_lines)]),
                    "context": '\n'.join(lines[max(0, i-2):i+len(target_lines)+2])
                })
        
        return suggestions[:5]  # 상위 5개만 반환
    
    def generate_diff(self, old_code: str, new_code: str) -> str:
        """코드 차이점 생성"""
        old_lines = old_code.splitlines(keepends=True)
        new_lines = new_code.splitlines(keepends=True)
        
        diff = difflib.unified_diff(
            old_lines, new_lines,
            fromfile='old', tofile='new',
            lineterm=''
        )
        
        return '\n'.join(diff)
    
    def refactor_function(self, file_path: str, function_name: str, 
                         new_function_code: str) -> Dict:
        """함수 리팩토링"""
        if not os.path.exists(file_path):
            return {"success": False, "error": "파일이 존재하지 않습니다"}
        
        backup_path = self.create_backup(file_path, f"함수 리팩토링: {function_name}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 함수 찾기 및 교체
            function_pattern = rf'(function\s+{function_name}\s*\([^)]*\)\s*{{[^}}]*}})'
            match = re.search(function_pattern, content, re.DOTALL)
            
            if match:
                old_function = match.group(1)
                new_content = content.replace(old_function, new_function_code)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                return {
                    "success": True,
                    "backup_path": backup_path,
                    "function_name": function_name,
                    "message": f"함수 '{function_name}'이 리팩토링되었습니다",
                    "diff": self.generate_diff(old_function, new_function_code)
                }
            else:
                return {
                    "success": False,
                    "error": f"함수 '{function_name}'을 찾을 수 없습니다"
                }
        
        except Exception as e:
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, file_path)
            
            return {
                "success": False,
                "error": f"리팩토링 중 오류 발생: {str(e)}",
                "restored_from_backup": True
            }
    
    def extract_component(self, file_path: str, component_name: str, 
                         start_line: int, end_line: int) -> Dict:
        """컴포넌트 추출"""
        if not os.path.exists(file_path):
            return {"success": False, "error": "파일이 존재하지 않습니다"}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if start_line < 1 or end_line > len(lines) or start_line > end_line:
                return {"success": False, "error": "잘못된 라인 범위입니다"}
            
            # 컴포넌트 코드 추출
            component_lines = lines[start_line-1:end_line]
            component_code = ''.join(component_lines)
            
            # 새 파일 생성
            new_file_path = os.path.join(os.path.dirname(file_path), f"{component_name}.jsx")
            
            # React 컴포넌트 템플릿 적용
            template = f"""import React from 'react';
import './{component_name}.css';

const {component_name} = () => {{
{component_code}
}};

export default {component_name};"""
            
            with open(new_file_path, 'w', encoding='utf-8') as f:
                f.write(template)
            
            # 원본 파일에서 컴포넌트 제거
            backup_path = self.create_backup(file_path, f"컴포넌트 추출: {component_name}")
            
            new_lines = lines[:start_line-1] + lines[end_line:]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(''.join(new_lines))
            
            return {
                "success": True,
                "backup_path": backup_path,
                "new_file": new_file_path,
                "component_name": component_name,
                "message": f"컴포넌트 '{component_name}'이 추출되었습니다"
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"컴포넌트 추출 중 오류 발생: {str(e)}"
            }
    
    def merge_files(self, file_paths: List[str], output_path: str) -> Dict:
        """여러 파일을 하나로 병합"""
        try:
            merged_content = []
            
            for file_path in file_paths:
                if not os.path.exists(file_path):
                    return {"success": False, "error": f"파일이 존재하지 않습니다: {file_path}"}
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                merged_content.append(f"// === {os.path.basename(file_path)} ===\n")
                merged_content.append(content)
                merged_content.append("\n\n")
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(''.join(merged_content))
            
            return {
                "success": True,
                "output_path": output_path,
                "merged_files": len(file_paths),
                "message": f"{len(file_paths)}개 파일이 병합되었습니다"
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"파일 병합 중 오류 발생: {str(e)}"
            }
    
    def split_large_file(self, file_path: str, max_lines: int = 500) -> Dict:
        """큰 파일을 여러 파일로 분할"""
        if not os.path.exists(file_path):
            return {"success": False, "error": "파일이 존재하지 않습니다"}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if len(lines) <= max_lines:
                return {"success": False, "error": "파일이 분할할 만큼 크지 않습니다"}
            
            # 파일 분할
            base_name = os.path.splitext(file_path)[0]
            extension = os.path.splitext(file_path)[1]
            
            split_files = []
            for i in range(0, len(lines), max_lines):
                chunk_lines = lines[i:i+max_lines]
                chunk_file = f"{base_name}_part_{i//max_lines + 1}{extension}"
                
                with open(chunk_file, 'w', encoding='utf-8') as f:
                    f.writelines(chunk_lines)
                
                split_files.append(chunk_file)
            
            return {
                "success": True,
                "original_file": file_path,
                "split_files": split_files,
                "total_parts": len(split_files),
                "message": f"파일이 {len(split_files)}개 부분으로 분할되었습니다"
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"파일 분할 중 오류 발생: {str(e)}"
            }
    
    def analyze_code_quality(self, file_path: str) -> Dict:
        """코드 품질 분석"""
        if not os.path.exists(file_path):
            return {"success": False, "error": "파일이 존재하지 않습니다"}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.split('\n')
            
            analysis = {
                "file_size": len(content),
                "line_count": len(lines),
                "functions": [],
                "classes": [],
                "imports": [],
                "complexity_score": 0,
                "quality_issues": [],
                "suggestions": []
            }
            
            # 함수 찾기
            for i, line in enumerate(lines):
                if re.match(r'^\s*function\s+\w+', line) or re.match(r'^\s*const\s+\w+\s*=\s*\(', line):
                    match = re.search(r'(\w+)', line)
                    analysis["functions"].append({
                        "line": i + 1,
                        "name": match.group(1) if match else 'unknown'
                    })
            
            # 클래스 찾기
            for i, line in enumerate(lines):
                if re.match(r'^\s*class\s+\w+', line):
                    match = re.search(r'class\s+(\w+)', line)
                    if match:
                        analysis["classes"].append({
                            "line": i + 1,
                            "name": match.group(1)
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
            
            # 품질 이슈 검사
            for i, line in enumerate(lines):
                # 긴 라인 검사
                if len(line) > self.config["linting_rules"]["max_line_length"]:
                    analysis["quality_issues"].append({
                        "type": "long_line",
                        "line": i + 1,
                        "message": f"라인이 {len(line)}자로 너무 깁니다 (권장: {self.config['linting_rules']['max_line_length']}자)"
                    })
                
                # 후행 공백 검사
                if self.config["linting_rules"]["trailing_whitespace"] and line.endswith(' '):
                    analysis["quality_issues"].append({
                        "type": "trailing_whitespace",
                        "line": i + 1,
                        "message": "라인 끝에 불필요한 공백이 있습니다"
                    })
            
            # 제안사항 생성
            if analysis["complexity_score"] > 10:
                analysis["suggestions"].append("복잡도가 높습니다. 함수나 클래스를 분리하는 것을 고려하세요.")
            
            if len(analysis["functions"]) > 20:
                analysis["suggestions"].append("함수가 너무 많습니다. 파일을 분할하는 것을 고려하세요.")
            
            return {
                "success": True,
                "analysis": analysis
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"코드 품질 분석 중 오류 발생: {str(e)}"
            }
    
    def auto_format_code(self, file_path: str) -> Dict:
        """코드 자동 포맷팅"""
        if not os.path.exists(file_path):
            return {"success": False, "error": "파일이 존재하지 않습니다"}
        
        backup_path = self.create_backup(file_path, "자동 포맷팅 전")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.split('\n')
            formatted_lines = []
            
            for line in lines:
                # 후행 공백 제거
                if self.config["linting_rules"]["trailing_whitespace"]:
                    line = line.rstrip()
                
                # 탭을 공백으로 변환
                indent_size = self.config["linting_rules"]["indent_size"]
                line = line.expandtabs(indent_size)
                
                formatted_lines.append(line)
            
            formatted_content = '\n'.join(formatted_lines)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(formatted_content)
            
            return {
                "success": True,
                "backup_path": backup_path,
                "message": "코드가 자동 포맷팅되었습니다",
                "changes": content != formatted_content
            }
        
        except Exception as e:
            if backup_path and os.path.exists(backup_path):
                shutil.copy2(backup_path, file_path)
            
            return {
                "success": False,
                "error": f"자동 포맷팅 중 오류 발생: {str(e)}",
                "restored_from_backup": True
            }

# 사용 예시
if __name__ == "__main__":
    manager = AdvancedCodeManager()
    
    # 파일 분석
    analysis = manager.analyze_code_quality("src/App.tsx")
    print("코드 품질 분석 결과:")
    print(json.dumps(analysis, indent=2, ensure_ascii=False))
    
    # 백업 목록 조회
    backups = os.listdir(manager.backup_dir)
    print(f"\n백업 파일 {len(backups)}개:")
    for backup in backups[:5]:
        print(f"- {backup}")
