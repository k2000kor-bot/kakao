#!/usr/bin/env python3
"""
백엔드 API 실제 테스트 스크립트
"""

import requests
import json
import time
import sys
from datetime import datetime

class BackendAPITester:
    def __init__(self):
        self.base_url = "http://localhost:5002"
        self.test_results = []
        
    def test_health_endpoint(self):
        """헬스 체크 엔드포인트 테스트"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ /health 엔드포인트 정상")
                return True
            else:
                print(f"❌ /health 엔드포인트 오류: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ /health 엔드포인트 연결 실패: {e}")
            return False
    
    def test_status_endpoint(self):
        """상태 엔드포인트 테스트"""
        try:
            response = requests.get(f"{self.base_url}/api/v7/status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("✅ /api/v7/status 엔드포인트 정상")
                print(f"   - 시스템 버전: {data.get('version', 'N/A')}")
                print(f"   - 상태: {data.get('status', 'N/A')}")
                return True
            else:
                print(f"❌ /api/v7/status 엔드포인트 오류: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ /api/v7/status 엔드포인트 연결 실패: {e}")
            return False
    
    def test_chat_rooms_endpoint(self):
        """대화방 목록 엔드포인트 테스트"""
        try:
            response = requests.get(f"{self.base_url}/api/v7/chat-rooms", timeout=5)
            if response.status_code == 200:
                data = response.json()
                chat_rooms = data.get('chat_rooms', [])
                print(f"✅ /api/v7/chat-rooms 엔드포인트 정상")
                print(f"   - 발견된 대화방: {len(chat_rooms)}개")
                return True
            else:
                print(f"❌ /api/v7/chat-rooms 엔드포인트 오류: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ /api/v7/chat-rooms 엔드포인트 연결 실패: {e}")
            return False
    
    def test_gpt_message_generation(self):
        """GPT 메시지 생성 엔드포인트 테스트"""
        try:
            test_data = {
                "target_message": "안녕하세요",
                "context_messages": [
                    {"role": "user", "content": "안녕하세요"},
                    {"role": "assistant", "content": "안녕하세요! 무엇을 도와드릴까요?"}
                ],
                "settings": {
                    "tone": "friendly",
                    "ai_model": "gpt-3.5-turbo"
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/v7/generate-gpt-message",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ /api/v7/generate-gpt-message 엔드포인트 정상")
                if data.get('success'):
                    print("   - AI 메시지 생성 성공")
                else:
                    print("   - AI 메시지 생성 실패 (API 키 필요)")
                return True
            else:
                print(f"❌ /api/v7/generate-gpt-message 엔드포인트 오류: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ /api/v7/generate-gpt-message 엔드포인트 연결 실패: {e}")
            return False
    
    def test_analytics_dashboard(self):
        """분석 대시보드 엔드포인트 테스트"""
        try:
            response = requests.get(f"{self.base_url}/api/v7/analytics/dashboard", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("✅ /api/v7/analytics/dashboard 엔드포인트 정상")
                if data.get('success'):
                    dashboard_data = data.get('dashboard_data', {})
                    real_time_metrics = dashboard_data.get('real_time_metrics', {})
                    print(f"   - 활성 사용자: {real_time_metrics.get('active_users', 'N/A')}")
                    print(f"   - 성공률: {real_time_metrics.get('success_rate', 'N/A')}%")
                return True
            else:
                print(f"❌ /api/v7/analytics/dashboard 엔드포인트 오류: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ /api/v7/analytics/dashboard 엔드포인트 연결 실패: {e}")
            return False
    
    def test_projects_endpoint(self):
        """프로젝트 엔드포인트 테스트"""
        try:
            response = requests.get(f"{self.base_url}/api/v7/projects", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("✅ /api/v7/projects 엔드포인트 정상")
                if data.get('success'):
                    projects = data.get('projects', [])
                    print(f"   - 프로젝트 수: {len(projects)}개")
                return True
            else:
                print(f"❌ /api/v7/projects 엔드포인트 오류: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ /api/v7/projects 엔드포인트 연결 실패: {e}")
            return False
    
    def test_advanced_generate(self):
        """고급 메시지 생성 엔드포인트 테스트"""
        try:
            test_data = {
                "purpose": "친근한 인사",
                "formats": ["empathy", "informative"],
                "generationType": "batch",
                "context": {
                    "selectedMessage": {
                        "content": "안녕하세요",
                        "sender": "사용자"
                    },
                    "conversationHistory": [
                        {"content": "안녕하세요", "sender": "사용자"}
                    ],
                    "participants": ["사용자", "AI"]
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/v7/advanced-generate",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ /api/v7/advanced-generate 엔드포인트 정상")
                if data.get('success'):
                    messages = data.get('messages', [])
                    print(f"   - 생성된 메시지: {len(messages)}개")
                return True
            else:
                print(f"❌ /api/v7/advanced-generate 엔드포인트 오류: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ /api/v7/advanced-generate 엔드포인트 연결 실패: {e}")
            return False
    
    def run_all_tests(self):
        """모든 API 테스트 실행"""
        print("🚀 백엔드 API 테스트 시작")
        print("=" * 50)
        
        # 서버 시작 대기
        print("⏳ 서버 시작 대기 중...")
        time.sleep(3)
        
        # 각 엔드포인트 테스트
        tests = [
            ("헬스 체크", self.test_health_endpoint),
            ("시스템 상태", self.test_status_endpoint),
            ("대화방 목록", self.test_chat_rooms_endpoint),
            ("GPT 메시지 생성", self.test_gpt_message_generation),
            ("분석 대시보드", self.test_analytics_dashboard),
            ("프로젝트 관리", self.test_projects_endpoint),
            ("고급 메시지 생성", self.test_advanced_generate)
        ]
        
        for test_name, test_func in tests:
            print(f"\n🔍 {test_name} 테스트...")
            try:
                success = test_func()
                self.test_results.append((test_name, success))
            except Exception as e:
                print(f"❌ {test_name} 테스트 실패: {e}")
                self.test_results.append((test_name, False))
        
        # 결과 요약
        self.print_summary()
    
    def print_summary(self):
        """테스트 결과 요약"""
        print("\n" + "=" * 50)
        print("📊 API 테스트 결과 요약:")
        print("=" * 50)
        
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
            print("🎉 백엔드 API가 정상 작동합니다!")
            return True
        elif success_rate >= 60:
            print("⚠️ 백엔드 API에 일부 문제가 있습니다.")
            return False
        else:
            print("❌ 백엔드 API에 심각한 문제가 있습니다.")
            return False

def main():
    """메인 함수"""
    tester = BackendAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🚀 백엔드 API 테스트 완료!")
        print("📖 API 문서: http://localhost:5002/api/docs")
        print("🔗 서버 주소: http://localhost:5002")
    else:
        print("\n❌ 백엔드 API 테스트 실패!")
        print("🔧 서버 상태를 확인하세요.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 