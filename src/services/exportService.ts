// 내보내기 서비스
import { Message } from '../types/chat';
import { errorLogger } from '../utils/errorLogger';

export interface ExportOptions {
  format: 'txt' | 'json' | 'csv' | 'pdf';
  includeFiles?: boolean;
  includeGuidelines?: boolean;
  includeMetadata?: boolean;
}

export interface ExportData {
  projectName: string;
  exportDate: Date;
  messages: Message[];
  files?: Array<{
    name: string;
    size: number;
    type: string;
    uploadedAt: Date;
  }>;
  guidelines?: Array<{
    title: string;
    content: string;
    priority: string;
    category: string;
  }>;
  metadata?: {
    totalMessages: number;
    totalFiles: number;
    totalGuidelines: number;
    exportDuration: number;
  };
}

class ExportService {
  // 텍스트 형식으로 내보내기
  exportAsText(data: ExportData): string {
    let content = `=== ${data.projectName} 대화 내역 ===\n`;
    content += `내보내기 날짜: ${data.exportDate.toLocaleString('ko-KR')}\n\n`;

    // 메시지 내보내기
    content += '=== 대화 내역 ===\n';
    data.messages.forEach((message, _index) => {
      const timestamp = message.timestamp;
      const sender = message.sender === 'user' ? '사용자' : 
                    message.sender === 'assistant' ? 'AI' : '시스템';
      content += `[${timestamp}] ${sender}: ${message.content}\n\n`;
    });

    // 파일 정보 내보내기
    if (data.files && data.files.length > 0) {
      content += '=== 첨부 파일 ===\n';
      data.files.forEach(file => {
        content += `• ${file.name} (${(file.size / 1024).toFixed(1)}KB) - ${file.uploadedAt.toLocaleDateString()}\n`;
      });
      content += '\n';
    }

    // 지침 정보 내보내기
    if (data.guidelines && data.guidelines.length > 0) {
      content += '=== 프로젝트 지침 ===\n';
      data.guidelines.forEach(guideline => {
        content += `• ${guideline.title} (${guideline.priority})\n`;
        content += `  ${guideline.content}\n\n`;
      });
    }

    return content;
  }

  // JSON 형식으로 내보내기
  exportAsJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  }

  // CSV 형식으로 내보내기
  exportAsCSV(data: ExportData): string {
    let csv = '시간,발신자,내용\n';
    
    data.messages.forEach(message => {
      const timestamp = message.timestamp;
      const sender = message.sender === 'user' ? '사용자' : 
                    message.sender === 'assistant' ? 'AI' : '시스템';
      const content = message.content.replace(/"/g, '""'); // CSV 이스케이프
      csv += `"${timestamp}","${sender}","${content}"\n`;
    });

    return csv;
  }

  // 파일 다운로드
  downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 대화 내역 내보내기
  async exportConversation(
    projectName: string,
    messages: Message[],
    files?: Array<{ name?: string; size?: number; type?: string; uploadedAt?: string }>,
    guidelines?: Array<{ title?: string; content?: string; priority?: string; category?: string }>,
    options: ExportOptions = { format: 'txt' }
  ): Promise<void> {
    const exportData: ExportData = {
      projectName,
      exportDate: new Date(),
      messages,
      files: files?.map(file => ({
        name: file.name ?? '',
        size: file.size ?? 0,
        type: file.type ?? '',
        uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date()
      })),
      guidelines: guidelines?.map(guideline => ({
        title: guideline.title ?? '',
        content: guideline.content ?? '',
        priority: guideline.priority ?? '',
        category: guideline.category ?? ''
      })),
      metadata: {
        totalMessages: messages.length,
        totalFiles: files?.length || 0,
        totalGuidelines: guidelines?.length || 0,
        exportDuration: Date.now()
      }
    };

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (options.format) {
      case 'txt':
        content = this.exportAsText(exportData);
        filename = `${projectName}_대화내역_${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
        break;
      case 'json':
        content = this.exportAsJSON(exportData);
        filename = `${projectName}_대화내역_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = this.exportAsCSV(exportData);
        filename = `${projectName}_대화내역_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        throw new Error('지원하지 않는 내보내기 형식입니다.');
    }

    this.downloadFile(content, filename, mimeType);
  }

  // 파일 압축 다운로드 (여러 파일을 ZIP으로)
  async exportFilesAsZip(files: File[], projectName: string): Promise<void> {
    // 실제 구현에서는 JSZip 라이브러리를 사용할 수 있습니다
    // 현재는 간단한 시뮬레이션
    errorLogger.info('파일 압축 다운로드', {
      component: 'exportService',
      action: 'exportFilesAsZip',
      projectName,
      filesCount: files.length,
      fileNames: files.map(f => f.name),
    });
    
    // 개별 파일 다운로드
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}

// 싱글톤 인스턴스
const exportService = new ExportService();

export default exportService; 