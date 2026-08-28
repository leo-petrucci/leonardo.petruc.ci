import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CodeBlock } from '@/components/docs/shared';
export function CollapsibleDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Collapsible</h2>
      <Collapsible className="w-full max-w-md border rounded-lg p-4 space-y-2"><CollapsibleTrigger asChild><Button variant="outline" size="sm">Toggle</Button></CollapsibleTrigger><CollapsibleContent className="text-sm text-muted-foreground">Hidden content revealed.</CollapsibleContent></Collapsible>
      <CodeBlock code={`import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

<Collapsible>
  <CollapsibleTrigger asChild><Button>Toggle</Button></CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>`} />
    </div>
  );
}
