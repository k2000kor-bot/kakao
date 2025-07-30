#!/usr/bin/env python3
"""
간단한 메시지 생성 테스트 스크립트
"""

import sys
import os
import asyncio
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from simplified_ultra_message_system import SimplifiedMessageGenerator, SimplifiedEmotionAnalysis, EmotionType

async def main():
    print("=== 메시지 생성 테스트 ===")
    
    # 메시지 생성기 초기화
    generator = SimplifiedMessageGenerator()
    
    # 테스트 메시지와 감정
    test_message = "환급금이 언제 나올까요?"
    test_emotion = SimplifiedEmotionAnalysis(
        primary_emotion=EmotionType.CONCERN,
        intensity=0.8,
        confidence=0.9
    )
    
    print(f"입력 메시지: {test_message}")
    print(f"감정: {test_emotion.primary_emotion.value}")
    print(f"강도: {test_emotion.intensity}")
    print("\n생성된 응답:")
    print("-" * 50)
    
    try:
        # 메시지 생성
        response = await generator.generate_message(test_message, test_emotion)
        print(response)
        print("-" * 50)
        print("✅ 테스트 완료!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        print("백엔드 서버가 실행 중인지 확인해주세요.")

if __name__ == "__main__":
    asyncio.run(main()) 