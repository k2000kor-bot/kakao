import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RouteConfig, RouteCategory } from '../types/routes';
import { routeManager, routeCategories } from '../config/routes';
import RealTimeNotificationSystem from './RealTimeNotificationSystem';
import AdvancedSearchSystem from './AdvancedSearchSystem';
import StableNotificationSystem from './StableNotificationSystem';

interface StableNavigationProps {
    onRouteChange?: (route: RouteConfig) => void;
    showSearch?: boolean;
    showCategories?: boolean;
}

const StableNavigation: React.FC<StableNavigationProps> = ({
    onRouteChange,
    showSearch = true,
    showCategories = true
}) => {
    const [routes, setRoutes] = useState<RouteConfig[]>([]);
    const [categories, setCategories] = useState<RouteCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const location = useLocation();

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = () => {
        const allRoutes = routeManager.getAllRoutes();
        setRoutes(allRoutes);
        setCategories(routeCategories);
    };

    const filteredRoutes = routes.filter(route => {
        if (searchTerm) {
            return route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (route.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        }
        return true;
    });

    const handleAddNewRoute = () => {
        console.log('새 라우트 추가');
    };

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

                    <div className="flex items-center space-x-4">
                        <StableNotificationSystem />
                    </div>
                </div>

                {/* 검색 및 필터 */}
                {showSearch && (
                    <div className="mb-4">
                        <AdvancedSearchSystem
                            onSearch={(query, filters) => {
                                console.log('검색:', query, filters);
                            }}
                            onClear={() => {
                                setSearchTerm('');
                            }}
                        />
                    </div>
                )}

                {/* 네비게이션 링크 */}
                <div className="flex items-center space-x-1 overflow-x-auto pb-2">
                    {filteredRoutes.map((route) => (
                        <Link
                            key={route.path}
                            to={route.path}
                            onClick={() => onRouteChange?.(route)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${location.pathname === route.path
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <span className="text-lg">{route.icon}</span>
                            <span>{route.name}</span>
                            {route.isActive === false && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-1 rounded">비활성</span>
                            )}
                        </Link>
                    ))}

                    {filteredRoutes.length === 0 && (
                        <div className="text-gray-500 text-sm px-4 py-2">
                            {searchTerm ? '검색 결과가 없습니다.' : '사용 가능한 기능이 없습니다.'}
                        </div>
                    )}
                </div>

                {/* 카테고리별 요약 */}
                {showCategories && categories.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>카테고리:</span>
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center space-x-1">
                                    <span>{category.name}</span>
                                    <span className="bg-gray-200 text-gray-600 px-1 rounded">
                                        {category.routes.length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default StableNavigation; 