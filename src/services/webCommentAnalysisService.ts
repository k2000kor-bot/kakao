/**
 * 웹 댓글 분석 및 생성 서비스
 * 웹 검색 결과의 댓글을 분석하여 적절한 댓글이나 글을 생성
 */

export interface WebComment {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  likes: number;
  replies: WebComment[];
  sentiment: 'positive' | 'negative' | 'neutral';
  topic: string;
  keywords: string[];
}

export interface CommentAnalysis {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  dominantTopics: string[];
  commonKeywords: string[];
  averageLength: number;
  engagementLevel: 'high' | 'medium' | 'low';
  tone: 'formal' | 'casual' | 'professional' | 'friendly';
  targetAudience: string;
}

export interface GeneratedComment {
  content: string;
  style: 'supportive' | 'critical' | 'neutral' | 'informative';
  tone: 'formal' | 'casual' | 'professional' | 'friendly';
  length: 'short' | 'medium' | 'long';
  targetAudience: string;
  reasoning: string;
}

export interface CommentGenerationRequest {
  originalContent: string;
  comments: WebComment[];
  targetStyle: 'supportive' | 'critical' | 'neutral' | 'informative';
  targetTone: 'formal' | 'casual' | 'professional' | 'friendly';
  targetLength: 'short' | 'medium' | 'long';
  specificTopics?: string[];
  avoidKeywords?: string[];
}

class WebCommentAnalysisService {
  private sentimentKeywords = {
    positive: ['좋다', '훌륭하다', '감사하다', '추천하다', '만족하다', '좋은', '훌륭한', '감사한'],
    negative: ['나쁘다', '실망하다', '불만이다', '문제다', '개선하다', '나쁜', '실망한', '불만한'],
    neutral: ['생각하다', '보이다', '알다', '모르다', '있다', '없다']
  };

  private tonePatterns = {
    formal: ['~입니다', '~하겠습니다', '~하여야 합니다', '~바랍니다'],
    casual: ['~야', '~어', '~네', '~다', '~지'],
    professional: ['~관련하여', '~측면에서', '~입장에서', '~차원에서'],
    friendly: ['~이에요', '~해요', '~네요', '~거든요', '~잖아요']
  };

  /**
   * 댓글 분석
   */
  analyzeComments(comments: WebComment[]): CommentAnalysis {
    if (comments.length === 0) {
      return {
        overallSentiment: 'neutral',
        dominantTopics: [],
        commonKeywords: [],
        averageLength: 0,
        engagementLevel: 'low',
        tone: 'casual',
        targetAudience: '일반'
      };
    }

    // 감정 분석
    const sentiments = comments.map(comment => this.analyzeSentiment(comment.content));
    const overallSentiment = this.calculateOverallSentiment(sentiments);

    // 주요 토픽 추출
    const allKeywords = comments.flatMap(comment => comment.keywords);
    const dominantTopics = this.extractDominantTopics(allKeywords);

    // 공통 키워드
    const commonKeywords = this.findCommonKeywords(allKeywords);

    // 평균 길이
    const averageLength = comments.reduce((sum, comment) => sum + comment.content.length, 0) / comments.length;

    // 참여도 수준
    const engagementLevel = this.calculateEngagementLevel(comments);

    // 톤 분석
    const tone = this.analyzeTone(comments);

    // 타겟 오디언스
    const targetAudience = this.identifyTargetAudience(comments);

    return {
      overallSentiment,
      dominantTopics,
      commonKeywords,
      averageLength,
      engagementLevel,
      tone,
      targetAudience
    };
  }

  /**
   * 댓글 생성
   */
  async generateComment(request: CommentGenerationRequest): Promise<GeneratedComment> {
    const analysis = this.analyzeComments(request.comments);
    
    // 컨텍스트 분석
    const context = this.analyzeContext(request.originalContent, request.comments);
    
    // 스타일별 템플릿 선택
    const template = this.selectTemplate(request.targetStyle, analysis);
    
    // 키워드 통합
    const relevantKeywords = this.integrateKeywords(
      analysis.commonKeywords,
      request.specificTopics,
      request.avoidKeywords
    );
    
    // 댓글 생성
    const content = await this.generateContent(
      template,
      context,
      relevantKeywords,
      request.targetTone,
      request.targetLength
    );
    
    // 추론 과정
    const reasoning = this.generateReasoning(analysis, request, context);
    
    return {
      content,
      style: request.targetStyle,
      tone: request.targetTone,
      length: request.targetLength,
      targetAudience: analysis.targetAudience,
      reasoning
    };
  }

  /**
   * 감정 분석
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    this.sentimentKeywords.positive.forEach(keyword => {
      if (lowerText.includes(keyword)) positiveScore++;
    });

    this.sentimentKeywords.negative.forEach(keyword => {
      if (lowerText.includes(keyword)) negativeScore++;
    });

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  /**
   * 전체 감정 계산
   */
  private calculateOverallSentiment(sentiments: ('positive' | 'negative' | 'neutral')[]): 'positive' | 'negative' | 'neutral' {
    const counts = {
      positive: sentiments.filter(s => s === 'positive').length,
      negative: sentiments.filter(s => s === 'negative').length,
      neutral: sentiments.filter(s => s === 'neutral').length
    };

    if (counts.positive > counts.negative && counts.positive > counts.neutral) return 'positive';
    if (counts.negative > counts.positive && counts.negative > counts.neutral) return 'negative';
    return 'neutral';
  }

  /**
   * 주요 토픽 추출
   */
  private extractDominantTopics(keywords: string[]): string[] {
    const keywordCounts = new Map<string, number>();
    
    keywords.forEach(keyword => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });

    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }

  /**
   * 공통 키워드 찾기
   */
  private findCommonKeywords(keywords: string[]): string[] {
    const keywordCounts = new Map<string, number>();
    
    keywords.forEach(keyword => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });

    return Array.from(keywordCounts.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  /**
   * 참여도 수준 계산
   */
  private calculateEngagementLevel(comments: WebComment[]): 'high' | 'medium' | 'low' {
    const totalLikes = comments.reduce((sum, comment) => sum + comment.likes, 0);
    const totalReplies = comments.reduce((sum, comment) => sum + comment.replies.length, 0);
    const avgLikes = totalLikes / comments.length;
    const avgReplies = totalReplies / comments.length;

    if (avgLikes > 10 || avgReplies > 3) return 'high';
    if (avgLikes > 3 || avgReplies > 1) return 'medium';
    return 'low';
  }

  /**
   * 톤 분석
   */
  private analyzeTone(comments: WebComment[]): 'formal' | 'casual' | 'professional' | 'friendly' {
    const toneCounts = {
      formal: 0,
      casual: 0,
      professional: 0,
      friendly: 0
    };

    comments.forEach(comment => {
      const content = comment.content;
      
      Object.entries(this.tonePatterns).forEach(([tone, patterns]) => {
        patterns.forEach(pattern => {
          if (content.includes(pattern)) {
            toneCounts[tone as keyof typeof toneCounts]++;
          }
        });
      });
    });

    const maxTone = Object.entries(toneCounts).reduce((a, b) => a[1] > b[1] ? a : b);
    return maxTone[0] as 'formal' | 'casual' | 'professional' | 'friendly';
  }

  /**
   * 타겟 오디언스 식별
   */
  private identifyTargetAudience(comments: WebComment[]): string {
    const ageKeywords = {
      '젊은층': ['20대', '30대', '청년', '대학생', '직장인'],
      '중년층': ['40대', '50대', '중년', '부모', '가족'],
      '전문가': ['전문가', '전문', '업계', '산업', '비즈니스'],
      '일반': ['일반', '사람', '사용자', '고객']
    };

    const audienceCounts = new Map<string, number>();

    comments.forEach(comment => {
      Object.entries(ageKeywords).forEach(([audience, keywords]) => {
        keywords.forEach(keyword => {
          if (comment.content.includes(keyword)) {
            audienceCounts.set(audience, (audienceCounts.get(audience) || 0) + 1);
          }
        });
      });
    });

    if (audienceCounts.size === 0) return '일반';

    const maxAudience = Array.from(audienceCounts.entries()).reduce((a, b) => a[1] > b[1] ? a : b);
    return maxAudience[0];
  }

  /**
   * 컨텍스트 분석
   */
  private analyzeContext(originalContent: string, comments: WebComment[]): any {
    return {
      mainTopic: this.extractMainTopic(originalContent),
      commentTrends: this.analyzeCommentTrends(comments),
      sentimentDistribution: this.calculateSentimentDistribution(comments),
      keyIssues: this.identifyKeyIssues(comments)
    };
  }

  /**
   * 주요 토픽 추출
   */
  private extractMainTopic(content: string): string {
    // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
    const keywords = content.split(/\s+/).filter(word => word.length > 2);
    const keywordCounts = new Map<string, number>();
    
    keywords.forEach(keyword => {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
    });

    const mainKeyword = Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    return mainKeyword ? mainKeyword[0] : '일반';
  }

  /**
   * 댓글 트렌드 분석
   */
  private analyzeCommentTrends(comments: WebComment[]): any {
    const recentComments = comments
      .filter(comment => {
        const daysAgo = (Date.now() - comment.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7;
      });

    return {
      recentCount: recentComments.length,
      recentSentiment: this.calculateOverallSentiment(recentComments.map(c => this.analyzeSentiment(c.content))),
      engagementTrend: this.calculateEngagementLevel(recentComments)
    };
  }

  /**
   * 감정 분포 계산
   */
  private calculateSentimentDistribution(comments: WebComment[]): any {
    const sentiments = comments.map(comment => this.analyzeSentiment(comment.content));
    const total = sentiments.length;
    
    return {
      positive: sentiments.filter(s => s === 'positive').length / total,
      negative: sentiments.filter(s => s === 'negative').length / total,
      neutral: sentiments.filter(s => s === 'neutral').length / total
    };
  }

  /**
   * 주요 이슈 식별
   */
  private identifyKeyIssues(comments: WebComment[]): string[] {
    const issueKeywords = ['문제', '이슈', '개선', '해결', '불만', '요청', '제안'];
    const issues: string[] = [];

    comments.forEach(comment => {
      issueKeywords.forEach(keyword => {
        if (comment.content.includes(keyword)) {
          // 간단한 이슈 추출
          const sentences = comment.content.split(/[.!?]/);
          sentences.forEach(sentence => {
            if (sentence.includes(keyword) && sentence.length > 10) {
              issues.push(sentence.trim());
            }
          });
        }
      });
    });

    return [...new Set(issues)].slice(0, 5);
  }

  /**
   * 템플릿 선택
   */
  private selectTemplate(style: string, analysis: CommentAnalysis): string {
    const templates = {
      supportive: {
        positive: '정말 좋은 의견이네요! {topic}에 대해 {keyword} 측면에서 더욱 발전할 수 있을 것 같습니다.',
        negative: '의견을 잘 들었습니다. {topic}에 대해 {keyword} 관점에서 개선 방안을 제시해주셔서 감사합니다.',
        neutral: '흥미로운 관점입니다. {topic}에 대해 {keyword} 측면에서 더 논의해보면 좋겠네요.'
      },
      critical: {
        positive: '긍정적인 부분도 있지만, {topic}에 대해 {keyword} 측면에서 더 신중하게 접근해야 할 것 같습니다.',
        negative: '지적하신 부분이 맞습니다. {topic}에 대해 {keyword} 관점에서 근본적인 개선이 필요합니다.',
        neutral: '객관적인 분석이 필요합니다. {topic}에 대해 {keyword} 측면에서 더 구체적인 검토가 필요합니다.'
      },
      neutral: {
        positive: '{topic}에 대한 긍정적인 반응이 많네요. {keyword} 측면에서 주목할 만합니다.',
        negative: '{topic}에 대한 우려가 있네요. {keyword} 관점에서 개선이 필요해 보입니다.',
        neutral: '{topic}에 대한 다양한 의견이 있습니다. {keyword} 측면에서 더 논의해보면 좋겠습니다.'
      },
      informative: {
        positive: '{topic}에 대한 정보를 공유드립니다. {keyword} 측면에서 참고하실 수 있을 것 같습니다.',
        negative: '{topic}에 대한 주의사항을 알려드립니다. {keyword} 관점에서 확인해보시기 바랍니다.',
        neutral: '{topic}에 대한 객관적인 정보입니다. {keyword} 측면에서 참고하시기 바랍니다.'
      }
    };

    const sentiment = analysis.overallSentiment;
    return templates[style as keyof typeof templates][sentiment];
  }

  /**
   * 키워드 통합
   */
  private integrateKeywords(
    commonKeywords: string[],
    specificTopics?: string[],
    avoidKeywords?: string[]
  ): string[] {
    let keywords = [...commonKeywords];
    
    if (specificTopics) {
      keywords = [...keywords, ...specificTopics];
    }
    
    if (avoidKeywords) {
      keywords = keywords.filter(keyword => !avoidKeywords.includes(keyword));
    }
    
    return [...new Set(keywords)].slice(0, 5);
  }

  /**
   * 댓글 내용 생성
   */
  private async generateContent(
    template: string,
    context: any,
    keywords: string[],
    tone: string,
    length: string
  ): Promise<string> {
    // 템플릿에 키워드 삽입
    let content = template
      .replace('{topic}', context.mainTopic)
      .replace('{keyword}', keywords[0] || '관련');

    // 톤에 맞게 조정
    content = this.adjustTone(content, tone);

    // 길이에 맞게 조정
    content = this.adjustLength(content, length);

    return content;
  }

  /**
   * 톤 조정
   */
  private adjustTone(content: string, targetTone: string): string {
    const toneAdjustments = {
      formal: (text: string) => text.replace(/~야/g, '~입니다').replace(/~어/g, '~습니다'),
      casual: (text: string) => text.replace(/~입니다/g, '~야').replace(/~습니다/g, '~어'),
      professional: (text: string) => text.replace(/~다/g, '~입니다').replace(/~네/g, '~입니다'),
      friendly: (text: string) => text.replace(/~입니다/g, '~이에요').replace(/~습니다/g, '~해요')
    };

    const adjuster = toneAdjustments[targetTone as keyof typeof toneAdjustments];
    return adjuster ? adjuster(content) : content;
  }

  /**
   * 길이 조정
   */
  private adjustLength(content: string, targetLength: string): string {
    const lengthTargets = {
      short: 50,
      medium: 100,
      long: 200
    };

    const target = lengthTargets[targetLength as keyof typeof lengthTargets];
    
    if (content.length <= target) return content;
    
    // 긴 내용을 줄이기
    const sentences = content.split(/[.!?]/);
    let result = '';
    
    for (const sentence of sentences) {
      if ((result + sentence).length <= target) {
        result += sentence + '. ';
      } else {
        break;
      }
    }
    
    return result.trim();
  }

  /**
   * 추론 과정 생성
   */
  private generateReasoning(
    analysis: CommentAnalysis,
    request: CommentGenerationRequest,
    context: any
  ): string {
    const reasons = [
      `전체 댓글의 감정은 ${analysis.overallSentiment}적입니다.`,
      `주요 토픽은 ${analysis.dominantTopics.join(', ')}입니다.`,
      `대부분의 댓글이 ${analysis.tone}한 톤을 사용합니다.`,
      `타겟 오디언스는 ${analysis.targetAudience}입니다.`,
      `요청하신 스타일은 ${request.targetStyle}이며, 톤은 ${request.targetTone}입니다.`
    ];

    return reasons.join(' ');
  }

  /**
   * 웹 검색 결과에서 댓글 추출 (실제 구현에서는 웹 스크래핑 사용)
   */
  async extractCommentsFromWebSearch(searchQuery: string): Promise<WebComment[]> {
    // 실제로는 웹 스크래핑 API를 호출하여 댓글을 추출
    // 여기서는 모의 데이터를 반환
    return [
      {
        id: '1',
        content: '정말 유용한 정보네요! 감사합니다.',
        author: '사용자1',
        timestamp: new Date(),
        likes: 15,
        replies: [],
        sentiment: 'positive',
        topic: searchQuery,
        keywords: ['유용', '정보', '감사']
      },
      {
        id: '2',
        content: '이 부분에 대해 더 자세한 설명이 필요합니다.',
        author: '사용자2',
        timestamp: new Date(),
        likes: 8,
        replies: [],
        sentiment: 'neutral',
        topic: searchQuery,
        keywords: ['자세', '설명', '필요']
      }
    ];
  }
}

// 싱글톤 인스턴스
export const webCommentAnalysisService = new WebCommentAnalysisService();

export default webCommentAnalysisService;
