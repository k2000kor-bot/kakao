#!/bin/bash
# CORBU AI 프로덕션 배포 스크립트

set -e

echo "🚀 CORBU AI 프로덕션 배포 시작"
echo "==============================="

# 환경 변수 확인
if [ -z "$ENVIRONMENT" ]; then
    echo "⚠️  환경 변수 ENVIRONMENT가 설정되지 않았습니다. 기본값 'production' 사용"
    export ENVIRONMENT=production
fi

echo "📦 배포 환경: $ENVIRONMENT"

# 1. 의존성 확인
echo "🔍 시스템 요구사항 확인 중..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker가 필요합니다."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose가 필요합니다."; exit 1; }

# 2. 환경 설정 파일 생성
echo "⚙️ 환경 설정 파일 생성 중..."
cat > .env << EOF
# CORBU AI 프로덕션 환경 설정
ENVIRONMENT=$ENVIRONMENT
NODE_ENV=production
PYTHONPATH=/app/backend

# 데이터베이스 설정
DB_HOST=postgres
DB_PORT=5432
DB_NAME=corbu_ai
DB_USER=corbu_admin
DB_PASSWORD=corbu_secure_2025

# Redis 설정
REDIS_HOST=redis
REDIS_PORT=6379

# API 키 (프로덕션에서는 환경 변수로 관리)
OPENAI_API_KEY=\${OPENAI_API_KEY:-dummy_key}
ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-dummy_key}

# 보안 설정
JWT_SECRET=\$(openssl rand -hex 32)
CORS_ORIGINS=http://localhost,https://corbu-ai.com
EOF

# 3. 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker-compose down --remove-orphans || true

# 4. 이미지 빌드
echo "🏗️ Docker 이미지 빌드 중..."
docker-compose build --no-cache

# 5. 데이터베이스 초기화 스크립트
echo "💾 데이터베이스 초기화 스크립트 생성 중..."
cat > database/init.sql << EOF
-- CORBU AI 데이터베이스 초기화

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 테이블
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 분석 결과 테이블
CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    analysis_type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 대화 세션 테이블
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    session_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시스템 로그 테이블
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_analysis_results_project_id ON analysis_results(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_type ON analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_room_id ON conversation_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- 기본 데이터 삽입
INSERT INTO users (username, email, password_hash) 
VALUES ('admin', 'admin@corbu-ai.com', '\$2b\$12\$dummy_hash') 
ON CONFLICT (username) DO NOTHING;

COMMIT;
EOF

# 6. 컨테이너 시작
echo "🚀 컨테이너 시작 중..."
docker-compose up -d

# 7. 헬스체크
echo "🔍 서비스 헬스체크 중..."
sleep 30

services=("corbu-ai:80" "corbu-ai:8001" "corbu-ai:8006" "redis:6379" "postgres:5432")
for service in "${services[@]}"; do
    if docker-compose exec ${service%:*} echo "OK" >/dev/null 2>&1; then
        echo "✅ $service 정상"
    else
        echo "❌ $service 응답 없음"
    fi
done

# 8. 배포 완료 안내
echo ""
echo "🎉 CORBU AI 프로덕션 배포 완료!"
echo "==============================="
echo "🌐 웹 인터페이스: http://localhost"
echo "🧪 테스트 페이지: http://localhost/test.html"
echo "📊 API 게이트웨이: http://localhost:8080"
echo "📖 API 문서: http://localhost:8006/docs"
echo "📈 Prometheus: http://localhost:9090"
echo "📊 Grafana: http://localhost:3001 (admin/corbu_admin_2025)"
echo ""
echo "🔧 관리 명령어:"
echo "  docker-compose logs -f          # 로그 확인"
echo "  docker-compose ps               # 상태 확인"
echo "  docker-compose down             # 서비스 중지"
echo "  docker-compose up -d --scale corbu-ai=3  # 확장"
echo ""
echo "✨ 배포가 성공적으로 완료되었습니다!"