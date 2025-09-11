# CORBU AI System Dockerfile
# 멀티스테이지 빌드로 최적화된 프로덕션 이미지 생성

# 1단계: 프론트엔드 빌드
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json ./

# 프론트엔드 빌드
RUN npm run build

# 2단계: 백엔드 빌드
FROM python:3.11-slim AS backend-builder

WORKDIR /app/backend

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
  gcc \
  g++ \
  && rm -rf /var/lib/apt/lists/*

# Python 의존성 파일 복사
COPY backend/requirements.txt .

# Python 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 소스 코드 복사
COPY backend/ .

# 3단계: 최종 프로덕션 이미지
FROM python:3.11-slim AS production

# 메타데이터
LABEL maintainer="CORBU AI Team"
LABEL version="2.0.0"
LABEL description="CORBU AI - Advanced Conversational AI System"

# 환경 변수 설정
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV NODE_ENV=production
ENV PORT=8004

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
  curl \
  nginx \
  supervisor \
  && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# 백엔드 소스 코드 복사
COPY --from=backend-builder /app/backend ./backend

# 프론트엔드 빌드 결과 복사
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Nginx 설정
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/sites-available/default

# Supervisor 설정
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 헬스체크 스크립트
COPY docker/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# 포트 노출
EXPOSE 80 8004

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh

# 시작 스크립트
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# 사용자 생성 (보안)
RUN useradd -m -u 1000 corbu && \
  chown -R corbu:corbu /app

USER corbu

# 시작 명령
CMD ["/usr/local/bin/start.sh"]