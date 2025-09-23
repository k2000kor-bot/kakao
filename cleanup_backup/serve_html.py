#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 3000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            # 루트 경로로 접근하면 modern_chat_interface.html을 서빙
            self.path = '/modern_chat_interface.html'
        return super().do_GET()

if __name__ == "__main__":
    os.chdir('/Users/aD/kakao-frontend')
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"서버가 http://localhost:{PORT} 에서 실행 중입니다")
        print("modern_chat_interface.html 파일을 서빙합니다")
        print("브라우저에서 http://localhost:3000 을 열어보세요")
        httpd.serve_forever()
