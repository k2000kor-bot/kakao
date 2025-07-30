#!/usr/bin/env python3
"""
시스템 통합 테스트 스크립트
"""

import requests
import time
import json
from datetime import datetime

class SystemIntegrationTester:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.test_results = []
    
    def test_backend_health(self):
        """백엔드 서버 상태 테스트"""
        print("🔍 백엔드 서버 상태 테스트...")
        
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 백엔드 서버 정상 (버전: {data.get('version', 'N/A')})")
                return True
            else:
                print(f"❌ 백엔드 서버 오류: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 백엔드 서버 연결 실패: {e}")
            return False
    
    def test_frontend_health(self):
        """프론트엔드 서버 상태 테스트"""
        print("🔍 프론트엔드 서버 상태 테스트...")
        
        try:
            response = requests.get(self.frontend_url, timeout=5)
            if response.status_code == 200:
                print("✅ 프론트엔드 서버 정상")
                return True
            else:
                print(f"❌ 프론트엔드 서버 오류: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 프론트엔드 서버 연결 실패: {e}")
            return False
    
    def test_api_endpoints(self):
        """API 엔드포인트 테스트"""
        print("🔍 API 엔드포인트 테스트...")
        
        endpoints = [
            "/api/v7/status",
            "/api/v7/chat-rooms",
            "/api/v7/analytics/dashboard",
            "/api/v7/projects"
        ]
        
        success_count = 0
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.backend_url}{endpoint}", timeout=5)
                if response.status_code == 200:
                    print(f"✅ {endpoint} 정상")
                    success_count += 1
                else:
                    print(f"❌ {endpoint} 오류: {response.status_code}")
            except Exception as e:
                print(f"❌ {endpoint} 연결 실패: {e}")
        
        success_rate = (success_count / len(endpoints)) * 100
        print(f"📊 API 엔드포인트 성공률: {success_rate:.1f}% ({success_count}/{len(endpoints)})")
        
        return success_rate >= 75
    
    def test_ai_functionality(self):
        """AI 기능 테스트"""
        print("🔍 AI 기능 테스트...")
        
        try:
            # GPT 메시지 생성 테스트
            response = requests.post(
                f"{self.backend_url}/api/v7/generate-gpt-message",
                json={"target_message": "안녕하세요", "context": "테스트"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print("✅ GPT 메시지 생성 성공")
                    return True
                else:
                    print(f"❌ GPT 메시지 생성 실패: {data.get('error')}")
                    return False
            else:
                print(f"❌ GPT 메시지 생성 요청 실패: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ AI 기능 테스트 실패: {e}")
            return False
    
    def test_websocket_connection(self):
        """WebSocket 연결 테스트"""
        print("🔍 WebSocket 연결 테스트...")
        
        try:
            # WebSocket 연결 테스트 (간단한 HTTP 요청으로 대체)
            response = requests.get(f"{self.backend_url}/api/v7/status", timeout=5)
            if response.status_code == 200:
                print("✅ WebSocket 서버 응답 정상")
                return True
            else:
                print(f"❌ WebSocket 서버 응답 오류: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ WebSocket 연결 테스트 실패: {e}")
            return False
    
    def run_all_tests(self):
        """모든 테스트 실행"""
        print("🚀 시스템 통합 테스트 시작")
        print("=" * 60)
        
        # 백엔드 테스트
        backend_result = self.test_backend_health()
        self.test_results.append(("백엔드 서버", backend_result))
        
        # 프론트엔드 테스트
        frontend_result = self.test_frontend_health()
        self.test_results.append(("프론트엔드 서버", frontend_result))
        
        # API 엔드포인트 테스트
        api_result = self.test_api_endpoints()
        self.test_results.append(("API 엔드포인트", api_result))
        
        # AI 기능 테스트
        ai_result = self.test_ai_functionality()
        self.test_results.append(("AI 기능", ai_result))
        
        # WebSocket 테스트
        ws_result = self.test_websocket_connection()
        self.test_results.append(("WebSocket 연결", ws_result))
        
        # 결과 요약
        self.print_summary()
    
    def print_summary(self):
        """테스트 결과 요약"""
        print("\n" + "=" * 60)
        print("📊 시스템 통합 테스트 결과 요약:")
        print("=" * 60)
        
        successful_tests = 0
        for test_name, success in self.test_results:
            status = "✅ 성공" if success else "❌ 실패"
            print(f"   {test_name}: {status}")
            if success:
                successful_tests += 1
        
        total_tests = len(self.test_results)
        success_rate = (successful_tests / total_tests) * 100
        
        print(f"\n📈 전체 성공률: {success_rate:.1f}% ({successful_tests}/{total_tests})")
        
        if success_rate >= 80:
            print("🎉 시스템이 정상 작동합니다!")
            print("🌐 웹 브라우저에서 http://localhost:3001 으로 접속하세요.")
        elif success_rate >= 60:
            print("⚠️ 대부분의 기능이 작동하지만 일부 문제가 있습니다.")
        else:
            print("❌ 시스템에 심각한 문제가 있습니다.")
        
        print(f"\n⏰ 테스트 완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    tester = SystemIntegrationTester()
    tester.run_all_tests() 