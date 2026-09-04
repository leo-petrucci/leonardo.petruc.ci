import {
  CANVAS_FIT_PADDING,
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  CANVAS_ZOOM_STEP,
} from '@/lib/ditherizer/constants';
import { clampZoom } from '@/lib/ditherizer/clamp';
import type { Size } from '@/lib/ditherizer/display';

export type Pan = { x: number; y: number };

export function computeFitZoom(containerSize: Size, imageSize: Size): number {
  const fitZoom = Math.min(
    (containerSize.width - CANVAS_FIT_PADDING) / imageSize.width,
    (containerSize.height - CANVAS_FIT_PADDING) / imageSize.height,
    1
  );
  return clampZoom(fitZoom || 1);
}

export function computeFitTransform(
  containerSize: Size,
  imageSize: Size
): { zoom: number; pan: Pan } {
  const zoom = computeFitZoom(containerSize, imageSize);
  return {
    zoom,
    pan: {
      x: (containerSize.width - imageSize.width * zoom) / 2,
      y: (containerSize.height - imageSize.height * zoom) / 2,
    },
  };
}

export function computeWheelNextZoom(currentZoom: number, deltaY: number): number {
  const factor = Math.exp(-deltaY * 0.0015);
  return clampZoom(currentZoom * factor);
}

export function computeWheelPan(
  cursor: Pan,
  currentPan: Pan,
  currentZoom: number,
  nextZoom: number
): Pan {
  return {
    x: cursor.x - ((cursor.x - currentPan.x) * nextZoom) / currentZoom,
    y: cursor.y - ((cursor.y - currentPan.y) * nextZoom) / currentZoom,
  };
}

export function computePanDelta(
  dragStart: Pan,
  dragPan: Pan,
  currentClient: Pan
): Pan {
  return {
    x: dragPan.x + (currentClient.x - dragStart.x),
    y: dragPan.y + (currentClient.y - dragStart.y),
  };
}

export function nextZoomIn(currentZoom: number): number {
  return clampZoom(currentZoom * CANVAS_ZOOM_STEP);
}

export function nextZoomOut(currentZoom: number): number {
  return clampZoom(currentZoom / CANVAS_ZOOM_STEP);
}

export function isValidContainerSize(size: Size): boolean {
  return size.width > 0 && size.height > 0;
}

export function canFitImage(
  imageSize: Size | null,
  containerSize: Size
): boolean {
  return !!imageSize && isValidContainerSize(containerSize);
}
