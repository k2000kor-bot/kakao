import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Filter,
    X,
    ChevronDown,
    FileText,
    MessageSquare,
    Settings,
    Save,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AdvancedSearch.css';
import { coerceTrimmedString } from '../../utils/chatInputUtils';

interface SearchFilter {
    id: string;
    type: 'text' | 'date' | 'select' | 'multi-select' | 'range';
    field: string;
    label: string;
    value: unknown;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
    options?: Array<{ value: string; label: string }>;
}

interface SearchResult {
    id: string;
    type: 'project' | 'message' | 'file' | 'guideline';
    title: string;
    content: string;
    metadata: {
        projectId?: string;
        projectName?: string;
        timestamp?: Date;
        tags?: string[];
        [key: string]: unknown;
    };
    score: number;
    highlights: Array<{
        field: string;
        snippet: string;
    }>;
}

interface AdvancedSearchProps {
    onSearch: (query: string, filters: SearchFilter[]) => void;
    onFilterChange: (filters: SearchFilter[]) => void;
    onSaveSearch?: (name: string, filters: SearchFilter[]) => void;
    onLoadSearch?: (savedSearch: unknown) => void;
    savedSearches?: Array<{
        id: string;
        name: string;
        filters: SearchFilter[];
        createdAt: Date;
    }>;
    searchResults?: SearchResult[];
    isLoading?: boolean;
    placeholder?: string;
    searchTypes?: Array<{
        value: string;
        label: string;
        icon: React.ReactNode;
    }>;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
    onSearch,
    onFilterChange,
    onSaveSearch,
    onLoadSearch,
    savedSearches = [],
    searchResults = [],
    isLoading = false,
    placeholder = "고급 검색...",
    searchTypes = [
        { value: 'all', label: '전체', icon: <Search size={16} aria-hidden /> },
        { value: 'projects', label: '프로젝트', icon: <FileText size={16} aria-hidden /> },
        { value: 'messages', label: '메시지', icon: <MessageSquare size={16} aria-hidden /> },
        { value: 'files', label: '파일', icon: <FileText size={16} aria-hidden /> },
        { value: 'guidelines', label: '지침', icon: <Settings size={16} aria-hidden /> }
    ]
}) => {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilter[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSearchType, setSelectedSearchType] = useState('all');
    const [showSavedSearches, setShowSavedSearches] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 검색 실행
    const handleSearch = () => {
        const q = coerceTrimmedString(query, '');
        if (q || filters.length > 0) {
            onSearch(q, filters);
        }
    };

    // 필터 추가
    const addFilter = () => {
        const newFilter: SearchFilter = {
            id: `filter_${Date.now()}`,
            type: 'text',
            field: 'title',
            label: '제목',
            value: '',
            operator: 'contains'
        };
        setFilters([...filters, newFilter]);
    };

    // 필터 제거
    const removeFilter = (filterId: string) => {
        const newFilters = filters.filter(f => f.id !== filterId);
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    // 필터 업데이트
    const updateFilter = (filterId: string, updates: Partial<SearchFilter>) => {
        const newFilters = filters.map(f =>
            f.id === filterId ? { ...f, ...updates } : f
        );
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    // 검색 저장
    const handleSaveSearch = () => {
        const name = coerceTrimmedString(saveSearchName, '');
        if (name && onSaveSearch) {
            onSaveSearch(name, filters);
            setSaveSearchName('');
            setShowSaveDialog(false);
        }
    };

    // 키보드 단축키
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
                handleSearch();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, filters]);

    const getOperatorOptions = (type: string) => {
        switch (type) {
            case 'text':
                return [
                    { value: 'contains', label: '포함' },
                    { value: 'equals', label: '일치' },
                    { value: 'starts_with', label: '시작' },
                    { value: 'ends_with', label: '끝남' }
                ];
            case 'date':
                return [
                    { value: 'equals', label: '일치' },
                    { value: 'greater_than', label: '이후' },
                    { value: 'less_than', label: '이전' },
                    { value: 'between', label: '범위' }
                ];
            case 'select':
            case 'multi-select':
                return [
                    { value: 'equals', label: '일치' },
                    { value: 'in', label: '포함' },
                    { value: 'not_in', label: '제외' }
                ];
            default:
                return [
                    { value: 'equals', label: '일치' },
                    { value: 'greater_than', label: '이상' },
                    { value: 'less_than', label: '이하' }
                ];
        }
    };

    const getFieldOptions = () => [
        { value: 'title', label: '제목' },
        { value: 'content', label: '내용' },
        { value: 'tags', label: '태그' },
        { value: 'created_at', label: '생성일' },
        { value: 'updated_at', label: '수정일' },
        { value: 'status', label: '상태' },
        { value: 'priority', label: '우선순위' }
    ];

    const _getTypeOptions = () => [
        { value: 'text', label: '텍스트' },
        { value: 'date', label: '날짜' },
        { value: 'select', label: '선택' },
        { value: 'multi-select', label: '다중 선택' },
        { value: 'range', label: '범위' }
    ];

    return (
        <div className="adv-search-root">
            <div style={{ position: 'relative' }}>
                <div className="adv-search-row">
                    <div style={{ position: 'relative' }}>
                        <select
                            value={selectedSearchType}
                            onChange={(e) => setSelectedSearchType(e.target.value)}
                            className="adv-search-select"
                            aria-label="검색 타입 선택"
                        >
                            {searchTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="adv-search-icon" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden />
                    </div>

                    <div className="adv-search-input-wrap">
                        <Search size={16} className="adv-search-icon" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} aria-hidden />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            className="adv-search-input bw-input"
                            aria-label="검색어 입력 (Ctrl+K 단축키)"
                        />
                        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Ctrl+K</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleSearch()}
                        disabled={isLoading || (!coerceTrimmedString(query, '') && filters.length === 0)}
                        className="adv-search-btn"
                        aria-label="검색 실행"
                    >
                        {isLoading ? <Loader2 size={16} className="adv-search-spin" aria-hidden /> : <Search size={16} aria-hidden />}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`adv-search-filter-btn ${filters.length > 0 ? 'active' : ''}`}
                        aria-label={showFilters ? '필터 숨기기' : '필터 표시'}
                        aria-expanded={showFilters}
                    >
                        <Filter size={16} aria-hidden />
                        {filters.length > 0 && <span style={{ marginLeft: 4, fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>{filters.length}</span>}
                    </button>

                    {savedSearches.length > 0 && (
                        <button type="button" onClick={() => setShowSavedSearches(!showSavedSearches)} className="adv-search-saved-btn" aria-label={showSavedSearches ? '저장된 검색 숨기기' : '저장된 검색 표시'}>
                            <Save size={16} aria-hidden />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {showSavedSearches && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="adv-search-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, zIndex: 'var(--z-dropdown)' }}>
                            <div style={{ padding: 'var(--spacing-sm)' }}>
                                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>저장된 검색</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {savedSearches.map(savedSearch => (
                                        <button key={savedSearch.id} type="button" onClick={() => { setFilters(savedSearch.filters); onLoadSearch?.(savedSearch); setShowSavedSearches(false); }} className="adv-search-result-card" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none' }}>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{savedSearch.name}</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{savedSearch.filters.length}개 필터 • {savedSearch.createdAt.toLocaleDateString()}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="adv-search-filter-panel" style={{ marginTop: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                            <h3 style={{ fontWeight: 500, color: 'var(--text-primary)' }}>필터</h3>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <button type="button" onClick={addFilter} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--accent-info)', background: 'none', border: 'none', cursor: 'pointer' }}>+ 필터 추가</button>
                                {filters.length > 0 && (
                                    <button type="button" onClick={() => { setFilters([]); onFilterChange([]); }} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--accent-error)', background: 'none', border: 'none', cursor: 'pointer' }}>모두 지우기</button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {filters.map((filter) => (
                                <div key={filter.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    <select value={filter.field} onChange={(e) => updateFilter(filter.id, { field: e.target.value })} className="adv-search-input bw-input" style={{ flex: '0 0 auto', minWidth: 100 }}>
                                        {getFieldOptions().map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <select value={filter.operator} onChange={(e) => updateFilter(filter.id, { operator: e.target.value as SearchFilter['operator'] })} className="adv-search-input bw-input" style={{ flex: '0 0 auto', minWidth: 90 }}>
                                        {getOperatorOptions(filter.type).map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <input type={filter.type === 'date' ? 'date' : 'text'} value={typeof filter.value === 'string' || typeof filter.value === 'number' ? filter.value : ''} onChange={(e) => updateFilter(filter.id, { value: e.target.value })} placeholder="값 입력..." className="adv-search-input bw-input" style={{ flex: 1 }} />
                                    <button type="button" onClick={() => removeFilter(filter.id)} style={{ padding: 'var(--spacing-xs)', color: 'var(--accent-error)', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="필터 제거"><X size={16} aria-hidden /></button>
                                </div>
                            ))}
                        </div>

                        {filters.length > 0 && onSaveSearch && (
                            <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
                                <button type="button" onClick={() => setShowSaveDialog(true)} style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--accent-info)', background: 'none', border: 'none', cursor: 'pointer' }}>이 검색 저장</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {searchResults.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <h3 style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>검색 결과 ({searchResults.length}개)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {searchResults.map((result) => (
                            <div key={result.id} className="adv-search-result-card">
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 4, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{result.title}</span>
                                            <span className="adv-search-tag">{result.type}</span>
                                            {result.metadata.projectName && (
                                                <span className="adv-search-tag" style={{ background: 'var(--accent-info-muted)', color: 'var(--accent-info)' }}>{result.metadata.projectName}</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>{result.content}</p>
                                        {result.highlights.length > 0 && (
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                                                {result.highlights.map((highlight, index) => (
                                                    <span key={index} className="adv-search-highlight">{highlight.snippet}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{result.score.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showSaveDialog && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bw-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowSaveDialog(false)} role="dialog" aria-modal aria-labelledby="save-search-title">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bw-modal-panel" style={{ width: 384, padding: 'var(--spacing-lg)' }} onClick={(e) => e.stopPropagation()}>
                            <h3 id="save-search-title" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-md)' }}>검색 저장</h3>
                            <input type="text" value={saveSearchName} onChange={(e) => setSaveSearchName(e.target.value)} placeholder="검색 이름을 입력하세요" className="bw-input" style={{ width: '100%', marginBottom: 'var(--spacing-md)' }} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                                <button type="button" onClick={() => setShowSaveDialog(false)} className="bw-btn-secondary">취소</button>
                                <button
                                    type="button"
                                    onClick={() => handleSaveSearch()}
                                    disabled={!coerceTrimmedString(saveSearchName, '')}
                                    className="bw-btn-primary"
                                >
                                    저장
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedSearch;
