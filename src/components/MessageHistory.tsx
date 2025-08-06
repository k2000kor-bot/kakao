import React, { useState, useEffect } from 'react';
import { useChat } from '../context/AppContext';

interface MessageHistoryProps {
  roomId: string;
  className?: string;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({ roomId, className = '' }) => {
  const { messages, addMessage } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // 메시지 히스토리 로드 (모의 데이터)
  const loadMessageHistory = async (roomId: string, pageNum: number) => {
    setIsLoading(true);
    
    try {
      // 모의 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMessages = [
        {
          id: `history-${roomId}-${pageNum}-1`,
          content: `이전 메시지 ${pageNum}-1`,
          sender: 'user' as const,
          timestamp: new Date(Date.now() - 86400000 * pageNum).toISOString(),
          type: 'text' as const
        },
        {
          id: `history-${roomId}-${pageNum}-2`,
          content: `AI 응답 ${pageNum}-2`,
          sender: 'ai' as const,
          timestamp: new Date(Date.now() - 86400000 * pageNum + 1000).toISOString(),
          type: 'text' as const
        }
      ];

      // 메시지를 맨 앞에 추가 (히스토리는 역순으로 로드)
      mockMessages.forEach(message => {
        addMessage(message);
      });

      // 더 이상 로드할 메시지가 없으면
      if (pageNum >= 3) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('메시지 히스토리 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 히스토리 로드
  useEffect(() => {
    if (roomId) {
      loadMessageHistory(roomId, 1);
    }
  }, [roomId]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessageHistory(roomId, nextPage);
    }
  };

  if (!roomId) return null;

  return (
    <div className={`message-history ${className}`}>
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                <span>로딩 중...</span>
              </div>
            ) : (
              '더 많은 메시지 보기'
            )}
          </button>
        </div>
      )}
      
      {!hasMore && (
        <div className="text-center py-4 text-sm text-gray-500">
          모든 메시지를 불러왔습니다
        </div>
      )}
    </div>
  );
};

export default MessageHistory; 