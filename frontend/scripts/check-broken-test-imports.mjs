/**
 * installJestFetchMock 배치 삽입 오류로 생기는 패턴 검출 (멀티라인 import 블록 안에 import 끼어듦).
 * 스캔: *.test.ts(x), *.spec.ts(x)
 * 감지: default/type `import …, {` 다음 줄, `import type {` 다음 줄, 단독 `import {` 다음 줄,
 *       `import …,` 로 줄이 끝난 다음 줄에 mock import, 멤버 목록 콤마 다음 줄에 mock import(단 `),` 형태는 제외) 등.
 * exit 1 이면 해당 파일을 수동으로 고친 뒤 다시 실행하세요.
 *
 * 사용:
 *   (frontend 디렉터리에서) node scripts/check-broken-test-imports.mjs src ../src
 *   (저장소 루트에서) node frontend/scripts/check-broken-test-imports.mjs src frontend/src
 *
 * 동일 디렉터리를 가리키는 경로(심볼릭 링크 등)는 realpath 기준으로 한 번만 순회합니다.
 *
 * 옵션: -h, --help
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_OR_SPEC_TSX_RE } from './lib/testFilePatterns.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`check-broken-test-imports — installJestFetchMock 잘못된 삽입 패턴 검사
파일: *.test.ts(x), *.spec.ts(x) 만 스캔합니다.

사용:
  node scripts/check-broken-test-imports.mjs [srcRoot ...]

예:
  (저장소 루트)  node frontend/scripts/check-broken-test-imports.mjs src frontend/src
  (frontend/)    node scripts/check-broken-test-imports.mjs src ../src

인자 없음: 기본으로 이 패키지의 src/ 만 검사합니다.`);
  process.exit(0);
}

const argRoots = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const defaultRoot = path.join(__dirname, '..', 'src');
const roots =
  argRoots.length > 0 ? argRoots.map((r) => path.resolve(cwd, r)) : [defaultRoot];

/** 존재하는 경로만 남기고, realpath가 같으면 첫 경로 하나만 유지 */
function dedupeRootsByRealpath(resolvedRoots) {
  const byReal = new Map();
  for (const r of resolvedRoots) {
    if (!fs.existsSync(r)) {
      console.warn(
        `check-broken-test-imports: skip (경로 없음) ${path.relative(cwd, r) || r}`,
      );
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

const uniqueRoots = dedupeRootsByRealpath(roots);

if (uniqueRoots.length === 0) {
  console.error(
    'check-broken-test-imports: 존재하는 src 루트가 없습니다. 경로 인자 또는 기본 frontend/src 를 확인하세요.',
  );
  process.exit(1);
}

const PATTERNS = [
  {
    name: 'default/type import { 다음 줄에 installJestFetchMock',
    re: /import\s+[\w$][^;{]*,\s*\{\s*\r?\n\s*import\s+\{\s*installJestFetchMock/s,
  },
  {
    name: 'import type { 다음 줄에 installJestFetchMock',
    re: /import\s+type\s*\{\s*\r?\n\s*import\s+\{\s*installJestFetchMock/s,
  },
  {
    name: 'import { 블록 시작 직후 줄에 installJestFetchMock import 끼어듦',
    re: /import\s*\{\s*\r?\n\s*import\s+\{\s*installJestFetchMock/s,
  },
  {
    name: 'import … 콤마로 줄 끝난 다음 줄에 installJestFetchMock import 끼어듦',
    re: /import\s+[\w$][^;{]*,\s*$\r?\n\s*import\s+\{\s*installJestFetchMock/sm,
  },
  {
    name: 'import { 멤버 줄 콤마 다음 줄에 installJestFetchMock import 끼어듦',
    re: /(?<!\)),\s*\r?\n\s*import\s+\{\s*installJestFetchMock/s,
  },
];

const SKIP_DIR = new Set(['node_modules', 'build', '.git']);

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name) || e.name.endsWith('.jdk')) continue;
      walk(p, out);
    } else if (TEST_OR_SPEC_TSX_RE.test(e.name)) out.push(p);
  }
  return out;
}

let totalFiles = 0;
const failures = [];

for (const srcRoot of uniqueRoots) {
  const files = walk(srcRoot);
  totalFiles += files.length;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const { name, re } of PATTERNS) {
      re.lastIndex = 0;
      if (re.test(text)) {
        failures.push({ file, rule: name });
      }
    }
  }
}

if (failures.length) {
  const byFile = new Map();
  for (const { file, rule } of failures) {
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push(rule);
  }
  console.error('깨진 테스트 import 패턴이 있습니다:\n');
  for (const [file, rules] of byFile) {
    const rel = path.relative(cwd, file);
    if (rules.length === 1) {
      console.error(`  - ${rel}: ${rules[0]}`);
    } else {
      console.error(`  - ${rel}:`);
      for (const r of rules) console.error(`      • ${r}`);
    }
  }
  console.error('\n수정: installJestFetchMock import를 완결된 import 블록 바깥(다음 줄)으로 옮기세요.');
  process.exit(1);
}

const rootsLabel = uniqueRoots.length;
console.log(
  `check-broken-test-imports: OK (${totalFiles}개 테스트 파일, ${rootsLabel}개 src 트리)`,
);
