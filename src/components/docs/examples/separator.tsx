import { Separator } from '@/components/ui/separator';
import { ExampleWrap } from '@/components/docs/shared';
export function SeparatorDoc() {
  return (
    <ExampleWrap title="Separator" description="Horizontal or vertical divider." code={`import { Separator } from "@/components/ui/separator"

<Separator />
<Separator orientation="vertical" className="h-5" />`}>
      <div className="w-full space-y-3 flex flex-col gap-4">
        <div><div className="text-sm">Top</div><Separator /><div className="text-sm">Bottom</div></div>
        <div className="flex items-center gap-3"><span className="text-sm w-16 h-16 flex items-center justify-center border">Left</span><Separator orientation="vertical" /><span className="text-sm w-16 h-16 flex items-center justify-center border">Right</span></div>
      </div>
    </ExampleWrap>
  );
}
