# AI Workspace Minimal UI 설계

좌측 메뉴는 **노출되는 최소 UI**만 두고, 나머지 기능은 **생성형(프롬프트)**으로 호출하는 구조입니다.  
모델 선택은 UI에서 제거하고 **내부 라우팅**으로 처리합니다.

---

## 핵심 원칙

| 구분 | 방식 |
|------|------|
| **UI** | 최소 4개 영역만 노출 |
| **기능** | 검색·분석·보고서·프로젝트 생성 등 → **프롬프트 요청 시 생성** |
| **모델** | 사용자 선택 제거 → **AI 내부 라우팅** |

→ **AI OS / AI 명령 중심 인터페이스**

---

## 좌측 메뉴 4개 영역

```
Sidebar
 ├ [1] Search / New Chat   (상단 검색 및 새대화)
 ├ [2] Projects            (프로젝트 / 폴더)
 ├ [3] Recent Conversations (최근 대화 목록)
 └ [4] User                 (사용자 계정 영역)
```

---

### [1] 상단 검색 및 새대화

**역할**: AI 인터페이스 진입점

**노출 UI**
- **검색** (단일 입력)
- **새대화** (단일 버튼)

**내부 구조**
```
Entry Layer
 ├ Search
 └ New Conversation
```

**요청 시 생성되는 기능**
- 대화 검색 · 파일 검색 · 프로젝트 검색 · 지식 검색 · 프롬프트 검색

**AI 내부 동작**
- query parsing → intent detection → search routing → vector retrieval → result generation

**사용 예**
- *"상대원2구역 관련 대화 찾아줘"* → conversation search, vector DB, 결과 생성
- *"이 주제로 새 분석 시작"* → new conversation 생성, context 초기화

---

### [2] 프로젝트 / 폴더

**역할**: 대화·자료 단위 관리

**노출 UI**
- 프로젝트 목록
- 폴더(선택)
- 프로젝트 선택

**내부 구조**
```
Project
 ├ conversations
 ├ files
 ├ instructions
 ├ knowledge
 └ memory
```

**요청 시 생성 기능**
- 프로젝트 생성 · 파일 업로드 · 지식베이스 생성 · 프로젝트 분석 · 프로젝트 요약

**AI 내부 동작**
- project create, conversation attach, file index, vector embedding, memory storage

**사용 예**
- *"성수4지구 분석 프로젝트 만들어줘"* → project 생성, instruction 생성, conversation·knowledge 연결
- *"이 프로젝트에 기사 자료 추가"* → file upload, embedding, knowledge 연결

---

### [3] 최근 대화 목록

**역할**: 대화 접근·관리

**노출 UI**
- 최근 대화 리스트
- 대화 선택
- 대화 고정

**내부 구조**
```
Conversations
 ├ chronological list
 ├ pinned
 └ archived
```

**요청 시 생성 기능**
- 대화 요약 · 대화 분석 · 대화 분류 · 대화 병합 · 보고서 생성

**AI 내부 동작**
- conversation parse, topic clustering, summary generation, report generation

**사용 예**
- *"최근 상대원2구역 대화 요약"* → conversation filtering, summary 생성
- *"이 대화 기반 보고서 만들어줘"* → analysis, report 생성

---

### [4] 사용자 계정 영역

**역할**: 사용자 환경·데이터 관리

**노출 UI**
- 프로필
- 설정
- 요금제
- 로그아웃

**내부 구조**
```
User
 ├ profile
 ├ settings
 ├ subscription
 └ data controls
```

**요청 시 생성 기능**
- 대화 데이터 export · 사용량 분석 · API 키 생성 · 데이터 삭제

**AI 내부 동작**
- data export, usage analytics, account management

**사용 예**
- *"내 대화 데이터 다운로드"* → conversation export, 파일 생성

---

## 시스템 동작 구조

```
User Request
    ↓
Intent Detection
    ↓
Function Routing
    ↓
Tool Execution
    ↓
Response Generation
```

---

## UI vs AI 실행 방식 요약

| 실행 주체 | 역할 |
|-----------|------|
| **UI** | 최소 기능 (검색 입력, 새대화, 프로젝트 목록, 대화 목록, 사용자 영역) |
| **AI** | 생성형 기능 (검색·분석·보고서·프로젝트 생성·export 등) |

---

## 구현 위치

- **사이드바**: `src/components/ChatGPTInterface.tsx` — 4개 영역만 노출, 나머지 버튼/메뉴 최소화
- **의도·라우팅**: 백엔드 파이프라인·라우터에서 intent detection → function/tool 라우팅
- **모델 선택**: UI에서 제거, 내부 라우팅으로 처리 (문서: [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](./QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md) 등)

**구현 현황 (사이드바)**  
- [1] 상단: 통합 검색 입력 + 새대화 버튼 + 사이드바 토글만 노출. (새 프로젝트·노트북 설정·정렬 바 제거)  
- [2] 프로젝트: 목록·선택·메뉴(편집/삭제)만 노출. 프로젝트 생성 버튼 제거(프롬프트로 생성 안내).  
- [3] 최근 대화: 섹션 제목 "최근 대화", 리스트·고정만 노출. "새 일반 대화" 버튼 제거(새대화은 [1]에서).  
- [4] 사용자: 하단 테마·PRO·저장소·온라인 상태를 "사용자 계정" 영역으로 그룹화.

**의도 감지·도구 실행·프론트 반영**까지 포함한 마무리 개발 현황은 [DEVELOPMENT_COMPLETION_STATUS.md](./DEVELOPMENT_COMPLETION_STATUS.md) 참고.

이 문서는 **서비스 설계 기준**으로, 확장 시 AI OS 메뉴 구조·LLM 기반 생성형 메뉴 아키텍처와 일치시키면 됩니다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
