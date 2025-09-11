// 대화형 명령 라우터

export interface ConversationCommand {
  intent: 'ai_status' | 'analytics' | 'file_upload' | 'list_rooms' | 'logout' | 'help' | 'chat';
  confidence: number;
  keywords: string[];
}

export function parseConversationCommand(message: string): ConversationCommand {
  const lowerMessage = message.toLowerCase();
  
  // AI 상태 관련 키워드
  const aiStatusKeywords = ['ai 상태', 'ai 상태 확인', 'ai 시스템', '시스템 상태', 'ai 작동', 'ai 동작'];
  if (aiStatusKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      intent: 'ai_status',
      confidence: 0.9,
      keywords: aiStatusKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  // 분석 관련 키워드
  const analyticsKeywords = ['분석', '리포트', '통계', '사용량', '성능', '데이터', '분석 리포트'];
  if (analyticsKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      intent: 'analytics',
      confidence: 0.8,
      keywords: analyticsKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  // 파일 업로드 관련 키워드
  const fileUploadKeywords = ['파일 업로드', '파일 업로드 방법', '파일 첨부', '업로드', '파일'];
  if (fileUploadKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      intent: 'file_upload',
      confidence: 0.85,
      keywords: fileUploadKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  // 채팅방 목록 관련 키워드
  const listRoomsKeywords = ['채팅방', '채팅방 목록', '방 목록', '채널', '채널 목록'];
  if (listRoomsKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      intent: 'list_rooms',
      confidence: 0.8,
      keywords: listRoomsKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  // 로그아웃 관련 키워드
  const logoutKeywords = ['로그아웃', '로그아웃', '로그아웃', '나가기', '종료'];
  if (logoutKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      intent: 'logout',
      confidence: 0.9,
      keywords: logoutKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  // 도움말 관련 키워드
  const helpKeywords = ['도움말', 'help', '도움', '사용법', '명령어', '사용 가능한 명령'];
  if (helpKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return {
      intent: 'help',
      confidence: 0.9,
      keywords: helpKeywords.filter(keyword => lowerMessage.includes(keyword))
    };
  }

  // 일반 채팅 (기본값)
  return {
    intent: 'chat',
    confidence: 0.5,
    keywords: []
  };
}