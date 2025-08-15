import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Calendar,
    Target,
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    Brain
} from 'lucide-react';

interface ProjectAnalytics {
    project_id: string;
    overview: {
        completion_rate: number;
        total_tasks: number;
        completed_tasks: number;
        team_members: number;
        active_discussions: number;
    };
    progress_timeline: Array<{
        date: string;
        milestone: string;
        completion: number;
        notes: string;
    }>;
    team_performance: {
        productivity_score: number;
        collaboration_rating: number;
        code_quality: number;
        communication_frequency: number;
    };
    risk_assessment: {
        overall_risk: string;
        identified_risks: Array<{
            type: string;
            description: string;
            probability: number;
            impact: string;
        }>;
        mitigation_suggestions: string[];
    };
    ai_insights: {
        predicted_completion_date: string;
        success_probability: number;
        recommended_actions: string[];
        optimization_opportunities: string[];
    };
    resource_utilization: {
        budget_usage: number;
        time_allocation: {
            development: number;
            testing: number;
            documentation: number;
            meetings: number;
        };
        skill_distribution: {
            frontend: number;
            backend: number;
            devops: number;
            design: number;
        };
    };
}

interface ProjectAnalyticsDashboardProps {
    projectId: string;
    isVisible: boolean;
    onClose: () => void;
}

const ProjectAnalyticsDashboard: React.FC<ProjectAnalyticsDashboardProps> = ({
    projectId,
    isVisible,
    onClose
}) => {
    const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:8000/api/v7/projects/${projectId}/analytics`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setAnalytics(data.analytics);
                }
            }
        } catch (err) {
            setError('분석 데이터를 가져오는 중 오류가 발생했습니다.');
            console.error('프로젝트 분석 오류:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible && projectId) {
            fetchAnalytics();
        }
    }, [isVisible, projectId]);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getProgressColor = (completion: number) => {
        if (completion >= 0.8) return 'bg-green-500';
        if (completion >= 0.6) return 'bg-yellow-500';
        if (completion >= 0.3) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <BarChart3 className="mr-2" size={28} />
                            프로젝트 상세 분석
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">분석 데이터를 불러오는 중...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchAnalytics}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {analytics && (
                        <div className="space-y-6">
                            {/* 개요 */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Target className="text-blue-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">완료율</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {(analytics.overview.completion_rate * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <CheckCircle className="text-green-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">완료된 작업</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {analytics.overview.completed_tasks}/{analytics.overview.total_tasks}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Users className="text-purple-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">팀원</p>
                                            <p className="text-xl font-bold text-purple-600">
                                                {analytics.overview.team_members}명
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <TrendingUp className="text-orange-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">성공 확률</p>
                                            <p className="text-xl font-bold text-orange-600">
                                                {(analytics.ai_insights.success_probability * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <Calendar className="text-yellow-600 mr-2" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-600">예상 완료</p>
                                            <p className="text-sm font-bold text-yellow-600">
                                                {formatDate(analytics.ai_insights.predicted_completion_date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 진행 타임라인 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Clock className="mr-2" size={20} />
                                    진행 타임라인
                                </h3>
                                <div className="space-y-3">
                                    {analytics.progress_timeline.map((milestone, index) => (
                                        <div key={index} className="flex items-center bg-white p-3 rounded">
                                            <div className="flex-shrink-0 w-24 text-sm text-gray-600">
                                                {formatDate(milestone.date)}
                                            </div>
                                            <div className="flex-1 mx-4">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium">{milestone.milestone}</span>
                                                    <span className="text-sm text-gray-600">
                                                        {(milestone.completion * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${getProgressColor(milestone.completion)}`}
                                                        style={{ width: `${milestone.completion * 100}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{milestone.notes}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 팀 성과 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Users className="mr-2" size={20} />
                                    팀 성과
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {(analytics.team_performance.productivity_score * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">생산성 점수</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {(analytics.team_performance.collaboration_rating * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">협업 평가</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {(analytics.team_performance.code_quality * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-600">코드 품질</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {analytics.team_performance.communication_frequency}
                                        </div>
                                        <div className="text-sm text-gray-600">소통 빈도</div>
                                    </div>
                                </div>
                            </div>

                            {/* 위험 평가 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <AlertTriangle className="mr-2" size={20} />
                                    위험 평가
                                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getRiskColor(analytics.risk_assessment.overall_risk)}`}>
                                        {analytics.risk_assessment.overall_risk}
                                    </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">식별된 위험</h4>
                                        <div className="space-y-2">
                                            {analytics.risk_assessment.identified_risks.map((risk, index) => (
                                                <div key={index} className="bg-white p-3 rounded border-l-4 border-yellow-400">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">{risk.description}</p>
                                                            <p className="text-sm text-gray-600">타입: {risk.type}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm text-gray-600">
                                                                확률: {(risk.probability * 100).toFixed(0)}%
                                                            </div>
                                                            <div className={`text-sm px-2 py-1 rounded ${getRiskColor(risk.impact)}`}>
                                                                {risk.impact}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">완화 방안</h4>
                                        <div className="space-y-2">
                                            {analytics.risk_assessment.mitigation_suggestions.map((suggestion, index) => (
                                                <div key={index} className="bg-white p-3 rounded border-l-4 border-green-400">
                                                    <p className="text-sm">{suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI 인사이트 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Brain className="mr-2" size={20} />
                                    AI 인사이트
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">권장 액션</h4>
                                        <div className="space-y-2">
                                            {analytics.ai_insights.recommended_actions.map((action, index) => (
                                                <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-400">
                                                    <p className="text-sm">{action}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">최적화 기회</h4>
                                        <div className="space-y-2">
                                            {analytics.ai_insights.optimization_opportunities.map((opportunity, index) => (
                                                <div key={index} className="bg-white p-3 rounded border-l-4 border-purple-400">
                                                    <p className="text-sm">{opportunity}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 리소스 활용 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <DollarSign className="mr-2" size={20} />
                                    리소스 활용
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">예산 사용률</h4>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">
                                                {(analytics.resource_utilization.budget_usage * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">시간 배분</h4>
                                        <div className="space-y-2">
                                            {Object.entries(analytics.resource_utilization.time_allocation).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-sm">{key}</span>
                                                    <span className="text-sm font-medium">{(value * 100).toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">스킬 분포</h4>
                                        <div className="space-y-2">
                                            {Object.entries(analytics.resource_utilization.skill_distribution).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-sm">{key}</span>
                                                    <span className="text-sm font-medium">{(value * 100).toFixed(0)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            실시간 프로젝트 분석 데이터
                        </div>
                        <button
                            onClick={fetchAnalytics}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalyticsDashboard;
