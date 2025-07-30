import React, { useState } from 'react';

interface StableMessageGeneratorProps {
    selectedStrategy?: string;
    authorCharacteristic?: string;
    audiencePreference?: string;
}

const StableMessageGenerator: React.FC<StableMessageGeneratorProps> = ({
    selectedStrategy = '',
    authorCharacteristic = '',
    audiencePreference = ''
}) => {
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateMessage = async () => {
        setIsGenerating(true);

        // 시뮬레이션된 메시지 생성
        setTimeout(() => {
            const messages = [
                '안녕하세요! AI 메시지 생성 시스템입니다.',
                '맥락을 고려한 맞춤형 메시지를 생성합니다.',
                '사용자 특성과 상황에 맞는 최적의 응답을 제공합니다.',
                '실시간으로 대화 흐름을 분석하여 적절한 메시지를 제안합니다.'
            ];

            setGeneratedMessage(messages[Math.floor(Math.random() * messages.length)]);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI 메시지 생성</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        선택된 전략
                    </label>
                    <input
                        type="text"
                        value={selectedStrategy}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        placeholder="전략이 선택되지 않음"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        작성자 특성
                    </label>
                    <input
                        type="text"
                        value={authorCharacteristic}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        placeholder="특성이 설정되지 않음"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        대상 선호도
                    </label>
                    <input
                        type="text"
                        value={audiencePreference}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        placeholder="선호도가 설정되지 않음"
                    />
                </div>

                <button
                    onClick={handleGenerateMessage}
                    disabled={isGenerating}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isGenerating ? '생성 중...' : '메시지 생성'}
                </button>

                {generatedMessage && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">생성된 메시지</h4>
                        <p className="text-gray-700">{generatedMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StableMessageGenerator; 