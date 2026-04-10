#!/usr/bin/env python3
"""
인터랙티브 ChatGPT 유사성 테스트
- 실제 대화를 통한 응답 품질 확인
- ChatGPT와 유사한 응답 생성 테스트
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any, List

from simplified_ultra_message_system import (
    SimplifiedMessageGenerator, 
    SimplifiedEmotionAnalysis, 
    EmotionType
)

class InteractiveChatTester:
    """인터랙티브 대화 테스터"""
    
    def __init__(self):
        self.generator = SimplifiedMessageGenerator()
        self.conversation_history = []
        self.test_results = []
        
    async def start_interactive_test(self):
        """인터랙티브 테스트 시작"""
        print("🤖 ChatGPT 유사성 인터랙티브 테스트")
        print("=" * 50)
        print("💡 사용법:")
        print("- 메시지를 입력하면 ChatGPT 스타일 응답을 생성합니다")
        print("- 'quit' 또는 'exit'를 입력하면 종료됩니다")
        print("- 'history'를 입력하면 대화 기록을 확인합니다")
        print("- 'test'를 입력하면 유사도 테스트를 실행합니다")
        print("=" * 50)
        
        while True:
            try:
                # 사용자 입력
                user_input = input("\n👤 사용자: ").strip()
                
                if user_input.lower() in ['quit', 'exit', '종료']:
                    print("👋 테스트를 종료합니다. 감사합니다!")
                    break
                    
                elif user_input.lower() == 'history':
                    self.show_conversation_history()
                    continue
                    
                elif user_input.lower() == 'test':
                    await self.run_similarity_test()
                    continue
                    
                elif not user_input:
                    print("❌ 메시지를 입력해주세요.")
                    continue
                
                # 응답 생성
                print("🤖 AI가 응답을 생성하는 중...")
                response = await self.generate_response(user_input)
                
                # 결과 저장
                self.conversation_history.append({
                    "user": user_input,
                    "ai": response,
                    "timestamp": datetime.now().isoformat()
                })
                
                print(f"🤖 AI: {response}")
                
            except KeyboardInterrupt:
                print("\n👋 테스트를 종료합니다.")
                break
            except Exception as e:
                print(f"❌ 오류 발생: {e}")
        
        # 최종 결과 저장
        self.save_test_results()
    
    async def generate_response(self, user_input: str) -> str:
        """응답 생성"""
        try:
            # 감정 분석 (간단한 모의)
            emotion = self.analyze_emotion_simple(user_input)
            
            # 메시지 생성
            response = await self.generator.generate_message(user_input, emotion)
            
            return response
            
        except Exception as e:
            return f"죄송합니다. 응답 생성 중 오류가 발생했습니다: {str(e)}"
    
    def analyze_emotion_simple(self, text: str) -> SimplifiedEmotionAnalysis:
        """간단한 감정 분석"""
        # 간단한 키워드 기반 감정 분석
        positive_words = ['좋', '기쁘', '만족', '감사', '축하', '성공', '훌륭']
        negative_words = ['힘들', '어려', '불만', '실패', '우려', '걱정', '화나']
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            emotion_type = EmotionType.JOY
            intensity = min(0.8, positive_count * 0.2)
        elif negative_count > positive_count:
            emotion_type = EmotionType.SADNESS
            intensity = min(0.8, negative_count * 0.2)
        else:
            emotion_type = EmotionType.NEUTRAL
            intensity = 0.5
        
        return SimplifiedEmotionAnalysis(
            primary_emotion=emotion_type,
            intensity=intensity,
            confidence=0.7
        )
    
    def show_conversation_history(self):
        """대화 기록 표시"""
        if not self.conversation_history:
            print("📝 대화 기록이 없습니다.")
            return
        
        print("\n📝 대화 기록:")
        print("-" * 30)
        
        for i, entry in enumerate(self.conversation_history, 1):
            print(f"{i}. 사용자: {entry['user']}")
            print(f"   AI: {entry['ai']}")
            print(f"   시간: {entry['timestamp']}")
            print()
    
    async def run_similarity_test(self):
        """유사도 테스트 실행"""
        print("\n🧪 ChatGPT 유사도 테스트 실행...")
        
        # 테스트 메시지들
        test_messages = [
            "안녕하세요! 오늘 날씨가 정말 좋네요.",
            "프로젝트 진행 상황에 대해 궁금한 점이 있어요.",
            "어려운 상황에 처했는데 조언을 구하고 싶어요.",
            "새로운 아이디어에 대해 의견을 듣고 싶어요.",
            "감사합니다! 정말 도움이 되었어요."
        ]
        
        results = []
        
        for i, message in enumerate(test_messages, 1):
            print(f"\n📝 테스트 {i}: {message}")
            
            # 현재 시스템 응답
            emotion = self.analyze_emotion_simple(message)
            current_response = await self.generator.generate_message(message, emotion)
            
            # ChatGPT 스타일 응답 (모의)
            chatgpt_responses = {
                "안녕하세요! 오늘 날씨가 정말 좋네요.": "안녕하세요! 네, 정말 좋은 날씨네요. 이런 날에는 산책이나 야외 활동을 하기에 딱 좋을 것 같아요. 오늘 하루도 즐겁게 보내세요!",
                "프로젝트 진행 상황에 대해 궁금한 점이 있어요.": "프로젝트 진행 상황에 대해 궁금하시군요. 어떤 부분이 궁금하신지 구체적으로 말씀해 주시면 더 자세히 도움을 드릴 수 있을 것 같아요. 현재 진행 중인 단계나 특별히 확인하고 싶은 부분이 있으신가요?",
                "어려운 상황에 처했는데 조언을 구하고 싶어요.": "어려운 상황이시군요. 충분히 힘드실 것 같아요. 어떤 상황인지 편하게 말씀해 주시면 함께 해결방법을 찾아보도록 하겠습니다. 혼자 감당하기 어려운 일이 있을 때는 주변 사람들과 상의하는 것도 좋은 방법이에요.",
                "새로운 아이디어에 대해 의견을 듣고 싶어요.": "새로운 아이디어에 대해 의견을 구하고 싶으시군요! 어떤 아이디어인지 궁금해요. 구체적으로 어떤 내용인지 말씀해 주시면 함께 검토해보고 개선점이나 발전 방향에 대해 의견을 나눠볼 수 있을 것 같아요.",
                "감사합니다! 정말 도움이 되었어요.": "천만에요! 도움이 되었다니 정말 기쁘네요. 앞으로도 궁금한 점이나 도움이 필요한 일이 있으시면 언제든 말씀해 주세요. 더 나은 서비스를 제공하기 위해 노력하겠습니다!"
            }
            
            chatgpt_response = chatgpt_responses.get(message, "도움이 필요하시면 언제든 말씀해 주세요.")
            
            # 유사도 계산
            similarity = self.calculate_similarity(current_response, chatgpt_response)
            
            print(f"현재 시스템: {current_response}")
            print(f"ChatGPT 스타일: {chatgpt_response}")
            print(f"유사도: {similarity:.2f}")
            
            results.append({
                "message": message,
                "current_response": current_response,
                "chatgpt_response": chatgpt_response,
                "similarity": similarity
            })
        
        # 결과 요약
        avg_similarity = sum(r['similarity'] for r in results) / len(results)
        print(f"\n📊 평균 유사도: {avg_similarity:.2f}")
        
        self.test_results.extend(results)
    
    def calculate_similarity(self, response1: str, response2: str) -> float:
        """응답 유사도 계산"""
        # 간단한 유사도 계산
        words1 = set(response1.split())
        words2 = set(response2.split())
        
        if words1 and words2:
            intersection = len(words1.intersection(words2))
            union = len(words1.union(words2))
            return intersection / union if union > 0 else 0
        else:
            return 0
    
    def save_test_results(self):
        """테스트 결과 저장"""
        if self.conversation_history or self.test_results:
            results = {
                "conversation_history": self.conversation_history,
                "test_results": self.test_results,
                "timestamp": datetime.now().isoformat()
            }
            
            filename = f"interactive_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            
            print(f"\n📁 테스트 결과가 '{filename}'에 저장되었습니다.")

async def main():
    """메인 함수"""
    tester = InteractiveChatTester()
    await tester.start_interactive_test()

if __name__ == "__main__":
    asyncio.run(main()) 