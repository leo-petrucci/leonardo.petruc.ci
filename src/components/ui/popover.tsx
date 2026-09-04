'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';
import { GlitchChar } from '@/components/atoms/Ascii/Scramble';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 6, children, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'group z-50 w-72 bg-muted text-foreground rounded-none shadow-none outline-none ' +
          'font-inter text-sm px-3 py-2 ' +
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 origin-[--radix-popover-content-transform-origin]',
        className
      )}
      {...props}
    >
      {children}
      <PopoverArrow />
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

function PopoverArrow({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="popover-arrow"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--muted)] text-xs leading-none',
        'group-data-[side=top]:top-full group-data-[side=top]:-translate-y-0.75',
        'group-data-[side=bottom]:bottom-full group-data-[side=bottom]:top-auto group-data-[side=bottom]:translate-y-0.75 group-data-[side=bottom]:rotate-180',
        'group-data-[side=left]:left-auto group-data-[side=left]:right-full group-data-[side=left]:translate-x-0.75 group-data-[side=left]:-rotate-90',
        'group-data-[side=right]:right-auto group-data-[side=right]:left-full group-data-[side=right]:-translate-x-0.75 group-data-[side=right]:rotate-90',
        className,
      )}
      {...props}
    >
      <GlitchChar target="▼" minDelay={3000} maxDelay={8000} />
    </span>
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverArrow };
