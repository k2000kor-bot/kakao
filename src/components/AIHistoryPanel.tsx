import React, { useState } from 'react';
import { useAIHistory, AIResponseHistory } from '../hooks/useAIHistory';

const AIHistoryPanel: React.FC = () => {
  const {
    history,
    stats,
    filter,
    setFilter,
    deleteResponse,
    rateResponse,
    addNote,
    toggleTag,
    exportHistory,
    importHistory,
    clearHistory
  } = useAIHistory();

  const [selectedResponse, setSelectedResponse] = useState<AIResponseHistory | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const handleImport = async () => {
    if (importFile) {
      try {
        await importHistory(importFile);
        setShowImportModal(false);
        setImportFile(null);
      } catch (error) {
        alert('파일 가져오기에 실패했습니다.');
      }
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('모든 히스토리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearHistory();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          AI 응답 히스토리
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            가져오기
          </button>
          <button
            onClick={exportHistory}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            내보내기
          </button>
          <button
            onClick={handleClearHistory}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            전체 삭제
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {stats.totalResponses}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">총 응답</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {stats.averageTokens}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">평균 토큰</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {stats.averageProcessingTime}ms
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">평균 처리시간</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {stats.favoriteResponses}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">즐겨찾기</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">필터</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              날짜 범위
            </label>
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter({ ...filter, dateRange: e.target.value as any })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">전체</option>
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              모델
            </label>
            <select
              value={filter.model}
              onChange={(e) => setFilter({ ...filter, model: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">모든 모델</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              검색어
            </label>
            <input
              type="text"
              value={filter.searchTerm}
              onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
              placeholder="메시지나 응답에서 검색..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 히스토리 목록 */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            히스토리가 없습니다.
          </div>
        ) : (
          history.map((response) => (
            <div
              key={response.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(response.timestamp)}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {response.model}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {response.tokens} 토큰
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {response.processingTime}ms
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      사용자: {response.userMessage.substring(0, 100)}
                      {response.userMessage.length > 100 && '...'}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      AI: {response.aiResponse.substring(0, 150)}
                      {response.aiResponse.length > 150 && '...'}
                    </div>
                  </div>

                  {response.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {response.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {response.rating && (
                    <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                      {getRatingStars(response.rating)}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedResponse(response)}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    상세보기
                  </button>
                  <button
                    onClick={() => deleteResponse(response.id)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 상세보기 모달 */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                응답 상세보기
              </h3>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">사용자 메시지</h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                  {selectedResponse.userMessage}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI 응답</h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                  {selectedResponse.aiResponse}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">평가</h4>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => rateResponse(selectedResponse.id, rating)}
                        className={`text-lg ${selectedResponse.rating === rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">태그</h4>
                  <div className="flex flex-wrap gap-1">
                    {['유용함', '정확함', '창의적', '빠름', '상세함'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(selectedResponse.id, tag)}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedResponse.tags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">노트</h4>
                <textarea
                  value={selectedResponse.notes || ''}
                  onChange={(e) => addNote(selectedResponse.id, e.target.value)}
                  placeholder="이 응답에 대한 노트를 추가하세요..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 가져오기 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              히스토리 가져오기
            </h3>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                가져오기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIHistoryPanel;
