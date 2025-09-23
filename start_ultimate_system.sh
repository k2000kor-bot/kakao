#!/bin/bash

# CORBU AI Ultimate System 시작 스크립트
echo "🚀 CORBU AI Ultimate System을 시작합니다..."

# 백엔드 디렉토리로 이동
cd backend

# 필요한 패키지 설치 확인
echo "📦 필요한 패키지들을 확인하고 설치합니다..."
pip install -r requirements.txt

# 데이터베이스 초기화
echo "🗄️ 데이터베이스를 초기화합니다..."
python -c "
import sqlite3
import os

# 데이터베이스 파일들 생성
databases = [
    'performance_monitor.db',
    'ai_engine.db', 
    'security_monitor.db',
    'user_experience.db',
    'system_monitor.db'
]

for db in databases:
    if not os.path.exists(db):
        conn = sqlite3.connect(db)
        conn.close()
        print(f'✅ {db} 생성 완료')
    else:
        print(f'📁 {db} 이미 존재')
"

# 백엔드 서버 시작
echo "🔧 백엔드 서버를 시작합니다..."
python main_server.py &

# 백엔드 서버 시작 대기
sleep 5

# 프론트엔드 디렉토리로 이동
cd ../frontend

# 프론트엔드 의존성 설치
echo "📦 프론트엔드 의존성을 설치합니다..."
npm install

# 프론트엔드 서버 시작
echo "🎨 프론트엔드 서버를 시작합니다..."
npm start &

echo ""
echo "🎉 CORBU AI Ultimate System이 성공적으로 시작되었습니다!"
echo ""
echo "📊 시스템 접속 정보:"
echo "   - 메인 시스템: http://localhost:3000"
echo "   - API 문서: http://localhost:8000/api/docs"
echo "   - 시스템 상태: http://localhost:8000/api/health"
echo ""
echo "🔧 관리 기능:"
echo "   - 성능 최적화: http://localhost:3000/performance"
echo "   - AI 엔진: http://localhost:3000/ai-engine"
echo "   - 보안 모니터링: http://localhost:3000/security"
echo "   - 사용자 경험: http://localhost:3000/user-experience"
echo ""
echo "🛑 시스템 중지: Ctrl+C 또는 ./stop_ultimate_system.sh 실행"
echo ""

# 프로세스 대기
wait
