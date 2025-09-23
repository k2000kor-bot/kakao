import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Typography,
    Paper,
    Chip
} from '@mui/material';
import {
    Mic as MicIcon,
    MicOff as MicOffIcon,
    VolumeUp as VolumeUpIcon,
    VolumeOff as VolumeOffIcon,
    Stop as StopIcon
} from '@mui/icons-material';

interface VoiceInterfaceProps {
    onTranscript: (text: string) => void;
    onPlayResponse?: (text: string) => void;
    disabled?: boolean;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
    onTranscript, 
    onPlayResponse, 
    disabled = false 
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        // 브라우저 지원 확인
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            initializeSpeechRecognition();
        } else {
            setError('이 브라우저는 음성 인식을 지원하지 않습니다.');
        }

        // 음성 합성 지원 확인
        if ('speechSynthesis' in window) {
            // 음성 합성은 대부분의 브라우저에서 지원됨
        } else {
            console.warn('음성 합성을 지원하지 않는 브라우저입니다.');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthesisRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const initializeSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'ko-KR';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscript || interimTranscript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setError(`음성 인식 오류: ${event.error}`);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (transcript.trim()) {
                    onTranscript(transcript.trim());
                    setTranscript('');
                }
            };
        }
    };

    const startListening = () => {
        if (!isSupported || disabled) return;
        
        try {
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
        } catch (err) {
            console.error('음성 인식 시작 오류:', err);
            setError('음성 인식을 시작할 수 없습니다.');
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const speakText = (text: string) => {
        if (!text.trim() || disabled) return;

        try {
            // 기존 음성 합성 중지
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;

            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
                console.error('음성 합성 오류:', event.error);
                setIsSpeaking(false);
            };

            synthesisRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error('음성 합성 오류:', err);
            setError('음성을 재생할 수 없습니다.');
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleSpeakerClick = () => {
        if (isSpeaking) {
            stopSpeaking();
        } else {
            // 마지막 응답을 다시 재생
            if (onPlayResponse) {
                onPlayResponse('');
            }
        }
    };

    if (!isSupported) {
        return (
            <Alert severity="warning" sx={{ mb: 2 }}>
                이 브라우저는 음성 인식을 지원하지 않습니다.
                Chrome, Edge, Safari 최신 버전을 사용해주세요.
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {/* 음성 인식 버튼 */}
            <Tooltip title={isListening ? "음성 인식 중지" : "음성으로 질문하기"}>
                <IconButton
                    onClick={handleMicClick}
                    disabled={disabled}
                    sx={{
                        bgcolor: isListening ? '#f44336' : '#667eea',
                        color: 'white',
                        '&:hover': { 
                            bgcolor: isListening ? '#d32f2f' : '#5a6fd8' 
                        },
                        '&:disabled': { 
                            bgcolor: '#e0e0e0', 
                            color: '#9e9e9e' 
                        }
                    }}
                >
                    {isListening ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        <MicIcon />
                    )}
                </IconButton>
            </Tooltip>

            {/* 음성 합성 버튼 */}
            <Tooltip title={isSpeaking ? "음성 재생 중지" : "응답 음성으로 듣기"}>
                <IconButton
                    onClick={handleSpeakerClick}
                    disabled={disabled}
                    sx={{
                        bgcolor: isSpeaking ? '#4caf50' : '#667eea',
                        color: 'white',
                        '&:hover': { 
                            bgcolor: isSpeaking ? '#388e3c' : '#5a6fd8' 
                        },
                        '&:disabled': { 
                            bgcolor: '#e0e0e0', 
                            color: '#9e9e9e' 
                        }
                    }}
                >
                    {isSpeaking ? (
                        <StopIcon />
                    ) : (
                        <VolumeUpIcon />
                    )}
                </IconButton>
            </Tooltip>

            {/* 음성 인식 상태 표시 */}
            {isListening && (
                <Paper elevation={2} sx={{ p: 1, bgcolor: '#fff3e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="caption" color="text.secondary">
                            듣고 있습니다...
                        </Typography>
                    </Box>
                </Paper>
            )}

            {/* 음성 합성 상태 표시 */}
            {isSpeaking && (
                <Paper elevation={2} sx={{ p: 1, bgcolor: '#e8f5e8' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VolumeUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                        <Typography variant="caption" color="text.secondary">
                            음성으로 응답 중...
                        </Typography>
                    </Box>
                </Paper>
            )}

            {/* 실시간 전사 텍스트 */}
            {transcript && (
                <Paper elevation={2} sx={{ p: 1, bgcolor: '#f5f5f5', flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        "{transcript}"
                    </Typography>
                </Paper>
            )}

            {/* 오류 메시지 */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ flex: 1 }}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}
        </Box>
    );
};

// TypeScript 타입 정의
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
        speechSynthesis: SpeechSynthesis;
    }
}

export default VoiceInterface;
