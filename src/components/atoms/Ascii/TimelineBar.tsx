import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  SCRAMBLE_CHARSET,
  ScrambleChar,
  useInViewOnce,
  useReducedMotion,
  type RevealConfig,
} from './Scramble';
import { useAsciiBox } from './Ascii';

export interface TimelineEntry {
  id: string;
  title: string;
  subtitle: string;
  start: string;
  end: string | 'present';
  image?: string;
}

interface TimelineBarProps {
  entries: TimelineEntry[];
  start?: string;
  cols?: number;
  fill?: boolean;
  glyph?: string;
  gapGlyph?: string;
  spaced?: boolean;
  initialIndex?: number;
  reveal?: boolean | RevealConfig;
}
// A single character cell of the bar: an entry's time, or a gap (uncovered time
// that still keeps the full 2009→now span visible as ▎).
type Cell = { kind: 'entry'; index: number } | { kind: 'gap' };

// A contiguous run of cells that share the same state, coalesced so each entry
// is one hoverable/clickable unit and each gap is one muted, non-interactive span.
type Segment =
  | { kind: 'gap'; cells: number }
  | { kind: 'entry'; index: number; cells: number };

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

function formatMonthYear(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Turn entries into bar cells, then coalesce adjacent cells into segments.
 *
 * The bar is a fixed-width grid of `cols` cells spanning `rangeStart → now`.
 * Each cell's midpoint maps to a point in time; whichever entry covers it owns
 * the cell, so segment widths stay proportional to real duration while snapping
 * to the character grid. Cells no entry covers become gaps.
 */
function buildBar(
  entries: TimelineEntry[],
  rangeStart: Date,
  now: Date,
  cols: number
): Segment[] {
  const total = now.getTime() - rangeStart.getTime();
  if (total <= 0) return [];
  // Clamp every entry into the visible range so nothing overflows the bar.
  const span = entries.map((e, index) => {
    const start = Math.max(rangeStart.getTime(), new Date(e.start).getTime());
    const raw = e.end === 'present' ? now.getTime() : new Date(e.end).getTime();
    return { start, end: Math.min(now.getTime(), raw), index };
  });
  // Walk each cell by its midpoint time and assign it to the covering entry.
  const cells: Cell[] = Array.from({ length: cols }, (_, i) => {
    const t = rangeStart.getTime() + ((i + 0.5) / cols) * total;
    const hit = span.find((e) => e.start <= t && t <= e.end);
    return hit ? { kind: 'entry', index: hit.index } : { kind: 'gap' };
  });
  // A very short entry can round to zero cells; steal the gap cell nearest its
  // midpoint so every entry always has at least one clickable cell.
  for (const e of span) {
    if (cells.some((c) => c.kind === 'entry' && c.index === e.index)) continue;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < cols; i++) {
      if (cells[i].kind !== 'gap') continue;
      const t = rangeStart.getTime() + ((i + 0.5) / cols) * total;
      const d = Math.abs(t - (e.start + e.end) / 2);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (best >= 0) cells[best] = { kind: 'entry', index: e.index };
  }
  // Coalesce adjacent same-kind cells into segments for hover/click grouping.
  const segments: Segment[] = [];
  for (const cell of cells) {
    const last = segments[segments.length - 1];
    if (
      last &&
      ((last.kind === 'gap' && cell.kind === 'gap') ||
        (last.kind === 'entry' &&
          cell.kind === 'entry' &&
          last.index === cell.index))
    ) {
      last.cells += 1;
    } else if (cell.kind === 'entry') {
      segments.push({ kind: 'entry', index: cell.index, cells: 1 });
    } else {
      segments.push({ kind: 'gap', cells: 1 });
    }
  }
  return segments;
}

const ARROW_BTN =
  '[font:inherit] text-inherit bg-transparent border-0 px-1.5 m-0 cursor-pointer';

export function TimelineBar({
  entries,
  start = '2009-01-01',
  cols = 64,
  fill = false,
  glyph = '▎',
  gapGlyph = '▎',
  spaced = false,
  initialIndex,
  reveal = true,
}: TimelineBarProps) {
  const now = useMemo(() => new Date(), []);
  const rangeStart = useMemo(() => new Date(start), [start]);
  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      ),
    [entries]
  );

  const hostRef = useRef<HTMLDivElement | null>(null);
  const probeRef = useRef<HTMLSpanElement | null>(null);
  // Inside an AsciiBox we borrow its measured cell width (cw) from context instead
  // of measuring our own; only fall back to the hidden probe when there's no box.
  const ctx = useAsciiBox();
  const hasCellWidth = (ctx.cw ?? 0) > 0;
  const [width, setWidth] = useState(0);
  const [measuredCw, setMeasuredCw] = useState(0);

  // Track the host width so the number of cells can be re-derived on resize.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !window.ResizeObserver) return;
    const update = () => setWidth(host.clientWidth);
    const ro = new ResizeObserver(update);
    ro.observe(host);
    update();
    return () => ro.disconnect();
  }, []);

  // Fallback: measure one monospace cell when not nested in an AsciiBox. The
  // probe is 120 "M"s wide, so cw = probeWidth / 120. Runs every render but
  // guards on the value so it converges without looping.
  useLayoutEffect(() => {
    if (hasCellWidth) return;
    const probe = probeRef.current;
    if (!probe) return;
    const cw = probe.getBoundingClientRect().width / 120;
    if (cw > 0.1) setMeasuredCw((prev) => (prev === cw ? prev : cw));
  });

  const cw = hasCellWidth ? ctx.cw! : measuredCw;
  // How many cells fit across the current width. Contiguous cells are 1ch each;
  // spaced cells occupy glyph + gap (2ch) minus the trailing space.
  const resolvedCols = fill
    ? cw > 0
      ? spaced
        ? Math.max(1, Math.floor((width + cw) / (2 * cw)))
        : Math.max(1, Math.floor(width / cw))
      : 0
    : cols;

  const segments = useMemo(
    () => buildBar(sorted, rangeStart, now, resolvedCols),
    [sorted, rangeStart, now, resolvedCols]
  );
  // Default to the most recent entry unless an explicit index is given.
  const [selected, setSelected] = useState(() => {
    const last = Math.max(0, sorted.length - 1);
    return initialIndex == null ? last : Math.min(initialIndex, last);
  });
  const [hovered, setHovered] = useState<number | null>(null);

  // Resolve the reveal config with the same defaults as AsciiBox, and decide
  // whether to start immediately (mount) or wait until scrolled into view.
  const reducedMotion = useReducedMotion();
  const rcfg = reveal && typeof reveal === 'object' ? reveal : {};
  const rStagger = rcfg.stagger ?? 20;
  const rSpeed = rcfg.speed ?? 45;
  const rCyclesMin = rcfg.cycles?.[0] ?? 3;
  const rCyclesMax = rcfg.cycles?.[1] ?? 8;
  const rCharset = rcfg.charset ?? SCRAMBLE_CHARSET;
  const rTrigger = rcfg.trigger ?? 'mount';
  const inView = useInViewOnce(hostRef, rTrigger === 'inView');
  const revealStart = rTrigger === 'mount' || inView;
  const instant = reducedMotion;

  // First global cell index of each segment, so the reveal stagger reads as one
  // continuous left→right sweep across gaps and entries rather than restarting
  // per segment.
  const offsets = useMemo(() => {
    const offs: number[] = [];
    let acc = 0;
    for (const seg of segments) {
      offs.push(acc);
      acc += seg.cells;
    }
    return offs;
  }, [segments]);

  const active = sorted[selected];
  // Selected wins, then hovered, otherwise the muted default.
  const segmentColor = (index: number) =>
    index === selected
      ? 'var(--chart-1)'
      : index === hovered
        ? 'var(--foreground)'
        : 'var(--muted)';

  return (
    <div
      ref={hostRef}
      className="relative [font-family:inherit] [font-variant-ligatures:none] [font-kerning:none]"
    >
      {active && (
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <div className="text-left leading-[24px]">
              <div className="flex items-center gap-2">
                {active.image && (
                  <img
                    src={active.image}
                    alt=""
                    className="w-12 h-12 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
                <div className="flex flex-col">
                  <div className="font-semibold">{active.title}</div>
                  <div>
                    {formatMonthYear(new Date(active.start))} -{' '}
                    {active.end === 'present'
                      ? 'PRESENT'
                      : formatMonthYear(new Date(active.end))}
                  </div>
                </div>
              </div>
              <div className="text-muted-foreground">{active.subtitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="previous"
              onClick={() =>
                setSelected((selected - 1 + sorted.length) % sorted.length)
              }
              className={ARROW_BTN}
            >
              {'<'}
            </button>
            <button
              type="button"
              aria-label="next"
              onClick={() => setSelected((selected + 1) % sorted.length)}
              className={ARROW_BTN}
            >
              {'>'}
            </button>
          </div>
        </div>
      )}
      <div className="whitespace-pre select-none leading-[24px] max-h-6">
        {segments.map((seg, i) => {
          // Render each cell of the segment as its own scramble char. The delay
          // uses the segment's global start index so the whole bar decodes in a
          // single left→right pass. When spaced, insert a space between cells.
          const cells = Array.from({ length: seg.cells }, (_, c) => {
            const gi = offsets[i] + c;
            const node = (
              <ScrambleChar
                key={c}
                inline
                align="left"
                target={seg.kind === 'entry' ? glyph : gapGlyph}
                delay={gi * rStagger}
                speed={rSpeed}
                cyclesMin={rCyclesMin}
                cyclesMax={rCyclesMax}
                charset={rCharset}
                start={revealStart}
                instant={instant}
              />
            );
            return spaced ? (
              <Fragment key={c}>
                {node}
                {c < seg.cells - 1 ? ' ' : null}
              </Fragment>
            ) : (
              node
            );
          });
          return (
            <Fragment key={i}>
              {i > 0 ? (spaced ? ' ' : '') : null}
              {/* Gap cells are static muted text; entry cells are buttons with
                  hover/click and their own color state. */}
              {seg.kind === 'gap' ? (
                <span className="text-muted">{cells}</span>
              ) : (
                <button
                  type="button"
                  aria-label={`${sorted[seg.index].title}, ${formatMonthYear(new Date(sorted[seg.index].start))} - ${sorted[seg.index].end === 'present' ? 'PRESENT' : formatMonthYear(new Date(sorted[seg.index].end))}`}
                  onClick={() => setSelected(seg.index)}
                  onMouseEnter={() => setHovered(seg.index)}
                  onMouseLeave={() => setHovered(null)}
                  className={
                    '[font:inherit] bg-transparent border-0 p-0 m-0 cursor-pointer max-h-6'
                  }
                  style={{ color: segmentColor(seg.index) }}
                >
                  {cells}
                </button>
              )}
            </Fragment>
          );
        })}
      </div>
      {!hasCellWidth && (
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-0 h-0 overflow-hidden invisible pointer-events-none select-none"
        >
          <span ref={probeRef} className="block w-max whitespace-pre">
            {'M'.repeat(120)}
          </span>
        </div>
      )}
    </div>
  );
}
