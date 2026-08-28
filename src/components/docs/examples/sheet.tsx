import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CodeBlock } from '@/components/docs/shared';
export function SheetDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Sheet</h2><p className="text-sm text-muted-foreground">Side drawer. Side: left | right | top | bottom.</p>
      <Sheet><SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle>Sheet title</SheetTitle><SheetDescription>Sheet description.</SheetDescription></SheetHeader><div className="pt-4 text-sm">Content here.</div></SheetContent></Sheet>
      <CodeBlock code={`import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>Title</SheetTitle></SheetHeader>
  </SheetContent>
</Sheet>`} />
    </div>
  );
}
