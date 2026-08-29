import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InfiniteCanvas } from '@/components/Ditherizer/InfiniteCanvas';

// Mock ResizeObserver
class MockResizeObserver {
  cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
    // @ts-ignore
    MockResizeObserver.instance = this;
  }
  observe() {
    // trigger initial measure with default size
    this.cb([{ contentRect: { width: 500, height: 500 } } as unknown as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
  unobserve() {}
  disconnect() {}
  static instance: MockResizeObserver | null = null;
}

beforeEach(() => {
  // @ts-ignore
  global.ResizeObserver = MockResizeObserver;
  // Mock getBoundingClientRect for container
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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeProps(overrides: Partial<React.ComponentProps<typeof InfiniteCanvas>> = {}) {
  return {
    url: null as string | null,
    label: 'Processed',
    outputSize: null as { width: number; height: number } | null,
    maxColors: 256,
    showSlowProcessing: false,
    onFileSelected: vi.fn(),
    ...overrides,
  };
}

describe('InfiniteCanvas', () => {
  it('renders empty state when url is null', () => {
    render(<InfiniteCanvas {...makeProps({ url: null })} />);
    expect(screen.getByText('Drop an image here')).toBeTruthy();
    expect(screen.getByText('or use the uploader on the left')).toBeTruthy();
  });

  it('does not render empty state when url present', () => {
    render(<InfiniteCanvas {...makeProps({ url: 'blob:test' })} />);
    // Empty state should not be visible - but the canvas hint is pointer-events-none, we check that url image exists?
    // The empty state is hidden; we check that the specific empty hint text is not in the center?
    // Actually the component renders empty state only when !url, so with url it should not be present
    // But the text "Drop an image here" also appears in other context? Only empty state has that pair.
    // With url, there is an <img> instead.
    const imgs = document.querySelectorAll('img');
    expect(imgs.length).toBe(1);
    expect(imgs[0].getAttribute('src')).toBe('blob:test');
  });

  it('shows metadata label and colors', () => {
    render(<InfiniteCanvas {...makeProps({ label: 'Original', maxColors: 64, outputSize: { width: 100, height: 200 } })} />);
    expect(screen.getByText('Original')).toBeTruthy();
    expect(screen.getByText(/100 x 200px/)).toBeTruthy();
    expect(screen.getByText(/64 colors/)).toBeTruthy();
  });

  it('shows -- when outputSize null', () => {
    render(<InfiniteCanvas {...makeProps({ outputSize: null })} />);
    expect(screen.getByText(/--/)).toBeTruthy();
  });

  it('renders zoom percentage', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('shows slow processing warning when true', () => {
    render(<InfiniteCanvas {...makeProps({ showSlowProcessing: true })} />);
    expect(screen.getByText(/Processing large images can take longer/)).toBeTruthy();
  });

  it('does not show warning when false', () => {
    render(<InfiniteCanvas {...makeProps({ showSlowProcessing: false })} />);
    expect(screen.queryByText(/Processing large images/)).toBeNull();
  });

  it('has floating toolbar buttons', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    expect(screen.getByLabelText('Fit to screen')).toBeTruthy();
    expect(screen.getByLabelText('Zoom in')).toBeTruthy();
    expect(screen.getByLabelText('Zoom out')).toBeTruthy();
  });

  it('zooms in on button click', async () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const zoomIn = screen.getByLabelText('Zoom in');
    expect(screen.getByText('100%')).toBeTruthy();
    fireEvent.click(zoomIn);
    expect(screen.getByText('125%')).toBeTruthy(); // 1 *1.25 =1.25 =>125%
    fireEvent.click(zoomIn);
    expect(screen.getByText('156%')).toBeTruthy(); // 1.25*1.25=1.5625 =>156%
  });

  it('zooms out on button click', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const zoomOut = screen.getByLabelText('Zoom out');
    fireEvent.click(zoomOut);
    expect(screen.getByText('80%')).toBeTruthy(); // 1/1.25=0.8
  });

  it('clamps zoom in at max 1600%', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const zoomIn = screen.getByLabelText('Zoom in');
    for (let i = 0; i < 30; i++) fireEvent.click(zoomIn);
    expect(screen.getByText('1600%')).toBeTruthy();
  });

  it('clamps zoom out at 10%', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const zoomOut = screen.getByLabelText('Zoom out');
    for (let i = 0; i < 30; i++) fireEvent.click(zoomOut);
    expect(screen.getByText('10%')).toBeTruthy();
  });

  it('handles drop of image file', () => {
    const onFile = vi.fn();
    render(<InfiniteCanvas {...makeProps({ onFileSelected: onFile })} />);
    const canvas = screen.getByTestId('infinite-canvas');
    const file = new File(['data'], 'pic.png', { type: 'image/png' });
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    fireEvent.drop(canvas, { dataTransfer, preventDefault: vi.fn() });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('ignores drop of non-image', () => {
    const onFile = vi.fn();
    render(<InfiniteCanvas {...makeProps({ onFileSelected: onFile })} />);
    const canvas = screen.getByTestId('infinite-canvas');
    const file = new File(['data'], 'a.txt', { type: 'text/plain' });
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    fireEvent.drop(canvas, { dataTransfer, preventDefault: vi.fn() });
    expect(onFile).not.toHaveBeenCalled();
  });

  it('shows drag-over highlight on dragOver', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const canvas = screen.getByTestId('infinite-canvas');
    fireEvent.dragOver(canvas, { preventDefault: vi.fn() });
    expect(screen.getByText('Drop to load image')).toBeTruthy();
  });

  it('hides drag-over on dragLeave', async () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const canvas = screen.getByTestId('infinite-canvas');
    fireEvent.dragOver(canvas, { preventDefault: vi.fn() });
    expect(screen.getByText('Drop to load image')).toBeTruthy();
    fireEvent.dragLeave(canvas);
    expect(screen.queryByText('Drop to load image')).toBeNull();
  });

  it('hides drag-over after drop', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const canvas = screen.getByTestId('infinite-canvas');
    fireEvent.dragOver(canvas, { preventDefault: vi.fn() });
    expect(screen.getByText('Drop to load image')).toBeTruthy();
    const file = new File(['data'], 'pic.png', { type: 'image/png' });
    fireEvent.drop(canvas, { dataTransfer: { files: [file] } as unknown as DataTransfer, preventDefault: vi.fn() });
    expect(screen.queryByText('Drop to load image')).toBeNull();
  });

  it('pans on pointer drag', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const canvas = screen.getByTestId('infinite-canvas');
    // Pointer down at (100,100) with button 0
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, button: 0, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 150, clientY: 80 });
    // After drag, the transform should reflect pan delta
    // The pannable world div has transform translate(...)
    const world = canvas.querySelector('.will-change-transform') as HTMLElement;
    expect(world.style.transform).toContain('translate(50px, -20px)');
  });

  it('ignores pointer down with non-left button', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    const canvas = screen.getByTestId('infinite-canvas');
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, button: 2, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });
    const world = canvas.querySelector('.will-change-transform') as HTMLElement;
    expect(world.style.transform).toBe('translate(0px, 0px) scale(1)');
  });

  it('has correct data-testid', () => {
    render(<InfiniteCanvas {...makeProps()} />);
    expect(screen.getByTestId('infinite-canvas')).toBeTruthy();
  });

  it('image has pixelated rendering and not draggable', () => {
    render(<InfiniteCanvas {...makeProps({ url: 'blob:test' })} />);
    const img = document.querySelector('img') as HTMLImageElement;
    expect(img.style.imageRendering).toBe('pixelated');
    expect(img.draggable).toBe(false);
    expect(img.alt).toBe('Dithered preview');
  });
});
