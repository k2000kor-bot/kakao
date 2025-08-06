import React, { useState, useEffect } from 'react';
import { enhancedMessageAPI, EnhancedMessageFormatRequest, UserProfileRequest } from '../services/enhancedMessageAPI';

interface EnhancedMessageFormatSelectorProps {
    onMessageGenerated?: (message: any) => void;
}

const EnhancedMessageFormatSelector: React.FC<EnhancedMessageFormatSelectorProps> = ({
    onMessageGenerated
}) => {
    const [formats, setFormats] = useState<Record<string, string>>({});
    const [selectedFormat, setSelectedFormat] = useState<string>('중립');
    const [originalMessage, setOriginalMessage] = useState<string>('');
    const [context, setContext] = useState<string>('');
    const [recentMessages, setRecentMessages] = useState<string>('');
    const [userId, setUserId] = useState<string>('default');
    const [generatedMessage, setGeneratedMessage] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [serverStatus, setServerStatus] = useState<boolean>(false);
    const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

    useEffect(() => {
        fetchMessageFormats();
        checkServerStatus();
    }, []);

    const checkServerStatus = async () => {
        try {
            const isHealthy = await enhancedMessageAPI.checkStatus();
            setServerStatus(isHealthy);
        } catch (err) {
            setServerStatus(false);
        }
    };

    const fetchMessageFormats = async () => {
        try {
            const formatsData = await enhancedMessageAPI.getFormats();
            setFormats(formatsData);
        } catch (err) {
            setError('메시지 형식을 불러오는데 실패했습니다.');
        }
    };

    const generateEnhancedMessage = async () => {
        if (!originalMessage.trim()) {
            setError('원본 메시지를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // 최근 메시지 파싱
            const recentMessagesArray = recentMessages
                ? recentMessages.split('\n')
                    .filter(msg => msg.trim())
                    .map(msg => ({ content: msg.trim(), sender: 'user', timestamp: new Date().toISOString() }))
                : [];

            const message = await enhancedMessageAPI.generateEnhanced(
                selectedFormat,
                originalMessage,
                context,
                recentMessagesArray,
                userId
            );

            setGeneratedMessage(message);
            onMessageGenerated?.(message);
        } catch (err) {
            setError('메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserProfile = async () => {
        try {
            const request: UserProfileRequest = {
                user_id: userId,
                preferred_formats: [selectedFormat],
                communication_style: 'neutral'
            };

            await enhancedMessageAPI.updateProfile(request);
            alert('사용자 프로필이 업데이트되었습니다.');
        } catch (err) {
            setError('프로필 업데이트에 실패했습니다.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">향상된 메시지 형태 선택기</h1>
                <p className="text-gray-600">AI가 개인화된 최적의 응답을 생성합니다. 사용자 프로필과 실시간 분석을 통해 더 정확한 메시지를 제공합니다.</p>

                {/* 서버 상태 표시 */}
                <div className="mt-4 flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${serverStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm ${serverStatus ? 'text-green-600' : 'text-red-600'}`}>
                        {serverStatus ? '향상된 서버 연결됨' : '향상된 서버 연결 안됨'}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 입력 영역 */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">메시지 설정</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    사용자 ID
                                </label>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="사용자 ID를 입력하세요"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    메시지 형식
                                </label>
                                <select
                                    value={selectedFormat}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    aria-label="메시지 형식 선택"
                                >
                                    {Object.entries(formats).map(([key, description]) => (
                                        <option key={key} value={key}>
                                            {key} - {description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    원본 메시지
                                </label>
                                <textarea
                                    value={originalMessage}
                                    onChange={(e) => setOriginalMessage(e.target.value)}
                                    placeholder="원본 메시지를 입력하세요"
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    맥락 (선택사항)
                                </label>
                                <input
                                    type="text"
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    placeholder="대화 맥락을 입력하세요"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    최근 메시지들 (선택사항)
                                </label>
                                <textarea
                                    value={recentMessages}
                                    onChange={(e) => setRecentMessages(e.target.value)}
                                    placeholder="최근 대화 내용을 한 줄씩 입력하세요"
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={generateEnhancedMessage}
                                disabled={isLoading || !originalMessage.trim() || !serverStatus}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
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
                                        향상된 메시지 생성
                                    </>
                                )}
                            </button>

                            <button
                                onClick={updateUserProfile}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                프로필 저장
                            </button>
                        </div>
                    </div>
                </div>

                {/* 결과 영역 */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">생성된 메시지</h2>

                        {generatedMessage ? (
                            <div className="space-y-6">
                                {/* 메시지 표시 */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">선택된 형식</span>
                                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {generatedMessage.format_type}
                                        </span>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-900">{generatedMessage.generated_message}</pre>
                                    </div>
                                </div>

                                {/* 분석 결과 */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="text-md font-semibold text-gray-900 mb-3">실시간 분석 결과</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-blue-600">
                                                {(generatedMessage.analytics.emotion_score * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-gray-600">감정 점수</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-green-600">
                                                {(generatedMessage.analytics.sentiment_score * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-gray-600">감정 점수</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-purple-600">
                                                {(generatedMessage.analytics.complexity_score * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-gray-600">복잡도</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-orange-600">
                                                {(generatedMessage.analytics.impact_prediction * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-gray-600">영향도 예측</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 상세 분석 */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-md font-semibold text-gray-900 mb-3">상세 분석</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">키워드</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {generatedMessage.analytics.keywords.map((keyword: string, index: number) => (
                                                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">스타일</h4>
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="font-medium">톤:</span> {generatedMessage.analytics.tone}
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">형식성:</span> {generatedMessage.analytics.formality_level}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 맥락 분석 */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="text-md font-semibold text-gray-900 mb-3">맥락 분석</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-green-600">
                                                {generatedMessage.context_analysis.total_messages}
                                            </div>
                                            <div className="text-xs text-gray-600">총 메시지</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-blue-600">
                                                {generatedMessage.context_analysis.context_length}
                                            </div>
                                            <div className="text-xs text-gray-600">맥락 길이</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-purple-600">
                                                {generatedMessage.context_analysis.overall_sentiment}
                                            </div>
                                            <div className="text-xs text-gray-600">전체 감정</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-orange-600">
                                                {generatedMessage.context_analysis.positive_count + generatedMessage.context_analysis.negative_count}
                                            </div>
                                            <div className="text-xs text-gray-600">감정 메시지</div>
                                        </div>
                                    </div>
                                </div>

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
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-gray-500">향상된 메시지를 생성하면 여기에 표시됩니다.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedMessageFormatSelector; 