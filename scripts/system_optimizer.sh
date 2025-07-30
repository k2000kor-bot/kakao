#!/bin/bash

echo "🚀 카카오 AI 시스템 최적화 시작"
echo "=================================================="

# 1. 불필요한 프로세스 정리
echo "📋 1. 불필요한 프로세스 정리 중..."
pkill -f "ai_conversation_pattern_analyzer.py" 2>/dev/null
pkill -f "ai_conversation_optimizer.py" 2>/dev/null
pkill -f "realtime_conversation_monitor.py" 2>/dev/null
pkill -f "ai_conversation_insights.py" 2>/dev/null
pkill -f "ai_message_recommender.py" 2>/dev/null
echo "✅ 불필요한 AI 프로세스 정리 완료"

# 2. 중복 React 서버 정리
echo "📋 2. 중복 React 서버 정리 중..."
pkill -f "react-scripts" 2>/dev/null
pkill -f "fork-ts-checker" 2>/dev/null
echo "✅ 중복 React 서버 정리 완료"

# 3. 캐시 정리
echo "📋 3. 캐시 정리 중..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .next 2>/dev/null
rm -rf dist 2>/dev/null
echo "✅ 캐시 정리 완료"

# 4. 포트 확인 및 정리
echo "📋 4. 포트 상태 확인 중..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8001 | xargs kill -9 2>/dev/null
lsof -ti:8002 | xargs kill -9 2>/dev/null
lsof -ti:8003 | xargs kill -9 2>/dev/null
lsof -ti:8004 | xargs kill -9 2>/dev/null
lsof -ti:8005 | xargs kill -9 2>/dev/null
echo "✅ 포트 정리 완료"

# 5. 메모리 사용량 확인
echo "📋 5. 메모리 사용량 확인 중..."
echo "현재 메모리 사용량:"
ps aux | grep -E "(python|node)" | grep -v grep | awk '{print $6/1024 " MB - " $11}' | head -10

# 6. 디스크 사용량 확인
echo "📋 6. 디스크 사용량 확인 중..."
du -sh . 2>/dev/null
du -sh node_modules 2>/dev/null
du -sh backend 2>/dev/null

# 7. 성능 최적화 권장사항
echo "📋 7. 성능 최적화 권장사항:"
echo "   - node_modules 크기: $(du -sh node_modules 2>/dev/null | cut -f1)"
echo "   - 불필요한 의존성 제거 고려"
echo "   - 이미지 최적화 권장"
echo "   - 코드 분할(Code Splitting) 적용 권장"

echo "=================================================="
echo "✅ 시스템 최적화 완료!"
echo "🎯 다음 단계:"
echo "   1. npm start - 프론트엔드 서버 시작"
echo "   2. cd backend && source ../.venv/bin/activate && python advanced_api_server.py - 백엔드 서버 시작"
echo "   3. http://localhost:3000 - 웹 애플리케이션 접속" 