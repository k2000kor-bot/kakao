# CORBU AI Backend API 문서

## 개요

CORBU AI Backend API는 인증, 보안, 사용자 관리 시스템을 제공하는 FastAPI 기반 RESTful API입니다.

- **버전**: 1.0.0
- **기본 URL**: `http://localhost:5001`
- **문서**: `http://localhost:5001/docs` (Swagger UI)
- **ReDoc**: `http://localhost:5001/redoc`

## 주요 기능

### 1. 인증 시스템
- 사용자 회원가입
- 로그인/로그아웃
- 토큰 갱신
- 비밀번호 변경/재설정
- 현재 사용자 정보 조회

### 2. 보안 시스템
- 보안 이벤트 로깅
- 보안 메트릭 조회
- 보안 설정 관리

### 3. 사용자 관리
- 사용자 프로필 조회/업데이트
- 사용자 설정 조회/업데이트

### 4. 시스템 모니터링
- 헬스 체크
- 성능 메트릭
- 시스템 통계

## API 엔드포인트

### 인증 엔드포인트

#### POST `/api/auth/register`
사용자 회원가입

**요청 본문:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "user",
      "permissions": ["read", "write"],
      "isActive": true,
      "createdAt": "string"
    }
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "string"
}
```

#### POST `/api/auth/login`
사용자 로그인

**요청 본문:**
```json
{
  "username": "string",
  "password": "string"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": {
      "accessToken": "string",
      "refreshToken": "string",
      "expiresIn": 1800,
      "tokenType": "Bearer"
    }
  }
}
```

#### POST `/api/auth/logout`
사용자 로그아웃

**요청 본문:**
```json
{
  "refreshToken": "string"
}
```

#### POST `/api/auth/refresh`
토큰 갱신

**요청 본문:**
```json
{
  "refreshToken": "string"
}
```

#### POST `/api/auth/change-password`
비밀번호 변경 (인증 필요)

**헤더:**
```
Authorization: Bearer {accessToken}
```

**요청 본문:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### POST `/api/auth/reset-password`
비밀번호 재설정

**요청 본문:**
```json
{
  "email": "string"
}
```

#### GET `/api/auth/me`
현재 사용자 정보 조회 (인증 필요)

**헤더:**
```
Authorization: Bearer {accessToken}
```

### 보안 엔드포인트

#### POST `/api/security/events`
보안 이벤트 로깅

**요청 본문:**
```json
{
  "type": "login|logout|failed_login|permission_denied|suspicious_activity",
  "userId": "string (optional)",
  "ipAddress": "string",
  "userAgent": "string",
  "details": {},
  "severity": "low|medium|high|critical"
}
```

#### GET `/api/security/events?limit=100`
보안 이벤트 조회

#### GET `/api/security/metrics`
보안 메트릭 조회

#### GET `/api/security/config`
보안 설정 조회

#### PUT `/api/security/config`
보안 설정 업데이트

### 사용자 프로필 엔드포인트

#### GET `/api/user-profile/{user_id}`
사용자 프로필 조회 (인증 필요)

#### POST `/api/update-user-profile`
사용자 프로필 업데이트 (인증 필요)

**요청 본문:**
```json
{
  "fullName": "string (optional)",
  "avatar": "string (optional)",
  "phone": "string (optional)",
  "location": "string (optional)",
  "bio": "string (optional)",
  "preferences": {}
}
```

### 사용자 설정 엔드포인트

#### GET `/api/user/settings`
사용자 설정 조회 (인증 필요)

#### PUT `/api/user/settings`
사용자 설정 업데이트 (인증 필요)

**요청 본문:**
```json
{
  "theme": "light|dark|auto (optional)",
  "language": "ko|en (optional)",
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  },
  "preferences": {}
}
```

### 시스템 엔드포인트

#### GET `/`
루트 엔드포인트

#### GET `/health`
헬스 체크

#### GET `/api/health`
상세 헬스 체크

#### GET `/api/status`
API 상태 확인

#### GET `/api/version`
API 버전 정보

#### GET `/api/metrics`
성능 메트릭 조회

#### GET `/api/test`
API 테스트 엔드포인트

#### GET `/api/test/auth`
인증 테스트 엔드포인트 (인증 필요)

### 유틸리티 엔드포인트

#### POST `/api/utils/validate-email`
이메일 형식 검증

#### POST `/api/utils/validate-password`
비밀번호 강도 검증

#### GET `/api/utils/stats`
시스템 통계 조회

#### POST `/api/utils/init-database`
데이터베이스 초기화 (관리자만)

#### GET `/api/utils/export-data`
데이터 내보내기 (관리자만)

## 인증

대부분의 엔드포인트는 Bearer 토큰 인증을 사용합니다.

**헤더 형식:**
```
Authorization: Bearer {accessToken}
```

## 에러 응답

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "success": false,
  "error": "에러 메시지",
  "status_code": 400,
  "timestamp": "string",
  "path": "string"
}
```

## 응답 형식

성공 응답은 다음 형식을 따릅니다:

```json
{
  "success": true,
  "data": {...},
  "message": "성공 메시지 (optional)",
  "timestamp": "string"
}
```

## 환경 변수

다음 환경 변수를 설정할 수 있습니다:

- `API_PORT`: API 포트 (기본값: 5001)
- `API_HOST`: API 호스트 (기본값: 0.0.0.0)
- `DEBUG`: 디버그 모드 (기본값: false)
- `RELOAD`: 자동 리로드 (기본값: true)

## 실행 방법

```bash
cd backend
python app.py
```

또는 환경 변수와 함께:

```bash
API_PORT=5001 API_HOST=0.0.0.0 python app.py
```

## 의존성

필수 패키지:
- fastapi
- uvicorn
- pydantic
- psutil

설치:
```bash
pip install fastapi uvicorn pydantic psutil
```

## 보안 고려사항

1. **프로덕션 환경에서는**:
   - JWT 토큰 사용 권장
   - bcrypt를 사용한 비밀번호 해싱
   - 데이터베이스 사용 (메모리 저장소 대신)
   - HTTPS 사용
   - Rate Limiting 구현

2. **현재 구현**:
   - SHA-256 해싱 (프로덕션에서는 bcrypt 권장)
   - 메모리 저장소 (프로덕션에서는 데이터베이스 권장)
   - 간단한 토큰 시스템 (프로덕션에서는 JWT 권장)

## API 버전 관리

현재 API 버전: 1.0.0

버전 정보는 `/api/version` 엔드포인트에서 확인할 수 있습니다.

## 로깅

모든 요청은 자동으로 로깅됩니다:
- 요청 시간
- HTTP 메서드 및 경로
- 클라이언트 IP
- 응답 상태 코드
- 처리 시간

## 성능 모니터링

`/api/metrics` 엔드포인트를 통해 다음 정보를 확인할 수 있습니다:
- CPU 사용률
- 메모리 사용률
- 디스크 사용률
- 네트워크 통계
- 프로세스 정보
- 애플리케이션 통계

