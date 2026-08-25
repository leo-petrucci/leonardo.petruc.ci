import { createNoise4D, type NoiseFunction4D } from 'simplex-noise';

import type { Program } from '@/components/atoms/Ascii/AsciiAnimation';

/**
 * Parameterized ASCII animation programs.
 *
 * Every program is a pure factory: given live params it returns a Program the
 * engine can run. Params are read through an accessor each frame so control
 * panel tweaks apply instantly without restarting the animation. The seed is
 * the exception — it feeds a seeded PRNG at boot, so it requires a restart
 * (the page re-creates the program when the seed changes).
 */

export interface AnimParams {
  /** Seed for the noise permutation table and site placement. */
  seed: number;
  /** Frame rate hint for the engine (fps). */
  fps: number;
  /** Voronoi only: number of drifting sites. */
  sites: number;
  /** Animation speed; per-frame phase increment. */
  speed: number;
  /** Per-frame speed multiplier when settling (0 < decay < 1). */
  decay: number;
  /** Speed floor while settling. */
  minSpeed: number;
  /** When true the animation decays to stillness instead of looping forever. */
  settle: boolean;
  /** Spatial frequency / edge sharpness. */
  scale: number;
  /** Vertical squash so cells look square despite tall line boxes. */
  aspect: number;
  /** Character ramp, dark to light (index 0 = densest). */
  ramp: string;
  /** Ink color for lit cells. */
  color: string;
}

export type AnimParamsAccessor = () => AnimParams;

export const PROGRAM_NAMES = ['voronoi', 'flowfield', 'plasma'] as const;
export type ProgramName = (typeof PROGRAM_NAMES)[number];

/** Deterministic 32-bit PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const RAMP_PRESETS: Record<string, string> = {
  oxide: ' .,-~:;=',
  shade: ' .:-=+*#%@',
  blocks: ' \u2591\u2592\u2593\u2588',
  dots: ' \u00b7\u2022\u25cb\u25cf',
  minimal: ' .:*#',
};

/** Map a 0..1 value onto a ramp string; 1 collapses to blank like Oxide does. */
export function rampAt(
  ramp: string,
  v: number
): { char: string; maxed: boolean } {
  const i = Math.max(
    0,
    Math.min(ramp.length - 1, Math.floor(v * (ramp.length - 1)))
  );
  return { char: ramp[i], maxed: i === ramp.length - 1 };
}

/* ---------- voronoi: the Glasswing-style cellular field ---------- */

/**
 * Sites drift through 4D simplex space; each cell lights up by its distance
 * from the two nearest sites (Worley F2-F1), which paints Voronoi borders.
 * This is a faithful reconstruction of Oxide's glasswing program.
 */
export function makeVoronoiProgram(p: AnimParamsAccessor): Program {
  interface Site {
    ax: number;
    ay: number;
    bx: number;
    by: number;
  }
  return {
    get fps() {
      return p().fps;
    },
    boot(_ctx, state) {
      const P = p();
      const rng = mulberry32(P.seed);
      state.noise = createNoise4D(rng);
      state.t = 0;
      state.v = P.speed;
      state.sites = Array.from({ length: Math.max(1, P.sites) }, () => ({
        ax: rng() * 100,
        ay: rng() * 100,
        bx: rng() * 100 + 500,
        by: rng() * 100 + 500,
      })) as Site[];
      // Extra rng draw AFTER site placement: seed also shifts the phase, so
      // different seeds diverge immediately.
      state.t = rng() * 100;
    },
    pre(ctx, state) {
      const P = p();
      const noise = state.noise as NoiseFunction4D;
      const sites = state.sites as Site[];
      let t = (state.t as number) + (state.v as number);
      // Settle mode decays speed toward the floor each frame; otherwise the
      // speed is pinned so the motion loops indefinitely.
      const v = P.settle
        ? Math.max(P.minSpeed, (state.v as number) * P.decay)
        : P.speed;
      if (!P.settle && t > 1e6) t = 0;
      state.t = t;
      state.v = v;
      state.pts = sites.map((s) => ({
        x: (0.5 + 0.5 * noise(s.ax + t, s.ay, s.bx, s.by)) * ctx.cols,
        y:
          (0.5 + 0.5 * noise(s.bx + t, s.by, s.ax, s.ay)) *
          (ctx.rows / P.aspect),
      }));
    },
    main({ x, y }, _ctx, state) {
      const pts = state.pts as { x: number; y: number }[] | undefined;
      if (!pts || !pts.length) return ' ';
      const P = p();
      const px = x;
      const py = y / P.aspect;
      let f1 = Infinity;
      let f2 = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const dx = px - pts[i].x;
        const dy = pts[i].y - py;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < f1) {
          f2 = f1;
          f1 = d;
        } else if (d < f2) {
          f2 = d;
        }
      }
      const edge = (f2 - f1) * P.scale;
      const v = Math.min(1, edge / (40 * 0.15));
      const { char, maxed } = rampAt(P.ramp, v);
      if (maxed || char === ' ') return ' ';
      return { char, color: P.color };
    },
  };
}

/* ---------- flowfield: pure animated simplex noise ---------- */

/** A single 4D simplex field sampled over x/y plus time, mapped to the ramp. */
export function makeFlowFieldProgram(p: AnimParamsAccessor): Program {
  return {
    get fps() {
      return p().fps;
    },
    boot(_ctx, state) {
      const P = p();
      state.noise = createNoise4D(mulberry32(P.seed));
      state.t = mulberry32(P.seed)() * 100;
      state.v = P.speed * 2;
    },
    pre(_ctx, state) {
      const P = p();
      const cur = (state.v as number) ?? P.speed * 2;
      state.v = P.settle
        ? Math.max(P.minSpeed * 2, cur * P.decay)
        : P.speed * 2;
      state.t = (state.t as number) + (state.v as number);
    },
    main({ x, y }, ctx, state) {
      const P = p();
      const noise = state.noise as NoiseFunction4D;
      const t = state.t as number;
      const n = noise(
        x * P.scale * 0.04,
        (y * P.scale * 0.04) / P.aspect,
        ctx.frame * 0,
        t
      );
      const v = Math.max(0, Math.min(1, (n + 1) / 2));
      const { char } = rampAt(P.ramp, 1 - v);
      if (char === ' ') return ' ';
      return { char, color: P.color };
    },
  };
}

/* ---------- plasma: layered sine interference ---------- */

/** Classic interference pattern: crossed sine waves modulated by soft noise. */
export function makePlasmaProgram(p: AnimParamsAccessor): Program {
  return {
    get fps() {
      return p().fps;
    },
    boot(_ctx, state) {
      const P = p();
      state.noise = createNoise4D(mulberry32(P.seed));
      state.t = 0;
      state.v = P.speed * 60;
    },
    pre(_ctx, state) {
      const P = p();
      const cur = (state.v as number) ?? P.speed * 60;
      state.v = P.settle
        ? Math.max(P.minSpeed * 60, cur * P.decay)
        : P.speed * 60;
      state.t = (state.t as number) + (state.v as number);
    },
    main({ x, y }, ctx, state) {
      const P = p();
      const t = (state.t as number) / 60;
      const fx = x * 0.12 * P.scale * 0.3;
      const fy = (y * 0.24 * P.scale * 0.3) / P.aspect;
      const n =
        (state.noise as NoiseFunction4D)(fx * 0.5, fy * 0.5, t, 0) * 0.35;
      let v =
        Math.sin(fx + t) +
        Math.sin(fy - t * 0.7) +
        Math.sin((fx + fy) * 0.5 + t * 0.5) +
        n;
      v = (v + 3.35) / 6.7;
      const clamped = Math.max(0, Math.min(1, v));
      const { char } = rampAt(P.ramp, clamped);
      if (char === ' ') return ' ';
      return { char, color: P.color };
    },
  };
}

const FACTORIES: Record<
  ProgramName,
  (p: AnimParamsAccessor) => Program
> = {
  voronoi: makeVoronoiProgram,
  flowfield: makeFlowFieldProgram,
  plasma: makePlasmaProgram,
};

export function makeProgram(name: ProgramName, p: AnimParamsAccessor): Program {
  return FACTORIES[name](p);
}

export const DEFAULT_PARAMS: AnimParams = {
  seed: 1337,
  fps: 30,
  sites: 12,
  speed: 0.02,
  decay: 0.93,
  minSpeed: 0.0006,
  settle: true,
  scale: 3,
  aspect: 0.3,
  ramp: RAMP_PRESETS.blocks,
  color: '#7aa2f7',
};
