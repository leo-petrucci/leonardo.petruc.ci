import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CodeBlock } from '@/components/docs/shared';

const formSchema = z.object({
  username: z.string().min(2, 'Username needs 2+ characters.'),
  email: z.string().email('Enter a valid email.'),
  bio: z.string().max(160).optional(),
});
function FormExample() {
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { username: '', email: '', bio: '' } });
  const onSubmit = (values: z.infer<typeof formSchema>) => { alert(JSON.stringify(values, null, 2)); };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder=" Ada" {...field} /></FormControl><FormDescription>Your public name.</FormDescription><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="ada@webflow.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="bio" render={({ field }) => (
          <FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea placeholder="Tell us a bit..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
export function FormDoc() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Form</h2>
      <p className="text-sm text-muted-foreground">Already installed. Uses <code className="bg-muted px-1 rounded text-xs">react-hook-form</code> + <code className="bg-muted px-1 rounded text-xs">zod</code> + shadcn Form primitives.</p>
      <div className="rounded-xl border bg-card p-6"><FormExample /></div>
      <CodeBlock code={`import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
})

function MyForm() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { username: "", email: "" } })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}`} />
    </div>
  );
}
