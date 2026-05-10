# CORBU.AI Backend API

FastAPI 기반의 완전한 인증, 보안, 사용자 관리 시스템입니다.

## 🚀 빠른 시작

### 설치

```bash
pip install fastapi uvicorn pydantic psutil
```

### 실행

```bash
python app.py
```

서버가 시작되면 (기본 포트 5002, `API_PORT`로 변경 가능):
- **API**: http://localhost:5002
- **문서**: http://localhost:5002/api/docs
- **헬스 체크**: http://localhost:5002/api/health

## 📚 문서

- [빠른 시작 가이드](./QUICK_START.md)
- [API 상세 문서](./API_DOCUMENTATION.md)
- [구현 요약](./IMPLEMENTATION_SUMMARY.md)
- [API 사용 예제](./API_EXAMPLES.md)
- [완료 보고서](./COMPLETION_REPORT.md)

## ✨ 주요 기능

### 인증 시스템
- 사용자 회원가입/로그인/로그아웃
- 토큰 기반 인증
- 비밀번호 변경/재설정
- 현재 사용자 정보 조회

### 보안 시스템
- 보안 이벤트 로깅 및 추적
- 보안 메트릭 모니터링
- 보안 설정 관리

### 사용자 관리
- 프로필 관리
- 사용자 설정 관리

### 시스템 모니터링
- 헬스 체크
- 성능 메트릭
- 시스템 통계

## 📦 API 엔드포인트

총 **29개 엔드포인트** 제공:

- 인증: 7개
- 보안: 5개
- 사용자 관리: 4개
- 시스템: 6개
- 테스트/유틸리티: 7개

자세한 내용은 [API 문서](./API_DOCUMENTATION.md)를 참조하세요.

## 🧪 테스트

```bash
# API 테스트 스크립트 실행
python test_api.py
```

## 🔧 환경 변수

```bash
API_PORT=5002        # API 포트 (기본값: 5002, main_server 와 겹치지 않게 단독 실행)
API_HOST=0.0.0.0     # API 호스트 (기본값: 0.0.0.0)
DEBUG=false          # 디버그 모드 (기본값: false)
RELOAD=true          # 자동 리로드 (기본값: true)
```

## 📖 사용 예제

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002',
});

// 로그인
const response = await api.post('/api/auth/login', {
  username: 'testuser',
  password: 'Test1234!'
});

// 인증이 필요한 요청
const userInfo = await api.get('/api/auth/me', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});
```

### Python

```python
import requests

# 로그인
response = requests.post('http://localhost:5002/api/auth/login', json={
    'username': 'testuser',
    'password': 'Test1234!'
})

# 인증이 필요한 요청
headers = {'Authorization': f'Bearer {access_token}'}
user_info = requests.get('http://localhost:5002/api/auth/me', headers=headers)
```

더 많은 예제는 [API_EXAMPLES.md](./API_EXAMPLES.md)를 참조하세요.

## 🔒 보안

- 비밀번호 해싱 (SHA-256)
- 토큰 기반 인증
- 보안 이벤트 추적
- 요청 로깅

**프로덕션 권장사항**:
- bcrypt를 사용한 비밀번호 해싱
- JWT 토큰 사용
- HTTPS 사용
- 데이터베이스 사용

## 🛠️ 기술 스택

- **FastAPI**: 웹 프레임워크
- **Uvicorn**: ASGI 서버
- **Pydantic**: 데이터 검증
- **psutil**: 시스템 모니터링

## 📊 상태

- ✅ 인증 시스템: 완료
- ✅ 보안 시스템: 완료
- ✅ 사용자 관리: 완료
- ✅ 시스템 모니터링: 완료
- ✅ API 문서화: 완료
- ✅ 테스트 스크립트: 완료

## 📝 라이선스

이 프로젝트는 CORBU.AI의 일부입니다.

## 🤝 기여

문제가 발견되거나 개선 사항이 있으면 이슈를 등록해주세요.

## 📞 지원

- API 문서: http://localhost:5002/api/docs
- 헬스 체크: http://localhost:5002/api/health
- 버전 정보: http://localhost:5002/api/version

---

**버전**: 1.0.0  
**상태**: ✅ 프로덕션 준비 완료

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

