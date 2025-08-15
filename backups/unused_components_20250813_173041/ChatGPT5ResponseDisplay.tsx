import React, { useState } from 'react';
import {
    LightBulbIcon,
    ChartBarIcon,
    BookOpenIcon,
    SparklesIcon,
    BeakerIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    DocumentIcon,
    ShareIcon,
    CpuChipIcon,
    RocketLaunchIcon,
    StarIcon,
    GlobeAltIcon,
    CodeBracketIcon,
    CalculatorIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ChatGPT5Response, MathExpression } from '../services/chatgpt5LevelService';

interface ChatGPT5ResponseDisplayProps {
    response: ChatGPT5Response;
    className?: string;
}

const ChatGPT5ResponseDisplay: React.FC<ChatGPT5ResponseDisplayProps> = ({
    response,
    className = ""
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['analysis']));
    const [activeTab, setActiveTab] = useState<'main' | 'analysis' | 'sources' | 'recommendations' | 'visualizations' | 'code' | 'math'>('main');

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const formatProcessingTime = (time: number): string => {
        if (time < 1000) return `${time}ms`;
        return `${(time / 1000).toFixed(1)}s`;
    };

    const getConfidenceColor = (confidence: number): string => {
        if (confidence >= 0.9) return 'text-green-600';
        if (confidence >= 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceIcon = (confidence: number) => {
        if (confidence >= 0.9) return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
        if (confidence >= 0.7) return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
        return <InformationCircleIcon className="w-4 h-4 text-red-600" />;
    };

    const tabs = [
        { id: 'main', label: '응답', icon: DocumentTextIcon },
        { id: 'analysis', label: '분석', icon: MagnifyingGlassIcon },
        { id: 'sources', label: '참고문헌', icon: BookOpenIcon },
        { id: 'recommendations', label: '권장사항', icon: LightBulbIcon },
        { id: 'visualizations', label: '시각화', icon: ChartBarIcon },
        { id: 'code', label: '코드', icon: CodeBracketIcon },
        { id: 'math', label: '수학', icon: CalculatorIcon }
    ];

    return (
        <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm ${className}`}>
            {/* 헤더 정보 */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <CpuChipIcon className="w-5 h-5 text-blue-200" />
                        <span className="font-semibold text-base">ChatGPT 5 박사급 AI</span>
                        <span className="text-xs opacity-80">{response.modelVersion}</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                            {getConfidenceIcon(response.confidence)}
                            <span className={`text-xs font-medium ${getConfidenceColor(response.confidence)}`}>
                                신뢰도: {(response.confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-80">
                            <ClockIcon className="w-3 h-3" />
                            <span>처리시간: {formatProcessingTime(response.processingTime)}</span>
                        </div>
                    </div>
                </div>
                <button
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    title="공유"
                >
                    <ShareIcon className="w-4 h-4" />
                </button>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex bg-gray-50 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all text-sm ${activeTab === tab.id
                            ? 'text-blue-600 bg-white border-blue-600'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-transparent'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* 메인 응답 */}
            {activeTab === 'main' && (
                <div className="p-5">
                    <div className="prose prose-sm max-w-none">
                        {response.response.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3 leading-relaxed text-gray-900">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* 심층 분석 */}
            {activeTab === 'analysis' && response.analysis && (
                <div className="p-5">
                    {/* 의미 분석 */}
                    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center gap-2 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleSection('semantic')}
                        >
                            {expandedSections.has('semantic') ? (
                                <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                            )}
                            <h3 className="text-sm font-semibold text-gray-700">의미 분석</h3>
                        </div>
                        {expandedSections.has('semantic') && (
                            <div className="p-4">
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">핵심 개념</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {response.analysis.semanticAnalysis.keyConcepts.map((concept, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">개념 간 관계</h4>
                                    <div className="space-y-2">
                                        {response.analysis.semanticAnalysis.relationships.map((rel, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                                                <span className="font-medium">{rel.concept1}</span>
                                                <span className="text-gray-500">→</span>
                                                <span className="font-medium">{rel.concept2}</span>
                                                <span className="text-gray-600">({rel.relationship})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 컨텍스트 이해 */}
                    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center gap-2 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleSection('context')}
                        >
                            {expandedSections.has('context') ? (
                                <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                            )}
                            <h3 className="text-sm font-semibold text-gray-700">컨텍스트 이해</h3>
                        </div>
                        {expandedSections.has('context') && (
                            <div className="p-4">
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">도메인 전문성</h4>
                                    <div className="space-y-2">
                                        {response.analysis.contextualUnderstanding && (
                                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-xs">도메인: {response.analysis.contextualUnderstanding.domain}</span>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500"
                                                            style={{ width: `${response.analysis.contextualUnderstanding.complexity * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600">{(response.analysis.contextualUnderstanding.complexity * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 논리적 구조 */}
                    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center gap-2 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleSection('logic')}
                        >
                            {expandedSections.has('logic') ? (
                                <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                            )}
                            <h3 className="text-sm font-semibold text-gray-700">논리적 구조</h3>
                        </div>
                        {expandedSections.has('logic') && (
                            <div className="p-4">
                                <div className="space-y-3">
                                    {response.analysis.logicalStructure.premises.map((premise, index) => (
                                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                                    전제
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-900">{premise}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 비판적 평가 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                            className="flex items-center gap-2 p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleSection('critical')}
                        >
                            {expandedSections.has('critical') ? (
                                <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                            )}
                            <h3 className="text-sm font-semibold text-gray-700">비판적 평가</h3>
                        </div>
                        {expandedSections.has('critical') && (
                            <div className="p-4">
                                <div className="space-y-4">
                                    {response.analysis.criticalEvaluation.limitations.map((limitation: string, index: number) => (
                                        <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <h4 className="text-xs font-semibold text-yellow-800 mb-1">한계 {index + 1}</h4>
                                            <p className="text-sm text-yellow-900">{limitation}</p>
                                        </div>
                                    ))}
                                    {response.analysis.criticalEvaluation.limitations.map((limitation, index) => (
                                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <h4 className="text-xs font-semibold text-red-800 mb-1">한계 {index + 1}</h4>
                                            <p className="text-sm text-red-900">{limitation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 참고문헌 */}
            {activeTab === 'sources' && response.sources && (
                <div className="p-5">
                    <div className="space-y-4">
                        {response.sources.map((source, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <DocumentIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{source.title}</h3>
                                        <p className="text-xs text-gray-600 mb-2">{source.authors.join(', ')} • {source.year}</p>
                                        <p className="text-sm text-gray-700 mb-2">{source.citation}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">관련도:</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500"
                                                        style={{ width: `${source.relevance * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-600">{(source.relevance * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 권장사항 */}
            {activeTab === 'recommendations' && response.recommendations && (
                <div className="p-5">
                    <div className="space-y-4">
                        {response.recommendations.map((rec, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{rec.type}</h3>
                                        <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">우선순위:</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <StarIcon
                                                        key={star}
                                                        className={`w-3 h-3 ${star <= (rec.priority === 'high' ? 3 : rec.priority === 'medium' ? 2 : 1)
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 시각화 */}
            {activeTab === 'visualizations' && response.visualizations && (
                <div className="p-5">
                    <div className="space-y-4">
                        {response.visualizations.map((viz, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <ChartBarIcon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{viz.title}</h3>
                                        <p className="text-sm text-gray-700 mb-2">{viz.description}</p>
                                        <div className="bg-gray-50 p-3 rounded border">
                                            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{String(viz.data)}</pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 코드 */}
            {activeTab === 'code' && response.codeSnippets && (
                <div className="p-5">
                    <div className="space-y-4">
                        {response.codeSnippets.map((snippet, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <CodeBracketIcon className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{snippet.language}</h3>
                                        <p className="text-sm text-gray-700 mb-2">{snippet.description}</p>
                                        <div className="bg-gray-900 p-3 rounded border">
                                            <pre className="text-xs text-green-400 whitespace-pre-wrap">{snippet.code}</pre>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            언어: {snippet.language} • 복잡도: {snippet.complexity}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 수학 */}
            {activeTab === 'math' && response.mathematicalExpressions && (
                <div className="p-5">
                    <div className="space-y-4">
                        {response.mathematicalExpressions.map((expr: MathExpression, index: number) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <CalculatorIcon className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">수학 표현식 {index + 1}</h3>
                                        <p className="text-sm text-gray-700 mb-2">{expr.description}</p>
                                        <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                                            {expr.expression}
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

export default ChatGPT5ResponseDisplay;
