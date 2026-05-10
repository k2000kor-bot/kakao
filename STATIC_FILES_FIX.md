# 정적 파일 404 오류 해결 가이드

## 문제 분석

다음 오류들이 발생하고 있습니다:
- `GET http://localhost:3000/manifest.json 404 (Not Found)`
- `GET http://localhost:3000/favicon.ico 404 (Not Found)`
- `GET http://localhost:3000/icons/icon-32x32.png 404 (Not Found)`
- `GET http://localhost:3000/icons/icon-16x16.png 404 (Not Found)`

## 원인

이 오류들은 React 개발 서버가 `public` 폴더의 정적 파일들을 제대로 서빙하지 못할 때 발생합니다.

## 해결 방법

### 방법 1: React 개발 서버 재시작 (권장)

```bash
# 현재 실행 중인 서버 종료
lsof -ti:3000 | xargs kill -9

# 서버 재시작
cd /path/to/kakao-frontend/kakao-frontend
npm start
```

### 방법 2: 브라우저 캐시 클리어

1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭에서 "Disable cache" 체크
3. 페이지 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### 방법 3: 파일 경로 확인

모든 파일이 `public` 폴더에 올바르게 위치해 있는지 확인:

```bash
ls -la public/
ls -la public/icons/
```

필요한 파일들:
- `public/manifest.json` ✅ 존재
- `public/favicon.ico` ✅ 존재
- `public/icons/icon-32x32.png` ✅ 존재
- `public/icons/icon-16x16.png` ✅ 존재

### 방법 4: React 설정 확인

`package.json`의 `homepage` 필드가 올바르게 설정되어 있는지 확인:

```json
{
  "homepage": "."
}
```

또는 빈 문자열:
```json
{
  "homepage": ""
}
```

## 참고 사항

이 오류들은 앱의 핵심 기능에는 영향을 주지 않지만, 다음 기능에 영향을 줄 수 있습니다:
- PWA (Progressive Web App) 설치 기능
- 브라우저 탭 아이콘 표시
- 모바일 홈 화면 아이콘

## 확인 방법

서버 재시작 후 브라우저 콘솔에서 다음 명령으로 확인:

```javascript
// manifest.json 확인
fetch('/manifest.json')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// favicon 확인
fetch('/favicon.ico')
  .then(r => r.ok ? 'OK' : 'NOT FOUND')
  .then(console.log);
```

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

