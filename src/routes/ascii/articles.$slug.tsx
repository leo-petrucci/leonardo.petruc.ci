import { createFileRoute, Link } from '@tanstack/react-router';
import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import { CornerButton } from '@/components/atoms/CornerButton';
import {
  CenteredGrid,
  CenteredGridItem,
} from '@/components/layout/CenteredGrid';
import { ARTICLES, getArticle } from '@/lib/articles';

export const Route = createFileRoute('/ascii/articles/$slug')({
  component: RouteComponent,
});

function stats(body: string): { words: number; minutes: number } {
  const words = body.split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 200)) };
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

  return (
    <>
      <CenteredGrid variant="wide">
        <CenteredGridItem>
          <AsciiBox
            frameColor="var(--border)"
            labelColor="var(--accent)"
            reveal
            fill
          >
            <h1>{article.title}</h1>
            <div className="text-ascii-sm text-[var(--muted-foreground)]">
              {article.date} // {words} WORDS // ~{minutes} MIN READ
            </div>
          </AsciiBox>
        </CenteredGridItem>
      </CenteredGrid>
      <CenteredGrid>
        <CenteredGridItem>
          <article
            className="prose dark:prose-invert max-w-none font-inter"
            dangerouslySetInnerHTML={{ __html: html }}
            style={{
              gridColumn: '2',
            }}
          />
        </CenteredGridItem>
      </CenteredGrid>
    </>
  );
}
