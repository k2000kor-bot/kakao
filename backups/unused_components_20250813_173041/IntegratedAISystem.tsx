import React, { useCallback } from 'react';
import { useAI, useNotifications } from '../context/AppContext';

const IntegratedAISystem: React.FC = () => {
  // 전역 상태 훅 사용
  const { aiSystems, currentAIResponse, isAIProcessing, toggleAISystem, setAIResponse, setAIProcessing } = useAI();
  const { addNotification } = useNotifications();

  // AI 응답 생성
  const generateAIResponse = useCallback(async (input: string, systemId: string) => {
    setAIProcessing(true);
    
    const system = aiSystems.find(s => s.id === systemId);
    if (!system || !system.isActive) {
      setAIResponse({
        id: Date.now().toString(),
        content: '선택된 AI 시스템이 비활성화되어 있습니다.',
        type: 'system',
        confidence: 0,
        processingTime: 0
      });
      setAIProcessing(false);
      return;
    }

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const response = {
        id: Date.now().toString(),
        content: `${system.name}의 응답: "${input}"에 대한 분석 결과입니다.`,
        type: 'text' as const,
        confidence: system.performance.accuracy / 100,
        processingTime: system.performance.speed,
        metadata: {
          suggestions: ['더 자세한 분석을 원하시나요?', '다른 관점에서 분석해보시겠습니까?'],
          actions: ['결과 저장', '차트 생성', '보고서 생성']
        }
      };
      
      setAIResponse(response);
      setAIProcessing(false);
      addNotification({
        type: 'success',
        title: 'AI 응답 생성',
        message: `${system.name}에서 응답을 생성했습니다.`
      });
    }, system.performance.speed);
  }, [aiSystems, setAIResponse, setAIProcessing, addNotification]);

  // 시스템 성능 모니터링
  const getSystemPerformance = useCallback((systemId: string) => {
    const system = aiSystems.find(s => s.id === systemId);
    if (!system) return null;
    
    return {
      accuracy: system.performance.accuracy,
      speed: system.performance.speed,
      reliability: system.performance.reliability,
      status: system.isActive ? '활성' : '비활성'
    };
  }, [aiSystems]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">통합 AI 시스템</h2>
        <p className="text-gray-600">다양한 AI 시스템을 통합하여 강력한 인공지능 솔루션을 제공합니다.</p>
      </div>

      {/* AI 시스템 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {aiSystems.map((system) => (
          <div
            key={system.id}
            className={`p-4 rounded-lg border-2 transition-all ${system.isActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{system.name}</h3>
              <button
                onClick={() => toggleAISystem(system.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${system.isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                  }`}
              >
                {system.isActive ? '활성' : '비활성'}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">{system.description}</p>

            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">능력:</h4>
              <div className="flex flex-wrap gap-1">
                {system.capabilities.map((capability, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-gray-700">정확도</div>
                <div className="text-blue-600">{system.performance.accuracy}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">속도</div>
                <div className="text-green-600">{system.performance.speed}ms</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-700">신뢰도</div>
                <div className="text-purple-600">{system.performance.reliability}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI 응답 테스트 */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 응답 테스트</h3>

        <div className="flex space-x-4 mb-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="AI 시스템 선택"
            onChange={(e) => generateAIResponse('테스트 메시지', e.target.value)}
          >
            {aiSystems.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => generateAIResponse('테스트 메시지', aiSystems[0]?.id || 'conversational')}
            disabled={isAIProcessing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
          >
            {isAIProcessing ? '처리 중...' : '응답 생성'}
          </button>
        </div>

        {currentAIResponse && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">AI 응답</h4>
              <div className="text-xs text-gray-500">
                신뢰도: {(currentAIResponse.confidence * 100).toFixed(1)}% |
                처리시간: {currentAIResponse.processingTime}ms
              </div>
            </div>

            <p className="text-gray-700 mb-3">{currentAIResponse.content}</p>

            {currentAIResponse.metadata?.suggestions && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">제안:</h5>
                <div className="flex flex-wrap gap-2">
                  {currentAIResponse.metadata.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentAIResponse.metadata?.actions && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">액션:</h5>
                <div className="flex flex-wrap gap-2">
                  {currentAIResponse.metadata.actions.map((action, index) => (
                    <button
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 시스템 통계 */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 통계</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {aiSystems.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-gray-600">활성 시스템</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {aiSystems.reduce((acc, system) => acc + system.performance.accuracy, 0) / aiSystems.length}%
            </div>
            <div className="text-sm text-gray-600">평균 정확도</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {aiSystems.reduce((acc, system) => acc + system.performance.speed, 0) / aiSystems.length}ms
            </div>
            <div className="text-sm text-gray-600">평균 응답시간</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedAISystem; 