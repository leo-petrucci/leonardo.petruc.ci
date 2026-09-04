import { Slider } from '@/components/ui/slider';
import { ExampleWrap } from '@/components/docs/shared';
export function SliderDoc() {
  return (
    <ExampleWrap title="Slider" description="Single value slider. Control via value/onValueChange." code={`import { Slider } from "@/components/ui/slider"

<Slider defaultValue={[50]} max={100} step={1} className="w-[200px]" />`}>
      <Slider defaultValue={[50]} max={100} step={1} className="w-[200px]" />
    </ExampleWrap>
  );
}
