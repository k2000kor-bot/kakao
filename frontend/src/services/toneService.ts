/**
 * 어투/말투 서비스
 * 다양한 어투와 연령대별 말투 특성 관리
 */

export type ToneType = 
  | 'formal'           // 격식체
  | 'informal'         // 비격식체
  | 'polite'           // 존댓말
  | 'casual'           // 반말/캐주얼
  | 'official'          // 공식적
  | 'friendly'         // 친근한
  | 'professional'     // 전문적
  | 'academic'          // 학술적
  | 'conversational'    // 대화체
  | 'persuasive';       // 설득적

export type AgeGroup = 
  | 'teen'      // 10대
  | 'twenties'  // 20대
  | 'thirties'  // 30대
  | 'forties'   // 40대
  | 'fifties'   // 50대
  | 'sixties'   // 60대
  | 'eighties'; // 80대

export interface ToneProfile {
  toneType: ToneType;
  ageGroup?: AgeGroup;
  characteristics: string[];
  examplePhrases: string[];
  vocabulary: string[];
  sentenceStructure: string;
  formality: 'very_formal' | 'formal' | 'neutral' | 'informal' | 'very_informal';
}

export interface ToneConfig {
  toneType: ToneType;
  ageGroup?: AgeGroup;
  customInstructions?: string;
}

class ToneService {
  private static instance: ToneService;
  private toneProfiles: Map<string, ToneProfile> = new Map();

  constructor() {
    this.initializeToneProfiles();
  }

  public static getInstance(): ToneService {
    if (!ToneService.instance) {
      ToneService.instance = new ToneService();
    }
    return ToneService.instance;
  }

  /**
   * 어투 프로필 초기화
   */
  private initializeToneProfiles(): void {
    // 격식체 프로필들
    this.addToneProfile('formal', {
      toneType: 'formal',
      characteristics: ['정중함', '격식 있음', '공식적'],
      examplePhrases: ['~하시기 바랍니다', '~하시는 것으로', '~하시길 권장드립니다'],
      vocabulary: ['드리다', '진행되다', '수행하다', '실시하다'],
      sentenceStructure: '문어체, 높임말 사용',
      formality: 'very_formal',
    });

    // 비격식체 프로필들
    this.addToneProfile('informal', {
      toneType: 'informal',
      characteristics: ['자유로움', '편안함', '친근함'],
      examplePhrases: ['~해', '~하자', '~하면 돼'],
      vocabulary: ['하다', '되다', '좋다', '괜찮다'],
      sentenceStructure: '구어체, 평서문',
      formality: 'informal',
    });

    // 존댓말 프로필들
    this.addToneProfile('polite', {
      toneType: 'polite',
      characteristics: ['정중함', '예의 바름', '배려'],
      examplePhrases: ['~하세요', '~하시면 됩니다', '~하시는 게 좋을 것 같아요'],
      vocabulary: ['드리다', '해주시다', '말씀드리다', '알려드리다'],
      sentenceStructure: '존댓말, 정중한 표현',
      formality: 'formal',
    });

    // 캐주얼 프로필들
    this.addToneProfile('casual', {
      toneType: 'casual',
      characteristics: ['편안함', '자유로움', '친근함'],
      examplePhrases: ['~해', '~하면 돼', '~하는 게 좋을 것 같아'],
      vocabulary: ['하다', '되다', '좋다', '괜찮다'],
      sentenceStructure: '구어체, 간결한 표현',
      formality: 'informal',
    });

    // 연령대별 프로필 추가
    this.addAgeGroupProfiles();
  }

  /**
   * 연령대별 프로필 추가
   */
  private addAgeGroupProfiles(): void {
    // 10대
    this.addToneProfile('teen', {
      toneType: 'casual',
      ageGroup: 'teen',
      characteristics: ['트렌디', '신조어 사용', '감탄사 많음', '이모티콘 선호'],
      examplePhrases: ['~임', '~함', '~인 것 같음', '~할 듯', '~해요', '~인가요?'],
      vocabulary: ['존맛', '꿀잼', '레전드', '대박', '헐', '와', '진짜'],
      sentenceStructure: '짧고 간결, 감탄사 많음',
      formality: 'very_informal',
    });

    // 20대
    this.addToneProfile('twenties', {
      toneType: 'casual',
      ageGroup: 'twenties',
      characteristics: ['캐주얼', '친근함', '현대적 표현', '유머러스'],
      examplePhrases: ['~해요', '~하는 게 좋을 것 같아요', '~하면 될 것 같아요'],
      vocabulary: ['좋아요', '괜찮아요', '맞아요', '그렇죠', '진짜', '완전'],
      sentenceStructure: '구어체, 친근한 표현',
      formality: 'informal',
    });

    // 30대
    this.addToneProfile('thirties', {
      toneType: 'polite',
      ageGroup: 'thirties',
      characteristics: ['균형잡힌', '전문적', '명확함', '효율적'],
      examplePhrases: ['~하시면 됩니다', '~하시는 것을 권장드립니다', '~하시길 바랍니다'],
      vocabulary: ['드리다', '진행하다', '수행하다', '확인하다', '검토하다'],
      sentenceStructure: '정중하지만 명확한 표현',
      formality: 'neutral',
    });

    // 40대
    this.addToneProfile('forties', {
      toneType: 'formal',
      ageGroup: 'forties',
      characteristics: ['격식 있음', '경험 기반', '신중함', '권위적'],
      examplePhrases: ['~하시기 바랍니다', '~하시는 것으로', '~하시는 것이 좋겠습니다'],
      vocabulary: ['드리다', '수행하시다', '진행하시다', '검토하시다', '확인하시다'],
      sentenceStructure: '격식 있는 문어체',
      formality: 'formal',
    });

    // 50대
    this.addToneProfile('fifties', {
      toneType: 'formal',
      ageGroup: 'fifties',
      characteristics: ['전통적', '정중함', '경험적', '조언적'],
      examplePhrases: ['~하시는 것이 좋으실 것 같습니다', '~하시길 권하시는 바입니다', '~하시는 편이 낫겠습니다'],
      vocabulary: ['드리시다', '하시는 것이', '바라시는', '권하시는'],
      sentenceStructure: '전통적이고 정중한 표현',
      formality: 'very_formal',
    });

    // 60대
    this.addToneProfile('sixties', {
      toneType: 'formal',
      ageGroup: 'sixties',
      characteristics: ['전통적', '정중함', '경험적', '조언적', '존중'],
      examplePhrases: ['~하시는 것이 좋으실 것입니다', '~하시는 편이 낫겠습니다', '~하시는 것이 바람직합니다'],
      vocabulary: ['드리시는', '하시는 것이', '바라시는', '권하시는', '바람직한'],
      sentenceStructure: '전통적이고 매우 정중한 표현',
      formality: 'very_formal',
    });

    // 80대
    this.addToneProfile('eighties', {
      toneType: 'formal',
      ageGroup: 'eighties',
      characteristics: ['전통적', '매우 정중함', '경험적', '조언적', '존중', '격식'],
      examplePhrases: ['~하시는 것이 좋으실 것입니다', '~하시는 편이 낫겠습니다', '~하시는 것이 바람직하시겠습니다'],
      vocabulary: ['드리시는', '하시는 것이', '바라시는', '권하시는', '바람직하신'],
      sentenceStructure: '전통적이고 매우 격식 있는 표현',
      formality: 'very_formal',
    });
  }

  /**
   * 어투 프로필 추가
   */
  private addToneProfile(key: string, profile: ToneProfile): void {
    this.toneProfiles.set(key, profile);
  }

  /**
   * 어투 프로필 조회
   */
  getToneProfile(toneType: ToneType, ageGroup?: AgeGroup): ToneProfile {
    if (ageGroup) {
      const ageProfile = this.toneProfiles.get(ageGroup);
      if (ageProfile) {
        return {
          ...ageProfile,
          toneType,
        };
      }
    }

    const baseProfile = this.toneProfiles.get(toneType);
    if (baseProfile) {
      return baseProfile;
    }

    // 기본 프로필 반환
    return {
      toneType: 'polite',
      characteristics: ['정중함', '균형잡힌'],
      examplePhrases: ['~하세요', '~하시면 됩니다'],
      vocabulary: ['드리다', '해주시다'],
      sentenceStructure: '정중한 표현',
      formality: 'neutral',
    };
  }

  /**
   * 어투 지시사항 생성
   */
  generateToneInstructions(config: ToneConfig): string {
    const profile = this.getToneProfile(config.toneType, config.ageGroup);
    
    let instructions = `\n\n[어투 및 말투 지시사항]\n`;
    instructions += `어투: ${this.getToneTypeName(config.toneType)}\n`;
    
    if (config.ageGroup) {
      instructions += `연령대: ${this.getAgeGroupName(config.ageGroup)}\n`;
    }
    
    instructions += `특징:\n`;
    profile.characteristics.forEach(char => {
      instructions += `- ${char}\n`;
    });
    
    instructions += `\n사용할 표현 예시:\n`;
    profile.examplePhrases.slice(0, 3).forEach(phrase => {
      instructions += `- ${phrase}\n`;
    });
    
    instructions += `\n문장 구조: ${profile.sentenceStructure}\n`;
    instructions += `격식 수준: ${this.getFormalityName(profile.formality)}\n`;
    
    if (config.customInstructions) {
      instructions += `\n추가 지시사항: ${config.customInstructions}\n`;
    }
    
    return instructions;
  }

  /**
   * 어투 타입 이름
   */
  getToneTypeName(toneType: ToneType): string {
    const names: Record<ToneType, string> = {
      formal: '격식체',
      informal: '비격식체',
      polite: '존댓말',
      casual: '캐주얼',
      official: '공식적',
      friendly: '친근한',
      professional: '전문적',
      academic: '학술적',
      conversational: '대화체',
      persuasive: '설득적',
    };
    return names[toneType] || toneType;
  }

  /**
   * 연령대 이름
   */
  getAgeGroupName(ageGroup: AgeGroup): string {
    const names: Record<AgeGroup, string> = {
      teen: '10대',
      twenties: '20대',
      thirties: '30대',
      forties: '40대',
      fifties: '50대',
      sixties: '60대',
      eighties: '80대',
    };
    return names[ageGroup] || ageGroup;
  }

  /**
   * 격식 수준 이름
   */
  getFormalityName(formality: ToneProfile['formality']): string {
    const names: Record<ToneProfile['formality'], string> = {
      very_formal: '매우 격식적',
      formal: '격식적',
      neutral: '중립적',
      informal: '비격식적',
      very_informal: '매우 비격식적',
    };
    return names[formality] || formality;
  }

  /**
   * 모든 어투 타입 조회
   */
  getAllToneTypes(): ToneType[] {
    return [
      'formal',
      'informal',
      'polite',
      'casual',
      'official',
      'friendly',
      'professional',
      'academic',
      'conversational',
      'persuasive',
    ];
  }

  /**
   * 모든 연령대 조회
   */
  getAllAgeGroups(): AgeGroup[] {
    return [
      'teen',
      'twenties',
      'thirties',
      'forties',
      'fifties',
      'sixties',
      'eighties',
    ];
  }
}

export const toneService = ToneService.getInstance();
export default toneService;

