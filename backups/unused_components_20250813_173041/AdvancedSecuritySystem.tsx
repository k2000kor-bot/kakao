import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  KeyIcon,
  CogIcon,
  BellIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  user?: string;
  ipAddress?: string;
  location?: string;
  resolved: boolean;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'testing';
  category: 'authentication' | 'authorization' | 'data_protection' | 'network';
  priority: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  resolvedEvents: number;
  activeThreats: number;
  securityScore: number;
  lastScan: Date;
}

interface AdvancedSecuritySystemProps {
  onSecurityAlert?: (event: SecurityEvent) => void;
}

const AdvancedSecuritySystem: React.FC<AdvancedSecuritySystemProps> = ({
  onSecurityAlert
}) => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    resolvedEvents: 0,
    activeThreats: 0,
    securityScore: 0,
    lastScan: new Date()
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'policies' | 'threats'>('overview');
  const [showResolved, setShowResolved] = useState(false);

  // 시뮬레이션된 보안 이벤트
  useEffect(() => {
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login',
        severity: 'low',
        description: '사용자 로그인 성공',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        user: 'admin@corbu.ai',
        ipAddress: '192.168.1.100',
        location: '서울, 대한민국',
        resolved: true
      },
      {
        id: '2',
        type: 'failed_login',
        severity: 'medium',
        description: '잘못된 비밀번호 시도',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        user: 'unknown@example.com',
        ipAddress: '203.241.xxx.xxx',
        location: '해외',
        resolved: false
      },
      {
        id: '3',
        type: 'suspicious_activity',
        severity: 'high',
        description: '비정상적인 데이터 접근 패턴 감지',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: 'user123@corbu.ai',
        ipAddress: '192.168.1.105',
        location: '서울, 대한민국',
        resolved: false
      },
      {
        id: '4',
        type: 'data_access',
        severity: 'medium',
        description: '민감한 데이터 접근',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        user: 'manager@corbu.ai',
        ipAddress: '192.168.1.102',
        location: '서울, 대한민국',
        resolved: true
      }
    ];

    setSecurityEvents(mockEvents);
    setMetrics({
      totalEvents: mockEvents.length,
      criticalEvents: mockEvents.filter(e => e.severity === 'critical').length,
      resolvedEvents: mockEvents.filter(e => e.resolved).length,
      activeThreats: mockEvents.filter(e => !e.resolved && e.severity === 'high').length,
      securityScore: 85,
      lastScan: new Date()
    });
  }, []);

  // 시뮬레이션된 보안 정책
  useEffect(() => {
    const mockPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: '다중 인증 (MFA)',
        description: '모든 관리자 계정에 다중 인증 필수',
        status: 'active',
        category: 'authentication',
        priority: 'high',
        lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: '비밀번호 정책',
        description: '최소 12자, 특수문자 포함 필수',
        status: 'active',
        category: 'authentication',
        priority: 'high',
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: '데이터 암호화',
        description: '저장된 모든 데이터 AES-256 암호화',
        status: 'active',
        category: 'data_protection',
        priority: 'high',
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        name: '세션 타임아웃',
        description: '30분 비활성 시 자동 로그아웃',
        status: 'active',
        category: 'authorization',
        priority: 'medium',
        lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        id: '5',
        name: 'IP 화이트리스트',
        description: '허용된 IP 주소만 접근 가능',
        status: 'testing',
        category: 'network',
        priority: 'medium',
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    setSecurityPolicies(mockPolicies);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserIcon className="w-5 h-5 text-green-500" />;
      case 'logout': return <UserIcon className="w-5 h-5 text-blue-500" />;
      case 'failed_login': return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'suspicious_activity': return <ShieldCheckIcon className="w-5 h-5 text-orange-500" />;
      case 'data_access': return <EyeIcon className="w-5 h-5 text-purple-500" />;
      case 'system_change': return <CogIcon className="w-5 h-5 text-gray-500" />;
      default: return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPolicyStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-red-600 bg-red-50';
      case 'testing': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const resolveEvent = (eventId: string) => {
    setSecurityEvents(prev => 
      prev.map(event => 
        event.id === eventId ? { ...event, resolved: true } : event
      )
    );
  };

  const togglePolicy = (policyId: string) => {
    setSecurityPolicies(prev => 
      prev.map(policy => {
        if (policy.id === policyId) {
          const newStatus = policy.status === 'active' ? 'inactive' : 'active';
          return { ...policy, status: newStatus };
        }
        return policy;
      })
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 보안 점수 및 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">보안 점수</p>
              <p className={`text-2xl font-bold ${metrics.securityScore >= 80 ? 'text-green-600' : metrics.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {metrics.securityScore}/100
              </p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 이벤트</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalEvents}</p>
            </div>
            <BellIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 위협</p>
              <p className={`text-2xl font-bold ${metrics.activeThreats > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.activeThreats}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">해결된 이벤트</p>
              <p className="text-2xl font-bold text-green-600">{metrics.resolvedEvents}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* 최근 보안 이벤트 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">최근 보안 이벤트</h3>
          <button
            onClick={() => setActiveTab('events')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            모든 이벤트 보기
          </button>
        </div>
        
        <div className="space-y-3">
          {securityEvents.slice(0, 5).map((event) => (
            <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {getEventIcon(event.type)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{event.description}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.severity === 'critical' ? '치명적' : event.severity === 'high' ? '높음' : event.severity === 'medium' ? '보통' : '낮음'}
                  </span>
                  {event.resolved && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
                      해결됨
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>{event.timestamp.toLocaleString()}</span>
                  {event.user && <span>사용자: {event.user}</span>}
                  {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                </div>
              </div>
              
              {!event.resolved && (
                <button
                  onClick={() => resolveEvent(event.id)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  해결
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 보안 정책 요약 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">활성 보안 정책</h3>
          <button
            onClick={() => setActiveTab('policies')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            모든 정책 보기
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {securityPolicies.filter(p => p.status === 'active').slice(0, 4).map((policy) => (
            <div key={policy.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{policy.name}</h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPolicyStatusColor(policy.status)}`}>
                  {policy.status === 'active' ? '활성' : policy.status === 'inactive' ? '비활성' : '테스트'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{policy.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                마지막 업데이트: {policy.lastUpdated.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">보안 이벤트</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`px-3 py-1 text-sm rounded ${
              showResolved ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showResolved ? '해결된 이벤트 숨기기' : '해결된 이벤트 표시'}
          </button>
          <button
            onClick={() => setSecurityEvents(prev => prev.filter(e => e.severity === 'high' || e.severity === 'critical'))}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            높은 심각도만
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {securityEvents
          .filter(event => showResolved || !event.resolved)
          .map((event) => (
            <div key={event.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start space-x-3">
                {getEventIcon(event.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-medium text-gray-900">{event.description}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity === 'critical' ? '치명적' : event.severity === 'high' ? '높음' : event.severity === 'medium' ? '보통' : '낮음'}
                    </span>
                    {event.resolved && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
                        해결됨
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">시간:</span> {event.timestamp.toLocaleString()}
                    </div>
                    {event.user && (
                      <div>
                        <span className="font-medium">사용자:</span> {event.user}
                      </div>
                    )}
                    {event.ipAddress && (
                      <div>
                        <span className="font-medium">IP 주소:</span> {event.ipAddress}
                      </div>
                    )}
                    {event.location && (
                      <div>
                        <span className="font-medium">위치:</span> {event.location}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!event.resolved && (
                    <button
                      onClick={() => resolveEvent(event.id)}
                      className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      해결
                    </button>
                  )}
                  <button className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">보안 정책</h3>
      
      <div className="space-y-4">
        {securityPolicies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-medium text-gray-900">{policy.name}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPolicyStatusColor(policy.status)}`}>
                    {policy.status === 'active' ? '활성' : policy.status === 'inactive' ? '비활성' : '테스트'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    policy.priority === 'high' ? 'text-red-600 bg-red-50' : 
                    policy.priority === 'medium' ? 'text-yellow-600 bg-yellow-50' : 
                    'text-green-600 bg-green-50'
                  }`}>
                    {policy.priority === 'high' ? '높음' : policy.priority === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{policy.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>카테고리: {policy.category}</span>
                  <span>마지막 업데이트: {policy.lastUpdated.toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => togglePolicy(policy.id)}
                  className={`px-4 py-2 text-sm rounded ${
                    policy.status === 'active'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {policy.status === 'active' ? '비활성화' : '활성화'}
                </button>
                <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  편집
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderThreats = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">위협 분석</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium text-gray-900 mb-4">위협 분포</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">치명적 위협</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">5%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">높은 위협</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">15%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">보통 위협</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">30%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">낮은 위협</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">50%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium text-gray-900 mb-4">보안 권장사항</h4>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">다중 인증 활성화</p>
                  <p className="text-xs text-yellow-700">모든 관리자 계정에 MFA를 활성화하세요.</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">정기 보안 스캔</p>
                  <p className="text-xs text-blue-700">주간 보안 취약점 스캔을 실행하세요.</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">백업 확인</p>
                  <p className="text-xs text-green-700">데이터 백업이 정상적으로 작동하고 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">보안 시스템</h3>
              <p className="text-sm text-gray-500">실시간 보안 모니터링 및 위협 대응</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="설정">
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'overview', name: '개요', icon: ChartBarIcon },
            { id: 'events', name: '이벤트', icon: BellIcon },
            { id: 'policies', name: '정책', icon: LockClosedIcon },
            { id: 'threats', name: '위협', icon: ExclamationTriangleIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'policies' && renderPolicies()}
        {activeTab === 'threats' && renderThreats()}
      </div>
    </div>
  );
};

export default AdvancedSecuritySystem; 