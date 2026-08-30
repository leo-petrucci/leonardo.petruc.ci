import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

// Derived from src/routes/index.tsx TIMELINE
// Current job = entry with end === "present"
const CURRENT_JOB = {
  title: 'Senior Frontend Engineer @ Webflow',
  subtitle: 'Working on the Webflow Designer platform, helping with the transition into agentic products.',
  company: 'Webflow',
}

export const Route = createFileRoute('/hero')({
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
      { title: 'Hero — Leonardo Petrucci' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center gap-6 py-8 px-4">
      {/* Helper UI — not part of screenshot */}
      <div className="w-full max-w-[1200px] flex flex-col gap-2 print:hidden">
        <h1 className="font-departure text-sm text-muted-foreground">
          Hero — screenshot the card below (1200×630)
        </h1>
        <ol className="font-departure text-xs text-muted-foreground list-decimal ml-4 flex flex-col gap-1">
          <li>Set browser zoom to 100%</li>
          <li>Right-click the card → Inspect → select the <code className="bg-muted px-1"> #hero-card</code> element</li>
          <li>Use DevTools screenshot: <code className="bg-muted px-1">Capture node screenshot</code> (Chrome) — gives you exact 1200×630 PNG</li>
          <li>Or manually crop: the card has no rounded corners, perfect for OG images</li>
        </ol>
      </div>

      {/* Scroll container for small screens */}
      <div className="w-full overflow-x-auto flex justify-center pb-4">
        <Card
          id="hero-card"
          className="shrink-0 w-[1200px] h-[630px] rounded-none border-border bg-card text-card-foreground overflow-hidden flex flex-row p-0 gap-0 shadow-none"
        >
          {/* Left: content */}
          <div className="flex-1 flex flex-col justify-center px-14 py-10 gap-6">
            {/* Top badge row */}
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[11px]">
                leonardo.petruc.ci
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                {CURRENT_JOB.company} · 2025 — Present
              </Badge>
            </div>

            {/* Name + Title */}
            <div className="flex flex-col gap-3">
              <h1 className="font-departure text-[54px] leading-[0.9] tracking-[-0.04em] font-normal text-foreground">
                Leonardo
                <br />
                <span className="text-accent">Petrucci</span>
              </h1>
              <p className="font-departure text-[18px] leading-[1.4] text-foreground max-w-[560px]">
                {CURRENT_JOB.title}
              </p>
              <p className="font-inter text-[14px] leading-[1.5] text-muted-foreground max-w-[560px]">
                Software developer specialising in modern web applications with TypeScript &amp; React — design systems, fullstack &amp; frontend.
              </p>
            </div>

            <Separator />

            {/* Bottom meta */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="size-2 bg-accent inline-block" aria-hidden />
                <span className="font-departure text-[11px] uppercase tracking-widest text-muted-foreground">
                  Typescript · React · Design Systems
                </span>
              </div>
            </div>
          </div>

          {/* Vertical dashed separator */}
          <Separator orientation="vertical" className="hidden sm:flex" />

          {/* Right: photo */}
          <div className="w-[420px] shrink-0 bg-muted/30 flex flex-col items-center justify-center p-8 gap-6 relative">
            {/* Avatar / photo */}
            <Avatar className="size-[280px] rounded-none border border-border bg-background">
              <AvatarImage
                src="/me-pixel.png"
                alt="Leonardo Petrucci"
                className="object-contain p-2 image-rendering-pixelated"
                style={{ imageRendering: 'pixelated' as const }}
              />
              <AvatarFallback className="rounded-none text-4xl font-departure">
                LP
              </AvatarFallback>
            </Avatar>

            {/* Pixel fallback hint + logo */}
            <div className="flex items-center gap-2">
              <img
                src="/pixelated-webflow.png"
                alt="Webflow"
                className="h-5 w-auto object-contain opacity-80"
              />
              <span className="font-departure text-[11px] uppercase tracking-widest text-muted-foreground">
                Senior Frontend Engineer
              </span>
            </div>

            {/* Subtle corner + marks like ascii-border */}
            <span className="absolute top-2 left-2 font-departure text-[14px] leading-none text-border pointer-events-none">
              +
            </span>
            <span className="absolute top-2 right-2 font-departure text-[14px] leading-none text-border pointer-events-none">
              +
            </span>
            <span className="absolute bottom-2 left-2 font-departure text-[14px] leading-none text-border pointer-events-none">
              +
            </span>
            <span className="absolute bottom-2 right-2 font-departure text-[14px] leading-none text-border pointer-events-none">
              +
            </span>
          </div>
        </Card>
      </div>

      <p className="font-departure text-xs text-muted-foreground print:hidden">
        Tip: add <code className="bg-muted px-1">?plain=1</code> to hide this helper text (just the card remains) — or print to PDF.
      </p>
    </div>
  )
}
