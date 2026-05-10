# 포트 설정 정책

프론트엔드·백엔드 포트를 한곳에서 정리합니다.

---

## 기본 포트

| 용도 | 포트 | 설명 |
|------|------|------|
| **프론트엔드** | **3000** | React 개발 서버 (`npm start`, `PORT=3000`) |
| **백엔드 API** | **5002** | 통합 API — 기본 **`main_server:app`** (uvicorn, `npm run restart:backend`). 대안: Flask **`python3 -m api.main`** (`backend/api/main.py`) |
| **루팅 추출 수신** | **8005** | **`ROOTED_KAKAO_PORT`** / **`PORT`** — `rooted_kakao_extractor.py` (Android 루트 APK). 스텁 `analysis_server`·`apartment_community_analyzer` 기본값과 겹칠 수 있음 → 한쪽 포트 변경 |
| **아파트 커뮤니티 분석** | **8005** | **`APARTMENT_COMMUNITY_PORT`** / **`PORT`** — `start_real_estate_ai_system.sh` |
| **시공사 정보** | **8006** | **`CONSTRUCTION_COMPANY_INFO_PORT`** / **`PORT`** |
| **시장 분석 엔진** | **8007** | **`MARKET_ANALYSIS_ENGINE_PORT`** / **`PORT`** |
| **꿈 시각화** | **8008** | **`DREAM_VISUALIZATION_PORT`** / **`PORT`** |
| **simple_server** | **8000** | **`SIMPLE_SERVER_PORT`** / **`PORT`** |
| **nlp_master_server** | **8000** | **`NLP_MASTER_SERVER_PORT`** / **`PORT`** |
| **advanced_api_server_backup** | **8000** | **`ADVANCED_API_BACKUP_PORT`** / **`PORT`** |
| **레거시 WebSocket** | **8001** | `advanced_websocket_server.py` — **`ADVANCED_WS_PORT`** |
| **레거시 advanced_api_server** | **8000** | **`ADVANCED_API_PORT`** / **`PORT`** |
| **레거시 intent_classifier 단독** | **8000** | **`INTENT_CLASSIFIER_PORT`** / **`PORT`** |
| **comprehensive_message_api** | **8001** | **`COMPREHENSIVE_MESSAGE_PORT`** / **`PORT`** |
| **chatgpt_unified_system** | **8001** | **`CHATGPT_UNIFIED_SYSTEM_PORT`** / **`PORT`** |
| **advanced_media_analysis_api** | **8001** | **`ADVANCED_MEDIA_ANALYSIS_PORT`** / **`PORT`** |
| **message_generation_server** | **8003** | **`MESSAGE_GENERATION_PORT`** / **`PORT`** |
| **message_api_server** | **8002** | **`MESSAGE_API_SERVER_PORT`** / **`PORT`** |
| **chat_upload_server** | **8004** | **`CHAT_UPLOAD_SERVER_PORT`** / **`PORT`** |
| **persistent_chat_session_api** | **8001** | **`PERSISTENT_CHAT_SESSION_PORT`** / **`PORT`** |
| **chat_analysis_main** | **8002** | **`CHAT_ANALYSIS_MAIN_PORT`** / **`PORT`** |
| **simplified_advanced_api** | **8001** | **`SIMPLIFIED_ADVANCED_API_PORT`** / **`PORT`** |
| **스텁 analysis_server** | **8005** | **`ANALYSIS_SERVER_PORT`** / **`PORT`** |
| **스텁 context_server** | **8006** | **`CONTEXT_SERVER_PORT`** / **`PORT`** |
| **스텁 media_server** | **8007** | **`MEDIA_STUB_SERVER_PORT`** / **`PORT`** |
| **스텁 strategy_server** | **8008** | **`STRATEGY_SERVER_PORT`** / **`PORT`** |
| **simulation_server** (전체 앱) | **8009** | **`SIMULATION_SERVER_PORT`** / **`PORT`** (`start_fixed_ports`와 동일) |
| **sync_server** (전체 앱) | **8010** | **`SYNC_SERVER_PORT`** / **`PORT`** |
| **레거시 simple_api** | **8003** | `simple_api_server.py` — **`SIMPLE_API_PORT`** (기본 8003) |
| **레거시 unified_api_server** | **8004** | `unified_api_server.py` — **`UNIFIED_API_LEGACY_PORT`** (기본 8004) |
| **경량 integrated만** | **5002** | `start_simple_integrated_server.py` — **`BACKEND_PORT`** / **`PORT`** (기본 5002, `main_server`와 동일 권장) |
| **레거시 Flask 분석** | **5001** | `gaeposung_analysis_api.py` — **`GAEPO_ANALYSIS_PORT`** |
| **자동 학습 Flask (단독)** | **5012** | `auto_learning_api.py` — **`AUTO_LEARNING_PORT`** (통합 5002·개포 5001과 분리) |
| **app.py 단독 (레거시 인증 등)** | **5002** | **`API_PORT`** / **`BACKEND_PORT`** (기본 5002, `main_server` 와 동일 권장) |
| **cache_manager** | **8014** | **`CACHE_MANAGER_PORT`** / **`PORT`** |
| **performance_monitor** | **8013** | **`PERFORMANCE_MONITOR_PORT`** / **`PORT`** |
| **security_manager** | **8015** | **`SECURITY_MANAGER_PORT`** / **`PORT`** |
| **backend/test_server.py** | **5000** | **`TEST_SERVER_PORT`** / **`PORT`** |
| **integrated_api_server (레거시)** | **8095** | **`INTEGRATED_API_SERVER_PORT`** / **`PORT`** |
| **real_kakao_api_server** | **8003** | **`REAL_KAKAO_API_PORT`** / **`PORT`** |
| **chat_database_api** | **8002** | **`CHAT_DATABASE_API_PORT`** / **`PORT`** |
| **advanced_ai_features** | **8011** | **`ADVANCED_AI_FEATURES_PORT`** / **`PORT`** |
| **advanced_message_generation_server** | **8011** | **`ADVANCED_MESSAGE_GENERATION_PORT`** / **`PORT`** |
| **ai_conversation_optimizer** | **8011** | **`AI_CONVERSATION_OPTIMIZER_PORT`** / **`PORT`** |
| **scalability_manager** | **8010** | **`SCALABILITY_MANAGER_PORT`** / **`PORT`** (`sync_server` 와 기본값 동일 시 한쪽만 실행 또는 포트 변경) |
| **long_term_planning** | **8012** | **`LONG_TERM_PLANNING_PORT`** / **`PORT`** |
| **ai_conversation_pattern_analyzer** | **8012** | **`AI_CONVERSATION_PATTERN_ANALYZER_PORT`** / **`PORT`** |
| **advanced_ai_engine** | **8013** | **`ADVANCED_AI_ENGINE_PORT`** / **`PORT`** |
| **chatgpt_like_upload_system** | **8090** | **`CHATGPT_LIKE_UPLOAD_PORT`** / **`PORT`** |
| **ultra_chatgpt_advanced_system** | **8091** | **`ULTRA_CHATGPT_ADVANCED_PORT`** / **`PORT`** |
| **project_media_auto_classifier** | **8092** | **`PROJECT_MEDIA_AUTO_CLASSIFIER_PORT`** / **`PORT`** |
| **advanced_message_research_system** | **8093** | **`ADVANCED_MESSAGE_RESEARCH_PORT`** / **`PORT`** |
| **advanced_dialogue_pattern_system** | **8094** | **`ADVANCED_DIALOGUE_PATTERN_PORT`** / **`PORT`** |
| **simple_demo_server** | **8080** | **`SIMPLE_DEMO_SERVER_PORT`** / **`PORT`** |
| **websocket_server** | **8002** | **`WEBSOCKET_SERVER_PORT`** / **`PORT`** |
| **simple_ultimate_api_server** | **8004** | **`SIMPLE_ULTIMATE_API_PORT`** / **`PORT`** |
| **web_scraper_service** | **8013** | **`WEB_SCRAPER_SERVICE_PORT`** / **`PORT`** (성능 모니터 8013과 동시 실행 시 한쪽 변경) |
| **enhanced_integration_api** | **5003** | **`ENHANCED_INTEGRATION_API_PORT`** / **`PORT`** |
| **integrated_auto_learning_api** | **5002** | **`INTEGRATED_AUTO_LEARNING_API_PORT`** / **`BACKEND_PORT`** / **`API_PORT`** / **`PORT`** |
| **integrated_conversation_server** | **8003** | **`INTEGRATED_CONVERSATION_SERVER_PORT`** / **`PORT`** |
| **enhanced_unified_api_server** | **8005** | **`ENHANCED_UNIFIED_API_SERVER_PORT`** / **`PORT`** |
| **advanced_korean_nlp_engine** (단독 앱) | **8007** | **`ADVANCED_KOREAN_NLP_ENGINE_PORT`** / **`PORT`** |
| **integrated_kakao_api** | **8003** | **`INTEGRATED_KAKAO_API_PORT`** / **`PORT`** |
| **quantum_neural_message_api** | **8010** | **`QUANTUM_NEURAL_MESSAGE_API_PORT`** / **`PORT`** |
| **quantum_ai_system** | **8004** | **`QUANTUM_AI_SYSTEM_PORT`** / **`PORT`** |
| **agi_api_server** | **8010** | **`AGI_API_SERVER_PORT`** / **`PORT`** |
| **simplified_ultra_api** | **8010** | **`SIMPLIFIED_ULTRA_API_PORT`** / **`PORT`** |
| **ultra_advanced_api** | **8003** | **`ULTRA_ADVANCED_API_PORT`** / **`PORT`** |
| **advanced_ai_enhancement** | **8003** | **`ADVANCED_AI_ENHANCEMENT_PORT`** / **`PORT`** |
| **demo_server** | **8002** | **`DEMO_SERVER_PORT`** / **`PORT`** |
| **advanced_promotional_analytics** | **8007** | **`ADVANCED_PROMOTIONAL_ANALYTICS_PORT`** / **`PORT`** |
| **promotional_content_system** | **8006** | **`PROMOTIONAL_CONTENT_SYSTEM_PORT`** / **`PORT`** |
| **media_knowledge_system** | **8005** | **`MEDIA_KNOWLEDGE_SYSTEM_PORT`** / **`PORT`** |
| **ultimate_message_integration** | **8002** | **`ULTIMATE_MESSAGE_INTEGRATION_PORT`** / **`PORT`** |
| **enhanced_message_system** | **8001** | **`ENHANCED_MESSAGE_SYSTEM_PORT`** / **`PORT`** |
| **simple_unified_server** | **8000** | **`SIMPLE_UNIFIED_SERVER_PORT`** / **`PORT`** |
| **unified_message_system** | **8000** | **`UNIFIED_MESSAGE_SYSTEM_PORT`** / **`PORT`** |
| **main_kakao_system** | **8004** | **`MAIN_KAKAO_SYSTEM_PORT`** / **`PORT`** |
| **simple_api_test** | **8003** | **`SIMPLE_API_TEST_PORT`** / **`PORT`** |
| **enhanced_construction_api** | **8002** | **`ENHANCED_CONSTRUCTION_API_PORT`** / **`PORT`** |
| **cloud_native_orchestration** | **8005** | **`CLOUD_NATIVE_ORCHESTRATION_PORT`** / **`PORT`** |
| **deep_emotion_analysis_system** | **8004** | **`DEEP_EMOTION_ANALYSIS_SYSTEM_PORT`** / **`PORT`** |
| **blockchain_conversation_integrity** | **8002** | **`BLOCKCHAIN_CONVERSATION_INTEGRITY_PORT`** / **`PORT`** |
| **multi_ai_orchestration_system** | **8001** | **`MULTI_AI_ORCHESTRATION_SYSTEM_PORT`** / **`PORT`** |
| **enterprise_microservice_architecture** | **8000** | **`ENTERPRISE_MICROSERVICE_ARCHITECTURE_PORT`** / **`PORT`** |
| **ultimate_integration_api_server** | **8080** | **`ULTIMATE_INTEGRATION_API_PORT`** / **`PORT`** |
| **nlp_master_server** (마스터 리스너) | **8000** | **`NLP_MASTER_SERVER_PORT`** / **`PORT`** |
| **nlp_master_server** (하위 시스템 메타) | **8001–8006** | **`NLP_MASTER_SYSTEM_BASE_PORT`** (기본 8001) + 오프셋 0~5 |
| **unified_api_server** (레거시) | **8004** | **`UNIFIED_API_LEGACY_PORT`** / **`PORT`** |
| **simple_api_server** | **8003** | **`SIMPLE_API_PORT`** / **`PORT`** |
| **start_simple_integrated_server** | **5002** | **`BACKEND_PORT`** / **`API_PORT`** / **`PORT`** |
| **backend/main.py** (`main:app`) | **5002** | **`BACKEND_PORT`** / **`API_PORT`** / **`PORT`** |
| **backend/run.py** | **5002** | **`BACKEND_PORT`** / **`API_PORT`** / **`PORT`** |
| **backend/app.py** (uvicorn) | **5002** | **`API_PORT`** / **`BACKEND_PORT`** / **`PORT`** |
| **simple_test_server** | **8006** | CLI 인자 또는 **`SIMPLE_TEST_SERVER_PORT`** / **`PORT`** |
| **ultimate_integrated_server** | **8000** | **`ULTIMATE_INTEGRATED_SERVER_PORT`** / **`ULTIMATE_HTTP_PORT`** / **`PORT`** |
| **ultimate_microservices_orchestrator** | **8000** | **`ULTIMATE_MICROSERVICES_ORCHESTRATOR_PORT`** / **`PORT`** |
| **enhanced_conversational_api** | **8003** | **`ENHANCED_CONV_PORT`** / **`PORT`** |
| **advanced_websocket_server** (ws) | **8001** | **`ADVANCED_WS_PORT`** / **`PORT`** |
| **chatgpt_unified_system** → 스크래퍼 호출 | **8013** | **`CORBU_WEB_SCRAPER_BASE`** (전체 베이스 URL) 또는 **`WEB_SCRAPER_SERVICE_PORT`** / **`PORT`** |

**추가 레거시 단독 모듈**(`context_manager`, `analytics_tracker`, `integrated_analysis_api_server`, 카카오/문맥/NLP/예측/알림/시각화 등 다수)은 기본 포트가 서로 겹칠 수 있습니다. 실행 전 **`PORT`** 또는 각 파일의 **`XXX_SERVICE_PORT` / `XXX_SERVER_PORT`**(예: `CONTEXT_MANAGER_SERVICE_PORT`, `NOTIFICATION_SERVER_PORT`)를 지정하고, 목록은 **`env.example`** 의 `# 기타 레거시 마이크로서비스` 주석 블록을 참고하세요.

백엔드 **`intent_classifier.py`** 의 라우팅 메타 `endpoint` 기본값은 **`CORBU_MAIN_API_BASE`** 입니다. 미설정 시 **`API_PORT`** / **`BACKEND_PORT`** 로 `http://localhost:{포트}` (기본 5002). 의도 캐시는 **`CORBU_INTENT_CACHE_BASE`**; 미설정 시 **`CACHE_MANAGER_PORT`** (기본 8014). 선택 호출: **`CORBU_CONTEXT_MANAGER_BASE`**, **`CORBU_ANALYTICS_TRACKER_BASE`** (미설정 시 통합 오리진).

### CORS (레거시 단독 서버)

`app.py`, `ai_conversation_insights`, `integrated_api_server` 등 **credentials CORS** 를 쓰는 보조 서버는 **`CORS_ALLOW_ORIGINS`** 또는 **`CORS_ORIGINS`**(쉼표 구분 Origin, `*` 는 전체 허용)로 제어합니다. 미설정 시 React 개발 기본(3000/3001). 구현: **`backend/cors_config.py`** 의 **`get_cors_allow_origins()`**. 통합 **`main_server`** 는 **`CORS_ALLOW_ORIGINS` / `CORS_ORIGINS` 가 비어 있으면** `allow_origins=["*"]` (기존과 동일). 값을 주면 **`get_main_server_cors_allow_origins()`** 로 파싱합니다 (`backend/cors_config.py`).

- **`advanced_scheduler.py`** 알림 HTTP POST: **`CORBU_NOTIFICATION_API_BASE`**(전체 베이스 URL). 없으면 **`http://localhost:{NOTIFICATION_SERVER_PORT}`** — `NOTIFICATION_SERVER_PORT` 미설정 시 기본 **8004**(과거 하드코딩과 동일).
- **로컬 Ollama**(노트북 LLM·하이브리드 엔진 등): **`OLLAMA_BASE_URL`** (기본 `http://localhost:11434`, `llm_service.py`와 동일).

---

## 설정 위치

- **프론트 포트 3000**
  - `package.json`: `"start": "BROWSER=none PORT=3000 HOST=0.0.0.0 react-scripts start"`
  - `.env.local`: `PORT=3000`
- **API 포트 5002**
  - `.env.local`: `REACT_APP_API_URL=http://localhost:5002`, `REACT_APP_INTEGRATED_API_URL=http://localhost:5002`
  - `src/config/api.ts`: **`DEFAULT_API_PORT`**(5002), **`FALLBACK_API_ORIGIN`** / **`FALLBACK_WS_ORIGIN`**, **`FALLBACK_FRONTEND_ORIGIN`**(3000), **`resolveApiBaseUrl()`** — `REACT_APP_API_URL`이 비어 있을 때 절대 URL이 필요한 코드의 폴백; 구 포트(5001/8000/8001 등)는 env 보정 시 5002로 맞춤
  - 로컬 Ollama/LM Studio(프론트 기본 프로바이더): **`REACT_APP_OLLAMA_BASE_URL`**, **`REACT_APP_LM_STUDIO_BASE_URL`** (`localLLMService.ts`; 백엔드는 **`OLLAMA_BASE_URL`**)
  - `package.json`: `"proxy": "http://localhost:5002"` (상대 경로 `/api/*` 요청 시 5002로 프록시)
  - `backend/api/main.py`: **`BACKEND_PORT`** → **`API_PORT`** → **`PORT`** (기본 5002) 로 `app.run` 포트 결정
  - `backend/app.py`: **`API_PORT`** → **`BACKEND_PORT`** → **`PORT`** (기본 5002) 로 uvicorn 포트 결정

---

## 실행 순서

**터미널 1 — 백엔드** (프로젝트 루트 = `package.json` 있는 폴더)

```bash
cd /path/to/kakao-frontend/kakao-frontend
npm run restart:backend
```

또는: `bash scripts/start-api-5002.sh` · `cd backend && python3 -m api.main`  
→ http://localhost:5002

**터미널 2 — 프론트**

```bash
cd /path/to/kakao-frontend/kakao-frontend
npm start
```
→ 브라우저에서 **http://localhost:3000** (또는 터미널에 나온 포트 3001 등) 접속

프론트(3000)에서 API 호출은 `API_BASE_URL`(5002)로 나가며, `proxy` 설정으로 상대 경로 `/api/*`도 5002로 전달됩니다.

**접속 확인 (먼저 해보기)**
1. 터미널 2에서 `npm start` 실행 후, 브라우저에서 **http://localhost:3000/test.html** 열기
2. "서버 연결됨" 화면이 보이면 → 개발 서버는 동작 중. 메인: **http://localhost:3000/**
3. test.html도 안 뜨면 → **같은 PC**에서 터미널을 열고 위 순서대로 실행했는지 확인 (Cursor/원격 터미널이면 **본인 PC 터미널**에서 실행해야 함)

**접속이 안 될 때**
- "연결할 수 없음" → **브라우저를 여는 PC와 같은 PC**에서 터미널 2개로 백엔드·프론트 실행. 다른 PC에서 접속하려면 해당 PC IP로 접속 (예: http://192.168.0.10:3000)
- "로딩만 됨" → http://localhost:3000/test.html 먼저 확인 후, 메인에서 강력 새로고침 (Ctrl+Shift+R / Cmd+Shift+R)

**개발은 완료된 상태입니다.** 연결 문제는 대부분 "서버를 켠 PC"와 "브라우저를 여는 PC"가 다르거나, 서버가 꺼져 있을 때 발생합니다.

---

## 검수

- `npm start` 후 브라우저에서 http://localhost:3000 접속
- 대화·분석 등 기능이 http://localhost:5002 API와 정상 연동되는지 확인
- 백엔드 테스트: `cd backend && python3 -m pytest tests/test_main_api.py -q`

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
