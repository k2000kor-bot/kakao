// 기본 라우트 설정
export const defaultRoutes = [
  {
    path: '/',
    name: '홈',
    description: 'AI 대화분석 시스템 메인 페이지',
    icon: '🏠',
    category: 'main',
    isActive: true
  }
];

// 카테고리별 라우트 그룹화
export const routeCategories = [
  {
    id: 'main',
    name: '메인',
    description: '시스템 메인 기능',
    routes: defaultRoutes.filter(route => route.category === 'main')
  }
];

// 네비게이션 설정
export const navigationConfig = {
  title: 'CORBU AI',
  logo: '🤖',
  theme: 'light' as const,
  showSearch: false,
  showNotifications: false,
  userMenu: {
    show: false,
    items: []
  }
};

export default defaultRoutes;
