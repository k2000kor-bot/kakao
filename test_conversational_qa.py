#!/usr/bin/env python3
"""
대화형 QA 기능 테스트 스크립트
"""

import requests
import json

def test_conversational_qa():
    """대화형 QA API 테스트"""
    
    # 테스트 질문들
    test_questions = [
        "개포우성 재개발 프로젝트의 현재 진행 상황은 어떻나요?",
        "재개발 투자의 위험 요소는 무엇인가요?",
        "개포우성 지역의 부동산 시세는 어떻게 되나요?",
        "재개발 관련 법규의 주요 내용은 무엇인가요?",
        "개포우성 재개발의 향후 전망은 어떻나요?"
    ]
    
    print("💬 대화형 QA 기능 테스트 시작...\n")
    
    for i, question in enumerate(test_questions, 1):
        print(f"=== 테스트 {i}: {question} ===")
        
        # API 호출
        try:
            response = requests.post(
                "http://localhost:5001/api/conversational/qa",
                json={
                    "question": question,
                    "context": {
                        "project_id": "gaeposung_project",
                        "user_id": "test_user",
                        "session_id": "test_session"
                    }
                },
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ API 호출 성공!")
                print(f"질문 유형: {result['result']['question_analysis']['question_type']}")
                print(f"의도: {result['result']['question_analysis']['intent']}")
                print(f"키워드: {', '.join(result['result']['question_analysis']['keywords'])}")
                print(f"답변 신뢰도: {result['result']['confidence'] * 100:.1f}%")
                print(f"후속 질문 수: {len(result['result']['follow_up_questions'])}")
                print(f"관련 주제 수: {len(result['result']['related_topics'])}")
                
                # 답변 미리보기
                answer_preview = result['result']['answer'][:100] + "..." if len(result['result']['answer']) > 100 else result['result']['answer']
                print(f"답변 미리보기: {answer_preview}")
                
            else:
                print(f"❌ API 호출 실패: {response.status_code}")
                print(f"응답: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.")
        except requests.exceptions.Timeout:
            print("❌ 요청 시간 초과")
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
        
        print("\n" + "="*50 + "\n")

def test_knowledge_addition():
    """지식 베이스 추가 테스트"""
    
    print("📚 지식 베이스 추가 테스트...\n")
    
    test_knowledge = [
        {
            "topic": "개포우성 재개발 현황",
            "content": "개포우성 재개발 프로젝트는 현재 1단계 사업이 진행 중이며, 주민 동의율이 85%를 달성했습니다. 2024년 말까지 기본계획 수립을 완료할 예정입니다.",
            "source_type": "official",
            "relevance_score": 0.9,
            "confidence": 0.95
        },
        {
            "topic": "재개발 투자 위험",
            "content": "재개발 투자의 주요 위험 요소는 주민 동의율 미달성, 법적 분쟁, 시장 상황 변화, 자금 조달 문제 등이 있습니다. 특히 주민 동의율이 80% 미만일 경우 사업이 중단될 수 있습니다.",
            "source_type": "analysis",
            "relevance_score": 0.85,
            "confidence": 0.9
        }
    ]
    
    for i, knowledge in enumerate(test_knowledge, 1):
        print(f"=== 지식 추가 {i}: {knowledge['topic']} ===")
        
        try:
            response = requests.post(
                "http://localhost:5001/api/conversational/knowledge",
                json=knowledge,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ 지식 베이스 추가 성공!")
                print(f"메시지: {result['message']}")
            else:
                print(f"❌ 지식 베이스 추가 실패: {response.status_code}")
                print(f"응답: {response.text}")
                
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
        
        print()

if __name__ == "__main__":
    print("🚀 대화형 QA 시스템 테스트 시작\n")
    
    # 1. 지식 베이스에 정보 추가
    test_knowledge_addition()
    
    # 2. 대화형 QA 테스트
    test_conversational_qa()
    
    print("🎉 테스트 완료!")
