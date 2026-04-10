/**
 * IntelligentResponseService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  IntelligentResponseService,
  intelligentResponseService,
} from '../intelligentResponseService';

describe('IntelligentResponseService', () => {
  let service: IntelligentResponseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IntelligentResponseService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(IntelligentResponseService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(intelligentResponseService).toBeDefined();
      expect(intelligentResponseService).toBeInstanceOf(IntelligentResponseService);
    });
  });

  describe('스마트 응답 생성', () => {
    it('비교 의도 분석 및 응답 생성', async () => {
      const response = await service.generateSmartResponse('비교 분석해줘');

      expect(response).toBeDefined();
      expect(response.type).toBe('analysis');
      expect(response.content).toContain('비교');
      expect(response.confidence).toBeGreaterThan(0);
    });

    it('트렌드 의도 분석 및 응답 생성', async () => {
      const response = await service.generateSmartResponse('트렌드 분석');

      expect(response).toBeDefined();
      expect(response.content).toContain('트렌드');
      expect(response.actionButtons).toBeDefined();
    });

    it('인사이트 의도 분석 및 응답 생성', async () => {
      const response = await service.generateSmartResponse('인사이트 찾아줘');

      expect(response).toBeDefined();
      expect(response.type).toBe('insight');
      expect(response.content).toContain('인사이트');
    });

    it('추천 의도 분석 및 응답 생성', async () => {
      const response = await service.generateSmartResponse('추천해줘');

      expect(response).toBeDefined();
      expect(response.type).toBe('suggestion');
      expect(response.content).toContain('추천');
    });

    it('기본 응답 생성', async () => {
      const response = await service.generateSmartResponse('일반 메시지');

      expect(response).toBeDefined();
      expect(response.type).toBe('suggestion');
      expect(response.content).toBeTruthy();
    });
  });

  describe('비교 분석 응답', () => {
    it('비교 응답에 액션 버튼 포함', async () => {
      const response = await service.generateSmartResponse('비교해줘');

      expect(response.actionButtons).toBeDefined();
      expect(response.actionButtons?.length).toBeGreaterThan(0);
      if (response.actionButtons) {
        expect(response.actionButtons[0]).toHaveProperty('label');
        expect(response.actionButtons[0]).toHaveProperty('action');
      }
    });

    it('비교 응답에 관련 질문 포함', async () => {
      const response = await service.generateSmartResponse('비교');

      expect(response.relatedQuestions).toBeDefined();
      expect(Array.isArray(response.relatedQuestions)).toBe(true);
    });
  });

  describe('트렌드 분석 응답', () => {
    it('트렌드 응답 구조 확인', async () => {
      const response = await service.generateSmartResponse('변화 트렌드');

      expect(response.type).toBe('analysis');
      expect(response.content).toContain('트렌드');
      expect(response.actionButtons).toBeDefined();
    });

    it('트렌드 응답에 액션 버튼 포함', async () => {
      const response = await service.generateSmartResponse('트렌드');

      expect(response.actionButtons?.length).toBeGreaterThan(0);
    });
  });

  describe('인사이트 응답', () => {
    it('인사이트 응답 구조 확인', async () => {
      const response = await service.generateSmartResponse('통찰');

      expect(response.type).toBe('insight');
      expect(response.content).toContain('인사이트');
    });

    it('인사이트 응답에 액션 버튼 포함', async () => {
      const response = await service.generateSmartResponse('발견');

      expect(response.actionButtons).toBeDefined();
      expect(response.actionButtons?.length).toBeGreaterThan(0);
    });
  });

  describe('추천 응답', () => {
    it('추천 응답 구조 확인', async () => {
      const response = await service.generateSmartResponse('제안해줘');

      expect(response.type).toBe('suggestion');
      expect(response.content).toContain('추천');
    });

    it('추천 응답에 액션 버튼 포함', async () => {
      const response = await service.generateSmartResponse('조언');

      expect(response.actionButtons).toBeDefined();
      expect(response.actionButtons?.length).toBeGreaterThan(0);
    });
  });

  describe('응답 구조', () => {
    it('응답에 모든 필수 필드 포함', async () => {
      const response = await service.generateSmartResponse('테스트');

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('type');
      expect(response).toHaveProperty('confidence');
      expect(typeof response.content).toBe('string');
      expect(typeof response.confidence).toBe('number');
      expect(['analysis', 'suggestion', 'insight', 'warning']).toContain(response.type);
    });

    it('신뢰도 범위 확인', async () => {
      const response = await service.generateSmartResponse('테스트');

      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('의도 분석 패턴', () => {
    it('비교 패턴 인식', async () => {
      const messages = ['비교', '차이', 'vs', '대비'];

      for (const message of messages) {
        const response = await service.generateSmartResponse(message);
        expect(response.content).toContain('비교');
      }
    });

    it('트렌드 패턴 인식', async () => {
      const messages = ['변화', '트렌드', '흐름', '패턴'];

      for (const message of messages) {
        const response = await service.generateSmartResponse(message);
        expect(response.type).toBe('analysis');
      }
    });

    it('인사이트 패턴 인식', async () => {
      const messages = ['인사이트', '통찰', '발견', '특이점'];

      for (const message of messages) {
        const response = await service.generateSmartResponse(message);
        expect(response.type).toBe('insight');
      }
    });

    it('추천 패턴 인식', async () => {
      const messages = ['추천', '제안', '조언', '방법'];

      for (const message of messages) {
        const response = await service.generateSmartResponse(message);
        expect(response.type).toBe('suggestion');
      }
    });
  });

  describe('컨텍스트 처리', () => {
    it('컨텍스트와 함께 응답 생성', async () => {
      const context = { projectId: 'project-1' };
      const response = await service.generateSmartResponse('테스트', context);

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
    });

    it('컨텍스트 없이 응답 생성', async () => {
      const response = await service.generateSmartResponse('테스트');

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
    });
  });

  describe('액션 버튼', () => {
    it('액션 버튼 구조 확인', async () => {
      const response = await service.generateSmartResponse('비교');

      if (response.actionButtons) {
        response.actionButtons.forEach(button => {
          expect(button).toHaveProperty('label');
          expect(button).toHaveProperty('action');
          expect(typeof button.label).toBe('string');
          expect(typeof button.action).toBe('string');
        });
      }
    });

    it('모든 응답 타입에 액션 버튼 포함', async () => {
      const messages = ['비교', '트렌드', '인사이트', '추천', '일반'];

      for (const message of messages) {
        const response = await service.generateSmartResponse(message);
        expect(response.actionButtons).toBeDefined();
        if (response.actionButtons) {
          expect(response.actionButtons.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('관련 질문', () => {
    it('비교 응답에 관련 질문 포함', async () => {
      const response = await service.generateSmartResponse('비교');

      expect(response.relatedQuestions).toBeDefined();
      if (response.relatedQuestions) {
        expect(response.relatedQuestions.length).toBeGreaterThan(0);
        response.relatedQuestions.forEach(question => {
          expect(typeof question).toBe('string');
        });
      }
    });
  });

  describe('복합 의도', () => {
    it('여러 키워드 포함 메시지 처리', async () => {
      const response = await service.generateSmartResponse('비교 트렌드 분석');

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
    });

    it('긴 메시지 처리', async () => {
      const longMessage = '이 프로젝트의 변화 트렌드를 분석하고 비교해서 인사이트를 찾아주세요';
      const response = await service.generateSmartResponse(longMessage);

      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
    });
  });
});

