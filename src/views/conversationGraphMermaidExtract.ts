export function downloadMermaidSource(source: string, filename = 'conversation-graph.mmd'): void {
  const blob = new Blob([source], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 생성 답변 본문에서 ```mermaid 블록을 분리 */
export function extractMermaidBlocksFromAnswer(text: string): { body: string; diagrams: string[] } {
  const diagrams: string[] = [];
  const body = text.replace(/```mermaid\s*([\s\S]*?)```/gi, (_match, src: string) => {
    const trimmed = src.trim();
    if (trimmed) diagrams.push(trimmed);
    return '\n';
  });
  return { body: body.replace(/\n{3,}/g, '\n\n').trim(), diagrams };
}
