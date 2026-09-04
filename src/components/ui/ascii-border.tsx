import * as React from 'react';

import { cn } from '@/lib/utils';

function AsciiBorder({
  className,
  withCorners = true,
  flush = false,
  ...props
}: React.ComponentProps<'div'> & { withCorners?: boolean; flush?: boolean }) {
  return (
    <div
      data-slot="ascii-border"
      className={cn(
        "relative",
        flush ? 'ascii-border-flush p-6' : 'ascii-border p-6',
        withCorners && 'ascii-plus',
        className
      )}
      {...props}
    >
      <div className="bg-background absolute -inset-x-1 -inset-y-2 -z-10" />
      {props.children}
    </div>
  );
}

export { AsciiBorder };
