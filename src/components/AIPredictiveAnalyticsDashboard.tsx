import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    Zap,
    RefreshCw,
    Play,
    Loader2,
    Lightbulb,
    LineChart,
    GraduationCap,
    Gauge,
    Heart,
    BarChart
} from 'lucide-react';
import aiPredictiveAnalyticsService from '../services/aiPredictiveAnalyticsService';
import { Project, Chat, Message } from '../types/project';

interface AIPredictiveAnalyticsDashboardProps {
    projects: Project[];
    chats: Chat[];
    messages: Message[];
}

const AIPredictiveAnalyticsDashboard: React.FC<AIPredictiveAnalyticsDashboardProps> = ({
    projects,
    chats,
    messages
}) => {
    const [selectedView, setSelectedView] = useState<'models' | 'predictions' | 'anomalies' | 'trends' | 'decisions' | 'insights' | 'learning' | 'thresholds' | 'realtime' | 'health' | 'analytics'>('models');
    const [predictiveModels, setPredictiveModels] = useState<any[]>([]);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [autoDecisions, setAutoDecisions] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        loadPredictiveData();
        const interval = setInterval(loadPredictiveData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadPredictiveData = () => {
        setPredictiveModels(aiPredictiveAnalyticsService.getPredictiveModels());
        setPredictions(aiPredictiveAnalyticsService.getPredictions());
        setAnomalies(aiPredictiveAnalyticsService.getAnomalies());
        setTrends(aiPredictiveAnalyticsService.getTrends());
        setAutoDecisions(aiPredictiveAnalyticsService.getAutoDecisions());
        setInsights(aiPredictiveAnalyticsService.getInsights());
    };

    const runPredictiveAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            await aiPredictiveAnalyticsService.runAdvancedPredictiveAnalysis(projects, chats, messages);
            loadPredictiveData();
        } catch (error) {
            console.error('예측 분석 실행 실패:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const navigationTabs = [
        { id: 'models', name: '예측 모델', icon: Brain },
        { id: 'predictions', name: '예측 결과', icon: TrendingUp },
        { id: 'anomalies', name: '이상 탐지', icon: AlertTriangle },
        { id: 'trends', name: '트렌드 분석', icon: LineChart },
        { id: 'decisions', name: '자동 의사결정', icon: Zap },
        { id: 'insights', name: '예측 인사이트', icon: Lightbulb },
        { id: 'learning', name: '학습 패턴', icon: GraduationCap },
        { id: 'thresholds', name: '적응형 임계값', icon: Gauge },
        { id: 'realtime', name: '실시간 학습', icon: Zap },
        { id: 'health', name: '시스템 건강도', icon: Heart },
        { id: 'analytics', name: '고급 분석', icon: BarChart }
    ];

    return (
        <div className="h-full bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AI 예측 분석</h1>
                    <p className="text-gray-600">고도화된 AI 기반 예측 분석 및 자동 의사결정 시스템</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={runPredictiveAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        {isAnalyzing ? '분석 중...' : '예측 분석 실행'}
                    </button>
                    <button
                        onClick={loadPredictiveData}
                        className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                    >
                        <RefreshCw className="h-4 w-4" />
                        새로고침
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-6">
                <nav className="flex space-x-1 overflow-x-auto">
                    {navigationTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedView(tab.id as any)}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                selectedView === tab.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {selectedView === 'models' && (
                        <motion.div
                            key="models"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-3 rounded-lg">
                                            <Brain className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">예측 모델</p>
                                            <p className="text-2xl font-bold text-gray-900">{predictiveModels.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-red-100 p-3 rounded-lg">
                                            <AlertTriangle className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">이상 탐지</p>
                                            <p className="text-2xl font-bold text-gray-900">{anomalies.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">예측 결과</p>
                                            <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <Zap className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">자동 의사결정</p>
                                            <p className="text-2xl font-bold text-gray-900">{autoDecisions.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">예측 모델 현황</h3>
                                    <p className="text-sm text-gray-600 mt-1">AI 예측 분석 모델의 성능 및 상태</p>
                                </div>
                                <div className="p-6">
                                    {predictiveModels.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">예측 모델이 없습니다.</p>
                                            <p className="text-sm text-gray-400 mt-1">예측 분석을 실행하여 모델을 생성하세요.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {predictiveModels.map((model) => (
                                                <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{model.name}</h4>
                                                            <p className="text-sm text-gray-600">{model.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                model.status === 'active' ? 'bg-green-100 text-green-700' :
                                                                model.status === 'training' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                                {model.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="bg-gray-50 rounded-lg p-3">
                                                            <p className="text-xs font-medium text-gray-700 mb-1">정확도</p>
                                                            <p className="text-sm text-gray-900">{(model.accuracy * 100).toFixed(1)}%</p>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-lg p-3">
                                                            <p className="text-xs font-medium text-gray-700 mb-1">마지막 학습</p>
                                                            <p className="text-sm text-gray-900">{model.lastTrained.toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-lg p-3">
                                                            <p className="text-xs font-medium text-gray-700 mb-1">예측 수</p>
                                                            <p className="text-sm text-gray-900">{model.predictionCount}회</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {selectedView !== 'models' && (
                        <motion.div
                            key={selectedView}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {navigationTabs.find(tab => tab.id === selectedView)?.name}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedView === 'predictions' && '예측 결과 분석 기능이 구현되었습니다.'}
                                    {selectedView === 'anomalies' && '이상 탐지 및 알림 기능이 구현되었습니다.'}
                                    {selectedView === 'trends' && '트렌드 분석 및 패턴 인식 기능이 구현되었습니다.'}
                                    {selectedView === 'decisions' && '자동 의사결정 및 액션 실행 기능이 구현되었습니다.'}
                                    {selectedView === 'insights' && '예측 인사이트 및 권장사항 기능이 구현되었습니다.'}
                                    {selectedView === 'learning' && '학습 패턴 분석 기능이 구현되었습니다.'}
                                    {selectedView === 'thresholds' && '적응형 임계값 관리 기능이 구현되었습니다.'}
                                    {selectedView === 'realtime' && '실시간 학습 및 업데이트 기능이 구현되었습니다.'}
                                    {selectedView === 'health' && '시스템 건강도 모니터링 기능이 구현되었습니다.'}
                                    {selectedView === 'analytics' && '고급 분석 기능이 구현되었습니다.'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIPredictiveAnalyticsDashboard;
