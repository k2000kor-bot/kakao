# 🚀 CORBU AI 메시지 가이드 시스템 배포 가이드

## 📋 배포 개요

**시스템명**: CORBU AI 메시지 가이드 시스템  
**버전**: v1.0.0  
**배포 환경**: Production  
**배포 날짜**: 2024년 12월  
**상태**: ✅ **배포 준비 완료**

## 🛠️ 배포 전 체크리스트

### **1. 코드 품질 검증**

- [x] TypeScript 컴파일 오류 없음
- [x] ESLint 경고 해결
- [x] 빌드 성공 확인
- [x] 테스트 통과
- [x] 성능 최적화 완료

### **2. 환경 설정**

- [x] 환경 변수 설정
- [x] API 엔드포인트 구성
- [x] 데이터베이스 연결
- [x] 보안 설정
- [x] 로깅 설정

### **3. 의존성 관리**

- [x] package.json 업데이트
- [x] 의존성 버전 확인
- [x] 보안 취약점 검사
- [x] 라이선스 확인

## 🚀 배포 방법

### **방법 1: 정적 호스팅 (권장)**

#### **Netlify 배포**

```bash
# 1. 프로젝트 빌드
npm run build

# 2. Netlify CLI 설치
npm install -g netlify-cli

# 3. Netlify 로그인
netlify login

# 4. 배포
netlify deploy --prod --dir=build
```

#### **Vercel 배포**

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. Vercel 로그인
vercel login

# 3. 배포
vercel --prod
```

#### **GitHub Pages 배포**

```bash
# 1. package.json에 homepage 추가
{
  "homepage": "https://username.github.io/repository-name"
}

# 2. gh-pages 설치
npm install --save-dev gh-pages

# 3. package.json에 스크립트 추가
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}

# 4. 배포
npm run deploy
```

### **방법 2: 클라우드 서비스**

#### **AWS S3 + CloudFront**

```bash
# 1. AWS CLI 설치 및 설정
aws configure

# 2. S3 버킷 생성
aws s3 mb s3://corbu-ai-message-guide

# 3. 빌드 파일 업로드
aws s3 sync build/ s3://corbu-ai-message-guide

# 4. CloudFront 배포 설정
aws cloudfront create-distribution --origin-domain-name corbu-ai-message-guide.s3.amazonaws.com
```

#### **Google Cloud Storage**

```bash
# 1. gcloud CLI 설치 및 설정
gcloud auth login

# 2. 프로젝트 설정
gcloud config set project your-project-id

# 3. 버킷 생성
gsutil mb gs://corbu-ai-message-guide

# 4. 파일 업로드
gsutil -m cp -r build/* gs://corbu-ai-message-guide/

# 5. 웹사이트 설정
gsutil web set -m index.html -e 404.html gs://corbu-ai-message-guide
```

### **방법 3: 서버 배포**

#### **Nginx 설정**

```nginx
server {
    listen 80;
    server_name corbu-ai.com;
    root /var/www/corbu-ai-message-guide;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### **Docker 배포**

```dockerfile
# Dockerfile
FROM nginx:alpine
COPY build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Docker 이미지 빌드
docker build -t corbu-ai-message-guide .

# 컨테이너 실행
docker run -d -p 80:80 corbu-ai-message-guide
```

## 🔧 환경 설정

### **환경 변수 설정**

#### **.env.production**

```env
REACT_APP_API_URL=https://api.corbu-ai.com
REACT_APP_WEBSOCKET_URL=wss://ws.corbu-ai.com
REACT_APP_ANALYTICS_ID=GA_TRACKING_ID
REACT_APP_SENTRY_DSN=SENTRY_DSN
REACT_APP_ENVIRONMENT=production
```

#### **.env.development**

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WEBSOCKET_URL=ws://localhost:8001
REACT_APP_ANALYTICS_ID=
REACT_APP_SENTRY_DSN=
REACT_APP_ENVIRONMENT=development
```

### **API 서버 설정**

#### **백엔드 배포**

```bash
# 1. 백엔드 디렉토리로 이동
cd backend

# 2. 가상환경 활성화
source venv/bin/activate

# 3. 의존성 설치
pip install -r requirements.txt

# 4. 서버 실행
python advanced_api_server.py
```

#### **PM2 프로세스 관리**

```bash
# PM2 설치
npm install -g pm2

# 애플리케이션 시작
pm2 start backend/advanced_api_server.py --name "corbu-ai-api"

# 상태 확인
pm2 status

# 로그 확인
pm2 logs corbu-ai-api
```

## 📊 모니터링 및 로깅

### **성능 모니터링**

#### **Google Analytics 설정**

```javascript
// src/utils/analytics.js
import ReactGA from 'react-ga';

ReactGA.initialize(process.env.REACT_APP_ANALYTICS_ID);
```

#### **Sentry 오류 추적**

```javascript
// src/utils/errorTracking.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIRONMENT,
});
```

### **로그 설정**

#### **프론트엔드 로깅**

```javascript
// src/utils/logger.js
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

#### **백엔드 로깅**

```python
# backend/utils/logger.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

## 🔒 보안 설정

### **HTTPS 설정**

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

### **CORS 설정**

```python
# backend/app.py
from flask_cors import CORS

CORS(app, origins=[
    "https://corbu-ai.com",
    "https://www.corbu-ai.com"
])
```

### **API 인증**

```python
# backend/auth.py
from functools import wraps
from flask import request, jsonify

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or not validate_api_key(api_key):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function
```

## 📈 성능 최적화

### **빌드 최적화**

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

### **이미지 최적화**

```bash
# 이미지 압축
npm install -g imagemin-cli
imagemin src/assets/* --out-dir=build/static/media
```

### **코드 분할**

```javascript
// React.lazy를 사용한 코드 분할
const MessageGuidanceSystem = React.lazy(() => import('./components/MessageGuidanceSystem'));
```

## 🔄 CI/CD 파이프라인

### **GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './build'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
```

### **GitLab CI/CD**

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm install
    - npm test

build:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - build/

deploy:
  stage: deploy
  script:
    - aws s3 sync build/ s3://corbu-ai-message-guide
    - aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## 📋 배포 후 체크리스트

### **기능 테스트**

- [ ] 메시지 가이드 시스템 접속
- [ ] 템플릿 선택 기능
- [ ] AI 자동 완성 기능
- [ ] 지침 적용 기능
- [ ] 분석 대시보드
- [ ] 실시간 협업 기능
- [ ] 파일 업로드 기능
- [ ] 음성 변환 기능

### **성능 테스트**

- [ ] 페이지 로딩 속도
- [ ] API 응답 시간
- [ ] 메모리 사용량
- [ ] 네트워크 요청 수
- [ ] 번들 크기

### **보안 테스트**

- [ ] HTTPS 연결
- [ ] CORS 설정
- [ ] API 인증
- [ ] XSS 방지
- [ ] CSRF 방지

### **모니터링 설정**

- [ ] 오류 추적
- [ ] 성능 모니터링
- [ ] 사용자 분석
- [ ] 서버 로그
- [ ] 알림 설정

## 🚨 롤백 계획

### **긴급 롤백 절차**

```bash
# 1. 이전 버전으로 복원
git checkout v0.9.0

# 2. 빌드
npm run build

# 3. 배포
npm run deploy

# 4. 상태 확인
curl -I https://corbu-ai.com
```

### **데이터베이스 롤백**

```sql
-- 백업에서 복원
RESTORE DATABASE corbu_ai_db FROM DISK = 'backup.bak'
```

## 📞 지원 및 연락처

### **배포 관련 문의**

- **이메일**: <deployment@corbu-ai.com>
- **전화**: 02-1234-5678
- **슬랙**: #deployment 채널

### **긴급 상황**

- **24시간 지원**: 02-1234-5678
- **이메일**: <emergency@corbu-ai.com>
- **텔레그램**: @corbu_ai_support

---

**배포 담당자**: CORBU AI Development Team  
**배포 날짜**: 2024년 12월  
**상태**: ✅ **배포 준비 완료**  
**버전**: v1.0.0
