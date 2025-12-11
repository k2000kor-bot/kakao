/**
 * CORBU AI 고급 음성 인식 서비스
 * Web Speech API를 활용한 실시간 음성-텍스트 변환
 */

import { errorLogger } from '../utils/errorLogger';

export interface SpeechRecognitionConfig {
    language: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    noiseSuppressionEnabled: boolean;
    echoCancellationEnabled: boolean;
}

export interface SpeechRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
    alternatives?: Array<{
        transcript: string;
        confidence: number;
    }>;
    timestamp: number;
}

export interface VoiceActivityDetection {
    isActive: boolean;
    volume: number;
    duration: number;
}

export interface SpeechRecognitionEvents {
    onStart?: () => void;
    onResult?: (result: SpeechRecognitionResult) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
    onVoiceActivity?: (activity: VoiceActivityDetection) => void;
    onNoSpeech?: () => void;
}

// 웹 브라우저 타입 정의는 speechRecognition.ts에서 처리

export class SpeechRecognitionService {
    private recognition: any = null;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private isListening: boolean = false;
    private isSupported: boolean = false;
    private config: SpeechRecognitionConfig;
    private events: SpeechRecognitionEvents = {};
    private voiceActivityTimer: NodeJS.Timeout | null = null;
    private silenceTimer: NodeJS.Timeout | null = null;
    private mediaStream: MediaStream | null = null;

    constructor() {
        this.config = {
            language: 'ko-KR',
            continuous: true,
            interimResults: true,
            maxAlternatives: 3,
            noiseSuppressionEnabled: true,
            echoCancellationEnabled: true
        };

        this.initializeSpeechRecognition();
    }

    /**
     * Web Speech API 초기화
     */
    private initializeSpeechRecognition(): void {
        // 브라우저 지원 확인
        const SpeechRecognition = (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            errorLogger.warn('Web Speech API가 지원되지 않는 브라우저입니다.', {
                component: 'SpeechRecognitionService',
                action: 'initializeSpeechRecognition',
            });
            this.isSupported = false;
            return;
        }

        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.setupRecognitionConfig();
        this.setupRecognitionEvents();
    }

    /**
     * 음성 인식 설정 구성
     */
    private setupRecognitionConfig(): void {
        if (!this.recognition) return;

        this.recognition.lang = this.config.language;
        this.recognition.continuous = this.config.continuous;
        this.recognition.interimResults = this.config.interimResults;
        this.recognition.maxAlternatives = this.config.maxAlternatives;
    }

    /**
     * 음성 인식 이벤트 설정
     */
    private setupRecognitionEvents(): void {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            errorLogger.info('음성 인식이 시작되었습니다', {
                component: 'SpeechRecognitionService',
                action: 'onstart',
            });
            this.isListening = true;
            this.events.onStart?.();
            this.startVoiceActivityDetection();
        };

        this.recognition.onresult = (event: any) => {
            this.handleRecognitionResult(event);
        };

        this.recognition.onerror = (event: any) => {
            errorLogger.error('음성 인식 오류', event.error instanceof Error ? event.error : new Error(String(event.error)), {
                component: 'SpeechRecognitionService',
                action: 'onerror',
                errorCode: event.error,
            });
            this.handleRecognitionError(event.error);
        };

        this.recognition.onend = () => {
            errorLogger.info('음성 인식이 종료되었습니다', {
                component: 'SpeechRecognitionService',
                action: 'onend',
            });
            this.isListening = false;
            this.events.onEnd?.();
            this.stopVoiceActivityDetection();
        };

        this.recognition.onnomatch = () => {
            errorLogger.info('음성을 인식할 수 없습니다', {
                component: 'SpeechRecognitionService',
                action: 'onnomatch',
            });
        };

        this.recognition.onspeechstart = () => {
            errorLogger.info('음성 감지됨', {
                component: 'SpeechRecognitionService',
                action: 'onspeechstart',
            });
            this.clearSilenceTimer();
        };

        this.recognition.onspeechend = () => {
            errorLogger.info('음성 끝남', {
                component: 'SpeechRecognitionService',
                action: 'onspeechend',
            });
            this.startSilenceTimer();
        };
    }

    /**
     * 음성 인식 결과 처리
     */
    private handleRecognitionResult(event: any): void {
        const results = Array.from(event.results);
        const lastResult = results[results.length - 1];

        if (!lastResult) return;

        const resultData = lastResult as any;
        const transcript = resultData[0]?.transcript || '';
        const confidence = resultData[0]?.confidence || 0;
        const isFinal = resultData.isFinal || false;

        // 대안 결과 생성
        const alternatives = resultData.length ? Array.from(resultData).map((alternative: any, index) => ({
            transcript: alternative.transcript || '',
            confidence: alternative.confidence || 0
        })) : [{ transcript, confidence }];

        const result: SpeechRecognitionResult = {
            transcript,
            confidence,
            isFinal,
            alternatives,
            timestamp: Date.now()
        };

        errorLogger.info(`음성 인식 결과: "${transcript}" (신뢰도: ${confidence})`, {
            component: 'SpeechRecognitionService',
            action: 'handleRecognitionResult',
            transcript,
            confidence,
            isFinal,
        });
        this.events.onResult?.(result);

        // 최종 결과이고 한국어 명령어 처리
        if (isFinal) {
            this.processKoreanCommands(transcript);
        }
    }

    /**
     * 한국어 음성 명령어 처리
     */
    private processKoreanCommands(transcript: string): void {
        const command = transcript.toLowerCase().trim();

        // 음성 인식 중지 명령어
        const stopCommands = ['멈춰', '정지', '그만', '중지', '끝'];
        if (stopCommands.some(cmd => command.includes(cmd))) {
            this.stopListening();
            return;
        }

        // 차트/시각화 명령어
        const chartCommands = ['차트', '그래프', '시각화', '데이터'];
        if (chartCommands.some(cmd => command.includes(cmd))) {
            this.events.onResult?.({
                transcript: transcript + ' [음성 차트 요청]',
                confidence: 1.0,
                isFinal: true,
                timestamp: Date.now()
            });
            return;
        }

        // 파일 업로드 명령어
        const fileCommands = ['파일', '업로드', '첨부'];
        if (fileCommands.some(cmd => command.includes(cmd))) {
            this.events.onResult?.({
                transcript: transcript + ' [음성 파일 요청]',
                confidence: 1.0,
                isFinal: true,
                timestamp: Date.now()
            });
            return;
        }
    }

    /**
     * 음성 인식 오류 처리
     */
    private handleRecognitionError(error: string): void {
        let errorMessage = '';

        switch (error) {
            case 'no-speech':
                errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
                this.events.onNoSpeech?.();
                break;
            case 'audio-capture':
                errorMessage = '마이크에 접근할 수 없습니다. 권한을 확인해주세요.';
                break;
            case 'not-allowed':
                errorMessage = '마이크 권한이 거부되었습니다.';
                break;
            case 'network':
                errorMessage = '네트워크 오류가 발생했습니다.';
                break;
            case 'service-not-allowed':
                errorMessage = '음성 인식 서비스를 사용할 수 없습니다.';
                break;
            default:
                errorMessage = `음성 인식 오류: ${error}`;
        }

        this.events.onError?.(errorMessage);
    }

    /**
     * 음성 활동 감지 시작
     */
    private async startVoiceActivityDetection(): Promise<void> {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: this.config.echoCancellationEnabled,
                    noiseSuppression: this.config.noiseSuppressionEnabled,
                    autoGainControl: true
                }
            });

            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);

            this.analyser.fftSize = 256;
            this.microphone.connect(this.analyser);

            this.monitorVoiceActivity();
        } catch (error) {
            errorLogger.error('음성 활동 감지 초기화 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'SpeechRecognitionService',
                action: 'startVoiceActivityDetection',
            });
        }
    }

    /**
     * 음성 활동 모니터링
     */
    private monitorVoiceActivity(): void {
        if (!this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkActivity = () => {
            if (!this.isListening || !this.analyser) return;

            this.analyser.getByteFrequencyData(dataArray);

            // 평균 볼륨 계산
            const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
            const volume = average / 255;

            // 음성 활동 감지 (임계값: 0.01)
            const isActive = volume > 0.01;

            this.events.onVoiceActivity?.({
                isActive,
                volume,
                duration: this.isListening ? Date.now() : 0
            });

            // 다음 프레임에서 계속 모니터링
            requestAnimationFrame(checkActivity);
        };

        checkActivity();
    }

    /**
     * 음성 활동 감지 중지
     */
    private stopVoiceActivityDetection(): void {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
        this.microphone = null;
    }

    /**
     * 침묵 타이머 시작
     */
    private startSilenceTimer(): void {
        this.silenceTimer = setTimeout(() => {
            if (this.isListening) {
                errorLogger.info('침묵 감지로 인한 음성 인식 중지', {
                    component: 'SpeechRecognitionService',
                    action: 'startSilenceTimer',
                });
                this.stopListening();
            }
        }, 3000); // 3초 침묵 후 자동 중지
    }

    /**
     * 침묵 타이머 클리어
     */
    private clearSilenceTimer(): void {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    /**
     * 음성 인식 시작
     */
    public async startListening(events?: SpeechRecognitionEvents): Promise<boolean> {
        if (!this.isSupported) {
            errorLogger.error('음성 인식이 지원되지 않습니다', new Error('Speech recognition not supported'), {
                component: 'SpeechRecognitionService',
                action: 'startListening',
            });
            return false;
        }

        if (this.isListening) {
            errorLogger.warn('이미 음성 인식이 진행 중입니다', {
                component: 'SpeechRecognitionService',
                action: 'startListening',
            });
            return true;
        }

        if (events) {
            this.events = events;
        }

        try {
            // 마이크 권한 요청
            await navigator.mediaDevices.getUserMedia({ audio: true });

            this.recognition?.start();
            return true;
        } catch (error) {
            errorLogger.error('음성 인식 시작 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'SpeechRecognitionService',
                action: 'startListening',
            });
            this.events.onError?.('마이크 권한이 필요합니다.');
            return false;
        }
    }

    /**
     * 음성 인식 중지
     */
    public stopListening(): void {
        if (!this.isListening) return;

        this.recognition?.stop();
        this.clearSilenceTimer();
        this.stopVoiceActivityDetection();
    }

    /**
     * 설정 업데이트
     */
    public updateConfig(newConfig: Partial<SpeechRecognitionConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.setupRecognitionConfig();
    }

    /**
     * 지원 여부 확인
     */
    public checkSupport(): boolean {
        return this.isSupported;
    }

    /**
     * 현재 상태 확인
     */
    public getStatus(): {
        isListening: boolean;
        isSupported: boolean;
        currentLanguage: string;
    } {
        return {
            isListening: this.isListening,
            isSupported: this.isSupported,
            currentLanguage: this.config.language
        };
    }

    /**
     * 언어 변경
     */
    public setLanguage(language: string): void {
        this.config.language = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
    }

    /**
     * 지원되는 언어 목록
     */
    public getSupportedLanguages(): Array<{ code: string, name: string }> {
        return [
            { code: 'ko-KR', name: '한국어' },
            { code: 'en-US', name: 'English (US)' },
            { code: 'en-GB', name: 'English (UK)' },
            { code: 'ja-JP', name: '日本語' },
            { code: 'zh-CN', name: '中文 (简体)' },
            { code: 'zh-TW', name: '中文 (繁體)' },
            { code: 'es-ES', name: 'Español' },
            { code: 'fr-FR', name: 'Français' },
            { code: 'de-DE', name: 'Deutsch' },
            { code: 'it-IT', name: 'Italiano' },
            { code: 'pt-BR', name: 'Português (Brasil)' },
            { code: 'ru-RU', name: 'Русский' }
        ];
    }

    /**
     * 마이크 권한 확인
     */
    public async checkMicrophonePermission(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            errorLogger.error('마이크 권한 확인 실패', error instanceof Error ? error : new Error(String(error)), {
                component: 'SpeechRecognitionService',
                action: 'checkMicrophonePermission',
            });
            return false;
        }
    }

    /**
     * 음성 인식 품질 향상을 위한 환경 최적화
     */
    public optimizeForEnvironment(environment: 'quiet' | 'noisy' | 'office'): void {
        switch (environment) {
            case 'quiet':
                this.config.noiseSuppressionEnabled = false;
                this.config.echoCancellationEnabled = false;
                break;
            case 'noisy':
                this.config.noiseSuppressionEnabled = true;
                this.config.echoCancellationEnabled = true;
                break;
            case 'office':
                this.config.noiseSuppressionEnabled = true;
                this.config.echoCancellationEnabled = true;
                break;
        }
        this.setupRecognitionConfig();
    }
}

// 싱글톤 인스턴스 생성
export const speechRecognitionService = new SpeechRecognitionService();

export default speechRecognitionService;
