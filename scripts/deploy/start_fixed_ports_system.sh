#!/bin/bash

echo "🚀 카카오톡 AI 분석 시스템 - 고정 포트 버전"
echo "=================================================="
echo "📍 각 서버가 고정 포트에서 실행됩니다"
echo "💡 일반 CORBU 개발: npm run restart:backend → http://localhost:5002 (main_server)"
echo "   본 스크립트는 레거시 멀티 프로세스(8001–8009) 전용입니다."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1

# 기존 프로세스 종료
echo "🛑 기존 프로세스 종료 중..."
pkill -f "python.*server" 2>/dev/null
pkill -f "node.*start.js" 2>/dev/null
sleep 3

# 백엔드 의존성 확인
echo "📦 백엔드 의존성 확인 중..."
if [ ! -d "$REPO_ROOT/backend/venv" ] && [ ! -d "$REPO_ROOT/backend/.venv" ]; then
    echo "⚠️  가상환경이 없습니다. requirements.txt만 설치합니다."
    ( cd "$REPO_ROOT/backend" && pip3 install -r requirements.txt --user )
else
    echo "✅ 가상환경 확인됨"
fi

backend_venv_activate "$REPO_ROOT" || echo "⚠️  venv 활성화 실패 — 시스템 Python 사용"

# 프론트엔드 의존성 확인
echo "📦 프론트엔드 의존성 확인 중..."
if [ ! -d "$REPO_ROOT/node_modules" ]; then
    echo "📦 npm 의존성 설치 중..."
    npm install
else
    echo "✅ node_modules 확인됨"
fi

# 포트 사용 가능 여부 확인
echo "🔍 포트 사용 가능 여부 확인 중..."
( cd "$REPO_ROOT/backend" && python3 fixed_ports_config.py )

# 통합 main_server 포트 (프론트·프록시와 동일 권장)
MAIN_BACKEND_PORT="${BACKEND_PORT:-5002}"

# 헬스: FastAPI 통합(/api/health) 또는 레거시(/health)
server_health_check() {
    local port=$1
    curl -sf "http://localhost:$port/api/health" >/dev/null 2>&1 && return 0
    curl -sf "http://localhost:$port/health" >/dev/null 2>&1 && return 0
    return 1
}

# 통합 메인 서버 (main_server.py — BACKEND_PORT/PORT/API_PORT)
start_main_server() {
    local port="$MAIN_BACKEND_PORT"
    echo "🚀 통합 메인 서버 (main_server.py) 시작 — 포트 $port..."
    (
        cd "$REPO_ROOT/backend" && BACKEND_PORT=$port PORT=$port API_PORT=$port python3 main_server.py
    ) &
    SERVER_PID=$!
    sleep 4
    if server_health_check "$port"; then
        echo "✅ 통합 메인 서버 시작 완료 (포트 $port)"
        return 0
    fi
    echo "❌ 통합 메인 서버 시작 실패 (헬스: /api/health 또는 /health)"
    return 1
}

# 서버 시작 함수 (레거시 보조 프로세스)
start_server() {
    local server_name=$1
    local server_file=$2
    local port=$3
    local description=$4

    echo "🚀 $server_name 시작 중 (포트 $port)..."
    # 각 레거시 모듈이 os.environ["PORT"] 또는 전용 *_PORT 로 읽을 수 있게 전달
    ( cd "$REPO_ROOT/backend" && PORT="$port" python3 "$server_file" ) &
    SERVER_PID=$!

    sleep 3

    if server_health_check "$port"; then
        echo "✅ $server_name 시작 완료 (포트 $port)"
        return 0
    fi
    echo "❌ $server_name 시작 실패"
    return 1
}

# 각 서버 시작
echo ""
echo "🎯 서버 시작 중..."
echo "=================================================="

# 1. 통합 메인 서버 (기본 5002 — 과거 스크립트는 8001에 두었으나 main_server와 불일치)
start_main_server

# 2. 고급 API 서버 (포트 8002)
start_server "고급 API 서버" "advanced_api_server.py" 8002 "카카오톡 분석 서버"

# 3. 메시지 생성 서버 (포트 8003)
start_server "메시지 생성 서버" "message_generation_server.py" 8003 "AI 메시지 생성"

# 4. 파일 업로드 서버 (포트 8004)
start_server "파일 업로드 서버" "chat_upload_server.py" 8004 "파일 처리 서버"

# 5. 분석 서버 (포트 8005) - 간단한 분석 서버 생성
if [ ! -f "backend/analysis_server.py" ]; then
    echo "📝 분석 서버 파일 생성 중..."
    cat > backend/analysis_server.py << 'EOF'
#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="분석 서버", description="대화 분석 서버")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {"status": "online", "server": "analysis", "port": 8005}

if __name__ == "__main__":
    print("🚀 분석 서버 시작 (포트 8005)")
    uvicorn.run(app, host="0.0.0.0", port=8005)
EOF
fi
start_server "분석 서버" "analysis_server.py" 8005 "대화 분석 서버"

# 6. 컨텍스트 서버 (포트 8006)
if [ ! -f "backend/context_server.py" ]; then
    echo "📝 컨텍스트 서버 파일 생성 중..."
    cat > backend/context_server.py << 'EOF'
#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="컨텍스트 서버", description="상황 분석 서버")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {"status": "online", "server": "context", "port": 8006}

if __name__ == "__main__":
    print("🚀 컨텍스트 서버 시작 (포트 8006)")
    uvicorn.run(app, host="0.0.0.0", port=8006)
EOF
fi
start_server "컨텍스트 서버" "context_server.py" 8006 "상황 분석 서버"

# 7. 미디어 서버 (포트 8007)
if [ ! -f "backend/media_server.py" ]; then
    echo "📝 미디어 서버 파일 생성 중..."
    cat > backend/media_server.py << 'EOF'
#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="미디어 서버", description="파일 관리 서버")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {"status": "online", "server": "media", "port": 8007}

if __name__ == "__main__":
    print("🚀 미디어 서버 시작 (포트 8007)")
    uvicorn.run(app, host="0.0.0.0", port=8007)
EOF
fi
start_server "미디어 서버" "media_server.py" 8007 "파일 관리 서버"

# 8. 전략 서버 (포트 8008)
if [ ! -f "backend/strategy_server.py" ]; then
    echo "📝 전략 서버 파일 생성 중..."
    cat > backend/strategy_server.py << 'EOF'
#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="전략 서버", description="전략 최적화 서버")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {"status": "online", "server": "strategy", "port": 8008}

if __name__ == "__main__":
    print("🚀 전략 서버 시작 (포트 8008)")
    uvicorn.run(app, host="0.0.0.0", port=8008)
EOF
fi
start_server "전략 서버" "strategy_server.py" 8008 "전략 최적화 서버"

# 9. 시뮬레이션 서버 (포트 8009)
if [ ! -f "backend/simulation_server.py" ]; then
    echo "📝 시뮬레이션 서버 파일 생성 중..."
    cat > backend/simulation_server.py << 'EOF'
#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="시뮬레이션 서버", description="응답 시뮬레이션 서버")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {"status": "online", "server": "simulation", "port": 8009}

if __name__ == "__main__":
    print("🚀 시뮬레이션 서버 시작 (포트 8009)")
    uvicorn.run(app, host="0.0.0.0", port=8009)
EOF
fi
start_server "시뮬레이션 서버" "simulation_server.py" 8009 "응답 시뮬레이션 서버"

# 10. 동기화 서버 (포트 8010)
if [ ! -f "backend/sync_server.py" ]; then
    echo "📝 동기화 서버 파일 생성 중..."
    cat > backend/sync_server.py << 'EOF'
#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="동기화 서버", description="데이터 동기화 서버")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {"status": "online", "server": "sync", "port": 8010}

if __name__ == "__main__":
    print("🚀 동기화 서버 시작 (포트 8010)")
    uvicorn.run(app, host="0.0.0.0", port=8010)
EOF
fi
start_server "동기화 서버" "sync_server.py" 8010 "데이터 동기화 서버"

# 프론트엔드 시작
echo ""
echo "🚀 프론트엔드 시작 중..."
npm start &
FRONTEND_PID=$!

# 프론트엔드 시작 대기
sleep 10

# 전체 상태 확인
echo ""
echo "🎯 시스템 상태 확인:"
echo "=================================================="

# 각 서버 상태 확인
servers=(
    "${MAIN_BACKEND_PORT}:통합 메인(main_server)"
    "8002:고급 API 서버"
    "8003:메시지 생성 서버"
    "8004:파일 업로드 서버"
    "8005:분석 서버"
    "8006:컨텍스트 서버"
    "8007:미디어 서버"
    "8008:전략 서버"
    "8009:시뮬레이션 서버"
    "8010:동기화 서버"
)

for server in "${servers[@]}"; do
    port="${server%%:*}"
    name="${server##*:}"
    if server_health_check "$port"; then
        echo "✅ $name: http://localhost:$port"
    else
        echo "❌ $name: http://localhost:$port"
    fi
done

# 프론트엔드 상태
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 프론트엔드: http://localhost:3000"
else
    echo "❌ 프론트엔드 오류"
fi

echo ""
echo "🎯 주요 엔드포인트:"
echo "   📖 통합 API 문서: http://localhost:5002/api/docs (main_server 권장)"
echo "   📖 레거시 멀티 서버 스크립트는 scripts/deploy/README 등을 참고"
echo "   🏠 메인 페이지: http://localhost:3000"
echo "   💬 카카오톡 대화 대응: http://localhost:3000/#/real-kakao"
echo "   📁 파일 업로드: http://localhost:3000/#/upload"
echo ""
echo "🔄 모든 서버가 고정 포트에서 실행 중입니다."
echo "🛑 종료하려면 Ctrl+C를 누르세요."
echo ""

# 프로세스 종료 처리
cleanup() {
    echo ""
    echo "🛑 시스템 종료 중..."
    pkill -f "python.*server" 2>/dev/null
    pkill -f "node.*start.js" 2>/dev/null
    echo "✅ 시스템 종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 대기
wait 