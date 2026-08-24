import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
  type CSSProperties,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type PropsWithoutRef,
  type ReactNode,
  type RefAttributes,
} from 'react';

import {
  SCRAMBLE_CHARSET,
  ScrambleChar,
  useInViewOnce,
  useReducedMotion,
  type RevealConfig,
} from './Scramble';

/**
 * AsciiBox renders a rectangular "terminal" box whose frame is drawn from
 * single-character glyphs laid out on a monospace grid. The frame characters
 * are placed in absolutely-positioned CSS grid cells, so every edge lands on a
 * whole character cell and never drifts by a fraction of a pixel.
 *
 * The same geometry is also re-serialised back to plain text (see `toText`),
 * which is how "copy as ascii" works and how the box reads in source form.
 */

/**
 * The 8 characters of a border set, in this order:
 *   tl, top, tr, left, right, bl, bottom, br
 * `ascii` is the plain "+-+" style; the others are Unicode box-drawing glyphs.
 */
const SETS = {
  ascii: '+-+||+-+',
  light: '\u250c\u2500\u2510\u2502\u2502\u2514\u2500\u2518',
  heavy: '\u250f\u2501\u2513\u2503\u2503\u2517\u2501\u251b',
  double: '\u2554\u2550\u2557\u2551\u2551\u255a\u2550\u255d',
  round: '\u256d\u2500\u256e\u2502\u2502\u2570\u2500\u256f',
  dotted: '\u250c\u254c\u2510\u2506\u2506\u2514\u254c\u2518',
} as const;

/** Named border presets. A `chars` prop may also be any custom 8-char string. */
type BoxCharSet = keyof typeof SETS;

/**
 * The 3 characters of a horizontal rule join set, in this order:
 *   left tee, fill, right tee — used for <AsciiBox.Rule />
 * These let an internal divider meet the left/right borders cleanly.
 */
const JOINS = {
  ascii: '+-+',
  light: '\u251c\u2500\u2524',
  heavy: '\u2523\u2501\u252b',
  double: '\u2560\u2550\u2563',
  round: '\u251c\u2500\u2524',
  dotted: '\u251c\u254c\u2524',
} as const;

/** Measured geometry of a laid-out box. */
interface Layout {
  /** Width of one character cell, in px. */
  cw: number;
  /** Height of one row, in px. */
  lh: number;
  /** Total column count, including the left/right frame columns. */
  cols: number;
  /** Total row count, including the top/bottom frame rows. */
  rows: number;
  /** Row indexes (0-based) where an <AsciiBox.Rule /> divider sits. */
  divs: number[];
}

/** Payload delivered to the `onLayout` callback when geometry settles. */
interface AsciiLayout {
  cols: number;
  rows: number;
  cw: number;
  lh: number;
}

/** Horizontal alignment for a label or footer sitting inside a border line. */
type Align = 'left' | 'center' | 'right';

/** Data a nested <AsciiBox.Rule /> needs from its enclosing box. */
interface GridCtxValue {
  cols: number;
  padX: number;
  joins: string;
  reveal?: RevealCtx;
  ready?: boolean;
  innerRef?: { current: HTMLDivElement | null };
  lh?: number;
  padY?: number;
  cw?: number;
}

/** Passed down so Rule components don't re-measure anything. */
const GridCtx = createContext<GridCtxValue>({
  cols: 0,
  padX: 1,
  joins: SETS.ascii,
  reveal: undefined,
  ready: false,
  innerRef: undefined,
  lh: 0,
  padY: 0,
  cw: 0,
});

/** Access the enclosing AsciiBox's measured geometry (cell width, cols, etc.). */
function useAsciiBox(): GridCtxValue {
  return useContext(GridCtx);
}

/**
 * The three segments of one horizontal edge with a label carved into it:
 * `head` (fill before the label), `label` (the carved text, if any) and `tail`
 * (fill after it). Sharing this between the string and JSX renderers keeps the
 * label position identical in both, so copy-as-text matches what is on screen.
 */
function edgeParts(
  fill: string,
  cols: number,
  label?: string,
  align: Align = 'left'
): { head: string; label?: string; tail: string } {
  if (!label) return { head: fill.repeat(cols), tail: '' };
  const t = ' ' + String(label).trim() + ' ';
  if (t.length > cols) {
    // A label longer than the box gets truncated, not wrapped.
    return { head: '', label: t.slice(0, cols), tail: '' };
  }
  let start =
    align === 'center'
      ? Math.floor((cols - t.length) / 2)
      : align === 'right'
        ? cols - t.length - 1
        : 1;
  start = Math.max(0, Math.min(cols - t.length, start));
  return {
    head: fill.repeat(start),
    label: t,
    tail: fill.repeat(cols - start - t.length),
  };
}

/**
 * Build one horizontal edge (top or bottom border) as a plain string.
 *
 * The edge is `fill` repeated `cols` times, with an optional `label` carved
 * into the middle. Alignment of the label is `left` (inset one cell), `center`
 * (padded to the middle), or `right` (flush to the inner edge).
 */
function edgeLine(
  c1: string,
  fill: string,
  c2: string,
  cols: number,
  label?: string,
  align: Align = 'left'
): string {
  const { head, label: lbl, tail } = edgeParts(fill, cols, label, align);
  return c1 + head + (lbl ?? '') + tail + c2;
}

/**
 * The same edge rendered as JSX so the carved label can carry its own styles
 * (e.g. a different color) rather than being baked into a plain string.
 */
function edgeNode(
  c1: string,
  fill: string,
  c2: string,
  cols: number,
  label: string | undefined,
  align: Align,
  labelClass?: string
): ReactNode {
  const { head, label: lbl, tail } = edgeParts(fill, cols, label, align);
  return (
    <>
      {c1}
      {head}
      {lbl != null && <span className={labelClass}>{lbl}</span>}
      {tail}
      {c2}
    </>
  );
}

/** Bundled options threaded into the per-character frame renderers. */
interface RevealCtx {
  stagger: number;
  speed: number;
  cyclesMin: number;
  cyclesMax: number;
  charset: string;
  start: boolean;
  instant: boolean;
  frameColor?: string;
  labelColor?: string;
}

/**
 * A horizontal edge (top/bottom border) rendered as one ScrambleChar per cell.
 * `row` is the edge's row in the full (rows+2) x (cols+2) coordinate space,
 * used with `col` to compute the diagonal reveal delay.
 */
function edgeCells(
  c1: string,
  fill: string,
  c2: string,
  cols: number,
  row: number,
  label: string | undefined,
  align: Align,
  ro: RevealCtx
): ReactNode {
  const { head, label: lbl, tail } = edgeParts(fill, cols, label, align);
  const out: ReactNode[] = [];
  let col = 0;
  const push = (target: string, isLabel: boolean) => {
    out.push(
      <ScrambleChar
        key={col}
        target={target}
        delay={(row + col) * ro.stagger}
        speed={ro.speed}
        cyclesMin={ro.cyclesMin}
        cyclesMax={ro.cyclesMax}
        charset={ro.charset}
        color={isLabel ? ro.labelColor : ro.frameColor}
        start={ro.start}
        instant={ro.instant}
      />
    );
    col += 1;
  };
  push(c1, false);
  for (const ch of head) push(ch, false);
  if (lbl != null) for (const ch of lbl) push(ch, true);
  for (const ch of tail) push(ch, false);
  push(c2, false);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols + 2}, 1ch)`,
      }}
    >
      {out}
    </div>
  );
}

/**
 * A vertical rail (left/right border) rendered as one ScrambleChar per row.
 * `col` is the rail's column (0 for left, cols + 1 for right).
 */
function railCells(targets: string[], col: number, ro: RevealCtx): ReactNode {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${targets.length}, 1lh)`,
      }}
    >
      {targets.map((t, i) => (
        <ScrambleChar
          key={i}
          target={t}
          delay={(i + 1 + col) * ro.stagger}
          speed={ro.speed}
          cyclesMin={ro.cyclesMin}
          cyclesMax={ro.cyclesMax}
          charset={ro.charset}
          color={ro.frameColor}
          start={ro.start}
          instant={ro.instant}
        />
      ))}
    </div>
  );
}

/** Layout equality test used to make the layout effect converge in two passes. */
const same = (a: Layout, b: Layout): boolean =>
  a.cw === b.cw &&
  a.lh === b.lh &&
  a.cols === b.cols &&
  a.rows === b.rows &&
  String(a.divs) === String(b.divs);

/**
 * Whole-box copy handling.
 *
 * Selecting an entire box (e.g. ctrl/cmd-A then copy) should hand over the box
 * text, not the DOM order of the selected nodes. `range.selectNode` marks the
 * whole element as selected even though `containsNode(node, false)` reports
 * false for element nodes in ordinary selections, so we compare the range
 * boundaries against each registered box element instead. A single document
 * listener serves every box on the page.
 */
const registry = new Map<HTMLElement, () => string>();
let copyWired = false;
function onCopy(e: ClipboardEvent): void {
  const sel = document.getSelection();
  if (
    !sel ||
    sel.isCollapsed ||
    !sel.rangeCount ||
    !e.clipboardData ||
    !registry.size
  )
    return;
  const r = sel.getRangeAt(0);
  const hits: HTMLElement[] = [];
  registry.forEach((_getText, el) => {
    try {
      const nr = document.createRange();
      nr.selectNode(el);
      if (
        r.compareBoundaryPoints(Range.START_TO_START, nr) <= 0 &&
        r.compareBoundaryPoints(Range.END_TO_END, nr) >= 0
      )
        hits.push(el);
    } catch (_) {
      // Ranges can reject selectNode (e.g. detached nodes); skip those.
    }
  });
  // Keep only the outermost boxes, so nested boxes don't double-print.
  const tops = hits.filter(
    (el) => !hits.some((o) => o !== el && o.contains(el))
  );
  if (!tops.length) return;
  e.clipboardData.setData(
    'text/plain',
    tops.map((el) => registry.get(el)!()).join('\n\n')
  );
  e.preventDefault();
}

/** Mutable scratchpad that survives renders without triggering them. */
interface Track {
  fillY?: boolean;
  pw?: number;
  ph?: number;
  pi?: number;
  hostW?: number;
  hostH?: number;
  probeW?: number;
  probeH?: number;
}

interface AsciiBoxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style'> {
  /** Border style preset, or any custom 8-char edge sequence. */
  chars?: BoxCharSet | string;
  /** Text carved into the top border line. */
  label?: string;
  /** Text carved into the bottom border line. */
  footer?: string;
  /** Where the label/footer sits inside its border line. */
  labelAlign?: Align;
  /** Fixed column count. When omitted, columns are measured from content. */
  cols?: number;
  /** Fixed row count. When omitted, rows are measured from content. */
  rows?: number;
  /** Horizontal padding (in character cells) between content and the frame. */
  padX?: number;
  /** Vertical padding (in rows) between content and the frame. */
  padY?: number;
  /** When true, width fills the parent container instead of hugging content. */
  fill?: boolean;
  /** When true, height fills the parent container instead of hugging content. */
  fillY?: boolean;
  /** Frame opacity override; defaults to the `--ascii-frame-opacity` CSS var. */
  frameOpacity?: number | string;
  /** Frame color override; defaults to the `--ascii-frame-color` CSS var. */
  frameColor?: string;
  /** Label color override; defaults to the `--ascii-label-color` CSS var. */
  labelColor?: string;
  /** Scramble-reveal the frame characters. See RevealConfig. Default: off. */
  reveal?: boolean | RevealConfig;
  /** Fires with the final measured geometry once the box has settled. */
  onLayout?: (layout: AsciiLayout) => void;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Imperative API exposed through the `ref` prop. */
interface AsciiBoxHandle {
  /** Serialise the whole box (frame + content) back to plain text. */
  toText: () => string;
  cols: number;
  rows: number;
  host: HTMLDivElement | null;
}

/** A horizontal divider that spans the content column and joins the rails. */
function AsciiRule() {
  const {
    cols,
    padX,
    joins,
    reveal,
    ready,
    innerRef,
    lh = 0,
    padY = 0,
  } = useContext(GridCtx);
  const ruleRef = useRef<HTMLDivElement | null>(null);
  const [row, setRow] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!ready || !reveal) return;
    const el = ruleRef.current;
    const box = innerRef?.current;
    if (!el || !box || !(lh > 0)) return;
    const r =
      padY +
      Math.round(
        (el.getBoundingClientRect().top - box.getBoundingClientRect().top) / lh
      );
    setRow((prev) => (prev === r ? prev : r));
  }, [ready, innerRef, lh, padY]);

  if (reveal && ready) {
    const start = reveal.start && row != null;
    const base = row ?? 0;
    return (
      <div
        ref={ruleRef}
        data-divider=""
        aria-hidden="true"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1ch)`,
          width: `calc(${cols} * 1ch)`,
          marginLeft: `calc(${-padX} * 1ch)`,
          marginRight: `calc(${-padX} * 1ch)`,
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: cols }, (_, i) => (
          <ScrambleChar
            key={i}
            target={joins[1]}
            delay={(base + i) * reveal.stagger}
            speed={reveal.speed}
            cyclesMin={reveal.cyclesMin}
            cyclesMax={reveal.cyclesMax}
            charset={reveal.charset}
            color={reveal.frameColor}
            start={start}
            instant={reveal.instant}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      data-divider=""
      aria-hidden="true"
      className="whitespace-pre overflow-hidden text-[var(--ascii-frame-color,inherit)]"
      style={{
        width: `calc(${cols} * 1ch)`,
        marginLeft: `calc(${-padX} * 1ch)`,
        marginRight: `calc(${-padX} * 1ch)`,
      }}
    >
      {joins[1].repeat(cols)}
    </div>
  );
}

interface AsciiBoxComponent
  extends ForwardRefExoticComponent<
    PropsWithoutRef<AsciiBoxProps> & RefAttributes<AsciiBoxHandle>
  > {
  Rule: typeof AsciiRule;
}

/**
 * AsciiBox — a character-cell frame that hugs its content.
 *
 * The trick is measuring the grid: a hidden "probe" span renders 120 "M"
 * glyphs in the box's own font, so one cell is 1/120 of its width and the
 * line-height gives the row height. All sizing decisions (column/row counts,
 * paddings, dividers) derive from those two numbers, which is what keeps every
 * edge on a whole cell.
 */
const AsciiBox = forwardRef<AsciiBoxHandle, AsciiBoxProps>(function AsciiBox(
  {
    chars = 'ascii',
    label,
    footer,
    labelAlign = 'left',
    cols: colsProp,
    rows: rowsProp,
    padX = 1,
    padY = 0,
    fill = false,
    fillY = false,
    frameOpacity,
    frameColor,
    labelColor,
    reveal,
    onLayout,
    style,
    children,
    ...rest
  },
  ref
) {
  const host = useRef<HTMLDivElement | null>(null),
    body = useRef<HTMLDivElement | null>(null),
    inner = useRef<HTMLDivElement | null>(null),
    probe = useRef<HTMLDivElement | null>(null),
    pw = useRef<HTMLSpanElement | null>(null);
  const track = useRef<Track>({});
  const [m, setM] = useState<Layout>({
    cw: 0,
    lh: 0,
    cols: colsProp || 1,
    rows: rowsProp || 1,
    divs: [],
  });
  const [, bump] = useState(0);

  const reducedMotion = useReducedMotion();
  const inViewEnabled =
    !!reveal &&
    (typeof reveal === 'object' ? reveal.trigger === 'inView' : false);
  const inView = useInViewOnce(host, inViewEnabled);

  // Resolve the border characters. `chars` may be a named preset or a raw
  // 8-char string; anything shorter falls back to the plain ascii set.
  const charsStr = chars ?? SETS.ascii;
  const set: string =
    SETS[charsStr as BoxCharSet] ||
    (charsStr.length >= 8 ? charsStr : SETS.ascii);
  const joins: string =
    JOINS[charsStr as BoxCharSet] || set[3] + set[1] + set[4];

  /**
   * The measurement pass. Runs after every render (no deps array); the state
   * guard at the end makes it converge: if nothing changed, we keep the old
   * object and the component stops re-rendering.
   */
  useLayoutEffect(() => {
    const hs = host.current,
      bd = inner.current,
      el = pw.current;
    if (!hs || !bd || !el) return;

    // The probe span's text is never rewritten, so the ResizeObserver below can
    // watch it safely — its size only changes with the font, never with layout.
    const cell = el.getBoundingClientRect();
    const cw = cell.width / 120; // one cell = 1/120 of the 120-"M" probe
    const lh = cell.height;
    if (!(cw > 0.1) || !(lh > 0.1)) return;

    let cols = typeof colsProp === 'number' ? Math.round(colsProp) : 0;
    if (!cols) {
      if (fill) {
        cols = Math.floor((hs.clientWidth + 0.01) / cw) - 2;
      } else {
        /**
         * Intrinsic width, measured OUT OF FLOW. 'auto' on a block resolves to
         * the track pinned last pass, which makes the smallest size a trap, so
         * we detach: rules are zeroed first so their own length can't feed back
         * into the measurement.
         */
        const rules = bd.querySelectorAll<HTMLElement>('[data-divider]');
        rules.forEach((r) => {
          r.style.width = '0px';
        });
        bd.style.position = 'absolute';
        bd.style.width = 'max-content';
        const natural = bd.getBoundingClientRect().width;
        bd.style.position = '';
        rules.forEach((r) => {
          r.style.width = '';
        });
        // Cap at the parent width so an oversized block never overflows.
        const p = hs.parentElement;
        const limit =
          p && p.clientWidth > 3 * cw
            ? Math.floor((p.clientWidth + 0.01) / cw) - 2
            : Infinity;
        cols = Math.min(Math.ceil((natural - 0.02) / cw) + 2 * padX, limit);
      }
    }
    cols = Math.max(1 + 2 * padX, cols);
    // Pin the content width so columns are stable regardless of children.
    bd.style.width = (cols - 2 * padX) * cw + 'px';

    // Height is never pinned, so late growth (nested boxes, images) still shows.
    let rows = typeof rowsProp === 'number' ? Math.round(rowsProp) : 0;
    if (!rows) {
      if (fillY) {
        rows = Math.floor((hs.clientHeight + 0.01) / lh) - 2;
      } else {
        rows =
          Math.ceil((bd.getBoundingClientRect().height - 0.02) / lh) + 2 * padY;
      }
    }
    rows = Math.max(1 + 2 * padY, rows);

    // Record which content rows are occupied by <AsciiBox.Rule /> dividers so
    // the vertical rails can switch from border chars to tee join chars there.
    const top = bd.getBoundingClientRect().top;
    const divs = Array.from(bd.querySelectorAll<HTMLElement>('[data-divider]'))
      .map((d) => padY + Math.round((d.getBoundingClientRect().top - top) / lh))
      .filter((r) => r >= 0 && r < rows);

    const t = track.current;
    t.fillY = fillY;
    t.pw = hs.clientWidth;
    t.ph = hs.clientHeight;
    t.pi = bd.offsetHeight;
    const hr = hs.getBoundingClientRect();
    t.hostW = hr.width;
    t.hostH = hr.height;

    const next: Layout = { cw, lh, cols, rows, divs };
    setM((prev) => (same(prev, next) ? prev : next));
  });

  /**
   * Polling fallback. Some embeddings (throttled iframes, background tabs)
   * deliver neither ResizeObserver notifications nor animation frames, so we
   * also poll the sizes that matter on a timer and force a re-layout on change.
   */
  useEffect(() => {
    const t = track.current;
    const id = setInterval(() => {
      const hs = host.current,
        inn = inner.current;
      if (!hs) return;
      const w = hs.clientWidth,
        h = hs.clientHeight,
        ih = inn ? inn.offsetHeight : 0;
      if (
        Math.abs(w - (t.pw || 0)) > 0.5 ||
        Math.abs(h - (t.ph || 0)) > 0.5 ||
        Math.abs(ih - (t.pi || 0)) > 0.5
      ) {
        t.pw = w;
        t.ph = h;
        t.pi = ih;
        bump((v) => v + 1);
      }
    }, 120);
    return () => clearInterval(id);
  }, []);

  /**
   * Resize observation. We watch only the probe and the host — never the inner
   * element whose width we pin: observing that would re-arm the observer as
   * fast as it fires and the browser starts dropping notifications. The host's
   * height is our own output, so it only counts in fillY mode, where the parent
   * owns it. Content growth needs no observer: child effects run before parent
   * effects, so a growing child re-measures us naturally on the next pass.
   */
  useEffect(() => {
    const hs = host.current,
      el = pw.current;
    if (!hs || !el || !window.ResizeObserver) return;
    const t = track.current;
    const ro = new ResizeObserver((entries) => {
      let need = false;
      entries.forEach((e) => {
        const r = e.target.getBoundingClientRect();
        const isHost = e.target === hs;
        const prevW = isHost ? t.hostW : t.probeW;
        const prevH = isHost ? t.hostH : t.probeH;
        if (Math.abs(r.width - (prevW || 0)) > 0.5) need = true;
        if ((!isHost || t.fillY) && Math.abs(r.height - (prevH || 0)) > 0.5)
          need = true;
        if (isHost) {
          t.hostW = r.width;
          t.hostH = r.height;
        } else {
          t.probeW = r.width;
          t.probeH = r.height;
        }
      });
      if (need) bump((v) => v + 1);
    });
    ro.observe(hs);
    ro.observe(el);
    // Container-driven modes: any ancestor restyle can change the space we get,
    // and attribute mutations are delivered as microtasks even in throttled
    // frames — so watch the ancestor chain for style/class changes too.
    let pmo: MutationObserver | undefined;
    if (fill || fillY) {
      pmo = new MutationObserver(() => bump((v) => v + 1));
      let p = hs.parentElement,
        n = 0;
      while (p && n++ < 12) {
        pmo.observe(p, {
          attributes: true,
          attributeFilter: ['style', 'class'],
        });
        p = p.parentElement;
      }
    }
    // Fonts loading late can change cell metrics; re-measure once they're ready.
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => bump((v) => v + 1));
    return () => {
      ro.disconnect();
      pmo && pmo.disconnect();
    };
  }, []);

  const { cw, lh, cols, rows, divs } = m;

  /**
   * Best-effort plain-text render of the whole box (text content only).
   * Reproduces the frame and any dividers from the measured geometry, which is
   * exactly what the copy handler and the imperative `toText()` return.
   */
  const toText = (): string => {
    const bd = inner.current;
    if (!bd || !cw) return '';
    const align = getComputedStyle(bd).textAlign;
    const src = String(bd.innerText || bd.textContent || '')
      .replace(/\u00a0/g, ' ')
      .split('\n');
    const lines: string[] = [];
    const buf: string[] = [];
    for (let i = 0; i < padY; i++) buf.push('');
    src.forEach((l) => buf.push(l));
    for (let i = 0; i < rows; i++) {
      let t = String(buf[i] == null ? '' : buf[i]).replace(/\s+$/, '');
      let out: string;
      if (t.length === cols) {
        out = t; // a rule row is already full width
      } else {
        const room = Math.max(1, cols - 2 * padX);
        t = t.slice(0, room);
        let lead = padX;
        if (align === 'center') lead = padX + Math.floor((room - t.length) / 2);
        else if (align === 'right' || align === 'end')
          lead = cols - padX - t.length;
        out = ' '.repeat(Math.max(0, lead)) + t;
      }
      out = (out + ' '.repeat(cols)).slice(0, cols);
      const d = divs.indexOf(i) > -1;
      lines.push((d ? joins[0] : set[3]) + out + (d ? joins[2] : set[4]));
    }
    return [edgeLine(set[0], set[1], set[2], cols, label, labelAlign)]
      .concat(lines, [
        edgeLine(set[5], set[6], set[7], cols, footer, labelAlign),
      ])
      .join('\n');
  };

  useImperativeHandle(ref, () => ({ toText, cols, rows, host: host.current }));

  // Register this box with the global copy handler, and keep it wired while
  // any box exists on the page (the guard adds the listener only once).
  useEffect(() => {
    const hs = host.current;
    if (!hs) return;
    registry.set(hs, () => toText());
    if (!copyWired) {
      copyWired = true;
      document.addEventListener('copy', onCopy);
    }
    return () => {
      registry.delete(hs);
    };
  });

  // Report settled geometry to the parent (e.g. for a live stats readout).
  useEffect(() => {
    if (onLayout && cw) onLayout({ cols, rows, cw, lh });
  }, [cols, rows, cw, lh]);

  const frameClass =
    'whitespace-pre min-w-0 opacity-[var(--ascii-frame-opacity,1)] text-[var(--ascii-frame-color,inherit)]';
  const frameColorResolved =
    frameColor == null ? 'var(--ascii-frame-color, inherit)' : frameColor;
  const labelClass = 'text-[var(--ascii-label-color,inherit)]';
  const labelColorResolved =
    labelColor == null ? 'var(--ascii-label-color, inherit)' : labelColor;

  const revealOn = !!reveal;
  const rcfg = reveal && typeof reveal === 'object' ? reveal : {};
  const rStagger = rcfg.stagger ?? 20;
  const rSpeed = rcfg.speed ?? 45;
  const rCyclesMin = rcfg.cycles?.[0] ?? 3;
  const rCyclesMax = rcfg.cycles?.[1] ?? 8;
  const rCharset = rcfg.charset ?? SCRAMBLE_CHARSET;
  const rTrigger = rcfg.trigger ?? 'mount';
  const rStart = rTrigger === 'mount' || inView;
  const ro: RevealCtx = {
    stagger: rStagger,
    speed: rSpeed,
    cyclesMin: rCyclesMin,
    cyclesMax: rCyclesMax,
    charset: rCharset,
    start: rStart,
    instant: reducedMotion,
    frameColor: frameColorResolved,
    labelColor: labelColorResolved,
  };

  // `rail[i]` is true when content row i has a divider, so the side rails can
  // print a tee character there instead of a plain border char.
  const rail: boolean[] = [];
  for (let i = 0; i < rows; i++) rail.push(divs.indexOf(i) > -1);

  return (
    <div
      ref={host}
      {...rest}
      style={
        {
          '--ascii-frame-opacity': frameOpacity,
          '--ascii-frame-color': frameColor,
          '--ascii-label-color': labelColor,
          display: fill ? 'block' : 'inline-block',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          fontVariantLigatures: 'none',
          fontKerning: 'none',
          position: 'relative',
          ...style,
        } as CSSProperties
      }
    >
      {/* 3x3 grid: frame cells on the outside, content in the middle cell. */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `1ch ${cw ? `calc(${cols} * 1ch)` : 'auto'} 1ch`,
          gridTemplateRows: `1lh ${lh ? `calc(${rows} * 1lh)` : 'auto'} 1lh`,
        }}
      >
        <div
          aria-hidden="true"
          className={frameClass}
          style={{ gridColumn: '1 / 4', gridRow: 1 }}
        >
          {cw
            ? revealOn
              ? edgeCells(
                  set[0],
                  set[1],
                  set[2],
                  cols,
                  0,
                  label ? `[ ${label} ]` : undefined,
                  labelAlign,
                  ro
                )
              : edgeNode(
                  set[0],
                  set[1],
                  set[2],
                  cols,
                  label ? `[ ${label} ]` : undefined,
                  labelAlign,
                  labelClass
                )
            : ''}
        </div>
        <div
          aria-hidden="true"
          className={frameClass}
          style={{ gridColumn: 1, gridRow: 2 }}
        >
          {revealOn
            ? cw
              ? railCells(
                  rail.map((d) => (d ? joins[0] : set[3])),
                  0,
                  ro
                )
              : ''
            : rail.map((d) => (d ? joins[0] : set[3])).join('\n')}
        </div>
        <div
          ref={body}
          style={{
            gridColumn: 2,
            gridRow: 2,
            minWidth: 0,
            boxSizing: 'border-box',
            padding: `calc(${padY} * 1lh) calc(${padX} * 1ch)`,
          }}
        >
          <div ref={inner} style={{ minWidth: 0 }}>
            <GridCtx.Provider
              value={{
                cols,
                padX,
                joins,
                reveal: revealOn ? ro : undefined,
                ready: cw > 0,
                innerRef: inner,
                lh,
                padY,
                cw,
              }}
            >
              {children}
            </GridCtx.Provider>
          </div>
        </div>
        <div
          aria-hidden="true"
          className={frameClass}
          style={{ gridColumn: 3, gridRow: 2 }}
        >
          {revealOn
            ? cw
              ? railCells(
                  rail.map((d) => (d ? joins[2] : set[4])),
                  cols + 1,
                  ro
                )
              : ''
            : rail.map((d) => (d ? joins[2] : set[4])).join('\n')}
        </div>
        <div
          aria-hidden="true"
          className={frameClass}
          style={{ gridColumn: '1 / 4', gridRow: 3 }}
        >
          {cw
            ? revealOn
              ? edgeCells(
                  set[5],
                  set[6],
                  set[7],
                  cols,
                  rows + 1,
                  footer,
                  labelAlign,
                  ro
                )
              : edgeNode(
                  set[5],
                  set[6],
                  set[7],
                  cols,
                  footer,
                  labelAlign,
                  labelClass
                )
            : ''}
        </div>
      </div>
      {/* Hidden probe used to measure one character cell in the box's own font. */}
      <div
        ref={probe}
        aria-hidden="true"
        className="absolute top-0 left-0 w-0 h-0 overflow-hidden invisible pointer-events-none select-none"
      >
        <span ref={pw} className="block w-max whitespace-pre">
          {'M'.repeat(120)}
        </span>
      </div>
    </div>
  );
}) as AsciiBoxComponent;

// Attach the Rule sub-component; `AsciiBoxComponent` types it for JSX usage.
AsciiBox.Rule = AsciiRule;

/* ---------- examples used by the page ---------- */

const soft = 'text-[var(--soft,oklch(0.52_0.015_60))]';
const bare =
  'font-[inherit] text-inherit bg-transparent border-0 p-0 m-0 cursor-pointer text-left';


/** A settings-style demo exercising rules, nested boxes and copy-as-text. */
function SettingsDemo() {
  const box = useRef<AsciiBoxHandle>(null);
  const [copied, setCopied] = useState(false);
  const [on, setOn] = useState(true);
  const copy = () => {
    const text = box.current ? box.current.toText() : '';
    if (navigator.clipboard)
      navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <AsciiBox
      ref={box}
      label="settings"
      footer="esc to close"
      padY={1}
      className="max-w-full"
    >
      <div className="font-medium">Notifications</div>
      <div className={soft}>Two nested boxes, laid out with flex + gap.</div>
      <AsciiBox.Rule />
      <div className="flex flex-wrap gap-4 items-start">
        <AsciiBox chars="light" label={on ? 'on' : 'off'}>
          Digest, daily
          <br />
          08:00 local
        </AsciiBox>
        <AsciiBox chars="dotted" label="off">
          Mentions
          <br />
          Replies
        </AsciiBox>
      </div>
      <AsciiBox.Rule />
      <div className="flex gap-3 items-center">
        <button
          type="button"
          onClick={copy}
          className="font-[inherit] text-[13px] leading-[22px] text-inherit bg-transparent border border-solid border-[var(--ink,oklch(0.26_0.02_60))] px-2.5 h-6 box-border cursor-pointer"
        >
          [ {copied ? 'copied as text' : 'copy as ascii'} ]
        </button>
        <button
          type="button"
          onClick={() => setOn((v) => !v)}
          className={`${bare} ${soft}`}
        >
          {on ? '\u25cf' : '\u25cb'} digest — real button, real state
        </button>
      </div>
    </AsciiBox>
  );
}

/** Two headings side by side, showing the two label idioms. */
function HeadingPair() {
  return (
    <div className="flex flex-wrap gap-8 items-start">
      <AsciiBox cols={46} padY={1}>
        <h3 className="m-0 font-[400_26px/48px_'Instrument_Serif',Georgia,serif]">
          What changed
        </h3>
        <p className="m-0">
          Cells are measured from the box's own font, so a heading only has to
          land on whole rows. Mixed families, weights and sizes are all fine.
        </p>
        <AsciiBox.Rule />
        <div className={soft}>v0.3.1 — 18 Aug</div>
      </AsciiBox>
      <AsciiBox label="or put the heading in the edge" cols={38} padY={1}>
        <p className="m-0">
          A label reads as a title, costs no rows, and stays inside the frame at
          any width.
        </p>
        <AsciiBox.Rule />
        <p className="m-0">Two idioms, same box.</p>
      </AsciiBox>
    </div>
  );
}

export {
  AsciiBox,
  AsciiRule,
  SettingsDemo,
  HeadingPair,
  useAsciiBox,
};
export type { BoxCharSet, AsciiBoxHandle, AsciiBoxProps, AsciiLayout };
