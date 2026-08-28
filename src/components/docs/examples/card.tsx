import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AsciiBorder } from '@/components/ui/ascii-border';
import { CodeBlock } from '@/components/docs/shared';
export function CardDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Card</h2>
      <p className="text-sm text-muted-foreground">Container with header, content, footer. Now with ASCII border and <code className="bg-muted px-1 rounded text-xs">+</code> corners via <code className="bg-muted px-1 rounded text-xs">ascii-border ascii-plus</code>.</p>
      <AsciiBorder className="max-w-md p-0">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">This is the card content. Use it for grouped info.</p>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
      </AsciiBorder>
      <CodeBlock code={`import { AsciiBorder } from "@/components/ui/ascii-border"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

<AsciiBorder className="max-w-md p-0">
  <Card className="border-0 shadow-none bg-transparent">
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
      <CardDescription>Card description</CardDescription>
    </CardHeader>
    <CardContent>Content here</CardContent>
    <CardFooter>
      <Button>Save</Button>
    </CardFooter>
  </Card>
</AsciiBorder>

// Or raw utilities
<div className="ascii-border ascii-plus p-6">
  Card content
</div>`} />
    </div>
  );
}
