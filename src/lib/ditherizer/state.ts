import type { ColorReductionMode, DitherMode } from '@/lib/image/ditherClient';
import {
  DITHERIZER_DEFAULT_COLORS,
  DITHERIZER_MAX_SCALE,
  DITHERIZER_MIN_SCALE,
} from '@/lib/ditherizer/constants';

export type DitherizerState = {
  maxColors: number;
  scale: number;
  ditherMode: DitherMode;
  colorReduction: ColorReductionMode;
  showProcessed: boolean;
};

export const DEFAULT_DITHERIZER_STATE: DitherizerState = {
  maxColors: DITHERIZER_DEFAULT_COLORS,
  scale: 1,
  ditherMode: 'ordered',
  colorReduction: 'perceptual',
  showProcessed: true,
};

export function isNewFile(prev: File | null, next: File | null): boolean {
  if (!next) return false;
  if (!prev) return true;
  return (
    next.name !== prev.name ||
    next.size !== prev.size ||
    next.lastModified !== prev.lastModified
  );
}

export function shouldResetOnNewFile(prev: File | null, next: File | null): boolean {
  return isNewFile(prev, next);
}

export function getDefaultState(): DitherizerState {
  return { ...DEFAULT_DITHERIZER_STATE };
}
