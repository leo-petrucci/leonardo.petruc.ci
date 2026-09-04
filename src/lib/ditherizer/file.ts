export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function getFirstFile(files: FileList | File[] | null | undefined): File | null {
  if (!files || files.length === 0) return null;
  return files[0] ?? null;
}

export function getFirstImageFile(
  files: FileList | File[] | null | undefined
): File | null {
  const file = getFirstFile(files);
  if (!file) return null;
  return isImageFile(file) ? file : null;
}

export function shouldAcceptDroppedFile(file: File | null | undefined): boolean {
  if (!file) return false;
  return isImageFile(file);
}

export function createObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectUrl(url: string | null | undefined): void {
  if (url) URL.revokeObjectURL(url);
}

export function buildDownloadLink(
  url: string,
  filename = 'dithered.png'
): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  return link;
}

export function triggerDownload(url: string, filename = 'dithered.png'): void {
  const link = buildDownloadLink(url, filename);
  link.click();
}
