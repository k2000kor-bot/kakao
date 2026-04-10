/**
 * UltimateMediaKnowledgeService 테스트
 */
import UltimateMediaKnowledgeService from '../ultimateMediaKnowledgeService';
import type { ExtractedKnowledge } from '../ultimateMediaKnowledgeService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

describe('UltimateMediaKnowledgeService', () => {
  const service = UltimateMediaKnowledgeService.getInstance();

  beforeEach(() => {
    installJestFetchMock();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    restoreGlobalFetch(originalFetch);
    jest.restoreAllMocks();
  });

  const mockKnowledge: ExtractedKnowledge = {
    content: '테스트 콘텐츠',
    confidence: 0.9,
    knowledge_type: '문서',
    entities: ['엔터티1', '엔터티2'],
    relationships: {},
    insights: ['인사이트1'],
    source_location: 'source',
    timestamp: new Date().toISOString()
  };

  describe('getInstance', () => {
    it('싱글톤 인스턴스 반환', () => {
      const a = UltimateMediaKnowledgeService.getInstance();
      const b = UltimateMediaKnowledgeService.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('generatePersuasiveContent', () => {
    it('설득 콘텐츠 문자열 생성', () => {
      const result = service.generatePersuasiveContent(mockKnowledge);

      expect(typeof result).toBe('string');
      expect(result).toContain('지식 분석 결과');
      expect(result).toContain('90.0%');
      expect(result).toContain('엔터티1');
    });

    it('빈 엔터티·인사이트 처리', () => {
      const empty = { ...mockKnowledge, entities: [], insights: [] };
      const result = service.generatePersuasiveContent(empty);

      expect(result).toBeDefined();
      expect(result).toContain('지식 분석 결과');
    });
  });

  describe('generateKnowledgeSummary', () => {
    it('지식 요약 생성', () => {
      const result = service.generateKnowledgeSummary(mockKnowledge);

      expect(typeof result).toBe('string');
      expect(result).toContain('지식 요약');
      expect(result).toContain('문서');
      expect(result).toContain('90.0%');
    });
  });

  describe('generateLearningInsights', () => {
    it('학습 인사이트 생성 (고신뢰도)', () => {
      const result = service.generateLearningInsights({ ...mockKnowledge, confidence: 0.85 });

      expect(typeof result).toBe('string');
      expect(result).toContain('학습 인사이트');
      expect(result).toContain('고품질');
    });

    it('학습 인사이트 생성 (저신뢰도)', () => {
      const result = service.generateLearningInsights({ ...mockKnowledge, confidence: 0.5 });

      expect(result).toContain('낮은 품질');
    });
  });

  describe('getKnowledgeBase', () => {
    it('지식 베이스 조회 성공', async () => {
      const mockResponse = {
        project_id: 'p1',
        knowledge_items: 2,
        knowledge_base: [mockKnowledge]
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await service.getKnowledgeBase('p1');

      expect(result).toEqual(mockResponse);
    });

    it('조회 실패 시 에러', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

      await expect(service.getKnowledgeBase('p1')).rejects.toThrow();
    });
  });

  describe('getLearningHistory', () => {
    it('학습 히스토리 조회 성공', async () => {
      const mockHistory = {
        project_id: 'p1',
        total_events: 1,
        learning_sessions: []
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistory)
      });

      const result = await service.getLearningHistory('p1');

      expect(result).toEqual(mockHistory);
    });
  });

  describe('checkSystemHealth', () => {
    it('시스템 상태 확인 성공', async () => {
      const mockHealth = {
        status: 'healthy',
        version: '1.0',
        ai_models_loaded: 3,
        timestamp: new Date().toISOString()
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealth)
      });

      const result = await service.checkSystemHealth();

      expect(result).toEqual(mockHealth);
    });
  });

  describe('searchKnowledge', () => {
    it('지식 검색 성공', async () => {
      const mockSearch = {
        project_id: 'p1',
        query: '테스트',
        matches: [],
        count: 0
      };

      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearch)
      });

      const result = await service.searchKnowledge('p1', '테스트');

      expect(result).toEqual(mockSearch);
    });
  });

  describe('clearProjectKnowledge', () => {
    it('지식 초기화 성공', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ project_id: 'p1', deleted_items: 5, status: 'ok' })
      });

      const result = await service.clearProjectKnowledge('p1');

      expect(result.project_id).toBe('p1');
      expect(result.deleted_items).toBe(5);
    });
  });
});
