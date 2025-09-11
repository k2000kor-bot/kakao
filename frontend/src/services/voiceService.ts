// 음성 인식 및 합성 서비스
export interface VoiceConfig {
    language: string;
    voice: string;
    rate: number;
    pitch: number;
}

export interface VoiceRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
    timestamp: number;
}

class VoiceService {
    private recognition: any;
    private synthesis: SpeechSynthesis;
    private isListening: boolean = false;
    private isSpeaking: boolean = false;
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    constructor() {
        this.synthesis = window.speechSynthesis;
        this.initializeRecognition();
    }

    private initializeRecognition() {
        // Web Speech API 지원 확인
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('음성 인식이 지원되지 않는 브라우저입니다.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // 음성 인식 설정
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ko-KR';
        this.recognition.maxAlternatives = 1;
    }

    // 음성 인식 시작
    startListening(
        onResult: (result: VoiceRecognitionResult) => void,
        onError: (error: string) => void,
        onEnd: () => void
    ): boolean {
        if (!this.recognition) {
            onError('음성 인식이 지원되지 않습니다.');
            return false;
        }

        if (this.isListening) {
            return false;
        }

        this.isListening = true;

        this.recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }

                onResult({
                    transcript: finalTranscript || interimTranscript,
                    confidence: confidence || 0,
                    isFinal: event.results[i].isFinal,
                    timestamp: Date.now()
                });
            }
        };

        this.recognition.onerror = (event: any) => {
            this.isListening = false;
            let errorMessage = '음성 인식 중 오류가 발생했습니다.';

            switch (event.error) {
                case 'no-speech':
                    errorMessage = '음성이 감지되지 않았습니다.';
                    break;
                case 'audio-capture':
                    errorMessage = '마이크에 접근할 수 없습니다.';
                    break;
                case 'not-allowed':
                    errorMessage = '마이크 사용 권한이 필요합니다.';
                    break;
                case 'network':
                    errorMessage = '네트워크 오류가 발생했습니다.';
                    break;
            }

            onError(errorMessage);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            onEnd();
        };

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            this.isListening = false;
            onError('음성 인식을 시작할 수 없습니다.');
            return false;
        }
    }

    // 음성 인식 중지
    stopListening(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    // 음성 합성 (TTS)
    speak(
        text: string,
        config: Partial<VoiceConfig> = {},
        onStart?: () => void,
        onEnd?: () => void,
        onError?: (error: string) => void
    ): boolean {
        if (!this.synthesis) {
            onError?.('음성 합성이 지원되지 않습니다.');
            return false;
        }

        if (this.isSpeaking) {
            this.stopSpeaking();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // 음성 설정
        utterance.lang = config.language || 'ko-KR';
        utterance.rate = config.rate || 1.0;
        utterance.pitch = config.pitch || 1.0;

        // 사용 가능한 음성 중에서 선택
        const voices = this.synthesis.getVoices();
        const koreanVoice = voices.find(voice =>
            voice.lang.includes('ko') || voice.lang.includes('KR')
        );

        if (koreanVoice) {
            utterance.voice = koreanVoice;
        }

        // 이벤트 핸들러
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.currentUtterance = utterance;
            onStart?.();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            onEnd?.();
        };

        utterance.onerror = (event) => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            onError?.(`음성 합성 오류: ${event.error}`);
        };

        try {
            this.synthesis.speak(utterance);
            return true;
        } catch (error) {
            onError?.('음성 합성을 시작할 수 없습니다.');
            return false;
        }
    }

    // 음성 합성 중지
    stopSpeaking(): void {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        }
    }

    // 음성 합성 일시정지/재개
    pauseSpeaking(): void {
        if (this.synthesis) {
            this.synthesis.pause();
        }
    }

    resumeSpeaking(): void {
        if (this.synthesis) {
            this.synthesis.resume();
        }
    }

    // 사용 가능한 음성 목록 가져오기
    getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.synthesis?.getVoices() || [];
    }

    // 한국어 음성 목록 가져오기
    getKoreanVoices(): SpeechSynthesisVoice[] {
        const voices = this.getAvailableVoices();
        return voices.filter(voice =>
            voice.lang.includes('ko') || voice.lang.includes('KR')
        );
    }

    // 음성 인식 상태 확인
    isListeningNow(): boolean {
        return this.isListening;
    }

    // 음성 합성 상태 확인
    isSpeakingNow(): boolean {
        return this.isSpeaking;
    }

    // 음성 설정 업데이트
    updateRecognitionLanguage(language: string): void {
        if (this.recognition) {
            this.recognition.lang = language;
        }
    }

    // 음성 인식 정확도 향상을 위한 노이즈 제거
    enableNoiseReduction(): void {
        if (this.recognition) {
            // 고급 설정 (브라우저 지원에 따라)
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
        }
    }

    // 음성 명령 인식 (키워드 기반)
    startKeywordRecognition(
        keywords: string[],
        onKeywordDetected: (keyword: string) => void
    ): void {
        if (!this.recognition) return;

        this.recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();

            for (const keyword of keywords) {
                if (transcript.includes(keyword.toLowerCase())) {
                    onKeywordDetected(keyword);
                    break;
                }
            }
        };
    }
}

export const voiceService = new VoiceService();
export default voiceService;
