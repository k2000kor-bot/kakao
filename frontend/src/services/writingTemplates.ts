/**
 * 글쓰기 템플릿 서비스
 * 44개의 다양한 글쓰기 템플릿 제공
 */

export type WritingTone = 
  | 'formal'           // 격식있는
  | 'casual'           // 캐주얼한
  | 'professional'     // 전문적인
  | 'friendly'         // 친근한
  | 'academic'         // 학술적인
  | 'creative'         // 창의적인
  | 'poetic'           // 시적인
  | 'narrative'        // 서술적인
  | 'persuasive'        // 설득적인
  | 'informative'      // 정보전달적인
  | 'reflective'       // 성찰적인 (수필 등)
  | 'conversational'   // 대화체
  | 'humorous'         // 유머러스한
  | 'serious'          // 진지한
  | 'warm'             // 따뜻한
  | 'objective'        // 객관적인
  | 'subjective';      // 주관적인

export type WritingStyle = 
  | 'essay'            // 수필
  | 'novel'            // 소설
  | 'poem'             // 시
  | 'article'          // 기사
  | 'report'           // 보고서
  | 'letter'           // 편지
  | 'speech'           // 연설
  | 'diary'            // 일기
  | 'review'           // 리뷰
  | 'guide'            // 가이드
  | 'story'            // 이야기
  | 'analysis'         // 분석
  | 'opinion'          // 의견
  | 'description';     // 묘사

export interface WritingTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  example?: string;
  defaultTone?: WritingTone;
  defaultStyle?: WritingStyle;
  supportedTones?: WritingTone[];
  supportedStyles?: WritingStyle[];
  fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }>;
}

export const writingTemplates: WritingTemplate[] = [
    // 비즈니스 카테고리 (10개)
  {
    id: 'business-email',
    category: '비즈니스',
    title: '비즈니스 이메일',
    description: '전문적이고 효과적인 비즈니스 이메일 작성',
    prompt: '다음 정보를 바탕으로 전문적인 비즈니스 이메일을 작성해주세요:\n수신자: {{recipient}}\n목적: {{purpose}}\n주요 내용: {{content}}',
    defaultTone: 'professional',
    defaultStyle: 'letter',
    fields: [
      { name: 'recipient', label: '수신자', type: 'text', required: true },
      { name: 'purpose', label: '목적', type: 'text', required: true },
      { name: 'content', label: '주요 내용', type: 'textarea', required: true },
    ],
  },
    {
        id: 'business-proposal',
        category: '비즈니스',
        title: '사업 제안서',
        description: '체계적이고 설득력 있는 사업 제안서 작성',
        prompt: '다음 정보로 사업 제안서를 작성해주세요:\n프로젝트명: {{projectName}}\n목적: {{objective}}\n예상 예산: {{budget}}\n기대 효과: {{expectedResult}}',
        fields: [
            { name: 'projectName', label: '프로젝트명', type: 'text', required: true },
            { name: 'objective', label: '목적', type: 'textarea', required: true },
            { name: 'budget', label: '예상 예산', type: 'text', required: true },
            { name: 'expectedResult', label: '기대 효과', type: 'textarea', required: true },
        ],
    },
    {
        id: 'meeting-minutes',
        category: '비즈니스',
        title: '회의록',
        description: '구조화된 회의록 작성',
        prompt: '다음 회의 정보를 바탕으로 회의록을 작성해주세요:\n회의 주제: {{topic}}\n참석자: {{attendees}}\n주요 논의 사항: {{discussion}}\n결정 사항: {{decisions}}',
        fields: [
            { name: 'topic', label: '회의 주제', type: 'text', required: true },
            { name: 'attendees', label: '참석자', type: 'text', required: true },
            { name: 'discussion', label: '주요 논의 사항', type: 'textarea', required: true },
            { name: 'decisions', label: '결정 사항', type: 'textarea', required: true },
        ],
    },
    {
        id: 'report',
        category: '비즈니스',
        title: '업무 보고서',
        description: '명확하고 체계적인 업무 보고서 작성',
        prompt: '다음 정보로 업무 보고서를 작성해주세요:\n보고서 제목: {{title}}\n보고 기간: {{period}}\n주요 업무: {{tasks}}\n성과: {{results}}',
        fields: [
            { name: 'title', label: '보고서 제목', type: 'text', required: true },
            { name: 'period', label: '보고 기간', type: 'text', required: true },
            { name: 'tasks', label: '주요 업무', type: 'textarea', required: true },
            { name: 'results', label: '성과', type: 'textarea', required: true },
        ],
    },
    {
        id: 'presentation',
        category: '비즈니스',
        title: '프레젠테이션 대본',
        description: '효과적인 프레젠테이션 대본 작성',
        prompt: '다음 주제로 프레젠테이션 대본을 작성해주세요:\n주제: {{topic}}\n대상: {{audience}}\n목표: {{goal}}\n주요 포인트: {{keyPoints}}',
        fields: [
            { name: 'topic', label: '주제', type: 'text', required: true },
            { name: 'audience', label: '대상', type: 'text', required: true },
            { name: 'goal', label: '목표', type: 'textarea', required: true },
            { name: 'keyPoints', label: '주요 포인트', type: 'textarea', required: true },
        ],
    },
    {
        id: 'resume',
        category: '비즈니스',
        title: '이력서',
        description: '임팩트 있는 이력서 작성',
        prompt: '다음 정보로 이력서를 작성해주세요:\n이름: {{name}}\n지원 직무: {{position}}\n경력: {{experience}}\n보유 기술: {{skills}}\n학력: {{education}}',
        fields: [
            { name: 'name', label: '이름', type: 'text', required: true },
            { name: 'position', label: '지원 직무', type: 'text', required: true },
            { name: 'experience', label: '경력', type: 'textarea', required: true },
            { name: 'skills', label: '보유 기술', type: 'text', required: true },
            { name: 'education', label: '학력', type: 'textarea', required: true },
        ],
    },
    {
        id: 'cover-letter',
        category: '비즈니스',
        title: '자기소개서',
        description: '설득력 있는 자기소개서 작성',
        prompt: '다음 정보로 자기소개서를 작성해주세요:\n지원 회사: {{company}}\n지원 직무: {{position}}\n지원 동기: {{motivation}}\n강점: {{strengths}}',
        fields: [
            { name: 'company', label: '지원 회사', type: 'text', required: true },
            { name: 'position', label: '지원 직무', type: 'text', required: true },
            { name: 'motivation', label: '지원 동기', type: 'textarea', required: true },
            { name: 'strengths', label: '강점', type: 'textarea', required: true },
        ],
    },
    {
        id: 'contract',
        category: '비즈니스',
        title: '계약서 초안',
        description: '법적으로 명확한 계약서 초안 작성',
        prompt: '다음 정보로 계약서 초안을 작성해주세요:\n계약 당사자: {{parties}}\n계약 목적: {{purpose}}\n계약 기간: {{duration}}\n조건: {{terms}}',
        fields: [
            { name: 'parties', label: '계약 당사자', type: 'text', required: true },
            { name: 'purpose', label: '계약 목적', type: 'textarea', required: true },
            { name: 'duration', label: '계약 기간', type: 'text', required: true },
            { name: 'terms', label: '조건', type: 'textarea', required: true },
        ],
    },
    {
        id: 'invoice',
        category: '비즈니스',
        title: '인보이스',
        description: '전문적인 인보이스 작성',
        prompt: '다음 정보로 인보이스를 작성해주세요:\n발행인: {{issuer}}\n수신인: {{recipient}}\n항목: {{items}}\n금액: {{amount}}',
        fields: [
            { name: 'issuer', label: '발행인', type: 'text', required: true },
            { name: 'recipient', label: '수신인', type: 'text', required: true },
            { name: 'items', label: '항목', type: 'textarea', required: true },
            { name: 'amount', label: '금액', type: 'text', required: true },
        ],
    },
    {
        id: 'press-release',
        category: '비즈니스',
        title: '보도자료',
        description: '전문적인 보도자료 작성',
        prompt: '다음 정보로 보도자료를 작성해주세요:\n제목: {{title}}\n발행 기관: {{organization}}\n주요 내용: {{content}}\n연락처: {{contact}}',
        fields: [
            { name: 'title', label: '제목', type: 'text', required: true },
            { name: 'organization', label: '발행 기관', type: 'text', required: true },
            { name: 'content', label: '주요 내용', type: 'textarea', required: true },
            { name: 'contact', label: '연락처', type: 'text', required: true },
        ],
    },

    // 마케팅 카테고리 (8개)
    {
        id: 'ad-copy',
        category: '마케팅',
        title: '광고 카피',
        description: '임팩트 있는 광고 카피 작성',
        prompt: '다음 정보로 광고 카피를 작성해주세요:\n제품/서비스: {{product}}\n타겟 고객: {{target}}\n핵심 메시지: {{message}}\n톤앤매너: {{tone}}',
        fields: [
            { name: 'product', label: '제품/서비스', type: 'text', required: true },
            { name: 'target', label: '타겟 고객', type: 'text', required: true },
            { name: 'message', label: '핵심 메시지', type: 'textarea', required: true },
            { name: 'tone', label: '톤앤매너', type: 'select', options: ['친근한', '전문적인', '유머러스한', '감성적인'], required: true },
        ],
    },
    {
        id: 'social-media-post',
        category: '마케팅',
        title: '소셜 미디어 게시물',
        description: '참여도를 높이는 소셜 미디어 게시물 작성',
        prompt: '다음 정보로 소셜 미디어 게시물을 작성해주세요:\n플랫폼: {{platform}}\n주제: {{topic}}\n목표: {{goal}}\n해시태그: {{hashtags}}',
        fields: [
            { name: 'platform', label: '플랫폼', type: 'select', options: ['인스타그램', '페이스북', '트위터', '링크드인'], required: true },
            { name: 'topic', label: '주제', type: 'text', required: true },
            { name: 'goal', label: '목표', type: 'textarea', required: true },
            { name: 'hashtags', label: '해시태그', type: 'text', required: false },
        ],
    },
    {
        id: 'email-marketing',
        category: '마케팅',
        title: '이메일 마케팅',
        description: '전환율을 높이는 이메일 마케팅 작성',
        prompt: '다음 정보로 이메일 마케팅을 작성해주세요:\n캠페인명: {{campaign}}\n대상: {{audience}}\n제안: {{offer}}\nCTA: {{cta}}',
        fields: [
            { name: 'campaign', label: '캠페인명', type: 'text', required: true },
            { name: 'audience', label: '대상', type: 'text', required: true },
            { name: 'offer', label: '제안', type: 'textarea', required: true },
            { name: 'cta', label: 'CTA (행동 유도)', type: 'text', required: true },
        ],
    },
    {
        id: 'product-description',
        category: '마케팅',
        title: '제품 설명',
        description: '매력적인 제품 설명 작성',
        prompt: '다음 정보로 제품 설명을 작성해주세요:\n제품명: {{productName}}\n주요 기능: {{features}}\n장점: {{benefits}}\n가격: {{price}}',
        fields: [
            { name: 'productName', label: '제품명', type: 'text', required: true },
            { name: 'features', label: '주요 기능', type: 'textarea', required: true },
            { name: 'benefits', label: '장점', type: 'textarea', required: true },
            { name: 'price', label: '가격', type: 'text', required: false },
        ],
    },
    {
        id: 'blog-post',
        category: '마케팅',
        title: '블로그 포스트',
        description: 'SEO 친화적인 블로그 포스트 작성',
        prompt: '다음 정보로 블로그 포스트를 작성해주세요:\n제목: {{title}}\n주제: {{topic}}\n타겟 키워드: {{keywords}}\n구조: {{structure}}',
        fields: [
            { name: 'title', label: '제목', type: 'text', required: true },
            { name: 'topic', label: '주제', type: 'textarea', required: true },
            { name: 'keywords', label: '타겟 키워드', type: 'text', required: true },
            { name: 'structure', label: '구조', type: 'select', options: ['리스트형', '가이드형', '스토리텔링', '비교형'], required: true },
        ],
    },
    {
        id: 'landing-page',
        category: '마케팅',
        title: '랜딩 페이지',
        description: '전환율을 높이는 랜딩 페이지 콘텐츠 작성',
        prompt: '다음 정보로 랜딩 페이지 콘텐츠를 작성해주세요:\n제품/서비스: {{product}}\n타겟 고객: {{target}}\n핵심 가치: {{value}}\nCTA: {{cta}}',
        fields: [
            { name: 'product', label: '제품/서비스', type: 'text', required: true },
            { name: 'target', label: '타겟 고객', type: 'text', required: true },
            { name: 'value', label: '핵심 가치', type: 'textarea', required: true },
            { name: 'cta', label: 'CTA', type: 'text', required: true },
        ],
    },
    {
        id: 'newsletter',
        category: '마케팅',
        title: '뉴스레터',
        description: '참여도를 높이는 뉴스레터 작성',
        prompt: '다음 정보로 뉴스레터를 작성해주세요:\n제목: {{title}}\n주요 소식: {{news}}\n이벤트: {{events}}\n링크: {{links}}',
        fields: [
            { name: 'title', label: '제목', type: 'text', required: true },
            { name: 'news', label: '주요 소식', type: 'textarea', required: true },
            { name: 'events', label: '이벤트', type: 'textarea', required: false },
            { name: 'links', label: '링크', type: 'text', required: false },
        ],
    },
    {
        id: 'sales-pitch',
        category: '마케팅',
        title: '영업 프레젠테이션',
        description: '설득력 있는 영업 프레젠테이션 작성',
        prompt: '다음 정보로 영업 프레젠테이션을 작성해주세요:\n제품/서비스: {{product}}\n고객 페인 포인트: {{painPoints}}\n해결책: {{solution}}\n가격: {{price}}',
        fields: [
            { name: 'product', label: '제품/서비스', type: 'text', required: true },
            { name: 'painPoints', label: '고객 페인 포인트', type: 'textarea', required: true },
            { name: 'solution', label: '해결책', type: 'textarea', required: true },
            { name: 'price', label: '가격', type: 'text', required: true },
        ],
    },

    // 교육 카테고리 (6개)
    {
        id: 'lesson-plan',
        category: '교육',
        title: '수업 계획서',
        description: '체계적인 수업 계획서 작성',
        prompt: '다음 정보로 수업 계획서를 작성해주세요:\n과목: {{subject}}\n학년: {{grade}}\n수업 목표: {{objectives}}\n활동: {{activities}}',
        fields: [
            { name: 'subject', label: '과목', type: 'text', required: true },
            { name: 'grade', label: '학년', type: 'text', required: true },
            { name: 'objectives', label: '수업 목표', type: 'textarea', required: true },
            { name: 'activities', label: '활동', type: 'textarea', required: true },
        ],
    },
  {
    id: 'essay',
    category: '교육',
    title: '에세이',
    description: '논리적이고 체계적인 에세이 작성',
    prompt: '다음 주제로 에세이를 작성해주세요:\n주제: {{topic}}\n논점: {{thesis}}\n주요 논거: {{arguments}}\n결론: {{conclusion}}',
    defaultTone: 'academic',
    defaultStyle: 'essay',
    fields: [
      { name: 'topic', label: '주제', type: 'text', required: true },
      { name: 'thesis', label: '논점', type: 'textarea', required: true },
      { name: 'arguments', label: '주요 논거', type: 'textarea', required: true },
      { name: 'conclusion', label: '결론', type: 'textarea', required: true },
    ],
  },
    {
        id: 'research-paper',
        category: '교육',
        title: '연구 논문',
        description: '학술적인 연구 논문 작성',
        prompt: '다음 정보로 연구 논문을 작성해주세요:\n연구 주제: {{topic}}\n연구 목적: {{purpose}}\n방법론: {{methodology}}\n결과: {{results}}',
        fields: [
            { name: 'topic', label: '연구 주제', type: 'text', required: true },
            { name: 'purpose', label: '연구 목적', type: 'textarea', required: true },
            { name: 'methodology', label: '방법론', type: 'textarea', required: true },
            { name: 'results', label: '결과', type: 'textarea', required: true },
        ],
    },
    {
        id: 'summary',
        category: '교육',
        title: '요약문',
        description: '핵심을 담은 요약문 작성',
        prompt: '다음 내용을 요약해주세요:\n원문: {{originalText}}\n요약 길이: {{length}}\n중점 사항: {{focus}}',
        fields: [
            { name: 'originalText', label: '원문', type: 'textarea', required: true },
            { name: 'length', label: '요약 길이', type: 'select', options: ['짧게', '보통', '길게'], required: true },
            { name: 'focus', label: '중점 사항', type: 'textarea', required: false },
        ],
    },
    {
        id: 'quiz',
        category: '교육',
        title: '퀴즈 문제',
        description: '교육 효과가 높은 퀴즈 문제 작성',
        prompt: '다음 정보로 퀴즈 문제를 작성해주세요:\n과목: {{subject}}\n주제: {{topic}}\n난이도: {{difficulty}}\n문제 수: {{count}}',
        fields: [
            { name: 'subject', label: '과목', type: 'text', required: true },
            { name: 'topic', label: '주제', type: 'text', required: true },
            { name: 'difficulty', label: '난이도', type: 'select', options: ['쉬움', '보통', '어려움'], required: true },
            { name: 'count', label: '문제 수', type: 'number', required: true },
        ],
    },
    {
        id: 'study-guide',
        category: '교육',
        title: '학습 가이드',
        description: '효과적인 학습 가이드 작성',
        prompt: '다음 정보로 학습 가이드를 작성해주세요:\n과목: {{subject}}\n주제: {{topic}}\n학습 목표: {{goals}}\n학습 방법: {{methods}}',
        fields: [
            { name: 'subject', label: '과목', type: 'text', required: true },
            { name: 'topic', label: '주제', type: 'text', required: true },
            { name: 'goals', label: '학습 목표', type: 'textarea', required: true },
            { name: 'methods', label: '학습 방법', type: 'textarea', required: true },
        ],
    },

    // 창작 카테고리 (8개)
  {
    id: 'short-story',
    category: '창작',
    title: '단편 소설',
    description: '감동적인 단편 소설 작성',
    prompt: '다음 정보로 단편 소설을 작성해주세요:\n장르: {{genre}}\n주인공: {{protagonist}}\n배경: {{setting}}\n갈등: {{conflict}}',
    defaultTone: 'narrative',
    defaultStyle: 'novel',
    fields: [
      { name: 'genre', label: '장르', type: 'select', options: ['로맨스', '미스터리', 'SF', '판타지', '드라마'], required: true },
      { name: 'protagonist', label: '주인공', type: 'text', required: true },
      { name: 'setting', label: '배경', type: 'textarea', required: true },
      { name: 'conflict', label: '갈등', type: 'textarea', required: true },
    ],
  },
  {
    id: 'poem',
    category: '창작',
    title: '시',
    description: '감성적인 시 작성',
    prompt: '다음 주제로 시를 작성해주세요:\n주제: {{theme}}\n분위기: {{mood}}\n형식: {{form}}\n길이: {{length}}',
    defaultTone: 'poetic',
    defaultStyle: 'poem',
    fields: [
      { name: 'theme', label: '주제', type: 'text', required: true },
      { name: 'mood', label: '분위기', type: 'select', options: ['밝은', '어두운', '평화로운', '격정적인'], required: true },
      { name: 'form', label: '형식', type: 'select', options: ['자유시', '운율시', '하이쿠'], required: true },
      { name: 'length', label: '길이', type: 'select', options: ['짧게', '보통', '길게'], required: true },
    ],
  },
    {
        id: 'script',
        category: '창작',
        title: '대본',
        description: '연극이나 영화 대본 작성',
        prompt: '다음 정보로 대본을 작성해주세요:\n장르: {{genre}}\n등장인물: {{characters}}\n배경: {{setting}}\n줄거리: {{plot}}',
        fields: [
            { name: 'genre', label: '장르', type: 'select', options: ['드라마', '코미디', '액션', '스릴러'], required: true },
            { name: 'characters', label: '등장인물', type: 'textarea', required: true },
            { name: 'setting', label: '배경', type: 'textarea', required: true },
            { name: 'plot', label: '줄거리', type: 'textarea', required: true },
        ],
    },
    {
        id: 'dialogue',
        category: '창작',
        title: '대화',
        description: '자연스러운 대화 작성',
        prompt: '다음 정보로 대화를 작성해주세요:\n상황: {{situation}}\n인물1: {{character1}}\n인물2: {{character2}}\n톤: {{tone}}',
        fields: [
            { name: 'situation', label: '상황', type: 'textarea', required: true },
            { name: 'character1', label: '인물1', type: 'text', required: true },
            { name: 'character2', label: '인물2', type: 'text', required: true },
            { name: 'tone', label: '톤', type: 'select', options: ['친근한', '격식있는', '유머러스한', '진지한'], required: true },
        ],
    },
    {
        id: 'character-profile',
        category: '창작',
        title: '캐릭터 프로필',
        description: '상세한 캐릭터 프로필 작성',
        prompt: '다음 정보로 캐릭터 프로필을 작성해주세요:\n이름: {{name}}\n나이: {{age}}\n성격: {{personality}}\n배경: {{background}}\n목표: {{goals}}',
        fields: [
            { name: 'name', label: '이름', type: 'text', required: true },
            { name: 'age', label: '나이', type: 'number', required: true },
            { name: 'personality', label: '성격', type: 'textarea', required: true },
            { name: 'background', label: '배경', type: 'textarea', required: true },
            { name: 'goals', label: '목표', type: 'textarea', required: true },
        ],
    },
    {
        id: 'world-building',
        category: '창작',
        title: '세계관 구축',
        description: '상세한 세계관 구축',
        prompt: '다음 정보로 세계관을 구축해주세요:\n세계명: {{worldName}}\n시대: {{era}}\n지리: {{geography}}\n문화: {{culture}}\n체제: {{system}}',
        fields: [
            { name: 'worldName', label: '세계명', type: 'text', required: true },
            { name: 'era', label: '시대', type: 'text', required: true },
            { name: 'geography', label: '지리', type: 'textarea', required: true },
            { name: 'culture', label: '문화', type: 'textarea', required: true },
            { name: 'system', label: '체제', type: 'textarea', required: true },
        ],
    },
    {
        id: 'plot-outline',
        category: '창작',
        title: '플롯 개요',
        description: '구조화된 플롯 개요 작성',
        prompt: '다음 정보로 플롯 개요를 작성해주세요:\n장르: {{genre}}\n주인공: {{protagonist}}\n목표: {{goal}}\n장애물: {{obstacles}}\n결말: {{ending}}',
        fields: [
            { name: 'genre', label: '장르', type: 'select', options: ['모험', '로맨스', '미스터리', 'SF'], required: true },
            { name: 'protagonist', label: '주인공', type: 'text', required: true },
            { name: 'goal', label: '목표', type: 'textarea', required: true },
            { name: 'obstacles', label: '장애물', type: 'textarea', required: true },
            { name: 'ending', label: '결말', type: 'select', options: ['해피엔딩', '새드엔딩', '오픈엔딩'], required: true },
        ],
    },
    {
        id: 'fan-fiction',
        category: '창작',
        title: '팬픽션',
        description: '창의적인 팬픽션 작성',
        prompt: '다음 정보로 팬픽션을 작성해주세요:\n원작: {{original}}\n장르: {{genre}}\n등장인물: {{characters}}\n시나리오: {{scenario}}',
        fields: [
            { name: 'original', label: '원작', type: 'text', required: true },
            { name: 'genre', label: '장르', type: 'select', options: ['로맨스', '액션', '코미디', '드라마'], required: true },
            { name: 'characters', label: '등장인물', type: 'textarea', required: true },
            { name: 'scenario', label: '시나리오', type: 'textarea', required: true },
        ],
    },

    // 개인 카테고리 (6개)
  {
    id: 'diary',
    category: '개인',
    title: '일기',
    description: '감정을 담은 일기 작성',
    prompt: '다음 내용으로 일기를 작성해주세요:\n날짜: {{date}}\n오늘의 일: {{events}}\n감정: {{emotions}}\n생각: {{thoughts}}',
    defaultTone: 'reflective',
    defaultStyle: 'diary',
    fields: [
      { name: 'date', label: '날짜', type: 'text', required: true },
      { name: 'events', label: '오늘의 일', type: 'textarea', required: true },
      { name: 'emotions', label: '감정', type: 'textarea', required: true },
      { name: 'thoughts', label: '생각', type: 'textarea', required: true },
    ],
  },
  {
    id: 'letter',
    category: '개인',
    title: '편지',
    description: '진심이 담긴 편지 작성',
    prompt: '다음 정보로 편지를 작성해주세요:\n수신자: {{recipient}}\n목적: {{purpose}}\n주요 내용: {{content}}\n톤: {{tone}}',
    defaultTone: 'warm',
    defaultStyle: 'letter',
    fields: [
      { name: 'recipient', label: '수신자', type: 'text', required: true },
      { name: 'purpose', label: '목적', type: 'select', options: ['감사', '축하', '위로', '사과', '일반'], required: true },
      { name: 'content', label: '주요 내용', type: 'textarea', required: true },
      { name: 'tone', label: '톤', type: 'select', options: ['친근한', '격식있는', '감성적인'], required: true },
    ],
  },
    {
        id: 'speech',
        category: '개인',
        title: '연설문',
        description: '감동적인 연설문 작성',
        prompt: '다음 정보로 연설문을 작성해주세요:\n상황: {{occasion}}\n대상: {{audience}}\n주제: {{topic}}\n메시지: {{message}}',
        fields: [
            { name: 'occasion', label: '상황', type: 'select', options: ['결혼식', '장례식', '축하', '격려', '기타'], required: true },
            { name: 'audience', label: '대상', type: 'text', required: true },
            { name: 'topic', label: '주제', type: 'text', required: true },
            { name: 'message', label: '메시지', type: 'textarea', required: true },
        ],
    },
    {
        id: 'gratitude',
        category: '개인',
        title: '감사 인사',
        description: '진심이 담긴 감사 인사 작성',
        prompt: '다음 정보로 감사 인사를 작성해주세요:\n대상: {{recipient}}\n감사한 일: {{gratitude}}\n영향: {{impact}}\n톤: {{tone}}',
        fields: [
            { name: 'recipient', label: '대상', type: 'text', required: true },
            { name: 'gratitude', label: '감사한 일', type: 'textarea', required: true },
            { name: 'impact', label: '영향', type: 'textarea', required: true },
            { name: 'tone', label: '톤', type: 'select', options: ['친근한', '격식있는', '감성적인'], required: true },
        ],
    },
    {
        id: 'apology',
        category: '개인',
        title: '사과문',
        description: '진심이 담긴 사과문 작성',
        prompt: '다음 정보로 사과문을 작성해주세요:\n대상: {{recipient}}\n상황: {{situation}}\n잘못: {{mistake}}\n해결책: {{solution}}',
        fields: [
            { name: 'recipient', label: '대상', type: 'text', required: true },
            { name: 'situation', label: '상황', type: 'textarea', required: true },
            { name: 'mistake', label: '잘못', type: 'textarea', required: true },
            { name: 'solution', label: '해결책', type: 'textarea', required: true },
        ],
    },
    {
        id: 'invitation',
        category: '개인',
        title: '초대장',
        description: '우아한 초대장 작성',
        prompt: '다음 정보로 초대장을 작성해주세요:\n행사: {{event}}\n날짜/시간: {{datetime}}\n장소: {{location}}\n드레스코드: {{dressCode}}',
        fields: [
            { name: 'event', label: '행사', type: 'select', options: ['결혼식', '생일파티', '회식', '모임', '기타'], required: true },
            { name: 'datetime', label: '날짜/시간', type: 'text', required: true },
            { name: 'location', label: '장소', type: 'text', required: true },
            { name: 'dressCode', label: '드레스코드', type: 'text', required: false },
        ],
    },

    // 기술 카테고리 (6개)
    {
        id: 'technical-doc',
        category: '기술',
        title: '기술 문서',
        description: '명확한 기술 문서 작성',
        prompt: '다음 정보로 기술 문서를 작성해주세요:\n제목: {{title}}\n기술: {{technology}}\n목적: {{purpose}}\n사용법: {{usage}}',
        fields: [
            { name: 'title', label: '제목', type: 'text', required: true },
            { name: 'technology', label: '기술', type: 'text', required: true },
            { name: 'purpose', label: '목적', type: 'textarea', required: true },
            { name: 'usage', label: '사용법', type: 'textarea', required: true },
        ],
    },
    {
        id: 'api-documentation',
        category: '기술',
        title: 'API 문서',
        description: '개발자를 위한 API 문서 작성',
        prompt: '다음 정보로 API 문서를 작성해주세요:\nAPI명: {{apiName}}\n엔드포인트: {{endpoints}}\n파라미터: {{parameters}}\n응답: {{response}}',
        fields: [
            { name: 'apiName', label: 'API명', type: 'text', required: true },
            { name: 'endpoints', label: '엔드포인트', type: 'textarea', required: true },
            { name: 'parameters', label: '파라미터', type: 'textarea', required: true },
            { name: 'response', label: '응답', type: 'textarea', required: true },
        ],
    },
    {
        id: 'code-comment',
        category: '기술',
        title: '코드 주석',
        description: '명확한 코드 주석 작성',
        prompt: '다음 코드에 대한 주석을 작성해주세요:\n코드: {{code}}\n언어: {{language}}\n목적: {{purpose}}\n복잡도: {{complexity}}',
        fields: [
            { name: 'code', label: '코드', type: 'textarea', required: true },
            { name: 'language', label: '언어', type: 'select', options: ['JavaScript', 'Python', 'Java', 'C++', '기타'], required: true },
            { name: 'purpose', label: '목적', type: 'textarea', required: true },
            { name: 'complexity', label: '복잡도', type: 'select', options: ['낮음', '보통', '높음'], required: true },
        ],
    },
    {
        id: 'readme',
        category: '기술',
        title: 'README',
        description: '프로젝트 README 작성',
        prompt: '다음 정보로 README를 작성해주세요:\n프로젝트명: {{projectName}}\n설명: {{description}}\n기능: {{features}}\n설치: {{installation}}\n사용법: {{usage}}',
        fields: [
            { name: 'projectName', label: '프로젝트명', type: 'text', required: true },
            { name: 'description', label: '설명', type: 'textarea', required: true },
            { name: 'features', label: '기능', type: 'textarea', required: true },
            { name: 'installation', label: '설치', type: 'textarea', required: true },
            { name: 'usage', label: '사용법', type: 'textarea', required: true },
        ],
    },
    {
        id: 'bug-report',
        category: '기술',
        title: '버그 리포트',
        description: '상세한 버그 리포트 작성',
        prompt: '다음 정보로 버그 리포트를 작성해주세요:\n버그 설명: {{description}}\n재현 방법: {{steps}}\n예상 동작: {{expected}}\n실제 동작: {{actual}}\n환경: {{environment}}',
        fields: [
            { name: 'description', label: '버그 설명', type: 'textarea', required: true },
            { name: 'steps', label: '재현 방법', type: 'textarea', required: true },
            { name: 'expected', label: '예상 동작', type: 'textarea', required: true },
            { name: 'actual', label: '실제 동작', type: 'textarea', required: true },
            { name: 'environment', label: '환경', type: 'text', required: true },
        ],
    },
    {
        id: 'tutorial',
        category: '기술',
        title: '튜토리얼',
        description: '단계별 튜토리얼 작성',
        prompt: '다음 정보로 튜토리얼을 작성해주세요:\n주제: {{topic}}\n대상: {{audience}}\n난이도: {{difficulty}}\n단계: {{steps}}',
        fields: [
            { name: 'topic', label: '주제', type: 'text', required: true },
            { name: 'audience', label: '대상', type: 'text', required: true },
            { name: 'difficulty', label: '난이도', type: 'select', options: ['초급', '중급', '고급'], required: true },
            { name: 'steps', label: '단계', type: 'textarea', required: true },
        ],
    },
];

/**
 * 카테고리별 템플릿 가져오기
 */
export function getTemplatesByCategory(category: string): WritingTemplate[] {
    return writingTemplates.filter((template) => template.category === category);
}

/**
 * 템플릿 ID로 찾기
 */
export function getTemplateById(id: string): WritingTemplate | undefined {
    return writingTemplates.find((template) => template.id === id);
}

/**
 * 모든 카테고리 가져오기
 */
export function getAllCategories(): string[] {
    return Array.from(new Set(writingTemplates.map((template) => template.category)));
}

/**
 * 어투 설명 가져오기
 */
export function getToneDescription(tone: WritingTone): string {
  const descriptions: Record<WritingTone, string> = {
    formal: '격식있고 정중한 어투로 작성해주세요. 존댓말과 높임말을 사용하고, 공식적인 표현을 사용하세요.',
    casual: '편안하고 자연스러운 어투로 작성해주세요. 구어체를 사용하고, 친근한 표현을 사용하세요.',
    professional: '전문적이고 신뢰할 수 있는 어투로 작성해주세요. 명확하고 정확한 표현을 사용하세요.',
    friendly: '친근하고 따뜻한 어투로 작성해주세요. 편안하고 접근하기 쉬운 표현을 사용하세요.',
    academic: '학술적이고 논리적인 어투로 작성해주세요. 객관적이고 정확한 용어를 사용하세요.',
    creative: '창의적이고 독창적인 어투로 작성해주세요. 상상력과 표현력을 발휘하세요.',
    poetic: '시적이고 아름다운 어투로 작성해주세요. 비유와 은유를 활용하고, 리듬감 있는 문장을 사용하세요.',
    narrative: '서술적이고 이야기하는 듯한 어투로 작성해주세요. 시간의 흐름에 따라 자연스럽게 서술하세요.',
    persuasive: '설득력 있고 영향력 있는 어투로 작성해주세요. 논리적 근거와 감성적 호소를 결합하세요.',
    informative: '정보를 명확하게 전달하는 어투로 작성해주세요. 사실 중심으로 객관적으로 서술하세요.',
    reflective: '성찰적이고 깊이 있는 어투로 작성해주세요. 개인적인 사고와 느낌을 진솔하게 표현하세요. (수필 스타일)',
    conversational: '대화하듯이 자연스러운 어투로 작성해주세요. 구어체와 일상적인 표현을 사용하세요.',
    humorous: '유머러스하고 재미있는 어투로 작성해주세요. 적절한 농담과 위트를 사용하세요.',
    serious: '진지하고 신중한 어투로 작성해주세요. 무게감 있는 표현을 사용하세요.',
    warm: '따뜻하고 정감 있는 어투로 작성해주세요. 공감과 배려가 느껴지는 표현을 사용하세요.',
    objective: '객관적이고 중립적인 어투로 작성해주세요. 감정을 배제하고 사실 중심으로 서술하세요.',
    subjective: '주관적이고 개인적인 어투로 작성해주세요. 개인의 의견과 감정을 솔직하게 표현하세요.',
  };
  return descriptions[tone] || descriptions.formal;
}

/**
 * 글 종류 설명 가져오기
 */
export function getStyleDescription(style: WritingStyle): string {
  const descriptions: Record<WritingStyle, string> = {
    essay: '수필 형식으로 작성해주세요. 개인적인 경험과 생각을 자유롭게 서술하고, 성찰적이고 깊이 있는 내용으로 구성하세요.',
    novel: '소설 형식으로 작성해주세요. 등장인물, 배경, 플롯을 포함하고, 이야기의 흐름을 자연스럽게 전개하세요.',
    poem: '시 형식으로 작성해주세요. 운율과 리듬을 고려하고, 함축적이고 상징적인 표현을 사용하세요.',
    article: '기사 형식으로 작성해주세요. 5W1H를 포함하고, 객관적이고 사실 중심으로 서술하세요.',
    report: '보고서 형식으로 작성해주세요. 구조화된 형식을 따르고, 데이터와 근거를 제시하세요.',
    letter: '편지 형식으로 작성해주세요. 인사말과 마무리 인사를 포함하고, 수신자에 맞는 어투를 사용하세요.',
    speech: '연설문 형식으로 작성해주세요. 도입, 본문, 결론의 구조를 따르고, 청중을 고려한 표현을 사용하세요.',
    diary: '일기 형식으로 작성해주세요. 개인적인 감정과 생각을 솔직하게 표현하고, 시간 순서대로 서술하세요.',
    review: '리뷰 형식으로 작성해주세요. 객관적 평가와 주관적 의견을 균형있게 제시하세요.',
    guide: '가이드 형식으로 작성해주세요. 단계별로 명확하게 설명하고, 실용적인 정보를 제공하세요.',
    story: '이야기 형식으로 작성해주세요. 시작, 전개, 절정, 결말의 구조를 따르고, 흥미롭게 전개하세요.',
    analysis: '분석 형식으로 작성해주세요. 논리적 구조를 따르고, 근거와 결론을 명확히 제시하세요.',
    opinion: '의견 형식으로 작성해주세요. 자신의 관점을 명확히 제시하고, 근거를 함께 제시하세요.',
    description: '묘사 형식으로 작성해주세요. 구체적이고 생생한 표현을 사용하고, 감각적 묘사를 포함하세요.',
  };
  return descriptions[style] || descriptions.essay;
}

/**
 * 프롬프트 생성
 */
export function generatePrompt(
  template: WritingTemplate, 
  values: Record<string, string>,
  tone?: WritingTone,
  style?: WritingStyle
): string {
  let prompt = template.prompt;
  
  // 필드 값으로 치환
  Object.entries(values).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
  });
  
  // 어투 지시사항 추가
  const selectedTone = tone || template.defaultTone || 'formal';
  const toneInstruction = getToneDescription(selectedTone);
  
  // 글 종류 지시사항 추가
  const selectedStyle = style || template.defaultStyle;
  let styleInstruction = '';
  if (selectedStyle) {
    styleInstruction = getStyleDescription(selectedStyle);
  }
  
  // 프롬프트에 어투와 스타일 지시사항 추가
  let finalPrompt = prompt;
  
  if (styleInstruction) {
    finalPrompt += `\n\n[글 종류 요구사항]\n${styleInstruction}`;
  }
  
  finalPrompt += `\n\n[어투 요구사항]\n${toneInstruction}`;
  
  // 특정 글 종류 요청이 있으면 추가 지시
  if (values.writingType) {
    const writingType = values.writingType.toLowerCase();
    
    // 자연어 처리: "수필로 만들어줘", "수필 형식으로" 등
    if ((writingType.includes('수필') || writingType.includes('essay')) || (writingType.includes('만들어줘') && writingType.includes('수필'))) {
      finalPrompt += '\n\n[수필 형식 요구사항]\n수필 형식으로 작성해주세요. 다음 특징을 반영해주세요:\n';
      finalPrompt += '- 개인적인 경험과 깊이 있는 성찰을 포함\n';
      finalPrompt += '- 자연스럽고 유려한 문체 사용\n';
      finalPrompt += '- 주관적이지만 보편적인 공감을 이끌어내는 내용\n';
      finalPrompt += '- 시간의 흐름이나 공간의 이동을 자연스럽게 연결\n';
      finalPrompt += '- 감정과 이성을 조화롭게 표현\n';
      finalPrompt += '- 성찰적인 어투로 깊이 있는 사고 표현';
      
      // 수필 스타일로 강제 설정
      if (!selectedStyle) {
        finalPrompt = finalPrompt.replace('[글 종류 요구사항]', '[글 종류 요구사항 - 수필]');
      }
    } else if ((writingType.includes('소설') || writingType.includes('novel')) || (writingType.includes('만들어줘') && writingType.includes('소설'))) {
      finalPrompt += '\n\n[소설 형식 요구사항]\n소설 형식으로 작성해주세요. 다음 특징을 반영해주세요:\n';
      finalPrompt += '- 등장인물의 대화와 행동을 포함\n';
      finalPrompt += '- 이야기의 흐름을 자연스럽게 전개\n';
      finalPrompt += '- 배경 묘사와 분위기 연출\n';
      finalPrompt += '- 갈등과 해결의 구조';
    } else if ((writingType.includes('시') || writingType.includes('poem')) || (writingType.includes('만들어줘') && writingType.includes('시'))) {
      finalPrompt += '\n\n[시 형식 요구사항]\n시 형식으로 작성해주세요. 다음 특징을 반영해주세요:\n';
      finalPrompt += '- 운율과 리듬을 고려\n';
      finalPrompt += '- 함축적이고 상징적인 표현 사용\n';
      finalPrompt += '- 이미지와 감각적 묘사\n';
      finalPrompt += '- 행과 연의 구조';
    } else if (writingType.includes('만들어줘') || writingType.includes('작성') || writingType.includes('써줘')) {
      // 일반적인 요청이면 선택된 스타일이나 기본값 사용
      if (selectedStyle) {
        finalPrompt += `\n\n선택하신 "${selectedStyle}" 형식으로 작성해주세요.`;
      }
    }
  }
  
  return finalPrompt;
}

export default writingTemplates;

