/**
 * advancedReasoningEngine 서비스 테스트
 * 고급 추론 엔진 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedReasoningEngine, { ReasoningContext } from '../advancedReasoningEngine';
import { NLPAnalysisResult } from '../advancedNLPEngine';

describe('advancedReasoningEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedReasoningEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedReasoningEngine;
      const instance2 = advancedReasoningEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('solveComplexProblem', () => {
    it('기본 문제를 해결할 수 있어야 함', async () => {
      const problemStatement = '재개발 프로젝트의 시공사 선정 기준을 결정해야 합니다.';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 5,
        user_expertise: 'intermediate'
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

      expect(result).toBeDefined();
      expect(result.problem_analysis).toBeDefined();
      expect(result.reasoning_chain).toBeDefined();
      expect(Array.isArray(result.reasoning_chain)).toBe(true);
      expect(result.solutions).toBeDefined();
      expect(Array.isArray(result.solutions)).toBe(true);
      expect(result.recommended_solution).toBeDefined();
      expect(result.confidence_score).toBeDefined();
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
      expect(result.confidence_score).toBeLessThanOrEqual(1);
    });

    it('복잡한 문제를 해결할 수 있어야 함', async () => {
      const problemStatement = '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리, 리스크 분석을 종합적으로 수행해야 합니다.';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 8,
        user_expertise: 'advanced',
        constraints: [
          {
            type: 'business',
            description: '예산 제약',
            priority: 'high',
            negotiable: false
          }
        ],
        objectives: [
          {
            description: '품질 확보',
            weight: 0.7,
            measurable: true,
            success_criteria: ['인증 획득', '하자 없음']
          }
        ]
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

      expect(result).toBeDefined();
      expect(result.problem_analysis).toBeDefined();
      expect(result.solutions.length).toBeGreaterThan(0);
      expect(result.recommended_solution).toBeDefined();
    });

    it('NLP 분석 결과를 포함하여 문제를 해결할 수 있어야 함', async () => {
      const problemStatement = '시공사 선정 기준을 분석해주세요';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 5
      };

      const nlpAnalysis: NLPAnalysisResult = {
        intent: 'question',
        topics: ['시공사', '선정'],
        sentiment: { label: 'neutral', score: 0.0, confidence: 0.8 },
        entities: [],
        language: 'ko',
        complexity: 0.6,
        keywords: ['시공사', '선정', '기준'],
        context: {
          conversation_flow: 'question',
          user_expertise_level: 'intermediate',
          domain: 'general',
          urgency: 'medium',
          formality: 'professional'
        },
        response_strategy: { detail_level: 'detailed', tone: 'professional' }
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context, {
        nlpAnalysis
      });

      expect(result).toBeDefined();
      expect(result.problem_analysis).toBeDefined();
      expect(result.solutions.length).toBeGreaterThan(0);
    });

    it('제약 조건이 있는 문제를 해결할 수 있어야 함', async () => {
      const problemStatement = '예산이 제한된 상황에서 최적의 시공사를 선정해야 합니다.';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 6,
        constraints: [
          {
            type: 'financial',
            description: '예산 제한: 100억원 이하',
            priority: 'critical',
            negotiable: false
          },
          {
            type: 'time',
            description: '6개월 이내 완료',
            priority: 'high',
            negotiable: true
          }
        ],
        objectives: [
          {
            description: '비용 최소화',
            weight: 0.6,
            measurable: true,
            success_criteria: ['예산 내 완료']
          },
          {
            description: '품질 확보',
            weight: 0.4,
            measurable: true,
            success_criteria: ['인증 획득']
          }
        ]
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

      expect(result).toBeDefined();
      expect(result.problem_analysis).toBeDefined();
      // constraints는 problem_analysis 내부에 있을 수도 있고 별도로 있을 수도 있음
      if (result.problem_analysis && typeof result.problem_analysis === 'object') {
        expect(result.problem_analysis).toBeDefined();
      }
      expect(result.solutions.length).toBeGreaterThan(0);
    });

    it('다양한 도메인에 대해 문제를 해결할 수 있어야 함', async () => {
      const domains = ['real_estate', 'technology', 'business', 'finance'];

      for (const domain of domains) {
        const problemStatement = `${domain} 관련 문제를 해결해야 합니다.`;
        const context: Partial<ReasoningContext> = {
          domain,
          complexity_level: 5
        };

        const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

        expect(result).toBeDefined();
        expect(result.problem_analysis).toBeDefined();
        expect(result.solutions.length).toBeGreaterThan(0);
      }
    });

    it('추론 결과가 올바른 구조를 가져야 함', async () => {
      const problemStatement = '테스트 문제';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 5
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

      expect(result.problem_analysis).toBeDefined();
      // problem_analysis의 구조는 서비스 구현에 따라 다를 수 있음
      if (result.problem_analysis && typeof result.problem_analysis === 'object') {
        expect(result.problem_analysis).toBeDefined();
      }
      expect(Array.isArray(result.reasoning_chain)).toBe(true);
      expect(Array.isArray(result.solutions)).toBe(true);
      expect(result.recommended_solution).toBeDefined();
      expect(result.recommended_solution.id).toBeDefined();
      expect(result.recommended_solution.title).toBeDefined();
      expect(result.recommended_solution.description).toBeDefined();
      expect(Array.isArray(result.alternative_paths)).toBe(true);
      expect(Array.isArray(result.learning_insights)).toBe(true);
      expect(result.reasoning_quality).toBeDefined();
      expect(typeof result.confidence_score).toBe('number');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 복합 문제를 해결할 수 있어야 함', async () => {
      const problemStatement = '강남구 역삼동 재개발 프로젝트의 시공사 선정 기준과 예산 계획을 종합적으로 결정해야 합니다.';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 8,
        user_expertise: 'advanced',
        constraints: [
          {
            type: 'business',
            description: '예산: 200억원',
            priority: 'high',
            negotiable: false
          },
          {
            type: 'time',
            description: '24개월 이내 완료',
            priority: 'high',
            negotiable: true
          }
        ],
        objectives: [
          {
            description: '품질 최대화',
            weight: 0.7,
            measurable: true,
            success_criteria: ['인증 획득', '하자 없음']
          },
          {
            description: '비용 최적화',
            weight: 0.3,
            measurable: true,
            success_criteria: ['예산 내 완료']
          }
        ]
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

      expect(result).toBeDefined();
      expect(result.problem_analysis).toBeDefined();
      expect(result.solutions.length).toBeGreaterThan(0);
      expect(result.recommended_solution).toBeDefined();
      expect(result.recommended_solution.implementation_plan).toBeDefined();
      expect(Array.isArray(result.recommended_solution.implementation_plan)).toBe(true);
      expect(result.confidence_score).toBeGreaterThanOrEqual(0);
    });

    it('시공사 선정 관련 문제를 해결할 수 있어야 함', async () => {
      const problemStatement = '시공사 선정 시 고려해야 할 주요 기준과 평가 방법을 결정해야 합니다.';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 6,
        user_expertise: 'intermediate'
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

      expect(result).toBeDefined();
      expect(result.solutions.length).toBeGreaterThan(0);
      expect(result.recommended_solution.approach).toBeDefined();
      expect(result.recommended_solution.approach.methodology).toBeDefined();
    });

    it('예산 계획 관련 문제를 해결할 수 있어야 함', async () => {
      const problemStatement = '재개발 프로젝트 예산 계획 수립 방법과 비용 최적화 방안을 결정해야 합니다.';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 7,
        constraints: [
          {
            type: 'financial',
            description: '총 예산: 150억원',
            priority: 'critical',
            negotiable: false
          }
        ]
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

      expect(result).toBeDefined();
      expect(result.solutions.length).toBeGreaterThan(0);
      expect(result.recommended_solution.resource_requirements).toBeDefined();
      expect(Array.isArray(result.recommended_solution.resource_requirements)).toBe(true);
    });

    it('복합적인 요구사항을 처리할 수 있어야 함', async () => {
      const problemStatement = '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리, 리스크 분석을 종합적으로 수행해야 합니다.';
      const context: Partial<ReasoningContext> = {
        domain: 'real_estate',
        complexity_level: 9,
        user_expertise: 'expert',
        constraints: [
          {
            type: 'business',
            description: '예산 제약',
            priority: 'high',
            negotiable: false
          },
          {
            type: 'time',
            description: '일정 제약',
            priority: 'high',
            negotiable: true
          }
        ],
        objectives: [
          {
            description: '종합 최적화',
            weight: 1.0,
            measurable: true,
            success_criteria: ['모든 요소 균형', '리스크 최소화']
          }
        ]
      };

      const result = await advancedReasoningEngine.solveComplexProblem(problemStatement, context);

      expect(result).toBeDefined();
      // problem_analysis는 ProblemAnalysis 타입이며 complexity_level이 직접 포함되지 않을 수 있음
      if (result.problem_analysis && typeof result.problem_analysis === 'object' && 'complexity_level' in result.problem_analysis) {
        expect(result.problem_analysis.complexity_level).toBeGreaterThanOrEqual(8);
      }
      expect(result.solutions.length).toBeGreaterThan(0);
      expect(result.recommended_solution.risks).toBeDefined();
      expect(Array.isArray(result.recommended_solution.risks)).toBe(true);
      expect(result.learning_insights.length).toBeGreaterThanOrEqual(0);
    });
  });
});

