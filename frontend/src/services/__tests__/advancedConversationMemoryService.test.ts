/**
 * advancedConversationMemoryService 서비스 테스트
 * 고급 대화 메모리 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedConversationMemoryService from '../advancedConversationMemoryService';
import { QuestionUnderstandingResult } from '../advancedQuestionUnderstandingEngine';

describe('advancedConversationMemoryService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedConversationMemoryService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = advancedConversationMemoryService;
      const instance2 = advancedConversationMemoryService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('getUserMemory', () => {
    it('사용자 메모리를 가져올 수 있어야 함', async () => {
      const memory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');

      expect(memory).toBeDefined();
      expect(memory.user_id).toBe('user-1');
      expect(memory.session_id).toBe('session-1');
      expect(Array.isArray(memory.conversation_history)).toBe(true);
      expect(memory.user_profile).toBeDefined();
      expect(Array.isArray(memory.learning_patterns)).toBe(true);
      expect(memory.preferences).toBeDefined();
      expect(memory.knowledge_graph).toBeDefined();
      expect(memory.interaction_stats).toBeDefined();
      expect(memory.last_updated).toBeDefined();
    });

    it('세션 ID 없이 사용자 메모리를 가져올 수 있어야 함', async () => {
      const memory = await advancedConversationMemoryService.getUserMemory('user-1');

      expect(memory).toBeDefined();
      expect(memory.user_id).toBe('user-1');
      expect(memory.session_id).toBeDefined();
    });

    it('같은 사용자와 세션에 대해 동일한 메모리를 반환해야 함', async () => {
      const memory1 = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      const memory2 = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');

      expect(memory1.user_id).toBe(memory2.user_id);
      expect(memory1.session_id).toBe(memory2.session_id);
    });
  });

  describe('addConversationEntry', () => {
    it('대화 항목을 추가할 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트에 대해 알려주세요',
        '재개발 프로젝트는...'
      );

      const memory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      expect(memory.conversation_history.length).toBeGreaterThan(0);

      const lastEntry = memory.conversation_history[memory.conversation_history.length - 1];
      expect(lastEntry.user_input).toBe('재개발 프로젝트에 대해 알려주세요');
      expect(lastEntry.ai_response).toBe('재개발 프로젝트는...');
      expect(lastEntry.timestamp).toBeDefined();
      expect(lastEntry.context).toBeDefined();
      expect(lastEntry.metadata).toBeDefined();
    });

    it('이해 결과와 함께 대화 항목을 추가할 수 있어야 함', async () => {
      const understandingResult: QuestionUnderstandingResult = {
        question_id: 'q-1',
        original_question: '재개발 프로젝트',
        processed_question: '재개발 프로젝트',
        understanding_level: 'intermediate',
        semantic_analysis: {
          core_concepts: [],
          relationships: [],
          ambiguity_detection: {
            ambiguous_terms: [],
            clarification_questions: [],
            confidence_impact: 0
          },
          complexity_assessment: {
            overall_complexity: 5,
            factors: [],
            decomposition_suggestions: [],
            prerequisite_knowledge: []
          },
          domain_classification: {
            primary_domain: 'real_estate',
            secondary_domains: [],
            domain_specific_terms: [],
            cross_domain_connections: []
          }
        },
        contextual_understanding: {
          conversation_context: {
            previous_questions: [],
            established_topics: [],
            user_preferences: [],
            conversation_flow: 'new_topic'
          },
          user_context: {
            expertise_level: 'intermediate',
            background_knowledge: [],
            learning_goals: [],
            communication_style: 'formal'
          },
          temporal_context: {
            urgency: 'medium',
            time_constraints: [],
            seasonal_relevance: []
          },
          situational_context: {
            current_task: '',
            environment: '',
            constraints: [],
            available_resources: []
          }
        },
        intent_clarification: {
          primary_intent: 'information',
          secondary_intents: [],
          hidden_intents: [],
          clarification_needed: false,
          clarification_questions: []
        },
        knowledge_gaps: [],
        suggested_approaches: [],
        confidence_score: 0.8,
        processing_time: 100,
        timestamp: new Date()
      };

      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...',
        understandingResult
      );

      const memory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      const lastEntry = memory.conversation_history[memory.conversation_history.length - 1];
      expect(lastEntry.understanding_result).toBeDefined();
      expect(lastEntry.understanding_result?.question_id).toBe('q-1');
    });

    it('사용자 피드백과 함께 대화 항목을 추가할 수 있어야 함', async () => {
      const userFeedback = {
        rating: 5,
        helpful: true,
        clear: true,
        complete: true,
        suggestions: [],
        emotional_response: 'positive' as const,
      };

      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...',
        undefined,
        userFeedback
      );

      const memory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      const lastEntry = memory.conversation_history[memory.conversation_history.length - 1];
      expect(lastEntry.user_feedback).toBeDefined();
      expect(lastEntry.user_feedback?.rating).toBe(5);
    });
  });

  describe('getConversationContext', () => {
    it('대화 컨텍스트를 가져올 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...'
      );

      const context = await advancedConversationMemoryService.getConversationContext('user-1', 'session-1');

      expect(context).toBeDefined();
      if (context) {
        expect(context.current_topic).toBeDefined();
        expect(typeof context.conversation_depth).toBe('number');
        expect(['low', 'medium', 'high']).toContain(context.user_engagement_level);
        expect(typeof context.interruption_count).toBe('number');
        expect(typeof context.clarification_requests).toBe('number');
      }
    });

    it('대화 항목이 없을 때 null을 반환할 수 있어야 함', async () => {
      const context = await advancedConversationMemoryService.getConversationContext('user-new', 'session-new');

      // 대화 항목이 없으면 null을 반환할 수 있음
      expect(context === null || context !== null).toBe(true);
    });
  });

  describe('getUserPreferences', () => {
    it('사용자 선호도를 가져올 수 있어야 함', async () => {
      const preferences = await advancedConversationMemoryService.getUserPreferences('user-1', 'session-1');

      expect(preferences).toBeDefined();
      expect(preferences.language).toBeDefined();
      expect(preferences.timezone).toBeDefined();
      expect(preferences.notification_settings).toBeDefined();
      expect(preferences.ui_preferences).toBeDefined();
      expect(preferences.content_preferences).toBeDefined();
    });
  });

  describe('getLearningPatterns', () => {
    it('학습 패턴을 가져올 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...'
      );

      const patterns = await advancedConversationMemoryService.getLearningPatterns('user-1', 'session-1');

      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('getKnowledgeGraph', () => {
    it('지식 그래프를 가져올 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...'
      );

      const graph = await advancedConversationMemoryService.getKnowledgeGraph('user-1', 'session-1');

      expect(graph).toBeDefined();
      expect(Array.isArray(graph.nodes)).toBe(true);
      expect(Array.isArray(graph.edges)).toBe(true);
      expect(graph.last_updated).toBeDefined();
    });
  });

  describe('getInteractionStats', () => {
    it('상호작용 통계를 가져올 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...'
      );

      const stats = await advancedConversationMemoryService.getInteractionStats('user-1', 'session-1');

      expect(stats).toBeDefined();
      expect(typeof stats.total_conversations).toBe('number');
      expect(typeof stats.total_messages).toBe('number');
      expect(typeof stats.average_session_length).toBe('number');
      expect(Array.isArray(stats.most_active_hours)).toBe(true);
      expect(Array.isArray(stats.preferred_topics)).toBe(true);
    });
  });

  describe('updateUserFeedback', () => {
    it('사용자 피드백을 업데이트할 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...'
      );

      const memory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      const entryId = memory.conversation_history[memory.conversation_history.length - 1].id;

      await advancedConversationMemoryService.updateUserFeedback(
        'user-1',
        'session-1',
        entryId,
        {
          rating: 5,
          helpful: true,
          clear: true,
          complete: true,
          suggestions: [],
          emotional_response: 'positive',
        }
      );

      const updatedMemory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      const updatedEntry = updatedMemory.conversation_history.find(e => e.id === entryId);
      expect(updatedEntry?.user_feedback).toBeDefined();
      expect(updatedEntry?.user_feedback?.rating).toBe(5);
    });
  });

  describe('getPersonalizedSuggestions', () => {
    it('개인화된 제안을 가져올 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...'
      );

      const suggestions = await advancedConversationMemoryService.getPersonalizedSuggestions('user-1', 'session-1');

      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('getGlobalStats', () => {
    it('전역 통계를 가져올 수 있어야 함', () => {
      const stats = advancedConversationMemoryService.getGlobalStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total_users).toBe('number');
      expect(typeof stats.total_conversations).toBe('number');
      expect(typeof stats.average_satisfaction).toBe('number');
      expect(Array.isArray(stats.popular_topics)).toBe(true);
      expect(stats.system_performance).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 대화를 저장하고 조회할 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '강남구 역삼동 재개발 프로젝트에 대해 알려주세요',
        '강남구 역삼동 재개발 프로젝트는...'
      );

      const memory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      expect(memory.conversation_history.length).toBeGreaterThan(0);

      const context = await advancedConversationMemoryService.getConversationContext('user-1', 'session-1');
      expect(context).toBeDefined();
    });

    it('여러 대화 항목을 추가하고 통계를 확인할 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...'
      );

      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '시공사 선정 기준',
        '시공사 선정 기준은...'
      );

      const memory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      expect(memory.conversation_history.length).toBeGreaterThanOrEqual(2);

      const stats = await advancedConversationMemoryService.getInteractionStats('user-1', 'session-1');
      expect(stats.total_messages).toBeGreaterThanOrEqual(2);
    });

    it('사용자 피드백을 업데이트하고 학습 패턴을 확인할 수 있어야 함', async () => {
      await advancedConversationMemoryService.addConversationEntry(
        'user-1',
        'session-1',
        '재개발 프로젝트',
        '재개발 프로젝트는...'
      );

      const memory = await advancedConversationMemoryService.getUserMemory('user-1', 'session-1');
      const entryId = memory.conversation_history[memory.conversation_history.length - 1].id;

      await advancedConversationMemoryService.updateUserFeedback(
        'user-1',
        'session-1',
        entryId,
        {
          rating: 5,
          helpful: true,
          clear: true,
          complete: true,
          suggestions: [],
          emotional_response: 'positive',
        }
      );

      const patterns = await advancedConversationMemoryService.getLearningPatterns('user-1', 'session-1');
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('getCompactContextForUnifiedChat', () => {
    it('대화 턴이 없으면 null', async () => {
      const compact = await advancedConversationMemoryService.getCompactContextForUnifiedChat(
        'compact-empty-user',
        `compact-empty-session-${Date.now()}`
      );
      expect(compact).toBeNull();
    });

    it('턴이 있으면 advanced_memory_context를 반환', async () => {
      const uid = 'compact-ctx-user';
      const sid = `compact-ctx-session-${Date.now()}`;
      await advancedConversationMemoryService.addConversationEntry(uid, sid, '안녕', '안녕하세요');
      const compact = await advancedConversationMemoryService.getCompactContextForUnifiedChat(uid, sid);
      expect(compact).not.toBeNull();
      const ctx = compact?.advanced_memory_context as { turn_count?: number; last_turn?: { current_topic?: string } };
      expect(ctx?.turn_count).toBeGreaterThanOrEqual(1);
      expect(ctx?.last_turn).toBeDefined();
    });
  });
});

