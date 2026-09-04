import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('border-none ascii-dashed-bottom', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-start gap-3 py-3 font-departure text-ascii uppercase tracking-widest hover:no-underline hover:text-accent data-[state=open]:text-accent [&>svg]:hidden',
        className
      )}
      {...props}
    >
      <span aria-hidden className="text-accent">
        <span className="group-data-[state=closed]:inline group-data-[state=open]:hidden">+</span>
        <span className="group-data-[state=closed]:hidden group-data-[state=open]:inline">-</span>
      </span>
      <span className="text-left">{children}</span>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

/**
 * MDX wrapper — single collapsible with title, ascii style.
 * Kept in ui so mdx can import from @/components/ui/accordion
 */
export interface MdxAccordionProps {
  title: string;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

export function MdxAccordion({ title, defaultOpen, children }: MdxAccordionProps) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? 'item' : undefined} className="my-6">
      <AccordionItem value="item">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent className="pb-4 text-sm text-pretty">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// keep Accordion name for mdx compatibility — mdx will import this as Accordion
export { MdxAccordion as MdxAccordionPrimitive };

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
