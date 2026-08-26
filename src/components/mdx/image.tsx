import { cn } from '@/lib/utils';

/**
 * Props for {@link Image}: standard `img` attributes plus an optional caption.
 * `alt` is expected on every image; a dev-only warning fires without it.
 */
export interface MdxImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Caption rendered below the image inside a `figcaption`. */
  caption?: string;
}

/**
 * Responsive, lazy-loaded figure for MDX content with optional caption.
 *
 * @example
 * <Image src="/img/shot.png" alt="Dashboard" caption="After login" />
 */
export function Image({ caption, className, alt, ...props }: MdxImageProps) {
  if (!alt && import.meta.env.DEV) {
    console.warn('MDX <Image> is missing required `alt` text.');
  }
  return (
    <figure className={cn('my-6 not-prose', className)}>
      <img
        loading="lazy"
        decoding="async"
        alt={alt}
        className="mx-auto max-w-full border border-dashed border-[var(--border)]"
        {...props}
      />
      {caption ? (
        <figcaption className="mt-2 text-center font-departure text-ascii-sm uppercase tracking-widest text-muted-foreground">
          {'// '}
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
