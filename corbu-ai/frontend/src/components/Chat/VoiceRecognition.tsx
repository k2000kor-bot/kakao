import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { voiceService, VoiceRecognitionResult } from '../../services/voiceService';

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

    const waveformRef = useRef<HTMLDivElement>(null);
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

                if (result.isFinal && autoSend && result.transcript.trim()) {
                    onTranscript(result.transcript.trim());
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

        if (transcript.trim() && !autoSend) {
            onTranscript(transcript.trim());
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

    const speakText = (text: string) => {
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
        if (conf > 0.8) return 'text-green-500';
        if (conf > 0.6) return 'text-yellow-500';
        return 'text-red-500';
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
                    className={`p-3 rounded-full transition-all duration-300 ${isListening
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
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
                                    className="absolute inset-0 rounded-full bg-red-400 opacity-50"
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
                        className={`p-2 rounded-full transition-colors ${isSpeaking
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
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
                        className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
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
                        className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">음성 인식 결과</span>
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs ${getConfidenceColor(confidence)}`}>
                                    {getConfidenceText(confidence)}
                                </span>
                                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-green-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confidence * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-blue-800">{transcript}</p>

                        {!autoSend && (
                            <div className="flex items-center space-x-2 mt-2">
                                <button
                                    onClick={() => {
                                        onTranscript(transcript.trim());
                                        setTranscript('');
                                    }}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                >
                                    전송
                                </button>
                                <button
                                    onClick={() => setTranscript('')}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
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
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setShowVoiceSettings(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">음성 설정</h3>

                            <div className="space-y-4">
                                {/* 언어 설정 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        언어
                                    </label>
                                    <select
                                        value={voiceConfig.language}
                                        onChange={(e) => setVoiceConfig(prev => ({ ...prev, language: e.target.value }))}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="ko-KR">한국어</option>
                                        <option value="en-US">영어 (미국)</option>
                                        <option value="ja-JP">일본어</option>
                                        <option value="zh-CN">중국어 (간체)</option>
                                    </select>
                                </div>

                                {/* 속도 설정 */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="autoSpeak" className="text-sm text-gray-700">
                                        AI 응답을 자동으로 음성으로 읽기
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    onClick={() => setShowVoiceSettings(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    닫기
                                </button>
                                <button
                                    onClick={() => {
                                        // 설정 저장 로직
                                        setShowVoiceSettings(false);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                                backgroundColor: ['#3B82F6', '#EF4444', '#3B82F6']
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1
                            }}
                            className="w-1 bg-blue-500 rounded-full"
                        />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">듣는 중...</span>
                </motion.div>
            )}
        </div>
    );
};

export default VoiceRecognition;
