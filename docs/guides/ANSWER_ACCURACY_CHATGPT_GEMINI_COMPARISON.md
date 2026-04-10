# 질문·요구 답변 정확도 — ChatGPT/Gemini와 비교

질문과 요구를 넣었을 때 **현재 시스템**이 **ChatGPT·Gemini**와 다르게 나오는 원인과 개선 사항을 정리합니다.

---

## 1. 기대 결과 (ChatGPT/Gemini 스타일)

| 입력 예시 | 기대 답변 |
|-----------|-----------|
| "1+1은 뭐야? 한 줄로 답해줘" | "2입니다." 같은 **직접·간결한 답** |
| "사건조사 형식으로 요약해줘" | **개요·경과·원인·결론·시사점** 구조의 실제 내용 |
| "반대 논리로 작성해줘" | 제시 문장에 대한 **반대 입장만** 서술 |

공통: **질문/요구에 맞는 본문 답변**이 나와야 하고, "준비 중"·"이야기를 들려드리겠습니다" 같은 **안내/템플릿만** 나오면 안 됨.

---

## 2. 차이가 났던 원인

### 2.1 워크스페이스 도구 스텁 조기 반환

- **원인**: 메시지가 "요약", "보고서", "대화" 등으로 해석되면 **워크스페이스 의도 라우터**가 `conversation_summary`, `report_generate` 등 도구를 제안. 해당 도구는 아직 **스텁**(미구현)이라 `"대화 요약 기능은 준비 중입니다."` 같은 메시지만 반환.
- **결과**: 사용자는 **실제 답변 대신** "준비 중" 안내만 받음.
- **조치**: 스텁 도구(`success: False`)인 경우 **해당 메시지를 최종 응답으로 쓰지 않고**, 정상 LLM 경로로 진행하도록 수정. (`unified_chat_api.generate_chat_response` — 도구 결과가 `success: True`일 때만 조기 반환.)

### 2.2 enhanced/ultimate에서 직접 LLM 미시도

- **원인**: `basic`만 `prefer_direct_llm: true`였고, `enhanced`·`ultimate`는 **지능형 엔진**만 사용. 지능형 엔진이 템플릿형 문장("이야기를 하나 들려드리겠습니다" 등)을 낼 수 있음.
- **결과**: 질문에 대한 **직접·자연스러운 답**(ChatGPT/Gemini 스타일) 대신 구조화/템플릿 위주 응답이 나올 수 있음.
- **조치**: `enhanced`·`ultimate` 프리셋에 **`prefer_direct_llm: true`** 추가. 질문 수신 시 **먼저 직접 LLM**으로 답변 시도하고, 실패/타임아웃 시 기존 파이프라인(웹 연구·지능형 엔진 등)으로 진행. (`pipeline_tuning_config.json`, `pipeline_tuning.py`)

---

## 3. 적용된 수정 요약

| 항목 | 파일 | 내용 |
|------|------|------|
| 스텁 도구 시 조기 반환 제거 | `backend/api/unified_chat_api.py` | `tool_result.get("success") is True`일 때만 도구 메시지 반환; 스텁이면 LLM 경로로 진행 |
| enhanced 직접 LLM 우선 | `backend/pipeline_tuning_config.json`, `backend/pipeline_tuning.py` | `enhanced`에 `prefer_direct_llm: true` 추가 |
| ultimate 직접 LLM 우선 | 동일 | `ultimate`에 `prefer_direct_llm: true` 추가 |

---

## 4. 확인 방법

1. **질문·요구 테스트**: `./scripts/test-chat-answer.sh` — 테스트1(한 줄 답), 테스트6(사건조사 형식), 테스트7(생성로직) 등에서 **실제 내용 답변**이 나오는지 확인.
2. **동일 질문으로 비교**: 동일 질문·요구를 ChatGPT/Gemini와 현재 API에 넣고, (1) 직접 답이 나오는지, (2) 형식(한 줄/보고서/사건조사)이 맞는지 비교.
3. **"준비 중" 회피**: "요약해줘", "보고서로 정리해줘" 등 입력 시 **"대화 요약/보고서 기능은 준비 중"**이 아니라 **실제 요약/보고서 내용**이 나오는지 확인.

---

## 5. 참고

- [ANSWER_QUALITY_AND_SEARCH.md](./ANSWER_QUALITY_AND_SEARCH.md) — 품질·검색·adapt_answer_to_request
- [CHAT_ANSWER_FLOW_VERIFICATION.md](./CHAT_ANSWER_FLOW_VERIFICATION.md) — 입력→전송→답변 표시 흐름
- [CHATGPT_GEMINI_LIKE_ANSWER_GUIDE.md](./CHATGPT_GEMINI_LIKE_ANSWER_GUIDE.md) — ChatGPT/Gemini 스타일 답변 가이드
