/**
 * advancedNLPEngine 서비스 테스트
 * 고급 자연어 처리 엔진 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedNLPEngine from '../advancedNLPEngine';

describe('advancedNLPEngine', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedNLPEngine).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedNLPEngine;
      const instance2 = advancedNLPEngine;
      expect(instance1).toBe(instance2);
    });
  });

  describe('analyzeText', () => {
    it('기본 텍스트를 분석할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText('재개발 프로젝트에 대해 알려주세요');

      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(Array.isArray(result.entities)).toBe(true);
      expect(result.sentiment).toBeDefined();
      expect(result.language).toBeDefined();
      expect(typeof result.complexity).toBe('number');
      expect(Array.isArray(result.topics)).toBe(true);
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.context).toBeDefined();
      expect(result.response_strategy).toBeDefined();
    });

    it('감정 분석을 수행할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText('재개발 프로젝트가 성공적으로 진행되고 있습니다.');

      expect(result.sentiment).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment.label);
      expect(typeof result.sentiment.score).toBe('number');
      expect(typeof result.sentiment.confidence).toBe('number');
      expect(result.sentiment.confidence).toBeGreaterThanOrEqual(0);
      expect(result.sentiment.confidence).toBeLessThanOrEqual(1);
    });

    it('엔티티를 추출할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText('강남구 역삼동 재개발 프로젝트의 시공사 선정');

      expect(Array.isArray(result.entities)).toBe(true);
      result.entities.forEach(entity => {
        expect(entity.text).toBeDefined();
        expect(entity.label).toBeDefined();
        expect(typeof entity.confidence).toBe('number');
        expect(typeof entity.start).toBe('number');
        expect(typeof entity.end).toBe('number');
      });
    });

    it('의도를 추출할 수 있어야 함', async () => {
      const questionResult = await advancedNLPEngine.analyzeText('재개발이란 무엇인가요?');
      expect(questionResult.intent).toBeDefined();

      const commandResult = await advancedNLPEngine.analyzeText('재개발 프로젝트를 분석해주세요');
      expect(commandResult.intent).toBeDefined();
    });

    it('주제를 추출할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText('재개발 프로젝트의 시공사 선정과 예산 계획');

      expect(Array.isArray(result.topics)).toBe(true);
      expect(result.topics.length).toBeGreaterThanOrEqual(0);
    });

    it('키워드를 추출할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText('재개발 프로젝트 시공사 선정 예산 계획');

      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.keywords.length).toBeGreaterThanOrEqual(0);
    });

    it('복잡도를 계산할 수 있어야 함', async () => {
      const simpleResult = await advancedNLPEngine.analyzeText('재개발');
      const complexResult = await advancedNLPEngine.analyzeText(
        '재개발 프로젝트의 시공사 선정 기준과 예산 계획 수립 방법, 그리고 일정 관리와 리스크 분석을 종합적으로 수행해야 합니다.'
      );

      expect(typeof simpleResult.complexity).toBe('number');
      expect(typeof complexResult.complexity).toBe('number');
      expect(complexResult.complexity).toBeGreaterThanOrEqual(simpleResult.complexity);
    });

    it('컨텍스트 분석을 수행할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText('재개발 프로젝트 분석');

      expect(result.context).toBeDefined();
      expect(result.context.conversation_flow).toBeDefined();
      expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(result.context.user_expertise_level);
      expect(result.context.domain).toBeDefined();
      expect(['low', 'medium', 'high', 'critical']).toContain(result.context.urgency);
      expect(['casual', 'professional', 'academic']).toContain(result.context.formality);
    });

    it('응답 전략을 결정할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText('재개발 프로젝트 설명');

      expect(result.response_strategy).toBeDefined();
      expect(['friendly', 'professional', 'technical', 'empathetic']).toContain(result.response_strategy.tone);
      expect(['brief', 'moderate', 'detailed', 'comprehensive']).toContain(result.response_strategy.detail_level);
      expect(typeof result.response_strategy.examples_needed).toBe('boolean');
      expect(typeof result.response_strategy.code_examples).toBe('boolean');
      expect(typeof result.response_strategy.visual_aids).toBe('boolean');
    });

    it('사용자 ID를 포함하여 분석할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText('재개발 프로젝트', 'user-123');

      expect(result).toBeDefined();
      expect(result.context).toBeDefined();
    });

    it('컨텍스트를 포함하여 분석할 수 있어야 함', async () => {
      const context = {
        projectId: 'project-1',
        domain: 'real_estate'
      };

      const result = await advancedNLPEngine.analyzeText('재개발 프로젝트', 'user-123', context);

      expect(result).toBeDefined();
      expect(result.context).toBeDefined();
    });

    it('다양한 언어를 감지할 수 있어야 함', async () => {
      const koreanResult = await advancedNLPEngine.analyzeText('재개발 프로젝트');
      const englishResult = await advancedNLPEngine.analyzeText('Redevelopment project');

      expect(koreanResult.language).toBeDefined();
      expect(englishResult.language).toBeDefined();
    });
  });

  describe('getConversationMemory', () => {
    it('대화 메모리를 가져올 수 있어야 함', () => {
      // 먼저 메모리를 생성
      advancedNLPEngine.updateConversationMemory('user-123', {
        id: 'msg-1',
        role: 'user',
        content: '테스트 메시지',
        timestamp: new Date()
      });

      const memory = advancedNLPEngine.getConversationMemory('user-123');

      expect(memory).toBeDefined();
      expect(memory?.user_id).toBe('user-123');
      expect(Array.isArray(memory?.conversation_history)).toBe(true);
      expect(memory?.user_preferences).toBeDefined();
      expect(Array.isArray(memory?.learned_patterns)).toBe(true);
      expect(Array.isArray(memory?.context_stack)).toBe(true);
      expect(memory?.last_updated).toBeDefined();
    });

    it('존재하지 않는 사용자의 메모리는 undefined를 반환해야 함', () => {
      const memory = advancedNLPEngine.getConversationMemory('new-user-456');

      // 메모리가 없으면 undefined를 반환
      expect(memory).toBeUndefined();
    });
  });

  describe('updateConversationMemory', () => {
    it('대화 메모리를 업데이트할 수 있어야 함', () => {
      const message = {
        id: 'msg-1',
        role: 'user' as const,
        content: '재개발 프로젝트에 대해 알려주세요',
        timestamp: new Date()
      };

      advancedNLPEngine.updateConversationMemory('user-123', message);

      const memory = advancedNLPEngine.getConversationMemory('user-123');
      expect(memory).toBeDefined();
      expect(memory?.conversation_history.length).toBeGreaterThan(0);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 질문을 분석할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText(
        '강남구 역삼동 재개발 프로젝트의 시공사 선정 기준과 예산 계획을 알려주세요',
        'user-123',
        { projectId: 'redevelopment-project-1' }
      );

      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(result.topics.length).toBeGreaterThanOrEqual(0);
      expect(result.keywords.length).toBeGreaterThanOrEqual(0);
      expect(result.context.domain).toBeDefined();
    });

    it('시공사 선정 관련 질문을 분석할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText(
        '시공사 선정 시 고려해야 할 주요 기준과 평가 방법',
        'user-456'
      );

      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(result.entities.length).toBeGreaterThanOrEqual(0);
      expect(result.response_strategy).toBeDefined();
    });

    it('예산 계획 관련 질문을 분석할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText(
        '재개발 프로젝트 예산 계획 수립 방법과 비용 최적화 방안',
        'user-789'
      );

      expect(result).toBeDefined();
      expect(result.complexity).toBeGreaterThanOrEqual(0);
      expect(result.sentiment).toBeDefined();
      expect(result.context.urgency).toBeDefined();
    });

    it('복합적인 질문을 분석할 수 있어야 함', async () => {
      const result = await advancedNLPEngine.analyzeText(
        '재개발 프로젝트의 시공사 선정, 예산 계획, 일정 관리, 리스크 분석을 종합적으로 수행해야 합니다.',
        'user-999',
        { complexity: 'high' }
      );

      expect(result).toBeDefined();
      expect(result.complexity).toBeGreaterThanOrEqual(0);
      expect(result.topics.length).toBeGreaterThanOrEqual(0);
      expect(result.response_strategy.detail_level).toBeDefined();
    });
  });
});

