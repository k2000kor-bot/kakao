import { generateMultiStepResponse } from '../../services/multiStepResponseGenerator';
import { runComposerMultiStepMultiRequest } from '../runComposerMultiStepMultiRequest';

jest.mock('../../services/multiStepResponseGenerator', () => ({
  generateMultiStepResponse: jest.fn(),
}));

describe('runComposerMultiStepMultiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('항목별 generateMultiStepResponse 호출 후 병합한다', async () => {
    (generateMultiStepResponse as jest.Mock)
      .mockResolvedValueOnce({ finalResponse: '답-1', isComplete: true, steps: [], currentStep: 1, results: {}, confidence: 1 })
      .mockResolvedValueOnce({ finalResponse: '답-2', isComplete: true, steps: [], currentStep: 1, results: {}, confidence: 1 });

    const partials: string[] = [];
    const result = await runComposerMultiStepMultiRequest({
      items: ['첫', '둘'],
      buildItemContext: (i) => ({ idx: i }),
      onLiveIndex: jest.fn(),
      onPartialProgress: (p) => partials.push(p),
    });

    expect(generateMultiStepResponse).toHaveBeenCalledTimes(2);
    expect(result.merged).toContain('## 1. 첫');
    expect(result.merged).toContain('답-2');
    expect(partials).toHaveLength(1);
    expect(partials[0]).toMatch(/다단계 처리 중/);
  });
});
