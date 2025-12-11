#!/bin/bash

# 긴 글 생성 기능 테스트 스크립트

echo "🧪 긴 글 생성 기능 테스트"
echo ""

API_URL="http://localhost:5001"

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 테스트 함수
test_endpoint() {
    local name=$1
    local endpoint=$2
    local data=$3
    
    echo -e "${BLUE}테스트: ${name}${NC}"
    echo "요청: POST ${endpoint}"
    echo "데이터: ${data}"
    
    response=$(curl -s -X POST "${API_URL}${endpoint}" \
        -H "Content-Type: application/json" \
        -d "${data}" \
        -w "\nHTTP_CODE:%{http_code}")
    
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE/d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ 성공 (HTTP $http_code)${NC}"
        echo "응답:"
        echo "$body" | head -20
        echo ""
        return 0
    else
        echo -e "${RED}❌ 실패 (HTTP $http_code)${NC}"
        echo "응답: $body"
        echo ""
        return 1
    fi
}

# 서버 상태 확인
echo -e "${YELLOW}1. 서버 상태 확인${NC}"
health_response=$(curl -s "${API_URL}/api/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 서버가 실행 중입니다${NC}"
    echo "$health_response" | head -5
    echo ""
else
    echo -e "${RED}❌ 서버에 연결할 수 없습니다${NC}"
    echo "백엔드 서버가 실행 중인지 확인하세요: ${API_URL}"
    exit 1
fi

# 테스트 케이스 1: 긴 글 생성 키워드
echo -e "${YELLOW}2. 긴 글 생성 키워드 테스트${NC}"
test_endpoint "긴 글 생성 요청" "/api/chat" '{
    "message": "인공지능에 대해 글 작성해줘",
    "quality": "enhanced",
    "conversation_id": "test-1"
}'

# 테스트 케이스 2: 질문 형태
echo -e "${YELLOW}3. 질문 형태 테스트${NC}"
test_endpoint "질문 형태" "/api/chat" '{
    "message": "Python이란 무엇인가요?",
    "quality": "enhanced",
    "conversation_id": "test-2"
}'

# 테스트 케이스 3: 상세 요청
echo -e "${YELLOW}4. 상세 요청 테스트${NC}"
test_endpoint "상세 요청" "/api/chat" '{
    "message": "기후변화에 대해 상세하게 설명해줘",
    "quality": "enhanced",
    "conversation_id": "test-3"
}'

# 테스트 케이스 4: 일반 대화
echo -e "${YELLOW}5. 일반 대화 테스트${NC}"
test_endpoint "일반 대화" "/api/chat" '{
    "message": "안녕하세요",
    "quality": "enhanced",
    "conversation_id": "test-4"
}'

echo ""
echo -e "${GREEN}✅ 테스트 완료!${NC}"
echo ""
echo "참고:"
echo "- 긴 글 생성 키워드가 포함된 메시지는 자동으로 상세한 긴 글이 생성됩니다"
echo "- 질문 형태의 메시지도 자동으로 상세한 답변이 생성됩니다"
echo "- 일반 대화는 간결한 응답을 제공합니다"

