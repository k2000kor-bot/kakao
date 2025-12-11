#!/bin/bash

# 서버 상태 확인 스크립트

echo "🔍 통합 API 서버 상태 확인"
echo "================================"

# 헬스 체크
echo ""
echo "1. 헬스 체크:"
curl -s http://localhost:8000/api/integrated/health | python3 -m json.tool 2>/dev/null || echo "❌ 서버에 연결할 수 없습니다."

# 시스템 상태
echo ""
echo "2. 시스템 상태:"
curl -s http://localhost:8000/api/integrated/status | python3 -m json.tool 2>/dev/null || echo "❌ 서버에 연결할 수 없습니다."

# API 문서 확인
echo ""
echo "3. API 문서:"
echo "   Swagger UI: http://localhost:8000/api/docs"
echo "   ReDoc: http://localhost:8000/api/redoc"

# 프로세스 확인
echo ""
echo "4. 실행 중인 프로세스:"
ps aux | grep "main_server.py" | grep -v grep || echo "❌ 서버가 실행 중이지 않습니다."

echo ""
echo "================================"
