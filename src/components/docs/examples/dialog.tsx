import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CodeBlock } from '@/components/docs/shared';
export function DialogDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dialog</h2><p className="text-sm text-muted-foreground">Modal with overlay, header, footer.</p>
      <Dialog><DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Are you sure?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline">Cancel</Button><Button>Continue</Button></div></DialogContent></Dialog>
      <CodeBlock code={`import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`} />
    </div>
  );
}
