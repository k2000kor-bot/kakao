import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Tabs, Tab, Paper } from '@mui/material';
import SimpleChatInterface from './components/SimpleChatInterface';
import TestComponent from './components/TestComponent';
import IntegratedAPIDemo from './components/IntegratedAPIDemo';
import AuthWrapper from './components/AuthWrapper';

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
              <Tab label="🚀 통합 API" />
              <Tab label="테스트" />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <SimpleChatInterface />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <IntegratedAPIDemo />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <TestComponent />
          </TabPanel>
        </Box>
      </ThemeProvider>
    </AuthWrapper>
  );
};

export default App;

