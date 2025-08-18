import React, { useState } from 'react';

interface WritingRequest {
    topic: string;
    purpose: string;
    content: string;
    style: string;
    requirements: string;
    targetAudience: string;
    tone: string;
    length: string;
    format: string;
}

interface WritingAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: WritingRequest) => void;
    isLoading?: boolean;
}

const WritingAssistantModal: React.FC<WritingAssistantModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false
}) => {
    const [request, setRequest] = useState<WritingRequest>({
        topic: '',
        purpose: '',
        content: '',
        style: '',
        requirements: '',
        targetAudience: '',
        tone: '',
        length: '',
        format: ''
    });

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const handleInputChange = (field: keyof WritingRequest, value: string) => {
        setRequest(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        onSubmit(request);
    };

    const handleReset = () => {
        setRequest({
            topic: '',
            purpose: '',
            content: '',
            style: '',
            requirements: '',
            targetAudience: '',
            tone: '',
            length: '',
            format: ''
        });
        setCurrentStep(1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* 헤더 */}
                <div className="bg-blue-600 text-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">📝 통합 글쓰기 어시스턴트</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* 진행 단계 표시 */}
                    <div className="mt-4">
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                                        }`}>
                                        {step}
                                    </div>
                                    {step < 4 && (
                                        <div className={`w-12 h-1 mx-2 ${step < currentStep ? 'bg-white' : 'bg-blue-500'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 text-sm">
                            {currentStep === 1 && '기본 정보'}
                            {currentStep === 2 && '내용 요구사항'}
                            {currentStep === 3 && '스타일 요구사항'}
                            {currentStep === 4 && '특별 요구사항'}
                        </div>
                    </div>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">📋 기본 정보</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    주제/제목 *
                                </label>
                                <input
                                    type="text"
                                    value={request.topic}
                                    onChange={(e) => handleInputChange('topic', e.target.value)}
                                    placeholder="예: 신제품 마케팅 제안서, 회사 소개서, 기술 보고서..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    목적/취지 *
                                </label>
                                <textarea
                                    value={request.purpose}
                                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                                    placeholder="이 글을 통해 무엇을 달성하고 싶으신가요? (예: 제품 판매, 정보 전달, 설득, 교육 등)"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    대상 독자
                                </label>
                                <input
                                    type="text"
                                    value={request.targetAudience}
                                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                                    placeholder="예: 경영진, 일반 고객, 전문가, 학생 등"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">📄 내용 요구사항</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    핵심 내용 *
                                </label>
                                <textarea
                                    value={request.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    placeholder="포함되어야 할 주요 내용을 설명해주세요. (예: 제품 특징, 시장 분석, 가격 정책, 경쟁사 비교 등)"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    추가 정보
                                </label>
                                <textarea
                                    value={request.requirements}
                                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                                    placeholder="특별히 언급하고 싶은 내용이나 참고할 자료가 있나요?"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">✍️ 스타일 요구사항</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        글쓰기 스타일
                                    </label>
                                    <select
                                        value={request.style}
                                        onChange={(e) => handleInputChange('style', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">스타일 선택</option>
                                        <option value="formal">공식적/전문적</option>
                                        <option value="semi-formal">반공식적</option>
                                        <option value="casual">비공식적/친근한</option>
                                        <option value="academic">학술적</option>
                                        <option value="creative">창의적/독창적</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        톤/어조
                                    </label>
                                    <select
                                        value={request.tone}
                                        onChange={(e) => handleInputChange('tone', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">톤 선택</option>
                                        <option value="professional">전문적</option>
                                        <option value="persuasive">설득적</option>
                                        <option value="friendly">친근한</option>
                                        <option value="serious">진지한</option>
                                        <option value="enthusiastic">열정적인</option>
                                        <option value="humorous">유머러스한</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        길이
                                    </label>
                                    <select
                                        value={request.length}
                                        onChange={(e) => handleInputChange('length', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">길이 선택</option>
                                        <option value="short">짧게 (300-500단어)</option>
                                        <option value="medium">보통 (500-1000단어)</option>
                                        <option value="long">길게 (1000-2000단어)</option>
                                        <option value="very-long">매우 길게 (2000단어 이상)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        형식
                                    </label>
                                    <select
                                        value={request.format}
                                        onChange={(e) => handleInputChange('format', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">형식 선택</option>
                                        <option value="paragraph">단락 형식</option>
                                        <option value="bullet-points">목록 형식</option>
                                        <option value="mixed">혼합 형식</option>
                                        <option value="structured">구조화된 형식</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">🎨 특별 요구사항</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    특별 요구사항
                                </label>
                                <textarea
                                    value={request.requirements}
                                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                                    placeholder="키워드, 브랜딩 가이드라인, 특별한 스타일 요구사항, 참고 자료 등이 있으면 입력해주세요."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-md">
                                <h4 className="font-medium text-blue-900 mb-2">💡 작성 팁</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• 구체적인 요구사항을 명시하면 더 정확한 결과를 얻을 수 있습니다.</li>
                                    <li>• 참고할 문서나 자료가 있다면 링크나 파일명을 포함해주세요.</li>
                                    <li>• 특정 키워드나 문구를 반드시 포함해야 한다면 명시해주세요.</li>
                                    <li>• 회사나 조직의 브랜딩 가이드라인이 있다면 언급해주세요.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                        {currentStep > 1 && (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                ← 이전
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            🔄 초기화
                        </button>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            취소
                        </button>

                        {currentStep < totalSteps ? (
                            <button
                                onClick={handleNext}
                                disabled={!request.topic || !request.purpose}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                다음 →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !request.topic || !request.purpose}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        작성 중...
                                    </span>
                                ) : (
                                    '📝 글 작성하기'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WritingAssistantModal;
