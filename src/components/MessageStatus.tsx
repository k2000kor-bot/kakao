import React from 'react';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  onRetry?: () => void;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, timestamp, onRetry }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500">전송 중</span>
          </div>
        );
      case 'sent':
        return (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-500">전송됨</span>
          </div>
        );
      case 'delivered':
        return (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-blue-500">전달됨</span>
          </div>
        );
      case 'read':
        return (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-blue-600">읽음</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-red-500">전송 실패</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                재전송
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between mt-1">
      <span className="text-xs text-gray-400">{timestamp}</span>
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatus; 