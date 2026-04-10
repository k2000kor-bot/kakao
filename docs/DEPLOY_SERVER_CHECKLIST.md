# 서버 반영 체크리스트

개발 서버에 **지금까지 개발한** 프론트엔드 `build/`를 반영할 때 순서대로 확인하세요.

## 1. 완료된 단계 (로컬)

- [x] **검증·빌드**: `npm run deploy:check` (verify:completion + build) → `build/` 생성됨
- [x] **산출물**: `build/` 폴더에 정적 파일 준비됨 (통합 레이아웃·사이드바·아이콘·반응형·ErrorBoundary·개발 현황 화면 등 포함)

## 2. 서버 반영 방법 (둘 중 하나)

### 방법 A: 자동 배포 (rsync/scp)

1. **환경 변수 설정** — 프로젝트 루트 `.env`에 추가:

```env
DEPLOY_DEV_HOST=user@your-server.com
DEPLOY_DEV_PATH=/var/www/frontend
```

2. **배포 실행**:

```bash
npm run deploy:dev
# 또는 검증부터 한 번에: npm run deploy:server
```

- SSH 키 인증이 되어 있어야 합니다.

### 방법 B: 수동 업로드 (zip 패키지)

1. **배포 패키지 생성** (build/ + 안내문 zip):

```bash
bash scripts/prepare-deploy-package.sh
```

2. **생성된 파일**: `deploy-package/corbu-frontend-YYYYMMDD-HHMM.zip`  
   → 이 zip을 서버에 업로드한 뒤, 문서 루트 디렉터리에 `build/` 안의 내용을 풀어두면 됩니다.

3. `deploy-package/SERVER_DEPLOY_README.txt`에 서버 측 설정 요약이 들어 있습니다.

### 2.3 서버 측 설정 (공통)

- **문서 루트**: nginx(또는 사용 중인 웹 서버)에서 `root`를 `DEPLOY_DEV_PATH`로 지정.
- **SPA 폴백**: `try_files $uri $uri/ /index.html;` 설정.
- **API**: 빌드 시 `REACT_APP_API_URL`를 서버 API 주소로 넣었는지 확인. (`.env.production` 또는 배포 전 `export REACT_APP_API_URL=...` 후 빌드)

## 3. 참고

- 상세: [FRONTEND_DEPLOYMENT.md §4.6](./FRONTEND_DEPLOYMENT.md#46-개발-서버에-배포-rsyncscp)
- `env.example`에 `DEPLOY_DEV_HOST`, `DEPLOY_DEV_PATH` 예시 있음.
