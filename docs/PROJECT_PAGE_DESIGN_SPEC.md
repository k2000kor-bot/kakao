# 프로젝트·생성 페이지 디자인 스펙 (Figma Brainwave AI UI Kit 기준)

**단일 소스**: [Figma Brainwave AI UI Kit node-id=7-3](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=7-3&m=dev), [node-id=323-168775](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=323-168775&m=dev)

이 문서는 **프로젝트 목록·프로젝트 만들기·프로젝트 설정·프로젝트 · 대화(대화/소스)** 화면의 페이지 구성과 Figma 디자인 적용 디테일을 정의합니다.

---

## 0. 캡처 기준 플로우·구성·출력 (참조)

캡처 자료와 동일한 플로우·구성·출력으로 맞추기 위한 매핑입니다.

| 단계 | 캡처 내용 | 대응 구현 |
|------|-----------|-----------|
| 1 | **프로젝트 만들기** — 이름, 카테고리(투자/숙제/글쓰기/여행), 메모리(기본값/프로젝트 전용), 만들기 | ProjectCreateModal |
| 2 | **메모리 설정** — 기본값/프로젝트 전용, "이 설정은 이후에 변경할 수 없습니다" | ProjectCreateModal 메모리 블록 |
| 3 | **프로젝트 상세** — 폴더 아이콘 + 프로젝트명, "아직 대화 없음", "{프로젝트명}에 대해 무엇이든 물어보세요", 대화/소스 탭 | bw-detail-root, project-detail-header, welcome, bw-project-tabs |
| 4 | **입력창** — "{프로젝트명}에서 새 대화", + / 생각 중 / 마이크 / 전송, 하단 디스클레이머 | placeholder, bw-composer, bw-input-dock-disclaimer |
| 5 | **소스 탭** — 소스 추가, 드래그 영역, 업로드/텍스트/Google 드라이브/Slack, 추가하기 | AddSourceModal, project-sources-panel |
| 6 | **소스 목록** — 문서 목록(예: xxx.docx), 정렬(최신순/모두) | project-sources-item, 소스 추가 CTA |
| 7 | **프로젝트 설정** — 프로젝트 이름, 지침, 메모리(읽기 전용), 프로젝트 삭제 | ProjectEditModal |
| 8 | **대화 진행** — 사용자 말풍선(우측), "문서 읽는 중" / "+ 생각 중" (N초) | isLoading 시 메시지 영역 로딩 문구 |
| 9 | **출력** — AI 답변(좌측), 구조화된 섹션(예: 1) 짧은 버전, 2) 표준 반박 글), 태그 | MessageContent(ReactMarkdown), 메시지 레이아웃 |
| 10 | **상세페이지 디자인** | Figma bw-detail·theme 변수 기준, BRAINWAVE-UI·brainwave-global.css |

- **플로우**: 프로젝트 만들기 → (선택) 프로젝트 설정·소스 추가 → 프로젝트 · 대화에서 질문 입력 → 문서 읽는 중/생각 중 → 결과 출력.
- **출력 방식**: 마크다운 렌더링(제목·굵게·구분선·리스트), 대화 말풍선·스크롤·복사 등 동일 유지.
- **상세페이지·디자인 통일**: Figma node 7-3·323-168775 기준, theme.css·brainwave-global.css의 `bw-detail-*`·`bw-btn-primary`·`--accent-info-figma` 등 사용.

---

## 1. 페이지 구성 (전체 플로우)

| 화면 | 경로 | 구성 요소 | 비고 |
|------|------|-----------|------|
| **프로젝트 목록** | `/projects` | ProjectsPage + ProjectHub(검색·필터·카드 목록·새 프로젝트 만들기) | 헤더 "프로젝트", 카드 그리드/리스트 |
| **프로젝트 만들기 모달** | (오버레이) | 제목, 이름 입력, 카테고리 칩, 메모리(토글), 안내 문구, CTA 버튼 | ProjectCreateModal |
| **프로젝트 설정 모달** | (오버레이) | 제목, 이름·설명·지침, 메모리(읽기 전용), 규칙·파일·웹소스, 삭제 버튼, 저장/닫기 | ProjectEditModal |
| **프로젝트 · 대화** | `/projects/:id` | ChatGPTInterface: 사이드바(프로젝트·대화 목록), 메인(제목·메시지 영역), 입력 영역 위 **대화/소스 탭**, 지침 안내, 입력창 | 프로젝트 컨텍스트 하이라이트 |
| **소스 탭 뷰** | (같은 라우트) | 소스 목록(파일·웹소스), "+ 소스 추가" 버튼, 안내 문구, 빈 상태 시 "추가하기" CTA | 탭 전환 시 메시지 영역 대체 |
| **소스 추가 모달** | (오버레이) | 제목 "소스 추가", 드래그 영역 "여기에 소스를 드래그하세요", 업로드/텍스트 입력/Google 드라이브/Slack 버튼 | AddSourceModal. 업로드 → 파일 선택 또는 프로젝트 설정 모달로 연결 |

---

## 2. Figma 토큰 → 컴포넌트 매핑

### 2.1 공통 (theme.css, brainwave-global.css)

| 용도 | CSS 변수 / 클래스 | Figma 참고 |
|------|-------------------|------------|
| 모달 오버레이 | `var(--modal-overlay)` | 배경 반투명 |
| 모달 패널 배경 | `var(--bg-primary)` | Neutral/01 |
| 모달 테두리·구분선 | `var(--border-color)`, `var(--border-width)` | 1px |
| 제목(모달) | `var(--font-size-lg)`, `var(--font-weight-semibold)`, `var(--text-primary)` | 타이포 18px Semibold |
| 본문 라벨 | `var(--font-size-sm)`, `var(--font-weight-medium)`, `var(--text-primary)` | 14px Medium |
| 힌트·보조 텍스트 | `var(--font-size-sm)`, `var(--text-secondary)` | 14px, Neutral/07 |
| 입력 필드 | `.bw-input` 또는 `var(--sidebar-dark-input-bg)`(다크), `var(--radius-input-figma)`(12px) | Figma Input |
| Primary CTA | `.bw-btn-primary` → `var(--accent-info-figma)`, `var(--on-accent)` | Share·New chat Blue |
| Secondary 버튼 | `.bw-btn-secondary` | 테두리 버튼 |
| 카드·섹션 배경 | `var(--bg-secondary)`, `var(--bg-tertiary)` | 구역 구분 |
| 경고/안내 박스 | `var(--accent-warning-muted)`, `var(--accent-warning-subtle)` | 전구 안내 |
| 위험(삭제) | `var(--accent-error)`, `var(--accent-error-muted)` | 삭제 버튼 |
| 간격 | `var(--spacing-sm)`(8px), `var(--spacing-md)`(12px), `var(--spacing-lg)`(16px), `var(--spacing-xl)`(20px), `var(--spacing-2xl)`(24px) | 8·12·16·20·24 |
| 모서리 | `var(--radius-md)`(6px), `var(--radius-lg)`(8px), `var(--radius-xl)`(12px), `var(--radius-2xl)`(16px) | 버튼·카드·모달 |

### 2.2 프로젝트 만들기 모달 (ProjectCreateModal)

| 영역 | 스펙 | 적용 클래스/변수 |
|------|------|------------------|
| 오버레이 | 전체 화면, 클릭 시 닫기 | `.bw-modal-overlay` 또는 `project-create-modal-overlay` (theme 변수만) |
| 패널 | max-width 32rem(512px), 둥근 모서리, 그림자 | `var(--radius-xl)`, `var(--shadow-modal)`, `var(--bg-primary)` |
| 헤더 | 제목 좌측, 설정·닫기 버튼 우측, 하단 구분선 | `var(--spacing-lg)` 패딩, `var(--border-color)` 하단 |
| 프로젝트 이름 | 라벨 + 아이콘(원형, accent-info-muted) + input | `.bw-input`, 아이콘 `var(--accent-info-muted)`, `var(--accent-info)` |
| 카테고리 | 라벨 + 칩 그룹(선택 시 primary, 미선택 시 secondary) | 선택: `var(--accent-info-figma)` 또는 `var(--accent-primary)`, 미선택: `.bw-btn-secondary` 스타일 |
| 메모리 블록 | 토글 시 표시, 라디오 2개 + 고정 안내 문구 | `var(--bg-tertiary)` 또는 `var(--sidebar-dark-input-bg)`(다크), `var(--accent-warning-muted)` 안내 |
| 안내 문구 | 전구 아이콘 + 본문 | `var(--accent-warning-subtle)` 배경, `var(--text-secondary)` |
| 푸터 | 우측 정렬, Primary CTA "프로젝트 만들기" | `.bw-btn-primary`, disabled 시 `opacity: 0.5` |

### 2.3 프로젝트 설정 모달 (ProjectEditModal)

| 영역 | 스펙 | 비고 |
|------|------|------|
| 이미 적용 | ProjectEditModal.css | theme·`.bw-*` 기반, Figma node 7-3 |
| 메모리 섹션 | 읽기 전용 표시, `var(--bg-tertiary)` 블록, 경고 문구 | "이 설정은 이후에 변경할 수 없습니다" |
| 프로젝트 삭제 버튼 | 빨간 테두리·텍스트 | `var(--accent-error)`, 푸터 좌측 또는 별도 행 |

### 2.4 프로젝트 · 대화 화면 (ChatGPTInterface, initialProjectId 있을 때)

| 영역 | 스펙 | 적용 |
|------|------|------|
| 프로젝트명 표시 | 메인 상단 또는 카드, 폴더 아이콘 + 이름 | `var(--text-primary)`, `var(--font-size-lg)` |
| 빈 대화 상태 | "아직 대화 없음" + "{프로젝트명}에 대해 무엇이든 물어보세요" | 프로젝트 컨텍스트 시 문구 적용 |
| 지침 적용 안내 | 입력 영역 바로 위, 보조 텍스트 | `var(--font-size-sm)`, `var(--text-secondary)` |
| 입력 placeholder | 프로젝트 시 "{프로젝트명}에서 새 대화" | 동적 placeholder |
| 로딩 힌트 | "생각 중" | `isLoading` 시 푸터 힌트·툴팁 |
| 대화/소스 탭 | 두 개 탭, 선택 시 하단 보더·강조 | `var(--accent-info-figma)` 또는 `var(--accent-primary)` 하단 2px, 미선택 `var(--text-secondary)` |
| 소스 패널 | 제목 "소스", "+ 소스 추가" 버튼(Primary), 안내 문구, 파일/웹소스 리스트 | `.bw-btn-primary`, 리스트 항목 `var(--border-color)` 구분, 빈 상태 `var(--text-tertiary)` |
| 입력 영역 | 기존 brainwave 입력 dock | `var(--layout-input-dock-padding)` 등 유지 |
| 하단 디스클레이머 | "CORBU.AI는 실수를 할 수 있습니다. 중요한 정보는 재차 확인하세요. 쿠키 기본 설정을 참고하세요." | `.bw-input-dock-disclaimer` (입력 dock 직하단) |

### 2.5 프로젝트 목록 페이지 (ProjectsPage + ProjectHub)

| 영역 | 스펙 | 적용 |
|------|------|------|
| 페이지 루트 | ProjectsPage | `bw-page-root`, 제목 `bw-mb-2xl` |
| 허브 컨테이너 | ProjectHub | `project-hub` (ProjectHub.css: theme 변수 배경·패딩) |
| 통계·카드 | stat-card, project-card | `var(--bg-secondary)`, `var(--border-color)`, `var(--radius-lg)` |
| "새 프로젝트" 버튼 | Primary CTA | `var(--accent-info-figma)`, `var(--on-accent)`, hover `var(--accent-info-figma-hover)` (Figma 메인 CTA와 동일) |

---

## 3. 컴포넌트별 디테일 (구현 체크리스트)

### ProjectCreateModal
- [x] 오버레이: `background: var(--modal-overlay)`, `backdrop-filter` 선택 (ProjectCreateModal.css `.bw-project-create-overlay`)
- [x] 패널: `background: var(--bg-primary)`, `border-radius: var(--radius-xl)`, `box-shadow: var(--shadow-modal)` (`.bw-project-create-panel`)
- [x] 모든 텍스트: `var(--text-primary)` / `var(--text-secondary)`, 폰트 크기 `var(--font-size-sm)` / `var(--font-size-lg)`
- [x] 입력: `.bw-project-create-input` (radius 12px, theme 변수)
- [x] 버튼: 닫기/설정 → `.bw-project-create-header-btn`; CTA → `.bw-btn-primary`
- [x] 카테고리 칩: `.bw-project-create-category-btn`, `aria-pressed="true"` 시 accent-info-figma
- [x] Tailwind/인라인 색상 제거 완료

### 프로젝트 · 대화 · 대화/소스 탭
- [x] 탭 컨테이너: `.bw-project-tabs` (ChatGPTInterface.css)
- [x] 탭 버튼: `.bw-project-tab`, `aria-selected="true"` 시 `border-bottom: 2px solid var(--accent-info-figma)`, `font-weight: semibold`
- [x] 소스 패널: `.project-sources-panel`, `.project-sources-panel-title`, "+ 소스 추가" `.bw-btn-primary`

### 프로젝트 · 대화 · 소스 리스트
- [x] 리스트 항목: `.project-sources-item` (패딩·border theme 변수)
- [x] 빈 상태 문구: `.project-sources-empty`, 빈 상태 CTA "추가하기" (`.project-sources-empty-cta`)
- [x] 소스 추가 모달: AddSourceModal — "소스 추가" 제목, 드래그 영역, 업로드/텍스트 입력/Google 드라이브/Slack. 업로드·드래그 시 파일 업로드 후 프로젝트 갱신; "텍스트 입력" 시 프로젝트 설정 모달 열기.

### 프로젝트 · 대화 · 공유 디자인 (출력/입력 영역)
- [x] 빈 대화: 제목 "아직 대화 없음", 부제 "{프로젝트명}에 대해 무엇이든 물어보세요"
- [x] 입력 placeholder: 프로젝트 시 "{프로젝트명}에서 새 대화"
- [x] 로딩 시 힌트: "생각 중"
- [x] 입력 dock 하단 디스클레이머: `.bw-input-dock-disclaimer` (CORBU.AI는 실수를 할 수 있습니다…)

### 프로젝트 상세 페이지 (클릭 시 진입 화면, Figma bw-detail)
- [x] 프로젝트 클릭 시 메인 영역을 `.bw-detail-root.bw-tool-view.project-detail-view`로 래핑
- [x] 상단 고정 헤더: `.bw-detail-header.project-detail-header` — 폴더 아이콘(`.bw-detail-header-icon`) + 제목(`.bw-detail-title`) + 설명(`.bw-detail-desc`) + "프로젝트 설정" 버튼
- [x] 헤더 하단 메타: `.bw-detail-meta-row` — 지침/가이드라인/파일/태그/소스 개수
- [x] 본문 영역: `.project-detail-body`로 대화/소스·웰컴 영역 flex 및 스크롤 처리
- [x] 빈 상태 시 중복 카드 제거: 상단 헤더에 프로젝트 정보가 있으므로 `project-home-card` 제거
- [x] 접근성: 래퍼 `role="region"`·`aria-label="프로젝트 상세: {프로젝트명}"`, 헤더 `aria-label="{프로젝트명} 프로젝트 정보"`

---

## 4. 참조

- **Figma**: [Brainwave AI UI Kit node 7-3](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=7-3&m=dev), [323-168775](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=323-168775&m=dev)
- **토큰 정의**: `src/styles/theme.css`
- **공통 클래스**: `src/styles/brainwave-global.css` (`.bw-btn-primary`, `.bw-btn-secondary`, `.bw-input`, `.bw-card` 등)
- **상위 문서**: [BRAINWAVE-UI.md](./BRAINWAVE-UI.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
