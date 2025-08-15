import React, { useState, useEffect, useRef } from 'react';

// framer-motion이 설치되지 않은 경우를 위한 fallback
const motion = {
    div: (props: any) => React.createElement('div', props),
};
const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// 타입 정의
interface EmotionAnalysis {
    primary_emotion: string;
    secondary_emotions: string[];
    emotion_intensity: number;
    emotion_confidence: number;
    cross_modal_consistency: number;
}

interface UltraMessage {
    message_id: string;
    content: string;
    modality: string;
    ai_confidence: number;
    generation_method: string;
    model_ensemble_weights: { [key: string]: number };
    emotion_analysis: EmotionAnalysis;
    personalization_score: number;
    personality_match: number;
    effectiveness_prediction: number;
    engagement_probability: number;
    response_prediction: { [key: string]: number };
    generated_media?: { [key: string]: any };
    cross_modal_insights?: { [key: string]: any };
    security_applied: boolean;
    generation_time: number;
    timestamp: string;
}

interface RealtimeAnalysis {
    emotion?: {
        primary_emotion: string;
        emotion_intensity: number;
        emotion_confidence: number;
    };
    intent?: {
        primary_intent: string;
        intent_confidence: number;
        action_recommendations: string[];
    };
    personality?: {
        communication_style: { [key: string]: number };
        emotional_patterns: { [key: string]: number };
        personalization_score: number;
    };
    prediction?: {
        response_predictions: { [key: string]: number };
        engagement_probability: number;
    };
}

interface SystemStats {
    total_messages_generated: number;
    active_users: number;
    average_generation_time: number;
    model_performance: { [key: string]: number };
    quantum_security_active: boolean;
    multimodal_usage: { [key: string]: number };
}

const UltraAdvancedMessageInterface: React.FC = () => {
    // 상태 관리
    const [inputText, setInputText] = useState('');
    const [userId, setUserId] = useState('user_' + Math.random().toString(36).substr(2, 9));
    const [conversationHistory, setConversationHistory] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState<UltraMessage | null>(null);
    const [realtimeAnalysis, setRealtimeAnalysis] = useState<RealtimeAnalysis | null>(null);
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [streamingData, setStreamingData] = useState<string[]>([]);

    // 설정 상태
    const [securityLevel, setSecurityLevel] = useState<'standard' | 'high' | 'quantum'>('high');
    const [includeAudio, setIncludeAudio] = useState(false);
    const [includeImageSuggestion, setIncludeImageSuggestion] = useState(false);
    const [analysisTypes, setAnalysisTypes] = useState<string[]>(['emotion', 'intent']);

    // 파일 업로드
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 에러 상태
    const [error, setError] = useState<string | null>(null);

    // API 기본 URL
    const API_BASE = 'http://localhost:8010/api/v8';

    // 컴포넌트 마운트 시 시스템 통계 로드
    useEffect(() => {
        fetchSystemStats();
        const interval = setInterval(fetchSystemStats, 30000); // 30초마다 업데이트
        return () => clearInterval(interval);
    }, []);

    // 실시간 분석 (입력 텍스트 변경 시)
    useEffect(() => {
        if (inputText.length > 3) {
            const debounceTimer = setTimeout(() => {
                performRealtimeAnalysis();
            }, 1000);
            return () => clearTimeout(debounceTimer);
        }
    }, [inputText, analysisTypes]);

    // 시스템 통계 가져오기
    const fetchSystemStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/stats`);
            if (response.ok) {
                const stats = await response.json();
                setSystemStats(stats);
            }
        } catch (error) {
            console.error('시스템 통계 가져오기 실패:', error);
        }
    };

    // 실시간 분석 수행
    const performRealtimeAnalysis = async () => {
        if (!inputText.trim()) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch(`${API_BASE}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    user_id: userId,
                    analysis_types: analysisTypes
                })
            });

            if (response.ok) {
                const analysis = await response.json();
                setRealtimeAnalysis(analysis);
            }
        } catch (error) {
            console.error('실시간 분석 실패:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 초고도화 메시지 생성
    const generateUltraMessage = async () => {
        if (!inputText.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/ultra-generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    user_id: userId,
                    conversation_history: conversationHistory,
                    security_level: securityLevel,
                    include_audio: includeAudio,
                    include_image_suggestion: includeImageSuggestion,
                    metadata: {
                        interface_version: 'v8.0',
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (response.ok) {
                const message: UltraMessage = await response.json();
                setCurrentMessage(message);

                // 대화 기록 업데이트
                setConversationHistory(prev => [...prev, inputText, message.content]);

                // 입력 텍스트 초기화
                setInputText('');

                // 시스템 통계 업데이트
                fetchSystemStats();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || '메시지 생성 실패');
            }
        } catch (error) {
            setError('네트워크 오류가 발생했습니다.');
            console.error('메시지 생성 실패:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // 스트리밍 메시지 생성
    const generateStreamingMessage = async () => {
        if (!inputText.trim()) return;

        setStreamingData([]);
        setIsGenerating(true);

        try {
            const response = await fetch(`${API_BASE}/stream/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    user_id: userId,
                    conversation_history: conversationHistory,
                    security_level: securityLevel
                })
            });

            if (response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                setStreamingData(prev => [...prev, `${data.step}: ${data.progress || data.result || data.error}`]);
                            } catch (e) {
                                console.error('스트리밍 데이터 파싱 오류:', e);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            setError('스트리밍 메시지 생성 실패');
            console.error('스트리밍 실패:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // 파일 업로드 처리
    const handleFileUpload = async (file: File, type: 'image' | 'audio') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId);

        try {
            const response = await fetch(`${API_BASE}/upload/${type}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`${type} 분석 결과:`, result);
                // 분석 결과를 UI에 표시할 수 있음
            }
        } catch (error) {
            console.error(`${type} 업로드 실패:`, error);
        }
    };

    // 감정 강도에 따른 색상 반환
    const getEmotionColor = (emotion: string, intensity: number): string => {
        const emotionColors: { [key: string]: string } = {
            '기쁨': '#FFD700',
            '슬픔': '#4169E1',
            '분노': '#FF4500',
            '두려움': '#800080',
            '놀람': '#FF69B4',
            '중립': '#808080',
            '흥분': '#FF1493',
            '불안': '#8B4513',
            '자신감': '#32CD32'
        };

        const baseColor = emotionColors[emotion] || '#808080';
        return baseColor;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* 헤더 */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        🌟 초고도화 메시지 생성 시스템 v8.0
                    </h1>
                    <p className="text-gray-300">멀티모달 AI • 양자 보안 • 실시간 감정 분석 • 신경망 개인화</p>
                </motion.div>

                {/* 시스템 통계 */}
                {systemStats && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-blue-800/50 to-purple-800/50 rounded-xl p-6 mb-8 backdrop-blur-sm"
                    >
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                            📊 시스템 통계
                            {systemStats.quantum_security_active && (
                                <span className="ml-2 px-2 py-1 bg-green-500 rounded-full text-xs">🔐 양자보안</span>
                            )}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-cyan-400">{systemStats.total_messages_generated}</div>
                                <div className="text-sm text-gray-300">총 메시지</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{systemStats.active_users}</div>
                                <div className="text-sm text-gray-300">활성 사용자</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">
                                    {systemStats.average_generation_time.toFixed(2)}s
                                </div>
                                <div className="text-sm text-gray-300">평균 생성시간</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">
                                    {Object.values(systemStats.multimodal_usage).reduce((a, b) => a + b, 0)}
                                </div>
                                <div className="text-sm text-gray-300">멀티모달 처리</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 메인 인터페이스 */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* 입력 패널 */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm"
                        >
                            <h3 className="text-xl font-semibold mb-4">💬 메시지 입력</h3>

                            {/* 설정 */}
                            <div className="mb-4 space-y-3">
                                <div className="flex flex-wrap gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">보안 레벨</label>
                                        <select
                                            value={securityLevel}
                                            onChange={(e) => setSecurityLevel(e.target.value as any)}
                                            className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
                                            aria-label="보안 레벨 선택"
                                        >
                                            <option value="standard">표준</option>
                                            <option value="high">높음</option>
                                            <option value="quantum">양자</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">사용자 ID</label>
                                        <input
                                            type="text"
                                            value={userId}
                                            onChange={(e) => setUserId(e.target.value)}
                                            className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
                                            placeholder="user_001"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={includeAudio}
                                            onChange={(e) => setIncludeAudio(e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">음성 생성 포함</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={includeImageSuggestion}
                                            onChange={(e) => setIncludeImageSuggestion(e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">이미지 제안 포함</span>
                                    </label>
                                </div>
                            </div>

                            {/* 텍스트 입력 */}
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="메시지를 입력하세요... (실시간 감정 분석이 활성화됩니다)"
                                className="w-full h-32 bg-gray-700 text-white rounded-lg p-4 resize-none"
                            />

                            {/* 파일 업로드 */}
                            <div className="mt-4 mb-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,audio/*"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setUploadedFiles(files);
                                    }}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                >
                                    📎 파일 업로드 (이미지/음성)
                                </button>

                                {uploadedFiles.length > 0 && (
                                    <div className="mt-2 text-sm text-gray-300">
                                        업로드된 파일: {uploadedFiles.map(f => f.name).join(', ')}
                                    </div>
                                )}
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex gap-3">
                                <button
                                    onClick={generateUltraMessage}
                                    disabled={isGenerating || !inputText.trim()}
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                                >
                                    {isGenerating ? '🔄 생성 중...' : '🚀 초고도화 메시지 생성'}
                                </button>

                                <button
                                    onClick={generateStreamingMessage}
                                    disabled={isGenerating || !inputText.trim()}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                                >
                                    📡 스트리밍
                                </button>
                            </div>

                            {/* 에러 표시 */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200"
                                >
                                    ❌ {error}
                                </motion.div>
                            )}
                        </motion.div>

                        {/* 스트리밍 데이터 */}
                        {streamingData.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm"
                            >
                                <h3 className="text-xl font-semibold mb-4">📡 실시간 스트리밍</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {streamingData.map((data, index) => (
                                        <div key={index} className="text-sm text-gray-300 font-mono">
                                            {data}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* 분석 패널 */}
                    <div>
                        {/* 실시간 분석 */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm mb-6"
                        >
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                🔍 실시간 분석
                                {isAnalyzing && <span className="ml-2 animate-spin">⚙️</span>}
                            </h3>

                            {/* 분석 유형 선택 */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-300 mb-2">분석 유형</label>
                                <div className="space-y-2">
                                    {['emotion', 'intent', 'personality', 'prediction'].map(type => (
                                        <label key={type} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={analysisTypes.includes(type)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setAnalysisTypes(prev => [...prev, type]);
                                                    } else {
                                                        setAnalysisTypes(prev => prev.filter(t => t !== type));
                                                    }
                                                }}
                                                className="mr-2"
                                                aria-label={`${type} 분석 활성화`}
                                            />
                                            <span className="text-sm capitalize">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* 분석 결과 */}
                            {realtimeAnalysis && (
                                <div className="space-y-4">
                                    {realtimeAnalysis.emotion && (
                                        <div className="p-3 bg-gray-700/50 rounded-lg">
                                            <h4 className="font-medium mb-2">😊 감정 분석</h4>
                                            <div className="text-sm space-y-1">
                                                <div className="flex items-center">
                                                    <span
                                                        className="w-3 h-3 rounded-full mr-2"
                                                        style={{ backgroundColor: getEmotionColor(realtimeAnalysis.emotion.primary_emotion, realtimeAnalysis.emotion.emotion_intensity) }}
                                                    ></span>
                                                    <span>{realtimeAnalysis.emotion.primary_emotion}</span>
                                                </div>
                                                <div>강도: {(realtimeAnalysis.emotion.emotion_intensity * 100).toFixed(1)}%</div>
                                                <div>신뢰도: {(realtimeAnalysis.emotion.emotion_confidence * 100).toFixed(1)}%</div>
                                            </div>
                                        </div>
                                    )}

                                    {realtimeAnalysis.intent && (
                                        <div className="p-3 bg-gray-700/50 rounded-lg">
                                            <h4 className="font-medium mb-2">🎯 의도 분석</h4>
                                            <div className="text-sm space-y-1">
                                                <div>주요 의도: {realtimeAnalysis.intent.primary_intent}</div>
                                                <div>신뢰도: {(realtimeAnalysis.intent.intent_confidence * 100).toFixed(1)}%</div>
                                            </div>
                                        </div>
                                    )}

                                    {realtimeAnalysis.personality && (
                                        <div className="p-3 bg-gray-700/50 rounded-lg">
                                            <h4 className="font-medium mb-2">👤 성격 분석</h4>
                                            <div className="text-sm space-y-1">
                                                <div>개인화 점수: {(realtimeAnalysis.personality.personalization_score * 100).toFixed(1)}%</div>
                                                {Object.entries(realtimeAnalysis.personality.communication_style).slice(0, 3).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span>{key}:</span>
                                                        <span>{(value * 100).toFixed(0)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {realtimeAnalysis.prediction && (
                                        <div className="p-3 bg-gray-700/50 rounded-lg">
                                            <h4 className="font-medium mb-2">🔮 예측 분석</h4>
                                            <div className="text-sm space-y-1">
                                                <div>참여 확률: {(realtimeAnalysis.prediction.engagement_probability * 100).toFixed(1)}%</div>
                                                {Object.entries(realtimeAnalysis.prediction.response_predictions).slice(0, 3).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span>{key}:</span>
                                                        <span>{(value * 100).toFixed(0)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* 대화 기록 */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800/80 rounded-xl p-6 backdrop-blur-sm"
                        >
                            <h3 className="text-xl font-semibold mb-4">💬 대화 기록</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {conversationHistory.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg text-sm ${index % 2 === 0
                                            ? 'bg-blue-500/20 text-blue-200'
                                            : 'bg-green-500/20 text-green-200'
                                            }`}
                                    >
                                        <strong>{index % 2 === 0 ? '사용자' : 'AI'}:</strong> {message}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* 생성된 메시지 결과 */}
                <AnimatePresence>
                    {currentMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-8 bg-gradient-to-r from-green-800/50 to-blue-800/50 rounded-xl p-6 backdrop-blur-sm"
                        >
                            <h3 className="text-2xl font-semibold mb-4 flex items-center">
                                ✨ 생성된 초고도화 메시지
                                {currentMessage.security_applied && (
                                    <span className="ml-2 px-2 py-1 bg-green-500 rounded-full text-xs">🔐</span>
                                )}
                            </h3>

                            {/* 메시지 내용 */}
                            <div className="bg-gray-800/60 rounded-lg p-4 mb-4">
                                <p className="text-lg text-white leading-relaxed">{currentMessage.content}</p>
                            </div>

                            {/* 상세 분석 */}
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="font-medium mb-2 text-cyan-400">🤖 AI 신뢰도</h4>
                                    <div className="text-2xl font-bold">{(currentMessage.ai_confidence * 100).toFixed(1)}%</div>
                                    <div className="text-sm text-gray-300">생성 방법: {currentMessage.generation_method}</div>
                                </div>

                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="font-medium mb-2 text-purple-400">👤 개인화</h4>
                                    <div className="text-2xl font-bold">{(currentMessage.personalization_score * 100).toFixed(1)}%</div>
                                    <div className="text-sm text-gray-300">성격 일치: {(currentMessage.personality_match * 100).toFixed(1)}%</div>
                                </div>

                                <div className="bg-gray-700/50 rounded-lg p-4">
                                    <h4 className="font-medium mb-2 text-green-400">📈 효과성</h4>
                                    <div className="text-2xl font-bold">{(currentMessage.effectiveness_prediction * 100).toFixed(1)}%</div>
                                    <div className="text-sm text-gray-300">참여도: {(currentMessage.engagement_probability * 100).toFixed(1)}%</div>
                                </div>
                            </div>

                            {/* 감정 분석 */}
                            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                <h4 className="font-medium mb-3 text-yellow-400">😊 감정 분석</h4>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <span
                                            className="w-4 h-4 rounded-full mr-2"
                                            style={{ backgroundColor: getEmotionColor(currentMessage.emotion_analysis.primary_emotion, currentMessage.emotion_analysis.emotion_intensity) }}
                                        ></span>
                                        <span className="font-medium">{currentMessage.emotion_analysis.primary_emotion}</span>
                                    </div>
                                    <div className="text-sm text-gray-300">
                                        강도: {(currentMessage.emotion_analysis.emotion_intensity * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-300">
                                        신뢰도: {(currentMessage.emotion_analysis.emotion_confidence * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            {/* AI 모델 앙상블 */}
                            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                <h4 className="font-medium mb-3 text-orange-400">🧠 AI 모델 앙상블</h4>
                                <div className="space-y-2">
                                    {Object.entries(currentMessage.model_ensemble_weights).map(([model, weight]) => (
                                        <div key={model} className="flex justify-between items-center">
                                            <span className="capitalize">{model}</span>
                                            <div className="flex items-center">
                                                <div className="w-20 bg-gray-600 rounded-full h-2 mr-2">
                                                    <div
                                                        className="bg-orange-400 h-2 rounded-full"
                                                        style={{ width: `${weight * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm">{(weight * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 응답 예측 */}
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <h4 className="font-medium mb-3 text-pink-400">🔮 응답 예측</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(currentMessage.response_prediction).map(([type, probability]) => (
                                        <div key={type} className="flex justify-between">
                                            <span className="capitalize">{type.replace('_', ' ')}</span>
                                            <span>{(probability * 100).toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 메타데이터 */}
                            <div className="mt-4 pt-4 border-t border-gray-600 text-sm text-gray-400">
                                <div className="flex justify-between">
                                    <span>메시지 ID: {currentMessage.message_id}</span>
                                    <span>생성 시간: {currentMessage.generation_time.toFixed(3)}초</span>
                                    <span>모달리티: {currentMessage.modality}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UltraAdvancedMessageInterface; 