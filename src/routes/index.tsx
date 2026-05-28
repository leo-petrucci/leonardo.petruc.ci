import { H1 } from '@/components/ui/typography';
import { WorkCard } from '@/components/molecules/WorkCard';
import { createFileRoute } from '@tanstack/react-router';
import 'maplibre-gl/dist/maplibre-gl.css';
import { InfoItem, InfoMap } from '@/components/atoms/Info';
import { SocialCard } from '@/components/molecules/SocialCard';
import { GithubSocialCard } from '@/components/organisms/GithubSocialCard';
import { JobTimeline, type Job } from '@/components/molecules/JobTimeline';

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const base =
      import.meta.env.MODE === 'development'
        ? 'http://localhost:3000'
        : 'https://leonardo.petruc.ci';
    const response = await fetch(import.meta.env.VITE_GITHUB_FUNCTION_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch contributions');
    }
    const data = await response.json();
    return data as { totalContributions: number };
  },
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
            Software developer at Webflow, specialising in building modern web
            applications using Typescript and React. My experience covers both
            fullstack and frontend development, with a particular focus on
            leveraging robust design systems and utilising MDX to create
            scalable and well-documented user experiences for the web.
          </span>
          <div className="flex flex-row gap-2">
            <InfoItem>October 1994</InfoItem>
            <InfoItem>•</InfoItem>
            <InfoMap />
          </div>
          <hr />
        </div>
        <div className="flex flex-col gap-8">
          <JobTimeline
            jobs={[
              {
                title: 'Senior Frontend Engineer',
                company: 'Webflow',
                companyLogo: '/WebflowLogo.svg',
                startDate: new Date('2025-04-01'),
                endDate: null,
                bgColor: '#E2EDFE',
              },
              {
                title: 'Senior Fullstack Engineer',
                company: 'Mojo Mortgages',
                companyLogo: '/MojoLogo.svg',
                startDate: new Date('2022-09-01'),
                endDate: new Date('2025-04-01'),
                bgColor: '#FEF4EB',
              },
              {
                title: 'Frontend Engineer',
                company: 'Staffscanner',
                companyLogo: '/StaffscannerLogo.svg',
                startDate: new Date('2020-07-01'),
                endDate: new Date('2022-09-01'),
                bgColor: '#E6F6FF',
              },
            ] satisfies Job[]}
          />
          <hr />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <GithubSocialCard />
            <SocialCard
              title="@leonardo-petrucci"
              subTitle="Send me a request!"
              companyName="LinkedIn"
              companyLogo="/LinkedinLogo.png"
              bgColor="#E2EDFE"
              to="https://www.linkedin.com/in/leonardo-petrucci/"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
