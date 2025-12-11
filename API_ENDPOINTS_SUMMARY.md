# API 엔드포인트 요약

**총 엔드포인트 수**: 38개

---

## 📋 엔드포인트 목록

### 1. 인증 시스템 (7개)
- `POST /api/auth/register` - 사용자 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/change-password` - 비밀번호 변경
- `POST /api/auth/reset-password` - 비밀번호 재설정
- `GET /api/auth/me` - 현재 사용자 정보

### 2. 채팅 API (1개)
- `POST /api/chat` - 채팅 메시지 처리 (긴 글 자동 생성 지원) 🆕
- `POST /chat` - 채팅 메시지 처리 (별칭)

### 3. 보안 시스템 (5개)
- `POST /api/security/events` - 보안 이벤트 기록
- `GET /api/security/events` - 보안 이벤트 조회
- `GET /api/security/metrics` - 보안 메트릭 조회
- `GET /api/security/config` - 보안 설정 조회
- `PUT /api/security/config` - 보안 설정 업데이트

### 4. 사용자 관리 (4개)
- `GET /api/user-profile/{user_id}` - 사용자 프로필 조회
- `POST /api/update-user-profile` - 사용자 프로필 업데이트
- `GET /api/user/settings` - 사용자 설정 조회
- `PUT /api/user/settings` - 사용자 설정 업데이트

### 5. 프로젝트 관리 (5개)
- `GET /api/projects` - 프로젝트 목록 조회
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/{project_id}` - 프로젝트 조회
- `PUT /api/projects/{project_id}` - 프로젝트 업데이트
- `DELETE /api/projects/{project_id}` - 프로젝트 삭제

### 6. 시스템 모니터링 (6개)
- `GET /` - 루트 엔드포인트
- `GET /health` - 헬스 체크
- `GET /api/health` - API 헬스 체크
- `GET /api/status` - API 상태 조회
- `GET /api/version` - API 버전 조회
- `GET /api/metrics` - 시스템 메트릭 조회

### 7. 테스트 및 유틸리티 (6개)
- `GET /api/test` - 기본 테스트
- `GET /api/test/auth` - 인증 테스트
- `POST /api/utils/validate-email` - 이메일 검증
- `POST /api/utils/validate-password` - 비밀번호 검증
- `GET /api/utils/stats` - 시스템 통계
- `POST /api/utils/init-database` - 데이터베이스 초기화
- `GET /api/utils/export-data` - 데이터 내보내기

---

## 🆕 최신 기능

### 긴 글 자동 생성
`POST /api/chat` 엔드포인트가 다음을 자동으로 지원합니다:

- **키워드 감지**: "글", "작성", "생성", "만들어", "에세이", "문서", "상세하게", "자세히", "길게", "포괄적으로"
- **질문 감지**: "?", "질문", "궁금", "알려줘", "설명해줘", "알려주세요"
- **자동 처리**: 감지된 키워드에 따라 상세한 긴 글 자동 생성

---

## 📊 엔드포인트 통계

- **총 엔드포인트**: 38개
- **인증**: 7개
- **채팅**: 1개 (긴 글 생성 지원)
- **보안**: 5개
- **사용자 관리**: 4개
- **프로젝트 관리**: 5개
- **시스템 모니터링**: 6개
- **테스트 및 유틸리티**: 6개

---

## 🔗 API 문서

- **Swagger UI**: http://localhost:5001/docs
- **ReDoc**: http://localhost:5001/redoc
- **OpenAPI JSON**: http://localhost:5001/openapi.json

---

## ✅ 상태

모든 엔드포인트가 정상 작동합니다!

---

**API가 완전히 준비되었습니다!** 🚀

