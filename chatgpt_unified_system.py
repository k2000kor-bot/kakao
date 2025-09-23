
# 응답 생성 함수
def generate_response(message: str) -> str:
    """간단한 규칙 기반 응답 생성"""
    message_lower = message.lower()
    
    # 인사말
    if any(word in message_lower for word in ["안녕", "hello", "hi", "하이"]):
        return "안녕하세요! CORBU AI 통합 채팅 시스템입니다. 무엇을 도와드릴까요?"
    
    # 질문
    if "?" in message or "?" in message:
        return "좋은 질문이네요! 더 구체적으로 설명해주시면 더 정확한 답변을 드릴 수 있습니다."
    
    # 시공사 관련
    if any(word in message_lower for word in ["시공사", "건설", "하자", "품질"]):
        return "시공사 분석 기능을 사용하시겠습니까? 시공사 이름을 알려주시면 분석해드릴 수 있습니다."
    
    # 부동산 관련
    if any(word in message_lower for word in ["부동산", "아파트", "집", "매매", "전세"]):
        return "부동산 관련 정보를 찾고 계시는군요! 어떤 지역이나 정보가 필요하신지 알려주세요."
    
    # 기본 응답
    responses = [
        "흥미로운 말씀이네요! 더 자세히 설명해주시겠어요?",
        "그렇군요. 어떤 도움이 필요하신지 구체적으로 말씀해주세요.",
        "좋은 아이디어입니다! 이에 대해 더 알아보고 싶습니다.",
        "이해했습니다. 추가로 필요한 정보가 있으시면 말씀해주세요."
    ]
    
    return responses[len(message) % len(responses)]

# 메인 실행
if __name__ == "__main__":
    logger.info("🚀 ChatGPT 스타일 통합 대화형 시스템 시작 중...")
    uvicorn.run(
        "chatgpt_unified_system:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )
