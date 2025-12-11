/**
 * SimpleAdvancedAIService 테스트
 */

import {
  simpleAdvancedAIService,
  SimpleAdvancedAIService,
  SimpleAdvancedAIResponse,
  SimpleUserProfile,
} from '../simpleAdvancedAIService';

describe('SimpleAdvancedAIService', () => {
  let service: SimpleAdvancedAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SimpleAdvancedAIService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(SimpleAdvancedAIService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(simpleAdvancedAIService).toBeDefined();
      expect(simpleAdvancedAIService).toBeInstanceOf(SimpleAdvancedAIService);
    });
  });

  describe('고급 응답 생성', () => {
    it('기본 응답 생성', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '기본 응답',
        {}
      );

      expect(response).toBeDefined();
      expect(response.content).toBe('기본 응답');
      expect(typeof response.confidence).toBe('number');
      expect(typeof response.learningScore).toBe('number');
      expect(typeof response.adaptationLevel).toBe('number');
      expect(Array.isArray(response.recommendations)).toBe(true);
      expect(Array.isArray(response.nextActions)).toBe(true);
      expect(response.userInsights).toBeDefined();
    });

    it('응답 구조 확인', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '기본 응답',
        {}
      );

      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('confidence');
      expect(response).toHaveProperty('learningScore');
      expect(response).toHaveProperty('adaptationLevel');
      expect(response).toHaveProperty('recommendations');
      expect(response).toHaveProperty('nextActions');
      expect(response).toHaveProperty('userInsights');
    });

    it('사용자 인사이트 구조 확인', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '기본 응답',
        {}
      );

      expect(response.userInsights).toHaveProperty('preferences');
      expect(response.userInsights).toHaveProperty('behaviorPatterns');
      expect(response.userInsights).toHaveProperty('improvementAreas');
      expect(Array.isArray(response.userInsights.preferences)).toBe(true);
      expect(Array.isArray(response.userInsights.behaviorPatterns)).toBe(true);
      expect(Array.isArray(response.userInsights.improvementAreas)).toBe(true);
    });

    it('신뢰도 범위 확인', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '기본 응답',
        {}
      );

      expect(response.confidence).toBeGreaterThanOrEqual(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('학습 점수 범위 확인', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '기본 응답',
        {}
      );

      expect(response.learningScore).toBeGreaterThanOrEqual(0);
      expect(response.learningScore).toBeLessThanOrEqual(1);
    });

    it('적응 수준 범위 확인', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '기본 응답',
        {}
      );

      expect(response.adaptationLevel).toBeGreaterThanOrEqual(0);
      expect(response.adaptationLevel).toBeLessThanOrEqual(1);
    });
  });

  describe('신뢰도 계산', () => {
    it('기본 신뢰도', async () => {
      const response = await service.generateAdvancedResponse(
        '짧은 메시지',
        'user-1',
        '응답',
        {}
      );

      expect(response.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('키워드가 있을 때 신뢰도 증가', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '응답',
        { keywords: ['테스트', '메시지'] }
      );

      expect(response.confidence).toBeGreaterThan(0.7);
    });

    it('긴 메시지일 때 신뢰도 증가', async () => {
      const longMessage = '이것은 매우 긴 메시지입니다. 20자 이상의 메시지입니다.';
      const response = await service.generateAdvancedResponse(
        longMessage,
        'user-1',
        '응답',
        {}
      );

      expect(response.confidence).toBeGreaterThan(0.7);
    });

    it('감정 분석이 있을 때 신뢰도 증가', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '응답',
        { sentiment: 'positive' }
      );

      expect(response.confidence).toBeGreaterThan(0.7);
    });

    it('신뢰도 최대값 제한', async () => {
      const response = await service.generateAdvancedResponse(
        '매우 긴 메시지입니다. 20자 이상입니다.',
        'user-1',
        '응답',
        {
          keywords: ['테스트'],
          sentiment: 'positive',
        }
      );

      expect(response.confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('학습 점수 계산', () => {
    it('첫 상호작용 시 학습 점수', async () => {
      const response = await service.generateAdvancedResponse(
        '첫 메시지',
        'new-user',
        '응답',
        {}
      );

      expect(response.learningScore).toBeGreaterThanOrEqual(0);
      expect(response.learningScore).toBeLessThanOrEqual(0.1);
    });

    it('여러 상호작용 후 학습 점수 증가', async () => {
      for (let i = 0; i < 5; i++) {
        await service.generateAdvancedResponse(
          `메시지 ${i}`,
          'user-2',
          '응답',
          {}
        );
      }

      const response = await service.generateAdvancedResponse(
        '다섯 번째 메시지',
        'user-2',
        '응답',
        {}
      );

      expect(response.learningScore).toBeGreaterThan(0);
    });

    it('학습 점수 최대값 제한', async () => {
      // 많은 상호작용 수행
      for (let i = 0; i < 15; i++) {
        await service.generateAdvancedResponse(
          `메시지 ${i}`,
          'user-3',
          '응답',
          {}
        );
      }

      const response = await service.generateAdvancedResponse(
        '15번째 메시지',
        'user-3',
        '응답',
        {}
      );

      expect(response.learningScore).toBeLessThanOrEqual(1.0);
    });
  });

  describe('적응 수준 계산', () => {
    it('첫 상호작용 시 적응 수준', async () => {
      const response = await service.generateAdvancedResponse(
        '첫 메시지',
        'new-user-2',
        '응답',
        {}
      );

      expect(response.adaptationLevel).toBeGreaterThanOrEqual(0);
      expect(response.adaptationLevel).toBeLessThanOrEqual(0.05);
    });

    it('여러 상호작용 후 적응 수준 증가', async () => {
      for (let i = 0; i < 10; i++) {
        await service.generateAdvancedResponse(
          `메시지 ${i}`,
          'user-4',
          '응답',
          {}
        );
      }

      const response = await service.generateAdvancedResponse(
        '10번째 메시지',
        'user-4',
        '응답',
        {}
      );

      expect(response.adaptationLevel).toBeGreaterThan(0);
    });

    it('적응 수준 최대값 제한', async () => {
      // 많은 상호작용 수행
      for (let i = 0; i < 25; i++) {
        await service.generateAdvancedResponse(
          `메시지 ${i}`,
          'user-5',
          '응답',
          {}
        );
      }

      const response = await service.generateAdvancedResponse(
        '25번째 메시지',
        'user-5',
        '응답',
        {}
      );

      expect(response.adaptationLevel).toBeLessThanOrEqual(1.0);
    });
  });

  describe('추천사항 생성', () => {
    it('원베일리 관련 추천', async () => {
      const response = await service.generateAdvancedResponse(
        '원베일리에 대해 알려주세요',
        'user-1',
        '응답',
        {}
      );

      expect(response.recommendations.length).toBeGreaterThan(0);
      expect(response.recommendations.some(r => r.includes('원베일리'))).toBe(true);
    });

    it('부정적 감정에 대한 추천', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '응답',
        { sentiment: 'negative' }
      );

      expect(response.recommendations.length).toBeGreaterThan(0);
      expect(response.recommendations.some(r => r.includes('부정') || r.includes('긍정'))).toBe(true);
    });

    it('짧은 메시지에 대한 추천', async () => {
      const response = await service.generateAdvancedResponse(
        '짧음',
        'user-1',
        '응답',
        {}
      );

      expect(response.recommendations.length).toBeGreaterThan(0);
      expect(response.recommendations.some(r => r.includes('구체') || r.includes('질문'))).toBe(true);
    });

    it('추천사항 배열 반환', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '응답',
        {}
      );

      expect(Array.isArray(response.recommendations)).toBe(true);
    });
  });

  describe('다음 액션 생성', () => {
    it('뉴스 관련 액션', async () => {
      const response = await service.generateAdvancedResponse(
        '뉴스를 검색해주세요',
        'user-1',
        '응답',
        {}
      );

      expect(response.nextActions.length).toBeGreaterThan(0);
      expect(response.nextActions.some(a => a.includes('뉴스'))).toBe(true);
    });

    it('분석 관련 액션', async () => {
      const response = await service.generateAdvancedResponse(
        '데이터를 분석해주세요',
        'user-1',
        '응답',
        {}
      );

      expect(response.nextActions.length).toBeGreaterThan(0);
      expect(response.nextActions.some(a => a.includes('분석'))).toBe(true);
    });

    it('기본 액션 포함', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '응답',
        {}
      );

      expect(response.nextActions.length).toBeGreaterThan(0);
      expect(response.nextActions.some(a => a.includes('저장') || a.includes('업데이트'))).toBe(true);
    });

    it('다음 액션 배열 반환', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-1',
        '응답',
        {}
      );

      expect(Array.isArray(response.nextActions)).toBe(true);
    });
  });

  describe('사용자 프로필', () => {
    it('사용자 프로필 조회', () => {
      const profile = service.getUserProfile('user-1');

      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('expertise');
      expect(profile).toHaveProperty('interests');
      expect(profile).toHaveProperty('communicationStyle');
      expect(profile).toHaveProperty('responsePreference');
      expect(profile).toHaveProperty('totalInteractions');
    });

    it('프로필 구조 확인', () => {
      const profile = service.getUserProfile('user-1');

      expect(Array.isArray(profile.expertise)).toBe(true);
      expect(Array.isArray(profile.interests)).toBe(true);
      expect(typeof profile.communicationStyle).toBe('string');
      expect(typeof profile.responsePreference).toBe('string');
      expect(typeof profile.totalInteractions).toBe('number');
    });

    it('상호작용 수 집계', async () => {
      await service.generateAdvancedResponse('메시지 1', 'user-6', '응답', {});
      await service.generateAdvancedResponse('메시지 2', 'user-6', '응답', {});

      const profile = service.getUserProfile('user-6');
      expect(profile.totalInteractions).toBe(2);
    });

    it('새 사용자 프로필', () => {
      const profile = service.getUserProfile('new-user-3');

      expect(profile.totalInteractions).toBe(0);
      expect(profile.expertise.length).toBeGreaterThan(0);
      expect(profile.interests.length).toBeGreaterThan(0);
    });
  });

  describe('사용자 데이터 업데이트', () => {
    it('사용자 데이터 저장', async () => {
      await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-7',
        '응답',
        { keywords: ['테스트'] }
      );

      const profile = service.getUserProfile('user-7');
      expect(profile.totalInteractions).toBe(1);
    });

    it('여러 메시지 저장', async () => {
      for (let i = 0; i < 3; i++) {
        await service.generateAdvancedResponse(
          `메시지 ${i}`,
          'user-8',
          `응답 ${i}`,
          {}
        );
      }

      const profile = service.getUserProfile('user-8');
      expect(profile.totalInteractions).toBe(3);
    });

    it('다른 사용자 데이터 분리', async () => {
      await service.generateAdvancedResponse('메시지 1', 'user-9', '응답', {});
      await service.generateAdvancedResponse('메시지 2', 'user-10', '응답', {});

      const profile1 = service.getUserProfile('user-9');
      const profile2 = service.getUserProfile('user-10');

      expect(profile1.totalInteractions).toBe(1);
      expect(profile2.totalInteractions).toBe(1);
    });
  });

  describe('사용자 인사이트', () => {
    it('사용자 인사이트 생성', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-11',
        '응답',
        {}
      );

      expect(response.userInsights.preferences.length).toBeGreaterThan(0);
      expect(response.userInsights.behaviorPatterns.length).toBeGreaterThan(0);
      expect(response.userInsights.improvementAreas.length).toBeGreaterThan(0);
    });

    it('인사이트 구조 확인', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-12',
        '응답',
        {}
      );

      expect(Array.isArray(response.userInsights.preferences)).toBe(true);
      expect(Array.isArray(response.userInsights.behaviorPatterns)).toBe(true);
      expect(Array.isArray(response.userInsights.improvementAreas)).toBe(true);
    });
  });

  describe('에지 케이스', () => {
    it('빈 메시지 처리', async () => {
      const response = await service.generateAdvancedResponse(
        '',
        'user-13',
        '응답',
        {}
      );

      expect(response).toBeDefined();
      expect(response.content).toBe('응답');
    });

    it('빈 NLP 분석 처리', async () => {
      const response = await service.generateAdvancedResponse(
        '테스트 메시지',
        'user-14',
        '응답',
        null as any
      );

      expect(response).toBeDefined();
      expect(response.confidence).toBeGreaterThanOrEqual(0);
    });

    it('복잡한 NLP 분석 처리', async () => {
      const complexNLP = {
        keywords: ['테스트', '메시지', '복잡'],
        sentiment: 'positive',
        entities: ['테스트'],
        intent: 'question',
      };

      const response = await service.generateAdvancedResponse(
        '복잡한 테스트 메시지입니다',
        'user-15',
        '응답',
        complexNLP
      );

      expect(response).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0.7);
    });

    it('긴 메시지 처리', async () => {
      const longMessage = 'a'.repeat(1000);
      const response = await service.generateAdvancedResponse(
        longMessage,
        'user-16',
        '응답',
        {}
      );

      expect(response).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0.7);
    });
  });
});


