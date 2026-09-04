import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UploadCard } from '@/components/Ditherizer/UploadCard';

afterEach(() => cleanup());

function mockImageFile(name = 'test.png', type = 'image/png'): File {
  return new File(['data'], name, { type });
}

describe('UploadCard', () => {
  it('renders drop zone labels', () => {
    render(<UploadCard sourceFile={null} sourceSize={null} onFileSelected={vi.fn()} />);
    expect(screen.getByText('Drop an image here')).toBeTruthy();
    expect(screen.getByText('or click to browse')).toBeTruthy();
  });

  it('shows file name when sourceFile present', () => {
    const f = mockImageFile('hello.png');
    render(<UploadCard sourceFile={f} sourceSize={null} onFileSelected={vi.fn()} />);
    expect(screen.getByText('hello.png')).toBeTruthy();
  });

  it('shows original dimensions when sourceSize present', () => {
    const f = mockImageFile('pic.png');
    render(<UploadCard sourceFile={f} sourceSize={{ width: 800, height: 600 }} onFileSelected={vi.fn()} />);
    expect(screen.getByText('Original: 800 x 600px')).toBeTruthy();
  });

  it('does not show dimensions when sourceSize null', () => {
    const f = mockImageFile('pic.png');
    render(<UploadCard sourceFile={f} sourceSize={null} onFileSelected={vi.fn()} />);
    expect(screen.queryByText(/Original:/)).toBeNull();
  });

  it('calls onFileSelected when input changes', () => {
    const onSelected = vi.fn();
    render(<UploadCard sourceFile={null} sourceSize={null} onFileSelected={onSelected} />);
    const input = document.getElementById('dither-image-upload') as HTMLInputElement;
    const file = mockImageFile();
    // Simulate file selection
    Object.defineProperty(input, 'files', { value: [file], writable: false });
    fireEvent.change(input);
    expect(onSelected).toHaveBeenCalledWith(file);
  });

  it('handles drop of image file', () => {
    const onSelected = vi.fn();
    render(<UploadCard sourceFile={null} sourceSize={null} onFileSelected={onSelected} />);
    const label = screen.getByText('Drop an image here').closest('label') as HTMLElement;
    const file = mockImageFile('drop.png', 'image/png');
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    fireEvent.drop(label, { dataTransfer, preventDefault: vi.fn() });
    expect(onSelected).toHaveBeenCalledWith(file);
  });

  it('ignores drop of non-image', () => {
    const onSelected = vi.fn();
    render(<UploadCard sourceFile={null} sourceSize={null} onFileSelected={onSelected} />);
    const label = screen.getByText('Drop an image here').closest('label') as HTMLElement;
    const file = mockImageFile('a.txt', 'text/plain');
    const dataTransfer = { files: [file] } as unknown as DataTransfer;
    fireEvent.drop(label, { dataTransfer, preventDefault: vi.fn() });
    expect(onSelected).not.toHaveBeenCalled();
  });

  it('ignores drop with empty files', () => {
    const onSelected = vi.fn();
    render(<UploadCard sourceFile={null} sourceSize={null} onFileSelected={onSelected} />);
    const label = screen.getByText('Drop an image here').closest('label') as HTMLElement;
    const dataTransfer = { files: [] } as unknown as DataTransfer;
    fireEvent.drop(label, { dataTransfer, preventDefault: vi.fn() });
    expect(onSelected).not.toHaveBeenCalled();
  });

  it('prevents default on dragOver', () => {
    render(<UploadCard sourceFile={null} sourceSize={null} onFileSelected={vi.fn()} />);
    const label = screen.getByText('Drop an image here').closest('label') as HTMLElement;
    const ev = new Event('dragover', { bubbles: true, cancelable: true });
    let prevented = false;
    const origPrevent = ev.preventDefault.bind(ev);
    ev.preventDefault = () => {
      prevented = true;
      origPrevent();
    };
    fireEvent(label, ev);
    expect(prevented).toBe(true);
  });

  it('has hidden file input with accept image/*', () => {
    render(<UploadCard sourceFile={null} sourceSize={null} onFileSelected={vi.fn()} />);
    const input = document.getElementById('dither-image-upload') as HTMLInputElement;
    expect(input.accept).toBe('image/*');
    expect(input.type).toBe('file');
    expect(input.className).toContain('hidden');
  });
});
