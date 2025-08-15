import React from 'react';
import {
    FiBarChart,
    FiSettings,
    FiShield,
    FiPieChart,
    FiLink,
    FiCpu,
    FiZap,
    FiSearch
} from 'react-icons/fi';


interface AdvancedFeaturesPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onFeatureClick: (feature: string) => void;
}

const AdvancedFeaturesPopup: React.FC<AdvancedFeaturesPopupProps> = ({
    isOpen,
    onClose,
    onFeatureClick
}) => {
    if (!isOpen) return null;

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">고급 기능</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="닫기"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="닫기">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 기능 그리드 */}
                <div className="p-6">
                    {features.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">사용 가능한 고급 기능이 없습니다.</p>
                            <p className="text-gray-400 text-sm mt-2">필요한 기능은 대화를 통해 요청해 주세요.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.id}
                                    onClick={() => onFeatureClick(feature.id)}
                                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
                                >
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.color}`}>
                                            <feature.icon className="w-5 h-5 text-white" size={20} />
                                        </div>
                                        <h3 className="font-semibold text-gray-800">{feature.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600 text-center">
                        고급 기능은 대화를 통해 활성화됩니다. 원하는 기능을 말씀해 주세요.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFeaturesPopup; 