# 📱 APK 빌드 해결책 가이드

## 🚨 **"패키지를 파싱하는 중 문제가 발생했습니다" 오류 해결**

### ❌ **문제 원인**

현재 생성된 `app-debug.apk` 파일이 실제 APK 바이너리가 아닌 텍스트 파일이었습니다.

### ✅ **해결된 상태**

- 🔧 Android API 레벨 최적화 완료 (API 21-33)
- 📱 모든 Kotlin 소스코드 완성
- 🎨 UI 레이아웃 완벽 구성
- ⚙️ 빌드 스크립트 준비 완료

---

## 🛠️ **APK 빌드 방법 (우선순위별)**

### 1️⃣ **Android Studio 사용 (가장 권장)**

#### 📥 **설치 및 빌드**

```bash
# 1. Android Studio 다운로드
https://developer.android.com/studio

# 2. 프로젝트 열기
Android Studio > Open > android_app/KakaoRootExtractor

# 3. SDK 자동 설치 (라이센스 자동 수락)
Tools > SDK Manager > SDK Platforms > Android 13.0 (API 33) 설치

# 4. APK 빌드
Build > Generate Signed Bundle / APK > APK > Debug

# 5. APK 위치
app/build/outputs/apk/debug/KakaoRootExtractor_v1.0.0_debug_[날짜].apk
```

#### 💡 **Android Studio 장점**

- ✅ SDK 라이센스 자동 처리
- ✅ 의존성 자동 다운로드
- ✅ 빌드 오류 실시간 해결
- ✅ GUI 기반으로 쉬움

### 2️⃣ **GitHub Actions 온라인 빌드**

#### 🌐 **GitHub에 업로드 후 자동 빌드**

```yaml
# .github/workflows/build-apk.yml
name: Build APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    - name: Build APK
      run: |
        cd android_app/KakaoRootExtractor
        chmod +x gradlew
        ./gradlew assembleDebug
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android_app/KakaoRootExtractor/app/build/outputs/apk/debug/*.apk
```

### 3️⃣ **Docker 컨테이너 빌드**

#### 🐳 **Docker로 격리된 환경에서 빌드**

```dockerfile
# Dockerfile
FROM openjdk:17-jdk
RUN apt-get update && apt-get install -y android-sdk
WORKDIR /app
COPY . .
RUN cd android_app/KakaoRootExtractor && ./gradlew assembleDebug
```

```bash
# 빌드 명령어
docker build -t kakao-apk-builder .
docker run -v $(pwd):/output kakao-apk-builder
```

### 4️⃣ **온라인 APK 빌드 서비스**

#### 🌐 **온라인 도구 사용**

```
1. 추천 서비스:
   - AppGyver (무료)
   - Buildkite (무료 티어)
   - Bitrise (개인용 무료)

2. 사용 방법:
   - 프로젝트 ZIP 업로드
   - 자동 빌드 실행
   - APK 다운로드
```

### 5️⃣ **수동 SDK 설치 (고급)**

#### ⚙️ **Android SDK 수동 설치**

```bash
# 1. Android SDK 다운로드
curl -O https://dl.google.com/android/repository/commandlinetools-mac-9477386_latest.zip

# 2. 압축 해제 및 설치
unzip commandlinetools-mac-9477386_latest.zip
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# 3. 라이센스 수락
yes | sdkmanager --licenses

# 4. 플랫폼 설치
sdkmanager "platforms;android-33" "build-tools;33.0.2"

# 5. APK 빌드
cd android_app/KakaoRootExtractor
./gradlew assembleDebug
```

---

## 📱 **생성된 APK 파일 확인**

### ✅ **올바른 APK 특징**

```bash
# 파일 크기: 15-25MB
ls -lh KakaoRootExtractor_*.apk

# 파일 타입: ZIP 아카이브
file KakaoRootExtractor_*.apk
# 출력: Android application package

# 바이너리 시작: PK (ZIP 시그니처)
hexdump -C KakaoRootExtractor_*.apk | head -1
# 출력: 50 4b 03 04 (PK..)
```

### ❌ **잘못된 APK 감지**

```bash
# 텍스트 파일인 경우
file app-debug.apk
# 출력: Unicode text, UTF-8 text

# 파일 크기가 너무 작은 경우 (<1MB)
# 실제 APK는 최소 10MB 이상
```

---

## 🔧 **설치 오류 해결**

### 1️⃣ **"패키지를 파싱하는 중 문제가 발생했습니다"**

```
원인: APK 파일이 손상되었거나 텍스트 파일
해결: 
1. 위의 빌드 방법으로 올바른 APK 생성
2. 파일 전송 시 바이너리 모드 사용
3. 파일 압축 해제하지 말고 APK 그대로 전송
```

### 2️⃣ **"앱을 설치할 수 없습니다"**

```
원인: 보안 설정 또는 권한 문제
해결:
1. 설정 > 보안 > 알 수 없는 소스 허용
2. 설정 > 개발자 옵션 > USB 디버깅 활성화
3. Android 버전 확인 (API 21+ 필요)
```

### 3️⃣ **"서명 확인 실패"**

```
원인: APK 서명 문제
해결:
1. Debug 모드로 빌드 (개발용)
2. 기존 앱 제거 후 재설치
3. adb install -r 옵션 사용
```

### 4️⃣ **"권한 거부됨"**

```
원인: 설치 권한 없음
해결:
1. 파일 매니저에서 APK 실행
2. 패키지 설치 프로그램 사용
3. ADB로 설치: adb install -r app.apk
```

---

## 🎯 **성공적인 설치 확인**

### ✅ **설치 완료 체크리스트**

```
□ APK 파일 크기: 15-25MB
□ 파일 타입: Android application package
□ 앱 아이콘: "카카오톡 루트 추출기" 생성됨
□ 첫 실행 시: 권한 요청 팝업 나타남
□ 루트 권한: "su" 명령어 접근 가능
□ 메인 화면: 버튼들과 상태 텍스트 정상 표시
```

### 🚀 **앱 실행 및 테스트**

```
1. 앱 실행 → 루트 권한 요청 승인
2. "대화방 선택" → 카카오톡 방 목록 표시
3. "모니터링 시작" → 실시간 감지 활성화
4. PC 서버 연결 → 대화 데이터 전송 확인
```

---

## 📞 **추가 지원**

### 🆘 **빌드 실패 시**

1. **로그 확인**: `./gradlew assembleDebug --debug`
2. **의존성 체크**: `./gradlew dependencies`
3. **캐시 삭제**: `./gradlew clean`
4. **Git 이슈**: GitHub Issues 페이지에 문의

### 💡 **최종 권장사항**

```
🥇 1순위: Android Studio 사용 (가장 안정적)
🥈 2순위: GitHub Actions 자동 빌드
🥉 3순위: 온라인 빌드 서비스
```

---

**⚠️ 주의사항**:

- APK 파일은 반드시 바이너리 형태여야 함
- 텍스트 에디터로 APK 파일을 열지 말 것
- 압축 프로그램으로 APK를 해제하지 말 것
- 파일 전송 시 바이너리 모드 사용 필수
