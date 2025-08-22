import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Calendar,
    Users,
    FileText,
    MessageSquare,
    Target,
    Clock,
    CheckCircle,
    AlertCircle,
    PieChart,
    LineChart,
    BarChart,
    Download,
    Filter,
    RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
    projects: {
        total: number;
        active: number;
        completed: number;
        archived: number;
        growth: number;
    };
    messages: {
        total: number;
        thisWeek: number;
        thisMonth: number;
        growth: number;
    };
    files: {
        total: number;
        totalSize: number;
        thisWeek: number;
        growth: number;
    };
    performance: {
        responseTime: number;
        accuracy: number;
        satisfaction: number;
        trend: 'up' | 'down' | 'stable';
    };
    activity: Array<{
        date: string;
        projects: number;
        messages: number;
        files: number;
    }>;
    topProjects: Array<{
        id: string;
        name: string;
        messageCount: number;
        fileCount: number;
        lastActivity: string;
        status: string;
    }>;
    recentActivity: Array<{
        id: string;
        type: 'project_created' | 'message_sent' | 'file_uploaded' | 'guideline_added';
        title: string;
        description: string;
        timestamp: string;
        projectId?: string;
        projectName?: string;
    }>;
}

interface ProjectAnalyticsProps {
    data: AnalyticsData;
    onRefresh?: () => void;
    onExport?: (format: 'pdf' | 'csv' | 'json') => void;
    onDateRangeChange?: (start: Date, end: Date) => void;
    isLoading?: boolean;
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({
    data,
    onRefresh,
    onExport,
    onDateRangeChange,
    isLoading = false
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [selectedMetric, setSelectedMetric] = useState<'projects' | 'messages' | 'files'>('projects');

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getGrowthColor = (growth: number) => {
        if (growth > 0) return 'text-green-600';
        if (growth < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Activity className="h-4 w-4 text-gray-500" />;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'project_created':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'message_sent':
                return <MessageSquare className="h-4 w-4 text-green-500" />;
            case 'file_uploaded':
                return <FileText className="h-4 w-4 text-purple-500" />;
            case 'guideline_added':
                return <Target className="h-4 w-4 text-orange-500" />;
            default:
                return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">프로젝트 분석</h2>
                    <p className="text-gray-600">프로젝트 성과 및 활동 현황을 확인하세요</p>
                </div>
                <div className="flex items-center space-x-3">
                    {/* 기간 선택 */}
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="7d">최근 7일</option>
                        <option value="30d">최근 30일</option>
                        <option value="90d">최근 90일</option>
                        <option value="1y">최근 1년</option>
                    </select>

                    {/* 새로고침 */}
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="새로고침"
                    >
                        <RefreshCw className={`h-4 w-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* 내보내기 */}
                    <div className="relative">
                        <button className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            <Download className="h-4 w-4" />
                            <span>내보내기</span>
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                                onClick={() => onExport?.('pdf')}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                PDF로 내보내기
                            </button>
                            <button
                                onClick={() => onExport?.('csv')}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                CSV로 내보내기
                            </button>
                            <button
                                onClick={() => onExport?.('json')}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                                JSON으로 내보내기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 프로젝트 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.projects.total)}</p>
                            <div className="flex items-center space-x-1 mt-2">
                                {getGrowthIcon(data.projects.growth)}
                                <span className={`text-sm font-medium ${getGrowthColor(data.projects.growth)}`}>
                                    {data.projects.growth > 0 ? '+' : ''}{data.projects.growth}%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>활성: {data.projects.active}</span>
                        <span>완료: {data.projects.completed}</span>
                    </div>
                </motion.div>

                {/* 메시지 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 메시지</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.messages.total)}</p>
                            <div className="flex items-center space-x-1 mt-2">
                                {getGrowthIcon(data.messages.growth)}
                                <span className={`text-sm font-medium ${getGrowthColor(data.messages.growth)}`}>
                                    {data.messages.growth > 0 ? '+' : ''}{data.messages.growth}%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>이번 주: {data.messages.thisWeek}</span>
                        <span>이번 달: {data.messages.thisMonth}</span>
                    </div>
                </motion.div>

                {/* 파일 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">총 파일</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.files.total)}</p>
                            <div className="flex items-center space-x-1 mt-2">
                                {getGrowthIcon(data.files.growth)}
                                <span className={`text-sm font-medium ${getGrowthColor(data.files.growth)}`}>
                                    {data.files.growth > 0 ? '+' : ''}{data.files.growth}%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        총 용량: {formatFileSize(data.files.totalSize)}
                    </div>
                </motion.div>

                {/* 성능 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">응답 시간</p>
                            <p className="text-2xl font-bold text-gray-900">{data.performance.responseTime}ms</p>
                            <div className="flex items-center space-x-1 mt-2">
                                {getGrowthIcon(data.performance.trend === 'up' ? 5 : data.performance.trend === 'down' ? -5 : 0)}
                                <span className="text-sm font-medium text-gray-600">
                                    {data.performance.accuracy}% 정확도
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Activity className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        만족도: {data.performance.satisfaction}/5
                    </div>
                </motion.div>
            </div>

            {/* 차트 및 상세 분석 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 활동 추이 */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">활동 추이</h3>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value as any)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="projects">프로젝트</option>
                            <option value="messages">메시지</option>
                            <option value="files">파일</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {data.activity.slice(-7).map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-purple-500 rounded-t"
                                    style={{
                                        height: `${((item[selectedMetric as keyof typeof item] as number) / Math.max(...data.activity.map(d => (d[selectedMetric as keyof typeof d] as number)))) * 200}px`
                                    }}
                                />
                                <span className="text-xs text-gray-500 mt-2">
                                    {new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 상위 프로젝트 */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 프로젝트</h3>
                    <div className="space-y-3">
                        {data.topProjects.map((project, index) => (
                            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{project.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {project.messageCount} 메시지 • {project.fileCount} 파일
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* 최근 활동 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
                <div className="space-y-4">
                    {data.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{activity.title}</p>
                                <p className="text-sm text-gray-600">{activity.description}</p>
                                {activity.projectName && (
                                    <p className="text-xs text-purple-600 mt-1">
                                        프로젝트: {activity.projectName}
                                    </p>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleDateString('ko-KR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectAnalytics;
