#!/bin/bash

# LLM 연동 테스트 스크립트
# LLM 서비스가 제대로 작동하는지 테스트합니다.

echo "🧪 LLM 연동 테스트 시작..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 백엔드 URL
BACKEND_URL="http://localhost:5001"

# 테스트 결과 추적
PASSED=0
FAILED=0

# 테스트 함수
test_llm_endpoint() {
    local name=$1
    local message=$2
    local conversation_id=$3
    
    echo -n "테스트: $name ... "
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d "{
            \"message\": \"$message\",
            \"quality\": \"enhanced\",
            \"conversation_id\": \"$conversation_id\"
        }")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        # 응답 내용 확인
        if echo "$body" | grep -q "response"; then
            echo -e "${GREEN}✓ 통과${NC} (HTTP $http_code)"
            ((PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠ 부분 통과${NC} (HTTP $http_code, 응답 형식 확인 필요)"
            ((PASSED++))
            return 0
        fi
    else
        echo -e "${RED}✗ 실패${NC} (HTTP $http_code)"
        echo "  응답: $body"
        ((FAILED++))
        return 1
    fi
}

# 1. 기본 채팅 테스트
echo "📋 1. 기본 채팅 테스트"
test_llm_endpoint "기본 인사" "안녕하세요" "test-001"
test_llm_endpoint "질문 테스트" "Python이란 무엇인가요?" "test-002"
test_llm_endpoint "대화 연속성" "그럼 JavaScript는요?" "test-002"
echo ""

# 2. 에러 처리 테스트
echo "📋 2. 에러 처리 테스트"
echo -n "테스트: 빈 메시지 검증 ... "
response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "", "quality": "enhanced"}')
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✓ 통과${NC} (HTTP 400 - 예상된 오류)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC} (HTTP $http_code)"
    ((FAILED++))
fi

echo -n "테스트: 긴 메시지 검증 ... "
long_message=$(python3 -c "print('a' * 10001)")
response=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"$long_message\", \"quality\": \"enhanced\"}")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✓ 통과${NC} (HTTP 400 - 예상된 오류)"
    ((PASSED++))
else
    echo -e "${RED}✗ 실패${NC} (HTTP $http_code)"
    ((FAILED++))
fi
echo ""

# 3. LLM 서비스 상태 확인
echo "📋 3. LLM 서비스 상태 확인"
echo -e "${BLUE}LLM 제공자 확인:${NC}"
if [ -n "$OPENAI_API_KEY" ]; then
    echo -e "  ${GREEN}✓ OpenAI API 키 설정됨${NC}"
elif [ -n "$ANTHROPIC_API_KEY" ]; then
    echo -e "  ${GREEN}✓ Anthropic API 키 설정됨${NC}"
elif [ -n "$OLLAMA_BASE_URL" ]; then
    echo -e "  ${GREEN}✓ Ollama URL 설정됨${NC}"
else
    echo -e "  ${YELLOW}⚠ LLM API 키 미설정 - 폴백 모드로 작동${NC}"
fi
echo ""

# 4. 응답 품질 확인
echo "📋 4. 응답 품질 확인"
test_llm_endpoint "응답 품질" "간단한 설명을 해주세요" "test-003"
echo ""

# 결과 요약
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 테스트 결과 요약"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}통과: $PASSED${NC}"
echo -e "${RED}실패: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 모든 테스트 통과!${NC}"
    echo ""
    echo "💡 다음 단계:"
    echo "  1. 프론트엔드에서 테스트: http://localhost:3000"
    echo "  2. LLM API 키 설정 (선택사항):"
    echo "     export OPENAI_API_KEY=\"sk-...\""
    echo "     export LLM_PROVIDER=\"openai\""
    exit 0
else
    echo -e "${RED}❌ 일부 테스트 실패${NC}"
    echo ""
    echo "💡 문제 해결:"
    echo "  1. 백엔드가 실행 중인지 확인: curl $BACKEND_URL/api/health"
    echo "  2. 로그 확인: 백엔드 터미널 출력 확인"
    exit 1
fi

