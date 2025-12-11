const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * React 개발 서버 프록시 설정
 * API 요청만 백엔드로 프록시하고, 정적 파일은 React 개발 서버가 직접 제공
 */
module.exports = function(app) {
  // 정적 파일 필터 함수
  const filter = (pathname, req) => {
    try {
      // pathname이 문자열이 아니면 문자열로 변환
      const path = String(pathname || '');
      
      // 빈 경로나 루트는 프록시하지 않음
      if (!path || path === '/' || path === '') {
        return false;
      }
      
      // 정적 파일은 프록시하지 않음
      const staticPaths = [
        '/manifest.json',
        '/favicon.ico',
        '/sw.js',
        '/robots.txt',
        '/offline.html'
      ];
      
      if (staticPaths.includes(path)) {
        return false;
      }
      
      // 아이콘 및 정적 리소스는 프록시하지 않음
      if (path.startsWith('/icons/') || 
          path.startsWith('/static/') ||
          path.startsWith('/.well-known/')) {
        return false;
      }
      
      // 정적 파일 확장자 체크 (안전하게)
      const staticExtensions = ['.json', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.woff', '.woff2', '.ttf', '.eot'];
      const hasStaticExtension = staticExtensions.some(ext => {
        // endsWith가 없을 경우를 대비한 안전한 체크
        if (typeof path.endsWith === 'function') {
          return path.endsWith(ext);
        }
        // endsWith가 없으면 indexOf로 체크
        const extLength = ext.length;
        return path.length >= extLength && path.substring(path.length - extLength) === ext;
      });
      
      if (hasStaticExtension) {
        return false;
      }
      
      // API 요청만 프록시
      return path.startsWith('/api') || 
             path.startsWith('/chat') || 
             path.startsWith('/message') || 
             path.startsWith('/stream');
    } catch (error) {
      // 에러 발생 시 프록시하지 않음 (안전하게)
      // Note: setupProxy.js는 Node.js 환경에서 실행되므로 errorLogger 대신 console 사용
      console.error('Proxy filter error:', error);
      return false;
    }
  };

  // API 요청만 프록시
  app.use(
    filter,
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      logLevel: 'warn',
      onError: (err, req, res) => {
        // Note: setupProxy.js는 Node.js 환경에서 실행되므로 errorLogger 대신 console 사용
        console.log('Proxy error:', err.message);
      },
    })
  );
};

