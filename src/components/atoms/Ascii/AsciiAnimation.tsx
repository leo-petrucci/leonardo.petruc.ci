import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';

/**
 * A minimal port of the play.core character-animation engine by Andreas
 * Gysin (ertdfgcvb/play.core, Apache-2.0), rebuilt from its published
 * behaviour: measure one cell of the host font, run a per-frame program over
 * a cols x rows buffer, then diff-render the buffer into row spans.
 */

/** One grid cell. An empty `char` renders as a space. */
export interface Cell {
  char: string;
  color?: string;
  backgroundColor?: string;
  fontWeight?: string;
}

/** Read-only view of the world handed to program hooks each frame. */
export interface FrameCtx {
  cols: number;
  rows: number;
  /** Monotonic frame counter (deterministic across runs with the same seed). */
  frame: number;
  /** Wall-clock ms since the player started. */
  time: number;
  /** Pointer position in cell coordinates; -1 when outside the element. */
  pointer: { x: number; y: number; pressed: boolean };
}

/**
 * A program is a set of optional hooks plus an fps hint.
 * `boot` runs once (and on restart); `pre` runs once per frame before the
 * cell pass; `main` runs for every cell and returns a Cell or a bare char.
 */
export interface Program {
  fps?: number;
  boot?(ctx: FrameCtx, state: Record<string, unknown>): void;
  pre?(ctx: FrameCtx, state: Record<string, unknown>): void;
  main(
    cell: { x: number; y: number; index: number },
    ctx: FrameCtx,
    state: Record<string, unknown>
  ): Cell | string;
}

interface Metrics {
  cw: number;
  lh: number;
}

/** Measure one character cell of the host's computed font. */
function measure(el: HTMLElement): Metrics {
  const cs = getComputedStyle(el);
  const fontSize = parseFloat(cs.fontSize);
  const probe = document.createElement('span');
  probe.textContent = 'X'.repeat(50);
  el.appendChild(probe);
  const cw = probe.getBoundingClientRect().width / 50;
  const lhRaw = cs.lineHeight;
  const lh = lhRaw === 'normal' ? fontSize * 1.2 : parseFloat(lhRaw);
  el.removeChild(probe);
  return { cw, lh };
}

const DEFAULT_CELL: Cell = { char: ' ' };

function normalizeCell(v: Cell | string | undefined): Cell {
  if (typeof v === 'string') return v ? { char: v } : DEFAULT_CELL;
  if (!v || !v.char) return DEFAULT_CELL;
  return v;
}

/* ---------- diffing renderer: one block span per row ---------- */

function createRenderer(el: HTMLElement) {
  let cache: Cell[] = [];

  function ensureRows(rows: number, cols: number) {
    while (el.childElementCount < rows) {
      const s = document.createElement('span');
      s.style.display = 'block';
      el.appendChild(s);
    }
    while (el.childElementCount > rows) {
      const last = el.lastChild;
      if (last) el.removeChild(last);
    }
    const target = rows * cols;
    if (cache.length !== target) {
      cache.length = target;
      for (let i = 0; i < target; i++) cache[i] = DEFAULT_CELL;
    }
  }

  function renderRow(row: number, cols: number, buf: Cell[]) {
    const base = row * cols;
    let dirty = false;
    for (let c = 0; c < cols; c++) {
      const next = buf[base + c];
      const prev = cache[base + c];
      if (
        prev?.char !== next.char ||
        prev?.color !== next.color ||
        prev?.backgroundColor !== next.backgroundColor ||
        prev?.fontWeight !== next.fontWeight
      ) {
        dirty = true;
        break;
      }
    }
    if (!dirty) return;

    let html = '';
    let openStyle: string | null = null;
    const close = () => {
      if (openStyle !== null) html += '</span>';
      openStyle = null;
    };
    for (let c = 0; c < cols; c++) {
      const cell = buf[base + c];
      const style =
        (cell.color ? `color:${cell.color};` : '') +
        (cell.backgroundColor ? `background:${cell.backgroundColor};` : '') +
        (cell.fontWeight ? `font-weight:${cell.fontWeight};` : '');
      if (style !== openStyle) {
        close();
        if (style) html += `<span style="${style}">`;
        openStyle = style;
      }
      html += cell.char === '<' || cell.char === '&' ? escapeChar(cell.char) : cell.char;
    }
    close();
    cache.splice(base, cols, ...buf.slice(base, base + cols));
    el.childNodes[row].textContent = null;
    (el.childNodes[row] as HTMLElement).innerHTML = html;
  }

  function escapeChar(ch: string) {
    return ch === '&' ? '&amp;' : '&lt;';
  }

  return {
    render(rows: number, cols: number, buf: Cell[]) {
      ensureRows(rows, cols);
      for (let r = 0; r < rows; r++) renderRow(r, cols, buf);
    },
    reset() {
      cache = [];
    },
  };
}

/* ---------- player: rAF loop, fps throttle, resize handling ---------- */

export interface PlayerOptions {
  /** Fixed grid size. When omitted, cols/rows derive from the element box. */
  cols?: number;
  rows?: number;
  /** Play immediately on start(). Default true. */
  autoplay?: boolean;
}

export interface Player {
  togglePlay(play?: boolean): void;
  restart(): void;
  cleanup(): void;
  isPlaying(): boolean;
}

export function createPlayer(
  program: Program,
  el: HTMLElement,
  opts: PlayerOptions = {}
): Player {
  let metrics = measure(el);
  const renderer = createRenderer(el);
  const state: Record<string, unknown> = {};
  let buffer: Cell[] = [];
  let cols = opts.cols ?? 0;
  let rows = opts.rows ?? 0;
  let frame = 0;
  let t0 = 0;
  let lastFrameTime = 0;
  let running = false;
  let raf = 0;
  let destroyed = false;
  const pointer = { x: -1, y: -1, pressed: false };

  el.style.fontStretch = 'normal';

  function onPointerMove(e: PointerEvent) {
    const r = el.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / metrics.cw;
    pointer.y = (e.clientY - r.top) / metrics.lh;
  }
  function onPointerDown() {
    pointer.pressed = true;
  }
  function onPointerUp() {
    pointer.pressed = false;
  }
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointerup', onPointerUp);

  function syncSize() {
    metrics = measure(el);
    if (opts.cols && opts.rows) {
      cols = opts.cols;
      rows = opts.rows;
    } else {
      const w = el.clientWidth || el.parentElement?.clientWidth || 0;
      const h = el.clientHeight || el.parentElement?.clientHeight || 0;
      cols = Math.max(4, Math.floor(w / metrics.cw));
      rows = Math.max(2, Math.floor(h / metrics.lh));
    }
    const target = cols * rows;
    buffer = new Array(target);
    for (let i = 0; i < target; i++) buffer[i] = { char: ' ' };
    renderer.reset();
  }

  function boot() {
    syncSize();
    frame = 0;
    t0 = performance.now();
    program.boot?.(makeCtx(), state);
  }

  function makeCtx(): FrameCtx {
    return {
      cols,
      rows,
      frame,
      time: performance.now() - t0,
      pointer: { ...pointer },
    };
  }

  function tick(now: number) {
    if (!running || destroyed) return;
    const fps = program.fps ?? 30;
    const interval = 1000 / fps;
    const elapsed = now - lastFrameTime;
    if (elapsed < interval) {
      raf = requestAnimationFrame(tick);
      return;
    }
    lastFrameTime = now - (elapsed % interval);

    // React to container resizes between frames.
    const m = measure(el);
    if (!opts.cols || !opts.rows) {
      const w = Math.max(4, Math.floor((el.clientWidth || 0) / m.cw));
      const h = Math.max(2, Math.floor((el.clientHeight || 0) / m.lh));
      if (w !== cols || h !== rows) {
        syncSize();
        program.boot?.(makeCtx(), state);
      }
    }
    metrics = m;

    frame += 1;
    const ctx = makeCtx();
    ctx.pointer = {
      x: pointer.x,
      y: pointer.y,
      pressed: pointer.pressed,
    };

    program.pre?.(ctx, state);
    for (let y = 0; y < rows; y++) {
      const base = y * cols;
      for (let x = 0; x < cols; x++) {
        const idx = base + x;
        const out = program.main({ x, y, index: idx }, ctx, state);
        const cell = normalizeCell(out);
        const cur = buffer[idx];
        if (
          cur.char !== cell.char ||
          cur.color !== cell.color ||
          cur.backgroundColor !== cell.backgroundColor ||
          cur.fontWeight !== cell.fontWeight
        ) {
          buffer[idx] = cell;
        }
      }
    }
    renderer.render(rows, cols, buffer);
    raf = requestAnimationFrame(tick);
  }

  function play() {
    if (running || destroyed) return;
    running = true;
    lastFrameTime = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function pause() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  boot();
  if (opts.autoplay !== false) play();

  return {
    togglePlay(playArg?: boolean) {
      const target = playArg === undefined ? !running : playArg;
      if (target) play();
      else pause();
    },
    restart() {
      if (destroyed) return;
      pause();
      renderer.reset();
      boot();
      play();
    },
    cleanup() {
      destroyed = true;
      pause();
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointerup', onPointerUp);
      el.textContent = '';
    },
    isPlaying: () => running,
  };
}

/* ---------- React wrapper ---------- */

export interface AsciiAnimationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  program: Program;
  /** Fixed column count; enables fixed-size mode and reserves layout space. */
  cols?: number;
  /** Fixed row count; enables fixed-size mode and reserves layout space. */
  rows?: number;
  /** Alt text exposed as aria-label. */
  alt?: string;
  /** Pause after first frame (also forced by prefers-reduced-motion). */
  static?: boolean;
  /** External play/pause control. */
  paused?: boolean;
  canvasClassName?: string;
  canvasStyle?: CSSProperties;
}

/**
 * Renders an ASCII animation inside an AsciiBox-compatible `<pre>`.
 * In fixed mode (`cols`+`rows`) an invisible placeholder pre reserves the
 * exact grid space so layout never jumps — the same trick Oxide uses.
 */
export function AsciiAnimation({
  program,
  cols,
  rows,
  alt,
  static: staticMode = false,
  paused,
  className,
  canvasClassName,
  canvasStyle,
  ...rest
}: AsciiAnimationProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const playerRef = useRef<ReturnType<typeof createPlayer> | null>(null);
  const pausedFirstRun = useRef(true);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const fixed = cols != null && rows != null;

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const player = createPlayer(program, pre, { cols, rows });
    playerRef.current = player;

    const reduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (staticMode || reduced || pausedRef.current) player.togglePlay(false);

    return () => {
      player.cleanup();
      playerRef.current = null;
    };
    // Recreate only when the program identity or grid changes; live params are
    // read through closures so slider tweaks do not restart the animation.
    // `paused` is read through a ref: toggling it must not recreate the player.
  }, [program, cols, rows, staticMode]);

  // External play/pause control. The first run is skipped: the creating
  // effect above already applied the initial pause state (including
  // reduced-motion and static), and this effect must not override it.
  useEffect(() => {
    if (pausedFirstRun.current) {
      pausedFirstRun.current = false;
      return;
    }
    playerRef.current?.togglePlay(!paused);
  }, [paused]);

  const placeholder = useMemo(() => {
    if (!fixed) return null;
    return Array.from({ length: rows! }, () => '.'.repeat(cols!)).join('\n');
  }, [fixed, cols, rows]);

  return (
    <div
      ref={wrapRef}
      className={
        fixed
          ? 'grid [place-items:start] ' + (className ?? '')
          : className
      }
      role='img'
      aria-label={alt}
      {...rest}
    >
      {fixed && (
        <pre
          aria-hidden='true'
          className='invisible pointer-events-none select-none m-0 whitespace-pre [grid-area:1/1]'
        >
          {placeholder}
        </pre>
      )}
      <pre
        ref={preRef}
        aria-hidden='true'
        className={
          'm-0 whitespace-pre select-none ' +
          (fixed ? '[grid-area:1/1]' : 'w-full h-full ') +
          (canvasClassName ?? '')
        }
        style={{
          fontVariantLigatures: 'none',
          fontKerning: 'none',
          ...canvasStyle,
        }}
      />
    </div>
  );
}
