/**
 * global.fetch = jest.fn() → installJestFetchMock() 일괄 치환 (+ import 삽입).
 * 대상: *.test.ts(x), *.spec.ts(x) 만 (일반 소스 트리는 건너뜀).
 * 옵션: -h, --help | --dry-run, -n (디스크에 쓰지 않고 변경 예정 파일만 출력)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_OR_SPEC_TSX_RE } from './lib/testFilePatterns.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`apply-installJestFetchMock — global.fetch = jest.fn() 를 installJestFetchMock() 로 치환하고, 필요 시 import 한 줄을 추가합니다.
대상 파일: *.test.ts(x), *.spec.ts(x) 만 순회합니다.

사용:
  node scripts/apply-installJestFetchMock.mjs [srcRoot ...]

예:
  (저장소 루트)  node frontend/scripts/apply-installJestFetchMock.mjs src frontend/src
  (frontend/)    node scripts/apply-installJestFetchMock.mjs src ../src

인자 없음: 이 스크립트가 있는 패키지의 src/ 만 처리합니다.
같은 realpath 루트는 한 번만 순회합니다.

  --dry-run, -n   파일을 수정하지 않고 변경될 경로만 출력합니다.`);
  process.exit(0);
}

const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-n');

const defaultRoot = path.join(__dirname, '..', 'src');
const argRoots = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const resolvedRoots =
  argRoots.length > 0 ? argRoots.map((r) => path.resolve(cwd, r)) : [defaultRoot];

function dedupeRootsByRealpath(resolved) {
  const byReal = new Map();
  for (const r of resolved) {
    if (!fs.existsSync(r)) {
      console.warn(`apply-installJestFetchMock: skip (경로 없음) ${path.relative(cwd, r) || r}`);
      continue;
    }
    let real;
    try {
      real = fs.realpathSync(r);
    } catch {
      continue;
    }
    if (!byReal.has(real)) byReal.set(real, r);
  }
  return [...byReal.values()];
}

const srcRoots = dedupeRootsByRealpath(resolvedRoots);

if (srcRoots.length === 0) {
  console.error('apply-installJestFetchMock: 유효한 src 루트가 없습니다.');
  process.exit(1);
}

function walkTsFiles(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (
      e.name === 'node_modules' ||
      e.name === 'build' ||
      e.name === '.git' ||
      e.name.endsWith('.jdk')
    ) {
      continue;
    }
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkTsFiles(p, out);
    else if (TEST_OR_SPEC_TSX_RE.test(e.name)) out.push(p);
  }
  return out;
}

const SKIP_FILES = new Set([
  'quantumAISystemAPI.test.ts',
  'ultimateResponseService.test.ts',
  'ultimateMessageAPI.test.ts',
  'ultimateMediaKnowledgeService.test.ts',
]);

function relImportPath(fromFile, srcRoot) {
  const toFile = path.join(srcRoot, 'test-utils', 'installJestFetchMock.ts');
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  rel = rel.replace(/\.tsx?$/, '');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

/**
 * 파일 상단 연속 import 구간이 끝난 직후에 한 줄 삽입.
 * 멀티라인 import(...) 의 `} from '...'` 닫힌 뒤에만 넣어, `import foo, {` 와 첫 멤버 사이에 끼는 오류를 방지.
 */
function addImportAfterImports(content, importLine) {
  const lines = content.split('\n');
  let lastImportEnd = -1;
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();

    if (!/^import\s/.test(raw)) {
      if (lastImportEnd >= 0 && t !== '' && !t.startsWith('//')) break;
      i += 1;
      continue;
    }

    if (/\bfrom\s+['"]/.test(t)) {
      lastImportEnd = i;
      i += 1;
      continue;
    }

    let j = i;
    let closedAt = -1;
    while (j < lines.length) {
      const u = lines[j].trim();
      if (/^\}\s*from\s+['"][^'"]*['"]\s*;?\s*$/.test(u)) {
        closedAt = j;
        break;
      }
      j += 1;
    }
    if (closedAt < 0) {
      i += 1;
      continue;
    }
    lastImportEnd = closedAt;
    i = closedAt + 1;
  }

  if (lastImportEnd < 0) return `${importLine}\n${content}`;
  lines.splice(lastImportEnd + 1, 0, importLine);
  return lines.join('\n');
}

const FETCH_ASSIGN =
  /global\.fetch = jest\.fn\(\);|  global\.fetch = jest\.fn\(\);|    global\.fetch = jest\.fn\(\);/;

const candidates = [];
for (const srcRoot of srcRoots) {
  for (const f of walkTsFiles(srcRoot)) {
    const s = fs.readFileSync(f, 'utf8');
    if (FETCH_ASSIGN.test(s)) candidates.push({ file: f, srcRoot });
  }
}

let changed = 0;
for (const { file, srcRoot } of candidates) {
  const base = path.basename(file);
  if (SKIP_FILES.has(base)) continue;

  let s = fs.readFileSync(file, 'utf8');
  const orig = s;

  s = s.replace(/^global\.fetch = jest\.fn\(\);$/gm, 'installJestFetchMock();');
  s = s.replace(/^  global\.fetch = jest\.fn\(\);$/gm, '  installJestFetchMock();');
  s = s.replace(/^    global\.fetch = jest\.fn\(\);$/gm, '    installJestFetchMock();');

  if (s === orig) continue;

  if (!/from ['"][^'"]*installJestFetchMock['"]/.test(s)) {
    const rel = relImportPath(file, srcRoot);
    s = addImportAfterImports(s, `import { installJestFetchMock } from '${rel}';`);
  }

  changed++;
  const relPath = path.relative(cwd, file);
  if (dryRun) {
    console.log('would update', relPath);
  } else {
    fs.writeFileSync(file, s);
    console.log('updated', relPath);
  }
}

if (dryRun) {
  console.log(`dry-run 완료, 변경 예정 ${changed}개 파일 (디스크 미수정)`);
} else {
  console.log('done, files changed:', changed);
}
