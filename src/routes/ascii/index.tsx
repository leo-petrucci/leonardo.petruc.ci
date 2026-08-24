import { createFileRoute, Link } from '@tanstack/react-router';
import { Fragment } from 'react';
import { AsciiBox, SettingsDemo } from '@/components/atoms/Ascii/Ascii';
import {
  TimelineBar,
  type TimelineEntry,
} from '@/components/atoms/Ascii/TimelineBar';
import { ArticleCard, type Article } from '@/components/molecules/ArticleCard';

export const Route = createFileRoute('/ascii/')({
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

const ARTICLES: Article[] = [
  {
    id: 'design-systems',
    title: 'Designing a system, not a style',
    category: 'ENGINEERING',
    date: '2026-03-12',
    excerpt:
      'How we split tokens, primitives and recipes at Mojo so the product could grow without the UI fracturing. How we split tokens, primitives and recipes at Mojo so the product could grow without the UI fracturing.',
    href: '#',
    type: 'writing',
  },
  {
    id: 'ascii-ui',
    title: 'Rendering UI from a character grid',
    category: 'EXPERIMENTS',
    date: '2026-02-04',
    excerpt:
      'Every border on this page lands on a whole monospace cell. Here is the measurement trick that makes it honest. Every border on this page lands on a whole monospace cell. Here is the measurement trick that makes it honest.',
    href: '#',
    type: 'project',
  },
  // {
  //   id: 'gamedev-loop',
  //   title: 'A game loop in a weekend',
  //   category: 'GAMES',
  //   date: '2025-11-20',
  //   excerpt:
  //     'Notes from building a tiny roguelike: fixed timestep, an ECS that is just arrays, and why I shipped it anyway. Notes from building a tiny roguelike: fixed timestep, an ECS that is just arrays, and why I shipped it anyway.',
  //   href: '#',
  // },
  // {
  //   id: 'react-perf',
  //   title: 'Profiling React without guessing',
  //   category: 'ENGINEERING',
  //   date: '2025-09-08',
  //   excerpt:
  //     'A repeatable routine for finding the one render that matters, and the three fixes that cover most slow pages. A repeatable routine for finding the one render that matters, and the three fixes that cover most slow pages.',
  //   href: '#',
  // },
];

function RouteComponent() {
  return (
    <div className="flex flex-col gap-2">
      <AsciiBox
        frameColor="var(--border)"
        labelColor="var(--accent)"
        reveal
        fill
      >
        <h1>LEONARDO_PETRUCCI</h1>
        <AsciiBox.Rule />
        <div className="flex flex-row gap-3">
          <div className="shrink-0 border-r border-dashed border-border pr-3">
            <img src="/me-pixel.png" className="w-24 h-24 object-contain" />
          </div>
          <div>
            <p>
              Software developer at Webflow, specialising in building modern web
              applications using Typescript and React. I work in both fullstack
              and frontend development including building design systems.
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
        reveal
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
  );
}
