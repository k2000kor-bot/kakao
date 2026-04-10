import React, { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    FileText,
    MessageSquare,
    Target,
    Download,
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
    onDateRangeChange: _onDateRangeChange,
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
        if (growth > 0) return 'bw-text-success';
        if (growth < 0) return 'bw-text-error';
        return 'bw-text-muted';
    };

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <TrendingUp className="h-4 w-4 bw-text-success" />;
        if (growth < 0) return <TrendingDown className="h-4 w-4 bw-text-error" />;
        return <Activity className="h-4 w-4 bw-text-muted" />;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'project_created':
                return <FileText className="h-4 w-4 bw-text-info" />;
            case 'message_sent':
                return <MessageSquare className="h-4 w-4 bw-text-success" />;
            case 'file_uploaded':
                return <FileText className="h-4 w-4 bw-text-info" />;
            case 'guideline_added':
                return <Target className="h-4 w-4" style={{ color: 'var(--accent-orange)' }} />;
            default:
                return <Activity className="h-4 w-4 bw-text-muted" />;
        }
    };

    const getStatusStyle = (status: string): React.CSSProperties => {
        switch (status) {
            case 'active':
                return { background: 'var(--accent-success-muted)', color: 'var(--accent-success)' };
            case 'completed':
                return { background: 'var(--accent-info-muted)', color: 'var(--accent-info)' };
            case 'archived':
            default:
                return { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
        }
    };

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="bw-heading-1 mb-1">프로젝트 분석</h2>
                    <p className="bw-text-secondary">프로젝트 성과 및 활동 현황을 확인하세요</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
                        className="bw-input"
                    >
                        <option value="7d">최근 7일</option>
                        <option value="30d">최근 30일</option>
                        <option value="90d">최근 90일</option>
                        <option value="1y">최근 1년</option>
                    </select>

                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="bw-btn-ghost p-2"
                        title="새로고침"
                    >
                        <RefreshCw className={`h-4 w-4 bw-text-secondary ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <div className="relative">
                        <button className="bw-btn-primary flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span>내보내기</span>
                        </button>
                        <div className="absolute right-0 top-full mt-1 bw-card py-1 z-[var(--z-base)] min-w-[160px]">
                            <button
                                onClick={() => onExport?.('pdf')}
                                className="block w-full text-left px-4 py-2 text-sm bw-btn-ghost rounded-none"
                            >
                                PDF로 내보내기
                            </button>
                            <button
                                onClick={() => onExport?.('csv')}
                                className="block w-full text-left px-4 py-2 text-sm bw-btn-ghost rounded-none"
                            >
                                CSV로 내보내기
                            </button>
                            <button
                                onClick={() => onExport?.('json')}
                                className="block w-full text-left px-4 py-2 text-sm bw-btn-ghost rounded-none"
                            >
                                JSON으로 내보내기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 주요 지표 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bw-card p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium bw-text-secondary">총 프로젝트</p>
                            <p className="text-2xl font-bold bw-text-primary">{formatNumber(data.projects.total)}</p>
                            <div className="flex items-center space-x-1 mt-2">
                                {getGrowthIcon(data.projects.growth)}
                                <span className={`text-sm font-medium ${getGrowthColor(data.projects.growth)}`}>
                                    {data.projects.growth > 0 ? '+' : ''}{data.projects.growth}%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: 'var(--accent-info-muted)' }}>
                            <FileText className="h-6 w-6 bw-text-info" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm bw-text-muted">
                        <span>활성: {data.projects.active}</span>
                        <span>완료: {data.projects.completed}</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bw-card p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium bw-text-secondary">총 메시지</p>
                            <p className="text-2xl font-bold bw-text-primary">{formatNumber(data.messages.total)}</p>
                            <div className="flex items-center space-x-1 mt-2">
                                {getGrowthIcon(data.messages.growth)}
                                <span className={`text-sm font-medium ${getGrowthColor(data.messages.growth)}`}>
                                    {data.messages.growth > 0 ? '+' : ''}{data.messages.growth}%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: 'var(--accent-success-muted)' }}>
                            <MessageSquare className="h-6 w-6 bw-text-success" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm bw-text-muted">
                        <span>이번 주: {data.messages.thisWeek}</span>
                        <span>이번 달: {data.messages.thisMonth}</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bw-card p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium bw-text-secondary">총 파일</p>
                            <p className="text-2xl font-bold bw-text-primary">{formatNumber(data.files.total)}</p>
                            <div className="flex items-center space-x-1 mt-2">
                                {getGrowthIcon(data.files.growth)}
                                <span className={`text-sm font-medium ${getGrowthColor(data.files.growth)}`}>
                                    {data.files.growth > 0 ? '+' : ''}{data.files.growth}%
                                </span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: 'var(--accent-secondary-muted)' }}>
                            <FileText className="h-6 w-6" style={{ color: 'var(--accent-secondary)' }} />
                        </div>
                    </div>
                    <div className="mt-4 text-sm bw-text-muted">
                        총 용량: {formatFileSize(data.files.totalSize)}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bw-card p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium bw-text-secondary">응답 시간</p>
                            <p className="text-2xl font-bold bw-text-primary">{data.performance.responseTime}ms</p>
                            <div className="flex items-center space-x-1 mt-2">
                                {getGrowthIcon(data.performance.trend === 'up' ? 5 : data.performance.trend === 'down' ? -5 : 0)}
                                <span className="text-sm font-medium bw-text-muted">
                                    {data.performance.accuracy}% 정확도
                                </span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: 'var(--accent-warning-muted)' }}>
                            <Activity className="h-6 w-6 bw-text-warning" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm bw-text-muted">
                        만족도: {data.performance.satisfaction}/5
                    </div>
                </motion.div>
            </div>

            {/* 차트 및 상세 분석 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bw-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="bw-heading-2 mb-0">활동 추이</h3>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value as 'projects' | 'messages' | 'files')}
                            className="bw-input text-sm py-1"
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
                                    className="w-full rounded-t transition-all"
                                    style={{
                                        height: `${((item[selectedMetric as keyof typeof item] as number) / Math.max(...data.activity.map(d => (d[selectedMetric as keyof typeof d] as number)))) * 200}px`,
                                        backgroundColor: 'var(--accent-info)'
                                    }}
                                />
                                <span className="text-xs bw-text-muted mt-2">
                                    {new Date(item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bw-card p-6"
                >
                    <h3 className="bw-heading-2 mb-4">상위 프로젝트</h3>
                    <div className="space-y-3">
                        {data.topProjects.map((project, index) => (
                            <div key={project.id} className="flex items-center justify-between p-3 bw-card-secondary rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent-secondary-muted)', color: 'var(--accent-secondary)' }}>
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium bw-text-primary">{project.name}</p>
                                        <p className="text-sm bw-text-muted">
                                            {project.messageCount} 메시지 • {project.fileCount} 파일
                                        </p>
                                    </div>
                                </div>
                                <span className="bw-badge shrink-0" style={getStatusStyle(project.status)}>
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* 최근 활동 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bw-card p-6"
            >
                <h3 className="bw-heading-2 mb-4">최근 활동</h3>
                <div className="space-y-4">
                    {data.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bw-card-secondary rounded-lg transition-colors hover:opacity-90">
                            <div className="p-2 rounded-lg shrink-0" style={{ background: 'var(--bg-tertiary)' }}>
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium bw-text-primary">{activity.title}</p>
                                <p className="text-sm bw-text-secondary">{activity.description}</p>
                                {activity.projectName && (
                                    <p className="text-xs bw-text-info mt-1">
                                        프로젝트: {activity.projectName}
                                    </p>
                                )}
                            </div>
                            <div className="text-xs bw-text-muted shrink-0">
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
