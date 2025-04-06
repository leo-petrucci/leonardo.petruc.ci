import type React from 'react';

import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { encodeSvg, generateSvgString, noise } from './utils';

export function IridescentGradientGenerator() {
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 10000));
  const [gradientCount, setGradientCount] = useState<number>(16);
  const [size, setSize] = useState<number>(250);
  const [scaleVariation, setScaleVariation] = useState<number>(0.5);
  const [rotationVariation, setRotationVariation] = useState<number>(0.5);
  const [positionVariation, setPositionVariation] = useState<number>(0.5);
  const [svgCode, setSvgCode] = useState<string>('');

  useEffect(() => {
    setSvgCode(
      generateSvgString(
        seed,
        gradientCount,
        size,
        scaleVariation,
        rotationVariation,
        positionVariation
      )
    );
  }, [
    seed,
    gradientCount,
    size,
    scaleVariation,
    rotationVariation,
    positionVariation,
  ]);

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iridescent-gradient-${seed}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeed = Number.parseInt(e.target.value) || 0;
    setSeed(newSeed);
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 10000));
  };

  const encoded = useMemo(() => {
    const encoded = encodeSvg(svgCode);
    return encoded;
  }, [svgCode]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="seed">Seed Value</Label>
              <div className="flex gap-2">
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={handleSeedChange}
                  className="w-full"
                />
                <Button onClick={randomizeSeed}>Randomize</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradientCount">
                Number of Gradients: {gradientCount}
              </Label>
              <Slider
                id="gradientCount"
                min={3}
                max={40}
                step={1}
                value={[gradientCount]}
                onValueChange={(value) => setGradientCount(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size: {size}px</Label>
              <Slider
                id="size"
                min={100}
                max={500}
                step={10}
                value={[size]}
                onValueChange={(value) => setSize(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scaleVariation">
                Scale Variation: {Math.round(scaleVariation * 100)}%
              </Label>
              <Slider
                id="scaleVariation"
                min={0}
                max={1}
                step={0.05}
                value={[scaleVariation]}
                onValueChange={(value) => setScaleVariation(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rotationVariation">
                Rotation Variation: {Math.round(rotationVariation * 100)}%
              </Label>
              <Slider
                id="rotationVariation"
                min={0}
                max={1}
                step={0.05}
                value={[rotationVariation]}
                onValueChange={(value) => setRotationVariation(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionVariation">
                Position Variation: {Math.round(positionVariation * 100)}%
              </Label>
              <Slider
                id="positionVariation"
                min={0}
                max={1}
                step={0.05}
                value={[positionVariation]}
                onValueChange={(value) => setPositionVariation(value[0])}
              />
            </div>

            <Button onClick={downloadSvg} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download SVG
            </Button>
          </div>
        </Card>

        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 p-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div
              className="w-[250px] h-[250px] bg-cover bg-center rounded-4xl"
              style={{
                backgroundImage: `
                  url("${encodeSvg(noise)}"),
                  url("${encodeSvg(noise)}"),
                  url("${encodeSvg(noise)}"),
                  url("${encoded}"),
                  url("${encoded}")
                `,
                backgroundSize: 'auto,auto,auto, cover, cover',
                backgroundBlendMode: 'soft-light,soft-light,soft-light, hard-light, normal',
                boxShadow: 'inset 0 0 15px 2px hsl(223.06deg 100% 59.02% / 47%),  inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
              }}
            />
          </div>
          <p className="text-sm text-gray-500">Seed: {seed}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SVG Code</h3>
            <div className="relative">
              <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto max-h-[300px] text-xs">
                {svgCode}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(svgCode);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
