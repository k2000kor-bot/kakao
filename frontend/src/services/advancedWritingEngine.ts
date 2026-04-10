/**
 * 고급 글생성 엔진
 * 혁신적인 AI 글생성 능력을 제공하는 엔진
 */

import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface WritingContext {
  topic: string;
  audience: string;
  purpose: string;
  tone: 'formal' | 'casual' | 'professional' | 'creative' | 'academic';
  style: 'concise' | 'detailed' | 'narrative' | 'analytical';
  keywords: string[];
  previousContent?: string;
  requirements?: string[];
}

export interface WritingPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: WritingContext;
  temperature?: number;
  maxTokens?: number;
}

export interface EnhancedWritingResult {
  content: string;
  quality: number;
  coherence: number;
  creativity: number;
  relevance: number;
  suggestions: string[];
  metadata: {
    wordCount: number;
    readingTime: number;
    complexity: 'simple' | 'moderate' | 'complex';
    sentiment: 'positive' | 'negative' | 'neutral';
  };
}

export class AdvancedWritingEngine {
  private readonly PROMPT_TEMPLATES: Record<string, string> = {
    formal: `당신은 전문적인 글쓰기 전문가입니다. 다음 요구사항에 따라 고품질의 글을 작성해주세요:
- 대상 독자: {audience}
- 목적: {purpose}
- 톤: 공식적이고 전문적
- 스타일: 명확하고 구조화된

주제: {topic}
키워드: {keywords}

요구사항:
{requirements}

위 요구사항을 모두 반영하여 완성도 높은 글을 작성해주세요.`,

    creative: `당신은 창의적인 글쓰기 전문가입니다. 독창적이고 매력적인 글을 작성해주세요:
- 대상 독자: {audience}
- 목적: {purpose}
- 톤: 창의적이고 생동감 있는
- 스타일: 서사적이고 몰입도 높은

주제: {topic}
키워드: {keywords}

독자의 관심을 끌고 감동을 줄 수 있는 글을 작성해주세요.`,

    analytical: `당신은 분석적인 글쓰기 전문가입니다. 논리적이고 체계적인 글을 작성해주세요:
- 대상 독자: {audience}
- 목적: {purpose}
- 톤: 객관적이고 분석적
- 스타일: 데이터 기반, 논리적 구조

주제: {topic}
키워드: {keywords}

체계적인 분석과 명확한 결론을 포함한 글을 작성해주세요.`,

    casual: `당신은 친근하고 자연스러운 글쓰기 전문가입니다. 편안하고 읽기 쉬운 글을 작성해주세요:
- 대상 독자: {audience}
- 목적: {purpose}
- 톤: 친근하고 자연스러운
- 스타일: 편안하고 대화체

주제: {topic}
키워드: {keywords}

독자와 대화하듯이 편안하게 글을 작성해주세요.`,
  };

  /**
   * 고급 프롬프트 생성
   */
  generateAdvancedPrompt(context: WritingContext): WritingPrompt {
    const template = this.PROMPT_TEMPLATES[context.tone] || this.PROMPT_TEMPLATES.formal;
    
    const systemPrompt = `당신은 세계 최고 수준의 글쓰기 전문가입니다. 
다음 원칙을 따라 글을 작성하세요:
1. 독자의 관점에서 생각하고 그들의 필요를 충족시키세요
2. 명확하고 간결한 문장을 사용하세요
3. 논리적 흐름과 구조를 유지하세요
4. 구체적인 예시와 증거를 포함하세요
5. 독자의 행동을 유도하는 명확한 결론을 제공하세요`;

    const userPrompt = template
      .replace('{audience}', context.audience)
      .replace('{purpose}', context.purpose)
      .replace('{topic}', context.topic)
      .replace('{keywords}', context.keywords.join(', '))
      .replace('{requirements}', context.requirements?.join('\n') || '없음');

    if (context.previousContent) {
      return {
        systemPrompt,
        userPrompt: `${userPrompt}\n\n이전 내용:\n${context.previousContent}\n\n위 내용을 참고하여 자연스럽게 이어서 작성해주세요.`,
        context,
        temperature: 0.7,
        maxTokens: 2000,
      };
    }

    return {
      systemPrompt,
      userPrompt,
      context,
      temperature: 0.8,
      maxTokens: 2000,
    };
  }

  /**
   * 컨텍스트 기반 글 생성
   */
  async generateWithContext(
    context: WritingContext,
    apiCall: (prompt: WritingPrompt) => Promise<string>
  ): Promise<EnhancedWritingResult> {
    const prompt = this.generateAdvancedPrompt(context);
    const content = await apiCall(prompt);

    return this.analyzeAndEnhance(content, context);
  }

  /**
   * 스트리밍 글 생성
   */
  async *generateStreaming(
    context: WritingContext,
    apiCall: (prompt: WritingPrompt, onChunk: (chunk: string) => void) => Promise<void>
  ): AsyncGenerator<string, void, unknown> {
    const prompt = this.generateAdvancedPrompt(context);
    
    let fullContent = '';
    await apiCall(prompt, (chunk: string) => {
      fullContent += chunk;
    });

    // 스트리밍 완료 후 품질 향상
    const enhanced = this.analyzeAndEnhance(fullContent, context);
    yield enhanced.content;
  }

  /**
   * 글 분석 및 향상
   */
  public analyzeAndEnhance(
    content: string,
    context: WritingContext
  ): EnhancedWritingResult {
    const wordCount = this.countWords(content);
    const readingTime = Math.ceil(wordCount / 200);
    const complexity = this.analyzeComplexity(content);
    const sentiment = this.analyzeSentiment(content);
    
    const quality = this.calculateQuality(content, context);
    const coherence = this.calculateCoherence(content);
    const creativity = this.calculateCreativity(content);
    const relevance = this.calculateRelevance(content, context);

    const suggestions = this.generateSuggestions(content, context);

    return {
      content: this.enhanceContent(content, context),
      quality,
      coherence,
      creativity,
      relevance,
      suggestions,
      metadata: {
        wordCount,
        readingTime,
        complexity,
        sentiment,
      },
    };
  }

  /**
   * 내용 향상
   */
  private enhanceContent(content: string, context: WritingContext): string {
    let enhanced = content;

    // 구조 개선
    if (!enhanced.includes('\n\n')) {
      enhanced = enhanced.replace(/\. /g, '.\n\n');
    }

    // 키워드 강조
    context.keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      enhanced = enhanced.replace(regex, '**$1**');
    });

    // 문장 다양성 개선
    enhanced = this.improveSentenceVariety(enhanced);

    return enhanced;
  }

  /**
   * 품질 계산
   */
  private calculateQuality(content: string, context: WritingContext): number {
    let score = 0.5;

    // 길이 적절성
    const wordCount = this.countWords(content);
    if (wordCount >= 300 && wordCount <= 2000) score += 0.1;

    // 키워드 포함도
    const keywordMatches = context.keywords.filter(kw => 
      content.toLowerCase().includes(kw.toLowerCase())
    ).length;
    score += (keywordMatches / context.keywords.length) * 0.2;

    // 구조 품질
    if (content.includes('\n\n')) score += 0.1;
    if (/\d+\./.test(content) || /[-*]/.test(content)) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * 일관성 계산
   */
  private calculateCoherence(content: string): number {
    const sentences = content.split(/[.!?]\s+/);
    if (sentences.length < 3) return 0.5;

    // 문장 간 연결성 분석
    const transitionWords = ['또한', '그리고', '하지만', '그러나', '따라서', '그래서', '또한', '뿐만 아니라'];
    const hasTransitions = transitionWords.some(word => content.includes(word));
    
    return hasTransitions ? 0.9 : 0.7;
  }

  /**
   * 창의성 계산
   */
  private calculateCreativity(content: string): number {
    const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
    const totalWords = content.split(/\s+/).length;
    const diversity = uniqueWords / totalWords;

    const hasMetaphors = /(처럼|같이|마치|마치|비유)/.test(content);
    const hasQuestions = /\?/.test(content);

    return Math.min(1.0, diversity * 0.6 + (hasMetaphors ? 0.2 : 0) + (hasQuestions ? 0.2 : 0));
  }

  /**
   * 관련성 계산
   */
  private calculateRelevance(content: string, context: WritingContext): number {
    const topicWords = context.topic.split(/\s+/);
    const topicMatches = topicWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    ).length;

    return Math.min(1.0, (topicMatches / topicWords.length) * 0.8 + 0.2);
  }

  /**
   * 개선 제안 생성
   */
  private generateSuggestions(content: string, context: WritingContext): string[] {
    const suggestions: string[] = [];
    const wordCount = this.countWords(content);

    if (wordCount < 200) {
      suggestions.push('내용을 더 상세하게 확장하는 것을 고려해보세요.');
    }

    if (!content.includes('\n\n')) {
      suggestions.push('단락을 나누어 가독성을 높이세요.');
    }

    const keywordMatches = context.keywords.filter(kw => 
      content.toLowerCase().includes(kw.toLowerCase())
    ).length;
    
    if (keywordMatches < context.keywords.length * 0.7) {
      suggestions.push('주요 키워드를 더 많이 포함시키세요.');
    }

    return suggestions;
  }

  /**
   * 문장 다양성 개선
   */
  private improveSentenceVariety(content: string): string {
    const sentences = content.split(/[.!?]\s+/);
    if (sentences.length < 2) return content;

    // 문장 시작 다양화
    const varied = sentences.map((sentence, index) => {
      if (index === 0) return sentence;
      
      const firstWord = sentence.split(' ')[0];
      if (['그리고', '또한', '그래서'].includes(firstWord)) {
        return sentence;
      }

      // 가끔 문장 시작을 다양화
      if (index % 3 === 0 && Math.random() > 0.5) {
        const starters = ['또한', '그리고', '뿐만 아니라', '특히', '예를 들어'];
        return starters[Math.floor(Math.random() * starters.length)] + ', ' + sentence;
      }

      return sentence;
    });

    return varied.join('. ') + '.';
  }

  /**
   * 단어 수 계산
   */
  private countWords(text: string): number {
    return coerceTrimmedString(text, '').split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * 복잡도 분석
   */
  private analyzeComplexity(content: string): 'simple' | 'moderate' | 'complex' {
    const wordCount = this.countWords(content);
    const avgSentenceLength = wordCount / (content.split(/[.!?]/).length || 1);
    const hasComplexTerms = /(분석|전략|시스템|프로세스|최적화|통합|구조|메커니즘)/.test(content);

    if (wordCount > 1000 || avgSentenceLength > 20 || hasComplexTerms) {
      return 'complex';
    }
    if (wordCount > 500 || avgSentenceLength > 15) {
      return 'moderate';
    }
    return 'simple';
  }

  /**
   * 감정 분석
   */
  private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['성공', '개선', '향상', '긍정', '좋은', '훌륭한', '우수한', '효과적'];
    const negativeWords = ['문제', '실패', '어려움', '부정', '나쁜', '실망', '부족', '한계'];

    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;

    if (positiveCount > negativeCount * 1.5) return 'positive';
    if (negativeCount > positiveCount * 1.5) return 'negative';
    return 'neutral';
  }
}

export const advancedWritingEngine = new AdvancedWritingEngine();

