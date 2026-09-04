'use client';

import type { ChangeEvent, DragEvent } from 'react';
import { ImageIcon } from 'lucide-react';

import { AsciiBorder } from '@/components/ui/ascii-border';
import { Input } from '@/components/ui/input';
import { getFirstImageFile } from '@/lib/ditherizer/file';

type Size = { width: number; height: number };

type UploadCardProps = {
  sourceFile: File | null;
  sourceSize: Size | null;
  onFileSelected: (file: File | null) => void;
};

export function UploadCard({
  sourceFile,
  sourceSize,
  onFileSelected,
}: UploadCardProps) {
  const handleUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelected(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = getFirstImageFile(event.dataTransfer.files);
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  return (
    <AsciiBorder className="flex flex-col gap-2">
      <label
        htmlFor="dither-image-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="ascii-dashed flex cursor-pointer flex-col items-center justify-center gap-2 px-4 py-6 text-center"
      >
        <ImageIcon className="size-5 text-muted-foreground" />
        <span className="font-departure text-ascii-sm uppercase tracking-wider">
          Drop an image here
        </span>
        <span className="text-ascii-sm text-muted-foreground">
          or click to browse
        </span>
      </label>
      <Input
        id="dither-image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadChange}
      />
      {sourceFile && (
        <div className="border border-border bg-muted/40 px-3 py-2 text-ascii-sm">
          <p className="font-departure">{sourceFile.name}</p>
          {sourceSize && (
            <p className="text-muted-foreground">
              Original: {sourceSize.width} x {sourceSize.height}px
            </p>
          )}
        </div>
      )}
    </AsciiBorder>
  );
}
