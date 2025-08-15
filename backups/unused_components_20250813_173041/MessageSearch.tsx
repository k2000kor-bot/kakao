import React, { useState, useCallback } from 'react';
import { useChat } from '../context/AppContext';

interface MessageSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  className?: string;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ 
  onSearch, 
  onClear, 
  className = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { messages } = useChat();

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      onClear();
      return;
    }

    setIsSearching(true);
    onSearch(query);

    // 모의 검색 지연
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSearching(false);
  }, [onSearch, onClear]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      handleSearch(query);
    } else {
      onClear();
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClear();
  };

  const getSearchResults = (query: string) => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return messages.filter(message => 
      message.content.toLowerCase().includes(lowerQuery)
    );
  };

  const searchResults = getSearchResults(searchQuery);

  return (
    <div className={`message-search ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="메시지 검색..."
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="메시지 검색"
        />
        
        {/* 검색 아이콘 */}
        <div className="absolute left-3 top-2.5">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 검색 중 표시 */}
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* 검색어 지우기 버튼 */}
        {searchQuery && !isSearching && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            aria-label="검색어 지우기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 검색 결과 요약 */}
      {searchQuery && searchResults.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">{searchResults.length}</span>개의 메시지에서 
          <span className="font-medium">"{searchQuery}"</span>를 찾았습니다.
        </div>
      )}

      {/* 검색 결과 없음 */}
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="mt-2 text-sm text-gray-500">
          <span className="font-medium">"{searchQuery}"</span>와 일치하는 메시지가 없습니다.
        </div>
      )}
    </div>
  );
};

export default MessageSearch; 