export type Size = { width: number; height: number };

export function computeDisplayOutputSize(
  outputSize: Size | null,
  sourceSize: Size | null,
  scale: number
): Size | null {
  if (outputSize) return outputSize;
  if (!sourceSize) return null;
  return {
    width: Math.max(1, Math.round(sourceSize.width * scale)),
    height: Math.max(1, Math.round(sourceSize.height * scale)),
  };
}

export function computePreviewState(
  showProcessed: boolean,
  outputUrl: string | null,
  sourceUrl: string | null
): { url: string | null; label: string } {
  const url = showProcessed ? outputUrl || sourceUrl : sourceUrl;
  const label = showProcessed ? 'Processed' : 'Original';
  return { url, label };
}

export function formatDimensions(size: Size | null): string {
  if (!size) return '--';
  return `${size.width} x ${size.height}px`;
}

export function formatScalePercent(scale: number): string {
  return `${(scale * 100).toFixed(0)}%`;
}

export function formatZoomPercent(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
