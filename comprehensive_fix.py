#!/usr/bin/env python3
"""
포괄적인 린터 오류 해결 스크립트
"""

import re

def comprehensive_fix(filename):
    """파일의 모든 린터 오류를 포괄적으로 해결합니다."""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. 줄 끝의 공백 제거
    content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)
    
    # 2. 긴 줄들을 자동으로 나누기
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        if len(line) > 79:
            # 문자열 리터럴인 경우
            if '"' in line and ('content"' in line or 'title"' in line):
                indent = len(line) - len(line.lstrip())
                indent_str = ' ' * indent
                
                # 문자열 내용을 적절히 나누기
                if line.strip().endswith('",'):
                    # 문자열 부분 추출
                    parts = line.split('"')
                    if len(parts) >= 3:
                        prefix = parts[0] + '"'
                        text = parts[1]
                        suffix = '"' + '"'.join(parts[2:])
                        
                        # 텍스트를 적절한 길이로 나누기
                        words = text.split()
                        current_line = prefix
                        
                        for word in words:
                            if len(current_line + ' ' + word) > 76:  # 여유분 고려
                                current_line += '"'
                                fixed_lines.append(current_line + '\n')
                                current_line = indent_str + '"' + word
                            else:
                                if current_line.endswith('"'):
                                    current_line += ' ' + word
                                else:
                                    current_line += ' ' + word
                        
                        current_line += suffix
                        fixed_lines.append(current_line + '\n')
                    else:
                        fixed_lines.append(line + '\n')
                else:
                    fixed_lines.append(line + '\n')
            else:
                # 일반 줄인 경우
                fixed_lines.append(line + '\n')
        else:
            fixed_lines.append(line + '\n')
    
    content = ''.join(fixed_lines)
    
    # 3. 함수 정의 후 2개 빈 줄 확보
    content = re.sub(r'(def \w+\([^)]*\):)\n\n([^\n])', r'\1\n\n\n\2', content)
    content = re.sub(r'(class \w+[^:]*:)\n\n([^\n])', r'\1\n\n\n\2', content)
    
    # 4. 연속된 빈 줄 정리
    content = re.sub(r'\n\s*\n\s*\n\s*\n+', '\n\n\n', content)
    
    # 5. 마지막 줄 정리
    content = content.rstrip() + '\n'
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"포괄적인 린터 오류 해결 완료: {filename}")

if __name__ == "__main__":
    comprehensive_fix('/Users/aD/kakao-frontend/deep_learning_yoo_system.py')
