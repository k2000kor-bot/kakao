import React, { useState, useEffect } from 'react';
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  HandRaisedIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  userAgent: string;
  touchSupport: boolean;
  orientation: 'portrait' | 'landscape';
}

interface OptimizationFeature {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled' | 'testing';
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'ui' | 'accessibility' | 'touch';
}

interface AdvancedMobileOptimizationProps {
  onOptimizationChange?: (feature: OptimizationFeature) => void;
}

const AdvancedMobileOptimization: React.FC<AdvancedMobileOptimizationProps> = ({
  onOptimizationChange
}) => {
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo>({
    type: 'desktop',
    width: window.innerWidth,
    height: window.innerHeight,
    userAgent: navigator.userAgent,
    touchSupport: 'ontouchstart' in window,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  });

  const [optimizationFeatures, setOptimizationFeatures] = useState<OptimizationFeature[]>([
    {
      id: '1',
      name: '터치 최적화',
      description: '터치 인터페이스에 최적화된 버튼 크기 및 간격',
      status: 'enabled',
      impact: 'high',
      category: 'touch'
    },
    {
      id: '2',
      name: '반응형 이미지',
      description: '디바이스 크기에 따른 이미지 최적화',
      status: 'enabled',
      impact: 'high',
      category: 'performance'
    },
    {
      id: '3',
      name: '제스처 지원',
      description: '스와이프, 핀치 등 모바일 제스처 지원',
      status: 'testing',
      impact: 'medium',
      category: 'touch'
    },
    {
      id: '4',
      name: '다크모드 자동',
      description: '시스템 설정에 따른 자동 다크모드 전환',
      status: 'enabled',
      impact: 'medium',
      category: 'ui'
    },
    {
      id: '5',
      name: '접근성 향상',
      description: '스크린 리더 및 키보드 네비게이션 지원',
      status: 'enabled',
      impact: 'high',
      category: 'accessibility'
    },
    {
      id: '6',
      name: '오프라인 지원',
      description: 'PWA 기능을 통한 오프라인 사용 가능',
      status: 'testing',
      impact: 'medium',
      category: 'performance'
    },
    {
      id: '7',
      name: '성능 모니터링',
      description: '모바일 디바이스 성능 실시간 모니터링',
      status: 'enabled',
      impact: 'low',
      category: 'performance'
    },
    {
      id: '8',
      name: '배터리 최적화',
      description: '배터리 사용량 최적화',
      status: 'disabled',
      impact: 'medium',
      category: 'performance'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'testing' | 'analytics'>('overview');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setCurrentDevice(prev => ({
        ...prev,
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <DevicePhoneMobileIcon className="w-6 h-6" />;
      case 'tablet': return <ComputerDesktopIcon className="w-6 h-6" />;
      case 'desktop': return <ComputerDesktopIcon className="w-6 h-6" />;
      default: return <ComputerDesktopIcon className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled': return 'text-green-600 bg-green-50';
      case 'disabled': return 'text-red-600 bg-red-50';
      case 'testing': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const toggleFeature = (featureId: string) => {
    setOptimizationFeatures(prev =>
      prev.map(feature => {
        if (feature.id === featureId) {
          const newStatus = feature.status === 'enabled' ? 'disabled' : 'enabled';
          const updatedFeature = { ...feature, status: newStatus as 'enabled' | 'disabled' | 'testing' };
          onOptimizationChange?.(updatedFeature);
          return updatedFeature;
        }
        return feature;
      })
    );
  };

  const startTesting = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      // 테스트 결과 시뮬레이션
      setOptimizationFeatures(prev =>
        prev.map(feature =>
          feature.status === 'testing'
            ? { ...feature, status: Math.random() > 0.3 ? 'enabled' : 'disabled' }
            : feature
        )
      );
    }, 3000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 현재 디바이스 정보 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">현재 디바이스</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              {getDeviceIcon(currentDevice.type)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 capitalize">{currentDevice.type}</h4>
              <p className="text-sm text-gray-500">
                {currentDevice.width} × {currentDevice.height}px
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {currentDevice.orientation} 모드
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">터치 지원</span>
              <span className={`text-sm ${currentDevice.touchSupport ? 'text-green-600' : 'text-red-600'}`}>
                {currentDevice.touchSupport ? '지원' : '미지원'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">화면 크기</span>
              <span className="text-sm text-gray-900">
                {currentDevice.width < 768 ? '모바일' : currentDevice.width < 1024 ? '태블릿' : '데스크톱'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 최적화 상태 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성화된 기능</p>
              <p className="text-2xl font-bold text-green-600">
                {optimizationFeatures.filter(f => f.status === 'enabled').length}
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">테스트 중</p>
              <p className="text-2xl font-bold text-yellow-600">
                {optimizationFeatures.filter(f => f.status === 'testing').length}
              </p>
            </div>
            <ArrowPathIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">비활성화</p>
              <p className="text-2xl font-bold text-red-600">
                {optimizationFeatures.filter(f => f.status === 'disabled').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={startTesting}
            disabled={isTesting}
            className="flex items-center justify-center space-x-2 p-4 border border-blue-300 rounded-lg hover:bg-blue-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 text-blue-500 ${isTesting ? 'animate-spin' : ''}`} />
            <span className="text-blue-600 font-medium">
              {isTesting ? '테스트 중...' : '모든 기능 테스트'}
            </span>
          </button>

          <button
            onClick={() => setOptimizationFeatures(prev =>
              prev.map(f => ({ ...f, status: 'enabled' as const }))
            )}
            className="flex items-center justify-center space-x-2 p-4 border border-green-300 rounded-lg hover:bg-green-50"
          >
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">모든 기능 활성화</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">최적화 기능</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setOptimizationFeatures(prev => prev.filter(f => f.impact === 'high'))}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            높은 영향도만
          </button>
          <button
            onClick={() => setOptimizationFeatures(prev => prev.filter(f => f.status === 'disabled'))}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            비활성화만
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {optimizationFeatures.map((feature) => (
          <div key={feature.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-medium text-gray-900">{feature.name}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                    {feature.status === 'enabled' ? '활성화' : feature.status === 'disabled' ? '비활성화' : '테스트 중'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(feature.impact)} bg-gray-50`}>
                    {feature.impact === 'high' ? '높음' : feature.impact === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{feature.description}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>카테고리: {feature.category}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => toggleFeature(feature.id)}
                  className={`px-4 py-2 text-sm rounded ${feature.status === 'enabled'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                >
                  {feature.status === 'enabled' ? '비활성화' : '활성화'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTesting = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">디바이스 테스트</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <DevicePhoneMobileIcon className="w-6 h-6 text-blue-500" />
            <h4 className="font-medium text-gray-900">모바일</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">375 × 667px (iPhone SE)</p>
          <button className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            모바일 모드 테스트
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <ComputerDesktopIcon className="w-6 h-6 text-green-500" />
            <h4 className="font-medium text-gray-900">태블릿</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">768 × 1024px (iPad)</p>
          <button className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600">
            태블릿 모드 테스트
          </button>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <ComputerDesktopIcon className="w-6 h-6 text-purple-500" />
            <h4 className="font-medium text-gray-900">데스크톱</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">1920 × 1080px (Full HD)</p>
          <button className="w-full px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600">
            데스크톱 모드 테스트
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-medium text-gray-900 mb-4">접근성 테스트</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <EyeIcon className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">시각적 접근성</p>
              <p className="text-xs text-gray-500">색상 대비 및 폰트 크기</p>
            </div>
            <button className="ml-auto px-2 py-1 text-xs bg-blue-500 text-white rounded">
              테스트
            </button>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <HandRaisedIcon className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">키보드 네비게이션</p>
              <p className="text-xs text-gray-500">Tab 키 및 단축키 지원</p>
            </div>
            <button className="ml-auto px-2 py-1 text-xs bg-green-500 text-white rounded">
              테스트
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">모바일 사용 분석</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium text-gray-900 mb-4">디바이스별 사용률</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">모바일</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">65%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">태블릿</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">데스크톱</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-medium text-gray-900 mb-4">성능 지표</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">평균 로딩 시간</span>
              <span className="text-sm font-medium text-gray-900">1.2초</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">터치 반응성</span>
              <span className="text-sm font-medium text-green-600">우수</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">배터리 효율성</span>
              <span className="text-sm font-medium text-yellow-600">보통</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">접근성 점수</span>
              <span className="text-sm font-medium text-green-600">95/100</span>
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
            <DevicePhoneMobileIcon className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">모바일 최적화</h3>
              <p className="text-sm text-gray-500">반응형 디자인 및 모바일 성능 최적화</p>
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
            { id: 'overview', name: '개요', icon: SwatchIcon },
            { id: 'features', name: '기능', icon: CogIcon },
            { id: 'testing', name: '테스트', icon: EyeIcon },
            { id: 'analytics', name: '분석', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
        {activeTab === 'features' && renderFeatures()}
        {activeTab === 'testing' && renderTesting()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default AdvancedMobileOptimization;
