/**
 * 워크스페이스 홈과 동일한 중앙 질의 카드(텍스트 영역 + 하단 툴바).
 * 다른 화면에서도 동일한 입력 UX를 쓰려면 이 컴포넌트를 import 하세요.
 */
import React, { useId, useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { Github } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { AGENTS_PATH, INTEGRATIONS_PATH, SETTINGS_PATH } from '../config/routes';
import { TEST_IDS } from '../constants/testIds';
import {
  WORKSPACE_COMPOSER_FORM_ARIA_LABEL,
  WORKSPACE_COMPOSER_PLACEHOLDER,
} from '../constants/workspaceHomeCopy';
import { IconBook, IconUpload } from './Icons/BrainwaveIcons';
import { isKeyboardEventImeComposing } from '../utils/chatInputUtils';
import './WorkspaceQueryComposer.css';

function wqAttachmentKindLabel(mime: string): string {
  if (mime.startsWith('image/')) return '이미지';
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('text')) return '텍스트';
  return '파일';
}

export const WORKSPACE_QUERY_COMPOSER_DEFAULT_PLACEHOLDER = WORKSPACE_COMPOSER_PLACEHOLDER;

const WQ_SNIPPETS_KEY = 'corbu.wq.snippets';
const MAX_SNIPPETS = 20;
const WQ_INPUT_HISTORY_KEY = 'corbu.wq.inputHistory';
const MAX_INPUT_HISTORY = 50;

function loadInputHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(WQ_INPUT_HISTORY_KEY) ?? '[]'); } catch { return []; }
}
function saveInputHistory(h: string[]) {
  try { localStorage.setItem(WQ_INPUT_HISTORY_KEY, JSON.stringify(h)); } catch { /* noop */ }
}

interface WqSnippet {
  id: string;
  title: string;
  text: string;
  createdAt: string;
}

function loadSnippets(): WqSnippet[] {
  try { return JSON.parse(localStorage.getItem(WQ_SNIPPETS_KEY) ?? '[]'); } catch { return []; }
}
function saveSnippets(list: WqSnippet[]) {
  try { localStorage.setItem(WQ_SNIPPETS_KEY, JSON.stringify(list)); } catch { /* noop */ }
}

const SLASH_COMMANDS = [
  { cmd: '/agent',    label: '에이전트 대화',  desc: 'AI 에이전트와 특화 대화 시작' },
  { cmd: '/summary',  label: '요약',           desc: '텍스트나 링크를 요약합니다' },
  { cmd: '/translate',label: '번역',           desc: '내용을 다른 언어로 번역합니다' },
  { cmd: '/code',     label: '코드 작성',      desc: '코드 생성 또는 디버깅 요청' },
  { cmd: '/image',    label: '이미지 설명',    desc: '이미지 분석·설명 요청' },
  { cmd: '/help',     label: '도움말',         desc: '사용 방법을 안내받습니다' },
];

export type ComposerResponseModeUi = 'auto' | 'concise' | 'detailed';

const COMPOSER_RESPONSE_MODE_LABEL: Record<ComposerResponseModeUi, string> = {
  auto: 'Auto',
  concise: '간결',
  detailed: '상세',
};

export type WorkspaceQueryComposerProps = {
  value: string;
  onChange: (value: string) => void;
  /** 폼 제출·Enter(Shift 없음) 시 */
  onCommit: () => void;
  /** 우측 주요 액션(대화 NavLink, 전송 버튼 등) */
  primaryAction: React.ReactNode;
  placeholder?: string;
  formAriaLabel?: string;
  textareaId?: string;
  dataTestId?: string;
  className?: string;
  /** 외부에서 textarea ref 를 주입할 수 있게 허용 (포커스 관리 등) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textareaRef?: React.RefObject<any>;
  /** textarea 에 직접 붙이는 data-testid (E2E·단위 테스트용) */
  textareaTestId?: string;
  onVoiceClick?: () => void;
  /** true 면 마운트 직후 textarea에 포커스 */
  autoFocus?: boolean;
  /**
   * `minimal`(기본): 첨부·CTA 중심 — 스니펫·연동 단축·음성 입력 숨김
   * `full`: 스니펫·연동·음성 등 전체 툴바
   */
  toolbarVariant?: 'full' | 'minimal';
  /** .txt/.csv 첨부 시 대화 관계도 handoff용 (ChatGPTInterface) */
  onConversationTextFileAttach?: (file: File) => void;
  /** 채팅: Auto / 간결 / 상세 (API quality 연동) */
  responseMode?: ComposerResponseModeUi;
  onResponseModeChange?: (mode: ComposerResponseModeUi) => void;
  /** textarea와 하단 툴바 사이 — 생성 중 힌트 등 */
  statusFooter?: React.ReactNode;
  /** 질문·요구·요청 빠른 삽입 칩 (채팅 입력) */
  showStructureChips?: boolean;
  /** 첨부 개수 변경(전송 가능 여부 등) */
  onPendingAttachmentsChange?: (count: number) => void;
};

export type WorkspaceQueryComposerHandle = {
  getAttachedFiles: () => File[];
  clearAttachedFiles: () => void;
};

type AttachedEntry = { file: File; name: string; size: number; type: string };

const STRUCTURE_CHIP_INSERTIONS: { label: string; block: string }[] = [
  { label: '질문', block: '질문:\n- ' },
  { label: '요구', block: '요구사항:\n- ' },
  { label: '요청', block: '요청:\n- ' },
];

// Web Speech API 타입 선언 (브라우저 전역에 없을 경우 대비)
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export const WorkspaceQueryComposer = forwardRef<WorkspaceQueryComposerHandle, WorkspaceQueryComposerProps>(
function WorkspaceQueryComposer(
  {
  value,
  onChange,
  onCommit,
  primaryAction,
  placeholder = WORKSPACE_QUERY_COMPOSER_DEFAULT_PLACEHOLDER,
  formAriaLabel = WORKSPACE_COMPOSER_FORM_ARIA_LABEL,
  textareaId: textareaIdProp,
  dataTestId = TEST_IDS.GENSPARK_MARKETING_COMPOSER,
  className,
  textareaRef: textareaRefProp,
  textareaTestId,
  onVoiceClick,
  autoFocus = false,
  toolbarVariant = 'minimal',
  onConversationTextFileAttach,
  responseMode,
  onResponseModeChange,
  statusFooter,
  showStructureChips = false,
  onPendingAttachmentsChange,
  },
  ref,
) {
  const uid = useId().replace(/:/g, '');
  const textareaId = textareaIdProp ?? `wq-composer-prompt-${uid}`;

  // 외부 ref 가 없으면 내부 ref 를 사용
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef = textareaRefProp ?? internalRef;

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashIdx, setSlashIdx] = useState(0);

  // ── 입력 히스토리 (↑↓ 탐색) ──
  const [_inputHistory] = useState<string[]>(loadInputHistory);
  const historyIdxRef = useRef<number>(-1);
  const historyDraftRef = useRef<string>('');
  const imeComposingRef = useRef(false);

  const syncTextareaValueToState = useCallback(
    (el: HTMLTextAreaElement) => {
      const next = el.value;
      if (next !== value) {
        onChange(next);
      }
    },
    [onChange, value],
  );

  // ── 스니펫 저장 & 빠른 삽입 ──
  const [snippets, setSnippets] = useState<WqSnippet[]>(loadSnippets);
  const [snippetPanelOpen, setSnippetPanelOpen] = useState(false);
  const [snippetSearch, setSnippetSearch] = useState('');
  const snippetPanelRef = useRef<HTMLDivElement>(null);

  const saveCurrentAsSnippet = useCallback(() => {
    const text = value.trim();
    if (!text) return;
    const title = text.slice(0, 30) + (text.length > 30 ? '…' : '');
    const newSnippet: WqSnippet = { id: `snip_${Date.now()}`, title, text, createdAt: new Date().toISOString() };
    const updated = [newSnippet, ...snippets].slice(0, MAX_SNIPPETS);
    setSnippets(updated);
    saveSnippets(updated);
  }, [value, snippets]);

  const insertSnippet = useCallback((text: string) => {
    onChange(value ? `${value}\n${text}` : text);
    setSnippetPanelOpen(false);
    textareaRef.current?.focus();
  }, [value, onChange, textareaRef]);

  const deleteSnippet = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = snippets.filter(s => s.id !== id);
    setSnippets(updated);
    saveSnippets(updated);
  }, [snippets]);

  const filteredSnippets = snippetSearch.trim()
    ? snippets.filter(s => s.title.toLowerCase().includes(snippetSearch.toLowerCase()) || s.text.toLowerCase().includes(snippetSearch.toLowerCase()))
    : snippets;

  // 패널 외부 클릭 닫기
  useEffect(() => {
    if (!snippetPanelOpen) return;
    const handler = (e: MouseEvent) => {
      if (snippetPanelRef.current && !snippetPanelRef.current.contains(e.target as Node)) {
        setSnippetPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [snippetPanelOpen]);

  // ── 음성 입력 (Web Speech API) ──
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasSpeechAPI = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const startListening = useCallback(() => {
    if (!hasSpeechAPI) return;
    if (onVoiceClick) { onVoiceClick(); return; }
    const SpeechRecognitionImpl = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) return;

    const rec = new SpeechRecognitionImpl();
    rec.lang = 'ko-KR';
    rec.continuous = false;
    rec.interimResults = true;

    const originalValue = value;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => { setIsListening(false); recognitionRef.current = null; };
    rec.onerror = () => { setIsListening(false); recognitionRef.current = null; };
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      onChange(originalValue ? `${originalValue} ${transcript}` : transcript);
    };

    recognitionRef.current = rec;
    rec.start();
  }, [hasSpeechAPI, onVoiceClick, value, onChange]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ── 파일 첨부 드래그&드롭 ──
  const [attachedFiles, setAttachedFiles] = useState<AttachedEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      getAttachedFiles: () => attachedFiles.map((e) => e.file),
      clearAttachedFiles: () => setAttachedFiles([]),
    }),
    [attachedFiles],
  );

  useEffect(() => {
    onPendingAttachmentsChange?.(attachedFiles.length);
  }, [attachedFiles.length, onPendingAttachmentsChange]);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const raw = Array.from(fileList);
      const generalAttach: File[] = [];
      for (const f of raw) {
        const name = (f.name || '').toLowerCase();
        if ((name.endsWith('.txt') || name.endsWith('.csv')) && onConversationTextFileAttach) {
          onConversationTextFileAttach(f);
          continue;
        }
        generalAttach.push(f);
      }
      const newFiles: AttachedEntry[] = generalAttach.map((f) => ({
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
      }));
      setAttachedFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        return [...prev, ...newFiles.filter((f) => !existingNames.has(f.name))].slice(0, 5);
      });
    },
    [onConversationTextFileAttach],
  );

  const removeFile = useCallback((name: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const insertStructureBlock = useCallback(
    (block: string) => {
      const base = value.trimEnd();
      onChange(base ? `${base}\n\n${block}` : block);
      window.setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [value, onChange, textareaRef],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const slashQuery = value.startsWith('/') && !value.includes(' ') ? value.toLowerCase() : '';
  const slashFiltered = slashQuery
    ? SLASH_COMMANDS.filter((c) => c.cmd.startsWith(slashQuery))
    : [];

  useEffect(() => {
    setSlashOpen(slashFiltered.length > 0);
    setSlashIdx(0);
  }, [slashFiltered.length]);

  /** 텍스트 내용에 따라 textarea 높이 자동 조절 (상한은 CSS max-height) */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [textareaRef]);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  useEffect(() => {
    if (autoFocus) {
      window.setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [autoFocus, textareaRef]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imeComposingRef.current) return;
    if (textareaRef.current) {
      syncTextareaValueToState(textareaRef.current);
    }
    const trimmed = (textareaRef.current?.value ?? value).trim();
    if (trimmed) {
      const prev = loadInputHistory();
      const dedup = [trimmed, ...prev.filter((h) => h !== trimmed)].slice(0, MAX_INPUT_HISTORY);
      saveInputHistory(dedup);
      historyIdxRef.current = -1;
    }
    onCommit();
  };

  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const lineCount = value ? value.split('\n').length : 0;

  return (
    <form
      className={[
        'wq-composer',
        toolbarVariant === 'minimal' ? 'wq-composer--minimal-toolbar' : '',
        className,
        dragOver ? 'wq-composer--drag' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onSubmit={onFormSubmit}
      aria-label={formAriaLabel}
      data-testid={dataTestId}
      style={{ position: 'relative' }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* 슬래시 명령어 드롭다운 */}
      {slashOpen && (
        <ul className="wq-slash-list" role="listbox" aria-label="슬래시 명령어 제안">
          {slashFiltered.map((c, i) => (
            <li
              key={c.cmd}
              role="option"
              aria-selected={i === slashIdx}
              className={`wq-slash-item${i === slashIdx ? ' wq-slash-item--active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); onChange(c.cmd + ' '); setSlashOpen(false); }}
            >
              <span className="wq-slash-cmd">{c.cmd}</span>
              <span className="wq-slash-label">{c.label}</span>
              <span className="wq-slash-desc">{c.desc}</span>
            </li>
          ))}
        </ul>
      )}
      <label htmlFor={textareaId} className="sr-only">
        질문 또는 만들기 요청
      </label>
      <textarea
        ref={textareaRef}
        id={textareaId}
        className="wq-composer__input"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          autoResize();
        }}
        onCompositionStart={() => {
          imeComposingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          imeComposingRef.current = false;
          syncTextareaValueToState(e.currentTarget);
        }}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (slashOpen) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIdx((i) => (i + 1) % slashFiltered.length); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIdx((i) => (i - 1 + slashFiltered.length) % slashFiltered.length); return; }
            if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
              e.preventDefault();
              onChange(slashFiltered[slashIdx].cmd + ' ');
              setSlashOpen(false);
              return;
            }
            if (e.key === 'Escape') { setSlashOpen(false); return; }
          }
          /* ↑↓ 입력 히스토리 탐색 (값이 비어 있거나 커서가 첫 줄일 때) */
          const el = e.currentTarget as HTMLTextAreaElement;
          const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
          const hist = loadInputHistory();
          if (e.key === 'ArrowUp' && (value === '' || atStart) && hist.length > 0) {
            e.preventDefault();
            if (historyIdxRef.current === -1) historyDraftRef.current = value;
            const nextIdx = Math.min(historyIdxRef.current + 1, hist.length - 1);
            historyIdxRef.current = nextIdx;
            onChange(hist[nextIdx]);
            return;
          }
          if (e.key === 'ArrowDown' && historyIdxRef.current >= 0) {
            e.preventDefault();
            const nextIdx = historyIdxRef.current - 1;
            historyIdxRef.current = nextIdx;
            onChange(nextIdx < 0 ? historyDraftRef.current : hist[nextIdx]);
            return;
          }
          if (e.key === 'Escape' && historyIdxRef.current >= 0) {
            historyIdxRef.current = -1;
            onChange(historyDraftRef.current);
            return;
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            if (isKeyboardEventImeComposing(e, imeComposingRef.current)) {
              return;
            }
            e.preventDefault();
            syncTextareaValueToState(el);
            onCommit();
          }
        }}
        {...(textareaTestId ? { 'data-testid': textareaTestId } : {})}
      />
      {showStructureChips ? (
        <div
          className="wq-composer__structure-chips brainwave-quick-suggestions"
          role="group"
          aria-label="질문·요구·요청 삽입"
          data-testid={TEST_IDS.CHAT_COMPOSER_STRUCTURE_CHIPS}
        >
          <span className="brainwave-quick-suggestions-label">입력 형식:</span>
          {STRUCTURE_CHIP_INSERTIONS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="brainwave-quick-suggestion-btn"
              onClick={() => insertStructureBlock(chip.block)}
              aria-label={`${chip.label} 블록 삽입`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}
      {statusFooter ? <div className="wq-composer__status-footer">{statusFooter}</div> : null}
      {/* ── 드래그 오버레이 ── */}
      {dragOver && (
        <div className="wq-drop-overlay" aria-hidden>
          파일을 놓으면 첨부됩니다
        </div>
      )}

      {/* ── 첨부 파일 목록 ── */}
      {attachedFiles.length > 0 && (
        <ul className="wq-attachment-list" aria-label="첨부된 파일 목록">
          {attachedFiles.map((f) => (
            <li key={f.name} className="wq-attachment-item">
              <span className="wq-attachment-icon" aria-hidden>
                {wqAttachmentKindLabel(f.type)}
              </span>
              <span className="wq-attachment-name" title={f.name}>{f.name}</span>
              <span className="wq-attachment-size">{(f.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                className="wq-attachment-remove"
                aria-label={`${f.name} 첨부 삭제`}
                onClick={() => removeFile(f.name)}
              >✕</button>
            </li>
          ))}
        </ul>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        aria-hidden
        style={{ display: 'none' }}
        onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
      />

      <div className="wq-composer__bar">
        {toolbarVariant === 'minimal' && (
          <div className="wq-composer__left wq-composer__left--minimal-attach" role="group" aria-label="첨부·응답 모드">
            <button
              type="button"
              className="wq-composer__icon-btn"
              title="파일 첨부 (또는 끌어다 놓기)"
              aria-label="파일 첨부"
              onClick={() => fileInputRef.current?.click()}
            >
              📎
            </button>
            {responseMode != null && onResponseModeChange ? (
              <select
                className="wq-composer__response-mode"
                value={responseMode}
                onChange={(e) => onResponseModeChange(e.target.value as ComposerResponseModeUi)}
                aria-label="응답 길이 모드"
                title="응답 길이: Auto·간결·상세"
              >
                {(Object.keys(COMPOSER_RESPONSE_MODE_LABEL) as ComposerResponseModeUi[]).map((mode) => (
                  <option key={mode} value={mode}>
                    {COMPOSER_RESPONSE_MODE_LABEL[mode]}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        )}
        {toolbarVariant !== 'minimal' && (
        <div className="wq-composer__left" role="group" aria-label="연동·도구">
          {/* 스니펫 패널 트리거 */}
          <div ref={snippetPanelRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={`wq-composer__icon-btn${snippetPanelOpen ? ' wq-composer__icon-btn--active' : ''}`}
              title="스니펫 저장/삽입"
              aria-label="스니펫"
              aria-expanded={snippetPanelOpen}
              onClick={() => setSnippetPanelOpen(v => !v)}
            >
              <IconBook size={18} aria-hidden />
            </button>
            {snippetPanelOpen && (
              <div className="wq-snippet-panel" role="dialog" aria-label="스니펫 패널">
                <div className="wq-snippet-panel-header">
                  <span className="wq-snippet-panel-title">스니펫 ({snippets.length}/{MAX_SNIPPETS})</span>
                  <button
                    type="button"
                    className="wq-snippet-save-btn"
                    onClick={saveCurrentAsSnippet}
                    disabled={!value.trim() || snippets.length >= MAX_SNIPPETS}
                    title="현재 입력을 스니펫으로 저장"
                    aria-label="현재 입력 저장"
                  >
                    + 저장
                  </button>
                </div>
                {snippets.length > 3 && (
                  <input
                    type="search"
                    className="wq-snippet-search"
                    placeholder="스니펫 검색…"
                    value={snippetSearch}
                    onChange={e => setSnippetSearch(e.target.value)}
                    aria-label="스니펫 검색"
                  />
                )}
                <div className="wq-snippet-list">
                  {filteredSnippets.length === 0 ? (
                    <p className="wq-snippet-empty">
                      {snippets.length === 0 ? '저장된 스니펫이 없습니다.\n텍스트 입력 후 "+ 저장"을 누르세요.' : '검색 결과 없음'}
                    </p>
                  ) : (
                    filteredSnippets.map(s => (
                      <div
                        key={s.id}
                        className="wq-snippet-item"
                        onClick={() => insertSnippet(s.text)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter') insertSnippet(s.text); }}
                        aria-label={`${s.title} 삽입`}
                      >
                        <div className="wq-snippet-item-title">{s.title}</div>
                        <div className="wq-snippet-item-preview">{s.text.slice(0, 60)}{s.text.length > 60 ? '…' : ''}</div>
                        <button
                          type="button"
                          className="wq-snippet-item-del"
                          onClick={e => deleteSnippet(s.id, e)}
                          aria-label="스니펫 삭제"
                          title="삭제"
                        >✕</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <NavLink
            to={INTEGRATIONS_PATH}
            className="wq-composer__icon-btn"
            title="파일·연동 추가"
            aria-label="파일·연동 추가"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </NavLink>
          <button
            type="button"
            className="wq-composer__icon-btn"
            title="파일 첨부 (또는 끌어다 놓기)"
            aria-label="파일 첨부"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconUpload size={18} aria-hidden />
          </button>
          <NavLink
            to={AGENTS_PATH}
            className="wq-composer__icon-btn wq-composer__icon-btn--agents"
            title="에이전트 목록"
            aria-label="에이전트 목록"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
            </svg>
          </NavLink>
          <NavLink
            to={INTEGRATIONS_PATH}
            className="wq-composer__icon-btn wq-composer__icon-btn--github"
            title="GitHub 연동"
            aria-label="GitHub 연동"
          >
            <Github size={18} strokeWidth={1.75} aria-hidden />
          </NavLink>
          <NavLink to={SETTINGS_PATH} className="wq-composer__icon-btn" title="설정·도구" aria-label="설정·도구">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </NavLink>
        </div>
        )}
        {/* 문자 / 단어 / 줄 카운터 */}
        {charCount > 0 && (
          <span
            className="wq-char-counter"
            aria-live="polite"
            aria-label={`${charCount}자, ${wordCount}단어 입력됨`}
            title={`글자: ${charCount.toLocaleString()} / 단어: ${wordCount.toLocaleString()} / 줄: ${lineCount}`}
          >
            {charCount.toLocaleString()}자
            {wordCount > 0 && <span className="wq-word-count"> · {wordCount}단어</span>}
            {lineCount > 1 && <span className="wq-line-count"> · {lineCount}줄</span>}
          </span>
        )}
        <div className="wq-composer__right">
          {toolbarVariant !== 'minimal' && (
            <>
              <button
                type="button"
                className={`wq-composer__icon-btn wq-composer__icon-btn--voice${isListening ? ' wq-voice--active' : ''}`}
                aria-label={isListening ? '음성 입력 중지' : '음성 입력 시작'}
                title={isListening ? '녹음 중 — 클릭하면 중지' : hasSpeechAPI ? '음성으로 입력' : '이 브라우저는 음성 입력을 지원하지 않습니다'}
                onClick={isListening ? stopListening : startListening}
                disabled={!hasSpeechAPI && !onVoiceClick}
              >
                {isListening ? (
                  <span className="wq-voice-pulse" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="3" width="6" height="11" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0" />
                      <path d="M12 18v3" />
                    </svg>
                  </span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="9" y="3" width="6" height="11" rx="3"/>
                    <path d="M5 11a7 7 0 0 0 14 0"/>
                    <path d="M12 18v3"/>
                  </svg>
                )}
              </button>
              {isListening && (
                <span className="wq-listening-hint" role="status" aria-live="polite">
                  <span className="wq-listening-hint__dot" aria-hidden />
                  듣는 중…
                </span>
              )}
            </>
          )}
          {primaryAction}
        </div>
      </div>
    </form>
  );
});

WorkspaceQueryComposer.displayName = 'WorkspaceQueryComposer';
