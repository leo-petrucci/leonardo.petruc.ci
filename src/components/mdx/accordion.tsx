import {
  Accordion as AccordionPrimitive,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * Props for the MDX `<Accordion>`: a single collapsible item with a title.
 */
export interface MdxAccordionProps {
  /** Always-visible trigger text. */
  title: string;
  /** Render expanded on first mount. Defaults to collapsed. */
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

/**
 * Terminal-style collapsible section for MDX, built on the shadcn accordion
 * primitive. Shows a mono uppercase title with a `+` / `-` state glyph and a
 * dashed divider, matching the site's ASCII aesthetic.
 *
 * @example
 * <Accordion title="Why use Accordion?">Hidden depth here.</Accordion>
 */
export function Accordion({ title, defaultOpen, children }: MdxAccordionProps) {
  return (
    <AccordionPrimitive
      type="single"
      collapsible
      defaultValue={defaultOpen ? 'item' : undefined}
      className="my-6 ascii-dashed-bottom"
    >
      <AccordionItem value="item" className="border-none">
        <AccordionTrigger className="group justify-start gap-3 py-3 font-departure text-ascii uppercase tracking-widest hover:no-underline hover:text-accent data-[state=open]:text-accent [&>svg]:hidden">
          <span aria-hidden className="text-accent">
            <span className="group-data-[state=closed]:inline group-data-[state=open]:hidden">
              +
            </span>
            <span className="group-data-[state=closed]:hidden group-data-[state=open]:inline">
              -
            </span>
          </span>
          <span className="text-left">{title}</span>
        </AccordionTrigger>
        <AccordionContent className="pb-4 text-sm text-pretty">{children}</AccordionContent>
      </AccordionItem>
    </AccordionPrimitive>
  );
}
