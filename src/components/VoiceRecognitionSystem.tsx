import React, { useState, useEffect, useRef } from 'react';


interface VoiceRecognitionProps {
    onStart?: () => void;
    onStop?: () => void;
    onResult?: (text: string) => void;
    onError?: (error: string) => void;
    isRecording?: boolean;
    language?: 'ko' | 'en' | 'ja' | 'zh';
    autoStart?: boolean;
    continuous?: boolean;
}

interface VoiceRecognitionSystemProps {
    onTextResult: (text: string) => void;
    onStart?: () => void;
    onStop?: () => void;
}

const VoiceRecognitionSystem: React.FC<VoiceRecognitionSystemProps> = ({
    onTextResult,
    onStart,
    onStop
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [finalText, setFinalText] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);

    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        // 브라우저 지원 확인
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();
            setupRecognition();
        } else {
            setError('이 브라우저는 음성 인식을 지원하지 않습니다.');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const setupRecognition = () => {
        if (!recognitionRef.current) return;

        const recognition = recognitionRef.current;

        // 음성 인식 설정
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ko-KR';
        recognition.maxAlternatives = 3;

        // 이벤트 핸들러 설정
        recognition.onstart = () => {
            setIsRecording(true);
            setError(null);
            setInterimText('');
            setFinalText('');
            setConfidence(0);
            setRecordingTime(0);
            startTimeRef.current = Date.now();

            // 타이머 시작
            timerRef.current = setInterval(() => {
                setRecordingTime(Date.now() - startTimeRef.current);
            }, 100);

            onStart?.();
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    setConfidence(confidence);
                } else {
                    interimTranscript += transcript;
                }
            }

            setInterimText(interimTranscript);
            setFinalText(finalTranscript);

            // 최종 결과가 있으면 콜백 호출
            if (finalTranscript) {
                onTextResult(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('음성 인식 오류:', event.error);
            setError(`음성 인식 오류: ${event.error}`);
            setIsRecording(false);
            onStop?.();
        };

        recognition.onend = () => {
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            onStop?.();
        };
    };

    const startRecording = () => {
        if (!isSupported) {
            setError('음성 인식이 지원되지 않습니다.');
            return;
        }

        try {
            recognitionRef.current?.start();
        } catch (error) {
            setError('음성 인식을 시작할 수 없습니다.');
        }
    };

    const stopRecording = () => {
        try {
            recognitionRef.current?.stop();
        } catch (error) {
            setError('음성 인식을 중지할 수 없습니다.');
        }
    };

    const clearText = () => {
        setInterimText('');
        setFinalText('');
        setConfidence(0);
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!isSupported) {
        return (
            <div className="voice-recognition-error">
                <div className="error-icon">🎤</div>
                <p>이 브라우저는 음성 인식을 지원하지 않습니다.</p>
                <p>Chrome, Edge, Safari 최신 버전을 사용해주세요.</p>
            </div>
        );
    }

    return (
        <div className="voice-recognition-system">
            <div className="voice-controls">
                <button
                    className={`voice-button ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!isSupported}
                >
                    <div className="button-content">
                        <span className="button-icon">
                            {isRecording ? '⏹️' : '🎤'}
                        </span>
                        <span className="button-text">
                            {isRecording ? '음성 인식 중지' : '음성 인식 시작'}
                        </span>
                    </div>
                </button>

                {isRecording && (
                    <div className="recording-indicator">
                        <div className="pulse-dot"></div>
                        <span className="recording-text">음성 인식 중...</span>
                        <span className="recording-time">{formatTime(recordingTime)}</span>
                    </div>
                )}

                {finalText && (
                    <button className="clear-button" onClick={clearText}>
                        🗑️ 텍스트 지우기
                    </button>
                )}
            </div>

            {error && (
                <div className="voice-error">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{error}</span>
                </div>
            )}

            <div className="voice-results">
                {finalText && (
                    <div className="final-result">
                        <h4>최종 결과</h4>
                        <div className="result-content">
                            <p>{finalText}</p>
                            {confidence > 0 && (
                                <div className="confidence-bar">
                                    <span>신뢰도: {Math.round(confidence * 100)}%</span>
                                    <div className="confidence-fill" style={{ width: `${confidence * 100}%` }}></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {interimText && (
                    <div className="interim-result">
                        <h4>인식 중...</h4>
                        <div className="result-content">
                            <p className="interim-text">{interimText}</p>
                        </div>
                    </div>
                )}

                {!finalText && !interimText && (
                    <div className="voice-placeholder">
                        <div className="placeholder-icon">🎤</div>
                        <p>음성 인식을 시작하면 여기에 텍스트가 표시됩니다.</p>
                        <p className="placeholder-hint">
                            명확하고 천천히 말씀해주세요.
                        </p>
                    </div>
                )}
            </div>

            <div className="voice-tips">
                <h4>음성 인식 팁</h4>
                <ul>
                    <li>조용한 환경에서 사용하세요</li>
                    <li>마이크에 가깝게 말씀하세요</li>
                    <li>명확하고 천천히 발음하세요</li>
                    <li>문장 단위로 말씀하세요</li>
                </ul>
            </div>
        </div>
    );
};

export default VoiceRecognitionSystem;
