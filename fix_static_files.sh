#!/bin/bash
# 정적 파일 오류 해결 스크립트

echo "🔧 정적 파일 오류 해결 중..."

# 1. 캐시 삭제
echo "1. 캐시 삭제 중..."
rm -rf node_modules/.cache
rm -rf .cache
rm -rf build

# 2. Service Worker 등록 해제 안내
echo ""
echo "2. 브라우저에서 다음 작업을 수행하세요:"
echo "   - 개발자 도구 열기 (F12)"
echo "   - Application 탭 > Service Workers"
echo "   - Unregister 클릭"
echo "   - Application 탭 > Clear storage > Clear site data"

# 3. 서버 재시작
echo ""
echo "3. 서버 재시작 중..."
echo "   서버를 중지하고 다음 명령어를 실행하세요:"
echo "   npm start"
echo ""
echo "✅ 준비 완료!"
