"""
CORBU.AI Backend API 테스트 스크립트
API 엔드포인트를 테스트하는 간단한 스크립트
"""

import os
import requests
import json
from typing import Optional

_API_PORT = os.environ.get("API_PORT") or os.environ.get("BACKEND_PORT") or "5002"
BASE_URL = os.environ.get(
    "CORBU_TEST_API_BASE", f"http://localhost:{_API_PORT}"
)

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.user_id: Optional[str] = None
    
    def print_response(self, title: str, response: requests.Response):
        """응답 출력"""
        print(f"\n{'='*50}")
        print(f"{title}")
        print(f"{'='*50}")
        print(f"Status Code: {response.status_code}")
        try:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        except:
            print(f"Response: {response.text}")
        print(f"{'='*50}\n")
    
    def test_health_check(self):
        """헬스 체크 테스트"""
        print("🔍 헬스 체크 테스트...")
        response = requests.get(f"{self.base_url}/api/health")
        self.print_response("헬스 체크", response)
        return response.status_code == 200
    
    def test_api_status(self):
        """API 상태 테스트"""
        print("📊 API 상태 테스트...")
        response = requests.get(f"{self.base_url}/api/status")
        self.print_response("API 상태", response)
        return response.status_code == 200
    
    def test_api_version(self):
        """API 버전 테스트"""
        print("📦 API 버전 테스트...")
        response = requests.get(f"{self.base_url}/api/version")
        self.print_response("API 버전", response)
        return response.status_code == 200
    
    def test_register(self, username: str = "testuser", email: str = "test@example.com", password: str = "Test1234!"):
        """회원가입 테스트"""
        print("👤 회원가입 테스트...")
        data = {
            "username": username,
            "email": email,
            "password": password,
            "confirmPassword": password
        }
        response = requests.post(f"{self.base_url}/api/auth/register", json=data)
        self.print_response("회원가입", response)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                self.user_id = result["data"]["user"]["id"]
                print(f"✅ 사용자 ID: {self.user_id}")
                return True
        return False
    
    def test_login(self, username: str = "testuser", password: str = "Test1234!"):
        """로그인 테스트"""
        print("🔐 로그인 테스트...")
        data = {
            "username": username,
            "password": password
        }
        response = requests.post(f"{self.base_url}/api/auth/login", json=data)
        self.print_response("로그인", response)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                self.access_token = result["data"]["token"]["accessToken"]
                self.refresh_token = result["data"]["token"]["refreshToken"]
                print(f"✅ 액세스 토큰: {self.access_token[:20]}...")
                return True
        return False
    
    def test_get_current_user(self):
        """현재 사용자 정보 조회 테스트"""
        if not self.access_token:
            print("❌ 로그인이 필요합니다.")
            return False
        
        print("👤 현재 사용자 정보 조회 테스트...")
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(f"{self.base_url}/api/auth/me", headers=headers)
        self.print_response("현재 사용자 정보", response)
        return response.status_code == 200
    
    def test_refresh_token(self):
        """토큰 갱신 테스트"""
        if not self.refresh_token:
            print("❌ 리프레시 토큰이 없습니다.")
            return False
        
        print("🔄 토큰 갱신 테스트...")
        data = {"refreshToken": self.refresh_token}
        response = requests.post(f"{self.base_url}/api/auth/refresh", json=data)
        self.print_response("토큰 갱신", response)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                self.access_token = result["data"]["token"]["accessToken"]
                self.refresh_token = result["data"]["token"]["refreshToken"]
                print("✅ 토큰 갱신 성공")
                return True
        return False
    
    def test_get_profile(self):
        """프로필 조회 테스트"""
        if not self.access_token or not self.user_id:
            print("❌ 로그인 및 사용자 ID가 필요합니다.")
            return False
        
        print("📋 프로필 조회 테스트...")
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(f"{self.base_url}/api/user-profile/{self.user_id}", headers=headers)
        self.print_response("프로필 조회", response)
        return response.status_code == 200
    
    def test_update_profile(self):
        """프로필 업데이트 테스트"""
        if not self.access_token:
            print("❌ 로그인이 필요합니다.")
            return False
        
        print("✏️ 프로필 업데이트 테스트...")
        headers = {"Authorization": f"Bearer {self.access_token}"}
        data = {
            "fullName": "테스트 사용자",
            "phone": "010-1234-5678",
            "location": "서울",
            "bio": "테스트 프로필입니다."
        }
        response = requests.post(f"{self.base_url}/api/update-user-profile", json=data, headers=headers)
        self.print_response("프로필 업데이트", response)
        return response.status_code == 200
    
    def test_get_settings(self):
        """설정 조회 테스트"""
        if not self.access_token:
            print("❌ 로그인이 필요합니다.")
            return False
        
        print("⚙️ 설정 조회 테스트...")
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = requests.get(f"{self.base_url}/api/user/settings", headers=headers)
        self.print_response("설정 조회", response)
        return response.status_code == 200
    
    def test_update_settings(self):
        """설정 업데이트 테스트"""
        if not self.access_token:
            print("❌ 로그인이 필요합니다.")
            return False
        
        print("⚙️ 설정 업데이트 테스트...")
        headers = {"Authorization": f"Bearer {self.access_token}"}
        data = {
            "theme": "dark",
            "language": "ko",
            "notifications": {
                "email": True,
                "push": True,
                "sms": False
            }
        }
        response = requests.put(f"{self.base_url}/api/user/settings", json=data, headers=headers)
        self.print_response("설정 업데이트", response)
        return response.status_code == 200
    
    def test_security_events(self):
        """보안 이벤트 테스트"""
        print("🔒 보안 이벤트 로깅 테스트...")
        data = {
            "type": "login",
            "ipAddress": "127.0.0.1",
            "userAgent": "test-agent",
            "details": {"test": True},
            "severity": "low"
        }
        response = requests.post(f"{self.base_url}/api/security/events", json=data)
        self.print_response("보안 이벤트 로깅", response)
        
        # 이벤트 조회
        print("📊 보안 이벤트 조회 테스트...")
        response = requests.get(f"{self.base_url}/api/security/events?limit=10")
        self.print_response("보안 이벤트 조회", response)
        return response.status_code == 200
    
    def test_security_metrics(self):
        """보안 메트릭 테스트"""
        print("📈 보안 메트릭 테스트...")
        response = requests.get(f"{self.base_url}/api/security/metrics")
        self.print_response("보안 메트릭", response)
        return response.status_code == 200
    
    def test_utils(self):
        """유틸리티 테스트"""
        print("🛠️ 유틸리티 테스트...")
        
        # 이메일 검증
        print("📧 이메일 검증 테스트...")
        response = requests.post(f"{self.base_url}/api/utils/validate-email?email=test@example.com")
        self.print_response("이메일 검증", response)
        
        # 비밀번호 검증
        print("🔑 비밀번호 검증 테스트...")
        response = requests.post(f"{self.base_url}/api/utils/validate-password?password=Test1234!")
        self.print_response("비밀번호 검증", response)
        
        # 통계 조회
        print("📊 통계 조회 테스트...")
        response = requests.get(f"{self.base_url}/api/utils/stats")
        self.print_response("통계 조회", response)
        return response.status_code == 200
    
    def test_logout(self):
        """로그아웃 테스트"""
        if not self.refresh_token:
            print("❌ 리프레시 토큰이 없습니다.")
            return False
        
        print("🚪 로그아웃 테스트...")
        data = {"refreshToken": self.refresh_token}
        response = requests.post(f"{self.base_url}/api/auth/logout", json=data)
        self.print_response("로그아웃", response)
        
        if response.status_code == 200:
            self.access_token = None
            self.refresh_token = None
            print("✅ 로그아웃 성공")
            return True
        return False
    
    def run_all_tests(self):
        """모든 테스트 실행"""
        print("\n" + "="*50)
        print("🚀 CORBU.AI Backend API 테스트 시작")
        print("="*50 + "\n")
        
        results = []
        
        # 기본 테스트
        results.append(("헬스 체크", self.test_health_check()))
        results.append(("API 상태", self.test_api_status()))
        results.append(("API 버전", self.test_api_version()))
        
        # 인증 테스트
        results.append(("회원가입", self.test_register()))
        results.append(("로그인", self.test_login()))
        results.append(("현재 사용자 정보", self.test_get_current_user()))
        results.append(("토큰 갱신", self.test_refresh_token()))
        
        # 사용자 관리 테스트
        results.append(("프로필 조회", self.test_get_profile()))
        results.append(("프로필 업데이트", self.test_update_profile()))
        results.append(("설정 조회", self.test_get_settings()))
        results.append(("설정 업데이트", self.test_update_settings()))
        
        # 보안 테스트
        results.append(("보안 이벤트", self.test_security_events()))
        results.append(("보안 메트릭", self.test_security_metrics()))
        
        # 유틸리티 테스트
        results.append(("유틸리티", self.test_utils()))
        
        # 로그아웃 테스트
        results.append(("로그아웃", self.test_logout()))
        
        # 결과 요약
        print("\n" + "="*50)
        print("📊 테스트 결과 요약")
        print("="*50)
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for name, result in results:
            status = "✅ 통과" if result else "❌ 실패"
            print(f"{name}: {status}")
        
        print(f"\n총 {total}개 테스트 중 {passed}개 통과 ({passed/total*100:.1f}%)")
        print("="*50 + "\n")

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests()

