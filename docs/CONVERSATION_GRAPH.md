# 대화 관계도

**경로**: `/conversation-graph` (도구 메뉴: 대화 관계도)

## 개요

- **대화 내용 업로드**: 카카오톡 내보내기 형식(.txt, .csv) 또는 동일 형식의 텍스트를 업로드하면, 참여자·메시지·시각이 파싱되어 저장됩니다.
- **동조/반대 분류**: 메시지 내용을 기준으로 **동조(찬성)·반대·중립**을 자동 분류합니다. 재개발·조합·주거 등 주제에 대한 찬반이 관계도에 반영됩니다.
- **대화 관계도**:
  - **노드**: 참여자(발신자). 색상 = 우세 입장(동조=초록, 반대=빨강, 중립=회색). 동조/반대/중립 건수 포함.
  - **엣지**: 연속 발화 흐름(회색) + **동조**(같은 찬성, 초록) · **반대**(같은 반대, 빨강) · **대립**(찬성↔반대, 주황).
- **기간·시간 지정**: 특정 기간(시작일·종료일)을 지정하면 해당 구간만 검색해 관계도를 출력합니다.

## 지원 형식

### TXT (카카오 내보내기)

- **날짜 줄**: `2024년 1월 1일`
- **메시지 줄**: `2024년 1월 1일 오전 10:00, 0116 : 메시지 내용`  
  또는 `오전 10:00, 0116 : 메시지 내용` (앞에 날짜 줄이 있는 경우)

### CSV (카카오톡 CSV 내보내기, 상대원2구역·조합방 등)

- 컬럼: **날짜**, **시간**, **유저**(이름/사용자), **메시지**(내용). 헤더 한글/영어 모두 가능.
- 날짜 예: `2026. 3. 2.` / `2026-03-02`, 시간 예: `오전 10:30` / `18:14`
- 예: `KakaoTalk_Chat_상대원2구역_조합원카톡방_2026-03-02-18-14-43.csv` 업로드 후 기간 지정·관계도 검색 시 동조/반대/대립이 노드·선 색으로 표시됨.

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/conversations/upload` | 대화 업로드. `file` (multipart) 또는 JSON `{ "text", "name", "filename" }` |
| GET | `/api/conversations` | 업로드 목록 (id, name, filename, uploaded_at, message_count) |
| GET | `/api/conversations/<upload_id>/relationship-graph` | 관계도. 쿼리: `start_date`, `end_date` (ISO 날짜, 선택) |

## 데이터 저장

- SQLite: `backend/conversation_uploads.db`
- 테이블: `conversation_uploads`, `conversation_messages` (upload_id, sender_id, sender_name, content, ts)

## 관련 파일

- 백엔드: `backend/api/conversation_graph.py`, `backend/api/main.py` (라우트)
- 프론트: `src/views/ConversationGraphView.tsx`, `src/services/conversationGraphService.ts`
- 라우트: `src/config/routes.ts` (`CONVERSATION_GRAPH_PATH`), `src/AppUnified.tsx`

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
