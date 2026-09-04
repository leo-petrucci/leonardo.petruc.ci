import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExampleWrap } from '@/components/docs/shared';
export function AlertDoc() {
  return (
    <ExampleWrap
      title="Alert"
      description="1:1 with Callout — info (blue), warning (yellow), danger (red), tip (green), note (gray). Use variant."
      code={`import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

<Alert variant="info"><AlertTitle>Heads up</AlertTitle><AlertDescription>Info.</AlertDescription></Alert>
<Alert variant="warning"><AlertTitle>Careful</AlertTitle><AlertDescription>Warning.</AlertDescription></Alert>
<Alert variant="tip"><AlertTitle>Tip</AlertTitle><AlertDescription>Green tip.</AlertDescription></Alert>
<Alert variant="danger"><AlertTitle>Error</AlertTitle><AlertDescription>Danger.</AlertDescription></Alert>`}
    >
      <div className="w-full space-y-3">
        <Alert variant="info"><AlertTitle>Heads up</AlertTitle><AlertDescription>Blue info — same as Callout type="info".</AlertDescription></Alert>
        <Alert variant="warning"><AlertTitle>Careful</AlertTitle><AlertDescription>Yellow warning — same as Callout type="warning".</AlertDescription></Alert>
        <Alert variant="tip"><AlertTitle>Tip</AlertTitle><AlertDescription>Green tip — same as Callout type="tip".</AlertDescription></Alert>
        <Alert variant="danger"><AlertTitle>Error</AlertTitle><AlertDescription>Red danger — same as Callout type="danger".</AlertDescription></Alert>
        <Alert><AlertTitle>Note</AlertTitle><AlertDescription>Gray note — default.</AlertDescription></Alert>
      </div>
    </ExampleWrap>
  );
}
