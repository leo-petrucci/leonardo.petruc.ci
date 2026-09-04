import { describe, expect, it } from 'vitest';
import { clampColors, clampScale } from '@/lib/ditherizer/clamp';
import { computeDisplayOutputSize, computePreviewState } from '@/lib/ditherizer/display';
import { shouldTriggerProcessing } from '@/lib/ditherizer/processing';
import { computeFitTransform, computeWheelNextZoom, nextZoomIn, nextZoomOut } from '@/lib/ditherizer/canvasMath';
import { isImageFile } from '@/lib/ditherizer/file';

describe('ditherizer integration', () => {
  it('full palette+scale workflow clamps and decides processing', () => {
    const colorsIn = 500;
    const scaleIn = 2;
    const clampedColors = clampColors(colorsIn);
    const clampedScale = clampScale(scaleIn);
    expect(clampedColors).toBe(256);
    expect(clampedScale).toBe(1);

    const last = { colors: 256, scale: 1, mode: 'ordered' as const, colorReduction: 'perceptual' as const };
    const nextSame = { colors: clampedColors, scale: clampedScale, mode: 'ordered' as const, colorReduction: 'perceptual' as const };
    expect(shouldTriggerProcessing(last, nextSame)).toBe(false);

    const nextDifferent = { colors: 64, scale: 0.5, mode: 'diffusion' as const, colorReduction: 'adaptive' as const };
    expect(shouldTriggerProcessing(last, nextDifferent)).toBe(true);
  });

  it('file validation gates processing', () => {
    const img = new File(['x'], 'a.png', { type: 'image/png' });
    const txt = new File(['x'], 'a.txt', { type: 'text/plain' });
    expect(isImageFile(img)).toBe(true);
    expect(isImageFile(txt)).toBe(false);
    // Only image files should trigger preview
    const previewWithImg = computePreviewState(true, null, 'blob:src');
    expect(previewWithImg.url).toBe('blob:src');
    // If file is not image, getFirstImageFile would return null and preview stays null
    expect(computePreviewState(true, null, null).url).toBeNull();
  });

  it('display size and canvas fit work together', () => {
    const sourceSize = { width: 2000, height: 1500 };
    const scale = 0.5;
    const display = computeDisplayOutputSize(null, sourceSize, scale);
    expect(display).toEqual({ width: 1000, height: 750 });

    const container = { width: 500, height: 500 };
    // Fit the display size into container
    const { zoom, pan } = computeFitTransform(container, display!);
    expect(zoom).toBeLessThanOrEqual(1);
    expect(zoom).toBeGreaterThan(0);
    expect(pan.x).toBeGreaterThanOrEqual(0);
    expect(pan.y).toBeGreaterThanOrEqual(0);
  });

  it('zoom workflow stays within bounds', () => {
    let zoom = 1;
    for (let i = 0; i < 30; i++) zoom = nextZoomIn(zoom);
    expect(zoom).toBe(16);
    for (let i = 0; i < 30; i++) zoom = nextZoomOut(zoom);
    expect(zoom).toBe(0.1);
    // Wheel zoom respects bounds
    expect(computeWheelNextZoom(16, -1000)).toBe(16);
    expect(computeWheelNextZoom(0.1, 1000)).toBe(0.1);
  });

  it('preview state toggles correctly with output', () => {
    const sourceUrl = 'blob:src';
    const outputUrl = 'blob:out';
    expect(computePreviewState(true, outputUrl, sourceUrl)).toEqual({ url: outputUrl, label: 'Processed' });
    expect(computePreviewState(false, outputUrl, sourceUrl)).toEqual({ url: sourceUrl, label: 'Original' });
    expect(computePreviewState(true, null, sourceUrl)).toEqual({ url: sourceUrl, label: 'Processed' });
  });

  it('clamping is idempotent', () => {
    for (const v of [2, 16, 128, 256]) {
      expect(clampColors(v)).toBe(v);
    }
    for (const v of [0.01, 0.1, 0.5, 1]) {
      expect(clampScale(v)).toBe(v);
    }
    // Double clamp yields same result
    expect(clampColors(clampColors(500))).toBe(256);
    expect(clampScale(clampScale(5))).toBe(1);
  });

  it('handles extreme container and image sizes for fit', () => {
    const tinyContainer = { width: 10, height: 10 };
    const hugeImage = { width: 10000, height: 10000 };
    const { zoom } = computeFitTransform(tinyContainer, hugeImage);
    expect(zoom).toBe(0.1); // clamped to min

    const hugeContainer = { width: 5000, height: 5000 };
    const tinyImage = { width: 10, height: 10 };
    const { zoom: z2 } = computeFitTransform(hugeContainer, tinyImage);
    expect(z2).toBe(1); // capped at 1
  });
});
