#!/bin/bash
# CORBU.AI - 시스템 상태 확인

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 통합 백엔드 (main_server / restart-backend 와 동일)
BP="${BACKEND_PORT:-5002}"

echo "🔍 CORBU.AI 시스템 상태"
echo "======================="
echo ""

# Node.js
echo "📦 Node.js:"
if command -v node &>/dev/null; then
    echo "   ✅ $(node -v)"
else
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    if command -v node &>/dev/null; then
        echo "   ✅ $(node -v)"
    else
        echo "   ❌ 미설치"
    fi
fi

# Python
echo ""
echo "🐍 Python:"
if [ -x "$PROJECT_ROOT/backend/venv/bin/python" ]; then
    echo "   ✅ $($PROJECT_ROOT/backend/venv/bin/python --version 2>&1) (backend/venv)"
elif [ -x "$PROJECT_ROOT/backend/.venv/bin/python" ]; then
    echo "   ✅ $($PROJECT_ROOT/backend/.venv/bin/python --version 2>&1) (backend/.venv)"
elif command -v python3 &>/dev/null; then
    echo "   ⚠️  $(python3 --version 2>&1) (시스템 — 권장: backend/venv 또는 backend/.venv)"
else
    echo "   ❌ python3 없음"
fi

# 포트
echo ""
echo "🔌 포트 사용: (통합 백엔드 BACKEND_PORT 기본 5002, 5001은 레거시 Flask 분석 등)"
for port in 3000 "$BP" 5001; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo "   $port: 사용 중 (PID $pid)"
    else
        echo "   $port: 비어 있음"
    fi
done

# API 응답
echo ""
echo "🌐 API 상태: (베이스 http://localhost:$BP)"
curl -s -o /dev/null -w "   $BP (/api/status): %{http_code}\n" "http://localhost:$BP/api/status" 2>/dev/null || echo "   $BP status: 연결 실패"
curl -s -o /dev/null -w "   $BP (/api/health): %{http_code}\n" "http://localhost:$BP/api/health" 2>/dev/null || echo "   $BP health: 연결 실패"

echo ""
