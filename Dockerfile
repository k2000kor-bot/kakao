# CORBU AI 멀티 스테이지 Docker 빌드
FROM node:18-alpine AS frontend-builder

# 프론트엔드 빌드
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Python 백엔드 빌드
FROM python:3.11-slim AS backend-builder

WORKDIR /app/backend

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 코드 복사
COPY backend/ ./

# 프로덕션 이미지
FROM python:3.11-slim AS production

WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 복사 및 설치
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# 백엔드 코드 복사
COPY backend/ ./backend/

# 프론트엔드 빌드 결과 복사
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Nginx 설정
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Supervisor 설정
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 로그 디렉토리 생성
RUN mkdir -p /app/logs /app/backups

# 포트 노출
EXPOSE 80 8001 8005 8006 8007 8008 8009 8010 8011 8012

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# 시작 스크립트
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]