#!/usr/bin/env python3
"""접속 확인용 최소 서버. React/npm 없이 '연결됨' 페이지만 서빙합니다."""
import http.server
import socketserver

PORT = 3999
HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <title>접속 확인</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: #1a1a2e;
      color: #eee;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #16213e;
      padding: 40px;
      border-radius: 16px;
      max-width: 480px;
      border: 2px solid #00d26a;
    }
    h1 { font-size: 28px; margin-bottom: 12px; color: #00d26a; }
    p { font-size: 16px; line-height: 1.6; margin-bottom: 12px; color: #a0a0a0; }
    .ok { color: #00d26a; font-weight: bold; margin-top: 20px; font-size: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>접속 확인</h1>
    <p><strong>이 화면이 보이면</strong> 이 PC에서 서버가 동작 중이고, 브라우저가 해당 포트에 연결된 것입니다.</p>
    <p>다음 단계: 터미널에서 <code>npm start</code> 실행 후 <strong>http://localhost:3000/standalone.html</strong> 을 여세요.</p>
    <p class="ok">✓ 연결 확인 완료 (포트 %s)</p>
  </div>
</body>
</html>
""" % PORT


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()
        self.wfile.write(HTML.encode("utf-8"))

    def log_message(self, format, *args):
        print("[접속] %s" % (args[0] if args else ""))


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("")
        print("  접속 확인용 서버 (React/npm 불필요)")
        print("  브라우저에서 아래 주소를 열어보세요:")
        print("")
        print("    http://localhost:%s" % PORT)
        print("")
        print("  '이 화면이 보이면' 이 나오면 이 PC에서 서버 접속이 됩니다.")
        print("  그 다음 CONNECT.md 대로 npm start 후 http://localhost:3000/standalone.html 을 여세요.")
        print("")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n종료했습니다.")
