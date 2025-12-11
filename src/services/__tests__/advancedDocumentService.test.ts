/**
 * advancedDocumentService 서비스 테스트
 * 고급 문서 서비스 테스트
 */

import { advancedDocumentService, AdvancedDocumentRequest } from '../advancedDocumentService';
import { Message } from '../../types/chat';

// fetch 모킹
global.fetch = jest.fn();

describe('advancedDocumentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processAdvancedDocument', () => {
    it('문서를 처리할 수 있어야 함', async () => {
      const mockResponse = {
        document_structure: {
          sections: [],
          hierarchy: {},
          key_points: [],
          main_topics: [],
          supporting_details: [],
          processing_time: 100
        },
        multi_condition_analysis: {
          primary_condition: '조건1',
          secondary_conditions: [],
          conditional_statements: [],
          dependencies: [],
          priority_order: [],
          complexity_score: 5
        },
        context_memory: {
          conversation_id: 'conv-1',
          context_windows: [],
          long_term_memory: {},
          key_entities: {},
          relationship_graph: {},
          style_profile: {},
          memory_strength: 0.8
        },
        style_analysis: {
          tone: 'professional',
          formality_level: 0.7,
          emotion_indicators: [],
          vocabulary_style: 'formal',
          sentence_patterns: [],
          characteristic_phrases: [],
          consistency_score: 0.9
        },
        processed_response: '처리된 응답',
        detail_preservation_score: 0.85,
        context_continuity_score: 0.9,
        processing_metadata: {
          processing_time: 100,
          cache_used: false,
          parallel_processing: false,
          complexity_level: 5,
          memory_strength: 0.8
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request: AdvancedDocumentRequest = {
        documentText: '테스트 문서 내용',
        conversationHistory: [],
        userConditions: []
      };

      const result = await advancedDocumentService.processAdvancedDocument(request);

      expect(result).toBeDefined();
      expect(result.documentStructure).toBeDefined();
      expect(result.multiConditionAnalysis).toBeDefined();
      expect(result.contextMemory).toBeDefined();
      expect(result.styleAnalysis).toBeDefined();
      expect(result.processedResponse).toBeDefined();
      expect(typeof result.detailPreservationScore).toBe('number');
      expect(typeof result.contextContinuityScore).toBe('number');
    });

    it('API 호출 실패 시 fallback 응답을 반환해야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const request: AdvancedDocumentRequest = {
        documentText: '테스트 문서',
        conversationHistory: [],
        userConditions: []
      };

      const result = await advancedDocumentService.processAdvancedDocument(request);

      expect(result).toBeDefined();
      expect(result.processedResponse).toBeDefined();
      expect(result.documentStructure).toBeDefined();
    });

    it('네트워크 오류 시 fallback 응답을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const request: AdvancedDocumentRequest = {
        documentText: '테스트 문서',
        conversationHistory: [],
        userConditions: []
      };

      const result = await advancedDocumentService.processAdvancedDocument(request);

      expect(result).toBeDefined();
      expect(result.processedResponse).toBeDefined();
    });

    it('캐시된 결과를 반환해야 함', async () => {
      const mockResponse = {
        document_structure: { sections: [], hierarchy: {}, key_points: [], main_topics: [], supporting_details: [], processing_time: 100 },
        multi_condition_analysis: { primary_condition: '조건1', secondary_conditions: [], conditional_statements: [], dependencies: [], priority_order: [], complexity_score: 5 },
        context_memory: { conversation_id: 'conv-1', context_windows: [], long_term_memory: {}, key_entities: {}, relationship_graph: {}, style_profile: {}, memory_strength: 0.8 },
        style_analysis: { tone: 'professional', formality_level: 0.7, emotion_indicators: [], vocabulary_style: 'formal', sentence_patterns: [], characteristic_phrases: [], consistency_score: 0.9 },
        processed_response: '처리된 응답',
        detail_preservation_score: 0.85,
        context_continuity_score: 0.9,
        processing_metadata: { processing_time: 100, cache_used: false, parallel_processing: false, complexity_level: 5, memory_strength: 0.8 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request: AdvancedDocumentRequest = {
        documentText: '테스트 문서',
        conversationHistory: [],
        userConditions: []
      };

      // 첫 번째 호출
      const result1 = await advancedDocumentService.processAdvancedDocument(request);
      
      // 두 번째 호출 (캐시에서 가져와야 함)
      const result2 = await advancedDocumentService.processAdvancedDocument(request);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      // fetch는 한 번만 호출되어야 함 (캐시 사용)
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('analyzeLongConversation', () => {
    it('긴 대화를 분석할 수 있어야 함', async () => {
      const mockResponse = {
        document_structure: { sections: [], hierarchy: {}, key_points: [], main_topics: ['토픽1', '토픽2'], supporting_details: [], processing_time: 100 },
        multi_condition_analysis: { primary_condition: '조건1', secondary_conditions: [], conditional_statements: [], dependencies: [], priority_order: [], complexity_score: 5 },
        context_memory: { conversation_id: 'conv-1', context_windows: [], long_term_memory: {}, key_entities: {}, relationship_graph: {}, style_profile: {}, memory_strength: 0.8 },
        style_analysis: { tone: 'professional', formality_level: 0.7, emotion_indicators: [], vocabulary_style: 'formal', sentence_patterns: [], characteristic_phrases: [], consistency_score: 0.9 },
        processed_response: '처리된 응답',
        detail_preservation_score: 0.85,
        context_continuity_score: 0.9,
        processing_metadata: { processing_time: 100, cache_used: false, parallel_processing: false, complexity_level: 5, memory_strength: 0.8 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const messages: Message[] = [
        { id: '1', role: 'user', content: '메시지 1', timestamp: new Date().toISOString() },
        { id: '2', role: 'assistant', content: '응답 1', timestamp: new Date().toISOString() }
      ];

      const result = await advancedDocumentService.analyzeLongConversation(messages, 'context-1');

      expect(result).toBeDefined();
      expect(typeof result.memoryStrength).toBe('number');
      expect(typeof result.continuityScore).toBe('number');
      expect(Array.isArray(result.keyTopics)).toBe(true);
      expect(typeof result.styleConsistency).toBe('number');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('오류 발생 시 기본값을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const messages: Message[] = [
        { id: '1', role: 'user', content: '메시지 1', timestamp: new Date().toISOString() }
      ];

      const result = await advancedDocumentService.analyzeLongConversation(messages);

      expect(result).toBeDefined();
      expect(typeof result.memoryStrength).toBe('number');
      expect(Array.isArray(result.keyTopics)).toBe(true);
    });
  });

  describe('processComplexRequest', () => {
    it('복잡한 요청을 처리할 수 있어야 함', async () => {
      const mockResponse = {
        document_structure: { sections: [], hierarchy: {}, key_points: [], main_topics: [], supporting_details: [], processing_time: 100 },
        multi_condition_analysis: { primary_condition: '조건1', secondary_conditions: [], conditional_statements: [], dependencies: [], priority_order: ['우선순위1'], complexity_score: 8 },
        context_memory: { conversation_id: 'conv-1', context_windows: [], long_term_memory: {}, key_entities: {}, relationship_graph: {}, style_profile: {}, memory_strength: 0.8 },
        style_analysis: { tone: 'professional', formality_level: 0.7, emotion_indicators: [], vocabulary_style: 'formal', sentence_patterns: [], characteristic_phrases: [], consistency_score: 0.9 },
        processed_response: '처리된 응답',
        detail_preservation_score: 0.85,
        context_continuity_score: 0.9,
        processing_metadata: { processing_time: 100, cache_used: false, parallel_processing: false, complexity_level: 5, memory_strength: 0.8 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const messages: Message[] = [
        { id: '1', role: 'user', content: '메시지 1', timestamp: new Date().toISOString() }
      ];

      const result = await advancedDocumentService.processComplexRequest(
        '복잡한 요청 내용',
        messages,
        ['조건1', '조건2', '조건3']
      );

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(typeof result.processingTime).toBe('number');
      expect(typeof result.complexityScore).toBe('number');
      expect(Array.isArray(result.priorityOrder)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('많은 조건이 있을 때 high 우선순위를 사용해야 함', async () => {
      const mockResponse = {
        document_structure: { sections: [], hierarchy: {}, key_points: [], main_topics: [], supporting_details: [], processing_time: 100 },
        multi_condition_analysis: { primary_condition: '조건1', secondary_conditions: [], conditional_statements: [], dependencies: [], priority_order: [], complexity_score: 5 },
        context_memory: { conversation_id: 'conv-1', context_windows: [], long_term_memory: {}, key_entities: {}, relationship_graph: {}, style_profile: {}, memory_strength: 0.8 },
        style_analysis: { tone: 'professional', formality_level: 0.7, emotion_indicators: [], vocabulary_style: 'formal', sentence_patterns: [], characteristic_phrases: [], consistency_score: 0.9 },
        processed_response: '처리된 응답',
        detail_preservation_score: 0.85,
        context_continuity_score: 0.9,
        processing_metadata: { processing_time: 100, cache_used: false, parallel_processing: false, complexity_level: 5, memory_strength: 0.8 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const messages: Message[] = [];
      const conditions = ['조건1', '조건2', '조건3', '조건4'];

      await advancedDocumentService.processComplexRequest(
        '복잡한 요청',
        messages,
        conditions
      );

      expect(fetch).toHaveBeenCalled();
      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.priority_level).toBe('high');
    });

    it('오류 발생 시 기본 응답을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const messages: Message[] = [];
      const result = await advancedDocumentService.processComplexRequest(
        '요청',
        messages,
        []
      );

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('generateContextualResponse', () => {
    it('맥락 유지 응답을 생성할 수 있어야 함', async () => {
      const mockResponse = {
        document_structure: { sections: [], hierarchy: {}, key_points: [], main_topics: [], supporting_details: [], processing_time: 100 },
        multi_condition_analysis: { primary_condition: '조건1', secondary_conditions: [], conditional_statements: [], dependencies: [], priority_order: [], complexity_score: 5 },
        context_memory: { conversation_id: 'conv-1', context_windows: [], long_term_memory: {}, key_entities: {}, relationship_graph: {}, style_profile: {}, memory_strength: 0.9 },
        style_analysis: { tone: 'professional', formality_level: 0.7, emotion_indicators: [], vocabulary_style: 'formal', sentence_patterns: [], characteristic_phrases: [], consistency_score: 0.95 },
        processed_response: '맥락 유지 응답',
        detail_preservation_score: 0.9,
        context_continuity_score: 0.95,
        processing_metadata: { processing_time: 100, cache_used: false, parallel_processing: false, complexity_level: 5, memory_strength: 0.9 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const messages: Message[] = [
        { id: '1', role: 'user', content: '이전 메시지', timestamp: new Date().toISOString() }
      ];

      const result = await advancedDocumentService.generateContextualResponse(
        '현재 메시지',
        messages,
        'context-1'
      );

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(typeof result.contextStrength).toBe('number');
      expect(typeof result.styleMatching).toBe('number');
      expect(typeof result.detailPreservation).toBe('number');
      expect(Array.isArray(result.followUpSuggestions)).toBe(true);
    });

    it('오류 발생 시 기본 응답을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const messages: Message[] = [];
      const result = await advancedDocumentService.generateContextualResponse(
        '메시지',
        messages,
        'context-1'
      );

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
    });
  });

  describe('analyzeStyleConsistency', () => {
    it('스타일 일관성을 분석할 수 있어야 함', async () => {
      const mockResponse = {
        document_structure: { sections: [], hierarchy: {}, key_points: [], main_topics: [], supporting_details: [], processing_time: 100 },
        multi_condition_analysis: { primary_condition: '조건1', secondary_conditions: [], conditional_statements: [], dependencies: [], priority_order: [], complexity_score: 5 },
        context_memory: { conversation_id: 'conv-1', context_windows: [], long_term_memory: {}, key_entities: {}, relationship_graph: {}, style_profile: {}, memory_strength: 0.8 },
        style_analysis: { tone: 'professional', formality_level: 0.7, emotion_indicators: [], vocabulary_style: 'formal', sentence_patterns: [], characteristic_phrases: [], consistency_score: 0.9 },
        processed_response: '처리된 응답',
        detail_preservation_score: 0.85,
        context_continuity_score: 0.9,
        processing_metadata: { processing_time: 100, cache_used: false, parallel_processing: false, complexity_level: 5, memory_strength: 0.8 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const messages: Message[] = [
        { id: '1', role: 'user', content: '메시지 1', timestamp: new Date().toISOString(), isUser: true },
        { id: '2', role: 'assistant', content: '응답 1', timestamp: new Date().toISOString(), isUser: false },
        { id: '3', role: 'user', content: '메시지 2', timestamp: new Date().toISOString(), isUser: true },
        { id: '4', role: 'user', content: '메시지 3', timestamp: new Date().toISOString(), isUser: true }
      ];

      const result = await advancedDocumentService.analyzeStyleConsistency(messages);

      expect(result).toBeDefined();
      expect(typeof result.overallConsistency).toBe('number');
      expect(typeof result.toneStability).toBe('number');
      expect(typeof result.formalityConsistency).toBe('number');
      expect(typeof result.vocabularyConsistency).toBe('number');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('오류 발생 시 기본값을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const messages: Message[] = [];
      const result = await advancedDocumentService.analyzeStyleConsistency(messages);

      expect(result).toBeDefined();
      expect(typeof result.overallConsistency).toBe('number');
      expect(typeof result.toneStability).toBe('number');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 문서를 처리할 수 있어야 함', async () => {
      const mockResponse = {
        document_structure: { sections: [], hierarchy: {}, key_points: ['재개발', '프로젝트'], main_topics: ['재개발 프로젝트'], supporting_details: [], processing_time: 100 },
        multi_condition_analysis: { primary_condition: '재개발', secondary_conditions: [], conditional_statements: [], dependencies: [], priority_order: [], complexity_score: 5 },
        context_memory: { conversation_id: 'conv-1', context_windows: [], long_term_memory: {}, key_entities: {}, relationship_graph: {}, style_profile: {}, memory_strength: 0.8 },
        style_analysis: { tone: 'professional', formality_level: 0.7, emotion_indicators: [], vocabulary_style: 'formal', sentence_patterns: [], characteristic_phrases: [], consistency_score: 0.9 },
        processed_response: '재개발 프로젝트 관련 응답',
        detail_preservation_score: 0.85,
        context_continuity_score: 0.9,
        processing_metadata: { processing_time: 100, cache_used: false, parallel_processing: false, complexity_level: 5, memory_strength: 0.8 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const request: AdvancedDocumentRequest = {
        documentText: '개포우성7차 재개발 프로젝트 시공사 선정 관련 문서',
        conversationHistory: [],
        userConditions: ['재개발', '시공사 선정']
      };

      const result = await advancedDocumentService.processAdvancedDocument(request);

      expect(result).toBeDefined();
      expect(result.documentStructure.mainTopics.length).toBeGreaterThanOrEqual(0);
    });
  });
});

