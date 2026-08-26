import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

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

  return (
    // `not-prose` stops prose `pre`/`code` background and margin styles from
    // fighting the terminal chrome below.
    <div
      className={cn(
        'not-prose my-6 border border-dashed border-[var(--border)] bg-[var(--muted)]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-dashed border-[var(--border)] px-4 py-2 font-departure text-ascii-sm uppercase tracking-widest text-muted-foreground">
        <span className="truncate">
          {'// '}
          {filename ?? 'code'}
        </span>
        <div className="flex shrink-0 items-center gap-4">
          {language ? (
            <span className="text-[var(--accent)]">[{language}]</span>
          ) : null}
          <button
            type="button"
            onClick={copy}
            aria-label="Copy code"
            className="transition-colors hover:text-[var(--accent)]"
          >
            [{copied ? 'copied' : 'copy'}]
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
                  highlighted.has(i + 1)
                    ? '-mx-4 border-l-2 border-[var(--accent)] bg-blue-500/10 px-[calc(1rem-2px)]'
                    : undefined
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
