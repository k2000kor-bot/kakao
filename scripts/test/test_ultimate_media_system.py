#!/usr/bin/env python3
"""
궁극의 미디어 지식 활용 시스템 테스트 스크립트
"""

import os
import requests
import json
import time
from pathlib import Path

# 통합 main_server(5002) 또는 UMKS 단독 시 CORBU_ULTIMATE_MEDIA_BASE 로 지정
_ULTIMATE_MEDIA_BASE = os.environ.get("CORBU_ULTIMATE_MEDIA_BASE", "http://localhost:5002")

def test_system_health():
    """시스템 상태 확인"""
    print("🔍 시스템 상태 확인 중...")
    try:
        response = requests.get(f"{_ULTIMATE_MEDIA_BASE}/api/v1/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ 시스템 상태: {health_data['status']}")
            print(f"📊 버전: {health_data['version']}")
            print(f"🤖 AI 모델 로드 수: {health_data['ai_models_loaded']}")
            return True
        else:
            print(f"❌ 시스템 상태 확인 실패: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 시스템 연결 실패: {e}")
        return False

def test_media_analysis():
    """미디어 분석 테스트"""
    print("\n📁 미디어 분석 테스트 중...")
    
    # 테스트용 텍스트 파일 생성
    test_file_path = Path("test_media_file.txt")
    test_content = """
    데모 시공사 샘플 재건축 프로젝트
    
    프로젝트 개요:
    - 위치: 서울특별시 강남구 ○○동 (데모)
    - 규모: 총 500세대
    - 시공사: 대우건설
    - 착공일: 2024년 3월
    - 준공예정일: 2027년 12월
    
    주요 특징:
    1. 친환경 건축 설계
    2. 스마트 홈 시스템 적용
    3. 공원 및 편의시설 확충
    4. 교통 접근성 개선
    
    경제적 효과:
    - 지역 경제 활성화
    - 일자리 창출 효과
    - 부동산 가치 상승
    - 세수 증대
    
    이 프로젝트는 지역 주민의 삶의 질 향상과 
    도시 발전에 기여할 것으로 예상됩니다.
    """
    
    with open(test_file_path, "w", encoding="utf-8") as f:
        f.write(test_content)
    
    try:
        # 파일 업로드 및 분석
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_media_file.txt", f, "text/plain")}
            data = {"project_id": "test_project_001"}
            
            response = requests.post(
                f"{_ULTIMATE_MEDIA_BASE}/api/v1/analyze-media",
                files=files,
                data=data
            )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 미디어 분석 성공!")
            print(f"📄 파일명: {result['file_analysis']['file_name']}")
            print(f"📊 미디어 타입: {result['file_analysis']['media_type']}")
            print(f"🧠 지식 타입: {result['extracted_knowledge']['knowledge_type']}")
            print(f"📈 신뢰도: {result['extracted_knowledge']['confidence']:.2f}")
            print(f"🔍 엔터티 수: {len(result['extracted_knowledge']['entities'])}")
            print(f"💡 인사이트 수: {len(result['extracted_knowledge']['insights'])}")
            
            # 설득력 있는 콘텐츠 출력
            print("\n💡 설득력 있는 콘텐츠:")
            print(result['persuasive_content']['content'][:500] + "...")
            
            return True
        else:
            print(f"❌ 미디어 분석 실패: {response.status_code}")
            print(f"오류 메시지: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 미디어 분석 중 오류: {e}")
        return False
    finally:
        # 테스트 파일 정리
        if test_file_path.exists():
            test_file_path.unlink()

def test_knowledge_base():
    """지식 베이스 테스트"""
    print("\n📚 지식 베이스 테스트 중...")
    try:
        response = requests.get(f"{_ULTIMATE_MEDIA_BASE}/api/v1/knowledge-base/test_project_001")
        
        if response.status_code == 200:
            kb_data = response.json()
            print(f"✅ 지식 베이스 조회 성공!")
            print(f"📊 프로젝트 ID: {kb_data['project_id']}")
            print(f"📈 지식 항목 수: {kb_data['knowledge_items']}")
            return True
        else:
            print(f"❌ 지식 베이스 조회 실패: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 지식 베이스 테스트 중 오류: {e}")
        return False

def test_learning_history():
    """학습 히스토리 테스트"""
    print("\n📖 학습 히스토리 테스트 중...")
    try:
        response = requests.get(f"{_ULTIMATE_MEDIA_BASE}/api/v1/learning-history")
        
        if response.status_code == 200:
            history_data = response.json()
            print(f"✅ 학습 히스토리 조회 성공!")
            print(f"📊 총 학습 이벤트: {history_data['total_learning_events']}")
            return True
        else:
            print(f"❌ 학습 히스토리 조회 실패: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 학습 히스토리 테스트 중 오류: {e}")
        return False

def run_performance_test():
    """성능 테스트"""
    print("\n⚡ 성능 테스트 중...")
    
    # 시스템 상태 확인 시간 측정
    start_time = time.time()
    health_success = test_system_health()
    health_time = time.time() - start_time
    
    # 미디어 분석 시간 측정
    start_time = time.time()
    analysis_success = test_media_analysis()
    analysis_time = time.time() - start_time
    
    # 지식 베이스 조회 시간 측정
    start_time = time.time()
    kb_success = test_knowledge_base()
    kb_time = time.time() - start_time
    
    # 학습 히스토리 조회 시간 측정
    start_time = time.time()
    history_success = test_learning_history()
    history_time = time.time() - start_time
    
    print("\n📊 성능 테스트 결과:")
    print(f"🔍 시스템 상태 확인: {health_time:.3f}초 ({'성공' if health_success else '실패'})")
    print(f"📁 미디어 분석: {analysis_time:.3f}초 ({'성공' if analysis_success else '실패'})")
    print(f"📚 지식 베이스 조회: {kb_time:.3f}초 ({'성공' if kb_success else '실패'})")
    print(f"📖 학습 히스토리 조회: {history_time:.3f}초 ({'성공' if history_success else '실패'})")
    
    total_success = sum([health_success, analysis_success, kb_success, history_success])
    total_tests = 4
    
    print(f"\n🎯 전체 테스트 결과: {total_success}/{total_tests} 성공")
    
    if total_success == total_tests:
        print("🎉 모든 테스트가 성공적으로 완료되었습니다!")
        return True
    else:
        print("⚠️ 일부 테스트가 실패했습니다.")
        return False

def main():
    """메인 테스트 실행"""
    print("🚀 궁극의 미디어 지식 활용 시스템 테스트 시작")
    print("=" * 60)
    
    # 시스템 상태 확인
    if not test_system_health():
        print("❌ 시스템이 실행되지 않고 있습니다.")
        print("다음 명령어로 시스템을 시작하세요:")
        print("./start_ultimate_media_system.sh")
        return
    
    # 성능 테스트 실행
    success = run_performance_test()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 시스템 테스트가 성공적으로 완료되었습니다!")
        print("이제 웹 인터페이스에서 시스템을 사용할 수 있습니다.")
        print("http://localhost:3000")
    else:
        print("⚠️ 시스템 테스트 중 일부 문제가 발생했습니다.")
        print("로그를 확인하고 문제를 해결한 후 다시 시도하세요.")

if __name__ == "__main__":
    main()
