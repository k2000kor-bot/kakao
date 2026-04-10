/**
 * PoliticalWritingEngine 테스트
 */
import politicalWritingEngine from '../politicalWritingEngine';
import type { PoliticalWritingRequest, PoliticalSpectrum, ToneIntensity } from '../politicalWritingEngine';

const createPoliticalRequest = (overrides: Partial<PoliticalWritingRequest> = {}): PoliticalWritingRequest => ({
  topic: '환경 정책',
  profile: {
    spectrum: 'center',
    stance: 'neutral',
    emotionIntensity: 'moderate',
    toneIntensity: 'moderate',
    useRhetoric: true,
    useStatistics: true,
    useEmotionalAppeal: false,
    useMilitantLanguage: false,
    useAggressiveRhetoric: false,
    formalityLevel: 'formal'
  },
  targetLength: 500,
  includeReferences: false,
  outputFormat: 'essay',
  ...overrides
});

describe('PoliticalWritingEngine', () => {
  describe('recommendPoliticalProfile', () => {
    it('정치적 프로필 추천', () => {
      const profile = politicalWritingEngine.recommendPoliticalProfile('환경 보호', {});

      expect(profile).toBeDefined();
      expect(profile.spectrum).toBe('center');
      expect(profile.stance).toBe('neutral');
      expect(profile.emotionIntensity).toBe('moderate');
      expect(profile.toneIntensity).toBe('moderate');
      expect(profile.useRhetoric).toBe(true);
    });
  });

  describe('createMilitantProfile', () => {
    it('강성 프로필 기본값 생성', () => {
      const profile = politicalWritingEngine.createMilitantProfile();

      expect(profile.spectrum).toBe('extreme_right');
      expect(profile.stance).toBe('strongly_support');
      expect(profile.useMilitantLanguage).toBe(true);
      expect(profile.useAggressiveRhetoric).toBe(true);
    });

    it('강성 프로필 커스텀 값 생성', () => {
      const profile = politicalWritingEngine.createMilitantProfile(
        'progressive' as PoliticalSpectrum,
        'strongly_oppose' as import('../politicalWritingEngine').PoliticalStance,
        'aggressive' as ToneIntensity
      );

      expect(profile.spectrum).toBe('progressive');
      expect(profile.stance).toBe('strongly_oppose');
      expect(profile.toneIntensity).toBe('aggressive');
    });
  });

  describe('generateMilitantSamples', () => {
    it('강성 어조 샘플 생성', () => {
      const samples = politicalWritingEngine.generateMilitantSamples();

      const intensities: ToneIntensity[] = [
        'gentle', 'moderate', 'firm', 'strong', 'militant', 'aggressive', 'combative'
      ];

      intensities.forEach(intensity => {
        expect(samples[intensity]).toBeDefined();
        expect(typeof samples[intensity]).toBe('string');
        expect(samples[intensity].length).toBeGreaterThan(0);
      });
    });
  });

  describe('generatePoliticalWriting', () => {
    it('정치적 글쓰기 생성', async () => {
      const request = createPoliticalRequest();
      const response = await politicalWritingEngine.generatePoliticalWriting(request);

      expect(response).toBeDefined();
      expect(response.generatedText).toBeDefined();
      expect(response.generatedText.length).toBeGreaterThan(0);
      expect(Array.isArray(response.keyArguments)).toBe(true);
      expect(Array.isArray(response.rhetoricalDevices)).toBe(true);
      expect(typeof response.emotionalTone).toBe('string');
      expect(Array.isArray(response.persuasionStrategies)).toBe(true);
      expect(Array.isArray(response.counterArgumentsAddressed)).toBe(true);
      expect(typeof response.politicalFraming).toBe('string');
      expect(typeof response.languageStyle).toBe('string');
    });

    it('보수 성향 글쓰기 생성', async () => {
      const request = createPoliticalRequest({
        profile: {
          spectrum: 'conservative',
          stance: 'support',
          emotionIntensity: 'calm',
          toneIntensity: 'moderate',
          useRhetoric: true,
          useStatistics: true,
          useEmotionalAppeal: false,
          useMilitantLanguage: false,
          useAggressiveRhetoric: false,
          formalityLevel: 'formal'
        }
      });

      const response = await politicalWritingEngine.generatePoliticalWriting(request);
      expect(response.generatedText).toBeDefined();
      expect(response.generatedText.length).toBeGreaterThan(0);
    });
  });
});
