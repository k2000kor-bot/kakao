/**
 * 글쓰기 품질 분석 서비스
 */

import { coerceTrimmedString } from '../utils/chatInputUtils';

export interface WritingQualityMetrics {
  readability: number; // 가독성 점수 (0-100)
  coherence: number; // 일관성 점수 (0-100)
  grammar: number; // 문법 점수 (0-100)
  vocabulary: number; // 어휘 다양성 점수 (0-100)
  structure: number; // 구조 점수 (0-100)
  overall: number; // 종합 점수 (0-100)
}

export interface WritingStatistics {
  wordCount: number;
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgWordsPerSentence: number;
  avgCharsPerWord: number;
  readingTime: number; // 분 단위
  uniqueWords: number;
  vocabularyRichness: number; // 고유 단어 비율
}

export interface WritingAnalysis {
  metrics: WritingQualityMetrics;
  statistics: WritingStatistics;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

class WritingQualityAnalyzer {
  /**
   * 글쓰기 품질 분석
   */
  analyzeQuality(content: string): WritingAnalysis {
    const statistics = this.calculateStatistics(content);
    const metrics = this.calculateMetrics(content, statistics);
    const suggestions = this.generateSuggestions(metrics, statistics);
    const strengths = this.identifyStrengths(metrics);
    const weaknesses = this.identifyWeaknesses(metrics);

    return {
      metrics,
      statistics,
      suggestions,
      strengths,
      weaknesses,
    };
  }

  /**
   * 통계 계산
   */
  private calculateStatistics(content: string): WritingStatistics {
    const words = content.split(/\s+/).filter((w) => w.length > 0);
    const sentences = content.split(/[.!?。！？]\s*/).filter((s) => coerceTrimmedString(s, '').length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter((p) => coerceTrimmedString(p, '').length > 0);
    const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^\w가-힣]/g, ''))).size;

    return {
      wordCount: words.length,
      charCount: content.length,
      sentenceCount: sentences.length || 1,
      paragraphCount: paragraphs.length || 1,
      avgWordsPerSentence: words.length / (sentences.length || 1),
      avgCharsPerWord: content.length / (words.length || 1),
      readingTime: Math.ceil(words.length / 200), // 분당 200단어 기준
      uniqueWords,
      vocabularyRichness: uniqueWords / (words.length || 1),
    };
  }

  /**
   * 메트릭 계산
   */
  private calculateMetrics(content: string, stats: WritingStatistics): WritingQualityMetrics {
    // 가독성 점수 (문장 길이, 단어 길이 기반)
    const readability = this.calculateReadability(stats);

    // 일관성 점수 (단락 구조, 문장 흐름 기반)
    const coherence = this.calculateCoherence(content, stats);

    // 문법 점수 (기본적인 문법 패턴 체크)
    const grammar = this.calculateGrammar(content);

    // 어휘 다양성 점수
    const vocabulary = Math.min(100, stats.vocabularyRichness * 200);

    // 구조 점수 (단락 수, 문장 구조 기반)
    const structure = this.calculateStructure(stats);

    // 종합 점수
    const overall = (readability + coherence + grammar + vocabulary + structure) / 5;

    return {
      readability,
      coherence,
      grammar,
      vocabulary,
      structure,
      overall: Math.round(overall * 10) / 10,
    };
  }

  /**
   * 가독성 계산
   */
  private calculateReadability(stats: WritingStatistics): number {
    // 이상적인 값: 문장당 15-20단어, 단어당 4-5글자
    const idealWordsPerSentence = 17.5;
    const idealCharsPerWord = 4.5;

    const wordsScore = Math.max(
      0,
      100 - Math.abs(stats.avgWordsPerSentence - idealWordsPerSentence) * 5
    );
    const charsScore = Math.max(
      0,
      100 - Math.abs(stats.avgCharsPerWord - idealCharsPerWord) * 10
    );

    return (wordsScore + charsScore) / 2;
  }

  /**
   * 일관성 계산
   */
  private calculateCoherence(content: string, stats: WritingStatistics): number {
    let score = 100;

    // 단락이 너무 적으면 감점
    if (stats.paragraphCount < 2 && stats.wordCount > 200) {
      score -= 20;
    }

    // 문장이 너무 짧거나 길면 감점
    if (stats.avgWordsPerSentence < 5) {
      score -= 15;
    }
    if (stats.avgWordsPerSentence > 40) {
      score -= 20;
    }

    // 연결어 사용 확인 (기본적인 체크)
    const connectors = ['그리고', '또한', '그러나', '하지만', '따라서', '그래서', '그런데', '그런즉'];
    const hasConnectors = connectors.some((connector) => content.includes(connector));
    if (!hasConnectors && stats.sentenceCount > 5) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 문법 점수 계산
   */
  private calculateGrammar(content: string): number {
    let score = 100;

    // 기본적인 문법 패턴 체크
    const commonErrors = [
      /[가-힣]\s+[가-힣]\s+[가-힣]\s+[가-힣]\s+[가-힣]\s+[가-힣]\s+[가-힣]\s+[가-힣]\s+[가-힣]\s+[가-힣]/g, // 너무 긴 띄어쓰기
      /[.!?]{2,}/g, // 연속된 구두점
      /\s{3,}/g, // 연속된 공백
    ];

    commonErrors.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        score -= matches.length * 2;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 구조 점수 계산
   */
  private calculateStructure(stats: WritingStatistics): number {
    let score = 100;

    // 적절한 단락 수 확인
    if (stats.wordCount > 300 && stats.paragraphCount < 3) {
      score -= 15;
    }

    // 문장 수 확인
    if (stats.sentenceCount < 3) {
      score -= 10;
    }

    // 단어 수 확인
    if (stats.wordCount < 50) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 개선 제안 생성
   */
  private generateSuggestions(metrics: WritingQualityMetrics, stats: WritingStatistics): string[] {
    const suggestions: string[] = [];

    if (metrics.readability < 70) {
      suggestions.push('문장 길이를 조절하여 가독성을 개선하세요.');
    }

    if (metrics.coherence < 70) {
      suggestions.push('문장 간 연결을 더 자연스럽게 하세요.');
    }

    if (metrics.grammar < 80) {
      suggestions.push('문법과 맞춤법을 다시 확인하세요.');
    }

    if (metrics.vocabulary < 60) {
      suggestions.push('어휘의 다양성을 높이기 위해 유의어를 활용하세요.');
    }

    if (metrics.structure < 70) {
      suggestions.push('글의 구조를 더 명확하게 정리하세요.');
    }

    if (stats.avgWordsPerSentence > 30) {
      suggestions.push('긴 문장을 짧게 나누어 가독성을 높이세요.');
    }

    if (stats.paragraphCount < 2 && stats.wordCount > 200) {
      suggestions.push('내용을 단락으로 나누어 구조를 개선하세요.');
    }

    return suggestions.length > 0 ? suggestions : ['글쓰기 품질이 우수합니다!'];
  }

  /**
   * 강점 식별
   */
  private identifyStrengths(metrics: WritingQualityMetrics): string[] {
    const strengths: string[] = [];

    if (metrics.readability >= 80) {
      strengths.push('가독성이 우수합니다');
    }

    if (metrics.coherence >= 80) {
      strengths.push('일관성이 뛰어납니다');
    }

    if (metrics.grammar >= 90) {
      strengths.push('문법이 정확합니다');
    }

    if (metrics.vocabulary >= 70) {
      strengths.push('어휘가 풍부합니다');
    }

    if (metrics.structure >= 80) {
      strengths.push('구조가 잘 짜여져 있습니다');
    }

    return strengths.length > 0 ? strengths : ['전반적으로 양호합니다'];
  }

  /**
   * 약점 식별
   */
  private identifyWeaknesses(metrics: WritingQualityMetrics): string[] {
    const weaknesses: string[] = [];

    if (metrics.readability < 60) {
      weaknesses.push('가독성 개선 필요');
    }

    if (metrics.coherence < 60) {
      weaknesses.push('일관성 개선 필요');
    }

    if (metrics.grammar < 70) {
      weaknesses.push('문법 검토 필요');
    }

    if (metrics.vocabulary < 50) {
      weaknesses.push('어휘 다양성 부족');
    }

    if (metrics.structure < 60) {
      weaknesses.push('구조 개선 필요');
    }

    return weaknesses;
  }

  /**
   * 글쓰기 스타일 분석
   */
  analyzeStyle(content: string): {
    formality: 'formal' | 'casual' | 'mixed';
    tone: 'positive' | 'neutral' | 'negative';
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    // 격식 있는 표현 체크
    const formalMarkers = ['입니다', '합니다', '하십시오', '드립니다', '하시기', '하시길'];
    const casualMarkers = ['해', '해요', '야', '지', '거야', '거예요'];

    const formalCount = formalMarkers.reduce(
      (count, marker) => count + (content.match(new RegExp(marker, 'g')) || []).length,
      0
    );
    const casualCount = casualMarkers.reduce(
      (count, marker) => count + (content.match(new RegExp(marker, 'g')) || []).length,
      0
    );

    let formality: 'formal' | 'casual' | 'mixed' = 'mixed';
    if (formalCount > casualCount * 2) {
      formality = 'formal';
    } else if (casualCount > formalCount * 2) {
      formality = 'casual';
    }

    // 긍정/부정 톤 체크
    const positiveWords = ['좋', '훌륭', '멋', '행복', '기쁨', '성공', '완벽'];
    const negativeWords = ['나쁜', '슬픔', '실패', '문제', '어려움', '불행'];

    const positiveCount = positiveWords.reduce(
      (count, word) => count + (content.match(new RegExp(word, 'g')) || []).length,
      0
    );
    const negativeCount = negativeWords.reduce(
      (count, word) => count + (content.match(new RegExp(word, 'g')) || []).length,
      0
    );

    let tone: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount * 1.5) {
      tone = 'positive';
    } else if (negativeCount > positiveCount * 1.5) {
      tone = 'negative';
    }

    // 복잡도 계산
    const avgWordsPerSentence = content.split(/\s+/).length / (content.split(/[.!?]/).length || 1);
    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    if (avgWordsPerSentence < 10) {
      complexity = 'simple';
    } else if (avgWordsPerSentence > 25) {
      complexity = 'complex';
    }

    return { formality, tone, complexity };
  }
}

export const writingQualityAnalyzer = new WritingQualityAnalyzer();
export default writingQualityAnalyzer;

