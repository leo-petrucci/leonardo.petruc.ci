import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';

import {
  AsciiAnimation,
  type Program,
} from '@/components/atoms/Ascii/AsciiAnimation';
import {
  DEFAULT_PARAMS,
  TYPE_PRESETS,
  makeProgram,
  type AnimParams,
  type ProgramName,
} from '@/lib/animations/programs';

/**
 * AsciiViz — drop-in wrapper for the animation programs.
 *
 * Renders a seeded animation with sane per-type defaults; every setting is an
 * optional override:
 *
 *   <AsciiViz type='raymarch' seed={42} />
 *   <AsciiViz type='warp' color='#9ece6a' density={10} rows={16} />
 */

export interface AsciiVizProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Which program to run. Default 'voronoi'. */
  type?: ProgramName;
  /** Seed for the noise field. Same seed + type = same animation. */
  seed?: number;
  /** Frame rate cap. Default 30. */
  fps?: number;
  /** Animation speed (phase increment per frame). Default: type preset. */
  speed?: number;
  /** Spatial frequency / object size. Default: type preset. */
  scale?: number;
  /** Vertical squash. Default: type preset. */
  aspect?: number;
  /** Voronoi site count. Default 12. */
  sites?: number;
  /** Decay the animation to stillness. Default true. */
  settle?: boolean;
  /** Settle decay multiplier. Default 0.93. */
  decay?: number;
  /** Character ramp, dark to light. Default: Oxide ramp. */
  ramp?: string;
  /** Ink color. Default: site accent blue. */
  color?: string;
  /** Cell size in px. Default: type preset (12). */
  density?: number;
  /** Visible row count; width fills the container. Default 24. */
  rows?: number;
  /** Start paused. */
  paused?: boolean;
  /** Alt text for the aria label. */
  alt?: string;
  className?: string;
  canvasClassName?: string;
  canvasStyle?: CSSProperties;
}

export function AsciiViz({
  type = 'voronoi',
  seed = DEFAULT_PARAMS.seed,
  fps,
  speed,
  scale,
  aspect,
  sites,
  settle,
  decay,
  ramp,
  color,
  density,
  rows = 24,
  paused,
  alt,
  className,
  canvasClassName,
  canvasStyle,
  ...rest
}: AsciiVizProps) {
  const preset = TYPE_PRESETS[type];

  // Merge baseline → type preset → explicit props. Only props actually passed
  // override the preset, so `<AsciiViz type='warp' />` looks like warp should.
  const params: AnimParams = useMemo(
    () => ({
      ...DEFAULT_PARAMS,
      scale: preset.scale,
      aspect: preset.aspect,
      speed: preset.speed,
      ...(fps !== undefined && { fps }),
      ...(speed !== undefined && { speed }),
      ...(scale !== undefined && { scale }),
      ...(aspect !== undefined && { aspect }),
      ...(sites !== undefined && { sites }),
      ...(settle !== undefined && { settle }),
      ...(decay !== undefined && { decay }),
      ...(ramp !== undefined && { ramp }),
      ...(color !== undefined && { color }),
      seed,
    }),
    [
      preset,
      fps,
      speed,
      scale,
      aspect,
      sites,
      settle,
      decay,
      ramp,
      color,
      seed,
    ]
  );

  // Live accessor: prop tweaks apply on the next frame without a restart.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // Only type + seed need a re-boot.
  const program: Program = useMemo(
    () => makeProgram(type, () => paramsRef.current),
    [type, seed]
  );

  const cell = density ?? preset.density;

  return (
    <div
      className={'w-full overflow-hidden ' + (className ?? '')}
      style={{ height: Math.round(cell * 1.2 * rows) }}
      {...rest}
    >
      <AsciiAnimation
        program={program}
        paused={paused}
        alt={alt ?? `${type} ascii animation`}
        className='w-full h-full'
        canvasClassName={canvasClassName ?? 'w-full h-full'}
        canvasStyle={{
          fontSize: `${cell}px`,
          lineHeight: 1.2,
          color: 'var(--muted-foreground)',
          ...canvasStyle,
        }}
      />
    </div>
  );
}
