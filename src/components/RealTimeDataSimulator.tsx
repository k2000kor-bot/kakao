import React, { useState, useEffect, useCallback } from 'react';
import {
  StarIcon,
    PlayIcon,
    PauseIcon,
    ArrowPathIcon,
    CogIcon,
    ChartBarIcon,
    FireIcon,
    BoltIcon,
    EyeIcon,
    HeartIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    UsersIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    LightBulbIcon,
    HandRaisedIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    XCircleIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
    timestamp: number;
    persuasion_potential: number;
    emotional_impact: number;
    cognitive_load: number;
    neural_activation: number;
    manipulation_score: number;
    safety_score: number;
    message_count: number;
    active_participants: number;
    sentiment_score: number;
}

interface RealTimeDataSimulatorProps {
    onDataUpdate: (data: AnalyticsData) => void;
    isActive: boolean;
    onToggle: () => void;
}

const RealTimeDataSimulator: React.FC<RealTimeDataSimulatorProps> = ({
    onDataUpdate,
    isActive,
    onToggle
}) => {
    const [isRunning, setIsRunning] = useState(false);
    const [updateInterval, setUpdateInterval] = useState(1000);
    const [dataVariation, setDataVariation] = useState(0.1);
    const [currentData, setCurrentData] = useState<AnalyticsData>({
        timestamp: Date.now(),
        persuasion_potential: 0.75,
        emotional_impact: 0.68,
        cognitive_load: 0.45,
        neural_activation: 0.82,
        manipulation_score: 0.35,
        safety_score: 0.78,
        message_count: 156,
        active_participants: 12,
        sentiment_score: 0.72
    });

    const generateRandomVariation = useCallback((baseValue: number, variation: number) => {
        const min = Math.max(0, baseValue - variation);
        const max = Math.min(1, baseValue + variation);
        return Math.random() * (max - min) + min;
    }, []);

    const updateData = useCallback(() => {
        setCurrentData(prev => {
            const newData: AnalyticsData = {
                timestamp: Date.now(),
                persuasion_potential: generateRandomVariation(prev.persuasion_potential, dataVariation),
                emotional_impact: generateRandomVariation(prev.emotional_impact, dataVariation),
                cognitive_load: generateRandomVariation(prev.cognitive_load, dataVariation),
                neural_activation: generateRandomVariation(prev.neural_activation, dataVariation),
                manipulation_score: generateRandomVariation(prev.manipulation_score, dataVariation),
                safety_score: generateRandomVariation(prev.safety_score, dataVariation),
                message_count: prev.message_count + Math.floor(Math.random() * 3),
                active_participants: Math.max(1, prev.active_participants + Math.floor(Math.random() * 3) - 1),
                sentiment_score: generateRandomVariation(prev.sentiment_score, dataVariation)
            };

            onDataUpdate(newData);
            return newData;
        });
    }, [dataVariation, generateRandomVariation, onDataUpdate]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            interval = setInterval(updateData, updateInterval);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRunning, updateInterval, updateData]);

    const startSimulation = () => {
        setIsRunning(true);
    };

    const stopSimulation = () => {
        setIsRunning(false);
    };

    const resetData = () => {
        setCurrentData({
            timestamp: Date.now(),
            persuasion_potential: 0.75,
            emotional_impact: 0.68,
            cognitive_load: 0.45,
            neural_activation: 0.82,
            manipulation_score: 0.35,
            safety_score: 0.78,
            message_count: 156,
            active_participants: 12,
            sentiment_score: 0.72
        });
    };

    if (!isActive) {
        return (
            <div className="fixed bottom-4 left-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>데이터 시뮬레이터</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-80">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-t-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <ChartBarIcon className="w-6 h-6" />
                            <h3 className="font-semibold">실시간 데이터 시뮬레이터</h3>
                        </div>
                        <button
                            onClick={onToggle}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    {/* 컨트롤 패널 */}
                    <div className="flex space-x-2">
                        <button
                            onClick={isRunning ? stopSimulation : startSimulation}
                            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${isRunning
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                        >
                            {isRunning ? (
                                <>
                                    <PauseIcon className="w-4 h-4" />
                                    <span>정지</span>
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="w-4 h-4" />
                                    <span>시작</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={resetData}
                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* 설정 옵션 */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                업데이트 간격 (ms)
                            </label>
                            <input
                                type="range"
                                min="500"
                                max="5000"
                                step="500"
                                value={updateInterval}
                                onChange={(e) => setUpdateInterval(Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {updateInterval}ms
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                데이터 변동성
                            </label>
                            <input
                                type="range"
                                min="0.05"
                                max="0.3"
                                step="0.05"
                                value={dataVariation}
                                onChange={(e) => setDataVariation(Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                ±{(dataVariation * 100).toFixed(0)}%
                            </div>
                        </div>
                    </div>

                    {/* 현재 데이터 미리보기 */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            현재 데이터
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">설득력:</span>
                                <span className="font-medium">{(currentData.persuasion_potential * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">감정적 영향:</span>
                                <span className="font-medium">{(currentData.emotional_impact * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">인지 부하:</span>
                                <span className="font-medium">{(currentData.cognitive_load * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">신경 활성화:</span>
                                <span className="font-medium">{(currentData.neural_activation * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">조작도:</span>
                                <span className="font-medium">{(currentData.manipulation_score * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">안전도:</span>
                                <span className="font-medium">{(currentData.safety_score * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">메시지 수:</span>
                                <span className="font-medium">{currentData.message_count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">활성 참여자:</span>
                                <span className="font-medium">{currentData.active_participants}</span>
                            </div>
                        </div>
                    </div>

                    {/* 상태 표시 */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className={isRunning ? 'text-green-600' : 'text-gray-500'}>
                                {isRunning ? '실행 중' : '정지됨'}
                            </span>
                        </div>
                        <div className="text-gray-500">
                            {new Date(currentData.timestamp).toLocaleTimeString('ko-KR')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RealTimeDataSimulator; 