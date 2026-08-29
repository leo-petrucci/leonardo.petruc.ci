import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InfiniteCanvas } from '@/components/Ditherizer/InfiniteCanvas';

class MockResizeObserver {
  cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  observe() {
    // Immediately call with container size 500x500
    this.cb([{ contentRect: { width: 500, height: 500 } } as unknown as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
  unobserve() {}
  disconnect() {}
  static instance: MockResizeObserver | null = null;
}

beforeEach(() => {
  // @ts-ignore
  global.ResizeObserver = MockResizeObserver;
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    get() { return 500; },
    configurable: true,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    get() { return 500; },
    configurable: true,
  });
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 500,
    height: 500,
    top: 0,
    left: 0,
    right: 500,
    bottom: 500,
    x: 0,
    y: 0,
    toJSON: () => {},
  })) as unknown as () => DOMRect;
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function getWorldTransform(canvas: HTMLElement): { x: number; y: number; zoom: number } {
  const world = canvas.querySelector('.will-change-transform') as HTMLElement;
  const transform = world.style.transform; // "translate(200px, 200px) scale(1)"
  const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([-\d.]+)\)/);
  if (!match) return { x: 0, y: 0, zoom: 1 };
  return { x: parseFloat(match[1]), y: parseFloat(match[2]), zoom: parseFloat(match[3]) };
}

function triggerImageLoad(img: HTMLImageElement, w = 100, h = 100) {
  Object.defineProperty(img, 'naturalWidth', { value: w, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: h, configurable: true });
  fireEvent.load(img);
}

describe('InfiniteCanvas pan/zoom persistence - BUG reproduction', () => {
  it('BUG: pan resets when url changes (changing dither values)', async () => {
    const onFile = vi.fn();
    const { rerender } = render(
      <InfiniteCanvas url="blob:a" label="Processed" outputSize={{ width: 100, height: 100 }} maxColors={256} showSlowProcessing={false} onFileSelected={onFile} fileKey="file-a" />
    );
    const canvas = screen.getByTestId('infinite-canvas');
    const img = document.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    await act(async () => {
      triggerImageLoad(img, 100, 100);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    // Record initial transform (could be 0,0 or 200,200 depending on fit timing)
    // Instead, we will pan from current position and then check preservation
    const beforePan = getWorldTransform(canvas);
    // User pans to new position by (50,30)
    await act(async () => {
      fireEvent.pointerDown(canvas, { clientX: 0, clientY: 0, button: 0, pointerId: 1 });
      fireEvent.pointerMove(canvas, { clientX: 50, clientY: 30 });
      fireEvent.pointerUp(canvas, { pointerId: 1 });
    });
    let t = getWorldTransform(canvas);
    const expectedX = beforePan.x + 50;
    const expectedY = beforePan.y + 30;
    expect(t.x).toBe(expectedX);
    expect(t.y).toBe(expectedY);

    // User zooms in
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Zoom in'));
    });
    t = getWorldTransform(canvas);
    const expectedZoom = 1.25; // if initial was 1, now 1.25; if initial was something else, we check relative
    // For this test, we just check it increased
    expect(t.zoom).toBeGreaterThan(beforePan.zoom);

    const panBeforeUrlChange = getWorldTransform(canvas);

    // Now simulate changing dither value: url changes to new blob with SAME dimensions (reprocessed) but same fileKey
    await act(async () => {
      rerender(
        <InfiniteCanvas url="blob:b" label="Processed" outputSize={{ width: 100, height: 100 }} maxColors={64} showSlowProcessing={false} onFileSelected={onFile} fileKey="file-a" />
      );
    });
    const newImg = document.querySelector('img') as HTMLImageElement;
    await act(async () => {
      triggerImageLoad(newImg, 100, 100);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    t = getWorldTransform(canvas);
    // EXPECTED: pan and zoom should be PRESERVED
    // CURRENT BUG: it resets to centered (200,200) and 1
    expect(t.x).toBe(panBeforeUrlChange.x);
    expect(t.y).toBe(panBeforeUrlChange.y);
    expect(t.zoom).toBe(panBeforeUrlChange.zoom);
  });

  it('BUG: zoom resets when url changes', async () => {
    const onFile = vi.fn();
    const { rerender } = render(
      <InfiniteCanvas url="blob:a" label="Processed" outputSize={{ width: 100, height: 100 }} maxColors={256} showSlowProcessing={false} onFileSelected={onFile} fileKey="file-a" />
    );
    const canvas = screen.getByTestId('infinite-canvas');
    const img = document.querySelector('img') as HTMLImageElement;
    await act(async () => {
      triggerImageLoad(img, 100, 100);
    });
    await waitFor(() => expect(getWorldTransform(canvas).zoom).toBe(1));

    // Zoom in twice
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Zoom in'));
      fireEvent.click(screen.getByLabelText('Zoom in'));
    });
    let t = getWorldTransform(canvas);
    expect(t.zoom).toBeCloseTo(1.5625); // 1*1.25*1.25

    await act(async () => {
      rerender(
        <InfiniteCanvas url="blob:b" label="Processed" outputSize={{ width: 100, height: 100 }} maxColors={32} showSlowProcessing={false} onFileSelected={onFile} fileKey="file-a" />
      );
    });
    const newImg = document.querySelector('img') as HTMLImageElement;
    await act(async () => {
      triggerImageLoad(newImg, 100, 100);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    t = getWorldTransform(canvas);
    // Should preserve zoom
    expect(t.zoom).toBeCloseTo(1.5625);
  });

  it('should reset when new file is loaded (different source)', async () => {
    const onFile = vi.fn();
    const { rerender } = render(
      <InfiniteCanvas url="blob:file1" label="Processed" outputSize={{ width: 100, height: 100 }} maxColors={256} showSlowProcessing={false} onFileSelected={onFile} fileKey="file1" />
    );
    const canvas = screen.getByTestId('infinite-canvas');
    const img = document.querySelector('img') as HTMLImageElement;
    await act(async () => {
      triggerImageLoad(img, 100, 100);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    await act(async () => {
      fireEvent.pointerDown(canvas, { clientX: 0, clientY: 0, button: 0, pointerId: 1 });
      fireEvent.pointerMove(canvas, { clientX: 100, clientY: 100 });
      fireEvent.pointerUp(canvas, { pointerId: 1 });
    });
    // New file with different dimensions and different fileKey - should refit
    await act(async () => {
      rerender(
        <InfiniteCanvas url="blob:file2" label="Processed" outputSize={{ width: 200, height: 200 }} maxColors={256} showSlowProcessing={false} onFileSelected={onFile} fileKey="file2" />
      );
    });
    const newImg = document.querySelector('img') as HTMLImageElement;
    await act(async () => {
      triggerImageLoad(newImg, 200, 200);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    const t = getWorldTransform(canvas);
    // New file should refit to centered: (500-200)/2 =150
    expect(t.x).toBe(150);
    expect(t.y).toBe(150);
    // Zoom should be reset to 1 (fit)
    expect(t.zoom).toBe(1);
  });
});
