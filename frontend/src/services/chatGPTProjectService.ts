// 간단한 ChatGPT 프로젝트 서비스
class ChatGPTProjectService {
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch('http://localhost:8001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
          message,
          user_id: 'user',
          session_id: 'session'
        }),
            });

            if (!response.ok) {
        throw new Error('API 요청 실패');
      }
      
      const data = await response.json();
      return data.response || '응답을 받을 수 없습니다.';
        } catch (error) {
      console.error('ChatGPT 서비스 오류:', error);
      return '죄송합니다. 서비스에 문제가 있습니다.';
    }
  }
}

export default new ChatGPTProjectService();