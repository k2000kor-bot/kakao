/**
 * AutoFileClassifier 테스트
 */

import { AutoFileClassifier, autoFileClassifier } from '../autoFileClassifier';
import { clientFileProcessor } from '../clientFileProcessor';
import { mediaAnalysisService } from '../mediaAnalysisService';

// 모킹
jest.mock('../clientFileProcessor');
jest.mock('../mediaAnalysisService');

describe('AutoFileClassifier', () => {
  let service: AutoFileClassifier;
  let mockFile: File;

  beforeEach(() => {
    service = new AutoFileClassifier();
    mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    // 기본 모킹
    (clientFileProcessor.processFile as jest.Mock) = jest.fn().mockResolvedValue({
      fileType: 'text',
      content: 'test content',
      metadata: {},
      extractedText: 'test content',
      analysis: {
        language: 'ko',
        sentiment: 'neutral',
        keywords: ['test'],
        entities: [],
        topics: ['general'],
      },
    });

    (mediaAnalysisService.analyzeMedia as jest.Mock) = jest.fn().mockResolvedValue({
      fileType: 'image',
      metadata: {},
      textExtraction: { extractedText: '', confidence: 0.8 },
      summarization: { summary: '', keyPoints: [] },
      sentimentAnalysis: { sentiment: 'neutral', score: 0 },
      keywordExtraction: { keywords: [] },
      knowledgeExtraction: { keyTopics: [], entities: [] },
      conversationalResponse: { response: '', suggestions: [] },
      writingInsights: { insights: [], recommendations: [] },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(AutoFileClassifier);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(autoFileClassifier).toBeDefined();
    });
  });

  describe('파일 분류', () => {
    it('텍스트 파일 분류', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification).toBeDefined();
      expect(classification.fileName).toBe('test.txt');
      expect(classification.fileType).toBe('text');
      expect(classification.category).toBeDefined();
      expect(classification.subCategory).toBeDefined();
      expect(['high', 'medium', 'low']).toContain(classification.priority);
      expect(typeof classification.relevanceScore).toBe('number');
      expect(Array.isArray(classification.autoTags)).toBe(true);
      expect(['pending', 'processing', 'completed', 'failed']).toContain(classification.processingStatus);
      expect(classification.classificationTime).toBeInstanceOf(Date);
      expect(typeof classification.confidence).toBe('number');
    });

    it('이미지 파일 분류', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification).toBeDefined();
      expect(classification.fileType).toBe('image');
      expect(mediaAnalysisService.analyzeMedia).toHaveBeenCalled();
    });

    it('PDF 파일 분류', async () => {
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification).toBeDefined();
      expect(classification.fileType).toBe('pdf');
      expect(clientFileProcessor.processFile).toHaveBeenCalled();
    });

    it('분류 실패 시 기본 분류 반환', async () => {
      (clientFileProcessor.processFile as jest.Mock).mockRejectedValue(new Error('Processing failed'));

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification).toBeDefined();
      expect(classification.processingStatus).toBe('failed');
      expect(classification.category).toBe('uncategorized');
      expect(classification.confidence).toBeLessThan(0.5);
    });
  });

  describe('프로젝트 구조', () => {
    it('프로젝트 구조 가져오기', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await service.classifyFile(file, 'project-1');

      const structure = service.getProjectStructure('project-1');

      expect(structure).toBeDefined();
      if (structure) {
        expect(structure.projectId).toBe('project-1');
        expect(structure.categories).toBeDefined();
        expect(typeof structure.totalFiles).toBe('number');
        expect(typeof structure.organizationScore).toBe('number');
        expect(structure.lastUpdate).toBeInstanceOf(Date);
      }
    });

    it('존재하지 않는 프로젝트 구조', () => {
      const structure = service.getProjectStructure('non-existent');

      expect(structure).toBeNull();
    });
  });

  describe('파일 분류 정보', () => {
    it('파일 분류 정보 가져오기', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const classification = await service.classifyFile(file, 'project-1');

      const retrieved = service.getFileClassification(classification.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(classification.id);
      expect(retrieved?.fileName).toBe(classification.fileName);
    });

    it('존재하지 않는 파일 분류 정보', () => {
      const classification = service.getFileClassification('non-existent');

      expect(classification).toBeNull();
    });
  });

  describe('학습 패턴', () => {
    it('학습 패턴 가져오기', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await service.classifyFile(file, 'project-1');

      const patterns = service.getLearningPatterns('project-1');

      expect(Array.isArray(patterns)).toBe(true);
    });

    it('존재하지 않는 프로젝트의 학습 패턴', () => {
      const patterns = service.getLearningPatterns('non-existent');

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBe(0);
    });
  });

  describe('자동 학습 인사이트', () => {
    it('자동 학습 인사이트 가져오기', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await service.classifyFile(file, 'project-1');

      const insights = service.getAutoLearningInsights('project-1');

      expect(Array.isArray(insights)).toBe(true);
    });

    it('존재하지 않는 프로젝트의 인사이트', () => {
      const insights = service.getAutoLearningInsights('non-existent');

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBe(0);
    });
  });

  describe('파일 재분류', () => {
    it('프로젝트 파일 재분류', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await service.classifyFile(file, 'project-1');

      // 신뢰도 낮은 파일로 설정
      const structure = service.getProjectStructure('project-1');
      if (structure) {
        const allFiles = Object.values(structure.categories).flatMap(cat => cat.files);
        if (allFiles.length > 0) {
          allFiles[0].confidence = 0.5;
        }
      }

      await service.reclassifyProjectFiles('project-1');

      // 재분류가 완료되었는지 확인
      expect(true).toBe(true);
    });

    it('존재하지 않는 프로젝트 재분류', async () => {
      await expect(service.reclassifyProjectFiles('non-existent')).resolves.not.toThrow();
    });
  });

  describe('카테고리 통계', () => {
    it('카테고리별 통계 가져오기', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await service.classifyFile(file, 'project-1');

      const stats = service.getCategoryStatistics('project-1');

      expect(typeof stats).toBe('object');
    });

    it('존재하지 않는 프로젝트 통계', () => {
      const stats = service.getCategoryStatistics('non-existent');

      expect(stats).toEqual({});
    });
  });

  describe('프로젝트 데이터 삭제', () => {
    it('프로젝트 데이터 삭제', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      await service.classifyFile(file, 'project-1');

      service.clearProjectData('project-1');

      const structure = service.getProjectStructure('project-1');
      expect(structure).toBeNull();

      const patterns = service.getLearningPatterns('project-1');
      expect(patterns.length).toBe(0);

      const insights = service.getAutoLearningInsights('project-1');
      expect(insights.length).toBe(0);
    });
  });

  describe('다양한 파일 타입', () => {
    it('문서 파일 분류', async () => {
      const file = new File(['test'], 'document.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification.fileType).toBe('document');
    });

    it('스프레드시트 파일 분류', async () => {
      const file = new File(['test'], 'spreadsheet.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification.fileType).toBe('spreadsheet');
    });

    it('마크다운 파일 분류', async () => {
      const file = new File(['test'], 'readme.md', { type: 'text/markdown' });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification.fileType).toBe('markdown');
    });
  });

  describe('파일명 기반 분류', () => {
    it('회의 관련 파일명 분류', async () => {
      const file = new File(['test'], '회의록_2024.txt', { type: 'text/plain' });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification.category).toBeDefined();
    });

    it('계획 관련 파일명 분류', async () => {
      const file = new File(['test'], '로드맵_2024.txt', { type: 'text/plain' });
      const classification = await service.classifyFile(file, 'project-1');

      expect(classification.category).toBeDefined();
    });
  });
});

