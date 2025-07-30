#!/usr/bin/env python3
"""
ChatGPT 유사성 테스트 스크립트
- 현재 시스템과 ChatGPT 응답 비교
- 설정 조정 효과 확인
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any

# 테스트용 메시지들
TEST_MESSAGES = [
    "안녕하세요! 오늘 날씨가 정말 좋네요.",
    "프로젝트 진행 상황에 대해 궁금한 점이 있어요.",
    "어려운 상황에 처했는데 조언을 구하고 싶어요.",
    "새로운 아이디어에 대해 의견을 듣고 싶어요.",
    "감사합니다! 정말 도움이 되었어요."
]

class ChatGPTSimilarityTester:
    """ChatGPT 유사성 테스트"""
    
    def __init__(self):
        self.test_results = []
    
    async def test_system_response(self, message: str) -> Dict[str, Any]:
        """시스템 응답 테스트"""
        try:
            # 현재 시스템 설정으로 응답 생성
            from simplified_ultra_message_system import SimplifiedMessageGenerator
            
            generator = SimplifiedMessageGenerator()
            
            # 감정 분석 (간단한 모의)
            from simplified_ultra_message_system import SimplifiedEmotionAnalysis, EmotionType
            emotion = SimplifiedEmotionAnalysis(
                primary_emotion=EmotionType.NEUTRAL,
                intensity=0.5,
                confidence=0.8
            )
            
            # 메시지 생성
            response = await generator.generate_message(message, emotion)
            
            return {
                "input": message,
                "response": response,
                "timestamp": datetime.now().isoformat(),
                "system": "current_system"
            }
            
        except Exception as e:
            return {
                "input": message,
                "response": f"오류 발생: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "system": "current_system",
                "error": str(e)
            }
    
    async def test_chatgpt_style_response(self, message: str) -> Dict[str, Any]:
        """ChatGPT 스타일 응답 테스트"""
        try:
            # ChatGPT 스타일 프롬프트
            chatgpt_prompt = f"""
당신은 도움이 되는 AI 어시스턴트입니다. 사용자의 질문이나 상황에 대해 유용하고 정확한 정보를 제공합니다.

사용자 메시지: "{message}"

위 메시지에 대해 도움이 되는 응답을 작성해주세요.
"""
            
            # 모의 ChatGPT 응답 (실제로는 OpenAI API 호출)
            chatgpt_responses = {
                "안녕하세요! 오늘 날씨가 정말 좋네요.": "안녕하세요! 네, 정말 좋은 날씨네요. 이런 날에는 산책이나 야외 활동을 하기에 딱 좋을 것 같아요. 오늘 하루도 즐겁게 보내세요!",
                "프로젝트 진행 상황에 대해 궁금한 점이 있어요.": "프로젝트 진행 상황에 대해 궁금하시군요. 어떤 부분이 궁금하신지 구체적으로 말씀해 주시면 더 자세히 도움을 드릴 수 있을 것 같아요. 현재 진행 중인 단계나 특별히 확인하고 싶은 부분이 있으신가요?",
                "어려운 상황에 처했는데 조언을 구하고 싶어요.": "어려운 상황이시군요. 충분히 힘드실 것 같아요. 어떤 상황인지 편하게 말씀해 주시면 함께 해결방법을 찾아보도록 하겠습니다. 혼자 감당하기 어려운 일이 있을 때는 주변 사람들과 상의하는 것도 좋은 방법이에요.",
                "새로운 아이디어에 대해 의견을 듣고 싶어요.": "새로운 아이디어에 대해 의견을 구하고 싶으시군요! 어떤 아이디어인지 궁금해요. 구체적으로 어떤 내용인지 말씀해 주시면 함께 검토해보고 개선점이나 발전 방향에 대해 의견을 나눠볼 수 있을 것 같아요.",
                "감사합니다! 정말 도움이 되었어요.": "천만에요! 도움이 되었다니 정말 기쁘네요. 앞으로도 궁금한 점이나 도움이 필요한 일이 있으시면 언제든 말씀해 주세요. 더 나은 서비스를 제공하기 위해 노력하겠습니다!"
            }
            
            response = chatgpt_responses.get(message, "도움이 필요하시면 언제든 말씀해 주세요.")
            
            return {
                "input": message,
                "response": response,
                "timestamp": datetime.now().isoformat(),
                "system": "chatgpt_style"
            }
            
        except Exception as e:
            return {
                "input": message,
                "response": f"오류 발생: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "system": "chatgpt_style",
                "error": str(e)
            }
    
    async def run_comparison_test(self):
        """비교 테스트 실행"""
        print("🤖 ChatGPT 유사성 테스트 시작...")
        print("=" * 50)
        
        for i, message in enumerate(TEST_MESSAGES, 1):
            print(f"\n📝 테스트 {i}: {message}")
            print("-" * 30)
            
            # 현재 시스템 응답
            current_result = await self.test_system_response(message)
            print(f"현재 시스템: {current_result['response']}")
            
            # ChatGPT 스타일 응답
            chatgpt_result = await self.test_chatgpt_style_response(message)
            print(f"ChatGPT 스타일: {chatgpt_result['response']}")
            
            # 유사도 분석
            similarity = self.analyze_similarity(
                current_result['response'], 
                chatgpt_result['response']
            )
            print(f"유사도 점수: {similarity:.2f}")
            
            self.test_results.append({
                "test_id": i,
                "message": message,
                "current_system": current_result,
                "chatgpt_style": chatgpt_result,
                "similarity_score": similarity
            })
        
        # 결과 요약
        self.print_summary()
    
    def analyze_similarity(self, response1: str, response2: str) -> float:
        """응답 유사도 분석"""
        # 간단한 유사도 계산 (실제로는 더 정교한 NLP 사용)
        
        # 길이 유사도
        len1, len2 = len(response1), len(response2)
        length_similarity = 1 - abs(len1 - len2) / max(len1, len2)
        
        # 키워드 유사도
        words1 = set(response1.split())
        words2 = set(response2.split())
        if words1 and words2:
            keyword_similarity = len(words1.intersection(words2)) / len(words1.union(words2))
        else:
            keyword_similarity = 0
        
        # 톤 유사도 (간단한 지표)
        tone_indicators1 = self.analyze_tone(response1)
        tone_indicators2 = self.analyze_tone(response2)
        tone_similarity = 1 - abs(tone_indicators1 - tone_indicators2) / max(tone_indicators1, tone_indicators2, 1)
        
        # 종합 유사도
        overall_similarity = (length_similarity + keyword_similarity + tone_similarity) / 3
        
        return overall_similarity
    
    def analyze_tone(self, text: str) -> float:
        """톤 분석"""
        # 간단한 톤 분석
        formal_indicators = ["습니다", "됩니다", "있습니다", "하겠습니다"]
        casual_indicators = ["어요", "돼요", "있어요", "해요"]
        
        formal_count = sum(1 for indicator in formal_indicators if indicator in text)
        casual_count = sum(1 for indicator in casual_indicators if indicator in text)
        
        total_indicators = formal_count + casual_count
        if total_indicators == 0:
            return 0.5  # 중립
        
        return casual_count / total_indicators  # 캐주얼할수록 높은 값
    
    def print_summary(self):
        """결과 요약 출력"""
        print("\n" + "=" * 50)
        print("📊 테스트 결과 요약")
        print("=" * 50)
        
        if not self.test_results:
            print("테스트 결과가 없습니다.")
            return
        
        # 평균 유사도
        avg_similarity = sum(r['similarity_score'] for r in self.test_results) / len(self.test_results)
        print(f"평균 유사도: {avg_similarity:.2f}")
        
        # 최고/최저 유사도
        max_similarity = max(r['similarity_score'] for r in self.test_results)
        min_similarity = min(r['similarity_score'] for r in self.test_results)
        print(f"최고 유사도: {max_similarity:.2f}")
        print(f"최저 유사도: {min_similarity:.2f}")
        
        # 개선 권장사항
        print("\n💡 개선 권장사항:")
        if avg_similarity < 0.5:
            print("- 시스템 설정을 더 ChatGPT와 유사하게 조정 필요")
            print("- 프롬프트 템플릿 개선 필요")
        elif avg_similarity < 0.7:
            print("- 일부 설정 조정으로 더 유사해질 수 있음")
        else:
            print("- 현재 설정이 ChatGPT와 충분히 유사함")
        
        # 결과 저장
        with open('chatgpt_similarity_test_results.json', 'w', encoding='utf-8') as f:
            json.dump(self.test_results, f, ensure_ascii=False, indent=2)
        print(f"\n📁 결과가 'chatgpt_similarity_test_results.json'에 저장되었습니다.")

async def main():
    """메인 함수"""
    tester = ChatGPTSimilarityTester()
    await tester.run_comparison_test()

if __name__ == "__main__":
    asyncio.run(main()) 