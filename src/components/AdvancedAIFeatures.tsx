import React, { useState, useRef, useEffect } from 'react';

interface AdvancedAIFeaturesProps {
    onVoiceInput: (text: string) => void;
    onImageAnalysis: (imageData: string) => void;
    onTranslation: (text: string, targetLang: string) => void;
    onSentimentAnalysis: (text: string) => void;
}

const AdvancedAIFeatures: React.FC<AdvancedAIFeaturesProps> = ({
    onVoiceInput,
    onImageAnalysis,
    onTranslation,
    onSentimentAnalysis
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [voiceText, setVoiceText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // 음성 인식 초기화
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'ko-KR';

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                setVoiceText(finalTranscript);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognition.onerror = (event: any) => {
                console.error('음성 인식 오류:', event.error);
                setIsRecording(false);
            };

            return () => {
                recognition.abort();
            };
        }
    }, [onVoiceInput]);

    // 음성 녹음 시작
    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                // 여기서 오디오를 텍스트로 변환하는 API 호출
                console.log('음성 녹음 완료:', audioUrl);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('음성 녹음 오류:', error);
        }
    };

    // 음성 녹음 중지
    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    // 이미지 분석
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target?.result as string;
                onImageAnalysis(imageData);
            };
            reader.readAsDataURL(file);
        }
    };

    // 번역 기능
    const handleTranslation = (text: string) => {
        if (text.trim()) {
            setIsProcessing(true);
            // 실제 번역 API 호출 시뮬레이션
            setTimeout(() => {
                onTranslation(text, selectedLanguage);
                setIsProcessing(false);
            }, 1000);
        }
    };

    // 감정 분석
    const handleSentimentAnalysis = (text: string) => {
        if (text.trim()) {
            setIsProcessing(true);
            // 실제 감정 분석 API 호출 시뮬레이션
            setTimeout(() => {
                onSentimentAnalysis(text);
                setIsProcessing(false);
            }, 1000);
        }
    };

    return (
        <div className="advanced-ai-features">
            {/* 음성 인식 */}
            <div className="feature-section">
                <h3>🎤 음성 인식</h3>
                <div className="voice-controls">
                    <button
                        className={`voice-btn ${isRecording ? 'recording' : ''}`}
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        disabled={isProcessing}
                    >
                        {isRecording ? '⏹️ 녹음 중지' : '🎤 음성 시작'}
                    </button>
                    {voiceText && (
                        <div className="voice-text">
                            <p>인식된 텍스트: {voiceText}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 이미지 분석 */}
            <div className="feature-section">
                <h3>🖼️ 이미지 분석</h3>
                <div className="image-upload">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        className="upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                    >
                        📁 이미지 업로드
                    </button>
                </div>
            </div>

            {/* 번역 기능 */}
            <div className="feature-section">
                <h3>🌍 번역</h3>
                <div className="translation-controls">
                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="language-select"
                    >
                        <option value="en">영어</option>
                        <option value="ja">일본어</option>
                        <option value="zh">중국어</option>
                        <option value="es">스페인어</option>
                        <option value="fr">프랑스어</option>
                        <option value="de">독일어</option>
                    </select>
                    <button
                        className="translate-btn"
                        onClick={() => handleTranslation(voiceText)}
                        disabled={!voiceText || isProcessing}
                    >
                        {isProcessing ? '번역 중...' : '번역하기'}
                    </button>
                </div>
            </div>

            {/* 감정 분석 */}
            <div className="feature-section">
                <h3>😊 감정 분석</h3>
                <div className="sentiment-controls">
                    <button
                        className="sentiment-btn"
                        onClick={() => handleSentimentAnalysis(voiceText)}
                        disabled={!voiceText || isProcessing}
                    >
                        {isProcessing ? '분석 중...' : '감정 분석'}
                    </button>
                </div>
            </div>

            {/* 처리 상태 */}
            {isProcessing && (
                <div className="processing-status">
                    <div className="loading-spinner"></div>
                    <span className="loading-text">AI가 처리 중입니다...</span>
                </div>
            )}
        </div>
    );
};

export default AdvancedAIFeatures;
