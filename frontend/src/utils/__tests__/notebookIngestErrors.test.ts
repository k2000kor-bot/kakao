import { extractNotebookIngestErrorMessage } from '../notebookIngestErrors';

describe('extractNotebookIngestErrorMessage', () => {
  it('빈 응답이면 HTTP 상태 기반 기본 문구', () => {
    expect(extractNotebookIngestErrorMessage(null, 422)).toBe('요청이 거절되었습니다. (422)');
    expect(extractNotebookIngestErrorMessage(undefined, 200)).toBe('소스 추가에 실패했습니다.');
  });

  it('FastAPI detail 문자열', () => {
    expect(extractNotebookIngestErrorMessage({ detail: '  자막 없음  ' }, 400)).toBe('자막 없음');
  });

  it('detail 객체의 message', () => {
    expect(
      extractNotebookIngestErrorMessage({ detail: { message: 'quota exceeded' } }, 503),
    ).toBe('quota exceeded');
  });

  it('detail 객체의 error', () => {
    expect(extractNotebookIngestErrorMessage({ detail: { error: 'bad request' } }, 400)).toBe(
      'bad request',
    );
  });

  it('최상위 message·error', () => {
    expect(extractNotebookIngestErrorMessage({ message: 'not found' }, 404)).toBe('not found');
    expect(extractNotebookIngestErrorMessage({ error: 'denied' }, 403)).toBe('denied');
  });
});
