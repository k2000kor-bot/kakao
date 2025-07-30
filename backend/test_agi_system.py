#!/usr/bin/env python3
"""
AGI 시스템 테스트 스크립트 v1.0
- 통합 AGI 시스템 기능 테스트
- 실제 카카오톡 대화 시나리오 시뮬레이션
"""

import asyncio
import json
import requests
import time
from datetime import datetime
from typing import Dict, List, Any

# 테스트 시나리오들
TEST_SCENARIOS = [
    {
        "name": "기본 인사 대화",
        "user_message": "안녕하세요!",
        "expected_response_type": "greeting",
        "creativity_level": 0.5
    },
    {
        "name": "감정적 지원 요청",
        "user_message": "오늘 회사에서 너무 힘들었어 😢",
        "expected_response_type": "emotional_support",
        "creativity_level": 0.7
    },
    {
        "name": "질문 대화",
        "user_message": "AI가 어떻게 작동하는지 궁금해요?",
        "expected_response_type": "explanation",
        "creativity_level": 0.6
    },
    {
        "name": "창의적 대화",
        "user_message": "새로운 아이디어를 찾고 있어요",
        "expected_response_type": "creative_suggestion",
        "creativity_level": 0.9
    },
    {
        "name": "복잡한 상황",
        "user_message": "친구와 다퉈서 기분이 안 좋아요. 어떻게 화해하면 좋을까요?",
        "expected_response_type": "advice",
        "creativity_level": 0.8
    }
]

class AGISystemTester:
    """AGI 시스템 테스터"""
    
    def __init__(self, base_url: str = "http://localhost:8010"):
        self.base_url = base_url
        self.test_results = []
        
    async def test_system_health(self) -> bool:
        """시스템 헬스 체크"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ 시스템 헬스 체크 통과")
                return True
            else:
                print(f"❌ 시스템 헬스 체크 실패: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ 시스템 연결 실패: {str(e)}")
            return False
    
    async def test_conversation_api(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        """대화 API 테스트"""
        try:
            # 요청 데이터 구성
            request_data = {
                "user_message": scenario["user_message"],
                "conversation_context": {
                    "conversation_id": f"test_{int(time.time())}",
                    "participants": ["사용자", "AI"],
                    "current_topic": "테스트",
                    "emotion_state": {"neutral": 0.5},
                    "message_history": []
                },
                "creativity_level": scenario["creativity_level"]
            }
            
            # API 호출
            response = requests.post(
                f"{self.base_url}/api/v1/conversation",
                json=request_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "scenario": scenario["name"],
                    "user_message": scenario["user_message"],
                    "ai_response": result["response_message"],
                    "confidence_score": result["confidence_score"],
                    "creativity_score": result["creativity_score"],
                    "processing_time": result["processing_time"],
                    "predictions": result["predictions"],
                    "learning_outcome": result["learning_outcome"]
                }
            else:
                return {
                    "success": False,
                    "scenario": scenario["name"],
                    "error": f"API 호출 실패: {response.status_code}",
                    "response": response.text
                }
                
        except Exception as e:
            return {
                "success": False,
                "scenario": scenario["name"],
                "error": f"테스트 실패: {str(e)}"
            }
    
    async def test_analytics_api(self) -> Dict[str, Any]:
        """분석 API 테스트"""
        try:
            response = requests.get(f"{self.base_url}/api/v1/analytics", timeout=5)
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "analytics": result
                }
            else:
                return {
                    "success": False,
                    "error": f"분석 API 실패: {response.status_code}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"분석 API 테스트 실패: {str(e)}"
            }
    
    async def test_capabilities_api(self) -> Dict[str, Any]:
        """능력 API 테스트"""
        try:
            response = requests.get(f"{self.base_url}/api/v1/capabilities", timeout=5)
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "capabilities": result["capabilities"]
                }
            else:
                return {
                    "success": False,
                    "error": f"능력 API 실패: {response.status_code}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"능력 API 테스트 실패: {str(e)}"
            }
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """모든 테스트 실행"""
        print("🚀 AGI 시스템 테스트 시작...")
        print("=" * 50)
        
        # 1. 시스템 헬스 체크
        health_ok = await self.test_system_health()
        if not health_ok:
            print("❌ 시스템이 실행되지 않았습니다. 먼저 시스템을 시작해주세요.")
            return {"success": False, "error": "시스템 연결 실패"}
        
        print("\n" + "=" * 50)
        print("📝 대화 시나리오 테스트")
        print("=" * 50)
        
        # 2. 대화 시나리오 테스트
        conversation_results = []
        for i, scenario in enumerate(TEST_SCENARIOS, 1):
            print(f"\n{i}. {scenario['name']} 테스트 중...")
            result = await self.test_conversation_api(scenario)
            conversation_results.append(result)
            
            if result["success"]:
                print(f"✅ 성공: {result['ai_response'][:50]}...")
                print(f"   신뢰도: {result['confidence_score']:.2f}")
                print(f"   창의성: {result['creativity_score']:.2f}")
                print(f"   처리시간: {result['processing_time']:.2f}초")
            else:
                print(f"❌ 실패: {result['error']}")
            
            # 테스트 간 간격
            time.sleep(1)
        
        print("\n" + "=" * 50)
        print("📊 분석 API 테스트")
        print("=" * 50)
        
        # 3. 분석 API 테스트
        analytics_result = await self.test_analytics_api()
        if analytics_result["success"]:
            print("✅ 분석 API 테스트 성공")
            analytics = analytics_result["analytics"]
            print(f"   총 대화 수: {analytics.get('total_conversations', 0)}")
            print(f"   평균 신뢰도: {analytics.get('average_confidence', 0):.2f}")
            print(f"   평균 창의성: {analytics.get('average_creativity', 0):.2f}")
        else:
            print(f"❌ 분석 API 테스트 실패: {analytics_result['error']}")
        
        print("\n" + "=" * 50)
        print("🎯 능력 API 테스트")
        print("=" * 50)
        
        # 4. 능력 API 테스트
        capabilities_result = await self.test_capabilities_api()
        if capabilities_result["success"]:
            print("✅ 능력 API 테스트 성공")
            capabilities = capabilities_result["capabilities"]
            for capability, info in capabilities.items():
                print(f"   {capability}: {info['description']} ({info['strength']})")
        else:
            print(f"❌ 능력 API 테스트 실패: {capabilities_result['error']}")
        
        # 결과 요약
        successful_conversations = sum(1 for r in conversation_results if r["success"])
        total_conversations = len(conversation_results)
        
        print("\n" + "=" * 50)
        print("📋 테스트 결과 요약")
        print("=" * 50)
        print(f"✅ 성공한 대화: {successful_conversations}/{total_conversations}")
        print(f"✅ 분석 API: {'성공' if analytics_result['success'] else '실패'}")
        print(f"✅ 능력 API: {'성공' if capabilities_result['success'] else '실패'}")
        
        overall_success = (
            health_ok and 
            successful_conversations > 0 and 
            analytics_result["success"] and 
            capabilities_result["success"]
        )
        
        if overall_success:
            print("\n🎉 모든 테스트가 성공적으로 완료되었습니다!")
            print("AGI 시스템이 정상적으로 작동하고 있습니다.")
        else:
            print("\n⚠️ 일부 테스트가 실패했습니다.")
            print("시스템 상태를 확인해주세요.")
        
        return {
            "success": overall_success,
            "health_check": health_ok,
            "conversation_results": conversation_results,
            "analytics_result": analytics_result,
            "capabilities_result": capabilities_result,
            "summary": {
                "total_conversations": total_conversations,
                "successful_conversations": successful_conversations,
                "success_rate": successful_conversations / total_conversations if total_conversations > 0 else 0
            }
        }

async def main():
    """메인 테스트 함수"""
    tester = AGISystemTester()
    results = await tester.run_all_tests()
    
    # 결과를 JSON 파일로 저장
    with open("test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 테스트 결과가 'test_results.json' 파일에 저장되었습니다.")

if __name__ == "__main__":
    asyncio.run(main()) 