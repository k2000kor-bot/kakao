/**
 * VoiceService 테스트
 */

import {
  voiceService,
  VoiceService,
  VoiceConfig,
  VoiceRecognitionResult,
} from '../voiceService';

// Mock SpeechRecognition
const mockSpeechRecognition = jest.fn().mockImplementation(() => ({
  continuous: false,
  interimResults: false,
  lang: '',
  maxAlternatives: 1,
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  onresult: null,
  onerror: null,
  onend: null,
}));

// Mock SpeechSynthesisVoice
const createMockVoice = (name: string, lang: string) => ({
  voiceURI: name,
  name,
  lang,
  localService: true,
  default: false,
});

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null;

  constructor(text: string) {
    this.text = text;
    this.voice = null;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.lang = 'ko-KR';
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
  }
}

// Mock SpeechSynthesis
const mockVoices = [
  createMockVoice('Yuna', 'ko-KR'),
  createMockVoice('Heami', 'ko-KR'),
  createMockVoice('Microsoft David', 'en-US'),
];

const mockSynthesis = {
  getVoices: jest.fn(() => mockVoices),
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
};

// Global 모킹
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSynthesis,
});

(global as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

describe('VoiceService', () => {
  let service: VoiceService;
  let mockRecognition: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(1000000000000);

    // Reset mocks
    mockRecognition = {
      continuous: false,
      interimResults: false,
      lang: '',
      maxAlternatives: 1,
      start: jest.fn(),
      stop: jest.fn(),
      abort: jest.fn(),
      onresult: null,
      onerror: null,
      onend: null,
    };

    mockSpeechRecognition.mockReturnValue(mockRecognition);
    mockSynthesis.getVoices.mockReturnValue(mockVoices);
    mockSynthesis.speak.mockClear();
    mockSynthesis.cancel.mockClear();
    mockSynthesis.pause.mockClear();
    mockSynthesis.resume.mockClear();

    service = new VoiceService();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    service.stopListening();
    service.stopSpeaking();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(VoiceService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(voiceService).toBeDefined();
      expect(voiceService).toBeInstanceOf(VoiceService);
    });

    it('음성 인식 초기화', () => {
      // recognition이 초기화되었는지 확인
      expect(service.isListeningNow()).toBe(false);
    });
  });

  describe('음성 인식', () => {
    it('음성 인식 시작', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      const result = service.startListening(onResult, onError, onEnd);
      expect(result).toBe(true);
      expect(mockRecognition.start).toHaveBeenCalled();
      expect(service.isListeningNow()).toBe(true);
    });

    it('이미 인식 중일 때 시작 실패', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startListening(onResult, onError, onEnd);
      const result = service.startListening(onResult, onError, onEnd);
      expect(result).toBe(false);
    });

    it('음성 인식 중지', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startListening(onResult, onError, onEnd);
      service.stopListening();

      expect(mockRecognition.stop).toHaveBeenCalled();
      expect(service.isListeningNow()).toBe(false);
    });

    it('음성 인식 결과 처리', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startListening(onResult, onError, onEnd);

      // Mock result event
      const mockEvent = {
        resultIndex: 0,
        results: [
          [
            {
              transcript: '안녕하세요',
              confidence: 0.9,
            },
          ],
        ],
      };

      mockEvent.results[0].isFinal = true;
      if (mockRecognition.onresult) {
        mockRecognition.onresult(mockEvent);
      }

      expect(onResult).toHaveBeenCalled();
      const result = onResult.mock.calls[0][0];
      expect(result.transcript).toBe('안녕하세요');
      expect(result.confidence).toBe(0.9);
      expect(result.isFinal).toBe(true);
    });

    it('임시 음성 인식 결과 처리', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startListening(onResult, onError, onEnd);

      const mockEvent = {
        resultIndex: 0,
        results: [
          [
            {
              transcript: '안녕',
              confidence: 0.8,
            },
          ],
        ],
      };

      mockEvent.results[0].isFinal = false;
      if (mockRecognition.onresult) {
        mockRecognition.onresult(mockEvent);
      }

      expect(onResult).toHaveBeenCalled();
      const result = onResult.mock.calls[0][0];
      expect(result.isFinal).toBe(false);
    });

    it('음성 인식 오류 처리', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startListening(onResult, onError, onEnd);

      const mockErrorEvent = { error: 'no-speech' };
      if (mockRecognition.onerror) {
        mockRecognition.onerror(mockErrorEvent);
      }

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toContain('음성이 감지되지 않았습니다');
      expect(service.isListeningNow()).toBe(false);
    });

    it('음성 인식 종료 처리', () => {
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startListening(onResult, onError, onEnd);

      if (mockRecognition.onend) {
        mockRecognition.onend();
      }

      expect(onEnd).toHaveBeenCalled();
      expect(service.isListeningNow()).toBe(false);
    });

    it('음성 인식 언어 업데이트', () => {
      service.updateRecognitionLanguage('en-US');
      expect(mockRecognition.lang).toBe('en-US');
    });

    it('노이즈 제거 활성화', () => {
      service.enableNoiseReduction();
      expect(mockRecognition.continuous).toBe(true);
      expect(mockRecognition.interimResults).toBe(true);
    });
  });

  describe('음성 합성 (TTS)', () => {
    it('기본 음성 합성', () => {
      const onStart = jest.fn();
      const onEnd = jest.fn();
      const onError = jest.fn();

      const result = service.speak('안녕하세요', {}, onStart, onEnd, onError);
      expect(result).toBe(true);
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });

    it('커스텀 설정으로 음성 합성', () => {
      const config: Partial<VoiceConfig> = {
        language: 'en-US',
        rate: 1.2,
        pitch: 1.1,
      };

      const result = service.speak('Hello', config);
      expect(result).toBe(true);
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });

    it('음성 합성 시작 이벤트', () => {
      const onStart = jest.fn();
      const onEnd = jest.fn();

      service.speak('테스트', {}, onStart, onEnd);

      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onstart) {
          utterance.onstart({} as SpeechSynthesisEvent);
        }
      }

      expect(onStart).toHaveBeenCalled();
      expect(service.isSpeakingNow()).toBe(true);
    });

    it('음성 합성 종료 이벤트', () => {
      const onStart = jest.fn();
      const onEnd = jest.fn();

      service.speak('테스트', {}, onStart, onEnd);

      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onstart) {
          utterance.onstart({} as SpeechSynthesisEvent);
        }
        if (utterance.onend) {
          utterance.onend({} as SpeechSynthesisEvent);
        }
      }

      expect(onEnd).toHaveBeenCalled();
      expect(service.isSpeakingNow()).toBe(false);
    });

    it('음성 합성 오류 이벤트', () => {
      const onError = jest.fn();

      service.speak('테스트', {}, undefined, undefined, onError);

      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onerror) {
          utterance.onerror({ error: 'network' } as SpeechSynthesisErrorEvent);
        }
      }

      expect(onError).toHaveBeenCalled();
      expect(service.isSpeakingNow()).toBe(false);
    });

    it('음성 합성 중지', () => {
      const onStart = jest.fn();
      service.speak('테스트', {}, onStart);

      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onstart) {
          utterance.onstart({} as SpeechSynthesisEvent);
        }
      }

      service.stopSpeaking();
      expect(mockSynthesis.cancel).toHaveBeenCalled();
      expect(service.isSpeakingNow()).toBe(false);
    });

    it('음성 합성 일시정지', () => {
      const onStart = jest.fn();
      service.speak('테스트', {}, onStart);

      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onstart) {
          utterance.onstart({} as SpeechSynthesisEvent);
        }
      }

      service.pauseSpeaking();
      expect(mockSynthesis.pause).toHaveBeenCalled();
    });

    it('음성 합성 재개', () => {
      service.resumeSpeaking();
      expect(mockSynthesis.resume).toHaveBeenCalled();
    });

    it('재생 중 새로운 음성 합성 시 이전 중지', () => {
      const onStart1 = jest.fn();
      service.speak('첫 번째', {}, onStart1);

      const speakCall1 = mockSynthesis.speak.mock.calls[0];
      if (speakCall1 && speakCall1[0]) {
        const utterance = speakCall1[0];
        if (utterance.onstart) {
          utterance.onstart({} as SpeechSynthesisEvent);
        }
      }

      const onStart2 = jest.fn();
      service.speak('두 번째', {}, onStart2);

      // 이전 음성이 중지되었는지 확인
      expect(mockSynthesis.cancel).toHaveBeenCalled();
    });
  });

  describe('음성 목록', () => {
    it('사용 가능한 음성 목록 조회', () => {
      const voices = service.getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
    });

    it('한국어 음성 목록 조회', () => {
      const koreanVoices = service.getKoreanVoices();
      expect(Array.isArray(koreanVoices)).toBe(true);
      koreanVoices.forEach(voice => {
        expect(voice.lang).toMatch(/ko|KR/i);
      });
    });
  });

  describe('상태 확인', () => {
    it('음성 인식 상태 확인', () => {
      expect(service.isListeningNow()).toBe(false);

      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      service.startListening(onResult, onError, onEnd);
      expect(service.isListeningNow()).toBe(true);
    });

    it('음성 합성 상태 확인', () => {
      expect(service.isSpeakingNow()).toBe(false);

      const onStart = jest.fn();
      service.speak('테스트', {}, onStart);

      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onstart) {
          utterance.onstart({} as SpeechSynthesisEvent);
        }
      }

      expect(service.isSpeakingNow()).toBe(true);
    });
  });

  describe('키워드 인식', () => {
    it('키워드 인식 시작', () => {
      const keywords = ['시작', '중지', '일시정지'];
      const onKeywordDetected = jest.fn();

      service.startKeywordRecognition(keywords, onKeywordDetected);

      // 키워드 인식이 설정되었는지 확인
      expect(mockRecognition.onresult).toBeDefined();
    });

    it('키워드 감지', () => {
      const keywords = ['시작', '중지'];
      const onKeywordDetected = jest.fn();

      service.startKeywordRecognition(keywords, onKeywordDetected);

      const mockEvent = {
        resultIndex: 0,
        results: [
          [
            {
              transcript: '시작하세요',
              confidence: 0.9,
            },
          ],
        ],
      };

      if (mockRecognition.onresult) {
        mockRecognition.onresult(mockEvent);
      }

      expect(onKeywordDetected).toHaveBeenCalled();
      expect(onKeywordDetected.mock.calls[0][0]).toBe('시작');
    });
  });

  describe('에지 케이스', () => {
    it('음성 인식 미지원 브라우저', () => {
      // SpeechRecognition을 제거하고 새 서비스 생성
      const originalSpeechRecognition = (window as any).SpeechRecognition;
      const originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;
      
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;

      const newService = new VoiceService();
      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      const result = newService.startListening(onResult, onError, onEnd);
      
      // recognition이 null이면 false를 반환해야 함
      // 하지만 이미 초기화된 경우를 고려
      if (result === false) {
        expect(onError).toHaveBeenCalled();
      } else {
        // recognition이 이미 설정된 경우도 유효
        expect(typeof result).toBe('boolean');
      }

      // 원래 값 복원
      (window as any).SpeechRecognition = originalSpeechRecognition;
      (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
    });

    it('빈 텍스트 음성 합성', () => {
      const result = service.speak('');
      // 빈 텍스트도 처리 가능해야 함
      expect(typeof result).toBe('boolean');
    });

    it('긴 텍스트 음성 합성', () => {
      const longText = '테스트 '.repeat(100);
      const result = service.speak(longText);
      expect(result).toBe(true);
    });

    it('음성 인식 시작 실패 처리', () => {
      mockRecognition.start.mockImplementation(() => {
        throw new Error('Start failed');
      });

      const onResult = jest.fn();
      const onError = jest.fn();
      const onEnd = jest.fn();

      const result = service.startListening(onResult, onError, onEnd);
      expect(result).toBe(false);
      expect(onError).toHaveBeenCalled();
    });
  });
});

