import { createFileRoute } from '@tanstack/react-router';
import { AsciiBox, SettingsDemo } from '@/components/atoms/Ascii/Ascii';

export const Route = createFileRoute('/ascii/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <AsciiBox
        frameColor="#3a393b"
        labelColor="var(--chart-1)"
        labelAlign="center"
        reveal
        style={{
          fontSize: 14,
          lineHeight: '24px',
        }}
        fill
      >
        <h1
          style={{
            lineHeight: '48px',
            fontSize: '48px',
          }}
        >
          LEONARDO_PETRUCCI
        </h1>
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
        <p>
          Software developer at Webflow, specialising in building modern web
          applications using Typescript and React. I work in both fullstack and
          frontend development including building design systems.
        </p>
        <AsciiBox.Rule />
        <p>
          Software developer at Webflow, specialising in building modern web
          applications using Typescript and React. I work in both fullstack and
          frontend development including building design systems.
        </p>
      </AsciiBox>
    </div>
  );
}
