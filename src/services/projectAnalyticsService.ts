/**
 * 프로젝트 통계 및 분석 서비스
 * 프로젝트 활동, 성과, 트렌드 분석
 * 
 * Task-B4: 프로젝트 허브 확장
 */

export interface ProjectAnalytics {
    projectId: string;
    projectName: string;
    totalMessages: number;
    totalSessions: number;
    totalFiles: number;
    activityTrend: Array<{ date: string; count: number }>;
    messageGrowth: number; // 전월 대비 증가율 (%)
    averageResponseTime: number; // 평균 응답 시간 (ms)
    mostActiveTime: string; // 가장 활발한 시간대
    topKeywords: Array<{ keyword: string; count: number }>;
    completionRate: number; // 완료율 (%)
    engagementScore: number; // 참여도 점수 (0-100)
}

export interface ProjectComparison {
    projectId: string;
    projectName: string;
    metrics: {
        messages: number;
        sessions: number;
        files: number;
        engagement: number;
    };
    rank: number;
    trend: 'up' | 'down' | 'stable';
}

class ProjectAnalyticsService {
    private storageKey = 'corbu_project_analytics';

    /**
     * 프로젝트 통계 계산
     */
    async getProjectAnalytics(
        projectId: string,
        projectName: string,
        messages: any[],
        sessions: any[],
        files: any[]
    ): Promise<ProjectAnalytics> {
        const totalMessages = messages.length;
        const totalSessions = sessions.length;
        const totalFiles = files.length;

        // 활동 트렌드 (최근 30일)
        const activityTrend = this.calculateActivityTrend(messages);

        // 메시지 증가율 (전월 대비)
        const messageGrowth = this.calculateMessageGrowth(messages);

        // 평균 응답 시간 (시뮬레이션)
        const averageResponseTime = this.calculateAverageResponseTime(messages);

        // 가장 활발한 시간대
        const mostActiveTime = this.calculateMostActiveTime(messages);

        // 주요 키워드
        const topKeywords = this.extractTopKeywords(messages);

        // 완료율 (세션 기준)
        const completionRate = this.calculateCompletionRate(sessions);

        // 참여도 점수
        const engagementScore = this.calculateEngagementScore(
            totalMessages,
            totalSessions,
            activityTrend
        );

        return {
            projectId,
            projectName,
            totalMessages,
            totalSessions,
            totalFiles,
            activityTrend,
            messageGrowth,
            averageResponseTime,
            mostActiveTime,
            topKeywords,
            completionRate,
            engagementScore,
        };
    }

    /**
     * 활동 트렌드 계산
     */
    private calculateActivityTrend(messages: any[]): Array<{ date: string; count: number }> {
        const trend = new Map<string, number>();
        const now = new Date();

        // 최근 30일 초기화
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trend.set(dateStr, 0);
        }

        // 메시지 날짜별 집계
        messages.forEach(msg => {
            if (msg.timestamp) {
                const date = new Date(msg.timestamp);
                const dateStr = date.toISOString().split('T')[0];
                const count = trend.get(dateStr) || 0;
                trend.set(dateStr, count + 1);
            }
        });

        return Array.from(trend.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * 메시지 증가율 계산
     */
    private calculateMessageGrowth(messages: any[]): number {
        const now = new Date();
        const thisMonth = messages.filter(msg => {
            const msgDate = new Date(msg.timestamp);
            return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
        }).length;

        const lastMonth = messages.filter(msg => {
            const msgDate = new Date(msg.timestamp);
            const lastMonthDate = new Date(now);
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            return msgDate.getMonth() === lastMonthDate.getMonth() && msgDate.getFullYear() === lastMonthDate.getFullYear();
        }).length;

        if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
        return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    }

    /**
     * 평균 응답 시간 계산
     */
    private calculateAverageResponseTime(messages: any[]): number {
        // 실제로는 메시지 메타데이터에서 가져와야 함
        // 여기서는 시뮬레이션
        return 1200; // 1.2초
    }

    /**
     * 가장 활발한 시간대 계산
     */
    private calculateMostActiveTime(messages: any[]): string {
        const timeSlots = new Map<string, number>();

        messages.forEach(msg => {
            if (msg.timestamp) {
                const date = new Date(msg.timestamp);
                const hour = date.getHours();
                let timeSlot: string;

                if (hour >= 6 && hour < 12) timeSlot = '오전 (6-12시)';
                else if (hour >= 12 && hour < 18) timeSlot = '오후 (12-18시)';
                else if (hour >= 18 && hour < 24) timeSlot = '저녁 (18-24시)';
                else timeSlot = '새벽 (0-6시)';

                timeSlots.set(timeSlot, (timeSlots.get(timeSlot) || 0) + 1);
            }
        });

        if (timeSlots.size === 0) return '오후 (12-18시)';

        const sorted = Array.from(timeSlots.entries()).sort((a, b) => b[1] - a[1]);
        return sorted[0][0];
    }

    /**
     * 주요 키워드 추출
     */
    private extractTopKeywords(messages: any[], limit: number = 10): Array<{ keyword: string; count: number }> {
        const keywordCount = new Map<string, number>();
        const stopWords = new Set(['은', '는', '이', '가', '을', '를', '의', '에', '에서', '와', '과', '도', '로', '으로', '하다', '있다', '되다']);

        messages.forEach(msg => {
            if (msg.content) {
        const words = msg.content
          .replace(/[^\w\s가-힣]/g, ' ')
          .split(/\s+/)
          .filter((word: string) => word.length > 1 && !stopWords.has(word));
        
        words.forEach((word: string) => {
          keywordCount.set(word, (keywordCount.get(word) || 0) + 1);
        });
            }
        });

        return Array.from(keywordCount.entries())
            .map(([keyword, count]) => ({ keyword, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    /**
     * 완료율 계산
     */
    private calculateCompletionRate(sessions: any[]): number {
        if (sessions.length === 0) return 0;
        // 세션 상태를 기반으로 완료율 계산 (실제로는 세션 상태 필드 필요)
        return 75; // 시뮬레이션
    }

    /**
     * 참여도 점수 계산
     */
    private calculateEngagementScore(
        totalMessages: number,
        totalSessions: number,
        activityTrend: Array<{ date: string; count: number }>
    ): number {
        // 메시지 수 점수 (0-40점)
        const messageScore = Math.min(40, (totalMessages / 100) * 40);

        // 세션 수 점수 (0-30점)
        const sessionScore = Math.min(30, (totalSessions / 10) * 30);

        // 활동 일관성 점수 (0-30점)
        const recentActivity = activityTrend.slice(-7);
        const avgDailyActivity = recentActivity.reduce((sum, day) => sum + day.count, 0) / 7;
        const consistencyScore = Math.min(30, (avgDailyActivity / 10) * 30);

        return Math.round(messageScore + sessionScore + consistencyScore);
    }

    /**
     * 프로젝트 비교 분석
     */
    async compareProjects(projects: Array<{
        id: string;
        name: string;
        messages: any[];
        sessions: any[];
        files: any[];
    }>): Promise<ProjectComparison[]> {
        const comparisons: ProjectComparison[] = [];

        for (const project of projects) {
            const analytics = await this.getProjectAnalytics(
                project.id,
                project.name,
                project.messages,
                project.sessions,
                project.files
            );

            comparisons.push({
                projectId: project.id,
                projectName: project.name,
                metrics: {
                    messages: analytics.totalMessages,
                    sessions: analytics.totalSessions,
                    files: analytics.totalFiles,
                    engagement: analytics.engagementScore,
                },
                rank: 0, // 나중에 계산
                trend: analytics.messageGrowth > 0 ? 'up' : analytics.messageGrowth < 0 ? 'down' : 'stable',
            });
        }

        // 참여도 점수로 순위 매기기
        comparisons.sort((a, b) => b.metrics.engagement - a.metrics.engagement);
        comparisons.forEach((comp, index) => {
            comp.rank = index + 1;
        });

        return comparisons;
    }

    /**
     * 프로젝트 인사이트 생성
     */
    generateInsights(analytics: ProjectAnalytics): string[] {
        const insights: string[] = [];

        if (analytics.messageGrowth > 20) {
            insights.push(`📈 메시지가 전월 대비 ${analytics.messageGrowth}% 증가했습니다.`);
        } else if (analytics.messageGrowth < -20) {
            insights.push(`📉 메시지가 전월 대비 ${Math.abs(analytics.messageGrowth)}% 감소했습니다.`);
        }

        if (analytics.engagementScore > 80) {
            insights.push('🌟 프로젝트 참여도가 매우 높습니다.');
        } else if (analytics.engagementScore < 40) {
            insights.push('💡 프로젝트 참여도를 높이기 위한 활동이 필요합니다.');
        }

        if (analytics.topKeywords.length > 0) {
            insights.push(`🔍 주요 키워드: ${analytics.topKeywords.slice(0, 3).map(k => k.keyword).join(', ')}`);
        }

        return insights;
    }
}

// 싱글톤 인스턴스
const projectAnalyticsService = new ProjectAnalyticsService();

export default projectAnalyticsService;

