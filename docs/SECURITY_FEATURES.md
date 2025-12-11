# 보안 기능 문서

## 개요

CORBU AI 시스템의 고급 보안 기능에 대한 문서입니다. 이 문서는 보안 API, 실시간 모니터링, 자동화 규칙 등 모든 보안 관련 기능을 설명합니다.

## 목차

1. [보안 API 서비스](#보안-api-서비스)
2. [실시간 모니터링](#실시간-모니터링)
3. [자동화 규칙](#자동화-규칙)
4. [사용 가이드](#사용-가이드)

---

## 보안 API 서비스

### 개요

`advancedSecurityService`는 백엔드의 고급 보안 API와 통신하는 프론트엔드 서비스입니다.

### 주요 기능

#### 1. 보안 위협 관리

```typescript
import advancedSecurityService from './services/advancedSecurityService';

// 위협 목록 조회
const threats = await advancedSecurityService.getSecurityThreats('high', 'detected');

// 위협 해결
await advancedSecurityService.resolveThreat('threat_id', { resolved: true });
```

#### 2. IP 관리

```typescript
// IP 차단
await advancedSecurityService.blockIP({
    ip_address: '192.168.1.100',
    reason: 'Brute force attack',
    severity: 'high'
});

// IP 차단 해제
await advancedSecurityService.unblockIP('192.168.1.100');

// 차단된 IP 목록 조회
const blockedIPs = await advancedSecurityService.getBlockedIPs();

// IP 화이트리스트 추가
await advancedSecurityService.whitelistIP({
    ip_address: '192.168.1.50',
    reason: 'Trusted server'
});
```

#### 3. 보안 정책 관리

```typescript
// 정책 생성
const policy = await advancedSecurityService.createSecurityPolicy({
    name: 'Access Control Policy',
    description: 'Restrict access to sensitive resources',
    policy_type: 'access_control',
    enabled: true
});

// 정책 목록 조회
const policies = await advancedSecurityService.getSecurityPolicies();

// 정책 업데이트
await advancedSecurityService.updateSecurityPolicy('policy_id', {
    enabled: false
});
```

#### 4. 보안 스캔

```typescript
// 전체 스캔 실행
const scanResult = await advancedSecurityService.runSecurityScan('full');

// 빠른 스캔 실행
const quickScan = await advancedSecurityService.runSecurityScan('quick');
```

#### 5. 암호화/복호화

```typescript
// 데이터 암호화
const encrypted = await advancedSecurityService.encryptData({
    secret: 'sensitive data'
});

// 데이터 복호화
const decrypted = await advancedSecurityService.decryptData(
    encrypted.encrypted_data,
    encrypted.key_id
);
```

#### 6. Rate Limiting

```typescript
// Rate Limiting 설정
await advancedSecurityService.configureRateLimit({
    endpoint: '/api/chat',
    requests_per_minute: 60,
    requests_per_hour: 1000,
    enabled: true
});

// 설정 조회
const configs = await advancedSecurityService.getRateLimitConfig();
```

---

## 실시간 모니터링

### WebSocket 서비스

`securityWebSocketService`를 사용하여 실시간 보안 이벤트를 수신할 수 있습니다.

### 사용 방법

```typescript
import securityWebSocketService from './services/securityWebSocketService';

// 연결 시작
securityWebSocketService.connect();

// 이벤트 리스너 등록
securityWebSocketService.on('threat', (data) => {
    console.log('위협 감지:', data);
});

securityWebSocketService.on('alert', (data) => {
    console.log('보안 알림:', data);
});

securityWebSocketService.on('status_update', (data) => {
    console.log('상태 업데이트:', data);
});

// 특정 이벤트 구독
securityWebSocketService.subscribe('threat');
securityWebSocketService.subscribe('alert');

// 연결 종료
securityWebSocketService.disconnect();
```

### 지원 이벤트 타입

- `threat`: 보안 위협 감지
- `alert`: 보안 알림
- `event`: 보안 이벤트
- `status_update`: 보안 상태 업데이트
- `scan_result`: 스캔 결과

---

## 자동화 규칙

### 개요

`securityAutomationService`는 보안 이벤트에 대한 자동 대응 규칙을 관리합니다.

### 기본 규칙

시스템에는 다음 3개의 기본 규칙이 포함되어 있습니다:

1. **브루트 포스 공격 자동 차단**
   - 트리거: 5회 이상 로그인 실패
   - 액션: IP 자동 차단, 관리자 알림

2. **위협 감지 시 자동 스캔**
   - 트리거: 심각한 위협 감지
   - 액션: 전체 보안 스캔 실행, 긴급 알림

3. **의심스러운 활동 자동 알림**
   - 트리거: 고위험 이벤트 감지
   - 액션: 알림 전송

### 사용 방법

```typescript
import securityAutomationService from './services/securityAutomationService';

// 모니터링 시작
securityAutomationService.startMonitoring();

// 규칙 추가
const rule = securityAutomationService.addRule({
    name: 'Custom Rule',
    description: 'Custom automation rule',
    trigger: {
        type: 'event',
        condition: 'failed_login_count >= 3',
        severity: 'medium'
    },
    actions: [
        {
            type: 'send_alert',
            params: { severity: 'medium' }
        }
    ],
    enabled: true
});

// 규칙 목록 조회
const rules = securityAutomationService.getRules();

// 규칙 업데이트
securityAutomationService.updateRule(rule.id, {
    enabled: false
});

// 규칙 삭제
securityAutomationService.deleteRule(rule.id);

// 모니터링 중지
securityAutomationService.stopMonitoring();
```

### 트리거 타입

- `threat`: 위협 감지
- `alert`: 알림 발생
- `event`: 보안 이벤트
- `metric`: 메트릭 기반

### 액션 타입

- `block_ip`: IP 차단
- `send_alert`: 알림 전송
- `run_scan`: 보안 스캔 실행
- `update_policy`: 정책 업데이트
- `notify_admin`: 관리자 알림

---

## 사용 가이드

### AdvancedSecurityPanel 컴포넌트

고급 보안 기능을 사용하는 가장 쉬운 방법은 `AdvancedSecurityPanel` 컴포넌트를 사용하는 것입니다.

```tsx
import AdvancedSecurityPanel from './components/Security/AdvancedSecurityPanel';

function App() {
    return (
        <div>
            <AdvancedSecurityPanel />
        </div>
    );
}
```

### SecurityDashboard 통합

`SecurityDashboard`의 "고급 보안" 탭에서 모든 기능에 접근할 수 있습니다.

### 주요 탭

1. **위협 관리**: 보안 위협 조회 및 해결
2. **알림**: 보안 알림 확인 및 처리
3. **IP 관리**: IP 차단/화이트리스트 관리
4. **보안 정책**: 정책 생성 및 관리
5. **Rate Limiting**: 요청 제한 설정
6. **보안 스캔**: 스캔 실행 및 결과 확인
7. **자동화 규칙**: 규칙 생성 및 관리

---

## 에러 처리

모든 API 호출은 적절한 에러 처리를 포함합니다:

```typescript
try {
    const threats = await advancedSecurityService.getSecurityThreats();
} catch (error) {
    if (error instanceof Error) {
        console.error('오류:', error.message);
        // 사용자에게 적절한 메시지 표시
    }
}
```

---

## 입력 검증

다음 기능들은 입력 검증을 포함합니다:

- IP 주소 형식 검증
- 심각도 값 검증
- 정책 이름 길이 검증
- 정책 유형 검증

---

## 성능 고려사항

- WebSocket 연결은 자동 재연결 기능을 포함합니다
- 대량 데이터 조회 시 `limit` 파라미터 사용 권장
- 실시간 업데이트는 2초 간격으로 전송됩니다

---

## 보안 모범 사례

1. **정기적인 보안 스캔**: 주 1회 이상 전체 스캔 실행
2. **자동화 규칙 활용**: 일반적인 위협에 대한 자동 대응 규칙 설정
3. **IP 관리**: 의심스러운 IP는 즉시 차단
4. **정책 검토**: 보안 정책을 정기적으로 검토 및 업데이트
5. **감사 로그 확인**: 정기적으로 감사 로그를 확인하여 이상 징후 파악

---

## API 엔드포인트 목록

### 보안 위협

- `GET /security/threats` - 위협 목록 조회
- `POST /security/threats/{id}/resolve` - 위협 해결

### 보안 이벤트

- `GET /security/events` - 이벤트 목록 조회

### 암호화

- `POST /security/encrypt` - 데이터 암호화
- `POST /security/decrypt` - 데이터 복호화
- `GET /security/keys` - 암호화 키 목록
- `POST /security/keys` - 암호화 키 생성

### 비밀번호

- `POST /security/hash` - 비밀번호 해시
- `POST /security/verify-password` - 비밀번호 검증

### JWT 토큰

- `POST /security/generate-token` - 토큰 생성
- `POST /security/verify-token` - 토큰 검증

### 감사 로그

- `GET /security/audit-logs` - 감사 로그 조회

### 보안 상태

- `GET /security/status` - 보안 상태 조회
- `POST /security/scan` - 보안 스캔 실행

### IP 관리

- `POST /security/ip/block` - IP 차단
- `DELETE /security/ip/block/{ip}` - IP 차단 해제
- `GET /security/ip/blocked` - 차단된 IP 목록
- `POST /security/ip/whitelist` - IP 화이트리스트 추가
- `GET /security/ip/whitelist` - 화이트리스트 IP 목록

### Rate Limiting

- `POST /security/rate-limit` - Rate Limiting 설정
- `GET /security/rate-limit` - 설정 조회

### 보안 정책

- `POST /security/policies` - 정책 생성
- `GET /security/policies` - 정책 목록 조회
- `PUT /security/policies/{id}` - 정책 업데이트

### 보안 알림

- `GET /security/alerts` - 알림 목록 조회
- `POST /security/alerts/{id}/acknowledge` - 알림 확인

### WebSocket

- `WS /ws/security` - 실시간 보안 모니터링

---

## 문제 해결

### WebSocket 연결 실패

1. 백엔드 서버가 실행 중인지 확인
2. 포트가 올바른지 확인 (기본값: 8000)
3. 방화벽 설정 확인

### API 호출 실패

1. 네트워크 연결 확인
2. 백엔드 서버 로그 확인
3. CORS 설정 확인

### 자동화 규칙이 작동하지 않음

1. 규칙이 활성화되어 있는지 확인
2. 모니터링이 시작되었는지 확인
3. 트리거 조건이 올바른지 확인

---

## 추가 리소스

- [백엔드 API 문서](../backend/api/advanced_security_api.py)
- [보안 모범 사례 가이드](./SECURITY_BEST_PRACTICES.md)
- [문제 해결 가이드](./TROUBLESHOOTING.md)
