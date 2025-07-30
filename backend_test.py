#!/usr/bin/env python3
"""
백엔드 핵심 기능 테스트 스크립트
"""

import asyncio
import sys
import os
from pathlib import Path

# 백엔드 모듈 추가
sys.path.append('backend')

def test_backend_modules():
    """백엔드 모듈들 테스트"""
    print("🔍 백엔드 모듈 테스트 시작...")
    
    test_results = []
    
    # 1. FastAPI 앱 테스트
    try:
        from advanced_api_server import app
        print("✅ FastAPI 앱 로드 성공")
        test_results.append(("FastAPI 앱", True))
    except Exception as e:
        print(f"❌ FastAPI 앱 로드 실패: {e}")
        test_results.append(("FastAPI 앱", False))
    
    # 2. 미디어 처리 모듈 테스트
    try:
        from enhanced_media_processor import EnhancedMediaProcessor
        processor = EnhancedMediaProcessor()
        print("✅ 미디어 처리 모듈 로드 성공")
        test_results.append(("미디어 처리", True))
    except Exception as e:
        print(f"❌ 미디어 처리 모듈 로드 실패: {e}")
        test_results.append(("미디어 처리", False))
    
    # 3. AI 모델 모듈 테스트
    try:
        from enhanced_multimodal_ai import AGIMultimodalComprehensionEngine
        ai_system = AGIMultimodalComprehensionEngine()
        print("✅ AI 모델 모듈 로드 성공")
        test_results.append(("AI 모델", True))
    except Exception as e:
        print(f"❌ AI 모델 모듈 로드 실패: {e}")
        test_results.append(("AI 모델", False))
    
    # 4. OpenAI API 테스트
    try:
        import openai
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            print("✅ OpenAI API 키 확인됨")
            test_results.append(("OpenAI API", True))
        else:
            print("⚠️ OpenAI API 키가 설정되지 않음")
            test_results.append(("OpenAI API", False))
    except Exception as e:
        print(f"❌ OpenAI API 테스트 실패: {e}")
        test_results.append(("OpenAI API", False))
    
    return test_results

def test_api_endpoints():
    """API 엔드포인트 테스트"""
    print("\n🔍 API 엔드포인트 테스트...")
    
    try:
        from advanced_api_server import app
        
        # FastAPI 앱이 정상적으로 로드되었는지 확인
        if app:
            print("✅ FastAPI 앱 정상 로드")
            return True
        else:
            print("❌ FastAPI 앱 로드 실패")
            return False
        
    except Exception as e:
        print(f"❌ API 엔드포인트 테스트 실패: {e}")
        return False

def test_file_processing():
    """파일 처리 기능 테스트"""
    print("\n🔍 파일 처리 기능 테스트...")
    
    try:
        from enhanced_media_processor import EnhancedMediaProcessor
        
        processor = EnhancedMediaProcessor()
        
        # 테스트 파일 생성
        test_files = {
            "test.txt": "안녕하세요. 이것은 테스트 파일입니다.",
            "test_image.png": None,  # 이미지 파일은 별도 생성 필요
        }
        
        for filename, content in test_files.items():
            if content:
                with open(filename, "w", encoding="utf-8") as f:
                    f.write(content)
                
                # 파일 처리 테스트
                result = processor.process_media_file(filename)
                print(f"✅ {filename} 처리 성공")
                
                # 테스트 파일 삭제
                os.remove(filename)
        
        return True
        
    except Exception as e:
        print(f"❌ 파일 처리 테스트 실패: {e}")
        return False

def test_ai_generation():
    """AI 메시지 생성 테스트"""
    print("\n🔍 AI 메시지 생성 테스트...")
    
    try:
        from advanced_api_server import generate_openai_message
        
        # 테스트 데이터
        target_message = "안녕하세요"
        context_messages = [
            {"role": "user", "content": "안녕하세요"},
            {"role": "assistant", "content": "안녕하세요! 무엇을 도와드릴까요?"}
        ]
        settings = {
            "tone": "friendly",
            "ai_model": "gpt-3.5-turbo"
        }
        
        # 비동기 함수 테스트
        async def test_generation():
            result = await generate_openai_message(target_message, context_messages, settings)
            return result
        
        # 이벤트 루프에서 실행
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(test_generation())
        loop.close()
        
        if result and "message" in result:
            print("✅ AI 메시지 생성 성공")
            return True
        else:
            print("❌ AI 메시지 생성 실패")
            return False
        
    except Exception as e:
        print(f"❌ AI 메시지 생성 테스트 실패: {e}")
        return False

def test_database():
    """데이터베이스 기능 테스트"""
    print("\n🔍 데이터베이스 기능 테스트...")
    
    try:
        from advanced_api_server import init_database
        
        # 데이터베이스 초기화 테스트
        init_database()
        print("✅ 데이터베이스 초기화 성공")
        return True
        
    except Exception as e:
        print(f"❌ 데이터베이스 테스트 실패: {e}")
        return False

def main():
    """메인 테스트 함수"""
    print("🚀 백엔드 핵심 기능 테스트 시작")
    print("=" * 50)
    
    # 1. 모듈 테스트
    module_results = test_backend_modules()
    
    # 2. API 엔드포인트 테스트
    api_success = test_api_endpoints()
    
    # 3. 파일 처리 테스트
    file_success = test_file_processing()
    
    # 4. AI 생성 테스트
    ai_success = test_ai_generation()
    
    # 5. 데이터베이스 테스트
    db_success = test_database()
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("📊 백엔드 테스트 결과 요약:")
    print("=" * 50)
    
    # 모듈 테스트 결과
    for module_name, success in module_results:
        status = "✅ 성공" if success else "❌ 실패"
        print(f"   {module_name}: {status}")
    
    # 기타 테스트 결과
    print(f"   API 엔드포인트: {'✅ 성공' if api_success else '❌ 실패'}")
    print(f"   파일 처리: {'✅ 성공' if file_success else '❌ 실패'}")
    print(f"   AI 생성: {'✅ 성공' if ai_success else '❌ 실패'}")
    print(f"   데이터베이스: {'✅ 성공' if db_success else '❌ 실패'}")
    
    # 전체 성공률 계산
    total_tests = len(module_results) + 4
    successful_tests = sum(1 for _, success in module_results if success)
    if api_success: successful_tests += 1
    if file_success: successful_tests += 1
    if ai_success: successful_tests += 1
    if db_success: successful_tests += 1
    
    success_rate = (successful_tests / total_tests) * 100
    
    print(f"\n📈 전체 성공률: {success_rate:.1f}% ({successful_tests}/{total_tests})")
    
    if success_rate >= 80:
        print("🎉 백엔드가 준비되었습니다!")
        return True
    elif success_rate >= 60:
        print("⚠️ 백엔드에 일부 문제가 있습니다. 추가 설정이 필요할 수 있습니다.")
        return False
    else:
        print("❌ 백엔드에 심각한 문제가 있습니다. 의존성 설치를 확인하세요.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 