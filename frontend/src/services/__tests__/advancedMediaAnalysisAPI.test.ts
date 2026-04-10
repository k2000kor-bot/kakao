/**
 * advancedMediaAnalysisAPI 서비스 테스트
 * 미디어 파일 분석 API 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import {
  uploadMediaFile,
  analyzeMediaFile,
  generateConversationalResponse,
  getFileList,
  getAnalysisResults,
  deleteFile,
  uploadMultipleFiles,
  checkAnalysisStatus,
  performAdvancedAnalysis,
  advancedMediaAnalysisAPI,
} from '../advancedMediaAnalysisAPI';
import AdvancedMediaAnalysisAPI from '../advancedMediaAnalysisAPI';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import type {
  MediaUploadResponse,
  AnalysisResult,
  AdvancedAnalysisOptions,
} from '../advancedMediaAnalysisAPI';

// fetch 모킹
installJestFetchMock();

// console 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('advancedMediaAnalysisAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(global.fetch).mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('함수형 API', () => {
    describe('uploadMediaFile', () => {
      it('파일 업로드를 수행할 수 있어야 함', async () => {
        const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
        const mockResponse: MediaUploadResponse = {
          id: 'file-1',
          filename: 'test.txt',
          file_type: 'text/plain',
          file_size: 12,
          upload_time: new Date().toISOString(),
          status: 'uploaded',
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await uploadMediaFile(mockFile);

        expect(result).toBeDefined();
        expect(result.id).toBe('file-1');
        expect(result.filename).toBe('test.txt');
        expect(result.file_type).toBe('text/plain');
        expect(result.status).toBe('uploaded');
      });

      it('업로드 실패 시 모크 응답을 반환해야 함', async () => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await uploadMediaFile(mockFile);

        expect(result).toBeDefined();
        expect(result.filename).toBe('test.txt');
        expect(result.status).toBe('uploaded');
      });
    });

    describe('analyzeMediaFile', () => {
      it('파일 분석을 수행할 수 있어야 함', async () => {
        const mockResponse: AnalysisResult = {
          id: 'analysis-1',
          file_id: 'file-1',
          extracted_text: '추출된 텍스트',
          summary: '요약',
          key_points: ['포인트1', '포인트2'],
          keywords: ['키워드1', '키워드2'],
          sentiment: 'neutral',
          confidence: 0.9,
          processing_time: 2.5,
          created_at: new Date().toISOString(),
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await analyzeMediaFile('file-1');

        expect(result).toBeDefined();
        expect(result.file_id).toBe('file-1');
        expect(result.extracted_text).toBeDefined();
        expect(Array.isArray(result.key_points)).toBe(true);
        expect(Array.isArray(result.keywords)).toBe(true);
      });

      it('분석 실패 시 모크 응답을 반환해야 함', async () => {
        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await analyzeMediaFile('file-1');

        expect(result).toBeDefined();
        expect(result.file_id).toBe('file-1');
        expect(result.extracted_text).toBeDefined();
        expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
      });
    });

    describe('generateConversationalResponse', () => {
      it('대화형 응답을 생성할 수 있어야 함', async () => {
        const mockResponse = {
          id: 'response-1',
          query: '질문',
          response: '응답',
          context: ['컨텍스트1'],
          writing_style: 'conversational',
          tone: 'friendly',
          created_at: new Date().toISOString(),
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await generateConversationalResponse('질문', ['컨텍스트1']);

        expect(result).toBeDefined();
        expect(result.query).toBe('질문');
        expect(result.response).toBeDefined();
        expect(Array.isArray(result.context)).toBe(true);
      });

      it('생성 실패 시 모크 응답을 반환해야 함', async () => {
        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await generateConversationalResponse('질문', []);

        expect(result).toBeDefined();
        expect(result.query).toBe('질문');
        expect(result.response).toBeDefined();
      });
    });

    describe('getFileList', () => {
      it('파일 목록을 조회할 수 있어야 함', async () => {
        const mockResponse: MediaUploadResponse[] = [
          {
            id: '1',
            filename: 'file1.txt',
            file_type: 'text/plain',
            file_size: 1000,
            upload_time: new Date().toISOString(),
            status: 'completed',
          },
        ];

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await getFileList();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('조회 실패 시 모크 응답을 반환해야 함', async () => {
        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await getFileList();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('getAnalysisResults', () => {
      it('분석 결과 목록을 조회할 수 있어야 함', async () => {
        const mockResponse: AnalysisResult[] = [
          {
            id: '1',
            file_id: 'file-1',
            extracted_text: '텍스트',
            summary: '요약',
            key_points: [],
            keywords: [],
            sentiment: 'neutral',
            confidence: 0.9,
            processing_time: 2.0,
            created_at: new Date().toISOString(),
          },
        ];

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await getAnalysisResults();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('특정 파일 ID로 분석 결과를 조회할 수 있어야 함', async () => {
        const mockResponse: AnalysisResult[] = [
          {
            id: '1',
            file_id: 'file-1',
            extracted_text: '텍스트',
            summary: '요약',
            key_points: [],
            keywords: [],
            sentiment: 'neutral',
            confidence: 0.9,
            processing_time: 2.0,
            created_at: new Date().toISOString(),
          },
        ];

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await getAnalysisResults('file-1');

        expect(Array.isArray(result)).toBe(true);
      });

      it('조회 실패 시 모크 응답을 반환해야 함', async () => {
        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await getAnalysisResults();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('deleteFile', () => {
      it('파일 삭제를 수행할 수 있어야 함', async () => {
        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
        });

        const result = await deleteFile('file-1');

        expect(result).toBe(true);
      });

      it('삭제 실패 시 모크 응답을 반환해야 함', async () => {
        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await deleteFile('file-1');

        expect(result).toBe(true);
      });
    });

    describe('uploadMultipleFiles', () => {
      it('여러 파일을 업로드할 수 있어야 함', async () => {
        const files = [
          new File(['content1'], 'file1.txt', { type: 'text/plain' }),
          new File(['content2'], 'file2.txt', { type: 'text/plain' }),
        ];

        jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

        const result = await uploadMultipleFiles(files);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result[0].filename).toBe('file1.txt');
        expect(result[1].filename).toBe('file2.txt');
      });
    });

    describe('checkAnalysisStatus', () => {
      it('분석 상태를 확인할 수 있어야 함', async () => {
        const mockResponse = {
          status: 'processing',
          progress: 50,
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await checkAnalysisStatus('file-1');

        expect(result).toBeDefined();
        expect(result.status).toBeDefined();
        expect(typeof result.progress).toBe('number');
      });

      it('상태 확인 실패 시 모크 응답을 반환해야 함', async () => {
        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await checkAnalysisStatus('file-1');

        expect(result).toBeDefined();
        expect(result.status).toBe('completed');
        expect(result.progress).toBe(100);
      });
    });

    describe('performAdvancedAnalysis', () => {
      it('고급 분석을 수행할 수 있어야 함', async () => {
        const options: AdvancedAnalysisOptions = {
          extract_keywords: true,
          sentiment_analysis: true,
          entity_recognition: true,
          summarization: true,
        };

        const mockResponse: AnalysisResult = {
          id: 'analysis-1',
          file_id: 'file-1',
          extracted_text: '고급 분석 결과',
          summary: '요약',
          key_points: [],
          keywords: ['키워드'],
          sentiment: 'positive',
          confidence: 0.95,
          processing_time: 5.0,
          created_at: new Date().toISOString(),
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await performAdvancedAnalysis('file-1', options);

        expect(result).toBeDefined();
        expect(result.file_id).toBe('file-1');
        expect(Array.isArray(result.keywords)).toBe(true);
      });

      it('분석 실패 시 모크 응답을 반환해야 함', async () => {
        const options: AdvancedAnalysisOptions = {
          extract_keywords: true,
          sentiment_analysis: true,
          entity_recognition: true,
          summarization: true,
        };

        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await performAdvancedAnalysis('file-1', options);

        expect(result).toBeDefined();
        expect(result.file_id).toBe('file-1');
        expect(Array.isArray(result.key_points)).toBe(true);
        expect(result.confidence).toBeGreaterThan(0);
      });
    });
  });

  describe('AdvancedMediaAnalysisAPI 클래스', () => {
    describe('인스턴스', () => {
      it('싱글톤 인스턴스가 존재해야 함', () => {
        expect(advancedMediaAnalysisAPI).toBeDefined();
        expect(advancedMediaAnalysisAPI).toBeInstanceOf(AdvancedMediaAnalysisAPI);
      });

      it('새 인스턴스를 생성할 수 있어야 함', () => {
        const api = new AdvancedMediaAnalysisAPI('http://custom-url:8001');
        expect(api).toBeInstanceOf(AdvancedMediaAnalysisAPI);
      });
    });

    describe('uploadMediaFile', () => {
      it('프로젝트 ID와 함께 파일을 업로드할 수 있어야 함', async () => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        const mockResponse: MediaUploadResponse = {
          id: 'file-1',
          filename: 'test.txt',
          file_type: 'text/plain',
          file_size: 4,
          upload_time: new Date().toISOString(),
          status: 'uploaded',
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await advancedMediaAnalysisAPI.uploadMediaFile(mockFile, 'project-1');

        expect(result).toBeDefined();
        expect(result.filename).toBe('test.txt');
      });

      it('업로드 실패 시 에러를 발생시켜야 함', async () => {
        const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          statusText: 'Upload failed',
        });

        await expect(
          advancedMediaAnalysisAPI.uploadMediaFile(mockFile)
        ).rejects.toThrow('파일 업로드 실패');
      });
    });

    describe('analyzeFile', () => {
      it('파일 분석을 시작할 수 있어야 함', async () => {
        const mockResponse: AnalysisResult = {
          id: 'analysis-1',
          file_id: 'file-1',
          extracted_text: '텍스트',
          summary: '요약',
          key_points: [],
          keywords: [],
          sentiment: 'neutral',
          confidence: 0.9,
          processing_time: 2.0,
          created_at: new Date().toISOString(),
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await advancedMediaAnalysisAPI.analyzeFile('file-1');

        expect(result).toBeDefined();
        expect(result.file_id).toBe('file-1');
      });
    });

    describe('getAnalysisResult', () => {
      it('분석 결과를 조회할 수 있어야 함', async () => {
        const mockResponse: AnalysisResult = {
          id: 'analysis-1',
          file_id: 'file-1',
          extracted_text: '텍스트',
          summary: '요약',
          key_points: [],
          keywords: [],
          sentiment: 'neutral',
          confidence: 0.9,
          processing_time: 2.0,
          created_at: new Date().toISOString(),
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await advancedMediaAnalysisAPI.getAnalysisResult('file-1');

        expect(result).toBeDefined();
        expect(result.file_id).toBe('file-1');
      });
    });

    describe('getWritingTheories', () => {
      it('글쓰기 이론 목록을 조회할 수 있어야 함', async () => {
        const mockResponse = [
          {
            id: 'theory-1',
            name: '이론1',
            description: '설명',
            principles: ['원칙1'],
            examples: ['예시1'],
            application: '적용',
          },
        ];

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await advancedMediaAnalysisAPI.getWritingTheories();

        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('generateConversationalResponse', () => {
      it('대화형 응답을 생성할 수 있어야 함', async () => {
        const message = {
          id: 'msg-1',
          sender: 'user' as const,
          content: '질문',
          timestamp: new Date().toISOString(),
        };

        const mockResponse = {
          response: '응답',
          timestamp: new Date().toISOString(),
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await advancedMediaAnalysisAPI.generateConversationalResponse(message);

        expect(result).toBeDefined();
        expect(result.response).toBeDefined();
      });

      it('이론 ID와 함께 응답을 생성할 수 있어야 함', async () => {
        const message = {
          id: 'msg-1',
          sender: 'user' as const,
          content: '질문',
          timestamp: new Date().toISOString(),
        };

        const mockResponse = {
          response: '응답',
          timestamp: new Date().toISOString(),
        };

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await advancedMediaAnalysisAPI.generateConversationalResponse(
          message,
          'theory-1'
        );

        expect(result).toBeDefined();
      });
    });

    describe('getUploadedFiles', () => {
      it('업로드된 파일 목록을 조회할 수 있어야 함', async () => {
        const mockResponse = [
          {
            id: 'file-1',
            name: 'file.txt',
            mime_type: 'text/plain',
            size: 1000,
            upload_date: new Date().toISOString(),
            analysis_status: 'completed',
          },
        ];

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await advancedMediaAnalysisAPI.getUploadedFiles();

        expect(Array.isArray(result)).toBe(true);
        expect(result[0].type).toBe('document');
        expect(result[0].analysisStatus).toBe('completed');
      });

      it('프로젝트 ID로 필터링할 수 있어야 함', async () => {
        const mockResponse: unknown[] = [];

        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await advancedMediaAnalysisAPI.getUploadedFiles('project-1');

        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('checkServerStatus', () => {
      it('서버 상태를 확인할 수 있어야 함', async () => {
        jest.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
        });

        const result = await advancedMediaAnalysisAPI.checkServerStatus();

        expect(result).toBe(true);
      });

      it('서버 오류 시 false를 반환해야 함', async () => {
        jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await advancedMediaAnalysisAPI.checkServerStatus();

        expect(result).toBe(false);
      });
    });

    describe('generateWritingInsights', () => {
      it('글쓰기 인사이트를 생성할 수 있어야 함', () => {
        const analysisResult: AnalysisResult = {
          id: 'analysis-1',
          file_id: 'file-1',
          extracted_text: '긴 텍스트 내용...',
          summary: '요약 내용',
          key_points: [],
          keywords: ['키워드1', '키워드2'],
          sentiment: 'positive',
          confidence: 0.9,
          processing_time: 2.0,
          created_at: new Date().toISOString(),
        };

        const insights = advancedMediaAnalysisAPI.generateWritingInsights(analysisResult);

        expect(Array.isArray(insights)).toBe(true);
        insights.forEach((insight) => {
          expect(insight.id).toBeDefined();
          expect(['quote', 'reference', 'argument', 'example', 'statistic']).toContain(
            insight.type
          );
          expect(insight.content).toBeDefined();
          expect(typeof insight.confidence).toBe('number');
          expect(insight.writing_style).toBeDefined();
        });
      });
    });
  });

  describe('실제 사용자 시나리오 테스트', () => {
    it('재개발 프로젝트 관련 파일을 업로드하고 분석할 수 있어야 함', async () => {
      const mockFile = new File(
        ['재개발 프로젝트 관련 내용'],
        '재개발_프로젝트.txt',
        { type: 'text/plain' }
      );

      jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const uploadResult = await uploadMediaFile(mockFile);
      expect(uploadResult).toBeDefined();
      expect(uploadResult.filename).toContain('재개발');

      const analysisResult = await analyzeMediaFile(uploadResult.id);
      expect(analysisResult).toBeDefined();
      expect(analysisResult.file_id).toBe(uploadResult.id);
    });

    it('여러 파일을 업로드하고 고급 분석을 수행할 수 있어야 함', async () => {
      const files = [
        new File(['내용1'], 'file1.txt', { type: 'text/plain' }),
        new File(['내용2'], 'file2.txt', { type: 'text/plain' }),
      ];

      jest.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const uploadResults = await uploadMultipleFiles(files);
      expect(uploadResults.length).toBe(2);

      const analysisOptions: AdvancedAnalysisOptions = {
        extract_keywords: true,
        sentiment_analysis: true,
        entity_recognition: true,
        summarization: true,
      };

      const analysisResult = await performAdvancedAnalysis(
        uploadResults[0].id,
        analysisOptions
      );
      expect(analysisResult).toBeDefined();
      expect(analysisResult.keywords.length).toBeGreaterThan(0);
    });
  });
});

