'use client';

import React, { useMemo, useState } from 'react';
import { SeededRandom, wordToNumber } from './utils';
import { motion } from 'framer-motion'; // Import Framer Motion

interface IridescentGeneratorProps {
  seed: string;
  gradientCount?: number;
  size?: number;
  scaleVariation?: number;
  rotationVariation?: number;
  positionVariation?: number;
}

const COLORS = {
  base: ['#BAC3E5', '#878EAB'],
  gradients: [
    ['#2CFBA9', '#FBE038'],
    ['#FCEFBB', '#22FFAA'],
    ['#ED85FE', '#C75EFF'],
    ['#1F45FE', '#2441FE'],
    ['#39C5FF', '#38C4F9'],
    ['#4EFDB6', '#53FEB9'],
    ['#1F45FF', '#27FDFD'],
    ['#FD3CC2', '#FF3EBC'],
  ],
  overlay: ['#253FFF', '#BBC2D2'],
};

const IridescentGenerator: React.FC<IridescentGeneratorProps> = ({
  seed,
  gradientCount = 20,
  size = 250,
  scaleVariation = 0.5,
}) => {
  const [initialSeed] = useState(() => {
    const now = new Date();
    const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const numericSeed = wordToNumber(seed);
    return dateSeed + numericSeed;
  });

  const random = useMemo(() => {
    return new SeededRandom(initialSeed);
  }, [initialSeed]);

  const extendedSize = useMemo(() => size * 2, [size]);
  const offsetX = useMemo(() => -size * 0.35, [size]);
  const offsetY = useMemo(() => -size * 0.5, [size]);

  const baseGradient = useMemo(() => {
    const baseGradientX = random.range(size * 0.2, size * 0.8);
    const baseGradientY = random.range(size * 0.1, size * 0.9);
    const baseGradientRotation = random.range(40, 60);
    const baseGradientScale = size * random.range(0.9, 1.3);
    return {
      baseGradientX,
      baseGradientY,
      baseGradientRotation,
      baseGradientScale,
    };
  }, [random, size]);

  const gradients = useMemo(() => {
    const generatedGradients = [];
    for (let i = 0; i < gradientCount; i++) {
      const colorIndex = i % COLORS.gradients.length;
      const colorPair = COLORS.gradients[colorIndex];

      const baseRotation = random.random() > 0.5
        ? random.range(130, 150)
        : random.range(40, 60);

      const scaleX =
        random.range(180, 250) * (1 + scaleVariation * random.range(-0.3, 0.3));
      const scaleY =
        random.range(40, 160) * (1 + scaleVariation * random.range(-0.3, 0.3));

      const translateXBase = random.range(-size * 0.5, size * 1.5);
      const translateYBase = random.range(-size * 0.5, size * 1.5);

      generatedGradients.push({
        id: `paint${i + 1}_radial_18_52`,
        colorPair,
        baseRotation,
        scaleX,
        scaleY,
        translateXBase,
        translateYBase,
      });
    }
    return generatedGradients;
  }, [gradientCount, random, scaleVariation, size]);

  const gradientElements = gradients.map(
    ({ id, colorPair, baseRotation, scaleX, scaleY, translateXBase, translateYBase }) => (
      <motion.radialGradient
        key={id}
        id={id}
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        animate={{
          gradientTransform: [
            `translate(${translateXBase} ${translateYBase}) rotate(${baseRotation}) scale(${scaleX} ${scaleY})`,
            `translate(${translateXBase + random.range(-25, 25)} ${translateYBase + random.range(-25, 25)}) rotate(${baseRotation + random.range(-50, 50)}) scale(${scaleX * random.range(0.95, 1.05)} ${scaleY * random.range(0.95, 1.05)})`,
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <stop stopColor={colorPair[0]} />
        <stop
          offset={random.range(0.7, 1)}
          stopColor={colorPair[1]}
          stopOpacity="0"
        />
      </motion.radialGradient>
    )
  );

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_18_52)">
        <g clipPath="url(#clip0_18_52)">
          <rect
            x={offsetX}
            y={offsetY}
            width={extendedSize}
            height={extendedSize}
            fill="url(#paint0_radial_18_52)"
          />
          {Array.from({ length: gradientCount }).map((_, i) => (
            <rect
              key={`rect-${i}`}
              x={offsetX}
              y={offsetY}
              width={extendedSize}
              height={extendedSize}
              fill={`url(#paint${i + 1}_radial_18_52)`}
              style={{ mixBlendMode: 'overlay' }}
            />
          ))}
          <rect
            x={offsetX}
            y={offsetY}
            width={extendedSize}
            height={extendedSize}
            fill={COLORS.overlay[0]}
            style={{ mixBlendMode: 'saturation' }}
          />
          <rect
            x={offsetX}
            y={offsetY}
            width={extendedSize}
            height={extendedSize}
            fill={COLORS.overlay[1]}
            fillOpacity="0.8"
            style={{ mixBlendMode: 'soft-light' }}
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_18_52"
          x="0.5"
          y="0"
          width={size + 75}
          height={size + 75}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            operator="erode"
            in="SourceAlpha"
            result="effect1_dropShadow_18_52"
          />
          <feOffset dy={size * 0.15} />
          <feGaussianBlur stdDeviation={size * 0.125} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_18_52"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_18_52"
            result="shape"
          />
        </filter>
        <radialGradient
          id="paint0_radial_18_52"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`translate(${baseGradient.baseGradientX} ${baseGradient.baseGradientY}) rotate(${baseGradient.baseGradientRotation}) scale(${baseGradient.baseGradientScale})`}
        >
          <stop stopColor={COLORS.base[0]} />
          <stop offset="1" stopColor={COLORS.base[1]} />
        </radialGradient>
        {gradientElements}
        <clipPath id="clip0_18_52">
          <rect x="0" width={size} height={size} fill="white" />
        </clipPath>
      </defs>
    </motion.svg>
  );
};

export default IridescentGenerator;
