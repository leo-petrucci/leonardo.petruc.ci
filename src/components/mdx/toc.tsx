import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

/** A single heading entry shown in the table of contents. */
interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Props for {@link TOC}.
 *
 * Pass `headings` to control the entries explicitly, or omit it to have the
 * component auto-extract `h2`/`h3` headings from the surrounding `article`.
 */
export interface TocProps {
  /** Explicit heading list; overrides auto-extraction when provided. */
  headings?: TocHeading[];
  /** Deepest heading level to include (2 = only h2, 3 = h2 + h3). */
  depth?: 2 | 3;
  className?: string;
}

/**
 * Collects slugged h2/h3 elements inside the nearest `article` element.
 * Requires `rehype-slug` (or manual ids) so headings carry an `id`.
 */
function extractHeadings(depth: number): TocHeading[] {
  const article = document.querySelector('article');
  if (!article) return [];
  const selector = depth >= 3 ? 'h2, h3' : 'h2';
  return Array.from(article.querySelectorAll(selector))
    .filter((el) => el.id)
    .map((el) => ({
      id: el.id,
      text: el.textContent ?? '',
      level: Number(el.tagName.slice(1)),
    }));
}

/**
 * Auto-generated table of contents with smooth scrolling and active-section
 * highlighting via IntersectionObserver.
 *
 * Renders nothing until headings are available (client-side extraction), so
 * it is safe to drop `<TOC />` anywhere inside an article.
 */
export function TOC({ headings, depth = 3, className }: TocProps) {
  const [items, setItems] = useState<TocHeading[]>(headings ?? []);
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    setItems(headings ?? extractHeadings(depth));
  }, [headings, depth]);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '0px 0px -75% 0px' },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    // `not-prose` opts out of typography-plugin styles (list markers, link
    // underlines, paragraph margins) that would otherwise bleed in from the
    // surrounding `prose` article.
    <nav aria-label="Table of contents" className={cn('my-6 not-prose', className)}>
      <p className="font-departure text-ascii-sm uppercase tracking-widest text-muted-foreground">
        {'// contents'}
      </p>
      <ul className="mt-3 list-none space-y-1 border-l border-dashed border-border p-0 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'pl-8' : 'pl-4'}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(item.id)
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={cn(
                'group -ml-px flex list-none items-center gap-2 border-l-2 border-transparent py-0.5 no-underline transition-colors hover:text-accent',
                activeId === item.id
                  ? 'border-accent text-accent'
                  : 'text-muted-foreground',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'font-departure text-ascii-sm',
                  activeId === item.id ? 'visible' : 'invisible group-hover:visible',
                )}
              >
                {'>'}
              </span>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
