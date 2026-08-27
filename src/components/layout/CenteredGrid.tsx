import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

const centeredGridVariantMaxWidth = {
  default: '663px',
  wide: '800px',
} as const;

type CenteredGridVariant = keyof typeof centeredGridVariantMaxWidth;

type CenteredGridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Variant for preset max-width. `default` is 663px, `wide` is 800px. */
  variant?: CenteredGridVariant;
  /** Max width of the centered column. Overrides `variant` when set. */
  maxWidth?: string | number;
  /** Gap between grid items. Default is gap-2 (0.5rem). */
  gapClassName?: string;
};

export function CenteredGrid({
  children,
  variant = 'default',
  maxWidth,
  gapClassName = 'gap-2',
  className = '',
  style,
  ...rest
}: CenteredGridProps) {
  const fallback = centeredGridVariantMaxWidth[variant];
  const raw = maxWidth ?? fallback;
  const width = typeof raw === 'number' ? `${raw}px` : raw;

  return (
    <div
      className={`grid flex-row ${gapClassName} ${className}`.trim()}
      style={{
        gridTemplateColumns: `minmax(0, 1fr) minmax(0, ${width}) minmax(0, 1fr)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

type CenteredGridItemProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  asChild?: boolean;
};

export function CenteredGridItem({
  children,
  className,
  style,
  asChild = false,
  ...rest
}: CenteredGridItemProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      className={className}
      style={{ gridColumn: '2', ...style } as CSSProperties}
      {...rest}
    >
      {children}
    </Comp>
  );
}
