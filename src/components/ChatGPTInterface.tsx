import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { projectService } from '../services/projectService';
import type { ProjectFile, ProjectLearningSource } from '../types/project';
import projectShareService from '../services/projectShareService';
import LoadingSkeleton from './LoadingSkeleton';
import { WelcomeWorkspacePanel } from './WelcomeWorkspacePanel';
import { ChatInputDock } from './ChatInputDock';
import {
  WorkspaceQueryComposer,
  type ComposerResponseModeUi,
  type WorkspaceQueryComposerHandle,
} from './WorkspaceQueryComposer';
import { readComposerAttachmentsForSend } from '../utils/composerAttachmentPayload';
import { buildComposerMultiRequestProgressState } from '../utils/composerMultiRequestProgress';
import {
    buildSequentialMultiRequestItemContext,
    runComposerSequentialMultiRequestStream,
} from '../utils/runComposerSequentialMultiRequestStream';
import { runComposerSequentialMultiRequestNonStream } from '../utils/runComposerSequentialMultiRequestNonStream';
import { runComposerMultiStepMultiRequest } from '../utils/runComposerMultiStepMultiRequest';
import {
    createComposerSequentialItemOutboundBuilder,
    getComposerSequentialSendFlags,
} from '../utils/composerSequentialSend';
import { ComposerMultiRequestChecklist } from './ComposerMultiRequestChecklist';
import { errorLogger } from '../utils/errorLogger';
import {
    newConversationDeepseekDefaults,
    normalizeConversationDeepseekFlagsFromStorage,
    resolveDeepseekFlagsForConversation,
} from '../config/deepseekUiDefaults';
import {
    API_BASE_URL,
    API_ENDPOINTS,
    FIGMA_BRAINWAVE_AI_UI_KIT_CHAT_URL,
} from '../config/api';
import {
    AGENTS_PATH,
    AGENTS_QUERY_PARAM_ID,
    BILLING_PATH,
    DOCS_PATH,
    INTEGRATIONS_PATH,
    MARKETING_HOME_COMPOSER_AUTOSEND_STATE_KEY,
    MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY,
    CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY,
    CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY,
    CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY,
    CONVERSATION_GRAPH_PATH,
    navigationConfig,
    SETTINGS_PATH,
} from '../config/routes';
import { getStandaloneChatPath, isGensparkPrimaryExperience, isMarketingDraftEligiblePath, isStandaloneChatPath } from '../config/uiPreferences';
import { mergeConversationGraphCreateIntentIntoChatContext } from '../views/conversationGraphChatContextEnhancer';
import {
  generateGraphAnswerViaChat,
  GRAPH_ANSWER_CONTEXT_FLAG,
  resolveUnifiedChatGraphOutboundMessage,
} from '../views/conversationGraphAnswerGeneration';
import {
  finalizeComposerContextForGraphChat,
  isConversationGraphComposerContext,
} from '../views/conversationGraphComposerSend';
import { isCreateGraphAnswerRequest } from '../views/conversationGraphAnswerIntent';
import { buildConversationGraphPasteNavState } from '../views/conversationGraphNavigateHandoff';
import { isStreamingSupported, streamChatMessage } from '../utils/streamingClient';
import { analyzeGuidelines, getGuidelineQualityTrend, parseGuideline } from '../utils/guidelineQuality';
import {
    buildMergedFeatureContextFromInputAndAttachments,
    buildKoreanProfileSourceStringForChat,
    extractResponseContent,
    extractPipelineFollowUpsFromChatResponse,
    extractPipelineMessageExtrasFromChatResponse,
    parsePipelineFollowUpHints,
    parsePipelineMessageExtras,
    hasPipelineExtras,
    parseQuestionRequirementSections,
    shouldTreatAsStructuredQuestionRequirements,
    truncateStructuredInputPreviewLine,
    shouldUseDualKeywordQuestionRequirementsPreset,
    shouldOmitComposerDiversityDirectiveBlock,
    userInputAlreadyContainsFullComposerInstructionBlock,
    shouldClearOutboundStepUiCarryoverOnThreadIdChange,
    detectColumnStyleIntent,
    cleanResponseText,
    coerceTrimmedString,
    coerceTrimmedEnd,
    clearControlledTextareaAfterCommit,
    isKeyboardEventImeComposing,
    CONCISE_CONVERSATION_TITLE_MAX_LEN,
    getConciseConversationTitleFromUserInput,
    conversationListTitleFromUserMessage,
    resolveListTitleAfterAssistantReply,
    isAssistantGenerationPlaceholder,
    isAssistantGenerationStepUi,
    getAssistantGenerationPhase,
    mapStreamMetadataToAssistantGenerationPhase,
    patchAssistantBodyFromStreamMetadata,
    mergePipelineMessageExtras,
    STORED_ASSISTANT_INCOMPLETE_NOTICE,
    ASSISTANT_PLACEHOLDER_ANALYZING,
    ASSISTANT_PLACEHOLDER_THINKING,
    ASSISTANT_PLACEHOLDER_OUTLINE,
    ASSISTANT_PLACEHOLDER_DRAFT,
    ASSISTANT_PLACEHOLDER_CROSSCHECK,
    ASSISTANT_PLACEHOLDER_VERIFY,
    ASSISTANT_PLACEHOLDER_RETRY_NONSTREAM,
    ASSISTANT_GENSPARK_QA_BADGE_QUESTION,
    ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
    scheduleAssistantPreRevealStreamPhases,
    scheduleClientStreamingPipelinePhases,
    computeAssistantPipelineDurationMultiplier,
    pipelineBenchmarkPacingFromChatContext,
    startAssistantNonStreamLoadingTimeline,
    runAssistantNonStreamPostResponsePhases,
    assistantGensparkStepUiFromUserMessage,
    userMessageHasAttachmentChatHint,
    getComposerGenerationCaption,
    type AssistantGenerationPhase,
} from '../utils/chatInputUtils';
import {
    CHAT_PERSPECTIVES,
    CHAT_PERSPECTIVE_LABEL_KO,
    CHAT_RESPONSE_STYLES,
    CHAT_RESPONSE_STYLE_LONG_KO,
    CHAT_RESPONSE_STYLE_SHORT_KO,
    type ChatPerspectiveUi,
    type ChatResponseStyleUi,
} from '../utils/modernChatUrlStyle';
import {
    type AnswerDiversityMode,
    buildChatGptNonStreamPostPayload,
    buildComposerNonStreamChatExtras,
    buildComposerStreamChatRequestBody,
} from '../utils/chatGptComposerPayload';
import {
    AssistantGensparkBody,
    GensparkGenerationStatus,
    GensparkPipelineExtrasPanel,
    GensparkNextActionChips,
} from './genspark';
import {
    buildGenreControlProfile,
    buildKoreanUnderstandingInstructionBlock,
    buildKoreanUnderstandingProfile,
    containsHangul,
    extractPriorTurnsForKoContext,
} from '../utils/koreanUnderstandingLayer';
import { IconUpload, IconShare, IconEdit, IconFile, IconSettings, IconTrash } from './Icons/BrainwaveIcons';
import advancedAPIService from '../services/advancedAPIService';
import { AVAILABLE_CAPABILITIES_HINT, ADAPT_ANSWER_TO_REQUEST_INSTRUCTION } from '../services/generationPromptBuilder';
import {
    mergeGensparkRouteContextIntoRecordIfMissing,
    resolveGensparkAgentForRoute,
} from '../services/gensparkAgentRegistry';
import {
    scenarioInheritMergeOptionsFromPipelineLikeMessages,
    toChatTurnWithPipelineExtras,
    type MergeApiChatContextPayloadOptions,
} from '../services/modernChatContextBuilder';
import {
  buildComposerPipelineContextAppend,
  buildComposerPipelineMerge,
} from '../utils/composerAssistantTurnFinalize';
import { resolveComposerRegenerateUserTurn } from '../utils/composerRegenerateTurn';
import notebookLLMDeepLearningIntegration, { buildMessageToSendForChat } from '../services/notebookLLMDeepLearningIntegration';
import advancedConversationMemoryService from '../services/advancedConversationMemoryService';
import { maybeCompactMultilayerStyleHintForChatContext } from '../services/multiLayerStyleAnalysisSystem';
import { TEST_IDS } from '../constants/testIds';
import {
  WORKSPACE_CHAT_EMPTY_THREAD_PLACEHOLDER,
  WORKSPACE_COMPOSER_PLACEHOLDER,
  WORKSPACE_TAGLINE_QUERY_SNIPPET,
  WORKSPACE_WELCOME_SUGGESTION_CHIPS,
} from '../constants/workspaceHomeCopy';
import {
  shouldSuppressWorkspaceProjectCreate,
  type WorkspaceProjectCreateToolResult,
} from '../utils/workspaceProjectCreateGuard';
import {
  mergeAssistantPipelineExtrasForTurn,
  mergeStreamCompletionText,
  resolveAssistantAnswerDisplayText,
  shouldUseComposerStreamPreReveal,
  shouldUseSimpleComposerOutboundMessage,
} from '../utils/composerStreamResponseText';
import {
  applyComposerSelfDevelopIfEnabled,
  buildComposerSelfDevelopContextFlags,
  mergeSelfDevelopLessonsIntoContext,
} from '../utils/composerAnswerSelfDevelopment';
import { COLUMN_QUALITY_INSTRUCTION } from '../constants/sampleColumnResult';
import { showToast } from '../utils/toast';
import {
    DEFAULT_CHAT_POST_AXIOS_OPTIONS,
    DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
    postChatAxiosWithFallback,
} from '../utils/apiClient';
import {
    CHATGPT_COMPOSER_RESPONSE_MODE_STORAGE_KEY,
    CHATGPT_CONVERSATION_REMOVED_EVENT,
    CHATGPT_CONVERSATIONS_STORAGE_KEY,
    CHATGPT_PROJECTS_STORAGE_KEY,
    CHATGPT_SHOW_TIMESTAMPS_STORAGE_KEY,
    CHATGPT_THEME_STORAGE_KEY,
    SIDEBAR_CHATS_UPDATED_EVENT,
} from '../services/chatGptUiStorageKeys';
import { notifyLocalChatConversationsMutated } from '../services/chatgptConversationsLocalNotify';
import './ChatGPTInterface.css';

function readInitialComposerResponseMode(): ComposerResponseModeUi {
    try {
        const v = localStorage.getItem(CHATGPT_COMPOSER_RESPONSE_MODE_STORAGE_KEY);
        if (v === 'concise' || v === 'detailed' || v === 'auto') return v;
    } catch {
        /* ignore */
    }
    return 'detailed';
}


const NotebookLLM = React.lazy(() => import('./NotebookLLM'));
const ProjectEditModal = React.lazy(() => import('./ProjectManagement/ProjectEditModal'));
const AddSourceModal = React.lazy(() => import('./ProjectManagement/AddSourceModal'));
const GoogleDriveNotebookImportDialog = React.lazy(
    () => import('./ProjectManagement/GoogleDriveNotebookImportDialog'),
);
const ProjectShareDialog = React.lazy(() => import('./ProjectShareDialog'));

/** 개발/프로덕션에서는 `CHAT_POST_PATH`/llm-status(`API_ENDPOINTS.LLM_STATUS`) 미요청(404 방지). 테스트에서만 요청. */
const RUN_LLM_STATUS_FETCH = process.env.NODE_ENV === 'test';

/** 고급 대화 메모리: 턴 기록 + 다음 요청에 `advanced_memory_context` 주입 — `REACT_APP_ADVANCED_MEMORY_CONTEXT=true` */
const REACT_APP_ADVANCED_MEMORY_CONTEXT = process.env.REACT_APP_ADVANCED_MEMORY_CONTEXT === 'true';
const ADVANCED_MEMORY_USER_ID = 'corbu-local';

function recordAdvancedMemoryTurn(sessionId: string, userInput: string, aiResponse: string): void {
    if (!REACT_APP_ADVANCED_MEMORY_CONTEXT) return;
    const u = coerceTrimmedString(userInput, '');
    const a = coerceTrimmedString(aiResponse, '');
    if (!u || !a) return;
    void advancedConversationMemoryService.addConversationEntry(
        ADVANCED_MEMORY_USER_ID,
        sessionId,
        u,
        a,
        undefined,
        undefined
    );
}

/** 대화에서 사용 가능한 슬래시 명령어 (질문 입력 시 해당 기능으로 답변 생성) */

function getSelectedSourceIds(projectId: string): string[] | null {
  try {
    const raw = localStorage.getItem(`notebook-selected-sources-${projectId}`);
    if (raw === null) return null;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Invalid Date 방지: 값이 없거나 파싱 실패 시 현재 시각 반환 */
function safeDate(value: unknown): Date {
  if (value instanceof Date) return isNaN(value.getTime()) ? new Date() : value;
  if (value == null || value === '') return new Date();
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? new Date() : d;
}

/** 날짜가 유효할 때만 포맷, 아니면 fallback 문자열 반환 (Invalid Date / null / undefined 방지) */
function _formatHistoryTime(date: Date | string | number | null | undefined): string {
  if (date == null || date === '') return '';
  const d = typeof date === 'object' && date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatDateSafe(date: Date | string | number | null | undefined, formatter: (d: Date) => string, fallback = '—'): string {
  if (date == null || date === '') return fallback;
  try {
    const d = date instanceof Date ? date : new Date(date as string | number);
    if (isNaN(d.getTime())) return fallback;
    return formatter(d);
  } catch {
    return fallback;
  }
}

/** 프로젝트 파일·지침 맥락: 대화 시 참고 파일·프로젝트 지침을 context에 포함 */
function buildChatContext(
  project: {
    id: string;
    name: string;
    files?: Array<{ name: string; type: string; size?: number }>;
    webSources?: Array<{ type: 'document' | 'video'; url: string; title?: string }>;
    instructions?: string;
    initialGuidelines?: string[];
  } | null,
  extra?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!project) return extra ?? undefined;
  const safeProjectName = typeof project.name === 'string' && project.name.length > 100
      ? project.name.slice(0, 100)
      : project.name;
  const ctx: Record<string, unknown> = { projectId: project.id, projectName: safeProjectName, ...extra };
  const ids = getSelectedSourceIds(project.id);
  if (ids !== null) ctx.source_ids = ids;
  if (project.files?.length) {
    ctx.project_files = project.files.map((f) => ({ name: f.name, type: f.type, size: f.size }));
  }
  if (project.webSources?.length) {
    ctx.project_web_sources = project.webSources.map((s) => ({
      type: s.type,
      url: s.url,
      title: s.title,
    }));
    ctx.project_web_learning_instruction = '등록된 웹 문서/영상 소스를 우선 참고해 답변하고, 주장마다 가능한 범위에서 근거 URL을 함께 제시하세요.';
  }
  const instr = typeof project.instructions === 'string' ? coerceTrimmedString(project.instructions, '') : '';
  if (instr) {
    ctx.project_instructions = instr;
  }
  if (Array.isArray(project.initialGuidelines) && project.initialGuidelines.length > 0) {
    const quality = analyzeGuidelines(project.initialGuidelines);
    const structuredGuidelines = project.initialGuidelines
      .map((raw) => parseGuideline(raw))
      .filter((g) => !g.isEmpty)
      .map((g) => ({ priority: g.priority, content: g.content }));
    ctx.project_guidelines = structuredGuidelines;
    ctx.project_guideline_quality = {
      score: quality.qualityScore,
      status: quality.qualityStatus,
      required_count: quality.required,
      recommended_count: quality.recommended,
      untyped_count: quality.untyped,
      recommendations: quality.recommendations,
    };
  }
  return ctx;
}

type MessageReaction = 'like' | 'dislike' | null;

const MSG_EMOJI_REACTIONS = ['❤️', '😂', '😮', '🔥', '💯', '👏', '🎉', '😢'] as const;
type MsgEmojiReaction = typeof MSG_EMOJI_REACTIONS[number];

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    bookmarked?: boolean;
    pinned?: boolean;
    reaction?: MessageReaction;
    emojiReactions?: Partial<Record<MsgEmojiReaction, boolean>>;
    /** 캡처 기준: 응답 생성에 걸린 시간(ms). "Ns 동안 생각함 >" 표시용 */
    thinkingDurationMs?: number;
    /** 백엔드 파이프라인 next_actions — 칩 클릭 시 입력창으로 이어가기 */
    suggestedFollowUps?: string[];
    /** 블루프린트·trace·DeepSeek 비평 요약 (접기 UI) */
    pipelineExtras?: import('../utils/chatInputUtils').PipelineMessageExtras;
}

interface Project {
    id: string;
    name: string;
    description?: string;
    instructions?: string;
    initialGuidelines?: string[];
    tags?: string[];
    files?: Array<{ name: string; type: string; size?: number }>;
    webSources?: Array<{ id: string; type: 'document' | 'video'; url: string; title?: string; addedAt: Date }>;
    createdAt: Date;
    updatedAt: Date;
    source_count?: number;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    projectId?: string;
    /** `/agents?id=` 세션 전용 — 일반 대화 목록과 분리·복원 */
    gensparkAgentId?: string;
    /** 대화별 딥시크 파이프라인 — `undefined` 이면 전역 env 기본 */
    deepseekReviewHints?: boolean;
    pipelineDeepSeekRefine?: boolean;
    pipelineDeepSeekReasoner?: boolean;
    /** 이 대화에만 적용되는 지침 — 프로젝트 지침과 병행 시 API 컨텍스트에서 합쳐 전달 */
    threadInstructions?: string;
    /** 대화에 붙인 참고 파일(텍스트 추출 가능 형만 본문 포함) */
    threadFiles?: Array<{
        id: string;
        name: string;
        type: string;
        size?: number;
        textContent?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
    pinned?: boolean;
    tags?: string[];
}

const MAX_THREAD_CONTEXT_FILES = 6;
const MAX_THREAD_FILE_READ_BYTES = 400_000;
const MAX_THREAD_FILE_TEXT_CHARS = 120_000;

function buildConversationThreadContextPatch(
    conv: Pick<Conversation, 'threadInstructions' | 'threadFiles'> | null | undefined
): Record<string, unknown> | undefined {
    if (!conv) return undefined;
    const instr = coerceTrimmedString(conv.threadInstructions ?? '', '');
    const files = conv.threadFiles;
    const hasFiles = Array.isArray(files) && files.length > 0;
    if (!instr && !hasFiles) return undefined;
    const out: Record<string, unknown> = {};
    if (instr) {
        out.project_instructions = instr;
    }
    if (hasFiles) {
        out.project_files = files!.map((f) => ({
            name: f.name,
            type: f.type || 'application/octet-stream',
            size: f.size,
        }));
        const chunks = files!
            .map((f) => {
                const t = coerceTrimmedString(f.textContent ?? '', '');
                if (!t) return '';
                return `### 첨부: ${f.name}\n${t.slice(0, MAX_THREAD_FILE_TEXT_CHARS)}`;
            })
            .filter(Boolean);
        if (chunks.length) {
            out.thread_attached_file_contents = chunks.join('\n\n---\n\n');
        }
    }
    return out;
}

/** 이 대화에만 설정한 지침·스레드 첨부 파일이 있는지 — 프로젝트 없이도 파이프라인·parsed_input 트리거에 사용 */
function conversationHasThreadInstructionsOrFiles(
    conv: Pick<Conversation, 'threadInstructions' | 'threadFiles'> | null | undefined
): boolean {
    if (!conv) return false;
    if (coerceTrimmedString(conv.threadInstructions ?? '', '').length > 0) return true;
    return Array.isArray(conv.threadFiles) && conv.threadFiles.length > 0;
}

function mergeProjectAndThreadChatContext(
    projectCtx: Record<string, unknown> | undefined,
    conv: Conversation | null | undefined
): Record<string, unknown> | undefined {
    const threadPatch = buildConversationThreadContextPatch(conv ?? undefined);
    if (!projectCtx && !threadPatch) return undefined;
    const merged: Record<string, unknown> = { ...(projectCtx ?? {}), ...(threadPatch ?? {}) };
    const pInst =
        typeof projectCtx?.project_instructions === 'string' ? projectCtx.project_instructions : '';
    const tInst =
        typeof threadPatch?.project_instructions === 'string' ? threadPatch.project_instructions : '';
    if (pInst && tInst) {
        merged.project_instructions = `${pInst}\n\n---\n\n[이 대화 지침]\n${tInst}`;
    }
    const pFiles =
        projectCtx && Array.isArray(projectCtx.project_files) ? (projectCtx.project_files as unknown[]) : [];
    const tFiles =
        threadPatch && Array.isArray(threadPatch.project_files) ? (threadPatch.project_files as unknown[]) : [];
    if (pFiles.length + tFiles.length > 0) {
        merged.project_files = [...pFiles, ...tFiles];
    }
    const pTxt =
        typeof projectCtx?.thread_attached_file_contents === 'string'
            ? projectCtx.thread_attached_file_contents
            : '';
    const tTxt =
        typeof threadPatch?.thread_attached_file_contents === 'string'
            ? threadPatch.thread_attached_file_contents
            : '';
    if (pTxt && tTxt) {
        merged.thread_attached_file_contents = `${pTxt}\n\n---\n\n${tTxt}`;
    }
    return merged;
}

function mergeScenarioAndConversationDeepseek(
    scenario: MergeApiChatContextPayloadOptions | undefined,
    conv: Pick<
        Conversation,
        'deepseekReviewHints' | 'pipelineDeepSeekRefine' | 'pipelineDeepSeekReasoner'
    > | null
): MergeApiChatContextPayloadOptions | undefined {
    if (conv == null) return scenario;
    return {
        ...(scenario ?? {}),
        conversationDeepseek: {
            deepseekReviewHints: conv.deepseekReviewHints,
            pipelineDeepSeekRefine: conv.pipelineDeepSeekRefine,
            pipelineDeepSeekReasoner: conv.pipelineDeepSeekReasoner,
        },
    };
}

/** SSE 메타로 어시스턴트 슬롯 갱신 — 본문 스트리밍 중에도 `generation_phase`를 `pipelineExtras`에 반영 */
function patchAssistantMessageWithStreamMetadata(
    existingMsg: Message,
    meta: Record<string, unknown>,
): Message | null {
    const patch = patchAssistantBodyFromStreamMetadata(
        existingMsg.content,
        existingMsg.pipelineExtras,
        meta,
    );
    if (!patch) return null;
    return { ...existingMsg, content: patch.body, pipelineExtras: patch.pipelineExtras };
}

const ASSISTANT_GEN_PHASE_SLUGS: readonly AssistantGenerationPhase[] = [
    'analyze',
    'outline',
    'draft',
    'crosscheck',
    'verify',
    'retry',
];

function assistantPhaseFromPipelineExtrasSlug(slug: string | undefined): AssistantGenerationPhase | null {
    if (!slug || !coerceTrimmedString(slug, '')) return null;
    return (ASSISTANT_GEN_PHASE_SLUGS as readonly string[]).includes(slug) ? (slug as AssistantGenerationPhase) : null;
}

const GUIDELINE_ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

type OutputPreset = 'auto' | 'question-bank' | 'requirements' | 'minutes' | 'checklist' | 'risk-matrix';

interface WritingStyleLearningProfile {
    enabled: boolean;
    anchors: string[];
    learnedSignals: string[];
    snapshots: Array<{
        id: string;
        label: string;
        savedAt: string;
        anchors: string[];
        learnedSignals: string[];
    }>;
    updatedAt: string;
}

const OUTPUT_PRESET_STORAGE_KEY = 'chatgpt-output-preset-by-project';
const ANSWER_DIVERSITY_STORAGE_KEY = 'chatgpt-answer-diversity-by-project';
const WRITING_STYLE_LEARNING_STORAGE_KEY = 'chatgpt-writing-style-learning-by-project';
const STRUCTURED_INPUT_ASSIST_STORAGE_KEY = 'chatgpt-structured-input-assist-by-project';

function isOutputPreset(value: unknown): value is OutputPreset {
    return value === 'auto'
        || value === 'question-bank'
        || value === 'requirements'
        || value === 'minutes'
        || value === 'checklist'
        || value === 'risk-matrix';
}

/** jsdom 등에서 `focus({ preventScroll: true })` 옵션을 지원하지 않으면 예외가 나므로 안전 호출 */
function focusElementPreventScroll(el: HTMLElement | null | undefined): void {
    if (!el) return;
    try {
        el.focus({ preventScroll: true });
    } catch {
        try {
            el.focus();
        } catch {
            /* noop */
        }
    }
}

interface ChatGPTInterfaceProps {
    /** URL /projects/:id 진입 시 해당 프로젝트 자동 선택 */
    initialProjectId?: string;
    /** URL /agents?id=<uuid> — 공개 규격과 동일한 쿼리로 세션·API 프로필 정렬 */
    gensparkRouteAgentId?: string;
}

const ChatGPTInterface: React.FC<ChatGPTInterfaceProps> = ({ initialProjectId, gensparkRouteAgentId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname || '/';
    /** 독립 일반 대화 경로(기본 `/`, 워크스페이스 우선 시 `/chat`)에서 웰컴·전역 동작 */
    const isDefaultPage = isStandaloneChatPath(pathname);
    /** 루트 워크스페이스 홈과 문구 중복 방지: 독립 대화 경로에서는 웰컴 히어로 생략·도구만 표시 */
    const compactWorkspaceWelcome = isGensparkPrimaryExperience() && isStandaloneChatPath(pathname);
    /** location.state.conversationId — 의존성 배열에 `location.state` 객체를 넣지 않고 이 원시값만 사용 (React 19 훅 검증 안정화) */
    const conversationIdFromState = (location.state as { conversationId?: string } | null | undefined)?.conversationId;
    const gensparkAgentSessionMeta = useMemo(
        () => (gensparkRouteAgentId ? resolveGensparkAgentForRoute(gensparkRouteAgentId) : null),
        [gensparkRouteAgentId]
    );
    /** 에이전트 라우트 `/agents?id=` 세션 — 답변 생성 패널을 카드형(비 embedded)으로 */
    const gensparkAgentBodyEmbedded = !gensparkRouteAgentId;
    const copyGensparkAgentSessionLink = useCallback(
        async (kind: 'app' | 'public') => {
            if (!gensparkRouteAgentId) return;
            const publicUrl = gensparkAgentSessionMeta?.url ?? '';
            const appUrl =
                typeof window !== 'undefined'
                    ? `${window.location.origin}${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(gensparkRouteAgentId)}`
                    : '';
            const text = kind === 'public' ? publicUrl : appUrl;
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
                showToast(
                    kind === 'public'
                        ? '공개 에이전트 URL을 복사했습니다'
                        : '이 앱의 에이전트 링크를 복사했습니다',
                    'success',
                );
            } catch {
                showToast('클립보드 복사에 실패했습니다', 'error');
            }
        },
        [gensparkRouteAgentId, gensparkAgentSessionMeta?.url],
    );
    /** 비동기 콜백에서 현재 경로 확인용 — 스탠드얼론 대화 경로일 때 프로젝트 자동 선택 방지 */
    const pathnameRef = useRef(pathname);
    pathnameRef.current = pathname;
    /** 웰컴 초기화: 직전 pathname 추적 — 스탠드얼론 대화 경로 밖에서 들어올 때만 초기화 */
    const prevPathnameForWelcomeRef = useRef<string | null>(null);
    /** conversationIdFromState가 "있었다가 없어졌을 때"만 currentConversation 초기화 (전송 직후 conversations 갱신 시 null로 덮어쓰기 방지) */
    const prevConversationIdFromStateRef = useRef<string | undefined>(undefined);
    /** 대화 복제 직후 한 틱: location.state가 옛 id일 때 effect가 선택을 덮어쓰지 않도록 함(1369가 새 id로 동기화) */
    const skipNextConversationIdFromStateSelectionRef = useRef(false);
    /** 대화 전환 시 메시지 영역 포커스용 — ref는 모든 useEffect보다 앞에 두어 훅 순서를 고정 */
    const prevConversationIdRef = useRef<string | null>(null);
    /** 루트 워크스페이스에서 넘긴 질의 초안을 입력창에 한 번만 반영 */
    const appliedMarketingComposerDraftRef = useRef(false);
    /** 대화 관계도 → 독립 대화 handoff 시 1회 병합할 분석 context */
    const pendingConversationGraphContextRef = useRef<Record<string, unknown> | null>(null);
    /** 마케팅 홈 자동 전송 — `sendMessage`는 아래에 선언되므로 effect에서는 ref로 호출 */
    const sendMessageRef = useRef<(overrideText?: string) => Promise<void>>(async () => {});
    const threadContextFilesInputRef = useRef<HTMLInputElement>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    // 대화 태그 관리
    const [convTagsOpen, setConvTagsOpen] = useState(false);
    const [convTagInput, setConvTagInput] = useState('');
    const [_convTagFilter, _setConvTagFilter] = useState<string | null>(null);
    /** useEffect 의존성에 객체 대신 넣기 위한 원시값 (React 19 경고·replace 루프 방지) */
    const currentConversationId = currentConversation?.id;
    const currentConversationProjectId = currentConversation?.projectId;
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [_sidebarOpen, setSidebarOpen] = useState(true);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showProjectEditModal, setShowProjectEditModal] = useState(false);
    const [showAddSourceModal, setShowAddSourceModal] = useState(false);
    const [showGoogleDriveImportModal, setShowGoogleDriveImportModal] = useState(false);
    /** NotebookLLM 출처 패널 외부 갱신(Drive 수동 가져오기 등) */
    const [notebookSourcesRefreshToken, setNotebookSourcesRefreshToken] = useState(0);
    const [sourceFilesUploading, setSourceFilesUploading] = useState(false);
    const [projectContentTab, setProjectContentTab] = useState<'chat' | 'sources'>('chat');
    const [sourceSortOrder, setSourceSortOrder] = useState<'recent' | 'oldest'>('recent');
    const [sourceFilter] = useState<'all'>('all');
    const [projectEditFocusTarget, setProjectEditFocusTarget] = useState<'required-guideline' | null>(null);
    /** 설정 모달 열기 직전 스냅샷 — 닫을 때 저장 없이 나가면 복원 */
    const projectBeforeEditRef = useRef<Project | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [projectSearchQuery, _setProjectSearchQuery] = useState('');
    const [searchQuery, _setSearchQuery] = useState('');
    /** [1] 상단 통합 검색 — 대화·프로젝트 동시 필터 (AI Workspace Minimal UI) */
    const [sidebarUnifiedSearch, _setSidebarUnifiedSearch] = useState('');
    const [viewMode, setViewMode] = useState<'chat' | 'notebook'>('chat');
    const [_llmStatusSummary, setLlmStatusSummary] = useState<string | null>(null);
    const [showStructuredPreview, setShowStructuredPreview] = useState(false);
    const [_structuredPreviewPlacement, setStructuredPreviewPlacement] = useState<'above' | 'below'>('above');
    const [structuredInputAssistEnabled, setStructuredInputAssistEnabled] = useState(true);
    const [useStreaming] = useState<boolean>(true);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    /** 전송 직후 입력창이 비워져도 로딩·컴포저 단계 UI가 직전 질의 기준을 유지하도록 저장 */
    const [lastOutboundUserTextForStepUi, setLastOutboundUserTextForStepUi] = useState('');
    /** `REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST` — 항목별 순차 API 진행 인덱스(체크리스트 동기화) */
    const [composerMultiRequestLiveIndex, setComposerMultiRequestLiveIndex] = useState<number | null>(null);
    /** 스레드 전환 시 lastOutbound 초기화용 — 첫 id 부여(null→id)는 제외 */
    const lastComposerStepUiConversationIdRef = useRef<string | undefined>(undefined);
    /** 전송 직후 한 커밋에서 대화 id가 바뀌면(예: 포크) 단계 UI 초기화 effect가 lastOutbound를 지우지 않도록 */
    const skipClearOutboundStepUiForConversationChangeRef = useRef(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const [deleteConfirmConversation, setDeleteConfirmConversation] = useState<Conversation | null>(null);
    const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
    const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null);
    const [conversationMenuOpenId, setConversationMenuOpenId] = useState<string | null>(null);
    const [projectMenuOpenId, setProjectMenuOpenId] = useState<string | null>(null);
    const [_dragOverProjectId, _setDragOverProjectId] = useState<string | null>(null);
    const [showClearMessagesConfirm, setShowClearMessagesConfirm] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [showProModal, setShowProModal] = useState(false);
    const [threadInstructionsDraft, setThreadInstructionsDraft] = useState('');
    /** 스레드 지침·파일 패널 — 기본 접힘, 헤더「대화 설정」으로만 펼침 */
    const [threadContextPanelOpen, setThreadContextPanelOpen] = useState(false);

    useEffect(() => {
        setThreadInstructionsDraft(currentConversation?.threadInstructions ?? '');
    }, [currentConversationId, currentConversation?.threadInstructions]);

    useEffect(() => {
        const id = currentConversation?.id ?? undefined;
        const prevId = lastComposerStepUiConversationIdRef.current;
        if (
            shouldClearOutboundStepUiCarryoverOnThreadIdChange(
                prevId,
                id,
                skipClearOutboundStepUiForConversationChangeRef.current,
            )
        ) {
            setLastOutboundUserTextForStepUi('');
        }
        if (id !== prevId) {
            lastComposerStepUiConversationIdRef.current = id;
        }
    }, [currentConversation?.id]);

    useEffect(() => {
        if (!showProModal) return;
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowProModal(false); };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [showProModal]);

    useEffect(() => {
        if (!conversationMenuOpenId) return;
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setConversationMenuOpenId(null); };
        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (document.body.contains(target) && !(target as Element).closest?.('[data-conversation-menu]')) {
                setConversationMenuOpenId(null);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [conversationMenuOpenId]);

    useEffect(() => {
        if (!projectMenuOpenId) return;
        const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setProjectMenuOpenId(null); };
        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (document.body.contains(target) && !(target as Element).closest?.('[data-project-menu]')) {
                setProjectMenuOpenId(null);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [projectMenuOpenId]);

    // 대화 헤더 보내기·관리 `<details>`: 바깥 클릭·Escape 시 닫기 (열린 네이티브 dialog가 있으면 Escape는 모달 우선)
    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            const t = e.target as Node | null;
            if (!t || !document.body.contains(t)) return;
            const openList = Array.from(
                document.querySelectorAll<HTMLDetailsElement>('details.bw-chat-header-menu[open]')
            );
            const toClose = openList.filter((d) => !d.contains(t));
            if (toClose.length === 0) return;
            const active = document.activeElement;
            const focusedDetails =
                active instanceof Node ? toClose.find((d) => d.contains(active)) : undefined;
            toClose.forEach((d) => d.removeAttribute('open'));
            focusedDetails?.querySelector<HTMLElement>('summary')?.focus();
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            const openList = Array.from(
                document.querySelectorAll<HTMLDetailsElement>('details.bw-chat-header-menu[open]')
            );
            if (openList.length === 0) return;
            if (document.querySelector('dialog[open]')) return;
            const active = document.activeElement;
            const focusedDetails =
                active instanceof Node ? openList.find((d) => d.contains(active)) : undefined;
            openList.forEach((d) => d.removeAttribute('open'));
            focusedDetails?.querySelector<HTMLElement>('summary')?.focus();
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown, true);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    // LLM 상태 요약: 백엔드에 CHAT_POST_PATH/llm-status(API_ENDPOINTS.LLM_STATUS)가 있을 때만 사용.
    // 기본 페이지(/)에서는 절대 요청하지 않음 → 404 없음, setLlmStatusSummary 리렌더 없음 → 프로젝트로 이동 방지. 테스트는 예외.
    useEffect(() => {
        setLlmStatusSummary(null);
        const onHome = isDefaultPage;
        if (onHome && process.env.NODE_ENV !== 'test') return; // 홈에서는 fetch 미실행 (캐시/이전 빌드와 무관)
        if (!RUN_LLM_STATUS_FETCH) return;
        let cancelled = false;
        // fetch가 undefined를 반환하거나(모킹 누락) 비표준 응답일 때 `.then` 체인이 터지지 않도록 Promise로 감쌈
        Promise.resolve(fetch(API_ENDPOINTS.LLM_STATUS, { cache: 'no-store' }))
            .then((res) => {
                if (cancelled) return null;
                if (res == null || typeof (res as Response).json !== 'function') return null;
                if (res.ok) return Promise.resolve(res.json());
                if (res.status === 404) return null;
                return Promise.reject(new Error(res.statusText));
            })
            .then((data: { success?: boolean; summary?: string } | null) => {
                if (cancelled) return;
                if (data?.success && typeof data.summary === 'string') setLlmStatusSummary(data.summary);
                else setLlmStatusSummary(null);
            })
            .catch(() => { if (!cancelled) setLlmStatusSummary(null); });
        return () => { cancelled = true; };
    }, [pathname, isDefaultPage]);

    useEffect(() => {
        if (!showStructuredPreview) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowStructuredPreview(false);
        };
        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            if (structuredBadgeWrapRef.current?.contains(target)) return;
            setShowStructuredPreview(false);
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [showStructuredPreview]);

    useEffect(() => {
        if (!showStructuredPreview) {
            setStructuredPreviewPlacement('above');
            return;
        }
        const updatePlacement = () => {
            const wrap = structuredBadgeWrapRef.current;
            const preview = structuredPreviewRef.current;
            if (!wrap || !preview) return;
            const wrapRect = wrap.getBoundingClientRect();
            const previewHeight = preview.offsetHeight;
            const viewportTop = window.visualViewport?.offsetTop ?? 0;
            const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
            const viewportBottom = viewportTop + viewportHeight;
            const spaceAbove = wrapRect.top - viewportTop - 8;
            const spaceBelow = viewportBottom - wrapRect.bottom - 8;
            if (spaceAbove < previewHeight && spaceBelow > spaceAbove) {
                setStructuredPreviewPlacement('below');
            } else {
                setStructuredPreviewPlacement('above');
            }
        };
        const rafId = window.requestAnimationFrame(updatePlacement);
        const visualViewport = window.visualViewport;
        window.addEventListener('resize', updatePlacement);
        visualViewport?.addEventListener('resize', updatePlacement);
        visualViewport?.addEventListener('scroll', updatePlacement);
        return () => {
            window.cancelAnimationFrame(rafId);
            window.removeEventListener('resize', updatePlacement);
            visualViewport?.removeEventListener('resize', updatePlacement);
            visualViewport?.removeEventListener('scroll', updatePlacement);
        };
    }, [showStructuredPreview, input.length]);

    const [_editingConversationId, setEditingConversationId] = useState<string | null>(null);
    const [editingConversationTitle, setEditingConversationTitle] = useState<string>('');
    // 응답 스타일 설정
    const [responseStyle, setResponseStyle] = useState<ChatResponseStyleUi>('detailed');
    const [perspective, setPerspective] = useState<ChatPerspectiveUi | null>(null);
    const [showStyleOptions, setShowStyleOptions] = useState<boolean>(false);
    const [outputPreset, setOutputPreset] = useState<OutputPreset>('auto');
    const [answerDiversityMode, setAnswerDiversityMode] = useState<AnswerDiversityMode>('varied');
    const [writingStyleProfile, setWritingStyleProfile] = useState<WritingStyleLearningProfile>({
        enabled: true,
        anchors: [],
        learnedSignals: [],
        snapshots: [],
        updatedAt: new Date().toISOString(),
    });
    const [selectedStyleSnapshotCompareIds, setSelectedStyleSnapshotCompareIds] = useState<string[]>([]);
    const [styleSnapshotComparePrompt, setStyleSnapshotComparePrompt] = useState<string | null>(null);
    // 빠른 제안
    const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
    // 소스 기반 추천 질문 (NotebookLM, 대화 웰컴용)
    const [suggestedQuestionsFromSource, setSuggestedQuestionsFromSource] = useState<string[]>([]);
    // 대화 내 검색
    const [messageSearchQuery, setMessageSearchQuery] = useState<string>('');
    const [showMessageSearch, setShowMessageSearch] = useState<boolean>(false);
    const [messageSearchIndex, setMessageSearchIndex] = useState<number>(0);
    // 테마 설정
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem(CHATGPT_THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        // 시스템 설정 확인
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    });
    // TTS 설정
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [showTimestamps, setShowTimestamps] = useState<boolean>(() => {
        return localStorage.getItem(CHATGPT_SHOW_TIMESTAMPS_STORAGE_KEY) === 'true';
    });
    const [importingConversation, setImportingConversation] = useState(false);
    // 키보드 단축키 도움말
    const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);
    // 인라인 메시지 검색
    const [_msgSearchOpen, _setMsgSearchOpen] = useState(false);
    const [_msgSearchQuery, _setMsgSearchQuery] = useState('');
    const [_msgSearchIdx, _setMsgSearchIdx] = useState(0);
    const _msgSearchInputRef = useRef<HTMLInputElement>(null);
    // 대화 정렬
    type SortOption = 'recent' | 'name' | 'messages';
    const [sortOption, _setSortOption] = useState<SortOption>('recent');
    // 대화 목록 섹션 접기/펼치기 (비어 있으면 모두 펼침): 'noProject' = 일반 대화, projectId = 프로젝트별
    const [_collapsedChatSections, _setCollapsedChatSections] = useState<Set<string>>(new Set());
    // 프로젝트 정렬
    type ProjectSortOption = 'recent' | 'name' | 'sources';
    const [projectSortOption, _setProjectSortOption] = useState<ProjectSortOption>('recent');
    // 자동 스크롤 설정
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    // 메시지 접기 상태
    const [collapsedMessages, setCollapsedMessages] = useState<Set<string>>(new Set());
    // 응답 시간 측정
    const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
    const [streamingElapsedSec, setStreamingElapsedSec] = useState(0);
    // 네트워크 상태 (navigator.onLine + 백엔드 도달 여부)
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [isApiReachable, setIsApiReachable] = useState<boolean | null>(null);
    // 스토리지 사용량
    const [_storageUsage, setStorageUsage] = useState<{ used: number; total: number } | null>(null);
    const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const composerAttachRef = useRef<WorkspaceQueryComposerHandle>(null);
    const [composerPendingAttachCount, setComposerPendingAttachCount] = useState(0);
    const streamingRafRef = useRef<number | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const apiUnreachableBannerRef = useRef<HTMLDivElement>(null);
    const isSendingRef = useRef(false);
    const isNearBottomRef = useRef<boolean>(true);
    const abortControllerRef = useRef<AbortController | null>(null);
    const inputHistoryRef = useRef<string[]>([]);
    const inputHistoryIndexRef = useRef<number>(-1);
    /** 엔터 시점에 최신 입력값 보장 (React 배칭으로 state 지연 시 대비) */
    const inputValueRef = useRef<string>('');
    const shortcutsCloseRef = useRef<HTMLButtonElement>(null);
    const prevFocusRef = useRef<HTMLElement | null>(null);
    const structuredBadgeWrapRef = useRef<HTMLSpanElement>(null);
    const structuredPreviewRef = useRef<HTMLSpanElement>(null);
    const imageFileInputRef = useRef<HTMLInputElement>(null);
    const conversationFileInputRef = useRef<HTMLInputElement>(null);
    const chatDeleteConversationCancelRef = useRef<HTMLButtonElement>(null);
    const projectDeleteCancelRef = useRef<HTMLButtonElement>(null);
    const messageDeleteCancelRef = useRef<HTMLButtonElement>(null);
    const clearMessagesCancelRef = useRef<HTMLButtonElement>(null);
    // 첨부 메뉴(/웹검색 등)·이미지 첨부·대화 파일 첨부
    /** 공동입력창 Auto 드롭다운: auto=enhanced, concise=basic, detailed=ultimate. localStorage 복원 */
    const [composerResponseMode, setComposerResponseMode] = useState<ComposerResponseModeUi>(readInitialComposerResponseMode);
    const [attachedImageAnalysis, setAttachedImageAnalysis] = useState<string | null>(null);
    const [_imageAnalysisLoading, setImageAnalysisLoading] = useState(false);
    const [attachedConversationFile, setAttachedConversationFile] = useState<File | null>(null);
    /** Auto 드롭다운 → API quality: auto→enhanced, concise→basic, detailed→ultimate */
    const composerQuality = composerResponseMode === 'concise' ? 'basic' : composerResponseMode === 'detailed' ? 'ultimate' : 'enhanced';

    /** 입력창 텍스트 trim (전송·UI·힌트 공통, 비문자 방어) */
    const inputTrimmed = useMemo(() => coerceTrimmedString(input, ''), [input]);

    /** 메시지 영역의 생성 단계와 동일 문구를 입력창 하단에 표시(긴 붙여넣기·질문+요구 후에도 진행 상태가 보이게) */
    const inputFooterGenerationHint = useMemo(() => {
        const msgs = currentConversation?.messages ?? [];
        const last = msgs[msgs.length - 1];
        const phaseFromBubble =
            last?.role === 'assistant' &&
            typeof last.content === 'string' &&
            isAssistantGenerationStepUi(last.content)
                ? last.content
                : null;

        if (isStreaming) {
            if (phaseFromBubble) {
                return `${phaseFromBubble} · 응답 수신 중 (${streamingElapsedSec}초) — Esc로 중지`;
            }
            return `스트리밍 중... (${streamingElapsedSec}초) — Esc로 중지`;
        }
        if (isLoading) {
            return phaseFromBubble ?? ASSISTANT_PLACEHOLDER_THINKING;
        }
        return null;
    }, [currentConversation?.messages, isStreaming, isLoading, streamingElapsedSec]);

    /** 입력창 하단 5단계 진행 — 메시지 버블과 동기화된 현재 단계 */
    const composerInputPipelinePhase = useMemo((): AssistantGenerationPhase | null => {
        if (!isLoading && !isStreaming) return null;
        const msgs = currentConversation?.messages ?? [];
        const last = msgs[msgs.length - 1];
        if (!last || last.role !== 'assistant') {
            return 'analyze';
        }
        if (typeof last.content === 'string' && isAssistantGenerationStepUi(last.content)) {
            const ph = getAssistantGenerationPhase(last.content);
            if (ph && ph !== 'retry') return ph;
            return 'analyze';
        }
        if (isStreaming) {
            return (
                assistantPhaseFromPipelineExtrasSlug(last.pipelineExtras?.pipelineGenerationPhase) ?? 'draft'
            );
        }
        return 'analyze';
    }, [isLoading, isStreaming, currentConversation?.messages]);

    /** `AssistantGensparkBody`와 동일 — 프로젝트에 파일·웹 소스가 있으면 단계 UI 헤드라인을 문서 맥락 톤으로 */
    const pipelineStepDocumentContext = useMemo(
        () =>
            !!(
                currentProject &&
                ((currentProject.files?.length ?? 0) > 0 ||
                    (currentProject.webSources?.length ?? 0) > 0)
            ),
        [currentProject],
    );

    const composerGensparkStepUi = useMemo(() => {
        const composerGensparkUserSource =
            isLoading && !coerceTrimmedString(inputTrimmed, '')
                ? lastOutboundUserTextForStepUi
                : inputTrimmed;
        return assistantGensparkStepUiFromUserMessage(composerGensparkUserSource, {
            projectHasFiles:
                pipelineStepDocumentContext ||
                userMessageHasAttachmentChatHint(composerGensparkUserSource),
        });
    }, [isLoading, inputTrimmed, lastOutboundUserTextForStepUi, pipelineStepDocumentContext]);

    const composerGenerationCaption = useMemo(() => {
        const source =
            isLoading || isStreaming
                ? lastOutboundUserTextForStepUi || inputTrimmed
                : inputTrimmed;
        return getComposerGenerationCaption(source);
    }, [isLoading, isStreaming, inputTrimmed, lastOutboundUserTextForStepUi]);

    const composerIdleInputHint =
        !isLoading && !isStreaming && composerGenerationCaption ? composerGenerationCaption : null;

    const composerMultiRequestProgress = useMemo(() => {
        if (!isLoading && !isStreaming) return null;
        const source = lastOutboundUserTextForStepUi || inputTrimmed;
        const elapsedMs = responseStartTime
            ? Math.max(0, Date.now() - responseStartTime)
            : streamingElapsedSec * 1000;
        const built = buildComposerMultiRequestProgressState(
            source,
            composerInputPipelinePhase,
            elapsedMs,
        );
        if (!built) return null;
        if (composerMultiRequestLiveIndex != null) {
            return {
                ...built,
                activeIndex: Math.min(
                    built.items.length - 1,
                    Math.max(0, composerMultiRequestLiveIndex),
                ),
            };
        }
        return built;
    }, [
        isLoading,
        isStreaming,
        lastOutboundUserTextForStepUi,
        inputTrimmed,
        composerInputPipelinePhase,
        responseStartTime,
        streamingElapsedSec,
        composerMultiRequestLiveIndex,
    ]);

    // 선택한 응답 스타일 저장 (새로고침 후 복원)
    useEffect(() => {
        try {
            localStorage.setItem(CHATGPT_COMPOSER_RESPONSE_MODE_STORAGE_KEY, composerResponseMode);
        } catch (_) { /* ignore */ }
    }, [composerResponseMode]);



    const analyzeComposerImageFile = useCallback(async (file: File): Promise<string | null> => {
        try {
            const result = await advancedAPIService.analyzeImageFile(file, 'comprehensive');
            if (result.status === 'success' && result.analysis) {
                const parts: string[] = [];
                const a = result.analysis;
                if (a.image_info) {
                    parts.push(`이미지: ${a.image_info.width}x${a.image_info.height}, ${a.image_info.format}`);
                }
                if (a.object_detection?.detected_objects?.length) {
                    parts.push(`객체: ${a.object_detection.detected_objects.map((o: { name: string }) => o.name).join(', ')}`);
                }
                const ocrText = coerceTrimmedString(a.ocr_results?.extracted_text, '');
                if (ocrText) {
                    parts.push(`OCR: ${ocrText}`);
                }
                if (a.emotion_analysis?.primary_emotion) {
                    parts.push(`감정: ${a.emotion_analysis.primary_emotion}`);
                }
                return parts.length ? parts.join('\n') : '이미지 분석 완료';
            }
            throw new Error(result.message || '이미지 분석 실패');
        } catch (err) {
            errorLogger.error('이미지 분석 실패', err instanceof Error ? err : new Error(String(err)));
            return null;
        }
    }, []);

    const handleImageFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        e.target.value = '';
        setImageAnalysisLoading(true);
        setAttachedImageAnalysis(null);
        try {
            const analysis = await analyzeComposerImageFile(file);
            if (analysis) {
                setAttachedImageAnalysis(analysis);
            } else {
                showToast('이미지 분석 중 오류가 발생했습니다.', 'error');
            }
        } finally {
            setImageAnalysisLoading(false);
        }
    }, [analyzeComposerImageFile]);

    const attachConversationTextFile = useCallback((file: File) => {
        const name = (file.name || '').toLowerCase();
        if (!name.endsWith('.txt') && !name.endsWith('.csv')) {
            showToast('대화 파일은 .txt 또는 .csv만 첨부할 수 있습니다.', 'info');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast('대화 파일은 5MB 이하여야 합니다.', 'info');
            return;
        }
        setAttachedConversationFile(file);
    }, []);

    const handleConversationFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = '';
            attachConversationTextFile(file);
        },
        [attachConversationTextFile],
    );

    const openConversationGraphHandoff = useCallback(async () => {
        if (!attachedConversationFile) return;
        try {
            const text = await attachedConversationFile.text();
            navigate(CONVERSATION_GRAPH_PATH, {
                state: buildConversationGraphPasteNavState(text, true),
            });
        } catch {
            showToast('대화 파일을 읽을 수 없습니다.', 'error');
        }
    }, [attachedConversationFile, navigate]);

    const withGraphCreateIntentInChatContext = useCallback(
        (trimmed: string, base: Record<string, unknown>, conversationFileContent?: string) =>
            mergeConversationGraphCreateIntentIntoChatContext(trimmed, base, {
                conversationFileContent,
                hasGraphHandoffContext:
                    pendingConversationGraphContextRef.current?.[GRAPH_ANSWER_CONTEXT_FLAG] === true,
            }),
        [],
    );

    const showConversationGraphHandoffBanner = useMemo(() => {
        const trimmed = coerceTrimmedString(input, '');
        return Boolean(attachedConversationFile && trimmed && isCreateGraphAnswerRequest(trimmed));
    }, [attachedConversationFile, input]);

    const conversationGraphAttachedFileEl = attachedConversationFile ? (
        <div
            className="conversation-graph-chat-attached-file"
            data-testid={TEST_IDS.CONVERSATION_GRAPH_CHAT_ATTACHED_FILE}
            role="status"
        >
            <span className="conversation-graph-chat-attached-file__name">{attachedConversationFile.name}</span>
            <button
                type="button"
                className="conversation-graph-chat-attached-file__remove"
                onClick={() => setAttachedConversationFile(null)}
                aria-label="대화 파일 첨부 제거"
            >
                ×
            </button>
        </div>
    ) : null;

    const conversationGraphHandoffBannerEl = showConversationGraphHandoffBanner ? (
        <div
            className="conversation-graph-chat-handoff-banner"
            data-testid={TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_BANNER}
        >
            <p className="conversation-graph-chat-handoff-banner__text bw-detail-meta-text">
                첨부한 대화로 시각 관계도(족보형·매트릭스)를 만들 수 있습니다.
            </p>
            <button
                type="button"
                className="bw-btn-secondary conversation-graph-chat-handoff-banner__cta"
                data-testid={TEST_IDS.CONVERSATION_GRAPH_CHAT_HANDOFF_OPEN}
                onClick={() => void openConversationGraphHandoff()}
            >
                관계도 열기
            </button>
        </div>
    ) : null;

    const refreshProjects = useCallback(async () => {
        try {
            const loadedProjects = await projectService.getProjects();
            const projectsWithDates: Project[] = loadedProjects
                .filter((p) => p?.id && p?.name)
                .map((p) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    instructions: typeof p.instructions === 'string' ? p.instructions : '',
                    initialGuidelines: Array.isArray(p.initialGuidelines) ? p.initialGuidelines : [],
                    tags: Array.isArray(p.tags) ? p.tags : [],
                    files: Array.isArray(p.files) ? p.files : [],
                    webSources: Array.isArray(p.webSources)
                        ? p.webSources
                            .filter((s) => s && typeof s.url === 'string')
                            .map((s) => ({ ...s, addedAt: safeDate(s.addedAt) }))
                        : [],
                    createdAt: safeDate(p.createdAt),
                    updatedAt: safeDate(p.updatedAt),
                    source_count: typeof (p as Project).source_count === 'number' ? (p as Project).source_count : undefined,
                }));
            setProjects(projectsWithDates);
        } catch {
            // 폴백 시에는 기존 projects 유지
        }
    }, []);

    const sortedProjects = useMemo(() => {
        const copy = [...projects];
        if (projectSortOption === 'recent') {
            copy.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
        } else if (projectSortOption === 'name') {
            copy.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));
        } else if (projectSortOption === 'sources') {
            copy.sort((a, b) => (b.source_count ?? 0) - (a.source_count ?? 0));
        }
        return copy;
    }, [projects, projectSortOption]);

    const _filteredProjects = useMemo(() => {
        const q = coerceTrimmedString(sidebarUnifiedSearch || projectSearchQuery, '').toLowerCase();
        if (!q) return sortedProjects;
        return sortedProjects.filter((p) => p.name.toLowerCase().includes(q));
    }, [sortedProjects, sidebarUnifiedSearch, projectSearchQuery]);

    /** 프로젝트 지침·규칙이 설정되어 있으면 true — 답변에 지침 적용 안내 및 context 지시문 사용 */
    const hasProjectGuidance = useMemo(
        () =>
            (typeof currentProject?.instructions === 'string' && coerceTrimmedString(currentProject.instructions, '').length > 0) ||
            (Array.isArray(currentProject?.initialGuidelines) &&
                currentProject?.initialGuidelines.some((g) => coerceTrimmedString(String(g), '').length > 0)),
        [currentProject?.instructions, currentProject?.initialGuidelines]
    );

    const hasThreadGuidance = useMemo(
        () =>
            !!currentConversation &&
            (coerceTrimmedString(currentConversation.threadInstructions ?? '', '').length > 0 ||
                (currentConversation.threadFiles?.length ?? 0) > 0),
        [currentConversation]
    );

    const hasAnyGuidance = hasProjectGuidance || hasThreadGuidance;

    /** 프로젝트 없이 대화만 쓸 때는 스레드 지침·첨부 중심 문구 */
    const projectGuidelineInstructionText = useMemo(() => {
        if (!hasAnyGuidance) return '';
        if (hasProjectGuidance && hasThreadGuidance) {
            return '이 대화·프로젝트에 설정된 지침(project_instructions)과 규칙(project_guidelines)을 반드시 준수하세요. 미리 설정한 논리·형식·제약·우선순위에 맞게 답변을 생성하세요. 지침과 충돌하는 내용은 지침을 우선합니다. 첨부 파일 본문(thread_attached_file_contents)이 있으면 답변 시 참고하세요.';
        }
        if (hasProjectGuidance) {
            return '프로젝트에 설정된 지침(project_instructions)과 규칙(project_guidelines)을 반드시 준수하세요. 미리 설정한 논리·형식·제약·우선순위에 맞게 답변을 생성하세요. 지침과 충돌하는 내용은 지침을 우선합니다. 첨부 파일 본문(thread_attached_file_contents)이 있으면 답변 시 참고하세요.';
        }
        return '이 대화에서만 설정한 지침(project_instructions)과 첨부 파일 본문(thread_attached_file_contents)을 반드시 준수·참고하세요. 논리·형식·제약·우선순위에 맞게 답변을 생성하고, 지침과 충돌하는 내용은 지침을 우선합니다.';
    }, [hasAnyGuidance, hasProjectGuidance, hasThreadGuidance]);

    // 스탠드얼론 대화 경로에서 웰컴 유지: 프로젝트·에이전트 등 다른 경로에서 "처음" 들어올 때만 프로젝트/대화 초기화
    // 사이드바에서 대화 클릭 시 state.conversationId로 진입 → conversationIdFromState effect에서 설정
    useEffect(() => {
        const prevPath = prevPathnameForWelcomeRef.current;
        const commitPath = () => {
            prevPathnameForWelcomeRef.current = pathname;
        };

        if (!isDefaultPage || initialProjectId) {
            commitPath();
            return;
        }
        const shareToken = new URLSearchParams(window.location.search).get('share');
        if (shareToken) {
            commitPath();
            return;
        }
        const conversationIdInState = (location.state as { conversationId?: string } | null)?.conversationId;
        const justNavigatedToHome =
            prevPath !== null && !isStandaloneChatPath(prevPath) && isDefaultPage;
        commitPath();
        if (justNavigatedToHome) {
            setCurrentProject(null);
            if (!conversationIdInState) setCurrentConversation(null);
        }
        // location.state는 pathname 변경 시점에만 읽으면 되며, 의존성에 넣으면 replace 시 매번 재실행됨
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDefaultPage, initialProjectId, pathname]);

    // 루트 워크스페이스 질의 초안 → 독립 대화 또는 에이전트 입력창에 1회 반영 후 history state 정리
    useEffect(() => {
        if (!isMarketingDraftEligiblePath(pathname)) {
            appliedMarketingComposerDraftRef.current = false;
            return;
        }
        const s = location.state as Record<string, unknown> | null | undefined;
        const graphCtxRaw = s?.[CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY];
        if (graphCtxRaw && typeof graphCtxRaw === 'object' && !Array.isArray(graphCtxRaw)) {
            pendingConversationGraphContextRef.current = graphCtxRaw as Record<string, unknown>;
        }
        const raw =
            s?.[MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY] ?? s?.[CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY];
        const draft = typeof raw === 'string' ? coerceTrimmedString(raw, '') : '';
        if (!draft) {
            if (graphCtxRaw) {
                const nextCtxOnly: Record<string, unknown> =
                    s && typeof s === 'object' && !Array.isArray(s) ? { ...s } : {};
                delete nextCtxOnly[CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY];
                const restKeys = Object.keys(nextCtxOnly).filter(
                    (k) => nextCtxOnly[k] !== undefined && nextCtxOnly[k] !== null,
                );
                navigate(`${pathname}${location.search || ''}`, {
                    replace: true,
                    state: restKeys.length ? nextCtxOnly : undefined,
                });
            }
            return;
        }
        if (appliedMarketingComposerDraftRef.current) return;
        appliedMarketingComposerDraftRef.current = true;
        const shouldAutoSend =
            s?.[MARKETING_HOME_COMPOSER_AUTOSEND_STATE_KEY] === true ||
            s?.[CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY] === true;
        setInput(draft);
        const next: Record<string, unknown> =
            s && typeof s === 'object' && !Array.isArray(s) ? { ...s } : {};
        delete next[MARKETING_HOME_COMPOSER_DRAFT_STATE_KEY];
        delete next[MARKETING_HOME_COMPOSER_AUTOSEND_STATE_KEY];
        delete next[CONVERSATION_GRAPH_CHAT_DRAFT_STATE_KEY];
        delete next[CONVERSATION_GRAPH_CHAT_AUTOSEND_STATE_KEY];
        delete next[CONVERSATION_GRAPH_CHAT_CONTEXT_STATE_KEY];
        const restKeys = Object.keys(next).filter((k) => next[k] !== undefined && next[k] !== null);
        navigate(`${pathname}${location.search || ''}`, {
            replace: true,
            state: restKeys.length ? next : undefined,
        });
        if (shouldAutoSend) {
            queueMicrotask(() => {
                void sendMessageRef.current(draft);
            });
        } else {
            queueMicrotask(() => {
                inputRef.current?.focus();
            });
        }
    }, [pathname, location.state, location.search, navigate]);

    // URL 공유 링크(?share=토큰) 접근: 기본 페이지(/)에서만 검증 후 해당 프로젝트 선택 (Task B4-4)
    useEffect(() => {
        if (!isDefaultPage || projects.length === 0) return;
        const params = new URLSearchParams(window.location.search);
        const shareToken = params.get('share');
        if (!shareToken) return;

        const validation = projectShareService.validateShareAccess(shareToken);
        if (!validation.valid || !validation.shareLink) return;

        projectShareService.recordAccess(shareToken);
        const target = projects.find((p) => p.id === validation.shareLink!.projectId);
        if (target) {
            setCurrentProject(target);
        }
        // URL에서 share 파라미터 제거 (재진입 시 중복 기록 방지)
        params.delete('share');
        const newSearch = params.toString();
        const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
    }, [isDefaultPage, projects]);

    // 초기 로드: 프로젝트와 대화 불러오기 (마운트 시 1회)
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const loadedProjects = await projectService.getProjects();
                const projectsWithDates: Project[] = loadedProjects
                    .filter((p) => p?.id && p?.name && String(p.name).trim().length >= 1)
                    .map((p) => ({
                        id: p.id,
                        name: String(p.name).length > 100 ? String(p.name).slice(0, 100) : p.name,
                        description: p.description || '',
                        instructions: typeof p.instructions === 'string' ? p.instructions : '',
                        initialGuidelines: Array.isArray(p.initialGuidelines) ? p.initialGuidelines : [],
                        tags: Array.isArray(p.tags) ? p.tags : [],
                        files: Array.isArray(p.files) ? p.files : [],
                        webSources: Array.isArray(p.webSources)
                            ? p.webSources
                                .filter((s) => s && typeof s.url === 'string')
                                .map((s) => ({ ...s, addedAt: safeDate(s.addedAt) }))
                            : [],
                        createdAt: safeDate(p.createdAt),
                        updatedAt: safeDate(p.updatedAt),
                        source_count: typeof (p as Project).source_count === 'number' ? (p as Project).source_count : undefined,
                    }));
                setProjects(projectsWithDates);
                const onDefaultPageNow = isStandaloneChatPath(pathnameRef.current || '/');
                if (!onDefaultPageNow && initialProjectId) {
                    const target = projectsWithDates.find((p) => p.id === initialProjectId);
                    if (target) setCurrentProject(target);
                }
                /* 기본 접속 페이지(/)에서는 프로젝트 자동 선택하지 않음 — 비동기 완료 시점 경로(pathnameRef) 기준 */
            } catch (error) {
                errorLogger.error('프로젝트 불러오기 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'loadProjects',
                });
                // 폴백: 로컬 스토리지에서 직접 불러오기
                const savedProjects = localStorage.getItem(CHATGPT_PROJECTS_STORAGE_KEY);
                if (savedProjects) {
                    try {
                        const parsed = JSON.parse(savedProjects) as Array<{
                            id: string;
                            name: string;
                            description?: string;
                            createdAt: string;
                            updatedAt: string;
                        }>;
                        const projectsWithDates: Project[] = parsed
                            .filter((p) => p?.id && p?.name && String(p.name).trim().length >= 1)
                            .map((p) => ({
                                ...p,
                                name: String(p.name).length > 100 ? String(p.name).slice(0, 100) : p.name,
                                createdAt: safeDate(p.createdAt),
                                updatedAt: safeDate(p.updatedAt),
                            }));
                        setProjects(projectsWithDates);
                    } catch (parseError) {
                        errorLogger.error('프로젝트 파싱 실패', parseError instanceof Error ? parseError : new Error(String(parseError)), {
                            component: 'ChatGPTInterface',
                            action: 'parseProjects',
                        });
                    }
                }
            }
        };
        loadProjects();

        // 대화 불러오기 (로컬 스토리지)
        const saved = localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as Array<{
                    id: string;
                    title: string;
                    projectId?: string;
                    gensparkAgentId?: string;
                    pinned?: boolean;
                    messages: Array<{
                        id: string;
                        role: 'user' | 'assistant';
                        content: string;
                        timestamp: string;
                        bookmarked?: boolean;
                        reaction?: MessageReaction;
                        thinkingDurationMs?: number;
                        suggestedFollowUps?: string[];
                        pipelineExtras?: import('../utils/chatInputUtils').PipelineMessageExtras;
                    }>;
                    createdAt: string;
                    updatedAt: string;
                }>;
                const conversationsWithDates: Conversation[] = parsed
                    .filter((conv) => conv?.id && conv?.messages)
                    .map((conv) => {
                        const rawTitle = coerceTrimmedString(conv.title, '') || '새 대화';
                        const sanitizedTitle = rawTitle.length > CONCISE_CONVERSATION_TITLE_MAX_LEN * 2
                            ? `${rawTitle.substring(0, CONCISE_CONVERSATION_TITLE_MAX_LEN)}...`
                            : rawTitle;
                        const withDates: Conversation = {
                            ...conv,
                            title: sanitizedTitle,
                            gensparkAgentId: (() => {
                                if (typeof conv.gensparkAgentId !== 'string') return undefined;
                                const g = coerceTrimmedString(conv.gensparkAgentId, '');
                                return g || undefined;
                            })(),
                            createdAt: safeDate(conv.createdAt),
                            updatedAt: safeDate(conv.updatedAt),
                            messages: conv.messages.map((msg) => {
                                const restored = {
                                    ...msg,
                                    timestamp: safeDate(msg.timestamp),
                                };
                                if (
                                    restored.role === 'assistant' &&
                                    isAssistantGenerationPlaceholder(restored.content)
                                ) {
                                    restored.content = STORED_ASSISTANT_INCOMPLETE_NOTICE;
                                }
                                return restored;
                            }),
                        };
                        const flags = normalizeConversationDeepseekFlagsFromStorage(conv);
                        return { ...withDates, ...flags };
                    });
                setConversations(conversationsWithDates);
            } catch (error) {
                errorLogger.error('대화 불러오기 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'loadConversations',
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only init: currentProject intentionally excluded to avoid re-run on setCurrentProject
    }, []);

    // 사이드바 등에서 스토리지 기준으로 대화가 제거된 경우 목록·선택 동기화
    useEffect(() => {
        const onRemoved = (e: Event) => {
            const id = (e as CustomEvent<{ id: string }>).detail?.id;
            if (!id || typeof id !== 'string') return;
            setConversations((prev) => prev.filter((c) => c.id !== id));
            setCurrentConversation((prev) => (prev?.id === id ? null : prev));
        };
        window.addEventListener(CHATGPT_CONVERSATION_REMOVED_EVENT, onRemoved as EventListener);
        return () => window.removeEventListener(CHATGPT_CONVERSATION_REMOVED_EVENT, onRemoved as EventListener);
    }, []);

    // 사이드바에서 대화 클릭 시 해당 스레드 선택; state에 conversationId 없을 때는 "이전에 있던 게 사라진 경우"에만 초기화 (전송 직후 conversations 갱신 시 null 덮어쓰기 방지)
    // 기본 페이지(/)와 프로젝트 페이지(/projects/:id) 모두에서 처리 (conversationIdFromState는 라우터 직후 상단에서 계산)
    useEffect(() => {
        if (conversationIdFromState) {
            prevConversationIdFromStateRef.current = conversationIdFromState;
            if (conversations.length === 0) return;
            const conv = conversations.find((c) => c.id === conversationIdFromState);
            if (conv) {
                // 프로젝트 페이지에서 프로젝트 내 대화를 선택한 경우, 해당 프로젝트가 맞는지 확인
                if (!isDefaultPage && initialProjectId && conv.projectId !== initialProjectId) {
                    // 프로젝트가 맞지 않으면 무시 (다른 프로젝트의 대화)
                    return;
                }
                // 에이전트 페이지: 해당 id에 묶인 대화만
                if (gensparkRouteAgentId && conv.gensparkAgentId !== gensparkRouteAgentId) {
                    return;
                }
                // 기본 페이지에서 일반 대화를 선택한 경우, projectId가 없어야 함
                if (isDefaultPage && conv.projectId) {
                    // 일반 대화 섹션에서 프로젝트 소속 대화를 선택한 경우 무시
                    return;
                }
                // 홈(/)에서는 에이전트 전용 대화는 선택하지 않음
                if (isDefaultPage && conv.gensparkAgentId) {
                    return;
                }
                if (skipNextConversationIdFromStateSelectionRef.current) {
                    skipNextConversationIdFromStateSelectionRef.current = false;
                    return;
                }
                setCurrentConversation(conv);
            }
        } else {
            // 기본 페이지에서만 state가 없을 때 초기화 (프로젝트 페이지는 자동 선택 로직 사용)
            if (isDefaultPage) {
                const hadStateBefore = prevConversationIdFromStateRef.current !== undefined;
                prevConversationIdFromStateRef.current = undefined;
                if (hadStateBefore) setCurrentConversation(null);
            }
        }
    }, [isDefaultPage, conversationIdFromState, conversations, initialProjectId, gensparkRouteAgentId]);

    // 현재 대화가 바뀌면 location.state 동기화 → 사이드바에서 해당 대화 active 표시
    // 기본 페이지(/)와 프로젝트 페이지(/projects/:id) 모두에서 처리
    useEffect(() => {
        if (!currentConversation) return;
        if (conversationIdFromState === currentConversation.id) return;

        try {
            if (isDefaultPage) {
                navigate(getStandaloneChatPath(), { state: { conversationId: currentConversation.id }, replace: true });
            } else if (initialProjectId && currentConversation.projectId === initialProjectId) {
                // 프로젝트 페이지에서 프로젝트 내 대화가 선택된 경우
                navigate(`/projects/${initialProjectId}`, { state: { conversationId: currentConversation.id }, replace: true });
            } else if (
                gensparkRouteAgentId &&
                currentConversation.gensparkAgentId === gensparkRouteAgentId
            ) {
                navigate(`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(gensparkRouteAgentId)}`, {
                    state: { conversationId: currentConversation.id },
                    replace: true,
                });
            }
        } catch {
            /* 테스트(MemoryRouter)·비정상 라우트 상태에서 navigate 예외 방지 */
        }
        // id·projectId·conversationIdFromState·location.key 만 구독 (currentConversation 객체는 메시지마다 바뀌므로 제외 → replace 루프 방지)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- currentConversation 전체를 deps에 넣으면 메시지 갱신마다 navigate replace 루프
    }, [
        isDefaultPage,
        currentConversationId,
        currentConversationProjectId,
        conversationIdFromState,
        navigate,
        initialProjectId,
        gensparkRouteAgentId,
        currentConversation?.gensparkAgentId,
        location.key,
    ]);

    // URL /projects/:id 변경 시 currentProject 동기화 (목록에 있으면 선택) — 기본 페이지(/)에서는 실행하지 않음
    useEffect(() => {
        if (isDefaultPage || !initialProjectId || projects.length === 0) return;
        const target = projects.find((p) => p.id === initialProjectId);
        if (target) setCurrentProject(target);
    }, [isDefaultPage, initialProjectId, projects]);

    // 프로젝트 대화 진입 시 상세(파일·지침 등) 로드 — 기본 페이지(/)에서는 실행하지 않음
    useEffect(() => {
        if (isDefaultPage || !initialProjectId) return;
        let cancelled = false;
        // 테스트·모킹 누락 시 getProject가 Thenable이 아닐 수 있음 → 패시브 이펙트에서 `.then` 예외 방지
        Promise.resolve(projectService.getProject(initialProjectId)).then((full) => {
            if (cancelled || !full) return;
            const withDates: Project = {
                ...full,
                createdAt: safeDate(full.createdAt),
                updatedAt: safeDate(full.updatedAt),
                files: Array.isArray(full.files) ? full.files : [],
                webSources: Array.isArray(full.webSources) ? full.webSources : [],
            };
            setProjects((prev) => {
                const idx = prev.findIndex((p) => p.id === full.id);
                if (idx < 0) return [...prev, withDates];
                return prev.map((p) => (p.id === full.id ? withDates : p));
            });
            setCurrentProject(withDates);
        }).catch(() => { /* 목록 기준 currentProject 유지 */ });
        return () => { cancelled = true; };
    }, [isDefaultPage, initialProjectId]);

    // 프로젝트 상세(/projects/:id) 진입 시 해당 프로젝트의 가장 최근 대화 자동 선택 — 기존 대화 내역 표시
    // 단, state에 conversationId가 있으면 해당 대화를 우선 선택 (사이드바에서 클릭한 경우)
    useEffect(() => {
        if (isDefaultPage || !initialProjectId || !currentProject || currentProject.id !== initialProjectId) return;
        // state에 conversationId가 있으면 자동 선택하지 않음 (위의 conversationIdFromState effect에서 처리)
        if (conversationIdFromState) return;
        // 이미 이 프로젝트 소속 대화가 선택돼 있으면 사용자 선택 유지(덮어쓰지 않음)
        if (currentConversation?.projectId === currentProject.id) return;
        const projectConvs = conversations
            .filter((c) => c.projectId === currentProject.id)
            .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
        const mostRecent = projectConvs[0] ?? null;
        setCurrentConversation(mostRecent);
    }, [isDefaultPage, initialProjectId, currentProject, conversations, currentConversation?.projectId, conversationIdFromState]);

    // /projects/:id 가 바뀌면(또는 프로젝트 상세 이탈 후 재진입) 대화·소스 탭을 대화로 맞춤
    useEffect(() => {
        setProjectContentTab('chat');
    }, [initialProjectId]);

    // 소스 탭: 대화 헤더·검색이 숨겨지므로 검색 패널만 닫아 고아 UI 방지 (쿼리는 대화 탭 복귀 시 유지)
    useEffect(() => {
        if (currentProject && projectContentTab === 'sources') {
            setShowMessageSearch(false);
        }
    }, [currentProject, projectContentTab]);

    // 프로젝트 저장 (로컬 스토리지 동기화)
    useEffect(() => {
        if (projects.length > 0) {
            const toSave = projects.map((p) => ({
                ...p,
                createdAt: formatDateSafe(p.createdAt, (d) => d.toISOString(), new Date().toISOString()),
                updatedAt: formatDateSafe(p.updatedAt, (d) => d.toISOString(), new Date().toISOString()),
            }));
            localStorage.setItem(CHATGPT_PROJECTS_STORAGE_KEY, JSON.stringify(toSave));
        }
    }, [projects]);

    // 대화 저장
    useEffect(() => {
        const toSave = conversations.map((conv) => ({
            ...conv,
            createdAt: formatDateSafe(conv.createdAt, (d) => d.toISOString(), new Date().toISOString()),
            updatedAt: formatDateSafe(conv.updatedAt, (d) => d.toISOString(), new Date().toISOString()),
            messages: conv.messages.map((msg) => ({
                ...msg,
                timestamp: formatDateSafe(msg.timestamp, (d) => d.toISOString(), new Date().toISOString()),
            })),
        }));
        localStorage.setItem(CHATGPT_CONVERSATIONS_STORAGE_KEY, JSON.stringify(toSave));
        window.dispatchEvent(new CustomEvent(SIDEBAR_CHATS_UPDATED_EVENT));
    }, [conversations]);

    // 메시지 스크롤 (사용자가 아래쪽을 보고 있을 때만 자동 스크롤)
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        const root = messagesContainerRef.current;
        if (!root) return;
        try {
            /* scrollIntoView(끝 앵커)는 가끔 상위 스크롤포트(메인·body)까지 스크롤해 입력 도크가 밀려 보일 수 있음 → 메시지 열만 스크롤 */
            root.scrollTo({ top: root.scrollHeight, behavior });
        } catch {
            root.scrollTop = root.scrollHeight;
        }
    }, []);

    const scrollToTop = useCallback((behavior: ScrollBehavior = 'smooth') => {
        try {
            messagesContainerRef.current?.scrollTo({ top: 0, behavior });
        } catch {
            /* 테스트·헤드리스 환경에서 scrollTo 예외 방지 */
        }
    }, []);

    /** 모달 닫은 뒤 입력창으로 포커스 복귀 (접근성) */
    const focusChatInput = useCallback(() => {
        window.setTimeout(() => focusElementPreventScroll(inputRef.current ?? undefined), 0);
    }, []);

    const handleGoogleDriveNotebookImportSuccess = useCallback(() => {
        setNotebookSourcesRefreshToken((n) => n + 1);
        void refreshProjects();
        showToast('Google Drive에서 소스를 추가했습니다.', 'success');
        focusChatInput();
    }, [refreshProjects, focusChatInput]);

    const handleMessagesScroll = useCallback(() => {
        const el = messagesContainerRef.current;
        if (!el) return;
        const threshold = 120; // px
        const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        isNearBottomRef.current = distanceToBottom <= threshold;
        setShowScrollToBottom(distanceToBottom > threshold);
        setShowScrollToTop(el.scrollTop > threshold);
    }, []);

    useEffect(() => {
        const messages = currentConversation?.messages ?? [];
        const lastMsg = messages[messages.length - 1];
        const isLastAssistantLoading =
            lastMsg?.role === 'assistant' && !coerceTrimmedString(lastMsg.content, '');
        const isLastUserMessage = lastMsg?.role === 'user';
        /** 본문이 비어 있지 않아도 플레이스홀더(질문 분석·답변 생성 등)면 생성 과정 UI가 있음 — 그때도 스크롤해야 보임 */
        const isLastAssistantGenerationVisible =
            lastMsg?.role === 'assistant' &&
            typeof lastMsg.content === 'string' &&
            isAssistantGenerationStepUi(lastMsg.content);
        // 질문 전송 직후·빈 어시스턴트 슬롯·생성 단계(비스트리밍/스트리밍 프리리빌)일 때 하단으로 스크롤
        if (
            autoScroll &&
            (isNearBottomRef.current ||
                isLastAssistantLoading ||
                isLastUserMessage ||
                isLastAssistantGenerationVisible)
        ) {
            scrollToBottom(isStreaming ? 'auto' : 'smooth');
        }
    }, [currentConversation?.messages, isStreaming, scrollToBottom, autoScroll]);

    // 대화 전환 시 스크롤 버튼 상태 동기화
    useEffect(() => {
        const el = messagesContainerRef.current;
        if (!el || !currentConversation?.messages.length) {
            setShowScrollToBottom(false);
            setShowScrollToTop(false);
            return;
        }
        const threshold = 120;
        const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollToBottom(distanceToBottom > threshold);
        setShowScrollToTop(el.scrollTop > threshold);
    }, [currentConversation?.id, currentConversation?.messages.length]);

    // 대화 전환 시 메시지 영역으로 포커스 이동 (키보드·스크린 리더 사용자)
    useEffect(() => {
        const id = currentConversation?.id ?? null;
        if (id !== prevConversationIdRef.current && id != null) {
            prevConversationIdRef.current = id;
            const timer = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    try {
                        focusElementPreventScroll(messagesContainerRef.current ?? undefined);
                    } catch {
                        /* rAF 타이밍에 DOM이 사라진 경우 등 */
                    }
                });
            });
            return () => cancelAnimationFrame(timer);
        }
        prevConversationIdRef.current = id;
    }, [currentConversation?.id]);

    // API 오류 배너 표시 시 포커스 이동 및 assertive 알림
    useEffect(() => {
        if (isApiReachable === false) {
            const t = setTimeout(() => focusElementPreventScroll(apiUnreachableBannerRef.current ?? undefined), 100);
            return () => clearTimeout(t);
        }
    }, [isApiReachable]);

    useEffect(() => {
        if (!isStreaming || !responseStartTime) {
            if (!isStreaming) setStreamingElapsedSec(0);
            return;
        }
        const tick = () => setStreamingElapsedSec(Math.floor((Date.now() - responseStartTime) / 1000));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [isStreaming, responseStartTime]);

    // 새 프로젝트 생성 (백엔드 API 사용)
    // 프로젝트 생성 (useCallback으로 메모이제이션)
    const createNewProject = useCallback(async () => {
        const name = coerceTrimmedString(newProjectName, '').slice(0, 100);
        if (!name || name.length < 2) return;

        try {
            const createdProject = await projectService.createProject({
                name,
                description: '',
                files: [],
                instructions: '',
                tags: [],
                isActive: true,
                type: 'conversation',
                status: 'active',
            });

            const newProject: Project = {
                id: createdProject.id,
                name: createdProject.name,
                description: createdProject.description || '',
                createdAt: createdProject.createdAt,
                updatedAt: createdProject.updatedAt,
            };

            setProjects((prev) => [...prev, newProject]);
            setCurrentProject(newProject);
            setNewProjectName('');
            setShowProjectModal(false);
            focusChatInput();
            showToast('프로젝트가 생성되었습니다', 'success');
        } catch (error) {
            errorLogger.error('프로젝트 생성 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'createProject',
            });
            // 폴백: 로컬에서 생성
            const newProject: Project = {
                id: `project-${Date.now()}`,
                name,
                description: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setProjects((prev) => [...prev, newProject]);
            setCurrentProject(newProject);
            setNewProjectName('');
            setShowProjectModal(false);
            focusChatInput();
            showToast('프로젝트가 생성되었습니다', 'success');
        }
    }, [newProjectName, focusChatInput]);

    const applyWorkspaceProjectCreateResult = useCallback(
        async (wtr: WorkspaceProjectCreateToolResult) => {
            if (wtr.tool !== 'project_create' || !wtr.success || !wtr.data?.project_id) {
                return;
            }
            const conversationProjectId = currentConversation?.projectId;
            if (
                shouldSuppressWorkspaceProjectCreate(currentProject?.id, conversationProjectId)
            ) {
                showToast(
                    '선택한 프로젝트 대화를 이어갑니다. 같은 창에서 새 프로젝트는 만들지 않았습니다.',
                    'info',
                );
                return;
            }
            try {
                const loadedProjects = await projectService.getProjects();
                const projectsWithDates: Project[] = loadedProjects
                    .filter((p) => p?.id && p?.name)
                    .map((p) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description || '',
                        instructions: typeof p.instructions === 'string' ? p.instructions : '',
                        initialGuidelines: Array.isArray(p.initialGuidelines) ? p.initialGuidelines : [],
                        tags: Array.isArray(p.tags) ? p.tags : [],
                        files: Array.isArray(p.files) ? p.files : [],
                        webSources: Array.isArray(p.webSources)
                            ? p.webSources
                                  .filter((s) => s && typeof (s as { url?: string }).url === 'string')
                                  .map((s, i) => {
                                      const src = s as {
                                          id?: string;
                                          type?: string;
                                          url: string;
                                          title?: string;
                                          addedAt?: unknown;
                                      };
                                      return {
                                          id: src.id ?? `ws-${i}`,
                                          type: (src.type === 'video' ? 'video' : 'document') as
                                              | 'document'
                                              | 'video',
                                          url: src.url,
                                          title: src.title,
                                          addedAt: safeDate(src.addedAt),
                                      };
                                  })
                            : [],
                        createdAt: safeDate(p.createdAt),
                        updatedAt: safeDate(p.updatedAt),
                        source_count:
                            typeof (p as Project).source_count === 'number'
                                ? (p as Project).source_count
                                : undefined,
                    }));
                setProjects(projectsWithDates);
                const newProj = projectsWithDates.find((p) => p.id === wtr.data!.project_id);
                if (newProj) setCurrentProject(newProj);
                showToast(wtr.message || '프로젝트가 생성되었습니다', 'success');
            } catch (e) {
                errorLogger.error(
                    'workspace_tool_result 프로젝트 갱신 실패',
                    e instanceof Error ? e : new Error(String(e)),
                    { component: 'ChatGPTInterface', action: 'workspaceProjectCreateResult' },
                );
            }
        },
        [currentProject?.id, currentConversation?.projectId],
    );

    const openProjectEditModal = useCallback(
        (focus: 'required-guideline' | null = null) => {
            if (currentProject) {
                projectBeforeEditRef.current = currentProject;
            }
            setProjectEditFocusTarget(focus);
            setShowProjectEditModal(true);
        },
        [currentProject],
    );

    const closeProjectEditModal = useCallback(() => {
        setShowProjectEditModal(false);
        setProjectEditFocusTarget(null);
        const snap = projectBeforeEditRef.current;
        if (snap?.id && currentProject?.id === snap.id) {
            setCurrentProject(snap);
            setProjects((prev) => prev.map((p) => (p.id === snap.id ? snap : p)));
        }
        focusChatInput();
    }, [currentProject?.id, focusChatInput]);

    // 프로젝트 선택 (useCallback으로 메모이제이션)
    const _selectProject = useCallback((project: Project) => {
        setCurrentProject(project);
        // 해당 프로젝트의 대화만 필터링
        setConversations((prev) => {
            const projectConversations = prev.filter(
                (conv) => conv.projectId === project.id
            );
            if (projectConversations.length > 0) {
                setCurrentConversation(projectConversations[0]);
            } else {
                setCurrentConversation(null);
            }
            return prev; // conversations는 필터링하지 않고 그대로 유지 (필터링은 filteredConversations에서 처리)
        });
    }, []);

    // 새 대화 시작 (useCallback으로 메모이제이션) — 현재 선택된 프로젝트가 있으면 해당 프로젝트 소속, 없으면 일반 대화
    const startNewConversation = useCallback(() => {
        pendingConversationGraphContextRef.current = null;
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: '새 대화',
            messages: [],
            projectId: currentProject?.id,
            ...(gensparkRouteAgentId ? { gensparkAgentId: gensparkRouteAgentId } : {}),
            ...newConversationDeepseekDefaults(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setConversations((prev) => {
            const next = [newConversation, ...prev];
            // localStorage에 저장하고 사이드바 업데이트
            try {
                const toSave = next.map((conv) => ({
                    ...conv,
                    createdAt: formatDateSafe(conv.createdAt, (d) => d.toISOString(), new Date().toISOString()),
                    updatedAt: formatDateSafe(conv.updatedAt, (d) => d.toISOString(), new Date().toISOString()),
                    messages: conv.messages.map((msg) => ({
                        ...msg,
                        timestamp: formatDateSafe(msg.timestamp, (d) => d.toISOString(), new Date().toISOString()),
                    })),
                }));
                localStorage.setItem(CHATGPT_CONVERSATIONS_STORAGE_KEY, JSON.stringify(toSave));
                notifyLocalChatConversationsMutated();
            } catch (error) {
                errorLogger.error('대화 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'startNewConversation',
                });
            }
            return next;
        });
        setCurrentConversation(newConversation);
        
        // 프로젝트 페이지에서 새 대화 생성 시 URL과 state 업데이트
        if (!isDefaultPage && currentProject && newConversation.projectId === currentProject.id) {
            navigate(`/projects/${currentProject.id}`, { 
                state: { conversationId: newConversation.id }, 
                replace: true 
            });
        } else if (gensparkRouteAgentId) {
            navigate(`${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${encodeURIComponent(gensparkRouteAgentId)}`, {
                state: { conversationId: newConversation.id },
                replace: true,
            });
        } else if (isDefaultPage) {
            // 기본 페이지에서 새 대화 생성 시 state 업데이트
            navigate(getStandaloneChatPath(), { 
                state: { conversationId: newConversation.id }, 
                replace: true 
            });
        }
    }, [currentProject, isDefaultPage, navigate, gensparkRouteAgentId]);

    // `/agents?id=…` 진입: URL state에 대화 id가 없으면 해당 에이전트 전용 대화를 자동 선택하거나 새로 만든다 (빈 화면·웰컴 혼선 방지)
    useEffect(() => {
        if (!gensparkRouteAgentId) return;
        if (conversationIdFromState) return;
        if (currentConversation?.gensparkAgentId === gensparkRouteAgentId) return;

        const raw =
            typeof localStorage !== 'undefined'
                ? localStorage.getItem(CHATGPT_CONVERSATIONS_STORAGE_KEY)
                : null;
        if (conversations.length === 0) {
            if (raw === null) {
                startNewConversation();
                return;
            }
            try {
                const parsed = JSON.parse(raw) as unknown;
                if (Array.isArray(parsed) && parsed.length === 0) {
                    startNewConversation();
                    return;
                }
            } catch {
                startNewConversation();
                return;
            }
            return;
        }

        const agentConvs = conversations
            .filter((c) => !c.projectId && c.gensparkAgentId === gensparkRouteAgentId)
            .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
        const pick = agentConvs[0] ?? null;
        if (pick) {
            setCurrentConversation(pick);
        } else {
            startNewConversation();
        }
    }, [
        gensparkRouteAgentId,
        conversations,
        conversationIdFromState,
        currentConversation?.gensparkAgentId,
        startNewConversation,
    ]);

    // 일반 대화 생성 (프로젝트에 속하지 않은 새 대화만 생성)
    const _startNewGeneralConversation = useCallback(() => {
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: '새 대화',
            messages: [],
            projectId: undefined,
            ...newConversationDeepseekDefaults(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setCurrentProject(null);
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
    }, []);

    // 대화 선택 (useCallback으로 메모이제이션) — 선택 시 프로젝트 컨텍스트도 함께 전환
    const _selectConversation = useCallback((conversation: Conversation) => {
        setCurrentConversation(conversation);
        if (conversation.projectId) {
            const proj = projects.find((p) => p.id === conversation.projectId);
            if (proj) setCurrentProject(proj);
        } else {
            setCurrentProject(null);
        }
    }, [projects]);

    const mapCurrentProjectFiles = useCallback((): ProjectFile[] => {
        if (!currentProject) return [];
        return (currentProject.files ?? []).map((f, idx) => ({
            id: (f as ProjectFile).id ?? `file-${idx}-${f.name}`,
            name: f.name,
            type: ((f.type as ProjectFile['type']) || 'other'),
            size: f.size ?? 0,
            uploadedAt: (f as ProjectFile).uploadedAt ?? new Date(),
        }));
    }, [currentProject]);

    const mapCurrentProjectWebSources = useCallback((): ProjectLearningSource[] => {
        if (!currentProject) return [];
        return (currentProject.webSources ?? []).map((s, idx) => ({
            id: s.id ?? `web-${idx}-${s.url}`,
            type: s.type === 'video' ? 'video' : 'document',
            url: s.url,
            title: s.title,
            notebookSourceId: (s as ProjectLearningSource).notebookSourceId,
            addedAt: s.addedAt instanceof Date ? s.addedAt : new Date(s.addedAt ?? Date.now()),
        }));
    }, [currentProject]);

    const applyProjectSourceUpdate = useCallback(
        (updated: Awaited<ReturnType<typeof projectService.getProject>>) => {
            if (!updated) return;
            const withDates = {
                ...updated,
                createdAt: safeDate(updated.createdAt),
                updatedAt: safeDate(updated.updatedAt),
                files: Array.isArray(updated.files) ? updated.files : [],
                webSources: Array.isArray(updated.webSources) ? updated.webSources : [],
            };
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? withDates : p)));
            setCurrentProject(withDates);
            setNotebookSourcesRefreshToken((n) => n + 1);
            void refreshProjects();
        },
        [refreshProjects],
    );

    // 소스 추가 모달: 드래그/업로드한 파일을 현재 프로젝트에 추가
    const handleAddSourceFiles = useCallback(async (files: File[]) => {
        if (!currentProject?.id || !files.length || sourceFilesUploading) return;
        setSourceFilesUploading(true);
        try {
            const { project: updated, uploadFailedCount } = await projectService.appendProjectSourceFiles(
                currentProject.id,
                mapCurrentProjectFiles(),
                files,
            );
            applyProjectSourceUpdate(updated);
            setShowAddSourceModal(false);
            if (uploadFailedCount > 0 && uploadFailedCount < files.length) {
                showToast('일부 파일은 서버 업로드에 실패했지만 목록에 반영했습니다.', 'info');
            } else {
                showToast('소스가 추가되었습니다', 'success');
            }
        } catch (err) {
            errorLogger.error('소스 업로드 실패', err instanceof Error ? err : new Error(String(err)), { component: 'ChatGPTInterface', action: 'handleAddSourceFiles' });
            showToast('소스 추가에 실패했습니다.', 'error');
        } finally {
            setSourceFilesUploading(false);
        }
    }, [currentProject, sourceFilesUploading, mapCurrentProjectFiles, applyProjectSourceUpdate]);

    const handleRemoveSourceFile = useCallback(
        async (fileId: string) => {
            if (!currentProject?.id || sourceFilesUploading) return;
            setSourceFilesUploading(true);
            try {
                const updated = await projectService.removeProjectSourceFile(
                    currentProject.id,
                    mapCurrentProjectFiles(),
                    fileId,
                );
                if (updated) {
                    applyProjectSourceUpdate(updated);
                    showToast('소스를 목록에서 제거했습니다.', 'success');
                }
            } catch (err) {
                errorLogger.error(
                    '소스 제거 실패',
                    err instanceof Error ? err : new Error(String(err)),
                    { component: 'ChatGPTInterface', action: 'handleRemoveSourceFile' },
                );
                showToast('소스 제거에 실패했습니다.', 'error');
            } finally {
                setSourceFilesUploading(false);
            }
        },
        [currentProject, sourceFilesUploading, mapCurrentProjectFiles, applyProjectSourceUpdate],
    );

    const handleAddWebSourceUrl = useCallback(
        async (rawUrl: string) => {
            if (!currentProject?.id || sourceFilesUploading) return;
            const url = coerceTrimmedString(rawUrl, '');
            if (!url) {
                showToast('웹 문서 또는 영상 URL을 입력해 주세요.', 'info');
                return;
            }
            setSourceFilesUploading(true);
            try {
                const { project: updated, duplicate } = await projectService.appendProjectWebSource(
                    currentProject.id,
                    mapCurrentProjectWebSources(),
                    url,
                );
                if (duplicate) {
                    showToast('이미 등록된 URL입니다.', 'info');
                    return;
                }
            if (updated) {
                applyProjectSourceUpdate(updated);
                setShowAddSourceModal(false);
                showToast('웹 소스가 추가되었습니다', 'success');
            } else {
                showToast('웹 소스 추가에 실패했습니다.', 'error');
            }
        } catch (err) {
            errorLogger.error(
                '웹 소스 추가 실패',
                    err instanceof Error ? err : new Error(String(err)),
                    { component: 'ChatGPTInterface', action: 'handleAddWebSourceUrl' },
                );
                showToast('웹 소스 추가에 실패했습니다.', 'error');
            } finally {
                setSourceFilesUploading(false);
            }
        },
        [currentProject, sourceFilesUploading, mapCurrentProjectWebSources, applyProjectSourceUpdate],
    );

    const handleRemoveWebSource = useCallback(
        async (sourceId: string) => {
            if (!currentProject?.id || sourceFilesUploading) return;
            setSourceFilesUploading(true);
            try {
                const updated = await projectService.removeProjectWebSource(
                    currentProject.id,
                    mapCurrentProjectWebSources(),
                    sourceId,
                );
                if (updated) {
                    applyProjectSourceUpdate(updated);
                    showToast('웹 소스를 목록에서 제거했습니다.', 'success');
                }
            } catch (err) {
                errorLogger.error(
                    '웹 소스 제거 실패',
                    err instanceof Error ? err : new Error(String(err)),
                    { component: 'ChatGPTInterface', action: 'handleRemoveWebSource' },
                );
                showToast('웹 소스 제거에 실패했습니다.', 'error');
            } finally {
                setSourceFilesUploading(false);
            }
        },
        [currentProject, sourceFilesUploading, mapCurrentProjectWebSources, applyProjectSourceUpdate],
    );

    // 입력 검증: null=빈값, 그 외=trimmed 텍스트(전송용). 글자 수 제한 없음.
    const validateInput = useCallback((text: string): string | null => {
        const trimmed = coerceTrimmedString(text, '');
        if (!trimmed) return null;
        return trimmed;
    }, []);

    // 에러 메시지 생성 헬퍼 함수 (상태 코드별 사용자 안내)
    const getErrorMessage = useCallback((error: unknown): string => {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                return '요청 시간이 초과되었습니다. 네트워크 연결을 확인해 주세요.';
            }
            if (error.response) {
                const status = error.response.status;
                const serverMessage =
                    (error.response.data && typeof error.response.data === 'object' && (error.response.data as { error?: string }).error) ||
                    (typeof error.response.data === 'string' ? error.response.data : null);
                if (status === 400) return serverMessage || '잘못된 요청입니다.';
                if (status === 401) return serverMessage || '인증이 필요합니다.';
                if (status === 404) return serverMessage || '대화 API를 찾을 수 없습니다. 서버 주소를 확인해 주세요.';
                if (status === 429) return serverMessage || '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
                if (status === 500) return serverMessage || '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
                if (status === 503) return serverMessage || '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.';
                return (serverMessage as string) || error.message;
            }
            if (error.request) {
                return '서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.';
            }
            return error.message;
        }
        if (error instanceof Error) {
            const msg = error.message || '';
            if (/failed to fetch|networkerror|network error|load failed|connection refused/i.test(msg)) {
                return '백엔드에 연결할 수 없습니다. 터미널에서 npm run restart:backend 실행 후 페이지를 새로고침해 주세요.';
            }
            return msg || '알 수 없는 오류가 발생했습니다.';
        }
        return '알 수 없는 오류가 발생했습니다.';
    }, []);

    // 대화 제목 자동 생성 함수
    const generateConversationTitle = useCallback(async (
        userMessage: string,
        assistantResponse?: string
    ): Promise<string> => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.CHAT_TITLE,
                {
                    message: userMessage,
                    assistant_response: assistantResponse,
                    max_length: 30,
                },
                { timeout: 5000 }
            );

            if (response.data?.data?.title) {
                const rawApiTitle = coerceTrimmedString(response.data.data.title, '');
                if (rawApiTitle) {
                    // 백엔드가 max_length를 무시하더라도 30자 상한 보장
                    return rawApiTitle.length <= CONCISE_CONVERSATION_TITLE_MAX_LEN
                        ? rawApiTitle
                        : `${rawApiTitle.substring(0, CONCISE_CONVERSATION_TITLE_MAX_LEN)}...`;
                }
            }
        } catch (error) {
            errorLogger.warn('대화 제목 자동 생성 실패, 기본 제목 사용', {
                component: 'ChatGPTInterface',
                action: 'generateConversationTitle',
                error: error instanceof Error ? error.message : String(error),
            });
        }

        return conversationListTitleFromUserMessage(userMessage);
    }, []);

    // 대화 저장 헬퍼 함수
    const saveConversationsToStorage = useCallback((conversationsToSave: Conversation[]) => {
        try {
            const toSave = conversationsToSave.map((conv) => {
                const safeTitle = (() => {
                    const t = coerceTrimmedString(conv.title, '') || '새 대화';
                    if (t.length <= CONCISE_CONVERSATION_TITLE_MAX_LEN) return t;
                    return `${t.substring(0, CONCISE_CONVERSATION_TITLE_MAX_LEN)}...`;
                })();
                return {
                    ...conv,
                    title: safeTitle,
                    createdAt: formatDateSafe(conv.createdAt, (d) => d.toISOString(), new Date().toISOString()),
                    updatedAt: formatDateSafe(conv.updatedAt, (d) => d.toISOString(), new Date().toISOString()),
                    messages: conv.messages.map((msg) => ({
                        ...msg,
                        timestamp: formatDateSafe(msg.timestamp, (d) => d.toISOString(), new Date().toISOString()),
                    })),
                };
            });
            localStorage.setItem(CHATGPT_CONVERSATIONS_STORAGE_KEY, JSON.stringify(toSave));
        } catch (error) {
            errorLogger.error('대화 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'saveConversationsToStorage',
            });
        }
    }, []);

    /** 현재 대화에 태그 추가 */
    const addTagToCurrentConv = useCallback((tag: string) => {
        const t = tag.trim().replace(/^#/, '');
        if (!t || !currentConversation) return;
        setConversations(prev => {
            const updated = prev.map(c => {
                if (c.id !== currentConversation.id) return c;
                const tags = c.tags ?? [];
                if (tags.includes(t) || tags.length >= 8) return c;
                return { ...c, tags: [...tags, t] };
            });
            saveConversationsToStorage(updated);
            return updated;
        });
        setCurrentConversation(prev => prev ? { ...prev, tags: [...(prev.tags ?? []).filter(x => x !== t), t] } : prev);
        setConvTagInput('');
    }, [currentConversation, saveConversationsToStorage]);

    /** 현재 대화에서 태그 삭제 */
    const removeTagFromCurrentConv = useCallback((tag: string) => {
        if (!currentConversation) return;
        setConversations(prev => {
            const updated = prev.map(c => {
                if (c.id !== currentConversation.id) return c;
                return { ...c, tags: (c.tags ?? []).filter(t => t !== tag) };
            });
            saveConversationsToStorage(updated);
            return updated;
        });
        setCurrentConversation(prev => prev ? { ...prev, tags: (prev.tags ?? []).filter(t => t !== tag) } : prev);
    }, [currentConversation, saveConversationsToStorage]);

    const _updateConversationDeepseek = useCallback(
        (
            patch: Partial<
                Pick<
                    Conversation,
                    'deepseekReviewHints' | 'pipelineDeepSeekRefine' | 'pipelineDeepSeekReasoner'
                >
            >
        ) => {
            const id = currentConversation?.id;
            if (!id) return;
            setCurrentConversation((prev) => {
                if (!prev || prev.id !== id) return prev;
                return { ...prev, ...patch, updatedAt: new Date() };
            });
            setConversations((prev) => {
                const mapped = prev.map((c) =>
                    c.id === id ? { ...c, ...patch, updatedAt: new Date() } : c
                );
                saveConversationsToStorage(mapped);
                return mapped;
            });
        },
        [currentConversation?.id, saveConversationsToStorage]
    );

    const updateConversationThread = useCallback(
        (patch: Partial<Pick<Conversation, 'threadInstructions' | 'threadFiles'>>) => {
            const id = currentConversation?.id;
            if (!id) return;
            setCurrentConversation((prev) => {
                if (!prev || prev.id !== id) return prev;
                return { ...prev, ...patch, updatedAt: new Date() };
            });
            setConversations((prev) => {
                const mapped = prev.map((c) =>
                    c.id === id ? { ...c, ...patch, updatedAt: new Date() } : c
                );
                saveConversationsToStorage(mapped);
                return mapped;
            });
        },
        [currentConversation?.id, saveConversationsToStorage]
    );

    const onThreadContextFilesChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const list = e.target.files;
            if (!list?.length || !currentConversation) {
                e.target.value = '';
                return;
            }
            const existing = currentConversation.threadFiles ?? [];
            const next = [...existing];
            for (let i = 0; i < list.length; i++) {
                if (next.length >= MAX_THREAD_CONTEXT_FILES) break;
                const file = list.item(i);
                if (!file) continue;
                const id = `tf-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
                let textContent = '';
                const looksText =
                    file.type.startsWith('text/') ||
                    /\.(txt|md|mdx|csv|json|ts|tsx|js|jsx|mjs|cjs|css|html|htm|xml|yaml|yml|svg|sql)$/i.test(
                        file.name
                    );
                if (looksText && file.size <= MAX_THREAD_FILE_READ_BYTES) {
                    try {
                        textContent = (await file.text()).slice(0, MAX_THREAD_FILE_TEXT_CHARS);
                    } catch {
                        textContent = '';
                    }
                }
                next.push({
                    id,
                    name: file.name,
                    type: file.type || 'application/octet-stream',
                    size: file.size,
                    textContent: textContent || undefined,
                });
            }
            updateConversationThread({ threadFiles: next });
            e.target.value = '';
        },
        [currentConversation, updateConversationThread]
    );

    const removeThreadContextFile = useCallback(
        (fileId: string) => {
            if (!currentConversation) return;
            const next = (currentConversation.threadFiles ?? []).filter((f) => f.id !== fileId);
            updateConversationThread({ threadFiles: next.length ? next : undefined });
        },
        [currentConversation, updateConversationThread]
    );

    const _deepseekEffective = useMemo(
        () => resolveDeepseekFlagsForConversation(currentConversation ?? undefined),
        [currentConversation]
    );

    // 메시지 전송 — 입력창 엔터/전송 버튼 시 질문·요구를 받아 해당 답변 생성 로직으로 실행하는 단일 진입점
    // 흐름: (질문/요구) → 검증 → 구조화 프롬프트 → 딥러닝 보강 → 백엔드(CHAT_POST_PATH·CHAT_STREAM_PATH 폴백) → 응답 표시·품질 분석
    // 스트리밍: getChatStreamUrlsForConfigBase 순 → onChunk/onComplete. 비스트리밍: postChatAxiosWithFallback(apiClient) → extractResponseContent
    // overrideText: 엔터/전송 시 전달된 입력값(없으면 input 상태 사용)
    const canSend =
        !isLoading &&
        (!!inputTrimmed ||
            !!attachedImageAnalysis ||
            !!attachedConversationFile ||
            composerPendingAttachCount > 0);
    const sendMessage = useCallback(async (overrideText?: string) => {
        // 중복 호출 방지: 이미 전송 중이면 무시
        if (isLoading || isSendingRef.current) return;
        
        // 전송 시작 표시
        isSendingRef.current = true;

        const pendingComposerFiles = composerAttachRef.current?.getAttachedFiles() ?? [];
        const pendingAttachNames = pendingComposerFiles.map((f) => f.name);

        let textToSend = coerceTrimmedString(overrideText, input);
        const hasConversationFile = !!attachedConversationFile;
        const hasComposerFiles = pendingComposerFiles.length > 0;
        if (!textToSend && !hasConversationFile && !hasComposerFiles) {
            isSendingRef.current = false;
            return;
        }
        if (textToSend) {
            // 사용자 원문은 잘라내지 않음. `[출력 형식 지시]` 등 정규식 제거는 긴 명세에서 본문 전체가 사라질 수 있어 전송 경로에서 제거함.
            textToSend = coerceTrimmedString(textToSend.replace(/\n{4,}/g, '\n\n\n'), '');

            const validationResult = validateInput(textToSend);
            if (validationResult === null) {
                isSendingRef.current = false;
                return;
            }
            textToSend = validationResult;
        } else if (hasConversationFile || hasComposerFiles) {
            textToSend =
                '첨부한 파일을 읽고, 핵심 요약·쟁점·권장 조치를 정리해 주세요. (다음 전송에서 원하는 형식·톤을 적어 주시면 그에 맞춥니다.)';
        }

        let trimmedInput: string = textToSend;
        let effectiveInput = trimmedInput;
        let composerFileContent: string | undefined;
        let composerFileName: string | undefined;

        if (hasComposerFiles) {
            composerAttachRef.current?.clearAttachedFiles();
            const read = await readComposerAttachmentsForSend(pendingComposerFiles);
            if (read.unsupportedNames.length > 0) {
                showToast(
                    `다음 파일은 텍스트·이미지로만 보낼 수 있습니다: ${read.unsupportedNames.join(', ')}`,
                    'info',
                );
            }
            for (const img of read.imageFiles) {
                setImageAnalysisLoading(true);
                const analysis = await analyzeComposerImageFile(img);
                setImageAnalysisLoading(false);
                if (analysis) {
                    effectiveInput = `[이미지 첨부: ${img.name}]\n${analysis}\n\n${effectiveInput}`;
                }
            }
            if (read.contextBlocks.length > 0) {
                effectiveInput = `${read.contextBlocks.join('\n\n')}\n\n${effectiveInput}`;
            }
            composerFileContent = read.conversationFileContent;
            composerFileName = read.conversationFileName;
        }

        if (attachedImageAnalysis) {
            effectiveInput = `[이미지 분석 결과]\n${attachedImageAnalysis}\n\n[사용자 질문]\n${effectiveInput}`;
            setAttachedImageAnalysis(null);
        }
        // 같은 질문이라도 요청마다 변주 전략을 달리해 답변 다양성을 높임
        const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const variationInstruction = getVariationInstruction(requestId, effectiveInput);
        const styleLearningInstruction = buildWritingStyleLearningInstruction(writingStyleProfile);

        const graphHandoffCtxEarly = pendingConversationGraphContextRef.current;
        const skipComposerDiversityForGraph =
            graphHandoffCtxEarly?.[GRAPH_ANSWER_CONTEXT_FLAG] === true ||
            isCreateGraphAnswerRequest(trimmedInput);
        
        // 답변 다양성 향상: 요청마다 다른 접근 방식 사용 (강화). 긴 지시 덤프 붙여넣기는 중복 [강제] 생략.
        const diversityExtras =
            skipComposerDiversityForGraph || shouldOmitComposerDiversityDirectiveBlock(effectiveInput)
            ? []
            : [
                  '• [강제] 이전 답변과 완전히 다른 논리 전개 순서를 반드시 사용하세요. 같은 구조를 반복하지 마세요.',
                  '• [강제] 다양한 예시와 관점을 반드시 포함하여 답변의 깊이와 다양성을 높이세요.',
                  '• [강제] 사용자의 의도에 정확히 맞는 다양한 형식(보고서/칼럼/요약/단계별 가이드/Q&A/사건조사 등)을 자동으로 감지하고 적용하세요.',
                  '• [강제] 같은 질문이라도 매번 다른 접근 방식, 다른 예시, 다른 관점을 사용하여 답변의 다양성을 보장하세요.',
                  '• [강제] 사용자가 명시한 형식이나 스타일이 있으면 반드시 따르되, 그 안에서도 다양한 표현과 구조를 사용하세요.',
                  '• [강제] 창의적 대안과 반직관적 인사이트를 포함하여 독창적인 답변을 생성하세요.',
              ];
        const enhancedVariationInstruction = [variationInstruction, ...diversityExtras].filter(Boolean).join('\n');
        
        const requestMessage = buildStructuredGenerationPrompt(effectiveInput, {
            variationInstruction: enhancedVariationInstruction,
            styleLearningInstruction,
        });
        const answerTemperature = getAnswerTemperature();
        learnWritingStyleFromText(trimmedInput);

        // 입력 히스토리에 추가 (중복 방지)
        const hist = inputHistoryRef.current;
        if (hist[0] !== trimmedInput) {
            inputHistoryRef.current = [trimmedInput, ...hist];
        }
        inputHistoryIndexRef.current = -1;

        // 사용자 메시지는 원본 질문만 표시 (프롬프트 지시사항 제외)
        // 백엔드로는 requestMessage(프롬프트 포함)가 전송되지만, 화면에는 원본 질문만 표시
        const userDisplayContent =
            pendingAttachNames.length > 0
                ? `${trimmedInput}\n\n[첨부: ${pendingAttachNames.join(', ')}]`
                : trimmedInput;
        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: userDisplayContent,
            timestamp: new Date(),
        };

        // 현재 대화가 없으면 새로 생성 (입력 시작 시 목록용 제목 — 명시 제목 또는 30자 축약)
        const initialTitle = conversationListTitleFromUserMessage(trimmedInput);
        let conversation: Conversation = currentConversation || {
            id: `conv-${Date.now()}`,
            title: initialTitle,
            messages: [],
            projectId: currentProject?.id,
            ...(gensparkRouteAgentId ? { gensparkAgentId: gensparkRouteAgentId } : {}),
            ...newConversationDeepseekDefaults(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (gensparkRouteAgentId && !conversation.gensparkAgentId) {
            conversation = { ...conversation, gensparkAgentId: gensparkRouteAgentId };
        }

        /** 빈 스레드 첫 전송 시: 기존 제목 상태와 무관하게 입력 기반 간결 제목으로 즉시 정규화 */
        const hadNoPriorUserMessage = !conversation.messages.some((m) => m.role === 'user');
        if (hadNoPriorUserMessage) {
            const candidate = conversationListTitleFromUserMessage(trimmedInput);
            if (candidate !== '새 대화' && candidate !== conversation.title) {
                conversation = { ...conversation, title: candidate };
            }
        }

        // 사용자 메시지 추가 후 즉시 화면에 반영 (엔터 시 사용자 말이 바로 보이도록)
        // 현재 대화 없을 때도 flushSync 안에서만 갱신해, 환영 화면 → 메시지 뷰 전환이 한 번에 보이게 함
        // 중복 방지: 같은 ID나 내용의 메시지가 최근 1초 내에 추가되었는지 확인
        const isDuplicate = conversation.messages.some(m => 
            m.id === userMessage.id || 
            (m.role === 'user' && m.content === userMessage.content && 
             Math.abs(new Date(m.timestamp).getTime() - userMessage.timestamp.getTime()) < 1000)
        );
        
        if (isDuplicate) {
            // 중복 메시지면 전송 중단
            isSendingRef.current = false;
            setIsLoading(false);
            return;
        }
        
        const updatedMessages = [...conversation.messages, userMessage];
        const updatedConversation = {
            ...conversation,
            messages: updatedMessages,
            updatedAt: new Date(),
        };
        
        let nextConversationsForSidebarRefresh: Conversation[] | null = null;

        // 상태 업데이트를 한 번만 수행 (중복 방지)
        flushSync(() => {
            setCurrentConversation((prev) => {
                // 다른 conversation이면 유지
                if (prev && prev.id !== conversation.id) return prev;
                // 이미 같은 사용자 메시지가 있는지 확인 (중복 방지)
                const existingUserMsg = prev?.messages.find(m => 
                    m.id === userMessage.id || 
                    (m.role === 'user' && m.content === userMessage.content)
                );
                if (existingUserMsg) {
                    return prev; // 이미 같은 메시지가 있으면 업데이트하지 않음
                }
                return updatedConversation;
            });
            setConversations((prev) => {
                const idx = prev.findIndex((c) => c.id === conversation.id);
                if (idx >= 0) {
                    const existing = prev[idx];
                    // 이미 같은 사용자 메시지가 있는지 확인 (중복 방지)
                    const existingUserMsg = existing.messages.find(m => 
                        m.id === userMessage.id || 
                        (m.role === 'user' && m.content === userMessage.content)
                    );
                    if (existingUserMsg) {
                        return prev; // 이미 같은 메시지가 있으면 업데이트하지 않음
                    }
                    // 같은 conversation이면 업데이트, 아니면 유지
                    const next = prev.map((c) => (c.id === conversation.id ? updatedConversation : c));
                    nextConversationsForSidebarRefresh = next;
                    return next;
                }
                const next = [updatedConversation, ...prev];
                nextConversationsForSidebarRefresh = next;
                return next;
            });
            setInput('');
            inputValueRef.current = '';
            clearControlledTextareaAfterCommit(inputRef.current);
            setIsLoading(true);
            setResponseStartTime(Date.now());
        });

        if (nextConversationsForSidebarRefresh) {
            saveConversationsToStorage(nextConversationsForSidebarRefresh);
            notifyLocalChatConversationsMutated();
        }
        
        // conversation 변수를 업데이트된 것으로 교체
        conversation = updatedConversation;

        // 대화방 재진입 시에도 저장된 대화 스토리 반영 — conversations(로컬 스토리지 동기화) 우선 사용
        const conversationForHistory = conversations.find((c) => c.id === conversation.id);
        const messagesForHistory = (conversationForHistory ?? conversation).messages;
        const historyMessages = messagesForHistory.map((m) =>
            toChatTurnWithPipelineExtras({
                role: m.role,
                content: m.content,
                pipelineExtras: m.pipelineExtras,
            })
        );
        const hasConversationHistory = historyMessages.length > 0;
        const projectCtx = mergeProjectAndThreadChatContext(
            buildChatContext(currentProject ?? null),
            conversationForHistory ?? conversation
        );

        let conversationFileContent: string | undefined = composerFileContent;
        let conversationFileName: string | undefined = composerFileName;
        if (attachedConversationFile) {
            try {
                conversationFileContent = await attachedConversationFile.text();
                conversationFileName = attachedConversationFile.name || '대화.txt';
            } catch {
                showToast('대화 파일을 읽을 수 없습니다.', 'error');
                isSendingRef.current = false;
                setIsLoading(false);
                return;
            }
            setAttachedConversationFile(null);
        }

        /** 입력창 첨부·스레드 첨부까지 포함해 웹검색·자료 활용 등 플래그를 맞춤 (사용자 한 줄만 보면 오인 방지) */
        const featureCtx = buildMergedFeatureContextFromInputAndAttachments({
            trimmedUserInput: effectiveInput,
            conversationFileContent,
            threadAttachedFileContents: projectCtx?.thread_attached_file_contents as string | undefined,
        }) as Record<string, unknown>;
        const koreanSourceForProfile = buildKoreanProfileSourceStringForChat(
            trimmedInput,
            conversationFileContent,
            typeof projectCtx?.thread_attached_file_contents === 'string'
                ? projectCtx.thread_attached_file_contents
                : undefined,
        );

        skipClearOutboundStepUiForConversationChangeRef.current = true;
        setLastOutboundUserTextForStepUi(trimmedInput);
        window.setTimeout(() => {
            skipClearOutboundStepUiForConversationChangeRef.current = false;
        }, 0);
        {
            const pipelineScrollBench = pipelineBenchmarkPacingFromChatContext({
                gensparkRouteAgentId,
                useInformedOrSearch: !!(featureCtx.enable_web_research || featureCtx.prefer_informed_answer),
                projectId: currentProject?.id,
            });
            if (Boolean(coerceTrimmedString(gensparkRouteAgentId ?? '', '')) || pipelineScrollBench) {
                requestAnimationFrame(() => {
                    scrollToBottom('auto');
                });
            }
        }
        const parsedForPipelineTiming = parseQuestionRequirementSections(effectiveInput);
        const phaseDurationMultiplier = computeAssistantPipelineDurationMultiplier(
            trimmedInput,
            {
                enable_web_research: !!featureCtx.enable_web_research,
                prefer_informed_answer: !!featureCtx.prefer_informed_answer,
                multi_request_mode: !!(featureCtx as { multi_request_mode?: boolean }).multi_request_mode,
            },
            structuredInputAssistEnabled &&
                shouldTreatAsStructuredQuestionRequirements(parsedForPipelineTiming),
            Boolean(coerceTrimmedString(gensparkRouteAgentId ?? '', '')),
        );

        const convForThread = conversationForHistory ?? conversation;
        const { parsedInput, pipelineMerge, selfDevelopFlags: composerSelfDevelopFlags } =
            buildComposerPipelineContextAppend({
                trimmedInput,
                featureCtx: featureCtx as Record<string, unknown>,
                currentProjectId: currentProject?.id,
                gensparkRouteAgentId,
                composerResponseMode,
                responseStyle,
                conversationFileContent,
                conversationDeepseek: convForThread,
                hasConversationThreadContext: conversationHasThreadInstructionsOrFiles(convForThread),
                isGraphComposerAnswer: graphHandoffCtxEarly?.[GRAPH_ANSWER_CONTEXT_FLAG] === true,
            });

        const isColumnStyleRequest = detectColumnStyleIntent(trimmedInput);
        const baseQualityInstruction =
            '답변은 반드시 다음 수준을 만족하세요: (1) 핵심 요약을 먼저 3줄 이내로 제시 (2) 근거·출처가 있으면 명시 (3) 불확실한 내용은 "확인 필요"로 표기하고 추가 확인 질문 제시 (4) 실행 가능한 다음 단계 또는 구체적 액션 1개 이상 포함 (5) 흔한 수식어 대신 구체적 근거로 설명. (6) 사용자의 의도와 요구사항을 정확히 파악하여 그에 맞는 형식과 스타일로 답변하세요. (7) 같은 질문이라도 매번 다른 관점과 접근 방식을 사용하여 답변의 다양성을 보장하세요.';
        // 답변 다양성 및 유연성 향상을 위한 추가 컨텍스트 (강화)
        const diversityContext = {
            // 같은 질문에 대해 다양한 관점 제공 (강제)
            encourage_variety: true, // 항상 활성화
            // 요청마다 다른 접근 방식 사용 (강제)
            vary_approach: true,
            // 창의적 대안 제시 (강화)
            include_alternatives: answerDiversityMode === 'exploratory' || perspective === 'creative' || true, // 기본적으로 활성화
            // 매 요청마다 다른 논리 전개 순서 사용 (강제)
            vary_logical_flow: true,
            // 다양한 예시와 관점 포함 (강제)
            include_multiple_perspectives: true,
            // 사용자 의도에 맞는 다양한 형식 지원 (강제)
            support_all_formats: true,
        };

        const advancedMemoryExtension = REACT_APP_ADVANCED_MEMORY_CONTEXT
            ? await advancedConversationMemoryService.getCompactContextForUnifiedChat(
                  ADVANCED_MEMORY_USER_ID,
                  conversation.id
              )
            : null;

        const multilayerStyleHint = await maybeCompactMultilayerStyleHintForChatContext(trimmedInput);

        const graphHandoffCtx = pendingConversationGraphContextRef.current;
        const isGraphHandoff = graphHandoffCtx?.[GRAPH_ANSWER_CONTEXT_FLAG] === true;
        const graphHandoffQualityInstruction =
            isGraphHandoff && graphHandoffCtx?.answer_quality_instruction != null
                ? coerceTrimmedString(String(graphHandoffCtx.answer_quality_instruction), '')
                : '';

        const composerSimpleQuery = shouldUseSimpleComposerOutboundMessage(trimmedInput);
        const composerSelfDevelopActive = Object.keys(composerSelfDevelopFlags).length > 0;

        const chatContextWithHistory = {
            ...(advancedMemoryExtension ?? {}),
            ...(projectCtx ?? {}),
            ...(pendingConversationGraphContextRef.current ?? {}),
            ...pipelineMerge,
            ...featureCtx,
            ...(currentProject?.id || currentConversation?.projectId
                ? {
                      workspace_suppress_project_create: true,
                      suppress_workspace_project_create: true,
                      workspace_active_project_id: currentProject?.id ?? currentConversation?.projectId,
                  }
                : {}),
            ...(composerSimpleQuery
                ? {
                      composer_simple_query: true,
                      composer_direct_answer: true,
                      qa_pipeline_fast_path: true,
                      user_question_primary: trimmedInput,
                  }
                : { user_question_primary: trimmedInput }),
            ...composerSelfDevelopFlags,
            ...(conversationFileContent !== undefined && {
                conversation_file_content: conversationFileContent,
                conversation_file_name: conversationFileName,
            }),
            conversation_history: historyMessages,
            ...(parsedInput && { parsed_input: parsedInput }),
            /** 사용자 원문 — 요청에 맞는 답변 생성 시 백엔드가 우선 참고 */
            original_user_message: trimmedInput,
            ...(!isGraphHandoff ? { available_capabilities: AVAILABLE_CAPABILITIES_HINT } : {}),
            answer_quality_instruction: graphHandoffQualityInstruction
                ? graphHandoffQualityInstruction
                : isColumnStyleRequest
                  ? `${baseQualityInstruction}\n\n${COLUMN_QUALITY_INSTRUCTION}`
                  : baseQualityInstruction,
            ...(!isGraphHandoff ? { adapt_answer_to_request: ADAPT_ANSWER_TO_REQUEST_INSTRUCTION } : {}),
            ...(isColumnStyleRequest && !isGraphHandoff && { column_style_requested: true }),
            ...(hasAnyGuidance && projectGuidelineInstructionText
                ? { project_guideline_instruction: projectGuidelineInstructionText }
                : {}),
            ...(hasConversationHistory && {
                consistency_instruction:
                    '이전 대화에서 논의된 용어·가정·결정사항을 유지하여 일관되게 답변하세요. 최근 대화 맥락을 반드시 참고하세요.',
            }),
            ...((responseStyle === 'detailed' || responseStyle === 'comprehensive') &&
                !isGraphHandoff && {
                prefer_informed_answer: true,
            }),
            ...(isGraphHandoff
                ? {}
                : {
                      ...diversityContext,
                      flexible_output_format: true,
                      support_multiple_styles: true,
                      force_variety: true,
                      always_vary_response: true,
                      precise_intent_matching: true,
                      auto_format_detection: true,
                  }),
            // 한국어 이해·장르·화행 프로필 (다단계 파이프라인 입력 계층, v3 문서)
            ...(containsHangul(koreanSourceForProfile) && (() => {
                const prior = extractPriorTurnsForKoContext(
                    updatedMessages.map((m) =>
                        toChatTurnWithPipelineExtras({
                            role: m.role,
                            content: m.content,
                            pipelineExtras: m.pipelineExtras,
                        })
                    )
                );
                const koreanProfile = buildKoreanUnderstandingProfile(koreanSourceForProfile, prior);
                const genreControl = buildGenreControlProfile(koreanProfile);
                
                // 2단계 검증용 (errorLogger.debug → 개발만, 콘솔은 Verbose에서만 강조 표시)
                errorLogger.debug('[Korean Layer] Profile generated', {
                    component: 'ChatGPTInterface',
                    action: 'koreanLayerProfile',
                    genre: koreanProfile.genre,
                    speech_act: koreanProfile.speech_act,
                    formality: koreanProfile.formality,
                    tone_hint: koreanProfile.tone_hint,
                    audience_hint: koreanProfile.audience_hint,
                    ellipsis_notes: koreanProfile.ellipsis_resolution_notes.length,
                });
                errorLogger.debug('[Korean Layer] Genre Control', {
                    component: 'ChatGPTInterface',
                    action: 'koreanLayerGenreControl',
                    output_genre: genreControl.output_genre,
                    sentence_length: genreControl.sentence_length,
                    line_break_style: genreControl.line_break_style,
                    politeness: genreControl.politeness,
                });

                return {
                    korean_understanding: koreanProfile,
                    genre_control: genreControl,
                    korean_layer_instruction: buildKoreanUnderstandingInstructionBlock(
                        koreanProfile,
                        genreControl
                    ),
                    enable_korean_depth: true,
                };
            })()),
            ...(multilayerStyleHint ? { multilayer_style_hint: multilayerStyleHint } : {}),
        };

        const chatContextWithGraphIntent = withGraphCreateIntentInChatContext(
            trimmedInput,
            chatContextWithHistory as Record<string, unknown>,
            conversationFileContent,
        );

        /** `/agents?id=` 세션: 라우트 에이전트 메타가 요청 context에 항상 포함되도록 보강 */
        const chatContextForRequest = finalizeComposerContextForGraphChat(
            mergeSelfDevelopLessonsIntoContext(
                mergeGensparkRouteContextIntoRecordIfMissing(
                    chatContextWithGraphIntent,
                    gensparkRouteAgentId ?? null,
                ) as Record<string, unknown>,
                conversation.id,
            ),
        );

        const isGraphComposerAnswer = isConversationGraphComposerContext(
            chatContextForRequest as Record<string, unknown>,
        );

        const sequentialSendFlags = getComposerSequentialSendFlags(
            trimmedInput,
            chatContextForRequest as Record<string, unknown>,
            isStreamingSupported(),
        );

        // 생성 답변 능력 최대 활용: 검색·자료 활용 시 품질 상향 (basic→enhanced, enhanced→ultimate)
        const useInformedOrSearch = !!(featureCtx.enable_web_research || featureCtx.prefer_informed_answer);
        const pipelineBenchmarkPacing = pipelineBenchmarkPacingFromChatContext({
            gensparkRouteAgentId,
            useInformedOrSearch,
            projectId: currentProject?.id,
        });
        const isGensparkAgentRouteSession = Boolean(coerceTrimmedString(gensparkRouteAgentId ?? '', ''));
        const skipGensparkPostResponsePhases = !shouldUseComposerStreamPreReveal({
            trimmedInput,
            structuredInputAssistEnabled,
            multiRequestMode: !!(featureCtx as { multi_request_mode?: boolean }).multi_request_mode,
            benchmarkGenspark: pipelineBenchmarkPacing,
            gensparkAgentRouteSession: isGensparkAgentRouteSession,
        });
        const effectiveQuality: 'basic' | 'enhanced' | 'ultimate' = isGraphComposerAnswer
            ? 'enhanced'
            : useInformedOrSearch
              ? composerQuality === 'basic'
                  ? 'enhanced'
                  : composerQuality === 'enhanced'
                    ? 'ultimate'
                    : composerQuality
              : composerQuality;

        // 딥러닝 연동: 프롬프트 분석·보강 후 전송 메시지 생성 (딥시크 백엔드와 동일 파이프라인으로 답변 품질 향상)
        const projectContext = currentProject
            ? { name: currentProject.name, instructions: typeof currentProject.instructions === 'string' ? currentProject.instructions : undefined }
            : undefined;
        
        let messageToSend: string;
        if (isGraphComposerAnswer) {
            messageToSend = resolveUnifiedChatGraphOutboundMessage(
                trimmedInput,
                chatContextForRequest as Record<string, unknown>,
                trimmedInput,
            );
        } else if (composerSimpleQuery) {
            messageToSend = trimmedInput;
        } else {
            try {
                const messageToSendRaw = await buildMessageToSendForChat(
                    requestMessage,
                    effectiveInput,
                    projectContext,
                );
                messageToSend =
                    typeof messageToSendRaw === 'string' ? messageToSendRaw : messageToSendRaw.messageToSend;
            } catch (error) {
                errorLogger.error(
                    '프롬프트 보강 실패',
                    error instanceof Error ? error : new Error(String(error)),
                    {
                        component: 'ChatGPTInterface',
                        action: 'buildMessageToSendForChat',
                    },
                );
                messageToSend = requestMessage;
            }
        }

        const unifiedChatOutboundMessage = isGraphComposerAnswer
            ? messageToSend
            : resolveUnifiedChatGraphOutboundMessage(
                  trimmedInput,
                  chatContextForRequest as Record<string, unknown>,
                  messageToSend,
              );

        /** 첫 응답 후 목록 제목 — 스트리밍 완료·스트림 실패 폴백·비스트리밍에서 동일 입력 기준으로 한 번만 파싱 */
        const explicitTitleConciseFromInput = getConciseConversationTitleFromUserInput(trimmedInput);

        let clearAssistantStreamPhases: (() => void) | undefined;
        let clearNonStreamPhases: (() => void) | undefined;
        const sequentialMultiRequestItems = sequentialSendFlags.items;
        const buildSequentialItemOutbound = createComposerSequentialItemOutboundBuilder({
            items: sequentialMultiRequestItems,
            buildStructuredGenerationPrompt,
            variationInstruction: enhancedVariationInstruction,
            styleLearningInstruction,
            buildMessageToSendForChat,
            projectContext,
            onBuildError: (index, dlErr) => {
                errorLogger.error(
                    '순차 다중 요청 프롬프트 보강 실패',
                    dlErr instanceof Error ? dlErr : new Error(String(dlErr)),
                    {
                        component: 'ChatGPTInterface',
                        action: 'sequentialMultiRequestBuildMessage',
                        itemIndex: index,
                    },
                );
            },
        });

        const requestComposerRefinedAnswer = async (
            outboundMessage: string,
            contextForBody: Record<string, unknown>,
        ): Promise<string> => {
            const payload = buildChatGptNonStreamPostPayload(
                outboundMessage,
                effectiveQuality,
                contextForBody,
                buildComposerNonStreamChatExtras({
                    conversationId: conversation.id,
                    requestId: requestId,
                    responseStyle,
                    perspective,
                    diversityLevel: answerDiversityMode,
                    temperature: answerTemperature,
                    projectId: currentProject?.id,
                }),
                mergeScenarioAndConversationDeepseek(
                    scenarioInheritMergeOptionsFromPipelineLikeMessages(updatedMessages),
                    conversation,
                ),
            );
            const response = await postChatAxiosWithFallback(
                API_BASE_URL,
                payload,
                DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
            );
            const extracted = extractResponseContent(response);
            const display = resolveAssistantAnswerDisplayText(extracted);
            if (
                !display ||
                extracted === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
            ) {
                throw new Error('자가 개선 재생성 응답이 비어 있습니다.');
            }
            return display;
        };

        try {
            const shouldStream =
                useStreaming &&
                isStreamingSupported() &&
                !sequentialSendFlags.bypassStreamForSequentialMultiRequest &&
                !sequentialSendFlags.bypassStreamForMultiStepMultiRequest;

            if (shouldStream) {
                setIsStreaming(true);

                // AbortController 생성
                const abortController = new AbortController();
                abortControllerRef.current = abortController;

                const assistantId = `msg-${Date.now() + 1}`;
                const assistantMessage: Message = {
                    id: assistantId,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                };

                // 다단계 UI형 단계 UI: 항상 동일 assistant 슬롯을 두고 onChunk가 id로 갱신 (누락 시 스트림이 화면에 안 붙는 문제 방지)
                const step1Message: Message = {
                    ...assistantMessage,
                    content: skipGensparkPostResponsePhases ? '' : ASSISTANT_PLACEHOLDER_ANALYZING,
                };
                const initialMessages: Message[] = [...updatedMessages, step1Message];
                const initialConversation: Conversation = {
                    ...updatedConversation,
                    messages: initialMessages,
                    updatedAt: new Date(),
                };

                flushSync(() => {
                    setCurrentConversation(initialConversation);
                    setConversations((prev) => {
                        const idx = prev.findIndex((c) => c.id === conversation.id);
                        if (idx >= 0) {
                            return prev.map((c) => (c.id === conversation.id ? initialConversation : c));
                        }
                        return [initialConversation, ...prev];
                    });
                });

                let accumulatedText = '';
                const streamReducedMotion =
                    typeof window !== 'undefined' &&
                    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
                const useStreamPreReveal = shouldUseComposerStreamPreReveal({
                    trimmedInput,
                    structuredInputAssistEnabled,
                    multiRequestMode: !!(featureCtx as { multi_request_mode?: boolean }).multi_request_mode,
                    benchmarkGenspark: pipelineBenchmarkPacing,
                    gensparkAgentRouteSession: isGensparkAgentRouteSession,
                });
                const streamPreRevealActiveRef = { current: useStreamPreReveal };
                const serverDrovePipelinePhaseRef = { current: false };
                let clearClientStreamingPhases: (() => void) | undefined;

                const patchAssistantPipelinePhaseSlug = (slug: AssistantGenerationPhase) => {
                    flushSync(() => {
                        const patchConv = (conv: Conversation): Conversation => ({
                            ...conv,
                            updatedAt: new Date(),
                            messages: conv.messages.map((m) => {
                                if (m.id !== assistantId) return m;
                                const nextExtras = mergePipelineMessageExtras(
                                    { pipelineGenerationPhase: slug },
                                    m.pipelineExtras ?? {},
                                );
                                return { ...m, pipelineExtras: nextExtras };
                            }),
                        });
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            return patchConv(prev);
                        });
                        setConversations((prev) => {
                            const idx = prev.findIndex((c) => c.id === conversation.id);
                            if (idx < 0) return prev;
                            return prev.map((c) => (c.id === conversation.id ? patchConv(c) : c));
                        });
                    });
                };

                const flushAssistantStreamSlotContent = (content: string) => {
                    const display = resolveAssistantAnswerDisplayText(content);
                    if (!display) return;
                    flushSync(() => {
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            return {
                                ...prev,
                                updatedAt: new Date(),
                                messages: prev.messages.map((m) =>
                                    m.id === assistantId ? { ...m, content: display } : m,
                                ),
                            };
                        });
                        setConversations((prev) => {
                            const idx = prev.findIndex((c) => c.id === conversation.id);
                            if (idx >= 0) {
                                return prev.map((c) => {
                                    if (c.id !== conversation.id) return c;
                                    return {
                                        ...c,
                                        updatedAt: new Date(),
                                        messages: c.messages.map((m) =>
                                            m.id === assistantId ? { ...m, content: display } : m,
                                        ),
                                    };
                                });
                            }
                            return [
                                {
                                    ...initialConversation,
                                    updatedAt: new Date(),
                                    messages: initialMessages.map((m) =>
                                        m.id === assistantId ? { ...m, content: display } : m,
                                    ),
                                },
                                ...prev,
                            ];
                        });
                    });
                };

                const revealStreamContentEarly = () => {
                    if (!streamPreRevealActiveRef.current) return;
                    streamPreRevealActiveRef.current = false;
                    clearAssistantStreamPhases?.();
                    clearAssistantStreamPhases = undefined;
                    if (!serverDrovePipelinePhaseRef.current) {
                        clearClientStreamingPhases?.();
                        clearClientStreamingPhases = scheduleClientStreamingPipelinePhases({
                            multiplier: phaseDurationMultiplier,
                            benchmarkGenspark: pipelineBenchmarkPacing,
                            gensparkAgentRouteSession: isGensparkAgentRouteSession,
                            onPhase: (ph) => patchAssistantPipelinePhaseSlug(ph),
                        });
                    }
                    flushAssistantStreamSlotContent(accumulatedText);
                };

                if (useStreamPreReveal) {
                clearAssistantStreamPhases = scheduleAssistantPreRevealStreamPhases({
                    reducedMotion: streamReducedMotion,
                    durationMultiplier: phaseDurationMultiplier,
                    benchmarkGenspark: pipelineBenchmarkPacing,
                    gensparkAgentRouteSession: isGensparkAgentRouteSession,
                    setPlaceholder: (text) => {
                        if (!streamPreRevealActiveRef.current) return;
                        flushSync(() => {
                            setCurrentConversation((prev) => {
                                if (!prev || prev.id !== conversation.id) return prev;
                                const existingMsg = prev.messages.find((m) => m.id === assistantId);
                                if (!existingMsg || !streamPreRevealActiveRef.current) return prev;
                                if (!isAssistantGenerationPlaceholder(existingMsg.content)) return prev;
                                return {
                                    ...prev,
                                    updatedAt: new Date(),
                                    messages: prev.messages.map((m) =>
                                        m.id === assistantId ? { ...m, content: text } : m,
                                    ),
                                };
                            });
                            setConversations((prev) => {
                                const idx = prev.findIndex((c) => c.id === conversation.id);
                                if (idx < 0) return prev;
                                return prev.map((c) => {
                                    if (c.id !== conversation.id) return c;
                                    return {
                                        ...c,
                                        updatedAt: new Date(),
                                        messages: c.messages.map((m) =>
                                            m.id === assistantId ? { ...m, content: text } : m,
                                        ),
                                    };
                                });
                            });
                        });
                    },
                    onReveal: () => {
                        streamPreRevealActiveRef.current = false;
                        if (!serverDrovePipelinePhaseRef.current) {
                            clearClientStreamingPhases?.();
                            clearClientStreamingPhases = scheduleClientStreamingPipelinePhases({
                                multiplier: phaseDurationMultiplier,
                                benchmarkGenspark: pipelineBenchmarkPacing,
                                gensparkAgentRouteSession: isGensparkAgentRouteSession,
                                onPhase: (ph) => patchAssistantPipelinePhaseSlug(ph),
                            });
                        }
                        flushAssistantStreamSlotContent(accumulatedText);
                    },
                });
                } else {
                    streamPreRevealActiveRef.current = false;
                }

                const performNonStreamingFallback = async (): Promise<string> => {
                    const payload = buildChatGptNonStreamPostPayload(
                        unifiedChatOutboundMessage,
                        effectiveQuality,
                        chatContextForRequest,
                        buildComposerNonStreamChatExtras({
                            conversationId: conversation.id,
                            requestId: requestId,
                            responseStyle,
                            perspective,
                            diversityLevel: answerDiversityMode,
                            temperature: answerTemperature,
                            projectId: currentProject?.id,
                        }),
                        mergeScenarioAndConversationDeepseek(
                            scenarioInheritMergeOptionsFromPipelineLikeMessages(updatedMessages),
                            conversation
                        )
                    );
                    const response = await postChatAxiosWithFallback(
                        API_BASE_URL,
                        payload,
                        DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                        DEFAULT_CHAT_POST_FALLBACK_OPTIONS
                    );
                    const extracted = extractResponseContent(response);
                    const display = resolveAssistantAnswerDisplayText(extracted);
                    if (
                        !display ||
                        extracted === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
                    ) {
                        throw new Error(
                            '백엔드에서 유효한 응답을 받지 못했습니다. 응답 형식을 확인해주세요.'
                        );
                    }
                    return display;
                };

                const streamScenarioInherit =
                    scenarioInheritMergeOptionsFromPipelineLikeMessages(updatedMessages)
                        ?.recentMessagesForScenarioInherit;
                const streamMergeDeepseek = mergeScenarioAndConversationDeepseek(
                    undefined,
                    conversation,
                );
                const useSequentialStream = sequentialSendFlags.useSequentialStream;

                const finalizeComposerStreamResponse = async (
                    fullText: string,
                    metadata?: Record<string, unknown>,
                ) => {
                        clearClientStreamingPhases?.();
                        clearClientStreamingPhases = undefined;
                        clearAssistantStreamPhases?.();
                        clearAssistantStreamPhases = undefined;
                        streamPreRevealActiveRef.current = false;
                        setIsStreaming(false);
                        abortControllerRef.current = null;
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                            streamingRafRef.current = null;
                        }
                        
                        const mergedRaw = mergeStreamCompletionText(fullText, accumulatedText);
                        const displayText = resolveAssistantAnswerDisplayText(mergedRaw);

                        // 응답 검증 (플레이스홀더·빈 본문은 실패로 처리)
                        if (!displayText) {
                            const errorMsg = '응답을 생성할 수 없습니다. 다시 시도해 주세요.';
                            const finalMessages = initialMessages.map((m) =>
                                m.id === assistantId ? { ...m, content: errorMsg } : m
                            );
                            const finalConversation = {
                                ...initialConversation,
                                messages: finalMessages,
                                updatedAt: new Date(),
                            };
                            flushSync(() => {
                                setCurrentConversation((prev) => (prev && prev.id !== conversation.id ? prev : finalConversation));
                                setConversations((prev) => {
                                    const idx = prev.findIndex((c) => c.id === conversation.id);
                                    const next = idx >= 0
                                        ? prev.map((c) => (c.id === conversation.id ? finalConversation : c))
                                        : [finalConversation, ...prev];
                                    saveConversationsToStorage(next);
                                    return next;
                                });
                            });
                            return;
                        }

                        const patchSelfDevelopStatus = (statusText: string) => {
                            flushSync(() => {
                                setCurrentConversation((prev) => {
                                    if (!prev || prev.id !== conversation.id) return prev;
                                    return {
                                        ...prev,
                                        updatedAt: new Date(),
                                        messages: prev.messages.map((m) =>
                                            m.id === assistantId ? { ...m, content: statusText } : m,
                                        ),
                                    };
                                });
                            });
                        };
                        const sdResult = await applyComposerSelfDevelopIfEnabled({
                            draft: displayText,
                            userInput: trimmedInput,
                            baseContext: chatContextForRequest as Record<string, unknown>,
                            sessionId: conversation.id,
                            active: composerSelfDevelopActive && !isGraphComposerAnswer,
                            requestRefined: requestComposerRefinedAnswer,
                            stepPacingMs:
                                typeof window !== 'undefined' &&
                                window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
                                    ? 0
                                    : 140,
                            onStatusText: (text) => patchSelfDevelopStatus(text),
                            onPhase: (ph) =>
                                patchAssistantPipelinePhaseSlug(
                                    ph === 'critique' || ph === 'integrate'
                                        ? 'crosscheck'
                                        : ph === 'draft'
                                          ? 'draft'
                                          : 'verify',
                                ),
                            onImproved: () => showToast('답변을 자가 검증·개선했습니다.', 'success'),
                        });
                        const finalDisplayText = sdResult.text;
                        const selfDevelopExtras = sdResult.extras;

                        const suggestedFollowUps = parsePipelineFollowUpHints(metadata);
                        const pipelineExtras = mergeAssistantPipelineExtrasForTurn({
                            responseMeta: metadata,
                            requestContext: chatContextForRequest as Record<string, unknown>,
                            selfDevelopExtras: selfDevelopExtras,
                        });
                        const finalMessages = initialMessages.map((m) =>
                            m.id === assistantId
                                ? {
                                      ...m,
                                      content: finalDisplayText,
                                      ...(suggestedFollowUps?.length ? { suggestedFollowUps } : {}),
                                      ...(pipelineExtras ? { pipelineExtras } : {}),
                                  }
                                : m
                        );

                        // 딥러닝 연동: 응답 품질·감정 분석 (딥시크 답변과 동일 파이프라인, 비차단)
                        notebookLLMDeepLearningIntegration
                            .analyzeResponseWithDL(trimmedInput, finalDisplayText)
                            .catch(() => {});

                        recordAdvancedMemoryTurn(conversation.id, trimmedInput, finalDisplayText);

                        // 첫 응답 후 간결한 제목 자동 생성 (사이드바 대화 목록에 표시)
                        const newTitle = await resolveListTitleAfterAssistantReply({
                            conversationTitle: initialConversation.title,
                            shouldUpdateTitle: finalMessages.length >= 2,
                            explicitTitleConcise: explicitTitleConciseFromInput,
                            trimmedUserMessage: trimmedInput,
                            assistantDisplayText: finalDisplayText,
                            generateTitle: generateConversationTitle,
                        });

                        const finalConversation = {
                            ...initialConversation,
                            messages: finalMessages,
                            updatedAt: new Date(),
                            title: newTitle,
                        };

                        // 질문·답변 모두 화면에 확실히 출력되도록 즉시 반영 (prev가 null이어도 응답 표시)
                        // 중복 방지: 같은 conversation이 이미 최신 상태인지 확인
                        flushSync(() => {
                            setCurrentConversation((prev) => {
                                // 다른 conversation이면 유지, 같은 conversation이면 업데이트
                                if (prev && prev.id !== conversation.id) return prev;
                                // 이미 같은 메시지가 있는지 확인 (중복 방지)
                                const existingMsg = prev?.messages.find(m => m.id === assistantId);
                                if (existingMsg && existingMsg.content === finalDisplayText) {
                                    return prev; // 이미 같은 내용이면 업데이트하지 않음
                                }
                                return finalConversation;
                            });
                            setConversations((prev) => {
                                const idx = prev.findIndex((c) => c.id === conversation.id);
                                if (idx >= 0) {
                                    const existing = prev[idx];
                                    // 이미 같은 메시지가 있는지 확인 (중복 방지)
                                    const existingMsg = existing.messages.find(m => m.id === assistantId);
                                    if (existingMsg && existingMsg.content === finalDisplayText) {
                                        return prev; // 이미 같은 내용이면 업데이트하지 않음
                                    }
                                    const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                                    saveConversationsToStorage(next);
                                    return next;
                                }
                                const next = [finalConversation, ...prev];
                                saveConversationsToStorage(next);
                                return next;
                            });
                        });

                        // 스트리밍 응답의 워크스페이스 도구 결과 반영 (프로젝트 생성 시 목록 갱신)
                        const wtr = metadata?.workspace_tool_result as WorkspaceProjectCreateToolResult | undefined;
                        if (wtr) {
                            await applyWorkspaceProjectCreateResult(wtr);
                        }
                };

                const patchStreamMetadata = (meta: Record<string, unknown>) => {
                        if (skipGensparkPostResponsePhases) {
                            return;
                        }
                        const serverPhase = mapStreamMetadataToAssistantGenerationPhase(meta);
                        if (serverPhase) {
                            serverDrovePipelinePhaseRef.current = true;
                            clearClientStreamingPhases?.();
                            clearClientStreamingPhases = undefined;
                        }
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            const existingMsg = prev.messages.find((m) => m.id === assistantId);
                            if (!existingMsg) return prev;
                            const patched = patchAssistantMessageWithStreamMetadata(existingMsg, meta);
                            if (!patched) return prev;
                            return {
                                ...prev,
                                updatedAt: new Date(),
                                messages: prev.messages.map((m) =>
                                    m.id === assistantId ? patched : m,
                                ),
                            };
                        });
                        setConversations((prev) =>
                            prev.map((c) => {
                                if (c.id !== conversation.id) return c;
                                const existingMsg = c.messages.find((m) => m.id === assistantId);
                                if (!existingMsg) return c;
                                const patched = patchAssistantMessageWithStreamMetadata(existingMsg, meta);
                                if (!patched) return c;
                                return {
                                    ...c,
                                    updatedAt: new Date(),
                                    messages: c.messages.map((m) => (m.id === assistantId ? patched : m)),
                                };
                            }),
                        );
                };

                try {
                if (useSequentialStream) {
                    streamPreRevealActiveRef.current = false;
                    clearAssistantStreamPhases?.();
                    clearAssistantStreamPhases = undefined;
                    try {
                        await runComposerSequentialMultiRequestStream({
                            items: sequentialMultiRequestItems,
                            conversationId: conversation.id,
                            signal: abortController.signal,
                            buildItemOutboundMessage: buildSequentialItemOutbound,
                            buildItemStreamContext: (i) =>
                                buildSequentialMultiRequestItemContext(
                                    chatContextForRequest as Record<string, unknown>,
                                    sequentialMultiRequestItems,
                                    i,
                                ),
                            buildStreamRequestBody: (ctx) =>
                                buildComposerStreamChatRequestBody({
                                    quality: effectiveQuality,
                                    conversationId: conversation.id,
                                    context: ctx,
                                    requestId: requestId,
                                    responseStyle,
                                    perspective,
                                    diversityLevel: answerDiversityMode,
                                    temperature: answerTemperature,
                                    projectId: currentProject?.id,
                                }),
                            streamMessage: streamChatMessage,
                            onLiveIndex: setComposerMultiRequestLiveIndex,
                            onDisplayContent: flushAssistantStreamSlotContent,
                            streamOptionsBase: {
                                messagesForScenarioInherit: streamScenarioInherit,
                                mergeApiChatContextOptions: streamMergeDeepseek,
                            },
                            onStreamMetadata: patchStreamMetadata,
                            onStreamComplete: finalizeComposerStreamResponse,
                        });
                    } finally {
                        setComposerMultiRequestLiveIndex(null);
                    }
                } else if (isGraphComposerAnswer) {
                    streamPreRevealActiveRef.current = false;
                    clearAssistantStreamPhases?.();
                    clearClientStreamingPhases?.();
                    const graphResult = await generateGraphAnswerViaChat(
                        messageToSend,
                        chatContextForRequest as Record<string, unknown>,
                        {
                            signal: abortController.signal,
                            preferStream: true,
                            onPhase: (ph) => patchAssistantPipelinePhaseSlug(ph),
                            onChunk: (_acc, displayText) => {
                                if (displayText) {
                                    accumulatedText = displayText;
                                    flushAssistantStreamSlotContent(displayText);
                                }
                            },
                            onSelfImproveRetry: () => {
                                patchAssistantPipelinePhaseSlug('retry');
                            },
                        },
                    );
                    if (graphResult) {
                        await finalizeComposerStreamResponse(graphResult);
                    } else {
                        try {
                            const fallbackText = await performNonStreamingFallback();
                            await finalizeComposerStreamResponse(fallbackText);
                        } catch (graphFallbackErr) {
                            const graphErrMsg = getErrorMessage(graphFallbackErr);
                            await finalizeComposerStreamResponse(
                                `❌ **관계도 답변 생성 실패**\n\n${graphErrMsg}\n\n백엔드 연결을 확인한 뒤 다시 시도하거나, 「대화 관계도」 화면의 답변 생성을 이용해 주세요.`,
                            );
                        }
                    }
                } else {
                await streamChatMessage(unifiedChatOutboundMessage, conversation.id, {
                    signal: abortController.signal,
                    messagesForScenarioInherit: streamScenarioInherit,
                    mergeApiChatContextOptions: streamMergeDeepseek,
                    requestBody: buildComposerStreamChatRequestBody({
                        quality: effectiveQuality,
                        conversationId: conversation.id,
                        context: chatContextForRequest,
                        requestId: requestId,
                        responseStyle,
                        perspective,
                        diversityLevel: answerDiversityMode,
                        temperature: answerTemperature,
                        projectId: currentProject?.id,
                    }),
                    onChunk: (chunk: string) => {
                        accumulatedText += chunk;
                        if (streamPreRevealActiveRef.current) {
                            const preview = resolveAssistantAnswerDisplayText(accumulatedText);
                            if (preview.length > 0) {
                                revealStreamContentEarly();
                            }
                            if (streamPreRevealActiveRef.current) {
                                return;
                            }
                        }
                        const preview = resolveAssistantAnswerDisplayText(accumulatedText);
                        if (!preview.length) {
                            return;
                        }
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                        }
                        streamingRafRef.current = requestAnimationFrame(() => {
                            flushAssistantStreamSlotContent(accumulatedText);
                        });
                    },
                    onMetadata: patchStreamMetadata,
                    onComplete: (completedText, metadata) =>
                        finalizeComposerStreamResponse(
                            mergeStreamCompletionText(completedText, accumulatedText),
                            metadata,
                        ),
                    onError: (error: Error) => {
                        clearClientStreamingPhases?.();
                        clearClientStreamingPhases = undefined;
                        clearAssistantStreamPhases?.();
                        clearAssistantStreamPhases = undefined;
                        streamPreRevealActiveRef.current = false;
                        setIsStreaming(false);
                        isSendingRef.current = false;
                        abortControllerRef.current = null;
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                            streamingRafRef.current = null;
                        }
                        const errorContent = getErrorMessage(error);
                        const finalMessages = initialMessages.map((m) =>
                            m.id === assistantId
                                ? {
                                    ...m,
                                    content: `❌ **오류 발생**\n\n${errorContent}\n\n다시 시도해주시거나 다른 질문을 해주세요.`,
                                }
                                : m
                        );
                        const finalConversation = {
                            ...initialConversation,
                            messages: finalMessages,
                            updatedAt: new Date(),
                        };

                        flushSync(() => {
                            setCurrentConversation((prev) => {
                                // 다른 conversation이면 유지
                                if (prev && prev.id !== conversation.id) return prev;
                                // 이미 같은 에러 메시지가 있는지 확인 (중복 방지)
                                const existingMsg = prev?.messages.find(m => 
                                    m.id === assistantId && 
                                    m.content.includes('❌ **오류 발생**')
                                );
                                if (existingMsg) {
                                    return prev; // 이미 에러 메시지가 있으면 업데이트하지 않음
                                }
                                return finalConversation;
                            });
                            setConversations((prev) => {
                                const idx = prev.findIndex((c) => c.id === conversation.id);
                                if (idx >= 0) {
                                    const existing = prev[idx];
                                    // 이미 같은 에러 메시지가 있는지 확인 (중복 방지)
                                    const existingMsg = existing.messages.find(m => 
                                        m.id === assistantId && 
                                        m.content.includes('❌ **오류 발생**')
                                    );
                                    if (existingMsg) {
                                        return prev; // 이미 에러 메시지가 있으면 업데이트하지 않음
                                    }
                                    return prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                                }
                                return [finalConversation, ...prev];
                            });
                        });
                    },
                });
                }
                    } catch (streamErr) {
                    // 사용자 취소(AbortError)가 아니면 스트리밍 실패로 간주하고 비스트리밍 폴백 시도
                    if (streamErr instanceof Error && streamErr.name === 'AbortError') {
                        clearClientStreamingPhases?.();
                        clearClientStreamingPhases = undefined;
                        clearAssistantStreamPhases?.();
                        clearAssistantStreamPhases = undefined;
                        isSendingRef.current = false;
                        throw streamErr;
                    }
                    setIsStreaming(false);
                    isSendingRef.current = false;
                    abortControllerRef.current = null;
                    if (streamingRafRef.current) {
                        cancelAnimationFrame(streamingRafRef.current);
                        streamingRafRef.current = null;
                    }
                    clearClientStreamingPhases?.();
                    clearClientStreamingPhases = undefined;
                    clearAssistantStreamPhases?.();
                    clearAssistantStreamPhases = undefined;
                    streamPreRevealActiveRef.current = false;
                    setCurrentConversation((prev) => {
                        if (!prev || prev.id !== conversation.id) return prev;
                        return {
                            ...prev,
                            messages: prev.messages.map((m) =>
                                m.id === assistantId ? { ...m, content: ASSISTANT_PLACEHOLDER_RETRY_NONSTREAM } : m
                            ),
                        };
                    });
                    try {
                        const responseContent = await performNonStreamingFallback();
                        // 프롬프트 지시사항 제거
                        const displayContent =
                            resolveAssistantAnswerDisplayText(responseContent || '') ||
                            '응답을 생성할 수 없습니다. 다시 시도해 주세요.';
                        const patchFallbackAssistantPhase = (phaseText: string) => ({
                            ...initialConversation,
                            updatedAt: new Date(),
                            messages: initialMessages.map((m) =>
                                m.id === assistantId ? { ...m, content: phaseText } : m
                            ),
                        });
                        if (!skipGensparkPostResponsePhases) {
                            await runAssistantNonStreamPostResponsePhases(
                                (text) => {
                                    const nextConv = patchFallbackAssistantPhase(text);
                                    flushSync(() => {
                                        setCurrentConversation((prev) =>
                                            prev && prev.id !== conversation.id ? prev : nextConv,
                                        );
                                        setConversations((prev) => {
                                            const idx = prev.findIndex((c) => c.id === conversation.id);
                                            if (idx >= 0) {
                                                return prev.map((c) =>
                                                    c.id === conversation.id ? nextConv : c,
                                                );
                                            }
                                            return [nextConv, ...prev];
                                        });
                                    });
                                },
                                {
                                    durationMultiplier: phaseDurationMultiplier,
                                    benchmarkGenspark: pipelineBenchmarkPacing,
                                    gensparkAgentRouteSession: isGensparkAgentRouteSession,
                                },
                            );
                        }
                        const finalMessages = initialMessages.map((m) =>
                            m.id === assistantId ? { ...m, content: displayContent } : m
                        );
                        const newTitle = await resolveListTitleAfterAssistantReply({
                            conversationTitle: initialConversation.title,
                            shouldUpdateTitle: finalMessages.length >= 2,
                            explicitTitleConcise: explicitTitleConciseFromInput,
                            trimmedUserMessage: trimmedInput,
                            assistantDisplayText: displayContent,
                            generateTitle: generateConversationTitle,
                        });
                        const finalConversation = {
                            ...initialConversation,
                            messages: finalMessages,
                            updatedAt: new Date(),
                            title: newTitle,
                        };
                        flushSync(() => {
                            setCurrentConversation((prev) => (prev && prev.id !== conversation.id ? prev : finalConversation));
                            setConversations((prev) => {
                                const idx = prev.findIndex((c) => c.id === conversation.id);
                                const next =
                                    idx >= 0
                                        ? prev.map((c) => (c.id === conversation.id ? finalConversation : c))
                                        : [finalConversation, ...prev];
                                saveConversationsToStorage(next);
                                return next;
                            });
                        });
                        recordAdvancedMemoryTurn(conversation.id, trimmedInput, displayContent);
                    } catch (fallbackErr) {
                        isSendingRef.current = false;
                        const errorContent = getErrorMessage(fallbackErr);
                        const finalMessages = initialMessages.map((m) =>
                            m.id === assistantId
                                ? {
                                    ...m,
                                    content: `❌ **오류 발생**\n\n스트리밍 실패 후 재시도에도 실패했습니다.\n\n${errorContent}\n\n다시 시도해주시거나 다른 질문을 해주세요.`,
                                }
                                : m
                        );
                        const finalConversation = {
                            ...initialConversation,
                            messages: finalMessages,
                            updatedAt: new Date(),
                        };
                        flushSync(() => {
                            setCurrentConversation((prev) => (prev && prev.id !== conversation.id ? prev : finalConversation));
                            setConversations((prev) => {
                                const idx = prev.findIndex((c) => c.id === conversation.id);
                                if (idx >= 0) {
                                    return prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                                }
                                return [finalConversation, ...prev];
                            });
                        });
                    }
                }
            } else {
                setIsStreaming(false);
                // 비스트리밍: 질문·요구 전송 직후 답변 슬롯을 두고 단계 문구를 갱신(API 대기 중에도 과정이 보이게)
                const placeholderAssistantId = `msg-${Date.now() + 1}`;
                const placeholderAssistant: Message = {
                    id: placeholderAssistantId,
                    role: 'assistant',
                    content: skipGensparkPostResponsePhases ? '' : ASSISTANT_PLACEHOLDER_ANALYZING,
                    timestamp: new Date(),
                };
                const placeholderMessages: Message[] = [...updatedMessages, placeholderAssistant];
                const placeholderConversation: Conversation = {
                    ...updatedConversation,
                    messages: placeholderMessages,
                    updatedAt: new Date(),
                };
                flushSync(() => {
                    setCurrentConversation(placeholderConversation);
                    setConversations((prev) => {
                        const idx = prev.findIndex((c) => c.id === conversation.id);
                        if (idx >= 0) {
                            return prev.map((c) => (c.id === conversation.id ? placeholderConversation : c));
                        }
                        return [placeholderConversation, ...prev];
                    });
                });

                // 단계 1: 질문 분석 중 표시
                const updateGenerationStep = (step: string) => {
                    const updatedStepMessages = placeholderMessages.map((m) =>
                        m.id === placeholderAssistantId ? { ...m, content: step } : m
                    );
                    const updatedStepConversation = {
                        ...placeholderConversation,
                        messages: updatedStepMessages,
                        updatedAt: new Date(),
                    };
                    flushSync(() => {
                        setCurrentConversation(updatedStepConversation);
                        setConversations((prev) => {
                            const idx = prev.findIndex((c) => c.id === conversation.id);
                            if (idx >= 0) {
                                return prev.map((c) => (c.id === conversation.id ? updatedStepConversation : c));
                            }
                            return [updatedStepConversation, ...prev];
                        });
                    });
                };

                if (isGraphComposerAnswer) {
                    const graphText = await generateGraphAnswerViaChat(
                        messageToSend,
                        chatContextForRequest as Record<string, unknown>,
                        {
                            preferStream: false,
                            onPhase: (ph) => {
                                const label =
                                    ph === 'analyze'
                                        ? ASSISTANT_PLACEHOLDER_ANALYZING
                                        : ph === 'outline'
                                          ? ASSISTANT_PLACEHOLDER_OUTLINE
                                          : ph === 'draft'
                                            ? ASSISTANT_PLACEHOLDER_DRAFT
                                            : ph === 'crosscheck'
                                              ? ASSISTANT_PLACEHOLDER_CROSSCHECK
                                              : ph === 'retry'
                                                ? ASSISTANT_PLACEHOLDER_RETRY_NONSTREAM
                                                : ASSISTANT_PLACEHOLDER_VERIFY;
                                updateGenerationStep(label);
                            },
                        },
                    );
                    const displayContent = coerceTrimmedString(cleanResponseText(graphText ?? ''), '');
                    const finalContent = displayContent || '응답을 생성할 수 없습니다. 다시 시도해 주세요.';
                    const finalMessages = placeholderMessages.map((m) =>
                        m.id === placeholderAssistantId ? { ...m, content: finalContent } : m,
                    );
                    const newTitle = await resolveListTitleAfterAssistantReply({
                        conversationTitle: placeholderConversation.title,
                        shouldUpdateTitle: finalMessages.length >= 2,
                        explicitTitleConcise: explicitTitleConciseFromInput,
                        trimmedUserMessage: trimmedInput,
                        assistantDisplayText: finalContent,
                        generateTitle: generateConversationTitle,
                    });
                    const finalConversation = {
                        ...placeholderConversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                        title: newTitle,
                    };
                    flushSync(() => {
                        setCurrentConversation((prev) =>
                            prev && prev.id !== conversation.id ? prev : finalConversation,
                        );
                        setConversations((prev) => {
                            const idx = prev.findIndex((c) => c.id === conversation.id);
                            const next =
                                idx >= 0
                                    ? prev.map((c) => (c.id === conversation.id ? finalConversation : c))
                                    : [finalConversation, ...prev];
                            saveConversationsToStorage(next);
                            return next;
                        });
                    });
                    isSendingRef.current = false;
                } else {

                // 비스트리밍: API와 병행해 분석→관점·개요→답변 작성 타임라인을 최소 시간만큼 밟은 뒤,
                // 응답 도착 후 다각도 점검·최종 검토(에이전트 라우트 `/agents` 세션은 간격·체류 약간 확대).
                const nonStreamPhaseTimeline = skipGensparkPostResponsePhases
                    ? { cancel: () => {}, promise: Promise.resolve() }
                    : startAssistantNonStreamLoadingTimeline(updateGenerationStep, {
                          durationMultiplier: phaseDurationMultiplier,
                          benchmarkGenspark: pipelineBenchmarkPacing,
                          gensparkAgentRouteSession: isGensparkAgentRouteSession,
                      });
                clearNonStreamPhases = nonStreamPhaseTimeline.cancel;

                const runSequentialMultiRequest = sequentialSendFlags.runSequentialMultiRequest;
                const runMultiStepMultiRequest = sequentialSendFlags.runMultiStepMultiRequest;

                const postNonStreamPayload = async (
                    outboundMessage: string,
                    contextForBody: Record<string, unknown>,
                ) => {
                    const payload = buildChatGptNonStreamPostPayload(
                        outboundMessage,
                        effectiveQuality,
                        contextForBody,
                        buildComposerNonStreamChatExtras({
                            conversationId: conversation.id,
                            requestId: requestId,
                            responseStyle,
                            perspective,
                            diversityLevel: answerDiversityMode,
                            temperature: answerTemperature,
                            projectId: currentProject?.id,
                        }),
                        mergeScenarioAndConversationDeepseek(
                            scenarioInheritMergeOptionsFromPipelineLikeMessages(updatedMessages),
                            conversation,
                        ),
                    );
                    return postChatAxiosWithFallback(
                        API_BASE_URL,
                        payload,
                        DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                        DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
                    );
                };

                const assertValidChatResponse = (
                    response: Awaited<ReturnType<typeof postChatAxiosWithFallback>>,
                ): string => {
                    const content = extractResponseContent(response);
                    if (
                        !content ||
                        !coerceTrimmedString(content, '') ||
                        content === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
                    ) {
                        const responseData = (response as { data?: unknown })?.data;
                        const dataType = responseData ? typeof responseData : 'unknown';
                        throw new Error(
                            `백엔드에서 유효한 응답을 받지 못했습니다. 응답 데이터 타입: ${dataType}`,
                        );
                    }
                    return content;
                };

                let responseContent: string;
                let lastNonStreamResponse: Awaited<ReturnType<typeof postChatAxiosWithFallback>> | undefined;

                try {
                    if (runSequentialMultiRequest) {
                        const sequentialResult = await runComposerSequentialMultiRequestNonStream({
                            items: sequentialMultiRequestItems,
                            buildItemOutboundMessage: buildSequentialItemOutbound,
                            buildItemContext: (i) =>
                                buildSequentialMultiRequestItemContext(
                                    chatContextForRequest as Record<string, unknown>,
                                    sequentialMultiRequestItems,
                                    i,
                                ),
                            postChat: postNonStreamPayload,
                            extractValidContent: assertValidChatResponse,
                            onLiveIndex: setComposerMultiRequestLiveIndex,
                            onPartialProgress: updateGenerationStep,
                        });
                        lastNonStreamResponse = sequentialResult.lastResponse;
                        responseContent = sequentialResult.merged;
                    } else if (runMultiStepMultiRequest) {
                        const multiStepResult = await runComposerMultiStepMultiRequest({
                            items: sequentialMultiRequestItems,
                            buildItemContext: (i) =>
                                buildSequentialMultiRequestItemContext(
                                    chatContextForRequest as Record<string, unknown>,
                                    sequentialMultiRequestItems,
                                    i,
                                ),
                            onLiveIndex: setComposerMultiRequestLiveIndex,
                            onPartialProgress: updateGenerationStep,
                        });
                        responseContent = multiStepResult.merged;
                    } else {
                        const response = await postNonStreamPayload(
                            unifiedChatOutboundMessage,
                            chatContextForRequest as Record<string, unknown>,
                        );
                        lastNonStreamResponse = response;
                        responseContent = assertValidChatResponse(response);
                    }
                } catch (e) {
                    nonStreamPhaseTimeline.cancel();
                    throw e;
                } finally {
                    setComposerMultiRequestLiveIndex(null);
                }

                await nonStreamPhaseTimeline.promise;
                clearNonStreamPhases?.();
                clearNonStreamPhases = undefined;

                if (!skipGensparkPostResponsePhases) {
                    await runAssistantNonStreamPostResponsePhases((text) => updateGenerationStep(text), {
                        durationMultiplier: phaseDurationMultiplier,
                        benchmarkGenspark: pipelineBenchmarkPacing,
                        gensparkAgentRouteSession: isGensparkAgentRouteSession,
                    });
                }

                let displayContent =
                    resolveAssistantAnswerDisplayText(coerceTrimmedString(responseContent, '')) ||
                    '응답을 생성할 수 없습니다. 다시 시도해 주세요.';
                const sdNs = await applyComposerSelfDevelopIfEnabled({
                    draft: displayContent,
                    userInput: trimmedInput,
                    baseContext: chatContextForRequest as Record<string, unknown>,
                    sessionId: conversation.id,
                    active: composerSelfDevelopActive && !isGraphComposerAnswer,
                    requestRefined: requestComposerRefinedAnswer,
                    stepPacingMs: 140,
                    onStatusText: (text) => updateGenerationStep(text),
                    onPhase: (ph) =>
                        updateGenerationStep(
                            ph === 'critique' || ph === 'integrate'
                                ? ASSISTANT_PLACEHOLDER_CROSSCHECK
                                : ph === 'draft'
                                  ? ASSISTANT_PLACEHOLDER_DRAFT
                                  : ASSISTANT_PLACEHOLDER_VERIFY,
                        ),
                    onImproved: () => showToast('답변을 자가 검증·개선했습니다.', 'success'),
                });
                displayContent = sdNs.text;
                const selfDevelopExtrasNs = sdNs.extras;
                const thinkingDurationMs = responseStartTime ? Date.now() - responseStartTime : undefined;
                const suggestedFollowUpsNs = lastNonStreamResponse
                    ? extractPipelineFollowUpsFromChatResponse(lastNonStreamResponse)
                    : undefined;
                const pipelineExtrasNs = mergeAssistantPipelineExtrasForTurn({
                    responseExtras: lastNonStreamResponse
                        ? extractPipelineMessageExtrasFromChatResponse(lastNonStreamResponse)
                        : undefined,
                    requestContext: chatContextForRequest as Record<string, unknown>,
                    selfDevelopExtras: selfDevelopExtrasNs,
                });
                const finalMessages = placeholderMessages.map((m) =>
                    m.id === placeholderAssistantId
                        ? {
                              ...m,
                              content: displayContent,
                              thinkingDurationMs,
                              ...(suggestedFollowUpsNs?.length ? { suggestedFollowUps: suggestedFollowUpsNs } : {}),
                              ...(pipelineExtrasNs ? { pipelineExtras: pipelineExtrasNs } : {}),
                          }
                        : m
                );

                // 딥러닝 연동: 응답 품질·감정 분석 (딥시크 답변과 동일 파이프라인, 비차단)
                notebookLLMDeepLearningIntegration.analyzeResponseWithDL(trimmedInput, displayContent).catch(() => {});

                recordAdvancedMemoryTurn(conversation.id, trimmedInput, displayContent);

                // 첫 응답 후 간결한 제목 자동 생성
                const newTitle = await resolveListTitleAfterAssistantReply({
                    conversationTitle: placeholderConversation.title,
                    shouldUpdateTitle: finalMessages.length >= 2,
                    explicitTitleConcise: explicitTitleConciseFromInput,
                    trimmedUserMessage: trimmedInput,
                    assistantDisplayText: displayContent,
                    generateTitle: generateConversationTitle,
                });

                const finalConversation = {
                    ...placeholderConversation,
                    messages: finalMessages,
                    updatedAt: new Date(),
                    title: newTitle,
                };

                // 질문·답변 모두 화면에 확실히 출력 (prev가 null이어도 응답 표시)
                // 중복 방지: 같은 conversation이 이미 최신 상태인지 확인
                flushSync(() => {
                    setCurrentConversation((prev) => {
                        // 다른 conversation이면 유지, 같은 conversation이면 업데이트
                        if (prev && prev.id !== conversation.id) return prev;
                        // 이미 같은 메시지가 있는지 확인 (중복 방지)
                        const existingMsg = prev?.messages.find(m => m.id === placeholderAssistantId);
                        if (existingMsg && existingMsg.content === displayContent) {
                            return prev; // 이미 같은 내용이면 업데이트하지 않음
                        }
                        return finalConversation;
                    });
                    setConversations((prev) => {
                        const idx = prev.findIndex((c) => c.id === conversation.id);
                        if (idx >= 0) {
                            const existing = prev[idx];
                            // 이미 같은 메시지가 있는지 확인 (중복 방지)
                            const existingMsg = existing.messages.find(m => m.id === placeholderAssistantId);
                            if (existingMsg && existingMsg.content === displayContent) {
                                return prev; // 이미 같은 내용이면 업데이트하지 않음
                            }
                            const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                            saveConversationsToStorage(next);
                            return next;
                        }
                        const next = [finalConversation, ...prev];
                        saveConversationsToStorage(next);
                        return next;
                    });
                });

                // AI Workspace 도구 결과 반영: 프로젝트 생성 시 목록 갱신 및 선택 (마무리 개발)
                const responseData =
                    lastNonStreamResponse &&
                    typeof lastNonStreamResponse === 'object' &&
                    lastNonStreamResponse !== null &&
                    'data' in lastNonStreamResponse
                        ? (
                              lastNonStreamResponse as {
                                  data: {
                                      workspace_tool_result?: {
                                          tool?: string;
                                          success?: boolean;
                                          data?: { project_id?: string };
                                          message?: string;
                                      };
                                  };
                              }
                          ).data
                        : undefined;
                const wtr = responseData?.workspace_tool_result as WorkspaceProjectCreateToolResult | undefined;
                if (wtr) {
                    void applyWorkspaceProjectCreateResult(wtr);
                }
                }
            }
        } catch (error) {
            clearAssistantStreamPhases?.();
            clearNonStreamPhases?.();
            clearAssistantStreamPhases = undefined;
            clearNonStreamPhases = undefined;
            // 에러 발생 시에도 전송 상태 해제
            isSendingRef.current = false;
            setIsLoading(false);
            
            // 에러 로깅 (더 자세한 정보 포함)
            const errorObj = error instanceof Error ? error : new Error(String(error));
            errorLogger.error('메시지 전송 오류', errorObj, {
                component: 'ChatGPTInterface',
                action: 'sendMessage',
                userInput: trimmedInput,
            });

            const errorContent = getErrorMessage(error);
            const errorMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: `❌ **오류 발생**\n\n${errorContent}\n\n**문제 해결 방법:**\n- 네트워크 연결을 확인해주세요\n- 잠시 후 다시 시도해주세요\n- 다른 질문을 시도해보세요\n- 문제가 계속되면 관리자에게 문의해주세요`,
                timestamp: new Date(),
            };

            const finalMessages = [...updatedMessages, errorMessage];
            const finalConversation = {
                ...updatedConversation,
                messages: finalMessages,
                updatedAt: new Date(),
            };

            // 에러 시에도 사용자 질문 + 안내 메시지가 대화 영역에 확실히 표시 (prev가 null이어도 적용)
            flushSync(() => {
                setCurrentConversation((prev) => {
                    // 다른 conversation이면 유지
                    if (prev && prev.id !== conversation.id) return prev;
                    // 이미 같은 에러 메시지가 있는지 확인 (중복 방지)
                    const existingErrorMsg = prev?.messages.find(m => 
                        m.role === 'assistant' && 
                        m.content.includes('❌ **오류 발생**')
                    );
                    if (existingErrorMsg) {
                        return prev; // 이미 에러 메시지가 있으면 업데이트하지 않음
                    }
                    return finalConversation;
                });
                setConversations((prev) => {
                    const idx = prev.findIndex((c) => c.id === conversation.id);
                    if (idx >= 0) {
                        const existing = prev[idx];
                        // 이미 같은 에러 메시지가 있는지 확인 (중복 방지)
                        const existingErrorMsg = existing.messages.find(m => 
                            m.role === 'assistant' && 
                            m.content.includes('❌ **오류 발생**')
                        );
                        if (existingErrorMsg) {
                            return prev; // 이미 에러 메시지가 있으면 업데이트하지 않음
                        }
                        const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                        saveConversationsToStorage(next);
                        return next;
                    }
                    const next = [finalConversation, ...prev];
                    saveConversationsToStorage(next);
                    return next;
                });
            });
            notifyLocalChatConversationsMutated();
        } finally {
            clearAssistantStreamPhases?.();
            clearNonStreamPhases?.();
            clearAssistantStreamPhases = undefined;
            clearNonStreamPhases = undefined;
            setIsStreaming(false);
            setIsLoading(false);
            // 전송 완료 표시
            isSendingRef.current = false;
            setResponseStartTime(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        answerDiversityMode,
        input,
        isLoading,
        isOnline,
        conversations,
        currentConversation,
        currentProject,
        projectGuidelineInstructionText,
        validateInput,
        extractResponseContent,
        getErrorMessage,
        saveConversationsToStorage,
        useStreaming,
        generateConversationTitle,
        writingStyleProfile,
        responseStartTime,
        attachedImageAnalysis,
        composerQuality,
        gensparkRouteAgentId,
        isDefaultPage,
    ]);
    sendMessageRef.current = sendMessage;

    // 스트리밍 취소 (useCallback으로 메모이제이션)
    const cancelStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
            setIsLoading(false);
            if (streamingRafRef.current) {
                cancelAnimationFrame(streamingRafRef.current);
                streamingRafRef.current = null;
            }
        }
    }, []);

    // [기본 플로우] 입력창 → 전송 → 답변 표시. 입력값은 이 헬퍼로만 읽어 일원화. DOM 값을 우선해 전송 시 입력이 비는 현상 방지.
    const getCurrentInputValue = useCallback(
        () => coerceTrimmedString(inputRef.current?.value ?? inputValueRef.current ?? input ?? '', ''),
        [input]
    );

    // 입력창 엔터: 질문·요구 수신 → sendMessage → 딥러닝 보강·백엔드 답변 생성 로직으로 답변 생성 (Enter 전송, Shift+Enter 줄바꿈)
    const _handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // IME 조합 중 Enter는 확정용이므로 전송하지 않음(한글 등 입력 직후 오전송 방지)
            if (isKeyboardEventImeComposing(e)) return;
            e.preventDefault();
            // 중복 호출 방지
            if (isLoading || isSendingRef.current) return;
            // DOM 값 우선: change 직후 setState보다 앞서 keyDown이 오는 경우(테스트·IME 등)에도 전송값이 비지 않게 함
            const fromDom = coerceTrimmedString(e.currentTarget.value ?? '', '');
            const currentValue = fromDom || getCurrentInputValue();
            if (currentValue) sendMessage(currentValue);
            else if (attachedConversationFile) sendMessage();
        } else if (e.key === 'Escape' && isStreaming) {
            e.preventDefault();
            cancelStreaming();
        } else if (e.key === 'ArrowUp' && inputHistoryRef.current.length > 0) {
            const hist = inputHistoryRef.current;
            let idx = inputHistoryIndexRef.current;
            if (idx < hist.length - 1) {
                idx += 1;
                inputHistoryIndexRef.current = idx;
                const v = hist[idx];
                inputValueRef.current = v;
                setInput(v);
                e.preventDefault();
            } else if (idx === -1) {
                inputHistoryIndexRef.current = 0;
                const v = hist[0];
                inputValueRef.current = v;
                setInput(v);
                e.preventDefault();
            }
        } else if (e.key === 'ArrowDown' && inputHistoryIndexRef.current >= 0) {
            const idx = inputHistoryIndexRef.current;
            if (idx > 0) {
                inputHistoryIndexRef.current = idx - 1;
                const v = inputHistoryRef.current[inputHistoryIndexRef.current];
                inputValueRef.current = v;
                setInput(v);
                e.preventDefault();
            } else {
                inputHistoryIndexRef.current = -1;
                inputValueRef.current = '';
                setInput('');
                e.preventDefault();
            }
        }
    }, [sendMessage, isStreaming, cancelStreaming, getCurrentInputValue, attachedConversationFile, isLoading]);

    // form submit 시 전송 — 입력창 엔터/전송 버튼 클릭 시 질문을 받아 답변 생성. DOM → ref → state 순으로 읽어 입력이 빠지지 않도록 함.
    const _handleComposerSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();
            // 중복 호출 방지
            if (isLoading || isSendingRef.current) return;
            const form = (e.currentTarget ?? e.target) as HTMLFormElement | undefined;
            const textarea = (form?.querySelector?.('textarea') as HTMLTextAreaElement | null) ?? inputRef.current;
            const rawFromDom = coerceTrimmedString(textarea?.value ?? '', '');
            const v = rawFromDom || getCurrentInputValue();
            if (v) sendMessage(v);
            else if (attachedConversationFile) sendMessage();
        },
        [sendMessage, getCurrentInputValue, attachedConversationFile, isLoading]
    );

    // WorkspaceQueryComposer용 커밋 핸들러
    const handleWqCommit = useCallback(() => {
        if (isLoading || isSendingRef.current) return;
        const fromDom = coerceTrimmedString(inputRef.current?.value ?? '', '');
        if (fromDom && fromDom !== input) {
            inputValueRef.current = fromDom;
            setInput(fromDom);
        }
        const v = fromDom || getCurrentInputValue();
        if (v) void sendMessage(v);
        else if (attachedConversationFile) void sendMessage();
    }, [sendMessage, getCurrentInputValue, attachedConversationFile, isLoading, input]);

    // 대화 삭제 확정
    const confirmDeleteConversation = useCallback(() => {
        if (!deleteConfirmConversation) return;

        const id = deleteConfirmConversation.id;
        setConversations((prev) => {
            const updated = prev.filter((c) => c.id !== id);
            saveConversationsToStorage(updated);
            return updated;
        });

        setCurrentConversation((prev) => (prev?.id === id ? null : prev));
        setDeleteConfirmConversation(null);
        showToast('대화가 삭제되었습니다', 'success');
        try {
            notifyLocalChatConversationsMutated();
        } catch {
            /* ignore */
        }
        try {
            window.dispatchEvent(new CustomEvent(CHATGPT_CONVERSATION_REMOVED_EVENT, { detail: { id } }));
        } catch {
            /* ignore */
        }
    }, [deleteConfirmConversation, saveConversationsToStorage]);

    // 대화 삭제 취소
    const cancelDeleteConversation = useCallback(() => {
        setDeleteConfirmConversation(null);
    }, []);

    useEffect(() => {
        if (!deleteConfirmConversation) return;
        const rafId = window.requestAnimationFrame(() => chatDeleteConversationCancelRef.current?.focus());
        return () => window.cancelAnimationFrame(rafId);
    }, [deleteConfirmConversation]);

    /** 헤더 대화 삭제 확인 모달: Escape가 window 전역 단축키와 경합하지 않도록 캡처에서 닫기 */
    useEffect(() => {
        if (!deleteConfirmConversation) return;
        const onKeyDownCapture = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            e.stopImmediatePropagation();
            setDeleteConfirmConversation(null);
        };
        document.addEventListener('keydown', onKeyDownCapture, true);
        return () => document.removeEventListener('keydown', onKeyDownCapture, true);
    }, [deleteConfirmConversation]);

    useEffect(() => {
        if (!deleteConfirmProject) return;
        const rafId = window.requestAnimationFrame(() => projectDeleteCancelRef.current?.focus());
        return () => window.cancelAnimationFrame(rafId);
    }, [deleteConfirmProject]);

    useEffect(() => {
        if (!deleteConfirmMessageId) return;
        const rafId = window.requestAnimationFrame(() => messageDeleteCancelRef.current?.focus());
        return () => window.cancelAnimationFrame(rafId);
    }, [deleteConfirmMessageId]);

    useEffect(() => {
        if (!showClearMessagesConfirm) return;
        const rafId = window.requestAnimationFrame(() => clearMessagesCancelRef.current?.focus());
        return () => window.cancelAnimationFrame(rafId);
    }, [showClearMessagesConfirm]);

    // 프로젝트 삭제 요청 (모달 열기)
    const _requestDeleteProject = useCallback((project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmProject(project);
    }, []);

    // 프로젝트 삭제 확정
    const confirmDeleteProject = useCallback(async () => {
        if (!deleteConfirmProject) return;
        const id = deleteConfirmProject.id;
        const name = deleteConfirmProject.name;
        setDeleteConfirmProject(null);

        try {
            const ok = await projectService.deleteProject(id);
            if (ok) {
                setProjects((prev) => prev.filter((p) => p.id !== id));
                if (currentProject?.id === id) {
                    const remaining = projects.filter((p) => p.id !== id);
                    setCurrentProject(remaining[0] ?? null);
                    setCurrentConversation(null);
                }
                setConversations((prev) => prev.filter((c) => c.projectId !== id));
                showToast('프로젝트가 삭제되었습니다', 'success');
            }
        } catch (error) {
            errorLogger.error('프로젝트 삭제 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'deleteProject',
            });
            showToast(`"${name}" 삭제에 실패했습니다.`, 'error');
        }
    }, [deleteConfirmProject, currentProject, projects]);

    // 프로젝트 삭제 취소
    const cancelDeleteProject = useCallback(() => {
        setDeleteConfirmProject(null);
    }, []);

    // 대화 복제
    const duplicateConversation = useCallback((conversation: Conversation) => {
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: conversationListTitleFromUserMessage(`${conversation.title} (복사본)`),
            messages: conversation.messages.map((msg) => ({
                ...msg,
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: safeDate(msg.timestamp),
            })),
            projectId: conversation.projectId,
            gensparkAgentId: conversation.gensparkAgentId,
            createdAt: new Date(),
            updatedAt: new Date(),
            pinned: false,
        };

        skipNextConversationIdFromStateSelectionRef.current = true;
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
        showToast('대화가 복제되었습니다', 'success');
    }, []);

    // 대화를 프로젝트로 옮기기 (ChatGPT 프로젝트처럼 '프로젝트에 추가')
    const _moveConversationToProject = useCallback((convId: string, projectId: string) => {
        setConversations((prev) => {
            const next = prev.map((c) =>
                c.id === convId
                    ? { ...c, projectId, gensparkAgentId: undefined, updatedAt: new Date() }
                    : c
            );
            saveConversationsToStorage(next);
            return next;
        });
        setConversationMenuOpenId(null);
        showToast('프로젝트에 추가되었습니다', 'success');
    }, [saveConversationsToStorage]);

    // 검색어 하이라이트 함수
    const _highlightSearchText = useCallback((text: string, query: string): React.ReactNode => {
        const q = coerceTrimmedString(query, '');
        if (!q) return text;

        const lowerText = text.toLowerCase();
        const lowerQuery = q.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);

        if (index === -1) return text;

        const before = text.substring(0, index);
        const match = text.substring(index, index + q.length);
        const after = text.substring(index + q.length);

        return (
            <>
                {before}
                <mark style={{
                    backgroundColor: 'var(--accent-warning)',
                    color: 'var(--text-primary)',
                    padding: '0 2px',
                    borderRadius: '2px',
                }}>{match}</mark>
                {after}
            </>
        );
    }, []);

    // 대화 이름 편집 시작
    const _startEditingConversationTitle = useCallback((conversationId: string, currentTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingConversationId(conversationId);
        setEditingConversationTitle(currentTitle);
    }, []);

    // 대화 이름 편집 취소
    const cancelEditingConversationTitle = useCallback(() => {
        setEditingConversationId(null);
        setEditingConversationTitle('');
    }, []);

    // 대화 이름 저장
    const _saveConversationTitle = useCallback((conversationId: string) => {
        const newTitle = coerceTrimmedString(editingConversationTitle, '');
        if (!newTitle || newTitle.length < 2) {
            cancelEditingConversationTitle();
            return;
        }

        setConversations(prev => {
            const updated = prev.map(conv =>
                conv.id === conversationId
                    ? { ...conv, title: newTitle, updatedAt: new Date() }
                    : conv
            );
            // 로컬 스토리지에 저장
            try {
                const toSave = updated.map((conv) => ({
                    ...conv,
                    createdAt: formatDateSafe(conv.createdAt, (d) => d.toISOString(), new Date().toISOString()),
                    updatedAt: formatDateSafe(conv.updatedAt, (d) => d.toISOString(), new Date().toISOString()),
                    messages: conv.messages.map((msg) => ({
                        ...msg,
                        timestamp: formatDateSafe(msg.timestamp, (d) => d.toISOString(), new Date().toISOString()),
                    })),
                }));
                localStorage.setItem(CHATGPT_CONVERSATIONS_STORAGE_KEY, JSON.stringify(toSave));
            } catch (error) {
                errorLogger.error('대화 제목 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'saveConversationTitle',
                });
            }
            return updated;
        });

        // 현재 대화도 업데이트
        setCurrentConversation(prev =>
            prev?.id === conversationId
                ? { ...prev, title: newTitle, updatedAt: new Date() }
                : prev
        );

        cancelEditingConversationTitle();
        showToast('제목이 저장되었습니다', 'success');
    }, [editingConversationTitle, cancelEditingConversationTitle]);

    // 상대적 시간 포맷 (오늘, 어제, 날짜)
    const _formatRelativeTime = useCallback((date: Date): string => {
        if (isNaN(date.getTime())) return '—';
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (targetDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } else if (targetDate.getTime() === yesterday.getTime()) {
            return '어제';
        } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return `${days[date.getDay()]}요일`;
        } else {
            return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        }
    }, []);

    // 메시지 복사 (토스트 알림 포함, useCallback으로 메모이제이션)
    const copyMessage = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast('복사되었습니다', 'success');
        } catch (error) {
            errorLogger.error('복사 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'ChatGPTInterface',
                action: 'copyMessage',
            });
            showToast('복사에 실패했습니다.', 'error');
        }
    }, []);

    // 메시지 북마크 토글
    const toggleBookmark = useCallback((messageId: string) => {
        setCurrentConversation((prev) => {
            if (!prev) return prev;
            const msg = prev.messages.find((m) => m.id === messageId);
            const willBeBookmarked = !msg?.bookmarked;
            const updated = {
                ...prev,
                messages: prev.messages.map((m) =>
                    m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m
                ),
            };
            setConversations((prevConvs) =>
                prevConvs.map((c) => (c.id === prev.id ? updated : c))
            );
            showToast(willBeBookmarked ? '북마크에 추가되었습니다' : '북마크가 해제되었습니다', 'success');
            return updated;
        });
    }, []);

    // 메시지 반응 (좋아요/싫어요)
    const setMessageReaction = useCallback((messageId: string, reaction: MessageReaction) => {
        setCurrentConversation((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                messages: prev.messages.map((m) =>
                    m.id === messageId
                        ? { ...m, reaction: m.reaction === reaction ? null : reaction }
                        : m
                ),
            };
            setConversations((prevConvs) =>
                prevConvs.map((c) => (c.id === prev.id ? updated : c))
            );
            return updated;
        });
    }, []);

    // 이모지 반응 토글
    const toggleEmojiReaction = useCallback((messageId: string, emoji: MsgEmojiReaction) => {
        setCurrentConversation((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                messages: prev.messages.map((m) => {
                    if (m.id !== messageId) return m;
                    const prev_reactions = m.emojiReactions ?? {};
                    const next_reactions = { ...prev_reactions, [emoji]: !prev_reactions[emoji] };
                    return { ...m, emojiReactions: next_reactions };
                }),
            };
            setConversations((prevConvs) =>
                prevConvs.map((c) => (c.id === prev.id ? updated : c))
            );
            return updated;
        });
    }, []);

    // 이모지 피커 열림 상태
    const [emojiPickerMsgId, setEmojiPickerMsgId] = React.useState<string | null>(null);
    React.useEffect(() => {
        if (!emojiPickerMsgId) return;
        const close = () => setEmojiPickerMsgId(null);
        document.addEventListener('click', close, { once: true });
        return () => document.removeEventListener('click', close);
    }, [emojiPickerMsgId]);

    // 개별 메시지 삭제 요청 (확인 모달 열기)
    const requestDeleteMessage = useCallback((messageId: string) => {
        setDeleteConfirmMessageId(messageId);
    }, []);

    // 개별 메시지 삭제 확정
    const confirmDeleteMessage = useCallback(() => {
        const messageId = deleteConfirmMessageId;
        setDeleteConfirmMessageId(null);
        if (!messageId) return;

        setCurrentConversation((prev) => {
            if (!prev) return prev;
            const updated = {
                ...prev,
                messages: prev.messages.filter((m) => m.id !== messageId),
                updatedAt: new Date(),
            };
            setConversations((prevConvs) =>
                prevConvs.map((c) => (c.id === prev.id ? updated : c))
            );
            return updated;
        });
        showToast('메시지가 삭제되었습니다', 'success');
    }, [deleteConfirmMessageId]);

    // 메시지 접기/펼치기 토글
    const toggleMessageCollapse = useCallback((messageId: string) => {
        setCollapsedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            return newSet;
        });
    }, []);

    // 긴 메시지 여부 확인 (500자 이상 또는 15줄 이상)
    const isLongMessage = useCallback((content: string) => {
        return content.length > 500 || content.split('\n').length > 15;
    }, []);

    // 현재 대화 메시지 전체 삭제 요청 (확인 모달 열기)
    const requestClearMessages = useCallback(() => {
        if (!currentConversation) return;
        setShowClearMessagesConfirm(true);
    }, [currentConversation]);

    // 현재 대화 메시지 전체 삭제 확정
    const confirmClearMessages = useCallback(() => {
        setShowClearMessagesConfirm(false);
        if (!currentConversation) return;

        const updated = {
            ...currentConversation,
            messages: [],
            updatedAt: new Date(),
        };
        setCurrentConversation(updated);
        setConversations(prev => prev.map(c => c.id === currentConversation.id ? updated : c));
        setCollapsedMessages(new Set());
        showToast('메시지가 모두 삭제되었습니다', 'success');
    }, [currentConversation]);

    // 대화 고정/해제
    const _togglePinConversation = useCallback((conversationId: string) => {
        const conv = conversations.find((c) => c.id === conversationId);
        const willBePinned = conv ? !conv.pinned : false;
        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversationId ? { ...c, pinned: !c.pinned } : c
            )
        );
        setCurrentConversation((prev) => {
            if (prev && prev.id === conversationId) {
                return { ...prev, pinned: !prev.pinned };
            }
            return prev;
        });
        showToast(willBePinned ? '대화가 상단에 고정되었습니다' : '고정이 해제되었습니다', 'success');
    }, [conversations]);

    // 테마 전환
    const _toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem(CHATGPT_THEME_STORAGE_KEY, next);
            return next;
        });
    }, []);

    // 시스템 테마 변경 감지
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const handleChange = (e: MediaQueryListEvent) => {
            const savedTheme = localStorage.getItem(CHATGPT_THEME_STORAGE_KEY);
            if (!savedTheme) {
                setTheme(e.matches ? 'light' : 'dark');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // 네트워크 상태 감지
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 백엔드 연결 확인 (GET 사용 — HEAD 미지원 서버 대응, 개발 시 상대 경로로 proxy 5002 전달)
    useEffect(() => {
        let cancelled = false;
        const check = async () => {
            try {
                const r = await fetch(API_ENDPOINTS.HEALTH, { method: 'GET', cache: 'no-store' });
                if (!cancelled) setIsApiReachable(r.ok);
            } catch {
                if (!cancelled) setIsApiReachable(false);
            }
        };
        check();
        const t = setInterval(check, 30000);
        return () => { cancelled = true; clearInterval(t); };
    }, []);

    // 스토리지 사용량 계산
    useEffect(() => {
        const calculateStorageUsage = () => {
            try {
                let totalSize = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        const value = localStorage.getItem(key) || '';
                        totalSize += (key.length + value.length) * 2; // UTF-16 인코딩
                    }
                }
                // localStorage 일반적 제한: 5MB
                setStorageUsage({
                    used: totalSize,
                    total: 5 * 1024 * 1024,
                });
            } catch {
                setStorageUsage(null);
            }
        };

        calculateStorageUsage();
        // 대화가 변경될 때마다 재계산
    }, [conversations]);

    /* CORBU.AI UI Kit — theme.css 변수 사용 (Figma node 323-168775, 7-3) */
    const themeStyles = useMemo(() => ({
        bgPrimary: 'var(--bg-primary)',
        bgSecondary: 'var(--bg-secondary)',
        bgTertiary: 'var(--bg-tertiary)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        inputBg: 'var(--bg-tertiary)',
        messageBgUser: 'var(--accent-info-muted)',
        messageBgAssistant: 'var(--bg-secondary)',
        accentColor: 'var(--accent-info)',
    }), []);

    // 북마크된 메시지 필터링
    const bookmarkedMessages = useMemo(() => {
        if (!currentConversation) return [];
        return currentConversation.messages.filter((m) => m.bookmarked);
    }, [currentConversation]);

    // 핀된 메시지 목록
    const pinnedMessages = useMemo(() => {
        if (!currentConversation) return [];
        return currentConversation.messages.filter((m) => m.pinned);
    }, [currentConversation]);

    const [showPinnedPanel, setShowPinnedPanel] = React.useState(false);

    const togglePinMessage = useCallback((msgId: string) => {
        if (!currentConversation) return;
        const updated = currentConversation.messages.map((m) =>
            m.id === msgId ? { ...m, pinned: !m.pinned } : m
        );
        const willBePinned = !currentConversation.messages.find((m) => m.id === msgId)?.pinned;
        setConversations((prev) =>
            prev.map((c) =>
                c.id === currentConversation.id ? { ...c, messages: updated } : c
            )
        );
        setCurrentConversation((prev) =>
            prev ? { ...prev, messages: updated } : prev
        );
        showToast(willBePinned ? '메시지를 핀 고정했습니다.' : '핀을 해제했습니다.', 'success');
    }, [currentConversation, setConversations]);

    const messageSearchTrimmed = useMemo(
        () => coerceTrimmedString(messageSearchQuery, ''),
        [messageSearchQuery]
    );

    // 대화 내 검색 결과
    const messageSearchResults = useMemo(() => {
        if (!currentConversation || !messageSearchTrimmed) return [];
        const query = messageSearchTrimmed.toLowerCase();
        return currentConversation.messages
            .map((m, index) => ({ message: m, index }))
            .filter(({ message }) =>
                coerceTrimmedString(message.content ?? '', '').toLowerCase().includes(query)
            );
    }, [currentConversation, messageSearchTrimmed]);

    const currentProjectContext = useMemo(() => {
        if (!currentProject) return null;
        const guidelineQuality = analyzeGuidelines(currentProject.initialGuidelines ?? []);
        const guidelineCount = guidelineQuality.nonEmpty;
        const requiredGuidelineCount = guidelineQuality.required;
        const recommendedGuidelineCount = guidelineQuality.recommended;
        const fileCount = currentProject.files?.length ?? 0;
        const webSourceCount = currentProject.webSources?.length ?? 0;
        const tagCount = currentProject.tags?.length ?? 0;
        const hasInstructions = Boolean(coerceTrimmedString(currentProject.instructions, ''));
        const qualityStatus = guidelineQuality.qualityStatus;
        const qualityLabel = guidelineQuality.qualityStatus === 'good'
            ? '품질상태 좋음'
            : guidelineQuality.qualityStatus === 'warning'
                ? '품질상태 주의'
                : '품질상태 위험';
        const qualityHint = guidelineQuality.recommendations.length > 0
            ? guidelineQuality.recommendations.join(' ')
            : '가이드라인 품질 상태가 양호합니다.';
        let qualityTrendLabel = '추세 데이터 부족';
        let qualityTrendDirection: 'up' | 'down' | 'flat' = 'flat';
        let qualityHistory: Array<{ savedAt: string; score: number; status: 'good' | 'warning' | 'risk' }> = [];
        let autoRecoveryReportPrompt: string | null = null;
        let autoRecoveryDiffPrompt: string | null = null;
        let autoRecoveryComparePrompt: string | null = null;
        try {
            const qualityHistoryKey = `project-guideline-quality-history-${currentProject.id}`;
            const raw = localStorage.getItem(qualityHistoryKey);
            if (raw) {
                const parsed = JSON.parse(raw) as Array<{ savedAt: string; score: number; status: 'good' | 'warning' | 'risk' }>;
                if (Array.isArray(parsed)) {
                    qualityHistory = parsed.filter(
                        (entry) => typeof entry?.score === 'number' && typeof entry?.savedAt === 'string'
                    );
                }
                if (qualityHistory.length >= 2) {
                    const trend = getGuidelineQualityTrend(qualityHistory);
                    qualityTrendLabel = trend.label;
                    qualityTrendDirection = trend.direction;
                }
            }
            const recoveryReportRaw = localStorage.getItem(`project-guideline-auto-recovery-report-${currentProject.id}`);
            if (recoveryReportRaw) {
                const parsedReport = JSON.parse(recoveryReportRaw) as
                    | { prompt?: string; diffSummary?: string[] }
                    | Array<{ prompt?: string; diffSummary?: string[] }>;
                const latestEntry = Array.isArray(parsedReport)
                    ? parsedReport.find((entry) => typeof entry?.prompt === 'string' && coerceTrimmedString(entry.prompt, ''))
                    : parsedReport;
                const latestPrompt = latestEntry?.prompt;
                if (typeof latestPrompt === 'string' && coerceTrimmedString(latestPrompt, '')) {
                    autoRecoveryReportPrompt = latestPrompt;
                }
                const latestDiffSummary = latestEntry?.diffSummary;
                if (Array.isArray(latestDiffSummary) && latestDiffSummary.length > 0) {
                    autoRecoveryDiffPrompt = [
                        '[최근 자동 복구 diff]',
                        ...latestDiffSummary,
                        '',
                        '추가 요청: 위 변화 내용을 기반으로, 무엇을 유지/보완/폐기할지 3분류 실행안을 작성해줘.',
                    ].join('\n');
                }
            }
            const recoveryCompareRaw = localStorage.getItem(`project-guideline-auto-recovery-compare-${currentProject.id}`);
            if (recoveryCompareRaw) {
                const parsedCompare = JSON.parse(recoveryCompareRaw) as { prompt?: string };
                if (typeof parsedCompare?.prompt === 'string' && coerceTrimmedString(parsedCompare.prompt, '')) {
                    autoRecoveryComparePrompt = parsedCompare.prompt;
                }
            }
        } catch {
            // 추세 복원 실패 시 기본 라벨 유지
        }
        return {
            name: currentProject.name,
            description: coerceTrimmedString(currentProject.description, '') || '프로젝트 설명을 추가하면 답변 품질이 더 좋아집니다.',
            guidelineCount,
            requiredGuidelineCount,
            recommendedGuidelineCount,
            untypedGuidelineCount: guidelineQuality.untyped,
            duplicateGuidelineCount: guidelineQuality.duplicates,
            guidelineQualityScore: guidelineQuality.qualityScore,
            fileCount,
            webSourceCount,
            tagCount,
            hasInstructions,
            sourceCount: currentProject.source_count ?? (fileCount + webSourceCount),
            qualityStatus,
            qualityLabel,
            qualityHint,
            qualityTrendLabel,
            qualityTrendDirection,
            qualityHistoryScores: [...qualityHistory].reverse(),
            qualityHistoryEntries: [...qualityHistory].reverse(),
            autoRecoveryReportPrompt,
            autoRecoveryDiffPrompt,
            autoRecoveryComparePrompt,
        };
    }, [currentProject]);

    const isUrbanDomainProject = useMemo(() => {
        const raw = currentProject?.tags;
        const tags = Array.isArray(raw) ? raw : [];
        return tags.some((tag) => typeof tag === 'string' && ['도시정비', '재건축', '재개발'].includes(tag));
    }, [currentProject?.tags]);

    const outputPresetLabel = useMemo(() => {
        if (outputPreset === 'question-bank') return '질문은행';
        if (outputPreset === 'requirements') return '요구사항';
        if (outputPreset === 'minutes') return '회의록';
        if (outputPreset === 'checklist') return '체크리스트';
        if (outputPreset === 'risk-matrix') return '리스크표';
        return '자동';
    }, [outputPreset]);
    const parsedInputSections = useMemo(() => parseQuestionRequirementSections(input), [input]);
    const isStructuredGenerationActive =
        structuredInputAssistEnabled && shouldTreatAsStructuredQuestionRequirements(parsedInputSections);
    const hasQuestionOnly = structuredInputAssistEnabled && parsedInputSections.question.length > 0 && parsedInputSections.requirements.length === 0;
    const hasRequirementsOnly = structuredInputAssistEnabled && parsedInputSections.requirements.length > 0 && parsedInputSections.question.length === 0;
    const _structuredInputGuardMessage = !structuredInputAssistEnabled
        ? ''
        : hasQuestionOnly
        ? '요구사항이 비어 있습니다. 결과물 형식/필수 항목을 추가하면 더 정확하게 생성됩니다.'
        : hasRequirementsOnly
            ? '질문이 비어 있습니다. 해결하고 싶은 핵심 질문을 함께 입력해 주세요.'
            : '';
    const _structuredQuestionPreview = useMemo(
        () => truncateStructuredInputPreviewLine(parsedInputSections.question),
        [parsedInputSections.question]
    );
    const _structuredRequirementPreview = useMemo(
        () => truncateStructuredInputPreviewLine(parsedInputSections.requirements),
        [parsedInputSections.requirements]
    );

    const _applyStructuredInputQuickFix = useCallback(() => {
        if (!hasQuestionOnly && !hasRequirementsOnly) return;
        if (hasQuestionOnly) {
            setInput((prev) => {
                // 선행 공백/줄바꿈 유지: 끝쪽 공백만 제거 후 블록 추가
                const base = coerceTrimmedEnd(prev, '');
                return `${base}\n\n요구사항:\n- 결과물 형식(예: 표/체크리스트/회의록)\n- 필수 포함 항목\n- 톤/길이/주의사항`;
            });
        } else if (hasRequirementsOnly) {
            setInput((prev) => {
                const base = coerceTrimmedString(prev, '');
                return `질문:\n- 해결하고 싶은 핵심 질문을 작성하세요.\n\n${base}`;
            });
        }
        inputHistoryIndexRef.current = -1;
        window.setTimeout(() => {
            inputRef.current?.focus();
            setShowStructuredPreview(true);
        }, 0);
    }, [hasQuestionOnly, hasRequirementsOnly]);

    const _copyStructuredInputPreview = useCallback(async () => {
        const payload = [
            '질문:',
            parsedInputSections.question || '-',
            '',
            '요구사항:',
            parsedInputSections.requirements || '-',
        ].join('\n');
        try {
            await navigator.clipboard.writeText(payload);
            showToast('질문/요구사항 형식을 복사했습니다', 'success');
        } catch {
            showToast('복사에 실패했습니다.', 'error');
        }
    }, [parsedInputSections.question, parsedInputSections.requirements]);

    useEffect(() => {
        if (!isStructuredGenerationActive) {
            setShowStructuredPreview(false);
        }
    }, [isStructuredGenerationActive]);

    const outputPresetDetail = useMemo(() => {
        if (outputPreset === 'question-bank') return '카테고리별 질문 + 목적 + 후속질문';
        if (outputPreset === 'requirements') return '기능/비기능/제약/수용기준(AC)';
        if (outputPreset === 'minutes') return '결정사항 + 액션아이템(담당/기한)';
        if (outputPreset === 'checklist') return '단계별 체크항목 + 완료기준 + 우선순위';
        if (outputPreset === 'risk-matrix') return '영향도/가능성 기반 리스크 매트릭스';
        return '질문 의도 자동 감지 후 최적 형식으로 생성';
    }, [outputPreset]);

    const answerDiversityLabel = useMemo(() => {
        if (answerDiversityMode === 'stable') return '안정';
        if (answerDiversityMode === 'exploratory') return '탐색';
        return '다양';
    }, [answerDiversityMode]);

    const getAnswerTemperature = useCallback(() => {
        // 다양성 향상을 위해 온도 값 증가
        if (answerDiversityMode === 'stable') return 0.85; // 0.72 → 0.85 (더 다양한 답변)
        if (answerDiversityMode === 'exploratory') return 1.1; // 1.0 → 1.1 (최대 다양성)
        return 0.95; // 0.88 → 0.95 (기본 다양성 향상)
    }, [answerDiversityMode]);

    const getVariationInstruction = useCallback((requestId: string, rawInput: string) => {
        const variants = [
            '[강제] 직전 답변과 동일한 문장/구조를 절대 반복하지 말고, 반드시 다른 논리 전개 순서로 작성하세요.',
            '[강제] 같은 결론이라도 예시와 관점을 반드시 바꿔 설명하고, 대안 2개 이상을 함께 제시하세요.',
            '[강제] 핵심은 유지하되 표현 밀도와 구성(요약-근거-실행)을 완전히 다르게 재구성하세요.',
            '[강제] 반대 관점의 우려를 먼저 제시한 뒤 보완 대안을 연결해 설명하세요.',
            '[강제] 실행 우선순위 기준을 바꿔(속도/비용/리스크) 다른 버전으로 답변하세요.',
            '[강제] 다양한 접근 방식(이론적/실무적/창의적)을 혼합하여 답변의 깊이를 높이세요.',
            '[강제] 매 요청마다 다른 문장 구조, 다른 예시, 다른 관점을 사용하여 답변의 다양성을 극대화하세요.',
            '[강제] 사용자의 의도에 맞는 다양한 형식을 자동으로 감지하고 적용하세요.',
        ];
        const key = `${requestId}:${rawInput}`;
        const hash = Array.from(key).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        // 더 강력한 다양성을 위해 여러 변형 지시사항 조합
        const primary = variants[hash % variants.length];
        const secondary = variants[(hash + 1) % variants.length];
        return `${primary}\n${secondary}`;
    }, []);

    const buildStyleSignalsFromText = useCallback((text: string): string[] => {
        const signals: string[] = [];
        if (/(습니다|입니다|하십시오)/.test(text)) signals.push('격식 있는 존댓말 어미 선호');
        if (/(해요|해줘|했어요)/.test(text)) signals.push('대화형 존댓말 어조 선호');
        if (/[-*]\s|^\d+\./m.test(text)) signals.push('목록/단계형 정리 선호');
        if (/\|---|표|테이블/.test(text)) signals.push('표 형식 정리 선호');
        if (/(요약|핵심|한줄|정리)/.test(text)) signals.push('요약 우선 구조 선호');
        if (/(근거|출처|리스크|대안)/.test(text)) signals.push('근거/리스크/대안 병기 선호');
        return Array.from(new Set(signals));
    }, []);

    const buildWritingStyleLearningInstruction = useCallback((profile: WritingStyleLearningProfile) => {
        if (!profile.enabled) return '';
        const anchors = profile.anchors;
        const signals = profile.learnedSignals;
        if (anchors.length === 0 && signals.length === 0) return '';
        return [
            '[지속 문체 학습 지시]',
            '아래 학습된 문체 신호를 우선 반영하고, 매 답변에서 일관된 문장 리듬/톤/구조를 유지하세요.',
            signals.length > 0 ? `- 학습 신호: ${signals.join(' / ')}` : '- 학습 신호: 없음',
            ...(anchors.length > 0
                ? [
                    '- 기준 문체 샘플(톤/호흡/표현 방식 참고):',
                    ...anchors.map((sample, idx) => `  ${idx + 1}) ${sample}`),
                ]
                : []),
        ].join('\n');
    }, []);

    const learnWritingStyleFromText = useCallback((text: string) => {
        const trimmed = coerceTrimmedString(text, '');
        if (!trimmed) return;
        const signals = buildStyleSignalsFromText(trimmed);
        setWritingStyleProfile((prev) => {
            if (!prev.enabled) return prev;
            const nextSignals = Array.from(new Set([...prev.learnedSignals, ...signals]));
            const nextAnchors = prev.anchors;
            return {
                ...prev,
                learnedSignals: nextSignals,
                anchors: nextAnchors,
                updatedAt: new Date().toISOString(),
            };
        });
    }, [buildStyleSignalsFromText]);

    const saveInputAsWritingStyleAnchor = useCallback((raw: string) => {
        const trimmed = coerceTrimmedString(raw, '');
        if (!trimmed) {
            showToast('문체 샘플로 저장할 문장을 먼저 입력해 주세요.', 'info');
            return;
        }
        const anchor = trimmed;
        const signals = buildStyleSignalsFromText(anchor);
        setWritingStyleProfile((prev) => {
            const anchors = [anchor, ...prev.anchors.filter((a) => a !== anchor)];
            const learnedSignals = Array.from(new Set([...prev.learnedSignals, ...signals]));
            return {
                ...prev,
                anchors,
                learnedSignals,
                updatedAt: new Date().toISOString(),
            };
        });
        showToast('현재 입력을 문체 기준 샘플로 저장했습니다.', 'success');
    }, [buildStyleSignalsFromText]);

    const saveWritingStyleSnapshot = useCallback((label?: string) => {
        setWritingStyleProfile((prev) => {
            const normalizedLabel = coerceTrimmedString(label, '') || `버전 ${prev.snapshots.length + 1}`;
            const snapshot = {
                id: `style-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                label: normalizedLabel,
                savedAt: new Date().toISOString(),
                anchors: prev.anchors,
                learnedSignals: prev.learnedSignals,
            };
            return {
                ...prev,
                snapshots: [snapshot, ...prev.snapshots],
                updatedAt: new Date().toISOString(),
            };
        });
        showToast('현재 문체 학습 상태를 버전으로 저장했습니다.', 'success');
    }, []);

    const restoreWritingStyleSnapshot = useCallback((snapshotId: string) => {
        setWritingStyleProfile((prev) => {
            const snapshot = prev.snapshots.find((item) => item.id === snapshotId);
            if (!snapshot) return prev;
            return {
                ...prev,
                anchors: snapshot.anchors,
                learnedSignals: snapshot.learnedSignals,
                updatedAt: new Date().toISOString(),
            };
        });
        showToast('선택한 문체 버전을 복원했습니다.', 'success');
    }, []);

    const toggleStyleSnapshotCompareSelection = useCallback((snapshotId: string) => {
        setSelectedStyleSnapshotCompareIds((prev) => {
            if (prev.includes(snapshotId)) return prev.filter((id) => id !== snapshotId);
            if (prev.length >= 2) return [prev[1], snapshotId];
            return [...prev, snapshotId];
        });
    }, []);

    const getSnapshotInputFitScore = useCallback((snapshot: WritingStyleLearningProfile['snapshots'][number], inputText: string) => {
        const inputSignals = buildStyleSignalsFromText(inputText);
        if (inputSignals.length === 0 || snapshot.learnedSignals.length === 0) return 50;
        const snapshotSet = new Set(snapshot.learnedSignals);
        const overlap = inputSignals.filter((s) => snapshotSet.has(s)).length;
        return Math.round((overlap / Math.max(inputSignals.length, 1)) * 100);
    }, [buildStyleSignalsFromText]);

    const recommendedStyleSnapshot = useMemo(() => {
        if (writingStyleProfile.snapshots.length === 0) return null;
        const baseInput = inputTrimmed;
        if (!baseInput) return writingStyleProfile.snapshots[0];
        return writingStyleProfile.snapshots.reduce((best, candidate) => {
            const bestScore = getSnapshotInputFitScore(best, baseInput);
            const candidateScore = getSnapshotInputFitScore(candidate, baseInput);
            return candidateScore > bestScore ? candidate : best;
        }, writingStyleProfile.snapshots[0]);
    }, [getSnapshotInputFitScore, inputTrimmed, writingStyleProfile.snapshots]);

    const generateStyleSnapshotComparePrompt = useCallback(() => {
        if (selectedStyleSnapshotCompareIds.length !== 2) {
            showToast('비교할 문체 버전 2개를 선택해 주세요.', 'info');
            return;
        }
        const selected = selectedStyleSnapshotCompareIds
            .map((id) => writingStyleProfile.snapshots.find((s) => s.id === id))
            .filter((s): s is WritingStyleLearningProfile['snapshots'][number] => Boolean(s));
        if (selected.length !== 2) return;
        const [a, b] = selected;
        const aSet = new Set(a.learnedSignals);
        const bSet = new Set(b.learnedSignals);
        const addedInB = [...bSet].filter((s) => !aSet.has(s));
        const removedInB = [...aSet].filter((s) => !bSet.has(s));
        const comparePrompt = [
            '[문체 버전 A/B 비교]',
            `A: ${a.label} (${new Date(a.savedAt).toLocaleString('ko-KR')})`,
            `B: ${b.label} (${new Date(b.savedAt).toLocaleString('ko-KR')})`,
            '',
            '[신호 차이]',
            `- B에 추가된 신호: ${addedInB.length > 0 ? addedInB.join(', ') : '없음'}`,
            `- B에서 제거된 신호: ${removedInB.length > 0 ? removedInB.join(', ') : '없음'}`,
            `- 앵커 수 변화: ${a.anchors.length} -> ${b.anchors.length}`,
            '',
            '[요청]',
            '두 버전의 장단점을 비교해 현재 질문 유형에 더 적합한 버전을 추천하고, 선택 이유를 3가지로 제시해줘.',
        ].join('\n');
        setStyleSnapshotComparePrompt(comparePrompt);
    }, [selectedStyleSnapshotCompareIds, writingStyleProfile.snapshots]);

    const copyStyleSnapshotComparePrompt = useCallback(async () => {
        if (!styleSnapshotComparePrompt) return;
        try {
            await navigator.clipboard.writeText(styleSnapshotComparePrompt);
            showToast('문체 비교 프롬프트를 복사했습니다.', 'success');
        } catch {
            showToast('문체 비교 프롬프트 복사에 실패했습니다.', 'error');
        }
    }, [styleSnapshotComparePrompt]);

    const getWritingStyleMatchScore = useCallback((text: string, profile: WritingStyleLearningProfile) => {
        if (!profile.enabled) return 0;
        const trimmed = coerceTrimmedString(text, '');
        if (!trimmed) return 0;
        const detected = buildStyleSignalsFromText(trimmed);
        if (profile.learnedSignals.length === 0) return detected.length > 0 ? 70 : 55;
        const learnedSet = new Set(profile.learnedSignals);
        const overlap = detected.filter((signal) => learnedSet.has(signal)).length;
        const ratio = overlap / Math.max(profile.learnedSignals.length, 1);
        return Math.max(0, Math.min(100, Math.round(55 + ratio * 45)));
    }, [buildStyleSignalsFromText]);

    const latestAssistantContent = useMemo(() => {
        const messages = currentConversation?.messages ?? [];
        for (let i = messages.length - 1; i >= 0; i -= 1) {
            if (messages[i].role === 'assistant' && coerceTrimmedString(messages[i].content, '')) {
                return messages[i].content;
            }
        }
        return '';
    }, [currentConversation?.messages]);

    const writingStyleMatchScore = useMemo(
        () => getWritingStyleMatchScore(latestAssistantContent, writingStyleProfile),
        [getWritingStyleMatchScore, latestAssistantContent, writingStyleProfile]
    );

    const _muteGuidelineQualityAlertFor24Hours = useCallback(() => {
        if (!currentProject?.id) return;
        try {
            localStorage.setItem(`project-guideline-quality-alert-muted-until-${currentProject.id}`, String(Date.now() + GUIDELINE_ALERT_COOLDOWN_MS));
            showToast('가이드라인 품질 경고를 24시간 음소거했습니다.', 'success');
        } catch {
            showToast('알림 음소거 설정 저장에 실패했습니다.', 'error');
        }
    }, [currentProject?.id]);

    const projectDashboard = useMemo(() => {
        if (!currentProject) return null;
        const recentFiles = (currentProject.files ?? [])
            .filter((f) => f != null)
            .map((f) => `[파일] ${f.name ?? ''}`);
        const recentWebSources = (currentProject.webSources ?? [])
            .filter((s) => s != null)
            .map((s) => `[${s.type === 'video' ? '영상' : '문서'}] ${s.title || s.url}`);
        const recentSources = [...recentFiles, ...recentWebSources];
        const tags = Array.isArray(currentProject.tags) ? currentProject.tags : [];
        const nextActions: Array<{ label: string; prompt: string }> = [];
        const deliverableTemplates: Array<{ label: string; prompt: string }> = [];
        const qualityChecks: Array<{ label: string; prompt: string }> = [];
        const guidelineLines = Array.isArray(currentProject.initialGuidelines) ? currentProject.initialGuidelines : [];
        const guidelineQuality = analyzeGuidelines(guidelineLines);
        const qualityHistoryLine = currentProjectContext?.qualityHistoryEntries
            ?.map((entry) => `${new Date(entry.savedAt).toLocaleDateString('ko-KR')} ${entry.score}점(${entry.status})`)
            .join(' → ');

        if (!coerceTrimmedString(currentProject.instructions, '')) {
            nextActions.push({
                label: '프로젝트 지침 작성',
                prompt: '이 프로젝트의 공통 지침 초안을 작성해줘. 답변 형식, 톤, 길이 기준을 포함해줘.',
            });
        }
        if (guidelineLines.filter((g) => coerceTrimmedString(g, '')).length === 0) {
            nextActions.push({
                label: '가이드라인 정리',
                prompt: '이 프로젝트에 적용할 핵심 가이드라인 5개를 체크리스트로 만들어줘.',
            });
        }
        if (guidelineQuality.qualityScore < 80) {
            nextActions.push({
                label: '가이드라인 품질 개선',
                prompt: `현재 프로젝트 가이드라인 품질점수는 ${guidelineQuality.qualityScore}점입니다. 필수 규칙/중복/미분류를 개선하는 정비안을 만들어줘.`,
            });
        }
        if (currentProjectContext?.qualityTrendLabel?.includes('하락')) {
            nextActions.push({
                label: '품질 하락 원인 점검',
                prompt: '최근 가이드라인 품질 점수가 하락한 원인을 분석하고, 즉시 적용 가능한 복구 액션 3개를 제시해줘.',
            });
            qualityChecks.push({
                label: '품질 이슈 리포트 생성',
                prompt: [
                    `프로젝트 "${currentProject.name}"의 가이드라인 품질 이슈 리포트를 작성해줘.`,
                    `현재 점수: ${guidelineQuality.qualityScore}점, 상태: ${guidelineQuality.qualityStatus}, 추세: ${currentProjectContext.qualityTrendLabel}.`,
                    qualityHistoryLine ? `최근 이력: ${qualityHistoryLine}` : '최근 이력: 추세 데이터 부족',
                    '아래 순서로 작성해줘: 1) 하락 원인 3개 2) 즉시 복구 액션 5개(담당/기한/완료기준) 3) 재발 방지 규칙 3개.',
                ].join('\n'),
            });
            nextActions.push({
                label: '자동 복구 실행 체크리스트',
                prompt: [
                    `프로젝트 "${currentProject.name}" 가이드라인을 즉시 복구하기 위한 실행 체크리스트를 작성해줘.`,
                    `현재 품질: ${guidelineQuality.qualityScore}점 (${guidelineQuality.qualityStatus}), 추세: ${currentProjectContext.qualityTrendLabel}.`,
                    '다음 절차를 포함해줘: 1) 접두어 정리 2) 중복 제거 3) 빈 항목 제거 4) 필수 규칙 최소 1개 보정 5) 저장 후 재점검.',
                    '각 단계별 검증 기준과 실패 시 우회 방법까지 간단히 제시해줘.',
                ].join('\n'),
            });
        }
        if (currentProjectContext?.autoRecoveryReportPrompt) {
            qualityChecks.push({
                label: '최근 복구 리포트 재활용',
                prompt: `${currentProjectContext.autoRecoveryReportPrompt}\n\n추가 요청: 위 복구 리포트를 5줄 브리핑과 이번 주 실행 액션 3개로 요약해줘.`,
            });
        }
        if (currentProjectContext?.autoRecoveryDiffPrompt) {
            qualityChecks.push({
                label: '복구 diff 브리핑 생성',
                prompt: currentProjectContext.autoRecoveryDiffPrompt,
            });
        }
        if (currentProjectContext?.autoRecoveryComparePrompt) {
            qualityChecks.push({
                label: '복구 A/B 비교표 생성',
                prompt: currentProjectContext.autoRecoveryComparePrompt,
            });
        }
        if ((currentProject.files?.length ?? 0) + (currentProject.webSources?.length ?? 0) === 0) {
            nextActions.push({
                label: '학습 소스 준비',
                prompt: '이 프로젝트에서 먼저 등록하면 좋은 참고 소스(문서/영상/파일) 목록을 우선순위로 제안해줘.',
            });
        } else if ((currentProject.webSources?.length ?? 0) > 0) {
            nextActions.push({
                label: '웹 소스 기반 브리핑',
                prompt: [
                    `프로젝트 "${currentProject.name}"에 등록된 웹 소스를 기반으로 핵심 브리핑을 작성해줘.`,
                    '1) 핵심 요약 5줄 2) 논쟁 포인트 3개 3) 실무 체크리스트 5개 순서로 구성해줘.',
                    '각 항목에 가능한 경우 URL 근거를 함께 달아줘.',
                ].join('\n'),
            });
        }
        if (tags.some((t) => ['도시정비', '재건축', '재개발'].includes(t))) {
            nextActions.push({
                label: '도메인 실무 점검',
                prompt: '도시정비/재건축/재개발 프로젝트 착수 시점의 실무 점검표를 단계별로 정리해줘.',
            });
            deliverableTemplates.push({
                label: '수주 점검표',
                prompt: '재건축/재개발 시공사 입찰 수주 후 점검사항을 체크리스트로 정리해줘. 계약·보증·착공 전 준비·일정 리스크를 포함해줘.',
            });
            deliverableTemplates.push({
                label: '조합 보고서 초안',
                prompt: '도시정비 사업 기준으로 조합 보고서 초안을 작성해줘. 현황, 쟁점, 의사결정 항목, 다음 일정까지 포함해줘.',
            });
            deliverableTemplates.push({
                label: '주민 설명회 Q&A',
                prompt: '재건축/재개발 주민 설명회에서 자주 나오는 질문 15개와 모범 답변을 작성해줘. 민감 이슈는 별도 표시해줘.',
            });
            deliverableTemplates.push({
                label: '조합원 정보 전달 글',
                prompt: '조합원이 제대로 된 정보를 습득할 수 있도록, 현재 프로젝트·대화 맥락을 바탕으로 정확하고 이해하기 쉬운 안내 글을 작성해줘. 사실과 근거를 구분하고, 오해 소지가 있는 부분은 확인 질문 형태로 정리해줘.',
            });
            deliverableTemplates.push({
                label: '감정·여론 통합',
                prompt: '대화·자료에 담긴 조합원·관계자의 감정과 여론을 하나로 모아 요약해줘. 1) 공통 관심사·우려 2) 대립되는 의견 3) 합의 가능 지점 4) 추가 수렴이 필요한 항목 순으로 정리해줘.',
            });
            qualityChecks.push({
                label: '리스크 누락 점검',
                prompt: '현재 대화 내용 기준으로 사업 리스크(법률/일정/비용/민원) 누락 항목을 점검표로 만들어줘.',
            });
            qualityChecks.push({
                label: '근거 출처 검증',
                prompt: '방금 답변의 주장별 근거를 표로 정리해줘. 출처 유무, 신뢰도, 추가 확인 필요 항목을 함께 표시해줘.',
            });
        } else {
            deliverableTemplates.push({
                label: '주간 진행 보고서',
                prompt: '현재 프로젝트 대화 내용을 기반으로 주간 진행 보고서 템플릿을 작성해줘. 완료/진행/이슈/다음주 계획으로 구성해줘.',
            });
            deliverableTemplates.push({
                label: '실행 계획서 초안',
                prompt: '프로젝트 목표 달성을 위한 2주 실행 계획서를 작성해줘. 작업 단위, 담당 역할, 완료 기준을 포함해줘.',
            });
            qualityChecks.push({
                label: '답변 품질 점검',
                prompt: '최근 답변을 정확성/구체성/실행가능성 기준으로 자가 점검하고 개선 버전을 제시해줘.',
            });
            qualityChecks.push({
                label: '가정/제약 검토',
                prompt: '현재 제안에 포함된 가정과 제약을 표로 정리하고, 위험도가 높은 항목부터 대응안을 제시해줘.',
            });
        }
        if (nextActions.length === 0) {
            nextActions.push({
                label: '프로젝트 브리핑 생성',
                prompt: `${currentProject.name} 프로젝트의 현재 상태를 브리핑 형식으로 요약해줘.`,
            });
        }
        const quickPrompts = [...nextActions, ...deliverableTemplates, ...qualityChecks];

        return {
            recentSources,
            quickPrompts,
        };
    }, [
        currentProject,
        currentProjectContext?.autoRecoveryComparePrompt,
        currentProjectContext?.autoRecoveryDiffPrompt,
        currentProjectContext?.autoRecoveryReportPrompt,
        currentProjectContext?.qualityHistoryEntries,
        currentProjectContext?.qualityTrendLabel,
    ]);

    useEffect(() => {
        if (!currentProject?.id || !currentProjectContext) return;
        const shouldAlert = currentProjectContext.qualityStatus === 'risk'
            || currentProjectContext.qualityTrendDirection === 'down';
        if (!shouldAlert) return;
        const now = Date.now();
        try {
            const mutedUntil = Number(localStorage.getItem(`project-guideline-quality-alert-muted-until-${currentProject.id}`) || '0');
            if (mutedUntil > now) return;
            const lastShown = Number(localStorage.getItem(`project-guideline-quality-alert-last-shown-${currentProject.id}`) || '0');
            if (now - lastShown < GUIDELINE_ALERT_COOLDOWN_MS) return;
            localStorage.setItem(`project-guideline-quality-alert-last-shown-${currentProject.id}`, String(now));
        } catch {
            // 저장 실패 시에도 사용자에게 1회 안내
        }
        const alertMessage = currentProjectContext.qualityStatus === 'risk'
            ? `프로젝트 "${currentProjectContext.name}" 가이드라인 품질이 위험 상태입니다. 즉시 정비를 권장합니다.`
            : `프로젝트 "${currentProjectContext.name}" 가이드라인 품질이 하락 추세입니다. 점검을 권장합니다.`;
        try {
            showToast(alertMessage, 'info');
        } catch {
            /* 테스트·비브라우저 환경에서 CustomEvent 실패 등 */
        }
    }, [
        currentProject?.id,
        currentProjectContext,
    ]);

    // 검색 결과 탐색
    const navigateMessageSearch = useCallback((direction: 'prev' | 'next') => {
        if (messageSearchResults.length === 0) return;
        setMessageSearchIndex((prev) => {
            if (direction === 'next') {
                return (prev + 1) % messageSearchResults.length;
            } else {
                return (prev - 1 + messageSearchResults.length) % messageSearchResults.length;
            }
        });
    }, [messageSearchResults.length]);

    // 검색어 하이라이트 (플레인 텍스트)
    const highlightTextForPlainText = useCallback((text: string): React.ReactNode => {
        const query = messageSearchTrimmed;
        if (!query || !text) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => {
            const testRegex = new RegExp(`^${escaped}$`, 'i');
            return testRegex.test(part) ? (
                <mark key={i} className="search-highlight">{part}</mark>
            ) : (
                <React.Fragment key={i}>{part}</React.Fragment>
            );
        });
    }, [messageSearchTrimmed]);

    // 검색 결과로 스크롤
    useEffect(() => {
        if (messageSearchResults.length > 0 && messageSearchTrimmed) {
            const targetMessage = messageSearchResults[messageSearchIndex];
            if (!targetMessage?.message?.id) return;
            const element = document.getElementById(`message-${targetMessage.message.id}`);
            if (element) {
                try {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.animation = 'highlight-pulse 1s ease-out';
                    setTimeout(() => {
                        try {
                            element.style.animation = '';
                        } catch {
                            /* noop */
                        }
                    }, 1000);
                } catch {
                    /* jsdom: scrollIntoView 미구현 등 */
                }
            }
        }
    }, [messageSearchIndex, messageSearchResults, messageSearchTrimmed]);

    // 빠른 후속 질문 제안 생성
    const generateQuickSuggestions = useCallback((lastAssistantMessage: string, lastUserMessage: string) => {
        const suggestions: string[] = [];
        const msgLower = lastAssistantMessage.toLowerCase();
        const userMsgLower = lastUserMessage.toLowerCase();

        // 단계별 설명이 있으면 "더 자세히" 제안
        if (msgLower.includes('단계') || msgLower.includes('방법')) {
            suggestions.push('더 자세히 설명해줘');
            suggestions.push('예시를 들어줘');
        }

        // 장단점이 있으면 대안 제안
        if (msgLower.includes('장점') || msgLower.includes('단점')) {
            suggestions.push('대안이 있을까?');
            suggestions.push('어떤 경우에 추천해?');
        }

        // 비교 내용이 있으면 추천 제안
        if (msgLower.includes('비교') || msgLower.includes('vs')) {
            suggestions.push('어떤 걸 추천해?');
            suggestions.push('내 상황에 맞는 건?');
        }

        // 기본 후속 질문
        if (suggestions.length === 0) {
            suggestions.push('더 알려줘');
            suggestions.push('요약해줘');
        }

        // 사용자 질문 기반 후속 제안
        if (userMsgLower.includes('어떻게')) {
            suggestions.push('주의할 점은?');
        }
        if (userMsgLower.includes('추천')) {
            suggestions.push('다른 옵션은?');
        }

        setQuickSuggestions(suggestions);
    }, []);

    const buildStructuredGenerationPrompt = useCallback((rawInput: string, options?: {
        variationInstruction?: string;
        styleLearningInstruction?: string;
    }) => {
        const parsedSections = parseQuestionRequirementSections(rawInput);
        const explicitQuestionRequirementIntent =
            structuredInputAssistEnabled && shouldTreatAsStructuredQuestionRequirements(parsedSections);
        if (shouldUseSimpleComposerOutboundMessage(rawInput)) {
            return coerceTrimmedString(rawInput, '');
        }

        const questionIntent = /(질문|q&a|qa|인터뷰|면담 질문|물어볼)/i.test(rawInput);
        const requirementsIntent = /(요구사항|요건|requirement|명세|스펙|spec)/i.test(rawInput);
        const minutesIntent = /(회의록|미팅 노트|회의 정리|회의 결과)/i.test(rawInput);
        const checklistIntent = /(체크리스트|점검표|점검 항목|todo|할 일)/i.test(rawInput);
        const riskIntent = /(리스크|위험|risk|위험도|완화 방안)/i.test(rawInput);

        const styleInstruction = responseStyle === 'concise'
            ? '최대한 간결하게, 핵심만 bullet 중심으로 작성하세요.'
            : responseStyle === 'balanced'
                ? '핵심과 근거를 균형 있게 작성하세요.'
                : responseStyle === 'detailed'
                    ? '실무 적용 가능한 세부 항목까지 충분히 상세히 작성하세요.'
                    : '종합형으로 작성하고, 요약→본문→실행계획 순으로 구조화하세요.';

        const perspectiveInstruction = perspective === 'practical'
            ? '실행 가능성과 현실 적용성을 최우선으로 판단하세요.'
            : perspective === 'theoretical'
                ? '개념적 근거와 원리를 명확히 제시하세요.'
                : perspective === 'creative'
                    ? '대안안을 2개 이상 제시해 창의적 선택지를 포함하세요. 독창적 관점·반직관적 인사이트를 담으세요.'
                    : perspective === 'critical'
                        ? '가정/한계/반례를 먼저 점검하고 보완안을 제시하세요.'
                        : perspective === 'empathetic'
                            ? '이해관계자 관점의 우려/커뮤니케이션 포인트를 반영하세요.'
                            : '';

        const innovativeWritingInstruction = [
            '[혁신적 답변·글쓰기 품질]',
            '• 논리적 구조: 전제→논리 전개→결론 순으로 설득력 있게 작성하세요.',
            '• 결론 선행: 핵심 요약·결론을 먼저 제시한 뒤 상세를 풀어가세요.',
            '• 독창적 관점: 흔한 수식어 대신 날카로운 관점·반직관적 인사이트를 포함하세요.',
            '• 수식어 지양: "혁신적", "획기적" 등 빈번한 수식어는 피하고, 구체적 근거로 대체하세요.',
            ...(perspective === 'creative'
                ? ['• 창의 모드: 기존과 다른 접근법, 위트 있는 표현(적절히), 2개 이상 대안을 제시하세요.']
                : []),
        ].join('\n');

        const presetInstructions: Record<Exclude<OutputPreset, 'auto'>, string> = {
            'question-bank': '질문은행 형식으로 작성하세요. 카테고리별 10개 이상 질문, 질문 목적, 사용 시점, 후속 질문 1개를 포함하세요.',
            requirements: '요구사항 명세 형식으로 작성하세요. 기능/비기능/제약/수용 기준(AC)을 표 형태로 정리하세요.',
            minutes: '회의록 형식으로 작성하세요. 참석자, 안건, 결정사항, 액션 아이템(담당/기한), 미결 이슈를 포함하세요.',
            checklist: '실행 체크리스트 형식으로 작성하세요. 단계별 항목, 완료 기준, 우선순위(P1~P3), 예상 소요시간을 포함하세요.',
            'risk-matrix': '리스크 매트릭스 형식으로 작성하세요. 리스크 항목, 영향도, 발생 가능성, 조기 징후, 대응/완화 방안을 표로 작성하세요.',
        };

        let resolvedInstruction = '';
        let resolvedPresetType: OutputPreset | 'question-requirements-combined' = 'auto';
        if (outputPreset !== 'auto') {
            resolvedInstruction = presetInstructions[outputPreset];
            resolvedPresetType = outputPreset;
        } else if (
            explicitQuestionRequirementIntent ||
            shouldUseDualKeywordQuestionRequirementsPreset(rawInput, questionIntent, requirementsIntent)
        ) {
            resolvedInstruction = '1) 질문 목록과 2) 요구사항 명세를 분리 작성하세요. 질문 파트는 카테고리별, 요구사항 파트는 기능/비기능/수용기준으로 정리하세요.';
            resolvedPresetType = 'question-requirements-combined';
        } else if (minutesIntent) {
            resolvedInstruction = presetInstructions.minutes;
            resolvedPresetType = 'minutes';
        } else if (checklistIntent) {
            resolvedInstruction = presetInstructions.checklist;
            resolvedPresetType = 'checklist';
        } else if (riskIntent) {
            resolvedInstruction = presetInstructions['risk-matrix'];
            resolvedPresetType = 'risk-matrix';
        } else if (questionIntent) {
            resolvedInstruction = '질문 생성 요청으로 인식하고, 난이도/목적 기준으로 구조화하세요.';
            resolvedPresetType = 'question-bank';
        } else if (requirementsIntent) {
            resolvedInstruction = '요구사항 요청으로 인식하고, 기능/비기능/제약/수용기준을 빠짐없이 구조화하세요.';
            resolvedPresetType = 'requirements';
        }

        const outputSkeletonByPreset: Record<OutputPreset | 'question-requirements-combined', string> = {
            auto: [
                '## 핵심 요약',
                '- 요약 1',
                '- 요약 2',
                '',
                '## 본문',
                '- 핵심 내용',
                '',
                '## 실행 항목',
                '- 항목 / 담당 / 기한',
            ].join('\n'),
            'question-bank': [
                '## 카테고리 A',
                '| 질문 | 목적 | 사용 시점 | 후속 질문 |',
                '|---|---|---|---|',
                '| Q1 |  |  |  |',
                '',
                '## 카테고리 B',
                '| 질문 | 목적 | 사용 시점 | 후속 질문 |',
                '|---|---|---|---|',
                '| Q1 |  |  |  |',
            ].join('\n'),
            requirements: [
                '## 요구사항 명세',
                '| 구분 | 항목 | 상세 내용 | 수용 기준(AC) |',
                '|---|---|---|---|',
                '| 기능 |  |  |  |',
                '| 비기능 |  |  |  |',
                '| 제약 |  |  |  |',
                '',
                '## 오픈 이슈',
                '- 이슈 / 확인 담당 / 마감일',
            ].join('\n'),
            minutes: [
                '## 회의 개요',
                '- 일시:',
                '- 참석자:',
                '- 안건:',
                '',
                '## 결정사항',
                '1) ',
                '',
                '## 액션 아이템',
                '| 항목 | 담당 | 기한 | 상태 |',
                '|---|---|---|---|',
                '|  |  |  |  |',
                '',
                '## 미결 이슈',
                '- 이슈 / 추가 확인사항',
            ].join('\n'),
            checklist: [
                '## 실행 체크리스트',
                '| 단계 | 체크 항목 | 완료 기준 | 우선순위(P1~P3) | 예상 소요시간 |',
                '|---|---|---|---|---|',
                '| 1 |  |  |  |  |',
                '| 2 |  |  |  |  |',
                '',
                '## 선행 조건',
                '- 조건 1',
            ].join('\n'),
            'risk-matrix': [
                '## 리스크 매트릭스',
                '| 리스크 항목 | 영향도(1~5) | 발생 가능성(1~5) | 조기 징후 | 대응/완화 방안 | 담당 |',
                '|---|---:|---:|---|---|---|',
                '|  |  |  |  |  |  |',
                '',
                '## 우선 대응 Top 3',
                '1) ',
                '2) ',
                '3) ',
            ].join('\n'),
            'question-requirements-combined': [
                '## 질문 목록',
                '| 질문 | 목적 | 우선순위 |',
                '|---|---|---|',
                '|  |  |  |',
                '',
                '## 요구사항 명세',
                '| 구분 | 항목 | 상세 내용 | 수용 기준(AC) |',
                '|---|---|---|---|',
                '| 기능 |  |  |  |',
                '| 비기능 |  |  |  |',
            ].join('\n'),
        };

        const urbanOutputSkeletonOverrides: Partial<Record<OutputPreset | 'question-requirements-combined', string>> = {
            'question-bank': [
                '## 이해관계자별 질문은행',
                '| 구분(조합/주민/시공사/지자체) | 질문 | 확인 목적 | 민감도(상/중/하) | 후속 질문 |',
                '|---|---|---|---|---|',
                '| 조합 |  |  |  |  |',
                '| 주민 |  |  |  |  |',
                '',
                '## 단계별 확인 질문',
                '| 단계(추진위/조합설립/사업시행/관리처분/이주·철거) | 핵심 질문 |',
                '|---|---|',
                '|  |  |',
            ].join('\n'),
            requirements: [
                '## 도시정비 요구사항 명세',
                '| 구분 | 항목 | 상세 내용 | 수용 기준(AC) | 관련 주체 | 관련 단계 |',
                '|---|---|---|---|---|---|',
                '| 기능 |  |  |  | 조합/시공사/지자체 |  |',
                '| 비기능 |  |  |  |  |  |',
                '| 제약 |  |  |  |  |  |',
                '',
                '## 인허가/법정 검토 포인트',
                '- 법정 절차 / 필요 문서 / 확인 기관',
            ].join('\n'),
            minutes: [
                '## 회의 개요',
                '- 일시:',
                '- 참석자(조합/시공사/협력사/지자체):',
                '- 사업 단계:',
                '- 안건:',
                '',
                '## 결정사항',
                '1) ',
                '',
                '## 액션 아이템',
                '| 항목 | 담당 주체 | 기한 | 선행 인허가/의존성 | 상태 |',
                '|---|---|---|---|---|',
                '|  |  |  |  |  |',
                '',
                '## 민원/이해관계자 이슈',
                '- 이슈 / 영향 범위 / 대응 계획',
            ].join('\n'),
            checklist: [
                '## 단계별 실행 체크리스트',
                '| 단계 | 체크 항목 | 완료 기준 | 담당 주체 | 우선순위(P1~P3) | 예상 소요시간 |',
                '|---|---|---|---|---|---|',
                '| 추진위 |  |  |  |  |  |',
                '| 조합설립 |  |  |  |  |  |',
                '| 사업시행 |  |  |  |  |  |',
                '',
                '## 필수 증빙/문서',
                '- 항목 / 확보 여부 / 보완 필요사항',
            ].join('\n'),
            'risk-matrix': [
                '## 도시정비 리스크 매트릭스',
                '| 리스크 항목 | 유형(인허가/일정/비용/민원/법률) | 영향도(1~5) | 발생 가능성(1~5) | 조기 징후 | 대응/완화 방안 | 담당 주체 |',
                '|---|---|---:|---:|---|---|---|',
                '|  |  |  |  |  |  |  |',
                '',
                '## 우선 대응 Top 3',
                '1) ',
                '2) ',
                '3) ',
            ].join('\n'),
            'question-requirements-combined': [
                '## 이해관계자 질문 목록',
                '| 구분 | 질문 | 목적 | 우선순위 |',
                '|---|---|---|---|',
                '| 조합 |  |  |  |',
                '| 주민 |  |  |  |',
                '',
                '## 도시정비 요구사항 명세',
                '| 구분 | 항목 | 상세 내용 | 수용 기준(AC) | 관련 단계 |',
                '|---|---|---|---|---|',
                '| 기능 |  |  |  |  |',
                '| 비기능 |  |  |  |  |',
            ].join('\n'),
        };

        const resolvedSkeletonMap = isUrbanDomainProject
            ? { ...outputSkeletonByPreset, ...urbanOutputSkeletonOverrides }
            : outputSkeletonByPreset;

        const outputSkeletonInstruction = [
            '아래 스켈레톤 헤더 구조를 유지하여 작성하세요(필요한 항목은 채워 넣고, 불필요 항목은 "해당 없음"으로 표기).',
            resolvedSkeletonMap[resolvedPresetType],
        ].join('\n\n');

        const qualityGuardrail = [
            '핵심 요약(3줄 이내) 섹션을 먼저 제시하세요.',
            '누락 가능성이 높은 항목 3개를 별도 섹션으로 제시하세요.',
            '확실하지 않은 내용은 "확인 필요"로 명시하고 추가 확인 질문을 2개 제시하세요.',
            '실행 가능한 다음 단계 또는 구체적 액션을 1개 이상 제시하세요.',
            '근거·출처가 있으면 명시하세요.',
        ].join('\n');

        const parsedGuidelines = (currentProject?.initialGuidelines ?? [])
            .map((item) => coerceTrimmedString(item, ''))
            .filter((item) => item.length > 0)
            .map((item) => {
                const matched = item.match(/^\[(필수|권장)\]\s*(.+)$/);
                if (matched?.[1] === '필수' && matched[2]) {
                    return { level: 'required' as const, text: coerceTrimmedString(matched[2], '') };
                }
                if (matched?.[1] === '권장' && matched[2]) {
                    return { level: 'recommended' as const, text: coerceTrimmedString(matched[2], '') };
                }
                // 접두어가 없으면 권장으로 처리
                return { level: 'recommended' as const, text: item };
            });

        const requiredGuidelines = parsedGuidelines.filter((g) => g.level === 'required');
        const recommendedGuidelines = parsedGuidelines.filter((g) => g.level === 'recommended');

        const guidelineInstruction = parsedGuidelines.length > 0
            ? [
                '[프로젝트 가이드라인 우선 반영]',
                requiredGuidelines.length > 0 ? '필수 규칙(반드시 준수):' : '필수 규칙: 없음',
                ...(requiredGuidelines.length > 0
                    ? requiredGuidelines.map((g, index) => `R${index + 1}. ${g.text}`)
                    : []),
                '',
                recommendedGuidelines.length > 0 ? '권장 규칙(가능하면 반영):' : '권장 규칙: 없음',
                ...(recommendedGuidelines.length > 0
                    ? recommendedGuidelines.map((g, index) => `G${index + 1}. ${g.text}`)
                    : []),
                '',
                '충돌 시 우선순위: 필수 규칙 > 출력 형식 지시 > 권장 규칙.',
                '필수 규칙을 충족하지 못하면 이유를 명시하고 대체안을 제시하세요.',
            ].join('\n')
            : '[프로젝트 가이드라인 우선 반영]\n등록된 가이드라인이 없으면 기본 품질 기준을 따르세요.';

        const guidelineQuality = analyzeGuidelines(currentProject?.initialGuidelines ?? []);
        const guidelineQualityInstruction = [
            '[가이드라인 품질 상태]',
            `품질점수: ${guidelineQuality.qualityScore} / 상태: ${guidelineQuality.qualityStatus}`,
            ...(guidelineQuality.recommendations.length > 0
                ? ['보완 권장:', ...guidelineQuality.recommendations.map((item, idx) => `${idx + 1}. ${item}`)]
                : ['보완 권장: 현재 기준 양호']),
        ].join('\n');

        const domainInstruction = isUrbanDomainProject
            ? '도시정비/재건축/재개발 실무 맥락을 반영하세요. 인허가, 이해관계자 커뮤니케이션, 일정/비용 리스크를 반드시 포함하세요.'
            : '일반 프로젝트 맥락으로 작성하되 실행 순서와 책임 주체를 명확히 제시하세요.';

        const projectInstruction = currentProject?.name
            ? `현재 프로젝트명: ${currentProject.name}`
            : '';
        const parsedInputInstruction = explicitQuestionRequirementIntent
            ? [
                '[입력 해석]',
                '아래 사용자 입력의 질문과 요구사항을 모두 충족해야 합니다.',
                '질문:',
                parsedSections.question,
                '',
                '요구사항:',
                parsedSections.requirements,
            ].join('\n')
            : '';

        // 답변 다양성 및 유연성 향상을 위한 추가 지시사항 (강화)
        const flexibilityInstruction = [
            '[답변 다양성 및 유연성 - 강제 적용]',
            '• [필수] 같은 질문에 대해 반드시 다양한 관점과 접근 방식을 사용하세요. 이전 답변과 동일한 구조를 절대 반복하지 마세요.',
            '• [필수] 사용자의 의도에 정확히 맞게 답변 형식(보고서/칼럼/요약/단계별 가이드/Q&A/사건조사 등)을 자동으로 감지하고 유연하게 조절하세요.',
            '• [필수] 요청마다 반드시 다른 논리 전개 순서와 예시를 사용하여 답변의 다양성을 보장하세요.',
            '• [필수] 창의적 대안과 반직관적 인사이트를 반드시 포함하여 독창적인 답변을 생성하세요.',
            '• [필수] 사용자가 명시한 형식이나 스타일이 있으면 반드시 따르되, 그 안에서도 다양한 표현과 구조를 사용하세요.',
            '• [필수] 매 요청마다 다른 문장 구조, 다른 예시, 다른 관점을 사용하여 답변의 다양성을 극대화하세요.',
            '• [필수] 사용자의 질문과 요구사항을 정확히 파악하여 그에 맞는 형식, 길이, 깊이로 답변하세요.',
        ].join('\n');

        if (userInputAlreadyContainsFullComposerInstructionBlock(rawInput)) {
            const thinAppend = [
                ...(parsedGuidelines.length > 0 ? [guidelineInstruction] : []),
                guidelineQualityInstruction,
                domainInstruction,
                projectInstruction,
                parsedInputInstruction,
                coerceTrimmedString(options?.styleLearningInstruction, ''),
                coerceTrimmedString(options?.variationInstruction, ''),
            ].filter((s) => s.length > 0).join('\n\n');
            return thinAppend ? `${rawInput}\n\n${thinAppend}` : rawInput;
        }

        const instructionBlock = [
            '[출력 형식 지시]',
            resolvedInstruction || '질문 의도를 분석해 가장 적합한 형식으로 구조화하세요.',
            '',
            '[응답 스타일 지시]',
            styleInstruction,
            perspectiveInstruction || '관점은 중립으로 유지하되 실행 가능성을 우선하세요.',
            '',
            innovativeWritingInstruction,
            '',
            '[품질 검증 지시]',
            qualityGuardrail,
            options?.variationInstruction
                ? `[다양성 지시]\n${options.variationInstruction}`
                : '',
            options?.styleLearningInstruction || '',
            '',
            flexibilityInstruction, // 답변 다양성 및 유연성 지시사항 추가
            '',
            guidelineInstruction,
            '',
            guidelineQualityInstruction,
            '',
            '[도메인 지시]',
            domainInstruction,
            projectInstruction,
            parsedInputInstruction,
            '',
            '[출력 스켈레톤]',
            outputSkeletonInstruction,
        ].filter(Boolean).join('\n');

        return `${rawInput}\n\n${instructionBlock}`;
    }, [currentProject?.initialGuidelines, currentProject?.name, isUrbanDomainProject, outputPreset, perspective, responseStyle, structuredInputAssistEnabled]);

    // 프로젝트별 생성 모드 복원
    useEffect(() => {
        if (!currentProject?.id) {
            setOutputPreset('auto');
            return;
        }
        try {
            const raw = localStorage.getItem(OUTPUT_PRESET_STORAGE_KEY);
            if (!raw) {
                setOutputPreset('auto');
                return;
            }
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            const savedPreset = parsed?.[currentProject.id];
            setOutputPreset(isOutputPreset(savedPreset) ? savedPreset : 'auto');
        } catch {
            setOutputPreset('auto');
        }
    }, [currentProject?.id]);

    // 프로젝트별 답변 다양성 모드 복원
    useEffect(() => {
        if (!currentProject?.id) {
            setAnswerDiversityMode('varied');
            return;
        }
        try {
            const raw = localStorage.getItem(ANSWER_DIVERSITY_STORAGE_KEY);
            if (!raw) {
                setAnswerDiversityMode('varied');
                return;
            }
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            const savedMode = parsed?.[currentProject.id];
            if (savedMode === 'stable' || savedMode === 'varied' || savedMode === 'exploratory') {
                setAnswerDiversityMode(savedMode);
                return;
            }
            setAnswerDiversityMode('varied');
        } catch {
            setAnswerDiversityMode('varied');
        }
    }, [currentProject?.id]);

    // 프로젝트별 생성 모드 저장
    useEffect(() => {
        if (!currentProject?.id) return;
        try {
            const raw = localStorage.getItem(OUTPUT_PRESET_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            const presetMap = (parsed && typeof parsed === 'object')
                ? parsed as Record<string, OutputPreset>
                : {};

            if (outputPreset === 'auto') {
                delete presetMap[currentProject.id];
            } else {
                presetMap[currentProject.id] = outputPreset;
            }
            localStorage.setItem(OUTPUT_PRESET_STORAGE_KEY, JSON.stringify(presetMap));
        } catch {
            // 저장 실패 시 무시 (기능 폴백: auto)
        }
    }, [currentProject?.id, outputPreset]);

    // 프로젝트별 답변 다양성 모드 저장
    useEffect(() => {
        if (!currentProject?.id) return;
        try {
            const raw = localStorage.getItem(ANSWER_DIVERSITY_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            const modeMap = (parsed && typeof parsed === 'object')
                ? parsed as Record<string, AnswerDiversityMode>
                : {};
            modeMap[currentProject.id] = answerDiversityMode;
            localStorage.setItem(ANSWER_DIVERSITY_STORAGE_KEY, JSON.stringify(modeMap));
        } catch {
            // 저장 실패 시 무시
        }
    }, [answerDiversityMode, currentProject?.id]);

    // 프로젝트별 질문+요구 도우미 복원
    useEffect(() => {
        if (!currentProject?.id) {
            setStructuredInputAssistEnabled(true);
            return;
        }
        try {
            const raw = localStorage.getItem(STRUCTURED_INPUT_ASSIST_STORAGE_KEY);
            if (!raw) {
                setStructuredInputAssistEnabled(true);
                return;
            }
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            const savedValue = parsed?.[currentProject.id];
            setStructuredInputAssistEnabled(savedValue !== false);
        } catch {
            setStructuredInputAssistEnabled(true);
        }
    }, [currentProject?.id]);

    // 프로젝트별 질문+요구 도우미 저장
    useEffect(() => {
        if (!currentProject?.id) return;
        try {
            const raw = localStorage.getItem(STRUCTURED_INPUT_ASSIST_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            const map = (parsed && typeof parsed === 'object')
                ? parsed as Record<string, boolean>
                : {};
            map[currentProject.id] = structuredInputAssistEnabled;
            localStorage.setItem(STRUCTURED_INPUT_ASSIST_STORAGE_KEY, JSON.stringify(map));
        } catch {
            // 저장 실패 시 무시
        }
    }, [currentProject?.id, structuredInputAssistEnabled]);

    // 프로젝트별 문체 학습 프로필 복원
    useEffect(() => {
        if (!currentProject?.id) {
            setWritingStyleProfile({
                enabled: true,
                anchors: [],
                learnedSignals: [],
                snapshots: [],
                updatedAt: new Date().toISOString(),
            });
            return;
        }
        try {
            const raw = localStorage.getItem(WRITING_STYLE_LEARNING_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Record<string, Partial<WritingStyleLearningProfile> | undefined>;
            const saved = parsed?.[currentProject.id];
            if (!saved) return;
            setWritingStyleProfile({
                enabled: saved.enabled !== false,
                anchors: Array.isArray(saved.anchors) ? saved.anchors.map((v) => String(v)) : [],
                learnedSignals: Array.isArray(saved.learnedSignals) ? saved.learnedSignals.map((v) => String(v)) : [],
                snapshots: Array.isArray(saved.snapshots)
                    ? saved.snapshots
                        .map((item) => ({
                            id: String((item as { id?: unknown }).id ?? `style-${Date.now()}`),
                            label: String((item as { label?: unknown }).label ?? '저장된 버전'),
                            savedAt: String((item as { savedAt?: unknown }).savedAt ?? new Date().toISOString()),
                            anchors: Array.isArray((item as { anchors?: unknown[] }).anchors)
                                ? ((item as { anchors?: unknown[] }).anchors as unknown[]).map((v) => String(v))
                                : [],
                            learnedSignals: Array.isArray((item as { learnedSignals?: unknown[] }).learnedSignals)
                                ? ((item as { learnedSignals?: unknown[] }).learnedSignals as unknown[]).map((v) => String(v))
                                : [],
                        }))
                    : [],
                updatedAt: typeof saved.updatedAt === 'string' ? saved.updatedAt : new Date().toISOString(),
            });
        } catch {
            // 복원 실패 시 기본값 유지
        }
    }, [currentProject?.id]);

    // 프로젝트별 문체 학습 프로필 저장
    useEffect(() => {
        if (!currentProject?.id) return;
        try {
            const raw = localStorage.getItem(WRITING_STYLE_LEARNING_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            const map = (parsed && typeof parsed === 'object')
                ? parsed as Record<string, WritingStyleLearningProfile>
                : {};
            map[currentProject.id] = writingStyleProfile;
            localStorage.setItem(WRITING_STYLE_LEARNING_STORAGE_KEY, JSON.stringify(map));
        } catch {
            // 저장 실패 시 무시
        }
    }, [currentProject?.id, writingStyleProfile]);

    // TTS: 메시지 음성 읽기
    const speakMessage = useCallback((messageId: string, content: string) => {
        // 이미 읽고 있는 중이면 중지
        if (speakingMessageId === messageId) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            speechSynthRef.current = null;
            return;
        }

        // 다른 메시지 읽고 있으면 중지
        if (speakingMessageId) {
            window.speechSynthesis.cancel();
        }

        // 마크다운/코드 블록 제거
        const cleanText = coerceTrimmedString(
            content
                .replace(/```[\s\S]*?```/g, '코드 블록')
                .replace(/`[^`]+`/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/#{1,6}\s/g, '')
                .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
                .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
                .replace(/~~([^~]+)~~/g, '$1')
                .replace(/>\s/g, '')
                .replace(/[-*+]\s/g, '')
                .replace(/\d+\.\s/g, ''),
            ''
        );

        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ko-KR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // 한국어 음성 찾기
        const voices = window.speechSynthesis.getVoices();
        const koreanVoice = voices.find(v => v.lang.includes('ko'));
        if (koreanVoice) {
            utterance.voice = koreanVoice;
        }

        utterance.onend = () => {
            setSpeakingMessageId(null);
            speechSynthRef.current = null;
        };

        utterance.onerror = () => {
            setSpeakingMessageId(null);
            speechSynthRef.current = null;
        };

        speechSynthRef.current = utterance;
        setSpeakingMessageId(messageId);
        window.speechSynthesis.speak(utterance);
    }, [speakingMessageId]);

    // TTS 정리
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // 타임스탬프 표시 토글
    const toggleTimestamps = useCallback(() => {
        setShowTimestamps(prev => {
            const newValue = !prev;
            localStorage.setItem(CHATGPT_SHOW_TIMESTAMPS_STORAGE_KEY, String(newValue));
            return newValue;
        });
    }, []);

    // 대화 메시지가 업데이트될 때 빠른 제안 생성
    useEffect(() => {
        if (!currentConversation || currentConversation.messages.length < 2) {
            setQuickSuggestions([]);
            return;
        }

        const messages = currentConversation.messages;
        const lastMessage = messages[messages.length - 1];
        const secondLastMessage = messages[messages.length - 2];

        // 마지막 메시지가 AI 응답이고 로딩 중이 아닐 때만 제안 생성
        if (lastMessage?.role === 'assistant' && secondLastMessage?.role === 'user' && !isLoading && !isStreaming) {
            generateQuickSuggestions(lastMessage.content, secondLastMessage.content);
        } else {
            setQuickSuggestions([]);
        }
    // currentConversation intentionally omitted to avoid re-running on ref identity change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConversation?.messages, isLoading, isStreaming, generateQuickSuggestions]);

    // 소스 기반 추천 질문 로드 (프로젝트 웰컴·빈 대화 스레드 — 입력 도크 위 칩용)
    useEffect(() => {
        if (!currentProject) {
            setSuggestedQuestionsFromSource([]);
            return;
        }
        if (
            currentConversation &&
            (currentConversation.projectId !== currentProject.id || currentConversation.messages.length > 0)
        ) {
            setSuggestedQuestionsFromSource([]);
            return;
        }
        let cancelled = false;
        Promise.resolve(projectService.getNotebookSuggestedQuestions(currentProject.id))
            .then((questions) => {
                if (!cancelled && questions && questions.length > 0) {
                    setSuggestedQuestionsFromSource(questions);
                } else if (!cancelled) {
                    setSuggestedQuestionsFromSource([]);
                }
            })
            .catch(() => {
                if (!cancelled) setSuggestedQuestionsFromSource([]);
            });
        return () => { cancelled = true; };
    // currentProject/currentConversation 제외: 객체 참조 변경 시 불필요한 재요청 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProject?.id, currentConversation?.id, currentConversation?.projectId, currentConversation?.messages?.length]);

    // 대화 내보내기 (Markdown, JSON, 또는 클립보드 복사)
    const exportConversation = useCallback((format: 'markdown' | 'json' | 'html' | 'clipboard' | 'txt' = 'markdown') => {
        if (!currentConversation || currentConversation.messages.length === 0) {
            showToast('내보낼 대화가 없습니다.', 'info');
            return;
        }

        let content: string;
        let filename: string;
        let mimeType: string;

        if (format === 'txt') {
            const lines: string[] = [
                `[${currentConversation.title}]`,
                `생성일: ${formatDateSafe(currentConversation.createdAt, (d) => d.toLocaleString('ko-KR'), '—')}`,
                '='.repeat(40),
                '',
            ];
            currentConversation.messages.forEach((msg) => {
                const role = msg.role === 'user' ? '사용자' : 'AI';
                const time = formatDateSafe(msg.timestamp, (d) => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), '');
                lines.push(`[${role} ${time}]`);
                lines.push(msg.content);
                lines.push('');
            });
            content = lines.join('\n');
            filename = `${currentConversation.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
            mimeType = 'text/plain;charset=utf-8';
        } else if (format === 'markdown' || format === 'clipboard') {
            const lines: string[] = [
                `# ${currentConversation.title}`,
                '',
                `> 생성일: ${formatDateSafe(currentConversation.createdAt, (d) => d.toLocaleString('ko-KR'), '—')}`,
                `> 메시지 수: ${currentConversation.messages.length}`,
                '',
                '---',
                '',
            ];

            currentConversation.messages.forEach((msg) => {
                const role = msg.role === 'user' ? '👤 **사용자**' : '🤖 **AI**';
                const time = formatDateSafe(msg.timestamp, (d) => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), '');
                lines.push(`### ${role} (${time})`);
                lines.push('');
                lines.push(msg.content);
                lines.push('');
                lines.push('---');
                lines.push('');
            });

            content = lines.join('\n');
            filename = `${currentConversation.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.md`;
            mimeType = 'text/markdown';

            if (format === 'clipboard') {
                navigator.clipboard.writeText(content).then(() => {
                    showToast('복사되었습니다', 'success');
                }).catch(() => {
                    showToast('클립보드에 복사에 실패했습니다.', 'error');
                });
                return;
            }
        } else if (format === 'html') {
            const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            /* Brainwave theme: --bg-secondary #F3F5F7, --accent-info-muted, --text-primary #141718, --text-secondary #6C7275 */
            const msgsHtml = currentConversation.messages.map((msg) => {
                const role = msg.role === 'user' ? '사용자' : 'AI';
                const time = formatDateSafe(msg.timestamp, (d) => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), '');
                const css = msg.role === 'user' ? 'background:#F3F5F7;margin-left:20%;border-radius:12px 12px 4px 12px;color:#141718' : 'background:rgba(0,132,255,0.12);margin-right:20%;border-radius:12px 12px 12px 4px;color:#141718';
                return `<div style="margin:12px 0"><div style="font-size:11px;color:#6C7275;margin-bottom:4px">${escapeHtml(role)} · ${escapeHtml(time)}</div><div style="padding:12px 16px;${css}">${escapeHtml(msg.content).replace(/\n/g, '<br/>')}</div></div>`;
            }).join('');
            content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(currentConversation.title)}</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:24px;line-height:1.6;color:#141718;background:#FEFEFE}h1{font-size:1.25rem;margin-bottom:8px}.meta{font-size:12px;color:#6C7275;margin-bottom:24px}</style></head><body><h1>${escapeHtml(currentConversation.title)}</h1><div class="meta">${formatDateSafe(currentConversation.createdAt, (d) => d.toLocaleString('ko-KR'), '—')} · ${currentConversation.messages.length}개 메시지</div><hr/>${msgsHtml}</body></html>`;
            filename = `${currentConversation.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
            mimeType = 'text/html';
        } else {
            const exportData = {
                id: currentConversation.id,
                title: currentConversation.title,
                createdAt: formatDateSafe(currentConversation.createdAt, (d) => d.toISOString(), new Date().toISOString()),
                updatedAt: formatDateSafe(currentConversation.updatedAt, (d) => d.toISOString(), new Date().toISOString()),
                ...(currentConversation.projectId ? { projectId: currentConversation.projectId } : {}),
                ...(currentConversation.gensparkAgentId
                    ? { gensparkAgentId: currentConversation.gensparkAgentId }
                    : {}),
                pinned: Boolean(currentConversation.pinned),
                messages: currentConversation.messages.map((msg) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: formatDateSafe(msg.timestamp, (d) => d.toISOString(), new Date().toISOString()),
                    ...(typeof msg.bookmarked === 'boolean' ? { bookmarked: msg.bookmarked } : {}),
                    ...(msg.reaction ? { reaction: msg.reaction } : {}),
                    ...(typeof msg.thinkingDurationMs === 'number' ? { thinkingDurationMs: msg.thinkingDurationMs } : {}),
                    ...(msg.suggestedFollowUps?.length ? { suggestedFollowUps: msg.suggestedFollowUps } : {}),
                    ...(msg.pipelineExtras && hasPipelineExtras(msg.pipelineExtras)
                        ? { pipelineExtras: msg.pipelineExtras }
                        : {}),
                })),
            };
            content = JSON.stringify(exportData, null, 2);
            filename = `${currentConversation.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
            mimeType = 'application/json';
        }

        // 파일 다운로드
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('다운로드되었습니다', 'success');
    }, [currentConversation]);

    // 즐겨찾기 메시지 TXT 내보내기
    const exportBookmarkedMessages = useCallback(() => {
        if (!currentConversation || bookmarkedMessages.length === 0) {
            showToast('즐겨찾기한 메시지가 없습니다.', 'info');
            return;
        }
        const lines: string[] = [
            `[즐겨찾기 메시지] — ${currentConversation.title}`,
            `내보내기 일시: ${new Date().toLocaleString('ko-KR')}`,
            `메시지 수: ${bookmarkedMessages.length}개`,
            '='.repeat(50),
            '',
        ];
        bookmarkedMessages.forEach((msg, i) => {
            const role = msg.role === 'user' ? '👤 사용자' : '🤖 AI';
            const time = msg.timestamp
                ? new Date(msg.timestamp).toLocaleString('ko-KR')
                : '';
            lines.push(`[${i + 1}] ${role}${time ? ` (${time})` : ''}`);
            lines.push(msg.content);
            lines.push('');
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `즐겨찾기_${currentConversation.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        showToast(`즐겨찾기 ${bookmarkedMessages.length}개 메시지를 내보냈습니다.`, 'success');
    }, [currentConversation, bookmarkedMessages]);

    // 대화 요약
    const [summaryText, setSummaryText] = useState<string | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    // 내보내기 옵션 모달
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'markdown' | 'json' | 'html' | 'txt'>('markdown');
    const [exportIncludeMeta, setExportIncludeMeta] = useState(true);
    const [exportBookmarkedOnly, setExportBookmarkedOnly] = useState(false);
    const [exportDateFrom, setExportDateFrom] = useState('');
    const [exportDateTo, setExportDateTo] = useState('');

    const runExportWithOptions = useCallback(() => {
        if (!currentConversation) return;
        let msgs = [...currentConversation.messages];
        if (exportBookmarkedOnly) {
            const bmIds = new Set(bookmarkedMessages.map(m => m.id));
            msgs = msgs.filter(m => bmIds.has(m.id));
        }
        if (exportDateFrom) {
            msgs = msgs.filter(m => m.timestamp ? new Date(m.timestamp) >= new Date(exportDateFrom) : true);
        }
        if (exportDateTo) {
            msgs = msgs.filter(m => m.timestamp ? new Date(m.timestamp) <= new Date(exportDateTo + 'T23:59:59') : true);
        }
        if (msgs.length === 0) {
            showToast('조건에 맞는 메시지가 없습니다.', 'info');
            return;
        }
        const tempConv = { ...currentConversation, messages: msgs };
        const q = (v: unknown) => String(v ?? '');
        const metaLines = exportIncludeMeta ? [
            `생성일: ${currentConversation.createdAt ? new Date(currentConversation.createdAt).toLocaleString('ko-KR') : '—'}`,
            `메시지 수: ${msgs.length}개 (전체 ${currentConversation.messages.length}개 중)`,
            exportBookmarkedOnly ? `[북마크 메시지만]` : '',
            exportDateFrom || exportDateTo ? `[기간 필터: ${exportDateFrom || '처음'} ~ ${exportDateTo || '현재'}]` : '',
        ].filter(Boolean).join('\n') : '';

        let content = '';
        const safeName = q(tempConv.title).replace(/[^a-zA-Z0-9가-힣]/g, '_');
        const dateStr = new Date().toISOString().slice(0, 10);

        if (exportFormat === 'markdown') {
            const lines: string[] = [`# ${tempConv.title}`, ''];
            if (exportIncludeMeta) lines.push(`> ${metaLines.replace(/\n/g, '\n> ')}`, '', '---', '');
            msgs.forEach(m => {
                const role = m.role === 'user' ? '👤 **사용자**' : '🤖 **AI**';
                const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
                lines.push(`### ${role} (${time})`, '', m.content, '', '---', '');
            });
            content = lines.join('\n');
            const blob = new Blob([content], { type: 'text/markdown' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${safeName}_${dateStr}.md`; a.click(); URL.revokeObjectURL(a.href);
        } else if (exportFormat === 'txt') {
            const lines: string[] = [`[${tempConv.title}]`];
            if (exportIncludeMeta) lines.push(metaLines);
            lines.push('='.repeat(40), '');
            msgs.forEach(m => {
                const role = m.role === 'user' ? '사용자' : 'AI';
                const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
                lines.push(`[${role} ${time}]`, m.content, '');
            });
            content = lines.join('\n');
            const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${safeName}_${dateStr}.txt`; a.click(); URL.revokeObjectURL(a.href);
        } else if (exportFormat === 'html') {
            const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const msgsHtml = msgs.map(m => {
                const role = m.role === 'user' ? '사용자' : 'AI';
                const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
                const css = m.role === 'user' ? 'background:#F3F5F7;margin-left:20%;border-radius:12px 12px 4px 12px' : 'background:rgba(0,132,255,0.12);margin-right:20%;border-radius:12px 12px 12px 4px';
                return `<div style="margin:12px 0"><div style="font-size:11px;color:#6C7275;margin-bottom:4px">${esc(role)} · ${esc(time)}</div><div style="padding:12px 16px;${css};color:#141718">${esc(m.content).replace(/\n/g, '<br/>')}</div></div>`;
            }).join('');
            const metaHtml = exportIncludeMeta ? `<div class="meta">${esc(metaLines).replace(/\n/g, '<br/>')}</div>` : '';
            content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(q(tempConv.title))}</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:24px;line-height:1.6}h1{font-size:1.25rem}.meta{font-size:12px;color:#6C7275;margin-bottom:16px;padding:8px 12px;background:#f8fafc;border-radius:8px}</style></head><body><h1>${esc(q(tempConv.title))}</h1>${metaHtml}<hr/>${msgsHtml}</body></html>`;
            const blob = new Blob([content], { type: 'text/html' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${safeName}_${dateStr}.html`; a.click(); URL.revokeObjectURL(a.href);
        } else {
            const exportData = {
                ...(exportIncludeMeta ? {
                    id: tempConv.id,
                    title: tempConv.title,
                    createdAt: tempConv.createdAt,
                    updatedAt: tempConv.updatedAt,
                    exportedAt: new Date().toISOString(),
                    filters: { bookmarkedOnly: exportBookmarkedOnly, dateFrom: exportDateFrom || null, dateTo: exportDateTo || null },
                } : { title: tempConv.title }),
                messages: msgs.map(m => ({ role: m.role, content: m.content, ...(exportIncludeMeta ? { timestamp: m.timestamp, id: m.id } : {}) })),
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${safeName}_${dateStr}.json`; a.click(); URL.revokeObjectURL(a.href);
        }
        showToast('내보내기 완료!', 'success');
        setShowExportModal(false);
    }, [currentConversation, exportFormat, exportIncludeMeta, exportBookmarkedOnly, exportDateFrom, exportDateTo, bookmarkedMessages]);

    const summarizeConversation = useCallback(async () => {
        if (!currentConversation) return;
        const msgs = currentConversation.messages ?? [];
        if (msgs.length === 0) {
            showToast('요약할 메시지가 없습니다.', 'info');
            return;
        }
        setSummaryLoading(true);
        setShowSummaryModal(true);
        setSummaryText(null);
        try {
            // 최근 40개 메시지를 기반으로 로컬 요약 (API 없이)
            const recent = msgs.slice(-40);
            const userMsgs = recent.filter(m => m.role === 'user');
            const assistantMsgs = recent.filter(m => m.role === 'assistant');
            const topics: string[] = [];
            userMsgs.slice(0, 6).forEach(m => {
                const first = m.content.trim().split('\n')[0].slice(0, 80);
                if (first) topics.push(`• ${first}${first.length >= 80 ? '…' : ''}`);
            });
            const lastAi = assistantMsgs[assistantMsgs.length - 1];
            const lastAiSnippet = lastAi ? lastAi.content.trim().slice(0, 200) : '';
            const summary = [
                `**대화 요약** — ${currentConversation.title}`,
                ``,
                `생성일: ${new Date().toLocaleString('ko-KR')}`,
                `총 메시지: ${msgs.length}개 (사용자 ${userMsgs.length}, AI ${assistantMsgs.length})`,
                ``,
                `**주요 질문 주제:**`,
                topics.length > 0 ? topics.join('\n') : '(주제 없음)',
                ``,
                `**마지막 AI 응답 요약:**`,
                lastAiSnippet ? `${lastAiSnippet}${lastAiSnippet.length >= 200 ? '…' : ''}` : '(없음)',
            ].join('\n');
            setSummaryText(summary);
        } catch {
            setSummaryText('요약 생성 중 오류가 발생했습니다.');
        } finally {
            setSummaryLoading(false);
        }
    }, [currentConversation]);

    const copySummary = useCallback(async () => {
        if (!summaryText) return;
        try {
            await navigator.clipboard.writeText(summaryText);
            showToast('요약을 클립보드에 복사했습니다.', 'success');
        } catch {
            showToast('복사에 실패했습니다.', 'error');
        }
    }, [summaryText]);

    // 대화 가져오기 (JSON, Markdown 또는 HTML 파일)
    const importConversation = useCallback(() => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,.md,.html';
        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setImportingConversation(true);
            try {
                const text = await file.text();
                const name = file.name.toLowerCase();
                const ext = name.endsWith('.json') ? 'json' : name.endsWith('.html') ? 'html' : 'md';

                let title: string;
                let convMessages: Message[];
                /** JSON 가져오기 시에만 채움 — MD/HTML은 현재 프로젝트·시각 기본값 */
                let importedConvMeta: {
                    projectId?: string;
                    gensparkAgentId?: string;
                    pinned?: boolean;
                    createdAt?: Date;
                    updatedAt?: Date;
                } = {};

                if (ext === 'json') {
                    const data = JSON.parse(text) as Record<string, unknown>;
                    if (!data.title || !data.messages || !Array.isArray(data.messages)) {
                        showToast('잘못된 대화 파일 형식입니다.', 'error');
                        return;
                    }
                    const importedTitleTrim =
                        typeof data.title === 'string' ? coerceTrimmedString(data.title, '') : '';
                    title = importedTitleTrim || '가져온 대화';
                    if (typeof data.projectId === 'string' && coerceTrimmedString(data.projectId, '')) {
                        importedConvMeta = { ...importedConvMeta, projectId: coerceTrimmedString(data.projectId, '') };
                    }
                    if (typeof data.gensparkAgentId === 'string' && coerceTrimmedString(data.gensparkAgentId, '')) {
                        importedConvMeta = {
                            ...importedConvMeta,
                            gensparkAgentId: coerceTrimmedString(data.gensparkAgentId, ''),
                        };
                    }
                    if (typeof data.pinned === 'boolean') {
                        importedConvMeta = { ...importedConvMeta, pinned: data.pinned };
                    }
                    if (typeof data.createdAt === 'string' && coerceTrimmedString(data.createdAt, '')) {
                        importedConvMeta = { ...importedConvMeta, createdAt: safeDate(data.createdAt) };
                    }
                    if (typeof data.updatedAt === 'string' && coerceTrimmedString(data.updatedAt, '')) {
                        importedConvMeta = { ...importedConvMeta, updatedAt: safeDate(data.updatedAt) };
                    }
                    convMessages = data.messages.map((raw: unknown, i: number) => {
                        const msg = raw as Record<string, unknown>;
                        const role = msg.role === 'assistant' ? 'assistant' : 'user';
                        const content = String(msg.content ?? '');
                        const id =
                            typeof msg.id === 'string' && coerceTrimmedString(msg.id, '')
                                ? msg.id
                                : `msg-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;
                        const base: Message = {
                            id,
                            role,
                            content,
                            timestamp: safeDate(msg.timestamp),
                            bookmarked: typeof msg.bookmarked === 'boolean' ? msg.bookmarked : false,
                        };
                        if (msg.reaction === 'like' || msg.reaction === 'dislike') {
                            base.reaction = msg.reaction;
                        }
                        if (typeof msg.thinkingDurationMs === 'number' && Number.isFinite(msg.thinkingDurationMs)) {
                            base.thinkingDurationMs = msg.thinkingDurationMs;
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
                            base.pipelineExtras = msg.pipelineExtras as NonNullable<Message['pipelineExtras']>;
                        }
                        return base;
                    });
                } else if (ext === 'md') {
                    // Markdown 파싱 (내보내기 형식: ### 👤 **사용자** / ### 🤖 **AI**)
                    const firstLine = coerceTrimmedString(text.split('\n')[0] ?? '', '');
                    title = firstLine.startsWith('# ')
                        ? coerceTrimmedString(firstLine.slice(2), '') || '가져온 대화'
                        : '가져온 대화';
                    const msgBlocks = text.split(/^### /m).filter(Boolean);
                    const simpleMd: Array<{ role: 'user' | 'assistant'; content: string }> = [];
                    for (const block of msgBlocks) {
                        const firstNewline = block.indexOf('\n');
                        const header = firstNewline >= 0 ? block.slice(0, firstNewline) : block;
                        const content =
                            firstNewline >= 0
                                ? coerceTrimmedString(block.slice(firstNewline).replace(/^---\s*$/gm, ''), '')
                                : '';
                        const hasRole = header.includes('사용자') || header.includes('👤') || header.includes('AI') || header.includes('🤖');
                        if (!hasRole) continue; // 메타 블록 스킵
                        const isUser = header.includes('사용자') || header.includes('👤');
                        simpleMd.push({ role: isUser ? 'user' : 'assistant', content: content || header });
                    }
                    if (simpleMd.length === 0) {
                        showToast('Markdown 파일에서 대화 내용을 찾을 수 없습니다.', 'error');
                        return;
                    }
                    convMessages = simpleMd.map((msg, i) => ({
                        id: `msg-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(),
                        bookmarked: false,
                    }));
                } else {
                    // HTML 파싱 (내보내기 형식 호환)
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    title =
                        coerceTrimmedString(doc.querySelector('h1')?.textContent, '') ||
                        coerceTrimmedString(doc.querySelector('title')?.textContent, '') ||
                        '가져온 대화';
                    const simpleHtml: Array<{ role: 'user' | 'assistant'; content: string }> = [];
                    for (const child of Array.from(doc.body.children)) {
                        if (child.tagName !== 'DIV') continue;
                        const innerDivs = child.querySelectorAll(':scope > div');
                        if (innerDivs.length >= 2) {
                            const roleText = innerDivs[0].textContent || '';
                            const content = coerceTrimmedString(
                                (innerDivs[1].innerHTML || '')
                                    .replace(/<br\s*\/?>/gi, '\n')
                                    .replace(/<[^>]+>/g, '')
                                    .replace(/&nbsp;/g, ' ')
                                    .replace(/&amp;/g, '&')
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .replace(/&quot;/g, '"'),
                                ''
                            );
                            if (!roleText.includes('사용자') && !roleText.includes('AI')) continue;
                            const isUser = roleText.includes('사용자');
                            simpleHtml.push({ role: isUser ? 'user' : 'assistant', content });
                        }
                    }
                    if (simpleHtml.length === 0) {
                        showToast('HTML 파일에서 대화 내용을 찾을 수 없습니다.', 'error');
                        return;
                    }
                    convMessages = simpleHtml.map((msg, i) => ({
                        id: `msg-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(),
                        bookmarked: false,
                    }));
                }

                title = conversationListTitleFromUserMessage(title);

                const newConversation: Conversation = {
                    id: `conv-${Date.now()}`,
                    title,
                    messages: convMessages,
                    projectId: importedConvMeta.projectId ?? currentProject?.id,
                    gensparkAgentId: importedConvMeta.gensparkAgentId,
                    createdAt: importedConvMeta.createdAt ?? new Date(),
                    updatedAt: importedConvMeta.updatedAt ?? new Date(),
                    pinned: importedConvMeta.pinned ?? false,
                };

                setConversations((prev) => {
                    const next = [newConversation, ...prev];
                    saveConversationsToStorage(next);
                    notifyLocalChatConversationsMutated();
                    return next;
                });
                setCurrentConversation(newConversation);

                showToast('대화를 가져왔습니다', 'success');
            } catch (error) {
                errorLogger.error('대화 가져오기 실패', error instanceof Error ? error : new Error(String(error)), {
                    component: 'ChatGPTInterface',
                    action: 'importConversation',
                });
                showToast('대화 파일을 읽는 중 오류가 발생했습니다.', 'error');
            } finally {
                setImportingConversation(false);
            }
        };
        fileInput.click();
    }, [currentProject, saveConversationsToStorage]);

    // 메시지 재생성 (마지막 AI 응답을 다시 생성)
    const regenerateMessage = useCallback(async (messageId: string) => {
        if (!currentConversation || isLoading || isStreaming) return;

        const regenTurn = resolveComposerRegenerateUserTurn(currentConversation.messages, messageId);
        if (!regenTurn) return;

        const userMessage = currentConversation.messages[regenTurn.truncateToIndex];
        const messageIndex = regenTurn.assistantMessageIndex;

        // 해당 어시스턴트 턴 이전까지만 유지 (재생성 대상 답변·이후 제거)
        const messagesBeforeRegeneration = currentConversation.messages.slice(0, messageIndex);

        // 대화 상태 업데이트
        const updatedConversation = {
            ...currentConversation,
            messages: messagesBeforeRegeneration,
            updatedAt: new Date(),
        };
        setCurrentConversation(updatedConversation);
        setConversations(prev => prev.map(c => c.id === currentConversation.id ? updatedConversation : c));

        // 입력창에 원래 질문 설정하고 전송
        setInput(userMessage.content);

        // 약간의 딜레이 후 메시지 전송 (상태 업데이트 후)
        setTimeout(async () => {
            // input이 설정된 후 sendMessage 호출을 위해 직접 API 호출
            const trimmedInput = coerceTrimmedString(userMessage.content, '');
            if (!trimmedInput) return;

            const explicitTitleConciseFromRegenInput = getConciseConversationTitleFromUserInput(trimmedInput);

            setInput('');
            setIsLoading(true);
            setLastOutboundUserTextForStepUi(trimmedInput);

            const shouldStream = useStreaming && isStreamingSupported();
            const conversation = updatedConversation;
            // 재생성 시에도 저장된 대화 목록(conversations) 우선으로 이력 구성 — 대화방 재진입 후 재생성 시 맥락 유지
            const convFromListForRegen = conversations.find((c) => c.id === currentConversation.id);
            const regenHistoryMessages = convFromListForRegen
                ? convFromListForRegen.messages.slice(0, messageIndex)
                : messagesBeforeRegeneration;
            const regenHistoryForCtx = regenHistoryMessages.map((m) =>
                toChatTurnWithPipelineExtras({
                    role: m.role,
                    content: m.content,
                    pipelineExtras: m.pipelineExtras,
                })
            );
            const regenDeepseekConv = convFromListForRegen ?? conversation;
            const regenProjectCtx =
                mergeProjectAndThreadChatContext(buildChatContext(currentProject ?? null), regenDeepseekConv) ?? {};

            let regenConversationFileContent: string | undefined;
            let regenConversationFileName: string | undefined;
            if (attachedConversationFile) {
                try {
                    regenConversationFileContent = await attachedConversationFile.text();
                    regenConversationFileName = attachedConversationFile.name || '대화.txt';
                } catch {
                    showToast('대화 파일을 읽을 수 없습니다.', 'error');
                    setIsLoading(false);
                    return;
                }
                setAttachedConversationFile(null);
            }

            const regenFeatureCtx = buildMergedFeatureContextFromInputAndAttachments({
                trimmedUserInput: trimmedInput,
                conversationFileContent: regenConversationFileContent,
                threadAttachedFileContents: regenProjectCtx.thread_attached_file_contents as string | undefined,
            }) as Record<string, unknown>;
            const regenParsedForPipeline = parseQuestionRequirementSections(trimmedInput);
            const regenPhaseDurationMultiplier = computeAssistantPipelineDurationMultiplier(
                trimmedInput,
                {
                    enable_web_research: !!regenFeatureCtx.enable_web_research,
                    prefer_informed_answer: !!regenFeatureCtx.prefer_informed_answer,
                    multi_request_mode: !!(regenFeatureCtx as { multi_request_mode?: boolean }).multi_request_mode,
                },
                structuredInputAssistEnabled &&
                    shouldTreatAsStructuredQuestionRequirements(regenParsedForPipeline),
                Boolean(coerceTrimmedString(gensparkRouteAgentId ?? '', '')),
            );
            const { pipelineMerge: regenPipelineMerge } = buildComposerPipelineMerge({
                trimmedInput,
                featureCtx: regenFeatureCtx,
                currentProjectId: currentProject?.id,
                gensparkRouteAgentId,
                composerResponseMode,
                responseStyle,
                conversationFileContent: regenConversationFileContent,
                conversationDeepseek: regenDeepseekConv,
                hasConversationThreadContext:
                    conversationHasThreadInstructionsOrFiles(regenDeepseekConv),
            });
            const regenContextWithHistory = {
                ...regenProjectCtx,
                ...regenFeatureCtx,
                ...regenPipelineMerge,
                ...(regenConversationFileContent !== undefined && {
                    conversation_file_content: regenConversationFileContent,
                    conversation_file_name: regenConversationFileName,
                }),
                conversation_history: regenHistoryForCtx,
                ...(regenHistoryForCtx.length > 0 && {
                    consistency_instruction: '이전 대화에서 논의된 용어·가정·결정사항을 유지하여 일관되게 답변하세요. 최근 대화 맥락을 반드시 참고하세요.',
                }),
                available_capabilities: AVAILABLE_CAPABILITIES_HINT,
                adapt_answer_to_request: ADAPT_ANSWER_TO_REQUEST_INSTRUCTION,
            };
            const regenContextForRequest = finalizeComposerContextForGraphChat(
                mergeSelfDevelopLessonsIntoContext(
                    mergeGensparkRouteContextIntoRecordIfMissing(
                        withGraphCreateIntentInChatContext(
                            trimmedInput,
                            regenContextWithHistory as Record<string, unknown>,
                            regenConversationFileContent,
                        ),
                        gensparkRouteAgentId ?? null,
                    ) as Record<string, unknown>,
                    conversation.id,
                ),
            );
            const regenComposerSelfDevelopFlags = buildComposerSelfDevelopContextFlags({
                trimmedInput,
                featureCtx: regenFeatureCtx,
                pipelineMerge: regenPipelineMerge,
                isGraphComposerAnswer: isConversationGraphComposerContext(
                    regenContextForRequest as Record<string, unknown>,
                ),
            });
            const regenSelfDevelopActive = Object.keys(regenComposerSelfDevelopFlags).length > 0;
            const regenContextForRequestWithSd = {
                ...regenContextForRequest,
                ...regenComposerSelfDevelopFlags,
            };
            const regenIsGraphComposerAnswer = isConversationGraphComposerContext(
                regenContextForRequest as Record<string, unknown>,
            );
            const regenUseInformed = !!((regenContextWithHistory as Record<string, unknown>).enable_web_research || (regenContextWithHistory as Record<string, unknown>).prefer_informed_answer);
            const regenPipelineBenchmarkPacing = pipelineBenchmarkPacingFromChatContext({
                gensparkRouteAgentId,
                useInformedOrSearch: regenUseInformed,
                projectId: currentProject?.id,
            });
            const regenAgentRouteSession = Boolean(coerceTrimmedString(gensparkRouteAgentId ?? '', ''));
            const regenEffectiveQuality: 'basic' | 'enhanced' | 'ultimate' =
                regenUseInformed
                    ? (composerQuality === 'basic' ? 'enhanced' : composerQuality === 'enhanced' ? 'ultimate' : composerQuality)
                    : composerQuality;
            const regenRequestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const regenVariationInstruction = getVariationInstruction(regenRequestId, trimmedInput);
            const regenStyleInstruction = buildWritingStyleLearningInstruction(writingStyleProfile);
            const regenRequestMessage = buildStructuredGenerationPrompt(trimmedInput, {
                variationInstruction: regenVariationInstruction,
                styleLearningInstruction: regenStyleInstruction,
            });
            const regenTemperature = getAnswerTemperature();

            const requestRegenRefinedAnswer = async (
                outboundMessage: string,
                contextForBody: Record<string, unknown>,
            ): Promise<string> => {
                const payload = buildChatGptNonStreamPostPayload(
                    outboundMessage,
                    regenEffectiveQuality,
                    contextForBody,
                    buildComposerNonStreamChatExtras({
                        conversationId: conversation.id,
                        requestId: regenRequestId,
                        responseStyle,
                        perspective,
                        diversityLevel: answerDiversityMode,
                        temperature: regenTemperature,
                        projectId: currentProject?.id,
                    }),
                    mergeScenarioAndConversationDeepseek(
                        scenarioInheritMergeOptionsFromPipelineLikeMessages(regenHistoryMessages),
                        regenDeepseekConv,
                    ),
                );
                const response = await postChatAxiosWithFallback(
                    API_BASE_URL,
                    payload,
                    DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                    DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
                );
                const extracted = extractResponseContent(response);
                const display = resolveAssistantAnswerDisplayText(extracted);
                if (
                    !display ||
                    extracted === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
                ) {
                    throw new Error('자가 개선 재생성 응답이 비어 있습니다.');
                }
                return display;
            };

            const regenProjectContext = currentProject
                ? { name: currentProject.name, instructions: typeof currentProject.instructions === 'string' ? currentProject.instructions : undefined }
                : undefined;
            const regenRaw = await buildMessageToSendForChat(regenRequestMessage, trimmedInput, regenProjectContext);
            const regenMessageToSend = typeof regenRaw === 'string' ? regenRaw : regenRaw.messageToSend;

            const regenSequentialFlags = getComposerSequentialSendFlags(
                trimmedInput,
                regenFeatureCtx,
                isStreamingSupported(),
            );
            const regenBuildSequentialItemOutbound = createComposerSequentialItemOutboundBuilder({
                items: regenSequentialFlags.items,
                buildStructuredGenerationPrompt,
                variationInstruction: regenVariationInstruction,
                styleLearningInstruction: regenStyleInstruction,
                buildMessageToSendForChat,
                projectContext: regenProjectContext,
                onBuildError: (index, dlErr) => {
                    errorLogger.error(
                        '순차 다중 요청 프롬프트 보강 실패(재생성)',
                        dlErr instanceof Error ? dlErr : new Error(String(dlErr)),
                        {
                            component: 'ChatGPTInterface',
                            action: 'regenSequentialMultiRequestBuildMessage',
                            itemIndex: index,
                        },
                    );
                },
            });
            const regenUseSequentialStream = regenSequentialFlags.useSequentialStream;

            if (
                shouldStream &&
                !regenSequentialFlags.bypassStreamForSequentialMultiRequest &&
                !regenSequentialFlags.bypassStreamForMultiStepMultiRequest
            ) {
                setIsStreaming(true);
                const abortController = new AbortController();
                abortControllerRef.current = abortController;

                const assistantId = `msg-${Date.now() + 1}`;
                const assistantMessage: Message = {
                    id: assistantId,
                    role: 'assistant',
                    content: '',
                    timestamp: new Date(),
                };
                const step1RegenMessage: Message = {
                    ...assistantMessage,
                    content: ASSISTANT_PLACEHOLDER_ANALYZING,
                };
                let clearRegenStreamPhases: (() => void) | undefined;
                const initialMessages = [...messagesBeforeRegeneration, step1RegenMessage];
                const initialConversation = {
                    ...conversation,
                    messages: initialMessages,
                    updatedAt: new Date(),
                };

                flushSync(() => {
                    setCurrentConversation(initialConversation);
                    setConversations((prev) => prev.map((c) => (c.id === conversation.id ? initialConversation : c)));
                });

                let accumulatedText = '';
                const regenStreamReducedMotion =
                    typeof window !== 'undefined' &&
                    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
                const regenStreamPreRevealActiveRef = { current: true };
                const regenServerDrovePipelinePhaseRef = { current: false };
                let clearRegenClientStreamingPhases: (() => void) | undefined;

                const patchRegenAssistantPipelinePhaseSlug = (slug: AssistantGenerationPhase) => {
                    flushSync(() => {
                        const patchConv = (conv: Conversation): Conversation => ({
                            ...conv,
                            updatedAt: new Date(),
                            messages: conv.messages.map((m) => {
                                if (m.id !== assistantId) return m;
                                const nextExtras = mergePipelineMessageExtras(
                                    { pipelineGenerationPhase: slug },
                                    m.pipelineExtras ?? {},
                                );
                                return { ...m, pipelineExtras: nextExtras };
                            }),
                        });
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            return patchConv(prev);
                        });
                        setConversations((prev) =>
                            prev.map((c) => (c.id === conversation.id ? patchConv(c) : c)),
                        );
                    });
                };

                const flushRegenStreamSlotContent = (content: string) => {
                    const cleaned = cleanResponseText(content);
                    flushSync(() => {
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            return {
                                ...prev,
                                updatedAt: new Date(),
                                messages: prev.messages.map((m) =>
                                    m.id === assistantId ? { ...m, content: cleaned } : m,
                                ),
                            };
                        });
                        setConversations((prev) =>
                            prev.map((c) => {
                                if (c.id !== conversation.id) return c;
                                return {
                                    ...c,
                                    updatedAt: new Date(),
                                    messages: c.messages.map((m) =>
                                        m.id === assistantId ? { ...m, content: cleaned } : m,
                                    ),
                                };
                            }),
                        );
                    });
                };

                clearRegenStreamPhases = scheduleAssistantPreRevealStreamPhases({
                    reducedMotion: regenStreamReducedMotion,
                    durationMultiplier: regenPhaseDurationMultiplier,
                    benchmarkGenspark: regenPipelineBenchmarkPacing,
                    gensparkAgentRouteSession: regenAgentRouteSession,
                    setPlaceholder: (text) => {
                        if (!regenStreamPreRevealActiveRef.current) return;
                        flushSync(() => {
                            setCurrentConversation((prev) => {
                                if (!prev || prev.id !== conversation.id) return prev;
                                const existingMsg = prev.messages.find((m) => m.id === assistantId);
                                if (!existingMsg || !regenStreamPreRevealActiveRef.current) return prev;
                                if (!isAssistantGenerationPlaceholder(existingMsg.content)) return prev;
                                return {
                                    ...prev,
                                    updatedAt: new Date(),
                                    messages: prev.messages.map((m) =>
                                        m.id === assistantId ? { ...m, content: text } : m,
                                    ),
                                };
                            });
                            setConversations((prev) =>
                                prev.map((c) => {
                                    if (c.id !== conversation.id) return c;
                                    return {
                                        ...c,
                                        updatedAt: new Date(),
                                        messages: c.messages.map((m) =>
                                            m.id === assistantId ? { ...m, content: text } : m,
                                        ),
                                    };
                                }),
                            );
                        });
                    },
                    onReveal: () => {
                        regenStreamPreRevealActiveRef.current = false;
                        if (!regenServerDrovePipelinePhaseRef.current) {
                            clearRegenClientStreamingPhases?.();
                            clearRegenClientStreamingPhases = scheduleClientStreamingPipelinePhases({
                                multiplier: regenPhaseDurationMultiplier,
                                benchmarkGenspark: regenPipelineBenchmarkPacing,
                                gensparkAgentRouteSession: regenAgentRouteSession,
                                onPhase: (ph) => patchRegenAssistantPipelinePhaseSlug(ph),
                            });
                        }
                    flushRegenStreamSlotContent(accumulatedText);
                },
            });

                const regenStreamScenarioInherit =
                    scenarioInheritMergeOptionsFromPipelineLikeMessages(regenHistoryMessages)
                        ?.recentMessagesForScenarioInherit;
                const regenStreamMergeDeepseek = mergeScenarioAndConversationDeepseek(
                    undefined,
                    regenDeepseekConv,
                );

                const patchRegenStreamMetadata = (meta: Record<string, unknown>) => {
                    const serverPhase = mapStreamMetadataToAssistantGenerationPhase(meta);
                    if (serverPhase) {
                        regenServerDrovePipelinePhaseRef.current = true;
                        clearRegenClientStreamingPhases?.();
                        clearRegenClientStreamingPhases = undefined;
                    }
                    setCurrentConversation((prev) => {
                        if (!prev || prev.id !== conversation.id) return prev;
                        const existingMsg = prev.messages.find((m) => m.id === assistantId);
                        if (!existingMsg) return prev;
                        const patched = patchAssistantMessageWithStreamMetadata(existingMsg, meta);
                        if (!patched) return prev;
                        return {
                            ...prev,
                            updatedAt: new Date(),
                            messages: prev.messages.map((m) => (m.id === assistantId ? patched : m)),
                        };
                    });
                    setConversations((prev) =>
                        prev.map((c) => {
                            if (c.id !== conversation.id) return c;
                            const existingMsg = c.messages.find((m) => m.id === assistantId);
                            if (!existingMsg) return c;
                            const patched = patchAssistantMessageWithStreamMetadata(existingMsg, meta);
                            if (!patched) return c;
                            return {
                                ...c,
                                updatedAt: new Date(),
                                messages: c.messages.map((m) => (m.id === assistantId ? patched : m)),
                            };
                        }),
                    );
                };

                const patchRegenSelfDevelopStatus = (statusText: string) => {
                    flushSync(() => {
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            return {
                                ...prev,
                                updatedAt: new Date(),
                                messages: prev.messages.map((m) =>
                                    m.id === assistantId ? { ...m, content: statusText } : m,
                                ),
                            };
                        });
                        setConversations((prev) =>
                            prev.map((c) => {
                                if (c.id !== conversation.id) return c;
                                return {
                                    ...c,
                                    updatedAt: new Date(),
                                    messages: c.messages.map((m) =>
                                        m.id === assistantId ? { ...m, content: statusText } : m,
                                    ),
                                };
                            }),
                        );
                    });
                };

                const finalizeRegenStreamResponse = async (
                    fullText: string,
                    metadata?: Record<string, unknown>,
                ) => {
                    clearRegenClientStreamingPhases?.();
                    clearRegenClientStreamingPhases = undefined;
                    clearRegenStreamPhases?.();
                    clearRegenStreamPhases = undefined;
                    regenStreamPreRevealActiveRef.current = false;
                    setIsStreaming(false);
                    setIsLoading(false);
                    abortControllerRef.current = null;
                    if (streamingRafRef.current) {
                        cancelAnimationFrame(streamingRafRef.current);
                        streamingRafRef.current = null;
                    }
                    const cleanedText = cleanResponseText(fullText);
                    const draftText = coerceTrimmedString(cleanedText, '');
                    const sdRegen = await applyComposerSelfDevelopIfEnabled({
                        draft: draftText,
                        userInput: trimmedInput,
                        baseContext: regenContextForRequestWithSd as Record<string, unknown>,
                        sessionId: conversation.id,
                        active: regenSelfDevelopActive && !regenIsGraphComposerAnswer,
                        requestRefined: requestRegenRefinedAnswer,
                        stepPacingMs: regenStreamReducedMotion ? 0 : 140,
                        onStatusText: (text) => patchRegenSelfDevelopStatus(text),
                        onPhase: (ph) =>
                            patchRegenAssistantPipelinePhaseSlug(
                                ph === 'critique' || ph === 'integrate'
                                    ? 'crosscheck'
                                    : ph === 'draft'
                                      ? 'draft'
                                      : 'verify',
                            ),
                        onImproved: () => showToast('답변을 자가 검증·개선했습니다.', 'success'),
                    });
                    const displayText = sdRegen.text;
                    const suggestedFollowUps = parsePipelineFollowUpHints(metadata);
                    const pipelineExtras = mergeAssistantPipelineExtrasForTurn({
                        responseMeta: metadata,
                        requestContext: regenContextForRequestWithSd as Record<string, unknown>,
                        selfDevelopExtras: sdRegen.extras,
                    });
                    const finalMessages = initialMessages.map((m) =>
                        m.id === assistantId
                            ? {
                                  ...m,
                                  content: displayText,
                                  ...(suggestedFollowUps?.length ? { suggestedFollowUps } : {}),
                                  ...(pipelineExtras ? { pipelineExtras } : {}),
                              }
                            : m
                    );
                    const newTitle = await resolveListTitleAfterAssistantReply({
                        conversationTitle: initialConversation.title,
                        shouldUpdateTitle: messageIndex === 0 && finalMessages.length >= 2,
                        explicitTitleConcise: explicitTitleConciseFromRegenInput,
                        trimmedUserMessage: trimmedInput,
                        assistantDisplayText: displayText,
                        generateTitle: generateConversationTitle,
                    });
                    const finalConversation = {
                        ...initialConversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                        title: newTitle,
                    };
                    setCurrentConversation(finalConversation);
                    setConversations((prev) => {
                        const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                        saveConversationsToStorage(next);
                        return next;
                    });
                    notebookLLMDeepLearningIntegration.analyzeResponseWithDL(trimmedInput, displayText).catch(() => {});
                };

                const handleRegenStreamError = (error: Error) => {
                    clearRegenClientStreamingPhases?.();
                    clearRegenClientStreamingPhases = undefined;
                    clearRegenStreamPhases?.();
                    clearRegenStreamPhases = undefined;
                    regenStreamPreRevealActiveRef.current = false;
                    setIsStreaming(false);
                    setIsLoading(false);
                    abortControllerRef.current = null;
                    if (streamingRafRef.current) {
                        cancelAnimationFrame(streamingRafRef.current);
                        streamingRafRef.current = null;
                    }
                    const errorContent = getErrorMessage(error);
                    const finalMessages = initialMessages.map((m) =>
                        m.id === assistantId
                            ? { ...m, content: `❌ **재생성 오류**\n\n${errorContent}` }
                            : m
                    );
                    const finalConversation = {
                        ...initialConversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                    };
                    setCurrentConversation(finalConversation);
                    setConversations(prev => prev.map(c => c.id === conversation.id ? finalConversation : c));
                };

                try {
                if (regenUseSequentialStream) {
                    regenStreamPreRevealActiveRef.current = false;
                    clearRegenStreamPhases?.();
                    clearRegenStreamPhases = undefined;
                    try {
                        await runComposerSequentialMultiRequestStream({
                            items: regenSequentialFlags.items,
                            conversationId: conversation.id,
                            signal: abortController.signal,
                            buildItemOutboundMessage: regenBuildSequentialItemOutbound,
                            buildItemStreamContext: (i) =>
                                buildSequentialMultiRequestItemContext(
                                    regenContextForRequestWithSd as Record<string, unknown>,
                                    regenSequentialFlags.items,
                                    i,
                                ),
                            buildStreamRequestBody: (ctx) =>
                                buildComposerStreamChatRequestBody({
                                    quality: regenEffectiveQuality,
                                    conversationId: conversation.id,
                                    context: ctx,
                                    requestId: regenRequestId,
                                    responseStyle,
                                    perspective,
                                    diversityLevel: answerDiversityMode,
                                    temperature: regenTemperature,
                                    projectId: currentProject?.id,
                                }),
                            streamMessage: streamChatMessage,
                            onLiveIndex: setComposerMultiRequestLiveIndex,
                            onDisplayContent: flushRegenStreamSlotContent,
                            streamOptionsBase: {
                                messagesForScenarioInherit: regenStreamScenarioInherit,
                                mergeApiChatContextOptions: regenStreamMergeDeepseek,
                            },
                            onStreamMetadata: patchRegenStreamMetadata,
                            onStreamComplete: finalizeRegenStreamResponse,
                        });
                    } catch (seqErr) {
                        handleRegenStreamError(
                            seqErr instanceof Error ? seqErr : new Error(String(seqErr)),
                        );
                    } finally {
                        setComposerMultiRequestLiveIndex(null);
                    }
                } else {
                await streamChatMessage(regenMessageToSend, conversation.id, {
                    signal: abortController.signal,
                    messagesForScenarioInherit: regenStreamScenarioInherit,
                    mergeApiChatContextOptions: regenStreamMergeDeepseek,
                    requestBody: buildComposerStreamChatRequestBody({
                        quality: regenEffectiveQuality,
                        conversationId: conversation.id,
                        context: regenContextForRequestWithSd,
                        requestId: regenRequestId,
                        responseStyle,
                        perspective,
                        diversityLevel: answerDiversityMode,
                        temperature: regenTemperature,
                        projectId: currentProject?.id,
                    }),
                    onChunk: (chunk: string) => {
                        accumulatedText += chunk;
                        if (regenStreamPreRevealActiveRef.current) {
                            return;
                        }
                        const trimmedAcc = coerceTrimmedString(cleanResponseText(accumulatedText), '');
                        if (!trimmedAcc.length) {
                            return;
                        }
                        if (streamingRafRef.current) {
                            cancelAnimationFrame(streamingRafRef.current);
                        }
                        streamingRafRef.current = requestAnimationFrame(() => {
                            const cleanedChunk = cleanResponseText(accumulatedText);
                            setCurrentConversation((prev) => {
                                if (!prev || prev.id !== conversation.id) return prev;
                                const existingMsg = prev.messages.find((m) => m.id === assistantId);
                                if (!existingMsg) return prev;
                                return {
                                    ...prev,
                                    updatedAt: new Date(),
                                    messages: prev.messages.map((m) =>
                                        m.id === assistantId ? { ...m, content: cleanedChunk } : m
                                    ),
                                };
                            });
                        });
                    },
                    onMetadata: patchRegenStreamMetadata,
                    onComplete: finalizeRegenStreamResponse,
                    onError: handleRegenStreamError,
                });
                }
                } catch {
                    // streamChatMessage는 실패 시 onError 호출 후 reject — 재생성 UI·로딩은 onError에서 처리
                }
            } else {
                // 비스트리밍 모드 (CHAT_POST_PATH → CHAT_POST_PATH_UNIFIED 폴백) — 일반 전송과 동일 단계 UI
                const regenPlaceholderAssistantId = `msg-${Date.now() + 1}`;
                const regenPlaceholderAssistant: Message = {
                    id: regenPlaceholderAssistantId,
                    role: 'assistant',
                    content: ASSISTANT_PLACEHOLDER_ANALYZING,
                    timestamp: new Date(),
                };
                const regenPlaceholderMessages: Message[] = [...messagesBeforeRegeneration, regenPlaceholderAssistant];
                const regenPlaceholderConversation: Conversation = {
                    ...conversation,
                    messages: regenPlaceholderMessages,
                    updatedAt: new Date(),
                };
                flushSync(() => {
                    setCurrentConversation(regenPlaceholderConversation);
                    setConversations((prev) =>
                        prev.map((c) => (c.id === conversation.id ? regenPlaceholderConversation : c))
                    );
                });
                const updateRegenGenerationStep = (step: string) => {
                    const updatedStepMessages = regenPlaceholderMessages.map((m) =>
                        m.id === regenPlaceholderAssistantId ? { ...m, content: step } : m
                    );
                    const updatedStepConversation: Conversation = {
                        ...regenPlaceholderConversation,
                        messages: updatedStepMessages,
                        updatedAt: new Date(),
                    };
                    flushSync(() => {
                        setCurrentConversation(updatedStepConversation);
                        setConversations((prev) =>
                            prev.map((c) => (c.id === conversation.id ? updatedStepConversation : c))
                        );
                    });
                };
                const regenNonStreamTimeline = startAssistantNonStreamLoadingTimeline(
                    updateRegenGenerationStep,
                    {
                        durationMultiplier: regenPhaseDurationMultiplier,
                        benchmarkGenspark: regenPipelineBenchmarkPacing,
                        gensparkAgentRouteSession: regenAgentRouteSession,
                    },
                );
                let clearRegenNonStreamPhases = regenNonStreamTimeline.cancel;

                const postRegenNonStreamPayload = (
                    outboundMessage: string,
                    contextForBody: Record<string, unknown>,
                ) =>
                    postChatAxiosWithFallback(
                        API_BASE_URL,
                        buildChatGptNonStreamPostPayload(
                            outboundMessage,
                            regenEffectiveQuality,
                            contextForBody,
                            buildComposerNonStreamChatExtras({
                                conversationId: conversation.id,
                                requestId: regenRequestId,
                                responseStyle,
                                perspective,
                                diversityLevel: answerDiversityMode,
                                temperature: regenTemperature,
                                projectId: currentProject?.id,
                            }),
                            mergeScenarioAndConversationDeepseek(
                                scenarioInheritMergeOptionsFromPipelineLikeMessages(regenHistoryMessages),
                                regenDeepseekConv,
                            ),
                        ),
                        DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                        DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
                    );

                const assertRegenValidChatResponse = (
                    response: Awaited<ReturnType<typeof postChatAxiosWithFallback>>,
                ): string => {
                    const content = extractResponseContent(response);
                    if (
                        !content ||
                        !coerceTrimmedString(content, '') ||
                        content === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
                    ) {
                        throw new Error('백엔드에서 유효한 응답을 받지 못했습니다.');
                    }
                    return content;
                };

                void (async () => {
                    let responseContent: string;
                    try {
                        if (regenSequentialFlags.runSequentialMultiRequest) {
                            const seq = await runComposerSequentialMultiRequestNonStream({
                                items: regenSequentialFlags.items,
                                buildItemOutboundMessage: regenBuildSequentialItemOutbound,
                                buildItemContext: (i) =>
                                    buildSequentialMultiRequestItemContext(
                                        regenContextForRequestWithSd as Record<string, unknown>,
                                        regenSequentialFlags.items,
                                        i,
                                    ),
                                postChat: postRegenNonStreamPayload,
                                extractValidContent: assertRegenValidChatResponse,
                                onLiveIndex: setComposerMultiRequestLiveIndex,
                                onPartialProgress: updateRegenGenerationStep,
                            });
                            responseContent = seq.merged;
                        } else if (regenSequentialFlags.runMultiStepMultiRequest) {
                            const multiStep = await runComposerMultiStepMultiRequest({
                                items: regenSequentialFlags.items,
                                buildItemContext: (i) =>
                                    buildSequentialMultiRequestItemContext(
                                        regenContextForRequestWithSd as Record<string, unknown>,
                                        regenSequentialFlags.items,
                                        i,
                                    ),
                                onLiveIndex: setComposerMultiRequestLiveIndex,
                                onPartialProgress: updateRegenGenerationStep,
                            });
                            responseContent = multiStep.merged;
                        } else {
                            const response = await postRegenNonStreamPayload(
                                regenMessageToSend,
                                regenContextForRequestWithSd as Record<string, unknown>,
                            );
                            responseContent = assertRegenValidChatResponse(response);
                        }
                    } catch (err) {
                        regenNonStreamTimeline.cancel();
                        clearRegenNonStreamPhases = () => {};
                        throw err;
                    } finally {
                        setComposerMultiRequestLiveIndex(null);
                    }
                    if (
                        !responseContent ||
                        !coerceTrimmedString(responseContent, '') ||
                        responseContent === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
                    ) {
                        regenNonStreamTimeline.cancel();
                        clearRegenNonStreamPhases = () => {};
                        throw new Error('백엔드에서 유효한 응답을 받지 못했습니다.');
                    }
                    await regenNonStreamTimeline.promise;
                    clearRegenNonStreamPhases();
                    clearRegenNonStreamPhases = () => {};
                    await runAssistantNonStreamPostResponsePhases(
                        (text) => updateRegenGenerationStep(text),
                        {
                            durationMultiplier: regenPhaseDurationMultiplier,
                            benchmarkGenspark: regenPipelineBenchmarkPacing,
                            gensparkAgentRouteSession: regenAgentRouteSession,
                        },
                    );
                    const sdRegenNs = await applyComposerSelfDevelopIfEnabled({
                        draft: responseContent,
                        userInput: trimmedInput,
                        baseContext: regenContextForRequestWithSd as Record<string, unknown>,
                        sessionId: conversation.id,
                        active: regenSelfDevelopActive && !regenIsGraphComposerAnswer,
                        requestRefined: requestRegenRefinedAnswer,
                        stepPacingMs: 140,
                        onStatusText: (text) => updateRegenGenerationStep(text),
                        onPhase: (ph) =>
                            updateRegenGenerationStep(
                                ph === 'critique' || ph === 'integrate'
                                    ? ASSISTANT_PLACEHOLDER_CROSSCHECK
                                    : ph === 'draft'
                                      ? ASSISTANT_PLACEHOLDER_DRAFT
                                      : ASSISTANT_PLACEHOLDER_VERIFY,
                            ),
                        onImproved: () => showToast('답변을 자가 검증·개선했습니다.', 'success'),
                    });
                    const regenDisplayContent = sdRegenNs.text;
                    const regenPipelineExtras = mergeAssistantPipelineExtrasForTurn({
                        requestContext: regenContextForRequestWithSd as Record<string, unknown>,
                        selfDevelopExtras: sdRegenNs.extras,
                    });
                    notebookLLMDeepLearningIntegration
                        .analyzeResponseWithDL(trimmedInput, regenDisplayContent)
                        .catch(() => {});
                    const finalMessages = regenPlaceholderMessages.map((m) =>
                        m.id === regenPlaceholderAssistantId
                            ? {
                                  ...m,
                                  content: regenDisplayContent,
                                  ...(regenPipelineExtras ? { pipelineExtras: regenPipelineExtras } : {}),
                              }
                            : m
                    );
                    const newTitle = await resolveListTitleAfterAssistantReply({
                        conversationTitle: conversation.title,
                        shouldUpdateTitle: messageIndex === 0 && finalMessages.length >= 2,
                        explicitTitleConcise: explicitTitleConciseFromRegenInput,
                        trimmedUserMessage: trimmedInput,
                        assistantDisplayText: regenDisplayContent,
                        generateTitle: generateConversationTitle,
                    });
                    const finalConversation = {
                        ...conversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                        title: newTitle,
                    };
                    setCurrentConversation(finalConversation);
                    setConversations((prev) => {
                        const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                        saveConversationsToStorage(next);
                        return next;
                    });
                })().catch(error => {
                    clearRegenNonStreamPhases();
                    clearRegenNonStreamPhases = () => {};
                    const errorContent = getErrorMessage(error);
                    const finalMessages = regenPlaceholderMessages.map((m) =>
                        m.id === regenPlaceholderAssistantId
                            ? { ...m, content: `❌ **재생성 오류**\n\n${errorContent}` }
                            : m
                    );
                    const finalConversation = {
                        ...conversation,
                        messages: finalMessages,
                        updatedAt: new Date(),
                    };
                    setCurrentConversation(finalConversation);
                    setConversations(prev => prev.map(c => c.id === conversation.id ? finalConversation : c));
                }).finally(() => {
                    clearRegenNonStreamPhases();
                    clearRegenNonStreamPhases = () => {};
                    setIsLoading(false);
                });
            }
        }, 50);
    }, [
        answerDiversityMode,
        buildStructuredGenerationPrompt,
        buildWritingStyleLearningInstruction,
        composerQuality,
        composerResponseMode,
        conversations,
        currentConversation,
        isLoading,
        isStreaming,
        useStreaming,
        currentProject,
        gensparkRouteAgentId,
        getErrorMessage,
        getAnswerTemperature,
        getVariationInstruction,
        perspective,
        responseStyle,
        saveConversationsToStorage,
        writingStyleProfile,
        generateConversationTitle,
        structuredInputAssistEnabled,
        attachedConversationFile,
        withGraphCreateIntentInChatContext,
    ]);

    // 메시지 편집 시작
    const startEditingMessage = useCallback((messageId: string, content: string) => {
        if (isLoading || isStreaming) return;
        setEditingMessageId(messageId);
        setEditingContent(content);
    }, [isLoading, isStreaming]);

    // 메시지 편집 취소
    const cancelEditingMessage = useCallback(() => {
        setEditingMessageId(null);
        setEditingContent('');
    }, []);

    // 메시지 편집 저장 및 재전송
    const saveEditedMessage = useCallback(async (messageId: string) => {
        if (!currentConversation || isLoading || isStreaming) return;

        const trimmedContent = coerceTrimmedString(editingContent, '');
        if (!trimmedContent) {
            cancelEditingMessage();
            return;
        }

        // 편집한 메시지의 인덱스 찾기
        const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) {
            cancelEditingMessage();
            return;
        }

        const targetMessage = currentConversation.messages[messageIndex];
        if (targetMessage.role !== 'user') {
            cancelEditingMessage();
            return;
        }

        // 편집한 메시지까지만 유지 (이후 메시지 제거)
        const messagesUntilEdited = currentConversation.messages.slice(0, messageIndex);
        const editedUserMessage: Message = {
            ...targetMessage,
            content: trimmedContent,
            timestamp: new Date(),
        };

        const updatedConversation = {
            ...currentConversation,
            messages: [...messagesUntilEdited, editedUserMessage],
            updatedAt: new Date(),
        };

        setCurrentConversation(updatedConversation);
        setConversations(prev => prev.map(c => c.id === currentConversation.id ? updatedConversation : c));
        cancelEditingMessage();

        const explicitTitleConciseFromEditedInput = getConciseConversationTitleFromUserInput(trimmedContent);

        // 새 응답 생성
        setIsLoading(true);
        setLastOutboundUserTextForStepUi(trimmedContent);
        const conversation = updatedConversation;
        const editThreadForDeepseek = conversations.find((c) => c.id === conversation.id) ?? conversation;
        const editCtxMerged =
            mergeProjectAndThreadChatContext(buildChatContext(currentProject ?? null), updatedConversation) ?? {};

        let editConversationFileContent: string | undefined;
        let editConversationFileName: string | undefined;
        if (attachedConversationFile) {
            try {
                editConversationFileContent = await attachedConversationFile.text();
                editConversationFileName = attachedConversationFile.name || '대화.txt';
            } catch {
                showToast('대화 파일을 읽을 수 없습니다.', 'error');
                setIsLoading(false);
                return;
            }
            setAttachedConversationFile(null);
        }

        const editFeatureCtx = buildMergedFeatureContextFromInputAndAttachments({
            trimmedUserInput: trimmedContent,
            conversationFileContent: editConversationFileContent,
            threadAttachedFileContents: editCtxMerged.thread_attached_file_contents as string | undefined,
        }) as Record<string, unknown>;
        const editParsedForPipeline = parseQuestionRequirementSections(trimmedContent);
        const editPhaseDurationMultiplier = computeAssistantPipelineDurationMultiplier(
            trimmedContent,
            {
                enable_web_research: !!editFeatureCtx.enable_web_research,
                prefer_informed_answer: !!editFeatureCtx.prefer_informed_answer,
                multi_request_mode: !!(editFeatureCtx as { multi_request_mode?: boolean }).multi_request_mode,
            },
            structuredInputAssistEnabled &&
                shouldTreatAsStructuredQuestionRequirements(editParsedForPipeline),
            Boolean(coerceTrimmedString(gensparkRouteAgentId ?? '', '')),
        );
        const editPipelineBenchmarkPacing = pipelineBenchmarkPacingFromChatContext({
            gensparkRouteAgentId,
            useInformedOrSearch: !!(editFeatureCtx.enable_web_research || editFeatureCtx.prefer_informed_answer),
            projectId: currentProject?.id,
        });
        const editAgentRouteSession = Boolean(coerceTrimmedString(gensparkRouteAgentId ?? '', ''));

        const editSequentialFlags = getComposerSequentialSendFlags(
            trimmedContent,
            editFeatureCtx,
            isStreamingSupported(),
        );
        const editUseSequentialStream = editSequentialFlags.useSequentialStream;
        const shouldStream =
            useStreaming &&
            isStreamingSupported() &&
            !editSequentialFlags.bypassStreamForSequentialMultiRequest &&
            !editSequentialFlags.bypassStreamForMultiStepMultiRequest;

        if (shouldStream) {
            setIsStreaming(true);
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            const editRequestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const editVariationInstruction = getVariationInstruction(editRequestId, trimmedContent);
            const editStyleInstruction = buildWritingStyleLearningInstruction(writingStyleProfile);
            const editRequestMessage = buildStructuredGenerationPrompt(trimmedContent, {
                variationInstruction: editVariationInstruction,
                styleLearningInstruction: editStyleInstruction,
            });
            const editTemperature = getAnswerTemperature();

            const editProjectContext = currentProject
                ? { name: currentProject.name, instructions: typeof currentProject.instructions === 'string' ? currentProject.instructions : undefined }
                : undefined;
            const editRaw = await buildMessageToSendForChat(editRequestMessage, trimmedContent, editProjectContext);
            const editMessageToSend = typeof editRaw === 'string' ? editRaw : editRaw.messageToSend;

            const editBuildSequentialItemOutbound = createComposerSequentialItemOutboundBuilder({
                items: editSequentialFlags.items,
                buildStructuredGenerationPrompt,
                variationInstruction: editVariationInstruction,
                styleLearningInstruction: editStyleInstruction,
                buildMessageToSendForChat,
                projectContext: editProjectContext,
                onBuildError: (index, dlErr) => {
                    errorLogger.error(
                        '순차 다중 요청 프롬프트 보강 실패(편집)',
                        dlErr instanceof Error ? dlErr : new Error(String(dlErr)),
                        {
                            component: 'ChatGPTInterface',
                            action: 'editSequentialMultiRequestBuildMessage',
                            itemIndex: index,
                        },
                    );
                },
            });

            const assistantId = `msg-${Date.now() + 1}`;
            const assistantMessage: Message = {
                id: assistantId,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
            };
            const step1EditMessage: Message = {
                ...assistantMessage,
                content: ASSISTANT_PLACEHOLDER_ANALYZING,
            };
            let clearEditStreamPhases: (() => void) | undefined;
            const initialMessages = [...updatedConversation.messages, step1EditMessage];
            const initialConversation = {
                ...conversation,
                messages: initialMessages,
                updatedAt: new Date(),
            };

            flushSync(() => {
                setCurrentConversation(initialConversation);
                setConversations((prev) => prev.map((c) => (c.id === conversation.id ? initialConversation : c)));
            });

            let accumulatedText = '';
            const editStreamReducedMotion =
                typeof window !== 'undefined' &&
                window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
            const editStreamPreRevealActiveRef = { current: true };
            const editServerDrovePipelinePhaseRef = { current: false };
            let clearEditClientStreamingPhases: (() => void) | undefined;

            const patchEditAssistantPipelinePhaseSlug = (slug: AssistantGenerationPhase) => {
                flushSync(() => {
                    const patchConv = (conv: Conversation): Conversation => ({
                        ...conv,
                        updatedAt: new Date(),
                        messages: conv.messages.map((m) => {
                            if (m.id !== assistantId) return m;
                            const nextExtras = mergePipelineMessageExtras(
                                { pipelineGenerationPhase: slug },
                                m.pipelineExtras ?? {},
                            );
                            return { ...m, pipelineExtras: nextExtras };
                        }),
                    });
                    setCurrentConversation((prev) => {
                        if (!prev || prev.id !== conversation.id) return prev;
                        return patchConv(prev);
                    });
                    setConversations((prev) =>
                        prev.map((c) => (c.id === conversation.id ? patchConv(c) : c)),
                    );
                });
            };

            const flushEditStreamSlotContent = (content: string) => {
                const cleaned = cleanResponseText(content);
                flushSync(() => {
                    setCurrentConversation((prev) => {
                        if (!prev || prev.id !== conversation.id) return prev;
                        return {
                            ...prev,
                            updatedAt: new Date(),
                            messages: prev.messages.map((m) =>
                                m.id === assistantId ? { ...m, content: cleaned } : m,
                            ),
                        };
                    });
                    setConversations((prev) =>
                        prev.map((c) => {
                            if (c.id !== conversation.id) return c;
                            return {
                                ...c,
                                updatedAt: new Date(),
                                messages: c.messages.map((m) =>
                                    m.id === assistantId ? { ...m, content: cleaned } : m,
                                ),
                            };
                        }),
                    );
                });
            };

            clearEditStreamPhases = scheduleAssistantPreRevealStreamPhases({
                reducedMotion: editStreamReducedMotion,
                durationMultiplier: editPhaseDurationMultiplier,
                benchmarkGenspark: editPipelineBenchmarkPacing,
                gensparkAgentRouteSession: editAgentRouteSession,
                setPlaceholder: (text) => {
                    if (!editStreamPreRevealActiveRef.current) return;
                    flushSync(() => {
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            const existingMsg = prev.messages.find((m) => m.id === assistantId);
                            if (!existingMsg || !editStreamPreRevealActiveRef.current) return prev;
                            if (!isAssistantGenerationPlaceholder(existingMsg.content)) return prev;
                            return {
                                ...prev,
                                updatedAt: new Date(),
                                messages: prev.messages.map((m) =>
                                    m.id === assistantId ? { ...m, content: text } : m,
                                ),
                            };
                        });
                        setConversations((prev) =>
                            prev.map((c) => {
                                if (c.id !== conversation.id) return c;
                                return {
                                    ...c,
                                    updatedAt: new Date(),
                                    messages: c.messages.map((m) =>
                                        m.id === assistantId ? { ...m, content: text } : m,
                                    ),
                                };
                            }),
                        );
                    });
                },
                onReveal: () => {
                    editStreamPreRevealActiveRef.current = false;
                    if (!editServerDrovePipelinePhaseRef.current) {
                        clearEditClientStreamingPhases?.();
                        clearEditClientStreamingPhases = scheduleClientStreamingPipelinePhases({
                            multiplier: editPhaseDurationMultiplier,
                            benchmarkGenspark: editPipelineBenchmarkPacing,
                            gensparkAgentRouteSession: editAgentRouteSession,
                            onPhase: (ph) => patchEditAssistantPipelinePhaseSlug(ph),
                        });
                    }
                    flushEditStreamSlotContent(accumulatedText);
                },
            });

            // 대화 히스토리 구성 (전체 턴 — 일반 전송과 동일)
            const conversationHistory = updatedConversation.messages.map((m) =>
                toChatTurnWithPipelineExtras({
                    role: m.role,
                    content: m.content,
                    pipelineExtras: m.pipelineExtras,
                })
            );
            const editStreamUseInformed = !!(editFeatureCtx.enable_web_research || editFeatureCtx.prefer_informed_answer);
            const editStreamEffectiveQuality: 'basic' | 'enhanced' | 'ultimate' =
                editStreamUseInformed
                    ? (composerQuality === 'basic' ? 'enhanced' : composerQuality === 'enhanced' ? 'ultimate' : composerQuality)
                    : composerQuality;

            const { pipelineMerge: editStreamPipelineMerge } = buildComposerPipelineMerge({
                trimmedInput: trimmedContent,
                featureCtx: editFeatureCtx,
                currentProjectId: currentProject?.id,
                gensparkRouteAgentId,
                composerResponseMode,
                responseStyle,
                conversationFileContent: editConversationFileContent,
                conversationDeepseek: editThreadForDeepseek,
                hasConversationThreadContext:
                    conversationHasThreadInstructionsOrFiles(updatedConversation),
            });
            const editStreamContextBase = withGraphCreateIntentInChatContext(
                trimmedContent,
                {
                    ...mergeProjectAndThreadChatContext(
                        buildChatContext(currentProject ?? null, { conversation_history: conversationHistory }),
                        updatedConversation,
                    ),
                    ...editFeatureCtx,
                    ...editStreamPipelineMerge,
                    ...(editConversationFileContent !== undefined && {
                        conversation_file_content: editConversationFileContent,
                        conversation_file_name: editConversationFileName,
                    }),
                    ...(conversationHistory.length > 0 && {
                        consistency_instruction:
                            '이전 대화에서 논의된 용어·가정·결정사항을 유지하여 일관되게 답변하세요. 최근 대화 맥락을 반드시 참고하세요.',
                    }),
                    adapt_answer_to_request: ADAPT_ANSWER_TO_REQUEST_INSTRUCTION,
                },
                editConversationFileContent,
            );
            const editStreamContext = finalizeComposerContextForGraphChat(
                mergeSelfDevelopLessonsIntoContext(
                    mergeGensparkRouteContextIntoRecordIfMissing(
                        editStreamContextBase,
                        gensparkRouteAgentId ?? null,
                    ) as Record<string, unknown>,
                    conversation.id,
                ),
            );
            const editStreamComposerSelfDevelopFlags = buildComposerSelfDevelopContextFlags({
                trimmedInput: trimmedContent,
                featureCtx: editFeatureCtx,
                pipelineMerge: editStreamPipelineMerge,
                isGraphComposerAnswer: isConversationGraphComposerContext(
                    editStreamContext as Record<string, unknown>,
                ),
            });
            const editStreamSelfDevelopActive = Object.keys(editStreamComposerSelfDevelopFlags).length > 0;
            const editStreamContextForRequest = {
                ...editStreamContext,
                ...editStreamComposerSelfDevelopFlags,
            };
            const editStreamIsGraphComposerAnswer = isConversationGraphComposerContext(
                editStreamContext as Record<string, unknown>,
            );
            const requestEditRefinedAnswer = async (
                outboundMessage: string,
                contextForBody: Record<string, unknown>,
            ): Promise<string> => {
                const payload = buildChatGptNonStreamPostPayload(
                    outboundMessage,
                    editStreamEffectiveQuality,
                    contextForBody,
                    buildComposerNonStreamChatExtras({
                        conversationId: conversation.id,
                        requestId: editRequestId,
                        responseStyle,
                        perspective,
                        diversityLevel: answerDiversityMode,
                        temperature: editTemperature,
                        projectId: currentProject?.id,
                    }),
                    mergeScenarioAndConversationDeepseek(
                        scenarioInheritMergeOptionsFromPipelineLikeMessages(updatedConversation.messages),
                        editThreadForDeepseek,
                    ),
                );
                const response = await postChatAxiosWithFallback(
                    API_BASE_URL,
                    payload,
                    DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                    DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
                );
                const extracted = extractResponseContent(response);
                const display = resolveAssistantAnswerDisplayText(extracted);
                if (
                    !display ||
                    extracted === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
                ) {
                    throw new Error('자가 개선 재생성 응답이 비어 있습니다.');
                }
                return display;
            };
            const editStreamScenarioInherit =
                scenarioInheritMergeOptionsFromPipelineLikeMessages(updatedConversation.messages)
                    ?.recentMessagesForScenarioInherit;
            const editStreamMergeDeepseek = mergeScenarioAndConversationDeepseek(
                undefined,
                editThreadForDeepseek,
            );

            const patchEditStreamMetadata = (meta: Record<string, unknown>) => {
                const serverPhase = mapStreamMetadataToAssistantGenerationPhase(meta);
                if (serverPhase) {
                    editServerDrovePipelinePhaseRef.current = true;
                    clearEditClientStreamingPhases?.();
                    clearEditClientStreamingPhases = undefined;
                }
                setCurrentConversation((prev) => {
                    if (!prev || prev.id !== conversation.id) return prev;
                    const existingMsg = prev.messages.find((m) => m.id === assistantId);
                    if (!existingMsg) return prev;
                    const patched = patchAssistantMessageWithStreamMetadata(existingMsg, meta);
                    if (!patched) return prev;
                    return {
                        ...prev,
                        updatedAt: new Date(),
                        messages: prev.messages.map((m) => (m.id === assistantId ? patched : m)),
                    };
                });
                setConversations((prev) =>
                    prev.map((c) => {
                        if (c.id !== conversation.id) return c;
                        const existingMsg = c.messages.find((m) => m.id === assistantId);
                        if (!existingMsg) return c;
                        const patched = patchAssistantMessageWithStreamMetadata(existingMsg, meta);
                        if (!patched) return c;
                        return {
                            ...c,
                            updatedAt: new Date(),
                            messages: c.messages.map((m) => (m.id === assistantId ? patched : m)),
                        };
                    }),
                );
            };

            const patchEditSelfDevelopStatus = (statusText: string) => {
                flushSync(() => {
                    setCurrentConversation((prev) => {
                        if (!prev || prev.id !== conversation.id) return prev;
                        return {
                            ...prev,
                            updatedAt: new Date(),
                            messages: prev.messages.map((m) =>
                                m.id === assistantId ? { ...m, content: statusText } : m,
                            ),
                        };
                    });
                    setConversations((prev) =>
                        prev.map((c) => {
                            if (c.id !== conversation.id) return c;
                            return {
                                ...c,
                                updatedAt: new Date(),
                                messages: c.messages.map((m) =>
                                    m.id === assistantId ? { ...m, content: statusText } : m,
                                ),
                            };
                        }),
                    );
                });
            };

            const finalizeEditStreamResponse = async (
                fullText: string,
                metadata?: Record<string, unknown>,
            ) => {
                clearEditClientStreamingPhases?.();
                clearEditClientStreamingPhases = undefined;
                clearEditStreamPhases?.();
                clearEditStreamPhases = undefined;
                editStreamPreRevealActiveRef.current = false;
                setIsStreaming(false);
                setIsLoading(false);
                abortControllerRef.current = null;
                if (streamingRafRef.current) {
                    cancelAnimationFrame(streamingRafRef.current);
                    streamingRafRef.current = null;
                }
                const cleanedText = cleanResponseText(fullText);
                const draftText = coerceTrimmedString(cleanedText, '');
                const sdEdit = await applyComposerSelfDevelopIfEnabled({
                    draft: draftText,
                    userInput: trimmedContent,
                    baseContext: editStreamContextForRequest as Record<string, unknown>,
                    sessionId: conversation.id,
                    active: editStreamSelfDevelopActive && !editStreamIsGraphComposerAnswer,
                    requestRefined: requestEditRefinedAnswer,
                    stepPacingMs: editStreamReducedMotion ? 0 : 140,
                    onStatusText: (text) => patchEditSelfDevelopStatus(text),
                    onPhase: (ph) =>
                        patchEditAssistantPipelinePhaseSlug(
                            ph === 'critique' || ph === 'integrate'
                                ? 'crosscheck'
                                : ph === 'draft'
                                  ? 'draft'
                                  : 'verify',
                        ),
                    onImproved: () => showToast('답변을 자가 검증·개선했습니다.', 'success'),
                });
                const displayText = sdEdit.text;
                const suggestedFollowUps = parsePipelineFollowUpHints(metadata);
                const pipelineExtras = mergeAssistantPipelineExtrasForTurn({
                    responseMeta: metadata,
                    requestContext: editStreamContextForRequest as Record<string, unknown>,
                    selfDevelopExtras: sdEdit.extras,
                });
                notebookLLMDeepLearningIntegration.analyzeResponseWithDL(trimmedContent, displayText).catch(() => {});
                recordAdvancedMemoryTurn(conversation.id, trimmedContent, displayText);
                const finalMessages = initialMessages.map((m) =>
                    m.id === assistantId
                        ? {
                              ...m,
                              content: displayText,
                              ...(suggestedFollowUps?.length ? { suggestedFollowUps } : {}),
                              ...(pipelineExtras ? { pipelineExtras } : {}),
                          }
                        : m
                );
                const newTitle = await resolveListTitleAfterAssistantReply({
                    conversationTitle: initialConversation.title,
                    shouldUpdateTitle: messageIndex === 0 && finalMessages.length >= 2,
                    explicitTitleConcise: explicitTitleConciseFromEditedInput,
                    trimmedUserMessage: trimmedContent,
                    assistantDisplayText: displayText,
                    generateTitle: generateConversationTitle,
                });
                const finalConversation = {
                    ...initialConversation,
                    messages: finalMessages,
                    updatedAt: new Date(),
                    title: newTitle,
                };
                setCurrentConversation(finalConversation);
                setConversations((prev) => {
                    const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                    saveConversationsToStorage(next);
                    return next;
                });
            };

            const handleEditStreamError = (error: Error) => {
                clearEditClientStreamingPhases?.();
                clearEditClientStreamingPhases = undefined;
                clearEditStreamPhases?.();
                clearEditStreamPhases = undefined;
                editStreamPreRevealActiveRef.current = false;
                setIsStreaming(false);
                setIsLoading(false);
                abortControllerRef.current = null;
                if (streamingRafRef.current) {
                    cancelAnimationFrame(streamingRafRef.current);
                    streamingRafRef.current = null;
                }
                const errorContent = getErrorMessage(error);
                const finalMessages = initialMessages.map((m) =>
                    m.id === assistantId
                        ? { ...m, content: `❌ **오류 발생**\n\n${errorContent}` }
                        : m
                );
                const finalConversation = {
                    ...initialConversation,
                    messages: finalMessages,
                    updatedAt: new Date(),
                };
                setCurrentConversation(finalConversation);
                setConversations((prev) =>
                    prev.map((c) => (c.id === conversation.id ? finalConversation : c)),
                );
            };

            try {
            if (editUseSequentialStream) {
                editStreamPreRevealActiveRef.current = false;
                clearEditStreamPhases?.();
                clearEditStreamPhases = undefined;
                try {
                    await runComposerSequentialMultiRequestStream({
                        items: editSequentialFlags.items,
                        conversationId: conversation.id,
                        signal: abortController.signal,
                        buildItemOutboundMessage: editBuildSequentialItemOutbound,
                        buildItemStreamContext: (i) =>
                            buildSequentialMultiRequestItemContext(
                                editStreamContextForRequest as Record<string, unknown>,
                                editSequentialFlags.items,
                                i,
                            ),
                        buildStreamRequestBody: (ctx) =>
                            buildComposerStreamChatRequestBody({
                                quality: editStreamEffectiveQuality,
                                conversationId: conversation.id,
                                context: ctx,
                                requestId: editRequestId,
                                responseStyle,
                                perspective,
                                diversityLevel: answerDiversityMode,
                                temperature: editTemperature,
                                projectId: currentProject?.id,
                                handleMultipleQuestions: true,
                            }),
                        streamMessage: streamChatMessage,
                        onLiveIndex: setComposerMultiRequestLiveIndex,
                        onDisplayContent: flushEditStreamSlotContent,
                        streamOptionsBase: {
                            messagesForScenarioInherit: editStreamScenarioInherit,
                            mergeApiChatContextOptions: editStreamMergeDeepseek,
                        },
                        onStreamMetadata: patchEditStreamMetadata,
                        onStreamComplete: finalizeEditStreamResponse,
                    });
                } catch (seqErr) {
                    handleEditStreamError(
                        seqErr instanceof Error ? seqErr : new Error(String(seqErr)),
                    );
                } finally {
                    setComposerMultiRequestLiveIndex(null);
                }
            } else {
            await streamChatMessage(editMessageToSend, conversation.id, {
                signal: abortController.signal,
                messagesForScenarioInherit: editStreamScenarioInherit,
                mergeApiChatContextOptions: editStreamMergeDeepseek,
                requestBody: buildComposerStreamChatRequestBody({
                    quality: editStreamEffectiveQuality,
                    conversationId: conversation.id,
                    context: editStreamContextForRequest,
                    requestId: editRequestId,
                    responseStyle,
                    perspective,
                    diversityLevel: answerDiversityMode,
                    temperature: editTemperature,
                    projectId: currentProject?.id,
                    handleMultipleQuestions: true,
                }),
                onChunk: (chunk: string) => {
                    accumulatedText += chunk;
                    if (editStreamPreRevealActiveRef.current) {
                        return;
                    }
                    const trimmedAcc = coerceTrimmedString(cleanResponseText(accumulatedText), '');
                    if (!trimmedAcc.length) {
                        return;
                    }
                    if (streamingRafRef.current) {
                        cancelAnimationFrame(streamingRafRef.current);
                    }
                    streamingRafRef.current = requestAnimationFrame(() => {
                        const cleanedChunk = cleanResponseText(accumulatedText);
                        setCurrentConversation((prev) => {
                            if (!prev || prev.id !== conversation.id) return prev;
                            const existingMsg = prev.messages.find((m) => m.id === assistantId);
                            if (!existingMsg) return prev;
                            return {
                                ...prev,
                                updatedAt: new Date(),
                                messages: prev.messages.map((m) =>
                                    m.id === assistantId ? { ...m, content: cleanedChunk } : m
                                ),
                            };
                        });
                    });
                },
                onMetadata: patchEditStreamMetadata,
                onComplete: finalizeEditStreamResponse,
                onError: handleEditStreamError,
            });
            }
            } catch {
                // streamChatMessage는 실패 시 onError 호출 후 reject — 편집 UI·로딩은 onError에서 처리
            }
        } else {
            // 비스트리밍 모드 (편집 후 재전송 - 대화 이력 포함)
            const editHistoryForCtx = updatedConversation.messages.map((m) =>
                toChatTurnWithPipelineExtras({
                    role: m.role,
                    content: m.content,
                    pipelineExtras: m.pipelineExtras,
                })
            );
            const { pipelineMerge: editNsPipelineMerge } = buildComposerPipelineMerge({
                trimmedInput: trimmedContent,
                featureCtx: editFeatureCtx,
                currentProjectId: currentProject?.id,
                gensparkRouteAgentId,
                composerResponseMode,
                responseStyle,
                conversationFileContent: editConversationFileContent,
                conversationDeepseek: editThreadForDeepseek,
                hasConversationThreadContext:
                    conversationHasThreadInstructionsOrFiles(updatedConversation),
            });
            const editContextWithHistory = {
                ...editCtxMerged,
                ...editFeatureCtx,
                ...editNsPipelineMerge,
                ...(editConversationFileContent !== undefined && {
                    conversation_file_content: editConversationFileContent,
                    conversation_file_name: editConversationFileName,
                }),
                conversation_history: editHistoryForCtx,
                ...(editHistoryForCtx.length > 0 && {
                    consistency_instruction: '이전 대화에서 논의된 용어·가정·결정사항을 유지하여 일관되게 답변하세요. 최근 대화 맥락을 반드시 참고하세요.',
                }),
                available_capabilities: AVAILABLE_CAPABILITIES_HINT,
                adapt_answer_to_request: ADAPT_ANSWER_TO_REQUEST_INSTRUCTION,
            };
            const editContextForRequest = finalizeComposerContextForGraphChat(
                mergeSelfDevelopLessonsIntoContext(
                    mergeGensparkRouteContextIntoRecordIfMissing(
                        withGraphCreateIntentInChatContext(
                            trimmedContent,
                            editContextWithHistory as Record<string, unknown>,
                            editConversationFileContent,
                        ),
                        gensparkRouteAgentId ?? null,
                    ) as Record<string, unknown>,
                    conversation.id,
                ),
            );
            const editNsComposerSelfDevelopFlags = buildComposerSelfDevelopContextFlags({
                trimmedInput: trimmedContent,
                featureCtx: editFeatureCtx,
                pipelineMerge: editNsPipelineMerge,
                isGraphComposerAnswer: isConversationGraphComposerContext(
                    editContextForRequest as Record<string, unknown>,
                ),
            });
            const editNsSelfDevelopActive = Object.keys(editNsComposerSelfDevelopFlags).length > 0;
            const editContextForRequestWithSd = {
                ...editContextForRequest,
                ...editNsComposerSelfDevelopFlags,
            };
            const editNsIsGraphComposerAnswer = isConversationGraphComposerContext(
                editContextForRequest as Record<string, unknown>,
            );
            const editUseInformed = !!((editContextWithHistory as Record<string, unknown>).enable_web_research || (editContextWithHistory as Record<string, unknown>).prefer_informed_answer);
            const editEffectiveQuality: 'basic' | 'enhanced' | 'ultimate' =
                editUseInformed
                    ? (composerQuality === 'basic' ? 'enhanced' : composerQuality === 'enhanced' ? 'ultimate' : composerQuality)
                    : composerQuality;
            const editRequestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const editVariationInstruction = getVariationInstruction(editRequestId, trimmedContent);
            const editStyleInstruction = buildWritingStyleLearningInstruction(writingStyleProfile);
            const editRequestMessage = buildStructuredGenerationPrompt(trimmedContent, {
                variationInstruction: editVariationInstruction,
                styleLearningInstruction: editStyleInstruction,
            });
            const editTemperature = getAnswerTemperature();

            const requestEditNsRefinedAnswer = async (
                outboundMessage: string,
                contextForBody: Record<string, unknown>,
            ): Promise<string> => {
                const payload = buildChatGptNonStreamPostPayload(
                    outboundMessage,
                    editEffectiveQuality,
                    contextForBody,
                    buildComposerNonStreamChatExtras({
                        conversationId: conversation.id,
                        requestId: editRequestId,
                        responseStyle,
                        perspective,
                        diversityLevel: answerDiversityMode,
                        temperature: editTemperature,
                        projectId: currentProject?.id,
                    }),
                    mergeScenarioAndConversationDeepseek(
                        scenarioInheritMergeOptionsFromPipelineLikeMessages(updatedConversation.messages),
                        editThreadForDeepseek,
                    ),
                );
                const response = await postChatAxiosWithFallback(
                    API_BASE_URL,
                    payload,
                    DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                    DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
                );
                const extracted = extractResponseContent(response);
                const display = resolveAssistantAnswerDisplayText(extracted);
                if (
                    !display ||
                    extracted === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
                ) {
                    throw new Error('자가 개선 재생성 응답이 비어 있습니다.');
                }
                return display;
            };

            const editProjectCtx = currentProject
                ? { name: currentProject.name, instructions: typeof currentProject.instructions === 'string' ? currentProject.instructions : undefined }
                : undefined;
            const editRawNonStream = await buildMessageToSendForChat(editRequestMessage, trimmedContent, editProjectCtx);
            const editMessageToSend = typeof editRawNonStream === 'string' ? editRawNonStream : editRawNonStream.messageToSend;

            const editNsPlaceholderId = `msg-${Date.now() + 1}`;
            const editNsPlaceholder: Message = {
                id: editNsPlaceholderId,
                role: 'assistant',
                content: ASSISTANT_PLACEHOLDER_ANALYZING,
                timestamp: new Date(),
            };
            const editNsPlaceholderMessages: Message[] = [...updatedConversation.messages, editNsPlaceholder];
            const editNsPlaceholderConv: Conversation = {
                ...conversation,
                messages: editNsPlaceholderMessages,
                updatedAt: new Date(),
            };
            flushSync(() => {
                setCurrentConversation(editNsPlaceholderConv);
                setConversations((prev) => prev.map((c) => (c.id === conversation.id ? editNsPlaceholderConv : c)));
            });
            const updateEditNonStreamStep = (step: string) => {
                const msgs = editNsPlaceholderMessages.map((m) =>
                    m.id === editNsPlaceholderId ? { ...m, content: step } : m
                );
                const conv: Conversation = {
                    ...editNsPlaceholderConv,
                    messages: msgs,
                    updatedAt: new Date(),
                };
                flushSync(() => {
                    setCurrentConversation(conv);
                    setConversations((prev) => prev.map((c) => (c.id === conversation.id ? conv : c)));
                });
            };
            const editNonStreamTimeline = startAssistantNonStreamLoadingTimeline(updateEditNonStreamStep, {
                durationMultiplier: editPhaseDurationMultiplier,
                benchmarkGenspark: editPipelineBenchmarkPacing,
                gensparkAgentRouteSession: editAgentRouteSession,
            });
            let clearEditNonStreamPhases = editNonStreamTimeline.cancel;

            const editBuildSequentialItemOutbound = createComposerSequentialItemOutboundBuilder({
                items: editSequentialFlags.items,
                buildStructuredGenerationPrompt,
                variationInstruction: editVariationInstruction,
                styleLearningInstruction: editStyleInstruction,
                buildMessageToSendForChat,
                projectContext: editProjectCtx,
                onBuildError: (index, dlErr) => {
                    errorLogger.error(
                        '순차 다중 요청 프롬프트 보강 실패(편집)',
                        dlErr instanceof Error ? dlErr : new Error(String(dlErr)),
                        {
                            component: 'ChatGPTInterface',
                            action: 'editSequentialMultiRequestBuildMessage',
                            itemIndex: index,
                        },
                    );
                },
            });

            const postEditNonStreamPayload = (
                outboundMessage: string,
                contextForBody: Record<string, unknown>,
            ) =>
                postChatAxiosWithFallback(
                    API_BASE_URL,
                    buildChatGptNonStreamPostPayload(
                        outboundMessage,
                        editEffectiveQuality,
                        contextForBody,
                        buildComposerNonStreamChatExtras({
                            conversationId: conversation.id,
                            requestId: editRequestId,
                            responseStyle,
                            perspective,
                            diversityLevel: answerDiversityMode,
                            temperature: editTemperature,
                            projectId: currentProject?.id,
                        }),
                        mergeScenarioAndConversationDeepseek(
                            scenarioInheritMergeOptionsFromPipelineLikeMessages(
                                updatedConversation.messages,
                            ),
                            editThreadForDeepseek,
                        ),
                    ),
                    DEFAULT_CHAT_POST_AXIOS_OPTIONS,
                    DEFAULT_CHAT_POST_FALLBACK_OPTIONS,
                );

            const assertEditValidChatResponse = (
                response: Awaited<ReturnType<typeof postChatAxiosWithFallback>>,
            ): string => {
                const content = extractResponseContent(response);
                if (
                    !content ||
                    !coerceTrimmedString(content, '') ||
                    content === '응답을 생성할 수 없습니다. 다시 시도해 주세요.'
                ) {
                    throw new Error('백엔드에서 유효한 응답을 받지 못했습니다.');
                }
                return content;
            };

            void (async () => {
                let responseContent: string;
                try {
                    if (editSequentialFlags.runSequentialMultiRequest) {
                        const seq = await runComposerSequentialMultiRequestNonStream({
                            items: editSequentialFlags.items,
                            buildItemOutboundMessage: editBuildSequentialItemOutbound,
                            buildItemContext: (i) =>
                                buildSequentialMultiRequestItemContext(
                                    editContextForRequestWithSd as Record<string, unknown>,
                                    editSequentialFlags.items,
                                    i,
                                ),
                            postChat: postEditNonStreamPayload,
                            extractValidContent: assertEditValidChatResponse,
                            onLiveIndex: setComposerMultiRequestLiveIndex,
                            onPartialProgress: updateEditNonStreamStep,
                        });
                        responseContent = seq.merged;
                    } else if (editSequentialFlags.runMultiStepMultiRequest) {
                        const multiStep = await runComposerMultiStepMultiRequest({
                            items: editSequentialFlags.items,
                            buildItemContext: (i) =>
                                buildSequentialMultiRequestItemContext(
                                    editContextForRequestWithSd as Record<string, unknown>,
                                    editSequentialFlags.items,
                                    i,
                                ),
                            onLiveIndex: setComposerMultiRequestLiveIndex,
                            onPartialProgress: updateEditNonStreamStep,
                        });
                        responseContent = multiStep.merged;
                    } else {
                        const response = await postEditNonStreamPayload(
                            editMessageToSend,
                            editContextForRequestWithSd as Record<string, unknown>,
                        );
                        responseContent = assertEditValidChatResponse(response);
                    }
                } catch (err) {
                    editNonStreamTimeline.cancel();
                    clearEditNonStreamPhases = () => {};
                    throw err;
                } finally {
                    setComposerMultiRequestLiveIndex(null);
                }
                await editNonStreamTimeline.promise;
                clearEditNonStreamPhases();
                clearEditNonStreamPhases = () => {};
                await runAssistantNonStreamPostResponsePhases((text) => updateEditNonStreamStep(text), {
                    durationMultiplier: editPhaseDurationMultiplier,
                    benchmarkGenspark: editPipelineBenchmarkPacing,
                    gensparkAgentRouteSession: editAgentRouteSession,
                });
                const sdEditNs = await applyComposerSelfDevelopIfEnabled({
                    draft: responseContent,
                    userInput: trimmedContent,
                    baseContext: editContextForRequestWithSd as Record<string, unknown>,
                    sessionId: conversation.id,
                    active: editNsSelfDevelopActive && !editNsIsGraphComposerAnswer,
                    requestRefined: requestEditNsRefinedAnswer,
                    stepPacingMs: 140,
                    onStatusText: (text) => updateEditNonStreamStep(text),
                    onPhase: (ph) =>
                        updateEditNonStreamStep(
                            ph === 'critique' || ph === 'integrate'
                                ? ASSISTANT_PLACEHOLDER_CROSSCHECK
                                : ph === 'draft'
                                  ? ASSISTANT_PLACEHOLDER_DRAFT
                                  : ASSISTANT_PLACEHOLDER_VERIFY,
                        ),
                    onImproved: () => showToast('답변을 자가 검증·개선했습니다.', 'success'),
                });
                const editDisplayContent = sdEditNs.text;
                const editPipelineExtras = mergeAssistantPipelineExtrasForTurn({
                    requestContext: editContextForRequestWithSd as Record<string, unknown>,
                    selfDevelopExtras: sdEditNs.extras,
                });
                notebookLLMDeepLearningIntegration
                    .analyzeResponseWithDL(trimmedContent, editDisplayContent)
                    .catch(() => {});
                recordAdvancedMemoryTurn(conversation.id, trimmedContent, editDisplayContent);
                const finalMessages = editNsPlaceholderMessages.map((m) =>
                    m.id === editNsPlaceholderId
                        ? {
                              ...m,
                              content: editDisplayContent,
                              ...(editPipelineExtras ? { pipelineExtras: editPipelineExtras } : {}),
                          }
                        : m
                );
                const newTitle = await resolveListTitleAfterAssistantReply({
                    conversationTitle: conversation.title,
                    shouldUpdateTitle: messageIndex === 0 && finalMessages.length >= 2,
                    explicitTitleConcise: explicitTitleConciseFromEditedInput,
                    trimmedUserMessage: trimmedContent,
                    assistantDisplayText: editDisplayContent,
                    generateTitle: generateConversationTitle,
                });
                const finalConversation = {
                    ...conversation,
                    messages: finalMessages,
                    updatedAt: new Date(),
                    title: newTitle,
                };
                setCurrentConversation(finalConversation);
                setConversations((prev) => {
                    const next = prev.map((c) => (c.id === conversation.id ? finalConversation : c));
                    saveConversationsToStorage(next);
                    return next;
                });
            })().catch(error => {
                clearEditNonStreamPhases();
                clearEditNonStreamPhases = () => {};
                const errorContent = getErrorMessage(error);
                const finalMessages = editNsPlaceholderMessages.map((m) =>
                    m.id === editNsPlaceholderId
                        ? { ...m, content: `❌ **오류 발생**\n\n${errorContent}` }
                        : m
                );
                const finalConversation = {
                    ...conversation,
                    messages: finalMessages,
                    updatedAt: new Date(),
                };
                setCurrentConversation(finalConversation);
                setConversations(prev => prev.map(c => c.id === conversation.id ? finalConversation : c));
            }).finally(() => {
                clearEditNonStreamPhases();
                clearEditNonStreamPhases = () => {};
                setIsLoading(false);
            });
        }
    }, [
        answerDiversityMode,
        buildStructuredGenerationPrompt,
        buildWritingStyleLearningInstruction,
        composerQuality,
        composerResponseMode,
        conversations,
        currentConversation,
        editingContent,
        isLoading,
        isStreaming,
        useStreaming,
        currentProject,
        gensparkRouteAgentId,
        getAnswerTemperature,
        getErrorMessage,
        getVariationInstruction,
        saveConversationsToStorage,
        cancelEditingMessage,
        responseStyle,
        perspective,
        writingStyleProfile,
        generateConversationTitle,
        structuredInputAssistEnabled,
        attachedConversationFile,
        withGraphCreateIntentInChatContext,
    ]);

    // 대화 검색 필터링 — 일반 대화·프로젝트 소속 대화 통합 리스트
    // 프로젝트가 선택된 경우 해당 프로젝트의 대화만 표시, 기본 페이지(/)에서는 일반 대화만 표시
    const filteredConversations = useMemo(() => {
        let filtered = conversations;

        // 프로젝트가 선택된 경우: 해당 프로젝트의 대화만 필터링
        // 기본 페이지(/)에서는 일반 대화(projectId·에이전트 id 없음)만 필터링
        // /agents?id=… 에서는 해당 에이전트에 묶인 대화만
        if (currentProject && !isDefaultPage) {
            filtered = filtered.filter(conv => conv.projectId === currentProject.id);
        } else if (gensparkRouteAgentId) {
            filtered = filtered.filter(
                (conv) => !conv.projectId && conv.gensparkAgentId === gensparkRouteAgentId
            );
        } else if (isDefaultPage) {
            filtered = filtered.filter((conv) => !conv.projectId && !conv.gensparkAgentId);
        }

        const query = coerceTrimmedString(sidebarUnifiedSearch || searchQuery, '').toLowerCase();
        if (query) {
            filtered = filtered.filter(
                (conv) =>
                    coerceTrimmedString(conv.title ?? '', '').toLowerCase().includes(query) ||
                    conv.messages.some((msg) =>
                        coerceTrimmedString(msg.content ?? '', '').toLowerCase().includes(query)
                    )
            );
        }

        // 고정된 대화를 상단에, 그 다음 정렬 옵션에 따라 정렬
        return [...filtered].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;

            switch (sortOption) {
                case 'name':
                    return coerceTrimmedString(a.title ?? '', '').localeCompare(
                        coerceTrimmedString(b.title ?? '', ''),
                        'ko'
                    );
                case 'messages':
                    return b.messages.length - a.messages.length;
                case 'recent':
                default:
                    return (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0);
            }
        });
    }, [
        conversations,
        sidebarUnifiedSearch,
        searchQuery,
        sortOption,
        currentProject,
        isDefaultPage,
        gensparkRouteAgentId,
    ]);

    // 대화 리스트 섹션: 프로젝트에 속하지 않은 대화 / 프로젝트 / 프로젝트 내 대화
    const _conversationsBySection = useMemo(() => {
        const noProject: Conversation[] = [];
        const byProjectId: Record<string, Conversation[]> = {};
        filteredConversations.forEach((conv) => {
            if (!conv.projectId) {
                noProject.push(conv);
            } else {
                if (!byProjectId[conv.projectId]) byProjectId[conv.projectId] = [];
                byProjectId[conv.projectId].push(conv);
            }
        });
        const projectSections = projects
            .filter((p) => (byProjectId[p.id]?.length ?? 0) > 0)
            .map((p) => ({ project: p, conversations: byProjectId[p.id] ?? [] }));
        return { noProject, projectSections };
    }, [filteredConversations, projects]);

    // 전역 키보드 단축키
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // 모달이 열려 있거나 편집 중이면 무시 (Escape는 별도 처리)
            const modalOpen = showProjectModal || showProjectEditModal || showAddSourceModal || showGoogleDriveImportModal || showProModal || editingMessageId || deleteConfirmConversation ||
                deleteConfirmProject || deleteConfirmMessageId || showClearMessagesConfirm || showShareModal || showShortcutsHelp || showStructuredPreview ||
                importingConversation;
            if (modalOpen && e.key !== 'Escape') return;

            const isInputFocused = document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA';

            // Ctrl/Cmd + N: 새 대화
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                startNewConversation();
                return;
            }

            // Ctrl/Cmd + /: 사이드바 토글
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                setSidebarOpen(prev => !prev);
                return;
            }

            // Ctrl/Cmd + E: 대화 내보내기
            if ((e.ctrlKey || e.metaKey) && e.key === 'e' && currentConversation) {
                e.preventDefault();
                exportConversation('markdown');
                return;
            }

            // Ctrl/Cmd + Shift + D: 대화 복제
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D' && currentConversation && currentConversation.messages.length > 0) {
                e.preventDefault();
                duplicateConversation(currentConversation);
                return;
            }

            // Ctrl/Cmd + Shift + I: 대화 가져오기 (가져오는 중에는 무시)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I' && !importingConversation) {
                e.preventDefault();
                importConversation();
                return;
            }

            // Ctrl/Cmd + F: 대화 내 검색
            if ((e.ctrlKey || e.metaKey) && e.key === 'f' && currentConversation) {
                e.preventDefault();
                setShowMessageSearch(prev => !prev);
                return;
            }

            // Escape: 단축키·검색 닫기 → (다른 모달·편집 중이면 스트리밍 취소 등으로 가로채지 않음)
            if (e.key === 'Escape') {
                if (showShortcutsHelp) {
                    setShowShortcutsHelp(false);
                    return;
                }
                if (showMessageSearch) {
                    setShowMessageSearch(false);
                    setMessageSearchQuery('');
                    setMessageSearchIndex(0);
                    return;
                }
                if (
                    showProjectModal ||
                    showProjectEditModal ||
                    showAddSourceModal ||
                    showGoogleDriveImportModal ||
                    showProModal ||
                    editingMessageId ||
                    deleteConfirmConversation ||
                    deleteConfirmProject ||
                    deleteConfirmMessageId ||
                    showClearMessagesConfirm ||
                    showShareModal ||
                    showStructuredPreview ||
                    importingConversation
                ) {
                    return;
                }
                if (isStreaming) {
                    e.preventDefault();
                    cancelStreaming();
                    return;
                }
            }

            // / 또는 Ctrl/Cmd + L: 입력창 포커스 (입력 중이 아닐 때)
            if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'l')) && !isInputFocused) {
                e.preventDefault();
                inputRef.current?.focus();
                return;
            }

            // ? 또는 ⌘?: 키보드 단축키 도움말 (입력 포커스 여부 무관)
            if ((e.key === '?' && !isInputFocused) || ((e.ctrlKey || e.metaKey) && e.key === '?')) {
                e.preventDefault();
                setShowShortcutsHelp(prev => !prev);
                return;
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [showProjectModal, showProjectEditModal, showAddSourceModal, showGoogleDriveImportModal, showProModal, editingMessageId, isStreaming, currentConversation, startNewConversation, exportConversation, duplicateConversation, importConversation, cancelStreaming, showMessageSearch, showShortcutsHelp, importingConversation, deleteConfirmConversation, deleteConfirmProject, deleteConfirmMessageId, showClearMessagesConfirm, showShareModal, showStructuredPreview]);

    // 단축키 도움말 모달 포커스 관리
    useEffect(() => {
        if (showShortcutsHelp) {
            prevFocusRef.current = document.activeElement as HTMLElement | null;
            const t = setTimeout(() => {
                try {
                    shortcutsCloseRef.current?.focus();
                } catch {
                    /* jsdom·언마운트 타이밍 */
                }
            }, 50);
            return () => clearTimeout(t);
        } else if (prevFocusRef.current) {
            try {
                prevFocusRef.current.focus();
            } catch {
                /* 이전 포커스 노드가 이미 제거된 경우 */
            }
            prevFocusRef.current = null;
        }
    }, [showShortcutsHelp]);

    // 문서 제목 동적 업데이트
    // 프로젝트 상세(/projects/:id)에서는 탭에 프로젝트명만 사용 — 엔터로 스레드 제목이 잡히며 탭이 대화 제목처럼 바뀌는 혼동 방지
    const inProjectDetailContext =
        Boolean(initialProjectId && currentProject?.id === initialProjectId);
    useEffect(() => {
        const brand = navigationConfig.title;
        if (viewMode === 'notebook' && currentProject) {
            document.title = `${currentProject.name} - ${brand}`;
        } else if (inProjectDetailContext && currentProject) {
            document.title = `${currentProject.name} - ${brand}`;
        } else if (gensparkRouteAgentId && gensparkAgentSessionMeta) {
            document.title = `${gensparkAgentSessionMeta.form.displayName} · 에이전트 - ${brand}`;
        } else if (viewMode === 'chat' && currentConversation?.title) {
            document.title = `${currentConversation.title} - ${brand}`;
        } else {
            document.title = brand;
        }
        return () => {
            document.title = brand;
        };
    }, [
        viewMode,
        currentProject,
        currentConversation,
        inProjectDetailContext,
        gensparkRouteAgentId,
        gensparkAgentSessionMeta,
    ]);

    // 입력창 자동 높이 조절
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [input]);

    const projectSourcesPanelSection = currentProject && (
        <section className="project-sources-panel" aria-label="소스 목록">
            <div className="project-sources-panel-header">
                <h3 className="project-sources-panel-title">소스</h3>
                <div className="project-sources-panel-controls" aria-label="소스 정렬 및 필터">
                    <select
                        value={sourceSortOrder}
                        onChange={(e) => setSourceSortOrder(e.target.value as 'recent' | 'oldest')}
                        className="project-sources-sort-select"
                        aria-label="정렬"
                    >
                        <option value="recent">최신순</option>
                        <option value="oldest">이전순</option>
                    </select>
                    <select
                        value={sourceFilter}
                        onChange={() => {}}
                        className="project-sources-filter-select"
                        aria-label="필터"
                    >
                        <option value="all">모두</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddSourceModal(true)}
                    className="bw-btn-primary project-sources-add-btn"
                    aria-label="소스 추가"
                    data-testid={TEST_IDS.PROJECT_SOURCES_ADD_BTN}
                    disabled={sourceFilesUploading}
                >
                    + 소스 추가
                </button>
            </div>
            {sourceFilesUploading && (
                <p
                    className="project-sources-uploading"
                    role="status"
                    data-testid={TEST_IDS.PROJECT_SOURCES_UPLOADING}
                >
                    소스를 처리하는 중…
                </p>
            )}
            <p className="project-sources-hint">
                CORBU.AI에 더 많은 컨텍스트 정보를 주기 — 소스를 업로드하고, 드라이브를 링크하고, Slack 등의 앱을 연결해서 프로젝트에 대한 더 많은 컨텍스트 정보를 CORBU.AI에 제공해 주세요.
            </p>
            <ul className="project-sources-list" data-testid={TEST_IDS.PROJECT_SOURCES_LIST}>
                {(() => {
                    const files = (currentProject.files ?? []).slice();
                    const webSources = (currentProject.webSources ?? []).slice();
                    if (sourceSortOrder === 'oldest') {
                        files.reverse();
                        webSources.reverse();
                    }
                    return (
                        <>
                            {files.map((f, fileIdx) => {
                                const fileId = (f as ProjectFile).id ?? `file-${fileIdx}-${f.name}`;
                                return (
                                <li
                                    key={`file-${fileIdx}-${f.name}`}
                                    className="project-sources-item"
                                    data-testid={TEST_IDS.PROJECT_SOURCES_FILE_ITEM}
                                    data-source-name={f.name}
                                >
                                    <span className="project-sources-item-icon" aria-hidden>
                                        <IconFile size={14} />
                                    </span>
                                    <span className="project-sources-item-name" title={f.name}>
                                        {f.name}
                                    </span>
                                    <span className="project-sources-item-meta">문서</span>
                                    <button
                                        type="button"
                                        className="project-sources-item-remove"
                                        aria-label={`${f.name} 제거`}
                                        data-testid={TEST_IDS.PROJECT_SOURCES_FILE_REMOVE}
                                        data-file-id={fileId}
                                        disabled={sourceFilesUploading}
                                        onClick={() => void handleRemoveSourceFile(fileId)}
                                    >
                                        <IconTrash size={14} aria-hidden />
                                    </button>
                                </li>
                                );
                            })}
                            {webSources.map((s, srcIdx) => {
                                const sourceId = s.id ?? `web-${srcIdx}-${s.url}`;
                                return (
                                <li
                                    key={sourceId}
                                    className="project-sources-item"
                                    data-testid={TEST_IDS.PROJECT_SOURCES_WEB_ITEM}
                                    data-source-url={s.url}
                                >
                                    <span className="project-sources-item-icon" aria-hidden>
                                        <IconShare size={14} />
                                    </span>
                                    <span className="project-sources-item-name" title={s.title || s.url || undefined}>
                                        {s.title || s.url}
                                    </span>
                                    <span className="project-sources-item-meta">
                                        {s.type === 'video' ? '영상' : '웹'}
                                    </span>
                                    <button
                                        type="button"
                                        className="project-sources-item-remove"
                                        aria-label={`${s.title || s.url} 제거`}
                                        data-testid={TEST_IDS.PROJECT_SOURCES_WEB_REMOVE}
                                        data-source-id={sourceId}
                                        disabled={sourceFilesUploading}
                                        onClick={() => void handleRemoveWebSource(sourceId)}
                                    >
                                        <IconTrash size={14} aria-hidden />
                                    </button>
                                </li>
                                );
                            })}
                        </>
                    );
                })()}
            </ul>
            {(currentProject.files ?? []).length === 0 && (currentProject.webSources ?? []).length === 0 && (
                <div className="project-sources-empty-wrap">
                    <p className="project-sources-empty">아직 등록된 소스가 없습니다. 아래 &quot;추가하기&quot; 또는 상단 &quot;소스 추가&quot;에서 파일·웹 소스를 추가하세요.</p>
                    <button
                        type="button"
                        onClick={() => setShowAddSourceModal(true)}
                        className="bw-btn-primary project-sources-empty-cta"
                        aria-label="소스 추가하기"
                        data-testid={TEST_IDS.PROJECT_SOURCES_EMPTY_CTA}
                        disabled={sourceFilesUploading}
                    >
                        추가하기
                    </button>
                </div>
            )}
        </section>
    );

    const composerFieldPlaceholder =
        gensparkRouteAgentId && gensparkAgentSessionMeta
            ? `${gensparkAgentSessionMeta.form.displayName}에게 메시지 보내기…`
            : currentProject
              ? currentConversation && currentConversation.messages.length > 0
                  ? `${currentProject.name} — 메시지를 입력하세요…`
                  : `${currentProject.name} — ${WORKSPACE_COMPOSER_PLACEHOLDER}`
              : currentConversation && currentConversation.messages.length > 0
                ? '메시지를 입력하세요…'
                : WORKSPACE_CHAT_EMPTY_THREAD_PLACEHOLDER;

    const chatSendPrimaryAction =
        isStreaming ? (
            <button
                type="button"
                className="wq-composer__chat-cta"
                style={{ background: '#ef4444', borderColor: '#dc2626' }}
                onClick={cancelStreaming}
                aria-label="스트리밍 중지"
                title="생성 중지 (Esc)"
            >
                중지
            </button>
        ) : (
            <button
                type="submit"
                className="wq-composer__chat-cta"
                disabled={!canSend}
                aria-label={input.trim() ? '메시지 전송' : '전송'}
                aria-disabled={!canSend}
                title={!isOnline ? '오프라인 상태입니다' : '메시지 전송 (Enter)'}
                data-testid={TEST_IDS.SEND_BUTTON}
            >
                {isLoading ? (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="loading-spinner" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="12.566" strokeDashoffset="12.566"><animate attributeName="stroke-dashoffset" values="12.566;0" dur="1s" repeatCount="indefinite" /></circle></svg>
                ) : (
                    <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="2" y="8" width="3" height="8" rx="1"/><rect x="8" y="4" width="3" height="16" rx="1"/><rect x="14" y="6" width="3" height="12" rx="1"/><rect x="20" y="9" width="3" height="6" rx="1"/></svg>
                        대화
                    </>
                )}
            </button>
        );

    const chatWorkspaceComposer = (
        <WorkspaceQueryComposer
            ref={composerAttachRef}
            value={input}
            onChange={setInput}
            onCommit={handleWqCommit}
            formAriaLabel="메시지 전송"
            textareaRef={inputRef as React.RefObject<HTMLTextAreaElement>}
            textareaTestId={TEST_IDS.CHAT_INPUT}
            placeholder={composerFieldPlaceholder}
            onConversationTextFileAttach={attachConversationTextFile}
            responseMode={composerResponseMode}
            onResponseModeChange={setComposerResponseMode}
            showStructureChips
            onPendingAttachmentsChange={setComposerPendingAttachCount}
            statusFooter={
                composerInputPipelinePhase ? (
                    <div data-testid={TEST_IDS.COMPOSER_GENSPARK_GENERATION_STATUS}>
                        <GensparkGenerationStatus
                            variant="step"
                            phase={composerInputPipelinePhase}
                            webSearch={composerGensparkStepUi.webSearch}
                            documentContext={composerGensparkStepUi.documentContext}
                            stepCaption={composerGenerationCaption ?? undefined}
                            embedded
                        />
                        {composerMultiRequestProgress ? (
                            <ComposerMultiRequestChecklist progress={composerMultiRequestProgress} />
                        ) : null}
                        {inputFooterGenerationHint ? (
                            <p className="wq-composer__pipeline-hint" role="status" aria-live="polite">
                                {inputFooterGenerationHint}
                            </p>
                        ) : null}
                    </div>
                ) : composerIdleInputHint ? (
                    <p
                        className="wq-composer__pipeline-hint"
                        role="status"
                        data-testid={TEST_IDS.CHAT_COMPOSER_INPUT_HINT}
                    >
                        {composerIdleInputHint}
                    </p>
                ) : inputFooterGenerationHint ? (
                    <p role="status" aria-live="polite">
                        {inputFooterGenerationHint}
                    </p>
                ) : undefined
            }
            primaryAction={chatSendPrimaryAction}
        />
    );

    const inputDockSuggestionItems: string[] = !inputTrimmed
        ? quickSuggestions.length > 0
            ? quickSuggestions
            : suggestedQuestionsFromSource.length > 0
              ? suggestedQuestionsFromSource
              : !currentConversation
                ? [...WORKSPACE_WELCOME_SUGGESTION_CHIPS]
                : []
        : [];

    const inputDockSuggestionsEl =
        inputDockSuggestionItems.length > 0 ? (
            <div
                className="brainwave-quick-suggestions"
                role="region"
                aria-label={quickSuggestions.length > 0 ? '빠른 질문' : '추천 질문'}
                data-testid={TEST_IDS.CHAT_INPUT_DOCK_SUGGESTIONS}
            >
                <span className="brainwave-quick-suggestions-label">
                    {quickSuggestions.length > 0 ? '빠른 질문:' : '추천 질문:'}
                </span>
                {inputDockSuggestionItems.map((suggestion, idx) => (
                    <button
                        key={`${suggestion}-${idx}`}
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        aria-label={`${quickSuggestions.length > 0 ? '빠른' : '추천'} 질문 전송: ${suggestion}`}
                        className="brainwave-quick-suggestion-btn"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        ) : null;

    const hideEmptyStateSuggestedQuestions =
        inputDockSuggestionItems.length > 0 &&
        suggestedQuestionsFromSource.length > 0 &&
        currentConversation != null &&
        currentConversation.messages.length === 0;

    const projectSourcesTabInputHint =
        currentProject &&
        projectContentTab === 'sources' && (
            <div className="project-sources-input-hint" role="status" data-testid={TEST_IDS.PROJECT_SOURCES_INPUT_HINT}>
                <span className="project-sources-input-hint__text">
                    <strong>대화</strong> 탭에서 공유·보내기·대화 검색을 사용할 수 있습니다. 메시지는 아래에서 그대로 보낼 수 있습니다.
                </span>
                <button
                    type="button"
                    className="project-sources-input-hint__cta"
                    data-testid={TEST_IDS.PROJECT_SOURCES_GO_CHAT_TAB_BTN}
                    aria-label="대화 탭으로 전환"
                    onClick={() => {
                        setProjectContentTab('chat');
                        window.requestAnimationFrame(() => {
                            document.getElementById('tab-chat-top')?.focus();
                        });
                    }}
                >
                    대화 탭으로
                </button>
            </div>
        );

    return (
        <div
            className={`chatgpt-interface ${theme}${gensparkRouteAgentId ? ' chatgpt-interface--genspark-agent-session' : ''}`}
            data-brainwave-figma={FIGMA_BRAINWAVE_AI_UI_KIT_CHAT_URL}
        >
            {/* 스킵 링크: 키보드 사용자·스크린 리더용 (App.css .skip-to-main) */}
            <a href="#chat-main-content" className="skip-to-main" aria-label="본문으로 건너뛰기">
                본문으로 건너뛰기
            </a>
            {/* 통합 2단 레이아웃: 좌측 사이드바는 AppUnified에서만 사용. 대화 화면은 메인 영역만 표시 */}

            {/* 메인 대화 영역 — 클릭 전파 차단으로 웰컴/입력창 사용 시 프로젝트 등 다른 페이지로 이동 방지 */}
            <main id="chat-main-content" className="main-content" tabIndex={-1} role="main" aria-label="대화 영역" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    aria-hidden
                    onChange={handleImageFileSelect}
                />
                <input
                    ref={conversationFileInputRef}
                    type="file"
                    accept=".txt,.csv"
                    className="sr-only"
                    aria-hidden
                    aria-label="대화 파일 첨부 (TXT/CSV)"
                    onChange={handleConversationFileSelect}
                />
                {/* 상단 바: 좌(문서/편집) · 우(업로드·공유) — 타이틀 텍스트 제거 */}
                <header
                    className={`chat-main-header${gensparkRouteAgentId ? ' chat-main-header--genspark-agent-hidden' : ''}`}
                    aria-label="대화 상단"
                >
                    <div className="chat-main-header-left">
                        <button
                            type="button"
                            className="chat-main-header-btn"
                            onClick={() => navigate(DOCS_PATH)}
                            aria-label="도움말·문서로 이동"
                            title="도움말·문서"
                        >
                            <IconFile size={20} />
                        </button>
                        <button
                            type="button"
                            className="chat-main-header-btn"
                            onClick={() => navigate(SETTINGS_PATH)}
                            aria-label="설정으로 이동"
                            title="설정·편집"
                        >
                            <IconEdit size={20} />
                        </button>
                    </div>
                    <div className="chat-main-title" aria-hidden="true" />
                    <div className="chat-main-header-actions">
                        <button
                            type="button"
                            className="chat-main-header-btn"
                            onClick={() => imageFileInputRef.current?.click()}
                            aria-label="업로드"
                            title="파일 업로드"
                        >
                            <IconUpload size={20} />
                        </button>
                        <button
                            type="button"
                            className="chat-main-header-btn chat-main-header-btn--pro"
                            onClick={() => setShowProModal(true)}
                            aria-label="PRO 구독 안내"
                            title="PRO·구독 안내"
                            data-testid={TEST_IDS.CHAT_HEADER_PRO_BTN}
                        >
                            PRO
                        </button>
                        <button
                            type="button"
                            className="chat-main-header-btn"
                            onClick={() => {
                                if (currentProject) {
                                    setShowShareModal(true);
                                } else {
                                    showToast(
                                        '프로젝트를 연 대화에서만 프로젝트 공유를 쓸 수 있습니다. 일반 대화는 본문의 Share·보내기를 이용하세요.',
                                        'info',
                                    );
                                }
                            }}
                            aria-label="공유"
                            title={currentProject ? '프로젝트 공유' : '공유 안내'}
                        >
                            <IconShare size={20} />
                        </button>
                    </div>
                </header>
                {!isOnline && (
                    <div role="alert" className="chat-offline-banner">
                        오프라인 상태입니다. 연결이 복구되면 메시지 전송이 가능합니다.
                    </div>
                )}
                {gensparkAgentSessionMeta && gensparkRouteAgentId && (
                    <section
                        className="genspark-agent-detail"
                        aria-label="CORBU.AI 에이전트 세션 상세"
                        data-testid={TEST_IDS.GENSPARK_AGENT_SESSION_DETAIL}
                    >
                        <div className="genspark-agent-detail__inner">
                            <nav className="genspark-agent-detail__breadcrumb" aria-label="경로">
                                <Link to={AGENTS_PATH}>CORBU.AI 에이전트</Link>
                                <span className="genspark-agent-detail__bc-sep" aria-hidden>
                                    /
                                </span>
                                <span className="genspark-agent-detail__bc-current">
                                    {gensparkAgentSessionMeta.form.displayName}
                                </span>
                            </nav>
                            <div className="genspark-agent-detail__title-row">
                                <h1 className="genspark-agent-detail__title">{gensparkAgentSessionMeta.form.displayName}</h1>
                                <span className="genspark-agent-detail__badge">
                                    {gensparkAgentSessionMeta.registered ? '등록됨' : '커스텀 ID'}
                                </span>
                            </div>
                            {coerceTrimmedString(gensparkAgentSessionMeta.form.oneLineDescription, '') ? (
                                <p className="genspark-agent-detail__tagline">
                                    {gensparkAgentSessionMeta.form.oneLineDescription}
                                </p>
                            ) : null}
                            <p className="genspark-agent-detail__hint">
                                <code className="genspark-agent-detail__mono">{WORKSPACE_TAGLINE_QUERY_SNIPPET}</code>{' '}
                                공개 링크와 동일한 세션 · 단계형
                                생성 후 마크다운 답변
                            </p>
                            <div className="genspark-agent-detail__url-grid" role="group" aria-label="세션 URL">
                                <div className="genspark-agent-detail__url-cell">
                                    <div className="genspark-agent-detail__url-label">공개 URL</div>
                                    <code className="genspark-agent-detail__url-text" title={gensparkAgentSessionMeta.url}>
                                        {gensparkAgentSessionMeta.url}
                                    </code>
                                </div>
                                <div className="genspark-agent-detail__url-cell">
                                    <div className="genspark-agent-detail__url-label">이 앱</div>
                                    <code className="genspark-agent-detail__url-text">
                                        {typeof window !== 'undefined'
                                            ? `${window.location.origin}${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${gensparkRouteAgentId}`
                                            : `${AGENTS_PATH}?${AGENTS_QUERY_PARAM_ID}=${gensparkRouteAgentId}`}
                                    </code>
                                </div>
                            </div>
                            <div className="genspark-agent-detail__actions">
                                <Link
                                    to={AGENTS_PATH}
                                    className="genspark-agent-detail__btn genspark-agent-detail__btn--secondary"
                                    data-testid={TEST_IDS.GENSPARK_AGENT_BANNER_HUB_LINK}
                                >
                                    에이전트 허브
                                </Link>
                                <button
                                    type="button"
                                    className="genspark-agent-detail__btn genspark-agent-detail__btn--secondary"
                                    data-testid={TEST_IDS.GENSPARK_AGENT_COPY_PUBLIC_LINK}
                                    onClick={() => void copyGensparkAgentSessionLink('public')}
                                >
                                    공개 링크 복사
                                </button>
                                <button
                                    type="button"
                                    className="genspark-agent-detail__btn genspark-agent-detail__btn--secondary"
                                    data-testid={TEST_IDS.GENSPARK_AGENT_COPY_APP_LINK}
                                    onClick={() => void copyGensparkAgentSessionLink('app')}
                                >
                                    앱 링크 복사
                                </button>
                                <a
                                    className="genspark-agent-detail__btn genspark-agent-detail__btn--primary"
                                    href={gensparkAgentSessionMeta.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    공개 사이트에서 열기
                                </a>
                            </div>
                        </div>
                    </section>
                )}
                {viewMode === 'notebook' && currentProject ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: `1px solid ${themeStyles.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <h2 style={{ margin: 0, color: themeStyles.textPrimary }}>노트북 (구글 노트북 LM) — {currentProject.name}</h2>
                            <span style={{ fontSize: '12px', color: themeStyles.textSecondary }}>
                                소스는 프로젝트 설정에서 가이드라인으로 추가할 수 있습니다
                            </span>
                            <button
                                type="button"
                                onClick={() => setViewMode('chat')}
                                aria-label="대화로 이동"
                                style={{
                                    padding: '8px 16px',
                                    background: 'transparent',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                대화로 돌아가기
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                            <React.Suspense fallback={<LoadingSkeleton type="card" lines={5} />}>
                            <NotebookLLM
                                projectId={currentProject.id}
                                sourcesRefreshToken={notebookSourcesRefreshToken}
                                onSourcesChanged={refreshProjects}
                                onResponseComplete={(response) => {
                                    errorLogger.info('구글 노트북 LM 응답 완료', {
                                        component: 'ChatGPTInterface',
                                        action: 'notebookLLMResponse',
                                        responseLength: response?.content?.length || 0,
                                        modelUsed: response?.modelUsed,
                                    });
                                    showToast('구글 노트북 LM 응답이 완료되었습니다', 'success');
                                }}
                                onError={(error) => {
                                    errorLogger.error('구글 노트북 LM 오류', error instanceof Error ? error : new Error(String(error)), {
                                        component: 'ChatGPTInterface',
                                        action: 'notebookLLMError',
                                    });
                                }}
                            />
                            </React.Suspense>
                        </div>
                    </div>
                ) : (
                    <div
                        className={[
                            currentProject
                                ? 'bw-detail-root bw-tool-view project-detail-view chat-layout-body'
                                : 'chat-layout-body',
                            gensparkRouteAgentId && !currentProject ? 'chat-layout-body--genspark-agent-session' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        data-testid={
                          currentProject
                            ? 'project-detail-view'
                            : gensparkRouteAgentId
                              ? TEST_IDS.CHAT_LAYOUT_GENSPARK_AGENT_SESSION
                              : undefined
                        }
                        data-project-tab={currentProject ? projectContentTab : undefined}
                        role={currentProject ? 'region' : undefined}
                        aria-label={currentProject ? `프로젝트 상세: ${currentProject.name}` : undefined}
                    >
                        {currentProject && (
                            <header className="bw-detail-header project-detail-header" aria-label={`${currentProject.name} 프로젝트 정보`}>
                                <div className="bw-detail-header-inner project-detail-header-inner">
                                    <div className="bw-detail-header-left project-detail-header-left">
                                        <div className="project-detail-header-text">
                                            <h1 className="bw-detail-title">{currentProject.name}</h1>
                                            {coerceTrimmedString(currentProject.description, '') ? (
                                                <p className="bw-detail-desc">{coerceTrimmedString(currentProject.description, '')}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="bw-detail-header-actions">
                                        <button
                                            type="button"
                                            className="bw-btn-secondary project-detail-settings-btn"
                                            onClick={() => openProjectEditModal()}
                                            aria-label="프로젝트 설정"
                                            title="프로젝트 설정 열기"
                                            data-testid={TEST_IDS.PROJECT_DETAIL_SETTINGS_BTN}
                                        >
                                            <IconSettings size={18} aria-hidden />
                                            <span className="project-detail-settings-btn__label">설정</span>
                                        </button>
                                    </div>
                                </div>
                            </header>
                        )}
                        {/* 대화 / 소스 탭 — 샘플 구성: 프로젝트명 바로 아래 */}
                        {currentProject && (
                            <div
                                className="bw-project-tabs bw-project-tabs--below-header"
                                role="tablist"
                                aria-label="대화 또는 소스 보기"
                                aria-orientation="horizontal"
                                onKeyDown={(e) => {
                                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
                                    e.preventDefault();
                                    if (e.key === 'ArrowRight' || e.key === 'End') setProjectContentTab('sources');
                                    else setProjectContentTab('chat');
                                }}
                            >
                                <button
                                    type="button"
                                    role="tab"
                                    className="bw-project-tab"
                                    aria-selected={projectContentTab === 'chat'}
                                    aria-controls="project-content-panel"
                                    id="tab-chat-top"
                                    tabIndex={projectContentTab === 'chat' ? 0 : -1}
                                    onClick={() => setProjectContentTab('chat')}
                                >
                                    대화
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    className="bw-project-tab"
                                    aria-selected={projectContentTab === 'sources'}
                                    aria-controls="project-content-panel"
                                    id="tab-sources-top"
                                    data-testid={TEST_IDS.PROJECT_SOURCES_TAB}
                                    tabIndex={projectContentTab === 'sources' ? 0 : -1}
                                    onClick={() => setProjectContentTab('sources')}
                                >
                                    소스
                                </button>
                            </div>
                        )}
                        {isApiReachable === false && (
                            <div ref={apiUnreachableBannerRef} className="bw-api-unreachable-banner" role="alert" aria-live="assertive" tabIndex={-1} data-testid={TEST_IDS.API_UNREACHABLE_BANNER}>
                                <p className="bw-api-unreachable-message">
                                    백엔드에 연결할 수 없습니다. 대화가 동작하려면 터미널에서 <code>npm run restart:backend</code> 실행 후 페이지를 새로고침해 주세요.
                                </p>
                            </div>
                        )}
                            <div
                                className={[
                                    'project-detail-body',
                                    'chat-main-stage',
                                    !currentConversation ? 'chat-main-stage--welcome' : '',
                                    currentProject && projectContentTab === 'sources' ? 'project-detail-body--sources-tab' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                data-testid="chat-main-stage"
                                style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                            >
                    {currentConversation ? (
                    <>
                        {(!currentProject || projectContentTab === 'chat') && threadContextPanelOpen && (
                            <div
                                id="bw-thread-context-panel-region"
                                className="bw-thread-context-panel"
                                data-testid={TEST_IDS.THREAD_CONTEXT_PANEL}
                                role="region"
                                aria-label="이 대화 지침·파일·딥시크 설정"
                            >
                                <div className="bw-thread-context-panel__toolbar">
                                    <span className="bw-thread-context-panel__title">
                                        {currentProject
                                            ? '이 스레드만의 지침·파일 (프로젝트 지침에 추가로 적용)'
                                            : '이 대화 · 지침·파일·딥시크'}
                                    </span>
                                    <button
                                        type="button"
                                        className="bw-btn-secondary"
                                        onClick={() => setThreadContextPanelOpen(false)}
                                        aria-label="대화 설정 패널 닫기"
                                    >
                                        닫기
                                    </button>
                                </div>
                                <div className="bw-thread-context-panel__body">
                                    <p className="bw-thread-context-panel__hint">
                                        {currentProject ? (
                                            <>
                                                이 스레드에만 적용되는 지침·텍스트 파일입니다. 프로젝트 지침·소스와 함께 맥락에 포함됩니다.
                                                입력창 아래 <strong>딥시크</strong> 관련 토글로 이 스레드만 덮어쓸 수 있습니다.
                                            </>
                                        ) : (
                                            <>
                                                프로젝트 없이 쓸 때 <strong>이 대화</strong>에 지침·참고 파일을 두면, 요청마다{' '}
                                                <strong>parsed_input</strong>·Q→A 파이프라인·딥시크 플래그가 함께 실리고, 첨부 본문은 서버에서
                                                답변 맥락(<code>projectKnowledge</code>)에 합쳐집니다. 입력창 아래{' '}
                                                <strong>딥시크 검수·리파인·Reasoner</strong> 토글로 대화별로 덮어쓸 수 있습니다.
                                            </>
                                        )}
                                    </p>
                                    <label className="bw-thread-context-panel__label" htmlFor="bw-thread-instructions">
                                        지침
                                    </label>
                                    <textarea
                                        id="bw-thread-instructions"
                                        className="bw-thread-context-panel__textarea"
                                        rows={3}
                                        placeholder="이 대화에서만 모델이 따를 지침을 입력하세요."
                                        value={threadInstructionsDraft}
                                        onChange={(e) => setThreadInstructionsDraft(e.target.value)}
                                        onBlur={() => {
                                            const next = coerceTrimmedString(threadInstructionsDraft, '');
                                            const prev = coerceTrimmedString(
                                                currentConversation.threadInstructions ?? '',
                                                ''
                                            );
                                            if (next !== prev) {
                                                updateConversationThread({
                                                    threadInstructions: next || undefined,
                                                });
                                            }
                                        }}
                                    />
                                    <div className="bw-thread-context-panel__files">
                                        <input
                                            ref={threadContextFilesInputRef}
                                            type="file"
                                            className="sr-only"
                                            multiple
                                            accept=".txt,.md,.mdx,.csv,.json,.ts,.tsx,.js,.jsx,.css,.html,.htm,.xml,.yaml,.yml,.sql,text/*"
                                            aria-hidden
                                            tabIndex={-1}
                                            onChange={onThreadContextFilesChange}
                                        />
                                        <button
                                            type="button"
                                            className="bw-btn-secondary"
                                            data-testid={TEST_IDS.THREAD_CONTEXT_FILE_ADD}
                                            onClick={() => threadContextFilesInputRef.current?.click()}
                                        >
                                            파일 추가
                                        </button>
                                        <span className="bw-thread-context-panel__files-meta">
                                            텍스트 위주 파일 최대 {MAX_THREAD_CONTEXT_FILES}개 · 내용은 답변 맥락에 포함
                                        </span>
                                    </div>
                                    {(currentConversation.threadFiles?.length ?? 0) > 0 && (
                                        <ul className="bw-thread-context-panel__file-list">
                                            {currentConversation.threadFiles!.map((f) => (
                                                <li key={f.id}>
                                                    <span className="bw-thread-context-panel__file-name">{f.name}</span>
                                                    {!f.textContent && (
                                                        <span className="bw-thread-context-panel__file-note">
                                                            {' '}
                                                            (내용 미포함 · 텍스트 형식 권장)
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="bw-thread-context-panel__file-remove"
                                                        onClick={() => removeThreadContextFile(f.id)}
                                                        aria-label={`${f.name} 제거`}
                                                    >
                                                        제거
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* 대화 헤더 — 제목 행 + 보조(태그·핀) 분리 */}
                        <div
                            className={[
                                'brainwave-chat-header brainwave-chat-header--genspark',
                                currentProject ? 'brainwave-chat-header--in-project' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            <div className="brainwave-chat-header__primary">
                                {currentProject ? (
                                    <p className="brainwave-chat-header-thread-line" title={currentConversation.title}>
                                        {currentConversation.title}
                                    </p>
                                ) : (
                                    <h3 className="brainwave-chat-header-title" title={currentConversation.title}>
                                        <span className="brainwave-chat-header-title-kicker">대화</span>
                                        <span>{currentConversation.title}</span>
                                    </h3>
                                )}
                                <div className="brainwave-chat-header-actions">
                                <button
                                    type="button"
                                    className="bw-btn-primary"
                                    onClick={() => setShowShareModal(true)}
                                    aria-label="공유"
                                    title="대화 공유"
                                >
                                    공유
                                </button>
                                {(!currentProject || projectContentTab === 'chat') && (
                                    <button
                                        type="button"
                                        className="bw-btn-secondary"
                                        data-testid={TEST_IDS.CHAT_THREAD_CONTEXT_SETTINGS}
                                        onClick={() => setThreadContextPanelOpen(true)}
                                        aria-expanded={threadContextPanelOpen}
                                        aria-controls={
                                            threadContextPanelOpen ? 'bw-thread-context-panel-region' : undefined
                                        }
                                        title="이 대화 지침·첨부 파일·딥시크 관련 설정"
                                    >
                                        대화 설정
                                    </button>
                                )}
                                <details className="bw-chat-header-menu" data-testid={TEST_IDS.CHAT_HEADER_SEND_MENU}>
                                    <summary className="bw-chat-header-menu__trigger bw-btn-secondary">보내기</summary>
                                    <div className="bw-chat-header-menu__panel" role="group" aria-label="대화보내기">
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item"
                                            style={{ fontWeight: 600, borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: 6, marginBottom: 2 }}
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                setShowExportModal(true);
                                            }}
                                            disabled={currentConversation.messages.length === 0}
                                        >
                                            내보내기 옵션…
                                        </button>
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item"
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                void exportConversation('markdown');
                                            }}
                                            disabled={currentConversation.messages.length === 0}
                                            title="Ctrl+E"
                                        >
                                            Markdown
                                        </button>
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item"
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                void exportConversation('clipboard');
                                            }}
                                            disabled={currentConversation.messages.length === 0}
                                        >
                                            클립보드
                                        </button>
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item"
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                void exportConversation('json');
                                            }}
                                            disabled={currentConversation.messages.length === 0}
                                        >
                                            JSON
                                        </button>
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item"
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                void exportConversation('html');
                                            }}
                                            disabled={currentConversation.messages.length === 0}
                                        >
                                            HTML
                                        </button>
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item"
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                void exportConversation('txt');
                                            }}
                                            disabled={currentConversation.messages.length === 0}
                                        >
                                            텍스트 (.txt)
                                        </button>
                                    </div>
                                </details>
                                <details className="bw-chat-header-menu" data-testid={TEST_IDS.CHAT_HEADER_MANAGE_MENU}>
                                    <summary className="bw-chat-header-menu__trigger bw-btn-secondary">관리</summary>
                                    <div className="bw-chat-header-menu__panel" role="group" aria-label="대화 관리">
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item"
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                void importConversation();
                                            }}
                                            disabled={importingConversation}
                                            title="Ctrl+Shift+I"
                                        >
                                            {importingConversation ? '가져오는 중…' : '가져오기'}
                                        </button>
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item"
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                if (currentConversation) duplicateConversation(currentConversation);
                                            }}
                                            disabled={currentConversation.messages.length === 0}
                                            title="Ctrl+Shift+D"
                                        >
                                            복제
                                        </button>
                                        <button
                                            type="button"
                                            className="bw-chat-header-menu__item bw-chat-header-menu__item--danger"
                                            onClick={(e) => {
                                                (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                if (currentConversation) setDeleteConfirmConversation(currentConversation);
                                            }}
                                            data-testid={TEST_IDS.CHAT_DELETE_CONVERSATION}
                                        >
                                            대화 삭제
                                        </button>
                                        {currentConversation.messages.length > 0 ? (
                                            <button
                                                type="button"
                                                className="bw-chat-header-menu__item bw-chat-header-menu__item--danger"
                                                onClick={(e) => {
                                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                    requestClearMessages();
                                                }}
                                            >
                                                메시지 전체 삭제
                                            </button>
                                        ) : null}
                                    </div>
                                </details>
                                <button
                                    type="button"
                                    onClick={() => setShowMessageSearch(prev => !prev)}
                                    aria-label="대화 내 검색 (Ctrl+F)"
                                    title="대화 내 검색 (Ctrl+F)"
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        background: showMessageSearch ? 'var(--accent-info-muted)' : 'transparent',
                                        border: showMessageSearch ? '1px solid var(--accent-info)' : '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                    </svg>
                                </button>
                                {/* 타임스탬프 토글 */}
                                <button
                                    type="button"
                                    onClick={toggleTimestamps}
                                    aria-label={showTimestamps ? '시간 숨기기' : '시간 표시'}
                                    title={showTimestamps ? '시간 숨기기' : '시간 표시'}
                                    style={{
                                        padding: '6px',
                                        background: showTimestamps ? 'var(--accent-info-border)' : 'transparent',
                                        border: showTimestamps ? '1px solid var(--accent-info)' : '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                    </svg>
                                </button>
                                {/* 자동 스크롤 토글 */}
                                <button
                                    type="button"
                                    onClick={() => setAutoScroll(prev => !prev)}
                                    aria-label={autoScroll ? '자동 스크롤 끄기' : '자동 스크롤 켜기'}
                                    title={autoScroll ? '자동 스크롤 끄기' : '자동 스크롤 켜기'}
                                    style={{
                                        padding: '6px',
                                        background: autoScroll ? 'var(--accent-info-border)' : 'transparent',
                                        border: autoScroll ? '1px solid var(--accent-info)' : '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
                                    </svg>
                                </button>
                                {bookmarkedMessages.length > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            background: 'var(--accent-warning-muted)',
                                            borderRadius: '4px',
                                            color: 'var(--accent-warning)',
                                        }}>
                                            북마크 {bookmarkedMessages.length}
                                        </span>
                                        <button
                                            type="button"
                                            title="즐겨찾기 메시지 TXT 내보내기"
                                            aria-label="즐겨찾기 메시지 내보내기"
                                            onClick={exportBookmarkedMessages}
                                            style={{
                                                background: 'var(--accent-warning-muted)',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '4px 7px',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                color: 'var(--accent-warning)',
                                            }}
                                        >
                                            내보내기
                                        </button>
                                    </span>
                                )}
                                {/* 대화 요약 버튼 */}
                                {currentConversation && (currentConversation.messages ?? []).length > 0 && (
                                    <button
                                        type="button"
                                        title="대화 내용 요약 보기"
                                        aria-label="대화 요약"
                                        onClick={summarizeConversation}
                                        style={{
                                            background: 'var(--accent-info-muted, rgba(59,130,246,0.1))',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            color: 'var(--accent-info, #3b82f6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                        }}
                                    >
                                        요약
                                    </button>
                                )}
                            </div>
                            </div>
                            <div className="brainwave-chat-header__secondary">
                                <div className="conv-tags-row">
                                    {(currentConversation.tags ?? []).map(tag => (
                                        <span key={tag} className="conv-tag-chip">
                                            #{tag}
                                            <button
                                                type="button"
                                                className="conv-tag-chip-del"
                                                onClick={() => removeTagFromCurrentConv(tag)}
                                                aria-label={`태그 #${tag} 삭제`}
                                                title="삭제"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                    {convTagsOpen ? (
                                        <span className="conv-tag-add-wrap">
                                            <input
                                                type="text"
                                                className="conv-tag-input"
                                                placeholder="태그 입력…"
                                                value={convTagInput}
                                                onChange={e => setConvTagInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        addTagToCurrentConv(convTagInput);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setConvTagsOpen(false);
                                                        setConvTagInput('');
                                                    }
                                                }}
                                                maxLength={20}
                                                autoFocus
                                                aria-label="태그 입력"
                                            />
                                            <button
                                                type="button"
                                                className="conv-tag-add-confirm"
                                                onClick={() => addTagToCurrentConv(convTagInput)}
                                                aria-label="태그 추가 확인"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                type="button"
                                                className="conv-tag-add-cancel"
                                                onClick={() => {
                                                    setConvTagsOpen(false);
                                                    setConvTagInput('');
                                                }}
                                                aria-label="취소"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="conv-tag-add-btn"
                                            onClick={() => setConvTagsOpen(true)}
                                            aria-label="태그 추가"
                                            title="태그 추가 (최대 8개)"
                                        >
                                            + 태그
                                        </button>
                                    )}
                                </div>
                                {pinnedMessages.length > 0 && (
                                    <div className="msg-pinned-banner">
                                        <button
                                            type="button"
                                            className="msg-pinned-banner-toggle"
                                            onClick={() => setShowPinnedPanel(p => !p)}
                                            aria-expanded={showPinnedPanel}
                                        >
                                            핀 고정 {pinnedMessages.length}개 {showPinnedPanel ? '▾' : '▸'}
                                        </button>
                                        {showPinnedPanel && (
                                            <ul className="msg-pinned-list">
                                                {pinnedMessages.map(pm => (
                                                    <li key={pm.id} className="msg-pinned-item">
                                                        <span className="msg-pinned-role">{pm.role === 'user' ? '나' : 'AI'}</span>
                                                        <span className="msg-pinned-preview">
                                                            {pm.content.slice(0, 80)}
                                                            {pm.content.length > 80 ? '…' : ''}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="msg-pinned-unpin"
                                                            onClick={() => togglePinMessage(pm.id)}
                                                            aria-label="핀 해제"
                                                            title="핀 해제"
                                                        >
                                                            ✕
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 대화 내 검색 바 */}
                        {showMessageSearch && (
                            <div
                                className="bw-message-search-bar"
                                role="search"
                                aria-label="대화 내 검색"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-secondary)" aria-hidden="true">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                                <input
                                    type="search"
                                    value={messageSearchQuery}
                                    onChange={(e) => {
                                        setMessageSearchQuery(e.target.value);
                                        setMessageSearchIndex(0);
                                    }}
                                    placeholder="대화에서 검색..."
                                    aria-label="대화 내 검색어"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            navigateMessageSearch('next');
                                        } else if (e.key === 'Escape') {
                                            setShowMessageSearch(false);
                                            setMessageSearchQuery('');
                                        }
                                    }}
                                />
                                {messageSearchTrimmed && (
                                    <span className="bw-message-search-meta">
                                        {messageSearchResults.length > 0
                                            ? `${messageSearchIndex + 1} / ${messageSearchResults.length}`
                                            : '결과 없음'}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className="bw-message-search-nav-btn"
                                    onClick={() => navigateMessageSearch('prev')}
                                    disabled={messageSearchResults.length === 0}
                                    aria-label="이전 검색 결과"
                                    title="이전 결과"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    className="bw-message-search-nav-btn"
                                    onClick={() => navigateMessageSearch('next')}
                                    disabled={messageSearchResults.length === 0}
                                    aria-label="다음 검색 결과"
                                    title="다음 결과"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    className="bw-message-search-close"
                                    onClick={() => {
                                        setShowMessageSearch(false);
                                        setMessageSearchQuery('');
                                    }}
                                    aria-label="검색 닫기 (Esc)"
                                    title="검색 닫기 (Esc)"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <div
                            className={`messages-container${currentProject && projectContentTab === 'sources' ? '' : ' genspark-chat-messages-wrap'}`}
                            role={currentProject ? 'tabpanel' : 'log'}
                            aria-labelledby={currentProject ? (projectContentTab === 'chat' ? 'tab-chat-top' : 'tab-sources-top') : undefined}
                            aria-label={currentProject ? undefined : '대화 메시지 목록'}
                            aria-live={currentProject && projectContentTab === 'sources' ? 'off' : 'polite'}
                            aria-atomic="false"
                            id="project-content-panel"
                            ref={messagesContainerRef}
                            tabIndex={-1}
                            onScroll={handleMessagesScroll}
                            data-testid={TEST_IDS.MESSAGES_CONTAINER}
                        >
                            {currentProject && projectContentTab === 'sources' ? (
                                projectSourcesPanelSection
                            ) : (
                                <>
                                    {currentProjectContext && projectDashboard && (
                                <section className="project-dashboard" aria-label="프로젝트 대시보드">
                                    <div className="project-dashboard-header">
                                        <h3 className="project-dashboard-title">프로젝트 대시보드</h3>
                                        <span className="project-dashboard-subtitle">{currentProjectContext.name}</span>
                                    </div>
                                    <div className="project-dashboard-grid">
                                        <div className="project-dashboard-card">
                                            <div className="project-dashboard-card-title">최근 참고 소스</div>
                                            {projectDashboard.recentSources.length > 0 ? (
                                                <ul className="project-dashboard-list">
                                                    {projectDashboard.recentSources.map((name) => (
                                                        <li key={name}>{name}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="project-dashboard-empty">아직 등록된 소스가 없습니다.</p>
                                            )}
                                        </div>
                                        <div className="project-dashboard-card">
                                            <div className="project-dashboard-card-title">빠른 생성</div>
                                            <p className="project-dashboard-card-desc">입력과 답변 생성을 바로 시작할 수 있는 기본 액션입니다.</p>
                                            <div className="project-dashboard-actions">
                                                {projectDashboard.quickPrompts.map((action) => (
                                                    <button
                                                        key={action.label}
                                                        type="button"
                                                        className="project-dashboard-action-btn"
                                                        onClick={() => {
                                                            setInput(action.prompt);
                                                            inputRef.current?.focus();
                                                        }}
                                                        aria-label={`${action.label} 프롬프트 입력`}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="project-dashboard-card">
                                            <div className="project-dashboard-card-title">현재 기준</div>
                                            <p className="project-dashboard-card-desc">프로젝트·대화 단위의 현재 상태입니다.</p>
                                            <div className="project-dashboard-quality-meta">
                                                <span>프로젝트: {currentProjectContext.name}</span>
                                                <span>프로젝트 내 대화: {filteredConversations.length}개</span>
                                                <span>현재 대화 메시지: {currentConversation.messages.length}개</span>
                                                <span>소스: {currentProjectContext.sourceCount}개</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                            {currentConversation.messages.length === 0 ? (
                                <div className="empty-state" data-testid="empty-state">
                                    {currentProjectContext ? (
                                        <>
                                            <div className="project-detail-intro" role="region" aria-label="프로젝트 상세 요약">
                                                <h3>이 프로젝트</h3>
                                                <p>{currentProjectContext.name}에 대해 소스·지침을 반영해 대화할 수 있습니다. 아래에서 대화를 시작하세요.</p>
                                                <div className="project-detail-intro-stats">
                                                    {currentProjectContext.hasInstructions && <span>지침 적용</span>}
                                                    <span>가이드라인 {currentProjectContext.guidelineCount}개</span>
                                                    <span>파일 {currentProjectContext.fileCount}개</span>
                                                    <span>소스 {currentProjectContext.sourceCount}개</span>
                                                </div>
                                            </div>
                                            <output>
                                                <h2>아직 대화 없음</h2>
                                                <p>{currentProjectContext.name}에 대해 무엇이든 물어보세요</p>
                                        {!hideEmptyStateSuggestedQuestions && suggestedQuestionsFromSource.length > 0 && (
                                            <div className="empty-state-suggested-questions" role="region" aria-label="추천 질문" data-testid={TEST_IDS.SUGGESTED_QUESTIONS_FROM_SOURCE}>
                                                <p className="suggested-questions-label">💡 소스 기반 추천 질문</p>
                                                <div className="suggested-questions-grid">
                                                    {suggestedQuestionsFromSource.map((q, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            className="suggested-question-chip"
                                                            onClick={() => sendMessage(q)}
                                                            data-testid={`suggested-question-${idx}`}
                                                            aria-label={`추천 질문 전송: ${q}`}
                                                        >
                                                            {q}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                            </output>
                                        </>
                                    ) : gensparkRouteAgentId && gensparkAgentSessionMeta ? (
                                        <output
                                            className="genspark-agent-empty"
                                            data-testid={TEST_IDS.GENSPARK_AGENT_EMPTY_STATE}
                                        >
                                            <h2 className="genspark-agent-empty__title">첫 메시지를 보내 보세요</h2>
                                            <p className="genspark-agent-empty__agent-name">
                                                {gensparkAgentSessionMeta.form.displayName}
                                            </p>
                                            <p className="genspark-agent-empty__desc">
                                                {coerceTrimmedString(
                                                    gensparkAgentSessionMeta.form.oneLineDescription,
                                                    '',
                                                ) ||
                                                    'CORBU.AI 에이전트 세션입니다. 아래 입력창에서 메시지를 내면 단계형 생성 패널과 마크다운 답변이 이어집니다.'}
                                            </p>
                                            <p className="genspark-agent-empty__hint">
                                                상단에서 공개 URL·앱 링크를 복사하거나 원본 페이지를 열 수 있습니다.
                                            </p>
                                            {!hideEmptyStateSuggestedQuestions && suggestedQuestionsFromSource.length > 0 && (
                                                <div
                                                    className="empty-state-suggested-questions"
                                                    role="region"
                                                    aria-label="추천 질문"
                                                    data-testid={TEST_IDS.SUGGESTED_QUESTIONS_FROM_SOURCE}
                                                >
                                                    <p className="suggested-questions-label">💡 추천 질문</p>
                                                    <div className="suggested-questions-grid">
                                                        {suggestedQuestionsFromSource.map((q, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                className="suggested-question-chip"
                                                                onClick={() => sendMessage(q)}
                                                                data-testid={`suggested-question-${idx}`}
                                                                aria-label={`추천 질문 전송: ${q}`}
                                                            >
                                                                {q}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </output>
                                    ) : (
                                        <output>
                                            <h2>새 대화를 시작하세요</h2>
                                            <p>
                                                {suggestedQuestionsFromSource.length > 0 && !hideEmptyStateSuggestedQuestions
                                                    ? '아래 추천 질문을 클릭하거나 직접 입력하세요. Enter로 전송, Shift+Enter로 줄바꿈.'
                                                    : suggestedQuestionsFromSource.length > 0
                                                      ? '입력창 위 추천 질문을 클릭하거나 직접 입력하세요. Enter로 전송, Shift+Enter로 줄바꿈.'
                                                      : '입력창에 메시지를 입력하여 대화를 시작하세요. Enter로 전송, Shift+Enter로 줄바꿈.'}
                                            </p>
                                            {!hideEmptyStateSuggestedQuestions && suggestedQuestionsFromSource.length > 0 && (
                                                <div className="empty-state-suggested-questions" role="region" aria-label="추천 질문" data-testid={TEST_IDS.SUGGESTED_QUESTIONS_FROM_SOURCE}>
                                                    <p className="suggested-questions-label">💡 소스 기반 추천 질문</p>
                                                    <div className="suggested-questions-grid">
                                                        {suggestedQuestionsFromSource.map((q, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                className="suggested-question-chip"
                                                                onClick={() => sendMessage(q)}
                                                                data-testid={`suggested-question-${idx}`}
                                                                aria-label={`추천 질문 전송: ${q}`}
                                                            >
                                                                {q}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </output>
                                    )}
                                </div>
                            ) : (
                                currentConversation.messages.map((message, index) => {
                                    const isLastAssistantBubble =
                                        message.role === 'assistant' &&
                                        index === currentConversation.messages.length - 1;
                                    const assistantGenerationLive =
                                        isLastAssistantBubble &&
                                        (isStreaming ||
                                            (isLoading && isAssistantGenerationStepUi(message.content)));
                                    const pipelineStreamPhase =
                                        message.role === 'assistant' &&
                                        isStreaming &&
                                        index === currentConversation.messages.length - 1 &&
                                        isAssistantGenerationStepUi(message.content)
                                            ? assistantPhaseFromPipelineExtrasSlug(
                                                  message.pipelineExtras?.pipelineGenerationPhase,
                                              ) ?? 'draft'
                                            : null;
                                    const turnUserForAssistantStepUi =
                                        message.role === 'assistant' &&
                                        index > 0 &&
                                        currentConversation.messages[index - 1].role === 'user'
                                            ? coerceTrimmedString(
                                                  currentConversation.messages[index - 1].content,
                                                  '',
                                              )
                                            : '';
                                    const messageTurnGensparkStepUi = assistantGensparkStepUiFromUserMessage(
                                        turnUserForAssistantStepUi,
                                        {
                                            projectHasFiles:
                                                pipelineStepDocumentContext ||
                                                userMessageHasAttachmentChatHint(turnUserForAssistantStepUi),
                                        },
                                    );
                                    return (
                                    <article
                                        key={message.id}
                                        id={`message-${message.id}`}
                                        className={`message genspark-qa-article ${message.role === 'user' ? 'user-message' : 'assistant-message'}${message.bookmarked ? ' bookmarked' : ''}${gensparkRouteAgentId ? ' genspark-agent-session-msg' : ''}`}
                                        aria-label={`${message.role === 'user' ? '사용자' : 'AI'} 메시지${message.bookmarked ? ' (북마크됨)' : ''}${
                                            isStreaming && isLastAssistantBubble
                                                ? ', 스트리밍 중'
                                                : isLoading && isLastAssistantBubble && isAssistantGenerationStepUi(message.content)
                                                  ? ', 답변 생성 단계 표시 중'
                                                  : ''
                                        }`}
                                        {...(assistantGenerationLive && {
                                            'aria-live': 'polite' as const,
                                            'aria-busy': true,
                                        })}
                                        style={{
                                            borderLeft: message.bookmarked ? '3px solid var(--accent-warning)' : undefined,
                                        }}
                                        data-testid={`message-${message.role}${isStreaming && isLastAssistantBubble ? '-streaming' : ''}`}
                                    >
                                        <div className="message-avatar" aria-hidden="true">
                                            {message.role === 'user' ? (
                                                <span style={{ fontSize: '1.2em' }}>👤</span>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-info-figma)" aria-hidden="true"><path d="M12 2a10 10 0 0 1 7.38 16.75 1 1 0 0 1-1.5-.75 8 8 0 1 0-11.76 0 1 1 0 0 1-1.5.75A10 10 0 0 1 12 2z"/></svg>
                                            )}
                                        </div>
                                        <div className="message-content">
                                            {editingMessageId !== message.id && (
                                                <div className="genspark-qa-role-row">
                                                    <span
                                                        className={`genspark-qa-badge ${message.role === 'user' ? 'genspark-qa-badge--question' : 'genspark-qa-badge--answer'}`}
                                                    >
                                                        {message.role === 'user' ? ASSISTANT_GENSPARK_QA_BADGE_QUESTION : ASSISTANT_GENSPARK_QA_BADGE_ANSWER}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="message-text">
                                                {editingMessageId === message.id ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <textarea
                                                            value={editingContent}
                                                            onChange={(e) => setEditingContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    if (isKeyboardEventImeComposing(e)) return;
                                                                    e.preventDefault();
                                                                    void saveEditedMessage(message.id);
                                                                } else if (e.key === 'Escape') {
                                                                    cancelEditingMessage();
                                                                }
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                minHeight: '80px',
                                                                padding: '12px',
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--sidebar-dark-border-strong)',
                                                                background: 'var(--sidebar-dark-input-bg)',
                                                                color: 'var(--text-primary)',
                                                                fontSize: '14px',
                                                                resize: 'vertical',
                                                                fontFamily: 'inherit',
                                                            }}
                                                            autoFocus
                                                        />
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button
                                                                type="button"
                                                                onClick={cancelEditingMessage}
                                                                aria-label="편집 취소"
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                                                    background: 'transparent',
                                                                    color: 'var(--text-primary)',
                                                                    cursor: 'pointer',
                                                                    fontSize: '13px',
                                                                }}
                                                            >
                                                                취소
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => void saveEditedMessage(message.id)}
                                                                disabled={!coerceTrimmedString(editingContent, '')}
                                                                aria-label="편집 저장"
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    borderRadius: '6px',
                                                                    border: 'none',
                                                                    background: coerceTrimmedString(editingContent, '') ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                                    color: 'var(--on-accent)',
                                                                    cursor: coerceTrimmedString(editingContent, '') ? 'pointer' : 'not-allowed',
                                                                    fontSize: '13px',
                                                                }}
                                                            >
                                                                저장 및 전송
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : message.role === 'assistant' ? (
                                                    <>
                                                        {message.thinkingDurationMs != null && coerceTrimmedString(message.content, '') && (
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: themeStyles.textSecondary,
                                                                marginBottom: '6px',
                                                            }}>
                                                                {Math.round(message.thinkingDurationMs / 1000)}s 동안 생각함 &gt;
                                                            </div>
                                                        )}
                                                        {pipelineStreamPhase != null && (
                                                            <div style={{ marginBottom: 10 }}>
                                                                <GensparkGenerationStatus
                                                                    variant="step"
                                                                    phase={pipelineStreamPhase}
                                                                    embedded={gensparkAgentBodyEmbedded}
                                                                    webSearch={messageTurnGensparkStepUi.webSearch}
                                                                    documentContext={messageTurnGensparkStepUi.documentContext}
                                                                />
                                                            </div>
                                                        )}
                                                        <div style={{
                                                            maxHeight: collapsedMessages.has(message.id) ? '150px' : 'none',
                                                            overflow: collapsedMessages.has(message.id) ? 'hidden' : 'visible',
                                                            position: 'relative',
                                                        }}>
                                                            <AssistantGensparkBody
                                                                text={message.content}
                                                                searchTerm={messageSearchTrimmed || undefined}
                                                                enhancedCodeBlocks
                                                                embedded={gensparkAgentBodyEmbedded}
                                                                webSearch={messageTurnGensparkStepUi.webSearch}
                                                                documentContext={messageTurnGensparkStepUi.documentContext}
                                                            />
                                                            {collapsedMessages.has(message.id) && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    bottom: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    height: '60px',
                                                                    background: `linear-gradient(transparent, var(--bg-secondary))`,
                                                                    pointerEvents: 'none',
                                                                }} />
                                                            )}
                                                        </div>
                                                            {isLongMessage(message.content) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleMessageCollapse(message.id)}
                                                                aria-label={collapsedMessages.has(message.id) ? '메시지 펼치기' : '메시지 접기'}
                                                                aria-expanded={!collapsedMessages.has(message.id)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    marginTop: '8px',
                                                                    padding: '4px 10px',
                                                                    background: 'transparent',
                                                                    border: `1px solid ${themeStyles.borderColor}`,
                                                                    borderRadius: '4px',
                                                                    color: themeStyles.textSecondary,
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                {collapsedMessages.has(message.id) ? (
                                                                    <>
                                                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                                                        </svg>
                                                                        펼치기
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
                                                                        </svg>
                                                                        접기
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                        {message.suggestedFollowUps &&
                                                            message.suggestedFollowUps.length > 0 &&
                                                            !isStreaming && (
                                                                <GensparkNextActionChips
                                                                    hints={message.suggestedFollowUps}
                                                                    messageId={message.id}
                                                                    onSelectHint={(h) => sendMessage(h)}
                                                                    borderColor={themeStyles.borderColor}
                                                                    textSecondary={themeStyles.textSecondary}
                                                                />
                                                            )}
                                                        {message.role === 'assistant' &&
                                                            message.pipelineExtras &&
                                                            hasPipelineExtras(message.pipelineExtras) &&
                                                            !isStreaming && (
                                                                <GensparkPipelineExtrasPanel
                                                                    extras={message.pipelineExtras}
                                                                    messageId={message.id}
                                                                    theme={{
                                                                        borderColor: themeStyles.borderColor,
                                                                        textSecondary: themeStyles.textSecondary,
                                                                    }}
                                                                    assistantStepWebSearch={messageTurnGensparkStepUi.webSearch}
                                                                    assistantStepDocumentContext={
                                                                        messageTurnGensparkStepUi.documentContext
                                                                    }
                                                                />
                                                            )}
                                                    </>
                                                ) : messageSearchTrimmed ? (
                                                    highlightTextForPlainText(message.content || '')
                                                ) : (
                                                    // 사용자 메시지도 줄바꿈이 보이도록 마크다운 렌더링 또는 pre-wrap 스타일 적용
                                                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                        {message.content || ''}
                                                    </div>
                                                )}
                                            </div>
                                            {editingMessageId !== message.id && (
                                                <fieldset className="message-actions" aria-label="메시지 작업" style={{ border: 'none', padding: 0, margin: 0 }}>
                                                    <button
                                                        type="button"
                                                        className="copy-btn"
                                                        onClick={() => copyMessage(message.content)}
                                                        aria-label={`${message.role === 'user' ? '사용자' : 'AI'} 메시지 복사`}
                                                        title="메시지 복사"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                            <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
                                                        </svg>
                                                    </button>
                                                    {message.role === 'user' && !isLoading && !isStreaming && (
                                                        <button
                                                            type="button"
                                                            className="edit-btn"
                                                            onClick={() => startEditingMessage(message.id, message.content)}
                                                            aria-label="메시지 편집"
                                                            title="메시지 편집"
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                color: 'inherit',
                                                                opacity: 0.7,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {message.role === 'assistant' && !isLoading && !isStreaming && (
                                                        <button
                                                            type="button"
                                                            className="regenerate-btn"
                                                            data-testid={TEST_IDS.COMPOSER_REGENERATE_MESSAGE}
                                                            onClick={() => regenerateMessage(message.id)}
                                                            aria-label={message.content.startsWith('❌') ? '재시도' : '응답 재생성'}
                                                            title={message.content.startsWith('❌') ? '재시도' : '응답 재생성'}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                color: 'inherit',
                                                                opacity: 0.7,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                            }}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                                                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {message.role === 'assistant' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="reaction-btn like-btn"
                                                                onClick={() => setMessageReaction(message.id, 'like')}
                                                                aria-label="좋아요"
                                                                title="좋은 응답"
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    color: message.reaction === 'like' ? 'var(--accent-success)' : 'inherit',
                                                                    opacity: message.reaction === 'like' ? 1 : 0.7,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill={message.reaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                                    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="reaction-btn dislike-btn"
                                                                onClick={() => setMessageReaction(message.id, 'dislike')}
                                                                aria-label="싫어요"
                                                                title="개선이 필요한 응답"
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    color: message.reaction === 'dislike' ? 'var(--accent-error)' : 'inherit',
                                                                    opacity: message.reaction === 'dislike' ? 1 : 0.7,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill={message.reaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                                    <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.082 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.076.237-.138.362a1.9 1.9 0 0 1 .234 1.734c-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.509c-.138.508-.55.848-1.012.964l-.261.065z" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                    {/* 이모지 반응 */}
                                                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                                                        {/* 현재 선택된 이모지들 */}
                                                        {(Object.entries(message.emojiReactions ?? {}) as [MsgEmojiReaction, boolean][])
                                                            .filter(([, active]) => active)
                                                            .map(([emoji]) => (
                                                                <button
                                                                    key={emoji}
                                                                    type="button"
                                                                    className="msg-emoji-reaction-chip"
                                                                    onClick={() => toggleEmojiReaction(message.id, emoji)}
                                                                    aria-label={`${emoji} 반응 취소`}
                                                                    title="클릭하여 취소"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))
                                                        }
                                                        <button
                                                            type="button"
                                                            className="msg-emoji-add-btn"
                                                            onClick={(e) => { e.stopPropagation(); setEmojiPickerMsgId(p => p === message.id ? null : message.id); }}
                                                            aria-label="이모지 반응 추가"
                                                            aria-expanded={emojiPickerMsgId === message.id}
                                                            title="이모지 반응"
                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', opacity: 0.6, fontSize: 14 }}
                                                        >
                                                            🙂+
                                                        </button>
                                                        {emojiPickerMsgId === message.id && (
                                                            <div className="msg-emoji-picker" role="dialog" aria-label="이모지 선택">
                                                                {MSG_EMOJI_REACTIONS.map(emoji => (
                                                                    <button
                                                                        key={emoji}
                                                                        type="button"
                                                                        className={`msg-emoji-picker-btn${message.emojiReactions?.[emoji] ? ' msg-emoji-picker-btn--active' : ''}`}
                                                                        onClick={(e) => { e.stopPropagation(); toggleEmojiReaction(message.id, emoji); setEmojiPickerMsgId(null); }}
                                                                        aria-label={emoji}
                                                                        aria-pressed={!!message.emojiReactions?.[emoji]}
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="bookmark-btn"
                                                        onClick={() => toggleBookmark(message.id)}
                                                        aria-label={message.bookmarked ? '북마크 해제' : '북마크'}
                                                        title={message.bookmarked ? '북마크 해제' : '북마크'}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: message.bookmarked ? 'var(--accent-warning)' : 'inherit',
                                                            opacity: message.bookmarked ? 1 : 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill={message.bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                                            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2z" />
                                                        </svg>
                                                    </button>
                                                    {/* 핀 버튼 */}
                                                    <button
                                                        type="button"
                                                        className="msg-pin-btn"
                                                        onClick={() => togglePinMessage(message.id)}
                                                        aria-label={message.pinned ? '핀 해제' : '메시지 핀 고정'}
                                                        title={message.pinned ? '핀 해제' : '상단에 핀 고정'}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            fontSize: 14,
                                                            color: message.pinned ? '#f59e0b' : 'inherit',
                                                            opacity: message.pinned ? 1 : 0.6,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M12 17s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z" />
                                                            <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
                                                        </svg>
                                                    </button>
                                                    {/* TTS 버튼 */}
                                                    <button
                                                        type="button"
                                                        className="tts-btn"
                                                        onClick={() => speakMessage(message.id, message.content)}
                                                        aria-label={speakingMessageId === message.id ? '읽기 중지' : '음성으로 읽기'}
                                                        title={speakingMessageId === message.id ? '읽기 중지' : '음성으로 읽기'}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: speakingMessageId === message.id ? 'var(--accent-info)' : 'inherit',
                                                            opacity: speakingMessageId === message.id ? 1 : 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        {speakingMessageId === message.id ? (
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                                                            </svg>
                                                        ) : (
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                                <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
                                                                <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
                                                                <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    {/* 메시지 복사 버튼 */}
                                                    <button
                                                        type="button"
                                                        className="copy-message-btn"
                                                        aria-label="메시지 복사"
                                                        onClick={async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(message.content);
                                                                showToast('복사되었습니다', 'success');
                                                            } catch {
                                                                // 복사 실패 시 무시
                                                            }
                                                        }}
                                                        title="메시지 복사"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: 'inherit',
                                                            opacity: 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                            <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
                                                        </svg>
                                                    </button>
                                                    {/* 메시지 삭제 버튼 */}
                                                    <button
                                                        type="button"
                                                        className="delete-message-btn"
                                                        onClick={() => requestDeleteMessage(message.id)}
                                                        aria-label="메시지 삭제"
                                                        title="메시지 삭제"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: 'inherit',
                                                            opacity: 0.7,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                                        </svg>
                                                    </button>
                                                    {showTimestamps && (
                                                        <div className="message-timestamp" aria-label={`메시지 전송 시간: ${formatDateSafe(message.timestamp, (d) => d.toLocaleString('ko-KR'), '')}`}>
                                                            <time dateTime={formatDateSafe(message.timestamp, (d) => d.toISOString(), '')}>
                                                                {formatDateSafe(message.timestamp, (d) => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), '')}
                                                            </time>
                                                        </div>
                                                    )}
                                                </fieldset>
                                            )}
                                        </div>
                                    </article>
                                    );
                                })
                            )}
                            {showScrollToTop && currentConversation.messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => scrollToTop('smooth')}
                                    aria-label="맨 위로 스크롤"
                                    title="맨 위로"
                                    data-testid={TEST_IDS.SCROLL_TO_TOP}
                                    style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        padding: '8px 12px',
                                        background: 'var(--accent-primary)',
                                        color: 'var(--on-accent)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        boxShadow: 'var(--shadow-card)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        zIndex: 'var(--z-base)',
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8 13a.5.5 0 0 1-.5-.5V4.707L4.354 7.854a.5.5 0 1 1-.708-.708l4-4a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1-.708.708L8.5 4.707V12.5a.5.5 0 0 1-.5.5z" />
                                    </svg>
                                    맨 위로
                                </button>
                            )}
                            {showScrollToBottom && currentConversation.messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => scrollToBottom('smooth')}
                                    aria-label="맨 아래로 스크롤"
                                    title="맨 아래로"
                                    data-testid={TEST_IDS.SCROLL_TO_BOTTOM}
                                    style={{
                                        position: 'absolute',
                                        bottom: 16,
                                        right: 16,
                                        padding: '8px 12px',
                                        background: 'var(--accent-primary)',
                                        color: 'var(--on-accent)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        boxShadow: 'var(--shadow-card)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        zIndex: 'var(--z-base)',
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M8 3a.5.5 0 0 1 .5.5v8.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 1 1 .708-.708L7.5 12.293V3.5A.5.5 0 0 1 8 3z" />
                                    </svg>
                                    맨 아래로
                                </button>
                            )}
                            {isLoading &&
                                !isStreaming &&
                                !currentConversation?.messages?.some(
                                    (m) =>
                                        m.role === 'assistant' &&
                                        isAssistantGenerationPlaceholder(m.content),
                                ) && (
                                <div
                                    className="message assistant-message genspark-qa-article"
                                    role="status"
                                    aria-live="polite"
                                    aria-busy="true"
                                    aria-label={ASSISTANT_PLACEHOLDER_DRAFT}
                                    data-testid={TEST_IDS.LOADING_INDICATOR}
                                >
                                    <div className="message-avatar" aria-hidden="true">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent-info-figma)" aria-hidden="true"><path d="M12 2a10 10 0 0 1 7.38 16.75 1 1 0 0 1-1.5-.75 8 8 0 1 0-11.76 0 1 1 0 0 1-1.5.75A10 10 0 0 1 12 2z"/></svg>
                                    </div>
                                    <div className="message-content">
                                        <output>
                                            <div className="genspark-qa-role-row">
                                                <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
                                            </div>
                                            <div className="message-text">
                                                <AssistantGensparkBody
                                                    text=""
                                                    embedded={gensparkAgentBodyEmbedded}
                                                    webSearch={composerGensparkStepUi.webSearch}
                                                    documentContext={composerGensparkStepUi.documentContext}
                                                />
                                                {responseStartTime ? (
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            color: themeStyles.textSecondary,
                                                            marginTop: 10,
                                                        }}
                                                    >
                                                        경과{' '}
                                                        {Math.floor(
                                                            (Date.now() - responseStartTime) / 1000,
                                                        )}
                                                        초
                                                    </div>
                                                ) : null}
                                            </div>
                                        </output>
                                    </div>
                                </div>
                            )}
                            </>
                            )}
                        </div>

                        {/* 대화 요약 모달 */}
                        {showSummaryModal && (
                            <div
                                className="bw-std-popup-overlay"
                                onClick={() => setShowSummaryModal(false)}
                                role="presentation"
                            >
                                <div
                                    className="bw-std-popup-panel bw-std-popup-panel--md"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="summary-modal-title"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="bw-std-popup-panel-header">
                                        <h2 id="summary-modal-title">대화 요약</h2>
                                        <button
                                            type="button"
                                            className="bw-std-popup-close"
                                            onClick={() => setShowSummaryModal(false)}
                                            aria-label="요약 모달 닫기"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="bw-std-popup-panel-body">
                                        {summaryLoading ? (
                                            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                                                요약 생성 중…
                                            </div>
                                        ) : (
                                            <pre style={{
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                                fontSize: '13px',
                                                lineHeight: 1.7,
                                                color: 'var(--text-primary)',
                                                background: 'var(--card-bg, #f8fafc)',
                                                borderRadius: '8px',
                                                padding: '14px',
                                                margin: 0,
                                            }}>
                                                {summaryText}
                                            </pre>
                                        )}
                                    </div>
                                    {!summaryLoading && summaryText && (
                                        <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-color)' }}>
                                            <button
                                                type="button"
                                                className="bw-btn-secondary"
                                                onClick={copySummary}
                                                style={{ fontSize: '12px' }}
                                            >
                                                복사
                                            </button>
                                            <button
                                                type="button"
                                                className="bw-btn-secondary"
                                                onClick={() => setShowSummaryModal(false)}
                                                style={{ fontSize: '12px' }}
                                            >
                                                닫기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 내보내기 옵션 모달 */}
                        {showExportModal && currentConversation && (
                            <div
                                className="bw-std-popup-overlay"
                                onClick={() => setShowExportModal(false)}
                                role="presentation"
                            >
                                <div
                                    className="bw-std-popup-panel bw-std-popup-panel--md"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="export-opts-title"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="bw-std-popup-panel-header">
                                        <h2 id="export-opts-title">내보내기 옵션</h2>
                                        <button type="button" className="bw-std-popup-close" onClick={() => setShowExportModal(false)} aria-label="닫기">×</button>
                                    </div>
                                    <div className="bw-std-popup-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px' }}>
                                        {/* 형식 */}
                                        <div>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>내보내기 형식</p>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {(['markdown', 'txt', 'html', 'json'] as const).map(f => (
                                                    <button
                                                        key={f}
                                                        type="button"
                                                        onClick={() => setExportFormat(f)}
                                                        style={{
                                                            padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                                                            border: exportFormat === f ? '1.5px solid var(--accent-primary, #6366f1)' : '1px solid var(--border-color, #e2e8f0)',
                                                            background: exportFormat === f ? 'rgba(99,102,241,0.1)' : 'transparent',
                                                            color: exportFormat === f ? 'var(--accent-primary, #6366f1)' : 'var(--text-secondary)',
                                                            fontWeight: exportFormat === f ? 700 : 400,
                                                        }}
                                                    >
                                                        {f === 'markdown' ? 'Markdown' : f === 'txt' ? 'TXT' : f === 'html' ? 'HTML' : 'JSON'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* 메타데이터 포함 */}
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                                            <input type="checkbox" checked={exportIncludeMeta} onChange={e => setExportIncludeMeta(e.target.checked)} style={{ accentColor: 'var(--accent-primary, #6366f1)' }} />
                                            <span>메타데이터 포함 (생성일, 메시지 수, 필터 정보)</span>
                                        </label>
                                        {/* 북마크만 */}
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                                            <input type="checkbox" checked={exportBookmarkedOnly} onChange={e => setExportBookmarkedOnly(e.target.checked)} disabled={bookmarkedMessages.length === 0} style={{ accentColor: 'var(--accent-primary, #6366f1)' }} />
                                            <span>북마크 메시지만 내보내기 {bookmarkedMessages.length > 0 ? `(${bookmarkedMessages.length}개)` : '(북마크 없음)'}</span>
                                        </label>
                                        {/* 기간 필터 */}
                                        <div>
                                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>날짜 범위 (선택)</p>
                                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <input type="date" value={exportDateFrom} onChange={e => setExportDateFrom(e.target.value)}
                                                    style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #fff)', color: 'var(--text-primary)' }} />
                                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>~</span>
                                                <input type="date" value={exportDateTo} onChange={e => setExportDateTo(e.target.value)}
                                                    style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #fff)', color: 'var(--text-primary)' }} />
                                                {(exportDateFrom || exportDateTo) && (
                                                    <button type="button" onClick={() => { setExportDateFrom(''); setExportDateTo(''); }}
                                                        style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>초기화</button>
                                                )}
                                            </div>
                                        </div>
                                        {/* 미리보기 */}
                                        <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', background: 'var(--card-bg, #f8fafc)', borderRadius: 8, padding: '8px 12px', margin: 0 }}>
                                            {(() => {
                                                let count = currentConversation.messages.length;
                                                if (exportBookmarkedOnly) count = Math.min(count, bookmarkedMessages.length);
                                                return `총 ${count}개 메시지 → ${exportFormat === 'markdown' ? '.md' : exportFormat === 'txt' ? '.txt' : exportFormat === 'html' ? '.html' : '.json'} 파일`;
                                            })()}
                                        </p>
                                    </div>
                                    <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border-color)' }}>
                                        <button type="button" className="bw-btn-secondary" onClick={() => setShowExportModal(false)} style={{ fontSize: 12 }}>취소</button>
                                        <button type="button" className="bw-btn-primary" onClick={runExportWithOptions} style={{ fontSize: 12 }}>내보내기</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 키보드 단축키 도움말 모달 */}
                        {showShortcutsHelp && (
                            <div
                                className="bw-std-popup-overlay"
                                onClick={() => setShowShortcutsHelp(false)}
                                role="presentation"
                            >
                                <div
                                    className="bw-std-popup-panel bw-std-popup-panel--md"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="shortcuts-modal-title"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="bw-std-popup-panel-header">
                                        <h2 id="shortcuts-modal-title">키보드 단축키</h2>
                                        <button
                                            ref={shortcutsCloseRef}
                                            type="button"
                                            className="bw-std-popup-close"
                                            onClick={() => setShowShortcutsHelp(false)}
                                            aria-label="단축키 도움말 닫기"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className="bw-std-popup-panel-body">
                                        <div className="bw-std-popup-shortcut-list">
                                        {[
                                            { keys: 'Ctrl/⌘ + N', desc: '새 대화 시작' },
                                            { keys: 'Ctrl/⌘ + /', desc: '사이드바 토글' },
                                            { keys: 'Ctrl/⌘ + F', desc: '대화 내 검색' },
                                            { keys: 'Ctrl/⌘ + E', desc: '대화 보내기' },
                                            { keys: 'Ctrl/⌘ + Shift + D', desc: '대화 복제' },
                                            { keys: 'Ctrl/⌘ + Shift + I', desc: '대화 가져오기' },
                                            { keys: '/ 또는 Ctrl/⌘ + L', desc: '입력창 포커스' },
                                            { keys: '?', desc: '이 도움말 열기' },
                                            { keys: 'Enter', desc: '메시지 전송' },
                                            { keys: 'Shift + Enter', desc: '줄바꿈' },
                                            { keys: '↑ / ↓', desc: '입력 히스토리 탐색' },
                                            { keys: 'Escape', desc: '단축키·검색·삭제 확인 등 모달 닫기 / 스트리밍 중지' },
                                        ].map((shortcut, idx) => (
                                            <div
                                                key={idx}
                                                className="bw-std-popup-shortcut-row"
                                            >
                                                <span>{shortcut.desc}</span>
                                                <kbd className="bw-std-popup-kbd">{shortcut.keys}</kbd>
                                            </div>
                                        ))}
                                        </div>
                                        <div className="bw-std-popup-tips">
                                            <div className="bw-std-popup-tips-title">프로젝트·대화 팁</div>
                                            <ul>
                                                <li>대화를 사이드바에서 프로젝트 폴더로 <strong>드래그</strong>하면 해당 프로젝트로 이동합니다.</li>
                                                <li>사이드바 대화 줄의 <strong>휴지통</strong> 또는 채팅 헤더 <strong>대화 삭제</strong>로 스레드를 제거할 수 있습니다.</li>
                                                <li>프로젝트 <strong>편집</strong>에서 파일을 추가하면 대화 시 맥락으로 활용할 수 있습니다.</li>
                                                <li>프로젝트 <strong>지침</strong>을 설정하면 해당 프로젝트 대화의 톤·형식을 맞출 수 있습니다.</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="bw-std-popup-footer-hint">
                                        ESC 또는 바깥 클릭으로 닫기
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                    ) : (
                    <>
                            {currentProject ? (
                                <div
                                    id="project-content-panel"
                                    role="tabpanel"
                                    aria-labelledby={projectContentTab === 'sources' ? 'tab-sources-top' : 'tab-chat-top'}
                                    aria-live={projectContentTab === 'sources' ? 'off' : 'polite'}
                                    aria-atomic="false"
                                    className={`messages-container project-welcome-tabpanel chat-main-stage__scroll chat-welcome-scroll${projectContentTab === 'sources' ? '' : ' genspark-chat-messages-wrap'}`}
                                    style={{
                                        flex: 1,
                                        minHeight: 0,
                                        overflowY: 'auto',
                                        WebkitOverflowScrolling: 'touch',
                                    }}
                                    tabIndex={-1}
                                    ref={messagesContainerRef}
                                    data-testid={TEST_IDS.MESSAGES_CONTAINER}
                                >
                                    {projectContentTab === 'sources' ? (
                                        projectSourcesPanelSection
                                    ) : (
                                        <WelcomeWorkspacePanel showHero={!compactWorkspaceWelcome} />
                                    )}
                                </div>
                            ) : (
                                <div
                                    className="messages-container genspark-chat-messages-wrap chat-main-stage__scroll chat-welcome-scroll"
                                    style={{
                                        flex: 1,
                                        minHeight: 0,
                                        overflowY: 'auto',
                                        WebkitOverflowScrolling: 'touch',
                                    }}
                                    tabIndex={-1}
                                    ref={messagesContainerRef}
                                    data-testid={TEST_IDS.MESSAGES_CONTAINER}
                                >
                                    <WelcomeWorkspacePanel showHero={!compactWorkspaceWelcome} />
                                </div>
                            )}
                    </>
                    )}
                        {currentProject && hasProjectGuidance && (
                            <p className="bw-project-guidance-hint" role="status">
                                이 프로젝트의 지침·규칙이 답변에 적용됩니다. (논리·형식은 설정한 대로 반영됩니다)
                            </p>
                        )}
                        {projectSourcesTabInputHint}
                        <ChatInputDock
                            composer={chatWorkspaceComposer}
                            variant={currentConversation ? 'conversation' : 'welcome'}
                        >
                            {currentConversation ? (
                            <>
                            <details className="generation-advanced-options">
                                <summary className="generation-advanced-summary">
                                    고급 생성 옵션 · 모드 {outputPresetLabel} · 다양성 {answerDiversityLabel}
                                </summary>

                                <div className="brainwave-style-bar">
                                    <button
                                        type="button"
                                        onClick={() => setShowStyleOptions(!showStyleOptions)}
                                        aria-label={`응답 스타일: ${CHAT_RESPONSE_STYLE_LONG_KO[responseStyle]}`}
                                        title="응답 스타일 선택"
                                        className="brainwave-style-trigger"
                                        aria-expanded={showStyleOptions}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M2.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .75.434l5.5-3.143a.5.5 0 0 1 .5 0l5.5 3.143A.5.5 0 0 0 14 14.5v-13a.5.5 0 0 0-.5-.5h-11z" />
                                        </svg>
                                        {CHAT_RESPONSE_STYLE_LONG_KO[responseStyle]}
                                        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" className="brainwave-chevron">
                                            <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                        </svg>
                                    </button>
                                    {perspective && (
                                        <span className="brainwave-perspective-badge">
                                            {CHAT_PERSPECTIVE_LABEL_KO[perspective]}
                                            <button
                                                type="button"
                                                onClick={() => setPerspective(null)}
                                                aria-label="관점 선택 해제"
                                            >×</button>
                                        </span>
                                    )}
                                </div>

                                {showStyleOptions && (
                                    <div className="brainwave-style-panel">
                                    <div className="brainwave-style-panel-section">
                                        <div className="brainwave-style-label">응답 길이</div>
                                        <div className="brainwave-style-options">
                                            {CHAT_RESPONSE_STYLES.map((style) => (
                                                <button
                                                    key={style}
                                                    type="button"
                                                    onClick={() => { setResponseStyle(style); }}
                                                    aria-label={`${CHAT_RESPONSE_STYLE_SHORT_KO[style]} 스타일 선택`}
                                                    aria-pressed={responseStyle === style}
                                                    className={`brainwave-style-option-btn ${responseStyle === style ? 'active' : ''}`}
                                                >
                                                    {CHAT_RESPONSE_STYLE_SHORT_KO[style]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="brainwave-style-panel-section">
                                        <div className="brainwave-style-label">응답 관점 (선택사항)</div>
                                        <div className="brainwave-style-options">
                                            {CHAT_PERSPECTIVES.map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setPerspective(perspective === p ? null : p)}
                                                    aria-label={`${CHAT_PERSPECTIVE_LABEL_KO[p]} 관점 선택`}
                                                    aria-pressed={perspective === p}
                                                    className={`brainwave-style-option-btn ${perspective === p ? 'active-success' : ''}`}
                                                >
                                                    {CHAT_PERSPECTIVE_LABEL_KO[p]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                )}

                                <div className="generation-preset-bar" role="group" aria-label="생성 형식 프리셋">
                                <span className="generation-preset-label">생성 모드</span>
                                {[
                                    { id: 'auto', label: '자동' },
                                    { id: 'question-bank', label: '질문은행' },
                                    { id: 'requirements', label: '요구사항' },
                                    { id: 'minutes', label: '회의록' },
                                    { id: 'checklist', label: '체크리스트' },
                                    { id: 'risk-matrix', label: '리스크표' },
                                ].map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        className={`generation-preset-btn ${outputPreset === preset.id ? 'active' : ''}`}
                                        onClick={() => setOutputPreset(preset.id as OutputPreset)}
                                        aria-pressed={outputPreset === preset.id}
                                        aria-label={`${preset.label} 생성 모드 선택`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                <span className="generation-preset-hint">
                                    {outputPresetDetail}
                                    {isUrbanDomainProject ? ' · 도시정비 특화 규칙 적용' : ''}
                                </span>
                                </div>
                                <div className="generation-variation-bar" role="group" aria-label="답변 다양성 모드">
                                <span className="generation-preset-label">답변 다양성</span>
                                {[
                                    { id: 'stable', label: '안정' },
                                    { id: 'varied', label: '다양' },
                                    { id: 'exploratory', label: '탐색' },
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        className={`generation-preset-btn ${answerDiversityMode === mode.id ? 'active' : ''}`}
                                        onClick={() => setAnswerDiversityMode(mode.id as AnswerDiversityMode)}
                                        aria-pressed={answerDiversityMode === mode.id}
                                        aria-label={`${mode.label} 답변 다양성 모드 선택`}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                                <span className="generation-preset-hint">
                                    같은 질문에서도 관점/예시/구조 변주를 자동 적용합니다.
                                </span>
                                </div>
                                <div className="generation-variation-bar" role="group" aria-label="질문과 요구사항 도우미">
                                <span className="generation-preset-label">질문+요구 도우미</span>
                                <button
                                    type="button"
                                    className={`generation-preset-btn ${structuredInputAssistEnabled ? 'active' : ''}`}
                                    onClick={() => setStructuredInputAssistEnabled(true)}
                                    aria-pressed={structuredInputAssistEnabled}
                                    aria-label="질문과 요구사항 도우미 켜기"
                                >
                                    켜짐
                                </button>
                                <button
                                    type="button"
                                    className={`generation-preset-btn ${!structuredInputAssistEnabled ? 'active' : ''}`}
                                    onClick={() => setStructuredInputAssistEnabled(false)}
                                    aria-pressed={!structuredInputAssistEnabled}
                                    aria-label="질문과 요구사항 도우미 끄기"
                                >
                                    꺼짐
                                </button>
                                <span className="generation-preset-hint">
                                    입력의 질문/요구사항 자동 인식·보정·미리보기 기능을 제어합니다.
                                </span>
                                </div>
                                <div className="generation-variation-bar" role="group" aria-label="글쓰기 스타일 학습">
                                <span className="generation-preset-label">문체 학습</span>
                                <button
                                    type="button"
                                    className={`generation-preset-btn ${writingStyleProfile.enabled ? 'active' : ''}`}
                                    onClick={() => setWritingStyleProfile((prev) => ({
                                        ...prev,
                                        enabled: !prev.enabled,
                                        updatedAt: new Date().toISOString(),
                                    }))}
                                    aria-pressed={writingStyleProfile.enabled}
                                >
                                    {writingStyleProfile.enabled ? 'ON' : 'OFF'}
                                </button>
                                <button
                                    type="button"
                                    className="generation-preset-btn"
                                    onClick={() => saveInputAsWritingStyleAnchor(input)}
                                    aria-label="현재 입력을 문체 샘플로 저장"
                                >
                                    현재 입력을 샘플로 저장
                                </button>
                                <button
                                    type="button"
                                    className="generation-preset-btn"
                                    onClick={() => setWritingStyleProfile({
                                        enabled: writingStyleProfile.enabled,
                                        anchors: [],
                                        learnedSignals: [],
                                        snapshots: [],
                                        updatedAt: new Date().toISOString(),
                                    })}
                                    aria-label="문체 학습 데이터 초기화"
                                >
                                    학습 초기화
                                </button>
                                <button
                                    type="button"
                                    className="generation-preset-btn"
                                    onClick={() => saveWritingStyleSnapshot()}
                                    aria-label="현재 문체 버전 저장"
                                >
                                    문체 버전 저장
                                </button>
                                <span className="generation-preset-hint">
                                    샘플 {writingStyleProfile.anchors.length}개 · 학습신호 {writingStyleProfile.learnedSignals.length}개 · 일치도 {writingStyleMatchScore}점
                                </span>
                                {writingStyleProfile.snapshots.length > 0 && (
                                    <div className="generation-style-version-list">
                                        {writingStyleProfile.snapshots.map((snapshot) => (
                                            <div key={snapshot.id} className="generation-style-version-item">
                                                <button
                                                    type="button"
                                                    className="generation-preset-btn"
                                                    onClick={() => restoreWritingStyleSnapshot(snapshot.id)}
                                                    aria-label={`문체 버전 복원: ${snapshot.label}`}
                                                >
                                                    {snapshot.label}
                                                </button>
                                                <label className="generation-style-compare-check">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedStyleSnapshotCompareIds.includes(snapshot.id)}
                                                        onChange={() => toggleStyleSnapshotCompareSelection(snapshot.id)}
                                                    />
                                                    비교
                                                </label>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="generation-preset-btn"
                                            onClick={generateStyleSnapshotComparePrompt}
                                        >
                                            버전 비교 생성
                                        </button>
                                        <button
                                            type="button"
                                            className="generation-preset-btn"
                                            onClick={copyStyleSnapshotComparePrompt}
                                            disabled={!styleSnapshotComparePrompt}
                                        >
                                            비교 프롬프트 복사
                                        </button>
                                        {recommendedStyleSnapshot && (
                                            <button
                                                type="button"
                                                className="generation-preset-btn active"
                                                onClick={() => restoreWritingStyleSnapshot(recommendedStyleSnapshot.id)}
                                            >
                                                추천 버전 적용: {recommendedStyleSnapshot.label}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {styleSnapshotComparePrompt && (
                                    <textarea
                                        className="generation-style-compare-prompt"
                                        value={styleSnapshotComparePrompt}
                                        readOnly
                                        aria-label="문체 버전 비교 프롬프트"
                                    />
                                )}
                                </div>
                            </details>
                            </>
                            ) : null}
                            {inputDockSuggestionsEl}
                            {conversationGraphAttachedFileEl}
                            {conversationGraphHandoffBannerEl}
                        </ChatInputDock>
                            </div>
                        </div>
                )}
            </main>

            {/* 노트북 설정 모달 (Phase 4) */}
            {showProjectEditModal && (
                <React.Suspense fallback={null}>
                    <ProjectEditModal
                        isOpen={showProjectEditModal}
                        onClose={closeProjectEditModal}
                        onDraftChange={(draft) => {
                            if (!currentProject?.id) return;
                            setCurrentProject((prev) =>
                                prev
                                    ? {
                                          ...prev,
                                          name: draft.name,
                                          description: draft.description,
                                      }
                                    : null,
                            );
                        }}
                        projectId={currentProject?.id ?? null}
                        currentProject={currentProject ? { id: currentProject.id, name: currentProject.name, description: currentProject.description, tags: currentProject.tags ?? [] } : null}
                        focusTarget={projectEditFocusTarget}
                        onSaved={async (updated) => {
                            setProjects((prev) =>
                                prev.map((p) =>
                                    p.id === updated.id
                                        ? {
                                            ...p,
                                            name: updated.name,
                                            description: updated.description || '',
                                            instructions: updated.instructions ?? p.instructions,
                                            tags: updated.tags ?? p.tags ?? [],
                                            files: updated.files ?? p.files ?? [],
                                            webSources: updated.webSources ?? p.webSources ?? [],
                                            initialGuidelines: updated.initialGuidelines ?? p.initialGuidelines ?? [],
                                            source_count: typeof updated.source_count === 'number'
                                                ? updated.source_count
                                                : ((updated.files?.length ?? p.files?.length ?? 0) + (updated.webSources?.length ?? p.webSources?.length ?? 0)),
                                        }
                                        : p
                                )
                            );
                            if (currentProject?.id === updated.id) {
                                setCurrentProject((prev) =>
                                    prev
                                        ? {
                                            ...prev,
                                            name: updated.name,
                                            description: updated.description || '',
                                            instructions: updated.instructions ?? prev.instructions,
                                            tags: updated.tags ?? prev.tags ?? [],
                                            files: updated.files ?? prev.files ?? [],
                                            webSources: updated.webSources ?? prev.webSources ?? [],
                                            initialGuidelines: updated.initialGuidelines ?? prev.initialGuidelines ?? [],
                                            source_count: typeof updated.source_count === 'number'
                                                ? updated.source_count
                                                : ((updated.files?.length ?? prev.files?.length ?? 0) + (updated.webSources?.length ?? prev.webSources?.length ?? 0)),
                                        }
                                        : null
                                );
                            }
                            showToast('설정이 저장되었습니다', 'success');
                            // 자료 업로드 반영: 서버에서 최신 프로젝트(파일 목록 포함) 재조회
                            const refreshed = await projectService.getProject(updated.id);
                            if (refreshed) {
                                const withDates = {
                                    ...refreshed,
                                    createdAt: safeDate(refreshed.createdAt),
                                    updatedAt: safeDate(refreshed.updatedAt),
                                    files: Array.isArray(refreshed.files) ? refreshed.files : [],
                                    webSources: Array.isArray(refreshed.webSources) ? refreshed.webSources : [],
                                };
                                setProjects((prev) => prev.map((p) => (p.id === refreshed.id ? withDates : p)));
                                if (currentProject?.id === refreshed.id) {
                                    setCurrentProject(withDates);
                                    projectBeforeEditRef.current = withDates;
                                }
                            } else if (currentProject?.id === updated.id) {
                                const merged = {
                                    ...currentProject,
                                    name: updated.name,
                                    description: updated.description || '',
                                };
                                projectBeforeEditRef.current = merged;
                            }
                        }}
                        onDelete={async (projectId) => {
                            try {
                                await projectService.deleteProject(projectId);
                                setProjects((prev) => prev.filter((p) => p.id !== projectId));
                                setConversations((prev) => prev.filter((c) => c.projectId !== projectId));
                                if (currentProject?.id === projectId) {
                                    setCurrentProject(null);
                                    setCurrentConversation(null);
                                    setShowProjectEditModal(false);
                                    navigate('/projects');
                                }
                                showToast('프로젝트가 삭제되었습니다', 'success');
                            } catch (err) {
                                errorLogger.error('프로젝트 삭제 실패', err instanceof Error ? err : new Error(String(err)), { component: 'ChatGPTInterface', action: 'onDelete' });
                                showToast('프로젝트 삭제에 실패했습니다.', 'error');
                            }
                        }}
                    />
                </React.Suspense>
            )}

            {/* 소스 추가 모달 (프로젝트 플로우: 드래그·업로드·텍스트·드라이브·Slack) */}
            {showAddSourceModal && (
                <React.Suspense fallback={null}>
                    <AddSourceModal
                        isOpen={showAddSourceModal}
                        onClose={() => { setShowAddSourceModal(false); focusChatInput(); }}
                        onUploadClick={() => {
                            setShowAddSourceModal(false);
                            openProjectEditModal();
                        }}
                        onTextInputClick={() => {
                            setShowAddSourceModal(false);
                            openProjectEditModal();
                        }}
                        onWebUrlSubmit={
                            currentProject?.id
                                ? (url) => {
                                      void handleAddWebSourceUrl(url);
                                  }
                                : undefined
                        }
                        busy={sourceFilesUploading}
                        onGoogleDriveClick={() => {
                            if (!currentProject?.id) {
                                showToast('프로젝트를 선택한 뒤 Google Drive에서 소스를 추가할 수 있습니다.', 'info');
                                setShowAddSourceModal(false);
                                navigate(INTEGRATIONS_PATH);
                                return;
                            }
                            setShowAddSourceModal(false);
                            setShowGoogleDriveImportModal(true);
                        }}
                        onSlackClick={() => navigate(INTEGRATIONS_PATH)}
                        onFilesSelected={currentProject?.id ? handleAddSourceFiles : undefined}
                    />
                </React.Suspense>
            )}

            {currentProject && showGoogleDriveImportModal && (
                <React.Suspense fallback={null}>
                    <GoogleDriveNotebookImportDialog
                        open={showGoogleDriveImportModal}
                        projectId={currentProject.id}
                        onClose={() => { setShowGoogleDriveImportModal(false); focusChatInput(); }}
                        onSuccess={handleGoogleDriveNotebookImportSuccess}
                    />
                </React.Suspense>
            )}

            {/* 노트북 공유 모달 (Phase 4) */}
            {currentProject && showShareModal && (
                <React.Suspense fallback={null}>
                    <ProjectShareDialog
                        open={showShareModal}
                        onClose={() => { setShowShareModal(false); focusChatInput(); }}
                        projectId={currentProject.id}
                        projectName={currentProject.name}
                    />
                </React.Suspense>
            )}

            {/* PRO 구독 안내 모달 */}
            {showProModal && (
                <div
                    className="bw-std-popup-overlay"
                    onClick={() => { setShowProModal(false); focusChatInput(); }}
                    role="presentation"
                >
                    <div
                        className="bw-std-popup-panel bw-std-popup-panel--pro"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="pro-modal-title"
                    >
                        <div className="bw-std-popup-panel-header">
                            <h2 id="pro-modal-title">PRO 구독</h2>
                        </div>
                        <div className="bw-std-popup-panel-body">
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                PRO 구독 시 제공될 예정 기능입니다.
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                <li>고급 모델 접근 (GPT-4, Claude 등)</li>
                                <li>무제한 노트북·소스</li>
                                <li>우선 지원</li>
                            </ul>
                            <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
                                플랜·결제는 구독 화면에서 확인할 수 있습니다.
                            </p>
                            <div className="bw-std-popup-actions">
                                <button
                                    type="button"
                                    className="bw-std-popup-btn-secondary"
                                    onClick={() => { setShowProModal(false); focusChatInput(); }}
                                    aria-label="PRO 모달 닫기"
                                >
                                    닫기
                                </button>
                                <button
                                    type="button"
                                    className="bw-std-popup-btn-primary"
                                    onClick={() => {
                                        setShowProModal(false);
                                        navigate(BILLING_PATH);
                                        focusChatInput();
                                    }}
                                    aria-label="구독 및 결제 화면으로 이동"
                                >
                                    구독·결제
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 프로젝트 생성 모달 */}
            {showProjectModal && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="프로젝트 생성 모달"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowProjectModal(false);
                            focusChatInput();
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setShowProjectModal(false);
                            focusChatInput();
                        }
                    }}
                >
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>새 프로젝트 생성</h2>
                        <input
                            type="text"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value.slice(0, 100))}
                            placeholder="프로젝트 이름 (2~100자)"
                            aria-label="프로젝트 이름"
                            maxLength={100}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && coerceTrimmedString(newProjectName, '').length >= 2) {
                                    void createNewProject();
                                } else if (e.key === 'Escape') {
                                    setShowProjectModal(false);
                                    setNewProjectName('');
                                    focusChatInput();
                                }
                            }}
                            autoFocus
                        />
                        {newProjectName.length > 0 && coerceTrimmedString(newProjectName, '').length < 2 && (
                            <p style={{ color: 'var(--color-error, #ef4444)', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>
                                프로젝트 이름은 최소 2자 이상 입력해주세요.
                            </p>
                        )}
                        <div className="modal-content-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowProjectModal(false);
                                    setNewProjectName('');
                                    focusChatInput();
                                }}
                                aria-label="프로젝트 생성 취소"
                                style={{ padding: '8px 16px', border: '1px solid var(--sidebar-dark-border-strong)', borderRadius: '4px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={() => void createNewProject()}
                                disabled={coerceTrimmedString(newProjectName, '').length < 2}
                                aria-label="프로젝트 생성"
                                title={coerceTrimmedString(newProjectName, '').length < 2 ? '프로젝트 이름을 2자 이상 입력하세요' : undefined}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    background: coerceTrimmedString(newProjectName, '').length >= 2 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    color: 'var(--on-accent)',
                                    cursor: coerceTrimmedString(newProjectName, '').length >= 2 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 프로젝트 삭제 확인 모달 */}
            {deleteConfirmProject && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="프로젝트 삭제 확인 모달"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) cancelDeleteProject();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelDeleteProject();
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
                            프로젝트 삭제
                        </h2>
                        <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                            다음 프로젝트(노트북)를 삭제하시겠습니까?
                        </p>
                        <p style={{
                            margin: '0 0 20px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            fontWeight: 500,
                            padding: '12px',
                            background: 'var(--sidebar-dark-hover)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            📁 {deleteConfirmProject.name}
                        </p>
                        <p style={{ margin: '0 0 20px', color: 'var(--accent-error)', fontSize: '12px' }}>
                            관련 대화와 소스도 함께 삭제되며 되돌릴 수 없습니다.
                        </p>
                        <div className="modal-content-actions">
                            <button
                                ref={projectDeleteCancelRef}
                                type="button"
                                onClick={cancelDeleteProject}
                                aria-label="프로젝트 삭제 취소"
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteProject}
                                aria-label="프로젝트 삭제 확인"
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'var(--accent-error)',
                                    color: 'var(--on-accent)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 메시지 삭제 확인 모달 */}
            {deleteConfirmMessageId && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="메시지 삭제 확인"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setDeleteConfirmMessageId(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setDeleteConfirmMessageId(null);
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
                            메시지 삭제
                        </h2>
                        <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                            이 메시지를 삭제하시겠습니까?
                        </p>
                        <div className="modal-content-actions">
                            <button
                                ref={messageDeleteCancelRef}
                                type="button"
                                onClick={() => setDeleteConfirmMessageId(null)}
                                aria-label="메시지 삭제 취소"
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteMessage}
                                aria-label="메시지 삭제 확인"
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'var(--accent-error)',
                                    color: 'var(--on-accent)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 메시지 전체 삭제 확인 모달 */}
            {showClearMessagesConfirm && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="메시지 전체 삭제 확인"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowClearMessagesConfirm(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setShowClearMessagesConfirm(false);
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
                            메시지 전체 삭제
                        </h2>
                        <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                            현재 대화의 모든 메시지를 삭제하시겠습니까?
                        </p>
                        <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            대화 자체는 유지됩니다.
                        </p>
                        <div className="modal-content-actions">
                            <button
                                ref={clearMessagesCancelRef}
                                type="button"
                                onClick={() => setShowClearMessagesConfirm(false)}
                                aria-label="전체 삭제 취소"
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={confirmClearMessages}
                                aria-label="메시지 전체 삭제 확인"
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'var(--accent-error)',
                                    color: 'var(--on-accent)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* 대화 삭제 확인 모달 */}
            {deleteConfirmConversation && (
                <dialog
                    className="modal-overlay"
                    open
                    aria-modal="true"
                    aria-label="대화 삭제 확인 모달"
                    onCancel={(e) => {
                        e.preventDefault();
                        cancelDeleteConversation();
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            cancelDeleteConversation();
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            cancelDeleteConversation();
                        }
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>
                            대화 삭제
                        </h2>
                        <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                            다음 대화를 삭제하시겠습니까?
                        </p>
                        <p style={{
                            margin: '0 0 20px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            fontWeight: 500,
                            padding: '12px',
                            background: 'var(--sidebar-dark-hover)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            "{deleteConfirmConversation.title}"
                        </p>
                        <p style={{ margin: '0 0 20px', color: 'var(--accent-error)', fontSize: '12px' }}>
                            이 작업은 되돌릴 수 없습니다.
                        </p>
                        <div className="modal-content-actions">
                            <button
                                ref={chatDeleteConversationCancelRef}
                                type="button"
                                onClick={cancelDeleteConversation}
                                aria-label="대화 삭제 취소"
                                data-testid={TEST_IDS.CHAT_DELETE_CONVERSATION_CANCEL}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid var(--sidebar-dark-border-strong)',
                                    borderRadius: '6px',
                                    background: 'transparent',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteConversation}
                                aria-label="대화 삭제 확인"
                                data-testid={TEST_IDS.CHAT_DELETE_CONVERSATION_CONFIRM}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    background: 'var(--accent-error)',
                                    color: 'var(--on-accent)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

        </div>
    );
};

export default ChatGPTInterface;

