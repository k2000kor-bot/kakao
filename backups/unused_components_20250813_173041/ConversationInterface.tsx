import React, { useState, useEffect, useRef } from 'react';
import { useChat, useNotifications } from '../context/AppContext';
import localAIService from '../services/localAIService';
import {
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    CogIcon,
    DocumentTextIcon,
    ChartBarIcon,
    FolderIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    SparklesIcon,
    LightBulbIcon,
    AcademicCapIcon,
    ClipboardDocumentIcon,
    ArrowPathIcon,
    StarIcon,
    BeakerIcon,
    PlayIcon,
    PauseIcon,
    StopIcon
} from '@heroicons/react/24/outline';

interface ConversationInterfaceProps {
    className?: string;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({ className = '' }) => {
    const { messages, addMessage } = useChat();
    const { addNotification } = useNotifications();

    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<string>('');
    const [isAutoMode, setIsAutoMode] = useState(false);
    const [autoModeInterval, setAutoModeInterval] = useState<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 자동 모드 처리
    useEffect(() => {
        if (isAutoMode) {
            const interval = setInterval(() => {
                const autoMessages = [
                    '시스템 상태를 확인해줘',
                    '현재 프로젝트 정보를 알려줘',
                    '업로드된 파일 목록을 보여줘',
                    '이 대화를 분석해줘',
                    '메시지 가이드를 만들어줘'
                ];
                const randomMessage = autoMessages[Math.floor(Math.random() * autoMessages.length)];
                setInputMessage(randomMessage);
                setTimeout(() => {
                    handleSendMessage();
                }, 1000);
            }, 10000); // 10초마다 자동 메시지

            setAutoModeInterval(interval);
        } else {
            if (autoModeInterval) {
                clearInterval(autoModeInterval);
                setAutoModeInterval(null);
            }
        }

        return () => {
            if (autoModeInterval) {
                clearInterval(autoModeInterval);
            }
        };
    }, [isAutoMode]);

    // 빠른 액션 버튼들
    const quickActions = [
        {
            id: 'analysis',
            icon: <DocumentTextIcon className="w-4 h-4" />,
            title: '분석',
            description: 'AI 분석 수행',
            example: '이 대화를 분석해줘',
            color: 'text-blue-600'
        },
        {
            id: 'guidance',
            icon: <LightBulbIcon className="w-4 h-4" />,
            title: '가이드',
            description: '메시지 가이드 생성',
            example: '이 상황에 대한 메시지 가이드를 만들어줘',
            color: 'text-yellow-600'
        },
        {
            id: 'project',
            icon: <FolderIcon className="w-4 h-4" />,
            title: '프로젝트',
            description: '프로젝트 정보 조회',
            example: '개포우성7차 프로젝트 정보를 알려줘',
            color: 'text-green-600'
        },
        {
            id: 'file',
            icon: <ChartBarIcon className="w-4 h-4" />,
            title: '파일',
            description: '파일 관리',
            example: '업로드된 파일 목록을 보여줘',
            color: 'text-purple-600'
        },
        {
            id: 'system',
            icon: <CogIcon className="w-4 h-4" />,
            title: '시스템',
            description: '시스템 상태 확인',
            example: '시스템 상태를 확인해줘',
            color: 'text-red-600'
        }
    ];

    // 도움말 메시지
    const helpMessages = [
        {
            icon: <DocumentTextIcon className="w-5 h-5" />,
            title: '분석 기능',
            description: '"분석" 또는 "analyze"를 포함한 메시지를 입력하면 AI 분석을 수행합니다.',
            example: '이 대화를 분석해줘',
            features: ['감정 분석', '의도 분석', '주제 추출', '복잡도 평가']
        },
        {
            icon: <LightBulbIcon className="w-5 h-5" />,
            title: '가이드 기능',
            description: '"가이드" 또는 "guidance"를 포함한 메시지를 입력하면 메시지 가이드를 생성합니다.',
            example: '이 상황에 대한 메시지 가이드를 만들어줘',
            features: ['톤 설정', '길이 조절', '구조 가이드', '예시 제공']
        },
        {
            icon: <FolderIcon className="w-5 h-5" />,
            title: '프로젝트 기능',
            description: '"프로젝트" 또는 "project"를 포함한 메시지를 입력하면 프로젝트 정보를 제공합니다.',
            example: '개포우성7차 프로젝트 정보를 알려줘',
            features: ['진행 상황', '팀 구성', '관련 파일', '지침 정보']
        },
        {
            icon: <ChartBarIcon className="w-5 h-5" />,
            title: '파일 기능',
            description: '"파일" 또는 "file"을 포함한 메시지를 입력하면 파일 관련 작업을 수행합니다.',
            example: '업로드된 파일 목록을 보여줘',
            features: ['파일 검색', '카테고리별 분류', '메타데이터 확인', '다운로드']
        },
        {
            icon: <CogIcon className="w-5 h-5" />,
            title: '시스템 기능',
            description: '"시스템" 또는 "상태"를 포함한 메시지를 입력하면 시스템 상태를 확인합니다.',
            example: '시스템 상태를 확인해줘',
            features: ['실시간 모니터링', '성능 최적화', '오류 로깅', '자동 복구']
        }
    ];

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isProcessing) return;

        const userMessage = {
            id: Date.now().toString(),
            content: inputMessage,
            sender: 'user' as const,
            timestamp: new Date().toISOString(),
            type: 'text' as const
        };

        addMessage(userMessage);
        setInputMessage('');
        setIsProcessing(true);

        try {
            // 로컬 AI 서비스를 통한 처리
            const response = await localAIService.processConversationCommand(inputMessage);

            if (response.success) {
                addMessage({
                    id: response.message.id,
                    content: response.message.content,
                    sender: response.message.sender as 'user' | 'ai' | 'system',
                    timestamp: response.message.timestamp,
                    type: 'text',
                    metadata: response.metadata
                });

                // 성공 알림
                addNotification({
                    type: 'success',
                    title: '메시지 처리 완료',
                    message: `${response.metadata?.usedServices?.join(', ')} 서비스를 통해 응답을 생성했습니다.`,
                    duration: 3000
                });
            } else {
                // 실패 시 대체 응답
                addMessage({
                    id: response.message.id,
                    content: response.message.content,
                    sender: 'ai',
                    timestamp: new Date().toISOString(),
                    type: 'text'
                });

                addNotification({
                    type: 'warning',
                    title: '일시적 오류',
                    message: '일부 서비스에 연결할 수 없어 대체 응답을 제공합니다.',
                    duration: 5000
                });
            }
        } catch (error) {
            console.error('메시지 처리 오류:', error);

            // 오류 응답
            addMessage({
                id: `error_${Date.now()}`,
                content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
                sender: 'system',
                timestamp: new Date().toISOString(),
                type: 'text'
            });

            addNotification({
                type: 'error',
                title: '시스템 오류',
                message: '메시지 처리 중 오류가 발생했습니다.',
                duration: 5000
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuickAction = (action: any) => {
        setInputMessage(action.example);
        setSelectedFeature(action.id);
        setShowQuickActions(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleAutoMode = () => {
        setIsAutoMode(!isAutoMode);
        if (!isAutoMode) {
            addNotification({
                type: 'success',
                title: '자동 모드 활성화',
                message: '10초마다 자동으로 기능을 테스트합니다.',
                duration: 3000
            });
        } else {
            addNotification({
                type: 'info',
                title: '자동 모드 비활성화',
                message: '자동 테스트가 중지되었습니다.',
                duration: 3000
            });
        }
    };

    const getMessageIcon = (sender: string) => {
        switch (sender) {
            case 'user':
                return <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">U</div>;
            case 'ai':
                return <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">AI</div>;
            case 'system':
                return <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">S</div>;
            default:
                return <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold">?</div>;
        }
    };

    const getMessageStyle = (sender: string) => {
        switch (sender) {
            case 'user':
                return 'bg-blue-500 text-white ml-auto';
            case 'ai':
                return 'bg-white text-gray-900 border border-gray-200';
            case 'system':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-900';
        }
    };

    return (
        <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
            {/* 헤더 */}
            <div className="bg-white shadow-sm border-b px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">CORBU.AI 대화 시스템</h1>
                            <p className="text-xs text-gray-600">통합 AI 기능을 대화형으로 이용하세요</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleAutoMode}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm ${
                                isAutoMode 
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                            title={isAutoMode ? '자동 모드 중지' : '자동 모드 시작'}
                        >
                            {isAutoMode ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                            <span>{isAutoMode ? '자동 중지' : '자동 시작'}</span>
                        </button>
                        <button
                            onClick={() => setShowQuickActions(!showQuickActions)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                            title="빠른 액션"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            <span>빠른 액션</span>
                        </button>
                        <button
                            onClick={() => setShowHelp(!showHelp)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                            title="도움말 보기"
                        >
                            <InformationCircleIcon className="w-4 h-4" />
                            <span>도움말</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 빠른 액션 패널 */}
            {showQuickActions && (
                <div className="bg-green-50 border-b px-4 py-3">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleQuickAction(action)}
                                className="bg-white rounded-lg p-3 border border-green-200 hover:bg-green-50 transition-colors text-left"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className={action.color}>{action.icon}</div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{action.title}</h3>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{action.description}</p>
                                <div className="bg-gray-100 rounded px-2 py-1">
                                    <p className="text-xs text-gray-700 font-mono">"{action.example}"</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 도움말 패널 */}
            {showHelp && (
                <div className="bg-blue-50 border-b px-4 py-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {helpMessages.map((help, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="text-blue-600">{help.icon}</div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{help.title}</h3>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{help.description}</p>
                                <div className="bg-gray-100 rounded px-2 py-1 mb-2">
                                    <p className="text-xs text-gray-700 font-mono">"{help.example}"</p>
                                </div>
                                <div className="text-xs text-gray-500">
                                    <strong>주요 기능:</strong>
                                    <ul className="mt-1 space-y-1">
                                        {help.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center space-x-1">
                                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">CORBU.AI와 대화를 시작하세요</h3>
                        <p className="text-gray-600 text-sm mb-4">분석, 가이드, 프로젝트 관리 등 다양한 기능을 대화형으로 이용할 수 있습니다.</p>
                        
                        {/* 시작 가이드 */}
                        <div className="max-w-md mx-auto">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-3">시작하기</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>메시지를 입력하고 Enter를 누르세요</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>키워드를 포함하여 특정 기능을 호출하세요</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span>빠른 액션 버튼을 사용하여 즉시 시작하세요</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span>자동 모드로 모든 기능을 테스트해보세요</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {getMessageIcon(message.sender)}
                            <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg shadow-sm ${getMessageStyle(message.sender)}`}>
                                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                    {message.metadata?.confidence && (
                                        <span className="flex items-center space-x-1">
                                            <CheckCircleIcon className="w-3 h-3" />
                                            <span>{(message.metadata.confidence * 100).toFixed(0)}%</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isProcessing && (
                    <div className="flex items-start space-x-3">
                        {getMessageIcon('ai')}
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-gray-600">메시지를 처리하고 있습니다...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div className="bg-white border-t p-4">
                <div className="flex space-x-3">
                    <div className="flex-1">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="메시지를 입력하세요... (분석, 가이드, 프로젝트, 파일, 시스템 등)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                            disabled={isProcessing}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={isProcessing || !inputMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                        title="메시지 전송"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">전송</span>
                    </button>
                </div>

                {/* 상태 표시 */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>
                        {isProcessing ? '처리 중...' : isAutoMode ? '자동 모드 활성화' : '대화형 AI 시스템 준비됨'}
                    </span>
                    <span>
                        {messages.length}개 메시지
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ConversationInterface; 