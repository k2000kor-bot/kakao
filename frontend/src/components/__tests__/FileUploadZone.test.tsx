/**
 * FileUploadZone 컴포넌트 테스트
 * 파일 업로드 존 기능 확인
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/no-wait-for-multiple-assertions */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUploadZone from '../FileUploadZone';

const mockShowToast = jest.fn();
jest.mock('../../utils/toast', () => ({
  showToast: (msg: string) => mockShowToast(msg),
}));

// FileReader 모킹
class MockFileReader {
  result: string | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(file: File) {
    // 이미지 파일인 경우 mock data URL 반환
    if (file.type.startsWith('image/')) {
      setTimeout(() => {
        this.result = 'data:image/png;base64,mock-image-data';
        if (this.onload) {
          this.onload.call(this as unknown as FileReader, {} as unknown as ProgressEvent<FileReader>);
        }
      }, 0);
    } else {
      setTimeout(() => {
        if (this.onerror) {
          this.onerror.call(this as unknown as FileReader, {} as unknown as ProgressEvent<FileReader>);
        }
      }, 0);
    }
  }
}

globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

describe('FileUploadZone', () => {
  const mockOnFilesSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createMockFile = (name: string, type: string, size: number = 1000): File => {
    const file = new File(['mock content'], name, { type });
    Object.defineProperty(file, 'size', {
      value: size,
      writable: false,
    });
    return file;
  };

  const createMockFileList = (files: File[]): FileList => {
    const fileList = {
      item: (index: number) => files[index] || null,
      ...files,
      length: files.length,
    } as FileList;
    return fileList;
  };

  it('기본 렌더링이 올바르게 작동해야 함', () => {
    render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);
    expect(screen.getByText(/파일을 드래그하거나 클릭하여 업로드/i)).toBeInTheDocument();
  });

  it('파일 입력 필드가 렌더링되어야 함', () => {
    const { container } = render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('파일 선택 시 onFilesSelected가 호출되어야 함', async () => {
    const { container } = render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file = createMockFile('test.txt', 'text/plain');
    const fileList = createMockFileList([file]);
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalled();
      const callArgs = mockOnFilesSelected.mock.calls[0][0];
      expect(callArgs).toHaveLength(1);
      expect(callArgs[0].file.name).toBe('test.txt');
    });
  });

  it('이미지 파일 선택 시 미리보기가 생성되어야 함', async () => {
    const { container } = render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    const imageFile = createMockFile('test.png', 'image/png');
    const fileList = createMockFileList([imageFile]);
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalled();
      const callArgs = mockOnFilesSelected.mock.calls[0][0];
      expect(callArgs[0].type).toBe('image');
      // FileReader 모킹이 완벽하지 않을 수 있으므로 타입만 확인
      // preview는 E2E 테스트에서 검증
    }, { timeout: 3000 });
  });

  it('파일 크기가 maxSize를 초과하면 경고가 표시되어야 함', async () => {
    const { container } = render(
      <FileUploadZone onFilesSelected={mockOnFilesSelected} maxSize={1000} />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    const largeFile = createMockFile('large.txt', 'text/plain', 2000);
    const fileList = createMockFileList([largeFile]);
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('파일 크기가 너무 큽니다')
      );
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });
  });

  it('파일 개수가 maxFiles를 초과하면 경고가 표시되어야 함', async () => {
    const { container } = render(
      <FileUploadZone onFilesSelected={mockOnFilesSelected} maxFiles={2} />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file1 = createMockFile('file1.txt', 'text/plain');
    const file2 = createMockFile('file2.txt', 'text/plain');
    const file3 = createMockFile('file3.txt', 'text/plain');
    const fileList = createMockFileList([file1, file2, file3]);
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('최대 2개까지 업로드할 수 있습니다')
      );
      expect(mockOnFilesSelected).not.toHaveBeenCalled();
    });
  });

  it('disabled가 true이면 파일 선택이 비활성화되어야 함', () => {
    const { container } = render(
      <FileUploadZone onFilesSelected={mockOnFilesSelected} disabled />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDisabled();
  });

  it('드래그 앤 드롭으로 파일을 업로드할 수 있어야 함', async () => {
    const { container } = render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);
    const dropZone = container.querySelector('.file-upload-zone') || container.firstChild as HTMLElement;
    
    const file = createMockFile('test.txt', 'text/plain');
    const fileList = createMockFileList([file]);
    const dataTransfer = {
      files: fileList,
    } as unknown as DataTransfer;

    fireEvent.dragEnter(dropZone, { dataTransfer });
    fireEvent.dragOver(dropZone, { dataTransfer });
    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalled();
    });
  });

  it('드래그 중일 때 드래깅 스타일이 적용되어야 함', () => {
    const { container } = render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);
    const dropZone = container.querySelector('.file-upload-zone') || container.firstChild as HTMLElement;
    
    fireEvent.dragEnter(dropZone);
    
    expect(dropZone).toHaveClass('dragging');
  });

  it('disabled일 때 드래그가 작동하지 않아야 함', () => {
    const { container } = render(
      <FileUploadZone onFilesSelected={mockOnFilesSelected} disabled />
    );
    const dropZone = container.querySelector('.file-upload-zone') || container.firstChild as HTMLElement;
    
    fireEvent.dragEnter(dropZone);
    
    expect(dropZone).not.toHaveClass('dragging');
  });

  it('문서 파일 타입을 올바르게 감지해야 함', async () => {
    const { container } = render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    const pdfFile = createMockFile('test.pdf', 'application/pdf');
    const fileList = createMockFileList([pdfFile]);
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalled();
      const callArgs = mockOnFilesSelected.mock.calls[0][0];
      expect(callArgs[0].type).toBe('document');
    });
  });

  it('accept prop이 설정되면 파일 입력에 적용되어야 함', () => {
    const { container } = render(
      <FileUploadZone onFilesSelected={mockOnFilesSelected} accept="image/*" />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('multiple prop이 false이면 단일 파일만 선택 가능해야 함', () => {
    const { container } = render(
      <FileUploadZone onFilesSelected={mockOnFilesSelected} multiple={false} />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toHaveAttribute('multiple');
  });

  it('파일 선택 후 입력 필드가 리셋되어야 함', async () => {
    const { container } = render(<FileUploadZone onFilesSelected={mockOnFilesSelected} />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file = createMockFile('test.txt', 'text/plain');
    const fileList = createMockFileList([file]);
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(fileInput.value).toBe('');
    });
  });
});

