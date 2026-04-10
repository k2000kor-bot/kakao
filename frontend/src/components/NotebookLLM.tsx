/**
 * 노트북(딥시크) 컴포넌트
 * 프로젝트별 학습·소스 기반 답변 화면. 실제 답변 생성은 백엔드의 딥시크(DeepSeek) 등 LLM이 수행.
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AssistantGensparkBody } from './genspark/AssistantGensparkBody';
import notebookLLMService, {
  searchDomainKnowledge as searchDomainKnowledgeService,
  getDomainFAQs,
  getDomainExamples,
  generateDomainInsights,
  buildResponseFormatInstructions,
  getBylawsSuggestedPrompts,
  getDomainPromptTemplates,
  getDomainRelationGraph,
  buildIntelligentContext,
  DOMAIN_TYPE_TO_KO,
} from '../services/notebookLLMService';
import { projectService } from '../services/projectService';
import type {
  NotebookLLMConfig,
  NotebookLLMStatus,
  NotebookLLMResponse,
} from '../services/notebookLLMService';
import notebookLLMStreamingService from '../services/notebookLLMStreamingService';
import notebookLLMDeepLearningIntegration, {
  type PromptDLAnalysis,
  type ResponseDLAnalysis,
  buildMessageToSendForChat,
} from '../services/notebookLLMDeepLearningIntegration';
import conversationHistoryService from '../services/conversationHistoryService';
import {
  normalizeChatTurnsForApiMerge,
  type ChatTurn,
} from '../services/modernChatContextBuilder';
import promptTemplateService from '../services/promptTemplateService';
import writingStyleService from '../services/writingStyleService';
import toneService, { ToneType, AgeGroup, ToneConfig } from '../services/toneService';
import domainKnowledgeService, { DomainType } from '../services/domainKnowledgeService';
import { associationBylawsService } from '../services/associationBylawsService';
import { NOTEBOOK_LLM_CONFIG_EXPANDED_UI_STORAGE_KEY } from '../services/notebookLLMStorageKeys';
import { errorLogger } from '../utils/errorLogger';
import { getUserFriendlyError, isValidHttpUrl } from '../utils/errorMessages';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL } from '../config/api';
import WebResearchModal from './WebResearchModal';
import DeepResearchModal from './DeepResearchModal';
import LoadingSkeleton from './LoadingSkeleton';
import WritingStyleSelector from './WritingStyleSelector';
import RealEstateDataPanel from './RealEstateDataPanel';
import { expandInput } from '../services/questionRequirementExpander';
import {
  getInnovativeWritingInstructionBlock,
  MULTI_PERSPECTIVE_RESPONSE_INSTRUCTION,
} from '../services/generationPromptBuilder';
import {
  cleanResponseText,
  coerceTrimmedString,
  extractPipelineMessageExtrasFromChatResponse,
  getAssistantGenerationPhase,
  hasPipelineExtras,
  isAssistantGenerationPlaceholder,
  scheduleAssistantPreRevealStreamPhases,
  scheduleAssistantNonStreamLoadingPhaseTimers,
  runAssistantNonStreamPostResponsePhases,
  ASSISTANT_PLACEHOLDER_ANALYZING,
  ASSISTANT_GENSPARK_QA_BADGE_ANSWER,
} from '../utils/chatInputUtils';
import { BookOpen } from 'lucide-react';
import './NotebookLLM.css';
// MindMapData는 임시로 로컬 타입으로 정의
interface MindMapData {
  nodes: Array<{ id: string; label: string; type?: string }>;
  edges: Array<{ source: string; target: string; type?: string }>;
}
// 부동산 데이터 컨텍스트용 최소 타입
interface TransactionData {
  transactionType: string;
  propertyType: string;
  address: { sido: string; sigungu: string; dong: string };
  price: { amount: number };
  area: { exclusive: number };
  transactionDate: string;
  floor?: { current: number; total: number };
}
interface RegistryData {
  changeType: string;
  propertyAddress: { sido: string; sigungu: string; dong: string };
  changeDate: string;
  previousOwner?: { name: string; share: string };
  newOwner?: { name: string; share: string };
  mortgageInfo?: { creditor: string; amount: number };
  leaseInfo?: { lessee: string; deposit: number };
}

interface DetectedDomain { domain: string; confidence: number; matchedKeywords?: string[] }
// detectRelevantDomains 임시 구현
const detectRelevantDomains = (prompt: string): DetectedDomain[] => {
  const domains: DetectedDomain[] = [];
  const promptLower = prompt.toLowerCase();

  // 기본 도메인 키워드 매칭
  const domainKeywords: Record<string, string[]> = {
    '도시정비': ['재개발', '재건축', '정비구역', '조합', '도시정비법', '조합분양', '분담금', '청산금', '건축심의', '시공사선정', '입찰공고', '현장설명회', '합동설명회', '나라장터', '정비사업정보시스템', '조합 업무정리', '조합장', '이사회', '사무국', '조합원총회', '대의원회', '업무규정', '의사록', '회의록', '업무분장', '정보몽땅', '정비사업 정보몽땅', '클린업시스템', 'e-조합', '정관', '조합정관', '현장별 정관'],
    '세무': ['세금', '소득세', '양도세', '종합부동산세', '국세'],
    '법무': ['계약', '소유권', '등기', '법률', '민사', '변호사'],
    '건축법': ['건축', '건축허가', '용적률', '건폐율'],
    '서울시행정': ['서울시', '조례', '행정', '인허가'],
    '형사': ['형사', '형법', '형사소송', '형사수사기법', '수사기법', '압수수색', '피의자신문', '참고인조사'],
    '계약': ['계약서', '계약업무', '계약검토'],
    '회계': ['회계', '재무제표', '회계사'],
    '금융': ['대출', 'LTV', 'DTI', '금융'],
    '부동산정책': ['부동산정책', '정책', '대책', '정책 모니터링', '시기별 정책', '7.10', '2.4', '3.23'],
    '감정평가': ['감정평가', '시가', '평가'],
    '대법원판례': ['판례', '대법원', '법원 판결', '판결', '선례', '법리', '고등법원', '지방법원'],
  };

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(keyword => promptLower.includes(keyword))) {
      domains.push({
        domain,
        confidence: 0.7,
        matchedKeywords: keywords.filter(k => promptLower.includes(k)),
      });
    }
  }

  return domains;
};

// notebookLLMService 연동 (searchDomainKnowledge는 네이밍 충돌 방지를 위해 서비스 호출로 사용)
const searchDomainKnowledge = (query: string, domains?: string[]) =>
  searchDomainKnowledgeService(query, domains);
const getTermDefinition = (_term: string): unknown[] => [];
const getDomainDetail = (_domainKey: string): unknown => null;
const validateDomainKnowledge = (_domainKey: string): unknown => null;
const getExpertModeConfig = (_domain: string): unknown => null;
const setExpertModeConfig = (_config: Record<string, unknown>): void => { };
const getDomainUsageStats = (): unknown[] => [];
const getKnowledgeHistory = (): unknown[] => [];

const STUDIO_TYPE_LABELS: Record<string, string> = {
  report: '보고서',
  study_guide: '학습 가이드',
  quiz: '퀴즈',
  summary: '요약',
  flashcards: '플래시카드',
  video_overview: '동영상 개요',
  mindmap: '마인드맵',
  infographic: '인포그래픽',
  slides: '슬라이드',
  data_table: '데이터 표',
};

/** 지식 마인드맵: 도메인 노드를 시각화 (선택 도메인 기반) */
const MindMap: React.FC<{ data: MindMapData; onNodeClick: (node: unknown) => void; onNodeSelect: (node: string | null) => void; width: number; height: number; interactive: boolean }> = ({ data, onNodeClick, onNodeSelect, interactive }) => {
  if (!data?.nodes?.length) {
    return (
      <div className="mindmap-empty" role="status" aria-label="선택된 도메인이 없습니다">
        <p>도메인 지식을 선택하면 여기에 표시됩니다. 왼쪽 설정에서 도메인을 선택해 주세요.</p>
      </div>
    );
  }
  return (
    <div className="mindmap-content">
      <div className="mindmap-nodes-grid" role="list" aria-label="도메인 지식 노드">
        {data.nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className="mindmap-node"
            onClick={() => {
              if (interactive) {
                onNodeClick(node);
                onNodeSelect(node.id);
              }
            }}
            role="listitem"
            aria-label={`도메인: ${node.label}`}
            title={node.type === 'domain' ? `도메인: ${node.label}` : node.label}
          >
            <span className="mindmap-node-icon">{node.type === 'domain' ? '📚' : '•'}</span>
            <span className="mindmap-node-label">{node.label}</span>
          </button>
        ))}
      </div>
      {data.edges?.length ? (
        <div className="mindmap-edges" role="list" aria-label="도메인 간 연결">
          <h5>관련 도메인</h5>
          <ul className="mindmap-edges-list">
            {data.edges.map((e, i) => (
              <li key={`${e.source}-${e.target}-${i}`}>
                <span className="mindmap-edge-source">{e.source}</span>
                <span className="mindmap-edge-arrow" aria-hidden>↔</span>
                <span className="mindmap-edge-target">{e.target}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

interface NotebookLLMProps {
  /**
   * 프로젝트 ID (프로젝트별 노트북인 경우)
   */
  projectId?: string;

  /**
   * 초기 프롬프트
   */
  initialPrompt?: string;

  /**
   * 응답 완료 콜백
   */
  onResponseComplete?: (response: NotebookLLMResponse) => void;

  /**
   * 에러 발생 콜백
   */
  onError?: (error: Error) => void;

  /**
   * 소스 추가/삭제 시 콜백 (프로젝트 목록 갱신용)
   */
  onSourcesChanged?: () => void;
}

function pipelineExtrasFromNotebookResponse(result: NotebookLLMResponse) {
  const raw = extractPipelineMessageExtrasFromChatResponse(result);
  return hasPipelineExtras(raw) ? raw : undefined;
}

/** 노트북 LLM POST `context` — 레거시 `conversationContext` + 통합 merge용 `conversation_history` */
function notebookLlmRequestContext(conversationId: string | null): Record<string, unknown> {
  if (!conversationId) return {};
  const convContext = conversationHistoryService.getContextForLLM(conversationId, 10);
  if (convContext.length === 0) return {};
  return {
    conversationContext: convContext,
    conversation_history: normalizeChatTurnsForApiMerge(convContext as ChatTurn[]),
  };
}

const NOTEBOOK_LLM_PERSPECTIVE_CONTEXT: Record<string, unknown> = {
  multi_perspective_response: MULTI_PERSPECTIVE_RESPONSE_INSTRUCTION,
  perspective_diversity_requested: true,
};

const NotebookLLM: React.FC<NotebookLLMProps> = ({
  projectId,
  initialPrompt = '',
  onResponseComplete,
  onError,
  onSourcesChanged,
}) => {
  const { isOffline } = useOfflineStatus();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [response, setResponse] = useState<NotebookLLMResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generateStartTime, setGenerateStartTime] = useState<number | null>(null);
  const [generateElapsedSec, setGenerateElapsedSec] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  /** 비스트리밍 전용: 대화 UI와 동일한 생성 단계 문구(늦게 도는 타이머는 ref로 취소) */
  const [nonStreamGenerationPhase, setNonStreamGenerationPhase] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<NotebookLLMStatus | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(true);
  const [dlIntegrationEnabled, setDlIntegrationEnabled] = useState(false);
  const [dlPromptAnalysis, setDlPromptAnalysis] = useState<PromptDLAnalysis | null>(null);
  const [dlResponseAnalysis, setDlResponseAnalysis] = useState<ResponseDLAnalysis | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedWritingStyle, setSelectedWritingStyle] = useState<string | null>(null);
  const [showWritingStyleSelector, setShowWritingStyleSelector] = useState(false);
  const [writingTopic, setWritingTopic] = useState('');
  const [writingLength, setWritingLength] = useState('중간');
  const [selectedTone, setSelectedTone] = useState<ToneType>('polite');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(null);
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [_detectedDomains, setDetectedDomains] = useState<DetectedDomain[]>([]);
  const [autoDetectEnabled, _setAutoDetectEnabled] = useState(true);
  // 도메인 지식 선택 (프로젝트별 또는 전체)
  const [selectedDomains, setSelectedDomains] = useState<DomainType[]>([]);
  const [domainSearchQuery, _setDomainSearchQuery] = useState('');
  const [_domainSearchResults, setDomainSearchResults] = useState<unknown[]>([]);
  const [_selectedDomainDetail, setSelectedDomainDetail] = useState<string | null>(null);
  const [_showDomainStatistics, _setShowDomainStatistics] = useState(false);
  void _showDomainStatistics;
  const [termSearchQuery, _setTermSearchQuery] = useState('');
  const [_termDefinitions, setTermDefinitions] = useState<unknown[]>([]);
  const [_domainFAQs, setDomainFAQs] = useState<unknown[]>([]);
  const [_domainExamples, setDomainExamples] = useState<unknown[]>([]);
  const [_showRelationGraph, _setShowRelationGraph] = useState(false);
  void _showRelationGraph;
  const [_domainInsights, setDomainInsights] = useState<unknown[]>([]);
  const [_knowledgeQuality, setKnowledgeQuality] = useState<unknown>(null);
  const [_selectedTemplate, _setSelectedTemplate] = useState<string | null>(null);
  void _selectedTemplate;
  const [_expertMode, _setExpertMode] = useState(false);
  void _expertMode;
  const [_expertModeConfigs, setExpertModeConfigs] = useState<Record<string, unknown>>({});
  const [_domainUsageStats, setDomainUsageStats] = useState<unknown[]>([]);
  const [_knowledgeHistory, setKnowledgeHistory] = useState<unknown[]>([]);
  const [showDomainSelector, setShowDomainSelector] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [_selectedMindMapNode, setSelectedMindMapNode] = useState<string | null>(null);
  const [showRealEstateData, setShowRealEstateData] = useState(false);
  const [selectedRealEstateData, setSelectedRealEstateData] = useState<unknown>(null);
  const [studioOutputs, setStudioOutputs] = useState<Array<{ id: string; type: string; content: string; created_at: string }>>([]);
  const [studioGenerating, setStudioGenerating] = useState(false);
  const [studioGenerateStartTime, setStudioGenerateStartTime] = useState<number | null>(null);
  const [studioElapsedSec, setStudioElapsedSec] = useState(0);
  const [selectedStudioType, setSelectedStudioType] = useState<string>('summary');
  const [viewingStudioOutput, setViewingStudioOutput] = useState<{ id: string; type: string; content: string; created_at: string } | null>(null);
  const [studioOutputSpeaking, setStudioOutputSpeaking] = useState(false);
  const studioSpeechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const streamingAbortRef = useRef<AbortController | null>(null);
  const nonStreamGenerationPhaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 비스트리밍: API 대기 중 관점·개요→답변 생성 타이머 취소 */
  const clearNotebookNonStreamLoadingPhasesRef = useRef<() => void>(() => {});
  /** 스트리밍: 본문 공개 전까지 누적된 최신 청크(젠스파이크형 단계 종료 후 한꺼번에 표시) */
  const notebookStreamBufferedRef = useRef('');
  const notebookStreamRevealedRef = useRef(false);
  /** 스트리밍: `scheduleAssistantPreRevealStreamPhases` 반환 취소 함수 */
  const notebookStreamPreRevealCleanupRef = useRef<(() => void) | null>(null);

  const cancelStreamPhaseTimers = useCallback(() => {
    notebookStreamPreRevealCleanupRef.current?.();
    notebookStreamPreRevealCleanupRef.current = null;
  }, []);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [addSourceUrl, setAddSourceUrl] = useState('');
  const [addSourceLoading, setAddSourceLoading] = useState(false);
  const [addSourceElapsedSec, setAddSourceElapsedSec] = useState(0);
  const addSourceStartRef = useRef<number | null>(null);
  const [addSourceError, setAddSourceError] = useState<string | null>(null);
  const [analysisSourceSearch, setAnalysisSourceSearch] = useState('');
  const [studioMemo, setStudioMemo] = useState('');
  const [copyResponseToast, setCopyResponseToast] = useState(false);
  const [copyErrorToast, setCopyErrorToast] = useState(false);
  const [studioDeleteConfirmId, setStudioDeleteConfirmId] = useState<string | null>(null);
  const [_bylawsRemoved, setBylawsRemoved] = useState(0); // 정관 삭제 시 리렌더 트리거
  const [bylawsPasteText, setBylawsPasteText] = useState('');
  const [bylawsPasteLoading, setBylawsPasteLoading] = useState(false);
  const [studioDeleteToast, setStudioDeleteToast] = useState(false);
  const [addSourceSuccessToast, setAddSourceSuccessToast] = useState(false);
  const [bylawsSuccessToast, setBylawsSuccessToast] = useState(false);
  const [bylawsRemovedToast, setBylawsRemovedToast] = useState(false);
  const [templateHintToast, setTemplateHintToast] = useState(false);
  const [bylawsKeypointsExpanded, setBylawsKeypointsExpanded] = useState(false);
  const [studioDownloadToast, setStudioDownloadToast] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[] | null>(null); // null=전체, []=없음, [id,...]=선택
  const [analysisData, setAnalysisData] = useState<{
    context: string;
    has_context: boolean;
    source_count: number;
    sources?: Array<{ id: string; type: string; title: string }>;
    wordCount: number;
    keywords: string[];
  } | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showWebResearchModal, setShowWebResearchModal] = useState(false);
  const [showDeepResearchModal, setShowDeepResearchModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showExpandedSuggestions, setShowExpandedSuggestions] = useState(false);
  const [expandedSuggestionsData, setExpandedSuggestionsData] = useState<ReturnType<typeof expandInput> | null>(null);
  const [studioOutputSort, setStudioOutputSort] = useState<'recent' | 'oldest' | 'type'>('recent');
  const [configExpanded, setConfigExpanded] = useState(() => {
    try {
      const v = localStorage.getItem(NOTEBOOK_LLM_CONFIG_EXPANDED_UI_STORAGE_KEY);
      return v !== 'false';
    } catch { return true; }
  });
  /** 왼쪽 패널 출처 목록 (구글 노트북 LM 스타일) — 프로젝트별 소스 */
  const [leftPanelSources, setLeftPanelSources] = useState<Array<{ id: string; type: string; title: string }> | null>(null);
  /** 지식 쌓기: 딥시크에 반영될 지식을 여기에 추가 */
  const [showAddKnowledgeForm, setShowAddKnowledgeForm] = useState(false);
  const [addKnowledgeTitle, setAddKnowledgeTitle] = useState('');
  const [addKnowledgeContent, setAddKnowledgeContent] = useState('');
  const [addKnowledgeLoading, setAddKnowledgeLoading] = useState(false);
  const [addKnowledgeError, setAddKnowledgeError] = useState<string | null>(null);
  const responseEndRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const notebookLlmRef = useRef<HTMLDivElement>(null);
  const bylawsPasteSectionRef = useRef<HTMLDivElement>(null);
  const addSourceUrlInputRef = useRef<HTMLInputElement | null>(null);
  const studioViewCloseRef = useRef<HTMLButtonElement | null>(null);
  const PROMPT_HISTORY_KEY = (pid: string | undefined) => `notebook-llm-prompt-history-${pid || 'default'}`;
  const PROMPT_HISTORY_MAX = 30;
  const promptHistoryRef = useRef<string[]>([]);
  const promptHistoryIndexRef = useRef<number>(-1);
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [hasPromptHistory, setHasPromptHistory] = useState(false);

  const promptTrimmed = useMemo(() => coerceTrimmedString(prompt, ''), [prompt]);
  const writingTopicTrimmed = useMemo(() => coerceTrimmedString(writingTopic, ''), [writingTopic]);
  const addSourceUrlTrimmed = useMemo(() => coerceTrimmedString(addSourceUrl, ''), [addSourceUrl]);
  const bylawsPasteTrimmed = useMemo(() => coerceTrimmedString(bylawsPasteText, ''), [bylawsPasteText]);
  const analysisSourceSearchTrimmed = useMemo(
    () => coerceTrimmedString(analysisSourceSearch, ''),
    [analysisSourceSearch]
  );

  // 프로젝트별 프롬프트 히스토리 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROMPT_HISTORY_KEY(projectId));
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          promptHistoryRef.current = parsed
            .slice(0, PROMPT_HISTORY_MAX)
            .filter((p) => typeof p === 'string' && coerceTrimmedString(p, '').length > 0);
        } else {
          promptHistoryRef.current = [];
        }
      } else {
        promptHistoryRef.current = [];
      }
      setHasPromptHistory(promptHistoryRef.current.length > 0);
      promptHistoryIndexRef.current = -1;
    } catch {
      promptHistoryRef.current = [];
      setHasPromptHistory(false);
    }
  }, [projectId]);

  useEffect(() => {
    return () => {
      if (nonStreamGenerationPhaseTimerRef.current) {
        clearTimeout(nonStreamGenerationPhaseTimerRef.current);
        nonStreamGenerationPhaseTimerRef.current = null;
      }
      clearNotebookNonStreamLoadingPhasesRef.current();
      cancelStreamPhaseTimers();
    };
  }, [cancelStreamPhaseTimers]);

  useEffect(() => {
    if (!showDriveModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDriveModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showDriveModal]);

  useEffect(() => {
    if (!studioDeleteConfirmId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStudioDeleteConfirmId(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [studioDeleteConfirmId]);

  useEffect(() => {
    if (!showAnalysis) {
      setAnalysisSourceSearch('');
      setAddSourceError(null);
    }
  }, [showAnalysis]);

  useEffect(() => {
    if (!showTemplates) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTemplates(false);
        promptInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [showTemplates]);

  useEffect(() => {
    if (!showToneSelector) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowToneSelector(false);
        promptInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [showToneSelector]);

  useEffect(() => {
    if (!showWritingStyleSelector) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWritingStyleSelector(false);
        promptInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [showWritingStyleSelector]);

  useEffect(() => {
    if (!showMindMap && !showRealEstateData) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showMindMap) setShowMindMap(false);
        if (showRealEstateData) setShowRealEstateData(false);
        promptInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [showMindMap, showRealEstateData]);

  useEffect(() => {
    if (!showDomainSelector) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDomainSelector(false);
        promptInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [showDomainSelector]);
  useEffect(() => {
    if (!showExpandedSuggestions) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowExpandedSuggestions(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [showExpandedSuggestions]);

  useEffect(() => {
    const ta = promptInputRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 280)}px`;
    }
  }, [prompt]);

  const extractSimpleKeywords = (text: string, maxCount = 10): string[] => {
    const stop = new Set(['그', '이', '저', '것', '수', '등', '및', '또', '또는', '및', '위', '아래', '에서', '으로', '의', '가', '를', '은', '는', '이', 'a', 'an', 'the', 'of', 'and', 'or']);
    const words = text.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(w => w.length >= 2 && !stop.has(w));
    const freq = new Map<string, number>();
    words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxCount).map(([k]) => k);
  };

  const [config, setConfig] = useState<NotebookLLMConfig>(() => {
    if (projectId) {
      return notebookLLMService.getProjectNotebookConfig(projectId) || {
        modelType: 'auto',
        processingMode: 'auto',
        projectId,
        temperature: 0.7,
        maxTokens: 2000,
      };
    }
    return notebookLLMService.loadDefaultConfig();
  });

  // 상태 확인
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const notebookStatus = projectId
          ? await notebookLLMService.getProjectNotebookStatus(projectId)
          : await notebookLLMService.getDefaultNotebookStatus();
        setStatus(notebookStatus);
      } catch (err) {
        errorLogger.error('상태 로드 실패', err instanceof Error ? err : new Error(String(err)), {
          component: 'NotebookLLM',
          action: 'loadStatus',
          projectId,
        });
      }
    };

    loadStatus();
  }, [projectId]);

  // 왼쪽 패널 출처 목록 로드 (구글 노트북 LM 스타일)
  useEffect(() => {
    if (!projectId) {
      setLeftPanelSources(null);
      return;
    }
    let cancelled = false;
    const p = projectService.getNotebookContext(projectId);
    if (p && typeof (p as Promise<unknown>).then === 'function') {
      (p as Promise<{ sources?: Array<{ id: string; type: string; title: string }> }>).then((ctx) => {
        if (!cancelled && ctx?.sources) setLeftPanelSources(ctx.sources);
        else if (!cancelled) setLeftPanelSources([]);
      });
    } else {
      setLeftPanelSources([]);
    }
    return () => { cancelled = true; };
  }, [projectId]);

  // 스튜디오 출력 목록 로드
  const loadStudioOutputs = useCallback(async () => {
    if (!projectId) return;
    const result = await projectService.getNotebookStudioOutputs(projectId);
    if (result?.outputs) {
      setStudioOutputs(result.outputs);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadStudioOutputs();
  }, [projectId, loadStudioOutputs]);

  const sortedStudioOutputs = useMemo(() => {
    const copy = [...studioOutputs];
    if (studioOutputSort === 'recent') {
      copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (studioOutputSort === 'oldest') {
      copy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (studioOutputSort === 'type') {
      copy.sort((a, b) => (STUDIO_TYPE_LABELS[a.type] || a.type).localeCompare(STUDIO_TYPE_LABELS[b.type] || b.type, 'ko'));
    }
    return copy;
  }, [studioOutputs, studioOutputSort]);

  // 스튜디오 메모 로드 (프로젝트별 localStorage)
  useEffect(() => {
    if (projectId) {
      try {
        const key = `notebook-studio-memo-${projectId}`;
        const saved = localStorage.getItem(key);
        setStudioMemo(saved ?? '');
      } catch {
        setStudioMemo('');
      }
    } else {
      setStudioMemo('');
    }
  }, [projectId]);

  const saveStudioMemo = useCallback((value: string) => {
    if (!projectId) return;
    try {
      localStorage.setItem(`notebook-studio-memo-${projectId}`, value);
    } catch {
      // ignore
    }
  }, [projectId]);

  // 소스 선택 (대화 반영용) 로드/저장. null=미저장(전체선택), []=전체해제, [...]=선택된 ID
  useEffect(() => {
    if (!projectId) {
      setSelectedSourceIds(null);
      return;
    }
    try {
      const key = `notebook-selected-sources-${projectId}`;
      const saved = localStorage.getItem(key);
      if (saved === null) {
        setSelectedSourceIds(null);
      } else {
        const arr = JSON.parse(saved) as string[];
        setSelectedSourceIds(Array.isArray(arr) ? arr : []);
      }
    } catch {
      setSelectedSourceIds(null);
    }
  }, [projectId]);

  const toggleSourceSelection = useCallback((sourceId: string, sources: Array<{ id: string }>) => {
    const allIds = sources.map((s) => s.id);
    setSelectedSourceIds((prev) => {
      const current = prev === null ? allIds : prev;
      const set = new Set(current);
      if (set.has(sourceId)) {
        set.delete(sourceId);
      } else {
        set.add(sourceId);
      }
      const next = [...set].filter((id) => allIds.includes(id));
      if (!projectId) return next;
      try {
        localStorage.setItem(`notebook-selected-sources-${projectId}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [projectId]);

  const selectAllSources = useCallback((sources: Array<{ id: string }>) => {
    const all = sources.map((s) => s.id);
    setSelectedSourceIds(all);
    if (projectId) {
      try {
        localStorage.setItem(`notebook-selected-sources-${projectId}`, JSON.stringify(all));
      } catch {
        // ignore
      }
    }
  }, [projectId]);

  const deselectAllSources = useCallback((_sources: Array<{ id: string }>) => {
    setSelectedSourceIds([]);
    if (projectId) {
      try {
        localStorage.setItem(`notebook-selected-sources-${projectId}`, JSON.stringify([]));
      } catch {
        // ignore
      }
    }
  }, [projectId]);

  const handleGenerateStudio = useCallback(async () => {
    if (!projectId || studioGenerating) return;
    setStudioGenerating(true);
    setStudioGenerateStartTime(Date.now());
    setError(null);
    try {
      const result = await projectService.generateNotebookStudioOutput(
        projectId,
        selectedStudioType as Parameters<typeof projectService.generateNotebookStudioOutput>[1]
      );
      if (result?.content) {
        await loadStudioOutputs();
        setViewingStudioOutput({
          id: result.id || `studio_${Date.now()}`,
          type: result.type,
          content: result.content,
          created_at: result.created_at || new Date().toISOString(),
        });
      } else {
        setError(new Error('스튜디오 출력 생성에 실패했습니다. 프로젝트 소스가 있는지 확인하세요.'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setStudioGenerating(false);
      setStudioGenerateStartTime(null);
      setStudioElapsedSec(0);
    }
  }, [projectId, selectedStudioType, studioGenerating, loadStudioOutputs]);

  useEffect(() => {
    if (!studioGenerating || !studioGenerateStartTime) return;
    const tick = () => setStudioElapsedSec(Math.floor((Date.now() - studioGenerateStartTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [studioGenerating, studioGenerateStartTime]);

  useEffect(() => {
    if (!isLoading || !generateStartTime) {
      if (!isLoading) {
        setGenerateStartTime(null);
        setGenerateElapsedSec(0);
      }
      return;
    }
    const tick = () => setGenerateElapsedSec(Math.floor((Date.now() - generateStartTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isLoading, generateStartTime]);

  const handleDeleteStudioOutput = useCallback(async (outputId: string) => {
    if (!projectId) return;
    setStudioDeleteConfirmId(outputId);
  }, [projectId]);

  const confirmDeleteStudioOutput = useCallback(async () => {
    if (!projectId || !studioDeleteConfirmId) return;
    const outputId = studioDeleteConfirmId;
    setStudioDeleteConfirmId(null);
    const ok = await projectService.deleteNotebookStudioOutput(projectId, outputId);
    if (ok) {
      setStudioOutputs(prev => prev.filter(o => o.id !== outputId));
      if (viewingStudioOutput?.id === outputId) {
        setViewingStudioOutput(null);
      }
      setStudioDeleteToast(true);
      setTimeout(() => setStudioDeleteToast(false), 2000);
    }
  }, [projectId, studioDeleteConfirmId, viewingStudioOutput?.id]);

  const speakStudioContent = useCallback((content: string) => {
    if (studioOutputSpeaking) {
      window.speechSynthesis.cancel();
      setStudioOutputSpeaking(false);
      studioSpeechSynthRef.current = null;
      return;
    }
    const cleanText = coerceTrimmedString(
      content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
        .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/>\s/g, '')
        .replace(/[-*+]\s/g, '')
        .replace(/\d+[.)]\s/g, ''),
      ''
    );
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find(v => v.lang.includes('ko'));
    if (koreanVoice) utterance.voice = koreanVoice;
    utterance.onend = () => {
      setStudioOutputSpeaking(false);
      studioSpeechSynthRef.current = null;
    };
    utterance.onerror = () => {
      setStudioOutputSpeaking(false);
      studioSpeechSynthRef.current = null;
    };
    studioSpeechSynthRef.current = utterance;
    setStudioOutputSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [studioOutputSpeaking]);

  const handleLoadAnalysis = useCallback(async () => {
    if (!projectId || analysisLoading) return;
    setAnalysisLoading(true);
    setAnalysisData(null);
    setBylawsKeypointsExpanded(false);
    setShowAnalysis(true);
    try {
      const ctx = await projectService.getNotebookContext(projectId);
      if (ctx) {
        const wordCount = (ctx.context || '').split(/\s+/).filter(Boolean).length;
        const keywords = extractSimpleKeywords(ctx.context || '', 10);
        setAnalysisData({
          context: ctx.context || '',
          has_context: ctx.has_context,
          source_count: ctx.source_count ?? 0,
          sources: ctx.sources,
          wordCount,
          keywords,
        });
        setLeftPanelSources(ctx.sources ?? []);
      } else {
        setAnalysisData({
          context: '',
          has_context: false,
          source_count: 0,
          wordCount: 0,
          keywords: [],
        });
      }
    } catch {
      setAnalysisData({
        context: '',
        has_context: false,
        source_count: 0,
        wordCount: 0,
        keywords: [],
      });
    } finally {
      setAnalysisLoading(false);
    }
  }, [projectId, analysisLoading]);

  const handleAddSourceFromUrl = useCallback(async () => {
    const url = addSourceUrlTrimmed;
    if (!projectId || !url || addSourceLoading) return;
    if (!isValidHttpUrl(url)) {
      setAddSourceError(
        `http:// 또는 https://로 시작하는 올바른 URL을 입력해 주세요. 예: ${DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL}`,
      );
      return;
    }
    setAddSourceLoading(true);
    setAddSourceElapsedSec(0);
    addSourceStartRef.current = Date.now();
    setAddSourceError(null);
    try {
      const added = await projectService.addNotebookSourceFromUrl(projectId, url);
      if (added) {
        setAddSourceUrl('');
        setAddSourceError(null);
        await handleLoadAnalysis();
        onSourcesChanged?.();
        setAddSourceSuccessToast(true);
        setTimeout(() => setAddSourceSuccessToast(false), 2000);
      } else {
        setAddSourceError('소스 추가에 실패했습니다.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAddSourceError(msg);
      errorLogger.warn('URL 소스 추가 실패', { component: 'NotebookLLM', projectId, url, error: msg });
    } finally {
      setAddSourceLoading(false);
      addSourceStartRef.current = null;
    }
  }, [projectId, addSourceUrlTrimmed, addSourceLoading, handleLoadAnalysis, onSourcesChanged]);

  /** 지식 추가: 딥시크에 반영될 지식을 프로젝트 출처에 쌓기 */
  const handleAddKnowledge = useCallback(async () => {
    const title = coerceTrimmedString(addKnowledgeTitle, '');
    const content = coerceTrimmedString(addKnowledgeContent, '');
    if (!projectId || !title || !content || addKnowledgeLoading) return;
    setAddKnowledgeError(null);
    setAddKnowledgeLoading(true);
    try {
      const result = await projectService.addNotebookSource(projectId, {
        title: title || '지식',
        content,
        type: 'knowledge',
      });
      if (result) {
        setAddKnowledgeTitle('');
        setAddKnowledgeContent('');
        setShowAddKnowledgeForm(false);
        await handleLoadAnalysis();
        onSourcesChanged?.();
      } else {
        setAddKnowledgeError('지식 추가에 실패했습니다.');
      }
    } catch (err) {
      setAddKnowledgeError(err instanceof Error ? err.message : '지식 추가에 실패했습니다.');
    } finally {
      setAddKnowledgeLoading(false);
    }
  }, [projectId, addKnowledgeTitle, addKnowledgeContent, addKnowledgeLoading, handleLoadAnalysis, onSourcesChanged]);

  const handleBylawsPaste = useCallback(() => {
    if (!projectId || !bylawsPasteTrimmed || bylawsPasteLoading) return;
    setBylawsPasteLoading(true);
    setAddSourceError(null);
    try {
      const analysis = associationBylawsService.analyzeAndSaveFromText(projectId, bylawsPasteTrimmed);
      if (analysis) {
        setBylawsPasteText('');
        setBylawsRemoved((v) => v + 1);
        onSourcesChanged?.();
        setBylawsSuccessToast(true);
        setTimeout(() => setBylawsSuccessToast(false), 2500);
      } else {
        const len = bylawsPasteTrimmed.length;
        setAddSourceError(
          len > 150000
            ? '텍스트가 너무 깁니다. 15만 자 이하의 정관 원문만 등록할 수 있습니다.'
            : '정관에서 추출할 항목이 없습니다. 100자 이상의 정관 원문에 조합장·이사·감사·총회·대의원회·시공자 선정·분담금·분양·정비사업비·입찰·경쟁입찰 등이 포함된 텍스트를 붙여넣어 주세요.'
        );
      }
    } catch (err) {
      setAddSourceError(err instanceof Error ? err.message : '정관 등록에 실패했습니다.');
    } finally {
      setBylawsPasteLoading(false);
    }
  }, [projectId, bylawsPasteTrimmed, bylawsPasteLoading, onSourcesChanged]);

  useEffect(() => {
    if (!addSourceLoading || addSourceStartRef.current === null) return;
    const tick = () => setAddSourceElapsedSec(Math.floor((Date.now() - (addSourceStartRef.current ?? 0)) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [addSourceLoading]);

  useEffect(() => {
    if (!showAnalysis) return;
    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowAnalysis(false); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [showAnalysis]);

  // 분석 모달 열릴 때 URL 입력란 포커스 (데이터 로드 후)
  useEffect(() => {
    if (showAnalysis && analysisData && !analysisLoading) {
      const t = setTimeout(() => addSourceUrlInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [showAnalysis, analysisData, analysisLoading]);

  useEffect(() => {
    if (!viewingStudioOutput) return;
    const t = setTimeout(() => studioViewCloseRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [viewingStudioOutput]);

  useEffect(() => {
    if (!viewingStudioOutput) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (studioOutputSpeaking) {
          window.speechSynthesis.cancel();
          setStudioOutputSpeaking(false);
        }
        setViewingStudioOutput(null);
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [viewingStudioOutput, studioOutputSpeaking]);

  // 딥러닝 연동 설정 프로젝트별 저장·복원
  useEffect(() => {
    const key = projectId ? `notebook-llm-dl-integration-${projectId}` : 'notebook-llm-dl-integration';
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setDlIntegrationEnabled(raw === 'true');
    } catch {
      // ignore
    }
  }, [projectId]);

  useEffect(() => {
    const key = projectId ? `notebook-llm-dl-integration-${projectId}` : 'notebook-llm-dl-integration';
    try {
      localStorage.setItem(key, String(dlIntegrationEnabled));
    } catch {
      // ignore
    }
  }, [projectId, dlIntegrationEnabled]);

  // 프롬프트 변경 시 자동 도메인 감지
  useEffect(() => {
    if (autoDetectEnabled && promptTrimmed.length > 10) {
      try {
        const detected = detectRelevantDomains(prompt);
        setDetectedDomains(detected);

        // 신뢰도가 높은 도메인 자동 선택
        const highConfidence = detected
          .filter((d) => d.confidence > 0.5)
          .map((d) => d.domain);

        if (highConfidence.length > 0) {
          setSelectedDomains((prev) => [...new Set([...prev, ...highConfidence])] as DomainType[]);
        }
      } catch (error) {
        errorLogger.error('도메인 자동 감지 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'NotebookLLM',
          action: 'autoDetectDomains',
        });
      }
    }
  }, [prompt, promptTrimmed, autoDetectEnabled]);

  // 프로젝트별 도메인 설정 로드
  useEffect(() => {
    if (projectId) {
      try {
        const saved = localStorage.getItem(`domainConfig_${projectId}`);
        if (saved) {
          const savedDomains = JSON.parse(saved) as DomainType[];
          if (savedDomains.length > 0) {
            setSelectedDomains(savedDomains);
          }
        }
      } catch (error) {
        errorLogger.warn('프로젝트 도메인 설정 로드 실패', {
          component: 'NotebookLLM',
          action: 'loadDomainConfig',
          projectId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }, [projectId]);

  // 마인드맵 데이터 생성 (선택 도메인 + 도메인 관계 그래프의 연결)
  useEffect(() => {
    if (showMindMap) {
      const domainSet = new Set<string>(selectedDomains);
      const graph = getDomainRelationGraph();
      const nodes = selectedDomains.map(d => ({ id: d, label: d, type: 'domain' as const }));
      const edges = graph.links
        .filter((l) => domainSet.has(l.source) && domainSet.has(l.target))
        .map((l) => ({ source: l.source, target: l.target }));
      setMindMapData({ nodes, edges });
    }
  }, [showMindMap, selectedDomains]);

  // 글쓰기 스타일 적용 (어투/연령대 포함)
  const applyWritingStyle = useCallback((styleId: string, topic: string): string => {
    try {
      const toneConfig: ToneConfig = {
        toneType: selectedTone,
        ageGroup: selectedAgeGroup || undefined,
      };
      const stylePrompt = writingStyleService.generatePrompt(
        styleId,
        topic,
        writingTopic,
        writingLength,
        toneConfig
      );
      return stylePrompt;
    } catch (error) {
      errorLogger.error('글쓰기 스타일 적용 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'applyWritingStyle',
      });
      return prompt;
    }
  }, [writingTopic, writingLength, selectedTone, selectedAgeGroup, prompt]);

  /** 실제 생성 시 사용될 프롬프트의 예상 길이 (15,000자 제한 검증용) */
  const effectivePromptLength = useMemo(() => {
    if (selectedWritingStyle && writingTopicTrimmed) {
      try {
        return applyWritingStyle(selectedWritingStyle, writingTopic).length;
      } catch {
        return 0;
      }
    }
    return promptTrimmed.length;
  }, [selectedWritingStyle, writingTopic, writingTopicTrimmed, promptTrimmed, applyWritingStyle]);

  const PROMPT_MAX_LENGTH = 15000;

  // 응답 생성

  // 도메인 지식 검색
  const handleDomainSearch = useCallback((query: string) => {
    const q = coerceTrimmedString(query, '');
    if (q.length < 2) {
      setDomainSearchResults([]);
      return;
    }

    try {
      const results = searchDomainKnowledge(q, selectedDomains.length > 0 ? selectedDomains : undefined);
      setDomainSearchResults(results);
    } catch (error) {
      errorLogger.error('도메인 검색 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'searchDomains',
      });
    }
  }, [selectedDomains]);

  // 용어 검색
  const handleTermSearch = useCallback((term: string) => {
    const t = coerceTrimmedString(term, '');
    if (t.length < 2) {
      setTermDefinitions([]);
      return;
    }

    try {
      const definitions = getTermDefinition(t);
      setTermDefinitions(definitions);
    } catch (error) {
      errorLogger.error('용어 검색 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'searchTerms',
      });
    }
  }, []);

  // 도메인 상세 정보 로드
  const _loadDomainDetail = useCallback((domainKey: string) => {
    try {
      const detail = getDomainDetail(domainKey);
      if (detail) {
        setSelectedDomainDetail(domainKey);
      }
    } catch (error) {
      errorLogger.error('도메인 상세 정보 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'loadDomainDetails',
      });
    }
  }, []);


  // 도메인 FAQ 및 예시 로드
  const loadDomainFAQs = useCallback((domainKey: string) => {
    try {
      const faqs = getDomainFAQs(domainKey);
      const examples = getDomainExamples(domainKey);
      setDomainFAQs(faqs);
      setDomainExamples(examples);
    } catch (error) {
      errorLogger.error('FAQ 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'loadFAQs',
      });
    }
  }, []);

  // 도메인 인사이트 생성
  const generateInsights = useCallback(() => {
    if (selectedDomains.length > 0) {
      try {
        const insights = generateDomainInsights(selectedDomains);
        setDomainInsights(insights);
      } catch (error) {
        errorLogger.error('인사이트 생성 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'NotebookLLM',
          action: 'generateInsights',
        });
      }
    }
  }, [selectedDomains]);

  // 선택된 도메인 변경 시 FAQ 및 예시 로드
  useEffect(() => {
    if (selectedDomains.length > 0) {
      const firstDomain = selectedDomains[0];
      loadDomainFAQs(firstDomain);
      generateInsights();
    } else {
      setDomainFAQs([]);
      setDomainExamples([]);
      setDomainInsights([]);
    }
  }, [selectedDomains, loadDomainFAQs, generateInsights]);

  // 도메인 검색
  useEffect(() => {
    if (coerceTrimmedString(domainSearchQuery, '').length >= 2) {
      handleDomainSearch(domainSearchQuery);
    } else {
      setDomainSearchResults([]);
    }
  }, [domainSearchQuery, handleDomainSearch]);

  // 용어 검색
  useEffect(() => {
    if (coerceTrimmedString(termSearchQuery, '').length >= 2) {
      handleTermSearch(termSearchQuery);
    } else {
      setTermDefinitions([]);
    }
  }, [termSearchQuery, handleTermSearch]);

  // 지식 품질 검증
  const _validateKnowledge = useCallback((domainKey: string) => {
    try {
      const quality = validateDomainKnowledge(domainKey);
      setKnowledgeQuality(quality);
    } catch (error) {
      errorLogger.error('품질 검증 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'validateQuality',
      });
    }
  }, []);


  // 전문가 모드 토글
  const _handleExpertModeToggle = useCallback((domain: string, enabled: boolean) => {
    const currentConfig = getExpertModeConfig(domain) || {
      domain,
      enabled: false,
      depth: 'intermediate',
      includeCaseStudies: true,
      includeCalculations: true,
      includeLatestPolicies: true
    };

    const newConfig = { ...currentConfig, enabled };
    setExpertModeConfig(newConfig);
    setExpertModeConfigs(prev => ({ ...prev, [domain]: newConfig }));
  }, []);

  // 도메인 사용 통계 로드
  const _loadDomainStats = useCallback(() => {
    try {
      const stats = getDomainUsageStats();
      setDomainUsageStats(stats);
    } catch (error) {
      errorLogger.error('통계 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'loadStats',
      });
    }
  }, []);

  // 지식 히스토리 로드
  const _loadKnowledgeHistory = useCallback(() => {
    try {
      const history = getKnowledgeHistory();
      setKnowledgeHistory(history);
    } catch (error) {
      errorLogger.error('히스토리 로드 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'NotebookLLM',
        action: 'loadHistory',
      });
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isOffline) return;
    let finalPrompt = promptTrimmed;

    // 글쓰기 스타일이 선택된 경우 적용
    if (selectedWritingStyle && writingTopicTrimmed) {
      finalPrompt = applyWritingStyle(selectedWritingStyle, writingTopic);
    } else if (!finalPrompt) {
      return;
    }
    if (finalPrompt.length > PROMPT_MAX_LENGTH) {
      setError(new Error(`프롬프트가 너무 깁니다. ${PROMPT_MAX_LENGTH.toLocaleString()}자 이하로 입력해 주세요.`));
      return;
    }
    setError(null); // 이전 에러 초기화

    // 글쓰기 스타일 지시 (선택된 스타일이 있으면 모든 답변에 해당 스타일 적용)
    if (selectedWritingStyle) {
      const styleInstruction = writingStyleService.getStyleInstruction(selectedWritingStyle);
      if (styleInstruction) finalPrompt += styleInstruction;
    }

    // 도메인 지식 통합
    if (selectedDomains.length > 0) {
      finalPrompt = domainKnowledgeService.enrichPromptWithDomainKnowledge(
        finalPrompt,
        selectedDomains,
        0.3
      );
      const domainKo = selectedDomains.map(d => DOMAIN_TYPE_TO_KO[d] ?? d);
        const intelligentContext = buildIntelligentContext(finalPrompt, domainKo, true);
        if (coerceTrimmedString(intelligentContext, '')) finalPrompt += intelligentContext;
    } else {
      // 자동 도메인 감지
      const detectedDomains = domainKnowledgeService.detectDomainsFromPrompt(finalPrompt);
      if (detectedDomains.length > 0) {
        finalPrompt = domainKnowledgeService.enrichPromptWithDomainKnowledge(
          finalPrompt,
          detectedDomains,
          0.2
        );
      }
    }

    // 실거래 정보 및 등기 정보 통합
    if (selectedRealEstateData) {
      let dataContext = '\n\n[부동산 데이터 정보]\n';

      if (typeof selectedRealEstateData === 'object' && selectedRealEstateData !== null && 'transactionType' in selectedRealEstateData) {
        // 실거래 정보
        const transaction = selectedRealEstateData as TransactionData;
        dataContext += `거래 유형: ${transaction.transactionType}\n`;
        dataContext += `부동산 유형: ${transaction.propertyType}\n`;
        dataContext += `주소: ${transaction.address.sido} ${transaction.address.sigungu} ${transaction.address.dong}\n`;
        dataContext += `거래 금액: ${(transaction.price.amount / 10000).toLocaleString()}만원\n`;
        dataContext += `면적: ${transaction.area.exclusive}㎡\n`;
        dataContext += `거래일자: ${transaction.transactionDate}\n`;
        if (transaction.floor) {
          dataContext += `층수: ${transaction.floor.current}/${transaction.floor.total}층\n`;
        }
      } else {
        // 등기 정보
        const registry = selectedRealEstateData as RegistryData;
        dataContext += `변경 유형: ${registry.changeType}\n`;
        dataContext += `주소: ${registry.propertyAddress.sido} ${registry.propertyAddress.sigungu} ${registry.propertyAddress.dong}\n`;
        dataContext += `변경일자: ${registry.changeDate}\n`;
        if (registry.previousOwner) {
          dataContext += `이전 소유자: ${registry.previousOwner.name} (${registry.previousOwner.share})\n`;
        }
        if (registry.newOwner) {
          dataContext += `신규 소유자: ${registry.newOwner.name} (${registry.newOwner.share})\n`;
        }
        if (registry.mortgageInfo) {
          dataContext += `저당권: ${registry.mortgageInfo.creditor} (${(registry.mortgageInfo.amount / 10000).toLocaleString()}만원)\n`;
        }
        if (registry.leaseInfo) {
          dataContext += `전세권: ${registry.leaseInfo.lessee} (${(registry.leaseInfo.deposit / 10000).toLocaleString()}만원)\n`;
        }
      }

      dataContext += '\n위 부동산 데이터를 바탕으로 정확하고 상세한 답변을 제공해주세요.';
      finalPrompt += dataContext;
    }

    // 질문·요구에 맞는 답변 형식·깊이 지시 (형식 맞춤·톤 맞춤·깊이 맞춤)
    const formatInstructions = buildResponseFormatInstructions(finalPrompt);
    if (formatInstructions) finalPrompt += formatInstructions;

    // 혁신적 답변·글쓰기 품질 지시 (모든 입력창 동일 생성글 품질)
    finalPrompt += '\n\n' + getInnovativeWritingInstructionBlock();

    if (dlIntegrationEnabled) {
      setDlResponseAnalysis(null);
      let projectContext: { instructions?: string; name?: string } | undefined;
      if (projectId) {
        try {
          const project = await projectService.getProject(projectId);
          if (project) {
            projectContext = {
              instructions: typeof project.instructions === 'string' ? project.instructions : undefined,
              name: project.name,
            };
          }
        } catch {
          // 프로젝트 로드 실패 시 무시하고 프롬프트만으로 분석
        }
      }
      const result = await buildMessageToSendForChat(finalPrompt, finalPrompt, projectContext, { includeAnalysis: true });
      const resolved = typeof result === 'string' ? result : result.messageToSend;
      finalPrompt = resolved;
      if (typeof result !== 'string' && result.promptAnalysis) {
        setDlPromptAnalysis(result.promptAnalysis);
      } else {
        setDlPromptAnalysis(null);
      }
    } else {
      setDlPromptAnalysis(null);
      setDlResponseAnalysis(null);
    }

    // 프롬프트 히스토리에 추가 (최대 PROMPT_HISTORY_MAX개, localStorage 저장)
    if (finalPrompt) {
      const hist = promptHistoryRef.current;
      if (hist[0] !== finalPrompt) {
        const next = [finalPrompt, ...hist].slice(0, PROMPT_HISTORY_MAX);
        promptHistoryRef.current = next;
        setHasPromptHistory(true);
        try {
          localStorage.setItem(PROMPT_HISTORY_KEY(projectId), JSON.stringify(next));
        } catch {
          // ignore quota or parse errors
        }
      }
      promptHistoryIndexRef.current = -1;
    }

    setIsLoading(true);
    setGenerateStartTime(Date.now());
    setGenerateElapsedSec(0);
    setIsStreaming(useStreaming);
    setError(null);
    setResponse(null);
    setStreamingContent('');
    if (nonStreamGenerationPhaseTimerRef.current) {
      clearTimeout(nonStreamGenerationPhaseTimerRef.current);
      nonStreamGenerationPhaseTimerRef.current = null;
    }
    cancelStreamPhaseTimers();
    clearNotebookNonStreamLoadingPhasesRef.current();
    clearNotebookNonStreamLoadingPhasesRef.current = () => {};
    setNonStreamGenerationPhase(null);
    if (!useStreaming) {
      setNonStreamGenerationPhase(ASSISTANT_PLACEHOLDER_ANALYZING);
      clearNotebookNonStreamLoadingPhasesRef.current = scheduleAssistantNonStreamLoadingPhaseTimers((text) => {
        setNonStreamGenerationPhase(text);
      });
    }

    // 사용자 메시지 추가
    if (conversationId) {
      conversationHistoryService.addMessage(conversationId, {
        role: 'user',
        content: finalPrompt,
      });
    }

    try {
      if (useStreaming) {
        // 스트리밍 모드 (취소용 AbortController)
        const abortController = new AbortController();
        streamingAbortRef.current = abortController;

        const streamReducedMotion =
          typeof window !== 'undefined' &&
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

        notebookStreamBufferedRef.current = '';
        notebookStreamRevealedRef.current = false;
        setStreamingContent(ASSISTANT_PLACEHOLDER_ANALYZING);
        notebookStreamPreRevealCleanupRef.current?.();
        notebookStreamPreRevealCleanupRef.current = scheduleAssistantPreRevealStreamPhases({
          reducedMotion: streamReducedMotion,
          setPlaceholder: (text) => {
            if (notebookStreamRevealedRef.current) return;
            setStreamingContent((prev) =>
              isAssistantGenerationPlaceholder(prev) ? text : prev,
            );
          },
          onReveal: () => {
            if (notebookStreamRevealedRef.current) return;
            notebookStreamRevealedRef.current = true;
            setStreamingContent(notebookStreamBufferedRef.current);
          },
        });

        const llmContext: Record<string, unknown> = {
          ...notebookLlmRequestContext(conversationId),
          ...NOTEBOOK_LLM_PERSPECTIVE_CONTEXT,
        };
        if (projectId && selectedSourceIds !== null) {
          llmContext.source_ids = selectedSourceIds;
        }
        // 프로젝트별 조합 정관 기본 지식 주입 (현장별·프로젝트별 기본 지식)
        let bylawsText = '';
        if (projectId) {
          const ctx = associationBylawsService.formatBylawsContextForPrompt(projectId);
          if (ctx) bylawsText = ctx;
        }
        // 프롬프트에 언급된 다른 현장의 정관 컨텍스트 추가 (타 프로젝트 참고용)
        const crossCtx = associationBylawsService.getBylawsContextForMentionedSites(finalPrompt, projectId);
        if (crossCtx) bylawsText = (bylawsText ? bylawsText + '\n' : '') + crossCtx;
        if (bylawsText) llmContext.bylaws_base_knowledge = bylawsText;
        // 글쓰기 스타일·지식(도메인)·전문가 관점 — 백엔드에서 스타일/지시로 반영
        if (selectedWritingStyle) {
          const styleName = writingStyleService.getStyle(selectedWritingStyle)?.name || selectedWritingStyle;
          llmContext.writing_style = styleName;
          llmContext.person_style = styleName;
        }
        if (selectedDomains.length > 0) {
          const domainNames = selectedDomains.map((d) => DOMAIN_TYPE_TO_KO[d] ?? d).join(', ');
          llmContext.domain_instruction = `도메인 전문 지식 반영: ${domainNames}. 해당 분야 전문가 수준으로 답변하세요.`;
          llmContext.expert_instruction = `선택된 도메인(${domainNames}) 전문가 관점으로 정확하고 실무에 맞게 답변하세요.`;
        }

        const streamOptions = {
          signal: abortController.signal,
          onChunk: (chunk: { content: string }) => {
                const cleaned = cleanResponseText(chunk.content);
                notebookStreamBufferedRef.current = cleaned;
                if (notebookStreamRevealedRef.current) {
                  setStreamingContent(cleaned);
                }
              },
              onMetadata: (_meta: Record<string, unknown>) => {
                // 순차 단계는 타이머만 사용(백엔드 메타로 단계를 건너뛰지 않음)
              },
              onComplete: (result: NotebookLLMResponse) => {
                cancelStreamPhaseTimers();
                const safeContent = cleanResponseText(result.content);
                const sanitized = { ...result, content: safeContent };
                setResponse(sanitized);
                setStreamingContent('');
                setIsStreaming(false);
                setIsLoading(false);
                if (dlIntegrationEnabled) {
                  notebookLLMDeepLearningIntegration
                    .analyzeResponseWithDL(finalPrompt, safeContent)
                    .then(setDlResponseAnalysis)
                    .catch(() => setDlResponseAnalysis(null));
                }
                if (conversationId) {
                  const pe = pipelineExtrasFromNotebookResponse(sanitized);
                  conversationHistoryService.addMessage(conversationId, {
                    role: 'assistant',
                    content: safeContent,
                    metadata: {
                      modelUsed: result.modelUsed,
                      tokensUsed: result.tokensUsed,
                      processingTime: result.processingTime,
                      confidence: result.confidence,
                    },
                    ...(pe ? { pipelineExtras: pe } : {}),
                  });
                }
                if (onResponseComplete) {
                  onResponseComplete(sanitized);
                }
              },
              onError: (err: Error) => {
                cancelStreamPhaseTimers();
                streamingAbortRef.current = null;
                errorLogger.error('NotebookLLM 스트리밍 오류', err instanceof Error ? err : new Error(String(err)), {
                  component: 'NotebookLLM',
                  action: 'streamProjectNotebook',
                  projectId,
                });
                setError(err);
                setIsStreaming(false);
                setIsLoading(false);
                if (onError) {
                  try {
                    onError(err);
                  } catch (callbackError) {
                    errorLogger.error('onError 콜백 실행 중 오류', callbackError instanceof Error ? callbackError : new Error(String(callbackError)), {
                      component: 'NotebookLLM',
                      action: 'onErrorCallback',
                    });
                  }
                }
              },
            };

        await (projectId
          ? notebookLLMStreamingService.streamProjectNotebook(projectId, finalPrompt, llmContext, config, streamOptions)
          : notebookLLMStreamingService.streamDefaultNotebook(finalPrompt, llmContext, config, streamOptions));
      } else {
        // 일반 모드
        const llmContext: Record<string, unknown> = {
          ...notebookLlmRequestContext(conversationId),
          ...NOTEBOOK_LLM_PERSPECTIVE_CONTEXT,
        };
        if (projectId && selectedSourceIds !== null) {
          llmContext.source_ids = selectedSourceIds;
        }
        // 프로젝트별 조합 정관 기본 지식 주입 (현장별·프로젝트별 기본 지식)
        let bylawsText = '';
        if (projectId) {
          const ctx = associationBylawsService.formatBylawsContextForPrompt(projectId);
          if (ctx) bylawsText = ctx;
        }
        const crossCtx = associationBylawsService.getBylawsContextForMentionedSites(finalPrompt, projectId);
        if (crossCtx) bylawsText = (bylawsText ? bylawsText + '\n' : '') + crossCtx;
        if (bylawsText) llmContext.bylaws_base_knowledge = bylawsText;
        // 글쓰기 스타일·지식(도메인)·전문가 관점 — 백엔드에서 스타일/지시로 반영
        if (selectedWritingStyle) {
          const styleName = writingStyleService.getStyle(selectedWritingStyle)?.name || selectedWritingStyle;
          llmContext.writing_style = styleName;
          llmContext.person_style = styleName;
        }
        if (selectedDomains.length > 0) {
          const domainNames = selectedDomains.map((d) => DOMAIN_TYPE_TO_KO[d] ?? d).join(', ');
          llmContext.domain_instruction = `도메인 전문 지식 반영: ${domainNames}. 해당 분야 전문가 수준으로 답변하세요.`;
          llmContext.expert_instruction = `선택된 도메인(${domainNames}) 전문가 관점으로 정확하고 실무에 맞게 답변하세요.`;
        }

        const result = projectId
          ? await notebookLLMService.generateWithProjectNotebook(projectId, finalPrompt, llmContext, config)
          : await notebookLLMService.generateWithDefaultNotebook(finalPrompt, llmContext, config);

        const safeContent = cleanResponseText(result.content);
        const sanitized = { ...result, content: safeContent };
        cancelStreamPhaseTimers();
        if (nonStreamGenerationPhaseTimerRef.current) {
          clearTimeout(nonStreamGenerationPhaseTimerRef.current);
          nonStreamGenerationPhaseTimerRef.current = null;
        }
        clearNotebookNonStreamLoadingPhasesRef.current();
        clearNotebookNonStreamLoadingPhasesRef.current = () => {};
        await runAssistantNonStreamPostResponsePhases((text) => setNonStreamGenerationPhase(text));
        setNonStreamGenerationPhase(null);
        setResponse(sanitized);
        setIsLoading(false);
        if (dlIntegrationEnabled) {
          notebookLLMDeepLearningIntegration
            .analyzeResponseWithDL(finalPrompt, safeContent)
            .then(setDlResponseAnalysis)
            .catch(() => setDlResponseAnalysis(null));
        }
        if (conversationId) {
          const pe = pipelineExtrasFromNotebookResponse(sanitized);
          conversationHistoryService.addMessage(conversationId, {
            role: 'assistant',
            content: safeContent,
            metadata: {
              modelUsed: result.modelUsed,
              tokensUsed: result.tokensUsed,
              processingTime: result.processingTime,
              confidence: result.confidence,
            },
            ...(pe ? { pipelineExtras: pe } : {}),
          });
        }

        if (onResponseComplete) {
          onResponseComplete(sanitized);
        }
      }
    } catch (err) {
      if (nonStreamGenerationPhaseTimerRef.current) {
        clearTimeout(nonStreamGenerationPhaseTimerRef.current);
        nonStreamGenerationPhaseTimerRef.current = null;
      }
      clearNotebookNonStreamLoadingPhasesRef.current();
      clearNotebookNonStreamLoadingPhasesRef.current = () => {};
      cancelStreamPhaseTimers();
      setNonStreamGenerationPhase(null);
      const error = err instanceof Error ? err : new Error(String(err));
      errorLogger.error('NotebookLLM 응답 생성 실패', error, {
        component: 'NotebookLLM',
        action: 'generateResponse',
        projectId,
        useStreaming,
      });
      setError(error);
      setIsStreaming(false);
      setIsLoading(false);

      // 에러 콜백 호출
      if (onError) {
        try {
          onError(error);
        } catch (callbackError) {
          errorLogger.error('onError 콜백 실행 중 오류', callbackError instanceof Error ? callbackError : new Error(String(callbackError)), {
            component: 'NotebookLLM',
            action: 'onErrorCallback',
          });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptTrimmed, writingTopicTrimmed, projectId, config, useStreaming, conversationId, selectedWritingStyle, writingTopic, applyWritingStyle, onResponseComplete, onError, selectedDomains, selectedRealEstateData, dlIntegrationEnabled, isOffline]);

  // 설정 업데이트
  const handleConfigChange = useCallback((newConfig: Partial<NotebookLLMConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    if (projectId) {
      notebookLLMService.setProjectNotebookConfig(projectId, updatedConfig);
    } else {
      notebookLLMService.setDefaultConfig(updatedConfig);
    }
  }, [config, projectId]);

  // 도메인 선택 핸들러
  const _handleDomainToggle = useCallback((domain: DomainType) => {
    setSelectedDomains(prev => {
      if (prev.includes(domain)) {
        return prev.filter(d => d !== domain);
      } else {
        return [...prev, domain];
      }
    });
  }, []);

  // 프로젝트별 도메인 설정 저장
  const _handleSaveDomainConfig = useCallback(() => {
    if (projectId) {
      try {
        localStorage.setItem(`domainConfig_${projectId}`, JSON.stringify(selectedDomains));
      } catch (error) {
        errorLogger.error('도메인 설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
          component: 'NotebookLLM',
          action: 'saveDomainConfig',
          projectId,
        });
      }
    }
    setShowDomainSelector(false);
  }, [projectId, selectedDomains]);

  // 대화 초기화
  useEffect(() => {
    if (!conversationId) {
      const conversation = conversationHistoryService.createConversation(
        projectId ? '프로젝트 노트북 (딥시크)' : '노트북 (딥시크)',
        projectId
      );
      setConversationId(conversation.id);
    }
  }, [conversationId, projectId]);

  // 스트리밍 콘텐츠 자동 스크롤 (prefers-reduced-motion 시 즉시 이동)
  useEffect(() => {
    if (streamingContent && responseEndRef.current) {
      const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      responseEndRef.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    }
  }, [streamingContent]);

  // 에러 발생 시 에러 영역으로 스크롤 (prefers-reduced-motion 시 즉시 이동)
  useEffect(() => {
    if (error && errorRef.current) {
      const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      errorRef.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    }
  }, [error]);

  const cancelStreaming = useCallback(() => {
    cancelStreamPhaseTimers();
    if (streamingAbortRef.current) {
      streamingAbortRef.current.abort();
      streamingAbortRef.current = null;
    }
  }, [cancelStreamPhaseTimers]);

  // Enter 키 처리 (Cmd/Ctrl+Enter 생성, Escape 스트리밍 중지)
  // ArrowUp/ArrowDown: 프롬프트 히스토리 탐색
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleGenerate();
    } else if (e.key === 'Escape' && isStreaming) {
      e.preventDefault();
      cancelStreaming();
    } else if (!e.altKey && !e.metaKey && !e.ctrlKey) {
      if (e.key === 'ArrowUp' && promptHistoryRef.current.length > 0) {
        const hist = promptHistoryRef.current;
        let idx = promptHistoryIndexRef.current;
        if (idx < hist.length - 1) {
          idx += 1;
          promptHistoryIndexRef.current = idx;
          setPrompt(hist[idx]);
          e.preventDefault();
        } else if (idx === -1) {
          promptHistoryIndexRef.current = 0;
          setPrompt(hist[0]);
          e.preventDefault();
        }
      } else if (e.key === 'ArrowDown' && promptHistoryIndexRef.current >= 0) {
        const idx = promptHistoryIndexRef.current;
        if (idx > 0) {
          promptHistoryIndexRef.current = idx - 1;
          setPrompt(promptHistoryRef.current[promptHistoryIndexRef.current]);
          e.preventDefault();
        } else {
          promptHistoryIndexRef.current = -1;
          setPrompt('');
          e.preventDefault();
        }
      }
    }
  }, [handleGenerate, isStreaming, cancelStreaming]);

  return (
    <section className="notebook-llm bw-detail-root" ref={notebookLlmRef} aria-label={projectId ? '프로젝트 노트북 (딥시크)' : '노트북 (딥시크)'} data-testid="page-notebook">
      {isOffline && (
        <div className="notebook-llm-offline-banner" role="alert" data-testid="notebook-llm-offline-banner">
          오프라인 상태입니다. 네트워크 연결 후 응답 생성을 사용할 수 있습니다.
        </div>
      )}
      <div className="notebook-llm-header bw-detail-header">
        <div className="bw-detail-header-inner">
          <div className="bw-detail-header-left">
            <div className="bw-detail-header-icon">
              <BookOpen size={20} aria-hidden />
            </div>
            <div>
              <h3 className="notebook-llm-title bw-detail-header-title">
                {projectId ? '프로젝트 노트북 (딥시크)' : '노트북 (딥시크)'}
              </h3>
              <p className="bw-detail-header-desc">프로젝트별 학습·정리 기반으로 답변을 생성하며, 도시정비·재건축·재개발 실무 질의에 특화되어 있습니다</p>
            </div>
          </div>
          {status ? (
          <div className="notebook-llm-status" role="status" aria-label={status.available ? '딥시크(노트북) 사용 가능' : '딥시크(노트북) 사용 불가'}>
            <span className={`status-indicator ${status.available ? 'available' : 'unavailable'}`} aria-hidden>
              {status.available ? '●' : '○'}
            </span>
            <span className="status-text">
              {status.available ? '사용 가능' : '사용 불가'}
            </span>
            {status.currentModel && (
              <span className="current-model">{status.currentModel}</span>
            )}
          </div>
        ) : projectId ? (
          <div className="notebook-llm-status" aria-busy="true">
            <span className="status-text">로딩 중...</span>
          </div>
        ) : null}
        </div>
      </div>

      <div className="notebook-llm-body notebook-llm-layout-three">
        <aside className="notebook-llm-panel notebook-llm-panel-sources" role="region" aria-label="출처 (소스)">
          {projectId ? (
            <>
              <h4 className="notebook-llm-panel-title">출처</h4>
              {leftPanelSources && leftPanelSources.length > 0 ? (
                <>
                  <p className="notebook-llm-sources-count">{leftPanelSources.length}개 소스</p>
                  <ul className="notebook-llm-sources-list" aria-label="소스 목록">
                    {leftPanelSources.map((s) => (
                      <li key={s.id} className="notebook-llm-source-item">
                        <span className="notebook-llm-source-type">{s.type}</span>
                        <span className="notebook-llm-source-title" title={s.title}>{s.title}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="notebook-llm-sources-empty">소스 없음</p>
              )}
              <button
                type="button"
                className="notebook-llm-panel-btn analysis-button"
                onClick={handleLoadAnalysis}
                disabled={analysisLoading}
                aria-label="노트북 소스 분석"
                aria-busy={analysisLoading}
              >
                {analysisLoading ? '분석 중...' : '📊 분석'}
              </button>
              <div className="notebook-llm-add-knowledge" role="region" aria-label="지식 쌓기 (딥시크에 반영)">
                <button
                  type="button"
                  className="notebook-llm-panel-btn add-knowledge-toggle"
                  onClick={() => setShowAddKnowledgeForm((v) => !v)}
                  aria-expanded={showAddKnowledgeForm}
                  aria-label={showAddKnowledgeForm ? '지식 추가 폼 접기' : '지식 추가 (여기에 쌓은 내용이 딥시크 답변에 반영됩니다)'}
                >
                  {showAddKnowledgeForm ? '접기' : '➕ 지식 추가'}
                </button>
                {showAddKnowledgeForm && (
                  <div className="add-knowledge-form">
                    <p className="add-knowledge-hint">제목과 내용을 입력하면 이 프로젝트의 지식으로 쌓이고, 딥시크 답변에 반영됩니다.</p>
                    <input
                      type="text"
                      className="add-knowledge-title-input"
                      value={addKnowledgeTitle}
                      onChange={(e) => { setAddKnowledgeTitle(e.target.value); setAddKnowledgeError(null); }}
                      placeholder="제목 (예: 시공사 선정 절차)"
                      aria-label="지식 제목"
                      maxLength={200}
                    />
                    <textarea
                      className="add-knowledge-content-input"
                      value={addKnowledgeContent}
                      onChange={(e) => { setAddKnowledgeContent(e.target.value); setAddKnowledgeError(null); }}
                      placeholder="내용을 입력하세요. 여러 문단 가능."
                      aria-label="지식 내용"
                      rows={4}
                    />
                    {addKnowledgeError && (
                      <p role="alert" className="add-knowledge-error">{addKnowledgeError}</p>
                    )}
                    <button
                      type="button"
                      className="bw-btn-primary add-knowledge-submit"
                      onClick={() => void handleAddKnowledge()}
                      disabled={
                        addKnowledgeLoading ||
                        !coerceTrimmedString(addKnowledgeTitle, '') ||
                        !coerceTrimmedString(addKnowledgeContent, '')
                      }
                      aria-busy={addKnowledgeLoading}
                      aria-label="지식 저장"
                    >
                      {addKnowledgeLoading ? '저장 중...' : '지식 저장'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="notebook-llm-sources-empty">프로젝트를 선택하면 출처가 표시됩니다.</p>
          )}
        </aside>
        <main className="notebook-llm-panel notebook-llm-panel-chat">

      {/* 설정 패널 */}
      <div className={`notebook-llm-config ${configExpanded ? 'expanded' : 'collapsed'}`}>
        <button
          type="button"
          className="config-toggle-btn"
          onClick={() => {
            const next = !configExpanded;
            setConfigExpanded(next);
            try {
              localStorage.setItem(NOTEBOOK_LLM_CONFIG_EXPANDED_UI_STORAGE_KEY, String(next));
            } catch { /* ignore */ }
          }}
          aria-expanded={configExpanded}
          aria-controls="notebook-llm-config-content"
          aria-label={configExpanded ? '설정 접기' : '설정 펼치기'}
          title={configExpanded ? '설정 패널 접기' : '설정 패널 펼치기'}
          data-testid="notebook-llm-config-toggle"
        >
          <span className="config-toggle-icon" aria-hidden>{configExpanded ? '▼' : '▶'}</span>
          <span>{configExpanded ? '설정 접기' : '설정 펼치기'}</span>
          {!configExpanded && (
            <span className="config-toggle-summary">
              스트리밍 {useStreaming ? 'ON' : 'OFF'} · 온도 {config.temperature} · {config.modelType}
            </span>
          )}
        </button>
        {configExpanded && (
        <>
        <div id="notebook-llm-config-content" className="config-content" role="region" aria-label="LLM 설정">
        <div className="config-row">
          <label htmlFor="model-type">모델 타입:</label>
          <select
            id="model-type"
            value={config.modelType}
            onChange={(e) => handleConfigChange({ modelType: e.target.value as NotebookLLMConfig['modelType'] })}
          >
            <option value="auto">자동 선택 (서버·딥시크 등)</option>
            <option value="llama3.1:8b">Llama 3.1 (8B)</option>
            <option value="qwen2.5:7b">Qwen 2.5 (7B)</option>
            <option value="gemma2:9b">Gemma 2 (9B)</option>
            <option value="kullm:12.8b">Kullm (12.8B)</option>
            <option value="polyglot-ko:12.8b">Polyglot-Ko (12.8B)</option>
          </select>
        </div>
        <div className="config-row">
          <label htmlFor="processing-mode">처리 모드:</label>
          <select
            id="processing-mode"
            value={config.processingMode}
            onChange={(e) => handleConfigChange({ processingMode: e.target.value as NotebookLLMConfig['processingMode'] })}
            aria-label="처리 모드 선택"
          >
            <option value="auto">자동</option>
            <option value="local_only">로컬만</option>
            <option value="cloud_only">클라우드만</option>
            <option value="hybrid">하이브리드</option>
          </select>
        </div>
        <div className="config-row">
          <label htmlFor="temperature-slider">온도: {config.temperature}</label>
          <input
            id="temperature-slider"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => handleConfigChange({ temperature: Number.parseFloat(e.target.value) })}
            aria-label={`온도 설정: ${config.temperature}`}
            aria-valuemin={0}
            aria-valuemax={2}
            aria-valuenow={config.temperature}
          />
        </div>
        <div className="config-row">
          <label htmlFor="streaming-mode">
            <input
              id="streaming-mode"
              type="checkbox"
              checked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
              aria-label="스트리밍 모드 사용"
            />
            스트리밍 모드
          </label>
        </div>
        <div className="config-row">
          <label htmlFor="dl-integration">
            <input
              id="dl-integration"
              type="checkbox"
              checked={dlIntegrationEnabled}
              onChange={(e) => setDlIntegrationEnabled(e.target.checked)}
              aria-label="딥러닝 연동 (의도·품질 분석)"
            />
            <span title="프롬프트 의도·감정·주제 분석 후 딥시크 호출, 응답 품질·감정 분석 표시">🧠 딥러닝 연동 (의도·품질 분석)</span>
          </label>
        </div>
        <div className="config-row">
          <button
            type="button"
            className="template-button"
            onClick={() => setShowTemplates(!showTemplates)}
            aria-label={showTemplates ? '템플릿 숨기기' : '프롬프트 템플릿'}
          >
            {showTemplates ? '템플릿 숨기기' : '프롬프트 템플릿'}
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`writing-style-button ${selectedWritingStyle ? 'active' : ''}`}
            onClick={() => setShowWritingStyleSelector(!showWritingStyleSelector)}
            aria-label="글쓰기 스타일 선택"
          >
            {selectedWritingStyle
              ? `✍️ ${writingStyleService.getStyle(selectedWritingStyle)?.name || '스타일 선택됨'}`
              : '✍️ 글쓰기 스타일 선택 (44종)'
            }
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`tone-selector-button ${selectedTone || selectedAgeGroup ? 'active' : ''}`}
            onClick={() => setShowToneSelector(!showToneSelector)}
            aria-label="어투/말투 선택"
          >
            {selectedTone || selectedAgeGroup
              ? `🎭 ${toneService.getToneTypeName(selectedTone)}${selectedAgeGroup ? ` (${toneService.getAgeGroupName(selectedAgeGroup)})` : ''}`
              : '🎭 어투/말투 선택'
            }
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`domain-selector-button ${selectedDomains.length > 0 ? 'active' : ''}`}
            onClick={() => setShowDomainSelector(!showDomainSelector)}
            aria-label={showDomainSelector ? '도메인 지식 선택 닫기 (Escape)' : '도메인 지식 선택'}
            aria-keyshortcuts={showDomainSelector ? 'Escape' : undefined}
            title={showDomainSelector ? '닫기 (Escape)' : '도메인 지식 선택'}
          >
            {selectedDomains.length > 0
              ? `📚 도메인 선택됨 (${selectedDomains.length}개)`
              : '📚 도메인 지식 선택'
            }
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`mindmap-button ${showMindMap ? 'active' : ''}`}
            onClick={() => setShowMindMap(!showMindMap)}
            aria-label={showMindMap ? '마인드맵 숨기기 (Escape)' : '지식 마인드맵 보기'}
            aria-keyshortcuts={showMindMap ? 'Escape' : undefined}
            title={showMindMap ? '마인드맵 숨기기 (Escape)' : '지식 마인드맵 보기'}
          >
            {showMindMap ? '🗺️ 마인드맵 숨기기' : '🗺️ 지식 마인드맵 보기'}
          </button>
        </div>
        <div className="config-row">
          <button
            type="button"
            className={`real-estate-data-button ${showRealEstateData ? 'active' : ''}`}
            onClick={() => setShowRealEstateData(!showRealEstateData)}
            aria-label={showRealEstateData ? '부동산 데이터 숨기기 (Escape)' : '실거래/등기 정보 보기'}
            aria-keyshortcuts={showRealEstateData ? 'Escape' : undefined}
            title={showRealEstateData ? '부동산 데이터 숨기기 (Escape)' : '실거래/등기 정보 보기'}
          >
            {showRealEstateData ? '🏢 부동산 데이터 숨기기' : '🏢 실거래/등기 정보'}
          </button>
        </div>
        {projectId && (
          <>
        <div className="config-row">
          <button
            type="button"
            className={`analysis-button ${showAnalysis ? 'active' : ''}`}
            onClick={handleLoadAnalysis}
            disabled={analysisLoading}
            aria-label="노트북 소스 분석"
            aria-busy={analysisLoading}
            title={analysisLoading ? '분석 중...' : '프로젝트 소스 분석·정관 등록'}
          >
            {analysisLoading ? '📊 분석 중...' : '📊 분석'}
          </button>
          {projectId && associationBylawsService.hasBylaws(projectId) && (
            <span className="bylaws-badge" title="조합 정관 등록됨 – 질의 시 현장별 기본 지식으로 활용">📋 정관</span>
          )}
          {projectId && (
            <>
              <button
                type="button"
                className="fast-research-btn"
                title="웹 검색으로 새 소스 추가"
                aria-label="웹/Fast Research"
                onClick={() => setShowWebResearchModal(true)}
              >
                🔍 웹 검색
              </button>
              <button
                type="button"
                className="fast-research-btn"
                title="심층 보고서·새 소스 탐색"
                aria-label="Deep Research"
                onClick={() => setShowDeepResearchModal(true)}
              >
                📚 Deep Research
              </button>
              <button
                type="button"
                className="fast-research-stub-btn"
                title="Google Drive에서 소스 가져오기 (준비 중)"
                aria-label="Drive 연동 (준비 중)"
                onClick={() => setShowDriveModal(true)}
                data-testid="drive-stub-btn"
              >
                📁 Drive (준비 중)
              </button>
            </>
          )}
        </div>
          </>
        )}
        </div>
          </>
        )}
      </div>

        </main>

      {/* 오른쪽 패널: 스튜디오 (구글 노트북 LM 동일 구성) */}
        <aside className="notebook-llm-panel notebook-llm-panel-studio" role="region" aria-label="스튜디오">
          {projectId ? (
        <div className="notebook-llm-studio" role="region" aria-labelledby="studio-panel-title" aria-busy={studioGenerating}>
          <h4 id="studio-panel-title">스튜디오</h4>
          <p className="studio-description">
            학습된 프로젝트 소스를 바탕으로 보고서·학습 가이드·퀴즈·요약 등을 생성합니다. 생성된 항목은 저장됩니다.
          </p>
          {studioGenerating && (
            <div role="status" aria-live="polite" className="sr-only">스튜디오 출력 생성 중입니다. 잠시만 기다려 주세요.</div>
          )}
          <div className="studio-generate-row">
            <label htmlFor="studio-type-select">유형:</label>
            <select
              id="studio-type-select"
              value={selectedStudioType}
              onChange={(e) => setSelectedStudioType(e.target.value)}
              aria-label="스튜디오 출력 유형 선택"
            >
              {Object.entries(STUDIO_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              type="button"
              className="studio-generate-btn"
              onClick={() => void handleGenerateStudio()}
              disabled={studioGenerating}
              aria-busy={studioGenerating}
              aria-label="스튜디오 출력 생성"
              title="소스가 프로젝트에 없으면 생성할 수 없습니다. 먼저 📊 분석에서 소스를 추가하세요."
              data-testid="studio-generate-btn"
            >
              {studioGenerating ? `생성 중... (${studioElapsedSec}초)` : '생성'}
            </button>
          </div>
          <div className="studio-outputs-list">
            <div className="studio-outputs-header">
              <h5>생성 이력 ({studioOutputs.length}개)</h5>
              {studioOutputs.length > 0 && (
                <select
                  className="studio-sort-select"
                  value={studioOutputSort}
                  onChange={(e) => setStudioOutputSort(e.target.value as 'recent' | 'oldest' | 'type')}
                  aria-label="생성 이력 정렬"
                >
                  <option value="recent">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="type">유형별</option>
                </select>
              )}
            </div>
            {studioOutputs.length === 0 ? (
              <div className="studio-empty-state">
                <div className="studio-empty-icon" aria-hidden>📄</div>
                <h4 className="studio-empty-title">아직 생성된 항목이 없습니다</h4>
                <p className="studio-empty-desc">위에서 유형(보고서·퀴즈·플래시카드 등)을 선택하고 [생성] 버튼을 눌러 시작하세요.</p>
                <p className="studio-empty-hint">소스가 프로젝트에 추가되어 있어야 합니다.</p>
                <button
                  type="button"
                  className="bw-btn-secondary studio-empty-cta"
                  onClick={() => setShowAnalysis(true)}
                  aria-label="분석 모달 열기 - 소스 추가"
                  data-testid="studio-empty-cta"
                >
                  📊 소스 추가하기
                </button>
              </div>
            ) : (
              <ul aria-label="스튜디오 생성 이력 목록">
                {sortedStudioOutputs.map((out) => (
                  <li key={out.id} className="studio-output-item">
                    <span className="studio-output-type">{STUDIO_TYPE_LABELS[out.type] || out.type}</span>
                    <span className="studio-output-date">{new Date(out.created_at).toLocaleString('ko-KR')}</span>
                    <button
                      type="button"
                      className="studio-view-btn"
                      onClick={() => setViewingStudioOutput(out)}
                      aria-label={`${STUDIO_TYPE_LABELS[out.type] || out.type} 보기`}
                    >
                      보기
                    </button>
                    <button
                      type="button"
                      className="studio-copy-btn"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(out.content);
                          setCopyResponseToast(true);
                          setTimeout(() => setCopyResponseToast(false), 2000);
                        } catch { /* ignore */ }
                      }}
                      aria-label="복사"
                      title="클립보드에 복사"
                    >
                      복사
                    </button>
                    <button
                      type="button"
                      className="studio-delete-btn"
                      onClick={() => handleDeleteStudioOutput(out.id)}
                      aria-label="삭제"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="studio-memo-section">
            <h5>메모</h5>
            <textarea
              className="studio-memo-textarea"
              data-testid="studio-memo"
              value={studioMemo}
              onChange={(e) => setStudioMemo(e.target.value)}
              onBlur={(e) => saveStudioMemo(e.target.value)}
              placeholder="스튜디오 출력에 대한 메모를 작성하세요. 자동 저장됩니다."
              rows={3}
              aria-label="스튜디오 메모"
            />
          </div>
        </div>
          ) : (
            <p className="notebook-llm-sources-empty">프로젝트를 선택하면 스튜디오를 사용할 수 있습니다.</p>
          )}
        </aside>
      </div>

      {/* 스튜디오 출력 보기 모달 */}
      {viewingStudioOutput && (
        <div
          className="studio-view-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-view-title"
          onClick={(e) => { if (e.target === e.currentTarget) setViewingStudioOutput(null); }}
        >
          <div className="studio-view-modal">
            <div className="studio-view-header">
              <h3 id="studio-view-title">
                {STUDIO_TYPE_LABELS[viewingStudioOutput.type] || viewingStudioOutput.type} · {new Date(viewingStudioOutput.created_at).toLocaleString('ko-KR')}
              </h3>
              <div className="studio-view-actions">
                <button
                  type="button"
                  className="studio-download-btn"
                  onClick={() => {
                    const blob = new Blob([viewingStudioOutput.content], { type: 'text/markdown;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${(STUDIO_TYPE_LABELS[viewingStudioOutput.type] || viewingStudioOutput.type).replace(/[\s/\\]/g, '_')}_${new Date(viewingStudioOutput.created_at).toISOString().slice(0, 10)}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setStudioDownloadToast(true);
                    setTimeout(() => setStudioDownloadToast(false), 2000);
                  }}
                  aria-label="마크다운 다운로드"
                  title="마크다운(.md) 파일로 저장"
                >
                  📥 MD
                </button>
                <button
                  type="button"
                  className="studio-download-btn"
                  onClick={() => {
                    const plain = viewingStudioOutput.content
                      .replace(/#{1,6}\s+/g, '')
                      .replace(/\*\*(.+?)\*\*/g, '$1')
                      .replace(/\*(.+?)\*/g, '$1')
                      .replace(/_(.+?)_/g, '$1')
                      .replace(/`(.+?)`/g, '$1')
                      .replace(/\[(.+?)\]\(.+?\)/g, '$1');
                    const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${(STUDIO_TYPE_LABELS[viewingStudioOutput.type] || viewingStudioOutput.type).replace(/[\s/\\]/g, '_')}_${new Date(viewingStudioOutput.created_at).toISOString().slice(0, 10)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setStudioDownloadToast(true);
                    setTimeout(() => setStudioDownloadToast(false), 2000);
                  }}
                  aria-label="텍스트 다운로드"
                  title="일반 텍스트(.txt) 파일로 저장"
                >
                  📥 TXT
                </button>
                <button
                  type="button"
                  className="studio-download-btn"
                  onClick={() => {
                    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) return;
                    const title = esc(STUDIO_TYPE_LABELS[viewingStudioOutput.type] || viewingStudioOutput.type);
                    const date = esc(new Date(viewingStudioOutput.created_at).toLocaleString('ko-KR'));
                    const body = esc(viewingStudioOutput.content);
                    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:24px auto;padding:0 24px;line-height:1.6;color:#141718}pre{white-space:pre-wrap;word-break:break-word;background:#F3F5F7;padding:16px;border-radius:8px;border:1px solid rgba(0,0,0,0.1)}</style></head><body><h1>${title}</h1><p>${date}</p><hr/><pre>${body}</pre></body></html>`);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                  }}
                  aria-label="인쇄"
                  title="인쇄"
                >
                  🖨️ 인쇄
                </button>
                <button
                  type="button"
                  className="studio-listen-btn"
                  onClick={() => speakStudioContent(viewingStudioOutput.content)}
                  aria-label={studioOutputSpeaking ? '읽기 중지' : '음성으로 듣기'}
                  aria-pressed={studioOutputSpeaking}
                >
                  {studioOutputSpeaking ? '⏹ 중지' : '🔊 음성으로 듣기'}
                </button>
                <button
                  type="button"
                  className="studio-delete-btn studio-delete-outline-btn"
                  onClick={() => {
                    if (studioOutputSpeaking) {
                      window.speechSynthesis.cancel();
                      setStudioOutputSpeaking(false);
                    }
                    setViewingStudioOutput(null);
                    setStudioDeleteConfirmId(viewingStudioOutput.id);
                  }}
                  aria-label="삭제"
                  title="이 출력 삭제"
                >
                  🗑 삭제
                </button>
                <button
                  ref={studioViewCloseRef}
                  type="button"
                  className="studio-close-btn"
                  onClick={() => {
                    if (studioOutputSpeaking) {
                      window.speechSynthesis.cancel();
                      setStudioOutputSpeaking(false);
                    }
                    setViewingStudioOutput(null);
                  }}
                  aria-label="닫기 (Escape)"
                  aria-keyshortcuts="Escape"
                  title="닫기 (Escape)"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="studio-view-content">
              <AssistantGensparkBody
                text={viewingStudioOutput.content}
                embedded
                enhancedCodeBlocks
              />
            </div>
          </div>
        </div>
      )}

      {/* 노트북 소스 분석 모달 (Phase 3) */}
      {showAnalysis && (
        <div
          className="studio-view-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="analysis-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAnalysis(false); }}
        >
          <div className="studio-view-modal notebook-analysis-modal">
            <div className="studio-view-header">
              <h3 id="analysis-modal-title">📊 노트북 소스 분석</h3>
              <button
                type="button"
                className="studio-close-btn"
                onClick={() => setShowAnalysis(false)}
                aria-label="닫기 (Escape)"
                aria-keyshortcuts="Escape"
                title="닫기 (Escape)"
              >
                ✕
              </button>
            </div>
            <div className="studio-view-content">
              {analysisLoading ? (
                <div className="analysis-loading-skeleton" aria-live="polite" aria-label="분석 로딩 중">
                  <div className="analysis-skeleton-stats">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="analysis-skeleton-stat">
                        <div className="skeleton-line" />
                        <div className="skeleton-line" />
                      </div>
                    ))}
                  </div>
                  <div className="analysis-skeleton-keywords">
                    <div className="skeleton-line" />
                    <div className="analysis-skeleton-chips">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="skeleton-line" />
                      ))}
                    </div>
                  </div>
                  <div className="analysis-skeleton-preview">
                    <div className="skeleton-line" />
                    <LoadingSkeleton type="list" lines={4} />
                  </div>
                  <p className="analysis-loading-text">소스 분석 중…</p>
                </div>
              ) : analysisData ? (
                <div className="analysis-content">
                  <div className="analysis-stats">
                    <div className="analysis-stat">
                      <span className="stat-label">소스 수</span>
                      <span className="stat-value">{analysisData.source_count}</span>
                    </div>
                    <div className="analysis-stat">
                      <span className="stat-label">단어 수</span>
                      <span className="stat-value">{analysisData.wordCount}</span>
                    </div>
                    <div className="analysis-stat">
                      <span className="stat-label">문자 수</span>
                      <span className="stat-value">{analysisData.context.length}</span>
                    </div>
                    {projectId && associationBylawsService.hasBylaws(projectId) && (
                      <div className="analysis-stat analysis-stat-bylaws" title="조합 정관이 등록되어 질의 시 현장별 기본 지식으로 활용됩니다">
                        <span className="stat-label">정관</span>
                        <span className="stat-value" aria-label="정관 등록됨">✓</span>
                        <button
                          type="button"
                          className="bylaws-remove-btn"
                          onClick={() => {
                            if (projectId && window.confirm('등록된 조합 정관을 삭제하시겠습니까? 질의 시 현장별 기본 지식이 더 이상 활용되지 않습니다.')) {
                              associationBylawsService.removeBylaws(projectId);
                              setBylawsRemoved((v) => v + 1);
                              setBylawsRemovedToast(true);
                              setTimeout(() => setBylawsRemovedToast(false), 2500);
                              onSourcesChanged?.();
                            }
                          }}
                          aria-label="정관 삭제"
                          title="등록된 정관 삭제"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  {analysisData.keywords.length > 0 && (
                    <div className="analysis-keywords">
                      <h4>핵심 키워드</h4>
                      <div className="keywords-chips">
                        {analysisData.keywords.map((kw, i) => (
                          <span key={i} className="keyword-chip">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysisData.sources && analysisData.sources.length > 0 && (
                    <div className="analysis-sources">
                      <h4>
                        소스 목록 (대화 반영)
                        <span className="source-select-count">
                          {selectedSourceIds === null
                            ? `전체 ${analysisData.sources.length}개 사용`
                            : selectedSourceIds.length === 0
                              ? '0개 (대화 시 소스 미사용)'
                              : `${selectedSourceIds.length}개 선택됨`}
                        </span>
                        <span className="source-select-actions">
                          <button type="button" className="source-select-btn" onClick={() => selectAllSources(analysisData.sources!)} aria-label="모든 소스 선택">전체 선택</button>
                          <button type="button" className="source-select-btn" onClick={() => deselectAllSources(analysisData.sources!)} aria-label="모든 소스 선택 해제">전체 해제</button>
                        </span>
                      </h4>
                      {analysisData.sources.length > 5 && (
                        <input
                          type="text"
                          className="source-search-input"
                          placeholder="소스 검색..."
                          value={analysisSourceSearch}
                          onChange={(e) => setAnalysisSourceSearch(e.target.value)}
                          aria-label="소스 검색"
                        />
                      )}
                      <ul className="source-list-with-checkbox">
                        {(() => {
                          const needle = analysisSourceSearchTrimmed.toLowerCase();
                          const filtered = analysisData.sources.filter(
                            (s) =>
                              !analysisSourceSearchTrimmed ||
                              s.title.toLowerCase().includes(needle) ||
                              s.type.toLowerCase().includes(needle)
                          );
                          if (filtered.length === 0) {
                            return <li className="source-list-empty">검색 결과가 없습니다.</li>;
                          }
                          return filtered.map((s) => {
                            const isChecked = selectedSourceIds === null || selectedSourceIds.includes(s.id);
                            return (
                              <li key={s.id} className="source-item-with-checkbox">
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleSourceSelection(s.id, analysisData.sources!)}
                                    data-testid={`source-checkbox-${s.id}`}
                                  />
                                  <span className="source-type">{s.type}</span> {s.title}
                                </label>
                              </li>
                            );
                          });
                        })()}
                      </ul>
                    </div>
                  )}
                  {analysisData.has_context && analysisData.context && (
                    <div className="analysis-preview">
                      <h4>콘텐츠 미리보기</h4>
                      <p className="preview-text">{analysisData.context}</p>
                    </div>
                  )}
                  {!analysisData.has_context && (
                    <p className="analysis-empty">학습된 소스가 없습니다. 소스를 추가해 주세요.</p>
                  )}
                  {/* 정관 요약 미리보기 */}
                  {projectId && associationBylawsService.hasBylaws(projectId) && (() => {
                    const analysis = associationBylawsService.getBylawsAnalysis(projectId);
                    const kb = associationBylawsService.getBylawsBaseKnowledge(projectId);
                    return kb ? (
                      <div className="analysis-bylaws-preview" role="region" aria-label="조합 정관 요약">
                        <h4>조합 정관 요약</h4>
                        {analysis && (
                          <div className="bylaws-preview-header">
                            <span className="bylaws-site">{analysis.siteName}</span>
                            <span className="bylaws-combination">{analysis.combinationName}</span>
                            {analysis.analyzedAt && (() => {
                              const analyzedDate = new Date(analysis.analyzedAt);
                              const daysSince = Math.floor((Date.now() - analyzedDate.getTime()) / 86400000);
                              const needsRefresh = daysSince >= 180;
                              return (
                                <span
                                  className={`bylaws-analyzed-at ${needsRefresh ? 'bylaws-analyzed-stale' : ''}`}
                                  title={needsRefresh ? '6개월 이상 지났습니다. 최신 정관으로 갱신해 주세요.' : analyzedDate.toISOString()}
                                >
                                  분석: {analyzedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  {needsRefresh && (
                                    <>
                                      {' · '}
                                      <button
                                        type="button"
                                        className="bylaws-refresh-link"
                                        onClick={() => bylawsPasteSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                        aria-label="정관 갱신 영역으로 이동"
                                      >
                                        갱신
                                      </button>
                                    </>
                                  )}
                                </span>
                              );
                            })()}
                          </div>
                        )}
                        <p className="bylaws-summary">{kb.summary}</p>
                        {kb.keyPoints.length > 0 && (
                          <div className="bylaws-keypoints-wrap">
                            <ul className="bylaws-keypoints">
                              {(bylawsKeypointsExpanded ? kb.keyPoints : kb.keyPoints.slice(0, 5)).map((kp, i) => (
                                <li key={i}>{kp}</li>
                              ))}
                            </ul>
                            {kb.keyPoints.length > 5 && (
                              <button
                                type="button"
                                className="bylaws-keypoints-toggle"
                                onClick={() => setBylawsKeypointsExpanded((v) => !v)}
                                aria-expanded={bylawsKeypointsExpanded}
                              >
                                {bylawsKeypointsExpanded ? '접기' : `더보기 (${kb.keyPoints.length - 5}개)`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                  {/* 정관 텍스트 수동 등록 */}
                  {projectId && (
                    <div ref={bylawsPasteSectionRef} className="analysis-add-source bylaws-paste-section">
                      <h4>정관 텍스트 붙여넣기</h4>
                      <p className="analysis-add-hint">
                        조합 정관 원문을 붙여넣으면 핵심 항목(임원·총회·시공사선정·비용분담·분양 등)을 추출하여 현장별 기본 지식으로 등록합니다.
                      </p>
                      <textarea
                        value={bylawsPasteText}
                        onChange={(e) => { setBylawsPasteText(e.target.value); setAddSourceError(null); }}
                        placeholder="조합 정관 원문을 붙여넣어 주세요 (최소 100자). 조합명·이사회·총회·시공자 선정·분담금 등이 포함된 텍스트가 좋습니다."
                        className="message-input bylaws-paste-textarea"
                        rows={4}
                        disabled={bylawsPasteLoading}
                        aria-label="정관 텍스트"
                      />
                      {bylawsPasteTrimmed.length > 0 && (
                        <span className={`bylaws-paste-count ${bylawsPasteTrimmed.length > 150000 ? 'bylaws-paste-count-over' : ''}`} aria-live="polite">
                          {bylawsPasteTrimmed.length.toLocaleString()}자
                          {bylawsPasteTrimmed.length < 100 && ' (100자 이상 입력해 주세요)'}
                          {bylawsPasteTrimmed.length > 150000 && ' (15만 자 이하로 줄여 주세요)'}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleBylawsPaste()}
                        disabled={
                          bylawsPasteLoading ||
                          !bylawsPasteTrimmed ||
                          bylawsPasteTrimmed.length < 100 ||
                          bylawsPasteTrimmed.length > 150000
                        }
                        aria-busy={bylawsPasteLoading}
                        aria-label="정관 등록"
                        className="bw-btn-primary analysis-add-source-btn"
                      >
                        {bylawsPasteLoading ? '등록 중...' : '정관 등록'}
                      </button>
                    </div>
                  )}
                  {/* URL로 소스 추가 (웹페이지·문서 URL) */}
                  <div className="analysis-add-source">
                    <h4>URL로 소스 추가</h4>
                    <p className="analysis-add-hint">
                      웹페이지 또는 문서 URL을 입력하면 콘텐츠를 추출해 노트북에 추가합니다.
                    </p>
                    <div className="analysis-add-source-row">
                      <input
                        ref={addSourceUrlInputRef}
                        type="url"
                        value={addSourceUrl}
                        onChange={(e) => { setAddSourceUrl(e.target.value); setAddSourceError(null); }}
                        placeholder={DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL}
                        className="message-input analysis-add-source-input"
                        disabled={addSourceLoading}
                        aria-label="소스 URL (Enter로 추가)"
                        aria-keyshortcuts="Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleAddSourceFromUrl();
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => void handleAddSourceFromUrl()}
                        disabled={addSourceLoading || !addSourceUrlTrimmed}
                        aria-busy={addSourceLoading}
                        aria-label="URL로 소스 추가"
                        className="bw-btn-primary analysis-add-source-btn"
                      >
                        {addSourceLoading ? `추가 중... (${addSourceElapsedSec}초)` : '추가'}
                      </button>
                    </div>
                    {addSourceError && (() => {
                      const errInfo = getUserFriendlyError(new Error(addSourceError));
                      return (
                        <div role="alert" className="add-source-error">
                          <p className="add-source-error-message">{errInfo.userMessage}</p>
                          {errInfo.suggestions.length > 0 && (
                            <ul className="add-source-error-suggestions" aria-label="해결 제안">
                              {errInfo.suggestions.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          )}
                          {errInfo.canRetry && (
                            <button
                              type="button"
                              className="add-source-retry-btn"
                              onClick={() => {
                                setAddSourceError(null);
                                void handleAddSourceFromUrl();
                              }}
                              disabled={addSourceLoading}
                              aria-label="다시 시도"
                            >
                              다시 시도
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <p>분석 데이터를 불러올 수 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 웹/Fast Research 모달 */}
      {projectId && (
        <WebResearchModal
          open={showWebResearchModal}
          onClose={() => setShowWebResearchModal(false)}
          projectId={projectId}
          onSourceAdded={() => {
            setShowWebResearchModal(false);
            handleLoadAnalysis();
            onSourcesChanged?.();
          }}
        />
      )}

      {/* Deep Research 모달 */}
      {projectId && (
        <DeepResearchModal
          open={showDeepResearchModal}
          onClose={() => setShowDeepResearchModal(false)}
          projectId={projectId}
          onSourceAdded={() => {
            setShowDeepResearchModal(false);
            handleLoadAnalysis();
            onSourcesChanged?.();
          }}
        />
      )}

      {/* Drive 연동 스텁 모달 */}
      {showDriveModal && (
        <div
          className="notebook-stub-modal-overlay"
          onClick={() => setShowDriveModal(false)}
          role="presentation"
          data-testid="drive-stub-modal-overlay"
        >
          <div
            className="notebook-stub-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drive-modal-title"
            data-testid="drive-stub-modal"
          >
            <h3 id="drive-modal-title">📁 Google Drive 연동</h3>
            <p>Drive에서 문서·PDF·스프레드시트를 가져와 노트북 소스로 추가하는 기능을 준비 중입니다.</p>
            <ul className="drive-modal-list">
              <li>Google Docs, PDF, Sheets 등 지원</li>
              <li>폴더 단위 선택</li>
              <li>자동 텍스트 추출 후 소스로 등록</li>
            </ul>
            <p className="drive-modal-hint">곧 이용하실 수 있습니다.</p>
            <p className="drive-modal-roadmap-hint">
              로드맵: <code>docs/NOTEBOOKLM_DRIVE_ROADMAP.md</code> 참고
            </p>
            <button type="button" onClick={() => setShowDriveModal(false)} aria-label="Drive 연동 모달 닫기" aria-keyshortcuts="Escape" title="확인 (Escape)" data-testid="drive-stub-modal-close">확인</button>
          </div>
        </div>
      )}

      {/* 프롬프트 템플릿 패널 (기본 + 도시정비 도메인) */}
      {showTemplates && (() => {
        const baseTemplates = promptTemplateService.getTemplates(undefined, projectId);
        const urbanTemplates = projectId
          ? getDomainPromptTemplates('도시정비').map((dt) => ({
              id: dt.id,
              name: dt.name,
              description: dt.description,
              template: dt.template,
              tags: [dt.domain, ...dt.variables],
              domain: dt.domain,
            }))
          : [];
        const molitTemplates = projectId
          ? getDomainPromptTemplates('국토부').map((dt) => ({
              id: dt.id,
              name: dt.name,
              description: dt.description,
              template: dt.template,
              tags: [dt.domain, ...dt.variables],
              domain: dt.domain,
            }))
          : [];
        const domainTemplates = [...urbanTemplates, ...molitTemplates];
        const _allTemplates = [...domainTemplates, ...baseTemplates];
        return (
        <div className="notebook-llm-templates">
          <h4>프롬프트 템플릿</h4>
          <div className="templates-list">
            {urbanTemplates.length > 0 && (
              <div className="template-section" role="group" aria-labelledby="template-section-urban">
                <h5 id="template-section-urban" className="template-section-title">도시정비</h5>
                <div className="template-section-grid">
                {urbanTemplates.map((template) => {
              const handleTemplateSelect = () => {
                const variables = promptTemplateService.extractVariables(template.template);
                let text = template.template;
                if (projectId) {
                  const analysis = associationBylawsService.getBylawsAnalysis(projectId);
                  const siteName = coerceTrimmedString(analysis?.siteName, '');
                  const combName = coerceTrimmedString(analysis?.combinationName, '');
                  const projectType = associationBylawsService.extractProjectType(analysis ?? null);
                  const hasReplacements = (siteName && siteName !== '미확인 현장') || projectType;
                  if (siteName && siteName !== '미확인 현장') {
                    text = text.replace(/\{조합\}/g, siteName).replace(/\{지역\}/g, siteName).replace(/\{조합명\}/g, combName || siteName);
                  }
                  if (projectType) {
                    text = text.replace(/\{사업_유형\}/g, projectType);
                  }
                  if (!hasReplacements && template.template.match(/\{(?:조합|지역|조합명|사업_유형)\}/)) {
                    setTemplateHintToast(true);
                    setTimeout(() => setTemplateHintToast(false), 3500);
                  }
                }
                setPrompt(text);
                setShowTemplates(false);
                setTimeout(() => promptInputRef.current?.focus(), 0);
                void variables;
              };
              return (
                <button
                  key={template.id}
                  type="button"
                  className="template-item"
                  onClick={handleTemplateSelect}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTemplateSelect();
                    }
                  }}
                  aria-label={`템플릿 선택: ${template.name}`}
                  title={template.description ? `${template.name} - ${template.description}` : template.name}
                >
                  <div className="template-name">{template.name}</div>
                  <div className="template-description">{template.description}</div>
                  <div className="template-tags">
                    {(template.tags || []).map(tag => (
                      <span key={tag} className="template-tag">{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
                </div>
              </div>
            )}
            {molitTemplates.length > 0 && (
              <div className="template-section" role="group" aria-labelledby="template-section-molit">
                <h5 id="template-section-molit" className="template-section-title">국토부</h5>
                <div className="template-section-grid">
                {molitTemplates.map((template) => {
              const handleTemplateSelect = () => {
                const variables = promptTemplateService.extractVariables(template.template);
                let text = template.template;
                if (projectId) {
                  const analysis = associationBylawsService.getBylawsAnalysis(projectId);
                  const siteName = coerceTrimmedString(analysis?.siteName, '');
                  const combName = coerceTrimmedString(analysis?.combinationName, '');
                  const projectType = associationBylawsService.extractProjectType(analysis ?? null);
                  const hasReplacements = (siteName && siteName !== '미확인 현장') || projectType;
                  if (siteName && siteName !== '미확인 현장') {
                    text = text.replace(/\{조합\}/g, siteName).replace(/\{지역\}/g, siteName).replace(/\{조합명\}/g, combName || siteName);
                  }
                  if (projectType) {
                    text = text.replace(/\{사업_유형\}/g, projectType);
                  }
                  if (!hasReplacements && template.template.match(/\{(?:조합|지역|조합명|사업_유형)\}/)) {
                    setTemplateHintToast(true);
                    setTimeout(() => setTemplateHintToast(false), 3500);
                  }
                }
                setPrompt(text);
                setShowTemplates(false);
                setTimeout(() => promptInputRef.current?.focus(), 0);
                void variables;
              };
              return (
                <button
                  key={template.id}
                  type="button"
                  className="template-item"
                  onClick={handleTemplateSelect}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTemplateSelect();
                    }
                  }}
                  aria-label={`템플릿 선택: ${template.name}`}
                  title={template.description ? `${template.name} - ${template.description}` : template.name}
                >
                  <div className="template-name">{template.name}</div>
                  <div className="template-description">{template.description}</div>
                  <div className="template-tags">
                    {(template.tags || []).map(tag => (
                      <span key={tag} className="template-tag">{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
                </div>
              </div>
            )}
            {baseTemplates.length > 0 && (
              <div className="template-section" role="group" aria-labelledby="template-section-base">
                <h5 id="template-section-base" className="template-section-title">기본</h5>
                {baseTemplates.map((template) => {
              const handleTemplateSelect = () => {
                const isDomainTemplate = domainTemplates.some((dt) => dt.id === template.id);
                const variables = promptTemplateService.extractVariables(template.template);
                let text = template.template;
                if (isDomainTemplate || variables.length === 0) {
                  // 도메인 템플릿: 프로젝트 정관 현장명·조합명·사업유형으로 변수 자동 치환
                  if (isDomainTemplate && projectId) {
                    const analysis = associationBylawsService.getBylawsAnalysis(projectId);
                    const siteName = coerceTrimmedString(analysis?.siteName, '');
                    const combName = coerceTrimmedString(analysis?.combinationName, '');
                    const projectType = associationBylawsService.extractProjectType(analysis ?? null);
                    const hasReplacements = (siteName && siteName !== '미확인 현장') || projectType;
                    if (siteName && siteName !== '미확인 현장') {
                      text = text.replace(/\{조합\}/g, siteName).replace(/\{지역\}/g, siteName).replace(/\{조합명\}/g, combName || siteName);
                    }
                    if (projectType) {
                      text = text.replace(/\{사업_유형\}/g, projectType);
                    }
                    if (!hasReplacements && template.template.match(/\{(?:조합|지역|조합명|사업_유형)\}/)) {
                      setTemplateHintToast(true);
                      setTimeout(() => setTemplateHintToast(false), 3500);
                    }
                  }
                  setPrompt(text);
                  setShowTemplates(false);
                  setTimeout(() => promptInputRef.current?.focus(), 0);
                } else {
                  const filled = promptTemplateService.useTemplate(template.id, {});
                  setPrompt(filled);
                  setShowTemplates(false);
                  setTimeout(() => promptInputRef.current?.focus(), 0);
                }
              };

              return (
                <button
                  key={template.id}
                  type="button"
                  className="template-item"
                  onClick={handleTemplateSelect}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTemplateSelect();
                    }
                  }}
                  aria-label={`템플릿 선택: ${template.name}`}
                  title={template.description ? `${template.name} - ${template.description}` : template.name}
                >
                  <div className="template-name">{template.name}</div>
                  <div className="template-description">{template.description}</div>
                  <div className="template-tags">
                    {(template.tags || []).map(tag => (
                      <span key={tag} className="template-tag">{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* 글쓰기 스타일 선택 패널 */}
      {showWritingStyleSelector && (
        <div className="notebook-llm-writing-style" role="region" aria-label="글쓰기 스타일 선택 (Escape로 닫기)">
          <WritingStyleSelector
            selectedStyleId={selectedWritingStyle || undefined}
            onStyleSelect={(styleId) => {
              setSelectedWritingStyle(styleId);
              setShowWritingStyleSelector(false);
            }}
          />
          {selectedWritingStyle && (
            <div className="writing-style-inputs">
              <div className="input-group">
                <label htmlFor="writing-topic">주제:</label>
                <input
                  id="writing-topic"
                  type="text"
                  className="writing-input"
                  value={writingTopic}
                  onChange={(e) => setWritingTopic(e.target.value)}
                  placeholder="작성할 주제를 입력하세요"
                  aria-label="글쓰기 주제"
                />
              </div>
              <div className="input-group">
                <label htmlFor="writing-length">길이:</label>
                <select
                  id="writing-length"
                  className="writing-select"
                  value={writingLength}
                  onChange={(e) => setWritingLength(e.target.value)}
                  aria-label="글쓰기 길이"
                >
                  <option value="짧음">짧음 (200-500자)</option>
                  <option value="중간">중간 (500-1500자)</option>
                  <option value="길음">길음 (1500-3000자)</option>
                  <option value="매우길음">매우 길음 (3000자 이상)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 도메인 지식 선택 패널 */}
      {showDomainSelector && (
        <div className="notebook-llm-domain-selector" role="region" aria-label="도메인 지식 선택 (Escape로 닫기)">
          <h4>도메인 지식 선택</h4>
          <p className="domain-selector-description">
            전문 지식을 적용할 도메인을 선택하세요. 여러 개 선택 가능합니다.
          </p>
          <div className="domain-grid">
            {domainKnowledgeService.getAllDomainKnowledge().map((domain) => (
              <label
                key={domain.domain}
                htmlFor={`domain-${domain.domain}`}
                className={`domain-checkbox ${selectedDomains.includes(domain.domain) ? 'checked' : ''}`}
              >
                <input
                  id={`domain-${domain.domain}`}
                  type="checkbox"
                  checked={selectedDomains.includes(domain.domain)}
                  onChange={() => {
                    if (selectedDomains.includes(domain.domain)) {
                      setSelectedDomains(selectedDomains.filter(d => d !== domain.domain));
                    } else {
                      setSelectedDomains([...selectedDomains, domain.domain]);
                    }
                  }}
                />
                <div className="domain-info">
                  <div className="domain-name">{domain.name}</div>
                  <div className="domain-description">{domain.description}</div>
                  <div className="domain-keywords">
                    {domain.keywords.slice(0, 3).map(keyword => (
                      <span key={keyword} className="domain-keyword-tag">{keyword}</span>
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <div className="domain-selector-actions">
            <button
              type="button"
              onClick={() => {
                if (projectId) {
                  try {
                    localStorage.setItem(`domainConfig_${projectId}`, JSON.stringify(selectedDomains));
                  } catch (error) {
                    errorLogger.error('도메인 설정 저장 실패', error instanceof Error ? error : new Error(String(error)), {
                      component: 'NotebookLLM',
                      action: 'saveDomainConfig',
                      projectId,
                    });
                  }
                }
                setShowDomainSelector(false);
              }}
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => setShowDomainSelector(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 마인드맵 패널 */}
      {showMindMap && mindMapData && (
        <div className="notebook-llm-mindmap" role="region" aria-label="지식 마인드맵 (Escape로 닫기)" data-testid="notebook-llm-mindmap">
          <div className="mindmap-header">
            <h4>지식 마인드맵</h4>
            <p className="mindmap-description">
              선택한 도메인의 지식 구조를 시각화합니다. 노드를 클릭하면 상세 정보를 확인할 수 있습니다.
            </p>
          </div>
          <MindMap
            data={mindMapData}
            onNodeClick={(node: unknown) => {
              setSelectedMindMapNode((node as { id: string }).id);
            }}
            onNodeSelect={setSelectedMindMapNode}
            width={800}
            height={500}
            interactive={true}
          />
        </div>
      )}

      {/* 실거래/등기 정보 패널 */}
      {showRealEstateData && (
        <div className="notebook-llm-real-estate-data" role="region" aria-label="실거래/등기 정보 (Escape로 닫기)" data-testid="notebook-llm-real-estate-panel">
          <RealEstateDataPanel
            projectId={projectId}
            onDataSelect={(data) => {
              setSelectedRealEstateData(data);
              setShowRealEstateData(false);
            }}
          />
        </div>
      )}

      {/* 어투/말투 선택 패널 */}
      {showToneSelector && (
        <div className="notebook-llm-tone-selector" role="region" aria-labelledby="tone-selector-title" aria-describedby="tone-selector-desc">
          <h4 id="tone-selector-title">어투/말투 선택</h4>
          <span id="tone-selector-desc" className="sr-only">Escape로 닫기</span>

          {/* 어투 타입 선택 */}
          <fieldset className="tone-type-section bw-fieldset-reset">
            <legend className="section-label">어투 타입:</legend>
            <div className="tone-type-grid">
              {toneService.getAllToneTypes().map((toneType) => (
                <button
                  key={toneType}
                  type="button"
                  className={`tone-type-button ${selectedTone === toneType ? 'active' : ''}`}
                  onClick={() => setSelectedTone(toneType)}
                  aria-pressed={selectedTone === toneType}
                  aria-label={`어투: ${toneService.getToneTypeName(toneType)}${selectedTone === toneType ? ' (선택됨)' : ''}`}
                >
                  {toneService.getToneTypeName(toneType)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 연령대 선택 */}
          <fieldset className="age-group-section bw-fieldset-reset">
            <legend className="section-label">연령대 (선택사항):</legend>
            <div className="age-group-grid">
              <button
                type="button"
                className={`age-group-button ${selectedAgeGroup === null ? 'active' : ''}`}
                onClick={() => setSelectedAgeGroup(null)}
                aria-pressed={selectedAgeGroup === null}
                aria-label={`연령대 무관${selectedAgeGroup === null ? ' (선택됨)' : ''}`}
              >
                연령대 무관
              </button>
              {toneService.getAllAgeGroups().map((ageGroup) => (
                <button
                  key={ageGroup}
                  type="button"
                  className={`age-group-button ${selectedAgeGroup === ageGroup ? 'active' : ''}`}
                  onClick={() => setSelectedAgeGroup(ageGroup)}
                  aria-pressed={selectedAgeGroup === ageGroup}
                  aria-label={`연령대: ${toneService.getAgeGroupName(ageGroup)}${selectedAgeGroup === ageGroup ? ' (선택됨)' : ''}`}
                >
                  {toneService.getAgeGroupName(ageGroup)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 선택된 어투 미리보기 */}
          {selectedTone && (
            <div className="tone-preview">
              <h5>선택된 어투 특성:</h5>
              {(() => {
                const profile = toneService.getToneProfile(selectedTone, selectedAgeGroup || undefined);
                return (
                  <div className="tone-preview-content">
                    <div className="tone-characteristics">
                      <strong>특징:</strong>
                      <ul>
                        {profile.characteristics.map((char, idx) => (
                          <li key={`char-${char}-${idx}`}>{char}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="tone-examples">
                      <strong>표현 예시:</strong>
                      <ul>
                        {profile.examplePhrases.slice(0, 3).map((phrase, idx) => (
                          <li key={`phrase-${phrase}-${idx}`}>{phrase}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="tone-formality">
                      <strong>격식 수준:</strong> {toneService.getFormalityName(profile.formality)}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* 정관 활용 추천 프롬프트 칩 (프로젝트에 정관 있을 때, 입력 비어 있을 때) */}
      {projectId && associationBylawsService.hasBylaws(projectId) && !promptTrimmed && status?.available && (
        <div className="notebook-llm-bylaws-suggestions" role="region" aria-label="정관 활용 추천 질문">
          <span className="bylaws-suggestions-label">정관 활용:</span>
          {getBylawsSuggestedPrompts(projectId).map((s) => (
            <button
              key={s}
              type="button"
              className="bylaws-suggestion-chip"
              onClick={() => { setPrompt(s); promptInputRef.current?.focus(); }}
              aria-label={`${s} 질문 사용`}
              title={`클릭하여 "${s}" 질문 사용`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 소스 없을 때 CTA (프로젝트 전용) */}
      {projectId && status && !status.available && (
        <div className="notebook-llm-empty-cta" data-testid="notebook-llm-empty-cta" role="status" aria-live="polite">
          <p className="empty-cta-text">소스가 없습니다. 분석을 실행해 파일·URL·정관을 추가하세요.</p>
          <div className="empty-cta-buttons">
            <button
              type="button"
              className="bw-btn-primary empty-cta-button"
              onClick={() => handleLoadAnalysis()}
              aria-label="분석 실행하여 소스 추가"
              data-testid="empty-cta-analysis-btn"
            >
              📊 분석 실행
            </button>
            <button
              type="button"
              className="bw-btn-secondary empty-cta-button"
              onClick={() => setShowWebResearchModal(true)}
              aria-label="웹 검색으로 소스 추가"
              title="웹에서 검색해 소스를 바로 추가"
              data-testid="empty-cta-web-search-btn"
            >
              🔍 웹 검색
            </button>
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="notebook-llm-input-area bw-page-input-dock">
        <div className="bw-figma-composer notebook-llm-composer">
          <button
            type="button"
            className="bw-figma-composer-add"
            onClick={() => promptInputRef.current?.focus()}
            aria-label="프롬프트 입력 포커스"
            title="프롬프트 입력 포커스"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <textarea
            ref={promptInputRef}
            className="notebook-llm-prompt-input bw-input bw-figma-composer-field"
            data-testid="notebook-llm-prompt-input"
            value={prompt}
            onChange={(e) => {
              promptHistoryIndexRef.current = -1;
              setPrompt(e.target.value);
              const ta = e.target;
              ta.style.height = 'auto';
              ta.style.height = `${Math.min(ta.scrollHeight, 280)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={!status?.available && projectId
                ? "먼저 소스를 추가한 뒤 분석을 실행하세요. (📊 분석 버튼)"
              : projectId && associationBylawsService.hasBylaws(projectId)
                ? "프롬프트를 입력하세요. 정관이 등록되어 있으면 시공사 선정·총회·분양 질의 시 활용됩니다. (최대 15,000자, Cmd/Ctrl+Enter)"
                : "프롬프트를 입력하세요. 글쓰기 스타일 선택 시 주제만 입력해도 됩니다. (최대 15,000자, Cmd/Ctrl+Enter)"}
            rows={4}
            aria-label="프롬프트 입력 (Cmd 또는 Ctrl + Enter로 생성)"
            aria-keyshortcuts="Meta+Enter Control+Enter"
            aria-describedby={[hasPromptHistory && 'prompt-history-hint', effectivePromptLength > PROMPT_MAX_LENGTH && 'prompt-char-count'].filter(Boolean).join(' ') || undefined}
          />
          <button
            type="button"
            className="notebook-llm-generate-btn bw-figma-composer-action bw-figma-composer-action--primary"
            data-testid="notebook-llm-generate-btn"
            onClick={() => void handleGenerate()}
            disabled={
              isLoading ||
              isOffline ||
              (!promptTrimmed && !(selectedWritingStyle && writingTopicTrimmed)) ||
              !status?.available ||
              effectivePromptLength > PROMPT_MAX_LENGTH
            }
            title={isOffline ? '오프라인 상태에서는 사용할 수 없습니다' : !status?.available ? '먼저 소스를 추가하고 분석하세요' : effectivePromptLength > PROMPT_MAX_LENGTH ? `${PROMPT_MAX_LENGTH.toLocaleString()}자 이하로 입력해 주세요` : '생성 (Cmd/Ctrl + Enter)'}
            aria-label="응답 생성 (Cmd 또는 Ctrl + Enter 단축키)"
            aria-describedby={effectivePromptLength > PROMPT_MAX_LENGTH ? 'prompt-char-count' : undefined}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner" aria-hidden="true">...</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m22 2-7 20-4-9-9-4L22 2z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </button>
        </div>
        <div className="prompt-actions-row">
          {hasPromptHistory && (
            <span id="prompt-history-hint" className="prompt-history-hint" title="↑/↓ 키로 이전 프롬프트 탐색">↑/↓ 이전 프롬프트</span>
          )}
          {promptTrimmed && (
            <button
              type="button"
              className="bw-btn-ghost notebook-llm-expand-btn"
              onClick={() => {
                const data = expandInput(prompt);
                setExpandedSuggestionsData(data);
                setShowExpandedSuggestions((v) => !v);
              }}
              aria-label="질문·요구 확장"
              title="입력을 긴 질문, 긴 요구, 다양한 질문/요구로 확장"
              data-testid="expand-questions-requirements-btn"
            >
              {showExpandedSuggestions ? '확장 접기' : '질문·요구 확장'}
            </button>
          )}
          {(promptTrimmed || (selectedWritingStyle && writingTopicTrimmed)) && (
            <>
              <span
                id="prompt-char-count"
                className={`prompt-char-count ${effectivePromptLength > PROMPT_MAX_LENGTH ? 'prompt-char-count-over' : ''}`}
                aria-live="polite"
              >
                {effectivePromptLength.toLocaleString()} / {PROMPT_MAX_LENGTH.toLocaleString()}자
                {effectivePromptLength > PROMPT_MAX_LENGTH && ' (초과)'}
              </span>
              <button
                type="button"
                className="bw-btn-ghost notebook-llm-clear-btn"
                onClick={() => {
                  setPrompt('');
                  setWritingTopic('');
                  promptInputRef.current?.focus();
                }}
                aria-label="입력 지우기"
                title="입력 지우기"
              >
                지우기
              </button>
            </>
          )}
          {isLoading && (
            <span className="prompt-history-hint" aria-live="polite">
              생성 중... ({generateElapsedSec}초)
            </span>
          )}
        </div>
        {showExpandedSuggestions && expandedSuggestionsData && (
          <div className="notebook-llm-expanded-suggestions" role="region" aria-label="질문·요구 확장 결과" data-testid="expanded-suggestions-panel">
            {expandedSuggestionsData.longQuestions.length > 0 && (
              <div className="expanded-section">
                <h5>긴 질문</h5>
                <div className="expanded-chips">
                  {expandedSuggestionsData.longQuestions.map((q, i) => (
                    <button key={`lq-${i}`} type="button" className="expanded-chip" onClick={() => { setPrompt(q); promptInputRef.current?.focus(); }} title="클릭하여 프롬프트에 적용">{q}</button>
                  ))}
                </div>
              </div>
            )}
            {expandedSuggestionsData.longRequirements.length > 0 && (
              <div className="expanded-section">
                <h5>긴 요구</h5>
                <div className="expanded-chips">
                  {expandedSuggestionsData.longRequirements.map((r, i) => (
                    <button key={`lr-${i}`} type="button" className="expanded-chip" onClick={() => { setPrompt(r); promptInputRef.current?.focus(); }} title="클릭하여 프롬프트에 적용">{r}</button>
                  ))}
                </div>
              </div>
            )}
            {expandedSuggestionsData.variousQuestions.length > 0 && (
              <div className="expanded-section">
                <h5>여러 가지 질문</h5>
                <div className="expanded-chips">
                  {expandedSuggestionsData.variousQuestions.map((q, i) => (
                    <button key={`vq-${i}`} type="button" className="expanded-chip" onClick={() => { setPrompt(q); promptInputRef.current?.focus(); }} title="클릭하여 프롬프트에 적용">{q}</button>
                  ))}
                </div>
              </div>
            )}
            {expandedSuggestionsData.variousRequirements.length > 0 && (
              <div className="expanded-section">
                <h5>여러 가지 요구</h5>
                <div className="expanded-chips">
                  {expandedSuggestionsData.variousRequirements.map((r, i) => (
                    <button key={`vr-${i}`} type="button" className="expanded-chip" onClick={() => { setPrompt(r); promptInputRef.current?.focus(); }} title="클릭하여 프롬프트에 적용">{r}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 프롬프트 딥러닝 분석 (딥시크 호출 전 보강) */}
      {dlIntegrationEnabled && dlPromptAnalysis && (
        <div className="notebook-llm-dl-card notebook-llm-dl-prompt" role="region" aria-label="프롬프트 딥러닝 분석" aria-live="polite">
          <h4>🧠 프롬프트 딥러닝 분석</h4>
          <div className="dl-analysis-grid">
            <span><strong>감정:</strong> {dlPromptAnalysis.sentiment === 'positive' ? '긍정' : dlPromptAnalysis.sentiment === 'negative' ? '부정' : '중립'}</span>
            <span><strong>복잡도:</strong> {(dlPromptAnalysis.complexity * 100).toFixed(0)}%</span>
            <span><strong>긴급도:</strong> {(dlPromptAnalysis.urgency * 100).toFixed(0)}%</span>
            {dlPromptAnalysis.keyTopics.length > 0 && (
              <span><strong>주요 주제:</strong> {dlPromptAnalysis.keyTopics.join(', ')}</span>
            )}
            {dlPromptAnalysis.suggestedFocus && (
              <span className="dl-focus"><strong>집중:</strong> {dlPromptAnalysis.suggestedFocus}</span>
            )}
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && !isStreaming && (
        <div
          className="notebook-llm-loading"
          data-testid="notebook-llm-loading"
          role="status"
          aria-busy="true"
          aria-label={
            nonStreamGenerationPhase
              ? `${nonStreamGenerationPhase} (${generateElapsedSec}초 경과)`
              : `응답 생성 중 ${generateElapsedSec}초 경과`
          }
        >
          <div className="genspark-qa-role-row" style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <span className="genspark-qa-badge genspark-qa-badge--answer">{ASSISTANT_GENSPARK_QA_BADGE_ANSWER}</span>
          </div>
          <AssistantGensparkBody
            text={coerceTrimmedString(nonStreamGenerationPhase ?? '', '')}
            embedded
            enhancedCodeBlocks
            documentContext={(leftPanelSources?.length ?? 0) > 0}
          />
          <p className="notebook-llm-loading-elapsed bw-text-muted" style={{ fontSize: 13, marginTop: 10 }}>
            {generateElapsedSec}초 경과
          </p>
          {generateElapsedSec >= 60 && (
            <p className="loading-long-hint" aria-live="polite">
              요청이 1분 이상 걸리고 있습니다. 잠시만 기다려 주세요. 계속 지연되면 페이지를 새로고침해 보세요.
            </p>
          )}
        </div>
      )}

      {/* 스트리밍 상태 (중지 버튼 포함) */}
      {isStreaming && (
        <div className="notebook-llm-streaming" role="status" aria-label="응답 스트리밍 중">
          <div className="streaming-indicator">
            <span className="streaming-dot" aria-hidden></span>
            <span>스트리밍 중... ({generateElapsedSec}초)</span>
            {generateElapsedSec >= 60 && (
              <span className="streaming-long-hint" aria-live="polite">
                요청이 1분 이상 걸리고 있습니다. 잠시만 기다려 주세요. 계속 지연되면 페이지를 새로고침해 보세요.
              </span>
            )}
          </div>
          <button
            type="button"
            className="notebook-llm-cancel-btn bw-btn-danger"
            onClick={cancelStreaming}
            aria-label="스트리밍 중지 (Escape)"
            aria-keyshortcuts="Escape"
            title="스트리밍 중지 (Escape)"
          >
            ⏹ 중지
          </button>
        </div>
      )}

      {/* 에러 표시 (getUserFriendlyError 연동) */}
      {error && (() => {
        const errInfo = getUserFriendlyError(error);
        return (
          <div ref={errorRef} className="notebook-llm-error" role="alert" data-testid="notebook-llm-error">
            <button
              type="button"
              className="notebook-llm-error-close"
              onClick={() => setError(null)}
              aria-label="오류 메시지 닫기"
              title="닫기"
            >
              ✕
            </button>
            <div className="notebook-llm-error-title">❌ 오류</div>
            <div className="notebook-llm-error-message">{errInfo.userMessage}</div>
            {errInfo.suggestions.length > 0 && (
              <ul className="notebook-llm-error-suggestions" aria-label="해결 제안">
                {errInfo.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            {errInfo.canRetry && (
              <button
                type="button"
                className="notebook-llm-error-retry"
                onClick={() => void handleGenerate()}
                disabled={isLoading}
                aria-label="오류 발생, 다시 시도"
              >
                다시 시도
              </button>
            )}
          </div>
        );
      })()}

      {/* 응답 표시 (스트리밍 중·취소 후 잔여 본문·완료 응답) */}
      {(response ||
        isStreaming ||
        coerceTrimmedString(streamingContent, '')) && (
        <div className="notebook-llm-response" data-testid="notebook-llm-response">
          <div className="response-header">
            <span className="response-model">
              모델: {response?.modelUsed || '스트리밍'}
            </span>
            {response && (
              <>
                <span className="response-time">
                  처리 시간: {(response.processingTime / 1000).toFixed(2)}초
                </span>
                <span className="response-confidence">
                  신뢰도: {(response.confidence * 100).toFixed(1)}%
                </span>
                <span className="response-tokens">
                  토큰: {response.tokensUsed}
                </span>
              </>
            )}
            {(response || isStreaming || coerceTrimmedString(streamingContent, '')) && (
              <button
                type="button"
                className="notebook-llm-new-question-btn"
                data-testid="notebook-llm-new-question-btn"
                onClick={() => {
                  setResponse(null);
                  setStreamingContent('');
                  setError(null);
                  setPrompt('');
                  setWritingTopic('');
                  setDlPromptAnalysis(null);
                  setDlResponseAnalysis(null);
                  promptInputRef.current?.focus();
                }}
                aria-label="새 질문"
                title="응답·입력 초기화 후 새 질문"
              >
                ✨ 새 질문
              </button>
            )}
            {((response?.content ?? streamingContent) || '').length > 400 && (
              <>
                <button
                  type="button"
                  className="notebook-llm-scroll-top-btn"
                  onClick={() => {
                    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                    notebookLlmRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
                  }}
                  aria-label="맨 위로"
                  title="맨 위로"
                >
                  ↑ 맨 위로
                </button>
                <button
                  type="button"
                  className="notebook-llm-scroll-bottom-btn"
                  onClick={() => {
                    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
                    responseEndRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'end' });
                  }}
                  aria-label="맨 아래로"
                  title="맨 아래로"
                >
                  ↓ 맨 아래로
                </button>
              </>
            )}
            <button
              type="button"
              className="notebook-llm-copy-response-btn"
              data-testid="notebook-llm-copy-btn"
              disabled={!coerceTrimmedString((response?.content ?? streamingContent) || '', '')}
              onClick={async () => {
                const text = (response?.content ?? streamingContent) || '';
                if (!coerceTrimmedString(text, '')) return;
                try {
                  await navigator.clipboard.writeText(text);
                  setCopyErrorToast(false);
                  setCopyResponseToast(true);
                  setTimeout(() => setCopyResponseToast(false), 2000);
                } catch {
                  setCopyResponseToast(false);
                  setCopyErrorToast(true);
                  setTimeout(() => setCopyErrorToast(false), 2500);
                }
              }}
              aria-label="응답 복사"
              title={
                coerceTrimmedString((response?.content ?? streamingContent) || '', '')
                  ? '클립보드에 복사'
                  : '복사할 내용이 없습니다'
              }
            >
              📋 복사
            </button>
          </div>
          {copyResponseToast && (
            <div role="status" aria-live="polite" className="bw-toast-success">
              ✅ 복사되었습니다
            </div>
          )}
          {copyErrorToast && (
            <div role="alert" aria-live="assertive" className="bw-toast-error">
              복사에 실패했습니다. 브라우저 권한을 확인해 주세요.
            </div>
          )}
          {studioDeleteToast && (
            <div role="status" aria-live="polite" className="bw-toast-success">
              삭제되었습니다
            </div>
          )}
          <div
            className="response-content"
            data-testid="notebook-llm-response-content"
            role="article"
            aria-label="AI 응답"
            aria-busy={isStreaming}
          >
            {isStreaming ? (
              <>
                <AssistantGensparkBody
                  text={streamingContent}
                  embedded
                  enhancedCodeBlocks
                  documentContext={(leftPanelSources?.length ?? 0) > 0}
                />
                {coerceTrimmedString(streamingContent, '') &&
                getAssistantGenerationPhase(streamingContent) === null ? (
                  <span className="streaming-cursor" aria-hidden>
                    ▊
                  </span>
                ) : null}
              </>
            ) : (
              <AssistantGensparkBody
                text={response?.content ?? ''}
                embedded
                enhancedCodeBlocks
                documentContext={(leftPanelSources?.length ?? 0) > 0}
              />
            )}
          </div>
          <div ref={responseEndRef} />
          {/* 응답 딥러닝 품질 분석 (딥시크 답변 후) */}
          {dlIntegrationEnabled && dlResponseAnalysis && !isStreaming && (
            <div className="notebook-llm-dl-card notebook-llm-dl-response" role="region" aria-label="응답 딥러닝 품질 분석" aria-live="polite">
              <h4>🧠 응답 딥러닝 품질 분석</h4>
              <div className="dl-analysis-grid">
                <span><strong>감정:</strong> {dlResponseAnalysis.sentiment === 'positive' ? '긍정' : dlResponseAnalysis.sentiment === 'negative' ? '부정' : '중립'}</span>
                <span><strong>참여도:</strong> {(dlResponseAnalysis.engagement * 100).toFixed(0)}%</span>
                <span><strong>대화 단계:</strong> {dlResponseAnalysis.conversationPhase}</span>
                <span><strong>신뢰도:</strong> {(dlResponseAnalysis.confidence * 100).toFixed(0)}%</span>
                {dlResponseAnalysis.keyTopics.length > 0 && (
                  <span><strong>주요 주제:</strong> {dlResponseAnalysis.keyTopics.join(', ')}</span>
                )}
              </div>
            </div>
          )}
          {response?.metadata && Object.keys(response.metadata).length > 0 && (
            <details className="response-metadata">
              <summary>메타데이터</summary>
              <pre>{JSON.stringify(response.metadata, null, 2)}</pre>
            </details>
          )}
        </div>
      )}

      {/* 성능 메트릭 */}
      {status?.performanceMetrics && (
        <div className="notebook-llm-metrics">
          <h4>성능 메트릭</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">총 요청:</span>
              <span className="metric-value">{status.performanceMetrics.totalRequests}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">로컬 요청:</span>
              <span className="metric-value">{status.performanceMetrics.localRequests}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">클라우드 요청:</span>
              <span className="metric-value">{status.performanceMetrics.cloudRequests}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">평균 응답 시간:</span>
              <span className="metric-value">
                {(status.performanceMetrics.averageResponseTime * 1000).toFixed(0)}ms
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">성공률:</span>
              <span className="metric-value">
                {(status.performanceMetrics.successRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 스튜디오 출력 다운로드 토스트 */}
      {studioDownloadToast && (
        <div role="status" aria-live="polite" className="bw-toast-success">
          다운로드되었습니다
        </div>
      )}

      {/* 분석 모달 소스 추가 성공 토스트 */}
      {addSourceSuccessToast && (
        <div role="status" aria-live="polite" className="bw-toast-success">
          소스가 추가되었습니다
        </div>
      )}

      {/* 정관 등록 성공 토스트 */}
      {bylawsSuccessToast && (
        <div role="status" aria-live="polite" className="bw-toast-success">
          정관이 등록되었습니다. 질의 시 현장별 기본 지식으로 활용됩니다.
        </div>
      )}
      {bylawsRemovedToast && (
        <div role="status" aria-live="polite" className="bw-toast-success">
          정관이 삭제되었습니다.
        </div>
      )}
      {templateHintToast && (
        <div role="status" aria-live="polite" className="bw-toast-info">
          정관을 추가하면 {`{조합}`}, {`{지역}`}, {`{사업_유형}`} 등이 자동으로 채워집니다. 분석 모달에서 정관을 등록해보세요.
        </div>
      )}

      {/* 스튜디오 출력 삭제 확인 모달 */}
      {studioDeleteConfirmId && (
        <div
          className="studio-view-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="studio-delete-confirm-title"
          onClick={(e) => { if (e.target === e.currentTarget) setStudioDeleteConfirmId(null); }}
        >
          <div className="studio-view-modal studio-delete-confirm">
            <h3 id="studio-delete-confirm-title">스튜디오 출력 삭제</h3>
            <p className="studio-delete-confirm-desc">
              이 출력을 삭제하시겠습니까? 되돌릴 수 없습니다.
            </p>
            <div className="studio-delete-confirm-actions">
              <button
                type="button"
                onClick={() => setStudioDeleteConfirmId(null)}
                aria-label="삭제 취소"
                className="bw-btn-secondary"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteStudioOutput()}
                aria-label="스튜디오 출력 삭제 확인"
                className="bw-btn-danger"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// 성능 최적화: React.memo로 props가 변경되지 않으면 리렌더링 방지
export default React.memo(NotebookLLM, (prevProps, nextProps) => {
  // projectId와 initialPrompt만 비교하여 불필요한 리렌더링 방지
  return (
    prevProps.projectId === nextProps.projectId &&
    prevProps.initialPrompt === nextProps.initialPrompt
  );
});

