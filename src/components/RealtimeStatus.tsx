import React from 'react';
import { useRealtime } from '../services/realtimeService';

const RealtimeStatus: React.FC = () => {
  const { isConnected, typingUsers, aiStatus } = useRealtime();

  return (
    <div className="flex items-center space-x-4 text-sm">
      {/* 연결 상태 */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-gray-600">
          {isConnected ? '연결됨' : '연결 끊김'}
        </span>
      </div>

      {/* 타이핑 사용자 수 */}
      {typingUsers.size > 0 && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">
            {Array.from(typingUsers.values()).flat().length}명 타이핑 중
          </span>
        </div>
      )}

      {/* AI 시스템 상태 */}
      <div className="flex items-center space-x-1">
        {Array.from(aiStatus.values()).map((status, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${status.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            title={`${status.systemId}: ${status.status}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default RealtimeStatus; 