#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            # 루트 경로로 접근하면 modern_chat_interface.html을 서빙
            self.path = '/modern_chat_interface.html'
        return super().do_GET()

if __name__ == "__main__":
    _ROOT = os.path.dirname(os.path.abspath(__file__))
    os.chdir(_ROOT)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 CORBU.AI 서버를 시작합니다...")
        print(f"📁 modern_chat_interface.html 파일을 서빙합니다")
        print(f"🌐 브라우저에서 http://localhost:{PORT} 을 열어보세요")
        print(f"✅ 루트 경로(/)에서 바로 HTML 파일이 표시됩니다")
        httpd.serve_forever()
