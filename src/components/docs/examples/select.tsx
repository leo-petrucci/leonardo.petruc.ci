import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExampleWrap } from '@/components/docs/shared';
export function SelectDoc() {
  return (
    <ExampleWrap
      title="Select"
      description="Radix select. Trigger + Content + Item."
      code={`import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
  </SelectContent>
</Select>`}
    >
      <Select>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Theme" /></SelectTrigger>
        <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
      </Select>
    </ExampleWrap>
  );
}
