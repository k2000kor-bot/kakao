# 키보드 단축키 가이드

## 대화 인터페이스 단축키

### 메시지 관련
- `Enter`: 메시지 전송
- `Shift + Enter`: 줄바꿈
- `Ctrl/Cmd + K`: 빠른 검색
- `Esc`: 검색 닫기 / 편집 취소

### 네비게이션
- `↑/↓`: 메시지 간 이동
- `Ctrl/Cmd + /`: 도움말 표시
- `Tab`: 다음 요소로 이동
- `Shift + Tab`: 이전 요소로 이동

### 액션
- `Ctrl/Cmd + C`: 메시지 복사
- `Ctrl/Cmd + E`: 메시지 편집
- `Ctrl/Cmd + R`: 메시지 재생성
- `Ctrl/Cmd + D`: 메시지 삭제

### 접근성
- 모든 버튼은 키보드로 접근 가능
- 스크린 리더 지원
- ARIA 레이블 제공

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

