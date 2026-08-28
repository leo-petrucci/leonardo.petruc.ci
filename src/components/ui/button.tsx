import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { GlitchChar } from '@/components/atoms/Ascii/Scramble';

export const buttonVariants = cva(
  'group relative inline-flex items-center justify-center font-[inherit] text-inherit leading-[1lh] uppercase border-0 ring-1 cursor-pointer select-none touch-manipulation transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-muted text-foreground ring-border hover:bg-accent hover:text-white hover:ring-accent',
        destructive: 'ascii-dashed-danger bg-red-500/5 text-red-500 ring-red-400/60 hover:bg-red-500/10 dark:text-red-400',
        outline: 'bg-transparent text-foreground ring-border hover:bg-muted',
        secondary: 'bg-card text-card-foreground ring-border hover:bg-muted',
        ghost: 'bg-transparent text-foreground ring-transparent hover:bg-muted hover:ring-border',
        info: 'ascii-dashed-info bg-blue-500/5 text-blue-500 ring-blue-400/60 hover:bg-blue-500/10 dark:text-blue-400',
        warning: 'ascii-dashed-warn bg-amber-500/5 text-amber-600 ring-amber-400/60 hover:bg-amber-500/10 dark:text-amber-400',
        tip: 'ascii-dashed-tip bg-green-500/5 text-green-600 ring-green-400/60 hover:bg-green-500/10 dark:text-green-400',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface CornerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  children?: ReactNode;
  compact?: boolean;
  asChild?: boolean;
  // compat: old shadcn size prop — maps to compact
  size?: string;
}

const CORNER_COLORS: Record<string, string> = {
  default: 'text-muted-foreground/60 group-hover:text-foreground',
  destructive: 'text-red-400/60 group-hover:text-red-400',
  outline: 'text-muted-foreground/60 group-hover:text-foreground',
  secondary: 'text-muted-foreground/60 group-hover:text-foreground',
  ghost: 'text-muted-foreground/60 group-hover:text-foreground',
  info: 'text-blue-400/60 group-hover:text-blue-400',
  warning: 'text-amber-400/60 group-hover:text-amber-400',
  tip: 'text-green-400/60 group-hover:text-green-400',
};

function CornerPlus({ corner, variant }: { corner: 'tl' | 'tr' | 'bl' | 'br'; variant?: string | null }) {
  const pos: Record<typeof corner, React.CSSProperties> = {
    tl: { top: 0, left: 0, transform: 'translate(-50%, -50%)' },
    tr: { top: 0, right: 0, transform: 'translate(50%, -50%)' },
    bl: { bottom: 0, left: 0, transform: 'translate(-50%, 50%)' },
    br: { bottom: 0, right: 0, transform: 'translate(50%, 50%)' },
  };
  return (
    <span
      aria-hidden="true"
      className={cn('absolute pointer-events-none', CORNER_COLORS[variant ?? 'default'] ?? CORNER_COLORS.default)}
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
  asChild = false,
  size,
  ...rest
}: CornerButtonProps) {
  const isCompact = compact || size === 'sm' || size === 'icon' || size === 'icon-sm' || size === 'xs' || size === 'icon-xs';
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      // @ts-ignore — Slot vs button props overlap
      type={asChild ? undefined : 'button'}
      {...rest}
      data-slot="button"
      className={cn(
        buttonVariants({ variant }),
        isCompact
          ? 'px-2 h-6 before:content-[""] before:absolute before:-inset-3 before:z-0'
          : 'px-2 py-2 my-1 before:content-[""] before:absolute before:-inset-2 before:z-0',
        className,
      )}
      style={{ fontVariantLigatures: 'none', fontKerning: 'none', ...rest.style }}
    >
      <CornerPlus corner="tl" variant={variant} />
      <CornerPlus corner="tr" variant={variant} />
      <CornerPlus corner="bl" variant={variant} />
      <CornerPlus corner="br" variant={variant} />
      {children}
    </Comp>
  );
}

export default Button;
