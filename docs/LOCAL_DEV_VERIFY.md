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
- **답변 생성 POST /api/chat** 은 `OPENAI_API_KEY` 등 LLM 설정이 없으면 **폴백 문구**만 나와 스크립트가 FAIL 할 수 있습니다.
- 실제 관계도 **정리된 답변**(표·Mermaid 합성)은 **브라우저**에서 스트림/E2E 스텁과 동일하게 프론트 `generateGraphAnswerViaChat`가 처리합니다.

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
