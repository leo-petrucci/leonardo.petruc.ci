import { createFileRoute } from '@tanstack/react-router';
import { Fragment } from 'react';
import { AsciiBox } from '@/components/atoms/Ascii/Ascii';
import {
  TimelineBar,
  type TimelineEntry,
} from '@/components/atoms/Ascii/TimelineBar';
import { ArticleCard } from '@/components/molecules/ArticleCard';
import { ARTICLES } from '@/lib/articles';
import {
  CenteredGrid,
  CenteredGridItem,
} from '@/components/layout/CenteredGrid';
import { SiteTitle } from '@/components/atoms/SiteTitle';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

const TIMELINE: TimelineEntry[] = [
  {
    id: 'self-taught',
    title: 'Webmaster',
    subtitle: 'Learning HTML, CSS, JS and building stuff for fun.',
    start: '2008-01-01',
    end: '2014-09-01',
  },
  {
    id: 'university',
    title: 'BSc Interaction Design @ Dundee',
    subtitle:
      'Studying Interaction Design at the University of Dundee, Scotland.',
    start: '2014-09-01',
    end: '2018-08-01',
  },
  {
    id: 'scotland-for-golf',
    title: 'Frontend Developer and Designer @ Scotland for Golf',
    subtitle: 'Building a golf tourism platform for Scotland.',
    start: '2019-04-01',
    end: '2020-07-01',
  },
  {
    id: 'staffscanner',
    title: 'Lead Frontend Engineer @ Staffscanner',
    subtitle:
      'Building a SaaS platform for care staff management and scheduling.',
    start: '2020-07-01',
    end: '2022-09-01',
  },
  {
    id: 'mojo-mortgages',
    title: 'Senior Frontend Engineer @ Mojo Mortgages',
    subtitle:
      'Building a mortgage platform for the UK market. I made their design system!',
    start: '2022-09-01',
    end: '2025-04-01',
  },
  {
    id: 'webflow',
    title: 'Senior Frontend Engineer @ Webflow',
    subtitle:
      'Working on the Webflow Designer platform, helping with the transition into agentic products.',
    start: '2025-04-01',
    end: 'present',
    image: '/pixelated-webflow.png',
  },
];

function RouteComponent() {
  return (
    <CenteredGrid variant="wide">
      <CenteredGridItem asChild>
        <div className="flex flex-col gap-2">
          <AsciiBox
            frameColor="var(--border)"
            labelColor="var(--accent)"
            reveal={{
              speed: 70,
            }}
            fill
          >
            <div className="flex items-center justify-between gap-4">
              <SiteTitle />
              <ThemeToggle />
            </div>
            <AsciiBox.Rule />
            <div className="flex flex-row gap-3">
              <div className="shrink-0 border-r border-dashed border-border pr-3">
                <img src="/me-pixel.png" className="w-24 h-24 object-contain" />
              </div>
              <div>
                <p>
                  Software developer at Webflow, specialising in building modern
                  web applications using Typescript and React. I work in both
                  fullstack and frontend development including building design
                  systems.
                </p>
                <p>I also gamedev as a hobby!</p>
              </div>
            </div>
            <AsciiBox.Rule />
            <TimelineBar entries={TIMELINE} fill />
          </AsciiBox>
          <AsciiBox
            frameColor="var(--border)"
            labelColor="var(--accent)"
            reveal={{
              speed: 70,
            }}
            fill
          >
            {ARTICLES.map((article, i) => (
              <Fragment key={article.id}>
                {i > 0 && <AsciiBox.Rule />}
                <ArticleCard article={article} />
              </Fragment>
            ))}
          </AsciiBox>
        </div>
      </CenteredGridItem>
    </CenteredGrid>
  );
}
