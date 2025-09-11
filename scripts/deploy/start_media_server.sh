#!/bin/bash

echo "🚀 미디어 관리 서버 시작"
echo "========================"

# 기존 프로세스 종료
pkill -f "python.*media_management_server.py" 2>/dev/null

# 백엔드 디렉토리로 이동
cd backend

# 가상환경 활성화
source venv/bin/activate

# 미디어 관리 서버 시작
python3 media_management_server.py 