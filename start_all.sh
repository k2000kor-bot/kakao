#!/bin/bash

# CORBU AI 전체 시스템 시작 스크립트

echo "🚀 CORBU AI 전체 시스템 시작 중..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 백엔드 시작
echo -e "${BLUE}📦 백엔드 서버 시작 중...${NC}"
cd backend
chmod +x start.sh
./start.sh &
BACKEND_PID=$!
cd ..

# 프론트엔드 시작
echo -e "${BLUE}🎨 프론트엔드 서버 시작 중...${NC}"
npm start &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ 시스템이 시작되었습니다!${NC}"
echo ""
echo "📍 접속 정보:"
echo "   - 프론트엔드: http://localhost:3000"
echo "   - 백엔드 API: http://localhost:5001"
echo "   - API 문서: http://localhost:5001/docs"
echo ""
echo "⚠️  종료하려면 Ctrl+C를 누르세요"
echo ""

# 프로세스 종료 핸들러
trap "echo ''; echo '🛑 시스템 종료 중...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 프로세스 대기
wait
