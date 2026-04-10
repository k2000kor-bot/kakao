#!/bin/bash
# CORBU.AI - 플러그인/선택 기능 설치 스크립트
# OCR, 영상 음성 추출, 로컬 LLM 등 추가 기능을 위한 설치

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# 색상
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔌 CORBU.AI 플러그인 설치"
echo "=========================="
echo ""

# Homebrew 경로 (Apple Silicon / Intel)
BREW_CMD=""
for path in /opt/homebrew/bin/brew /usr/local/bin/brew; do
    if [ -x "$path" ]; then
        BREW_CMD="$path"
        break
    fi
done

# ---------- 1. 시스템 도구 (Homebrew 있으면) ----------
install_system_tools() {
    if [ -z "$BREW_CMD" ]; then
        echo -e "${YELLOW}⚠️  Homebrew 미설치 - 시스템 도구 자동 설치 생략${NC}"
        echo "   (ffmpeg, tesseract 수동 설치: https://brew.sh)"
        return
    fi

    echo -e "${BLUE}📦 [1/4] 시스템 도구 확인/설치...${NC}"

    # FFmpeg (yt-dlp, 영상→오디오 추출에 필요)
    if $BREW_CMD list ffmpeg &>/dev/null; then
        echo "   ✅ ffmpeg 이미 설치됨"
    else
        echo "   ffmpeg 설치 중..."
        $BREW_CMD install ffmpeg
        echo "   ✅ ffmpeg 설치 완료"
    fi

    # Tesseract (OCR)
    if $BREW_CMD list tesseract &>/dev/null; then
        echo "   ✅ tesseract 이미 설치됨"
    else
        echo "   tesseract 설치 중..."
        $BREW_CMD install tesseract
        echo "   ✅ tesseract 설치 완료"
    fi

    # Redis (선택, 캐싱용)
    if $BREW_CMD list redis &>/dev/null; then
        echo "   ✅ redis 이미 설치됨 (캐싱 사용 가능)"
    else
        echo "   redis 미설치 (선택: brew install redis)"
    fi

    echo ""
}

# ---------- 2. Python 선택 패키지 ----------
install_python_optional() {
    echo -e "${BLUE}📦 [2/4] Python 선택 패키지 설치...${NC}"
    cd "$PROJECT_ROOT"
    # shellcheck source=scripts/lib-activate-backend-venv.sh
    source "$PROJECT_ROOT/scripts/lib-activate-backend-venv.sh"

    if ! backend_venv_activate "$PROJECT_ROOT"; then
        echo "   ⚠️  venv 없음. 먼저 ./setup.sh 실행 후 진행하세요."
        return
    fi

    # numpy (가벼움, 필수에 가까움)
    pip install -q numpy 2>/dev/null && echo "   ✅ numpy" || echo "   ⏭️  numpy 스킵"

    # yt-dlp (FFmpeg 필요)
    if command -v ffmpeg &>/dev/null; then
        pip install -q yt-dlp 2>/dev/null && echo "   ✅ yt-dlp (YouTube/영상 음성 추출)" || echo "   ⏭️  yt-dlp 스킵"
    else
        echo "   ⏭️  yt-dlp 스킵 (ffmpeg 미설치)"
    fi

    # pytesseract (Tesseract 필요)
    if command -v tesseract &>/dev/null; then
        pip install -q pytesseract 2>/dev/null && echo "   ✅ pytesseract (OCR)" || echo "   ⏭️  pytesseract 스킵"
    else
        echo "   ⏭️  pytesseract 스킵 (tesseract 미설치)"
    fi

    echo ""
}

# ---------- 3. Ollama 안내 ----------
show_ollama_info() {
    echo -e "${BLUE}📦 [3/4] 로컬 LLM (Ollama)...${NC}"
    if command -v ollama &>/dev/null; then
        echo "   ✅ Ollama 이미 설치됨"
        ollama --version 2>/dev/null || true
    else
        echo "   📥 Ollama 미설치 (로컬 LLM 사용 시 필요)"
        echo "   설치: https://ollama.ai 또는 brew install ollama"
        echo "   실행: ollama serve && ollama pull qwen3:4b"
    fi
    echo ""
}

# ---------- 4. 설치 결과 요약 ----------
show_summary() {
    echo -e "${BLUE}📦 [4/4] 설치 상태 요약${NC}"
    echo ""
    cd "$PROJECT_ROOT"
    # shellcheck source=scripts/lib-activate-backend-venv.sh
    source "$PROJECT_ROOT/scripts/lib-activate-backend-venv.sh"
    backend_venv_activate "$PROJECT_ROOT" 2>/dev/null || true

    echo "   기능                    상태"
    echo "   ----------------------------------------"

    # yt-dlp
    python3 -c "import yt_dlp" 2>/dev/null && echo "   YouTube 음성 추출        ✅" || echo "   YouTube 음성 추출        ❌ (yt-dlp, ffmpeg)"

    # pytesseract
    python3 -c "import pytesseract" 2>/dev/null && echo "   OCR 이미지 텍스트        ✅" || echo "   OCR 이미지 텍스트        ❌ (pytesseract, tesseract)"

    # numpy
    python3 -c "import numpy" 2>/dev/null && echo "   수치 계산                ✅" || echo "   수치 계산                ❌ (numpy)"

    # Ollama
    curl -s http://localhost:11434/api/tags &>/dev/null && echo "   로컬 LLM (Ollama)        ✅ 실행 중" || echo "   로컬 LLM (Ollama)        ⏸️  미실행"

    echo ""
}

# ---------- 실행 ----------
case "${1:-all}" in
    system)
        install_system_tools
        ;;
    python)
        install_python_optional
        ;;
    ollama)
        show_ollama_info
        ;;
    status)
        show_summary
        exit 0
        ;;
    all)
        install_system_tools
        install_python_optional
        show_ollama_info
        show_summary
        ;;
    *)
        echo "사용법: $0 [all|system|python|ollama|status]"
        echo "  all    - 전체 설치 (기본값)"
        echo "  system - ffmpeg, tesseract 등 시스템 도구"
        echo "  python - numpy, yt-dlp, pytesseract"
        echo "  ollama - Ollama 안내"
        echo "  status - 설치 상태 확인"
        exit 1
        ;;
esac

echo -e "${GREEN}✅ 플러그인 설치 완료!${NC}"
echo ""
echo "📖 상세 가이드: PLUGINS_SETUP.md"
echo ""
