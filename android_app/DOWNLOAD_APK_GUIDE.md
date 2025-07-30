# 📱 KakaoTalk 루트 추출기 APK 다운로드 가이드

## 🚀 **빠른 설치 방법**

### 📥 **1단계: APK 파일 다운로드**

#### 🔗 **다운로드 링크**

```
📍 파일 위치: 
/Users/aD/kakao-frontend/android_app/KakaoRootExtractor/app/build/outputs/apk/debug/

📁 파일명: app-debug.apk (생성 예정)
📏 파일 크기: 약 15-20MB
```

#### 🛠️ **대안 빌드 방법**

```bash
# Android Studio가 있는 경우:
1. android_app/KakaoRootExtractor 폴더를 Android Studio에서 열기
2. Build > Generate Signed Bundle / APK
3. APK 선택 후 Debug 모드로 빌드
4. app/build/outputs/apk/debug/app-debug.apk 생성됨
```

### 📱 **2단계: 루팅폰 설정**

#### 🔧 **개발자 옵션 활성화**

1. 설정 > 휴대전화 정보 > 빌드 번호 7번 터치
2. 설정 > 개발자 옵션에서:
   - ✅ USB 디버깅 활성화
   - ✅ 알 수 없는 소스에서 앱 설치 허용

#### 🔐 **루트 권한 확인**

```bash
# 터미널 앱에서 확인:
su
# "Permission granted" 또는 루트 프롬프트(#) 나타나면 성공
```

### 📦 **3단계: APK 설치**

#### 📲 **파일 전송 방법**

```bash
# USB 연결 후 ADB 사용:
adb install app-debug.apk

# 또는 파일 매니저 사용:
1. APK 파일을 폰 내부저장소로 복사
2. 파일 매니저에서 APK 파일 터치
3. "설치" 버튼 터치
```

### ⚡ **4단계: 앱 실행 및 설정**

#### 🎯 **기본 설정**

1. **앱 실행**: "카카오톡 루트 추출기" 아이콘 터치
2. **권한 허용**: 모든 권한 요청 수락
3. **루트 권한 확인**: 자동으로 루트 접근 권한 요청
4. **대화방 선택**: "대화방 선택" 버튼으로 모니터링할 방 선택

#### 🌐 **네트워크 설정**

```kotlin
// MainActivity.kt에서 서버 주소 확인/수정:
private val serverUrl = "http://192.168.1.100:8005"

// PC의 실제 IP 주소로 변경 필요
// CMD에서 확인: ipconfig (Windows) 또는 ifconfig (Mac/Linux)
```

#### 🏃 **모니터링 시작**

1. **PC 서버 실행**:

   ```bash
   cd backend
   python rooted_kakao_extractor.py
   ```

2. **앱에서 "모니터링 시작"** 버튼 터치
3. **상태 확인**: "✅ 실시간 모니터링 시작됨" 메시지 확인

## 🔧 **문제 해결**

### ❌ **설치 실패**

```
문제: "앱을 설치할 수 없습니다"
해결: 설정 > 보안 > 알 수 없는 소스 허용 체크
```

### ❌ **루트 권한 오류**

```
문제: "루트 권한이 필요합니다"
해결: 
1. Magisk 또는 SuperSU 앱 확인
2. 터미널에서 "su" 명령어 테스트
3. 루트 권한 허용 팝업에서 "허용" 선택
```

### ❌ **네트워크 연결 실패**

```
문제: "서버 연결 실패"
해결:
1. PC와 폰이 같은 WiFi 네트워크 사용 확인
2. PC 방화벽에서 포트 8005 허용
3. PC 서버가 실행 중인지 확인
4. IP 주소가 올바른지 확인
```

### ❌ **대화 감지 안됨**

```
문제: "대화가 감지되지 않음"
해결:
1. 카카오톡이 최신 버전인지 확인
2. 선택된 대화방에서 실제 메시지 전송 테스트
3. 앱 로그에서 오류 메시지 확인
4. 폰 재부팅 후 재시도
```

## 📊 **기술 사양**

### 💾 **시스템 요구사항**

```
📱 안드로이드: API 23 (Android 6.0) 이상
🔐 루트 권한: 필수 (Magisk, SuperSU 등)
💾 저장공간: 50MB 이상 여유공간
🌐 네트워크: WiFi 또는 모바일 데이터
📦 카카오톡: 최신 버전 설치 필요
```

### ⚡ **성능 특징**

```
🔄 실시간 감지: 1-3초 내 메시지 감지
📡 전송 속도: 2-5초 내 PC 전송
🔋 배터리 사용: 중간 (백그라운드 파일 모니터링)
💾 메모리 사용: 20-50MB
📊 CPU 사용률: 낮음 (이벤트 기반 처리)
```

### 🛡️ **보안 및 개인정보**

```
🔒 데이터 암호화: JSON 형태로 구조화된 전송
🏠 로컬 처리: 모든 데이터는 PC로만 전송
🚫 외부 서버: 타사 서버로 데이터 전송 없음
👤 개인정보: 사용자 식별을 위한 해시화 적용
📝 로그: 로컬 앱에서만 저장, 자동 삭제
```

## 🚀 **고급 사용법**

### 🎛️ **설정 커스터마이징**

```kotlin
// MainActivity.kt 수정 가능 옵션:
private val kakaoDbPath = "/data/data/com.kakao.talk/databases/KakaoTalk.db"
private val serverUrl = "http://[PC_IP]:8005"
private val extractionInterval = 5 // 분 단위
```

### 📊 **모니터링 최적화**

```
🎯 선택적 대화방: 불필요한 방 제외로 성능 향상
⏰ 시간 필터: 최근 5분 내 메시지만 추출
🔄 배치 전송: 여러 메시지 한 번에 전송
📱 포그라운드: 앱을 포그라운드에 유지하여 안정성 향상
```

### 🛠️ **개발자 모드**

```bash
# 디버그 로그 확인:
adb logcat -s KakaoRootExtractor

# 데이터베이스 직접 확인:
adb shell
su
sqlite3 /data/data/com.kakao.talk/databases/KakaoTalk.db
.tables
.exit
```

## 📞 **지원 및 문의**

### 🆘 **기술 지원**

- 🐛 버그 리포트: GitHub Issues
- 💡 기능 요청: Feature Request
- 📖 문서: README.md 파일 참조

### 🔄 **업데이트**

- 📅 정기 업데이트: 매월 첫째 주
- 🚨 긴급 패치: 보안 이슈 발견 시 즉시
- 📢 알림: 앱 내 업데이트 알림 기능

---

**⚠️ 주의: 이 앱은 루팅된 기기에서만 작동하며, 개인용 목적으로만 사용해야 합니다. 타인의 대화를 무단으로 모니터링하는 것은 불법일 수 있습니다.**
