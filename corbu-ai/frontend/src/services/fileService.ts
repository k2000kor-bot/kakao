export const fetchFileList = async (): Promise<string[]> => {
    // 실제 구현에서는 백엔드 API를 호출합니다
    try {
        const response = await fetch('/api/files');
        if (!response.ok) {
            throw new Error('Failed to fetch file list');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching file list:', error);
        // 임시 모의 데이터 반환
        return [
            'document1.pdf',
            'presentation.pptx',
            'spreadsheet.xlsx',
            'image.jpg'
        ];
    }
};

export const uploadFile = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('File upload failed');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const deleteFile = async (filename: string): Promise<void> => {
    try {
        const response = await fetch(`/api/files/${filename}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('File deletion failed');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}; 