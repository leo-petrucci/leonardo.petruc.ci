import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ExampleWrap } from '@/components/docs/shared';
export function RadioDoc() {
  return (
    <ExampleWrap title="Radio Group" description="Single choice from a set." code={`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

<RadioGroup defaultValue="r1">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="r1" id="r1" />
    <Label htmlFor="r1">Option one</Label>
  </div>
</RadioGroup>`}>
      <RadioGroup defaultValue="r1">
        <div className="flex items-center gap-2"><RadioGroupItem value="r1" id="r1" /><Label htmlFor="r1">Option one</Label></div>
        <div className="flex items-center gap-2"><RadioGroupItem value="r2" id="r2" /><Label htmlFor="r2">Option two</Label></div>
      </RadioGroup>
    </ExampleWrap>
  );
}
