import { Skeleton } from '@/components/ui/skeleton';
import { ExampleWrap } from '@/components/docs/shared';
export function SkeletonDoc() {
  return (
    <ExampleWrap title="Skeleton" description="Placeholder while loading." code={`import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-4 w-[150px]" />`}>
      <div className="space-y-2 w-full max-w-sm"><Skeleton className="h-4 w-[200px]" /><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-10 w-full" /></div>
    </ExampleWrap>
  );
}
