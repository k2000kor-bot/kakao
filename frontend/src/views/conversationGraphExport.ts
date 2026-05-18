function serializeSvg(svgEl: SVGSVGElement): string {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  return new XMLSerializer().serializeToString(clone);
}

function readSvgDimensions(svgEl: SVGSVGElement): { width: number; height: number } {
  const w = svgEl.width?.baseVal?.value || Number(svgEl.getAttribute('width')) || 800;
  const h = svgEl.height?.baseVal?.value || Number(svgEl.getAttribute('height')) || 500;
  return { width: w, height: h };
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** 관계도 SVG를 파일로 저장한다. */
export function downloadConversationGraphSvg(
  svgEl: SVGSVGElement,
  filename = 'conversation-graph.svg',
): void {
  const source = serializeSvg(svgEl);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  triggerBlobDownload(blob, filename);
}

/** 관계도 SVG를 캔버스에 그려 PNG로 저장한다. */
export function downloadConversationGraphPng(
  svgEl: SVGSVGElement,
  filename = 'conversation-graph.png',
): Promise<void> {
  const { width, height } = readSvgDimensions(svgEl);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializeSvg(svgEl))}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas context unavailable'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('png encode failed'));
            return;
          }
          triggerBlobDownload(blob, filename);
          resolve();
        }, 'image/png');
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('svg rasterize failed'));
    img.src = dataUrl;
  });
}
