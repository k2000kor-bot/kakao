/**
 * 글쓰기 히스토리 컴포넌트
 */

import React, { useState, useEffect, useMemo } from 'react';
import { WRITING_HISTORY_STORAGE_KEY } from '../services/writingUiStorageKeys';
import writingExporter from '../utils/writingExport';
import './WritingHistory.css';

interface WritingHistoryItem {
  id: string;
  template: string;
  category: string;
  content: string;
  formValues: Record<string, string>;
  createdAt: string;
}

interface WritingHistoryProps {
  onSelect?: (item: WritingHistoryItem) => void;
  onDelete?: (id: string) => void;
}

const WritingHistory: React.FC<WritingHistoryProps> = ({ onSelect, onDelete }) => {
  const [history, setHistory] = useState<WritingHistoryItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'template' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem(WRITING_HISTORY_STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  };

  const handleDelete = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem(WRITING_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    onDelete?.(id);
  };

  const handleSelect = (item: WritingHistoryItem) => {
    onSelect?.(item);
  };

  const filteredAndSortedHistory = useMemo(() => {
    let result = history.filter((item) => {
      const matchesFilter = filter === 'all' || item.category === filter;
      const matchesSearch =
        searchTerm === '' ||
        item.template.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // 정렬
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'template':
          comparison = a.template.localeCompare(b.template);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [history, filter, searchTerm, sortBy, sortOrder]);

  const handleExport = (item: WritingHistoryItem) => {
    writingExporter.export(item.content, {
      format: 'txt',
      includeMetadata: true,
    }, {
      title: item.template,
      date: new Date(item.createdAt).toLocaleDateString('ko-KR'),
      template: item.template,
    });
  };

  const handleBulkExport = () => {
    if (selectedItems.size === 0) return;
    const itemsToExport = history.filter((item) => selectedItems.has(item.id));
    const combinedContent = itemsToExport
      .map((item) => `=== ${item.template} ===\n${item.content}\n\n`)
      .join('\n');
    writingExporter.export(combinedContent, {
      format: 'txt',
      includeMetadata: true,
    }, {
      title: `글쓰기 모음 (${itemsToExport.length}개)`,
      date: new Date().toLocaleDateString('ko-KR'),
    });
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    const updated = history.filter((item) => !selectedItems.has(item.id));
    setHistory(updated);
    localStorage.setItem(WRITING_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    setSelectedItems(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedHistory.map((item) => item.id)));
    }
  };

  const categories = Array.from(new Set(history.map((item) => item.category)));

  return (
    <div className="writing-history">
      <div className="history-header">
        <h3>글쓰기 히스토리 ({filteredAndSortedHistory.length})</h3>
        <div className="history-controls">
          <input
            type="text"
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="history-search"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="history-filter"
          >
            <option value="all">전체</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'template' | 'category')}
            className="history-sort"
          >
            <option value="date">날짜</option>
            <option value="template">템플릿</option>
            <option value="category">카테고리</option>
          </select>
          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        {selectedItems.size > 0 && (
          <div className="bulk-actions">
            <span>{selectedItems.size}개 선택됨</span>
            <button type="button" className="bulk-btn" onClick={handleBulkExport} aria-label="선택한 항목 일괄 내보내기">
              일괄 내보내기
            </button>
            <button type="button" className="bulk-btn delete" onClick={handleBulkDelete} aria-label="선택한 항목 일괄 삭제">
              일괄 삭제
            </button>
            <button type="button" className="bulk-btn" onClick={() => setSelectedItems(new Set())} aria-label="선택 해제">
              선택 해제
            </button>
          </div>
        )}
      </div>

      <div className="history-list">
        {filteredAndSortedHistory.length === 0 ? (
          <div className="history-empty">
            <p>저장된 글쓰기 히스토리가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="history-select-all">
              <label>
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredAndSortedHistory.length && filteredAndSortedHistory.length > 0}
                  onChange={toggleSelectAll}
                />
                전체 선택
              </label>
            </div>
            {filteredAndSortedHistory.map((item) => (
              <div
                key={item.id}
                className={`history-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
              >
                <div className="history-item-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="history-item-content" onClick={() => handleSelect(item)}>
                  <div className="history-item-header">
                    <div>
                      <h4>{item.template}</h4>
                      <span className="history-category">{item.category}</span>
                    </div>
                    <div className="history-item-actions">
                      <button
                        className="history-btn history-btn-export"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(item);
                        }}
                        title="내보내기"
                      >
                        📥
                      </button>
                      <button
                        className="history-btn history-btn-select"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(item);
                        }}
                        title="선택"
                      >
                        📄
                      </button>
                      <button
                        className="history-btn history-btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="history-item-preview">
                    {item.content.substring(0, 100)}
                    {item.content.length > 100 && '...'}
                  </div>
                  <div className="history-item-footer">
                    <span className="history-date">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <span className="history-stats">
                      {item.content.split(/\s+/).filter(Boolean).length}단어
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default WritingHistory;

