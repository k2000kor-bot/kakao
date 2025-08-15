import React, { useState, useRef, useEffect } from 'react';
import {
    PaperClipIcon,
    MicrophoneIcon,
    CogIcon,
    RocketLaunchIcon,
    AcademicCapIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

interface UnifiedDoctorLevelInputProps {
    onSendMessage: (message: string) => void;
    onFileUpload?: (files: File[]) => void;
    onVoiceInput?: () => void;
    onToolClick?: () => void;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
    showFileUpload?: boolean;
    showVoiceInput?: boolean;
    showToolButton?: boolean;
    showStyleButtons?: boolean;
    autoFocus?: boolean;
    maxLength?: number;
    projectContext?: string;
    attachedFiles?: File[];
    onRemoveFile?: (file: File) => void;
    onClearFiles?: () => void;
}

const UnifiedDoctorLevelInput: React.FC<UnifiedDoctorLevelInputProps> = ({
    onSendMessage,
    onFileUpload,
    onVoiceInput,
    onToolClick,
    placeholder = "무엇이든 물어보세요",
    disabled = false,
    isLoading = false,
    className = "",
    showFileUpload = true,
    showVoiceInput = true,
    showToolButton = true,
    showStyleButtons = true,
    autoFocus = true,
    maxLength = 10000,
    projectContext,
    attachedFiles = [],
    onRemoveFile,
    onClearFiles
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<'phd' | 'academic' | 'general'>('phd');
    const [isExpanded, setIsExpanded] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 자동 높이 조절 - 더 큰 최대 높이
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = isExpanded ? 800 : 300; // 더 큰 기본 높이
            const newHeight = Math.min(scrollHeight, maxHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [inputMessage, isExpanded]);

    const handleSendMessage = () => {
        if (inputMessage.trim() && !disabled && !isLoading) {
            onSendMessage(inputMessage.trim());
            setInputMessage('');
            setIsExpanded(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        } else if (e.key === 'Enter' && e.shiftKey) {
            setIsExpanded(true);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0 && onFileUpload) {
            onFileUpload(Array.from(files));
            event.target.value = '';
        }
    };

    const handleVoiceInput = () => {
        if (onVoiceInput) {
            onVoiceInput();
        }
    };

    const handleToolClick = () => {
        if (onToolClick) {
            onToolClick();
        }
    };

    const getStyleButtonClass = (style: string) => {
        const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm";
        return selectedStyle === style
            ? `${baseClass} bg-blue-600 text-white shadow-lg`
            : `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    };

    return (
        <div className={`w-full max-w-none bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ${className}`} style={{ minHeight: '400px' }}>
            {/* 첨부된 파일 표시 - 이미지처럼 상단에 배치 */}
            {attachedFiles.length > 0 && (
                <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">첨부된 파일</h4>
                        {onClearFiles && (
                            <button
                                onClick={onClearFiles}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                모두 제거
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                                    <DocumentTextIcon className="w-5 h-5 text-pink-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                                    <p className="text-xs text-gray-500">문서</p>
                                </div>
                                {onRemoveFile && (
                                    <button
                                        onClick={() => onRemoveFile(file)}
                                        className="text-gray-400 hover:text-red-500 ml-2"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 메인 입력 영역 - 이미지처럼 큰 입력창 */}
            <div className="flex flex-col h-full">
                {/* 입력창 - 이미지처럼 매우 크게 */}
                <div className="flex-1 relative p-6">
                    <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="w-full bg-transparent border-none outline-none resize-none text-gray-900 py-6 text-left leading-8 text-xl min-h-[300px] max-h-[800px] overflow-y-auto transition-all duration-200 placeholder:text-gray-400 font-medium"
                        rows={12}
                        title="박사급 AI와 대화하세요"
                        onKeyDown={handleKeyDown}
                        autoFocus={autoFocus}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        style={{
                            lineHeight: '2.5rem',
                            minHeight: '300px',
                            maxHeight: '800px',
                            fontSize: '1.25rem'
                        }}
                    />
                </div>

                {/* 하단 컨트롤 영역 - 이미지처럼 도구와 음성 버튼 */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        {/* 왼쪽: 파일 첨부, 도구 - 이미지처럼 */}
                        <div className="flex items-center space-x-4">
                            {showFileUpload && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                                        title="파일 첨부"
                                    >
                                        <PlusIcon className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm text-gray-700">파일</span>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileChange}
                                        multiple
                                        className="hidden"
                                        accept=".txt,.doc,.docx,.pdf,.jpg,.jpeg,.png,.mp4,.mp3"
                                        title="파일 선택"
                                        aria-label="파일 업로드"
                                    />
                                </div>
                            )}

                            {showToolButton && (
                                <button
                                    onClick={handleToolClick}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                                    title="도구"
                                >
                                    <CogIcon className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm text-gray-700">도구</span>
                                </button>
                            )}
                        </div>

                        {/* 오른쪽: 음성, 전송 - 이미지처럼 */}
                        <div className="flex items-center space-x-3">
                            {showVoiceInput && (
                                <button
                                    onClick={handleVoiceInput}
                                    className="w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                    title="음성 입력"
                                    disabled={disabled || isLoading}
                                >
                                    <MicrophoneIcon className="w-6 h-6" />
                                </button>
                            )}

                            <button
                                onClick={handleSendMessage}
                                disabled={disabled || isLoading || !inputMessage.trim()}
                                className="w-12 h-12 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                title="전송"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <RocketLaunchIcon className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 스타일 선택 버튼 */}
                    {showStyleButtons && (
                        <div className="flex items-center justify-center mt-4 space-x-2">
                            <button
                                onClick={() => setSelectedStyle('phd')}
                                className={getStyleButtonClass('phd')}
                            >
                                <AcademicCapIcon className="w-4 h-4 inline mr-1" />
                                박사급
                            </button>
                            <button
                                onClick={() => setSelectedStyle('academic')}
                                className={getStyleButtonClass('academic')}
                            >
                                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                                학술적
                            </button>
                            <button
                                onClick={() => setSelectedStyle('general')}
                                className={getStyleButtonClass('general')}
                            >
                                <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                                일반
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnifiedDoctorLevelInput;
