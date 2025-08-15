import React, { useState, useEffect } from 'react';
import { quantumAISystemAPI, QuantumMessageRequest, QuantumGeneratedMessage } from '../services/quantumAISystemAPI';

interface QuantumAISystemProps {
  onMessageGenerated?: (message: any) => void;
}

const QuantumAISystem: React.FC<QuantumAISystemProps> = ({
  onMessageGenerated
}) => {
  const [originalMessage, setOriginalMessage] = useState<string>('');
  const [userId, setUserId] = useState<string>('quantum_user');
  const [context, setContext] = useState<string>('');
  const [recentMessages, setRecentMessages] = useState<string>('');
  const [quantumAnalysisEnabled, setQuantumAnalysisEnabled] = useState<boolean>(true);
  const [superpositionMode, setSuperpositionMode] = useState<boolean>(true);
  const [entanglementAnalysis, setEntanglementAnalysis] = useState<boolean>(true);
  const [generatedMessage, setGeneratedMessage] = useState<QuantumGeneratedMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<boolean>(false);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const isHealthy = await quantumAISystemAPI.checkStatus();
      setServerStatus(isHealthy);
    } catch (err) {
      setServerStatus(false);
    }
  };

  const generateQuantumMessage = async () => {
    if (!originalMessage.trim()) {
      setError('원본 메시지를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const recentMessagesArray = recentMessages
        ? recentMessages.split('\n')
            .filter(msg => msg.trim())
            .map(msg => ({ content: msg.trim(), sender: 'user', timestamp: new Date().toISOString() }))
        : [];

      const request: QuantumMessageRequest = {
        original_message: originalMessage,
        user_id: userId,
        context,
        recent_messages: recentMessagesArray,
        quantum_analysis_enabled: quantumAnalysisEnabled,
        superposition_mode: superpositionMode,
        entanglement_analysis: entanglementAnalysis
      };

      const message = await quantumAISystemAPI.generateQuantum(request);
      setGeneratedMessage(message);
      onMessageGenerated?.(message);
    } catch (err) {
      setError('양자 메시지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatComplexNumber = (complexStr: string) => {
    try {
      // 복소수 문자열을 파싱하여 실수부와 허수부 추출
      const match = complexStr.match(/\(([^)]+)\)/);
      if (match) {
        return match[1];
      }
      return complexStr;
    } catch {
      return complexStr;
    }
  };

  const getQuantumColor = (probability: number) => {
    if (probability > 0.8) return 'bg-purple-100 text-purple-800';
    if (probability > 0.6) return 'bg-blue-100 text-blue-800';
    if (probability > 0.4) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚛️ 양자 AI 시스템</h1>
        <p className="text-gray-600">양자 컴퓨팅 개념을 적용한 최고급 AI 메시지 분석 및 생성 시스템입니다.</p>

        {/* 서버 상태 표시 */}
        <div className="mt-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${serverStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm ${serverStatus ? 'text-green-600' : 'text-red-600'}`}>
            {serverStatus ? '양자 AI 서버 연결됨' : '양자 AI 서버 연결 안됨'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메시지 입력 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">양자 메시지 입력</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="original-message" className="block text-sm font-medium text-gray-700 mb-2">
                  원본 메시지
                </label>
                <textarea
                  id="original-message"
                  value={originalMessage}
                  onChange={(e) => setOriginalMessage(e.target.value)}
                  placeholder="원본 메시지를 입력하세요"
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label htmlFor="user-id" className="block text-sm font-medium text-gray-700 mb-2">
                  사용자 ID
                </label>
                <input
                  type="text"
                  id="user-id"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="사용자 ID를 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                  맥락 (선택사항)
                </label>
                <input
                  type="text"
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="대화 맥락을 입력하세요"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="recent-messages" className="block text-sm font-medium text-gray-700 mb-2">
                  최근 메시지들 (선택사항)
                </label>
                <textarea
                  id="recent-messages"
                  value={recentMessages}
                  onChange={(e) => setRecentMessages(e.target.value)}
                  placeholder="최근 대화 내용을 한 줄씩 입력하세요"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quantumAnalysisEnabled}
                    onChange={(e) => setQuantumAnalysisEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">양자 분석 활성화</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={superpositionMode}
                    onChange={(e) => setSuperpositionMode(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">중첩 모드</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={entanglementAnalysis}
                    onChange={(e) => setEntanglementAnalysis(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">얽힘 분석</span>
                </label>
              </div>
            </div>

            <button
              onClick={generateQuantumMessage}
              disabled={isLoading || !originalMessage.trim() || !serverStatus}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  양자 분석 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  양자 메시지 생성
                </>
              )}
            </button>
          </div>
        </div>

        {/* 양자 시스템 정보 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">양자 AI 기능</h2>

            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">양자 상태 분석</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">중첩 상태 생성</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">양자 얽힘 감지</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">간섭 패턴 분석</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">양자 예측 모델</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">양자 성능 모니터링</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 생성된 메시지 및 양자 분석 결과 */}
      {generatedMessage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">양자 AI 분석 결과</h2>

          <div className="space-y-8">
            {/* 생성된 메시지 */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">양자 메시지</h3>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-gray-900">{generatedMessage.quantum_message}</p>
              </div>
            </div>

            {/* 양자 상태 분석 */}
            {generatedMessage.analytics.quantum_states && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">양자 상태 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(generatedMessage.analytics.quantum_states).map(([dimension, state]) => (
                    <div key={dimension} className={`rounded-lg p-3 ${getQuantumColor(state.probability)}`}>
                      <div className="text-sm font-medium mb-1">{dimension}</div>
                      <div className="text-xs space-y-1">
                        <div>진폭: {formatComplexNumber(state.amplitude)}</div>
                        <div>위상: {(state.phase * 180 / Math.PI).toFixed(1)}°</div>
                        <div>확률: {(state.probability * 100).toFixed(1)}%</div>
                        <div>결맞음: {(state.coherence * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 중첩 분석 */}
            {Object.keys(generatedMessage.analytics.superposition_analysis).length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">중첩 상태 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(generatedMessage.analytics.superposition_analysis).map(([dimension, analysis]) => (
                    <div key={dimension} className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-900 mb-1">{dimension}</div>
                      <div className="text-xs text-blue-800 space-y-1">
                        <div>확률: {((analysis as any).probability * 100).toFixed(1)}%</div>
                        <div>결맞음: {((analysis as any).coherence * 100).toFixed(1)}%</div>
                        <div>상태 수: {(analysis as any).state_count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 얽힘 분석 */}
            {generatedMessage.analytics.entanglement_metrics && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">양자 얽힘 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600">얽힘 점수</div>
                    <div className="text-lg font-semibold text-green-900">
                      {generatedMessage.analytics.entanglement_metrics.entanglement_score.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600">상관관계</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {generatedMessage.analytics.entanglement_metrics.correlation.toFixed(3)}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-600">비지역성</div>
                    <div className="text-lg font-semibold text-purple-900">
                      {generatedMessage.analytics.entanglement_metrics.nonlocality.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 양자 예측 결과 */}
            {Object.keys(generatedMessage.analytics.quantum_predictions).length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">양자 예측 결과</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(generatedMessage.analytics.quantum_predictions).map(([type, prediction]) => (
                    <div key={type} className="bg-orange-50 rounded-lg p-3">
                      <div className="text-sm text-orange-600">{type}</div>
                      <div className="text-lg font-semibold text-orange-900">
                        {((prediction as any).quantum_probability * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-orange-700 space-y-1">
                        <div>불확실성: {((prediction as any).uncertainty_principle * 100).toFixed(1)}%</div>
                        <div>얽힘 부스트: {((prediction as any).entanglement_boost * 100).toFixed(1)}%</div>
                        <div>양자 우위: {((prediction as any).quantum_advantage * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 양자 성능 메트릭 */}
            {generatedMessage.analytics.quantum_performance && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">양자 성능 메트릭</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-600">양자 정확도</div>
                    <div className="text-lg font-semibold text-purple-900">
                      {(generatedMessage.analytics.quantum_performance.quantum_accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600">결맞음 점수</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {(generatedMessage.analytics.quantum_performance.coherence_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600">얽힘 점수</div>
                    <div className="text-lg font-semibold text-green-900">
                      {(generatedMessage.analytics.quantum_performance.entanglement_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600">양자 우위</div>
                    <div className="text-lg font-semibold text-orange-900">
                      {(generatedMessage.analytics.quantum_performance.quantum_advantage * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <div className="text-sm text-indigo-600">전체 성능</div>
                    <div className="text-lg font-semibold text-indigo-900">
                      {(generatedMessage.analytics.quantum_performance.overall_quantum_performance * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigator.clipboard.writeText(generatedMessage.quantum_message)}
                className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                복사
              </button>
              <button
                onClick={() => {
                  setGeneratedMessage(null);
                  setOriginalMessage('');
                }}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumAISystem; 