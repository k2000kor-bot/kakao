import React, { useState, useEffect } from 'react';
import { advancedAISystemAPI, AdvancedMessageRequest, AdvancedGeneratedMessage } from '../services/advancedAISystemAPI';

interface AdvancedAISystemProps {
  onMessageGenerated?: (message: any) => void;
}

const AdvancedAISystem: React.FC<AdvancedAISystemProps> = ({
  onMessageGenerated
}) => {
  const [originalMessage, setOriginalMessage] = useState<string>('');
  const [userId, setUserId] = useState<string>('advanced_user');
  const [context, setContext] = useState<string>('');
  const [recentMessages, setRecentMessages] = useState<string>('');
  const [learningEnabled, setLearningEnabled] = useState<boolean>(true);
  const [predictionEnabled, setPredictionEnabled] = useState<boolean>(true);
  const [generatedMessage, setGeneratedMessage] = useState<AdvancedGeneratedMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<boolean>(false);

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const isHealthy = await advancedAISystemAPI.checkStatus();
      setServerStatus(isHealthy);
    } catch (err) {
      setServerStatus(false);
    }
  };

  const generateAdvancedMessage = async () => {
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

      const request: AdvancedMessageRequest = {
        original_message: originalMessage,
        user_id: userId,
        context,
        recent_messages: recentMessagesArray,
        learning_enabled: learningEnabled,
        prediction_enabled: predictionEnabled
      };

      const message = await advancedAISystemAPI.generateAdvanced(request);
      setGeneratedMessage(message);
      onMessageGenerated?.(message);
    } catch (err) {
      setError('고급 메시지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: 'bg-yellow-100 text-yellow-800',
      anger: 'bg-red-100 text-red-800',
      sadness: 'bg-blue-100 text-blue-800',
      fear: 'bg-purple-100 text-purple-800',
      surprise: 'bg-orange-100 text-orange-800',
      disgust: 'bg-green-100 text-green-800',
      trust: 'bg-indigo-100 text-indigo-800',
      anticipation: 'bg-pink-100 text-pink-800',
      neutral: 'bg-gray-100 text-gray-800'
    };
    return colors[emotion] || colors.neutral;
  };

  const getPatternColor = (pattern: string) => {
    const colors: Record<string, string> = {
      question_response: 'bg-blue-100 text-blue-800',
      agreement_disagreement: 'bg-green-100 text-green-800',
      emotional_expression: 'bg-purple-100 text-purple-800',
      problem_solution: 'bg-orange-100 text-orange-800',
      social_interaction: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[pattern] || colors.general;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 고도화된 AI 시스템</h1>
        <p className="text-gray-600">실시간 학습, 감정 분석, 대화 패턴 분석, 예측 모델을 포함한 고급 AI 시스템입니다.</p>

        {/* 서버 상태 표시 */}
        <div className="mt-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${serverStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm ${serverStatus ? 'text-green-600' : 'text-red-600'}`}>
            {serverStatus ? '고급 AI 서버 연결됨' : '고급 AI 서버 연결 안됨'}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">메시지 입력</h2>

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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={learningEnabled}
                    onChange={(e) => setLearningEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">실시간 학습 활성화</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={predictionEnabled}
                    onChange={(e) => setPredictionEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">예측 모델 활성화</span>
                </label>
              </div>
            </div>

            <button
              onClick={generateAdvancedMessage}
              disabled={isLoading || !originalMessage.trim() || !serverStatus}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI 분석 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  고급 AI 메시지 생성
                </>
              )}
            </button>
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">고급 AI 기능</h2>

            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">실시간 감정 분석</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">대화 패턴 분석</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">사용자 행동 예측</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">자동 학습 시스템</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">성능 모니터링</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">맥락 기반 생성</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 생성된 메시지 및 분석 결과 */}
      {generatedMessage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">고급 AI 분석 결과</h2>

          <div className="space-y-8">
            {/* 생성된 메시지 */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">생성된 메시지</h3>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-gray-900">{generatedMessage.advanced_message}</p>
              </div>
            </div>

            {/* 감정 분석 */}
            {generatedMessage.analytics.emotion_analysis && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">감정 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600">주요 감정</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {generatedMessage.analytics.emotion_analysis.dominant_emotion}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600">감정 점수</div>
                    <div className="text-lg font-semibold text-green-900">
                      {(generatedMessage.analytics.emotion_analysis.sentiment_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-600">감정 안정성</div>
                    <div className="text-lg font-semibold text-purple-900">
                      {(generatedMessage.analytics.emotion_analysis.emotional_stability * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600">감정 신뢰도</div>
                    <div className="text-lg font-semibold text-orange-900">
                      {(generatedMessage.analytics.emotion_analysis.emotion_confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 패턴 분석 */}
            {generatedMessage.analytics.pattern_analysis && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">대화 패턴 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <div className="text-sm text-indigo-600">주요 패턴</div>
                    <div className="text-lg font-semibold text-indigo-900">
                      {generatedMessage.analytics.pattern_analysis.dominant_pattern}
                    </div>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3">
                    <div className="text-sm text-teal-600">패턴 효과성</div>
                    <div className="text-lg font-semibold text-teal-900">
                      {(generatedMessage.analytics.pattern_analysis.pattern_effectiveness * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3">
                    <div className="text-sm text-pink-600">대화 스타일</div>
                    <div className="text-lg font-semibold text-pink-900">
                      {generatedMessage.analytics.pattern_analysis.conversation_style}
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-sm text-yellow-600">참여도</div>
                    <div className="text-lg font-semibold text-yellow-900">
                      {(generatedMessage.analytics.pattern_analysis.interaction_patterns.engagement_level * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 예측 결과 */}
            {Object.keys(generatedMessage.analytics.prediction_results).length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">예측 결과</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedMessage.analytics.prediction_results.response_time && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="text-sm text-red-600">응답 시간 예측</div>
                      <div className="text-lg font-semibold text-red-900">
                        {generatedMessage.analytics.prediction_results.response_time.predicted_value.toFixed(1)}초
                      </div>
                      <div className="text-xs text-red-600">
                        신뢰도: {(generatedMessage.analytics.prediction_results.response_time.confidence_score * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {generatedMessage.analytics.prediction_results.success_rate && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm text-green-600">성공률 예측</div>
                      <div className="text-lg font-semibold text-green-900">
                        {(generatedMessage.analytics.prediction_results.success_rate.predicted_value * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-green-600">
                        신뢰도: {(generatedMessage.analytics.prediction_results.success_rate.confidence_score * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {generatedMessage.analytics.prediction_results.conflict_probability && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-sm text-orange-600">갈등 확률</div>
                      <div className="text-lg font-semibold text-orange-900">
                        {(generatedMessage.analytics.prediction_results.conflict_probability.predicted_value * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-orange-600">
                        신뢰도: {(generatedMessage.analytics.prediction_results.conflict_probability.confidence_score * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 학습 인사이트 */}
            {generatedMessage.analytics.learning_insights && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">AI 학습 인사이트</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">학습 권장사항</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {generatedMessage.analytics.learning_insights.learning_recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-blue-600 rounded-full mr-2"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">개선 영역</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      {generatedMessage.analytics.learning_insights.improvement_areas.map((area, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-green-600 rounded-full mr-2"></span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 성능 메트릭 */}
            {generatedMessage.analytics.performance_metrics && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">AI 성능 메트릭</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-600">예측 정확도</div>
                    <div className="text-lg font-semibold text-purple-900">
                      {(generatedMessage.analytics.performance_metrics.prediction_accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600">감정 인식 정확도</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {(generatedMessage.analytics.performance_metrics.emotion_recognition_accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600">패턴 인식 정확도</div>
                    <div className="text-lg font-semibold text-green-900">
                      {(generatedMessage.analytics.performance_metrics.pattern_recognition_accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600">전체 성능</div>
                    <div className="text-lg font-semibold text-orange-900">
                      {(generatedMessage.analytics.performance_metrics.overall_performance * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigator.clipboard.writeText(generatedMessage.advanced_message)}
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

export default AdvancedAISystem; 