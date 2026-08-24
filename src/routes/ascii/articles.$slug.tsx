import { createFileRoute, Link } from '@tanstack/react-router';
import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import { CornerButton } from '@/components/atoms/CornerButton';
import { getArticle } from '@/lib/articles';

export const Route = createFileRoute('/ascii/articles/$slug')({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const found = getArticle(slug);

  if (!found) {
    return (
      <AsciiBox
        frameColor="var(--border)"
        labelColor="var(--destructive)"
        label="404"
        fill
      >
        <p>NO_SUCH_ARTICLE: {slug}</p>
        <AsciiBox.Rule />
        <Link to="/ascii">
          <CornerButton compact>&lt; BACK</CornerButton>
        </Link>
      </AsciiBox>
    );
  }

  const { article, html } = found;

  return (
    <div className="flex flex-col gap-2">
      <AsciiBox
        frameColor="var(--border)"
        labelColor="var(--accent)"
        reveal
        fill
      >
        <h1>{article.title}</h1>
        <div className="text-ascii-sm text-[var(--muted-foreground)]">
          {article.category} // {article.date}
        </div>
        <AsciiBox.Rule />
        <article
          className="markdown"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </AsciiBox>
      <Link to="/ascii" className="self-start">
        <CornerButton compact>&lt; BACK</CornerButton>
      </Link>
    </div>
  );
}
