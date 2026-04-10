/**
 * 글쓰기 스타일 서비스
 * 44개의 다양한 글쓰기 종류별 템플릿 및 스타일 관리
 */

import { ToneConfig } from './toneService';
import toneService from './toneService';

export interface WritingStyle {
  id: string;
  name: string;
  category: 'literature' | 'criticism' | 'journalism' | 'academic' | 'creative' | 'professional' | 'social';
  description: string;
  characteristics: string[];
  tone: string;
  structure: string;
  examplePrompt: string;
  icon?: string;
}

export interface WritingStyleTemplate {
  styleId: string;
  template: string;
  variables: string[];
  instructions: string;
}

class WritingStyleService {
  private static instance: WritingStyleService;
  private styles: Map<string, WritingStyle> = new Map();
  private templates: Map<string, WritingStyleTemplate> = new Map();

  constructor() {
    this.initializeStyles();
    this.initializeTemplates();
  }

  public static getInstance(): WritingStyleService {
    if (!WritingStyleService.instance) {
      WritingStyleService.instance = new WritingStyleService();
    }
    return WritingStyleService.instance;
  }

  /**
   * 44개 글쓰기 종류 초기화
   */
  private initializeStyles(): void {
    const styles: WritingStyle[] = [
      // 문학 (Literature)
      { id: 'novelist', name: '소설가', category: 'literature', description: '소설 작가 스타일', characteristics: ['서사적', '인물 중심', '상세한 묘사'], tone: '문학적이고 서사적', structure: '서사 구조', examplePrompt: '소설 형식으로 작성', icon: '📖' },
      { id: 'poet', name: '시인', category: 'literature', description: '시인 스타일', characteristics: ['은유적', '상징적', '리듬감'], tone: '시적이고 감성적', structure: '시적 구조', examplePrompt: '시 형식으로 작성', icon: '✍️' },
      { id: 'essayist', name: '수필가', category: 'literature', description: '수필 작가 스타일', characteristics: ['개인적', '성찰적', '자유로운 형식'], tone: '친근하고 개인적', structure: '자유로운 구조', examplePrompt: '수필 형식으로 작성', icon: '📝' },
      { id: 'playwright', name: '극작가', category: 'literature', description: '연극 작가 스타일', characteristics: ['대화 중심', '행동 묘사', '무대 지시'], tone: '드라마틱', structure: '대본 구조', examplePrompt: '대본 형식으로 작성', icon: '🎭' },
      { id: 'screenwriter', name: '시나리오 작가', category: 'literature', description: '영화 시나리오 작가 스타일', characteristics: ['시각적', '영상적', '간결한 묘사'], tone: '영상적이고 역동적', structure: '시나리오 구조', examplePrompt: '시나리오 형식으로 작성', icon: '🎬' },
      
      // 비평 (Criticism)
      { id: 'literary-critic', name: '문학비평가', category: 'criticism', description: '문학 작품 비평', characteristics: ['분석적', '이론적', '객관적'], tone: '학술적이고 분석적', structure: '비평 구조', examplePrompt: '문학 작품을 비평', icon: '📚' },
      { id: 'film-critic', name: '영화비평가', category: 'criticism', description: '영화 작품 비평', characteristics: ['영상 분석', '연출 평가', '배우 평가'], tone: '전문적이고 평가적', structure: '영화 리뷰 구조', examplePrompt: '영화를 비평', icon: '🎥' },
      { id: 'music-critic', name: '음악비평가', category: 'criticism', description: '음악 작품 비평', characteristics: ['음악적 분석', '연주 평가', '작곡 분석'], tone: '전문적이고 예술적', structure: '음악 리뷰 구조', examplePrompt: '음악을 비평', icon: '🎵' },
      { id: 'art-critic', name: '미술비평가', category: 'criticism', description: '미술 작품 비평', characteristics: ['시각적 분석', '예술사적 맥락', '기법 분석'], tone: '예술적이고 학술적', structure: '미술 비평 구조', examplePrompt: '미술 작품을 비평', icon: '🎨' },
      { id: 'theater-critic', name: '연극비평가', category: 'criticism', description: '연극 작품 비평', characteristics: ['연출 분석', '배우 평가', '무대 분석'], tone: '전문적이고 분석적', structure: '연극 리뷰 구조', examplePrompt: '연극을 비평', icon: '🎪' },
      { id: 'food-critic', name: '음식비평가', category: 'criticism', description: '음식 및 레스토랑 비평', characteristics: ['맛 묘사', '분위기 평가', '서비스 평가'], tone: '감각적이고 상세한', structure: '음식 리뷰 구조', examplePrompt: '음식을 비평', icon: '🍽️' },
      
      // 평론 (Commentary)
      { id: 'political-commentator', name: '정치평론가', category: 'journalism', description: '정치 이슈 평론', characteristics: ['정치적 분석', '정책 평가', '객관적 시각'], tone: '객관적이고 분석적', structure: '정치 평론 구조', examplePrompt: '정치 이슈를 평론', icon: '🏛️' },
      { id: 'economic-commentator', name: '경제평론가', category: 'journalism', description: '경제 이슈 평론', characteristics: ['경제 분석', '시장 평가', '데이터 기반'], tone: '전문적이고 분석적', structure: '경제 평론 구조', examplePrompt: '경제 이슈를 평론', icon: '📊' },
      { id: 'social-commentator', name: '사회평론가', category: 'social', description: '사회 이슈 평론', characteristics: ['사회적 분석', '인권 관점', '문화적 맥락'], tone: '사회적이고 성찰적', structure: '사회 평론 구조', examplePrompt: '사회 이슈를 평론', icon: '🌍' },
      { id: 'cultural-commentator', name: '문화평론가', category: 'criticism', description: '문화 현상 평론', characteristics: ['문화적 분석', '트렌드 분석', '세대론'], tone: '문화적이고 통찰적', structure: '문화 평론 구조', examplePrompt: '문화 현상을 평론', icon: '🎭' },
      { id: 'sports-commentator', name: '스포츠평론가', category: 'journalism', description: '스포츠 이슈 평론', characteristics: ['경기 분석', '선수 평가', '전략 분석'], tone: '열정적이고 전문적', structure: '스포츠 평론 구조', examplePrompt: '스포츠 이슈를 평론', icon: '⚽' },
      
      // 저널리즘 (Journalism)
      { id: 'news-reporter', name: '뉴스기자', category: 'journalism', description: '뉴스 보도 스타일', characteristics: ['객관적', '사실 중심', '5W1H'], tone: '객관적이고 중립적', structure: '뉴스 기사 구조', examplePrompt: '뉴스 기사 형식으로 작성', icon: '📰' },
      { id: 'feature-writer', name: '기획기자', category: 'journalism', description: '기획 기사 스타일', characteristics: ['심층 분석', '인물 중심', '스토리텔링'], tone: '깊이 있고 서사적', structure: '기획 기사 구조', examplePrompt: '기획 기사 형식으로 작성', icon: '📑' },
      { id: 'investigative-journalist', name: '탐사기자', category: 'journalism', description: '탐사 보도 스타일', characteristics: ['사실 확인', '증거 중심', '객관적 분석'], tone: '엄격하고 사실적', structure: '탐사 기사 구조', examplePrompt: '탐사 기사 형식으로 작성', icon: '🔍' },
      { id: 'columnist', name: '칼럼니스트', category: 'journalism', description: '칼럼 작성 스타일', characteristics: ['의견 제시', '개인적 관점', '논리적 구성'], tone: '의견이 명확하고 설득력 있는', structure: '칼럼 구조', examplePrompt: '칼럼 형식으로 작성', icon: '📄' },
      { id: 'editorial-writer', name: '사설작성자', category: 'journalism', description: '사설 작성 스타일', characteristics: ['논설적', '정책 제안', '객관적 논리'], tone: '권위적이고 논리적', structure: '사설 구조', examplePrompt: '사설 형식으로 작성', icon: '📋' },
      
      // 학술 (Academic)
      { id: 'academic-researcher', name: '학술연구자', category: 'academic', description: '학술 논문 스타일', characteristics: ['이론적', '실증적', '인용 중심'], tone: '학술적이고 객관적', structure: '학술 논문 구조', examplePrompt: '학술 논문 형식으로 작성', icon: '🎓' },
      { id: 'historian', name: '역사학자', category: 'academic', description: '역사 서술 스타일', characteristics: ['시대적 맥락', '사실 중심', '객관적 서술'], tone: '역사적이고 객관적', structure: '역사 서술 구조', examplePrompt: '역사 서술 형식으로 작성', icon: '📜' },
      { id: 'philosopher', name: '철학자', category: 'academic', description: '철학적 논의 스타일', characteristics: ['개념 분석', '논리적 추론', '이론적 탐구'], tone: '철학적이고 추상적', structure: '철학 논문 구조', examplePrompt: '철학적 논의 형식으로 작성', icon: '🤔' },
      { id: 'sociologist', name: '사회학자', category: 'academic', description: '사회학적 분석 스타일', characteristics: ['사회 구조 분석', '이론 적용', '데이터 기반'], tone: '학술적이고 분석적', structure: '사회학 논문 구조', examplePrompt: '사회학적 분석 형식으로 작성', icon: '👥' },
      { id: 'psychologist', name: '심리학자', category: 'academic', description: '심리학적 분석 스타일', characteristics: ['심리 분석', '이론 적용', '사례 중심'], tone: '과학적이고 분석적', structure: '심리학 논문 구조', examplePrompt: '심리학적 분석 형식으로 작성', icon: '🧠' },
      
      // 창작 (Creative)
      { id: 'copywriter', name: '카피라이터', category: 'creative', description: '광고 카피 작성', characteristics: ['임팩트', '간결함', '설득력'], tone: '임팩트 있고 설득력 있는', structure: '광고 카피 구조', examplePrompt: '광고 카피 형식으로 작성', icon: '💡' },
      { id: 'content-creator', name: '콘텐츠크리에이터', category: 'creative', description: '콘텐츠 제작 스타일', characteristics: ['트렌디', '접근성', '흥미 유발'], tone: '친근하고 트렌디한', structure: '콘텐츠 구조', examplePrompt: '콘텐츠 형식으로 작성', icon: '📱' },
      { id: 'blogger', name: '블로거', category: 'creative', description: '블로그 글 스타일', characteristics: ['개인적', '친근함', '읽기 쉬움'], tone: '친근하고 개인적', structure: '블로그 포스트 구조', examplePrompt: '블로그 포스트 형식으로 작성', icon: '✍️' },
      { id: 'social-media-influencer', name: '인플루언서', category: 'creative', description: '소셜미디어 콘텐츠', characteristics: ['짧고 임팩트', '시각적', '트렌드 반영'], tone: '캐주얼하고 트렌디한', structure: '소셜미디어 구조', examplePrompt: '소셜미디어 포스트 형식으로 작성', icon: '📸' },
      { id: 'storyteller', name: '스토리텔러', category: 'creative', description: '스토리텔링 스타일', characteristics: ['서사적', '몰입감', '감정적'], tone: '서사적이고 감성적', structure: '스토리 구조', examplePrompt: '스토리 형식으로 작성', icon: '📖' },
      
      // 전문직 (Professional)
      { id: 'business-writer', name: '비즈니스작성자', category: 'professional', description: '비즈니스 문서 스타일', characteristics: ['명확함', '전문성', '실용성'], tone: '전문적이고 명확한', structure: '비즈니스 문서 구조', examplePrompt: '비즈니스 문서 형식으로 작성', icon: '💼' },
      { id: 'technical-writer', name: '기술문서작성자', category: 'professional', description: '기술 문서 스타일', characteristics: ['정확성', '명확성', '구조화'], tone: '정확하고 명확한', structure: '기술 문서 구조', examplePrompt: '기술 문서 형식으로 작성', icon: '⚙️' },
      { id: 'legal-writer', name: '법률문서작성자', category: 'professional', description: '법률 문서 스타일', characteristics: ['정확성', '법적 용어', '논리적 구성'], tone: '정확하고 권위적', structure: '법률 문서 구조', examplePrompt: '법률 문서 형식으로 작성', icon: '⚖️' },
      { id: 'medical-writer', name: '의학문서작성자', category: 'professional', description: '의학 문서 스타일', characteristics: ['정확성', '과학적', '명확성'], tone: '과학적이고 정확한', structure: '의학 문서 구조', examplePrompt: '의학 문서 형식으로 작성', icon: '🏥' },
      { id: 'grant-writer', name: '기획서작성자', category: 'professional', description: '기획서 작성 스타일', characteristics: ['설득력', '논리적', '목표 지향'], tone: '설득력 있고 논리적', structure: '기획서 구조', examplePrompt: '기획서 형식으로 작성', icon: '📋' },
      
      // 사회 (Social)
      { id: 'activist', name: '활동가', category: 'social', description: '사회 운동 글 스타일', characteristics: ['열정적', '변화 지향', '행동 촉구'], tone: '열정적이고 설득력 있는', structure: '선언문 구조', examplePrompt: '사회 운동 글 형식으로 작성', icon: '✊' },
      { id: 'educator', name: '교육자', category: 'social', description: '교육 콘텐츠 스타일', characteristics: ['이해하기 쉬움', '체계적', '실용적'], tone: '교육적이고 친절한', structure: '교육 자료 구조', examplePrompt: '교육 자료 형식으로 작성', icon: '👨‍🏫' },
      { id: 'motivational-speaker', name: '동기부여연사', category: 'social', description: '동기부여 콘텐츠', characteristics: ['영감적', '긍정적', '행동 촉구'], tone: '영감적이고 긍정적', structure: '연설문 구조', examplePrompt: '동기부여 글 형식으로 작성', icon: '💪' },
      { id: 'life-coach', name: '라이프코치', category: 'social', description: '라이프 코칭 스타일', characteristics: ['지지적', '실용적', '변화 지향'], tone: '지지적이고 실용적', structure: '코칭 자료 구조', examplePrompt: '라이프 코칭 글 형식으로 작성', icon: '🌟' },
      { id: 'memoirist', name: '회고록작가', category: 'literature', description: '회고록 작성 스타일', characteristics: ['개인적', '성찰적', '시간적 서술'], tone: '개인적이고 성찰적', structure: '회고록 구조', examplePrompt: '회고록 형식으로 작성', icon: '📔' },
      { id: 'biographer', name: '전기작가', category: 'literature', description: '전기 작성 스타일', characteristics: ['사실 중심', '시간적 서술', '인물 중심'], tone: '객관적이고 서사적', structure: '전기 구조', examplePrompt: '전기 형식으로 작성', icon: '📚' },
      { id: 'travel-writer', name: '여행작가', category: 'creative', description: '여행 글 스타일', characteristics: ['묘사적', '경험 중심', '감각적'], tone: '생생하고 감각적', structure: '여행기 구조', examplePrompt: '여행기 형식으로 작성', icon: '✈️' },
      { id: 'food-writer', name: '푸드작가', category: 'creative', description: '음식 글 스타일', characteristics: ['감각적 묘사', '경험 중심', '문화적 맥락'], tone: '감각적이고 생생한', structure: '푸드 기사 구조', examplePrompt: '푸드 기사 형식으로 작성', icon: '🍜' },
      { id: 'fashion-writer', name: '패션작가', category: 'creative', description: '패션 글 스타일', characteristics: ['시각적', '트렌드 분석', '스타일 평가'], tone: '트렌디하고 시각적', structure: '패션 기사 구조', examplePrompt: '패션 기사 형식으로 작성', icon: '👗' },
      { id: 'tech-blogger', name: '테크블로거', category: 'professional', description: '기술 블로그 스타일', characteristics: ['기술적', '실용적', '접근성'], tone: '기술적이고 친절한', structure: '기술 블로그 구조', examplePrompt: '기술 블로그 형식으로 작성', icon: '💻' },
      { id: 'science-communicator', name: '과학커뮤니케이터', category: 'academic', description: '과학 대중화 글', characteristics: ['이해하기 쉬움', '정확성', '흥미 유발'], tone: '과학적이고 접근 가능한', structure: '과학 기사 구조', examplePrompt: '과학 기사 형식으로 작성', icon: '🔬' },
    ];

    styles.forEach(style => {
      this.styles.set(style.id, style);
    });
  }

  /**
   * 템플릿 초기화
   */
  private initializeTemplates(): void {
    this.styles.forEach((style, styleId) => {
      const template = this.generateTemplateForStyle(style, styleId);
      this.templates.set(styleId, template);
    });
  }

  /**
   * 스타일별 템플릿 생성
   */
  private generateTemplateForStyle(style: WritingStyle, styleId: string): WritingStyleTemplate {
    const baseTemplate = `당신은 전문 ${style.name}입니다. 다음 주제에 대해 ${style.name}의 관점과 스타일로 글을 작성해주세요.

주제: {{topic}}
추가 정보: {{additionalInfo}}
길이: {{length}}

${style.name}의 특징:
${style.characteristics.map(c => `- ${c}`).join('\n')}

톤: ${style.tone}
구조: ${style.structure}

요구사항:
- ${style.name}의 전문성과 특징을 반영
- ${style.tone} 톤 유지
- ${style.structure} 구조 준수
- 독자에게 명확하고 효과적으로 전달`;

    return {
      styleId,
      template: baseTemplate,
      variables: ['topic', 'additionalInfo', 'length'],
      instructions: `${style.name} 스타일로 작성하되, ${style.characteristics.join(', ')} 특징을 반영하세요.`,
    };
  }

  /**
   * 모든 스타일 조회
   */
  getAllStyles(): WritingStyle[] {
    return Array.from(this.styles.values());
  }

  /**
   * 카테고리별 스타일 조회
   */
  getStylesByCategory(category: WritingStyle['category']): WritingStyle[] {
    return Array.from(this.styles.values()).filter(s => s.category === category);
  }

  /**
   * 스타일 조회
   */
  getStyle(id: string): WritingStyle | null {
    return this.styles.get(id) || null;
  }

  /**
   * 템플릿 조회
   */
  getTemplate(styleId: string): WritingStyleTemplate | null {
    return this.templates.get(styleId) || null;
  }

  /**
   * 스타일 적용하여 프롬프트 생성 (어투/연령대 포함)
   */
  generatePrompt(
    styleId: string, 
    topic: string, 
    additionalInfo?: string, 
    length?: string,
    toneConfig?: ToneConfig
  ): string {
    const template = this.templates.get(styleId);
    if (!template) {
      throw new Error(`스타일을 찾을 수 없습니다: ${styleId}`);
    }

    const variables: Record<string, string> = {
      topic,
      additionalInfo: additionalInfo || '',
      length: length || '중간',
    };

    let prompt = template.template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      prompt = prompt.replace(regex, value);
    }

    // 어투/연령대 지시사항 추가
    if (toneConfig) {
      const toneInstructions = toneService.generateToneInstructions(toneConfig);
      prompt += toneInstructions;
    }

    return prompt;
  }

  /**
   * 선택된 글쓰기 스타일을 답변에 반영하기 위한 지시문 생성 (대화 입력 시 스타일 적용용)
   * 노트북 LLM에서 스타일 선택 시 사용자 질문에 이 지시문을 붙여 모델이 해당 스타일로 답변하도록 함
   */
  getStyleInstruction(styleId: string): string {
    const style = this.styles.get(styleId);
    if (!style) return '';
    return `\n[글쓰기 스타일] 다음 답변은 **${style.name}** 스타일로 작성해주세요. 톤: ${style.tone}. 구조: ${style.structure}. 특징: ${style.characteristics.join(', ')}.`;
  }

  /**
   * 스타일별 예시 프롬프트 생성
   */
  getExamplePrompt(styleId: string): string {
    const style = this.styles.get(styleId);
    if (!style) {
      return '';
    }

    return style.examplePrompt;
  }
}

export const writingStyleService = WritingStyleService.getInstance();
export default writingStyleService;

