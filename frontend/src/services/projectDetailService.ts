import { ProjectFile } from '../types/project';
import { WritingMaterial } from './clientFileProcessor';

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
    name: '샘플 재건축 프로젝트',
    description: '데모용 재건축·정비 프로젝트 — 설계 검토·조합원 소통 이슈 예시',
    status: 'active',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-07-14'),
    files: [
      {
        id: '1',
        name: '샘플_대화로그_export.txt',
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
        name: '검토의견_전단_설계이슈.pdf',
        type: 'document',
        size: 512000,
        uploadedAt: new Date('2025-07-12'),
        status: 'uploaded'
      }
    ],
    guidelines: [
      {
        id: '1',
        title: '금융 조건 비교',
        content: '시공사별 금리·보증 조건을 표로 비교하고 조합원에게 설명 가능한 수준으로 요약',
        category: 'financial'
      },
      {
        id: '2',
        title: '설계 검토 지침',
        content: '주차·일조·동선 등 주요 설계 이슈를 규정 대비 체크리스트로 점검',
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
        summary: '참가자 A: 제안서 기반 선택 절차의 투명성 강조. 참가자 B: 평가 항목 검증 필요. 참가자 C: 설명회 구성 확인.',
        date: new Date('2025-07-14'),
        participants: ['참가자 A', '참가자 B', '참가자 C']
      },
      {
        id: '2',
        title: '공사비 관련 견해',
        summary: '참가자 A: 단가 외 브랜드·사후관리 요소 고려. 참가자 B: 후보별 비교 시 동일 기준 적용. 참가자 C: 제안서 검토 후 결정.',
        date: new Date('2025-07-14'),
        participants: ['참가자 A', '참가자 B', '참가자 C']
      }
    ],
    analysis: {
      keywords: ['시공사', '설계검토', '주차동선', '공사비', '조합원'],
      sentiment: 'neutral',
      topics: ['설계 검토', '비용 비교', '의견 수렴']
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

  async deleteFile(_projectId: string, _fileId: string): Promise<void> {
    // 실제로는 서버에서 파일을 삭제
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async addGuideline(_projectId: string, _guideline: { title: string; content: string; category: string }): Promise<void> {
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
      category: 'generated',
      keywords: [prompt],
      sourceFiles: sourceFileIds,
      confidenceScore: 0.8,
      usageSuggestions: ['문서 작성', '프레젠테이션', '보고서'],
      createdAt: new Date()
    };
  }

  private getFileType(filename: string): 'image' | 'document' | 'code' | 'other' {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'document';
    if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(ext || '')) return 'code';
    return 'other';
  }
}

export const projectDetailService = new ProjectDetailService();
