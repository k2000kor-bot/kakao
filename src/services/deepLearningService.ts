import { Message } from './types';

export interface DeepLearningAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  keyTopics: string[];
  participants: {
    name: string;
    messageCount: number;
    sentiment: string;
    keyTopics: string[];
  }[];
  conversationFlow: {
    phase: string;
    confidence: number;
  };
  urgency: number; //0-1
  complexity: number; //0-1
  engagement: number; // 0-1
}

export interface MessageGenerationContext {
  messages: Message[];
  selectedMessage?: Message;
  analysis: DeepLearningAnalysis;
  userPreferences: {
    tone: 'formal' | 'casual' | 'professional';
    style: 'informative' | 'persuasive' | 'empathetic' | 'analytical';
    length: 'short' | 'medium' | 'long';
  };
  guidelines?: string[];
}

export interface GeneratedMessage {
  content: string;
  confidence: number;
  reasoning: string;
  metadata: {
    modelUsed: string;
    processingTime: number;
    tokensUsed: number;
  };
}

class DeepLearningService {
  private openaiApiKey: string = '';
  private useLocalModel: boolean = true;
  private localModelConfig = {
    model: 'local-bert',
    maxTokens: 1000,
    temperature: 0.7  // ChatGPT와 유사하게 조정
  };

  constructor() {
    // 환경변수에서 API 키 로드
    this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
  }

  // 전체 대화 분석
  async analyzeConversation(messages: Message[]): Promise<DeepLearningAnalysis> {
    try {
      if (this.useLocalModel) {
        return this.analyzeWithLocalModel(messages);
      } else {
        return this.analyzeWithOpenAI(messages);
      }
    } catch (error) {
      console.error('대화 분석 실패:', error);
      return this.getDefaultAnalysis();
    }
  }

  // 로컬 모델을 사용한 분석
  private async analyzeWithLocalModel(messages: Message[]): Promise<DeepLearningAnalysis> {
    // 간단한 규칙 기반 분석 (실제로는 TensorFlow.js나 ONNX 모델 사용)
    const content = messages.map(m => m.content).join(' ');

    // 감정 분석
    const positiveWords = ['좋다', '만족', '동의', '찬성', '성공', '감사', '좋은', '훌륭'];
    const negativeWords = ['문제', '불만', '반대', '우려', '실패', '어려움', '불편', '부족'];
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    // 키워드 추출
    const keywords = ['조합', '아파트', '건설', '협의', '회의', '안건', '투표', '결의', '시공사', '분양'];
    const keyTopics = keywords.filter(word => content.includes(word));

    // 참여자 분석
    const participants = this.analyzeParticipants(messages);

    // 대화 흐름 분석
    const conversationFlow = this.analyzeConversationFlow(messages);

    // 긴급도, 복잡도, 참여도 계산
    const urgency = this.calculateUrgency(messages);
    const complexity = this.calculateComplexity(messages);
    const engagement = this.calculateEngagement(messages);

    return {
      sentiment,
      keyTopics,
      participants,
      conversationFlow,
      urgency,
      complexity,
      engagement
    };
  }

  // OpenAI를 사용한 분석
  private async analyzeWithOpenAI(messages: Message[]): Promise<DeepLearningAnalysis> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const content = messages.map(m => `${m.sender}: ${m.content}`).join('\n');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '대화를 분석하여 감정, 주요 주제, 참여자별 특성을 JSON 형태로 반환해주세요.'
            },
            {
              role: 'user',
              content: `다음 대화를 분석해주세요:\n\n${content}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      const data = await response.json();
      const analysisText = data.choices[0].message.content;

      // JSON 파싱 시도
      try {
        const parsed = JSON.parse(analysisText);
        // participants 타입 보정
        const participants: DeepLearningAnalysis['participants'] = Array.isArray(parsed.participants)
          ? parsed.participants.map((p: any) => {
            let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
            if (isSentiment(p.sentiment)) sentiment = p.sentiment;
            return {
              name: typeof p.name === 'string' ? p.name : '',
              messageCount: typeof p.messageCount === 'number' ? p.messageCount : 0,
              sentiment: sentiment as 'positive' | 'negative' | 'neutral',
              keyTopics: Array.isArray(p.keyTopics) ? p.keyTopics.filter((k: any) => typeof k === 'string') : [],
            } as const;
          })
          : [];
        // conversationFlow 타입 보정
        let phase: DeepLearningAnalysis['conversationFlow']['phase'] = 'discussion';
        if (parsed.conversationFlow && isPhase(parsed.conversationFlow.phase)) {
          phase = parsed.conversationFlow.phase;
        }
        const conversationFlow: DeepLearningAnalysis['conversationFlow'] = {
          phase: phase as 'introduction' | 'discussion' | 'conflict' | 'resolution' | 'conclusion',
          confidence: parsed.conversationFlow && typeof parsed.conversationFlow.confidence === 'number' ? parsed.conversationFlow.confidence : 0.5
        } as const;
        // 나머지 필드 변환 및 반환
        const result: DeepLearningAnalysis = {
          sentiment: isSentiment(parsed.sentiment) ? parsed.sentiment as 'positive' | 'negative' | 'neutral' : 'neutral',
          keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics.filter((k: any) => typeof k === 'string') : [],
          participants,
          conversationFlow,
          urgency: typeof parsed.urgency === 'number' ? parsed.urgency : 0.5,
          complexity: typeof parsed.complexity === 'number' ? parsed.complexity : 0.5,
          engagement: typeof parsed.engagement === 'number' ? parsed.engagement : 0.5
        };
        return result;
      } catch (e) {
        // 파싱 실패 시 로컬 분석 사용
        return this.analyzeWithLocalModel(messages);
      }
    } catch (error) {
      console.error('OpenAI 분석 실패:', error);
      return this.analyzeWithLocalModel(messages);
    }
  }

  // 참여자별 분석
  private analyzeParticipants(messages: Message[]) {
    const participantMap = new Map<string, { count: number; content: string[]; sentiment: number }>();

    messages.forEach(message => {
      const existing = participantMap.get(message.sender) || { count: 0, content: [], sentiment: 0 };
      existing.count++;
      existing.content.push(message.content);

      // 간단한 감정 점수 계산
      const positiveWords = ['좋다', '만족', '동의', '찬성'];
      const negativeWords = ['문제', '불만', '반대', '우려'];

      const positiveCount = positiveWords.filter(word => message.content.includes(word)).length;
      const negativeCount = negativeWords.filter(word => message.content.includes(word)).length;

      existing.sentiment += positiveCount - negativeCount;

      participantMap.set(message.sender, existing);
    });

    return Array.from(participantMap.entries()).map(([name, data]) => ({
      name,
      messageCount: data.count,
      sentiment: data.sentiment > 0 ? 'positive' : data.sentiment < 0 ? 'negative' : 'neutral',
      keyTopics: this.extractKeyTopics(data.content.join(' '))
    }));
  }

  // 대화 흐름 분석
  private analyzeConversationFlow(messages: Message[]) {
    const content = messages.map(m => m.content).join(' ');

    // 간단한 규칙 기반 흐름 분석
    if (content.includes('안녕') || content.includes('시작')) {
      return { phase: 'introduction', confidence: 0.8 };
    } else if (content.includes('문제') || content.includes('갈등')) {
      return { phase: 'conflict', confidence: 0.7 };
    } else if (content.includes('해결') || content.includes('결정')) {
      return { phase: 'resolution', confidence: 0.8 };
    } else if (content.includes('마무리') || content.includes('종료')) {
      return { phase: 'conclusion', confidence: 0.9 };
    } else {
      return { phase: 'discussion', confidence: 0.6 };
    }
  }

  // 긴급도 계산
  private calculateUrgency(messages: Message[]): number {
    const urgentWords = ['급함', '즉시', '당장'];
    const content = messages.map(m => m.content).join(' ');
    const urgentCount = urgentWords.filter(word => content.includes(word)).length;
    return Math.min(urgentCount / 10, 10);
  }

  // 복잡도 계산
  private calculateComplexity(messages: Message[]): number {
    const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
    const uniqueParticipants = new Set(messages.map(m => m.sender)).size;
    return Math.min((avgLength / 100 + uniqueParticipants / 10) / 2, 10);
  }

  // 참여도 계산
  private calculateEngagement(messages: Message[]): number {
    const uniqueParticipants = new Set(messages.map(m => m.sender)).size;
    const totalMessages = messages.length;
    return Math.min((uniqueParticipants * totalMessages) / 1000, 10);
  }

  // 키워드 추출
  private extractKeyTopics(content: string): string[] {
    const keywords = ['조합', '아파트', '건설', '협의', '회의', '안건', '투표', '결의', '시공사', '분양'];
    return keywords.filter(word => content.includes(word));
  }

  // 기본 분석 결과
  private getDefaultAnalysis(): DeepLearningAnalysis {
    return {
      sentiment: 'neutral',
      keyTopics: [],
      participants: [],
      conversationFlow: { phase: 'discussion', confidence: 0.5 },
      urgency: 0.5,
      complexity: 0.5,
      engagement: 0.5
    };
  }

  // 메시지 생성
  async generateMessage(context: MessageGenerationContext): Promise<GeneratedMessage> {
    try {
      if (this.useLocalModel) {
        return this.generateWithLocalModel(context);
      } else {
        return this.generateWithOpenAI(context);
      }
    } catch (error) {
      console.error('메시지 생성 실패:', error);
      return this.getDefaultGeneratedMessage();
    }
  }

  // 로컬 모델을 사용한 메시지 생성
  private async generateWithLocalModel(context: MessageGenerationContext): Promise<GeneratedMessage> {
    const { messages, selectedMessage, analysis, userPreferences } = context;

    // 템플릿 기반 메시지 생성
    let template = '';
    if (analysis.sentiment === 'negative') {
      template = '걱정하시는 점을 충분히 이해합니다. ';
    } else if (analysis.sentiment === 'positive') {
      template = '좋은 의견 감사합니다. ';
    } else {
      template = '말씀하신 내용을 잘 이해했습니다. ';
    }

    if (userPreferences.style === 'empathetic') {
      template += '충분히 공감하며, ';
    } else if (userPreferences.style === 'analytical') {
      template += '분석해보니, ';
    }

    template += '이런 점도 함께 고려해보시면 어떨까요?';

    if (selectedMessage) {
      template += `\n\n선택된 메시지: ${selectedMessage.content}에 대한 응답입니다.`;
    }

    return {
      content: template,
      confidence: 0.7,
      reasoning: '로컬 템플릿 기반 생성',
      metadata: {
        modelUsed: 'local-template',
        processingTime: Date.now(),
        tokensUsed: template.length
      }
    };
  }

  // OpenAI를 사용한 메시지 생성
  private async generateWithOpenAI(context: MessageGenerationContext): Promise<GeneratedMessage> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    const { messages, selectedMessage, analysis, userPreferences, guidelines } = context;

    const prompt = this.buildPrompt(context);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '당신은 전문적인 대화 분석가입니다. 주어진 컨텍스트를 바탕으로 적절한 메시지를 생성해주세요.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.localModelConfig.maxTokens,
          temperature: this.localModelConfig.temperature
        })
      });

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      return {
        content: generatedContent,
        confidence: 0.9,
        reasoning: 'OpenAI GPT-4',
        metadata: {
          modelUsed: 'gpt-4',
          processingTime: Date.now(),
          tokensUsed: generatedContent.length
        }
      };
    } catch (error) {
      console.error('OpenAI 메시지 생성 실패:', error);
      return this.generateWithLocalModel(context);
    }
  }

  // 프롬프트 생성
  private buildPrompt(context: MessageGenerationContext): string {
    const { messages, selectedMessage, analysis, userPreferences, guidelines } = context;

    let prompt = `대화 분석 결과:\n`;
    prompt += `- 감정: ${analysis.sentiment}\n`;
    prompt += `- 주요 주제: ${analysis.keyTopics.join(', ')}\n`;
    prompt += `- 긴급도: ${analysis.urgency}\n`;
    prompt += `- 복잡도: ${analysis.complexity}\n\n`;

    if (selectedMessage) {
      prompt += `선택된 메시지: ${selectedMessage.content}\"\n\n`;
    }

    prompt += `사용자 선호도:\n`;
    prompt += `- 톤: ${userPreferences.tone}\n`;
    prompt += `- 스타일: ${userPreferences.style}\n`;
    prompt += `- 길이: ${userPreferences.length}\n\n`;

    if (guidelines && guidelines.length > 0) {
      prompt += `적용할 지침:\n${guidelines.join('\n')}\n\n`;
    }

    prompt += `위 정보를 바탕으로 적절한 응답 메시지를 생성해주세요.`;

    return prompt;
  }

  // 기본 생성 메시지
  private getDefaultGeneratedMessage(): GeneratedMessage {
    return {
      content: '메시지 생성에 실패했습니다. 다시 시도해주세요.',
      confidence: 0.0,
      reasoning: '생성 실패',
      metadata: {
        modelUsed: 'none',
        processingTime: 0,
        tokensUsed: 0
      }
    };
  }

  // 설정 업데이트
  setConfig(config: { openaiApiKey?: string; useLocalModel?: boolean }) {
    if (config.openaiApiKey !== undefined) {
      this.openaiApiKey = config.openaiApiKey;
    }
    if (config.useLocalModel !== undefined) {
      this.useLocalModel = config.useLocalModel;
    }
  }

  // 현재 설정 반환
  getConfig() {
    return {
      openaiApiKey: this.openaiApiKey,
      useLocalModel: this.useLocalModel,
      localModelConfig: this.localModelConfig
    };
  }
}

// 타입 가드 함수 추가
function isSentiment(val: any): val is 'positive' | 'negative' | 'neutral' {
  return val === 'positive' || val === 'negative' || val === 'neutral';
}
function isPhase(val: any): val is 'introduction' | 'discussion' | 'conflict' | 'resolution' | 'conclusion' {
  return (
    val === 'introduction' ||
    val === 'discussion' ||
    val === 'conflict' ||
    val === 'resolution' ||
    val === 'conclusion'
  );
}

export default new DeepLearningService(); 