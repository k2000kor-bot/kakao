# 로컬 개발·검증 (push 없이)

SSH·`k2000kor-bot` 설정은 **그대로** 두고, 로컬에서만 개발·검증할 때 쓰는 명령 모음입니다.

## 1. 서버 기동

```bash
cd kakao-frontend

# 프론트만 (:3000)
npm start

# 백엔드만 (:5002) — 관계도 API·채팅
# backend/README 또는 npm run restart:backend

# 둘 다
npm run start:dev
```

접속:

| URL | 용도 |
|-----|------|
| http://localhost:3000 | React 앱 |
| http://localhost:3000/conversation-graph | 대화 관계도 |
| http://localhost:3000/chat | 채팅·컴포저 |
| http://localhost:5002/docs | 백엔드 API |

## 2. 빠른 검증 (LLM 없이)

```bash
npm run sync:frontend-src
npx tsc --noEmit
npm run verify:conversation-graph:unit   # Jest + 백엔드 pytest
npm run test:composer-pipeline             # 컴포저 147
```

## 3. E2E (프론트 :3000 필요)

```bash
npm run test:e2e:conversation-graph:chromium

# 컴포저 파이프라인 (+ agents Council)
E2E_AGENTS_COMPOSER_PIPELINE=1 E2E_SERVER_READY=1 \
  npm run test:e2e:pipelines:all
```

## 4. API 스모크 (백엔드 :5002 필요)

```bash
npm run verify:conversation-graph-api
```

- 업로드·`relationship-graph`는 **LLM 없이** 통과합니다.
- **답변 생성 POST /api/chat** (`conversation_graph_analysis` 맥락)도 스크립트가 검사합니다. LLM 미설정 시 일반 채팅 폴백만 나오면 FAIL합니다. 타임아웃: `CONVERSATION_GRAPH_CHAT_SMOKE_TIMEOUT`(기본 120초).
- 브라우저의 **정리된 합성 답변**(표·Mermaid)은 프론트 `generateGraphAnswerViaChat` + E2E 스텁이 담당합니다.

LLM 설정: `backend/.env` 또는 `env.example` 참고 (`OPENAI_API_KEY`, `OLLAMA_BASE_URL` 등).

## 5. 한 번에 (권장)

```bash
npm run ship:preflight              # handoff + 관계도 unit
npm run verify:pre-deploy           # sidebar + composer + 관계도
# 서버 기동 후
npm run verify:conversation-graph   # unit + E2E 13
```

## 6. 수동 스모크

1. `/conversation-graph` — CSV/텍스트 업로드 → 관계도 검색  
2. **답변 생성** — 표·Mermaid + 해석 (2-pass 체크박스 선택)  
3. `/chat` — 질문·요구·요청 칩, 첨부, 5단계 UI  
4. 관계도 → **대화에서 답변 생성** handoff

관련: [CONVERSATION_GRAPH.md](./CONVERSATION_GRAPH.md)

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
