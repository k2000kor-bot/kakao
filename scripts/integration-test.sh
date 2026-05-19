#!/usr/bin/env bash
# 4단계 통합 테스트: 백엔드 API + 대화/에러 시나리오
# 사용: ./scripts/integration-test.sh [BASE_URL]
# 기본: http://localhost:5002

BASE="${1:-http://localhost:5002}"
FAIL=0

echo "=== 통합 테스트: $BASE ==="
echo ""

# 1) API 엔드포인트
echo "--- 1. 기본 엔드포인트 ---"
for path in /api/health /api/status; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 10 "$BASE$path" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    echo "  OK GET $path → $code"
  else
    echo "  FAIL GET $path → $code"
    FAIL=1
  fi
done

# 2) 대화 API 정상 요청
echo ""
echo "--- 2. 대화 API (POST /api/chat) ---"
# LLM 응답이 느리면 30초 내 미완료 시 000이 될 수 있어 여유를 둠
res=$(curl -sS -w "\n%{http_code}" --connect-timeout 5 --max-time 120 -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"안녕하세요","quality":"enhanced"}' 2>/dev/null)
code=$(echo "$res" | tail -n1)
body=$(echo "$res" | sed '$d')
if [ "$code" = "200" ]; then
  if echo "$body" | grep -qE '"response"|"message"|"content"|"data"'; then
    echo "  OK POST /api/chat → 200 (응답 본문 있음)"
  else
    echo "  WARN POST /api/chat → 200 (본문 형식 확인 필요)"
  fi
else
  echo "  FAIL POST /api/chat → $code"
  FAIL=1
fi

# 3) 에러 시나리오: 빈 메시지 → 400
echo ""
echo "--- 3. 에러 시나리오 (빈 메시지 → 400) ---"
code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 10 -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"","quality":"enhanced"}' 2>/dev/null || echo "000")
if [ "$code" = "400" ]; then
  echo "  OK POST /api/chat (empty message) → 400"
else
  echo "  FAIL POST /api/chat (empty message) → $code (기대: 400)"
  FAIL=1
fi

# 4) 에러 시나리오: 잘못된 본문 (필수 필드 누락) → 422
echo ""
echo "--- 4. 에러 시나리오 (필수 필드 누락 → 422) ---"
code=$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 10 -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null || echo "000")
if [ "$code" = "422" ]; then
  echo "  OK POST /api/chat (no body) → 422"
else
  echo "  FAIL POST /api/chat (no body) → $code (기대: 422)"
  FAIL=1
fi

# 5) 스트리밍 엔드포인트 (상태 코드만 확인)
# 주의: SSE는 오래 열려 curl이 exit 28(타임아웃)일 수 있음. `$(curl || echo 000)` 는 본문 없이
# -w 가 이미 "200"을 출력한 뒤 실패하면 stdout이 "200" + "000"으로 붙어 버그가 되므로 쓰지 않음.
echo ""
echo "--- 5. 스트리밍 엔드포인트 (POST /api/chat/stream) ---"
code=$(curl -sS -N -o /dev/null -w "%{http_code}" --connect-timeout 3 --max-time 20 -X POST "$BASE/api/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{"message":"hi","session_id":"test"}' 2>/dev/null)
code=$(printf '%s' "$code" | tr -d '\r\n' | head -c 3)
if [ "$code" = "200" ]; then
  echo "  OK POST /api/chat/stream → 200"
else
  echo "  FAIL POST /api/chat/stream → ${code:-000}"
  FAIL=1
fi

echo ""
if [ $FAIL -eq 0 ]; then
  echo "결과: 통합 테스트 모두 통과."
else
  echo "결과: 일부 실패. 백엔드 실행: npm run restart:backend"
fi
exit $FAIL
