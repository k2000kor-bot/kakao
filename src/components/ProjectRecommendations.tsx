import React, { useState, useEffect } from 'react';
import {
    Lightbulb,
    TrendingUp,
    Zap,
    Target,
    Calendar,
    ArrowRight,
    Brain,
    Star,
    AlertCircle
} from 'lucide-react';

interface PriorityAction {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    estimated_impact: number;
    effort_required: string;
    timeline: string;
}

interface ProjectRecommendations {
    project_id: string;
    priority_actions: PriorityAction[];
    ai_suggestions: {
        automation_opportunities: string[];
        skill_gaps: string[];
        resource_optimization: string[];
    };
    success_factors: string[];
    next_milestones: Array<{
        date: string;
        title: string;
        description: string;
    }>;
}

interface ProjectRecommendationsProps {
    projectId: string;
    isVisible: boolean;
    onClose: () => void;
    onApplyRecommendation?: (recommendation: PriorityAction) => void;
}

const ProjectRecommendationsComponent: React.FC<ProjectRecommendationsProps> = ({
    projectId,
    isVisible,
    onClose,
    onApplyRecommendation
}) => {
    const [recommendations, setRecommendations] = useState<ProjectRecommendations | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const fetchRecommendations = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:8000/api/v7/projects/${projectId}/recommendations`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setRecommendations(data.recommendations);
                }
            }
        } catch (err) {
            setError('추천사항을 가져오는 중 오류가 발생했습니다.');
            console.error('프로젝트 추천사항 오류:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible && projectId) {
            fetchRecommendations();
        }
    }, [isVisible, projectId]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertCircle size={16} className="text-red-600" />;
            case 'medium': return <Target size={16} className="text-yellow-600" />;
            case 'low': return <TrendingUp size={16} className="text-green-600" />;
            default: return <Lightbulb size={16} className="text-gray-600" />;
        }
    };

    const getEffortColor = (effort: string) => {
        switch (effort) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredActions = recommendations?.priority_actions.filter(action =>
        selectedCategory === 'all' || action.category === selectedCategory
    ) || [];

    const categories = [...new Set(recommendations?.priority_actions.map(action => action.category) || [])];

    const handleApplyRecommendation = (action: PriorityAction) => {
        if (onApplyRecommendation) {
            onApplyRecommendation(action);
        }

        // 알림 추가
        (window as any).addNotification?.({
            type: 'success',
            title: '추천사항 적용',
            message: `"${action.title}" 추천사항이 적용되었습니다.`,
            duration: 4000
        });
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Lightbulb className="mr-2" size={28} />
                            프로젝트 개선 추천
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
                            <p className="mt-2 text-gray-600">추천사항을 불러오는 중...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchRecommendations}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                다시 시도
                            </button>
                        </div>
                    )}

                    {recommendations && (
                        <div className="space-y-6">
                            {/* 우선순위 액션 */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold flex items-center">
                                        <Star className="mr-2" size={20} />
                                        우선순위 액션
                                    </h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`px-3 py-1 rounded text-sm ${selectedCategory === 'all'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            전체
                                        </button>
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`px-3 py-1 rounded text-sm capitalize ${selectedCategory === category
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredActions.map((action, index) => (
                                        <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center">
                                                    {getPriorityIcon(action.priority)}
                                                    <span className={`ml-2 px-2 py-1 rounded text-xs border ${getPriorityColor(action.priority)}`}>
                                                        {action.priority}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500 capitalize">{action.category}</span>
                                            </div>

                                            <h4 className="font-semibold text-gray-800 mb-2">{action.title}</h4>
                                            <p className="text-sm text-gray-600 mb-3">{action.description}</p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">예상 효과:</span>
                                                    <span className="font-medium">{(action.estimated_impact * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">필요 노력:</span>
                                                    <span className={`font-medium ${getEffortColor(action.effort_required)}`}>
                                                        {action.effort_required}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">예상 기간:</span>
                                                    <span className="font-medium">{action.timeline}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleApplyRecommendation(action)}
                                                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                                            >
                                                적용하기
                                                <ArrowRight size={16} className="ml-2" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI 제안사항 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Brain className="mr-2" size={20} />
                                    AI 제안사항
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-3 flex items-center">
                                            <Zap className="mr-2" size={16} />
                                            자동화 기회
                                        </h4>
                                        <div className="space-y-2">
                                            {recommendations.ai_suggestions.automation_opportunities.map((opportunity, index) => (
                                                <div key={index} className="bg-white p-3 rounded border-l-4 border-yellow-400">
                                                    <p className="text-sm">{opportunity}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3 flex items-center">
                                            <Target className="mr-2" size={16} />
                                            스킬 개발
                                        </h4>
                                        <div className="space-y-2">
                                            {recommendations.ai_suggestions.skill_gaps.map((gap, index) => (
                                                <div key={index} className="bg-white p-3 rounded border-l-4 border-purple-400">
                                                    <p className="text-sm">{gap}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3 flex items-center">
                                            <TrendingUp className="mr-2" size={16} />
                                            리소스 최적화
                                        </h4>
                                        <div className="space-y-2">
                                            {recommendations.ai_suggestions.resource_optimization.map((optimization, index) => (
                                                <div key={index} className="bg-white p-3 rounded border-l-4 border-green-400">
                                                    <p className="text-sm">{optimization}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 성공 요인 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4">성공 요인</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {recommendations.success_factors.map((factor, index) => (
                                        <div key={index} className="flex items-start bg-white p-3 rounded">
                                            <Star className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={16} />
                                            <p className="text-sm">{factor}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 다음 마일스톤 */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Calendar className="mr-2" size={20} />
                                    다음 마일스톤
                                </h3>
                                <div className="space-y-3">
                                    {recommendations.next_milestones.map((milestone, index) => (
                                        <div key={index} className="flex items-start bg-white p-4 rounded border-l-4 border-blue-400">
                                            <div className="flex-shrink-0 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-4">
                                                {formatDate(milestone.date)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800 mb-1">{milestone.title}</h4>
                                                <p className="text-sm text-gray-600">{milestone.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            AI 기반 프로젝트 개선 추천사항
                        </div>
                        <button
                            onClick={fetchRecommendations}
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

export default ProjectRecommendationsComponent;
