/**
 * projectService 테스트
 * 프로젝트·대화·메시지 CRUD 및 노트북 API 검증
 * @jest-environment jsdom
 */
/* eslint-disable jest/no-conditional-expect */

import {
  projectService,
  chatService,
  messageService,
  systemService,
  getProjectStats,
} from '../projectService';
import {
  API_BASE_URL,
  API_PROJECT_FILES_SEGMENT,
  API_PROJECT_NOTEBOOK_CONTEXT_SEGMENT,
  DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL,
  API_PROJECT_NOTEBOOK_SOURCES_FROM_FILE_SEGMENT,
  API_PROJECT_NOTEBOOK_SOURCES_FROM_URL_SEGMENT,
  API_PROJECT_NOTEBOOK_SOURCES_FROM_YOUTUBE_SEARCH_SEGMENT,
  API_PROJECT_NOTEBOOK_SOURCES_SEGMENT,
  API_PROJECT_NOTEBOOK_STUDIO_OUTPUTS_SEGMENT,
  API_PROJECT_NOTEBOOK_SUGGESTED_QUESTIONS_SEGMENT,
  API_PROJECTS_LIST_PATH,
  joinApiHealthCheckUrl,
} from '../../config/api';
import {
  STORED_ASSISTANT_INCOMPLETE_NOTICE,
  ASSISTANT_PLACEHOLDER_DRAFT,
} from '../../utils/chatInputUtils';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';

/** projectService가 사용하는 베이스 URL과 동일하게 기대값에 사용 */
const API_BASE = API_BASE_URL || '';
const PROJECTS_KEY = 'corbu_projects';
const CHATS_KEY = 'corbu_chats';
const MESSAGES_KEY = 'corbu_messages';

installJestFetchMock();
const mockFetch: jest.MockedFunction<typeof fetch> = jest.mocked(global.fetch);

/** fetch 목 객체를 Response로 단언 (TypeScript strict + 부분 목) */
function partialJsonResponse(init: {
  ok?: boolean;
  status?: number;
  json: () => Promise<unknown>;
}): Response {
  return init as unknown as Response;
}

jest.mock('../../utils/errorLogger', () => ({
  errorLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('projectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(CHATS_KEY);
    localStorage.removeItem(MESSAGES_KEY);
  });

  describe('getProjects', () => {
    it('API 성공 시 프로젝트 목록 반환', async () => {
      const apiProjects = [
        {
          id: 'proj-1',
          name: '프로젝트1',
          description: '설명',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
          source_count: 3,
        },
      ];

      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, data: apiProjects }),
      }));

      const result = await projectService.getProjects();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('proj-1');
      expect(result[0].name).toBe('프로젝트1');
      expect(result[0].source_count).toBe(3);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE, API_PROJECTS_LIST_PATH),
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it('API 실패 시 로컬 스토리지 폴백', async () => {
      const localProjects = [
        {
          id: 'local-1',
          name: '로컬 프로젝트',
          description: '',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(localProjects));
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.getProjects();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('local-1');
      expect(result[0].name).toBe('로컬 프로젝트');
    });

    it('API·로컬 둘 다 실패 시 빈 배열 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.getProjects();

      expect(result).toEqual([]);
    });

    it('API가 success true지만 data가 null이면 로컬 스토리지 폴백', async () => {
      const localProjects = [
        {
          id: 'local-1',
          name: '로컬',
          description: '',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(localProjects));
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, data: null }),
      }));

      const result = await projectService.getProjects();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('local-1');
    });
  });

  describe('getProject', () => {
    it('API 성공 시 프로젝트 단건 반환', async () => {
      const apiProject = {
        id: 'proj-1',
        name: '프로젝트1',
        description: '설명',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        files: [],
        instructions: '',
        tags: ['tag1'],
        initial_guidelines: ['가이드1'],
      };

      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, data: apiProject }),
      }));

      const result = await projectService.getProject('proj-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('proj-1');
      expect(result?.name).toBe('프로젝트1');
      expect(result?.initialGuidelines).toEqual(['가이드1']);
    });

    it('API 실패 시 로컬 스토리지에서 조회', async () => {
      const localProjects = [
        {
          id: 'local-1',
          name: '로컬',
          description: '',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(localProjects));
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.getProject('local-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('local-1');
    });

    it('존재하지 않는 프로젝트 조회 시 null', async () => {
      localStorage.setItem(PROJECTS_KEY, '[]');
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.getProject('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('uploadProjectFile', () => {
    it('API 성공 시 파일 메타데이터 반환', async () => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      const uploadedAt = '2025-02-15T12:00:00.000Z';
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            file: {
              id: 'file-1',
              name: 'doc.pdf',
              type: 'document',
              size: 7,
              uploadedAt,
            },
          },
        }),
      }));

      const result = await projectService.uploadProjectFile('proj-1', file);

      expect(result).not.toBeNull();
      expect(result!.id).toBe('file-1');
      expect(result!.name).toBe('doc.pdf');
      expect(result!.type).toBe('document');
      expect(result!.size).toBe(7);
      expect(result!.uploadedAt).toEqual(new Date(uploadedAt));
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE, `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_FILES_SEGMENT}`),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('API 실패 또는 data.file 없으면 null 반환', async () => {
      const file = new File(['x'], 'a.txt', { type: 'text/plain' });
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      }));

      const result = await projectService.uploadProjectFile('proj-1', file);

      expect(result).toBeNull();
    });

    it('네트워크 오류 시 null 반환', async () => {
      const file = new File(['x'], 'a.txt', { type: 'text/plain' });
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      const result = await projectService.uploadProjectFile('proj-1', file);

      expect(result).toBeNull();
    });
  });

  describe('createProject', () => {
    it('API 성공 시 프로젝트 생성', async () => {
      const newProjectApi = {
        id: 'new-1',
        name: '새 프로젝트',
        description: '',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      mockFetch
        .mockResolvedValueOnce(partialJsonResponse({
          ok: true,
          json: async () => ({ success: true, data: { project: newProjectApi } }),
        }))
        .mockResolvedValueOnce(partialJsonResponse({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        }));

      const result = await projectService.createProject({
        name: '새 프로젝트',
        description: '',
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('new-1');
      expect(result.name).toBe('새 프로젝트');
    });

    it('API 실패 시 로컬 스토리지 폴백으로 생성', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await projectService.createProject({
        name: '로컬 생성',
        description: '',
        files: [],
        instructions: '',
        tags: [],
        isActive: true,
        type: 'conversation',
        status: 'active',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('로컬 생성');
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });
  });

  describe('updateProject', () => {
    it('API 성공 시 프로젝트 업데이트', async () => {
      const updatedApi = {
        id: 'proj-1',
        name: '수정된 이름',
        description: '수정된 설명',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-03T00:00:00.000Z',
        files: [],
        instructions: '',
        tags: ['updated'],
        isActive: true,
        type: 'conversation',
        status: 'active',
        chats: [],
      };

      // 1st: PUT /api/projects/proj-1
      // 2nd: getProjects() calls GET /api/projects
      mockFetch
        .mockResolvedValueOnce(partialJsonResponse({
          ok: true,
          json: async () => ({ success: true, data: { project: updatedApi } }),
        }))
        .mockResolvedValueOnce(partialJsonResponse({
          ok: true,
          json: async () => ({ success: true, data: [updatedApi] }),
        }));

      localStorage.setItem(PROJECTS_KEY, JSON.stringify([
        {
          id: 'proj-1',
          name: '원본',
          description: '',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]));

      const result = await projectService.updateProject('proj-1', {
        name: '수정된 이름',
        description: '수정된 설명',
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe('수정된 이름');
      expect(result?.description).toBe('수정된 설명');
    });

    it('로컬 폴백으로 업데이트', async () => {
      const localProjects = [
        {
          id: 'proj-1',
          name: '원본',
          description: '',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(localProjects));
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.updateProject('proj-1', {
        name: '로컬 수정',
        description: '수정',
      });

      expect(result).toBeDefined();
      expect(result?.name).toBe('로컬 수정');
    });
  });

  describe('deleteProject', () => {
    it('API 성공 시 프로젝트 삭제', async () => {
      // 1st: deleteProject calls GET /api/projects (via getProjects for localStorage sync) - no, deleteProject doesn't call getProjects first. It calls fetch DELETE, then on success calls getProjects to get current list.
      // 1st: DELETE /api/projects/proj-1
      // 2nd: getProjects() for localStorage update
      mockFetch
        .mockResolvedValueOnce(partialJsonResponse({
          ok: true,
          json: async () => ({ success: true }),
        }))
        .mockResolvedValueOnce(partialJsonResponse({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        }));

      localStorage.setItem(PROJECTS_KEY, JSON.stringify([
        {
          id: 'proj-1',
          name: '삭제 대상',
          description: '',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]));

      const result = await projectService.deleteProject('proj-1');

      expect(result).toBe(true);
    });

    it('로컬 폴백으로 삭제', async () => {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify([
        {
          id: 'proj-1',
          name: '삭제 대상',
          description: '',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]));
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.deleteProject('proj-1');

      expect(result).toBe(true);
    });

    it('존재하지 않는 프로젝트 삭제 시 false', async () => {
      localStorage.setItem(PROJECTS_KEY, '[]');
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.deleteProject('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getNotebookContext', () => {
    it('노트북 컨텍스트 조회', async () => {
      const ctx = {
        context: '컨텍스트 내용',
        has_context: true,
        source_count: 2,
        sources: [{ id: 's1', type: 'text', title: '소스1', enabled: true }],
      };

      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, data: ctx }),
      }));

      const result = await projectService.getNotebookContext('proj-1');

      expect(result).toBeDefined();
      expect(result?.context).toBe('컨텍스트 내용');
      expect(result?.source_count).toBe(2);
      expect(result?.sources).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE, `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_NOTEBOOK_CONTEXT_SEGMENT}`)
      );
    });

    it('실패 시 null 반환', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await projectService.getNotebookContext('proj-1');

      expect(result).toBeNull();
    });
  });

  describe('addNotebookSource', () => {
    it('노트북 소스 추가', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            source: { id: 'src-1', title: '소스', type: 'text' },
            source_count: 1,
          },
        }),
      }));

      const result = await projectService.addNotebookSource('proj-1', {
        title: '소스',
        content: '내용',
        type: 'text',
      });

      expect(result).toBeDefined();
      expect(result?.source.id).toBe('src-1');
      expect(result?.source_count).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(API_BASE, `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_NOTEBOOK_SOURCES_SEGMENT}`),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            title: '소스',
            content: '내용',
            type: 'text',
          }),
        })
      );
    });
  });

  describe('deleteNotebookSource', () => {
    it('노트북 소스 삭제', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: { source_count: 0 },
        }),
      }));

      const result = await projectService.deleteNotebookSource('proj-1', 'src-1');

      expect(result).toBeDefined();
      expect(result?.source_count).toBe(0);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(
          API_BASE,
          `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_NOTEBOOK_SOURCES_SEGMENT}/src-1`,
        ),
        { method: 'DELETE' }
      );
    });
  });

  describe('generateNotebookStudioOutput', () => {
    it('노트북 스튜디오 출력 생성', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            type: 'report',
            content: '보고서 내용',
            id: 'out-1',
            created_at: '2025-01-01T00:00:00.000Z',
          },
        }),
      }));

      const result = await projectService.generateNotebookStudioOutput(
        'proj-1',
        'report'
      );

      expect(result).toBeDefined();
      expect(result?.type).toBe('report');
      expect(result?.content).toBe('보고서 내용');
    });
  });

  describe('getNotebookStudioOutputs', () => {
    it('스튜디오 출력 목록 조회', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            outputs: [
              { id: 'o1', type: 'report', content: 'c1', created_at: '2025-01-01' },
            ],
            count: 1,
          },
        }),
      }));

      const result = await projectService.getNotebookStudioOutputs('proj-1');

      expect(result).toBeDefined();
      expect(result?.outputs).toHaveLength(1);
      expect(result?.count).toBe(1);
    });
  });

  describe('deleteNotebookStudioOutput', () => {
    it('스튜디오 출력 삭제 성공', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true }),
      }));

      const result = await projectService.deleteNotebookStudioOutput('proj-1', 'out-1');

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(
          API_BASE,
          `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_NOTEBOOK_STUDIO_OUTPUTS_SEGMENT}/out-1`,
        ),
        { method: 'DELETE' }
      );
    });

    it('스튜디오 출력 삭제 실패', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: false }),
      }));

      const result = await projectService.deleteNotebookStudioOutput('proj-1', 'out-1');

      expect(result).toBe(false);
    });
  });

  describe('getNotebookSuggestedQuestions', () => {
    it('추천 질문 목록 조회', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: { questions: ['질문1', '질문2'] },
        }),
      }));

      const result = await projectService.getNotebookSuggestedQuestions('proj-1');

      expect(result).toEqual(['질문1', '질문2']);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(
          API_BASE,
          `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_NOTEBOOK_SUGGESTED_QUESTIONS_SEGMENT}`,
        )
      );
    });

    it('빈 질문 목록 반환', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      }));

      const result = await projectService.getNotebookSuggestedQuestions('proj-1');

      expect(result).toEqual([]);
    });
  });

  describe('addNotebookSourceFromUrl', () => {
    it('URL로 노트북 소스 추가', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            source: { id: 'src-url', title: 'URL 소스', type: 'web' },
            source_count: 1,
          },
        }),
      }));

      const result = await projectService.addNotebookSourceFromUrl(
        'proj-1',
        'https://example.com/article'
      );

      expect(result).toBeDefined();
      expect(result?.source.id).toBe('src-url');
      expect(result?.source_count).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(
          API_BASE,
          `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_NOTEBOOK_SOURCES_FROM_URL_SEGMENT}`,
        ),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ url: DEMO_SIM_EXAMPLE_ARTICLE_PAGE_URL }),
        })
      );
    });
  });

  describe('addNotebookSourcesFromYoutubeSearch', () => {
    it('YouTube 검색 후 노트북 소스 추가 성공', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            added_count: 2,
            sources: [
              { id: 'src-yt-1', title: '영상1', type: 'youtube' },
              { id: 'src-yt-2', title: '영상2', type: 'youtube' },
            ],
            source_count: 2,
            first_video_added_as_voice: true,
          },
        }),
      }));

      const result = await projectService.addNotebookSourcesFromYoutubeSearch('proj-1', {
        query: '홍길동',
        maxVideos: 5,
        addFirstAsVoiceSource: true,
      });

      expect(result).toBeDefined();
      expect(result?.added_count).toBe(2);
      expect(result?.sources).toHaveLength(2);
      expect(result?.source_count).toBe(2);
      expect(result?.first_video_added_as_voice).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(
          API_BASE,
          `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_NOTEBOOK_SOURCES_FROM_YOUTUBE_SEARCH_SEGMENT}`,
        ),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            query: '홍길동',
            max_videos: 5,
            add_first_as_voice_source: true,
          }),
        })
      );
    });

    it('실패 시 에러 throw', async () => {
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: false,
        status: 400,
        json: async () => ({
          detail: { message: 'YouTube 검색 결과가 없습니다.' },
        }),
      }));

      await expect(
        projectService.addNotebookSourcesFromYoutubeSearch('proj-1', { query: 'xyz' })
      ).rejects.toThrow('YouTube 검색 결과가 없습니다.');
    });
  });

  describe('addNotebookSourceFromFile', () => {
    it('파일로 노트북 소스 추가', async () => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      mockFetch.mockResolvedValueOnce(partialJsonResponse({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            source: { id: 'src-file', title: 'doc.pdf', type: 'pdf' },
            source_count: 1,
          },
        }),
      }));

      const result = await projectService.addNotebookSourceFromFile('proj-1', file);

      expect(result).toBeDefined();
      expect(result?.source.id).toBe('src-file');
      expect(result?.source_count).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        joinApiHealthCheckUrl(
          API_BASE,
          `${API_PROJECTS_LIST_PATH}/proj-1${API_PROJECT_NOTEBOOK_SOURCES_FROM_FILE_SEGMENT}`,
        ),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });
  });
});

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(CHATS_KEY);
    localStorage.removeItem(MESSAGES_KEY);
  });

  describe('createChat', () => {
    it('대화 생성', async () => {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify([
        {
          id: 'proj-1',
          name: '프로젝트',
          description: '',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          chats: [],
        },
      ]));
      mockFetch.mockResolvedValue(partialJsonResponse({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      }));

      const result = await chatService.createChat('proj-1', '새 대화');

      expect(result).toBeDefined();
      expect(result.projectId).toBe('proj-1');
      expect(result.name).toBe('새 대화');
      expect(result.id).toBeDefined();
    });
  });

  describe('getAllChats', () => {
    it('빈 목록 반환', () => {
      const result = chatService.getAllChats();
      expect(result).toEqual([]);
    });

    it('저장된 대화 목록 반환', () => {
      const chats = [
        {
          id: 'c1',
          projectId: 'proj-1',
          name: '대화1',
          messages: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      const result = chatService.getAllChats();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('c1');
    });
  });

  describe('getChat', () => {
    it('대화 조회', () => {
      const chats = [
        {
          id: 'c1',
          projectId: 'proj-1',
          name: '대화1',
          messages: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      const result = chatService.getChat('c1');
      expect(result).toBeDefined();
      expect(result?.id).toBe('c1');
    });

    it('존재하지 않는 대화 null', () => {
      const result = chatService.getChat('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateChat', () => {
    it('대화 업데이트', () => {
      const chats = [
        {
          id: 'c1',
          projectId: 'proj-1',
          name: '원본',
          messages: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      const result = chatService.updateChat('c1', { name: '수정된 이름' });
      expect(result).toBeDefined();
      expect(result?.name).toBe('수정된 이름');
    });
  });

  describe('getProjectChats', () => {
    it('프로젝트별 대화 목록 조회', () => {
      const chats = [
        {
          id: 'c1',
          projectId: 'proj-1',
          name: '대화1',
          messages: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'c2',
          projectId: 'proj-2',
          name: '대화2',
          messages: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      const result = chatService.getProjectChats('proj-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('c1');
      expect(result[0].projectId).toBe('proj-1');
    });
  });

  describe('deleteChat', () => {
    it('대화 삭제', () => {
      const chats = [
        {
          id: 'c1',
          projectId: 'proj-1',
          name: '대화',
          messages: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      const result = chatService.deleteChat('c1');
      expect(result).toBe(true);
      const remaining = chatService.getAllChats();
      expect(remaining).toHaveLength(0);
    });
  });
});

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.removeItem(CHATS_KEY);
    localStorage.removeItem(MESSAGES_KEY);
  });

  describe('addMessage', () => {
    it('메시지 추가', () => {
      const chats = [
        {
          id: 'c1',
          projectId: 'proj-1',
          name: '대화',
          messages: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      const result = messageService.addMessage('c1', '안녕', 'user');

      expect(result).toBeDefined();
      expect(result.chatId).toBe('c1');
      expect(result.content).toBe('안녕');
      expect(result.role).toBe('user');
      expect(result.id).toBeDefined();
    });
  });

  describe('getChatMessages', () => {
    it('빈 메시지 목록', () => {
      const result = messageService.getChatMessages('c1');
      expect(result).toEqual([]);
    });

    it('메시지 목록 반환', () => {
      const messages = [
        {
          id: 'm1',
          chatId: 'c1',
          content: '메시지',
          role: 'user' as const,
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

      const result = messageService.getChatMessages('c1');
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('메시지');
    });

    it('저장된 어시스턴트 생성 단계 문구는 조회 시 안내 문구로 치환된다', () => {
      const messages = [
        {
          id: 'm1',
          chatId: 'c1',
          content: ASSISTANT_PLACEHOLDER_DRAFT,
          role: 'assistant' as const,
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

      const result = messageService.getChatMessages('c1');
      expect(result).toHaveLength(1);
      expect(result[0].content).toBe(STORED_ASSISTANT_INCOMPLETE_NOTICE);
    });
  });

  describe('deleteMessage', () => {
    it('메시지 삭제', () => {
      const messages = [
        {
          id: 'm1',
          chatId: 'c1',
          content: '메시지',
          role: 'user' as const,
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

      const result = messageService.deleteMessage('m1');
      expect(result).toBe(true);
      const remaining = messageService.getChatMessages('c1');
      expect(remaining).toHaveLength(0);
    });
  });
});

describe('systemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(CHATS_KEY);
    localStorage.removeItem(MESSAGES_KEY);
  });

  describe('getSystemStats', () => {
    it('전체 시스템 통계 반환', async () => {
      const projects = [
        {
          id: 'p1',
          name: '프로젝트1',
          status: 'active',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      mockFetch.mockRejectedValue(new Error('Network'));

      const result = await systemService.getSystemStats();

      expect(result).toBeDefined();
      expect(result.totalProjects).toBe(1);
      expect(result.totalChats).toBe(0);
      expect(result.totalMessages).toBe(0);
      expect(result.activeProjects).toBe(1);
    });
  });

  describe('searchProjects', () => {
    it('검색어로 프로젝트 필터링', async () => {
      const projects = [
        {
          id: 'p1',
          name: 'AI 프로젝트',
          description: 'AI 설명',
          status: 'active',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'p2',
          name: '웹 프로젝트',
          description: '웹 설명',
          status: 'active',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      mockFetch.mockRejectedValue(new Error('Network'));

      const result = await systemService.searchProjects('AI');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('AI 프로젝트');
    });

    it('상태 필터로 프로젝트 필터링', async () => {
      const projects = [
        {
          id: 'p1',
          name: '프로젝트1',
          description: '',
          status: 'active',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'p2',
          name: '프로젝트2',
          description: '',
          status: 'archived',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      mockFetch.mockRejectedValue(new Error('Network'));

      const result = await systemService.searchProjects('', { status: 'archived' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('archived');
    });

    it('이름순 정렬', async () => {
      const projects = [
        {
          id: 'p1',
          name: '가나다',
          description: '',
          status: 'active',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'p2',
          name: '가가가',
          description: '',
          status: 'active',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      mockFetch.mockRejectedValue(new Error('Network'));

      const result = await systemService.searchProjects('', {
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('가가가');
    });
  });

  describe('exportSystemData', () => {
    it('시스템 데이터 내보내기', async () => {
      const mockClick = jest.fn();
      document.createElement = jest.fn(() =>
        ({ href: '', download: '', click: mockClick }) as unknown as HTMLAnchorElement
      );
      URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      URL.revokeObjectURL = jest.fn();

      localStorage.setItem(PROJECTS_KEY, '[]');
      mockFetch.mockRejectedValue(new Error('Network'));

      systemService.exportSystemData();

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});

describe('getProjectStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(CHATS_KEY);
    localStorage.removeItem(MESSAGES_KEY);
  });

  it('프로젝트 통계 반환', async () => {
    const project = {
      id: 'proj-1',
      name: '프로젝트',
      description: '',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    const chats = [
      {
        id: 'c1',
        projectId: 'proj-1',
        name: '대화1',
        messages: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem(PROJECTS_KEY, JSON.stringify([project]));
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    mockFetch.mockRejectedValue(new Error('Network'));

    const result = await getProjectStats('proj-1');

    expect(result).toBeDefined();
    expect(result?.totalChats).toBe(1);
    expect(result?.totalMessages).toBe(0);
    expect(result?.topKeywords).toEqual([]);
  });

  it('존재하지 않는 프로젝트 null 반환', async () => {
    mockFetch.mockRejectedValue(new Error('Network'));

    const result = await getProjectStats('nonexistent');

    expect(result).toBeNull();
  });
});
