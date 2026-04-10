/**
 * advancedFileAnalysisService 서비스 테스트
 * 고급 파일 분석 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import AdvancedFileAnalysisService from '../advancedFileAnalysisService';
import { ProjectFile } from '../../types/project';

describe('AdvancedFileAnalysisService', () => {
  let service: AdvancedFileAnalysisService;

  beforeEach(() => {
    service = AdvancedFileAnalysisService.getInstance();
    // 큐 초기화를 위해 새 인스턴스 가져오기
    service = AdvancedFileAnalysisService.getInstance();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AdvancedFileAnalysisService);
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = AdvancedFileAnalysisService.getInstance();
      const instance2 = AdvancedFileAnalysisService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('startAdvancedAnalysis', () => {
    it('PDF 파일 분석을 시작할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        url: 'https://example.com/test.pdf',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);

      expect(analysisId).toBeDefined();
      expect(analysisId).toContain('advanced_analysis_');

      // 분석 결과 확인 (비동기 처리 대기)
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = service.getAnalysisResult(analysisId);
      expect(result).toBeDefined();
      expect(result?.fileId).toBe('file-1');
      expect(result?.fileName).toBe('test.pdf');
      expect(result?.analysisType).toBe('document');
    });

    it('이미지 파일 분석을 시작할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-2',
        name: 'test.jpg',
        type: 'image',
        size: 2048,
        url: 'https://example.com/test.jpg',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);

      expect(analysisId).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = service.getAnalysisResult(analysisId);
      expect(result?.analysisType).toBe('image');
    });

    it('문서 파일 분석을 시작할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-3',
        name: 'test.docx',
        type: 'document',
        size: 3072,
        url: 'https://example.com/test.docx',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);

      expect(analysisId).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = service.getAnalysisResult(analysisId);
      expect(result?.analysisType).toBe('document');
    });

    it('오디오 파일 분석을 시작할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-4',
        name: 'test.mp3',
        type: 'other',
        size: 4096,
        url: 'https://example.com/test.mp3',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);

      expect(analysisId).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = service.getAnalysisResult(analysisId);
      expect(result?.analysisType).toBe('audio');
    });

    it('비디오 파일 분석을 시작할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-5',
        name: 'test.mp4',
        type: 'other',
        size: 5120,
        url: 'https://example.com/test.mp4',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);

      expect(analysisId).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = service.getAnalysisResult(analysisId);
      expect(result?.analysisType).toBe('video');
    });

    it('알 수 없는 파일 타입에 대해 종합 분석을 수행해야 함', async () => {
      const file: ProjectFile = {
        id: 'file-6',
        name: 'test.unknown',
        type: 'other',
        size: 1024,
        url: 'https://example.com/test.unknown',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);

      expect(analysisId).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = service.getAnalysisResult(analysisId);
      expect(result?.analysisType).toBe('comprehensive');
    });
  });

  describe('getAnalysisResult', () => {
    it('분석 결과를 가져올 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        url: 'https://example.com/test.pdf',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = service.getAnalysisResult(analysisId);
      expect(result).toBeDefined();
      expect(result?.id).toBe(analysisId);
      expect(result?.fileId).toBe('file-1');
    });

    it('존재하지 않는 분석 ID에 대해 null을 반환해야 함', () => {
      const result = service.getAnalysisResult('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getFileType', () => {
    it('PDF 파일 타입을 가져올 수 있어야 함', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const fileType = service.getFileType(file);
      expect(fileType).toBe('document');
    });

    it('이미지 파일 타입을 가져올 수 있어야 함', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileType = service.getFileType(file);
      expect(fileType).toBe('image');
    });

    it('오디오 파일 타입을 가져올 수 있어야 함', () => {
      const file = new File(['content'], 'test.mp3', { type: 'audio/mpeg' });
      const fileType = service.getFileType(file);
      expect(fileType).toBe('audio');
    });

    it('알 수 없는 파일 타입에 대해 unknown을 반환해야 함', () => {
      const file = new File(['content'], 'test.unknown', { type: 'application/octet-stream' });
      const fileType = service.getFileType(file);
      expect(fileType).toBe('unknown');
    });
  });

  describe('getFileAnalysis', () => {
    it('파일 ID로 분석 결과를 가져올 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        url: 'https://example.com/test.pdf',
        uploadedAt: new Date()
      };

      await service.startAdvancedAnalysis(file);
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = service.getFileAnalysis('file-1');
      expect(result).toBeDefined();
      expect(result?.fileId).toBe('file-1');
    });

    it('존재하지 않는 파일 ID에 대해 null을 반환해야 함', () => {
      const result = service.getFileAnalysis('non-existent-file-id');
      expect(result).toBeNull();
    });
  });

  describe('getAllAnalyses', () => {
    it('모든 분석 결과를 가져올 수 있어야 함', async () => {
      const file1: ProjectFile = {
        id: 'file-1',
        name: 'test1.pdf',
        type: 'document',
        size: 1024,
        url: 'https://example.com/test1.pdf',
        uploadedAt: new Date()
      };

      const file2: ProjectFile = {
        id: 'file-2',
        name: 'test2.jpg',
        type: 'image',
        size: 2048,
        url: 'https://example.com/test2.jpg',
        uploadedAt: new Date()
      };

      await service.startAdvancedAnalysis(file1);
      await service.startAdvancedAnalysis(file2);
      await new Promise(resolve => setTimeout(resolve, 100));

      const allAnalyses = service.getAllAnalyses();
      expect(Array.isArray(allAnalyses)).toBe(true);
      expect(allAnalyses.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('updateAnalysisProgress', () => {
    it('분석 진행 상황을 업데이트할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        url: 'https://example.com/test.pdf',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);
      await new Promise(resolve => setTimeout(resolve, 50));

      service.updateAnalysisProgress(analysisId, 50);

      const result = service.getAnalysisResult(analysisId);
      expect(result?.progress).toBe(50);
    });
  });

  describe('deleteAnalysis', () => {
    it('분석 결과를 삭제할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        url: 'https://example.com/test.pdf',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);
      await new Promise(resolve => setTimeout(resolve, 100));

      const deleted = service.deleteAnalysis(analysisId);
      expect(deleted).toBe(true);

      const result = service.getAnalysisResult(analysisId);
      expect(result).toBeNull();
    });

    it('존재하지 않는 분석 ID 삭제 시 false를 반환해야 함', () => {
      const deleted = service.deleteAnalysis('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('analyzeFileByType', () => {
    it('파일 타입에 따라 분석을 시작할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'file-1',
        name: 'test.pdf',
        type: 'document',
        size: 1024,
        url: 'https://example.com/test.pdf',
        uploadedAt: new Date()
      };

      const analysisId = await service.analyzeFileByType(file);

      expect(analysisId).toBeDefined();
      await new Promise(resolve => setTimeout(resolve, 100));
      const result = service.getAnalysisResult(analysisId);
      expect(result).toBeDefined();
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 PDF 파일을 분석할 수 있어야 함', async () => {
      const file: ProjectFile = {
        id: 'redevelopment-project-1',
        name: 'redevelopment-project.pdf',
        type: 'document',
        size: 10240,
        url: 'https://example.com/redevelopment-project.pdf',
        uploadedAt: new Date()
      };

      const analysisId = await service.startAdvancedAnalysis(file);
      expect(analysisId).toBeDefined();

      await new Promise(resolve => setTimeout(resolve, 100));
      const result = service.getAnalysisResult(analysisId);
      expect(result).toBeDefined();
      expect(result?.status).toBeDefined();
    });

    it('여러 파일을 동시에 분석할 수 있어야 함', async () => {
      const files: ProjectFile[] = [
        {
          id: 'file-1',
          name: 'test1.pdf',
          type: 'document',
          size: 1024,
          url: 'https://example.com/test1.pdf',
          uploadedAt: new Date()
        },
        {
          id: 'file-2',
          name: 'test2.jpg',
          type: 'image',
          size: 2048,
          url: 'https://example.com/test2.jpg',
          uploadedAt: new Date()
        },
        {
          id: 'file-3',
          name: 'test3.docx',
          type: 'document',
          size: 3072,
          url: 'https://example.com/test3.docx',
          uploadedAt: new Date()
        }
      ];

      const analysisIds = await Promise.all(
        files.map(file => service.startAdvancedAnalysis(file))
      );

      expect(analysisIds.length).toBe(3);
      await new Promise(resolve => setTimeout(resolve, 100));

      const allAnalyses = service.getAllAnalyses();
      expect(allAnalyses.length).toBeGreaterThanOrEqual(3);
    });
  });
});

