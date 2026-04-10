#!/usr/bin/env bash
# 기본 API 엔드포인트 검증 (1단계 개발 로드맵)
# 사용: ./scripts/verify-api.sh [BASE_URL]
# 기본: http://localhost:5002

BASE="${1:-http://localhost:5002}"
FAIL=0

echo "=== API 엔드포인트 검증: $BASE ==="
echo ""

check() {
  local path="$1"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 10 "$BASE$path" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    echo "  OK $path → $code"
  else
    echo "  FAIL $path → $code"
    FAIL=1
  fi
}

check "/api/health"
check "/api/status"
check "/api/docs"   # Swagger UI
echo ""

if [ $FAIL -eq 0 ]; then
  echo "결과: 모든 기본 엔드포인트 정상."
else
  echo "결과: 일부 실패. 백엔드 실행 여부 확인: npm run restart:backend"
fi
exit $FAIL
