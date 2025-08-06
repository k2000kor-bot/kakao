import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  DocumentIcon,
  LightBulbIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface IntegrationStatus {
  file_id: string;
  status: string;
  progress: number;
  systems: {
    file_analysis: string;
    knowledge_extraction: string;
    ai_model_training: string;
    project_analysis: string;
    chat_integration: string;
    notification_system: string;
  };
  results: any;
  start_time: string;
}

interface SystemOverview {
  total_processes: number;
  completed_processes: number;
  system_statistics: {
    [key: string]: {
      completed: number;
      failed: number;
      pending: number;
    };
  };
  active_integrations: number;
}

interface EnhancedIntegrationMonitorProps {
  projectId?: string;
  chatId?: string;
  className?: string;
}

const EnhancedIntegrationMonitor: React.FC<EnhancedIntegrationMonitorProps> = ({
  projectId,
  chatId,
  className = ""
}) => {
  const [integrationStatus, setIntegrationStatus] = useState<{[key: string]: IntegrationStatus}>({});
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // 시스템별 아이콘 매핑
  const systemIcons = {
    file_analysis: DocumentIcon,
    knowledge_extraction: LightBulbIcon,
    ai_model_training: CogIcon,
    project_analysis: DocumentIcon,
    chat_integration: ChatBubbleLeftRightIcon,
    notification_system: BellIcon
  };

  // 시스템별 이름 매핑
  const systemNames = {
    file_analysis: '파일 분석',
    knowledge_extraction: '지식 추출',
    ai_model_training: 'AI 모델 훈련',
    project_analysis: '프로젝트 분석',
    chat_integration: '채팅 통합',
    notification_system: '알림 시스템'
  };

  // 시스템별 색상 매핑
  const getSystemColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 상태별 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'processing':
        return <ClockIcon className="w-4 h-4 animate-spin" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  // 통합 상태 로드
  const loadIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/v3/all-integration-status');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIntegrationStatus(data.status.processing_status);
        }
      }
    } catch (error) {
      console.error('통합 상태 로드 실패:', error);
    }
  };

  // 시스템 현황 로드
  const loadSystemOverview = async () => {
    try {
      const response = await fetch('/api/v3/system-overview');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSystemOverview(data.overview);
        }
      }
    } catch (error) {
      console.error('시스템 현황 로드 실패:', error);
    }
  };

  // 실시간 모니터링 시작
  useEffect(() => {
    const startMonitoring = () => {
      setIsMonitoring(true);
      
      // 초기 데이터 로드
      loadIntegrationStatus();
      loadSystemOverview();
      
      // 3초마다 상태 업데이트
      const interval = setInterval(() => {
        loadIntegrationStatus();
        loadSystemOverview();
      }, 3000);
      
      return () => {
        clearInterval(interval);
        setIsMonitoring(false);
      };
    };
    
    const cleanup = startMonitoring();
    return cleanup;
  }, []);

  // 진행률 표시 컴포넌트
  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  // 시스템 상태 표시 컴포넌트
  const SystemStatusCard = ({ systemName, status, progress }: { 
    systemName: string; 
    status: string; 
    progress?: number;
  }) => {
    const IconComponent = systemIcons[systemName as keyof typeof systemIcons];
    
    return (
      <div className={`p-3 rounded-lg border ${getSystemColor(status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {IconComponent && <IconComponent className="w-5 h-5" />}
            <span className="text-sm font-medium">{systemNames[systemName as keyof typeof systemNames]}</span>
          </div>
          <div className="flex items-center space-x-1">
            {getStatusIcon(status)}
            <span className="text-xs">
              {status === 'completed' ? '완료' : 
               status === 'failed' ? '실패' : 
               status === 'processing' ? '처리중' : '대기중'}
            </span>
          </div>
        </div>
        {progress !== undefined && (
          <div className="mt-2">
            <ProgressBar progress={progress} />
            <div className="text-xs text-gray-500 mt-1">{progress}%</div>
          </div>
        )}
      </div>
    );
  };

  // 개별 통합 프로세스 카드
  const IntegrationProcessCard = ({ fileId, status }: { fileId: string; status: IntegrationStatus }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">파일 처리: {fileId}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            status.status === 'completed' ? 'bg-green-100 text-green-800' :
            status.status === 'processing' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status.status === 'completed' ? '완료' : 
             status.status === 'processing' ? '처리중' : '대기중'}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <ProgressBar progress={status.progress} />
        <div className="text-xs text-gray-500 mt-1">{status.progress}% 완료</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(status.systems).map(([systemName, systemStatus]) => (
          <SystemStatusCard
            key={systemName}
            systemName={systemName}
            status={systemStatus}
          />
        ))}
      </div>
      
      <div className="text-xs text-gray-500 mt-3">
        시작: {new Date(status.start_time).toLocaleTimeString()}
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 시스템 현황 요약 */}
      {systemOverview && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">시스템 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemOverview.total_processes}</div>
              <div className="text-xs text-blue-600">총 프로세스</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemOverview.completed_processes}</div>
              <div className="text-xs text-green-600">완료된 프로세스</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{systemOverview.active_integrations}</div>
              <div className="text-xs text-purple-600">활성 통합</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {systemOverview.total_processes > 0 
                  ? Math.round((systemOverview.completed_processes / systemOverview.total_processes) * 100)
                  : 0}%
              </div>
              <div className="text-xs text-orange-600">완료율</div>
            </div>
          </div>
        </div>
      )}

      {/* 시스템별 통계 */}
      {systemOverview && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">시스템별 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(systemOverview.system_statistics).map(([systemName, stats]) => {
              const IconComponent = systemIcons[systemName as keyof typeof systemIcons];
              const total = stats.completed + stats.failed + stats.pending;
              const successRate = total > 0 ? Math.round((stats.completed / total) * 100) : 0;
              
              return (
                <div key={systemName} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    {IconComponent && <IconComponent className="w-4 h-4 text-gray-600" />}
                    <span className="text-sm font-medium text-gray-700">
                      {systemNames[systemName as keyof typeof systemNames]}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">완료: {stats.completed}</span>
                      <span className="text-red-600">실패: {stats.failed}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      성공률: {successRate}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 활성 통합 프로세스 */}
      {Object.keys(integrationStatus).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-gray-900">활성 통합 프로세스</h3>
          {Object.entries(integrationStatus).map(([fileId, status]) => (
            <IntegrationProcessCard key={fileId} fileId={fileId} status={status} />
          ))}
        </div>
      )}

      {/* 모니터링 상태 */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span>{isMonitoring ? '실시간 모니터링 중' : '모니터링 중지'}</span>
      </div>
    </div>
  );
};

export default EnhancedIntegrationMonitor;
