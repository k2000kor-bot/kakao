import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
    selectAIEngine,
    selectRealtimeAnalysis,
    selectAIModels,
    selectIntelligentResponse,
    selectAdvancedAnalytics,
    selectAIErrors,
    initializeAIEngine,
    switchAIModel,
    startRealtimeAnalysis,
    analyzeSentiment,
    detectIntent,
    clearError
} from '../../store/slices/aiEngineSlice';
import {
    Activity,
    Brain,
    Zap,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    X,
    Settings,
    BarChart3,
    MessageSquare,
    Lightbulb,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIEngineMonitorProps {
    isOpen: boolean;
    onClose: () => void;
}

const AIEngineMonitor: React.FC<AIEngineMonitorProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const aiEngine = useSelector(selectAIEngine);
    const realtimeAnalysis = useSelector(selectRealtimeAnalysis);
    const aiModels = useSelector(selectAIModels);
    const intelligentResponse = useSelector(selectIntelligentResponse);
    const advancedAnalytics = useSelector(selectAdvancedAnalytics);
    const errors = useSelector(selectAIErrors);

    const [selectedTab, setSelectedTab] = useState<'overview' | 'models' | 'analytics' | 'settings'>('overview');
    const [testText, setTestText] = useState('');

    useEffect(() => {
        if (isOpen) {
            dispatch(initializeAIEngine());
        }
    }, [isOpen, dispatch]);

    const handleModelSwitch = (modelName: string) => {
        dispatch(switchAIModel(modelName));
    };

    const handleStartRealtimeAnalysis = () => {
        dispatch(startRealtimeAnalysis());
    };

    const handleSentimentAnalysis = () => {
        if (testText.trim()) {
            dispatch(analyzeSentiment(testText));
        }
    };

    const handleIntentDetection = () => {
        if (testText.trim()) {
            dispatch(detectIntent(testText));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return 'text-green-500';
            case 'connecting': return 'text-yellow-500';
            case 'error': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-500';
            case 'negative': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const tabs = [
        { id: 'overview', label: '개요', icon: BarChart3 },
        { id: 'models', label: 'AI 모델', icon: Brain },
        { id: 'analytics', label: '분석', icon: TrendingUp },
        { id: 'settings', label: '설정', icon: Settings },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 헤더 */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">AI 엔진 모니터</h2>
                                    <p className="text-sm text-gray-500">고급 AI 시스템 상태 및 제어</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* 탭 네비게이션 */}
                        <div className="flex border-b">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id as any)}
                                        className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${selectedTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 컨텐츠 */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                {selectedTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-6"
                                    >
                                        {/* 연결 상태 */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Activity className="w-5 h-5 text-blue-500" />
                                                    <span className="font-medium">연결 상태</span>
                                                </div>
                                                <div className={`text-lg font-semibold ${getStatusColor(aiEngine.websocket.connectionStatus)}`}>
                                                    {aiEngine.websocket.connectionStatus === 'connected' ? '연결됨' :
                                                        aiEngine.websocket.connectionStatus === 'connecting' ? '연결 중' :
                                                            aiEngine.websocket.connectionStatus === 'error' ? '오류' : '연결 끊김'}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Brain className="w-5 h-5 text-purple-500" />
                                                    <span className="font-medium">현재 모델</span>
                                                </div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {aiModels.currentModel}
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Zap className="w-5 h-5 text-yellow-500" />
                                                    <span className="font-medium">실시간 분석</span>
                                                </div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {realtimeAnalysis.isActive ? '활성' : '비활성'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 성능 지표 */}
                                        <div className="bg-white border rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">성능 지표</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {intelligentResponse.responseQuality}%
                                                    </div>
                                                    <div className="text-sm text-gray-500">응답 품질</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {intelligentResponse.contextUnderstanding}%
                                                    </div>
                                                    <div className="text-sm text-gray-500">컨텍스트 이해</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        {realtimeAnalysis.confidence}%
                                                    </div>
                                                    <div className="text-sm text-gray-500">분석 신뢰도</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-orange-600">
                                                        {realtimeAnalysis.processingTime}ms
                                                    </div>
                                                    <div className="text-sm text-gray-500">처리 시간</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 에러 상태 */}
                                        {errors.hasError && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                                    <span className="font-medium text-red-800">오류 발생</span>
                                                </div>
                                                <p className="text-red-700 mb-2">{errors.errorMessage}</p>
                                                <button
                                                    onClick={() => dispatch(clearError())}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    오류 해제
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {selectedTab === 'models' && (
                                    <motion.div
                                        key="models"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-white border rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">AI 모델 관리</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {aiModels.availableModels.map((model) => (
                                                    <div
                                                        key={model}
                                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${aiModels.currentModel === model
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        onClick={() => handleModelSwitch(model)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="font-medium text-gray-900">{model}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    성능: {aiModels.modelPerformance[model] || 0}%
                                                                </div>
                                                            </div>
                                                            {aiModels.currentModel === model && (
                                                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {aiModels.isModelLoading && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                                    <span className="text-blue-700">모델 전환 중...</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {selectedTab === 'analytics' && (
                                    <motion.div
                                        key="analytics"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-6"
                                    >
                                        {/* 실시간 분석 제어 */}
                                        <div className="bg-white border rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">실시간 분석</h3>
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={handleStartRealtimeAnalysis}
                                                    disabled={realtimeAnalysis.isActive}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${realtimeAnalysis.isActive
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                                        }`}
                                                >
                                                    {realtimeAnalysis.isActive ? '분석 중...' : '분석 시작'}
                                                </button>
                                                {realtimeAnalysis.isActive && (
                                                    <div className="flex items-center space-x-2 text-green-600">
                                                        <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span>실시간 분석 활성</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 감정 분석 테스트 */}
                                        <div className="bg-white border rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">감정 분석 테스트</h3>
                                            <div className="space-y-4">
                                                <textarea
                                                    value={testText}
                                                    onChange={(e) => setTestText(e.target.value)}
                                                    placeholder="분석할 텍스트를 입력하세요..."
                                                    className="w-full p-3 border rounded-lg resize-none"
                                                    rows={3}
                                                />
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleSentimentAnalysis}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                    >
                                                        감정 분석
                                                    </button>
                                                    <button
                                                        onClick={handleIntentDetection}
                                                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                                    >
                                                        의도 감지
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 분석 결과 */}
                                            {(advancedAnalytics.sentimentAnalysis.isActive || advancedAnalytics.intentRecognition.isActive) && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    {advancedAnalytics.sentimentAnalysis.isActive && (
                                                        <div className="mb-3">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <MessageSquare className="w-4 h-4 text-gray-500" />
                                                                <span className="font-medium">감정 분석 결과:</span>
                                                            </div>
                                                            <div className={`font-semibold ${getSentimentColor(advancedAnalytics.sentimentAnalysis.currentSentiment)}`}>
                                                                {advancedAnalytics.sentimentAnalysis.currentSentiment === 'positive' ? '긍정적' :
                                                                    advancedAnalytics.sentimentAnalysis.currentSentiment === 'negative' ? '부정적' : '중립적'}
                                                                ({advancedAnalytics.sentimentAnalysis.confidence}% 신뢰도)
                                                            </div>
                                                        </div>
                                                    )}

                                                    {advancedAnalytics.intentRecognition.isActive && (
                                                        <div>
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Target className="w-4 h-4 text-gray-500" />
                                                                <span className="font-medium">의도 감지 결과:</span>
                                                            </div>
                                                            <div className="font-semibold text-gray-900">
                                                                {advancedAnalytics.intentRecognition.detectedIntent}
                                                                ({advancedAnalytics.intentRecognition.confidence}% 신뢰도)
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {selectedTab === 'settings' && (
                                    <motion.div
                                        key="settings"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-white border rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-4">AI 엔진 설정</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        웹소켓 연결 URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        defaultValue={process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:5000/ws'}
                                                        className="w-full p-3 border rounded-lg"
                                                        readOnly
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        재연결 시도 횟수
                                                    </label>
                                                    <input
                                                        type="number"
                                                        defaultValue={5}
                                                        className="w-full p-3 border rounded-lg"
                                                        readOnly
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        하트비트 간격 (초)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        defaultValue={30}
                                                        className="w-full p-3 border rounded-lg"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIEngineMonitor;
