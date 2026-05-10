# 대화 UI 동작 확인 시나리오

대화 화면 레이아웃·호버·질문/답변 정렬 변경 후, 기대대로 동작하는지 확인하기 위한 테스트 시나리오입니다.

**프론트 회귀·원격 push**: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — **`npm run test:sidebar-context`**. [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md).

---

## 1. 레이아웃·정렬

| # | 시나리오 | 조치 | 기대 결과 |
|---|----------|------|-----------|
| 1.1 | 사용자 질문 표시 | 메시지 전송 후 해당 말풍선 확인 | 질문(사용자) 말풍선이 **오른쪽 끝에 붙어** 표시됨 |
| 1.2 | AI 답변 표시 | AI 응답 수신 후 말풍선 확인 | 답변(AI) 말풍선이 **왼쪽**에 정렬되어 표시됨 |
| 1.3 | 좌우 폭 활용 | 넓은 화면에서 긴 답변 확인 | 말풍선이 `min(90%, 760px)` 이내에서 **좌우 여백을 활용**해 표시됨 |
| 1.4 | 스크롤 시 입력창 | 대화가 길어져 메시지 영역 스크롤 | **입력 영역은 항상 하단에 고정**되고, 메시지 영역만 스크롤됨 |

---

## 2. 호버·움직임 방지

| # | 시나리오 | 조치 | 기대 결과 |
|---|----------|------|-----------|
| 2.1 | 메시지 호버 | 메시지(질문/답변) 위에 마우스를 올림 | **레이아웃이 틀어지거나 움직이지 않음** (배경만 살짝 변경) |
| 2.2 | 복사/북마크 버튼 | 같은 메시지 위 호버 유지 | 복사·북마크 등 버튼이 **페이드인**으로만 나타나고, **줄/블록이 밀리지 않음** |
| 2.3 | 호버 해제 | 마우스를 메시지 밖으로 이동 | 버튼이 사라질 때도 **위치/너비 변화 없음** |

---

## 3. 접근성

| # | 시나리오 | 조치 | 기대 결과 |
|---|----------|------|-----------|
| 3.1 | 본문으로 건너뛰기 | Tab으로 포커스 이동 | "본문으로 건너뛰기" 링크가 포커스되고, 선택 시 대화 본문(`#chat-main-content`)으로 이동 |
| 3.2 | 메시지 랜드마크 | 스크린 리더 또는 개발자 도구로 확인 | 각 메시지가 `article` 등 적절한 랜드마크·`aria-label`(사용자/AI 메시지)로 구분됨 |
| 3.3 | 동작 최소화 선호 | OS에서 "동작 줄이기" 설정 후 호버 | 메시지 액션 버튼의 `transition`이 적용되지 않거나 최소화됨 (`prefers-reduced-motion`) |

---

## 4. 반응형·좁은 화면

| # | 시나리오 | 조치 | 기대 결과 |
|---|----------|------|-----------|
| 4.1 | 중간 브레이크포인트 | 뷰포트를 `breakpoint-md` 이하로 축소 | 메시지에 좌우 패딩(`var(--spacing-lg)`) 적용, 말풍선이 화면에 맞게 표시됨 |
| 4.2 | 입력 영역 | 동일하게 좁은 화면에서 스크롤 | 입력 영역이 **최소 높이(72px)** 를 유지하며 하단에 고정됨 |

---

## 5. 빠른 체크리스트 (배포 전)

- [ ] 질문 말풍선이 오른쪽에 붙는지
- [ ] 답변 말풍선이 왼쪽에 있는지
- [ ] 메시지 호버 시 좌우로 움직임이 없는지
- [ ] 스크롤 시 입력창이 하단에 고정되는지
- [ ] 건너뛰기 링크·포커스 순서가 자연스러운지

---

## 6. 적용된 개선

- **키보드 포커스**: `.message:focus-within .message-actions`로 복사/북마크 등 포커스 시 버튼 표시
- **스크롤**: 질문 전송 직후(`isLastUserMessage`)에도 하단 스크롤하여 새 말풍선이 보이도록 보완
- **긴 메시지 접기**: 접기/펼치기 버튼에 `aria-expanded` 추가, `aria-label` 유지(메시지 접기/펼치기)
- **E2E용 testid**: 맨 위로/맨 아래로 스크롤 버튼에 `data-testid="scroll-to-top"`, `"scroll-to-bottom"` 추가

## 7. 적용된 개선 (포커스·접근성)

- **대화 전환 시 포커스**: `currentConversation?.id` 변경 시 메시지 컨테이너(`messages-container`)로 포커스 이동. 컨테이너에 `tabIndex={-1}` 적용.
- **오류 메시지**: API 연결 불가 배너에 `aria-live="assertive"`, `ref`·`tabIndex={-1}` 추가. 표시 시 배너로 포커스 이동.
- **모달 닫은 뒤 입력창 포커스**: 프로젝트 편집/소스 추가/공유/프로젝트 생성/PRO 모달 닫을 때 `focusChatInput()` 호출로 입력창으로 포커스 복귀.

## 8. 적용된 개선 (토스트·테스트 id)

- **스크롤 영역 포커스**: 메시지 영역 포커스 시 `preventScroll: true`로 스크롤 위치 유지(기존 유지)
- **토스트 알림 접근성**: 오류 토스트는 `role="alert"`, `aria-live="assertive"`로 즉시 알림. 성공/정보는 `role="status"`, `aria-live="polite"`. 전역 토스트에 `data-testid="global-toast"` 추가

## 9. 적용된 개선 (토스트 포커스)

- **오류 토스트 포커스**: 오류 토스트 표시 시 100ms 후 토스트 컨테이너로 포커스 이동. `ref`·`tabIndex={-1}` 적용.
- **메시지 복사 피드백**: 복사 성공 시 `showToast('복사되었습니다', 'success')`로 토스트 표시, `aria-live="polite"`·`aria-label`로 스크린 리더 안내(기존 유지).

## 10. 적용된 개선 (입력 글자 수 접근성)

- **글자 수 영역**: 입력이 1자 이상일 때 표시되는 글자 수/토큰 영역에 `id="input-char-count"`, `role="status"`, `aria-live="polite"`, `aria-label="현재 N자, 약 M 토큰"` 적용.
- **입력창 연동**: 메시지 입력 textarea의 `aria-describedby`에 `input-char-count` 추가(입력이 있을 때만), 스크린 리더가 글자 수 안내를 함께 읽도록 함.

## 11. 적용된 개선 (웰컴 화면 글자 수)

- **웰컴 화면 글자 수**: 웰컴 입력 푸터에 `input.length > 0`일 때 글자 수/토큰 영역 표시. `id="input-char-count"`, `role="status"`, `aria-live="polite"`, `aria-label` 적용.
- **웰컴 입력창 describedby**: 웰컴 textarea에 `aria-describedby={input.length > 0 ? 'input-hint-welcome input-char-count' : 'input-hint-welcome'}` 연동.

## 12. 적용된 개선 (입력창 포커스 링)

- **입력 wrapper 포커스**: `.input-wrapper:focus-within` / `.input-wrapper.bw-composer:focus-within` 에 2px 포커스 링 적용. `border-color`·`box-shadow`(accent-primary-glow)로 키보드 포커스 시 시인성 강화.

## 13. 적용된 개선 (스트리밍·생성 능력)

- **스트리밍 접근성**: 로딩 인디케이터에 `role="status"`, `aria-label="답변 생성 중"`, `aria-busy="true"`. 스트리밍 중 assistant 메시지에 `aria-live="polite"`, `aria-busy`, `aria-label` 보강.
- **생성 답변 능력 최대 활용**: 검색·자료 활용 시 품질 자동 상향(basic→enhanced, enhanced→ultimate). 기본 응답 모드 상세(ultimate). 자세한 내용은 [ANSWER_QUALITY_AND_SEARCH §2.4](./ANSWER_QUALITY_AND_SEARCH.md#24-생성-답변-능력-최대-활용-품질-상향).

## 14. 품질·생성 능력 확인 시나리오

| # | 시나리오 | 조치 | 기대 결과 |
|---|----------|------|-----------|
| 14.1 | 품질 상향 | "차이점 알려줘" 등 검색·자료 활용 문구 입력 후 전송 | 요청 시 API에 전달되는 quality가 사용자 선택보다 한 단계 이상 상향(간결→enhanced, Auto→ultimate) |
| 14.2 | 기본 모드 | 저장값 없이 대화 화면 첫 진입 후 드롭다운 확인 | 응답 모드가 **상세**로 표시됨(기본 ultimate) |
| 14.3 | 입력 힌트 | 요약/비교/설명 등 입력 시 푸터 확인 | "검색·자료 활용해 답변" 문구가 표시될 수 있음 |
| 14.4 | API quality 전달 | 네트워크 탭에서 /api/chat 또는 /api/unified/chat 요청 확인 | 요청 body에 `quality`(basic \| enhanced \| ultimate) 필드 포함. 미포함 시 백엔드 기본값 enhanced 적용 |

## 15. 다음 개선 후보

- **성공 토스트 포커스**: 복사 등 성공 토스트는 현재 포커스 유지. 필요 시 옵션만 검토

---

*최종 업데이트: §13 스트리밍·생성 능력, §14 품질 확인 시나리오*

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

