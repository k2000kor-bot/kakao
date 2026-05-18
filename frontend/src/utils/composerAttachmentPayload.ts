/** 컴포저 일반 첨부 → 전송용 본문·대화 파일·이미지 분리 */
export const COMPOSER_ATTACH_MAX_BYTES = 5 * 1024 * 1024;
export const COMPOSER_ATTACH_TEXT_SNIP_MAX = 20_000;

const TEXT_NAME_RE = /\.(txt|md|csv|json|log)$/i;
const PDF_NAME_RE = /\.pdf$/i;

/** PDF 바이너리에서 가독 텍스트 스니펫 추출(경량·완전하지 않음) */
export function extractNaivePdfTextFromArrayBuffer(
  buffer: ArrayBuffer,
  maxLen = COMPOSER_ATTACH_TEXT_SNIP_MAX,
): string {
  const bytes = new Uint8Array(buffer);
  const capped = bytes.length > 800_000 ? bytes.subarray(0, 800_000) : bytes;
  const parts: string[] = [];
  const latinChunks: string[] = [];
  let run = '';
  for (let i = 0; i < capped.length; i++) {
    const c = capped[i];
    if ((c >= 32 && c <= 126) || c === 10 || c === 13) {
      run += String.fromCharCode(c);
    } else if (run.length >= 4) {
      latinChunks.push(run);
      run = '';
    } else {
      run = '';
    }
  }
  if (run.length >= 4) latinChunks.push(run);
  const latin = latinChunks.join(' ');
  const parenRe = /\(([^()\\]{3,240})\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = parenRe.exec(latin)) !== null) {
    const decoded = m[1].replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\\(/g, '(').replace(/\\\)/g, ')');
    if (decoded.trim()) parts.push(decoded.trim());
  }
  const merged = (parts.length ? parts.join('\n') : latin).replace(/\s{2,}/g, ' ').trim();
  return merged.slice(0, maxLen);
}

export type ComposerAttachmentReadResult = {
  contextBlocks: string[];
  conversationFileContent?: string;
  conversationFileName?: string;
  imageFiles: File[];
  unsupportedNames: string[];
};

export async function readComposerAttachmentsForSend(files: File[]): Promise<ComposerAttachmentReadResult> {
  const contextBlocks: string[] = [];
  let conversationFileContent: string | undefined;
  let conversationFileName: string | undefined;
  const imageFiles: File[] = [];
  const unsupportedNames: string[] = [];

  for (const file of files) {
    const name = file.name || 'file';
    if (file.size > COMPOSER_ATTACH_MAX_BYTES) {
      unsupportedNames.push(name);
      continue;
    }
    if (file.type.startsWith('image/')) {
      imageFiles.push(file);
      continue;
    }
    if (PDF_NAME_RE.test(name) || file.type === 'application/pdf') {
      try {
        const text = extractNaivePdfTextFromArrayBuffer(await file.arrayBuffer());
        if (text.trim().length > 40) {
          contextBlocks.push(`[첨부 PDF: ${name}]\n${text}`);
          continue;
        }
      } catch {
        /* fall through to unsupported */
      }
      unsupportedNames.push(name);
      continue;
    }
    if (TEXT_NAME_RE.test(name) || file.type.startsWith('text/') || file.type === 'application/json') {
      try {
        const text = (await file.text()).slice(0, COMPOSER_ATTACH_TEXT_SNIP_MAX);
        if (!text.trim()) {
          unsupportedNames.push(name);
          continue;
        }
        contextBlocks.push(`[첨부 파일: ${name}]\n${text}`);
        if (!conversationFileContent && /\.(txt|csv)$/i.test(name)) {
          conversationFileContent = text;
          conversationFileName = name;
        }
      } catch {
        unsupportedNames.push(name);
      }
      continue;
    }
    unsupportedNames.push(name);
  }

  return { contextBlocks, conversationFileContent, conversationFileName, imageFiles, unsupportedNames };
}
