import { ERROR_REPORTS_STORAGE_KEY } from '../errorReportingStorageKeys';
import { ERROR_REPORTS_STORAGE_KEY as K_SVC } from '../errorReportingService';

describe('errorReportingStorageKeys', () => {
  it('localStorage 키 문자열 계약', () => {
    expect(ERROR_REPORTS_STORAGE_KEY).toBe('errorReports');
  });

  it('errorReportingService 재보내기와 동일', () => {
    expect(K_SVC).toBe(ERROR_REPORTS_STORAGE_KEY);
  });
});
