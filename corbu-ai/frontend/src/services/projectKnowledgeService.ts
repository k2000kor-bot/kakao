import { Project, ProjectFile } from '../types/project';
import { projectService } from './projectService';

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: 'web_search' | 'chat_extraction' | 'manual' | 'file_upload';
  sourceUrl?: string;
  tags: string[];
  category: 'technical' | 'business' | 'research' | 'reference' | 'tutorial' | 'news';
  confidence: number; // 0-1, 정보의 신뢰도
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
  accessCount: number;
  relatedProjectId: string;
  extractedFrom?: {
    chatId: string;
    messageId: string;
    timestamp: Date;
  };
  metadata?: {
    author?: string;
    publicationDate?: string;
    domain?: string;
    language?: string;
    wordCount?: number;
  };
}

export interface KnowledgeSearchResult {
  entry: KnowledgeEntry;
  relevanceScore: number;
  matchedTerms: string[];
  context: string;
}

export interface KnowledgeAnalytics {
  totalEntries: number;
  categoryDistribution: { [key: string]: number };
  sourceDistribution: { [key: string]: number };
  mostAccessedEntries: KnowledgeEntry[];
  recentAdditions: KnowledgeEntry[];
  knowledgeGrowth: {
    date: string;
    count: number;
  }[];
}

class ProjectKnowledgeService {
  private readonly KNOWLEDGE_KEY = 'project_knowledge_';

  // 프로젝트별 지식베이스 조회
  getProjectKnowledge(projectId: string): KnowledgeEntry[] {
    const key = this.KNOWLEDGE_KEY + projectId;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // 지식 엔트리 추가
  addKnowledgeEntry(projectId: string, entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessed' | 'accessCount'>): KnowledgeEntry {
    const knowledge = this.getProjectKnowledge(projectId);
    const newEntry: KnowledgeEntry = {
      ...entry,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 0
    };

    knowledge.push(newEntry);
    this.saveProjectKnowledge(projectId, knowledge);
    return newEntry;
  }

  // 웹 검색 결과를 지식베이스에 추가
  async addWebSearchResults(projectId: string, searchQuery: string, searchResults: any[], chatId?: string, messageId?: string): Promise<KnowledgeEntry[]> {
    const addedEntries: KnowledgeEntry[] = [];

    for (const result of searchResults) {
      // 중복 검사
      const existing = this.findSimilarKnowledge(projectId, result.title, result.snippet);
      if (existing) {
        // 기존 엔트리 업데이트
        existing.updatedAt = new Date();
        existing.accessCount++;
        this.updateKnowledgeEntry(projectId, existing);
        addedEntries.push(existing);
        continue;
      }

      // 새로운 지식 엔트리 생성
      const entry = this.addKnowledgeEntry(projectId, {
        title: result.title || '웹 검색 결과',
        content: this.extractContentFromWebResult(result),
        source: 'web_search',
        sourceUrl: result.link,
        tags: this.extractTagsFromContent(result.title + ' ' + result.snippet),
        category: this.categorizeContent(result.title + ' ' + result.snippet),
        confidence: this.calculateConfidence(result),
        relatedProjectId: projectId,
        extractedFrom: chatId && messageId ? {
          chatId,
          messageId,
          timestamp: new Date()
        } : undefined,
        metadata: {
          author: result.author,
          publicationDate: result.date,
          domain: result.link ? new URL(result.link).hostname : undefined,
          language: 'ko', // 기본값, 실제로는 언어 감지 필요
          wordCount: (result.title + ' ' + result.snippet).split(' ').length
        }
      });

      addedEntries.push(entry);
    }

    return addedEntries;
  }

  // 채팅 메시지에서 지식 추출 및 추가
  async extractKnowledgeFromChat(projectId: string, chatId: string, messageId: string, messageContent: string, isAIResponse: boolean = false): Promise<KnowledgeEntry[]> {
    const extractedEntries: KnowledgeEntry[] = [];

    // AI 응답에서만 지식 추출 (사용자 메시지는 제외)
    if (!isAIResponse) {
      return extractedEntries;
    }

    // 지식 추출 로직
    const knowledgeSnippets = this.extractKnowledgeSnippets(messageContent);

    for (const snippet of knowledgeSnippets) {
      // 중복 검사
      const existing = this.findSimilarKnowledge(projectId, snippet.title, snippet.content);
      if (existing) {
        existing.updatedAt = new Date();
        existing.accessCount++;
        this.updateKnowledgeEntry(projectId, existing);
        extractedEntries.push(existing);
        continue;
      }

      // 새로운 지식 엔트리 생성
      const entry = this.addKnowledgeEntry(projectId, {
        title: snippet.title,
        content: snippet.content,
        source: 'chat_extraction',
        tags: this.extractTagsFromContent(snippet.content),
        category: this.categorizeContent(snippet.content),
        confidence: snippet.confidence,
        relatedProjectId: projectId,
        extractedFrom: {
          chatId,
          messageId,
          timestamp: new Date()
        },
        metadata: {
          wordCount: snippet.content.split(' ').length
        }
      });

      extractedEntries.push(entry);
    }

    return extractedEntries;
  }

  // 지식 검색
  searchKnowledge(projectId: string, query: string, limit: number = 10): KnowledgeSearchResult[] {
    const knowledge = this.getProjectKnowledge(projectId);
    const results: KnowledgeSearchResult[] = [];

    for (const entry of knowledge) {
      const relevanceScore = this.calculateRelevance(entry, query);
      if (relevanceScore > 0.1) { // 임계값
        const matchedTerms = this.findMatchedTerms(entry, query);
        const context = this.extractContext(entry, query);

        results.push({
          entry,
          relevanceScore,
          matchedTerms,
          context
        });
      }
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  // 지식베이스 업데이트
  updateKnowledgeEntry(projectId: string, entry: KnowledgeEntry): void {
    const knowledge = this.getProjectKnowledge(projectId);
    const index = knowledge.findIndex(k => k.id === entry.id);

    if (index !== -1) {
      knowledge[index] = { ...entry, updatedAt: new Date() };
      this.saveProjectKnowledge(projectId, knowledge);
    }
  }

  // 지식 엔트리 삭제
  deleteKnowledgeEntry(projectId: string, entryId: string): void {
    const knowledge = this.getProjectKnowledge(projectId);
    const filtered = knowledge.filter(k => k.id !== entryId);
    this.saveProjectKnowledge(projectId, filtered);
  }

  // 지식베이스 분석
  getKnowledgeAnalytics(projectId: string): KnowledgeAnalytics {
    const knowledge = this.getProjectKnowledge(projectId);

    const categoryDistribution: { [key: string]: number } = {};
    const sourceDistribution: { [key: string]: number } = {};

    knowledge.forEach(entry => {
      categoryDistribution[entry.category] = (categoryDistribution[entry.category] || 0) + 1;
      sourceDistribution[entry.source] = (sourceDistribution[entry.source] || 0) + 1;
    });

    const mostAccessedEntries = [...knowledge]
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5);

    const recentAdditions = [...knowledge]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // 지식 성장 추이 (최근 30일)
    const knowledgeGrowth = this.calculateKnowledgeGrowth(knowledge);

    return {
      totalEntries: knowledge.length,
      categoryDistribution,
      sourceDistribution,
      mostAccessedEntries,
      recentAdditions,
      knowledgeGrowth
    };
  }

  // 프로젝트 파일을 지식베이스에 추가
  async addFileToKnowledge(projectId: string, file: ProjectFile): Promise<KnowledgeEntry> {
    const content = await this.extractFileContent(file);

    return this.addKnowledgeEntry(projectId, {
      title: file.name,
      content: content,
      source: 'file_upload',
      sourceUrl: file.url,
      tags: file.tags || this.extractTagsFromContent(content),
      category: this.categorizeContent(content),
      confidence: 0.8, // 파일은 높은 신뢰도
      relatedProjectId: projectId,
      metadata: {
        author: undefined,
        publicationDate: undefined,
        domain: undefined,
        language: 'ko',
        wordCount: content.split(' ').length
      }
    });
  }

  // 유사한 지식 검색
  findSimilarKnowledge(projectId: string, title: string, content: string): KnowledgeEntry | null {
    const knowledge = this.getProjectKnowledge(projectId);

    for (const entry of knowledge) {
      const titleSimilarity = this.calculateSimilarity(title, entry.title);
      const contentSimilarity = this.calculateSimilarity(content, entry.content);

      if (titleSimilarity > 0.8 || contentSimilarity > 0.7) {
        return entry;
      }
    }

    return null;
  }

  // 지식 추천
  getKnowledgeRecommendations(projectId: string, currentContext: string): KnowledgeEntry[] {
    const knowledge = this.getProjectKnowledge(projectId);
    const recommendations: { entry: KnowledgeEntry; score: number }[] = [];

    for (const entry of knowledge) {
      const relevanceScore = this.calculateRelevance(entry, currentContext);
      const recencyScore = this.calculateRecencyScore(entry);
      const popularityScore = entry.accessCount / Math.max(...knowledge.map(k => k.accessCount));

      const totalScore = relevanceScore * 0.6 + recencyScore * 0.2 + popularityScore * 0.2;

      if (totalScore > 0.3) {
        recommendations.push({ entry, score: totalScore });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.entry);
  }

  // 지식베이스 내보내기
  exportKnowledge(projectId: string): string {
    const knowledge = this.getProjectKnowledge(projectId);
    return JSON.stringify(knowledge, null, 2);
  }

  // 지식베이스 가져오기
  importKnowledge(projectId: string, data: string): void {
    try {
      const knowledge: KnowledgeEntry[] = JSON.parse(data);
      this.saveProjectKnowledge(projectId, knowledge);
    } catch (error) {
      console.error('지식베이스 가져오기 실패:', error);
    }
  }

  // 유틸리티 메서드들
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveProjectKnowledge(projectId: string, knowledge: KnowledgeEntry[]): void {
    const key = this.KNOWLEDGE_KEY + projectId;
    localStorage.setItem(key, JSON.stringify(knowledge));
  }

  private extractContentFromWebResult(result: any): string {
    return `${result.title}\n\n${result.snippet}`;
  }

  private extractTagsFromContent(content: string): string[] {
    // 간단한 태그 추출 로직 (실제로는 더 정교한 NLP 필요)
    const words = content.toLowerCase().split(/\s+/);
    const tagCandidates = words.filter(word =>
      word.length > 2 &&
      !['the', 'and', 'for', 'with', 'this', 'that', 'are', 'was', 'were', 'will', 'can', 'has', 'have', 'had'].includes(word)
    );

    return Array.from(new Set(tagCandidates)).slice(0, 5);
  }

  private categorizeContent(content: string): KnowledgeEntry['category'] {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('api') || lowerContent.includes('code') || lowerContent.includes('프로그래밍')) {
      return 'technical';
    } else if (lowerContent.includes('비즈니스') || lowerContent.includes('마케팅') || lowerContent.includes('전략')) {
      return 'business';
    } else if (lowerContent.includes('연구') || lowerContent.includes('분석') || lowerContent.includes('데이터')) {
      return 'research';
    } else if (lowerContent.includes('튜토리얼') || lowerContent.includes('가이드') || lowerContent.includes('방법')) {
      return 'tutorial';
    } else if (lowerContent.includes('뉴스') || lowerContent.includes('소식') || lowerContent.includes('업데이트')) {
      return 'news';
    } else {
      return 'reference';
    }
  }

  private calculateConfidence(result: any): number {
    // 웹 검색 결과의 신뢰도 계산
    let confidence = 0.5; // 기본값

    if (result.link) {
      const domain = new URL(result.link).hostname;
      if (domain.includes('github.com') || domain.includes('stackoverflow.com')) {
        confidence += 0.2;
      }
      if (domain.includes('.edu') || domain.includes('wikipedia.org')) {
        confidence += 0.1;
      }
    }

    if (result.snippet && result.snippet.length > 100) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  private extractKnowledgeSnippets(content: string): Array<{ title: string; content: string; confidence: number }> {
    const snippets: Array<{ title: string; content: string; confidence: number }> = [];

    // 문장 단위로 분리
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);

    for (const sentence of sentences) {
      // 지식으로 추출할 만한 문장인지 판단
      if (this.isKnowledgeWorthy(sentence)) {
        const title = sentence.substring(0, 50) + '...';
        const confidence = this.calculateSentenceConfidence(sentence);

        snippets.push({
          title,
          content: sentence.trim(),
          confidence
        });
      }
    }

    return snippets;
  }

  private isKnowledgeWorthy(sentence: string): boolean {
    const lowerSentence = sentence.toLowerCase();

    // 지식으로 가치있는 문장 패턴
    const knowledgePatterns = [
      /^[A-Z][^.!?]*는\s+[^.!?]*입니다/,
      /^[A-Z][^.!?]*는\s+[^.!?]*다/,
      /^[A-Z][^.!?]*의\s+[^.!?]*는\s+[^.!?]*입니다/,
      /^[A-Z][^.!?]*에서\s+[^.!?]*를\s+[^.!?]*할\s+수\s+있습니다/,
      /^[A-Z][^.!?]*를\s+[^.!?]*하면\s+[^.!?]*됩니다/,
      /^[A-Z][^.!?]*는\s+[^.!?]*의\s+[^.!?]*입니다/,
      /^[A-Z][^.!?]*가\s+[^.!?]*에\s+[^.!?]*합니다/,
      /^[A-Z][^.!?]*을\s+[^.!?]*하면\s+[^.!?]*할\s+수\s+있습니다/
    ];

    return knowledgePatterns.some(pattern => pattern.test(sentence)) ||
      lowerSentence.includes('예를 들어') ||
      lowerSentence.includes('참고로') ||
      lowerSentence.includes('주의사항') ||
      lowerSentence.includes('팁') ||
      lowerSentence.includes('권장사항');
  }

  private calculateSentenceConfidence(sentence: string): number {
    let confidence = 0.5;

    if (sentence.includes('예를 들어') || sentence.includes('참고로')) {
      confidence += 0.2;
    }

    if (sentence.length > 50) {
      confidence += 0.1;
    }

    if (sentence.includes('입니다') || sentence.includes('다')) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  private calculateRelevance(entry: KnowledgeEntry, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const titleTerms = entry.title.toLowerCase().split(/\s+/);
    const contentTerms = entry.content.toLowerCase().split(/\s+/);
    const tagTerms = entry.tags.map(tag => tag.toLowerCase());

    let score = 0;

    for (const queryTerm of queryTerms) {
      if (titleTerms.includes(queryTerm)) score += 0.4;
      if (contentTerms.includes(queryTerm)) score += 0.3;
      if (tagTerms.includes(queryTerm)) score += 0.3;
    }

    return Math.min(1, score);
  }

  private findMatchedTerms(entry: KnowledgeEntry, query: string): string[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const allTerms = [
      ...entry.title.toLowerCase().split(/\s+/),
      ...entry.content.toLowerCase().split(/\s+/),
      ...entry.tags.map(tag => tag.toLowerCase())
    ];

    return queryTerms.filter(term => allTerms.includes(term));
  }

  private extractContext(entry: KnowledgeEntry, query: string): string {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const sentences = entry.content.split(/[.!?]+/);

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      if (queryTerms.some(term => sentenceLower.includes(term))) {
        return sentence.trim();
      }
    }

    return entry.content.substring(0, 100) + '...';
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
    const union = new Set([...Array.from(words1), ...Array.from(words2)]);

    return intersection.size / union.size;
  }

  private calculateRecencyScore(entry: KnowledgeEntry): number {
    const daysSinceCreation = (Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSinceCreation / 30); // 30일 기준
  }

  private calculateKnowledgeGrowth(knowledge: KnowledgeEntry[]): Array<{ date: string; count: number }> {
    const growth: { [key: string]: number } = {};
    const today = new Date();

    // 최근 30일 데이터 생성
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      growth[dateStr] = 0;
    }

    // 각 엔트리의 생성일 기준으로 카운트
    knowledge.forEach(entry => {
      const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
      if (growth[dateStr] !== undefined) {
        growth[dateStr]++;
      }
    });

    return Object.entries(growth).map(([date, count]) => ({ date, count }));
  }

  private async extractFileContent(file: ProjectFile): Promise<string> {
    // ProjectFile 타입에 content 속성이 없으므로 기본값 반환
    return `파일: ${file.name} (${file.type})`;

    // 파일 타입별 내용 추출 로직
    switch (file.type) {
      case 'document':
        return `문서 파일: ${file.name}`;
      case 'image':
        return `이미지 파일: ${file.name}`;
      case 'code':
        return `코드 파일: ${file.name}`;
      default:
        return `파일: ${file.name}`;
    }
  }
}

export const projectKnowledgeService = new ProjectKnowledgeService();
export default projectKnowledgeService;

