import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon as FilterIcon
} from '@heroicons/react/24/outline';

interface SearchFilter {
    id: string;
    name: string;
    type: 'text' | 'select' | 'date' | 'range';
    value: string | string[] | Date | null;
    options?: string[];
    placeholder?: string;
}

interface AdvancedSearchSystemProps {
    onSearch: (query: string, filters: SearchFilter[]) => void;
    onClear: () => void;
}

const AdvancedSearchSystem: React.FC<AdvancedSearchSystemProps> = ({
    onSearch,
    onClear
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState<SearchFilter[]>([
        {
            id: 'category',
            name: '카테고리',
            type: 'select',
            value: '',
            options: ['전체', '메인', '분석', '생성', '대응', '대시보드', '알림', '작업공간']
        },
        {
            id: 'status',
            name: '상태',
            type: 'select',
            value: '',
            options: ['전체', '활성', '비활성']
        },
        {
            id: 'dateRange',
            name: '날짜 범위',
            type: 'date',
            value: null
        },
        {
            id: 'priority',
            name: '우선순위',
            type: 'select',
            value: '',
            options: ['전체', '높음', '보통', '낮음']
        }
    ]);

    const [recentSearches, setRecentSearches] = useState<string[]>([
        'AI 대화분석',
        '메시지 생성',
        '성능 최적화',
        '시스템 모니터링'
    ]);

    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        // 검색 제안 생성
        if (searchQuery.length > 0) {
            const allSuggestions = [
                'AI 대화분석시스템',
                '맥락 기반 메시지',
                '자동 생성',
                '실시간 분석',
                '동적 라우팅',
                '시스템 모니터링',
                '성능 최적화',
                '알림 시스템',
                '고급 검색',
                '필터링'
            ];

            const filtered = allSuggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            // 최근 검색어에 추가
            if (!recentSearches.includes(searchQuery)) {
                setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
            }

            onSearch(searchQuery, filters);
        }
    };

    const handleFilterChange = (filterId: string, value: any) => {
        setFilters(prev =>
            prev.map(filter =>
                filter.id === filterId ? { ...filter, value } : filter
            )
        );
    };

    const handleClearFilters = () => {
        setFilters(prev =>
            prev.map(filter => ({ ...filter, value: filter.type === 'select' ? '' : null }))
        );
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
    };

    const handleRecentSearchClick = (search: string) => {
        setSearchQuery(search);
    };

    const getActiveFiltersCount = () => {
        return filters.filter(filter => {
            if (filter.type === 'select') return filter.value !== '';
            if (filter.type === 'date') return filter.value !== null;
            return false;
        }).length;
    };

    return (
        <div className="relative">
            {/* 검색 입력 */}
            <div className="relative">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="고급 검색... (기능명, 설명, 카테고리)"
                            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`p-2 rounded-lg transition-colors ${showAdvanced
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        title="고급 필터"
                    >
                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        {getActiveFiltersCount() > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        검색
                    </button>
                </div>

                {/* 검색 제안 */}
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                            >
                                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                                <span>{suggestion}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 고급 필터 */}
            {showAdvanced && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <FunnelIcon className="w-5 h-5 mr-2" />
                            고급 필터
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleClearFilters}
                                className="text-sm text-gray-600 hover:text-gray-800"
                            >
                                필터 초기화
                            </button>
                            <button
                                onClick={() => setShowAdvanced(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filters.map((filter) => (
                            <div key={filter.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {filter.name}
                                </label>
                                {filter.type === 'select' && (
                                    <select
                                        value={filter.value as string}
                                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {filter.options?.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {filter.type === 'date' && (
                                    <input
                                        type="date"
                                        value={filter.value as string || ''}
                                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 필터 적용 버튼 */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {getActiveFiltersCount()}개 필터 적용됨
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleClearFilters}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                                초기화
                            </button>
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                            >
                                필터 적용
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 최근 검색어 */}
            {!showAdvanced && recentSearches.length > 0 && (
                <div className="mt-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <span>최근 검색어:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, index) => (
                            <button
                                key={index}
                                onClick={() => handleRecentSearchClick(search)}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                {search}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearchSystem; 