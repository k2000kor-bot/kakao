/**
 * 토픽 감지 및 대화 연속성 검사 유틸리티
 * 대화의 주제 변화를 감지하고 대화의 연속성을 판단합니다.
 */

export interface ChatMessage {
  id?: string;
  role?: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatData {
  messages: ChatMessage[];
  updatedAt: string;
}

export interface TopicChangeResult {
  changed: boolean;
  newTopic?: string;
  detectedTopic?: string;
  confidence?: number;
  keywords?: string[];
}

export interface ContinuityResult {
  shouldContinue: boolean;
  reason: string;
  topicSimilarity: number;
  timeGap?: number; // 분 단위
}

// 일반적인 주제 키워드
const TOPIC_KEYWORDS: Record<string, string[]> = {
  programming: ['코드', '프로그래밍', '개발', '함수', '변수', '클래스', 'API', '버그', '디버깅'],
  design: ['디자인', 'UI', 'UX', '레이아웃', '색상', '폰트', '스타일'],
  business: ['비즈니스', '매출', '고객', '마케팅', '전략', '계획'],
  general: ['안녕', '질문', '도움', '정보', '알려줘'],
};

// 주제 추출 함수
function extractTopic(content: string): { topic: string; confidence: number; keywords: string[] } {
  const lowerContent = content.toLowerCase();
  const foundKeywords: string[] = [];
  let maxScore = 0;
  let detectedTopic = 'general';

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    if (score > maxScore) {
      maxScore = score;
      detectedTopic = topic;
      foundKeywords.push(...matchedKeywords);
    }
  }

  const confidence = Math.min(maxScore / 3, 1); // 최대 3개 키워드 기준

  return {
    topic: detectedTopic,
    confidence,
    keywords: foundKeywords,
  };
}

// 텍스트 유사도 계산 (간단한 Jaccard 유사도)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * 주제 변화 감지
 * @param content 현재 메시지 내용
 * @param previousMessages 이전 메시지들
 * @returns 주제 변화 결과
 */
export function detectTopicChange(
  content: string,
  previousMessages: ChatMessage[]
): TopicChangeResult {
  if (previousMessages.length === 0) {
    const { topic, confidence, keywords } = extractTopic(content);
    return {
      changed: false,
      detectedTopic: topic,
      confidence,
      keywords,
    };
  }

  // 최근 메시지들의 주제 추출
  const recentMessages = previousMessages.slice(-5); // 최근 5개 메시지
  const recentContent = recentMessages
    .map((msg) => msg.content)
    .join(' ');

  const currentTopic = extractTopic(content);
  const previousTopic = extractTopic(recentContent);

  // 주제가 다르고 유사도가 낮으면 주제 변화로 판단
  const similarity = calculateSimilarity(content, recentContent);
  const topicChanged =
    currentTopic.topic !== previousTopic.topic && similarity < 0.3;

  return {
    changed: topicChanged,
    newTopic: topicChanged ? currentTopic.topic : undefined,
    detectedTopic: currentTopic.topic,
    confidence: currentTopic.confidence,
    keywords: currentTopic.keywords,
  };
}

/**
 * 대화 연속성 검사
 * @param chatData 대화 데이터
 * @param firstRequest 첫 요청 (선택사항)
 * @returns 연속성 검사 결과
 */
export function checkChatContinuity(
  chatData: ChatData,
  firstRequest?: ChatMessage
): ContinuityResult | null {
  if (!chatData || !chatData.messages || chatData.messages.length === 0) {
    return {
      shouldContinue: false,
      reason: '메시지가 없습니다',
      topicSimilarity: 0,
    };
  }

  const messages = chatData.messages;
  const lastMessage: ChatMessage = messages[messages.length - 1];

  // 시간 간격 계산
  const now = new Date();
  const lastUpdate = new Date(chatData.updatedAt);
  const timeGap = (now.getTime() - lastUpdate.getTime()) / (1000 * 60); // 분 단위

  // 30분 이상 지났으면 새 대화로 간주
  if (timeGap > 30) {
    return {
      shouldContinue: false,
      reason: '30분 이상 경과하여 새 대화로 시작합니다',
      topicSimilarity: 0,
      timeGap,
    };
  }

  // 첫 요청이 있으면 주제 유사도 계산
  if (firstRequest && firstRequest.content) {
    const lastContent = lastMessage.content || '';
    const topicSimilarity = calculateSimilarity(
      firstRequest.content,
      lastContent
    );

    // 유사도가 0.3 이상이면 연속 대화로 간주
    if (topicSimilarity >= 0.3) {
      return {
        shouldContinue: true,
        reason: '주제가 유사하여 대화를 이어갑니다',
        topicSimilarity,
        timeGap,
      };
    }
  }

  // 메시지가 많고 최근에 업데이트되었으면 연속 대화로 간주
  if (messages.length >= 2 && timeGap < 10) {
    return {
      shouldContinue: true,
      reason: '최근 대화를 이어갑니다',
      topicSimilarity: 0.5, // 중간값
      timeGap,
    };
  }

  return {
    shouldContinue: false,
    reason: '새로운 대화로 시작합니다',
    topicSimilarity: 0,
    timeGap,
  };
}

/**
 * 대화 요약 생성 (주제 기반)
 * @param messages 메시지 배열
 * @returns 요약 텍스트
 */
export function generateTopicSummary(messages: ChatMessage[]): string {
  if (messages.length === 0) return '대화 내용이 없습니다';

  const topics = messages
    .slice(-10) // 최근 10개 메시지
    .map((msg) => extractTopic(msg.content).topic);

  const topicCounts: Record<string, number> = {};
  for (const topic of topics) {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }

  const mainTopic = Object.entries(topicCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const topicNames: Record<string, string> = {
    programming: '프로그래밍',
    design: '디자인',
    business: '비즈니스',
    general: '일반',
  };

  return `주요 주제: ${topicNames[mainTopic] || mainTopic}`;
}

