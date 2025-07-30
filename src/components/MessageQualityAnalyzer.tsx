import React, { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    StarIcon,
    ArrowTrendingUpIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

interface QualityMetrics {
    clarity: number;
    tone: number;
    effectiveness: number;
    appropriateness: number;
    engagement: number;
    overall: number;
}

interface AnalysisResult {
    metrics: QualityMetrics;
    suggestions: string[];
    strengths: string[];
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    riskLevel: 'low' | 'medium' | 'high';
}

interface MessageQualityAnalyzerProps {
    message: string;
    context?: string;
    targetAudience?: string;
}

const MessageQualityAnalyzer: React.FC<MessageQualityAnalyzerProps> = ({
    message,
    context = '',
    targetAudience = '일반'
}) => {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // 메시지 품질 분석 함수
    const analyzeMessage = (text: string): AnalysisResult => {
        // 기본 지표 계산
        const length = text.length;
        const wordCount = text.split(/\s+/).length;
        const sentenceCount = text.split(/[.!?]/).length;

        // 품질 지표 계산 (0-100)
        const clarity = Math.min(100, Math.max(20, 100 - Math.abs(length - 200) / 10));
        const tone = Math.min(100, 60 + Math.random() * 35); // 시뮬레이션
        const effectiveness = Math.min(100, 50 + (wordCount > 5 ? 20 : 0) + (length > 10 ? 20 : 0) + Math.random() * 10);
        const appropriateness = Math.min(100, 70 + Math.random() * 25);
        const engagement = Math.min(100, 55 + (text.includes('?') ? 15 : 0) + (text.includes('!') ? 10 : 0) + Math.random() * 20);

        const overall = (clarity + tone + effectiveness + appropriateness + engagement) / 5;

        // 등급 계산
        let grade: 'A' | 'B' | 'C' | 'D' | 'F';
        if (overall >= 90) grade = 'A';
        else if (overall >= 80) grade = 'B';
        else if (overall >= 70) grade = 'C';
        else if (overall >= 60) grade = 'D';
        else grade = 'F';

        // 리스크 레벨
        let riskLevel: 'low' | 'medium' | 'high';
        if (overall >= 80) riskLevel = 'low';
        else if (overall >= 60) riskLevel = 'medium';
        else riskLevel = 'high';

        // 제안사항 생성
        const suggestions: string[] = [];
        if (clarity < 70) suggestions.push('문장을 더 명확하고 간결하게 작성해보세요.');
        if (tone < 70) suggestions.push('더 친근하고 적절한 톤을 사용해보세요.');
        if (effectiveness < 70) suggestions.push('핵심 메시지를 더 강조해보세요.');
        if (engagement < 70) suggestions.push('독자의 관심을 끌 수 있는 요소를 추가해보세요.');
        if (length < 20) suggestions.push('메시지가 너무 짧습니다. 더 자세한 설명을 추가해보세요.');
        if (length > 500) suggestions.push('메시지가 너무 깁니다. 핵심 내용으로 압축해보세요.');

        // 강점 식별
        const strengths: string[] = [];
        if (clarity >= 80) strengths.push('명확하고 이해하기 쉬운 표현');
        if (tone >= 80) strengths.push('적절한 톤과 스타일');
        if (effectiveness >= 80) strengths.push('효과적인 메시지 전달');
        if (engagement >= 80) strengths.push('높은 참여도와 흥미');
        if (appropriateness >= 80) strengths.push('상황에 적합한 내용');

        return {
            metrics: { clarity, tone, effectiveness, appropriateness, engagement, overall },
            suggestions,
            strengths,
            grade,
            riskLevel
        };
    };

    // 메시지 변경 시 분석 실행
    useEffect(() => {
        if (message.trim().length > 0) {
            setIsAnalyzing(true);

            // 분석 시뮬레이션 (실제로는 API 호출)
            const timer = setTimeout(() => {
                const result = analyzeMessage(message);
                setAnalysis(result);
                setIsAnalyzing(false);
            }, 1000);

            return () => clearTimeout(timer);
        } else {
            setAnalysis(null);
        }
    }, [message]);

    // 지표 색상 결정
    const getMetricColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    // 등급 색상
    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-green-600 bg-green-100 border-green-200';
            case 'B': return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'C': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'D': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'F': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    if (!message.trim()) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
                <InformationCircleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">메시지를 입력하면 실시간으로 품질을 분석합니다</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">메시지 품질 분석</h3>
                {isAnalyzing ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">분석 중...</span>
                    </div>
                ) : analysis && (
                    <div className={`px-3 py-1 rounded-full border text-lg font-bold ${getGradeColor(analysis.grade)}`}>
                        {analysis.grade}
                    </div>
                )}
            </div>

            {analysis && !isAnalyzing && (
                <>
                    {/* 전체 점수 */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">전체 점수</span>
                            <span className={`text-2xl font-bold ${getMetricColor(analysis.metrics.overall).split(' ')[0]}`}>
                                {Math.round(analysis.metrics.overall)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all duration-500 ${analysis.metrics.overall >= 80 ? 'bg-green-500' :
                                        analysis.metrics.overall >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${Math.max(5, analysis.metrics.overall)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* 세부 지표 */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                            { key: 'clarity', label: '명확성', icon: CheckCircleIcon },
                            { key: 'tone', label: '톤', icon: StarIcon },
                            { key: 'effectiveness', label: '효과성', icon: ArrowTrendingUpIcon },
                            { key: 'appropriateness', label: '적절성', icon: CheckCircleIcon },
                            { key: 'engagement', label: '참여도', icon: ChartBarIcon }
                        ].map(({ key, label, icon: Icon }) => (
                            <div key={key} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                                        <Icon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                    </div>
                                    <span className={`text-sm font-semibold px-2 py-1 rounded ${getMetricColor(analysis.metrics[key as keyof QualityMetrics])}`}>
                                        {Math.round(analysis.metrics[key as keyof QualityMetrics])}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${analysis.metrics[key as keyof QualityMetrics] >= 80 ? 'bg-green-500' :
                                                analysis.metrics[key as keyof QualityMetrics] >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${Math.max(5, analysis.metrics[key as keyof QualityMetrics])}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 강점 */}
                    {analysis.strengths.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                강점
                            </h4>
                            <div className="space-y-1">
                                {analysis.strengths.map((strength, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm text-green-700">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        <span>{strength}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 개선 제안 */}
                    {analysis.suggestions.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-2" />
                                개선 제안
                            </h4>
                            <div className="space-y-1">
                                {analysis.suggestions.map((suggestion, index) => (
                                    <div key={index} className="flex items-start space-x-2 text-sm text-yellow-700">
                                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <span>{suggestion}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 위험 수준 */}
                    <div className={`p-3 rounded-lg border ${analysis.riskLevel === 'low' ? 'bg-green-50 border-green-200' :
                            analysis.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center space-x-2">
                            {analysis.riskLevel === 'low' ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            ) : (
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                            )}
                            <span className={`text-sm font-medium ${analysis.riskLevel === 'low' ? 'text-green-800' :
                                    analysis.riskLevel === 'medium' ? 'text-yellow-800' :
                                        'text-red-800'
                                }`}>
                                위험 수준: {
                                    analysis.riskLevel === 'low' ? '낮음' :
                                        analysis.riskLevel === 'medium' ? '보통' : '높음'
                                }
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MessageQualityAnalyzer; 