import React, { useState, useEffect } from 'react';
import {
    BookOpenIcon,
    DocumentTextIcon,
    LightBulbIcon,
    ChartBarIcon,
    TagIcon,
    UsersIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    SparklesIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { clientFileProcessor, ProjectKnowledgeBase, WritingMaterial } from '../services/clientFileProcessor';
import { learningFeedbackSystem, LearningMetrics } from '../services/learningFeedbackSystem';

interface KnowledgeBaseDashboardProps {
    projectId: string;
}

interface KnowledgeStats {
    totalFiles: number;
    totalTopics: number;
    totalEntities: number;
    totalMaterials: number;
    lastUpdate: Date | null;
    confidenceScore: number;
}

const KnowledgeBaseDashboard: React.FC<KnowledgeBaseDashboardProps> = ({ projectId }) => {
    const [knowledgeBase, setKnowledgeBase] = useState<ProjectKnowledgeBase | null>(null);
    const [writingMaterials, setWritingMaterials] = useState<WritingMaterial[]>([]);
    const [learningStats, setLearningStats] = useState<LearningMetrics | null>(null);
    const [stats, setStats] = useState<KnowledgeStats>({
        totalFiles: 0,
        totalTopics: 0,
        totalEntities: 0,
        totalMaterials: 0,
        lastUpdate: null,
        confidenceScore: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    // 데이터 로드
    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // 지식 베이스 로드
            const kb = clientFileProcessor.getKnowledgeBase(projectId);
            setKnowledgeBase(kb);

            // 글쓰기 소재 로드
            const materials = clientFileProcessor.getWritingMaterials(projectId);
            setWritingMaterials(materials);

            // 학습 통계 로드
            const learning = learningFeedbackSystem.getLearningStatistics(projectId);
            setLearningStats(learning.metrics);

            // 통계 계산
            if (kb) {
                // 모든 카테고리의 아이템 수를 합산하여 엔티티 수로 사용
                const totalEntities = Object.values(kb.categories).reduce((sum, items) => sum + items.length, 0);

                setStats({
                    totalFiles: kb.totalFiles,
                    totalTopics: kb.keyConcepts.length,
                    totalEntities,
                    totalMaterials: materials.length,
                    lastUpdate: kb.lastUpdated,
                    confidenceScore: 0.75 // 기본 신뢰도
                });
            }
        } catch (error) {
            console.error('대시보드 데이터 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();

        // 이벤트 리스너 등록 (파일/지식/소재/AI학습 모두 갱신 트리거)
        const refresher = () => {
            console.log('지식 베이스 대시보드 새로고침 트리거됨');
            loadDashboardData();
        };
        
        window.addEventListener('knowledgeBaseUpdated', refresher);
        window.addEventListener('writingMaterialsUpdated', refresher);
        window.addEventListener('projectFilesUpdated', refresher as EventListener);
        window.addEventListener('aiLearningUpdated', refresher);

        // 주기적 새로고침 (5초마다)
        const intervalId = setInterval(() => {
            loadDashboardData();
        }, 5000);

        return () => {
            window.removeEventListener('knowledgeBaseUpdated', refresher);
            window.removeEventListener('writingMaterialsUpdated', refresher);
            window.removeEventListener('projectFilesUpdated', refresher as EventListener);
            window.removeEventListener('aiLearningUpdated', refresher);
            clearInterval(intervalId);
        };
    }, [projectId]);

    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600 bg-green-100';
        if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getConfidenceText = (score: number) => {
        if (score >= 0.8) return '높음';
        if (score >= 0.6) return '보통';
        return '낮음';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpenIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">지식 베이스 현황</h3>
                            <p className="text-sm text-gray-500">
                                {stats.lastUpdate ?
                                    `마지막 업데이트: ${stats.lastUpdate.toLocaleDateString()} ${stats.lastUpdate.toLocaleTimeString()}` :
                                    '아직 파일이 업로드되지 않았습니다'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(stats.confidenceScore)}`}>
                            <SparklesIcon className="w-4 h-4 mr-1" />
                            신뢰도 {getConfidenceText(stats.confidenceScore)} ({(stats.confidenceScore * 100).toFixed(0)}%)
                        </span>
                    </div>
                </div>
            </div>

            {/* 통계 카드 */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* 총 파일 수 */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">총 파일</p>
                                <p className="text-2xl font-bold text-blue-700">{stats.totalFiles}</p>
                            </div>
                            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    {/* 총 주제 수 */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">주요 주제</p>
                                <p className="text-2xl font-bold text-green-700">{stats.totalTopics}</p>
                            </div>
                            <TagIcon className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    {/* 추출된 엔티티 */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">추출 정보</p>
                                <p className="text-2xl font-bold text-purple-700">{stats.totalEntities}</p>
                            </div>
                            <UsersIcon className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>

                    {/* 글쓰기 소재 */}
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">글쓰기 소재</p>
                                <p className="text-2xl font-bold text-yellow-700">{stats.totalMaterials}</p>
                            </div>
                            <LightBulbIcon className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* 상세 정보 섹션 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 주요 개념 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">주요 개념</h4>
                            <ChartBarIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        {knowledgeBase && knowledgeBase.keyConcepts.length > 0 ? (
                            <div className="space-y-2">
                                {knowledgeBase.keyConcepts.slice(0, 5).map((concept, index) => (
                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                        <span className="text-sm text-gray-700">{concept}</span>
                                        <span className="text-xs text-gray-500">#{index + 1}</span>
                                    </div>
                                ))}
                                {knowledgeBase.keyConcepts.length > 5 && (
                                    <p className="text-xs text-gray-500 mt-2">+{knowledgeBase.keyConcepts.length - 5}개 더</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">아직 분석된 개념이 없습니다.</p>
                        )}
                    </div>

                    {/* 학습 통계 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">AI 학습 현황</h4>
                            <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        {learningStats && learningStats.totalFeedbacks > 0 ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">총 피드백</span>
                                    <span className="text-sm font-medium">{learningStats.totalFeedbacks}개</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">만족도</span>
                                    <span className={`text-sm font-medium ${learningStats.positiveRate > 0.7 ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {(learningStats.positiveRate * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">개선 트렌드</span>
                                    <span className={`text-sm font-medium ${learningStats.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {learningStats.improvementTrend >= 0 ? '↗️' : '↘️'} {(Math.abs(learningStats.improvementTrend) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <ExclamationTriangleIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">아직 학습 데이터가 없습니다.</p>
                                <p className="text-xs text-gray-400 mt-1">AI와 대화하고 피드백을 주세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 최근 글쓰기 소재 요약 섹션은 사용자 요청에 따라 제거됨 */}
            </div>
        </div>
    );
};

export default KnowledgeBaseDashboard;
