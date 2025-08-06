export async function handleFileUpload(): Promise<string> {
  try {
    let response = `📁 **파일 업로드 안내**\n\n`;
    
    response += `📋 **지원 파일 형식**\n`;
    response += `• 이미지: JPG, PNG, GIF, WebP\n`;
    response += `• 문서: PDF, DOC, DOCX, TXT\n`;
    response += `• 기타: 최대 10MB까지 업로드 가능\n\n`;
    
    response += `🚀 **업로드 방법**\n`;
    response += `1. 파일을 드래그하여 업로드 영역에 놓기\n`;
    response += `2. 또는 "파일 선택" 버튼 클릭\n`;
    response += `3. 업로드 완료 후 채팅에서 파일 확인\n\n`;
    
    response += `💡 **팁**\n`;
    response += `• 여러 파일을 동시에 업로드할 수 있습니다\n`;
    response += `• 업로드된 파일은 자동으로 채팅에 첨부됩니다\n`;
    response += `• 파일 크기는 10MB 이하여야 합니다\n\n`;
    
    response += `🔧 **파일 업로드 기능을 사용하려면 사이드바의 "파일 업로드" 버튼을 클릭하세요.**`;

    return response;
  } catch (error) {
    throw new Error('파일 업로드 안내 생성 중 오류가 발생했습니다.');
  }
}