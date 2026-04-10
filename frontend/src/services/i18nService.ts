import { PREFERRED_LOCALE_STORAGE_KEY } from './i18nStorageKeys';
import { ASSISTANT_PLACEHOLDER_THINKING } from '../utils/chatInputUtils';

export interface Locale {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Translation {
  [key: string]: string | Translation;
}

class I18nService {
  private currentLocale: string = 'ko';
  private fallbackLocale: string = 'en';
  private translations: { [locale: string]: Translation } = {};
  private listeners: ((locale: string) => void)[] = [];

  constructor() {
    this.loadTranslations();
    this.detectUserLocale();
  }

  // 사용자 로케일 감지
  private detectUserLocale() {
    const browserLocale = navigator.language || navigator.languages?.[0] || 'ko';
    const detectedLocale = this.getSupportedLocale(browserLocale);
    this.setLocale(detectedLocale);
  }

  // 지원되는 로케일인지 확인
  private getSupportedLocale(locale: string): string {
    const supportedLocales = ['ko', 'en', 'ja', 'zh'];
    const baseLocale = locale.split('-')[0];
    return supportedLocales.includes(baseLocale) ? baseLocale : 'ko';
  }

  // 번역 데이터 로드
  private loadTranslations() {
    this.translations = {
      ko: {
        common: {
          newChat: '새 대화',
          newProject: '새 프로젝트',
          save: '저장',
          cancel: '취소',
          delete: '삭제',
          edit: '편집',
          search: '검색',
          loading: '로딩 중...',
          error: '오류',
          success: '성공',
          confirm: '확인',
          close: '닫기'
        },
        chat: {
          placeholder: '무엇이든 물어보세요',
          inputPlaceholder: '메시지를 입력하세요...',
          send: '전송',
          voiceInput: '음성 입력',
          typing: '입력 중...',
          thinking: ASSISTANT_PLACEHOLDER_THINKING,
          newMessage: '새 메시지',
          noMessages: '메시지가 없습니다',
          noSession: '대화 세션을 선택해주세요',
          messageCount: '{{count}}개 메시지',
          responseModes: {
            basic: '기본',
            intelligent: '능동적',
            advanced: '고급',
            adaptive: '개인화',
            external: '외부 AI'
          }
        },
        project: {
          title: '프로젝트',
          files: '프로젝트 파일',
          guidelines: '지침',
          members: '멤버',
          settings: '설정',
          noProjects: '프로젝트가 없습니다',
          createProject: '프로젝트 생성',
          projectName: '프로젝트명',
          description: '설명',
          status: '상태',
          priority: '우선순위'
        },
        analytics: {
          title: '분석',
          overview: '개요',
          charts: '차트',
          insights: '인사이트',
          totalMessages: '총 메시지',
          averageResponseTime: '평균 응답 시간',
          responseQuality: '응답 품질',
          sentimentAnalysis: '감정 분석',
          topicDistribution: '주제 분포',
          userEngagement: '사용자 참여도',
          aiPerformance: 'AI 성능'
        },
        ai: {
          modelSelection: 'AI 모델 선택',
          modelSettings: '모델 설정',
          providers: 'AI 제공자',
          models: '모델',
          settings: '설정',
          temperature: '온도',
          maxTokens: '최대 토큰',
          cost: '비용',
          quality: '품질',
          basic: '기본',
          standard: '표준',
          premium: '프리미엄'
        },
        voice: {
          recognition: '음성 인식',
          synthesis: '음성 합성',
          startListening: '듣기 시작',
          stopListening: '듣기 중지',
          startSpeaking: '음성 합성 시작',
          stopSpeaking: '음성 합성 중지',
          speaking: '말하는 중...',
          notSupported: '음성 기능이 지원되지 않습니다',
          permissionDenied: '마이크 권한이 거부되었습니다',
          noSpeech: '음성이 감지되지 않았습니다'
        }
      },
      en: {
        common: {
          newChat: 'New Chat',
          newProject: 'New Project',
          save: 'Save',
          cancel: 'Cancel',
          delete: 'Delete',
          edit: 'Edit',
          search: 'Search',
          loading: 'Loading...',
          error: 'Error',
          success: 'Success',
          confirm: 'Confirm',
          close: 'Close'
        },
        chat: {
          placeholder: 'Ask anything',
          send: 'Send',
          voiceInput: 'Voice Input',
          typing: 'Typing...',
          newMessage: 'New Message',
          noMessages: 'No messages',
          messageCount: '{{count}} messages',
          responseModes: {
            basic: 'Basic',
            intelligent: 'Intelligent',
            advanced: 'Advanced',
            adaptive: 'Adaptive',
            external: 'External AI'
          }
        },
        project: {
          title: 'Project',
          files: 'Project Files',
          guidelines: 'Guidelines',
          members: 'Members',
          settings: 'Settings',
          noProjects: 'No projects',
          createProject: 'Create Project',
          projectName: 'Project Name',
          description: 'Description',
          status: 'Status',
          priority: 'Priority'
        },
        analytics: {
          title: 'Analytics',
          overview: 'Overview',
          charts: 'Charts',
          insights: 'Insights',
          totalMessages: 'Total Messages',
          averageResponseTime: 'Average Response Time',
          responseQuality: 'Response Quality',
          sentimentAnalysis: 'Sentiment Analysis',
          topicDistribution: 'Topic Distribution',
          userEngagement: 'User Engagement',
          aiPerformance: 'AI Performance'
        },
        ai: {
          modelSelection: 'AI Model Selection',
          providers: 'AI Providers',
          models: 'Models',
          settings: 'Settings',
          temperature: 'Temperature',
          maxTokens: 'Max Tokens',
          cost: 'Cost',
          quality: 'Quality',
          basic: 'Basic',
          standard: 'Standard',
          premium: 'Premium'
        },
        voice: {
          recognition: 'Voice Recognition',
          synthesis: 'Voice Synthesis',
          startListening: 'Start Listening',
          stopListening: 'Stop Listening',
          speaking: 'Speaking...',
          notSupported: 'Voice features not supported',
          permissionDenied: 'Microphone permission denied',
          noSpeech: 'No speech detected'
        }
      },
      ja: {
        common: {
          newChat: '新しいチャット',
          newProject: '新しいプロジェクト',
          save: '保存',
          cancel: 'キャンセル',
          delete: '削除',
          edit: '編集',
          search: '検索',
          loading: '読み込み中...',
          error: 'エラー',
          success: '成功',
          confirm: '確認',
          close: '閉じる'
        },
        chat: {
          placeholder: '何でも聞いてください',
          send: '送信',
          voiceInput: '音声入力',
          typing: '入力中...',
          newMessage: '新しいメッセージ',
          noMessages: 'メッセージがありません',
          messageCount: '{{count}}件のメッセージ',
          responseModes: {
            basic: '基本',
            intelligent: 'インテリジェント',
            advanced: '高度',
            adaptive: '適応型',
            external: '外部AI'
          }
        }
      },
      zh: {
        common: {
          newChat: '新对话',
          newProject: '新项目',
          save: '保存',
          cancel: '取消',
          delete: '删除',
          edit: '编辑',
          search: '搜索',
          loading: '加载中...',
          error: '错误',
          success: '成功',
          confirm: '确认',
          close: '关闭'
        },
        chat: {
          placeholder: '问任何问题',
          send: '发送',
          voiceInput: '语音输入',
          typing: '输入中...',
          newMessage: '新消息',
          noMessages: '没有消息',
          messageCount: '{{count}}条消息',
          responseModes: {
            basic: '基础',
            intelligent: '智能',
            advanced: '高级',
            adaptive: '自适应',
            external: '外部AI'
          }
        }
      }
    };
  }

  // 현재 로케일 설정
  setLocale(locale: string) {
    if (this.currentLocale !== locale) {
      this.currentLocale = locale;
      localStorage.setItem(PREFERRED_LOCALE_STORAGE_KEY, locale);
      this.notifyListeners();
    }
  }

  // 현재 로케일 가져오기
  getLocale(): string {
    return this.currentLocale;
  }

  // 지원되는 로케일 목록
  getSupportedLocales(): Locale[] {
    return [
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' }
    ];
  }

  // 번역 가져오기
  t(key: string, params?: { [key: string]: string | number }): string {
    const keys = key.split('.');
    let translation: string | Translation = this.translations[this.currentLocale] || this.translations[this.fallbackLocale];

    // 키 경로를 따라 번역 찾기
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // 폴백 로케일에서 찾기
        translation = this.translations[this.fallbackLocale];
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return key; // 번역을 찾을 수 없으면 키 반환
          }
        }
        break;
      }
    }

    if (typeof translation !== 'string') {
      return key;
    }

    // 매개변수 치환
    if (params) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param]?.toString() || match;
      });
    }

    return translation;
  }

  // 날짜 포맷팅
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const locale = this.currentLocale === 'ko' ? 'ko-KR' : this.currentLocale;
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  // 숫자 포맷팅
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.currentLocale === 'ko' ? 'ko-KR' : this.currentLocale;
    return new Intl.NumberFormat(locale, options).format(number);
  }

  // 통화 포맷팅
  formatCurrency(amount: number, currency: string = 'KRW'): string {
    const locale = this.currentLocale === 'ko' ? 'ko-KR' : this.currentLocale;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  }

  // 상대적 시간 포맷팅
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return this.t('time.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return this.t('time.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return this.t('time.hoursAgo', { count: hours });
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return this.t('time.daysAgo', { count: days });
    }
  }

  // 언어 감지
  detectLanguage(text: string): string {
    // 간단한 언어 감지 (실제로는 더 정교한 라이브러리 사용 권장)
    const koreanPattern = /[가-힣]/;
    const japanesePattern = /[あ-んア-ン]/;
    const chinesePattern = /[一-龯]/;

    if (koreanPattern.test(text)) return 'ko';
    if (japanesePattern.test(text)) return 'ja';
    if (chinesePattern.test(text)) return 'zh';
    return 'en';
  }

  // 로케일 변경 리스너 등록
  onLocaleChange(callback: (locale: string) => void) {
    this.listeners.push(callback);
  }

  // 로케일 변경 리스너 제거
  removeLocaleChangeListener(callback: (locale: string) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 리스너들에게 알림
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLocale));
  }

  // RTL 언어 확인
  isRTL(): boolean {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(this.currentLocale);
  }

  // 언어별 텍스트 방향
  getTextDirection(): 'ltr' | 'rtl' {
    return this.isRTL() ? 'rtl' : 'ltr';
  }
}

export { I18N_APP_LANGUAGE_STORAGE_KEY, PREFERRED_LOCALE_STORAGE_KEY } from './i18nStorageKeys';

const i18nService = new I18nService();
export default i18nService;
