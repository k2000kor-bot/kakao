/**
 * 통합 API 사용 예시 컴포넌트
 */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { useIntegratedAPI } from '../hooks/useIntegratedAPI';

const IntegratedAPIDemo: React.FC = () => {
  const {
    analyzeMessage,
    generateStory,
    generateSocialMediaContent,
    loading,
    error,
    testConnection,
  } = useIntegratedAPI();

  const [message, setMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  // 서버 연결 테스트
  const handleTestConnection = async () => {
    const isConnected = await testConnection();
    setConnectionStatus(isConnected);
  };

  // 메시지 분석
  const handleAnalyze = async () => {
    if (!message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    try {
      const response = await analyzeMessage(message);
      setResult(response);
    } catch (err) {
      console.error('분석 오류:', err);
    }
  };

  // 스토리 생성
  const handleGenerateStory = async () => {
    try {
      const response = await generateStory({
        genre: 'romance',
        theme: '사랑',
      });
      setResult(response);
    } catch (err) {
      console.error('스토리 생성 오류:', err);
    }
  };

  // 소셜미디어 콘텐츠 생성
  const handleGenerateSocialContent = async () => {
    try {
      const response = await generateSocialMediaContent({
        platform: 'instagram',
        content_type: 'post',
        company_name: '우리 회사',
        industry: '건설업',
      });
      setResult(response);
    } catch (err) {
      console.error('소셜미디어 콘텐츠 생성 오류:', err);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, overflow: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        🚀 통합 API 데모
      </Typography>

      {/* 서버 연결 테스트 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            서버 연결 테스트
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleTestConnection}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              연결 테스트
            </Button>
            {connectionStatus !== null && (
              <Chip
                label={connectionStatus ? '✅ 서버 연결 성공' : '❌ 서버 연결 실패'}
                color={connectionStatus ? 'success' : 'error'}
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 메시지 분석 */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            메시지 분석
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="분석할 메시지를 입력하세요..."
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={loading || !message.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? '분석 중...' : '분석하기'}
          </Button>
        </CardContent>
      </Card>

      {/* 창작 및 마케팅 콘텐츠 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                창작 콘텐츠
              </Typography>
              <Button
                variant="outlined"
                onClick={handleGenerateStory}
                disabled={loading}
                fullWidth
              >
                스토리 생성
              </Button>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                마케팅 콘텐츠
              </Typography>
              <Button
                variant="outlined"
                onClick={handleGenerateSocialContent}
                disabled={loading}
                fullWidth
              >
                소셜미디어 콘텐츠 생성
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 에러 표시 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => { }}>
          <strong>오류:</strong> {error.message}
        </Alert>
      )}

      {/* 결과 표시 */}
      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              결과
            </Typography>
            <Paper
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              <Typography
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  m: 0,
                }}
              >
                {JSON.stringify(result, null, 2)}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default IntegratedAPIDemo;
