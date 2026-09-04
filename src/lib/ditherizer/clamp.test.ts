import { describe, expect, it } from 'vitest';
import { clamp, clampColors, clampScale, clampZoom } from '@/lib/ditherizer/clamp';
import {
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  DITHERIZER_MAX_COLORS,
  DITHERIZER_MAX_SCALE,
  DITHERIZER_MIN_COLORS,
  DITHERIZER_MIN_SCALE,
} from '@/lib/ditherizer/constants';

describe('clampColors', () => {
  it('rounds to nearest integer', () => {
    expect(clampColors(10.6)).toBe(11);
    expect(clampColors(10.4)).toBe(10);
    expect(clampColors(10.5)).toBe(11);
  });

  it('clamps below min to 2', () => {
    expect(clampColors(1)).toBe(2);
    expect(clampColors(0)).toBe(2);
    expect(clampColors(-100)).toBe(2);
    expect(clampColors(1.4)).toBe(2);
  });

  it('clamps above max to 256', () => {
    expect(clampColors(257)).toBe(256);
    expect(clampColors(1000)).toBe(256);
    expect(clampColors(256.6)).toBe(256);
  });

  it('passes through valid values', () => {
    expect(clampColors(2)).toBe(2);
    expect(clampColors(128)).toBe(128);
    expect(clampColors(256)).toBe(256);
  });

  it('handles NaN as clamped? NaN rounds to NaN then clamp returns NaN via Math.max/min -> NaN becomes min? Actually Math.max(2, NaN)=NaN, then min(256, NaN)=NaN', () => {
    // This documents current behaviour - we treat NaN as not clamped specially
    expect(Number.isNaN(clampColors(NaN))).toBe(true);
  });

  it('handles infinity', () => {
    expect(clampColors(Infinity)).toBe(DITHERIZER_MAX_COLORS);
    expect(clampColors(-Infinity)).toBe(DITHERIZER_MIN_COLORS);
  });
});

describe('clampScale', () => {
  it('clamps below 0.01 to 0.01', () => {
    expect(clampScale(0)).toBe(0.01);
    expect(clampScale(0.001)).toBe(0.01);
    expect(clampScale(-5)).toBe(0.01);
  });

  it('clamps above 1 to 1', () => {
    expect(clampScale(1.1)).toBe(1);
    expect(clampScale(2)).toBe(1);
    expect(clampScale(100)).toBe(1);
  });

  it('passes through valid scales', () => {
    expect(clampScale(0.01)).toBe(0.01);
    expect(clampScale(0.5)).toBe(0.5);
    expect(clampScale(1)).toBe(1);
    expect(clampScale(0.333)).toBeCloseTo(0.333);
  });

  it('does not round', () => {
    expect(clampScale(0.123456)).toBe(0.123456);
  });
});

describe('clampZoom', () => {
  it('clamps below 0.1', () => {
    expect(clampZoom(0)).toBe(0.1);
    expect(clampZoom(0.05)).toBe(0.1);
    expect(clampZoom(-10)).toBe(0.1);
  });

  it('clamps above 16', () => {
    expect(clampZoom(17)).toBe(16);
    expect(clampZoom(100)).toBe(16);
  });

  it('passes through valid zooms', () => {
    expect(clampZoom(1)).toBe(1);
    expect(clampZoom(0.1)).toBe(0.1);
    expect(clampZoom(16)).toBe(16);
    expect(clampZoom(5.5)).toBe(5.5);
  });
});

describe('clamp generic', () => {
  it('clamps value between min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('handles float values', () => {
    expect(clamp(0.123, 0, 1)).toBe(0.123);
    expect(clamp(1.5, 0, 1)).toBe(1);
  });
});
