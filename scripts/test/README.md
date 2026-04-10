# 테스트 스크립트 (Python)

## 통합 백엔드 (권장)

- **URL**: `http://localhost:5002` — `main_server` (`npm run restart:backend`)
- **헬스**: `GET /api/health`
- **문서**: `GET /api/docs`

`api_test.py` 등이 여기를 기준으로 동작하는지 확인하세요.

## 레거시 / 전용 서버

| 스크립트 | 환경 변수 | 기본 베이스 | 비고 |
|----------|-----------|-------------|------|
| `test_unified_system.py` | `CORBU_UNIFIED_TEST_BASE` | `http://localhost:8001` | `/api/command` 등 레거시 unified 서버 전용 |
| `system_integration_test.py` | `CORBU_V8_BASE_URL` | `http://localhost:8001` | v8 스타일 API 가정 |
| `test_ultimate_media_system.py` | `CORBU_ULTIMATE_MEDIA_BASE` | `http://localhost:5002` | UMKS·통합에 맞춤, 엔드포인트 없으면 404 |
| `test_enhanced_conversational.py` | `CORBU_ENHANCED_CONV_BASE` | `http://localhost:5002` | `/api/v2/enhanced/*` (main_server에 마운트됨) |

통합 서버만 띄운 상태에서 레거시 스크립트를 돌리면 일부 단계가 실패할 수 있습니다. 그때는 위 환경 변수로 실제 기동 중인 서버 URL을 지정하세요.

- **`backend/test_api.py`**: `CORBU_TEST_API_BASE` (기본 `http://localhost:5002`)
- **`backend/test_integrated_api.py`**: `CORBU_INTEGRATED_TEST_BASE` — 호스트만 또는 `.../api/integrated` 전체 (이중 경로 자동 정규화)
- **`test_conversational_qa.py`**, **`test_web_research.py`**: `CORBU_TEST_API_BASE` (기본 `http://localhost:5002`)
