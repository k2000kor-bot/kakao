#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
CORBU AI 대화형 품질 보증 시스템 - 최종 데모 테스트
"""

import requests
import json
import time
from datetime import datetime

class QualityAssuranceDemo:
    """품질 보증 시스템 데모 클래스"""
    
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.test_results = []
        
    def test_api_health(self):
        """API 헬스 체크 테스트"""
        print("🔍 API 헬스 체크 테스트...")
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 서버 상태: {data['status']}")
                print(f"✅ 서비스: {data['service']}")
                return True
            else:
                print(f"❌ 헬스 체크 실패: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ API 연결 오류: {e}")
            return False
    
    def test_chat_api(self, message):
        """채팅 API 테스트"""
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                headers={"Content-Type": "application/json"},
                json={"message": message}
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'response': data['response'],
                    'type': data.get('type', 'unknown'),
                    'timestamp': data.get('timestamp', '')
                }
            else:
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}",
                    'response': response.text
                }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'response': ''
            }
    
    def test_quality_metrics_api(self):
        """품질 메트릭 API 테스트"""
        try:
            response = requests.get(f"{self.base_url}/api/quality-assurance/metrics")
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': data['data'],
                    'timestamp': data.get('timestamp', '')
                }
            else:
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}"
                }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def test_test_suites_api(self):
        """테스트 스위트 API 테스트"""
        try:
            response = requests.get(f"{self.base_url}/api/quality-assurance/test-suites")
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'data': data['data'],
                    'timestamp': data.get('timestamp', '')
                }
            else:
                return {
                    'success': False,
                    'error': f"HTTP {response.status_code}"
                }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def run_conversational_demo(self):
        """대화형 데모 실행"""
        print("🚀 CORBU AI 대화형 품질 보증 시스템 데모 시작")
        print("=" * 60)
        
        # 테스트 시나리오
        test_scenarios = [
            {
                'name': '시스템 소개',
                'message': 'CORBU AI 품질 보증 시스템에 대해 알려주세요',
                'expected_type': 'quality_assurance'
            },
            {
                'name': '테스트 스위트 목록',
                'message': '테스트 스위트 목록을 보여주세요',
                'expected_type': 'quality_assurance'
            },
            {
                'name': '품질 메트릭 조회',
                'message': '현재 품질 메트릭을 보여주세요',
                'expected_type': 'quality_assurance'
            },
            {
                'name': '성능 분석',
                'message': '성능 분석 결과를 보여주세요',
                'expected_type': 'quality_assurance'
            },
            {
                'name': '실행 상태 확인',
                'message': '현재 실행 상태를 확인해주세요',
                'expected_type': 'quality_assurance'
            },
            {
                'name': '일반 대화',
                'message': '안녕하세요',
                'expected_type': 'general'
            }
        ]
        
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n📝 테스트 {i}: {scenario['name']}")
            print("-" * 40)
            print(f"질문: {scenario['message']}")
            
            result = self.test_chat_api(scenario['message'])
            
            if result['success']:
                print(f"✅ 응답 타입: {result['type']}")
                print(f"✅ 응답 내용:")
                print(result['response'])
                
                # 결과 저장
                self.test_results.append({
                    'scenario': scenario['name'],
                    'question': scenario['message'],
                    'response': result['response'],
                    'type': result['type'],
                    'success': True,
                    'timestamp': result['timestamp']
                })
            else:
                print(f"❌ 오류: {result['error']}")
                self.test_results.append({
                    'scenario': scenario['name'],
                    'question': scenario['message'],
                    'error': result['error'],
                    'success': False
                })
            
            time.sleep(1)  # API 호출 간격
    
    def run_api_tests(self):
        """API 엔드포인트 테스트"""
        print("\n🔧 API 엔드포인트 테스트")
        print("=" * 40)
        
        # 품질 메트릭 API 테스트
        print("\n📊 품질 메트릭 API 테스트...")
        metrics_result = self.test_quality_metrics_api()
        if metrics_result['success']:
            print("✅ 품질 메트릭 조회 성공")
            metrics = metrics_result['data']
            print(f"   • 테스트 스위트: {metrics['total_test_suites']}개")
            print(f"   • 전체 통과율: {metrics['overall_pass_rate']*100:.1f}%")
            print(f"   • 테스트 커버리지: {metrics['test_coverage']*100:.1f}%")
        else:
            print(f"❌ 품질 메트릭 조회 실패: {metrics_result['error']}")
        
        # 테스트 스위트 API 테스트
        print("\n🧪 테스트 스위트 API 테스트...")
        suites_result = self.test_test_suites_api()
        if suites_result['success']:
            print("✅ 테스트 스위트 조회 성공")
            suites = suites_result['data']
            print(f"   • 총 {len(suites)}개의 테스트 스위트")
            for suite in suites:
                print(f"   • {suite['name']}: {suite['status']} (통과율: {suite['passRate']}%)")
        else:
            print(f"❌ 테스트 스위트 조회 실패: {suites_result['error']}")
    
    def generate_demo_report(self):
        """데모 결과 보고서 생성"""
        print("\n📋 데모 결과 보고서")
        print("=" * 40)
        
        total_tests = len(self.test_results)
        successful_tests = len([r for r in self.test_results if r['success']])
        success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"총 테스트 수: {total_tests}")
        print(f"성공한 테스트: {successful_tests}")
        print(f"성공률: {success_rate:.1f}%")
        
        print("\n📊 테스트 결과 상세:")
        for i, result in enumerate(self.test_results, 1):
            status = "✅ 성공" if result['success'] else "❌ 실패"
            print(f"{i}. {result['scenario']} - {status}")
            if result['success']:
                print(f"   타입: {result['type']}")
                print(f"   응답 길이: {len(result['response'])} 문자")
        
        # 결과를 JSON 파일로 저장
        report_data = {
            'demo_timestamp': datetime.now().isoformat(),
            'total_tests': total_tests,
            'successful_tests': successful_tests,
            'success_rate': success_rate,
            'test_results': self.test_results
        }
        
        with open('quality_assurance_demo_report.json', 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"\n💾 데모 보고서가 'quality_assurance_demo_report.json' 파일에 저장되었습니다.")
        
        return success_rate >= 80  # 80% 이상 성공 시 데모 성공으로 간주
    
    def run_full_demo(self):
        """전체 데모 실행"""
        print("🎯 CORBU AI 대화형 품질 보증 시스템 - 최종 데모")
        print("=" * 60)
        
        # 1. API 헬스 체크
        if not self.test_api_health():
            print("❌ API 서버가 실행되지 않았습니다. 서버를 먼저 시작해주세요.")
            return False
        
        # 2. 대화형 데모 실행
        self.run_conversational_demo()
        
        # 3. API 엔드포인트 테스트
        self.run_api_tests()
        
        # 4. 결과 보고서 생성
        demo_success = self.generate_demo_report()
        
        if demo_success:
            print("\n🎉 데모 성공! CORBU AI 대화형 품질 보증 시스템이 정상적으로 작동합니다.")
            print("\n📱 사용 방법:")
            print("• 웹 브라우저: http://localhost:3001")
            print("• API 서버: http://localhost:5000")
            print("• 데모 HTML: conversational_quality_assurance_demo.html")
        else:
            print("\n⚠️ 데모에 일부 문제가 있었습니다. 로그를 확인해주세요.")
        
        return demo_success

def main():
    """메인 함수"""
    demo = QualityAssuranceDemo()
    success = demo.run_full_demo()
    
    if success:
        print("\n🚀 시스템이 성공적으로 실행되었습니다!")
        print("이제 브라우저에서 http://localhost:3001 에 접속하여")
        print("'대화형 품질 보증' 메뉴를 선택하시면 됩니다.")
    else:
        print("\n❌ 시스템 실행에 문제가 있었습니다.")
        print("로그를 확인하고 서버 상태를 점검해주세요.")

if __name__ == "__main__":
    main()
