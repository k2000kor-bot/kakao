# 딥시크: 설치 → 구동 → 개발 → 학습 한 흐름

딥시크(DeepSeek)를 **설치하고**, **구동 확인한 뒤**, **개발을 진행**하고, **자료를 넣어 학습**시키는 순서를 한 문서에서 참조할 수 있도록 정리했습니다.

> 상세 내용은 아래 각 문서의 해당 섹션을 참고하세요.

---

## 1. 설치

- **설치형(로컬)**: [DEEPSEEK_SETUP.md §1](./DEEPSEEK_SETUP.md#1-설치형로컬-deepseek--개발용-권장) — Ollama 설치, `ollama pull deepseek-r1`, 환경 변수 `DEEPSEEK_USE_LOCAL=true`, `DEEPSEEK_LOCAL_MODEL=deepseek-r1`
- **API(클라우드)**: [DEEPSEEK_SETUP.md §2](./DEEPSEEK_SETUP.md#2-apicloud-deepseek) — `DEEPSEEK_API_KEY=sk-...` 설정

**지금 설치형 연결하기**: `backend/.env`에 `env.example.deepseek` 내용을 참고해 `DEEPSEEK_USE_LOCAL=true`, `DEEPSEEK_LOCAL_MODEL=deepseek-r1` 저장 후 백엔드 재시작. 연결이 안 되면 [DEEPSEEK_SETUP §4·§5](./DEEPSEEK_SETUP.md#41-딥시크가-동작하지-않을-때-체크리스트) 참고.

---

## 2. 구동 확인

1. 백엔드(5002) 재시작: `./start_all.sh` 또는 `npm run restart:backend`
2. **GET /api/health**: `curl http://localhost:5002/api/health` → 응답에 `llm_provider`가 `deepseek` 또는 `deepseek-local`인지 확인
3. 설정 화면(/settings) "LLM 엔진" 섹션에서 현재 provider 표시 확인
4. 대화에서 메시지 전송 후 DeepSeek 응답 확인

동작하지 않을 때: [DEEPSEEK_SETUP §4.1 딥시크가 동작하지 않을 때](./DEEPSEEK_SETUP.md#41-딥시크가-동작하지-않을-때-체크리스트) 체크리스트 순서대로 확인.

---

## 3. 개발 진행

- **코드 경로**: [DEEPSEEK_DEVELOPMENT_ORDER.md](./DEEPSEEK_DEVELOPMENT_ORDER.md) — llm_service, unified_chat_api, provider 우선순위, 딥시크 우선 시도(5.1a)
- **튜닝·품질**: [ANSWER_QUALITY_AND_SEARCH.md](./guides/ANSWER_QUALITY_AND_SEARCH.md) — quality(basic|enhanced|ultimate), pipeline_tuning_config
- **도메인 지식**: [DOMAIN_KNOWLEDGE_AND_WRITER.md](./DOMAIN_KNOWLEDGE_AND_WRITER.md) — 도시정비·부동산·조합 등 지식 주입

---

## 4. 학습(자료 넣기)

- **어디에 무엇을 넣나**: [DEEPSEEK_LEARNING_AND_MATERIALS.md](./DEEPSEEK_LEARNING_AND_MATERIALS.md) — 프로젝트 지침·소스 추가, 파일 업로드(PDF·워드·텍스트·이미지), 논리·자료 흐름
- **대화에서 활용**: 해당 프로젝트를 선택한 상태에서 메시지 전송 시 `projectKnowledge`로 전달되어 DeepSeek이 참고해 답변

---

## 5. 체크리스트 (배포 전 확인)

| 순서 | 항목 | 참고 |
|------|------|------|
| 1 | backend/.env 설정 | DEEPSEEK_SETUP §1(설치형) 또는 §2(API) |
| 2 | 백엔드 재시작 | .env 수정 후 반드시 재시작 |
| 3 | GET /api/health → llm_provider 확인 | deepseek 또는 deepseek-local |
| 4 | 대화 전송 → 응답 확인 | 로그에 "🤖 DeepSeek 우선 시도", "✅ DeepSeek 응답 사용" |
| 5 | (선택) 배포 전 검증 | [COMPLETION_CHECKLIST.md §6](./COMPLETION_CHECKLIST.md#6-마무리-검증-순서-완성도-확인용) — `npm run verify:completion` |

**프론트 회귀·원격 push**: 저장소 루트에서 `npm run test:sidebar-context` — [../TESTING_GUIDE.md](../TESTING_GUIDE.md) · 원격 push는 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md).

---

## 6. (선택) 백엔드 단위 테스트

DeepSeek/LLM 코드 경로 mock 테스트: backend 의존성·venv 활성화 후

```bash
cd backend
python3 -m pytest tests/test_unified_chat_api.py::TestDeepSeekLLMPathMock -v
```

---

## 7. 참고 문서

- [DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md) — 설치형/API 상세, §4.1 동작 체크리스트, §5 되돌리기
- [DEEPSEEK_DEVELOPMENT_ORDER.md](./DEEPSEEK_DEVELOPMENT_ORDER.md) — 전체 개발 순서·5.1a 딥시크 우선 시도
- [DEEPSEEK_LEARNING_AND_MATERIALS.md](./DEEPSEEK_LEARNING_AND_MATERIALS.md) — 학습·논리·자료 넣는 방법
- [NOTEBOOK_LLM_VS_DEEPSEEK_LLM.md](./NOTEBOOK_LLM_VS_DEEPSEEK_LLM.md) — 노트북 LLM vs 딥시크 비교

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
