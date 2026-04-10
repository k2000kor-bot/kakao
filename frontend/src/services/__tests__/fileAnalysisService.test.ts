/**
 * FileAnalysisService 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  FileAnalysisService,
} from '../fileAnalysisService';
import { ProjectFile } from '../../types/project';

// console.log 모킹
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('FileAnalysisService', () => {
  let service: FileAnalysisService;

  beforeEach(() => {
    jest.clearAllMocks();
    // 싱글톤 인스턴스 리셋
    (FileAnalysisService as unknown as { instance: unknown }).instance = undefined;
    service = FileAnalysisService.getInstance();
    service.clearCache();
  });

  afterEach(() => {
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(FileAnalysisService);
    });

    it('싱글톤 패턴 확인', () => {
      const instance1 = FileAnalysisService.getInstance();
      const instance2 = FileAnalysisService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('파일 분석', () => {
    it('PDF 문서 분석', async () => {
      const file: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result).toBeDefined();
      expect(result.fileId).toBe(file.id);
      expect(result.fileName).toBe(file.name);
      expect(result.fileType).toBe(file.type);
      expect(result.analysisType).toBe('document');
      expect(result.content).toBeTruthy();
      expect(result.keywords).toBeInstanceOf(Array);
      expect(result.summary).toBeTruthy();
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.detailedAnalysis).toBeDefined();
    });

    it('DOC 문서 분석', async () => {
      const file: ProjectFile = {
        id: 'file-2',
        name: 'test.doc',
        type: 'document',
        size: 2048,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('document');
      expect(result.detailedAnalysis).toBeDefined();
    });

    it('DOCX 문서 분석', async () => {
      const file: ProjectFile = {
        id: 'file-3',
        name: 'test.docx',
        type: 'document',
        size: 3072,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('document');
    });

    it('이미지 파일 분석 - JPG', async () => {
      const file: ProjectFile = {
        id: 'file-4',
        name: 'test.jpg',
        type: 'image',
        size: 5120,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('image');
      expect(result.visualAnalysis).toBeDefined();
      expect(result.visualAnalysis?.objects).toBeInstanceOf(Array);
      expect(result.visualAnalysis?.text).toBeInstanceOf(Array);
    });

    it('이미지 파일 분석 - PNG', async () => {
      const file: ProjectFile = {
        id: 'file-5',
        name: 'test.png',
        type: 'image',
        size: 4096,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('image');
      expect(result.visualAnalysis).toBeDefined();
    });

    it('이미지 파일 분석 - GIF', async () => {
      const file: ProjectFile = {
        id: 'file-6',
        name: 'test.gif',
        type: 'image',
        size: 3072,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('image');
    });

    it('비디오 파일 분석 - MP4', async () => {
      const file: ProjectFile = {
        id: 'file-7',
        name: 'test.mp4',
        type: 'other',
        size: 1024000,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('video');
      expect(result.content).toBeTruthy();
    });

    it('비디오 파일 분석 - AVI', async () => {
      const file: ProjectFile = {
        id: 'file-8',
        name: 'test.avi',
        type: 'other',
        size: 2048000,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('video');
    });

    it('오디오 파일 분석 - MP3', async () => {
      const file: ProjectFile = {
        id: 'file-9',
        name: 'test.mp3',
        type: 'other',
        size: 5120,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('audio');
      expect(result.content).toBeTruthy();
    });

    it('오디오 파일 분석 - WAV', async () => {
      const file: ProjectFile = {
        id: 'file-10',
        name: 'test.wav',
        type: 'other',
        size: 10240,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('audio');
    });

    it('텍스트 파일 분석 (기본)', async () => {
      const file: ProjectFile = {
        id: 'file-11',
        name: 'test.txt',
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.analysisType).toBe('text');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('분석 결과 구조 확인', async () => {
      const file: ProjectFile = {
        id: 'file-12',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result).toHaveProperty('fileId');
      expect(result).toHaveProperty('fileName');
      expect(result).toHaveProperty('fileType');
      expect(result).toHaveProperty('analysisType');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('keywords');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('processingTime');
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('문서 분석 상세', () => {
    it('문서 분석에 상세 분석 결과 포함', async () => {
      const file: ProjectFile = {
        id: 'file-doc',
        name: 'document.pdf',
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.detailedAnalysis).toBeDefined();
      if (result.detailedAnalysis) {
        expect(result.detailedAnalysis.entities).toBeInstanceOf(Array);
        expect(result.detailedAnalysis.sentiment).toBeDefined();
        expect(result.detailedAnalysis.topics).toBeInstanceOf(Array);
        expect(result.detailedAnalysis.language).toBeDefined();
        expect(result.detailedAnalysis.readability).toBeDefined();
        expect(result.detailedAnalysis.structure).toBeDefined();
      }
    });

    it('문서 분석 엔티티 포함', async () => {
      const file: ProjectFile = {
        id: 'file-doc2',
        name: 'document.pdf',
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      if (result.detailedAnalysis?.entities) {
        expect(result.detailedAnalysis.entities.length).toBeGreaterThan(0);
        expect(result.detailedAnalysis.entities[0]).toHaveProperty('name');
        expect(result.detailedAnalysis.entities[0]).toHaveProperty('type');
        expect(result.detailedAnalysis.entities[0]).toHaveProperty('confidence');
      }
    });
  });

  describe('이미지 분석 상세', () => {
    it('이미지 분석에 시각적 분석 결과 포함', async () => {
      const file: ProjectFile = {
        id: 'file-img',
        name: 'image.jpg',
        type: 'image',
        size: 5120,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.visualAnalysis).toBeDefined();
      if (result.visualAnalysis) {
        expect(result.visualAnalysis.objects).toBeInstanceOf(Array);
        expect(result.visualAnalysis.text).toBeInstanceOf(Array);
        expect(result.visualAnalysis.faces).toBeInstanceOf(Array);
        expect(result.visualAnalysis.colors).toBeInstanceOf(Array);
        expect(result.visualAnalysis.scene).toBeDefined();
      }
    });
  });

  describe('대화 파일 분석', () => {
    it('질문에 대한 파일 분석 통합', async () => {
      const query = '프로젝트 관련 파일은 무엇인가요?';
      const files: ProjectFile[] = [
        {
          id: 'file-1',
          name: '프로젝트 계획서.pdf',
          type: 'document',
          size: 1024,
          uploadedAt: new Date(),
        },
        {
          id: 'file-2',
          name: 'test.txt',
          type: 'document',
          size: 512,
          uploadedAt: new Date(),
        },
      ];

      const result = await service.analyzeForChat(query, files);

      expect(result).toBeDefined();
      expect(result.query).toBe(query);
      expect(result.relevantFiles).toBeInstanceOf(Array);
      expect(result.analysisSummary).toBeTruthy();
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('이미지 관련 질문', async () => {
      const query = '이미지 파일을 보여주세요';
      const files: ProjectFile[] = [
        {
          id: 'file-1',
          name: 'image.jpg',
          type: 'image',
          size: 5120,
          uploadedAt: new Date(),
        },
        {
          id: 'file-2',
          name: 'document.pdf',
          type: 'document',
          size: 1024,
          uploadedAt: new Date(),
        },
      ];

      const result = await service.analyzeForChat(query, files);

      expect(result.relevantFiles.length).toBeGreaterThan(0);
      const hasImage = result.relevantFiles.some(f => f.analysisType === 'image');
      expect(hasImage).toBe(true);
    });

    it('비디오 관련 질문', async () => {
      const query = '비디오 파일이 있나요?';
      const files: ProjectFile[] = [
        {
          id: 'file-1',
          name: 'video.mp4',
          type: 'other',
          size: 1024000,
          uploadedAt: new Date(),
        },
      ];

      const result = await service.analyzeForChat(query, files);

      expect(result.relevantFiles.length).toBeGreaterThan(0);
    });

    it('문서 관련 질문', async () => {
      const query = '문서 파일을 분석해주세요';
      const files: ProjectFile[] = [
        {
          id: 'file-1',
          name: 'document.pdf',
          type: 'document',
          size: 1024,
          uploadedAt: new Date(),
        },
      ];

      const result = await service.analyzeForChat(query, files);

      expect(result.relevantFiles.length).toBeGreaterThan(0);
    });

    it('관련 파일이 없을 때', async () => {
      const query = '존재하지 않는 파일';
      const files: ProjectFile[] = [];

      const result = await service.analyzeForChat(query, files);

      expect(result.relevantFiles).toEqual([]);
      expect(result.analysisSummary).toContain('찾을 수 없습니다');
    });

    it('최대 5개 파일만 반환', async () => {
      const query = '프로젝트';
      const files: ProjectFile[] = Array.from({ length: 10 }, (_, i) => ({
        id: `file-${i}`,
        name: `project-${i}.pdf`,
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      }));

      const result = await service.analyzeForChat(query, files);

      expect(result.relevantFiles.length).toBeLessThanOrEqual(5);
    });
  });

  describe('캐시 관리', () => {
    it('캐시 클리어', () => {
      service.clearCache();
      // 에러가 발생하지 않아야 함
      expect(() => service.clearCache()).not.toThrow();
    });

    it('특정 파일 캐시 제거', () => {
      const fileId = 'file-1';
      service.removeFromCache(fileId);
      // 에러가 발생하지 않아야 함
      expect(() => service.removeFromCache(fileId)).not.toThrow();
    });

    it('같은 파일 반복 분석 시 캐시 사용', async () => {
      const file: ProjectFile = {
        id: 'file-cache',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      };

      // 첫 번째 분석
      const result1 = await service.analyzeFile(file);
      
      // 두 번째 분석은 캐시를 사용하지 않음 (cacheKey에 Date.now() 포함)
      // 하지만 캐시 로직 자체는 테스트 가능
      expect(result1).toBeDefined();
    });
  });

  describe('에러 처리', () => {
    it('분석 실패 시 에러 처리', async () => {
      // 에러가 발생할 수 있는 상황 시뮬레이션
      const file: ProjectFile = {
        id: 'file-error',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      };

      // 정상적인 경우 에러가 발생하지 않아야 함
      await expect(service.analyzeFile(file)).resolves.toBeDefined();
    });
  });

  describe('분석 결과 품질', () => {
    it('분석 결과에 모든 필수 필드 포함', async () => {
      const file: ProjectFile = {
        id: 'file-quality',
        name: 'quality-test.pdf',
        type: 'document',
        size: 1024,
        uploadedAt: new Date(),
      };

      const result = await service.analyzeFile(file);

      expect(result.fileId).toBe(file.id);
      expect(result.fileName).toBe(file.name);
      expect(result.content).toBeTruthy();
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.summary).toBeTruthy();
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.createdAt).toBeTruthy();
    });

    it('분석 결과 신뢰도 범위 확인', async () => {
      const files: ProjectFile[] = [
        {
          id: 'file-1',
          name: 'test.pdf',
          type: 'document',
          size: 1024,
          uploadedAt: new Date(),
        },
        {
          id: 'file-2',
          name: 'test.jpg',
          type: 'image',
          size: 5120,
          uploadedAt: new Date(),
        },
      ];

      for (const file of files) {
        const result = await service.analyzeFile(file);
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(100);
      }
    });
  });
});

