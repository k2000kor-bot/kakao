import React, { useState, useEffect } from 'react';
import { routeManager } from '../config/routes';
import { RouteConfig, RouteCategory } from '../types/routes';

interface RouteManagerProps {
    onRouteChange?: () => void;
}

const RouteManagerComponent: React.FC<RouteManagerProps> = ({ onRouteChange }) => {
    const [routes, setRoutes] = useState<RouteConfig[]>([]);
    const [categories, setCategories] = useState<RouteCategory[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState<RouteConfig | null>(null);
    const [newRoute, setNewRoute] = useState({
        name: '',
        description: '',
        icon: '🆕',
        category: 'main',
        isActive: true
    });

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = () => {
        const allRoutes = routeManager.getAllRoutes();
        setRoutes(allRoutes);

        // 카테고리별로 그룹화
        const categoryMap = new Map<string, RouteConfig[]>();
        allRoutes.forEach(route => {
            const category = route.category || 'main';
            if (!categoryMap.has(category)) {
                categoryMap.set(category, []);
            }
            categoryMap.get(category)!.push(route);
        });

        const groupedCategories: RouteCategory[] = Array.from(categoryMap.entries()).map(([id, routes]) => ({
            id,
            name: getCategoryName(id),
            routes
        }));

        setCategories(groupedCategories);
    };

    const getCategoryName = (categoryId: string): string => {
        const categoryNames: { [key: string]: string } = {
            'main': '메인',
            'analysis': '분석',
            'generation': '생성',
            'response': '대응',
            'dashboard': '대시보드',
            'notification': '알림',
            'workspace': '작업공간'
        };
        return categoryNames[categoryId] || categoryId;
    };

    const handleAddRoute = () => {
        if (!newRoute.name.trim()) {
            alert('라우트 이름을 입력해주세요.');
            return;
        }

        try {
            const path = routeManager.addRoute({
                ...newRoute,
                component: React.lazy(() => import('../components/AIConversationAnalysisSystem'))
            });

            console.log('새 라우트가 추가되었습니다:', path);

            // 폼 초기화
            setNewRoute({
                name: '',
                description: '',
                icon: '🆕',
                category: 'main',
                isActive: true
            });

            loadRoutes();
            if (onRouteChange) onRouteChange();
        } catch (error) {
            console.error('라우트 추가 오류:', error);
            alert('라우트 추가에 실패했습니다.');
        }
    };

    const handleToggleRoute = (path: string) => {
        try {
            routeManager.toggleRoute(path);
            loadRoutes();
            if (onRouteChange) onRouteChange();
        } catch (error) {
            console.error('라우트 토글 오류:', error);
        }
    };

    const handleRemoveRoute = (path: string) => {
        if (window.confirm('정말로 이 라우트를 삭제하시겠습니까?')) {
            try {
                routeManager.removeRoute(path);
                loadRoutes();
                if (onRouteChange) onRouteChange();
            } catch (error) {
                console.error('라우트 삭제 오류:', error);
            }
        }
    };

    const handleEditRoute = (route: RouteConfig) => {
        setEditingRoute(route);
        setNewRoute({
            name: route.name,
            description: route.description || '',
            icon: route.icon || '🆕',
            category: route.category || 'main',
            isActive: route.isActive !== false
        });
        setShowModal(true);
    };

    const handleUpdateRoute = () => {
        if (!editingRoute || !newRoute.name.trim()) {
            alert('라우트 이름을 입력해주세요.');
            return;
        }

        try {
            // 기존 라우트 제거
            routeManager.removeRoute(editingRoute.path);

            // 새 라우트 추가
            const path = routeManager.addRoute({
                ...newRoute,
                component: React.lazy(() => import('../components/AIConversationAnalysisSystem'))
            });

            console.log('라우트가 업데이트되었습니다:', path);

            setEditingRoute(null);
            setShowModal(false);
            setNewRoute({
                name: '',
                description: '',
                icon: '🆕',
                category: 'main',
                isActive: true
            });

            loadRoutes();
            if (onRouteChange) onRouteChange();
        } catch (error) {
            console.error('라우트 업데이트 오류:', error);
            alert('라우트 업데이트에 실패했습니다.');
        }
    };

    const getStatusBadge = (isActive: boolean) => (
        <span className={`px-2 py-1 text-xs rounded-full ${isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
            }`}>
            {isActive ? '활성' : '비활성'}
        </span>
    );

    return (
        <div className="p-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{routes.length}</div>
                    <div className="text-sm text-blue-600">총 라우트</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                        {routes.filter(r => r.isActive !== false).length}
                    </div>
                    <div className="text-sm text-green-600">활성 라우트</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                    <div className="text-sm text-purple-600">카테고리</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                        {routes.filter(r => !r.category || r.category === 'main').length}
                    </div>
                    <div className="text-sm text-orange-600">메인 기능</div>
                </div>
            </div>

            {/* 새 라우트 추가 버튼 */}
            <div className="mb-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                    <span>➕</span>
                    <span>새 라우트 추가</span>
                </button>
            </div>

            {/* 카테고리별 라우트 목록 */}
            <div className="space-y-6">
                {categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
                                    {category.routes.length}
                                </span>
                                {category.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {category.description || `${category.name} 관련 기능들`}
                            </p>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.routes.map((route) => (
                                    <div
                                        key={route.path}
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${route.isActive !== false
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl">{route.icon}</span>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{route.name}</h4>
                                                    <p className="text-sm text-gray-600">{route.path}</p>
                                                </div>
                                            </div>
                                            {getStatusBadge(route.isActive !== false)}
                                        </div>

                                        {route.description && (
                                            <p className="text-sm text-gray-600 mb-3">{route.description}</p>
                                        )}

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleToggleRoute(route.path)}
                                                className={`px-3 py-1 text-xs rounded ${route.isActive !== false
                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}
                                            >
                                                {route.isActive !== false ? '비활성화' : '활성화'}
                                            </button>
                                            <button
                                                onClick={() => handleEditRoute(route)}
                                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleRemoveRoute(route.path)}
                                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {editingRoute ? '라우트 수정' : '새 라우트 추가'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingRoute(null);
                                    setNewRoute({
                                        name: '',
                                        description: '',
                                        icon: '🆕',
                                        category: 'main',
                                        isActive: true
                                    });
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    라우트 이름 *
                                </label>
                                <input
                                    type="text"
                                    value={newRoute.name}
                                    onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="라우트 이름을 입력하세요"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    설명
                                </label>
                                <textarea
                                    value={newRoute.description}
                                    onChange={(e) => setNewRoute(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="라우트에 대한 설명을 입력하세요"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        아이콘
                                    </label>
                                    <input
                                        type="text"
                                        value={newRoute.icon}
                                        onChange={(e) => setNewRoute(prev => ({ ...prev, icon: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="이모지 또는 아이콘"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        카테고리
                                    </label>
                                    <select
                                        value={newRoute.category}
                                        onChange={(e) => setNewRoute(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="main">메인</option>
                                        <option value="analysis">분석</option>
                                        <option value="generation">생성</option>
                                        <option value="response">대응</option>
                                        <option value="dashboard">대시보드</option>
                                        <option value="notification">알림</option>
                                        <option value="workspace">작업공간</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={newRoute.isActive}
                                    onChange={(e) => setNewRoute(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    즉시 활성화
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingRoute(null);
                                    setNewRoute({
                                        name: '',
                                        description: '',
                                        icon: '🆕',
                                        category: 'main',
                                        isActive: true
                                    });
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={editingRoute ? handleUpdateRoute : handleAddRoute}
                                disabled={!newRoute.name.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingRoute ? '수정' : '추가'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteManagerComponent; 