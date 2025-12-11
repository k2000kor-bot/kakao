/**
 * projectAnalyticsService 서비스 테스트
 * 프로젝트 통계 및 분석 서비스 테스트
 */

import projectAnalyticsService, { ProjectAnalytics } from '../projectAnalyticsService';

describe('projectAnalyticsService', () => {
    describe('싱글톤 인스턴스', () => {
        it('내보낸 인스턴스가 정의되어 있어야 함', () => {
            expect(projectAnalyticsService).toBeDefined();
        });
    });

    describe('getProjectAnalytics', () => {
        it('프로젝트 통계를 계산할 수 있어야 함', async () => {
            const messages = [
                { content: '테스트 메시지', timestamp: new Date().toISOString() },
                { content: '또 다른 메시지', timestamp: new Date().toISOString() },
            ];
            const sessions = [{ id: 'session-1' }];
            const files = [{ id: 'file-1' }];

            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '테스트 프로젝트',
                messages,
                sessions,
                files
            );

            expect(analytics).toBeDefined();
            expect(analytics.projectId).toBe('project-123');
            expect(analytics.projectName).toBe('테스트 프로젝트');
            expect(analytics.totalMessages).toBe(2);
            expect(analytics.totalSessions).toBe(1);
            expect(analytics.totalFiles).toBe(1);
        });

        it('활동 트렌드를 계산해야 함', async () => {
            const now = new Date();
            const messages = [
                { content: '메시지1', timestamp: now.toISOString() },
                { content: '메시지2', timestamp: now.toISOString() },
            ];

            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '프로젝트',
                messages,
                [],
                []
            );

            expect(analytics.activityTrend).toBeDefined();
            expect(Array.isArray(analytics.activityTrend)).toBe(true);
            expect(analytics.activityTrend.length).toBeGreaterThan(0);
        });

        it('메시지 증가율을 계산해야 함', async () => {
            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15);
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

            const messages = [
                { content: '이번 달', timestamp: thisMonth.toISOString() },
                { content: '이번 달2', timestamp: thisMonth.toISOString() },
                { content: '지난 달', timestamp: lastMonth.toISOString() },
            ];

            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '프로젝트',
                messages,
                [],
                []
            );

            expect(typeof analytics.messageGrowth).toBe('number');
        });

        it('평균 응답 시간을 계산해야 함', async () => {
            const messages = [
                { content: '메시지', timestamp: new Date().toISOString() },
            ];

            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '프로젝트',
                messages,
                [],
                []
            );

            expect(typeof analytics.averageResponseTime).toBe('number');
            expect(analytics.averageResponseTime).toBeGreaterThan(0);
        });

        it('가장 활발한 시간대를 계산해야 함', async () => {
            const now = new Date();
            now.setHours(14); // 오후 2시
            const messages = [
                { content: '오후 메시지', timestamp: now.toISOString() },
                { content: '오후 메시지2', timestamp: now.toISOString() },
            ];

            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '프로젝트',
                messages,
                [],
                []
            );

            expect(analytics.mostActiveTime).toBeDefined();
            expect(typeof analytics.mostActiveTime).toBe('string');
        });

        it('주요 키워드를 추출해야 함', async () => {
            const messages = [
                { content: '프로젝트 개발 테스트', timestamp: new Date().toISOString() },
                { content: '프로젝트 관리', timestamp: new Date().toISOString() },
                { content: '개발 진행', timestamp: new Date().toISOString() },
            ];

            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '프로젝트',
                messages,
                [],
                []
            );

            expect(analytics.topKeywords).toBeDefined();
            expect(Array.isArray(analytics.topKeywords)).toBe(true);
        });

        it('완료율을 계산해야 함', async () => {
            const sessions = [
                { id: 'session-1' },
                { id: 'session-2' },
            ];

            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '프로젝트',
                [],
                sessions,
                []
            );

            expect(typeof analytics.completionRate).toBe('number');
        });

        it('참여도 점수를 계산해야 함', async () => {
            const messages = [
                { content: '메시지1', timestamp: new Date().toISOString() },
                { content: '메시지2', timestamp: new Date().toISOString() },
            ];
            const sessions = [{ id: 'session-1' }];

            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '프로젝트',
                messages,
                sessions,
                []
            );

            expect(typeof analytics.engagementScore).toBe('number');
            expect(analytics.engagementScore).toBeGreaterThanOrEqual(0);
            expect(analytics.engagementScore).toBeLessThanOrEqual(100);
        });

        it('빈 데이터로도 통계를 계산할 수 있어야 함', async () => {
            const analytics = await projectAnalyticsService.getProjectAnalytics(
                'project-123',
                '프로젝트',
                [],
                [],
                []
            );

            expect(analytics.totalMessages).toBe(0);
            expect(analytics.totalSessions).toBe(0);
            expect(analytics.totalFiles).toBe(0);
            expect(analytics.activityTrend.length).toBeGreaterThan(0);
        });
    });

    describe('compareProjects', () => {
        it('여러 프로젝트를 비교할 수 있어야 함', async () => {
            const projects = [
                {
                    id: 'project-1',
                    name: '프로젝트1',
                    messages: [
                        { content: '메시지1', timestamp: new Date().toISOString() },
                        { content: '메시지2', timestamp: new Date().toISOString() },
                    ],
                    sessions: [{ id: 'session-1' }],
                    files: [],
                },
                {
                    id: 'project-2',
                    name: '프로젝트2',
                    messages: [{ content: '메시지1', timestamp: new Date().toISOString() }],
                    sessions: [],
                    files: [],
                },
            ];

            const comparisons = await projectAnalyticsService.compareProjects(projects);

            expect(comparisons.length).toBe(2);
            expect(comparisons[0].projectId).toBeDefined();
            expect(comparisons[0].metrics).toBeDefined();
            expect(comparisons[0].rank).toBeDefined();
            expect(comparisons[0].trend).toBeDefined();
        });

        it('참여도 점수로 순위를 매겨야 함', async () => {
            const projects = [
                {
                    id: 'project-1',
                    name: '프로젝트1',
                    messages: [
                        { content: '메시지1', timestamp: new Date().toISOString() },
                        { content: '메시지2', timestamp: new Date().toISOString() },
                        { content: '메시지3', timestamp: new Date().toISOString() },
                    ],
                    sessions: [{ id: 'session-1' }, { id: 'session-2' }],
                    files: [],
                },
                {
                    id: 'project-2',
                    name: '프로젝트2',
                    messages: [{ content: '메시지1', timestamp: new Date().toISOString() }],
                    sessions: [],
                    files: [],
                },
            ];

            const comparisons = await projectAnalyticsService.compareProjects(projects);

            expect(comparisons[0].rank).toBe(1);
            expect(comparisons[1].rank).toBe(2);
            expect(comparisons[0].metrics.engagement).toBeGreaterThanOrEqual(
                comparisons[1].metrics.engagement
            );
        });

        it('트렌드를 올바르게 계산해야 함', async () => {
            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15);
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

            const projects = [
                {
                    id: 'project-1',
                    name: '증가 프로젝트',
                    messages: [
                        { content: '이번 달1', timestamp: thisMonth.toISOString() },
                        { content: '이번 달2', timestamp: thisMonth.toISOString() },
                        { content: '지난 달', timestamp: lastMonth.toISOString() },
                    ],
                    sessions: [],
                    files: [],
                },
                {
                    id: 'project-2',
                    name: '감소 프로젝트',
                    messages: [
                        { content: '이번 달', timestamp: thisMonth.toISOString() },
                        { content: '지난 달1', timestamp: lastMonth.toISOString() },
                        { content: '지난 달2', timestamp: lastMonth.toISOString() },
                    ],
                    sessions: [],
                    files: [],
                },
            ];

            const comparisons = await projectAnalyticsService.compareProjects(projects);

            comparisons.forEach(comp => {
                expect(['up', 'down', 'stable']).toContain(comp.trend);
            });
        });
    });

    describe('generateInsights', () => {
        it('인사이트를 생성할 수 있어야 함', () => {
            const analytics: ProjectAnalytics = {
                projectId: 'project-123',
                projectName: '프로젝트',
                totalMessages: 100,
                totalSessions: 10,
                totalFiles: 5,
                activityTrend: [],
                messageGrowth: 25,
                averageResponseTime: 1200,
                mostActiveTime: '오후 (12-18시)',
                topKeywords: [
                    { keyword: '개발', count: 10 },
                    { keyword: '테스트', count: 5 },
                ],
                completionRate: 80,
                engagementScore: 85,
            };

            const insights = projectAnalyticsService.generateInsights(analytics);

            expect(Array.isArray(insights)).toBe(true);
            expect(insights.length).toBeGreaterThan(0);
        });

        it('메시지 증가율이 높으면 증가 인사이트를 생성해야 함', () => {
            const analytics: ProjectAnalytics = {
                projectId: 'project-123',
                projectName: '프로젝트',
                totalMessages: 100,
                totalSessions: 10,
                totalFiles: 5,
                activityTrend: [],
                messageGrowth: 30,
                averageResponseTime: 1200,
                mostActiveTime: '오후 (12-18시)',
                topKeywords: [],
                completionRate: 80,
                engagementScore: 85,
            };

            const insights = projectAnalyticsService.generateInsights(analytics);

            expect(insights.some(i => i.includes('증가'))).toBe(true);
        });

        it('메시지 증가율이 낮으면 감소 인사이트를 생성해야 함', () => {
            const analytics: ProjectAnalytics = {
                projectId: 'project-123',
                projectName: '프로젝트',
                totalMessages: 100,
                totalSessions: 10,
                totalFiles: 5,
                activityTrend: [],
                messageGrowth: -30,
                averageResponseTime: 1200,
                mostActiveTime: '오후 (12-18시)',
                topKeywords: [],
                completionRate: 80,
                engagementScore: 85,
            };

            const insights = projectAnalyticsService.generateInsights(analytics);

            expect(insights.some(i => i.includes('감소'))).toBe(true);
        });

        it('참여도 점수가 높으면 긍정적 인사이트를 생성해야 함', () => {
            const analytics: ProjectAnalytics = {
                projectId: 'project-123',
                projectName: '프로젝트',
                totalMessages: 100,
                totalSessions: 10,
                totalFiles: 5,
                activityTrend: [],
                messageGrowth: 0,
                averageResponseTime: 1200,
                mostActiveTime: '오후 (12-18시)',
                topKeywords: [],
                completionRate: 80,
                engagementScore: 85,
            };

            const insights = projectAnalyticsService.generateInsights(analytics);

            expect(insights.some(i => i.includes('높습니다'))).toBe(true);
        });

        it('참여도 점수가 낮으면 개선 인사이트를 생성해야 함', () => {
            const analytics: ProjectAnalytics = {
                projectId: 'project-123',
                projectName: '프로젝트',
                totalMessages: 10,
                totalSessions: 1,
                totalFiles: 1,
                activityTrend: [],
                messageGrowth: 0,
                averageResponseTime: 1200,
                mostActiveTime: '오후 (12-18시)',
                topKeywords: [],
                completionRate: 50,
                engagementScore: 30,
            };

            const insights = projectAnalyticsService.generateInsights(analytics);

            expect(insights.some(i => i.includes('필요') || i.includes('높이기'))).toBe(true);
        });

        it('주요 키워드가 있으면 키워드 인사이트를 생성해야 함', () => {
            const analytics: ProjectAnalytics = {
                projectId: 'project-123',
                projectName: '프로젝트',
                totalMessages: 100,
                totalSessions: 10,
                totalFiles: 5,
                activityTrend: [],
                messageGrowth: 0,
                averageResponseTime: 1200,
                mostActiveTime: '오후 (12-18시)',
                topKeywords: [
                    { keyword: '개발', count: 10 },
                    { keyword: '테스트', count: 5 },
                    { keyword: '디자인', count: 3 },
                ],
                completionRate: 80,
                engagementScore: 70,
            };

            const insights = projectAnalyticsService.generateInsights(analytics);

            expect(insights.some(i => i.includes('키워드'))).toBe(true);
            expect(insights.some(i => i.includes('개발'))).toBe(true);
        });
    });
});

