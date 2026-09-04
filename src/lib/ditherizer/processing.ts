import type {
  ColorReductionMode,
  DitherMode,
} from '@/lib/image/ditherClient';

export type LastProcessed = {
  colors: number;
  scale: number;
  mode: DitherMode;
  colorReduction: ColorReductionMode;
};

export function shouldTriggerProcessing(
  last: LastProcessed | null,
  next: LastProcessed
): boolean {
  if (!last) return true;
  return (
    last.colors !== next.colors ||
    last.scale !== next.scale ||
    last.mode !== next.mode ||
    last.colorReduction !== next.colorReduction
  );
}

export function isEqualProcessed(
  a: LastProcessed | null,
  b: LastProcessed
): boolean {
  if (!a) return false;
  return (
    a.colors === b.colors &&
    a.scale === b.scale &&
    a.mode === b.mode &&
    a.colorReduction === b.colorReduction
  );
}
