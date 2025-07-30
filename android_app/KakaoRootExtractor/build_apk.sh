#!/bin/bash

echo "📱 === 카카오톡 루트 추출기 APK 빌드 === 📱"
echo ""

# 현재 디렉토리 확인
if [[ ! -f "build.gradle" ]]; then
    echo "❌ build.gradle 파일을 찾을 수 없습니다."
    echo "   Android 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# Gradle Wrapper 실행 권한 설정
if [[ -f "gradlew" ]]; then
    chmod +x gradlew
    echo "✅ Gradle Wrapper 권한 설정 완료"
else
    echo "❌ gradlew 파일을 찾을 수 없습니다."
    exit 1
fi

echo ""
echo "🔧 빌드 옵션을 선택하세요:"
echo "1. Debug APK 빌드 (개발용)"
echo "2. Release APK 빌드 (배포용)"
echo ""
read -p "선택 (1 또는 2): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Debug APK 빌드 시작..."
        ./gradlew assembleDebug
        
        if [[ $? -eq 0 ]]; then
            echo ""
            echo "✅ Debug APK 빌드 성공!"
            echo ""
            echo "📁 APK 파일 위치:"
            find . -name "*.apk" -path "*/debug/*" | head -5
            echo ""
            echo "📱 설치 방법:"
            echo "   1. 루팅폰을 PC에 USB 연결"
            echo "   2. 'adb install [APK파일경로]' 실행"
            echo "   3. 또는 APK 파일을 폰으로 복사 후 직접 설치"
        else
            echo "❌ Debug APK 빌드 실패"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo "🔨 Release APK 빌드 시작..."
        ./gradlew assembleRelease
        
        if [[ $? -eq 0 ]]; then
            echo ""
            echo "✅ Release APK 빌드 성공!"
            echo ""
            echo "📁 APK 파일 위치:"
            find . -name "*.apk" -path "*/release/*" | head -5
            echo ""
            echo "📱 설치 방법:"
            echo "   1. 루팅폰을 PC에 USB 연결"
            echo "   2. 'adb install [APK파일경로]' 실행"
            echo "   3. 또는 APK 파일을 폰으로 복사 후 직접 설치"
            echo ""
            echo "⚠️  설치 시 주의사항:"
            echo "   - 알 수 없는 소스에서 앱 설치 허용 필요"
            echo "   - 루트 권한 관리 앱 (SuperSU, Magisk) 설치 필요"
        else
            echo "❌ Release APK 빌드 실패"
            exit 1
        fi
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac

echo ""
echo "🎉 빌드 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. 생성된 APK 파일을 루팅폰에 설치"
echo "2. 앱 실행 후 루트 권한 허용"
echo "3. PC에서 백엔드 서버 실행 (./start_rooted_kakao_server.sh)"
echo "4. 앱에서 서버 IP 주소 설정"
echo "5. 대화방 선택 후 모니터링 시작!" 