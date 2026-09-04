import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="relative group">
      <pre className="bg-muted border rounded-lg p-4 pr-12 text-sm overflow-x-auto">
        <code className="font-mono text-xs leading-5 whitespace-pre">
          {code.trim()}
        </code>
      </pre>
      <Button
        size="icon"
        variant="outline"
        className="absolute top-2 right-2 size-7"
        onClick={async () => {
          await navigator.clipboard.writeText(code.trim());
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </Button>
    </div>
  );
}

export function ExampleWrap({
  children,
  title,
  description,
  code,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center justify-start py-2">
        {children}
      </div>
      <CodeBlock code={code} />
    </div>
  );
}
