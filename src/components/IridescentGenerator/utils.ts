import { useMemo } from 'react';

// Seeded random number generator
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Simple seeded random function
  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Get random number between min and max
  range(min: number, max: number) {
    return min + this.random() * (max - min);
  }

  // Get random integer between min and max (inclusive)
  rangeInt(min: number, max: number) {
    return Math.floor(this.range(min, max + 1));
  }
}

// Predefined colors from the SVG
const COLORS = {
  base: ['#BAC3E5', '#878EAB'],
  gradients: [
    ['#FFDB34', '#24FFA4'], // yellow-green - important
    ['#FDEDB9', '#24FFA4'], 
    ['#C75FFF', '#EE80FF'], //
    ['#1E3FFF', '#1E3FFF'], // blue - kind of ugly?
    ['#36C3FF', '#36C4FF'],
    ['#4AFFB3', '#4AFFB3'],
    ['#20FFFB', '#1E3FFF'], // blue - kind of ugly?
    ['#FF39BA', '#FF39BA'],
  ],
  overlay: ['#253FFF', '#BBC2D2'],
};

export function generateSvgString(
  seed: number,
  gradientCount: number,
  size: number,
  scaleVariation: number,
  rotationVariation: number,
  positionVariation: number
): string {
  const random = new SeededRandom(seed);

  // Add the gradient overlays
  const extendedSize = size * 2;
  const offsetX = -size * 0.35;
  const offsetY = -size * 0.5;

  // Generate the SVG
  let svg = `<svg width="${size + 75}" height="${size + 75}" viewBox="0 0 ${
    size + 75
  } ${size + 75}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#filter0_d_18_52)">
  <g clipPath="url(#clip0_18_52)">
  <rect x="${offsetX}" y="${offsetY}" width="${extendedSize}" height="${extendedSize}" fill="url(#paint0_radial_18_52)"/>
  `;

  for (let i = 0; i < gradientCount; i++) {
    svg += `<rect x="${offsetX}" y="${offsetY}" width="${extendedSize}" height="${extendedSize}" fill="url(#paint${
      i + 1
    }_radial_18_52)" style="mix-blend-mode:overlay"/>\n`;
  }

  // Add the color overlay rectangles
  svg += `<rect x="${offsetX + 54}" y="${
    offsetY + 91
  }" width="${extendedSize}" height="${extendedSize}" fill="${
    COLORS.overlay[0]
  }" style="mix-blend-mode:saturation"/> 
  <rect x="${offsetX + 54}" y="${
    offsetY + 91
  }" width="${extendedSize}" height="${extendedSize}" fill="${
    COLORS.overlay[1]
  }" fillOpacity="0.8" style="mix-blend-mode:soft-light"/>
  </g>
  </g>
  <defs>
  <filter id="filter0_d_18_52" x="0.5" y="0" width="${size + 75}" height="${
    size + 75
  }" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
  <feMorphology operator="erode" in="SourceAlpha" result="effect1_dropShadow_18_52"/>
  <feOffset dy="${size * 0.15}"/>
  <feGaussianBlur stdDeviation="${size * 0.125}"/>
  <feComposite in2="hardAlpha" operator="out"/>
  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_18_52"/>
  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_18_52" result="shape"/>
  </filter>\n`;

  // Add the base gradient
  const random1 = new SeededRandom(seed);
  const baseGradientX = random1.range(size * 0.2, size * 0.8);
  const baseGradientY = random1.range(size * 0.1, size * 0.9);
  const baseGradientRotation = random1.range(40, 60);
  const baseGradientScale = size * random1.range(0.9, 1.3);

  svg += `<radialGradient id="paint0_radial_18_52" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${baseGradientX} ${baseGradientY}) rotate(${baseGradientRotation}) scale(${baseGradientScale})">
  <stop stop-color="${COLORS.base[0]}"/>
  <stop offset="1" stop-color="${COLORS.base[1]}"/>
  </radialGradient>\n`;

  // Add the overlay gradients
  const random2 = new SeededRandom(seed);
  for (let i = 0; i < gradientCount; i++) {
    const colorIndex = i % COLORS.gradients.length;
    const colorPair = COLORS.gradients[colorIndex];

    // Determine if we use the 40-50 or 140-150 rotation range
    const useHighRotation = random2.random() > 0.5;
    const rotation = useHighRotation
      ? random2.range(130, 150) + rotationVariation * random2.range(-10, 10)
      : random2.range(40, 60) + rotationVariation * random2.range(-10, 10);

    // Scale variation
    const scaleX =
      random2.range(190, 250) * (1 + scaleVariation * random2.range(-0.3, 0.3));
    const scaleY =
      random2.range(100, 160) * (1 + scaleVariation * random2.range(-0.3, 0.3));

    // Position variation - use the full canvas area plus some margin
    const centerX = random2.range(-size * 0.2, size * 1.2);
    const centerY = random2.range(-size * 0.2, size * 1.2);

    svg += `<radialGradient id="paint${
      i + 1
    }_radial_18_52" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${centerX} ${centerY}) rotate(${rotation}) scale(${scaleX} ${scaleY})">
  <stop stop-color="${colorPair[0]}"/>
  <stop offset="${random2.range(0.7, 1)}" stop-color="${
      colorPair[1]
    }" stop-opacity="0"/>
  </radialGradient>\n`;
  }

  // Add the clip path
  svg += `
  </defs>
  </svg>`;

  return svg;
}

export function encodeSvg(svg: string): string {
  const compactSvg = svg.replace(/\n/g, '').trim();
  console.log(compactSvg);
  return `data:image/svg+xml;utf8,${encodeURIComponent(compactSvg)}`;
}

export function wordToNumber(word: string): number {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    const charCode = word.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export const useGradientProps = (...props: Parameters<typeof generateSvgString>) =>
  useMemo(() => {
    const svg = generateSvgString(...props);
    const encoded = encodeSvg(svg)
    ;
    return {
      backgroundImage: `
      url("${encodeSvg(noise)}"),
      url("${encodeSvg(noise)}"),
      url("${encodeSvg(noise)}"),
      url("${encoded}"),
      url("${encoded}")
    `,
      backgroundSize: 'auto,auto,auto, cover, cover',
      backgroundBlendMode:
        'soft-light,soft-light,soft-light, hard-light, normal',
        boxShadow: 'inset 0 0 15px 2px hsl(223.06deg 100% 59.02% / 25%), 0px 10px 15px -3px hsl(178 100% 56% / 0.2)',
    };
  }, [...props]);

export const noise = `<svg id="noice" width="50" height="50" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise-filter">
        <feTurbulence type="fractalNoise" baseFrequency="1.34" numOctaves="4" stitchTiles="stitch"></feTurbulence>
        <feColorMatrix type="saturate" values="0"></feColorMatrix>
        <feComponentTransfer>
            <feFuncR type="linear" slope="0"></feFuncR>
            <feFuncG type="linear" slope="0"></feFuncG>
            <feFuncB type="linear" slope="0"></feFuncB>
            <feFuncA type="linear" slope="0.61"></feFuncA>
        </feComponentTransfer>
        <feComponentTransfer>
            <feFuncR type="linear" slope="1.29" intercept="-0.15"/>
            <feFuncG type="linear" slope="1.29" intercept="-0.15"/>
            <feFuncB type="linear" slope="1.29" intercept="-0.15"/>
        </feComponentTransfer>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise-filter)"></rect>
</svg>`;
