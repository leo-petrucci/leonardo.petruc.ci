export type DocItem = {
  id: string;
  label: string;
  group: string;
  description?: string;
};

export const DOCS: DocItem[] = [
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

export const GROUPS = [...new Set(DOCS.map((d) => d.group))];

export function getDoc(id: string) {
  return DOCS.find((d) => d.id === id);
}

export function getPrevNext(id: string) {
  const idx = DOCS.findIndex((d) => d.id === id);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: DOCS[idx - 1] ?? null,
    next: DOCS[idx + 1] ?? null,
  };
}
