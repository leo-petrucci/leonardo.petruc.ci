import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ExampleWrap } from '@/components/docs/shared';
export function CheckboxDoc() {
  return (
    <ExampleWrap
      title="Checkbox"
      description="Controlled or uncontrolled. Use with Label."
      code={`import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>`}
    >
      <div className="flex items-center gap-2"><Checkbox id="c1" /><Label htmlFor="c1">Accept terms</Label></div>
    </ExampleWrap>
  );
}
