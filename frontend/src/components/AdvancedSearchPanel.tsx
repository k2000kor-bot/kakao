/**
 * 고급 검색 패널 컴포넌트
 * 고급 필터, 정렬 옵션, 검색 결과 하이라이팅 제공
 * 
 * Task-D1: 검색/네비게이션 심화
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import messageHistoryService from '../services/messageHistoryService';
import searchHistoryService from '../services/searchHistoryService';
import searchAnalyticsService, { SearchStatistics } from '../services/searchAnalyticsService';
import advancedSearchParser from '../utils/advancedSearchParser';
import { useDebounce } from '../hooks/useDebounce';
import { errorLogger } from '../utils/errorLogger';
import { showToast } from '../utils/toast';
import './AdvancedSearchPanel.css';
import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface AdvancedSearchResult {
  id: string;
  type: 'message' | 'writing' | 'file' | 'template';
  title: string;
  content: string;
  timestamp: string;
  relevance?: number;
  highlights?: Array<{ start: number; end: number }>;
  metadata?: Record<string, unknown>;
}

export interface AdvancedSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (result: AdvancedSearchResult) => void;
  onSearchTermChange?: (term: string) => void;
}

type SortOption = 'relevance' | 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
type FilterOption = 'all' | 'bookmarked' | 'liked' | 'recent' | 'old';

const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  isOpen,
  onClose,
  onSelect,
  onSearchTermChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<AdvancedSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<Array<{ query: string; count: number }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');
  const [savedSearches, setSavedSearches] = useState<Array<{ id: string; name: string; query: string; useCount: number }>>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchStats, setSearchStats] = useState<SearchStatistics | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchTermTrimmed = useMemo(() => coerceTrimmedString(searchTerm, ''), [searchTerm]);
  const debouncedSearchTermTrimmed = useMemo(
    () => coerceTrimmedString(debouncedSearchTerm, ''),
    [debouncedSearchTerm]
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchTerm('');
      setResults([]);
      setSelectedIndex(0);
      setShowAutocomplete(false);
      // 최근 검색어 및 인기 검색어 로드
      const recent = searchHistoryService.getRecentSearches(5).map(item => item.query);
      const popular = searchHistoryService.getPopularSearches(5).map(item => ({ query: item.query, count: item.count }));
      setRecentSearches(recent);
      setPopularSearches(popular);
      setShowHistory(true);

      // 저장된 검색 로드
      const saved = searchHistoryService.getSavedSearches().map(s => ({
        id: s.id,
        name: s.name,
        query: s.query,
        useCount: s.useCount || 0,
      }));
      setSavedSearches(saved);
    } else {
      // 패널이 닫힐 때 검색어 초기화
      onSearchTermChange?.('');
      setShowAutocomplete(false);
      setShowHistory(false);
    }
  }, [isOpen, onSearchTermChange]);

  // 자동완성 제안 업데이트
  useEffect(() => {
    if (searchTermTrimmed.length >= 2) {
      const suggestions = searchHistoryService.getAutocompleteSuggestions(searchTerm, 5);
      setAutocompleteSuggestions(suggestions);
      setShowAutocomplete(suggestions.length > 0);
      setShowHistory(false);
    } else {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      if (searchTermTrimmed.length === 0) {
        setShowHistory(true);
      }
    }
  }, [searchTerm, searchTermTrimmed]);

  const highlightText = useCallback((text: string, query: string): Array<{ start: number; end: number }> => {
    const q = coerceTrimmedString(query, '');
    if (!q) return [];
    const highlights: Array<{ start: number; end: number }> = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = q.toLowerCase();
    let index = 0;

    while ((index = lowerText.indexOf(lowerQuery, index)) !== -1) {
      highlights.push({
        start: index,
        end: index + q.length,
      });
      index += q.length;
    }

    return highlights;
  }, []);

  const calculateRelevance = useCallback((
    text: string,
    query: string,
    isBookmarked?: boolean,
    isLiked?: boolean
  ) => {
    let score = 0;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // 정확한 일치
    if (lowerText === lowerQuery) {
      score += 100;
    }
    // 시작 부분 일치
    else if (lowerText.startsWith(lowerQuery)) {
      score += 50;
    }
    // 포함
    else if (lowerText.includes(lowerQuery)) {
      score += 25;
    }

    // 북마크/좋아요 보너스
    if (isBookmarked) score += 10;
    if (isLiked) score += 5;

    return score;
  }, []);

  const sortResults = useCallback((results: AdvancedSearchResult[], option: SortOption): AdvancedSearchResult[] => {
    const sorted = [...results];
    switch (option) {
      case 'relevance':
        sorted.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
        break;
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return sorted;
  }, []);

  const performSearch = useCallback(async (term: string) => {
    setIsSearching(true);
    const searchResults: AdvancedSearchResult[] = [];

    try {
      // 검색 옵션 구성 (messageHistoryService.searchMessages는 sender?: 'user' | 'ai' 만 허용)
      const searchOptions: { sender?: 'user' | 'ai'; isBookmarked?: boolean; isLiked?: boolean; dateFrom?: Date; dateTo?: Date } = {
        isBookmarked: undefined,
        isLiked: undefined,
      };

      if (filterOption === 'bookmarked') {
        searchOptions.isBookmarked = true;
      } else if (filterOption === 'liked') {
        searchOptions.isLiked = true;
      }

      if (dateRange.from) {
        searchOptions.dateFrom = new Date(dateRange.from);
      }
      if (dateRange.to) {
        searchOptions.dateTo = new Date(dateRange.to);
      }

      // 고급 검색 옵션 추가
      const advancedSearchOptions = {
        ...searchOptions,
        useRegex: useRegex || searchMode === 'advanced',
        caseSensitive,
      };

      // 메시지 검색
      const messages = messageHistoryService.searchMessages(term, advancedSearchOptions);

      // 검색 쿼리 파싱
      const searchQuery = advancedSearchParser.parseQuery(term, {
        useRegex: useRegex || searchMode === 'advanced',
        caseSensitive,
      });

      messages.forEach((msg) => {
        const highlights = searchQuery.type === 'simple'
          ? highlightText(msg.text, term)
          : advancedSearchParser.findMatches(msg.text, searchQuery);
        const relevance = calculateRelevance(msg.text, term, msg.isBookmarked, msg.isLiked);

        searchResults.push({
          id: `msg-${msg.id}`,
          type: 'message',
          title: msg.sender === 'user' ? '사용자 메시지' : 'AI 응답',
          content: msg.text || '',
          timestamp: msg.timestamp || new Date().toISOString(),
          relevance,
          highlights,
          metadata: {
            sessionId: msg.sessionId,
            sender: msg.sender,
            isBookmarked: msg.isBookmarked,
            isLiked: msg.isLiked,
          },
        });
      });

      // 정렬
      const sortedResults = sortResults(searchResults, sortOption);
      setResults(sortedResults);
    } catch (error) {
      errorLogger.error('검색 오류', error instanceof Error ? error : new Error(String(error)), {
        component: 'AdvancedSearchPanel',
        action: 'performSearch',
      });
    } finally {
      setIsSearching(false);
    }
  }, [filterOption, dateRange, useRegex, searchMode, caseSensitive, sortOption, highlightText, calculateRelevance, sortResults]);

  const handleSelectResult = useCallback((result: AdvancedSearchResult) => {
    onSelect?.(result);
    onClose();
  }, [onSelect, onClose]);

  useEffect(() => {
    if (debouncedSearchTermTrimmed.length > 0) {
      performSearch(debouncedSearchTermTrimmed);
      onSearchTermChange?.(debouncedSearchTermTrimmed);
      // 검색 히스토리에 저장
      searchHistoryService.saveSearch(debouncedSearchTermTrimmed, results.length);
    } else {
      setResults([]);
      onSearchTermChange?.('');
    }
  }, [debouncedSearchTerm, debouncedSearchTermTrimmed, performSearch, onSearchTermChange, results.length]);

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
      } else if (e.key === 'Enter') {
        if (showAutocomplete && autocompleteSuggestions.length > 0 && selectedIndex < autocompleteSuggestions.length) {
          e.preventDefault();
          const selectedSuggestion = autocompleteSuggestions[selectedIndex];
          setSearchTerm(selectedSuggestion);
          setShowAutocomplete(false);
        } else if (results[selectedIndex]) {
          e.preventDefault();
          handleSelectResult(results[selectedIndex]);
        }
      } else if (e.key === '/' && e.ctrlKey) {
        e.preventDefault();
        setShowFilters(!showFilters);
      } else if (e.key === 'ArrowDown' && showAutocomplete && autocompleteSuggestions.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, autocompleteSuggestions.length - 1));
      } else if (e.key === 'ArrowUp' && showAutocomplete && autocompleteSuggestions.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    globalThis.window?.addEventListener('keydown', handleKeyDown);
    return () => globalThis.window?.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, showFilters, showAutocomplete, autocompleteSuggestions, handleSelectResult, onClose]);

  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setSearchTerm(suggestion);
    setShowAutocomplete(false);
    inputRef.current?.focus();
  }, []);

  const handleSelectRecentSearch = useCallback((query: string) => {
    setSearchTerm(query);
    setShowHistory(false);
    inputRef.current?.focus();
  }, []);

  const handleClearHistory = useCallback(() => {
    searchHistoryService.clearHistory();
    setRecentSearches([]);
    setPopularSearches([]);
  }, []);

  const handleSaveSearch = useCallback(() => {
    const st = coerceTrimmedString(searchTerm, '');
    const name = coerceTrimmedString(saveSearchName, '');
    if (!st || !name) return;

    const savedSearch = searchHistoryService.saveSearchQuery(
      name,
      st,
      {
        sortOption,
        filterOption,
        dateRange,
        useRegex,
        caseSensitive,
      }
    );

    setSavedSearches([...savedSearches, {
      id: savedSearch.id,
      name: savedSearch.name,
      query: savedSearch.query,
      useCount: savedSearch.useCount,
    }]);
    setShowSaveDialog(false);
    setSaveSearchName('');
  }, [searchTerm, saveSearchName, sortOption, filterOption, dateRange, useRegex, caseSensitive, savedSearches]);

  const handleLoadSavedSearch = useCallback((savedSearch: { id: string; query: string }) => {
    const loaded = searchHistoryService.useSavedSearch(savedSearch.id);
    if (loaded) {
      setSearchTerm(loaded.query);
      if (loaded.filters) {
        if (loaded.filters.sortOption) setSortOption(loaded.filters.sortOption as SortOption);
        if (loaded.filters.filterOption) setFilterOption(loaded.filters.filterOption as FilterOption);
        if (loaded.filters.dateRange) setDateRange(loaded.filters.dateRange);
        if (loaded.filters.useRegex !== undefined) setUseRegex(loaded.filters.useRegex);
        if (loaded.filters.caseSensitive !== undefined) setCaseSensitive(loaded.filters.caseSensitive);
      }
      setShowSavedSearches(false);
      setShowHistory(false);
    }
  }, []);

  const handleShareSearch = useCallback((id: string) => {
    const shareId = searchHistoryService.shareSearch(id);
    if (shareId) {
      const shareUrl = `${globalThis.window?.location.origin}${globalThis.window?.location.pathname}?search=${shareId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('검색 링크가 클립보드에 복사되었습니다!', 'success');
      });
    }
  }, []);

  const renderHighlightedText = useCallback((text: string, highlights: Array<{ start: number; end: number }> = []) => {
    if (highlights.length === 0) {
      return <span>{text}</span>;
    }

    const parts: Array<{ text: string; highlight: boolean }> = [];
    let lastIndex = 0;

    highlights.forEach(({ start, end }) => {
      if (start > lastIndex) {
        parts.push({ text: text.substring(lastIndex, start), highlight: false });
      }
      parts.push({ text: text.substring(start, end), highlight: true });
      lastIndex = end;
    });

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), highlight: false });
    }

    return (
      <span>
        {parts.map((part, idx) =>
          part.highlight ? (
            <mark key={idx} className="search-highlight">
              {part.text}
            </mark>
          ) : (
            <span key={idx}>{part.text}</span>
          )
        )}
      </span>
    );
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
    <div
      className="advanced-search-panel-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="고급 검색 패널"
    >
      <div className="advanced-search-panel" onClick={(e) => e.stopPropagation()} role="document">
        <div className="search-header">
          <div className="search-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="고급 검색... (Ctrl+/ 필터)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTermTrimmed.length === 0) {
                  setShowHistory(true);
                }
              }}
              aria-label="검색어 입력"
              aria-describedby="search-hints"
            />
            {isSearching && <div className="search-spinner">⏳</div>}
            <button
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              title="필터 토글 (Ctrl+/)"
              aria-label="필터 토글"
              aria-expanded={showFilters}
              aria-controls="search-filters-panel"
              type="button"
            >
              <span aria-hidden="true">🔍</span>
            </button>
            {results.length > 0 && (
              <button
                className="save-search-btn"
                onClick={() => setShowSaveDialog(true)}
                title="검색 저장"
                aria-label="검색 저장"
                type="button"
              >
                <span aria-hidden="true">💾</span>
              </button>
            )}
            <button
              className="saved-searches-btn"
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              title="저장된 검색"
              aria-label="저장된 검색"
              aria-expanded={showSavedSearches}
              type="button"
            >
              <span aria-hidden="true">⭐</span>
            </button>
            <button
              className="analytics-btn"
              onClick={() => {
                setShowAnalytics(!showAnalytics);
                if (!showAnalytics) {
                  setSearchStats(searchAnalyticsService.getStatistics());
                }
              }}
              title="검색 통계"
              aria-label="검색 통계"
              aria-expanded={showAnalytics}
              type="button"
            >
              <span aria-hidden="true">📊</span>
            </button>
          </div>
          <button
            className="search-close-btn"
            onClick={onClose}
            aria-label="검색 패널 닫기"
            type="button"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* 저장된 검색 목록 */}
        {showSavedSearches && savedSearches.length > 0 && (
          <div className="saved-searches-panel">
            <div className="saved-searches-header">
              <span className="saved-searches-title">저장된 검색</span>
              <button
                className="close-saved-btn"
                onClick={() => setShowSavedSearches(false)}
              >
                ✕
              </button>
            </div>
            <div className="saved-searches-list">
              {savedSearches.map((saved) => (
                <div key={saved.id} className="saved-search-item">
                  <div
                    className="saved-search-content"
                    onClick={() => handleLoadSavedSearch(saved)}
                  >
                    <span className="saved-search-name">{saved.name}</span>
                    <span className="saved-search-query">{saved.query}</span>
                    <span className="saved-search-count">{saved.useCount}회 사용</span>
                  </div>
                  <div className="saved-search-actions">
                    <button
                      className="share-btn"
                      onClick={() => handleShareSearch(saved.id)}
                      title="공유"
                    >
                      🔗
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => {
                        searchHistoryService.deleteSavedSearch(saved.id);
                        setSavedSearches(savedSearches.filter(s => s.id !== saved.id));
                      }}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 검색 저장 다이얼로그 */}
        {showSaveDialog && (
          <div className="save-search-dialog-overlay" onClick={() => setShowSaveDialog(false)}>
            <div className="save-search-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>검색 저장</h3>
              <input
                type="text"
                className="save-search-input"
                placeholder="검색 이름을 입력하세요"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveSearch();
                  }
                }}
                autoFocus
              />
              <div className="save-search-preview">
                <strong>검색어:</strong> {searchTerm}
              </div>
              <div className="save-search-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveSearchName('');
                  }}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={() => handleSaveSearch()}
                  disabled={!coerceTrimmedString(saveSearchName, '')}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 자동완성 제안 */}
        {showAutocomplete && autocompleteSuggestions.length > 0 && (
          <div className="autocomplete-suggestions">
            {autocompleteSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="autocomplete-icon">🔍</span>
                <span className="autocomplete-text">{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        {/* 검색 히스토리 (검색어가 없을 때) */}
        {showHistory && searchTermTrimmed.length === 0 && (
          <div className="search-history-panel">
            {recentSearches.length > 0 && (
              <div className="history-section">
                <div className="history-header">
                  <span className="history-title">최근 검색어</span>
                  <button type="button" className="history-clear-btn" onClick={handleClearHistory} title="전체 삭제" aria-label="검색 기록 전체 삭제">
                    전체 삭제
                  </button>
                </div>
                <div className="history-items">
                  {recentSearches.map((query, index) => (
                    <div
                      key={`recent-${index}`}
                      className="history-item"
                      onClick={() => handleSelectRecentSearch(query)}
                    >
                      <span className="history-icon">🕐</span>
                      <span className="history-query">{query}</span>
                      <button
                        className="history-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          searchHistoryService.removeSearch(query);
                          setRecentSearches(recentSearches.filter(q => q !== query));
                        }}
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {popularSearches.length > 0 && (
              <div className="history-section">
                <div className="history-header">
                  <span className="history-title">인기 검색어</span>
                </div>
                <div className="history-items">
                  {popularSearches.map((item, index) => (
                    <div
                      key={`popular-${index}`}
                      className="history-item popular"
                      onClick={() => handleSelectRecentSearch(item.query)}
                    >
                      <span className="history-icon">🔥</span>
                      <span className="history-query">{item.query}</span>
                      <span className="history-count">{item.count}회</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {recentSearches.length === 0 && popularSearches.length === 0 && (
              <div className="history-empty">
                <p>검색 히스토리가 없습니다.</p>
                <p className="history-hint">검색어를 입력하면 히스토리에 저장됩니다.</p>
              </div>
            )}
          </div>
        )}

        {showFilters && (
          <div className="search-filters-panel">
            <div className="filter-group">
              <label>정렬:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                aria-label="검색 결과 정렬"
              >
                <option value="relevance">관련도순</option>
                <option value="date-desc">최신순</option>
                <option value="date-asc">오래된순</option>
                <option value="title-asc">제목 오름차순</option>
                <option value="title-desc">제목 내림차순</option>
              </select>
            </div>

            <div className="filter-group">
              <label>필터:</label>
              <select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                aria-label="검색 결과 필터"
              >
                <option value="all">전체</option>
                <option value="bookmarked">즐겨찾기만</option>
                <option value="liked">좋아요만</option>
                <option value="recent">최근 7일</option>
                <option value="old">7일 이상</option>
              </select>
            </div>

            <div className="filter-group">
              <label>날짜 범위:</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                placeholder="시작일"
              />
              <span>~</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                placeholder="종료일"
              />
            </div>
          </div>
        )}

        {/* 고급 검색 옵션 */}
        <div className="advanced-search-options">
          <div className="search-mode-toggle">
            <button
              className={`mode-btn ${searchMode === 'simple' ? 'active' : ''}`}
              onClick={() => setSearchMode('simple')}
            >
              일반 검색
            </button>
            <button
              className={`mode-btn ${searchMode === 'advanced' ? 'active' : ''}`}
              onClick={() => setSearchMode('advanced')}
            >
              고급 검색
            </button>
          </div>

          {searchMode === 'advanced' && (
            <div className="advanced-options-panel">
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={useRegex}
                    onChange={(e) => setUseRegex(e.target.checked)}
                  />
                  정규식 검색
                </label>
                <span className="option-hint">예: /패턴/</span>
              </div>
              <div className="option-group">
                <label>
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                  />
                  대소문자 구분
                </label>
              </div>
              <div className="boolean-help">
                <strong>부울 연산자:</strong>
                <ul>
                  <li><code>AND</code>: 두 단어 모두 포함 (예: "프로젝트 AND 완료")</li>
                  <li><code>OR</code>: 둘 중 하나 포함 (예: "프로젝트 OR 작업")</li>
                  <li><code>NOT</code>: 제외 (예: "프로젝트 NOT 완료")</li>
                </ul>
                <strong>정규식:</strong> 슬래시로 감싸기 (예: <code>/^프로젝트/</code>)
              </div>
            </div>
          )}
        </div>

        <div className="search-results" ref={resultsRef}>
          {results.length === 0 && searchTermTrimmed.length > 0 && !isSearching && (
            <div className="search-empty">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
          {results.length === 0 && searchTermTrimmed.length === 0 && (
            <div className="search-empty">
              <p>검색어를 입력하세요.</p>
              <p className="search-hint">
                💡 팁: Ctrl+K로 빠르게 검색, Ctrl+/로 필터 토글
              </p>
            </div>
          )}
          {results.map((result, index) => (
            <div
              key={result.id}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="result-header">
                <span className="result-title">{result.title}</span>
                <div className="result-meta">
                  {result.relevance && (
                    <span className="relevance-score">
                      관련도: {Math.round(result.relevance)}%
                    </span>
                  )}
                  <span className="result-time">{formatTime(result.timestamp)}</span>
                </div>
              </div>
              <div className="result-preview">
                {renderHighlightedText(
                  result.content.substring(0, 150),
                  result.highlights?.filter(
                    (h) => h.start < 150 && h.end < 150
                  )
                )}
                {result.content.length > 150 && '...'}
              </div>
              {result.metadata && (
                <div className="result-metadata">
                  <>
                    {result.metadata.isBookmarked && (
                      <span className="result-tag bookmark-tag">⭐ 즐겨찾기</span>
                    )}
                    {result.metadata.isLiked && (
                      <span className="result-tag like-tag">👍 좋아요</span>
                    )}
                    {result.metadata.sessionId != null && (
                      <span className="result-tag">세션: {String(result.metadata.sessionId).substring(0, 8)}</span>
                    )}
                  </>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 검색 통계 패널 */}
        {showAnalytics && searchStats && (
          <div className="search-analytics-panel">
            <div className="analytics-header">
              <span className="analytics-title">검색 통계</span>
              <button
                className="close-analytics-btn"
                onClick={() => setShowAnalytics(false)}
              >
                ✕
              </button>
            </div>
            <div className="analytics-content">
              <div className="stat-card">
                <div className="stat-label">총 검색 수</div>
                <div className="stat-value">{searchStats.totalSearches}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">고유 검색어</div>
                <div className="stat-value">{searchStats.uniqueQueries}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">평균 결과 수</div>
                <div className="stat-value">{searchStats.averageResultsPerSearch}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">검색 성공률</div>
                <div className="stat-value">{searchAnalyticsService.getSuccessRate()}%</div>
              </div>

              {searchStats.mostSearchedTerms.length > 0 && (
                <div className="analytics-section">
                  <h4>인기 검색어</h4>
                  <div className="popular-terms-list">
                    {searchStats.mostSearchedTerms.slice(0, 5).map((term, index) => (
                      <div key={term.query} className="popular-term-item">
                        <span className="term-rank">{index + 1}</span>
                        <span className="term-query">{term.query}</span>
                        <span className="term-count">{term.count}회</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(searchStats.timeDistribution).length > 0 && (
                <div className="analytics-section">
                  <h4>시간대별 검색</h4>
                  <div className="time-distribution">
                    {Object.entries(searchStats.timeDistribution).map(([timeSlot, count]) => (
                      <div key={timeSlot} className="time-slot-item">
                        <span className="time-slot-label">{timeSlot}</span>
                        <div className="time-slot-bar">
                          <div
                            className="time-slot-fill"
                            style={{
                              width: `${(count / searchStats.totalSearches) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="time-slot-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="analytics-insights">
                <h4>인사이트</h4>
                {searchAnalyticsService.getInsights().map((insight, index) => (
                  <div key={index} className={`insight-item ${insight.priority}`}>
                    <span className="insight-icon">
                      {insight.type === 'trend' ? '📈' : insight.type === 'pattern' ? '🔍' : '💡'}
                    </span>
                    <div className="insight-content">
                      <div className="insight-title">{insight.title}</div>
                      <div className="insight-description">{insight.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="search-footer">
          <div className="search-shortcuts">
            <span>↑↓</span> 이동
            <span>Enter</span> 선택
            <span>Ctrl+/</span> 필터
            <span>Esc</span> 닫기
          </div>
          <div className="search-count">
            {results.length}개 결과
            {sortOption !== 'relevance' && ` (${sortOption})`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPanel;

