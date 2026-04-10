/**
 * teamViewService 테스트
 */
import { fetchTeamSummary } from '../teamViewService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('teamViewService', () => {
  it('성공 시 TeamSummary 반환', async () => {
    const mock = {
      memberCount: 2,
      role: '멤버',
      members: [
        { id: '1', name: 'a', email: 'a@x.com', role: '멤버', status: '활성' as const },
        { id: '2', name: 'b', email: 'b@x.com', role: '멤버', status: '활성' as const },
      ],
    };
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mock }),
    });
    const result = await fetchTeamSummary();
    expect(result).toMatchObject({ role: '멤버' });
    expect(result.members).toHaveLength(2);
    expect(result.memberCount).toBe(2);
  });

  it('실패 시 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false }),
    });
    const result = await fetchTeamSummary();
    expect(result).toMatchObject({ role: '관리자' });
    expect(result.members).toHaveLength(3);
    expect(result.memberCount).toBe(3);
  });

  it('네트워크 에러 시 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchTeamSummary();
    expect(result.members[0].role).toBe('관리자');
    expect(result.memberCount).toBeGreaterThan(0);
  });

  it('success가 true이지만 data가 없으면 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });
    const result = await fetchTeamSummary();
    expect(result.memberCount).toBe(3);
    expect(result.members.length).toBeGreaterThan(0);
  });
});
