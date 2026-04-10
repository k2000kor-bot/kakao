/**
 * advancedResponseGenerator 서비스 테스트
 * 고급 응답 생성 시스템 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import AdvancedResponseGenerator from '../advancedResponseGenerator';
import AdvancedMessageProcessor from '../advancedMessageProcessor';
import type { ResponseContext, RequirementResponse } from '../advancedResponseGenerator';

describe('AdvancedResponseGenerator', () => {
  let generator: AdvancedResponseGenerator;
  let messageProcessor: AdvancedMessageProcessor;

  beforeEach(async () => {
    generator = AdvancedResponseGenerator.getInstance();
    messageProcessor = AdvancedMessageProcessor.getInstance();
  });

  describe('싱글톤 패턴', () => {
    it('getInstance()를 통해 인스턴스를 가져올 수 있어야 함', () => {
      const instance1 = AdvancedResponseGenerator.getInstance();
      const instance2 = AdvancedResponseGenerator.getInstance();

      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
      expect(instance1).toBe(instance2); // 같은 인스턴스여야 함
    });

    it('인스턴스가 AdvancedResponseGenerator 타입이어야 함', () => {
      const instance = AdvancedResponseGenerator.getInstance();
      expect(instance).toBeInstanceOf(AdvancedResponseGenerator);
    });
  });

  describe('generateComprehensiveResponse', () => {
    it('기본 컨텍스트로 종합 응답을 생성할 수 있어야 함', async () => {
      const userMessage = '재개발 프로젝트를 분석해주세요';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [],
        projectContext: null,
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      expect(typeof result.mainResponse).toBe('string');
      expect(Array.isArray(result.detailedResponses)).toBe(true);
      expect(typeof result.summary).toBe('string');
      expect(Array.isArray(result.nextActions)).toBe(true);
      expect(Array.isArray(result.relatedTopics)).toBe(true);
      expect(Array.isArray(result.visualizations)).toBe(true);
    });

    it('복잡한 다요구사항 메시지에 대한 종합 응답을 생성할 수 있어야 함', async () => {
      const userMessage =
        '재개발 프로젝트의 시공사 선정 기준을 분석하고, 삼성물산과 대우건설의 제안서를 비교 분석해주세요. 그리고 최종 평가 보고서를 작성해주세요.';

      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [],
        projectContext: {
          type: 'redevelopment',
          stage: 'contractor_selection',
        },
        userPreferences: {},
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      expect(result.mainResponse.length).toBeGreaterThan(0);
      expect(result.detailedResponses.length).toBeGreaterThan(0);
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('파일 컨텍스트를 포함한 응답을 생성할 수 있어야 함', async () => {
      const userMessage = '첨부된 파일들을 분석해주세요';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [
          {
            type: 'document',
            topics: ['재개발', '시공사'],
            keywords: ['삼성물산', '대우건설'],
          },
          {
            type: 'image',
            topics: ['설계도', '건물'],
            keywords: ['건축', '구조'],
          },
        ],
        conversationHistory: [],
        projectContext: null,
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
      expect(result.relatedTopics.length).toBeGreaterThan(0);
    });

    it('대화 히스토리를 포함한 응답을 생성할 수 있어야 함', async () => {
      const userMessage = '이전 대화를 바탕으로 계속 진행해주세요';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [
          {
            topics: ['재개발', '프로젝트'],
            keywords: ['시공사', '선정'],
            timestamp: new Date(Date.now() - 60000).toISOString(),
          },
          {
            topics: ['시공사', '평가'],
            keywords: ['삼성물산', '비교'],
            timestamp: new Date(Date.now() - 30000).toISOString(),
          },
        ],
        projectContext: null,
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
    });

    it('프로젝트 컨텍스트를 포함한 응답을 생성할 수 있어야 함', async () => {
      const userMessage = '프로젝트 진행 상황을 분석해주세요';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [],
        projectContext: {
          type: 'redevelopment',
          stage: 'planning',
          goals: ['시공사 선정', '설계 완료'],
          constraints: ['예산 제한', '시간 제약'],
          timeline: '6개월',
        },
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
    });

    it('생성된 응답의 구조가 올바른 형식을 가져야 함', async () => {
      const userMessage = '테스트 메시지입니다';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [],
        projectContext: null,
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      // 메인 응답
      expect(typeof result.mainResponse).toBe('string');
      expect(result.mainResponse.length).toBeGreaterThan(0);

      // 상세 응답들
      expect(Array.isArray(result.detailedResponses)).toBe(true);
      result.detailedResponses.forEach((resp: RequirementResponse) => {
        expect(resp.requirement).toBeDefined();
        expect(typeof resp.response).toBe('string');
        expect(['low', 'medium', 'high', 'urgent']).toContain(resp.priority);
        expect(['basic', 'intermediate', 'advanced', 'expert']).toContain(
          resp.complexity
        );
        expect(typeof resp.estimatedTime).toBe('number');
        expect(resp.estimatedTime).toBeGreaterThan(0);
        expect(Array.isArray(resp.dependencies)).toBe(true);
        expect(Array.isArray(resp.alternatives)).toBe(true);
      });

      // 요약
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);

      // 다음 액션
      expect(Array.isArray(result.nextActions)).toBe(true);
      result.nextActions.forEach((action: string) => {
        expect(typeof action).toBe('string');
        expect(action.length).toBeGreaterThan(0);
      });

      // 관련 주제
      expect(Array.isArray(result.relatedTopics)).toBe(true);

      // 시각화 제안
      expect(Array.isArray(result.visualizations)).toBe(true);
      result.visualizations.forEach((viz) => {
        expect(['chart', 'table', 'diagram', 'timeline', 'mindmap']).toContain(viz.type);
        expect(viz.title).toBeDefined();
        expect(viz.description).toBeDefined();
        expect(viz.data).toBeDefined();
      });
    });

    it('시각화 제안이 올바른 형식을 가져야 함', async () => {
      const userMessage = '분석해주세요';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [],
        projectContext: null,
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result.visualizations.length).toBeGreaterThan(0);
      
      // 우선순위 분포 차트가 있어야 함
      const priorityChart = result.visualizations.find(
        (viz) => viz.title.includes('우선순위')
      );
      expect(priorityChart).toBeDefined();

      // 복잡도 분포 차트가 있어야 함
      const complexityChart = result.visualizations.find(
        (viz) => viz.title.includes('복잡도')
      );
      expect(complexityChart).toBeDefined();

      // 타임라인이 있어야 함
      const timeline = result.visualizations.find(
        (viz) => viz.type === 'timeline'
      );
      expect(timeline).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 복합 요청을 처리할 수 있어야 함', async () => {
      const userMessage =
        '샘플 재개발 프로젝트의 시공사 선정 기준을 분석하고, 삼성물산과 대우건설의 제안서를 비교 분석해주세요. 긴급하게 진행이 필요합니다.';

      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [
          {
            type: 'document',
            topics: ['제안서', '시공사'],
            keywords: ['삼성물산', '대우건설', '비교'],
          },
        ],
        conversationHistory: [
          {
            topics: ['재개발', '프로젝트'],
            keywords: ['재개발', '시공'],
            timestamp: new Date().toISOString(),
          },
        ],
        projectContext: {
          type: 'redevelopment',
          stage: 'contractor_selection',
          goals: ['최적 시공사 선정'],
          constraints: ['시간 제약'],
          timeline: '3개월',
        },
        userPreferences: {
          prefersDetailed: true,
          prefersTechnical: false,
        },
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      expect(result.mainResponse.length).toBeGreaterThan(0);
      expect(result.detailedResponses.length).toBeGreaterThan(0);
      expect(result.nextActions.length).toBeGreaterThan(0);
    });

    it('시공사 평가 시스템 개발 요청을 처리할 수 있어야 함', async () => {
      const userMessage =
        '시공사 평가 시스템을 설계하고, 프론트엔드와 백엔드 코드를 작성해주세요. 그리고 테스트까지 완료해주세요.';

      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [],
        projectContext: {
          type: 'development',
          stage: 'design',
          goals: ['평가 시스템 구축'],
          constraints: [],
          timeline: '2개월',
        },
        userPreferences: {},
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      expect(result.detailedResponses.length).toBeGreaterThan(0);
      expect(result.relatedTopics.length).toBeGreaterThan(0);
    });

    it('긴급 요청에 대한 응답을 생성할 수 있어야 함', async () => {
      const userMessage = '긴급하게 분석 결과를 요약해주세요';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [],
        projectContext: null,
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      
      // 긴급 요청에 대한 다음 액션이 포함되어야 함
      const urgentActions = result.nextActions.filter((action) =>
        action.includes('긴급') || action.includes('즉시')
      );
      expect(urgentActions.length).toBeGreaterThan(0);
    });

    it('전문가 수준 요청에 대한 응답을 생성할 수 있어야 함', async () => {
      const userMessage = '전문가 수준의 심화 분석을 수행해주세요';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [],
        conversationHistory: [],
        projectContext: null,
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      
      // 전문가 수준에 대한 다음 액션이 포함되어야 함
      const expertActions = result.nextActions.filter(
        (action) => action.includes('전문가') || action.includes('연구')
      );
      expect(expertActions.length).toBeGreaterThan(0);
    });

    it('이미지 파일이 포함된 컨텍스트에서 관련 주제를 추천할 수 있어야 함', async () => {
      const userMessage = '이미지를 분석해주세요';
      const processedMessage = await messageProcessor.processMessage(userMessage);

      const context: ResponseContext = {
        userMessage,
        processedMessage,
        uploadedFiles: [
          {
            type: 'image',
            topics: ['설계도'],
            keywords: ['건축', '구조'],
          },
        ],
        conversationHistory: [],
        projectContext: null,
        userPreferences: null,
      };

      const result = await generator.generateComprehensiveResponse(context);

      expect(result).toBeDefined();
      expect(result.relatedTopics.length).toBeGreaterThan(0);
      
      // 이미지 관련 주제가 포함되어야 함
      const imageRelatedTopics = result.relatedTopics.filter((topic) =>
        topic.includes('이미지') ||
        topic.includes('OCR') ||
        topic.includes('시각')
      );
      expect(imageRelatedTopics.length).toBeGreaterThan(0);
    });
  });
});

