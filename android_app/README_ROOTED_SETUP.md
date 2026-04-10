# 🔓 루팅폰 카카오톡 자동 추출 시스템

## 📱 시스템 개요

루팅된 Android 폰에서 카카오톡 데이터베이스에 직접 접근하여 실시간으로 대화 내용을 추출하고 웹 시스템으로 전송하는 솔루션입니다.

### ✅ 주요 기능

- **실시간 모니터링**: 카카오톡 DB 파일 변화 감지
- **자동 추출**: 새 메시지 즉시 추출 및 전송
- **완전한 데이터**: 삭제된 메시지도 복구 가능
- **미디어 지원**: 이미지, 동영상, 음성 파일 원본 접근
- **백그라운드 작업**: 사용자 개입 없이 자동 동작

## 🔧 필수 요구사항

### 📱 Android 기기

- **루팅된 Android 폰** (Android 7.0 이상 권장)
- **카카오톡 설치** 및 활성 사용
- **WiFi 연결** (PC와 같은 네트워크)
- **저장공간** 100MB 이상

### 💻 PC 환경

- **Python 3.8+** 설치
- **네트워크 연결** (폰과 같은 WiFi)
- **기존 카카오톡 AI 시스템** 실행 중

## 🚀 설치 및 설정

### 1️⃣ PC 서버 설정

```bash
# 1. 루팅폰용 서버 시작
./start_rooted_kakao_server.sh

# 2. 서버 주소 확인
# PC IP 주소를 확인하세요 (예: 192.168.1.100)
```

### 2️⃣ Android 앱 설치

```kotlin
// 1. Android Studio에서 프로젝트 빌드
// 2. APK 파일 생성
// 3. 루팅폰에 APK 설치
// 4. 앱 실행 후 권한 허용
```

### 3️⃣ 네트워크 설정

**MainActivity.kt에서 서버 주소 수정:**

```kotlin
// 실제 PC의 IP 주소로 변경
private val serverUrl = "http://192.168.1.100:8005"
```

## 📊 데이터베이스 구조

### 카카오톡 주요 테이블

```sql
-- 메시지 데이터
chat_logs:
- _id: 메시지 ID
- chat_id: 대화방 ID  
- user_id: 보낸 사람 ID
- nickname: 보낸 사람 이름
- message: 메시지 내용
- type: 메시지 타입 (1=텍스트, 2=이미지...)
- created_at: 생성 시간
- attachment: 첨부파일 경로

-- 대화방 정보
open_chat_link:
- id: 대화방 ID
- nickname: 대화방 이름
- type: 대화방 타입 (1=개인, 2=그룹, 3=오픈대화)
- member_count: 참여자 수
- members: 참여자 목록
```

## 🔄 동작 원리

### 실시간 모니터링

```kotlin
// FileObserver로 DB 파일 변화 감지
fileObserver = object : FileObserver(dbFolder, MODIFY) {
    override fun onEvent(event: Int, path: String?) {
        if (path?.contains("KakaoTalk") && path.endsWith(".db")) {
            extractNewMessages() // 새 메시지 즉시 추출
        }
    }
}
```

### 데이터 추출 프로세스

```
1. 루트 권한으로 DB 파일 복사
2. SQLite 데이터베이스 읽기
3. 메시지/대화방 정보 파싱
4. JSON 형식으로 변환
5. HTTP API로 PC 서버 전송
6. 기존 웹 시스템과 동기화
```

## 🛡️ 보안 및 개인정보

### 데이터 보호

- **로컬 우선**: 데이터를 먼저 폰에 저장
- **선택적 전송**: 사용자가 원하는 대화만
- **암호화 전송**: HTTPS 통신
- **접근 제한**: 루트 권한 필요

### 권한 요청

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 📱 앱 사용법

### 기본 조작

1. **모니터링 시작**: 🚀 버튼 클릭
2. **상태 확인**: 📊 상태 영역 모니터링
3. **수동 동기화**: 🔄 버튼으로 강제 동기화
4. **모니터링 중지**: ⏹️ 버튼 클릭

### 상태 메시지

- `✅ 실시간 모니터링 시작됨`: 정상 동작
- `🔄 새 메시지 X개 추출됨`: 새 메시지 감지
- `❌ 루트 권한이 필요합니다`: 권한 문제
- `✅ 서버 동기화 완료`: 데이터 전송 성공

## 🔧 API 엔드포인트

### 서버 수신 API (포트 8005)

```
POST /api/rooted/messages/bulk        # 대량 메시지 수신
POST /api/rooted/message              # 단일 메시지 수신
POST /api/rooted/chatrooms/bulk       # 대화방 정보 수신
GET  /api/rooted/messages/unprocessed # 미처리 메시지 조회
POST /api/rooted/sync-with-main-system # 메인 시스템 동기화
POST /api/rooted/upload-media         # 미디어 파일 업로드
```

### 데이터 형식

```json
{
  "message_id": "12345",
  "chat_room_id": "room_001",
  "sender_id": "user_123",
  "sender_name": "홍길동",
  "content": "안녕하세요",
  "message_type": "text",
  "timestamp": 1640995200000,
  "is_sent_by_me": false,
  "attachment_path": null,
  "attachment_type": null
}
```

## 🚨 문제 해결

### 일반적인 오류

**루트 권한 오류**

```
❌ 루트 권한이 필요합니다!
→ SuperSU 또는 Magisk로 루트 권한 확인
→ 앱에서 루트 권한 허용
```

**네트워크 연결 실패**

```
❌ 서버 연결 실패
→ PC와 폰이 같은 WiFi 연결 확인
→ 방화벽/보안 프로그램 확인
→ 서버 IP 주소 정확성 확인
```

**데이터베이스 접근 실패**

```
❌ DB 접근 불가
→ 카카오톡 실행 상태 확인
→ 루트 권한 재확인
→ 앱 재시작 후 재시도
```

### 디버깅 정보

```kotlin
// 로그 확인
adb logcat | grep "KakaoRootExtractor"

// 데이터베이스 경로 확인
/data/data/com.kakao.talk/databases/KakaoTalk.db
/data/data/com.kakao.talk/databases/KakaoTalk2.db
```

## ⚡ 성능 최적화

### 권장 설정

- **배터리 최적화 제외**: 앱을 배터리 절약 모드에서 제외
- **백그라운드 실행 허용**: 자동 실행 권한 설정
- **네트워크 안정성**: 5GHz WiFi 사용 권장

### 리소스 사용량

- **CPU**: 5-10% (모니터링 시)
- **메모리**: 30-50MB
- **네트워크**: 1-5MB/시간
- **배터리**: 일 5-10% 추가 소모

## 🎯 활용 시나리오

### 실시간 대화 분석

1. 카카오톡 대화 자동 추출
2. AI 시스템으로 실시간 분석
3. 적절한 응답 자동 생성
4. 웹에서 응답 확인 및 선택

### 대화 백업 및 보관

1. 전체 대화 히스토리 추출
2. 체계적인 분류 및 저장
3. 검색 가능한 아카이브 구축
4. 중요 대화 하이라이트

## 📈 확장 가능성

### 향후 개발 계획

- **다중 기기 지원**: 여러 폰 동시 모니터링
- **선택적 대화방**: 특정 대화방만 모니터링
- **스마트 필터링**: AI 기반 중요 메시지 자동 선별
- **실시간 알림**: 중요 메시지 즉시 알림

### 기술적 확장

- **다른 메신저 지원**: 텔레그램, 라인 등
- **클라우드 연동**: AWS, Google Cloud 연결
- **머신러닝**: 대화 패턴 학습 및 예측

---

## ⚠️ 중요 참고사항

1. **법적 고지**: 개인정보보호법 및 통신비밀보호법 준수
2. **책임 제한**: 개인용도로만 사용, 상업적 이용 금지
3. **보안 주의**: 루팅으로 인한 보안 위험 인지
4. **데이터 관리**: 민감한 대화 내용 신중 처리

**이 시스템은 개인의 편의를 위한 도구입니다. 타인의 개인정보를 무단으로 수집하거나 악용하지 마세요.**
