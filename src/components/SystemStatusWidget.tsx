import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  ServerIcon,
  WifiIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

interface SystemStatus {
  backend: boolean;
  websocket: boolean;
  frontend: boolean;
  database: boolean;
}

interface Performance {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
}

interface SystemStatusWidgetProps {
  status: SystemStatus;
  performance: Performance;
}

const SystemStatusWidget: React.FC<SystemStatusWidgetProps> = ({ status, performance }) => {
  const getStatusIcon = (isOnline: boolean) => {
    return isOnline ? (
      <CheckCircleIcon className="status-icon online" />
    ) : (
      <XCircleIcon className="status-icon offline" />
    );
  };

  const getStatusText = (isOnline: boolean) => {
    return isOnline ? '온라인' : '오프라인';
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'status-online' : 'status-offline';
  };

  const formatResponseTime = (time: number) => {
    return `${time.toFixed(0)}ms`;
  };

  const formatMemoryUsage = (usage: number) => {
    return `${usage.toFixed(1)}%`;
  };

  const formatCpuUsage = (usage: number) => {
    return `${usage.toFixed(1)}%`;
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    return value > threshold ? 'performance-warning' : 'performance-normal';
  };

  return (
    <div className="system-status-widget">
      <div className="status-grid">
        {/* 백엔드 상태 */}
        <div className="status-item">
          <div className="status-header">
            <ServerIcon className="status-icon" />
            <span className="status-label">백엔드</span>
            {getStatusIcon(status.backend)}
          </div>
          <span className={`status-text ${getStatusColor(status.backend)}`}>
            {getStatusText(status.backend)}
          </span>
        </div>

        {/* WebSocket 상태 */}
        <div className="status-item">
          <div className="status-header">
            <WifiIcon className="status-icon" />
            <span className="status-label">WebSocket</span>
            {getStatusIcon(status.websocket)}
          </div>
          <span className={`status-text ${getStatusColor(status.websocket)}`}>
            {getStatusText(status.websocket)}
          </span>
        </div>

        {/* 프론트엔드 상태 */}
        <div className="status-item">
          <div className="status-header">
            <CpuChipIcon className="status-icon" />
            <span className="status-label">프론트엔드</span>
            {getStatusIcon(status.frontend)}
          </div>
          <span className={`status-text ${getStatusColor(status.frontend)}`}>
            {getStatusText(status.frontend)}
          </span>
        </div>

        {/* 데이터베이스 상태 */}
        <div className="status-item">
          <div className="status-header">
            <CircleStackIcon className="status-icon" />
            <span className="status-label">데이터베이스</span>
            {getStatusIcon(status.database)}
          </div>
          <span className={`status-text ${getStatusColor(status.database)}`}>
            {getStatusText(status.database)}
          </span>
        </div>
      </div>

      {/* 성능 지표 */}
      <div className="performance-section">
        <h4 className="performance-title">CORBU AI 성능</h4>
        <div className="performance-indicators">
          <div className="performance-item">
            <span className="performance-label">응답 시간</span>
            <span className={`performance-value ${getPerformanceColor(performance.responseTime, 500)}`}>
              {formatResponseTime(performance.responseTime)}
            </span>
          </div>
          <div className="performance-item">
            <span className="performance-label">메모리</span>
            <span className={`performance-value ${getPerformanceColor(performance.memoryUsage, 80)}`}>
              {formatMemoryUsage(performance.memoryUsage)}
            </span>
          </div>
          <div className="performance-item">
            <span className="performance-label">CPU</span>
            <span className={`performance-value ${getPerformanceColor(performance.cpuUsage, 70)}`}>
              {formatCpuUsage(performance.cpuUsage)}
            </span>
          </div>
          <div className="performance-item">
            <span className="performance-label">연결</span>
            <span className="performance-value performance-normal">
              {performance.activeConnections}
            </span>
          </div>
        </div>
      </div>

      {/* 시스템 상태 요약 */}
      <div className="system-summary">
        <div className="summary-item">
          <span className="summary-label">전체 상태</span>
          <span className={`summary-value ${Object.values(status).every(s => s) ? 'summary-success' : 'summary-warning'}`}>
            {Object.values(status).every(s => s) ? '정상' : '주의'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">AI 모델</span>
          <span className="summary-value summary-success">활성</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusWidget; 