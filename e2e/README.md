# E2E 테스트 가이드

이 디렉토리에는 Playwright를 사용한 E2E (End-to-End) 테스트가 포함되어 있습니다.

## 실행 방법

### 기본 실행
```bash
npm run test:e2e
```

### UI 모드로 실행 (디버깅에 유용)
```bash
npm run test:e2e:ui
```

### 헤드 모드로 실행 (브라우저 창 표시)
```bash
npm run test:e2e:headed
```

### 디버그 모드로 실행
```bash
npm run test:e2e:debug
```

## 테스트 파일

### example.spec.ts
기본 앱 기능 테스트

### imageOptimizer.spec.ts
이미지 최적화 기능 E2E 테스트 (Jest에서 스킵된 테스트)

### streamingClient.spec.ts
스트리밍 클라이언트 기능 E2E 테스트 (Jest에서 스킵된 테스트)

## 주의사항

- E2E 테스트는 실제 브라우저를 사용하므로 실행 시간이 오래 걸릴 수 있습니다.
- 테스트 실행 전에 개발 서버가 실행 중이어야 합니다 (`npm start`).
- Playwright는 자동으로 개발 서버를 시작하지만, 수동으로 시작할 수도 있습니다.

## CI/CD 통합

GitHub Actions에서 E2E 테스트를 실행하려면 `.github/workflows/e2e.yml` 파일을 참조하세요.

