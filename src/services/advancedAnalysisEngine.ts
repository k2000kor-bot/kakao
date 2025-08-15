import { ChatSession, Message } from '../types/chat';
import { Project } from '../types/project';

interface AnalysisResult {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    keywords: string[];
    topics: string[];
    suggestions: string[];
    relatedQuestions: string[];
}

interface ContextualInsight {
    type: 'pattern' | 'trend' | 'anomaly' | 'opportunity';
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    priority: 'high' | 'medium' | 'low';
}

class AdvancedAnalysisEngine {

    // 고급 감정 분석
    async analyzeSentiment(text: string): Promise<AnalysisResult> {
        const positiveWords = ['좋다', '훌륭하다', '성공', '개선', '향상', '만족', '긍정적'];
        const negativeWords = ['문제', '실패', '어려움', '불만', '부정적', '실패', '위험'];

        const words = text.toLowerCase().match(/[가-힣]+/g) || [];
        const positiveCount = words.filter(word => positiveWords.includes(word)).length;
        const negativeCount = words.filter(word => negativeWords.includes(word)).length;

        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        let confidence = 0.5;

        if (positiveCount > negativeCount) {
            sentiment = 'positive';
            confidence = Math.min(0.9, 0.5 + (positiveCount - negativeCount) * 0.1);
        } else if (negativeCount > positiveCount) {
            sentiment = 'negative';
            confidence = Math.min(0.9, 0.5 + (negativeCount - positiveCount) * 0.1);
        }

        return {
            sentiment,
            confidence,
            keywords: this.extractKeywords(text),
            topics: this.identifyTopics(text),
            suggestions: this.generateSuggestions(sentiment, text),
            relatedQuestions: this.generateRelatedQuestions(text)
        };
    }

    // 키워드 추출
    private extractKeywords(text: string): string[] {
        const stopWords = ['이', '그', '저', '것', '수', '등', '및', '또는', '그리고'];
        const words = text.toLowerCase().match(/[가-힣]+/g) || [];
        const wordCount: { [key: string]: number } = {};

        words.forEach(word => {
            if (word.length > 1 && !stopWords.includes(word)) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });

        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    // 주제 식별
    private identifyTopics(text: string): string[] {
        const topics: string[] = [];

        if (text.includes('프로젝트') || text.includes('계획')) topics.push('프로젝트 관리');
        if (text.includes('문제') || text.includes('해결')) topics.push('문제 해결');
        if (text.includes('분석') || text.includes('데이터')) topics.push('데이터 분석');
        if (text.includes('개선') || text.includes('최적화')) topics.push('프로세스 개선');
        if (text.includes('팀') || text.includes('협업')) topics.push('팀워크');

        return topics.length > 0 ? topics : ['일반'];
    }

    // 제안사항 생성
    private generateSuggestions(sentiment: string, text: string): string[] {
        const suggestions: string[] = [];

        if (sentiment === 'negative') {
            suggestions.push('문제의 근본 원인을 파악해보세요');
            suggestions.push('단계별 해결 방안을 수립해보세요');
            suggestions.push('관련 전문가의 조언을 구해보세요');
        } else if (sentiment === 'positive') {
            suggestions.push('성공 요인을 분석하여 다른 영역에도 적용해보세요');
            suggestions.push('더 나은 결과를 위한 개선 방안을 모색해보세요');
        } else {
            suggestions.push('더 구체적인 정보를 제공해주세요');
            suggestions.push('목표와 우선순위를 명확히 해보세요');
        }

        return suggestions;
    }

    // 관련 질문 생성
    private generateRelatedQuestions(text: string): string[] {
        const questions: string[] = [];

        if (text.includes('어떻게')) {
            questions.push('이 방법의 구체적인 단계는 무엇인가요?');
            questions.push('이 방법의 예상 소요 시간은 얼마인가요?');
            questions.push('이 방법의 성공 확률은 어느 정도인가요?');
        } else if (text.includes('왜')) {
            questions.push('이 현상의 다른 가능한 원인은 무엇인가요?');
            questions.push('이 문제를 예방할 수 있는 방법은 무엇인가요?');
        } else {
            questions.push('이 주제에 대해 더 자세히 알고 싶은 부분이 있나요?');
            questions.push('실제 적용 가능한 구체적인 방안이 있나요?');
        }

        return questions;
    }

    // 컨텍스트 기반 인사이트 생성
    async generateContextualInsights(
        currentMessage: string,
        conversationHistory: Message[],
        project: Project | null
    ): Promise<ContextualInsight[]> {
        const insights: ContextualInsight[] = [];

        // 패턴 분석
        const patterns = this.analyzeConversationPatterns(conversationHistory);
        if (patterns.length > 0) {
            insights.push({
                type: 'pattern',
                title: '대화 패턴 발견',
                description: `이전 대화에서 ${patterns.length}개의 반복 패턴을 발견했습니다.`,
                confidence: 0.8,
                actionable: true,
                priority: 'medium'
            });
        }

        // 트렌드 분석
        const trends = this.analyzeTrends(conversationHistory);
        if (trends.length > 0) {
            insights.push({
                type: 'trend',
                title: '관심사 트렌드',
                description: `최근 대화에서 ${trends[0]}에 대한 관심이 증가하고 있습니다.`,
                confidence: 0.7,
                actionable: true,
                priority: 'high'
            });
        }

        // 프로젝트 연관성 분석
        if (project) {
            const projectRelevance = this.analyzeProjectRelevance(currentMessage, project);
            if (projectRelevance > 0.6) {
                insights.push({
                    type: 'opportunity',
                    title: '프로젝트 연관성 높음',
                    description: '현재 질문이 프로젝트 목표와 높은 연관성을 보입니다.',
                    confidence: projectRelevance,
                    actionable: true,
                    priority: 'high'
                });
            }
        }

        return insights;
    }

    // 대화 패턴 분석
    private analyzeConversationPatterns(history: Message[]): string[] {
        const patterns: string[] = [];
        const userMessages = history.filter(msg => msg.isUser).map(msg => msg.content);

        // 질문 패턴 분석
        const questionCount = userMessages.filter(msg => msg.includes('?') || msg.includes('?')).length;
        if (questionCount > userMessages.length * 0.7) {
            patterns.push('질문 중심 대화');
        }

        // 주제 반복 패턴
        const topics = userMessages.flatMap(msg => this.identifyTopics(msg));
        const topicCounts: { [key: string]: number } = {};
        topics.forEach(topic => {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });

        const repeatedTopics = Object.entries(topicCounts)
            .filter(([, count]) => count > 2)
            .map(([topic]) => topic);

        if (repeatedTopics.length > 0) {
            patterns.push(`${repeatedTopics[0]} 주제 반복`);
        }

        return patterns;
    }

    // 트렌드 분석
    private analyzeTrends(history: Message[]): string[] {
        const recentMessages = history.slice(-5);
        const allMessages = history;

        const recentTopics = recentMessages.flatMap(msg => this.identifyTopics(msg.content));
        const allTopics = allMessages.flatMap(msg => this.identifyTopics(msg.content));

        const recentTopicCounts: { [key: string]: number } = {};
        const allTopicCounts: { [key: string]: number } = {};

        recentTopics.forEach(topic => {
            recentTopicCounts[topic] = (recentTopicCounts[topic] || 0) + 1;
        });

        allTopics.forEach(topic => {
            allTopicCounts[topic] = (allTopicCounts[topic] || 0) + 1;
        });

        const trendingTopics: string[] = [];

        Object.entries(recentTopicCounts).forEach(([topic, recentCount]) => {
            const allCount = allTopicCounts[topic] || 0;
            const recentRatio = recentCount / recentMessages.length;
            const allRatio = allCount / allMessages.length;

            if (recentRatio > allRatio * 1.5) {
                trendingTopics.push(topic);
            }
        });

        return trendingTopics;
    }

    // 프로젝트 연관성 분석
    private analyzeProjectRelevance(message: string, project: Project): number {
        const projectKeywords = [
            project.name,
            project.description,
            ...(project.files?.map(f => f.name) || []),
            ...(project.guidelines?.map(g => g.title) || [])
        ].join(' ').toLowerCase();

        const messageWords = message.toLowerCase().match(/[가-힣]+/g) || [];
        const projectWords = projectKeywords.match(/[가-힣]+/g) || [];

        const commonWords = messageWords.filter(word =>
            projectWords.some(w => w === word) && word.length > 1
        );

        return Math.min(1, commonWords.length / Math.max(messageWords.length, 1));
    }

    // 고급 답변 생성
    async generateAdvancedResponse(
        userMessage: string,
        chatSession: ChatSession,
        project: Project | null
    ): Promise<string> {
        const sentiment = await this.analyzeSentiment(userMessage);
        const insights = await this.generateContextualInsights(userMessage, chatSession.messages, project);

        let response = `# 🔍 고급 분석 결과\n\n`;
        response += `## 📊 감정 분석\n\n`;
        response += `**감정**: ${sentiment.sentiment === 'positive' ? '😊 긍정적' : sentiment.sentiment === 'negative' ? '😔 부정적' : '😐 중립적'}\n`;
        response += `**신뢰도**: ${Math.round(sentiment.confidence * 100)}%\n\n`;

        response += `## 🏷️ 키워드\n\n`;
        response += `${sentiment.keywords.map(kw => `• ${kw}`).join('\n')}\n\n`;

        response += `## 📋 주제\n\n`;
        response += `${sentiment.topics.map(topic => `• ${topic}`).join('\n')}\n\n`;

        if (insights.length > 0) {
            response += `## 💡 컨텍스트 인사이트\n\n`;
            insights.forEach(insight => {
                response += `### ${insight.title}\n`;
                response += `${insight.description}\n`;
                response += `**우선순위**: ${insight.priority === 'high' ? '🔴 높음' : insight.priority === 'medium' ? '🟡 중간' : '🟢 낮음'}\n\n`;
            });
        }

        response += `## 💭 제안사항\n\n`;
        sentiment.suggestions.forEach(suggestion => {
            response += `• ${suggestion}\n`;
        });

        response += `\n## ❓ 관련 질문\n\n`;
        sentiment.relatedQuestions.forEach(question => {
            response += `• ${question}\n`;
        });

        return response;
    }
}

const advancedAnalysisEngine = new AdvancedAnalysisEngine();
export default advancedAnalysisEngine;
