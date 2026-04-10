#!/usr/bin/env bash
# 메인 src → frontend 미러: 통합 대화·프롬프트·컨텍스트 빌더 계열 동기화
# unifiedAPI.ts / enhancedBackendAPI 등은 로직은 메인과 동일, import·베이스 URL만 apiOrigin으로 치환
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

copy_pair() {
  local src="$1"
  local dest="$2"
  install -d "$(dirname "$dest")"
  cp "$src" "$dest"
  echo "synced $src -> $dest"
}

# services
for name in \
  chatConversationTurn \
  generationPromptBuilder \
  modernChatContextBuilder \
  intelligentKnowledgeProcessor \
  deepseekReviewPrompts \
  gensparkAgenticPrompts \
  gensparkReferenceAgentPreset \
  gensparkAgentRegistry; do
  copy_pair "src/services/${name}.ts" "frontend/src/services/${name}.ts"
done

copy_pair "src/services/unifiedAPI.ts" "frontend/src/services/unifiedAPI.ts"
python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/unifiedAPI.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*API_BASE_URL as CONFIG_API_BASE,\s*WS_BASE_URL,\s*FALLBACK_API_ORIGIN,\s*FILE_DOWNLOAD_PATH,\s*FILE_UPLOAD_PATH,\s*getChatPostUrlsForConfigBase,\s*\}\s*from '\.\./config/api';"
rep = "import { API_ORIGIN, WS_ORIGIN, FILE_DOWNLOAD_PATH, FILE_UPLOAD_PATH, getChatPostUrlsForConfigBase } from '../config/apiOrigin';"
s, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"frontend unifiedAPI import patch: expected 1 match, got {n}")
p.write_text(s, encoding="utf-8")
PY
sed -i '' \
  's/const API_BASE_URL = CONFIG_API_BASE || FALLBACK_API_ORIGIN;/const API_BASE_URL = API_ORIGIN;/' \
  "frontend/src/services/unifiedAPI.ts"
sed -i '' \
  's/WS_BASE_URL/WS_ORIGIN/g' \
  "frontend/src/services/unifiedAPI.ts"
sed -i '' \
  's/FALLBACK_API_ORIGIN\.replace/API_ORIGIN.replace/g' \
  "frontend/src/services/unifiedAPI.ts"
echo "patched frontend unifiedAPI (apiOrigin)"

copy_pair "src/services/enhancedFileAnalysisService.ts" "frontend/src/services/enhancedFileAnalysisService.ts"

copy_pair "src/services/enhancedBackendAPI.ts" "frontend/src/services/enhancedBackendAPI.ts"
sed -i '' \
  "s|import { API_BASE_URL, FALLBACK_API_ORIGIN } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/enhancedBackendAPI.ts"
sed -i '' \
  's/const o = API_BASE_URL || FALLBACK_API_ORIGIN;/const o = API_ORIGIN;/' \
  "frontend/src/services/enhancedBackendAPI.ts"
echo "patched frontend enhancedBackendAPI (apiOrigin)"

copy_pair "src/services/chatService.ts" "frontend/src/services/chatService.ts"
sed -i '' \
  "s|import { API_BASE_URL } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/chatService.ts"
sed -i '' \
  's/private baseUrl = API_BASE_URL;/private baseUrl = API_ORIGIN;/' \
  "frontend/src/services/chatService.ts"
echo "patched frontend chatService (apiOrigin)"

copy_pair "src/services/integratedSystemAPI.ts" "frontend/src/services/integratedSystemAPI.ts"
python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/integratedSystemAPI.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*API_BASE_URL,\s*API_HEALTH_PATH,\s*API_PROJECTS_LIST_PATH,\s*COMPREHENSIVE_ANALYSIS_PATH,\s*DATA_ANALYTICS_SOURCES_PATH,\s*EMOTION_RECOGNITION_ANALYZE_PATH,\s*FALLBACK_API_ORIGIN,\s*FILES_COLLECTION_PATH,\s*getChatPostUrlsForConfigBase,\s*INTEGRATED_FILE_UPLOAD_PATH,\s*PERFORMANCE_OPTIMIZATION_HEALTH_PATH,\s*PERFORMANCE_OPTIMIZATION_METRICS_PATH,\s*QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH,\s*QUALITY_ASSURANCE_TEST_SUITES_PATH,\s*QUALITY_ASSURANCE_TESTS_PATH,\s*REAL_TIME_METRICS_PATH,\s*SYSTEM_CONFIG_PATH,\s*\}\s*from '\.\./config/api';"
rep = "import {\n  API_HEALTH_PATH,\n  API_ORIGIN,\n  API_PROJECTS_LIST_PATH,\n  COMPREHENSIVE_ANALYSIS_PATH,\n  DATA_ANALYTICS_SOURCES_PATH,\n  EMOTION_RECOGNITION_ANALYZE_PATH,\n  FILES_COLLECTION_PATH,\n  getChatPostUrlsForConfigBase,\n  INTEGRATED_FILE_UPLOAD_PATH,\n  PERFORMANCE_OPTIMIZATION_HEALTH_PATH,\n  PERFORMANCE_OPTIMIZATION_METRICS_PATH,\n  QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH,\n  QUALITY_ASSURANCE_TEST_SUITES_PATH,\n  QUALITY_ASSURANCE_TESTS_PATH,\n  REAL_TIME_METRICS_PATH,\n  SYSTEM_CONFIG_PATH,\n} from '../config/apiOrigin';"
s, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"frontend integratedSystemAPI import patch: expected 1 match, got {n}")
p.write_text(s, encoding="utf-8")
PY
sed -i '' \
  's/this.baseURL = API_BASE_URL;/this.baseURL = API_ORIGIN;/' \
  "frontend/src/services/integratedSystemAPI.ts"
sed -i '' \
  's/const origin = API_BASE_URL || FALLBACK_API_ORIGIN;/const origin = API_ORIGIN;/' \
  "frontend/src/services/integratedSystemAPI.ts"
echo "patched frontend integratedSystemAPI (apiOrigin)"

copy_pair "src/services/integratedMessageService.ts" "frontend/src/services/integratedMessageService.ts"
python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/integratedMessageService.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*API_BASE_URL,\s*CHAT_POST_PATH,\s*FALLBACK_API_ORIGIN,\s*FILE_UPLOAD_PATH,\s*FILES_COLLECTION_PATH,\s*GUIDANCE_GENERATE_PATH,\s*INTEGRATED_POST_PATH_ANALYZE,\s*INTEGRATED_POST_PATH_FILE,\s*INTEGRATED_POST_PATH_GUIDANCE,\s*INTEGRATED_POST_PATH_PROJECT,\s*LEARNING_FEEDBACK_PATH,\s*SYSTEMS_STATUS_PATH,\s*getChatPostUrlsForConfigBase,\s*\}\s*from '\.\./config/api';"
rep = "import { API_ORIGIN, CHAT_POST_PATH, FILE_UPLOAD_PATH, FILES_COLLECTION_PATH, GUIDANCE_GENERATE_PATH, INTEGRATED_POST_PATH_ANALYZE, INTEGRATED_POST_PATH_FILE, INTEGRATED_POST_PATH_GUIDANCE, INTEGRATED_POST_PATH_PROJECT, LEARNING_FEEDBACK_PATH, SYSTEMS_STATUS_PATH, getChatPostUrlsForConfigBase } from '../config/apiOrigin';"
s, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"frontend integratedMessageService import patch: expected 1 match, got {n}")
p.write_text(s, encoding="utf-8")
PY
sed -i '' \
  's/private baseURL = API_BASE_URL || FALLBACK_API_ORIGIN;/private baseURL = API_ORIGIN;/' \
  "frontend/src/services/integratedMessageService.ts"
echo "patched frontend integratedMessageService (apiOrigin)"

copy_pair "src/services/unifiedMessageService.ts" "frontend/src/services/unifiedMessageService.ts"
sed -i '' \
  "s|import { getChatPostUrlsForConfigBase, resolveApiBaseUrl } from '../config/api';|import { API_ORIGIN, getChatPostUrlsForConfigBase } from '../config/apiOrigin';|" \
  "frontend/src/services/unifiedMessageService.ts"
sed -i '' \
  's/private baseUrl = resolveApiBaseUrl();/private baseUrl = API_ORIGIN;/' \
  "frontend/src/services/unifiedMessageService.ts"
echo "patched frontend unifiedMessageService (apiOrigin)"

# axios ApiService — resolveApiBaseUrl → API_ORIGIN (errorLogger·인터셉터는 메인과 동일)
copy_pair "src/services/api.ts" "frontend/src/services/api.ts"
python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/api.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*API_ANALYTICS_PATH,\s*API_HEALTH_PATH,\s*API_PERFORMANCE_ANALYSIS_PATH,\s*API_PERFORMANCE_CONFIG_PATH,\s*API_PERFORMANCE_METRICS_PATH,\s*API_PERFORMANCE_OPTIMIZATION_HISTORY_PATH,\s*API_PERFORMANCE_OPTIMIZE_PATH,\s*API_PROJECTS_LIST_PATH,\s*API_SESSIONS_LIST_PATH,\s*API_SYSTEM_STATUS_PATH,\s*API_USER_SETTINGS_PATH,\s*FILE_UPLOAD_PATH,\s*resolveApiBaseUrl,\s*\}\s*from '\.\./config/api';"
rep = "import { API_ANALYTICS_PATH, API_HEALTH_PATH, API_ORIGIN, API_PERFORMANCE_ANALYSIS_PATH, API_PERFORMANCE_CONFIG_PATH, API_PERFORMANCE_METRICS_PATH, API_PERFORMANCE_OPTIMIZATION_HISTORY_PATH, API_PERFORMANCE_OPTIMIZE_PATH, API_PROJECTS_LIST_PATH, API_SESSIONS_LIST_PATH, API_SYSTEM_STATUS_PATH, API_USER_SETTINGS_PATH, FILE_UPLOAD_PATH } from '../config/apiOrigin';"
s, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"frontend api.ts import patch: expected 1 match, got {n}")
p.write_text(s, encoding="utf-8")
PY
sed -i '' \
  's/this.baseURL = resolveApiBaseUrl();/this.baseURL = API_ORIGIN;/' \
  "frontend/src/services/api.ts"
echo "patched frontend api.ts (apiOrigin)"

copy_pair "src/services/advancedResponseProcessor.ts" "frontend/src/services/advancedResponseProcessor.ts"
copy_pair "src/services/conversationalQAService.ts" "frontend/src/services/conversationalQAService.ts"
copy_pair "src/services/enhancedResponseProcessor.ts" "frontend/src/services/enhancedResponseProcessor.ts"
copy_pair "src/services/multiStepResponseGenerator.ts" "frontend/src/services/multiStepResponseGenerator.ts"

copy_pair "src/services/apiOptimizationService.ts" "frontend/src/services/apiOptimizationService.ts"
python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/apiOptimizationService.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*API_HEALTH_PATH,\s*API_PROJECTS_LIST_PATH,\s*API_SESSIONS_LIST_PATH,\s*CHAT_POST_PATH,\s*DATA_ANALYTICS_SOURCES_PATH,\s*EMOTION_RECOGNITION_ANALYZE_PATH,\s*\}\s*from '\.\./config/api';"
rep = "import { API_HEALTH_PATH, API_PROJECTS_LIST_PATH, API_SESSIONS_LIST_PATH, CHAT_POST_PATH, DATA_ANALYTICS_SOURCES_PATH, EMOTION_RECOGNITION_ANALYZE_PATH } from '../config/apiOrigin';"
s, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"frontend apiOptimizationService import patch: expected 1 match, got {n}")
p.write_text(s, encoding="utf-8")
PY
echo "patched frontend apiOptimizationService (apiOrigin)"

copy_pair "src/services/ultraAdvancedAIQualityAssuranceSystem.ts" "frontend/src/services/ultraAdvancedAIQualityAssuranceSystem.ts"
sed -i '' \
  "s|import { CHAT_POST_PATH } from '../config/api';|import { CHAT_POST_PATH } from '../config/apiOrigin';|" \
  "frontend/src/services/ultraAdvancedAIQualityAssuranceSystem.ts"
echo "patched frontend ultraAdvancedAIQualityAssuranceSystem (apiOrigin)"

copy_pair "src/services/dialogueAPI.ts" "frontend/src/services/dialogueAPI.ts"
sed -i '' \
  "s|import { resolveApiBaseUrl } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/dialogueAPI.ts"
sed -i '' \
  's/this.baseURL = resolveApiBaseUrl();/this.baseURL = API_ORIGIN;/' \
  "frontend/src/services/dialogueAPI.ts"
echo "patched frontend dialogueAPI (apiOrigin)"

copy_pair "src/services/advancedMessageAPI.ts" "frontend/src/services/advancedMessageAPI.ts"
sed -i '' \
  "s|import { resolveApiBaseUrl, WS_BASE_URL } from '../config/api';|import { API_ORIGIN, WS_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/advancedMessageAPI.ts"
sed -i '' \
  's/const API_BASE_URL = resolveApiBaseUrl();/const API_BASE_URL = API_ORIGIN;/' \
  "frontend/src/services/advancedMessageAPI.ts"
sed -i '' \
  's/WS_BASE_URL/WS_ORIGIN/g' \
  "frontend/src/services/advancedMessageAPI.ts"
echo "patched frontend advancedMessageAPI (apiOrigin)"

copy_pair "src/services/contextualAnalysisService.ts" "frontend/src/services/contextualAnalysisService.ts"
sed -i '' \
  "s|import { API_BASE_URL } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/contextualAnalysisService.ts"
sed -i '' \
  's/API_BASE_URL/API_ORIGIN/g' \
  "frontend/src/services/contextualAnalysisService.ts"
echo "patched frontend contextualAnalysisService (apiOrigin)"

copy_pair "src/services/ultimateResponseService.ts" "frontend/src/services/ultimateResponseService.ts"
sed -i '' \
  "s|import { API_BASE_URL, FALLBACK_API_ORIGIN } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/ultimateResponseService.ts"
sed -i '' \
  's/private baseUrl = API_BASE_URL || FALLBACK_API_ORIGIN;/private baseUrl = API_ORIGIN;/' \
  "frontend/src/services/ultimateResponseService.ts"
echo "patched frontend ultimateResponseService (apiOrigin)"

copy_pair "src/services/messageResponseAPI.ts" "frontend/src/services/messageResponseAPI.ts"
python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/messageResponseAPI.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*API_BASE_URL,\s*CHAT_MESSAGES_PATH,\s*CHAT_ROOMS_PATH,\s*FALLBACK_API_ORIGIN,\s*\}\s*from '\.\./config/api';"
rep = "import { API_ORIGIN, CHAT_MESSAGES_PATH, CHAT_ROOMS_PATH } from '../config/apiOrigin';"
s2, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"messageResponseAPI import patch: expected 1 match, got {n}")
p.write_text(s2, encoding="utf-8")
PY
sed -i '' \
  's/this.baseURL = API_BASE_URL || FALLBACK_API_ORIGIN;/this.baseURL = API_ORIGIN;/' \
  "frontend/src/services/messageResponseAPI.ts"
echo "patched frontend messageResponseAPI (apiOrigin)"

copy_pair "src/services/unifiedMessageAPI.ts" "frontend/src/services/unifiedMessageAPI.ts"
sed -i '' \
  "s|import { resolveApiBaseUrl } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/unifiedMessageAPI.ts"
sed -i '' \
  's/const UNIFIED_MESSAGE_API_BASE = resolveApiBaseUrl();/const UNIFIED_MESSAGE_API_BASE = API_ORIGIN;/' \
  "frontend/src/services/unifiedMessageAPI.ts"
echo "patched frontend unifiedMessageAPI (apiOrigin)"

copy_pair "src/services/enhancedMessageAPI.ts" "frontend/src/services/enhancedMessageAPI.ts"
sed -i '' \
  "s|import { resolveApiBaseUrl } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/enhancedMessageAPI.ts"
sed -i '' \
  's/const ENHANCED_MESSAGE_API_BASE = resolveApiBaseUrl();/const ENHANCED_MESSAGE_API_BASE = API_ORIGIN;/' \
  "frontend/src/services/enhancedMessageAPI.ts"
echo "patched frontend enhancedMessageAPI (apiOrigin)"

copy_pair "src/services/websocket.ts" "frontend/src/services/websocket.ts"
sed -i '' \
  "s|import { WS_BASE_URL } from '../config/api';|import { WS_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/websocket.ts"
sed -i '' \
  's/const WS_API_BASE = WS_BASE_URL.replace/const WS_API_BASE = WS_ORIGIN.replace/' \
  "frontend/src/services/websocket.ts"
echo "patched frontend websocket.ts (WS_ORIGIN)"

copy_pair "src/services/websocketService.ts" "frontend/src/services/websocketService.ts"
sed -i '' \
  "s|import { WS_BASE_URL } from '../config/api';|import { WS_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/websocketService.ts"
sed -i '' \
  's/WS_BASE_URL/WS_ORIGIN/g' \
  "frontend/src/services/websocketService.ts"
echo "patched frontend websocketService (WS_ORIGIN)"

copy_pair "src/services/__tests__/websocketService.test.ts" "frontend/src/services/__tests__/websocketService.test.ts"

copy_pair "src/services/chatSessionService.ts" "frontend/src/services/chatSessionService.ts"
sed -i '' \
  "s|import { resolveApiBaseUrl } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/chatSessionService.ts"
sed -i '' \
  's/private baseUrl = resolveApiBaseUrl();/private baseUrl = API_ORIGIN;/' \
  "frontend/src/services/chatSessionService.ts"
echo "patched frontend chatSessionService (apiOrigin)"

copy_pair "src/services/persistentChatSessionService.ts" "frontend/src/services/persistentChatSessionService.ts"
sed -i '' \
  "s|import { API_BASE_URL, FALLBACK_API_ORIGIN } from '../config/api';|import { API_ORIGIN } from '../config/apiOrigin';|" \
  "frontend/src/services/persistentChatSessionService.ts"
sed -i '' \
  's/backendUrl: API_BASE_URL || FALLBACK_API_ORIGIN/backendUrl: API_ORIGIN/' \
  "frontend/src/services/persistentChatSessionService.ts"
echo "patched frontend persistentChatSessionService (apiOrigin)"

copy_pair "src/store/slices/aiEngineSlice.ts" "frontend/src/store/slices/aiEngineSlice.ts"
copy_pair "src/store/slices/authSlice.ts" "frontend/src/store/slices/authSlice.ts"
copy_pair "src/store/slices/projectsSlice.ts" "frontend/src/store/slices/projectsSlice.ts"

# useAIEngine: 메인과 동일(websocketService 연결·sendMessage)
copy_pair "src/hooks/useAIEngine.ts" "frontend/src/hooks/useAIEngine.ts"
copy_pair "src/hooks/__tests__/useAIEngine.test.ts" "frontend/src/hooks/__tests__/useAIEngine.test.ts"

copy_pair "src/utils/koreanUnderstandingLayer.ts" "frontend/src/utils/koreanUnderstandingLayer.ts"
copy_pair "src/types/index.ts" "frontend/src/types/index.ts"
copy_pair "src/types/chat.ts" "frontend/src/types/chat.ts"
copy_pair "src/utils/chatInputUtils.ts" "frontend/src/utils/chatInputUtils.ts"

# 테스트(메인과 동일 계약 유지; frontend 전용 unifiedAPI.chatMerge 등은 덮어쓰지 않음)
# — `frontend/src/config/__tests__/apiOrigin.chat.test.ts` 는 미러 대상 아님(apiOrigin 전용).
for t in \
  generationPromptBuilder.test.ts \
  intelligentKnowledgeProcessor.test.ts \
  enhancedBackendAPI.test.ts \
  modernChatContextBuilder.test.ts \
  unifiedAPI.test.ts \
  enhancedResponseProcessor.test.ts \
  chatService.test.ts \
  integratedMessageService.test.ts \
  unifiedMessageService.test.ts \
  integratedSystemAPI.test.ts \
  messageResponseAPI.test.ts; do
  copy_pair "src/services/__tests__/${t}" "frontend/src/services/__tests__/${t}"
done

# chatService / integratedMessageService 테스트 mock 은 frontend apiOrigin
sed -i '' \
  "s|jest.mock('../../config/api', () => ({|jest.mock('../../config/apiOrigin', () => ({|" \
  "frontend/src/services/__tests__/chatService.test.ts"
sed -i '' \
  "s|  API_BASE_URL: 'http://test-api',|  API_ORIGIN: 'http://test-api',|" \
  "frontend/src/services/__tests__/chatService.test.ts"
sed -i '' \
  "s|jest.requireActual<typeof import('../../config/api')>('../../config/api')|jest.requireActual<typeof import('../../config/apiOrigin')>('../../config/apiOrigin')|" \
  "frontend/src/services/__tests__/chatService.test.ts"
sed -i '' \
  "s|import { CHAT_POST_PATH } from '../../config/api';|import { CHAT_POST_PATH } from '../../config/apiOrigin';|" \
  "frontend/src/services/__tests__/chatService.test.ts"
python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/__tests__/integratedMessageService.test.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*FALLBACK_API_ORIGIN,\s*FILE_UPLOAD_PATH,\s*FILES_COLLECTION_PATH,\s*GUIDANCE_GENERATE_PATH,\s*INTEGRATED_POST_PATH_ANALYZE,\s*INTEGRATED_POST_PATH_PROJECT,\s*LEARNING_FEEDBACK_PATH,\s*SYSTEMS_STATUS_PATH,\s*\}\s*from '\.\./\.\./config/api';"
rep = """import {
    API_ORIGIN,
    FILE_UPLOAD_PATH,
    FILES_COLLECTION_PATH,
    GUIDANCE_GENERATE_PATH,
    INTEGRATED_POST_PATH_ANALYZE,
    INTEGRATED_POST_PATH_PROJECT,
    LEARNING_FEEDBACK_PATH,
    SYSTEMS_STATUS_PATH,
} from '../../config/apiOrigin';"""
s, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"frontend integratedMessageService.test import: expected 1 match, got {n}")
p.write_text(s.replace("FALLBACK_API_ORIGIN", "API_ORIGIN"), encoding="utf-8")
PY
echo "patched frontend chatService + integratedMessageService tests (apiOrigin)"

python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/__tests__/integratedSystemAPI.test.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*API_BASE_URL,\s*API_HEALTH_PATH,\s*API_PROJECTS_LIST_PATH,\s*COMPREHENSIVE_ANALYSIS_PATH,\s*DATA_ANALYTICS_SOURCES_PATH,\s*EMOTION_RECOGNITION_ANALYZE_PATH,\s*FILES_COLLECTION_PATH,\s*getChatPostUrlsForConfigBase,\s*INTEGRATED_FILE_UPLOAD_PATH,\s*PERFORMANCE_OPTIMIZATION_HEALTH_PATH,\s*PERFORMANCE_OPTIMIZATION_METRICS_PATH,\s*QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH,\s*QUALITY_ASSURANCE_TEST_SUITES_PATH,\s*QUALITY_ASSURANCE_TESTS_PATH,\s*REAL_TIME_METRICS_PATH,\s*SYSTEM_CONFIG_PATH,\s*\}\s*from '\.\./\.\./config/api';"
rep = """import {
  API_HEALTH_PATH,
  API_ORIGIN,
  API_PROJECTS_LIST_PATH,
  COMPREHENSIVE_ANALYSIS_PATH,
  DATA_ANALYTICS_SOURCES_PATH,
  EMOTION_RECOGNITION_ANALYZE_PATH,
  FILES_COLLECTION_PATH,
  getChatPostUrlsForConfigBase,
  INTEGRATED_FILE_UPLOAD_PATH,
  PERFORMANCE_OPTIMIZATION_HEALTH_PATH,
  PERFORMANCE_OPTIMIZATION_METRICS_PATH,
  QUALITY_ASSURANCE_AUTOMATED_EXECUTION_PATH,
  QUALITY_ASSURANCE_TEST_SUITES_PATH,
  QUALITY_ASSURANCE_TESTS_PATH,
  REAL_TIME_METRICS_PATH,
  SYSTEM_CONFIG_PATH,
} from '../../config/apiOrigin';"""
s, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"frontend integratedSystemAPI.test import: expected 1 match, got {n}")
p.write_text(s.replace("getChatPostUrlsForConfigBase(API_BASE_URL)", "getChatPostUrlsForConfigBase(API_ORIGIN)"), encoding="utf-8")
PY
echo "patched frontend integratedSystemAPI.test (apiOrigin)"

python3 <<'PY' || exit 1
import pathlib, re
p = pathlib.Path("frontend/src/services/__tests__/messageResponseAPI.test.ts")
s = p.read_text(encoding="utf-8")
pat = r"import \{\s*CHAT_MESSAGES_PATH,\s*CHAT_ROOMS_PATH,\s*FALLBACK_API_ORIGIN,\s*\}\s*from '\.\./\.\./config/api';"
rep = "import {\n    API_ORIGIN,\n    CHAT_MESSAGES_PATH,\n    CHAT_ROOMS_PATH,\n} from '../../config/apiOrigin';"
s, n = re.subn(pat, rep, s, count=1, flags=re.DOTALL)
if n != 1:
    raise SystemExit(f"messageResponseAPI.test import patch: expected 1 match, got {n}")
p.write_text(s.replace("FALLBACK_API_ORIGIN", "API_ORIGIN"), encoding="utf-8")
PY
echo "patched frontend messageResponseAPI.test (apiOrigin)"

npm run check:test-imports
echo "done sync-frontend-unified-chat"
