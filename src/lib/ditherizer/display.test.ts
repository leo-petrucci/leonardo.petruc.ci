import { describe, expect, it } from 'vitest';
import {
  computeDisplayOutputSize,
  computePreviewState,
  formatDimensions,
  formatScalePercent,
  formatZoomPercent,
} from '@/lib/ditherizer/display';

describe('computeDisplayOutputSize', () => {
  it('returns outputSize when present', () => {
    expect(
      computeDisplayOutputSize({ width: 100, height: 200 }, { width: 500, height: 600 }, 0.5)
    ).toEqual({ width: 100, height: 200 });
  });

  it('returns null when both sizes are null', () => {
    expect(computeDisplayOutputSize(null, null, 1)).toBeNull();
    expect(computeDisplayOutputSize(null, null, 0.5)).toBeNull();
  });

  it('computes from sourceSize and scale when outputSize null', () => {
    expect(computeDisplayOutputSize(null, { width: 100, height: 200 }, 1)).toEqual({
      width: 100,
      height: 200,
    });
    expect(computeDisplayOutputSize(null, { width: 100, height: 200 }, 0.5)).toEqual({
      width: 50,
      height: 100,
    });
  });

  it('rounds scaled dimensions', () => {
    expect(computeDisplayOutputSize(null, { width: 10, height: 10 }, 0.333)).toEqual({
      width: 3,
      height: 3,
    });
  });

  it('clamps to at least 1px', () => {
    expect(computeDisplayOutputSize(null, { width: 1, height: 1 }, 0.01)).toEqual({
      width: 1,
      height: 1,
    });
    expect(computeDisplayOutputSize(null, { width: 10, height: 10 }, 0.01)).toEqual({
      width: 1,
      height: 1,
    });
  });

  it('prioritizes outputSize over scaled source', () => {
    // Even if source would give different size, output wins
    expect(
      computeDisplayOutputSize({ width: 10, height: 10 }, { width: 1000, height: 1000 }, 1)
    ).toEqual({ width: 10, height: 10 });
  });
});

describe('computePreviewState', () => {
  it('shows processed when flag true and outputUrl exists', () => {
    expect(computePreviewState(true, 'blob:1', 'blob:source')).toEqual({
      url: 'blob:1',
      label: 'Processed',
    });
  });

  it('falls back to sourceUrl when outputUrl null and showProcessed true', () => {
    expect(computePreviewState(true, null, 'blob:source')).toEqual({
      url: 'blob:source',
      label: 'Processed',
    });
  });

  it('returns sourceUrl when showProcessed false', () => {
    expect(computePreviewState(false, 'blob:1', 'blob:source')).toEqual({
      url: 'blob:source',
      label: 'Original',
    });
  });

  it('returns source even if output exists but showing original', () => {
    expect(computePreviewState(false, 'blob:processed', 'blob:original')).toEqual({
      url: 'blob:original',
      label: 'Original',
    });
  });

  it('returns null url when no source', () => {
    expect(computePreviewState(true, null, null)).toEqual({ url: null, label: 'Processed' });
    expect(computePreviewState(false, null, null)).toEqual({ url: null, label: 'Original' });
  });

  it('returns sourceUrl when output null and showProcessed false', () => {
    expect(computePreviewState(false, null, 'blob:src')).toEqual({
      url: 'blob:src',
      label: 'Original',
    });
  });
});

describe('formatDimensions', () => {
  it('formats size as W x Hpx', () => {
    expect(formatDimensions({ width: 100, height: 200 })).toBe('100 x 200px');
  });

  it('returns -- for null', () => {
    expect(formatDimensions(null)).toBe('--');
  });
});

describe('formatScalePercent', () => {
  it('formats 1 as 100%', () => {
    expect(formatScalePercent(1)).toBe('100%');
  });

  it('formats 0.5 as 50%', () => {
    expect(formatScalePercent(0.5)).toBe('50%');
  });

  it('rounds', () => {
    expect(formatScalePercent(0.333)).toBe('33%');
    expect(formatScalePercent(0.015)).toBe('2%');
  });
});

describe('formatZoomPercent', () => {
  it('formats zoom', () => {
    expect(formatZoomPercent(1)).toBe('100%');
    expect(formatZoomPercent(0.1)).toBe('10%');
    expect(formatZoomPercent(1.5)).toBe('150%');
    expect(formatZoomPercent(16)).toBe('1600%');
  });

  it('rounds', () => {
    expect(formatZoomPercent(1.234)).toBe('123%');
  });
});
