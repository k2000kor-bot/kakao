#!/bin/bash

# CORBU.AI Ultimate System (레거시) — 저장소 루트에서 실행
echo "🚀 CORBU.AI Ultimate System을 시작합니다..."

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$REPO_ROOT" || exit 1

# shellcheck source=scripts/lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
if ! backend_venv_activate "$REPO_ROOT"; then
    echo "⚠️  venv 없음 — backend 에서 pip 설치 후 재시도 권장 (./setup.sh)"
fi

cd "$REPO_ROOT/backend" || exit 1

echo "📦 필요한 패키지 확인..."
pip install -q -r requirements.txt 2>/dev/null || pip install -q -r requirements-core.txt 2>/dev/null || true

echo "🗄️ 데이터베이스 초기화..."
python3 -c "
import sqlite3
import os

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

echo "🔧 백엔드 main_server 시작..."
python3 main_server.py &

sleep 5

# 프론트: 보조 트리 frontend/ 있으면 사용, 없으면 루트 CRA
if [ -f "$REPO_ROOT/frontend/package.json" ]; then
    cd "$REPO_ROOT/frontend" || exit 1
else
    cd "$REPO_ROOT" || exit 1
fi

echo "📦 프론트엔드 의존성..."
npm install

echo "🎨 프론트엔드 서버 시작..."
npm start &

echo ""
echo "🎉 Ultimate System 기동 시도 완료 (백엔드는 backend 기준, 프론트는 위 경로)"
echo "   통합 API 권장: npm run restart:backend (포트 5002)"
echo "🛑 중지: ./stop_ultimate_system.sh"
echo ""

wait
