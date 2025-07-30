import React, { useState, useEffect, useRef } from 'react';
import {
    CpuChipIcon,
    ChartBarIcon,
    BoltIcon,
    EyeIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    ClockIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface RealTimeAnalysis {
    messageId: string;
    analysis: {
        sentiment: 'positive' | 'negative' | 'neutral';
        intent: string;
        urgency: 'high' | 'medium' | 'low';
        responseType: string;
        suggestedActions: string[];
        riskLevel: 'low' | 'medium' | 'high';
    };
    recommendations: {
        immediate: string[];
        strategic: string[];
        longTerm: string[];
    };
    patterns: {
        frequency: number;
        trend: 'increasing' | 'decreasing' | 'stable';
        participants: string[];
    };
}

interface RealTimeAIAnalysisProps {
    selectedMessage?: any;
    chatHistory?: any[];
    onRecommendationSelect?: (recommendation: string) => void;
}

const RealTimeAIAnalysis: React.FC<RealTimeAIAnalysisProps> = ({
    selectedMessage,
    chatHistory = [],
    onRecommendationSelect = () => { }
}) => {
    const [analysis, setAnalysis] = useState<RealTimeAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [autoAnalysis, setAutoAnalysis] = useState(true);
    const [analysisHistory, setAnalysisHistory] = useState<RealTimeAnalysis[]>([]);
    const [insights, setInsights] = useState<string[]>([]);
    const analysisRef = useRef<NodeJS.Timeout | null>(null);

    // 실시간 분석 시뮬레이션
    const simulateRealTimeAnalysis = async (message: any) => {
        setIsAnalyzing(true);

        // 실제 API 호출을 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockAnalysis: RealTimeAnalysis = {
            messageId: message.id,
            analysis: {
                sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
                intent: ['정보 요청', '의견 제시', '감정 표현', '행동 요구'][Math.floor(Math.random() * 4)],
                urgency: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
                responseType: ['즉시 응답', '전략적 대응', '관찰 후 대응'][Math.floor(Math.random() * 3)],
                suggestedActions: [
                    '공감 표현하기',
                    '구체적 정보 제공',
                    '추가 질문하기',
                    '해결책 제시'
                ],
                riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
            },
            recommendations: {
                immediate: [
                    '즉시 공감 표현',
                    '구체적 답변 제공',
                    '추가 질문으로 관심 표시'
                ],
                strategic: [
                    '장기적 관계 구축',
                    '신뢰도 향상',
                    '협력적 태도 유지'
                ],
                longTerm: [
                    '정기적 소통 체계 구축',
                    '공통 관심사 발굴',
                    '상호 이해 증진'
                ]
            },
            patterns: {
                frequency: Math.floor(Math.random() * 10) + 1,
                trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
                participants: ['참여자A', '참여자B', '참여자C']
            }
        };

        setAnalysis(mockAnalysis);
        setAnalysisHistory(prev => [...prev, mockAnalysis]);
        setIsAnalyzing(false);
    };

    // 자동 분석 토글
    useEffect(() => {
        if (autoAnalysis && selectedMessage) {
            if (analysisRef.current) {
                clearTimeout(analysisRef.current);
            }

            analysisRef.current = setTimeout(() => {
                simulateRealTimeAnalysis(selectedMessage);
            }, 1000);
        }

        return () => {
            if (analysisRef.current) {
                clearTimeout(analysisRef.current);
            }
        };
    }, [selectedMessage, autoAnalysis]);

    // 인사이트 생성
    useEffect(() => {
        if (analysisHistory.length > 0) {
            const recentAnalyses = analysisHistory.slice(-5);
            const newInsights = [
                `최근 ${recentAnalyses.length}개 메시지에서 패턴 발견`,
                `감정 변화 추이: ${recentAnalyses.filter(a => a.analysis.sentiment === 'positive').length}개 긍정적`,
                `긴급도 높은 메시지: ${recentAnalyses.filter(a => a.analysis.urgency === 'high').length}개`,
                `전략적 대응 필요: ${recentAnalyses.filter(a => a.analysis.responseType === '전략적 대응').length}개`
            ];
            setInsights(newInsights);
        }
    }, [analysisHistory]);

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-50';
            case 'negative': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                        <CpuChipIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">실시간 AI 분석</h2>
                        <p className="text-sm text-gray-600">선택된 메시지의 실시간 분석 및 추천</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setAutoAnalysis(!autoAnalysis)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${autoAnalysis
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {autoAnalysis ? '자동 분석 ON' : '자동 분석 OFF'}
                    </button>
                    <button
                        onClick={() => selectedMessage && simulateRealTimeAnalysis(selectedMessage)}
                        disabled={isAnalyzing || !selectedMessage}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {isAnalyzing && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <div>
                            <p className="text-sm font-medium text-blue-800">실시간 분석 중...</p>
                            <p className="text-xs text-blue-600">AI가 메시지를 분석하고 있습니다</p>
                        </div>
                    </div>
                </div>
            )}

            {analysis && (
                <div className="space-y-6">
                    {/* 분석 결과 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                                <EyeIcon className="w-4 h-4 mr-2" />
                                메시지 분석
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">감정</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(analysis.analysis.sentiment)}`}>
                                        {analysis.analysis.sentiment === 'positive' ? '긍정적' :
                                            analysis.analysis.sentiment === 'negative' ? '부정적' : '중립적'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">의도</span>
                                    <span className="text-xs text-gray-800 font-medium">{analysis.analysis.intent}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">긴급도</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(analysis.analysis.urgency)}`}>
                                        {analysis.analysis.urgency === 'high' ? '높음' :
                                            analysis.analysis.urgency === 'medium' ? '보통' : '낮음'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">위험도</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(analysis.analysis.riskLevel)}`}>
                                        {analysis.analysis.riskLevel === 'high' ? '높음' :
                                            analysis.analysis.riskLevel === 'medium' ? '보통' : '낮음'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                                <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                                패턴 분석
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">발생 빈도</span>
                                    <span className="text-xs text-green-700 font-medium">{analysis.patterns.frequency}회</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">추세</span>
                                    <span className="text-xs text-green-700 font-medium">
                                        {analysis.patterns.trend === 'increasing' ? '증가' :
                                            analysis.patterns.trend === 'decreasing' ? '감소' : '안정'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">참여자</span>
                                    <span className="text-xs text-green-700 font-medium">{analysis.patterns.participants.length}명</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 추천 사항 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            AI 추천 사항
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <h4 className="text-xs font-semibold text-red-800 mb-2">즉시 대응</h4>
                                <div className="space-y-1">
                                    {analysis.recommendations.immediate.map((rec, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onRecommendationSelect(rec)}
                                            className="block w-full text-left text-xs text-red-700 hover:text-red-800 hover:bg-red-100 p-1 rounded transition-colors"
                                        >
                                            • {rec}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                <h4 className="text-xs font-semibold text-yellow-800 mb-2">전략적 대응</h4>
                                <div className="space-y-1">
                                    {analysis.recommendations.strategic.map((rec, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onRecommendationSelect(rec)}
                                            className="block w-full text-left text-xs text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 p-1 rounded transition-colors"
                                        >
                                            • {rec}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="text-xs font-semibold text-blue-800 mb-2">장기적 대응</h4>
                                <div className="space-y-1">
                                    {analysis.recommendations.longTerm.map((rec, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onRecommendationSelect(rec)}
                                            className="block w-full text-left text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100 p-1 rounded transition-colors"
                                        >
                                            • {rec}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 인사이트 */}
                    {insights.length > 0 && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                                <ChartBarIcon className="w-4 h-4 mr-2" />
                                AI 인사이트
                            </h3>
                            <div className="space-y-2">
                                {insights.map((insight, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                        <span className="text-xs text-purple-700">{insight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!analysis && !isAnalyzing && (
                <div className="text-center py-8 text-gray-500">
                    <CpuChipIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">메시지를 선택하면 실시간 AI 분석이 시작됩니다</p>
                </div>
            )}
        </div>
    );
};

export default RealTimeAIAnalysis; 