# 대화 UI 구성 (샘플 이미지 기준)

샘플 이미지를 참고해 대화 화면 구성을 정리한 문서입니다. UI 변경 시 이 구도를 기준으로 맞춥니다.

---

## 1. 전체 구조 (상 → 하)

| 순서 | 영역 | 설명 |
|------|------|------|
| 1 | **최상단 바** | 왼쪽 문서·편집 아이콘, 가운데 **CORBU.AI >**, 오른쪽 업로드(↑)·공유(링크) 버튼 (`chat-main-header`) |
| 2 | **프로젝트 컨텍스트** | 📁 + 프로젝트명 (프로젝트 선택 시에만 표시) |
| 3 | **탭** | **대화** \| **소스** (프로젝트일 때만). 소스 탭에서 정렬·필터(최신순, 모두) |
| 4 | **본문** | 대화 탭: 대화 제목 + 메시지 목록 / 소스 탭: 소스 목록 + "추가하기" |
| 5 | **입력 영역 (공동입력창)** | 단일 바(둥근 모서리·연한 회색). 왼쪽: + (첨부·질문+요구 템플릿·/웹검색). 입력창: placeholder "무엇이든 부탁하세요", 내부 왼쪽 지구본(클릭 시 /웹검색 삽입)·오른쪽 A(스타일 안내). 오른쪽: Auto 드롭다운(Auto/간결/상세 → API quality enhanced/basic/ultimate), 마이크, 전송(↑) |

---

## 2. 프로젝트 만들기 모달 (샘플 기준)

- **제목**: 프로젝트 만들기
- **입력**: 프로젝트 이름 (예: 상대원2구역 재개발, 코펜하겐 여행)
- **태그/카테고리**: 투자, 숙제, 글쓰기, 여행 등 선택
- **설명**: "프로젝트에서는 한 곳에 파일, 맞춤형 지침을 보관합니다. 지속적으로 진행되는 작업에, 또는 작업을 깔끔히 정리하기에 좋죠."
- **버튼**: 프로젝트 만들기, 취소(닫기)
- **설정 아이콘**: 메모리 설정 등 (기본값 / 프로젝트 전용)

---

## 3. 소스 추가 모달 (샘플 기준)

- **제목**: 소스 추가
- **드래그 영역**: "여기에 소스를 드래그하세요"
- **소스 유형 버튼**: 업로드, 텍스트 입력, Google 드라이브, Slack (필요 시 YouTube 등 확장)

---

## 4. 프로젝트 설정 모달 (샘플 기준)

- **프로젝트 이름**: 편집 가능
- **지침**: "컨텍스트를 설정하고 프로젝트 내에서 CORBU.AI가 응답하는 방식을 맞춤 설정하세요." 예시 문구 포함
- **메모리**: 기본값(외부 대화과 메모리 공유) / 프로젝트 전용
- **프로젝트 삭제**: 삭제 버튼

---

## 5. 대화 리스트 (사이드바) — 2단 레이아웃

- **상단**: 로고 + **CORBU.AI** 만 표시
- **검색**: placeholder `검색`
- **메뉴**: 대화 · 프로젝트 · 목소리 생성 (바로 노출)
- **새 프로젝트**: 폴더 아이콘 + "새 프로젝트" (클릭 시 `/projects`)
- **프로젝트 목록**: API 목록 표시, 클릭 시 `/projects/:id` 이동
- **더 보기**: **··· 더 보기** (클릭 시 `/projects`)
- **토픽 목록**: LLM 기반 파이프라인 설계, 질문답변 생성 로직(파란 점), … (클릭 시 해당 질문으로 대화)
- **하단**: 사용자 아바타 **K** (빨간 원) + **KIM HOBUM**, Light/Dark 테마 토글

---

## 6. 입력창 (공동입력창)

- **placeholder**: `무엇이든 부탁하세요` (대화/웰컴 공통)
- **구성**: + 버튼 → [지구본 | 입력 필드 | A] → Auto 드롭다운 → 마이크 → 전송. + 메뉴에 이미지 첨부·대화 파일 첨부·질문+요구 템플릿·/웹검색 등 포함
- **지구본**: 클릭 시 `/웹검색` 삽입 + 토스트 "웹 검색 모드가 입력되었습니다."
- **A**: 클릭 시 토스트 "응답 스타일·포맷은 상단 생성 모드에서 설정할 수 있습니다."
- **Auto 드롭다운**: 옵션 — **Auto**(기본, API `quality: enhanced`) / **간결**(`quality: basic`) / **상세**(`quality: ultimate`). 대화 전송·재생성·편집 후 전송 시 선택값이 API에 반영됨.
- **클라이언트 저장**: 응답 스타일 선택값은 `localStorage` 키 `chatgpt-composer-response-mode`에 저장되며, 새로고침 후에도 복원됨 (`auto` | `concise` | `detailed`).

---

## 답변 로직 정리 (완료 상태)

- **진입점**: `sendMessage` (ChatGPTInterface.tsx) — 입력 검증 후 사용자 메시지 추가, 컨텍스트 구성(대화 이력·프로젝트·질문/요구 파싱·품질 지시·프로젝트 지침 등).
- **스트리밍**: `useStreaming && isStreamingSupported()`이면 `streamChatMessage` 호출. `onChunk`로 실시간 텍스트 갱신, `onComplete`로 최종 답변·제목 생성·workspace_tool_result(프로젝트 생성) 반영. `onError` 시 에러 문구로 어시스턴트 메시지 표시.
- **스트리밍 실패 시**: `performNonStreamingFallback()`으로 `/api/chat` → `/api/unified/chat` 순 POST, `extractResponseContent`로 응답 추출 후 UI 갱신. fallback도 실패 시 에러 메시지 표시.
- **비스트리밍**: 플레이스홀더 어시스턴트 메시지 추가 후 동일 엔드포인트 POST → `extractResponseContent` → `displayContent`로 메시지 갱신·제목 생성·workspace_tool_result 반영.
- **응답 추출**: `extractResponseContent`(chatInputUtils) — `response`/`message`/`content`/`text`/`reply`/`answer`/`choices[0].message.content` 등 다양한 백엔드 형식 지원. 빈 응답 시 "응답을 생성할 수 없습니다. 다시 시도해 주세요." 사용.
- **재생성·편집**: 동일 스트리밍/비스트리밍 분기 및 `extractResponseContent` 사용. 에러 시 대화에 오류 메시지 반영.
- **정리**: 답변 생성·표시·에러 처리·폴백·재생성/편집이 한 흐름으로 연결되어 있으며, 미구현 분기나 TODO는 없음.

---

## 최근 구현 요약 (공동입력창·입력창 활성화·브랜딩)

- **브랜딩**: 대화 화면 사용자 노출은 **CORBU.AI**로 통일 — 상단 바 제목, `document.title`, 웰컴 헤드라인, 디스클레이머, 소스 안내 문구. 사이드바 로고 옆은 **CORBU.AI**, 펼침 **> CORBU**, 하단 사용자 **U / 사용자**.
- **입력창 활성화**: 대화 입력창은 `disabled={isLoading}`만 사용(빈 칸에서도 입력 가능). 전송 버튼만 `disabled={!canSend}`.
- **E2E**: `e2e/chat.spec.ts` (Chromium) — 5 passed (대화 입력·전송, 질문+요구 가드/미리보기/OFF 배지, 공동입력창 응답 스타일+localStorage), 4 skipped (서버/백엔드 조건).
- **빌드**: `CI=true npm run build` 통과. `DEV_CHECK_SKIP_BACKEND=1 npm run dev:check` 시 타입·ESLint 통과.
- **전체 E2E** (Chromium): 68 passed, 8 skipped, 0 failed. 대화 5 passed; example "사이드바 프로젝트 클릭 → /projects" 셀렉터 `aside a[href="/projects"]`; projectManagement 편집 버튼에 `PROJECT_DETAIL_SETTINGS_BTN`·"프로젝트 설정" 추가; 스트리밍 에러·프로젝트 편집은 환경 미충족 시 스킵.

---

구현 위치: `src/components/ChatGPTInterface.tsx`, `ChatGPTInterface.css`, 프로젝트/소스 관련 모달 컴포넌트.
