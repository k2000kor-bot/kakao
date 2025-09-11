#!/usr/bin/env python3
"""
ChatGPT 분석 API 테스트 클라이언트
"""

import requests
import json

def test_chatgpt_analysis():
    """ChatGPT 분석 API 테스트"""
    
    # 테스트 데이터
    test_data = {
        "content": "2025년 7월 12일부터 7월 14일 기준, 행복한소유☆개포우성7차의 대화 내용입니다. 0116: 특정 참여자가 삼성 논리만 대변한다고 지적하며 \"대우 장점도 언급하라\"고 요구. 0024: \"익명방에서 이지매처럼 특정인 몰아가는 방식은 부적절하다\"며 반박. 0036: '92번님'의 과거 발언을 인용해 \"편파적이다\", \"이사일 경우 더 문제가 된다\"는 우려 제기.",
        "room_id": "room_001",
        "time_range": {
            "startDate": "2025-07-12",
            "endDate": "2025-07-14",
            "startTime": "00:00",
            "endTime": "23:59"
        },
        "analysis_mode": "comprehensive",
        "ai_analysis": True,
        "predictive_mode": True
    }
    
    try:
        # API 호출
        response = requests.post(
            "http://localhost:8000/api/v7/chatgpt/analyze",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result["success"]:
                print("✅ ChatGPT 분석 API 테스트 성공!")
                print("\n📊 분석 결과 요약:")
                
                # 분석 요약 출력
                summary = result["분석_결과"]["분석_요약"]
                print(f"• 총 이슈 수: {summary['총_이슈_수']}")
                print(f"• 높은 갈등 이슈: {summary['높은_갈등_이슈']}")
                print(f"• 긴급 이슈: {summary['긴급_이슈']}")
                print(f"• 채팅방: {summary['채팅방_정보']['방_이름']}")
                print(f"• 총 참여자: {summary['채팅방_정보']['총_참여자']}명")
                print(f"• 총 메시지: {summary['채팅방_정보']['총_메시지']}개")
                
                # 주요 이슈 출력
                print("\n🔥 주요 이슈 분석:")
                for i, issue in enumerate(result["분석_결과"]["주요_이슈_분석"], 1):
                    print(f"\n{i}. {issue['이슈_제목']}")
                    print(f"   • 갈등 수준: {issue['갈등_수준']}")
                    print(f"   • 긴급도: {issue['긴급도']}")
                    print(f"   • 요약: {issue['요약']}")
                    
                    # 주요 참여자
                    print("   • 주요 참여자:")
                    for participant in issue['주요_참여자'][:3]:  # 상위 3명만
                        print(f"     - {participant['참여자_ID']}: {participant['주요_발언'][:50]}...")
                
                # 참여자 분석
                print("\n👥 참여자 분석:")
                participants = result["분석_결과"]["참여자_분석"]["주요_참여자_순위"]
                for participant in participants:
                    print(f"• {participant['순위']}위: {participant['참여자_ID']} (영향력: {participant['영향력_점수']:.1f})")
                
                # 시공사 편향성 분석
                print("\n🏗️ 시공사 편향성 분석:")
                bias_analysis = result["분석_결과"]["시공사_편향성_종합_분석"]
                for company, data in bias_analysis.items():
                    print(f"• {company}: 편향점수 {data['편향_점수']:.1f} ({data['편향_유형']})")
                
                # AI 인사이트 (있는 경우)
                if "AI_인사이트" in result["분석_결과"]:
                    print("\n🤖 AI 인사이트:")
                    ai_insights = result["분석_결과"]["AI_인사이트"]
                    
                    if "패턴_감지" in ai_insights:
                        print("• 패턴 감지:")
                        for pattern in ai_insights["패턴_감지"]:
                            print(f"  - {pattern['제목']} (신뢰도: {pattern['신뢰도']:.1%})")
                    
                    if "위험_예측" in ai_insights:
                        print("• 위험 예측:")
                        for risk in ai_insights["위험_예측"]:
                            print(f"  - {risk['제목']} (긴급도: {risk['긴급도']})")
                
                # 예측 분석 (있는 경우)
                if "예측_분석" in result["분석_결과"]:
                    print("\n🔮 예측 분석:")
                    predictions = result["분석_결과"]["예측_분석"]
                    
                    if "갈등_예측" in predictions:
                        conflict = predictions["갈등_예측"]
                        print(f"• 현재 갈등 확률: {conflict['현재_갈등_확률']:.1%}")
                        print(f"• 24시간 후 예측: {conflict['24시간_후_예측']:.1%}")
                        print(f"• 예상 해결 시간: {conflict['예상_해결_시간']}")
                
                # 시스템 성능
                print("\n⚙️ 시스템 성능:")
                performance = result["분석_결과"]["시스템_성능"]
                print(f"• 분석 정확도: {performance['분석_정확도']:.1f}%")
                print(f"• AI 감정 분석 정확도: {performance['AI_모델_성능']['감정_분석_정확도']:.1f}%")
                print(f"• 편향 감지 정확도: {performance['AI_모델_성능']['편향_감지_정확도']:.1f}%")
                
                # JSON 형태로도 출력 (ChatGPT에서 사용할 수 있도록)
                print("\n📋 ChatGPT용 JSON 결과:")
                print(json.dumps(result["분석_결과"], ensure_ascii=False, indent=2))
                
            else:
                print(f"❌ 분석 실패: {result.get('error', '알 수 없는 오류')}")
                if 'usage' in result:
                    print(f"사용법: {result['usage']}")
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            print(f"응답: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.")
        print("서버 시작: cd backend && python3 simple_api_server.py")
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")

def test_simple_analysis():
    """간단한 분석 테스트"""
    
    simple_data = {
        "content": "0116: 삼성물산이 좋다고 생각합니다. 0024: 대우건설도 고려해보세요. 0036: 편파적 발언은 부적절합니다.",
        "room_id": "test_room",
        "analysis_mode": "quick",
        "ai_analysis": False,
        "predictive_mode": False
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v7/chatgpt/analyze",
            json=simple_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result["success"]:
                print("✅ 간단한 분석 테스트 성공!")
                print(f"총 이슈 수: {result['분석_결과']['분석_요약']['총_이슈_수']}")
            else:
                print(f"❌ 간단한 분석 실패: {result.get('error')}")
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print(f"❌ 간단한 분석 오류: {str(e)}")

if __name__ == "__main__":
    print("🚀 ChatGPT 분석 API 테스트 시작")
    print("=" * 50)
    
    # 간단한 테스트 먼저
    print("\n1. 간단한 분석 테스트:")
    test_simple_analysis()
    
    # 전체 테스트
    print("\n2. 전체 분석 테스트:")
    test_chatgpt_analysis()
    
    print("\n" + "=" * 50)
    print("✅ 테스트 완료!")
    print("\n💡 ChatGPT에서 사용하는 방법:")
    print("1. 위의 JSON 결과를 복사")
    print("2. ChatGPT 대화창에 붙여넣기")
    print("3. \"이 분석 결과를 요약해줘\" 또는 \"주요 이슈를 정리해줘\" 등으로 요청") 