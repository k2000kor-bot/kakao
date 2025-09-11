import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Paper,
    Grid,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Psychology,
    QuestionAnswer,
    ThumbUp,
    ThumbDown,
    Help,
    Feedback,
    Speed,
    Analytics
} from '@mui/icons-material';

interface QuickActionsProps {
    onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    const quickActions = [
        {
            id: 'emotion_test',
            title: '감정 분석 테스트',
            description: '다양한 감정 표현을 테스트해보세요',
            icon: <Psychology />,
            color: '#4caf50',
            examples: [
                '정말 좋은 하루예요!',
                '너무 화가 나네요...',
                '그냥 평범한 하루입니다.'
            ]
        },
        {
            id: 'intent_test',
            title: '의도 분석 테스트',
            description: '다양한 의도를 가진 메시지를 테스트해보세요',
            icon: <QuestionAnswer />,
            color: '#2196f3',
            examples: [
                '이 기능은 어떻게 사용하나요?',
                '도와주세요!',
                '감사합니다!'
            ]
        },
        {
            id: 'performance_test',
            title: '성능 테스트',
            description: '시스템 성능을 확인해보세요',
            icon: <Speed />,
            color: '#ff9800',
            examples: [
                '시스템이 빠르게 작동하나요?',
                '응답 시간을 측정해주세요',
                '성능을 확인하고 싶어요'
            ]
        },
        {
            id: 'feedback_test',
            title: '피드백 테스트',
            description: '긍정적/부정적 피드백을 테스트해보세요',
            icon: <Feedback />,
            color: '#9c27b0',
            examples: [
                '정말 훌륭한 서비스네요!',
                '개선이 필요해 보여요',
                '완벽합니다!'
            ]
        }
    ];

    const handleActionClick = (actionId: string, example: string) => {
        setSelectedAction(actionId);
        onActionClick(example);
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Analytics />
                빠른 테스트 액션
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                다양한 AI 분석 기능을 빠르게 테스트해보세요
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                {quickActions.map((action) => (
                    <Box key={action.id}>
                        <Card
                            sx={{
                                height: '100%',
                                border: selectedAction === action.id ? `2px solid ${action.color}` : '1px solid #e0e0e0',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Box sx={{ color: action.color }}>
                                        {action.icon}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                        {action.title}
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {action.description}
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {action.examples.map((example, index) => (
                                        <Button
                                            key={index}
                                            variant={selectedAction === action.id ? "contained" : "outlined"}
                                            size="small"
                                            onClick={() => handleActionClick(action.id, example)}
                                            sx={{
                                                justifyContent: 'flex-start',
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                minHeight: '32px',
                                                bgcolor: selectedAction === action.id ? action.color : 'transparent',
                                                color: selectedAction === action.id ? 'white' : action.color,
                                                borderColor: action.color,
                                                '&:hover': {
                                                    bgcolor: selectedAction === action.id ? action.color : `${action.color}20`,
                                                    borderColor: action.color
                                                }
                                            }}
                                        >
                                            {example}
                                        </Button>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

            {selectedAction && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        💡 선택된 액션: {quickActions.find(a => a.id === selectedAction)?.title}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default QuickActions;