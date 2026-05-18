/**
 * conversationGraphService — 업로드·목록·관계도 API 호출 계약
 * @jest-environment jsdom
 */
import {
  API_CONVERSATIONS_LIST_PATH,
  API_CONVERSATIONS_RELATIONSHIP_GRAPH_SEGMENT,
  API_CONVERSATIONS_UPLOAD_PATH,
  API_FORM_FIELD_FILE,
  API_FORM_FIELD_NAME,
  API_JSON_FIELD_FILENAME,
  API_JSON_FIELD_TEXT,
  API_QUERY_PARAM_ANALYSIS_MODE,
  FALLBACK_API_ORIGIN,
} from '../../config/api';
import { installJestFetchMock } from '../../test-utils/installJestFetchMock';
import {
  fetchRelationshipGraph,
  listConversations,
  uploadConversation,
  uploadConversationText,
} from '../conversationGraphService';

installJestFetchMock();
const mockFetch = jest.mocked(global.fetch);

function jsonResponse(data: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  } as Response;
}

describe('conversationGraphService', () => {
  const expectedOrigin = FALLBACK_API_ORIGIN.replace(/\/$/, '');

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('uploadConversation는 multipart로 업로드 URL에 POST한다', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          upload_id: 'u1',
          name: 'n',
          filename: 'f.txt',
          uploaded_at: 't',
          message_count: 1,
        },
      }),
    );
    const file = new File(['hello'], 'chat.txt', { type: 'text/plain' });
    const out = await uploadConversation(file, '표시 이름');
    expect(out.upload_id).toBe('u1');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${expectedOrigin}${API_CONVERSATIONS_UPLOAD_PATH}`);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBeInstanceOf(FormData);
    const fd = init?.body as FormData;
    expect(fd.get(API_FORM_FIELD_FILE)).toBe(file);
    expect(fd.get(API_FORM_FIELD_NAME)).toBe('표시 이름');
  });

  it('uploadConversationText는 JSON 본문으로 POST한다', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: {
          upload_id: 'u2',
          name: '붙여넣은 대화',
          filename: 'pasted.txt',
          uploaded_at: 't',
          message_count: 2,
        },
      }),
    );
    await uploadConversationText('line1', '이름', 'custom.txt');
    const [, init] = mockFetch.mock.calls[0];
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    const body = JSON.parse((init?.body as string) ?? '{}');
    expect(body[API_JSON_FIELD_TEXT]).toBe('line1');
    expect(body[API_FORM_FIELD_NAME]).toBe('이름');
    expect(body[API_JSON_FIELD_FILENAME]).toBe('custom.txt');
  });

  it('uploadConversation은 success가 아니면 에러를 던진다', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: false, error: 'bad' }));
    await expect(uploadConversation(new File(['x'], 'a.txt'))).rejects.toThrow('bad');
  });

  it('listConversations는 목록 경로에 GET한다', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true, data: [{ id: '1', name: 'a', filename: 'f', uploaded_at: 't', message_count: 0 }] }));
    const list = await listConversations();
    expect(list).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(`${expectedOrigin}${API_CONVERSATIONS_LIST_PATH}`, { method: 'GET' });
  });

  it('listConversations는 data가 없으면 빈 배열을 반환한다', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }));
    await expect(listConversations()).resolves.toEqual([]);
  });

  it('fetchRelationshipGraph는 upload id를 인코딩하고 기간 쿼리를 붙인다', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { upload_id: 'x', nodes: [], edges: [] },
      }),
    );
    const id = '업로드/id';
    await fetchRelationshipGraph(id, '2026-01-01', '2026-01-31');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain(`${API_CONVERSATIONS_LIST_PATH}/${encodeURIComponent(id)}${API_CONVERSATIONS_RELATIONSHIP_GRAPH_SEGMENT}`);
    expect(url).toContain('start_date=2026-01-01');
    expect(url).toContain('end_date=2026-01-31');
  });

  it('fetchRelationshipGraph는 ai_enhanced 모드 쿼리를 붙인다', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        data: { upload_id: 'x', nodes: [], edges: [] },
      }),
    );
    await fetchRelationshipGraph('u1', { analysisMode: 'ai_enhanced' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain(`${API_QUERY_PARAM_ANALYSIS_MODE}=ai_enhanced`);
  });

  it('fetchRelationshipGraph는 data가 없으면 에러를 던진다', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: true }));
    await expect(fetchRelationshipGraph('u')).rejects.toThrow('관계도 조회 실패');
  });
});
