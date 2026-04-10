#!/usr/bin/env bash
# 접속 가능 여부 빠른 확인 (프론트 3000, 백엔드 5002)
FRONT="${1:-http://localhost:3000}"
BACKEND="${2:-http://localhost:5002}"

echo "=== 접속 확인 ==="
echo ""

# 프론트는 dev 서버가 첫 응답에 시간 걸릴 수 있어 타임아웃 15초
code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 15 "$FRONT/test.html" 2>/dev/null || echo "000")
if [ "$code" = "200" ]; then
  echo "  프론트(테스트 페이지): $code → $FRONT/test.html 접속됨."
else
  echo "  프론트(테스트 페이지): $code → 접속 실패. npm run restart 후 재시도."
fi

code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 15 "$FRONT/" 2>/dev/null || echo "000")
if [ "$code" = "200" ]; then
  echo "  프론트(메인):         $code → $FRONT/ 응답됨."
else
  echo "  프론트(메인):         $code"
fi

code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 2 --max-time 5 "$BACKEND/api/health" 2>/dev/null || echo "000")
if [ "$code" = "200" ]; then
  echo "  백엔드(health):       $code → API 동작 중."
else
  echo "  백엔드(health):       $code → 필요 시: npm run restart:backend"
fi

echo ""
echo "브라우저: $FRONT 또는 $FRONT/test.html"
