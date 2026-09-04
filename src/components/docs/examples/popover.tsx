import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CodeBlock } from '@/components/docs/shared';
export function PopoverDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Popover</h2>
      <Popover><PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger><PopoverContent className="w-64 text-sm">Popover content. Use for extra info.</PopoverContent></Popover>
      <CodeBlock code={`import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>`} />
    </div>
  );
}
