/**
 * advancedWritingCognitiveEngine 서비스 테스트
 * 고급 글쓰기 인지 엔진 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedWritingCognitiveEngine, {
  CognitiveWritingProfile,
  DeepWritingContext
} from '../advancedWritingCognitiveEngine';

describe('advancedWritingCognitiveEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedWritingCognitiveEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedWritingCognitiveEngine;
      const instance2 = advancedWritingCognitiveEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateCognitiveWriting', () => {
    const createMockProfile = (): CognitiveWritingProfile => ({
      thinkingPattern: 'analytical',
      processLevel: 'analytical',
      originalityLevel: 70,
      divergentThinking: 65,
      conceptualFluency: 75,
      abstractionLevel: 'intermediate',
      cognitiveLoad: 'medium',
      selfAwareness: 80,
      strategicThinking: 75,
      reflectiveDepth: 70,
      empathyLevel: 70,
      socialAwareness: 75,
      culturalSensitivity: 80
    });

    const createMockContext = (): DeepWritingContext => ({
      culturalContext: ['한국 문화'],
      historicalContext: [],
      socialContext: ['사회적 맥락'],
      economicContext: [],
      politicalContext: [],
      audiencePsychology: {
        motivations: ['학습', '성장'],
        fears: [],
        values: ['전문성'],
        beliefs: [],
        aspirations: []
      },
      primaryGoal: '교육',
      secondaryGoals: [],
      emotionalGoals: [],
      actionGoals: [],
      culturalTaboos: [],
      ethicalConsiderations: [],
      legalConstraints: [],
      brandGuidelines: []
    });

    it('인지 글쓰기를 생성할 수 있어야 함', async () => {
      const profile = createMockProfile();
      const context = createMockContext();

      const result = await advancedWritingCognitiveEngine.generateCognitiveWriting(
        '재개발 프로젝트 분석',
        'analytical',
        profile,
        context
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.cognitiveAnalysis).toBeDefined();
      expect(result.creativeElements).toBeDefined();
      expect(result.emotionalMapping).toBeDefined();
      expect(result.qualityMetrics).toBeDefined();
    });

    it('다양한 글쓰기 스타일로 생성할 수 있어야 함', async () => {
      const profile = createMockProfile();
      const context = createMockContext();
      const styles = ['analytical', 'narrative', 'persuasive', 'explanatory'];

      for (const style of styles) {
        const result = await advancedWritingCognitiveEngine.generateCognitiveWriting(
          '재개발 프로젝트',
          style as unknown as Parameters<typeof service.analyzeWritingStyle>[0],
          profile,
          context
        );

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });
  });

  describe('generateMultiPerspectiveWriting', () => {
    it('다중 관점 글쓰기를 생성할 수 있어야 함', async () => {
      const result = await advancedWritingCognitiveEngine.generateMultiPerspectiveWriting(
        '재개발 프로젝트 시공사 선정',
        ['경제적 관점', '사회적 관점', '기술적 관점'],
        'dialectical'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.perspectives)).toBe(true);
      expect(result.perspectives.length).toBeGreaterThan(0);
      expect(result.synthesis).toBeDefined();
      expect(result.metaAnalysis).toBeDefined();
      expect(Array.isArray(result.insightGeneration)).toBe(true);
    });

    it('다양한 종합 모드로 생성할 수 있어야 함', async () => {
      const modes: Array<'dialectical' | 'integrative' | 'comparative' | 'complementary'> = [
        'dialectical',
        'integrative',
        'comparative',
        'complementary'
      ];

      for (const mode of modes) {
        const result = await advancedWritingCognitiveEngine.generateMultiPerspectiveWriting(
          '재개발 프로젝트',
          ['관점1', '관점2'],
          mode
        );

        expect(result).toBeDefined();
        expect(result.synthesis).toBeDefined();
      }
    });
  });

  describe('provideWritingCoaching', () => {
    const createMockProfile = (): CognitiveWritingProfile => ({
      thinkingPattern: 'analytical',
      processLevel: 'analytical',
      originalityLevel: 70,
      divergentThinking: 65,
      conceptualFluency: 75,
      abstractionLevel: 'intermediate',
      cognitiveLoad: 'medium',
      selfAwareness: 80,
      strategicThinking: 75,
      reflectiveDepth: 70,
      empathyLevel: 70,
      socialAwareness: 75,
      culturalSensitivity: 80
    });

    it('글쓰기 코칭을 제공할 수 있어야 함', async () => {
      const profile = createMockProfile();

      const result = await advancedWritingCognitiveEngine.provideWritingCoaching(
        '현재 작성 중인 텍스트입니다.',
        '전문적인 분석 글 작성',
        profile
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.strengthAnalysis)).toBe(true);
      expect(Array.isArray(result.improvementAreas)).toBe(true);
      expect(Array.isArray(result.specificSuggestions)).toBe(true);
      expect(Array.isArray(result.cognitiveGuidance)).toBe(true);
      expect(Array.isArray(result.nextSteps)).toBe(true);
      expect(result.motivationalFeedback).toBeDefined();
    });

    it('다양한 글쓰기 목표에 대해 코칭을 제공할 수 있어야 함', async () => {
      const profile = createMockProfile();
      const goals = ['전문 글 작성', '창의적 글 작성', '설득적 글 작성'];

      for (const goal of goals) {
        const result = await advancedWritingCognitiveEngine.provideWritingCoaching(
          '텍스트',
          goal,
          profile
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result.specificSuggestions)).toBe(true);
      }
    });
  });

  describe('analyzePsycholinguisticWriting', () => {
    it('심리언어학적 글쓰기 분석을 수행할 수 있어야 함', async () => {
      const result = await advancedWritingCognitiveEngine.analyzePsycholinguisticWriting(
        '재개발 프로젝트에 대한 전문적인 분석 글입니다.'
      );

      expect(result).toBeDefined();
      expect(typeof result.cognitiveLoad).toBe('number');
      expect(result.readabilityPsychology).toBeDefined();
      expect(result.emotionalResonance).toBeDefined();
      expect(result.persuasionPsychology).toBeDefined();
      expect(result.memoryOptimization).toBeDefined();
      expect(result.attentionEngagement).toBeDefined();
    });

    it('다양한 텍스트에 대해 분석을 수행할 수 있어야 함', async () => {
      const texts = [
        '간단한 텍스트',
        '좀 더 복잡한 텍스트입니다. 여러 문장과 개념을 포함합니다.',
        '매우 복잡하고 전문적인 텍스트입니다. 다양한 개념과 분석을 포함하며, 심층적인 논의를 담고 있습니다.'
      ];

      for (const text of texts) {
        const result = await advancedWritingCognitiveEngine.analyzePsycholinguisticWriting(text);

        expect(result).toBeDefined();
        expect(result.readabilityPsychology).toBeDefined();
      }
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 인지 글쓰기를 생성할 수 있어야 함', async () => {
      const profile: CognitiveWritingProfile = {
        thinkingPattern: 'analytical',
        processLevel: 'analytical',
        originalityLevel: 75,
        divergentThinking: 70,
        conceptualFluency: 80,
        abstractionLevel: 'intermediate',
        cognitiveLoad: 'medium',
        selfAwareness: 85,
        strategicThinking: 80,
        reflectiveDepth: 75,
        empathyLevel: 70,
        socialAwareness: 75,
        culturalSensitivity: 80
      };

      const context: DeepWritingContext = {
        culturalContext: ['한국 건설 문화'],
        historicalContext: [],
        socialContext: ['재개발 프로젝트'],
        economicContext: [],
        politicalContext: [],
        audiencePsychology: {
          motivations: ['프로젝트 이해'],
          fears: [],
          values: ['전문성', '안정성'],
          beliefs: [],
          aspirations: []
        },
        primaryGoal: '전문적 분석',
        secondaryGoals: [],
        emotionalGoals: [],
        actionGoals: [],
        culturalTaboos: [],
        ethicalConsiderations: [],
        legalConstraints: [],
        brandGuidelines: []
      };

      const result = await advancedWritingCognitiveEngine.generateCognitiveWriting(
        '샘플 재개발 프로젝트 시공사 선정 분석',
        'analytical',
        profile,
        context
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.cognitiveAnalysis).toBeDefined();
    });

    it('시공사 선정 관련 다중 관점 글쓰기를 생성할 수 있어야 함', async () => {
      const result = await advancedWritingCognitiveEngine.generateMultiPerspectiveWriting(
        '시공사 선정 기준',
        ['경제적 효율성', '기술력', '안전성', '사회적 책임'],
        'integrative'
      );

      expect(result).toBeDefined();
      expect(result.perspectives.length).toBe(4);
      expect(result.synthesis).toBeDefined();
    });
  });
});

