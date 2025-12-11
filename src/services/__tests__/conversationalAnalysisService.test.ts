/**
 * ConversationalAnalysisService 테스트
 */

import {
  ConversationalAnalysisService,
  conversationalAnalysisService,
} from '../conversationalAnalysisService';

// 의존성 모킹
jest.mock('../advancedTextAnalysisService', () => ({
  advancedTextAnalysisService: {
    analyzeText: jest.fn(),
  },
}));

jest.mock('../integratedWritingService', () => ({
  integratedWritingService: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../masterWritingEngine', () => ({
  masterWritingEngine: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../politicalWritingEngine', () => ({
  politicalWritingEngine: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../generationWritingEngine', () => ({
  generationWritingEngine: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../stanceWritingEngine', () => ({
  stanceWritingEngine: {
    generateContent: jest.fn(),
  },
}));

jest.mock('../ultimateStyleCloningService', () => ({
  ultimateStyleCloningService: {
    cloneStyle: jest.fn(),
  },
}));

describe('ConversationalAnalysisService', () => {
  let service: ConversationalAnalysisService;

  beforeEach(() => {
    service = new ConversationalAnalysisService();
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(ConversationalAnalysisService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(conversationalAnalysisService).toBeDefined();
    });
  });

  describe('메시지 처리', () => {
    it('성향 분석 요청 처리', async () => {
      const request = {
        message: '참여자들의 성향을 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('편향 분석 요청 처리', async () => {
      const request = {
        message: '시공사에 대한 편향을 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('의견 분석 요청 처리', async () => {
      const request = {
        message: '의견을 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('통합 분석 요청 처리', async () => {
      const request = {
        message: '통합적으로 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('요약 요청 처리', async () => {
      const request = {
        message: '요약해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('텍스트 조작 요청 처리', async () => {
      const request = {
        message: '텍스트를 수정해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('서술적 분석 요청 처리', async () => {
      const request = {
        message: '서술적으로 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('연구 분석 요청 처리', async () => {
      const request = {
        message: '연구자 관점에서 분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });

    it('일반 질문 처리', async () => {
      const request = {
        message: '안녕하세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
      expect(response.content).toBeDefined();
    });

    it('컨텍스트 포함 요청 처리', async () => {
      const request = {
        message: '분석해주세요',
        roomId: 'room-1',
        context: {
          previousMessages: ['이전 메시지'],
        },
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
    });
  });

  describe('응답 구조', () => {
    it('응답에 필수 필드 포함', async () => {
      const request = {
        message: '분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      expect(response.type).toBeDefined();
      expect(response.content).toBeDefined();
      expect(typeof response.content).toBe('string');
    });

    it('제안사항 포함 가능', async () => {
      const request = {
        message: '분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      if (response.suggestions) {
        expect(Array.isArray(response.suggestions)).toBe(true);
      }
    });

    it('후속 질문 포함 가능', async () => {
      const request = {
        message: '분석해주세요',
      };

      const response = await service.processMessage(request);

      expect(response).toBeDefined();
      if (response.followUpQuestions) {
        expect(Array.isArray(response.followUpQuestions)).toBe(true);
      }
    });
  });
});

