# 로컬 UI 점검 기록 + 판정 기준 (3000/5002)

- 일시:
- 점검자:
- 브랜치:

## 1) 메인 접속
- [ ] `http://localhost:3000` 접속 성공
- [ ] 콘솔 치명 에러 없음
- 메모:

**판정 기준**
- OK: 첫 로딩 10초 내 화면 진입, 콘솔에 red error 없음
- NG: 흰 화면 지속, `Failed to fetch`, `Network Error`, JS 런타임 에러 발생

---

## 2) 프로젝트 진입
- [ ] 프로젝트 목록 로드됨
- [ ] 기존 프로젝트 선택 또는 신규 생성 성공
- [ ] 프로젝트 상세 화면 진입 성공
- 메모:

**판정 기준**
- OK: 목록/상세 이동 정상, 버튼 클릭 후 3초 내 반응
- NG: 목록 빈 화면(오류 메시지 동반), 진입 시 무한 로딩/에러 토스트 반복

---

## 3) 채팅 전송
- [ ] 질문 입력 후 전송 성공
- [ ] 사용자 메시지 즉시 화면 반영
- [ ] (선택) `1. …\n2. …` 다중 요청 시 체크리스트·5단계 UI·입력 미리보기(한 줄) — [CHAT_UI §14.7](./guides/CHAT_UI_TEST_SCENARIOS.md) · Jest: `npm run verify:composer-pipeline` · E2E: `npm run test:e2e:composer-pipeline:all`
- [ ] (선택) `.env.local` `REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST=true` 시 항목별 다단계 답변(순차 API 꺼진 상태)
- 메모:

**판정 기준**
- OK: 전송 직후 사용자 말풍선 생성, 입력창 상태 정상 복귀
- NG: 전송 버튼 무반응, 중복 전송, 메시지 누락

---

## 4) 스트리밍 응답
- [ ] 응답이 점진적으로(스트리밍) 표시됨
- [ ] 완료 후 최종 답변 정상 렌더링
- 메모:

**판정 기준**
- OK: 응답 텍스트가 청크 단위로 늘어남 -> 완료 상태 전환
- NG: 20~30초 이상 무출력 후 실패, 중간 끊김, 완료 플래그 없이 멈춤

---

## 5) 대화 관계도 handoff (선택)
- [ ] `/chat`에서 CSV/TXT 첨부 후 「관계도를 만들어줘」 입력 시 첨부 칩·handoff 배너 표시
- [ ] 「관계도 화면에서 만들기」 클릭 시 `/conversation-graph`·붙여넣기·답변 패널 정상
- 메모:

**판정 기준**
- OK: 웰컴·기존 대화 화면 모두 동일. 자동 회귀: `npm run test:e2e:conversation-graph:chromium` · [CONVERSATION_GRAPH.md](./CONVERSATION_GRAPH.md)
- NG: 첨부만 되고 배너 없음, handoff 후 붙여넣기 비어 있음

---

## 6) 새로고침 유지성
- [ ] 새로고침 후 프로젝트/대화 상태 유지
- [ ] 재진입 후 추가 메시지 전송 가능
- 메모:

**판정 기준**
- OK: 새로고침 후 같은 프로젝트 문맥 유지 + 추가 전송 정상
- NG: 상태 초기화, 프로젝트 선택 해제, 이후 API 호출 실패

---

## 7) 자동 회귀 (선택, 서버 기동 후)

```bash
npm run restart:backend   # :5002
npm start                 # :3000
npm run verify:full-stack-local
```

- [ ] 위 명령 전체 통과 (Jest + API + integration + E2E 15)

---

## 장애 발생 시 캡처 항목
- 발생 시각:
- 화면 URL:
- 입력한 질문:
- 브라우저 콘솔 에러:
- 백엔드 로그 키워드(` /api/chat`, ` /api/chat/stream`) 확인 결과:

## 최종 결과
- [ ] PASS (모든 항목 OK)
- [ ] CONDITIONAL PASS (경미 이슈 존재, 사용 가능)
- [ ] FAIL (핵심 경로 실패)

## 비고 / 후속 조치
- 이슈 요약:
- 재현 절차:
- 우선순위(P1/P2/P3):

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · `npm run test:views`(확장 뷰·라우트) · (권장) `npm run test:sidebar-context`(수동 §14.5 [CHAT_UI_TEST_SCENARIOS](./guides/CHAT_UI_TEST_SCENARIOS.md)) · (선택) `npm run check:doc-verification-hub` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
