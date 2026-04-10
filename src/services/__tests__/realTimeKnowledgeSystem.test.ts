/**
 * realTimeKnowledgeSystem 테스트
 */
import { realTimeKnowledgeSystem } from '../realTimeKnowledgeSystem';
import { clientFileProcessor } from '../clientFileProcessor';
import type { FileAnalysisResult } from '../clientFileProcessor';

jest.mock('../clientFileProcessor', () => ({
  clientFileProcessor: {
    processFile: jest.fn(),
    classifyFile: jest.fn(),
    getAutoLearningInsights: jest.fn(),
    getKnowledgeBase: jest.fn().mockReturnValue(null)
  }
}));

const mockFileAnalysis: FileAnalysisResult = {
  fileId: 'f-1',
  fileName: 'test.txt',
  fileType: 'text',
  extractedText: '테스트 내용',
  entities: [],
  topics: ['테스트'],
  summary: '테스트 요약',
  metadata: {}
};

const mockClassification = {
  category: 'document',
  confidence: 0.9,
  subCategories: ['text'],
  tags: ['test']
};

describe('realTimeKnowledgeSystem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.mocked(clientFileProcessor.processFile).mockResolvedValue(mockFileAnalysis);
    jest.mocked(clientFileProcessor.classifyFile).mockResolvedValue(mockClassification);
    jest.mocked(clientFileProcessor.getAutoLearningInsights).mockReturnValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processNewFile', () => {
    it('파일 처리 및 지식 업데이트', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await realTimeKnowledgeSystem.processNewFile(file, 'project-1');

      expect(result).toBeDefined();
      expect(result.fileAnalysis).toBeDefined();
      expect(result.classification).toBeDefined();
      expect(result.knowledgeUpdate).toBeDefined();
      expect(result.smartConnections).toBeDefined();
    });
  });

  describe('generateIntelligentResponse', () => {
    it('지능형 응답 생성', async () => {
      const result = await realTimeKnowledgeSystem.generateIntelligentResponse(
        '테스트 질문',
        'project-1',
        'session-1'
      );

      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(typeof result.confidence).toBe('number');
      expect(Array.isArray(result.sourceFiles)).toBe(true);
      expect(result.learningFeedback).toBeDefined();
    });

    it('첨부 파일과 함께 응답 생성', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await realTimeKnowledgeSystem.generateIntelligentResponse(
        '테스트 질문',
        'project-1',
        'session-1',
        [file]
      );

      expect(result).toBeDefined();
      expect(clientFileProcessor.processFile).toHaveBeenCalled();
    });
  });

  describe('subscribeToUpdates / unsubscribeFromUpdates', () => {
    it('업데이트 구독', () => {
      const callback = jest.fn();
      expect(() => {
        realTimeKnowledgeSystem.subscribeToUpdates('project-1', callback);
      }).not.toThrow();
    });

    it('업데이트 구독 해제', () => {
      const callback = jest.fn();
      realTimeKnowledgeSystem.subscribeToUpdates('project-1', callback);
      expect(() => {
        realTimeKnowledgeSystem.unsubscribeFromUpdates('project-1', callback);
      }).not.toThrow();
    });
  });

  describe('reinforceLearningPatterns', () => {
    it('학습 패턴 강화', async () => {
      await expect(
        realTimeKnowledgeSystem.reinforceLearningPatterns(
          mockFileAnalysis,
          mockClassification,
          'project-1'
        )
      ).resolves.not.toThrow();
    });
  });
});
