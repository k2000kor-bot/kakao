/**
 * `frontend/` 미러는 보통 루트에서만 `npm install` 하므로 `frontend/node_modules`가 없거나
 * 불완전하면 `npm test --prefix frontend` 시 Jest가 `react-router-dom` 등을 찾지 못한다.
 * 없으면(또는 react-router-dom 없는 불완전 폴더면) 루트 `node_modules`로 심볼릭 링크를 만든다.
 * `frontend`에 완전한 `npm install`이 된 경우( react-router-dom 존재 )는 건드리지 않는다.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const frontendDir = path.join(repoRoot, 'frontend');
const linkPath = path.join(frontendDir, 'node_modules');
const targetPath = path.join(repoRoot, 'node_modules');

function main() {
  if (!fs.existsSync(targetPath)) {
    console.warn(
      '[linkFrontendNodeModules] 건너뜀: 루트 node_modules 없음 (저장소 루트에서 npm install)'
    );
    return;
  }
  if (!fs.existsSync(frontendDir)) {
    return;
  }

  let stat;
  try {
    stat = fs.lstatSync(linkPath);
  } catch {
    stat = null;
  }

  if (stat) {
    if (stat.isSymbolicLink()) {
      return;
    }
    if (stat.isDirectory()) {
      const marker = path.join(linkPath, 'react-router-dom');
      if (fs.existsSync(marker)) {
        return;
      }
      console.warn(
        '[linkFrontendNodeModules] 불완전한 frontend/node_modules 제거 후 루트 node_modules로 심링크합니다.'
      );
      fs.rmSync(linkPath, { recursive: true, force: true });
    } else {
      console.warn('[linkFrontendNodeModules] 건너뜀: frontend/node_modules 가 파일 등 비정상 경로');
      return;
    }
  }

  if (process.platform === 'win32') {
    console.warn(
      '[linkFrontendNodeModules] Windows에서는 생략합니다. `npm install --prefix frontend`를 사용하세요.'
    );
    return;
  }

  const relTarget = path.relative(frontendDir, targetPath);
  fs.symlinkSync(relTarget, linkPath, 'dir');
  console.log('[linkFrontendNodeModules] frontend/node_modules ->', relTarget);
}

main();
