import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AsciiViz } from '@/components/atoms/Ascii/AsciiViz';

// Frame driver: same trick as the engine tests — deterministic rAF steps.
class FrameDriver {
  cbs = new Map<number, FrameRequestCallback>();
  private nextId = 1;
  now = 0;
  raf = (cb: FrameRequestCallback): number => {
    const id = this.nextId++;
    this.cbs.set(id, cb);
    return id;
  };
  cancel = (id: number): void => {
    this.cbs.delete(id);
  };
  step(ms: number): void {
    this.now += ms;
    const pending = [...this.cbs.values()];
    this.cbs.clear();
    for (const cb of pending) cb(this.now);
  }
}

let driver: FrameDriver;

const RECT = {
  width: 500,
  height: 12,
  top: 0,
  left: 0,
  right: 500,
  bottom: 12,
  x: 0,
  y: 0,
  toJSON: () => ({}),
} as DOMRect;

beforeEach(() => {
  driver = new FrameDriver();
  vi.stubGlobal('requestAnimationFrame', driver.raf);
  vi.stubGlobal('cancelAnimationFrame', driver.cancel);
  vi.stubGlobal('performance', { now: () => driver.now });
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    fontSize: '10px',
    lineHeight: '12px',
  } as unknown as CSSStyleDeclaration);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    RECT
  );
  // jsdom reports 0 for client sizes; a 48x24-cell canvas mirrors the browser.
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    value: 480,
    configurable: true,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    value: 288,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (HTMLElement.prototype as { clientWidth?: unknown }).clientWidth;
  delete (HTMLElement.prototype as { clientHeight?: unknown }).clientHeight;
});

function canvasOf(container: HTMLElement): HTMLElement {
  return container.querySelectorAll('pre')[0];
}

describe('<AsciiViz />', () => {
  it('renders with zero required props', () => {
    const { container } = render(<AsciiViz />);
    act(() => driver.step(100));
    expect(canvasOf(container).textContent).toMatch(/[^\s]/);
  });

  it('renders every program type', () => {
    const types = [
      'voronoi',
      'flowfield',
      'plasma',
      'raymarch',
      'warp',
    ] as const;
    for (const type of types) {
      const { container } = render(<AsciiViz type={type} seed={5} />);
      act(() => driver.step(100));
      expect(canvasOf(container).textContent).toMatch(/[^\s]/);
      cleanup();
    }
  });

  it('same type + seed produces identical output', () => {
    const a = render(<AsciiViz type='plasma' seed={99} rows={8} />);
    act(() => driver.step(1000));
    const textA = canvasOf(a.container).textContent;
    a.unmount();
    const b = render(<AsciiViz type='plasma' seed={99} rows={8} />);
    act(() => driver.step(1000));
    const textB = canvasOf(b.container).textContent;
    expect(textA).toBe(textB);
    b.unmount();
  });

  it('different seeds diverge', () => {
    const a = render(<AsciiViz type='warp' seed={1} rows={8} />);
    act(() => driver.step(1000));
    const textA = canvasOf(a.container).textContent;
    a.unmount();
    const b = render(<AsciiViz type='warp' seed={2} rows={8} />);
    act(() => driver.step(1000));
    const textB = canvasOf(b.container).textContent;
    expect(textA).not.toBe(textB);
    b.unmount();
  });

  it('applies the type preset density to the container height', () => {
    // warp preset density is 12, rows default 24 → 12 * 1.2 * 24 = 345.6 → 346
    const { container } = render(<AsciiViz type='warp' />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.height).toBe('346px');
  });

  it('density and rows props override the preset sizing', () => {
    const { container } = render(<AsciiViz density={10} rows={10} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.height).toBe('120px'); // 10 * 1.2 * 10
  });

  it('respects the paused prop', () => {
    const { container } = render(<AsciiViz type='voronoi' paused />);
    act(() => driver.step(1000));
    expect(canvasOf(container).textContent).toBe('');
  });

  it('passes color overrides through to cells', () => {
    const { container } = render(
      <AsciiViz type='flowfield' seed={3} color='#00ff00' rows={6} />
    );
    act(() => driver.step(100));
    const span = canvasOf(container).querySelector('span[style*="color"]');
    expect(span?.getAttribute('style')).toContain('#00ff00');
  });

  it('exposes alt text as the aria label', () => {
    const { container } = render(<AsciiViz type='plasma' alt='plasma lake' />);
    expect(
      container.querySelector('[aria-label="plasma lake"]')
    ).not.toBeNull();
  });

  it('cleans up on unmount', () => {
    const { container, unmount } = render(<AsciiViz type='warp' />);
    act(() => driver.step(100));
    expect(canvasOf(container).textContent).not.toBe('');
    unmount();
    expect(container.querySelectorAll('pre')).toHaveLength(0);
  });
});
