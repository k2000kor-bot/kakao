#!/bin/bash
# 통합 API 헬스 확인 (기본 포트 5002, BACKEND_PORT 로 변경 가능)

set -e
PORT="${BACKEND_PORT:-5002}"
BASE="http://localhost:${PORT}"

echo "🔍 통합 API 서버 상태 확인 (${BASE})"
echo "================================"

echo ""
echo "1. 헬스 체크:"
curl -s "${BASE}/api/integrated/health" | python3 -m json.tool 2>/dev/null || echo "❌ 서버에 연결할 수 없습니다."

echo ""
echo "2. 시스템 상태:"
curl -s "${BASE}/api/integrated/status" | python3 -m json.tool 2>/dev/null || echo "❌ 서버에 연결할 수 없습니다."

echo ""
echo "3. API 문서:"
echo "   Swagger UI: ${BASE}/api/docs"
echo "   ReDoc: ${BASE}/api/redoc"

echo ""
echo "4. 실행 중인 프로세스:"
ps aux | grep "main_server.py" | grep -v grep || echo "❌ main_server.py 가 실행 중이지 않습니다."

echo ""
echo "================================"
