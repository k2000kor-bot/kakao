/**
 * 프로젝트 설정 편집 모달 (이름, 설명, 태그, 가이드라인, 프로젝트 파일)
 * 저장 시 노트북 LLM 컨텍스트도 함께 갱신됨.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Paperclip, Trash2, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { errorLogger } from '../../utils/errorLogger';
import { showToast } from '../../utils/toast';
import { projectService } from '../../services/projectService';
import FileStorageService from '../../services/fileStorageService';
import { analyzeGuidelines, getGuidelineQualityTrend } from '../../utils/guidelineQuality';
import {
  createGuidelinePolicyPack,
  parseGuidelinePolicyPack,
  serializeGuidelinePolicyPack,
} from '../../utils/guidelinePolicyPack';
import type { Project, ProjectFile, ProjectLearningSource } from '../../types/project';
import { TEST_IDS } from '../../constants/testIds';
import { coerceTrimmedString } from '../../utils/chatInputUtils';
import { DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL } from '../../config/api';
import './ProjectEditModal.css';

function inferFileType(filename: string): ProjectFile['type'] {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'xlsx', 'xls', 'ppt', 'pptx'].includes(ext)) return 'document';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'json', 'html', 'css', 'scss'].includes(ext)) return 'code';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeWebSourceUrl(url: string): string {
  const trimmed = coerceTrimmedString(url, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatSyncTime(value?: Date | string): string {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR');
}

function buildProjectDraftSnapshot(input: {
  name: string;
  description: string;
  instructions: string;
  tags: string[];
  guidelines: string[];
  files: ProjectFile[];
  webSources: ProjectLearningSource[];
}): string {
  return JSON.stringify({
    name: coerceTrimmedString(input.name, ''),
    description: coerceTrimmedString(input.description, ''),
    instructions: coerceTrimmedString(input.instructions, ''),
    tags: [...input.tags],
    guidelines: input.guidelines.map((g) => coerceTrimmedString(g, '')),
    files: input.files.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      url: f.url,
      status: f.status,
      description: f.description,
      tags: f.tags ?? [],
    })),
    webSources: input.webSources.map((s) => ({
      id: s.id,
      type: s.type,
      url: s.url,
      title: s.title,
      syncStatus: s.syncStatus,
    })),
  });
}

function parseProjectDraftSnapshot(snapshot: string): {
  name: string;
  description: string;
  instructions: string;
  tags: string[];
  guidelines: string[];
  files: Array<{ id: string; name: string }>;
  webSources: Array<{ id: string; type: string; url: string }>;
} | null {
  if (!snapshot) return null;
  try {
    const parsed = JSON.parse(snapshot) as {
      name?: unknown;
      description?: unknown;
      instructions?: unknown;
      tags?: unknown;
      guidelines?: unknown;
      files?: unknown;
      webSources?: unknown;
    };
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      description: typeof parsed.description === 'string' ? parsed.description : '',
      instructions: typeof parsed.instructions === 'string' ? parsed.instructions : '',
      tags: Array.isArray(parsed.tags) ? parsed.tags.map((v) => String(v)) : [],
      guidelines: Array.isArray(parsed.guidelines) ? parsed.guidelines.map((v) => String(v)) : [],
      files: Array.isArray(parsed.files)
        ? parsed.files.map((item) => {
          const row = item as { id?: unknown; name?: unknown };
          return { id: String(row.id ?? ''), name: String(row.name ?? '') };
        })
        : [],
      webSources: Array.isArray(parsed.webSources)
        ? parsed.webSources.map((item) => {
          const row = item as { id?: unknown; type?: unknown; url?: unknown };
          return {
            id: String(row.id ?? ''),
            type: String(row.type ?? ''),
            url: String(row.url ?? ''),
          };
        })
        : [],
    };
  } catch {
    return null;
  }
}

function normalizeComparableList(values: string[]): string[] {
  return values.map((v) => coerceTrimmedString(v, '')).filter((v) => v.length > 0);
}

function buildAddedRemoved(base: string[], current: string[]): { added: string[]; removed: string[] } {
  const baseSet = new Set(base);
  const currentSet = new Set(current);
  const added = current.filter((item) => !baseSet.has(item));
  const removed = base.filter((item) => !currentSet.has(item));
  return { added, removed };
}

function createLocalId(): string {
  const randomUUID = globalThis?.crypto?.randomUUID;
  if (typeof randomUUID === 'function') {
    return randomUUID.call(globalThis.crypto);
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseGuidelineForDiff(raw: string): { priority: '필수' | '권장' | '미분류'; content: string } {
  const trimmed = coerceTrimmedString(raw, '');
  const matched = trimmed.match(/^\[(필수|권장)\]\s*(.+)?$/);
  if (!matched) {
    return {
      priority: '미분류',
      content: trimmed,
    };
  }
  return {
    priority: matched[1] as '필수' | '권장',
    content: coerceTrimmedString(matched[2] ?? '', ''),
  };
}

function buildRecoveryDiffSummary(previous: string[] = [], current: string[] = []): string[] {
  const prevMap = new Map<string, '필수' | '권장' | '미분류'>();
  const currMap = new Map<string, '필수' | '권장' | '미분류'>();
  for (const item of previous) {
    const parsed = parseGuidelineForDiff(item);
    if (!parsed.content) continue;
    prevMap.set(parsed.content.toLowerCase(), parsed.priority);
  }
  for (const item of current) {
    const parsed = parseGuidelineForDiff(item);
    if (!parsed.content) continue;
    currMap.set(parsed.content.toLowerCase(), parsed.priority);
  }
  const added: string[] = [];
  const removed: string[] = [];
  const promoted: string[] = [];
  const demoted: string[] = [];

  for (const [content, priority] of currMap.entries()) {
    if (!prevMap.has(content)) {
      added.push(content);
      continue;
    }
    const prevPriority = prevMap.get(content);
    if (prevPriority === '권장' && priority === '필수') promoted.push(content);
    if (prevPriority === '필수' && priority === '권장') demoted.push(content);
  }
  for (const [content] of prevMap.entries()) {
    if (!currMap.has(content)) removed.push(content);
  }

  const lines: string[] = [];
  if (added.length > 0) lines.push(`- 추가: ${added.slice(0, 3).join(', ')}`);
  if (removed.length > 0) lines.push(`- 제거: ${removed.slice(0, 3).join(', ')}`);
  if (promoted.length > 0) lines.push(`- 필수 승격: ${promoted.slice(0, 3).join(', ')}`);
  if (demoted.length > 0) lines.push(`- 권장 하향: ${demoted.slice(0, 3).join(', ')}`);
  if (lines.length === 0) lines.push('- 직전 대비 구조 변화 없음');
  return lines;
}

interface ProjectOperationPreset {
  id: string;
  label: string;
  description: string;
  instructions: string;
  guidelines: string[];
  tags: string[];
}

interface ProjectInstructionHistoryEntry {
  id: string;
  savedAt: string;
  instructions: string;
  guidelines: string[];
  tags: string[];
}

interface GuidelineQualityHistoryEntry {
  id: string;
  savedAt: string;
  score: number;
  status: 'good' | 'warning' | 'risk';
  required: number;
  recommended: number;
  untyped: number;
  duplicates: number;
  empty: number;
}

interface GuidelineAutoRecoveryReportEntry {
  id: string;
  createdAt: string;
  summary: string;
  prompt: string;
  beforeScore: number;
  afterScore: number;
  delta: number;
  beforeGuidelines?: string[];
  afterGuidelines?: string[];
  diffSummary?: string[];
}

const HISTORY_LIMIT = 10;
const QUALITY_HISTORY_LIMIT = 20;
const AUTO_RECOVERY_REPORT_LIMIT = 12;

type GuidelinePriority = '필수' | '권장';
type ProjectEditSectionKey = 'basic' | 'guideline' | 'source';
const GUIDELINE_SELECTION_STORAGE_PREFIX = 'project-edit-guideline-selection';
const GUIDELINE_EXPANDED_STORAGE_PREFIX = 'project-edit-guideline-expanded';
const GUIDELINE_QUALITY_HISTORY_STORAGE_PREFIX = 'project-guideline-quality-history';
const GUIDELINE_AUTO_RECOVERY_REPORT_PREFIX = 'project-guideline-auto-recovery-report';
const GUIDELINE_AUTO_RECOVERY_COMPARE_PREFIX = 'project-guideline-auto-recovery-compare';

const PROJECT_OPERATION_PRESETS: ProjectOperationPreset[] = [
  {
    id: 'urban-renewal',
    label: '도시정비 운영',
    description: '총회·정관·행정 절차 중심 응답',
    instructions:
      '도시정비사업 실무 관점으로 답변해 주세요. 핵심 쟁점, 법적/행정 리스크, 실무 체크리스트 순서로 정리하고 모호한 부분은 확인 질문을 먼저 제시해 주세요.',
    guidelines: [
      '답변 형식: 핵심요약 → 실행단계 → 리스크/대안',
      '총회·이사회·대의원회 의사결정 포인트를 분리해 설명',
      '서울시/국토부 기준과 현장 실무 차이를 함께 안내',
    ],
    tags: ['도시정비', '정관', '총회'],
  },
  {
    id: 'reconstruction',
    label: '재건축 운영',
    description: '조합·분담금·시공사 선정 중심',
    instructions:
      '재건축 프로젝트 PM처럼 답변해 주세요. 조합 운영, 분담금/사업성, 시공사 선정 및 입찰 리스크를 중심으로 우선순위를 제안해 주세요.',
    guidelines: [
      '분담금/사업성은 가정값을 명시하고 계산 근거를 설명',
      '시공사 선정·입찰 단계의 일정/문서 체크리스트 제공',
      '갈등 가능 포인트(조합원, 상가, 시공사)를 별도 표시',
    ],
    tags: ['재건축', '분담금', '시공사선정'],
  },
  {
    id: 'reconstruction-contract',
    label: '재건축 수주',
    description: '입찰 수주·착공 전 준비사항',
    instructions:
      '재건축/재개발 시공사 입찰 수주 후 준비사항을 중심으로 답변해 주세요. 수주 직후 점검·계약·착공 전 준비사항·일정 리스크를 단계별로 정리해 주세요.',
    guidelines: [
      '수주 직후 점검사항(계약서·보증·담보·선급금 등)을 체크리스트로 제공',
      '착공 전 준비사항(현장인수·설계검토·하도급·안전관리)을 단계별로 정리',
      '일정·비용 리스크와 대응 방안을 함께 안내',
    ],
    tags: ['재건축', '수주', '착공'],
  },
  {
    id: 'redevelopment',
    label: '재개발 운영',
    description: '권리관계·이주·보상 중심',
    instructions:
      '재개발 실무 기준으로 답변해 주세요. 권리관계 정리, 이주/보상, 일정 지연 리스크를 중심으로 실행 계획을 제시해 주세요.',
    guidelines: [
      '권리관계/보상/이주 일정을 분리해 단계별로 제시',
      '분쟁 가능 문구는 완곡하게 정리하고 대응 시나리오 제공',
      '필요 시 추가 확인 서류 목록을 함께 안내',
    ],
    tags: ['재개발', '보상', '이주'],
  },
  {
    id: 'redevelopment-contract',
    label: '재개발 수주',
    description: '입찰 수주·권리관계·착공 전 점검',
    instructions:
      '재개발 시공사 입찰 수주 후 준비사항을 중심으로 답변해 주세요. 수주 직후 점검·권리관계 정리·이주/보상 진행 상태·착공 전 준비사항을 단계별로 정리해 주세요.',
    guidelines: [
      '수주 직후 점검사항(계약서·권리관계 정리 현황·이주/보상 진행률)을 체크리스트로 제공',
      '착공 전 준비사항(이주 완료·철거·설계·인허가·현장인수)을 단계별로 정리',
      '권리분쟁·이주 지연 리스크와 대응 방안을 함께 안내',
    ],
    tags: ['재개발', '수주', '권리관계'],
  },
];

/** 최소한의 프로젝트 정보 (ChatGPTInterface의 로컬 Project와 호환) */
export type ProjectEditModalProject = Pick<Project, 'id' | 'name'> & {
  description?: string;
  tags?: string[];
};

export interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  currentProject: ProjectEditModalProject | null;
  /** 모달 편집 중 사이드바·헤더 프로젝트명 미리보기 */
  onDraftChange?: (draft: { name: string; description?: string }) => void;
  onSaved?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  focusTarget?: 'required-guideline' | null;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentProject,
  onDraftChange,
  onSaved,
  onDelete,
  focusTarget = null,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [guidelines, setGuidelines] = useState<string[]>(['']);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [webSources, setWebSources] = useState<ProjectLearningSource[]>([]);
  const [newWebSourceUrl, setNewWebSourceUrl] = useState('');
  const [newWebSourceType, setNewWebSourceType] = useState<ProjectLearningSource['type']>('document');
  const [newWebSourceTitle, setNewWebSourceTitle] = useState('');
  const [notebookSourceCountHint, setNotebookSourceCountHint] = useState<number | null>(null);
  const [addingWebSource, setAddingWebSource] = useState(false);
  const [syncingWebSourceIds, setSyncingWebSourceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [baselineSnapshot, setBaselineSnapshot] = useState('');
  const [showChangeSummary, setShowChangeSummary] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [instructionHistory, setInstructionHistory] = useState<ProjectInstructionHistoryEntry[]>([]);
  const [guidelineValidationError, setGuidelineValidationError] = useState<string | null>(null);
  const [guidelineSoftWarning, setGuidelineSoftWarning] = useState<string | null>(null);
  const [selectedGuidelineIndexes, setSelectedGuidelineIndexes] = useState<number[]>([]);
  const [expandedGuidelineIndexes, setExpandedGuidelineIndexes] = useState<number[]>([]);
  const [lastPolicyPackMeta, setLastPolicyPackMeta] = useState<string | null>(null);
  const [lastAutoRecoverySummary, setLastAutoRecoverySummary] = useState<string | null>(null);
  const [lastAutoRecoveryPrompt, setLastAutoRecoveryPrompt] = useState<string | null>(null);
  const [lastAutoRecoveryDiffSummary, setLastAutoRecoveryDiffSummary] = useState<string[] | null>(null);
  const [selectedRecoveryCompareIds, setSelectedRecoveryCompareIds] = useState<string[]>([]);
  const [selectedRecoveryComparePreset, setSelectedRecoveryComparePreset] = useState<'latest-prev' | 'latest-first' | 'latest-lowest' | null>(null);
  const [lastAutoRecoveryComparePrompt, setLastAutoRecoveryComparePrompt] = useState<string | null>(null);
  const [autoRecoveryHistory, setAutoRecoveryHistory] = useState<GuidelineAutoRecoveryReportEntry[]>([]);
  const [guidelineQualityHistory, setGuidelineQualityHistory] = useState<GuidelineQualityHistoryEntry[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const basicSectionRef = useRef<HTMLElement>(null);
  const guidelineSectionRef = useRef<HTMLDivElement>(null);
  const sourceSectionRef = useRef<HTMLElement>(null);
  const statusPopoverWrapRef = useRef<HTMLDivElement>(null);
  const statusBadgeButtonRef = useRef<HTMLButtonElement>(null);
  const statusPopoverCloseButtonRef = useRef<HTMLButtonElement>(null);
  const firstStatusDetailButtonRef = useRef<HTMLButtonElement>(null);
  const prevShowChangeSummaryRef = useRef(false);
  const firstRequiredPriorityBtnRef = useRef<HTMLButtonElement>(null);
  const hasLoadedGuidelineSelectionRef = useRef(false);
  const hasLoadedGuidelineExpandedRef = useRef(false);
  const guidelineQuality = useMemo(() => analyzeGuidelines(guidelines), [guidelines]);
  const activeGuidelineCount = guidelineQuality.nonEmpty;
  const requiredGuidelineCount = guidelineQuality.required;
  const recommendedGuidelineCount = guidelineQuality.recommended;
  const showGuidelineSelection = requiredGuidelineCount === 0 && activeGuidelineCount > 0;
  const historyStorageKey = projectId ? `project-edit-history-${projectId}` : null;
  const guidelineSelectionStorageKey = projectId ? `${GUIDELINE_SELECTION_STORAGE_PREFIX}-${projectId}` : null;
  const guidelineExpandedStorageKey = projectId ? `${GUIDELINE_EXPANDED_STORAGE_PREFIX}-${projectId}` : null;
  const guidelineQualityHistoryStorageKey = projectId ? `${GUIDELINE_QUALITY_HISTORY_STORAGE_PREFIX}-${projectId}` : null;
  const guidelineAutoRecoveryReportStorageKey = projectId ? `${GUIDELINE_AUTO_RECOVERY_REPORT_PREFIX}-${projectId}` : null;
  const guidelineAutoRecoveryCompareStorageKey = projectId ? `${GUIDELINE_AUTO_RECOVERY_COMPARE_PREFIX}-${projectId}` : null;
  const guidelineQualityTrend = useMemo(() => getGuidelineQualityTrend(guidelineQualityHistory), [guidelineQualityHistory]);
  const currentSnapshot = useMemo(
    () => buildProjectDraftSnapshot({
      name,
      description,
      instructions,
      tags,
      guidelines,
      files,
      webSources,
    }),
    [name, description, instructions, tags, guidelines, files, webSources]
  );
  const hasPendingChanges = useMemo(
    () => baselineSnapshot.length > 0 && currentSnapshot !== baselineSnapshot,
    [baselineSnapshot, currentSnapshot]
  );
  const changeSummaryLines = useMemo(() => {
    const base = parseProjectDraftSnapshot(baselineSnapshot);
    const curr = parseProjectDraftSnapshot(currentSnapshot);
    if (!base || !curr) return [];
    const lines: string[] = [];
    if (base.name !== curr.name) lines.push('이름이 변경되었습니다.');
    if (base.description !== curr.description) lines.push('설명이 변경되었습니다.');
    if (base.instructions !== curr.instructions) lines.push('지침이 변경되었습니다.');
    if (JSON.stringify(base.tags) !== JSON.stringify(curr.tags)) {
      lines.push(`태그가 변경되었습니다. (${base.tags.length} → ${curr.tags.length})`);
    }
    if (JSON.stringify(base.guidelines) !== JSON.stringify(curr.guidelines)) {
      lines.push(`규칙이 변경되었습니다. (${base.guidelines.length} → ${curr.guidelines.length})`);
    }
    if (JSON.stringify(base.files) !== JSON.stringify(curr.files)) {
      lines.push(`파일 목록이 변경되었습니다. (${base.files.length} → ${curr.files.length})`);
    }
    if (JSON.stringify(base.webSources) !== JSON.stringify(curr.webSources)) {
      lines.push(`웹 소스가 변경되었습니다. (${base.webSources.length} → ${curr.webSources.length})`);
    }
    if (lines.length === 0) lines.push('기준값 대비 변경된 항목이 없습니다.');
    return lines;
  }, [baselineSnapshot, currentSnapshot]);
  const changeDetailBlocks = useMemo(() => {
    const base = parseProjectDraftSnapshot(baselineSnapshot);
    const curr = parseProjectDraftSnapshot(currentSnapshot);
    if (!base || !curr) return [];
    const blocks: Array<{ title: string; section: ProjectEditSectionKey; added: string[]; removed: string[] }> = [];

    const basicChangedFields: string[] = [];
    if (base.name !== curr.name) basicChangedFields.push('이름');
    if (base.description !== curr.description) basicChangedFields.push('설명');
    if (base.instructions !== curr.instructions) basicChangedFields.push('지침');
    if (basicChangedFields.length > 0) {
      blocks.push({
        title: '기본',
        section: 'basic',
        added: basicChangedFields,
        removed: [],
      });
    }

    const tagDiff = buildAddedRemoved(
      normalizeComparableList(base.tags),
      normalizeComparableList(curr.tags)
    );
    if (tagDiff.added.length > 0 || tagDiff.removed.length > 0) {
      blocks.push({
        title: '태그',
        section: 'basic',
        added: tagDiff.added,
        removed: tagDiff.removed,
      });
    }

    const guidelineDiff = buildAddedRemoved(
      normalizeComparableList(base.guidelines),
      normalizeComparableList(curr.guidelines)
    );
    if (guidelineDiff.added.length > 0 || guidelineDiff.removed.length > 0) {
      blocks.push({
        title: '규칙',
        section: 'guideline',
        added: guidelineDiff.added,
        removed: guidelineDiff.removed,
      });
    }

    const baseFiles = normalizeComparableList(base.files.map((f) => f.name));
    const currentFiles = normalizeComparableList(curr.files.map((f) => f.name));
    const fileDiff = buildAddedRemoved(baseFiles, currentFiles);
    if (fileDiff.added.length > 0 || fileDiff.removed.length > 0) {
      blocks.push({
        title: '파일',
        section: 'source',
        added: fileDiff.added,
        removed: fileDiff.removed,
      });
    }

    const baseWebSources = normalizeComparableList(base.webSources.map((s) => s.url));
    const currentWebSources = normalizeComparableList(curr.webSources.map((s) => s.url));
    const webSourceDiff = buildAddedRemoved(baseWebSources, currentWebSources);
    if (webSourceDiff.added.length > 0 || webSourceDiff.removed.length > 0) {
      blocks.push({
        title: '웹 소스',
        section: 'source',
        added: webSourceDiff.added,
        removed: webSourceDiff.removed,
      });
    }

    return blocks;
  }, [baselineSnapshot, currentSnapshot]);

  const loadInstructionHistory = React.useCallback(() => {
    if (!historyStorageKey) {
      setInstructionHistory([]);
      return;
    }
    try {
      const raw = localStorage.getItem(historyStorageKey);
      if (!raw) {
        setInstructionHistory([]);
        return;
      }
      const parsed = JSON.parse(raw) as ProjectInstructionHistoryEntry[];
      if (!Array.isArray(parsed)) {
        setInstructionHistory([]);
        return;
      }
      setInstructionHistory(parsed.slice(0, HISTORY_LIMIT));
    } catch {
      setInstructionHistory([]);
    }
  }, [historyStorageKey]);

  const loadGuidelineQualityHistory = React.useCallback(() => {
    if (!guidelineQualityHistoryStorageKey) {
      setGuidelineQualityHistory([]);
      return;
    }
    try {
      const raw = localStorage.getItem(guidelineQualityHistoryStorageKey);
      if (!raw) {
        setGuidelineQualityHistory([]);
        return;
      }
      const parsed = JSON.parse(raw) as GuidelineQualityHistoryEntry[];
      if (!Array.isArray(parsed)) {
        setGuidelineQualityHistory([]);
        return;
      }
      setGuidelineQualityHistory(parsed.slice(0, QUALITY_HISTORY_LIMIT));
    } catch {
      setGuidelineQualityHistory([]);
    }
  }, [guidelineQualityHistoryStorageKey]);

  const loadGuidelineAutoRecoveryReport = React.useCallback(() => {
    if (!guidelineAutoRecoveryReportStorageKey) {
      setLastAutoRecoveryPrompt(null);
      setLastAutoRecoverySummary(null);
      setLastAutoRecoveryDiffSummary(null);
      setAutoRecoveryHistory([]);
      return;
    }
    try {
      const raw = localStorage.getItem(guidelineAutoRecoveryReportStorageKey);
      if (!raw) {
        setLastAutoRecoveryPrompt(null);
        setLastAutoRecoverySummary(null);
        setLastAutoRecoveryDiffSummary(null);
        setAutoRecoveryHistory([]);
        return;
      }
      const parsed = JSON.parse(raw) as GuidelineAutoRecoveryReportEntry[] | Partial<GuidelineAutoRecoveryReportEntry>;
      const normalizeEntry = (entry: Partial<GuidelineAutoRecoveryReportEntry>): GuidelineAutoRecoveryReportEntry | null => {
        if (typeof entry?.prompt !== 'string' || typeof entry?.summary !== 'string') return null;
        return {
          id: typeof entry.id === 'string' ? entry.id : createLocalId(),
          createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : new Date().toISOString(),
          summary: entry.summary,
          prompt: entry.prompt,
          beforeScore: Number(entry.beforeScore ?? 0),
          afterScore: Number(entry.afterScore ?? 0),
          delta: Number(entry.delta ?? 0),
          beforeGuidelines: Array.isArray(entry.beforeGuidelines) ? entry.beforeGuidelines.map((v) => String(v)) : [],
          afterGuidelines: Array.isArray(entry.afterGuidelines) ? entry.afterGuidelines.map((v) => String(v)) : [],
          diffSummary: Array.isArray(entry.diffSummary) ? entry.diffSummary.map((v) => String(v)) : undefined,
        };
      };
      const normalized = Array.isArray(parsed)
        ? parsed.map((entry) => normalizeEntry(entry)).filter((entry): entry is GuidelineAutoRecoveryReportEntry => Boolean(entry))
        : (() => {
          const one = normalizeEntry(parsed);
          return one ? [one] : [];
        })();
      const history = normalized.slice(0, AUTO_RECOVERY_REPORT_LIMIT);
      setAutoRecoveryHistory(history);
      setLastAutoRecoveryPrompt(history[0]?.prompt ?? null);
      setLastAutoRecoverySummary(history[0]?.summary ?? null);
      setLastAutoRecoveryDiffSummary(
        history[0]?.diffSummary
          ?? buildRecoveryDiffSummary(history[1]?.afterGuidelines ?? [], history[0]?.afterGuidelines ?? [])
      );
    } catch {
      setLastAutoRecoveryPrompt(null);
      setLastAutoRecoverySummary(null);
      setLastAutoRecoveryDiffSummary(null);
      setAutoRecoveryHistory([]);
    }
  }, [guidelineAutoRecoveryReportStorageKey]);

  const loadGuidelineAutoRecoveryComparePrompt = React.useCallback(() => {
    if (!guidelineAutoRecoveryCompareStorageKey) {
      setLastAutoRecoveryComparePrompt(null);
      setSelectedRecoveryCompareIds([]);
      return;
    }
    try {
      const raw = localStorage.getItem(guidelineAutoRecoveryCompareStorageKey);
      if (!raw) {
        setLastAutoRecoveryComparePrompt(null);
        setSelectedRecoveryCompareIds([]);
        return;
      }
      const parsed = JSON.parse(raw) as { prompt?: string; selectedIds?: string[] };
      setLastAutoRecoveryComparePrompt(typeof parsed?.prompt === 'string' ? parsed.prompt : null);
      setSelectedRecoveryCompareIds(
        Array.isArray(parsed?.selectedIds) ? parsed.selectedIds.map((v) => String(v)).slice(0, 2) : []
      );
    } catch {
      setLastAutoRecoveryComparePrompt(null);
      setSelectedRecoveryCompareIds([]);
    }
  }, [guidelineAutoRecoveryCompareStorageKey]);

  useEffect(() => {
    if (!isOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showChangeSummary) {
        setShowChangeSummary(false);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isOpen, onClose, showChangeSummary]);

  useEffect(() => {
    if (!isOpen || !projectId) return;
    setLoadError(null);
    setSaveSuccess(false);
    setLoading(true);
    projectService
      .getProject(projectId)
      .then((p) => {
        if (p) {
          setName(p.name);
          setDescription(p.description || '');
          setInstructions(typeof p.instructions === 'string' ? p.instructions : '');
          setTags(p.tags?.length ? [...p.tags] : []);
          const gl = p.initialGuidelines?.filter(Boolean) ?? [];
          setGuidelines(gl.length > 0 ? gl : ['']);
          const rawFiles = p.files ?? [];
          setFiles(rawFiles.map((f: Omit<ProjectFile, 'uploadedAt'> & { uploadedAt?: Date | string }) => {
            const up = f.uploadedAt;
            return {
              ...f,
              uploadedAt: up instanceof Date ? up : new Date(up ?? Date.now()),
            };
          }));
          const rawWebSources = p.webSources ?? [];
          const normalizedWebSources: ProjectLearningSource[] = rawWebSources
            .filter((s) => typeof s?.url === 'string' && coerceTrimmedString(s.url, '').length > 0)
            .map((s) => ({
              ...s,
              type: (s.type === 'video' ? 'video' : 'document') as ProjectLearningSource['type'],
              addedAt: s.addedAt instanceof Date ? s.addedAt : new Date(s.addedAt ?? Date.now()),
              syncStatus: (s.syncStatus === 'success' || s.syncStatus === 'failed' ? s.syncStatus : 'pending') as ProjectLearningSource['syncStatus'],
              lastSyncedAt: s.lastSyncedAt ? (s.lastSyncedAt instanceof Date ? s.lastSyncedAt : new Date(s.lastSyncedAt)) : undefined,
              syncError: typeof s.syncError === 'string' ? s.syncError : undefined,
            }));
          setWebSources(normalizedWebSources);
          setNewWebSourceUrl('');
          setNewWebSourceTitle('');
          setNewWebSourceType('document');
          setNotebookSourceCountHint(typeof p.source_count === 'number' ? p.source_count : null);
          setBaselineSnapshot(
            buildProjectDraftSnapshot({
              name: p.name,
              description: p.description || '',
              instructions: typeof p.instructions === 'string' ? p.instructions : '',
              tags: p.tags?.length ? [...p.tags] : [],
              guidelines: gl.length > 0 ? gl : [''],
              files: rawFiles.map((f: Omit<ProjectFile, 'uploadedAt'> & { uploadedAt?: Date | string }) => {
                const up = f.uploadedAt;
                return { ...f, uploadedAt: up instanceof Date ? up : new Date(up ?? Date.now()) };
              }),
              webSources: normalizedWebSources,
            })
          );
        } else {
          setLoadError('프로젝트를 불러올 수 없습니다.');
        }
      })
      .catch((err) => {
        errorLogger.error('프로젝트 로드 실패', err instanceof Error ? err : new Error(String(err)), {
          component: 'ProjectEditModal',
          action: 'getProject',
        });
        setLoadError('프로젝트를 불러오는 중 오류가 발생했습니다.');
        if (currentProject) {
          setName(currentProject.name);
          setDescription(currentProject.description || '');
          setInstructions('');
          setTags(currentProject.tags?.length ? [...currentProject.tags] : []);
          setGuidelines(['']);
          setFiles([]);
          setWebSources([]);
          setNewWebSourceUrl('');
          setNewWebSourceTitle('');
          setNewWebSourceType('document');
          setNotebookSourceCountHint(null);
          setBaselineSnapshot(
            buildProjectDraftSnapshot({
              name: currentProject.name,
              description: currentProject.description || '',
              instructions: '',
              tags: currentProject.tags?.length ? [...currentProject.tags] : [],
              guidelines: [''],
              files: [],
              webSources: [],
            })
          );
        }
      })
      .finally(() => setLoading(false));
    loadInstructionHistory();
    loadGuidelineQualityHistory();
    loadGuidelineAutoRecoveryReport();
    loadGuidelineAutoRecoveryComparePrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    projectId,
    currentProject?.name,
    currentProject?.description,
    currentProject?.tags,
    loadInstructionHistory,
    loadGuidelineQualityHistory,
    loadGuidelineAutoRecoveryReport,
    loadGuidelineAutoRecoveryComparePrompt,
  ]);

  useEffect(() => {
    if (!isOpen || !projectId) return;
    projectService.getNotebookContext(projectId)
      .then((ctx) => {
        if (ctx && typeof ctx.source_count === 'number') {
          setNotebookSourceCountHint(ctx.source_count);
        }
      })
      .catch(() => {
        // optional
      });
  }, [isOpen, projectId]);

  useEffect(() => {
    if (!isOpen || focusTarget !== 'required-guideline' || loading) return;
    guidelineSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    requestAnimationFrame(() => {
      firstRequiredPriorityBtnRef.current?.focus();
    });
  }, [focusTarget, isOpen, loading]);

  useEffect(() => {
    if (!showGuidelineSelection) {
      setSelectedGuidelineIndexes([]);
      return;
    }
    const selectable = guidelines
      .map((g, index) => ({ g, index }))
      .filter(({ g }) => coerceTrimmedString(stripGuidelinePriorityPrefix(g), '').length > 0 && getGuidelinePriority(g) !== '필수')
      .map(({ index }) => index);

    setSelectedGuidelineIndexes((prev) => {
      const validPrev = prev.filter((i) => selectable.includes(i));
      if (validPrev.length > 0) return validPrev;
      return selectable.slice(0, 2);
    });
  }, [guidelines, showGuidelineSelection]);

  useEffect(() => {
    if (!isOpen || !guidelineSelectionStorageKey) return;
    hasLoadedGuidelineSelectionRef.current = false;
    try {
      const raw = localStorage.getItem(guidelineSelectionStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const valid = parsed
        .filter((v) => typeof v === 'number' && Number.isInteger(v))
        .map((v) => Number(v))
        .filter((v) => v >= 0 && v < guidelines.length);
      if (valid.length > 0) {
        setSelectedGuidelineIndexes(valid);
      }
    } catch {
      // 복원 실패 시 기본 선택 로직 사용
    } finally {
      hasLoadedGuidelineSelectionRef.current = true;
    }
  }, [guidelineSelectionStorageKey, guidelines.length, isOpen]);

  useEffect(() => {
    if (!guidelineSelectionStorageKey) return;
    try {
      if (!isOpen) return;
      if (!hasLoadedGuidelineSelectionRef.current) return;
      localStorage.setItem(guidelineSelectionStorageKey, JSON.stringify(selectedGuidelineIndexes));
    } catch {
      // 저장 실패는 무시
    }
  }, [guidelineSelectionStorageKey, isOpen, selectedGuidelineIndexes]);

  useEffect(() => {
    if (!isOpen || !guidelineExpandedStorageKey) return;
    hasLoadedGuidelineExpandedRef.current = false;
    try {
      const raw = localStorage.getItem(guidelineExpandedStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;
      const valid = parsed
        .filter((v) => typeof v === 'number' && Number.isInteger(v))
        .map((v) => Number(v))
        .filter((v) => v >= 0 && v < guidelines.length);
      if (valid.length > 0) {
        setExpandedGuidelineIndexes(valid);
      }
    } catch {
      // 복원 실패 시 기본값 유지
    } finally {
      hasLoadedGuidelineExpandedRef.current = true;
    }
  }, [guidelineExpandedStorageKey, guidelines.length, isOpen]);

  useEffect(() => {
    if (!guidelineExpandedStorageKey) return;
    try {
      if (!isOpen) return;
      if (!hasLoadedGuidelineExpandedRef.current) return;
      localStorage.setItem(guidelineExpandedStorageKey, JSON.stringify(expandedGuidelineIndexes));
    } catch {
      // 저장 실패는 무시
    }
  }, [expandedGuidelineIndexes, guidelineExpandedStorageKey, isOpen]);

  const handleAddTag = () => {
    const t = coerceTrimmedString(newTag, '');
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleAddGuideline = () => {
    setGuidelineValidationError(null);
    setGuidelineSoftWarning(null);
    setGuidelines([...guidelines, '']);
  };
  const handleRemoveGuideline = (i: number) => {
    setGuidelineValidationError(null);
    setGuidelineSoftWarning(null);
    setGuidelines(guidelines.filter((_, idx) => idx !== i));
    setExpandedGuidelineIndexes((prev) =>
      prev.filter((idx) => idx !== i).map((idx) => (idx > i ? idx - 1 : idx))
    );
  };
  const handleGuidelineChange = (i: number, value: string) => {
    const next = [...guidelines];
    next[i] = value;
    setGuidelineValidationError(null);
    setGuidelineSoftWarning(null);
    setGuidelines(next);
  };
  const stripGuidelinePriorityPrefix = (value: string) => value.replace(/^\[(필수|권장)\]\s*/, '');
  const getGuidelinePriority = (value: string): GuidelinePriority | null => {
    const matched = value.match(/^\[(필수|권장)\]\s*/);
    if (!matched) return null;
    return matched[1] as GuidelinePriority;
  };
  const handleGuidelinePriority = (i: number, priority: GuidelinePriority) => {
    const next = [...guidelines];
    const baseText = coerceTrimmedString(stripGuidelinePriorityPrefix(next[i] ?? ''), '');
    next[i] = coerceTrimmedString(`[${priority}] ${baseText}`, '');
    setGuidelineValidationError(null);
    setGuidelineSoftWarning(null);
    setGuidelines(next);
  };
  const toggleGuidelineSelection = (index: number) => {
    setSelectedGuidelineIndexes((prev) => {
      if (prev.includes(index)) return prev.filter((i) => i !== index);
      return [...prev, index];
    });
  };
  const getSelectableGuidelineIndexes = () => guidelines
    .map((g, index) => ({ g, index }))
    .filter(({ g }) => coerceTrimmedString(stripGuidelinePriorityPrefix(g), '').length > 0 && getGuidelinePriority(g) !== '필수')
    .map(({ index }) => index);
  const selectAllGuidelineCandidates = () => {
    setSelectedGuidelineIndexes(getSelectableGuidelineIndexes());
  };
  const clearGuidelineSelection = () => {
    setSelectedGuidelineIndexes([]);
  };
  const resetGuidelineSelectionPersistence = () => {
    if (!guidelineSelectionStorageKey) return;
    try {
      localStorage.removeItem(guidelineSelectionStorageKey);
    } catch {
      // 초기화 실패는 무시
    }
    setSelectedGuidelineIndexes([]);
    showToast('가이드라인 선택 저장값을 초기화했습니다.');
  };

  const toggleGuidelineExpanded = (index: number) => {
    setExpandedGuidelineIndexes((prev) =>
      prev.includes(index) ? prev.filter((v) => v !== index) : [...prev, index]
    );
  };
  const expandAllGuidelines = () => {
    setExpandedGuidelineIndexes(guidelines.map((_, index) => index));
  };
  const collapseAllGuidelines = () => {
    setExpandedGuidelineIndexes([]);
  };
  const resetGuidelineExpandedPersistence = () => {
    if (!guidelineExpandedStorageKey) return;
    try {
      localStorage.removeItem(guidelineExpandedStorageKey);
    } catch {
      // 초기화 실패는 무시
    }
    setExpandedGuidelineIndexes([]);
    showToast('가이드라인 확장 상태 저장값을 초기화했습니다.');
  };
  const applyRequiredGuidelineRecommendations = () => {
    const next = [...guidelines];
    let upgraded = 0;
    const targetIndexes = selectedGuidelineIndexes
      .filter((i) => i >= 0 && i < next.length)
      .filter((i) => coerceTrimmedString(stripGuidelinePriorityPrefix(next[i] ?? ''), '').length > 0 && getGuidelinePriority(next[i] ?? '') !== '필수');
    if (targetIndexes.length === 0) {
      showToast('필수로 승격할 가이드라인을 선택해 주세요.');
      return;
    }
    for (const i of targetIndexes) {
      const raw = next[i] ?? '';
      const baseText = coerceTrimmedString(stripGuidelinePriorityPrefix(raw), '');
      if (!baseText) continue;
      if (getGuidelinePriority(raw) === '필수') continue;
      next[i] = `[필수] ${baseText}`;
      upgraded += 1;
    }
    setGuidelineValidationError(null);
    setGuidelineSoftWarning(null);
    setGuidelines(next);
    setSelectedGuidelineIndexes([]);
    if (upgraded > 0) {
      showToast(`핵심 가이드라인 ${upgraded}개를 [필수]로 적용했습니다.`);
    } else {
      showToast('적용할 가이드라인이 없습니다. 가이드라인 내용을 먼저 입력해 주세요.');
    }
  };
  const normalizeUntypedGuidelines = () => {
    let updatedCount = 0;
    const next = guidelines.map((raw) => {
      const trimmed = coerceTrimmedString(raw, '');
      if (!trimmed) return raw;
      if (/^\[(필수|권장)\]\s*/.test(trimmed)) return raw;
      updatedCount += 1;
      return `[권장] ${trimmed}`;
    });
    setGuidelines(next);
    if (updatedCount > 0) {
      showToast(`접두어 없는 가이드라인 ${updatedCount}개를 [권장]으로 정리했습니다.`);
    } else {
      showToast('정리할 가이드라인이 없습니다.');
    }
  };
  const removeDuplicateGuidelines = () => {
    const seen = new Set<string>();
    let removedCount = 0;
    const next: string[] = [];
    for (const raw of guidelines) {
      const normalized = coerceTrimmedString(stripGuidelinePriorityPrefix(raw), '').toLowerCase();
      if (!normalized) {
        next.push(raw);
        continue;
      }
      if (seen.has(normalized)) {
        removedCount += 1;
        continue;
      }
      seen.add(normalized);
      next.push(raw);
    }
    setGuidelines(next.length > 0 ? next : ['']);
    if (removedCount > 0) {
      showToast(`중복 가이드라인 ${removedCount}개를 제거했습니다.`);
    } else {
      showToast('중복 가이드라인이 없습니다.');
    }
  };
  const removeEmptyGuidelines = () => {
    const next = guidelines.filter((raw) => coerceTrimmedString(stripGuidelinePriorityPrefix(raw), '').length > 0);
    const removedCount = guidelines.length - next.length;
    setGuidelines(next.length > 0 ? next : ['']);
    if (removedCount > 0) {
      showToast(`빈 가이드라인 ${removedCount}개를 정리했습니다.`);
    } else {
      showToast('빈 가이드라인이 없습니다.');
    }
  };
  const applyGuidelineAutoRecovery = () => {
    const before = analyzeGuidelines(guidelines);
    let normalizedCount = 0;
    let removedDuplicateCount = 0;
    let removedEmptyCount = 0;
    let promotedRequiredCount = 0;
    const seen = new Set<string>();
    const next: string[] = [];

    for (const raw of guidelines) {
      const trimmed = coerceTrimmedString(raw, '');
      if (!trimmed) {
        removedEmptyCount += 1;
        continue;
      }
      const baseText = coerceTrimmedString(stripGuidelinePriorityPrefix(trimmed), '');
      if (!baseText) {
        removedEmptyCount += 1;
        continue;
      }
      const priority = getGuidelinePriority(trimmed);
      const resolvedPriority: GuidelinePriority = priority ?? '권장';
      if (!priority) normalizedCount += 1;
      const normalizedKey = baseText.toLowerCase();
      if (seen.has(normalizedKey)) {
        removedDuplicateCount += 1;
        continue;
      }
      seen.add(normalizedKey);
      next.push(`[${resolvedPriority}] ${baseText}`);
    }

    if (next.length > 0 && next.every((item) => getGuidelinePriority(item) !== '필수')) {
      const selectedTarget = selectedGuidelineIndexes.find((index) => index >= 0 && index < next.length);
      const promoteIndex = selectedTarget ?? 0;
      const baseText = coerceTrimmedString(stripGuidelinePriorityPrefix(next[promoteIndex]), '');
      if (baseText) {
        next[promoteIndex] = `[필수] ${baseText}`;
        promotedRequiredCount = 1;
      }
    }

    const recovered = next.length > 0 ? next : [''];
    const after = analyzeGuidelines(recovered);
    const previousEntry = autoRecoveryHistory[0];
    const delta = after.qualityScore - before.qualityScore;
    const beforeGuidelines = guidelines.map((item) => coerceTrimmedString(item, '')).filter((item) => item.length > 0);
    const afterGuidelines = recovered.map((item) => coerceTrimmedString(item, '')).filter((item) => item.length > 0);
    const diffSummary = buildRecoveryDiffSummary(previousEntry?.afterGuidelines ?? [], afterGuidelines);
    const compareToPrevious = previousEntry
      ? ` · 직전 대비 ${after.qualityScore - previousEntry.afterScore >= 0 ? '+' : ''}${after.qualityScore - previousEntry.afterScore}점`
      : '';
    const summary = `복구 완료: ${delta >= 0 ? '+' : ''}${delta}점 · 접두어 ${normalizedCount} · 중복 ${removedDuplicateCount} · 빈 항목 ${removedEmptyCount} · 필수 승격 ${promotedRequiredCount}${compareToPrevious}`;
    const recoveryPrompt = [
      `[가이드라인 자동 복구 리포트]`,
      `프로젝트: ${name || '이름 미설정'}`,
      `복구 시각: ${new Date().toLocaleString('ko-KR')}`,
      ``,
      `[점수 변화]`,
      `- 복구 전: ${before.qualityScore}점 (${before.qualityStatus})`,
      `- 복구 후: ${after.qualityScore}점 (${after.qualityStatus})`,
      `- 변화량: ${delta >= 0 ? '+' : ''}${delta}점`,
      ``,
      `[정리 내역]`,
      `- 접두어 정리: ${normalizedCount}개`,
      `- 중복 제거: ${removedDuplicateCount}개`,
      `- 빈 항목 제거: ${removedEmptyCount}개`,
      `- 필수 규칙 승격: ${promotedRequiredCount}개`,
      ``,
      `[현재 품질 지표]`,
      `- 필수 ${after.required}개 / 권장 ${after.recommended}개 / 미분류 ${after.untyped}개 / 중복 ${after.duplicates}개 / 빈 항목 ${after.empty}개`,
      ``,
      `[직전 복구 대비 변화]`,
      ...diffSummary,
      ``,
      `[요청]`,
      `이 데이터를 기반으로 운영 회의용 보고서를 작성해줘. "원인-조치-재발방지-다음점검일" 형식으로 정리해줘.`,
    ].join('\n');
    setGuidelines(recovered);
    setGuidelineValidationError(null);
    setGuidelineSoftWarning(null);
    setSelectedGuidelineIndexes([]);
    setLastAutoRecoverySummary(summary);
    setLastAutoRecoveryPrompt(recoveryPrompt);
    setLastAutoRecoveryDiffSummary(diffSummary);
    const entry: GuidelineAutoRecoveryReportEntry = {
      id: createLocalId(),
      createdAt: new Date().toISOString(),
      summary,
      prompt: recoveryPrompt,
      beforeScore: before.qualityScore,
      afterScore: after.qualityScore,
      delta,
      beforeGuidelines,
      afterGuidelines,
      diffSummary,
    };
    if (guidelineAutoRecoveryReportStorageKey) {
      try {
        const raw = localStorage.getItem(guidelineAutoRecoveryReportStorageKey);
        const prev = raw ? (JSON.parse(raw) as GuidelineAutoRecoveryReportEntry[]) : [];
        const merged = [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, AUTO_RECOVERY_REPORT_LIMIT);
        localStorage.setItem(
          guidelineAutoRecoveryReportStorageKey,
          JSON.stringify(merged)
        );
        setAutoRecoveryHistory(merged);
      } catch {
        // 로컬 저장 실패는 무시
      }
    }
    showToast(summary);
  };

  const handleAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    const newFiles: ProjectFile[] = [];
    const useApi = Boolean(projectId);
    setUploadingFiles(true);
    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        if (useApi) {
          const uploaded = await projectService.uploadProjectFile(projectId!, file);
          if (uploaded) {
            newFiles.push(uploaded);
          } else {
            newFiles.push({
              id: createLocalId(),
              name: file.name,
              type: inferFileType(file.name),
              size: file.size,
              uploadedAt: new Date(),
            });
            showToast(`"${file.name}" 업로드에 실패했습니다. 로컬 목록에만 추가됩니다.`);
          }
        } else {
          newFiles.push({
            id: createLocalId(),
            name: file.name,
            type: inferFileType(file.name),
            size: file.size,
            uploadedAt: new Date(),
          });
        }
      }
      setFiles((prev) => [...prev, ...newFiles]);
    } finally {
      setUploadingFiles(false);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => setFiles((prev) => prev.filter((f) => f.id !== fileId));

  const syncWebSourceToNotebook = async (source: ProjectLearningSource) => {
    if (!projectId) {
      return { ok: false as const, message: '프로젝트를 선택한 뒤 동기화할 수 있습니다.' };
    }
    const fromUrlResult = await projectService.addNotebookSourceFromUrl(projectId, source.url);
    if (fromUrlResult && typeof fromUrlResult.source_count === 'number') {
      return { ok: true as const, sourceCount: fromUrlResult.source_count };
    }
    if (source.type === 'video') {
      const youtubeFallback = await projectService.addNotebookSourcesFromYoutubeSearch(projectId, {
        query: coerceTrimmedString(source.title, '') || source.url,
        maxVideos: 1,
      });
      if (youtubeFallback && typeof youtubeFallback.source_count === 'number') {
        return { ok: true as const, sourceCount: youtubeFallback.source_count };
      }
    }
    return { ok: false as const, message: '노트북 학습 반영에 실패했습니다.' };
  };

  const handleAddWebSource = () => {
    void (async () => {
      try {
        const normalizedUrl = normalizeWebSourceUrl(newWebSourceUrl);
        if (!normalizedUrl) {
          showToast('웹 문서/영상 URL을 입력해 주세요.');
          return;
        }
        const duplicated = webSources.some((s) => s.url === normalizedUrl);
        if (duplicated) {
          showToast('이미 등록된 URL입니다.');
          return;
        }
        setAddingWebSource(true);
        const sourceId = createLocalId();
        const nextSource: ProjectLearningSource = {
          id: sourceId,
          type: newWebSourceType,
          url: normalizedUrl,
          title: coerceTrimmedString(newWebSourceTitle, '') || undefined,
          addedAt: new Date(),
          syncStatus: 'pending',
        };
        setWebSources((prev) => [nextSource, ...prev]);
        setSyncingWebSourceIds((prev) => [...prev, sourceId]);

        if (projectId) {
          try {
            const syncResult = await syncWebSourceToNotebook(nextSource);
            const now = new Date();
            if (syncResult.ok) {
              setNotebookSourceCountHint(syncResult.sourceCount);
              setWebSources((prev) => prev.map((item) => (
                item.id === sourceId ? { ...item, syncStatus: 'success', lastSyncedAt: now, syncError: undefined } : item
              )));
              showToast('웹 소스를 프로젝트 학습 노트북에 반영했습니다.');
            } else {
              setWebSources((prev) => prev.map((item) => (
                item.id === sourceId ? { ...item, syncStatus: 'failed', lastSyncedAt: now, syncError: syncResult.message } : item
              )));
              showToast('웹 소스는 저장했지만 자동 학습 반영에는 실패했습니다.');
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : '자동 학습 반영 중 오류';
            const now = new Date();
            setWebSources((prev) => prev.map((item) => (
              item.id === sourceId ? { ...item, syncStatus: 'failed', lastSyncedAt: now, syncError: message } : item
            )));
            showToast('웹 소스는 저장했지만 자동 학습 반영 중 오류가 발생했습니다.');
          } finally {
            setSyncingWebSourceIds((prev) => prev.filter((id) => id !== sourceId));
          }
        }

        setNewWebSourceUrl('');
        setNewWebSourceTitle('');
      } finally {
        setAddingWebSource(false);
      }
    })();
  };

  const handleRetryWebSourceSync = (source: ProjectLearningSource) => {
    void (async () => {
      if (!projectId) return;
      setSyncingWebSourceIds((prev) => (prev.includes(source.id) ? prev : [...prev, source.id]));
      setWebSources((prev) => prev.map((item) => (
        item.id === source.id ? { ...item, syncStatus: 'pending' } : item
      )));
      try {
        const syncResult = await syncWebSourceToNotebook(source);
        const now = new Date();
        if (syncResult.ok) {
          setNotebookSourceCountHint(syncResult.sourceCount);
          setWebSources((prev) => prev.map((item) => (
            item.id === source.id ? { ...item, syncStatus: 'success', lastSyncedAt: now, syncError: undefined } : item
          )));
          showToast('웹 소스를 다시 학습 반영했습니다.');
        } else {
          setWebSources((prev) => prev.map((item) => (
            item.id === source.id ? { ...item, syncStatus: 'failed', lastSyncedAt: now, syncError: syncResult.message } : item
          )));
          showToast('재시도했지만 학습 반영에 실패했습니다.');
        }
      } catch (err) {
        const now = new Date();
        const message = err instanceof Error ? err.message : '재시도 중 오류';
        setWebSources((prev) => prev.map((item) => (
          item.id === source.id ? { ...item, syncStatus: 'failed', lastSyncedAt: now, syncError: message } : item
        )));
        showToast('웹 소스 재시도 중 오류가 발생했습니다.');
      } finally {
        setSyncingWebSourceIds((prev) => prev.filter((id) => id !== source.id));
      }
    })();
  };

  const handleRemoveWebSource = (sourceId: string) =>
    setWebSources((prev) => prev.filter((s) => s.id !== sourceId));

  const saveInstructionHistorySnapshot = React.useCallback(() => {
    if (!historyStorageKey) return;
    const trimmedGuidelines = guidelines.map((g) => coerceTrimmedString(g, '')).filter(Boolean);
    const nextEntry: ProjectInstructionHistoryEntry = {
      id: createLocalId(),
      savedAt: new Date().toISOString(),
      instructions: coerceTrimmedString(instructions, ''),
      guidelines: trimmedGuidelines,
      tags: tags.filter(Boolean),
    };

    try {
      const raw = localStorage.getItem(historyStorageKey);
      const prev = raw ? (JSON.parse(raw) as ProjectInstructionHistoryEntry[]) : [];
      const latest = Array.isArray(prev) && prev.length > 0 ? prev[0] : null;
      const unchanged =
        latest &&
        latest.instructions === nextEntry.instructions &&
        JSON.stringify(latest.guidelines) === JSON.stringify(nextEntry.guidelines) &&
        JSON.stringify(latest.tags) === JSON.stringify(nextEntry.tags);
      if (unchanged) return;
      const merged = [nextEntry, ...(Array.isArray(prev) ? prev : [])].slice(0, HISTORY_LIMIT);
      localStorage.setItem(historyStorageKey, JSON.stringify(merged));
      setInstructionHistory(merged);
    } catch {
      // 히스토리 저장 실패는 동작을 막지 않음
    }
  }, [guidelines, historyStorageKey, instructions, tags]);

  const saveGuidelineQualityHistorySnapshot = React.useCallback(() => {
    if (!guidelineQualityHistoryStorageKey) return;
    const nextEntry: GuidelineQualityHistoryEntry = {
      id: createLocalId(),
      savedAt: new Date().toISOString(),
      score: guidelineQuality.qualityScore,
      status: guidelineQuality.qualityStatus,
      required: guidelineQuality.required,
      recommended: guidelineQuality.recommended,
      untyped: guidelineQuality.untyped,
      duplicates: guidelineQuality.duplicates,
      empty: guidelineQuality.empty,
    };
    try {
      const raw = localStorage.getItem(guidelineQualityHistoryStorageKey);
      const prev = raw ? (JSON.parse(raw) as GuidelineQualityHistoryEntry[]) : [];
      const merged = [nextEntry, ...(Array.isArray(prev) ? prev : [])].slice(0, QUALITY_HISTORY_LIMIT);
      localStorage.setItem(guidelineQualityHistoryStorageKey, JSON.stringify(merged));
      setGuidelineQualityHistory(merged);
    } catch {
      // 품질 히스토리 저장 실패는 동작을 막지 않음
    }
  }, [guidelineQuality, guidelineQualityHistoryStorageKey]);

  const restoreHistoryEntry = (entry: ProjectInstructionHistoryEntry) => {
    setInstructions(entry.instructions);
    setGuidelines(entry.guidelines.length > 0 ? [...entry.guidelines] : ['']);
    setTags(entry.tags.length > 0 ? [...entry.tags] : []);
    showToast('선택한 지침 버전을 불러왔습니다.');
  };

  const applyOperationPreset = (preset: ProjectOperationPreset) => {
    setInstructions((prev) => {
      const t = coerceTrimmedString(prev, '');
      return t ? `${t}\n\n${preset.instructions}` : preset.instructions;
    });
    setGuidelines((prev) => {
      const current = prev.map((g) => coerceTrimmedString(g, '')).filter(Boolean);
      const merged = [...current];
      for (const g of preset.guidelines) {
        if (!merged.includes(g)) merged.push(g);
      }
      return merged.length > 0 ? merged : [''];
    });
    setTags((prev) => Array.from(new Set([...prev, ...preset.tags])));
    showToast(`"${preset.label}" 템플릿을 적용했습니다.`);
  };

  const copyGuidelinePolicyPack = async () => {
    try {
      const pack = createGuidelinePolicyPack({
        projectId,
        projectName: name,
        instructions,
        guidelines,
        tags,
      });
      const payload = serializeGuidelinePolicyPack(pack);
      await navigator.clipboard.writeText(payload);
      setLastPolicyPackMeta(`${new Date(pack.exportedAt).toLocaleString('ko-KR')} · ${pack.quality.qualityScore}점`);
      showToast('정책팩을 클립보드로 복사했습니다.');
    } catch {
      showToast('정책팩 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const applyGuidelinePolicyPackFromClipboard = async () => {
    try {
      const raw = await navigator.clipboard.readText();
      const pack = parseGuidelinePolicyPack(raw);
      if (!pack) {
        showToast('정책팩 형식이 아닙니다. 복사한 JSON을 확인해 주세요.');
        return;
      }
      setInstructions(pack.instructions);
      setGuidelines(pack.guidelines.length > 0 ? pack.guidelines : ['']);
      setTags(pack.tags);
      setGuidelineValidationError(null);
      setGuidelineSoftWarning(null);
      setLastPolicyPackMeta(`${new Date(pack.exportedAt).toLocaleString('ko-KR')} · ${pack.quality.qualityScore}점`);
      showToast('정책팩을 적용했습니다.');
    } catch {
      showToast('정책팩 붙여넣기에 실패했습니다. 클립보드 권한을 확인해 주세요.');
    }
  };

  const copyAutoRecoveryReportPrompt = async () => {
    if (!lastAutoRecoveryPrompt) {
      showToast('복사할 자동 복구 리포트가 없습니다. 먼저 자동 복구를 실행해 주세요.');
      return;
    }
    try {
      await navigator.clipboard.writeText(lastAutoRecoveryPrompt);
      showToast('자동 복구 리포트를 클립보드로 복사했습니다.');
    } catch {
      showToast('자동 복구 리포트 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const applyAutoRecoveryHistoryEntry = (entryId: string) => {
    const targetIndex = autoRecoveryHistory.findIndex((entry) => entry.id === entryId);
    const target = targetIndex >= 0 ? autoRecoveryHistory[targetIndex] : null;
    if (!target) return;
    setLastAutoRecoverySummary(target.summary);
    setLastAutoRecoveryPrompt(target.prompt);
    const previous = autoRecoveryHistory[targetIndex + 1];
    setLastAutoRecoveryDiffSummary(
      target.diffSummary ?? buildRecoveryDiffSummary(previous?.afterGuidelines ?? [], target.afterGuidelines ?? [])
    );
    showToast('선택한 복구 리포트를 불러왔습니다.');
  };

  const toggleRecoveryCompareSelection = (entryId: string) => {
    setSelectedRecoveryComparePreset(null);
    setSelectedRecoveryCompareIds((prev) => {
      if (prev.includes(entryId)) return prev.filter((id) => id !== entryId);
      if (prev.length >= 2) return [prev[1], entryId];
      return [...prev, entryId];
    });
  };

  const applyRecoveryComparePreset = (preset: 'latest-prev' | 'latest-first' | 'latest-lowest') => {
    if (autoRecoveryHistory.length < 2) {
      showToast('비교 가능한 복구 이력이 2개 이상 필요합니다.');
      return;
    }
    const latest = autoRecoveryHistory[0];
    const target = preset === 'latest-prev'
      ? autoRecoveryHistory[1]
      : preset === 'latest-first'
        ? autoRecoveryHistory[autoRecoveryHistory.length - 1]
        : autoRecoveryHistory.reduce((lowest, entry) => (
          entry.afterScore < lowest.afterScore ? entry : lowest
        ), autoRecoveryHistory[1]);
    if (!latest || !target) {
      showToast('비교 프리셋을 구성할 수 없습니다.');
      return;
    }
    const selectedIds = [latest.id, target.id];
    setSelectedRecoveryComparePreset(preset);
    setSelectedRecoveryCompareIds(selectedIds);
    showToast(
      preset === 'latest-prev'
        ? '비교 프리셋: 최신 vs 직전 이력을 선택했습니다.'
        : preset === 'latest-first'
          ? '비교 프리셋: 최신 vs 최초 이력을 선택했습니다.'
          : '비교 프리셋: 최신 vs 품질최저점 이력을 선택했습니다.'
    );
  };

  const generateRecoveryComparisonPrompt = () => {
    if (selectedRecoveryCompareIds.length !== 2) {
      showToast('비교할 복구 이력을 2개 선택해 주세요.');
      return;
    }
    const entries = selectedRecoveryCompareIds
      .map((id) => autoRecoveryHistory.find((entry) => entry.id === id))
      .filter((entry): entry is GuidelineAutoRecoveryReportEntry => Boolean(entry));
    if (entries.length !== 2) {
      showToast('선택한 복구 이력을 찾을 수 없습니다. 다시 선택해 주세요.');
      return;
    }
    const [first, second] = entries.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const diffLines = buildRecoveryDiffSummary(first.afterGuidelines ?? [], second.afterGuidelines ?? []);
    const comparePrompt = [
      '[복구 이력 A/B 비교]',
      `A(이전): ${new Date(first.createdAt).toLocaleString('ko-KR')} · ${first.afterScore}점`,
      `B(이후): ${new Date(second.createdAt).toLocaleString('ko-KR')} · ${second.afterScore}점`,
      `점수 변화(B-A): ${second.afterScore - first.afterScore >= 0 ? '+' : ''}${second.afterScore - first.afterScore}점`,
      '',
      '[구조 변화 요약]',
      ...diffLines,
      '',
      '[요청]',
      '위 비교를 표 형식으로 정리해줘. 컬럼은 "구분 | A 상태 | B 상태 | 변화 | 운영 영향 | 즉시 조치"로 작성해줘.',
      ...(selectedRecoveryComparePreset === 'latest-lowest'
        ? [
          '',
          '[추가 요청 - 품질최저점 비교 전용]',
          '1) 품질 최저점의 리스크 원인 TOP3를 근거와 함께 제시해줘.',
          '2) 동일 이슈 재발 방지 룰 5개를 필수/권장으로 구분해줘.',
          '3) 다음 7일 복구 운영 계획(담당/기한/검증지표)을 표로 정리해줘.',
        ]
        : []),
    ].join('\n');
    setLastAutoRecoveryComparePrompt(comparePrompt);
    if (guidelineAutoRecoveryCompareStorageKey) {
      try {
        localStorage.setItem(
          guidelineAutoRecoveryCompareStorageKey,
          JSON.stringify({
            createdAt: new Date().toISOString(),
            selectedIds: selectedRecoveryCompareIds,
            prompt: comparePrompt,
          })
        );
      } catch {
        // 저장 실패는 무시
      }
    }
    showToast('복구 이력 비교 리포트를 생성했습니다.');
  };

  const copyRecoveryComparisonPrompt = async () => {
    if (!lastAutoRecoveryComparePrompt) {
      showToast('복사할 복구 비교 리포트가 없습니다. 이력 2개를 선택해 생성해 주세요.');
      return;
    }
    try {
      await navigator.clipboard.writeText(lastAutoRecoveryComparePrompt);
      showToast('복구 비교 리포트를 클립보드로 복사했습니다.');
    } catch {
      showToast('복구 비교 리포트 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  const handleSave = async () => {
    if (!projectId || !coerceTrimmedString(name, '')) return;
    setGuidelineSoftWarning(null);
    const requiredButEmpty = guidelines
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => getGuidelinePriority(item) === '필수' && !coerceTrimmedString(stripGuidelinePriorityPrefix(item), ''))
      .map(({ index }) => index + 1);
    if (requiredButEmpty.length > 0) {
      const message = `필수 가이드라인 ${requiredButEmpty.join(', ')}번 항목의 내용을 입력해 주세요.`;
      setGuidelineValidationError(message);
      showToast(message);
      return;
    }
    if (requiredGuidelineCount === 0 && activeGuidelineCount > 0) {
      setGuidelineSoftWarning('필수 가이드라인이 없습니다. 운영 안정성을 위해 최소 1개 이상 [필수] 설정을 권장합니다.');
    }
    setSaving(true);
    try {
      const updated = await projectService.updateProject(projectId, {
        name: coerceTrimmedString(name, ''),
        description: coerceTrimmedString(description, ''),
        instructions: coerceTrimmedString(instructions, ''),
        tags,
        initialGuidelines: guidelines.filter((g) => coerceTrimmedString(g, '')),
        files,
        webSources,
        source_count: Math.max(
          notebookSourceCountHint ?? 0,
          files.length + webSources.length
        ),
      });
      if (updated) {
        try {
          FileStorageService.getInstance().saveProjectFiles(projectId, files);
        } catch {
          // optional sync to localStorage
        }
        setSaveSuccess(true);
        setBaselineSnapshot(currentSnapshot);
        saveInstructionHistorySnapshot();
        saveGuidelineQualityHistorySnapshot();
        onSaved?.(updated);
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      errorLogger.error('프로젝트 수정 실패', err instanceof Error ? err : new Error(String(err)), {
        component: 'ProjectEditModal',
        action: 'updateProject',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (saveSuccess && hasPendingChanges) {
      setSaveSuccess(false);
    }
  }, [hasPendingChanges, saveSuccess]);

  useEffect(() => {
    if (!saveSuccess || hasPendingChanges) return;
    const timer = window.setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [hasPendingChanges, saveSuccess]);

  useEffect(() => {
    if (!hasPendingChanges) {
      setShowChangeSummary(false);
    }
  }, [hasPendingChanges]);

  useEffect(() => {
    if (!showChangeSummary) return;
    const focusTimer = window.setTimeout(() => {
      if (statusPopoverCloseButtonRef.current) {
        statusPopoverCloseButtonRef.current.focus();
        return;
      }
      if (firstStatusDetailButtonRef.current) {
        firstStatusDetailButtonRef.current.focus();
        return;
      }
      statusBadgeButtonRef.current?.focus();
    }, 0);
    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (statusPopoverWrapRef.current?.contains(target)) return;
      setShowChangeSummary(false);
    };
    window.addEventListener('mousedown', handlePointerDownOutside);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('mousedown', handlePointerDownOutside);
    };
  }, [showChangeSummary]);

  useEffect(() => {
    if (!showChangeSummary && prevShowChangeSummaryRef.current) {
      statusBadgeButtonRef.current?.focus();
    }
    prevShowChangeSummaryRef.current = showChangeSummary;
  }, [showChangeSummary]);

  const scrollToSection = (section: ProjectEditSectionKey) => {
    const target =
      section === 'basic'
        ? basicSectionRef.current
        : section === 'guideline'
          ? guidelineSectionRef.current
          : sourceSectionRef.current;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setShowChangeSummary(false);
  };

  const handleStatusWrapKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showChangeSummary || event.key !== 'Tab') return;
    const wrap = statusPopoverWrapRef.current;
    if (!wrap) return;
    const focusableButtons = Array.from(wrap.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
      .filter((button) => button.offsetParent !== null);
    if (focusableButtons.length === 0) return;

    const active = document.activeElement as HTMLButtonElement | null;
    const currentIndex = active ? focusableButtons.indexOf(active) : -1;
    if (currentIndex === -1) {
      event.preventDefault();
      focusableButtons[0].focus();
      return;
    }
    if (event.shiftKey) {
      if (currentIndex === 0) {
        event.preventDefault();
        focusableButtons[focusableButtons.length - 1].focus();
      }
      return;
    }
    if (currentIndex === focusableButtons.length - 1) {
      event.preventDefault();
      focusableButtons[0].focus();
    }
  };

  const handleStatusBadgeClick = () => {
    if (!hasPendingChanges) return;
    setShowChangeSummary((prev) => !prev);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="project-edit-modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-edit-title"
        data-testid={TEST_IDS.PROJECT_EDIT_MODAL}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="project-edit-modal-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="project-edit-modal-header">
            <h2 id="project-edit-title" className="project-edit-modal-title">
              프로젝트 설정
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="프로젝트 설정 모달 닫기"
              className="project-edit-modal-close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="project-edit-modal-body">
            {loading && (
              <div className="project-edit-modal-loading">프로젝트 정보를 불러오는 중...</div>
            )}
            {loadError && (
              <div className="project-edit-modal-error">
                {loadError}
              </div>
            )}
            {!loading && (
              <>
                <section className="project-edit-modal-section" ref={basicSectionRef}>
                  <h3 className="project-edit-modal-section-title">기본 · 태그 {tags.length}</h3>
                <div className="project-edit-modal-basic-grid">
                  <div>
                    <label className="project-edit-modal-label">이름 *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const next = e.target.value;
                        setName(next);
                        onDraftChange?.({ name: next, description });
                      }}
                      placeholder="프로젝트 이름"
                      aria-label="프로젝트 이름"
                      className="project-edit-modal-input"
                    />
                  </div>
                  <div>
                    <label className="project-edit-modal-label">설명</label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        const next = e.target.value;
                        setDescription(next);
                        onDraftChange?.({ name, description: next });
                      }}
                      placeholder="프로젝트 설명"
                      rows={3}
                      className="project-edit-modal-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="project-edit-modal-label">지침 (프로젝트 내 모든 대화에 적용)</label>
                  <p className="project-edit-modal-hint">
                    컨텍스트를 설정하고 프로젝트 내에서 CORBU.AI가 응답하는 방식을 맞춤 설정하세요.
                  </p>
                  <p className="project-edit-modal-hint project-edit-modal-hint-mt">
                    예: &quot;스페인어로 대답해 줘. 최신 JavaScript 문서를 레퍼런스로 삼아 줘. 대답을 간결히 핵심만 담아서 해 줘.&quot;
                  </p>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="예: 전문적이되 친근한 톤으로, 2000자 이내로 답변해 주세요."
                    rows={4}
                    aria-label="프로젝트 지침"
                    className="project-edit-modal-input project-edit-modal-textarea"
                  />
                </div>
                {projectId && (
                  <div className="project-edit-modal-memory-section">
                    <label className="project-edit-modal-label">메모리</label>
                    <div className="project-edit-modal-memory-display">
                      {(() => {
                        try {
                          const stored = localStorage.getItem(`project-memory-type-${projectId}`);
                          const isExclusive = stored === 'project_exclusive';
                          return (
                            <>
                              <span className="project-edit-modal-memory-title">{isExclusive ? '프로젝트 전용' : '기본값'}</span>
                              <p className="project-edit-modal-memory-desc">
                                {isExclusive
                                  ? '프로젝트가 자체 메모리에만 액세스할 수 있습니다. 외부 대화에서는 프로젝트 메모리를 볼 수 없습니다.'
                                  : '프로젝트가 외부 대화에서 메모리에 액세스할 수 있으며 그 반대도 가능합니다.'}
                              </p>
                              <p className="project-edit-modal-hint project-edit-modal-memory-notice">
                                <Lightbulb size={14} aria-hidden />
                                이 설정은 이후에 변경할 수 없습니다.
                              </p>
                            </>
                          );
                        } catch {
                          return <span>기본값 — 프로젝트가 외부 대화와 메모리를 공유합니다.</span>;
                        }
                      })()}
                    </div>
                  </div>
                )}
                <div className="project-edit-modal-preset-box">
                  <label className="project-edit-modal-label">실사용 운영 템플릿</label>
                  <p className="project-edit-modal-hint">
                    선택 시 지침·규칙·태그를 자동으로 채웁니다.
                  </p>
                  <div className="project-edit-modal-preset-list" role="group" aria-label="프로젝트 운영 템플릿">
                    {PROJECT_OPERATION_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className="project-edit-modal-preset-btn"
                        onClick={() => applyOperationPreset(preset)}
                        aria-label={`${preset.label} 템플릿 적용`}
                      >
                        <span className="project-edit-modal-preset-title">{preset.label}</span>
                        <span className="project-edit-modal-preset-desc">{preset.description}</span>
                      </button>
                    ))}
                  </div>
                  <div className="project-edit-modal-summary" role="status" aria-live="polite">
                    <span>지침: {coerceTrimmedString(instructions, '') ? '적용됨' : '없음'}</span>
                    <span>가이드라인: {activeGuidelineCount}개</span>
                    <span>필수: {requiredGuidelineCount}개</span>
                    <span>권장: {recommendedGuidelineCount}개</span>
                    <span>파일: {files.length}개</span>
                    <span>웹소스: {webSources.length}개</span>
                    <span>학습소스: {notebookSourceCountHint ?? 0}개</span>
                    <span>태그: {tags.length}개</span>
                  </div>
                  <details className="project-edit-modal-advanced-block">
                    <summary className="project-edit-modal-advanced-summary">고급</summary>
                    <div className="project-edit-modal-policy-pack">
                      <button
                        type="button"
                        className="project-edit-modal-guideline-action-link"
                        onClick={copyGuidelinePolicyPack}
                        aria-label="현재 설정을 정책팩으로 복사"
                      >
                        정책팩 복사
                      </button>
                      <button
                        type="button"
                        className="project-edit-modal-guideline-action-link"
                        onClick={applyGuidelinePolicyPackFromClipboard}
                        aria-label="클립보드 정책팩 적용"
                      >
                        정책팩 붙여넣기 적용
                      </button>
                      {lastPolicyPackMeta && (
                        <span className="project-edit-modal-policy-pack-meta">최근 정책팩: {lastPolicyPackMeta}</span>
                      )}
                    </div>
                  </details>
                </div>
                <details className="project-edit-modal-advanced-block project-edit-modal-history-box">
                  <summary className="project-edit-modal-advanced-summary">버전 이력</summary>
                  <p className="project-edit-modal-hint">
                    저장된 버전을 불러와 빠르게 복원할 수 있습니다.
                  </p>
                  {instructionHistory.length === 0 ? (
                    <p className="project-edit-modal-history-empty">아직 저장된 히스토리가 없습니다.</p>
                  ) : (
                    <ul className="project-edit-modal-history-list">
                      {instructionHistory.map((entry) => (
                        <li key={entry.id} className="project-edit-modal-history-item">
                          <div className="project-edit-modal-history-meta">
                            <span>{new Date(entry.savedAt).toLocaleString('ko-KR')}</span>
                            <span>지침 {entry.instructions ? '있음' : '없음'}</span>
                            <span>가이드라인 {entry.guidelines.length}개</span>
                            <span>태그 {entry.tags.length}개</span>
                          </div>
                          <button
                            type="button"
                            className="project-edit-modal-history-restore"
                            onClick={() => restoreHistoryEntry(entry)}
                            aria-label="선택한 버전 불러오기"
                          >
                            불러오기
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
                <div>
                  <label className="project-edit-modal-label">태그</label>
                  <div className="project-edit-modal-tag-list">
                    {tags.map((t) => (
                      <span key={t} className="project-edit-modal-tag">
                        {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          aria-label={`태그 ${t} 제거`}
                          className="project-edit-modal-tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="project-edit-modal-tag-input-row">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="태그 입력 후 Enter"
                      className="project-edit-modal-input"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      aria-label="태그 추가"
                      className="bw-btn-secondary"
                    >
                      <Plus size={16} aria-hidden />
                    </button>
                  </div>
                </div>
                </section>
                <section className="project-edit-modal-section" ref={sourceSectionRef}>
                  <h3 className="project-edit-modal-section-title">규칙 · {activeGuidelineCount}</h3>
                <div ref={guidelineSectionRef}>
                  <label className="project-edit-modal-label">가이드라인 (노트북 LLM에 반영)</label>
                  <p className="project-edit-modal-hint">
                    답변에 반영할 규칙을 입력하세요.
                  </p>
                  <p className="project-edit-modal-hint">
                    각 규칙은 <strong>F(필수)</strong> 또는 <strong>R(권장)</strong>로 지정할 수 있습니다.
                  </p>
                  <div className="project-edit-modal-guideline-layout">
                  <div className="project-edit-modal-guideline-card">
                  <div className="project-edit-modal-guideline-health">
                    <div className="project-edit-modal-guideline-health-head">
                      <strong>가이드라인 품질 점검</strong>
                      <span
                        className={`project-edit-modal-guideline-health-score ${guidelineQuality.qualityStatus}`}
                        title="필수 규칙, 접두어 정합성, 중복/빈 항목 기준으로 산출"
                      >
                        {guidelineQuality.qualityScore}점
                      </span>
                    </div>
                    <div className="project-edit-modal-guideline-health-meta">
                      <span>필수 {guidelineQuality.required}개</span>
                      <span>권장 {guidelineQuality.recommended}개</span>
                      <span>미분류 {guidelineQuality.untyped}개</span>
                      <span>중복 {guidelineQuality.duplicates}개</span>
                      <span>빈 항목 {guidelineQuality.empty}개</span>
                    </div>
                    {guidelineQuality.recommendations.length > 0 && (
                      <ul className="project-edit-modal-guideline-health-list">
                        {guidelineQuality.recommendations.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                    <details className="project-edit-modal-advanced-block">
                      <summary className="project-edit-modal-advanced-summary">고급(복구/비교/추세)</summary>
                      <div className="project-edit-modal-guideline-health-actions">
                        <button
                          type="button"
                          onClick={applyGuidelineAutoRecovery}
                          className="project-edit-modal-guideline-recover-btn"
                          data-testid="guideline-auto-recovery"
                        >
                          자동 복구 적용
                        </button>
                        <button type="button" onClick={normalizeUntypedGuidelines} className="project-edit-modal-guideline-action-link">
                          접두어 정리
                        </button>
                        <button type="button" onClick={removeDuplicateGuidelines} className="project-edit-modal-guideline-action-link">
                          중복 제거
                        </button>
                        <button type="button" onClick={removeEmptyGuidelines} className="project-edit-modal-guideline-action-link">
                          빈 항목 정리
                        </button>
                      </div>
                      {lastAutoRecoverySummary && (
                        <div className="project-edit-modal-guideline-recovery-summary" role="status">
                          <p>{lastAutoRecoverySummary}</p>
                          {lastAutoRecoveryDiffSummary && (
                            <ul className="project-edit-modal-recovery-diff-list">
                              {lastAutoRecoveryDiffSummary.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          )}
                          {autoRecoveryHistory.length > 1 && (
                            <div className="project-edit-modal-recovery-history">
                              <span className="project-edit-modal-recovery-history-label">최근 복구 이력</span>
                              <div className="project-edit-modal-recovery-history-list">
                                {autoRecoveryHistory.slice(0, 4).map((entry) => (
                                  <div key={entry.id} className="project-edit-modal-recovery-history-item">
                                    <button
                                      type="button"
                                      className="project-edit-modal-guideline-action-link"
                                      onClick={() => applyAutoRecoveryHistoryEntry(entry.id)}
                                      title={`${new Date(entry.createdAt).toLocaleString('ko-KR')} · ${entry.afterScore}점 (${entry.delta >= 0 ? '+' : ''}${entry.delta})`}
                                    >
                                      {new Date(entry.createdAt).toLocaleDateString('ko-KR')} · {entry.afterScore}점
                                    </button>
                                    <label className="project-edit-modal-recovery-compare-select">
                                      <input
                                        type="checkbox"
                                        checked={selectedRecoveryCompareIds.includes(entry.id)}
                                        onChange={() => toggleRecoveryCompareSelection(entry.id)}
                                        data-testid={`recovery-compare-select-${entry.id}`}
                                      />
                                      비교
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <div className="project-edit-modal-recovery-compare-actions">
                                <button
                                  type="button"
                                  className="project-edit-modal-guideline-action-link"
                                  onClick={() => applyRecoveryComparePreset('latest-prev')}
                                  data-testid="recovery-compare-preset-latest-prev"
                                >
                                  프리셋: 최신 vs 직전
                                </button>
                                <button
                                  type="button"
                                  className="project-edit-modal-guideline-action-link"
                                  onClick={() => applyRecoveryComparePreset('latest-first')}
                                  data-testid="recovery-compare-preset-latest-first"
                                >
                                  프리셋: 최신 vs 최초
                                </button>
                                <button
                                  type="button"
                                  className="project-edit-modal-guideline-action-link"
                                  onClick={() => applyRecoveryComparePreset('latest-lowest')}
                                  data-testid="recovery-compare-preset-latest-lowest"
                                >
                                  프리셋: 최신 vs 품질최저점
                                </button>
                                <button
                                  type="button"
                                  className="project-edit-modal-guideline-action-link"
                                  onClick={generateRecoveryComparisonPrompt}
                                  data-testid="recovery-compare-generate"
                                >
                                  선택 2개 비교 리포트 생성
                                </button>
                                <button
                                  type="button"
                                  className="project-edit-modal-guideline-action-link"
                                  onClick={copyRecoveryComparisonPrompt}
                                  data-testid="recovery-compare-copy"
                                >
                                  비교 리포트 복사
                                </button>
                              </div>
                              {lastAutoRecoveryComparePrompt && (
                                <textarea
                                  className="project-edit-modal-guideline-recovery-prompt"
                                  value={lastAutoRecoveryComparePrompt}
                                  readOnly
                                  aria-label="자동 복구 비교 리포트 프롬프트"
                                  data-testid="guideline-auto-recovery-compare-prompt"
                                />
                              )}
                            </div>
                          )}
                          {lastAutoRecoveryPrompt && (
                            <>
                              <textarea
                                className="project-edit-modal-guideline-recovery-prompt"
                                value={lastAutoRecoveryPrompt}
                                readOnly
                                aria-label="자동 복구 리포트 프롬프트"
                                data-testid="guideline-auto-recovery-prompt"
                              />
                              <button
                                type="button"
                                className="project-edit-modal-guideline-action-link"
                                onClick={copyAutoRecoveryReportPrompt}
                                data-testid="guideline-auto-recovery-copy"
                              >
                                복구 리포트 복사
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      <div className="project-edit-modal-guideline-trend">
                        <span className={`project-edit-modal-guideline-trend-chip ${guidelineQualityTrend.direction}`}>
                          품질 추세: {guidelineQualityTrend.label}
                        </span>
                        {guidelineQualityHistory.length > 0 && (
                          <div className="project-edit-modal-guideline-trend-history">
                            {guidelineQualityHistory.slice(0, 6).map((entry) => (
                              <span
                                key={entry.id}
                                className={`project-edit-modal-guideline-trend-point ${entry.status}`}
                                title={`${new Date(entry.savedAt).toLocaleString('ko-KR')} · 점수 ${entry.score}`}
                              >
                                {entry.score}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                  </div>
                  <div className="project-edit-modal-guideline-card project-edit-modal-guideline-card--editor">
                    <div className="project-edit-modal-guideline-actions">
                      <button
                        type="button"
                        className="project-edit-modal-guideline-action-link"
                        onClick={expandAllGuidelines}
                        aria-label="가이드라인 전체 확장"
                      >
                        전체 확장
                      </button>
                      <button
                        type="button"
                        className="project-edit-modal-guideline-action-link"
                        onClick={collapseAllGuidelines}
                        aria-label="가이드라인 전체 축소"
                      >
                        전체 축소
                      </button>
                      <button
                        type="button"
                        className="project-edit-modal-guideline-action-link"
                        onClick={resetGuidelineExpandedPersistence}
                        aria-label="가이드라인 확장 상태 저장값 초기화"
                      >
                        확장 저장값 초기화
                      </button>
                      {showGuidelineSelection && (
                        <>
                      <button
                        type="button"
                        className="project-edit-modal-guideline-action-link"
                        onClick={selectAllGuidelineCandidates}
                        aria-label="가이드라인 전체 선택"
                        data-testid="guideline-select-all"
                      >
                        전체 선택
                      </button>
                      <button
                        type="button"
                        className="project-edit-modal-guideline-action-link"
                        onClick={clearGuidelineSelection}
                        aria-label="가이드라인 선택 해제"
                        data-testid="guideline-select-none"
                      >
                        선택 해제
                      </button>
                      <button
                        type="button"
                        className="project-edit-modal-guideline-action-link"
                        onClick={resetGuidelineSelectionPersistence}
                        aria-label="가이드라인 선택 저장값 초기화"
                        data-testid="guideline-selection-reset"
                      >
                        저장값 초기화
                      </button>
                      <button
                        type="button"
                        className="project-edit-modal-guideline-recommend-btn"
                        onClick={applyRequiredGuidelineRecommendations}
                        aria-label="필수 규칙 추천 적용"
                        data-testid="guideline-apply-required-recommendation"
                      >
                        필수 규칙 추천 적용
                      </button>
                        </>
                      )}
                    </div>
                  {guidelineValidationError && (
                    <p className="project-edit-modal-guideline-error" role="alert" data-testid="guideline-validation-error">
                      {guidelineValidationError}
                    </p>
                  )}
                  {guidelineSoftWarning && (
                    <p className="project-edit-modal-guideline-warning" role="status" data-testid="guideline-soft-warning">
                      {guidelineSoftWarning}
                    </p>
                  )}
                  {guidelines.map((g, i) => (
                    <div key={i} className="project-edit-modal-guideline-row">
                      {showGuidelineSelection && (
                        <label className="project-edit-modal-guideline-select">
                          <input
                            type="checkbox"
                            checked={selectedGuidelineIndexes.includes(i)}
                            onChange={() => toggleGuidelineSelection(i)}
                            aria-label={`가이드라인 ${i + 1} 필수 승격 선택`}
                            data-testid={`guideline-select-${i}`}
                            disabled={coerceTrimmedString(stripGuidelinePriorityPrefix(g), '').length === 0 || getGuidelinePriority(g) === '필수'}
                          />
                          <span className="project-edit-modal-guideline-select-text">선택</span>
                        </label>
                      )}
                      <div className="project-edit-modal-guideline-priority" role="group" aria-label={`가이드라인 ${i + 1} 우선순위`}>
                        <button
                          type="button"
                          onClick={() => handleGuidelinePriority(i, '필수')}
                          className={`project-edit-modal-guideline-priority-btn required ${getGuidelinePriority(g) === '필수' ? 'active' : ''}`}
                          aria-label={`가이드라인 ${i + 1} 필수 적용`}
                          title="필수"
                          data-testid={`guideline-priority-required-${i}`}
                          ref={i === 0 ? firstRequiredPriorityBtnRef : undefined}
                        >
                          F
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGuidelinePriority(i, '권장')}
                          className={`project-edit-modal-guideline-priority-btn recommended ${getGuidelinePriority(g) === '권장' ? 'active' : ''}`}
                          aria-label={`가이드라인 ${i + 1} 권장 적용`}
                          title="권장"
                          data-testid={`guideline-priority-recommended-${i}`}
                        >
                          R
                        </button>
                      </div>
                      {expandedGuidelineIndexes.includes(i) ? (
                        <textarea
                          value={g}
                          onChange={(e) => handleGuidelineChange(i, e.target.value)}
                          placeholder={`가이드라인 ${i + 1}`}
                          className="project-edit-modal-input"
                          data-testid={`guideline-input-${i}`}
                          rows={3}
                          title={g}
                        />
                      ) : (
                        <input
                          type="text"
                          value={g}
                          onChange={(e) => handleGuidelineChange(i, e.target.value)}
                            placeholder={`규칙 ${i + 1}`}
                          className="project-edit-modal-input"
                          data-testid={`guideline-input-${i}`}
                          title={g}
                        />
                      )}
                      <span className="project-edit-modal-guideline-row-actions">
                        <button
                          type="button"
                          onClick={() => toggleGuidelineExpanded(i)}
                          aria-label={`가이드라인 ${i + 1} ${expandedGuidelineIndexes.includes(i) ? '축소' : '확장'} 편집`}
                          className="project-edit-modal-guideline-icon-btn"
                          title={expandedGuidelineIndexes.includes(i) ? '축소 편집' : '확장 편집'}
                        >
                          {expandedGuidelineIndexes.includes(i) ? '▴' : '▾'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGuideline(i)}
                          aria-label={`가이드라인 ${i + 1} 제거`}
                          className="project-edit-modal-guideline-icon-btn project-edit-modal-guideline-remove"
                          title="가이드라인 제거"
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddGuideline}
                    aria-label="가이드라인 추가"
                    className="project-edit-modal-add-link"
                  >
                        <Plus size={14} aria-hidden /> 규칙 추가
                  </button>
                  </div>
                  </div>
                </div>
                </section>
                <section className="project-edit-modal-section">
                  <h3 className="project-edit-modal-section-title">소스 · {files.length + webSources.length}</h3>
                  <div className="project-edit-modal-source-grid">
                    <div className="project-edit-modal-source-card">
                      <label className="project-edit-modal-label">프로젝트 파일</label>
                      <p className="project-edit-modal-hint">
                        문서/이미지를 등록하면 답변 맥락에 반영됩니다.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.csv,.md,.png,.jpg,.jpeg,.gif,.webp,.js,.ts,.tsx,.json"
                        onChange={handleAddFile}
                        className="hidden"
                        aria-label="파일 선택"
                        data-testid="project-edit-file-input"
                      />
                      {files.length > 0 && (
                        <ul className="project-edit-modal-files-list">
                          {files.map((f) => (
                            <li key={f.id} className="project-edit-modal-file-item">
                              <span className="project-edit-modal-file-item-inner">
                                <Paperclip size={16} style={{ flexShrink: 0 }} aria-hidden />
                                <span className="project-edit-modal-file-item-name" title={f.name}>{f.name}</span>
                                <span className="project-edit-modal-file-item-meta">
                                  {formatFileSize(f.size)} · {f.type}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(f.id)}
                                aria-label={`${f.name} 제거`}
                              >
                                <Trash2 size={16} aria-hidden />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFiles}
                        aria-label={uploadingFiles ? '파일 업로드 중' : '파일 추가'}
                        data-testid={TEST_IDS.PROJECT_EDIT_FILE_ADD}
                        className="project-edit-modal-file-add"
                      >
                        <Plus size={16} aria-hidden /> {uploadingFiles ? '업로드 중...' : '파일 추가'}
                      </button>
                    </div>

                    <div className="project-edit-modal-source-card">
                      <label className="project-edit-modal-label">웹 문서/영상 학습 소스</label>
                      <p className="project-edit-modal-hint">
                        URL을 등록하면 답변 맥락에 반영됩니다.
                      </p>
                      <div className="project-edit-modal-web-source-inputs">
                        <select
                          value={newWebSourceType}
                          onChange={(e) => setNewWebSourceType((e.target.value as ProjectLearningSource['type']) || 'document')}
                          className="project-edit-modal-input"
                          aria-label="웹 소스 유형 선택"
                        >
                          <option value="document">문서</option>
                          <option value="video">영상</option>
                        </select>
                        <input
                          type="text"
                          value={newWebSourceUrl}
                          onChange={(e) => setNewWebSourceUrl(e.target.value)}
                          placeholder={`${DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL} 또는 youtube 링크`}
                          className="project-edit-modal-input"
                          aria-label="웹 소스 URL"
                        />
                        <input
                          type="text"
                          value={newWebSourceTitle}
                          onChange={(e) => setNewWebSourceTitle(e.target.value)}
                          placeholder="제목(선택)"
                          className="project-edit-modal-input"
                          aria-label="웹 소스 제목"
                        />
                        <button
                          type="button"
                          onClick={handleAddWebSource}
                          className="project-edit-modal-file-add"
                          aria-label="웹 소스 추가"
                          disabled={addingWebSource}
                        >
                          <Plus size={16} aria-hidden /> {addingWebSource ? '학습 반영 중...' : '웹 소스 추가'}
                        </button>
                      </div>
                      {webSources.length > 0 ? (
                        <ul className="project-edit-modal-web-source-list">
                          {webSources.map((source) => (
                            <li key={source.id} className="project-edit-modal-file-item">
                              <span className="project-edit-modal-web-source-main">
                                <Paperclip size={16} style={{ flexShrink: 0 }} aria-hidden />
                                <span className="project-edit-modal-web-source-text-wrap">
                                  <span className="project-edit-modal-web-source-title" title={source.url}>
                                    [{source.type === 'video' ? '영상' : '문서'}] {source.title || source.url}
                                  </span>
                                  <span className="project-edit-modal-web-source-meta">
                                    <span className={`project-edit-modal-web-source-badge ${source.syncStatus ?? 'pending'}`}>
                                      {source.syncStatus === 'success'
                                        ? '학습 성공'
                                        : source.syncStatus === 'failed'
                                          ? '학습 실패'
                                          : '동기화 대기'}
                                    </span>
                                    <span>최근 동기화: {formatSyncTime(source.lastSyncedAt)}</span>
                                  </span>
                                </span>
                              </span>
                              <span className="project-edit-modal-web-source-actions">
                                <button
                                  type="button"
                                  onClick={() => handleRetryWebSourceSync(source)}
                                  className="project-edit-modal-guideline-action-link"
                                  aria-label={`${source.title || source.url} 학습 재시도`}
                                  disabled={syncingWebSourceIds.includes(source.id)}
                                >
                                  {syncingWebSourceIds.includes(source.id) ? '재시도 중...' : '재시도'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWebSource(source.id)}
                                  aria-label={`${source.title || source.url} 제거`}
                                >
                                  <Trash2 size={16} aria-hidden />
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="project-edit-modal-hint">등록된 웹 학습 소스가 없습니다.</p>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>

          {!loading && showDeleteConfirm && projectId && onDelete && (
            <div className="project-edit-modal-footer project-edit-modal-footer-delete">
              <p className="project-edit-modal-hint project-edit-modal-footer-delete-hint">
                이 프로젝트를 삭제하시겠습니까? 관련 대화와 소스도 함께 삭제되며 되돌릴 수 없습니다.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="project-edit-modal-btn-secondary"
                aria-label="삭제 취소"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(projectId);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="project-edit-modal-btn-primary project-edit-modal-btn-delete-confirm"
                aria-label="프로젝트 삭제 확인"
              >
                삭제
              </button>
            </div>
          )}
          {!loading && !showDeleteConfirm && (
            <div className="project-edit-modal-footer">
              <div className="project-edit-modal-status-wrap" ref={statusPopoverWrapRef} onKeyDown={handleStatusWrapKeyDown}>
                <button
                  type="button"
                  className={`project-edit-modal-status-badge ${hasPendingChanges ? 'pending' : saveSuccess ? 'saved' : 'idle'} ${!hasPendingChanges ? 'inactive' : ''}`}
                  ref={statusBadgeButtonRef}
                  aria-live="polite"
                  aria-haspopup={hasPendingChanges ? 'dialog' : undefined}
                  aria-expanded={hasPendingChanges ? showChangeSummary : undefined}
                  aria-label="변경 상태 요약 보기"
                  onClick={handleStatusBadgeClick}
                >
                  {hasPendingChanges ? '변경됨' : saveSuccess ? '저장됨' : '동기화'}
                </button>
                {showChangeSummary && (
                  <div className="project-edit-modal-status-popover" role="dialog" aria-label="변경 요약">
                    <div className="project-edit-modal-status-popover-head">
                      <p className="project-edit-modal-status-popover-title">변경 요약</p>
                      <button
                        type="button"
                        ref={statusPopoverCloseButtonRef}
                        className="project-edit-modal-status-popover-close"
                        onClick={() => setShowChangeSummary(false)}
                        aria-label="변경 요약 닫기"
                      >
                        닫기
                      </button>
                    </div>
                    <ul className="project-edit-modal-status-popover-list">
                      {changeSummaryLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    {changeDetailBlocks.length > 0 && (
                      <div className="project-edit-modal-status-detail-list">
                        {changeDetailBlocks.map((block) => (
                          <div key={block.title} className="project-edit-modal-status-detail-item">
                            <button
                              type="button"
                              className="project-edit-modal-status-detail-title-btn"
                              ref={changeDetailBlocks[0]?.title === block.title ? firstStatusDetailButtonRef : undefined}
                              onClick={() => scrollToSection(block.section)}
                              aria-label={`${block.title} 섹션으로 이동`}
                            >
                              {block.title}
                            </button>
                            {block.added.length > 0 && (
                              <p className="project-edit-modal-status-detail-line">
                                + {block.added.slice(0, 2).join(', ')}
                                {block.added.length > 2 ? ` 외 ${block.added.length - 2}개` : ''}
                              </p>
                            )}
                            {block.removed.length > 0 && (
                              <p className="project-edit-modal-status-detail-line">
                                - {block.removed.slice(0, 2).join(', ')}
                                {block.removed.length > 2 ? ` 외 ${block.removed.length - 2}개` : ''}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {saveSuccess && (
                <span className="project-edit-modal-success">저장되었습니다.</span>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="저장 없이 닫기"
                className="project-edit-modal-btn-secondary"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!coerceTrimmedString(name, '') || saving}
                aria-label="설정 저장"
                data-testid="project-edit-save"
                className="project-edit-modal-btn-primary"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              {projectId && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="project-edit-modal-btn-secondary project-edit-modal-btn-delete"
                  aria-label="프로젝트 삭제"
                >
                  프로젝트 삭제
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectEditModal;
