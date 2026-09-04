import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { GlitchChar } from '@/components/atoms/Ascii/Scramble';

/**
 * Parses a highlight spec like `"3"` or `"{1,5-7}"` into a set of
 * 1-based line numbers to emphasize.
 */
function parseHighlight(highlight?: string): Set<number> {
  if (!highlight) return new Set();
  const lines = new Set<number>();
  for (const part of highlight.replace(/[{}[\]]/g, '').split(',')) {
    const [start, end] = part.split('-').map((n) => parseInt(n, 10));
    if (Number.isNaN(start)) continue;
    // A missing `end` means this part names a single line.
    if (end === undefined || Number.isNaN(end)) {
      lines.add(start);
    } else {
      for (let i = start; i <= end; i++) lines.add(i);
    }
  }
  return lines;
}

/**
 * Enhanced code block with a copy-to-clipboard button, an optional filename
 * header, a language badge, and line highlighting.
 *
 * Accepts either a raw `code` string or markdown children (e.g. a fenced code
 * block written directly inside the tag in MDX).
 */
export interface CodeBlockProps {
  /** Raw source text to render. Omit when passing children instead. */
  code?: string;
  /** Fenced markdown code (a `pre` element) or any nodes to render as the body. */
  children?: React.ReactNode;
  /** Label shown above the code, usually a file path. */
  filename?: string;
  /** Language badge label shown in the header corner. */
  language?: string;
  /**
   * Comma-separated, 1-based line spec to emphasize.
   * Supports single lines (`"3"`) and ranges (`"1,5-7"`).
   */
  highlight?: string;
  className?: string;
}

/**
 * Terminal-window code block: dashed border, mono uppercase header row
 * (`// path/to/file`, `[TSX]`, `[COPY]`), and accent-tinted highlighted lines.
 */
export function CodeBlock({
  code,
  children,
  filename,
  language,
  highlight,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const highlighted = parseHighlight(highlight);
  const lines = code?.replace(/\n$/, '').split('\n');

  /** Copies the raw source (prop or rendered text) and flashes feedback. */
  const copy = async () => {
    const text =
      code ?? bodyRef.current?.querySelector('code')?.textContent ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

function CodeBlockCorner({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos: Record<typeof corner, React.CSSProperties> = {
    tl: { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    tr: { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    bl: { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
    br: { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
  };
  return (
    <span
      aria-hidden="true"
      className="absolute pointer-events-none text-muted-foreground/40"
      style={{ ...pos[corner], lineHeight: '1lh' }}
    >
      <GlitchChar target="+" />
    </span>
  );
}

  return (
    // `not-prose` stops prose `pre`/`code` background and margin styles from
    // fighting the terminal chrome below.
    <div className={cn('not-prose relative my-6 ascii-dashed-note bg-muted', className)}>
      <CodeBlockCorner corner="tl" />
      <CodeBlockCorner corner="tr" />
      <CodeBlockCorner corner="bl" />
      <CodeBlockCorner corner="br" />
      <div className="flex items-center justify-between gap-3 ascii-dashed-bottom bg-muted/40 px-3 py-2">
        <span className="truncate font-mono text-xs tracking-normal text-muted-foreground">
          <span className="opacity-40">//</span> {filename ?? 'code'}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {language ? (
            <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums text-accent">
              {language}
            </span>
          ) : null}
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Copied' : 'Copy code'}
            className="inline-flex items-center rounded bg-foreground px-2.5 py-1 font-departure text-xs uppercase tracking-wide text-background transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-muted"
          >
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
      </div>
      {lines ? (
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="font-mono">
            {lines.map((line, i) => (
              <div
                key={i}
                className={
                  highlighted.has(i + 1) ? '-mx-4 border-l-2 border-accent bg-blue-500/10 px-[calc(1rem-2px)]' : undefined
                }
              >
                {line || '\u00A0'}
              </div>
            ))}
          </code>
        </pre>
      ) : (
        <div
          ref={bodyRef}
          className="overflow-x-auto [&_pre]:m-0 [&_pre]:border-0 [&_pre]:bg-transparent [&_pre]:p-4 [&_code]:text-sm"
        >
          {children}
        </div>
      )}
    </div>
  );
}
