# 빠른 시작 가이드

## 🚀 통합 API 서버 실행

### 방법 1: 간단한 서버 (권장)

통합 API만 사용하는 경량 서버:

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 start_simple_integrated_server.py
```

### 방법 2: 전체 서버

모든 기능을 포함한 전체 서버:

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 main_server.py
```

## 📍 서버 정보

- 기본 포트는 `BACKEND_PORT` / `API_PORT` / `PORT`(미설정 시 5002). 상세: 상위 `docs/PORTS.md`.

- **서버 주소**: `http://localhost:5002`
- **API 문서**: `http://localhost:5002/api/docs`
- **통합 API**: `http://localhost:5002/api/integrated`

## ✅ 서버 확인

```bash
# 헬스 체크
curl http://localhost:5002/api/integrated/health

# 시스템 상태
curl http://localhost:5002/api/integrated/status
```

## 🔗 프론트엔드 설정

프론트엔드 `.env` 파일:

```env
REACT_APP_INTEGRATED_API_URL=http://localhost:5002/api/integrated
```

TypeScript 클라이언트:

```typescript
import { integratedAPI } from './services/integratedAPIClient';

// 사용 예시
const result = await integratedAPI.analyzeMessage({
  message: "안녕하세요!"
});
```

## 📋 주요 엔드포인트

- `POST /api/integrated/analyze` - 메시지 분석
- `POST /api/integrated/creative/story` - 스토리 생성
- `POST /api/integrated/marketing/social` - 소셜미디어 콘텐츠
- `POST /api/integrated/persuasion/construction` - 건설사 설득 콘텐츠
- 등등... (총 21개)

자세한 내용은 `api/INTEGRATED_API_README.md` 참고

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

