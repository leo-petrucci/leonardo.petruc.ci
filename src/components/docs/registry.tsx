import { ButtonDoc } from '@/components/docs/examples/button';
import { BadgeDoc } from '@/components/docs/examples/badge';
import { CardDoc } from '@/components/docs/examples/card';
import { AlertDoc } from '@/components/docs/examples/alert';
import { AvatarDoc } from '@/components/docs/examples/avatar';
import { InputDoc } from '@/components/docs/examples/input';
import { TextareaDoc } from '@/components/docs/examples/textarea';
import { SelectDoc } from '@/components/docs/examples/select';
import { CheckboxDoc } from '@/components/docs/examples/checkbox';
import { RadioDoc } from '@/components/docs/examples/radio';
import { SwitchDoc } from '@/components/docs/examples/switch';
import { SliderDoc } from '@/components/docs/examples/slider';
import { FormDoc } from '@/components/docs/examples/form';
import { TableDoc } from '@/components/docs/examples/table';
import { TabsDoc } from '@/components/docs/examples/tabs';
import { AccordionDoc } from '@/components/docs/examples/accordion';
import { CollapsibleDoc } from '@/components/docs/examples/collapsible';
import { AsciiBorderDoc } from '@/components/docs/examples/ascii-border';
import { SeparatorDoc } from '@/components/docs/examples/separator';
import { SkeletonDoc } from '@/components/docs/examples/skeleton';
import { ProgressDoc } from '@/components/docs/examples/progress';
import { DialogDoc } from '@/components/docs/examples/dialog';
import { SheetDoc } from '@/components/docs/examples/sheet';
import { DropdownDoc } from '@/components/docs/examples/dropdown';
import { PopoverDoc } from '@/components/docs/examples/popover';
import { TooltipDoc } from '@/components/docs/examples/tooltip';

export const DOC_COMPONENTS: Record<string, React.ComponentType> = {
  button: ButtonDoc,
  badge: BadgeDoc,
  card: CardDoc,
  alert: AlertDoc,
  avatar: AvatarDoc,
  input: InputDoc,
  textarea: TextareaDoc,
  select: SelectDoc,
  checkbox: CheckboxDoc,
  radio: RadioDoc,
  switch: SwitchDoc,
  slider: SliderDoc,
  form: FormDoc,
  table: TableDoc,
  tabs: TabsDoc,
  accordion: AccordionDoc,
  collapsible: CollapsibleDoc,
  'ascii-border': AsciiBorderDoc,
  separator: SeparatorDoc,
  skeleton: SkeletonDoc,
  progress: ProgressDoc,
  dialog: DialogDoc,
  sheet: SheetDoc,
  dropdown: DropdownDoc,
  popover: PopoverDoc,
  tooltip: TooltipDoc,
};
