# CORBU.AI 배포 가이드

## 🚀 배포 개요

CORBU.AI는 완전히 구현된 고급 AI 통합 플랫폼으로, 다양한 환경에 배포할 수 있습니다.

## 📊 시스템 요구사항

### 최소 요구사항
- **CPU**: 2코어 이상
- **RAM**: 4GB 이상
- **Storage**: 10GB 이상
- **Network**: 100Mbps 이상

### 권장 요구사항
- **CPU**: 4코어 이상
- **RAM**: 8GB 이상
- **Storage**: 50GB 이상
- **Network**: 1Gbps 이상

## 🛠️ 배포 방법

### 1. 정적 호스팅 (Frontend)

#### Netlify 배포
```bash
# 1. 빌드
npm run build

# 2. Netlify CLI 설치
npm install -g netlify-cli

# 3. 배포
netlify deploy --prod --dir=build
```

#### Vercel 배포
```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 배포
vercel --prod
```

#### GitHub Pages 배포
```bash
# 1. package.json에 homepage 추가
{
  "homepage": "https://yourusername.github.io/your-repo-name"
}

# 2. gh-pages 설치
npm install --save-dev gh-pages

# 3. 배포 스크립트 추가
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}

# 4. 배포
npm run deploy
```

### 2. Docker 배포 (Full Stack)

#### Dockerfile 생성
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose 설정
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8003

  backend:
    build: ./backend
    ports:
      - "8003:8003"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    volumes:
      - ./backend:/app
      - ./data:/app/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

#### 배포 명령어
```bash
# Docker Compose로 배포
docker-compose up -d

# 개별 서비스 배포
docker build -t corbu-ai-frontend .
docker build -t corbu-ai-backend ./backend
docker run -d -p 3000:80 corbu-ai-frontend
docker run -d -p 8003:8003 corbu-ai-backend
```

### 3. 클라우드 배포

#### AWS 배포
```bash
# 1. AWS CLI 설정
aws configure

# 2. S3에 Frontend 배포
aws s3 sync build/ s3://your-bucket-name --delete

# 3. CloudFront 배포
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json

# 4. EC2에 Backend 배포
aws ec2 run-instances --image-id ami-12345678 --instance-type t3.medium --key-name your-key
```

#### Google Cloud 배포
```bash
# 1. gcloud CLI 설정
gcloud auth login
gcloud config set project your-project-id

# 2. App Engine 배포
gcloud app deploy app.yaml

# 3. Cloud Run 배포
gcloud run deploy corbu-ai-backend --source ./backend --platform managed
```

#### Azure 배포
```bash
# 1. Azure CLI 설정
az login
az account set --subscription your-subscription-id

# 2. Static Web Apps 배포
az staticwebapp create --name corbu-ai --source https://github.com/your-repo

# 3. App Service 배포
az webapp up --name corbu-ai-backend --resource-group your-rg --runtime python:3.9
```

### 4. 서버 배포

#### Ubuntu/Debian 서버
```bash
# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Python 설치
sudo apt install python3 python3-pip python3-venv -y

# 4. Nginx 설치
sudo apt install nginx -y

# 5. 프로젝트 클론
git clone https://github.com/your-repo/corbu-ai.git
cd corbu-ai

# 6. Frontend 빌드 및 배포
npm install
npm run build
sudo cp -r build/* /var/www/html/

# 7. Backend 설정
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 8. Systemd 서비스 생성
sudo tee /etc/systemd/system/corbu-ai.service << EOF
[Unit]
Description=CORBU.AI Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/corbu-ai/backend
Environment=PATH=/path/to/corbu-ai/backend/venv/bin
ExecStart=/path/to/corbu-ai/backend/venv/bin/python integrated_conversation_server.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 9. 서비스 시작
sudo systemctl daemon-reload
sudo systemctl enable corbu-ai
sudo systemctl start corbu-ai
```

#### Nginx 설정
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 지원
    location /ws/ {
        proxy_pass http://localhost:8003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🔧 환경 변수 설정

### Frontend 환경 변수 (.env)
```env
REACT_APP_API_URL=http://localhost:8003
REACT_APP_WS_URL=ws://localhost:8003/ws
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

### Backend 환경 변수 (.env)
```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/corbu_ai
```

## 📊 모니터링 및 로깅

### 로그 설정
```python
# backend/logging_config.py
import logging
import logging.handlers

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.handlers.RotatingFileHandler(
                'logs/corbu-ai.log',
                maxBytes=10485760,  # 10MB
                backupCount=5
            ),
            logging.StreamHandler()
        ]
    )
```

### 성능 모니터링
```bash
# 시스템 리소스 모니터링
htop
iotop
nethogs

# 애플리케이션 로그 모니터링
tail -f logs/corbu-ai.log
journalctl -u corbu-ai -f

# 네트워크 모니터링
netstat -tulpn | grep :8003
ss -tulpn | grep :3000
```

## 🔒 보안 설정

### SSL/TLS 인증서 설정
```bash
# Let's Encrypt 인증서 발급
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 방화벽 설정
```bash
# UFW 방화벽 설정
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 보안 헤더 설정
```nginx
# Nginx 보안 헤더
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📈 성능 최적화

### Frontend 최적화
```javascript
// 코드 스플리팅
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 메모이제이션
const MemoizedComponent = React.memo(ExpensiveComponent);

// 가상화
import { FixedSizeList as List } from 'react-window';
```

### Backend 최적화
```python
# 비동기 처리
import asyncio
import aiohttp

# 캐싱
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# 데이터베이스 연결 풀
from sqlalchemy import create_engine
engine = create_engine('postgresql://...', pool_size=20, max_overflow=30)
```

## 🚨 문제 해결

### 일반적인 문제들

#### 포트 충돌
```bash
# 포트 사용 확인
lsof -i :3000
lsof -i :8003

# 프로세스 종료
kill -9 <PID>
```

#### 메모리 부족
```bash
# 메모리 사용량 확인
free -h
ps aux --sort=-%mem | head

# 스왑 메모리 설정
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 네트워크 문제
```bash
# 네트워크 연결 확인
ping google.com
curl -I http://localhost:8003/api/health

# 방화벽 확인
sudo ufw status
sudo iptables -L
```

## 📞 지원

### 로그 수집
```bash
# 시스템 로그
sudo journalctl --since "1 hour ago" > system.log

# 애플리케이션 로그
cp logs/corbu-ai.log application.log

# 네트워크 로그
sudo tcpdump -i any -w network.pcap
```

### 문제 보고
- **GitHub Issues**: [이슈 리포트](https://github.com/your-repo/issues)
- **이메일**: support@corbu.ai
- **문서**: [Wiki](https://github.com/your-repo/wiki)

---

**🎉 CORBU.AI 배포 가이드가 완성되었습니다!** 🚀✨

이 가이드를 따라 안전하고 효율적으로 CORBU.AI를 배포할 수 있습니다.
