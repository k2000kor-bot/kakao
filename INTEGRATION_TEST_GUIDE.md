# 통합 테스트 가이드

## 🧪 테스트 개요

이 가이드는 백엔드와 프론트엔드 간의 통신을 검증하는 통합 테스트 방법을 설명합니다.

프론트 **메뉴·경로**를 바꿀 때는 [src/config/README.md](src/config/README.md)의 `name`·`getPageTitle`(**`/projects/:id` → 프로젝트 대화** 등)·[TESTING_GUIDE.md](TESTING_GUIDE.md) `routes.test`·[e2e/README.md](e2e/README.md)·[AGENTS.md](AGENTS.md)와 동기하는 것이 좋습니다.

**프론트 유닛(백엔드 없이, 통합 전 점검)**: `npm run test:routes`(**27**)·`npm run test:app-unified`(**115**, 수 초대)·`npm run test:sidebar-context` — [TESTING_GUIDE.md](TESTING_GUIDE.md) 주요 검증 표. 원격 `git push` 막힘: [docs/PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

**보조 CRA `frontend/src/`**: 루트 `src/`와 바이트 맞춤은 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)). `chatInputUtils.ts`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**). 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](QUICK_REFERENCE.md)·[AGENTS.md](AGENTS.md)·[scripts/README.md](scripts/README.md).

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](QUICK_REFERENCE.md)·[AGENTS.md](AGENTS.md)·[scripts/README.md](scripts/README.md) — [docs/FEATURE_LOGIC_AND_STRENGTHS.md](docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **통합 테스트·INTEGRATION_TEST_GUIDE(루트)·로컬 접속·LOCAL_ACCESS_GUIDE(docs)** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **개발 요약·개발자 체크리스트(docs)** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · §6 **스크립트 허브·scripts/README(루트)·dev/deploy(docs)** 행 · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **통합 테스트·로컬 접속** · §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §6 **Agent / AI 개발 가이드** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · 동 허브 **개발·개발 연속성** 표 `INTEGRATION_TEST_GUIDE` 행 · [TESTING_GUIDE.md](TESTING_GUIDE.md) `routes.test` · [e2e/README.md](e2e/README.md)·[docs/COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md)·[docs/FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)·표 행과 교차

**로컬 UI 스모크 체크리스트**: [docs/LOCAL_UI_SMOKE_CHECKLIST.md](docs/LOCAL_UI_SMOKE_CHECKLIST.md)

**실행 가이드·접속 문제(루트)**: (본 문서 **통합 테스트**·curl·`test_integration`·`verify:final` 연계) · [RUN_GUIDE.md](RUN_GUIDE.md)·[CONNECT.md](CONNECT.md) — [QUICK_REFERENCE.md](QUICK_REFERENCE.md)·[AGENTS.md](AGENTS.md)·[scripts/README.md](scripts/README.md)·[docs/FEATURE_LOGIC_AND_STRENGTHS.md](docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §4 **통합 테스트·로컬 접속** · [docs/COMPONENT_ARCHITECTURE.md](docs/COMPONENT_ARCHITECTURE.md) §1.1 · [USAGE_GUIDE.md](USAGE_GUIDE.md) §11 · [docs/LOCAL_ACCESS_GUIDE.md](docs/LOCAL_ACCESS_GUIDE.md)·[SYSTEM_READY.md](SYSTEM_READY.md) §빠른 참조 · [DEVELOPMENT.md](DEVELOPMENT.md) §2 · [README.md](README.md)·[docs/README.md](docs/README.md) §NotebookLM·§개발 **통합·로컬** · 표 행과 교차

## 배포 직전 풀 스택 (선택)

통합 테스트에 더해 **import 검사·빌드·접속·API·통합·대화 Jest·UI 스모크**까지 한 번에 보려면 프로젝트 루트에서 **`npm run verify:final`** (`scripts/final-verify.sh`). UI 스모크만 순차 Jest: **`npm run verify:final:sequential-smoke`**. 절차·CI 요약: [docs/FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md).

## 📋 사전 준비

### 1. 백엔드 실행

```bash
cd backend
python3 app.py
```

백엔드가 `http://localhost:5002`에서 실행되어야 합니다.

### 2. 프론트엔드 실행 (선택사항)

```bash
npm start
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

## 🚀 자동 테스트 실행

### 통합 테스트 스크립트

```bash
./test_integration.sh
```

이 스크립트는 다음을 테스트합니다:
- ✅ 헬스 체크 엔드포인트
- ✅ 대화 API
- ✅ 인증 API
- ✅ 시스템 상태 API

## 📝 수동 테스트

### 1. 헬스 체크

```bash
curl http://localhost:5002/api/health
```

**예상 응답:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T...",
  "version": "1.0.0"
}
```

### 2. 대화 API 테스트

```bash
curl -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "안녕하세요",
    "quality": "enhanced"
  }'
```

**예상 응답:**
```json
{
  "response": "안녕하세요! '안녕하세요'에 대한 enhanced 품질의 응답입니다...",
  "quality_score": 0.85,
  "confidence": 0.9,
  "processing_time": 1500,
  "model": "Enhanced AI Model",
  "tokens": 750
}
```

### 3. 회원가입 테스트

```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test1234",
    "confirmPassword": "test1234"
  }'
```

### 4. 에러 처리 테스트

#### 빈 메시지 테스트
```bash
curl -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "",
    "quality": "enhanced"
  }'
```

**예상 응답 (400 에러):**
```json
{
  "success": false,
  "error": "메시지가 비어있습니다.",
  "status_code": 400
}
```

#### 긴 메시지 테스트
```bash
curl -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"$(python3 -c 'print(\"a\" * 10001)\")\",
    \"quality\": \"enhanced\"
  }"
```

**예상 응답 (400 에러):**
```json
{
  "success": false,
  "error": "메시지가 너무 깁니다. (최대 10,000자)",
  "status_code": 400
}
```

## 🌐 브라우저 테스트

### 1. 프론트엔드 접속

브라우저에서 `http://localhost:3000` 접속

### 2. 기능 테스트 체크리스트

- [ ] 새 대화 생성 버튼 클릭
- [ ] 메시지 입력 및 전송
- [ ] 응답 수신 확인
- [ ] 마크다운 렌더링 확인
- [ ] 메시지 복사 기능
- [ ] 대화 삭제 기능
- [ ] 사이드바 토글
- [ ] 로컬 스토리지 저장 확인 (개발자 도구 > Application > Local Storage)

### 3. 에러 시나리오 테스트

- [ ] 백엔드 종료 후 메시지 전송 시도
- [ ] 네트워크 오류 메시지 확인
- [ ] 타임아웃 처리 확인 (30초 이상 대기)

## 🔍 개발자 도구 활용

### Network 탭

1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭 선택
3. 메시지 전송
4. `/api/chat` 요청 확인:
   - 요청 헤더
   - 요청 본문
   - 응답 상태 코드
   - 응답 본문
   - 응답 시간

### Console 탭

에러 메시지 및 로그 확인:
- API 호출 성공/실패 로그
- 에러 스택 트레이스

## 📊 성능 테스트

### 응답 시간 측정

```bash
time curl -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "테스트 메시지",
    "quality": "enhanced"
  }'
```

### 동시 요청 테스트

```bash
for i in {1..10}; do
  curl -X POST http://localhost:5002/api/chat \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"테스트 $i\", \"quality\": \"enhanced\"}" &
done
wait
```

## ✅ 테스트 체크리스트

### 백엔드
- [ ] 모든 엔드포인트 응답
- [ ] 에러 처리 정상 작동
- [ ] 입력 검증 작동
- [ ] CORS 설정 정상

### 프론트엔드
- [ ] API 호출 성공
- [ ] 에러 메시지 표시
- [ ] 로딩 상태 표시
- [ ] 사용자 입력 검증
- [ ] 로컬 스토리지 저장

### 통합
- [ ] 백엔드-프론트엔드 통신
- [ ] 데이터 형식 일치
- [ ] 에러 전파 정상
- [ ] 성능 만족

## 🐛 문제 해결

### 백엔드 연결 실패

1. 백엔드가 실행 중인지 확인
2. 포트 5001이 사용 중인지 확인: `lsof -i :5001`
3. CORS 설정 확인

### 프론트엔드 오류

1. 브라우저 콘솔 확인
2. Network 탭에서 요청 확인
3. API URL 확인: `src/components/ChatGPTInterface.tsx`의 `API_BASE_URL`

### 데이터 형식 불일치

1. 백엔드 응답 형식 확인: `/docs` 접속
2. 프론트엔드 요청 형식 확인: Network 탭
3. 타입 정의 확인: TypeScript 인터페이스

---

**테스트 완료 후**: 모든 테스트가 통과하면 시스템이 정상 작동하는 것입니다! 🎉

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

