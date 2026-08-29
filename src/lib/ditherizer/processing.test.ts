import { describe, expect, it } from 'vitest';
import {
  isEqualProcessed,
  shouldTriggerProcessing,
  type LastProcessed,
} from '@/lib/ditherizer/processing';

function make(overrides: Partial<LastProcessed> = {}): LastProcessed {
  return {
    colors: 256,
    scale: 1,
    mode: 'ordered',
    colorReduction: 'perceptual',
    ...overrides,
  };
}

describe('shouldTriggerProcessing', () => {
  it('true when last is null', () => {
    expect(shouldTriggerProcessing(null, make())).toBe(true);
  });

  it('false when identical', () => {
    const a = make();
    const b = make();
    expect(shouldTriggerProcessing(a, b)).toBe(false);
  });

  it('true when colors differ', () => {
    expect(shouldTriggerProcessing(make({ colors: 16 }), make({ colors: 32 }))).toBe(true);
  });

  it('true when scale differs', () => {
    expect(shouldTriggerProcessing(make({ scale: 1 }), make({ scale: 0.5 }))).toBe(true);
  });

  it('true when mode differs', () => {
    expect(shouldTriggerProcessing(make({ mode: 'ordered' }), make({ mode: 'diffusion' }))).toBe(true);
    expect(shouldTriggerProcessing(make({ mode: 'diffusion' }), make({ mode: 'none' }))).toBe(true);
  });

  it('true when colorReduction differs', () => {
    expect(
      shouldTriggerProcessing(make({ colorReduction: 'perceptual' }), make({ colorReduction: 'adaptive' }))
    ).toBe(true);
  });

  it('true when multiple fields differ', () => {
    expect(
      shouldTriggerProcessing(
        make({ colors: 16, scale: 1, mode: 'ordered' }),
        make({ colors: 32, scale: 0.5, mode: 'none' })
      )
    ).toBe(true);
  });

  it('false only when all match', () => {
    const a = make({ colors: 64, scale: 0.5, mode: 'none', colorReduction: 'selective' });
    const b = make({ colors: 64, scale: 0.5, mode: 'none', colorReduction: 'selective' });
    expect(shouldTriggerProcessing(a, b)).toBe(false);
  });

  it('handles float scale exactly', () => {
    // 0.1 vs 0.1000001 should be considered different (strict !==)
    expect(shouldTriggerProcessing(make({ scale: 0.1 }), make({ scale: 0.1000001 }))).toBe(true);
  });
});

describe('isEqualProcessed', () => {
  it('false when a is null', () => {
    expect(isEqualProcessed(null, make())).toBe(false);
  });

  it('true when equal', () => {
    expect(isEqualProcessed(make(), make())).toBe(true);
  });

  it('false when differing', () => {
    expect(isEqualProcessed(make({ colors: 2 }), make({ colors: 4 }))).toBe(false);
  });

  it('is inverse of shouldTriggerProcessing for non-null', () => {
    const a = make({ colors: 16 });
    const b = make({ colors: 16 });
    expect(isEqualProcessed(a, b)).toBe(!shouldTriggerProcessing(a, b));
    const c = make({ colors: 32 });
    expect(isEqualProcessed(a, c)).toBe(!shouldTriggerProcessing(a, c));
  });
});
