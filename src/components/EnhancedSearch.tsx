import React, { useState, useEffect } from 'react';

interface SearchResult {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    type: string;
    highlightIndices: number[];
}

interface EnhancedSearchProps {
    messages: any[];
    isVisible: boolean;
    onClose: () => void;
    onResultSelect: (messageId: string) => void;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
    messages,
    isVisible,
    onClose,
    onResultSelect
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedResultIndex, setSelectedResultIndex] = useState(-1);

    const filters = [
        { id: 'all', label: '전체', icon: '🔍' },
        { id: 'text', label: '텍스트', icon: '💬' },
        { id: 'ai', label: 'AI 응답', icon: '🤖' },
        { id: 'file', label: '파일', icon: '📎' },
        { id: 'image', label: '이미지', icon: '🖼️' }
    ];

    useEffect(() => {
        if (searchQuery.trim()) {
            performSearch();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, selectedFilter]);

    const performSearch = () => {
        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        messages.forEach(message => {
            // 필터 적용
            if (selectedFilter !== 'all') {
                if (selectedFilter === 'ai' && message.type !== 'ai_response') return;
                if (selectedFilter === 'file' && message.type !== 'file') return;
                if (selectedFilter === 'image' && message.type !== 'image') return;
                if (selectedFilter === 'text' && message.type !== 'text') return;
            }

            // 내용 검색
            const content = message.content?.toLowerCase() || '';
            const sender = message.sender?.toLowerCase() || '';

            if (content.includes(query) || sender.includes(query)) {
                const highlightIndices = [];
                let index = content.indexOf(query);
                while (index !== -1) {
                    highlightIndices.push(index);
                    index = content.indexOf(query, index + 1);
                }

                results.push({
                    id: message.id,
                    content: message.content,
                    sender: message.sender,
                    timestamp: message.timestamp,
                    type: message.type,
                    highlightIndices
                });
            }
        });

        setSearchResults(results);
        setSelectedResultIndex(-1);
    };

    const highlightText = (text: string, indices: number[], query: string) => {
        if (indices.length === 0) return text;

        const parts = [];
        let lastIndex = 0;

        indices.forEach(index => {
            parts.push(text.slice(lastIndex, index));
            parts.push(
                <mark key={index} className="bg-yellow-200 px-1 rounded">
                    {text.slice(index, index + query.length)}
                </mark>
            );
            lastIndex = index + query.length;
        });

        parts.push(text.slice(lastIndex));
        return parts;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedResultIndex(prev =>
                prev < searchResults.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedResultIndex(prev =>
                prev > 0 ? prev - 1 : searchResults.length - 1
            );
        } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
            e.preventDefault();
            onResultSelect(searchResults[selectedResultIndex].id);
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">메시지 검색</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    {/* 검색 입력 */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="메시지 내용, 발신자로 검색..."
                            className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                        <svg className="w-5 h-5 absolute left-4 top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* 필터 */}
                    <div className="flex space-x-2 mt-4">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedFilter(filter.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedFilter === filter.id
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <span className="mr-1">{filter.icon}</span>
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 검색 결과 */}
                <div className="overflow-y-auto max-h-96">
                    {searchResults.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            {searchQuery ? '검색 결과가 없습니다.' : '검색어를 입력하세요.'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {searchResults.map((result, index) => (
                                <div
                                    key={result.id}
                                    onClick={() => onResultSelect(result.id)}
                                    className={`p-4 cursor-pointer transition-colors ${index === selectedResultIndex
                                            ? 'bg-blue-50 border-l-4 border-blue-500'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {result.sender}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(result.timestamp).toLocaleString()}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                                    {result.type}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                {highlightText(result.content, result.highlightIndices, searchQuery)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 검색 결과 요약 */}
                {searchResults.length > 0 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>총 {searchResults.length}개의 결과</span>
                            <span>↑↓ 키로 이동, Enter로 선택</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedSearch; 