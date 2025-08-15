import React, { useState } from 'react';
import {
    routeManager
} from '../config/routes';
import {
    RouteConfig
} from '../types/routes';

interface FeatureCreatorProps {
    onFeatureCreated?: (path: string) => void;
    onClose?: () => void;
}

const FeatureCreator: React.FC<FeatureCreatorProps> = ({
    onFeatureCreated,
    onClose
}) => {
    const [featureData, setFeatureData] = useState({
        name: '',
        description: '',
        icon: '🆕',
        category: 'main',
        isActive: true
    });

    const [isCreating, setIsCreating] = useState(false);

    const categories = [
        { id: 'main', name: '메인', description: '시스템 메인 기능' },
        { id: 'analysis', name: '분석', description: '데이터 분석 및 인사이트' },
        { id: 'generation', name: '생성', description: 'AI 기반 콘텐츠 생성' },
        { id: 'response', name: '대응', description: '자동화된 대응 시스템' },
        { id: 'dashboard', name: '대시보드', description: '시각화 및 모니터링' },
        { id: 'notification', name: '알림', description: '알림 및 통신 관리' },
        { id: 'workspace', name: '작업공간', description: '고급 작업 환경' }
    ];

    const handleCreateFeature = async () => {
        if (!featureData.name.trim()) {
            alert('기능 이름을 입력해주세요.');
            return;
        }

        if (!featureData.description.trim()) {
            alert('기능 설명을 입력해주세요.');
            return;
        }

        setIsCreating(true);

        try {
            // 새로운 라우트 추가
            const path = routeManager.addRoute({
                ...featureData,
                component: React.lazy(() => import('./AIConversationAnalysisSystem'))
            });

            console.log('새 기능이 생성되었습니다:', path);

            if (onFeatureCreated) {
                onFeatureCreated(path);
            }

            // 폼 초기화
            setFeatureData({
                name: '',
                description: '',
                icon: '🆕',
                category: 'main',
                isActive: true
            });

            alert('새 기능이 성공적으로 생성되었습니다!');

            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error('기능 생성 오류:', error);
            alert('기능 생성 중 오류가 발생했습니다.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleQuickCreate = (template: string) => {
        const templates = {
            'analysis': {
                name: '새로운 분석 도구',
                description: '데이터 분석 및 인사이트 생성 도구',
                icon: '📊',
                category: 'analysis'
            },
            'generation': {
                name: '새로운 생성 도구',
                description: 'AI 기반 콘텐츠 생성 도구',
                icon: '💬',
                category: 'generation'
            },
            'dashboard': {
                name: '새로운 대시보드',
                description: '데이터 시각화 및 모니터링 대시보드',
                icon: '📈',
                category: 'dashboard'
            },
            'workspace': {
                name: '새로운 작업공간',
                description: '고급 작업 환경 및 도구',
                icon: '🛠️',
                category: 'workspace'
            }
        };

        const templateData = templates[template as keyof typeof templates];
        if (templateData) {
            setFeatureData(prev => ({ ...prev, ...templateData }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">새 기능 생성</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-gray-600 mt-2">
                        새로운 기능을 쉽게 추가할 수 있습니다. 동적으로 라우트가 생성됩니다.
                    </p>
                </div>

                <div className="p-6">
                    {/* 빠른 생성 템플릿 */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">빠른 생성</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleQuickCreate('analysis')}
                                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                            >
                                <div className="text-2xl mb-2">📊</div>
                                <div className="font-medium">분석 도구</div>
                                <div className="text-sm text-gray-500">데이터 분석 및 인사이트</div>
                            </button>
                            <button
                                onClick={() => handleQuickCreate('generation')}
                                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                            >
                                <div className="text-2xl mb-2">💬</div>
                                <div className="font-medium">생성 도구</div>
                                <div className="text-sm text-gray-500">AI 기반 콘텐츠 생성</div>
                            </button>
                            <button
                                onClick={() => handleQuickCreate('dashboard')}
                                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                            >
                                <div className="text-2xl mb-2">📈</div>
                                <div className="font-medium">대시보드</div>
                                <div className="text-sm text-gray-500">데이터 시각화</div>
                            </button>
                            <button
                                onClick={() => handleQuickCreate('workspace')}
                                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                            >
                                <div className="text-2xl mb-2">🛠️</div>
                                <div className="font-medium">작업공간</div>
                                <div className="text-sm text-gray-500">고급 작업 환경</div>
                            </button>
                        </div>
                    </div>

                    {/* 상세 설정 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                기능 이름 *
                            </label>
                            <input
                                type="text"
                                value={featureData.name}
                                onChange={(e) => setFeatureData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="새로운 기능의 이름을 입력하세요"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                설명 *
                            </label>
                            <textarea
                                value={featureData.description}
                                onChange={(e) => setFeatureData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="기능에 대한 설명을 입력하세요"
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
                                    value={featureData.icon}
                                    onChange={(e) => setFeatureData(prev => ({ ...prev, icon: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="이모지 또는 아이콘"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    카테고리
                                </label>
                                <select
                                    value={featureData.category}
                                    onChange={(e) => setFeatureData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name} - {category.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={featureData.isActive}
                                onChange={(e) => setFeatureData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                즉시 활성화
                            </label>
                        </div>
                    </div>

                    {/* 생성 버튼 */}
                    <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleCreateFeature}
                            disabled={isCreating || !featureData.name.trim() || !featureData.description.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isCreating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>생성 중...</span>
                                </>
                            ) : (
                                <>
                                    <span>✨</span>
                                    <span>기능 생성</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureCreator; 