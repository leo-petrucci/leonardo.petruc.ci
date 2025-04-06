import { H1 } from '@/components/ui/typography';
import { WorkCard } from '@/components/WorkCard/WorkCard';
import { createFileRoute } from '@tanstack/react-router';
import 'maplibre-gl/dist/maplibre-gl.css';
import { InfoItem, InfoMap } from '@/components/atoms/Info';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div>
      <style>
        {`
        .grid > * {
        aspect-ratio: 1 / 1;
        }
      `}
      </style>
      <div className="flex flex-col pt-[110px] px-4 gap-8">
        <img src="/me.png" className="rounded-2xl w-[132px] h-[132px]" />
        <div className="flex flex-col gap-4">
          <H1 className="font-medium">Leonardo Petrucci</H1>
          <span className="text-muted-foreground text-sm">
            As a software developer at Webflow, I specialize in building modern
            web applications using Typescript and React. My experience covers
            both fullstack and frontend development, with a particular
            enthusiasm for leveraging robust design systems and utilizing MDX to
            create scalable and well-documented user experiences for the web.
          </span>
          <div className="flex flex-row gap-2">
            <InfoItem>October 1994</InfoItem>
            <InfoItem>•</InfoItem>
            <InfoMap />
          </div>
          <hr />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <WorkCard
            title="Senior Frontend Engineer"
            subTitle="April 2025 - Current"
            companyLogo="/WebflowLogo.svg"
            companyName="Webflow"
            bgColor="#E2EDFE"
          />
          <WorkCard
            title="Senior Fullstack Engineer"
            subTitle="September 2022 - April 2025"
            companyLogo="/MojoLogo.svg"
            companyName="Mojo Mortgages"
            bgColor="#feecdc"
          />
          <WorkCard
            title="Frontend Engineer"
            subTitle="July 2020 - September 2022"
            companyLogo="/StaffscannerLogo.svg"
            companyName="Staffscanner"
            bgColor="#B8E6FF"
          />
        </div>
      </div>
    </div>
  );
}
