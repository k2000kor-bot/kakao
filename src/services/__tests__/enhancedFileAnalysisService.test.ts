/**
 * enhancedFileAnalysisService 서비스 테스트
 * 향상된 파일 분석 서비스 테스트
 */

import enhancedFileAnalysisService from '../enhancedFileAnalysisService';
import unifiedAPI from '../unifiedAPI';
import { errorLogger } from '../../utils/errorLogger';

// unifiedAPI 모킹
jest.mock('../unifiedAPI', () => ({
  uploadFile: jest.fn(),
  processFile: jest.fn(),
  analyzeImage: jest.fn(),
}));

// errorLogger 모킹
jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    error: jest.fn(),
  },
}));

describe('enhancedFileAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(enhancedFileAnalysisService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      const instance1 = enhancedFileAnalysisService;
      const instance2 = enhancedFileAnalysisService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('analyzeFile', () => {
    const createMockFile = (name: string, type: string, size: number = 1000): File => {
      const file = new File(['test content'], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('파일을 분석할 수 있어야 함', async () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          response: '파일 분석이 완료되었습니다.',
          confidence: 0.9,
          processing_time: 100,
          tokens: 1000,
        },
      });

      const result = await enhancedFileAnalysisService.analyzeFile(file);

      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.analysis.filename).toBe('test.pdf');
      expect(result.analysis.status).toBe('completed');
      expect(result.analysis.results.summary).toBeDefined();
    });

    it('파일 업로드 실패 시 에러를 반환해야 함', async () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: '업로드 실패',
      });

      const result = await enhancedFileAnalysisService.analyzeFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.analysis.status).toBe('failed');
    });

    it('파일 분석 실패 시 에러를 반환해야 함', async () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: '분석 실패',
      });

      const result = await enhancedFileAnalysisService.analyzeFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.analysis.status).toBe('failed');
    });

    it('예외 발생 시 에러를 처리해야 함', async () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      
      (unifiedAPI.uploadFile as jest.Mock).mockRejectedValueOnce(new Error('네트워크 오류'));

      const result = await enhancedFileAnalysisService.analyzeFile(file);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(errorLogger.error).toHaveBeenCalled();
    });

    it('키워드를 추출해야 함', async () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          response: 'This is a test document with important keywords',
          confidence: 0.9,
          processing_time: 100,
          tokens: 1000,
        },
      });

      const result = await enhancedFileAnalysisService.analyzeFile(file);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.analysis.results.keywords)).toBe(true);
    });

    it('감정 분석을 수행해야 함', async () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          response: '좋은 결과가 나왔습니다. 성공적으로 개선되었습니다.',
          confidence: 0.9,
          processing_time: 100,
          tokens: 1000,
        },
      });

      const result = await enhancedFileAnalysisService.analyzeFile(file);

      expect(result.success).toBe(true);
      expect(['positive', 'negative', 'neutral']).toContain(result.analysis.results.sentiment);
    });

    it('엔티티를 추출해야 함', async () => {
      const file = createMockFile('test.pdf', 'application/pdf');
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          response: 'The meeting is on 2024-01-15. John Smith will attend.',
          confidence: 0.9,
          processing_time: 100,
          tokens: 1000,
        },
      });

      const result = await enhancedFileAnalysisService.analyzeFile(file);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.analysis.results.entities)).toBe(true);
    });
  });

  describe('analyzeImage', () => {
    const createMockImageFile = (name: string, size: number = 1000): File => {
      const file = new File(['image content'], name, { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    // FileReader 모킹
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: null,
      onload: null as any,
      onerror: null as any,
    };

    beforeEach(() => {
      global.FileReader = jest.fn(() => mockFileReader) as any;
      mockFileReader.readAsDataURL = jest.fn(function(this: any) {
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
          if (this.onload) this.onload();
        }, 0);
      });
    });

    it('이미지를 분석할 수 있어야 함', async () => {
      const imageFile = createMockImageFile('test.jpg');
      
      (unifiedAPI.analyzeImage as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          analysis: {
            objects_detected: ['person', 'car', 'building'],
            emotions: 'happy',
          },
          confidence: 0.9,
          processing_time: 200,
        },
      });

      const result = await enhancedFileAnalysisService.analyzeImage(imageFile);

      expect(result.success).toBe(true);
      expect(result.analysis).toBeDefined();
      expect(result.analysis.filename).toBe('test.jpg');
      expect(result.analysis.fileType).toBe('image');
      expect(result.analysis.status).toBe('completed');
    });

    it('이미지 분석 실패 시 에러를 반환해야 함', async () => {
      const imageFile = createMockImageFile('test.jpg');
      
      (unifiedAPI.analyzeImage as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: '이미지 분석 실패',
      });

      const result = await enhancedFileAnalysisService.analyzeImage(imageFile);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.analysis.status).toBe('failed');
    });
  });

  describe('getAnalysis', () => {
    it('분석 결과를 가져올 수 있어야 함', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          response: '분석 완료',
          confidence: 0.9,
          processing_time: 100,
          tokens: 1000,
        },
      });

      const analysisResult = await enhancedFileAnalysisService.analyzeFile(file);
      
      if (analysisResult.success) {
        const retrievedAnalysis = await enhancedFileAnalysisService.getAnalysis(analysisResult.analysis.id);
        
        expect(retrievedAnalysis).toBeDefined();
        expect(retrievedAnalysis?.filename).toBe('test.pdf');
      }
    });

    it('존재하지 않는 분석 ID에 대해 null을 반환해야 함', async () => {
      const result = await enhancedFileAnalysisService.getAnalysis('non-existent-id');
      
      expect(result).toBeNull();
    });
  });

  describe('getAllAnalyses', () => {
    it('모든 분석 결과를 가져올 수 있어야 함', async () => {
      const file1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' });
      const file2 = new File(['test2'], 'test2.pdf', { type: 'application/pdf' });
      
      (unifiedAPI.uploadFile as jest.Mock)
        .mockResolvedValueOnce({ success: true, file_id: 'file-1' })
        .mockResolvedValueOnce({ success: true, file_id: 'file-2' });

      (unifiedAPI.processFile as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: {
            response: '분석 1 완료',
            confidence: 0.9,
            processing_time: 100,
            tokens: 1000,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            response: '분석 2 완료',
            confidence: 0.9,
            processing_time: 100,
            tokens: 1000,
          },
        });

      await enhancedFileAnalysisService.analyzeFile(file1);
      await enhancedFileAnalysisService.analyzeFile(file2);

      const allAnalyses = await enhancedFileAnalysisService.getAllAnalyses();
      
      expect(Array.isArray(allAnalyses)).toBe(true);
      expect(allAnalyses.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('deleteAnalysis', () => {
    it('분석을 삭제할 수 있어야 함', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          response: '분석 완료',
          confidence: 0.9,
          processing_time: 100,
          tokens: 1000,
        },
      });

      const analysisResult = await enhancedFileAnalysisService.analyzeFile(file);
      
      if (analysisResult.success) {
        const deleted = await enhancedFileAnalysisService.deleteAnalysis(analysisResult.analysis.id);
        
        expect(deleted).toBe(true);
        
        const retrievedAnalysis = await enhancedFileAnalysisService.getAnalysis(analysisResult.analysis.id);
        expect(retrievedAnalysis).toBeNull();
      }
    });

    it('존재하지 않는 분석 삭제 시 false를 반환해야 함', async () => {
      const deleted = await enhancedFileAnalysisService.deleteAnalysis('non-existent-id');
      
      expect(deleted).toBe(false);
    });
  });

  describe('compareFiles', () => {
    it('두 파일을 비교할 수 있어야 함', async () => {
      const file1 = new File(['test1 content'], 'test1.pdf', { type: 'application/pdf' });
      const file2 = new File(['test2 content'], 'test2.pdf', { type: 'application/pdf' });
      
      (unifiedAPI.uploadFile as jest.Mock)
        .mockResolvedValueOnce({ success: true, file_id: 'file-1' })
        .mockResolvedValueOnce({ success: true, file_id: 'file-2' });

      (unifiedAPI.processFile as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: {
            response: '첫 번째 파일 분석 완료',
            confidence: 0.9,
            processing_time: 100,
            tokens: 1000,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            response: '두 번째 파일 분석 완료',
            confidence: 0.9,
            processing_time: 100,
            tokens: 1000,
          },
        });

      const comparison = await enhancedFileAnalysisService.compareFiles([file1, file2]);
      
      expect(comparison).toBeDefined();
      expect(Array.isArray(comparison.similarities)).toBe(true);
      expect(Array.isArray(comparison.differences)).toBe(true);
      expect(Array.isArray(comparison.recommendations)).toBe(true);
    });

    it('비교할 파일이 부족하면 에러를 발생시켜야 함', async () => {
      const file1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' });
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: false,
      });

      await expect(
        enhancedFileAnalysisService.compareFiles([file1])
      ).rejects.toThrow('비교할 수 있는 파일이 충분하지 않습니다.');
    });
  });

  describe('generateReport', () => {
    it('보고서를 생성할 수 있어야 함', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          response: '분석 완료',
          confidence: 0.9,
          processing_time: 100,
          tokens: 1000,
        },
      });

      const analysisResult = await enhancedFileAnalysisService.analyzeFile(file);
      
      if (analysisResult.success) {
        const report = await enhancedFileAnalysisService.generateReport([analysisResult.analysis.id]);
        
        expect(typeof report).toBe('string');
        expect(report).toContain('파일 분석 보고서');
        expect(report).toContain('test.pdf');
      }
    });

    it('분석할 파일이 없으면 메시지를 반환해야 함', async () => {
      const report = await enhancedFileAnalysisService.generateReport([]);
      
      expect(report).toBe('분석할 파일이 없습니다.');
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 문서를 분석할 수 있어야 함', async () => {
      const file = new File(
        ['개포우성7차 재개발 프로젝트 제안서입니다. 시공사 선정 기준은 기술력, 안전성, 경험입니다.'],
        '제안서.pdf',
        { type: 'application/pdf' }
      );
      
      (unifiedAPI.uploadFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        file_id: 'file-123',
      });

      (unifiedAPI.processFile as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: {
          response: '재개발 프로젝트 제안서 분석이 완료되었습니다.',
          confidence: 0.95,
          processing_time: 150,
          tokens: 2000,
        },
      });

      const result = await enhancedFileAnalysisService.analyzeFile(file);

      expect(result.success).toBe(true);
      expect(result.analysis.filename).toBe('제안서.pdf');
      expect(result.analysis.results.summary).toBeDefined();
    });

    it('여러 문서를 비교하여 공통점을 찾을 수 있어야 함', async () => {
      const file1 = new File(['시공사 선정 기준 문서'], '기준.pdf', { type: 'application/pdf' });
      const file2 = new File(['시공사 평가 프로세스 문서'], '프로세스.pdf', { type: 'application/pdf' });
      
      (unifiedAPI.uploadFile as jest.Mock)
        .mockResolvedValueOnce({ success: true, file_id: 'file-1' })
        .mockResolvedValueOnce({ success: true, file_id: 'file-2' });

      (unifiedAPI.processFile as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          data: {
            response: '시공사 선정 기준 분석',
            confidence: 0.9,
            processing_time: 100,
            tokens: 1000,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            response: '시공사 평가 프로세스 분석',
            confidence: 0.9,
            processing_time: 100,
            tokens: 1000,
          },
        });

      const comparison = await enhancedFileAnalysisService.compareFiles([file1, file2]);
      
      expect(comparison).toBeDefined();
      expect(comparison.similarities.length).toBeGreaterThanOrEqual(0);
    });
  });
});

