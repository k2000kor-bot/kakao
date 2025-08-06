import React, { useState, useEffect } from 'react';
import { Activity, Brain, MessageCircle, TrendingUp, Zap, Database } from 'lucide-react';

interface RealtimeData {
    current_time: string;
    active_sessions: number;
    messages_per_minute: number;
    ai_processing_queue: number;
    system_load: {
        cpu: number;
        memory: number;
        ai_models: number;
    };
    emotion_distribution: {
        positive: number;
        neutral: number;
        negative: number;
    };
    learning_stats: {
        files_processed: number;
        knowledge_entries: number;
        model_updates: number;
    };
}

interface RealTimeDashboardProps {
    isVisible?: boolean;
    onClose?: () => void;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
    isVisible = false,
    onClose
}) => {
    const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRealtimeData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8000/api/v7/analytics/realtime');
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setRealtimeData(data.realtime_data);
                }
            }
        } catch (err) {
            setError('실시간 데이터를 가져오는 중 오류가 발생했습니다.');
            console.error('실시간 분석 데이터 오류:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            fetchRealtimeData();

            // 5초마다 데이터 업데이트
            const interval = setInterval(fetchRealtimeData, 5000);
            return () => clearInterval(interval);
        }
    }, [isVisible]);

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('ko-KR');
    };

    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case 'positive': return 'text-green-600';
            case 'negative': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getLoadColor = (load: number) => {
        if (load < 0.3) return 'bg-green-500';
        if (load < 0.7) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getProgressBarWidth = (load: number) => `${load * 100}%`;

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Activity className="mr-2" size={28} />
                            실시간 AI 분석 대시보드
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    {realtimeData && (
                        <p className="text-sm text-gray-600 mt-2">
                            마지막 업데이트: {formatTime(realtimeData.current_time)}
                        </p>
                    )}
                </div>

                <div className="p-6">
                    {isLoading && !realtimeData && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchRealtimeData}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {realtimeData && (
                        <div className="space-y-6">
                            {/* 시스템 상태 */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <MessageCircle className="text-blue-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">활성 세션</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {realtimeData.active_sessions}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <TrendingUp className="text-green-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">분당 메시지</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {realtimeData.messages_per_minute}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Brain className="text-purple-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">AI 처리 대기</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                {realtimeData.ai_processing_queue}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Database className="text-orange-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">지식 항목</p>
                                            <p className="text-xl font-bold text-orange-600">
                                                {realtimeData.learning_stats.knowledge_entries}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 시스템 부하 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Zap className="mr-2" size={20} />
                                    시스템 부하
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">CPU</span>
                                            <span className="text-sm font-medium">
                                                {(realtimeData.system_load.cpu * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getLoadColor(realtimeData.system_load.cpu)}`}
                                                style={{ width: getProgressBarWidth(realtimeData.system_load.cpu) }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">메모리</span>
                                            <span className="text-sm font-medium">
                                                {(realtimeData.system_load.memory * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getLoadColor(realtimeData.system_load.memory)}`}
                                                style={{ width: getProgressBarWidth(realtimeData.system_load.memory) }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">AI 모델</span>
                                            <span className="text-sm font-medium">
                                                {(realtimeData.system_load.ai_models * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getLoadColor(realtimeData.system_load.ai_models)}`}
                                                style={{ width: getProgressBarWidth(realtimeData.system_load.ai_models) }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 감정 분포 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">감정 분포</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {Object.entries(realtimeData.emotion_distribution).map(([emotion, value]) => (
                                        <div key={emotion} className="text-center">
                                            <div className={`text-2xl font-bold ${getEmotionColor(emotion)}`}>
                                                {(value * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-sm text-gray-600 capitalize">
                                                {emotion === 'positive' ? '긍정' : emotion === 'negative' ? '부정' : '중립'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 학습 통계 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">AI 학습 통계</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {realtimeData.learning_stats.files_processed}
                                        </div>
                                        <div className="text-sm text-gray-600">처리된 파일</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {realtimeData.learning_stats.knowledge_entries}
                                        </div>
                                        <div className="text-sm text-gray-600">지식 항목</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {realtimeData.learning_stats.model_updates}
                                        </div>
                                        <div className="text-sm text-gray-600">모델 업데이트</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-600">
                            <div className={`w-2 h-2 rounded-full mr-2 ${realtimeData ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {realtimeData ? '연결됨' : '연결 끊김'}
                        </div>
                        <button
                            onClick={fetchRealtimeData}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeDashboard;