import { ProjectFile, WritingMaterial } from '../types/project';

export type { ProjectFile, WritingMaterial };

export interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  files: ProjectFile[];
  guidelines: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
  }>;
  conversations: Array<{
    id: string;
    title: string;
    summary: string;
    date: Date;
    participants: string[];
  }>;
  analysis: {
    keywords: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    topics: string[];
  };
}

// 프로젝트별 상세 데이터
const projectDetails: { [key: string]: ProjectDetail } = {
  '1': {
    id: '1',
    name: '개포우성7차',
    description: '개포우성7차 재건축 프로젝트 - 삼성물산 설계 오류 논란 및 조합원 의견 수렴',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-07-14'),
    files: [
      {
        id: '1',
        name: '[인증] 행복한소유☆개포우성7차.txt',
        type: 'document',
        size: 245760,
        uploadedAt: new Date('2025-07-14'),
        status: 'uploaded'
      },
      {
        id: '2',
        name: '도시 및 주거환경정비법 시행규칙(국토교통부령).pdf',
        type: 'document',
        size: 1024000,
        uploadedAt: new Date('2025-07-13'),
        status: 'uploaded'
      },
      {
        id: '3',
        name: '250727_개포우성7_전단_삼성설계오류.pdf',
        type: 'document',
        size: 512000,
        uploadedAt: new Date('2025-07-12'),
        status: 'uploaded'
      }
    ],
    guidelines: [
      {
        id: '1',
        title: '대우 금리 기준',
        content: '대우 금리: cd금리+0% (약 2.5%) - 삼성 금리 : 회사자체보증 시 cd금리+0.3% (약 2.8%)',
        category: 'financial'
      },
      {
        id: '2',
        title: '설계 오류 관련 지침',
        content: '지하주차장 설계 오류, 정북일조 위반, 출입구 위치 위반 등 주요 문제점들을 중심으로 분석',
        category: 'design'
      },
      {
        id: '3',
        title: '조합원 의견 수렴 방침',
        content: '발언자 실제 닉네임으로 요약하고, 객관적 사실 중심으로 정리',
        category: 'communication'
      }
    ],
    conversations: [
      {
        id: '1',
        title: '시공사 평가 기준 및 설명회 기대',
        summary: '이재헌: 조합원이 제안서를 보고 선택하는 시스템을 신뢰하자. 박재우: 시공사 평가 내용 검증이 중요하다. 박은진: 설명회 발표자 확인이 필요하다.',
        date: new Date('2025-07-14'),
        participants: ['이재헌', '박재우', '박은진']
      },
      {
        id: '2',
        title: '공사비 관련 견해',
        summary: '이재헌: 공사비가 비슷하면 브랜드 등 다른 요소를 고려해야 한다. 박재우: GS와 삼성은 직접 비교할 수 없다. 정지혜: 제안서 검토 후 판단해야 한다.',
        date: new Date('2025-07-14'),
        participants: ['이재헌', '박재우', '정지혜']
      }
    ],
    analysis: {
      keywords: ['삼성물산', '설계오류', '지하주차장', '공사비', '조합원'],
      sentiment: 'negative',
      topics: ['설계 문제', '비용 비교', '조합원 의견']
    }
  },
  '2': {
    id: '2',
    name: '바이럴',
    description: '바이럴 마케팅 전략 및 콘텐츠 제작 프로젝트',
    status: 'active',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-07-10'),
    files: [
      {
        id: '4',
        name: '바이럴_마케팅_전략서.pdf',
        type: 'document',
        size: 768000,
        uploadedAt: new Date('2025-07-10'),
        status: 'uploaded'
      },
      {
        id: '5',
        name: '콘텐츠_제작_가이드라인.docx',
        type: 'document',
        size: 256000,
        uploadedAt: new Date('2025-07-09'),
        status: 'uploaded'
      }
    ],
    guidelines: [
      {
        id: '4',
        title: '바이럴 콘텐츠 제작 원칙',
        content: '감정적 공감을 유발하는 스토리텔링, 시각적 임팩트, 공유 유도 요소 포함',
        category: 'content'
      },
      {
        id: '5',
        title: '타겟 오디언스 분석',
        content: '50-70대 조합원층을 대상으로 한 이해하기 쉬운 메시지 전달',
        category: 'marketing'
      }
    ],
    conversations: [
      {
        id: '3',
        title: '바이럴 콘텐츠 기획 회의',
        summary: '카드뉴스 형식의 콘텐츠 제작, 소셜미디어 공유 전략, 타겟층별 맞춤 메시지 개발',
        date: new Date('2025-07-10'),
        participants: ['마케팅팀', '콘텐츠팀', '기획팀']
      }
    ],
    analysis: {
      keywords: ['바이럴', '마케팅', '콘텐츠', '공유', '소셜미디어'],
      sentiment: 'positive',
      topics: ['콘텐츠 제작', '마케팅 전략', '타겟 분석']
    }
  },
  '3': {
    id: '3',
    name: 'DA 설계 의견 요청',
    description: 'DA(개발행위허가) 설계 관련 의견 수렴 및 검토 프로젝트',
    status: 'pending',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-07-08'),
    files: [
      {
        id: '6',
        name: 'DA_설계도면_검토의견.pdf',
        type: 'document',
        size: 1536000,
        uploadedAt: new Date('2025-07-08'),
        status: 'uploaded'
      },
      {
        id: '7',
        name: '개발행위허가_신청서.pdf',
        type: 'document',
        size: 512000,
        uploadedAt: new Date('2025-07-07'),
        status: 'uploaded'
      }
    ],
    guidelines: [
      {
        id: '6',
        title: 'DA 설계 검토 기준',
        content: '도시계획, 건축법규, 환경영향평가 기준에 따른 종합적 검토',
        category: 'design'
      },
      {
        id: '7',
        title: '의견 수렴 절차',
        content: '전문가 검토 → 조합원 의견 수렴 → 수정 보완 → 최종 승인',
        category: 'process'
      }
    ],
    conversations: [
      {
        id: '4',
        title: 'DA 설계 검토 회의',
        summary: '전문가들의 설계 검토 의견, 법규 준수 여부, 개선사항 논의',
        date: new Date('2025-07-08'),
        participants: ['설계팀', '법무팀', '전문가']
      }
    ],
    analysis: {
      keywords: ['DA', '설계', '개발행위허가', '법규', '검토'],
      sentiment: 'neutral',
      topics: ['설계 검토', '법규 준수', '개선사항']
    }
  }
};

class ProjectDetailService {
  async getProjectDetail(projectId: string): Promise<ProjectDetail | null> {
    // 실제 API 호출을 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 500));

    const project = projectDetails[projectId];
    if (!project) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    return project;
  }

  async addFile(projectId: string, file: File): Promise<ProjectFile> {
    const newFile: ProjectFile = {
      id: Date.now().toString(),
      name: file.name,
      type: this.getFileType(file.name),
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploaded'
    };

    // 실제로는 서버에 파일을 업로드하고 프로젝트에 연결
    await new Promise(resolve => setTimeout(resolve, 1000));

    return newFile;
  }

  async deleteFile(projectId: string, fileId: string): Promise<void> {
    // 실제로는 서버에서 파일을 삭제
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async addGuideline(projectId: string, guideline: { title: string; content: string; category: string }): Promise<void> {
    // 실제로는 서버에 지침을 추가
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async generateWritingMaterial(projectId: string, prompt: string, sourceFileIds: string[] = []): Promise<WritingMaterial> {
    // 실제로는 AI 서비스를 호출하여 글쓰기 자료를 생성
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      id: Date.now().toString(),
      title: `Generated: ${prompt}`,
      content: `프로젝트 ${projectId}에 대한 ${prompt} 내용이 생성되었습니다.`,
      type: 'summary',
      createdAt: new Date(),
      sourceFiles: sourceFileIds
    };
  }

  private getFileType(filename: string): 'image' | 'document' | 'audio' | 'video' | 'other' {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'document';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) return 'audio';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) return 'video';
    return 'other';
  }
}

export const projectDetailService = new ProjectDetailService();
