# PWA 검증 가이드

**목적**: manifest·service worker·오프라인 동작 검증 및 문서화.

---

## 1. 현재 구성

### 1.1 manifest.json

| 필드 | 값 |
|------|------|
| short_name | CORBU.AI |
| name | CORBU.AI |
| start_url | / |
| display | standalone |
| theme_color | #3478F6 |
| background_color | #ffffff |
| icons | favicon.ico, icon-192x192.png, icon-512x512.png (/icons/) |

**위치**: `public/manifest.json`

### 1.2 Service Worker (sw.js)

| 단계 | 동작 |
|------|------|
| install | `skipWaiting()` — 즉시 활성화 |
| activate | 기존 캐시(CACHE_NAME 외) 삭제 |
| fetch | 네트워크 우선, 실패 시 캐시 폴백 |

**캐시 이름**: `corbu-ai-v1`

**위치**: `public/sw.js`

### 1.3 등록 조건 (index.html)

| 환경 | 동작 |
|------|------|
| **개발** (localhost, 127.0.0.1) | 기존 SW **등록 해제** (unregister) |
| **프로덕션** | load 이벤트 후 `/sw.js` 등록 |

---

## 2. 아이콘

`public/icons/` 디렉터리:

- icon-192x192.png, icon-512x512.png (manifest 참조)
- icon-16x16 ~ 384x384, shortcut-*, splash-*

---

## 3. 검증 방법

### 수동

1. **프로덕션 빌드**: `npm run build && npm run serve:build` (또는 배포 URL)
2. **개발(localhost)에서는 SW 미등록** — 프로덕션/배포 URL에서만 확인
3. Chrome DevTools → Application → Service Workers, Manifest
4. Application → Manifest: short_name, icons, display 확인
5. 오프라인: DevTools Network → Offline 체크 후 새로고침 → 캐시된 페이지 로드 여부

### E2E (pwa.spec.ts)

```bash
# 서버 기동 후 (빌드 서빙 권장 — 개발 모드에서는 SW 미등록)
E2E_SERVER_READY=1 npm run test:e2e:no-server -- e2e/pwa.spec.ts
```

- Service Worker 등록 확인
- 오프라인 모드에서 동작 확인 (data-testid="offline-indicator" 등)
- beforeinstallprompt 이벤트 (설치 프롬프트)

**참고**: localhost 개발 모드에서는 SW가 unregister되므로 pwa.spec.ts는 build/serve 또는 실제 배포 URL에서 실행해야 함.

---

## 4. 연관 파일

| 파일 | 용도 |
|------|------|
| public/manifest.json | PWA manifest |
| public/sw.js | Service Worker |
| public/offline.html | 오프라인 폴백 페이지 |
| src/services/pwaService.ts | PWA 상태·설치 프롬프트 |
| src/hooks/usePWA.ts | PWA 훅 |
| e2e/pwa.spec.ts | PWA E2E 테스트 |

---

## 5. 제한사항

- **오프라인 캐시**: sw.js는 fetch 실패 시 캐시 폴백만 수행. **사전 캐싱(Precache) 미구현** → 오프라인에서 reload 불가. precache 도입 시 E2E 오프라인 테스트 활성화.
- **개발 모드**: localhost에서 SW 미등록 — 프로덕션 빌드로만 PWA 동작 확인 가능.

## 6. E2E PWA 테스트 (2026-02-20)

- **?sw=1 쿼리**: localhost에서 SW 등록 허용 (index.html pwaTestMode). `PWA_TEST_URL = /?sw=1`.
- **실행**: build 후 `npx serve -s build -l 3000` 기동, `E2E_SERVER_READY=1 npx playwright test e2e/pwa.spec.ts --project=chromium`.
- **통과**: Service Worker 등록·PWA 설치 프롬프트·앱 업데이트 알림 (3 tests).
- **스킵**: 오프라인 모드·캐시된 리소스 오프라인 로드 (2 tests) — 사전 캐싱 미구현.

**단기 미진행 순서**: §3 수동(1~5) → E2E 위 명령. PERFORMANCE.md §2.6 6번.
