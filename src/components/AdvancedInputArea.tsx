import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { imageAnalysisService, ImageAnalysisResult } from '../services/imageAnalysisService';


interface AdvancedInputAreaProps {
    onSend: (message: string, context?: { files?: File[], analysis?: any }) => void;
    placeholder?: string;
    disabled?: boolean;
    projectContext?: any;
}

interface AttachedFile {
    id: string;
    file: File;
    type: 'image' | 'document' | 'audio' | 'video' | 'other';
    analysis?: ImageAnalysisResult;
    progress?: number;
    status: 'uploading' | 'analyzing' | 'completed' | 'error';
}

const AdvancedInputArea: React.FC<AdvancedInputAreaProps> = ({
    onSend,
    placeholder = "무엇이든 물어보세요",
    disabled = false,
    projectContext
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showTools, setShowTools] = useState(false);
    const [showVoiceVisualizer, setShowVoiceVisualizer] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [voiceCommand, setVoiceCommand] = useState<string>('');

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const voiceVisualizerRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    // 고도화된 음성 인식 훅 사용
    const {
        isListening,
        isSupported: voiceSupported,
        transcript,
        confidence,
        interimTranscript,
        finalTranscript,
        error: voiceError,
        startListening,
        stopListening,
        resetTranscript,
        changeLanguage,
        toggleContinuous,
        getAudioData,
        analyzeVoiceQuality,
        processVoiceCommand
    } = useVoiceRecognition({
        onResult: (transcript, isFinal) => {
            if (isFinal) {
                const command = processVoiceCommand(transcript);
                handleVoiceCommand(command);
            } else {
                setVoiceCommand(transcript);
            }
        },
        onError: (error) => {
            console.error('Voice recognition error:', error);
        },
        onStart: () => {
            setShowVoiceVisualizer(true);
        },
        onStop: () => {
            setShowVoiceVisualizer(false);
            setVoiceCommand('');
        }
    });

    // 음성 명령 처리
    const handleVoiceCommand = useCallback((command: any) => {
        switch (command.type) {
            case 'send':
                if (command.data) {
                    handleSend(command.data);
                }
                break;
            case 'cancel':
                resetTranscript();
                break;
            case 'clear':
                setInputValue('');
                setAttachedFiles([]);
                break;
            case 'tools':
                setShowTools(!showTools);
                break;
            case 'file':
                fileInputRef.current?.click();
                break;
            case 'voice':
                if (isListening) {
                    stopListening();
                } else {
                    startListening();
                }
                break;
            default:
                setInputValue(prev => prev + command.data);
        }
    }, [isListening, showTools, startListening, stopListening, resetTranscript]);

    // 메시지 전송
    const handleSend = useCallback((message?: string) => {
        const textToSend = message || inputValue.trim();
        if (textToSend && !disabled) {
            const context = attachedFiles.length > 0 ? {
                files: attachedFiles.map(f => f.file),
                analysis: attachedFiles.map(f => f.analysis).filter(Boolean)
            } : undefined;

            onSend(textToSend, context);
            setInputValue('');
            setAttachedFiles([]);
            resetTranscript();
        }
    }, [inputValue, attachedFiles, disabled, onSend, resetTranscript]);

    // 키보드 이벤트 처리
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    // 파일 첨부 처리
    const handleFileAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        for (const file of files) {
            const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const fileType = getFileType(file);

            const attachedFile: AttachedFile = {
                id: fileId,
                file,
                type: fileType,
                status: 'uploading'
            };

            setAttachedFiles(prev => [...prev, attachedFile]);

            // 이미지 파일인 경우 분석 수행
            if (fileType === 'image') {
                try {
                    attachedFile.status = 'analyzing';
                    setAttachedFiles(prev => [...prev]);

                    const analysis = await imageAnalysisService.analyzeImage(file);

                    attachedFile.analysis = analysis;
                    attachedFile.status = 'completed';
                    setAttachedFiles(prev => [...prev]);
                } catch (error) {
                    attachedFile.status = 'error';
                    setAttachedFiles(prev => [...prev]);
                }
            } else {
                attachedFile.status = 'completed';
                setAttachedFiles(prev => [...prev]);
            }
        }

        // 파일 입력 초기화
        if (e.target) {
            e.target.value = '';
        }
    }, []);

    // 파일 타입 판별
    const getFileType = (file: File): AttachedFile['type'] => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('audio/')) return 'audio';
        if (file.type.includes('pdf') || file.type.includes('document')) return 'document';
        return 'other';
    };

    // 파일 제거
    const removeFile = useCallback((fileId: string) => {
        setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    // 음성 녹음 토글
    const handleVoiceRecord = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    // 음성 시각화 애니메이션
    useEffect(() => {
        if (!showVoiceVisualizer || !voiceVisualizerRef.current) return;

        const canvas = voiceVisualizerRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            const audioData = getAudioData();
            if (!audioData) return;

            const width = canvas.width;
            const height = canvas.height;
            const barWidth = width / audioData.length;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#007bff';

            audioData.forEach((value, index) => {
                const barHeight = (value / 255) * height;
                const x = index * barWidth;
                const y = height - barHeight;

                ctx.fillRect(x, y, barWidth - 1, barHeight);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [showVoiceVisualizer, getAudioData]);

    // 음성 품질 분석
    useEffect(() => {
        if (isListening) {
            const interval = setInterval(() => {
                const quality = analyzeVoiceQuality();
                if (quality && quality.volume < 0.1) {
                    console.log('음성 볼륨이 낮습니다. 마이크를 확인해주세요.');
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isListening, analyzeVoiceQuality]);

    // 입력창 자동 크기 조정
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    return (
        <div className="advanced-input-area">
            {/* 첨부 파일 표시 */}
            {attachedFiles.length > 0 && (
                <div className="attached-files">
                    {attachedFiles.map((file) => (
                        <div key={file.id} className="attached-file">
                            <div className="file-info">
                                <span className="file-icon">
                                    {file.type === 'image' && '🖼️'}
                                    {file.type === 'document' && '📄'}
                                    {file.type === 'audio' && '🎵'}
                                    {file.type === 'video' && '🎬'}
                                    {file.type === 'other' && '📎'}
                                </span>
                                <span className="file-name">{file.file.name}</span>
                                <span className="file-status">
                                    {file.status === 'uploading' && '업로드 중...'}
                                    {file.status === 'analyzing' && '분석 중...'}
                                    {file.status === 'completed' && '완료'}
                                    {file.status === 'error' && '오류'}
                                </span>
                            </div>
                            <button
                                className="remove-file-btn"
                                onClick={() => removeFile(file.id)}
                                disabled={file.status === 'uploading' || file.status === 'analyzing'}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 음성 시각화 */}
            {showVoiceVisualizer && (
                <div className="voice-visualizer">
                    <canvas
                        ref={voiceVisualizerRef}
                        width={300}
                        height={60}
                        className="voice-canvas"
                    />
                    <div className="voice-info">
                        <span className="voice-status">
                            {interimTranscript || '음성을 인식하고 있습니다...'}
                        </span>
                        {confidence > 0 && (
                            <span className="voice-confidence">
                                신뢰도: {Math.round(confidence * 100)}%
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 음성 명령 표시 */}
            {voiceCommand && (
                <div className="voice-command">
                    <span className="command-label">음성 명령:</span>
                    <span className="command-text">{voiceCommand}</span>
                </div>
            )}

            {/* 메인 입력 컨테이너 */}
            <div className="input-container">
                <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="input-field"
                    rows={1}
                    disabled={disabled}
                />

                {/* 왼쪽 컨트롤 */}
                <div className="input-controls-left">
                    <button
                        className="control-btn file-btn"
                        onClick={handleFileAttach}
                        disabled={disabled}
                        title="파일 첨부"
                    >
                        📎
                    </button>
                    <button
                        className="control-btn tools-btn"
                        onClick={() => setShowTools(!showTools)}
                        disabled={disabled}
                        title="도구"
                    >
                        ⚙️
                    </button>
                    <span className="tools-text">도구</span>
                </div>

                {/* 오른쪽 컨트롤 */}
                <div className="input-controls-right">
                    <button
                        className={`control-btn voice-btn ${isListening ? 'recording' : ''}`}
                        onClick={handleVoiceRecord}
                        disabled={disabled || !voiceSupported}
                        title={voiceSupported ? "음성 입력" : "음성 인식 미지원"}
                    >
                        {isListening ? '🔴' : '🎤'}
                    </button>
                    <button
                        className={`control-btn send-btn ${inputValue.trim() && !disabled ? 'active' : ''}`}
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || disabled}
                        title="전송"
                    >
                        ➤
                    </button>
                </div>
            </div>

            {/* 숨겨진 파일 입력 */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* 도구 패널 */}
            {showTools && (
                <div className="tools-panel">
                    <div className="tool-section">
                        <h4>음성 설정</h4>
                        <div className="tool-item">
                            <label>언어:</label>
                            <select
                                onChange={(e) => changeLanguage(e.target.value)}
                                value="ko-KR"
                            >
                                <option value="ko-KR">한국어</option>
                                <option value="en-US">English</option>
                                <option value="ja-JP">日本語</option>
                                <option value="zh-CN">中文</option>
                            </select>
                        </div>
                        <div className="tool-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={toggleContinuous}
                                />
                                연속 인식
                            </label>
                        </div>
                    </div>

                    <div className="tool-section">
                        <h4>이미지 분석</h4>
                        <div className="tool-item" onClick={() => setShowTools(false)}>
                            📊 OCR 텍스트 추출
                        </div>
                        <div className="tool-item" onClick={() => setShowTools(false)}>
                            🎯 객체 감지
                        </div>
                        <div className="tool-item" onClick={() => setShowTools(false)}>
                            😊 감정 분석
                        </div>
                        <div className="tool-item" onClick={() => setShowTools(false)}>
                            🎨 색상 분석
                        </div>
                    </div>

                    <div className="tool-section">
                        <h4>고급 기능</h4>
                        <div className="tool-item" onClick={() => setShowTools(false)}>
                            🔍 실시간 검색
                        </div>
                        <div className="tool-item" onClick={() => setShowTools(false)}>
                            📝 템플릿 생성
                        </div>
                        <div className="tool-item" onClick={() => setShowTools(false)}>
                            🎭 AI 성격 설정
                        </div>
                    </div>
                </div>
            )}

            {/* 오류 메시지 */}
            {voiceError && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{voiceError}</span>
                </div>
            )}
        </div>
    );
};

export default AdvancedInputArea;
