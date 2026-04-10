# Docs

## 현재 개발 반영

| 문서 | 용도 |
|------|------|
| [WHAT_IS_THIS.md](./WHAT_IS_THIS.md) | **이걸 뭐 하려는 거야?** — CORBU.AI 한눈에 보기 (대화·프로젝트·도구·화면 구성) |
| [FRONTEND_CHANGES.md](./FRONTEND_CHANGES.md) | **프론트엔드 변경 사항** — 최근 수정·추가된 파일·내용 요약 |
| [CURRENT_DEVELOPMENT_STATUS.md](./CURRENT_DEVELOPMENT_STATUS.md) | **지금까지 반영된 기능 요약** — AppUnified·사이드바·아이콘·반응형·ErrorBoundary |
| [DEPLOY_SERVER_CHECKLIST.md](./DEPLOY_SERVER_CHECKLIST.md) | **서버 반영 체크리스트** — deploy:check → .env 설정 → deploy:dev/deploy:server |

## 개발·개발 연속성

| 문서 | 용도 |
|------|------|
| [DEVELOPMENT_CONTINUITY.md](./DEVELOPMENT_CONTINUITY.md) | 경로·컴포넌트 매핑·체크리스트·README 일람 (기능 추가 시 진입점) |
| [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) | 라우트→뷰·AppUnified·사이드바·메시지 UI·프로젝트 관리·서비스 매핑 |
| [BACKLOG.md](./BACKLOG.md) | 작업 목록·우선순위 |
| [DEVELOPER_QUICK_CHECKLIST.md](./DEVELOPER_QUICK_CHECKLIST.md) | 실행·테스트·API 빠른 체크 |

## 완성·검증

| 문서 | 용도 |
|------|------|
| [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) | 완성도·마무리 검증 (`npm run verify:completion`) |
| [DEVELOPMENT_COMPLETION_STATUS.md](./DEVELOPMENT_COMPLETION_STATUS.md) | **AI Workspace 마무리** — 4개 영역 UI, 의도·도구 실행, workspace_tool_result, 검증 체크리스트 |
| [DEVELOPMENT_SCOPE_MASTER.md](./DEVELOPMENT_SCOPE_MASTER.md) | 비전·아키텍처·확장 범위 |
| [TESTING_GUIDE.md](../TESTING_GUIDE.md) | 단위·통합·E2E 구분, 검증 명령별 스코프 |

## 가이드

- [guides/](./guides/) — 사용자 가이드·TTS·트러블슈팅 등
- [guides/CHAT_ANSWER_FLOW_VERIFICATION.md](./guides/CHAT_ANSWER_FLOW_VERIFICATION.md) — 대화 입력→질문 표시→답변 생성·품질 흐름 검증
- [guides/RESPONSE_CLEANING.md](./guides/RESPONSE_CLEANING.md) — 응답 정리·**`coerceTrimmedString` / `coerceTrimmedEnd`**·보조 트리 동기화(`sync:frontend-chat-input-utils`)
- [guides/ANSWER_QUALITY_AND_SEARCH.md](./guides/ANSWER_QUALITY_AND_SEARCH.md) — 답변 품질·검색·자료 활용·API quality
- [DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md) — 딥시크 설치형/API·동작 체크리스트(§4.1)
- [DEEPSEEK_DEVELOPMENT_ORDER.md](./DEEPSEEK_DEVELOPMENT_ORDER.md) — 딥시크 개발 순서·우선 시도(5.1a)
- [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) — 딥시크 설치→구동→개발→학습 한 흐름
- [API.md](./API.md) — API 엔드포인트
