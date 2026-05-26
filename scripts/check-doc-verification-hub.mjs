#!/usr/bin/env node
/**
 * Tracked *.md under active paths must contain the shared hub marker (see TESTING_GUIDE.md).
 * Archives, JDK legal trees, venv, and hub/canonical docs are skipped.
 * Non-regular files (e.g. a tracked directory named `*.md`) are skipped.
 * Usage: node scripts/check-doc-verification-hub.mjs
 * Strict (exit 1 on any miss): DOC_HUB_STRICT=1 node scripts/check-doc-verification-hub.mjs
 */
import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const MARKER = "저장소 루트 검증 허브";
const MARKER_NFC = MARKER.normalize("NFC");
const REPO_ROOT = path.resolve(import.meta.dirname, "..");

function hasHubMarker(body) {
  return body.normalize("NFC").includes(MARKER_NFC);
}

/** Prefer git object (CI shallow checkout·worktree drift 대비), fall back to disk */
function readTrackedMarkdown(rel) {
  const fromGit = spawnSync("git", ["show", `HEAD:${rel}`], {
    encoding: "utf8",
    cwd: REPO_ROOT,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (fromGit.status === 0 && typeof fromGit.stdout === "string") {
    return fromGit.stdout;
  }
  try {
    return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
  } catch {
    return null;
  }
}

const PATH_SKIP =
  /node_modules|OpenJDK|Oracle_JDK|cleanup_backup|^backups\/|^backup\/|\.cursor\/|\/Contents\/Home\/legal\/|\.venv\/|\/venv\/|site-packages|\.pytest_cache|^chat_rooms\/|^corbu-ai\/frontend\/src\/components\/OpenJDK/;

const EXACT_SKIP = new Set([
  "TESTING_GUIDE.md",
  "FINAL_CHECKLIST.md",
  "docs/COMPLETION_CHECKLIST.md",
  "docs/FINAL_CHECKLIST.md",
  "docs/PUSH_BLOCK_HANDOFF.md",
  "docs/PUSH_BLOCK_MANIFEST.md",
  "docs/PUSH_BLOCK_STATUS.md",
  "호소문_예시.md",
]);

/** Markdown we expect to carry the hub paragraph */
const STRICT_PREFIX_RE =
  /^(docs\/|src\/|frontend\/src\/|scripts\/|e2e\/|android_app\/|backend\/api\/|corbu-ai\/README\.md$)/;

function main() {
  const strict = process.env.DOC_HUB_STRICT === "1";
  let out;
  try {
    out = execSync('git ls-files "*.md"', {
      encoding: "utf8",
      cwd: REPO_ROOT,
    }).trim();
  } catch {
    console.error("check-doc-verification-hub: git ls-files failed (not a git repo?)");
    process.exit(2);
  }
  const files = out ? out.split("\n") : [];
  const missing = [];
  let checked = 0;

  for (const rel of files) {
    if (!rel || PATH_SKIP.test(rel) || EXACT_SKIP.has(rel)) continue;
    if (/^docs\/PR_.*\.md$/.test(rel)) continue;
    if (!STRICT_PREFIX_RE.test(rel)) continue;
    const abs = path.join(REPO_ROOT, rel);
    try {
      const st = fs.statSync(abs);
      if (!st.isFile()) continue;
    } catch {
      /* shallow CI: worktree에 없어도 git show로 검사 */
    }
    checked += 1;
    const body = readTrackedMarkdown(rel);
    if (body == null) continue;
    if (!hasHubMarker(body)) missing.push(rel);
  }

  if (missing.length) {
    console.error(
      `check-doc-verification-hub: ${missing.length} tracked file(s) under active paths lack "${MARKER}":`
    );
    for (const m of missing) console.error(`  - ${m}`);
    if (strict) process.exit(1);
    process.exit(0);
  }
  console.log(`check-doc-verification-hub: OK (${checked} *.md in active paths).`);
}

main();
