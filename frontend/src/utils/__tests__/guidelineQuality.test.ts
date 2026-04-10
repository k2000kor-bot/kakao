import { analyzeGuidelines, getGuidelineQualityTrend, parseGuideline } from '../guidelineQuality';

describe('guidelineQuality', () => {
  it('parseGuideline는 필수/권장 접두어를 파싱해야 함', () => {
    expect(parseGuideline('[필수] 응답은 표로 정리')).toMatchObject({
      priority: 'required',
      content: '응답은 표로 정리',
      isEmpty: false,
    });
    expect(parseGuideline('[권장] 단계별 체크리스트 포함')).toMatchObject({
      priority: 'recommended',
      content: '단계별 체크리스트 포함',
      isEmpty: false,
    });
  });

  it('필수 규칙이 없으면 품질 상태가 warning 이상이어야 함', () => {
    const report = analyzeGuidelines(['체크리스트로 정리', '[권장] 표 형태 사용']);
    expect(report.required).toBe(0);
    expect(report.qualityStatus).toBe('warning');
  });

  it('중복/빈 항목이 있으면 점수가 하락해야 함', () => {
    const report = analyzeGuidelines([
      '[필수] 근거를 명시',
      '[권장] 표 형태',
      '[권장] 표 형태',
      '',
    ]);
    expect(report.duplicates).toBeGreaterThan(0);
    expect(report.empty).toBeGreaterThan(0);
    expect(report.qualityScore).toBeLessThan(100);
  });

  it('필수+권장 구조가 갖춰지면 good 상태여야 함', () => {
    const report = analyzeGuidelines([
      '[필수] 결론-근거-액션 순서',
      '[권장] 표 형태로 핵심 정리',
      '[권장] 확인 필요 항목 명시',
    ]);
    expect(report.qualityStatus).toBe('good');
    expect(report.qualityScore).toBeGreaterThanOrEqual(80);
  });

  it('품질 이력 추세를 계산해야 함', () => {
    expect(
      getGuidelineQualityTrend([
        { savedAt: '2026-02-20T12:00:00.000Z', score: 82, status: 'good' },
        { savedAt: '2026-02-19T12:00:00.000Z', score: 70, status: 'warning' },
      ])
    ).toMatchObject({ direction: 'up' });

    expect(
      getGuidelineQualityTrend([
        { savedAt: '2026-02-20T12:00:00.000Z', score: 62, status: 'warning' },
        { savedAt: '2026-02-19T12:00:00.000Z', score: 77, status: 'good' },
      ])
    ).toMatchObject({ direction: 'down' });
  });
});
