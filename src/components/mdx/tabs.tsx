import { Children, isValidElement } from 'react';
import {
  Tabs as TabsPrimitive,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface TabChild {
  value: string;
  children: React.ReactNode;
}

/**
 * Collects direct `Tab` children and extracts their `value` prop and content.
 * Non-element children (whitespace between JSX tags in MDX) are ignored.
 */
function collectTabs(children: React.ReactNode): TabChild[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string; children?: React.ReactNode }>(child)) {
      return [];
    }
    return [{ value: String(child.props.value), children: child.props.children }];
  });
}

/**
 * Tabbed interface for MDX. Renders one trigger button per `<Tab>` child and
 * wires each panel automatically, so authors only write:
 *
 * <Tabs defaultValue="npm">
 *   <Tab value="npm">...</Tab>
 *   <Tab value="yarn">...</Tab>
 * </Tabs>
 */
export function Tabs({
  children,
  defaultValue,
}: {
  children?: React.ReactNode;
  /** Pre-selected tab value; defaults to the first tab. */
  defaultValue?: string;
}) {
  const tabs = collectTabs(children);
  if (tabs.length === 0) return null;

  return (
    <TabsPrimitive
      defaultValue={defaultValue ?? tabs[0].value}
      className="my-6"
    >
      <TabsList className="h-auto w-full justify-start gap-0 rounded-none ascii-dashed-bottom bg-transparent p-0 overflow-x-auto flex-nowrap scrollbar-none">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none border-b-2 border-transparent bg-transparent px-3 py-2 sm:py-1.5 font-departure text-ascii-sm uppercase tracking-widest text-muted-foreground shadow-none transition-colors shrink-0 min-h-11 sm:min-h-0 touch-manipulation data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:shadow-none"
          >
            {tab.value}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {tab.children}
        </TabsContent>
      ))}
    </TabsPrimitive>
  );
}

/**
 * A single tab panel. Only its `value` prop and children are consumed by
 * {@link Tabs}; it renders nothing on its own.
 *
 * @example
 * <Tab value="npm">npm install</Tab>
 */
export function Tab({
  value: _value,
  children,
}: {
  /** Unique tab identifier; shown as the trigger label. */
  value?: string;
  children?: React.ReactNode;
}) {
  return children ?? null;
}
