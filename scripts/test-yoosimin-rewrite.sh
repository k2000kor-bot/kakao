#!/usr/bin/env bash
# 유시민 스타일 원문 재작성 요청 테스트 (롯데건설 PF 예시)
# 사용: ./scripts/test-yoosimin-rewrite.sh [BASE_URL]
# 기본: http://localhost:5002

set -e
BASE="${1:-http://localhost:5002}"
URL="$BASE/api/chat"

# 원문 요약 + 동일 지시문 (전체 원문은 길어서 앞뒤만 포함)
MESSAGE='롯데건설, 7천억 영구채 라는 진통제로 버티기 이면… 3.5조 PF 시한폭탄 여전하다

롯데건설이 7,000억 영구채로 자본 확충 이면에 3.5조 PF 뇌관이 부상하고 있다는 분석이다. 영구채로 부채비율은 잡았지만 고금리 이자 부담·PF 단독 책임 리스크는 현재 진행형이라는 것이다. 겉으로 드러난 지표는 화려하다. 부채비율은 급감했고 자본금 규모는 업계 최상위권인 대우건설을 추월했다. 그러나 시장의 평가는 싸늘하다. 수혈받은 자금이 근본적인 체질 개선이 아닌 장부상 수치 관리와 급한 불 끄기에 집중되어 있기 때문이다.

(중략: 회계적 착시, 3.5조 PF 우발채무, 1.2조 단기 채무, 성수4지구 등 내용)

결국 롯데건설이 이 수렁에서 벗어날 유일한 방법은 실질적인 사업 수익성 증명이다. 한 IB 업계 관계자는 "이번 수혈은 롯데그룹의 지원 의지를 보여준 것일 뿐, 시장의 신뢰를 완전히 회복하기엔 역부족"이라며 롯데건설의 장기 생존 여부는 결국 실제 분양 수익을 통한 현금 흐름 창출에 달려 있다고 분석했다.

위 글을 유시민스타일로 어투와 화법으로 되묻는 방식으로 롯데건설이 유동성위기는 해결되지 않고 뒤로 미룬다 취지로 만들어줘'

# JSON 이스케이프: 줄바꿈 -> 공백, 따옴표 이스케이프
ESC=$(echo "$MESSAGE" | tr '\n\r' ' ' | sed 's/\\/\\\\/g; s/"/\\"/g')
PAYLOAD="{\"message\": \"$ESC\", \"quality\": \"enhanced\", \"conversation_id\": \"test-yoosimin-rewrite\"}"

echo "=== 유시민 스타일 원문 재작성 테스트 ==="
echo "  URL: $URL"
echo "  요청: (롯데건설 PF 원문 요약 + 위 글을 유시민스타일로 되묻는 방식으로 ... 취지로 만들어줘)"
echo ""

RESPONSE=$(curl -sS -w "\n%{http_code}" --connect-timeout 10 --max-time 120 \
  -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" 2>/dev/null) || true

BODY=$(echo "$RESPONSE" | sed '$d')
CODE=$(echo "$RESPONSE" | tail -n 1)

if [ -z "$CODE" ] || [ "$CODE" = "000" ]; then
  echo "  실패: 서버 연결 불가. 백엔드 실행: npm run restart:backend"
  exit 1
fi

echo "  HTTP: $CODE"
if [ "$CODE" != "200" ]; then
  echo "  본문: ${BODY:0:400}..."
  exit 1
fi

# response 추출 (간단 파싱)
TEXT=$(echo "$BODY" | grep -o '"response"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*:"\(.*\)".*/\1/' | sed 's/\\n/\n/g')
if [ -z "$TEXT" ]; then
  TEXT=$(echo "$BODY" | sed -n 's/.*"response":"\([^"]*\)".*/\1/p' | sed 's/\\n/\n/g')
fi

if [ -n "$TEXT" ]; then
  echo "  답변 길이: ${#TEXT}자"
  echo "  답변 일부 (앞 600자):"
  echo "---"
  echo "${TEXT:0:600}"
  echo "---"
  echo ""
  echo "결과: 답변 생성됨. (유시민·되묻기·취지 반영 여부는 내용으로 확인)"
  if [ "${#TEXT}" -lt 500 ] && echo "$TEXT" | head -1 | grep -q "프로젝트 '"; then
    echo ""
    echo "※ 참고: 템플릿 형태 응답일 수 있습니다. 실제 LLM(DeepSeek/OpenAI 등) 연결 시 재작성 품질이 올라갑니다."
    echo "  환경변수: DEEPSEEK_USE_LOCAL, DEEPSEEK_API_KEY, OPENAI_API_KEY 등."
  fi
  exit 0
fi

echo "  응답에 response 없음. 본문 일부: ${BODY:0:300}..."
exit 1
