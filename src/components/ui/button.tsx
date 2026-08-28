import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { GlitchChar } from '@/components/atoms/Ascii/Scramble';

// kept for backwards compat where some files import buttonVariants
export const buttonVariants = cva('', { variants: {}, defaultVariants: {} });

interface CornerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  compact?: boolean;
  // compat with previous shadcn api — ignored, kept so docs/dialog still type-check
  variant?: string;
  size?: string;
  asChild?: boolean;
}

function CornerPlus({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
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

export function Button({
  children,
  className = '',
  compact = false,
  variant,
  size,
  asChild = false,
  ...rest
}: CornerButtonProps) {
  // map shadcn sizes to compact for compat
  const isCompact = compact || size === 'sm' || size === 'icon' || size === 'icon-sm' || size === 'xs' || size === 'icon-xs';

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      // @ts-ignore — Slot vs button props overlap
      type={asChild ? undefined : 'button'}
      {...rest}
      data-slot="button"
      className={
        'group relative inline-flex items-center justify-center ' +
        'font-[inherit] text-inherit leading-[1lh] uppercase ' +
        'border-0 ring-1 ring-border cursor-pointer select-none touch-manipulation ' +
        'bg-muted text-foreground ' +
        (isCompact
          ? 'px-2 h-6 before:content-[""] before:absolute before:-inset-3 before:z-0 '
          : 'px-2 py-2 my-1 before:content-[""] before:absolute before:-inset-2 before:z-0 ') +
        'transition-colors duration-150 ' +
        'group-hover:bg-accent group-hover:text-white group-hover:ring-accent ' +
        className
      }
      style={{ fontVariantLigatures: 'none', fontKerning: 'none', ...rest.style }}
    >
      <CornerPlus corner="tl" />
      <CornerPlus corner="tr" />
      <CornerPlus corner="bl" />
      <CornerPlus corner="br" />
      {children}
    </Comp>
  );
}

export default Button;
