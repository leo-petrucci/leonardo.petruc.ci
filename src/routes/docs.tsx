import { createFileRoute, Link } from '@tanstack/react-router';
import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertCircle, Check, Copy, Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AsciiBorder } from '@/components/ui/ascii-border';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export const Route = createFileRoute('/docs')({
  component: DocsPage,
});

type DocItem = {
  id: string;
  label: string;
  group: string;
};

const DOCS: DocItem[] = [
  { id: 'intro', label: 'Introduction', group: 'Overview' },
  { id: 'button', label: 'Button', group: 'Actions' },
  { id: 'badge', label: 'Badge', group: 'Actions' },
  { id: 'card', label: 'Card', group: 'Layout' },
  { id: 'alert', label: 'Alert', group: 'Feedback' },
  { id: 'avatar', label: 'Avatar', group: 'Data' },
  { id: 'input', label: 'Input', group: 'Forms' },
  { id: 'textarea', label: 'Textarea', group: 'Forms' },
  { id: 'select', label: 'Select', group: 'Forms' },
  { id: 'checkbox', label: 'Checkbox', group: 'Forms' },
  { id: 'radio', label: 'Radio Group', group: 'Forms' },
  { id: 'switch', label: 'Switch', group: 'Forms' },
  { id: 'slider', label: 'Slider', group: 'Forms' },
  { id: 'form', label: 'Form', group: 'Forms' },
  { id: 'table', label: 'Table', group: 'Data' },
  { id: 'tabs', label: 'Tabs', group: 'Layout' },
  { id: 'accordion', label: 'Accordion', group: 'Layout' },
  { id: 'collapsible', label: 'Collapsible', group: 'Layout' },
  { id: 'ascii-border', label: 'Ascii Border', group: 'Layout' },
  { id: 'separator', label: 'Separator', group: 'Layout' },
  { id: 'skeleton', label: 'Skeleton', group: 'Feedback' },
  { id: 'progress', label: 'Progress', group: 'Feedback' },
  { id: 'dialog', label: 'Dialog', group: 'Overlay' },
  { id: 'sheet', label: 'Sheet', group: 'Overlay' },
  { id: 'dropdown', label: 'Dropdown Menu', group: 'Overlay' },
  { id: 'popover', label: 'Popover', group: 'Overlay' },
  { id: 'tooltip', label: 'Tooltip', group: 'Overlay' },
];

const GROUPS = [...new Set(DOCS.map((d) => d.group))];

function CodeBlock({ code }: { code: string }) {
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

function ExampleWrap({
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

// ---- Form example ----
const formSchema = z.object({
  username: z.string().min(2, 'Username needs 2+ characters.'),
  email: z.string().email('Enter a valid email.'),
  bio: z.string().max(160).optional(),
});

function FormExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '', bio: '' },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    alert(JSON.stringify(values, null, 2));
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder=" Ada" {...field} />
              </FormControl>
              <FormDescription>Your public name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="ada@webflow.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us a bit..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

function DocsPage() {
  const [active, setActive] = React.useState('intro');
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // sync hash to active for deep link
  React.useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && DOCS.some((d) => d.id === hash)) setActive(hash);
  }, []);

  const setActiveAndHash = (id: string) => {
    setActive(id);
    window.history.replaceState(null, '', `#${id}`);
    setMobileOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* top bar */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-[1400px] px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </Button>
              <Link to="/" className="font-mono text-sm font-semibold">
                petruc.ci{' '}
                <span className="text-muted-foreground font-normal">
                  / docs
                </span>
              </Link>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                shadcn + Tailwind v4
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                ← Home
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] flex">
          {/* sidebar desktop */}
          <aside className="hidden lg:block w-[260px] shrink-0 border-r min-h-[calc(100vh-56px)] sticky top-14 self-start overflow-y-auto h-[calc(100vh-56px)]">
            <nav className="p-4 space-y-6">
              {GROUPS.map((group) => (
                <div key={group}>
                  <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-2 px-2">
                    {group}
                  </div>
                  <div className="space-y-0.5">
                    {DOCS.filter((d) => d.group === group).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveAndHash(item.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${active === item.id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* sidebar mobile drawer */}
          {mobileOpen && (
            <div
              className="lg:hidden fixed inset-0 z-30 bg-black/40"
              onClick={() => setMobileOpen(false)}
            >
              <aside
                className="w-[280px] bg-background border-r h-full overflow-y-auto p-4 space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                {GROUPS.map((group) => (
                  <div key={group}>
                    <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-2 px-2">
                      {group}
                    </div>
                    <div className="space-y-0.5">
                      {DOCS.filter((d) => d.group === group).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveAndHash(item.id)}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${active === item.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </aside>
            </div>
          )}

          {/* main */}
          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {active === 'intro' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Design System Docs
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Mini-docs for your shadcn setup. Tailwind v4 + CSS vars
                      are wired in{' '}
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                        src/styles/app.css
                      </code>
                      . Your{' '}
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                        CornerButton
                      </code>{' '}
                      moved to{' '}
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                        @/components/ui/button
                      </code>{' '}
                      (<code>compact</code> prop).
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">How to use</CardTitle>
                        <CardDescription>
                          Copy the code block under each example.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        All components live in <code>@/components/ui/*</code>{' '}
                        and use the <code>cn</code> helper from{' '}
                        <code>@/lib/utils</code>.
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Install more</CardTitle>
                        <CardDescription>
                          Run shadcn add for new items.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CodeBlock
                          code={`npx shadcn@latest add calendar sonner`}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>new-york style</Badge>
                    <Badge variant="secondary">neutral base</Badge>
                    <Badge variant="outline">radix-ui</Badge>
                  </div>
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    Pick a component from the sidebar to see live example + copy
                    code.
                  </p>
                </div>
              )}

              {active === 'button' && (
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
              )}

              {active === 'badge' && (
                <ExampleWrap
                  title="Badge"
                  description="Small status label. Variants: default, secondary, destructive, outline."
                  code={`import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`}
                >
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </ExampleWrap>
              )}

              {active === 'card' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Card</h2>
                  <p className="text-sm text-muted-foreground">
                    Container with header, content, footer. Now with ASCII border
                    and <code className="bg-muted px-1 rounded text-xs">+</code> corners via{" "}
                    <code className="bg-muted px-1 rounded text-xs">ascii-border ascii-plus</code>.
                  </p>
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
                  <CodeBlock
                    code={`import { AsciiBorder } from "@/components/ui/ascii-border"
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
</div>`}
                  />
                </div>
              )}

              {active === 'alert' && (
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
                    <Alert variant="info">
                      <AlertTitle>Heads up</AlertTitle>
                      <AlertDescription>Blue info — same as Callout type="info".</AlertDescription>
                    </Alert>
                    <Alert variant="warning">
                      <AlertTitle>Careful</AlertTitle>
                      <AlertDescription>Yellow warning — same as Callout type="warning".</AlertDescription>
                    </Alert>
                    <Alert variant="tip">
                      <AlertTitle>Tip</AlertTitle>
                      <AlertDescription>Green tip — same as Callout type="tip".</AlertDescription>
                    </Alert>
                    <Alert variant="danger">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>Red danger — same as Callout type="danger".</AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>Gray note — default.</AlertDescription>
                    </Alert>
                  </div>
                </ExampleWrap>
              )}

              {active === 'avatar' && (
                <ExampleWrap
                  title="Avatar"
                  description="Image with fallback. Use fallback for initials."
                  code={`import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`}
                >
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>LP</AvatarFallback>
                  </Avatar>
                </ExampleWrap>
              )}

              {active === 'input' && (
                <ExampleWrap
                  title="Input"
                  description="Text field with focus ring and disabled state."
                  code={`import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="grid gap-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="you@example.com" />
</div>`}
                >
                  <div className="w-full max-w-sm grid gap-2">
                    <Label htmlFor="demo-email">Email</Label>
                    <Input id="demo-email" placeholder="you@example.com" />
                  </div>
                </ExampleWrap>
              )}

              {active === 'textarea' && (
                <ExampleWrap
                  title="Textarea"
                  description="Multi-line input. Respects placeholder and disabled."
                  code={`import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

<Label htmlFor="bio">Bio</Label>
<Textarea id="bio" placeholder="Tell us about you..." />`}
                >
                  <div className="w-full max-w-sm grid gap-2">
                    <Label htmlFor="demo-bio">Bio</Label>
                    <Textarea
                      id="demo-bio"
                      placeholder="Tell us about you..."
                    />
                  </div>
                </ExampleWrap>
              )}

              {active === 'select' && (
                <ExampleWrap
                  title="Select"
                  description="Radix select. Trigger + Content + Item."
                  code={`import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
  </SelectContent>
</Select>`}
                >
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </ExampleWrap>
              )}

              {active === 'checkbox' && (
                <ExampleWrap
                  title="Checkbox"
                  description="Controlled or uncontrolled. Use with Label."
                  code={`import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox id="c1" />
                    <Label htmlFor="c1">Accept terms</Label>
                  </div>
                </ExampleWrap>
              )}

              {active === 'radio' && (
                <ExampleWrap
                  title="Radio Group"
                  description="Single choice from a set."
                  code={`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

<RadioGroup defaultValue="r1">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="r1" id="r1" />
    <Label htmlFor="r1">Option one</Label>
  </div>
</RadioGroup>`}
                >
                  <RadioGroup defaultValue="r1">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="r1" id="r1" />
                      <Label htmlFor="r1">Option one</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="r2" id="r2" />
                      <Label htmlFor="r2">Option two</Label>
                    </div>
                  </RadioGroup>
                </ExampleWrap>
              )}

              {active === 'switch' && (
                <ExampleWrap
                  title="Switch"
                  description="Toggle. Often paired with Label."
                  code={`import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

<div className="flex items-center gap-2">
  <Switch id="airplane" />
  <Label htmlFor="airplane">Airplane mode</Label>
</div>`}
                >
                  <div className="flex items-center gap-2">
                    <Switch id="airplane" />
                    <Label htmlFor="airplane">Airplane mode</Label>
                  </div>
                </ExampleWrap>
              )}

              {active === 'slider' && (
                <ExampleWrap
                  title="Slider"
                  description="Single value slider. Control via value/onValueChange."
                  code={`import { Slider } from "@/components/ui/slider"

<Slider defaultValue={[50]} max={100} step={1} className="w-[200px]" />`}
                >
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    className="w-[200px]"
                  />
                </ExampleWrap>
              )}

              {active === 'form' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Form</h2>
                  <p className="text-sm text-muted-foreground">
                    Already installed. Uses{' '}
                    <code className="bg-muted px-1 px-1 rounded text-xs">
                      react-hook-form
                    </code>{' '}
                    + <code className="bg-muted px-1 rounded text-xs">zod</code>{' '}
                    + shadcn Form primitives.
                  </p>
                  <div className="rounded-xl border bg-card p-6">
                    <FormExample />
                  </div>
                  <CodeBlock
                    code={`import { z } from "zod"
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
}`}
                  />
                </div>
              )}

              {active === 'table' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Table</h2>
                  <p className="text-sm text-muted-foreground">
                    Semantic table with header, rows, caption.
                  </p>
                  <div className="rounded-xl border bg-card p-2">
                    <Table>
                      <TableCaption>Invoices</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>INV001</TableCell>
                          <TableCell>Paid</TableCell>
                          <TableCell className="text-right">$250</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>INV002</TableCell>
                          <TableCell>Pending</TableCell>
                          <TableCell className="text-right">$150</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <CodeBlock
                    code={`import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow><TableHead>Invoice</TableHead><TableHead>Amount</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell>INV001</TableCell><TableCell>$250</TableCell></TableRow>
  </TableBody>
</Table>`}
                  />
                </div>
              )}

              {active === 'tabs' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Tabs</h2>
                  <p className="text-sm text-muted-foreground">
                    Switch between panels.
                  </p>
                  <Tabs defaultValue="account" className="w-full max-w-md">
                    <TabsList>
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="account"
                      className="border rounded-lg p-4 text-sm"
                    >
                      Account settings here.
                    </TabsContent>
                    <TabsContent
                      value="password"
                      className="border rounded-lg p-4 text-sm"
                    >
                      Password form here.
                    </TabsContent>
                  </Tabs>
                  <CodeBlock
                    code={`import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
</Tabs>`}
                  />
                </div>
              )}

              {active === 'accordion' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Accordion</h2>
                  <p className="text-sm text-muted-foreground">Same primitives as MDX — dashed bottom, + / − glyph.</p>
                  <Accordion type="single" collapsible className="w-full max-w-md">
                    <AccordionItem value="a1">
                      <AccordionTrigger>Is it accessible?</AccordionTrigger>
                      <AccordionContent>Yes, built on Radix.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="a2">
                      <AccordionTrigger>Can I use it?</AccordionTrigger>
                      <AccordionContent>Copy the code below.</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <CodeBlock
                    code={`import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Question?</AccordionTrigger>
    <AccordionContent>Answer.</AccordionContent>
  </AccordionItem>
</Accordion>`}
                  />
                </div>
              )}

              {active === 'collapsible' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Collapsible</h2>
                  <Collapsible className="w-full max-w-md border rounded-lg p-4 space-y-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        Toggle
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="text-sm text-muted-foreground">
                      Hidden content revealed.
                    </CollapsibleContent>
                  </Collapsible>
                  <CodeBlock
                    code={`import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

<Collapsible>
  <CollapsibleTrigger asChild><Button>Toggle</Button></CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>`}
                  />
                </div>
              )}

              {active === 'ascii-border' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Ascii Border</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      ASCII box with thick dashes (<code className="bg-muted px-1 rounded text-xs">stroke-width 3</code>, <code className="bg-muted px-1 rounded text-xs">oklch(0.3853 0.01 286.03)</code>) and optional <code className="bg-muted px-1 rounded text-xs">+</code> corners. Built on <code className="bg-muted px-1 rounded text-xs">.ascii-border</code> + <code className="bg-muted px-1 rounded text-xs">.ascii-plus</code> in <code className="bg-muted px-1 rounded text-xs">src/styles/app.css</code>. All <code className="bg-muted px-1 rounded text-xs">ascii-dashed*</code> utilities now share same thickness.
                    </p>
                  </div>
                  <div className="rounded-xl border bg-card p-6 flex flex-col gap-6">
                    <AsciiBorder>
                      <div className="text-sm font-mono">Default — withCorners (ascii-border + ascii-plus)</div>
                      <p className="text-sm text-muted-foreground mt-2">Top/bottom 2 6 dashes, sides 10 14. Corners use <code className="bg-muted px-1 rounded text-xs">ascii-plus</code> with <code className="bg-muted px-1 rounded text-xs">#000</code> behind <code className="bg-muted px-1 rounded text-xs">+</code>.</p>
                    </AsciiBorder>
                    <AsciiBorder withCorners={false} className="p-4">
                      <div className="text-sm font-semibold">Without corners</div>
                      <p className="text-sm text-muted-foreground"><code className="bg-muted px-1 rounded text-xs">withCorners={false}</code> or just <code className="bg-muted px-1 rounded text-xs">ascii-border</code> without <code className="bg-muted px-1 rounded text-xs">ascii-plus</code>.</p>
                    </AsciiBorder>
                    <div className="grid sm:grid-cols-2 gap-4 w-full">
                      <AsciiBorder className="p-4 text-sm">Grid cell</AsciiBorder>
                      <AsciiBorder withCorners={false} className="p-4 text-sm">Border only</AsciiBorder>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="ascii-dashed p-4 text-sm flex-1">ascii-dashed (now thick oklch)</div>
                      <div className="ascii-dashed-bottom p-4 text-sm flex-1">ascii-dashed-bottom</div>
                      <div className="ascii-dashed-left p-4 pl-6 text-sm flex-1">ascii-dashed-left</div>
                    </div>
                  </div>
                  <CodeBlock
                    code={`import { AsciiBorder } from "@/components/ui/ascii-border"

<AsciiBorder>
  Content with ASCII border and + corners
</AsciiBorder>

<AsciiBorder withCorners={false}>
  Border without corners
</AsciiBorder>

// Utilities directly
<div className="ascii-border p-6">border only</div>
<div className="ascii-border ascii-plus p-6">border + corners</div>
<div className="ascii-dashed p-4">full rect</div>
<div className="ascii-dashed-bottom p-4">bottom only</div>
<div className="ascii-dashed-left p-4">left only</div>`}
                  />
                </div>
              )}

              {active === 'separator' && (
                <ExampleWrap
                  title="Separator"
                  description="Horizontal or vertical divider."
                  code={`import { Separator } from "@/components/ui/separator"

<Separator />
<Separator orientation="vertical" className="h-5" />`}
                >
                  <div className="w-full space-y-3 flex flex-col gap-4">
                    <div>
                      <div className="text-sm">Top</div>
                      <Separator />
                      <div className="text-sm">Bottom</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm w-16 h-16 flex items-center justify-center border">Left</span>
                      <Separator orientation="vertical" />
                      <span className="text-sm w-16 h-16 flex items-center justify-center border">Right</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-smflex items-center justify-center border">Left</span>
                      <Separator orientation="vertical" />
                      <span className="text-sm flex items-center justify-center border">Right</span>
                    </div>
                  </div>
                </ExampleWrap>
              )}

              {active === 'skeleton' && (
                <ExampleWrap
                  title="Skeleton"
                  description="Placeholder while loading."
                  code={`import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-4 w-[150px]" />`}
                >
                  <div className="space-y-2 w-full max-w-sm">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </ExampleWrap>
              )}

              {active === 'progress' && (
                <ExampleWrap
                  title="Progress"
                  description="Value 0-100."
                  code={`import { Progress } from "@/components/ui/progress"

<Progress value={66} className="w-[200px]" />`}
                >
                  <Progress value={66} className="w-[200px]" />
                </ExampleWrap>
              )}

              {active === 'dialog' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Dialog</h2>
                  <p className="text-sm text-muted-foreground">
                    Modal with overlay, header, footer.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Open dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Continue</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <CodeBlock
                    code={`import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
                  />
                </div>
              )}

              {active === 'sheet' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Sheet</h2>
                  <p className="text-sm text-muted-foreground">
                    Side drawer. Side: left | right | top | bottom.
                  </p>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline">Open sheet</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Sheet title</SheetTitle>
                        <SheetDescription>Sheet description.</SheetDescription>
                      </SheetHeader>
                      <div className="pt-4 text-sm">Content here.</div>
                    </SheetContent>
                  </Sheet>
                  <CodeBlock
                    code={`import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild><Button>Open</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>Title</SheetTitle></SheetHeader>
  </SheetContent>
</Sheet>`}
                  />
                </div>
              )}

              {active === 'dropdown' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Dropdown Menu</h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Open menu</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Billing</DropdownMenuItem>
                      <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <CodeBlock
                    code={`import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild><Button>Open</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
                  />
                </div>
              )}

              {active === 'popover' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Popover</h2>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">Open popover</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 text-sm">
                      Popover content. Use for extra info.
                    </PopoverContent>
                  </Popover>
                  <CodeBlock
                    code={`import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>`}
                  />
                </div>
              )}

              {active === 'tooltip' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Tooltip</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>Tooltip content</TooltipContent>
                  </Tooltip>
                  <CodeBlock
                    code={`import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

<Tooltip>
  <TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger>
  <TooltipContent>Content</TooltipContent>
</Tooltip>`}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
