import { AsciiBorder } from '@/components/ui/ascii-border';
import { CodeBlock } from '@/components/docs/shared';
export function AsciiBorderDoc() {
  return (
    <div className="space-y-4">
      <div><h2 className="text-xl font-semibold tracking-tight">Ascii Border</h2><p className="text-sm text-muted-foreground mt-1">ASCII box with thick dashes (<code className="bg-muted px-1 rounded text-xs">stroke-width 3</code>, <code className="bg-muted px-1 rounded text-xs">oklch(0.3853 0.01 286.03)</code>) and optional <code className="bg-muted px-1 rounded text-xs">+</code> corners. Built on <code className="bg-muted px-1 rounded text-xs">.ascii-border</code> + <code className="bg-muted px-1 rounded text-xs">.ascii-plus</code> in <code className="bg-muted px-1 rounded text-xs">src/styles/app.css</code>.</p></div>
      <div className="rounded-xl border bg-card p-6 flex flex-col gap-6">
        <AsciiBorder flush><div className="text-sm font-mono">Flush — x1=0 (no extra left gap)</div><p className="text-sm text-muted-foreground mt-2">Uses <code className="bg-muted px-1 rounded text-xs">ascii-border-flush</code> + <code className="bg-muted px-1 rounded text-xs">ascii-plus</code>. Top/bottom start at 0.</p></AsciiBorder>
        <AsciiBorder><div className="text-sm font-mono">Default — x1=4 (extra left gap before first dash)</div><p className="text-sm text-muted-foreground mt-2">Top/bottom 2 6 dashes, sides 10 14. Corners use <code className="bg-muted px-1 rounded text-xs">ascii-plus</code> with <code className="bg-muted px-1 rounded text-xs">#000</code> behind <code className="bg-muted px-1 rounded text-xs">+</code>.</p></AsciiBorder>
        <AsciiBorder flush withCorners={false} className="p-4"><div className="text-sm font-semibold">Flush without corners</div><p className="text-sm text-muted-foreground"><code className="bg-muted px-1 rounded text-xs">flush</code> + <code className="bg-muted px-1 rounded text-xs">withCorners={`{false}`}</code></p></AsciiBorder>
        <div className="grid sm:grid-cols-2 gap-4 w-full"><AsciiBorder flush className="p-4 text-sm">Flush grid</AsciiBorder><AsciiBorder withCorners={false} className="p-4 text-sm">Default border only</AsciiBorder></div>
        <div className="flex flex-wrap gap-4"><div className="ascii-dashed p-4 text-sm flex-1">ascii-dashed (now thick oklch)</div><div className="ascii-dashed-bottom p-4 text-sm flex-1">ascii-dashed-bottom</div><div className="ascii-dashed-left p-4 pl-6 text-sm flex-1">ascii-dashed-left</div></div>
      </div>
      <CodeBlock code={`import { AsciiBorder } from "@/components/ui/ascii-border"

<AsciiBorder flush>
  Flush — x1=0, no extra left gap
</AsciiBorder>

<AsciiBorder>
  Default — x1=4 extra gap before first dash
</AsciiBorder>

<AsciiBorder flush withCorners={false}>
  Flush without corners
</AsciiBorder>

// Utilities directly
<div className="ascii-border-flush p-6">flush border</div>
<div className="ascii-border-flush ascii-plus p-6">flush + corners</div>
<div className="ascii-border p-6">default border</div>
<div className="ascii-border ascii-plus p-6">default + corners</div>`} />
    </div>
  );
}
