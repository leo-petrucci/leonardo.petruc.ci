import { createFileRoute, Link } from '@tanstack/react-router';
import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import { CornerButton } from '@/components/atoms/CornerButton';
import {
  CenteredGrid,
  CenteredGridItem,
} from '@/components/layout/CenteredGrid';
import { ARTICLES, getArticle } from '@/lib/articles';
import { AsciiViz } from '@/components/atoms/Ascii/AsciiViz';
import { SiteTitle } from '@/components/atoms/SiteTitle';
import { DitherField } from '@/components/organisms/DitherField';

export const Route = createFileRoute('/ascii/articles/$slug')({
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
        <Link to="/ascii" className="self-start">
          <CornerButton compact>&lt; BACK</CornerButton>
        </Link>
      </div>
    );
  }

  const { article, html } = found;
  const { words, minutes } = stats(article.body);

  const hash = hashString(`${article.title}:${article.body}`);
  const vizType = VIZ_TYPES[hash % VIZ_TYPES.length];
  const seed = hash;

  return (
    <div className="flex flex-col gap-8">
      <CenteredGrid variant="wide">
        <CenteredGridItem
          style={{ gridRow: '1' }}
          className="z-10 self-start justify-self-stretch"
        >
          <AsciiBox
            frameColor="var(--border)"
            labelColor="var(--accent)"
            reveal
            fill
            className="bg-background"
          >
            <SiteTitle />
          </AsciiBox>
        </CenteredGridItem>
        <div
          style={{
            gridColumn: '1 / -1',
            gridRow: '1',
          }}
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
        <CenteredGridItem className="flex flex-col gap-16">
          <div>
            <h1>{article.title}</h1>
            <div className="text-ascii-sm text-[var(--muted-foreground)]">
              {article.date} // {words} WORDS // ~{minutes} MIN READ
            </div>
          </div>
          <article
            className="prose dark:prose-invert max-w-none font-inter"
            dangerouslySetInnerHTML={{ __html: html }}
            style={{
              gridColumn: '2',
            }}
          />
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
          <CenteredGridItem className="py-8 text-center text-ascii-sm text-[var(--muted-foreground)]">
            LEONARDO_PETRUCCI // {article.date}
          </CenteredGridItem>
        </CenteredGrid>
      </footer>
    </div>
  );
}
