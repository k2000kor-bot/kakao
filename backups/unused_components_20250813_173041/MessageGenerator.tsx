import React, { useState, useEffect } from 'react';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    ClockIcon,
    UserIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface GeneratedMessage {
    id: string;
    content: string;
    timestamp: Date;
    type: 'user' | 'ai';
    style: 'normal' | 'emotion' | 'formal' | 'casual';
}

interface MessageGeneratorProps {
    selectedRoomId: string;
}

const MessageGenerator: React.FC<MessageGeneratorProps> = ({ selectedRoomId }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [selectedStyle, setSelectedStyle] = useState<'normal' | 'emotion' | 'formal' | 'casual'>('normal');
    const [autoGenerate, setAutoGenerate] = useState(false);

    // 카카오톡 스타일 메시지 생성 함수
    const generateKakaoMessage = async (prompt: string, style: string) => {
        try {
            const response = await fetch('http://localhost:8004/api/v1/conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_message: prompt,
                    style: style,
                    room_id: selectedRoomId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return data.response || '메시지 생성 중 오류가 발생했습니다.';
            } else {
                throw new Error('API 요청 실패');
            }
        } catch (error) {
            console.error('메시지 생성 오류:', error);
            // 오프라인 모드: 샘플 메시지 생성
            return generateSampleMessage(prompt, style);
        }
    };

    // 샘플 메시지 생성 (오프라인 모드)
    const generateSampleMessage = (prompt: string, style: string): string => {
        const sampleMessages = {
            normal: [
                '네, 맞습니다!',
                '그렇군요 😊',
                '정말 그런 것 같아요',
                '좋은 의견이네요 👍',
                '확실히 그렇습니다'
            ],
            emotion: [
                '와! 정말 대단하네요! 🎉',
                '너무 좋아요! 😍',
                '진짜 멋져요! ✨',
                '완전 동감해요! 💯',
                '정말 감동적이에요! 😭'
            ],
            formal: [
                '네, 말씀하신 대로입니다.',
                '정확한 지적이십니다.',
                '그 부분에 대해 동의합니다.',
                '매우 합리적인 의견입니다.',
                '좋은 제안이라고 생각합니다.'
            ],
            casual: [
                'ㅇㅇ 맞음',
                '그래 그런 것 같아',
                '좋은 생각이야',
                '맞네 맞네',
                '그래 그거 좋다'
            ]
        };

        const messages = sampleMessages[style as keyof typeof sampleMessages] || sampleMessages.normal;
        return messages[Math.floor(Math.random() * messages.length)];
    };

    // 메시지 생성 실행
    const handleGenerateMessage = async () => {
        if (!inputMessage.trim()) return;

        setIsGenerating(true);

        try {
            const generatedContent = await generateKakaoMessage(inputMessage, selectedStyle);

            const newMessage: GeneratedMessage = {
                id: Date.now().toString(),
                content: generatedContent,
                timestamp: new Date(),
                type: 'ai',
                style: selectedStyle
            };

            setGeneratedMessages(prev => [newMessage, ...prev]);
            setInputMessage('');
        } catch (error) {
            console.error('메시지 생성 실패:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // 자동 메시지 생성
    useEffect(() => {
        if (!autoGenerate) return;

        const interval = setInterval(async () => {
            const prompts = [
                '시공사 선정에 대해 어떻게 생각하세요?',
                '분담금 예상이 어떻게 될까요?',
                '평면도 검토 결과는 어떠신가요?',
                '계약서 협의 상황은 어떤가요?',
                '상가 문제는 어떻게 해결될 것 같나요?'
            ];

            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            const randomStyle = ['normal', 'emotion', 'formal', 'casual'][Math.floor(Math.random() * 4)] as any;

            const generatedContent = await generateKakaoMessage(randomPrompt, randomStyle);

            const newMessage: GeneratedMessage = {
                id: Date.now().toString(),
                content: generatedContent,
                timestamp: new Date(),
                type: 'ai',
                style: randomStyle
            };

            setGeneratedMessages(prev => [newMessage, ...prev]);
        }, 10000); // 10초마다 자동 생성

        return () => clearInterval(interval);
    }, [autoGenerate, selectedRoomId]);

    const getStyleColor = (style: string) => {
        switch (style) {
            case 'emotion': return 'bg-pink-100 text-pink-800';
            case 'formal': return 'bg-blue-100 text-blue-800';
            case 'casual': return 'bg-gray-100 text-gray-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const getStyleLabel = (style: string) => {
        switch (style) {
            case 'emotion': return '감정적';
            case 'formal': return '정중한';
            case 'casual': return '친근한';
            default: return '일반';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />
                    AI 메시지 생성기
                </h3>
                <p className="text-sm text-gray-600 mt-1">카카오톡 스타일의 메시지를 실시간으로 생성합니다</p>
            </div>

            <div className="p-6 space-y-4">
                {/* 스타일 선택 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">메시지 스타일</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'normal', label: '일반', icon: '💬' },
                            { value: 'emotion', label: '감정적', icon: '😊' },
                            { value: 'formal', label: '정중한', icon: '🤝' },
                            { value: 'casual', label: '친근한', icon: '👍' }
                        ].map((style) => (
                            <button
                                key={style.value}
                                onClick={() => setSelectedStyle(style.value as any)}
                                className={`px-3 py-2 rounded-lg border transition-colors ${selectedStyle === style.value
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="mr-1">{style.icon}</span>
                                {style.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 입력 필드 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">메시지 입력</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="생성할 메시지의 주제나 내용을 입력하세요..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && handleGenerateMessage()}
                        />
                        <button
                            onClick={handleGenerateMessage}
                            disabled={isGenerating || !inputMessage.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                        >
                            {isGenerating ? (
                                <>
                                    <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                                    생성 중...
                                </>
                            ) : (
                                <>
                                    <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                                    생성
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* 자동 생성 토글 */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="autoGenerate"
                        checked={autoGenerate}
                        onChange={(e) => setAutoGenerate(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoGenerate" className="text-sm text-gray-700">
                        자동 메시지 생성 (10초마다)
                    </label>
                </div>

                {/* 생성된 메시지 목록 */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                        생성된 메시지 ({generatedMessages.length})
                    </h4>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {generatedMessages.map((message) => (
                            <div key={message.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <UserIcon className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-900">AI 어시스턴트</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStyleColor(message.style)}`}>
                                                {getStyleLabel(message.style)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800">{message.content}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 ml-2">
                                        {message.timestamp.toLocaleTimeString('ko-KR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {generatedMessages.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">아직 생성된 메시지가 없습니다.</p>
                                <p className="text-xs">위에서 메시지를 입력하고 생성해보세요!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 통계 정보 */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{generatedMessages.length}</div>
                        <div className="text-xs text-gray-500">총 생성된 메시지</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {generatedMessages.filter(m => m.style === 'emotion').length}
                        </div>
                        <div className="text-xs text-gray-500">감정적 메시지</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageGenerator; 