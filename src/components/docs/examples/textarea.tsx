import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ExampleWrap } from '@/components/docs/shared';
export function TextareaDoc() {
  return (
    <ExampleWrap
      title="Textarea"
      description="Multi-line input. Respects placeholder and disabled."
      code={`import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

<Label htmlFor="bio">Bio</Label>
<Textarea id="bio" placeholder="Tell us about you..." />`}
    >
      <div className="w-full max-w-sm grid gap-2">
        <Label htmlFor="demo-bio">Bio</Label>
        <Textarea id="demo-bio" placeholder="Tell us about you..." />
      </div>
    </ExampleWrap>
  );
}
