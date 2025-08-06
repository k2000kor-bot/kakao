export async function handleHelp(): Promise<string> {
  try {
    let response = `❓ **CORBU AI 도움말**\n\n`;
    
    response += `🎯 **주요 기능**\n`;
    response += `• 💬 **실시간 채팅**: AI와 자연스러운 대화\n`;
    response += `• 🤖 **AI 시스템**: 다양한 AI 기능 활용\n`;
    response += `• 📊 **분석 대시보드**: 시스템 성능 및 사용량 분석\n`;
    response += `• 📁 **파일 업로드**: 이미지, 문서 등 파일 공유\n`;
    response += `• 🔄 **실시간 동기화**: 실시간 메시지 및 상태 업데이트\n\n`;
    
    response += `⌨️ **명령어 가이드**\n`;
    response += `• "AI 상태" 또는 "ai status": AI 시스템 상태 확인\n`;
    response += `• "분석" 또는 "analytics": 분석 리포트 조회\n`;
    response += `• "파일 업로드" 또는 "upload": 파일 업로드 안내\n`;
    response += `• "채팅방 목록" 또는 "list rooms": 채팅방 목록 확인\n`;
    response += `• "로그아웃" 또는 "logout": 로그아웃 안내\n`;
    response += `• "도움말" 또는 "help": 이 도움말 표시\n\n`;
    
    response += `🔧 **단축키**\n`;
    response += `• Enter: 메시지 전송\n`;
    response += `• Shift + Enter: 줄바꿈\n`;
    response += `• Ctrl/Cmd + K: 사이드바 토글\n`;
    response += `• Ctrl/Cmd + A: AI 패널 토글\n\n`;
    
    response += `💡 **사용 팁**\n`;
    response += `• 자연어로 명령을 입력하면 자동으로 인식됩니다\n`;
    response += `• 채팅방을 변경하여 다양한 주제로 대화할 수 있습니다\n`;
    response += `• 실시간 상태 표시로 시스템 상황을 확인할 수 있습니다\n`;
    response += `• 알림 시스템으로 중요한 이벤트를 받아볼 수 있습니다\n\n`;
    
    response += `📞 **지원**\n`;
    response += `• 문제가 발생하면 관리자에게 문의하세요\n`;
    response += `• 시스템 업데이트는 자동으로 진행됩니다\n`;
    response += `• 개인정보는 안전하게 보호됩니다`;

    return response;
  } catch (error) {
    throw new Error('도움말 생성 중 오류가 발생했습니다.');
  }
}