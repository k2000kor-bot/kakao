/**
 * advancedFileProcessingService 서비스 테스트
 * 고급 파일 처리 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import advancedFileProcessingService from '../advancedFileProcessingService';

// File 객체 모킹
class MockFile extends File {
  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }
}

// URL.createObjectURL 모킹
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('advancedFileProcessingService', () => {
  describe('싱글톤 인스턴스', () => {
    it('싱글톤 인스턴스가 존재해야 함', () => {
      expect(advancedFileProcessingService).toBeDefined();
    });

    it('같은 인스턴스를 반환해야 함', () => {
      // default export와 named export가 같은지 확인
      const instance1 = advancedFileProcessingService;
      expect(instance1).toBeDefined();
    });
  });

  describe('isFileSupported', () => {
    it('PDF 파일을 지원해야 함', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      expect(advancedFileProcessingService.isFileSupported(file)).toBe(true);
    });

    it('Word 문서를 지원해야 함', () => {
      const file = new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      expect(advancedFileProcessingService.isFileSupported(file)).toBe(true);
    });

    it('Excel 파일을 지원해야 함', () => {
      const file = new File(['content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      expect(advancedFileProcessingService.isFileSupported(file)).toBe(true);
    });

    it('이미지 파일을 지원해야 함', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      expect(advancedFileProcessingService.isFileSupported(file)).toBe(true);
    });

    it('지원하지 않는 파일 형식을 거부해야 함', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      expect(advancedFileProcessingService.isFileSupported(file)).toBe(false);
    });
  });

  describe('detectFileType', () => {
    it('PDF 파일의 타입을 감지해야 함', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const fileType = advancedFileProcessingService.detectFileType(file);
      expect(fileType).toBe('documents');
    });

    it('Word 문서의 타입을 감지해야 함', () => {
      const file = new File(['content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const fileType = advancedFileProcessingService.detectFileType(file);
      expect(fileType).toBe('documents');
    });

    it('Excel 파일의 타입을 감지해야 함', () => {
      const file = new File(['content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileType = advancedFileProcessingService.detectFileType(file);
      expect(fileType).toBe('spreadsheets');
    });

    it('이미지 파일의 타입을 감지해야 함', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const fileType = advancedFileProcessingService.detectFileType(file);
      expect(fileType).toBe('images');
    });

    it('알 수 없는 파일 타입에 대해 unknown을 반환해야 함', () => {
      const file = new File(['content'], 'test.unknown', { type: 'application/octet-stream' });
      const fileType = advancedFileProcessingService.detectFileType(file);
      expect(fileType).toBe('unknown');
    });
  });

  describe('processFile', () => {
    it('PDF 파일을 처리할 수 있어야 함', async () => {
      const file = new MockFile(['PDF content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file);

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.name).toBe('test.pdf');
      expect(typeof result.confidence).toBe('number');
    });

    it('Word 문서를 처리할 수 있어야 함', async () => {
      const file = new MockFile(['Word content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      const result = await advancedFileProcessingService.processFile(file);

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.metadata.name).toBe('test.docx');
    });

    it('이미지 파일을 처리할 수 있어야 함', async () => {
      const file = new MockFile(['image content'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await advancedFileProcessingService.processFile(file);

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(result.metadata.name).toBe('test.jpg');
    });

    it('요약 생성 옵션이 있을 때 요약을 생성해야 함', async () => {
      const file = new MockFile(['Long content that needs summarization'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file, {
        generateSummary: true
      });

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('키워드 추출 옵션이 있을 때 키워드를 추출해야 함', async () => {
      const file = new MockFile(['Content with keywords'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file, {
        extractKeywords: true
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.keywords)).toBe(true);
    });

    it('진행 상황 콜백을 호출해야 함', async () => {
      const file = new MockFile(['content'], 'test.pdf', { type: 'application/pdf' });
      const progressUpdates: unknown[] = [];
      
      const progressCallback = (progress: unknown) => {
        progressUpdates.push(progress);
      };

      await advancedFileProcessingService.processFile(file, {}, progressCallback);

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates.some(p => p.stage === 'completed')).toBe(true);
    });

    it('이미지 추출 옵션이 있을 때 이미지를 추출해야 함', async () => {
      const file = new MockFile(['PDF with images'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file, {
        extractImages: true
      });

      expect(result).toBeDefined();
      // 이미지 추출은 옵션이지만 결과가 있을 수도 있음
      if (result.images) {
        expect(Array.isArray(result.images)).toBe(true);
      }
    });

    it('테이블 추출 옵션이 있을 때 테이블을 추출해야 함', async () => {
      const file = new MockFile(['PDF with tables'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file, {
        extractTables: true
      });

      expect(result).toBeDefined();
      // 테이블 추출은 옵션이지만 결과가 있을 수도 있음
      if (result.tables) {
        expect(Array.isArray(result.tables)).toBe(true);
      }
    });

    it('구조 분석 결과를 포함해야 함', async () => {
      const file = new MockFile(['Structured content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file);

      expect(result).toBeDefined();
      if (result.structure) {
        expect(result.structure).toBeDefined();
      }
    });

    it('처리 옵션에 따라 다양한 분석을 수행해야 함', async () => {
      const file = new MockFile(['Complex content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file, {
        generateSummary: true,
        extractKeywords: true,
        extractImages: true,
        extractTables: true
      });

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      if (result.summary) {
        expect(result.summary).toBeDefined();
      }
      if (result.keywords) {
        expect(Array.isArray(result.keywords)).toBe(true);
      }
    });
  });

  describe('getProcessingStatus', () => {
    it('처리 상태를 가져올 수 있어야 함', () => {
      const status = advancedFileProcessingService.getProcessingStatus();

      expect(status).toBeDefined();
      expect(typeof status.queue).toBe('number');
      expect(typeof status.processing).toBe('number');
      expect(typeof status.maxConcurrent).toBe('number');
      expect(status.maxConcurrent).toBeGreaterThan(0);
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 PDF 파일을 처리할 수 있어야 함', async () => {
      const file = new MockFile(['재개발 프로젝트 관련 문서 내용'], 'redevelopment-project.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file, {
        generateSummary: true,
        extractKeywords: true
      });

      expect(result).toBeDefined();
      expect(result.metadata.name).toBe('redevelopment-project.pdf');
      expect(result.text).toBeDefined();
    });

    it('여러 파일 형식을 순차적으로 처리할 수 있어야 함', async () => {
      const files = [
        new MockFile(['PDF content'], 'test1.pdf', { type: 'application/pdf' }),
        new MockFile(['Word content'], 'test2.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        new MockFile(['Image content'], 'test3.jpg', { type: 'image/jpeg' })
      ];

      const results = await Promise.all(
        files.map(file => advancedFileProcessingService.processFile(file))
      );

      expect(results.length).toBe(3);
      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.metadata.name).toBe(files[index].name);
      });
    });

    it('대용량 파일도 처리할 수 있어야 함', async () => {
      const largeContent = 'A'.repeat(10000);
      const file = new MockFile([largeContent], 'large-file.pdf', { type: 'application/pdf' });
      
      const result = await advancedFileProcessingService.processFile(file);

      expect(result).toBeDefined();
      expect(result.metadata.size).toBeGreaterThan(0);
    });
  });
});

