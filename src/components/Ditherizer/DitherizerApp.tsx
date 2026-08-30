'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { ControlsPanel } from '@/components/Ditherizer/ControlsPanel';
import { InfiniteCanvas } from '@/components/Ditherizer/InfiniteCanvas';
import { UploadCard } from '@/components/Ditherizer/UploadCard';
import { useDitherProcessor } from '@/lib/hooks/useDitherProcessor';
import type {
  ColorReductionMode,
  DitherMode,
} from '@/lib/image/ditherClient';
import {
  DITHERIZER_DEFAULT_COLORS,
  DITHERIZER_MAX_COLORS,
  DITHERIZER_MAX_SCALE,
  DITHERIZER_MIN_COLORS,
  DITHERIZER_MIN_SCALE,
} from '@/lib/ditherizer/constants';
import { clampColors, clampScale } from '@/lib/ditherizer/clamp';
import {
  computeDisplayOutputSize,
  computePreviewState,
} from '@/lib/ditherizer/display';
import { shouldTriggerProcessing } from '@/lib/ditherizer/processing';
import { triggerDownload } from '@/lib/ditherizer/file';
import {
  DEFAULT_DITHERIZER_STATE,
  isNewFile,
} from '@/lib/ditherizer/state';

const MAX_COLORS = DITHERIZER_MAX_COLORS;
const MIN_COLORS = DITHERIZER_MIN_COLORS;
const DEFAULT_COLORS = DITHERIZER_DEFAULT_COLORS;
const MIN_SCALE = DITHERIZER_MIN_SCALE;
const MAX_SCALE = DITHERIZER_MAX_SCALE;

export function DitherizerApp() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [maxColors, setMaxColors] = useState(DEFAULT_COLORS);
  const [scale, setScale] = useState(1);

  const [showProcessed, setShowProcessed] = useState(true);
  const [showSlowProcessing, setShowSlowProcessing] = useState(false);
  const [ditherMode, setDitherMode] = useState<DitherMode>('ordered');
  const [colorReduction, setColorReduction] =
    useState<ColorReductionMode>('perceptual');

  const maxColorsRef = useRef(maxColors);
  const scaleRef = useRef(scale);
  const sourceFileRef = useRef(sourceFile);

  useEffect(() => {
    sourceFileRef.current = sourceFile;
  }, [sourceFile]);

  const lastProcessedRef = useRef<{
    colors: number;
    scale: number;
    mode: DitherMode;
    colorReduction: ColorReductionMode;
  } | null>(null);

  const {
    outputUrl,
    outputSize,
    sourceSize,
    isProcessing,
    error,
    process,
    reset,
  } = useDitherProcessor(sourceFile);

  useEffect(() => {
    if (!isProcessing) {
      setShowSlowProcessing(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowSlowProcessing(true);
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isProcessing]);

  const { url: previewUrl, label: previewLabel } = computePreviewState(
    showProcessed,
    outputUrl,
    sourceUrl
  );

  const displayOutputSize = useMemo(
    () => computeDisplayOutputSize(outputSize, sourceSize, scale),
    [outputSize, scale, sourceSize]
  );

  const triggerProcessing = (
    colors: number,
    nextScale: number,
    mode: DitherMode,
    reduction: ColorReductionMode
  ) => {
    if (!sourceFileRef.current) {
      return;
    }
    const next = {
      colors,
      scale: nextScale,
      mode,
      colorReduction: reduction,
    };
    if (!shouldTriggerProcessing(lastProcessedRef.current, next)) {
      return;
    }
    lastProcessedRef.current = next;
    process({
      maxColors: colors,
      scale: nextScale,
      ditherMode: mode,
      colorReduction: reduction,
    });
  };

  const resetAppState = () => {
    const defaults = DEFAULT_DITHERIZER_STATE;
    setMaxColors(defaults.maxColors);
    maxColorsRef.current = defaults.maxColors;
    setScale(defaults.scale);
    scaleRef.current = defaults.scale;
    setDitherMode(defaults.ditherMode);
    setColorReduction(defaults.colorReduction);
    setShowProcessed(defaults.showProcessed);
    setShowSlowProcessing(false);
    lastProcessedRef.current = null;
  };

  const handleFileSelect = (file: File | null) => {
    reset();
    // Reset whole app state when a new picture is loaded
    let newFile = false;
    if (file) {
      newFile = isNewFile(sourceFileRef.current, file);
      if (newFile) {
        resetAppState();
      } else {
        lastProcessedRef.current = null;
      }
    } else {
      lastProcessedRef.current = null;
    }
    sourceFileRef.current = file;
    setSourceFile(file);

    if (!file) {
      setSourceUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }
    setSourceUrl(nextUrl);
    if (newFile) {
      const d = DEFAULT_DITHERIZER_STATE;
      triggerProcessing(d.maxColors, d.scale, d.ditherMode, d.colorReduction);
    } else {
      triggerProcessing(
        maxColorsRef.current,
        scaleRef.current,
        ditherMode,
        colorReduction
      );
    }
  };

  const handleMaxColorsChange = (value: number) => {
    const clamped = clampColors(value);
    maxColorsRef.current = clamped;
    setMaxColors(clamped);
  };

  const handleScaleChange = (value: number) => {
    const clamped = clampScale(value);
    scaleRef.current = clamped;
    setScale(clamped);
  };

  const handleMaxColorsCommit = (value: number) => {
    const clamped = clampColors(value);
    maxColorsRef.current = clamped;
    setMaxColors(clamped);
    triggerProcessing(clamped, scaleRef.current, ditherMode, colorReduction);
  };

  const handleScaleCommit = (value: number) => {
    const clamped = clampScale(value);
    scaleRef.current = clamped;
    setScale(clamped);
    triggerProcessing(maxColorsRef.current, clamped, ditherMode, colorReduction);
  };

  const handleDitherModeChange = (mode: DitherMode) => {
    setDitherMode(mode);
    triggerProcessing(
      maxColorsRef.current,
      scaleRef.current,
      mode,
      colorReduction
    );
  };

  const handleColorReductionChange = (mode: ColorReductionMode) => {
    setColorReduction(mode);
    triggerProcessing(
      maxColorsRef.current,
      scaleRef.current,
      ditherMode,
      mode
    );
  };

  const handleDownload = () => {
    if (!outputUrl) {
      return;
    }
    triggerDownload(outputUrl, 'dithered.png');
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden md:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-border p-4 md:w-[360px] md:border-b-0 md:border-r">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 font-departure text-ascii-sm uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back home
        </a>
        <h1 className="font-departure text-ascii uppercase tracking-wider">
          DITHERIZER
        </h1>

        <ControlsPanel
          maxColors={MAX_COLORS}
          minColors={MIN_COLORS}
          maxScale={MAX_SCALE}
          minScale={MIN_SCALE}
          scale={scale}
          colors={maxColors}
          showProcessed={showProcessed}
          ditherMode={ditherMode}
          colorReduction={colorReduction}
          disabled={!sourceFile || isProcessing}
          isProcessing={isProcessing}
          onMaxColorsChange={handleMaxColorsChange}
          onMaxColorsCommit={handleMaxColorsCommit}
          onScaleChange={handleScaleChange}
          onScaleCommit={handleScaleCommit}
          onTogglePreview={setShowProcessed}
          onDitherModeChange={handleDitherModeChange}
          onColorReductionChange={handleColorReductionChange}
          onDownload={handleDownload}
        />

        {error && (
          <p className="ascii-dashed-danger bg-red-500/5 px-3 py-2 text-ascii-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </aside>

      <InfiniteCanvas
        url={previewUrl}
        label={previewLabel}
        outputSize={displayOutputSize}
        maxColors={maxColors}
        showSlowProcessing={showSlowProcessing}
        onFileSelected={handleFileSelect}
        fileKey={sourceFile ? `${sourceFile.name}-${sourceFile.size}-${sourceFile.lastModified}` : null}
      />
    </div>
  );
}
