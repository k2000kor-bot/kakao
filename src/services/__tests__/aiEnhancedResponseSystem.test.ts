/**
 * AIEnhancedResponseSystem 테스트
 */

import {
  AIEnhancedResponseSystem,
  ResponseEnhancementRequest,
  EnhancedResponse,
  AIEnhancementConfig,
} from '../aiEnhancedResponseSystem';

describe('AIEnhancedResponseSystem', () => {
  let system: AIEnhancedResponseSystem;

  beforeEach(() => {
    system = new AIEnhancedResponseSystem({
      model: 'gpt-4-turbo',
      maxTokens: 2000,
      temperature: 0.7,
      enableMultiStageProcessing: true,
      enableContextLearning: true,
      enableIterativeRefinement: true,
      qualityThreshold: 0.8,
    });
  });

  describe('초기화', () => {
    it('기본 설정으로 초기화', () => {
      const defaultSystem = new AIEnhancedResponseSystem();
      expect(defaultSystem).toBeInstanceOf(AIEnhancedResponseSystem);
    });

    it('커스텀 설정으로 초기화', () => {
      const customSystem = new AIEnhancedResponseSystem({
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.5,
        enableMultiStageProcessing: false,
      });
      expect(customSystem).toBeInstanceOf(AIEnhancedResponseSystem);
    });
  });

  describe('응답 향상', () => {
    const baseRequest: ResponseEnhancementRequest = {
      originalQuestion: 'React에서 상태 관리는 어떻게 하나요?',
      initialResponse: 'useState 훅을 사용합니다.',
      conversationHistory: [],
      userProfile: {
        expertise: 'beginner',
        preferences: {},
        learningGoals: ['React 기초'],
      },
      contextualData: {},
      enhancementGoals: ['clarity', 'completeness'],
    };

    it('응답 향상 수행', async () => {
      const result = await system.enhanceResponse(baseRequest);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe('string');
      expect(result.enhancements).toBeDefined();
      expect(result.qualityMetrics).toBeDefined();
      expect(result.followUpStrategy).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('향상된 응답 구조 확인', async () => {
      const result = await system.enhanceResponse(baseRequest);

      expect(result.enhancements.stage1_analysis).toBeDefined();
      expect(result.enhancements.stage2_enrichment).toBeDefined();
      expect(result.enhancements.stage3_personalization).toBeDefined();
      expect(result.enhancements.stage4_validation).toBeDefined();
      expect(result.enhancements.final_polish).toBeDefined();
    });

    it('품질 메트릭 확인', async () => {
      const result = await system.enhanceResponse(baseRequest);

      expect(typeof result.qualityMetrics.relevance).toBe('number');
      expect(typeof result.qualityMetrics.completeness).toBe('number');
      expect(typeof result.qualityMetrics.clarity).toBe('number');
      expect(typeof result.qualityMetrics.actionability).toBe('number');
      expect(typeof result.qualityMetrics.personalization).toBe('number');
      expect(typeof result.qualityMetrics.overall).toBe('number');

      // 메트릭 값 범위 확인
      expect(result.qualityMetrics.relevance).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.relevance).toBeLessThanOrEqual(1);
      expect(result.qualityMetrics.completeness).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.completeness).toBeLessThanOrEqual(1);
      expect(result.qualityMetrics.clarity).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.clarity).toBeLessThanOrEqual(1);
      expect(result.qualityMetrics.actionability).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.actionability).toBeLessThanOrEqual(1);
      expect(result.qualityMetrics.personalization).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.personalization).toBeLessThanOrEqual(1);
      expect(result.qualityMetrics.overall).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.overall).toBeLessThanOrEqual(1);
    });

    it('후속 전략 생성 확인', async () => {
      const result = await system.enhanceResponse(baseRequest);

      expect(Array.isArray(result.followUpStrategy.anticipatedQuestions)).toBe(true);
      expect(Array.isArray(result.followUpStrategy.deeperTopics)).toBe(true);
      expect(Array.isArray(result.followUpStrategy.practicalNextSteps)).toBe(true);
      expect(Array.isArray(result.followUpStrategy.learningPath)).toBe(true);
    });

    it('메타데이터 확인', async () => {
      const result = await system.enhanceResponse(baseRequest);

      expect(typeof result.metadata.processingStages).toBe('number');
      expect(typeof result.metadata.totalProcessingTime).toBe('number');
      expect(typeof result.metadata.confidenceScore).toBe('number');
      expect(Array.isArray(result.metadata.improvementAreas)).toBe(true);

      expect(result.metadata.processingStages).toBeGreaterThan(0);
      expect(result.metadata.totalProcessingTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.metadata.confidenceScore).toBeLessThanOrEqual(1);
    });

    it('대화 히스토리가 있는 요청 처리', async () => {
      const requestWithHistory: ResponseEnhancementRequest = {
        ...baseRequest,
        conversationHistory: [
          {
            role: 'user',
            content: 'React는 무엇인가요?',
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            content: 'React는 UI 라이브러리입니다.',
            timestamp: new Date(),
          },
        ],
      };

      const result = await system.enhanceResponse(requestWithHistory);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('고급 사용자 프로필로 향상', async () => {
      const advancedRequest: ResponseEnhancementRequest = {
        ...baseRequest,
        userProfile: {
          expertise: 'expert',
          preferences: { detailed: true, technical: true },
          learningGoals: ['고급 패턴', '최적화'],
        },
      };

      const result = await system.enhanceResponse(advancedRequest);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('컨텍스트 데이터가 있는 요청 처리', async () => {
      const requestWithContext: ResponseEnhancementRequest = {
        ...baseRequest,
        contextualData: {
          projectInfo: { name: '테스트 프로젝트', type: 'web' },
          fileAnalysis: { files: ['App.js', 'index.js'] },
        },
      };

      const result = await system.enhanceResponse(requestWithContext);
      expect(result).toBeDefined();
    });
  });

  describe('후속 질문 처리', () => {
    it('후속 질문 처리', async () => {
      const originalRequest: ResponseEnhancementRequest = {
        originalQuestion: 'React란?',
        initialResponse: 'React는 UI 라이브러리입니다.',
        conversationHistory: [],
        userProfile: {
          expertise: 'beginner',
          preferences: {},
          learningGoals: [],
        },
        contextualData: {},
        enhancementGoals: [],
      };

      const originalResponse = await system.enhanceResponse(originalRequest);

      const followUpResponse = await system.handleFollowUpQuestion(
        originalResponse,
        '그럼 Vue와는 어떤 차이가 있나요?',
        {
          conversationHistory: [
            { role: 'user', content: 'React란?', timestamp: new Date() },
            { role: 'assistant', content: originalResponse.content, timestamp: new Date() },
          ],
          userProfile: originalRequest.userProfile,
        }
      );

      expect(followUpResponse).toBeDefined();
      expect(followUpResponse.content).toBeDefined();
      expect(followUpResponse.qualityMetrics).toBeDefined();
    });

    it('빈 컨텍스트로 후속 질문 처리', async () => {
      const originalResponse: EnhancedResponse = {
        content: '테스트 응답',
        enhancements: {
          stage1_analysis: '분석',
          stage2_enrichment: '강화',
          stage3_personalization: '개인화',
          stage4_validation: '검증',
          final_polish: '다듬기',
        },
        qualityMetrics: {
          relevance: 0.8,
          completeness: 0.7,
          clarity: 0.9,
          actionability: 0.8,
          personalization: 0.7,
          overall: 0.78,
        },
        followUpStrategy: {
          anticipatedQuestions: [],
          deeperTopics: [],
          practicalNextSteps: [],
          learningPath: [],
        },
        metadata: {
          processingStages: 5,
          totalProcessingTime: 1000,
          confidenceScore: 0.78,
          improvementAreas: [],
        },
      };

      const result = await system.handleFollowUpQuestion(
        originalResponse,
        '추가 질문',
        {}
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('다양한 질문 타입', () => {
    it('기술 질문 향상', async () => {
      const request: ResponseEnhancementRequest = {
        originalQuestion: 'TypeScript의 제네릭은 어떻게 사용하나요?',
        initialResponse: '제네릭은 타입을 매개변수로 받습니다.',
        conversationHistory: [],
        userProfile: {
          expertise: 'intermediate',
          preferences: {},
          learningGoals: ['TypeScript'],
        },
        contextualData: {},
        enhancementGoals: ['clarity', 'examples'],
      };

      const result = await system.enhanceResponse(request);
      expect(result).toBeDefined();
      expect(result.content.length).toBeGreaterThan(request.initialResponse.length);
    });

    it('개념 질문 향상', async () => {
      const request: ResponseEnhancementRequest = {
        originalQuestion: '비동기 프로그래밍이란?',
        initialResponse: '비동기는 동시에 여러 작업을 처리합니다.',
        conversationHistory: [],
        userProfile: {
          expertise: 'beginner',
          preferences: {},
          learningGoals: ['JavaScript'],
        },
        contextualData: {},
        enhancementGoals: ['simplicity', 'examples'],
      };

      const result = await system.enhanceResponse(request);
      expect(result).toBeDefined();
    });

    it('실무 질문 향상', async () => {
      const request: ResponseEnhancementRequest = {
        originalQuestion: '프로덕션 환경에서 에러 처리는 어떻게 하나요?',
        initialResponse: 'try-catch를 사용합니다.',
        conversationHistory: [],
        userProfile: {
          expertise: 'advanced',
          preferences: { practical: true },
          learningGoals: ['프로덕션 배포'],
        },
        contextualData: {
          projectInfo: { environment: 'production' },
        },
        enhancementGoals: ['practical', 'best-practices'],
      };

      const result = await system.enhanceResponse(request);
      expect(result).toBeDefined();
      expect(result.qualityMetrics.actionability).toBeGreaterThan(0);
    });
  });

  describe('설정 변경', () => {
    it('다단계 처리 비활성화', async () => {
      const simpleSystem = new AIEnhancedResponseSystem({
        enableMultiStageProcessing: false,
      });

      const request: ResponseEnhancementRequest = {
        originalQuestion: '테스트 질문',
        initialResponse: '테스트 응답',
        conversationHistory: [],
        userProfile: {
          expertise: 'beginner',
          preferences: {},
          learningGoals: [],
        },
        contextualData: {},
        enhancementGoals: [],
      };

      const result = await simpleSystem.enhanceResponse(request);
      expect(result).toBeDefined();
    });

    it('낮은 품질 임계값 설정', async () => {
      const lowThresholdSystem = new AIEnhancedResponseSystem({
        qualityThreshold: 0.5,
      });

      const request: ResponseEnhancementRequest = {
        originalQuestion: '테스트',
        initialResponse: '응답',
        conversationHistory: [],
        userProfile: {
          expertise: 'beginner',
          preferences: {},
          learningGoals: [],
        },
        contextualData: {},
        enhancementGoals: [],
      };

      const result = await lowThresholdSystem.enhanceResponse(request);
      expect(result).toBeDefined();
    });
  });

  describe('에러 처리', () => {
    it('에러 발생 시 폴백 응답 생성', async () => {
      // 에러를 유발하기 위해 잘못된 요청 생성
      const invalidRequest: any = {
        originalQuestion: null,
        initialResponse: null,
      };

      const result = await system.enhanceResponse(invalidRequest as ResponseEnhancementRequest);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.metadata.confidenceScore).toBeLessThan(1);
    });
  });

  describe('인스턴스 확인', () => {
    it('클래스 인스턴스 확인', () => {
      expect(system).toBeInstanceOf(AIEnhancedResponseSystem);
    });
  });
});

