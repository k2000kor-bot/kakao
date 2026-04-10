/**
 * PracticalResponseGenerator 테스트
 */
import PracticalResponseGenerator from '../practicalResponseGenerator';
import type { ResponseGenerationContext } from '../practicalResponseGenerator';
import type { DeepContextAnalysis } from '../intelligentContextAnalyzer';

const mockDeepAnalysis: DeepContextAnalysis = {
  primaryIntent: {
    type: 'problemSolving',
    confidence: 0.9,
    subIntents: [],
    urgency: 'medium'
  },
  hiddenRequirements: {
    explicit: ['버그 수정'],
    implicit: [],
    contextual: [],
    emotional: []
  },
  projectContext: {
    codebase: {},
    technologies: ['React', 'TypeScript'],
    currentIssues: [],
    userExpertise: 'intermediate'
  },
  conversationFlow: {
    phase: 'solution_seeking',
    continuity: 1,
    previousContext: [],
    expectedFollowUp: []
  },
  responseStrategy: {
    approach: 'direct',
    detailLevel: 'detailed',
    format: 'text',
    tone: 'professional'
  }
};

jest.mock('../intelligentContextAnalyzer', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      analyzeDeepContext: jest.fn().mockResolvedValue(mockDeepAnalysis)
    }))
  };
});

const baseContext: ResponseGenerationContext = {
  userMessage: 'React 컴포넌트 성능 최적화 방법을 알려주세요',
  conversationHistory: [{ role: 'user', content: '안녕', timestamp: new Date() }],
  projectContext: {
    name: 'test',
    technologies: ['React', 'TypeScript'],
    files: [],
    guidelines: []
  }
};

describe('PracticalResponseGenerator', () => {
  let generator: PracticalResponseGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    generator = new PracticalResponseGenerator();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generatePracticalResponse', () => {
    it('실질적 답변 생성 성공', async () => {
      const result = await generator.generatePracticalResponse(baseContext);

      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
      expect(typeof result.mainResponse).toBe('string');
      expect(result.actionPlan).toBeDefined();
      expect(result.actionPlan.immediate.length).toBeGreaterThan(0);
      expect(result.examples).toBeDefined();
      expect(result.validation).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.followUp).toBeDefined();
    });

    it('metadata 품질 점수 및 복잡도 포함', async () => {
      const result = await generator.generatePracticalResponse(baseContext);

      expect(result.metadata.confidence).toBeDefined();
      expect(result.metadata.complexity).toMatch(/^(simple|moderate|complex|expert)$/);
      expect(result.metadata.estimatedTime).toBeDefined();
      expect(result.metadata.qualityScore).toBeDefined();
    });

    it('followUp 제안 질문 및 리소스 포함', async () => {
      const result = await generator.generatePracticalResponse(baseContext);

      expect(result.followUp.suggestedQuestions.length).toBeGreaterThan(0);
      expect(result.followUp.nextSteps.length).toBeGreaterThan(0);
    });

    it('userProfile 없이도 동작', async () => {
      const minimalContext: ResponseGenerationContext = {
        userMessage: '질문',
        conversationHistory: []
      };
      const result = await generator.generatePracticalResponse(minimalContext);
      expect(result).toBeDefined();
      expect(result.mainResponse).toBeDefined();
    });

    it('actionPlan 및 validation 구조 검증', async () => {
      const result = await generator.generatePracticalResponse(baseContext);

      expect(result.actionPlan).toBeDefined();
      expect(Array.isArray(result.actionPlan.immediate)).toBe(true);
      expect(Array.isArray(result.actionPlan.shortTerm)).toBe(true);
      expect(Array.isArray(result.actionPlan.longTerm)).toBe(true);
      expect(result.validation).toBeDefined();
      expect(Array.isArray(result.validation.testingSteps)).toBe(true);
      expect(Array.isArray(result.validation.qualityChecks)).toBe(true);
      expect(Array.isArray(result.validation.troubleshooting)).toBe(true);
    });

    it('examples 및 followUp 구조 검증', async () => {
      const result = await generator.generatePracticalResponse(baseContext);

      expect(result.examples).toBeDefined();
      expect(Array.isArray(result.examples.codeSnippets)).toBe(true);
      expect(Array.isArray(result.examples.realWorldScenarios)).toBe(true);
      expect(Array.isArray(result.examples.bestPractices)).toBe(true);
      expect(result.followUp.suggestedQuestions).toBeDefined();
      expect(Array.isArray(result.followUp.nextSteps)).toBe(true);
    });
  });
});
