import { createTheme } from '@mui/material/styles';

/**
 * JSDOM에서 theme.css가 없을 때 MUI 기본 z-index(1300대)와 앱 레이어(2000·토스트 등)가 어긋나지 않도록 맞춤.
 * 프로덕션은 brainwave-global.css의 .MuiModal-root 등으로도 동일 스케일을 사용함.
 */
export function createMuiTestTheme() {
  const base = createTheme();
  return createTheme({
    zIndex: {
      ...base.zIndex,
      fab: 1100,
      speedDial: 1100,
      appBar: 1201,
      drawer: 1200,
      modal: 2000,
      snackbar: 10000,
      tooltip: 10001,
    },
  });
}
