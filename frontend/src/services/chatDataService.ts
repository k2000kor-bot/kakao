import { Message, ChatRoom } from './types';

// 실제 대화 데이터 파싱 함수
export const parseKakaoChatData = (content: string): Message[] => {
  const messages: Message[] = [];
  const lines = content.split('\n');
  
  let currentDate = '';
  let messageId = 0;
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // 날짜 라인 확인 (예: 2025년 6월 24일 오전 9:22)
    if (line.match(/^\d{4}년 \d{1,2}월 \d{1,2}일/)) {
      currentDate = line.trim();
      continue;
    }
    
    // 메시지 라인 확인 (예: 2025년 6월 24일 오전 9:22, 0098 : 조합원들의 의사가 중요한게)
    const messageMatch = line.match(/^(\d{4}년 \d{1,2}월 \d{1,2}일 [오전|오후] \d{1,2}:\d{2}), ([^:]+) : (.+)$/);
    if (messageMatch) {
      const [, timestamp, sender, content] = messageMatch;
      
      messages.push({
        id: `msg_${messageId++}`,
        sender: sender.trim(),
        content: content.trim(),
        timestamp: timestamp.trim(),
        type: 'text'
      });
    }
  }
  
  return messages;
};

// 실제 채팅방 데이터
export const realChatRooms: ChatRoom[] = [
  {
    id: '우성7차_아파트_조합원',
    name: '[인증]행복한소유☆개포우성7차',
    description: '개포우성7차 아파트 조합원 대화방',
    participantCount: 112,
    messageCount: 6727
  }
];

// 실제 채팅 데이터 파싱 함수 개선
export const parseRealChatData = (rawData: string): Message[] => {
  const messages: Message[] = [];
  const lines = rawData.split('\n');
  
  let currentMessage: Partial<Message> = {};
  
  for (const line of lines) {
    // 날짜/시간 패턴 매칭 (예: 2024-01-15 14:30:25)
    const dateTimeMatch = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
    if (dateTimeMatch) {
      // 이전 메시지가 있으면 저장
      if (currentMessage.content && currentMessage.sender) {
        messages.push(currentMessage as Message);
      }
      
      // 새 메시지 시작
      const timestamp = dateTimeMatch[1];
      const remainingText = line.substring(timestamp.length).trim();
      
      // 발신자 패턴 매칭 (예: [홍길동] 또는 홍길동:)
      const senderMatch = remainingText.match(/^\[([^\]]+)\]\s*(.*)/) || 
                         remainingText.match(/^([^:]+):\s*(.*)/);
      
      if (senderMatch) {
        currentMessage = {
          id: `msg_${messages.length + 1}`,
          sender: senderMatch[1].trim(),
          content: senderMatch[2].trim(),
          timestamp: timestamp,
          type: 'text'
        };
      } else {
        // 발신자가 없는 경우 기본값 설정
        currentMessage = {
          id: `msg_${messages.length + 1}`,
          sender: '알 수 없음',
          content: remainingText,
          timestamp: timestamp,
          type: 'text'
        };
      }
    } else if (currentMessage.content && line.trim()) {
      // 멀티라인 메시지 처리
      currentMessage.content += '\n' + line.trim();
    }
  }
  
  // 마지막 메시지 추가
  if (currentMessage.content && currentMessage.sender) {
    messages.push(currentMessage as Message);
  }
  
  return messages;
};

// 새로운 대화 데이터 파싱 함수 (sample_chat.txt 형식)
export const parseSampleChatData = (rawData: string): Message[] => {
  const messages: Message[] = [];
  const lines = rawData.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // [2025년 7월 15일] [12:40] 0035_우성7차 : 메시지 내용
    const messageMatch = line.match(/^\[([^\]]+)\]\s*\[([^\]]+)\]\s*([^:]+)\s*:\s*(.+)$/);
    
    if (messageMatch) {
      const [, date, time, sender, content] = messageMatch;
      const timestamp = `${date} ${time}`;
      
      messages.push({
        id: `msg_${i + 1}`,
        sender: sender.trim(),
        content: content.trim(),
        timestamp: timestamp,
        type: 'text'
      });
    }
  }
  
  return messages;
};

// 채팅 데이터 분석 함수 추가
export const analyzeChatData = (messages: Message[]) => {
  const analysis = {
    totalMessages: messages.length,
    uniqueParticipants: new Set(messages.map(m => m.sender)).size,
    dateRange: {
      start: null as Date | null,
      end: null as Date | null
    },
    topParticipants: [] as { sender: string; count: number }[],
    messageFrequency: {} as Record<string, number>,
    keywords: [] as string[]
  };
  
  // 날짜 범위 계산
  const timestamps = messages.map(m => new Date(m.timestamp)).filter(d => !isNaN(d.getTime()));
  if (timestamps.length > 0) {
    analysis.dateRange.start = new Date(Math.min(...timestamps.map(d => d.getTime())));
    analysis.dateRange.end = new Date(Math.max(...timestamps.map(d => d.getTime())));
  }
  
  // 참여자별 메시지 수 계산
  const participantCounts: Record<string, number> = {};
  messages.forEach(m => {
    participantCounts[m.sender] = (participantCounts[m.sender] || 0) + 1;
  });
  
  analysis.topParticipants = Object.entries(participantCounts)
    .map(([sender, count]) => ({ sender, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // 키워드 추출 (간단한 버전)
  const commonWords = ['조합', '아파트', '건설', '협의', '회의', '안건', '투표', '결의'];
  const content = messages.map(m => m.content).join(' ');
  analysis.keywords = commonWords.filter(word => content.includes(word));
  
  return analysis;
};

// 채팅방 ID에 따라 실제 파일 경로 생성
function getChatFilePath(chatRoomId: string): string {
  // 예시: [인증]행복한소유☆개포우성7차 → chat_rooms/[인증]행복한소유☆개포우성7차/[인증]행복한소유☆개포우성7차.txt
  return `/chat_rooms/${chatRoomId}/${chatRoomId}.txt`;
}

export const loadRealChatData = async (chatRoomId: string): Promise<Message[]> => {
  try {
    const filePath = getChatFilePath(chatRoomId);
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error('대화 파일을 찾을 수 없습니다.');
    }
    const rawData = await response.text();
    // 카카오톡 형식 파서 사용
    const messages = parseKakaoChatData(rawData);
    return messages;
  } catch (error) {
    console.error('실제 채팅 데이터 로드 실패:', error);
    // 폴백: 빈 배열 반환
    return [];
  }
};

// 데이터베이스 저장 함수 (로컬 스토리지 사용)
export const saveMessagesToDatabase = (messages: Message[], chatRoomId: string): void => {
  try {
    const key = `chat_messages_${chatRoomId}`;
    localStorage.setItem(key, JSON.stringify(messages));
    console.log(`${messages.length}개의 메시지를 데이터베이스에 저장했습니다.`);
  } catch (error) {
    console.error('메시지 저장 실패:', error);
  }
};

// 데이터베이스에서 메시지 로드
export const loadMessagesFromDatabase = (chatRoomId: string): Message[] => {
  try {
    const key = `chat_messages_${chatRoomId}`;
    const data = localStorage.getItem(key);
    if (data) {
      const messages = JSON.parse(data) as Message[];
      console.log(`데이터베이스에서 ${messages.length}개의 메시지를 로드했습니다.`);
      return messages;
    }
  } catch (error) {
    console.error('데이터베이스에서 메시지 로드 실패:', error);
  }
  return [];
};

// 데이터베이스 상태 확인
export const checkDatabaseStatus = (chatRoomId: string): { hasData: boolean; messageCount: number } => {
  try {
    const key = `chat_messages_${chatRoomId}`;
    const data = localStorage.getItem(key);
    if (data) {
      const messages = JSON.parse(data) as Message[];
      return {
        hasData: true,
        messageCount: messages.length
      };
    }
  } catch (error) {
    console.error('데이터베이스 상태 확인 실패:', error);
  }
  return {
    hasData: false,
    messageCount: 0
  };
};

// 기존 함수들 유지
export const loadChatData = async (chatRoomId: string): Promise<Message[]> => {
  // 데이터베이스에서 먼저 확인
  const dbStatus = checkDatabaseStatus(chatRoomId);
  console.log('데이터베이스 상태:', dbStatus);
  
  if (dbStatus.hasData) {
    // 데이터베이스에 데이터가 있으면 로드
    return loadMessagesFromDatabase(chatRoomId);
  }
  
  // 실제 채팅방인지 확인
  if (chatRoomId === '우성7차_아파트_조합원') {
    const messages = await loadRealChatData(chatRoomId);
    
    // 데이터베이스에 저장
    saveMessagesToDatabase(messages, chatRoomId);
    
    return messages;
  }
  
  // 기존 샘플 데이터
  return [
    {
      id: '1',
      sender: '조합원A',
      content: '안녕하세요! 오늘 회의 일정 확인해주세요.',
      timestamp: '2025-01-15 09:30',
      type: 'text'
    },
    {
      id: '2',
      sender: '조합원B',
      content: '네, 확인했습니다. 오후 2시에 시작하는 것이 맞나요?',
      timestamp: '2025-01-15 09:35',
      type: 'text'
    },
    {
      id: '3',
      sender: '조합원C',
      content: '맞습니다. 안건도 미리 공유해드릴게요.',
      timestamp: '2025-01-15 09:40',
      type: 'text'
    },
    {
      id: '4',
      sender: '조합원A',
      content: '감사합니다. 준비해서 참석하겠습니다.',
      timestamp: '2025-01-15 09:45',
      type: 'text'
    },
    {
      id: '5',
      sender: '조합원D',
      content: '저도 참석하겠습니다.',
      timestamp: '2025-01-15 09:50',
      type: 'text'
    }
  ];
};

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  return realChatRooms;
}; 