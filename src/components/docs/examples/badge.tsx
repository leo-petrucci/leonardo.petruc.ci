import { Badge } from '@/components/ui/badge';
import { ExampleWrap } from '@/components/docs/shared';
export function BadgeDoc() {
  return (
    <ExampleWrap
      title="Badge"
      description="Small status label. Variants: default, secondary, destructive, outline."
      code={`import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`}
    >
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </ExampleWrap>
  );
}
