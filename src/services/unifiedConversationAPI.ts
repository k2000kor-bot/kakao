// 통합 대화 API 서비스
const API_BASE_URL = 'http://localhost:8001';

// 타입 정의
export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  message_type?: string;
  metadata?: any;
}

export interface CommandRequest {
  command: string;
  args: string[];
  user_id?: string;
}

export interface CommandResponse {
  success: boolean;
  response: string;
  execution_time: number;
  metadata?: any;
}

export interface FileInfo {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_time: string;
  analysis_status: string;
  analysis_result?: any;
}

export interface ProjectInfo {
  id: string;
  name: string;
  description?: string;
  created_time: string;
  updated_time: string;
  file_count: number;
}

export interface SystemStatus {
  is_file_uploading: boolean;
  is_analyzing: boolean;
  is_learning: boolean;
  is_project_loading: boolean;
  active_projects: string[];
  available_commands: string[];
  timestamp: string;
}

// API 서비스 클래스
class UnifiedConversationAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // 기본 HTTP 요청 헬퍼
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API 요청 실패 (${endpoint}):`, error);
      throw error;
    }
  }

  // 명령어 실행
  async executeCommand(command: string, args: string[] = []): Promise<CommandResponse> {
    const request: CommandRequest = {
      command,
      args,
    };

    return this.request<CommandResponse>('/api/command', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // 메시지 추가
  async addMessage(message: Message): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/message', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // 메시지 목록 조회
  async getMessages(limit: number = 50, offset: number = 0): Promise<{ messages: Message[]; total: number }> {
    return this.request<{ messages: Message[]; total: number }>(`/api/messages?limit=${limit}&offset=${offset}`);
  }

  // 파일 업로드
  async uploadFile(file: File): Promise<{ success: boolean; message: string; file_info: FileInfo }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/api/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  }

  // 파일 목록 조회
  async getFiles(): Promise<{ files: FileInfo[]; total: number }> {
    return this.request<{ files: FileInfo[]; total: number }>('/api/files');
  }

  // 시스템 상태 조회
  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/api/status');
  }

  // 프로젝트 생성
  async createProject(name: string, description?: string): Promise<{ success: boolean; message: string; project_id: string }> {
    const formData = new FormData();
    formData.append('name', name);
    if (description) {
      formData.append('description', description);
    }

    const url = `${this.baseURL}/api/project`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      throw error;
    }
  }

  // 프로젝트 목록 조회
  async getProjects(): Promise<{ projects: ProjectInfo[]; total: number }> {
    return this.request<{ projects: ProjectInfo[]; total: number }>('/api/projects');
  }

  // 서버 상태 확인
  async checkServerHealth(): Promise<{ message: string; version: string; status: string; available_commands: string[] }> {
    return this.request<{ message: string; version: string; status: string; available_commands: string[] }>('/');
  }
}

// 싱글톤 인스턴스 생성
export const unifiedConversationAPI = new UnifiedConversationAPI();

// 편의 함수들
export const executeCommand = (command: string, args: string[] = []) => 
  unifiedConversationAPI.executeCommand(command, args);

export const addMessage = (message: Message) => 
  unifiedConversationAPI.addMessage(message);

export const getMessages = (limit: number = 50, offset: number = 0) => 
  unifiedConversationAPI.getMessages(limit, offset);

export const uploadFile = (file: File) => 
  unifiedConversationAPI.uploadFile(file);

export const getFiles = () => 
  unifiedConversationAPI.getFiles();

export const getSystemStatus = () => 
  unifiedConversationAPI.getSystemStatus();

export const createProject = (name: string, description?: string) => 
  unifiedConversationAPI.createProject(name, description);

export const getProjects = () => 
  unifiedConversationAPI.getProjects();

export const checkServerHealth = () => 
  unifiedConversationAPI.checkServerHealth();

export default unifiedConversationAPI; 