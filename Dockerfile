# CORBU AI - 프로덕션 Docker 이미지
# 멀티 스테이지 빌드로 최적화

# === 1단계: Node.js 빌드 환경 ===
FROM node:18-alpine AS builder
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# === 2단계: Python 백엔드 환경 ===
FROM python:3.11-slim AS backend
WORKDIR /app/backend

# Python 의존성 설치
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 소스 코드 복사
COPY backend/ ./

# === 3단계: 프로덕션 이미지 ===
FROM nginx:alpine AS production

# Nginx 설정
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 프론트엔드 파일 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Python 환경 설정
RUN apk add --no-cache python3 py3-pip
COPY --from=backend /app/backend /app/backend
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# 백엔드 서버 시작 스크립트
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 포트 설정
EXPOSE 80 8001 8005 8006

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 엔트리포인트
ENTRYPOINT ["/docker-entrypoint.sh"]