#!/usr/bin/env python3
"""
새로 추가된 백엔드 기능 테스트 스크립트
"""

import requests
import json
import time
from datetime import datetime

class NewFeaturesTester:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.test_results = []
        
    def test_voice_recognition(self):
        """음성 인식 기능 테스트"""
        print("🔍 음성 인식 기능 테스트...")
        try:
            # 음성 인식 시작
            response = requests.post(f"{self.base_url}/api/v7/voice/start-recognition", timeout=10)
            if response.status_code == 200:
                print("✅ 음성 인식 시작 성공")
                
                # 음성 인식 결과 조회
                response = requests.get(f"{self.base_url}/api/v7/voice/results", timeout=10)
                if response.status_code == 200:
                    print("✅ 음성 인식 결과 조회 성공")
                    return True
                else:
                    print(f"❌ 음성 인식 결과 조회 실패: {response.status_code}")
                    return False
            else:
                print(f"❌ 음성 인식 시작 실패: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 음성 인식 테스트 실패: {e}")
            return False
    
    def test_image_analysis(self):
        """이미지 분석 기능 테스트"""
        print("🔍 이미지 분석 기능 테스트...")
        try:
            # Base64 이미지 분석 (시뮬레이션)
            test_data = {
                "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            }
            response = requests.post(
                f"{self.base_url}/api/v7/image/analyze-base64",
                json=test_data,
                timeout=10
            )
            if response.status_code == 200:
                print("✅ 이미지 분석 성공")
                return True
            else:
                print(f"❌ 이미지 분석 요청 실패: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 이미지 분석 테스트 실패: {e}")
            return False
    
    def test_predictive_analytics(self):
        """예측 분석 기능 테스트"""
        print("🔍 예측 분석 기능 테스트...")
        try:
            # 사용자 활동 예측
            test_data = {
                "user_data": {
                    "message_count": 10,
                    "response_time": 5.2,
                    "engagement_level": "high"
                }
            }
            response = requests.post(
                f"{self.base_url}/api/v7/predict/user-activity",
                json=test_data,
                timeout=10
            )
            if response.status_code == 200:
                print("✅ 사용자 활동 예측 성공")
                return True
            else:
                print(f"❌ 사용자 활동 예측 요청 실패: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 예측 분석 테스트 실패: {e}")
            return False
    
    def test_prediction_summary(self):
        """예측 분석 요약 테스트"""
        print("🔍 예측 분석 요약 테스트...")
        try:
            response = requests.get(f"{self.base_url}/api/v7/predict/summary", timeout=10)
            if response.status_code == 200:
                print("✅ 예측 분석 요약 성공")
                return True
            else:
                print(f"❌ 예측 분석 요약 요청 실패: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 예측 분석 요약 테스트 실패: {e}")
            return False
    
    def run_all_tests(self):
        """모든 테스트 실행"""
        print("🚀 새로 추가된 백엔드 기능 테스트 시작")
        print("=" * 50)
        
        # 테스트 실행
        tests = [
            ("음성 인식", self.test_voice_recognition),
            ("이미지 분석", self.test_image_analysis),
            ("예측 분석", self.test_predictive_analytics),
            ("예측 분석 요약", self.test_prediction_summary)
        ]
        
        for test_name, test_func in tests:
            result = test_func()
            self.test_results.append((test_name, result))
            print()
        
        # 결과 요약
        self.print_summary()
    
    def print_summary(self):
        """테스트 결과 요약 출력"""
        print("=" * 50)
        print("📊 새로 추가된 기능 테스트 결과 요약:")
        print("=" * 50)
        
        success_count = 0
        for test_name, result in self.test_results:
            status = "✅ 성공" if result else "❌ 실패"
            print(f"   {test_name}: {status}")
            if result:
                success_count += 1
        
        success_rate = (success_count / len(self.test_results)) * 100
        print(f"\n📈 전체 성공률: {success_rate:.1f}% ({success_count}/{len(self.test_results)})")
        
        if success_rate == 100:
            print("🎉 모든 새로운 기능이 정상 작동합니다!")
        elif success_rate >= 75:
            print("✅ 대부분의 기능이 정상 작동합니다.")
        elif success_rate >= 50:
            print("⚠️ 일부 기능에 문제가 있습니다.")
        else:
            print("❌ 많은 기능에 문제가 있습니다.")
        
        print(f"\n⏰ 테스트 완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    tester = NewFeaturesTester()
    tester.run_all_tests() 