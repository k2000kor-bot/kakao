import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Tabs, Tab, Paper } from '@mui/material';
import UltimateChatGPTInterface from './components/UltimateChatGPTInterface';
import IntegratedAIChat from './components/IntegratedAIChat';
import AnalyticsDashboard from './components/AnalyticsDashboard';

// 테마 생성
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

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
      {value === index && <Box sx={{ height: '100vh' }}>{children}</Box>}
    </div>
  );
}

const App: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ borderRadius: 0, boxShadow: 1 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="CORBU AI 인터페이스 탭"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="기본 채팅" />
            <Tab label="통합 AI 채팅" />
            <Tab label="분석 대시보드" />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <UltimateChatGPTInterface />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <IntegratedAIChat />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AnalyticsDashboard />
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
};

export default App;

