import { MediaKnowledgeAPI, mediaKnowledgeAPI } from '../mediaKnowledgeAPI';
import type {
    ProjectCreate,
    MediaUploadResponse,
    FileAnalysis,
    MediaFile,
    KnowledgeEntry,
    PopupCreate,
    Popup
} from '../mediaKnowledgeAPI';

// fetch 모킹
global.fetch = jest.fn();

describe('MediaKnowledgeAPI', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getStatus', () => {
        it('시스템 상태를 조회해야 함', async () => {
            const mockResponse = { status: 'healthy' };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await MediaKnowledgeAPI.getStatus();

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8005/api/status',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        it('에러 발생 시 예외를 발생시켜야 함', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            await expect(MediaKnowledgeAPI.getStatus()).rejects.toThrow('HTTP error! status: 500');
        });
    });

    describe('createProject', () => {
        it('프로젝트를 생성해야 함', async () => {
            const project: ProjectCreate = {
                name: '테스트 프로젝트',
                description: '설명',
                category: '카테고리'
            };

            const mockResponse = {
                success: true,
                project_id: 'project123',
                message: '프로젝트가 생성되었습니다'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await MediaKnowledgeAPI.createProject(project);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8005/api/projects',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(project)
                })
            );
        });
    });

    describe('uploadMediaFile', () => {
        it('미디어 파일을 업로드해야 함', async () => {
            const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
            const projectId = 'project123';

            const mockResponse: MediaUploadResponse = {
                file_id: 'file123',
                project_id: projectId,
                filename: 'test.jpg',
                file_size: 1024,
                mime_type: 'image/jpeg',
                upload_date: '2024-01-01T00:00:00Z'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    upload_result: mockResponse
                })
            });

            const result = await MediaKnowledgeAPI.uploadMediaFile(file, projectId);

            expect(result.success).toBe(true);
            expect(result.upload_result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8005/api/upload-media',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData)
                })
            );
        });

        it('FormData에 파일과 프로젝트 ID를 포함해야 함', async () => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const projectId = 'project123';

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    upload_result: {
                        file_id: 'file123',
                        project_id: projectId,
                        filename: 'test.jpg',
                        file_size: 1024,
                        mime_type: 'image/jpeg',
                        upload_date: '2024-01-01T00:00:00Z'
                    }
                })
            });

            await MediaKnowledgeAPI.uploadMediaFile(file, projectId);

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const formData = fetchCall[1].body as FormData;

            expect(formData).toBeInstanceOf(FormData);
        });
    });

    describe('analyzeFile', () => {
        it('파일을 분석해야 함', async () => {
            const fileId = 'file123';
            const mockAnalysis: FileAnalysis = {
                analysis_id: 'analysis123',
                knowledge_id: 'knowledge123',
                extracted_text: '추출된 텍스트',
                keywords: ['키워드1', '키워드2'],
                summary: '요약',
                confidence_score: 0.95
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    analysis_result: mockAnalysis
                })
            });

            const result = await MediaKnowledgeAPI.analyzeFile(fileId);

            expect(result.success).toBe(true);
            expect(result.analysis_result).toEqual(mockAnalysis);
            expect(global.fetch).toHaveBeenCalledWith(
                `http://localhost:8005/api/analyze-file/${fileId}`,
                expect.objectContaining({
                    method: 'POST'
                })
            );
        });
    });

    describe('getProjectFiles', () => {
        it('프로젝트 파일 목록을 조회해야 함', async () => {
            const projectId = 'project123';
            const mockFiles: MediaFile[] = [
                {
                    id: 'file1',
                    project_id: projectId,
                    filename: 'file1.jpg',
                    original_filename: 'original1.jpg',
                    file_path: '/path/to/file1.jpg',
                    file_size: 1024,
                    mime_type: 'image/jpeg',
                    upload_date: '2024-01-01T00:00:00Z',
                    summary: '요약',
                    confidence_score: 0.9
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    files: mockFiles
                })
            });

            const result = await MediaKnowledgeAPI.getProjectFiles(projectId);

            expect(result.success).toBe(true);
            expect(result.files).toEqual(mockFiles);
            expect(global.fetch).toHaveBeenCalledWith(
                `http://localhost:8005/api/projects/${projectId}/files`,
                expect.any(Object)
            );
        });
    });

    describe('getProjectKnowledge', () => {
        it('프로젝트 지식 베이스를 조회해야 함', async () => {
            const projectId = 'project123';
            const mockKnowledge: KnowledgeEntry[] = [
                {
                    id: 'knowledge1',
                    project_id: projectId,
                    content: '지식 내용',
                    source_file_id: 'file1',
                    knowledge_type: 'text',
                    tags: ['태그1', '태그2'],
                    created_at: '2024-01-01T00:00:00Z',
                    source_filename: 'source.jpg'
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    knowledge: mockKnowledge
                })
            });

            const result = await MediaKnowledgeAPI.getProjectKnowledge(projectId);

            expect(result.success).toBe(true);
            expect(result.knowledge).toEqual(mockKnowledge);
        });
    });

    describe('createPopup', () => {
        it('팝업을 생성해야 함', async () => {
            const projectId = 'project123';
            const popup: PopupCreate = {
                popup_type: 'info',
                title: '팝업 제목',
                content: '팝업 내용',
                position_x: 100,
                position_y: 200
            };

            const mockResponse = {
                success: true,
                popup_id: 'popup123',
                message: '팝업이 생성되었습니다'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await MediaKnowledgeAPI.createPopup(projectId, popup);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                `http://localhost:8005/api/projects/${projectId}/popups`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(popup)
                })
            );
        });
    });

    describe('getProjectPopups', () => {
        it('프로젝트 팝업 목록을 조회해야 함', async () => {
            const projectId = 'project123';
            const mockPopups: Popup[] = [
                {
                    id: 'popup1',
                    project_id: projectId,
                    popup_type: 'info',
                    title: '팝업 제목',
                    content: '팝업 내용',
                    position_x: 100,
                    position_y: 200,
                    is_active: true,
                    created_at: '2024-01-01T00:00:00Z'
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    popups: mockPopups
                })
            });

            const result = await MediaKnowledgeAPI.getProjectPopups(projectId);

            expect(result.success).toBe(true);
            expect(result.popups).toEqual(mockPopups);
        });
    });

    describe('testConnection', () => {
        it('연결 성공 시 true를 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'healthy' })
            });

            const result = await MediaKnowledgeAPI.testConnection();

            expect(result).toBe(true);
        });

        it('연결 실패 시 false를 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await MediaKnowledgeAPI.testConnection();

            expect(result).toBe(false);
        });
    });
});

describe('mediaKnowledgeAPI (편의 함수)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('createProject', () => {
        it('프로젝트 ID를 반환해야 함', async () => {
            const project: ProjectCreate = {
                name: '테스트 프로젝트'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    project_id: 'project123',
                    message: '성공'
                })
            });

            const result = await mediaKnowledgeAPI.createProject(project);

            expect(result).toBe('project123');
        });

        it('에러 발생 시 예외를 발생시켜야 함', async () => {
            const project: ProjectCreate = {
                name: '테스트 프로젝트'
            };

            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(mediaKnowledgeAPI.createProject(project)).rejects.toThrow();
        });
    });

    describe('uploadMedia', () => {
        it('업로드 결과를 반환해야 함', async () => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const projectId = 'project123';
            const mockUpload: MediaUploadResponse = {
                file_id: 'file123',
                project_id: projectId,
                filename: 'test.jpg',
                file_size: 1024,
                mime_type: 'image/jpeg',
                upload_date: '2024-01-01T00:00:00Z'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    upload_result: mockUpload
                })
            });

            const result = await mediaKnowledgeAPI.uploadMedia(file, projectId);

            expect(result).toEqual(mockUpload);
        });
    });

    describe('analyzeFile', () => {
        it('분석 결과를 반환해야 함', async () => {
            const fileId = 'file123';
            const mockAnalysis: FileAnalysis = {
                analysis_id: 'analysis123',
                knowledge_id: 'knowledge123',
                extracted_text: '텍스트',
                keywords: ['키워드'],
                summary: '요약',
                confidence_score: 0.9
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    analysis_result: mockAnalysis
                })
            });

            const result = await mediaKnowledgeAPI.analyzeFile(fileId);

            expect(result).toEqual(mockAnalysis);
        });
    });

    describe('getProjectFiles', () => {
        it('파일 목록을 반환해야 함', async () => {
            const projectId = 'project123';
            const mockFiles: MediaFile[] = [
                {
                    id: 'file1',
                    project_id: projectId,
                    filename: 'file1.jpg',
                    original_filename: 'original1.jpg',
                    file_path: '/path/to/file1.jpg',
                    file_size: 1024,
                    mime_type: 'image/jpeg',
                    upload_date: '2024-01-01T00:00:00Z',
                    summary: '요약',
                    confidence_score: 0.9
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    files: mockFiles
                })
            });

            const result = await mediaKnowledgeAPI.getProjectFiles(projectId);

            expect(result).toEqual(mockFiles);
        });
    });

    describe('getProjectKnowledge', () => {
        it('지식 베이스를 반환해야 함', async () => {
            const projectId = 'project123';
            const mockKnowledge: KnowledgeEntry[] = [
                {
                    id: 'knowledge1',
                    project_id: projectId,
                    content: '내용',
                    source_file_id: 'file1',
                    knowledge_type: 'text',
                    tags: ['태그'],
                    created_at: '2024-01-01T00:00:00Z',
                    source_filename: 'source.jpg'
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    knowledge: mockKnowledge
                })
            });

            const result = await mediaKnowledgeAPI.getProjectKnowledge(projectId);

            expect(result).toEqual(mockKnowledge);
        });
    });

    describe('createPopup', () => {
        it('팝업 ID를 반환해야 함', async () => {
            const projectId = 'project123';
            const popup: PopupCreate = {
                popup_type: 'info',
                title: '제목',
                content: '내용'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    popup_id: 'popup123',
                    message: '성공'
                })
            });

            const result = await mediaKnowledgeAPI.createPopup(projectId, popup);

            expect(result).toBe('popup123');
        });
    });

    describe('getProjectPopups', () => {
        it('팝업 목록을 반환해야 함', async () => {
            const projectId = 'project123';
            const mockPopups: Popup[] = [
                {
                    id: 'popup1',
                    project_id: projectId,
                    popup_type: 'info',
                    title: '제목',
                    content: '내용',
                    position_x: 100,
                    position_y: 200,
                    is_active: true,
                    created_at: '2024-01-01T00:00:00Z'
                }
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    popups: mockPopups
                })
            });

            const result = await mediaKnowledgeAPI.getProjectPopups(projectId);

            expect(result).toEqual(mockPopups);
        });
    });

    describe('checkStatus', () => {
        it('상태가 healthy일 때 true를 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'healthy' })
            });

            const result = await mediaKnowledgeAPI.checkStatus();

            expect(result).toBe(true);
        });

        it('상태가 healthy가 아닐 때 false를 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'unhealthy' })
            });

            const result = await mediaKnowledgeAPI.checkStatus();

            expect(result).toBe(false);
        });

        it('에러 발생 시 false를 반환해야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await mediaKnowledgeAPI.checkStatus();

            expect(result).toBe(false);
        });
    });

    describe('testEndpoint', () => {
        it('테스트 엔드포인트를 호출해야 함', async () => {
            const mockResponse = { test: 'success' };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await mediaKnowledgeAPI.testEndpoint();

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8005/api/test',
                expect.any(Object)
            );
        });

        it('에러 발생 시 예외를 발생시켜야 함', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(mediaKnowledgeAPI.testEndpoint()).rejects.toThrow();
        });
    });
});

