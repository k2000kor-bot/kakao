# 노트북LLM vs 딥시크LLM — 성능·튜닝 비교

현재 시스템에서 사용 중인 **노트북 LLM**과 **딥시크 LLM(DeepSeek)** 을 성능·튜닝 관점에서 비교한 문서입니다.  
**적용 상태**: `DEEPSEEK_API_KEY`를 설정하면 **전체 대화·노트북·통합 API가 DeepSeek을 기본으로 사용**합니다. 설정 방법은 [DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md) 참고.

---

## 1. 현재 시스템: 노트북 LLM (DeepSeek 미설정 시)

### 1.1 구조

| 구분 | 내용 |
|------|------|
| **백엔드** | `backend/llm_service.py`, `backend/notebook_llm_integration.py` |
| **기본 엔진** | Ollama 로컬 (기본 모델 `qwen3:4b`, `LLM_MODEL` 환경변수로 변경 가능) |
| **통합** | `NotebookLLMIntegration` — 로컬(Ollama) + 클라우드(GPT-4, Claude, Gemini) 하이브리드 |
| **프로젝트 컨텍스트** | 프로젝트별 학습 소스·가이드라인을 대화/노트북 API에 전달 |

### 1.2 튜닝 파라미터 (현재)

| 파라미터 | 위치 | 값 |
|----------|------|-----|
| **temperature** | `notebook_llm_integration.py` (Ollama 호출) | 0.7 |
| **top_p** | 동일 | 0.9 |
| **num_predict** | 동일 | 1024 |
| **unified_chat_api** | 요청/컨텍스트 | temperature 0.8, max_tokens 4096 |

### 1.3 성능·특징

- **장점**
  - 로컬(Ollama) 사용 시 **비용·지연 제어** 용이
  - **프로젝트 컨텍스트**(파일·지침·웹소스)와 기존 대화/노트북 플로우와 **완전 연동**
  - 메모리·복잡도에 따라 **로컬/클라우드/하이브리드** 자동 전환
  - 한국어·분석·빠른응답 등 **용도별 모델 우선순위** 설정 가능
- **단점**
  - 기본 로컬 모델(qwen3:4b)은 **대형 모델 대비 품질·추론력 한계**
  - Ollama·로컬 리소스 의존 — **스케일·가용성**은 인프라에 종속
  - **세밀한 튜닝**(프롬프트/파라미터 외)은 코드 수정 필요

---

## 2. 대안: 딥시크 LLM (DeepSeek)

### 2.1 개요

- **DeepSeek API**: `deepseek-chat`(일반), `deepseek-reasoner`(추론 강화) 등
- **모델**: DeepSeek-V3(대형, MoE), DeepSeek-R1(추론 특화) 등 — 공식 API 문서 기준

### 2.2 성능·아키텍처 (참고)

- **DeepSeek-V3**: 대규모 파라미터, MoE로 **토큰당 활성 파라미터는 제한** — 지연·비용 대비 효율적
- **KV 캐시**: MLA 등으로 **메모리 절감** — 긴 문맥·스트리밍에 유리
- **Quantization**: 4bit 등 양자화로 **단일 머신/소규모 GPU** 배포 가능 (자체 호스팅 시)

### 2.3 튜닝·API

- **API 파라미터**: `temperature`, `max_tokens` 등 OpenAI 호환 스타일 제공
- **Fine-tuning**: 서드파티(예: Fireworks AI)에서 **QAT 등 파인튜닝**로 품질·지연·비용 최적화 가능
- **현재 코드베이스**: **딥시크 연동 완료** — `llm_service.py`(deepseek·deepseek-local), `notebook_llm_integration.py`에서 provider·응답 생성 적용. [DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md), [DEEPSEEK_DEVELOPMENT_ORDER.md](./DEEPSEEK_DEVELOPMENT_ORDER.md) 참고.

---

## 3. 성능·튜닝 비교 요약

| 항목 | 노트북 LLM (현재) | 딥시크 LLM |
|------|-------------------|------------|
| **품질(일반·복잡 질문)** | 로컬 qwen3:4b는 제한적; 클라우드 연동 시 상승 | V3/R1 기준 **벤치마크·추론력 우위** 가능 |
| **지연(첫 토큰·E2E)** | 로컬 Ollama는 네트워크 없이 낮음; 클라우드는 API 의존 | API 사용 시 **지역·엔드포인트에 따라 상이** |
| **비용** | 로컬은 전기·HW만; 클라우드 시 기존 OpenAI/Anthropic 등과 유사 | **저가 API** 이미지; 사용량·요금제에 따라 선택 |
| **튜닝 유연성** | temperature/top_p/num_predict 등 **코드/설정에서 조정** | API + (선택) **파인튜닝**으로 도메인 맞춤 가능 |
| **프로젝트·컨텍스트** | **이미 연동됨**(프로젝트 소스·지침·대화 히스토리) | **동일 플로우에 넣으려면** API 레이어·컨텍스트 주입 구현 필요 |
| **운영·인프라** | Ollama·자체 서버 관리 필요(로컬 모드) | **관리형 API**면 서버 부담 감소 |
| **한국어** | 노트북 LLM 측에서 **한국어 우선 모델** 설정 가능 | 공식 벤치 기준 **한국어 지원**; 실제 품질은 테스트 권장 |

---

## 4. 변경 시 권장 방향

### 4.1 “성능·튜닝”만 놓고 보면

- **답변 품질·추론력**을 올리는 것이 목표라면  
  → **딥시크(DeepSeek) API 도입**을 검토하는 것이 유리합니다.  
  (현재 로컬 qwen3:4b 대비 일반적으로 상위 모델에 해당.)
- **지연·비용**을 더 줄이려면  
  - 현재처럼 **로컬 Ollama**를 쓰는 구간은 유지하고,  
  - “무거운” 질문만 **딥시크 API**로 보내는 **하이브리드**도 가능합니다.

### 4.2 “지금 만든 시스템”과 맞추려면

- **프로젝트 컨텍스트·대화 플로우**는 이미 노트북 LLM 쪽에 맞춰져 있으므로:
  - **딥시크로 변경**할 경우:
    - `llm_service.py` 또는 `notebook_llm_integration.py`에 **DeepSeek provider** 추가
    - 기존와 동일하게 **프로젝트 ID·지침·소스 요약·대화 히스토리**를 **프롬프트/메시지**로 전달
    - `temperature`, `max_tokens` 등은 **unified_chat_api**에서 쓰는 값과 맞추어 매핑
  - **노트북 LLM을 유지**할 경우:
    - **튜닝**은 `temperature`(0.7→0.8 구간), `num_predict`(1024→2048 등), `top_p` 조정으로 먼저 시도
    - 필요 시 **Ollama 모델만** 더 큰 모델(qwen 더 큰 버전, 또는 다른 로컬 모델)로 교체

### 4.3 정리

| 목표 | 추천 |
|------|------|
| **품질·추론력** 우선 | 딥시크 API 도입(또는 하이브리드에서 “무거운” 요청만 딥시크) |
| **비용·지연** 우선 + 로컬 활용 | 노트북 LLM 유지 + Ollama 모델·파라미터 튜닝 |
| **둘 다** | 노트북 LLM(로컬) + 딥시크 API를 선택 가능한 **이중 provider**로 확장 |

---

## 5. 참고

- **한 흐름 가이드**: [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) — 설치→구동→개발→학습·체크리스트·배포 전 확인
- **현재 노트북 LLM**: `backend/notebook_llm_integration.py` (Ollama 옵션: temperature 0.7, top_p 0.9, num_predict 1024)
- **통합 대화**: `backend/api/unified_chat_api.py` (temperature 0.8, max_tokens 4096)
- **LLM provider 우선순위**: `backend/llm_service.py` — `LLM_PROVIDER`, `NOTEBOOK_LLM_AVAILABLE`, OpenAI/Anthropic 순
- **DeepSeek**: [DeepSeek API Docs](https://api-docs.deepseek.com/), 외부 벤치/파인튜닝 자료(예: Fireworks AI 블로그 등)
