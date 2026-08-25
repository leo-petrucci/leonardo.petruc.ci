import { describe, expect, it } from 'vitest';

import type { FrameCtx, Program } from '@/components/atoms/Ascii/AsciiAnimation';
import {
  DEFAULT_PARAMS,
  PROGRAM_NAMES,
  RAMP_PRESETS,
  makeProgram,
  mulberry32,
  rampAt,
  type AnimParams,
} from '@/lib/animations/programs';

/* ---------- helpers ---------- */

function makeParams(overrides: Partial<AnimParams> = {}): AnimParams {
  return { ...DEFAULT_PARAMS, ...overrides };
}

function makeCtx(cols = 40, rows = 10, frame = 1): FrameCtx {
  return {
    cols,
    rows,
    frame,
    time: frame * 33,
    pointer: { x: -1, y: -1, pressed: false },
  };
}

/** Drive a program manually: boot, then `frames` pre+main passes. */
function runFrames(
  program: Program,
  params: AnimParams,
  frames = 5,
  cols = 40,
  rows = 10
): string[] {
  const state: Record<string, unknown> = {};
  program.boot?.(makeCtx(cols, rows, 0), state);
  const out: string[] = [];
  for (let f = 1; f <= frames; f++) {
    program.pre?.(makeCtx(cols, rows, f), state);
    let line = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const r = program.main!({ x, y, index: y * cols + x }, makeCtx(cols, rows, f), state);
        line += typeof r === 'string' ? r || ' ' : r.char || ' ';
      }
    }
    out.push(line);
  }
  return out;
}

function runFull(
  name: (typeof PROGRAM_NAMES)[number],
  params: AnimParams,
  frames = 5,
  cols = 40,
  rows = 10
) {
  const program = makeProgram(name, () => params);
  return { program, frames: runFrames(program, params, frames, cols, rows) };
}

/* ---------- mulberry32 ---------- */

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it('returns values in [0, 1)', () => {
    const rng = mulberry32(0xffffffff);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('handles seed 0 and huge seeds without collapsing', () => {
    const z = mulberry32(0);
    const vals = Array.from({ length: 20 }, () => z());
    expect(new Set(vals).size).toBeGreaterThan(1);
    const h = mulberry32(0xffffffff);
    expect(h()).not.toBeNaN();
  });
});

/* ---------- rampAt ---------- */

describe('rampAt', () => {
  const ramp = ' .:-=+*#%@';

  it('maps 0 to the first char', () => {
    expect(rampAt(ramp, 0)).toEqual({ char: ' ', maxed: false });
  });

  it('maps 1 to the last char and flags maxed', () => {
    expect(rampAt(ramp, 1)).toEqual({ char: '@', maxed: true });
  });

  it('maps 0.5 to the middle char', () => {
    expect(rampAt(ramp, 0.5).char).toBe('='); // floor(0.5 * 9) = index 4
  });

  it('clamps out-of-range values', () => {
    expect(rampAt(ramp, -5).char).toBe(' ');
    expect(rampAt(ramp, 99).char).toBe('@');
  });

  it('never returns an undefined char', () => {
    for (let i = 0; i <= 20; i++) {
      expect(rampAt(ramp, i / 20).char).toBeDefined();
    }
  });
});

/* ---------- registry ---------- */

describe('makeProgram', () => {
  it.each(PROGRAM_NAMES)('builds a full program for %s', (name) => {
    const program = makeProgram(name, () => makeParams());
    expect(typeof program.boot).toBe('function');
    expect(typeof program.pre).toBe('function');
    expect(typeof program.main).toBe('function');
    expect(program.fps).toBe(DEFAULT_PARAMS.fps);
  });

  it('reflects live fps changes through the accessor', () => {
    const params = makeParams();
    const program = makeProgram('voronoi', () => params);
    expect(program.fps).toBe(30);
    params.fps = 60;
    expect(program.fps).toBe(60);
  });

  it('produces output for every program', () => {
    for (const name of PROGRAM_NAMES) {
      const { frames } = runFull(name, makeParams(), 3);
      expect(frames).toHaveLength(3);
      expect(frames[0]).toMatch(/[^\s]/); // at least some lit cells
    }
  });
});

/* ---------- shared program properties ---------- */

describe.each(PROGRAM_NAMES)('%s program', (name) => {
  it('is deterministic for the same seed', () => {
    const a = runFull(name, makeParams({ seed: 1234 }), 5).frames;
    const b = runFull(name, makeParams({ seed: 1234 }), 5).frames;
    expect(a).toEqual(b);
  });

  it('differs between seeds', () => {
    const a = runFull(name, makeParams({ seed: 1234 }), 5).frames;
    const b = runFull(name, makeParams({ seed: 987654 }), 5).frames;
    expect(a).not.toEqual(b);
  });

  it('only emits chars from the configured ramp (or space)', () => {
    const ramp = RAMP_PRESETS.minimal;
    const { frames } = runFull(name, makeParams({ ramp }), 3);
    for (const frame of frames) {
      for (const ch of frame) {
        expect(ramp.includes(ch) || ch === ' ').toBe(true);
      }
    }
  });

  it('changes output when aspect squash changes', () => {
    const a = runFull(name, makeParams({ aspect: 0.3 }), 3).frames;
    const b = runFull(name, makeParams({ aspect: 1 }), 3).frames;
    expect(a).not.toEqual(b);
  });

  it('changes output when scale changes', () => {
    const a = runFull(name, makeParams({ scale: 1 }), 3).frames;
    const b = runFull(name, makeParams({ scale: 8 }), 3).frames;
    expect(a).not.toEqual(b);
  });

  it('changes output when the ramp changes', () => {
    const a = runFull(name, makeParams({ ramp: RAMP_PRESETS.oxide }), 3).frames;
    const b = runFull(name, makeParams({ ramp: RAMP_PRESETS.blocks }), 3).frames;
    expect(a).not.toEqual(b);
  });
});

/* ---------- voronoi specifics ---------- */

describe('voronoi program', () => {
  it('boots the requested number of sites', () => {
    const params = makeParams({ sites: 7 });
    const program = makeProgram('voronoi', () => params);
    const state: Record<string, unknown> = {};
    program.boot!(makeCtx(), state);
    expect((state.sites as unknown[]).length).toBe(7);
  });

  it('clamps sites to at least 1', () => {
    const params = makeParams({ sites: 0 });
    const program = makeProgram('voronoi', () => params);
    const state: Record<string, unknown> = {};
    program.boot!(makeCtx(), state);
    expect((state.sites as unknown[]).length).toBe(1);
  });

  it('decays speed to the floor while settling', () => {
    const params = makeParams({ settle: true, speed: 0.02, decay: 0.93, minSpeed: 0.0006 });
    const program = makeProgram('voronoi', () => params);
    const state: Record<string, unknown> = {};
    program.boot!(makeCtx(), state);
    for (let i = 0; i < 300; i++) program.pre!(makeCtx(40, 10, i + 1), state);
    expect(state.v).toBeCloseTo(0.0006, 6);
  });

  it('pins speed when settle is off', () => {
    const params = makeParams({ settle: false, speed: 0.02 });
    const program = makeProgram('voronoi', () => params);
    const state: Record<string, unknown> = {};
    program.boot!(makeCtx(), state);
    for (let i = 0; i < 50; i++) program.pre!(makeCtx(40, 10, i + 1), state);
    expect(state.v).toBe(0.02);
  });

  it('hides the max ramp char and colors lit cells', () => {
    const params = makeParams({ ramp: RAMP_PRESETS.blocks, color: '#ff0000', scale: 3 });
    const program = makeProgram('voronoi', () => params);
    const state: Record<string, unknown> = {};
    program.boot!(makeCtx(60, 20, 0), state);
    program.pre!(makeCtx(60, 20, 1), state);
    const seen = new Set<string>();
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 60; x++) {
        const r = program.main!({ x, y, index: 0 }, makeCtx(60, 20, 1), state);
        if (typeof r === 'string') {
          seen.add(r || ' ');
        } else {
          expect(r.color).toBe('#ff0000');
          seen.add(r.char);
        }
      }
    }
    expect(seen.has('\u2588')).toBe(false); // max char always hidden
    expect(seen.size).toBeGreaterThan(1); // more than just blank
  });

  it('changes the field when the site count changes', () => {
    const a = runFull('voronoi', makeParams({ sites: 3 }), 3).frames;
    const b = runFull('voronoi', makeParams({ sites: 30 }), 3).frames;
    expect(a).not.toEqual(b);
  });
});

/* ---------- flowfield specifics ---------- */

describe('flowfield program', () => {
  it('advances phase every frame', () => {
    const params = makeParams({ settle: false });
    const program = makeProgram('flowfield', () => params);
    const state: Record<string, unknown> = {};
    program.boot!(makeCtx(), state);
    const t0 = state.t as number;
    program.pre!(makeCtx(40, 10, 1), state);
    expect(state.t).toBeGreaterThan(t0);
  });

  it('emits colored chars, never bare strings', () => {
    const params = makeParams({ color: '#123456' });
    const program = makeProgram('flowfield', () => params);
    const state: Record<string, unknown> = {};
    program.boot!(makeCtx(), state);
    program.pre!(makeCtx(), state);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 40; x++) {
        const r = program.main!({ x, y, index: 0 }, makeCtx(), state);
        if (typeof r !== 'string') expect(r.color).toBe('#123456');
      }
    }
  });
});

/* ---------- plasma specifics ---------- */

describe('plasma program', () => {
  it('animates over time', () => {
    const params = makeParams({ settle: false });
    const { frames } = runFull('plasma', params, 10);
    expect(frames[0]).not.toEqual(frames[9]);
  });

  it('decays to stillness while settling', () => {
    const params = makeParams({ settle: true });
    const program = makeProgram('plasma', () => params);
    const state: Record<string, unknown> = {};
    program.boot!(makeCtx(), state);
    for (let i = 0; i < 300; i++) program.pre!(makeCtx(40, 10, i + 1), state);
    expect(state.v).toBeCloseTo(params.minSpeed * 60, 6);
  });
});
