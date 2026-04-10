#!/usr/bin/env python3
"""
CORBU.AI 고도화된 AI 시스템 통합 테스트 스크립트
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_api_endpoint(endpoint, method="GET", data=None):
    """API 엔드포인트 테스트"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        if response.status_code == 200:
            result = response.json()
            return True, result
        else:
            return False, f"HTTP {response.status_code}: {response.text}"
    except Exception as e:
        return False, f"연결 오류: {str(e)}"

def test_data_analytics_system():
    """데이터 분석 시스템 테스트"""
    print("🔍 데이터 분석 시스템 테스트 중...")
    
    # 데이터 소스 조회
    success, result = test_api_endpoint("/api/data-analytics/sources")
    if success:
        print(f"✅ 데이터 소스 조회 성공: {len(result.get('data', []))}개 소스")
    else:
        print(f"❌ 데이터 소스 조회 실패: {result}")
    
    # 새 데이터 소스 생성
    new_source = {
        "name": "테스트 데이터 소스",
        "type": "api",
        "url": "https://api.test.com/data"
    }
    success, result = test_api_endpoint("/api/data-analytics/sources", "POST", new_source)
    if success:
        print(f"✅ 데이터 소스 생성 성공: {result.get('data', {}).get('name')}")
    else:
        print(f"❌ 데이터 소스 생성 실패: {result}")
    
    # 분석 작업 조회
    success, result = test_api_endpoint("/api/data-analytics/analyses")
    if success:
        print(f"✅ 분석 작업 조회 성공: {len(result.get('data', []))}개 작업")
    else:
        print(f"❌ 분석 작업 조회 실패: {result}")
    
    # 시각화 조회
    success, result = test_api_endpoint("/api/data-analytics/visualizations")
    if success:
        print(f"✅ 시각화 조회 성공: {len(result.get('data', []))}개 시각화")
    else:
        print(f"❌ 시각화 조회 실패: {result}")
    
    # 인사이트 조회
    success, result = test_api_endpoint("/api/data-analytics/insights")
    if success:
        print(f"✅ 인사이트 조회 성공: {len(result.get('data', []))}개 인사이트")
    else:
        print(f"❌ 인사이트 조회 실패: {result}")
    
    # 메트릭 조회
    success, result = test_api_endpoint("/api/data-analytics/metrics")
    if success:
        metrics = result.get('data', {})
        print(f"✅ 메트릭 조회 성공: {metrics.get('total_sources', 0)}개 소스, {metrics.get('total_analyses', 0)}개 분석")
    else:
        print(f"❌ 메트릭 조회 실패: {result}")

def test_quality_assurance_system():
    """품질 보증 시스템 테스트"""
    print("\n🔍 품질 보증 시스템 테스트 중...")
    
    # 품질 테스트 조회
    success, result = test_api_endpoint("/api/quality-assurance/tests")
    if success:
        print(f"✅ 품질 테스트 조회 성공: {len(result.get('data', []))}개 테스트")
    else:
        print(f"❌ 품질 테스트 조회 실패: {result}")
    
    # 새 품질 테스트 생성
    new_test = {
        "name": "통합 테스트",
        "type": "integration",
        "category": "functionality",
        "priority": "high"
    }
    success, result = test_api_endpoint("/api/quality-assurance/tests", "POST", new_test)
    if success:
        print(f"✅ 품질 테스트 생성 성공: {result.get('data', {}).get('name')}")
    else:
        print(f"❌ 품질 테스트 생성 실패: {result}")
    
    # 품질 메트릭 조회
    success, result = test_api_endpoint("/api/quality-assurance/metrics")
    if success:
        metrics = result.get('data', {})
        print(f"✅ 품질 메트릭 조회 성공: {metrics.get('total_tests', 0)}개 테스트, {metrics.get('passed_tests', 0)}개 통과")
    else:
        print(f"❌ 품질 메트릭 조회 실패: {result}")
    
    # 품질 보고서 조회
    success, result = test_api_endpoint("/api/quality-assurance/reports")
    if success:
        print(f"✅ 품질 보고서 조회 성공: {len(result.get('data', []))}개 보고서")
    else:
        print(f"❌ 품질 보고서 조회 실패: {result}")

def test_emotion_recognition_system():
    """감정 인식 시스템 테스트"""
    print("\n🔍 감정 인식 시스템 테스트 중...")
    
    # 감정 분석 테스트
    emotion_data = {
        "content": "오늘 정말 기분이 좋아요! 프로젝트가 성공적으로 완료되었습니다.",
        "analysis_type": "text",
        "context": {"user_id": "test-user-1"}
    }
    success, result = test_api_endpoint("/api/emotion-recognition/analyze", "POST", emotion_data)
    if success:
        print(f"✅ 감정 분석 성공: {result.get('data', {}).get('dominant_emotion', {}).get('emotion', 'unknown')}")
    else:
        print(f"❌ 감정 분석 실패: {result}")
    
    # 감정 패턴 조회
    success, result = test_api_endpoint("/api/emotion-recognition/patterns?user_id=test-user-1")
    if success:
        print(f"✅ 감정 패턴 조회 성공: {len(result.get('data', []))}개 패턴")
    else:
        print(f"❌ 감정 패턴 조회 실패: {result}")
    
    # 감정 메트릭 조회
    success, result = test_api_endpoint("/api/emotion-recognition/metrics")
    if success:
        metrics = result.get('data', {})
        print(f"✅ 감정 메트릭 조회 성공: {metrics.get('total_analyses', 0)}개 분석")
    else:
        print(f"❌ 감정 메트릭 조회 실패: {result}")

def test_chat_system():
    """대화 시스템 테스트"""
    print("\n🔍 대화 시스템 테스트 중...")
    
    # 대화 메시지 전송
    chat_data = {
        "message": "안녕하세요! AI 시스템이 잘 작동하고 있나요?",
        "user_id": "test-user-1",
        "session_id": "test-session-1"
    }
    success, result = test_api_endpoint("/api/chat", "POST", chat_data)
    if success:
        print(f"✅ 대화 메시지 전송 성공: {result.get('response', '')[:50]}...")
    else:
        print(f"❌ 대화 메시지 전송 실패: {result}")

def test_performance_optimization_system():
    """성능 최적화 시스템 테스트"""
    print("\n🔍 성능 최적화 시스템 테스트 중...")
    
    # 성능 메트릭 조회
    success, result = test_api_endpoint("/api/performance-optimization/metrics")
    if success:
        print(f"✅ 성능 메트릭 조회 성공: {len(result.get('data', []))}개 메트릭")
    else:
        print(f"❌ 성능 메트릭 조회 실패: {result}")
    
    # 새 성능 메트릭 생성
    new_metric = {
        "system": "test_system",
        "metric_type": "cpu",
        "value": 85.5,
        "unit": "%",
        "threshold": 80,
        "status": "warning"
    }
    success, result = test_api_endpoint("/api/performance-optimization/metrics", "POST", new_metric)
    if success:
        print(f"✅ 성능 메트릭 생성 성공: {result.get('data', {}).get('system')}")
    else:
        print(f"❌ 성능 메트릭 생성 실패: {result}")
    
    # 최적화 규칙 조회
    success, result = test_api_endpoint("/api/performance-optimization/rules")
    if success:
        print(f"✅ 최적화 규칙 조회 성공: {len(result.get('data', []))}개 규칙")
    else:
        print(f"❌ 최적화 규칙 조회 실패: {result}")
    
    # 새 최적화 규칙 생성
    new_rule = {
        "name": "테스트 최적화 규칙",
        "description": "테스트를 위한 최적화 규칙입니다.",
        "condition": {
            "metric_type": "memory",
            "operator": "gt",
            "threshold": 90,
            "duration": 60
        },
        "action": {
            "type": "optimize",
            "parameters": {"action": "garbage_collection"}
        },
        "priority": "high"
    }
    success, result = test_api_endpoint("/api/performance-optimization/rules", "POST", new_rule)
    if success:
        print(f"✅ 최적화 규칙 생성 성공: {result.get('data', {}).get('name')}")
    else:
        print(f"❌ 최적화 규칙 생성 실패: {result}")
    
    # 시스템 상태 조회
    success, result = test_api_endpoint("/api/performance-optimization/health")
    if success:
        health_data = result.get('data', {})
        print(f"✅ 시스템 상태 조회 성공: {health_data.get('overall_status', 'unknown')}")
    else:
        print(f"❌ 시스템 상태 조회 실패: {result}")
    
    # 수동 최적화 수행
    optimization_data = {
        "type": "scale",
        "parameters": {"scale_factor": 1.2, "target": "cpu"}
    }
    success, result = test_api_endpoint("/api/performance-optimization/optimize", "POST", optimization_data)
    if success:
        print(f"✅ 수동 최적화 성공: {result.get('data', {}).get('type')}")
    else:
        print(f"❌ 수동 최적화 실패: {result}")
    
    # 성능 보고서 생성
    success, result = test_api_endpoint("/api/performance-optimization/report")
    if success:
        report_data = result.get('data', {})
        print(f"✅ 성능 보고서 생성 성공: {report_data.get('metrics_count', 0)}개 메트릭")
    else:
        print(f"❌ 성능 보고서 생성 실패: {result}")

def main():
    """메인 테스트 함수"""
    print("🚀 CORBU.AI 고도화된 AI 시스템 통합 테스트 시작")
    print("=" * 60)
    print(f"테스트 시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # 각 시스템별 테스트 실행
    test_data_analytics_system()
    test_quality_assurance_system()
    test_emotion_recognition_system()
    test_chat_system()
    test_performance_optimization_system()
    
    print("\n" + "=" * 60)
    print(f"테스트 완료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🎉 모든 테스트가 완료되었습니다!")
    print("=" * 60)

if __name__ == "__main__":
    main()
