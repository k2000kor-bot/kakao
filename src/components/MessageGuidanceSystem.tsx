import React, { useState, useEffect, useRef } from 'react';
import {
  FiSearch,
  FiBarChart2,
  FiMessageSquare,
  FiDownload,
  FiPlus,
  FiFileText,
  FiX,
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiEdit3,
  FiTrash2,
  FiUser,
  FiMessageCircle,
  FiTrendingUp,
  FiTarget,
  FiBookOpen,
  FiMic,
  FiSend,
  FiUpload,
  FiFolder,
  FiSettings,
  FiCheck
} from 'react-icons/fi';
import { useModalClose } from '../hooks/useModalClose';
import KakaoChatAnalysis from './KakaoChatAnalysis';
import MediaAnalysis from './MediaAnalysis';
import KnowledgeBasedChat from './KnowledgeBasedChat';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  type?: string;
  isTyping?: boolean;
  reactions?: { type: 'like' | 'dislike'; count: number }[];
  isEdited?: boolean;
  analysisType?: 'sentiment' | 'opinion' | 'trend' | 'detailed' | 'researcher';
}

interface Guideline {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface AnalysisResult {
  sentiment: string;
  opinion: string;
  trend: string;
  detailed: string;
  researcher: string;
  participants: string[];
  messageCount: number;
  topics: string[];
  suggestions: string[];
}

interface MessageGuidanceSystemProps {
  isOpen?: boolean;
  onClose: () => void;
}

const MessageGuidanceSystem: React.FC<MessageGuidanceSystemProps> = ({ isOpen, onClose }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showKakaoModal, setShowKakaoModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [exportFormat, setExportFormat] = useState('txt');
  const [editContent, setEditContent] = useState('');
  const [newGuideline, setNewGuideline] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: 'general'
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string, name: string, type: string }>>([]);
  const [showTools, setShowTools] = useState(false);
  const [showMessageActions, setShowMessageActions] = useState<string | null>(null);

  useEffect(() => {
    // 초기 메시지 추가
    setMessages([{
      id: '1',
      content: '안녕하세요! CORBU AI입니다. 카카오톡 대화 분석, 성향분석, 여론분석 등을 도와드릴 수 있습니다. 무엇을 도와드릴까요?',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      type: 'text'
    }]);
  }, []);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 타이핑 인디케이터
  useEffect(() => {
    if (isTyping) {
      const typingMessage: Message = {
        id: `typing_${Date.now()}`,
        content: '',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'typing',
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);
    } else {
      setMessages(prev => prev.filter(msg => !msg.isTyping));
    }
  }, [isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleString('ko-KR')
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // 분석 키워드 확인
    const analysisKeywords = ['분석', '성향', '여론', '트렌드', '상세', '연구자'];
    const hasAnalysisKeyword = analysisKeywords.some(keyword =>
      inputMessage.includes(keyword)
    );

    if (hasAnalysisKeyword) {
      await handleAnalysisRequest(inputMessage);
    } else {
      // 일반 대화형 응답 생성
      await generateConversationalResponse(inputMessage);
    }
  };

  const generateConversationalResponse = async (userInput: string) => {
    // 타이핑 표시
    const typingMessage: Message = {
      id: `typing_${Date.now()}`,
      content: '',
      sender: 'assistant',
      timestamp: new Date().toLocaleString('ko-KR'),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      // 대화형 응답 생성
      let conversationalResponse = '';

      // 인사말 및 기본 대화
      if (userInput.includes('안녕') || userInput.includes('hello') || userInput.includes('hi')) {
        conversationalResponse = `안녕하세요! CORBU AI입니다. 😊

무엇을 도와드릴까요? 

**제가 도와드릴 수 있는 것들:**
• 📊 대화 분석 (성향, 여론, 트렌드 등)
• 📁 파일 업로드 및 문서 분석
• 📋 지침 관리 및 프로젝트 설정
• 💬 자연스러운 대화형 응답

어떤 작업을 원하시나요?`;
      }
      // 도움말 및 기능 안내
      else if (userInput.includes('도움') || userInput.includes('help') || userInput.includes('기능')) {
        conversationalResponse = `도움말을 알려드리겠습니다! 🤖

**📊 분석 기능들:**
• **성향분석**: 참여자들의 성향과 특성 분석
• **여론분석**: 집단의 의사결정 패턴 분석  
• **트렌드분석**: 시간에 따른 관심사 변화 분석
• **상세분석**: 대화의 깊이와 복잡성 분석
• **연구자분석**: 전문적 관점의 종합 분석

**📁 파일 관리:**
• 카카오톡 대화 파일 업로드 및 분석
• 문서 첨부 및 관리
• 분석 결과 내보내기

**📋 지침 관리:**
• 프로젝트별 지침 추가/수정
• 우선순위 설정
• 카테고리별 분류

**💬 대화형 응답:**
• 모든 결과를 자연스러운 대화로 제공
• 추가 질문 및 상호작용 지원

어떤 기능에 대해 더 자세히 알고 싶으시나요?`;
      }
      // 파일 업로드 관련
      else if (userInput.includes('파일') || userInput.includes('upload') || userInput.includes('업로드')) {
        conversationalResponse = `파일 업로드에 대해 안내드리겠습니다! 📁

**지원하는 파일 형식:**
• 📄 텍스트 파일 (.txt) - 카카오톡 대화 내보내기 파일
• 📑 PDF 파일 (.pdf) - 문서 및 보고서
• 📝 Word 문서 (.doc, .docx) - 상세 문서
• 🖼️ 이미지 파일 (.jpg, .jpeg, .png) - 스크린샷 등

**파일 업로드 방법:**
1. 하단의 "+" 버튼을 클릭하세요
2. 원하는 파일을 선택하세요
3. 업로드된 파일은 왼쪽 사이드바에서 확인할 수 있습니다

파일을 업로드하시면 분석이나 요약 작업에 활용할 수 있어요. 어떤 파일을 업로드하고 싶으신가요?`;
      }
      // 지침 관리 관련
      else if (userInput.includes('지침') || userInput.includes('guideline') || userInput.includes('가이드')) {
        conversationalResponse = `지침 관리 기능을 소개해드리겠습니다! 📋

**지침 추가 방법:**
1. 왼쪽 사이드바의 "지침" 섹션에서 "+" 버튼 클릭
2. 제목과 내용을 입력하세요
3. 우선순위를 설정할 수 있습니다 (높음/보통/낮음)

**지침 활용:**
• 프로젝트별 특정 가이드라인 설정
• 분석 기준이나 참고사항 기록
• 팀원들과 공유할 정보 관리

지침을 추가하시면 AI가 더 정확하고 맥락에 맞는 응답을 제공할 수 있어요. 지침을 추가해보시겠어요?`;
      }
      // 내보내기 관련
      else if (userInput.includes('내보내기') || userInput.includes('export') || userInput.includes('다운로드')) {
        conversationalResponse = `내보내기 기능을 안내해드리겠습니다! 💾

**지원하는 형식:**
• 📄 텍스트 파일 (.txt) - 일반적인 텍스트 형식
• 📊 JSON 파일 (.json) - 구조화된 데이터
• 📈 CSV 파일 (.csv) - 표 형태의 데이터

**내보내기 방법:**
1. 상단 헤더의 "내보내기" 버튼 클릭
2. 원하는 형식을 선택하세요
3. 파일이 자동으로 다운로드됩니다

**내보내기 가능한 내용:**
• 대화 기록 전체
• 분석 결과 요약
• 지침 및 설정 정보

어떤 형식으로 내보내고 싶으신가요?`;
      }
      // 글쓰기 및 메시지 작성 관련
      else if (userInput.includes('글') || userInput.includes('메시지') || userInput.includes('작성') || userInput.includes('문서')) {
        conversationalResponse = `글쓰기 및 메시지 작성에 대해 안내해드리겠습니다! ✍️

**지원하는 글쓰기 유형:**
• 📝 일반 메시지 작성
• 📋 공식 문서 작성
• 💬 대화형 응답 생성
• 📊 분석 보고서 작성
• 🎯 특정 톤/스타일 맞춤 작성

**글쓰기 요청 방법:**
1. 원하는 내용을 자연스럽게 말씀해 주세요
2. 특정 톤이나 스타일이 있다면 함께 언급해 주세요
3. 예: "친근한 톤으로 안내 메시지 작성해줘"

**예시 요청:**
• "공식적인 톤으로 안내문 작성해줘"
• "친근하게 설명하는 메시지 만들어줘"
• "간단한 요약 메시지 작성해줘"

어떤 종류의 글을 작성하고 싶으신가요?`;
      }
      // 스타일 및 형식 관련
      else if (userInput.includes('스타일') || userInput.includes('형식') || userInput.includes('톤') || userInput.includes('tone')) {
        conversationalResponse = `글쓰기 스타일과 형식에 대해 안내해드리겠습니다! 🎨

**지원하는 스타일들:**

**📝 톤별 스타일:**
• **공식적**: 비즈니스 문서, 공식 안내문
• **친근한**: 일상 대화, 친구와의 대화
• **전문적**: 기술 문서, 분석 보고서
• **설명적**: 교육 자료, 안내서

**📊 형식별 스타일:**
• **요약형**: 핵심만 간단히 정리
• **상세형**: 자세한 설명과 예시 포함
• **목록형**: 체계적인 항목별 정리
• **대화형**: 자연스러운 질문-답변 형식

**🎯 특수 스타일:**
• **카드뉴스**: 시각적 요소가 포함된 형식
• **댓글형**: 소셜미디어 스타일
• **보고서형**: 구조화된 분석 보고서

어떤 스타일로 작성하고 싶으신가요?`;
      }
      // 변경 요청 및 수정 관련
      else if (userInput.includes('변경') || userInput.includes('수정') || userInput.includes('바꿔') || userInput.includes('다른')) {
        conversationalResponse = `변경 요청을 받았습니다! 🔄

**변경 가능한 항목들:**
• 📝 글쓰기 스타일 및 톤
• 📊 분석 방법 및 접근 방식
• 📋 지침 내용 및 우선순위
• 📁 파일 관리 방식
• 💬 응답 형식 및 길이

**변경 요청 방법:**
1. 구체적으로 어떤 부분을 변경하고 싶은지 말씀해 주세요
2. 원하는 새로운 스타일이나 형식을 설명해 주세요
3. 예: "더 간단하게 요약해줘", "공식적인 톤으로 바꿔줘"

어떤 부분을 변경하고 싶으신가요?`;
      }
      // 상황별 맞춤 응답
      else if (userInput.includes('상황') || userInput.includes('맞춤') || userInput.includes('컨텍스트')) {
        conversationalResponse = `상황별 맞춤 응답에 대해 안내해드리겠습니다! 🎯

**상황별 맞춤 기능:**

**🏢 비즈니스 상황:**
• 공식 문서 작성
• 회의록 요약
• 프로젝트 보고서

**👥 팀 협업 상황:**
• 팀원 간 소통 메시지
• 프로젝트 진행 상황 공유
• 의사결정 지원

**📚 학습/교육 상황:**
• 복잡한 개념 설명
• 단계별 학습 가이드
• 질문-답변 형식

**💼 고객 서비스 상황:**
• 친근한 안내 메시지
• 문제 해결 가이드
• 고객 만족도 향상

어떤 상황에 맞춤 응답이 필요하신가요?`;
      }
      // 질문-답변 형식 관련
      else if (userInput.includes('질문') || userInput.includes('답변') || userInput.includes('Q&A')) {
        conversationalResponse = `질문-답변 형식에 대해 안내해드리겠습니다! ❓

**질문-답변 형식의 장점:**
• 🎯 명확한 정보 전달
• 📖 이해하기 쉬운 구조
• 🔄 자연스러운 대화 흐름
• 💡 추가 질문 유도

**지원하는 Q&A 형식:**
• **일반 Q&A**: 기본적인 질문-답변
• **단계별 Q&A**: 순차적인 설명
• **비교 Q&A**: 여러 옵션 비교
• **상황별 Q&A**: 특정 상황에 맞춘 응답

**Q&A 요청 방법:**
• "Q&A 형식으로 설명해줘"
• "질문-답변으로 정리해줘"
• "단계별로 질문-답변 형식으로"

어떤 주제를 Q&A 형식으로 정리하고 싶으신가요?`;
      }
      // 실용적 사용법 관련
      else if (userInput.includes('실용') || userInput.includes('사용법') || userInput.includes('활용') || userInput.includes('실제')) {
        conversationalResponse = `실용적인 사용법을 안내해드리겠습니다! 🛠️

**실제 활용 시나리오:**

**📱 일상 업무:**
• 이메일 작성 및 응답
• 회의록 정리 및 요약
• 보고서 작성 및 편집

**📊 데이터 분석:**
• 대화 데이터 분석
• 트렌드 파악 및 예측
• 인사이트 도출

**💼 프로젝트 관리:**
• 작업 계획 수립
• 진행 상황 추적
• 결과물 정리

**👥 팀 협업:**
• 팀원 간 소통 지원
• 의사결정 과정 지원
• 지식 공유 및 전달

어떤 실용적 활용이 필요하신가요?`;
      }
      // 기본 응답
      else {
        conversationalResponse = `요청하신 내용을 확인했습니다! 🤔

**입력하신 내용:**
"${userInput}"

이 요청에 대해 적절한 응답을 제공하겠습니다. 

**제안사항:**
• 📊 더 구체적인 분석이 필요하시면 "분석" 키워드를 포함해서 말씀해 주세요
• 📁 파일 업로드가 필요하시면 하단의 "+" 버튼을 이용하세요
• ✍️ 특정 형식이나 톤으로 응답을 원하시면 말씀해 주세요
• 🎯 상황별 맞춤 응답이 필요하시면 "상황" 키워드를 포함해서 말씀해 주세요

추가로 궁금한 점이나 더 구체적인 요청사항이 있으시면 언제든 말씀해 주세요! 😊`;
      }

      // 타이핑 메시지 제거하고 실제 응답 추가
      setMessages(prev => prev.filter(msg => !msg.isTyping));

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: conversationalResponse,
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('응답 생성 오류:', error);

      // 타이핑 메시지 제거
      setMessages(prev => prev.filter(msg => !msg.isTyping));

      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 시도해 주세요. 😅',
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleAnalysisRequest = async (userInput: string) => {
    // 분석 옵션 제공
    const analysisMessage: Message = {
      id: `analysis_${Date.now()}`,
      content: `분석을 원하시는군요! 어떤 종류의 분석을 원하시나요?

📊 **분석 옵션:**
• **성향분석**: 참여자들의 성향과 특성 분석
• **여론분석**: 대화에서 나타나는 여론과 의견 분석  
• **트렌드분석**: 시간에 따른 대화 패턴과 트렌드 분석
• **상세분석**: 세부적인 내용과 맥락 분석
• **연구자분석**: 연구자 관점에서의 전문적 분석

어떤 분석을 원하시는지 말씀해 주세요!`,
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      type: 'analysis'
    };

    setMessages(prev => [...prev.filter(msg => !msg.isTyping), analysisMessage]);
  };

  const generateDetailedAnalysis = async (analysisType: string) => {
    try {
      const response = await fetch('http://localhost:8004/api/v1/generate-detailed-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_type: analysisType,
          conversation_context: messages.map(m => m.content).join('\n')
        })
      });

      const data = await response.json();

      if (data.success) {
        // 대화형식으로 분석 결과 생성
        let conversationalResponse = '';

        switch (analysisType) {
          case 'sentiment':
            conversationalResponse = `안녕하세요! 성향분석 결과를 말씀드리겠습니다. 

${data.analysis}

이 분석을 통해 참여자들의 개인적 특성과 그룹 내 상호작용 패턴을 파악할 수 있습니다. 추가로 궁금한 점이 있으시면 언제든 말씀해 주세요!`;
            break;
          case 'opinion':
            conversationalResponse = `여론분석 결과를 알려드리겠습니다.

${data.analysis}

이 분석을 통해 집단의 의사결정 과정과 의견 형성 패턴을 이해할 수 있습니다. 더 자세한 분석이 필요하시면 말씀해 주세요!`;
            break;
          case 'trend':
            conversationalResponse = `트렌드분석 결과를 공유드립니다.

${data.analysis}

이를 통해 시간에 따른 관심사 변화와 이슈의 흐름을 파악할 수 있습니다. 특정 기간에 대한 더 자세한 분석이 필요하시면 언제든 말씀해 주세요!`;
            break;
          case 'detailed':
            conversationalResponse = `상세분석 결과를 말씀드리겠습니다.

${data.analysis}

이 분석을 통해 대화의 깊이와 복잡성을 종합적으로 이해할 수 있습니다. 특정 부분에 대해 더 자세히 알고 싶으시면 말씀해 주세요!`;
            break;
          case 'researcher':
            conversationalResponse = `연구자 관점에서의 분석 결과를 공유드립니다.

${data.analysis}

이 분석은 사회학적, 심리학적, 커뮤니케이션 관점을 종합하여 전문적인 인사이트를 제공합니다. 추가 연구 방향이나 궁금한 점이 있으시면 언제든 말씀해 주세요!`;
            break;
          default:
            conversationalResponse = `분석 결과를 알려드리겠습니다.

${data.analysis}

이 분석에 대해 더 자세히 알고 싶으시거나 추가 질문이 있으시면 언제든 말씀해 주세요!`;
        }

        const newMessage: Message = {
          id: Date.now().toString(),
          content: conversationalResponse,
          sender: 'assistant',
          timestamp: new Date().toLocaleString('ko-KR'),
          analysisType: analysisType as 'sentiment' | 'opinion' | 'trend' | 'detailed' | 'researcher'
        };

        setMessages(prev => [...prev, newMessage]);
        setShowAnalysisModal(false);
      } else {
        throw new Error('분석 실패');
      }
    } catch (error) {
      console.error('상세 분석 오류:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '죄송합니다. 분석 중 오류가 발생했습니다. 다시 시도해 주세요.',
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleAddGuideline = () => {
    if (!newGuideline.title.trim() || !newGuideline.content.trim()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '지침 제목과 내용을 모두 입력해 주세요. 빈 필드가 있으면 지침을 추가할 수 없어요.',
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const newGuidelineItem: Guideline = {
      id: Date.now().toString(),
      title: newGuideline.title,
      content: newGuideline.content,
      category: 'general',
      priority: newGuideline.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    setGuidelines(prev => [...prev, newGuidelineItem]);
    setNewGuideline({ title: '', content: '', priority: 'medium', category: 'general' });
    setShowGuidelineModal(false);

    // 지침 추가 성공 메시지
    const successMessage: Message = {
      id: Date.now().toString(),
      content: `지침이 성공적으로 추가되었습니다!

**추가된 지침:**
• 제목: ${newGuidelineItem.title}
• 내용: ${newGuidelineItem.content}
• 우선순위: ${newGuidelineItem.priority === 'high' ? '높음' : newGuidelineItem.priority === 'medium' ? '보통' : '낮음'}

이제 이 지침을 바탕으로 더 정확하고 맥락에 맞는 응답을 제공할 수 있어요. 

**지침 활용:**
• 프로젝트별 특정 가이드라인으로 활용
• 분석 기준이나 참고사항으로 활용
• 팀원들과 공유할 정보로 활용

추가로 다른 지침을 설정하거나 수정하고 싶으시면 언제든 말씀해 주세요!`,
      sender: 'assistant',
      timestamp: new Date().toLocaleString('ko-KR')
    };

    setMessages(prev => [...prev, successMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setAttachedFiles(prev => [...prev, ...fileList.map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.includes('image') ? 'image' : 'document'
      }))]);

      // 파일 업로드 성공 메시지
      const uploadMessage: Message = {
        id: Date.now().toString(),
        content: `파일 업로드가 완료되었습니다!

**업로드된 파일:**
${fileList.map(file => `• ${file.name} (${(file.size / 1024).toFixed(1)}KB)`).join('\n')}

이제 이 파일들을 활용해서 분석이나 요약 작업을 할 수 있어요. 

**다음 단계:**
• 파일 내용을 분석하려면 "분석" 키워드를 포함해서 말씀해 주세요
• 특정 파일에 대해 질문하시면 더 정확한 답변을 드릴 수 있어요
• 파일을 제거하려면 파일 옆의 X 버튼을 클릭하세요

어떤 작업을 원하시나요?`,
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };

      setMessages(prev => [...prev, uploadMessage]);
    }
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExport = async () => {
    try {
      const exportData = {
        messages: messages,
        guidelines: guidelines,
        attachedFiles: attachedFiles,
        exportDate: new Date().toISOString()
      };

      let content = '';
      let filename = '';

      switch (exportFormat) {
        case 'txt':
          content = `CORBU AI 대화 내보내기\n\n`;
          content += `내보내기 날짜: ${new Date().toLocaleString('ko-KR')}\n\n`;
          content += `=== 대화 기록 ===\n`;
          messages.forEach(msg => {
            content += `[${msg.timestamp}] ${msg.sender === 'user' ? '사용자' : 'AI'}: ${msg.content}\n\n`;
          });
          content += `\n=== 지침 ===\n`;
          guidelines.forEach(guideline => {
            content += `• ${guideline.title}: ${guideline.content}\n`;
          });
          filename = `corbu_ai_export_${new Date().toISOString().split('T')[0]}.txt`;
          break;
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          filename = `corbu_ai_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'csv':
          content = '타임스탬프,발신자,내용\n';
          messages.forEach(msg => {
            content += `"${msg.timestamp}","${msg.sender === 'user' ? '사용자' : 'AI'}","${msg.content.replace(/"/g, '""')}"\n`;
          });
          filename = `corbu_ai_export_${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportModal(false);

      // 내보내기 성공 메시지
      const successMessage: Message = {
        id: Date.now().toString(),
        content: `내보내기가 성공적으로 완료되었습니다!

**내보내기 정보:**
• 파일명: ${filename}
• 형식: ${exportFormat.toUpperCase()}
• 포함 내용: 대화 기록, 지침, 첨부 파일 정보

파일이 자동으로 다운로드되었어요. 

**다운로드된 파일 활용:**
• 백업 및 보관용으로 활용
• 다른 시스템으로 데이터 이전
• 분석 및 리뷰용으로 활용

추가로 다른 형식으로 내보내거나 다른 작업이 필요하시면 언제든 말씀해 주세요!`,
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };

      setMessages(prev => [...prev, successMessage]);

    } catch (error) {
      console.error('내보내기 오류:', error);

      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '죄송합니다. 내보내기 중 오류가 발생했습니다. 다시 시도해 주세요.',
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKakaoAnalysisComplete = (result: any) => {
    if (result.success) {
      let conversationalResponse = '';

      if (result.participants && result.message_count && result.topics) {
        conversationalResponse = `카카오톡 대화 분석이 완료되었습니다! 

📊 **분석 결과 요약**
• 참여자: ${result.participants.join(', ')}
• 총 메시지 수: ${result.message_count}개
• 주요 주제: ${result.topics.join(', ')}

💬 **대화 분석**
${result.response}

이 분석을 바탕으로 더 구체적인 질문이나 추가 분석이 필요하시면 언제든 말씀해 주세요!`;
      } else {
        conversationalResponse = `카카오톡 대화 분석이 완료되었습니다!

${result.response}

추가로 궁금한 점이나 더 자세한 분석이 필요하시면 말씀해 주세요!`;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content: conversationalResponse,
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };

      setMessages(prev => [...prev, newMessage]);
      setShowKakaoModal(false);
    } else {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '죄송합니다. 카카오톡 분석 중 오류가 발생했습니다. 파일을 다시 확인해 주세요.',
        sender: 'assistant',
        timestamp: new Date().toLocaleString('ko-KR')
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 메시지 액션 함수들
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // 토스트 메시지 표시
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
    toast.textContent = '메시지가 복사되었습니다';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  };

  const editMessage = (messageId: string, content: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      setEditingMessage(message);
      setEditContent(content);
    }
  };

  const saveEdit = () => {
    if (editingMessage && editContent.trim()) {
      setMessages(prev => prev.map(msg =>
        msg.id === editingMessage.id
          ? { ...msg, content: editContent, isEdited: true }
          : msg
      ));
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    setShowMessageActions(null);
  };

  const reactToMessage = (messageId: string, reactionType: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.type === reactionType);

        if (existingReaction) {
          existingReaction.count += 1;
        } else {
          reactions.push({ type: reactionType, count: 1 });
        }

        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const TypingIndicator = () => (
    <div className="flex justify-start">
      <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm">AI가 응답을 생성하고 있습니다...</span>
        </div>
      </div>
    </div>
  );

  // 모달 닫기 훅들
  const analysisModal = useModalClose({
    isOpen: showAnalysisModal,
    onClose: () => setShowAnalysisModal(false)
  });

  const editModal = useModalClose({
    isOpen: !!editingMessage,
    onClose: () => setEditingMessage(null)
  });

  const kakaoModal = useModalClose({
    isOpen: showKakaoModal,
    onClose: () => setShowKakaoModal(false)
  });

  const fileModal = useModalClose({
    isOpen: showFileModal,
    onClose: () => setShowFileModal(false)
  });

  const guidelineModal = useModalClose({
    isOpen: showGuidelineModal,
    onClose: () => setShowGuidelineModal(false)
  });

  const exportModal = useModalClose({
    isOpen: showExportModal,
    onClose: () => setShowExportModal(false)
  });

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type.includes('image') ? 'image' : 'document'
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        {/* Top Section */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
            <span className="font-semibold">CORBU.AI</span>
          </div>
          <div className="flex space-x-2">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 p-4 space-y-4">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>새 채팅</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>채팅 검색</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>라이브러리</span>
          </div>

          <div className="space-y-2 text-sm">
            <div>Codex</div>
            <div>Sora</div>
            <div>GPT</div>
            <div>챗</div>
          </div>

          {/* Project Section */}
          <div className="pt-4">
            <div className="flex items-center space-x-3 text-sm mb-4">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>새 프로젝트</span>
            </div>
            <div className="flex items-center space-x-3 text-sm mb-4">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>바이럴</span>
            </div>

            {/* Project List */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>채팅방 논의 요약</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>행복한소유 개포우성7차 요약</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>삼성 홍보 반박</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>70대 조합원 반박글</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>DA 설계 의견 요청</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>모두 보기</span>
              </div>
            </div>

            {/* Additional Sections */}
            <div className="pt-4 space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>개포우성_실명방</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>부동산뉴스</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>웨딩다이어리</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>바이럴메뉴얼</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>더 보기</span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-4">
            <div className="text-sm font-medium mb-2">채팅</div>
            <div className="space-y-2 text-sm">
              <div>SM-T530 루팅 방법</div>
              <div>상가 보상 비율 분석</div>
              <div>지하철 직결 아파트</div>
              <div>원격주차보조 사용법</div>
              <div>금리 차이 및 조건 비교</div>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            <span className="text-sm">KIM HOBUM</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">CORBU.AI</span>
              <div className="flex space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded text-sm flex items-center space-x-2">
              <div className="w-4 h-4 bg-white rounded"></div>
              <span>공유하기</span>
            </button>
          </div>
        </div>
        {/* Document Display Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Ready Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">준비되면 얘기해 주세요.</h1>
            </div>
          </div>
        </div>

        {/* Bottom Input Bar */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className={`bg-gray-50 rounded-lg border border-gray-300 p-4 transition-all duration-200 ${isInputFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}>
              {/* Input Field */}
              <div className="flex items-start space-x-3">
                {/* Left Tools */}
                <div className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    title="파일 첨부"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  </button>
                  <button
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                    title="도구 메뉴"
                  >
                    <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                    <span className="text-sm">도구</span>
                  </button>
                </div>

                {/* Main Input */}
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="무엇이든 물어보세요"
                    className={`w-full bg-transparent border-none outline-none resize-none text-gray-900 transition-all duration-200 ${inputMessage.trim() === ''
                      ? 'placeholder-gray-400'
                      : 'placeholder-gray-500'
                      } focus:placeholder-gray-600`}
                    rows={3}
                    title="메시지 입력"
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                  />
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                    title="음성 입력"
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  </button>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="flex space-x-0.5">
                      <div className="w-0.5 h-2 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-4 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-5 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-4 bg-gray-400 rounded-sm"></div>
                      <div className="w-0.5 h-2 bg-gray-400 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
          title="파일 업로드"
          aria-label="파일 업로드"
        />
      </div>
    </div>
  );
};

export default MessageGuidanceSystem; 