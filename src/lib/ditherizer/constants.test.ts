import { describe, expect, it } from 'vitest';
import {
  CANVAS_FIT_PADDING,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  CANVAS_ZOOM_STEP,
  DITHERIZER_DEFAULT_COLORS,
  DITHERIZER_MAX_COLORS,
  DITHERIZER_MAX_SCALE,
  DITHERIZER_MIN_COLORS,
  DITHERIZER_MIN_SCALE,
  SLOW_PROCESSING_DELAY_MS,
} from '@/lib/ditherizer/constants';

describe('ditherizer constants', () => {
  it('palette limits are correct', () => {
    expect(DITHERIZER_MIN_COLORS).toBe(2);
    expect(DITHERIZER_MAX_COLORS).toBe(256);
    expect(DITHERIZER_DEFAULT_COLORS).toBe(256);
  });

  it('scale limits are correct', () => {
    expect(DITHERIZER_MIN_SCALE).toBe(0.01);
    expect(DITHERIZER_MAX_SCALE).toBe(1);
  });

  it('canvas zoom limits are correct', () => {
    expect(CANVAS_MIN_ZOOM).toBe(0.1);
    expect(CANVAS_MAX_ZOOM).toBe(16);
    expect(CANVAS_ZOOM_STEP).toBe(1.25);
    expect(CANVAS_FIT_PADDING).toBe(32);
  });

  it('slow processing delay is 5000ms', () => {
    expect(SLOW_PROCESSING_DELAY_MS).toBe(5000);
  });

  it('min < max for all ranges', () => {
    expect(DITHERIZER_MIN_COLORS).toBeLessThan(DITHERIZER_MAX_COLORS);
    expect(DITHERIZER_MIN_SCALE).toBeLessThan(DITHERIZER_MAX_SCALE);
    expect(CANVAS_MIN_ZOOM).toBeLessThan(CANVAS_MAX_ZOOM);
  });
});
