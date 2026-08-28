import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { GlitchChar } from '@/components/atoms/Ascii/Scramble';

/** Supported admonition styles for {@link Callout}. */
type CalloutType = 'info' | 'warning' | 'danger' | 'tip' | 'note';

/**
 * ASCII marker + color scheme per callout variant, tuned to the site's
 * terminal aesthetic: mono uppercase labels like `[!] WARN`, dashed borders,
 * and faint background tints.
 */
const VARIANTS: Record<
  CalloutType,
  { marker: string; label: string; className: string }
> = {
  info: {
    marker: '[i]',
    label: 'info',
    className: 'ascii-dashed-info bg-blue-500/5',
  },
  warning: {
    marker: '[!]',
    label: 'warn',
    className: 'ascii-dashed-warn bg-amber-500/5',
  },
  danger: {
    marker: '[!!]',
    label: 'danger',
    className: 'ascii-dashed-danger bg-red-500/5',
  },
  tip: {
    marker: '[*]',
    label: 'tip',
    className: 'ascii-dashed-tip bg-green-500/5',
  },
  note: {
    marker: '[#]',
    label: 'note',
    className: 'ascii-dashed-note bg-muted/40',
  },
};

/** Label color for each variant, applied to the marker row only. */
const LABEL_COLORS: Record<CalloutType, string> = {
  info: 'text-blue-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
  tip: 'text-green-400',
  note: 'text-muted-foreground',
};

/** Props for the MDX `<Callout>` admonition box. */
export interface CalloutProps {
  /** Visual style and marker. Defaults to `'info'`. */
  type?: CalloutType;
  /** Optional bold heading rendered above the body text. */
  title?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Terminal-style admonition box for highlighting important information in
 * MDX. Renders a mono uppercase marker row (`[!] WARN`) above the body.
 *
 * @example
 * <Callout type="warning" title="Careful">Back up first.</Callout>
 */
const CORNER_COLORS: Record<CalloutType, string> = {
  info: 'text-blue-400/60',
  warning: 'text-amber-400/60',
  danger: 'text-red-400/60',
  tip: 'text-green-400/60',
  note: 'text-muted-foreground/40',
};

function CalloutCorner({ corner, type }: { corner: 'tl' | 'tr' | 'bl' | 'br'; type: CalloutType }) {
  const pos: Record<typeof corner, React.CSSProperties> = {
    tl: { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    tr: { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    bl: { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
    br: { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
  };
  return (
    <span
      aria-hidden="true"
      className={cn('absolute pointer-events-none bg-black px-[2px]', CORNER_COLORS[type])}
      style={{ ...pos[corner], lineHeight: '1lh' }}
    >
      <GlitchChar target="+" />
    </span>
  );
}

export function Callout({ type = 'info', title, children, className }: CalloutProps) {
  const { marker, label, className: variantClassName } = VARIANTS[type];
  return (
    // `not-prose` keeps prose paragraph/list styles out of the marker row
    // and body so the box owns its own spacing and typography.
    <div
      role="note"
      className={cn(
        'not-prose relative my-6 px-4 py-3.5 text-sm [&>div>p]:my-0',
        variantClassName,
        className,
      )}
    >
      <CalloutCorner corner="tl" type={type} />
      <CalloutCorner corner="tr" type={type} />
      <CalloutCorner corner="bl" type={type} />
      <CalloutCorner corner="br" type={type} />
      <p className={cn('font-departure text-ascii-sm uppercase tracking-widest', LABEL_COLORS[type])}>
        {marker} {label}
        {title ? <span className="font-mono normal-case tracking-normal text-foreground"> // {title}</span> : null}
      </p>
      <div className="mt-2 text-pretty leading-relaxed text-foreground">{children}</div>
    </div>
  );
}
