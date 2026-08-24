'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';
import { GlitchChar } from '@/components/atoms/Ascii/Scramble';

function TooltipProvider({
  delayDuration = 100,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'group z-50 bg-muted text-foreground ' +
            'font-departure text-ascii-sm uppercase tracking-wide ' +
            'px-2 py-1 shadow-none outline-none ' +
            'animate-in fade-in-0 zoom-in-95 ' +
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 ' +
            'data-[state=delayed-open]:animate-in ' +
            'data-[side=bottom]:slide-in-from-top-1 ' +
            'data-[side=left]:slide-in-from-right-1 ' +
            'data-[side=right]:slide-in-from-left-1 ' +
            'data-[side=top]:slide-in-from-bottom-1',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipArrow />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

function TooltipArrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="tooltip-arrow"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute ' +
          'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ' +
          'text-[var(--muted)] text-xs leading-none',
        'group-data-[side=top]:top-full group-data-[side=top]:-translate-y-0.75',
        'group-data-[side=bottom]:bottom-full group-data-[side=bottom]:top-auto ' +
          'group-data-[side=bottom]:translate-y-0.75 group-data-[side=bottom]:rotate-180',
        'group-data-[side=left]:left-auto group-data-[side=left]:right-full ' +
          'group-data-[side=left]:translate-x-0.75 group-data-[side=left]:-rotate-90',
        'group-data-[side=right]:right-auto group-data-[side=right]:left-full ' +
          'group-data-[side=right]:-translate-x-0.75 group-data-[side=right]:rotate-90',
        className,
      )}
      {...props}
    >
      <GlitchChar target="▼" minDelay={3000} maxDelay={8000} />
    </span>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipArrow,
};
