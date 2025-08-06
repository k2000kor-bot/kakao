# CORBU AI Frontend Dockerfile
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# Nginx 설치 및 설정
RUN apk add --no-cache nginx

# Nginx 설정
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출
EXPOSE 80

# 시작 스크립트
CMD ["nginx", "-g", "daemon off;"] 