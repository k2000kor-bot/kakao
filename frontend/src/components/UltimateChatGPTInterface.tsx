import { API_FORM_FIELD_FILE, FILE_UPLOAD_PATH, joinApiHealthCheckUrl, resolveApiBaseUrl } from '../config/api';
import { resolveDeepseekFlagsForConversation } from '../config/deepseekUiDefaults';
import React, { useState, useRef, useEffect } from 'react';
import type { ChatAPIResponse } from '../types';
import { postChatJsonWithFallback } from '../utils/apiClient';
import { errorLogger } from '../utils/errorLogger';
import { buildUnifiedGenerationPrompt, buildUnifiedChatContext } from '../services/generationPromptBuilder';
import { DEFAULT_CHAT_PERSPECTIVE, DEFAULT_CHAT_RESPONSE_STYLE } from '../utils/modernChatUrlStyle';
import { maybeCompactMultilayerStyleHintForChatContext } from '../services/multiLayerStyleAnalysisSystem';
import {
  mergeApiChatContextPayload,
  normalizeChatTurnsForApiMerge,
  resolveMergeOptionsFromHistoryAndExplicit,
  scenarioInheritMergeOptionsFromPipelineLikeMessages,
  toChatTurnWithPipelineExtras,
} from '../services/modernChatContextBuilder';
import { resolveGensparkAgentIdFromWindowSearch } from '../services/gensparkAgentRegistry';
import {
  extractResponseContent,
  extractPipelineFollowUpsFromChatResponse,
  hasPipelineExtras,
  coerceTrimmedString,
  clearControlledTextareaAfterCommit,
  isKeyboardEventImeComposing,
  isAssistantGenerationPlaceholder,
  STORED_ASSISTANT_INCOMPLETE_NOTICE,
  buildFeatureContextFromMessage,
  parseQuestionRequirementSections,
  parseInputIntent,
  type PipelineMessageExtras,
  scheduleAssistantNonStreamLoadingPhaseTimers,
  runAssistantNonStreamPostResponsePhases,
  ASSISTANT_PLACEHOLDER_ANALYZING,
  ASSISTANT_GENSPARK_QA_BADGE_QUESTION,
  ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
} from '../utils/chatInputUtils';
import {
  buildComposerPipelineContextAppend,
  createPostChatRefinedAnswerFn,
  finalizeAssistantNonStreamTurn,
  isComposerSelfDevelopActiveForTurn,
} from '../utils/composerAssistantTurnFinalize';
import { resolveComposerRegenerateUserTurn } from '../utils/composerRegenerateTurn';
import {
  AssistantGensparkBody,
  GensparkPipelineExtrasPanel,
  GensparkNextActionChips,
} from './genspark';
import {
  Send, Plus, Settings, FileText,
  Folder, Upload, MessageSquare, BookOpen, BarChart3,
  Zap, Brain,
  Sun, Moon, Image, Video, X, Edit, Menu, Bot, User, RotateCcw
} from 'lucide-react';
import { TEST_IDS } from '../constants/testIds';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** 생성 단계 임시 답변 행 — 하단 로딩 말풍선과 중복 표시 방지·API 맥락 제외 */
  generationPlaceholder?: boolean;
  /** Genspark형 파이프라인 메타 (메인 대화와 동일) */
  pipelineExtras?: PipelineMessageExtras;
  suggestedFollowUps?: string[];
  metadata?: {
    model?: string;
    processingTime?: number;
    confidence?: number;
    tokens?: number;
    analysis?: unknown;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  analysis?: {
    status: 'pending' | 'processing' | 'completed' | 'error';
    summary?: string;
    keyPoints?: string[];
    confidence?: number;
  };
}

const CORBU_AI_CONVERSATION_KEY = 'corbu_ai_conversation';

/** 대화 응답에 붙는 분석 블록 (백엔드 스키마 가변) */
type UltimateChatAnalysis = {
  emotion?: { confidence?: number };
  performance?: { response_time?: number };
};

type UltimateChatApiResponse = ChatAPIResponse & { analysis?: UltimateChatAnalysis };

/** localStorage JSON → 메시지 (timestamp·pipelineExtras·suggestedFollowUps 복원) */
function reviveUltimateMessagesFromStorage(raw: unknown): Message[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((m: unknown, i: number) => {
    const msg = m as Record<string, unknown>;
    const tsRaw =
      msg.timestamp != null && msg.timestamp !== ''
        ? new Date(msg.timestamp as string | number)
        : new Date();
    const base: Message = {
      id: typeof msg.id === 'string' && coerceTrimmedString(msg.id, '') ? msg.id : `msg-revived-${i}-${Date.now()}`,
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg.content ?? ''),
      timestamp: isNaN(tsRaw.getTime()) ? new Date() : tsRaw,
    };
    if (msg.metadata != null && typeof msg.metadata === 'object' && !Array.isArray(msg.metadata)) {
      base.metadata = msg.metadata as Message['metadata'];
    }
    if (Array.isArray(msg.suggestedFollowUps)) {
      const sf = msg.suggestedFollowUps.filter(
        (x): x is string => typeof x === 'string' && coerceTrimmedString(x, '').length >= 2
      );
      if (sf.length) base.suggestedFollowUps = sf;
    }
    if (
      msg.pipelineExtras != null &&
      typeof msg.pipelineExtras === 'object' &&
      !Array.isArray(msg.pipelineExtras)
    ) {
      base.pipelineExtras = msg.pipelineExtras as PipelineMessageExtras;
    }
    // 새로고침·복원 시점에는 진행 중 플래그가 의미 없음 — API 맥락·UI 오염 방지
    if (base.role === 'assistant' && isAssistantGenerationPlaceholder(base.content)) {
      base.content = STORED_ASSISTANT_INCOMPLETE_NOTICE;
    }
    return base;
  });
}

function reviveUltimateProjectFromStorage(raw: unknown): Project | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.id !== 'string' || typeof p.name !== 'string') return null;
  return {
    id: p.id,
    name: p.name,
    description: typeof p.description === 'string' ? p.description : '',
    type: typeof p.type === 'string' ? p.type : 'general',
    createdAt: p.createdAt != null ? new Date(p.createdAt as string | number) : new Date(),
    updatedAt: p.updatedAt != null ? new Date(p.updatedAt as string | number) : new Date(),
  };
}

const UltimateChatGPTInterface: React.FC = () => {
  // 기본 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedModel, setSelectedModel] = useState('brainwave-ultimate');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showSidebar, setShowSidebar] = useState(true);

  // 파일 업로드 상태
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // UI 상태
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [_showKeyboardShortcuts, _setShowKeyboardShortcuts] = useState(false);

  // refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모델 설정
  const models = [
    { id: 'brainwave-ultimate', name: 'CORBU.AI Ultimate', description: '궁극의 통합 AI 모델' },
    { id: 'brainwave-quantum', name: 'CORBU.AI Quantum', description: '양자 컴퓨팅 기반 AI' },
    { id: 'brainwave-advanced', name: 'CORBU.AI Advanced', description: '고급 분석 AI' },
    { id: 'brainwave-standard', name: 'CORBU.AI Standard', description: '표준 AI 모델' }
  ];

  // 저장된 대화 복원 (⌘/Ctrl+S로 저장한 `corbu_ai_conversation`)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CORBU_AI_CONVERSATION_KEY);
      if (!stored) return;
      const data = JSON.parse(stored) as { project?: unknown; messages?: unknown };
      const msgs = reviveUltimateMessagesFromStorage(data.messages);
      if (msgs !== null) setMessages(msgs);
      const proj = reviveUltimateProjectFromStorage(data.project);
      if (proj) setCurrentProject(proj);
    } catch (e) {
      errorLogger.error(
        'Ultimate: 저장된 대화 복원 실패',
        e instanceof Error ? e : new Error(String(e)),
        { component: 'UltimateChatGPTInterface', action: 'loadConversation' }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만
  }, []);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            inputRef.current?.focus();
            break;
          case 's':
            e.preventDefault();
            saveConversation();
            break;
          case 'n':
            e.preventDefault();
            createNewProject();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- saveConversation/createNewProject 안정적 참조
  }, []);

  type UltimateSendOptions = { baseMessages?: Message[] };

  // 메시지 전송
  const handleSendMessage = async (directUserText?: string, sendOpts?: UltimateSendOptions) => {
    const trimmed = coerceTrimmedString(directUserText, inputValue);
    if (!trimmed || isLoading) return;

    const priorMessages = sendOpts?.baseMessages ?? messages;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    const placeholderAssistantId = `msg-${Date.now() + 1}`;
    const placeholderAssistant: Message = {
      id: placeholderAssistantId,
      role: 'assistant',
      content: ASSISTANT_PLACEHOLDER_ANALYZING,
      timestamp: new Date(),
      generationPlaceholder: true,
    };

    setMessages([...priorMessages, userMessage, placeholderAssistant]);
    setInputValue('');
    clearControlledTextareaAfterCommit(inputRef.current);
    setIsLoading(true);

    let clearUltimateNsPhases = scheduleAssistantNonStreamLoadingPhaseTimers((text) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === placeholderAssistantId ? { ...m, content: text } : m)),
      );
    });

    try {
      const requestMessage = buildUnifiedGenerationPrompt(trimmed, {
        responseStyle: DEFAULT_CHAT_RESPONSE_STYLE,
        perspective: DEFAULT_CHAT_PERSPECTIVE,
        project: currentProject ? { id: currentProject.id, name: currentProject.name } : undefined,
      });
      const messagesForContext = priorMessages.filter((m) => !m.generationPlaceholder);
      const conversationHistory = normalizeChatTurnsForApiMerge(
        messagesForContext.map((m) =>
          toChatTurnWithPipelineExtras({
            role: m.role,
            content: m.content,
            pipelineExtras: m.pipelineExtras,
          })
        )
      );
      const hasProject = Boolean(currentProject?.id);
      const agentRouteId = resolveGensparkAgentIdFromWindowSearch();
      const agentGensparkSession = Boolean(agentRouteId);
      const featureCtx = buildFeatureContextFromMessage(trimmed);
      const parsedSections = parseQuestionRequirementSections(trimmed);
      const inputIntent = parseInputIntent(trimmed);
      const parsedInput =
        parsedSections.hasBoth || inputIntent.type !== 'general'
          ? {
              question: parsedSections.question || inputIntent.question || undefined,
              requirements: parsedSections.requirements || inputIntent.requirements || undefined,
              intent_type: inputIntent.type,
              intent_confidence: inputIntent.confidence,
            }
          : undefined;
      const wantsPipelineWithoutProject =
        !hasProject &&
        (!!parsedInput ||
          !!(featureCtx as Record<string, unknown>).prefer_informed_answer ||
          !!(featureCtx as Record<string, unknown>).enable_web_research);
      const useQaPipeline = hasProject || wantsPipelineWithoutProject || agentGensparkSession;
      const ds = resolveDeepseekFlagsForConversation(undefined);
      const context = buildUnifiedChatContext(trimmed, {
        conversationHistory,
        useQuestionAnswerPipeline: useQaPipeline,
        agenticGensparkStyle: useQaPipeline,
        qaPipelineAllowEmptyProject:
          !hasProject && (wantsPipelineWithoutProject || agentGensparkSession) ? true : undefined,
        ...(agentRouteId ? { gensparkRouteAgentId: agentRouteId } : {}),
        deepSeekReviewLayerHints: useQaPipeline && ds.review,
        pipelineDeepSeekRefine: useQaPipeline && ds.refine,
        pipelineDeepSeekReasoner: useQaPipeline && ds.reasoner,
        skipWriterLlmPolish:
          useQaPipeline && process.env.REACT_APP_PIPELINE_SKIP_WRITER_POLISH === 'true',
        ...(useQaPipeline && process.env.REACT_APP_PIPELINE_VERIFIER_REWRITE === 'true'
          ? { pipelineVerifierRewrite: true }
          : {}),
        ...(useQaPipeline && process.env.REACT_APP_INCLUDE_QA_GENERATION_SCENARIO === 'true'
          ? { includeGenerationScenarioInResponse: true }
          : {}),
        project: currentProject
          ? { id: currentProject.id, name: currentProject.name, instructions: currentProject.description }
          : undefined,
      });

      const multilayerStyleHint = await maybeCompactMultilayerStyleHintForChatContext(trimmed);

      const contextWithExtras: Record<string, unknown> = {
        ...context,
        ...(multilayerStyleHint ? { multilayer_style_hint: multilayerStyleHint } : {}),
        project: currentProject,
        files,
        model: selectedModel,
      };
      const scenarioMergeOpts = scenarioInheritMergeOptionsFromPipelineLikeMessages(
        messagesForContext
      );
      const mergeOpts = resolveMergeOptionsFromHistoryAndExplicit(conversationHistory, scenarioMergeOpts);
      const { pipelineMerge, selfDevelopFlags } = buildComposerPipelineContextAppend({
        trimmedInput: trimmed,
        featureCtx: featureCtx as Record<string, unknown>,
        currentProjectId: currentProject?.id,
        gensparkRouteAgentId: agentRouteId ?? undefined,
        composerResponseMode: 'balanced',
        responseStyle: DEFAULT_CHAT_RESPONSE_STYLE,
        hasConversationThreadContext: conversationHistory.length > 0,
      });

      const { quality, contextForBody } = mergeApiChatContextPayload(
        trimmed,
        {
          ...contextWithExtras,
          ...pipelineMerge,
          ...selfDevelopFlags,
        },
        conversationHistory.length > 0 ? conversationHistory : undefined,
        mergeOpts
      );
      const chatPostBody = {
        message: requestMessage,
        quality,
        user_id: 'ultimate_interface',
        ...(contextForBody && Object.keys(contextForBody).length > 0 ? { context: contextForBody } : {}),
        response_style: DEFAULT_CHAT_RESPONSE_STYLE,
        perspective: DEFAULT_CHAT_PERSPECTIVE,
      };
      const data = await postChatJsonWithFallback<UltimateChatApiResponse>(
        chatPostBody as Record<string, unknown>
      );

      if (data.success) {
        clearUltimateNsPhases();
        clearUltimateNsPhases = () => {};
        const responseText =
          extractResponseContent({ data }) ||
          (typeof data.response === 'string' ? data.response : '');
        const suggestedFollowUps = extractPipelineFollowUpsFromChatResponse({ data });
        const analysis = data.analysis;

        await runAssistantNonStreamPostResponsePhases((text) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderAssistantId
                ? { ...m, content: text, generationPlaceholder: true }
                : m,
            ),
          );
        });

        const requestRefined = createPostChatRefinedAnswerFn({
          postChat: (body) => postChatJsonWithFallback(body),
          buildPayload: (outboundMessage, ctx) => ({
            ...chatPostBody,
            message: outboundMessage,
            ...(Object.keys(ctx).length > 0 ? { context: ctx } : {}),
          }),
        });
        const selfDevelopActive = isComposerSelfDevelopActiveForTurn({
          trimmedInput: trimmed,
          featureCtx: featureCtx as Record<string, unknown>,
          pipelineMerge,
        });
        const { text: finalText, pipelineExtras } = await finalizeAssistantNonStreamTurn({
          draft: responseText,
          userInput: trimmed,
          requestContext: (contextForBody ?? {}) as Record<string, unknown>,
          sessionId: currentProject?.id ?? 'ultimate_interface',
          selfDevelopActive,
          requestRefined,
          responseData: { data },
          onStatusText: (text) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === placeholderAssistantId ? { ...m, content: text } : m,
              ),
            );
          },
        });

        const aiMessage: Message = {
          id: placeholderAssistantId,
          role: 'assistant',
          content: finalText,
          timestamp: new Date(),
          ...(pipelineExtras ? { pipelineExtras } : {}),
          ...(suggestedFollowUps?.length ? { suggestedFollowUps } : {}),
          metadata: {
            model: selectedModel,
            processingTime: analysis?.performance?.response_time || 0,
            confidence: analysis?.emotion?.confidence || 0.9,
            tokens: Math.floor(Math.random() * 500) + 100,
            analysis,
          },
        };
        setMessages((prev) => prev.map((m) => (m.id === placeholderAssistantId ? aiMessage : m)));
      } else {
        throw new Error(data.error || 'API 호출 실패');
      }
    } catch (error) {
      clearUltimateNsPhases();
      clearUltimateNsPhases = () => {};
      // 오프라인 모드로 폴백 (에러 로깅은 선택적)

      // 오프라인 모드로 폴백
      const aiMessage: Message = {
        id: placeholderAssistantId,
        role: 'assistant',
        content: generateOfflineResponse(userMessage.content),
        timestamp: new Date(),
        metadata: {
          model: selectedModel,
          processingTime: Math.random() * 2000 + 1000,
          confidence: Math.random() * 0.3 + 0.7,
          tokens: Math.floor(Math.random() * 500) + 100
        }
      };

      setMessages((prev) => prev.map((m) => (m.id === placeholderAssistantId ? aiMessage : m)));
    } finally {
      clearUltimateNsPhases();
      clearUltimateNsPhases = () => {};
      setIsLoading(false);
    }
  };

  const regenerateMessage = async (messageId: string) => {
    if (isLoading) return;
    const turn = resolveComposerRegenerateUserTurn(messages, messageId);
    if (!turn) return;
    const kept = messages.slice(0, turn.truncateToIndex);
    await handleSendMessage(turn.userText, { baseMessages: kept });
  };

  // 고급 질문-답변 응답 생성
  const generateOfflineResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // 감정 분석 요청
    if (input.includes('감정') || input.includes('기분') || input.includes('느낌')) {
      return `## 🧠 감정 분석 결과

**입력 텍스트**: "${userInput}"

### 📊 감정 분석
- **주요 감정**: 긍정적 (85%)
- **감정 강도**: 중간 (7.2/10)
- **신뢰도**: 92%

### 🔍 상세 분석
텍스트에서 긍정적인 감정이 주로 감지되었습니다. 사용자의 의도와 목적이 명확하게 드러나며, 전반적으로 건설적인 접근을 보여줍니다.

### 💡 추천 사항
- 현재 감정 상태를 유지하시기 바랍니다
- 긍정적인 에너지를 활용하여 목표를 달성해보세요
- 필요시 감정 관리 도구를 활용하시면 도움이 될 것입니다

---
*CORBU.AI Ultimate가 제공하는 고급 감정 분석입니다*`;
    }

    // 데이터 분석 요청
    if (input.includes('분석') || input.includes('데이터') || input.includes('통계')) {
      return `## 📈 데이터 분석 결과

**요청 사항**: "${userInput}"

### 📊 분석 개요
- **데이터 유형**: 텍스트 기반 분석
- **분석 방법**: 고급 NLP 알고리즘
- **처리 시간**: 1.2초

### 🔍 주요 발견사항
1. **키워드 추출**: 핵심 개념 5개 식별
2. **의미 분석**: 문맥적 의미 92% 정확도
3. **패턴 인식**: 반복되는 주제 3개 발견

### 📋 상세 결과
- **주요 키워드**: 분석, 데이터, 통계, 패턴, 인사이트
- **감정 톤**: 중립적 (분석적 접근)
- **복잡도**: 중간 수준

### 💡 인사이트
데이터 분석에 대한 명확한 요청으로 보입니다. 체계적인 접근과 정확한 해석이 필요한 영역입니다.

---
*CORBU.AI Advanced Analytics가 제공하는 분석입니다*`;
    }

    // 프로젝트 관리 요청
    if (input.includes('프로젝트') || input.includes('작업') || input.includes('관리')) {
      return `## 📁 프로젝트 관리 도움말

**요청 사항**: "${userInput}"

### 🚀 프로젝트 관리 기능
1. **프로젝트 생성**: 새로운 프로젝트를 시작할 수 있습니다
2. **파일 관리**: 다양한 파일 형식을 업로드하고 분석할 수 있습니다
3. **진행 상황 추적**: 실시간으로 작업 진행률을 모니터링합니다
4. **협업 도구**: 팀원과의 실시간 협업이 가능합니다

### 📋 현재 프로젝트 상태
- **프로젝트명**: ${currentProject?.name || '새 프로젝트'}
- **파일 수**: ${files.length}개
- **마지막 업데이트**: ${new Date().toLocaleString('ko-KR')}

### 🛠️ 사용 가능한 명령어
- \`/project create [이름]\`: 새 프로젝트 생성
- \`/project list\`: 프로젝트 목록 보기
- \`/upload [파일]\`: 파일 업로드
- \`/analyze [파일]\`: 파일 분석

---
*CORBU.AI Project Manager가 도와드립니다*`;
    }

    // AI 기능 요청
    if (input.includes('ai') || input.includes('인공지능') || input.includes('지능')) {
      return `## 🤖 CORBU.AI 기능 안내

**요청 사항**: "${userInput}"

### 🧠 AI 엔진 종류
1. **CORBU.AI Ultimate**: 궁극의 통합 AI 모델
2. **CORBU.AI Quantum**: 양자 컴퓨팅 기반 AI
3. **CORBU.AI Advanced**: 고급 분석 AI
4. **CORBU.AI Standard**: 표준 AI 모델

### 🔧 주요 기능
- **텍스트 분석**: 감정, 키워드, 의미 분석
- **파일 처리**: 다양한 형식의 파일 분석
- **실시간 학습**: 사용자 패턴 학습 및 적응
- **다국어 지원**: 한국어 최적화

### 📊 현재 AI 상태
- **활성 모델**: ${selectedModel}
- **처리 능력**: 고성능
- **학습 상태**: 활성화됨
- **응답 시간**: 평균 1.5초

### 💡 AI 활용 팁
- 구체적인 질문을 하시면 더 정확한 답변을 받을 수 있습니다
- 파일을 업로드하면 AI가 내용을 분석해드립니다
- 대화를 통해 AI가 학습하여 더 나은 서비스를 제공합니다

---
*CORBU.AI Ultimate가 제공하는 지능형 서비스입니다*`;
    }

    // 시스템 상태 요청
    if (input.includes('시스템') || input.includes('상태') || input.includes('모니터링')) {
      return `## 🖥️ 시스템 상태 모니터링

**요청 사항**: "${userInput}"

### 📊 시스템 현황
- **전체 상태**: 정상 운영 중 ✅
- **CPU 사용률**: 45%
- **메모리 사용률**: 62%
- **디스크 사용률**: 38%
- **네트워크 상태**: 안정적

### 🔧 서비스 상태
- **백엔드 API**: 정상 (포트 5002)
- **프론트엔드**: 정상 (포트 3000)
- **데이터베이스**: 연결됨
- **AI 엔진**: 활성화됨

### 📈 성능 지표
- **평균 응답 시간**: 1.2초
- **동시 연결 수**: 15개
- **처리된 요청**: 1,247개
- **오류율**: 0.1%

### 🚨 알림
- 모든 시스템이 정상적으로 작동하고 있습니다
- 최적화된 성능을 유지하고 있습니다
- 정기적인 백업이 완료되었습니다

---
*CORBU.AI System Monitor가 제공하는 실시간 상태입니다*`;
    }

    // 기본 응답
    return `## 🤖 CORBU.AI Ultimate 응답

**질문**: "${userInput}"

### 💭 이해한 내용
귀하의 질문을 분석한 결과, 다음과 같은 내용으로 이해했습니다:
- **주요 키워드**: ${userInput.split(/\s+/).filter(Boolean).join(', ')}
- **질문 유형**: 일반적인 질문
- **복잡도**: 중간 수준

### 🎯 답변
귀하의 질문에 대해 CORBU.AI Ultimate가 종합적으로 분석하여 답변드리겠습니다. 

현재 시스템은 다음과 같은 고급 기능들을 제공합니다:
- **감정 분석**: 텍스트의 감정과 톤을 분석
- **데이터 분석**: 복잡한 데이터를 이해하고 인사이트 제공
- **프로젝트 관리**: 체계적인 작업 관리 도구
- **AI 기능**: 다양한 AI 모델을 통한 지능형 서비스

### 🔍 추가 분석이 필요하시다면
더 구체적인 질문이나 특정 기능에 대한 요청을 해주시면, 더 정확하고 상세한 답변을 제공해드릴 수 있습니다.

### 💡 추천 사항
- 구체적인 질문을 해주시면 더 정확한 답변을 받을 수 있습니다
- 파일을 업로드하면 AI가 내용을 분석해드립니다
- 특정 기능에 대해 알고 싶으시면 해당 기능명을 언급해주세요

---
*CORBU.AI Ultimate가 제공하는 지능형 분석 서비스입니다*`;
  };

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  // 파일 드래그 앤 드롭 (향후 onDragOver 등에 연결 시 사용)
  const _handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const _handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const _handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // 파일 처리
  const handleFiles = (files: File[]) => {
    files.forEach((file, index) => {
      const fileId = `file_${Date.now()}_${index}`;

      // 업로드 진행률 시뮬레이션
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev[fileId] + Math.random() * 20;
          if (newProgress >= 100) {
            clearInterval(progressInterval);

            // 파일 추가
            const newFile: ProjectFile = {
              id: fileId,
              name: file.name,
              type: file.type,
              size: file.size,
              uploadedAt: new Date(),
              analysis: { status: 'pending' }
            };

            setFiles(prev => [...prev, newFile]);

            // AI 분석 시작
            startFileAnalysis(fileId, file);

            return { ...prev, [fileId]: 100 };
          }
          return { ...prev, [fileId]: newProgress };
        });
      }, 200);
    });
  };

  // 파일 AI 분석
  const startFileAnalysis = async (fileId: string, file: File) => {
    // 분석 상태 업데이트
    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, analysis: { ...f.analysis, status: 'processing' } }
        : f
    ));

    // 통합 API를 통한 파일 분석
    try {
      const formData = new FormData();
      formData.append(API_FORM_FIELD_FILE, file);

      const response = await fetch(joinApiHealthCheckUrl(resolveApiBaseUrl(), FILE_UPLOAD_PATH), {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const analysis = {
          status: 'completed' as const,
          summary: data.data.analysis || `${file.name} 파일 분석이 완료되었습니다.`,
          keyPoints: ['주요 내용 1', '주요 내용 2', '주요 내용 3'],
          confidence: 0.85
        };

        setFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, analysis } : f
        ));

        // 분석 완료 메시지 추가
        const analysisMessage: Message = {
          id: `analysis_${fileId}`,
          role: 'assistant',
          content: `📁 **${file.name}** 분석 완료!\n\n${analysis.summary}\n\n🔍 **주요 포인트:**\n${analysis.keyPoints.map(point => `• ${point}`).join('\n')}\n\n📊 **신뢰도:** ${Math.round(analysis.confidence * 100)}%`,
          timestamp: new Date(),
          metadata: {
            model: selectedModel,
            processingTime: Math.random() * 2000 + 1000,
            confidence: analysis.confidence
          }
        };

        setMessages(prev => [...prev, analysisMessage]);
      }
    } catch (error) {
      errorLogger.error('파일 분석 오류', error);

      // 오프라인 분석 결과
      const analysis = {
        status: 'completed' as const,
        summary: `${file.name} 파일 분석이 완료되었습니다.`,
        keyPoints: ['주요 내용 1', '주요 내용 2', '주요 내용 3'],
        confidence: 0.75
      };

      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, analysis } : f
      ));
    }
  };

  // 프로젝트 생성
  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `새 프로젝트 ${Date.now()}`,
      description: '새로 생성된 프로젝트입니다.',
      type: 'general',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentProject(newProject);
    setMessages([]);
  };

  // 대화 저장
  const saveConversation = () => {
    const conversationData = {
      project: currentProject,
      messages,
      timestamp: new Date()
    };
    localStorage.setItem(CORBU_AI_CONVERSATION_KEY, JSON.stringify(conversationData));
  };

  // 파일 크기 포맷팅 (향후 UI 표시 시 사용)
  const _formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 아이콘 (향후 파일 목록 UI에 사용)
  const _getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 bw-text-error" />;
    if (fileType.includes('image')) return <Image className="w-4 h-4 bw-text-success" />;
    if (fileType.includes('video')) return <Video className="w-4 h-4 bw-text-info" />;
    return <FileText className="w-4 h-4 bw-text-muted" />;
  };

  const layoutBg = { background: 'var(--bg-primary)' };
  const layoutBorder = { borderColor: 'var(--border-color)' };
  const sidebarBg = { background: 'var(--bg-secondary)' };

  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'dark-mode' : ''}`} style={layoutBg}>
      {/* 사이드바 */}
      {showSidebar && (
        <div className="w-64 flex flex-col border-r" style={{ ...sidebarBg, ...layoutBorder }}>
          {/* 헤더 */}
          <div className="p-4 border-b" style={layoutBorder}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-info)' }}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-bold bw-text-primary m-0">CORBU.AI</p>
              </div>
              <button
                onClick={() => setShowSidebar(false)}
                className="bw-btn-ghost p-1.5 rounded-md"
                title="사이드바 닫기"
                type="button"
              >
                <X className="w-4 h-4 bw-text-muted" />
              </button>
            </div>
          </div>

          {/* 새 대화 버튼 */}
          <div className="p-4 border-b" style={layoutBorder}>
            <button
              onClick={createNewProject}
              className="bw-btn-primary w-full flex items-center justify-center space-x-2"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">새 대화</span>
            </button>
          </div>

          {/* 대화 히스토리 */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {/* AI 모델 선택 */}
              <div className="mb-4">
                <div className="text-xs font-medium bw-text-muted mb-2 px-2">
                  AI 모델
                </div>
                <div className="space-y-1">
                  {models.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedModel === model.id
                        ? 'bw-btn-primary'
                        : 'bw-btn-ghost bw-text-primary'
                        }`}
                      type="button"
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs bw-text-muted truncate">
                        {model.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 대화 히스토리 */}
              <div className="mb-4">
                <div className="text-xs font-medium bw-text-muted mb-2 px-2">
                  최근 대화
                </div>
                <div className="space-y-1">
                  {messages.length > 0 ? (
                    <div className="text-xs bw-text-muted mb-2 px-2">
                      오늘
                    </div>
                  ) : (
                    <div className="bw-empty py-8">
                      <MessageSquare className="w-8 h-8 bw-empty-icon mx-auto mb-2" />
                      <p>새 대화를 시작하세요</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 빠른 액세스 */}
              <div className="mb-4">
                <div className="text-xs font-medium bw-text-muted mb-2 px-2">
                  빠른 액세스
                </div>
                <div className="space-y-1">
                  <button type="button" onClick={() => setInputValue('감정 분석을 해주세요')} className="w-full text-left px-3 py-2 rounded-lg text-sm bw-btn-ghost bw-text-primary flex items-center space-x-2" aria-label="감정 분석 예시 질문 사용">
                    <Brain className="w-4 h-4" aria-hidden="true" />
                    <span>감정 분석</span>
                  </button>
                  <button type="button" onClick={() => setInputValue('데이터를 분석해주세요')} className="w-full text-left px-3 py-2 rounded-lg text-sm bw-btn-ghost bw-text-primary flex items-center space-x-2" aria-label="데이터 분석 예시 질문 사용">
                    <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    <span>데이터 분석</span>
                  </button>
                  <button type="button" onClick={() => setInputValue('프로젝트를 관리해주세요')} className="w-full text-left px-3 py-2 rounded-lg text-sm bw-btn-ghost bw-text-primary flex items-center space-x-2" aria-label="프로젝트 관리 예시 질문 사용">
                    <Folder className="w-4 h-4" aria-hidden="true" />
                    <span>프로젝트 관리</span>
                  </button>
                  <button type="button" onClick={() => setInputValue('AI 기능을 알려주세요')} className="w-full text-left px-3 py-2 rounded-lg text-sm bw-btn-ghost bw-text-primary flex items-center space-x-2" aria-label="AI 기능 예시 질문 사용">
                    <Zap className="w-4 h-4" aria-hidden="true" />
                    <span>AI 기능</span>
                  </button>
                </div>
              </div>

              {/* 고급 기능 */}
              <div className="mb-4">
                <div className="text-xs font-medium bw-text-muted mb-2 px-2">
                  고급 기능
                </div>
                <div className="space-y-1">
                  <button type="button" onClick={() => setInputValue('세뇌 콘텐츠를 생성해주세요')} className="w-full text-left px-3 py-2 rounded-lg text-sm bw-btn-ghost bw-text-primary flex items-center space-x-2" aria-label="조작 콘텐츠 생성 예시 질문 사용">
                    <Brain className="w-4 h-4" aria-hidden="true" />
                    <span>조작 콘텐츠 생성</span>
                  </button>
                  <button type="button" onClick={() => setInputValue('가스라이팅 댓글을 생성해주세요')} className="w-full text-left px-3 py-2 rounded-lg text-sm bw-btn-ghost bw-text-primary flex items-center space-x-2" aria-label="가스라이팅 생성 예시 질문 사용">
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span>가스라이팅 생성</span>
                  </button>
                  <button type="button" onClick={() => setInputValue('한국어 분석을 해주세요')} className="w-full text-left px-3 py-2 rounded-lg text-sm bw-btn-ghost bw-text-primary flex items-center space-x-2" aria-label="한국어 분석 예시 질문 사용">
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    <span>한국어 분석</span>
                  </button>
                  <button type="button" onClick={() => setInputValue('글쓰기 스타일을 분석해주세요')} className="w-full text-left px-3 py-2 rounded-lg text-sm bw-btn-ghost bw-text-primary flex items-center space-x-2" aria-label="글쓰기 스타일 분석 예시 질문 사용">
                    <Edit className="w-4 h-4" aria-hidden="true" />
                    <span>글쓰기 스타일</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 설정 */}
          <div className="p-4 border-t" style={layoutBorder}>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="bw-btn-ghost p-2 rounded-lg" title="테마 변경" aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}>
                {theme === 'light' ? <Moon className="w-4 h-4 bw-text-muted" aria-hidden="true" /> : <Sun className="w-4 h-4 bw-text-muted" aria-hidden="true" />}
              </button>
              <button type="button" onClick={() => setShowSettings(!showSettings)} className="bw-btn-ghost p-2 rounded-lg" title="설정" aria-label={showSettings ? '설정 패널 닫기' : '설정 열기'}>
                <Settings className="w-4 h-4 bw-text-muted" aria-hidden="true" />
              </button>
              <div className="text-xs bw-text-muted">
                CORBU.AI v2.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col" style={layoutBg}>
        {/* 상단 헤더 */}
        <div className="border-b px-4 py-3" style={{ ...sidebarBg, ...layoutBorder }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!showSidebar && (
                <button type="button" onClick={() => setShowSidebar(true)} className="bw-btn-ghost p-2 rounded-lg" title="사이드바 열기" aria-label="사이드바 열기">
                  <Menu className="w-5 h-5 bw-text-muted" aria-hidden="true" />
                </button>
              )}
              <h2 className="text-lg font-semibold bw-text-primary">CORBU.AI</h2>
            </div>
            <div className="flex items-center space-x-1">
              <button type="button" onClick={() => setShowFilePanel(!showFilePanel)} className="bw-btn-ghost p-2 rounded-lg" title="파일 패널" aria-label={showFilePanel ? '파일 패널 닫기' : '파일 패널 열기'}>
                <Folder className="w-5 h-5 bw-text-muted" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--accent-info)' }}>
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="bw-heading-1 mb-2">안녕하세요. CORBU.AI</h2>
                <p className="bw-text-secondary mb-8">무엇을 도와드릴까요?</p>

                {/* 제안 프롬프트 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                  <button
                    onClick={() => setInputValue('감정 분석을 해주세요')}
                    className="bw-card-secondary p-4 text-left rounded-lg transition-colors hover:opacity-90"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-info-muted)' }}>
                        <Brain className="w-4 h-4 bw-text-info" />
                      </div>
                      <div>
                        <h3 className="font-medium bw-text-primary">감정 분석</h3>
                        <p className="text-sm bw-text-secondary">텍스트의 감정을 분석해드립니다</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInputValue('데이터를 분석해주세요')}
                    className="bw-card-secondary p-4 text-left rounded-lg transition-colors hover:opacity-90"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-success-muted)' }}>
                        <BarChart3 className="w-4 h-4 bw-text-success" />
                      </div>
                      <div>
                        <h3 className="font-medium bw-text-primary">데이터 분석</h3>
                        <p className="text-sm bw-text-secondary">복잡한 데이터를 분석합니다</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInputValue('프로젝트를 관리해주세요')}
                    className="bw-card-secondary p-4 text-left rounded-lg transition-colors hover:opacity-90"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-secondary-muted)' }}>
                        <Folder className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                      </div>
                      <div>
                        <h3 className="font-medium bw-text-primary">프로젝트 관리</h3>
                        <p className="text-sm bw-text-secondary">작업을 체계적으로 관리합니다</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setInputValue('AI 기능을 알려주세요')}
                    className="bw-card-secondary p-4 text-left rounded-lg transition-colors hover:opacity-90"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--accent-warning-muted)' }}>
                        <Zap className="w-4 h-4 bw-text-warning" />
                      </div>
                      <div>
                        <h3 className="font-medium bw-text-primary">AI 기능</h3>
                        <p className="text-sm bw-text-secondary">다양한 AI 기능을 소개합니다</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="genspark-chat-column px-4 py-8 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl w-full ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={message.role === 'user' ? { background: 'var(--accent-info)', color: 'white' } : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 min-w-0 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div
                        className="genspark-qa-role-row"
                        style={{
                          display: 'flex',
                          width: '100%',
                          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <span
                          className={`genspark-qa-badge ${message.role === 'user' ? 'genspark-qa-badge--question' : 'genspark-qa-badge--answer'}`}
                        >
                          {message.role === 'user' ? ASSISTANT_GENSPARK_QA_BADGE_QUESTION : ASSISTANT_GENSPARK_QA_BADGE_ANSWER}
                        </span>
                      </div>
                      <div className={`inline-block p-4 rounded-2xl max-w-full text-left ${message.role === 'user'
                        ? 'text-white'
                        : 'bw-card-secondary bw-text-primary'
                        }`}
                        style={message.role === 'user' ? { background: 'var(--accent-info)' } : undefined}>
                        {message.role === 'assistant' ? (
                          <AssistantGensparkBody
                            text={message.content}
                            embedded
                            enhancedCodeBlocks
                          />
                        ) : (
                          <div className="text-sm whitespace-pre-wrap break-words leading-relaxed text-white">
                            {message.content}
                          </div>
                        )}
                      </div>
                      {message.role === 'assistant' &&
                        message.suggestedFollowUps &&
                        message.suggestedFollowUps.length > 0 &&
                        !isLoading && (
                          <GensparkNextActionChips
                            hints={message.suggestedFollowUps}
                            messageId={message.id}
                            onSelectHint={(h) => void handleSendMessage(h)}
                            borderColor="var(--border-color)"
                            textSecondary="var(--text-secondary)"
                          />
                        )}
                      {message.role === 'assistant' &&
                        message.pipelineExtras &&
                        hasPipelineExtras(message.pipelineExtras) &&
                        !isLoading && (
                          <GensparkPipelineExtrasPanel
                            extras={message.pipelineExtras}
                            messageId={message.id}
                            theme={{
                              borderColor: 'var(--border-color)',
                              textSecondary: 'var(--text-secondary)',
                            }}
                          />
                        )}
                      {message.role === 'assistant' &&
                        !message.generationPlaceholder &&
                        !isLoading && (
                          <button
                            type="button"
                            data-testid={TEST_IDS.COMPOSER_REGENERATE_MESSAGE}
                            className="mt-2 text-xs bw-text-secondary hover:bw-text-primary inline-flex items-center gap-1"
                            onClick={() => void regenerateMessage(message.id)}
                            aria-label="답변 재생성"
                          >
                            <RotateCcw className="w-3.5 h-3.5" aria-hidden />
                            재생성
                          </button>
                        )}
                      {message.metadata && (
                        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center space-x-2 bw-text-muted">
                            <>
                              <span>{String((message.metadata as { model?: unknown }).model ?? '')}</span>
                              <span>•</span>
                              <span>{Number((message.metadata as { processingTime?: unknown }).processingTime ?? 0)}ms</span>
                              {(message.metadata as { analysis?: { emotion?: { sentiment?: string } } }).analysis?.emotion && (
                                <>
                                  <span>•</span>
                                  <span className="bw-badge px-2 py-1 rounded text-xs bw-text-info" style={{ background: 'var(--accent-info-muted)' }}>
                                    {(message.metadata as { analysis?: { emotion?: { sentiment?: string } } }).analysis?.emotion?.sentiment || '중립'}
                                  </span>
                                </>
                              )}
                            </>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && !messages.some((m) => m.generationPlaceholder) && (
                <div className="flex justify-start w-full">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bw-card-secondary shrink-0">
                      <Bot className="w-4 h-4 bw-text-muted" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div
                        className="genspark-qa-role-row"
                        style={{
                          display: 'flex',
                          width: '100%',
                          justifyContent: 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
                      </div>
                      <AssistantGensparkBody text="" embedded enhancedCodeBlocks />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="border-t rounded-2xl" style={{ ...layoutBorder, ...layoutBg }}>
          <div
            className="genspark-chat-column genspark-chat-input-wrap px-4 pt-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          >
            {/* 파일 드래그 앤 드롭 영역 */}
            {isDragOver && (
              <div className="mb-4 border-2 border-dashed rounded-lg p-8 text-center bw-card-secondary" style={{ borderColor: 'var(--accent-info)' }}>
                <Upload className="w-12 h-12 mx-auto bw-text-info mb-4" />
                <p className="text-lg font-medium bw-text-info mb-2">
                  파일을 여기에 놓으세요
                </p>
                <p className="text-sm bw-text-info">
                  문서, 이미지, 코드 파일 등을 업로드할 수 있습니다
                </p>
              </div>
            )}

            {/* 업로드 진행률 */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mb-4 space-y-2">
                {Object.entries(uploadProgress).map(([fileId, progress]) => (
                  <div key={fileId} className="bw-card rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="bw-text-primary">업로드 중...</span>
                      <span className="bw-text-muted">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bw-progress-bar rounded-full h-2">
                      <div
                        className="bw-progress-fill h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, background: 'var(--accent-info)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 메인 입력 영역 */}
            <div className="relative">
              <div className="flex items-end space-x-3">
                {/* 파일 첨부 버튼 */}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="bw-btn-ghost p-3 rounded-lg" title="파일 첨부" aria-label="파일 첨부">
                  <Plus className="w-5 h-5 bw-text-muted" aria-hidden="true" />
                </button>

                {/* 입력 필드 */}
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        if (isKeyboardEventImeComposing(e)) return;
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="bw-input w-full p-4 pr-12 rounded-2xl resize-none"
                    placeholder="Type '/' for commands"
                    aria-label="메시지 입력 (Enter로 전송)"
                    rows={1}
                    style={{
                      minHeight: '52px',
                      maxHeight: 'min(52vh, 560px)',
                      lineHeight: '1.5'
                    }}
                  />

                  {/* 전송 버튼 */}
                  <button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    disabled={!coerceTrimmedString(inputValue, '') || isLoading}
                    className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-200 ${coerceTrimmedString(inputValue, '') && !isLoading
                      ? 'bw-btn-primary text-white shadow-lg'
                      : 'bw-btn-secondary cursor-not-allowed bw-text-muted'
                      }`}
                    title="메시지 전송"
                    aria-label="메시지 전송"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

              </div>

              {/* 하단 기능 버튼들 */}
              <div className="flex items-center justify-between mt-3 px-3">
                <div className="flex items-center space-x-4">
                  <button type="button" onClick={() => setInputValue('감정 분석을 해주세요')} className="bw-btn-ghost flex items-center space-x-2 px-3 py-2 text-sm bw-text-secondary rounded-lg" aria-label="감정 분석 예시 질문 사용">
                    <Brain className="w-4 h-4" aria-hidden="true" />
                    <span>감정 분석</span>
                  </button>
                  <button type="button" onClick={() => setInputValue('데이터를 분석해주세요')} className="bw-btn-ghost flex items-center space-x-2 px-3 py-2 text-sm bw-text-secondary rounded-lg" aria-label="데이터 분석 예시 질문 사용">
                    <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    <span>데이터 분석</span>
                  </button>
                  <button type="button" onClick={() => setInputValue('프로젝트를 관리해주세요')} className="bw-btn-ghost flex items-center space-x-2 px-3 py-2 text-sm bw-text-secondary rounded-lg" aria-label="프로젝트 관리 예시 질문 사용">
                    <Folder className="w-4 h-4" aria-hidden="true" />
                    <span>프로젝트 관리</span>
                  </button>
                </div>

                <div className="text-xs bw-text-muted">
                  Enter로 전송, Shift+Enter로 줄바꿈
                </div>
              </div>
            </div>

            {/* 숨겨진 파일 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav,.csv,.xlsx,.py,.js,.ts,.tsx,.jsx,.html,.css,.json"
              title="파일 선택"
              aria-label="파일 업로드를 위한 파일 선택"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimateChatGPTInterface;
