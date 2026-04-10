import {
    API_FORM_FIELD_FILE,
    FILES_COLLECTION_PATH,
    FILE_UPLOAD_PATH,
    joinApiHealthCheckUrl,
    resolveApiBaseUrl,
} from '../config/api';
import { errorLogger } from '../utils/errorLogger';

export const fetchFileList = async (): Promise<string[]> => {
    // 실제 구현에서는 백엔드 API를 호출합니다
    try {
        const response = await fetch(joinApiHealthCheckUrl(resolveApiBaseUrl(), FILES_COLLECTION_PATH));
        if (!response.ok) {
            throw new Error('Failed to fetch file list');
        }
        return await response.json();
    } catch (error) {
        errorLogger.error('Error fetching file list', error instanceof Error ? error : new Error(String(error)), { component: 'fileService', action: 'fetchFileList' });
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
    formData.append(API_FORM_FIELD_FILE, file);

    try {
        const response = await fetch(joinApiHealthCheckUrl(resolveApiBaseUrl(), FILE_UPLOAD_PATH), {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('File upload failed');
        }
    } catch (error) {
        errorLogger.error('Error uploading file', error instanceof Error ? error : new Error(String(error)), { component: 'fileService', action: 'uploadFile' });
        throw error;
    }
};

export const deleteFile = async (filename: string): Promise<void> => {
    try {
        const response = await fetch(
            joinApiHealthCheckUrl(
                resolveApiBaseUrl(),
                `${FILES_COLLECTION_PATH}/${encodeURIComponent(filename)}`
            ),
            {
                method: 'DELETE',
            }
        );

        if (!response.ok) {
            throw new Error('File deletion failed');
        }
    } catch (error) {
        errorLogger.error('Error deleting file', error instanceof Error ? error : new Error(String(error)), { component: 'fileService', action: 'deleteFile', filename });
        throw error;
    }
}; 