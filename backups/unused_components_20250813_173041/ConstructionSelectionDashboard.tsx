/**
 * 시공사 선정을 위한 메인 대시보드
 * 비교집 자료 업로드, 분석, 메시지 생성 통합 관리
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    StarIcon,
    DocumentArrowUpIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CogIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    BuildingOfficeIcon,
    ClipboardDocumentListIcon,
    PresentationChartLineIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

import constructionAnalyticsService, {
    CompanyData,
    DecisionCriteria,
    EvaluationResult,
    GeneratedMessage,
    KnowledgeBase
} from '../services/constructionAnalytics';
import {
    AnalysisStep,
    MessageGenerationStep,
    ResultsStep,
    ComparisonAnalysisTab,
    GeneratedMessagesTab,
    DecisionHistoryTab
} from './ConstructionMessageComponents';

// 임시 컴포넌트들 (빌드 오류 방지용)
const AnalysisStepTemp: React.FC<any> = ({ evaluationResult, companiesData, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">분석 진행중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="text-center py-12">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">분석 완료</h2>
            <p className="mt-2 text-gray-600">
                {Object.keys(companiesData).length}개 시공사에 대한 종합 분석이 완료되었습니다.
            </p>
            {evaluationResult && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">분석 결과</h3>
                    <p className="text-blue-800">{evaluationResult.decision_rationale}</p>
                </div>
            )}
        </div>
    );
};

const MessageGenerationStepTemp: React.FC<any> = ({ onGenerate, evaluationResult, isLoading }) => {
    const [selectedType, setSelectedType] = useState<'recommendation' | 'comparison' | 'risk_analysis'>('recommendation');

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">메시지 생성</h2>
                <p className="mt-1 text-sm text-gray-600">
                    분석 결과를 바탕으로 논리적이고 일관된 메시지를 생성합니다
                </p>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">메시지 유형 선택</h3>
                <div className="space-y-2">
                    {[
                        { type: 'recommendation' as const, label: '시공사 추천', desc: '최적의 시공사 선정 추천 및 근거' },
                        { type: 'comparison' as const, label: '비교 분석', desc: '상위 시공사들의 상세 비교분석' },
                        { type: 'risk_analysis' as const, label: '위험도 분석', desc: '시공사별 위험요소 및 완화방안' }
                    ].map((option) => (
                        <label key={option.type} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                value={option.type}
                                checked={selectedType === option.type}
                                onChange={(e) => setSelectedType(e.target.value as any)}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-sm text-gray-600">{option.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <button
                    onClick={() => onGenerate(selectedType)}
                    disabled={isLoading || !evaluationResult}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? '생성중...' : '메시지 생성'}
                </button>
            </div>
        </div>
    );
};

const ResultsStepTemp: React.FC<any> = ({ generatedMessages, onGenerateMore }) => {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">메시지 생성 완료</h2>
                <p className="mt-1 text-sm text-gray-600">
                    총 {generatedMessages.length}개의 메시지가 생성되었습니다
                </p>
            </div>

            {generatedMessages.length > 0 ? (
                <div className="space-y-4">
                    {generatedMessages.map((message: any, index: number) => (
                        <div key={message.message_id || index} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {message.generated_content?.title || '생성된 메시지'}
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {new Date(message.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <div className="text-gray-600 mb-4">
                                {message.generated_content?.summary || message.generated_content?.content?.substring(0, 200) + '...'}
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                                    상세보기
                                </button>
                                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                                    복사
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">생성된 메시지가 없습니다.</p>
                </div>
            )}

            <div className="text-center space-x-4">
                <button
                    onClick={() => onGenerateMore('recommendation')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    추천 메시지 추가 생성
                </button>
                <button
                    onClick={() => onGenerateMore('comparison')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    비교분석 추가 생성
                </button>
            </div>
        </div>
    );
};

const ComparisonAnalysisTabTemp: React.FC<any> = ({ companiesData, evaluationResult }) => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">시공사 비교 분석</h2>
            {Object.keys(companiesData).length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600">비교 분석 데이터가 표시됩니다.</p>
                    <div className="mt-4">
                        <p>분석 대상 시공사: {Object.keys(companiesData).length}개</p>
                        {evaluationResult && (
                            <p>추천 시공사: {evaluationResult.recommendation_logic?.primary_recommendation || 'N/A'}</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">비교분석 데이터가 없습니다.</p>
                </div>
            )}
        </div>
    );
};

const GeneratedMessagesTabTemp: React.FC<any> = ({ messages }) => {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">생성된 메시지</h2>
                <div className="text-sm text-gray-600">총 {messages.length}개 메시지</div>
            </div>
            {messages.length === 0 ? (
                <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">생성된 메시지가 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.map((message: any, index: number) => (
                        <div key={message.message_id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium">{message.generated_content?.title || `메시지 ${index + 1}`}</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                {message.generated_content?.summary || '메시지 요약'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DecisionHistoryTabTemp: React.FC = () => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">의사결정 이력</h2>
            <div className="text-center py-12">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600">저장된 의사결정 이력이 없습니다.</p>
            </div>
        </div>
    );
};

interface DashboardState {
    currentStep: 'upload' | 'configure' | 'analyze' | 'generate' | 'results';
    uploadedFile: File | null;
    projectType: string;
    companiesData: Record<string, CompanyData>;
    decisionCriteria: Partial<DecisionCriteria>;
    evaluationResult: EvaluationResult | null;
    generatedMessages: GeneratedMessage[];
    knowledgeBase: KnowledgeBase | null;
    isLoading: boolean;
    error: string | null;
}

const ConstructionSelectionDashboard: React.FC = () => {
    const [state, setState] = useState<DashboardState>({
        currentStep: 'upload',
        uploadedFile: null,
        projectType: '',
        companiesData: {},
        decisionCriteria: {},
        evaluationResult: null,
        generatedMessages: [],
        knowledgeBase: null,
        isLoading: false,
        error: null
    });

    const [selectedTab, setSelectedTab] = useState<'overview' | 'comparison' | 'messages' | 'history'>('overview');

    /**
     * 초기 데이터 로드
     */
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            // 지식베이스 로드
            const knowledgeBaseResult = await constructionAnalyticsService.getKnowledgeBase();

            // 현재 상태 확인
            const currentState = constructionAnalyticsService.getCurrentState();

            setState(prev => ({
                ...prev,
                knowledgeBase: knowledgeBaseResult.knowledge_base,
                companiesData: currentState.has_companies_data ?
                    constructionAnalyticsService.getCompaniesData() : {},
                evaluationResult: currentState.has_evaluation_result ?
                    constructionAnalyticsService.getEvaluationResult() : null,
                currentStep: currentState.has_companies_data ? 'configure' : 'upload',
                isLoading: false
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : '초기 데이터 로드 중 오류가 발생했습니다.',
                isLoading: false
            }));
        }
    }, []);

    /**
     * 파일 업로드 처리
     */
    const handleFileUpload = useCallback(async (file: File, projectType: string) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const result = await constructionAnalyticsService.uploadComparisonData(file, projectType);

            setState(prev => ({
                ...prev,
                uploadedFile: file,
                projectType,
                companiesData: result.processed_data,
                currentStep: 'configure',
                isLoading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : '파일 업로드 중 오류가 발생했습니다.',
                isLoading: false
            }));
        }
    }, []);

    /**
     * 의사결정 기준 설정
     */
    const handleCriteriaConfiguration = useCallback(async (criteria: DecisionCriteria) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null, decisionCriteria: criteria }));

            const result = await constructionAnalyticsService.analyzeCompanies(criteria);

            setState(prev => ({
                ...prev,
                evaluationResult: result.analysis_result,
                currentStep: 'generate',
                isLoading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.',
                isLoading: false
            }));
        }
    }, []);

    /**
     * 메시지 생성
     */
    const handleMessageGeneration = useCallback(async (
        messageType: 'recommendation' | 'comparison' | 'risk_analysis',
        targetAudience: 'management' | 'technical' | 'general' = 'management'
    ) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const result = await constructionAnalyticsService.generateMessage(messageType, true, targetAudience);

            setState(prev => ({
                ...prev,
                generatedMessages: [...prev.generatedMessages, result.message_data],
                currentStep: 'results',
                isLoading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : '메시지 생성 중 오류가 발생했습니다.',
                isLoading: false
            }));
        }
    }, []);

    /**
     * 단계별 컴포넌트 렌더링
     */
    const renderStepContent = () => {
        switch (state.currentStep) {
            case 'upload':
                return (
                    <FileUploadStep
                        onFileUpload={handleFileUpload}
                        isLoading={state.isLoading}
                        knowledgeBase={state.knowledgeBase}
                    />
                );
            case 'configure':
                return (
                    <CriteriaConfigurationStep
                        companiesData={state.companiesData}
                        projectType={state.projectType}
                        onConfigure={handleCriteriaConfiguration}
                        isLoading={state.isLoading}
                        knowledgeBase={state.knowledgeBase}
                    />
                );
            case 'analyze':
                return (
                    <AnalysisStepTemp
                        evaluationResult={state.evaluationResult}
                        companiesData={state.companiesData}
                        isLoading={state.isLoading}
                    />
                );
            case 'generate':
                return (
                    <MessageGenerationStepTemp
                        onGenerate={handleMessageGeneration}
                        evaluationResult={state.evaluationResult}
                        isLoading={state.isLoading}
                    />
                );
            case 'results':
                return (
                    <ResultsStepTemp
                        generatedMessages={state.generatedMessages}
                        evaluationResult={state.evaluationResult}
                        companiesData={state.companiesData}
                        onGenerateMore={handleMessageGeneration}
                    />
                );
            default:
                return null;
        }
    };

    /**
     * 진행 상황 표시기
     */
    const renderProgressIndicator = () => {
        const steps = [
            { key: 'upload', label: '자료업로드', icon: DocumentArrowUpIcon },
            { key: 'configure', label: '기준설정', icon: CogIcon },
            { key: 'analyze', label: '분석수행', icon: ChartBarIcon },
            { key: 'generate', label: '메시지생성', icon: DocumentTextIcon },
            { key: 'results', label: '결과확인', icon: CheckCircleIcon }
        ];

        const currentIndex = steps.findIndex(step => step.key === state.currentStep);

        return (
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        const isUpcoming = index > currentIndex;

                        return (
                            <div key={step.key} className="flex items-center">
                                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-blue-500 border-blue-500 text-white' : ''}
                  ${isUpcoming ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                `}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`ml-2 text-sm font-medium ${isCompleted ? 'text-green-600' :
                                    isCurrent ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                    {step.label}
                                </span>
                                {index < steps.length - 1 && (
                                    <div className={`mx-4 w-16 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        시공사 선정 지원 시스템
                    </h1>
                    <p className="text-gray-600">
                        비교집 자료 기반 논리적 의사결정 및 일관된 메시지 생성
                    </p>
                </div>

                {/* 진행 상황 */}
                {renderProgressIndicator()}

                {/* 오류 메시지 */}
                {state.error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                                <p className="mt-1 text-sm text-red-700">{state.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 탭 네비게이션 */}
                <div className="mb-6">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {[
                            { key: 'overview', label: '개요', icon: InformationCircleIcon },
                            { key: 'comparison', label: '비교분석', icon: ChartBarIcon },
                            { key: 'messages', label: '생성메시지', icon: DocumentTextIcon },
                            { key: 'history', label: '이력관리', icon: ClipboardDocumentListIcon }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedTab(tab.key as any)}
                                    className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md
                    ${selectedTab === tab.key
                                            ? 'text-blue-600 bg-blue-100'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="bg-white rounded-lg shadow">
                    {selectedTab === 'overview' && (
                        <div className="p-6">
                            {renderStepContent()}
                        </div>
                    )}

                    {selectedTab === 'comparison' && (
                        <ComparisonAnalysisTabTemp
                            companiesData={state.companiesData}
                            evaluationResult={state.evaluationResult}
                        />
                    )}

                    {selectedTab === 'messages' && (
                        <GeneratedMessagesTabTemp
                            messages={state.generatedMessages}
                            onGenerateMore={handleMessageGeneration}
                        />
                    )}

                    {selectedTab === 'history' && (
                        <DecisionHistoryTabTemp />
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * 파일 업로드 단계 컴포넌트
 */
interface FileUploadStepProps {
    onFileUpload: (file: File, projectType: string) => void;
    isLoading: boolean;
    knowledgeBase: KnowledgeBase | null;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({ onFileUpload, isLoading, knowledgeBase }) => {
    const [file, setFile] = useState<File | null>(null);
    const [projectType, setProjectType] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (file && projectType) {
            onFileUpload(file, projectType);
        }
    };

    const projectTypes = knowledgeBase ?
        Object.keys(knowledgeBase.decision_patterns) :
        ['대형_인프라', '주거_단지', '상업시설', '공공건물'];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">비교집 자료 업로드</h2>
                <p className="mt-1 text-sm text-gray-600">
                    시공사 비교 데이터를 업로드하여 분석을 시작하세요
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 프로젝트 유형 선택 */}
                <div>
                    <label htmlFor="project-type" className="block text-sm font-medium text-gray-700">
                        프로젝트 유형
                    </label>
                    <select
                        id="project-type"
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">프로젝트 유형을 선택하세요</option>
                        {projectTypes.map(type => (
                            <option key={type} value={type}>{type.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* 파일 업로드 */}
                <div>
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                        비교집 파일
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                    <span>파일을 선택하거나</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        accept=".json,.xlsx,.xls"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </label>
                                <p className="pl-1">드래그하여 업로드</p>
                            </div>
                            <p className="text-xs text-gray-500">JSON, Excel 파일 지원</p>
                            {file && (
                                <p className="text-sm text-green-600">선택된 파일: {file.name}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 업로드 버튼 */}
                <div>
                    <button
                        type="submit"
                        disabled={!file || !projectType || isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '처리중...' : '업로드 및 분석 시작'}
                    </button>
                </div>
            </form>
        </div>
    );
};

/**
 * 기준 설정 단계 컴포넌트
 */
interface CriteriaConfigurationStepProps {
    companiesData: Record<string, CompanyData>;
    projectType: string;
    onConfigure: (criteria: DecisionCriteria) => void;
    isLoading: boolean;
    knowledgeBase: KnowledgeBase | null;
}

const CriteriaConfigurationStep: React.FC<CriteriaConfigurationStepProps> = ({
    companiesData,
    projectType,
    onConfigure,
    isLoading,
    knowledgeBase
}) => {
    const [criteria, setCriteria] = useState<Partial<DecisionCriteria>>({
        project_type: projectType,
        budget_range: [1000000000, 10000000000], // 10억 ~ 100억
        timeline: 365, // 1년
        priority_weights: {
            '기술력': 0.2,
            '재무안정성': 0.15,
            '시공실적': 0.25,
            '프로젝트관리': 0.15,
            '품질관리': 0.15,
            '가격경쟁력': 0.1
        },
        mandatory_requirements: [],
        preferred_features: [],
        risk_tolerance: 'medium'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (criteria.project_type && criteria.budget_range && criteria.timeline && criteria.priority_weights) {
            onConfigure(criteria as DecisionCriteria);
        }
    };

    const updateWeight = (criterion: string, weight: number) => {
        setCriteria(prev => ({
            ...prev,
            priority_weights: {
                ...prev.priority_weights,
                [criterion]: weight
            }
        }));
    };

    const totalWeight = Object.values(criteria.priority_weights || {}).reduce((sum, weight) => sum + weight, 0);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">의사결정 기준 설정</h2>
                <p className="mt-1 text-sm text-gray-600">
                    {Object.keys(companiesData).length}개 시공사에 대한 평가 기준을 설정하세요
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 프로젝트 기본 정보 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">프로젝트 기본 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">프로젝트 유형</label>
                            <input
                                type="text"
                                value={criteria.project_type}
                                readOnly
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">예산 범위 (억원)</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    value={(criteria.budget_range?.[0] || 0) / 100000000}
                                    onChange={(e) => setCriteria(prev => ({
                                        ...prev,
                                        budget_range: [parseInt(e.target.value) * 100000000, prev.budget_range?.[1] || 0]
                                    }))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="최소"
                                />
                                <input
                                    type="number"
                                    value={(criteria.budget_range?.[1] || 0) / 100000000}
                                    onChange={(e) => setCriteria(prev => ({
                                        ...prev,
                                        budget_range: [prev.budget_range?.[0] || 0, parseInt(e.target.value) * 100000000]
                                    }))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="최대"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">공사기간 (일)</label>
                            <input
                                type="number"
                                value={criteria.timeline}
                                onChange={(e) => setCriteria(prev => ({ ...prev, timeline: parseInt(e.target.value) }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>

                {/* 평가 기준 가중치 */}
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">평가 기준 가중치</h3>
                    <div className="space-y-4">
                        {Object.entries(criteria.priority_weights || {}).map(([criterion, weight]) => (
                            <div key={criterion} className="flex items-center space-x-4">
                                <div className="w-32">
                                    <label className="text-sm font-medium text-gray-700">{criterion}</label>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="0.5"
                                        step="0.05"
                                        value={weight}
                                        onChange={(e) => updateWeight(criterion, parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                                <div className="w-16 text-right">
                                    <span className="text-sm text-gray-600">{(weight * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                        <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm">
                                <span>총합:</span>
                                <span className={totalWeight === 1 ? 'text-green-600' : 'text-red-600'}>
                                    {(totalWeight * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 위험 허용도 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">위험 허용도</label>
                    <div className="flex space-x-4">
                        {[
                            { value: 'low', label: '낮음 (안전 우선)' },
                            { value: 'medium', label: '보통 (균형)' },
                            { value: 'high', label: '높음 (수익 우선)' }
                        ].map(option => (
                            <label key={option.value} className="flex items-center">
                                <input
                                    type="radio"
                                    value={option.value}
                                    checked={criteria.risk_tolerance === option.value}
                                    onChange={(e) => setCriteria(prev => ({ ...prev, risk_tolerance: e.target.value as any }))}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 분석 시작 버튼 */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading || totalWeight !== 1}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '분석중...' : '분석 시작'}
                    </button>
                    {totalWeight !== 1 && (
                        <p className="mt-2 text-sm text-red-600 text-center">
                            가중치의 총합이 100%가 되어야 합니다.
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

/**
 * 나머지 컴포넌트들은 별도 파일로 분리 예정
 * (AnalysisStep, MessageGenerationStep, ResultsStep, 각종 Tab 컴포넌트들)
 */



export default ConstructionSelectionDashboard; 