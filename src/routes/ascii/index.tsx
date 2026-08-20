import { createFileRoute } from '@tanstack/react-router';
import { AsciiBox, SettingsDemo } from '@/components/atoms/Ascii/Ascii';
import {
  TimelineBar,
  type TimelineEntry,
} from '@/components/atoms/Ascii/TimelineBar';

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

function RouteComponent() {
  return (
    <div className="flex flex-col gap-8">
      <AsciiBox
        frameColor="var(--muted)"
        labelColor="var(--chart-1)"
        labelAlign="center"
        reveal
        fill
      >
        <h1>LEONARDO_PETRUCCI</h1>
        <AsciiBox.Rule />
        <div className="flex flex-row gap-4">
          <img src="/me-pixel.png" className="w-24 h-24" />
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
    </div>
  );
}
