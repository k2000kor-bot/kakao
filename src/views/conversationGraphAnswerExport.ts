/** 생성된 관계도 답변을 클립보드에 복사한다. */
export async function copyGraphAnswerToClipboard(text: string): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(trimmed);
      return true;
    }
  } catch {
    /* fallback */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = trimmed;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function downloadBlobText(text: string, filename: string, mime: string): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const blob = new Blob([trimmed], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* jsdom 등 */
  }
}

/** 생성된 답변을 텍스트 파일로 저장한다. */
export function downloadGraphAnswerText(text: string, filename = 'conversation-graph-answer.txt'): void {
  downloadBlobText(text, filename, 'text/plain;charset=utf-8');
}

/** 생성된 답변을 Markdown 파일로 저장한다. */
export function downloadGraphAnswerMarkdown(
  text: string,
  meta?: { title?: string; period?: string },
  filename = 'conversation-graph-answer.md',
): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  const title = meta?.title?.trim() || '대화 관계도 분석 답변';
  const period = meta?.period?.trim();
  const header = [
    `# ${title}`,
    period ? `> 기간: ${period}` : '',
    '',
    '---',
    '',
  ]
    .filter((line, i, arr) => line !== '' || i < arr.length - 1)
    .join('\n');
  downloadBlobText(`${header}${trimmed}\n`, filename, 'text/markdown;charset=utf-8');
}
