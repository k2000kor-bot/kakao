import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    AcademicCapIcon,
    CogIcon,
    ChartBarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    PauseIcon
} from '@heroicons/react/24/outline';

interface LearningModel {
    id: string;
    name: string;
    type: 'sentiment' | 'intent' | 'response' | 'pattern';
    accuracy: number;
    status: 'training' | 'ready' | 'error';
    lastUpdated: string;
    trainingProgress: number;
}

interface TrainingSession {
    id: string;
    modelId: string;
    startTime: string;
    duration: number;
    samples: number;
    accuracy: number;
    status: 'running' | 'completed' | 'failed';
}

const RealTimeAILearning: React.FC = () => {
    const [models, setModels] = useState<LearningModel[]>([]);
    const [activeSessions, setActiveSessions] = useState<TrainingSession[]>([]);
    const [isTraining, setIsTraining] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>('');

    // 샘플 데이터 로드
    useEffect(() => {
        const loadModels = () => {
            setModels([
                {
                    id: 'sentiment-v1',
                    name: '감정 분석 모델',
                    type: 'sentiment',
                    accuracy: 94.2,
                    status: 'ready',
                    lastUpdated: '2시간 전',
                    trainingProgress: 100
                },
                {
                    id: 'intent-v1',
                    name: '의도 분석 모델',
                    type: 'intent',
                    accuracy: 87.5,
                    status: 'training',
                    lastUpdated: '5분 전',
                    trainingProgress: 65
                },
                {
                    id: 'response-v1',
                    name: '응답 생성 모델',
                    type: 'response',
                    accuracy: 91.8,
                    status: 'ready',
                    lastUpdated: '1일 전',
                    trainingProgress: 100
                },
                {
                    id: 'pattern-v1',
                    name: '패턴 인식 모델',
                    type: 'pattern',
                    accuracy: 89.3,
                    status: 'error',
                    lastUpdated: '30분 전',
                    trainingProgress: 45
                }
            ]);
        };

        loadModels();
    }, []);

    const startTraining = (modelId: string) => {
        setIsTraining(true);
        setSelectedModel(modelId);

        const newSession: TrainingSession = {
            id: `session-${Date.now()}`,
            modelId,
            startTime: new Date().toISOString(),
            duration: 0,
            samples: 0,
            accuracy: 0,
            status: 'running'
        };

        setActiveSessions(prev => [...prev, newSession]);

        // 시뮬레이션된 학습 진행
        const interval = setInterval(() => {
            setActiveSessions(prev => prev.map(session => {
                if (session.modelId === modelId && session.status === 'running') {
                    return {
                        ...session,
                        duration: session.duration + 1,
                        samples: session.samples + Math.floor(Math.random() * 10) + 1,
                        accuracy: Math.min(95, session.accuracy + Math.random() * 2)
                    };
                }
                return session;
            }));
        }, 1000);

        // 30초 후 학습 완료
        setTimeout(() => {
            setActiveSessions(prev => prev.map(session =>
                session.modelId === modelId ? { ...session, status: 'completed' } : session
            ));
            setIsTraining(false);
            setSelectedModel('');
            clearInterval(interval);
        }, 30000);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ready':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'training':
                return <PlayIcon className="w-5 h-5 text-blue-500" />;
            case 'error':
                return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'training':
                return 'bg-blue-100 text-blue-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">실시간 AI 학습</h1>
                        <p className="text-gray-600">AI 모델 실시간 학습 및 최적화</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsTraining(!isTraining)}
                        disabled={isTraining}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${isTraining
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                    >
                        {isTraining ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                        <span>{isTraining ? '학습 중...' : '학습 시작'}</span>
                    </button>
                </div>
            </div>

            {/* 학습 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 모델</p>
                            <p className="text-2xl font-bold text-gray-900">{models.length}</p>
                        </div>
                        <AcademicCapIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">활성 세션</p>
                            <p className="text-2xl font-bold text-gray-900">{activeSessions.filter(s => s.status === 'running').length}</p>
                        </div>
                        <PlayIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">평균 정확도</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(models.reduce((sum, model) => sum + model.accuracy, 0) / models.length).toFixed(1)}%
                            </p>
                        </div>
                        <ChartBarIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">준비된 모델</p>
                            <p className="text-2xl font-bold text-gray-900">{models.filter(m => m.status === 'ready').length}</p>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>

            {/* AI 모델 목록 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 모델 관리</h3>
                <div className="space-y-4">
                    {models.map((model) => (
                        <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                        <CogIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{model.name}</h4>
                                        <p className="text-sm text-gray-600">타입: {model.type}</p>
                                        <p className="text-sm text-gray-500">마지막 업데이트: {model.lastUpdated}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{model.accuracy}% 정확도</p>
                                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${model.trainingProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(model.status)}
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(model.status)}`}>
                                            {model.status === 'ready' ? '준비됨' :
                                                model.status === 'training' ? '학습 중' : '오류'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => startTraining(model.id)}
                                        disabled={model.status === 'training' || isTraining}
                                        className={`px-3 py-1 rounded text-sm ${model.status === 'training' || isTraining
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        재학습
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 활성 학습 세션 */}
            {activeSessions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">활성 학습 세션</h3>
                    <div className="space-y-3">
                        {activeSessions.map((session) => (
                            <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {models.find(m => m.id === session.modelId)?.name} 학습 중
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            시작: {new Date(session.startTime).toLocaleTimeString()} |
                                            지속시간: {session.duration}초 |
                                            샘플: {session.samples.toLocaleString()}개
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{session.accuracy.toFixed(1)}% 정확도</p>
                                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${(session.duration / 30) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimeAILearning; 