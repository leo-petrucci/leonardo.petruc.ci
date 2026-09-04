import { marked } from 'marked';
import type { ComponentType } from 'react';
import type { Article, ArticleType } from '@/components/molecules/ArticleCard';
import type { MdxComponents } from '@/components/mdx';

/** An article with its raw body and, for `.mdx`, its compiled component. */
export interface LoadedArticle extends Article {
  body: string;
  /** Compiled MDX module; absent for plain markdown articles. */
  component?: ComponentType<{ components?: MdxComponents }>;
}

// Raw source of every article, used for frontmatter parsing and stats.
const files = import.meta.glob<string>(
  ['../content/articles/*.md', '../content/articles/*.mdx'],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
);

// Pre-compiled React components for `.mdx` articles, keyed by module path.
const mdxComponents = import.meta.glob<ComponentType<{ components?: MdxComponents }>>(
  '../content/articles/*.mdx',
  {
    import: 'default',
    eager: true,
  },
);

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) meta[key] = value;
  }
  return { meta, body: raw.slice(match[0].length) };
}

function slugFromPath(path: string): string {
  const base = path.split('/').pop() ?? path;
  return base.replace(/\.mdx?$/, '');
}

function toArticle(slug: string, raw: string): LoadedArticle {
  const { meta, body } = parseFrontmatter(raw);
  const type: ArticleType = meta.type === 'project' ? 'project' : 'writing';
  return {
    id: slug,
    title: meta.title ?? slug,
    category: meta.category ?? 'NOTES',
    date: meta.date ?? '',
    excerpt:
      meta.excerpt ??
      body
        .trim()
        .split(/\n\s*\n/)[0]
        ?.replace(/<[^>]+>/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() ??
      '',
    href: `/articles/${slug}`,
    link: meta.link || undefined,
    type,
    body,
    component: mdxComponents[`../content/articles/${slug}.mdx`],
  };
}

export const ARTICLES: Article[] = Object.entries(files)
  .map(([path, raw]) => toArticle(slugFromPath(path), raw))
  .sort((a, b) => b.date.localeCompare(a.date));

const BY_SLUG = new Map(ARTICLES.map((a) => [a.id, a as LoadedArticle]));

/**
 * Looks up an article by slug. Returns the compiled MDX component when the
 * source is `.mdx`, otherwise markdown rendered to an HTML string via marked.
 */
export function getArticle(
  slug: string,
):
  | { article: LoadedArticle; html?: string; component?: LoadedArticle['component'] }
  | undefined {
  const article = BY_SLUG.get(slug);
  if (!article) return undefined;
  if (article.component) return { article, component: article.component };
  return {
    article,
    html: marked.parse(article.body, { async: false }),
  };
}
