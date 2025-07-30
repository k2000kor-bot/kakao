/**
 * 시공사 선정 시스템 추가 UI 컴포넌트들
 */

import React, { useState, useEffect } from 'react';
import {
  StarIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    TrophyIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
    BuildingOfficeIcon,
    PresentationChartLineIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import constructionAnalyticsService, {
    CompanyData,
    EvaluationResult,
    GeneratedMessage
} from '../services/constructionAnalytics';

// 분석 단계 컴포넌트
interface AnalysisStepProps {
    evaluationResult: EvaluationResult | null;
    companiesData: Record<string, CompanyData>;
    isLoading: boolean;
}

export const AnalysisStep: React.FC<AnalysisStepProps> = ({
    evaluationResult,
    companiesData,
    isLoading
}) => {
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

    if (!evaluationResult) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">분석 결과가 없습니다.</p>
            </div>
        );
    }

    const topCompanies = evaluationResult.recommendation_logic.ranking.slice(0, 3);

    return (
        <div className="space-y-8">
            {/* 분석 완료 헤더 */}
            <div className="text-center">
                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">분석 완료</h2>
                <p className="mt-2 text-gray-600">
                    {Object.keys(companiesData).length}개 시공사에 대한 종합 분석이 완료되었습니다.
                </p>
            </div>

            {/* 상위 3개사 결과 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topCompanies.map((company, index) => {
                    const companyData = companiesData[company.company_id];
                    const riskAssessment = evaluationResult.risk_assessments[company.company_id];

                    return (
                        <div key={company.company_id} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}
                  `}>
                                        {index + 1}
                                    </div>
                                    <span className="ml-2 text-lg font-semibold">{companyData?.company_name}</span>
                                </div>
                                <span className="text-2xl font-bold text-blue-600">
                                    {company.score.toFixed(1)}점
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <ShieldCheckIcon className="w-4 h-4 text-gray-400 mr-2" />
                                    <span>위험도: {riskAssessment?.risk_level || 'N/A'}</span>
                                </div>

                                <div className="flex items-center text-sm">
                                    <TrophyIcon className="w-4 h-4 text-gray-400 mr-2" />
                                    <span>주요 강점: {companyData?.strengths[0] || 'N/A'}</span>
                                </div>

                                <div className="flex items-center text-sm">
                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400 mr-2" />
                                    <span>
                                        시공실적: {companyData?.project_history.length || 0}건
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 결정 근거 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-3">
                    의사결정 근거
                </h3>
                <p className="text-blue-800 whitespace-pre-line">
                    {evaluationResult.decision_rationale}
                </p>
            </div>
        </div>
    );
};

// 메시지 생성 단계 컴포넌트
interface MessageGenerationStepProps {
    onGenerate: (messageType: 'recommendation' | 'comparison' | 'risk_analysis', targetAudience?: 'management' | 'technical' | 'general') => void;
    evaluationResult: EvaluationResult | null;
    isLoading: boolean;
}

export const MessageGenerationStep: React.FC<MessageGenerationStepProps> = ({
    onGenerate,
    evaluationResult,
    isLoading
}) => {
    const [selectedType, setSelectedType] = useState<'recommendation' | 'comparison' | 'risk_analysis'>('recommendation');
    const [selectedAudience, setSelectedAudience] = useState<'management' | 'technical' | 'general'>('management');

    const messageTypes = [
        {
            type: 'recommendation' as const,
            title: '시공사 추천',
            description: '최적의 시공사 선정 추천 및 근거',
            icon: TrophyIcon,
            color: 'blue'
        },
        {
            type: 'comparison' as const,
            title: '비교 분석',
            description: '상위 시공사들의 상세 비교분석',
            icon: ChartBarIcon,
            color: 'green'
        },
        {
            type: 'risk_analysis' as const,
            title: '위험도 분석',
            description: '시공사별 위험요소 및 완화방안',
            icon: ExclamationTriangleIcon,
            color: 'red'
        }
    ];

    const audiences = [
        { value: 'management' as const, label: '경영진', description: '비즈니스 관점 중심' },
        { value: 'technical' as const, label: '기술진', description: '기술적 세부사항 중심' },
        { value: 'general' as const, label: '일반', description: '종합적 관점' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">메시지 생성</h2>
                <p className="mt-1 text-sm text-gray-600">
                    분석 결과를 바탕으로 논리적이고 일관된 메시지를 생성합니다
                </p>
            </div>

            {/* 메시지 유형 선택 */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">메시지 유형</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {messageTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.type}
                                onClick={() => setSelectedType(type.type)}
                                className={`
                  p-4 border rounded-lg text-left transition-colors
                  ${selectedType === type.type
                                        ? `border-${type.color}-500 bg-${type.color}-50`
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                `}
                            >
                                <div className="flex items-center mb-2">
                                    <Icon className={`w-6 h-6 mr-2 ${selectedType === type.type ? `text-${type.color}-600` : 'text-gray-400'
                                        }`} />
                                    <span className="font-medium">{type.title}</span>
                                </div>
                                <p className="text-sm text-gray-600">{type.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 대상 청중 선택 */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">대상 청중</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {audiences.map((audience) => (
                        <label key={audience.value} className="flex items-center">
                            <input
                                type="radio"
                                value={audience.value}
                                checked={selectedAudience === audience.value}
                                onChange={(e) => setSelectedAudience(e.target.value as any)}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium">{audience.label}</div>
                                <div className="text-sm text-gray-600">{audience.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* 분석 결과 요약 */}
            {evaluationResult && (
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">분석 결과 요약</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {evaluationResult.recommendation_logic.ranking.length}
                            </div>
                            <div className="text-sm text-gray-600">분석 대상</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">
                                {evaluationResult.qualified_companies.length}
                            </div>
                            <div className="text-sm text-gray-600">적격 업체</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {evaluationResult.recommendation_logic.primary_recommendation ? '1' : '0'}
                            </div>
                            <div className="text-sm text-gray-600">1순위 추천</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-600">
                                {Object.values(evaluationResult.risk_assessments).filter(r => r.risk_level === 'high').length}
                            </div>
                            <div className="text-sm text-gray-600">고위험 업체</div>
                        </div>
                    </div>
                </div>
            )}

            {/* 생성 버튼 */}
            <div className="text-center">
                <button
                    onClick={() => onGenerate(selectedType, selectedAudience)}
                    disabled={isLoading || !evaluationResult}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? '생성중...' : '메시지 생성'}
                </button>
            </div>
        </div>
    );
};

// 결과 확인 단계 컴포넌트
interface ResultsStepProps {
    generatedMessages: GeneratedMessage[];
    evaluationResult: EvaluationResult | null;
    companiesData: Record<string, CompanyData>;
    onGenerateMore: (messageType: 'recommendation' | 'comparison' | 'risk_analysis', targetAudience?: 'management' | 'technical' | 'general') => void;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({
    generatedMessages,
    evaluationResult,
    companiesData,
    onGenerateMore
}) => {
    const [selectedMessage, setSelectedMessage] = useState<GeneratedMessage | null>(
        generatedMessages[generatedMessages.length - 1] || null
    );

    useEffect(() => {
        if (generatedMessages.length > 0) {
            setSelectedMessage(generatedMessages[generatedMessages.length - 1]);
        }
    }, [generatedMessages]);

    const formatMessageType = (type: string) => {
        const typeMap = {
            'recommendation': '시공사 추천',
            'comparison': '비교 분석',
            'risk_analysis': '위험도 분석'
        };
        return typeMap[type as keyof typeof typeMap] || type;
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">메시지 생성 완료</h2>
                <p className="mt-1 text-sm text-gray-600">
                    총 {generatedMessages.length}개의 메시지가 생성되었습니다
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 메시지 목록 */}
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">생성된 메시지</h3>
                    <div className="space-y-2">
                        {generatedMessages.map((message, index) => (
                            <button
                                key={message.message_id}
                                onClick={() => setSelectedMessage(message)}
                                className={`
                  w-full text-left p-3 rounded-lg border transition-colors
                  ${selectedMessage?.message_id === message.message_id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                `}
                            >
                                <div className="font-medium text-sm">
                                    {formatMessageType(message.message_type)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleString()}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* 추가 메시지 생성 버튼들 */}
                    <div className="mt-6 space-y-2">
                        <button
                            onClick={() => onGenerateMore('recommendation')}
                            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            추천 메시지 추가 생성
                        </button>
                        <button
                            onClick={() => onGenerateMore('comparison')}
                            className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            비교분석 추가 생성
                        </button>
                        <button
                            onClick={() => onGenerateMore('risk_analysis')}
                            className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            위험분석 추가 생성
                        </button>
                    </div>
                </div>

                {/* 선택된 메시지 내용 */}
                <div className="lg:col-span-3">
                    {selectedMessage ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedMessage.generated_content.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatMessageType(selectedMessage.message_type)} •
                                        {new Date(selectedMessage.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                                        복사
                                    </button>
                                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                                        다운로드
                                    </button>
                                </div>
                            </div>

                            <div className="prose max-w-none">
                                <div className="whitespace-pre-line text-gray-900">
                                    {selectedMessage.generated_content.content}
                                </div>
                            </div>

                            {/* 메시지 메타 정보 */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">신뢰도:</span>
                                        <span className="ml-2 text-gray-600">
                                            {selectedMessage.generated_content.confidence_level || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">요약:</span>
                                        <span className="ml-2 text-gray-600">
                                            {selectedMessage.generated_content.summary}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">메시지 ID:</span>
                                        <span className="ml-2 text-gray-600 font-mono text-xs">
                                            {selectedMessage.message_id.substring(0, 8)}...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-4 text-gray-600">메시지를 선택하여 내용을 확인하세요</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 비교 분석 탭 컴포넌트
interface ComparisonAnalysisTabProps {
    companiesData: Record<string, CompanyData>;
    evaluationResult: EvaluationResult | null;
}

export const ComparisonAnalysisTab: React.FC<ComparisonAnalysisTabProps> = ({
    companiesData,
    evaluationResult
}) => {
    const [sortBy, setSortBy] = useState<'score' | 'risk' | 'name'>('score');

    const comparisonMatrix = constructionAnalyticsService.generateComparisonMatrix();

    if (!comparisonMatrix) {
        return (
            <div className="p-6 text-center">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600">비교분석 데이터가 없습니다.</p>
            </div>
        );
    }

    const sortedRankings = [...comparisonMatrix.rankings].sort((a, b) => {
        switch (sortBy) {
            case 'score':
                return b.total_score - a.total_score;
            case 'risk':
                const riskA = evaluationResult?.risk_assessments[a.company_id]?.overall_risk_score || 0;
                const riskB = evaluationResult?.risk_assessments[b.company_id]?.overall_risk_score || 0;
                return riskB - riskA;
            case 'name':
                const nameA = companiesData[a.company_id]?.company_name || '';
                const nameB = companiesData[b.company_id]?.company_name || '';
                return nameA.localeCompare(nameB);
            default:
                return 0;
        }
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">시공사 비교 분석</h2>
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">정렬:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="score">종합점수</option>
                        <option value="risk">위험점수</option>
                        <option value="name">회사명</option>
                    </select>
                </div>
            </div>

            {/* 비교 매트릭스 테이블 */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                순위
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                시공사명
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                종합점수
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                위험도
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                주요 강점
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                프로젝트 실적
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedRankings.map((ranking, index) => {
                            const company = companiesData[ranking.company_id];
                            const riskAssessment = evaluationResult?.risk_assessments[ranking.company_id];

                            return (
                                <tr key={ranking.company_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'}
                    `}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{company?.company_name}</div>
                                        <div className="text-sm text-gray-500">
                                            {company?.certifications.length || 0}개 인증보유
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-lg font-bold text-blue-600">
                                            {ranking.total_score.toFixed(1)}점
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${riskAssessment?.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                                                riskAssessment?.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}
                    `}>
                                            {riskAssessment?.risk_level || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {company?.strengths.slice(0, 2).join(', ') || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {company?.project_history.length || 0}건
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 생성된 메시지 탭 컴포넌트
interface GeneratedMessagesTabProps {
    messages: GeneratedMessage[];
    onGenerateMore: (messageType: 'recommendation' | 'comparison' | 'risk_analysis') => void;
}

export const GeneratedMessagesTab: React.FC<GeneratedMessagesTabProps> = ({
    messages,
    onGenerateMore
}) => {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">생성된 메시지</h2>
                <div className="text-sm text-gray-600">
                    총 {messages.length}개 메시지
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">생성된 메시지가 없습니다.</p>
                    <p className="text-sm text-gray-500">분석을 완료한 후 메시지를 생성해보세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {messages.map((message) => (
                        <div key={message.message_id} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {message.generated_content.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(message.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${message.message_type === 'recommendation' ? 'bg-blue-100 text-blue-800' :
                                        message.message_type === 'comparison' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'}
                `}>
                                    {message.message_type === 'recommendation' ? '추천' :
                                        message.message_type === 'comparison' ? '비교' : '위험분석'}
                                </span>
                            </div>

                            <div className="text-gray-600 text-sm mb-4">
                                {message.generated_content.summary}
                            </div>

                            <div className="flex space-x-2">
                                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                                    상세보기
                                </button>
                                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                                    복사
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 의사결정 이력 탭 컴포넌트
export const DecisionHistoryTab: React.FC = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDecisionHistory();
    }, []);

    const loadDecisionHistory = async () => {
        try {
            const result = await constructionAnalyticsService.getDecisionHistory();
            setHistory(result.history);
        } catch (error) {
            console.error('Error loading decision history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">이력을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">의사결정 이력</h2>

            {history.length === 0 ? (
                <div className="text-center py-12">
                    <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600">저장된 의사결정 이력이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((decision, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">의사결정 #{index + 1}</div>
                                    <div className="text-sm text-gray-500">
                                        {decision.timestamp ? new Date(decision.timestamp).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                                    상세보기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 