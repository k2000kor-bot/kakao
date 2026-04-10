#!/bin/bash

# CORBU.AI PWA 아이콘 최적화 스크립트
echo "🖼️ CORBU.AI PWA 아이콘 최적화 시작..."

# 필요한 도구 설치 확인
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick이 설치되지 않았습니다. 설치해주세요:"
    echo "brew install imagemagick"
    exit 1
fi

# public/icons 디렉토리 생성
mkdir -p public/icons

echo "📱 PWA 아이콘 생성 중..."

# 기본 아이콘들 생성 (CORBU.AI 브랜딩)
# 16x16 아이콘
convert -size 16x16 xc:transparent -fill "#3B82F6" -draw "circle 8,8 8,2" -fill white -font Arial -pointsize 6 -gravity center -draw "text 0,0 'AI'" public/icons/icon-16x16.png

# 32x32 아이콘
convert -size 32x32 xc:transparent -fill "#3B82F6" -draw "circle 16,16 16,4" -fill white -font Arial -pointsize 10 -gravity center -draw "text 0,0 'AI'" public/icons/icon-32x32.png

# 72x72 아이콘
convert -size 72x72 xc:transparent -fill "#3B82F6" -draw "circle 36,36 36,8" -fill white -font Arial -pointsize 20 -gravity center -draw "text 0,0 'AI'" public/icons/icon-72x72.png

# 96x96 아이콘
convert -size 96x96 xc:transparent -fill "#3B82F6" -draw "circle 48,48 48,10" -fill white -font Arial -pointsize 26 -gravity center -draw "text 0,0 'AI'" public/icons/icon-96x96.png

# 128x128 아이콘
convert -size 128x128 xc:transparent -fill "#3B82F6" -draw "circle 64,64 64,12" -fill white -font Arial -pointsize 32 -gravity center -draw "text 0,0 'AI'" public/icons/icon-128x128.png

# 144x144 아이콘
convert -size 144x144 xc:transparent -fill "#3B82F6" -draw "circle 72,72 72,14" -fill white -font Arial -pointsize 36 -gravity center -draw "text 0,0 'AI'" public/icons/icon-144x144.png

# 152x152 아이콘
convert -size 152x152 xc:transparent -fill "#3B82F6" -draw "circle 76,76 76,16" -fill white -font Arial -pointsize 38 -gravity center -draw "text 0,0 'AI'" public/icons/icon-152x152.png

# 192x192 아이콘
convert -size 192x192 xc:transparent -fill "#3B82F6" -draw "circle 96,96 96,18" -fill white -font Arial -pointsize 48 -gravity center -draw "text 0,0 'AI'" public/icons/icon-192x192.png

# 384x384 아이콘
convert -size 384x384 xc:transparent -fill "#3B82F6" -draw "circle 192,192 192,24" -fill white -font Arial -pointsize 96 -gravity center -draw "text 0,0 'AI'" public/icons/icon-384x384.png

# 512x512 아이콘
convert -size 512x512 xc:transparent -fill "#3B82F6" -draw "circle 256,256 256,32" -fill white -font Arial -pointsize 128 -gravity center -draw "text 0,0 'AI'" public/icons/icon-512x512.png

# 스플래시 스크린 이미지들 생성
echo "📱 스플래시 스크린 생성 중..."

# iPhone 스플래시 스크린들
convert -size 640x1136 xc:transparent -fill "#3B82F6" -draw "rectangle 0,0 640,1136" -fill white -font Arial -pointsize 48 -gravity center -draw "text 0,0 'CORBU.AI'" public/icons/splash-640x1136.png

convert -size 750x1334 xc:transparent -fill "#3B82F6" -draw "rectangle 0,0 750,1334" -fill white -font Arial -pointsize 56 -gravity center -draw "text 0,0 'CORBU.AI'" public/icons/splash-750x1334.png

convert -size 1242x2208 xc:transparent -fill "#3B82F6" -draw "rectangle 0,0 1242,2208" -fill white -font Arial -pointsize 72 -gravity center -draw "text 0,0 'CORBU.AI'" public/icons/splash-1242x2208.png

convert -size 1125x2436 xc:transparent -fill "#3B82F6" -draw "rectangle 0,0 1125,2436" -fill white -font Arial -pointsize 68 -gravity center -draw "text 0,0 'CORBU.AI'" public/icons/splash-1125x2436.png

# iPad 스플래시 스크린들
convert -size 1536x2048 xc:transparent -fill "#3B82F6" -draw "rectangle 0,0 1536,2048" -fill white -font Arial -pointsize 80 -gravity center -draw "text 0,0 'CORBU.AI'" public/icons/splash-1536x2048.png

convert -size 1668x2224 xc:transparent -fill "#3B82F6" -draw "rectangle 0,0 1668,2224" -fill white -font Arial -pointsize 84 -gravity center -draw "text 0,0 'CORBU.AI'" public/icons/splash-1668x2224.png

convert -size 2048x2732 xc:transparent -fill "#3B82F6" -draw "rectangle 0,0 2048,2732" -fill white -font Arial -pointsize 96 -gravity center -draw "text 0,0 'CORBU.AI'" public/icons/splash-2048x2732.png

# 단축 아이콘들 생성
echo "🔗 단축 아이콘 생성 중..."

# 새 프로젝트 단축 아이콘
convert -size 96x96 xc:transparent -fill "#10B981" -draw "rectangle 20,20 76,76" -fill white -font Arial -pointsize 16 -gravity center -draw "text 0,0 'NEW'" public/icons/shortcut-new-project.png

# 음성 대화 단축 아이콘
convert -size 96x96 xc:transparent -fill "#F59E0B" -draw "circle 48,48 48,12" -fill white -font Arial -pointsize 16 -gravity center -draw "text 0,0 'VOICE'" public/icons/shortcut-voice.png

# 차트 분석 단축 아이콘
convert -size 96x96 xc:transparent -fill "#8B5CF6" -draw "polygon 48,20 76,76 20,76" -fill white -font Arial -pointsize 16 -gravity center -draw "text 0,0 'CHART'" public/icons/shortcut-chart.png

# 파일 업로드 단축 아이콘
convert -size 96x96 xc:transparent -fill "#EF4444" -draw "rectangle 25,25 71,71" -fill white -font Arial -pointsize 16 -gravity center -draw "text 0,0 'FILE'" public/icons/shortcut-file.png

echo "✅ PWA 아이콘 최적화 완료!"
echo "📁 생성된 아이콘: public/icons/"
echo "📊 생성된 아이콘 수: $(ls public/icons/*.png | wc -l | tr -d ' ')"
