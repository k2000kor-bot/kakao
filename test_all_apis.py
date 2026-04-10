#!/usr/bin/env python3
"""
CORBU.AI 전체 API 엔드포인트 테스트 스크립트
모든 주요 기능을 자동으로 테스트합니다.
"""

import requests
import json
import time
import os
from datetime import datetime

class CorbuAITester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.test_results = []
        self.session_id = f"test-session-{int(time.time())}"
        
    def log_test(self, test_name, success, details="", response_time=None):
        """테스트 결과 로깅"""
        result = {
            "test_name": test_name,
            "success": success,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅" if success else "❌"
        time_str = f" ({response_time:.3f}s)" if response_time else ""
        print(f"{status} {test_name}{time_str}")
        if details and not success:
            print(f"   오류: {details}")
    
    def test_health_check(self):
        """헬스체크 테스트"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("헬스체크", True, f"상태: {data.get('status')}", response_time)
                return True
            else:
                self.log_test("헬스체크", False, f"HTTP {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("헬스체크", False, str(e))
            return False
    
    def test_chat_api(self):
        """대화 API 테스트"""
        try:
            start_time = time.time()
            payload = {
                "message": "안녕하세요, API 테스트입니다",
                "session_id": self.session_id
            }
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=10
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test("대화 API", True, f"응답 길이: {len(data.get('response', ''))}", response_time)
                    return True
                else:
                    self.log_test("대화 API", False, data.get('error', '알 수 없는 오류'), response_time)
                    return False
            else:
                self.log_test("대화 API", False, f"HTTP {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("대화 API", False, str(e))
            return False
    
    def test_web_search_api(self):
        """웹 검색 API 테스트"""
        try:
            start_time = time.time()
            payload = {
                "query": "Python 프로그래밍",
                "max_results": 3
            }
            response = requests.post(
                f"{self.base_url}/api/web-search",
                json=payload,
                timeout=15
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    result_count = data.get('result_count', 0)
                    self.log_test("웹 검색 API", True, f"결과: {result_count}개", response_time)
                    return True
                else:
                    self.log_test("웹 검색 API", False, data.get('error', '알 수 없는 오류'), response_time)
                    return False
            else:
                self.log_test("웹 검색 API", False, f"HTTP {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("웹 검색 API", False, str(e))
            return False
    
    def test_file_upload_api(self):
        """파일 업로드 API 테스트"""
        try:
            # 테스트 파일 생성
            test_content = "# CORBU.AI 테스트 파일\n\nprint('Hello, CORBU.AI!')\n"
            with open("test_upload_api.py", "w") as f:
                f.write(test_content)
            
            start_time = time.time()
            with open("test_upload_api.py", "rb") as f:
                files = {"file": ("test_upload_api.py", f, "text/plain")}
                response = requests.post(
                    f"{self.base_url}/api/upload",
                    files=files,
                    timeout=10
                )
            response_time = time.time() - start_time
            
            # 테스트 파일 삭제
            os.remove("test_upload_api.py")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    file_info = data.get('file_info', {})
                    analysis = file_info.get('analysis', {})
                    file_type = analysis.get('file_type', 'unknown')
                    self.log_test("파일 업로드 API", True, f"파일 타입: {file_type}", response_time)
                    return True
                else:
                    self.log_test("파일 업로드 API", False, data.get('error', '알 수 없는 오류'), response_time)
                    return False
            else:
                self.log_test("파일 업로드 API", False, f"HTTP {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("파일 업로드 API", False, str(e))
            return False
    
    def test_chat_history_api(self):
        """대화 기록 API 테스트"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/api/chat-history", timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    session_count = data.get('session_count', 0)
                    self.log_test("대화 기록 API", True, f"세션: {session_count}개", response_time)
                    return True
                else:
                    self.log_test("대화 기록 API", False, data.get('error', '알 수 없는 오류'), response_time)
                    return False
            else:
                self.log_test("대화 기록 API", False, f"HTTP {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("대화 기록 API", False, str(e))
            return False
    
    def test_search_chat_api(self):
        """대화 검색 API 테스트"""
        try:
            start_time = time.time()
            payload = {"query": "테스트"}
            response = requests.post(
                f"{self.base_url}/api/search-chat",
                json=payload,
                timeout=5
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    result_count = data.get('result_count', 0)
                    self.log_test("대화 검색 API", True, f"검색 결과: {result_count}개", response_time)
                    return True
                else:
                    self.log_test("대화 검색 API", False, data.get('error', '알 수 없는 오류'), response_time)
                    return False
            else:
                self.log_test("대화 검색 API", False, f"HTTP {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("대화 검색 API", False, str(e))
            return False
    
    def test_service_worker(self):
        """Service Worker 테스트"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/sw.js", timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                content = response.text
                if "CORBU.AI Service Worker" in content:
                    self.log_test("Service Worker", True, "파일 로드 성공", response_time)
                    return True
                else:
                    self.log_test("Service Worker", False, "올바르지 않은 내용", response_time)
                    return False
            else:
                self.log_test("Service Worker", False, f"HTTP {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("Service Worker", False, str(e))
            return False
    
    def test_main_interface(self):
        """메인 인터페이스 테스트"""
        try:
            start_time = time.time()
            response = requests.get(self.base_url, timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                content = response.text
                if "CORBU.AI" in content and "<!DOCTYPE html>" in content:
                    self.log_test("메인 인터페이스", True, "HTML 페이지 로드 성공", response_time)
                    return True
                else:
                    self.log_test("메인 인터페이스", False, "올바르지 않은 HTML", response_time)
                    return False
            else:
                self.log_test("메인 인터페이스", False, f"HTTP {response.status_code}", response_time)
                return False
        except Exception as e:
            self.log_test("메인 인터페이스", False, str(e))
            return False
    
    def run_all_tests(self):
        """모든 테스트 실행"""
        print("🧪 CORBU.AI 전체 API 테스트 시작")
        print("=" * 50)
        
        tests = [
            self.test_health_check,
            self.test_main_interface,
            self.test_service_worker,
            self.test_chat_api,
            self.test_web_search_api,
            self.test_file_upload_api,
            self.test_chat_history_api,
            self.test_search_chat_api
        ]
        
        start_time = time.time()
        
        for test in tests:
            test()
            time.sleep(0.5)  # API 호출 간격
        
        total_time = time.time() - start_time
        
        print("\n" + "=" * 50)
        print("📊 테스트 결과 요약")
        print("=" * 50)
        
        successful_tests = sum(1 for result in self.test_results if result['success'])
        total_tests = len(self.test_results)
        success_rate = (successful_tests / total_tests) * 100
        
        print(f"✅ 성공: {successful_tests}/{total_tests} ({success_rate:.1f}%)")
        print(f"⏱️  총 소요 시간: {total_time:.2f}초")
        
        # 실패한 테스트 상세 정보
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ 실패한 테스트: {len(failed_tests)}개")
            for test in failed_tests:
                print(f"   • {test['test_name']}: {test['details']}")
        
        # 성능 정보
        response_times = [result['response_time'] for result in self.test_results if result['response_time']]
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            print(f"\n⚡ 평균 응답 시간: {avg_response_time:.3f}초")
            print(f"📈 최대 응답 시간: {max_response_time:.3f}초")
        
        # 테스트 결과 저장
        self.save_test_results()
        
        return success_rate >= 90  # 90% 이상 성공 시 전체 테스트 성공
    
    def save_test_results(self):
        """테스트 결과 저장"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"logs/api_test_results_{timestamp}.json"
        
        os.makedirs("logs", exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                "test_session": self.session_id,
                "total_tests": len(self.test_results),
                "successful_tests": sum(1 for r in self.test_results if r['success']),
                "test_results": self.test_results
            }, f, indent=2, ensure_ascii=False)
        
        print(f"📋 테스트 결과 저장: {filename}")

def main():
    tester = CorbuAITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 모든 테스트가 성공적으로 완료되었습니다!")
        return 0
    else:
        print("\n⚠️  일부 테스트가 실패했습니다. 로그를 확인해주세요.")
        return 1

if __name__ == "__main__":
    exit(main())
