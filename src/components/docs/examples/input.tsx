import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExampleWrap } from '@/components/docs/shared';
export function InputDoc() {
  return (
    <ExampleWrap
      title="Input"
      description="Text field with focus ring and disabled state."
      code={`import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="you@example.com" />
</div>`}
    >
      <div className="w-full max-w-sm grid gap-2">
        <Label htmlFor="demo-email">Email</Label>
        <Input id="demo-email" placeholder="you@example.com" />
      </div>
    </ExampleWrap>
  );
}
