import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { DOC_COMPONENTS } from '@/components/docs/registry';
import { DOCS, getDoc, getPrevNext } from '@/lib/docs';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/docs/$slug')({
  loader: ({ params }) => {
    if (!DOCS.some((d) => d.id === params.slug) || params.slug === 'intro') {
      throw notFound();
    }
    return { slug: params.slug };
  },
  component: DocPage,
  notFoundComponent: () => (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-sm text-muted-foreground">This doc does not exist.</p>
      <Link to="/docs" className="text-sm underline">
        Back to docs
      </Link>
    </div>
  ),
});

function DocPage() {
  const { slug } = Route.useLoaderData();
  const Comp = DOC_COMPONENTS[slug];
  const doc = getDoc(slug);
  const { prev, next } = getPrevNext(slug);

  if (!Comp || !doc) {
    return <div>Not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-xs text-muted-foreground font-mono">
        <Link to="/docs" className="hover:underline">
          docs
        </Link>{' '}
        / {doc.group.toLowerCase()} / {doc.label.toLowerCase()}
      </div>
      <Comp />
      <Separator />
      <div className="flex justify-between gap-4 pt-2">
        <div>
          {prev ? (
            <Link to={prev.id === 'intro' ? '/docs' : '/docs/$slug'} params={(prev.id === 'intro' ? {} : { slug: prev.id }) as any} className="text-sm hover:underline">
              ← {prev.label}
            </Link>
          ) : (
            <span />
          )}
        </div>
        <div>
          {next ? (
            <Link to="/docs/$slug" params={{ slug: next.id }} className="text-sm hover:underline">
              {next.label} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
