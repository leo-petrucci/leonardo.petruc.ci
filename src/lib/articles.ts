import { marked } from 'marked';
import type { Article, ArticleType } from '@/components/molecules/ArticleCard';

export interface LoadedArticle extends Article {
  body: string;
}

const files = import.meta.glob<string>('../content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

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
  return base.replace(/\.md$/, '');
}

function toArticle(slug: string, raw: string): LoadedArticle {
  const { meta, body } = parseFrontmatter(raw);
  const type: ArticleType = meta.type === 'project' ? 'project' : 'writing';
  return {
    id: slug,
    title: meta.title ?? slug,
    category: meta.category ?? 'NOTES',
    date: meta.date ?? '',
    excerpt: meta.excerpt ?? body.split('\n').find((l) => l.trim()) ?? '',
    href: `/ascii/articles/${slug}`,
    type,
    body,
  };
}

export const ARTICLES: Article[] = Object.entries(files)
  .map(([path, raw]) => toArticle(slugFromPath(path), raw))
  .sort((a, b) => b.date.localeCompare(a.date));

const BY_SLUG = new Map(ARTICLES.map((a) => [a.id, a as LoadedArticle]));

export function getArticle(
  slug: string,
): { article: LoadedArticle; html: string } | undefined {
  const article = BY_SLUG.get(slug);
  if (!article) return undefined;
  return {
    article,
    html: marked.parse(article.body, { async: false }),
  };
}
