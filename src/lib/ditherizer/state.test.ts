import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DITHERIZER_STATE,
  getDefaultState,
  isNewFile,
  shouldResetOnNewFile,
} from '@/lib/ditherizer/state';

function makeFile(name: string, size = 1000, lastModified = 1000): File {
  return new File([new Array(size).fill('a').join('')], name, { type: 'image/png', lastModified });
}

describe('DEFAULT_DITHERIZER_STATE', () => {
  it('has correct defaults', () => {
    expect(DEFAULT_DITHERIZER_STATE).toEqual({
      maxColors: 256,
      scale: 1,
      ditherMode: 'ordered',
      colorReduction: 'perceptual',
      showProcessed: true,
    });
  });

  it('getDefaultState returns a copy', () => {
    const a = getDefaultState();
    const b = getDefaultState();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    a.maxColors = 10;
    expect(b.maxColors).toBe(256);
  });
});

describe('isNewFile', () => {
  it('true when prev is null and next exists', () => {
    expect(isNewFile(null, makeFile('a.png'))).toBe(true);
  });

  it('false when next is null', () => {
    expect(isNewFile(makeFile('a.png'), null)).toBe(false);
    expect(isNewFile(null, null)).toBe(false);
  });

  it('false when same file (same name, size, lastModified)', () => {
    const f1 = makeFile('a.png', 1000, 123);
    const f2 = makeFile('a.png', 1000, 123);
    expect(isNewFile(f1, f2)).toBe(false);
  });

  it('true when name differs', () => {
    expect(isNewFile(makeFile('a.png', 1000, 123), makeFile('b.png', 1000, 123))).toBe(true);
  });

  it('true when size differs', () => {
    expect(isNewFile(makeFile('a.png', 1000, 123), makeFile('a.png', 2000, 123))).toBe(true);
  });

  it('true when lastModified differs', () => {
    expect(isNewFile(makeFile('a.png', 1000, 1000), makeFile('a.png', 1000, 2000))).toBe(true);
  });

  it('true when both name and size differ', () => {
    expect(isNewFile(makeFile('a.png', 1000, 1000), makeFile('b.png', 2000, 2000))).toBe(true);
  });
});

describe('shouldResetOnNewFile', () => {
  it('aliases isNewFile', () => {
    const f1 = makeFile('a.png');
    const f2 = makeFile('b.png');
    expect(shouldResetOnNewFile(f1, f2)).toBe(isNewFile(f1, f2));
    expect(shouldResetOnNewFile(null, f1)).toBe(true);
    expect(shouldResetOnNewFile(f1, null)).toBe(false);
  });
});
