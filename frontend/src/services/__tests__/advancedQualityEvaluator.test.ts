/**
 * advancedQualityEvaluator 서비스 테스트
 * 고급 품질 평가 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedQualityEvaluator from '../advancedQualityEvaluator';
import { Message } from '../../types/chat';

describe('advancedQualityEvaluator', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedQualityEvaluator).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedQualityEvaluator;
      const instance2 = advancedQualityEvaluator;
      expect(instance1).toBe(instance2);
    });
  });

  describe('evaluateResponseQuality', () => {
    const createMockMessage = (content: string, role: 'user' | 'assistant' = 'user'): Message => ({
      id: `msg_${Date.now()}_${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      isUser: role === 'user'
    });

    it('응답 품질을 평가할 수 있어야 함', async () => {
      const response = '재개발 프로젝트의 시공사 선정은 기술력, 안전성, 경험을 종합적으로 고려해야 합니다.';
      const userInput = '시공사 선정 기준은 무엇인가요?';
      const context = {
        conversationHistory: [createMockMessage(userInput)],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result).toBeDefined();
      expect(result.qualityMetrics).toBeDefined();
      expect(result.qualityMetrics.overall).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.overall).toBeLessThanOrEqual(100);
      expect(result.qualityMetrics.confidence).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.confidence).toBeLessThanOrEqual(1);
    });

    it('품질 차원을 모두 평가해야 함', async () => {
      const response = '재개발 프로젝트에 대한 답변입니다.';
      const userInput = '재개발 프로젝트에 대해 알려주세요.';
      const context = {
        conversationHistory: [],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result.qualityMetrics.relevance).toBeDefined();
      expect(result.qualityMetrics.accuracy).toBeDefined();
      expect(result.qualityMetrics.completeness).toBeDefined();
      expect(result.qualityMetrics.clarity).toBeDefined();
      expect(result.qualityMetrics.helpfulness).toBeDefined();
      expect(result.qualityMetrics.coherence).toBeDefined();
      expect(result.qualityMetrics.creativity).toBeDefined();
      expect(result.qualityMetrics.technicalDepth).toBeDefined();
    });

    it('각 품질 차원에 점수와 제안이 있어야 함', async () => {
      const response = '시공사 선정 기준은 기술력, 안전성, 경험입니다.';
      const userInput = '시공사 선정 기준은?';
      const context = {
        conversationHistory: [],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result.qualityMetrics.relevance.score).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.relevance.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.qualityMetrics.relevance.suggestions)).toBe(true);
    });

    it('개선사항을 분석해야 함', async () => {
      const response = '짧은 답변입니다.';
      const userInput = '재개발 프로젝트에 대해 자세히 설명해주세요.';
      const context = {
        conversationHistory: [],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(Array.isArray(result.improvements)).toBe(true);
      if (result.improvements.length > 0) {
        const improvement = result.improvements[0];
        expect(improvement).toHaveProperty('dimension');
        expect(improvement).toHaveProperty('currentScore');
        expect(improvement).toHaveProperty('targetScore');
        expect(Array.isArray(improvement.suggestions)).toBe(true);
        expect(['high', 'medium', 'low']).toContain(improvement.priority);
      }
    });

    it('강점과 약점을 식별해야 함', async () => {
      const response = '재개발 프로젝트는 복잡한 과정을 거칩니다. 시공사 선정은 기술력, 안전성, 경험을 종합적으로 평가해야 합니다. 전문가의 조언을 구하는 것이 좋습니다.';
      const userInput = '재개발 프로젝트 시공사 선정에 대해 알려주세요.';
      const context = {
        conversationHistory: [],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(Array.isArray(result.strengths)).toBe(true);
      expect(Array.isArray(result.weaknesses)).toBe(true);
    });

    it('권장사항을 제공해야 함', async () => {
      const response = '재개발 프로젝트입니다.';
      const userInput = '재개발 프로젝트에 대해 자세히 설명해주세요.';
      const context = {
        conversationHistory: [],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('대화 기록을 고려해야 함', async () => {
      const response = '시공사 선정 기준은 기술력, 안전성, 경험입니다.';
      const userInput = '시공사 선정 기준은?';
      const context = {
        conversationHistory: [
          createMockMessage('재개발 프로젝트에 대해 알고 싶습니다.'),
          createMockMessage('재개발 프로젝트는...', 'assistant'),
          createMockMessage('시공사 선정은 어떻게 하나요?')
        ],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result).toBeDefined();
      expect(result.qualityMetrics.coherence).toBeDefined();
    });

    it('프로젝트 컨텍스트를 고려해야 함', async () => {
      const response = '샘플 재개발 프로젝트의 시공사 선정은 중요합니다.';
      const userInput = '시공사 선정에 대해 알려주세요.';
      const context = {
        conversationHistory: [],
        projectContext: {
          projectName: '샘플 재개발',
          projectType: 'redevelopment'
        },
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result).toBeDefined();
      expect(result.qualityMetrics.relevance).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    const createMockMessage = (content: string, role: 'user' | 'assistant' = 'user'): Message => ({
      id: `msg_${Date.now()}_${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
      isUser: role === 'user'
    });

    it('재개발 프로젝트 관련 응답의 품질을 평가할 수 있어야 함', async () => {
      const response = '샘플 재개발 프로젝트의 시공사 선정은 매우 중요한 결정입니다. 기술력, 안전성, 경험, 경제성을 종합적으로 평가해야 합니다. 대우건설은 뛰어난 기술력과 체계적인 안전 관리 시스템을 보유하고 있어 우수한 후보입니다.';
      const userInput = '샘플 재개발 프로젝트 시공사 선정에 대해 알려주세요.';
      const context = {
        conversationHistory: [],
        projectContext: {
          projectName: '샘플 재개발',
          projectType: 'redevelopment'
        },
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result).toBeDefined();
      expect(result.qualityMetrics.overall).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.relevance.score).toBeGreaterThanOrEqual(0);
      expect(result.qualityMetrics.completeness.score).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 기준 관련 응답의 품질을 평가할 수 있어야 함', async () => {
      const response = '시공사 선정 기준은 다음과 같습니다. 첫째, 기술력이 우수해야 합니다. 둘째, 안전 관리 시스템이 체계적이어야 합니다. 셋째, 비슷한 규모의 프로젝트 경험이 있어야 합니다.';
      const userInput = '시공사 선정 기준은 무엇인가요?';
      const context = {
        conversationHistory: [
          createMockMessage('재개발 프로젝트에 대해 알고 싶습니다.')
        ],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result).toBeDefined();
      expect(result.qualityMetrics.clarity).toBeDefined();
      expect(result.qualityMetrics.helpfulness).toBeDefined();
      expect(Array.isArray(result.strengths)).toBe(true);
    });

    it('복합적인 질문에 대한 응답의 품질을 평가할 수 있어야 함', async () => {
      const response = '재개발 프로젝트의 시공사 선정 과정과 평가 기준을 분석하면, 기술력 평가, 안전성 검토, 경험 분석, 경제성 평가 등이 포함됩니다. 각 항목을 종합적으로 고려하여 최종 결정을 내립니다.';
      const userInput = '재개발 프로젝트 시공사 선정 과정과 평가 기준을 분석해주세요.';
      const context = {
        conversationHistory: [],
        projectContext: {
          projectName: '샘플 재개발'
        },
        userPreferences: {
          detailLevel: 'high'
        }
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result).toBeDefined();
      expect(result.qualityMetrics.completeness).toBeDefined();
      expect(result.qualityMetrics.technicalDepth).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('짧은 응답의 품질을 평가할 수 있어야 함', async () => {
      const response = '시공사 선정은 중요합니다.';
      const userInput = '시공사 선정에 대해 자세히 설명해주세요.';
      const context = {
        conversationHistory: [],
        projectContext: {},
        userPreferences: {}
      };

      const result = await advancedQualityEvaluator.evaluateResponseQuality(
        response,
        userInput,
        context
      );

      expect(result).toBeDefined();
      expect(result.qualityMetrics.completeness.score).toBeLessThan(100);
      expect(result.improvements.length).toBeGreaterThan(0);
    });
  });
});

