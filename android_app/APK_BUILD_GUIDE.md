# 📱 카카오톡 루트 추출기 APK 빌드 가이드

## 🎯 개요

루팅된 Android 폰에서 카카오톡 대화를 자동으로 추출하는 앱의 설치 파일(APK)을 생성하는 방법입니다.

## 🔧 빌드 환경 요구사항

### 💻 필수 소프트웨어

- **Android Studio** (최신 버전 권장)
- **JDK 8 이상**
- **Android SDK** (API Level 24 이상)
- **Git** (소스코드 관리)

### 📱 타겟 기기

- **루팅된 Android 기기** (Android 7.0 이상)
- **SuperSU** 또는 **Magisk** 루트 관리 앱
- **카카오톡** 설치 및 활성 사용

## 🚀 빌드 방법

### 1️⃣ 소스코드 준비

```bash
# 프로젝트 클론 (또는 소스코드 복사)
cd android_app/KakaoRootExtractor

# 필요한 파일들 확인
ls -la
# ├── app/
# ├── build.gradle
# ├── gradle.properties
# ├── gradlew
# └── build_apk.sh
```

### 2️⃣ 자동 빌드 (권장)

```bash
# 빌드 스크립트 실행
./build_apk.sh

# 또는 직접 실행 권한 부여 후
chmod +x build_apk.sh
./build_apk.sh
```

**빌드 옵션 선택:**

- `1`: Debug APK (개발/테스트용)
- `2`: Release APK (실제 사용용)

### 3️⃣ 수동 빌드

```bash
# Gradle Wrapper 권한 설정
chmod +x gradlew

# Debug APK 빌드
./gradlew assembleDebug

# Release APK 빌드
./gradlew assembleRelease

# 빌드 정리
./gradlew clean
```

## 📁 생성된 APK 파일 위치

### Debug APK

```
app/build/outputs/apk/debug/
└── KakaoRootExtractor_v1.0.0_debug_YYYYMMDD_HHMM.apk
```

### Release APK

```
app/build/outputs/apk/release/
└── KakaoRootExtractor_v1.0.0_release_YYYYMMDD_HHMM.apk
```

## 📱 APK 설치 방법

### 방법 1: ADB를 통한 설치 (권장)

```bash
# 1. 루팅폰을 USB로 PC에 연결
# 2. USB 디버깅 모드 활성화
# 3. ADB로 설치
adb install app/build/outputs/apk/release/KakaoRootExtractor_v1.0.0_release_*.apk

# 설치 확인
adb shell pm list packages | grep kakao
```

### 방법 2: 직접 설치

```bash
# 1. APK 파일을 루팅폰으로 복사
# 2. 파일 탐색기에서 APK 파일 터치
# 3. "알 수 없는 소스에서 앱 설치" 허용
# 4. 설치 진행
```

### 방법 3: 웹을 통한 배포

```bash
# APK 파일을 웹 서버에 업로드 후
# 루팅폰에서 브라우저로 다운로드 및 설치
```

## ⚙️ 설치 후 설정

### 1️⃣ 앱 실행 및 권한 허용

```
📱 앱 실행
↓
🔐 루트 권한 요청 → "허용"
↓
📋 기본 권한들 허용:
  - 인터넷 접근
  - 저장공간 접근
  - 네트워크 상태 확인
```

### 2️⃣ 서버 주소 설정

```kotlin
// MainActivity.kt에서 서버 주소 수정
private val serverUrl = "http://[PC_IP_ADDRESS]:8005"

// 예시
private val serverUrl = "http://192.168.1.100:8005"
```

### 3️⃣ 백엔드 서버 시작

```bash
# PC에서 백엔드 서버 실행
cd /path/to/kakao-frontend
./start_rooted_kakao_server.sh
```

## 🔍 설치 확인 및 테스트

### 앱 설치 확인

```bash
# ADB로 설치된 앱 확인
adb shell pm list packages | grep rootextractor

# 앱 정보 확인
adb shell dumpsys package com.rootextractor.kakao
```

### 루트 권한 확인

```bash
# 루팅폰에서 직접 확인
adb shell
su
id
# 결과: uid=0(root) gid=0(root) groups=0(root) → 루트 권한 정상
```

### 네트워크 연결 테스트

```bash
# PC 서버가 실행 중인 상태에서
# 루팅폰에서 브라우저로 접속 테스트
http://[PC_IP]:8005/docs
```

## 🚨 문제 해결

### 빌드 오류

```bash
# Gradle 캐시 정리
./gradlew clean

# Gradle Daemon 재시작
./gradlew --stop
./gradlew assembleDebug
```

### 설치 오류

```bash
# 기존 앱 제거 후 재설치
adb uninstall com.rootextractor.kakao
adb install [APK_PATH]

# 서명 오류 시 디버그 APK 사용
./gradlew assembleDebug
```

### 권한 오류

```bash
# 루트 권한 재확인
adb shell
su
# SuperSU 또는 Magisk에서 앱 권한 허용 확인
```

### 연결 오류

```bash
# 방화벽 확인
# PC와 폰이 같은 WiFi 네트워크에 연결되어 있는지 확인
# 서버 주소가 올바른지 확인
```

## 📊 APK 정보

### 파일 정보

- **패키지명**: `com.rootextractor.kakao`
- **버전**: `1.0.0`
- **최소 SDK**: `24 (Android 7.0)`
- **타겟 SDK**: `34 (Android 14)`
- **권한**: 인터넷, 저장공간, 루트 접근

### 앱 기능

- ✅ 실시간 카카오톡 DB 모니터링
- ✅ 선택적 대화방 필터링
- ✅ 자동 메시지 추출 및 전송
- ✅ 사용자/채팅방 식별
- ✅ 웹 서버와 실시간 동기화

## 🎯 사용 시작

1. **APK 설치 완료** ✅
2. **루트 권한 허용** ✅  
3. **서버 주소 설정** ✅
4. **PC 서버 실행** ✅
5. **대화방 선택** ✅
6. **모니터링 시작** ✅

**🎉 모든 준비 완료! 선택된 대화방의 메시지가 자동으로 추출되어 PC로 전송됩니다!**

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 루팅 상태 확인
2. 네트워크 연결 상태
3. 서버 실행 상태
4. 앱 권한 설정

**안전하고 효율적인 카카오톡 대화 관리를 위한 완벽한 솔루션입니다!** 📱✨
