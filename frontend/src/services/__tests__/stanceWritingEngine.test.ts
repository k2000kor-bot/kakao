/**
 * StanceWritingEngine 테스트
 */
import stanceWritingEngine from '../stanceWritingEngine';
import type { StanceWritingRequest, StancePosition } from '../stanceWritingEngine';

const createStanceRequest = (overrides: Partial<StanceWritingRequest> = {}): StanceWritingRequest => ({
  topic: 'AI 윤리',
  profile: {
    position: 'support',
    argumentStyle: 'logical',
    persuasionStrategy: ['facts_and_data', 'cause_effect'],
    rhetoricalTechniques: ['enumeration', 'contrast'],
    strengthLevel: 'moderate',
    includeCounterArguments: true,
    includeEvidence: true,
    includePersonalExperience: false,
    targetAudience: 'general'
  },
  targetLength: 500,
  requiredSections: ['introduction', 'main_argument', 'conclusion'],
  tone: 'formal',
  includeCallToAction: true,
  ...overrides
});

describe('StanceWritingEngine', () => {
  describe('recommendStanceProfile', () => {
    it('입장별 프로필 추천', () => {
      const profile = stanceWritingEngine.recommendStanceProfile('환경보호', 'support', '환경 정책 논의');

      expect(profile).toBeDefined();
      expect(profile.position).toBe('support');
      expect(profile.argumentStyle).toBe('logical');
      expect(Array.isArray(profile.persuasionStrategy)).toBe(true);
      expect(profile.persuasionStrategy).toContain('facts_and_data');
      expect(profile.strengthLevel).toBe('moderate');
      expect(profile.includeCounterArguments).toBe(true);
    });

    it('원하는 입장 반영', () => {
      const profile = stanceWritingEngine.recommendStanceProfile('기술 발전', 'strongly_oppose', '');

      expect(profile.position).toBe('strongly_oppose');
    });
  });

  describe('generateStanceSamples', () => {
    it('모든 입장별 샘플 생성', () => {
      const samples = stanceWritingEngine.generateStanceSamples();

      const positions: StancePosition[] = [
        'strongly_support', 'support', 'neutral', 'oppose', 'strongly_oppose',
        'conditional_support', 'conditional_oppose'
      ];

      positions.forEach(position => {
        expect(samples[position]).toBeDefined();
        expect(typeof samples[position]).toBe('string');
        expect(samples[position].length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateStanceWriting', () => {
    it('입장별 글쓰기 생성', async () => {
      const request = createStanceRequest();
      const response = await stanceWritingEngine.generateStanceWriting(request);

      expect(response).toBeDefined();
      expect(response.generatedText).toBeDefined();
      expect(response.generatedText.length).toBeGreaterThan(0);
      expect(Array.isArray(response.stanceIndicators)).toBe(true);
      expect(Array.isArray(response.argumentStructure)).toBe(true);
      expect(Array.isArray(response.persuasionElements)).toBe(true);
      expect(Array.isArray(response.rhetoricalDevices)).toBe(true);
      expect(typeof response.strengthAssessment).toBe('string');
    });

    it('반대 입장 글쓰기 생성', async () => {
      const request = createStanceRequest({
        profile: {
          position: 'oppose',
          argumentStyle: 'logical',
          persuasionStrategy: ['facts_and_data'],
          rhetoricalTechniques: ['contrast'],
          strengthLevel: 'strong',
          includeCounterArguments: true,
          includeEvidence: true,
          includePersonalExperience: false,
          targetAudience: 'general'
        }
      });

      const response = await stanceWritingEngine.generateStanceWriting(request);
      expect(response.generatedText).toBeDefined();
      expect(response.generatedText.length).toBeGreaterThan(0);
    });

    it('응답에 counterArgumentsAddressed·evidenceTypes가 포함되어야 함', async () => {
      const request = createStanceRequest();
      const response = await stanceWritingEngine.generateStanceWriting(request);

      expect(Array.isArray(response.counterArgumentsAddressed)).toBe(true);
      expect(Array.isArray(response.evidenceTypes)).toBe(true);
    });

    it('neutral 입장 글쓰기 생성', async () => {
      const request = createStanceRequest({
        profile: {
          position: 'neutral',
          argumentStyle: 'logical',
          persuasionStrategy: ['pros_cons'],
          rhetoricalTechniques: ['enumeration'],
          strengthLevel: 'moderate',
          includeCounterArguments: true,
          includeEvidence: true,
          includePersonalExperience: false,
          targetAudience: 'general'
        }
      });

      const response = await stanceWritingEngine.generateStanceWriting(request);
      expect(response.generatedText).toBeDefined();
      expect(response.generatedText.length).toBeGreaterThan(0);
    });
  });
});
