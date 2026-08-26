import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

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
    className: 'border-blue-500/40 bg-blue-500/5',
  },
  warning: {
    marker: '[!]',
    label: 'warn',
    className: 'border-amber-500/40 bg-amber-500/5',
  },
  danger: {
    marker: '[!!]',
    label: 'danger',
    className: 'border-red-500/40 bg-red-500/5',
  },
  tip: {
    marker: '[*]',
    label: 'tip',
    className: 'border-green-500/40 bg-green-500/5',
  },
  note: {
    marker: '[#]',
    label: 'note',
    className: 'border-border bg-muted/40',
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
export function Callout({ type = 'info', title, children, className }: CalloutProps) {
  const { marker, label, className: variantClassName } = VARIANTS[type];
  return (
    // `not-prose` keeps prose paragraph/list styles out of the marker row
    // and body so the box owns its own spacing and typography.
    <div
      role="note"
      className={cn(
        'not-prose my-6 border border-dashed px-4 py-3 text-sm [&>div>p]:my-0',
        variantClassName,
        className,
      )}
    >
      <p
        className={cn(
          'font-departure text-ascii-sm uppercase tracking-widest',
          LABEL_COLORS[type],
        )}
      >
        {marker} {label}
        {title ? <span className="text-foreground"> // {title}</span> : null}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
