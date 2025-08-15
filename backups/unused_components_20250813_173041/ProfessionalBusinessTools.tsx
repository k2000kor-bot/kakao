import React, { useState } from 'react';
import {
    DocumentTextIcon, PresentationChartLineIcon, ChartBarIcon,
    BuildingOfficeIcon, UserGroupIcon, GlobeAltIcon,
    CogIcon, SparklesIcon, CheckCircleIcon,
    ExclamationTriangleIcon, InformationCircleIcon,
    ArrowPathIcon, PlusIcon, TrashIcon
} from '@heroicons/react/24/outline';

import apiService from '../services/apiService';

interface BusinessTool {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'document' | 'presentation' | 'analysis' | 'communication';
}

const businessTools: BusinessTool[] = [
    {
        id: 'business-document',
        name: '비즈니스 문서 생성',
        description: '제안서, 보고서, 계약서 등 전문적인 비즈니스 문서를 생성합니다.',
        icon: <DocumentTextIcon className="w-6 h-6" />,
        category: 'document'
    },
    {
        id: 'professional-template',
        name: '전문 템플릿 생성',
        description: '다양한 업계별 전문 템플릿을 생성합니다.',
        icon: <PresentationChartLineIcon className="w-6 h-6" />,
        category: 'presentation'
    },
    {
        id: 'data-analysis',
        name: '데이터 분석',
        description: '비즈니스 데이터를 분석하고 인사이트를 제공합니다.',
        icon: <ChartBarIcon className="w-6 h-6" />,
        category: 'analysis'
    },
    {
        id: 'business-project',
        name: '비즈니스 프로젝트',
        description: '새로운 비즈니스 프로젝트를 생성하고 관리합니다.',
        icon: <BuildingOfficeIcon className="w-6 h-6" />,
        category: 'communication'
    }
];

const ProfessionalBusinessTools: React.FC = () => {
    const [selectedTool, setSelectedTool] = useState<string>('');
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [businessContext, setBusinessContext] = useState('');
    const [businessType, setBusinessType] = useState('general');
    const [analysisResults, setAnalysisResults] = useState<any>(null);

    const handleToolSelect = (toolId: string) => {
        setSelectedTool(toolId);
        setGeneratedContent('');
        setAnalysisResults(null);
    };

    const generateBusinessContent = async () => {
        if (!selectedTool || !businessContext.trim()) return;

        setIsGenerating(true);
        try {
            let response;

            switch (selectedTool) {
                case 'business-document':
                    response = await apiService.generateBusinessDocument(businessContext, businessType);
                    break;
                case 'professional-template':
                    response = await apiService.generateProfessionalTemplate(businessContext, businessType);
                    break;
                case 'data-analysis':
                    response = await apiService.analyzeBusinessData({ context: businessContext, type: businessType });
                    break;
                case 'business-project':
                    response = await apiService.createBusinessProject({ name: businessContext, type: businessType });
                    break;
                default:
                    return;
            }

            if (response.success) {
                if (selectedTool === 'data-analysis') {
                    setAnalysisResults(response.analysis);
                } else {
                    setGeneratedContent(response.content || response.document || response.template || response.project);
                }
            }
        } catch (error) {
            console.error('비즈니스 콘텐츠 생성 실패:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('클립보드에 복사되었습니다!');
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
        }
    };

    const clearContent = () => {
        setGeneratedContent('');
        setAnalysisResults(null);
        setBusinessContext('');
    };

    return (
        <div className="space-y-6">
            {/* 도구 선택 */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">비즈니스 도구 선택</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {businessTools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => handleToolSelect(tool.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${selectedTool === tool.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            title={tool.description}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${selectedTool === tool.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tool.icon}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-medium text-gray-900">{tool.name}</h4>
                                    <p className="text-sm text-gray-500">{tool.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* 선택된 도구 작업 영역 */}
            {selectedTool && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {businessTools.find(t => t.id === selectedTool)?.name}
                        </h3>
                        <button
                            onClick={clearContent}
                            className="text-gray-400 hover:text-gray-600"
                            title="내용 지우기"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 입력 영역 */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                비즈니스 컨텍스트
                            </label>
                            <textarea
                                value={businessContext}
                                onChange={(e) => setBusinessContext(e.target.value)}
                                placeholder="예: 새로운 제품 출시를 위한 마케팅 전략이 필요합니다..."
                                className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                비즈니스 유형
                            </label>
                            <select
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="비즈니스 유형 선택"
                            >
                                <option value="general">일반</option>
                                <option value="marketing">마케팅</option>
                                <option value="sales">영업</option>
                                <option value="finance">재무</option>
                                <option value="hr">인사</option>
                                <option value="operations">운영</option>
                                <option value="strategy">전략</option>
                            </select>
                        </div>

                        <button
                            onClick={generateBusinessContent}
                            disabled={isGenerating || !businessContext.trim()}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="콘텐츠 생성"
                        >
                            {isGenerating ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                    <span>생성 중...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <SparklesIcon className="w-4 h-4" />
                                    <span>생성하기</span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* 결과 표시 */}
                    {(generatedContent || analysisResults) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-md font-medium text-gray-900">생성 결과</h4>
                                <button
                                    onClick={() => copyToClipboard(generatedContent || JSON.stringify(analysisResults, null, 2))}
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                    title="클립보드에 복사"
                                >
                                    복사
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                {selectedTool === 'data-analysis' && analysisResults ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <ChartBarIcon className="w-5 h-5 text-blue-600" />
                                            <h5 className="font-medium text-gray-900">데이터 분석 결과</h5>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white p-3 rounded-lg">
                                                <h6 className="text-sm font-medium text-gray-700 mb-2">주요 인사이트</h6>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {analysisResults.insights?.map((insight: string, index: number) => (
                                                        <li key={index} className="flex items-start space-x-2">
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                                                            <span>{insight}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-white p-3 rounded-lg">
                                                <h6 className="text-sm font-medium text-gray-700 mb-2">추천사항</h6>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {analysisResults.recommendations?.map((rec: string, index: number) => (
                                                        <li key={index} className="flex items-start space-x-2">
                                                            <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5" />
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {analysisResults.summary && (
                                            <div className="bg-white p-3 rounded-lg">
                                                <h6 className="text-sm font-medium text-gray-700 mb-2">분석 요약</h6>
                                                <p className="text-sm text-gray-600">{analysisResults.summary}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="prose prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap text-sm text-gray-800">{generatedContent}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 사용 팁 */}
            <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900">사용 팁</h4>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                            <li>• 구체적인 비즈니스 상황을 설명하면 더 정확한 결과를 얻을 수 있습니다.</li>
                            <li>• 비즈니스 유형을 선택하면 해당 분야에 특화된 콘텐츠가 생성됩니다.</li>
                            <li>• 생성된 콘텐츠는 클립보드에 복사하여 다른 도구에서 활용할 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalBusinessTools; 