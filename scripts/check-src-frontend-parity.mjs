#!/usr/bin/env node
/**
 * src/ ↔ frontend/src/ 이중 트리에서, 젠스파이크·채팅 UX 공용 파일이 바이트 단위로 동일한지 검사합니다.
 * 불일치 시 `npm run sync:frontend-src` 또는 개별 복사로 맞춘 뒤 다시 실행하세요.
 *
 * 사용: (저장소 루트 kakao-frontend/) node scripts/check-src-frontend-parity.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** chatInputUtils·젠스파이크 본문·QA 배지를 쓰는 화면 — 편집 시 목록을 갱신하세요 */
const CRITICAL_RELATIVE = [
  'src/utils/chatInputUtils.ts',
  'src/utils/streamingClient.ts',
  'src/services/errorReportingService.ts',
  'src/utils/errorLogger.ts',
  'src/utils/errorHandler.ts',
  'src/utils/errorMessages.ts',
  'src/utils/apiClient.ts',
  'src/utils/modernChatUrlStyle.ts',
  'src/utils/chatGptComposerPayload.ts',
  'src/config/api.ts',
  'src/config/routes.ts',
  'src/constants/testIds.ts',
  'src/constants/sampleColumnResult.ts',
  'src/utils/rehypeHighlightSearch.ts',
  'src/utils/koreanUnderstandingLayer.ts',
  'src/utils/guidelineQuality.ts',
  'src/utils/toast.ts',
  'src/utils/performanceOptimizer.ts',
  'src/utils/writingExport.ts',
  'src/utils/retryHandler.ts',
  'src/utils/advancedSearchParser.ts',
  'src/styles/GensparkQALayout.css',
  'src/styles/themeColors.ts',
  'src/utils/__tests__/chatInputUtils.test.ts',
  'src/utils/__tests__/modernChatUrlStyle.test.ts',
  'src/utils/__tests__/chatGptComposerPayload.test.ts',
  'src/components/genspark/GensparkGenerationStatus.tsx',
  'src/components/genspark/AssistantGensparkBody.tsx',
  'src/components/genspark/gensparkAnswerMarkdown.tsx',
  'src/components/genspark/GensparkPipelineExtrasPanel.tsx',
  'src/components/genspark/GensparkNextActionChips.tsx',
  'src/components/genspark/index.ts',
  'src/components/Chat/TypingIndicator.tsx',
  'src/components/Chat/StreamingMessage.tsx',
  'src/components/Chat/MessageContent.tsx',
  'src/components/Chat/ChatView.tsx',
  'src/components/Chat/ChatMessage.tsx',
  'src/components/Chat/__tests__/TypingIndicator.test.tsx',
  'src/components/MessageItem.tsx',
  'src/components/MessageItem.css',
  'src/components/MessageActions.tsx',
  'src/components/ChatGPTInterface.tsx',
  'src/components/ChatGPTInterface.css',
  'src/components/Icons/BrainwaveIcons.tsx',
  'src/components/ChatGPTStyleInterface.tsx',
  'src/components/Chat/ChatInterface.tsx',
  'src/components/AI/FileAnalysisChatSystem.tsx',
  'src/components/ChatGPT5CompleteInterface.tsx',
  'src/components/ChatGPT5CompleteInterface.css',
  'src/components/MessageModifyRequestDialog.tsx',
  'src/components/ProjectHub.tsx',
  'src/components/ProjectHub.css',
  'src/components/ProjectShareDialog.tsx',
  'src/components/ProjectShareDialog.css',
  'src/components/ProjectTemplateSelector.tsx',
  'src/components/ProjectTemplateSelector.css',
  'src/components/ProjectEditDialog.tsx',
  'src/components/ConfirmDialog.tsx',
  'src/components/SystemIntegration/SystemIntegrationDashboard.tsx',
  'src/components/AI/AdvancedAIIntelligenceDashboard.tsx',
  'src/components/UI/PerformanceOptimizer.tsx',
  'src/components/IntegratedAIChat.tsx',
  'src/components/SystemStatus.tsx',
  'src/components/QuickActions.tsx',
  'src/components/SystemHealthMonitor.tsx',
  'src/components/CreativeWriting.tsx',
  'src/components/PersuasionContent.tsx',
  'src/components/MarketingContent.tsx',
  'src/components/AdvancedAnalytics.tsx',
  'src/components/AIManagement.tsx',
  'src/components/UltimateChatGPTInterface.tsx',
  'src/components/IntegratedMasterInterface.tsx',
  'src/components/NotebookLLM.tsx',
  'src/components/NotebookLLM.css',
  'src/components/WebResearchModal.tsx',
  'src/components/WebResearchModal.css',
  'src/components/DeepResearchModal.tsx',
  'src/components/DeepResearchModal.css',
  'src/components/LoadingSkeleton.tsx',
  'src/components/LoadingSkeleton.css',
  'src/components/WritingStyleSelector.tsx',
  'src/components/WritingStyleSelector.css',
  'src/components/RealEstateDataPanel.tsx',
  'src/components/RealEstateDataPanel.css',
  'src/services/notebookLLMService.ts',
  'src/services/promptTemplateService.ts',
  'src/services/writingStyleService.ts',
  'src/services/toneService.ts',
  'src/services/domainKnowledgeService.ts',
  'src/services/associationBylawsService.ts',
  'src/services/questionRequirementExpander.ts',
  'src/services/webResearchService.ts',
  'src/services/speechRecognitionService.ts',
  'src/services/userPreferencesUiStorageKeys.ts',
  'src/services/searchHistoryService.ts',
  'src/services/searchHistoryStorageKeys.ts',
  'src/services/searchAnalyticsService.ts',
  'src/services/notebookLLMStreamingService.ts',
  'src/services/notebookLLMDeepLearningIntegration.ts',
  'src/ModernChatInterface.tsx',
  'src/ModernChatInterface.css',
  'src/types/index.ts',
  'src/types/chat.ts',
  'src/components/LazyComponents.tsx',
  'src/components/AdvancedFeaturesPanel.tsx',
  'src/components/AdvancedFeaturesPanel.css',
  'src/components/PredictionChart.tsx',
  'src/components/PredictionChart.css',
  'src/components/LoadingStateIndicator.tsx',
  'src/components/LoadingStateIndicator.css',
  'src/components/ProgressIndicator.tsx',
  'src/components/ProgressIndicator.css',
  'src/components/AdvancedSearchPanel.tsx',
  'src/components/AdvancedSearchPanel.css',
  'src/components/BreadcrumbNavigation.tsx',
  'src/components/BreadcrumbNavigation.css',
  'src/components/ErrorRecovery.tsx',
  'src/components/ErrorRecovery.css',
  'src/components/KeyboardShortcutsHelp.tsx',
  'src/components/KeyboardShortcutsHelp.css',
  'src/components/NotificationCenter.tsx',
  'src/components/NotificationCenter.css',
  'src/components/PerformanceMonitoringDashboard.tsx',
  'src/components/PerformanceMonitoringDashboard.css',
  'src/components/SearchPanel.tsx',
  'src/components/SearchPanel.css',
  'src/components/SessionManager.tsx',
  'src/components/SessionManager.css',
  'src/components/UserSettings.tsx',
  'src/components/UserSettings.css',
  'src/components/WritingAssistant.tsx',
  'src/components/WritingAssistant.css',
  'src/components/LanguageSelector.tsx',
  'src/components/LanguageSelector.css',
  'src/components/ErrorBoundary.tsx',
  'src/components/ErrorBoundary.css',
  'src/components/FileUploadZone.tsx',
  'src/components/FileUploadZone.css',
  'src/components/MessageReply.tsx',
  'src/components/MessageReply.css',
  'src/components/ProjectLLMSettings.tsx',
  'src/components/ProjectLLMSettings.css',
  'src/components/Chat/MessageBubble.tsx',
  'src/services/i18nService.ts',
  'src/services/i18nStorageKeys.ts',
  'src/services/conversationHistoryService.ts',
  'src/services/messageHistoryService.ts',
  'src/services/projectService.ts',
  'src/services/chatGPTProjectService.ts',
  'src/services/projectTemplateService.ts',
  'src/services/integratedSystemAPI.ts',
  'src/services/advancedAIFunctions.ts',
  'src/services/projectShareService.ts',
  'src/services/gensparkAgentRegistry.ts',
  'src/services/advancedAPIService.ts',
  'src/services/advancedConversationMemoryService.ts',
  'src/services/chatSessionStorageKeys.ts',
  'src/services/localLLMStorageKeys.ts',
  'src/services/localLLMService.ts',
  'src/services/advancedWritingEngine.ts',
  'src/services/persistentChatSessionService.ts',
  'src/services/modernChatContextBuilder.ts',
  'src/services/multiLayerStyleAnalysisSystem.ts',
  'src/services/chatService.ts',
  'src/services/unifiedAPI.ts',
  'src/services/unifiedMessageService.ts',
  'src/services/integratedMessageService.ts',
  'src/services/contextualResponseEnhancer.ts',
  'src/services/conversationalAnalysisService.ts',
  'src/hooks/useChatManagement.ts',
  'src/hooks/useOfflineStatus.ts',
  'src/hooks/useKeyboardShortcuts.ts',
  'src/hooks/useDarkMode.ts',
  'src/hooks/useTranslation.ts',
  'src/hooks/useNotifications.ts',
  'src/hooks/useChatEnhancements.ts',
  'src/hooks/useOptimizedMessages.ts',
  'src/hooks/useWebSocket.ts',
  'src/hooks/useLoadingState.ts',
  'src/hooks/useDebounce.ts',
  'src/services/chatGptUiStorageKeys.ts',
  'src/services/conversationHistoryStorageKeys.ts',
  'src/services/messageHistoryStorageKeys.ts',
  'src/services/notebookLLMStorageKeys.ts',
  'src/services/persistentChatSessionStorageKeys.ts',
  'src/services/projectStorageKeys.ts',
  'src/services/enhancedBackendAPI.ts',
  'src/services/enhancedResponseProcessor.ts',
  'src/services/integratedWritingService.ts',
  'src/services/generationPromptBuilder.ts',
  'src/services/gensparkAgenticPrompts.ts',
  'src/services/deepseekReviewPrompts.ts',
  'src/services/chatConversationTurn.ts',
  'src/services/multiStepResponseGenerator.ts',
  'src/services/creativeWritingAIEngine.ts',
  'src/services/advancedWritingCognitiveEngine.ts',
];

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`check-src-frontend-parity — src/ 와 frontend/src/ 핵심 파일 바이트 일치 검사
사용: node scripts/check-src-frontend-parity.mjs`);
  process.exit(0);
}

let failed = false;
const mismatches = [];

for (const rel of CRITICAL_RELATIVE) {
  const a = path.join(ROOT, rel);
  const b = path.join(ROOT, rel.replace(/^src\//, 'frontend/src/'));
  if (!fs.existsSync(a)) {
    console.error(`check-src-frontend-parity: 없음 ${rel}`);
    failed = true;
    continue;
  }
  if (!fs.existsSync(b)) {
    mismatches.push(`${rel} → frontend 미러 없음`);
    failed = true;
    continue;
  }
  const bufA = fs.readFileSync(a);
  const bufB = fs.readFileSync(b);
  if (bufA.length !== bufB.length || !bufA.equals(bufB)) {
    mismatches.push(rel);
    failed = true;
  }
}

if (failed) {
  console.error('check-src-frontend-parity: src 와 frontend/src 가 일치하지 않습니다.');
  if (mismatches.length) {
    console.error(mismatches.map((m) => `  - ${m}`).join('\n'));
  }
  console.error(
    '  해결: npm run sync:frontend-src (전체 미러) 또는 src/Foo → frontend/src/Foo 동일 상대 경로로 복사',
  );
  process.exit(1);
}

console.log(
  `check-src-frontend-parity: OK (${CRITICAL_RELATIVE.length}개 파일 src ↔ frontend/src 동일)`,
);
process.exit(0);
