/**
 * learnViewService 테스트
 */
import { fetchLearnSummary } from '../learnViewService';
import { installJestFetchMock, restoreGlobalFetch } from '../../test-utils/installJestFetchMock';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  installJestFetchMock();
});

afterEach(() => {
  restoreGlobalFetch(originalFetch);
  jest.clearAllMocks();
});

describe('learnViewService', () => {
  it('성공 시 LearnSummary 반환', async () => {
    const mock = { progressPercent: 75, completedCourses: 3 };
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mock }),
    });
    const result = await fetchLearnSummary();
    expect(result).toMatchObject(mock);
    expect(result.courses.length).toBeGreaterThan(0);
  });

  it('실패 시 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false }),
    });
    const result = await fetchLearnSummary();
    expect(result).toMatchObject({ progressPercent: 0, completedCourses: 0 });
    expect(result.tutorials.length).toBeGreaterThan(0);
  });

  it('네트워크 에러 시 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchLearnSummary();
    expect(result.courses[0].title).toBeTruthy();
  });

  it('success가 true이지만 data가 없으면 목데이터 반환', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true }),
    });
    const result = await fetchLearnSummary();
    expect(result).toMatchObject({ progressPercent: 0, completedCourses: 0 });
    expect(result.courses.length).toBeGreaterThan(0);
  });
});
