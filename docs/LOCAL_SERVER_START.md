# 로컬 서버 기동 (빠른 참고)

## 1. 작업 폴더 (필수)

```bash
cd /Users/a0/kakao-frontend/kakao-frontend
```

`package.json`이 있는 폴더입니다. 상위 `kakao-frontend`만 열면 npm 스크립트 오류가 납니다.

## 2. package.json 오류 시

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json')); console.log('OK')"
```

`OK`가 나오면 파일은 정상입니다. Cursor에서 **package.json 저장(Cmd+S)** 후 창 새로고침.

## 3. 전체 서버 (권장)

```bash
npm run start:dev
```

| 서비스 | URL |
|--------|-----|
| 프론트 | http://localhost:3000 |
| API | http://localhost:5002 |
| API 문서 | http://localhost:5002/docs |

백엔드 로그: `backend.log` · 종료 시 Ctrl+C (프론트) + `lsof -ti :5002 | xargs kill` (백엔드)

## 4. 나눠서 기동

```bash
npm run restart:backend   # :5002
npm start               # :3000 (다른 터미널)
```

## 5. PR

```bash
npm run pr:ready
```

docs/PR_CREATE_NOW.md 참고.

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
