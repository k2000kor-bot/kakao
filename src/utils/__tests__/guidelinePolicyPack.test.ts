import {
  createGuidelinePolicyPack,
  parseGuidelinePolicyPack,
  serializeGuidelinePolicyPack,
} from '../guidelinePolicyPack';

describe('guidelinePolicyPack', () => {
  it('정책팩을 생성하고 직렬화/파싱할 수 있어야 함', () => {
    const pack = createGuidelinePolicyPack({
      projectId: 'p-1',
      projectName: '테스트 프로젝트',
      instructions: '결론-근거-액션 순서로 작성',
      guidelines: ['[필수] 근거 명시', '[권장] 표 형태', ''],
      tags: ['도시정비', '운영'],
    });

    expect(pack.quality.required).toBe(1);
    expect(pack.quality.recommended).toBe(1);

    const raw = serializeGuidelinePolicyPack(pack);
    const parsed = parseGuidelinePolicyPack(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.projectId).toBe('p-1');
    expect(parsed?.guidelines).toContain('[필수] 근거 명시');
  });

  it('형식이 잘못된 문자열은 null을 반환해야 함', () => {
    expect(parseGuidelinePolicyPack('not-json')).toBeNull();
    expect(parseGuidelinePolicyPack(JSON.stringify({ version: '0.9' }))).toBeNull();
  });
});
