import React, { useState, useRef, useEffect } from 'react';
import {
    PaperAirplaneIcon,
    PlusIcon,
    MicrophoneIcon,
    SpeakerWaveIcon,
    CogIcon,
    FaceSmileIcon,
    PhotoIcon,
    DocumentIcon,
    VideoCameraIcon,
    XMarkIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    SparklesIcon,
    LightBulbIcon,
    AcademicCapIcon,
    FolderIcon,
    ChartBarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

interface DetailedChatInputProps {
    onSendMessage: (message: string) => void;
    onFileUpload: (files: FileList) => void;
    onVoiceInput: () => void;
    onSmartSuggestion: (suggestion: string) => void;
    isProcessing?: boolean;
    projectContext?: string;
    className?: string;
}

const DetailedChatInput: React.FC<DetailedChatInputProps> = ({
    onSendMessage,
    onFileUpload,
    onVoiceInput,
    onSmartSuggestion,
    isProcessing = false,
    projectContext = "개포우성_실명방",
    className = ""
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showTools, setShowTools] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [autoComplete, setAutoComplete] = useState<string[]>([]);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);

    // 자동 완성 제안
    const smartSuggestions = [
        {
            icon: <AcademicCapIcon className="w-4 h-4" />,
            text: "이 대화를 분석해줘",
            category: "분석"
        },
        {
            icon: <LightBulbIcon className="w-4 h-4" />,
            text: "메시지 가이드를 만들어줘",
            category: "가이드"
        },
        {
            icon: <FolderIcon className="w-4 h-4" />,
            text: "프로젝트 정보를 알려줘",
            category: "프로젝트"
        },
        {
            icon: <ChartBarIcon className="w-4 h-4" />,
            text: "파일 목록을 보여줘",
            category: "파일"
        },
        {
            icon: <SparklesIcon className="w-4 h-4" />,
            text: "시스템 상태를 확인해줘",
            category: "시스템"
        }
    ];

    // 자동 완성 로직
    useEffect(() => {
        if (inputMessage.length > 2) {
            const suggestions = smartSuggestions
                .filter(s => s.text.toLowerCase().includes(inputMessage.toLowerCase()))
                .map(s => s.text);
            setAutoComplete(suggestions);
        } else {
            setAutoComplete([]);
        }
    }, [inputMessage]);

    // 자동 높이 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputMessage]);

    // 음성 인식 초기화
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'ko-KR';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setInputMessage(prev => prev + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('음성 인식 오류:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    const handleSendMessage = () => {
        if (inputMessage.trim() && !isProcessing) {
            onSendMessage(inputMessage.trim());
            setInputMessage('');
            setIsExpanded(false);
            setAutoComplete([]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            setAttachedFiles(prev => [...prev, ...fileArray]);
            onFileUpload(files);
            setShowFileUpload(false);
        }
    };

    const handleVoiceInput = () => {
        if (recognitionRef.current) {
            if (!isListening) {
                recognitionRef.current.start();
                setIsListening(true);
                setIsRecording(true);
            } else {
                recognitionRef.current.stop();
                setIsListening(false);
                setIsRecording(false);
            }
        } else {
            onVoiceInput();
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setInputMessage(prev => prev + emoji);
        setShowEmoji(false);
    };

    const handleSuggestionSelect = (suggestion: string) => {
        onSmartSuggestion(suggestion);
        setShowSmartSuggestions(false);
    };

    const removeAttachedFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const quickEmojis = ['😊', '👍', '❤️', '🎉', '🔥', '💡', '📝', '✅', '❌', '🤔'];

    const toolOptions = [
        {
            id: 'photo',
            icon: <PhotoIcon className="w-5 h-5" />,
            label: '사진',
            action: () => {
                fileInputRef.current?.click();
                setShowTools(false);
            }
        },
        {
            id: 'document',
            icon: <DocumentIcon className="w-5 h-5" />,
            label: '문서',
            action: () => {
                fileInputRef.current?.click();
                setShowTools(false);
            }
        },
        {
            id: 'video',
            icon: <VideoCameraIcon className="w-5 h-5" />,
            label: '동영상',
            action: () => {
                fileInputRef.current?.click();
                setShowTools(false);
            }
        },
        {
            id: 'smart',
            icon: <SparklesIcon className="w-5 h-5" />,
            label: '스마트',
            action: () => {
                setShowSmartSuggestions(!showSmartSuggestions);
                setShowTools(false);
            }
        }
    ];

    return (
        <div className={`bg-white border-t ${className}`}>
            {/* 첨부된 파일 표시 */}
            {attachedFiles.length > 0 && (
                <div className="px-3 py-2 border-b bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">첨부된 파일</span>
                        <button
                            onClick={() => setAttachedFiles([])}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            모두 제거
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-white border rounded-lg px-2 py-1">
                                <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-700 truncate max-w-32">{file.name}</span>
                                <button
                                    onClick={() => removeAttachedFile(index)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 확장된 입력 영역 */}
            {isExpanded && (
                <div className="p-3 border-b bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">고급 옵션</span>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="닫기"
                        >
                            <XMarkIcon className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* 도구 버튼들 */}
                    <div className="grid grid-cols-4 gap-2">
                        {toolOptions.map(tool => (
                            <button
                                key={tool.id}
                                onClick={tool.action}
                                className="flex flex-col items-center p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                                title={tool.label}
                            >
                                <div className="text-gray-600 mb-1">{tool.icon}</div>
                                <span className="text-xs text-gray-600">{tool.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 메인 입력 영역 */}
            <div className="p-3">
                <div className="flex items-end space-x-2">
                    {/* 파일 업로드 버튼 */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFileUpload(!showFileUpload)}
                            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            title="파일 첨부"
                        >
                            <PlusIcon className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* 파일 업로드 드롭다운 */}
                        {showFileUpload && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-48">
                                <div className="text-xs text-gray-500 mb-2 px-2">파일 선택</div>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => {
                                            fileInputRef.current?.click();
                                            setShowFileUpload(false);
                                        }}
                                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                                    >
                                        <PhotoIcon className="w-4 h-4 text-gray-500" />
                                        <span>사진/이미지</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            fileInputRef.current?.click();
                                            setShowFileUpload(false);
                                        }}
                                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                                    >
                                        <DocumentIcon className="w-4 h-4 text-gray-500" />
                                        <span>문서</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            fileInputRef.current?.click();
                                            setShowFileUpload(false);
                                        }}
                                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                                    >
                                        <VideoCameraIcon className="w-4 h-4 text-gray-500" />
                                        <span>동영상</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 도구 버튼 */}
                    <button
                        onClick={() => setShowTools(!showTools)}
                        className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="도구"
                    >
                        <CogIcon className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* 메인 입력 필드 */}
                    <div className="flex-1 relative">
                        <div className="relative">
                            <textarea
                                ref={textareaRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`${projectContext}에서 새 채팅`}
                                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none max-h-32 overflow-y-auto text-sm"
                                disabled={isProcessing}
                                rows={1}
                                title="메시지 입력"
                            />

                            {/* 입력 필드 내부 버튼들 */}
                            <div className="absolute right-2 top-2 flex items-center space-x-1">
                                {/* 이모티콘 버튼 */}
                                <button
                                    onClick={() => setShowEmoji(!showEmoji)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="이모티콘"
                                >
                                    <FaceSmileIcon className="w-4 h-4 text-gray-500" />
                                </button>

                                {/* 음성 입력 버튼 */}
                                <button
                                    onClick={handleVoiceInput}
                                    className={`p-1 rounded transition-colors ${isRecording
                                            ? 'bg-red-100 text-red-600'
                                            : 'hover:bg-gray-100 text-gray-500'
                                        }`}
                                    title="음성 입력"
                                >
                                    <MicrophoneIcon className="w-4 h-4" />
                                </button>

                                {/* 음성 출력 버튼 */}
                                <button
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="음성 출력"
                                >
                                    <SpeakerWaveIcon className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* 자동 완성 드롭다운 */}
                        {autoComplete.length > 0 && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border rounded-lg shadow-lg p-2">
                                <div className="text-xs text-gray-500 mb-2 px-2">자동 완성</div>
                                <div className="space-y-1">
                                    {autoComplete.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setInputMessage(suggestion);
                                                setAutoComplete([]);
                                            }}
                                            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 이모티콘 선택 패널 */}
                        {showEmoji && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-lg p-2">
                                <div className="grid grid-cols-5 gap-1">
                                    {quickEmojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleEmojiSelect(emoji)}
                                            className="p-1 hover:bg-gray-100 rounded text-lg"
                                            title={emoji}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 도구 패널 */}
                        {showTools && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-48">
                                <div className="text-xs text-gray-500 mb-2 px-2">도구</div>
                                <div className="space-y-1">
                                    <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
                                        분석 모드
                                    </button>
                                    <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
                                        가이드 모드
                                    </button>
                                    <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
                                        프로젝트 모드
                                    </button>
                                    <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded">
                                        설정
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 스마트 제안 패널 */}
                        {showSmartSuggestions && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-64">
                                <div className="text-xs text-gray-500 mb-2 px-2">스마트 제안</div>
                                <div className="space-y-1">
                                    {smartSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionSelect(suggestion.text)}
                                            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                                        >
                                            <div className="text-gray-500">{suggestion.icon}</div>
                                            <span>{suggestion.text}</span>
                                            <span className="text-xs text-gray-400 ml-auto">{suggestion.category}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 확장 버튼 */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="추가 옵션"
                    >
                        {isExpanded ? (
                            <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                        ) : (
                            <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {/* 전송 버튼 */}
                    <button
                        onClick={handleSendMessage}
                        disabled={isProcessing || !inputMessage.trim()}
                        className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="전송"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* 상태 표시 */}
                {isRecording && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <span>{isListening ? '음성 인식 중...' : '음성 녹음 중...'}</span>
                    </div>
                )}

                {isProcessing && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>AI가 응답을 생성하고 있습니다...</span>
                    </div>
                )}
            </div>

            {/* 숨겨진 파일 입력 */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.mov"
                title="파일 선택"
            />
        </div>
    );
};

export default DetailedChatInput; 