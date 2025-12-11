/**
 * fileService 테스트
 * 파일 관련 API 호출 기능 확인
 */

import { fetchFileList, uploadFile, deleteFile } from '../fileService';

// fetch 모킹
global.fetch = jest.fn();

// console 메서드 모킹
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('fileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('fetchFileList', () => {
    it('파일 목록을 성공적으로 가져와야 함', async () => {
      const mockFiles = ['file1.pdf', 'file2.docx', 'file3.xlsx'];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFiles,
      });

      const result = await fetchFileList();

      expect(result).toEqual(mockFiles);
      expect(global.fetch).toHaveBeenCalledWith('/api/files');
    });

    it('API 호출 실패 시 모의 데이터를 반환해야 함', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchFileList();

      expect(result).toEqual([
        'document1.pdf',
        'presentation.pptx',
        'spreadsheet.xlsx',
        'image.jpg',
      ]);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('HTTP 에러 응답 시 모의 데이터를 반환해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await fetchFileList();

      expect(result).toEqual([
        'document1.pdf',
        'presentation.pptx',
        'spreadsheet.xlsx',
        'image.jpg',
      ]);
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('uploadFile', () => {
    it('파일을 성공적으로 업로드해야 함', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await uploadFile(file);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('업로드 실패 시 에러를 던져야 함', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(uploadFile(file)).rejects.toThrow('File upload failed');
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('네트워크 에러 시 에러를 던져야 함', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(uploadFile(file)).rejects.toThrow('Network error');
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('파일을 성공적으로 삭제해야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteFile('test.pdf');

      expect(global.fetch).toHaveBeenCalledWith('/api/files/test.pdf', {
        method: 'DELETE',
      });
    });

    it('삭제 실패 시 에러를 던져야 함', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(deleteFile('test.pdf')).rejects.toThrow('File deletion failed');
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('네트워크 에러 시 에러를 던져야 함', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(deleteFile('test.pdf')).rejects.toThrow('Network error');
      expect(mockConsoleError).toHaveBeenCalled();
    });
  });
});

