# TTS 및 샘플 대본 스타일 가이드

**프론트 회귀·원격 push**: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — **`npm run test:sidebar-context`**(앱 셸·사이드바와 함께 점검). [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md).

> **요약**: TTS 전체/구간별 속도(0.25~4x), docx·txt 샘플 대본 추출 → 스타일 분석 → 동일 스타일 대본 생성, 톤다운·기업보도 문서 유형 힌트. **Typecast 벤치마크 반영**: 감정 제어 **Smart Emotion(자동)** / **Preset(7종 수동)** 및 추가 지시(선택).  
> **검증**: `npm run test:tts:all` (프론트 AdvancedFeaturesPanel·scriptStyleAPI·qwenTtsService + 백엔드 test_tts_api 11). `npm run dev:check` (백엔드 125 + 타입체크 + ESLint). 벤치마크: [TYPECAST_BENCHMARK.md](TYPECAST_BENCHMARK.md).

목소리 생성(고급 기능 패널)에서 **전체/구간별 속도**와 **샘플 대본으로 톤·스타일 반영** 기능 사용 방법입니다.  
**화면에서 열기**: 고급 기능 패널 → **목소리 생성** 탭 (또는 노트북 뷰 헤더의 「목소리 생성」 버튼 → 모달).

### 시작하기
- **단순 TTS**: URL/프로젝트/상황 선택 → 대본 입력 → 재생 속도(전체) 조절 → **생성** → **재생**
- **구간별 속도**: 대본 입력 → 구간별 속도 사용 체크 → 나누기 기준 선택 → **대본을 구간으로 나누기** → 구간별 속도 설정 → **생성** → **재생 (구간 순차)**
- **샘플 스타일 반영**: **문서에서 추출** 또는 샘플 대본 붙여넣기 → (선택) 문서 유형 힌트 → **스타일 분석** → 생성할 주제/개요 입력 → **이 스타일로 대본 생성** → 생성된 대본으로 TTS **생성**
- **샘플로 대본에 맞는 목소리 만들기**: 아래 [샘플로 대본에 맞는 목소리 만들기](#샘플로-대본에-맞는-목소리-만들기) 참고

### 목차
- [1. TTS 속도 (전체 / 구간별)](#1-tts-속도-전체--구간별)
- [2. 샘플 대본으로 스타일 반영](#2-샘플-대본으로-스타일-반영)
- [3. API (백엔드)](#3-api-백엔드)
- [4. 트러블슈팅](#4-트러블슈팅)
- [5. 관련 파일](#5-관련-파일)
- [6. 관련 문서](#6-관련-문서)
- [7. 다음 단계 (개발자)](#7-다음-단계-개발자)
- [8. 디버깅·실행 (VS Code)](#8-디버깅실행-vs-code)

---

## 1. TTS 속도 (전체 / 구간별)

### 전체 속도
- **재생 속도 (전체)** 슬라이더: 0.25x ~ 4.0x
- 구간별 속도를 쓰지 않을 때, 한 번에 생성되는 전체 대본에 적용됩니다.

### 구간별 속도
1. **구간별 속도 사용** 체크
2. **나누기 기준**: 문단 / 문장 / 단어 / 줄 선택
3. **대본을 구간으로 나누기** 클릭 → 구간 목록 생성
4. 각 구간별 **속도** 슬라이더로 0.25x ~ 4.0x 설정
5. **생성** → 구간마다 해당 속도로 TTS 생성 후 **재생 (구간 순차)** 로 순서대로 재생

### 생성 결과 다운로드
- **단일 오디오**: 생성 후 **다운로드** 버튼으로 `tts-output.mp3` 저장
- **구간별 오디오**: **구간 1 다운로드**, **구간 2 다운로드** … 로 `tts-segment-1.mp3`, `tts-segment-2.mp3` 등 저장

---

## 2. 샘플 대본으로 스타일 반영

### 흐름
1. **샘플 대본 확보**
   - **문서에서 추출 (docx/txt)**: 워드 또는 텍스트 파일 업로드 → 본문 추출
   - 또는 **샘플 대본** 칸에 직접 붙여넣기
2. **문서 유형 힌트** (선택)
   - 없음 / **톤다운·보도** / **기업·PR** / 일반 대본
   - 파일명에 "톤다운", "보도", "기업" 등이 있으면 추출 후 자동 추천될 수 있음
3. **스타일 분석** → 톤·스타일·어투 요약 확인
4. **생성할 주제/개요** 입력 후 **이 스타일로 대본 생성** → 생성된 대본이 메인 대본 칸에 반영
5. 기존처럼 URL/프로젝트/상황 선택 후 **생성**으로 TTS 생성

### 문서 유형 힌트
- **톤다운·보도**: 중립·신중·격식, 과장 완화·객관 서술 강조 (톤다운안, 보도자료 등)
- **기업·PR**: 정중·객관·사실 위주 (기업 보도자료, PR 문구 등)

---

### 샘플로 대본에 맞는 목소리 만들기

올린 샘플(문서 또는 영상 URL)을 기준으로 **대본 스타일**을 맞추고, **목소리**를 선택한 뒤 **해당 대본에 맞는 음성**을 만드는 흐름입니다.

1. **고급 기능** → **목소리 생성** 탭 열기
2. **샘플 확보**
   - **문서 샘플**: **문서에서 추출 (docx/txt)** 로 워드·텍스트 파일 업로드 → 추출된 텍스트가 샘플 대본 칸에 채워짐 (파일명에 톤다운/보도 등이 있으면 문서 유형 힌트 자동 추천)
   - **영상 샘플**: 나중에 **URL** 또는 **프로젝트 보이스**로 그 영상 목소리를 쓰면 됨
3. **(선택) 문서 유형 힌트** → **스타일 분석** → **생성할 주제/개요** 입력 → **이 스타일로 대본 생성**  
   → 생성된 문장이 **메인 대본** 칸에 들어감 (샘플과 같은 톤·스타일)
4. **목소리 소스 선택**
   - **URL**: YouTube/TikTok 등 영상 URL 입력 → 그 영상 목소리로 TTS
   - **프로젝트 보이스**: 프로젝트 ID 입력 후 등록된 보이스 소스 선택
   - **상황만 선택**: 나레이션 등 기본 음성
5. **재생 속도** 조절 후 **생성** → **재생**

### 감정·상황 프롬프트 (Beta)

음성 톤·감정을 TTS에 반영하려면 **프롬프트 (Beta)** 를 사용합니다.

- **입력란**: "예: 서러운듯 울먹이며"처럼 자연어로 감정·상황을 입력하면, 생성 시 **instructions**로 전달되어 해당 톤으로 합성됩니다.
- **빠른 태그**: `#명료하게`, `#따뜻하게`, `#추궁하듯`, `#넋을 잃은 듯`, `#귀찮은 듯` 버튼으로 한 번에 추가/제거할 수 있습니다.
- **적용**: 전체 생성·구간별 생성·줄 단위 생성 모두에 적용됩니다. 줄 단위일 때는 **해당 줄의 톤 프롬프트**와 **전역 프롬프트**가 합쳐져 전달됩니다.

정리하면, **샘플 문서**로 대본 스타일을 맞추고, **샘플 영상 URL 또는 프로젝트 보이스**로 목소리를 정한 뒤, **그 대본에 맞는 목소리**로 TTS를 생성하면 됩니다.

---

## 3. API (백엔드)

| 엔드포인트 | 설명 |
|------------|------|
| `POST /api/tts/script-style/extract-document` | docx/txt 파일 → 텍스트 추출, `suggested_document_hint` 반환 |
| `POST /api/tts/script-style/analyze` | 샘플 대본 톤·스타일·어투 분석 (`document_hint`, `source_filename` 선택) |
| `POST /api/tts/script-style/generate` | 동일 스타일로 새 대본 생성 (`document_hint`, `source_filename` 선택) |

### docx 추출 요구사항
- 서버에 **python-docx** 설치 필요: `pip install python-docx`
- 미설치 시 docx 업로드 시 **503** + "docx 파일 추출을 위해 python-docx가 필요합니다..." 메시지 반환

### 백엔드 개발자용 (tts_api.py)
- **위치**: `backend/api/tts_api.py`. 라우터 prefix: `/api/tts`.
- **script-style 엔드포인트**  
  - `POST /api/tts/script-style/extract-document`: multipart `file` (docx/txt). 파일명 없음·빈 파일·지원 형식 아님 → 400. 성공 시 `text`, `suggested_document_hint`(톤다운/기업 등).
  - `POST /api/tts/script-style/analyze`: JSON `ScriptStyleAnalyzeRequest` (sample_script min_length=1). 빈 샘플 → 422.
  - `POST /api/tts/script-style/generate`: JSON `ScriptStyleGenerateRequest` (sample_script, topic_or_outline min_length=1). 빈 주제 → 422.
- **백엔드 TTS 테스트 실행**: 프로젝트 루트에서 `cd backend && python3 -m pytest tests/test_tts_api.py -v` (11 tests: config, speech/voices 503, speech 검증, situations, script-style analyze/generate 422, extract txt·tone_down·빈 파일 400·미지원 확장자 400).

---

## 4. 트러블슈팅

| 현상 | 원인 | 조치 |
|------|------|------|
| docx 업로드 시 503, "python-docx가 필요합니다" | 서버에 python-docx 미설치 | `pip install python-docx` 또는 `pip install -r backend/requirements.txt` |
| 스타일 분석 / 대본 생성 시 500 또는 실패 | 백엔드 LLM(unified_chat_api) 미설정 또는 오류 | LLM API 키·엔드포인트 설정 확인, 서버 로그 확인 |
| TTS 생성 시 502/503 | Qwen TTS 서버 미기동 또는 QWEN_TTS_BASE_URL 미설정 | TTS 서버 기동, 환경 변수 `QWEN_TTS_BASE_URL` 설정 |
| 구간별 생성 후 재생이 안 됨 | 구간 URL이 비어 있거나 브라우저 정책 | 생성 완료 후 재생 버튼 클릭, 콘솔/네트워크 탭 확인 |
| 테스트 시 "An update to ... was not wrapped in act(...)" 3건 | getQwenTtsConfig/getProjectVoiceSources 비동기 setState·startTransition 타이밍 | 알려진 이슈. AdvancedFeaturesPanel.test.tsx에서 해당 console.error만 억제해 출력 정리. 테스트 252개 통과. |

### 검증 체크리스트
- [ ] 목소리 생성 탭에서 **재생 속도 (전체)** 슬라이더 표시
- [ ] **구간별 속도 사용** 체크 시 나누기 기준·대본 나누기 버튼 표시
- [ ] **문서에서 추출 (docx/txt)** 후 샘플 대본 칸에 텍스트 반영, (파일명에 톤다운/보도 시) 문서 유형 힌트 추천
- [ ] **스타일 분석** → 분석 결과 보기, **이 스타일로 대본 생성** → 메인 대본 칸에 반영
- [ ] **샘플로 대본에 맞는 목소리 만들기**: 샘플 문서 추출 → (선택) 스타일로 대본 생성 → URL/프로젝트 보이스 선택 → TTS 생성·재생
- [ ] TTS **생성** 후 **재생** / **재생 (구간 순차)** 동작
- [ ] **개발자**: 프론트 252 tests·백엔드 11 tests·dev:check(125 + 타입체크 + ESLint) 통과 — [§7 다음 단계](#7-다음-단계-개발자) 복사용 검증 명령 참고

---

## 5. 관련 파일

- **프론트**: `src/components/AdvancedFeaturesPanel.tsx`, `src/services/scriptStyleAPI.ts`, `src/services/qwenTtsService.ts`
- **백엔드**: `backend/api/tts_api.py`
- **의존성**: docx 추출 시 `backend/requirements.txt`의 `python-docx` 필요
- **테스트**: 프론트 `npm test -- --testPathPattern="AdvancedFeaturesPanel|scriptStyleAPI|qwenTtsService" --watchAll=false` (252개). scriptStyleAPI: extract/analyze/generate 성공·에러·`res.json()` 실패 시 status fallback. qwenTtsService: speakQwenTts(refAudio File/string, speed, 에러 경로), VoiceClone·ScriptInVoice·WithVoiceCloneAndPlay·AndPlay(playbackRate 클램프·onended·onerror·play reject 시 catch). FromSourceUrl·FromProject·add/deleteProjectVoiceSource. AdvancedFeaturesPanel: 구간별 속도+프로젝트 모드 시 speakQwenTtsFromProject 구간별 호출, scriptStyleAPI mock·문서 추출 실패/성공(샘플 대본·문서 유형 힌트 tone_down·corporate·general·업로드 파일명 표시)·스타일 분석/스타일로 대본 생성 실패·성공 시 에러 표시 및 결과 반영(userEvent.upload·voice-gen-sample-file)·샘플 대본 수정 시 스타일 요약 초기화·빈 주제/구간+URL 빈 URL(641-647)·구간 순차 재생(764-783)·getProjectVoiceSources catch(520) flush·빈 메시지/빈 대본 onClick-while-enabled(433-434, 601-602)·통합 시나리오(문서 추출→스타일 분석→스타일로 대본 생성→TTS 생성)·단일·구간별 다운로드(voice-gen-download·voice-gen-download-segment-N). 백엔드 `cd backend && python3 -m pytest tests/test_tts_api.py -v` (11개: extract 빈 파일·미지원 확장자 400 포함). 전체 검증: `npm run dev:check` (백엔드 125 + 타입체크 + ESLint). 프론트+백엔드 TTS 한 번에: `npm run test:tts:all`. E2E(선택): `npm run test:e2e:build`
- **커버리지**: `npm run test:coverage -- --testPathPattern="AdvancedFeaturesPanel|scriptStyleAPI|qwenTtsService" --watchAll=false` — scriptStyleAPI 100%, qwenTtsService 라인 100%·Stmts 96%, AdvancedFeaturesPanel 라인 96.5%·Stmts 93.54%·Funcs 94.78%. AdvancedFeaturesPanel 미커버: 433-434(빈 메시지 품질), 520(getProjectVoiceSources catch), 601-602(빈 대본), 643-645·675-677(URL 모드 빈 URL), 723(refreshProjectVoiceSources 빈 pid), 767-768(구간 재생 onended 내부), 856-857(빈 주제 setError), 1568(문서 추출 버튼 disabled when updating·테스트로 동작 검증) 등. 핸들러 직접 호출 테스트에서 getButtonOnClick(fiber)으로 disabled 버튼 onClick 호출 시도·에러 표시 시에만 assertion; 환경에 따라 fiber 미노출 시 해당 라인 미커버.

## 6. 관련 문서

- [Typecast 벤치마크](TYPECAST_BENCHMARK.md) – Typecast 핵심 기능 vs 우리 구현, Smart Emotion·7 감정 프리셋
- [API 엔드포인트 요약](../../API_ENDPOINTS_SUMMARY.md) – TTS·script-style 엔드포인트 목록
- [실제 사용 가이드](ACTUAL_USAGE_GUIDE.md) – 고급 기능·목소리 생성 요약
- [최종 사용자 가이드](FINAL_USER_GUIDE.md) – 고급 기능 개요
- [작업 백로그](../BACKLOG.md) – 개발 진행·우선순위 (목소리 생성·TTS 완료 항목 참고)

---

## 7. 다음 단계 (개발자)

- **검증**: 위 **테스트**·**dev:check**·(선택) **E2E** 명령으로 TTS·관련 기능 검증
- **추가 작업**: [BACKLOG](../BACKLOG.md) P4(커버리지)·E2E·기능·UX 참고. AdvancedFeaturesPanel 미커버 구간(5절 커버리지 참고) 테스트 추가 시 라인 커버리지 상향 가능.

**권장 검증 순서**: TTS 한 번에 실행 → `npm run dev:check` → (선택) E2E

**테스트 전략 (AdvancedFeaturesPanel)**  
- **disabled 버튼 경로**: React는 disabled 버튼 클릭을 무시하므로, 빈 값 검증(433-434, 601-602, 856-857 등)은 **onClick-while-enabled** 패턴 사용. 버튼이 활성화된 상태에서 `getButtonOnClick(btn)`으로 핸들러를 캡처한 뒤 값을 비우고 `act(50ms)` 후 `onClick()` 호출 → 핸들러가 현재 상태(빈 값)로 실행되어 `setError` 분기 커버.
- **getButtonOnClick**: React fiber `memoizedProps.onClick`에서 핸들러를 가져옴. 환경에 따라 fiber 미노출 시 해당 라인은 미커버로 남을 수 있음.

**개발자용 상세**  
- **주요 상태**: `voiceGenMode`(url|project|situation), `voiceGenScript`(메인 대본), `voiceGenSegments`(구간별 텍스트·속도), `voiceGenSampleScript`·`voiceGenTopicOutline`(스타일 생성용), `loadingState`(idle|updating). 생성 버튼 활성 조건은 코드에서 **`chatInputUtils.coerceTrimmedString`** 기준: `coerceTrimmedString(voiceGenScript,'').length > 0` 및 URL/프로젝트 모드 시 URL·프로젝트 ID도 동일 API로 비어 있지 않을 것.
- **주요 핸들러**: `handleVoiceGenGenerate`(TTS 생성·구간/URL/프로젝트 분기), `handleGenerateScriptInStyle`(스타일로 대본 생성·빈 샘플/주제 시 setError), `handleDocumentFileChange`(문서 추출·startUpdating/stopLoading), `handleVoiceGenPlay`(단일/구간 순차 재생·Audio onended → playNext).
- **테스트 추가 시**: 미커버 433-434·601-602·856-857은 onClick-while-enabled로 검증. 641-647·675-677은 URL 모드에서 빈 URL로 생성(구간/비구간) 시 에러 검증. 764-783은 구간 재생 시 Audio mock·onended 호출로 playNext 체인 검증. 520·723·1568은 모킹·플러시 또는 useLoadingState mock으로 동작 검증.

**복사용 검증 명령**

```bash
# 프론트 TTS 252 tests (AdvancedFeaturesPanel + scriptStyleAPI + qwenTtsService)
npm test -- --testPathPattern="AdvancedFeaturesPanel|scriptStyleAPI|qwenTtsService" --watchAll=false

# 백엔드 TTS 11 tests
cd backend && python3 -m pytest tests/test_tts_api.py -v

# 전체 dev:check (백엔드 125 + 타입체크 + ESLint)
npm run dev:check

# (선택) 프론트 ESLint (전체: npm run lint. TTS 3파일만: npm run lint -- src/components/AdvancedFeaturesPanel.tsx src/services/scriptStyleAPI.ts src/services/qwenTtsService.ts)
npm run lint

# 한 번에 실행 (프론트 252 + 백엔드 11 tests, 프로젝트 루트에서. 실패 시 중단)
npm run test:tts:all
# 또는 동일 명령 직접 실행:
# npm test -- --testPathPattern="AdvancedFeaturesPanel|scriptStyleAPI|qwenTtsService" --watchAll=false && (cd backend && python3 -m pytest tests/test_tts_api.py -v)

# E2E (선택): 빌드 후 serve로 build 폴더 서빙 + Playwright. 126 tests, 1~3분 소요 가능.
npm run test:e2e:build
# 단일 브라우저만: E2E_USE_BUILD=1 npx playwright test --project=chromium
```

**E2E 참고**  
- `npm run test:e2e:build`는 빌드 성공 후 Playwright로 전체 E2E 실행. 환경·네트워크에 따라 일부 실패 또는 타임아웃 가능.
- TTS·목소리 생성 기능만 검증할 때는 프론트/백엔드 유닛 테스트(`npm run test:tts:all`)와 `npm run dev:check`로 충분.

---

## 8. 디버깅·실행 (VS Code)

VS Code **Run and Debug** (Ctrl+Shift+D / Cmd+Shift+D)에서 아래 구성을 선택해 실행·디버깅할 수 있습니다.

| 구성 이름 | 설명 |
|-----------|------|
| **Jest: TTS (AdvancedFeaturesPanel + scriptStyleAPI + qwenTtsService)** | TTS 관련 252 tests 한 번 실행 (`--watchAll=false --runInBand`). 브레이크포인트로 Jest 디버깅 가능. |
| **Jest: TTS (watch)** | TTS 테스트 watch 모드. 파일 저장 시 해당 테스트만 재실행. |
| **npm: start (dev server)** | 프론트 개발 서버 기동 (PORT=3000). 목소리 생성 탭에서 실제 UI 확인. |
| **npm: test:tts:all (frontend + backend TTS)** | 프론트 252 + 백엔드 11 tests 순차 실행. TTS 전체 검증. |
| **Playwright: E2E (debug)** | Playwright E2E 디버그 모드. 브라우저·코드 단계 실행. |

**TTS 테스트 디버깅**  
1. `AdvancedFeaturesPanel.test.tsx` 또는 `scriptStyleAPI.test.ts` / `qwenTtsService.test.ts`에 브레이크포인트 설정.  
2. **Jest: TTS** 구성으로 실행 (F5).  
3. 특정 테스트만 실행하려면 터미널에서 `npm test -- --testPathPattern="AdvancedFeaturesPanel" --testNamePattern="스타일로 대본 생성 성공" --watchAll=false` 후 해당 실행에 디버거 attach.

**launch.json 위치**: `.vscode/launch.json` (프로젝트 루트).
