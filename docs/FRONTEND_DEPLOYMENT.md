# 실제 프론트엔드 적용 가이드 (Production 배포)

이 문서는 **빌드된 프론트엔드를 실제 환경에 적용**하기 위한 절차와 설정을 정리합니다.

**실제 배포**: **개발 서버**에 올릴 때는 **§4.6 개발 서버에 배포** (`npm run deploy:dev`). **클라우드**(Vercel·Netlify)는 **§4.4 실제 배포 절차**. 프로젝트 루트의 `vercel.json`, `netlify.toml`이 빌드·SPA 설정을 담당합니다.

### 빠른 적용 체크리스트

1. **환경 변수**: 프로덕션 빌드 전 `REACT_APP_API_URL`(및 필요 시 `REACT_APP_WS_URL`) 설정
2. **빌드**: `npm run build` → `build/` 산출물 생성
3. **서버**: `build/`를 문서 루트로 서빙, SPA 폴백(`try_files … /index.html`) 설정
4. **검증**: 배포 URL 접속 후 대화·프로젝트 동작 및 API 요청 주소 확인

**프론트 회귀·원격 push**: 저장소 루트에서 `npm run test:sidebar-context` — [../TESTING_GUIDE.md](../TESTING_GUIDE.md) · 원격 push는 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md).

**실제 동작**: 개발 시 `package.json`의 `proxy`로 백엔드(기본 5002)에 연결됩니다. 백엔드가 꺼져 있으면 대화 화면 상단에 "백엔드에 연결할 수 없습니다" 배너가 표시되며, 메시지 전송 시 오류 내용이 대화에 출력됩니다.

---

## 1. 적용 전 요구사항

- **Node.js**: 18 이상 (권장 20)
- **npm** 또는 **yarn**
- 배포 대상: 정적 호스팅(nginx, S3+CloudFront, Vercel, Netlify 등) 또는 Node 정적 서버

---

## 2. 환경 변수 (프로덕션)

프로덕션 빌드 시 **백엔드 API 주소**를 반드시 지정해야 합니다.

| 변수명 | 필수 | 설명 | 예시 |
|--------|------|------|------|
| `REACT_APP_API_URL` | **프로덕션 권장** | 백엔드 API 베이스 URL | `https://api.example.com` |
| `REACT_APP_WS_URL` | 선택 | WebSocket 베이스 URL | `wss://api.example.com` |
| `REACT_APP_BACKUP_API_URL` | 선택 | 백업/복구 API 베이스 URL (미설정 시 메인 API 사용) | `https://api.example.com/api` |
| `REACT_APP_LLM_STATUS_ENABLED` | 선택 | `true` 로 설정 시에만 `/api/chat/llm-status` 요청 (기본값 비활성화, 404 방지) | `true` 로 설정 시만 사용 |

- **미설정 시**: 프로덕션 빌드는 기본값 `http://localhost:5002`를 사용합니다. 실제 서버에 배포할 때는 이 값이 잘못되므로 **반드시 설정**하세요.
- **같은 도메인·리버스 프록시**: 프론트와 API를 같은 도메인에서 `/api`로 프록시한다면, 빌드 시 `REACT_APP_API_URL=` (빈 문자열)로 두거나 상대 경로를 쓰도록 배포 구성을 맞추세요.

### 빌드 시 환경 변수 적용 예

```bash
# Linux/macOS
export REACT_APP_API_URL=https://api.your-domain.com
npm run build

# Windows (PowerShell)
$env:REACT_APP_API_URL="https://api.your-domain.com"; npm run build
```

`.env.production` 파일을 두고 사용할 수도 있습니다. 예시는 `docs/env.production.example`를 참고하세요.

```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_WS_URL=wss://api.your-domain.com
```

---

## 3. 빌드 및 산출물

```bash
# 의존성 설치 (최초 1회)
npm install

# 프로덕션 빌드
npm run build
```

- **산출 경로**: `build/`
- **내용**: `index.html`, `static/js/*`, `static/css/*` 등 정적 파일
- **라우팅**: React Router 사용으로 **SPA 폴백**이 필요합니다. 모든 경로를 `index.html`로 보내도록 서버 설정을 해야 합니다.

---

## 4. 배포 방식별 적용 방법

### 4.1 로컬에서 빌드 결과만 확인 (정적 서버)

```bash
npm run build
npx serve -s build -l 3000
```

- 브라우저: `http://localhost:3000`
- API는 별도 백엔드(예: 5002)가 떠 있어야 하며, 위에서 `REACT_APP_API_URL`로 해당 주소를 지정한 뒤 빌드해야 합니다.

### 4.2 nginx로 실제 적용

- **문서 루트**: `build/` 디렉터리를 가리키도록 설정
- **SPA 폴백**: `try_files $uri $uri/ /index.html;`
- **API 프록시** (선택): `/api`를 백엔드로 전달

예시:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/kakao-frontend/kakao-frontend/build;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    # API를 같은 서버에서 프록시하는 경우
    # location /api {
    #     proxy_pass http://127.0.0.1:5002;
    #     proxy_http_version 1.1;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    # }
}
```

### 4.3 Vercel / Netlify (설정 파일 포함)

프로젝트 루트에 **vercel.json**(Vercel), **netlify.toml**(Netlify)이 있으므로 저장소 연결만 하면 빌드·SPA 폴백이 적용됩니다.

- **Build command**: `npm run build`
- **Output directory**: `build`
- **Environment variables**: 대시보드에서 `REACT_APP_API_URL`, `REACT_APP_WS_URL` 설정
- **SPA**: rewrites/redirects로 `index.html` 폴백 설정됨

### 4.4 실제 배포 절차 (Vercel 또는 Netlify)

1. **배포 전 검증**  
   ```bash
   npm run deploy:check
   ```  
   통과 시 `build/` 생성됨.

2. **Vercel로 배포**  
   - [vercel.com](https://vercel.com) 로그인 → **Add New Project** → 이 저장소(Git) 연결.  
   - **Root Directory**: 프론트 루트가 저장소 루트가 아니면 해당 폴더 지정(예: `kakao-frontend`).  
   - **Environment Variables**에 추가:  
     - `REACT_APP_API_URL` = 백엔드 API URL (예: `https://api.your-domain.com`)  
     - (선택) `REACT_APP_WS_URL` = WebSocket URL (예: `wss://api.your-domain.com`)  
   - **Deploy** 실행. 빌드 성공 시 배포 URL에서 접속 가능.

3. **Netlify로 배포**  
   - [netlify.com](https://netlify.com) 로그인 → **Add new site** → **Import an existing project** → 저장소 연결.  
   - **Build command**: `npm run build`, **Publish directory**: `build` (netlify.toml에 있으면 자동).  
   - **Site settings** → **Environment variables**에 `REACT_APP_API_URL`, `REACT_APP_WS_URL` 추가.  
   - **Deploy site** 실행.

4. **배포 후 확인**  
   - 배포 URL 접속 → 대화·프로젝트·설정 등 동작 확인.  
   - 개발자 도구 네트워크에서 API 요청이 설정한 `REACT_APP_API_URL`로 나가는지 확인.  
   - 백엔드 서버가 동작 중이며, CORS에 프론트 도메인이 허용되어 있어야 함.

### 4.5 CLI로 배포 (Vercel)

프로젝트 루트에서 터미널로 바로 배포하려면:

1. **로그인 (최초 1회)**  
   ```bash
   npx vercel login
   ```  
   브라우저에서 로그인하면 CLI가 인증됩니다.

2. **배포 실행**  
   ```bash
   cd /path/to/kakao-frontend/kakao-frontend   # 프로젝트 루트
   npm run deploy:check                         # (선택) 검증 후 빌드
   npx vercel --yes                             # 프리뷰 배포
   # 프로덕션 도메인에 올리려면:
   npx vercel --prod --yes
   ```  
   완료 시 배포 URL이 터미널에 출력됩니다. 환경 변수는 `vercel env add REACT_APP_API_URL` 또는 대시보드에서 설정.

### 4.6 개발 서버에 배포 (rsync/scp)

빌드 결과물(`build/`)을 **자체 개발 서버**에 올리려면:

1. **환경 변수 설정** (프로젝트 루트 `.env` 또는 export)  
   - `DEPLOY_DEV_HOST`: SSH 접속 대상 (예: `user@dev.example.com`)  
   - `DEPLOY_DEV_PATH`: 원격 경로 (예: `/var/www/frontend`)  
   - 빠른 체크: [DEPLOY_SERVER_CHECKLIST.md](./DEPLOY_SERVER_CHECKLIST.md)

2. **빌드 후 배포** (프로젝트 루트에서 실행)  
   ```bash
   npm run deploy:server   # 검증 + 빌드 + 서버 동기화 (한 번에)
   # 또는
   npm run deploy:check   # 검증 + 빌드 (build/ 생성)
   npm run deploy:dev     # build/를 개발 서버로 동기화
   ```  
   - `rsync`가 있으면 `rsync -avz --delete build/`로 동기화, 없으면 `scp`로 업로드합니다.  
   - 개발 서버에는 SSH 키 인증이 되어 있어야 합니다.

3. **서버 측**  
   - `DEPLOY_DEV_PATH`를 nginx 등에서 문서 루트로 지정하고, SPA 폴백(`try_files $uri $uri/ /index.html`)을 설정하세요.  
   - API 주소는 빌드 시 `REACT_APP_API_URL`로 넣어 두었는지 확인하세요.

---

## 5. 적용 완료 검증

### 배포 전 한 번에 확인 (권장 순서)

**아래 명령은 반드시 프로젝트 루트(package.json이 있는 폴더, 예: `kakao-frontend/kakao-frontend`)에서 실행하세요.**

```bash
cd /path/to/kakao-frontend/kakao-frontend   # 프로젝트 루트로 이동
npm run deploy:check      # verify:completion + build 한 번에 (권장)
npm run deploy:static    # deploy:check 실행 후 Vercel/Netlify 배포 안내 출력
npm run deploy:dev      # 개발 서버 배포 (DEPLOY_DEV_HOST, DEPLOY_DEV_PATH 설정 후)
# 또는 개별 실행:
npm run verify:completion   # 타입·린트·P4 148 tests
npm run build              # build/ 생성
# (선택) npm run test:views -- --watchAll=false  # 뷰·라우트 20 suites, 105 tests
```

위 순서로 모두 통과하면 배포 가능 상태입니다.

### 상세 검증 항목

1. **빌드 성공**
   - `npm run build` 종료 코드 0
   - `build/` 폴더 생성 확인

2. **품질 검증 (선택)**
   - `npm run verify:completion` — 타입·린트·P4 테스트
   - `npm run test:views` — 뷰·라우트 20 suites, 105 tests

3. **실제 접속**
   - 배포 URL 접속 후 대화·프로젝트 목록·프로젝트 상세 등 동작 확인
   - 개발자 도구 네트워크에서 API 요청이 `REACT_APP_API_URL`로 나가는지 확인

4. **백엔드 연결**
   - 백엔드 서버(기본 5002)가 동작 중이어야 함
   - CORS에 프론트 도메인 허용 필요

---

## 6. 참고

- **API 설정 코드**: `src/config/api.ts` — `API_BASE_URL`, `WS_BASE_URL` 정의
- **개발 시**: `package.json`의 `proxy`로 3000 → 5002 프록시 사용 가능
- **홈페이지**: `package.json`의 `"homepage": "."` — 상대 경로 배포용

이 가이드대로 환경 변수와 서버 설정만 맞추면 **실제 프론트엔드 적용까지 완료**할 수 있습니다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
