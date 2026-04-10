#!/usr/bin/env bash
# 질문·요구를 넣어 답변글이 나오는지 테스트
# 사용:
#   ./scripts/test-chat-answer.sh [BASE_URL]
#   ./scripts/test-chat-answer.sh [BASE_URL] "사용자 문장"
# 기본 BASE_URL: http://localhost:5002
# 인자 2개면: 테스트1~7(질문·요구, 반대/찬성 논리, 형식·구성, 사건조사·생성로직) + 테스트5(반대 논리·사용자 문장, 선택)

set -e
BASE="${1:-http://localhost:5002}"
CUSTOM_SENTENCE="${2:-}"
URL="$BASE/api/chat"

# JSON 내부에서 쓸 수 있도록 메시지 이스케이프 (", \, 줄바꿈 → 공백)
escape_json_msg() {
  echo "$1" | tr '\n\r' ' ' | sed 's/\\/\\\\/g; s/"/\\"/g'
}

# 한 번의 대화 테스트: 메시지, 테스트 이름. 성공 시 답변 일부 출력, 실패 시 exit 1
run_one_test() {
  local msg="$1"
  local name="$2"
  local escaped
  escaped=$(escape_json_msg "$msg")
  local payload="{\"message\": \"${escaped}\", \"quality\": \"enhanced\", \"conversation_id\": \"test-answer-check\"}"

  echo "--- $name ---"
  PREQ="${msg:0:80}"
  [ ${#msg} -gt 80 ] && PREQ="${PREQ}..."
  echo "  요청: $PREQ"
  echo ""

  local response body code
  response=$(curl -sS -w "\n%{http_code}" --connect-timeout 15 --max-time 90 \
    -X POST "$URL" -H "Content-Type: application/json" -d "$payload" 2>/dev/null) || true
  body=$(echo "$response" | sed '$d')
  code=$(echo "$response" | tail -n 1)

  if [ -z "$code" ] || [ "$code" = "000" ]; then
    echo "  실패: 서버 연결 불가. 백엔드 확인: npm run restart:backend"
    exit 1
  fi
  if [ "$code" != "200" ]; then
    echo "  HTTP $code — 응답: ${body:0:200}..."
    exit 1
  fi

  local text
  text=$(echo "$body" | sed -n 's/.*"response":"\([^"]*\)".*/\1/p')
  [ -n "$text" ] || text=$(echo "$body" | sed -n 's/.*"message":"\([^"]*\)".*/\1/p')
  [ -n "$text" ] || text=$(echo "$body" | sed -n 's/.*"content":"\([^"]*\)".*/\1/p')
  if [ -z "$text" ]; then
    text=$(echo "$body" | grep -o '"response"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:"\(.*\)".*/\1/')
  fi
  if [ -z "$text" ]; then
    text=$(echo "$body" | grep -o '"message"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:"\(.*\)".*/\1/')
  fi

  if [ -z "$text" ]; then
    echo "  실패: 응답에 답변 텍스트 없음. 본문(일부): ${body:0:200}..."
    exit 1
  fi

  local preview="${text:0:200}"
  [ ${#text} -gt 200 ] && preview="${preview}..."
  echo "  답변(일부): $preview"
  echo ""
}

echo "=== 답변글 테스트: 질문·요구 / 반대 논리 → API → 답변 확인 ==="
echo "  URL: $URL"
echo ""

# 1. 기본 질문·요구
run_one_test "질문: 1더하기 1은 뭐야? 요구사항: 한 줄로 짧게 답해줘." "테스트1 — 질문·요구"

# 2. 반대 논리 (고정 문장)
run_one_test "문장: 기술 발전은 항상 인간에게 이득이다. 이 문장에 반대되는 논리로 글을 작성해줘." "테스트2 — 반대 논리(고정 문장)"

# 3. 찬성 논리 (고정 문장)
run_one_test "문장: 원격 근무는 생산성을 높인다. 이 문장에 찬성 논리로 글을 작성해줘." "테스트3 — 찬성 논리(고정 문장)"

# 4. 글쓰기 형식·구성 (요구에 맞는 형식·구조)
run_one_test "원격 근무의 장단점을 보고서 형식으로 서론·본론·결론 세 개 항목으로 정리해줘." "테스트4 — 형식·구성(보고서·항목)"

# 5. 반대 논리 (인자로 받은 문장) — 있으면 실행
if [ -n "$CUSTOM_SENTENCE" ]; then
  run_one_test "문장: ${CUSTOM_SENTENCE}. 이 문장에 반대되는 논리로 글을 작성해줘." "테스트5 — 반대 논리(사용자 문장)"
fi

# 6. 사건조사 형식 (개요·경과·원인·결론·시사점)
run_one_test "최근 모 corporate 사고 한 건을 골라서 사건조사 형식으로 개요, 경과, 원인 분석, 결론, 시사점 순으로 요약해줘." "테스트6 — 사건조사 형식"

# 7. 생성로직 (사실→맥락·원인→분석→결론·시사점)
run_one_test "원격 근무 확대가 생산성에 미치는 영향을 생성로직에 맞게, 사실 정리부터 맥락·원인·분석·결론·시사점 순으로 정리해줘." "테스트7 — 생성로직"

echo "결과: 모든 테스트 통과."
exit 0
