import { Progress } from '@/components/ui/progress';
import { ExampleWrap } from '@/components/docs/shared';
export function ProgressDoc() {
  return (
    <ExampleWrap title="Progress" description="Value 0-100." code={`import { Progress } from "@/components/ui/progress"

<Progress value={66} className="w-[200px]" />`}>
      <Progress value={66} className="w-[200px]" />
    </ExampleWrap>
  );
}
