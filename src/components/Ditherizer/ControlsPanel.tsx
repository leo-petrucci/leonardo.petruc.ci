'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import { AsciiBorder } from '@/components/ui/ascii-border';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type {
  ColorReductionMode,
  DitherMode,
} from '@/lib/image/ditherClient';

type ControlsPanelProps = {
  maxColors: number;
  minColors: number;
  maxScale: number;
  minScale: number;
  scale: number;
  colors: number;
  showProcessed: boolean;
  ditherMode: DitherMode;
  colorReduction: ColorReductionMode;
  disabled: boolean;
  isProcessing: boolean;
  onMaxColorsChange: (value: number) => void;
  onMaxColorsCommit: (value: number) => void;
  onScaleChange: (value: number) => void;
  onScaleCommit: (value: number) => void;
  onTogglePreview: (showProcessed: boolean) => void;
  onDitherModeChange: (mode: DitherMode) => void;
  onColorReductionChange: (mode: ColorReductionMode) => void;
  onDownload: () => void;
};

const REDUCTION_OPTIONS: Array<{ label: string; value: ColorReductionMode }> = [
  { label: 'Perceptual', value: 'perceptual' },
  { label: 'Perceptual+', value: 'perceptual-plus' },
  { label: 'Selective', value: 'selective' },
  { label: 'Adaptive', value: 'adaptive' },
  { label: 'Restrictive', value: 'restrictive' },
];

const DITHER_OPTIONS: Array<{ label: string; value: DitherMode }> = [
  { label: 'Ordered', value: 'ordered' },
  { label: 'Diffusion', value: 'diffusion' },
  { label: 'None', value: 'none' },
];

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-departure text-ascii-sm uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

export function ControlsPanel({
  maxColors,
  minColors,
  maxScale,
  minScale,
  scale,
  colors,
  showProcessed,
  ditherMode,
  colorReduction,
  disabled,
  isProcessing,
  onMaxColorsChange,
  onMaxColorsCommit,
  onScaleChange,
  onScaleCommit,
  onTogglePreview,
  onDitherModeChange,
  onColorReductionChange,
  onDownload,
}: ControlsPanelProps) {
  return (
    <AsciiBorder className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <FieldLabel>Controls</FieldLabel>
        {isProcessing && (
          <span className="flex items-center gap-2 text-ascii-sm uppercase tracking-wider text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Processing
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <FieldLabel>Palette size</FieldLabel>
          <span className="bg-muted px-2 py-0.5 font-departure text-ascii-sm">
            {colors} colors
          </span>
        </div>
        <Slider
          min={minColors}
          max={maxColors}
          step={1}
          value={[colors]}
          disabled={disabled}
          onValueChange={(value) => onMaxColorsChange(value[0] ?? maxColors)}
          onValueCommit={(value) => onMaxColorsCommit(value[0] ?? maxColors)}
        />
        <Input
          type="number"
          min={minColors}
          max={maxColors}
          value={colors}
          disabled={disabled}
          onChange={(event) =>
            onMaxColorsChange(Number(event.currentTarget.value))
          }
          onBlur={(event) =>
            onMaxColorsCommit(Number(event.currentTarget.value))
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <FieldLabel>Scale output</FieldLabel>
          <span className="bg-muted px-2 py-0.5 font-departure text-ascii-sm">
            {(scale * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          min={minScale}
          max={maxScale}
          step={0.01}
          value={[scale]}
          disabled={disabled}
          onValueChange={(value) => onScaleChange(value[0] ?? scale)}
          onValueCommit={(value) => onScaleCommit(value[0] ?? scale)}
        />
        <Input
          type="number"
          min={minScale}
          max={maxScale}
          step={0.01}
          value={scale}
          disabled={disabled}
          onChange={(event) => onScaleChange(Number(event.currentTarget.value))}
          onBlur={(event) => onScaleCommit(Number(event.currentTarget.value))}
        />
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel>Color reduction</FieldLabel>
        <Select
          value={colorReduction}
          disabled={disabled}
          onValueChange={(value) =>
            onColorReductionChange(value as ColorReductionMode)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select reduction" />
          </SelectTrigger>
          <SelectContent>
            {REDUCTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel>Dither mode</FieldLabel>
        <Select
          value={ditherMode}
          disabled={disabled}
          onValueChange={(value) => onDitherModeChange(value as DitherMode)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            {DITHER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel>Preview</FieldLabel>
        <div className="flex gap-1">
          <Button
            variant={showProcessed ? 'default' : 'ghost'}
            onClick={() => onTogglePreview(true)}
            className="flex-1"
          >
            Processed
          </Button>
          <Button
            variant={showProcessed ? 'ghost' : 'default'}
            onClick={() => onTogglePreview(false)}
            className="flex-1"
          >
            Original
          </Button>
        </div>
      </div>

      <Button onClick={onDownload} disabled={disabled} className="w-full">
        Download PNG
      </Button>
    </AsciiBorder>
  );
}
