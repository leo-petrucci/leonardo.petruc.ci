import {
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  DITHERIZER_MAX_COLORS,
  DITHERIZER_MAX_SCALE,
  DITHERIZER_MIN_COLORS,
  DITHERIZER_MIN_SCALE,
} from '@/lib/ditherizer/constants';

export function clampColors(value: number): number {
  return Math.min(
    DITHERIZER_MAX_COLORS,
    Math.max(DITHERIZER_MIN_COLORS, Math.round(value))
  );
}

export function clampScale(value: number): number {
  return Math.min(
    DITHERIZER_MAX_SCALE,
    Math.max(DITHERIZER_MIN_SCALE, value)
  );
}

export function clampZoom(value: number): number {
  return Math.min(CANVAS_MAX_ZOOM, Math.max(CANVAS_MIN_ZOOM, value));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
