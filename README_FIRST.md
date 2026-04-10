# 처음 시작하기

**CORBU.AI 시스템을 처음 사용하시나요?**

이 문서는 가장 빠르게 시작하는 방법을 안내합니다.

---

## ⚡ 3단계로 시작하기

### 1단계: 의존성 설치

```bash
./setup.sh
```

### 2단계: 시스템 실행

```bash
./start_all.sh
```

### 3단계: 브라우저 접속

http://localhost:3000

---

## 🎯 주요 기능

### 즉시 사용 가능
1. **ChatGPT 스타일 대화**: 질문하고 답변 받기
2. **프로젝트 관리**: 프로젝트별로 대화 분리
3. **긴 글 자동 생성**: 질문하면 자동으로 상세한 글 생성 🆕
4. **마크다운 지원**: 코드 블록, 링크, 표 등

---

## ✨ 최신 기능: 긴 글 자동 생성

질문이나 요구를 입력하면 자동으로 상세한 긴 글이 생성됩니다!

**예시**:
- "인공지능에 대해 글 작성해줘" → 500자 이상의 상세한 글
- "Python이란 무엇인가요?" → 300자 이상의 상세한 답변

---

## 📚 더 알아보기

- [개발·검증 요약](./DEVELOPMENT_FINAL_REPORT.md) — 타입·린트·테스트·빌드 상태, 다음 권장 단계
- [설정 가이드](./SETUP_GUIDE.md)
- [빠른 시작 가이드](./START_HERE.md)
- [5분 안에 시작하기](./QUICK_START.md)
- [사용 가이드(메뉴얼)](./USAGE_GUIDE.md) — 화면 구성·프로젝트·대화·고급 기능 상세
- [메뉴얼 한 페이지 요약](./docs/guides/MANUAL_QUICK_REFERENCE.md) — 핵심만 빠르게
- [TTS 가이드](./docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md) — 목소리 생성·샘플 스타일
- [노트북 LLM 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md) — 프로젝트 연동 상세
- [긴 글 생성 기능](./LONG_FORM_WRITING_FEATURE.md)
- [개발 연속성 가이드](./docs/DEVELOPMENT_CONTINUITY.md) — 개발자: 경로·컴포넌트 매핑·기능 추가 체크리스트
- [응답·입력 문자열 정리](./docs/guides/RESPONSE_CLEANING.md) — 개발자: `coerceTrimmedString`·`npm run test:frontend:chat-pipeline`·미러 동기화

---

## 🆘 문제 해결

### 서버가 시작되지 않는 경우
1. `./stop_all.sh` 후 `./start_all.sh` 재시도
2. `npm run check:system` 으로 상태 확인
3. 의존성: `./setup.sh` 재실행

### LLM이 작동하지 않는 경우
1. 환경 변수 확인 (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY` 등)
2. Ollama 실행 확인 (로컬 LLM 사용 시)
3. 백엔드 로그 확인

자세한 내용은 [사용 가이드](./USAGE_GUIDE.md#-문제-해결)를 참고하세요.

---

## ✅ 준비 완료!

**시스템이 준비되었습니다!**

**지금 바로 시작하세요!** 🚀

```bash
./start_all.sh
```

---

**행운을 빕니다!** 🎉

