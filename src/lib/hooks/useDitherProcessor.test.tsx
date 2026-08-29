import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDitherProcessor } from '@/lib/hooks/useDitherProcessor';

// Mock ditherClient
vi.mock('@/lib/image/ditherClient', () => ({
  applyPaletteDitherClient: vi.fn(async () => ({
    blob: new Blob(['test'], { type: 'image/png' }),
    width: 50,
    height: 60,
  })),
}));

import { applyPaletteDitherClient } from '@/lib/image/ditherClient';
const mockedApply = vi.mocked(applyPaletteDitherClient);

// Mock createImageBitmap and canvas
let mockImageData: ImageData;

beforeEach(() => {
  mockImageData = new ImageData(new Uint8ClampedArray(4 * 10 * 10), 10, 10);
  // @ts-ignore
  global.createImageBitmap = vi.fn(async () => ({
    width: 10,
    height: 10,
    close: vi.fn(),
  }));
  // Mock canvas getContext
  const origCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
    if (tagName === 'canvas') {
      const canvas = origCreateElement(tagName, options) as HTMLCanvasElement;
      // @ts-ignore
      canvas.getContext = vi.fn(() => ({
        drawImage: vi.fn(),
        getImageData: vi.fn(() => mockImageData),
        putImageData: vi.fn(),
      }));
      return canvas;
    }
    return origCreateElement(tagName, options);
  });
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  mockedApply.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeFile(name = 'test.png'): File {
  return new File(['data'], name, { type: 'image/png' });
}

describe('useDitherProcessor', () => {
  it('initial state is empty', () => {
    const { result } = renderHook(() => useDitherProcessor(null));
    expect(result.current.outputUrl).toBeNull();
    expect(result.current.outputSize).toBeNull();
    expect(result.current.sourceSize).toBeNull();
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('resets when sourceFile changes to null', async () => {
    const file = makeFile();
    const { result, rerender } = renderHook(({ f }) => useDitherProcessor(f), {
      initialProps: { f: file as File | null },
    });
    // Trigger process to set some state
    await act(async () => {
      await result.current.process({ maxColors: 16, scale: 1 });
    });
    expect(result.current.outputUrl).toBe('blob:mock-url');
    rerender({ f: null });
    expect(result.current.outputUrl).toBeNull();
    expect(result.current.sourceSize).toBeNull();
  });

  it('processes image and sets outputUrl and sizes', async () => {
    const file = makeFile();
    const { result } = renderHook(() => useDitherProcessor(file));
    await act(async () => {
      await result.current.process({ maxColors: 32, scale: 0.5 });
    });
    expect(mockedApply).toHaveBeenCalled();
    expect(result.current.outputUrl).toBe('blob:mock-url');
    expect(result.current.outputSize).toEqual({ width: 50, height: 60 });
    expect(result.current.sourceSize).toEqual({ width: 10, height: 10 });
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets isProcessing true during processing', async () => {
    const file = makeFile();
    let resolveApply: (v: unknown) => void;
    mockedApply.mockReturnValueOnce(
      new Promise((res) => {
        resolveApply = res as unknown as (v: unknown) => void;
      }) as ReturnType<typeof applyPaletteDitherClient>
    );
    const { result } = renderHook(() => useDitherProcessor(file));
    let processPromise: Promise<void>;
    act(() => {
      processPromise = result.current.process({ maxColors: 16, scale: 1 });
    });
    expect(result.current.isProcessing).toBe(true);
    await act(async () => {
      resolveApply!({ blob: new Blob(['x'], { type: 'image/png' }), width: 1, height: 1 });
      await processPromise!;
    });
    expect(result.current.isProcessing).toBe(false);
  });

  it('prevents overlapping processing via lock', async () => {
    const file = makeFile();
    let resolveFirst: (v: unknown) => void;
    mockedApply.mockReturnValueOnce(
      new Promise((res) => {
        resolveFirst = res as unknown as (v: unknown) => void;
      }) as ReturnType<typeof applyPaletteDitherClient>
    );
    const { result } = renderHook(() => useDitherProcessor(file));
    act(() => {
      result.current.process({ maxColors: 16, scale: 1 });
    });
    // Second call should be ignored due to lock
    await act(async () => {
      await result.current.process({ maxColors: 32, scale: 1 });
    });
    expect(mockedApply).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveFirst!({ blob: new Blob(['x'], { type: 'image/png' }), width: 1, height: 1 });
      // Need to wait for first to finish
      await new Promise((r) => setTimeout(r, 0));
    });
  });

  it('caches ImageData and does not re-decode on second process', async () => {
    const file = makeFile();
    const { result } = renderHook(() => useDitherProcessor(file));
    await act(async () => {
      await result.current.process({ maxColors: 16, scale: 1 });
    });
    const firstCallCount = mockedApply.mock.calls.length;
    expect(firstCallCount).toBe(1);
    const createBitmapCalls = (global.createImageBitmap as unknown as ReturnType<typeof vi.fn>).mock.calls.length;
    await act(async () => {
      await result.current.process({ maxColors: 32, scale: 1 });
    });
    // Should have called apply again but not createImageBitmap again (cached)
    expect(mockedApply).toHaveBeenCalledTimes(2);
    expect((global.createImageBitmap as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(createBitmapCalls);
  });

  it('handles error from dither client', async () => {
    mockedApply.mockRejectedValueOnce(new Error('oops'));
    const file = makeFile();
    const { result } = renderHook(() => useDitherProcessor(file));
    await act(async () => {
      await result.current.process({ maxColors: 16, scale: 1 });
    });
    expect(result.current.error).toBe('oops');
    expect(result.current.isProcessing).toBe(false);
  });

  it('handles non-Error thrown', async () => {
    mockedApply.mockRejectedValueOnce('string error');
    const file = makeFile();
    const { result } = renderHook(() => useDitherProcessor(file));
    await act(async () => {
      await result.current.process({ maxColors: 16, scale: 1 });
    });
    expect(result.current.error).toBe('Failed to process image.');
  });

  it('does nothing when sourceFile is null', async () => {
    const { result } = renderHook(() => useDitherProcessor(null));
    await act(async () => {
      await result.current.process({ maxColors: 16, scale: 1 });
    });
    expect(mockedApply).not.toHaveBeenCalled();
  });

  it('revokes previous outputUrl on new process', async () => {
    const file = makeFile();
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    const { result } = renderHook(() => useDitherProcessor(file));
    await act(async () => {
      await result.current.process({ maxColors: 16, scale: 1 });
    });
    const firstUrl = result.current.outputUrl;
    expect(firstUrl).toBe('blob:mock-url');
    // Mock new url
    vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:mock-url-2');
    await act(async () => {
      await result.current.process({ maxColors: 32, scale: 1 });
    });
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock-url');
    expect(result.current.outputUrl).toBe('blob:mock-url-2');
  });

  it('reset clears state and revokes urls', async () => {
    const file = makeFile();
    const { result } = renderHook(() => useDitherProcessor(file));
    await act(async () => {
      await result.current.process({ maxColors: 16, scale: 1 });
    });
    expect(result.current.outputUrl).not.toBeNull();
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    act(() => {
      result.current.reset();
    });
    expect(result.current.outputUrl).toBeNull();
    expect(result.current.outputSize).toBeNull();
    expect(result.current.sourceSize).toBeNull();
    expect(revokeSpy).toHaveBeenCalled();
  });
});
