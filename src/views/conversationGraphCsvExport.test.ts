import { buildConversationGraphCsv, downloadConversationGraphCsv } from './conversationGraphCsvExport';

describe('conversationGraphCsvExport', () => {
  it('buildConversationGraphCsv는 참여자·연결 섹션을 포함한다', () => {
    const csv = buildConversationGraphCsv({
      upload_id: 'g1',
      nodes: [
        {
          id: 'p1',
          label: '알파',
          message_count: 2,
          dominant_stance: '동조',
          stance_동조: 1,
        },
      ],
      edges: [{ source: 'p1', target: 'p2', weight: 3, edge_type: '동조', weight_동조: 2 }],
    });
    expect(csv).toContain('[참여자]');
    expect(csv).toContain('알파');
    expect(csv).toContain('[연결]');
    expect(csv).toContain('p1,p2');
  });

  it('downloadConversationGraphCsv는 BOM CSV를 다운로드한다', () => {
    const click = jest.fn();
    const anchor = document.createElement('a');
    anchor.click = click;
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return anchor;
      return document.createElement(tag);
    });
    const origCreate = URL.createObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:csv');
    URL.revokeObjectURL = jest.fn();

    downloadConversationGraphCsv(
      {
        upload_id: 'g1',
        nodes: [{ id: 'p1', label: 'A', message_count: 1 }],
        edges: [],
      },
      'graph.csv',
    );

    expect(anchor.download).toBe('graph.csv');
    expect(click).toHaveBeenCalled();

    URL.createObjectURL = origCreate;
  });
});
