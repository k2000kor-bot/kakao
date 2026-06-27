/**
 * 대화 관계도 뷰 — 대화 업로드 후 참여자 간 발화 흐름 그래프
 * 기간/시간 지정 시 해당 구간 대화 관계도 검색·출력
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  uploadConversation,
  uploadConversationText,
  listConversations,
  fetchRelationshipGraph,
  type ConversationUploadItem,
  type RelationshipGraphData,
} from '../services/conversationGraphService';
import { showToast } from '../utils/toast';
import { coerceTrimmedString } from '../utils/chatInputUtils';
import {
  CONVERSATION_GRAPH_SVG_WIDTH,
  mountConversationGraphForceLayout,
  type ConversationGraphLayoutMode,
  type ConversationGraphMountHandle,
} from './conversationGraphForceLayout';
import { GRAPH_EDGE_LEGEND } from './conversationGraphEdgeLabels';
import { downloadConversationGraphCsv } from './conversationGraphCsvExport';
import { downloadConversationGraphPng, downloadConversationGraphSvg } from './conversationGraphExport';
import {
  GRAPH_FILTER_PRESETS,
  edgeFilterForPreset,
  graphFilterPresetLabel,
  stanceFilterForPreset,
  type GraphFilterPresetId,
} from './conversationGraphFilterPresets';
import { pickEdgeFocusParticipantId } from './conversationGraphFocusNavigation';
import {
  DEFAULT_EDGE_FILTER,
  filterRelationshipGraphByEdgeType,
  type EdgeTypeFilterState,
  type EdgeTypeKey,
} from './conversationGraphEdgeFilter';
import {
  DEFAULT_STANCE_FILTER,
  filterRelationshipGraphByStance,
  type StanceFilterState,
  type StanceKey,
} from './conversationGraphFilter';
import {
  countParticipantEdgeStats,
  formatConversationGraphParticipantDetail,
  formatParticipantAiInsightDetail,
} from './conversationGraphParticipantDetail';
import { analyzeRelationshipGraph, buildNodeVisualMetrics } from './conversationGraphAiAnalyzer';
import {
  buildHeuristicGraphNarrative,
  fetchGraphAiNarrative,
} from './conversationGraphAiNarrative';
import { ConversationGraphAiPanel } from './ConversationGraphAiPanel';
import { ConversationGraphAnswerPanel } from './ConversationGraphAnswerPanel';
import './ConversationGraphView.css';
import { ConversationGraphDashboardPanel } from './ConversationGraphDashboardPanel';
import { ConversationGraphEvidencePanel } from './ConversationGraphEvidencePanel';
import { ConversationGraphExpertLayerBar } from './ConversationGraphExpertLayerBar';
import { ConversationGraphMatrixPanel } from './ConversationGraphMatrixPanel';
import { computeGraphDashboardKpi } from './conversationGraphExpertSnapshot';
import {
  filterRelationshipGraphByExpertLayer,
  type ExpertLayerId,
} from './conversationGraphExpertLayers';
import { buildTimelineSegments } from './conversationGraphTimeline';
import type { ConversationGraphViewMode } from './conversationGraphUiPrefs';
import { buildGraphAnswerChatNavState } from './conversationGraphAnswerGeneration';
import { createPlaceholderGraphAnalysis } from './conversationGraphAnswerIntent';
import {
  consumeHandoffPasteFromSession,
  peekHandoffPasteFromSession,
  readConversationGraphHandoffFromLocationState,
  stashHandoffPasteToSession,
  stripConversationGraphHandoffKeys,
} from './conversationGraphNavigateHandoff';
import { scrollElementIntoViewSafe } from './conversationGraphScroll';
import { getStandaloneChatPath } from '../config/uiPreferences';
import type { GraphAnswerEnsureGraphResult } from './ConversationGraphAnswerPanel';
import { TEST_IDS } from '../constants/testIds';
import { downloadGraphAiAnalysisJson } from './conversationGraphAiExport';
import {
  GRAPH_PERIOD_PRESETS,
  graphDataDateBounds,
  graphPeriodPresetLabel,
  resolveGraphPeriodRange,
  type GraphPeriodPresetId,
} from './conversationGraphPeriodPresets';
import { listParticipantEdgeRows } from './conversationGraphParticipantEdges';
import {
  computeStanceBreakdown,
  formatStanceBreakdownText,
  listTopEdges,
} from './conversationGraphStats';
import {
  prepareConversationUpload,
  preparePastedConversationText,
  type PreparedConversationUpload,
} from '../utils/conversationUploadPrepare';
import {
  kakaoTalkSamplePresetLabel,
  type KakaoTalkSamplePreset,
} from '../utils/kakaoTalkMessageSampling';
import { kakaoDateTimeToDateInput } from '../utils/kakaoTalkUploadSummary';
import {
  buildParticipantListItems,
  filterParticipantsBySearch,
  sortParticipantListItems,
  type ParticipantSortMode,
} from './conversationGraphParticipantSearch';
import {
  loadConversationGraphUiPrefs,
  saveConversationGraphUiPrefs,
} from './conversationGraphUiPrefs';
import { buildGraphSnapshotForAnswer } from './conversationGraphAnswerGeneration';

/** 업로드 직후 관계도 API에 넘길 기간(카카오 CSV 요약에서 유도) */
type AutoGraphDateRange = {
  startDate?: string;
  endDate?: string;
};

function ConversationGraphView() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialUiPrefs = useMemo(() => loadConversationGraphUiPrefs(), []);
  const [uploads, setUploads] = useState<ConversationUploadItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [graph, setGraph] = useState<RelationshipGraphData | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [pasteText, setPasteText] = useState(() => peekHandoffPasteFromSession() || '');
  const [excludeSystemMessages, setExcludeSystemMessages] = useState(
    () => initialUiPrefs.excludeSystemMessages ?? true,
  );
  const [kakaoSamplePreset, setKakaoSamplePreset] = useState<KakaoTalkSamplePreset>(
    () => initialUiPrefs.kakaoSamplePreset ?? 'recent_20000',
  );
  const [useStreamAnswer, setUseStreamAnswer] = useState(() => initialUiPrefs.useStreamAnswer ?? true);
  const [useTwoPassAnswer, setUseTwoPassAnswer] = useState(
    () => initialUiPrefs.useTwoPassAnswer ?? true,
  );
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const [participantSortMode, setParticipantSortMode] = useState<ParticipantSortMode>('influence');
  const [uploadPreview, setUploadPreview] = useState<PreparedConversationUpload | null>(null);
  const [pendingOriginalFile, setPendingOriginalFile] = useState<File | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [pendingUploadText, setPendingUploadText] = useState<string | null>(null);
  const [listLoadError, setListLoadError] = useState(false);
  const [graphStatusMessage, setGraphStatusMessage] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [stanceFilter, setStanceFilter] = useState<StanceFilterState>(DEFAULT_STANCE_FILTER);
  const [edgeFilter, setEdgeFilter] = useState<EdgeTypeFilterState>(DEFAULT_EDGE_FILTER);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [aiNarrative, setAiNarrative] = useState('');
  const [aiNarrativeSource, setAiNarrativeSource] = useState<'heuristic' | 'ai'>('heuristic');
  const [loadingAiNarrative, setLoadingAiNarrative] = useState(false);
  const [autoRequestAiNarrative, setAutoRequestAiNarrative] = useState(
    () => initialUiPrefs.autoRequestAiNarrative ?? false,
  );
  const [autoGenerateAnswer, setAutoGenerateAnswer] = useState(
    () => initialUiPrefs.autoGenerateAnswer ?? false,
  );
  const [answerAutoTrigger, setAnswerAutoTrigger] = useState(0);
  const [handoffAutoCreateTrigger, setHandoffAutoCreateTrigger] = useState(0);
  const [handoffScrollToken, setHandoffScrollToken] = useState(0);
  const [useServerAiAnalysis, setUseServerAiAnalysis] = useState(
    () => initialUiPrefs.useServerAiAnalysis ?? true,
  );
  const [graphLayoutMode, setGraphLayoutMode] = useState<ConversationGraphLayoutMode>(
    () => initialUiPrefs.graphLayoutMode ?? 'genealogy',
  );
  const [graphViewMode, setGraphViewMode] = useState<ConversationGraphViewMode>(
    () => initialUiPrefs.graphViewMode ?? 'graph',
  );
  const [expertLayer, setExpertLayer] = useState<ExpertLayerId>(
    () => initialUiPrefs.expertLayer ?? 'all',
  );
  const pendingAutoAiNarrativeRef = useRef(false);
  const pendingAutoAnswerRef = useRef(false);
  const appliedLocationHandoffRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const graphCanvasRef = useRef<HTMLDivElement | null>(null);
  const [graphCanvasWidth, setGraphCanvasWidth] = useState(CONVERSATION_GRAPH_SVG_WIDTH);
  const graphMountRef = useRef<ConversationGraphMountHandle | null>(null);
  const graphMountCleanupRef = useRef<(() => void) | null>(null);
  const listSectionRef = useRef<HTMLDivElement>(null);
  const graphSectionRef = useRef<HTMLElement>(null);
  /** 업로드 직후 목록에 반영된 새 대화 라디오로만 포커스 이동(초기 마운트 시 포커스 훔치지 않음) */
  const pendingFocusConversationIdRef = useRef<string | null>(null);

  const loadList = useCallback((opts?: { preferSelectId?: string }): Promise<void> => {
    setLoadingList(true);
    return listConversations()
      .then((list) => {
        setListLoadError(false);
        setUploads(list);
        const prefer = opts?.preferSelectId;
        setSelectedId((prev) => {
          if (prefer && list.some((u) => u.id === prefer)) {
            return prefer;
          }
          if (list.length > 0 && !prev) {
            return list[0].id;
          }
          return prev;
        });
        const pend = pendingFocusConversationIdRef.current;
        if (pend && !list.some((u) => u.id === pend)) {
          pendingFocusConversationIdRef.current = null;
        }
      })
      .catch(() => {
        setListLoadError(true);
        setUploads([]);
        pendingFocusConversationIdRef.current = null;
      })
      .finally(() => {
        setLoadingList(false);
      });
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (appliedLocationHandoffRef.current) return;
    const handoff = readConversationGraphHandoffFromLocationState(location.state);
    if (!handoff) return;
    appliedLocationHandoffRef.current = true;
    stashHandoffPasteToSession(handoff.pasteText);
    setPasteText(handoff.pasteText);
    if (handoff.autoCreateGraph) {
      setHandoffAutoCreateTrigger((t) => t + 1);
    }
    setHandoffScrollToken((t) => t + 1);
    showToast('대화 내용을 관계도 화면에 불러왔습니다.', 'success');
    const rest =
      location.state && typeof location.state === 'object' && !Array.isArray(location.state)
        ? stripConversationGraphHandoffKeys(location.state as Record<string, unknown>)
        : undefined;
    queueMicrotask(() => {
      navigate(location.pathname, { replace: true, state: rest });
    });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (handoffScrollToken <= 0) return;
    let cancelled = false;
    const frameId = window.requestAnimationFrame(() => {
      queueMicrotask(() => {
        if (cancelled) return;
        const panel = document.querySelector(
          `[data-testid="${TEST_IDS.CONVERSATION_GRAPH_ANSWER_PANEL}"]`,
        );
        if (panel) {
          scrollElementIntoViewSafe(panel, { block: 'start' });
          return;
        }
        scrollElementIntoViewSafe(
          document.querySelector('[aria-label="대화 텍스트 붙여넣기"]'),
          { block: 'center' },
        );
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [handoffScrollToken]);

  useEffect(() => {
    saveConversationGraphUiPrefs({
      excludeSystemMessages,
      kakaoSamplePreset,
      autoRequestAiNarrative,
      autoGenerateAnswer,
      useStreamAnswer,
      useTwoPassAnswer,
      useServerAiAnalysis,
      graphLayoutMode,
      graphViewMode,
      expertLayer,
    });
  }, [
    excludeSystemMessages,
    kakaoSamplePreset,
    autoRequestAiNarrative,
    autoGenerateAnswer,
    useStreamAnswer,
    useTwoPassAnswer,
    useServerAiAnalysis,
    graphLayoutMode,
    graphViewMode,
    expertLayer,
  ]);

  const loadRelationshipGraph = useCallback(
    (
      uploadId: string,
      opts?: {
        startDate?: string;
        endDate?: string;
        resetFilters?: boolean;
        requestAutoAiNarrative?: boolean;
        requestAutoAnswer?: boolean;
      },
    ): Promise<RelationshipGraphData | null> => {
      if (!uploadId) return Promise.resolve(null);
      setGraphStatusMessage('관계도를 생성하는 중입니다…');
      setGraph(null);
      setSelectedNodeId(null);
      if (opts?.resetFilters !== false) {
        setStanceFilter(DEFAULT_STANCE_FILTER);
        setEdgeFilter(DEFAULT_EDGE_FILTER);
      }
      setLoadingGraph(true);
      return fetchRelationshipGraph(uploadId, {
        startDate: opts?.startDate,
        endDate: opts?.endDate,
        analysisMode: useServerAiAnalysis ? 'ai_enhanced' : 'standard',
      })
        .then((data) => {
          if (!data || typeof data !== 'object') {
            setGraph(null);
            setGraphStatusMessage('관계도를 불러오지 못했습니다.');
            return null;
          }
          setGraph(data);
          const nodeCount = (data.nodes ?? []).length;
          const edgeCount = (data.edges ?? []).length;
          if (nodeCount === 0) {
            setGraphStatusMessage(
              '관계도 결과: 해당 기간에 메시지가 없거나 파싱된 참여자가 없습니다.',
            );
          } else {
            setGraphStatusMessage(
              `관계도를 표시했습니다. 참여자 ${nodeCount}명, 연결 ${edgeCount}개.`,
            );
            if (opts?.requestAutoAiNarrative || autoRequestAiNarrative) {
              pendingAutoAiNarrativeRef.current = true;
            }
            if (opts?.requestAutoAnswer || autoGenerateAnswer) {
              pendingAutoAnswerRef.current = true;
            }
          }
          return data;
        })
        .catch((err: unknown) => {
          try {
            const raw =
              err && typeof err === 'object' && 'message' in err
                ? (err as { message: unknown }).message
                : undefined;
            const msgStr = typeof raw === 'string' ? raw.trim() : '';
            showToast(msgStr || '관계도 조회 실패', 'error');
            setGraph(null);
            setGraphStatusMessage(
              msgStr ? `관계도 조회 실패: ${msgStr}` : '관계도를 불러오지 못했습니다.',
            );
          } catch {
            setGraph(null);
            setGraphStatusMessage('관계도를 불러오지 못했습니다.');
          }
          return null;
        })
        .finally(() => setLoadingGraph(false));
    },
    [autoRequestAiNarrative, autoGenerateAnswer, useServerAiAnalysis],
  );

  const runUpload = useCallback(
    (file: File, displayName: string, toastDetail?: string, graphDates?: AutoGraphDateRange) => {
      setLoadingUpload(true);
      const startInput = graphDates?.startDate
        ? kakaoDateTimeToDateInput(graphDates.startDate)
        : '';
      const endInput = graphDates?.endDate ? kakaoDateTimeToDateInput(graphDates.endDate) : '';
      if (startInput) setStartDate(startInput);
      if (endInput) setEndDate(endInput);
      return uploadConversation(file, displayName)
        .then((data) => {
          pendingFocusConversationIdRef.current = data.upload_id;
          return loadList({ preferSelectId: data.upload_id }).then(() => data);
        })
        .then((data) => {
          consumeHandoffPasteFromSession();
          const msg = toastDetail
            ? `대화가 업로드되었습니다. ${toastDetail}`
            : '대화가 업로드되었습니다. 관계도를 생성합니다.';
          showToast(msg, 'success');
          return loadRelationshipGraph(data.upload_id, {
            startDate: startInput || undefined,
            endDate: endInput || undefined,
            requestAutoAnswer: autoGenerateAnswer,
            requestAutoAiNarrative: autoRequestAiNarrative,
          });
        })
        .catch((err) => showToast(err?.message || '업로드 실패', 'error'))
        .finally(() => setLoadingUpload(false));
    },
    [loadList, loadRelationshipGraph, autoGenerateAnswer, autoRequestAiNarrative],
  );

  const runUploadText = useCallback(
    (text: string, name: string, filename: string, toastDetail?: string, graphDates?: AutoGraphDateRange) => {
      setLoadingUpload(true);
      const startInput = graphDates?.startDate
        ? kakaoDateTimeToDateInput(graphDates.startDate)
        : '';
      const endInput = graphDates?.endDate ? kakaoDateTimeToDateInput(graphDates.endDate) : '';
      if (startInput) setStartDate(startInput);
      if (endInput) setEndDate(endInput);
      return uploadConversationText(text, name, filename)
        .then((data) => {
          pendingFocusConversationIdRef.current = data.upload_id;
          return loadList({ preferSelectId: data.upload_id }).then(() => data);
        })
        .then((data) => {
          consumeHandoffPasteFromSession();
          const msg = toastDetail
            ? `대화가 업로드되었습니다. ${toastDetail}`
            : '대화가 업로드되었습니다. 관계도를 생성합니다.';
          showToast(msg, 'success');
          return loadRelationshipGraph(data.upload_id, {
            startDate: startInput || undefined,
            endDate: endInput || undefined,
            requestAutoAnswer: autoGenerateAnswer,
            requestAutoAiNarrative: autoRequestAiNarrative,
          });
        })
        .catch((err) => showToast(err?.message || '업로드 실패', 'error'))
        .finally(() => setLoadingUpload(false));
    },
    [loadList, loadRelationshipGraph, autoGenerateAnswer, autoRequestAiNarrative],
  );

  const clearUploadPending = useCallback(() => {
    setUploadPreview(null);
    setPendingOriginalFile(null);
    setPendingUploadFile(null);
    setPendingUploadText(null);
  }, []);

  const graphDatesFromPreview = useCallback((): AutoGraphDateRange | undefined => {
    const summary = uploadPreview?.summary;
    if (!summary?.dateStart && !summary?.dateEnd) return undefined;
    return {
      startDate: summary.dateStart ?? undefined,
      endDate: summary.dateEnd ?? undefined,
    };
  }, [uploadPreview?.summary]);

  const handleConfirmUpload = useCallback(() => {
    const graphDates = graphDatesFromPreview();
    if (pendingUploadText) {
      const name = uploadPreview?.displayName || '붙여넣은 대화';
      const detail = uploadPreview?.summaryLine;
      const text = pendingUploadText;
      clearUploadPending();
      setPasteText('');
      void runUploadText(text, name, 'pasted-kakao.txt', detail, graphDates);
      return;
    }
    const file = pendingUploadFile ?? uploadPreview?.file;
    if (!file) return;
    const detail = uploadPreview?.summaryLine;
    const displayName = uploadPreview?.displayName || file.name;
    clearUploadPending();
    void runUpload(file, displayName, detail, graphDates);
  }, [
    pendingUploadFile,
    pendingUploadText,
    uploadPreview,
    clearUploadPending,
    graphDatesFromPreview,
    runUpload,
    runUploadText,
  ]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setLoadingUpload(true);
      file
        .text()
        .then((raw) => {
          const prepared = prepareConversationUpload(raw, file, {
            excludeSystemMessages,
            samplePreset: kakaoSamplePreset,
          });
          if (prepared.source === 'kakao_csv') {
            for (const w of prepared.warnings) {
              showToast(w, 'info');
            }
            setUploadPreview(prepared);
            setPendingOriginalFile(file);
            setPendingUploadFile(prepared.file);
            setPendingUploadText(null);
            return;
          }
          clearUploadPending();
          return runUpload(prepared.file, prepared.displayName);
        })
        .catch((err) => showToast(err?.message || '파일을 읽지 못했습니다', 'error'))
        .finally(() => setLoadingUpload(false));
    },
    [excludeSystemMessages, kakaoSamplePreset, clearUploadPending, runUpload],
  );

  const handlePasteUpload = useCallback(() => {
    const trimmed = coerceTrimmedString(pasteText, '');
    if (!trimmed) return;
    try {
      const pasted = preparePastedConversationText(trimmed, {
        excludeSystemMessages,
        samplePreset: kakaoSamplePreset,
      });
      if (pasted) {
        setUploadPreview({
          source: 'kakao_csv',
          file: new File([pasted.uploadText], pasted.filename, { type: 'text/plain' }),
          displayName: '붙여넣은 카카오톡 CSV',
          summary: pasted.summary,
          summaryLine: pasted.summaryLine,
          warnings: [],
        });
        setPendingUploadText(pasted.uploadText);
        setPendingUploadFile(null);
        return;
      }
      clearUploadPending();
      void runUploadText(trimmed, '붙여넣은 대화', 'pasted.txt');
    } catch (err) {
      showToast((err as Error)?.message || '붙여넣기 처리 실패', 'error');
    }
  }, [pasteText, excludeSystemMessages, kakaoSamplePreset, clearUploadPending, runUploadText]);

  const reparsePendingKakaoFile = useCallback(() => {
    const original = pendingOriginalFile;
    if (!original || uploadPreview?.source !== 'kakao_csv') return;
    setLoadingUpload(true);
    original
      .text()
      .then((raw) => {
        const prepared = prepareConversationUpload(raw, original, {
          excludeSystemMessages,
          samplePreset: kakaoSamplePreset,
        });
        setUploadPreview(prepared);
        setPendingUploadFile(prepared.file);
      })
      .catch((err) => showToast(err?.message || '다시 분석하지 못했습니다', 'error'))
      .finally(() => setLoadingUpload(false));
  }, [pendingOriginalFile, uploadPreview?.source, excludeSystemMessages, kakaoSamplePreset]);

  const kakaoFilterPrefsRef = useRef({
    excludeSystemMessages,
    kakaoSamplePreset,
  });
  useEffect(() => {
    const prev = kakaoFilterPrefsRef.current;
    const filtersChanged =
      prev.excludeSystemMessages !== excludeSystemMessages ||
      prev.kakaoSamplePreset !== kakaoSamplePreset;
    kakaoFilterPrefsRef.current = { excludeSystemMessages, kakaoSamplePreset };
    if (!filtersChanged) return;
    if (pendingOriginalFile && uploadPreview?.source === 'kakao_csv') {
      reparsePendingKakaoFile();
    }
  }, [
    excludeSystemMessages,
    kakaoSamplePreset,
    pendingOriginalFile,
    uploadPreview?.source,
    reparsePendingKakaoFile,
  ]);

  useEffect(() => {
    const trimmed = coerceTrimmedString(pasteText, '');
    if (!pendingUploadText || !trimmed || uploadPreview?.source !== 'kakao_csv') return;
    try {
      const pasted = preparePastedConversationText(trimmed, {
        excludeSystemMessages,
        samplePreset: kakaoSamplePreset,
      });
      if (!pasted) return;
      setPendingUploadText(pasted.uploadText);
      setUploadPreview((prev) =>
        prev
          ? {
              ...prev,
              summary: pasted.summary,
              summaryLine: pasted.summaryLine,
              file: new File([pasted.uploadText], pasted.filename, { type: 'text/plain' }),
            }
          : prev,
      );
    } catch {
      /* 붙여넣기 미리보기 갱신 실패는 확인 업로드 시 처리 */
    }
  }, [excludeSystemMessages, kakaoSamplePreset, pasteText, pendingUploadText, uploadPreview?.source]);

  const selectedNode = useMemo(() => {
    if (!graph || !selectedNodeId) return null;
    return (graph.nodes ?? []).find((n) => n.id === selectedNodeId) ?? null;
  }, [graph, selectedNodeId]);

  const graphAiAnalysis = useMemo(() => {
    if (!graph || (graph.nodes ?? []).length === 0) return null;
    return analyzeRelationshipGraph(graph);
  }, [graph]);

  const nodeVisualMetrics = useMemo(() => {
    if (!graphAiAnalysis) return undefined;
    return buildNodeVisualMetrics(graphAiAnalysis);
  }, [graphAiAnalysis]);

  const selectedAiInsight = useMemo(() => {
    if (!selectedNodeId || !graphAiAnalysis) return null;
    return graphAiAnalysis.participants.find((p) => p.id === selectedNodeId) ?? null;
  }, [selectedNodeId, graphAiAnalysis]);

  const selectedNodeDetail = useMemo(() => {
    if (!selectedNode) return '';
    if (selectedAiInsight) {
      return formatParticipantAiInsightDetail(selectedAiInsight);
    }
    const stats = countParticipantEdgeStats(selectedNode.id, graph?.edges);
    return formatConversationGraphParticipantDetail(selectedNode, stats);
  }, [selectedNode, selectedAiInsight, graph?.edges]);

  useEffect(() => {
    if (!graphAiAnalysis) {
      setAiNarrative('');
      setAiNarrativeSource('heuristic');
      return;
    }
    setAiNarrative(buildHeuristicGraphNarrative(graphAiAnalysis));
    setAiNarrativeSource('heuristic');
  }, [graphAiAnalysis]);

  const graphDateBounds = useMemo(() => {
    if (!graph) return null;
    return graphDataDateBounds(graph);
  }, [graph]);

  const handleApplyPeriodPreset = useCallback(
    (preset: GraphPeriodPresetId) => {
      const range = resolveGraphPeriodRange(preset, graphDateBounds);
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    },
    [graphDateBounds],
  );

  const handleRequestAiNarrative = useCallback(() => {
    if (!graphAiAnalysis) return;
    setLoadingAiNarrative(true);
    void fetchGraphAiNarrative(graphAiAnalysis)
      .then((text) => {
        if (text?.trim()) {
          setAiNarrative(text.trim());
          setAiNarrativeSource('ai');
          showToast('AI 종합 해석을 반영했습니다.', 'success');
          return;
        }
        setAiNarrative(buildHeuristicGraphNarrative(graphAiAnalysis));
        setAiNarrativeSource('heuristic');
        showToast('AI 해석을 가져오지 못해 규칙 기반 요약을 표시합니다.', 'info');
      })
      .catch(() => {
        showToast('AI 해석 요청에 실패했습니다.', 'error');
      })
      .finally(() => setLoadingAiNarrative(false));
  }, [graphAiAnalysis]);

  useEffect(() => {
    if (!pendingAutoAiNarrativeRef.current || !graphAiAnalysis) return;
    pendingAutoAiNarrativeRef.current = false;
    handleRequestAiNarrative();
  }, [graphAiAnalysis, handleRequestAiNarrative]);

  useEffect(() => {
    if (!pendingAutoAnswerRef.current || !graphAiAnalysis || !aiNarrative) return;
    pendingAutoAnswerRef.current = false;
    setAnswerAutoTrigger((t) => t + 1);
  }, [graphAiAnalysis, aiNarrative]);

  const filteredGraph = useMemo(() => {
    if (!graph) return null;
    const byStance = filterRelationshipGraphByStance(graph, stanceFilter);
    const byEdge = filterRelationshipGraphByEdgeType(byStance, edgeFilter);
    return filterRelationshipGraphByExpertLayer(byEdge, graphAiAnalysis, expertLayer);
  }, [graph, stanceFilter, edgeFilter, expertLayer, graphAiAnalysis]);

  const timelineSegments = useMemo(() => {
    if (!graphDateBounds) return [];
    return buildTimelineSegments(graphDateBounds, 3);
  }, [graphDateBounds]);

  const participantLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of graph?.nodes ?? []) {
      map.set(n.id, n.label || n.id);
    }
    return map;
  }, [graph?.nodes]);

  const participantListItems = useMemo(() => {
    const nodes = filteredGraph?.nodes ?? [];
    const items = buildParticipantListItems(nodes, graphAiAnalysis?.participants);
    return sortParticipantListItems(
      filterParticipantsBySearch(items, participantSearchQuery),
      participantSortMode,
    );
  }, [
    filteredGraph?.nodes,
    graphAiAnalysis?.participants,
    participantSearchQuery,
    participantSortMode,
  ]);

  const selectedParticipantEdges = useMemo(() => {
    if (!selectedNodeId) return [];
    const edges = filteredGraph?.edges ?? graph?.edges;
    return listParticipantEdgeRows(selectedNodeId, edges, participantLabelById);
  }, [selectedNodeId, filteredGraph?.edges, graph?.edges, participantLabelById]);

  const graphStats = useMemo(() => {
    if (!filteredGraph || (filteredGraph.nodes ?? []).length === 0) return null;
    const breakdown = computeStanceBreakdown(filteredGraph.nodes);
    const topEdges = listTopEdges(filteredGraph.edges, participantLabelById);
    return { breakdown, topEdges };
  }, [filteredGraph, participantLabelById]);

  const selectParticipant = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    graphMountRef.current?.focusOnNode(nodeId);
  }, []);

  const focusEdgeParticipants = useCallback(
    (sourceId: string, targetId: string) => {
      selectParticipant(pickEdgeFocusParticipantId(sourceId, targetId, selectedNodeId));
    },
    [selectParticipant, selectedNodeId],
  );

  const applyFilterPreset = useCallback((preset: GraphFilterPresetId) => {
    setStanceFilter(stanceFilterForPreset(preset));
    setEdgeFilter(edgeFilterForPreset(preset));
  }, []);

  const handleSearchGraph = useCallback(() => {
    if (!selectedId) return;
    void loadRelationshipGraph(selectedId, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [selectedId, startDate, endDate, loadRelationshipGraph]);

  const bindGraphSvgRef = useCallback(
    (el: SVGSVGElement | null) => {
      svgRef.current = el;
      graphMountCleanupRef.current?.();
      graphMountCleanupRef.current = null;
      graphMountRef.current = null;
      const nodes = filteredGraph?.nodes ?? [];
      if (!el || !filteredGraph || nodes.length === 0) return;
      try {
        const handle = mountConversationGraphForceLayout(el, filteredGraph, {
          onNodeSelect: selectParticipant,
          nodeVisuals: nodeVisualMetrics,
          layoutMode: graphLayoutMode,
          containerWidth: graphCanvasRef.current?.clientWidth ?? graphCanvasWidth,
        });
        graphMountRef.current = handle ?? null;
        graphMountCleanupRef.current = () => handle?.destroy();
      } catch {
        graphMountRef.current = null;
      }
    },
    [filteredGraph, selectParticipant, nodeVisualMetrics, graphLayoutMode, graphCanvasWidth],
  );

  useEffect(() => {
    const el = graphCanvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (typeof w === 'number' && w > 0) {
        setGraphCanvasWidth(Math.round(w));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [graph, graphViewMode]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || !filteredGraph || (filteredGraph.nodes ?? []).length === 0) return;
    bindGraphSvgRef(el);
  }, [bindGraphSvgRef, filteredGraph, graphCanvasWidth, graphLayoutMode, graphViewMode]);

  useEffect(
    () => () => {
      graphMountCleanupRef.current?.();
      graphMountCleanupRef.current = null;
      graphMountRef.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!selectedNodeId) return;
    const visible = new Set((filteredGraph?.nodes ?? []).map((n) => n.id));
    if (!visible.has(selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [filteredGraph, selectedNodeId]);

  useEffect(() => {
    if (!selectedNodeId) return;
    const el = document.querySelector(
      `[data-testid="conversation-graph-participant-${typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(selectedNodeId) : selectedNodeId}"]`,
    );
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedNodeId, participantListItems]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !selectedNodeId) return;
      setSelectedNodeId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedNodeId]);

  const exportBasename = useMemo(() => {
    return uploads.find((u) => u.id === selectedId)?.name?.replace(/\s+/g, '-') || 'conversation';
  }, [selectedId, uploads]);

  const handleDownloadSvg = useCallback(() => {
    if (!svgRef.current) return;
    downloadConversationGraphSvg(svgRef.current, `${exportBasename}-graph.svg`);
    showToast('관계도 SVG를 저장했습니다.', 'success');
  }, [exportBasename]);

  const handleDownloadPng = useCallback(() => {
    if (!svgRef.current || downloadingPng) return;
    setDownloadingPng(true);
    downloadConversationGraphPng(svgRef.current, `${exportBasename}-graph.png`)
      .then(() => showToast('관계도 PNG를 저장했습니다.', 'success'))
      .catch(() => showToast('PNG 저장에 실패했습니다.', 'error'))
      .finally(() => setDownloadingPng(false));
  }, [exportBasename, downloadingPng]);

  const toggleStanceFilter = useCallback((key: StanceKey) => {
    setStanceFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleEdgeFilter = useCallback((key: EdgeTypeKey) => {
    setEdgeFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleResetZoom = useCallback(() => {
    graphMountRef.current?.resetZoom();
  }, []);

  const handleDownloadCsv = useCallback(() => {
    if (!filteredGraph || (filteredGraph.nodes ?? []).length === 0) return;
    downloadConversationGraphCsv(filteredGraph, `${exportBasename}-graph.csv`);
    showToast('관계도 CSV를 저장했습니다.', 'success');
  }, [exportBasename, filteredGraph]);

  const handleExportAiJson = useCallback(() => {
    if (!graphAiAnalysis || !aiNarrative) return;
    downloadGraphAiAnalysisJson(
      graphAiAnalysis,
      aiNarrative,
      aiNarrativeSource,
      `${exportBasename}-ai-analysis.json`,
    );
    showToast('AI 분석 JSON을 저장했습니다.', 'success');
  }, [exportBasename, graphAiAnalysis, aiNarrative, aiNarrativeSource]);

  const graphAnswerPeriodLabel = useMemo(() => {
    const parts = [startDate, endDate].filter(Boolean);
    return parts.length ? parts.join(' ~ ') : '전체 기간';
  }, [startDate, endDate]);

  const graphAnswerConversationTitle = useMemo(() => {
    return uploads.find((u) => u.id === selectedId)?.name ?? '';
  }, [selectedId, uploads]);

  const graphAnswerAnalysisSummary = useMemo(() => {
    if (!graphAiAnalysis) return '';
    return [graphAiAnalysis.stanceSummary, graphAiAnalysis.exchangeSummary, graphAiAnalysis.alignmentSummary]
      .filter(Boolean)
      .join(' ');
  }, [graphAiAnalysis]);

  const graphDashboardKpi = useMemo(
    () => computeGraphDashboardKpi(filteredGraph ?? graph, graphAiAnalysis),
    [filteredGraph, graph, graphAiAnalysis],
  );

  const graphSnapshotText = useMemo(
    () => buildGraphSnapshotForAnswer(graph, graphAiAnalysis, selectedAiInsight, expertLayer),
    [graph, graphAiAnalysis, selectedAiInsight, expertLayer],
  );

  const handleOpenGraphAnswerInChat = useCallback(
    (draft: string, context: Record<string, unknown>, autoSend: boolean) => {
      navigate(getStandaloneChatPath(), {
        state: buildGraphAnswerChatNavState(draft, context, autoSend),
      });
    },
    [navigate],
  );

  const answerRawConversationText = useMemo(
    () => coerceTrimmedString(pendingUploadText ?? pasteText, ''),
    [pendingUploadText, pasteText],
  );

  const showGraphAnswerPanel = Boolean(
    (graphAiAnalysis && aiNarrative) ||
    answerRawConversationText ||
    (graph && (graph.nodes ?? []).length > 0),
  );

  const ensureGraphForAnswer = useCallback(async (): Promise<GraphAnswerEnsureGraphResult | null> => {
    if (graph && (graph.nodes ?? []).length > 0) {
      const builtAnalysis = analyzeRelationshipGraph(graph);
      return {
        graph,
        analysis: builtAnalysis,
        narrative: aiNarrative || buildHeuristicGraphNarrative(builtAnalysis),
      };
    }

    let uploadId = selectedId;
    const raw = answerRawConversationText;
    if (raw) {
      setLoadingUpload(true);
      try {
        const pasted = preparePastedConversationText(raw, {
          excludeSystemMessages,
          samplePreset: kakaoSamplePreset,
        });
        const text = pasted?.uploadText ?? raw;
        const filename = pasted?.filename ?? 'pasted-kakao.txt';
        const name = pasted ? '붙여넣은 카카오톡 CSV' : '붙여넣은 대화';
        const data = await uploadConversationText(text, name, filename);
        pendingFocusConversationIdRef.current = data.upload_id;
        await loadList({ preferSelectId: data.upload_id });
        setSelectedId(data.upload_id);
        uploadId = data.upload_id;
      } catch (err) {
        showToast((err as Error)?.message || '대화 업로드 실패', 'error');
        return null;
      } finally {
        setLoadingUpload(false);
      }
    }

    if (!uploadId) {
      showToast('카카오톡 대화를 붙여넣거나 파일을 업로드한 뒤 다시 시도해 주세요.', 'info');
      return null;
    }

    const loaded = await loadRelationshipGraph(uploadId, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      resetFilters: false,
      requestAutoAiNarrative: false,
      requestAutoAnswer: false,
    });
    if (!loaded || (loaded.nodes ?? []).length === 0) {
      return null;
    }
    const builtAnalysis = analyzeRelationshipGraph(loaded);
    return {
      graph: loaded,
      analysis: builtAnalysis,
      narrative: buildHeuristicGraphNarrative(builtAnalysis),
    };
  }, [
    graph,
    aiNarrative,
    selectedId,
    answerRawConversationText,
    excludeSystemMessages,
    kakaoSamplePreset,
    loadList,
    loadRelationshipGraph,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (loadingList || listLoadError) return;
    const target = pendingFocusConversationIdRef.current;
    if (!target || selectedId !== target) return;
    const wrap = listSectionRef.current;
    if (!wrap) return;
    const input = wrap.querySelector(
      `input[data-conversation-id="${typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(target) : target}"]`,
    );
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
    pendingFocusConversationIdRef.current = null;
  }, [loadingList, listLoadError, selectedId, uploads]);

  useEffect(() => {
    if (!graph || (graph.nodes ?? []).length === 0) return;
    let cancelled = false;
    try {
      const reduceMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const id = window.requestAnimationFrame(() => {
        queueMicrotask(() => {
          if (cancelled) return;
          try {
            const el = graphSectionRef.current;
            if (!el || typeof el.scrollIntoView !== 'function') return;
            el.scrollIntoView({
              behavior: reduceMotion ? 'auto' : 'smooth',
              block: 'nearest',
            });
          } catch {
            try {
              graphSectionRef.current?.scrollIntoView();
            } catch {
              /* noop */
            }
          }
        });
      });
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(id);
      };
    } catch {
      return undefined;
    }
  }, [graph]);

  return (
    <div
      className="bw-detail-root bw-tool-view conversation-graph-view"
      role="main"
      aria-label="대화 관계도"
      data-testid={TEST_IDS.CONVERSATION_GRAPH_VIEW}
      aria-describedby="conversation-graph-heading"
    >
      <p className="sr-only" id="conversation-graph-heading">
        카카오톡 대화 업로드 후 관계도·답변 생성. 성향·선호는 추정값입니다.
      </p>

      <div className="bw-tool-view-body" data-testid="conversation-graph-tool-body">
        <div className="conversation-graph-view__setup">
        <section className="bw-detail-section" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="bw-detail-section-title">
            대화 업로드
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="sr-only">
              카카오톡 TXT·CSV 또는 동일 형식 텍스트를 업로드합니다.
            </p>
            <label className="bw-label-block bw-mt-sm" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={excludeSystemMessages}
                onChange={(e) => setExcludeSystemMessages(e.target.checked)}
                aria-label="시스템·미디어 메시지 제외"
              />
              시스템 메시지 제외
            </label>
            <div className="conversation-graph-upload-toolbar bw-mt-sm">
              <label className="bw-btn-primary conversation-graph-upload-file" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept=".txt,.csv,text/plain,text/csv"
                  onChange={handleFileUpload}
                  disabled={loadingUpload}
                  style={{ display: 'none' }}
                  aria-label="대화 파일 선택 (TXT/CSV)"
                />
                {loadingUpload ? '업로드 중…' : '파일 선택 (TXT/CSV)'}
              </label>
              <span className="bw-detail-meta-text conversation-graph-upload-or">또는</span>
              <textarea
                placeholder="카카오톡 CSV(Date,User,Message) 또는 대화 TXT 붙여넣기"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={3}
                className="bw-input conversation-graph-upload-textarea"
                aria-label="대화 텍스트 붙여넣기"
              />
              <button
                type="button"
                className="bw-btn-secondary conversation-graph-upload-submit"
                onClick={() => void handlePasteUpload()}
                disabled={loadingUpload || !coerceTrimmedString(pasteText, '')}
              >
                붙여넣기
              </button>
            </div>
            {uploadPreview?.source === 'kakao_csv' && (
              <div
                className="bw-mt-sm bw-detail-note"
                role="region"
                aria-label="카카오톡 CSV 업로드 미리보기"
                data-testid="kakao-upload-preview"
              >
                <p className="bw-label-block">
                  <strong>카카오톡 CSV 분석 결과</strong>
                  {uploadPreview.displayName ? ` · ${uploadPreview.displayName}` : ''}
                </p>
                {uploadPreview.summaryLine && (
                  <p className="bw-detail-meta-text">{uploadPreview.summaryLine}</p>
                )}
                {uploadPreview.summary && uploadPreview.summary.multilineMessageCount > 0 && (
                  <p className="bw-detail-meta-text">
                    줄바꿈 포함 메시지 {uploadPreview.summary.multilineMessageCount.toLocaleString('ko-KR')}건
                  </p>
                )}
                {uploadPreview.summary && uploadPreview.summary.participantCount > 0 && (
                  <p className="bw-detail-meta-text" style={{ marginTop: 4 }}>
                    참여자 예:{' '}
                    {uploadPreview.summary.participants.slice(0, 8).join(', ')}
                    {uploadPreview.summary.participantCount > 8
                      ? ` 외 ${uploadPreview.summary.participantCount - 8}명`
                      : ''}
                  </p>
                )}
                {uploadPreview.warnings.map((w) => (
                  <p key={w} className="bw-detail-meta-text" role="status">
                    {w}
                  </p>
                ))}
                {(uploadPreview.summary?.messageCount ?? 0) >= 10_000 ? (
                  <fieldset
                    className="bw-mt-sm"
                    style={{ border: 'none', padding: 0, margin: 0 }}
                    data-testid="kakao-upload-sample-preset"
                  >
                    <legend className="bw-label-block">대용량 샘플링</legend>
                    <p className="bw-detail-meta-text">
                      메시지가 많을 때 업로드·관계도 생성 속도를 위해 최근 구간만 올릴 수 있습니다.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {(
                        [
                          'all',
                          'recent_10000',
                          'recent_20000',
                          'recent_50000',
                          'recent_30d',
                        ] as KakaoTalkSamplePreset[]
                      ).map((preset) => (
                        <label
                          key={preset}
                          className="bw-detail-meta-text"
                          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <input
                            type="radio"
                            name="kakao-sample-preset"
                            checked={kakaoSamplePreset === preset}
                            onChange={() => setKakaoSamplePreset(preset)}
                            data-testid={`kakao-sample-preset-${preset}`}
                          />
                          {kakaoTalkSamplePresetLabel(preset)}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
                <div className="bw-mt-sm" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="bw-btn-primary"
                    onClick={() => void handleConfirmUpload()}
                    disabled={loadingUpload}
                    data-testid="kakao-upload-confirm"
                  >
                    {loadingUpload ? '생성 중…' : '관계도 보기'}
                  </button>
                  <button
                    type="button"
                    className="bw-btn-secondary"
                    onClick={clearUploadPending}
                    disabled={loadingUpload}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="list-heading">
          <h2 id="list-heading" className="bw-detail-section-title">
            업로드된 대화
          </h2>
          <div ref={listSectionRef} className="bw-features-card bw-detail-scroll">
            {loadingList && <p className="bw-label-block bw-detail-meta-text">목록 로딩 중…</p>}
            {!loadingList && listLoadError && (
              <div className="bw-mt-sm">
                <p className="bw-label-block bw-detail-note" role="status">
                  대화 목록을 불러오지 못했습니다. API 서버가 <code>/api/conversations</code>를 제공하는지와 <code>API_BASE_URL</code>(<code>src/config/api.ts</code>)을 확인하세요.
                </p>
                <button
                  type="button"
                  className="bw-btn-secondary bw-mt-sm"
                  onClick={() => void loadList()}
                  disabled={loadingList}
                >
                  다시 시도
                </button>
              </div>
            )}
            {!loadingList && !listLoadError && uploads.length === 0 && (
              <p className="bw-label-block bw-detail-note">
                업로드된 대화가 없습니다. 위에서 파일을 업로드하거나 텍스트를 붙여넣어 주세요.
              </p>
            )}
            {!loadingList && !listLoadError && uploads.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {uploads.map((u) => (
                  <li key={u.id} className="bw-mt-sm">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="conversation"
                        data-conversation-id={u.id}
                        checked={selectedId === u.id}
                        onChange={() => setSelectedId(u.id)}
                        aria-label={`대화 선택: ${u.name}`}
                      />
                      <span>{u.name}</span>
                      <span className="bw-detail-meta-text">
                        메시지 {u.message_count}개 · {u.uploaded_at.slice(0, 10)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="bw-detail-section" aria-labelledby="period-heading">
          <h2 id="period-heading" className="bw-detail-section-title">
            기간 지정 (선택)
          </h2>
          <div className="bw-features-card bw-detail-scroll">
            <p className="sr-only">
              특정 기간·시간을 지정하면 해당 구간의 대화만 사용해 관계도를 그립니다.
            </p>
            <label
              className="bw-detail-meta-text bw-mt-sm"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
              title="지원 시 동조·반대 분류 정밀도 향상"
            >
              <input
                type="checkbox"
                checked={useServerAiAnalysis}
                onChange={(e) => setUseServerAiAnalysis(e.target.checked)}
                data-testid="conversation-graph-server-ai-analysis"
              />
              서버 AI 심화
            </label>
            {graphDateBounds ? (
              <div
                className="bw-mt-sm"
                style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                data-testid="conversation-graph-period-presets"
              >
                {GRAPH_PERIOD_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="bw-btn-secondary"
                    style={{ fontSize: 12 }}
                    data-testid={`conversation-graph-period-${preset}`}
                    onClick={() => handleApplyPeriodPreset(preset)}
                  >
                    {graphPeriodPresetLabel(preset)}
                  </button>
                ))}
              </div>
            ) : null}
            <form
              className="bw-mt-sm conversation-graph-period-form"
              aria-label="기간 지정 및 관계도 검색"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchGraph();
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="bw-detail-meta-text">시작:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bw-input"
                  style={{ width: 160 }}
                  aria-label="시작 날짜"
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="bw-detail-meta-text">끝:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bw-input"
                  style={{ width: 160 }}
                  aria-label="끝 날짜"
                />
              </label>
              <button
                type="submit"
                className="bw-btn-primary"
                data-testid="conversation-graph-search-submit"
                disabled={loadingGraph || !selectedId}
                aria-busy={loadingGraph}
              >
                {loadingGraph ? '검색 중…' : '검색'}
              </button>
            </form>
          </div>
        </section>
        </div>

        <section ref={graphSectionRef} className="bw-detail-section conversation-graph-view__graph-section" aria-labelledby="graph-heading">
          <h2 id="graph-heading" className="bw-detail-section-title">
            대화 관계도
          </h2>
          <div
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
            role="status"
            data-testid="conversation-graph-status"
          >
            {graphStatusMessage}
          </div>
          <div className="conversation-graph-view__graph-shell" aria-busy={loadingGraph}>
            {loadingGraph && (
              <p className="bw-label-block bw-detail-meta-text" aria-hidden="true">
                관계도 생성 중…
              </p>
            )}
            {graph && (graph.nodes ?? []).length === 0 && (
              <p className="bw-label-block bw-detail-note">
                해당 기간에 메시지가 없거나 파싱된 참여자가 없습니다.
              </p>
            )}
            {graph && (graph.nodes ?? []).length > 0 && (
              <div className="conversation-graph-view__graph-workspace">
                <div className="conversation-graph-view__graph-toolbar">
                <div className="conversation-graph-graph-toolbar">
                  <button
                    type="button"
                    className="bw-btn-secondary"
                    onClick={() => handleDownloadSvg()}
                    data-testid="conversation-graph-download-svg"
                    title="SVG 파일로 저장"
                  >
                    SVG
                  </button>
                  <button
                    type="button"
                    className="bw-btn-secondary"
                    onClick={() => handleDownloadPng()}
                    disabled={downloadingPng || (filteredGraph?.nodes ?? []).length === 0}
                    data-testid="conversation-graph-download-png"
                    title="PNG 이미지로 저장"
                  >
                    {downloadingPng ? 'PNG…' : 'PNG'}
                  </button>
                  <button
                    type="button"
                    className="bw-btn-secondary"
                    onClick={() => handleDownloadCsv()}
                    disabled={(filteredGraph?.nodes ?? []).length === 0}
                    data-testid="conversation-graph-download-csv"
                    title="CSV로 저장"
                  >
                    CSV
                  </button>
                  {selectedNodeId ? (
                    <button
                      type="button"
                      className="bw-btn-secondary"
                      onClick={() => setSelectedNodeId(null)}
                      data-testid="conversation-graph-clear-selection"
                    >
                      선택 취소
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="bw-btn-secondary"
                    onClick={() => handleResetZoom()}
                    disabled={(filteredGraph?.nodes ?? []).length === 0}
                    data-testid="conversation-graph-reset-zoom"
                    title="그래프 확대·이동 초기화"
                  >
                    줌 리셋
                  </button>
                  <div
                    className="conversation-graph-layout-toggle"
                    role="group"
                    aria-label="관계도 배치"
                    data-testid="conversation-graph-layout-toggle"
                  >
                    <button
                      type="button"
                      className={graphLayoutMode === 'genealogy' ? 'bw-btn-primary' : 'bw-btn-secondary'}
                      style={{ fontSize: 12 }}
                      data-testid="conversation-graph-layout-genealogy"
                      onClick={() => setGraphLayoutMode('genealogy')}
                    >
                      족보형
                    </button>
                    <button
                      type="button"
                      className={graphLayoutMode === 'force' ? 'bw-btn-primary' : 'bw-btn-secondary'}
                      style={{ fontSize: 12 }}
                      data-testid="conversation-graph-layout-force"
                      onClick={() => setGraphLayoutMode('force')}
                    >
                      자유 배치
                    </button>
                  </div>
                  <div
                    className="conversation-graph-view-toggle"
                    role="group"
                    aria-label="관계도 보기"
                    data-testid="conversation-graph-view-toggle"
                  >
                    <button
                      type="button"
                      className={graphViewMode === 'graph' ? 'bw-btn-primary' : 'bw-btn-secondary'}
                      style={{ fontSize: 12 }}
                      data-testid="conversation-graph-view-graph"
                      onClick={() => setGraphViewMode('graph')}
                    >
                      관계도
                    </button>
                    <button
                      type="button"
                      className={graphViewMode === 'matrix' ? 'bw-btn-primary' : 'bw-btn-secondary'}
                      style={{ fontSize: 12 }}
                      data-testid="conversation-graph-view-matrix"
                      onClick={() => setGraphViewMode('matrix')}
                    >
                      매트릭스
                    </button>
                  </div>
                  <span className="conversation-graph-view__graph-toolbar-hint">노드·목록을 눌러 연결을 확인하세요. 휠 확대·드래그 이동.</span>
                </div>
                </div>
                {(filteredGraph?.nodes ?? []).length === 0 ? (
                  <p className="bw-label-block bw-detail-note bw-mt-md" data-testid="conversation-graph-filter-empty">
                    선택한 입장에 해당하는 참여자가 없습니다. 위 필터를 조정해 주세요.
                  </p>
                ) : (
                  <div className="conversation-graph-view__graph-main">
                  <div className="conversation-graph-view__graph-display">
                {graphViewMode === 'matrix' && filteredGraph ? (
                  <ConversationGraphMatrixPanel
                    graph={filteredGraph}
                    analysis={graphAiAnalysis}
                    selectedNodeId={selectedNodeId}
                    onSelectParticipant={selectParticipant}
                    exportBasename={exportBasename}
                  />
                ) : null}
                {graphViewMode === 'graph' ? (
                <div
                  ref={graphCanvasRef}
                  className="conversation-graph-graph-stage conversation-graph-graph-stage--canvas"
                  data-testid="conversation-graph-canvas"
                >
                <svg
                  ref={bindGraphSvgRef}
                  className="conversation-graph-graph-svg"
                  role="img"
                  aria-label="대화 관계도 그래프"
                />
                <p className="conversation-graph-graph-stage__hint bw-detail-meta-text">
                  위→아래 족보: 위가 대화를 이끈 사람, 아래가 응답·연결 관계. 노드 색=우세 입장, 크기=영향력. 휠 확대·드래그 이동.
                </p>
                <div
                  className="conversation-graph-legend"
                  data-testid="conversation-graph-legend"
                >
                  <p className="bw-label-block" style={{ marginBottom: 8 }}>
                    연결 의미 (선·목록 공통)
                  </p>
                  <ul className="conversation-graph-legend-list">
                    {GRAPH_EDGE_LEGEND.map((item) => (
                      <li key={item.key} className="conversation-graph-legend-item">
                        <span
                          className="conversation-graph-legend-swatch"
                          style={{ backgroundColor: item.color }}
                          aria-hidden
                        />
                        <span className="conversation-graph-legend-label">{item.label}</span>
                        <span className="conversation-graph-legend-hint">{item.hint}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="bw-detail-meta-text bw-mt-sm">
                    노드: <span style={{ color: '#22c55e' }}>동조</span> ·{' '}
                    <span style={{ color: '#ef4444' }}>반대</span> ·{' '}
                    <span style={{ color: '#94a3b8' }}>중립</span> 입장 · 주도/응답=역할
                  </p>
                </div>
                </div>
                ) : null}
                  </div>
                  <aside className="conversation-graph-view__graph-sidebar">
                <div className="conversation-graph-view__filters">
                <fieldset
                  className="bw-mt-sm"
                  data-testid="conversation-graph-stance-filter"
                  style={{ border: 'none', padding: 0, margin: 0 }}
                >
                  <legend className="bw-label-block">입장별 표시</legend>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                    {(['동조', '반대', '중립'] as StanceKey[]).map((key) => (
                      <label key={key} className="bw-detail-meta-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={stanceFilter[key]}
                          onChange={() => toggleStanceFilter(key)}
                          data-testid={`conversation-graph-stance-${key}`}
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                  <p className="bw-detail-meta-text bw-mt-sm" data-testid="conversation-graph-filter-summary">
                    표시 중 {(filteredGraph?.nodes ?? []).length}명 · 연결 {(filteredGraph?.edges ?? []).length}개 / 전체 {(graph.nodes ?? []).length}명 · {(graph.edges ?? []).length}개
                  </p>
                  <div
                    className="bw-mt-sm"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                    data-testid="conversation-graph-filter-presets"
                  >
                    {GRAPH_FILTER_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="bw-btn-secondary"
                        data-testid={`conversation-graph-preset-${preset}`}
                        onClick={() => applyFilterPreset(preset)}
                      >
                        {graphFilterPresetLabel(preset)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset
                  className="bw-mt-sm"
                  data-testid="conversation-graph-edge-filter"
                  style={{ border: 'none', padding: 0, margin: 0 }}
                >
                  <legend className="bw-label-block">연결 유형</legend>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                    {(
                      [
                        ['flow', '발화 흐름'],
                        ['동조', '동조'],
                        ['반대', '반대'],
                        ['대립', '대립'],
                      ] as [EdgeTypeKey, string][]
                    ).map(([key, label]) => (
                      <label key={key} className="bw-detail-meta-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="checkbox"
                          checked={edgeFilter[key]}
                          onChange={() => toggleEdgeFilter(key)}
                          data-testid={`conversation-graph-edge-${key}`}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                </div>
                <ConversationGraphExpertLayerBar value={expertLayer} onChange={setExpertLayer} />
                {timelineSegments.length > 0 ? (
                  <div
                    className="bw-mt-sm conversation-graph-timeline-chips"
                    data-testid="conversation-graph-timeline"
                  >
                    <span className="bw-detail-meta-text">구간:</span>
                    {timelineSegments.map((seg) => (
                      <button
                        key={seg.id}
                        type="button"
                        className="bw-btn-secondary"
                        style={{ fontSize: 12 }}
                        data-testid={`conversation-graph-timeline-${seg.id}`}
                        title={`${seg.startDate} ~ ${seg.endDate}`}
                        onClick={() => {
                          setStartDate(seg.startDate);
                          setEndDate(seg.endDate);
                          if (selectedId) {
                            void loadRelationshipGraph(selectedId, {
                              startDate: seg.startDate,
                              endDate: seg.endDate,
                            });
                          }
                        }}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="bw-mt-md" data-testid="conversation-graph-participant-list">
                  <p className="bw-label-block">참여자</p>
                  <div
                    className="bw-mt-sm conversation-graph-participant-controls"
                    data-testid="conversation-graph-participant-controls"
                  >
                    <input
                      type="search"
                      className="bw-input"
                      placeholder="참여자 검색"
                      value={participantSearchQuery}
                      onChange={(e) => setParticipantSearchQuery(e.target.value)}
                      aria-label="참여자 검색"
                      data-testid="conversation-graph-participant-search"
                    />
                    {(
                      [
                        ['influence', '영향력순'],
                        ['stance', '입장순'],
                        ['name', '이름순'],
                      ] as [ParticipantSortMode, string][]
                    ).map(([mode, label]) => (
                      <button
                        key={mode}
                        type="button"
                        className={participantSortMode === mode ? 'bw-btn-primary' : 'bw-btn-secondary'}
                        style={{ fontSize: 12 }}
                        data-testid={`conversation-graph-participant-sort-${mode}`}
                        onClick={() => setParticipantSortMode(mode)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {participantListItems.length === 0 ? (
                    <p className="bw-detail-meta-text bw-mt-sm" data-testid="conversation-graph-participant-empty">
                      검색·필터 조건에 맞는 참여자가 없습니다.
                    </p>
                  ) : (
                    <div className="conversation-graph-participant-chips">
                      {participantListItems.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="bw-btn-secondary"
                          data-testid={`conversation-graph-participant-${p.id}`}
                          aria-pressed={selectedNodeId === p.id}
                          onClick={() => selectParticipant(p.id)}
                          title={[p.dominantStance, p.exchangeRole].filter(Boolean).join(' · ')}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                  </aside>
                  </div>
                )}
                <div className="conversation-graph-view__graph-meta">
                {graphDashboardKpi ? (
                  <ConversationGraphDashboardPanel
                    kpi={graphDashboardKpi}
                    contractorSignals={graph?.meta?.contractor_signals}
                  />
                ) : null}
                {graphStats ? (
                  <div
                    className="bw-mt-md bw-features-card"
                    data-testid="conversation-graph-stats-panel"
                    style={{ padding: 12 }}
                  >
                    <p className="bw-label-block">관계도 요약</p>
                    <p className="bw-detail-meta-text bw-mt-sm" data-testid="conversation-graph-stats-stance">
                      입장 분포: {formatStanceBreakdownText(graphStats.breakdown)}
                    </p>
                    {graphStats.topEdges.length > 0 ? (
                      <div className="bw-mt-sm">
                        <p className="bw-detail-meta-text">활발한 연결</p>
                        <ul className="bw-detail-meta-text" style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                          {graphStats.topEdges.map((row) => (
                            <li key={row.edgeKey}>
                              <button
                                type="button"
                                className="bw-btn-secondary"
                                style={{ marginTop: 4, fontSize: 12 }}
                                data-testid={`conversation-graph-top-edge-${row.edgeKey.replace(/::/g, '--')}`}
                                onClick={() => focusEdgeParticipants(row.sourceId, row.targetId)}
                              >
                                {row.summary}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="bw-detail-meta-text bw-mt-sm">표시할 연결이 없습니다.</p>
                    )}
                  </div>
                ) : null}
                {graphAiAnalysis && aiNarrative ? (
                  <ConversationGraphAiPanel
                    analysis={graphAiAnalysis}
                    narrative={aiNarrative}
                    loadingAiNarrative={loadingAiNarrative}
                    aiNarrativeSource={aiNarrativeSource}
                    autoRequestAiNarrative={autoRequestAiNarrative}
                    onAutoRequestAiNarrativeChange={setAutoRequestAiNarrative}
                    onRequestAiNarrative={handleRequestAiNarrative}
                    onExportJson={handleExportAiJson}
                    onApplyStancePreset={applyFilterPreset}
                    selectedInsight={selectedAiInsight}
                  />
                ) : null}
                </div>
                <div className="conversation-graph-view__graph-details">
                {selectedNodeDetail ? (
                  <p
                    className="bw-mt-sm bw-detail-meta-text"
                    data-testid="conversation-graph-participant-detail"
                  >
                    {selectedNodeDetail}
                  </p>
                ) : null}
                {selectedParticipantEdges.length > 0 ? (
                  <div className="bw-mt-sm" data-testid="conversation-graph-participant-edges">
                    <p className="bw-label-block">연결 상대</p>
                    <ul className="bw-detail-meta-text" style={{ margin: '8px 0 0', paddingLeft: 0, listStyle: 'none' }}>
                      {selectedParticipantEdges.map((row) => (
                        <li key={row.edgeKey} style={{ marginTop: 4 }}>
                          <button
                            type="button"
                            className="bw-btn-secondary"
                            style={{ fontSize: 12, width: '100%', textAlign: 'left' }}
                            data-testid={`conversation-graph-edge-link-${row.otherId}`}
                            onClick={() => {
                              if (!selectedNodeId) {
                                selectParticipant(row.otherId);
                                return;
                              }
                              const source = row.direction === 'outbound' ? selectedNodeId : row.otherId;
                              const target = row.direction === 'outbound' ? row.otherId : selectedNodeId;
                              focusEdgeParticipants(source, target);
                            }}
                          >
                            {row.summary}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {graph && (graph.nodes ?? []).length > 0 ? (
                  <ConversationGraphEvidencePanel graph={graph} selectedNodeId={selectedNodeId} />
                ) : null}
                </div>
              </div>
            )}
            {!graph && !loadingGraph && selectedId && (
              <p className="bw-label-block bw-detail-note">
                이 대화의 관계도가 아직 없습니다. 기간을 지정한 뒤 &quot;검색&quot;을 누르거나, 대화 파일을 다시 업로드해 주세요.
              </p>
            )}
            {!graph && loadingGraph && selectedId && (
              <p className="bw-label-block bw-detail-meta-text" role="status">
                관계도를 생성하는 중입니다…
              </p>
            )}
          </div>
          {showGraphAnswerPanel ? (
            <div className="conversation-graph-view__answer-section">
            <ConversationGraphAnswerPanel
              analysis={graphAiAnalysis ?? createPlaceholderGraphAnalysis()}
              narrative={
                aiNarrative ||
                '대화를 분석해 족보형 관계도·참여자·연결 표·Mermaid 다이어그램을 답변으로 생성할 수 있습니다.'
              }
              narrativeSource={aiNarrativeSource}
              analysisSummary={graphAnswerAnalysisSummary}
              graphSnapshotText={graphSnapshotText}
              conversationTitle={graphAnswerConversationTitle}
              periodLabel={graphAnswerPeriodLabel}
              selectedInsight={selectedAiInsight}
              graph={graph}
              expertLayer={expertLayer}
              rawConversationText={answerRawConversationText}
              onEnsureGraphBeforeAnswer={ensureGraphForAnswer}
              autoGenerateTrigger={answerAutoTrigger}
              handoffAutoCreateTrigger={handoffAutoCreateTrigger}
              autoGenerateAnswer={autoGenerateAnswer}
              onAutoGenerateAnswerChange={setAutoGenerateAnswer}
              useStreamAnswer={useStreamAnswer}
              onUseStreamAnswerChange={setUseStreamAnswer}
              useTwoPassAnswer={useTwoPassAnswer}
              onUseTwoPassAnswerChange={setUseTwoPassAnswer}
              onOpenInChat={handleOpenGraphAnswerInChat}
            />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export default ConversationGraphView;
