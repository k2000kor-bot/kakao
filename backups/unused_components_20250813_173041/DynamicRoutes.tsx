import React, { Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routeManager } from '../config/routes';
import { RouteConfig } from '../types/routes';

// 로딩 컴포넌트
const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-lg text-gray-600">로딩 중...</div>
    </div>
);

// 에러 경계 컴포넌트
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">컴포넌트 로드 오류</h2>
                    <p className="text-gray-600 mb-4">요청한 페이지를 불러올 수 없습니다.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        페이지 새로고침
                    </button>
                </div>
            </div>
        );
    }

    return (
        <React.Suspense fallback={<LoadingSpinner />}>
            {children}
        </React.Suspense>
    );
};

// 동적 라우트 컴포넌트
const DynamicRouteComponent: React.FC<{ route: RouteConfig }> = ({ route }) => {
    const Component = route.component;

    return (
        <ErrorBoundary>
            <Component />
        </ErrorBoundary>
    );
};

// 메인 동적 라우트 컴포넌트
const DynamicRoutes: React.FC = () => {
    const [routes, setRoutes] = useState<RouteConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 초기 라우트 로드
        loadRoutes();

        // 라우트 변경 감지
        const interval = setInterval(loadRoutes, 1000);
        return () => clearInterval(interval);
    }, []);

    const loadRoutes = () => {
        try {
            const activeRoutes = routeManager.getActiveRoutes();
            setRoutes(activeRoutes);
            setIsLoading(false);
        } catch (error) {
            console.error('라우트 로드 오류:', error);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <Routes>
            {/* 기본 라우트들 */}
            {routes.map((route) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <DynamicRouteComponent route={route} />
                        </Suspense>
                    }
                />
            ))}

            {/* 404 페이지 */}
            <Route
                path="*"
                element={
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">페이지를 찾을 수 없습니다</h2>
                            <p className="text-gray-600 mb-4">요청한 페이지가 존재하지 않거나 이동되었습니다.</p>
                            <button
                                onClick={() => window.history.back()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                이전 페이지로 돌아가기
                            </button>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
};

export default DynamicRoutes; 