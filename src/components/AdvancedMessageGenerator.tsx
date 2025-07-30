import React, { useState } from 'react';
import {
    PaperAirplaneIcon,
    CogIcon,
    LightBulbIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface AdvancedMessageGeneratorProps {
    selectedRoomId: string;
}

interface GenerationSettings {
    tone: string;
    length: string;
    emotion: string;
    context: string;
    style: string;
    formality: string;
}

interface GeneratedMessage {
    id: string;
    content: string;
    settings: GenerationSettings;
    timestamp: string;
    quality: number;
    feedback: 'positive' | 'negative' | 'neutral';
}

const AdvancedMessageGenerator: React.FC<AdvancedMessageGeneratorProps> = ({ selectedRoomId }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [settings, setSettings] = useState<GenerationSettings>({
        tone: 'friendly',
        length: 'medium',
        emotion: 'neutral',
        context: 'general',
        style: 'natural',
        formality: 'casual'
    });

    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('empathy');

    const toneOptions = [
        { value: 'friendly', label: '친근한', description: '따뜻하고 친근한 톤' },
        { value: 'professional', label: '전문적인', description: '정중하고 전문적인 톤' },
        { value: 'casual', label: '편안한', description: '자연스럽고 편안한 톤' },
        { value: 'enthusiastic', label: '열정적인', description: '에너지 넘치는 톤' },
        { value: 'empathetic', label: '공감하는', description: '이해하고 공감하는 톤' }
    ];

    const formatOptions = [
        { value: 'empathy', label: '공감', description: '감정적 공감 표현' },
        { value: 'suggestion', label: '제안', description: '건설적 제안' },
        { value: 'question', label: '질문', description: '호기심 유발 질문' },
        { value: 'encouragement', label: '격려', description: '동기부여와 격려' },
        { value: 'humor', label: '유머', description: '재미있는 표현' },
        { value: 'gaslighting', label: '가스라이팅', description: '조작적 표현', warning: true }
    ];

    const generateMessage = async () => {
        if (!inputMessage.trim()) return;

        setIsGenerating(true);

        // 시뮬레이션된 메시지 생성
        setTimeout(() => {
            const newMessage: GeneratedMessage = {
                id: Date.now().toString(),
                content: generateMockResponse(inputMessage, settings, selectedFormat),
                settings: { ...settings },
                timestamp: new Date().toLocaleTimeString(),
                quality: Math.random() * 100,
                feedback: 'neutral'
            };

            setGeneratedMessages(prev => [newMessage, ...prev]);
            setIsGenerating(false);
        }, 2000);
    };

    const generateMockResponse = (input: string, settings: GenerationSettings, format: string): string => {
        const responses = {
            empathy: [
                '정말 이해가 됩니다. 그런 상황이라면 누구나 그럴 수 있어요.',
                '그런 마음이 드시는 게 당연해요. 함께 해결해보면 좋겠네요.',
                '힘드셨겠어요. 제가 도움이 될 수 있는 게 있나요?'
            ],
            suggestion: [
                '혹시 이런 방법은 어떨까요?',
                '다른 관점에서 생각해보면 어떨까요?',
                '이런 접근 방식은 어떠신가요?'
            ],
            question: [
                '그 부분에 대해 더 자세히 들려주실 수 있나요?',
                '어떤 방향으로 진행하고 싶으신가요?',
                '그때 어떤 생각이 드셨나요?'
            ],
            encouragement: [
                '잘하고 계세요! 분명 좋은 결과가 있을 거예요.',
                '힘내세요! 당신이라면 충분히 해낼 수 있어요.',
                '포기하지 마세요. 곧 좋은 일이 생길 거예요.'
            ],
            humor: [
                'ㅋㅋㅋ 그런 일이 있었군요!',
                '재미있네요! 더 들려주세요.',
                '그런 상황이라니 웃프네요 ㅠㅠ'
            ],
            gaslighting: [
                '정말 그런 건가요? 제가 보기엔 다르던데요.',
                '과민하게 반응하시는 것 같아요.',
                '그런 생각을 하시다니 이상하네요.'
            ]
        };

        const formatResponses = responses[format as keyof typeof responses] || responses.empathy;
        return formatResponses[Math.floor(Math.random() * formatResponses.length)];
    };

    const handleFeedback = (messageId: string, feedback: 'positive' | 'negative' | 'neutral') => {
        setGeneratedMessages(prev =>
            prev.map(msg =>
                msg.id === messageId ? { ...msg, feedback } : msg
            )
        );
    };

    const getQualityColor = (quality: number) => {
        if (quality >= 80) return 'text-green-600';
        if (quality >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" />
                    고급 메시지 생성
                </h3>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">AI 준비됨</span>
                    </div>
                </div>
            </div>

            {/* 입력 영역 */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    메시지 입력
                </label>
                <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="생성할 메시지의 맥락을 입력하세요..."
                    className="w-full h-24 text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
            </div>

            {/* 설정 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        톤 설정
                    </label>
                    <select
                        value={settings.tone}
                        onChange={(e) => setSettings(prev => ({ ...prev, tone: e.target.value }))}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        title="톤 선택"
                    >
                        {toneOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} - {option.description}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        메시지 형식
                    </label>
                    <select
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        title="형식 선택"
                    >
                        {formatOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} - {option.description}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        길이
                    </label>
                    <select
                        value={settings.length}
                        onChange={(e) => setSettings(prev => ({ ...prev, length: e.target.value }))}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        title="길이 선택"
                    >
                        <option value="short">짧게</option>
                        <option value="medium">보통</option>
                        <option value="long">길게</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        감정
                    </label>
                    <select
                        value={settings.emotion}
                        onChange={(e) => setSettings(prev => ({ ...prev, emotion: e.target.value }))}
                        className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        title="감정 선택"
                    >
                        <option value="neutral">중립</option>
                        <option value="happy">기쁨</option>
                        <option value="sad">슬픔</option>
                        <option value="excited">흥미</option>
                        <option value="concerned">걱정</option>
                    </select>
                </div>
            </div>

            {/* 생성 버튼 */}
            <div className="mb-6">
                <button
                    onClick={generateMessage}
                    disabled={isGenerating || !inputMessage.trim()}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isGenerating ? (
                        <>
                            <ClockIcon className="w-5 h-5 animate-spin" />
                            <span>생성 중...</span>
                        </>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="w-5 h-5" />
                            <span>메시지 생성</span>
                        </>
                    )}
                </button>
            </div>

            {/* 생성된 메시지 목록 */}
            <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">생성된 메시지</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {generatedMessages.map((message) => (
                        <div key={message.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${getQualityColor(message.quality)}`}>
                                        품질: {message.quality.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleFeedback(message.id, 'positive')}
                                        className={`p-1 rounded ${message.feedback === 'positive' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                        title="좋음"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleFeedback(message.id, 'negative')}
                                        className={`p-1 rounded ${message.feedback === 'negative' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                                        title="나쁨"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                            <div className="flex flex-wrap gap-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {message.settings.tone}
                                </span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                    {message.settings.length}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {message.settings.emotion}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 경고 메시지 */}
            {selectedFormat === 'gaslighting' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-sm text-red-700">
                            조작적 메시지 형식이 선택되었습니다. 윤리적으로 사용하세요.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedMessageGenerator; 