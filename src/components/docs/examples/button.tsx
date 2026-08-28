import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/docs/shared';
export function ButtonDoc() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Button</h2>
        <p className="text-sm text-muted-foreground mt-1">CornerButton — ASCII frame with 4 glitching '+' corners. CVA <code className="bg-muted px-1 rounded text-xs">variant</code> prop, <code className="bg-muted px-1 rounded text-xs">compact</code> for 24px, <code className="bg-muted px-1 rounded text-xs">asChild</code> for Slot.</p>
      </div>
      <div className="space-y-3">
        <div className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Variants</div>
        <div className="rounded-xl border bg-card p-6 flex flex-wrap gap-3 items-center">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="info">Info</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="tip">Tip</Button>
        </div>
        <div className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Sizes & States</div>
        <div className="rounded-xl border bg-card p-6 flex flex-wrap gap-3 items-center">
          <Button>Default 40px</Button>
          <Button compact>Compact 24px</Button>
          <Button disabled>Disabled</Button>
          <Button variant="outline" compact>Outline Compact</Button>
        </div>
      </div>
      <CodeBlock code={`import { Button } from "@/components/ui/button"

<Button>Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="info">Info</Button>
<Button variant="warning">Warning</Button>
<Button variant="tip">Tip</Button>

<Button compact>Compact 24px</Button>
<Button disabled>Disabled</Button>
<Button asChild><a href="/">As child</a></Button>`} />
    </div>
  );
}
