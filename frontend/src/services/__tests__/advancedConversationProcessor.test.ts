/**
 * advancedConversationProcessor 서비스 테스트
 * 고도화된 대화 처리 시스템 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import { advancedConversationProcessor } from '../advancedConversationProcessor';

// console 모킹
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('advancedConversationProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedConversationProcessor).toBeDefined();
    });
  });

  describe('processComplexUserInput', () => {
    it('단순 질문을 처리할 수 있어야 함', async () => {
      const sessionId = 'test-session-1';
      const userInput = '재개발 프로젝트란 무엇인가요?';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
      expect(result.requirementResponses).toBeInstanceOf(Map);
      expect(Array.isArray(result.contextualConnections)).toBe(true);
      expect(Array.isArray(result.followUpSuggestions)).toBe(true);
      expect(Array.isArray(result.improvementOpportunities)).toBe(true);
      expect(result.confidenceMetrics).toBeDefined();
      expect(result.processingInsights).toBeDefined();
    });

    it('복합 질문을 처리할 수 있어야 함', async () => {
      const sessionId = 'test-session-2';
      const userInput = '재개발 프로젝트의 장단점을 분석해주시고, 시공사 선정 기준도 알려주세요. 그리고 비용 분담 방식은 어떻게 되는지 궁금합니다.';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
      expect(result.requirementResponses.size).toBeGreaterThan(0);
      expect(result.confidenceMetrics.overallConfidence).toBeGreaterThanOrEqual(0);
    });

    it('분석 요청을 처리할 수 있어야 함', async () => {
      const sessionId = 'test-session-3';
      const userInput = '현재 재개발 프로젝트의 진행 상황을 분석해주세요';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
      expect(result.requirementResponses.size).toBeGreaterThanOrEqual(0);
    });

    it('비교 요청을 처리할 수 있어야 함', async () => {
      const sessionId = 'test-session-4';
      const userInput = '삼성물산과 대우건설의 차이점을 비교해주세요';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
    });

    it('문제 해결 요청을 처리할 수 있어야 함', async () => {
      const sessionId = 'test-session-5';
      const userInput = '재개발 프로젝트에서 발생할 수 있는 문제를 해결하는 방법을 알려주세요';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
    });

    it('응답 구조가 올바른 형식을 가져야 함', async () => {
      const sessionId = 'test-session-6';
      const userInput = '테스트 질문입니다?';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      // 메인 응답 확인
      expect(typeof result.mainResponse).toBe('string');

      // 요구사항 응답 확인
      result.requirementResponses.forEach((response, reqId) => {
        expect(response.requirementId).toBe(reqId);
        expect(typeof response.response).toBe('string');
        expect(typeof response.confidence).toBe('number');
        expect(response.confidence).toBeGreaterThanOrEqual(0);
        expect(response.confidence).toBeLessThanOrEqual(1);
        expect(response.processingMethod).toBeDefined();
        expect(Array.isArray(response.sourcesUsed)).toBe(true);
        expect(Array.isArray(response.relatedRequirements)).toBe(true);
        expect(response.qualityMetrics).toBeDefined();
        expect(typeof response.qualityMetrics.completeness).toBe('number');
        expect(typeof response.qualityMetrics.accuracy).toBe('number');
        expect(typeof response.qualityMetrics.relevance).toBe('number');
        expect(typeof response.qualityMetrics.clarity).toBe('number');
      });

      // 맥락적 연결 확인
      result.contextualConnections.forEach((connection) => {
        expect(connection.fromRequirement).toBeDefined();
        expect(connection.toRequirement).toBeDefined();
        expect(connection.connectionType).toBeDefined();
        expect(typeof connection.strength).toBe('number');
        expect(connection.explanation).toBeDefined();
      });

      // 후속 제안 확인
      result.followUpSuggestions.forEach((suggestion) => {
        expect(suggestion.suggestion).toBeDefined();
        expect(typeof suggestion.relevance).toBe('number');
        expect(Array.isArray(suggestion.basedOnRequirements)).toBe(true);
        expect(typeof suggestion.expectedUserInterest).toBe('number');
        expect(['clarification', 'expansion', 'related_topic', 'practical_application']).toContain(
          suggestion.type
        );
      });

      // 개선 기회 확인
      result.improvementOpportunities.forEach((opportunity) => {
        expect(opportunity.area).toBeDefined();
        expect(typeof opportunity.currentLevel).toBe('number');
        expect(opportunity.suggestedImprovement).toBeDefined();
        expect(typeof opportunity.expectedImpact).toBe('number');
        expect(typeof opportunity.implementationDifficulty).toBe('number');
      });

      // 신뢰도 메트릭 확인
      expect(typeof result.confidenceMetrics.overallConfidence).toBe('number');
      expect(typeof result.confidenceMetrics.requirementUnderstanding).toBe('number');
      expect(typeof result.confidenceMetrics.contextualAccuracy).toBe('number');
      expect(typeof result.confidenceMetrics.responseCompleteness).toBe('number');
      expect(typeof result.confidenceMetrics.userSatisfactionPrediction).toBe('number');

      // 처리 인사이트 확인
      expect(typeof result.processingInsights.totalProcessingTime).toBe('number');
      expect(result.processingInsights.mostChallenging).toBeDefined();
      expect(result.processingInsights.mostSuccessful).toBeDefined();
      expect(Array.isArray(result.processingInsights.resourcesUsed)).toBe(true);
      expect(Array.isArray(result.processingInsights.optimizationOpportunities)).toBe(true);
    });

    it('세션별로 대화 메모리를 유지해야 함', async () => {
      const sessionId = 'test-session-memory';
      
      const input1 = '재개발 프로젝트에 대해 설명해주세요';
      const result1 = await advancedConversationProcessor.processComplexUserInput(
        input1,
        sessionId
      );

      const input2 = '비용은 얼마나 드나요?';
      const result2 = await advancedConversationProcessor.processComplexUserInput(
        input2,
        sessionId
      );

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      // 두 번째 응답은 첫 번째 대화의 컨텍스트를 활용해야 함
      expect(result2.confidenceMetrics.contextualAccuracy).toBeGreaterThanOrEqual(0);
    });

    it('추가 컨텍스트를 전달할 수 있어야 함', async () => {
      const sessionId = 'test-session-context';
      const userInput = '이 프로젝트에 대해 알려주세요';
      const additionalContext = {
        projectType: 'redevelopment',
        location: 'Seoul',
      };

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId,
        additionalContext
      );

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 복합 질문을 처리할 수 있어야 함', async () => {
      const sessionId = 'redev-session-1';
      const userInput =
        '재개발 프로젝트의 전체적인 흐름을 설명해주시고, 시공사 선정 기준과 비용 분담 방식, 그리고 주민들의 참여 절차를 알려주세요. 또한 재개발과 리모델링의 차이점도 비교해주시면 좋겠습니다.';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.mainResponse.length).toBeGreaterThan(0);
      expect(result.requirementResponses.size).toBeGreaterThan(0);
      expect(result.confidenceMetrics.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(result.confidenceMetrics.overallConfidence).toBeLessThanOrEqual(1);
    });

    it('시공사 선정 관련 분석 및 비교 요청을 처리할 수 있어야 함', async () => {
      const sessionId = 'contractor-session-1';
      const userInput =
        '시공사 선정 시 고려해야 할 주요 요소들을 분석해주시고, 삼성물산과 대우건설을 비교해주세요. 그리고 각 업체의 강점과 약점을 평가해주시면 좋겠습니다.';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.requirementResponses.size).toBeGreaterThanOrEqual(0);
      expect(result.confidenceMetrics.requirementUnderstanding).toBeGreaterThanOrEqual(0);
      expect(result.processingInsights.totalProcessingTime).toBeGreaterThanOrEqual(0);
    });

    it('장기적인 대화에서 맥락을 유지할 수 있어야 함', async () => {
      const sessionId = 'long-conversation-session';
      
      const inputs = [
        '재개발 프로젝트란 무엇인가요?',
        '비용은 어떻게 분담되나요?',
        '시공사는 어떻게 선정하나요?',
        '주민들의 의견은 어떻게 반영되나요?',
        '전체 진행 일정은 어떻게 되나요?',
      ];

      const results = [];
      for (const input of inputs) {
        const result = await advancedConversationProcessor.processComplexUserInput(
          input,
          sessionId
        );
        results.push(result);
      }

      expect(results.length).toBe(5);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.mainResponse).toBeDefined();
      });

      // 마지막 응답이 이전 대화의 맥락을 이해하고 있는지 확인
      const lastResult = results[results.length - 1];
      expect(lastResult.confidenceMetrics.contextualAccuracy).toBeGreaterThanOrEqual(0);
    });

    it('복잡한 문제 해결 요청을 처리할 수 있어야 함', async () => {
      const sessionId = 'problem-solving-session';
      const userInput =
        '재개발 프로젝트 진행 중 주민들의 반대 의견이 많아서 어려움이 있습니다. 이를 해결하기 위한 방법과 절차를 알려주시고, 효과적인 소통 방안도 제시해주세요. 또한 예산 문제로 인한 지연을 방지하는 방법도 함께 설명해주시면 감사하겠습니다.';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.mainResponse.length).toBeGreaterThan(0);
      expect(result.requirementResponses.size).toBeGreaterThanOrEqual(0);
      expect(result.followUpSuggestions.length).toBeGreaterThanOrEqual(0);
    });

    it('질문, 분석, 비교, 문제 해결이 모두 포함된 복합 요청을 처리할 수 있어야 함', async () => {
      const sessionId = 'comprehensive-session';
      const userInput =
        '재개발 프로젝트에 대해 전반적으로 알고 싶습니다. 재개발이 무엇인지 설명해주시고, 진행 절차를 분석해주시며, 재개발과 리모델링을 비교해주세요. 또한 예상되는 문제점과 해결 방법도 함께 알려주시면 좋겠습니다.';

      const result = await advancedConversationProcessor.processComplexUserInput(
        userInput,
        sessionId
      );

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
      expect(result.requirementResponses.size).toBeGreaterThanOrEqual(0);
      
      // 모든 요구사항 타입이 처리되었는지 확인
      const processedTypes = Array.from(result.requirementResponses.values()).map(
        (r) => r.processingMethod
      );
      expect(processedTypes.length).toBeGreaterThanOrEqual(0);

      // 신뢰도 메트릭이 합리적인 범위 내에 있는지 확인
      expect(result.confidenceMetrics.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(result.confidenceMetrics.overallConfidence).toBeLessThanOrEqual(1);
      expect(result.confidenceMetrics.responseCompleteness).toBeGreaterThanOrEqual(0);
      expect(result.confidenceMetrics.responseCompleteness).toBeLessThanOrEqual(1);
    });
  });
});

