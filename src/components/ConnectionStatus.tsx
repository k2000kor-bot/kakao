import React, { useState, useEffect } from 'react';
import unifiedAPI from '../services/unifiedAPI';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await unifiedAPI.testConnection();
      setIsConnected(connected);
      setLastCheck(new Date());
    } catch (error) {
      console.error('연결 상태 확인 실패:', error);
      setIsConnected(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // 초기 연결 확인
    checkConnection();

    // 30초마다 연결 상태 확인
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusText = () => {
    if (isChecking) return '확인 중...';
    if (isConnected === null) return '확인 중...';
    if (isConnected) return '연결됨';
    return '연결 안됨';
  };

  const getStatusIcon = () => {
    if (isChecking) return '⏳';
    if (isConnected === null) return '⏳';
    if (isConnected) return '🟢';
    return '🔴';
  };

  const getStatusClass = () => {
    if (isChecking) return 'checking';
    if (isConnected === null) return 'checking';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  return (
    <div className={`connection-status ${getStatusClass()} ${className}`}>
      <span className="status-icon">{getStatusIcon()}</span>
      <span className="status-text">{getStatusText()}</span>
      {lastCheck && (
        <span className="last-check">
          {lastCheck.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
        </span>
      )}
      <button
        className="refresh-button"
        onClick={checkConnection}
        disabled={isChecking}
        title="연결 상태 새로고침"
      >
        🔄
      </button>
    </div>
  );
};

export default ConnectionStatus;
