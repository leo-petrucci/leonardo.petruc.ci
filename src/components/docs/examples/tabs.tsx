import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/docs/shared';
export function TabsDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Tabs</h2><p className="text-sm text-muted-foreground">Switch between panels.</p>
      <Tabs defaultValue="account" className="w-full max-w-md"><TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList><TabsContent value="account" className="border rounded-lg p-4 text-sm">Account settings here.</TabsContent><TabsContent value="password" className="border rounded-lg p-4 text-sm">Password form here.</TabsContent></Tabs>
      <CodeBlock code={`import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
</Tabs>`} />
    </div>
  );
}
