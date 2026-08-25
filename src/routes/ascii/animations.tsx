import { useMemo, useRef, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import { AsciiViz } from '@/components/atoms/Ascii/AsciiViz';
import {
  AsciiAnimation,
  type Program,
} from '@/components/atoms/Ascii/AsciiAnimation';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  CenteredGrid,
  CenteredGridItem,
} from '@/components/layout/CenteredGrid';
import {
  DEFAULT_PARAMS,
  PROGRAM_NAMES,
  RAMP_PRESETS,
  TYPE_PRESETS,
  makeProgram,
  type AnimParams,
  type ProgramName,
} from '@/lib/animations/programs';

export const Route = createFileRoute('/ascii/animations')({
  component: RouteComponent,
});

const COLORS = [
  '#e78a53',
  '#9a6c00',
  '#7aa2f7',
  '#9ece6a',
  '#bb9af7',
  '#f7768e',
];

const CANVAS_ROWS = 24;

const btn =
  'font-[inherit] text-[13px] leading-[20px] text-inherit bg-transparent border border-solid border-border px-2 h-6 cursor-pointer transition-colors';
const btnOn = 'border-accent text-accent bg-accent/10';

function Ctl({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <div className="flex justify-between items-baseline">
        <span className="text-ascii-sm uppercase tracking-wide">{label}</span>
        <span className="text-ascii-sm text-muted-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}

function RouteComponent() {
  const [name, setName] = useState<ProgramName>('voronoi');
  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [density, setDensity] = useState(12);
  const [params, setParams] = useState<AnimParams>(DEFAULT_PARAMS);

  // Programs read live params through this accessor every frame, so slider
  // drags apply instantly without recreating (and restarting) the program.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  // The seed is read once at boot, so changing it re-creates the program;
  // everything else is live through the accessor.
  const program: Program = useMemo(
    () => makeProgram(name, () => paramsRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, params.seed, restartKey]
  );

  const patch = (p: Partial<AnimParams>) =>
    setParams((prev) => ({ ...prev, ...p }));

  const randomizeSeed = () =>
    patch({ seed: Math.floor(Math.random() * 0xffffffff) });

  const selectType = (n: ProgramName) => {
    if (n === name) return;
    setName(n);
    const d = TYPE_PRESETS[n];
    patch({ scale: d.scale, aspect: d.aspect, speed: d.speed });
    setDensity(d.density);
  };

  const canvasStyle = {
    fontSize: `${density}px`,
    lineHeight: 1.2,
    color: 'var(--muted-foreground)',
  };

  return (
    <CenteredGrid variant="wide">
      <CenteredGridItem asChild>
        <div className="flex flex-col gap-4">
          <AsciiBox
            frameColor="var(--border)"
            labelColor="var(--accent)"
            reveal
            fill
          >
            <h1>ASCII_ANIMATIONS</h1>
            <AsciiBox.Rule />
            <p>
              A control panel for character-cell animations — Voronoi fields,
              flow noise, plasma and a raymarched 3D scene, driven by seeded
              simplex noise. Same trick as the Oxide blog headers: a tiny engine
              measures one cell of the host font and diff-renders a char buffer
              each frame.
            </p>
            <p className="text-ascii-sm">
              <Link to="/ascii" className="underline">
                &lt; back to /ascii
              </Link>
            </p>
          </AsciiBox>

          <AsciiBox
            label={`canvas — ${name}`}
            footer={`${name} · seed ${params.seed} · ${params.fps} fps · ${
              paused ? 'paused' : 'running'
            }`}
            fill
            frameColor="var(--border)"
            labelColor="var(--accent)"
          >
            <div
              className="w-full overflow-hidden"
              data-version="v2"
              style={{ height: Math.round(density * 1.2 * CANVAS_ROWS) }}
            >
              <AsciiAnimation
                program={program}
                paused={paused}
                alt={`${name} ascii animation`}
                className="w-full h-full"
                canvasClassName="w-full h-full"
                canvasStyle={canvasStyle}
              />
            </div>
          </AsciiBox>

          <AsciiBox
            label="controls"
            padY={1}
            fill
            frameColor="var(--border)"
            labelColor="var(--accent)"
          >
            <div className="flex flex-wrap gap-2 items-center">
              {PROGRAM_NAMES.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${btn} ${name === n ? btnOn : ''}`}
                  onClick={() => selectType(n)}
                >
                  {n === name ? '\u25cf' : '\u25cb'} {n}
                </button>
              ))}
              <span className="grow" />
              <button
                type="button"
                className={btn}
                onClick={() => setPaused((v) => !v)}
              >
                {paused ? '[ play ]' : '[ pause ]'}
              </button>
              <button
                type="button"
                className={btn}
                onClick={() => setRestartKey((k) => k + 1)}
              >
                [ restart ]
              </button>
            </div>

            <AsciiBox.Rule />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <Ctl label="seed" value={String(params.seed)}>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    value={params.seed}
                    onChange={(e) =>
                      patch({ seed: Number(e.target.value) >>> 0 || 0 })
                    }
                    className="h-6 text-[13px]"
                  />
                  <button type="button" className={btn} onClick={randomizeSeed}>
                    rnd
                  </button>
                </div>
              </Ctl>

              <Ctl label="fps" value={String(params.fps)}>
                <Slider
                  min={1}
                  max={60}
                  step={1}
                  value={[params.fps]}
                  onValueChange={([v]) => patch({ fps: v })}
                />
              </Ctl>

              <Ctl label="cell size (px)" value={String(density)}>
                <Slider
                  min={8}
                  max={22}
                  step={1}
                  value={[density]}
                  onValueChange={([v]) => setDensity(v)}
                />
              </Ctl>

              {name === 'voronoi' && (
                <Ctl label="sites" value={String(params.sites)}>
                  <Slider
                    min={1}
                    max={40}
                    step={1}
                    value={[params.sites]}
                    onValueChange={([v]) => patch({ sites: v })}
                  />
                </Ctl>
              )}

              <Ctl label="scale" value={params.scale.toFixed(1)}>
                <Slider
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={[params.scale]}
                  onValueChange={([v]) => patch({ scale: v })}
                />
              </Ctl>

              <Ctl label="speed" value={params.speed.toFixed(4)}>
                <Slider
                  min={0.001}
                  max={0.08}
                  step={0.001}
                  value={[params.speed]}
                  onValueChange={([v]) => patch({ speed: v })}
                />
              </Ctl>

              <Ctl label="decay" value={params.decay.toFixed(2)}>
                <Slider
                  min={0.5}
                  max={0.995}
                  step={0.005}
                  value={[params.decay]}
                  onValueChange={([v]) => patch({ decay: v })}
                />
              </Ctl>

              <Ctl label="aspect squash" value={params.aspect.toFixed(2)}>
                <Slider
                  min={0.15}
                  max={1}
                  step={0.05}
                  value={[params.aspect]}
                  onValueChange={([v]) => patch({ aspect: v })}
                />
              </Ctl>

              <Ctl
                label="settle to stillness"
                value={params.settle ? 'on' : 'off'}
              >
                <button
                  type="button"
                  className={`${btn} ${params.settle ? btnOn : ''}`}
                  onClick={() => patch({ settle: !params.settle })}
                >
                  {params.settle ? '\u25cf settling' : '\u25cb looping'}
                </button>
              </Ctl>
            </div>

            <AsciiBox.Rule />

            <div className="flex flex-wrap gap-x-8 gap-y-4 items-start">
              <div className="flex flex-col gap-1">
                <span className="text-ascii-sm uppercase tracking-wide">
                  ramp
                </span>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(RAMP_PRESETS).map(([label, ramp]) => (
                    <button
                      key={label}
                      type="button"
                      className={`${btn} ${
                        params.ramp === ramp ? btnOn : ''
                      } font-mono`}
                      onClick={() => patch({ ramp })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-ascii-sm uppercase tracking-wide">
                  ink
                </span>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={c}
                      className={`size-6 border ${
                        params.color === c ? 'border-accent' : 'border-border'
                      }`}
                      style={{ background: c }}
                      onClick={() => patch({ color: c })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </AsciiBox>

          <AsciiBox
            label="usage"
            footer="AsciiViz — one line, seeded, per-type presets"
            padY={1}
            fill
            frameColor="var(--border)"
            labelColor="var(--accent)"
          >
            <p className="m-0">
              Drop one anywhere. Every setting is optional; the type picks the
              defaults and the seed makes it reproducible.
            </p>
            <pre className="text-ascii-sm m-0 overflow-x-auto">
              {`import { AsciiViz } from '@/components/atoms/Ascii/AsciiViz';

<AsciiViz type='raymarch' seed={42} />
<AsciiViz type='warp' color='#9ece6a' density={10} rows={16} />`}
            </pre>
            <AsciiBox.Rule />
            <div className="flex flex-col gap-2">
              <div>
                <div className="text-ascii-sm uppercase tracking-wide text-muted-foreground mb-1">
                  {`<AsciiViz type='raymarch' seed={42} />`}
                </div>
                <AsciiViz type="raymarch" seed={42} />
              </div>
              <div>
                <div className="text-ascii-sm uppercase tracking-wide text-muted-foreground mb-1">
                  {`<AsciiViz type='warp' color='#9ece6a' density={10} rows={16} />`}
                </div>
                <AsciiViz type="warp" color="#9ece6a" density={10} rows={16} />
              </div>
            </div>
          </AsciiBox>
        </div>
      </CenteredGridItem>
    </CenteredGrid>
  );
}
