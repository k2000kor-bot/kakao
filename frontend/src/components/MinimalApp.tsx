import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Tabs, Tab, Paper, Typography } from '@mui/material';
import SimpleChatInterface from './SimpleChatInterface';
import TestComponent from './TestComponent';
import AuthWrapper from './AuthWrapper';

// 테마 생성
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

// TabPanel 컴포넌트
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const MinimalApp: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <AuthWrapper>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Paper sx={{ borderRadius: 0, boxShadow: 1 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="CORBU AI 인터페이스 탭"
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="🤖 CORBU AI 채팅" />
                            <Tab label="테스트" />
                        </Tabs>
                    </Paper>

                    <TabPanel value={tabValue} index={0}>
                        <SimpleChatInterface />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <TestComponent />
                    </TabPanel>
                </Box>
            </ThemeProvider>
        </AuthWrapper>
    );
};

export default MinimalApp;
