/**
 * 통합 검색 패널 컴포넌트
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import messageHistoryService from '../services/messageHistoryService';
import { errorLogger } from '../utils/errorLogger';
import './SearchPanel.css';

interface SearchResult {
  id: string;
  type: 'message' | 'writing' | 'file' | 'template';
  title: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (result: SearchResult) => void;
  onSearchTermChange?: (term: string) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose, onSelect, onSearchTermChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filters, setFilters] = useState({
    messages: true,
    writings: true,
    files: true,
    templates: true,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchTerm('');
      setResults([]);
      setSelectedIndex(0);
    } else {
      // 패널이 닫힐 때 검색어 초기화
      onSearchTermChange?.('');
    }
  }, [isOpen, onSearchTermChange]);

  const performSearch = useCallback(async (term: string) => {
    setIsSearching(true);
    const searchResults: SearchResult[] = [];

    try {
      // 메시지 검색 (messageHistoryService 사용)
      if (filters.messages) {
        const messages = messageHistoryService.searchMessages(term);
        messages.forEach((msg) => {
          searchResults.push({
            id: `msg-${msg.id}`,
            type: 'message',
            title: msg.sender === 'user' ? '사용자 메시지' : 'AI 응답',
            content: msg.text || '',
            timestamp: msg.timestamp || new Date().toISOString(),
            metadata: {
              sessionId: msg.sessionId,
              sender: msg.sender,
              isBookmarked: msg.isBookmarked,
              isLiked: msg.isLiked,
            },
          });
        });
      }

      // 글쓰기 히스토리 검색
      if (filters.writings) {
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
          const writings = JSON.parse(globalThis.localStorage.getItem('writingHistory') || '[]');
        writings.forEach((writing: any) => {
          if (
            writing.template?.toLowerCase().includes(term.toLowerCase()) ||
            writing.content?.toLowerCase().includes(term.toLowerCase())
          ) {
            searchResults.push({
              id: writing.id || `writing-${Date.now()}`,
              type: 'writing',
              title: writing.template || '글쓰기',
              content: writing.content || '',
              timestamp: writing.createdAt || new Date().toISOString(),
              metadata: { template: writing.template, category: writing.category },
            });
          }
        });
        }
      }

      // 템플릿 검색
      if (filters.templates) {
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
          const templates = JSON.parse(globalThis.localStorage.getItem('writingTemplates') || '[]');
        templates.forEach((template: any) => {
          if (
            template.title?.toLowerCase().includes(term.toLowerCase()) ||
            template.description?.toLowerCase().includes(term.toLowerCase())
          ) {
            searchResults.push({
              id: template.id || `template-${Date.now()}`,
              type: 'template',
              title: template.title || '템플릿',
              content: template.description || '',
              timestamp: new Date().toISOString(),
              metadata: { category: template.category },
            });
          }
        });
        }
      }

      // 파일 검색 (로컬 스토리지에 저장된 파일 메타데이터)
      if (filters.files) {
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
          const files = JSON.parse(globalThis.localStorage.getItem('uploadedFiles') || '[]');
        files.forEach((file: any) => {
          if (file.name?.toLowerCase().includes(term.toLowerCase())) {
            searchResults.push({
              id: file.id || `file-${Date.now()}`,
              type: 'file',
              title: file.name || '파일',
              content: file.description || '',
              timestamp: file.uploadedAt || new Date().toISOString(),
              metadata: { fileName: file.name, fileType: file.type },
            });
          }
        });
        }
      }

      // 결과 정렬 (최신순)
      searchResults.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setResults(searchResults);
    } catch (error) {
      errorLogger.error('검색 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'SearchPanel',
        action: 'performSearch',
      });
    } finally {
      setIsSearching(false);
    }
  }, [filters]);

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      performSearch(searchTerm);
      onSearchTermChange?.(searchTerm);
    } else {
      setResults([]);
      onSearchTermChange?.('');
    }
  }, [searchTerm, filters, onSearchTermChange, performSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  useEffect(() => {
    // 선택된 결과로 스크롤
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelectResult = useCallback((result: SearchResult) => {
    onSelect?.(result);
    onClose();
  }, [onSelect, onClose]);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'writing':
        return '✍️';
      case 'file':
        return '📄';
      case 'template':
        return '📝';
      default:
        return '🔍';
    }
  }, []);

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <div className="search-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="검색어를 입력하세요... (Ctrl+K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && <div className="search-spinner">⏳</div>}
          </div>
          <button className="search-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="search-filters">
          <label>
            <input
              type="checkbox"
              checked={filters.messages}
              onChange={(e) => setFilters({ ...filters, messages: e.target.checked })}
            />
            메시지
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.writings}
              onChange={(e) => setFilters({ ...filters, writings: e.target.checked })}
            />
            글쓰기
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.templates}
              onChange={(e) => setFilters({ ...filters, templates: e.target.checked })}
            />
            템플릿
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.files}
              onChange={(e) => setFilters({ ...filters, files: e.target.checked })}
            />
            파일
          </label>
        </div>

        <div className="search-results" ref={resultsRef}>
          {results.length === 0 && searchTerm.trim().length > 0 && !isSearching && (
            <div className="search-empty">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
          {results.length === 0 && searchTerm.trim().length === 0 && (
            <div className="search-empty">
              <p>검색어를 입력하세요.</p>
              <p className="search-hint">💡 팁: Ctrl+K로 빠르게 검색할 수 있습니다.</p>
            </div>
          )}
          {results.map((result, index) => (
            <div
              key={result.id}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="result-icon">{getTypeIcon(result.type)}</div>
              <div className="result-content">
                <div className="result-header">
                  <span className="result-title">{result.title}</span>
                  <span className="result-time">{formatTime(result.timestamp)}</span>
                </div>
                <div className="result-preview">
                  {result.content.substring(0, 100)}
                  {result.content.length > 100 && '...'}
                </div>
                {result.metadata && (
                  <div className="result-metadata">
                    {result.metadata.category && (
                      <span className="result-tag">{result.metadata.category}</span>
                    )}
                    {result.metadata.fileType && (
                      <span className="result-tag">{result.metadata.fileType}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="search-footer">
          <div className="search-shortcuts">
            <span>↑↓</span> 이동
            <span>Enter</span> 선택
            <span>Esc</span> 닫기
          </div>
          <div className="search-count">
            {results.length}개 결과
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;

