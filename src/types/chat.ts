export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image' | 'link' | 'video' | 'deleted';
  fileInfo?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  };
  linkInfo?: {
    url: string;
    title: string;
    description?: string;
    thumbnail?: string;
  };
  imageInfo?: {
    url: string;
    alt?: string;
  };
  isDeleted?: boolean;
}

// ChatMessage 타입 추가 (Message와 동일)
export interface ChatMessage extends Message {
  // Message 인터페이스를 상속하여 동일한 구조 유지
}

export interface StyleBasedMessage {
  content: string;
  style_confidence: number;
  natural_flow_score: number;
  formality_match: number;
  characteristic_elements: string[];
  logic_flow: string[];
  emotional_tone: string;
}

export interface PersonaProfile {
  speaking_style: {
    formality_level: number;
    conversation_role: string;
    logical_pattern: string;
    emotional_expression: string;
    tone_indicators: {
      concern: number;
      confidence: number;
      enthusiasm: number;
    };
    verbal_habits: string[];
  };
  conversation_logic: {
    argument_structure: string;
  };
  signature_expressions: string[];
}

export interface ChatRoom {
  id: string;
  name: string;
  participantCount: number;
  lastMessage: string;
  lastActivity: string;
  messageCount: number;
}

export interface ChatData {
  roomId: string;
  messages: Message[];
  participants: string[];
  totalMessages: number;
  lastUpdated: string;
} 