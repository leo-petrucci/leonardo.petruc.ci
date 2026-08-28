import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CodeBlock } from '@/components/docs/shared';
export function TooltipDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tooltip</h2>
      <Tooltip><TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger><TooltipContent>Tooltip content</TooltipContent></Tooltip>
      <CodeBlock code={`import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

<Tooltip>
  <TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger>
  <TooltipContent>Content</TooltipContent>
</Tooltip>`} />
    </div>
  );
}
