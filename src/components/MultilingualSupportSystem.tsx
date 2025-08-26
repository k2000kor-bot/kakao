import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  Language,
  Translate,
  Flag,
  Settings,
  CheckCircle,
  Warning,
  Info,
  Close,
  ExpandMore,
  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Home,
  Menu,
  Search,
  Notifications,
  AccountCircle,
  Brightness4,
  Brightness7,
  ZoomIn,
  ZoomOut,
  VolumeUp,
  VolumeOff,
  HighContrast,
  Accessibility,
  Keyboard,
  Mouse,
  TouchApp,
  Hearing,
  Visibility,
  Contrast,
  Palette,
  TextFields,
  FormatSize,
  Speed,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Help,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  HighContrast as HighContrastIcon,
  Accessibility as AccessibilityIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  TouchApp as TouchAppIcon,
  Hearing as HearingIcon,
  Visibility as VisibilityIcon,
  Contrast as ContrastIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  FormatSize as FormatSizeIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon2,
  Warning as WarningIcon2,
  Info as InfoIcon2,
  Settings as SettingsIcon2,
  Help as HelpIcon,
  Close as CloseIcon2,
  ExpandMore as ExpandMoreIcon2,
  KeyboardArrowDown as KeyboardArrowDownIcon2,
  KeyboardArrowUp as KeyboardArrowUpIcon2,
  KeyboardArrowLeft as KeyboardArrowLeftIcon2,
  KeyboardArrowRight as KeyboardArrowRightIcon2,
  Home as HomeIcon2,
  Menu as MenuIcon2,
  Search as SearchIcon2,
  Notifications as NotificationsIcon2,
  AccountCircle as AccountCircleIcon2,
  Brightness4 as Brightness4Icon2,
  Brightness7 as Brightness7Icon2,
  ZoomIn as ZoomInIcon2,
  ZoomOut as ZoomOutIcon2,
  VolumeUp as VolumeUpIcon2,
  VolumeOff as VolumeOffIcon2,
  HighContrast as HighContrastIcon2,
  Accessibility as AccessibilityIcon2,
  Keyboard as KeyboardIcon2,
  Mouse as MouseIcon2,
  TouchApp as TouchAppIcon2,
  Hearing as HearingIcon2,
  Visibility as VisibilityIcon2,
  Contrast as ContrastIcon2,
  Palette as PaletteIcon2,
  TextFields as TextFieldsIcon2,
  FormatSize as FormatSizeIcon2,
  Speed as SpeedIcon2,
  CheckCircle as CheckCircleIcon3,
  Warning as WarningIcon3,
  Info as InfoIcon3,
  Settings as SettingsIcon3,
  Help as HelpIcon2,
  Close as CloseIcon3,
  ExpandMore as ExpandMoreIcon3,
  KeyboardArrowDown as KeyboardArrowDownIcon3,
  KeyboardArrowUp as KeyboardArrowUpIcon3,
  KeyboardArrowLeft as KeyboardArrowLeftIcon3,
  KeyboardArrowRight as KeyboardArrowRightIcon3,
  Home as HomeIcon3,
  Menu as MenuIcon3,
  Search as SearchIcon3,
  Notifications as NotificationsIcon3,
  AccountCircle as AccountCircleIcon3,
  Brightness4 as Brightness4Icon3,
  Brightness7 as Brightness7Icon3,
  ZoomIn as ZoomInIcon3,
  ZoomOut as ZoomOutIcon3,
  VolumeUp as VolumeUpIcon3,
  VolumeOff as VolumeOffIcon3,
  HighContrast as HighContrastIcon3,
  Accessibility as AccessibilityIcon3,
  Keyboard as KeyboardIcon3,
  Mouse as MouseIcon3,
  TouchApp as TouchAppIcon3,
  Hearing as HearingIcon3,
  Visibility as VisibilityIcon3,
  Contrast as ContrastIcon3,
  Palette as PaletteIcon3,
  TextFields as TextFieldsIcon3,
  FormatSize as FormatSizeIcon3,
  Speed as SpeedIcon3,
} from '@mui/icons-material';

// 다국어 번역 데이터
const translations = {
  ko: {
    // 기본 UI
    title: '다국어 지원 시스템',
    subtitle: '전 세계 사용자를 위한 포용적 다국어 지원',
    language: '언어',
    selectLanguage: '언어 선택',
    currentLanguage: '현재 언어',
    translationQuality: '번역 품질',
    culturalContext: '문화적 맥락',
    autoTranslate: '자동 번역',
    manualTranslate: '수동 번역',
    saveSettings: '설정 저장',
    resetSettings: '설정 초기화',
    
    // 언어별 정보
    korean: '한국어',
    english: '영어',
    japanese: '일본어',
    chinese: '중국어',
    spanish: '스페인어',
    french: '프랑스어',
    german: '독일어',
    russian: '러시아어',
    arabic: '아랍어',
    portuguese: '포르투갈어',
    
    // 기능 설명
    features: {
      realTimeTranslation: '실시간 번역',
      culturalAdaptation: '문화적 적응',
      voiceTranslation: '음성 번역',
      textToSpeech: '텍스트 음성 변환',
      speechToText: '음성 텍스트 변환',
      contextAwareTranslation: '맥락 인식 번역',
      dialectSupport: '방언 지원',
      formalInformal: '격식/비격식 구분',
      regionalVariants: '지역별 변형',
      accessibilityTranslation: '접근성 번역',
    },
    
    // 상태 메시지
    messages: {
      languageChanged: '언어가 변경되었습니다.',
      translationComplete: '번역이 완료되었습니다.',
      settingsSaved: '설정이 저장되었습니다.',
      errorOccurred: '오류가 발생했습니다.',
      loading: '로딩 중...',
      ready: '준비됨',
    },
    
    // 품질 지표
    quality: {
      excellent: '우수',
      good: '양호',
      fair: '보통',
      poor: '미흡',
      accuracy: '정확도',
      fluency: '유창성',
      cultural: '문화적 적절성',
      context: '맥락 이해도',
    }
  },
  en: {
    title: 'Multilingual Support System',
    subtitle: 'Inclusive multilingual support for global users',
    language: 'Language',
    selectLanguage: 'Select Language',
    currentLanguage: 'Current Language',
    translationQuality: 'Translation Quality',
    culturalContext: 'Cultural Context',
    autoTranslate: 'Auto Translate',
    manualTranslate: 'Manual Translate',
    saveSettings: 'Save Settings',
    resetSettings: 'Reset Settings',
    
    korean: 'Korean',
    english: 'English',
    japanese: 'Japanese',
    chinese: 'Chinese',
    spanish: 'Spanish',
    french: 'French',
    german: 'German',
    russian: 'Russian',
    arabic: 'Arabic',
    portuguese: 'Portuguese',
    
    features: {
      realTimeTranslation: 'Real-time Translation',
      culturalAdaptation: 'Cultural Adaptation',
      voiceTranslation: 'Voice Translation',
      textToSpeech: 'Text-to-Speech',
      speechToText: 'Speech-to-Text',
      contextAwareTranslation: 'Context-aware Translation',
      dialectSupport: 'Dialect Support',
      formalInformal: 'Formal/Informal Distinction',
      regionalVariants: 'Regional Variants',
      accessibilityTranslation: 'Accessibility Translation',
    },
    
    messages: {
      languageChanged: 'Language changed successfully.',
      translationComplete: 'Translation completed.',
      settingsSaved: 'Settings saved successfully.',
      errorOccurred: 'An error occurred.',
      loading: 'Loading...',
      ready: 'Ready',
    },
    
    quality: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      accuracy: 'Accuracy',
      fluency: 'Fluency',
      cultural: 'Cultural Appropriateness',
      context: 'Context Understanding',
    }
  },
  ja: {
    title: '多言語サポートシステム',
    subtitle: '世界中のユーザーのための包括的多言語サポート',
    language: '言語',
    selectLanguage: '言語選択',
    currentLanguage: '現在の言語',
    translationQuality: '翻訳品質',
    culturalContext: '文化的コンテキスト',
    autoTranslate: '自動翻訳',
    manualTranslate: '手動翻訳',
    saveSettings: '設定保存',
    resetSettings: '設定リセット',
    
    korean: '韓国語',
    english: '英語',
    japanese: '日本語',
    chinese: '中国語',
    spanish: 'スペイン語',
    french: 'フランス語',
    german: 'ドイツ語',
    russian: 'ロシア語',
    arabic: 'アラビア語',
    portuguese: 'ポルトガル語',
    
    features: {
      realTimeTranslation: 'リアルタイム翻訳',
      culturalAdaptation: '文化的適応',
      voiceTranslation: '音声翻訳',
      textToSpeech: 'テキスト読み上げ',
      speechToText: '音声認識',
      contextAwareTranslation: 'コンテキスト認識翻訳',
      dialectSupport: '方言サポート',
      formalInformal: '敬語・普通語の区別',
      regionalVariants: '地域変種',
      accessibilityTranslation: 'アクセシビリティ翻訳',
    },
    
    messages: {
      languageChanged: '言語が変更されました。',
      translationComplete: '翻訳が完了しました。',
      settingsSaved: '設定が保存されました。',
      errorOccurred: 'エラーが発生しました。',
      loading: '読み込み中...',
      ready: '準備完了',
    },
    
    quality: {
      excellent: '優秀',
      good: '良好',
      fair: '普通',
      poor: '不十分',
      accuracy: '正確性',
      fluency: '流暢性',
      cultural: '文化的適切性',
      context: 'コンテキスト理解',
    }
  },
  zh: {
    title: '多语言支持系统',
    subtitle: '为全球用户提供包容性多语言支持',
    language: '语言',
    selectLanguage: '选择语言',
    currentLanguage: '当前语言',
    translationQuality: '翻译质量',
    culturalContext: '文化背景',
    autoTranslate: '自动翻译',
    manualTranslate: '手动翻译',
    saveSettings: '保存设置',
    resetSettings: '重置设置',
    
    korean: '韩语',
    english: '英语',
    japanese: '日语',
    chinese: '中文',
    spanish: '西班牙语',
    french: '法语',
    german: '德语',
    russian: '俄语',
    arabic: '阿拉伯语',
    portuguese: '葡萄牙语',
    
    features: {
      realTimeTranslation: '实时翻译',
      culturalAdaptation: '文化适应',
      voiceTranslation: '语音翻译',
      textToSpeech: '文字转语音',
      speechToText: '语音转文字',
      contextAwareTranslation: '上下文感知翻译',
      dialectSupport: '方言支持',
      formalInformal: '正式/非正式区分',
      regionalVariants: '地区变体',
      accessibilityTranslation: '无障碍翻译',
    },
    
    messages: {
      languageChanged: '语言已更改。',
      translationComplete: '翻译完成。',
      settingsSaved: '设置已保存。',
      errorOccurred: '发生错误。',
      loading: '加载中...',
      ready: '就绪',
    },
    
    quality: {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差',
      accuracy: '准确性',
      fluency: '流畅性',
      cultural: '文化适当性',
      context: '上下文理解',
    }
  }
};

// 언어 컨텍스트 생성
const LanguageContext = createContext<{
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}>({
  currentLanguage: 'ko',
  setLanguage: () => {},
  t: () => '',
});

// 언어 훅
export const useLanguage = () => useContext(LanguageContext);

// 언어별 플래그 아이콘
const languageFlags = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ru: '🇷🇺',
  ar: '🇸🇦',
  pt: '🇵🇹',
};

interface MultilingualSupportSystemProps {
  children?: React.ReactNode;
}

const MultilingualSupportSystem: React.FC<MultilingualSupportSystemProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [translationQuality, setTranslationQuality] = useState(95);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [culturalContext, setCulturalContext] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage as keyof typeof translations];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // 번역이 없으면 키 반환
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    setSnackbarMessage(t('messages.languageChanged'));
    setShowSnackbar(true);
  };

  const supportedLanguages = [
    { code: 'ko', name: t('korean'), flag: languageFlags.ko },
    { code: 'en', name: t('english'), flag: languageFlags.en },
    { code: 'ja', name: t('japanese'), flag: languageFlags.ja },
    { code: 'zh', name: t('chinese'), flag: languageFlags.zh },
    { code: 'es', name: t('spanish'), flag: languageFlags.es },
    { code: 'fr', name: t('french'), flag: languageFlags.fr },
    { code: 'de', name: t('german'), flag: languageFlags.de },
    { code: 'ru', name: t('russian'), flag: languageFlags.ru },
    { code: 'ar', name: t('arabic'), flag: languageFlags.ar },
    { code: 'pt', name: t('portuguese'), flag: languageFlags.pt },
  ];

  const languageFeatures = [
    { key: 'realTimeTranslation', icon: <Translate /> },
    { key: 'culturalAdaptation', icon: <Language /> },
    { key: 'voiceTranslation', icon: <VolumeUp /> },
    { key: 'textToSpeech', icon: <TextFields /> },
    { key: 'speechToText', icon: <Hearing /> },
    { key: 'contextAwareTranslation', icon: <Settings /> },
    { key: 'dialectSupport', icon: <Flag /> },
    { key: 'formalInformal', icon: <CheckCircle /> },
    { key: 'regionalVariants', icon: <Info /> },
    { key: 'accessibilityTranslation', icon: <Accessibility /> },
  ];

  const quickActions = [
    { icon: <Translate />, name: t('autoTranslate'), action: () => setAutoTranslate(!autoTranslate) },
    { icon: <Language />, name: t('culturalContext'), action: () => setCulturalContext(!culturalContext) },
    { icon: <Settings />, name: t('saveSettings'), action: () => {
      setSnackbarMessage(t('messages.settingsSaved'));
      setShowSnackbar(true);
    }},
  ];

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage: handleLanguageChange, t }}>
      <Box sx={{ p: 3 }}>
        <Container maxWidth="xl">
          {/* 헤더 */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Language sx={{ fontSize: 40, color: 'primary.main' }} />
              {t('title')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {t('subtitle')}
            </Typography>
          </Box>

          {/* 언어 선택 카드 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">{t('selectLanguage')}</Typography>
                <Chip 
                  label={`${languageFlags[currentLanguage as keyof typeof languageFlags]} ${t(currentLanguage)}`}
                  color="primary"
                  icon={<Language />}
                />
              </Box>
              
              <Grid container spacing={2}>
                {supportedLanguages.map((lang) => (
                  <Grid item xs={12} sm={6} md={3} key={lang.code}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        border: currentLanguage === lang.code ? 2 : 1,
                        borderColor: currentLanguage === lang.code ? 'primary.main' : 'divider',
                        bgcolor: currentLanguage === lang.code ? 'primary.light' : 'background.paper',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <Typography variant="h4" sx={{ mb: 1 }}>{lang.flag}</Typography>
                      <Typography variant="h6">{lang.name}</Typography>
                      {currentLanguage === lang.code && (
                        <CheckCircleIcon sx={{ color: 'success.main', mt: 1 }} />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* 번역 품질 및 설정 */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('translationQuality')}</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('quality.accuracy')}: {translationQuality}%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={translationQuality} 
                          sx={{ height: 8, borderRadius: 4 }}
                          color={translationQuality >= 90 ? 'success' : translationQuality >= 70 ? 'warning' : 'error'}
                        />
                      </Box>
                      <Chip 
                        label={translationQuality >= 90 ? t('quality.excellent') : 
                               translationQuality >= 70 ? t('quality.good') : 
                               translationQuality >= 50 ? t('quality.fair') : t('quality.poor')}
                        size="small"
                        color={translationQuality >= 90 ? 'success' : translationQuality >= 70 ? 'warning' : 'error'}
                      />
                    </Box>
                  </Box>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary={t('quality.fluency')} secondary="95%" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary={t('quality.cultural')} secondary="92%" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                      <ListItemText primary={t('quality.context')} secondary="88%" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t('features.realTimeTranslation')}</Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoTranslate}
                        onChange={(e) => setAutoTranslate(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={t('autoTranslate')}
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={culturalContext}
                        onChange={(e) => setCulturalContext(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={t('culturalContext')}
                    sx={{ mb: 2 }}
                  />
                  
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={() => setShowSettings(true)}
                    startIcon={<Settings />}
                  >
                    {t('saveSettings')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 다국어 기능 목록 */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {t('features.realTimeTranslation')} 기능
              </Typography>
              <Grid container spacing={2}>
                {languageFeatures.map((feature) => (
                  <Grid item xs={12} sm={6} md={4} key={feature.key}>
                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {feature.icon}
                      <Typography variant="body1">{t(`features.${feature.key}`)}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* SpeedDial */}
          <SpeedDial
            ariaLabel="빠른 언어 도구"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
          >
            {quickActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action}
              />
            ))}
          </SpeedDial>

          {/* 설정 다이얼로그 */}
          <Dialog
            open={showSettings}
            onClose={() => setShowSettings(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>{t('saveSettings')}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary">
                현재 언어 설정과 번역 품질 설정이 저장됩니다.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowSettings(false)}>{t('messages.ready')}</Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={3000}
            onClose={() => setShowSnackbar(false)}
            message={snackbarMessage}
          />

          {/* 자식 컴포넌트 렌더링 */}
          {children}
        </Container>
      </Box>
    </LanguageContext.Provider>
  );
};

export default MultilingualSupportSystem;
