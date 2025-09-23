import React from 'react';
import { Box, Typography } from '@mui/material';

const TestComponent: React.FC = () => {
    return (
        <Box>
            <Typography variant="h6">테스트 컴포넌트</Typography>
            <Typography variant="body2">이 컴포넌트는 정상적으로 작동합니다.</Typography>
        </Box>
    );
};

export default TestComponent;
