import { createFileRoute, Link } from '@tanstack/react-router';
import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import { Button } from '@/components/ui/button';
import {
  CenteredGrid,
  CenteredGridItem,
} from '@/components/layout/CenteredGrid';
import { getArticle } from '@/lib/articles';
import { mdxComponents } from '@/components/mdx';
import { AsciiViz } from '@/components/atoms/Ascii/AsciiViz';
import { SiteTitle } from '@/components/atoms/SiteTitle';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { DitherField } from '@/components/organisms/DitherField';

export const Route = createFileRoute('/articles/$slug')({
  component: RouteComponent,
});

function stats(body: string): { words: number; minutes: number } {
  const words = body.split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 200)) };
}

const VIZ_TYPES = ['warp', 'flowfield', 'plasma'] as const;

function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function RouteComponent() {
  const { slug } = Route.useParams();
  const found = getArticle(slug);

  if (!found) {
    return (
      <div className="flex flex-col gap-2">
        <AsciiBox
          frameColor="var(--border)"
          labelColor="var(--destructive)"
          label="404"
          fill
        >
          <h1>ARTICLE_NOT_FOUND</h1>
          <AsciiBox.Rule />
          <p>
            NO_SUCH_ARTICLE:{' '}
            <span className="text-[var(--accent)]">{slug}</span>
          </p>
          <p className="text-ascii-sm text-[var(--muted-foreground)]">
            The path you asked for does not map to any stored document.
          </p>
        </AsciiBox>
        <Link to="/" className="self-start">
          <Button compact>&lt; BACK</Button>
        </Link>
      </div>
    );
  }

  const { article, html, component: ArticleBody } = found;
  const { words, minutes } = stats(article.body);

  const hash = hashString(`${article.title}:${article.body}`);
  const vizType = VIZ_TYPES[hash % VIZ_TYPES.length];
  const seed = hash;

  return (
    <div className="flex flex-col gap-4 sm:gap-8">
      <CenteredGrid variant="wide">
        <CenteredGridItem
          style={{ gridRow: '1' }}
          className="z-10 self-start justify-self-stretch min-w-0"
        >
          <AsciiBox
            frameColor="var(--border)"
            labelColor="var(--accent)"
            reveal
            fill
            className="bg-background"
          >
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <SiteTitle />
              <ThemeToggle />
            </div>
          </AsciiBox>
        </CenteredGridItem>
        <div
          style={{
            gridColumn: '1 / -1',
            gridRow: '1',
          }}
          className="overflow-hidden"
        >
          <AsciiViz
            type={vizType}
            seed={seed}
            color="var(--accent)"
            density={10}
            rows={32}
          />
        </div>
      </CenteredGrid>
      <CenteredGrid>
        <CenteredGridItem className="flex flex-col gap-8 sm:gap-16 min-w-0 w-full">
          <div className="min-w-0">
            <h1 className="text-balance break-words text-2xl sm:text-3xl leading-tight">{article.title}</h1>
            <div className="text-ascii-sm tabular-nums text-[var(--muted-foreground)] break-words">
              {article.date} // {words} WORDS // ~{minutes} MIN READ
            </div>
          </div>
          <article
            className="prose dark:prose-invert max-w-none font-inter text-pretty min-w-0 w-full break-words overflow-visible [&_h2]:text-balance [&_h3]:text-balance [&_p]:text-pretty [&_p]:break-words [&_pre]:overflow-x-auto [&_pre]:max-w-full"
            style={{ overflow: 'visible' }}
          >
            {ArticleBody ? (
              <ArticleBody components={mdxComponents} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: html ?? '' }} />
            )}
          </article>
        </CenteredGridItem>
      </CenteredGrid>
      <footer className="relative overflow-hidden">
        <DitherField
          color="#ffffff"
          className="absolute inset-0 -z-10 h-full w-full opacity-10"
          angle={270}
          noise={0.25}
          speed={0.15}
          pixelSize={3}
        />
        <CenteredGrid>
          <CenteredGridItem className="py-8 text-center text-ascii-sm tabular-nums text-[var(--muted-foreground)]">
            LEONARDO_PETRUCCI // {article.date}
          </CenteredGridItem>
        </CenteredGrid>
      </footer>
    </div>
  );
}
