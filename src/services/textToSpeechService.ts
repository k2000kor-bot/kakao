/**
 * CORBU AI 고급 텍스트 음성 변환(TTS) 서비스
 * Web Speech API와 고급 음성 합성 기능을 활용
 */

export interface TTSConfig {
    language: string;
    voice?: SpeechSynthesisVoice;
    rate: number;
    pitch: number;
    volume: number;
    pauseBetweenSentences: number;
    pauseBetweenParagraphs: number;
    enableSSML: boolean;
    emotionalTone?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'professional';
}

export interface TTSQueueItem {
    id: string;
    text: string;
    config?: Partial<TTSConfig>;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    type: 'message' | 'notification' | 'alert' | 'system' | 'analysis';
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
}

export interface VoiceProfile {
    id: string;
    name: string;
    voice: SpeechSynthesisVoice;
    config: TTSConfig;
    isCustom: boolean;
}

export interface TTSEvents {
    onStart?: (item: TTSQueueItem) => void;
    onEnd?: (item: TTSQueueItem) => void;
    onPause?: () => void;
    onResume?: () => void;
    onStop?: () => void;
    onError?: (error: string, item?: TTSQueueItem) => void;
    onQueueUpdate?: (queue: TTSQueueItem[]) => void;
    onVoiceChange?: (voice: SpeechSynthesisVoice) => void;
}

export class TextToSpeechService {
    private synthesis: SpeechSynthesis;
    private supportStatus: boolean = false;
    private availableVoices: SpeechSynthesisVoice[] = [];
    private config: TTSConfig;
    private queue: TTSQueueItem[] = [];
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private events: TTSEvents = {};
    private voiceProfiles: Map<string, VoiceProfile> = new Map();
    private currentProfileId: string = 'default';

    constructor() {
        this.synthesis = window.speechSynthesis;
        this.supportStatus = 'speechSynthesis' in window;

        // 기본 설정
        this.config = {
            language: 'ko-KR',
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8,
            pauseBetweenSentences: 300,
            pauseBetweenParagraphs: 600,
            enableSSML: false,
            emotionalTone: 'professional'
        };

        this.initializeTTS();
    }

    /**
     * TTS 시스템 초기화
     */
    private async initializeTTS(): Promise<void> {
        if (!this.supportStatus) {
            console.warn('Web Speech Synthesis API가 지원되지 않습니다.');
            return;
        }

        // 음성 목록 로드
        await this.loadVoices();

        // 기본 음성 프로필 생성
        this.createDefaultVoiceProfiles();

        // 음성 변경 이벤트 리스너
        this.synthesis.addEventListener('voiceschanged', () => {
            this.loadVoices();
        });

        console.log('🔊 TTS 서비스가 초기화되었습니다.');
    }

    /**
     * 사용 가능한 음성 목록 로드
     */
    private async loadVoices(): Promise<void> {
        return new Promise((resolve) => {
            const loadVoicesAttempt = () => {
                this.availableVoices = this.synthesis.getVoices();

                if (this.availableVoices.length > 0) {
                    console.log(`${this.availableVoices.length}개의 음성을 로드했습니다.`);
                    this.selectOptimalVoice();
                    resolve();
                } else {
                    // 일부 브라우저에서는 지연 로딩이 필요
                    setTimeout(loadVoicesAttempt, 100);
                }
            };

            loadVoicesAttempt();
        });
    }

    /**
     * 최적의 음성 선택
     */
    private selectOptimalVoice(): void {
        const koreanVoices = this.availableVoices.filter(voice =>
            voice.lang.includes('ko') || voice.lang.includes('KR')
        );

        if (koreanVoices.length > 0) {
            // 여성 음성 우선 선택
            const femaleVoice = koreanVoices.find(voice =>
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('여성') ||
                voice.name.toLowerCase().includes('yuna') ||
                voice.name.toLowerCase().includes('heami')
            );

            this.config.voice = femaleVoice || koreanVoices[0];
        } else {
            // 한국어 음성이 없으면 영어 음성 선택
            const englishVoices = this.availableVoices.filter(voice =>
                voice.lang.includes('en')
            );

            if (englishVoices.length > 0) {
                this.config.voice = englishVoices[0];
            }
        }

        console.log(`선택된 음성: ${this.config.voice?.name} (${this.config.voice?.lang})`);
    }

    /**
     * 기본 음성 프로필 생성
     */
    private createDefaultVoiceProfiles(): void {
        if (!this.config.voice) return;

        // 기본 프로필
        this.voiceProfiles.set('default', {
            id: 'default',
            name: '기본 음성',
            voice: this.config.voice,
            config: { ...this.config },
            isCustom: false
        });

        // 전문가 프로필
        this.voiceProfiles.set('professional', {
            id: 'professional',
            name: '전문가 음성',
            voice: this.config.voice,
            config: {
                ...this.config,
                rate: 0.9,
                pitch: 0.9,
                emotionalTone: 'professional'
            },
            isCustom: false
        });

        // 친근한 프로필
        this.voiceProfiles.set('friendly', {
            id: 'friendly',
            name: '친근한 음성',
            voice: this.config.voice,
            config: {
                ...this.config,
                rate: 1.1,
                pitch: 1.1,
                emotionalTone: 'happy'
            },
            isCustom: false
        });

        // 차분한 프로필
        this.voiceProfiles.set('calm', {
            id: 'calm',
            name: '차분한 음성',
            voice: this.config.voice,
            config: {
                ...this.config,
                rate: 0.8,
                pitch: 0.8,
                emotionalTone: 'calm'
            },
            isCustom: false
        });
    }

    /**
     * 텍스트를 음성으로 변환
     */
    public async speak(
        text: string,
        options?: {
            config?: Partial<TTSConfig>;
            priority?: TTSQueueItem['priority'];
            type?: TTSQueueItem['type'];
            immediate?: boolean;
        }
    ): Promise<string> {
        if (!this.supportStatus) {
            console.warn('TTS가 지원되지 않습니다.');
            return '';
        }

        if (!text.trim()) {
            console.warn('빈 텍스트는 음성으로 변환할 수 없습니다.');
            return '';
        }

        const queueItem: TTSQueueItem = {
            id: this.generateId(),
            text: this.preprocessText(text),
            config: options?.config,
            priority: options?.priority || 'normal',
            type: options?.type || 'message'
        };

        // 즉시 재생 요청
        if (options?.immediate) {
            this.clearQueue();
            await this.speakImmediate(queueItem);
            return queueItem.id;
        }

        // 큐에 추가
        this.addToQueue(queueItem);

        // 현재 재생 중이 아니면 재생 시작
        if (!this.isPlaying) {
            this.processQueue();
        }

        return queueItem.id;
    }

    /**
     * 텍스트 전처리
     */
    private preprocessText(text: string): string {
        let processedText = text;

        // 마크다운 제거
        processedText = processedText.replace(/[*_`~]/g, '');

        // 이모지 텍스트로 변환
        const emojiMap: { [key: string]: string } = {
            '📊': '차트',
            '📈': '상승 그래프',
            '📉': '하락 그래프',
            '🎯': '목표',
            '💡': '아이디어',
            '✅': '완료',
            '❌': '오류',
            '⚠️': '경고',
            '🔍': '검색',
            '📁': '파일',
            '🎙️': '마이크',
            '🔊': '스피커',
            '📞': '전화',
            '💬': '메시지',
            '🤖': 'AI',
            '🏢': '건물',
            '🏗️': '건설',
            '👥': '사람들',
            '📋': '목록',
            '📄': '문서'
        };

        Object.entries(emojiMap).forEach(([emoji, text]) => {
            processedText = processedText.replace(new RegExp(emoji, 'g'), text);
        });

        // URL 제거
        processedText = processedText.replace(/https?:\/\/[^\s]+/g, '링크');

        // 특수 문자 정리
        processedText = processedText.replace(/[#]+/g, '');

        // 연속된 공백 정리
        processedText = processedText.replace(/\s+/g, ' ').trim();

        // 문장 끝 처리
        if (!processedText.match(/[.!?]$/)) {
            processedText += '.';
        }

        return processedText;
    }

    /**
     * 큐에 항목 추가 (우선순위 기반)
     */
    private addToQueue(item: TTSQueueItem): void {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };

        // 우선순위에 따라 삽입 위치 결정
        let insertIndex = this.queue.length;

        for (let i = 0; i < this.queue.length; i++) {
            if (priorityOrder[item.priority] < priorityOrder[this.queue[i].priority]) {
                insertIndex = i;
                break;
            }
        }

        this.queue.splice(insertIndex, 0, item);
        this.events.onQueueUpdate?.(this.queue);
    }

    /**
     * 즉시 음성 재생
     */
    private async speakImmediate(item: TTSQueueItem): Promise<void> {
        return new Promise((resolve, reject) => {
            const utterance = this.createUtterance(item);

            utterance.onend = () => {
                item.onEnd?.();
                this.events.onEnd?.(item);
                resolve();
            };

            utterance.onerror = (event) => {
                const error = `TTS 오류: ${event.error}`;
                item.onError?.(error);
                this.events.onError?.(error, item);
                reject(new Error(error));
            };

            this.currentUtterance = utterance;
            this.isPlaying = true;

            item.onStart?.();
            this.events.onStart?.(item);

            this.synthesis.speak(utterance);
        });
    }

    /**
     * 큐 처리
     */
    private async processQueue(): Promise<void> {
        if (this.queue.length === 0 || this.isPlaying) return;

        const item = this.queue.shift();
        if (!item) return;

        this.events.onQueueUpdate?.(this.queue);

        try {
            await this.speakImmediate(item);
        } catch (error) {
            console.error('큐 처리 오류:', error);
        }

        this.isPlaying = false;

        // 다음 항목 처리
        setTimeout(() => {
            this.processQueue();
        }, 100);
    }

    /**
     * SpeechSynthesisUtterance 생성
     */
    private createUtterance(item: TTSQueueItem): SpeechSynthesisUtterance {
        const utterance = new SpeechSynthesisUtterance(item.text);
        const config = { ...this.config, ...item.config };

        utterance.voice = config.voice || this.config.voice || null;
        utterance.rate = this.adjustRateForEmotionalTone(config.rate, config.emotionalTone);
        utterance.pitch = this.adjustPitchForEmotionalTone(config.pitch, config.emotionalTone);
        utterance.volume = config.volume;
        utterance.lang = config.language;

        return utterance;
    }

    /**
     * 감정적 톤에 따른 속도 조정
     */
    private adjustRateForEmotionalTone(baseRate: number, tone?: string): number {
        const adjustments: { [key: string]: number } = {
            'excited': 1.2,
            'happy': 1.1,
            'neutral': 1.0,
            'professional': 0.95,
            'calm': 0.8,
            'sad': 0.7
        };

        const adjustment = adjustments[tone || 'neutral'] || 1.0;
        return Math.max(0.1, Math.min(2.0, baseRate * adjustment));
    }

    /**
     * 감정적 톤에 따른 피치 조정
     */
    private adjustPitchForEmotionalTone(basePitch: number, tone?: string): number {
        const adjustments: { [key: string]: number } = {
            'excited': 1.3,
            'happy': 1.2,
            'neutral': 1.0,
            'professional': 0.9,
            'calm': 0.8,
            'sad': 0.7
        };

        const adjustment = adjustments[tone || 'neutral'] || 1.0;
        return Math.max(0.1, Math.min(2.0, basePitch * adjustment));
    }

    /**
     * 음성 재생 일시정지
     */
    public pause(): void {
        if (this.isPlaying && !this.isPaused) {
            this.synthesis.pause();
            this.isPaused = true;
            this.events.onPause?.();
        }
    }

    /**
     * 음성 재생 재개
     */
    public resume(): void {
        if (this.isPaused) {
            this.synthesis.resume();
            this.isPaused = false;
            this.events.onResume?.();
        }
    }

    /**
     * 음성 재생 중지
     */
    public stop(): void {
        this.synthesis.cancel();
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.events.onStop?.();
    }

    /**
     * 큐 초기화
     */
    public clearQueue(): void {
        this.queue = [];
        this.events.onQueueUpdate?.(this.queue);
    }

    /**
     * 음성 프로필 변경
     */
    public setVoiceProfile(profileId: string): boolean {
        const profile = this.voiceProfiles.get(profileId);
        if (!profile) return false;

        this.currentProfileId = profileId;
        this.config = { ...profile.config };
        this.events.onVoiceChange?.(profile.voice);

        console.log(`음성 프로필 변경: ${profile.name}`);
        return true;
    }

    /**
     * 커스텀 음성 프로필 생성
     */
    public createVoiceProfile(
        id: string,
        name: string,
        voice: SpeechSynthesisVoice,
        config: Partial<TTSConfig>
    ): void {
        const profile: VoiceProfile = {
            id,
            name,
            voice,
            config: { ...this.config, ...config },
            isCustom: true
        };

        this.voiceProfiles.set(id, profile);
        console.log(`커스텀 음성 프로필 생성: ${name}`);
    }

    /**
     * 이벤트 리스너 설정
     */
    public setEventListeners(events: TTSEvents): void {
        this.events = events;
    }

    /**
     * 사용 가능한 음성 목록 반환
     */
    public getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.availableVoices;
    }

    /**
     * 음성 프로필 목록 반환
     */
    public getVoiceProfiles(): VoiceProfile[] {
        return Array.from(this.voiceProfiles.values());
    }

    /**
     * 현재 상태 반환
     */
    public getStatus(): {
        isPlaying: boolean;
        isPaused: boolean;
        queueLength: number;
        currentProfile: string;
        isSupported: boolean;
    } {
        return {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            queueLength: this.queue.length,
            currentProfile: this.currentProfileId,
            isSupported: this.supportStatus
        };
    }

    /**
     * 특정 타입의 메시지 음성 변환
     */
    public speakNotification(message: string): Promise<string> {
        return this.speak(`알림: ${message}`, {
            priority: 'high',
            type: 'notification',
            config: {
                emotionalTone: 'professional',
                rate: 1.1
            }
        });
    }

    public speakAlert(message: string): Promise<string> {
        return this.speak(`경고: ${message}`, {
            priority: 'urgent',
            type: 'alert',
            immediate: true,
            config: {
                emotionalTone: 'excited',
                rate: 1.2,
                pitch: 1.2
            }
        });
    }

    public speakAnalysis(message: string): Promise<string> {
        return this.speak(message, {
            priority: 'normal',
            type: 'analysis',
            config: {
                emotionalTone: 'professional',
                rate: 0.9
            }
        });
    }

    /**
     * ID 생성기
     */
    private generateId(): string {
        return `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 지원 여부 확인
     */
    public checkSupport(): boolean {
        return this.supportStatus;
    }

    /**
     * 설정 업데이트
     */
    public updateConfig(newConfig: Partial<TTSConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}

// 싱글톤 인스턴스 생성
export const textToSpeechService = new TextToSpeechService();

export default textToSpeechService;
