/**
 * toneService 서비스 테스트
 * 어투/말투 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import toneService, { ToneType, AgeGroup, ToneConfig } from '../toneService';

describe('toneService', () => {
  describe('싱글톤 인스턴스', () => {
    it('내보낸 인스턴스가 정의되어 있어야 함', () => {
      expect(toneService).toBeDefined();
    });
  });

  describe('getToneProfile', () => {
    it('기본 어투 프로필을 반환해야 함', () => {
      const profile = toneService.getToneProfile('formal');

      expect(profile).toBeDefined();
      expect(profile.toneType).toBe('formal');
      expect(profile.characteristics).toBeDefined();
      expect(Array.isArray(profile.characteristics)).toBe(true);
      expect(profile.examplePhrases).toBeDefined();
      expect(Array.isArray(profile.examplePhrases)).toBe(true);
    });

    it('존댓말 프로필을 반환해야 함', () => {
      const profile = toneService.getToneProfile('polite');

      expect(profile.toneType).toBe('polite');
      expect(profile.characteristics).toContain('정중함');
    });

    it('캐주얼 프로필을 반환해야 함', () => {
      const profile = toneService.getToneProfile('casual');

      expect(profile.toneType).toBe('casual');
      expect(profile.formality).toBe('informal');
    });

    it('연령대와 함께 프로필을 조회할 수 있어야 함', () => {
      const profile = toneService.getToneProfile('casual', 'teen');

      expect(profile).toBeDefined();
      expect(profile.ageGroup).toBe('teen');
      expect(profile.characteristics).toBeDefined();
    });

    it('10대 프로필을 반환해야 함', () => {
      const profile = toneService.getToneProfile('casual', 'teen');

      expect(profile.characteristics).toContain('트렌디');
      expect(profile.formality).toBe('very_informal');
    });

    it('20대 프로필을 반환해야 함', () => {
      const profile = toneService.getToneProfile('casual', 'twenties');

      expect(profile.characteristics).toContain('캐주얼');
      expect(profile.formality).toBe('informal');
    });

    it('30대 프로필을 반환해야 함', () => {
      const profile = toneService.getToneProfile('polite', 'thirties');

      expect(profile.characteristics).toContain('균형잡힌');
      expect(profile.formality).toBe('neutral');
    });

    it('존재하지 않는 어투 타입은 기본 프로필을 반환해야 함', () => {
      const profile = toneService.getToneProfile('nonexistent' as ToneType);

      expect(profile).toBeDefined();
      expect(profile.toneType).toBe('polite');
    });
  });

  describe('generateToneInstructions', () => {
    it('어투 지시사항을 생성해야 함', () => {
      const config: ToneConfig = {
        toneType: 'formal',
      };

      const instructions = toneService.generateToneInstructions(config);

      expect(typeof instructions).toBe('string');
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions).toContain('어투 및 말투 지시사항');
      expect(instructions).toContain('격식체');
    });

    it('연령대와 함께 지시사항을 생성해야 함', () => {
      const config: ToneConfig = {
        toneType: 'casual',
        ageGroup: 'teen',
      };

      const instructions = toneService.generateToneInstructions(config);

      expect(instructions).toContain('10대');
      expect(instructions).toContain('특징');
    });

    it('커스텀 지시사항을 포함해야 함', () => {
      const config: ToneConfig = {
        toneType: 'polite',
        customInstructions: '특별한 주의사항',
      };

      const instructions = toneService.generateToneInstructions(config);

      expect(instructions).toContain('특별한 주의사항');
      expect(instructions).toContain('추가 지시사항');
    });

    it('특징 목록을 포함해야 함', () => {
      const config: ToneConfig = {
        toneType: 'formal',
      };

      const instructions = toneService.generateToneInstructions(config);

      expect(instructions).toContain('특징:');
    });

    it('예시 표현을 포함해야 함', () => {
      const config: ToneConfig = {
        toneType: 'polite',
      };

      const instructions = toneService.generateToneInstructions(config);

      expect(instructions).toContain('사용할 표현 예시:');
    });

    it('문장 구조 정보를 포함해야 함', () => {
      const config: ToneConfig = {
        toneType: 'formal',
      };

      const instructions = toneService.generateToneInstructions(config);

      expect(instructions).toContain('문장 구조:');
    });
  });

  describe('getToneTypeName', () => {
    it('격식체 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('formal')).toBe('격식체');
    });

    it('비격식체 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('informal')).toBe('비격식체');
    });

    it('존댓말 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('polite')).toBe('존댓말');
    });

    it('캐주얼 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('casual')).toBe('캐주얼');
    });

    it('공식적 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('official')).toBe('공식적');
    });

    it('친근한 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('friendly')).toBe('친근한');
    });

    it('전문적 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('professional')).toBe('전문적');
    });

    it('학술적 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('academic')).toBe('학술적');
    });

    it('대화체 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('conversational')).toBe('대화체');
    });

    it('설득적 이름을 반환해야 함', () => {
      expect(toneService.getToneTypeName('persuasive')).toBe('설득적');
    });
  });

  describe('getAgeGroupName', () => {
    it('10대 이름을 반환해야 함', () => {
      expect(toneService.getAgeGroupName('teen')).toBe('10대');
    });

    it('20대 이름을 반환해야 함', () => {
      expect(toneService.getAgeGroupName('twenties')).toBe('20대');
    });

    it('30대 이름을 반환해야 함', () => {
      expect(toneService.getAgeGroupName('thirties')).toBe('30대');
    });

    it('40대 이름을 반환해야 함', () => {
      expect(toneService.getAgeGroupName('forties')).toBe('40대');
    });

    it('50대 이름을 반환해야 함', () => {
      expect(toneService.getAgeGroupName('fifties')).toBe('50대');
    });

    it('60대 이름을 반환해야 함', () => {
      expect(toneService.getAgeGroupName('sixties')).toBe('60대');
    });

    it('80대 이름을 반환해야 함', () => {
      expect(toneService.getAgeGroupName('eighties')).toBe('80대');
    });
  });

  describe('getFormalityName', () => {
    it('매우 격식적 이름을 반환해야 함', () => {
      expect(toneService.getFormalityName('very_formal')).toBe('매우 격식적');
    });

    it('격식적 이름을 반환해야 함', () => {
      expect(toneService.getFormalityName('formal')).toBe('격식적');
    });

    it('중립적 이름을 반환해야 함', () => {
      expect(toneService.getFormalityName('neutral')).toBe('중립적');
    });

    it('비격식적 이름을 반환해야 함', () => {
      expect(toneService.getFormalityName('informal')).toBe('비격식적');
    });

    it('매우 비격식적 이름을 반환해야 함', () => {
      expect(toneService.getFormalityName('very_informal')).toBe('매우 비격식적');
    });
  });

  describe('getAllToneTypes', () => {
    it('모든 어투 타입을 반환해야 함', () => {
      const types = toneService.getAllToneTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
      expect(types).toContain('formal');
      expect(types).toContain('polite');
      expect(types).toContain('casual');
    });

    it('모든 어투 타입이 유효한 ToneType이어야 함', () => {
      const types = toneService.getAllToneTypes();

      const validTypes: ToneType[] = [
        'formal', 'informal', 'polite', 'casual', 'official',
        'friendly', 'professional', 'academic', 'conversational', 'persuasive'
      ];

      types.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });
  });

  describe('getAllAgeGroups', () => {
    it('모든 연령대를 반환해야 함', () => {
      const groups = toneService.getAllAgeGroups();

      expect(Array.isArray(groups)).toBe(true);
      expect(groups.length).toBeGreaterThan(0);
      expect(groups).toContain('teen');
      expect(groups).toContain('twenties');
      expect(groups).toContain('thirties');
    });

    it('모든 연령대가 유효한 AgeGroup이어야 함', () => {
      const groups = toneService.getAllAgeGroups();

      const validGroups: AgeGroup[] = [
        'teen', 'twenties', 'thirties', 'forties',
        'fifties', 'sixties', 'eighties'
      ];

      groups.forEach(group => {
        expect(validGroups).toContain(group);
      });
    });
  });
});

