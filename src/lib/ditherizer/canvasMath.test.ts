import { describe, expect, it } from 'vitest';
import {
  canFitImage,
  computeFitTransform,
  computeFitZoom,
  computePanDelta,
  computeWheelNextZoom,
  computeWheelPan,
  isValidContainerSize,
  nextZoomIn,
  nextZoomOut,
} from '@/lib/ditherizer/canvasMath';
import {
  CANVAS_FIT_PADDING,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  CANVAS_ZOOM_STEP,
} from '@/lib/ditherizer/constants';

describe('computeFitZoom', () => {
  it('fits large image to container with padding', () => {
    const container = { width: 500, height: 500 };
    const image = { width: 1000, height: 1000 };
    // (500-32)/1000 = 0.468
    expect(computeFitZoom(container, image)).toBeCloseTo(0.468);
  });

  it('caps at 1.0 for small images', () => {
    const container = { width: 1000, height: 1000 };
    const image = { width: 100, height: 100 };
    // (1000-32)/100 = 9.68, min with 1 =1
    expect(computeFitZoom(container, image)).toBe(1);
  });

  it('respects aspect ratio, picks smaller scale', () => {
    const container = { width: 500, height: 300 };
    const image = { width: 1000, height: 100 };
    // w: (500-32)/1000=0.468, h: (300-32)/100=2.68 => min is 0.468
    expect(computeFitZoom(container, image)).toBeCloseTo(0.468);
  });

  it('clamps to min zoom', () => {
    const container = { width: 100, height: 100 };
    const image = { width: 5000, height: 5000 };
    // (100-32)/5000=0.0136 <0.1 => clamp to 0.1
    expect(computeFitZoom(container, image)).toBe(CANVAS_MIN_ZOOM);
  });

  it('handles zero or negative fit values -> fallback to 1 clamped', () => {
    const container = { width: 10, height: 10 };
    const image = { width: 100, height: 100 };
    // (10-32)/100 = -0.22 => fits negative, Math.min(-0.22, -0.22,1)=-0.22 => clamp to 0.1
    // But spec code does fitZoom ||1, so negative would be clamped to min
    // Actually -0.22 ||1 => -0.22 is truthy, so not fallback. Then clamp =>0.1
    expect(computeFitZoom(container, image)).toBe(CANVAS_MIN_ZOOM);
  });
});

describe('computeFitTransform', () => {
  it('centers image in container', () => {
    const container = { width: 500, height: 500 };
    const image = { width: 100, height: 100 };
    // zoom =1 (small image)
    const { zoom, pan } = computeFitTransform(container, image);
    expect(zoom).toBe(1);
    expect(pan.x).toBe((500 - 100 * 1) / 2);
    expect(pan.y).toBe((500 - 100 * 1) / 2);
    expect(pan.x).toBe(200);
    expect(pan.y).toBe(200);
  });

  it('computes pan for scaled image', () => {
    const container = { width: 500, height: 500 };
    const image = { width: 1000, height: 1000 };
    const { zoom, pan } = computeFitTransform(container, image);
    const expectedZoom = (500 - CANVAS_FIT_PADDING) / 1000;
    expect(zoom).toBeCloseTo(expectedZoom);
    expect(pan.x).toBeCloseTo((500 - 1000 * expectedZoom) / 2);
  });

  it('is consistent with computeFitZoom', () => {
    const container = { width: 800, height: 600 };
    const image = { width: 400, height: 800 };
    const zoom = computeFitZoom(container, image);
    const { zoom: tZoom } = computeFitTransform(container, image);
    expect(tZoom).toBe(zoom);
  });
});

describe('computeWheelNextZoom', () => {
  it('zooms in when deltaY negative', () => {
    const next = computeWheelNextZoom(1, -100);
    expect(next).toBeGreaterThan(1);
  });

  it('zooms out when deltaY positive', () => {
    const next = computeWheelNextZoom(1, 100);
    expect(next).toBeLessThan(1);
  });

  it('no change when deltaY 0', () => {
    expect(computeWheelNextZoom(1, 0)).toBe(1);
  });

  it('clamps to max zoom', () => {
    expect(computeWheelNextZoom(CANVAS_MAX_ZOOM, -1000)).toBe(CANVAS_MAX_ZOOM);
  });

  it('clamps to min zoom', () => {
    expect(computeWheelNextZoom(CANVAS_MIN_ZOOM, 1000)).toBe(CANVAS_MIN_ZOOM);
  });

  it('uses exponential factor', () => {
    // factor = exp(-delta*0.0015)
    // For delta -100, factor=exp(0.15)=1.1618
    const next = computeWheelNextZoom(2, -100);
    expect(next).toBeCloseTo(2 * Math.exp(0.15));
  });
});

describe('computeWheelPan', () => {
  it('keeps cursor anchored', () => {
    // If zoom doubles, pan should shift so cursor stays over same image point
    const cursor = { x: 100, y: 100 };
    const currentPan = { x: 0, y: 0 };
    const currentZoom = 1;
    const nextZoom = 2;
    const nextPan = computeWheelPan(cursor, currentPan, currentZoom, nextZoom);
    // x = 100 - ((100-0)*2)/1 = 100 -200 = -100
    expect(nextPan.x).toBe(-100);
    expect(nextPan.y).toBe(-100);
  });

  it('no pan change if zoom unchanged', () => {
    const cursor = { x: 50, y: 50 };
    const pan = { x: 10, y: 20 };
    expect(computeWheelPan(cursor, pan, 1, 1)).toEqual(pan);
  });

  it('handles arbitrary values', () => {
    const cursor = { x: 200, y: 150 };
    const pan = { x: 10, y: 20 };
    const next = computeWheelPan(cursor, pan, 1.5, 1.8);
    expect(next.x).toBeCloseTo(200 - ((200 - 10) * 1.8) / 1.5);
    expect(next.y).toBeCloseTo(150 - ((150 - 20) * 1.8) / 1.5);
  });
});

describe('computePanDelta', () => {
  it('moves pan by mouse delta', () => {
    const dragStart = { x: 0, y: 0 };
    const dragPan = { x: 10, y: 20 };
    const current = { x: 100, y: 50 };
    expect(computePanDelta(dragStart, dragPan, current)).toEqual({
      x: 110,
      y: 70,
    });
  });

  it('no movement when mouse not moved', () => {
    const start = { x: 50, y: 50 };
    const pan = { x: 5, y: 5 };
    expect(computePanDelta(start, pan, { x: 50, y: 50 })).toEqual(pan);
  });

  it('handles negative movement', () => {
    expect(
      computePanDelta({ x: 100, y: 100 }, { x: 0, y: 0 }, { x: 50, y: 50 })
    ).toEqual({ x: -50, y: -50 });
  });
});

describe('nextZoomIn / nextZoomOut', () => {
  it('zooms in by ZOOM_STEP', () => {
    expect(nextZoomIn(1)).toBeCloseTo(1 * CANVAS_ZOOM_STEP);
    expect(nextZoomIn(2)).toBeCloseTo(2 * CANVAS_ZOOM_STEP);
  });

  it('zooms out by ZOOM_STEP', () => {
    expect(nextZoomOut(1)).toBeCloseTo(1 / CANVAS_ZOOM_STEP);
    expect(nextZoomOut(2)).toBeCloseTo(2 / CANVAS_ZOOM_STEP);
  });

  it('clamps in at max', () => {
    expect(nextZoomIn(CANVAS_MAX_ZOOM)).toBe(CANVAS_MAX_ZOOM);
    expect(nextZoomIn(100)).toBe(CANVAS_MAX_ZOOM);
  });

  it('clamps out at min', () => {
    expect(nextZoomOut(CANVAS_MIN_ZOOM)).toBe(CANVAS_MIN_ZOOM);
    expect(nextZoomOut(0.01)).toBe(CANVAS_MIN_ZOOM);
  });

  it('multiple steps compound', () => {
    let z = 1;
    z = nextZoomIn(z);
    z = nextZoomIn(z);
    expect(z).toBeCloseTo(1 * CANVAS_ZOOM_STEP * CANVAS_ZOOM_STEP);
  });
});

describe('isValidContainerSize', () => {
  it('false for zero or negative', () => {
    expect(isValidContainerSize({ width: 0, height: 0 })).toBe(false);
    expect(isValidContainerSize({ width: 0, height: 10 })).toBe(false);
    expect(isValidContainerSize({ width: 10, height: 0 })).toBe(false);
    expect(isValidContainerSize({ width: -1, height: 10 })).toBe(false);
  });

  it('true for positive', () => {
    expect(isValidContainerSize({ width: 1, height: 1 })).toBe(true);
    expect(isValidContainerSize({ width: 500, height: 500 })).toBe(true);
  });
});

describe('canFitImage', () => {
  it('false if imageSize null', () => {
    expect(canFitImage(null, { width: 100, height: 100 })).toBe(false);
  });

  it('false if container invalid', () => {
    expect(canFitImage({ width: 10, height: 10 }, { width: 0, height: 0 })).toBe(false);
  });

  it('true if both valid', () => {
    expect(canFitImage({ width: 10, height: 10 }, { width: 100, height: 100 })).toBe(true);
  });
});
