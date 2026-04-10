import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { voiceService, VoiceRecognitionResult } from '../../services/voiceService';
import { coerceTrimmedString } from '../../utils/chatInputUtils';
import { CHART_COLORS_HEX } from '../../styles/themeColors';

interface VoiceRecognitionProps {
    onTranscript: (text: string) => void;
    onError: (error: string) => void;
    autoSend?: boolean;
    showSettings?: boolean;
}

const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
    onTranscript,
    onError,
    autoSend = false,
    showSettings = false
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const [voiceConfig, setVoiceConfig] = useState({
        language: 'ko-KR',
        rate: 1.0,
        pitch: 1.0,
        autoSpeak: false
    });

    const _waveformRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        // 오디오 컨텍스트 초기화 (시각적 피드백용)
        if (typeof window !== 'undefined' && window.AudioContext) {
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
        }

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const startListening = () => {
        setTranscript('');
        setConfidence(0);

        const success = voiceService.startListening(
            (result: VoiceRecognitionResult) => {
                setTranscript(result.transcript);
                setConfidence(result.confidence);

                const finalText = coerceTrimmedString(result.transcript, '');
                if (result.isFinal && autoSend && finalText) {
                    onTranscript(finalText);
                    setTranscript('');
                }
            },
            (error: string) => {
                setIsListening(false);
                onError(error);
            },
            () => {
                setIsListening(false);
            }
        );

        if (success) {
            setIsListening(true);
        }
    };

    const stopListening = () => {
        voiceService.stopListening();
        setIsListening(false);

        const t = coerceTrimmedString(transcript, '');
        if (t && !autoSend) {
            onTranscript(t);
            setTranscript('');
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const _speakText = (text: string) => {
        if (!voiceConfig.autoSpeak) return;

        voiceService.speak(
            text,
            voiceConfig,
            () => setIsSpeaking(true),
            () => setIsSpeaking(false),
            (error) => onError(error)
        );
    };

    const stopSpeaking = () => {
        voiceService.stopSpeaking();
        setIsSpeaking(false);
    };

    const getConfidenceColor = (conf: number) => {
        if (conf > 0.8) return 'bw-text-success';
        if (conf > 0.6) return 'bw-text-warning';
        return 'bw-text-error';
    };

    const getConfidenceText = (conf: number) => {
        if (conf > 0.8) return '매우 정확';
        if (conf > 0.6) return '정확';
        if (conf > 0.4) return '보통';
        return '부정확';
    };

    return (
        <div className="relative">
            {/* 음성 인식 버튼 */}
            <div className="flex items-center space-x-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleListening}
                    className={`p-3 rounded-full transition-all duration-300 ${isListening ? 'bw-btn-danger shadow-lg' : 'bw-btn-primary'}`}
                    style={isListening ? { boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' } : undefined}
                >
                    <AnimatePresence mode="wait">
                        {isListening ? (
                            <motion.div
                                key="listening"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="relative"
                            >
                                <MicOff size={20} />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full opacity-50"
                                    style={{ backgroundColor: 'var(--accent-error)' }}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="not-listening"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Mic size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* 음성 합성 토글 */}
                {voiceConfig.autoSpeak && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopSpeaking}
                        className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bw-btn-primary' : 'bw-btn-secondary'}`}
                        style={isSpeaking ? { background: 'var(--accent-orange)', borderColor: 'var(--accent-orange)' } : undefined}
                    >
                        {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </motion.button>
                )}

                {/* 설정 버튼 */}
                {showSettings && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                        className="bw-btn-secondary p-2 rounded-full"
                    >
                        <Settings size={16} />
                    </motion.button>
                )}
            </div>

            {/* 음성 인식 결과 */}
            <AnimatePresence>
                {transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 p-3 bw-card-secondary border border-[var(--accent-info-border)]"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium bw-text-primary">음성 인식 결과</span>
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs ${getConfidenceColor(confidence)}`}>
                                    {getConfidenceText(confidence)}
                                </span>
                                <div className="w-16 h-1 bw-progress-bar overflow-hidden rounded-full">
                                    <motion.div
                                        className="h-full bw-progress-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confidence * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-sm bw-text-primary">{transcript}</p>

                        {!autoSend && (
                            <div className="flex items-center space-x-2 mt-2">
                                <button
                                    onClick={() => {
                                        onTranscript(coerceTrimmedString(transcript, ''));
                                        setTranscript('');
                                    }}
                                    className="bw-btn-primary text-xs py-1 px-3"
                                >
                                    전송
                                </button>
                                <button
                                    onClick={() => setTranscript('')}
                                    className="bw-btn-secondary text-xs py-1 px-3"
                                >
                                    취소
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 음성 설정 모달 */}
            <AnimatePresence>
                {showVoiceSettings && showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bw-modal-overlay"
                        onClick={() => setShowVoiceSettings(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bw-modal-panel w-full max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="bw-card-title">음성 설정</h3>

                            <div className="space-y-4">
                                {/* 언어 설정 */}
                                <div>
                                    <label className="bw-label">
                                        언어
                                    </label>
                                    <select
                                        value={voiceConfig.language}
                                        onChange={(e) => setVoiceConfig(prev => ({ ...prev, language: e.target.value }))}
                                        className="bw-input"
                                    >
                                        <option value="ko-KR">한국어</option>
                                        <option value="en-US">영어 (미국)</option>
                                        <option value="ja-JP">일본어</option>
                                        <option value="zh-CN">중국어 (간체)</option>
                                    </select>
                                </div>

                                {/* 속도 설정 */}
                                <div>
                                    <label className="bw-label">
                                        음성 속도: {voiceConfig.rate}x
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={voiceConfig.rate}
                                        onChange={(e) => setVoiceConfig(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                                        className="w-full"
                                    />
                                </div>

                                {/* 피치 설정 */}
                                <div>
                                    <label className="bw-label">
                                        음성 피치: {voiceConfig.pitch}
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={voiceConfig.pitch}
                                        onChange={(e) => setVoiceConfig(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                                        className="w-full"
                                    />
                                </div>

                                {/* 자동 음성 합성 */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="autoSpeak"
                                        checked={voiceConfig.autoSpeak}
                                        onChange={(e) => setVoiceConfig(prev => ({ ...prev, autoSpeak: e.target.checked }))}
                                        className="rounded border-[var(--border-color)] text-[var(--accent-info)] focus:ring-2 focus:ring-[var(--accent-info-muted)]"
                                    />
                                    <label htmlFor="autoSpeak" className="text-sm bw-text-primary">
                                        AI 응답을 자동으로 음성으로 읽기
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    onClick={() => setShowVoiceSettings(false)}
                                    className="bw-btn-secondary"
                                >
                                    닫기
                                </button>
                                <button
                                    onClick={() => {
                                        setShowVoiceSettings(false);
                                    }}
                                    className="bw-btn-primary"
                                >
                                    저장
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 음성 파형 시각화 */}
            {isListening && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center space-x-1"
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: [4, 20, 4],
                                backgroundColor: [CHART_COLORS_HEX[0], CHART_COLORS_HEX[3], CHART_COLORS_HEX[0]]
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1
                            }}
                            className="w-1 rounded-full"
                            style={{ backgroundColor: 'var(--accent-info)' }}
                        />
                    ))}
                    <span className="text-xs bw-text-muted ml-2">듣는 중...</span>
                </motion.div>
            )}
        </div>
    );
};

export default VoiceRecognition;
