export async function handleLogout(): Promise<string> {
  try {
    let response = `🚪 **로그아웃 안내**\n\n`;
    
    response += `⚠️ **주의사항**\n`;
    response += `• 로그아웃하면 현재 세션이 종료됩니다\n`;
    response += `• 저장되지 않은 메시지는 손실될 수 있습니다\n`;
    response += `• 다시 로그인하면 이전 대화를 계속할 수 있습니다\n\n`;
    
    response += `📋 **로그아웃 전 확인사항**\n`;
    response += `• 중요한 메시지가 있다면 저장하세요\n`;
    response += `• 업로드 중인 파일이 있다면 완료를 기다리세요\n`;
    response += `• 진행 중인 작업이 있다면 완료하세요\n\n`;
    
    response += `🔧 **로그아웃 방법**\n`;
    response += `• 우측 상단의 "로그아웃" 버튼을 클릭하세요\n`;
    response += `• 또는 브라우저를 닫으면 자동으로 로그아웃됩니다\n\n`;
    
    response += `💡 **다시 로그인하려면 이메일과 비밀번호를 입력하세요.**`;

    return response;
  } catch (error) {
    throw new Error('로그아웃 안내 생성 중 오류가 발생했습니다.');
  }
}