import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

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
 * One frame character cell. Renders its final `target` glyph (so layout is
 * identical regardless of what is currently displayed), but keeps it at
 * opacity 0 until the reveal begins, then swaps in random glyphs and settles.
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

  const [display, setDisplay] = useState(target);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Reduced motion / not yet triggered: show the settled glyph or stay blank.
    if (instant) {
      setDisplay(target);
      setVisible(true);
      return;
    }
    if (!start) {
      setDisplay(target);
      setVisible(false);
      return;
    }

    let alive = true;
    let interval: ReturnType<typeof setInterval> | undefined;

    const t = setTimeout(() => {
      if (!alive) return;
      setVisible(true);
      const span = Math.max(0, cyclesMax - cyclesMin + 1);
      const total = cyclesMin + Math.floor(Math.random() * span);
      let n = 0;
      const tick = () => {
        if (!alive) return;
        n += 1;
        if (n >= total) {
          setDisplay(target);
          if (interval) clearInterval(interval);
        } else if (charset.length > 0) {
          setDisplay(charset[Math.floor(Math.random() * charset.length)]);
        }
      };
      tick();
      interval = setInterval(tick, speed);
    }, delay);

    return () => {
      alive = false;
      clearTimeout(t);
      if (interval) clearInterval(interval);
    };
  }, [start, instant, target, delay, speed, cyclesMin, cyclesMax, charset]);

  return (
    <span
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
        opacity: visible ? 1 : 0,
      }}
    >
      {display}
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
