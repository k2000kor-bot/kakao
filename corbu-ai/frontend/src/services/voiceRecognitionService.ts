export interface VoiceRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  grammars?: string[];
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: string[];
  timestamp: number;
}

export interface VoiceSynthesisConfig {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

class VoiceRecognitionService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private isSpeaking = false;
  private onResultCallback: ((result: VoiceRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onStartCallback: (() => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.initializeRecognition();
    this.initializeSynthesis();
  }

  // 음성 인식 초기화
  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.setupRecognitionHandlers();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.setupRecognitionHandlers();
    } else {
      console.warn('음성 인식이 지원되지 않는 브라우저입니다.');
    }
  }

  // 음성 합성 초기화
  private initializeSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      console.warn('음성 합성이 지원되지 않는 브라우저입니다.');
    }
  }

  // 음성 인식 이벤트 핸들러 설정
  private setupRecognitionHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStartCallback?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEndCallback?.();
    };

    this.recognition.onerror = (event: any) => {
      const errorMessage = this.getErrorMessage(event.error);
      this.onErrorCallback?.(errorMessage);
    };

    this.recognition.onresult = (event: any) => {
      const result = this.processRecognitionResult(event);
      this.onResultCallback?.(result);
    };
  }

  // 음성 인식 시작
  startRecognition(config: VoiceRecognitionConfig = this.getDefaultConfig()) {
    if (!this.recognition) {
      this.onErrorCallback?.('음성 인식이 지원되지 않습니다.');
      return false;
    }

    try {
      this.recognition.lang = config.language;
      this.recognition.continuous = config.continuous;
      this.recognition.interimResults = config.interimResults;
      this.recognition.maxAlternatives = config.maxAlternatives;

      if (config.grammars) {
        this.recognition.grammars = config.grammars;
      }

      this.recognition.start();
      return true;
    } catch (error) {
      console.error('음성 인식 시작 오류:', error);
      this.onErrorCallback?.('음성 인식을 시작할 수 없습니다.');
      return false;
    }
  }

  // 음성 인식 중지
  stopRecognition() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // 음성 인식 결과 처리
  private processRecognitionResult(event: any): VoiceRecognitionResult {
    let finalTranscript = '';
    let interimTranscript = '';
    const alternatives: string[] = [];

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      const confidence = event.results[i][0].confidence;
      const isFinal = event.results[i].isFinal;

      if (isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }

      // 대안 결과 수집
      for (let j = 0; j < event.results[i].length; j++) {
        alternatives.push(event.results[i][j].transcript);
      }
    }

    return {
      transcript: finalTranscript || interimTranscript,
      confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0,
      isFinal: finalTranscript.length > 0,
      alternatives: Array.from(new Set(alternatives)),
      timestamp: Date.now()
    };
  }

  // 음성 합성
  speak(text: string, config: VoiceSynthesisConfig = this.getDefaultSynthesisConfig()) {
    if (!this.synthesis) {
      console.warn('음성 합성이 지원되지 않습니다.');
      return false;
    }

    try {
      // 기존 음성 중지
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.getVoice(config.voice);
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
      };

      utterance.onerror = (event) => {
        console.error('음성 합성 오류:', event);
        this.isSpeaking = false;
      };

      this.synthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('음성 합성 오류:', error);
      return false;
    }
  }

  // 음성 합성 중지
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // 사용 가능한 음성 목록 조회
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];

    const voices = this.synthesis.getVoices();
    return voices.filter(voice => voice.lang.startsWith('ko') || voice.lang.startsWith('en'));
  }

  // 음성 선택
  private getVoice(voiceName: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    return voices.find(voice => voice.name === voiceName) || voices[0] || null;
  }

  // 기본 설정
  private getDefaultConfig(): VoiceRecognitionConfig {
    return {
      language: 'ko-KR',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3
    };
  }

  private getDefaultSynthesisConfig(): VoiceSynthesisConfig {
    return {
      voice: '',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    };
  }

  // 오류 메시지 변환
  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'no-speech': '음성이 감지되지 않았습니다.',
      'audio-capture': '마이크에 접근할 수 없습니다.',
      'not-allowed': '마이크 사용 권한이 거부되었습니다.',
      'network': '네트워크 오류가 발생했습니다.',
      'service-not-allowed': '음성 인식 서비스를 사용할 수 없습니다.',
      'bad-grammar': '문법 오류가 발생했습니다.',
      'language-not-supported': '지원하지 않는 언어입니다.',
      'aborted': '음성 인식이 중단되었습니다.',
      'network-error': '네트워크 연결을 확인해주세요.',
      'audio-capture-error': '오디오 캡처 오류가 발생했습니다.',
      'service-error': '음성 인식 서비스 오류가 발생했습니다.'
    };

    return errorMessages[error] || `음성 인식 오류: ${error}`;
  }

  // 상태 조회
  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  isSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }



  // 콜백 설정
  onResult(callback: (result: VoiceRecognitionResult) => void) {
    this.onResultCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  onStart(callback: () => void) {
    this.onStartCallback = callback;
  }

  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }

  // 음성 인식 품질 개선
  improveTranscript(transcript: string): string {
    // 일반적인 음성 인식 오류 수정
    let improved = transcript;

    // 숫자 변환
    const numberMappings: { [key: string]: string } = {
      '영': '0', '일': '1', '이': '2', '삼': '3', '사': '4',
      '오': '5', '육': '6', '칠': '7', '팔': '8', '구': '9',
      '십': '10', '백': '100', '천': '1000', '만': '10000'
    };

    Object.entries(numberMappings).forEach(([korean, number]) => {
      improved = improved.replace(new RegExp(korean, 'g'), number);
    });

    // 일반적인 오타 수정
    const typoMappings: { [key: string]: string } = {
      '안녕하세요': '안녕하세요',
      '감사합니다': '감사합니다',
      '죄송합니다': '죄송합니다',
      '네': '네',
      '아니요': '아니요'
    };

    Object.entries(typoMappings).forEach(([incorrect, correct]) => {
      improved = improved.replace(new RegExp(incorrect, 'g'), correct);
    });

    return improved;
  }

  // 음성 명령 인식
  recognizeCommand(transcript: string): { command: string; params: string[] } | null {
    const commands = [
      { pattern: /^(새|새로운)\s*채팅/i, command: 'new_chat', params: [] },
      { pattern: /^(프로젝트|프로젝트로)\s*이동/i, command: 'switch_project', params: [] },
      { pattern: /^(분석|대시보드)\s*보기/i, command: 'show_analytics', params: [] },
      { pattern: /^(저장|저장하기)/i, command: 'save', params: [] },
      { pattern: /^(삭제|지우기)/i, command: 'delete', params: [] },
      { pattern: /^(도움말|도움)/i, command: 'help', params: [] }
    ];

    for (const cmd of commands) {
      if (cmd.pattern.test(transcript)) {
        return {
          command: cmd.command,
          params: cmd.params
        };
      }
    }

    return null;
  }
}

const voiceRecognitionService = new VoiceRecognitionService();
export default voiceRecognitionService;
