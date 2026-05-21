import type { KakaoTalkMessage } from './kakaoTalkMessage';

/** UTF-8 BOM 제거 */
export function stripUtf8Bom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** RFC 4180 스타일 CSV(따옴표·멀티라인 필드)를 행 단위로 파싱한다. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = '';
  };

  const pushRow = () => {
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      rows.push(row);
    }
    row = [];
  };

  const input = stripUtf8Bom(text);
  for (let i = 0; i < input.length; i += 1) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      pushField();
    } else if (c === '\n') {
      pushField();
      pushRow();
    } else if (c === '\r') {
      if (input[i + 1] === '\n') {
        i += 1;
      }
      pushField();
      pushRow();
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    pushField();
    pushRow();
  }
  return rows;
}

function normalizeHeaderCell(cell: string): string {
  return cell.trim().toLowerCase();
}

/** 카카오톡 PC보내기 CSV 헤더(Date,User,Message) 여부 */
export function isKakaoTalkCsvHeader(cells: string[]): boolean {
  if (cells.length < 3) return false;
  const h = cells.map(normalizeHeaderCell);
  return h[0] === 'date' && h[1] === 'user' && h[2] === 'message';
}

function parseKakaoTalkCsvRows(rows: string[][]): KakaoTalkMessage[] {
  if (rows.length < 2) return [];
  const header = rows[0];
  if (!isKakaoTalkCsvHeader(header)) {
    throw new Error('카카오톡 CSV 형식이 아닙니다. 헤더는 Date,User,Message 여야 합니다.');
  }
  const messages: KakaoTalkMessage[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i];
    if (cells.length < 3) continue;
    const date = cells[0]?.trim() ?? '';
    const user = cells[1]?.trim() ?? '';
    const message = cells.slice(2).join(',').trim();
    if (!date && !user && !message) continue;
    if (!date || !user) continue;
    messages.push({ date, user, message });
  }
  return messages;
}

/** 카카오톡보내기 CSV 전체 텍스트를 메시지 배열로 변환한다. */
export function parseKakaoTalkCsv(text: string): KakaoTalkMessage[] {
  const rows = parseCsvRows(text);
  return parseKakaoTalkCsvRows(rows);
}

/** 텍스트가 카카오톡 CSV인지(헤더만) 빠르게 판별한다. */
export function looksLikeKakaoTalkCsv(text: string): boolean {
  const sample = stripUtf8Bom(text).slice(0, 4096);
  const firstLineEnd = sample.indexOf('\n');
  const firstLine = (firstLineEnd >= 0 ? sample.slice(0, firstLineEnd) : sample).replace(/\r$/, '');
  const headerCells = firstLine.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
  return isKakaoTalkCsvHeader(headerCells);
}
