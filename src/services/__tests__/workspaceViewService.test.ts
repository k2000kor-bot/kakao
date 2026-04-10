/**
 * workspaceViewService 테스트
 */
import { fetchWorkspaceSummary } from '../workspaceViewService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('workspaceViewService', () => {
  it('성공 시 WorkspaceSummary 반환', async () => {
    const mock = {
      workspaceCount: 2,
      currentName: 'My Workspace',
      workspaces: [
        { id: 'a', name: 'My Workspace', isCurrent: true, members: 2 },
        { id: 'b', name: 'Other', isCurrent: false, members: 1 },
      ],
    };
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mock }),
    });
    const result = await fetchWorkspaceSummary();
    expect(result).toMatchObject({ currentName: 'My Workspace' });
    expect(result.workspaces).toHaveLength(2);
    expect(result.workspaceCount).toBe(2);
  });

  it('실패 시 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false }),
    });
    const result = await fetchWorkspaceSummary();
    expect(result).toMatchObject({ workspaceCount: 2, currentName: '기본' });
    expect(result.workspaces).toHaveLength(2);
  });

  it('네트워크 에러 시 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchWorkspaceSummary();
    expect(result.workspaceCount).toBe(2);
    expect(result.workspaces[0].name).toBe('기본');
  });

  it('success가 true이지만 data가 없으면 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });
    const result = await fetchWorkspaceSummary();
    expect(result.workspaces.length).toBeGreaterThan(0);
  });
});
