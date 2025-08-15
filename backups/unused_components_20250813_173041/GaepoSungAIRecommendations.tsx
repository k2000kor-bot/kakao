import React, { useState, useEffect } from 'react';
import { advancedMessageAPI } from '../services/advancedMessageAPI';

interface AIRecommendation {
    id: string;
    type: 'strategy' | 'action' | 'analysis' | 'warning';
    title: string;
    description: string;
    confidence: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    suggestedActions: string[];
    impact: string;
    createdAt: string;
    status: 'pending' | 'implemented' | 'rejected';
}

interface GaepoSungAIRecommendationsProps {
    roomId?: string;
}

const GaepoSungAIRecommendations: React.FC<GaepoSungAIRecommendationsProps> = ({ roomId }) => {
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'strategy' | 'action' | 'analysis' | 'warning'>('all');
    const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);

    useEffect(() => {
        if (roomId) {
            loadRecommendations();
        }
    }, [roomId]);

    const loadRecommendations = async () => {
        setIsLoading(true);
        try {
            // AI 추천 데이터 로드
            setRecommendations([
                {
                    id: '1',
                    type: 'strategy',
                    title: '시공사 평가 기준 최적화',
                    description: '현재 논의된 내용을 바탕으로 시공사 평가 기준을 더 객관적이고 체계적으로 개선할 수 있습니다.',
                    confidence: 0.92,
                    priority: 'high',
                    category: '시공사 선정',
                    suggestedActions: [
                        '평가 항목별 가중치 조정',
                        '정량적 평가 기준 추가',
                        '평가자 교육 프로그램 개발'
                    ],
                    impact: '시공사 선정의 객관성과 신뢰성 향상',
                    createdAt: '2025-07-25T10:30:00Z',
                    status: 'pending'
                },
                {
                    id: '2',
                    type: 'action',
                    title: '공사비 협상 전략 수립',
                    description: '현재 공사비 관련 논의를 분석한 결과, 체계적인 협상 전략이 필요합니다.',
                    confidence: 0.88,
                    priority: 'critical',
                    category: '비용 관리',
                    suggestedActions: [
                        '시공사별 공사비 상세 분석',
                        '협상 우선순위 설정',
                        '대안 시공사 검토'
                    ],
                    impact: '프로젝트 비용 최적화 및 예산 효율성 증대',
                    createdAt: '2025-07-25T11:15:00Z',
                    status: 'pending'
                },
                {
                    id: '3',
                    type: 'analysis',
                    title: '설계 품질 비교 분석 강화',
                    description: '설계 품질 관련 논의가 부족한 것으로 분석됩니다. 더 상세한 비교 분석이 필요합니다.',
                    confidence: 0.85,
                    priority: 'medium',
                    category: '설계 검토',
                    suggestedActions: [
                        '평면도 상세 비교 분석',
                        '커뮤니티 시설 설계 검토',
                        '사용자 편의성 평가'
                    ],
                    impact: '최종 설계 품질 향상 및 사용자 만족도 증대',
                    createdAt: '2025-07-25T12:00:00Z',
                    status: 'pending'
                },
                {
                    id: '4',
                    type: 'warning',
                    title: '홍보 전략 재검토 필요',
                    description: '홍보 방식에 대한 부정적 반응이 지속되고 있습니다. 전략적 접근이 필요합니다.',
                    confidence: 0.78,
                    priority: 'high',
                    category: '마케팅',
                    suggestedActions: [
                        '홍보 메시지 재구성',
                        '대상 고객층 재분석',
                        '소통 방식 개선'
                    ],
                    impact: '프로젝트 홍보 효과성 증대 및 부정적 인식 개선',
                    createdAt: '2025-07-25T13:45:00Z',
                    status: 'pending'
                },
                {
                    id: '5',
                    type: 'strategy',
                    title: '팀 협업 프로세스 개선',
                    description: '팀원 간 협업 패턴을 분석한 결과, 의사소통 효율성을 높일 수 있는 방안이 있습니다.',
                    confidence: 0.91,
                    priority: 'medium',
                    category: '팀 관리',
                    suggestedActions: [
                        '정기 회의 일정 최적화',
                        '정보 공유 플랫폼 도입',
                        '역할 분담 명확화'
                    ],
                    impact: '팀 생산성 향상 및 의사결정 속도 개선',
                    createdAt: '2025-07-25T14:30:00Z',
                    status: 'pending'
                }
            ]);
        } catch (error) {
            console.error('AI 추천 로딩 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'strategy':
                return '🎯';
            case 'action':
                return '⚡';
            case 'analysis':
                return '📊';
            case 'warning':
                return '⚠️';
            default:
                return '💡';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'implemented':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredRecommendations = recommendations.filter(rec =>
        activeFilter === 'all' || rec.type === activeFilter
    );

    const renderRecommendationCard = (recommendation: AIRecommendation) => (
        <div
            key={recommendation.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedRecommendation(recommendation)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(recommendation.type)}</span>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                        <p className="text-sm text-gray-500">{recommendation.category}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recommendation.status)}`}>
                        {recommendation.status}
                    </span>
                </div>
            </div>

            <p className="text-gray-600 mb-4">{recommendation.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500">
                <span>신뢰도: {(recommendation.confidence * 100).toFixed(0)}%</span>
                <span>영향: {recommendation.impact}</span>
            </div>
        </div>
    );

    const renderRecommendationDetail = () => {
        if (!selectedRecommendation) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl">{getTypeIcon(selectedRecommendation.type)}</span>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{selectedRecommendation.title}</h2>
                                <p className="text-sm text-gray-500">{selectedRecommendation.category}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedRecommendation(null)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="닫기"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">설명</h3>
                            <p className="text-gray-600">{selectedRecommendation.description}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">제안 액션</h3>
                            <ul className="space-y-2">
                                {selectedRecommendation.suggestedActions.map((action, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span className="text-gray-600">{action}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">신뢰도</h3>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${selectedRecommendation.confidence * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{(selectedRecommendation.confidence * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">우선순위</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedRecommendation.priority)}`}>
                                    {selectedRecommendation.priority}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">예상 영향</h3>
                            <p className="text-gray-600">{selectedRecommendation.impact}</p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                구현하기
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                나중에
                            </button>
                            <button className="flex-1 px-4 py-2 bg-red-200 text-red-700 rounded-lg hover:bg-red-300">
                                거부하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">AI 추천 시스템</h2>
                        <p className="text-sm text-gray-500 mt-1">개포우성7차 프로젝트를 위한 AI 기반 추천사항</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">총 {recommendations.length}개 추천</span>
                    </div>
                </div>
            </div>

            {/* 필터 */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex space-x-4">
                    {[
                        { id: 'all', name: '전체', count: recommendations.length },
                        { id: 'strategy', name: '전략', count: recommendations.filter(r => r.type === 'strategy').length },
                        { id: 'action', name: '액션', count: recommendations.filter(r => r.type === 'action').length },
                        { id: 'analysis', name: '분석', count: recommendations.filter(r => r.type === 'analysis').length },
                        { id: 'warning', name: '경고', count: recommendations.filter(r => r.type === 'warning').length }
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === filter.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {filter.name} ({filter.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* 추천 목록 */}
            <div className="space-y-4">
                {filteredRecommendations.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">추천사항이 없습니다</h3>
                        <p className="text-gray-500">현재 조건에 맞는 AI 추천사항이 없습니다.</p>
                    </div>
                ) : (
                    filteredRecommendations.map(renderRecommendationCard)
                )}
            </div>

            {/* 상세 모달 */}
            {renderRecommendationDetail()}
        </div>
    );
};

export default GaepoSungAIRecommendations; 