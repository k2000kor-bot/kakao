#!/bin/bash

# 통합 테스트 스크립트
# 백엔드와 프론트엔드의 통신을 검증합니다.

echo "🧪 통합 테스트 시작..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 백엔드 URL (통합 main_server 기본 5002)
BACKEND_URL="${BACKEND_URL:-http://localhost:5002}"

# 테스트 결과 추적
PASSED=0
FAILED=0

# 테스트 함수
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -n "테스트: $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BACKEND_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ 통과${NC} (HTTP $http_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ 실패${NC} (HTTP $http_code)"
        echo "  응답: $body"
        ((FAILED++))
        return 1
    fi
}

# 1. 헬스 체크
echo "📋 1. 헬스 체크 테스트"
test_endpoint "기본 헬스 체크" "GET" "/health"
test_endpoint "API 헬스 체크" "GET" "/api/health"
echo ""

# 2. 대화 API 테스트
echo "📋 2. 대화 API 테스트"
test_endpoint "대화 메시지 전송" "POST" "/api/chat" '{"message": "안녕하세요", "quality": "enhanced"}'
test_endpoint "빈 메시지 검증" "POST" "/api/chat" '{"message": "", "quality": "enhanced}'
echo ""

# 3. 인증 API 테스트
echo "📋 3. 인증 API 테스트"
test_endpoint "회원가입" "POST" "/api/auth/register" '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test1234",
    "confirmPassword": "test1234"
}'
echo ""

# 4. 시스템 상태 테스트
echo "📋 4. 시스템 상태 테스트"
test_endpoint "API 상태" "GET" "/api/status"
test_endpoint "버전 정보" "GET" "/api/version"
test_endpoint "성능 메트릭" "GET" "/api/metrics"
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
    exit 0
else
    echo -e "${RED}❌ 일부 테스트 실패${NC}"
    exit 1
fi

