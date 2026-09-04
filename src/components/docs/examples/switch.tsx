import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ExampleWrap } from '@/components/docs/shared';
export function SwitchDoc() {
  return (
    <ExampleWrap title="Switch" description="Toggle. Often paired with Label." code={`import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

<div className="flex items-center gap-2">
  <Switch id="airplane" />
  <Label htmlFor="airplane">Airplane mode</Label>
</div>`}>
      <div className="flex items-center gap-2"><Switch id="airplane" /><Label htmlFor="airplane">Airplane mode</Label></div>
    </ExampleWrap>
  );
}
