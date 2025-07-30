import React, { useState } from 'react';
import {
    Link, useLocation
} from 'react-router-dom';
import {
    RouteConfig
} from '../types/routes';
import {
    routeManager
} from '../config/routes';
import {
    StarIcon, ChevronDownIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

interface CategoryNavigationProps {
    onRouteChange?: (route: RouteConfig) => void;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({ onRouteChange }) => {
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['main']);
    const location = useLocation();
    const routes = routeManager.getAllRoutes();

    // 카테고리별로 라우트 그룹화
    const groupedRoutes = routes.reduce((acc, route) => {
        const category = route.category || 'other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(route);
        return acc;
    }, {} as Record<string, RouteConfig[]>);

    // 카테고리 이름 매핑
    const categoryNames: Record<string, string> = {
        main: '메인',
        analysis: '분석',
        ai: 'AI',
        generation: '생성',
        dashboard: '대시보드',
        layout: '레이아웃',
        other: '기타'
    };

    // 카테고리 아이콘 매핑
    const categoryIcons: Record<string, string> = {
        main: '🏠',
        analysis: '📊',
        ai: '🤖',
        generation: '💬',
        dashboard: '📈',
        layout: '🎨',
        other: '📁'
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const isCategoryExpanded = (category: string) => expandedCategories.includes(category);

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold text-gray-900">AI 대화분석 시스템</h1>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>활성 라우트: {routes.filter(r => r.isActive !== false).length}</span>
                            <span>총 기능: {routes.length}</span>
                        </div>
                    </div>
                </div>

                {/* 카테고리별 네비게이션 */}
                <div className="space-y-2">
                    {Object.entries(groupedRoutes).map(([category, categoryRoutes]) => (
                        <div key={category} className="border border-gray-200 rounded-lg">
                            {/* 카테고리 헤더 */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{categoryIcons[category]}</span>
                                    <span className="font-medium text-gray-900">{categoryNames[category]}</span>
                                    <span className="text-sm text-gray-500">({categoryRoutes.length})</span>
                                </div>
                                {isCategoryExpanded(category) ? (
                                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {/* 카테고리 내 라우트들 */}
                            {isCategoryExpanded(category) && (
                                <div className="border-t border-gray-200 bg-gray-50">
                                    <div className="p-2 space-y-1">
                                        {categoryRoutes.map((route) => (
                                            <Link
                                                key={route.path}
                                                to={route.path}
                                                onClick={() => onRouteChange?.(route)}
                                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${location.pathname === route.path
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                                    }`}
                                            >
                                                <span className="text-base">{route.icon}</span>
                                                <div className="flex-1 text-left">
                                                    <div className="font-medium">{route.name}</div>
                                                    <div className="text-xs text-gray-500 truncate">{route.description}</div>
                                                </div>
                                                {route.isActive === false && (
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-1 rounded">비활성</span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 현재 경로 표시 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        현재 경로: <span className="font-medium">{location.pathname}</span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default CategoryNavigation; 