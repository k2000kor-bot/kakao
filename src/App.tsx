import React, { useState, useEffect } from 'react';
import ChatRoomList from './components/ChatRoomList';
import RealTimeChat from './components/RealTimeChat';
import AdvancedUnifiedAnalysisPlatform from './components/AdvancedUnifiedAnalysisPlatform';
import './App.css';

function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [systemStatus, setSystemStatus] = useState('idle');
  const [realTimeMode, setRealTimeMode] = useState(false);

  // 시스템 상태 모니터링
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          setSystemStatus('healthy');
        } else {
          setSystemStatus('error');
        }
      } catch (error) {
        setSystemStatus('error');
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // 30초마다 체크
    return () => clearInterval(interval);
  }, []);

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const tabs = [
    { id: 'chat', label: '실시간 채팅', icon: '💬' },
    { id: 'advanced-analysis', label: '고도화된 통합 분석', icon: '🔬' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                고도화된 통합 분석 플랫폼
              </h1>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getSystemStatusColor(systemStatus)}`}></div>
                <span className="text-sm text-gray-600">
                  {systemStatus === 'healthy' ? '시스템 정상' :
                    systemStatus === 'error' ? '시스템 오류' : '시스템 확인 중'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setRealTimeMode(!realTimeMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${realTimeMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {realTimeMode ? '실시간 모드 ON' : '실시간 모드 OFF'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 - 채팅방 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">채팅방 목록</h2>
              </div>
              <ChatRoomList
                selectedRoomId={selectedRoomId}
                onRoomSelect={setSelectedRoomId}
              />
            </div>
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* 탭 네비게이션 */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* 탭 콘텐츠 */}
              <div className="p-6">
                {activeTab === 'chat' && (
                  <RealTimeChat
                    selectedRoomId={selectedRoomId}
                    realTimeMode={realTimeMode}
                  />
                )}

                {activeTab === 'advanced-analysis' && (
                  <AdvancedUnifiedAnalysisPlatform
                    selectedRoomId={selectedRoomId}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
