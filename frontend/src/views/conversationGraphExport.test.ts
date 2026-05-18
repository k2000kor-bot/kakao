import { downloadConversationGraphPng, downloadConversationGraphSvg } from './conversationGraphExport';

describe('conversationGraphExport', () => {
  it('downloadConversationGraphSvg는 SVG를 직렬화해 다운로드 링크를 클릭한다', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '10');
    svg.appendChild(circle);

    const click = jest.fn();
    const anchor = document.createElement('a');
    anchor.click = click;
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return anchor;
      return document.createElement(tag);
    });
    const createObjectURL = jest.fn(() => 'blob:test');
    const revokeObjectURL = jest.fn();
    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    downloadConversationGraphSvg(svg as SVGSVGElement, 'test-graph.svg');

    expect(anchor.download).toBe('test-graph.svg');
    expect(click).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');

    createElementSpy.mockRestore();
    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
  });

  it('downloadConversationGraphPng는 캔버스를 통해 PNG를 저장한다', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '50');

    const click = jest.fn();
    const anchor = document.createElement('a');
    anchor.click = click;
    const origCreateElement = document.createElement.bind(document);
    const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return anchor;
      if (tag === 'canvas') {
        const canvas = origCreateElement('canvas');
        canvas.toBlob = (cb: BlobCallback) => {
          cb(new Blob(['x'], { type: 'image/png' }));
        };
        return canvas;
      }
      return origCreateElement(tag);
    });

    const origCreate = URL.createObjectURL;
    const origRevoke = URL.revokeObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:test');
    URL.revokeObjectURL = jest.fn();

    const OrigImage = global.Image;
    class ImageMock {
      onload: (() => void) | null = null;
      set src(_v: string) {
        this.onload?.();
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).Image = ImageMock;

    await downloadConversationGraphPng(svg as SVGSVGElement, 'graph.png');

    expect(anchor.download).toBe('graph.png');
    expect(click).toHaveBeenCalled();

    createElementSpy.mockRestore();
    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
    global.Image = OrigImage;
  });
});
