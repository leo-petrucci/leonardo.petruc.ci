import { vi } from 'vitest';

// Global ResizeObserver mock for Radix UI and InfiniteCanvas
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof global.ResizeObserver === 'undefined') {
  // @ts-ignore
  global.ResizeObserver = MockResizeObserver;
  // @ts-ignore
  window.ResizeObserver = MockResizeObserver;
}

// Mock Pointer capture for jsdom
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}

// Polyfill ImageData for jsdom (not available in older jsdom)
if (typeof global.ImageData === 'undefined') {
  // @ts-ignore
  global.ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace: string = 'srgb';
    constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height as number;
      } else {
        this.width = dataOrWidth as number;
        this.height = widthOrHeight as number;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      }
    }
  };
  // @ts-ignore
  window.ImageData = global.ImageData;
}

// Mock createImageBitmap for useDitherProcessor tests if needed
if (typeof global.createImageBitmap === 'undefined') {
  // @ts-ignore
  global.createImageBitmap = vi.fn(async () => ({
    width: 10,
    height: 10,
    close: () => {},
  }));
}

// Mock OffscreenCanvas for ditherClient
if (typeof global.OffscreenCanvas === 'undefined') {
  // @ts-ignore
  global.OffscreenCanvas = class {
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
    getContext() {
      return null;
    }
    convertToBlob() {
      return Promise.resolve(new Blob());
    }
  };
}
