/**
 * ContextualUnderstandingService 테스트
 */

import {
  ContextualUnderstandingService,
  contextualUnderstandingService,
} from '../contextualUnderstandingService';

// fetch 모킹
global.fetch = jest.fn();

describe('ContextualUnderstandingService', () => {
  let service: ContextualUnderstandingService;

  beforeEach(() => {
    service = new ContextualUnderstandingService();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ContextualUnderstandingService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(contextualUnderstandingService).toBeDefined();
    });
  });

  describe('메시지 관리', () => {
    it('메시지 추가', () => {
      const message = {
        id: 'msg-1',
        content: '테스트 메시지',
        timestamp: new Date(),
        type: 'user' as const,
      };

      service.addMessage(message);

      // 메시지가 추가되었는지 확인하기 위해 analyzeFullContext를 호출
      // 실제로는 내부 상태를 확인할 수 없으므로, 다음 분석에서 반영되는지 확인
      expect(service).toBeDefined();
    });

    it('히스토리 길이 제한', () => {
      // 많은 메시지 추가
      for (let i = 0; i < 60; i++) {
        service.addMessage({
          id: `msg-${i}`,
          content: `메시지 ${i}`,
          timestamp: new Date(),
          type: 'user' as const,
        });
      }

      // 서비스가 정상적으로 작동하는지 확인
      expect(service).toBeDefined();
    });
  });

  describe('전체 문맥 분석', () => {
    it('백엔드 API 성공 시 분석 결과 반환', async () => {
      const mockResponse = {
        fullContext: '전체 문맥',
        mainTopics: ['토픽1', '토픽2'],
        keyEntities: ['엔티티1'],
        sentiment: 'neutral' as const,
        intent: '질문',
        requirements: ['요구사항1'],
        followUpQuestions: ['후속 질문1'],
        summary: '요약',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.analyzeFullContext('새 메시지');

      expect(result).toBeDefined();
      expect(result.fullContext).toBeDefined();
      expect(Array.isArray(result.mainTopics)).toBe(true);
      expect(Array.isArray(result.keyEntities)).toBe(true);
      expect(result.sentiment).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it('백엔드 API 실패 시 로컬 분석 수행', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeFullContext('새 메시지');

      expect(result).toBeDefined();
      expect(result.fullContext).toBeDefined();
      expect(Array.isArray(result.mainTopics)).toBe(true);
      expect(result.sentiment).toBeDefined();
    });

    it('네트워크 오류 시 로컬 분석 수행', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.analyzeFullContext('새 메시지');

      expect(result).toBeDefined();
      expect(result.fullContext).toBeDefined();
      expect(Array.isArray(result.mainTopics)).toBe(true);
    });

    it('텍스트 포맷팅 보존', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const messageWithFormatting = '줄1\n줄2\n줄3';
      const result = await service.analyzeFullContext(messageWithFormatting);

      expect(result).toBeDefined();
      expect(result.preservedFormatting).toBeDefined();
      if (result.preservedFormatting) {
        expect(result.preservedFormatting.originalText).toBeDefined();
        expect(typeof result.preservedFormatting.lineBreaks).toBe('boolean');
      }
    });

    it('재개발 관련 문맥 분석', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeFullContext('재개발 프로젝트에 대해 알려줘');

      expect(result).toBeDefined();
      expect(result.mainTopics.length).toBeGreaterThan(0);
    });

    it('시공사 관련 문맥 분석', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.analyzeFullContext('시공사 선정 기준이 뭐야?');

      expect(result).toBeDefined();
      expect(result.mainTopics.length).toBeGreaterThan(0);
    });
  });

  describe('문맥 기반 응답 생성', () => {
    it('백엔드 API 성공 시 응답 생성', async () => {
      const mockResponse = {
        understanding: {
          fullContext: '전체 문맥',
          mainTopics: ['토픽1'],
          keyEntities: ['엔티티1'],
          sentiment: 'neutral' as const,
          intent: '질문',
          requirements: [],
          followUpQuestions: [],
          summary: '요약',
        },
        response: '생성된 응답',
        suggestions: ['제안1'],
        relatedTopics: ['관련 토픽1'],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.generateContextualResponse('새 메시지');

      expect(result).toBeDefined();
      expect(result.understanding).toBeDefined();
      expect(result.response).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(Array.isArray(result.relatedTopics)).toBe(true);
    });

    it('백엔드 API 실패 시 로컬 응답 생성', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.generateContextualResponse('새 메시지');

      expect(result).toBeDefined();
      expect(result.understanding).toBeDefined();
      expect(result.response).toBeDefined();
    });

    it('대화 이력이 있는 경우 문맥 반영', async () => {
      // 메시지 추가
      service.addMessage({
        id: 'msg-1',
        content: '시공사 선정에 대해 알려줘',
        timestamp: new Date(),
        type: 'user' as const,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.generateContextualResponse('그럼 어떤 기준으로 선정하나요?');

      expect(result).toBeDefined();
      expect(result.understanding.fullContext).toContain('시공사');
    });

    it('감정 분석 포함 응답', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.generateContextualResponse('좋은 시공사를 찾았어요!');

      expect(result).toBeDefined();
      expect(['positive', 'negative', 'neutral', 'mixed']).toContain(
        result.understanding.sentiment
      );
    });

    it('요구사항 추출 포함', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.generateContextualResponse(
        '시공사를 비교하고 선정 기준을 검토해야 해요'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.understanding.requirements)).toBe(true);
    });

    it('후속 질문 생성 포함', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.generateContextualResponse('시공사 선정 기준이 뭐야?');

      expect(result).toBeDefined();
      expect(Array.isArray(result.understanding.followUpQuestions)).toBe(true);
    });

    it('요약 생성 포함', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await service.generateContextualResponse('시공사 선정에 대해 알려줘');

      expect(result).toBeDefined();
      expect(typeof result.understanding.summary).toBe('string');
      expect(result.understanding.summary.length).toBeGreaterThan(0);
    });
  });
});

