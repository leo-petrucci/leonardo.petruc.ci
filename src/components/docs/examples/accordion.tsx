import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CodeBlock } from '@/components/docs/shared';
export function AccordionDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Accordion</h2><p className="text-sm text-muted-foreground">Same primitives as MDX — dashed bottom, + / − glyph.</p>
      <Accordion type="single" collapsible className="w-full max-w-md"><AccordionItem value="a1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes, built on Radix.</AccordionContent></AccordionItem><AccordionItem value="a2"><AccordionTrigger>Can I use it?</AccordionTrigger><AccordionContent>Copy the code below.</AccordionContent></AccordionItem></Accordion>
      <CodeBlock code={`import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question?</AccordionTrigger>
    <AccordionContent>Answer.</AccordionContent>
  </AccordionItem>
</Accordion>`} />
    </div>
  );
}
