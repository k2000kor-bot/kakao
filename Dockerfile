# CORBU.AI 프로덕션 Docker 이미지
FROM python:3.13-slim

WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# 애플리케이션 코드 복사
COPY . .

# 필요한 디렉토리 생성
RUN mkdir -p logs uploads

# 권한 설정
RUN chmod +x production_server.py

# 포트 노출
EXPOSE 8080

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# 환경변수 설정
ENV PYTHONPATH=/app
ENV FLASK_ENV=production

# Gunicorn으로 서버 실행
CMD ["gunicorn", "--config", "gunicorn.conf.py", "production_server:application"]