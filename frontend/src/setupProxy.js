/**
 * CRA dev 서버 접속 문제 회피: 프록시 미등록.
 * - 프론트는 API를 http://localhost:5002 로 직접 호출 (config/api.ts)
 * - 백엔드 main_server.py CORS allow_origins=["*"] 로 허용
 * - 루트(/)·정적 요청은 dev 서버가 그대로 처리
 *
 * 프록시가 필요하면 아래 주석을 해제하고 이 파일을 원래대로 복원하세요.
 */
module.exports = function (app) {
  // 프록시 미등록 — dev 서버 접속 안 됨 현상 회피
};
