import React, { useState } from 'react';
import { FiX, FiPlay } from 'react-icons/fi';

interface AdvancedFeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureType: string | null;
}

const AdvancedFeatureModal: React.FC<AdvancedFeatureModalProps> = ({
    isOpen,
    onClose,
    featureType
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const getFeatureInfo = (type: string) => {
        // 제거된 기능들:
        // - 고급 통계
        // - 자동화 워크플로우
        // - 보안 대시보드
        // - 데이터 시각화
        // - 블록체인 데이터 무결성 검증
        // - AI 모델 관리
        // - 양자 컴퓨팅 시뮬레이션
        // - 고급 검색
        return null;
    };

    const handleExecute = async () => {
        if (!featureType) return;
        
        setIsLoading(true);
        
        // 시뮬레이션된 실행
        setTimeout(() => {
            setResult({
                success: true,
                message: '해당 기능은 제거되었습니다. 필요하시면 대화를 통해 요청해 주세요.',
                data: {
                    timestamp: new Date().toISOString(),
                    feature: featureType,
                    status: 'removed'
                }
            });
            setIsLoading(false);
        }, 2000);
    };

    if (!isOpen || !featureType) return null;

    const featureInfo = getFeatureInfo(featureType);
    if (!featureInfo) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-500">
                                <span className="text-white text-xl">×</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">기능 제거됨</h2>
                                <p className="text-sm text-gray-500">해당 기능은 제거되었습니다.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="닫기"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>

                    {/* 콘텐츠 */}
                    <div className="p-6">
                        <div className="space-y-6">
                            {/* 기능 설명 */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">기능 제거됨</h3>
                                <p className="text-gray-600">해당 기능은 제거되었습니다. 필요하시면 대화를 통해 요청해 주세요.</p>
                            </div>

                            {/* 닫기 버튼 */}
                            <div className="flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default AdvancedFeatureModal; 