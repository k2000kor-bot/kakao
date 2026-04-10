/**
 * communityViewService 테스트
 */
import { fetchCommunitySummary } from '../communityViewService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('communityViewService', () => {
  it('성공 시 CommunitySummary 반환', async () => {
    const mock = { topicCount: 5, recentPostLabel: '최근 글' };
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mock }),
    });
    const result = await fetchCommunitySummary();
    expect(result).toMatchObject(mock);
    expect(result.threads.length).toBeGreaterThan(0);
  });

  it('실패 시 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false }),
    });
    const result = await fetchCommunitySummary();
    expect(result).toMatchObject({ topicCount: 0, recentPostLabel: '—' });
    expect(result.threads.length).toBeGreaterThanOrEqual(3);
  });

  it('네트워크 에러 시 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchCommunitySummary();
    expect(result.topicLabels.length).toBeGreaterThan(0);
  });

  it('success가 true이지만 data가 없으면 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });
    const result = await fetchCommunitySummary();
    expect(result).toMatchObject({ topicCount: 0, recentPostLabel: '—' });
    expect(result.threads.length).toBeGreaterThan(0);
  });
});
