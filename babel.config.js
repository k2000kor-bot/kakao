/**
 * CRA(react-scripts)는 기본적으로 동일 프리셋을 쓰지만, `npx jest` 직접 실행 시
 * Babel이 설정을 못 찾으면 .test.ts에서 `import type`·타입 단언 등이 파싱 실패할 수 있음.
 */
module.exports = {
  presets: [require.resolve('babel-preset-react-app')],
};
