import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdvancedFileUpload from '../AdvancedFileUpload';

// framer-motion 애니메이션은 테스트에서 단순 래퍼로 대체
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

let lastInputOnChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | null = null;
jest.mock('react-dropzone', () => ({
  useDropzone: ({ onDrop }: { onDrop: (files: File[]) => void }) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e?.target?.files ?? []);
      if (files.length > 0) onDrop(files);
    };
    lastInputOnChange = onChange;
    return {
      getRootProps: () => ({}),
      getInputProps: (extraProps: Record<string, unknown> = {}) => ({
        type: 'file',
        ...extraProps,
        onChange,
      }),
      isDragActive: false,
    };
  },
}));

describe('AdvancedFileUpload', () => {
  const originalFileReader = global.FileReader;

  beforeEach(() => {
    class MockFileReader {
      public result: string | ArrayBuffer | null = null;
      public onload: null | (() => void) = null;
      readAsDataURL() {
        this.result = 'data:image/png;base64,mock';
        if (this.onload) this.onload();
      }
    }
    // preview 생성 경로 고정을 위한 FileReader 목
    // @ts-expect-error test mock
    global.FileReader = MockFileReader;
  });

  afterEach(() => {
    global.FileReader = originalFileReader;
    lastInputOnChange = null;
    jest.clearAllMocks();
  });

  it('이미지 업로드 시 preview img에 lazy/async 속성을 적용한다', async () => {
    const onFilesUploaded = jest.fn();
    const onFileRemove = jest.fn();

    render(
      <AdvancedFileUpload
        onFilesUploaded={onFilesUploaded}
        onFileRemove={onFileRemove}
      />
    );

    const file = new File(['image'], 'preview.png', { type: 'image/png' });
    expect(lastInputOnChange).not.toBeNull();
    lastInputOnChange!({ target: { files: [file], value: '' } } as React.ChangeEvent<HTMLInputElement>);

    await waitFor(() => {
      expect(onFilesUploaded).toHaveBeenCalledTimes(1);
    });

    const preview = await screen.findByRole('img', { name: 'preview.png' });
    expect(preview).toHaveAttribute('loading', 'lazy');
    expect(preview).toHaveAttribute('decoding', 'async');
  });

  it('업로드된 파일 제거 시 onFileRemove에 파일 id를 전달한다', async () => {
    const onFilesUploaded = jest.fn();
    const onFileRemove = jest.fn();

    render(
      <AdvancedFileUpload
        onFilesUploaded={onFilesUploaded}
        onFileRemove={onFileRemove}
      />
    );

    const file = new File(['image'], 'remove-me.png', { type: 'image/png' });
    expect(lastInputOnChange).not.toBeNull();
    lastInputOnChange!({ target: { files: [file], value: '' } } as React.ChangeEvent<HTMLInputElement>);

    await waitFor(() => {
      expect(onFilesUploaded).toHaveBeenCalledTimes(1);
    });

    const uploadedFiles = onFilesUploaded.mock.calls[0][0] as Array<{ id: string }>;
    const uploadedId = uploadedFiles[0].id;

    const removeButton = await screen.findByRole('button', { name: 'remove-me.png 파일 제거' });
    fireEvent.click(removeButton);

    expect(onFileRemove).toHaveBeenCalledWith(uploadedId);
  });
});
