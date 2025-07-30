import React, { useState, useEffect } from 'react';
import {
    AdvancedMessageRequest,
    AdvancedGeneratedMessage,
    UserProfile,
    PerformanceAnalysis,
    AIModelPerformance,
    advancedMessageAPI
} from '../services/advancedMessageAPI';

const AdvancedMessageGenerationSystem: React.FC = () => {
    // 상태 관리
    const [originalMessage, setOriginalMessage] = useState('');
    const [sender, setSender] = useState('');
    const [chatRoomId, setChatRoomId] = useState('');
    const [targetAudience, setTargetAudience] = useState<string[]>([]);
    const [contextType, setContextType] = useState('일반');
    const [urgencyLevel, setUrgencyLevel] = useState('보통');
    const [messageLength, setMessageLength] = useState('중간');
    const [includeData, setIncludeData] = useState(false);
    const [includeExamples, setIncludeExamples] = useState(false);
    const [includeCallToAction, setIncludeCallToAction] = useState(false);
    const [personalizationLevel, setPersonalizationLevel] = useState('높음');
    const [aiModelPreference, setAiModelPreference] = useState('');
    const [emotionContext, setEmotionContext] = useState('');
    const [learningEnabled, setLearningEnabled] = useState(true);

    // 결과 상태
    const [generatedMessage, setGeneratedMessage] = useState<AdvancedGeneratedMessage | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [performanceAnalysis, setPerformanceAnalysis] = useState<PerformanceAnalysis | null>(null);
    const [aiModels, setAiModels] = useState<AIModelPerformance[]>([]);
    const [serverStatus, setServerStatus] = useState<{ status: string; version: string } | null>(null);

    // 컴포넌트 마운트 시 초기화
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // 서버 상태 확인
            const status = await advancedMessageAPI.checkServerStatus();
            setServerStatus(status);

            // AI 모델 성능 조회
            const models = await advancedMessageAPI.getAIModelPerformance();
            setAiModels(models);

            // 성능 분석 조회
            const performance = await advancedMessageAPI.getPerformanceAnalysis();
            setPerformanceAnalysis(performance);

            // 사용자 프로필 조회 (기본 사용자)
            const profile = await advancedMessageAPI.getUserProfile('default_user');
            setUserProfile(profile);
        } catch (error) {
            console.error('초기 데이터 로드 오류:', error);
        }
    };

    const handleGenerateMessage = async () => {
        if (!originalMessage.trim()) {
            alert('원본 메시지를 입력해주세요.');
            return;
        }

        setIsGenerating(true);

        try {
            const request: AdvancedMessageRequest = {
                original_message: originalMessage,
                sender: sender || 'default_user',
                chat_room_id: chatRoomId || 'default_room',
                target_audience: targetAudience.length > 0 ? targetAudience : ['일반'],
                context_type: contextType,
                urgency_level: urgencyLevel,
                message_length: messageLength,
                include_data: includeData,
                include_examples: includeExamples,
                include_call_to_action: includeCallToAction,
                personalization_level: personalizationLevel,
                ai_model_preference: aiModelPreference || undefined,
                emotion_context: emotionContext || undefined,
                learning_enabled: learningEnabled
            };

            const result = await advancedMessageAPI.generateAdvancedMessage(request);
            setGeneratedMessage(result);
        } catch (error) {
            console.error('메시지 생성 오류:', error);
            alert('메시지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLearningFeedback = async (feedback: number, success: boolean) => {
        if (!generatedMessage) return;

        try {
            await advancedMessageAPI.submitLearningFeedback({
                message_id: generatedMessage.id,
                user_feedback: feedback,
                success_indicator: success,
                improvement_suggestions: success ? '좋은 메시지입니다.' : '개선이 필요합니다.'
            });

            // 성능 분석 새로고침
            const performance = await advancedMessageAPI.getPerformanceAnalysis();
            setPerformanceAnalysis(performance);

            alert('학습 피드백이 제출되었습니다.');
        } catch (error) {
            console.error('학습 피드백 제출 오류:', error);
            alert('피드백 제출 중 오류가 발생했습니다.');
        }
    };

    const handleUpdateUserProfile = async () => {
        if (!userProfile) return;

        try {
            const result = await advancedMessageAPI.updateUserProfile(userProfile);
            if (result.success) {
                alert('사용자 프로필이 업데이트되었습니다.');
            } else {
                alert('프로필 업데이트에 실패했습니다.');
            }
        } catch (error) {
            console.error('프로필 업데이트 오류:', error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                <h1 className="text-3xl font-bold mb-2">고도화된 메시지 생성 시스템</h1>
                <p className="text-blue-100">AI 모델 통합, 감정 분석, 개인화, 실시간 학습 기능</p>
                {serverStatus && (
                    <div className="mt-4 flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${serverStatus.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                            서버: {serverStatus.status}
                        </span>
                        <span className="text-blue-100">버전: {serverStatus.version}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 입력 패널 */}
                <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">메시지 생성 설정</h2>

                    {/* 기본 정보 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                원본 메시지 *
                            </label>
                            <textarea
                                value={originalMessage}
                                onChange={(e) => setOriginalMessage(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                                placeholder="원본 메시지를 입력하세요..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    발신자
                                </label>
                                <input
                                    type="text"
                                    value={sender}
                                    onChange={(e) => setSender(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="발신자 ID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    채팅방 ID
                                </label>
                                <input
                                    type="text"
                                    value={chatRoomId}
                                    onChange={(e) => setChatRoomId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="채팅방 ID"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                컨텍스트 타입
                            </label>
                            <select
                                value={contextType}
                                onChange={(e) => setContextType(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="일반">일반</option>
                                <option value="건설">건설</option>
                                <option value="투자">투자</option>
                                <option value="갈등">갈등</option>
                                <option value="정보">정보</option>
                                <option value="승인">승인</option>
                                <option value="반대">반대</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    긴급도
                                </label>
                                <select
                                    value={urgencyLevel}
                                    onChange={(e) => setUrgencyLevel(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="낮음">낮음</option>
                                    <option value="보통">보통</option>
                                    <option value="높음">높음</option>
                                    <option value="매우 높음">매우 높음</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    메시지 길이
                                </label>
                                <select
                                    value={messageLength}
                                    onChange={(e) => setMessageLength(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="짧음">짧음</option>
                                    <option value="중간">중간</option>
                                    <option value="길음">길음</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                AI 모델 선택
                            </label>
                            <select
                                value={aiModelPreference}
                                onChange={(e) => setAiModelPreference(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">자동 선택</option>
                                {aiModels.map(model => (
                                    <option key={model.model_name} value={model.model_name}>
                                        {model.model_name} (성공률: {model.success_rate * 100}%)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                개인화 레벨
                            </label>
                            <select
                                value={personalizationLevel}
                                onChange={(e) => setPersonalizationLevel(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="낮음">낮음</option>
                                <option value="중간">중간</option>
                                <option value="높음">높음</option>
                            </select>
                        </div>

                        {/* 추가 옵션 */}
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={includeData}
                                    onChange={(e) => setIncludeData(e.target.checked)}
                                    className="mr-2"
                                />
                                데이터 포함
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={includeExamples}
                                    onChange={(e) => setIncludeExamples(e.target.checked)}
                                    className="mr-2"
                                />
                                예시 포함
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={includeCallToAction}
                                    onChange={(e) => setIncludeCallToAction(e.target.checked)}
                                    className="mr-2"
                                />
                                행동 촉구 포함
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={learningEnabled}
                                    onChange={(e) => setLearningEnabled(e.target.checked)}
                                    className="mr-2"
                                />
                                실시간 학습 활성화
                            </label>
                        </div>

                        <button
                            onClick={handleGenerateMessage}
                            disabled={isGenerating}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isGenerating ? '생성 중...' : '고도화된 메시지 생성'}
                        </button>
                    </div>
                </div>

                {/* 결과 패널 */}
                <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">생성 결과</h2>

                    {generatedMessage ? (
                        <div className="space-y-4">
                            {/* 생성된 메시지 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-800 mb-2">생성된 메시지</h3>
                                <p className="text-gray-700">{generatedMessage.generated_message}</p>
                            </div>

                            {/* AI 모델 정보 */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-medium text-blue-800 mb-2">AI 모델 정보</h3>
                                <p className="text-blue-700">사용된 모델: {generatedMessage.ai_model_used}</p>
                                <p className="text-blue-700">신뢰도: {(generatedMessage.confidence_score * 100).toFixed(1)}%</p>
                                <p className="text-blue-700">개인화 점수: {(generatedMessage.personalization_score * 100).toFixed(1)}%</p>
                                <p className="text-blue-700">영향력 예측: {generatedMessage.impact_prediction.toFixed(1)}%</p>
                            </div>

                            {/* 감정 분석 */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-medium text-green-800 mb-2">감정 분석</h3>
                                <p className="text-green-700">주요 감정: {generatedMessage.emotion_analysis.primary_emotion}</p>
                                <p className="text-green-700">감정 강도: {(generatedMessage.emotion_analysis.intensity * 100).toFixed(1)}%</p>
                                <p className="text-green-700">분석 신뢰도: {(generatedMessage.emotion_analysis.confidence * 100).toFixed(1)}%</p>
                            </div>

                            {/* 학습 인사이트 */}
                            {generatedMessage.learning_insights.length > 0 && (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-yellow-800 mb-2">학습 인사이트</h3>
                                    <ul className="text-yellow-700 space-y-1">
                                        {generatedMessage.learning_insights.map((insight, index) => (
                                            <li key={index} className="text-sm">• {insight}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 대안 메시지 */}
                            {generatedMessage.alternatives.length > 0 && (
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-purple-800 mb-2">대안 메시지</h3>
                                    <div className="space-y-2">
                                        {generatedMessage.alternatives.map((alternative, index) => (
                                            <div key={index} className="text-sm text-purple-700 p-2 bg-white rounded">
                                                {alternative}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 학습 피드백 */}
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h3 className="font-medium text-orange-800 mb-2">학습 피드백</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleLearningFeedback(5, true)}
                                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                    >
                                        매우 좋음 (5점)
                                    </button>
                                    <button
                                        onClick={() => handleLearningFeedback(3, true)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                    >
                                        보통 (3점)
                                    </button>
                                    <button
                                        onClick={() => handleLearningFeedback(1, false)}
                                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                    >
                                        개선 필요 (1점)
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            메시지를 생성하면 결과가 여기에 표시됩니다.
                        </div>
                    )}
                </div>
            </div>

            {/* 성능 분석 패널 */}
            {performanceAnalysis && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">성능 분석</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">{performanceAnalysis.average_feedback.toFixed(1)}</div>
                            <div className="text-sm text-blue-700">평균 피드백</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">{performanceAnalysis.total_messages}</div>
                            <div className="text-sm text-green-700">총 메시지 수</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-yellow-600">{(performanceAnalysis.success_rate * 100).toFixed(1)}%</div>
                            <div className="text-sm text-yellow-700">성공률</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {performanceAnalysis.improvement_needed ? '필요' : '불필요'}
                            </div>
                            <div className="text-sm text-red-700">개선 필요</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedMessageGenerationSystem; 