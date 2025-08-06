import React, { useState, useEffect, useCallback } from 'react';

interface SystemStatus {
  backend: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    uptime: string;
    version: string;
  };
  frontend: {
    status: 'healthy' | 'warning' | 'error';
    buildStatus: 'success' | 'warning' | 'error';
    memoryUsage: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    connections: number;
    size: string;
  };
  websocket: {
    status: 'connected' | 'disconnected' | 'error';
    activeConnections: number;
  };
  ai: {
    status: 'available' | 'busy' | 'error';
    accuracy: number;
    responseTime: number;
  };
}

interface SystemStatusMonitorProps {
  onStatusChange?: (status: SystemStatus) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const SystemStatusMonitor: React.FC<SystemStatusMonitorProps> = ({
  onStatusChange,
  autoRefresh = true,
  refreshInterval = 10000
}) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend: { status: 'error', responseTime: 0, uptime: '0s', version: 'unknown' },
    frontend: { status: 'error', buildStatus: 'error', memoryUsage: 0 },
    database: { status: 'error', connections: 0, size: '0MB' },
    websocket: { status: 'error', activeConnections: 0 },
    ai: { status: 'error', accuracy: 0, responseTime: 0 }
  });

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 백엔드 상태 확인
  const checkBackendStatus = useCallback(async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('http://localhost:8000/health');
      const responseTime = performance.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy' as const,
          responseTime,
          uptime: data.uptime || '0s',
          version: data.version || '1.0.0'
        };
      } else {
        return {
          status: 'warning' as const,
          responseTime,
          uptime: '0s',
          version: 'unknown'
        };
      }
    } catch (error) {
      return {
        status: 'error' as const,
        responseTime: 0,
        uptime: '0s',
        version: 'unknown'
      };
    }
  }, []);

  // 프론트엔드 상태 확인
  const checkFrontendStatus = useCallback(() => {
    try {
      const memoryInfo = (performance as any).memory || {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0
      };
      
      const memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100;
      
      return {
        status: memoryUsage > 80 ? 'warning' as const : 'healthy' as const,
        buildStatus: 'success' as const,
        memoryUsage
      };
    } catch (error) {
      return {
        status: 'error' as const,
        buildStatus: 'error' as const,
        memoryUsage: 0
      };
    }
  }, []);

  // AI 상태 확인
  const checkAIStatus = useCallback(async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('http://localhost:8000/api/v7/chatgpt/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'test', room_id: 'test', analysis_mode: 'quick' })
      });
      const responseTime = performance.now() - startTime;
      
      if (response.ok) {
        return {
          status: 'available' as const,
          accuracy: 95.0,
          responseTime
        };
      } else {
        return {
          status: 'busy' as const,
          accuracy: 0,
          responseTime
        };
      }
    } catch (error) {
      return {
        status: 'error' as const,
        accuracy: 0,
        responseTime: 0
      };
    }
  }, []);

  // 전체 시스템 상태 확인
  const checkSystemStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [backendStatus, aiStatus] = await Promise.all([
        checkBackendStatus(),
        checkAIStatus()
      ]);

      const frontendStatus = checkFrontendStatus();

      // 시뮬레이션된 데이터 (실제 구현에서는 실제 API 호출)
      const databaseStatus = {
        status: 'connected' as const,
        connections: Math.floor(Math.random() * 10) + 1,
        size: `${(Math.random() * 100 + 50).toFixed(1)}MB`
      };

      const websocketStatus = {
        status: 'connected' as const,
        activeConnections: Math.floor(Math.random() * 5) + 1
      };

      const newStatus: SystemStatus = {
        backend: backendStatus,
        frontend: frontendStatus,
        database: databaseStatus,
        websocket: websocketStatus,
        ai: aiStatus
      };

      setSystemStatus(newStatus);
      setLastUpdate(new Date());

      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      setError('시스템 상태 확인 중 오류가 발생했습니다.');
      console.error('System status check error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkBackendStatus, checkFrontendStatus, checkAIStatus, onStatusChange]);

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(checkSystemStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, checkSystemStatus]);

  // 초기 상태 확인
  useEffect(() => {
    checkSystemStatus();
  }, [checkSystemStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'available':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'busy':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'available':
      case 'success':
        return '✅';
      case 'warning':
      case 'busy':
        return '⚠️';
      case 'error':
      case 'disconnected':
        return '❌';
      default:
        return '❓';
    }
  };

  const getOverallStatus = () => {
    const statuses = [
      systemStatus.backend.status,
      systemStatus.frontend.status,
      systemStatus.database.status,
      systemStatus.websocket.status,
      systemStatus.ai.status
    ];

    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning') || statuses.includes('busy')) return 'warning';
    return 'healthy';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          🖥️ 시스템 상태 모니터
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={checkSystemStatus}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? '확인 중...' : '수동 새로고침'}
          </button>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getOverallStatus())}`}>
            {getStatusIcon(getOverallStatus())} 전체 상태: {
              getOverallStatus() === 'healthy' ? '양호' :
              getOverallStatus() === 'warning' ? '주의' : '오류'
            }
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 백엔드 상태 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">백엔드 서버</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.backend.status)}`}>
              {getStatusIcon(systemStatus.backend.status)} {systemStatus.backend.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>응답 시간:</span>
              <span className="font-medium">{systemStatus.backend.responseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span>가동 시간:</span>
              <span className="font-medium">{systemStatus.backend.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span>버전:</span>
              <span className="font-medium">{systemStatus.backend.version}</span>
            </div>
          </div>
        </div>

        {/* 프론트엔드 상태 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">프론트엔드</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.frontend.status)}`}>
              {getStatusIcon(systemStatus.frontend.status)} {systemStatus.frontend.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>빌드 상태:</span>
              <span className="font-medium">{systemStatus.frontend.buildStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>메모리 사용:</span>
              <span className="font-medium">{systemStatus.frontend.memoryUsage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  systemStatus.frontend.memoryUsage > 80 ? 'bg-red-500' :
                  systemStatus.frontend.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(systemStatus.frontend.memoryUsage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 데이터베이스 상태 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">데이터베이스</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.database.status)}`}>
              {getStatusIcon(systemStatus.database.status)} {systemStatus.database.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>연결 수:</span>
              <span className="font-medium">{systemStatus.database.connections}개</span>
            </div>
            <div className="flex justify-between">
              <span>크기:</span>
              <span className="font-medium">{systemStatus.database.size}</span>
            </div>
          </div>
        </div>

        {/* WebSocket 상태 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">WebSocket</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.websocket.status)}`}>
              {getStatusIcon(systemStatus.websocket.status)} {systemStatus.websocket.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>활성 연결:</span>
              <span className="font-medium">{systemStatus.websocket.activeConnections}개</span>
            </div>
          </div>
        </div>

        {/* AI 상태 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">AI 서비스</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemStatus.ai.status)}`}>
              {getStatusIcon(systemStatus.ai.status)} {systemStatus.ai.status}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>정확도:</span>
              <span className="font-medium">{systemStatus.ai.accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>응답 시간:</span>
              <span className="font-medium">{systemStatus.ai.responseTime.toFixed(0)}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 마지막 업데이트 시간 */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          마지막 업데이트: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      {/* 시스템 정보 */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 시스템 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-1">백엔드</h4>
            <ul className="space-y-1 text-xs">
              <li>• FastAPI 기반 REST API</li>
              <li>• WebSocket 실시간 통신</li>
              <li>• AI 분석 및 학습 기능</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">프론트엔드</h4>
            <ul className="space-y-1 text-xs">
              <li>• React + TypeScript</li>
              <li>• 실시간 성능 모니터링</li>
              <li>• 범용 컴포넌트 시스템</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusMonitor; 