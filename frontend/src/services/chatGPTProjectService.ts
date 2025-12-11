/**
 * ChatGPT 프로젝트 서비스 (더미 구현)
 * 실제 기능이 필요한 경우 구현 필요
 */

class ChatGPTProjectService {
  private static instance: ChatGPTProjectService;

  private constructor() { }

  static getInstance(): ChatGPTProjectService {
    if (!ChatGPTProjectService.instance) {
      ChatGPTProjectService.instance = new ChatGPTProjectService();
    }
    return ChatGPTProjectService.instance;
  }

  // 더미 메서드들
  async createProject(data: any): Promise<any> {
    return { success: true, message: '프로젝트 생성 기능은 아직 구현되지 않았습니다.' };
  }

  async getProjects(): Promise<any[]> {
    return [];
  }

  async updateProject(id: string, data: any): Promise<any> {
    return { success: true, message: '프로젝트 업데이트 기능은 아직 구현되지 않았습니다.' };
  }

  async deleteProject(id: string): Promise<any> {
    return { success: true, message: '프로젝트 삭제 기능은 아직 구현되지 않았습니다.' };
  }
}

export default ChatGPTProjectService;
