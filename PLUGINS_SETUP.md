# 플러그인 및 선택 기능 설치 가이드

CORBU.AI에서 추가 기능을 사용하기 위해 필요한 플러그인/도구 설치 방법입니다.

---

## 빠른 설치

```bash
./install-plugins.sh
```

위 명령으로 대부분의 선택 기능을 설치할 수 있습니다. (Homebrew 필요)

---

## 기능별 설치

### 1. YouTube/영상에서 음성 추출 (TTS, 노트북 LLM)

**필요한 기능**: 특정인 목소리 학습, 영상 자막 수집

| 구분 | 설치 방법 |
|------|----------|
| **FFmpeg** | `brew install ffmpeg` |
| **yt-dlp** | `cd backend && source venv/bin/activate && pip install yt-dlp` |

### 2. OCR (이미지에서 텍스트 추출)

| 구분 | 설치 방법 |
|------|----------|
| **Tesseract** | `brew install tesseract` |
| **pytesseract** | `cd backend && source venv/bin/activate && pip install pytesseract` |

### 3. 로컬 LLM (Ollama)

**필요한 기능**: API 키 없이 로컬에서 AI 대화

| 구분 | 설치 방법 |
|------|----------|
| **Ollama** | [ollama.ai](https://ollama.ai) 또는 `brew install ollama` |
| **실행** | `ollama serve` (백그라운드) |
| **모델** | `ollama pull qwen3:4b` |

### 4. 수치 계산 (numpy)

일부 분석 API에서 사용. 기본적으로 설치 권장.

```bash
cd backend && source venv/bin/activate && pip install numpy
```

### 5. Redis (캐싱, 선택)

성능 모니터링 캐싱용. 없어도 동작함.

```bash
brew install redis
# 실행: redis-server (백그라운드)
```

---

## 설치 상태 확인

```bash
./install-plugins.sh status
```

---

## 개별 설치 옵션

```bash
./install-plugins.sh system   # ffmpeg, tesseract만
./install-plugins.sh python   # Python 패키지만
./install-plugins.sh ollama   # Ollama 안내만
```

---

## Homebrew 없이 설치 (macOS)

Homebrew가 없는 경우:

| 도구 | 수동 설치 |
|------|----------|
| **FFmpeg** | https://evermeet.cx/ffmpeg/ 또는 `port install ffmpeg` (MacPorts) |
| **Tesseract** | https://github.com/tesseract-ocr/tesseract |
| **Ollama** | https://ollama.ai 에서 .pkg 다운로드 |

Python 패키지만 먼저 설치:
```bash
./install-plugins.sh python   # numpy 설치 (시스템 도구 없이)
```

---

## 문제 해결

### Homebrew 없음
- 설치: https://brew.sh (`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`)
- 또는 위 표의 수동 설치

### yt-dlp 오류 (영상 추출 실패)
- FFmpeg 설치 확인: `ffmpeg -version`
- yt-dlp 설치: `pip install yt-dlp`

### OCR 동작 안 함
- Tesseract 설치 확인: `tesseract --version`
- 한국어: `brew install tesseract-lang` (선택)

### Ollama 연결 실패
- Ollama 실행 확인: `curl http://localhost:11434/api/tags`
- 모델 다운로드: `ollama pull qwen3:4b`

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

