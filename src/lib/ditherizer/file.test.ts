import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  buildDownloadLink,
  getFirstFile,
  getFirstImageFile,
  isImageFile,
  shouldAcceptDroppedFile,
  triggerDownload,
  createObjectUrl,
  revokeObjectUrl,
} from '@/lib/ditherizer/file';

function mockFile(name: string, type: string): File {
  return new File(['content'], name, { type });
}

describe('isImageFile', () => {
  it('returns true for image/*', () => {
    expect(isImageFile(mockFile('a.png', 'image/png'))).toBe(true);
    expect(isImageFile(mockFile('b.jpg', 'image/jpeg'))).toBe(true);
    expect(isImageFile(mockFile('c.gif', 'image/gif'))).toBe(true);
    expect(isImageFile(mockFile('d.webp', 'image/webp'))).toBe(true);
    expect(isImageFile(mockFile('e.svg', 'image/svg+xml'))).toBe(true);
  });

  it('returns false for non-image', () => {
    expect(isImageFile(mockFile('a.txt', 'text/plain'))).toBe(false);
    expect(isImageFile(mockFile('b.pdf', 'application/pdf'))).toBe(false);
    expect(isImageFile(mockFile('c', ''))).toBe(false);
    expect(isImageFile(mockFile('d', 'video/mp4'))).toBe(false);
  });
});

describe('getFirstFile', () => {
  it('returns first file from FileList', () => {
    const f1 = mockFile('a.png', 'image/png');
    const f2 = mockFile('b.png', 'image/png');
    // Create a mock FileList
    const list = { 0: f1, 1: f2, length: 2, item: (i: number) => (i === 0 ? f1 : f2) } as unknown as FileList;
    expect(getFirstFile(list)).toBe(f1);
  });

  it('returns first from array', () => {
    const f1 = mockFile('a.png', 'image/png');
    const f2 = mockFile('b.png', 'image/png');
    expect(getFirstFile([f1, f2])).toBe(f1);
  });

  it('returns null for empty', () => {
    expect(getFirstFile([])).toBeNull();
    expect(getFirstFile(null)).toBeNull();
    expect(getFirstFile(undefined)).toBeNull();
    const emptyList = { length: 0, item: () => null } as unknown as FileList;
    expect(getFirstFile(emptyList)).toBeNull();
  });
});

describe('getFirstImageFile', () => {
  it('returns file if image', () => {
    const f = mockFile('a.png', 'image/png');
    expect(getFirstImageFile([f])).toBe(f);
  });

  it('returns null if first file is not image', () => {
    const f = mockFile('a.txt', 'text/plain');
    expect(getFirstImageFile([f])).toBeNull();
  });

  it('returns null for empty or non-image list', () => {
    expect(getFirstImageFile([])).toBeNull();
    expect(getFirstImageFile(null)).toBeNull();
  });

  it('only checks first file, not second', () => {
    const txt = mockFile('a.txt', 'text/plain');
    const png = mockFile('b.png', 'image/png');
    // first is txt, should return null even though second is image
    expect(getFirstImageFile([txt, png])).toBeNull();
  });
});

describe('shouldAcceptDroppedFile', () => {
  it('true for image file', () => {
    expect(shouldAcceptDroppedFile(mockFile('a.png', 'image/png'))).toBe(true);
  });

  it('false for null/undefined', () => {
    expect(shouldAcceptDroppedFile(null)).toBe(false);
    expect(shouldAcceptDroppedFile(undefined)).toBe(false);
  });

  it('false for non-image', () => {
    expect(shouldAcceptDroppedFile(mockFile('a.txt', 'text/plain'))).toBe(false);
  });
});

describe('createObjectUrl / revokeObjectUrl', () => {
  let origCreate: typeof URL.createObjectURL;
  let origRevoke: typeof URL.revokeObjectURL;

  beforeEach(() => {
    origCreate = URL.createObjectURL;
    origRevoke = URL.revokeObjectURL;
  });

  afterEach(() => {
    URL.createObjectURL = origCreate;
    URL.revokeObjectURL = origRevoke;
  });

  it('createObjectUrl delegates to URL.createObjectURL', () => {
    const spy = vi.fn(() => 'blob:test');
    // @ts-ignore
    URL.createObjectURL = spy;
    const f = mockFile('a.png', 'image/png');
    expect(createObjectUrl(f)).toBe('blob:test');
    expect(spy).toHaveBeenCalledWith(f);
  });

  it('revokeObjectUrl delegates when url present', () => {
    const spy = vi.fn();
    // @ts-ignore
    URL.revokeObjectURL = spy;
    revokeObjectUrl('blob:test');
    expect(spy).toHaveBeenCalledWith('blob:test');
  });

  it('revokeObjectUrl does nothing for null/undefined', () => {
    const spy = vi.fn();
    // @ts-ignore
    URL.revokeObjectURL = spy;
    revokeObjectUrl(null);
    revokeObjectUrl(undefined);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('buildDownloadLink', () => {
  it('creates anchor with href and download', () => {
    const link = buildDownloadLink('blob:test', 'my.png');
    expect(link.tagName).toBe('A');
    expect(link.href).toContain('blob:test');
    expect(link.download).toBe('my.png');
  });

  it('defaults filename to dithered.png', () => {
    const link = buildDownloadLink('blob:test');
    expect(link.download).toBe('dithered.png');
  });
});

describe('triggerDownload', () => {
  it('clicks the link', () => {
    const clickSpy = vi.fn();
    const origCreate = document.createElement;
    // @ts-ignore mock
    document.createElement = vi.fn(() => ({
      href: '',
      download: '',
      click: clickSpy,
    })) as unknown as typeof document.createElement;

    triggerDownload('blob:test', 'out.png');
    expect(clickSpy).toHaveBeenCalled();

    document.createElement = origCreate;
  });
});
