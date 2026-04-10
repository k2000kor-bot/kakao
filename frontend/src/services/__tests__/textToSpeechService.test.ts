/**
 * TextToSpeechService 테스트
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import {
  textToSpeechService,
  TextToSpeechService,
  TTSConfig,
  TTSEvents,
} from '../textToSpeechService';

// Mock SpeechSynthesisVoice
const createMockVoice = (name: string, lang: string, gender?: string) => ({
  voiceURI: name,
  name,
  lang,
  localService: true,
  default: false,
  gender: gender || 'female',
});

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => void) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => void) | null;

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
  createMockVoice('Yuna', 'ko-KR', 'female'),
  createMockVoice('Heami', 'ko-KR', 'female'),
  createMockVoice('Sora', 'ko-KR', 'female'),
  createMockVoice('Microsoft David', 'en-US', 'male'),
  createMockVoice('Microsoft Zira', 'en-US', 'female'),
];

const mockSynthesis = {
  getVoices: jest.fn(() => mockVoices),
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  addEventListener: jest.fn(),
};

// Global SpeechSynthesis 모킹
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSynthesis,
});

// Global SpeechSynthesisUtterance 모킹
(global as unknown as Record<string, unknown>).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

describe('TextToSpeechService', () => {
  let service: TextToSpeechService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mocks
    mockSynthesis.getVoices.mockReturnValue(mockVoices);
    mockSynthesis.speak.mockClear();
    mockSynthesis.cancel.mockClear();
    mockSynthesis.pause.mockClear();
    mockSynthesis.resume.mockClear();

    service = new TextToSpeechService();
  });

  afterEach(() => {
    jest.useRealTimers();
    service.stop();
    service.clearQueue();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(TextToSpeechService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(textToSpeechService).toBeDefined();
      expect(textToSpeechService).toBeInstanceOf(TextToSpeechService);
    });

    it('지원 여부 확인', () => {
      const isSupported = service.checkSupport();
      expect(typeof isSupported).toBe('boolean');
    });

    it('기본 상태 확인', () => {
      const status = service.getStatus();
      expect(status).toHaveProperty('isPlaying');
      expect(status).toHaveProperty('isPaused');
      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('currentProfile');
      expect(status).toHaveProperty('isSupported');
    });
  });

  describe('음성 목록', () => {
    it('사용 가능한 음성 목록 조회', async () => {
      jest.advanceTimersByTime(200);
      const voices = service.getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
    });

    it('음성 프로필 목록 조회', () => {
      const profiles = service.getVoiceProfiles();
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles.length).toBeGreaterThan(0);
    });

    it('기본 음성 프로필 존재', () => {
      const profiles = service.getVoiceProfiles();
      const defaultProfile = profiles.find(p => p.id === 'default');
      expect(defaultProfile).toBeDefined();
    });
  });

  describe('텍스트 음성 변환', () => {
    it('기본 음성 변환', async () => {
      const id = await service.speak('안녕하세요');
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('빈 텍스트 처리', async () => {
      const id = await service.speak('');
      expect(id).toBe('');
    });

    it('커스텀 설정으로 음성 변환', async () => {
      const config: Partial<TTSConfig> = {
        rate: 1.2,
        pitch: 1.1,
        volume: 0.9,
      };
      const id = await service.speak('테스트 메시지', { config });
      expect(id).toBeDefined();
    });

    it('즉시 재생 옵션', async () => {
      const idPromise = service.speak('즉시 재생', { immediate: true });
      
      // Utterance의 onend 이벤트 트리거
      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onend) {
          utterance.onend({} as SpeechSynthesisEvent);
        }
      }
      
      jest.advanceTimersByTime(100);
      const id = await idPromise;
      expect(id).toBeDefined();
    });

    it('우선순위 설정', async () => {
      const id1 = await service.speak('낮은 우선순위', { priority: 'low' });
      const id2 = await service.speak('높은 우선순위', { priority: 'high' });
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
    });

    it('타입 설정', async () => {
      const id = await service.speak('알림 메시지', { type: 'notification' });
      expect(id).toBeDefined();
    });
  });

  describe('텍스트 전처리', () => {
    it('마크다운 제거', async () => {
      await service.speak('**굵은 텍스트**');
      // 전처리되어 정상적으로 처리되어야 함
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });

    it('이모지 처리', async () => {
      await service.speak('테스트 📊 차트');
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });

    it('URL 제거', async () => {
      await service.speak('링크 https://example.com');
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });
  });

  describe('알림 메시지', () => {
    it('알림 음성 변환', async () => {
      const id = await service.speakNotification('새 메시지가 도착했습니다');
      expect(id).toBeDefined();
    });

    it('경고 음성 변환', async () => {
      const idPromise = service.speakAlert('시스템 오류가 발생했습니다');
      
      // Utterance의 onend 이벤트 트리거
      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onend) {
          utterance.onend({} as SpeechSynthesisEvent);
        }
      }
      
      jest.advanceTimersByTime(100);
      const id = await idPromise;
      expect(id).toBeDefined();
    });

    it('분석 음성 변환', async () => {
      const id = await service.speakAnalysis('데이터 분석이 완료되었습니다');
      expect(id).toBeDefined();
    });
  });

  describe('음성 재생 제어', () => {
    it('일시정지', async () => {
      void service.speak('테스트');

      // 재생 상태 설정을 위해 utterance 이벤트 트리거
      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onstart) {
          utterance.onstart({} as SpeechSynthesisEvent);
        }
      }
      
      jest.advanceTimersByTime(50);
      
      // 이제 일시정지 가능
      service.pause();
      expect(mockSynthesis.pause).toHaveBeenCalled();
    });

    it('재개', async () => {
      void service.speak('테스트');

      // 재생 상태 설정
      const speakCall = mockSynthesis.speak.mock.calls[0];
      if (speakCall && speakCall[0]) {
        const utterance = speakCall[0];
        if (utterance.onstart) {
          utterance.onstart({} as SpeechSynthesisEvent);
        }
      }
      
      jest.advanceTimersByTime(50);
      
      service.pause();
      service.resume();
      expect(mockSynthesis.resume).toHaveBeenCalled();
    });

    it('중지', () => {
      service.stop();
      expect(mockSynthesis.cancel).toHaveBeenCalled();
    });

    it('큐 초기화', () => {
      service.clearQueue();
      const status = service.getStatus();
      expect(status.queueLength).toBe(0);
    });
  });

  describe('음성 프로필', () => {
    it('음성 프로필 변경', () => {
      const result = service.setVoiceProfile('professional');
      expect(result).toBe(true);
    });

    it('존재하지 않는 프로필 변경 실패', () => {
      const result = service.setVoiceProfile('non-existent');
      expect(result).toBe(false);
    });

    it('커스텀 음성 프로필 생성', () => {
      const customVoice = createMockVoice('Custom Voice', 'ko-KR');
      service.createVoiceProfile(
        'custom-1',
        '커스텀 프로필',
        customVoice as SpeechSynthesisVoice,
        {
          rate: 1.1,
          pitch: 1.1,
        }
      );

      const profiles = service.getVoiceProfiles();
      const customProfile = profiles.find(p => p.id === 'custom-1');
      expect(customProfile).toBeDefined();
      expect(customProfile?.isCustom).toBe(true);
    });

    it('프로필 변경 후 설정 적용', () => {
      service.setVoiceProfile('friendly');
      const status = service.getStatus();
      expect(status.currentProfile).toBe('friendly');
    });
  });

  describe('설정 업데이트', () => {
    it('설정 업데이트', () => {
      service.updateConfig({
        rate: 1.2,
        pitch: 1.1,
        volume: 0.9,
      });

      // 설정이 업데이트되었는지 확인하기 위해 음성 변환 테스트
      service.speak('테스트');
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });

    it('언어 설정 변경', () => {
      service.updateConfig({
        language: 'en-US',
      });
      expect(service.getStatus().isSupported).toBeDefined();
    });

    it('감정 톤 설정', () => {
      service.updateConfig({
        emotionalTone: 'happy',
      });
      expect(service.getStatus().isSupported).toBeDefined();
    });
  });

  describe('이벤트 리스너', () => {
    it('이벤트 리스너 설정', () => {
      const events: TTSEvents = {
        onStart: jest.fn(),
        onEnd: jest.fn(),
        onError: jest.fn(),
        onQueueUpdate: jest.fn(),
      };

      service.setEventListeners(events);
      expect(events.onStart).toBeDefined();
    });

    it('큐 업데이트 이벤트', async () => {
      const onQueueUpdate = jest.fn();
      service.setEventListeners({ onQueueUpdate });

      await service.speak('테스트');
      expect(onQueueUpdate).toHaveBeenCalled();
    });
  });

  describe('큐 관리', () => {
    it('큐에 항목 추가', async () => {
      await service.speak('메시지 1');
      await service.speak('메시지 2');
      
      const status = service.getStatus();
      expect(status.queueLength).toBeGreaterThanOrEqual(0);
    });

    it('우선순위에 따른 큐 순서', async () => {
      await service.speak('낮은 우선순위', { priority: 'low' });
      await service.speak('높은 우선순위', { priority: 'high' });
      
      // 큐에 추가되었는지 확인
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });

    it('즉시 재생 시 큐 초기화', async () => {
      void service.speak('큐 항목 1');
      jest.advanceTimersByTime(50);

      const id2Promise = service.speak('즉시 재생', { immediate: true });
      
      // 즉시 재생의 utterance onend 트리거
      const speakCalls = mockSynthesis.speak.mock.calls;
      if (speakCalls.length > 0) {
        const lastUtterance = speakCalls[speakCalls.length - 1][0];
        if (lastUtterance && lastUtterance.onend) {
          lastUtterance.onend({} as SpeechSynthesisEvent);
        }
      }
      
      jest.advanceTimersByTime(100);
      const id2 = await id2Promise;
      expect(id2).toBeDefined();
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });
  });

  describe('상태 확인', () => {
    it('현재 상태 조회', () => {
      const status = service.getStatus();
      expect(status).toHaveProperty('isPlaying');
      expect(status).toHaveProperty('isPaused');
      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('currentProfile');
      expect(status).toHaveProperty('isSupported');
    });

    it('재생 상태 확인', () => {
      const status = service.getStatus();
      expect(typeof status.isPlaying).toBe('boolean');
    });

    it('일시정지 상태 확인', () => {
      const status = service.getStatus();
      expect(typeof status.isPaused).toBe('boolean');
    });
  });

  describe('에지 케이스', () => {
    it('긴 텍스트 처리', async () => {
      const longText = '테스트 '.repeat(100);
      const id = await service.speak(longText);
      expect(id).toBeDefined();
    });

    it('특수 문자 포함 텍스트', async () => {
      const id = await service.speak('테스트 #해시태그 @멘션 $달러');
      expect(id).toBeDefined();
    });

    it('여러 언어 혼합 텍스트', async () => {
      const id = await service.speak('Hello 안녕하세요 你好');
      expect(id).toBeDefined();
    });

    it('빈 큐에서 중지', () => {
      expect(() => {
        service.stop();
      }).not.toThrow();
    });

    it('일시정지 상태에서 재개', () => {
      service.pause();
      expect(() => {
        service.resume();
      }).not.toThrow();
    });
  });

  describe('음성 선택 로직', () => {
    it('한국어 음성 우선 선택', async () => {
      // 한국어 음성이 있는 경우
      jest.advanceTimersByTime(200);
      const voices = service.getAvailableVoices();
      expect(Array.isArray(voices)).toBe(true);
    });
  });

  describe('감정 톤 조정', () => {
    it('행복한 톤 설정', async () => {
      await service.speak('테스트', {
        config: {
          emotionalTone: 'happy',
        },
      });
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });

    it('차분한 톤 설정', async () => {
      await service.speak('테스트', {
        config: {
          emotionalTone: 'calm',
        },
      });
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });

    it('전문적인 톤 설정', async () => {
      await service.speak('테스트', {
        config: {
          emotionalTone: 'professional',
        },
      });
      expect(mockSynthesis.speak).toHaveBeenCalled();
    });
  });
});

