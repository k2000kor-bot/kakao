import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    Calendar,
    Tag,
    FileText,
    MessageSquare,
    Settings,
    Save,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilter {
    id: string;
    type: 'text' | 'date' | 'select' | 'multi-select' | 'range';
    field: string;
    label: string;
    value: any;
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
        [key: string]: any;
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
    onLoadSearch?: (savedSearch: any) => void;
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
        { value: 'all', label: '전체', icon: <Search className="h-4 w-4" /> },
        { value: 'projects', label: '프로젝트', icon: <FileText className="h-4 w-4" /> },
        { value: 'messages', label: '메시지', icon: <MessageSquare className="h-4 w-4" /> },
        { value: 'files', label: '파일', icon: <FileText className="h-4 w-4" /> },
        { value: 'guidelines', label: '지침', icon: <Settings className="h-4 w-4" /> }
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
        if (query.trim() || filters.length > 0) {
            onSearch(query, filters);
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
        if (saveSearchName.trim() && onSaveSearch) {
            onSaveSearch(saveSearchName.trim(), filters);
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

    const getTypeOptions = () => [
        { value: 'text', label: '텍스트' },
        { value: 'date', label: '날짜' },
        { value: 'select', label: '선택' },
        { value: 'multi-select', label: '다중 선택' },
        { value: 'range', label: '범위' }
    ];

    return (
        <div className="w-full">
            {/* 검색 입력 */}
            <div className="relative">
                <div className="flex items-center space-x-2">
                    {/* 검색 타입 선택 */}
                    <div className="relative">
                        <select
                            value={selectedSearchType}
                            onChange={(e) => setSelectedSearchType(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-l-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {searchTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* 검색 입력창 */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                            Ctrl+K
                        </div>
                    </div>

                    {/* 검색 버튼 */}
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </button>

                    {/* 필터 토글 */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${filters.length > 0
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Filter className="h-4 w-4" />
                        {filters.length > 0 && (
                            <span className="ml-1 text-xs font-medium">{filters.length}</span>
                        )}
                    </button>

                    {/* 저장된 검색 */}
                    {savedSearches.length > 0 && (
                        <button
                            onClick={() => setShowSavedSearches(!showSavedSearches)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Save className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* 저장된 검색 드롭다운 */}
                <AnimatePresence>
                    {showSavedSearches && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                        >
                            <div className="p-2">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">저장된 검색</h4>
                                <div className="space-y-1">
                                    {savedSearches.map(savedSearch => (
                                        <button
                                            key={savedSearch.id}
                                            onClick={() => {
                                                setFilters(savedSearch.filters);
                                                onLoadSearch?.(savedSearch);
                                                setShowSavedSearches(false);
                                            }}
                                            className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                                        >
                                            <div className="font-medium text-gray-900">{savedSearch.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {savedSearch.filters.length}개 필터 • {savedSearch.createdAt.toLocaleDateString()}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 필터 패널 */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 bg-gray-50 rounded-lg p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900">필터</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={addFilter}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    + 필터 추가
                                </button>
                                {filters.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setFilters([]);
                                            onFilterChange([]);
                                        }}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        모두 지우기
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 필터 목록 */}
                        <div className="space-y-3">
                            {filters.map((filter) => (
                                <div key={filter.id} className="flex items-center space-x-3 p-3 bg-white rounded border">
                                    {/* 필드 선택 */}
                                    <select
                                        value={filter.field}
                                        onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {getFieldOptions().map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* 연산자 선택 */}
                                    <select
                                        value={filter.operator}
                                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any })}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        {getOperatorOptions(filter.type).map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* 값 입력 */}
                                    <input
                                        type={filter.type === 'date' ? 'date' : 'text'}
                                        value={filter.value}
                                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                                        placeholder="값 입력..."
                                        className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />

                                    {/* 필터 제거 */}
                                    <button
                                        onClick={() => removeFilter(filter.id)}
                                        className="p-1 text-red-500 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* 검색 저장 */}
                        {filters.length > 0 && onSaveSearch && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowSaveDialog(true)}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    이 검색 저장
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 검색 결과 */}
            {searchResults.length > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                            검색 결과 ({searchResults.length}개)
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {searchResults.map((result) => (
                            <div key={result.id} className="p-3 bg-white rounded border hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{result.title}</span>
                                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                {result.type}
                                            </span>
                                            {result.metadata.projectName && (
                                                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                                    {result.metadata.projectName}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{result.content}</p>
                                        {result.highlights.length > 0 && (
                                            <div className="text-xs text-gray-500">
                                                {result.highlights.map((highlight, index) => (
                                                    <span key={index} className="bg-yellow-200 px-1 rounded">
                                                        {highlight.snippet}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {result.score.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 검색 저장 다이얼로그 */}
            <AnimatePresence>
                {showSaveDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowSaveDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-96"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">검색 저장</h3>
                            <input
                                type="text"
                                value={saveSearchName}
                                onChange={(e) => setSaveSearchName(e.target.value)}
                                placeholder="검색 이름을 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                            />
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowSaveDialog(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSaveSearch}
                                    disabled={!saveSearchName.trim()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
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
