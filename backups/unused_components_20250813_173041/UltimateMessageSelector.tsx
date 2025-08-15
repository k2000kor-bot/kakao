import React, { useState, useEffect } from 'react';
import { ultimateMessageAPI, UltimateMessageRequest, MessageFormat, Strategy, Tone } from '../services/ultimateMessageAPI';

interface UltimateMessageSelectorProps {
  onMessageGenerated?: (message: any) => void;
}

const UltimateMessageSelector: React.FC<UltimateMessageSelectorProps> = ({
  onMessageGenerated
}) => {
  const [formats, setFormats] = useState<MessageFormat>({});
  const [strategies, setStrategies] = useState<Strategy>({});
  const [tones, setTones] = useState<Tone>({});
  const [selectedFormat, setSelectedFormat] = useState<string>('중립');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('일반');
  const [selectedTone, setSelectedTone] = useState<string>('중립');
  const [originalMessage, setOriginalMessage] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [recentMessages, setRecentMessages] = useState<string>('');
  const [userId, setUserId] = useState<string>('default');
  const [generatedMessage, setGeneratedMessage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const isHealthy = await ultimateMessageAPI.checkStatus();
      setServerStatus(isHealthy);
    } catch (err) {
      setServerStatus(false);
    }
  };

  const fetchData = async () => {
    try {
      const [formatsData, strategiesData, tonesData] = await Promise.all([
        ultimateMessageAPI.getFormats(),
        ultimateMessageAPI.getStrategies(),
        ultimateMessageAPI.getTones()
      ]);
      
      setFormats(formatsData);
      setStrategies(strategiesData);
      setTones(tonesData);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    }
  };

  const generateUltimateMessage = async () => {
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

      const request: UltimateMessageRequest = {
        original_message: originalMessage,
        format_type: selectedFormat,
        strategy_type: selectedStrategy,
        tone_type: selectedTone,
        user_id: userId,
        context,
        recent_messages: recentMessagesArray,
        include_analytics: true,
        include_history: true
      };

      const message = await ultimateMessageAPI.generateUltimate(request);
      setGeneratedMessage(message);
      onMessageGenerated?.(message);
    } catch (err) {
      setError('메시지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">궁극적 메시지 통합 시스템</h1>
        <p className="text-gray-600">모든 메시지 기능을 통합한 완전한 메시지 생성 시스템입니다.</p>

        {/* 서버 상태 표시 */}
        <div className="mt-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${serverStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm ${serverStatus ? 'text-green-600' : 'text-red-600'}`}>
            {serverStatus ? '서버 연결됨' : '서버 연결 안됨'}
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
        {/* 메시지 설정 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">메시지 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="message-format" className="block text-sm font-medium text-gray-700 mb-2">
                  메시지 형식
                </label>
                <select
                  id="message-format"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(formats).map(([key, description]) => (
                    <option key={key} value={key}>
                      {key} - {description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-2">
                  전략
                </label>
                <select
                  id="strategy"
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(strategies).map(([key, description]) => (
                    <option key={key} value={key}>
                      {key} - {description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                  톤
                </label>
                <select
                  id="tone"
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(tones).map(([key, description]) => (
                    <option key={key} value={key}>
                      {key} - {description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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

              <div>
                <label htmlFor="user-id" className="block text-sm font-medium text-gray-700 mb-2">
                  사용자 ID (선택사항)
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
            </div>

            <button
              onClick={generateUltimateMessage}
              disabled={isLoading || !originalMessage.trim() || !serverStatus}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  궁극적 메시지 생성
                </>
              )}
            </button>
          </div>
        </div>

        {/* 시스템 정보 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">시스템 정보</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">메시지 형식:</span>
                <span className="text-sm font-medium">{Object.keys(formats).length}가지</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">전략:</span>
                <span className="text-sm font-medium">{Object.keys(strategies).length}가지</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">톤:</span>
                <span className="text-sm font-medium">{Object.keys(tones).length}가지</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">사용자 프로필:</span>
                <span className="text-sm font-medium">지원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">실시간 분석:</span>
                <span className="text-sm font-medium">지원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">데이터베이스:</span>
                <span className="text-sm font-medium">SQLite</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 생성된 메시지 */}
      {generatedMessage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">생성된 메시지</h2>

          <div className="space-y-6">
            {/* 메시지 내용 */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">생성된 메시지</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{generatedMessage.generated_message}</p>
              </div>
            </div>

            {/* 분석 결과 */}
            {generatedMessage.analytics && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">분석 결과</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600">감정 점수</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {(generatedMessage.analytics.emotion_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600">감정 점수</div>
                    <div className="text-lg font-semibold text-green-900">
                      {(generatedMessage.analytics.sentiment_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-600">복잡도</div>
                    <div className="text-lg font-semibold text-purple-900">
                      {(generatedMessage.analytics.complexity_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600">영향도</div>
                    <div className="text-lg font-semibold text-orange-900">
                      {(generatedMessage.analytics.impact_prediction * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 키워드 */}
            {generatedMessage.analytics?.keywords && (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">키워드</h3>
                <div className="flex flex-wrap gap-2">
                  {generatedMessage.analytics.keywords.map((keyword: string, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigator.clipboard.writeText(generatedMessage.generated_message)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
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

export default UltimateMessageSelector; 