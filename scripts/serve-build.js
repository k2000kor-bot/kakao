#!/usr/bin/env node
/**
 * 빌드 결과만 서빙 (webpack-dev-server 없이 접속 테스트용)
 * 사용: npm run build && npm run serve:build
 * → http://localhost:3000 이 열리면 이 PC·브라우저 접속은 정상. 문제는 CRA dev 서버 쪽.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const BUILD = path.join(__dirname, '..', 'build');

function mimeType(ext) {
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  return map[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  let urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = path.join(BUILD, urlPath);

  const sendFile = (fp) => {
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(fp);
      const headers = { 'Content-Type': mimeType(ext) };
      if (ext === '.html') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      res.writeHead(200, headers);
      res.end(data);
    });
  };

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(filePath);
      return;
    }
    // SPA fallback: 파일 없으면 index.html
    const indexHtml = path.join(BUILD, 'index.html');
    fs.stat(indexHtml, (e, s) => {
      if (!e && s.isFile()) sendFile(indexHtml);
      else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>오류</title></head><body>' +
          '<h1>build 폴더 없음</h1><p>먼저 <code>npm run build</code> 를 실행하세요.</p>' +
          '</body></html>'
        );
      }
    });
  });
});

fs.stat(path.join(BUILD, 'index.html'), (err) => {
  if (err) {
    console.error('build/index.html 없음. 먼저 npm run build 를 실행하세요.');
    process.exit(1);
  }
  server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('  빌드 결과 서빙: http://localhost:' + PORT);
    console.log('  이 주소로 접속되면 접속·브라우저는 정상. CRA dev 서버만 문제일 수 있음.');
    console.log('');
  });
});
