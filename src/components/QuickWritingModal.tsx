import React, { useState } from 'react';

interface QuickWritingRequest {
    topic: string;
    purpose: string;
    style: string;
    length: string;
}

interface QuickWritingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: QuickWritingRequest) => void;
    isLoading?: boolean;
}

const QuickWritingModal: React.FC<QuickWritingModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const [request, setRequest] = useState<QuickWritingRequest>({
        topic: '',
        purpose: '',
        style: 'semi-formal',
        length: 'medium'
    });

    const handleInputChange = (field: keyof QuickWritingRequest, value: string) => {
        setRequest(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        onSubmit(request);
    };

    const handleReset = () => {
        setRequest({
            topic: '',
            purpose: '',
            style: 'semi-formal',
            length: 'medium'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                {/* 헤더 */}
                <div className="bg-purple-600 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">✍️ 빠른 글쓰기</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                주제/제목 *
                            </label>
                            <input
                                type="text"
                                value={request.topic}
                                onChange={(e) => handleInputChange('topic', e.target.value)}
                                placeholder="예: 신제품 소개, 회사 업데이트, 고객 안내..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                목적/취지 *
                            </label>
                            <textarea
                                value={request.purpose}
                                onChange={(e) => handleInputChange('purpose', e.target.value)}
                                placeholder="이 글을 통해 무엇을 달성하고 싶으신가요?"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    글쓰기 스타일
                                </label>
                                <select
                                    value={request.style}
                                    onChange={(e) => handleInputChange('style', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="formal">공식적/전문적</option>
                                    <option value="semi-formal">반공식적</option>
                                    <option value="casual">비공식적/친근한</option>
                                    <option value="creative">창의적/독창적</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    길이
                                </label>
                                <select
                                    value={request.length}
                                    onChange={(e) => handleInputChange('length', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="short">짧게 (300-500단어)</option>
                                    <option value="medium">보통 (500-1000단어)</option>
                                    <option value="long">길게 (1000-2000단어)</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-md">
                            <h4 className="font-medium text-purple-900 mb-2">💡 빠른 글쓰기 팁</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                                <li>• 간단하고 명확한 주제를 입력하세요</li>
                                <li>• 목적을 구체적으로 설명하면 더 정확한 결과를 얻을 수 있습니다</li>
                                <li>• 필요시 상세한 글쓰기 모드를 사용하세요</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        🔄 초기화
                    </button>

                    <div className="flex space-x-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !request.topic || !request.purpose}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    작성 중...
                                </span>
                            ) : (
                                '✍️ 빠른 글 작성하기'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickWritingModal;
