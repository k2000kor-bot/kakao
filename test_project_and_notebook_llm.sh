#!/bin/bash

# 프로젝트 및 노트북 LLM 통합 테스트 스크립트

echo "🧪 프로젝트 및 노트북 LLM 통합 테스트 시작..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 1. 프로젝트 API 테스트
echo "📋 1. 프로젝트 API 테스트"
test_endpoint "프로젝트 목록 조회" "GET" "/api/projects"
test_endpoint "프로젝트 생성" "POST" "/api/projects" '{"name": "테스트 프로젝트", "description": "테스트용 프로젝트입니다"}'
echo ""

# 2. 대화 API 테스트 (프로젝트 포함)
echo "📋 2. 대화 API 테스트 (프로젝트 컨텍스트)"
test_endpoint "프로젝트 컨텍스트 대화" "POST" "/api/chat" '{
    "message": "안녕하세요",
    "quality": "enhanced",
    "conversation_id": "test-project-123"
}'
echo ""

# 3. 노트북 LLM 상태 확인
echo "📋 3. 노트북 LLM 상태 확인"
echo -e "${BLUE}노트북 LLM 확인:${NC}"

# Ollama 확인
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Ollama 서비스 실행 중${NC}"
    models=$(curl -s http://localhost:11434/api/tags | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('models', [])))" 2>/dev/null || echo "0")
    echo -e "  ${BLUE}  사용 가능한 모델: $models 개${NC}"
else
    echo -e "  ${YELLOW}⚠ Ollama 서비스 미실행${NC}"
    echo -e "  ${BLUE}  노트북 LLM을 사용하려면 Ollama를 실행하세요:${NC}"
    echo -e "  ${BLUE}    ollama serve${NC}"
fi

# notebook_llm_integration.py 확인
if [ -f "backend/notebook_llm_integration.py" ]; then
    echo -e "  ${GREEN}✓ notebook_llm_integration.py 파일 존재${NC}"
else
    echo -e "  ${YELLOW}⚠ notebook_llm_integration.py 파일 없음${NC}"
fi
echo ""

# 4. LLM 제공자 확인
echo "📋 4. LLM 제공자 확인"
if [ -n "$LLM_PROVIDER" ]; then
    echo -e "  ${BLUE}LLM_PROVIDER: $LLM_PROVIDER${NC}"
    if [ "$LLM_PROVIDER" = "notebook" ] || [ "$LLM_PROVIDER" = "auto" ]; then
        echo -e "  ${GREEN}✓ 노트북 LLM 모드 활성화${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠ LLM_PROVIDER 미설정 (기본값 사용)${NC}"
fi
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
    echo "  2. 프로젝트 생성 및 대화 테스트"
    echo "  3. 노트북 LLM 사용 (선택사항):"
    echo "     export LLM_PROVIDER=\"notebook\""
    echo "     ollama serve"
    exit 0
else
    echo -e "${RED}❌ 일부 테스트 실패${NC}"
    echo ""
    echo "💡 문제 해결:"
    echo "  1. 백엔드가 실행 중인지 확인: curl $BACKEND_URL/api/health"
    echo "  2. 로그 확인: 백엔드 터미널 출력 확인"
    exit 1
fi

