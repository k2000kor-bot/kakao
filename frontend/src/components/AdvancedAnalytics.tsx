import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Paper,
  Chip,
  Alert,
  Divider,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp,
  Psychology,
  Business,
  Timeline,
  Insights,
  Prediction,
  Lightbulb,
  Speed,
  People,
  ContentCopy
} from '@mui/icons-material';

interface AdvancedAnalyticsProps {
  onInsightGenerated?: (insight: string) => void;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ onInsightGenerated }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 고급 분석 상태
  const [analysisType, setAnalysisType] = useState('sentiment_trend');
  const [timeRange, setTimeRange] = useState('7d');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // 예측 분석 상태
  const [predictionType, setPredictionType] = useState('user_satisfaction');
  const [predictionHorizon, setPredictionHorizon] = useState('30d');
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // 인사이트 상태
  const [insightType, setInsightType] = useState('general');
  const [focusArea, setFocusArea] = useState('all');
  const [insightsResult, setInsightsResult] = useState<any>(null);

  const analysisTypes = [
    { value: 'sentiment_trend', label: '감정 트렌드', icon: <Psychology /> },
    { value: 'user_behavior', label: '사용자 행동', icon: <People /> },
    { value: 'content_performance', label: '콘텐츠 성능', icon: <ContentCopy /> }
  ];

  const timeRanges = [
    { value: '1d', label: '1일' },
    { value: '7d', label: '7일' },
    { value: '30d', label: '30일' },
    { value: '90d', label: '90일' }
  ];

  const predictionTypes = [
    { value: 'user_satisfaction', label: '사용자 만족도', icon: <Psychology /> },
    { value: 'content_performance', label: '콘텐츠 성능', icon: <ContentCopy /> },
    { value: 'system_load', label: '시스템 부하', icon: <Speed /> }
  ];

  const predictionHorizons = [
    { value: '7d', label: '7일' },
    { value: '30d', label: '30일' },
    { value: '90d', label: '90일' }
  ];

  const insightTypes = [
    { value: 'general', label: '일반', icon: <Lightbulb /> },
    { value: 'performance', label: '성능', icon: <Speed /> },
    { value: 'user', label: '사용자', icon: <People /> },
    { value: 'business', label: '비즈니스', icon: <Business /> }
  ];

  const focusAreas = [
    { value: 'all', label: '전체' },
    { value: 'chat', label: '채팅' },
    { value: 'creative', label: '창작' },
    { value: 'marketing', label: '마케팅' },
    { value: 'persuasion', label: '설득' }
  ];

  const runAdvancedAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5002/api/integrated/analytics/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_type: analysisType,
          time_range: timeRange
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.data);
      } else {
        setError(data.error || '고급 분석에 실패했습니다.');
      }
    } catch (err) {
      setError('고급 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const runPredictionAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5002/api/integrated/analytics/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prediction_type: predictionType,
          prediction_horizon: predictionHorizon
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPredictionResult(data.data);
      } else {
        setError(data.error || '예측 분석에 실패했습니다.');
      }
    } catch (err) {
      setError('예측 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const runInsightsGeneration = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5002/api/integrated/analytics/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insight_type: insightType,
          focus_area: focusArea
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setInsightsResult(data.data);
        // 첫 번째 인사이트를 메시지로 전송
        if (data.data.insights && data.data.insights.length > 0) {
          onInsightGenerated?.(data.data.insights[0].title + ': ' + data.data.insights[0].description);
        }
      } else {
        setError(data.error || '인사이트 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('인사이트 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError('');
  };

  const renderAdvancedAnalysisTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp color="primary" />
        고급 데이터 분석
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>분석 유형</InputLabel>
            <Select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              label="분석 유형"
            >
              {analysisTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.icon}
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>시간 범위</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="시간 범위"
            >
              {timeRanges.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Button
        variant="contained"
        onClick={runAdvancedAnalysis}
        disabled={loading}
        startIcon={<TrendingUp />}
        sx={{ mb: 2 }}
      >
        {loading ? '분석 중...' : '고급 분석 실행'}
      </Button>
      
      {analysisResult && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>분석 결과</Typography>
          
          {analysisType === 'sentiment_trend' && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>감정 트렌드 요약</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">평균 긍정률</Typography>
                  <Typography variant="h6" color="success.main">
                    {analysisResult.data.summary.avg_positive}%
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">평균 부정률</Typography>
                  <Typography variant="h6" color="error.main">
                    {analysisResult.data.summary.avg_negative}%
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">트렌드</Typography>
                  <Chip 
                    label={analysisResult.data.summary.trend_direction === 'up' ? '상승' : '하락'} 
                    color={analysisResult.data.summary.trend_direction === 'up' ? 'success' : 'error'} 
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">변동성</Typography>
                  <Typography variant="h6">
                    {analysisResult.data.summary.volatility}%
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 1 }}>인사이트</Typography>
              <List>
                {analysisResult.data.insights.map((insight: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Lightbulb color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={insight} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {analysisType === 'user_behavior' && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>사용자 행동 분석</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">평균 세션 시간</Typography>
                  <Typography variant="h6">
                    {Math.floor(analysisResult.data.session_data.avg_session_duration / 60)}분
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">페이지/세션</Typography>
                  <Typography variant="h6">
                    {analysisResult.data.session_data.pages_per_session}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">이탈률</Typography>
                  <Typography variant="h6" color="error.main">
                    {analysisResult.data.session_data.bounce_rate}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">재방문률</Typography>
                  <Typography variant="h6" color="success.main">
                    {analysisResult.data.session_data.return_visitor_rate}%
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" sx={{ mb: 1 }}>기능 사용률</Typography>
              <Grid container spacing={2}>
                {Object.entries(analysisResult.data.feature_usage).map(([feature, usage]) => (
                  <Grid item xs={6} sm={3} key={feature}>
                    <Typography variant="body2" color="text.secondary">
                      {feature === 'chat_usage' ? '채팅' :
                       feature === 'analysis_usage' ? '분석' :
                       feature === 'creative_usage' ? '창작' :
                       feature === 'marketing_usage' ? '마케팅' : feature}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={usage as number} 
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {usage}%
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {analysisType === 'content_performance' && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>콘텐츠 성능 분석</Typography>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>콘텐츠 유형별 성능</Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>유형</TableCell>
                      <TableCell align="right">생성 수</TableCell>
                      <TableCell align="right">평균 평점</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(analysisResult.data.content_types).map(([type, data]: [string, any]) => (
                      <TableRow key={type}>
                        <TableCell>
                          {type === 'chat_responses' ? '채팅 응답' :
                           type === 'creative_content' ? '창작 콘텐츠' :
                           type === 'persuasion_content' ? '설득 콘텐츠' :
                           type === 'marketing_content' ? '마케팅 콘텐츠' : type}
                        </TableCell>
                        <TableCell align="right">{data.count}</TableCell>
                        <TableCell align="right">{data.avg_rating}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>인기 키워드</Typography>
              <Grid container spacing={1}>
                {analysisResult.data.top_keywords.map((keyword: any, index: number) => (
                  <Grid item key={index}>
                    <Chip 
                      label={`${keyword.keyword} (${keyword.count})`}
                      color={keyword.trend === 'up' ? 'success' : 'default'}
                      variant={keyword.trend === 'up' ? 'filled' : 'outlined'}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );

  const renderPredictionTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Prediction color="secondary" />
        예측 분석
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>예측 유형</InputLabel>
            <Select
              value={predictionType}
              onChange={(e) => setPredictionType(e.target.value)}
              label="예측 유형"
            >
              {predictionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.icon}
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>예측 기간</InputLabel>
            <Select
              value={predictionHorizon}
              onChange={(e) => setPredictionHorizon(e.target.value)}
              label="예측 기간"
            >
              {predictionHorizons.map((horizon) => (
                <MenuItem key={horizon.value} value={horizon.value}>
                  {horizon.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Button
        variant="contained"
        color="secondary"
        onClick={runPredictionAnalysis}
        disabled={loading}
        startIcon={<Prediction />}
        sx={{ mb: 2 }}
      >
        {loading ? '예측 중...' : '예측 분석 실행'}
      </Button>
      
      {predictionResult && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>예측 결과</Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">현재 값</Typography>
              <Typography variant="h4" color="primary">
                {predictionResult.prediction.current_value}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">예측 값</Typography>
              <Typography variant="h4" color="secondary">
                {predictionResult.prediction.predicted_value}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">신뢰도</Typography>
              <Typography variant="h4" color="success.main">
                {predictionResult.prediction.confidence}%
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>주요 요인</Typography>
          <List>
            {predictionResult.prediction.factors.map((factor: string, index: number) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Lightbulb color="info" />
                </ListItemIcon>
                <ListItemText primary={factor} />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>권장사항</Typography>
          <List>
            {predictionResult.prediction.recommendations.map((recommendation: string, index: number) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Lightbulb color="warning" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );

  const renderInsightsTab = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Insights color="warning" />
        인사이트 생성
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>인사이트 유형</InputLabel>
            <Select
              value={insightType}
              onChange={(e) => setInsightType(e.target.value)}
              label="인사이트 유형"
            >
              {insightTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.icon}
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>포커스 영역</InputLabel>
            <Select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              label="포커스 영역"
            >
              {focusAreas.map((area) => (
                <MenuItem key={area.value} value={area.value}>
                  {area.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Button
        variant="contained"
        color="warning"
        onClick={runInsightsGeneration}
        disabled={loading}
        startIcon={<Insights />}
        sx={{ mb: 2 }}
      >
        {loading ? '생성 중...' : '인사이트 생성'}
      </Button>
      
      {insightsResult && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            인사이트 ({insightsResult.total_insights}개)
          </Typography>
          
          {insightsResult.insights.map((insight: any, index: number) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6">{insight.title}</Typography>
                  <Chip 
                    label={insight.impact === 'high' ? '높음' :
                           insight.impact === 'medium' ? '보통' :
                           insight.impact === 'positive' ? '긍정' : '낮음'}
                    color={insight.impact === 'high' ? 'error' :
                           insight.impact === 'medium' ? 'warning' :
                           insight.impact === 'positive' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {insight.description}
                </Typography>
                
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>권장사항:</strong> {insight.recommendation}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}
    </Box>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="고급 분석" icon={<TrendingUp />} />
          <Tab label="예측 분석" icon={<Prediction />} />
          <Tab label="인사이트" icon={<Insights />} />
        </Tabs>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeTab === 0 && renderAdvancedAnalysisTab()}
      {activeTab === 1 && renderPredictionTab()}
      {activeTab === 2 && renderInsightsTab()}
    </Paper>
  );
};

export default AdvancedAnalytics;
