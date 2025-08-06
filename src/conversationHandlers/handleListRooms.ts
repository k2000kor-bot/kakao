export async function handleListRooms(): Promise<string> {
  try {
    // 실제 백엔드 API 호출 (현재는 모의 데이터)
    const chatRooms = [
      { id: '1', name: '일반 채팅', type: 'general', unreadCount: 0, lastMessage: '안녕하세요!', lastMessageTime: '2024-01-15 14:30' },
      { id: '2', name: '프로젝트 회의', type: 'project', unreadCount: 3, lastMessage: '다음 회의 일정을 확인해주세요.', lastMessageTime: '2024-01-15 13:45' },
      { id: '3', name: '데이터 분석', type: 'analysis', unreadCount: 0, lastMessage: '분석 결과가 준비되었습니다.', lastMessageTime: '2024-01-15 12:20' },
      { id: '4', name: '시스템 관리', type: 'system', unreadCount: 1, lastMessage: '시스템 업데이트가 완료되었습니다.', lastMessageTime: '2024-01-15 11:15' }
    ];

    let response = `💬 **채팅방 목록**\n\n`;
    
    chatRooms.forEach((room, index) => {
      const unreadBadge = room.unreadCount > 0 ? ` [${room.unreadCount}]` : '';
      const typeIcon = room.type === 'general' ? '💬' : room.type === 'project' ? '📋' : room.type === 'analysis' ? '📊' : '⚙️';
      
      response += `${index + 1}. ${typeIcon} **${room.name}**${unreadBadge}\n`;
      response += `   📝 ${room.lastMessage}\n`;
      response += `   ⏰ ${room.lastMessageTime}\n\n`;
    });

    response += `📋 **채팅방 유형**\n`;
    response += `• 💬 일반 채팅: 자유로운 대화\n`;
    response += `• 📋 프로젝트: 프로젝트 관련 논의\n`;
    response += `• 📊 분석: 데이터 분석 및 리포팅\n`;
    response += `• ⚙️ 시스템: 시스템 관리 및 설정\n\n`;
    
    response += `💡 **채팅방을 선택하려면 사이드바에서 원하는 방을 클릭하세요.**`;

    return response;
  } catch (error) {
    throw new Error('채팅방 목록 조회 중 오류가 발생했습니다.');
  }
}