# 사이드바 메뉴 사이즈·구성 스펙

참조 이미지 기준: 상단(로고·문서) → 새 대화/대화 검색/이미지/라이브러리 → **프로젝트** → **최근** → **내 대화**(긴 목록) → 하단 사용자 프로필.

이 문서는 **사이드바 메뉴의 세로 구성(사이즈·비율·스크롤)** 을 어떻게 가져갈지 정리합니다.

---

## 1. 목표

- **가독성**: 섹션 구분이 명확하고, 선택 항목이 한눈에 들어오게.
- **스크롤 예측 가능**: "내 대화"이 길어져도 한 영역만 스크롤되도록.
- **밀도 조절**: 항목이 많을 때 시각적 혼잡을 줄이기(노출 개수 제한·더 보기 등).

---

## 2. 현재 구현 요약 (ChatGPTInterface)

| 구역 | 역할 | 현재 동작 |
|------|------|-----------|
| **헤더** | 새 대화, 프로젝트 버튼, 사이드바 토글 | 고정, `flex-shrink: 0` |
| **정렬** | 최신순/이름순/메시지 수, 단축키 버튼 | 고정 |
| **프로젝트** | 제목 + 검색 + 프로젝트 목록 | 목록만 `max-height: min(40vh, 280px)`, `overflow-y: auto` |
| **대화 리스트** | 제목 + 대화 검색 | 고정 |
| **대화 목록** | conversation-item 목록 | `flex: 1`, `min-height: 0`, `overflow-y: auto` (남은 영역 전부 스크롤) |

- **사이드바 너비**: `--layout-sidebar-width` (260px).
- **스크롤**: 프로젝트 목록·대화 목록 각각 독립 스크롤.
- **스타일**: 정렬 바·프로젝트·대화 섹션 제목/메타/입력은 `.sidebar-sort-*`, `.sidebar-section-*`, `.sidebar-project-*` 등 CSS 클래스로 theme 변수만 사용 (인라인 제거).
- **섹션 간격**: `--sidebar-section-gap` (theme.css, 8px) 적용 — 대화 섹션 상단 `margin-top`으로 프로젝트·대화 구역 간격 부여.

---

## 3. 사이즈·구성 옵션

### 3.1 섹션별 높이 제어

- **프로젝트 영역**
  - 유지: `max-height: min(40vh, 280px)` (또는 theme 변수 `--sidebar-projects-max-height`).
  - 프로젝트가 많으면 이 블록만 스크롤, 아래 "대화"은 항상 보이도록.

- **대화 목록(내 대화)**
  - 유지: `flex: 1` + `overflow-y: auto` → 남은 세로 공간을 채우고, 여기만 스크롤.
  - 선택: "최근"만 상단에 고정 개수(예: 7개) 노출 후 "더 보기"로 펼치기 가능 (추가 구현 시 적용).

### 3.2 노출 개수 제한 (선택)

| 섹션 | 기본 노출 | "더 보기" 후 |
|------|-----------|--------------|
| **최근** | 5~7개 | 전체 또는 20~30개 |
| **내 대화** | 15~20개 또는 제한 없음(현재) | — 또는 "더 보기"로 추가 로드 |

- "더 보기" 도입 시: 해당 섹션에만 `max-height` 또는 `slice(N)` 적용 후, 클릭 시 N 증가 또는 "전체 보기"로 확장.

### 3.3 접힌 모드(좁은 사이드바)

- 너비: 예) `--layout-sidebar-width-sm` (240px) 또는 아이콘만 보이는 48~56px.
- 아이콘만 보일 때: "새 대화", "프로젝트", "대화" 등만 아이콘으로 표시하고, 호버/포커스 시 툴팁 또는 펼침 패널로 라벨 표시.
- 세로 구성은 동일: 위→아래 순서 유지, 스크롤은 펼친 모드와 동일하게 적용.

### 3.4 하단 고정 영역

- 참조 이미지: 사용자 프로필(아바타, 이름, Plus)이 하단 고정.
- 적용 시: 프로필 블록을 `flex-shrink: 0`으로 두고, 그 위의 "대화 목록"만 `flex: 1` + 스크롤.
- 미적용 시: 현재처럼 대화 목록이 사이드바 맨 아래까지 사용.

---

## 4. 권장 값 (theme / 상수)

아래는 조정 시 사용할 수 있는 값 제안입니다.

| 항목 | 권장 값 | 용도 |
|------|---------|------|
| `--sidebar-width` | 260px | 펼친 상태 너비 (현재 `--layout-sidebar-width`) |
| `--sidebar-width-collapsed` | 56px | 접힌 상태(아이콘만) |
| `--sidebar-projects-max-height` | min(40vh, 280px) | 프로젝트 목록 최대 높이 |
| `--sidebar-section-gap` | 8px | 섹션 사이 세로 간격 |
| 최근 노출 개수 | 7 | "최근" 도입 시 기본 표시 개수 |
| 내 대화 기본 노출 | 제한 없음(현재) 또는 20 | "더 보기" 도입 시 |

---

## 5. 적용 체크리스트

- [x] 프로젝트 목록: `max-height` + 독립 스크롤 (ChatGPTInterface.css `.projects-list-inner`)
- [x] 대화 목록: `flex: 1` + `overflow-y: auto` (`.conversations-list`)
- [x] theme.css에 `--sidebar-projects-max-height` 정의 후 CSS에서 참조 (ChatGPTInterface.css `.projects-list-inner`)
- [x] theme.css에 `--sidebar-section-gap` 정의, 대화 섹션 상단 간격 적용 (`.chats-section`)
- [x] theme.css에 `--sidebar-width-collapsed: 56px` 정의 (접힌 모드 구현 시 사용)
- [ ] (선택) "최근" 섹션 분리 + N개 제한 + "더 보기"
- [ ] (선택) 하단 사용자 프로필 고정 영역
- [ ] (선택) 접힌 모드 시 아이콘만 노출 + 툴팁/확장 (`--sidebar-width-collapsed` 사용)

---

## 6. 참조

- **Figma**: [Brainwave AI UI Kit node 7-3](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=7-3&m=dev)
- **구현**: `src/components/ChatGPTInterface.tsx` (사이드바), `src/components/ChatGPTInterface.css` (`.sidebar`, `.projects-section`, `.chats-section`, `.conversations-list`)
- **레이아웃 토큰**: `src/styles/theme.css` (`--layout-sidebar-width`)
