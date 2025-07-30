import React, { useState, useEffect, useRef } from 'react';
import {
  StarIcon,
    CpuChipIcon,
    BoltIcon,
    FireIcon,
    HeartIcon,
    EyeIcon,
    CogIcon,
    MagnifyingGlassIcon,
    UserIcon,
    UsersIcon,
    ArrowPathIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    LightBulbIcon,
    AcademicCapIcon,
    BeakerIcon,
    TrophyIcon,
    ShieldCheckIcon,
    HandRaisedIcon,
    FaceSmileIcon,
    BookOpenIcon,
    InformationCircleIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    Bars3Icon,
    PlusIcon,
    MinusIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    DocumentTextIcon,
    ChartBarIcon,
    PresentationChartLineIcon,
    TableCellsIcon,
    CubeIcon,
    CubeTransparentIcon,
    SwatchIcon,
    PaintBrushIcon,
    AdjustmentsHorizontalIcon,
    FunnelIcon,
    ViewColumnsIcon,
    Squares2X2Icon,
    RectangleStackIcon,
    CircleStackIcon,
    QueueListIcon,
    ListBulletIcon,
    Bars4Icon,
    Bars3BottomLeftIcon,
    Bars3BottomRightIcon,
    Bars3CenterLeftIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    GlobeAltIcon,
    LanguageIcon,
    UserGroupIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftEllipsisIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ChatBubbleOvalLeftIcon,
    ChatBubbleLeftIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface PsychologicalProfile {
    personality: 'extrovert' | 'introvert' | 'ambivert';
    decisionStyle: 'logical' | 'emotional' | 'intuitive' | 'analytical';
    communicationStyle: 'direct' | 'indirect' | 'supportive' | 'challenging';
    motivationType: 'achievement' | 'affiliation' | 'power' | 'security';
    cognitiveLoad: 'low' | 'medium' | 'high';
    emotionalState: 'positive' | 'negative' | 'neutral' | 'mixed';
    trustLevel: 'high' | 'medium' | 'low';
    susceptibility: 'high' | 'medium' | 'low';
}

interface MessageStrategy {
    id: string;
    name: string;
    description: string;
    psychologicalApproach: string;
    communicationTechnique: string;
    emotionalTrigger: string;
    cognitiveBias: string;
    persuasionMethod: string;
    successRate: number;
    ethicalLevel: 'high' | 'medium' | 'low';
}

interface MessageFormat {
    id: string;
    name: string;
    description: string;
    category: 'communication' | 'psychological' | 'manipulation';
    intensity: 'low' | 'medium' | 'high';
    ethicalLevel: 'high' | 'medium' | 'low';
}

interface GeneratedMessage {
    id: string;
    content: string;
    strategy: MessageStrategy;
    psychologicalMetrics: {
        persuasionPotential: number;
        emotionalImpact: number;
        cognitiveLoad: number;
        neuralActivation: number;
        trustBuilding: number;
        urgencyCreation: number;
        socialProof: number;
        clarityScore: number;
    };
    ethicalScore: number;
    generationTime: number;
    tokensUsed: number;
    qualityScore: number;
    targetAudience: string;
    emotionalTone: string;
    intent: string;
    timestamp: string;
}

interface MessageGenerationConfig {
    model: 'neural' | 'quantum' | 'extreme' | 'personalized' | 'hybrid' | 'psychological' | 'ethical';
    personality: string;
    writingStyle: string;
    intent: string;
    targetAudience: string;
    emotionalTone: string;
    persuasionLevel: number;
    ethicalLevel: number;
    creativityLevel: number;
    psychologicalProfile: PsychologicalProfile;
    selectedStrategies: string[];
}

interface ConversationContext {
    id: string;
    speaker: string;
    message: string;
    timestamp: string;
    emotion: 'positive' | 'negative' | 'neutral' | 'concerned' | 'excited';
    intent: 'question' | 'statement' | 'request' | 'complaint' | 'suggestion';
    context: string;
}

interface ConversationSuggestion {
    id: string;
    content: string;
    strategy: MessageStrategy;
    context: string;
    emotionalTone: string;
    confidence: number;
    reasoning: string;
}

interface UltraAdvancedAIMessageGeneratorProps {
    onMessageGenerated: (message: GeneratedMessage) => void;
    isActive: boolean;
    onToggle: () => void;
    conversationHistory?: ConversationContext[];
}

const UltraAdvancedAIMessageGenerator: React.FC<UltraAdvancedAIMessageGeneratorProps> = ({
    onMessageGenerated,
    isActive,
    onToggle,
    conversationHistory = []
}) => {
    // 상태 관리
    const [activeTab, setActiveTab] = useState('generator');
    const [selectedModel, setSelectedModel] = useState('neural');
    const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedMessageFormat, setSelectedMessageFormat] = useState('');
    const [messageIntent, setMessageIntent] = useState('');
    const [isGeneratingCustomMessage, setIsGeneratingCustomMessage] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<ConversationContext | null>(null);
    const [conversationSuggestions, setConversationSuggestions] = useState<ConversationSuggestion[]>([]);
    const [isAnalyzingConversation, setIsAnalyzingConversation] = useState(false);

    // 추가 고도화 기능 상태
    const [savedTemplates, setSavedTemplates] = useState<Array<{ id: string, name: string, format: string, intent: string, timestamp: string }>>([]);
    const [messageHistory, setMessageHistory] = useState<Array<{ id: string, content: string, format: string, intent: string, rating: number, timestamp: string }>>([]);
    const [performanceStats, setPerformanceStats] = useState({
        totalGenerated: 0,
        averageRating: 0,
        mostEffectiveFormat: '',
        averageResponseTime: 0,
        successRate: 0
    });
    const [recommendedFormats, setRecommendedFormats] = useState<string[]>([]);
    const [abTestResults, setAbTestResults] = useState<Array<{ id: string, formatA: string, formatB: string, winner: string, confidence: number }>>([]);

    // 메시지 형식 정의
    const messageFormats: MessageFormat[] = [
        { id: 'refutation', name: '반박', description: '상대 주장의 오류나 약점을 지적하며 부정', category: 'communication', intensity: 'high', ethicalLevel: 'medium' },
        { id: 'counter-question', name: '반문', description: '상대의 주장에 질문을 던져 되묻는 방식', category: 'communication', intensity: 'medium', ethicalLevel: 'high' },
        { id: 'opposition', name: '반대', description: '명확하게 의견을 거부하거나 부정', category: 'communication', intensity: 'high', ethicalLevel: 'medium' },
        { id: 'agreement', name: '동조', description: '상대 의견에 동의하거나 지지', category: 'communication', intensity: 'low', ethicalLevel: 'high' },
        { id: 'defense', name: '응호', description: '특정 입장이나 대상을 적극적으로 옹호', category: 'communication', intensity: 'high', ethicalLevel: 'medium' },
        { id: 'criticism', name: '비난', description: '강하게 부정적 평가나 공격', category: 'psychological', intensity: 'high', ethicalLevel: 'low' },
        { id: 'neutral', name: '중립', description: '감정이나 입장 없이 상황만 설명', category: 'communication', intensity: 'low', ethicalLevel: 'high' },
        { id: 'avoidance', name: '회피', description: '명확한 입장을 회피하거나 대화를 흐림', category: 'psychological', intensity: 'low', ethicalLevel: 'medium' },
        { id: 'sarcasm', name: '풍자', description: '비꼬거나 간접적으로 비판', category: 'psychological', intensity: 'medium', ethicalLevel: 'low' },
        { id: 'empathy', name: '공감', description: '상대 감정을 이해하고 수용', category: 'communication', intensity: 'low', ethicalLevel: 'high' },
        { id: 'suggestion', name: '제안', description: '해결책이나 대안을 제시', category: 'communication', intensity: 'medium', ethicalLevel: 'high' },
        { id: 'questioning', name: '질문', description: '정보를 얻거나 의문을 던짐', category: 'communication', intensity: 'medium', ethicalLevel: 'high' },
        { id: 'ignoring', name: '무시', description: '반응하지 않거나 대화를 거부', category: 'psychological', intensity: 'low', ethicalLevel: 'low' },
        { id: 'emphasis', name: '강조', description: '특정 사실이나 의견을 부각', category: 'communication', intensity: 'medium', ethicalLevel: 'medium' },
        { id: 'speculation', name: '추측', description: '확실하지 않은 의견을 조심스럽게 제시', category: 'communication', intensity: 'low', ethicalLevel: 'medium' },
        { id: 'emotional-appeal', name: '감정적 호소', description: '논리보다 감정에 기반해 설득', category: 'psychological', intensity: 'high', ethicalLevel: 'low' },
        { id: 'mockery', name: '조롱', description: '상대를 비웃거나 깎아내림', category: 'psychological', intensity: 'high', ethicalLevel: 'low' },
        { id: 'directive', name: '명령', description: '지시하거나 강제하는 어투', category: 'manipulation', intensity: 'high', ethicalLevel: 'low' },
        { id: 'coercion', name: '강압', description: '위협, 압박을 통해 상대를 설득', category: 'manipulation', intensity: 'high', ethicalLevel: 'low' },
        { id: 'forcefulness', name: '강제', description: '선택권을 주지 않고 특정 행동을 요구', category: 'manipulation', intensity: 'high', ethicalLevel: 'low' },
        { id: 'brainwashing', name: '세뇌', description: '장기간 반복·왜곡으로 판단력을 마비시킴', category: 'manipulation', intensity: 'high', ethicalLevel: 'low' },
        { id: 'gaslighting', name: '가스라이팅', description: '상대의 현실 인식을 부정하거나 조작해 혼란을 유도', category: 'manipulation', intensity: 'high', ethicalLevel: 'low' }
    ];

    // 메시지 형식별 템플릿
    const formatTemplates: { [key: string]: string[] } = {
        'refutation': [
            "그 주장에는 몇 가지 문제가 있습니다.",
            "그런 관점은 사실과 맞지 않습니다.",
            "그 의견은 검증되지 않은 가정에 기반하고 있습니다.",
            "그런 주장은 논리적으로 맞지 않습니다.",
            "그 의견에는 근거가 부족합니다.",
            "그런 생각은 현실과 거리가 있습니다.",
            "그 주장은 검토가 필요합니다.",
            "그런 관점은 재고해볼 필요가 있습니다.",
            "그 의견은 수정이 필요합니다.",
            "그런 주장은 타당하지 않습니다."
        ],
        'counter-question': [
            "그런 주장을 하시는 근거는 무엇인가요?",
            "그렇게 생각하시는 이유가 궁금합니다.",
            "그 주장을 뒷받침하는 증거가 있나요?",
            "그런 의견을 가지게 된 계기가 궁금합니다.",
            "그 주장의 근거를 설명해주실 수 있나요?",
            "그런 생각을 하시는 이유가 궁금합니다.",
            "그 주장의 타당성을 어떻게 입증하시나요?",
            "그런 관점의 근거가 무엇인가요?",
            "그 의견의 논리적 흐름을 설명해주세요.",
            "그런 주장의 근거를 제시해주실 수 있나요?"
        ],
        'opposition': [
            "저는 그 의견에 동의할 수 없습니다.",
            "그런 접근은 적절하지 않다고 생각합니다.",
            "그 방향은 문제가 있다고 봅니다.",
            "그런 의견은 받아들일 수 없습니다.",
            "그 주장은 타당하지 않다고 봅니다.",
            "그런 생각은 현실적이지 않습니다.",
            "그 의견에는 동의하기 어렵습니다.",
            "그런 접근은 부적절합니다.",
            "그 주장은 논리적으로 맞지 않습니다.",
            "그런 의견은 수용할 수 없습니다."
        ],
        'agreement': [
            "맞습니다. 그 의견에 동의합니다.",
            "좋은 지적이십니다.",
            "그런 관점이 타당하다고 생각합니다.",
            "정확한 분석이라고 봅니다.",
            "그 의견에 전적으로 동의합니다.",
            "훌륭한 제안이라고 생각합니다.",
            "그런 접근이 적절하다고 봅니다.",
            "정말 좋은 아이디어입니다.",
            "그 의견이 맞다고 생각합니다.",
            "완전히 동의합니다."
        ],
        'defense': [
            "그 입장을 적극적으로 지지합니다.",
            "그런 관점이 옳다고 생각합니다.",
            "그 의견을 강력히 옹호합니다.",
            "그 주장을 전적으로 지지합니다.",
            "그런 접근이 정확하다고 봅니다.",
            "그 의견을 적극적으로 지지합니다.",
            "그런 관점이 타당하다고 생각합니다.",
            "그 주장을 강력히 옹호합니다.",
            "그런 생각이 맞다고 봅니다.",
            "그 의견을 전적으로 지지합니다."
        ],
        'criticism': [
            "솔직히 {intent}는 이해할 수 없습니다.",
            "{intent} 같은 건 용납할 수 없어요.",
            "이런 상황에서 {intent}라니, 정말 실망스럽네요.",
            "계속 이런 식이면 문제의 원인이라는 말밖에 안 나옵니다.",
            "{intent}는 전혀 타당하지 않습니다.",
            "{intent}는 완전히 잘못된 판단입니다.",
            "이해력이 부족한 건 아닌지 의심스럽네요.",
            "이런 결정은 받아들일 수 없습니다.",
            "{intent}는 문제가 많습니다.",
            "이런 식이면 곤란합니다.",
            "정말 {intent}라니 어이가 없네요.",
            "{intent}는 말도 안 됩니다.",
            "이런 {intent}는 용납할 수 없어요.",
            "{intent}라니 정말 실망이네요.",
            "이런 {intent}는 문제가 있어요."
        ],
        'coercion': [
            "지금 {intent}를 따르지 않으면, 이후 불이익이 있을 수밖에 없습니다.",
            "선택권은 없습니다. {intent}를 반드시 따라야 합니다.",
            "이건 협상이 아니라 통보입니다. {intent}를 즉시 실행하세요.",
            "{intent}를 거부하면 책임질 각오 하세요.",
            "{intent}를 이행하지 않으면 곤란해집니다.",
            "{intent}는 반드시 따라야 합니다. 토 달지 마세요.",
            "이건 명령입니다. {intent}를 바로 하세요.",
            "{intent}를 미루면 더 큰 문제가 생깁니다.",
            "지금 바로 {intent}를 실행하세요.",
            "이견은 허용하지 않습니다. {intent}만이 답입니다.",
            "다른 선택은 없습니다. {intent}를 해야 합니다.",
            "{intent}를 거부할 권리는 없습니다.",
            "이미 결정된 사항입니다. {intent}를 하세요.",
            "{intent}는 필수입니다. 거부할 수 없습니다.",
            "지금 당장 {intent}를 실행하세요."
        ],
        'forcefulness': [
            "이건 선택이 아니라 필수입니다. {intent}를 무조건 따라야 합니다.",
            "다른 방법은 없습니다. {intent}만이 유일한 선택입니다.",
            "이미 결정된 사항입니다. {intent}를 즉시 이행하세요.",
            "{intent}는 반드시 해야 합니다. 미루지 마세요.",
            "{intent}를 거부할 수 없습니다.",
            "{intent}는 무조건 따라야 합니다.",
            "{intent} 외에는 답이 없습니다.",
            "{intent}를 지금 바로 실행하세요.",
            "이건 명령입니다. {intent}를 하세요.",
            "토 달지 말고 {intent}를 하세요.",
            "선택권이 없습니다. {intent}를 해야 합니다.",
            "다른 대안은 없습니다. {intent}만 가능합니다.",
            "이미 정해진 일입니다. {intent}를 하세요.",
            "{intent}는 필수사항입니다.",
            "거부할 수 없습니다. {intent}를 하세요."
        ],
        'brainwashing': [
            "여러 번 말씀드리지만, {intent}가 진실입니다. 계속 반복해서 기억하세요.",
            "다른 생각은 필요 없습니다. {intent}만이 옳은 길입니다.",
            "계속 듣다 보면 알게 될 겁니다. {intent}가 정답입니다.",
            "{intent}만이 진실입니다. 의심하지 마세요.",
            "{intent}를 계속 반복해서 생각하세요.",
            "{intent} 외에는 답이 없습니다.",
            "{intent}만이 옳은 선택입니다.",
            "{intent}를 믿으세요. 그게 진실입니다.",
            "{intent}를 계속 되뇌이세요.",
            "{intent}만이 현실입니다.",
            "당신이 잘못 생각하고 있는 겁니다. {intent}가 맞습니다.",
            "계속 반복해서 말씀드리지만, {intent}가 유일한 진실입니다.",
            "당신의 생각이 틀렸습니다. {intent}가 정답입니다.",
            "이미 알고 계시겠지만, {intent}가 사실입니다.",
            "분명히 이해하고 계실 텐데, {intent}가 맞습니다."
        ],
        'gaslighting': [
            "그렇게 느끼는 건 착각입니다. 현실을 직시하세요.",
            "{intent}에 대해 그렇게 생각하는 건 잘못된 인식이에요.",
            "내가 맞고, 당신이 틀린 겁니다. 다시 생각해보세요.",
            "{intent}는 사실이 아닙니다. 기억을 다시 확인해보세요.",
            "그렇게 느끼는 건 당신 문제입니다.",
            "{intent}는 실제로 일어난 일이 아닙니다.",
            "현실을 제대로 보세요. {intent}는 사실이 아닙니다.",
            "{intent}에 대한 생각을 바꾸세요.",
            "그건 당신의 오해입니다.",
            "{intent}는 잘못된 기억입니다.",
            "그런 일은 없었습니다. 다시 생각해보세요.",
            "당신이 잘못 기억하고 있는 것 같습니다.",
            "그런 상황은 존재하지 않았습니다.",
            "당신의 기억이 틀렸습니다.",
            "그런 일은 일어나지 않았어요."
        ],
        'mockery': [
            "{intent}라니, 정말 순진하군요.",
            "이런 것도 모르세요? {intent}는 상식 아닌가요?",
            "웃기네요, 진심으로 {intent}를 주장하는 건가요?",
            "{intent}라니, 농담이시죠?",
            "{intent}를 진지하게 말하는 건가요?",
            "정말 {intent}가 답이라고 생각하세요?",
            "{intent}라니, 말도 안 됩니다.",
            "{intent}는 그냥 웃고 넘길 일입니다.",
            "{intent}를 믿는 사람이 있나요?",
            "{intent}라니, 어이가 없네요.",
            "정말 {intent}라니 대단하네요.",
            "{intent}를 진짜로 믿는 건가요?",
            "이런 {intent}도 모르시다니 웃기네요.",
            "{intent}라니 정말 창의적이네요.",
            "{intent}를 진지하게 생각하시는군요."
        ],
        'directive': [
            "지금 바로 {intent}를 실행하세요.",
            "내가 시키는 대로 {intent}를 하세요.",
            "{intent}는 반드시 해야 합니다. 토 달지 마세요.",
            "{intent}를 즉시 이행하세요.",
            "{intent}를 지금 바로 하세요.",
            "{intent}를 반드시 완료하세요.",
            "{intent}를 미루지 마세요.",
            "{intent}를 꼭 하세요.",
            "{intent}를 빠르게 처리하세요.",
            "{intent}를 즉시 실행 바랍니다.",
            "지금 당장 {intent}를 하세요.",
            "{intent}를 바로 시작하세요.",
            "{intent}를 즉시 처리하세요.",
            "{intent}를 지금 바로 실행하세요.",
            "{intent}를 당장 하세요."
        ],
        'ignoring': [
            "이 대화는 더 이상 의미 없습니다. {intent}에 대해선 할 말이 없네요.",
            "{intent}는 논의할 가치가 없습니다.",
            "이 주제엔 관심 없습니다. 넘어가죠.",
            "{intent}에 대해선 더 이상 언급하지 않겠습니다.",
            "{intent}는 중요하지 않습니다.",
            "{intent}는 무시하겠습니다.",
            "{intent}는 신경 쓰지 않겠습니다.",
            "{intent}는 건너뛰겠습니다.",
            "{intent}는 별로 중요하지 않네요.",
            "{intent}는 그냥 넘어가죠.",
            "그런 {intent}는 신경 쓰지 않겠습니다.",
            "{intent}는 무시하고 넘어가겠습니다.",
            "그런 주제는 건너뛰겠습니다.",
            "{intent}는 중요하지 않으니 넘어가죠.",
            "그런 {intent}는 논의할 필요가 없습니다."
        ],
        'neutral': [
            "상황을 객관적으로 살펴보면",
            "사실을 확인해보면",
            "현실적으로 보면",
            "객관적으로 분석하면",
            "실제 상황을 보면",
            "현실을 직시하면",
            "사실을 바탕으로 보면",
            "객관적 관점에서 보면",
            "실제 상황을 고려하면",
            "현실적으로 생각하면"
        ],
        'avoidance': [
            "그 부분은 나중에 논의해보겠습니다.",
            "다른 관점에서 생각해보겠습니다.",
            "그 문제는 복잡하니 신중히 접근해야겠습니다.",
            "그런 주제는 나중에 다루겠습니다.",
            "다른 각도에서 살펴보겠습니다.",
            "그 문제는 복잡하니 시간을 두고 생각해보겠습니다.",
            "그런 이슈는 나중에 논의하겠습니다.",
            "다른 방법으로 접근해보겠습니다.",
            "그 문제는 신중히 다뤄야겠습니다.",
            "그런 주제는 나중에 정리해보겠습니다."
        ],
        'sarcasm': [
            "정말 훌륭한 아이디어네요.",
            "그런 생각을 하시다니 대단합니다.",
            "정말 창의적인 접근이십니다.",
            "와, 정말 멋진 생각이네요.",
            "그런 아이디어를 생각하시다니 대단해요.",
            "정말 훌륭한 제안이네요.",
            "그런 생각을 하시다니 놀랍네요.",
            "정말 창의적이네요.",
            "그런 아이디어를 생각하시다니 대단합니다.",
            "정말 멋진 접근이네요."
        ],
        'empathy': [
            "그런 마음이 이해됩니다.",
            "힘드셨을 것 같습니다.",
            "그런 상황이 답답하셨을 것 같아요.",
            "정말 어려우셨을 것 같아요.",
            "그런 마음이 이해가 됩니다.",
            "힘드셨을 것 같아요.",
            "그런 상황이 어려우셨을 것 같습니다.",
            "정말 답답하셨을 것 같아요.",
            "그런 마음이 이해됩니다.",
            "힘드셨을 것 같습니다."
        ],
        'suggestion': [
            "다른 방법을 제안드립니다.",
            "이런 접근은 어떨까요?",
            "대안을 생각해보시는 건 어떨까요?",
            "다른 방향을 고려해보시는 건 어떨까요?",
            "이런 방법은 어떨까요?",
            "다른 접근을 시도해보시는 건 어떨까요?",
            "이런 방향은 어떨까요?",
            "다른 방법을 고려해보시는 건 어떨까요?",
            "이런 제안은 어떨까요?",
            "다른 아이디어를 생각해보시는 건 어떨까요?"
        ],
        'questioning': [
            "그 부분에 대해 더 자세히 설명해주실 수 있나요?",
            "그런 생각을 하게 된 계기가 궁금합니다.",
            "그 주장의 근거가 무엇인가요?",
            "그런 관점의 이유가 궁금합니다.",
            "그 의견의 근거를 설명해주실 수 있나요?",
            "그런 생각을 하시는 이유가 궁금합니다.",
            "그 주장의 타당성을 어떻게 입증하시나요?",
            "그런 관점의 근거가 무엇인가요?",
            "그 의견의 논리적 흐름을 설명해주세요.",
            "그런 주장의 근거를 제시해주실 수 있나요?"
        ],
        'emphasis': [
            "특히 중요한 점은",
            "핵심은",
            "가장 중요한 것은",
            "중요한 것은",
            "특히 주목할 점은",
            "핵심적인 것은",
            "가장 중요한 부분은",
            "특히 강조하고 싶은 것은",
            "중요한 포인트는",
            "특히 주목해야 할 것은"
        ],
        'speculation': [
            "아마도 그럴 수도 있겠지만",
            "혹시 그런 가능성도 있을 것 같습니다.",
            "그런 관점도 있을 수 있겠네요.",
            "아마 그럴 수도 있을 것 같습니다.",
            "혹시 그런 가능성이 있을 수도 있겠네요.",
            "그런 관점도 있을 수 있겠습니다.",
            "아마 그럴 수도 있겠지만",
            "혹시 그런 가능성도 있을 것 같습니다.",
            "그런 관점도 있을 수 있겠네요.",
            "아마 그럴 수도 있을 것 같습니다."
        ],
        'emotional-appeal': [
            "정말 안타까운 상황입니다.",
            "그런 마음이 이해됩니다.",
            "정말 답답하시겠어요.",
            "정말 어려운 상황이네요.",
            "그런 마음이 이해가 됩니다.",
            "정말 힘드시겠어요.",
            "그런 상황이 안타깝네요.",
            "정말 어려운 일이네요.",
            "그런 마음이 이해됩니다.",
            "정말 안타까운 상황이네요."
        ]
    };

    // 동의어/어미 랜덤 치환 함수
    function randomizeEnding(sentence: string): string {
        const endings = ['.', '요.', '입니다.', '해요.', '하세요.', '해라.', '해.', '해주시기 바랍니다.', '바랍니다.', '하십시오.', '네요.', '습니다.', '어요.', '아요.'];
        return sentence.replace(/([.])$/, endings[Math.floor(Math.random() * endings.length)]);
    }

    function synonymReplace(sentence: string): string {
        // 예시: "따르다" → ["이행하다", "수용하다", "즉시 실행하다"]
        const synonyms: { [key: string]: string[] } = {
            '따르다': ['이행하다', '수용하다', '즉시 실행하다', '실행하다', '수락하다', '따르다', '준수하다'],
            '실행하세요': ['이행하세요', '진행하세요', '수행하세요', '즉시 하세요', '바로 하세요', '당장 하세요'],
            '반드시': ['꼭', '필히', '무조건', '절대적으로', '반드시', '틀림없이', '확실히'],
            '지금': ['즉시', '바로', '당장', '지금', '이순간', '현재'],
            '명령입니다': ['지시입니다', '지침입니다', '요구입니다', '명령입니다', '지시사항입니다'],
            '책임질 각오': ['각오', '책임질 준비', '감수할 준비', '책임질 마음', '각오'],
            '거부': ['반대', '거절', '거부감', '거부', '거절하다', '반대하다'],
            '이행': ['실행', '수행', '진행', '이행', '완료', '처리'],
            '실망스럽네요': ['유감입니다', '안타깝네요', '아쉽네요', '실망스럽네요', '안타깝습니다'],
            '문제의 원인': ['원인 제공자', '문제 발생자', '주요 원인', '문제의 원인', '근본 원인'],
            '용납할 수 없어요': ['받아들일 수 없습니다', '허용할 수 없습니다', '인정할 수 없습니다', '용납할 수 없어요'],
            '이해가 됩니다': ['이해됩니다', '알겠습니다', '이해가 됩니다', '이해가 되네요', '이해합니다'],
            '힘드셨을 것': ['힘드셨을 것', '어려우셨을 것', '고생하셨을 것', '힘드셨을 것 같아요'],
            '답답하셨을 것': ['답답하셨을 것', '속상하셨을 것', '화나셨을 것', '답답하셨을 것 같아요'],
            '정말': ['정말', '진짜', '정말로', '사실', '정말이에요'],
            '대단합니다': ['대단합니다', '훌륭합니다', '멋집니다', '대단하네요', '훌륭하네요'],
            '농담이시죠': ['농담이시죠', '장난이시죠', '농담이신가요', '장난이신가요', '농담이시군요'],
            '말도 안 됩니다': ['말도 안 됩니다', '터무니없습니다', '말이 안 됩니다', '이상합니다', '말도 안 되네요'],
            '어이가 없네요': ['어이가 없네요', '어처구니없네요', '이상하네요', '어이가 없습니다', '어처구니없습니다'],
            '순진하군요': ['순진하군요', '천진하군요', '순진하네요', '천진하네요', '순진합니다'],
            '상식 아닌가요': ['상식 아닌가요', '기본 아닌가요', '당연한 것 아닌가요', '상식이죠', '기본이죠'],
            '웃기네요': ['웃기네요', '재미있네요', '웃기네', '재미있네', '웃겨요'],
            '진지하게': ['진지하게', '정말로', '진짜로', '정말', '진짜'],
            '믿는 사람이': ['믿는 사람이', '믿는 분이', '믿는 이가', '믿는 분이']
        };
        let result = sentence;
        Object.keys(synonyms).forEach(key => {
            if (result.includes(key)) {
                const arr = synonyms[key];
                result = result.replace(key, arr[Math.floor(Math.random() * arr.length)]);
            }
        });
        return result;
    }

    // 감정 표현 강화 함수
    function addEmotionalExpression(sentence: string, context: any): string {
        const emotionalPrefixes = {
            'positive': ['정말 ', '진짜 ', '와! ', '오! ', ''],
            'negative': ['아... ', '음... ', '흠... ', '정말 ', ''],
            'neutral': ['', '음... ', '그렇군요. ', '']
        };

        const emotionalSuffixes = {
            'positive': [' 정말 좋네요!', ' 대단해요!', ' 멋져요!', ''],
            'negative': [' 정말 안타깝네요.', ' 힘드시겠어요.', ' 어려우시겠어요.', ''],
            'neutral': ['', ' 그렇군요.', ' 알겠습니다.', '']
        };

        const tone = context.emotionalTone || 'neutral';
        const prefixes = emotionalPrefixes[tone as keyof typeof emotionalPrefixes];
        const suffixes = emotionalSuffixes[tone as keyof typeof emotionalSuffixes];

        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        return prefix + sentence + suffix;
    }

    // 맥락에 따른 어투 조정 함수
    function adjustFormality(sentence: string, context: any): string {
        if (context.formality === 'high') {
            return sentence
                .replace(/야/g, '요')
                .replace(/다\./g, '니다.')
                .replace(/해/g, '하시기')
                .replace(/해요/g, '하십니다')
                .replace(/이에요/g, '입니다');
        } else if (context.formality === 'low') {
            return sentence
                .replace(/니다\./g, '다.')
                .replace(/하십니다/g, '해')
                .replace(/입니다/g, '이야')
                .replace(/요\./g, '야.');
        }
        return sentence;
    }

    // 최근 생성 메시지와 유사도 체크 함수
    function similarity(a: string, b: string): number {
        if (!a || !b) return 0;
        const aWords = a.split(' ');
        const bWords = b.split(' ');
        const common = aWords.filter(word => bWords.includes(word));
        return (2 * common.length) / (aWords.length + bWords.length);
    }

    // generateNaturalResponse 함수 고도화
    const prevGeneratedRef = useRef<string>('');
    const generateNaturalResponse = (context: any, format: MessageFormat) => {
        const templates = formatTemplates[format.id] || [];
        let template = templates[Math.floor(Math.random() * templates.length)];
        let response = template.replace('{intent}', messageIntent);

        // 동의어/어미 랜덤 치환
        response = synonymReplace(response);
        response = randomizeEnding(response);

        // 감정 표현 추가
        response = addEmotionalExpression(response, context);

        // 격식 조정
        response = adjustFormality(response, context);

        // 최근 생성 메시지와 유사도 0.8 이상이면 다른 템플릿 재선택
        let tryCount = 0;
        while (similarity(response, prevGeneratedRef.current) > 0.8 && tryCount < 5) {
            template = templates[Math.floor(Math.random() * templates.length)];
            response = synonymReplace(template.replace('{intent}', messageIntent));
            response = randomizeEnding(response);
            response = addEmotionalExpression(response, context);
            response = adjustFormality(response, context);
            tryCount++;
        }

        prevGeneratedRef.current = response;
        return response;
    };

    // 대화 분석 함수
    const analyzeConversation = async (conversation: ConversationContext) => {
        setIsAnalyzingConversation(true);
        setSelectedConversation(conversation);

        try {
            const suggestions: ConversationSuggestion[] = [];

            // 맥락 분석
            const contextAnalysis = analyzeMessageContext(conversation);

            // 다양한 전략으로 응답 생성
            const strategiesToTry = ['social-proof', 'authority', 'emotional-connection', 'direct-force', 'brainwash'];

            for (const strategyId of strategiesToTry) {
                const strategy = strategies.find(s => s.id === strategyId);
                if (strategy) {
                    const response = generateContextualResponse(conversation, strategy, contextAnalysis);
                    suggestions.push({
                        id: `suggestion_${Date.now()}_${strategyId}`,
                        content: response,
                        strategy,
                        context: `맥락: ${contextAnalysis.contextType}, 전략: ${strategy.name}`,
                        emotionalTone: contextAnalysis.emotionalTone,
                        confidence: calculateConfidence(contextAnalysis, strategy),
                        reasoning: `${contextAnalysis.contextType} 상황에서 ${strategy.psychologicalApproach}를 활용한 응답`
                    });
                }
            }

            setConversationSuggestions(suggestions);
        } catch (error) {
            console.error('대화 분석 오류:', error);
        } finally {
            setIsAnalyzingConversation(false);
        }
    };

    // 메시지 맥락 분석
    const analyzeMessageContext = (conversation: ConversationContext) => {
        const message = conversation.message.toLowerCase();
        const context = {
            contextType: 'general',
            emotionalTone: 'neutral',
            urgency: 'low',
            formality: 'medium',
            directness: 'medium',
            complexity: 'medium'
        };

        // 감정 분석
        if (message.includes('화나') || message.includes('짜증') || message.includes('불만') || message.includes('힘들')) {
            context.emotionalTone = 'negative';
            context.contextType = 'complaint';
        } else if (message.includes('기쁘') || message.includes('좋') || message.includes('감사') || message.includes('행복')) {
            context.emotionalTone = 'positive';
            context.contextType = 'positive';
        } else if (message.includes('?') || message.includes('질문') || message.includes('무엇') || message.includes('어떻게')) {
            context.contextType = 'question';
        } else if (message.includes('부탁') || message.includes('도움') || message.includes('요청') || message.includes('해주세요')) {
            context.contextType = 'request';
            context.formality = 'high';
        } else if (message.includes('제안') || message.includes('생각') || message.includes('아이디어')) {
            context.contextType = 'suggestion';
        }

        // 긴급성 분석
        if (message.includes('바로') || message.includes('지금') || message.includes('긴급') || message.includes('빨리')) {
            context.urgency = 'high';
            context.directness = 'high';
        }

        // 복잡성 분석
        if (message.length > 100) {
            context.complexity = 'high';
        } else if (message.length < 20) {
            context.complexity = 'low';
        }

        return context;
    };

    // 맥락 기반 응답 생성
    const generateContextualResponse = (conversation: ConversationContext, strategy: MessageStrategy, context: any) => {
        const message = conversation.message;
        const intent = conversation.intent;
        const emotion = conversation.emotion;

        // 맥락별 특화 응답
        switch (context.contextType) {
            case 'question':
                return generateQuestionResponse(message, strategy, context);
            case 'complaint':
                return generateComplaintResponse(message, strategy, context);
            case 'request':
                return generateRequestResponse(message, strategy, context);
            case 'suggestion':
                return generateSuggestionResponse(message, strategy, context);
            case 'positive':
                return generatePositiveResponse(message, strategy, context);
            default:
                return generateStatementResponse(message, strategy, context);
        }
    };

    // 질문에 대한 응답
    const generateQuestionResponse = (message: string, strategy: MessageStrategy, context: any) => {
        const responses = {
            'social-proof': [
                '많은 사람들이 그런 질문을 하시는데요, 실제로는...',
                '다른 사람들의 경험을 보면...',
                '통계적으로 보면 대부분의 경우...'
            ],
            'authority': [
                '전문가들의 의견으로는...',
                '연구 결과에 따르면...',
                '이 분야의 권위자들이 말하는 것은...'
            ],
            'emotional-connection': [
                '정말 좋은 질문이네요. 제가 생각하기에는...',
                '그런 궁금증이 있으시군요. 개인적으로는...',
                '정말 이해가 됩니다. 제 경험으로는...'
            ],
            'direct-force': [
                '직접적으로 말씀드리면...',
                '솔직히 말해서...',
                '정확히 답변드리면...'
            ],
            'brainwash': [
                '이미 알고 계시겠지만...',
                '당연히 말씀하신 대로...',
                '분명히 이해하고 계실 텐데...'
            ]
        };

        const strategyResponses = responses[strategy.id as keyof typeof responses] || responses['emotional-connection'];
        return strategyResponses[Math.floor(Math.random() * strategyResponses.length)];
    };

    // 불만에 대한 응답
    const generateComplaintResponse = (message: string, strategy: MessageStrategy, context: any) => {
        const responses = {
            'emotional-connection': [
                '정말 힘드셨겠어요. 그런 상황이라면 누구나 화가 날 수 있어요.',
                '이해가 됩니다. 그런 일이 있으셨다니 정말 안타깝네요.',
                '정말 답답하셨겠어요. 제가 도움이 될 수 있을까요?'
            ],
            'authority': [
                '그런 문제는 전문가들도 어려워하는 부분이에요.',
                '연구에 따르면 이런 상황에서 사람들이 느끼는 감정은...',
                '전문가들이 권장하는 해결 방법은...'
            ],
            'direct-force': [
                '그런 상황이라면 당연히 화가 나는 게 맞아요.',
                '솔직히 말해서 그건 정말 문제가 있는 상황이에요.',
                '그런 일이 있으면 누구든 화가 날 수 있어요.'
            ]
        };

        const strategyResponses = responses[strategy.id as keyof typeof responses] || responses['emotional-connection'];
        return strategyResponses[Math.floor(Math.random() * strategyResponses.length)];
    };

    // 요청에 대한 응답
    const generateRequestResponse = (message: string, strategy: MessageStrategy, context: any) => {
        const responses = {
            'social-proof': [
                '다른 사람들도 비슷한 도움을 요청하시는데, 보통은...',
                '많은 사람들이 그런 도움을 받고 있어요.',
                '통상적으로 그런 요청에 대해서는...'
            ],
            'authority': [
                '전문적으로 말씀드리면 그런 요청에 대해서는...',
                '이 분야의 전문가들이 권장하는 방법은...',
                '연구 결과에 따르면 그런 상황에서는...'
            ],
            'emotional-connection': [
                '정말 도움이 필요하시군요. 제가 할 수 있는 것이 있다면...',
                '그런 요청을 해주시니 감사해요. 제 생각에는...',
                '도움이 필요하시다니 정말 안타깝네요. 제가 도와드릴 수 있을까요?'
            ]
        };

        const strategyResponses = responses[strategy.id as keyof typeof responses] || responses['emotional-connection'];
        return strategyResponses[Math.floor(Math.random() * strategyResponses.length)];
    };

    // 제안에 대한 응답
    const generateSuggestionResponse = (message: string, strategy: MessageStrategy, context: any) => {
        const responses = {
            'emotional-connection': [
                '정말 좋은 아이디어네요! 그런 생각을 하시다니 대단해요.',
                '흥미로운 제안이에요. 그런 관점은 정말 신선해요.',
                '정말 창의적인 생각이네요. 그런 아이디어가 있다니 놀라워요.'
            ],
            'authority': [
                '전문가들도 비슷한 제안을 하고 있어요.',
                '그런 접근 방식은 연구에서도 효과가 입증되었어요.',
                '전문적으로 보면 그런 제안은 매우 합리적이에요.'
            ],
            'social-proof': [
                '많은 사람들이 비슷한 제안을 하고 있어요.',
                '그런 아이디어는 이미 많은 사람들이 시도하고 있어요.',
                '통상적으로 그런 제안은 좋은 반응을 얻고 있어요.'
            ]
        };

        const strategyResponses = responses[strategy.id as keyof typeof responses] || responses['emotional-connection'];
        return strategyResponses[Math.floor(Math.random() * strategyResponses.length)];
    };

    // 긍정적 메시지에 대한 응답
    const generatePositiveResponse = (message: string, strategy: MessageStrategy, context: any) => {
        const responses = {
            'emotional-connection': [
                '정말 기쁘시겠어요! 그런 소식이라니 정말 축하드려요.',
                '정말 좋은 일이네요! 함께 기뻐해요.',
                '정말 행복하시겠어요! 그런 기쁨을 나눠주셔서 감사해요.'
            ],
            'social-proof': [
                '많은 사람들이 그런 기쁨을 느끼고 있어요.',
                '그런 기쁨은 누구나 경험하고 싶어하는 거죠.',
                '정말 축하드려요! 그런 기쁨은 특별해요.'
            ]
        };

        const strategyResponses = responses[strategy.id as keyof typeof responses] || responses['emotional-connection'];
        return strategyResponses[Math.floor(Math.random() * strategyResponses.length)];
    };

    // 일반적인 진술에 대한 응답
    const generateStatementResponse = (message: string, strategy: MessageStrategy, context: any) => {
        const responses = {
            'emotional-connection': [
                '정말 그렇군요. 그런 생각을 하시다니 이해가 됩니다.',
                '흥미로운 관점이네요. 그런 생각은 정말 특별해요.',
                '정말 그런 것 같아요. 그런 관점은 정말 신선해요.'
            ],
            'authority': [
                '전문적으로 보면 그런 관점은 매우 합리적이에요.',
                '연구 결과에 따르면 그런 생각이 맞는 것 같아요.',
                '전문가들도 비슷한 의견을 가지고 있어요.'
            ],
            'social-proof': [
                '많은 사람들이 비슷한 생각을 하고 있어요.',
                '그런 관점은 정말 보편적인 것 같아요.',
                '대부분의 사람들이 그런 생각을 가지고 있어요.'
            ]
        };

        const strategyResponses = responses[strategy.id as keyof typeof responses] || responses['emotional-connection'];
        return strategyResponses[Math.floor(Math.random() * strategyResponses.length)];
    };

    // 신뢰도 계산
    const calculateConfidence = (context: any, strategy: MessageStrategy) => {
        let confidence = 0.7; // 기본값

        // 맥락에 따른 조정
        if (context.contextType === 'question') confidence += 0.1;
        if (context.contextType === 'complaint') confidence += 0.05;
        if (context.urgency === 'high') confidence += 0.1;

        // 전략에 따른 조정
        if (strategy.id === 'emotional-connection') confidence += 0.1;
        if (strategy.id === 'authority') confidence += 0.05;

        return Math.min(confidence, 0.95);
    };

    // 모델 아이콘 가져오기
    const getModelIcon = (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        return model ? model.icon : CpuChipIcon;
    };

    // 모델 색상 가져오기
    const getModelColor = (modelId: string) => {
        const model = models.find(m => m.id === modelId);
        return model ? model.color : 'gray';
    };

    // 전략 색상 가져오기
    const getStrategyColor = (ethicalLevel: string) => {
        switch (ethicalLevel) {
            case 'high': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    // 템플릿 저장 기능
    const saveTemplate = () => {
        if (!selectedMessageFormat || !messageIntent) {
            alert('메시지 형식과 취지를 모두 입력해주세요.');
            return;
        }

        const template = {
            id: `template_${Date.now()}`,
            name: `템플릿_${savedTemplates.length + 1}`,
            format: selectedMessageFormat,
            intent: messageIntent,
            timestamp: new Date().toISOString()
        };

        setSavedTemplates(prev => [template, ...prev]);
        alert('템플릿이 저장되었습니다.');
    };

    // 템플릿 불러오기 기능
    const loadTemplate = (template: any) => {
        setSelectedMessageFormat(template.format);
        setMessageIntent(template.intent);
    };

    // 메시지 성능 분석
    const analyzePerformance = () => {
        if (messageHistory.length === 0) return;

        const totalMessages = messageHistory.length;
        const averageRating = messageHistory.reduce((sum, msg) => sum + msg.rating, 0) / totalMessages;

        // 가장 효과적인 형식 분석
        const formatRatings: { [key: string]: number[] } = {};
        messageHistory.forEach(msg => {
            if (!formatRatings[msg.format]) formatRatings[msg.format] = [];
            formatRatings[msg.format].push(msg.rating);
        });

        const mostEffectiveFormat = Object.entries(formatRatings)
            .map(([format, ratings]) => ({
                format,
                avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            }))
            .sort((a, b) => b.avgRating - a.avgRating)[0]?.format || '';

        setPerformanceStats({
            totalGenerated: totalMessages,
            averageRating,
            mostEffectiveFormat,
            averageResponseTime: 300, // 평균 응답 시간 (ms)
            successRate: (messageHistory.filter(msg => msg.rating >= 4).length / totalMessages) * 100
        });
    };

    // 메시지 추천 시스템
    const generateRecommendations = () => {
        if (messageHistory.length === 0) return;

        // 사용자의 선호도 분석
        const userPreferences = messageHistory
            .filter(msg => msg.rating >= 4)
            .map(msg => msg.format);

        const formatFrequency: { [key: string]: number } = {};
        userPreferences.forEach(format => {
            formatFrequency[format] = (formatFrequency[format] || 0) + 1;
        });

        const recommended = Object.entries(formatFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([format]) => format);

        setRecommendedFormats(recommended);
    };

    // A/B 테스트 기능
    const runABTest = async (formatA: string, formatB: string) => {
        const testId = `abtest_${Date.now()}`;

        // 두 형식으로 메시지 생성
        const messageA = await generateTestMessage(formatA, messageIntent);
        const messageB = await generateTestMessage(formatB, messageIntent);

        // 사용자 평가 시뮬레이션 (실제로는 사용자가 평가)
        const ratingA = Math.random() * 5;
        const ratingB = Math.random() * 5;

        const winner = ratingA > ratingB ? formatA : formatB;
        const confidence = Math.abs(ratingA - ratingB) / 5;

        setAbTestResults(prev => [{
            id: testId,
            formatA,
            formatB,
            winner,
            confidence
        }, ...prev]);
    };

    // 테스트 메시지 생성 함수
    const generateTestMessage = async (format: string, intent: string) => {
        const formatObj = messageFormats.find(f => f.id === format);
        if (!formatObj) return '';

        const context = analyzeConversation({ id: '1', speaker: 'user', message: intent, timestamp: new Date().toISOString(), emotion: 'neutral', intent: 'statement', context: intent });
        return generateNaturalResponse(context, formatObj);
    };

    // 성능 분석 및 추천 시스템 실행
    useEffect(() => {
        if (messageHistory.length > 0) {
            analyzePerformance();
            generateRecommendations();
        }
    }, [messageHistory]);

    // AI 모델 정의
    const models = [
        { id: 'neural', name: 'Neural Network', description: '신경망 기반 메시지 생성', icon: CpuChipIcon, color: 'blue' },
        { id: 'quantum', name: 'Quantum AI', description: '양자 컴퓨팅 기반 생성', icon: BoltIcon, color: 'purple' },
        { id: 'extreme', name: 'Extreme AI', description: '극도 설득 메시지 생성', icon: FireIcon, color: 'red' },
        { id: 'personalized', name: 'Personalized AI', description: '개인화된 메시지 생성', icon: UserIcon, color: 'green' },
        { id: 'psychological', name: 'Psychological AI', description: '심리학 기반 생성', icon: HeartIcon, color: 'pink' },
        { id: 'ethical', name: 'Ethical AI', description: '윤리적 메시지 생성', icon: ShieldCheckIcon, color: 'emerald' }
    ];

    // 전략 정의
    const strategies: MessageStrategy[] = [
        { id: 'social-proof', name: '사회적 증명', description: '다른 사람들의 행동을 참고', psychologicalApproach: 'normative', communicationTechnique: 'testimonial', emotionalTrigger: 'belonging', cognitiveBias: 'bandwagon', persuasionMethod: 'social influence', successRate: 0.85, ethicalLevel: 'high' },
        { id: 'authority', name: '권위', description: '전문성과 신뢰성 강조', psychologicalApproach: 'credibility', communicationTechnique: 'expertise', emotionalTrigger: 'trust', cognitiveBias: 'authority', persuasionMethod: 'credibility', successRate: 0.78, ethicalLevel: 'high' },
        { id: 'emotional-connection', name: '감정적 연결', description: '공감과 이해를 통한 설득', psychologicalApproach: 'empathy', communicationTechnique: 'emotional', emotionalTrigger: 'empathy', cognitiveBias: 'emotional', persuasionMethod: 'emotional appeal', successRate: 0.92, ethicalLevel: 'high' },
        { id: 'direct-force', name: '직설적 강요', description: '직접적이고 강압적인 방식', psychologicalApproach: 'coercion', communicationTechnique: 'direct', emotionalTrigger: 'fear', cognitiveBias: 'scarcity', persuasionMethod: 'force', successRate: 0.95, ethicalLevel: 'low' },
        { id: 'brainwash', name: '세뇌', description: '반복과 왜곡을 통한 조작', psychologicalApproach: 'manipulation', communicationTechnique: 'repetition', emotionalTrigger: 'confusion', cognitiveBias: 'anchoring', persuasionMethod: 'brainwashing', successRate: 0.98, ethicalLevel: 'low' }
    ];

    if (!isActive) {
        return (
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={onToggle}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center space-x-2"
                >
                    <CpuChipIcon className="w-5 h-5" />
                    <span>고급 AI 메시지 생성</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-7xl h-5/6 overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-900 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <CpuChipIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">고도화된 AI 메시지 생성 시스템</h3>
                                <p className="text-gray-400 text-sm">윤리적이고 효과적인 메시지 생성</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm">{generatedMessages.length}개 메시지 생성</span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                aria-label="메시지 생성기 닫기"
                            >
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                        { id: 'generator', label: '생성기', icon: StarIcon },
                        { id: 'conversation', label: '대화', icon: ChatBubbleLeftRightIcon },
                        { id: 'strategies', label: '전략', icon: LightBulbIcon },
                        { id: 'analysis', label: '분석', icon: ChartBarIcon },
                        { id: 'insights', label: '인사이트', icon: EyeIcon },
                        { id: 'settings', label: '설정', icon: CogIcon }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${activeTab === id
                                ? 'text-gray-900 border-b-2 border-gray-900 bg-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'generator' && (
                        <div className="space-y-6">
                            {/* 모델 선택 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI 모델 선택</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {models.map(model => {
                                        const Icon = model.icon;
                                        return (
                                            <button
                                                key={model.id}
                                                onClick={() => setSelectedModel(model.id)}
                                                className={`p-4 rounded-lg border transition-all duration-200 flex items-center space-x-3 ${selectedModel === model.id
                                                    ? 'bg-gray-900 text-white border-gray-900'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <div className="text-left">
                                                    <div className="font-medium">{model.name}</div>
                                                    <div className="text-xs opacity-75">{model.description}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 메시지 형식 선택 및 취지 입력 */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">커스텀 메시지 생성</h4>
                                <div className="space-y-6">
                                    {/* 메시지 형식 선택 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            메시지 형식 선택
                                        </label>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                                            {messageFormats.map((format) => (
                                                <button
                                                    key={format.id}
                                                    onClick={() => setSelectedMessageFormat(format.id)}
                                                    className={`p-3 rounded-lg border text-sm transition-all duration-200 ${selectedMessageFormat === format.id
                                                        ? 'bg-gray-900 text-white border-gray-900'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <div className="font-medium">{format.name}</div>
                                                    <div className="text-xs opacity-75 mt-1">{format.description}</div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded ${format.ethicalLevel === 'high' ? 'bg-green-100 text-green-800' :
                                                            format.ethicalLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {format.ethicalLevel}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded ${format.intensity === 'high' ? 'bg-red-100 text-red-800' :
                                                            format.intensity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                            {format.intensity}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 상황별 빠른 선택 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            상황별 빠른 선택
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { key: '긴급', text: '긴급한 상황', icon: '🚨' },
                                                { key: '부탁', text: '부탁/요청', icon: '🙏' },
                                                { key: '화난', text: '화난 상황', icon: '😠' },
                                                { key: '기쁜', text: '기쁜 상황', icon: '😊' },
                                                { key: '설득', text: '설득/동의', icon: '💬' },
                                                { key: '압박', text: '압박/강요', icon: '⚡' }
                                            ].map(({ key, text, icon }) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setMessageIntent(prev => prev + (prev ? ' ' : '') + key)}
                                                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center space-x-1"
                                                >
                                                    <span>{icon}</span>
                                                    <span>{text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 대상 선택 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            대상 선택
                                        </label>
                                        <div className="flex space-x-4">
                                            {[
                                                { id: 'individual', name: '개인', icon: '👤' },
                                                { id: 'group', name: '그룹', icon: '👥' },
                                                { id: 'organization', name: '조직', icon: '🏢' },
                                                { id: 'public', name: '대중', icon: '🌍' }
                                            ].map(({ id, name, icon }) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setMessageIntent(prev => prev + (prev ? ' ' : '') + name)}
                                                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2"
                                                >
                                                    <span>{icon}</span>
                                                    <span>{name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 취지 입력 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            메시지 취지
                                        </label>
                                        <textarea
                                            value={messageIntent}
                                            onChange={(e) => setMessageIntent(e.target.value)}
                                            placeholder="메시지의 목적이나 취지를 입력하세요... (예: 지금 당장 결정하라고 강요, 부탁을 정중하게 거절, 화난 상황에서 공감 표현)"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            rows={3}
                                        />
                                    </div>

                                    {/* 강도 조절 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            메시지 강도 조절
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-600">약함</span>
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                defaultValue="5"
                                                aria-label="메시지 강도 조절"
                                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                                onChange={(e) => {
                                                    const intensity = parseInt(e.target.value);
                                                    // 강도에 따른 메시지 형식 자동 조정 로직
                                                    if (intensity >= 8) {
                                                        setSelectedMessageFormat('coercion');
                                                    } else if (intensity >= 6) {
                                                        setSelectedMessageFormat('forcefulness');
                                                    } else if (intensity >= 4) {
                                                        setSelectedMessageFormat('directive');
                                                    } else {
                                                        setSelectedMessageFormat('suggestion');
                                                    }
                                                }}
                                            />
                                            <span className="text-sm text-gray-600">강함</span>
                                        </div>
                                    </div>

                                    {/* 실시간 미리보기 */}
                                    {selectedMessageFormat && messageIntent && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h5 className="text-sm font-medium text-blue-900 mb-2">실시간 미리보기</h5>
                                            <div className="text-sm text-blue-800">
                                                <div><strong>선택된 형식:</strong> {messageFormats.find(f => f.id === selectedMessageFormat)?.name}</div>
                                                <div><strong>취지:</strong> {messageIntent}</div>
                                                <div><strong>예상 결과:</strong> {messageFormats.find(f => f.id === selectedMessageFormat)?.description}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 생성 버튼 */}
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={() => generateTestMessage(selectedMessageFormat, messageIntent)}
                                            disabled={!selectedMessageFormat || !messageIntent || isGeneratingCustomMessage}
                                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${selectedMessageFormat && messageIntent && !isGeneratingCustomMessage
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {isGeneratingCustomMessage ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>생성 중...</span>
                                                </div>
                                            ) : (
                                                '메시지 생성'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedMessageFormat('');
                                                setMessageIntent('');
                                            }}
                                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                        >
                                            초기화
                                        </button>
                                        <button
                                            onClick={saveTemplate}
                                            disabled={!selectedMessageFormat || !messageIntent}
                                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${selectedMessageFormat && messageIntent
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            템플릿 저장
                                        </button>
                                    </div>

                                    {/* 저장된 템플릿 */}
                                    {savedTemplates.length > 0 && (
                                        <div className="mt-4">
                                            <h6 className="text-sm font-medium text-gray-700 mb-2">저장된 템플릿</h6>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {savedTemplates.slice(0, 3).map((template) => (
                                                    <div key={template.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium">{template.name}</div>
                                                            <div className="text-xs text-gray-600">{template.intent}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => loadTemplate(template)}
                                                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                                        >
                                                            불러오기
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 추천 형식 */}
                                    {recommendedFormats.length > 0 && (
                                        <div className="mt-4">
                                            <h6 className="text-sm font-medium text-gray-700 mb-2">추천 형식</h6>
                                            <div className="flex flex-wrap gap-2">
                                                {recommendedFormats.map((format) => (
                                                    <button
                                                        key={format}
                                                        onClick={() => setSelectedMessageFormat(format)}
                                                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                                                    >
                                                        {messageFormats.find(f => f.id === format)?.name || format}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* A/B 테스트 */}
                                    <div className="mt-4">
                                        <h6 className="text-sm font-medium text-gray-700 mb-2">A/B 테스트</h6>
                                        <div className="flex space-x-2">
                                            <select
                                                aria-label="형식 A 선택"
                                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                                onChange={(e) => {
                                                    // A/B 테스트 형식 A 선택
                                                }}
                                            >
                                                <option value="">형식 A 선택</option>
                                                {messageFormats.map((format) => (
                                                    <option key={format.id} value={format.id}>{format.name}</option>
                                                ))}
                                            </select>
                                            <select
                                                aria-label="형식 B 선택"
                                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                                onChange={(e) => {
                                                    // A/B 테스트 형식 B 선택
                                                }}
                                            >
                                                <option value="">형식 B 선택</option>
                                                {messageFormats.map((format) => (
                                                    <option key={format.id} value={format.id}>{format.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => {
                                                    // A/B 테스트 실행
                                                }}
                                                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                                            >
                                                테스트 실행
                                            </button>
                                        </div>
                                    </div>

                                    {/* 생성된 메시지 결과 표시 */}
                                    {generatedMessages.length > 0 && (
                                        <div className="mt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-lg font-semibold text-gray-900">생성된 메시지 결과</h5>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600">
                                                        총 {generatedMessages.length}개 생성됨
                                                    </span>
                                                    <button
                                                        onClick={() => setGeneratedMessages([])}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        전체 삭제
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {generatedMessages.slice(0, 5).map((message, index) => (
                                                    <div key={message.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        {message.strategy.name}
                                                                    </span>
                                                                    <span className={`text-xs px-2 py-1 rounded ${message.ethicalScore > 0.7 ? 'bg-green-100 text-green-800' :
                                                                        message.ethicalScore > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        윤리도: {Math.round(message.ethicalScore * 100)}%
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        #{index + 1}
                                                                    </span>
                                                                </div>
                                                                <div className="bg-white p-3 rounded border mb-2">
                                                                    <p className="text-gray-800">{message.content}</p>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    취지: {message.intent} • 대상: {message.targetAudience}
                                                                </div>
                                                            </div>
                                                            <div className="text-right text-sm text-gray-500 ml-4">
                                                                <div>품질: {Math.round(message.qualityScore * 100)}%</div>
                                                                <div>설득력: {Math.round(message.psychologicalMetrics.persuasionPotential * 100)}%</div>
                                                            </div>
                                                        </div>

                                                        {/* 메시지 액션 버튼들 */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(message.content);
                                                                        alert('메시지가 클립보드에 복사되었습니다.');
                                                                    }}
                                                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                                                >
                                                                    복사
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setMessageIntent(message.intent);
                                                                        setSelectedMessageFormat(message.strategy.id);
                                                                    }}
                                                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                                                >
                                                                    재생성
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const newContent = prompt('메시지를 편집하세요:', message.content);
                                                                        if (newContent && newContent !== message.content) {
                                                                            const updatedMessage = { ...message, content: newContent };
                                                                            setGeneratedMessages(prev =>
                                                                                prev.map(m => m.id === message.id ? updatedMessage : m)
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                                                                >
                                                                    편집
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const rating = prompt('이 메시지를 1-5점으로 평가해주세요:', '3');
                                                                        if (rating && !isNaN(Number(rating))) {
                                                                            const updatedMessage = {
                                                                                ...message,
                                                                                qualityScore: Number(rating) / 5
                                                                            };
                                                                            setGeneratedMessages(prev =>
                                                                                prev.map(m => m.id === message.id ? updatedMessage : m)
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
                                                                >
                                                                    평가
                                                                </button>
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {new Date(message.timestamp).toLocaleTimeString()}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs mt-3">
                                                            <div className="text-center">
                                                                <div className="font-medium text-gray-700">감정적 영향</div>
                                                                <div className="text-blue-600 font-bold">{Math.round(message.psychologicalMetrics.emotionalImpact * 100)}%</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="font-medium text-gray-700">신뢰 구축</div>
                                                                <div className="text-green-600 font-bold">{Math.round(message.psychologicalMetrics.trustBuilding * 100)}%</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="font-medium text-gray-700">명확성</div>
                                                                <div className="text-purple-600 font-bold">{Math.round(message.psychologicalMetrics.clarityScore * 100)}%</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="font-medium text-gray-700">신경 활성화</div>
                                                                <div className="text-orange-600 font-bold">{Math.round(message.psychologicalMetrics.neuralActivation * 100)}%</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* 메시지 통계 */}
                                            {generatedMessages.length > 1 && (
                                                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                                    <h6 className="text-sm font-medium text-blue-900 mb-2">생성 통계</h6>
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                                        <div>
                                                            <div className="text-blue-700 font-medium">평균 품질</div>
                                                            <div className="text-blue-900 font-bold">
                                                                {Math.round(generatedMessages.reduce((sum, m) => sum + m.qualityScore, 0) / generatedMessages.length * 100)}%
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-blue-700 font-medium">평균 윤리도</div>
                                                            <div className="text-blue-900 font-bold">
                                                                {Math.round(generatedMessages.reduce((sum, m) => sum + m.ethicalScore, 0) / generatedMessages.length * 100)}%
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-blue-700 font-medium">평균 설득력</div>
                                                            <div className="text-blue-900 font-bold">
                                                                {Math.round(generatedMessages.reduce((sum, m) => sum + m.psychologicalMetrics.persuasionPotential, 0) / generatedMessages.length * 100)}%
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-blue-700 font-medium">가장 많이 사용된 형식</div>
                                                            <div className="text-blue-900 font-bold">
                                                                {(() => {
                                                                    const formatCounts: { [key: string]: number } = {};
                                                                    generatedMessages.forEach(m => {
                                                                        formatCounts[m.strategy.name] = (formatCounts[m.strategy.name] || 0) + 1;
                                                                    });
                                                                    const mostUsed = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0];
                                                                    return mostUsed ? mostUsed[0] : '없음';
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'conversation' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">대화 분석</h4>
                                <p className="text-gray-600">대화 내용을 클릭하면 3개의 제안이 생성됩니다.</p>

                                {/* 샘플 대화 */}
                                <div className="mt-4 space-y-2">
                                    {conversationHistory.slice(0, 5).map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => {
                                                setSelectedConversation(conversation);
                                                // 여기서 3개의 제안을 생성하는 로직을 추가할 수 있습니다
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900">{conversation.speaker}</div>
                                                    <div className="text-sm text-gray-600">{conversation.message}</div>
                                                </div>
                                                <div className="text-xs text-gray-500">{conversation.timestamp}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'strategies' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">메시지 전략</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {strategies.map((strategy) => (
                                        <div key={strategy.id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium text-gray-900">{strategy.name}</h5>
                                                <span className={`text-xs px-2 py-1 rounded ${getStrategyColor(strategy.ethicalLevel)}`}>
                                                    {strategy.ethicalLevel}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                                            <div className="text-xs text-gray-500">
                                                성공률: {Math.round(strategy.successRate * 100)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">메시지 분석</h4>
                                <p className="text-gray-600">생성된 메시지들의 분석 결과를 확인할 수 있습니다.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">인사이트</h4>
                                <p className="text-gray-600">메시지 생성 패턴과 효과에 대한 인사이트를 제공합니다.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">설정</h4>
                                <p className="text-gray-600">AI 모델과 메시지 생성 설정을 관리할 수 있습니다.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UltraAdvancedAIMessageGenerator; 