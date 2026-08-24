import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Alphabet used for the random "decode" glyphs. Box-drawing + symbols so the
 * scramble reads as terminal noise. Backslash is escaped, quote is literal.
 */
export const SCRAMBLE_CHARSET = '█▓▒░/\\|<>+-*_=~·∙◦#$@%&"';

/** Options for the `reveal` prop on AsciiBox. */
export interface RevealConfig {
  /** 'mount' = animate on hydration; 'inView' = animate on first scroll into view. */
  trigger?: 'mount' | 'inView';
  /** Milliseconds added per diagonal step (row + col). Default 20. */
  stagger?: number;
  /** Milliseconds between random glyph swaps. Default 45. */
  speed?: number;
  /** Inclusive range of random swap counts per cell before settling. Default [3, 8]. */
  cycles?: [number, number];
  /** Override the random glyph alphabet. Defaults to SCRAMBLE_CHARSET. */
  charset?: string;
}

/**
 * Shared, single rAF loop that drives every active scramble cell. Instead of
 * handing each character its own setInterval (hundreds of timers plus a React
 * re-render per swap), every cell registers here and is ticked from one frame,
 * writing its glyph straight to the DOM. One rAF no matter how many boxes
 * reveal at once, and zero React renders during the animation.
 */
const activeCells = new Set<ScrambleRunner>();
let scrambleRaf: number | null = null;

function scrambleFrame(now: number): void {
  for (const cell of activeCells) cell.tick(now);
  scrambleRaf = activeCells.size > 0 ? requestAnimationFrame(scrambleFrame) : null;
}

function ensureScrambleLoop(): void {
  if (scrambleRaf == null && activeCells.size > 0) {
    scrambleRaf = requestAnimationFrame(scrambleFrame);
  }
}

class ScrambleRunner {
  private readonly span: HTMLSpanElement;
  private readonly target: string;
  private readonly charset: string;
  private readonly delay: number;
  private readonly speed: number;
  private readonly total: number;
  private begin: number | null = null;
  private started = false;
  private swapCount = 0;
  private nextSwapAt = 0;

  constructor(
    span: HTMLSpanElement,
    opts: {
      target: string;
      charset: string;
      delay: number;
      speed: number;
      cyclesMin: number;
      cyclesMax: number;
    }
  ) {
    this.span = span;
    this.target = opts.target;
    this.charset = opts.charset;
    this.delay = opts.delay;
    this.speed = opts.speed;
    const spanN = Math.max(0, opts.cyclesMax - opts.cyclesMin + 1);
    this.total = opts.cyclesMin + Math.floor(Math.random() * spanN);
  }

  start(now: number): void {
    this.begin = now;
    activeCells.add(this);
    ensureScrambleLoop();
  }

  dispose(): void {
    activeCells.delete(this);
  }

  private randomGlyph(): string {
    if (this.charset.length === 0) return this.target;
    return this.charset[Math.floor(Math.random() * this.charset.length)];
  }

  tick(now: number): void {
    if (this.begin == null) return;
    const elapsed = now - this.begin;
    if (elapsed < this.delay) {
      this.span.style.opacity = '0';
      return;
    }
    if (!this.started) {
      this.started = true;
      this.span.style.opacity = '1';
      this.swapCount = 1;
      this.nextSwapAt = this.begin + this.delay + this.speed;
      this.span.textContent = this.total <= 1 ? this.target : this.randomGlyph();
      if (this.swapCount >= this.total) this.finish();
      return;
    }
    while (this.swapCount < this.total && now >= this.nextSwapAt) {
      this.swapCount += 1;
      this.nextSwapAt += this.speed;
      if (this.swapCount >= this.total) {
        this.finish();
        return;
      }
      this.span.textContent = this.randomGlyph();
    }
  }

  private finish(): void {
    this.span.textContent = this.target;
    this.span.style.opacity = '1';
    activeCells.delete(this);
  }
}

/**
 * One frame character cell. Renders its final `target` glyph (so layout is
 * identical regardless of what is currently displayed), but keeps it at
 * opacity 0 until the reveal begins, then swaps in random glyphs and settles.
 * The scramble itself is driven by a single shared rAF loop (see above) and
 * written to the DOM directly, so revealing many boxes at once stays cheap.
 */
export function ScrambleChar(props: {
  target: string;
  delay: number;
  speed: number;
  cyclesMin: number;
  cyclesMax: number;
  charset: string;
  color?: string;
  start?: boolean;
  instant?: boolean;
  inline?: boolean;
  align?: 'left' | 'center';
}) {
  const {
    target,
    delay,
    speed,
    cyclesMin,
    cyclesMax,
    charset,
    color,
    start = true,
    instant = false,
    inline = false,
    align = 'center',
  } = props;

  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const span = spanRef.current;
    if (!span) return;
    // Reduced motion / not yet triggered: show the settled glyph or stay blank.
    if (instant) {
      span.textContent = target;
      span.style.opacity = '1';
      return;
    }
    if (!start) {
      span.textContent = target;
      span.style.opacity = '0';
      return;
    }
    const runner = new ScrambleRunner(span, {
      target,
      charset,
      delay,
      speed,
      cyclesMin,
      cyclesMax,
    });
    runner.start(performance.now());
    return () => runner.dispose();
  }, [start, instant, target, delay, speed, cyclesMin, cyclesMax, charset]);

  return (
    <span
      ref={spanRef}
      aria-hidden="true"
      style={{
        display: inline ? 'inline-block' : 'block',
        width: '1ch',
        ...(inline ? {} : { height: '1lh' }),
        lineHeight: '1lh',
        textAlign: align,
        overflow: 'hidden',
        whiteSpace: 'pre',
        color: color ?? 'inherit',
        opacity: instant ? 1 : 0,
      }}
    >
      {target}
    </span>
  );
}

/**
 * A single character that periodically "glitches": it scrambles through random
 * glyphs from the box alphabet and settles back to `target`. The burst is driven
 * by the same shared rAF loop as ScrambleChar, so many glitching chars stay
 * cheap. Triggers are scheduled at a random interval between `minDelay` and
 * `maxDelay` ms, so the effect fires occasionally rather than constantly.
 *
 * Color is inherited (no inline color), so a wrapping element can still drive
 * it via `group-hover` or other state.
 */
export function GlitchChar(props: {
  target: string;
  charset?: string;
  minDelay?: number;
  maxDelay?: number;
  speed?: number;
  cyclesMin?: number;
  cyclesMax?: number;
}) {
  const {
    target,
    charset = SCRAMBLE_CHARSET,
    minDelay = 4000,
    maxDelay = 12000,
    speed = 45,
    cyclesMin = 3,
    cyclesMax = 8,
  } = props;
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const span = spanRef.current;
    if (!span) return;
    if (reduced) {
      span.textContent = target;
      span.style.opacity = '1';
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const run = (): void => {
      const runner = new ScrambleRunner(span, {
        target,
        charset,
        delay: 0,
        speed,
        cyclesMin,
        cyclesMax,
      });
      runner.start(performance.now());
    };
    const schedule = (): void => {
      const wait = minDelay + Math.random() * Math.max(0, maxDelay - minDelay);
      timer = setTimeout(() => {
        run();
        schedule();
      }, wait);
    };
    span.textContent = target;
    span.style.opacity = '1';
    schedule();
    return () => clearTimeout(timer);
  }, [reduced, target, charset, minDelay, maxDelay, speed, cyclesMin, cyclesMax]);

  return (
    <span
      ref={spanRef}
      aria-hidden="true"
      style={{
        display: 'block',
        width: '1ch',
        height: '1lh',
        lineHeight: '1lh',
        textAlign: 'center',
        overflow: 'hidden',
        whiteSpace: 'pre',
        opacity: 1,
      }}
    >
      {target}
    </span>
  );
}

/** Respects `prefers-reduced-motion`; false on first render, updated after mount. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    // Fallback for older Safari.
    if (typeof (mq as any).addListener === 'function') {
      (mq as any).addListener(onChange);
      return () => (mq as any).removeListener(onChange);
    }
  }, []);
  return reduced;
}

/**
 * Returns true once the element is scrolled into view (or immediately when
 * `enabled` is false). Uses a one-shot IntersectionObserver.
 */
export function useInViewOnce(ref: RefObject<Element | null>, enabled: boolean): boolean {
  const [inView, setInView] = useState(!enabled);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, ref]);
  return inView;
}
