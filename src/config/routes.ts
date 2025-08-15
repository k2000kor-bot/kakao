import React from 'react';
import { RouteConfig, RouteCategory, NavigationConfig } from '../types/routes';

// 간단한 홈 컴포넌트
const HomeComponent: React.FC = () => React.createElement('div', null, '홈 페이지');

// 기본 라우트 설정
export const defaultRoutes: RouteConfig[] = [
    {
        path: '/',
        name: '홈',
        component: HomeComponent,
        description: 'AI 대화분석 시스템 메인 페이지',
        icon: '🏠',
        category: 'main',
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