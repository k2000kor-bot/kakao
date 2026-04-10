#!/usr/bin/env python3
"""
CORBU.AI 시스템 통합 테스트
백엔드 API와 프론트엔드 연동 테스트
"""

import os
import requests
import json
import time
import sys
from datetime import datetime

# API 설정 — 레거시 v8 전용 서버(예: 8001). 통합 main_server(5002)는 scripts/test/api_test.py 권장.
BASE_URL = os.environ.get("CORBU_V8_BASE_URL", "http://localhost:8001")
API_VERSION = "v8"

class SystemIntegrationTest:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str = ""):
        """테스트 결과 로깅"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        result = "✅ PASS" if success else "❌ FAIL"
        print(f"[{timestamp}] {result} - {test_name}")
        if message:
            print(f"    {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": timestamp
        })
        
    def test_server_health(self):
        """서버 상태 확인 테스트"""
        try:
            response = self.session.get(f"{BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                self.log_test("서버 상태 확인", True, f"API 버전: {data.get('version', 'N/A')}")
                return True
            else:
                self.log_test("서버 상태 확인", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("서버 상태 확인", False, str(e))
            return False
    
    def test_projects_api(self):
        """프로젝트 API 테스트"""
        try:
            # 프로젝트 목록 조회
            response = self.session.get(f"{BASE_URL}/api/{API_VERSION}/projects")
            if response.status_code == 200:
                data = response.json()
                self.log_test("프로젝트 목록 조회", True, f"프로젝트 수: {data.get('count', 0)}")
                
                # 새 프로젝트 생성
                new_project = {
                    "name": f"테스트 프로젝트 {datetime.now().strftime('%H:%M:%S')}",
                    "description": "시스템 통합 테스트용 프로젝트",
                    "project_type": "test"
                }
                
                response = self.session.post(
                    f"{BASE_URL}/api/{API_VERSION}/projects",
                    json=new_project
                )
                
                if response.status_code == 200:
                    data = response.json()
                    project_id = data.get('project', {}).get('id')
                    self.log_test("프로젝트 생성", True, f"프로젝트 ID: {project_id}")
                    return project_id
                else:
                    self.log_test("프로젝트 생성", False, f"HTTP {response.status_code}")
                    return None
            else:
                self.log_test("프로젝트 목록 조회", False, f"HTTP {response.status_code}")
                return None
        except Exception as e:
            self.log_test("프로젝트 API 테스트", False, str(e))
            return None
    
    def test_chat_sessions_api(self, project_id: str):
        """대화 세션 API 테스트"""
        try:
            # 세션 목록 조회
            response = self.session.get(
                f"{BASE_URL}/api/{API_VERSION}/chat-sessions",
                params={"project_id": project_id}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("대화 세션 목록 조회", True, f"세션 수: {data.get('count', 0)}")
                
                # 새 세션 생성
                new_session = {
                    "project_id": project_id,
                    "title": f"테스트 세션 {datetime.now().strftime('%H:%M:%S')}",
                    "initial_message": "안녕하세요! CORBU.AI 시스템 테스트입니다."
                }
                
                response = self.session.post(
                    f"{BASE_URL}/api/{API_VERSION}/chat-sessions",
                    json=new_session
                )
                
                if response.status_code == 200:
                    data = response.json()
                    session_id = data.get('session', {}).get('id')
                    self.log_test("대화 세션 생성", True, f"세션 ID: {session_id}")
                    return session_id
                else:
                    self.log_test("대화 세션 생성", False, f"HTTP {response.status_code}")
                    return None
            else:
                self.log_test("대화 세션 목록 조회", False, f"HTTP {response.status_code}")
                return None
        except Exception as e:
            self.log_test("대화 세션 API 테스트", False, str(e))
            return None
    
    def test_database_stats(self):
        """데이터베이스 통계 테스트"""
        try:
            response = self.session.get(f"{BASE_URL}/api/{API_VERSION}/database/statistics")
            if response.status_code == 200:
                data = response.json()
                self.log_test("데이터베이스 통계 조회", True, "통계 정보 조회 성공")
                return True
            else:
                self.log_test("데이터베이스 통계 조회", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("데이터베이스 통계 조회", False, str(e))
            return False
    
    def test_search_api(self):
        """검색 API 테스트"""
        try:
            response = self.session.get(
                f"{BASE_URL}/api/{API_VERSION}/search",
                params={"query": "테스트"}
            )
            if response.status_code == 200:
                data = response.json()
                self.log_test("검색 API 테스트", True, "검색 기능 정상 작동")
                return True
            else:
                self.log_test("검색 API 테스트", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("검색 API 테스트", False, str(e))
            return False
    
    def test_ai_message_generation(self):
        """AI 메시지 생성 테스트"""
        try:
            ai_request = {
                "prompt": "안녕하세요! CORBU.AI 시스템입니다.",
                "context": {
                    "project_type": "test",
                    "user_id": "test_user"
                }
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/{API_VERSION}/ai-message",
                json=ai_request
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("AI 메시지 생성", True, "AI 메시지 생성 성공")
                return True
            else:
                self.log_test("AI 메시지 생성", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("AI 메시지 생성", False, str(e))
            return False
    
    def run_all_tests(self):
        """모든 테스트 실행"""
        print("🚀 CORBU.AI 시스템 통합 테스트 시작")
        print("=" * 50)
        
        # 1. 서버 상태 확인
        if not self.test_server_health():
            print("❌ 서버가 실행되지 않았습니다. 백엔드 서버를 먼저 시작해주세요.")
            return False
        
        # 2. 프로젝트 API 테스트
        project_id = self.test_projects_api()
        if not project_id:
            print("❌ 프로젝트 API 테스트 실패")
            return False
        
        # 3. 대화 세션 API 테스트
        session_id = self.test_chat_sessions_api(project_id)
        if not session_id:
            print("❌ 대화 세션 API 테스트 실패")
            return False
        
        # 4. 데이터베이스 통계 테스트
        self.test_database_stats()
        
        # 5. 검색 API 테스트
        self.test_search_api()
        
        # 6. AI 메시지 생성 테스트
        self.test_ai_message_generation()
        
        # 결과 요약
        print("\n" + "=" * 50)
        print("📊 테스트 결과 요약")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"총 테스트: {total}")
        print(f"성공: {passed}")
        print(f"실패: {total - passed}")
        print(f"성공률: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 모든 테스트가 성공했습니다!")
            return True
        else:
            print("\n⚠️ 일부 테스트가 실패했습니다.")
            return False

def main():
    """메인 함수"""
    test = SystemIntegrationTest()
    success = test.run_all_tests()
    
    if success:
        print("\n✅ 시스템이 정상적으로 작동하고 있습니다.")
        print("프론트엔드 애플리케이션을 브라우저에서 확인해보세요: http://localhost:3000")
    else:
        print("\n❌ 시스템에 문제가 있습니다.")
        print("백엔드 서버가 실행 중인지 확인해주세요.")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main()) 