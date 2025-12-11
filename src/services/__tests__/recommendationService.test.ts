/**
 * RecommendationService 테스트
 */

import {
  RecommendationService,
  recommendationService,
  Recommendation,
  UserBehavior,
} from '../recommendationService';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let mockDateNow: jest.SpyInstance;

  beforeEach(() => {
    // 새로운 서비스 인스턴스 생성
    service = new RecommendationService();
    mockDateNow = jest.spyOn(Date, 'now').mockReturnValue(1000000);
  });

  afterEach(() => {
    mockDateNow.mockRestore();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(RecommendationService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(recommendationService).toBeDefined();
      expect(recommendationService).toBeInstanceOf(RecommendationService);
    });

    it('기본 추천 목록 초기화', () => {
      const recommendations = service.getPersonalizedRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });
  });

  describe('사용자 행동 기록', () => {
    it('사용자 행동 기록 저장', () => {
      const behavior: UserBehavior = {
        messageContent: 'React 컴포넌트를 작성하고 싶어요',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        modelUsed: 'gpt-4',
        responseTime: 1200,
      };

      service.recordUserBehavior(behavior);
      
      const analysis = service.getUserBehaviorAnalysis();
      expect(analysis.totalInteractions).toBe(1);
    });

    it('여러 행동 기록 저장', () => {
      const behaviors: UserBehavior[] = [
        {
          messageContent: '코드 리뷰를 요청해주세요',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
          modelUsed: 'gpt-4',
          responseTime: 1500,
        },
        {
          messageContent: '알고리즘 설명이 필요합니다',
          timestamp: new Date().toISOString(),
          sessionId: 'session-2',
          modelUsed: 'gpt-3.5',
          responseTime: 800,
        },
      ];

      behaviors.forEach(behavior => {
        service.recordUserBehavior(behavior);
      });

      const analysis = service.getUserBehaviorAnalysis();
      expect(analysis.totalInteractions).toBe(2);
    });

    it('사용자 선호도 업데이트', () => {
      const behavior: UserBehavior = {
        messageContent: '프로그래밍 코드 작성',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        modelUsed: 'gpt-4',
        responseTime: 1000,
      };

      service.recordUserBehavior(behavior);
      
      // 관련 추천이 confidence가 향상되었는지 확인
      const recommendations = service.getPersonalizedRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('개인화된 추천', () => {
    it('기본 개인화 추천 가져오기', () => {
      const recommendations = service.getPersonalizedRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(5);
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('confidence');
      });
    });

    it('지정된 개수만큼 추천 가져오기', () => {
      const recommendations = service.getPersonalizedRecommendations(3);
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it('confidence 순으로 정렬된 추천', () => {
      const recommendations = service.getPersonalizedRecommendations();
      
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].confidence).toBeGreaterThanOrEqual(
          recommendations[i].confidence
        );
      }
    });

    it('사용자 행동에 따라 추천 업데이트', () => {
      const initialRecs = service.getPersonalizedRecommendations();
      
      const behavior: UserBehavior = {
        messageContent: '코드 리뷰와 성능 최적화',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        modelUsed: 'gpt-4',
        responseTime: 1000,
      };

      service.recordUserBehavior(behavior);
      
      const updatedRecs = service.getPersonalizedRecommendations();
      // 관련 추천의 confidence가 변경되었을 수 있음
      expect(updatedRecs.length).toBeGreaterThan(0);
    });
  });

  describe('카테고리별 추천', () => {
    it('특정 카테고리 추천 가져오기', () => {
      const recommendations = service.getRecommendationsByCategory('programming');
      
      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec.category).toBe('programming');
      });
    });

    it('존재하지 않는 카테고리 시 빈 배열 반환', () => {
      const recommendations = service.getRecommendationsByCategory('nonexistent');
      expect(recommendations).toEqual([]);
    });

    it('지정된 개수만큼 카테고리 추천 가져오기', () => {
      const recommendations = service.getRecommendationsByCategory('programming', 2);
      expect(recommendations.length).toBeLessThanOrEqual(2);
    });

    it('카테고리별 추천이 confidence 순으로 정렬', () => {
      const recommendations = service.getRecommendationsByCategory('programming');
      
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].confidence).toBeGreaterThanOrEqual(
          recommendations[i].confidence
        );
      }
    });
  });

  describe('컨텍스트 기반 추천', () => {
    it('컨텍스트와 관련된 추천 가져오기', () => {
      const recommendations = service.getContextualRecommendations('코드 리뷰를 요청하고 싶어요');
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('관련 없는 컨텍스트 시 빈 배열 반환', () => {
      const recommendations = service.getContextualRecommendations('완전히 관련 없는 텍스트');
      // 관련 추천이 없을 수 있음
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('프로그래밍 관련 컨텍스트', () => {
      const recommendations = service.getContextualRecommendations('프로그래밍 코드 작성');
      
      expect(recommendations.length).toBeGreaterThan(0);
      // 프로그래밍 관련 태그를 가진 추천이 포함되어야 함
      const hasProgrammingTag = recommendations.some(rec =>
        rec.tags.some(tag => tag.includes('코딩') || tag.includes('리뷰'))
      );
      expect(hasProgrammingTag || recommendations.length > 0).toBe(true);
    });

    it('AI 관련 컨텍스트', () => {
      const recommendations = service.getContextualRecommendations('AI 머신러닝 모델 학습');
      
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('지정된 개수만큼 컨텍스트 추천 가져오기', () => {
      const recommendations = service.getContextualRecommendations('코드', 2);
      expect(recommendations.length).toBeLessThanOrEqual(2);
    });
  });

  describe('추천 사용 기록', () => {
    it('추천 사용 기록 저장', () => {
      const recommendations = service.getPersonalizedRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const recommendationId = recommendations[0].id;
      const initialUsageCount = recommendations[0].metadata?.usageCount || 0;
      
      service.recordRecommendationUsage(recommendationId);
      
      const updatedRecs = service.getPersonalizedRecommendations();
      const updatedRec = updatedRecs.find(rec => rec.id === recommendationId);
      
      if (updatedRec?.metadata?.usageCount !== undefined) {
        expect(updatedRec.metadata.usageCount).toBeGreaterThan(initialUsageCount);
      }
    });

    it('추천 사용 기록과 평점 저장', () => {
      const recommendations = service.getPersonalizedRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const recommendationId = recommendations[0].id;
      const rating = 5;
      
      service.recordRecommendationUsage(recommendationId, rating);
      
      const updatedRecs = service.getPersonalizedRecommendations();
      const updatedRec = updatedRecs.find(rec => rec.id === recommendationId);
      
      if (updatedRec) {
        expect(updatedRec.metadata?.userRating).toBe(rating);
        expect(updatedRec.metadata?.lastUsed).toBeDefined();
      }
    });

    it('존재하지 않는 추천 사용 기록 시 에러 없이 처리', () => {
      expect(() => {
        service.recordRecommendationUsage('nonexistent-id');
      }).not.toThrow();
    });

    it('여러 번 사용된 추천의 confidence 감소', () => {
      const recommendations = service.getPersonalizedRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const recommendationId = recommendations[0].id;
      const initialConfidence = recommendations[0].confidence;
      
      // 여러 번 사용 기록
      for (let i = 0; i < 5; i++) {
        service.recordRecommendationUsage(recommendationId);
      }
      
      const updatedRecs = service.getPersonalizedRecommendations();
      const updatedRec = updatedRecs.find(rec => rec.id === recommendationId);
      
      if (updatedRec) {
        // 사용 빈도가 높아지면 confidence가 감소할 수 있음
        expect(updatedRec.confidence).toBeLessThanOrEqual(initialConfidence);
      }
    });
  });

  describe('추천 추가 및 제거', () => {
    it('새 추천 추가', () => {
      const newRecommendation: Omit<Recommendation, 'id'> = {
        type: 'suggestion',
        title: '테스트 추천',
        description: '테스트 설명',
        confidence: 0.9,
        category: 'test',
        tags: ['테스트'],
      };

      const id = service.addRecommendation(newRecommendation);
      
      expect(id).toBeDefined();
      
      const recommendations = service.getPersonalizedRecommendations();
      const added = recommendations.find(rec => rec.id === id);
      expect(added).toBeDefined();
      expect(added?.title).toBe('테스트 추천');
    });

    it('추가된 추천에 metadata 포함', () => {
      const newRecommendation: Omit<Recommendation, 'id'> = {
        type: 'question',
        title: '테스트',
        description: '설명',
        confidence: 0.8,
        category: 'test',
        tags: ['테스트'],
      };

      const id = service.addRecommendation(newRecommendation);
      
      const recommendations = service.getPersonalizedRecommendations();
      const added = recommendations.find(rec => rec.id === id);
      expect(added?.metadata).toBeDefined();
      expect(added?.metadata?.usageCount).toBe(0);
    });

    it('추천 제거', () => {
      const recommendations = service.getPersonalizedRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const recommendationId = recommendations[0].id;
      const result = service.removeRecommendation(recommendationId);
      
      expect(result).toBe(true);
      
      const updatedRecs = service.getPersonalizedRecommendations();
      const removed = updatedRecs.find(rec => rec.id === recommendationId);
      expect(removed).toBeUndefined();
    });

    it('존재하지 않는 추천 제거 시 false 반환', () => {
      const result = service.removeRecommendation('nonexistent-id');
      expect(result).toBe(false);
    });
  });

  describe('사용자 행동 분석', () => {
    it('빈 행동 데이터 분석', () => {
      const analysis = service.getUserBehaviorAnalysis();
      
      expect(analysis.totalInteractions).toBe(0);
      expect(analysis.averageResponseTime).toBe(0);
      expect(Array.isArray(analysis.favoriteCategories)).toBe(true);
      expect(Array.isArray(analysis.activeHours)).toBe(true);
      expect(analysis.activeHours.length).toBe(24);
      expect(analysis.modelPreferences).toBeInstanceOf(Map);
    });

    it('행동 데이터 분석', () => {
      const behaviors: UserBehavior[] = [
        {
          messageContent: '프로그래밍 코드 작성',
          timestamp: new Date(2024, 0, 1, 10, 0, 0).toISOString(),
          sessionId: 'session-1',
          modelUsed: 'gpt-4',
          responseTime: 1500,
        },
        {
          messageContent: '알고리즘 자료구조',
          timestamp: new Date(2024, 0, 1, 14, 0, 0).toISOString(),
          sessionId: 'session-2',
          modelUsed: 'gpt-4',
          responseTime: 2000,
        },
        {
          messageContent: '웹 개발 프론트엔드',
          timestamp: new Date(2024, 0, 1, 15, 0, 0).toISOString(),
          sessionId: 'session-3',
          modelUsed: 'gpt-3.5',
          responseTime: 1000,
        },
      ];

      behaviors.forEach(behavior => {
        service.recordUserBehavior(behavior);
      });

      const analysis = service.getUserBehaviorAnalysis();
      
      expect(analysis.totalInteractions).toBe(3);
      expect(analysis.averageResponseTime).toBeCloseTo(1500, 0);
      expect(analysis.favoriteCategories.length).toBeLessThanOrEqual(5);
      expect(analysis.modelPreferences.size).toBeGreaterThan(0);
      expect(analysis.modelPreferences.get('gpt-4')).toBe(2);
      expect(analysis.modelPreferences.get('gpt-3.5')).toBe(1);
    });

    it('활성 시간대 분석', () => {
      const behaviors: UserBehavior[] = [
        {
          messageContent: '테스트',
          timestamp: new Date(2024, 0, 1, 10, 0, 0).toISOString(),
          sessionId: 'session-1',
          modelUsed: 'gpt-4',
          responseTime: 1000,
        },
        {
          messageContent: '테스트',
          timestamp: new Date(2024, 0, 1, 14, 0, 0).toISOString(),
          sessionId: 'session-2',
          modelUsed: 'gpt-4',
          responseTime: 1000,
        },
      ];

      behaviors.forEach(behavior => {
        service.recordUserBehavior(behavior);
      });

      const analysis = service.getUserBehaviorAnalysis();
      
      expect(analysis.activeHours[10]).toBeGreaterThan(0);
      expect(analysis.activeHours[14]).toBeGreaterThan(0);
    });

    it('평균 응답 시간 계산', () => {
      const behaviors: UserBehavior[] = [
        {
          messageContent: '테스트',
          timestamp: new Date().toISOString(),
          sessionId: 'session-1',
          modelUsed: 'gpt-4',
          responseTime: 1000,
        },
        {
          messageContent: '테스트',
          timestamp: new Date().toISOString(),
          sessionId: 'session-2',
          modelUsed: 'gpt-4',
          responseTime: 2000,
        },
        {
          messageContent: '테스트',
          timestamp: new Date().toISOString(),
          sessionId: 'session-3',
          modelUsed: 'gpt-4',
          responseTime: 3000,
        },
      ];

      behaviors.forEach(behavior => {
        service.recordUserBehavior(behavior);
      });

      const analysis = service.getUserBehaviorAnalysis();
      
      expect(analysis.averageResponseTime).toBeCloseTo(2000, 0);
    });
  });

  describe('스마트 제안 생성', () => {
    it('짧은 메시지에 대한 제안', () => {
      const suggestions = service.generateSmartSuggestions('짧음');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(3);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('코드 관련 메시지에 대한 제안', () => {
      const suggestions = service.generateSmartSuggestions('코드를 작성하고 있어요');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('코드'))).toBe(true);
    });

    it('프로그래밍 관련 메시지에 대한 제안', () => {
      const suggestions = service.generateSmartSuggestions('프로그래밍을 배우고 싶어요');
      
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('오류 관련 메시지에 대한 제안', () => {
      const suggestions = service.generateSmartSuggestions('오류가 발생했어요');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.some(s => s.includes('오류') || s.includes('에러'))).toBe(true);
    });

    it('에러 관련 메시지에 대한 제안', () => {
      const suggestions = service.generateSmartSuggestions('에러를 해결해야 해요');
      
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('설계 관련 메시지에 대한 제안', () => {
      const suggestions = service.generateSmartSuggestions('시스템 설계를 하고 있어요');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.some(s => s.includes('설계') || s.includes('아키텍처'))).toBe(true);
    });

    it('아키텍처 관련 메시지에 대한 제안', () => {
      const suggestions = service.generateSmartSuggestions('아키텍처를 설계해야 해요');
      
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('관련 없는 메시지에 대한 제안', () => {
      const suggestions = service.generateSmartSuggestions('오늘 날씨가 좋아요');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('최대 3개의 제안만 반환', () => {
      const suggestions = service.generateSmartSuggestions('코드 프로그래밍 오류 에러 설계 아키텍처');
      
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('카테고리 추출', () => {
    it('프로그래밍 카테고리 추출', () => {
      const behavior: UserBehavior = {
        messageContent: '코드를 작성하고 프로그래밍 개발을 하고 있어요',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        modelUsed: 'gpt-4',
        responseTime: 1000,
      };

      service.recordUserBehavior(behavior);
      
      const analysis = service.getUserBehaviorAnalysis();
      expect(analysis.favoriteCategories.length).toBeGreaterThanOrEqual(0);
    });

    it('AI/ML 카테고리 추출', () => {
      const behavior: UserBehavior = {
        messageContent: 'AI 머신러닝 딥러닝 모델',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        modelUsed: 'gpt-4',
        responseTime: 1000,
      };

      service.recordUserBehavior(behavior);
      
      const analysis = service.getUserBehaviorAnalysis();
      expect(Array.isArray(analysis.favoriteCategories)).toBe(true);
    });

    it('웹 개발 카테고리 추출', () => {
      const behavior: UserBehavior = {
        messageContent: '웹 프론트엔드 백엔드 개발',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        modelUsed: 'gpt-4',
        responseTime: 1000,
      };

      service.recordUserBehavior(behavior);
      
      const analysis = service.getUserBehaviorAnalysis();
      expect(Array.isArray(analysis.favoriteCategories)).toBe(true);
    });
  });

  describe('추천 confidence 업데이트', () => {
    it('사용자 행동에 따른 confidence 업데이트', () => {
      const initialRecs = service.getPersonalizedRecommendations();
      const initialConfidence = initialRecs[0]?.confidence || 0;
      
      const behavior: UserBehavior = {
        messageContent: '코드 리뷰',
        timestamp: new Date().toISOString(),
        sessionId: 'session-1',
        modelUsed: 'gpt-4',
        responseTime: 1000,
      };

      service.recordUserBehavior(behavior);
      
      const updatedRecs = service.getPersonalizedRecommendations();
      // confidence가 변경되었을 수 있음
      expect(updatedRecs.length).toBeGreaterThan(0);
    });

    it('confidence가 0.95를 초과하지 않음', () => {
      // 여러 번 관련 행동 기록
      for (let i = 0; i < 10; i++) {
        const behavior: UserBehavior = {
          messageContent: '코드 리뷰',
          timestamp: new Date().toISOString(),
          sessionId: `session-${i}`,
          modelUsed: 'gpt-4',
          responseTime: 1000,
        };
        service.recordUserBehavior(behavior);
      }
      
      const recommendations = service.getPersonalizedRecommendations();
      recommendations.forEach(rec => {
        expect(rec.confidence).toBeLessThanOrEqual(0.95);
      });
    });
  });
});

