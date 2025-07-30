import React, { useState, useEffect } from 'react';
import {
    LightBulbIcon,
    ChartBarIcon,
    AdjustmentsHorizontalIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface OptimizationSuggestion {
    id: string;
    type: 'tone' | 'clarity' | 'engagement' | 'structure' | 'empathy';
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    originalText: string;
    suggestedText: string;
    improvement: number;
}

interface AnalysisResult {
    overallScore: number;
    suggestions: OptimizationSuggestion[];
    metrics: {
        clarity: number;
        engagement: number;
        tone: number;
        empathy: number;
        structure: number;
    };
}

const ConversationOptimizer: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null);

    const analyzeText = async () => {
        if (!inputText.trim()) return;

        setIsAnalyzing(true);

        // 시뮬레이션된 분석 결과
        setTimeout(() => {
            const mockResult: AnalysisResult = {
                overallScore: Math.floor(Math.random() * 30) + 70,
                metrics: {
                    clarity: Math.floor(Math.random() * 20) + 75,
                    engagement: Math.floor(Math.random() * 25) + 70,
                    tone: Math.floor(Math.random() * 15) + 80,
                    empathy: Math.floor(Math.random() * 30) + 65,
                    structure: Math.floor(Math.random() * 20) + 75
                },
                suggestions: [
                    {
                        id: '1',
                        type: 'engagement',
                        severity: 'medium',
                        title: '참여도 향상',
                        description: '질문을 추가하여 상대방의 참여를 유도할 수 있습니다.',
                        originalText: inputText.substring(0, 50) + '...',
                        suggestedText: inputText.substring(0, 50) + '... 이에 대해 어떻게 생각하시나요?',
                        improvement: 15
                    },
                    {
                        id: '2',
                        type: 'tone',
                        severity: 'low',
                        title: '어조 개선',
                        description: '더 친근하고 따뜻한 어조로 메시지를 전달할 수 있습니다.',
                        originalText: '안녕하세요.',
                        suggestedText: '안녕하세요! 좋은 하루 보내고 계신가요?',
                        improvement: 12
                    },
                    {
                        id: '3',
                        type: 'clarity',
                        severity: 'high',
                        title: '명확성 향상',
                        description: '더 구체적이고 명확한 표현을 사용하면 이해도가 높아집니다.',
                        originalText: '그것에 대해서...',
                        suggestedText: '프로젝트 일정에 대해서...',
                        improvement: 20
                    }
                ]
            };

            setAnalysisResult(mockResult);
            setIsAnalyzing(false);
        }, 2000);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'tone': return <LightBulbIcon className="h-5 w-5" />;
            case 'clarity': return <ChartBarIcon className="h-5 w-5" />;
            case 'engagement': return <ArrowTrendingUpIcon className="h-5 w-5" />;
            case 'structure': return <AdjustmentsHorizontalIcon className="h-5 w-5" />;
            case 'empathy': return <LightBulbIcon className="h-5 w-5" />;
            default: return <LightBulbIcon className="h-5 w-5" />;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 75) return 'text-blue-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBackground = (score: number) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 75) return 'bg-blue-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                    <AdjustmentsHorizontalIcon className="h-8 w-8 text-purple-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">대화 최적화 도구</h1>
                        <p className="text-gray-600">AI 분석을 통해 대화 내용을 개선하고 최적화하세요</p>
                    </div>
                </div>
            </div>

            {/* 입력 영역 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">대화 내용 입력</h2>
                <div className="space-y-4">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="분석하고 싶은 대화 내용을 입력해주세요..."
                        className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {inputText.length}/1000 글자
                        </div>
                        <button
                            onClick={analyzeText}
                            disabled={!inputText.trim() || isAnalyzing}
                            className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>분석 중...</span>
                                </div>
                            ) : (
                                '분석 시작'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 분석 결과 */}
            {analysisResult && (
                <>
                    {/* 전체 점수 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">분석 결과</h2>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <div className="relative w-20 h-20">
                                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-gray-300"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className={getScoreColor(analysisResult.overallScore)}
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            fill="none"
                                            strokeDasharray={`${analysisResult.overallScore}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                                            {analysisResult.overallScore}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">전체 점수</h3>
                                    <p className="text-gray-600">
                                        {analysisResult.overallScore >= 90 ? '매우 우수' :
                                            analysisResult.overallScore >= 75 ? '우수' :
                                                analysisResult.overallScore >= 60 ? '보통' : '개선 필요'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-4 flex-1">
                                {Object.entries(analysisResult.metrics).map(([metric, score]) => (
                                    <div key={metric} className="text-center">
                                        <div className="text-lg font-bold text-gray-900">{score}</div>
                                        <div className="text-sm text-gray-600">
                                            {metric === 'clarity' ? '명확성' :
                                                metric === 'engagement' ? '참여도' :
                                                    metric === 'tone' ? '어조' :
                                                        metric === 'empathy' ? '공감도' : '구조'}
                                        </div>
                                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                            <div
                                                className={`h-1 rounded-full ${getScoreBackground(score)}`}
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 개선 제안 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">개선 제안</h2>
                        <div className="space-y-4">
                            {analysisResult.suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedOptimization === suggestion.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                                        }`}
                                    onClick={() => setSelectedOptimization(
                                        selectedOptimization === suggestion.id ? null : suggestion.id
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div className={`p-2 rounded-lg ${getSeverityColor(suggestion.severity)}`}>
                                                {getTypeIcon(suggestion.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(suggestion.severity)}`}>
                                                        {suggestion.severity === 'high' ? '높음' :
                                                            suggestion.severity === 'medium' ? '보통' : '낮음'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mt-1">{suggestion.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-medium text-green-600">+{suggestion.improvement}%</span>
                                        </div>
                                    </div>

                                    {selectedOptimization === suggestion.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">원본</h4>
                                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-gray-800">
                                                        {suggestion.originalText}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">개선안</h4>
                                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-800">
                                                        {suggestion.suggestedText}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex space-x-3">
                                                <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                                                    적용하기
                                                </button>
                                                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
                                                    복사하기
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* 도움말 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                    <LightBulbIcon className="h-6 w-6 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900">사용 팁</h3>
                        <ul className="mt-2 text-sm text-blue-800 space-y-1">
                            <li>• 완전한 문장이나 대화 단락을 입력하면 더 정확한 분석이 가능합니다</li>
                            <li>• 특정 상황이나 상대방을 고려한 맥락 정보를 포함하면 도움이 됩니다</li>
                            <li>• 제안된 개선안을 참고하여 자신만의 스타일로 수정할 수 있습니다</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationOptimizer; 