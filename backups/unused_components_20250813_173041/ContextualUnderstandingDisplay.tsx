import React from 'react';
import {
    LightBulbIcon,
    DocumentTextIcon,
    UserGroupIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ContextualAnalysis } from '../services/contextualUnderstandingService';

interface ContextualUnderstandingDisplayProps {
    analysis: ContextualAnalysis;
    suggestions: string[];
    relatedTopics: string[];
    onSuggestionClick?: (suggestion: string) => void;
    onTopicClick?: (topic: string) => void;
}

const ContextualUnderstandingDisplay: React.FC<ContextualUnderstandingDisplayProps> = ({
    analysis,
    suggestions,
    relatedTopics,
    onSuggestionClick,
    onTopicClick
}) => {
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600 bg-green-50';
            case 'negative': return 'text-red-600 bg-red-50';
            case 'mixed': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return <CheckCircleIcon className="w-4 h-4" />;
            case 'negative': return <ExclamationTriangleIcon className="w-4 h-4" />;
            case 'mixed': return <InformationCircleIcon className="w-4 h-4" />;
            default: return <InformationCircleIcon className="w-4 h-4" />;
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <LightBulbIcon className="w-5 h-5 text-blue-600 mr-2" />
                    문맥 이해 결과
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getSentimentColor(analysis.sentiment)}`}>
                    {getSentimentIcon(analysis.sentiment)}
                    <span className="ml-1">
                        {analysis.sentiment === 'positive' ? '긍정적' :
                            analysis.sentiment === 'negative' ? '부정적' :
                                analysis.sentiment === 'mixed' ? '혼재' : '중립'}
                    </span>
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 주요 토픽 */}
                <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                        <DocumentTextIcon className="w-4 h-4 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-900">주요 토픽</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {analysis.mainTopics.map((topic, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 핵심 엔티티 */}
                <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                        <UserGroupIcon className="w-4 h-4 text-green-600 mr-2" />
                        <h4 className="font-medium text-green-900">핵심 엔티티</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {analysis.keyEntities.map((entity, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                                {entity}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 의도 및 요구사항 */}
            <div className="mt-4 bg-purple-50 rounded-lg p-3">
                <div className="flex items-center mb-2">
                    <ChartBarIcon className="w-4 h-4 text-purple-600 mr-2" />
                    <h4 className="font-medium text-purple-900">의도 및 요구사항</h4>
                </div>
                <div className="space-y-2">
                    <div>
                        <span className="text-sm font-medium text-purple-800">의도:</span>
                        <span className="text-sm text-purple-700 ml-2">
                            {analysis.intent === 'analysis_request' ? '분석 요청' :
                                analysis.intent === 'summary_request' ? '요약 요청' :
                                    analysis.intent === 'writing_request' ? '글쓰기 요청' :
                                        analysis.intent === 'comparison_request' ? '비교 요청' :
                                            analysis.intent === 'prediction_request' ? '예측 요청' : '일반 문의'}
                        </span>
                    </div>
                    {analysis.requirements.length > 0 && (
                        <div>
                            <span className="text-sm font-medium text-purple-800">요구사항:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {analysis.requirements.map((req, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                                    >
                                        {req}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 후속 질문 */}
            {analysis.followUpQuestions.length > 0 && (
                <div className="mt-4 bg-yellow-50 rounded-lg p-3">
                    <h4 className="font-medium text-yellow-900 mb-2">추천 후속 질문</h4>
                    <div className="space-y-2">
                        {analysis.followUpQuestions.map((question, index) => (
                            <div
                                key={index}
                                className="text-sm text-yellow-800 cursor-pointer hover:text-yellow-900"
                                onClick={() => onSuggestionClick?.(question)}
                            >
                                • {question}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 제안사항 */}
            {suggestions.length > 0 && (
                <div className="mt-4 bg-indigo-50 rounded-lg p-3">
                    <h4 className="font-medium text-indigo-900 mb-2">제안사항</h4>
                    <div className="space-y-2">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="text-sm text-indigo-800 cursor-pointer hover:text-indigo-900"
                                onClick={() => onSuggestionClick?.(suggestion)}
                            >
                                • {suggestion}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 관련 토픽 */}
            {relatedTopics.length > 0 && (
                <div className="mt-4 bg-teal-50 rounded-lg p-3">
                    <h4 className="font-medium text-teal-900 mb-2">관련 토픽</h4>
                    <div className="flex flex-wrap gap-2">
                        {relatedTopics.map((topic, index) => (
                            <button
                                key={index}
                                onClick={() => onTopicClick?.(topic)}
                                className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full hover:bg-teal-200 transition-colors"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 요약 */}
            <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">문맥 요약</h4>
                <p className="text-sm text-gray-700">{analysis.summary}</p>
            </div>
        </div>
    );
};

export default ContextualUnderstandingDisplay;
