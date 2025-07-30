import React from 'react';
import { RouteConfig, RouteCategory, NavigationConfig } from '../types/routes';

// 안정적인 컴포넌트들만 lazy loading으로 import
import StableAIConversationSystem from '../components/StableAIConversationSystem';
import SimpleAIDashboard from '../components/SimpleAIDashboard';
import SimpleRealTimeAnalytics from '../components/SimpleRealTimeAnalytics';
import StableMessageGenerator from '../components/StableMessageGenerator';
import StableNotificationSystem from '../components/StableNotificationSystem';
import AdvancedSearchSystem from '../components/AdvancedSearchSystem';
import AdvancedDashboardSystem from '../components/AdvancedDashboardSystem';
import AdvancedSettingsManager from '../components/AdvancedSettingsManager';
import RealTimeNotificationSystem from '../components/RealTimeNotificationSystem';
import AdvancedAIAnalysis from '../components/AdvancedAIAnalysis';
import RealTimeAILearning from '../components/RealTimeAILearning';
import AIConversationLayout from '../components/AIConversationLayout';
import AdvancedAIPrediction from '../components/AdvancedAIPrediction';
import AdvancedStatistics from '../components/AdvancedStatistics';
import RealTimeMonitoring from '../components/RealTimeMonitoring';
import ProjectManagement from '../components/ProjectManagement';
import AdvancedConversationLayout from '../components/AdvancedConversationLayout';
import AdvancedMessageEngine from '../components/AdvancedMessageEngine';
import EmotionAnalysisDashboard from '../components/EmotionAnalysisDashboard';
import AIConversationPredictor from '../components/AIConversationPredictor';
import AdvancedDataVisualization from '../components/AdvancedDataVisualization';
import AdvancedMessageStrategy from '../components/AdvancedMessageStrategy';
import LayoutBasedConversationSystem from '../components/LayoutBasedConversationSystem';

// 기본 라우트 설정
export const defaultRoutes: RouteConfig[] = [
    // 메인 시스템
    {
        path: '/',
        name: '홈',
        component: StableAIConversationSystem,
        description: 'AI 대화분석 시스템 메인 페이지',
        icon: '🏠',
        category: 'main',
        isActive: true
    },

    // 분석 기능들
    {
        path: '/analysis/basic',
        name: '기본분석',
        component: StableAIConversationSystem,
        description: '기본 대화 분석 및 인사이트 생성',
        icon: '📊',
        category: 'analysis',
        isActive: true
    },
    {
        path: '/analysis/advanced',
        name: '고급분석',
        component: AdvancedAIAnalysis,
        description: '고급 AI 기반 대화 패턴 및 감정 분석',
        icon: '🧠',
        category: 'analysis',
        isActive: true
    },
    {
        path: '/analysis/simple',
        name: '간단분석',
        component: SimpleRealTimeAnalytics,
        description: '간단한 실시간 분석',
        icon: '📈',
        category: 'analysis',
        isActive: true
    },

    // AI 학습 및 예측
    {
        path: '/ai/learning',
        name: 'AI학습',
        component: RealTimeAILearning,
        description: '실시간 AI 모델 학습 및 최적화',
        icon: '🎓',
        category: 'ai',
        isActive: true
    },
    {
        path: '/ai/prediction',
        name: 'AI예측',
        component: AdvancedAIPrediction,
        description: '고급 AI 기반 대화 패턴 예측',
        icon: '🔮',
        category: 'ai',
        isActive: true
    },

    // 메시지 생성
    {
        path: '/generation/message',
        name: '메시지생성',
        component: StableMessageGenerator,
        description: 'AI 기반 지능형 메시지 생성 시스템',
        icon: '💬',
        category: 'generation',
        isActive: true
    },

    // 대시보드
    {
        path: '/dashboard/simple',
        name: '간단대시보드',
        component: SimpleAIDashboard,
        description: '간단한 AI 대시보드',
        icon: '📊',
        category: 'dashboard',
        isActive: true
    },

    // 특별 레이아웃
    {
        path: '/layout/conversation',
        name: '대화레이아웃',
        component: AIConversationLayout,
        description: '이미지 기반 3열 대화 분석 레이아웃',
        icon: '💬',
        category: 'layout',
        isActive: true
    },

    // 통계 및 모니터링
    {
        path: '/statistics/advanced',
        name: '고급통계',
        component: AdvancedStatistics,
        description: '고급 통계 분석 및 인사이트',
        icon: '📊',
        category: 'statistics',
        isActive: true
    },
    {
        path: '/monitoring/realtime',
        name: '실시간모니터링',
        component: RealTimeMonitoring,
        description: '실시간 시스템 모니터링 및 상태 확인',
        icon: '🔍',
        category: 'monitoring',
        isActive: true
    },

    // 프로젝트 관리
    {
        path: '/management/project',
        name: '프로젝트관리',
        component: ProjectManagement,
        description: '프로젝트 및 작업 관리 시스템',
        icon: '📋',
        category: 'management',
        isActive: true
    },

    // 고급 대화 분석
    {
        path: '/conversation/advanced',
        name: '고급대화분석',
        component: AdvancedConversationLayout,
        description: '정교한 3열 레이아웃 기반 대화 분석',
        icon: '💬',
        category: 'conversation',
        isActive: true
    },

    // 고급 메시지 엔진
    {
        path: '/engine/message',
        name: '고급메시지엔진',
        component: AdvancedMessageEngine,
        description: 'AI 기반 고급 메시지 생성 엔진',
        icon: '🤖',
        category: 'engine',
        isActive: true
    },

    // 감정 분석
    {
        path: '/emotion/dashboard',
        name: '감정분석대시보드',
        component: EmotionAnalysisDashboard,
        description: '실시간 감정 분석 및 트렌드 대시보드',
        icon: '❤️',
        category: 'emotion',
        isActive: true
    },

    // AI 예측
    {
        path: '/prediction/conversation',
        name: 'AI대화예측',
        component: AIConversationPredictor,
        description: 'AI 기반 대화 패턴 예측 시스템',
        icon: '🔮',
        category: 'prediction',
        isActive: true
    },

    // 데이터 시각화
    {
        path: '/visualization/advanced',
        name: '고급데이터시각화',
        component: AdvancedDataVisualization,
        description: '고급 데이터 시각화 및 분석 대시보드',
        icon: '📊',
        category: 'visualization',
        isActive: true
    },

    // 고급 메시지 전략
    {
        path: '/strategy/advanced',
        name: '고급메시지전략',
        component: AdvancedMessageStrategy,
        description: '고급 메시지 전략 및 생성 시스템',
        icon: '💬',
        category: 'strategy',
        isActive: true
    },

    // 레이아웃 기반 대화 시스템
    {
        path: '/conversation/layout',
        name: '레이아웃대화시스템',
        component: LayoutBasedConversationSystem,
        description: '이미지 레이아웃 기반 완전한 대화 분석 시스템',
        icon: '🎨',
        category: 'conversation',
        isActive: true
    }
];

// 카테고리별 라우트 그룹화
export const routeCategories: RouteCategory[] = [
    {
        id: 'main',
        name: '메인',
        description: '시스템 메인 기능',
        routes: defaultRoutes.filter(route => route.category === 'main')
    },
    {
        id: 'analysis',
        name: '분석',
        description: '데이터 분석 및 인사이트',
        routes: defaultRoutes.filter(route => route.category === 'analysis')
    },
    {
        id: 'generation',
        name: '생성',
        description: 'AI 기반 콘텐츠 생성',
        routes: defaultRoutes.filter(route => route.category === 'generation')
    },
    {
        id: 'response',
        name: '대응',
        description: '자동화된 대응 시스템',
        routes: defaultRoutes.filter(route => route.category === 'response')
    },
    {
        id: 'dashboard',
        name: '대시보드',
        description: '시각화 및 모니터링',
        routes: defaultRoutes.filter(route => route.category === 'dashboard')
    },
    {
        id: 'notification',
        name: '알림',
        description: '알림 및 통신 관리',
        routes: defaultRoutes.filter(route => route.category === 'notification')
    },
    {
        id: 'workspace',
        name: '작업공간',
        description: '고급 작업 환경',
        routes: defaultRoutes.filter(route => route.category === 'workspace')
    }
];

// 네비게이션 설정
export const navigationConfig: NavigationConfig = {
    categories: routeCategories,
    defaultRoute: '/'
};

// 동적 라우트 관리 클래스
export class RouteManager {
    private static instance: RouteManager;
    private routes: RouteConfig[] = [...defaultRoutes];
    private routeCounter = defaultRoutes.length;

    private constructor() { }

    static getInstance(): RouteManager {
        if (!RouteManager.instance) {
            RouteManager.instance = new RouteManager();
        }
        return RouteManager.instance;
    }

    // 새로운 라우트 추가
    addRoute(route: Omit<RouteConfig, 'path'>): string {
        const path = `/feature-${++this.routeCounter}`;
        const newRoute: RouteConfig = {
            ...route,
            path,
            isActive: true
        };

        this.routes.push(newRoute);
        this.updateCategories();
        return path;
    }

    // 라우트 제거
    removeRoute(path: string): boolean {
        const index = this.routes.findIndex(route => route.path === path);
        if (index !== -1) {
            this.routes.splice(index, 1);
            this.updateCategories();
            return true;
        }
        return false;
    }

    // 라우트 활성화/비활성화
    toggleRoute(path: string): boolean {
        const route = this.routes.find(route => route.path === path);
        if (route) {
            route.isActive = !route.isActive;
            this.updateCategories();
            return true;
        }
        return false;
    }

    // 모든 라우트 가져오기
    getAllRoutes(): RouteConfig[] {
        return [...this.routes];
    }

    // 활성화된 라우트만 가져오기
    getActiveRoutes(): RouteConfig[] {
        return this.routes.filter(route => route.isActive);
    }

    // 카테고리별 라우트 가져오기
    getRoutesByCategory(category: string): RouteConfig[] {
        return this.routes.filter(route => route.category === category && route.isActive);
    }

    // 라우트 검색
    searchRoutes(query: string): RouteConfig[] {
        const lowerQuery = query.toLowerCase();
        return this.routes.filter(route =>
            route.name.toLowerCase().includes(lowerQuery) ||
            route.description?.toLowerCase().includes(lowerQuery) ||
            route.category?.toLowerCase().includes(lowerQuery)
        );
    }

    // 카테고리 업데이트
    private updateCategories(): void {
        // 카테고리별로 라우트 재분류
        routeCategories.forEach(category => {
            category.routes = this.routes.filter(route =>
                route.category === category.id && route.isActive
            );
        });
    }

    // 라우트 설정 내보내기
    exportConfig(): NavigationConfig {
        return {
            categories: routeCategories,
            defaultRoute: '/'
        };
    }

    // 라우트 설정 가져오기
    importConfig(config: NavigationConfig): void {
        this.routes = [];
        config.categories.forEach(category => {
            category.routes.forEach(route => {
                this.routes.push(route);
            });
        });
        this.updateCategories();
    }
}

// 전역 라우트 매니저 인스턴스
export const routeManager = RouteManager.getInstance(); 