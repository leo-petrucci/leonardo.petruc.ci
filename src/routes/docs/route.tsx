import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import * as React from 'react';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { DOCS, GROUPS } from '@/lib/docs';

export const Route = createFileRoute('/docs')({
  component: DocsLayout,
});

function DocsLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!query.trim()) return DOCS;
    const q = query.toLowerCase();
    return DOCS.filter((d) => d.label.toLowerCase().includes(q) || d.id.includes(q) || d.group.toLowerCase().includes(q));
  }, [query]);

  const filteredGroups = React.useMemo(() => {
    return GROUPS.filter((g) => filtered.some((d) => d.group === g));
  }, [filtered]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-[1400px] px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
                {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
              <Link to="/docs" className="font-mono text-sm font-semibold">
                petruc.ci <span className="text-muted-foreground font-normal">/ docs</span>
              </Link>
              <Badge variant="secondary" className="hidden sm:inline-flex">shadcn + Tailwind v4</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
                ← Home
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] flex">
          {/* desktop sidebar */}
          <aside className="hidden lg:block w-[260px] shrink-0 border-r min-h-[calc(100vh-56px)] sticky top-14 self-start overflow-y-auto h-[calc(100vh-56px)]">
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input placeholder="Search docs..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 pl-7 text-sm" />
              </div>
            </div>
            <nav className="p-4 pt-0 space-y-6">
              {filteredGroups.map((group) => (
                <div key={group}>
                  <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-2 px-2">{group}</div>
                  <div className="space-y-0.5">
                    {filtered
                      .filter((d) => d.group === group)
                      .map((item) => (
                        <Link
                          key={item.id}
                          to={item.id === 'intro' ? '/docs' : '/docs/$slug'}
                          params={item.id === 'intro' ? undefined : ({ slug: item.id } as any)}
                          activeProps={{ className: 'bg-accent text-accent-foreground font-medium' }}
                          className="w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground block"
                          activeOptions={{ exact: true }}
                        >
                          {item.label}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground px-2">No results.</p>}
            </nav>
          </aside>

          {/* mobile drawer */}
          {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMobileOpen(false)}>
              <aside className="w-[280px] bg-background border-r h-full overflow-y-auto p-4 space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 pl-7 text-sm" />
                </div>
                {filteredGroups.map((group) => (
                  <div key={group}>
                    <div className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase mb-2 px-2">{group}</div>
                    <div className="space-y-0.5">
                      {filtered
                        .filter((d) => d.group === group)
                        .map((item) => (
                          <Link
                            key={item.id}
                            to={item.id === 'intro' ? '/docs' : '/docs/$slug'}
                            params={item.id === 'intro' ? undefined : ({ slug: item.id } as any)}
                            onClick={() => setMobileOpen(false)}
                            activeProps={{ className: 'bg-accent text-accent-foreground' }}
                            className="w-full text-left px-2 py-1.5 rounded-md text-sm text-muted-foreground block"
                            activeOptions={{ exact: true }}
                          >
                            {item.label}
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </aside>
            </div>
          )}

          <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-3xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
