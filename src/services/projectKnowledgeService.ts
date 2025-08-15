import { Project, ProjectFile, Guideline } from '../types/project';
import { ChatSession, Message } from '../types/chat';

interface KnowledgeContext {
  projectFiles: ProjectFile[];
  guidelines: Guideline[];
  chatHistory: Message[];
  projectContext: string;
}

class ProjectKnowledgeService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // 프로젝트 지식 컨텍스트 생성
  async createKnowledgeContext(projectId: string, chatSessionId?: string): Promise<KnowledgeContext> {
    try {
      // 프로젝트 정보 로드
      const project = await this.loadProject(projectId);
      if (!project) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }

      // 채팅 히스토리 로드
      let chatHistory: Message[] = [];
      if (chatSessionId) {
        const chatSession = await this.loadChatSession(chatSessionId);
        if (chatSession) {
          chatHistory = chatSession.messages;
        }
      }

      return {
        projectFiles: project.files || [],
        guidelines: project.guidelines || [],
        chatHistory,
        projectContext: this.generateProjectContext(project)
      };
    } catch (error) {
      console.error('지식 컨텍스트 생성 오류:', error);
      throw error;
    }
  }

  // 프로젝트 기반 AI 응답 생성
  async generateProjectBasedResponse(
    userMessage: string,
    projectId: string,
    chatSessionId?: string
  ): Promise<string> {
    try {
      const context = await this.createKnowledgeContext(projectId, chatSessionId);
      
      // 프로젝트 파일과 지침 분석
      const relevantFiles = this.findRelevantFiles(userMessage, context.projectFiles);
      const relevantGuidelines = this.findRelevantGuidelines(userMessage, context.guidelines);
      
      // 컨텍스트 기반 응답 생성
      const response = await this.generateContextualResponse(
        userMessage,
        context,
        relevantFiles,
        relevantGuidelines
      );

      return response;
    } catch (error) {
      console.error('프로젝트 기반 응답 생성 오류:', error);
      return '죄송합니다. 프로젝트 정보를 기반한 응답을 생성하는 중 오류가 발생했습니다.';
    }
  }

  // 관련 파일 찾기
  private findRelevantFiles(userMessage: string, files: ProjectFile[]): ProjectFile[] {
    const keywords = this.extractKeywords(userMessage);
    const relevantFiles: ProjectFile[] = [];

    for (const file of files) {
      const fileKeywords = [
        file.name.toLowerCase(),
        ...(file.tags || []).map(tag => tag.toLowerCase()),
        ...(file.description ? [file.description.toLowerCase()] : [])
      ];

      const relevance = keywords.filter(keyword => 
        fileKeywords.some(fileKeyword => fileKeyword.includes(keyword))
      ).length;

      if (relevance > 0) {
        relevantFiles.push({ ...file, relevance });
      }
    }

    return relevantFiles.sort((a, b) => (b.relevance || 0) - (a.relevance || 0)).slice(0, 5);
  }

  // 관련 지침 찾기
  private findRelevantGuidelines(userMessage: string, guidelines: Guideline[]): Guideline[] {
    const keywords = this.extractKeywords(userMessage);
    const relevantGuidelines: Guideline[] = [];

    for (const guideline of guidelines) {
      const guidelineKeywords = [
        guideline.title.toLowerCase(),
        guideline.content.toLowerCase(),
        guideline.category.toLowerCase()
      ];

      const relevance = keywords.filter(keyword => 
        guidelineKeywords.some(guidelineKeyword => guidelineKeyword.includes(keyword))
      ).length;

      if (relevance > 0) {
        relevantGuidelines.push({ ...guideline, relevance });
      }
    }

    return relevantGuidelines.sort((a, b) => (b.relevance || 0) - (a.relevance || 0)).slice(0, 3);
  }

  // 키워드 추출
  private extractKeywords(text: string): string[] {
    const koreanKeywords = text.match(/[가-힣]+/g) || [];
    const englishKeywords = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return [...koreanKeywords, ...englishKeywords];
  }

  // 프로젝트 컨텍스트 생성
  private generateProjectContext(project: Project): string {
    const context = [
      `프로젝트: ${project.name}`,
      `설명: ${project.description}`,
      `상태: ${project.status}`,
      `우선순위: ${project.priority}`,
      `생성일: ${project.createdAt}`,
      `업데이트: ${project.updatedAt}`,
      `파일 수: ${project.files?.length || 0}`,
      `지침 수: ${project.guidelines?.length || 0}`,
      `채팅 수: ${project.messageCount || 0}`
    ].join('\n');

    return context;
  }

  // 컨텍스트 기반 응답 생성
  private async generateContextualResponse(
    userMessage: string,
    context: KnowledgeContext,
    relevantFiles: ProjectFile[],
    relevantGuidelines: Guideline[]
  ): Promise<string> {
    try {
      // API 호출을 통한 AI 응답 생성
      const response = await fetch(`${this.baseUrl}/api/project/ai-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          projectContext: context.projectContext,
          relevantFiles: relevantFiles.map(file => ({
            name: file.name,
            description: file.description,
            tags: file.tags,
            type: file.type
          })),
          relevantGuidelines: relevantGuidelines.map(guideline => ({
            title: guideline.title,
            content: guideline.content,
            category: guideline.category
          })),
          chatHistory: context.chatHistory.slice(-10) // 최근 10개 메시지만
        })
      });

      if (!response.ok) {
        throw new Error('AI 응답 생성 실패');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('컨텍스트 기반 응답 생성 오류:', error);
      
      // 폴백 응답 생성
      return this.generateFallbackResponse(userMessage, context, relevantFiles, relevantGuidelines);
    }
  }

  // 폴백 응답 생성
  private generateFallbackResponse(
    userMessage: string,
    context: KnowledgeContext,
    relevantFiles: ProjectFile[],
    relevantGuidelines: Guideline[]
  ): string {
    let response = `프로젝트 "${context.projectContext.split('\n')[0].replace('프로젝트: ', '')}"에 대한 답변입니다.\n\n`;

    if (relevantFiles.length > 0) {
      response += `📁 관련 파일:\n`;
      relevantFiles.forEach(file => {
        response += `• ${file.name}${file.description ? ` - ${file.description}` : ''}\n`;
      });
      response += '\n';
    }

    if (relevantGuidelines.length > 0) {
      response += `📋 관련 지침:\n`;
      relevantGuidelines.forEach(guideline => {
        response += `• ${guideline.title}: ${guideline.content.substring(0, 100)}...\n`;
      });
      response += '\n';
    }

    response += `질문: ${userMessage}\n\n`;
    response += `프로젝트 컨텍스트를 기반으로 답변을 생성하려고 했으나, 현재 AI 서비스에 일시적인 문제가 있습니다. 위의 관련 파일과 지침을 참고하여 답변해주시기 바랍니다.`;

    return response;
  }

  // 프로젝트 로드 (실제로는 API 호출)
  private async loadProject(projectId: string): Promise<Project | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/${projectId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('프로젝트 로드 오류:', error);
      return null;
    }
  }

  // 채팅 세션 로드 (실제로는 API 호출)
  private async loadChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/sessions/${sessionId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('채팅 세션 로드 오류:', error);
      return null;
    }
  }
}

const projectKnowledgeService = new ProjectKnowledgeService();
export default projectKnowledgeService;
