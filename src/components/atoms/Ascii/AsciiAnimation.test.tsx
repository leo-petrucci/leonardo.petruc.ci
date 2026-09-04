import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AsciiAnimation,
  createPlayer,
  type FrameCtx,
  type Program,
} from '@/components/atoms/Ascii/AsciiAnimation';

/**
 * Deterministic rAF driver: tests step the clock manually instead of relying
 * on timers, so fps throttling can be exercised frame by frame.
 */
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

  /** Advance the clock and run every pending callback once. */
  step(ms: number): void {
    this.now += ms;
    const pending = [...this.cbs.values()];
    this.cbs.clear();
    for (const cb of pending) cb(this.now);
  }

  get pending(): number {
    return this.cbs.size;
  }
}

/** A test program: boot/pre spies plus a char chosen by row. */
function makeSpyProgram() {
  const program = {
    fps: 30,
    boot: vi.fn((_ctx: FrameCtx, _state: Record<string, unknown>) => {}),
    pre: vi.fn((_ctx: FrameCtx, _state: Record<string, unknown>) => {}),
    main: vi.fn(
      ({ y }: { x: number; y: number; index: number }) =>
        String.fromCharCode(65 + (y % 26))
    ),
  };
  return program satisfies Program & {
    boot: typeof program.boot;
    pre: typeof program.pre;
    main: typeof program.main;
  };
}

const RECT = {
  width: 500,
  height: 12,
  top: 6,
  left: 5,
  right: 505,
  bottom: 18,
  x: 5,
  y: 6,
  toJSON: () => ({}),
} as DOMRect;

let currentDriver: FrameDriver;

beforeEach(() => {
  currentDriver = new FrameDriver();
  const driver = currentDriver;
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
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* ---------- createPlayer ---------- */

describe('createPlayer', () => {
  function mount() {
    const pre = document.createElement('pre');
    document.body.appendChild(pre);
    return pre;
  }

  it('boots once on creation with the fixed grid size', () => {
    const pre = mount();
    const program = makeSpyProgram();
    createPlayer(program, pre, { cols: 10, rows: 4 });
    expect(program.boot).toHaveBeenCalledTimes(1);
    const ctx = program.boot.mock.calls[0][0] as FrameCtx;
    expect(ctx.cols).toBe(10);
    expect(ctx.rows).toBe(4);
    expect(ctx.frame).toBe(0);
  });

  it('renders one row span per row in fixed mode', () => {
    const pre = mount();
    const program = makeSpyProgram();
    createPlayer(program, pre, { cols: 10, rows: 4 });
    act(() => currentDriver.step(100));
    expect(pre.childElementCount).toBe(4);
    expect(pre.textContent).toContain('AAAAAAAAAA');
  });

  it('derives cols/rows from the element size in fill mode', () => {
    const pre = mount();
    Object.defineProperty(pre, 'clientWidth', { value: 400, configurable: true });
    Object.defineProperty(pre, 'clientHeight', { value: 240, configurable: true });
    const program = makeSpyProgram();
    createPlayer(program, pre);
    const ctx = program.boot.mock.calls[0][0] as FrameCtx;
    expect(ctx.cols).toBe(40); // floor(400 / 10)
    expect(ctx.rows).toBe(20); // floor(240 / 12)
  });

  it('throttles to the program fps', () => {
    const pre = mount();
    const program = makeSpyProgram(); // fps 30 → 33.3ms interval
    createPlayer(program, pre, { cols: 10, rows: 4 });
    act(() => currentDriver.step(16));
    expect(program.pre).not.toHaveBeenCalled(); // 16ms < 33ms
    act(() => currentDriver.step(16)); // now 32ms — still short
    expect(program.pre).not.toHaveBeenCalled();
    act(() => currentDriver.step(2)); // now 34ms — frame runs
    expect(program.pre).toHaveBeenCalledTimes(1);
  });

  it('calls main for every cell of every executed frame', () => {
    const pre = mount();
    const program = makeSpyProgram();
    createPlayer(program, pre, { cols: 10, rows: 4 });
    act(() => currentDriver.step(100));
    expect(program.main).toHaveBeenCalledTimes(40);
    act(() => currentDriver.step(100));
    expect(program.main).toHaveBeenCalledTimes(80);
  });

  it('keeps the frame counter monotonic across frames', () => {
    const pre = mount();
    const program = makeSpyProgram();
    createPlayer(program, pre, { cols: 10, rows: 4 });
    act(() => currentDriver.step(100));
    act(() => currentDriver.step(100));
    const ctx1 = (program.pre.mock.calls[0][0] as FrameCtx).frame;
    const ctx2 = (program.pre.mock.calls[1][0] as FrameCtx).frame;
    expect(ctx2).toBe(ctx1 + 1);
  });

  it('togglePlay pauses and resumes without re-booting', () => {
    const pre = mount();
    const program = makeSpyProgram();
    const player = createPlayer(program, pre, { cols: 10, rows: 4 });
    act(() => currentDriver.step(100));
    player.togglePlay(false);
    expect(currentDriver.pending).toBe(0);
    act(() => currentDriver.step(1000));
    expect(program.pre).toHaveBeenCalledTimes(1);
    player.togglePlay(true);
    act(() => currentDriver.step(100));
    expect(program.pre).toHaveBeenCalledTimes(2);
    expect(program.boot).toHaveBeenCalledTimes(1);
  });

  it('restart re-boots and replays', () => {
    const pre = mount();
    const program = makeSpyProgram();
    const player = createPlayer(program, pre, { cols: 10, rows: 4 });
    act(() => currentDriver.step(100));
    expect(program.boot).toHaveBeenCalledTimes(1);
    player.restart();
    expect(program.boot).toHaveBeenCalledTimes(2);
    act(() => currentDriver.step(100));
    expect(program.pre).toHaveBeenCalledTimes(2);
  });

  it('re-boots when the container resizes in fill mode', () => {
    const pre = mount();
    let w = 400;
    Object.defineProperty(pre, 'clientWidth', {
      get: () => w,
      configurable: true,
    });
    Object.defineProperty(pre, 'clientHeight', { value: 240, configurable: true });
    const program = makeSpyProgram();
    createPlayer(program, pre);
    expect(program.boot).toHaveBeenCalledTimes(1);
    act(() => currentDriver.step(100));
    w = 200;
    act(() => currentDriver.step(100));
    expect(program.boot).toHaveBeenCalledTimes(2);
    const ctx = program.boot.mock.calls[1][0] as FrameCtx;
    expect(ctx.cols).toBe(20);
  });

  it('tracks pointer position in cell coordinates', () => {
    const pre = mount();
    let pointer = { x: -1, y: -1, pressed: false };
    const program: Program = {
      fps: 30,
      pre: (_ctx) => {},
      main: (_cell, ctx) => {
        pointer = ctx.pointer;
        return ' ';
      },
    };
    createPlayer(program, pre, { cols: 10, rows: 4 });
    pre.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 55, clientY: 30 })
    );
    pre.dispatchEvent(new PointerEvent('pointerdown', {}));
    act(() => currentDriver.step(100));
    // rect left 5, top 6; cw 10, lh 12 → x (55-5)/10 = 5, y (30-6)/12 = 2
    expect(pointer.x).toBeCloseTo(5);
    expect(pointer.y).toBeCloseTo(2);
    expect(pointer.pressed).toBe(true);
    pre.dispatchEvent(new PointerEvent('pointerup', {}));
    act(() => currentDriver.step(100));
    expect(pointer.pressed).toBe(false);
  });

  it('renders spaces for empty chars returned by main', () => {
    const pre = mount();
    const program: Program = {
      fps: 60,
      main: ({ x }) => (x % 2 === 0 ? 'x' : ''),
    };
    createPlayer(program, pre, { cols: 4, rows: 1 });
    act(() => currentDriver.step(100));
    expect(pre.textContent).toBe('x x ');
  });

  it('escapes < and & in program output', () => {
    const pre = mount();
    const program: Program = {
      fps: 60,
      main: ({ x }) => (x === 0 ? '<' : '&'),
    };
    createPlayer(program, pre, { cols: 2, rows: 1 });
    act(() => currentDriver.step(100));
    expect(pre.textContent).toBe('<&');
    expect(pre.innerHTML).toContain('&lt;');
    expect(pre.innerHTML).toContain('&amp;');
  });

  it('only rewrites rows whose cells changed', () => {
    const pre = mount();
    let frame = 0;
    const program: Program = {
      fps: 60,
      main: ({ y }) => (frame === 0 ? 'a' : y === 0 ? 'b' : 'a'),
    };
    createPlayer(program, pre, { cols: 3, rows: 2 });
    act(() => currentDriver.step(100));
    const row0 = pre.childNodes[0] as HTMLElement;
    const row1 = pre.childNodes[1] as HTMLElement;
    const inner0 = row0.innerHTML;
    const inner1 = row1.innerHTML;
    frame = 1;
    act(() => currentDriver.step(100));
    expect(row0.innerHTML).not.toBe(inner0); // row 0 changed
    expect(row1.innerHTML).toBe(inner1); // row 1 untouched
  });

  it('cleanup stops the loop and empties the element', () => {
    const pre = mount();
    const program = makeSpyProgram();
    const player = createPlayer(program, pre, { cols: 10, rows: 4 });
    act(() => currentDriver.step(100));
    expect(currentDriver.pending).toBe(1);
    player.cleanup();
    expect(currentDriver.pending).toBe(0);
    expect(pre.childElementCount).toBe(0);
    act(() => currentDriver.step(1000));
    expect(program.pre).toHaveBeenCalledTimes(1);
  });

  it('does nothing after cleanup even if restart is called', () => {
    const pre = mount();
    const program = makeSpyProgram();
    const player = createPlayer(program, pre, { cols: 10, rows: 4 });
    player.cleanup();
    player.restart();
    expect(program.boot).toHaveBeenCalledTimes(1); // no second boot
  });
});

/* ---------- AsciiAnimation component ---------- */

describe('<AsciiAnimation />', () => {
  const simpleProgram: Program = {
    fps: 60,
    main: ({ x, y }) => String.fromCharCode(97 + ((x + y) % 26)),
  };

  it('renders a placeholder grid in fixed mode', () => {
    const { container } = render(
      <AsciiAnimation program={simpleProgram} cols={8} rows={3} alt='lab' />
    );
    const pres = container.querySelectorAll('pre');
    expect(pres).toHaveLength(2);
    expect(pres[0].textContent).toBe('........\n........\n........');
    expect(pres[0].className).toContain('invisible');
  });

  it('renders one pre in fill mode', () => {
    const { container } = render(<AsciiAnimation program={simpleProgram} />);
    expect(container.querySelectorAll('pre')).toHaveLength(1);
  });

  it('exposes alt text as aria-label', () => {
    const { container } = render(
      <AsciiAnimation program={simpleProgram} cols={4} rows={2} alt='storm' />
    );
    expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('storm');
  });

  it('animates the program output into the canvas pre', () => {
    const { container } = render(
      <AsciiAnimation program={simpleProgram} cols={4} rows={2} />
    );
    const canvas = container.querySelectorAll('pre')[1];
    expect(canvas.textContent).toBe('');
    act(() => currentDriver.step(100));
    // rows are block spans: textContent concatenates without newlines
    expect(canvas.textContent).toBe('abcdbcde');
  });

  it('stays frozen when paused', () => {
    const { container } = render(
      <AsciiAnimation program={simpleProgram} cols={4} rows={2} paused />
    );
    const canvas = container.querySelectorAll('pre')[1];
    act(() => currentDriver.step(100));
    expect(canvas.textContent).toBe('');
  });

  it('resumes when paused flips to false', () => {
    const { container, rerender } = render(
      <AsciiAnimation program={simpleProgram} cols={4} rows={2} paused />
    );
    const canvas = container.querySelectorAll('pre')[1];
    act(() => currentDriver.step(100));
    expect(canvas.textContent).toBe('');
    rerender(<AsciiAnimation program={simpleProgram} cols={4} rows={2} />);
    act(() => currentDriver.step(100));
    expect(canvas.textContent).toBe('abcdbcde');
  });

  it('respects prefers-reduced-motion by not animating', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true })
    );
    const { container } = render(
      <AsciiAnimation program={simpleProgram} cols={4} rows={2} />
    );
    const canvas = container.querySelectorAll('pre')[1];
    act(() => currentDriver.step(1000));
    expect(canvas.textContent).toBe('');
  });

  it('renders a single static frame with the static prop off', () => {
    // static mode: autoplay then immediate pause — canvas stays blank
    const { container } = render(
      <AsciiAnimation program={simpleProgram} cols={4} rows={2} static />
    );
    const canvas = container.querySelectorAll('pre')[1];
    act(() => currentDriver.step(1000));
    expect(canvas.textContent).toBe('');
  });

  it('re-boots when the program identity changes', () => {
    const programA: Program = { fps: 60, main: () => 'a' };
    const programB: Program = { fps: 60, main: () => 'b' };
    const { container, rerender } = render(
      <AsciiAnimation program={programA} cols={3} rows={1} />
    );
    act(() => currentDriver.step(100));
    expect(container.querySelectorAll('pre')[1].textContent).toBe('aaa');
    rerender(<AsciiAnimation program={programB} cols={3} rows={1} />);
    act(() => currentDriver.step(100));
    expect(container.querySelectorAll('pre')[1].textContent).toBe('bbb');
  });

  it('cleans up the canvas on unmount', () => {
    const { container, unmount } = render(
      <AsciiAnimation program={simpleProgram} cols={4} rows={2} />
    );
    act(() => currentDriver.step(100));
    expect(container.querySelectorAll('pre')[1].textContent).not.toBe('');
    unmount();
    expect(container.querySelectorAll('pre')).toHaveLength(0);
  });
});
