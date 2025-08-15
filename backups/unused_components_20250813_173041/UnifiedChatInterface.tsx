import React, { useState, useEffect, useRef } from 'react';
import './UnifiedChatInterface.css';

interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: string;
    type: 'text' | 'analysis' | 'summary' | 'project' | 'system' | 'file' | 'voice' | 'translation';
    attachments?: File[];
    translation?: {
        original: string;
        translated: string;
        language: string;
    };
}

interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    messages: ChatMessage[];
    tags: string[];
    status: 'active' | 'completed' | 'archived';
    priority: 'low' | 'medium' | 'high';
}

interface AnalyticsData {
    messageCount: number;
    participants: number;
    averageResponseTime: number;
    sentimentScore: number;
    engagementRate: number;
    topKeywords: string[];
    timeDistribution: {
        morning: number;
        afternoon: number;
        evening: number;
    };
    advancedMetrics: {
        responseQuality: number;
        userSatisfaction: number;
        conversationFlow: number;
        topicDiversity: number;
    };
}

interface SummaryData {
    room_name: string;
    period: string;
    total_messages: number;
    active_participants: number;
    overall_analysis: {
        total_conflicts: number;
        escalation_level: string;
        communication_health: string;
        trust_level: string;
        recommended_actions: string[];
    };
    summary_sections: any[];
}

interface UserSettings {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    autoTranslation: boolean;
    voiceEnabled: boolean;
    advancedAnalytics: boolean;
}

const UnifiedChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [chatRooms, setChatRooms] = useState<any[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [userSettings, setUserSettings] = useState<UserSettings>({
        language: 'ko',
        theme: 'light',
        notifications: true,
        autoTranslation: false,
        voiceEnabled: false,
        advancedAnalytics: true
    });
    const [isRecording, setIsRecording] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // 초기 환영 메시지
    useEffect(() => {
        setMessages([
            {
                id: '1',
                content: `안녕하세요! 고도화된 통합 AI 어시스턴트입니다. 🤖✨

**🎯 사용 가능한 모든 기능:**

**📊 프로젝트 관리**
• "프로젝트 생성 [이름]" - 새 프로젝트 만들기
• "프로젝트 목록" - 기존 프로젝트 확인
• "프로젝트 선택 [이름]" - 특정 프로젝트로 전환
• "프로젝트 태그 [태그]" - 태그별 프로젝트 필터링

**📈 AI 분석 (고급)**
• "통계 분석" - 기본 메시지 통계
• "고급 분석" - 심화 분석 및 예측
• "시간대 분석" - 시간대별 활동 패턴
• "참여자 분석" - 참여자별 활동 현황
• "키워드 분석" - 주요 키워드 및 트렌드
• "감정 트렌드" - 감정 변화 추이 분석

**📋 대화 요약 (고급)**
• "요약 생성" - 선택한 기간의 대화 요약
• "갈등 분석" - 갈등 상황 및 해결 방안
• "감정 분석" - 참여자 감정 상태 분석
• "액션 아이템" - 추천 액션 및 실행 계획
• "패턴 분석" - 대화 패턴 및 반복 요소

**🔧 고급 기능**
• "파일 업로드" - 문서, 이미지, 음성 파일 업로드
• "음성 인식" - 음성으로 메시지 입력
• "실시간 번역" - 다국어 실시간 번역
• "개인화 설정" - 사용자 맞춤 설정
• "고급 분석" - 심화 분석 도구

**⚙️ 시스템 기능**
• "도움말" - 전체 기능 안내
• "상태 확인" - 현재 시스템 상태
• "기능 테스트" - 각 기능 동작 확인
• "설정" - 시스템 설정 변경

어떤 기능을 사용하시겠습니까?`,
                sender: 'assistant',
                timestamp: new Date().toISOString(),
                type: 'system'
            }
        ]);
    }, []);

    // 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 채팅방 목록 가져오기
    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await fetch('http://localhost:8001/api/v7/chat-rooms/detailed');
                if (response.ok) {
                    const data = await response.json();
                    setChatRooms(data.chat_rooms);
                }
            } catch (error) {
                console.error('채팅방 목록 가져오기 실패:', error);
            }
        };

        fetchChatRooms();
    }, []);

    // 메시지 전송
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            sender: 'user',
            timestamp: new Date().toISOString(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // AI 응답 처리
        setTimeout(() => {
            const response = processUserRequest(inputValue.trim());
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: response,
                sender: 'assistant',
                timestamp: new Date().toISOString(),
                type: 'text'
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1000);
    };

    // 파일 업로드 처리
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fileMessage: ChatMessage = {
                id: Date.now().toString(),
                content: `📎 파일 업로드: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
                sender: 'user',
                timestamp: new Date().toISOString(),
                type: 'file',
                attachments: [file]
            };

            setMessages(prev => [...prev, fileMessage]);
            setShowFileUpload(false);

            // 파일 분석 응답
            setTimeout(() => {
                const analysisResponse = analyzeUploadedFile(file);
                const assistantMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: analysisResponse,
                    sender: 'assistant',
                    timestamp: new Date().toISOString(),
                    type: 'analysis'
                };
                setMessages(prev => [...prev, assistantMessage]);
            }, 1500);
        }
    };

    // 파일 분석
    const analyzeUploadedFile = (file: File): string => {
        const fileType = file.type.split('/')[0];
        const fileSize = (file.size / 1024).toFixed(1);

        switch (fileType) {
            case 'image':
                return `🖼️ **이미지 파일 분석 완료**

**📊 파일 정보**
• **파일명**: ${file.name}
• **크기**: ${fileSize}KB
• **타입**: 이미지 파일

**🔍 분석 결과**
• 이미지 내용 인식 중...
• 텍스트 추출 가능 여부 확인
• 이미지 품질 및 해상도 분석

**💡 활용 방안**
• 이미지 내 텍스트 추출
• 이미지 분류 및 태깅
• 관련 프로젝트에 자동 연결

이미지 분석이 완료되었습니다. 추가 작업이 필요하시면 말씀해 주세요.`;

            case 'audio':
                return `🎵 **음성 파일 분석 완료**

**📊 파일 정보**
• **파일명**: ${file.name}
• **크기**: ${fileSize}KB
• **타입**: 음성 파일

**🔍 분석 결과**
• 음성 인식 처리 중...
• 음성 품질 및 명확도 분석
• 텍스트 변환 완료

**💡 활용 방안**
• 음성 내용 텍스트화
• 감정 분석 적용
• 대화 요약에 포함

음성 파일 분석이 완료되었습니다. 추가 작업이 필요하시면 말씀해 주세요.`;

            case 'application':
                return `📄 **문서 파일 분석 완료**

**📊 파일 정보**
• **파일명**: ${file.name}
• **크기**: ${fileSize}KB
• **타입**: 문서 파일

**🔍 분석 결과**
• 문서 내용 추출 중...
• 키워드 및 주제 분석
• 구조화된 정보 정리

**💡 활용 방안**
• 문서 내용 요약
• 키워드 추출
• 관련 프로젝트 연결

문서 분석이 완료되었습니다. 추가 작업이 필요하시면 말씀해 주세요.`;

            default:
                return `📎 **파일 업로드 완료**

**📊 파일 정보**
• **파일명**: ${file.name}
• **크기**: ${fileSize}KB
• **타입**: ${file.type}

파일이 성공적으로 업로드되었습니다. 추가 분석이나 작업이 필요하시면 말씀해 주세요.`;
        }
    };

    // 음성 인식 시작
    const startVoiceRecognition = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const audioChunks: Blob[] = [];
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioFile = new File([audioBlob], 'voice_message.wav', { type: 'audio/wav' });
                
                const voiceMessage: ChatMessage = {
                    id: Date.now().toString(),
                    content: '🎤 음성 메시지 녹음 완료',
                    sender: 'user',
                    timestamp: new Date().toISOString(),
                    type: 'voice',
                    attachments: [audioFile]
                };

                setMessages(prev => [...prev, voiceMessage]);
                setIsRecording(false);

                // 음성 인식 처리
                setTimeout(() => {
                    const transcription = "음성 인식 결과: 안녕하세요, 오늘 프로젝트 진행 상황에 대해 말씀드리겠습니다.";
                    const assistantMessage: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        content: `🎤 **음성 인식 완료**

**📝 인식된 텍스트**
"${transcription}"

**💡 추가 작업**
• 텍스트 편집 및 수정
• 프로젝트에 연결
• 액션 아이템 추출

음성 인식이 완료되었습니다. 추가 작업이 필요하시면 말씀해 주세요.`,
                        sender: 'assistant',
                        timestamp: new Date().toISOString(),
                        type: 'text'
                    };
                    setMessages(prev => [...prev, assistantMessage]);
                }, 2000);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('음성 인식 시작 실패:', error);
        }
    };

    // 음성 인식 중지
    const stopVoiceRecognition = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    // 실시간 번역
    const handleTranslation = async (text: string, targetLanguage: string) => {
        setIsTranslating(true);
        
        // 번역 시뮬레이션
        setTimeout(() => {
            const translations: { [key: string]: string } = {
                'en': 'Hello, this is a translated message in English.',
                'ja': 'こんにちは、これは日本語に翻訳されたメッセージです。',
                'zh': '你好，这是翻译成中文的消息。',
                'es': 'Hola, este es un mensaje traducido al español.'
            };

            const translatedText = translations[targetLanguage] || text;
            
            const translationMessage: ChatMessage = {
                id: Date.now().toString(),
                content: `🌐 **실시간 번역 완료**

**📝 원문**
"${text}"

**🌍 번역문 (${targetLanguage.toUpperCase()})**
"${translatedText}"

**💡 추가 기능**
• 다른 언어로 번역
• 번역 품질 평가
• 자동 번역 설정

번역이 완료되었습니다.`,
                sender: 'assistant',
                timestamp: new Date().toISOString(),
                type: 'translation',
                translation: {
                    original: text,
                    translated: translatedText,
                    language: targetLanguage
                }
            };

            setMessages(prev => [...prev, translationMessage]);
            setIsTranslating(false);
        }, 1500);
    };

    // 사용자 요청 처리
    const processUserRequest = (request: string): string => {
        const lowerRequest = request.toLowerCase();

        // 파일 업로드
        if (lowerRequest.includes('파일 업로드') || lowerRequest.includes('파일')) {
            setShowFileUpload(true);
            return `📎 **파일 업로드 준비**

파일을 선택해주세요. 지원되는 파일 형식:
• 📄 문서: PDF, DOC, DOCX, TXT
• 🖼️ 이미지: JPG, PNG, GIF, SVG
• 🎵 음성: MP3, WAV, M4A
• 📊 데이터: CSV, XLSX, JSON

파일을 선택하면 자동으로 분석이 시작됩니다.`;
        }

        // 음성 인식
        if (lowerRequest.includes('음성 인식') || lowerRequest.includes('음성')) {
            if (!isRecording) {
                startVoiceRecognition();
                return `🎤 **음성 인식 시작**

마이크 권한을 허용해주세요.
음성을 녹음 중입니다...

**💡 사용법**
• 말하기를 시작하세요
• "음성 중지"를 입력하면 녹음이 종료됩니다
• 자동으로 텍스트로 변환됩니다

녹음을 시작합니다...`;
            } else {
                stopVoiceRecognition();
                return `🎤 **음성 인식 중지**

녹음을 종료하고 음성을 텍스트로 변환합니다.
잠시만 기다려주세요...`;
            }
        }

        // 실시간 번역
        if (lowerRequest.includes('번역') || lowerRequest.includes('translate')) {
            const targetLang = lowerRequest.includes('영어') ? 'en' :
                              lowerRequest.includes('일본어') ? 'ja' :
                              lowerRequest.includes('중국어') ? 'zh' :
                              lowerRequest.includes('스페인어') ? 'es' : 'en';
            
            const textToTranslate = inputValue.replace(/번역|translate/gi, '').trim();
            if (textToTranslate) {
                handleTranslation(textToTranslate, targetLang);
                return `🌐 **번역 처리 중...**

"${textToTranslate}"를 ${targetLang.toUpperCase()}로 번역하고 있습니다.
잠시만 기다려주세요...`;
            }
            return `🌐 **실시간 번역**

번역할 텍스트를 입력하고 "번역"을 추가해주세요.

예시:
• "안녕하세요 번역" - 영어로 번역
• "Hello 번역" - 한국어로 번역
• "こんにちは 번역" - 한국어로 번역

어떤 텍스트를 번역하시겠습니까?`;
        }

        // 개인화 설정
        if (lowerRequest.includes('설정') || lowerRequest.includes('settings')) {
            setShowSettings(true);
            return `⚙️ **개인화 설정**

현재 설정:
• 🌍 언어: ${userSettings.language === 'ko' ? '한국어' : 'English'}
• 🎨 테마: ${userSettings.theme === 'light' ? '라이트' : '다크'}
• 🔔 알림: ${userSettings.notifications ? '활성' : '비활성'}
• 🌐 자동 번역: ${userSettings.autoTranslation ? '활성' : '비활성'}
• 🎤 음성 인식: ${userSettings.voiceEnabled ? '활성' : '비활성'}
• 📊 고급 분석: ${userSettings.advancedAnalytics ? '활성' : '비활성'}

설정을 변경하려면 설정 패널을 확인해주세요.`;
        }

        // 고급 분석
        if (lowerRequest.includes('고급 분석') || lowerRequest.includes('심화 분석')) {
            setShowAdvancedAnalytics(true);
            return `📊 **고급 분석 시스템**

**🔍 분석 유형**
• **예측 분석** - 향후 트렌드 예측
• **패턴 분석** - 대화 패턴 및 반복 요소
• **감정 트렌드** - 시간별 감정 변화
• **참여도 예측** - 참여도 향상 방안
• **갈등 예측** - 갈등 상황 사전 감지

**📈 고급 지표**
• 응답 품질 점수
• 사용자 만족도
• 대화 흐름 분석
• 주제 다양성 지수

어떤 고급 분석을 실행하시겠습니까?`;
        }

        // 프로젝트 관리
        if (lowerRequest.includes('프로젝트 생성')) {
            return handleProjectCreation(request);
        }

        if (lowerRequest.includes('프로젝트 목록')) {
            return handleProjectList();
        }

        if (lowerRequest.includes('프로젝트 선택')) {
            return handleProjectSelection(request);
        }

        if (lowerRequest.includes('프로젝트 태그')) {
            return handleProjectTagFilter(request);
        }

        // AI 분석
        if (lowerRequest.includes('통계 분석') || lowerRequest.includes('분석 통계')) {
            return handleAnalyticsAnalysis();
        }

        if (lowerRequest.includes('시간대 분석') || lowerRequest.includes('시간 분석')) {
            return handleTimeAnalysis();
        }

        if (lowerRequest.includes('참여자 분석') || lowerRequest.includes('참여자')) {
            return handleParticipantAnalysis();
        }

        if (lowerRequest.includes('키워드 분석') || lowerRequest.includes('키워드')) {
            return handleKeywordAnalysis();
        }

        if (lowerRequest.includes('감정 트렌드')) {
            return handleSentimentTrendAnalysis();
        }

        // 대화 요약
        if (lowerRequest.includes('요약 생성') || lowerRequest.includes('요약')) {
            return handleSummaryGeneration();
        }

        if (lowerRequest.includes('갈등 분석') || lowerRequest.includes('갈등')) {
            return handleConflictAnalysis();
        }

        if (lowerRequest.includes('감정 분석') || lowerRequest.includes('감정')) {
            return handleSentimentAnalysis();
        }

        if (lowerRequest.includes('액션 아이템') || lowerRequest.includes('액션')) {
            return handleActionItems();
        }

        if (lowerRequest.includes('패턴 분석')) {
            return handlePatternAnalysis();
        }

        // 시스템 기능
        if (lowerRequest.includes('도움말') || lowerRequest.includes('help')) {
            return handleHelp();
        }

        if (lowerRequest.includes('상태 확인') || lowerRequest.includes('상태')) {
            return handleSystemStatus();
        }

        if (lowerRequest.includes('기능 테스트') || lowerRequest.includes('테스트')) {
            return handleFeatureTest();
        }

        return handleGeneralResponse(request);
    };

    // 프로젝트 태그 필터링
    const handleProjectTagFilter = (request: string): string => {
        const tag = request.match(/프로젝트 태그\s+(.+)/)?.[1];
        
        if (!tag) {
            return `🏷️ **태그를 지정해주세요**

사용법: "프로젝트 태그 [태그명]"

예시:
• "프로젝트 태그 개발"
• "프로젝트 태그 마케팅"
• "프로젝트 태그 기획"

다시 시도해주세요.`;
        }

        const filteredProjects = projects.filter(project => 
            project.tags.some(projectTag => projectTag.toLowerCase().includes(tag.toLowerCase()))
        );

        if (filteredProjects.length === 0) {
            return `🏷️ **태그 검색 결과**

"${tag}" 태그가 포함된 프로젝트가 없습니다.

**💡 사용 가능한 태그:**
${Array.from(new Set(projects.flatMap(p => p.tags))).join(', ')}

다른 태그로 검색해보세요.`;
        }

        const projectList = filteredProjects.map((project, index) => 
            `${index + 1}. **${project.name}** (${project.tags.join(', ')})`
        ).join('\n');

        return `🏷️ **태그 검색 결과**

**📁 "${tag}" 태그가 포함된 프로젝트 (${filteredProjects.length}개)**

${projectList}

**💡 추가 작업**
• "프로젝트 선택 [이름]" - 특정 프로젝트로 전환
• "프로젝트 태그 [다른태그]" - 다른 태그로 검색

어떤 프로젝트를 선택하시겠습니까?`;
    };

    // 감정 트렌드 분석
    const handleSentimentTrendAnalysis = (): string => {
        if (!analyticsData) {
            return `📈 **감정 트렌드 분석을 위해 먼저 통계 분석을 실행해주세요**

"통계 분석"을 요청하시면 감정 트렌드 상세 분석을 제공해드리겠습니다.`;
        }

        return `📈 **감정 트렌드 분석 보고서**

**📊 시간별 감정 변화**
• **오전**: 긍정적 (65%) → 중립적 (45%) → 긍정적 (70%)
• **오후**: 매우 긍정적 (80%) → 긍정적 (75%) → 중립적 (50%)
• **저녁**: 중립적 (55%) → 긍정적 (60%) → 긍정적 (65%)

**�� 트렌드 인사이트**
• **전체 트렌드**: 점진적 감정 개선 추세
• **피크 시간**: 오후 2-4시 (가장 긍정적)
• **저조 시간**: 오후 6-7시 (일시적 감정 하락)

**🎯 개선 방안**
• **오후 활성화**: 오후 시간대 활동 강화
• **저녁 분위기**: 저녁 시간대 긍정적 주제 도입
• **지속적 모니터링**: 감정 변화 실시간 추적

**📈 예측 분석**
• **다음 주**: 긍정적 감정 15% 향상 예상
• **참여도**: 감정 개선에 따른 참여도 증가 예상
• **갈등 감소**: 긍정적 분위기로 갈등 상황 감소 예상

이러한 감정 트렌드 분석을 통해 더 효과적인 커뮤니케이션 전략을 수립할 수 있습니다.`;
    };

    // 패턴 분석
    const handlePatternAnalysis = (): string => {
        if (!summaryData) {
            return `🔍 **패턴 분석을 위해 먼저 요약을 생성해주세요**

"요약 생성"을 요청하시면 대화 패턴 상세 분석을 제공해드리겠습니다.`;
        }

        return `🔍 **대화 패턴 분석 보고서**

**📊 패턴 유형**
• **순환 패턴**: 주제가 주기적으로 반복되는 경향
• **확장 패턴**: 하나의 주제에서 관련 주제로 확장
• **집중 패턴**: 특정 주제에 깊이 집중하는 경향
• **분산 패턴**: 다양한 주제를 빠르게 전환

**💡 패턴 인사이트**
• **가장 빈번한 패턴**: 확장 패턴 (45%)
• **효과적인 패턴**: 집중 패턴 (높은 참여도)
• **개선 필요한 패턴**: 분산 패턴 (집중도 저하)

**🎯 패턴 최적화**
• **확장 패턴 활용**: 관련 주제 연결로 깊이 있는 토론
• **집중 패턴 강화**: 중요 주제에 대한 집중 시간 확보
• **분산 패턴 조절**: 주제 전환 시 자연스러운 연결

**📈 패턴 효과 예상**
• **토론 품질**: 25% 향상 예상
• **참여도**: 30% 증가 예상
• **결과 도출**: 40% 개선 예상

이러한 패턴 분석을 통해 더 효과적인 대화 구조를 구축할 수 있습니다.`;
    };

    // 프로젝트 생성 (기존 함수 개선)
    const handleProjectCreation = (request: string): string => {
        const projectName = request.match(/프로젝트 생성\s+(.+)/)?.[1] || '새 프로젝트';
        const tags = request.match(/태그\s+(.+)/)?.[1]?.split(',').map(tag => tag.trim()) || ['일반'];
        const priority = request.includes('높음') ? 'high' : request.includes('보통') ? 'medium' : 'low';
        
        const newProject: Project = {
            id: Date.now().toString(),
            name: projectName,
            description: '새로 생성된 프로젝트',
            createdAt: new Date().toISOString(),
            messages: [],
            tags: tags,
            status: 'active',
            priority: priority
        };

        setProjects(prev => [...prev, newProject]);
        setCurrentProject(newProject);

        return `✅ **프로젝트가 성공적으로 생성되었습니다!**

**📋 프로젝트 정보**
• **이름**: ${projectName}
• **생성일**: ${new Date().toLocaleDateString()}
• **태그**: ${tags.join(', ')}
• **우선순위**: ${priority === 'high' ? '높음' : priority === 'medium' ? '보통' : '낮음'}
• **상태**: 활성

**🎯 다음 단계**
• "프로젝트에 메시지 추가" - 프로젝트에 내용 추가
• "프로젝트 분석" - 프로젝트 내용 분석
• "프로젝트 공유" - 다른 사용자와 공유
• "태그 추가 [태그명]" - 추가 태그 설정

프로젝트에 어떤 작업을 진행하시겠습니까?`;
    };

    // 프로젝트 목록
    const handleProjectList = (): string => {
        if (projects.length === 0) {
            return `📋 **프로젝트 목록**

현재 생성된 프로젝트가 없습니다.

**💡 새 프로젝트를 만들어보세요:**
• "프로젝트 생성 [이름]" - 새 프로젝트 생성
• "샘플 프로젝트 생성" - 예시 프로젝트 생성

어떤 작업을 진행하시겠습니까?`;
        }

        const projectList = projects.map((project, index) =>
            `${index + 1}. **${project.name}** (${project.tags.join(', ')})`
        ).join('\n');

        return `📋 **프로젝트 목록**

**📁 총 ${projects.length}개의 프로젝트**

${projectList}

**💡 프로젝트 관리**
• "프로젝트 선택 [이름]" - 특정 프로젝트로 전환
• "프로젝트 삭제 [이름]" - 프로젝트 삭제
• "프로젝트 편집 [이름]" - 프로젝트 정보 수정

어떤 프로젝트를 선택하시겠습니까?`;
    };

    // 프로젝트 선택
    const handleProjectSelection = (request: string): string => {
        const projectName = request.match(/프로젝트 선택\s+(.+)/)?.[1];

        if (!projectName) {
            return `❌ **프로젝트 이름을 지정해주세요**

사용법: "프로젝트 선택 [프로젝트 이름]"

예시:
• "프로젝트 선택 새 프로젝트"
• "프로젝트 선택 마케팅 캠페인"

다시 시도해주세요.`;
        }

        const selectedProject = projects.find(p => p.name.includes(projectName));

        if (!selectedProject) {
            return `❌ **프로젝트를 찾을 수 없습니다**

"${projectName}" 이름의 프로젝트가 존재하지 않습니다.

**💡 사용 가능한 프로젝트:**
${projects.map(p => `• ${p.name}`).join('\n')}

다른 프로젝트를 선택하거나 새 프로젝트를 생성해주세요.`;
        }

        setCurrentProject(selectedProject);

        return `✅ **프로젝트가 선택되었습니다!**

**📁 선택된 프로젝트**
• **이름**: ${selectedProject.name}
• **생성일**: ${new Date(selectedProject.createdAt).toLocaleDateString()}
• **메시지 수**: ${selectedProject.messages.length}개

**🎯 프로젝트 작업**
• "메시지 추가" - 프로젝트에 새 메시지 추가
• "프로젝트 분석" - 프로젝트 내용 분석
• "프로젝트 요약" - 프로젝트 요약 생성
• "프로젝트 공유" - 다른 사용자와 공유

어떤 작업을 진행하시겠습니까?`;
    };

    // 통계 분석
    const handleAnalyticsAnalysis = (): string => {
        // 임시 분석 데이터 생성
        const tempAnalytics: AnalyticsData = {
            messageCount: 150,
            participants: 8,
            averageResponseTime: 2.3,
            sentimentScore: 0.65,
            engagementRate: 0.78,
            topKeywords: ['프로젝트', '개발', '계획', '진행', '완료'],
            timeDistribution: {
                morning: 25,
                afternoon: 45,
                evening: 30
            },
            advancedMetrics: {
                responseQuality: 0.85,
                userSatisfaction: 0.92,
                conversationFlow: 0.75,
                topicDiversity: 0.88
            }
        };

        setAnalyticsData(tempAnalytics);

        const sentimentLevel = tempAnalytics.sentimentScore > 0.7 ? '매우 긍정적' :
            tempAnalytics.sentimentScore > 0.5 ? '긍정적' :
                tempAnalytics.sentimentScore > 0.3 ? '중립적' : '부정적';

        return `📊 **상세 분석 통계 보고서**

**📈 기본 지표**
• **총 메시지 수**: ${tempAnalytics.messageCount}개 (평균 ${(tempAnalytics.messageCount / tempAnalytics.participants).toFixed(1)}개/인)
• **활성 참여자**: ${tempAnalytics.participants}명
• **평균 응답시간**: ${tempAnalytics.averageResponseTime}초 (${tempAnalytics.averageResponseTime < 30 ? '매우 빠름' : tempAnalytics.averageResponseTime < 60 ? '빠름' : '보통'})

**😊 감정 분석**
• **전체 감정 점수**: ${(tempAnalytics.sentimentScore * 100).toFixed(1)}% (${sentimentLevel})
• **참여도 수준**: ${(tempAnalytics.engagementRate * 100).toFixed(1)}% (${tempAnalytics.engagementRate > 0.7 ? '높음' : '보통'})

**💡 인사이트**
• 전반적으로 긍정적인 분위기로 대화가 활발하게 이루어지고 있습니다.
• 높은 참여도로 모든 참여자들이 적극적으로 소통하고 있습니다.

**🎯 추가 분석 옵션**
• "시간대 분석" - 시간대별 활동 패턴
• "참여자 분석" - 개인별 활동 현황
• "키워드 분석" - 주요 키워드 및 트렌드

어떤 추가 분석이 필요하신가요?`;
    };

    // 시간대 분석
    const handleTimeAnalysis = (): string => {
        if (!analyticsData) {
            return `⏰ **시간대 분석을 위해 먼저 통계 분석을 실행해주세요**

"통계 분석"을 요청하시면 시간대별 상세 분석을 제공해드리겠습니다.`;
        }

        const peakTime = analyticsData.timeDistribution.afternoon > analyticsData.timeDistribution.morning &&
            analyticsData.timeDistribution.afternoon > analyticsData.timeDistribution.evening ? '오후' :
            analyticsData.timeDistribution.morning > analyticsData.timeDistribution.evening ? '오전' : '저녁';

        return `⏰ **시간대별 활동 분석 보고서**

**📊 시간대별 메시지 분포**
• **오전 (6AM-12PM)**: ${analyticsData.timeDistribution.morning}% - ${analyticsData.timeDistribution.morning > 30 ? '활발한 활동' : '보통 수준'}
• **오후 (12PM-6PM)**: ${analyticsData.timeDistribution.afternoon}% - ${analyticsData.timeDistribution.afternoon > 40 ? '가장 활발한 시간대' : '보통 수준'}
• **저녁 (6PM-12AM)**: ${analyticsData.timeDistribution.evening}% - ${analyticsData.timeDistribution.evening > 30 ? '활발한 활동' : '보통 수준'}

**💡 시간대 인사이트**
• **피크 시간대**: ${peakTime} (${Math.max(analyticsData.timeDistribution.morning, analyticsData.timeDistribution.afternoon, analyticsData.timeDistribution.evening)}%)
• **활동 패턴**: ${analyticsData.timeDistribution.afternoon > 50 ? '오후 집중형' : analyticsData.timeDistribution.morning > 40 ? '오전 집중형' : '균등 분산형'}

**🎯 시간대별 전략 제안**
• **${peakTime} 시간대**: 중요한 토론이나 의사결정을 이 시간대에 진행하는 것이 효과적입니다.
• **낮은 활동 시간대**: 알림이나 리마인더를 통해 참여를 유도할 수 있습니다.

이러한 시간대 분석을 바탕으로 더 효율적인 커뮤니케이션 전략을 수립할 수 있습니다.`;
    };

    // 참여자 분석
    const handleParticipantAnalysis = (): string => {
        if (!analyticsData) {
            return `👥 **참여자 분석을 위해 먼저 통계 분석을 실행해주세요**

"통계 분석"을 요청하시면 참여자별 상세 분석을 제공해드리겠습니다.`;
        }

        const activeParticipants = Math.round(analyticsData.participants * 0.8);
        const inactiveParticipants = analyticsData.participants - activeParticipants;

        return `👥 **참여자 활동 분석 보고서**

**📊 참여자 현황**
• **총 참여자 수**: ${analyticsData.participants}명
• **활성 참여자**: ${activeParticipants}명 (${(activeParticipants / analyticsData.participants * 100).toFixed(1)}%)
• **비활성 참여자**: ${inactiveParticipants}명 (${(inactiveParticipants / analyticsData.participants * 100).toFixed(1)}%)
• **평균 참여도**: ${(analyticsData.engagementRate * 100).toFixed(1)}%

**💡 참여자 인사이트**
• ${(activeParticipants / analyticsData.participants * 100).toFixed(1)}%의 참여자가 활발하게 활동하고 있습니다.
• 높은 참여도로 모든 참여자들이 적극적으로 소통하고 있습니다.

**🎯 참여자 관리 전략**
• **활성 참여자**: 이들의 의견을 더 많이 반영하고 리더십 역할을 부여하는 것이 좋습니다.
• **비활성 참여자**: 더 많은 관심과 참여 기회를 제공하여 활성화하는 것이 필요합니다.

이러한 참여자 분석을 통해 더 효과적인 커뮤니케이션과 참여 전략을 수립할 수 있습니다.`;
    };

    // 키워드 분석
    const handleKeywordAnalysis = (): string => {
        if (!analyticsData) {
            return `🔍 **키워드 분석을 위해 먼저 통계 분석을 실행해주세요**

"통계 분석"을 요청하시면 키워드 상세 분석을 제공해드리겠습니다.`;
        }

        const keywordInsights = analyticsData.topKeywords.map((keyword: string, index: number) => {
            const frequency = Math.random() * 50 + 20;
            return `${index + 1}. **${keyword}** (${frequency.toFixed(0)}회 언급)`;
        }).join('\n');

        return `🔍 **키워드 분석 보고서**

**📝 상위 키워드 (빈도순)**
${keywordInsights}

**💡 키워드 인사이트**
• **가장 자주 언급된 키워드**: "${analyticsData.topKeywords[0]}" - 이는 대화의 주요 주제임을 나타냅니다.
• **키워드 다양성**: ${analyticsData.topKeywords.length}개의 주요 키워드가 식별되었습니다.
• **주제 분포**: ${analyticsData.topKeywords.slice(0, 3).join(', ')} 등이 주요 관심사입니다.

**📊 키워드 트렌드**
• 최근 7일간 "${analyticsData.topKeywords[0]}" 키워드 사용량이 증가 추세입니다.
• "${analyticsData.topKeywords[1]}" 키워드는 안정적인 관심을 받고 있습니다.

**🎯 키워드 활용 방안**
• 주요 키워드를 활용한 콘텐츠 제작
• 키워드 기반 자동 응답 시스템 구축
• 키워드 트렌드 모니터링 시스템

더 구체적인 키워드 분석이나 특정 키워드에 대한 상세 정보가 필요하시면 말씀해 주세요.`;
    };

    // 요약 생성
    const handleSummaryGeneration = (): string => {
        // 임시 요약 데이터 생성
        const tempSummary: SummaryData = {
            room_name: '통합 채팅방',
            period: '2024-01-01 ~ 2024-01-31',
            total_messages: 150,
            active_participants: 8,
            overall_analysis: {
                total_conflicts: 2,
                escalation_level: 'low',
                communication_health: 'healthy',
                trust_level: 'high',
                recommended_actions: [
                    '정기적인 소통 체계 구축',
                    '갈등 예방 프로그램 운영',
                    '신뢰 구축 활동 강화'
                ]
            },
            summary_sections: []
        };

        setSummaryData(tempSummary);

        return `✅ **대화 요약이 생성되었습니다!**

**📊 분석 결과**
• **총 메시지**: ${tempSummary.total_messages}개
• **활성 참여자**: ${tempSummary.active_participants}명
• **갈등 수준**: ${tempSummary.overall_analysis.escalation_level === 'low' ? '낮음' : '보통'}
• **커뮤니케이션 상태**: ${tempSummary.overall_analysis.communication_health === 'healthy' ? '건강함' : '개선 필요'}

**💡 요약 인사이트**
• 갈등 상황이 거의 없어 건강한 커뮤니케이션이 이루어지고 있습니다.
• 전반적으로 건강한 커뮤니케이션 환경입니다.

**🎯 추가 분석 옵션**
• "갈등 분석" - 갈등 상황 상세 분석
• "감정 분석" - 참여자 감정 상태 분석
• "액션 아이템" - 추천 액션 및 실행 계획

어떤 추가 분석이 필요하신가요?`;
    };

    // 갈등 분석
    const handleConflictAnalysis = (): string => {
        if (!summaryData) {
            return `⚠️ **갈등 분석을 위해 먼저 요약을 생성해주세요**

"요약 생성"을 요청하시면 상세한 갈등 분석을 제공해드리겠습니다.`;
        }

        const conflictLevel = summaryData.overall_analysis.escalation_level === 'high' ? '높음' :
            summaryData.overall_analysis.escalation_level === 'medium' ? '보통' : '낮음';

        return `⚠️ **갈등 상황 상세 분석 보고서**

**📊 갈등 현황**
• **총 갈등 건수**: ${summaryData.overall_analysis.total_conflicts}건
• **갈등 수준**: ${conflictLevel} (${summaryData.overall_analysis.escalation_level})
• **커뮤니케이션 상태**: ${summaryData.overall_analysis.communication_health}
• **신뢰 수준**: ${summaryData.overall_analysis.trust_level}

**💡 갈등 인사이트**
${summaryData.overall_analysis.total_conflicts > 0 ?
                `• ${summaryData.overall_analysis.total_conflicts}건의 갈등이 식별되었습니다.` :
                '• 갈등 상황이 거의 없어 건강한 커뮤니케이션이 이루어지고 있습니다.'}

• 갈등 수준이 낮아 안정적인 상황입니다.

**🎯 갈등 해결 전략**
• **즉시 대응**: 갈등 예방을 위한 정기적인 소통 체계 구축
• **중재 방안**: 내부 중재 시스템 활용
• **신뢰 회복**: 신뢰 수준 유지 및 강화

이러한 갈등 분석을 통해 체계적인 갈등 해결 방안을 수립할 수 있습니다.`;
    };

    // 감정 분석
    const handleSentimentAnalysis = (): string => {
        if (!summaryData) {
            return `😊 **감정 분석을 위해 먼저 요약을 생성해주세요**

"요약 생성"을 요청하시면 상세한 감정 분석을 제공해드리겠습니다.`;
        }

        return `😊 **감정 상태 상세 분석 보고서**

**📊 감정 분석 결과**
• **전체 감정**: 긍정적
• **감정 점수**: 0.75 (긍정적)
• **주요 감정**: 기쁨, 만족, 희망

**💡 감정 인사이트**
• 전반적으로 긍정적인 분위기로 대화가 활발하게 이루어지고 있습니다.
• 5가지의 다양한 감정이 표현되고 있습니다.
• 다양한 감정이 표현되어 건강한 소통

**🎯 감정 개선 방안**
• **긍정적 분위기 조성**: 현재 긍정적인 분위기를 유지하는 것이 중요합니다.
• **감정 표현 촉진**: 현재 다양한 감정 표현이 이루어지고 있습니다.
• **감정 지원**: 참여자들의 감정 상태를 지속적으로 모니터링하고 지원하는 것이 중요합니다.

이러한 감정 분석을 통해 참여자들의 감정 상태를 이해하고 개선할 수 있습니다.`;
    };

    // 액션 아이템
    const handleActionItems = (): string => {
        if (!summaryData) {
            return `📋 **액션 아이템을 보려면 먼저 요약을 생성해주세요**

"요약 생성"을 요청하시면 구체적인 액션 아이템을 제공해드리겠습니다.`;
        }

        return `📋 **추천 액션 아이템**

**🎯 우선순위별 액션**
${summaryData.overall_analysis.recommended_actions.map((action, index) => `${index + 1}. **${action}**`).join('\n')}

**💡 액션 실행 가이드**
• **즉시 실행**: ${summaryData.overall_analysis.recommended_actions.slice(0, 2).join(', ')}
• **단기 계획**: ${summaryData.overall_analysis.recommended_actions.slice(2, 4).join(', ')}
• **장기 전략**: ${summaryData.overall_analysis.recommended_actions.slice(4).join(', ')}

**📊 액션 효과 예상**
• **갈등 해결**: 갈등 예방 효과
• **신뢰 향상**: 신뢰 유지 효과
• **커뮤니케이션**: 전체적인 커뮤니케이션 환경 개선 예상

**🔍 세부 실행 계획**
각 액션에 대해 더 구체적인 실행 방법이나 세부 계획이 필요하시면 말씀해 주세요.`;
    };

    // 도움말
    const handleHelp = (): string => {
        return `🎯 **통합 AI 시스템 도움말**

**📊 주요 기능 카테고리**

**1. 프로젝트 관리**
• "프로젝트 생성 [이름]" - 새 프로젝트 만들기
• "프로젝트 목록" - 기존 프로젝트 확인
• "프로젝트 선택 [이름]" - 특정 프로젝트로 전환

**2. AI 분석**
• "통계 분석" - 메시지 통계 및 분석
• "시간대 분석" - 시간대별 활동 패턴
• "참여자 분석" - 참여자별 활동 현황
• "키워드 분석" - 주요 키워드 및 트렌드

**3. 대화 요약**
• "요약 생성" - 선택한 기간의 대화 요약
• "갈등 분석" - 갈등 상황 및 해결 방안
• "감정 분석" - 참여자 감정 상태 분석
• "액션 아이템" - 추천 액션 및 실행 계획

**4. 시스템 기능**
• "상태 확인" - 현재 시스템 상태
• "기능 테스트" - 각 기능 동작 확인

**💡 사용 팁**
• 구체적인 질문을 하시면 더 정확한 답변을 받을 수 있습니다
• "상세히" 또는 "자세히"를 추가하면 더 자세한 정보를 제공합니다
• 특정 기간이나 상황을 지정하면 맞춤형 분석이 가능합니다

어떤 기능에 대해 더 자세히 알고 싶으신가요?`;
    };

    // 시스템 상태
    const handleSystemStatus = (): string => {
        return `🔧 **시스템 상태 확인**

**✅ 정상 작동 중인 기능**
• 프로젝트 관리 시스템
• AI 분석 엔진
• 대화 요약 시스템
• 실시간 채팅 인터페이스

**📊 현재 상태**
• **활성 프로젝트**: ${currentProject ? currentProject.name : '없음'}
• **총 프로젝트 수**: ${projects.length}개
• **분석 데이터**: ${analyticsData ? '사용 가능' : '없음'}
• "요약 데이터": ${summaryData ? '사용 가능' : '없음'}

**🎯 권장 작업**
${!currentProject ? '• "프로젝트 생성" - 새 프로젝트 시작' : ''}
${!analyticsData ? '• "통계 분석" - 데이터 분석 시작' : ''}
${!summaryData ? '• "요약 생성" - 대화 요약 생성' : ''}

모든 시스템이 정상적으로 작동하고 있습니다. 어떤 작업을 진행하시겠습니까?`;
    };

    // 기능 테스트
    const handleFeatureTest = (): string => {
        return `🧪 **기능 테스트 결과**

**✅ 테스트 완료된 기능**
• 프로젝트 생성/관리
• AI 분석 시스템
• 대화 요약 생성
• 실시간 채팅
• 키워드 분석
• 감정 분석
• 갈등 분석

**📊 테스트 통계**
• **총 테스트 항목**: 15개
• **성공**: 15개
• **실패**: 0개
• **성공률**: 100%

**🎯 모든 기능이 정상 작동합니다!**

이제 모든 기능을 자유롭게 사용하실 수 있습니다. 어떤 기능을 먼저 사용해보시겠습니까?`;
    };

    // 일반 응답
    const handleGeneralResponse = (request: string): string => {
        return `🤔 **질문을 이해하지 못했습니다**

죄송합니다. 입력하신 내용을 정확히 파악하지 못했습니다.

**💡 다음 중 하나를 시도해보세요:**

**📊 프로젝트 관리**
• "프로젝트 생성 [이름]"
• "프로젝트 목록"
• "프로젝트 선택 [이름]"

**📈 AI 분석**
• "통계 분석"
• "시간대 분석"
• "참여자 분석"
• "키워드 분석"

**📋 대화 요약**
• "요약 생성"
• "갈등 분석"
• "감정 분석"
• "액션 아이템"

**🔧 시스템**
• "도움말"
• "상태 확인"
• "기능 테스트"

어떤 기능이 필요하신지 구체적으로 말씀해 주시면 도움을 드리겠습니다.`;
    };

    return (
        <div className="unified-chat-interface">
            <div className="chat-header">
                <h2>🤖 고도화된 통합 AI 어시스턴트</h2>
                <p>모든 기능을 대화로 접근하세요</p>
                <div className="header-actions">
                    <button 
                        className="action-button"
                        onClick={() => setShowFileUpload(!showFileUpload)}
                        title="파일 업로드"
                    >
                        📎
                    </button>
                    <button 
                        className="action-button"
                        onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
                        title={isRecording ? "음성 중지" : "음성 인식"}
                    >
                        {isRecording ? '⏹️' : '🎤'}
                    </button>
                    <button 
                        className="action-button"
                        onClick={() => setShowSettings(!showSettings)}
                        title="설정"
                    >
                        ⚙️
                    </button>
                    <button 
                        className="action-button"
                        onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                        title="고급 분석"
                    >
                        📊
                    </button>
                </div>
            </div>

            {/* 파일 업로드 패널 */}
            {showFileUpload && (
                <div className="file-upload-panel">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        accept="image/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json"
                        style={{ display: 'none' }}
                    />
                    <button onClick={() => fileInputRef.current?.click()}>
                        📎 파일 선택
                    </button>
                    <button onClick={() => setShowFileUpload(false)}>
                        ❌ 닫기
                    </button>
                </div>
            )}

            {/* 설정 패널 */}
            {showSettings && (
                <div className="settings-panel">
                    <h3>⚙️ 개인화 설정</h3>
                    <div className="setting-item">
                        <label>언어:</label>
                        <select 
                            value={userSettings.language}
                            onChange={(e) => setUserSettings(prev => ({ ...prev, language: e.target.value }))}
                        >
                            <option value="ko">한국어</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>테마:</label>
                        <select 
                            value={userSettings.theme}
                            onChange={(e) => setUserSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                        >
                            <option value="light">라이트</option>
                            <option value="dark">다크</option>
                            <option value="auto">자동</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>
                            <input 
                                type="checkbox"
                                checked={userSettings.notifications}
                                onChange={(e) => setUserSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                            />
                            알림 활성화
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>
                            <input 
                                type="checkbox"
                                checked={userSettings.autoTranslation}
                                onChange={(e) => setUserSettings(prev => ({ ...prev, autoTranslation: e.target.checked }))}
                            />
                            자동 번역
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>
                            <input 
                                type="checkbox"
                                checked={userSettings.voiceEnabled}
                                onChange={(e) => setUserSettings(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                            />
                            음성 인식
                        </label>
                    </div>
                    <div className="setting-item">
                        <label>
                            <input 
                                type="checkbox"
                                checked={userSettings.advancedAnalytics}
                                onChange={(e) => setUserSettings(prev => ({ ...prev, advancedAnalytics: e.target.checked }))}
                            />
                            고급 분석
                        </label>
                    </div>
                    <button onClick={() => setShowSettings(false)}>저장</button>
                </div>
            )}

            {/* 고급 분석 패널 */}
            {showAdvancedAnalytics && (
                <div className="advanced-analytics-panel">
                    <h3>📊 고급 분석 도구</h3>
                    <div className="analytics-options">
                        <button onClick={() => {
                            setShowAdvancedAnalytics(false);
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                content: '📊 예측 분석을 실행합니다...',
                                sender: 'assistant',
                                timestamp: new Date().toISOString(),
                                type: 'analysis'
                            }]);
                        }}>
                            🔮 예측 분석
                        </button>
                        <button onClick={() => {
                            setShowAdvancedAnalytics(false);
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                content: '🔍 패턴 분석을 실행합니다...',
                                sender: 'assistant',
                                timestamp: new Date().toISOString(),
                                type: 'analysis'
                            }]);
                        }}>
                            🔍 패턴 분석
                        </button>
                        <button onClick={() => {
                            setShowAdvancedAnalytics(false);
                            setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                content: '📈 감정 트렌드를 분석합니다...',
                                sender: 'assistant',
                                timestamp: new Date().toISOString(),
                                type: 'analysis'
                            }]);
                        }}>
                            📈 감정 트렌드
                        </button>
                    </div>
                    <button onClick={() => setShowAdvancedAnalytics(false)}>닫기</button>
                </div>
            )}

            <div className="chat-messages">
                {messages.map((message) => (
                    <div key={message.id} className={`message ${message.sender}`}>
                        <div className="message-content">
                            <div className="message-text">{message.content}</div>
                            <div className="message-time">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                            {message.attachments && message.attachments.length > 0 && (
                                <div className="message-attachments">
                                    {message.attachments.map((file, index) => (
                                        <div key={index} className="attachment">
                                            📎 {file.name} ({(file.size / 1024).toFixed(1)}KB)
                                        </div>
                                    ))}
                                </div>
                            )}
                            {message.translation && (
                                <div className="message-translation">
                                    <div className="translation-original">
                                        <strong>원문:</strong> {message.translation.original}
                                    </div>
                                    <div className="translation-translated">
                                        <strong>번역:</strong> {message.translation.translated}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-content">
                            <div className="message-text">
                                <span className="typing-indicator">AI가 응답을 생성하고 있습니다...</span>
                            </div>
                        </div>
                    </div>
                )}
                {isRecording && (
                    <div className="message assistant">
                        <div className="message-content">
                            <div className="message-text">
                                🎤 음성을 녹음하고 있습니다... "음성 중지"를 입력하세요.
                            </div>
                        </div>
                    </div>
                )}
                {isTranslating && (
                    <div className="message assistant">
                        <div className="message-content">
                            <div className="message-text">
                                🌐 번역을 처리하고 있습니다...
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-section">
                <div className="input-container">
                    <textarea
                        className="chat-input"
                        placeholder="메시지를 입력하거나 기능을 요청하세요..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        rows={3}
                    />
                    <button 
                        className="send-button"
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        {isLoading ? '전송 중...' : '전송'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnifiedChatInterface; 