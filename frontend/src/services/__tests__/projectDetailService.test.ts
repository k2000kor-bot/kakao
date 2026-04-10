/**
 * projectDetailService 테스트
 * 프로젝트 상세 정보 서비스 기능 확인
 */
/* eslint-disable jest/no-conditional-expect */

import { projectDetailService } from '../projectDetailService';

describe('projectDetailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjectDetail', () => {
    it('프로젝트 상세 정보를 가져와야 함', async () => {
      const detail = await projectDetailService.getProjectDetail('1');

      expect(detail).not.toBeNull();
      expect(detail?.id).toBe('1');
      expect(detail?.name).toBe('샘플 재건축 프로젝트');
      expect(detail?.files).toBeDefined();
      expect(detail?.guidelines).toBeDefined();
      expect(detail?.conversations).toBeDefined();
      expect(detail?.analysis).toBeDefined();
    });

    it('존재하지 않는 프로젝트는 에러를 던져야 함', async () => {
      await expect(
        projectDetailService.getProjectDetail('999')
      ).rejects.toThrow('Project with id 999 not found');
    });

    it('프로젝트 파일 목록을 포함해야 함', async () => {
      const detail = await projectDetailService.getProjectDetail('1');

      expect(detail?.files.length).toBeGreaterThan(0);
      expect(detail?.files[0].id).toBeDefined();
      expect(detail?.files[0].name).toBeDefined();
    });

    it('프로젝트 가이드라인을 포함해야 함', async () => {
      const detail = await projectDetailService.getProjectDetail('1');

      expect(detail?.guidelines.length).toBeGreaterThan(0);
      expect(detail?.guidelines[0].title).toBeDefined();
      expect(detail?.guidelines[0].content).toBeDefined();
    });
  });

  describe('addFile', () => {
    it('파일을 추가해야 함', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const addedFile = await projectDetailService.addFile('1', file);

      expect(addedFile).toBeDefined();
      expect(addedFile.name).toBe('test.pdf');
      expect(addedFile.type).toBe('document');
      expect(addedFile.size).toBe(file.size);
    });

    it('파일 타입을 올바르게 감지해야 함', async () => {
      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const codeFile = new File(['test'], 'test.js', { type: 'text/javascript' });

      const pdfResult = await projectDetailService.addFile('1', pdfFile);
      const imageResult = await projectDetailService.addFile('1', imageFile);
      const codeResult = await projectDetailService.addFile('1', codeFile);

      expect(pdfResult.type).toBe('document');
      expect(imageResult.type).toBe('image');
      expect(codeResult.type).toBe('code');
    });
  });

  describe('deleteFile', () => {
    it('파일 삭제를 처리해야 함', async () => {
      await expect(
        projectDetailService.deleteFile('1', 'file-1')
      ).resolves.not.toThrow();
    });
  });

  describe('addGuideline', () => {
    it('가이드라인을 추가해야 함', async () => {
      const guideline = {
        title: 'Test Guideline',
        content: 'Test content',
        category: 'test',
      };

      await expect(
        projectDetailService.addGuideline('1', guideline)
      ).resolves.not.toThrow();
    });
  });

  describe('generateWritingMaterial', () => {
    it('글쓰기 자료를 생성해야 함', async () => {
      const material = await projectDetailService.generateWritingMaterial(
        '1',
        'Test prompt',
        ['file-1', 'file-2']
      );

      expect(material).toBeDefined();
      expect(material.title).toContain('Test prompt');
      expect(material.content).toBeDefined();
      expect(material.sourceFiles).toEqual(['file-1', 'file-2']);
      expect(material.confidenceScore).toBe(0.8);
    });

    it('소스 파일 없이도 생성할 수 있어야 함', async () => {
      const material = await projectDetailService.generateWritingMaterial('1', 'Test prompt');

      expect(material).toBeDefined();
      expect(material.sourceFiles).toEqual([]);
    });
  });
});

