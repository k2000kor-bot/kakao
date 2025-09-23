#!/usr/bin/env python3
"""
긴 줄들을 자동으로 수정하는 스크립트
"""

import re

def fix_long_lines(filename):
    """파일의 긴 줄들을 수정합니다."""
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    
    for line in lines:
        if len(line.rstrip()) > 79:
            # 문자열 리터럴인 경우
            if '"' in line and line.strip().startswith('"'):
                indent = len(line) - len(line.lstrip())
                indent_str = ' ' * indent
                
                # 문자열 내용 추출
                if line.strip().endswith('",'):
                    content_part = line.strip()[:-2]  # 마지막 ", 제거
                    if content_part.startswith('"') and content_part.endswith('"'):
                        text = content_part[1:-1]  # 따옴표 제거
                        words = text.split()
                        
                        current_line = indent_str + '"'
                        for word in words:
                            if len(current_line + ' ' + word + '"') > 79:
                                current_line += '"'
                                fixed_lines.append(current_line + '\n')
                                current_line = indent_str + '"' + word
                            else:
                                if current_line.endswith('"'):
                                    current_line += ' ' + word
                                else:
                                    current_line += word
                        
                        current_line += '",'
                        fixed_lines.append(current_line + '\n')
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
            else:
                # 일반 줄인 경우 적절히 나누기
                if '=' in line and '#' not in line:
                    # 할당문인 경우
                    parts = line.split('=')
                    if len(parts) == 2:
                        left_part = parts[0].strip()
                        right_part = parts[1].strip()
                        
                        if len(left_part + ' = ' + right_part) > 79:
                            indent = len(line) - len(line.lstrip())
                            indent_str = ' ' * indent
                            
                            fixed_lines.append(indent_str + left_part + ' = \\\n')
                            fixed_lines.append(indent_str + '    ' + right_part + '\n')
                        else:
                            fixed_lines.append(line)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
        else:
            fixed_lines.append(line)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print(f"긴 줄 수정 완료: {filename}")

if __name__ == "__main__":
    fix_long_lines('/Users/aD/kakao-frontend/deep_learning_yoo_system.py')
