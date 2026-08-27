import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { GlitchChar } from '@/components/atoms/Ascii/Scramble';

interface CornerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  /** Tighten the horizontal/vertical padding. */
  compact?: boolean;
}

/**
 * A rectangle with a `--muted` fill and four `--accent` `+` glyphs pinned to
 * its corners. On hover the fill flips to `--accent` and the `+` turn white.
 * The corners sit on a monospace cell grid so they read as a character frame.
 * 
 * @variants
 * - `base`: the default variant, button is 40px tall but includes 4px margin on top and bottom.
 * - `compact`: reduces the horizontal and vertical padding. Button is 24px tall.
 */
/** A `+` pinned to one corner that occasionally glitches through random glyphs. */
function CornerPlus({
  corner,
}: {
  corner: 'tl' | 'tr' | 'bl' | 'br';
}) {
  const pos: Record<typeof corner, React.CSSProperties> = {
    tl: { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    tr: { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    bl: { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
    br: { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
  };
  return (
    <span
      aria-hidden="true"
      className="absolute pointer-events-none text-muted-foreground/60 group-hover:text-foreground"
      style={{ ...pos[corner], lineHeight: '1lh' }}
    >
      <GlitchChar target="+" />
    </span>
  );
}

export function CornerButton({
  children,
  className = '',
  compact = false,
  ...rest
}: CornerButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={
        'group relative inline-flex items-center justify-center ' +
        'font-[inherit] text-inherit leading-[1lh] uppercase ' +
        'border-0 ring-1 ring-border cursor-pointer select-none touch-manipulation ' +
        'bg-muted text-foreground ' +
        // keep visual 24px (1lh) but expand hit to 48px (2*24) via invisible before
        (compact
          ? 'px-2 h-6 before:content-[""] before:absolute before:-inset-3 before:z-0 '
          : 'px-2 py-2 my-1 before:content-[""] before:absolute before:-inset-2 before:z-0 ') +
        'transition-colors duration-150 ' +
        'group-hover:bg-accent group-hover:text-white group-hover:ring-accent ' +
        className
      }
      style={{ fontVariantLigatures: 'none', fontKerning: 'none' }}
    >
      <CornerPlus corner="tl" />
      <CornerPlus corner="tr" />
      <CornerPlus corner="bl" />
      <CornerPlus corner="br" />
      {children}
    </button>
  );
}

export default CornerButton;
