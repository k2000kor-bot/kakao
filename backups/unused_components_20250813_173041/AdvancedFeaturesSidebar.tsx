import React, { useState } from 'react';

interface AdvancedFeaturesSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onFeatureClick: (feature: string) => void;
}

const AdvancedFeaturesSidebar: React.FC<AdvancedFeaturesSidebarProps> = ({
    isOpen,
    onClose,
    onFeatureClick
}) => {
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

    const features: any[] = [
        // 제거된 기능들:
        // - 고급 통계
        // - 자동화 워크플로우
        // - 보안 대시보드
        // - 데이터 시각화
        // - 블록체인 데이터 무결성 검증
        // - AI 모델 관리
        // - 양자 컴퓨팅 시뮬레이션
        // - 고급 검색
    ];

    const handleFeatureClick = (featureId: string) => {
        setSelectedFeature(featureId);
        onFeatureClick(featureId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">고급 기능</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="닫기"
                >
                    ×
                </button>
            </div>

            {/* 기능 목록 */}
            <div className="p-6 space-y-4 overflow-y-auto h-full">
                {features.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">사용 가능한 고급 기능이 없습니다.</p>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">사용 가능한 고급 기능이 없습니다.</p>
                        <p className="text-gray-400 text-xs mt-2">필요한 기능은 대화를 통해 요청해 주세요.</p>
                    </div>
                )}
            </div>

            {/* 선택된 기능 상세 정보 - 제거됨 */}
        </div>
    );
};

export default AdvancedFeaturesSidebar; 