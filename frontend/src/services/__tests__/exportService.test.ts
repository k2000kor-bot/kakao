/**
 * exportService 서비스 테스트
 * 내보내기 서비스 테스트
 */
/* eslint-disable jest/no-conditional-expect */

import exportService, { ExportData } from '../exportService';
import { Message } from '../../types/chat';

// DOM APIs 모킹
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

beforeAll(() => {
  // document.createElement 모킹 - 매번 새 객체 반환
  jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') {
      const anchor = {
        href: '',
        download: '',
        click: mockClick,
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      } as unknown as HTMLAnchorElement;
      return anchor;
    }
    return document.createElement(tag);
  });

  // document.body 메서드 모킹
  jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
  jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

  // URL.createObjectURL 모킹
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();

  // Blob 모킹
  global.Blob = jest.fn((parts: BlobPart[], options?: BlobPropertyBag) => ({
    size: parts.reduce((acc: number, part: BlobPart) => acc + (typeof part === 'string' ? part.length : (part as Blob)?.size ?? 0), 0),
    type: options?.type || '',
  })) as unknown as typeof Blob;
});

describe('exportService', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      content: '안녕하세요',
      sender: 'user',
      timestamp: '2025-01-27T10:00:00Z',
    },
    {
      id: '2',
      content: '네, 안녕하세요! 무엇을 도와드릴까요?',
      sender: 'assistant',
      timestamp: '2025-01-27T10:00:01Z',
    },
  ];

  const mockExportData: ExportData = {
    projectName: '테스트 프로젝트',
    exportDate: new Date('2025-01-27T10:00:00Z'),
    messages: mockMessages,
    files: [
      {
        name: 'test.pdf',
        size: 1024,
        type: 'application/pdf',
        uploadedAt: new Date('2025-01-27T09:00:00Z'),
      },
    ],
    guidelines: [
      {
        title: '테스트 지침',
        content: '테스트 내용',
        priority: 'high',
        category: 'general',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // anchor 요소 모킹 재설정
    jest.mocked(document.createElement).mockImplementation((tag: string) => {
      if (tag === 'a') {
        const anchor = {
          href: '',
          download: '',
          click: mockClick,
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
        } as unknown as HTMLAnchorElement;
        return anchor;
      }
      return document.createElement(tag);
    });
  });

  describe('exportAsText', () => {
    it('텍스트 형식으로 내보낼 수 있어야 함', () => {
      const result = exportService.exportAsText(mockExportData);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('테스트 프로젝트');
      expect(result).toContain('대화 내역');
      expect(result).toContain('안녕하세요');
    });

    it('파일 정보를 포함할 수 있어야 함', () => {
      const result = exportService.exportAsText(mockExportData);
      
      expect(result).toContain('첨부 파일');
      expect(result).toContain('test.pdf');
    });

    it('지침 정보를 포함할 수 있어야 함', () => {
      const result = exportService.exportAsText(mockExportData);
      
      expect(result).toContain('프로젝트 지침');
      expect(result).toContain('테스트 지침');
    });

    it('파일과 지침이 없을 때도 작동해야 함', () => {
      const dataWithoutExtras: ExportData = {
        ...mockExportData,
        files: undefined,
        guidelines: undefined,
      };
      
      const result = exportService.exportAsText(dataWithoutExtras);
      expect(typeof result).toBe('string');
      expect(result).toContain('테스트 프로젝트');
    });
  });

  describe('exportAsJSON', () => {
    it('JSON 형식으로 내보낼 수 있어야 함', () => {
      const result = exportService.exportAsJSON(mockExportData);
      
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed.projectName).toBe('테스트 프로젝트');
      expect(parsed.messages).toHaveLength(2);
    });

    it('모든 데이터를 포함해야 함', () => {
      const result = exportService.exportAsJSON(mockExportData);
      const parsed = JSON.parse(result);
      
      expect(parsed).toHaveProperty('projectName');
      expect(parsed).toHaveProperty('exportDate');
      expect(parsed).toHaveProperty('messages');
      expect(parsed).toHaveProperty('files');
      expect(parsed).toHaveProperty('guidelines');
    });
  });

  describe('exportAsCSV', () => {
    it('CSV 형식으로 내보낼 수 있어야 함', () => {
      const result = exportService.exportAsCSV(mockExportData);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('시간,발신자,내용');
      expect(result).toContain('안녕하세요');
    });

    it('CSV 형식이 올바르게 형식화되어야 함', () => {
      const result = exportService.exportAsCSV(mockExportData);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('시간,발신자,내용');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('따옴표가 포함된 내용을 이스케이프해야 함', () => {
      const dataWithQuotes: ExportData = {
        ...mockExportData,
        messages: [
          {
            id: '1',
            content: '이것은 "따옴표"가 있는 메시지입니다',
            sender: 'user',
            timestamp: '2025-01-27T10:00:00Z',
          },
        ],
      };
      
      const result = exportService.exportAsCSV(dataWithQuotes);
      expect(result).toContain('""');
    });
  });

  describe('downloadFile', () => {
    it('파일을 다운로드할 수 있어야 함', () => {
      exportService.downloadFile('test content', 'test.txt', 'text/plain');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      // DOM 조작이 정상적으로 수행되는지 확인
      expect(mockClick).toHaveBeenCalled();
    });

    it('Blob을 생성해야 함', () => {
      exportService.downloadFile('test content', 'test.txt', 'text/plain');
      
      expect(global.Blob).toHaveBeenCalledWith(
        ['test content'],
        { type: 'text/plain' }
      );
    });

    it('URL을 생성하고 해제해야 함', () => {
      exportService.downloadFile('test content', 'test.txt', 'text/plain');
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportConversation', () => {
    it('txt 형식으로 대화를 내보낼 수 있어야 함', async () => {
      await exportService.exportConversation(
        '테스트 프로젝트',
        mockMessages,
        mockExportData.files,
        mockExportData.guidelines,
        { format: 'txt' }
      );
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
    });

    it('json 형식으로 대화를 내보낼 수 있어야 함', async () => {
      await exportService.exportConversation(
        '테스트 프로젝트',
        mockMessages,
        mockExportData.files,
        mockExportData.guidelines,
        { format: 'json' }
      );
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
    });

    it('csv 형식으로 대화를 내보낼 수 있어야 함', async () => {
      await exportService.exportConversation(
        '테스트 프로젝트',
        mockMessages,
        mockExportData.files,
        mockExportData.guidelines,
        { format: 'csv' }
      );
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
    });

    it('지원하지 않는 형식에 대해 에러를 던져야 함', async () => {
      await expect(
        exportService.exportConversation(
          '테스트 프로젝트',
          mockMessages,
          undefined,
          undefined,
          { format: 'pdf' as 'text' | 'markdown' | 'json' }
        )
      ).rejects.toThrow('지원하지 않는 내보내기 형식입니다.');
    });

    it('메타데이터를 포함해야 함', async () => {
      await exportService.exportConversation(
        '테스트 프로젝트',
        mockMessages,
        mockExportData.files,
        mockExportData.guidelines,
        { format: 'json', includeMetadata: true }
      );
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('exportFilesAsZip', () => {
    it('파일을 압축 다운로드할 수 있어야 함', async () => {
      const mockFile = {
        name: 'test.txt',
        size: 4,
        type: 'text/plain',
      } as File;

      await exportService.exportFilesAsZip([mockFile], '테스트 프로젝트');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
    });

    it('여러 파일을 다운로드할 수 있어야 함', async () => {
      const mockFile1 = {
        name: 'test1.txt',
        size: 5,
        type: 'text/plain',
      } as File;
      const mockFile2 = {
        name: 'test2.txt',
        size: 5,
        type: 'text/plain',
      } as File;

      await exportService.exportFilesAsZip([mockFile1, mockFile2], '테스트 프로젝트');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalledTimes(2);
    });
  });
});

