import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CodeBlock } from '@/components/docs/shared';

export const Route = createFileRoute('/docs/')({
  component: IntroPage,
});

function IntroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design System Docs</h1>
        <p className="text-muted-foreground mt-2">
          Mini-docs for your shadcn setup. Tailwind v4 + CSS vars are wired in <code className="bg-muted px-1.5 py-0.5 rounded text-xs">src/styles/app.css</code>. Your{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">CornerButton</code> moved to <code className="bg-muted px-1.5 py-0.5 rounded text-xs">@/components/ui/button</code> (<code>compact</code> prop).
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">How to use</CardTitle>
            <CardDescription>Copy the code block under each example.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            All components live in <code>@/components/ui/*</code> and use the <code>cn</code> helper from <code>@/lib/utils</code>.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Install more</CardTitle>
            <CardDescription>Run shadcn add for new items.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock code={`npx shadcn@latest add calendar sonner`} />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>new-york style</Badge>
        <Badge variant="secondary">neutral base</Badge>
        <Badge variant="outline">radix-ui</Badge>
      </div>
      <Separator />
      <p className="text-sm text-muted-foreground">Pick a component from the sidebar to see live example + copy code. Each doc has its own URL — share it.</p>
      <div className="flex gap-2">
        <Link to="/docs/$slug" params={{ slug: 'button' }} className="text-sm underline underline-offset-4">
          Start with Button →
        </Link>
      </div>
    </div>
  );
}
