# 빠른 테스트 가이드

## 🚀 시스템 실행

### 1. 통합 실행 (권장)

프로젝트 루트(`package.json` 있는 폴더):

```bash
npm run restart:backend   # 터미널 1 — main_server, 기본 5002
npm start                 # 터미널 2
```

### 2. 개별 실행 (대안)

**백엔드:**
```bash
cd backend
pip install -r requirements.txt   # 또는 .venv에서 pip
python3 -m uvicorn main_server:app --host 0.0.0.0 --port 5002
```

**프론트엔드 (새 터미널):**
```bash
npm install
npm start
```

## ✅ 테스트 체크리스트

### 백엔드 테스트

1. **헬스 체크**
   ```bash
   curl http://localhost:5002/api/health
   ```

2. **대화 API 테스트**
   ```bash
   curl -X POST http://localhost:5002/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "안녕하세요", "quality": "enhanced"}'
   ```

3. **회원가입 테스트**
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

### 프론트엔드 테스트

0. **Jest(선택·백엔드 불필요)**  
   `npm run test:routes` · `npm run test:app-unified` · `npm run test:sidebar-context` — [TESTING_GUIDE.md](./TESTING_GUIDE.md). 원격 push 막힘: [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

1. **브라우저 접속**
   - http://localhost:3000

2. **기능 테스트**
   - ✅ 새 대화 생성
   - ✅ 메시지 전송
   - ✅ 메시지 수신
   - ✅ 대화 삭제
   - ✅ 사이드바 토글
   - ✅ 로컬 스토리지 저장/불러오기

3. **에러 처리 테스트**
   - 백엔드 종료 후 메시지 전송 시도
   - 네트워크 오류 처리 확인

## 🔍 문제 해결

### 백엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :5002`
2. Python 버전 확인: `python3 --version` (3.8+ 필요)
3. 의존성 설치 확인: `pip list | grep fastapi`

### 프론트엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :3000`
2. Node.js 버전 확인: `node --version` (18+ 필요)
3. 의존성 설치 확인: `npm list react`

### API 연결 오류

1. CORS 설정 확인: `backend/main_server.py` 등 통합 API CORS
2. API URL 확인: `src/config/api.ts`, `REACT_APP_API_URL`, `package.json` proxy(5002)
3. 네트워크 확인: 브라우저 개발자 도구의 Network 탭

## 📊 성능 확인

### 백엔드 메트릭
```bash
curl http://localhost:5002/api/metrics
```

### 프론트엔드 성능
- 브라우저 개발자 도구 > Performance 탭
- React DevTools로 컴포넌트 렌더링 확인

## 🎯 예상 결과

### 정상 작동 시

1. **백엔드**
   - 포트 5002에서 실행 (main_server)
   - `/api/health` 응답: `{"status": "healthy", ...}`
   - `/docs` 접속 시 Swagger UI 표시

2. **프론트엔드**
   - 포트 3000에서 실행
   - ChatGPT 스타일 인터페이스 표시
   - 메시지 전송/수신 정상 작동
   - 대화 저장/불러오기 정상 작동

### 문제 발생 시

- 로그 확인: 터미널 출력 확인
- 브라우저 콘솔: F12 > Console 탭
- 네트워크 탭: F12 > Network 탭

---

**테스트 완료 후**: 모든 기능이 정상 작동하면 시스템이 준비된 것입니다! 🎉

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

