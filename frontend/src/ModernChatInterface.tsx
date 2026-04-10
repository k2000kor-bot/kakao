import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AdvancedFeaturesPanel,
  PerformanceMonitoringDashboard,
  WritingAssistant,
  UserSettings,
  SearchPanel,
  AdvancedSearchPanel,
  SessionManager,
  NotificationCenter,
  KeyboardShortcutsHelp,
  BreadcrumbNavigation,
} from './components/LazyComponents';
import LanguageSelector from './components/LanguageSelector';
import ErrorBoundary from './components/ErrorBoundary';
import MessageItem from './components/MessageItem';
import { AssistantGensparkBody } from './components/genspark';
import { ASSISTANT_GENSPARK_QA_BADGE_ANSWER } from './utils/chatInputUtils';
import FileUploadZone from './components/FileUploadZone';
import MessageReply from './components/MessageReply';
import messageHistoryService from './services/messageHistoryService';
import errorReportingService from './services/errorReportingService';
import { sendChatMessage, isValidChatResponse } from './utils/apiClient';
import { streamChatMessage, isStreamingSupported } from './utils/streamingClient';
import { getUserFriendlyError, getErrorIcon } from './utils/errorMessages';
import { errorLogger } from './utils/errorLogger';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDarkMode } from './hooks/useDarkMode';
import { useTranslation } from './hooks/useTranslation';
import { useNotifications } from './hooks/useNotifications';
import useChatEnhancements from './hooks/useChatEnhancements';
import { useOptimizedMessages } from './hooks/useOptimizedMessages';
import { advancedWritingEngine } from './services/advancedWritingEngine';
import { localLLMService } from './services/localLLMService';
import { USE_LOCAL_LLM_STORAGE_KEY } from './services/localLLMStorageKeys';
import { MODERN_CHAT_SESSION_ID_STORAGE_KEY } from './services/chatSessionStorageKeys';
import { PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY } from './services/projectStorageKeys';
import ProjectLLMSettings from './components/ProjectLLMSettings';
import NotebookLLM from './components/NotebookLLM';
import { debounce, throttle, batchUpdates } from './utils/performanceOptimizer';
import {
  parsePipelineMessageExtras,
  mergePipelineMessageExtras,
  extractPipelineMessageExtrasFromChatResponse,
  hasPipelineExtras,
  coerceTrimmedString,
  conversationListTitleFromUserMessage,
  cleanResponseText,
  isAssistantGenerationPlaceholder,
  mapStreamMetadataToAssistantPlaceholder,
  scheduleAssistantPreRevealStreamPhases,
  scheduleAssistantNonStreamLoadingPhaseTimers,
  runAssistantNonStreamPostResponsePhases,
  ASSISTANT_PLACEHOLDER_ANALYZING,
} from './utils/chatInputUtils';
import {
  buildModernChatPipelineContext,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
  type ChatPipelineHistoryOptions,
} from './services/modernChatContextBuilder';
import { resolveGensparkAgentIdFromSearchParamsIfEnabled } from './services/gensparkAgentRegistry';
import { parseModernChatUrlStyle } from './utils/modernChatUrlStyle';
import type { Message, ChatMode, AnalysisData, ChatAPIResponse } from './types';
import './ModernChatInterface.css';

// 타입 정의
interface ImageAnalysisResult {
  analysis?: {
    image_info?: { width?: number; height?: number; format?: string };
    object_detection?: { total_objects?: number };
    ocr_results?: { extracted_text?: string };
  };
}

interface PredictionResult {
  prediction?: {
    predicted_activities?: Array<{ activity: string; probability: number }>;
  };
  quality_analysis?: {
    suggestions?: string[];
    overall_score?: number;
    quality_level?: string;
  };
  performance_prediction?: {
    predicted_metrics?: {
      cpu_usage?: number;
      memory_usage?: number;
      response_time_ms?: number;
    };
  };
}

interface SearchResult {
  type: 'message' | 'writing' | 'file' | 'template';
  metadata?: { sessionId?: string };
}

interface AdvancedSearchResult {
  type: 'message' | 'writing' | 'file' | 'template';
  metadata?: { sessionId?: string };
}

const ModernChatInterface: React.FC = () => {
  const [searchParams] = useSearchParams();
  /** URL 쿼리로 파이프라인 에이전트 id — `REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT` 시 생략 (`/agents` 전용 라우트와 구분) */
  const gensparkPipelineOptions = useMemo<ChatPipelineHistoryOptions | undefined>(() => {
    const agentId = resolveGensparkAgentIdFromSearchParamsIfEnabled(searchParams);
    return agentId ? { gensparkRouteAgentId: agentId } : undefined;
  }, [searchParams]);

  const modernChatQueryStyle = useMemo(
    () => parseModernChatUrlStyle(searchParams),
    [searchParams]
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: '안녕하세요! CORBU.AI입니다. 🚀\n저는 고급 감정 분석과 의도 파악 기능을 갖춘 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    }
  ]);

  const MAX_MESSAGES = 50;
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [currentMode, setCurrentMode] = useState<ChatMode>('chat');
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [sessions, setSessions] = useState<Array<{ id: string; name: string; createdAt: string; updatedAt: string; messageCount?: number }>>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showProjectLLMSettings, setShowProjectLLMSettings] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string>('default-project');
  const [useLocalLLM, setUseLocalLLM] = useState(false);

  /** 스트리밍/비스트리밍 핸들러에서 최신 대화 목록으로 통합 context 생성 */
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 다크 모드
  const darkMode = useDarkMode();

  // 번역
  const { t } = useTranslation();

  // 알림
  const {
    notifications,
    addNotification,
    markAsRead,
    dismiss,
    clearAll,
    requestPermission,
  } = useNotifications();

  // 대화 경험 향상 훅
  const chatEnhancements = useChatEnhancements({
    enableSmartSuggestions: true,
    enableRealTimeSync: true,
    enableTypingIndicators: true,
    enableReadReceipts: true,
    enableReactions: true,
    enableQuickReplies: true,
  });

  // 성능 최적화된 메시지 관리 (메시지 가상화)
  const {
    messages: optimizedMessages,
    containerRef: messagesContainerRef,
    virtualizedInfo,
    shouldVirtualize,
  } = useOptimizedMessages({
    messages,
    maxVisible: MAX_MESSAGES,
    enableVirtualization: true,
    threshold: 30,
  });

  // 브라우저 알림 권한 요청
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem(MODERN_CHAT_SESSION_ID_STORAGE_KEY);
    return saved || 'session-' + Math.random().toString(36).substring(2, 15);
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 세션 관리 함수들
  const handleSessionSelect = useCallback((selectedSessionId: string) => {
    setSessionId(selectedSessionId);
    setShowSessionManager(false);
    // 세션 변경 시 메시지 로드
    const savedMessages = messageHistoryService.getSessionMessages(selectedSessionId);
    if (savedMessages.length > 0) {
      setMessages(savedMessages.map((msg): Message => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp || new Date().toLocaleTimeString(),
        analysis: (msg.metadata?.analysis as AnalysisData) ?? null,
        isLiked: msg.isLiked,
        isDisliked: msg.isDisliked,
        isBookmarked: msg.isBookmarked,
      })));
    } else {
      setMessages([{
        id: 1,
        sender: 'ai',
        text: '안녕하세요! CORBU.AI입니다. 🚀\n저는 고급 감정 분석과 의도 파악 기능을 갖춘 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
        timestamp: new Date().toLocaleTimeString(),
        analysis: null
      }]);
    }
  }, []);

  const handleSessionCreate = useCallback((name?: string) => {
    const newSessionId = 'session-' + Math.random().toString(36).substring(2, 15);
    const newSession = {
      id: newSessionId,
      name: name || `세션 ${sessions.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    setSessions(prev => [...prev, newSession]);
    handleSessionSelect(newSessionId);
    localStorage.setItem(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY, JSON.stringify([...sessions, newSession]));
  }, [sessions, handleSessionSelect]);

  const handleSessionRename = useCallback((sessionIdToRename: string, newName: string) => {
    setSessions((prev) => {
      const updatedSessions = prev.map((s) =>
        s.id === sessionIdToRename ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
      );
      localStorage.setItem(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
      return updatedSessions;
    });
  }, []);

  const handleSessionDelete = useCallback((sessionIdToDelete: string) => {
    setSessions((prev) => {
      const updatedSessions = prev.filter((s) => s.id !== sessionIdToDelete);
      localStorage.setItem(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));

      // 메시지 히스토리에서 세션 삭제
      messageHistoryService.deleteSession(sessionIdToDelete);

      if (sessionId === sessionIdToDelete && updatedSessions.length > 0) {
        handleSessionSelect(updatedSessions[0].id);
      } else if (updatedSessions.length === 0) {
        const newSessionId = 'session-' + Math.random().toString(36).substring(2, 15);
        setSessionId(newSessionId);
        setMessages([{
          id: 1,
          sender: 'ai',
          text: '안녕하세요! CORBU.AI입니다. 🚀\n저는 고급 감정 분석과 의도 파악 기능을 갖춘 AI 어시스턴트입니다.\n무엇을 도와드릴까요?',
          timestamp: new Date().toLocaleTimeString(),
          analysis: null
        }]);
      }

      return updatedSessions;
    });
  }, [sessionId, handleSessionSelect]);

  // 세션 목록 로드
  useEffect(() => {
    const savedSessions = localStorage.getItem(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY);
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
      } catch (e) {
        errorLogger.error('Failed to parse saved sessions', e instanceof Error ? e : new Error(String(e)), {
          component: 'ModernChatInterface',
          action: 'loadSessions',
        });
      }
    } else {
      // 기본 세션 생성
      const defaultSession = {
        id: sessionId,
        name: '새 대화',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };
      setSessions([defaultSession]);
      localStorage.setItem(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY, JSON.stringify([defaultSession]));
    }
  }, [sessionId]);

  // 세션 메시지 수 업데이트 (메모이제이션된 메시지 길이 사용)
  const messagesLength = useMemo(() => messages.length, [messages.length]);
  useEffect(() => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, messageCount: messagesLength, updatedAt: new Date().toISOString() };
      }
      return s;
    }));
  }, [messagesLength, sessionId]);

  // 로컬 LLM 사용 설정 저장
  useEffect(() => {
    localStorage.setItem(USE_LOCAL_LLM_STORAGE_KEY, String(useLocalLLM));
  }, [useLocalLLM]);

  // 프로젝트 ID를 세션 ID와 동기화
  useEffect(() => {
    setCurrentProjectId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem(MODERN_CHAT_SESSION_ID_STORAGE_KEY, sessionId);
    // 세션 변경 시 저장된 메시지 로드
    const savedMessages = messageHistoryService.getSessionMessages(sessionId);
    if (savedMessages.length > 0) {
      setMessages(savedMessages.map((msg): Message => {
        const rawPe = msg.metadata?.pipelineExtras;
        const pipelineExtras =
          rawPe != null && typeof rawPe === 'object' && !Array.isArray(rawPe)
            ? (rawPe as Message['pipelineExtras'])
            : undefined;
        return {
          id: msg.id,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp,
          analysis: (msg.metadata?.analysis as AnalysisData) ?? null,
          isLiked: msg.isLiked,
          isDisliked: msg.isDisliked,
          isBookmarked: msg.isBookmarked,
          pipelineExtras,
        };
      }));
    }
  }, [sessionId]);

  // 메시지 변경 시 자동 저장 (고급 디바운스 및 배치 처리)
  const debouncedSaveMessages = useMemo(
    () => debounce((messagesToSave: Message[], currentSessionId: string) => {
      // 배치 처리로 성능 최적화
      const savePromises = messagesToSave.map(message =>
        messageHistoryService.saveMessage({
          id: message.id,
          sender: message.sender,
          text: message.text,
          timestamp: message.timestamp,
          sessionId: currentSessionId,
          isLiked: message.isLiked,
          isDisliked: message.isDisliked,
          isBookmarked: message.isBookmarked,
          metadata: {
            analysis: message.analysis,
            ...(message.pipelineExtras && hasPipelineExtras(message.pipelineExtras)
              ? { pipelineExtras: message.pipelineExtras }
              : {}),
          },
        })
      );
      // 병렬 처리로 저장 속도 향상
      Promise.all(savePromises).catch(error => {
        errorLogger.error('메시지 저장 오류', error instanceof Error ? error : new Error(String(error)), {
          component: 'ModernChatInterface',
          action: 'saveMessages',
          sessionId: currentSessionId,
        });
        errorReportingService.reportError(error as Error, {
          severity: 'medium',
          additionalContext: {
            component: 'ModernChatInterface',
            action: 'saveMessages',
            sessionId: currentSessionId,
            messageCount: messagesToSave.length,
          },
        });
      });
    }, 500),
    []
  );

  useEffect(() => {
    if (messages.length > 0) {
      debouncedSaveMessages(messages, sessionId); // 500ms 디바운스

      return () => {
        debouncedSaveMessages.cancel();
      };
    }
  }, [messages, sessionId, debouncedSaveMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 성능 최적화된 스크롤 (스로틀링)
  const throttledScrollToBottom = useMemo(
    () => throttle(scrollToBottom, 100),
    [scrollToBottom]
  );

  useEffect(() => {
    // 메시지가 추가될 때만 스크롤 (가상화 고려)
    if (!shouldVirtualize || virtualizedInfo.endIndex === messages.length - 1) {
      throttledScrollToBottom();
    }
  }, [messages.length, throttledScrollToBottom, shouldVirtualize, virtualizedInfo]);

  // 메시지 추가 헬퍼 함수
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const newMessages = [...prev, message];
      return newMessages.length > MAX_MESSAGES
        ? newMessages.slice(-MAX_MESSAGES)
        : newMessages;
    });
  }, []);

  // 메시지 업데이트 헬퍼 함수
  const updateMessage = useCallback((messageId: number, updater: (msg: Message) => Message) => {
    setMessages(prev => prev.map(m => m.id === messageId ? updater(m) : m));
  }, []);

  // 에러 메시지 생성 헬퍼 함수
  const createErrorMessage = useCallback((error: unknown, canRetry = false): Message => {
    const errorInfo = getUserFriendlyError(error);
    const errorSuggestions = errorInfo.suggestions.map(s => `• ${s}`).join('\n');
    const retryMessage = canRetry ? '\n\n🔄 재시도 버튼을 클릭하여 다시 시도할 수 있습니다.' : '';
    const errorText = `${getErrorIcon(errorInfo.type)} ${errorInfo.userMessage}\n\n${errorSuggestions}${retryMessage}`;

    return {
      id: Date.now() + 1,
      sender: 'ai',
      text: errorText,
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    };
  }, []);

  // 고급 글생성 모드 확인 (메모이제이션)
  const isWritingMode = useMemo(() => currentMode === 'writing', [currentMode]);

  // 스트리밍 응답 처리 (성능 최적화)
  const handleStreamingResponse = useCallback(async (message: string, aiMessageId: number) => {
    const unifiedCtx = buildModernChatPipelineContext(
      message,
      messagesRef.current,
      gensparkPipelineOptions
    );
    const streamScenarioMerge = scenarioInheritMergeOptionsFromPipelineLikeMessages(
      messagesRef.current
    );
    const streamRequestBody: Record<string, unknown> = {};
    if (unifiedCtx) {
      streamRequestBody.context = unifiedCtx;
    }
    if (modernChatQueryStyle.response_style != null) {
      streamRequestBody.response_style = modernChatQueryStyle.response_style;
    }
    if (modernChatQueryStyle.perspective != null) {
      streamRequestBody.perspective = modernChatQueryStyle.perspective;
    }
    const streamExtra =
      Object.keys(streamRequestBody).length > 0 ? { requestBody: streamRequestBody } : {};
    let clearModernStreamPhases: (() => void) | undefined;
    try {
      // 글쓰기 모드인 경우 고급 엔진 사용
      if (isWritingMode) {
        const context = {
          topic: message,
          audience: '일반 독자',
          purpose: '정보 제공 및 가치 전달',
          tone: 'professional' as const,
          style: 'detailed' as const,
          keywords: message.split(/\s+/).filter(Boolean),
        };

        let accumulatedText = '';
        const writingStreamReducedMotion =
          typeof window !== 'undefined' &&
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
        const writingPreRevealActiveRef = { current: true };
        clearModernStreamPhases = scheduleAssistantPreRevealStreamPhases({
          reducedMotion: writingStreamReducedMotion,
          setPlaceholder: (text) => {
            updateMessage(aiMessageId, (m) => {
              if (!writingPreRevealActiveRef.current) return m;
              if (!isAssistantGenerationPlaceholder(m.text)) return m;
              return { ...m, text };
            });
          },
          onReveal: () => {
            writingPreRevealActiveRef.current = false;
            batchUpdates([
              () =>
                updateMessage(aiMessageId, (m) => ({
                  ...m,
                  text: cleanResponseText(accumulatedText),
                })),
            ]);
          },
        });

        const prompt = advancedWritingEngine.generateAdvancedPrompt(context);

        try {
        await streamChatMessage(prompt.userPrompt, sessionId, {
          ...streamExtra,
          ...(streamScenarioMerge?.recentMessagesForScenarioInherit
            ? { messagesForScenarioInherit: streamScenarioMerge.recentMessagesForScenarioInherit }
            : {}),
          onChunk: (chunk: string) => {
            accumulatedText += chunk;
            if (writingPreRevealActiveRef.current) {
              return;
            }
            const trimmedAcc = coerceTrimmedString(cleanResponseText(accumulatedText), '');
            if (!trimmedAcc.length) {
              return;
            }
            batchUpdates([
              () => updateMessage(aiMessageId, (m) => ({ ...m, text: accumulatedText })),
            ]);
          },
          onMetadata: (meta: Record<string, unknown>) => {
            const ph = mapStreamMetadataToAssistantPlaceholder(meta);
            if (!ph) return;
            updateMessage(aiMessageId, (m) => {
              if (!isAssistantGenerationPlaceholder(m.text)) return m;
              if (m.text === ph) return m;
              return { ...m, text: ph };
            });
          },
          onComplete: (fullText: string, metadata?: Record<string, unknown>) => {
            clearModernStreamPhases?.();
            clearModernStreamPhases = undefined;
            writingPreRevealActiveRef.current = false;
            // 스트리밍 완료 후 품질 향상 (비동기 처리)
            (async () => {
              try {
                const enhanced = advancedWritingEngine.analyzeAndEnhance(fullText, context);
                setIsStreaming(false);
                setStreamingMessageId(null);
                updateMessage(aiMessageId, (m) => ({
                  ...m,
                  text: enhanced.content,
                  pipelineExtras: mergePipelineMessageExtras(
                    parsePipelineMessageExtras(metadata),
                    m.pipelineExtras ?? {}
                  ),
                }));
                addNotification({
                  type: 'success',
                  title: '고품질 글 생성 완료',
                  message: `품질 점수 ${(enhanced.quality * 100).toFixed(0)}%의 최적화된 글을 생성했습니다.`,
                });
              } catch (error) {
                // 향상 실패 시 원본 사용
                const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                errorLogger.error('글 향상 오류', error instanceof Error ? error : new Error(errorMessage), {
                  component: 'ModernChatInterface',
                  action: 'enhanceWriting',
                });
                setIsStreaming(false);
                setStreamingMessageId(null);
                updateMessage(aiMessageId, (m) => ({
                  ...m,
                  text: fullText,
                  pipelineExtras: mergePipelineMessageExtras(
                    parsePipelineMessageExtras(metadata),
                    m.pipelineExtras ?? {}
                  ),
                }));
                addNotification({
                  type: 'success',
                  title: '글 생성 완료',
                  message: 'AI가 글을 생성했습니다.',
                });
              }
            })();
          },
          onError: (error: Error) => {
            clearModernStreamPhases?.();
            clearModernStreamPhases = undefined;
            writingPreRevealActiveRef.current = false;
            setIsStreaming(false);
            setStreamingMessageId(null);
            const errorMessage = createErrorMessage(error);
            updateMessage(aiMessageId, () => errorMessage);
            addNotification({
              type: 'error',
              title: '스트리밍 오류',
              message: getUserFriendlyError(error).userMessage,
            });
          },
        });
        } catch {
          // streamChatMessage는 실패 시 onError 후 reject
        }
      } else {
        // 로컬 LLM 사용 여부 확인
        const useLocalLLMForStreaming = useLocalLLM && localLLMService.getProjectLLM(currentProjectId);

        if (useLocalLLMForStreaming) {
          // 로컬 LLM 스트리밍 — NotebookLLM과 동일 5단계 타이머(움직임 축소 시 생략)
          let accumulatedText = '';
          const localStreamReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
          const localPreRevealActiveRef = { current: true };
          clearModernStreamPhases = scheduleAssistantPreRevealStreamPhases({
            reducedMotion: localStreamReducedMotion,
            setPlaceholder: (text) => {
              updateMessage(aiMessageId, (m) => {
                if (!localPreRevealActiveRef.current) return m;
                if (!isAssistantGenerationPlaceholder(m.text)) return m;
                return { ...m, text };
              });
            },
            onReveal: () => {
              localPreRevealActiveRef.current = false;
              batchUpdates([
                () =>
                  updateMessage(aiMessageId, (m) => ({
                    ...m,
                    text: cleanResponseText(accumulatedText),
                  })),
              ]);
            },
          });
          const throttledLocalAccumulated = throttle(() => {
            updateMessage(aiMessageId, (m) => ({ ...m, text: accumulatedText }));
          }, 50);
          try {
            await localLLMService.sendProjectRequest(
              currentProjectId,
              [
                { role: 'system', content: '당신은 도움이 되는 AI 어시스턴트입니다.' },
                { role: 'user', content: message },
              ],
              (chunk: string) => {
                accumulatedText += chunk;
                if (localPreRevealActiveRef.current) {
                  return;
                }
                const trimmedAcc = coerceTrimmedString(cleanResponseText(accumulatedText), '');
                if (!trimmedAcc.length) {
                  return;
                }
                throttledLocalAccumulated();
                if (Math.random() < 0.1) {
                  throttledScrollToBottom();
                }
              }
            );

            clearModernStreamPhases?.();
            clearModernStreamPhases = undefined;
            localPreRevealActiveRef.current = false;
            setIsStreaming(false);
            setStreamingMessageId(null);
            updateMessage(aiMessageId, (m) => ({ ...m, text: accumulatedText }));
            throttledScrollToBottom();
            addNotification({
              type: 'success',
              title: '응답 생성 완료',
              message: '로컬 LLM이 응답을 생성했습니다.',
            });
          } catch (error) {
            clearModernStreamPhases?.();
            clearModernStreamPhases = undefined;
            localPreRevealActiveRef.current = false;
            setIsStreaming(false);
            setStreamingMessageId(null);
            const errorMessage = createErrorMessage(error);
            updateMessage(aiMessageId, () => errorMessage);
            addNotification({
              type: 'error',
              title: '로컬 LLM 오류',
              message: getUserFriendlyError(error).userMessage,
            });
          }
        } else {
          // 일반 대화 모드 — 5단계 순차 문구 후 본문 스트리밍(움직임 축소 시 생략)
          let accumulatedText = '';
          const throttledSetAccumulated = throttle(() => {
            updateMessage(aiMessageId, (m) => ({ ...m, text: accumulatedText }));
          }, 50);
          const modernStreamReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
          const modernPreRevealActiveRef = { current: true };
          clearModernStreamPhases = scheduleAssistantPreRevealStreamPhases({
            reducedMotion: modernStreamReducedMotion,
            setPlaceholder: (text) => {
              updateMessage(aiMessageId, (m) => {
                if (!modernPreRevealActiveRef.current) return m;
                if (!isAssistantGenerationPlaceholder(m.text)) return m;
                return { ...m, text };
              });
            },
            onReveal: () => {
              modernPreRevealActiveRef.current = false;
              batchUpdates([
                () =>
                  updateMessage(aiMessageId, (m) => ({
                    ...m,
                    text: cleanResponseText(accumulatedText),
                  })),
              ]);
            },
          });

          try {
            await streamChatMessage(message, sessionId, {
              ...streamExtra,
              ...(streamScenarioMerge?.recentMessagesForScenarioInherit
                ? { messagesForScenarioInherit: streamScenarioMerge.recentMessagesForScenarioInherit }
                : {}),
              onChunk: (chunk: string) => {
                accumulatedText += chunk;
                if (modernPreRevealActiveRef.current) {
                  return;
                }
                const trimmedAcc = coerceTrimmedString(cleanResponseText(accumulatedText), '');
                if (!trimmedAcc.length) {
                  return;
                }
                throttledSetAccumulated();
                if (Math.random() < 0.1) {
                  throttledScrollToBottom();
                }
              },
              onMetadata: (meta: Record<string, unknown>) => {
                const ph = mapStreamMetadataToAssistantPlaceholder(meta);
                if (!ph) return;
                updateMessage(aiMessageId, (m) => {
                  if (!isAssistantGenerationPlaceholder(m.text)) return m;
                  if (m.text === ph) return m;
                  return { ...m, text: ph };
                });
              },
              onComplete: (fullText: string, metadata?: Record<string, unknown>) => {
                clearModernStreamPhases?.();
                clearModernStreamPhases = undefined;
                modernPreRevealActiveRef.current = false;
                setIsStreaming(false);
                setStreamingMessageId(null);
                updateMessage(aiMessageId, (m) => ({
                  ...m,
                  text: fullText,
                  pipelineExtras: mergePipelineMessageExtras(
                    parsePipelineMessageExtras(metadata),
                    m.pipelineExtras ?? {}
                  ),
                }));
                throttledScrollToBottom();
                addNotification({
                  type: 'success',
                  title: '응답 생성 완료',
                  message: 'AI가 응답을 생성했습니다.',
                });
              },
              onError: (error: Error) => {
                clearModernStreamPhases?.();
                clearModernStreamPhases = undefined;
                modernPreRevealActiveRef.current = false;
                setIsStreaming(false);
                setStreamingMessageId(null);
                const errorMessage = createErrorMessage(error);
                updateMessage(aiMessageId, () => errorMessage);
                addNotification({
                  type: 'error',
                  title: '스트리밍 오류',
                  message: getUserFriendlyError(error).userMessage,
                });
              },
            });
          } catch {
            // streamChatMessage는 실패 시 onError 후 reject — UI는 onError에서 처리
          }
        }
      }
    } catch (error) {
      clearModernStreamPhases?.();
      clearModernStreamPhases = undefined;
      setIsStreaming(false);
      setStreamingMessageId(null);
      const errorMessage = createErrorMessage(error);
      updateMessage(aiMessageId, () => errorMessage);
    }
  }, [
    sessionId,
    updateMessage,
    throttledScrollToBottom,
    addNotification,
    createErrorMessage,
    isWritingMode,
    useLocalLLM,
    currentProjectId,
    gensparkPipelineOptions,
    modernChatQueryStyle,
  ]);

  // 재시도 핸들러 (sendMessage와 분리하여 순환 참조 방지)
  const handleRetry = useCallback((message: string) => {
    setInputText(message);
    // sendMessage는 inputText 변경 후 자동으로 호출되도록 하거나
    // 별도의 재시도 로직 구현
  }, []);

  // 일반 응답 처리 (로컬 LLM 지원) — `aiPlaceholderId` 메시지를 단계 문구 후 최종 응답으로 갱신
  const handleRegularResponse = useCallback(async (message: string, aiPlaceholderId: number) => {
    setIsTyping(true);
    let clearNonStreamPhases = scheduleAssistantNonStreamLoadingPhaseTimers((text) => {
      updateMessage(aiPlaceholderId, (m) => ({ ...m, text }));
    });

    const unifiedCtx = buildModernChatPipelineContext(
      message,
      messagesRef.current,
      gensparkPipelineOptions
    );
    const mergeScenarioOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(
      messagesRef.current
    );
    const hasQueryStyle =
      modernChatQueryStyle.response_style != null || modernChatQueryStyle.perspective != null;
    const chatOpts =
      unifiedCtx != null || mergeScenarioOpts != null || hasQueryStyle
        ? {
            ...(unifiedCtx != null ? { context: unifiedCtx } : {}),
            ...(mergeScenarioOpts != null ? { mergeApiChatContextOptions: mergeScenarioOpts } : {}),
            ...(modernChatQueryStyle.response_style != null
              ? { response_style: modernChatQueryStyle.response_style }
              : {}),
            ...(modernChatQueryStyle.perspective != null
              ? { perspective: modernChatQueryStyle.perspective }
              : {}),
          }
        : undefined;

    try {
      let data: ChatAPIResponse;

      // 로컬 LLM 사용 여부 확인
      if (useLocalLLM) {
        const projectConfig = localLLMService.getProjectLLM(currentProjectId);
        if (projectConfig) {
          // 로컬 LLM으로 요청
          const response = await localLLMService.sendProjectRequest(
            currentProjectId,
            [
              { role: 'system', content: '당신은 도움이 되는 AI 어시스턴트입니다.' },
              { role: 'user', content: message },
            ]
          );

          data = {
            success: true,
            response: response.content,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
          };
        } else {
          // 프로젝트 설정이 없으면 일반 API 사용
          data = await sendChatMessage(message, sessionId, chatOpts);
        }
      } else {
        data = await sendChatMessage(message, sessionId, chatOpts);
      }

      setIsTyping(false);

      if (!isValidChatResponse(data)) {
        throw new Error('Invalid API response format');
      }

      if (data.success && data.response) {
        clearNonStreamPhases();
        clearNonStreamPhases = () => {};
        const pipelineExtrasRaw = extractPipelineMessageExtrasFromChatResponse(data);
        const analysis =
          data.emotion_analysis && data.intent_analysis
            ? {
                emotion_analysis: data.emotion_analysis,
                intent_analysis: data.intent_analysis,
                success: true,
                response: data.response,
                response_time: data.response_time || 0,
                session_id: data.session_id || sessionId,
                timestamp: data.timestamp || new Date().toISOString(),
                type: data.type || 'chat',
              }
            : null;

        await runAssistantNonStreamPostResponsePhases((text) => {
          updateMessage(aiPlaceholderId, (m) => ({ ...m, text }));
        });
        updateMessage(aiPlaceholderId, (m) => ({
          ...m,
          text: data.response as string,
          timestamp: new Date().toLocaleTimeString(),
          analysis,
          ...(hasPipelineExtras(pipelineExtrasRaw) ? { pipelineExtras: pipelineExtrasRaw } : {}),
        }));
        addNotification({
          type: 'success',
          title: '응답 생성 완료',
          message: 'AI가 응답을 생성했습니다.',
        });
      } else {
        clearNonStreamPhases();
        clearNonStreamPhases = () => {};
        const errorObj = new Error(data.error || '알 수 없는 오류가 발생했습니다.');
        errorReportingService.reportError(errorObj, {
          severity: 'medium',
          additionalContext: { apiResponse: data, sessionId },
        });

        const errMsg = createErrorMessage(errorObj);
        updateMessage(aiPlaceholderId, (m) => ({
          ...m,
          text: errMsg.text,
          timestamp: errMsg.timestamp,
          analysis: errMsg.analysis,
        }));
        addNotification({
          type: 'error',
          title: '응답 생성 실패',
          message: getUserFriendlyError(errorObj).userMessage,
        });
      }
    } catch (error) {
      clearNonStreamPhases();
      clearNonStreamPhases = () => {};
      setIsTyping(false);
      setIsStreaming(false);
      setStreamingMessageId(null);

      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorReportingService.reportError(errorObj, {
        severity: 'high',
        additionalContext: { action: 'sendMessage', sessionId, message },
      });

      const errMsg = createErrorMessage(error, true);
      updateMessage(aiPlaceholderId, (m) => ({
        ...m,
        text: errMsg.text,
        timestamp: errMsg.timestamp,
        analysis: errMsg.analysis,
      }));
      const errorInfo = getUserFriendlyError(error);
      addNotification({
        type: 'error',
        title: '전송 실패',
        message: errorInfo.userMessage,
        action: errorInfo.canRetry ? {
          label: '재시도',
          onClick: () => handleRetry(message),
        } : undefined,
      });
    }
  }, [
    sessionId,
    addNotification,
    createErrorMessage,
    handleRetry,
    useLocalLLM,
    currentProjectId,
    gensparkPipelineOptions,
    updateMessage,
    modernChatQueryStyle,
  ]);

  const startNewChat = useCallback(() => {
    const newSessionId = 'session-' + Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);
    setMessages([{
      id: 1,
      sender: 'ai',
      text: '새로운 대화를 시작합니다! 무엇을 도와드릴까요?',
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    }]);
  }, []);

  // 키보드 단축키 설정
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      action: () => {
        startNewChat();
      },
      description: '새 대화 시작',
    },
    {
      key: 'k',
      ctrl: true,
      action: () => {
        setShowSearch(true);
      },
      description: '검색 열기',
    },
    {
      key: 'l',
      ctrl: true,
      action: () => {
        textareaRef.current?.focus();
      },
      description: '입력창 포커스',
    },
    {
      key: ',',
      ctrl: true,
      action: () => {
        setShowSettings(true);
      },
      description: '설정 열기',
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        setShowShortcutsHelp(true);
      },
      description: '단축키 도움말',
    },
    {
      key: 'k',
      ctrl: true,
      shift: true,
      action: () => {
        setShowAdvancedSearch(true);
      },
      description: '고급 검색 열기',
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        setShowAdvancedSearch(true);
      },
      description: '고급 검색 열기',
    },
    {
      key: 'm',
      ctrl: true,
      action: () => {
        setCurrentMode('monitoring');
      },
      description: '성능 모니터링 열기',
    },
    {
      key: 'w',
      ctrl: true,
      action: () => {
        setCurrentMode('writing');
      },
      description: '글쓰기 모드 열기',
    },
    {
      key: '1',
      ctrl: true,
      action: () => {
        setCurrentMode('chat');
      },
      description: '일반 대화 모드',
    },
    {
      key: '2',
      ctrl: true,
      action: () => {
        setCurrentMode('coding');
      },
      description: '코딩 파트너 모드',
    },
    {
      key: '3',
      ctrl: true,
      action: () => {
        setCurrentMode('analysis');
      },
      description: '분석 모드',
    },
    {
      key: '4',
      ctrl: true,
      action: () => {
        setCurrentMode('notebook');
      },
      description: '노트북 LLM 모드',
    },
  ]);

  // 메시지 액션 핸들러들 (메모이제이션)
  const handleCopyMessage = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    addNotification({
      type: 'success',
      title: '복사 완료',
      message: '메시지가 클립보드에 복사되었습니다.',
    });
  }, [addNotification]);

  const handleRegenerateMessage = useCallback((id: number) => {
    const messageToRegenerate = messages.find(m => m.id === id);
    if (messageToRegenerate) {
      setInputText(messageToRegenerate.text);
      addNotification({
        type: 'info',
        title: '재생성 준비',
        message: '메시지를 입력창에 불러왔습니다. 수정 후 전송하세요.',
      });
    }
  }, [messages, addNotification]);

  const handleLikeMessage = useCallback((id: number) => {
    setMessages(prev => prev.map(m =>
      m.id === id
        ? { ...m, isLiked: !m.isLiked, isDisliked: false }
        : m
    ));
  }, []);

  const handleDislikeMessage = useCallback((id: number) => {
    setMessages(prev => prev.map(m =>
      m.id === id
        ? { ...m, isDisliked: !m.isDisliked, isLiked: false }
        : m
    ));
  }, []);

  const handleBookmarkMessage = useCallback((id: number) => {
    const isBookmarked = messageHistoryService.toggleBookmark(id, sessionId);
    setMessages(prev => prev.map(m =>
      m.id === id
        ? { ...m, isBookmarked }
        : m
    ));
    addNotification({
      type: isBookmarked ? 'success' : 'info',
      title: isBookmarked ? '즐겨찾기 추가' : '즐겨찾기 제거',
      message: isBookmarked
        ? '메시지가 즐겨찾기에 추가되었습니다.'
        : '메시지가 즐겨찾기에서 제거되었습니다.',
    });
  }, [sessionId, addNotification]);

  const handleEditMessage = useCallback((id: number, newText: string) => {
    setMessages(prev => prev.map(m =>
      m.id === id
        ? { ...m, text: newText }
        : m
    ));

    // 메시지 히스토리 업데이트
    const message = messages.find(m => m.id === id);
    if (message) {
      messageHistoryService.saveMessage({
        id: message.id,
        sender: message.sender,
        text: newText,
        timestamp: message.timestamp,
        sessionId: sessionId,
        isLiked: message.isLiked,
        isDisliked: message.isDisliked,
        isBookmarked: message.isBookmarked,
        metadata: {
          analysis: message.analysis,
          ...(message.pipelineExtras && hasPipelineExtras(message.pipelineExtras)
            ? { pipelineExtras: message.pipelineExtras }
            : {}),
        },
      });
    }

    addNotification({
      type: 'success',
      title: '메시지 수정 완료',
      message: '메시지가 수정되었습니다.',
    });
  }, [messages, sessionId, addNotification]);

  const handleReplyToMessage = useCallback((id: number) => {
    const messageToReply = messages.find(m => m.id === id);
    if (messageToReply) {
      setReplyingTo(messageToReply);
      textareaRef.current?.focus();
    }
  }, [messages]);


  // 스트리밍 지원 여부 확인 (메모이제이션)
  const isStreamingEnabled = useMemo(() => isStreamingSupported(), []);

  const sendMessage = useCallback(async (overrideText?: string) => {
    let message = coerceTrimmedString(overrideText, inputText);
    if (message === '') return;

    // 답장 중인 경우 인용 메시지 추가
    if (replyingTo) {
      message = `> ${replyingTo.text.replaceAll('\n', '\n> ')}\n\n${message}`;
      setReplyingTo(null);
    }

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    };

    const isFirstUserTurn = messagesRef.current.filter((m) => m.sender === 'user').length === 0;

    addMessage(userMessage);
    setInputText('');

    if (isFirstUserTurn) {
      const listTitle = conversationListTitleFromUserMessage(message);
      if (listTitle !== '새 대화') {
        setSessions((prev) => {
          const cur = prev.find((s) => s.id === sessionId);
          if (!cur) return prev;
          const generic =
            cur.name === '새 대화' || /^세션\s+\d+$/u.test(coerceTrimmedString(cur.name, ''));
          if (!generic) return prev;
          const next = prev.map((s) =>
            s.id === sessionId ? { ...s, name: listTitle, updatedAt: new Date().toISOString() } : s,
          );
          try {
            localStorage.setItem(PROJECT_CHAT_STRUCTURE_SESSIONS_STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* ignore quota */
          }
          return next;
        });
      }
    }

    if (isStreamingEnabled) {
      setIsStreaming(true);
      const aiMessageId = Date.now() + 1;
      setStreamingMessageId(aiMessageId);

      const aiMessage: Message = {
        id: aiMessageId,
        sender: 'ai',
        text: ASSISTANT_PLACEHOLDER_ANALYZING,
        timestamp: new Date().toLocaleTimeString(),
        analysis: null
      };

      addMessage(aiMessage);
      await handleStreamingResponse(message, aiMessageId);
    } else {
      const aiPlaceholderId = Date.now() + 1;
      addMessage({
        id: aiPlaceholderId,
        sender: 'ai',
        text: ASSISTANT_PLACEHOLDER_ANALYZING,
        timestamp: new Date().toLocaleTimeString(),
        analysis: null,
      });
      await handleRegularResponse(message, aiPlaceholderId);
    }
  }, [inputText, replyingTo, addMessage, handleStreamingResponse, handleRegularResponse, isStreamingEnabled, sessionId]);

  const sendQuickMessage = useCallback((message: string) => {
    setInputText(message);
    void sendMessage(message);
  }, [sendMessage]);

  // 모드 메시지 맵 메모이제이션 (성능 최적화)
  const modeMessagesMap = useMemo(() => ({
    'coding': '코딩 파트너 모드로 전환했습니다! 프로그래밍 관련 질문을 해주세요.',
    'analysis': '텍스트 분석 모드로 전환했습니다! 분석하고 싶은 텍스트를 입력해주세요.',
    'chat': '일반 대화 모드입니다. 무엇이든 물어보세요!',
    'monitoring': '성능 모니터링 모드로 전환했습니다! 시스템 성능을 실시간으로 확인할 수 있습니다.',
    'writing': '글쓰기 모드로 전환했습니다! 창의적인 글을 작성해보세요!',
    'notebook': '노트북 LLM 모드로 전환했습니다! 프로젝트별 맞춤 AI를 사용할 수 있습니다!'
  } as Record<ChatMode, string>), []);

  const switchMode = useCallback((mode: ChatMode) => {
    setCurrentMode(mode);
    setShowAdvancedFeatures(false);

    const modeMessage: Message = {
      id: Date.now(),
      sender: 'ai',
      text: modeMessagesMap[mode] || modeMessagesMap.chat,
      timestamp: new Date().toLocaleTimeString(),
      analysis: null
    };

    setMessages(prev => {
      const newMessages = [...prev, modeMessage];
      return newMessages.length > MAX_MESSAGES
        ? newMessages.slice(-MAX_MESSAGES)
        : newMessages;
    });
  }, [modeMessagesMap]);

  const handleFilesSelected = useCallback((files: Array<{ file: File; preview?: string; type: 'image' | 'document' | 'other' }>) => {
    for (const { file, preview, type } of files) {
      let messageText = '';

      if (type === 'image' && preview) {
        messageText = `🖼️ 이미지 첨부: ${file.name}\n\n![${file.name}](${preview})`;
      } else if (type === 'document') {
        messageText = `📄 문서 첨부: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
      } else {
        messageText = `📎 파일 첨부: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`;
      }

      const fileMessage: Message = {
        id: Date.now() + Math.random(),
        sender: 'user',
        text: messageText,
        timestamp: new Date().toLocaleTimeString(),
        analysis: null,
      };

      setMessages(prev => {
        const newMessages = [...prev, fileMessage];
        return newMessages.length > MAX_MESSAGES
          ? newMessages.slice(-MAX_MESSAGES)
          : newMessages;
      });
    }

    addNotification({
      type: 'success',
      title: '파일 업로드 완료',
      message: `${files.length}개 파일이 업로드되었습니다.`,
    });
  }, [addNotification]);

  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.pdf,.doc,.docx,.csv,.json,.md';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const fileResults = Array.from(files).map(file => ({
          file,
          type: (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text'))
            ? 'document' as const
            : 'other' as const,
        }));
        handleFilesSelected(fileResults);
      }
    };
    input.click();
  }, [handleFilesSelected]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        Promise.all(
          Array.from(files).map(async (file) => {
            const preview = await new Promise<string | undefined>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = () => resolve(undefined);
              reader.readAsDataURL(file);
            });
            return {
              file,
              preview,
              type: 'image' as const,
            };
          })
        ).then(handleFilesSelected);
      }
    };
    input.click();
  }, [handleFilesSelected]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }, [sendMessage]);

  // 성능 최적화된 텍스트 입력 핸들러 (디바운싱)
  const debouncedTypingIndicator = useMemo(
    () => debounce((isTyping: boolean) => {
      chatEnhancements.sendTypingIndicator(isTyping, '나');
    }, 300),
    [chatEnhancements]
  );

  const debouncedSmartSuggestions = useMemo(
    () => debounce((text: string) => {
      if (coerceTrimmedString(text, '').length >= 3) {
        chatEnhancements.generateSmartSuggestions(text);
      }
    }, 500),
    [chatEnhancements]
  );

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputText(newValue);

    // 타이핑 인디케이터 전송 (디바운싱)
    debouncedTypingIndicator(coerceTrimmedString(newValue, '').length > 0);

    // 스마트 제안 생성 (디바운싱)
    debouncedSmartSuggestions(newValue);

    // 텍스트 영역 높이 자동 조정 (성능 최적화)
    requestAnimationFrame(() => {
      if (e.target) {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
      }
    });
  }, [debouncedTypingIndicator, debouncedSmartSuggestions]);

  // 컴포넌트 언마운트 시 디바운스 함수 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      debouncedTypingIndicator.cancel();
      debouncedSmartSuggestions.cancel();
    };
  }, [debouncedTypingIndicator, debouncedSmartSuggestions]);

  return (
    <div className="app-container">
      {/* 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">CORBU.AI</div>
          <button className="new-chat-btn" onClick={startNewChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            새 대화
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">기능</div>
            <div
              className={`nav-item ${currentMode === 'chat' ? 'active' : ''}`}
              onClick={() => switchMode('chat')}
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              일반 대화
            </div>
            <div
              className={`nav-item ${currentMode === 'coding' ? 'active' : ''}`}
              onClick={() => switchMode('coding')}
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
              코딩 파트너
            </div>
            <div
              className={`nav-item ${currentMode === 'analysis' ? 'active' : ''}`}
              onClick={() => switchMode('analysis')}
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zM21 3l-6 6" />
                </svg>
              </div>
              {t('sidebar.analysis')}
            </div>
            <button
              type="button"
              aria-label="노트북 LLM 모드로 전환"
              className={`nav-item ${currentMode === 'notebook' ? 'active' : ''}`}
              onClick={() => switchMode('notebook')}
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              노트북 LLM
            </button>
            <button
              className={`nav-item ${showAdvancedFeatures ? 'active' : ''}`}
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowAdvancedFeatures(!showAdvancedFeatures);
                }
              }}
              tabIndex={0}
              aria-label="고급 기능 패널 열기/닫기"
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              {t('sidebar.advancedFeatures')}
            </button>
            <button
              className={`nav-item ${currentMode === 'monitoring' ? 'active' : ''}`}
              onClick={() => {
                setCurrentMode('monitoring');
                setShowAdvancedFeatures(false);
              }}
              aria-label="성능 모니터링 대시보드 열기"
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M7 12l4-4 4 4 6-6" />
                </svg>
              </div>
              {t('sidebar.monitoring')}
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">세션 관리</div>
            <button
              className="nav-item"
              onClick={() => setShowSessionManager(!showSessionManager)}
              aria-label="세션 관리"
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              세션 목록
            </button>
            <button
              className="nav-item"
              onClick={() => setShowProjectLLMSettings(true)}
              aria-label="프로젝트별 LLM 설정"
            >
              <div className="nav-item-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              프로젝트 LLM 설정
            </button>
            <div className="nav-item" style={{ padding: '8px 12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%' }}>
                <input
                  type="checkbox"
                  checked={useLocalLLM}
                  onChange={(e) => setUseLocalLLM(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px' }}>로컬 LLM 사용</span>
              </label>
            </div>
            {sessions.slice(0, 5).map((session) => (
              <button
                key={session.id}
                className={`nav-item ${sessionId === session.id ? 'active' : ''}`}
                onClick={() => handleSessionSelect(session.id)}
                type="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSessionSelect(session.id);
                  }
                }}
              >
                <div className="nav-item-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                {session.name}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">U</div>
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>사용자</div>
              <div style={{ fontSize: '12px' }}>CORBU.AI Plus</div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {/* 브레드크럼 네비게이션 */}
        <BreadcrumbNavigation
          items={[
            {
              label: '홈',
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
              onClick: () => {
                setCurrentMode('chat');
                setShowAdvancedFeatures(false);
              },
            },
            ...(currentMode === 'writing' || currentMode === 'monitoring' || currentMode === 'coding' || currentMode === 'analysis' || currentMode === 'notebook'
              ? [
                {
                  label: (() => {
                    if (currentMode === 'writing') return '글쓰기';
                    if (currentMode === 'monitoring') return '성능 모니터링';
                    if (currentMode === 'coding') return '코딩 파트너';
                    if (currentMode === 'notebook') return '노트북 LLM';
                    return '분석';
                  })(),
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  ),
                },
              ]
              : []),
            ...(showAdvancedFeatures
              ? [
                {
                  label: '고급 기능',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    </svg>
                  ),
                },
              ]
              : []),
          ]}
        />

        <div className="main-header">
          <div className="header-left">
            <div className="header-title">CORBU.AI</div>
            <div className="model-selector">
              <span>고급 AI</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
          <div className="header-right">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onDismiss={dismiss}
              onClearAll={clearAll}
            />
            <LanguageSelector />
            <button className="upgrade-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {t('common.upgrade') || '업그레이드'}
            </button>
            <button
              className="theme-toggle-btn"
              onClick={darkMode.toggleDarkMode}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  darkMode.toggleDarkMode();
                }
              }}
              title={darkMode.isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              aria-label={darkMode.isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {darkMode.isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="profile-btn"
              title="설정"
              onClick={() => setShowSettings(true)}
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* 설정 모달 */}
        {showSettings && (
          <UserSettings onClose={() => setShowSettings(false)} />
        )}

        {/* 검색 패널 */}
        {showSearch && (
          <ErrorBoundary
            fallback={
              <div className="error-fallback error-fallback--overlay" role="alert">
                <h3>검색 패널 로드 실패</h3>
                <p>검색 패널을 불러오는 중 오류가 발생했습니다.</p>
                <button onClick={() => setShowSearch(false)}>닫기</button>
              </div>
            }
          >
            <SearchPanel
              isOpen={showSearch}
              onClose={() => {
                setShowSearch(false);
              }}
              onSelect={(result: SearchResult) => {
                // 검색 결과 선택 시 처리
                if (result.type === 'message') {
                  // 메시지로 스크롤
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else if (result.type === 'writing') {
                  // 글쓰기 모드로 전환
                  setCurrentMode('writing');
                }
              }}
            />
          </ErrorBoundary>
        )}

        {/* 고급 검색 패널 */}
        {showAdvancedSearch && (
          <ErrorBoundary
            fallback={
              <div className="error-fallback error-fallback--overlay" role="alert">
                <h3>고급 검색 패널 로드 실패</h3>
                <p>고급 검색 패널을 불러오는 중 오류가 발생했습니다.</p>
                <button onClick={() => setShowAdvancedSearch(false)}>닫기</button>
              </div>
            }
          >
            <AdvancedSearchPanel
              isOpen={showAdvancedSearch}
              onClose={() => {
                setShowAdvancedSearch(false);
              }}
              onSelect={(result: AdvancedSearchResult) => {
                if (result.type === 'message' && result.metadata?.sessionId) {
                  if (result.metadata.sessionId !== sessionId) {
                    setSessionId(result.metadata.sessionId);
                  }
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else if (result.type === 'writing') {
                  setCurrentMode('writing');
                }
              }}
            />
          </ErrorBoundary>
        )}

        {/* 키보드 단축키 도움말 */}
        <KeyboardShortcutsHelp
          isOpen={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />

        <div className="chat-container">
          {(() => {
            if (currentMode === 'writing') {
              return (
                <div className="writing-wrapper">
                  <ErrorBoundary
                    fallback={
                      <div className="error-fallback">
                        <h3>글쓰기 어시스턴트 로드 실패</h3>
                        <p>글쓰기 어시스턴트를 불러오는 중 오류가 발생했습니다.</p>
                        <button onClick={() => setCurrentMode('chat')}>대화로 돌아가기</button>
                      </div>
                    }
                  >
                    <WritingAssistant
                      onGenerate={async (content: string) => {
                        // 고급 글생성 엔진으로 품질 향상
                        try {
                          const context = {
                            topic: content,
                            audience: '일반 독자',
                            purpose: '정보 제공 및 가치 전달',
                            tone: 'professional' as const,
                            style: 'detailed' as const,
                            keywords: content.split(/\s+/).filter(Boolean),
                            previousContent: content,
                          };

                          const enhanced = await advancedWritingEngine.generateWithContext(
                            context,
                            async (_prompt) => {
                              // 실제 API 호출 대신 프롬프트 기반 개선
                              return advancedWritingEngine.analyzeAndEnhance(content, context).content;
                            }
                          );

                          // 품질 정보 포맷팅
                          const qualityScore = (enhanced.quality * 100).toFixed(0);
                          const coherenceScore = (enhanced.coherence * 100).toFixed(0);
                          const creativityScore = (enhanced.creativity * 100).toFixed(0);

                          let messageText = `📝 고품질 글 생성 완료!\n\n품질 점수: ${qualityScore}%\n일관성: ${coherenceScore}%\n창의성: ${creativityScore}%\n\n${enhanced.content}`;

                          if (enhanced.suggestions.length > 0) {
                            const suggestionsList = enhanced.suggestions.map(s => `• ${s}`).join('\n');
                            messageText += `\n\n💡 개선 제안:\n${suggestionsList}`;
                          }

                          // 생성된 글을 대화 메시지로 추가
                          const message: Message = {
                            id: Date.now(),
                            sender: 'ai',
                            text: messageText,
                            timestamp: new Date().toLocaleTimeString(),
                            analysis: null,
                          };
                          addMessage(message);

                          // 글쓰기 완료 알림
                          addNotification({
                            type: 'writing',
                            title: '고품질 글 생성 완료',
                            message: `품질 점수 ${(enhanced.quality * 100).toFixed(0)}%의 글을 생성했습니다.`,
                            action: {
                              label: '보기',
                              onClick: () => {
                                setTimeout(() => {
                                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              },
                            },
                          });
                        } catch (error) {
                          // 에러 발생 시 원본 내용 사용
                          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                          errorLogger.error('글생성 오류', error instanceof Error ? error : new Error(errorMessage), {
                            component: 'ModernChatInterface',
                            action: 'generateWriting',
                          });

                          const message: Message = {
                            id: Date.now(),
                            sender: 'ai',
                            text: `📝 생성된 글:\n\n${content}`,
                            timestamp: new Date().toLocaleTimeString(),
                            analysis: null,
                          };
                          addMessage(message);
                          addNotification({
                            type: 'writing',
                            title: '글쓰기 생성 완료',
                            message: '새로운 글이 생성되었습니다.',
                          });
                        }
                      }}
                    />
                  </ErrorBoundary>
                </div>
              );
            }
            if (currentMode === 'notebook') {
              return (
                <div className="notebook-wrapper">
                  <ErrorBoundary
                    fallback={
                      <div className="error-fallback">
                        <h3>노트북 LLM 로드 실패</h3>
                        <p>노트북 LLM을 불러오는 중 오류가 발생했습니다.</p>
                        <button onClick={() => setCurrentMode('chat')}>대화로 돌아가기</button>
                      </div>
                    }
                  >
                    <NotebookLLM
                      projectId={currentProjectId === 'default-project' ? undefined : currentProjectId}
                      initialPrompt={inputText || undefined}
                      onResponseComplete={(response) => {
                        // 노트북 LLM 응답을 대화 메시지로 추가
                        const message: Message = {
                          id: Date.now(),
                          sender: 'ai',
                          text: `📓 노트북 LLM 응답:\n\n${response.content}`,
                          timestamp: new Date().toLocaleTimeString(),
                          analysis: null,
                        };
                        addMessage(message);
                        addNotification({
                          type: 'success',
                          title: '노트북 LLM 응답 완료',
                          message: '노트북 LLM이 응답을 생성했습니다.',
                        });
                      }}
                      onError={(error) => {
                        errorLogger.error('노트북 LLM 오류', error instanceof Error ? error : new Error(String(error)), {
                          component: 'ModernChatInterface',
                          action: 'notebookLLM',
                        });
                        addNotification({
                          type: 'error',
                          title: '노트북 LLM 오류',
                          message: error.message || '노트북 LLM 처리 중 오류가 발생했습니다.',
                        });
                      }}
                    />
                  </ErrorBoundary>
                </div>
              );
            }
            if (currentMode === 'monitoring') {
              return (
                <div className="monitoring-wrapper">
                  <ErrorBoundary
                    fallback={
                      <div className="error-fallback">
                        <h3>성능 모니터링 로드 실패</h3>
                        <p>성능 모니터링 대시보드를 불러오는 중 오류가 발생했습니다.</p>
                        <button onClick={() => globalThis.location.reload()}>페이지 새로고침</button>
                      </div>
                    }
                  >
                    <PerformanceMonitoringDashboard
                      refreshInterval={30}
                      showPredictions={true}
                    />
                  </ErrorBoundary>
                </div>
              );
            }
            if (showAdvancedFeatures) {
              return (
                <div className="advanced-features-wrapper">
                  <div className="advanced-features-header">
                    <h2>고급 기능</h2>
                    <button
                      className="close-btn"
                      onClick={() => setShowAdvancedFeatures(false)}
                      title="닫기"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <ErrorBoundary
                    fallback={
                      <div className="error-fallback">
                        <h3>고급 기능 패널 로드 실패</h3>
                        <p>고급 기능 패널을 불러오는 중 오류가 발생했습니다.</p>
                        <button onClick={() => setShowAdvancedFeatures(false)}>패널 닫기</button>
                      </div>
                    }
                  >
                    <AdvancedFeaturesPanel
                      userId={sessionId}
                      onImageAnalyzed={(result: ImageAnalysisResult) => {
                        const imageMessage: Message = {
                          id: Date.now(),
                          sender: 'ai',
                          text: `🖼️ 이미지 분석 완료!\n\n이미지 크기: ${result.analysis?.image_info?.width || 'N/A'}x${result.analysis?.image_info?.height || 'N/A'}\n형식: ${result.analysis?.image_info?.format || 'N/A'}\n${result.analysis?.object_detection
                            ? `감지된 객체: ${result.analysis.object_detection.total_objects || 0}개\n`
                            : ''
                            }${result.analysis?.ocr_results?.extracted_text
                              ? `추출된 텍스트: ${result.analysis.ocr_results.extracted_text}\n`
                              : ''
                            }`,
                          timestamp: new Date().toLocaleTimeString(),
                          analysis: null
                        };
                        setMessages(prev => [...prev, imageMessage]);
                      }}
                      onPredictionComplete={(type: string, result: unknown) => {
                        const r = result as PredictionResult;
                        let predictionText = '';
                        if (type === 'user_activity' && r.prediction) {
                          const activities = (r.prediction.predicted_activities || []).map((a) => `- ${a.activity} (${(a.probability * 100).toFixed(1)}%)`).join('\n');
                          predictionText = `👤 사용자 활동 예측 완료!\n\n다음 예상 활동:\n${activities}`;
                        } else if (type === 'message_quality' && r.quality_analysis) {
                          const suggestions = (r.quality_analysis.suggestions || []).map((s) => `- ${s}`).join('\n');
                          const score = ((r.quality_analysis.overall_score || 0) * 100).toFixed(1);
                          predictionText = `✍️ 메시지 품질 분석 완료!\n\n종합 점수: ${score}점\n품질 수준: ${r.quality_analysis.quality_level || 'N/A'}\n\n개선 제안:\n${suggestions}`;
                        } else if (type === 'system_performance' && r.performance_prediction) {
                          const cpu = (r.performance_prediction.predicted_metrics?.cpu_usage || 0).toFixed(1);
                          const memory = (r.performance_prediction.predicted_metrics?.memory_usage || 0).toFixed(1);
                          const responseTime = (r.performance_prediction.predicted_metrics?.response_time_ms || 0).toFixed(0);
                          predictionText = `⚙️ 시스템 성능 예측 완료!\n\n예상 CPU: ${cpu}%\n예상 메모리: ${memory}%\n응답 시간: ${responseTime}ms`;
                        }

                        if (predictionText) {
                          const predictionMessage: Message = {
                            id: Date.now(),
                            sender: 'ai',
                            text: predictionText,
                            timestamp: new Date().toLocaleTimeString(),
                            analysis: null
                          };
                          setMessages(prev => [...prev, predictionMessage]);
                        }
                      }}
                    />
                  </ErrorBoundary>
                </div>
              );
            }
            return (
              <div className="genspark-chat-column">
                <div
                  ref={messagesContainerRef}
                  className="chat-messages"
                  role="log"
                  aria-label="대화 메시지 목록"
                  aria-live="polite"
                  aria-atomic="false"
                  style={shouldVirtualize ? {
                    height: '100%',
                    overflow: 'auto',
                    position: 'relative',
                  } : {}}
                >
                  {shouldVirtualize && virtualizedInfo.startIndex > 0 && (
                    <div
                      style={{
                        height: virtualizedInfo.startIndex * 120,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        pointerEvents: 'none',
                      }}
                      aria-hidden="true"
                    />
                  )}
                  {optimizedMessages.map((message) => (
                    <MessageItem
                      key={message.id}
                      id={message.id}
                      sender={message.sender}
                      text={message.text}
                      timestamp={message.timestamp}
                      analysis={message.analysis}
                      pipelineExtras={message.pipelineExtras}
                      isLiked={message.isLiked}
                      isDisliked={message.isDisliked}
                      isBookmarked={message.isBookmarked}
                      sessionId={sessionId}
                      onCopy={handleCopyMessage}
                      onRegenerate={handleRegenerateMessage}
                      onEdit={handleEditMessage}
                      onReply={handleReplyToMessage}
                      onLike={handleLikeMessage}
                      onDislike={handleDislikeMessage}
                      onBookmark={handleBookmarkMessage}
                    />
                  ))}
                  {shouldVirtualize && virtualizedInfo.hasMore && (
                    <div
                      style={{
                        height: (virtualizedInfo.totalCount - virtualizedInfo.endIndex - 1) * 120,
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        pointerEvents: 'none',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {(isTyping || isStreaming) &&
                    !streamingMessageId &&
                    !messages.some(
                      (m) =>
                        m.sender === 'ai' && isAssistantGenerationPlaceholder(m.text),
                    ) && (
                    <output
                      className="message ai typing-message genspark-qa-article"
                      aria-live="polite"
                      aria-label="AI가 답변을 생성 중입니다"
                    >
                      <div className="message-avatar" aria-hidden="true">AI</div>
                      <div className="message-content">
                        <div className="genspark-qa-role-row">
                          <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
                        </div>
                        <div className="message-text">
                          <AssistantGensparkBody text="" embedded enhancedCodeBlocks />
                        </div>
                        <div className="message-time" aria-hidden="true">
                          {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    </output>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-container genspark-input-dock">
                  <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => sendQuickMessage('안녕하세요!')}>인사</button>
                    <button className="quick-action-btn" onClick={() => sendQuickMessage('파이썬 웹 개발에 대해 알려주세요')}>웹 개발</button>
                    <button className="quick-action-btn" onClick={() => sendQuickMessage('머신러닝 기초를 설명해주세요')}>머신러닝</button>
                    <button className="quick-action-btn" onClick={() => sendQuickMessage('데이터 분석 도구를 추천해주세요')}>데이터 분석</button>
                  </div>

                  <form className="input-wrapper" aria-label="메시지 입력" onSubmit={(e) => { e.preventDefault(); void sendMessage(); }}>
                    <fieldset className="input-attachments" aria-label="첨부 파일 옵션">
                      <button
                        className="attachment-btn"
                        onClick={handleFileUpload}
                        title="파일 첨부"
                        aria-label="파일 첨부"
                        type="button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                        </svg>
                      </button>
                      <button
                        className="attachment-btn"
                        onClick={handleImageUpload}
                        title="이미지 첨부"
                        aria-label="이미지 첨부"
                        type="button"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21,15 16,10 5,21" />
                        </svg>
                      </button>
                    </fieldset>

                    {/* 파일 업로드 존 (드래그 앤 드롭) - 접을 수 있는 형태로 표시 */}
                    {!isTyping && (
                      <FileUploadZone
                        onFilesSelected={handleFilesSelected}
                        accept="*/*"
                        multiple={true}
                        maxSize={10 * 1024 * 1024}
                        maxFiles={5}
                        disabled={isTyping}
                      />
                    )}

                    {/* 답장 인용 메시지 */}
                    {replyingTo && (
                      <MessageReply
                        quotedMessage={{
                          id: replyingTo.id,
                          sender: replyingTo.sender,
                          text: replyingTo.text,
                          timestamp: replyingTo.timestamp,
                        }}
                        onClose={() => setReplyingTo(null)}
                        compact={true}
                      />
                    )}

                    {chatEnhancements.smartSuggestions.length > 0 && (
                      <div className="smart-suggestions-container" style={{ marginBottom: '8px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>💡 제안:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {chatEnhancements.smartSuggestions.map((suggestion) => (
                            <button
                              key={`suggestion-${suggestion.substring(0, 20)}-${suggestion.length}`}
                              type="button"
                              onClick={() => {
                                setInputText(suggestion);
                                chatEnhancements.sendTypingIndicator(false, '나');
                                if (textareaRef.current) {
                                  textareaRef.current.focus();
                                }
                              }}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                background: 'var(--bg-primary, white)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--accent-primary)';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-primary, white)';
                                e.currentTarget.style.color = 'inherit';
                              }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <textarea
                      ref={textareaRef}
                      className="chat-input bw-input"
                      placeholder={replyingTo ? '답장을 입력하세요…' : '질문을 입력하세요. 답변은 개요·근거·다음 단계 형태로 표시됩니다.'}
                      value={inputText}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      aria-label="메시지 입력창"
                      aria-describedby="input-hint"
                      aria-required="true"
                    />
                    <span id="input-hint" className="sr-only">
                      Enter 키를 누르면 메시지가 전송되고, Shift+Enter를 누르면 줄바꿈됩니다.
                    </span>

                    <div className="input-actions">
                      <button
                        className="send-btn"
                        title="전송"
                        aria-label="메시지 전송"
                        disabled={!coerceTrimmedString(inputText, '') || isTyping}
                        type="submit"
                        aria-disabled={!coerceTrimmedString(inputText, '') || isTyping}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22,2 15,22 11,13 2,9 22,2" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 세션 관리 모달 */}
      {showSessionManager && (
        <button
          type="button"
          className="modal-overlay"
          onClick={() => setShowSessionManager(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowSessionManager(false);
            }
          }}
          aria-label="모달 닫기"
        >
          <dialog
            className="modal-content session-manager-modal"
            open={showSessionManager}
            onCancel={(e) => {
              e.preventDefault();
              setShowSessionManager(false);
            }}
            aria-label="세션 관리"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                }
              }}
            >
              <SessionManager
                currentSessionId={sessionId}
                sessions={sessions}
                onSessionSelect={handleSessionSelect}
                onSessionCreate={handleSessionCreate}
                onSessionRename={handleSessionRename}
                onSessionDelete={handleSessionDelete}
                onClose={() => setShowSessionManager(false)}
              />
            </div>
          </dialog>
        </button>
      )}

      {/* 프로젝트별 LLM 설정 모달 */}
      {showProjectLLMSettings && (
        <dialog
          className="modal-overlay"
          open
          aria-modal="true"
          aria-label="프로젝트별 LLM 설정"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProjectLLMSettings(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowProjectLLMSettings(false);
            }
          }}
        >
          <div
            className="modal-overlay-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <ProjectLLMSettings
              projectId={currentProjectId}
              projectName={sessionId || '기본 프로젝트'}
              onClose={() => setShowProjectLLMSettings(false)}
              onSave={(config) => {
                setCurrentProjectId(config.projectId);
                addNotification({
                  type: 'success',
                  title: 'LLM 설정 저장 완료',
                  message: `${config.provider.name} - ${config.model.name} 모델이 설정되었습니다.`,
                });
              }}
            />
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ModernChatInterface;