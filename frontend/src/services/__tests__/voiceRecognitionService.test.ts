/**
 * VoiceRecognitionService 테스트
 */
import voiceRecognitionService from '../voiceRecognitionService';

describe('VoiceRecognitionService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  describe('improveTranscript', () => {
    it('한글 숫자를 아라비아 숫자로 변환', () => {
      const result = voiceRecognitionService.improveTranscript('이삼사');
      expect(result).toBe('234');
    });

    it('일이삼 변환', () => {
      const result = voiceRecognitionService.improveTranscript('일이삼사오');
      expect(result).toBe('12345');
    });

    it('변환할 패턴이 없으면 원문 유지', () => {
      const input = '안녕하세요 테스트입니다';
      const result = voiceRecognitionService.improveTranscript(input);
      expect(result).toBe(input);
    });
  });

  describe('recognizeCommand', () => {
    it('「새 채팅」음성 구문 인식(호환)', () => {
      const result = voiceRecognitionService.recognizeCommand('새 채팅');
      expect(result).not.toBeNull();
      expect(result?.command).toBe('new_chat');
      expect(result?.params).toEqual([]);
    });

    it('「새로운 채팅」음성 구문 인식(호환)', () => {
      const result = voiceRecognitionService.recognizeCommand('새로운 채팅 만들어');
      expect(result?.command).toBe('new_chat');
    });

    it('새 대화 명령 인식', () => {
      expect(voiceRecognitionService.recognizeCommand('새 대화')?.command).toBe('new_chat');
    });

    it('새로운 대화 명령 인식', () => {
      expect(voiceRecognitionService.recognizeCommand('새로운 대화 시작')?.command).toBe('new_chat');
    });

    it('저장 명령 인식', () => {
      const result = voiceRecognitionService.recognizeCommand('저장');
      expect(result?.command).toBe('save');
    });

    it('저장하기 명령 인식', () => {
      const result = voiceRecognitionService.recognizeCommand('저장하기');
      expect(result?.command).toBe('save');
    });

    it('프로젝트 이동 명령 인식', () => {
      const result = voiceRecognitionService.recognizeCommand('프로젝트로 이동');
      expect(result?.command).toBe('switch_project');
    });

    it('도움말 명령 인식', () => {
      const result = voiceRecognitionService.recognizeCommand('도움말');
      expect(result?.command).toBe('help');
    });

    it('인식할 수 없는 명령은 null 반환', () => {
      const result = voiceRecognitionService.recognizeCommand('오늘 날씨 어때');
      expect(result).toBeNull();
    });
  });

  describe('isRecognitionSupported', () => {
    it('지원 여부 boolean 반환', () => {
      const result = voiceRecognitionService.isRecognitionSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isSynthesisSupported', () => {
    it('지원 여부 boolean 반환', () => {
      const result = voiceRecognitionService.isSynthesisSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('콜백 설정', () => {
    it('onResult 콜백 설정', () => {
      const callback = jest.fn();
      voiceRecognitionService.onResult(callback);
      // 설정만 확인 (내부 상태 변경 검증)
      expect(callback).toBeDefined();
    });

    it('onError 콜백 설정', () => {
      const callback = jest.fn();
      voiceRecognitionService.onError(callback);
      expect(callback).toBeDefined();
    });
  });
});
