'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent, PointerEvent } from 'react';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

import { AsciiBorder } from '@/components/ui/ascii-border';
import { Button } from '@/components/ui/button';
import {
  computeFitTransform,
  computePanDelta,
  computeWheelNextZoom,
  computeWheelPan,
  nextZoomIn,
  nextZoomOut,
} from '@/lib/ditherizer/canvasMath';
import { getFirstImageFile } from '@/lib/ditherizer/file';
import { formatZoomPercent } from '@/lib/ditherizer/display';

type Size = { width: number; height: number };

type InfiniteCanvasProps = {
  url: string | null;
  label: string;
  outputSize: Size | null;
  maxColors: number;
  showSlowProcessing: boolean;
  onFileSelected: (file: File | null) => void;
  /** Key that changes only when the source file changes, not when dither params change. Used to decide when to auto-fit. */
  fileKey?: string | null;
};

export function InfiniteCanvas({
  url,
  label,
  outputSize,
  maxColors,
  showSlowProcessing,
  onFileSelected,
  fileKey,
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState<Size | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Track whether we have already fitted for the current file.
  // When fileKey changes (new file), we should refit on next image load.
  const hasFittedRef = useRef(false);
  const prevFileKeyRef = useRef<string | null | undefined>(undefined);

  // Mirrors of state so the native wheel listener always sees current values.
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);

  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  useEffect(() => {
    zoomRef.current = zoom;
    panRef.current = pan;
  }, [zoom, pan]);

  // Measure the container and keep it updated on resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const measure = () => {
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Track fileKey changes: when a new source file is loaded, we should refit on next image.
  useEffect(() => {
    if (prevFileKeyRef.current !== fileKey) {
      prevFileKeyRef.current = fileKey ?? null;
      hasFittedRef.current = false;
    }
  }, [fileKey]);

  // Clear the known image size whenever the url changes.
  useEffect(() => {
    setImageSize(null);
  }, [url]);

  const handleImageLoad = () => {
    const img = imageRef.current;
    if (!img) {
      return;
    }
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const fitToContainer = useCallback(() => {
    if (!imageSize) {
      return;
    }
    const { zoom: nextZoom, pan: nextPan } = computeFitTransform(
      containerSize,
      imageSize
    );
    setZoom(nextZoom);
    setPan(nextPan);
    hasFittedRef.current = true;
  }, [imageSize, containerSize]);

  // Fit the image once we know both the image size and the container size.
  // Preserve pan/zoom across dither param changes (same fileKey) by only fitting once per file.
  useEffect(() => {
    if (
      imageSize &&
      containerSize.width > 0 &&
      containerSize.height > 0 &&
      !hasFittedRef.current
    ) {
      fitToContainer();
    }
  }, [imageSize, containerSize, fitToContainer]);

  // Wheel zoom, cursor-anchored. Uses a NATIVE non-passive listener because
  // React attaches `wheel` as a passive listener, where preventDefault fails.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const onWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const nextZoom = computeWheelNextZoom(currentZoom, event.deltaY);
      const nextPan = computeWheelPan(
        { x: cursorX, y: cursorY },
        currentPan,
        currentZoom,
        nextZoom
      );

      setPan(nextPan);
      setZoom(nextZoom);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag) {
      return;
    }
    setPan(
      computePanDelta(
        { x: drag.startX, y: drag.startY },
        { x: drag.panX, y: drag.panY },
        { x: event.clientX, y: event.clientY }
      )
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) {
      return;
    }
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const file = getFirstImageFile(event.dataTransfer.files);
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  return (
    <div
      ref={containerRef}
      data-testid="infinite-canvas"
      className="relative flex-1 cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
      style={{
        backgroundColor: 'var(--background)',
        backgroundImage:
          'radial-gradient(circle, var(--border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Floating toolbar (top-right). Plain border, NOT AsciiBorder. Stops pointer events so buttons do not pan. */}
      <div
        className="absolute right-3 top-3 z-10 flex items-center gap-1 border border-border bg-card/80 p-1 backdrop-blur"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Button
          compact
          variant="ghost"
          aria-label="Fit to screen"
          onClick={fitToContainer}
        >
          <Maximize2 className="size-4" />
        </Button>
        <Button
          compact
          variant="ghost"
          aria-label="Zoom in"
          onClick={() => setZoom((current) => nextZoomIn(current))}
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          compact
          variant="ghost"
          aria-label="Zoom out"
          onClick={() => setZoom((current) => nextZoomOut(current))}
        >
          <ZoomOut className="size-4" />
        </Button>
        <span className="px-2 font-departure text-ascii-sm text-muted-foreground">
          {formatZoomPercent(zoom)}
        </span>
      </div>

      {/* Metadata (top-left). AsciiBorder frame. Stops pointer events so it does not pan. */}
      <div
        className="absolute left-3 top-3 z-10"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <AsciiBorder flush className="p-3">
          <p className="font-departure text-ascii-sm uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="font-departure text-ascii-sm text-muted-foreground">
            {outputSize
              ? `${outputSize.width} x ${outputSize.height}px`
              : '--'}{' '}
            &middot; {maxColors} colors
          </p>
        </AsciiBorder>
      </div>

      {/* The pannable / zoomable world. */}
      <div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {url && (
          <img
            ref={imageRef}
            src={url}
            alt="Dithered preview"
            draggable={false}
            onLoad={handleImageLoad}
            style={{ imageRendering: 'pixelated', display: 'block' }}
          />
        )}
      </div>

      {/* Empty-state hint. AsciiBorder frame. */}
      {!url && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <AsciiBorder className="px-6 py-4 text-center">
            <p className="font-departure text-ascii uppercase tracking-wider">
              Drop an image here
            </p>
            <p className="text-ascii-sm text-muted-foreground">
              or use the uploader on the left
            </p>
          </AsciiBorder>
        </div>
      )}

      {/* Drag-over highlight. */}
      {isDraggingOver && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center border-2 border-accent bg-accent/10">
          <p className="font-departure text-ascii uppercase tracking-wider text-accent">
            Drop to load image
          </p>
        </div>
      )}

      {/* Slow-processing warning. ascii-dashed-warn utility, NOT AsciiBorder. */}
      {showSlowProcessing && (
        <div className="absolute inset-x-3 bottom-3 z-10 flex justify-center">
          <div className="ascii-dashed-warn bg-amber-500/5 px-4 py-3 text-ascii-sm text-amber-600 dark:text-amber-400">
            Processing large images can take longer. It will complete. Consider
            a smaller image.
          </div>
        </div>
      )}
    </div>
  );
}
