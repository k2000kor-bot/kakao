import React, { useState, useEffect, useCallback, useRef } from 'react';
import { speechRecognitionService, SpeechRecognitionResult } from '../services/speechRecognitionService';
import { textToSpeechService, TTSConfig } from '../services/textToSpeechService';
import './VoiceChat.css';

interface VoiceChatProps {
    onVoiceMessage?: (message: string) => void;
    onVoiceCommand?: (command: string) => void;
    autoTTS?: boolean;
    language?: string;
    voiceProfile?: string;
    className?: string;
}

interface VoiceSession {
    id: string;
    startTime: number;
    transcript: string;
    confidence: number;
    isActive: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
    onVoiceMessage,
    onVoiceCommand,
    autoTTS = true,
    language = 'ko-KR',
    voiceProfile = 'professional',
    className = ''
}) => {
    // 상태 관리
    const [isListening, setIsListening] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [isSupported, setIsSupported] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceActivity, setVoiceActivity] = useState({ isActive: false, volume: 0 });
    const [sessions, setSessions] = useState<VoiceSession[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState({
        language: language,
        voiceProfile: voiceProfile,
        autoTTS: autoTTS,
        noiseSuppressionEnabled: true,
        echoCancellationEnabled: true,
        continuousListening: false
    });

    // refs
    const visualizerRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const sessionIdRef = useRef<string>('');

    /**
     * 컴포넌트 초기화
     */
    useEffect(() => {
        initializeVoiceServices();

        return () => {
            cleanup();
        };
    }, []);

    /**
     * 언어 설정 변경 감지
     */
    useEffect(() => {
        speechRecognitionService.setLanguage(settings.language);
    }, [settings.language]);

    /**
     * TTS 프로필 변경 감지
     */
    useEffect(() => {
        textToSpeechService.setVoiceProfile(settings.voiceProfile);
    }, [settings.voiceProfile]);

    /**
     * 음성 서비스 초기화
     */
    const initializeVoiceServices = async () => {
        // 지원 여부 확인
        const speechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        const ttsSupported = 'speechSynthesis' in window;
        setIsSupported(speechSupported && ttsSupported);

        if (!speechSupported) {
            setError('음성 인식이 지원되지 않는 브라우저입니다.');
            return;
        }

        if (!ttsSupported) {
            setError('음성 합성이 지원되지 않는 브라우저입니다.');
            return;
        }

        // 마이크 권한 확인
        const hasPermission = await speechRecognitionService.checkMicrophonePermission();
        if (!hasPermission) {
            setError('마이크 권한이 필요합니다.');
            return;
        }

        // TTS 이벤트 설정
        textToSpeechService.setEventListeners({
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: (error) => setError(error)
        });

        console.log('🎙️ 음성 채팅 시스템이 초기화되었습니다.');
    };

    /**
     * 정리 작업
     */
    const cleanup = () => {
        if (isListening) {
            speechRecognitionService.stopListening();
        }

        if (isSpeaking) {
            textToSpeechService.stop();
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    /**
     * 음성 인식 시작
     */
    const startListening = useCallback(async () => {
        if (!isSupported || isListening) return;

        setError(null);
        sessionIdRef.current = generateSessionId();

        const success = await speechRecognitionService.startListening({
            onStart: () => {
                setIsListening(true);
                startVisualization();

                const newSession: VoiceSession = {
                    id: sessionIdRef.current,
                    startTime: Date.now(),
                    transcript: '',
                    confidence: 0,
                    isActive: true
                };

                setSessions(prev => [...prev, newSession]);
            },

            onResult: (result: SpeechRecognitionResult) => {
                setCurrentTranscript(result.transcript);
                setConfidence(result.confidence);

                // 세션 업데이트
                setSessions(prev => prev.map(session =>
                    session.id === sessionIdRef.current
                        ? { ...session, transcript: result.transcript, confidence: result.confidence }
                        : session
                ));

                // 최종 결과 처리
                if (result.isFinal) {
                    handleFinalTranscript(result.transcript);
                }
            },

            onVoiceActivity: (activity) => {
                setVoiceActivity(activity);
            },

            onError: (error) => {
                setError(error);
                setIsListening(false);
                stopVisualization();
            },

            onEnd: () => {
                setIsListening(false);
                stopVisualization();

                // 세션 종료
                setSessions(prev => prev.map(session =>
                    session.id === sessionIdRef.current
                        ? { ...session, isActive: false }
                        : session
                ));
            },

            onNoSpeech: () => {
                if (settings.autoTTS) {
                    speakText('음성이 감지되지 않았습니다. 다시 말씀해 주세요.');
                }
            }
        });

        if (!success) {
            setError('음성 인식을 시작할 수 없습니다.');
        }
    }, [isSupported, isListening, settings.autoTTS]);

    /**
     * 음성 인식 중지
     */
    const stopListening = useCallback(() => {
        speechRecognitionService.stopListening();
    }, []);

    /**
     * 최종 음성 인식 결과 처리
     */
    const handleFinalTranscript = (transcript: string) => {
        const cleanTranscript = transcript.trim();

        if (!cleanTranscript) return;

        // 음성 명령어 확인
        if (isVoiceCommand(cleanTranscript)) {
            onVoiceCommand?.(cleanTranscript);

            if (settings.autoTTS) {
                speakText('명령을 실행하겠습니다.');
            }
        } else {
            // 일반 메시지
            onVoiceMessage?.(cleanTranscript);

            if (settings.autoTTS) {
                speakText('메시지를 받았습니다.');
            }
        }

        // 연속 듣기 모드가 아니면 중지
        if (!settings.continuousListening) {
            setTimeout(() => {
                stopListening();
            }, 1000);
        }
    };

    /**
     * 음성 명령어 여부 확인
     */
    const isVoiceCommand = (text: string): boolean => {
        const commands = [
            '차트', '그래프', '시각화', '데이터',
            '파일', '업로드', '첨부',
            '설정', '환경설정',
            '멈춰', '정지', '중지',
            '도움말', '헬프',
            '새로고침', '다시 시작'
        ];

        return commands.some(command => text.toLowerCase().includes(command));
    };

    /**
     * 텍스트 음성 변환
     */
    const speakText = useCallback(async (text: string, immediate = false) => {
        if (!isSupported || !settings.autoTTS) return;

        try {
            await textToSpeechService.speak(text, {
                immediate,
                type: 'system',
                priority: immediate ? 'urgent' : 'normal'
            });
        } catch (error) {
            console.error('TTS 오류:', error);
        }
    }, [isSupported, settings.autoTTS]);

    /**
     * 시각화 시작
     */
    const startVisualization = () => {
        if (!visualizerRef.current) return;

        const canvas = visualizerRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const { volume, isActive } = voiceActivity;

            // 캔버스 클리어
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 배경
            ctx.fillStyle = isActive ? '#3B82F6' : '#E5E7EB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 음성 활동 시각화
            if (isActive) {
                const barHeight = Math.max(2, volume * canvas.height);
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#10B981');
                gradient.addColorStop(1, '#3B82F6');

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    (canvas.width - barHeight / 2) / 2,
                    (canvas.height - barHeight) / 2,
                    barHeight / 2,
                    barHeight
                );
            }

            // 맥박 효과
            if (isListening) {
                const time = Date.now() * 0.005;
                const pulse = Math.sin(time) * 0.5 + 0.5;

                ctx.strokeStyle = `rgba(59, 130, 246, ${pulse})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, 20 + pulse * 10, 0, Math.PI * 2);
                ctx.stroke();
            }

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
    };

    /**
     * 시각화 중지
     */
    const stopVisualization = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    /**
     * 세션 ID 생성
     */
    const generateSessionId = (): string => {
        return `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    /**
     * 설정 변경 핸들러
     */
    const handleSettingChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    /**
     * TTS 중지
     */
    const stopSpeaking = () => {
        textToSpeechService.stop();
    };

    return (
        <div className={`voice-chat ${className}`}>
            {/* 헤더 */}
            <div className="voice-chat-header">
                <h3>🎙️ 음성 채팅</h3>
                <div className="voice-status">
                    {isListening && <span className="status-indicator listening">듣는 중</span>}
                    {isSpeaking && <span className="status-indicator speaking">말하는 중</span>}
                    {!isSupported && <span className="status-indicator error">지원 안됨</span>}
                </div>
            </div>

            {/* 오류 표시 */}
            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="error-close">×</button>
                </div>
            )}

            {/* 메인 컨트롤 */}
            <div className="voice-controls">
                {/* 음성 시각화 */}
                <div className="voice-visualizer">
                    <canvas
                        ref={visualizerRef}
                        width={200}
                        height={100}
                        className="visualizer-canvas"
                    />
                    {currentTranscript && (
                        <div className="current-transcript">
                            <p>"{currentTranscript}"</p>
                            <div className="confidence-bar">
                                <div
                                    className="confidence-fill"
                                    style={{ width: `${confidence * 100}%` }}
                                />
                            </div>
                            <span className="confidence-text">신뢰도: {Math.round(confidence * 100)}%</span>
                        </div>
                    )}
                </div>

                {/* 제어 버튼 */}
                <div className="control-buttons">
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`voice-button ${isListening ? 'listening' : ''}`}
                        disabled={!isSupported}
                        title={isListening ? '음성 인식 중지' : '음성 인식 시작'}
                    >
                        {isListening ? '🛑' : '🎙️'}
                        <span>{isListening ? '중지' : '시작'}</span>
                    </button>

                    {isSpeaking && (
                        <button
                            onClick={stopSpeaking}
                            className="stop-speaking-button"
                            title="음성 재생 중지"
                        >
                            🔇
                            <span>음성 중지</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 설정 패널 */}
            <div className="voice-settings">
                <details>
                    <summary>음성 설정</summary>

                    <div className="setting-group">
                        <label htmlFor="language-select">언어:</label>
                        <select
                            id="language-select"
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                        >
                            <option value="ko-KR">한국어</option>
                            <option value="en-US">English (US)</option>
                            <option value="ja-JP">日本語</option>
                            <option value="zh-CN">中文 (简体)</option>
                        </select>
                    </div>

                    <div className="setting-group">
                        <label htmlFor="voice-profile-select">음성 프로필:</label>
                        <select
                            id="voice-profile-select"
                            value={settings.voiceProfile}
                            onChange={(e) => handleSettingChange('voiceProfile', e.target.value)}
                        >
                            <option value="professional">전문가</option>
                            <option value="friendly">친근한</option>
                            <option value="calm">차분한</option>
                            <option value="default">기본</option>
                        </select>
                    </div>

                    <div className="setting-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.autoTTS}
                                onChange={(e) => handleSettingChange('autoTTS', e.target.checked)}
                            />
                            자동 음성 응답
                        </label>
                    </div>

                    <div className="setting-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.continuousListening}
                                onChange={(e) => handleSettingChange('continuousListening', e.target.checked)}
                            />
                            연속 듣기 모드
                        </label>
                    </div>

                    <div className="setting-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.noiseSuppressionEnabled}
                                onChange={(e) => handleSettingChange('noiseSuppressionEnabled', e.target.checked)}
                            />
                            노이즈 제거
                        </label>
                    </div>
                </details>
            </div>

            {/* 음성 세션 히스토리 */}
            {sessions.length > 0 && (
                <div className="voice-sessions">
                    <h4>음성 세션 기록</h4>
                    <div className="sessions-list">
                        {sessions.slice(-5).map((session) => (
                            <div key={session.id} className={`session-item ${session.isActive ? 'active' : ''}`}>
                                <div className="session-time">
                                    {new Date(session.startTime).toLocaleTimeString()}
                                </div>
                                <div className="session-transcript">
                                    {session.transcript || '(대기 중...)'}
                                </div>
                                <div className="session-confidence">
                                    {session.confidence > 0 && `${Math.round(session.confidence * 100)}%`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceChat;
