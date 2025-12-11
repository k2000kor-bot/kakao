# 빠른 테스트 가이드

## 🚀 시스템 실행

### 1. 통합 실행 (권장)

```bash
chmod +x start_all.sh
./start_all.sh
```

### 2. 개별 실행

**백엔드:**
```bash
cd backend
pip install -r requirements.txt
python app.py
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
   curl http://localhost:5001/api/health
   ```

2. **채팅 API 테스트**
   ```bash
   curl -X POST http://localhost:5001/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "안녕하세요", "quality": "enhanced"}'
   ```

3. **회원가입 테스트**
   ```bash
   curl -X POST http://localhost:5001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "test1234",
       "confirmPassword": "test1234"
     }'
   ```

### 프론트엔드 테스트

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

1. 포트 확인: `lsof -i :5001`
2. Python 버전 확인: `python --version` (3.8+ 필요)
3. 의존성 설치 확인: `pip list | grep fastapi`

### 프론트엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :3000`
2. Node.js 버전 확인: `node --version` (18+ 필요)
3. 의존성 설치 확인: `npm list react`

### API 연결 오류

1. CORS 설정 확인: `backend/app.py`의 CORS 설정
2. API URL 확인: `.env` 또는 `ChatGPTInterface.tsx`의 `API_BASE_URL`
3. 네트워크 확인: 브라우저 개발자 도구의 Network 탭

## 📊 성능 확인

### 백엔드 메트릭
```bash
curl http://localhost:5001/api/metrics
```

### 프론트엔드 성능
- 브라우저 개발자 도구 > Performance 탭
- React DevTools로 컴포넌트 렌더링 확인

## 🎯 예상 결과

### 정상 작동 시

1. **백엔드**
   - 포트 5001에서 실행
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

